import { FastifyInstance } from 'fastify';
import { pool, query } from '../config/database.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { walletService } from '../services/walletService.js';
import { GameAntiCheat } from '../services/gameAntiCheat.js';

export async function tournamentRoutes(fastify: FastifyInstance) {
  // Get active tournaments (root or /active)
  const getTournamentsHandler = async () => {
    const tournsRes = await pool.query(
      `SELECT t.*, g.title as game_title, g.category as game_category
       FROM tournaments t
       JOIN games g ON t.game_id = g.game_id
       WHERE t.status = 'ACTIVE'
       ORDER BY t.start_date DESC`
    );

    const tournaments = [];
    for (const tourn of tournsRes.rows) {
      const lbRes = await pool.query(
        `SELECT ROW_NUMBER() OVER (ORDER BY score DESC, submitted_at ASC) as rank, 
                player_msisdn, masked_msisdn, score, prize_etb, submitted_at 
         FROM tournament_entries 
         WHERE tournament_id = $1 
         ORDER BY score DESC, submitted_at ASC 
         LIMIT 10`,
        [tourn.id]
      );
      const countRes = await pool.query(
        `SELECT COUNT(*) as count FROM tournament_entries WHERE tournament_id = $1`,
        [tourn.id]
      );
      tournaments.push({
        ...tourn,
        leaderboard: lbRes.rows.map((row) => ({
          rank: Number(row.rank),
          masked_msisdn: row.masked_msisdn,
          score: Number(row.score),
          prize_etb: Number(row.prize_etb),
          submitted_at: row.submitted_at,
        })),
        total_participants: parseInt(countRes.rows[0]?.count || '0', 10),
      });
    }

    return tournaments;
  };

  fastify.get('/', async () => {
    return await getTournamentsHandler();
  });

  fastify.get('/active', async () => {
    const tournaments = await getTournamentsHandler();
    return { tournaments };
  });

  // Get single tournament by ID with live leaderboard
  fastify.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const tournsRes = await pool.query(
      `SELECT t.*, g.title as game_title, g.category as game_category
       FROM tournaments t
       JOIN games g ON t.game_id = g.game_id
       WHERE t.id = $1`,
      [id]
    );
    if (tournsRes.rowCount === 0) {
      return reply.status(404).send({ success: false, error: 'Tournament not found' });
    }
    const tourn = tournsRes.rows[0];
    const lbRes = await pool.query(
      `SELECT ROW_NUMBER() OVER (ORDER BY score DESC, submitted_at ASC) as rank, 
              masked_msisdn, score, prize_etb, submitted_at 
       FROM tournament_entries 
       WHERE tournament_id = $1 
       ORDER BY score DESC, submitted_at ASC 
       LIMIT 10`,
      [id]
    );
    const countRes = await pool.query(
      `SELECT COUNT(*) as count FROM tournament_entries WHERE tournament_id = $1`,
      [id]
    );
    return reply.send({
      success: true,
      tournament: {
        ...tourn,
        leaderboard: lbRes.rows.map((row) => ({
          rank: Number(row.rank),
          masked_msisdn: row.masked_msisdn,
          score: Number(row.score),
          prize_etb: Number(row.prize_etb),
          submitted_at: row.submitted_at,
        })),
        total_participants: parseInt(countRes.rows[0]?.count || '0', 10),
      },
    });
  });

  // Enter tournament (Atomic 2 coins deduction & persistent entry registration)
  fastify.post('/:id/enter', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;
    const phone = req.user!.phone;

    // 1. Verify tournament exists and is ACTIVE
    const tournRes = await query('SELECT * FROM tournaments WHERE id = $1 AND status = $2', [id, 'ACTIVE']);
    if (tournRes.rowCount === 0) {
      return reply.status(404).send({ success: false, error: 'Active tournament not found.' });
    }

    const ENTRY_FEE_COINS = 2;

    // 2. Atomic Coin Deduction
    const deductResult = await walletService.deductCoins(
      userId,
      ENTRY_FEE_COINS,
      'TOURNAMENT_ENTRY',
      `TOURN_ENTRY_${id}_${Date.now()}`,
      `Tournament Entry Fee: ${tournRes.rows[0].title}`
    );

    if (!deductResult.success) {
      return reply.status(402).send({
        success: false,
        error: deductResult.error || 'Insufficient coins to enter tournament.',
        newBalance: deductResult.newBalance,
      });
    }

    // 3. Register or upsert tournament entry
    const maskedPhone = phone.length >= 7 
      ? `${phone.substring(0, 3)}****${phone.slice(-3)}` 
      : '091****890';

    await query(
      `INSERT INTO tournament_entries (tournament_id, player_msisdn, masked_msisdn, score, prize_etb, submitted_at)
       VALUES ($1, $2, $3, 0, 0, NOW())
       ON CONFLICT (tournament_id, player_msisdn) DO NOTHING`,
      [id, phone, maskedPhone]
    );

    return reply.send({
      success: true,
      message: `Tournament entry registered. ${ENTRY_FEE_COINS} Coins deducted.`,
      tournamentId: id,
      newBalance: deductResult.newBalance,
      attemptsLeft: 3,
    });
  });

  // Submit tournament score (Secured with Anti-Cheat validation)
  fastify.post('/:id/submit', { preHandler: [requireAuth] }, async (req, reply) => {
    const { id } = req.params as { id: string };
    const userId = req.user!.userId;
    const phone = req.user!.phone;
    const { score, gameId, durationSeconds } = (req.body || {}) as { score: number; gameId?: string; durationSeconds?: number };

    // 1. Verify tournament exists and is active
    const tournRes = await query(`SELECT * FROM tournaments WHERE id = $1`, [id]);
    if (tournRes.rowCount === 0) {
      return reply.status(404).send({ success: false, error: 'Tournament not found' });
    }
    const tournament = tournRes.rows[0];
    if (tournament.status !== 'ACTIVE') {
      return reply.status(400).send({ success: false, error: `Tournament is not active (status: ${tournament.status})` });
    }

    const validScore = Math.max(0, parseInt(score as any, 10) || 0);
    const targetGameId = gameId || tournament.game_id;

    // 2. Anti-cheat score verification
    const antiCheatCheck = await GameAntiCheat.validateScore(targetGameId, validScore, durationSeconds || 5);
    if (!antiCheatCheck.valid) {
      fastify.log.warn(`[Tournament Anti-Cheat] Fraudulent score detected: ${validScore} for user ${phone} on ${targetGameId}. Reason: ${antiCheatCheck.reason}`);
      return reply.status(400).send({
        success: false,
        error: antiCheatCheck.reason || 'Score rejected: Exceeds anti-cheat security thresholds.',
      });
    }

    const maskedPhone = phone.length >= 7 
      ? `${phone.substring(0, 3)}****${phone.slice(-3)}` 
      : '091****890';

    // Upsert or update score
    const updateRes = await query(
      `INSERT INTO tournament_entries (tournament_id, player_msisdn, masked_msisdn, score, prize_etb, submitted_at)
       VALUES ($1, $2, $3, $4, 0, NOW())
       ON CONFLICT (tournament_id, player_msisdn) DO UPDATE
         SET score = GREATEST(tournament_entries.score, EXCLUDED.score),
             submitted_at = NOW()
       RETURNING *`,
      [id, phone, maskedPhone, validScore]
    );

    // Also update daily_scores and high_scores
    if (gameId) {
      await query(
        `INSERT INTO high_scores (user_id, game_id, best_score, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, game_id) DO UPDATE
           SET best_score = GREATEST(high_scores.best_score, EXCLUDED.best_score),
               updated_at = NOW()`,
        [userId, gameId, validScore]
      );

      await query(
        `INSERT INTO daily_scores (user_id, game_id, score_date, best_score)
         VALUES ($1, $2, CURRENT_DATE, $3)
         ON CONFLICT (user_id, game_id, score_date) DO UPDATE
           SET best_score = GREATEST(daily_scores.best_score, EXCLUDED.best_score)`,
        [userId, gameId, validScore]
      );
    }

    // Compute player's rank
    const rankRes = await query(
      `SELECT COUNT(*) + 1 as rank
         FROM tournament_entries
        WHERE tournament_id = $1 AND score > $2`,
      [id, validScore]
    );

    const playerRank = parseInt(rankRes.rows[0]?.rank || '1', 10);

    return reply.send({
      success: true,
      message: 'Tournament score recorded successfully.',
      tournamentId: id,
      bestScore: updateRes.rows[0].score,
      rank: playerRank,
    });
  });
}
