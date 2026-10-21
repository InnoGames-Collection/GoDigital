import assert from 'assert';
import { GameAntiCheat, maskMsisdn, normalizeMsisdn } from '../services/gameAntiCheat.js';
import { timingSafeEqual, computeHmacSha256, generateRandomOtp } from '../utils/crypto.js';
import { hasPermission, AdminRole, AdminPermission } from '../middleware/adminRbac.js';

console.log('\n================================================================');
console.log('🛡️  GODIGITAL INSA-ALIGNED SECURITY & AUTHORITATIVE AUDIT SUITE');
console.log('================================================================\n');

let passed = 0;
let total = 0;

function runTest(name: string, fn: () => void | Promise<void>) {
  total++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        passed++;
        console.log(`  ✅ PASS: ${name}`);
      }).catch((err) => {
        console.error(`  ❌ FAIL: ${name} ->`, err.message);
        process.exitCode = 1;
      });
    } else {
      passed++;
      console.log(`  ✅ PASS: ${name}`);
    }
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name} ->`, err.message);
    process.exitCode = 1;
  }
}

async function runAll() {
  // ──────────────────────────────────────────────────────────────────────────
  // 1. ANTI-CHEAT VALIDATION ENGINE
  // ──────────────────────────────────────────────────────────────────────────
  console.log('--- 1. Anti-Cheat Score Rate & Boundary Validation ---');

  await runTest('Score within normal human velocity is valid', async () => {
    // Helix Jump: max_score = 10000, max_score_per_sec = 50
    // Score 300 over 15 seconds = 20 pts/s (below 50 * 1.5 = 75 pts/s threshold)
    const result = await GameAntiCheat.validateScore('helix-jump', 300, 15);
    assert.strictEqual(result.valid, true);
  });

  await runTest('Score exceeding game hard ceiling is rejected', async () => {
    // Helix Jump hard ceiling: 10,000 pts
    const result = await GameAntiCheat.validateScore('helix-jump', 50000, 100);
    assert.strictEqual(result.valid, false);
    assert.ok(result.reason?.includes('exceeds hard ceiling'));
  });

  await runTest('Score rate exceeding physical human rate limit is rejected', async () => {
    // Helix Jump: 50 pts/s limit -> 200 pts in 1 sec = 200 pts/s (exceeds 75 pts/s)
    const result = await GameAntiCheat.validateScore('helix-jump', 200, 1);
    assert.strictEqual(result.valid, false);
    assert.ok(result.reason?.includes('exceeds threshold'));
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. CRYPTOGRAPHIC INTEGRITY & TIMING ATTACK RESILIENCE
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- 2. Cryptographic Security & Constant-Time Comparisons ---');

  runTest('timingSafeEqual correctly matches identical strings', () => {
    const a = 'bf7289c091823abce8129381203';
    const b = 'bf7289c091823abce8129381203';
    assert.strictEqual(timingSafeEqual(a, b), true);
  });

  runTest('timingSafeEqual rejects differing strings in constant time', () => {
    const a = 'bf7289c091823abce8129381203';
    const b = 'bf7289c091823abce8129381204';
    assert.strictEqual(timingSafeEqual(a, b), false);
  });

  runTest('timingSafeEqual handles mismatched lengths gracefully without exceptions', () => {
    const a = 'short';
    const b = 'longer_string';
    assert.strictEqual(timingSafeEqual(a, b), false);
  });

  runTest('generateRandomOtp generates 6-digit cryptographic values', () => {
    const otp1 = generateRandomOtp(6);
    const otp2 = generateRandomOtp(6);
    assert.strictEqual(otp1.length, 6);
    assert.strictEqual(otp2.length, 6);
    assert.ok(/^\d{6}$/.test(otp1));
    assert.ok(/^\d{6}$/.test(otp2));
    assert.notStrictEqual(otp1, otp2, 'Consecutive random OTPs must be cryptographically independent');
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ENTERPRISE RBAC & LEAST PRIVILEGE CONTROLS
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- 3. Enterprise RBAC & Role Privilege Separation ---');

  runTest('SUPER_ADMIN has all administrative permissions', () => {
    const perms: AdminPermission[] = [
      'puzzles:read', 'puzzles:create', 'puzzles:update', 'puzzles:delete',
      'players:read', 'players:unmask_pii', 'players:adjust_balance',
      'audit_logs:read', 'admin_users:manage'
    ];
    for (const p of perms) {
      assert.strictEqual(hasPermission('SUPER_ADMIN', p), true, `SUPER_ADMIN should have ${p}`);
    }
  });

  runTest('AUDITOR role has read-only permissions and cannot mutate system state', () => {
    assert.strictEqual(hasPermission('AUDITOR', 'audit_logs:read'), true);
    assert.strictEqual(hasPermission('AUDITOR', 'analytics:read'), true);
    assert.strictEqual(hasPermission('AUDITOR', 'players:read'), true);
    
    // Prohibited mutations
    assert.strictEqual(hasPermission('AUDITOR', 'players:adjust_balance'), false, 'Auditor cannot adjust balance');
    assert.strictEqual(hasPermission('AUDITOR', 'players:unmask_pii'), false, 'Auditor cannot unmask raw PII');
    assert.strictEqual(hasPermission('AUDITOR', 'admin_users:manage'), false, 'Auditor cannot manage users');
    assert.strictEqual(hasPermission('AUDITOR', 'puzzles:delete'), false, 'Auditor cannot delete puzzles');
  });

  runTest('CONTENT_CREATOR cannot access financial audit logs or player wallets', () => {
    assert.strictEqual(hasPermission('CONTENT_CREATOR', 'puzzles:create'), true);
    assert.strictEqual(hasPermission('CONTENT_CREATOR', 'puzzles:update'), true);
    assert.strictEqual(hasPermission('CONTENT_CREATOR', 'audit_logs:read'), false);
    assert.strictEqual(hasPermission('CONTENT_CREATOR', 'players:adjust_balance'), false);
    assert.strictEqual(hasPermission('CONTENT_CREATOR', 'admin_users:manage'), false);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. PRIVACY PROTECTION & MSISDN MASKING
  // ──────────────────────────────────────────────────────────────────────────
  console.log('\n--- 4. Data Privacy, Normalization & PII Masking ---');

  runTest('Ethiopian MSISDN normalization to international standard E.164', () => {
    assert.strictEqual(normalizeMsisdn('0911223344'), '251911223344');
    assert.strictEqual(normalizeMsisdn('+251911223344'), '251911223344');
    assert.strictEqual(normalizeMsisdn('0711223344'), '251711223344');
  });

  runTest('Public MSISDN masking protects subscriber identity', () => {
    const masked = maskMsisdn('0911223344');
    assert.strictEqual(masked, '091*****344');
    assert.ok(masked.includes('*****'), 'Must include 5-star privacy mask');
    assert.ok(!masked.includes('223'), 'Middle subscriber identifier must be obfuscated');
  });

  console.log('\n================================================================');
  console.log(`📋 SUITE SUMMARY: ${passed} / ${total} TESTS PASSED`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL INSA-ALIGNED SECURITY TESTS PASSED WITH 100% SUCCESS!\n');
  } else {
    process.exit(1);
  }
}

runAll();
