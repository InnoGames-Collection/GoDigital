import crypto from 'crypto';
import { query, getClient } from '../config/database.js';
import { cache } from '../config/cache.js';
import { env } from '../config/env.js';
import { PuzzleValidator, MoveStep } from './puzzleValidator.js';
import { leaderboardService } from './leaderboardService.js';

export interface StartSessionParams {
  userId: string;
  msisdn: string;
  gameId: string;
  levelNumber: number;
  isDailyChallenge?: boolean;
}

export interface SubmitSessionParams {
  userId: string;
  sessionId: string;
  nonce: string;
  moves: MoveStep[];
  durationSeconds: number;
}

export class ReplayConflictError extends Error {
  constructor(message: string = 'Session already consumed. Replay attack detected.') {
    super(message);
    this.name = 'ReplayConflictError';
  }
}

export const gameSessionService = {
  /**
   * Start a new authoritative puzzle session with a single-use nonce
   */
  async startPuzzleSession(params: StartSessionParams) {
    const { userId, msisdn, gameId, levelNumber, isDailyChallenge } = params;

    let levelConfig: any = null;
    let optimalMoves = 10;
    let parMoves = 15;
    let timeLimitSeconds = 60;
    let minTimeSeconds = 2.0;
    let scoringMatrix = { base_points: 1000, move_bonus: 500, speed_bonus_max: 400 };

    if (isDailyChallenge) {
      const challengeRes = await query(
        `SELECT * FROM daily_challenges 
          WHERE challenge_date = CURRENT_DATE AND game_id = $1`,
        [gameId]
      );
      if (challengeRes.rowCount === 0) {
        throw new Error('No active daily challenge found for today.');
      }
      const ch = challengeRes.rows[0];
      levelConfig = ch.level_config;
      optimalMoves = ch.target_moves;
      parMoves = ch.target_moves + 3;
      timeLimitSeconds = ch.par_time_seconds || 60;
    } else {
      const levelRes = await query(
        `SELECT * FROM puzzle_levels 
          WHERE game_id = $1 AND level_number = $2 AND is_active = TRUE`,
        [gameId, levelNumber]
      );

      if (levelRes.rowCount === 0) {
        // Fallback or unseeded level dynamic generation
        levelConfig = {
          capacity: 4,
          tubes: [
            ['yellow', 'yellow', 'cyan', 'cyan'],
            ['blue', 'blue', 'yellow', 'red'],
            ['yellow', 'blue', 'cyan', 'red'],
            ['red', 'blue', 'cyan', 'red'],
            [],
            [],
          ],
        };
      } else {
        const lvl = levelRes.rows[0];
        levelConfig = lvl.config;
        optimalMoves = lvl.optimal_moves;
        parMoves = lvl.par_moves;
        timeLimitSeconds = lvl.time_limit_seconds;
        minTimeSeconds = parseFloat(lvl.min_time_seconds) || 2.0;
        scoringMatrix = lvl.scoring_matrix;
      }
    }

    const sessionId = `psess_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    const nonce = crypto.randomBytes(24).toString('hex');
    const token = crypto
      .createHmac('sha256', env.GAME_TOKEN_SECRET)
      .update(`${userId}:${gameId}:${nonce}:${Date.now()}`)
      .digest('hex');

    // Persist session into PostgreSQL
    await query(
      `INSERT INTO game_sessions (
         session_id, user_id, player_msisdn, game_id, session_token, nonce, level_number, status, started_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'IN_PROGRESS', NOW())`,
      [sessionId, userId, msisdn, gameId, token, nonce, levelNumber]
    );

    // Cache in Redis/Valkey with 15m expiration
    try {
      await cache.set(`session:${sessionId}:nonce`, nonce, 'EX', 900);
      await cache.set(`session:${sessionId}:status`, 'IN_PROGRESS', 'EX', 900);
    } catch {
      // Graceful fallback to PostgreSQL
    }

    return {
      sessionId,
      sessionToken: token,
      nonce,
      gameId,
      levelNumber,
      config: levelConfig,
      optimalMoves,
      parMoves,
      timeLimitSeconds,
      minTimeSeconds,
    };
  },

  /**
   * Submit authoritative puzzle solution and enforce single-use nonce
   */
  async submitPuzzleSolution(params: SubmitSessionParams) {
    const { userId, sessionId, nonce, moves, durationSeconds } = params;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Replay Attack Defense & Atomic Row Lock
      const sessRes = await client.query(
        `SELECT * FROM game_sessions 
          WHERE session_id = $1 
            FOR UPDATE`,
        [sessionId]
      );

      if (sessRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return { success: false, statusCode: 404, message: 'Game session not found.' };
      }

      const session = sessRes.rows[0];

      // Verify Session Ownership
      if (session.user_id && session.user_id !== userId) {
        await client.query('ROLLBACK');
        return { success: false, statusCode: 403, message: 'Unauthorized session access.' };
      }

      // Check Nonce Replay
      if (session.nonce !== nonce) {
        await client.query('ROLLBACK');
        return { success: false, statusCode: 400, message: 'Invalid session nonce.' };
      }

      // If already processed or completed -> Replay Attack!
      if (session.status === 'COMPLETED' || session.status === 'REJECTED') {
        await client.query('ROLLBACK');
        throw new ReplayConflictError('Replay attack detected: This puzzle attempt has already been consumed.');
      }

      // Check Redis Nonce Lock if cache is active
      try {
        const nonceUsed = await cache.get(`nonce_used:${nonce}`);
        if (nonceUsed) {
          await client.query('ROLLBACK');
          throw new ReplayConflictError('Replay attack detected: Nonce already redeemed.');
        }
        await cache.set(`nonce_used:${nonce}`, '1', 'EX', 86400);
      } catch (err: any) {
        if (err instanceof ReplayConflictError) throw err;
      }

      // 2. Fetch Puzzle Level Configuration
      const levelRes = await client.query(
        `SELECT * FROM puzzle_levels WHERE game_id = $1 AND level_number = $2`,
        [session.game_id, session.level_number]
      );

      let config: any = null;
      let optimalMoves = 10;
      let parMoves = 14;
      let scoringMatrix = { base_points: 1000, move_bonus: 500, speed_bonus_max: 400 };

      if (levelRes.rowCount && levelRes.rowCount > 0) {
        const lvl = levelRes.rows[0];
        config = lvl.config;
        optimalMoves = lvl.optimal_moves;
        parMoves = lvl.par_moves;
        scoringMatrix = lvl.scoring_matrix;
      } else {
        config = {
          capacity: 4,
          tubes: [
            ['yellow', 'yellow', 'cyan', 'cyan'],
            ['blue', 'blue', 'yellow', 'red'],
            ['yellow', 'blue', 'cyan', 'red'],
            ['red', 'blue', 'cyan', 'red'],
            [],
            [],
          ],
        };
      }

      // 3. Server-Authoritative Solution & Anti-Cheat Validation
      let validation;
      if (session.game_id === 'sorting-balls' || session.game_id === 'emoji-sorting-ball' || session.game_id === 'royal-water-sort') {
        validation = PuzzleValidator.validateBallSort(
          config,
          optimalMoves,
          parMoves,
          moves,
          durationSeconds,
          scoringMatrix
        );
      } else if (session.game_id === 'memory-match') {
        validation = PuzzleValidator.validateMemoryMatch(
          config,
          optimalMoves,
          moves,
          durationSeconds
        );
      } else {
        // Generic puzzle move verification
        validation = {
          valid: durationSeconds >= 1.5 && moves.length >= 1,
          score: Math.max(100, Math.floor(1000 - moves.length * 10)),
          stars: 2,
          moves: moves.length,
          fraudFlag: durationSeconds < 1.0,
          fraudReason: durationSeconds < 1.0 ? 'Sub-human completion time detected.' : undefined,
        };
      }

      if (!validation.valid || validation.fraudFlag) {
        // Mark session as REJECTED and record fraud flag
        await client.query(
          `UPDATE game_sessions 
              SET status = 'REJECTED', 
                  fraud_flag = TRUE, 
                  fraud_reason = $1, 
                  completed_at = NOW(),
                  moves_count = $2,
                  duration_seconds = $3
            WHERE session_id = $4`,
          [validation.fraudReason || 'Invalid solution', moves.length, durationSeconds, sessionId]
        );

        await client.query('COMMIT');

        return {
          success: false,
          statusCode: 422,
          verified: false,
          fraudFlag: true,
          reason: validation.fraudReason,
        };
      }

      // 4. Mark Session COMPLETED
      await client.query(
        `UPDATE game_sessions 
            SET status = 'COMPLETED',
                score = $1,
                verified = TRUE,
                fraud_flag = FALSE,
                completed_at = NOW(),
                moves_count = $2,
                duration_seconds = $3,
                telemetry = $4
          WHERE session_id = $5`,
        [validation.score, moves.length, durationSeconds, JSON.stringify(moves), sessionId]
      );

      // 5. Atomic PostgreSQL Level Progression Persistence
      await client.query(
        `INSERT INTO user_puzzle_progress (
           user_id, game_id, level_number, stars, best_score, best_moves, best_time_seconds, completed_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         ON CONFLICT (user_id, game_id, level_number) DO UPDATE
           SET stars = GREATEST(user_puzzle_progress.stars, EXCLUDED.stars),
               best_score = GREATEST(user_puzzle_progress.best_score, EXCLUDED.best_score),
               best_moves = LEAST(user_puzzle_progress.best_moves, EXCLUDED.best_moves),
               best_time_seconds = LEAST(user_puzzle_progress.best_time_seconds, EXCLUDED.best_time_seconds),
               completed_at = NOW()`,
        [
          userId,
          session.game_id,
          session.level_number,
          validation.stars,
          validation.score,
          moves.length,
          durationSeconds,
        ]
      );

      // Update High Scores
      await client.query(
        `INSERT INTO high_scores (user_id, game_id, best_score, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, game_id) DO UPDATE
           SET best_score = GREATEST(high_scores.best_score, EXCLUDED.best_score),
               updated_at = NOW()`,
        [userId, session.game_id, validation.score]
      );

      // Award completion coins (5 coins)
      await client.query('SELECT apply_coins($1, 5, $2, $3)', [
        userId,
        `Level ${session.level_number} Victory: ${session.game_id}`,
        sessionId,
      ]);

      await client.query('COMMIT');

      // Update Redis sorted set for real-time leaderboard
      await leaderboardService.recordScore(session.game_id, userId, validation.score);

      return {
        success: true,
        statusCode: 200,
        verified: true,
        score: validation.score,
        stars: validation.stars,
        moves: moves.length,
        durationSeconds,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
};
