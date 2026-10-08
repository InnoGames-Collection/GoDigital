import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { pool, getClient } from '../config/database.js';
import {
  requireAdminAuth,
  requirePermission,
  signAdminToken,
  blacklistToken,
  hasPermission,
  AdminRole,
} from '../middleware/adminRbac.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { AuditLogger } from '../services/auditLogger.js';

// Helper to mask phone numbers according to privacy policies
function maskMsisdn(phone: string): string {
  if (!phone || phone.length < 7) return '******';
  const clean = phone.trim();
  const start = clean.slice(0, 5);
  const end = clean.slice(-3);
  return `${start}****${end}`;
}

export async function adminRoutes(fastify: FastifyInstance) {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. AUTHENTICATION & SESSION MANAGEMENT
  // ──────────────────────────────────────────────────────────────────────────

  // Admin Login with Brute-Force Lockout Defense
  fastify.post('/admin/auth/login', async (req: FastifyRequest, reply: FastifyReply) => {
    const loginSchema = z.object({
      email: z.string().min(3), // Supports username (superadmin) or email address
      password: z.string().min(6),
    });

    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: 'VALIDATION_ERROR',
        details: parsed.error.errors,
      });
    }

    const { email, password } = parsed.data;
    const ip = req.ip || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'Unknown';

    const userRes = await pool.query(
      `SELECT * FROM admin_users WHERE LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($1)`,
      [email]
    );

    const admin = userRes.rows[0];
    if (!admin) {
      return reply.status(401).send({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid administrative email or password.',
      });
    }

    // Check account lockout
    if (admin.locked_until && new Date(admin.locked_until) > new Date()) {
      const waitMinutes = Math.ceil((new Date(admin.locked_until).getTime() - Date.now()) / 60000);
      return reply.status(423).send({
        success: false,
        error: 'ACCOUNT_LOCKED',
        message: `Account is temporarily locked due to excessive failed attempts. Please retry in ${waitMinutes} minutes.`,
      });
    }

    if (!admin.is_active) {
      return reply.status(403).send({
        success: false,
        error: 'ACCOUNT_SUSPENDED',
        message: 'This administrative account has been deactivated.',
      });
    }

    const isValid = verifyPassword(password, admin.password_hash);
    if (!isValid) {
      const attempts = (admin.failed_login_attempts || 0) + 1;
      let lockUpdate = '';
      const params: any[] = [attempts, admin.id];

      if (attempts >= 5) {
        lockUpdate = `, locked_until = NOW() + INTERVAL '15 minutes'`;
      }

      await pool.query(
        `UPDATE admin_users SET failed_login_attempts = $1 ${lockUpdate}, updated_at = NOW() WHERE id = $2`,
        params
      );

      await AuditLogger.log({
        adminId: admin.id,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'ADMIN_LOGIN_FAILED',
        resourceType: 'AUTH',
        reason: `Failed login attempt (${attempts}/5).`,
        ipAddress: ip,
        userAgent,
      });

      return reply.status(401).send({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: `Invalid administrative credentials. Attempt ${attempts} of 5.`,
      });
    }

    // Successful login: reset attempts and record last_login
    await pool.query(
      `UPDATE admin_users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = $1`,
      [admin.id]
    );

    const token = signAdminToken({
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role as AdminRole,
      department: admin.department,
    });

    await AuditLogger.log({
      adminId: admin.id,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'ADMIN_LOGIN_SUCCESS',
      resourceType: 'AUTH',
      reason: 'Administrative session established.',
      ipAddress: ip,
      userAgent,
    });

    return reply.send({
      success: true,
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: admin.role,
        department: admin.department,
        lastLogin: admin.last_login_at || new Date().toISOString(),
      },
    });
  });

  // Admin Logout with Valkey Blacklist
  fastify.post('/admin/auth/logout', { preHandler: [requireAdminAuth] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const user = req.adminUser!;
    if (user.jti) {
      await blacklistToken(user.jti, 7200);
    }

    await AuditLogger.log({
      adminId: user.adminId,
      adminEmail: user.email,
      adminRole: user.role,
      action: 'ADMIN_LOGOUT',
      resourceType: 'AUTH',
      reason: 'Administrative session ended and token blacklisted.',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    return reply.send({ success: true, message: 'Logged out successfully.' });
  });

  // Current Admin Profile & Available Switcher Identities (for Console Multi-Role Preview)
  fastify.get('/admin/auth/me', { preHandler: [requireAdminAuth] }, async (req: FastifyRequest) => {
    const user = req.adminUser!;

    const adminsRes = await pool.query(
      `SELECT id, email, name, role, department, is_active, last_login_at, created_at 
       FROM admin_users 
       ORDER BY role, name`
    );

    return {
      currentAdmin: {
        id: user.adminId,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
      },
      availableAdmins: adminsRes.rows.map(r => ({
        id: r.id,
        email: r.email,
        name: r.name,
        role: r.role,
        department: r.department,
        active: r.is_active,
        lastLogin: r.last_login_at,
        createdAt: r.created_at,
      })),
    };
  });

  // Role Switcher for Staging/Console Testing
  fastify.post('/admin/auth/switch', { preHandler: [requireAdminAuth] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { targetAdminId } = (req.body || {}) as { targetAdminId: string };
    if (!targetAdminId) {
      return reply.status(400).send({ error: 'Missing targetAdminId' });
    }

    const targetRes = await pool.query(`SELECT * FROM admin_users WHERE id = $1`, [targetAdminId]);
    const target = targetRes.rows[0];
    if (!target) {
      return reply.status(404).send({ error: 'Target admin user not found' });
    }

    const token = signAdminToken({
      adminId: target.id,
      email: target.email,
      name: target.name,
      role: target.role as AdminRole,
      department: target.department,
    });

    return reply.send({
      success: true,
      token,
      currentAdmin: {
        id: target.id,
        email: target.email,
        name: target.name,
        role: target.role,
        department: target.department,
      },
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. LIVE DASHBOARD & TELECOMMUNICATIONS REVENUE RECONCILIATION
  // ──────────────────────────────────────────────────────────────────────────

  fastify.get('/admin/dashboard', { preHandler: [requireAdminAuth] }, async () => {
    // Zero-mock live parallel queries against PostgreSQL
    const [
      subRes,
      playerRes,
      tournRes,
      fraudRes,
      revenueRes,
      todayRevRes,
      puzzleStatsRes,
      todayChallengeRes,
      recentLogsRes,
    ] = await Promise.all([
      // Active subscriptions count
      pool.query(`SELECT COUNT(*)::int as count FROM subscriptions WHERE is_active = TRUE OR status = 'ACTIVE'`),
      // Total registered players
      pool.query(`SELECT COUNT(*)::int as count FROM profiles`),
      // Active tournaments
      pool.query(`SELECT COUNT(*)::int as count FROM tournaments WHERE status = 'ACTIVE'`),
      // Anti-cheat fraud incidents caught
      pool.query(`SELECT COUNT(*)::int as count FROM game_sessions WHERE fraud_flag = TRUE`),
      // Total Telebirr settled revenue
      pool.query(`SELECT COALESCE(SUM(amount_etb), 0)::numeric as total FROM payment_orders WHERE status = 'SUCCESS'`),
      // Today's Telebirr settled revenue
      pool.query(`SELECT COALESCE(SUM(amount_etb), 0)::numeric as today FROM payment_orders WHERE status = 'SUCCESS' AND created_at >= CURRENT_DATE`),
      // Total puzzles configured
      pool.query(`SELECT COUNT(*)::int as count, COUNT(DISTINCT game_id)::int as games FROM puzzle_levels WHERE status = 'ACTIVE'`),
      // Today's scheduled daily challenge
      pool.query(`SELECT * FROM daily_challenges WHERE challenge_date = CURRENT_DATE LIMIT 1`),
      // Recent audit log activity
      pool.query(`SELECT * FROM admin_audit_logs ORDER BY created_at DESC LIMIT 5`),
    ]);

    const activeSubscribers = subRes.rows[0]?.count || 0;
    const totalPlayers = playerRes.rows[0]?.count || 0;
    const activeTournaments = tournRes.rows[0]?.count || 0;
    const fraudIncidentsBlocked = fraudRes.rows[0]?.count || 0;
    const totalRevenueBirr = parseFloat(revenueRes.rows[0]?.total || '0');
    const todayRevenueBirr = parseFloat(todayRevRes.rows[0]?.today || '0');
    const totalPuzzles = puzzleStatsRes.rows[0]?.count || 0;
    const activePuzzleGames = puzzleStatsRes.rows[0]?.games || 0;

    return {
      kpis: {
        activeSubscribers,
        totalPlayers,
        activeTournaments,
        fraudIncidentsBlocked,
        totalRevenueBirr,
        todayRevenueBirr,
        totalPuzzles,
        activePuzzleGames,
        retentionRatePercent: totalPlayers > 0 ? Math.min(100, Math.round((activeSubscribers / totalPlayers) * 100)) : 0,
      },
      todayChallenge: todayChallengeRes.rows[0] || null,
      recentAuditLogs: recentLogsRes.rows,
      systemMode: 'PRODUCTION',
      lastRefreshedAt: new Date().toISOString(),
    };
  });

  // Level Progression Curve & Drop-Off Analytics
  fastify.get('/admin/analytics/levels', { preHandler: [requirePermission('analytics:read')] }, async (req: FastifyRequest) => {
    const { gameId } = req.query as { gameId?: string };
    const queryParams: any[] = [];
    let whereClause = '';

    if (gameId) {
      whereClause = 'WHERE p.game_id = $1';
      queryParams.push(gameId);
    }

    const res = await pool.query(
      `SELECT 
        p.id,
        p.game_id,
        p.level_number,
        p.title,
        p.difficulty,
        p.par_time_seconds,
        p.hint_cost_coins,
        COALESCE(a.attempts_count, 0) as attempts,
        COALESCE(a.completions_count, 0) as completions,
        COALESCE(a.avg_duration_seconds, 0) as avg_duration,
        COALESCE(a.drop_off_rate, 0) as drop_off_rate,
        COALESCE(a.hints_used_count, 0) as hints_used
       FROM puzzle_levels p
       LEFT JOIN puzzle_level_analytics a ON p.game_id = a.game_id AND p.level_number = a.level_number
       ${whereClause}
       ORDER BY p.game_id, p.level_number ASC`,
      queryParams
    );

    return { levels: res.rows };
  });

  // Telebirr C2B Revenue Reconciliation
  fastify.get('/admin/analytics/revenue', { preHandler: [requirePermission('analytics:read')] }, async () => {
    const breakdown = await pool.query(
      `SELECT 
        item_type,
        COUNT(*)::int as count,
        COALESCE(SUM(amount_etb), 0)::numeric as total_amount_etb
       FROM payment_orders
       WHERE status = 'SUCCESS'
       GROUP BY item_type
       ORDER BY total_amount_etb DESC`
    );

    const recentOrders = await pool.query(
      `SELECT id, user_id, amount_etb, item_type, item_title, status, msisdn_masked, created_at, paid_at
       FROM payment_orders
       ORDER BY created_at DESC
       LIMIT 20`
    );

    return {
      summary: breakdown.rows,
      recentOrders: recentOrders.rows,
    };
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. PUZZLE CATALOG & LEVEL PROGRESSION CURVES
  // ──────────────────────────────────────────────────────────────────────────

  // Server-Side Paginated Puzzle Levels
  fastify.get('/admin/puzzles', { preHandler: [requirePermission('puzzles:read')] }, async (req: FastifyRequest) => {
    const querySchema = z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      gameId: z.string().optional(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
      status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
      search: z.string().optional(),
      sortBy: z.enum(['level_number', 'title', 'difficulty', 'updated_at']).default('level_number'),
      sortDir: z.enum(['asc', 'desc']).default('asc'),
    });

    const parsed = querySchema.parse(req.query);
    const { page, pageSize, gameId, difficulty, status, search, sortBy, sortDir } = parsed;
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (gameId) {
      conditions.push(`game_id = $${idx++}`);
      values.push(gameId);
    }
    if (difficulty) {
      conditions.push(`difficulty = $${idx++}`);
      values.push(difficulty);
    }
    if (status) {
      conditions.push(`status = $${idx++}`);
      values.push(status);
    }
    if (search) {
      conditions.push(`(title ILIKE $${idx} OR game_id ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM puzzle_levels ${whereClause}`, values);
    const total = countRes.rows[0]?.total || 0;

    const dataRes = await pool.query(
      `SELECT * FROM puzzle_levels ${whereClause} ORDER BY ${sortBy} ${sortDir.toUpperCase()} LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, pageSize, offset]
    );

    return {
      items: dataRes.rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  });

  // Create Puzzle Level (Content Creator / Super Admin)
  fastify.post('/admin/puzzles', { preHandler: [requirePermission('puzzles:create')] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const puzzleSchema = z.object({
      game_id: z.string().min(1),
      level_number: z.number().int().min(1),
      title: z.string().min(2),
      category: z.string().default('puzzle'),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).default('MEDIUM'),
      puzzle_data: z.record(z.any()),
      solution_data: z.record(z.any()).optional(),
      min_moves: z.number().int().min(1).default(5),
      par_time_seconds: z.number().int().min(10).default(60),
      hint_cost_coins: z.number().int().min(0).default(10),
      stars_to_unlock: z.number().int().min(0).default(0),
      status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('ACTIVE'),
    });

    const parsed = puzzleSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.errors });
    }

    const d = parsed.data;
    const admin = req.adminUser!;

    try {
      const res = await pool.query(
        `INSERT INTO puzzle_levels (
          game_id, level_number, title, category, difficulty,
          puzzle_data, solution_data, min_moves, par_time_seconds,
          hint_cost_coins, stars_to_unlock, status, created_by, updated_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
        RETURNING *`,
        [
          d.game_id,
          d.level_number,
          d.title,
          d.category,
          d.difficulty,
          JSON.stringify(d.puzzle_data),
          d.solution_data ? JSON.stringify(d.solution_data) : null,
          d.min_moves,
          d.par_time_seconds,
          d.hint_cost_coins,
          d.stars_to_unlock,
          d.status,
          admin.adminId,
        ]
      );

      const created = res.rows[0];

      await AuditLogger.log({
        adminId: admin.adminId,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'PUZZLE_LEVEL_CREATED',
        resourceType: 'PUZZLE_LEVEL',
        resourceId: created.id,
        newState: created,
        reason: `Created level ${d.level_number} for game '${d.game_id}'.`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      });

      return reply.status(201).send({ success: true, puzzle: created });
    } catch (err: any) {
      if (err.code === '23505') {
        return reply.status(409).send({
          success: false,
          error: 'CONFLICT',
          message: `Level ${d.level_number} for game '${d.game_id}' already exists.`,
        });
      }
      throw err;
    }
  });

  // Update Puzzle Level & Difficulty Tuning (Content Creator / Super Admin)
  fastify.put('/admin/puzzles/:id', { preHandler: [requirePermission('puzzles:update')] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };

    const updateSchema = z.object({
      title: z.string().optional(),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
      puzzle_data: z.record(z.any()).optional(),
      solution_data: z.record(z.any()).optional(),
      min_moves: z.number().int().min(1).optional(),
      par_time_seconds: z.number().int().min(10).optional(),
      hint_cost_coins: z.number().int().min(0).optional(),
      stars_to_unlock: z.number().int().min(0).optional(),
      status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.errors });
    }

    const d = parsed.data;
    const admin = req.adminUser!;

    const prevRes = await pool.query(`SELECT * FROM puzzle_levels WHERE id = $1`, [id]);
    const previous = prevRes.rows[0];
    if (!previous) {
      return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Puzzle level not found.' });
    }

    const updatedRes = await pool.query(
      `UPDATE puzzle_levels
       SET 
         title = COALESCE($1, title),
         difficulty = COALESCE($2, difficulty),
         puzzle_data = CASE WHEN $3::jsonb IS NOT NULL THEN $3::jsonb ELSE puzzle_data END,
         solution_data = CASE WHEN $4::jsonb IS NOT NULL THEN $4::jsonb ELSE solution_data END,
         min_moves = COALESCE($5, min_moves),
         par_time_seconds = COALESCE($6, par_time_seconds),
         hint_cost_coins = COALESCE($7, hint_cost_coins),
         stars_to_unlock = COALESCE($8, stars_to_unlock),
         status = COALESCE($9, status),
         version = version + 1,
         updated_by = $10,
         updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        d.title,
        d.difficulty,
        d.puzzle_data ? JSON.stringify(d.puzzle_data) : null,
        d.solution_data ? JSON.stringify(d.solution_data) : null,
        d.min_moves,
        d.par_time_seconds,
        d.hint_cost_coins,
        d.stars_to_unlock,
        d.status,
        admin.adminId,
        id,
      ]
    );

    const updated = updatedRes.rows[0];

    await AuditLogger.log({
      adminId: admin.adminId,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'PUZZLE_LEVEL_UPDATED',
      resourceType: 'PUZZLE_LEVEL',
      resourceId: id,
      previousState: previous,
      newState: updated,
      reason: `Updated level ${updated.level_number} parameters for game '${updated.game_id}'.`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    return reply.send({ success: true, puzzle: updated });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. TRANSACTIONAL BULK PUZZLE IMPORT WITH ZOD VALIDATION
  // ──────────────────────────────────────────────────────────────────────────

  fastify.post('/admin/puzzles/bulk-import', { preHandler: [requirePermission('puzzles:bulk_import')] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const itemSchema = z.object({
      game_id: z.string().min(1),
      level_number: z.number().int().min(1),
      title: z.string().min(1),
      category: z.string().default('puzzle'),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).default('MEDIUM'),
      puzzle_data: z.record(z.any()),
      solution_data: z.record(z.any()).optional(),
      min_moves: z.number().int().min(1).default(5),
      par_time_seconds: z.number().int().min(10).default(60),
      hint_cost_coins: z.number().int().min(0).default(10),
      stars_to_unlock: z.number().int().min(0).default(0),
      status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).default('ACTIVE'),
    });

    const bulkSchema = z.object({
      levels: z.array(itemSchema).min(1).max(500),
      overwriteExisting: z.boolean().default(true),
    });

    const parsed = bulkSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({
        success: false,
        error: 'SCHEMA_VALIDATION_ERROR',
        details: parsed.error.errors,
      });
    }

    const { levels, overwriteExisting } = parsed.data;
    const admin = req.adminUser!;
    const client = await getClient();

    try {
      await client.query('BEGIN');

      let insertedCount = 0;
      let updatedCount = 0;

      for (const lvl of levels) {
        if (overwriteExisting) {
          const res = await client.query(
            `INSERT INTO puzzle_levels (
              game_id, level_number, title, category, difficulty,
              puzzle_data, solution_data, min_moves, par_time_seconds,
              hint_cost_coins, stars_to_unlock, status, created_by, updated_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
            ON CONFLICT (game_id, level_number) DO UPDATE SET
              title = EXCLUDED.title,
              category = EXCLUDED.category,
              difficulty = EXCLUDED.difficulty,
              puzzle_data = EXCLUDED.puzzle_data,
              solution_data = EXCLUDED.solution_data,
              min_moves = EXCLUDED.min_moves,
              par_time_seconds = EXCLUDED.par_time_seconds,
              hint_cost_coins = EXCLUDED.hint_cost_coins,
              stars_to_unlock = EXCLUDED.stars_to_unlock,
              status = EXCLUDED.status,
              version = puzzle_levels.version + 1,
              updated_by = EXCLUDED.updated_by,
              updated_at = NOW()
            RETURNING (xmax = 0) AS was_inserted`,
            [
              lvl.game_id,
              lvl.level_number,
              lvl.title,
              lvl.category,
              lvl.difficulty,
              JSON.stringify(lvl.puzzle_data),
              lvl.solution_data ? JSON.stringify(lvl.solution_data) : null,
              lvl.min_moves,
              lvl.par_time_seconds,
              lvl.hint_cost_coins,
              lvl.stars_to_unlock,
              lvl.status,
              admin.adminId,
            ]
          );

          if (res.rows[0]?.was_inserted) {
            insertedCount++;
          } else {
            updatedCount++;
          }
        } else {
          await client.query(
            `INSERT INTO puzzle_levels (
              game_id, level_number, title, category, difficulty,
              puzzle_data, solution_data, min_moves, par_time_seconds,
              hint_cost_coins, stars_to_unlock, status, created_by, updated_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $13)
            ON CONFLICT (game_id, level_number) DO NOTHING`,
            [
              lvl.game_id,
              lvl.level_number,
              lvl.title,
              lvl.category,
              lvl.difficulty,
              JSON.stringify(lvl.puzzle_data),
              lvl.solution_data ? JSON.stringify(lvl.solution_data) : null,
              lvl.min_moves,
              lvl.par_time_seconds,
              lvl.hint_cost_coins,
              lvl.stars_to_unlock,
              lvl.status,
              admin.adminId,
            ]
          );
          insertedCount++;
        }
      }

      await AuditLogger.log({
        adminId: admin.adminId,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'PUZZLE_BULK_IMPORTED',
        resourceType: 'PUZZLE_LEVELS',
        newState: { count: levels.length, inserted: insertedCount, updated: updatedCount },
        reason: `Bulk imported ${levels.length} puzzle levels across games with atomic transaction.`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
        client,
      });

      await client.query('COMMIT');

      return reply.send({
        success: true,
        message: `Successfully processed ${levels.length} puzzle levels.`,
        summary: {
          totalReceived: levels.length,
          inserted: insertedCount,
          updated: updatedCount,
        },
      });
    } catch (err: any) {
      await client.query('ROLLBACK');
      req.log.error(err, '[Bulk Import Error] Rolling back puzzle transaction.');
      return reply.status(500).send({
        success: false,
        error: 'IMPORT_FAILED',
        message: 'Transaction rolled back due to error.',
        detail: err.message,
      });
    } finally {
      client.release();
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. DAILY BRAIN TRAINING CHALLENGES CALENDAR
  // ──────────────────────────────────────────────────────────────────────────

  fastify.get('/admin/daily-challenges', { preHandler: [requirePermission('daily_challenges:read')] }, async (req: FastifyRequest) => {
    const { month } = req.query as { month?: string };
    let query = `SELECT * FROM daily_challenges ORDER BY challenge_date ASC LIMIT 60`;

    if (month) {
      query = `SELECT * FROM daily_challenges WHERE TO_CHAR(challenge_date, 'YYYY-MM') = $1 ORDER BY challenge_date ASC`;
      const res = await pool.query(query, [month]);
      return { challenges: res.rows };
    }

    const res = await pool.query(query);
    return { challenges: res.rows };
  });

  fastify.post('/admin/daily-challenges', { preHandler: [requirePermission('daily_challenges:manage')] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const challengeSchema = z.object({
      challenge_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      game_id: z.string().min(1),
      title: z.string().min(2),
      difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).default('MEDIUM'),
      bonus_coins: z.number().int().min(0).default(25),
      target_score: z.number().int().min(100).default(1000),
      time_limit_seconds: z.number().int().min(30).default(120),
      status: z.enum(['SCHEDULED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).default('SCHEDULED'),
    });

    const parsed = challengeSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.errors });
    }

    const d = parsed.data;
    const admin = req.adminUser!;

    try {
      const res = await pool.query(
        `INSERT INTO daily_challenges (
          challenge_date, game_id, title, difficulty, bonus_coins, target_score, time_limit_seconds, status, created_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *`,
        [d.challenge_date, d.game_id, d.title, d.difficulty, d.bonus_coins, d.target_score, d.time_limit_seconds, d.status, admin.adminId]
      );

      const challenge = res.rows[0];

      await AuditLogger.log({
        adminId: admin.adminId,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'DAILY_CHALLENGE_SCHEDULED',
        resourceType: 'DAILY_CHALLENGE',
        resourceId: challenge.id,
        newState: challenge,
        reason: `Scheduled daily challenge for date ${d.challenge_date}.`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      });

      return reply.status(201).send({ success: true, challenge });
    } catch (err: any) {
      if (err.code === '23505') {
        return reply.status(409).send({
          success: false,
          error: 'CONFLICT',
          message: `Daily challenge for date ${d.challenge_date} already exists.`,
        });
      }
      throw err;
    }
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 6. PLAYER MANAGEMENT & ZERO-TRUST PII PROTECTION
  // ──────────────────────────────────────────────────────────────────────────

  // Server-Side Paginated Players with Default Masked MSISDNs
  fastify.get('/admin/players', { preHandler: [requirePermission('players:read')] }, async (req: FastifyRequest) => {
    const querySchema = z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      search: z.string().optional(),
    });

    const parsed = querySchema.parse(req.query);
    const { page, pageSize, search } = parsed;
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (search) {
      conditions.push(`(phone ILIKE $${idx} OR display_name ILIKE $${idx})`);
      values.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM profiles ${whereClause}`, values);
    const total = countRes.rows[0]?.total || 0;

    const dataRes = await pool.query(
      `SELECT 
        id, 
        phone, 
        display_name, 
        coins, 
        xp, 
        level, 
        energy, 
        matches_played, 
        trophies_count, 
        created_at, 
        updated_at
       FROM profiles 
       ${whereClause} 
       ORDER BY created_at DESC 
       LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, pageSize, offset]
    );

    // Mask phone numbers by default!
    const players = dataRes.rows.map(p => ({
      ...p,
      full_phone: undefined, // ensure omitted from normal view
      masked_phone: maskMsisdn(p.phone),
      phone: maskMsisdn(p.phone), // override phone field with mask
    }));

    return {
      items: players,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  });

  // Zero-Trust Explicit PII Unmasking (Audited & Restricted)
  fastify.post('/admin/players/:id/unmask', { preHandler: [requirePermission('players:unmask_pii')] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const unmaskSchema = z.object({
      reason: z.string().min(5, 'A specific justification reason of at least 5 characters is mandatory for PII unmasking.'),
    });

    const parsed = unmaskSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.errors });
    }

    const { reason } = parsed.data;
    const admin = req.adminUser!;

    const playerRes = await pool.query(`SELECT id, phone, display_name FROM profiles WHERE id = $1`, [id]);
    const player = playerRes.rows[0];
    if (!player) {
      return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Player not found.' });
    }

    // Record immutable audit entry of PII lookup
    await AuditLogger.log({
      adminId: admin.adminId,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'PII_PLAYER_MSISDN_UNMASKED',
      resourceType: 'PROFILE_PII',
      resourceId: id,
      reason,
      newState: { masked: maskMsisdn(player.phone) },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    return reply.send({
      success: true,
      playerId: id,
      displayName: player.display_name,
      unmaskedPhone: player.phone,
      maskedPhone: maskMsisdn(player.phone),
      auditedAt: new Date().toISOString(),
    });
  });

  // Manual Coin & Balance Adjustment (Operations Manager / Super Admin Only)
  fastify.post('/admin/players/:id/adjust-balance', { preHandler: [requirePermission('players:adjust_balance')] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const adjustSchema = z.object({
      deltaCoins: z.number().int().refine(val => val !== 0, 'Adjustment amount must be non-zero.'),
      reason: z.string().min(5, 'Mandatory audit explanation required.'),
    });

    const parsed = adjustSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.errors });
    }

    const { deltaCoins, reason } = parsed.data;
    const admin = req.adminUser!;

    const prevRes = await pool.query(`SELECT id, phone, coins FROM profiles WHERE id = $1`, [id]);
    const prev = prevRes.rows[0];
    if (!prev) {
      return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Player not found.' });
    }

    // Atomic update
    const updateRes = await pool.query(
      `UPDATE profiles
       SET coins = GREATEST(0, coins + $1), updated_at = NOW()
       WHERE id = $2
       RETURNING id, coins`,
      [deltaCoins, id]
    );

    const updated = updateRes.rows[0];

    await AuditLogger.log({
      adminId: admin.adminId,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'PLAYER_BALANCE_ADJUSTED',
      resourceType: 'PROFILE_WALLET',
      resourceId: id,
      previousState: { coins: prev.coins },
      newState: { coins: updated.coins, deltaCoins },
      reason,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    return reply.send({
      success: true,
      previousCoins: prev.coins,
      newCoins: updated.coins,
      delta: deltaCoins,
      reason,
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. IMMUTABLE AUDIT LOGS INSPECTION
  // ──────────────────────────────────────────────────────────────────────────

  fastify.get('/admin/audit-logs', { preHandler: [requirePermission('audit_logs:read')] }, async (req: FastifyRequest) => {
    const querySchema = z.object({
      page: z.coerce.number().min(1).default(1),
      pageSize: z.coerce.number().min(1).max(100).default(20),
      action: z.string().optional(),
      adminEmail: z.string().optional(),
      resourceType: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    });

    const parsed = querySchema.parse(req.query);
    const { page, pageSize, action, adminEmail, resourceType, startDate, endDate } = parsed;
    const offset = (page - 1) * pageSize;

    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (action) {
      conditions.push(`action = $${idx++}`);
      values.push(action);
    }
    if (adminEmail) {
      conditions.push(`admin_email ILIKE $${idx++}`);
      values.push(`%${adminEmail}%`);
    }
    if (resourceType) {
      conditions.push(`resource_type = $${idx++}`);
      values.push(resourceType);
    }
    if (startDate) {
      conditions.push(`created_at >= $${idx++}`);
      values.push(startDate);
    }
    if (endDate) {
      conditions.push(`created_at <= $${idx++}`);
      values.push(endDate);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRes = await pool.query(`SELECT COUNT(*)::int as total FROM admin_audit_logs ${whereClause}`, values);
    const total = countRes.rows[0]?.total || 0;

    const dataRes = await pool.query(
      `SELECT * FROM admin_audit_logs ${whereClause} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
      [...values, pageSize, offset]
    );

    return {
      items: dataRes.rows,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 8. ADMIN USERS & RBAC MANAGEMENT (SUPER_ADMIN ONLY)
  // ──────────────────────────────────────────────────────────────────────────

  fastify.get('/admin/users', { preHandler: [requirePermission('admin_users:manage')] }, async () => {
    const res = await pool.query(
      `SELECT id, email, name, role, department, is_active, failed_login_attempts, locked_until, last_login_at, created_at
       FROM admin_users
       ORDER BY role, name`
    );
    return { users: res.rows };
  });

  fastify.post('/admin/users', { preHandler: [requirePermission('admin_users:manage')] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const userSchema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
      role: z.enum(['SUPER_ADMIN', 'CONTENT_CREATOR', 'OPERATIONS_MANAGER', 'AUDITOR']),
      department: z.string().default('Operations'),
    });

    const parsed = userSchema.safeParse(req.body);
    if (!parsed.success) {
      return reply.status(400).send({ success: false, error: 'VALIDATION_ERROR', details: parsed.error.errors });
    }

    const { email, password, name, role, department } = parsed.data;
    const admin = req.adminUser!;
    const hash = hashPassword(password);

    try {
      const res = await pool.query(
        `INSERT INTO admin_users (email, password_hash, name, role, department)
         VALUES (LOWER($1), $2, $3, $4, $5)
         RETURNING id, email, name, role, department, is_active, created_at`,
        [email, hash, name, role, department]
      );

      const created = res.rows[0];

      await AuditLogger.log({
        adminId: admin.adminId,
        adminEmail: admin.email,
        adminRole: admin.role,
        action: 'ADMIN_USER_CREATED',
        resourceType: 'ADMIN_USER',
        resourceId: created.id,
        newState: created,
        reason: `Created new admin account with role '${role}'.`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'] as string,
      });

      return reply.status(201).send({ success: true, user: created });
    } catch (err: any) {
      if (err.code === '23505') {
        return reply.status(409).send({ success: false, error: 'CONFLICT', message: 'Email already registered.' });
      }
      throw err;
    }
  });

  fastify.put('/admin/users/:id/status', { preHandler: [requirePermission('admin_users:manage')] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const { isActive, unlockAccount } = (req.body || {}) as { isActive?: boolean; unlockAccount?: boolean };
    const admin = req.adminUser!;

    const prevRes = await pool.query(`SELECT id, email, role, is_active, locked_until FROM admin_users WHERE id = $1`, [id]);
    const prev = prevRes.rows[0];
    if (!prev) {
      return reply.status(404).send({ success: false, error: 'NOT_FOUND', message: 'Admin user not found.' });
    }

    let updates: string[] = [];
    let values: any[] = [];
    let idx = 1;

    if (isActive !== undefined) {
      updates.push(`is_active = $${idx++}`);
      values.push(isActive);
    }
    if (unlockAccount) {
      updates.push(`failed_login_attempts = 0`);
      updates.push(`locked_until = NULL`);
    }

    if (updates.length === 0) {
      return reply.send({ success: true, message: 'No updates requested.' });
    }

    values.push(id);
    const updateRes = await pool.query(
      `UPDATE admin_users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING id, email, is_active, locked_until`,
      values
    );

    const updated = updateRes.rows[0];

    await AuditLogger.log({
      adminId: admin.adminId,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'ADMIN_USER_STATUS_UPDATED',
      resourceType: 'ADMIN_USER',
      resourceId: id,
      previousState: prev,
      newState: updated,
      reason: `Updated status for admin '${prev.email}'.`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    return reply.send({ success: true, user: updated });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 9. TOURNAMENTS & GAME CONTROLLERS (MIGRATED & AUDITED)
  // ──────────────────────────────────────────────────────────────────────────

  fastify.get('/admin/games', { preHandler: [requireAdminAuth] }, async () => {
    const gamesRes = await pool.query(`SELECT * FROM games ORDER BY category, title`);
    return gamesRes.rows;
  });

  fastify.post('/admin/games/:id/toggle', { preHandler: [requirePermission('puzzles:update')] }, async (req: FastifyRequest, reply: FastifyReply) => {
    const { id } = req.params as { id: string };
    const admin = req.adminUser!;

    const res = await pool.query(
      `UPDATE games SET is_enabled = NOT is_enabled WHERE game_id = $1 RETURNING game_id, title, is_enabled`,
      [id]
    );

    if (res.rowCount === 0) {
      return reply.status(404).send({ success: false, error: 'Game not found' });
    }

    const updated = res.rows[0];

    await AuditLogger.log({
      adminId: admin.adminId,
      adminEmail: admin.email,
      adminRole: admin.role,
      action: 'GAME_STATUS_TOGGLED',
      resourceType: 'GAME',
      resourceId: id,
      newState: updated,
      reason: `Toggled game enabled state to ${updated.is_enabled}.`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string,
    });

    return reply.send({ success: true, game: updated });
  });

  fastify.get('/admin/tournaments', { preHandler: [requirePermission('tournaments:read')] }, async () => {
    const res = await pool.query(`SELECT * FROM tournaments ORDER BY start_date DESC`);
    return { tournaments: res.rows };
  });

  fastify.get('/admin/subscribers', { preHandler: [requirePermission('players:read')] }, async (req: FastifyRequest) => {
    const page = Math.max(1, parseInt((req.query as any)?.page || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt((req.query as any)?.pageSize || '20', 10)));
    const offset = (page - 1) * pageSize;

    const [countRes, subsRes] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int as total FROM subscriptions`),
      pool.query(
        `SELECT s.*, p.masked_msisdn 
         FROM subscriptions s 
         LEFT JOIN players p ON s.msisdn = p.msisdn 
         ORDER BY s.last_billed_at DESC 
         LIMIT $1 OFFSET $2`,
        [pageSize, offset]
      ),
    ]);

    return {
      items: subsRes.rows.map(r => ({
        ...r,
        msisdn: maskMsisdn(r.msisdn),
      })),
      pagination: {
        page,
        pageSize,
        total: countRes.rows[0]?.total || 0,
        totalPages: Math.ceil((countRes.rows[0]?.total || 0) / pageSize),
      },
    };
  });
}
