/**
 * GoDigital Content Compatibility & Support/FAQ/Privacy Provider
 */

import { GODIGITAL_GAMES_CONTENT, GameContentDetails } from './godigitalContent';

export type { GameContentDetails };
export { GODIGITAL_GAMES_CONTENT };
export const TELEPLUS_GAMES_CONTENT = GODIGITAL_GAMES_CONTENT;

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
    answer: 'GoDigital is a telebirr SuperApp puzzle, skill, and brain gaming entertainment service providing tournament challenges and instant free passes.'
  },
  {
    id: 'faq-2',
    question: 'What games are available?',
    answer: 'GoDigital offers 12 puzzle and brain games including Helix Jump, Bubble Shooter, Emoji IQ, Royal Water Sort, and Hill Climb.'
  },
  {
    id: 'faq-3',
    question: 'How do tournaments work?',
    answer: 'Enter the Helix Jump weekly tournament using 2 coins. Top contenders win telebirr cash prizes and airtime.'
  },
  {
    id: 'faq-4',
    question: 'Are other games free to play?',
    answer: 'Yes! All non-tournament puzzle and brain games are permanent free passes for all registered users.'
  },
  {
    id: 'faq-5',
    question: 'How do I buy coins?',
    answer: 'Click the + button next to your coins balance in the header to purchase coin packages directly via your telebirr wallet.'
  }
];

export const GODIGITAL_FAQ_ITEMS = TELEPLUS_FAQ_ITEMS;

export interface SupportTopic {
  id: string;
  title: string;
  content: string[];
  steps?: string[];
  note?: string;
}

export const TELEPLUS_SUPPORT_TOPICS: SupportTopic[] = [
  {
    id: 'gameplay-help',
    title: 'Gameplay & Scoring',
    content: [
      'Scores are automatically synchronized with the authoritative database.',
      'Tournament scores are ranked by highest single-round score achieved during the active weekly cycle.'
    ]
  },
  {
    id: 'payment-help',
    title: 'Telebirr Payments & Topups',
    content: [
      'Coins are credited instantly upon successful telebirr C2B wallet confirmation.',
      'If you experience payment delays, refresh the application or contact telebirr customer care.'
    ]
  }
];

export const GODIGITAL_SUPPORT_TOPICS = TELEPLUS_SUPPORT_TOPICS;

export const TELEPLUS_PRIVACY_POLICY: {
  title: string;
  summary: string;
  sections: { title: string; paragraphs: string[]; bulletPoints?: string[] }[];
} = {
  title: 'GoDigital Privacy Policy',
  summary: 'We value your privacy. All phone numbers are masked on public leaderboards, and authorization is secured via telebirr SSO.',
  sections: [
    {
      title: 'Identity Protection',
      paragraphs: ['Your MSISDN is masked as 091*****890 on public rankings to guarantee user privacy.'],
      bulletPoints: ['No unmasked numbers shown', 'Strict customer privacy']
    },
    {
      title: 'Data Security',
      paragraphs: ['All sessions are signed with server-authoritative HMAC-SHA256 tokens to prevent tampering.'],
      bulletPoints: ['Anti-cheat HMAC token validation', 'Secure TLS encryption']
    }
  ]
};

export const GODIGITAL_PRIVACY_POLICY = TELEPLUS_PRIVACY_POLICY;

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
    title: 'Terms of Service',
    paragraphs: ['By using GoDigital, you agree to these fair-play and tournament rules.']
  }
];

export const GODIGITAL_TERMS_SECTIONS = TELEPLUS_TERMS_SECTIONS;
