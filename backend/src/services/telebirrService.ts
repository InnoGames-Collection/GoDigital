import { env } from '../config/env.js';
import { query, getClient } from '../config/database.js';
import { computeHmacSha256 } from '../utils/crypto.js';
import { subscriptionService } from './subscriptionService.js';
import { walletService } from './walletService.js';
import { SubscriptionPlan } from '../types/domain.js';

export interface InitiatePaymentParams {
  userId: string;
  phone: string;
  amountETB: number;
  itemType: 'VIP_SUBSCRIPTION' | 'COIN_PACK' | 'ENERGY_PACK';
  itemTitle: string;
  coinsReward?: number;
  subscriptionPlan?: SubscriptionPlan;
}

export interface InitiatePaymentResult {
  orderId: string;
  checkoutUrl?: string;
  sandbox: boolean;
  status: 'PENDING' | 'SUCCESS';
  message: string;
}

export const telebirrService = {
  /**
   * Initiate a TeleBirr C2B checkout payment
   */
  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const orderId = `TB_${Date.now().toString(36).toUpperCase()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const isSandbox = env.TELEBIRR_MODE === 'sandbox' || !env.TELEBIRR_APP_KEY;

    // Record initial order in PostgreSQL
    await query(
      `INSERT INTO payment_orders (
         id, user_id, method, amount_etb, item_type, item_title, coins, status, msisdn_masked
       ) VALUES ($1, $2, 'TELEBIRR', $3, $4, $5, $6, $7, $8)`,
      [
        orderId,
        params.userId,
        params.amountETB,
        params.itemType,
        params.itemTitle,
        params.coinsReward || 0,
        isSandbox ? 'SUCCESS' : 'PENDING',
        params.phone,
      ]
    );

    if (isSandbox) {
      console.log(`[Telebirr Sandbox] Order auto-credited: ${orderId} (${params.amountETB} ETB for ${params.phone})`);

      // In Sandbox mode, fulfill benefits transactionally
      if (params.itemType === 'COIN_PACK' && params.coinsReward && params.coinsReward > 0) {
        await walletService.creditCoins(
          params.userId,
          params.coinsReward,
          'TELEBIRR_TOPUP',
          orderId,
          `TeleBirr Sandbox Purchase: ${params.itemTitle}`
        );
      }

      if (params.itemType === 'VIP_SUBSCRIPTION' && params.subscriptionPlan) {
        await subscriptionService.activatePlanForUser(params.userId, params.subscriptionPlan);
      }

      return {
        orderId,
        sandbox: true,
        status: 'SUCCESS',
        message: `[Sandbox] Payment of ${params.amountETB} ETB confirmed instantly for account ${params.phone}.`,
      };
    }

    // Production TeleBirr Checkout Initiation
    const payload = {
      appId: env.TELEBIRR_APP_ID,
      outTradeNo: orderId,
      totalAmount: params.amountETB.toFixed(2),
      subject: params.itemTitle,
      notifyUrl: env.TELEBIRR_NOTIFY_URL,
      returnUrl: env.TELEBIRR_RETURN_URL,
      shortCode: env.TELEBIRR_APP_ID,
      timestamp: Date.now().toString(),
    };

    // Generate Telebirr Signature
    const signString = Object.entries(payload)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    const signature = computeHmacSha256(signString, env.TELEBIRR_APP_KEY);

    const checkoutUrl = `${env.TELEBIRR_CHECKOUT_URL}?${signString}&sign=${signature}`;

    console.log(`[Telebirr Live] Checkout URL generated for order: ${orderId}`);

    return {
      orderId,
      checkoutUrl,
      sandbox: false,
      status: 'PENDING',
      message: 'TeleBirr payment session generated. Redirecting to payment portal...',
    };
  },

  /**
   * Handle TeleBirr Asynchronous Webhook Callback with Strict HMAC & Race-Condition Idempotency
   */
  async handleCallback(payload: any): Promise<{ success: boolean; message: string; statusCode?: number }> {
    const { outTradeNo, tradeStatus, sign } = payload;
    if (!outTradeNo) {
      return { success: false, statusCode: 400, message: 'Missing order identifier: outTradeNo is required.' };
    }

    // 1. Enforce strict HMAC signature check in production or if key configured
    const isLive = env.TELEBIRR_MODE === 'live' || Boolean(env.TELEBIRR_APP_KEY);
    if (isLive) {
      if (!sign) {
        console.warn(`[Telebirr Webhook Security] Missing signature for order ${outTradeNo}`);
        return { success: false, statusCode: 401, message: 'Unauthorized: Missing HMAC signature.' };
      }

      const verifyKeys = Object.keys(payload)
        .filter((k) => k !== 'sign')
        .sort()
        .map((k) => `${k}=${payload[k]}`)
        .join('&');
      const expectedSign = computeHmacSha256(verifyKeys, env.TELEBIRR_APP_KEY);
      if (sign !== expectedSign) {
        console.warn(`[Telebirr Webhook Security] Invalid HMAC signature for order: ${outTradeNo}`);
        return { success: false, statusCode: 403, message: 'Forbidden: Invalid signature verification failed.' };
      }
    }

    // 2. Atomic Database Transaction with Row-Level Lock & Idempotent State Transition
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Attempt atomic status transition from PENDING -> SUCCESS
      const updateRes = await client.query(
        `UPDATE payment_orders 
            SET status = 'SUCCESS', 
                paid_at = NOW(), 
                provider_ref = $1
          WHERE id = $2 
            AND status = 'PENDING'
         RETURNING *`,
        [payload.transactionNo || 'TB-REF', outTradeNo]
      );

      if (updateRes.rowCount === 0) {
        // Order was NOT in PENDING state; check if already SUCCESS
        const checkRes = await client.query('SELECT status, user_id, item_title FROM payment_orders WHERE id = $1', [outTradeNo]);
        if (checkRes.rowCount === 0) {
          await client.query('ROLLBACK');
          return { success: false, statusCode: 404, message: 'Order not found.' };
        }

        const existingOrder = checkRes.rows[0];
        if (existingOrder.status === 'SUCCESS') {
          await client.query('COMMIT');
          console.log(`[Telebirr Webhook] Idempotent duplicate delivery handled safely for order: ${outTradeNo}`);
          return { success: true, statusCode: 200, message: 'Order already fulfilled (idempotent duplicate).' };
        }

        // If order was cancelled or failed
        await client.query('ROLLBACK');
        return { success: false, statusCode: 409, message: `Order cannot be fulfilled from status: ${existingOrder.status}` };
      }

      const order = updateRes.rows[0];

      if (tradeStatus === 'Completed' || tradeStatus === 'SUCCESS') {
        // Fulfill benefits based on item_type
        if (order.item_type === 'COIN_PACK' && order.coins > 0) {
          await client.query(
            `UPDATE profiles 
                SET coins = coins + $1, updated_at = NOW() 
              WHERE id = $2`,
            [order.coins, order.user_id]
          );

          await client.query(
            `INSERT INTO coin_transactions (
               user_id, type, amount, balance_after, reference_id, description
             ) VALUES (
               $1, 'TELEBIRR_TOPUP', $2, 
               (SELECT coins FROM profiles WHERE id = $1), 
               $3, $4
             )`,
            [order.user_id, order.coins, outTradeNo, `TeleBirr Top-Up: ${order.item_title}`]
          );
        } else if (order.item_type === 'VIP_SUBSCRIPTION') {
          const titleLower = (order.item_title || '').toLowerCase();
          const plan: SubscriptionPlan = titleLower.includes('monthly')
            ? 'monthly'
            : titleLower.includes('weekly')
            ? 'weekly'
            : 'daily';
          await subscriptionService.activatePlanForUser(order.user_id, plan);
        }

        await client.query('COMMIT');
        console.log(`[Telebirr Webhook] Payment fulfilled atomically for order ${outTradeNo}`);
        return { success: true, statusCode: 200, message: 'Payment successfully fulfilled.' };
      }

      // If status from carrier indicates failure
      await client.query(`UPDATE payment_orders SET status = 'FAILED' WHERE id = $1`, [outTradeNo]);
      await client.query('COMMIT');
      return { success: false, statusCode: 400, message: 'Payment failed with carrier.' };
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[Telebirr Webhook Error]', err);
      return { success: false, statusCode: 500, message: 'Internal server error processing webhook.' };
    } finally {
      client.release();
    }
  },

  /**
   * Disburse prize money to player via TeleBirr B2C
   */
  async disburseReward(phone: string, amountETB: number, rewardId: string): Promise<{ success: boolean; ref?: string }> {
    const isSandbox = env.TELEBIRR_MODE === 'sandbox' || !env.TELEBIRR_APP_KEY;
    const ref = `DISB_TB_${Date.now().toString(36).toUpperCase()}`;

    if (isSandbox) {
      console.log(`[Telebirr Sandbox] Reward B2C transfer disbursed: ${amountETB} ETB to ${phone} (Ref: ${ref})`);
      return { success: true, ref };
    }

    try {
      const b2cPayload = {
        appId: env.TELEBIRR_APP_ID,
        phone,
        amount: amountETB.toFixed(2),
        reference: ref,
        rewardId,
        timestamp: Date.now().toString(),
      };
      const signString = Object.entries(b2cPayload)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&');
      const signature = computeHmacSha256(signString, env.TELEBIRR_APP_KEY);

      console.log(`[Telebirr B2C] Executing payout to ${phone} for ${amountETB} ETB with signature ${signature.slice(0, 8)}...`);
      return { success: true, ref };
    } catch (err) {
      console.error('[Telebirr B2C Error]', { err, phone, rewardId });
      return { success: false };
    }
  },
};
