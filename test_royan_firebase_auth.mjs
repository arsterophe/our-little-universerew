/**
 * test_royan_firebase_auth.mjs
 * Verification of Royan Firebase Authentication Mapping & Universe Authorization
 */

import assert from 'assert';
import {
  CANONICAL_CHARACTERS,
  CHARACTER_AUTH_RULES,
  identifyUserCharacter,
  verifyCharacterAuthorization,
  UNIVERSE_MAPPINGS
} from './firebase.js';

console.log('================================================================');
console.log('ROYAN FIREBASE AUTHENTICATION & SECURITY VERIFICATION');
console.log('================================================================');

let passed = 0;
let total = 0;

function check(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✕ FAIL: ${desc} -> ${err.message}`);
    process.exitCode = 1;
  }
}

// 1. CANONICAL DATA INTEGRITY
console.log('\n1. CANONICAL & AUTH RULES INTEGRITY');
check('CANONICAL_CHARACTERS.royan has official UID and email', () => {
  const royan = CANONICAL_CHARACTERS.royan;
  assert(royan, 'CANONICAL_CHARACTERS.royan must exist');
  assert.strictEqual(royan.id, 'royan');
  assert.strictEqual(royan.name, 'Royan');
  assert.strictEqual(royan.role, 'HOT 🎆');
  assert.strictEqual(royan.symbol, '🎆');
  assert.strictEqual(royan.universe, 'HOT');
  assert.strictEqual(royan.email, 'royan@ourlittleuniverse.com');
  assert.strictEqual(royan.uid, 'swBN9XodDWRuHE5YbYmeoytrcAx2');
});

check('CHARACTER_AUTH_RULES.royan matches expected canonical values', () => {
  const rules = CHARACTER_AUTH_RULES.royan;
  assert(rules, 'CHARACTER_AUTH_RULES.royan must exist');
  assert.strictEqual(rules.expectedEmail, 'royan@ourlittleuniverse.com');
  assert.strictEqual(rules.expectedUid, 'swBN9XodDWRuHE5YbYmeoytrcAx2');
  assert.strictEqual(rules.universe, 'HOT');
});

check('UNIVERSE_MAPPINGS maps royan to HOT', () => {
  assert.strictEqual(UNIVERSE_MAPPINGS.royan, 'HOT');
});

// 2. FIREBASE USER RESOLUTION
console.log('\n2. FIREBASE USER RESOLUTION (identifyUserCharacter)');
const validRoyanUser = {
  uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2',
  email: 'royan@ourlittleuniverse.com'
};

check('identifyUserCharacter resolves valid Royan Firebase user by UID', () => {
  const charKey = identifyUserCharacter(validRoyanUser);
  assert.strictEqual(charKey, 'royan');
});

check('identifyUserCharacter resolves Royan by UID even with alternate casing email', () => {
  const charKey = identifyUserCharacter({
    uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2',
    email: 'ROYAN@OURLITTLEUNIVERSE.COM'
  });
  assert.strictEqual(charKey, 'royan');
});

check('identifyUserCharacter rejects spoofed email with unknown UID', () => {
  const charKey = identifyUserCharacter({
    uid: 'spoofed-fake-uid-12345',
    email: 'stranger@example.com'
  });
  assert.strictEqual(charKey, null);
});

// 3. AUTHORIZATION & CROSS-CHARACTER ACCESS CONTROLS
console.log('\n3. AUTHORIZATION & CROSS-UNIVERSE ISOLATION');
check('verifyCharacterAuthorization grants Royan access to universe HOT', () => {
  const res = verifyCharacterAuthorization(validRoyanUser, 'royan');
  assert.strictEqual(res.authorized, true);
  assert.strictEqual(res.characterKey, 'royan');
  assert.strictEqual(res.characterConfig.universe, 'HOT');
});

const otherCharacters = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben'];

otherCharacters.forEach(otherKey => {
  check(`Royan UID cannot enter universe of ${otherKey}`, () => {
    const res = verifyCharacterAuthorization(validRoyanUser, otherKey);
    assert.strictEqual(res.authorized, false);
    assert.strictEqual(res.mismatch, true);
  });
});

otherCharacters.forEach(otherKey => {
  check(`${otherKey} cannot enter Royan's universe HOT`, () => {
    const otherConfig = CHARACTER_AUTH_RULES[otherKey];
    const otherUser = { uid: otherConfig.expectedUid, email: otherConfig.expectedEmail };
    const res = verifyCharacterAuthorization(otherUser, 'royan');
    assert.strictEqual(res.authorized, false);
    assert.strictEqual(res.mismatch, true);
  });
});

console.log('\n================================================================');
console.log(`TOTAL: ${passed}/${total} TESTS PASSED (${Math.round(passed/total * 100)}%)`);
console.log('================================================================');

if (passed !== total) {
  process.exit(1);
}

