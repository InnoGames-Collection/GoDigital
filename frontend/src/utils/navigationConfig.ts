/**
 * GoDigital - Canonical Navigation & Destination Configuration
 * Shared between Profile tab and Top-Left Menu drawer.
 * 
 * Strict Label & Item Requirements:
 * 1. Subscription
 * 2. Subscription Pricing
 * 3. My Games
 * 4. My High Scores
 * 5. FAQ
 * 6. Games Help & Support
 * 7. Terms & Conditions
 * 8. Privacy Policy
 */

import React from 'react';
import { 
  CreditCard, 
  Coins, 
  Gamepad2, 
  Trophy, 
  HelpCircle, 
  Headphones, 
  FileText, 
  ShieldCheck 
} from 'lucide-react';

export type PortalSectionId = 
  | 'subscription'
  | 'pricing'
  | 'my_games'
  | 'my_scores'
  | 'faq'
  | 'help_support'
  | 'terms'
  | 'privacy';

export interface PortalNavItem {
  id: PortalSectionId;
  label: string; // Exact visible label required
  title: string; // Exact destination page title
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

export const PORTAL_NAV_ITEMS: PortalNavItem[] = [
  {
    id: 'subscription',
    label: 'Subscription',
    title: 'Subscription',
    icon: CreditCard,
    description: 'Active passes & telebirr wallet',
  },
  {
    id: 'pricing',
    label: 'Subscription Pricing',
    title: 'Subscription Pricing',
    icon: Coins,
    description: 'Pass tiers & coin bundles',
  },
  {
    id: 'my_games',
    label: 'My Games',
    title: 'My Games',
    icon: Gamepad2,
    description: 'Catalog games & instant play',
  },
  {
    id: 'my_scores',
    label: 'My High Scores',
    title: 'My High Scores',
    icon: Trophy,
    description: 'Personal records & rankings',
  },
  {
    id: 'faq',
    label: 'FAQ',
    title: 'FAQ',
    icon: HelpCircle,
    description: 'Frequently asked questions',
  },
  {
    id: 'help_support',
    label: 'Games Help & Support',
    title: 'Games Help & Support',
    icon: Headphones,
    description: 'Assistance & troubleshooting',
  },
  {
    id: 'terms',
    label: 'Terms & Conditions',
    title: 'Terms & Conditions',
    icon: FileText,
    description: 'Fair-play & service rules',
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    title: 'Privacy Policy',
    icon: ShieldCheck,
    description: 'Masked identity & data security',
  },
];
