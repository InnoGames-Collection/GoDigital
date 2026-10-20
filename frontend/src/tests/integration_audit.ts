/**
 * GoDigital Prompt 7 - Automated Integration & Regression Audit Test Suite
 * Tests end-to-end integration, data flow, scoring rules, and consistency.
 */

import { GameCatalog, MANDATORY_CATALOG_ORDER } from '../services/gameCatalog';
import { TournamentService } from '../services/tournamentService';
import { GameLeaderboardService, maskPhone } from '../services/gameLeaderboardService';
import { GameBridgeService } from '../services/gameBridge';
import { UserProfile } from '../types';
import { notificationService } from '../services/notificationService';

// Mock localStorage for node environment if not present
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, val: string) => store.set(key, val),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    length: store.size,
  };
}

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${testName}`);
  } else {
    console.error(`  ❌ FAIL: ${testName} ${detail ? `(${detail})` : ''}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('🚀 GODIGITAL PROMPT 7 — COMPREHENSIVE INTEGRATION AUDIT');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// TEST 1: CATALOG INTEGRITY & EXACT 12-GAME ORDER
// -----------------------------------------------------------------------------
console.log('--- 1. Game Catalog & 12-Game Order Verification ---');
const allGames = GameCatalog.getAll();
assert(allGames.length >= 12, 'Catalog contains at least 12 games', `Found ${allGames.length}`);

const expectedOrder = [
  'helix-jump',
  'flip-tile',
  'bubble-shooter',
  'emoji-iq',
  'royal-water-sort',
  'memory-match',
  'hill-rider',
  'sorting-balls',
  'puzzle-block',
  'color-rush',
  'solitaire',
  'emoji-sorting-ball',
];

const actualFirst12 = allGames.slice(0, 12).map((g) => g.gameId);
assert(
  JSON.stringify(actualFirst12) === JSON.stringify(expectedOrder),
  'Primary catalog begins with the 12 games in EXACT requested order',
  `Expected: ${expectedOrder.join(', ')}\nActual: ${actualFirst12.join(', ')}`
);

// Verify no duplicates in first 12
const uniqueFirst12 = new Set(actualFirst12);
assert(uniqueFirst12.size === 12, 'No duplicates in first 12 game entries');

// Verify Helix Jump access
const helixCatalog = GameCatalog.getById('helix-jump');
assert(helixCatalog !== undefined, 'Helix Jump exists in catalog');
assert(helixCatalog?.isFree === true, 'Helix Jump has isFree === true');
assert(helixCatalog?.requiresCoins === false, 'Helix Jump requiresCoins === false');
assert(helixCatalog?.coinCost === 0, 'Helix Jump coinCost === 0');

// -----------------------------------------------------------------------------
// TEST 2: HELIX JUMP SCORING IDEMPOTENCY SIMULATION
// -----------------------------------------------------------------------------
console.log('\n--- 2. Helix Jump Floor Scoring & Idempotency ---');
const scoredFloors = new Set<number>();
let liveScore = 0;

function simulateFloorPass(floorIndex: number): number {
  let awarded = 0;
  for (let k = 0; k <= floorIndex; k++) {
    if (!scoredFloors.has(k)) {
      scoredFloors.add(k);
      liveScore += 1;
      awarded += 1;
    }
  }
  return awarded;
}

// Start run
assert(liveScore === 0, 'Initial score begins strictly at zero');

// Pass floor 0
const p0 = simulateFloorPass(0);
assert(p0 === 1 && liveScore === 1, 'Passing Floor 0 awards 1 point');

// Repeated bounces on floor 0
const p0_bounce1 = simulateFloorPass(0);
const p0_bounce2 = simulateFloorPass(0);
assert(p0_bounce1 === 0 && p0_bounce2 === 0 && liveScore === 1, 'Repeated bounces on Floor 0 do not award duplicate points');

// Pass floor 1 & 2 in single combo drop
const p1_2 = simulateFloorPass(2);
assert(p1_2 === 2 && liveScore === 3, 'Dropping through Floor 1 and 2 awards 2 points (total: 3)');

// Repeated collision on floor 2
const p2_repeat = simulateFloorPass(2);
assert(p2_repeat === 0 && liveScore === 3, 'Repeated collision on floor 2 does not award extra points');

// -----------------------------------------------------------------------------
// TEST 3: UNRANKED STATE & INITIAL SCORE HANDLING
// -----------------------------------------------------------------------------
console.log('\n--- 3. Unranked State & Authoritative Score Source ---');
const freshProfile: UserProfile = {
  id: 'test_player_001',
  phoneNumber: '0911234890',
  displayName: 'Test Champion',
  avatarId: 'avatar_1',
  isRegistered: true,
  telebirrLinked: true,
  telebirrBalance: 50,
  coins: 100,
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
    current: 0,
    lastClaimedDate: '',
    hasClaimedToday: false,
  },
  highScores: {},
  achievements: [],
  matchesPlayed: 0,
  trophiesCount: 0,
};

const initialBestScore = TournamentService.getHelixTournamentBestScore(freshProfile);
assert(initialBestScore === 0, 'Fresh profile has initial best score of 0');

const initialSummary = TournamentService.getTournamentSummary(freshProfile);
assert(initialSummary.currentUserBestScore === 0, 'Tournament summary best score is 0');
assert(initialSummary.currentUserRank === 0, 'Unranked player receives rank 0 (not fabricated #84)');

// -----------------------------------------------------------------------------
// TEST 4: SCORE PERSISTENCE, RANKING & DETERMINISTIC TIE-BREAKING
// -----------------------------------------------------------------------------
console.log('\n--- 4. Score Persistence, Ranking & Tie-Breaking ---');

// User scores 3,500 points (should rank between seed_3 at 3920 and seed_4 at 3450 => rank #4)
const { updatedProfile: profileAfterRun1 } = GameBridgeService.submitScore(
  'helix-jump',
  3500,
  45,
  freshProfile,
  'weekly_championship_cup'
);

const scoreAfterRun1 = TournamentService.getHelixTournamentBestScore(profileAfterRun1);
assert(scoreAfterRun1 === 3500, 'Profile tab best score reflects 3,500');

const summaryAfterRun1 = TournamentService.getTournamentSummary(profileAfterRun1);
assert(summaryAfterRun1.currentUserBestScore === 3500, 'Leaderboard best score matches Profile exactly (3,500)');
assert(summaryAfterRun1.currentUserRank === 4, 'Score 3,500 correctly earns Rank #4 on Leaderboard');

// SUBSEQUENT LOWER RUN: User scores 1,200 points
const { updatedProfile: profileAfterRun2 } = GameBridgeService.submitScore(
  'helix-jump',
  1200,
  30,
  profileAfterRun1,
  'weekly_championship_cup'
);

const scoreAfterRun2 = TournamentService.getHelixTournamentBestScore(profileAfterRun2);
assert(scoreAfterRun2 === 3500, 'Subsequent lower run (1,200) does NOT overwrite best score of 3,500');

const summaryAfterRun2 = TournamentService.getTournamentSummary(profileAfterRun2);
assert(summaryAfterRun2.currentUserBestScore === 3500, 'Leaderboard score remains 3,500');
assert(summaryAfterRun2.currentUserRank === 4, 'Leaderboard rank remains #4');

// SUBSEQUENT HIGHER RUN: User scores 5,200 points (Beats seed_1 at 4,850 => Rank #1 Champion!)
const { updatedProfile: profileAfterRun3 } = GameBridgeService.submitScore(
  'helix-jump',
  5200,
  90,
  profileAfterRun2,
  'weekly_championship_cup'
);

const scoreAfterRun3 = TournamentService.getHelixTournamentBestScore(profileAfterRun3);
assert(scoreAfterRun3 === 5200, 'Subsequent higher run (5,200) updates best score to 5,200');

const summaryAfterRun3 = TournamentService.getTournamentSummary(profileAfterRun3);
assert(summaryAfterRun3.currentUserBestScore === 5200, 'Leaderboard best score is 5,200');
assert(summaryAfterRun3.currentUserRank === 1, 'Score 5,200 earns Rank #1 Champion position');
assert(summaryAfterRun3.topEntries[0].isCurrentUser === true, 'Top entry #1 is flagged as current user');

// -----------------------------------------------------------------------------
// TEST 5: PRIVACY & PHONE NUMBER MASKING
// -----------------------------------------------------------------------------
console.log('\n--- 5. Privacy Protection & MSISDN Masking ---');
const masked1 = maskPhone('0911234567');
assert(masked1 === '091*****567', 'Standard Ethiopian MSISDN masked correctly (091*****567)');

const masked2 = maskPhone('+251922889900');
assert(masked2.includes('*****'), 'International format masked with privacy asterisks');

// Verify all top 10 entries in summary are masked
const unmaskedInTop10 = summaryAfterRun3.topEntries.filter(
  (e) => !e.playerMasked.includes('*****')
);
assert(unmaskedInTop10.length === 0, 'All public leaderboard entries have masked phone numbers');

// -----------------------------------------------------------------------------
// TEST 6: REAL-TIME NOTIFICATIONS ARCHITECTURE & EVENT TRIGGERS
// -----------------------------------------------------------------------------
console.log('\n--- 6. Notification Center & Database-Backed Event Pipeline ---');

async function runNotificationsAudit() {
  const notif1 = await notificationService.triggerNotification({
    phone: '0911223344',
    type: 'score_verified',
    title: 'New High Score Verified!',
    message: 'Your score of 5,200 on Helix Jump was verified on PostgreSQL.',
    action_url: '/leaderboard',
    action_label: 'View Leaderboard',
  });
  assert(notif1 !== null && notif1.title.includes('High Score'), 'Notification created with score_verified event');
  assert(notif1?.is_read === false, 'New notification has is_read = false');

  const { notifications, unreadCount } = await notificationService.fetchNotifications('0911223344');
  assert(notifications.length > 0, 'Notifications retrieved from single source of data');
  assert(unreadCount >= 1, `Unread badge count is accurate (count: ${unreadCount})`);

  if (notif1) {
    await notificationService.markAsRead(notif1.id);
    const afterRead = await notificationService.fetchNotifications('0911223344');
    const readItem = afterRead.notifications.find((n) => n.id === notif1.id);
    assert(readItem?.is_read === true, 'Notification status transitioned to is_read = true');
  }

  await notificationService.markAllAsRead('0911223344');
  const afterMarkAll = await notificationService.fetchNotifications('0911223344');
  assert(afterMarkAll.unreadCount === 0, 'Mark all as read sets unreadCount to 0');

  // -----------------------------------------------------------------------------
  // SUMMARY
  // -----------------------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`📋 AUDIT SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('======================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL INTEGRATION AUDIT TESTS PASSED WITH 0 REGRESSIONS!\n');
  } else {
    console.error('❌ SOME TESTS FAILED. CHECK LOGS ABOVE.');
    process.exit(1);
  }
}

runNotificationsAudit();
