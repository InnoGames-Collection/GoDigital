import { query } from '../config/database.js';
import { authService } from './authService.js';
import { SubscriptionPlan, UserProfile } from '../types/domain.js';

export interface PlanDetails {
  id: SubscriptionPlan;
  title: string;
  name: string;
  priceETB: number;
  durationLabel: string;
  durationDays: number;
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  badge?: string;
}

export const SUBSCRIPTION_PLANS: PlanDetails[] = [
  {
    id: 'daily',
    title: 'Daily VIP Pass',
    name: 'Daily Pass',
    priceETB: 3,
    durationLabel: '24 Hours (3 ETB)',
    durationDays: 1,
    badge: 'Daily',
    features: ['Unlimited casual games access for 24h', 'Infinite Energy Refill', 'telebirr Instant Checkout'],
  },
  {
    id: 'weekly',
    title: 'Weekly VIP Pass',
    name: 'Weekly Pass',
    priceETB: 10,
    durationLabel: '7 Days (10 ETB)',
    durationDays: 7,
    popular: true,
    recommended: true,
    badge: 'Popular',
    features: ['Unlimited casual games access for 7 days', 'Infinite Energy + Double XP', 'telebirr Instant Checkout'],
  },
  {
    id: 'monthly',
    title: 'Monthly VIP Champion',
    name: 'Monthly Pass',
    priceETB: 30,
    durationLabel: '30 Days (30 ETB)',
    durationDays: 30,
    badge: 'Best Value',
    features: ['Unlimited casual games access for 30 days', 'Infinite Energy + VIP Profile Badge', 'telebirr Instant Checkout'],
  },
];

export const subscriptionService = {
  getPlans(): PlanDetails[] {
    return SUBSCRIPTION_PLANS;
  },

  async subscribe(
    userId: string,
    plan: SubscriptionPlan
  ): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
    return this.activatePlanForUser(userId, plan);
  },

  async activatePlanForUser(
    userId: string,
    plan: SubscriptionPlan
  ): Promise<{ success: boolean; message: string; profile?: UserProfile }> {
    const planDetail = SUBSCRIPTION_PLANS.find((p) => p.id === plan);
    if (!planDetail) {
      return { success: false, message: 'Invalid subscription plan selected.' };
    }

    const durationMs = planDetail.durationDays * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(Date.now() + durationMs);

    const userRes = await query('SELECT phone FROM profiles WHERE id = $1', [userId]);
    const phone = userRes.rows[0]?.phone || '';

    // Record / Update subscription in PostgreSQL
    await query(
      `INSERT INTO subscriptions (user_id, msisdn, service_id, plan, is_active, auto_renew, expires_at)
       VALUES ($1, $2, 'srv_godigital', $3, TRUE, TRUE, $4)
       ON CONFLICT (msisdn, service_id) DO UPDATE
         SET user_id = EXCLUDED.user_id, is_active = TRUE, plan = EXCLUDED.plan,
             expires_at = EXCLUDED.expires_at, auto_renew = TRUE`,
      [userId, phone, plan, expiresAt]
    );

    const updatedProfile = await authService.getProfile(userId);
    console.log(`[Subscription Activated] User ${userId} subscribed to ${plan} until ${expiresAt}`);

    return {
      success: true,
      message: `Successfully activated ${planDetail.title} via telebirr!`,
      profile: updatedProfile!,
    };
  },

  async cancelSubscription(userId: string): Promise<{ success: boolean; message: string; profile: UserProfile }> {
    await query(
      `UPDATE subscriptions SET auto_renew = FALSE, cancelled_at = NOW() WHERE user_id = $1`,
      [userId]
    );

    const profile = (await authService.getProfile(userId))!;

    return {
      success: true,
      message: 'Automatic subscription renewal disabled. Your active pass will remain valid until expiration.',
      profile,
    };
  },
};
