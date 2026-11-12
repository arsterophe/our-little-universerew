/**
 * TEST SUITE: 7-CHARACTER AUTH MAPPING, UNSELECTED GUARD & LOGOUT ISOLATION
 *
 * Verifies:
 * 1. All 7 canonical character UID, email, and universe mappings:
 *    - Nyanya -> KIDULT
 *    - Lala   -> TO YOU
 *    - Lele   -> SHADOW
 *    - Abil   -> PINWHEEL
 *    - Akhira -> YAWN
 *    - Ela    -> US AGAIN
 *    - Ruben  -> ASH
 * 2. Unknown UID / null user / unselected character -> strictly rejected (no fallback to Lele/Nyanya/SHADOW)
 * 3. Character mismatch -> strictly rejected
 * 4. Controller reset on logout (setActiveUserCharacter(null))
 * 5. main.js & firebase.js static guards against auto-redirect or default character fallback
 */

import fs from 'fs';
import {
  CANONICAL_CHARACTERS,
  CHARACTER_AUTH_RULES,
  identifyUserCharacter,
  verifyCharacterAuthorization
} from './firebase.js';
import { setActiveUserCharacter as setOrbitChar, getActiveUserCharacter as getOrbitChar } from './orbit.js';
import { setActiveUserCharacter as setMomentsChar, getActiveUserCharacter as getMomentsChar } from './moments.js';
import { setActiveUserCharacter as setMessagesChar, getActiveUserCharacter as getMessagesChar } from './messages.js';
import { setActiveUserCharacter as setGamesChar, getActiveUserCharacter as getGamesChar } from './games.js';
import { setActiveUserCharacter as setStoriesChar, getActiveUserCharacter as getStoriesChar } from './stories.js';

let passed = 0;
let total = 0;

function assert(condition, message, detail = '') {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}${detail ? ' -> ' + detail : ''}`);
    process.exitCode = 1;
  }
}

const EXPECTED = [
  { key: 'nyanya', universe: 'KIDULT', email: 'nyanya@ourlittleuniverse.com', uid: '1uwba7MrGVU3xHu57VVLvztskrg2' },
  { key: 'lala', universe: 'TO YOU', email: 'lala@ourlittleuniverse.com', uid: 'EqByKA8FXoTEt0OmIsSDPfnxMDB3' },
  { key: 'lele', universe: 'SHADOW', email: 'lele@ourlittleuniverse.com', uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2' },
  { key: 'abil', universe: 'PINWHEEL', email: 'abil@ourlittleuniverse.com', uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3' },
  { key: 'akhira', universe: 'YAWN', email: 'akhira@ourlittleuniverse.com', uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2' },
  { key: 'ela', universe: 'US AGAIN', email: 'ela@ourlittleuniverse.com', uid: 'plxSNowjCkOMfUQMAwnZzQPR9Xr1' },
  { key: 'ruben', universe: 'ASH', email: 'ruben@ourlittleuniverse.com', uid: '9PMychPZ4rZ4PBCtZB9GiASttc52' }
];

console.log('1. CANONICAL 7-CHARACTER MAPPINGS & AUTH VERIFICATION');
for (const spec of EXPECTED) {
  const cfg = CANONICAL_CHARACTERS[spec.key];
  const rule = CHARACTER_AUTH_RULES[spec.key];
  assert(cfg && cfg.uid === spec.uid, `${spec.key} UID matches ${spec.uid}`);
  assert(cfg && cfg.email === spec.email, `${spec.key} email matches ${spec.email}`);
  assert(cfg && cfg.universe === spec.universe, `${spec.key} universe matches ${spec.universe}`);
  assert(rule && rule.expectedUid === spec.uid, `${spec.key} auth rule expectedUid matches`);

  const mockUser = { uid: spec.uid, email: spec.email };
  assert(identifyUserCharacter(mockUser) === spec.key, `identifyUserCharacter resolves ${spec.key} by UID`);

  const authOk = verifyCharacterAuthorization(mockUser, spec.key);
  assert(authOk.authorized === true && authOk.characterConfig?.universe === spec.universe, `verifyCharacterAuthorization allows ${spec.key} -> ${spec.universe}`);
}

console.log('\n2. UNSELECTED, UNKNOWN UID & MISMATCHED CHARACTER REJECTION');
assert(identifyUserCharacter(null) === null, 'null user returns null');
assert(identifyUserCharacter({ uid: 'unknown-uid-999', email: 'stranger@example.com' }) === null, 'unknown UID returns null (never falls back to lele/nyanya)');

const unknownAuth = verifyCharacterAuthorization({ uid: 'unknown-uid-999', email: 'stranger@example.com' }, 'lele');
assert(unknownAuth.authorized === false, 'unknown UID rejected for lele');

const unselectedAuth = verifyCharacterAuthorization({ uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2', email: 'lele@ourlittleuniverse.com' }, null);
assert(unselectedAuth.authorized === false, 'unselected character (null) is NOT authorized');

for (let i = 0; i < EXPECTED.length; i++) {
  const actor = EXPECTED[i];
  const target = EXPECTED[(i + 1) % EXPECTED.length];
  const mismatch = verifyCharacterAuthorization({ uid: actor.uid, email: actor.email }, target.key);
  assert(mismatch.authorized === false, `mismatch rejected: ${actor.key} UID cannot enter ${target.key} (${target.universe})`);
}

console.log('\n3. LOGOUT / ACCOUNT-SWITCH RESET ACROSS CONTROLLERS');
setOrbitChar('lele');
setMomentsChar('lele');
setMessagesChar('lele');
setGamesChar('lele');
setStoriesChar('lele', { uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2', email: 'lele@ourlittleuniverse.com' });

setOrbitChar(null);
setMomentsChar(null);
setMessagesChar(null);
setGamesChar(null);
setStoriesChar(null);

assert(getOrbitChar() === null, 'orbit resets activeUserCharacter to null on logout');
assert(getMomentsChar() === null, 'moments resets activeUserCharacter to null on logout');
assert(getMessagesChar() === null, 'messages resets activeUserCharacter to null on logout');
assert(getGamesChar() === null, 'games resets activeUserCharacter to null on logout');
assert(getStoriesChar() === null, 'stories resets activeUserCharacter to null on logout');

console.log('\n4. STATIC GUARDS IN main.js & firebase.js');
const mainSrc = fs.readFileSync('./main.js', 'utf8');
const fbSrc = fs.readFileSync('./firebase.js', 'utf8');

assert(!mainSrc.includes("verifiedCharKey || characterConfig?.id"), 'main.js renderPrivateUniverse does not fall back to characterConfig?.id');
assert(!mainSrc.includes("updateUserProfile(activeCharacterKey || 'nyanya')"), 'main.js showUniversesView does not fall back to nyanya');
assert(mainSrc.includes("'theme-abil'") && mainSrc.includes("'theme-akhira'") && mainSrc.includes("'theme-ela'") && mainSrc.includes("'theme-ruben'"), 'main.js lockdownPrivateUniverse removes all 7 theme classes');
assert(!fbSrc.includes("identifyUserCharacter(authUser) || 'nyanya'"), 'firebase.js does not fall back to nyanya when identifyUserCharacter is null');

console.log(`\nSummary: ${passed}/${total} passed`);
process.exit(passed === total ? 0 : 1);
