import crypto from 'crypto';
import { env } from '../config/env.js';
import { pool } from '../config/database.js';

export function normalizeMsisdn(input: string): string {
  const digits = input.replace(/\D/g, '');
  if (digits.startsWith('251')) return digits;
  if (digits.startsWith('09')) return '251' + digits.substring(1);
  if (digits.startsWith('9')) return '251' + digits;
  if (digits.startsWith('07')) return '251' + digits.substring(1);
  if (digits.startsWith('7')) return '251' + digits;
  return digits;
}

export function maskMsisdn(msisdn: string): string {
  const norm = normalizeMsisdn(msisdn);
  if (norm.length >= 9) {
    const prefix = norm.startsWith('251') ? '0' + norm.substring(3, 5) : norm.substring(0, 3);
    const suffix = norm.slice(-3);
    return `${prefix}*****${suffix}`;
  }
  return '091*****989';
}

export const GameAntiCheat = {
  generateSessionToken(msisdn: string, gameId: string, timestamp: number): string {
    const raw = `${msisdn}:${gameId}:${timestamp}:${env.GAME_TOKEN_SECRET}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  },

  async validateScore(gameId: string, score: number, durationSeconds: number): Promise<{ valid: boolean; reason?: string }> {
    const gameRes = await pool.query(
      `SELECT max_score_per_sec, max_score FROM games WHERE game_id = $1`,
      [gameId]
    );

    const game = gameRes.rows[0];
    if (!game) {
      return { valid: true }; // Allow unconfigured games
    }

    if (score > game.max_score) {
      return { valid: false, reason: `Score ${score} exceeds hard ceiling of ${game.max_score}` };
    }

    if (durationSeconds > 0) {
      const rate = score / durationSeconds;
      if (rate > game.max_score_per_sec * 1.5) {
        return { valid: false, reason: `Score rate (${rate.toFixed(1)}/s) exceeds threshold (${game.max_score_per_sec}/s)` };
      }
    }

    return { valid: true };
  }
};
