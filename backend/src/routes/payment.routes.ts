import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { telebirrService } from '../services/telebirrService.js';
import { query } from '../config/database.js';
import { SubscriptionPlan } from '../types/domain.js';

interface ValidCatalogItem {
  itemType: 'COIN_PACK' | 'VIP_SUBSCRIPTION' | 'ENERGY_PACK';
  amountETB: number;
  itemTitle: string;
  coinsReward?: number;
  subscriptionPlan?: SubscriptionPlan;
}

const PRICING_CATALOG: Record<string, ValidCatalogItem> = {
  PLAN_DAILY: {
    itemType: 'VIP_SUBSCRIPTION',
    amountETB: 3,
    itemTitle: 'GoDigital Daily VIP Pass (3 ETB)',
    subscriptionPlan: 'daily',
  },
  PLAN_WEEKLY: {
    itemType: 'VIP_SUBSCRIPTION',
    amountETB: 10,
    itemTitle: 'GoDigital Weekly VIP Pass (10 ETB)',
    subscriptionPlan: 'weekly',
  },
  PLAN_MONTHLY: {
    itemType: 'VIP_SUBSCRIPTION',
    amountETB: 30,
    itemTitle: 'GoDigital Monthly VIP Pass (30 ETB)',
    subscriptionPlan: 'monthly',
  },
  ENERGY_PACK_5: {
    itemType: 'ENERGY_PACK',
    amountETB: 5,
    itemTitle: '5 Energy Hearts Refill (5 ETB)',
  },
  COIN_PACK_10: {
    itemType: 'COIN_PACK',
    amountETB: 10,
    itemTitle: '10 GoDigital Coins (10 ETB)',
    coinsReward: 10,
  },
};

export async function paymentRoutes(fastify: FastifyInstance) {
  // Public Telebirr Webhook Callback (No user JWT required)
  fastify.post('/webhook', async (request, reply) => {
    const payload = request.body || {};
    const result = await telebirrService.handleCallback(payload);
    const statusCode = result.statusCode || (result.success ? 200 : 400);
    return reply.status(statusCode).send(result);
  });

  // Authenticated User Payment Routes
  fastify.register(async (authScope) => {
    authScope.addHook('preHandler', requireAuth);

    // Process / Initiate payment strictly via Telebirr
    authScope.post('/process', async (request, reply) => {
      const userId = request.user!.userId;
      const phone = request.user!.phone;
      const body = (request.body || {}) as {
        packageId?: string;
        itemType?: 'VIP_SUBSCRIPTION' | 'COIN_PACK' | 'ENERGY_PACK';
        plan?: SubscriptionPlan;
      };

      let catalogItem: ValidCatalogItem | undefined;

      if (body.packageId && PRICING_CATALOG[body.packageId]) {
        catalogItem = PRICING_CATALOG[body.packageId];
      } else if (body.itemType === 'COIN_PACK') {
        catalogItem = PRICING_CATALOG.COIN_PACK_10;
      } else if (body.itemType === 'ENERGY_PACK') {
        catalogItem = PRICING_CATALOG.ENERGY_PACK_5;
      } else if (body.itemType === 'VIP_SUBSCRIPTION') {
        if (body.plan === 'daily') catalogItem = PRICING_CATALOG.PLAN_DAILY;
        else if (body.plan === 'weekly') catalogItem = PRICING_CATALOG.PLAN_WEEKLY;
        else if (body.plan === 'monthly') catalogItem = PRICING_CATALOG.PLAN_MONTHLY;
      }

      if (!catalogItem) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid purchase item. Please select a valid TeleBirr VIP pass or energy pack.',
        });
      }

      const result = await telebirrService.initiatePayment({
        userId,
        phone,
        amountETB: catalogItem.amountETB,
        itemType: catalogItem.itemType,
        itemTitle: catalogItem.itemTitle,
        coinsReward: catalogItem.coinsReward,
        subscriptionPlan: catalogItem.subscriptionPlan,
      });

      return reply.send({
        status: result.status,
        transaction: {
          transactionId: result.orderId,
          method: 'TELEBIRR',
          amountETB: catalogItem.amountETB,
          itemType: catalogItem.itemType,
          itemTitle: catalogItem.itemTitle,
          status: result.status,
          timestamp: new Date().toISOString(),
        },
        checkoutUrl: result.checkoutUrl,
        message: result.message,
      });
    });

    // Payment history
    authScope.get('/history', async (request, reply) => {
      const userId = request.user!.userId;
      const res = await query(
        `SELECT id, method, amount_etb, item_type, item_title, status, created_at, msisdn_masked
           FROM payment_orders
          WHERE user_id = $1
          ORDER BY created_at DESC LIMIT 50`,
        [userId]
      );

      return reply.send(
        res.rows.map((r: any) => ({
          transactionId: r.id,
          method: r.method,
          amountETB: parseFloat(r.amount_etb),
          itemType: r.item_type,
          itemTitle: r.item_title,
          status: r.status,
          timestamp: r.created_at,
          msisdnMasked: r.msisdn_masked,
        }))
      );
    });
  });
}
