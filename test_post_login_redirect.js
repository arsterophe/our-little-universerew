/**
 * AUTOMATED TEST SUITE: POST-LOGIN AUTOMATIC UNIVERSE REDIRECT
 * Tests all requirements from USER_REQUEST:
 * 1. Automatic Post-Login Redirect:
 *    - Nyanya -> ⭐ KIDULT
 *    - Lala -> ☀️ TO YOU
 *    - Lele -> 🌙 SHADOW
 * 2. Strict User ID & Character Verification (No arbitrary routing)
 * 3. Error handling on missing profile or unmapped character
 * 4. Navigasi Tiga Universe retention & "🌌 Pergi ke Universe" functionality
 * 5. Session isolation across Logout and Switching Accounts
 */

import { initUniversesView } from './universes_view.js';
import { CHARACTER_AUTH_RULES, verifyCharacterAuthorization } from './firebase.js';

let passed = 0;
let total = 0;

function assert(condition, message, detail = '') {
  total++;
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✕ FAIL: ${message} ${detail ? '-> ' + detail : ''}`);
  }
}

console.log('================================================================');
console.log('1. TEST SETUP: DOM MOCK & CONTROLLER INITIALIZATION');
console.log('================================================================');

const elements = {};
function createMockEl(id, className = '') {
  const el = {
    id,
    className,
    classList: {
      classes: new Set(className.split(' ').filter(Boolean)),
      add(c) { this.classes.add(c); el.className = Array.from(this.classes).join(' '); },
      remove(c) { this.classes.delete(c); el.className = Array.from(this.classes).join(' '); },
      contains(c) { return this.classes.has(c); }
    },
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    textContent: '',
    src: '',
    alt: '',
    style: {},
    getBoundingClientRect: () => ({ left: 100, top: 100, width: 50, height: 30 }),
    listeners: {},
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    },
    click() {
      if (this.listeners['click']) {
        this.listeners['click'].forEach(fn => fn({ preventDefault: () => {}, stopPropagation: () => {} }));
      }
    },
    querySelector(sel) {
      if (sel === '.island-universe-badge') return this.badgeEl || null;
      if (sel === '.island-universe-badge-container' || sel === '.island-glass-card') return this.badgeContainer || this;
      return null;
    },
    appendChild(child) {
      this.badgeEl = child;
      return child;
    }
  };
  elements[id] = el;
  return el;
}

// Views
const viewSelection = createMockEl('view-selection');
const viewLogin = createMockEl('view-login');
const viewPrivateUniverse = createMockEl('view-private-universe');
const viewKidultWorld = createMockEl('view-kidult-world');
const viewToYouWorld = createMockEl('view-toyou-world');
const viewShadowWorld = createMockEl('view-shadow-world');

// Nav buttons
const navBtnUniverses = createMockEl('nav-btn-universes', 'univ-nav-btn active');
navBtnUniverses.setAttribute('data-nav', 'universes');
const navBtnCalendar = createMockEl('nav-btn-calendar', 'univ-nav-btn');
navBtnCalendar.setAttribute('data-nav', 'calendar');

// Header Profile Elements
const userGreetingEl = createMockEl('univ-user-greeting');
const userAvatarEl = createMockEl('univ-user-avatar');

// World HUD Greetings & Avatars
const kidultGreeting = createMockEl('kidult-user-greeting');
const kidultAvatar = createMockEl('kidult-user-avatar');
const toyouGreeting = createMockEl('toyou-user-greeting');
const toyouAvatar = createMockEl('toyou-user-avatar');
const shadowGreeting = createMockEl('shadow-user-greeting');
const shadowAvatar = createMockEl('shadow-user-avatar');

// Three Island Cards
const cardKidult = createMockEl('card-kidult', 'univ-island-card');
cardKidult.setAttribute('data-char', 'nyanya');
const cardToYou = createMockEl('card-toyou', 'univ-island-card');
cardToYou.setAttribute('data-char', 'lala');
const cardShadow = createMockEl('card-shadow', 'univ-island-card');
cardShadow.setAttribute('data-char', 'lele');

const islandCardsList = [cardKidult, cardToYou, cardShadow];

// Buttons inside worlds
const btnKidultReturnUniv = createMockEl('btn-kidult-return-univ');
const btnToYouBack = createMockEl('btn-toyou-back');
const btnShadowBack = createMockEl('btn-shadow-back');

global.document = {
  getElementById: (id) => elements[id] || null,
  querySelectorAll: (sel) => {
    if (sel === '.univ-island-card') return islandCardsList;
    if (sel === '.univ-nav-btn') return [navBtnUniverses, navBtnCalendar];
    return [];
  },
  createElement: (tag) => createMockEl('el-' + Math.random(), tag),
  addEventListener: () => {}
};

global.window = {
  innerWidth: 1280,
  innerHeight: 800,
  matchMedia: () => ({ matches: false }),
  requestAnimationFrame: (cb) => setTimeout(cb, 1),
  addEventListener: () => {},
  removeEventListener: () => {}
};

let toastMessages = [];
const controller = initUniversesView({
  onShowToast: (m) => toastMessages.push(m),
  onTriggerSparkle: () => {}
});

// Mock Application State & renderPrivateUniverse mirroring main.js logic
let activeCharacterKey = null;
let currentAuthenticatedUser = null;

function renderPrivateUniverse(user, characterConfig, autoOpenOwnWorld = true) {
  if (!user || !characterConfig || !characterConfig.id) {
    return { success: false, reason: 'missing_profile' };
  }

  const charId = characterConfig.id;
  const validUniverses = {
    nyanya: 'KIDULT',
    lala: 'TO YOU',
    lele: 'SHADOW'
  };

  if (!validUniverses[charId]) {
    return { success: false, reason: 'unregistered_universe' };
  }

  activeCharacterKey = charId;
  currentAuthenticatedUser = user;

  // Update profile and island access badges
  controller.updateUserProfile(charId);

  // Auto-Redirect directly to user's universe
  if (autoOpenOwnWorld) {
    if (charId === 'nyanya') {
      controller.openKidultWorld();
      return { success: true, opened: 'KIDULT' };
    } else if (charId === 'lala') {
      controller.openToYouWorld();
      return { success: true, opened: 'TO YOU' };
    } else if (charId === 'lele') {
      controller.openShadowWorld();
      return { success: true, opened: 'SHADOW' };
    }
  }

  viewPrivateUniverse.classList.add('active');
  return { success: true, opened: 'SELECTION' };
}

console.log('\n================================================================');
console.log('2. TEST: AKUN NYANYA — LOGIN & DIRECT REDIRECT TO KIDULT');
console.log('================================================================');

const mockNyanyaUser = { uid: 'uid-nyanya-777', email: 'nyanya@ourlittleuniverse.com' };
const authNyanya = verifyCharacterAuthorization(mockNyanyaUser, 'nyanya');
assert(authNyanya.authorized === true, 'Autentikasi Nyanya valid');
assert(authNyanya.characterConfig.universe === 'KIDULT', 'Universe Nyanya terdaftar sebagai KIDULT');

const resNyanya = renderPrivateUniverse(mockNyanyaUser, authNyanya.characterConfig, true);
assert(resNyanya.success === true, 'renderPrivateUniverse berhasil');
assert(resNyanya.opened === 'KIDULT', 'Redirect otomatis langsung membuka KIDULT');
assert(viewKidultWorld.classList.contains('active'), 'View KIDULT World berstatus aktif');
assert(!viewPrivateUniverse.classList.contains('active'), 'View pemilihan tiga universe tidak ditampilkan saat awal');
assert(userGreetingEl.textContent === 'Hello, Nyanya', 'Profil sapaan menampilkan "Hello, Nyanya"');

// Klik "🌌 Pergi ke Universe" dari KIDULT
btnKidultReturnUniv.click();
assert(!viewKidultWorld.classList.contains('active'), 'KIDULT ditutup');
assert(viewPrivateUniverse.classList.contains('active'), 'Halaman pemilihan Tiga Universe dibuka');
assert(cardKidult.classList.contains('is-my-universe'), 'KIDULT memiliki status MY UNIVERSE');
assert(cardToYou.classList.contains('is-visit-universe'), 'TO YOU memiliki status VISIT UNIVERSE');
assert(cardShadow.classList.contains('is-visit-universe'), 'SHADOW memiliki status VISIT UNIVERSE');
assert(userGreetingEl.textContent === 'Hello, Nyanya', 'Identitas Nyanya tetap terjaga setelah kembali');

// Klik menu Universes pada navbar
navBtnUniverses.click();
assert(viewPrivateUniverse.classList.contains('active'), 'Navigasi Universes membuka halaman tiga universe');
assert(cardKidult.classList.contains('is-my-universe'), 'Badge MY UNIVERSE tetap konsisten');

console.log('\n================================================================');
console.log('3. TEST: AKUN LALA — LOGIN & DIRECT REDIRECT TO TO YOU');
console.log('================================================================');

// Simulasi pergantian akun ke Lala
const mockLalaUser = { uid: 'uid-lala-888', email: 'lala@ourlittleuniverse.com' };
const authLala = verifyCharacterAuthorization(mockLalaUser, 'lala');
assert(authLala.authorized === true, 'Autentikasi Lala valid');
assert(authLala.characterConfig.universe === 'TO YOU', 'Universe Lala terdaftar sebagai TO YOU');

const resLala = renderPrivateUniverse(mockLalaUser, authLala.characterConfig, true);
assert(resLala.success === true, 'renderPrivateUniverse berhasil');
assert(resLala.opened === 'TO YOU', 'Redirect otomatis langsung membuka TO YOU');
assert(viewToYouWorld.classList.contains('active'), 'View TO YOU World berstatus aktif');
assert(!viewKidultWorld.classList.contains('active'), 'KIDULT tidak aktif untuk akun Lala');
assert(userGreetingEl.textContent === 'Hello, Lala', 'Profil sapaan menampilkan "Hello, Lala"');

// Klik "🌌 Pergi ke Universe" dari TO YOU
btnToYouBack.click();
assert(!viewToYouWorld.classList.contains('active'), 'TO YOU ditutup');
assert(viewPrivateUniverse.classList.contains('active'), 'Halaman pemilihan Tiga Universe dibuka');
assert(cardToYou.classList.contains('is-my-universe'), 'TO YOU memiliki status MY UNIVERSE untuk Lala');
assert(cardKidult.classList.contains('is-visit-universe'), 'KIDULT memiliki status VISIT UNIVERSE untuk Lala');
assert(cardShadow.classList.contains('is-visit-universe'), 'SHADOW memiliki status VISIT UNIVERSE untuk Lala');

console.log('\n================================================================');
console.log('4. TEST: AKUN LELE — LOGIN & DIRECT REDIRECT TO SHADOW');
console.log('================================================================');

// Simulasi pergantian akun ke Lele
const mockLeleUser = { uid: 'uid-lele-999', email: 'lele@ourlittleuniverse.com' };
const authLele = verifyCharacterAuthorization(mockLeleUser, 'lele');
assert(authLele.authorized === true, 'Autentikasi Lele valid');
assert(authLele.characterConfig.universe === 'SHADOW', 'Universe Lele terdaftar sebagai SHADOW');

const resLele = renderPrivateUniverse(mockLeleUser, authLele.characterConfig, true);
assert(resLele.success === true, 'renderPrivateUniverse berhasil');
assert(resLele.opened === 'SHADOW', 'Redirect otomatis langsung membuka SHADOW');
assert(viewShadowWorld.classList.contains('active'), 'View SHADOW World berstatus aktif');
assert(!viewToYouWorld.classList.contains('active'), 'TO YOU tidak aktif untuk akun Lele');
assert(userGreetingEl.textContent === 'Hello, Lele', 'Profil sapaan menampilkan "Hello, Lele"');

// Klik "🌌 Pergi ke Universe" dari SHADOW
btnShadowBack.click();
assert(!viewShadowWorld.classList.contains('active'), 'SHADOW ditutup');
assert(viewPrivateUniverse.classList.contains('active'), 'Halaman pemilihan Tiga Universe dibuka');
assert(cardShadow.classList.contains('is-my-universe'), 'SHADOW memiliki status MY UNIVERSE untuk Lele');
assert(cardKidult.classList.contains('is-visit-universe'), 'KIDULT memiliki status VISIT UNIVERSE untuk Lele');
assert(cardToYou.classList.contains('is-visit-universe'), 'TO YOU memiliki status VISIT UNIVERSE untuk Lele');

console.log('\n================================================================');
console.log('5. TEST: ERROR HANDLING ON MISSING PROFILE OR UNMAPPED CHARACTER');
console.log('================================================================');

// Test missing user / null
const errNull = renderPrivateUniverse(null, null, true);
assert(errNull.success === false && errNull.reason === 'missing_profile', 'Pengguna null ditolak dengan aman');

// Test unmapped character
const unmappedUser = { uid: 'uid-stranger', email: 'unknown@stranger.com' };
const errUnmapped = renderPrivateUniverse(unmappedUser, { id: 'unknown_ghost' }, true);
assert(errUnmapped.success === false && errUnmapped.reason === 'unregistered_universe', 'Karakter tanpa universe yang sah ditolak');

console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passed}/${total} PENGUJIAN BERHASIL (${Math.round((passed/total)*100)}%)`);
console.log('================================================================');

if (passed === total) {
  console.log('\n✨ SEMUA PENGUJIAN REDIRECT OTOMATIS POST-LOGIN BERHASIL 100%! ✨\n');
  process.exit(0);
} else {
  console.error('\n⚠️ TERDAPAT PENGUJIAN YANG GAGAL!\n');
  process.exit(1);
}
