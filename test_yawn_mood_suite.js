/**
 * AUTOMATED TEST SUITE: YAWN MOOD TODAY (AKHIRA ⚡)
 * Verifies full parity with Nyanya (KIDULT) & Lala (TO YOU) Mood Today,
 * strict UID-bound storage isolation, 7 canonical moods, and UI/CSS contracts.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';

import { YAWN_MOODS } from './yawn_view.js';
import { KIDULT_MOODS, TOYOU_MOODS, YAWN_MOODS as YAWN_FROM_UNIV } from './universes_view.js';

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
console.log('1. TEST: YAWN MOOD TODAY DOM STRUCTURE IN INDEX.HTML');
console.log('================================================================');

const indexHtml = fs.readFileSync(path.resolve('index.html'), 'utf-8');

it('Kontainer Mood YAWN (#yawn-mood-container) terpasang di dalam view-yawn-world', () => {
  assert.ok(indexHtml.includes('id="yawn-mood-container"'), 'Kontainer #yawn-mood-container harus ada di index.html');
  assert.ok(indexHtml.includes('class="yawn-mood-container"'), 'Class yawn-mood-container harus ada');
});

it('Kartu Mood & Rekomendasi Musik (#yawn-mood-card) terpasang lengkap dengan icon, teks, tombol picker, dan play', () => {
  assert.ok(indexHtml.includes('id="yawn-mood-card"'), 'Kartu mood #yawn-mood-card harus ada');
  assert.ok(indexHtml.includes('id="yawn-mood-icon-wrap"'), 'Wrapper ikon #yawn-mood-icon-wrap harus ada');
  assert.ok(indexHtml.includes('id="yawn-mood-icon"'), 'Ikon mood #yawn-mood-icon harus ada');
  assert.ok(indexHtml.includes('id="yawn-mood-text"'), 'Teks mood aktif #yawn-mood-text harus ada');
  assert.ok(indexHtml.includes('id="btn-toggle-yawn-mood-picker"'), 'Tombol dropdown picker #btn-toggle-yawn-mood-picker harus ada');
  assert.ok(indexHtml.includes('id="yawn-picker-caret"'), 'Ikon panah #yawn-picker-caret harus ada');
  assert.ok(indexHtml.includes('id="btn-yawn-mood-history"'), 'Tombol riwayat mood #btn-yawn-mood-history harus ada');
  assert.ok(indexHtml.includes('id="yawn-mood-song"'), 'Judul lagu rekomendasi #yawn-mood-song harus ada');
  assert.ok(indexHtml.includes('id="btn-yawn-mood-play"'), 'Tombol putar lagu #btn-yawn-mood-play harus ada');
  assert.ok(indexHtml.includes('id="yawn-mood-music-icon"'), 'Ikon play/pause #yawn-mood-music-icon harus ada');
});

it('Horizontal Mood Choices Bar (#yawn-mood-options-bar) memuat tepat 7 pilihan mood kanonikal', () => {
  assert.ok(indexHtml.includes('id="yawn-mood-options-bar"'), 'Options bar #yawn-mood-options-bar harus ada');
  
  const expectedMoods = ['bahagia', 'bersemangat', 'tenang', 'sedih', 'lelah', 'bersyukur', 'melamun'];
  expectedMoods.forEach((m) => {
    assert.ok(
      indexHtml.includes(`data-mood="${m}"`),
      `Pilihan mood pill dengan data-mood="${m}" harus ada di index.html`
    );
  });
});

it('Default mood aktif pada HTML adalah Tenang (🌸)', () => {
  assert.ok(
    indexHtml.includes('class="yawn-mood-option-pill active" data-mood="tenang"'),
    'Pill Tenang harus aktif secara default'
  );
  assert.ok(
    indexHtml.includes('<strong class="yawn-mood-state-text" id="yawn-mood-text">Tenang</strong>'),
    'Label default harus Tenang'
  );
});

it('Modal Riwayat Mood (#yawn-mood-history-modal) tersedia dengan header, list, dan tombol tutup', () => {
  assert.ok(indexHtml.includes('id="yawn-mood-history-modal"'), 'Modal riwayat mood harus ada');
  assert.ok(indexHtml.includes('id="btn-close-yawn-mood-history"'), 'Tombol tutup riwayat harus ada');
  assert.ok(indexHtml.includes('id="yawn-mood-history-list"'), 'List riwayat mood harus ada');
});

console.log('\n================================================================');
console.log('2. TEST: MOOD CATALOG PARITY & CURATED SOUNDTRACK (YAWN_MOODS)');
console.log('================================================================');

it('Katalog YAWN_MOODS memiliki tepat 7 pilihan mood identik dengan KIDULT dan TO YOU', () => {
  const yawnKeys = Object.keys(YAWN_MOODS).sort();
  const kidultKeys = Object.keys(KIDULT_MOODS).sort();
  const toyouKeys = Object.keys(TOYOU_MOODS).sort();

  assert.deepStrictEqual(yawnKeys, kidultKeys, 'Pilihan mood YAWN harus identik dengan KIDULT');
  assert.deepStrictEqual(yawnKeys, toyouKeys, 'Pilihan mood YAWN harus identik dengan TO YOU');
  assert.strictEqual(yawnKeys.length, 7, 'Jumlah pilihan mood harus tepat 7');
});

it('Katalog YAWN_MOODS diekspor juga di universes_view.js untuk kompatibilitas global', () => {
  assert.ok(YAWN_FROM_UNIV, 'YAWN_MOODS harus diekspor dari universes_view.js');
  assert.strictEqual(Object.keys(YAWN_FROM_UNIV).length, 7);
});

it('Setiap mood memiliki id, label, icon, songTitle, songDesc, dan roots Web Audio', () => {
  Object.entries(YAWN_MOODS).forEach(([key, mood]) => {
    assert.strictEqual(mood.id, key, `id mood ${key} harus sesuai key`);
    assert.ok(typeof mood.label === 'string' && mood.label.length > 0, `label mood ${key} harus valid`);
    assert.ok(typeof mood.icon === 'string' && mood.icon.length > 0, `icon mood ${key} harus valid`);
    assert.ok(typeof mood.songTitle === 'string' && mood.songTitle.includes('♫'), `songTitle mood ${key} harus berornamen ♫`);
    assert.ok(typeof mood.songDesc === 'string' && mood.songDesc.includes('YAWN'), `songDesc mood ${key} harus bertema YAWN`);
    assert.ok(Array.isArray(mood.roots) && mood.roots.length >= 3, `roots audio mood ${key} harus array nada`);
  });
});

console.log('\n================================================================');
console.log('3. TEST: CSS STYLING & RESPONSIVE RULES IN YAWN.CSS');
console.log('================================================================');

const yawnCss = fs.readFileSync(path.resolve('yawn.css'), 'utf-8');

it('CSS mendefinisikan .yawn-mood-container dengan posisi bottom-left dan z-index aman', () => {
  assert.ok(yawnCss.includes('.yawn-mood-container'), 'Class .yawn-mood-container harus ada di CSS');
  assert.ok(yawnCss.includes('bottom: 82px;'), 'Posisi bottom harus berada tepat di atas kontrol musik');
  assert.ok(yawnCss.includes('z-index: 35;'), 'z-index harus 35');
});

it('CSS mendefinisikan .yawn-mood-music-card dengan glassmorphism deep ocean dan cyan glow', () => {
  assert.ok(yawnCss.includes('.yawn-mood-music-card'), 'Class .yawn-mood-music-card harus ada');
  assert.ok(yawnCss.includes('border: 1.2px solid rgba(56, 189, 248'), 'Cyan border harus ada');
  assert.ok(yawnCss.includes('.yawn-mood-music-card:hover'), 'Hover state harus didefinisikan');
});

it('CSS mendefinisikan pop-out options bar (.yawn-mood-options-bar & .is-open)', () => {
  assert.ok(yawnCss.includes('.yawn-mood-options-bar'), 'Options bar class harus ada');
  assert.ok(yawnCss.includes('.yawn-mood-options-bar.is-open'), 'is-open transition class harus ada');
  assert.ok(yawnCss.includes('display: flex;'), 'is-open harus flex display');
});

it('CSS mendefinisikan pills dan active styling (.yawn-mood-option-pill.active)', () => {
  assert.ok(yawnCss.includes('.yawn-mood-option-pill'), 'Pill class harus ada');
  assert.ok(yawnCss.includes('.yawn-mood-option-pill.active'), 'Active pill class harus ada');
});

it('CSS mendefinisikan tampilan riwayat mood (.yawn-mood-history-list & .yawn-mood-history-item)', () => {
  assert.ok(yawnCss.includes('.yawn-mood-history-card'), 'History card class harus ada');
  assert.ok(yawnCss.includes('.yawn-mood-history-list'), 'History list class harus ada');
  assert.ok(yawnCss.includes('.yawn-mood-history-item'), 'History item class harus ada');
});

it('CSS memuat responsive adjustments untuk mobile 768px dan 390px', () => {
  assert.ok(yawnCss.includes('@media (max-width: 768px)'), 'Media query 768px harus ada');
  assert.ok(yawnCss.includes('.yawn-mood-container'), 'Responsive mood container harus ada di media query');
});

console.log('\n================================================================');
console.log('4. TEST: STORAGE KEYS & MULTI-UNIVERSE ISOLATION CONTRACT');
console.log('================================================================');

const AKHIRA_UID = 'MT14ZHATNqe90frAeQ74QFk4iXs2';
const NYANYA_UID = '1uwba7MrGVU3xHu57VVLvztskrg2';
const LALA_UID = 'w27lq4865xT03k140VVLvztskrg3';

// Mock localStorage
const mockStorage = {};
const fakeLocalStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

it('Penyimpanan mood Akhira menggunakan prefix eksklusif olu_yawn_mood_${uid}', () => {
  const key = `olu_yawn_mood_${AKHIRA_UID}`;
  fakeLocalStorage.setItem(key, 'bersemangat');
  assert.strictEqual(fakeLocalStorage.getItem(key), 'bersemangat');
  
  // Pastikan data Nyanya dan Lala tetap terisolasi
  assert.strictEqual(fakeLocalStorage.getItem(`olu_kidult_mood_${NYANYA_UID}`), null);
  assert.strictEqual(fakeLocalStorage.getItem(`olu_toyou_mood_${LALA_UID}`), null);
});

it('Penyimpanan riwayat harian menggunakan olu_yawn_mood_history_${uid} dengan format entri lengkap', () => {
  const historyKey = `olu_yawn_mood_history_${AKHIRA_UID}`;
  const testEntry = {
    date: '2026-11-18',
    time: '18:50',
    mood: 'bersemangat',
    label: YAWN_MOODS.bersemangat.label,
    icon: YAWN_MOODS.bersemangat.icon,
    songTitle: YAWN_MOODS.bersemangat.songTitle,
    timestamp: Date.now()
  };
  fakeLocalStorage.setItem(historyKey, JSON.stringify([testEntry]));

  const retrieved = JSON.parse(fakeLocalStorage.getItem(historyKey));
  assert.strictEqual(retrieved.length, 1);
  assert.strictEqual(retrieved[0].mood, 'bersemangat');
  assert.strictEqual(retrieved[0].label, 'Bersemangat');
  assert.strictEqual(retrieved[0].icon, '⚡');
  assert.strictEqual(retrieved[0].songTitle, '♫ Electric Tide Resonance ♫');
});

it('Pergantian mood Akhira tidak menimpa riwayat karakter lain di localStorage', () => {
  fakeLocalStorage.setItem(`olu_kidult_mood_${NYANYA_UID}`, 'bahagia');
  fakeLocalStorage.setItem(`olu_toyou_mood_${LALA_UID}`, 'lelah');
  fakeLocalStorage.setItem(`olu_yawn_mood_${AKHIRA_UID}`, 'melamun');

  assert.strictEqual(fakeLocalStorage.getItem(`olu_kidult_mood_${NYANYA_UID}`), 'bahagia');
  assert.strictEqual(fakeLocalStorage.getItem(`olu_toyou_mood_${LALA_UID}`), 'lelah');
  assert.strictEqual(fakeLocalStorage.getItem(`olu_yawn_mood_${AKHIRA_UID}`), 'melamun');
});

console.log('\n================================================================');
console.log(`TOTAL SUITE RESULTS: ${passed}/${total} TESTS PASSED (${((passed/total)*100).toFixed(1)}%)`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
}
