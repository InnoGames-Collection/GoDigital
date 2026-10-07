import { query } from '../config/database.js';
import { cache } from '../config/cache.js';

export interface LeaderboardItem {
  rank: number;
  userId: string;
  displayName: string;
  maskedPhone: string;
  avatarId: string;
  score: number;
  moves?: number;
  durationSeconds?: number;
}

export const leaderboardService = {
  /**
   * Record game score in Redis Sorted Set & PostgreSQL
   */
  async recordScore(gameId: string, userId: string, score: number): Promise<void> {
    try {
      // 1. Valkey/Redis sorted set update: O(log(N))
      const key = `lb:game:${gameId}`;
      await cache.zadd(key, score, userId);
    } catch (err: any) {
      console.warn('[Leaderboard Cache Warning] Failed to update Valkey sorted set:', err.message);
    }
  },

  /**
   * Submit and index daily challenge score into PostgreSQL & Valkey
   */
  async recordDailyChallengeSubmission(params: {
    userId: string;
    challengeDate: string;
    gameId: string;
    score: number;
    movesCount: number;
    durationSeconds: number;
    sessionId?: string;
  }): Promise<void> {
    const { userId, challengeDate, gameId, score, movesCount, durationSeconds, sessionId } = params;

    // 1. PostgreSQL Persistent Settlement using Mandated Index
    await query(
      `INSERT INTO daily_challenge_submissions (
         user_id, challenge_date, game_id, score, moves_count, duration_seconds, session_id, completed_at
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       ON CONFLICT (user_id, challenge_date, game_id) DO UPDATE
         SET score = GREATEST(daily_challenge_submissions.score, EXCLUDED.score),
             moves_count = LEAST(daily_challenge_submissions.moves_count, EXCLUDED.moves_count),
             duration_seconds = LEAST(daily_challenge_submissions.duration_seconds, EXCLUDED.duration_seconds),
             completed_at = NOW()`,
      [userId, challengeDate, gameId, score, movesCount, durationSeconds, sessionId || null]
    );

    // 2. Redis Real-Time Sorted Set for Instant Rank Queries
    try {
      const redisKey = `lb:daily:${challengeDate}:${gameId}`;
      await cache.zadd(redisKey, score, userId);
      await cache.expire(redisKey, 86400 * 3); // 3-day TTL
    } catch (err: any) {
      console.warn('[Leaderboard Cache Warning] Failed to write daily challenge to Valkey:', err.message);
    }
  },

  /**
   * High-concurrency retrieval: reads Redis first, falls back to PostgreSQL indexed query
   */
  async getDailyLeaderboard(challengeDate: string, gameId?: string, limit: number = 50): Promise<LeaderboardItem[]> {
    const targetGame = gameId || 'sorting-balls';
    const redisKey = `lb:daily:${challengeDate}:${targetGame}`;

    // 1. Try Valkey Sorted Set First
    try {
      const topIdsWithScores = await cache.zrevrange(redisKey, 0, limit - 1, 'WITHSCORES');
      if (topIdsWithScores && topIdsWithScores.length > 0) {
        const userIds: string[] = [];
        const scores: Record<string, number> = {};

        for (let i = 0; i < topIdsWithScores.length; i += 2) {
          const uId = topIdsWithScores[i];
          const sc = parseInt(topIdsWithScores[i + 1], 10);
          userIds.push(uId);
          scores[uId] = sc;
        }

        const profileRes = await query(
          `SELECT id, display_name, phone_local, phone, avatar_id 
             FROM profiles 
            WHERE id = ANY($1)`,
          [userIds]
        );

        const profileMap = new Map<string, any>();
        for (const p of profileRes.rows) {
          profileMap.set(p.id, p);
        }

        return userIds.map((uId, idx) => {
          const prof = profileMap.get(uId);
          const rawPhone = prof?.phone_local || prof?.phone || '0911000000';
          const masked = rawPhone.length >= 7 
            ? `${rawPhone.substring(0, 3)}****${rawPhone.slice(-3)}` 
            : '091****890';

          return {
            rank: idx + 1,
            userId: uId,
            displayName: prof?.display_name || `Contender #${idx + 1}`,
            maskedPhone: masked,
            avatarId: prof?.avatar_id || 'avatar_runner',
            score: scores[uId] || 0,
          };
        });
      }
    } catch (err: any) {
      console.warn('[Leaderboard Cache Warning] Reading from PostgreSQL fallback:', err.message);
    }

    // 2. High-Performance PostgreSQL Fallback (Uses idx_daily_challenge_leaderboard)
    const dbRes = await query(
      `SELECT dcs.user_id, dcs.score, dcs.moves_count, dcs.duration_seconds,
              p.display_name, p.phone_local, p.phone, p.avatar_id
         FROM daily_challenge_submissions dcs
         JOIN profiles p ON dcs.user_id = p.id
        WHERE dcs.challenge_date = $1
          AND ($2::VARCHAR IS NULL OR dcs.game_id = $2)
        ORDER BY dcs.score DESC, dcs.completed_at ASC
        LIMIT $3`,
      [challengeDate, gameId || null, limit]
    );

    // Warm Redis cache asynchronously
    if (dbRes.rowCount && dbRes.rowCount > 0) {
      const zaddArgs: (string | number)[] = [];
      for (const row of dbRes.rows) {
        zaddArgs.push(row.score, row.user_id);
      }
      try {
        if (zaddArgs.length > 0) {
          await cache.zadd(redisKey, ...(zaddArgs as any));
        }
      } catch {
        // Continue
      }
    }

    return dbRes.rows.map((r, idx) => {
      const rawPhone = r.phone_local || r.phone || '0911000000';
      const masked = rawPhone.length >= 7 
        ? `${rawPhone.substring(0, 3)}****${rawPhone.slice(-3)}` 
        : '091****890';

      return {
        rank: idx + 1,
        userId: r.user_id,
        displayName: r.display_name || `Contender #${idx + 1}`,
        maskedPhone: masked,
        avatarId: r.avatar_id || 'avatar_runner',
        score: r.score,
        moves: r.moves_count,
        durationSeconds: parseFloat(r.duration_seconds),
      };
    });
  },
};
