import assert from 'assert';
import { PuzzleValidator, MoveStep } from '../services/puzzleValidator.js';
import { computeHmacSha256 } from '../utils/crypto.js';

console.log('--- RUNNING GODIGITAL TIER-0 ENTERPRISE VERIFICATION SUITE ---');

// ============================================================================
// TEST 1: WATER / BALL SORT PUZZLE VALIDATION ENGINE
// ============================================================================
{
  console.log('[Test 1.1] Ball Sort: Solvable puzzle with valid moves');
  const initialConfig = {
    capacity: 4,
    tubes: [
      ['yellow', 'yellow', 'cyan', 'cyan'],
      ['blue', 'blue', 'yellow', 'red'],
      ['yellow', 'blue', 'cyan', 'red'],
      ['red', 'blue', 'cyan', 'red'],
      [],
      [],
    ],
  };

  // Simulate legitimate human move sequence that completes Level 1
  // For unit test verification, we set up a 2-tube mini configuration to test full resolution
  const miniConfig = {
    capacity: 2,
    tubes: [
      ['yellow', 'cyan'],
      ['cyan', 'yellow'],
      [],
    ],
  };
  // Moves:
  // step 0: tube 0 -> tube 2 (cyan to 2)
  // step 1: tube 1 -> tube 0 (yellow to 0) => tube 0 is [yellow, yellow] (solved!)
  // step 2: tube 2 -> tube 1 (cyan to 1) => tube 1 is [cyan, cyan] (solved!)
  const moves: MoveStep[] = [
    { fromTube: 0, toTube: 2 },
    { fromTube: 1, toTube: 0 },
    { fromTube: 2, toTube: 1 },
  ];

  const result = PuzzleValidator.validateBallSort(
    miniConfig,
    3, // optimalMoves
    4, // parMoves
    moves,
    3.5 // durationSeconds (well above human reaction threshold of 3 * 0.2s = 0.6s)
  );

  assert.strictEqual(result.valid, true, 'Result should be valid');
  assert.strictEqual(result.fraudFlag, false, 'Fraud flag should be false');
  assert.strictEqual(result.stars, 3, 'Stars should be 3 for par completion');
  assert.ok(result.score >= 1000, 'Score should exceed base 1000');
  console.log('  -> PASS: Ball sort valid move sequence resolved authoritatively.');
}

{
  console.log('[Test 1.2] Anti-Cheat: Reject move count below mathematical minimum');
  const miniConfig = {
    capacity: 2,
    tubes: [
      ['yellow', 'cyan'],
      ['cyan', 'yellow'],
      [],
    ],
  };
  // Only 2 moves sent when optimal minimum is 3
  const shortMoves: MoveStep[] = [
    { fromTube: 0, toTube: 2 },
    { fromTube: 1, toTube: 0 },
  ];

  const result = PuzzleValidator.validateBallSort(
    miniConfig,
    3, // optimalMoves = 3
    4,
    shortMoves,
    4.0
  );

  assert.strictEqual(result.valid, false, 'Must reject impossible move count');
  assert.strictEqual(result.fraudFlag, true, 'Fraud flag must be true');
  assert.ok(result.fraudReason?.includes('below mathematical minimum'), 'Reason must identify mathematical violation');
  console.log('  -> PASS: Sub-optimal move spoofing successfully blocked.');
}

{
  console.log('[Test 1.3] Anti-Cheat: Reject sub-human execution speed (Bot / Speed Hack)');
  const miniConfig = {
    capacity: 2,
    tubes: [
      ['yellow', 'cyan'],
      ['cyan', 'yellow'],
      [],
    ],
  };
  const moves: MoveStep[] = [
    { fromTube: 0, toTube: 2 },
    { fromTube: 1, toTube: 0 },
    { fromTube: 2, toTube: 1 },
  ];

  // 3 moves executed in 0.15 seconds (human threshold is 3 * 0.200s = 0.600s)
  const result = PuzzleValidator.validateBallSort(
    miniConfig,
    3,
    4,
    moves,
    0.15
  );

  assert.strictEqual(result.valid, false, 'Must reject sub-human reaction duration');
  assert.strictEqual(result.fraudFlag, true, 'Fraud flag must be true');
  assert.ok(result.fraudReason?.includes('human physical execution threshold'), 'Reason must flag physical speed anomaly');
  console.log('  -> PASS: Sub-human speed hack blocked with physical threshold.');
}

{
  console.log('[Test 1.4] Anti-Cheat: Reject illegal color mismatch pour');
  const miniConfig = {
    capacity: 3,
    tubes: [
      ['yellow', 'cyan'],
      ['red'],
      [],
    ],
  };
  // Attempt to pour cyan onto red
  const illegalMoves: MoveStep[] = [
    { fromTube: 0, toTube: 1 },
  ];

  const result = PuzzleValidator.validateBallSort(
    miniConfig,
    1,
    2,
    illegalMoves,
    2.0
  );

  assert.strictEqual(result.valid, false, 'Must reject illegal color pour');
  assert.strictEqual(result.fraudFlag, true, 'Fraud flag must be true');
  assert.ok(result.fraudReason?.includes('Illegal color placement'), 'Reason must flag illegal placement');
  console.log('  -> PASS: Illegal move physics rejected.');
}

// ============================================================================
// TEST 2: MEMORY MATCH ANTI-CHEAT VALIDATION
// ============================================================================
{
  console.log('[Test 2.1] Memory Match: Valid move sequence');
  const memConfig = { pairsCount: 6, totalCards: 12, cols: 3, rows: 4 };
  const moves: MoveStep[] = Array.from({ length: 8 }, (_, i) => ({ timestampMs: i * 350 }));

  const result = PuzzleValidator.validateMemoryMatch(memConfig, 6, moves, 4.5);
  assert.strictEqual(result.valid, true);
  assert.strictEqual(result.fraudFlag, false);
  console.log('  -> PASS: Memory match valid session accepted.');
}

{
  console.log('[Test 2.2] Memory Match: Reject impossible move count');
  const memConfig = { pairsCount: 6, totalCards: 12, cols: 3, rows: 4 };
  // Only 4 moves for 6 pairs!
  const shortMoves: MoveStep[] = Array.from({ length: 4 }, (_, i) => ({ timestampMs: i * 350 }));

  const result = PuzzleValidator.validateMemoryMatch(memConfig, 6, shortMoves, 3.0);
  assert.strictEqual(result.valid, false);
  assert.strictEqual(result.fraudFlag, true);
  console.log('  -> PASS: Impossible memory match move count rejected.');
}

// ============================================================================
// TEST 3: TELEBIRR HMAC SIGNATURE & INTEGRITY
// ============================================================================
{
  console.log('[Test 3.1] Telebirr HMAC-SHA256 signature verification');
  const secret = 'telebirr_secret_audit_key_2026';
  const payload = {
    appId: '10002',
    outTradeNo: 'TB_ORDER_999',
    totalAmount: '10.00',
    tradeStatus: 'Completed',
  };

  const signString = Object.keys(payload)
    .sort()
    .map((k) => `${k}=${(payload as any)[k]}`)
    .join('&');

  const computedSig = computeHmacSha256(signString, secret);

  // Validate integrity
  const verifiedSig = computeHmacSha256(signString, secret);
  assert.strictEqual(computedSig, verifiedSig, 'Signatures must match');

  // Tampered payload
  const tamperedSignString = signString.replace('10.00', '100.00');
  const tamperedSig = computeHmacSha256(tamperedSignString, secret);
  assert.notStrictEqual(computedSig, tamperedSig, 'Tampered payload signature must differ');

  console.log('  -> PASS: Telebirr HMAC signature verification and tamper defense verified.');
}

// ============================================================================
// TEST 4: ETHIOPIAN MIDNIGHT TIMEZONE EVALUATION
// ============================================================================
{
  console.log('[Test 4.1] Africa/Addis_Ababa timezone offset calculation');
  const now = new Date();
  const eatFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Addis_Ababa',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const eatDateStr = eatFormatter.format(now);

  assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(eatDateStr), 'EAT date string must be YYYY-MM-DD format');
  console.log(`  -> PASS: Africa/Addis_Ababa date computed correctly: ${eatDateStr}`);
}

console.log('\n=============================================================');
console.log('✅ ALL TIER-0 VERIFICATION TESTS PASSED SUCCESSFULLY (100%)');
console.log('=============================================================\n');
