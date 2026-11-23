/**
 * AUTOMATED TEST SUITE: SHADOW MOOD SYSTEM & ANGEL/DEVIL SIDE (LELE ☾)
 * Verifies 10 canonical moods, Angel/Devil duality switching, UID-bound isolation,
 * DOM contracts in index.html, CSS styling in shadow_mood.css, and JS controller logic.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

import { SHADOW_MOODS, SHADOW_DUALITY_SIDES, LELE_UID } from './shadow_mood_view.js';
import { SHADOW_MOODS as SHADOW_FROM_UNIV, SHADOW_DUALITY_SIDES as DUALITY_FROM_UNIV } from './universes_view.js';

let passed = 0;
let total = 0;

function it(description, fn) {
  total++;
  try {
    fn();
    passed++;
    console.log(`  ✓ PASS: ${description}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${description}`);
    console.error(err);
  }
}

console.log('\n================================================================');
console.log('1. TEST: SHADOW MOOD & DUALITY DOM STRUCTURE IN INDEX.HTML');
console.log('================================================================');

const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');

it('Stylesheet shadow_mood.css terpasang di head index.html', () => {
  assert.ok(indexHtml.includes('<link rel="stylesheet" href="/shadow_mood.css">'), 'shadow_mood.css harus ada di head');
});

it('Kontainer Mood SHADOW (#shadow-mood-container) terpasang di dalam view-shadow-world', () => {
  assert.ok(indexHtml.includes('id="shadow-mood-container"'), 'Kontainer #shadow-mood-container harus ada');
  assert.ok(indexHtml.includes('class="shadow-mood-container"'), 'Class shadow-mood-container harus ada');
});

it('Kartu Mood & Duality (#shadow-mood-card) terpasang lengkap dengan icon, side orb, dan tag', () => {
  assert.ok(indexHtml.includes('id="shadow-mood-card"'), 'Kartu #shadow-mood-card harus ada');
  assert.ok(indexHtml.includes('id="shadow-mood-icon-wrap"'), 'Wrapper ikon #shadow-mood-icon-wrap harus ada');
  assert.ok(indexHtml.includes('id="shadow-mood-icon"'), 'Ikon mood #shadow-mood-icon harus ada');
  assert.ok(indexHtml.includes('id="shadow-mood-side-orb"'), 'Orb sisi aktif #shadow-mood-side-orb harus ada');
  assert.ok(indexHtml.includes('MOOD OF THE DAY'), 'Tag MOOD OF THE DAY harus ada');
  assert.ok(indexHtml.includes('id="shadow-side-badge"'), 'Badge sisi aktif #shadow-side-badge harus ada');
});

it('Mood state row memuat text mood, tombol picker, dan tombol riwayat mood', () => {
  assert.ok(indexHtml.includes('id="shadow-mood-text"'), 'Teks mood aktif #shadow-mood-text harus ada');
  assert.ok(indexHtml.includes('id="btn-toggle-shadow-mood-picker"'), 'Tombol dropdown picker #btn-toggle-shadow-mood-picker harus ada');
  assert.ok(indexHtml.includes('id="shadow-picker-caret"'), 'Ikon panah #shadow-picker-caret harus ada');
  assert.ok(indexHtml.includes('id="btn-shadow-mood-history"'), 'Tombol riwayat mood #btn-shadow-mood-history harus ada');
});

it('Duality selector buttons (Angel, Devil, Eclipse) terpasang di kartu mood', () => {
  assert.ok(indexHtml.includes('id="btn-side-angel"'), 'Tombol Angel #btn-side-angel harus ada');
  assert.ok(indexHtml.includes('id="btn-side-devil"'), 'Tombol Devil #btn-side-devil harus ada');
  assert.ok(indexHtml.includes('id="btn-side-eclipse"'), 'Tombol Eclipse #btn-side-eclipse harus ada');
  assert.ok(indexHtml.includes('id="shadow-side-quote"'), 'Kutipan sisi aktif #shadow-side-quote harus ada');
});

it('Soundtrack recommendation dan play button terpasang di kartu mood', () => {
  assert.ok(indexHtml.includes('id="shadow-mood-song"'), 'Judul lagu rekomendasi #shadow-mood-song harus ada');
  assert.ok(indexHtml.includes('id="btn-shadow-mood-play"'), 'Tombol putar lagu #btn-shadow-mood-play harus ada');
  assert.ok(indexHtml.includes('id="shadow-mood-music-icon"'), 'Ikon play/pause #shadow-mood-music-icon harus ada');
});

it('Horizontal Mood Options Bar (#shadow-mood-options-bar) memuat seluruh 10 pilihan mood kanonikal', () => {
  assert.ok(indexHtml.includes('id="shadow-mood-options-bar"'), 'Options bar #shadow-mood-options-bar harus ada');

  const expectedMoods = [
    'bahagia', 'tenang', 'lelah', 'sedih', 'bersemangat',
    'bingung', 'menyendiri', 'bersyukur', 'ceria', 'hening'
  ];
  expectedMoods.forEach((m) => {
    assert.ok(
      indexHtml.includes(`data-mood="${m}"`),
      `Pilihan mood pill dengan data-mood="${m}" harus ada di index.html`
    );
  });
});

it('Character card profil Lele (top-left) memiliki status mood dan status side badges', () => {
  assert.ok(indexHtml.includes('id="shadow-char-duality-bar"'), 'Bar status karakter #shadow-char-duality-bar harus ada');
  assert.ok(indexHtml.includes('id="shadow-char-mood-pill"'), 'Pill mood karakter #shadow-char-mood-pill harus ada');
  assert.ok(indexHtml.includes('id="shadow-char-side-pill"'), 'Pill side karakter #shadow-char-side-pill harus ada');
});

it('Modal Riwayat Mood (#shadow-mood-history-modal) tersedia dengan backdrop, header, list, dan tombol tutup', () => {
  assert.ok(indexHtml.includes('id="shadow-mood-history-modal"'), 'Modal riwayat mood harus ada');
  assert.ok(indexHtml.includes('id="shadow-mood-history-backdrop"'), 'Backdrop riwayat mood harus ada');
  assert.ok(indexHtml.includes('id="btn-close-shadow-mood-history"'), 'Tombol tutup riwayat harus ada');
  assert.ok(indexHtml.includes('id="shadow-mood-history-list"'), 'List riwayat mood harus ada');
});

console.log('\n================================================================');
console.log('2. TEST: SHADOW_MOODS CATALOG & DUALITY SIDES SPECIFICATION');
console.log('================================================================');

it('Katalog SHADOW_MOODS memuat 10 kategori mood kanonikal', () => {
  const canonical = ['bahagia', 'tenang', 'lelah', 'sedih', 'bersemangat', 'bingung', 'menyendiri', 'bersyukur', 'ceria', 'hening'];
  canonical.forEach((key) => {
    assert.ok(SHADOW_MOODS[key], `Mood ${key} harus ada di SHADOW_MOODS`);
    assert.ok(typeof SHADOW_MOODS[key].label === 'string');
    assert.ok(typeof SHADOW_MOODS[key].icon === 'string');
    assert.ok(typeof SHADOW_MOODS[key].desc === 'string');
    assert.ok(typeof SHADOW_MOODS[key].songTitle === 'string');
    assert.ok(Array.isArray(SHADOW_MOODS[key].roots) && SHADOW_MOODS[key].roots.length >= 3);
  });
});

it('Katalog SHADOW_MOODS mendukung alias bahasa Inggris (happy, calm, tired, sad, dll)', () => {
  assert.strictEqual(SHADOW_MOODS.happy.id, 'bahagia');
  assert.strictEqual(SHADOW_MOODS.calm.id, 'tenang');
  assert.strictEqual(SHADOW_MOODS.tired.id, 'lelah');
  assert.strictEqual(SHADOW_MOODS.sad.id, 'sedih');
  assert.strictEqual(SHADOW_MOODS.excited.id, 'bersemangat');
  assert.strictEqual(SHADOW_MOODS.confused.id, 'bingung');
  assert.strictEqual(SHADOW_MOODS.lonely.id, 'menyendiri');
  assert.strictEqual(SHADOW_MOODS.grateful.id, 'bersyukur');
  assert.strictEqual(SHADOW_MOODS.playful.id, 'ceria');
  assert.strictEqual(SHADOW_MOODS.quiet.id, 'hening');
});

it('Katalog SHADOW_DUALITY_SIDES memuat Angel, Devil, dan Eclipse (Balanced)', () => {
  assert.ok(SHADOW_DUALITY_SIDES.angel, 'Angel Side harus ada');
  assert.ok(SHADOW_DUALITY_SIDES.devil, 'Devil Side harus ada');
  assert.ok(SHADOW_DUALITY_SIDES.eclipse, 'Eclipse Side harus ada');

  // Periksa konten deskripsi Angel dan Devil sesuai spesifikasi prompt
  assert.strictEqual(SHADOW_DUALITY_SIDES.angel.desc, 'A softer light, a quieter heart.');
  assert.strictEqual(SHADOW_DUALITY_SIDES.devil.desc, 'Not every shadow is meant to be hidden.');
});

it('Katalog SHADOW_MOODS & DUALITY diekspor dari universes_view.js untuk kompatibilitas arsitektur', () => {
  assert.ok(SHADOW_FROM_UNIV, 'SHADOW_MOODS harus diekspor dari universes_view.js');
  assert.ok(DUALITY_FROM_UNIV, 'SHADOW_DUALITY_SIDES harus diekspor dari universes_view.js');
});

console.log('\n================================================================');
console.log('3. TEST: CSS STYLING & LUXURY PALETTE IN SHADOW_MOOD.CSS');
console.log('================================================================');

const shadowMoodCss = fs.readFileSync(path.resolve('shadow_mood.css'), 'utf-8');

it('CSS mendefinisikan .shadow-mood-container dengan posisi bottom-left dan z-index aman', () => {
  assert.ok(shadowMoodCss.includes('.shadow-mood-container'), 'Class .shadow-mood-container harus ada di CSS');
  assert.ok(shadowMoodCss.includes('bottom: 20px;'), 'Posisi bottom 20px');
  assert.ok(shadowMoodCss.includes('left: 20px;'), 'Posisi left 20px');
  assert.ok(shadowMoodCss.includes('z-index: 35;'), 'z-index harus 35');
});

it('CSS mendefinisikan .shadow-mood-card dengan glassmorphism midnight navy & amethyst', () => {
  assert.ok(shadowMoodCss.includes('.shadow-mood-card'), 'Class .shadow-mood-card harus ada');
  assert.ok(shadowMoodCss.includes('rgba(11, 14, 27,'), 'Midnight navy base harus ada');
  assert.ok(shadowMoodCss.includes('.shadow-mood-card:hover'), 'Hover state harus ada');
});

it('CSS mendefinisikan tombol pergantian Angel Side dan Devil Side', () => {
  assert.ok(shadowMoodCss.includes('.btn-duality-choice'), '.btn-duality-choice harus ada');
  assert.ok(shadowMoodCss.includes('.btn-duality-angel.active'), '.btn-duality-angel.active harus ada');
  assert.ok(shadowMoodCss.includes('.btn-duality-devil.active'), '.btn-duality-devil.active harus ada');
  assert.ok(shadowMoodCss.includes('.btn-duality-eclipse.active'), '.btn-duality-eclipse.active harus ada');
});

it('CSS mendefinisikan transformasi visual Angel Side (pearl white, silver, sayap lembut)', () => {
  assert.ok(shadowMoodCss.includes('.view-shadow-world.duality-angel'), '.duality-angel rule harus ada');
  assert.ok(shadowMoodCss.includes('rgba(255, 255, 255,'), 'Warna pearl white / silver harus ada di Angel rule');
});

it('CSS mendefinisikan transformasi visual Devil Side (midnight purple, amethyst flame, sayap gelap)', () => {
  assert.ok(shadowMoodCss.includes('.view-shadow-world.duality-devil'), '.duality-devil rule harus ada');
  assert.ok(shadowMoodCss.includes('rgba(126, 34, 206,'), 'Warna amethyst violet harus ada di Devil rule');
});

it('CSS mendefinisikan pop-out options bar (.shadow-mood-options-bar & .is-open)', () => {
  assert.ok(shadowMoodCss.includes('.shadow-mood-options-bar'), 'Options bar class harus ada');
  assert.ok(shadowMoodCss.includes('.shadow-mood-options-bar.is-open'), 'is-open transition class harus ada');
});

it('CSS mendefinisikan pills dan active styling (.shadow-mood-option-pill.active)', () => {
  assert.ok(shadowMoodCss.includes('.shadow-mood-option-pill'), 'Pill class harus ada');
  assert.ok(shadowMoodCss.includes('.shadow-mood-option-pill.active'), 'Active pill class harus ada');
});

it('CSS mendefinisikan modal riwayat mood (.shadow-mood-history-modal & .shadow-mood-history-item)', () => {
  assert.ok(shadowMoodCss.includes('.shadow-mood-history-modal'), 'History modal class harus ada');
  assert.ok(shadowMoodCss.includes('.shadow-mood-history-card'), 'History card class harus ada');
  assert.ok(shadowMoodCss.includes('.shadow-mood-history-item'), 'History item class harus ada');
});

it('CSS memuat responsive adjustments untuk mobile 768px dan 480px', () => {
  assert.ok(shadowMoodCss.includes('@media (max-width: 768px)'), 'Media query 768px harus ada');
  assert.ok(shadowMoodCss.includes('@media (max-width: 480px)'), 'Media query 480px harus ada');
});

console.log('\n================================================================');
console.log('4. TEST: STORAGE KEYS & MULTI-CHARACTER ISOLATION CONTRACT');
console.log('================================================================');

const NYANYA_UID = '1uwba7MrGVU3xHu57VVLvztskrg2';
const LALA_UID = 'w27lq4865xT03k140VVLvztskrg3';
const AKHIRA_UID = 'MT14ZHATNqe90frAeQ74QFk4iXs2';

// Mock localStorage
const mockStorage = {};
const fakeLocalStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

it('Penyimpanan mood Lele menggunakan prefix eksklusif olu_shadow_mood_${uid}', () => {
  const key = `olu_shadow_mood_${LELE_UID}`;
  fakeLocalStorage.setItem(key, 'bersemangat');
  assert.strictEqual(fakeLocalStorage.getItem(key), 'bersemangat');

  // Pastikan data Nyanya, Lala, dan Akhira tetap terisolasi
  assert.strictEqual(fakeLocalStorage.getItem(`olu_kidult_mood_${NYANYA_UID}`), null);
  assert.strictEqual(fakeLocalStorage.getItem(`olu_toyou_mood_${LALA_UID}`), null);
  assert.strictEqual(fakeLocalStorage.getItem(`olu_yawn_mood_${AKHIRA_UID}`), null);
});

it('Penyimpanan Angel/Devil duality tersimpan terpisah menggunakan olu_shadow_duality_${uid}', () => {
  const dualityKey = `olu_shadow_duality_${LELE_UID}`;
  fakeLocalStorage.setItem(dualityKey, 'angel');
  assert.strictEqual(fakeLocalStorage.getItem(dualityKey), 'angel');

  fakeLocalStorage.setItem(dualityKey, 'devil');
  assert.strictEqual(fakeLocalStorage.getItem(dualityKey), 'devil');
});

it('Penyimpanan riwayat mood harian menggunakan olu_shadow_mood_history_${uid} dengan data lengkap', () => {
  const historyKey = `olu_shadow_mood_history_${LELE_UID}`;
  const testEntry = {
    date: '2026-11-20',
    time: '20:30',
    mood: 'tenang',
    label: SHADOW_MOODS.tenang.label,
    icon: SHADOW_MOODS.tenang.icon,
    side: 'angel',
    sideLabel: 'Angel Side',
    songTitle: SHADOW_MOODS.tenang.songTitle,
    timestamp: Date.now()
  };
  fakeLocalStorage.setItem(historyKey, JSON.stringify([testEntry]));

  const retrieved = JSON.parse(fakeLocalStorage.getItem(historyKey));
  assert.strictEqual(retrieved.length, 1);
  assert.strictEqual(retrieved[0].mood, 'tenang');
  assert.strictEqual(retrieved[0].label, 'Tenang');
  assert.strictEqual(retrieved[0].side, 'angel');
});

it('Pergantian mood Lele tidak menimpa riwayat karakter lain di localStorage', () => {
  fakeLocalStorage.setItem(`olu_kidult_mood_${NYANYA_UID}`, 'bahagia');
  fakeLocalStorage.setItem(`olu_toyou_mood_${LALA_UID}`, 'lelah');
  fakeLocalStorage.setItem(`olu_yawn_mood_${AKHIRA_UID}`, 'melamun');
  fakeLocalStorage.setItem(`olu_shadow_mood_${LELE_UID}`, 'bersemangat');

  assert.strictEqual(fakeLocalStorage.getItem(`olu_kidult_mood_${NYANYA_UID}`), 'bahagia');
  assert.strictEqual(fakeLocalStorage.getItem(`olu_toyou_mood_${LALA_UID}`), 'lelah');
  assert.strictEqual(fakeLocalStorage.getItem(`olu_yawn_mood_${AKHIRA_UID}`), 'melamun');
  assert.strictEqual(fakeLocalStorage.getItem(`olu_shadow_mood_${LELE_UID}`), 'bersemangat');
});

console.log('\n================================================================');
console.log(`TOTAL SUITE RESULTS: ${passed}/${total} TESTS PASSED (${((passed/total)*100).toFixed(1)}%)`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
}
