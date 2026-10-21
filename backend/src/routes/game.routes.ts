import { FastifyInstance } from 'fastify';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { gameSessionService, ReplayConflictError } from '../services/gameSessionService.js';
import { streakService } from '../services/streakService.js';
import { walletService } from '../services/walletService.js';
import { leaderboardService } from '../services/leaderboardService.js';
import { NotificationService } from '../services/notificationService.js';
import { authService } from '../services/authService.js';
import { GameAntiCheat } from '../services/gameAntiCheat.js';
import { query } from '../config/database.js';
import { env } from '../config/env.js';

export async function gameRoutes(fastify: FastifyInstance) {
  // =========================================================================
  // 1. AUTHORITATIVE PUZZLE SESSION MANAGEMENT (ANTI-CHEAT & ANTI-REPLAY)
  // =========================================================================

  // Start a new puzzle session with single-use nonce
  fastify.post('/puzzle/session/start', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = req.user!.userId;
    const phone = req.user!.phone;
    const { gameId, levelNumber, isDailyChallenge } = (req.body || {}) as {
      gameId: string;
      levelNumber?: number;
      isDailyChallenge?: boolean;
    };

    if (!gameId) {
      return reply.status(400).send({ success: false, error: 'Missing required field: gameId' });
    }

    try {
      const session = await gameSessionService.startPuzzleSession({
        userId,
        msisdn: phone,
        gameId,
        levelNumber: levelNumber || 1,
        isDailyChallenge: Boolean(isDailyChallenge),
      });

      return reply.send({ success: true, ...session });
    } catch (err: any) {
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message || 'Failed to start puzzle session' });
    }
  });

  // Submit move sequence and verify solution authoritatively
  fastify.post('/puzzle/session/submit', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = req.user!.userId;
    const { sessionId, nonce, moves, durationSeconds } = (req.body || {}) as {
      sessionId: string;
      nonce: string;
      moves: any[];
      durationSeconds: number;
    };

    if (!sessionId || !nonce) {
      return reply.status(400).send({
        success: false,
        error: 'Missing session parameters: sessionId and nonce are strictly required.',
      });
    }

    try {
      const result = await gameSessionService.submitPuzzleSolution({
        userId,
        sessionId,
        nonce,
        moves: moves || [],
        durationSeconds: Number(durationSeconds) || 0,
      });

      return reply.status(result.statusCode || 200).send(result);
    } catch (err: any) {
      if (err instanceof ReplayConflictError) {
        return reply.status(409).send({
          success: false,
          error: err.message,
          code: 'SESSION_REPLAY_CONFLICT',
        });
      }
      fastify.log.error(err);
      return reply.status(500).send({ success: false, error: err.message || 'Internal verification error' });
    }
  });

  // =========================================================================
  // 2. PUZZLE PROGRESSION & LIVE CATALOG (ZERO MOCK DATA)
  // =========================================================================

  // Fetch live puzzle levels for a game from PostgreSQL
  fastify.get('/puzzle/levels/:gameId', { preHandler: [optionalAuth] }, async (req, reply) => {
    const { gameId } = req.params as { gameId: string };
    const userId = req.user?.userId;

    const levelsRes = await query(
      `SELECT level_number, difficulty_tier, optimal_moves, par_moves, 
              time_limit_seconds, config, scoring_matrix
         FROM puzzle_levels
        WHERE game_id = $1 AND is_active = TRUE
        ORDER BY level_number ASC`,
      [gameId]
    );

    let progressMap: Record<number, any> = {};
    if (userId) {
      const progRes = await query(
        `SELECT level_number, stars, best_score, best_moves, best_time_seconds
           FROM user_puzzle_progress
          WHERE user_id = $1 AND game_id = $2`,
        [userId, gameId]
      );
      for (const row of progRes.rows) {
        progressMap[row.level_number] = row;
      }
    }

    const levels = levelsRes.rows.map((lvl) => ({
      ...lvl,
      userProgress: progressMap[lvl.level_number] || null,
      isUnlocked: lvl.level_number === 1 || Boolean(progressMap[lvl.level_number - 1]),
    }));

    return reply.send({ success: true, gameId, levels });
  });

  // Fetch full user progression for a game
  fastify.get('/puzzle/progress/:gameId', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = req.user!.userId;
    const { gameId } = req.params as { gameId: string };

    const progRes = await query(
      `SELECT level_number, stars, best_score, best_moves, best_time_seconds, completed_at
         FROM user_puzzle_progress
        WHERE user_id = $1 AND game_id = $2
        ORDER BY level_number ASC`,
      [userId, gameId]
    );

    const levelScores: Record<number, number> = {};
    const levelStars: Record<number, number> = {};
    const bestMoves: Record<number, number> = {};
    const bestTimes: Record<number, number> = {};
    const completedLevels: number[] = [];
    let totalScore = 0;
    let maxLevel = 1;

    for (const r of progRes.rows) {
      completedLevels.push(r.level_number);
      levelScores[r.level_number] = r.best_score;
      levelStars[r.level_number] = r.stars;
      bestMoves[r.level_number] = r.best_moves;
      bestTimes[r.level_number] = parseFloat(r.best_time_seconds);
      totalScore += r.best_score;
      if (r.level_number >= maxLevel) maxLevel = r.level_number + 1;
    }

    return reply.send({
      success: true,
      gameId,
      unlockedLevel: Math.max(1, maxLevel),
      completedLevels,
      totalCumulativeScore: totalScore,
      levelScores,
      levelStars,
      bestMoves,
      bestTimes,
    });
  });

  // =========================================================================
  // 3. SYNCHRONIZED DAILY CHALLENGE & LEADERBOARDS
  // =========================================================================

  // Get active daily challenge for today
  fastify.get('/puzzle/daily-challenge', { preHandler: [optionalAuth] }, async (req, reply) => {
    const { gameId } = (req.query || {}) as { gameId?: string };
    const targetGame = gameId || 'sorting-balls';

    const challengeRes = await query(
      `SELECT id, challenge_date, game_id, title, difficulty_tier, level_config, 
              target_moves, par_time_seconds, bonus_multiplier, coin_reward
         FROM daily_challenges
        WHERE challenge_date = CURRENT_DATE 
          AND ($1::VARCHAR IS NULL OR game_id = $1)
        LIMIT 1`,
      [gameId || null]
    );

    if (challengeRes.rowCount === 0) {
      return reply.status(404).send({ success: false, message: 'No daily challenge active for today.' });
    }

    return reply.send({ success: true, challenge: challengeRes.rows[0] });
  });

  // Get real-time daily challenge leaderboard (Redis sorted set + PostgreSQL)
  fastify.get('/puzzle/daily-challenge/leaderboard', async (req, reply) => {
    const { date, gameId, limit } = (req.query || {}) as { date?: string; gameId?: string; limit?: string };
    const challengeDate = date || new Date().toISOString().split('T')[0];
    const topLimit = limit ? parseInt(limit, 10) : 50;

    const entries = await leaderboardService.getDailyLeaderboard(challengeDate, gameId, topLimit);
    return reply.send({ success: true, date: challengeDate, entries });
  });

  // =========================================================================
  // AUTHORITATIVE GAME CATALOG (FROM POSTGRESQL games TABLE)
  // =========================================================================

  const getCatalogHandler = async () => {
    const gamesRes = await query(
      `SELECT game_id, title, category, is_free, requires_coins, is_enabled, max_score, max_score_per_sec
         FROM games
        WHERE is_enabled = TRUE
        ORDER BY game_id`
    );

    const games = gamesRes.rows.map((row: any) => ({
      gameId: row.game_id,
      gameName: row.title,
      titleAmharic: row.title,
      category: row.category,
      isFree: Boolean(row.is_free),
      requiresCoins: Boolean(row.requires_coins),
      coinCost: row.requires_coins ? 2 : 0,
      isActive: Boolean(row.is_enabled),
      maxScore: row.max_score,
      maxScorePerSec: row.max_score_per_sec,
      thumbnail: `/banners/${row.game_id}.png`,
      banner: `/banners/${row.game_id}.png`,
    }));

    return { success: true, games };
  };

  fastify.get('/catalog', getCatalogHandler);
  fastify.get('/list', getCatalogHandler);
  fastify.get('/all', getCatalogHandler);

  // =========================================================================
  // AUTHORITATIVE PERIOD LEADERBOARDS (FROM POSTGRESQL daily_scores & high_scores)
  // =========================================================================

  // Weekly Leaderboard (aggregated over the last 7 days)
  fastify.get('/leaderboards/weekly', async (req, reply) => {
    const res = await query(
      `SELECT p.id as "userId", p.display_name as "playerName", p.phone, p.phone_local, p.avatar_id as "avatarId",
              COALESCE(MAX(ds.best_score), MAX(hs.best_score), 0) as score,
              COUNT(DISTINCT ds.score_date) as "bestScoresCount",
              EXTRACT(EPOCH FROM MAX(COALESCE(ds.score_date::timestamptz, hs.updated_at, p.created_at))) * 1000 as timestamp
         FROM profiles p
         LEFT JOIN daily_scores ds ON ds.user_id = p.id AND ds.score_date >= CURRENT_DATE - INTERVAL '7 days'
         LEFT JOIN high_scores hs ON hs.user_id = p.id
        WHERE p.role != 'admin'
        GROUP BY p.id, p.display_name, p.phone, p.phone_local, p.avatar_id
       HAVING COALESCE(MAX(ds.best_score), MAX(hs.best_score), 0) > 0
        ORDER BY score DESC
        LIMIT 50`
    );

    const PRIZES = ['50K ETB', '40K ETB', '35K ETB', '30K ETB', '25K ETB', '20K ETB', '15K ETB', '10K ETB', '5K ETB', '3K ETB'];

    const entries = res.rows.map((row: any, idx: number) => {
      const rawPhone = row.phone_local || row.phone || '';
      const masked = rawPhone.length >= 7 
        ? `${rawPhone.substring(0, 3)}*****${rawPhone.slice(-3)}` 
        : `Player ${idx + 1}`;

      return {
        rank: idx + 1,
        userId: row.userId,
        phone: rawPhone,
        masked,
        totalPoints: Number(row.score),
        bestScoresCount: parseInt(row.bestScoresCount, 10) || 1,
        timestamp: Number(row.timestamp) || Date.now(),
        reward: PRIZES[idx] || '1K ETB',
      };
    });

    return reply.send({ success: true, entries, totalContenders: entries.length });
  });

  // Monthly Leaderboard (aggregated over the last 30 days)
  fastify.get('/leaderboards/monthly', async (req, reply) => {
    const res = await query(
      `SELECT p.id as "userId", p.display_name as "playerName", p.phone, p.phone_local, p.avatar_id as "avatarId",
              COALESCE(MAX(ds.best_score), MAX(hs.best_score), 0) as score,
              COUNT(DISTINCT ds.score_date) as "bestScoresCount",
              EXTRACT(EPOCH FROM MAX(COALESCE(ds.score_date::timestamptz, hs.updated_at, p.created_at))) * 1000 as timestamp
         FROM profiles p
         LEFT JOIN daily_scores ds ON ds.user_id = p.id AND ds.score_date >= CURRENT_DATE - INTERVAL '30 days'
         LEFT JOIN high_scores hs ON hs.user_id = p.id
        WHERE p.role != 'admin'
        GROUP BY p.id, p.display_name, p.phone, p.phone_local, p.avatar_id
       HAVING COALESCE(MAX(ds.best_score), MAX(hs.best_score), 0) > 0
        ORDER BY score DESC
        LIMIT 50`
    );

    const PRIZES = ['50K ETB', '40K ETB', '35K ETB', '30K ETB', '25K ETB', '20K ETB', '15K ETB', '10K ETB', '5K ETB', '3K ETB'];

    const entries = res.rows.map((row: any, idx: number) => {
      const rawPhone = row.phone_local || row.phone || '';
      const masked = rawPhone.length >= 7 
        ? `${rawPhone.substring(0, 3)}*****${rawPhone.slice(-3)}` 
        : `Player ${idx + 1}`;

      return {
        rank: idx + 1,
        userId: row.userId,
        phone: rawPhone,
        masked,
        totalPoints: Number(row.score),
        bestScoresCount: parseInt(row.bestScoresCount, 10) || 1,
        timestamp: Number(row.timestamp) || Date.now(),
        reward: PRIZES[idx] || '1K ETB',
      };
    });

    return reply.send({ success: true, entries, totalContenders: entries.length });
  });

  // Per-Game High Scores Leaderboard
  fastify.get('/leaderboards/game/:gameId', async (req, reply) => {
    const { gameId } = req.params as { gameId: string };
    const res = await query(
      `SELECT p.id as "userId", p.display_name as "playerName", p.phone, p.phone_local, p.avatar_id as "avatarId",
              hs.best_score as score,
              EXTRACT(EPOCH FROM hs.updated_at) * 1000 as timestamp
         FROM high_scores hs
         JOIN profiles p ON hs.user_id = p.id
        WHERE hs.game_id = $1 AND p.role != 'admin'
        ORDER BY hs.best_score DESC, hs.updated_at ASC
        LIMIT 50`,
      [gameId]
    );

    const entries = res.rows.map((row: any, idx: number) => {
      const rawPhone = row.phone_local || row.phone || '';
      const masked = rawPhone.length >= 7 
        ? `${rawPhone.substring(0, 3)}*****${rawPhone.slice(-3)}` 
        : `Player ${idx + 1}`;

      return {
        rank: idx + 1,
        userId: row.userId,
        playerName: row.playerName || (rawPhone.length >= 7 ? `Player ${masked}` : `Player ${idx + 1}`),
        playerMasked: masked,
        score: parseInt(row.score, 10) || 0,
        rewardText: idx === 0 ? '500 Coins' : idx === 1 ? '300 Coins' : idx === 2 ? '200 Coins' : idx < 5 ? '100 Coins' : undefined,
      };
    });

    return reply.send(entries);
  });

  // =========================================================================
  // 4. TIMEZONE-AWARE DAILY STREAK (AFRICA/ADDIS_ABABA MIDNIGHT)
  // =========================================================================

  // Get current streak status
  fastify.get('/streak/status', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = req.user!.userId;
    const status = await streakService.getStreakStatus(userId);
    return reply.send({ success: true, ...status });
  });

  // Atomically claim streak bonus in Africa/Addis_Ababa timezone
  fastify.post('/streak/claim', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = req.user!.userId;
    const result = await streakService.claimDailyStreak(userId);
    return reply.send(result);
  });

  // =========================================================================
  // 5. ATOMIC COIN DEDUCTION (HINTS, UNDOS, PREMIUM PUZZLE ACCESS)
  // =========================================================================

  // Atomically deduct coins for hint or in-game power-up
  fastify.post('/wallet/use-hint', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = req.user!.userId;
    const { gameId, cost } = (req.body || {}) as { gameId: string; cost?: number };
    const hintCost = cost && cost > 0 ? cost : 3;

    const result = await walletService.deductCoins(
      userId,
      hintCost,
      'HINT_DEDUCTION',
      `HINT_${gameId}_${Date.now()}`,
      `Puzzle Hint Assistance in ${gameId || 'Game'}`
    );

    if (!result.success) {
      return reply.status(400).send(result);
    }
    return reply.send(result);
  });

  // Get wallet details & transaction ledger
  fastify.get('/wallet/balance', { preHandler: [requireAuth] }, async (req, reply) => {
    const userId = req.user!.userId;
    const details = await walletService.getWalletDetails(userId);
    return reply.send({ success: true, wallet: details });
  });

  // =========================================================================
  // 6. BACKWARD-COMPATIBLE SESSION ENDPOINTS (SECURED)
  // =========================================================================

  fastify.post('/session/start', { preHandler: [optionalAuth] }, async (req, reply) => {
    const userId = req.user?.userId || null;
    const { msisdn, gameId } = (req.body || {}) as { msisdn?: string; gameId: string };
    const playerPhone = msisdn || req.user?.phone || 'GUEST';
    if (!gameId) return reply.status(400).send({ error: 'Missing gameId' });

    const session = await gameSessionService.startPuzzleSession({
      userId: userId as any,
      msisdn: playerPhone,
      gameId,
      levelNumber: 1,
    });

    return reply.send({
      success: true,
      sessionId: session.sessionId,
      sessionToken: session.sessionToken,
      nonce: session.nonce,
      token: session.sessionToken,
    });
  });

  fastify.post('/session/submit', { preHandler: [optionalAuth] }, async (req, reply) => {
    const userId = req.user?.userId;
    const playerPhone = req.user?.phone;
    const { sessionId, nonce, moves, rawScore, durationSeconds, gameId, tournamentId } = (req.body || {}) as any;

    let finalScore = Number(rawScore) || 0;
    const targetGameId = gameId || 'helix-jump';
    const duration = Math.max(1, Number(durationSeconds) || 5);

    // 1. Authoritative puzzle solver session submission (if session/nonce provided)
    if (sessionId && nonce && userId) {
      try {
        const result = await gameSessionService.submitPuzzleSolution({
          userId,
          sessionId,
          nonce,
          moves: moves || [],
          durationSeconds: duration,
        });
        if (result.success && result.score) {
          finalScore = result.score;
        }
        return reply.status(result.statusCode || 200).send(result);
      } catch (err: any) {
        if (err instanceof ReplayConflictError) {
          return reply.status(409).send({ success: false, error: err.message });
        }
      }
    }

    // 2. Server-Authoritative Anti-Cheat Verification on incoming score
    const antiCheat = await GameAntiCheat.validateScore(targetGameId, finalScore, duration);
    if (!antiCheat.valid) {
      fastify.log.warn(`[Anti-Cheat Violation] Rejected score ${finalScore} in ${targetGameId} for phone ${playerPhone}: ${antiCheat.reason}`);
      return reply.status(400).send({
        success: false,
        verified: false,
        error: antiCheat.reason || 'Score rejected by anti-cheat controls.',
      });
    }

    let updatedProfile = null;
    let coinsEarned = 0;
    let xpEarned = 0;

    // 3. Atomically persist score and award currency in PostgreSQL if authenticated
    if (userId) {
      // High score
      await query(
        `INSERT INTO high_scores (user_id, game_id, best_score, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, game_id) DO UPDATE
           SET best_score = GREATEST(high_scores.best_score, EXCLUDED.best_score),
               updated_at = NOW()`,
        [userId, targetGameId, finalScore]
      );

      // Daily score
      await query(
        `INSERT INTO daily_scores (user_id, game_id, score_date, best_score)
         VALUES ($1, $2, CURRENT_DATE, $3)
         ON CONFLICT (user_id, game_id, score_date) DO UPDATE
           SET best_score = GREATEST(daily_scores.best_score, EXCLUDED.best_score)`,
        [userId, targetGameId, finalScore]
      );

      // Tournament entry update if tournamentId specified
      if (tournamentId && playerPhone) {
        const maskedPhone = playerPhone.length >= 7 
          ? `${playerPhone.substring(0, 3)}****${playerPhone.slice(-3)}` 
          : '091****890';

        await query(
          `INSERT INTO tournament_entries (tournament_id, player_msisdn, masked_msisdn, score, prize_etb, submitted_at)
           VALUES ($1, $2, $3, $4, 0, NOW())
           ON CONFLICT (tournament_id, player_msisdn) DO UPDATE
             SET score = GREATEST(tournament_entries.score, EXCLUDED.score),
                 submitted_at = NOW()`,
          [tournamentId, playerPhone, maskedPhone, finalScore]
        );
      }

      // Compute coins and XP authoritatively
      coinsEarned = Math.max(5, Math.floor(finalScore / 20));
      xpEarned = Math.max(10, Math.floor(finalScore / 10));

      await query(
        `UPDATE profiles 
            SET coins = coins + $1, 
                xp = xp + $2, 
                matches_played = matches_played + 1, 
                updated_at = NOW() 
          WHERE id = $3`,
        [coinsEarned, xpEarned, userId]
      );

      await query(
        `INSERT INTO coin_transactions (user_id, type, amount, balance_after, reference_id, description)
         VALUES ($1, 'LEVEL_REWARD', $2, (SELECT coins FROM profiles WHERE id = $1), $3, $4)`,
        [userId, coinsEarned, `MATCH_${targetGameId}_${Date.now()}`, `Match reward for ${targetGameId} (${finalScore} pts)`]
      );

      // Load updated authoritative profile
      updatedProfile = await authService.getProfile(userId);
    }

    // 4. Trigger Notification for Verified Score / Personal Record
    if (finalScore > 0 && playerPhone) {
      NotificationService.createNotification({
        phone: playerPhone,
        type: 'HIGH_SCORE',
        title: '🏆 Score Verified!',
        message: `You recorded a score of ${finalScore.toLocaleString()} pts in ${targetGameId}!`,
        metadata: { gameId: targetGameId, score: finalScore },
        action_url: 'leaderboard',
        action_label: 'View Rankings',
      }).catch((e) => fastify.log.warn(`[Notification] Failed to create score notification: ${e}`));
    }

    return reply.send({
      success: true,
      verified: true,
      score: finalScore,
      coinsEarned,
      xpEarned,
      updatedProfile,
    });
  });
}
