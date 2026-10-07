import { query, getClient } from '../config/database.js';

export interface StreakStatus {
  currentStreak: number;
  longestStreak: number;
  lastClaimedDate: string | null;
  hasClaimedToday: boolean;
  nextRewardCoins: number;
  todayDateEAT: string;
}

export interface ClaimStreakResult {
  success: boolean;
  currentStreak: number;
  longestStreak: number;
  coinsAwarded: number;
  newBalance: number;
  message: string;
}

export const streakService = {
  /**
   * Get current streak status based on Africa/Addis_Ababa (UTC+3) midnight
   */
  async getStreakStatus(userId: string): Promise<StreakStatus> {
    const res = await query(
      `SELECT us.current_streak, 
              us.longest_streak, 
              us.last_claimed,
              (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::DATE as today_eat
         FROM profiles p
    LEFT JOIN user_streaks us ON p.id = us.user_id
        WHERE p.id = $1`,
      [userId]
    );

    if (res.rowCount === 0) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastClaimedDate: null,
        hasClaimedToday: false,
        nextRewardCoins: 10,
        todayDateEAT: new Date().toISOString().split('T')[0],
      };
    }

    const row = res.rows[0];
    const todayEatStr = row.today_eat ? new Date(row.today_eat).toISOString().split('T')[0] : '';
    const lastClaimedStr = row.last_claimed ? new Date(row.last_claimed).toISOString().split('T')[0] : null;
    const hasClaimedToday = lastClaimedStr === todayEatStr;
    const current = row.current_streak || 0;
    const nextReward = Math.min(50, 10 + ((current + 1) * 5));

    return {
      currentStreak: current,
      longestStreak: row.longest_streak || 0,
      lastClaimedDate: lastClaimedStr,
      hasClaimedToday,
      nextRewardCoins: nextReward,
      todayDateEAT: todayEatStr,
    };
  },

  /**
   * Atomically claim daily streak reward in Africa/Addis_Ababa timezone
   */
  async claimDailyStreak(userId: string): Promise<ClaimStreakResult> {
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. Determine Ethiopian Midnight Date
      const dateRes = await client.query(
        `SELECT (NOW() AT TIME ZONE 'Africa/Addis_Ababa')::DATE as today_eat`
      );
      const todayEat = dateRes.rows[0].today_eat;
      const todayEatStr = new Date(todayEat).toISOString().split('T')[0];

      // 2. Lock streak record for atomic evaluation
      const streakRes = await client.query(
        `SELECT current_streak, longest_streak, last_claimed 
           FROM user_streaks 
          WHERE user_id = $1 
            FOR UPDATE`,
        [userId]
      );

      let currentStreak = 0;
      let longestStreak = 0;
      let lastClaimed: string | null = null;

      if (streakRes.rowCount === 0) {
        await client.query(
          `INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_claimed) 
           VALUES ($1, 0, 0, NULL) 
           ON CONFLICT (user_id) DO NOTHING`,
          [userId]
        );
      } else {
        currentStreak = streakRes.rows[0].current_streak || 0;
        longestStreak = streakRes.rows[0].longest_streak || 0;
        lastClaimed = streakRes.rows[0].last_claimed
          ? new Date(streakRes.rows[0].last_claimed).toISOString().split('T')[0]
          : null;
      }

      // Check if already claimed today
      if (lastClaimed && lastClaimed === todayEatStr) {
        const balRes = await client.query('SELECT coins FROM profiles WHERE id = $1', [userId]);
        await client.query('COMMIT');

        return {
          success: false,
          currentStreak,
          longestStreak,
          coinsAwarded: 0,
          newBalance: balRes.rows[0]?.coins || 0,
          message: 'Daily streak reward already claimed for today (Addis Ababa timezone).',
        };
      }

      // Calculate consecutive streak based on yesterday in Addis Ababa
      const yesterdayRes = await client.query(
        `SELECT ((NOW() AT TIME ZONE 'Africa/Addis_Ababa')::DATE - INTERVAL '1 day')::DATE as yest_eat`
      );
      const yesterdayEatStr = new Date(yesterdayRes.rows[0].yest_eat).toISOString().split('T')[0];

      if (lastClaimed && lastClaimed === yesterdayEatStr) {
        currentStreak += 1;
      } else {
        // Streak broken or brand new
        currentStreak = 1;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      // Scaled reward: 10 + 5 per day, max 50
      const rewardCoins = Math.min(50, 10 + (currentStreak * 5));

      // Atomic Profile Coin Update
      const profileRes = await client.query(
        `UPDATE profiles 
            SET coins = coins + $1, updated_at = NOW() 
          WHERE id = $2 
         RETURNING coins`,
        [rewardCoins, userId]
      );

      const newBalance = parseInt(profileRes.rows[0].coins, 10);

      // Record in coin_transactions
      await client.query(
        `INSERT INTO coin_transactions (
           user_id, type, amount, balance_after, reference_id, description
         ) VALUES (
           $1, 'DAILY_STREAK', $2, $3, $4, $5
         )`,
        [
          userId,
          rewardCoins,
          newBalance,
          `STRK_${todayEatStr}_${currentStreak}`,
          `Day ${currentStreak} Daily Streak Claim (Addis Ababa Midnight: ${todayEatStr})`,
        ]
      );

      // Update user_streaks
      await client.query(
        `UPDATE user_streaks 
            SET current_streak = $1, 
                longest_streak = $2, 
                last_claimed = $3, 
                total_claims = COALESCE(total_claims, 0) + 1,
                updated_at = NOW() 
          WHERE user_id = $4`,
        [currentStreak, longestStreak, todayEat, userId]
      );

      await client.query('COMMIT');

      return {
        success: true,
        currentStreak,
        longestStreak,
        coinsAwarded: rewardCoins,
        newBalance,
        message: `Claimed Day ${currentStreak} streak bonus: +${rewardCoins} Coins!`,
      };
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[StreakService Error]', err);
      throw err;
    } finally {
      client.release();
    }
  },
};
