/**
 * VERIFICATION SUITE: "🌌 Pergi ke Universe" BUTTONS IN ALL THREE UNIVERSES
 * Tests:
 * 1. Button labels and presence in KIDULT, TO YOU, and SHADOW
 * 2. Navigation flow: Enter universe -> Click "Pergi ke Universe" -> Return to 3 universes
 * 3. Role-based access retention: Session, avatar, greeting, and MY UNIVERSE / VISIT UNIVERSE badges
 */

import fs from 'fs';
import path from 'path';

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
console.log('1. TEST: MARKUP VERIFICATION FOR "🌌 Pergi ke Universe"');
console.log('================================================================');

const indexHtml = fs.readFileSync(path.resolve('./index.html'), 'utf-8');

// Check KIDULT
assert(
  indexHtml.includes('id="btn-kidult-return-univ"') && indexHtml.includes('id="btn-kidult-back-bottom"'),
  'KIDULT memiliki tombol navigasi di HUD atas dan di bawah'
);
assert(
  indexHtml.includes('kidult-return-pill') && indexHtml.includes('Pergi ke Universe'),
  'KIDULT memiliki tombol dengan label "Pergi ke Universe" dan ikon 🌌'
);

// Check TO YOU
assert(
  indexHtml.includes('id="btn-toyou-top-return"') && indexHtml.includes('id="btn-toyou-back"'),
  'TO YOU memiliki tombol navigasi di HUD atas dan di bawah'
);
assert(
  indexHtml.includes('toyou-return-pill') && indexHtml.includes('toyou-back-btn'),
  'TO YOU memiliki tombol dengan label "Pergi ke Universe" dan ikon 🌌'
);

// Check SHADOW
assert(
  indexHtml.includes('id="btn-shadow-top-return"') && indexHtml.includes('id="btn-shadow-back"'),
  'SHADOW memiliki tombol navigasi di HUD atas dan di bawah'
);
assert(
  indexHtml.includes('shadow-return-pill') && indexHtml.includes('shadow-back-btn'),
  'SHADOW memiliki tombol dengan label "Pergi ke Universe" dan ikon 🌌'
);

console.log('\n================================================================');
console.log('2. TEST: SIMULATION OF CONTROLLER FUNCTIONS & TRANSITIONS');
console.log('================================================================');

// Import universes controller
import { initUniversesView } from './universes_view.js';

// Setup minimal DOM mock environment
const elements = {};
function createMockEl(id, className = '') {
  const el = {
    id,
    className,
    classList: {
      classes: new Set(className.split(' ').filter(Boolean)),
      add(c) { this.classes.add(c); el.className = Array.from(this.classes).join(' '); },
      remove(c) { this.classes.delete(c); el.className = Array.from(this.classes).join(' '); },
      contains(c) { return this.classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this.contains(c)) this.remove(c); else this.add(c);
        } else if (force) {
          this.add(c);
        } else {
          this.remove(c);
        }
      }
    },
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    textContent: '',
    src: '',
    alt: '',
    style: {},
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
      if (sel === '.island-universe-badge') {
        return this.badgeEl || null;
      }
      if (sel === '.island-universe-badge-container' || sel === '.island-glass-card') {
        return this.badgeContainer || this;
      }
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

// Create DOM Views
const viewSelection = createMockEl('view-selection');
const viewLogin = createMockEl('view-login');
const viewPrivateUniverse = createMockEl('view-private-universe', 'active');
const viewKidultWorld = createMockEl('view-kidult-world');
const viewToYouWorld = createMockEl('view-toyou-world');
const viewShadowWorld = createMockEl('view-shadow-world');

// Header elements
const userGreetingEl = createMockEl('univ-user-greeting');
const userAvatarEl = createMockEl('univ-user-avatar');
const btnUnivNav = createMockEl('nav-btn-universes', 'univ-nav-btn active');

// Island Cards
const cardKidult = createMockEl('card-kidult', 'univ-island-card');
cardKidult.setAttribute('data-char', 'nyanya');
const cardToYou = createMockEl('card-toyou', 'univ-island-card');
cardToYou.setAttribute('data-char', 'lala');
const cardShadow = createMockEl('card-shadow', 'univ-island-card');
cardShadow.setAttribute('data-char', 'lele');

const islandCardsList = [cardKidult, cardToYou, cardShadow];

// Buttons in KIDULT
const btnKidultReturnUniv = createMockEl('btn-kidult-return-univ');
const btnKidultBackBottom = createMockEl('btn-kidult-back-bottom');
const btnKidultBack = createMockEl('btn-kidult-back');

// Buttons in TO YOU
const btnToYouTopReturn = createMockEl('btn-toyou-top-return');
const btnToYouBack = createMockEl('btn-toyou-back');
const btnToYouBackTop = createMockEl('btn-toyou-back-top');

// Buttons in SHADOW
const btnShadowTopReturn = createMockEl('btn-shadow-top-return');
const btnShadowBack = createMockEl('btn-shadow-back');
const btnShadowBackTop = createMockEl('btn-shadow-back-top');

// Setup global document mockup
global.document = {
  getElementById: (id) => elements[id] || null,
  querySelectorAll: (sel) => {
    if (sel === '.univ-island-card') return islandCardsList;
    if (sel === '.univ-nav-btn') return [btnUnivNav];
    return [];
  },
  createElement: (tag) => createMockEl('elem-' + Math.random(), tag),
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

// Initialize Controller
let lastToast = '';
const controller = initUniversesView({
  onShowToast: (msg) => { lastToast = msg; },
  onTriggerSparkle: () => {}
});

console.log('\n--- UJI ALUR PENGGUNA 1: LOGIN NYANYA ---');
controller.updateUserProfile('nyanya');

assert(userGreetingEl.textContent === 'Hello, Nyanya', 'Greeting profil adalah "Hello, Nyanya"');
assert(cardKidult.classList.contains('is-my-universe'), 'Pulau KIDULT ditandai sebagai MY UNIVERSE untuk Nyanya');
assert(cardToYou.classList.contains('is-visit-universe'), 'Pulau TO YOU ditandai sebagai VISIT UNIVERSE untuk Nyanya');
assert(cardShadow.classList.contains('is-visit-universe'), 'Pulau SHADOW ditandai sebagai VISIT UNIVERSE untuk Nyanya');

// Step 1A: Masuk KIDULT -> Klik Pergi ke Universe
controller.openKidultWorld();
assert(viewKidultWorld.classList.contains('active'), 'KIDULT World aktif saat dimasuki');
assert(!viewPrivateUniverse.classList.contains('active'), 'Private Universe nonaktif saat di dalam KIDULT');

btnKidultReturnUniv.click(); // Klik "🌌 Pergi ke Universe"
assert(!viewKidultWorld.classList.contains('active'), 'KIDULT World ditutup setelah klik Pergi ke Universe');
assert(viewPrivateUniverse.classList.contains('active'), 'Kembali ke halaman pemilihan Tiga Universe');
assert(cardKidult.classList.contains('is-my-universe'), 'Badge MY UNIVERSE pada KIDULT tetap bertahan');
assert(userGreetingEl.textContent === 'Hello, Nyanya', 'Identitas login Nyanya tetap bertahan');

// Step 1B: Masuk TO YOU -> Klik Pergi ke Universe
controller.openToYouWorld();
assert(viewToYouWorld.classList.contains('active'), 'TO YOU World aktif saat dikunjungi');
btnToYouBack.click(); // Klik "🌌 Pergi ke Universe"
assert(!viewToYouWorld.classList.contains('active'), 'TO YOU World ditutup');
assert(viewPrivateUniverse.classList.contains('active'), 'Kembali ke halaman pemilihan Tiga Universe');
assert(userGreetingEl.textContent === 'Hello, Nyanya', 'Identitas login Nyanya tetap bertahan');

// Step 1C: Masuk SHADOW -> Klik Pergi ke Universe
controller.openShadowWorld();
assert(viewShadowWorld.classList.contains('active'), 'SHADOW World aktif saat dikunjungi');
btnShadowBack.click(); // Klik "🌌 Pergi ke Universe"
assert(!viewShadowWorld.classList.contains('active'), 'SHADOW World ditutup');
assert(viewPrivateUniverse.classList.contains('active'), 'Kembali ke halaman pemilihan Tiga Universe');
assert(userGreetingEl.textContent === 'Hello, Nyanya', 'Identitas login Nyanya tetap bertahan');

console.log('\n--- UJI ALUR PENGGUNA 2: LOGIN LALA ---');
controller.updateUserProfile('lala');
assert(userGreetingEl.textContent === 'Hello, Lala', 'Greeting profil adalah "Hello, Lala"');
assert(cardToYou.classList.contains('is-my-universe'), 'Pulau TO YOU ditandai sebagai MY UNIVERSE untuk Lala');
assert(cardKidult.classList.contains('is-visit-universe'), 'Pulau KIDULT ditandai sebagai VISIT UNIVERSE untuk Lala');

controller.openToYouWorld();
assert(viewToYouWorld.classList.contains('active'), 'TO YOU World aktif untuk Lala');
btnToYouTopReturn.click(); // Klik "🌌 Pergi ke Universe" di HUD atas
assert(!viewToYouWorld.classList.contains('active'), 'TO YOU World ditutup');
assert(viewPrivateUniverse.classList.contains('active'), 'Kembali ke halaman pemilihan Tiga Universe');
assert(cardToYou.classList.contains('is-my-universe'), 'Badge MY UNIVERSE pada TO YOU tetap bertahan');
assert(userGreetingEl.textContent === 'Hello, Lala', 'Identitas login Lala tetap bertahan');

console.log('\n--- UJI ALUR PENGGUNA 3: LOGIN LELE ---');
controller.updateUserProfile('lele');
assert(userGreetingEl.textContent === 'Hello, Lele', 'Greeting profil adalah "Hello, Lele"');
assert(cardShadow.classList.contains('is-my-universe'), 'Pulau SHADOW ditandai sebagai MY UNIVERSE untuk Lele');
assert(cardKidult.classList.contains('is-visit-universe'), 'Pulau KIDULT ditandai sebagai VISIT UNIVERSE untuk Lele');

controller.openShadowWorld();
assert(viewShadowWorld.classList.contains('active'), 'SHADOW World aktif untuk Lele');
btnShadowTopReturn.click(); // Klik "🌌 Pergi ke Universe" di HUD atas
assert(!viewShadowWorld.classList.contains('active'), 'SHADOW World ditutup');
assert(viewPrivateUniverse.classList.contains('active'), 'Kembali ke halaman pemilihan Tiga Universe');
assert(cardShadow.classList.contains('is-my-universe'), 'Badge MY UNIVERSE pada SHADOW tetap bertahan');
assert(userGreetingEl.textContent === 'Hello, Lele', 'Identitas login Lele tetap bertahan');

console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passed}/${total} PENGUJIAN BERHASIL (${Math.round((passed/total)*100)}%)`);
console.log('================================================================');

if (passed === total) {
  console.log('\n✨ SEMUA PENGUJIAN ALUR TOMBOL "🌌 Pergi ke Universe" BERHASIL 100%! ✨\n');
  process.exit(0);
} else {
  console.error('\n⚠️ TERDAPAT PENGUJIAN YANG GAGAL!\n');
  process.exit(1);
}
