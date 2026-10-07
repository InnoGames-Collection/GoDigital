import { FastifyInstance } from 'fastify';
import { pool, query } from '../config/database.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { walletService } from '../services/walletService.js';

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
        `SELECT rank, masked_msisdn, score, prize_etb 
         FROM tournament_entries 
         WHERE tournament_id = $1 
         ORDER BY score DESC 
         LIMIT 10`,
        [tourn.id]
      );
      tournaments.push({
        ...tourn,
        leaderboard: lbRes.rows,
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
}
