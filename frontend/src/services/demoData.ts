/**
 * ============================================================================
 * Production VAS Metadata & Initial State Definitions
 * Contains baseline guest template, daily streak reward ladder, and telecom ads.
 * ============================================================================
 */

import { UserProfile, DailyRewardItem } from '../types';

export const INITIAL_GUEST_PROFILE: UserProfile = {
  id: 'usr_guest_initial',
  phoneNumber: '',
  displayName: 'Guest Player',
  avatarId: 'avatar_runner',
  isRegistered: false,
  telebirrLinked: false,
  telebirrBalance: 0,
  coins: 0,
  xp: 0,
  level: 1,
  energy: 5,
  maxEnergy: 5,
  lastEnergyRefillTimestamp: Date.now(),
  subscription: {
    plan: 'free',
    isActive: false,
    autoRenew: false,
  },
  streak: {
    current: 1,
    lastClaimedDate: '',
    hasClaimedToday: false,
  },
  highScores: {},
  achievements: [],
  matchesPlayed: 0,
  trophiesCount: 0,
};

/**
 * 7-Day Daily Streak Reward Ladder (synchronized with backend streak bonuses)
 */
export const DAILY_REWARD_LADDER: DailyRewardItem[] = [
  { day: 1, coins: 50, energy: 1, badge: 'Novice Day' },
  { day: 2, coins: 100, energy: 1, badge: 'Double Boost' },
  { day: 3, coins: 150, energy: 2, badge: 'Streak Power' },
  { day: 4, coins: 250, energy: 2, badge: 'Bronze Rank' },
  { day: 5, coins: 400, energy: 3, badge: 'Silver Tier' },
  { day: 6, coins: 600, energy: 3, badge: 'Gold Rush' },
  { day: 7, coins: 1200, energy: 5, badge: 'Walia Grand Chest', special: true },
];

/**
 * Rewarded Ads Catalog (EthioTelecom & TeleBirr sponsored VAS placements)
 */
export const DEMO_TELECOM_ADS = [
  {
    id: 'ad_telebirr_superapp',
    brand: 'TeleBirr SuperApp',
    title: 'Pay bills, send money & earn cashbacks instantly!',
    tagline: 'Ethiopia’s #1 Digital Payment Lifestyle Platform',
    videoBanner: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 5,
    ctaText: 'Open TeleBirr SuperApp',
    accentColor: '#70C922',
  },
  {
    id: 'ad_ethio_5g_router',
    brand: 'EthioTelecom 5G Ultra Broadband',
    title: 'Experience blistering Gigabit speeds across 120+ cities!',
    tagline: 'Connect your home & gaming stations with 0-ping latency',
    videoBanner: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 5,
    ctaText: 'Upgrade to 5G Now',
    accentColor: '#0B3B70',
  },
  {
    id: 'ad_ethio_youth_package',
    brand: 'EthioTelecom Youth Chill Pack',
    title: 'Unlimited Social Media + 10GB Gaming Data at just 50 ETB',
    tagline: 'Empowering the next generation of digital creators',
    videoBanner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80',
    durationSeconds: 5,
    ctaText: 'Dial *999# to Subscribe',
    accentColor: '#70C922',
  },
];
