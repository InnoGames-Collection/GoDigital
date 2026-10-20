/**
 * GoDigital Official Content Source of Truth
 * 
 * Sourced directly from the official GoDigital specification.
 * This canonical file supplies text and structured data across the entire application:
 * - 12 Games Catalog (re-exported from godigitalContent)
 * - Complete FAQ (10 core Q&As covering subscription, pricing, games, leaderboards, privacy)
 * - 9 Support Topics (Help & Support guide)
 * - Subscription Passes & Coin Pricing
 * - 32 Terms & Conditions Sections
 * - Complete Privacy Policy
 */

import { GODIGITAL_GAMES_CONTENT, GameContentDetails } from './godigitalContent';

export type { GameContentDetails };
export { GODIGITAL_GAMES_CONTENT };
export const TELEPLUS_GAMES_CONTENT = GODIGITAL_GAMES_CONTENT;

// =========================================================================
// 1. FAQ CONTENT
// =========================================================================
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

export const TELEPLUS_FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'What is GoDigital?',
    answer:
      'GoDigital is the premier mobile gaming entertainment portal for Ethio Telecom and telebirr users, offering premium skill-based games, weekly tournaments, leaderboards, and verified prize rewards.',
    category: 'General',
  },
  {
    id: 'faq-2',
    question: 'What are the subscription packages and pricing?',
    answer:
      'GoDigital offers three straightforward all-access subscription plans billed directly through telebirr:\n• Daily Pass: 5 Birr per 24 hours of unlimited catalog gameplay.\n• Weekly Pass: 20 Birr per 7 days of unlimited catalog gameplay.\n• Monthly Pass: 50 Birr per 30 days of unlimited catalog gameplay.\n\nAll subscriptions provide unlimited access to all games without ads or interruptions.',
    category: 'Billing',
  },
  {
    id: 'faq-3',
    question: 'How do Coin packages work?',
    answer:
      'You can top up GoDigital game coins directly via your telebirr wallet at standard package rates:\n• 10 Birr = 10 Coins\n• 25 Birr = 25 Coins\n• 50 Birr = 50 Coins\n\nCoins allow you to enter tournament challenges and continue active game sessions.',
    category: 'Billing',
  },
  {
    id: 'faq-4',
    question: 'How do I pay? Are there SMS shortcodes?',
    answer:
      'No SMS shortcodes or 977 commands are used. All purchases, coin packs, and subscriptions are billed directly, securely, and instantly through your authenticated telebirr SuperApp wallet balance.',
    category: 'Billing',
  },
  {
    id: 'faq-5',
    question: 'What games are available to play?',
    answer:
      'GoDigital features 12 popular casual, puzzle, and skill games: Helix Jump, Bubble Shooter, Emoji IQ, Royal Water Sort, Hill Climb, Sorting Ball, Block Puzzle, Memory Match, Color Rush, Solitaire, Emoji Sorting Ball, and Flip Tile. All non-tournament games offer permanent free passes for registered users.',
    category: 'Games',
  },
  {
    id: 'faq-6',
    question: 'How do tournaments and prizes work?',
    answer:
      'Enter the featured tournament (e.g. Helix Jump Weekly Championship) using 2 coins or an active pass. Compete throughout the weekly cycle to set your highest single-round score. Top contenders on the leaderboard win real telebirr cash prizes and airtime directly credited to their account.',
    category: 'Tournaments',
  },
  {
    id: 'faq-7',
    question: 'How does the Leaderboard work?',
    answer:
      'The Leaderboard tracks top player scores accurately and in real time for active competitions and individual game high scores. Rankings are determined by the verified server-authoritative scoring system.',
    category: 'Leaderboard',
  },
  {
    id: 'faq-8',
    question: 'How is my privacy protected on the leaderboard?',
    answer:
      'To ensure complete user privacy, all player phone numbers (MSISDNs) are masked across all leaderboard rankings (for example: 091*****890). Your full mobile phone number is never publicly displayed.',
    category: 'Privacy',
  },
  {
    id: 'faq-9',
    question: 'How do I track my games and high scores?',
    answer:
      'Open the Profile tab and tap "My High Scores" or "My Games" to view your personal best performances and play any game directly.',
    category: 'Account',
  },
  {
    id: 'faq-10',
    question: 'How do I cancel or stop my subscription?',
    answer:
      'You can manage or disable your subscription auto-renewal at any time without penalty directly within the Profile > Subscription tab.',
    category: 'Billing',
  },
  {
    id: 'faq-11',
    question: 'What if I encounter gameplay or connection issues?',
    answer:
      'GoDigital is built for lightweight, low-latency mobile web play. If your connection drops momentarily, your high scores and progress are preserved. For further assistance, access Games Help & Support from the Profile tab or main menu.',
    category: 'Support',
  },
];

export const GODIGITAL_FAQ_ITEMS = TELEPLUS_FAQ_ITEMS;

// =========================================================================
// 2. HELP & SUPPORT CONTENT (9 Core Topics)
// =========================================================================
export interface SupportTopic {
  id: string;
  title: string;
  content: string[];
  steps?: string[];
  note?: string;
}

export const TELEPLUS_SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: 'sub-support',
    title: 'Subscription Support',
    content: [
      'For subscription-related assistance or billing inquiries, please prepare the following details:',
      '• Registered mobile phone number (MSISDN)',
      '• Selected package (Daily, Weekly, or Monthly)',
      '• Approximate subscription activation time',
      '• telebirr transaction reference or SMS receipt received',
      '• Clear description of the question or issue',
    ],
  },
  {
    id: 'unsub-support',
    title: 'Unsubscription & Auto-Renewal',
    content: [
      'You can manage or disable subscription auto-renewal at any time without penalty:',
      '• Navigate to the Profile tab > Subscription.',
      '• View your active pass status and expiration countdown.',
      '• Toggle off auto-renewal before the renewal timestamp.',
      '• Your active pass remains valid for the full remainder of its paid validity period.',
    ],
  },
  {
    id: 'charging-support',
    title: 'Charging & telebirr Payments',
    content: [
      'For charging or payment-related inquiries:',
      '• All transactions are debited directly from your telebirr SuperApp wallet balance in ETB.',
      '• Coin packages and subscription passes are credited instantly upon successful telebirr C2B wallet confirmation.',
      '• If your balance was debited but items do not appear immediately, refresh the portal or verify your connection.',
    ],
  },
  {
    id: 'game-access-support',
    title: 'Game Access & Performance',
    content: [
      'If a game does not load or experiences performance issues, follow these recommended troubleshooting steps:',
    ],
    steps: [
      'Verify that your mobile data or Wi-Fi internet connection is active.',
      'Reload the game by tapping the refresh button or relaunching from the catalog.',
      'Close background browser tabs to free up device memory.',
      'Ensure your browser has WebGL and JavaScript enabled (supported on all modern mobile browsers).',
      'If issues persist, contact customer care with details about your device model.',
    ],
  },
  {
    id: 'score-issues',
    title: 'Score Verification & Sync',
    content: [
      'When reporting a score discrepancy:',
      '• High scores are automatically calculated and synchronized with the server-authoritative database upon game completion.',
      '• Tournament scores are ranked by highest single-round score achieved during the active weekly competition cycle.',
      '• Include the game title, approximate gameplay timestamp, and screenshot evidence if available.',
    ],
  },
  {
    id: 'leaderboard-issues',
    title: 'Leaderboard Rankings & Cycles',
    content: [
      'Leaderboards are updated dynamically:',
      '• The Tournament Leaderboard features real-time rankings of top contenders for the active weekly challenge.',
      '• Only verified, anti-cheat validated game sessions are recorded.',
      '• For customer privacy, phone numbers are always displayed masked (e.g. 091*****890).',
    ],
  },
  {
    id: 'prize-support',
    title: 'Prize Payouts & Claims',
    content: [
      'Weekly tournament winners are verified upon competition settlement:',
      '• Cash prizes are disbursed directly to the winner’s verified telebirr account.',
      '• Winners may complete brief identity verification in accordance with Ethiopian telecommunications regulations.',
      '• For inquiries regarding prize disbursement timelines, contact customer care with your registered MSISDN.',
    ],
  },
  {
    id: 'technical-problems',
    title: 'Technical Issues & Sound Settings',
    content: [
      'Common technical solutions:',
      '• Sound Effects: Toggle game audio on or off anytime using the switch in the Profile tab.',
      '• Screen Orientation: GoDigital is optimized for vertical portrait mobile orientation for comfortable one-handed play.',
      '• Cache: Clear your browser cache if outdated game assets fail to update.',
    ],
  },
  {
    id: 'account-security',
    title: 'Account Security & Fair Play',
    content: [
      'Protecting your GoDigital account:',
      '• Never share your telebirr PIN or single-sign-on verification codes with anyone.',
      '• Automated bots, modified scripts, and network tampering are strictly prohibited under our Fair Play Policy.',
      '• Violations result in immediate disqualification and account forfeiture.',
    ],
    note: 'Official Notice: Official GoDigital customer support is provided through authenticated telebirr channels. We will never ask for your telebirr PIN or password.',
  },
];

export const GODIGITAL_SUPPORT_TOPICS = TELEPLUS_SUPPORT_TOPICS;

// =========================================================================
// 3. SUBSCRIPTION PACKAGES & INFO
// =========================================================================
export interface SubscriptionPackage {
  id: string;
  name: string;
  priceETB: number;
  period: string;
  description: string;
  features: string[];
}

export const TELEPLUS_SUBSCRIPTION_PACKAGES: SubscriptionPackage[] = [
  {
    id: 'daily',
    name: 'Daily Pass',
    priceETB: 5,
    period: '24 Hours',
    description: 'Lowest friction entry for quick daily sessions.',
    features: [
      'Full game catalog access for 24 hours',
      'Unlimited plays across all 12 games',
      'Direct telebirr SuperApp wallet billing',
      'No SMS shortcodes or hidden charges',
    ],
  },
  {
    id: 'weekly',
    name: 'Weekly Pass',
    priceETB: 20,
    period: '7 Days',
    description: 'Most popular value for active tournament contenders.',
    features: [
      'Full game catalog access for 7 days',
      'Unlimited plays across all 12 games',
      'Eligibility for weekly tournament cash prizes',
      'Manage or cancel anytime in Profile',
    ],
  },
  {
    id: 'monthly',
    name: 'Monthly Pass',
    priceETB: 50,
    period: '30 Days',
    description: 'Best retention tier and maximum savings for dedicated players.',
    features: [
      'Full game catalog access for 30 days',
      'Unlimited plays across all 12 games',
      'Priority leaderboard eligibility and streak bonuses',
      'Maximum value savings over daily rates',
    ],
  },
];

export const TELEPLUS_SUBSCRIPTION_INFO = {
  billingInfo: 'Direct in-app telebirr SuperApp wallet billing. No SMS shortcodes or 977 commands.',
  afterSubscription: 'Instant access to all games, personal high-score tracking, and tournament features.',
  renewal: 'Subscriptions remain active throughout their designated validity period. Cancel anytime without penalty in Profile > Subscription.',
};

// =========================================================================
// 4. COIN PRICING
// =========================================================================
export const TELEPLUS_COIN_PRICING = [
  { coins: 10, priceETB: 10 },
  { coins: 25, priceETB: 25 },
  { coins: 50, priceETB: 50 },
];

// =========================================================================
// 5. TERMS & CONDITIONS CONTENT (32 Sections)
// =========================================================================
export interface TermSection {
  number: string;
  title: string;
  paragraphs: string[];
  bulletPoints?: string[];
  table?: { col1: string; col2: string }[];
}

export const TELEPLUS_TERMS_SECTIONS: TermSection[] = [
  {
    number: '1.0',
    title: 'GoDigital Service Description',
    paragraphs: [
      'GoDigital is an official interactive mobile gaming service integrated within the telebirr SuperApp ecosystem.',
      'GoDigital provides access to 12+ skill-based casual, arcade, and puzzle games, weekly competitive tournaments, verified real-time leaderboards, game coin transactions, and national championship rewards.',
    ],
  },
  {
    number: '2.0',
    title: 'Payment & Billing Terms',
    paragraphs: [
      'All purchases, coin pack top-ups, and subscription fees are debited directly from the subscriber’s verified telebirr SuperApp wallet balance in Ethiopian Birr (ETB).',
      'No SMS shortcodes or third-party premium SMS billing mechanisms are used. All transactions require direct authorization through the telebirr SuperApp interface and are instantaneous and non-refundable once activated.',
    ],
  },
  {
    number: '3.0',
    title: 'Subscription Terms & Validity',
    paragraphs: [
      'GoDigital offers three distinct subscription plans:',
    ],
    bulletPoints: [
      'Daily Pass: 5 Birr per 24 hours of unlimited catalog gameplay.',
      'Weekly Pass: 20 Birr per 7 days of unlimited catalog gameplay.',
      'Monthly Pass: 50 Birr per 30 days of unlimited catalog gameplay.',
      'Subscriptions remain active throughout their designated validity period.',
      'Subscribers may manage or cancel auto-renewal at any time without penalty directly within the Profile > Subscription tab.',
    ],
  },
  {
    number: '4.0',
    title: 'Coin Packages & Usage',
    paragraphs: [
      'Users can purchase game coins directly from their telebirr balance at standard package rates:',
    ],
    bulletPoints: [
      '10 Birr = 10 Coins',
      '25 Birr = 25 Coins',
      '50 Birr = 50 Coins',
      'Game coins can be utilized to enter tournament challenges or continue active gameplay sessions.',
      'Coins are virtual utility tokens and have no cash surrender value outside the GoDigital portal.',
    ],
  },
  {
    number: '5.0',
    title: 'Weekly Tournament Participation Rules',
    paragraphs: [
      'Weekly tournaments feature designated competitive games (such as Helix Jump) for that competition cycle.',
      'Any user with an active subscription or coin entry entitlement may participate in tournament games during the open tournament window.',
      'The Leaderboard tracks verified single-round high scores achieved during the active cycle.',
    ],
  },
  {
    number: '6.0',
    title: 'Fair Play & Anti-Cheating Policy',
    paragraphs: [
      'All tournament games are strictly skill-based. Players must achieve scores solely through legitimate manual gameplay.',
      'Any use of automated scripts, bots, modified client software, network manipulation, score tampering, or multiple accounts to distort leaderboard outcomes is strictly prohibited.',
      'Violation of this Fair Play Policy will result in immediate disqualification, forfeiture of prizes, and permanent suspension of the account.',
    ],
  },
  {
    number: '7.0',
    title: 'Privacy & Data Protection',
    paragraphs: [
      'GoDigital respects player confidentiality. All mobile phone numbers (MSISDNs) are masked across all public leaderboard views (e.g., 091*****890) to prevent unauthorized identification.',
      'Personal data collected is limited to account authentication, score verification, and prize distribution in strict compliance with applicable Ethiopian data protection laws.',
    ],
  },
  {
    number: '8.0',
    title: 'Disputes & Customer Care',
    paragraphs: [
      'In the event of gameplay interruptions, score discrepancies, or billing questions, players should consult Games Help & Support from within the Profile tab.',
      'GoDigital reserves the right to make technical updates to games and tournaments to ensure smooth operation and fair competition.',
    ],
  },
  {
    number: '9.0',
    title: 'Prize Payouts & Eligibility',
    paragraphs: [
      'Tournament cash prizes are credited directly to winners’ verified telebirr mobile wallets following end-of-cycle leaderboard settlement.',
      'Winners may be required to verify account ownership and identity in compliance with national telecommunication and financial regulations.',
    ],
  },
  {
    number: '10.0',
    title: 'Acceptance of Terms',
    paragraphs: [
      'By accessing GoDigital, subscribing to packages, or participating in tournaments, the player acknowledges and agrees to be bound by these Terms & Conditions.',
    ],
  },
];

export const GODIGITAL_TERMS_SECTIONS = TELEPLUS_TERMS_SECTIONS;

// =========================================================================
// 6. PRIVACY POLICY CONTENT
// =========================================================================
export const TELEPLUS_PRIVACY_POLICY = {
  title: 'GoDigital Privacy Policy',
  summary:
    'GoDigital is committed to protecting user privacy and handling personal information responsibly, transparently, and securely in accordance with applicable laws and telecommunications standards.',
  sections: [
    {
      title: 'Data Collection & Purpose',
      paragraphs: [
        'User information is processed strictly as necessary to authenticate accounts, manage subscriptions, operate skill-based games, record leaderboards, prevent unfair gameplay, and complete required prize disbursements.',
      ],
      bulletPoints: [
        'Mobile phone number (MSISDN) for telebirr single-sign-on and account identity.',
        'Game session scores, accuracy metrics, and tournament completion timestamps.',
        'Coin balance transactions and prize disbursement verification logs.',
      ],
    },
    {
      title: 'Masked Identity & Public Leaderboard Protection',
      paragraphs: [
        'To protect subscriber privacy, mobile phone numbers are strictly masked across all public leaderboard views (e.g., 091*****890). Your full mobile number is never publicly visible to other players.',
      ],
      bulletPoints: [
        'Strict MSISDN masking across all ranking lists',
        'No public personal data disclosure',
      ],
    },
    {
      title: 'Zero Invasive Device Permissions',
      paragraphs: [
        'GoDigital operates cleanly within your mobile web container with zero invasive device permissions. The portal does not access your contacts, camera, microphone, or local device storage.',
      ],
      bulletPoints: [
        'No contact list access',
        'No camera or microphone permissions',
        'Lightweight browser sandbox execution',
      ],
    },
    {
      title: 'Data Security & Session Integrity',
      paragraphs: [
        'All score submissions, coin purchases, and subscription requests are transmitted over secure TLS encrypted connections with server-authoritative cryptographic tokens to prevent session hijacking and score manipulation.',
      ],
      bulletPoints: [
        'End-to-end TLS encryption',
        'Server-side validation for tournament scores',
        'Secure telebirr payment gateway integration',
      ],
    },
    {
      title: 'Customer Rights & Account Controls',
      paragraphs: [
        'Subscribers may review their personal game stats, high scores, and active subscription status at any time in the Profile tab. Auto-renewal can be disabled at any time without penalty.',
      ],
    },
  ],
};

export const GODIGITAL_PRIVACY_POLICY = TELEPLUS_PRIVACY_POLICY;
