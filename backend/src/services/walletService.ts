import { query, getClient } from '../config/database.js';

export interface WalletTransactionResult {
  success: boolean;
  newBalance: number;
  message?: string;
  error?: string;
}

export const walletService = {
  /**
   * Atomically deduct coins from a player's wallet with balance check.
   * Enforces zero overdraft: balance >= cost
   */
  async deductCoins(
    userId: string,
    amount: number,
    txType: string,
    refId: string,
    description: string
  ): Promise<WalletTransactionResult> {
    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Deduction amount must be greater than zero.' };
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Atomic conditional decrement
      const updateRes = await client.query(
        `UPDATE profiles 
            SET coins = coins - $1, 
                updated_at = NOW() 
          WHERE id = $2 
            AND coins >= $1 
         RETURNING coins`,
        [amount, userId]
      );

      if (updateRes.rowCount === 0) {
        // Fetch current balance to report back
        const balRes = await client.query('SELECT coins FROM profiles WHERE id = $1', [userId]);
        const currentBalance = balRes.rows[0]?.coins || 0;
        await client.query('ROLLBACK');

        return {
          success: false,
          newBalance: currentBalance,
          error: `Insufficient coins. Required: ${amount}, Current Balance: ${currentBalance}.`,
        };
      }

      const newBalance = parseInt(updateRes.rows[0].coins, 10);

      // Record immutable ledger entry
      await client.query(
        `INSERT INTO coin_transactions (
           user_id, type, amount, balance_after, reference_id, description
         ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, txType, -amount, newBalance, refId, description]
      );

      await client.query('COMMIT');
      return { success: true, newBalance, message: 'Deduction successful.' };
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[WalletService Error] Coin deduction failed:', err);
      return { success: false, newBalance: 0, error: err.message || 'Database error during deduction.' };
    } finally {
      client.release();
    }
  },

  /**
   * Atomically credit coins to a player's wallet.
   */
  async creditCoins(
    userId: string,
    amount: number,
    txType: string,
    refId: string,
    description: string
  ): Promise<WalletTransactionResult> {
    if (amount <= 0) {
      return { success: false, newBalance: 0, error: 'Credit amount must be greater than zero.' };
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const updateRes = await client.query(
        `UPDATE profiles 
            SET coins = coins + $1, 
                updated_at = NOW() 
          WHERE id = $2 
         RETURNING coins`,
        [amount, userId]
      );

      if (updateRes.rowCount === 0) {
        await client.query('ROLLBACK');
        return { success: false, newBalance: 0, error: 'User profile not found.' };
      }

      const newBalance = parseInt(updateRes.rows[0].coins, 10);

      await client.query(
        `INSERT INTO coin_transactions (
           user_id, type, amount, balance_after, reference_id, description
         ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, txType, amount, newBalance, refId, description]
      );

      await client.query('COMMIT');
      return { success: true, newBalance, message: 'Credit successful.' };
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[WalletService Error] Coin credit failed:', err);
      return { success: false, newBalance: 0, error: err.message || 'Database error during credit.' };
    } finally {
      client.release();
    }
  },

  /**
   * Get wallet balance and recent transactions
   */
  async getWalletDetails(userId: string) {
    const profileRes = await query('SELECT coins, telebirr_balance FROM profiles WHERE id = $1', [userId]);
    if (profileRes.rowCount === 0) return null;

    const txRes = await query(
      `SELECT id, type, amount, balance_after, reference_id, description, created_at 
         FROM coin_transactions 
        WHERE user_id = $1 
        ORDER BY created_at DESC 
        LIMIT 20`,
      [userId]
    );

    return {
      coins: parseInt(profileRes.rows[0].coins || 0, 10),
      telebirrBalance: parseFloat(profileRes.rows[0].telebirr_balance || 0),
      transactions: txRes.rows,
    };
  },
};
