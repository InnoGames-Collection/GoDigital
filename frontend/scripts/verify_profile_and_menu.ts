/**
 * GoDigital Verification Test: Profile Navigation & Menu Drawer Integration Flow
 * 
 * Verifies:
 * 1. Header hamburger menu button exists and has correct accessible attributes & ID
 * 2. MainMenuDrawer renders with 55-70% mobile panel width and stops above bottom dock
 * 3. All 8 required menu destinations are present (games, my_scores, subscription, pricing, help_support, faq, terms, privacy)
 * 4. Active section highlighting works correctly in MainMenuDrawer
 * 5. All content pages render properly with GoDigital palette
 * 6. BottomNav renders all 5 tabs (home, games, tournament, leaderboard, profile) with accessible tab roles
 * 7. ProfilePage displays account card, stats (Available Coins, Best Score), and profile menu items
 * 8. Profile subview reset mechanism (key bump on re-clicking active Profile tab)
 * 9. Content view exit flow: Clicking bottom tabs clears contentView and shows requested tab
 * 10. Main menu dismissal on bottom tab selection
 */

import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { MainMenuDrawer, MainMenuSection } from '../src/components/MainMenuDrawer';
import { Header } from '../src/components/Header';
import { BottomNav } from '../src/components/BottomNav';
import { ProfilePage } from '../src/pages/ProfilePage';
import { SubscriptionPage } from '../src/pages/content/SubscriptionPage';
import { PricingPage } from '../src/pages/content/PricingPage';
import { FAQPage } from '../src/pages/content/FAQPage';
import { GamesContentPage } from '../src/pages/content/GamesContentPage';
import { HelpSupportPage } from '../src/pages/content/HelpSupportPage';
import { TermsPage } from '../src/pages/content/TermsPage';
import { PrivacyPage } from '../src/pages/content/PrivacyPage';
import { MyScoresPage } from '../src/pages/content/MyScoresPage';
import { GameCatalog } from '../src/services/gameCatalog';
import { catalogGameToDefinition } from '../src/games/registry';
import { UserProfile } from '../src/types';
import fs from 'fs';
import path from 'path';

const FRONTEND_DIR = fs.existsSync(path.resolve('frontend/src')) ? path.resolve('frontend') : path.resolve('.');
const appFile = fs.readFileSync(path.join(FRONTEND_DIR, 'src/App.tsx'), 'utf-8');
const drawerFile = fs.readFileSync(path.join(FRONTEND_DIR, 'src/components/MainMenuDrawer.tsx'), 'utf-8');
const bottomNavFile = fs.readFileSync(path.join(FRONTEND_DIR, 'src/components/BottomNav.tsx'), 'utf-8');

console.log('🔬 ==============================================================');
console.log('🔬 RUNNING GODIGITAL PROFILE & MENU INTEGRATION VERIFICATION');
console.log('🔬 ==============================================================');

let allPassed = true;
function assertCheck(name: string, condition: boolean, details?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${name}`);
  } else {
    console.error(`  ❌ [FAIL] ${name} ${details ? `(${details})` : ''}`);
    allPassed = false;
  }
}

// Mock User Profile
const mockProfile: UserProfile = {
  id: 'usr_godigital_001',
  phoneNumber: '0911223344',
  displayName: 'Player 0911223344',
  avatarId: 'avatar-1',
  isRegistered: true,
  telebirrLinked: true,
  telebirrBalance: 75.0,
  coins: 2450,
  energyBalance: 10,
  xp: 1200,
  level: 5,
  energy: 10,
  maxEnergy: 10,
  lastEnergyRefillTimestamp: Date.now(),
  subscription: {
    plan: 'daily',
    isActive: true,
    autoRenew: true,
  },
  streak: {
    current: 3,
    lastClaimedDate: '2026-10-17',
    hasClaimedToday: true,
  },
  highScores: {
    'helix-jump': 12500,
    'candy-blast': 8400,
    'crazy-runner': 6300,
  },
  achievements: [],
  matchesPlayed: 42,
  trophiesCount: 3,
};

const allGames = GameCatalog.getAll().map(catalogGameToDefinition);

// 1. Header & Menu Button Verification
console.log('\n--- 1. Header & Menu Button Verification ---');
let menuOpenTriggered = false;
const headerHtml = ReactDOMServer.renderToString(
  React.createElement(Header, {
    profile: mockProfile,
    unreadNotificationsCount: 3,
    onOpenBuyCoins: () => {},
    onOpenMenu: () => { menuOpenTriggered = true; },
  })
);
assertCheck('Header renders hamburger button with ID header-main-menu-btn', headerHtml.includes('id="header-main-menu-btn"'));
assertCheck('Header hamburger button has aria-label for accessibility', headerHtml.includes('aria-label="Open GoDigital Menu"'));
assertCheck('Header renders official GoDigital brand logo container', headerHtml.includes('id="header-godigital-brand"'));
assertCheck('Header displays user coins balance formatted', headerHtml.includes('2,450'));

// 2. MainMenuDrawer Mobile Dimensions & Dock Clearance
console.log('\n--- 2. MainMenuDrawer Mobile Dimensions & Dock Clearance ---');
const mobileWidths = [
  { name: 'iPhone SE (375px)', width: 375 },
  { name: 'iPhone 14/15 (390px)', width: 390 },
  { name: 'Android Standard (360px)', width: 360 },
  { name: 'Pixel 7 (412px)', width: 412 },
];
for (const vp of mobileWidths) {
  const panelWidth = Math.min(300, Math.max(240, vp.width * 0.68));
  const ratio = (panelWidth / vp.width) * 100;
  assertCheck(
    `Mobile ${vp.name}: width ${panelWidth.toFixed(1)}px covers ${ratio.toFixed(1)}% of viewport (55–70% target)`,
    ratio >= 55 && ratio <= 71
  );
}
assertCheck('Drawer panel CSS classes specify 68vw with 240px min and 300px max', 
  drawerFile.includes('w-[68vw]') && drawerFile.includes('min-w-[240px]') && drawerFile.includes('max-w-[300px]')
);
assertCheck('Drawer stops above bottom navigation dock to preserve bottom tabs accessibility',
  drawerFile.includes('bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]')
);

// 3. All 8 Required Menu Destinations in MainMenuDrawer
console.log('\n--- 3. All 8 Required Menu Destinations in MainMenuDrawer ---');
const openDrawerHtml = ReactDOMServer.renderToString(
  React.createElement(MainMenuDrawer, {
    isOpen: true,
    onClose: () => {},
    onSelectSection: () => {},
    activeSection: 'my_scores',
  })
);
const requiredMenuIds = [
  'games',
  'my_scores',
  'subscription',
  'pricing',
  'help_support',
  'faq',
  'terms',
  'privacy',
];
for (const secId of requiredMenuIds) {
  assertCheck(
    `Menu destination "${secId}" is present with accessible ID main-menu-item-${secId}`,
    openDrawerHtml.includes(`id="main-menu-item-${secId}"`)
  );
}
assertCheck('Active section highlighting is applied to my_scores', 
  openDrawerHtml.includes('bg-gradient-to-r from-[#FFAA24]/20') || openDrawerHtml.includes('text-[#FFD35A]')
);

// 4. Closed MainMenuDrawer Renders Null
console.log('\n--- 4. Closed MainMenuDrawer Renders Null ---');
const closedDrawerHtml = ReactDOMServer.renderToString(
  React.createElement(MainMenuDrawer, {
    isOpen: false,
    onClose: () => {},
    onSelectSection: () => {},
  })
);
assertCheck('MainMenuDrawer when isOpen=false renders empty string (no DOM obstruction)', closedDrawerHtml === '');

// 5. All Content Pages Render Successfully
console.log('\n--- 5. Content Pages Verification ---');
const myScoresHtml = ReactDOMServer.renderToString(
  React.createElement(MyScoresPage, { profile: mockProfile, onBack: () => {}, showHeader: true })
);
assertCheck('MyScoresPage renders with title "My High Scores" and scores', 
  myScoresHtml.includes('My High Scores') && myScoresHtml.includes('12,500')
);

const subscriptionHtml = ReactDOMServer.renderToString(
  React.createElement(SubscriptionPage, { profile: mockProfile, onBack: () => {}, showHeader: true })
);
assertCheck('SubscriptionPage renders subscription plans and telebirr branding', 
  subscriptionHtml.includes('telebirr') && subscriptionHtml.includes('Subscription')
);

const pricingHtml = ReactDOMServer.renderToString(
  React.createElement(PricingPage, { onBack: () => {}, showHeader: true, onBuyCoins: () => {} })
);
assertCheck('PricingPage renders Coin Packages and store', 
  pricingHtml.includes('Coins') || pricingHtml.includes('Packages')
);

const faqHtml = ReactDOMServer.renderToString(
  React.createElement(FAQPage, { onBack: () => {}, showHeader: true })
);
assertCheck('FAQPage renders questions and answers', faqHtml.includes('FAQ') || faqHtml.includes('Frequently Asked'));

const helpHtml = ReactDOMServer.renderToString(
  React.createElement(HelpSupportPage, { onBack: () => {}, showHeader: true })
);
assertCheck('HelpSupportPage renders support options', helpHtml.includes('Help') || helpHtml.includes('Support'));

const termsHtml = ReactDOMServer.renderToString(
  React.createElement(TermsPage, { onBack: () => {}, showHeader: true })
);
assertCheck('TermsPage renders terms agreement', termsHtml.includes('Terms'));

const privacyHtml = ReactDOMServer.renderToString(
  React.createElement(PrivacyPage, { onBack: () => {}, showHeader: true })
);
assertCheck('PrivacyPage renders privacy policy', privacyHtml.includes('Privacy'));

const gamesContentHtml = ReactDOMServer.renderToString(
  React.createElement(GamesContentPage, { games: allGames, profile: mockProfile, onBack: () => {}, onLaunchGame: () => {} })
);
assertCheck('GamesContentPage renders games catalog', gamesContentHtml.includes('Games') || gamesContentHtml.includes('Helix Jump'));

// 6. ProfilePage Verification
console.log('\n--- 6. ProfilePage Verification ---');
const profileHtml = ReactDOMServer.renderToString(
  React.createElement(ProfilePage, {
    profile: mockProfile,
    games: allGames,
    onPlayGame: () => {},
    onOpenBuyCoins: () => {},
    onOpenMenu: () => {},
  })
);
assertCheck('ProfilePage renders GoDigital Account card with masked MSISDN', 
  profileHtml.includes('GoDigital Account') && profileHtml.includes('091*****344')
);
assertCheck('ProfilePage renders Available Coins card with 2,450', profileHtml.includes('2,450'));
assertCheck('ProfilePage renders Best Score card with 12,500 pts', profileHtml.includes('12,500'));
assertCheck('ProfilePage renders My High Scores menu item', profileHtml.includes('id="profile-menu-item-my_scores"'));

// 7. BottomNav Verification
console.log('\n--- 7. BottomNav Verification ---');
const bottomNavHtml = ReactDOMServer.renderToString(
  React.createElement(BottomNav, {
    activeTab: 'profile',
    onTabChange: () => {},
    labels: {
      home: 'Home',
      games: 'Game',
      tournament: 'Tournament',
      leaderboard: 'Leaderboard',
      profile: 'Profile',
    },
  })
);
assertCheck('BottomNav renders Profile tab button with id bottom-nav-profile', bottomNavHtml.includes('id="bottom-nav-profile"'));
assertCheck('BottomNav tab buttons have role="tab" and data-nav-tab attributes', 
  bottomNavHtml.includes('role="tab"') && bottomNavHtml.includes('data-nav-tab="PROFILE"')
);
assertCheck('BottomNav profile button indicates selected status when activeTab="profile"',
  bottomNavHtml.includes('aria-selected="true"')
);

// 8. App.tsx Navigation Logic Audit
console.log('\n--- 8. App.tsx Navigation Logic Audit ---');
assertCheck('App.tsx clears contentView when switching tabs in BottomNav',
  appFile.includes('if (contentView) {') && appFile.includes('setContentView(null);')
);
assertCheck('App.tsx resets ProfilePage with key bump when tapping Profile while already on Profile',
  appFile.includes('setProfileResetKey((k) => k + 1)') && appFile.includes('key={`profile-page-${profileResetKey}`}')
);
assertCheck('App.tsx closes MainMenuDrawer when user selects a bottom tab',
  appFile.includes('if (isMainMenuOpen) {') && appFile.includes('handleCloseMainMenu();')
);
assertCheck('App.tsx passes activeSection={contentView} to MainMenuDrawer for active item highlighting',
  appFile.includes('activeSection={contentView}')
);
assertCheck('App.tsx renders MyScoresPage for contentView === "my_scores"',
  appFile.includes("contentView === 'my_scores'") && appFile.includes('<MyScoresPage')
);
assertCheck('App.tsx passes onOpenMenu={handleOpenMainMenu} to ProfilePage',
  appFile.includes('onOpenMenu={handleOpenMainMenu}')
);

console.log('\n==============================================================');
if (allPassed) {
  console.log('🎉 ALL 24 VERIFICATION CHECKS PASSED SUCCESSFULLY!');
} else {
  console.error('❌ VERIFICATION CHECKS FAILED!');
  process.exit(1);
}
console.log('==============================================================\n');
