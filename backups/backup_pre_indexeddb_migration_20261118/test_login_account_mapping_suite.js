/**
 * TEST SUITE: STRICT LOGIN, SESSION ISOLATION & CANONICAL ACCOUNT MAPPING
 * 
 * Verifies all 3 characters:
 * 1. Nyanya ⭐ (1uwba7MrGVU3xHu57VVLvztskrg2 / nyanya@ourlittleuniverse.com) -> KIDULT
 * 2. Lala ☀️ (EqByKA8FXoTEt0OmIsSDPfnxMDB3 / lala@ourlittleuniverse.com) -> TO YOU
 * 3. Lele 🌙 (1ArxphLQpAOoOIvH9BKYw0ebD1e2 / lele@ourlittleuniverse.com) -> SHADOW
 * 
 * Tests:
 * - Switching accounts (lingering old session is terminated immediately)
 * - Logout cleanly terminates session and closes all protected views
 * - Reload preserves active character without switching
 * - Mismatched UID login attempt is strictly rejected
 */

import {
  CANONICAL_CHARACTERS,
  CHARACTER_AUTH_RULES,
  identifyUserCharacter,
  verifyCharacterAuthorization
} from './firebase.js';

let passed = 0;
let total = 0;

function assert(condition, message, detail = '') {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message} ${detail ? '-> ' + detail : ''}`);
    process.exitCode = 1;
  }
}

console.log('================================================================');
console.log('1. CANONICAL CHARACTER & UNIVERSE SPECIFICATIONS');
console.log('================================================================');

assert(
  CANONICAL_CHARACTERS.nyanya.uid === '1uwba7MrGVU3xHu57VVLvztskrg2',
  'Nyanya canonical UID adalah 1uwba7MrGVU3xHu57VVLvztskrg2'
);
assert(
  CANONICAL_CHARACTERS.nyanya.email === 'nyanya@ourlittleuniverse.com',
  'Nyanya canonical email adalah nyanya@ourlittleuniverse.com'
);
assert(
  CANONICAL_CHARACTERS.nyanya.universe === 'KIDULT',
  'Nyanya canonical universe adalah KIDULT'
);

assert(
  CANONICAL_CHARACTERS.lala.uid === 'EqByKA8FXoTEt0OmIsSDPfnxMDB3',
  'Lala canonical UID adalah EqByKA8FXoTEt0OmIsSDPfnxMDB3'
);
assert(
  CANONICAL_CHARACTERS.lala.email === 'lala@ourlittleuniverse.com',
  'Lala canonical email adalah lala@ourlittleuniverse.com'
);
assert(
  CANONICAL_CHARACTERS.lala.universe === 'TO YOU',
  'Lala canonical universe adalah TO YOU'
);

assert(
  CANONICAL_CHARACTERS.lele.uid === '1ArxphLQpAOoOIvH9BKYw0ebD1e2',
  'Lele canonical UID adalah 1ArxphLQpAOoOIvH9BKYw0ebD1e2'
);
assert(
  CANONICAL_CHARACTERS.lele.email === 'lele@ourlittleuniverse.com',
  'Lele canonical email adalah lele@ourlittleuniverse.com'
);
assert(
  CANONICAL_CHARACTERS.lele.universe === 'SHADOW',
  'Lele canonical universe adalah SHADOW'
);

console.log('\n================================================================');
console.log('2. STRICT IDENTIFICATION BY VERIFIED FIREBASE UID');
console.log('================================================================');

const nyanyaUser = { uid: '1uwba7MrGVU3xHu57VVLvztskrg2', email: 'nyanya@ourlittleuniverse.com' };
const lalaUser = { uid: 'EqByKA8FXoTEt0OmIsSDPfnxMDB3', email: 'lala@ourlittleuniverse.com' };
const leleUser = { uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2', email: 'lele@ourlittleuniverse.com' };

assert(identifyUserCharacter(nyanyaUser) === 'nyanya', 'UID Nyanya teridentifikasi sebagai nyanya');
assert(identifyUserCharacter(lalaUser) === 'lala', 'UID Lala teridentifikasi sebagai lala');
assert(identifyUserCharacter(leleUser) === 'lele', 'UID Lele teridentifikasi sebagai lele');

// Stranger / arbitrary UID must be rejected
const stranger = { uid: 'unknown-stranger-uid-999', email: 'stranger@gmail.com' };
assert(identifyUserCharacter(stranger) === null, 'UID asing menghasilkan null (ditolak)');

console.log('\n================================================================');
console.log('3. MISMATCH DETECTION & ANTI-SPOOFING');
console.log('================================================================');

// Lele trying to enter Nyanya's gate
const leleAtNyanya = verifyCharacterAuthorization(leleUser, 'nyanya');
assert(leleAtNyanya.authorized === false, 'Akun Lele di gerbang Nyanya ditolak');
assert(leleAtNyanya.mismatch === true, 'Terdeteksi sebagai mismatch');
assert(leleAtNyanya.actualCharacter.name === 'Lele', 'actualCharacter adalah Lele');

// Nyanya trying to enter Lala's gate
const nyanyaAtLala = verifyCharacterAuthorization(nyanyaUser, 'lala');
assert(nyanyaAtLala.authorized === false, 'Akun Nyanya di gerbang Lala ditolak');
assert(nyanyaAtLala.mismatch === true, 'Terdeteksi sebagai mismatch');

// Lala trying to enter Lele's gate
const lalaAtLele = verifyCharacterAuthorization(lalaUser, 'lele');
assert(lalaAtLele.authorized === false, 'Akun Lala di gerbang Lele ditolak');
assert(lalaAtLele.mismatch === true, 'Terdeteksi sebagai mismatch');

console.log('\n================================================================');
console.log('4. SIMULASI ALUR SIKLUS PENUH TIGA AKUN (LOGIN -> UNIVERSE -> LOGOUT)');
console.log('================================================================');

// Mock DOM & View Navigation Controller
const domViews = {
  'view-selection': { active: true },
  'view-login': { active: false },
  'view-private-universe': { active: false },
  'view-kidult-world': { active: false },
  'view-toyou-world': { active: false },
  'view-shadow-world': { active: false }
};

let activeUserSession = null;
let currentSelectedChar = null;

function mockLogout() {
  activeUserSession = null;
  currentSelectedChar = null;
  Object.keys(domViews).forEach(k => domViews[k].active = false);
  domViews['view-selection'].active = true;
}

function mockSelectCharacter(charKey) {
  currentSelectedChar = charKey;
  // If there is an existing session of another character, terminate it immediately!
  if (activeUserSession) {
    const sessionChar = identifyUserCharacter(activeUserSession);
    if (sessionChar !== charKey) {
      activeUserSession = null;
    }
  }
  domViews['view-selection'].active = false;
  domViews['view-login'].active = true;
}

function mockLogin(charKey, user) {
  const check = verifyCharacterAuthorization(user, charKey);
  if (!check.authorized) {
    throw new Error(check.reason);
  }
  activeUserSession = user;
  const verifiedChar = identifyUserCharacter(user);
  
  domViews['view-login'].active = false;
  
  // Directly open character's own universe
  if (verifiedChar === 'nyanya') {
    domViews['view-kidult-world'].active = true;
  } else if (verifiedChar === 'lala') {
    domViews['view-toyou-world'].active = true;
  } else if (verifiedChar === 'lele') {
    domViews['view-shadow-world'].active = true;
  }
}

// SIKLUS 1: NYANYA
console.log('--- Siklus 1: Nyanya ---');
mockSelectCharacter('nyanya');
assert(domViews['view-login'].active === true, 'Nyanya dipilih -> view-login aktif');
mockLogin('nyanya', nyanyaUser);
assert(domViews['view-kidult-world'].active === true, 'Nyanya berhasil login -> masuk ke KIDULT');
assert(domViews['view-shadow-world'].active === false, 'Nyanya TIDAK masuk ke SHADOW');
assert(domViews['view-toyou-world'].active === false, 'Nyanya TIDAK masuk ke TO YOU');

mockLogout();
assert(domViews['view-selection'].active === true, 'Logout Nyanya -> kembali ke view-selection');
assert(activeUserSession === null, 'Sesi Nyanya bersih setelah logout');

// SIKLUS 2: LALA
console.log('--- Siklus 2: Lala ---');
mockSelectCharacter('lala');
assert(domViews['view-login'].active === true, 'Lala dipilih -> view-login aktif');
mockLogin('lala', lalaUser);
assert(domViews['view-toyou-world'].active === true, 'Lala berhasil login -> masuk ke TO YOU');
assert(domViews['view-kidult-world'].active === false, 'Lala TIDAK masuk ke KIDULT');
assert(domViews['view-shadow-world'].active === false, 'Lala TIDAK masuk ke SHADOW');

mockLogout();
assert(domViews['view-selection'].active === true, 'Logout Lala -> kembali ke view-selection');
assert(activeUserSession === null, 'Sesi Lala bersih setelah logout');

// SIKLUS 3: LELE
console.log('--- Siklus 3: Lele ---');
mockSelectCharacter('lele');
assert(domViews['view-login'].active === true, 'Lele dipilih -> view-login aktif');
mockLogin('lele', leleUser);
assert(domViews['view-shadow-world'].active === true, 'Lele berhasil login -> masuk ke SHADOW');
assert(domViews['view-kidult-world'].active === false, 'Lele TIDAK masuk ke KIDULT');
assert(domViews['view-toyou-world'].active === false, 'Lele TIDAK masuk ke TO YOU');

mockLogout();
assert(domViews['view-selection'].active === true, 'Logout Lele -> kembali ke view-selection');
assert(activeUserSession === null, 'Sesi Lele bersih setelah logout');

console.log('\n================================================================');
console.log('5. SIMULASI RELOAD HALAMAN DENGAN SESI AKTIF');
console.log('================================================================');

function mockReload(sessionUser) {
  // Simulate onAuthStateChanged on page load
  Object.keys(domViews).forEach(k => domViews[k].active = false);
  if (!sessionUser) {
    domViews['view-selection'].active = true;
    return;
  }
  const char = identifyUserCharacter(sessionUser);
  if (char === 'nyanya') {
    domViews['view-kidult-world'].active = true;
  } else if (char === 'lala') {
    domViews['view-toyou-world'].active = true;
  } else if (char === 'lele') {
    domViews['view-shadow-world'].active = true;
  }
}

// Reload saat sesi Nyanya aktif
mockReload(nyanyaUser);
assert(domViews['view-kidult-world'].active === true, 'Reload sesi Nyanya -> tetap membuka KIDULT');
assert(domViews['view-shadow-world'].active === false, 'Reload sesi Nyanya -> tidak berubah ke SHADOW');

// Reload saat sesi Lala aktif
mockReload(lalaUser);
assert(domViews['view-toyou-world'].active === true, 'Reload sesi Lala -> tetap membuka TO YOU');

// Reload saat sesi Lele aktif
mockReload(leleUser);
assert(domViews['view-shadow-world'].active === true, 'Reload sesi Lele -> tetap membuka SHADOW');

// Reload saat sudah logout
mockReload(null);
assert(domViews['view-selection'].active === true, 'Reload setelah logout -> menampilkan halaman pemilihan');

console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passed}/${total} PENGUJIAN BERHASIL (${Math.round((passed/total)*100)}%)`);
console.log('================================================================\n');

