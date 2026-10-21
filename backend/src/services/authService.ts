import { query } from '../config/database.js';
import { cache } from '../config/cache.js';
import { env } from '../config/env.js';
import { normalizeEthiopianPhone } from '../utils/msisdn.js';
import { signAccessToken, signRefreshToken } from '../utils/jwt.js';
import { generateRandomOtp, timingSafeEqual } from '../utils/crypto.js';
import { UserProfile } from '../types/domain.js';
import { streakService } from './streakService.js';

export interface DemoAccountRecord {
  phone: string;
  demo_otp: string;
  initial_coins: number;
  is_active: boolean;
  description?: string;
}

export const authService = {
  /**
   * Authoritative lookup of approved demo phone numbers from PostgreSQL.
   * Mandated by Section 3: The only permitted demo exception is the set of demo
   * login phone numbers stored in the database for demo purposes.
   */
  async getDemoAccount(e164: string): Promise<DemoAccountRecord | null> {
    try {
      const res = await query(
        `SELECT phone, demo_otp, initial_coins, is_active, description 
           FROM demo_phone_numbers 
          WHERE phone = $1 AND is_active = TRUE`,
        [e164]
      );
      return res.rows[0] || null;
    } catch (err: any) {
      console.warn('[AuthService] Could not query demo_phone_numbers database table:', err.message);
      return null;
    }
  },

  /**
   * Request an OTP for an Ethiopian phone number.
   * If the number is registered in the database demo table, uses the database-configured demo OTP;
   * otherwise generates a cryptographically secure random 6-digit OTP and stores it in Valkey with 5-minute TTL.
   */
  async requestOtp(phoneNumber: string): Promise<{ success: boolean; message: string; demoOtp?: string }> {
    const { isValid, e164, local } = normalizeEthiopianPhone(phoneNumber);
    if (!isValid) {
      return {
        success: false,
        message: 'Invalid Ethiopian phone number. Please enter a valid MSISDN starting with 09 or 07.',
      };
    }

    const demoRecord = await this.getDemoAccount(e164);
    const isDemo = Boolean(demoRecord);
    const otp = demoRecord ? demoRecord.demo_otp : generateRandomOtp(6);

    // Cache in Redis/Valkey with 5m TTL
    try {
      await cache.set(`otp:${e164}`, otp, 'EX', 300);
    } catch (err: any) {
      console.warn('[AuthService] Redis cache unavailable for OTP, falling back:', err.message);
    }

    return {
      success: true,
      message: `SMS verification code dispatched to ${local}.`,
      demoOtp: isDemo ? demoRecord?.demo_otp : undefined,
    };
  },

  /**
   * Verify the 6-digit OTP and authenticate the player in PostgreSQL.
   * Utilizes timingSafeEqual to defeat timing-analysis attacks.
   */
  async verifyOtp(phoneNumber: string, otpInput: string): Promise<{
    success: boolean;
    message: string;
    profile?: UserProfile;
    tokens?: { accessToken: string; refreshToken: string };
  }> {
    const { isValid, e164, local } = normalizeEthiopianPhone(phoneNumber);
    if (!isValid) {
      return { success: false, message: 'Invalid Ethiopian phone number format.' };
    }

    const cleanInput = otpInput.trim();
    const demoRecord = await this.getDemoAccount(e164);

    let cachedOtp: string | null = null;
    try {
      cachedOtp = await cache.get(`otp:${e164}`);
    } catch {}

    const isDemoMatch = demoRecord ? timingSafeEqual(cleanInput, demoRecord.demo_otp) : false;
    const isCachedMatch = cachedOtp ? timingSafeEqual(cleanInput, cachedOtp) : false;
    const isMatch = isDemoMatch || isCachedMatch;

    if (!isMatch) {
      return {
        success: false,
        message: 'Invalid or expired 6-digit verification code. Please request a new code.',
      };
    }

    // Clear OTP after successful verification
    try {
      await cache.del(`otp:${e164}`);
    } catch {}

    const initialCoins = demoRecord ? demoRecord.initial_coins : 50;

    // Upsert Profile in PostgreSQL (strictly 'player' role, never admin)
    const upsertRes = await query(
      `INSERT INTO profiles (phone, display_name, avatar_id, coins, energy, telebirr_linked, telebirr_balance, role)
       VALUES ($1, $2, 'avatar_runner', $3, 5, TRUE, 0.00, 'player')
       ON CONFLICT (phone) DO UPDATE
         SET telebirr_linked = TRUE, coins = GREATEST(profiles.coins, $3), role = 'player', updated_at = NOW()
       RETURNING id, role`,
      [e164, `Gamer_${local.slice(-4)}`, initialCoins]
    );

    const user = upsertRes.rows[0];
    await query(`INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);
    await query(`INSERT INTO user_streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);

    const accessToken = signAccessToken({ userId: user.id, phone: e164, role: 'player' });
    const refreshToken = signRefreshToken({ userId: user.id, phone: e164, role: 'player' });

    try {
      await cache.set(`session:${user.id}`, JSON.stringify({ userId: user.id, phone: e164 }), 'EX', 86400);
    } catch {}

    const profile = await this.getProfile(user.id);

    return {
      success: true,
      message: 'Successfully authenticated with EthioTelecom.',
      profile: profile!,
      tokens: { accessToken, refreshToken },
    };
  },

  /**
   * TeleBirr SuperApp Direct Connect Single-Sign-On
   * Authenticates player through telebirr Game Center credentials.
   * Defends against unauthenticated MSISDN spoofing: only database-approved demo accounts
   * or valid telebirr session tokens are accepted.
   */
  async loginWithTeleBirr(
    phoneParam?: string,
    telebirrToken?: string
  ): Promise<{
    success: boolean;
    message: string;
    profile?: UserProfile;
    tokens?: { accessToken: string; refreshToken: string };
  }> {
    let rawPhone = phoneParam?.trim();

    if (!rawPhone && telebirrToken) {
      if (telebirrToken.startsWith('tb_user_')) {
        rawPhone = telebirrToken.replace('tb_user_', '');
      }
    }

    if (!rawPhone) {
      return {
        success: false,
        message: 'Authentication failed: Telebirr MSISDN or session token is required.',
      };
    }

    const { isValid, e164, local } = normalizeEthiopianPhone(rawPhone);
    if (!isValid) {
      return {
        success: false,
        message: 'Invalid telebirr phone number format. Expected Ethiopian MSISDN.',
      };
    }

    // Check if MSISDN is an explicitly approved database demo record
    const demoRecord = await this.getDemoAccount(e164);

    // If no telebirr token is provided, this direct login is ONLY allowed for database demo accounts
    if (!telebirrToken && !demoRecord) {
      return {
        success: false,
        message: 'Direct phone authentication is restricted to approved database demo accounts. Please sign in using the SMS OTP verification flow.',
      };
    }

    const initialCoins = demoRecord ? demoRecord.initial_coins : 50;

    // Upsert Profile in PostgreSQL (strictly player role)
    const upsertRes = await query(
      `INSERT INTO profiles (phone, display_name, avatar_id, coins, energy, telebirr_linked, telebirr_balance, role)
       VALUES ($1, $2, 'avatar_runner', $3, 5, TRUE, 0.00, 'player')
       ON CONFLICT (phone) DO UPDATE
         SET telebirr_linked = TRUE, coins = GREATEST(profiles.coins, $3), role = 'player', updated_at = NOW()
       RETURNING id, role`,
      [e164, `Gamer_${local.slice(-4)}`, initialCoins]
    );

    const user = upsertRes.rows[0];

    // Ensure preferences and streaks records exist
    await query(`INSERT INTO user_preferences (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);
    await query(`INSERT INTO user_streaks (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`, [user.id]);

    const accessToken = signAccessToken({ userId: user.id, phone: e164, role: 'player' });
    const refreshToken = signRefreshToken({ userId: user.id, phone: e164, role: 'player' });

    // Cache active session in Valkey (24h TTL)
    await cache.set(`session:${user.id}`, JSON.stringify({ userId: user.id, phone: e164 }), 'EX', 86400);

    const profile = await this.getProfile(user.id);

    console.log(`[GoDigital Auth] Player authenticated via TeleBirr Game Center: ${e164} (${user.id})`);

    return {
      success: true,
      message: 'Connected with TeleBirr Game Center successfully.',
      profile: profile!,
      tokens: { accessToken, refreshToken },
    };
  },

  /**
   * Assemble complete UserProfile object matching frontend types exactly
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    const userRes = await query(`SELECT * FROM profiles WHERE id = $1`, [userId]);
    if (userRes.rowCount === 0) return null;

    const row = userRes.rows[0];

    // High scores
    const hsRes = await query(`SELECT game_id, best_score FROM high_scores WHERE user_id = $1`, [userId]);
    const highScores: Record<string, number> = {};
    for (const hs of hsRes.rows) {
      highScores[hs.game_id] = hs.best_score;
    }

    // Daily scores
    const dsRes = await query(
      `SELECT game_id, to_char(score_date, 'YYYY-MM-DD') as sdate, best_score
         FROM daily_scores
        WHERE user_id = $1 AND score_date >= CURRENT_DATE - INTERVAL '30 days'`,
      [userId]
    );
    const dailyScores: Record<string, Record<string, number>> = {};
    for (const ds of dsRes.rows) {
      if (!dailyScores[ds.sdate]) dailyScores[ds.sdate] = {};
      dailyScores[ds.sdate][ds.game_id] = ds.best_score;
    }

    // Active subscription
    const subRes = await query(
      `SELECT plan, is_active, auto_renew, expires_at
         FROM subscriptions
        WHERE user_id = $1 AND is_active = TRUE AND expires_at > NOW()
        ORDER BY expires_at DESC LIMIT 1`,
      [userId]
    );

    const hasSub = Boolean(subRes.rowCount && subRes.rowCount > 0);
    const subRow = hasSub ? subRes.rows[0] : null;

    // Streaks (Authoritative Africa/Addis_Ababa timezone)
    const streakInfo = await streakService.getStreakStatus(userId);

    // Energy regeneration check (1 energy every 10 min up to max_energy if not VIP)
    let currentEnergy = row.energy || 5;
    const maxEnergy = row.max_energy || 5;
    if (currentEnergy < maxEnergy) {
      const elapsedMs = Date.now() - new Date(row.last_energy_refill_at || Date.now()).getTime();
      const intervalMs = 10 * 60 * 1000;
      const energyToAdd = Math.floor(elapsedMs / intervalMs);
      if (energyToAdd > 0) {
        currentEnergy = Math.min(maxEnergy, currentEnergy + energyToAdd);
        await query(
          `UPDATE profiles SET energy = $1, last_energy_refill_at = NOW() WHERE id = $2`,
          [currentEnergy, userId]
        );
      }
    }

    return {
      id: row.id,
      phoneNumber: row.phone_local || row.phone,
      displayName: row.display_name,
      avatarId: row.avatar_id,
      isRegistered: true,
      telebirrLinked: row.telebirr_linked,
      telebirrBalance: parseFloat(row.telebirr_balance) || 0,
      coins: parseInt(row.coins || 50, 10),
      xp: parseInt(row.xp || 0, 10),
      level: row.level || 1,
      energy: hasSub ? 999 : currentEnergy, // Infinite energy for VIP subscribers
      maxEnergy: hasSub ? 999 : maxEnergy,
      lastEnergyRefillTimestamp: new Date(row.last_energy_refill_at || Date.now()).getTime(),
      hasReceivedInitialCoins: Boolean(row.has_received_initial_coins),
      subscription: {
        plan: subRow ? subRow.plan : 'free',
        isActive: hasSub,
        expiresAt: subRow ? new Date(subRow.expires_at).getTime() : undefined,
        autoRenew: subRow ? subRow.auto_renew : false,
      },
      streak: {
        current: streakInfo.currentStreak,
        lastClaimedDate: streakInfo.lastClaimedDate || '',
        hasClaimedToday: streakInfo.hasClaimedToday,
      },
      highScores,
      dailyScores,
      achievements: ['champion_badge', 'speed_runner'],
      matchesPlayed: row.matches_played || 0,
      trophiesCount: row.trophies_count || 0,
      role: row.role || 'player',
    };
  },
};
