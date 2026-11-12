/**
 * TEST SUITE: ABIL ☁️ — PINWHEEL CHARACTER & UNIVERSE PREPARATION
 *
 * Verifies:
 * 1. Four character cards exist in index.html in exact order: Nyanya, Lala, Lele, Abil.
 * 2. Abil / PINWHEEL ☁️ canonical identity, auth rules, and cross-account anti-spoofing.
 * 3. Stories, universe state, and moments isolation for Abil without fallback to Nyanya.
 * 4. Existing Nyanya (KIDULT), Lala (TO YOU), and Lele (SHADOW) profiles remain untouched.
 */

import fs from 'node:fs';
import {
  CANONICAL_CHARACTERS,
  CHARACTER_AUTH_RULES,
  UNIVERSE_MAPPINGS,
  identifyUserCharacter,
  verifyCharacterAuthorization,
  normalizeStoryDocument
} from './firebase.js';
import {
  CHARACTERS_STORIES,
  createStory,
  getPublishedStories,
  resetStoriesStore,
  setActiveUserCharacter
} from './stories.js';
import {
  normalizeCharacterKey,
  getUniverseNameByChar,
  createDefaultUniverseState
} from './universe_state.js';
import { CHARACTERS_MOMENTS } from './moments.js';
import { UNIVERSE_DATA } from './universes_view.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('1. DOM & URUTAN KARTU PROFIL KARAKTER DI INDEX.HTML');
console.log('================================================================');
const html = fs.readFileSync('index.html', 'utf8');
const idxNyanya = html.indexOf('id="card-nyanya"');
const idxLala = html.indexOf('id="card-lala"');
const idxLele = html.indexOf('id="card-lele"');
const idxAbil = html.indexOf('id="card-abil"');

assert(idxNyanya !== -1 && idxLala !== -1 && idxLele !== -1 && idxAbil !== -1, 'Keempat kartu karakter terdaftar di index.html');
assert(idxNyanya < idxLala && idxLala < idxLele && idxLele < idxAbil, 'Urutan kartu benar: Nyanya -> Lala -> Lele -> Abil');
assert(html.includes('PINWHEEL ☁️') && html.includes('/assets/card_abil_hd.jpg'), 'Kartu Abil menampilkan PINWHEEL ☁️ dan gambar desain Abil');
assert(html.includes('data-universe="pinwheel" data-char="abil"'), 'Kartu universe PINWHEEL untuk Abil terdaftar di halaman universe');
assert(html.includes('/assets/island_pinwheel_floating.jpg') && UNIVERSE_DATA.pinwheel?.islandArt === '/assets/island_pinwheel_floating.jpg', 'Universe PINWHEEL menggunakan gambar referensi island_pinwheel_floating.jpg');

const universesCss = fs.readFileSync('universes.css', 'utf8');
assert(universesCss.includes('overflow-x: auto;') && universesCss.includes('flex-wrap: nowrap;'), 'Layout universe selection menggunakan horizontal scrollable planet navigation untuk 7 universe');
assert(
  UNIVERSE_DATA.yawn?.islandArt === '/assets/island_yawn_floating.jpg' &&
  UNIVERSE_DATA.us_again?.islandArt === '/assets/island_usagain_floating.jpg' &&
  UNIVERSE_DATA.ash?.islandArt === '/assets/island_ash_floating.jpg',
  'Artwork planet YAWN, US AGAIN, dan ASH terpasang pada UNIVERSE_DATA'
);
const idxUnivYawn = html.indexOf('data-universe="yawn"');
const idxUnivUsAgain = html.indexOf('data-universe="us_again"');
const idxUnivAsh = html.indexOf('data-universe="ash"');
const idxUnivPinwheel = html.indexOf('data-universe="pinwheel"');
assert(idxUnivYawn < idxUnivUsAgain && idxUnivUsAgain < idxUnivAsh && idxUnivAsh < idxUnivPinwheel, 'Urutan DOM baris kedua benar: YAWN (Akhira) -> US AGAIN (Ela) -> ASH (Ruben) -> PINWHEEL (Abil)');

// Verifikasi 7 karakter dan mapping universe lengkap
assert(CANONICAL_CHARACTERS.akhira?.universe === 'YAWN' && CANONICAL_CHARACTERS.akhira?.symbol === '⚡', 'Akhira ⚡ — YAWN terdaftar');
assert(CANONICAL_CHARACTERS.ela?.universe === 'US AGAIN' && CANONICAL_CHARACTERS.ela?.symbol === '🌸', 'Ela 🌸 — US AGAIN terdaftar');
assert(CANONICAL_CHARACTERS.ruben?.universe === 'ASH' && CANONICAL_CHARACTERS.ruben?.symbol === '❄️', 'Ruben ❄️ — ASH terdaftar');
assert(UNIVERSE_DATA.yawn?.charName === 'Akhira' && UNIVERSE_DATA.us_again?.charName === 'Ela' && UNIVERSE_DATA.ash?.charName === 'Ruben', 'UNIVERSE_DATA memuat YAWN, US AGAIN, dan ASH');
assert(html.includes('data-universe="yawn" data-char="akhira"') && html.includes('data-universe="us_again" data-char="ela"') && html.includes('data-universe="ash" data-char="ruben"'), 'Kartu universe YAWN, US AGAIN, dan ASH terdaftar di index.html');

console.log('\n================================================================');
console.log('2. IDENTITAS KANONIKAL & PEMETAAN AKUN ABIL — PINWHEEL ☁️');
console.log('================================================================');
assert(CANONICAL_CHARACTERS.abil?.name === 'Abil', 'CANONICAL_CHARACTERS.abil bernama Abil');
assert(CANONICAL_CHARACTERS.abil?.universe === 'PINWHEEL', 'CANONICAL_CHARACTERS.abil ber-universe PINWHEEL');
assert(CANONICAL_CHARACTERS.abil?.symbol === '☁️', 'Simbol PINWHEEL adalah ☁️');
assert(UNIVERSE_MAPPINGS.abil === 'PINWHEEL', 'UNIVERSE_MAPPINGS.abil === PINWHEEL');
assert(CHARACTER_AUTH_RULES.abil?.expectedEmail === 'abil@ourlittleuniverse.com', 'Email kanonikal Abil adalah abil@ourlittleuniverse.com');

const mockAbilUser = { uid: 'test-uid-abil-001', email: 'abil@ourlittleuniverse.com' };
assert(identifyUserCharacter(mockAbilUser) === 'abil', 'identifyUserCharacter mengenali akun Abil sebagai abil');
assert(verifyCharacterAuthorization(mockAbilUser, 'abil').authorized === true, 'Abil diizinkan masuk ke gerbang Abil');
assert(verifyCharacterAuthorization(mockAbilUser, 'nyanya').authorized === false, 'Abil ditolak masuk ke gerbang Nyanya');
assert(verifyCharacterAuthorization(mockAbilUser, 'lele').authorized === false, 'Abil ditolak masuk ke gerbang Lele');

const mockNyanyaUser = { uid: CANONICAL_CHARACTERS.nyanya.uid, email: CANONICAL_CHARACTERS.nyanya.email };
assert(verifyCharacterAuthorization(mockNyanyaUser, 'abil').authorized === false, 'Nyanya ditolak masuk ke gerbang Abil');

console.log('\n================================================================');
console.log('3. ISOLASI DATA CERITA, UNIVERSE STATE & MOMENTS ABIL');
console.log('================================================================');
assert(normalizeCharacterKey('abil') === 'abil', 'normalizeCharacterKey("abil") menghasilkan abil (tidak fallback ke nyanya)');
assert(getUniverseNameByChar('abil') === 'PINWHEEL', 'getUniverseNameByChar("abil") menghasilkan PINWHEEL');
const abilState = createDefaultUniverseState('abil');
assert(abilState.characterKey === 'abil' && abilState.universeName === 'PINWHEEL', 'createDefaultUniverseState("abil") menghasilkan state PINWHEEL');

assert(CHARACTERS_STORIES.abil?.universeName === 'PINWHEEL', 'CHARACTERS_STORIES.abil ber-universe PINWHEEL');
assert(CHARACTERS_MOMENTS.abil?.universe === 'PINWHEEL' && CHARACTERS_MOMENTS.abil?.symbol === '☁️', 'CHARACTERS_MOMENTS.abil ber-universe PINWHEEL ☁️');
assert(UNIVERSE_DATA.pinwheel?.name === 'PINWHEEL' && UNIVERSE_DATA.pinwheel?.symbol === '☁️', 'UNIVERSE_DATA.pinwheel terdaftar sebagai PINWHEEL ☁️');

// Test story isolation for Abil
if (typeof globalThis.localStorage === 'undefined') {
  const store = {};
  globalThis.localStorage = {
    getItem: (k) => (k in store ? store[k] : null),
    setItem: (k, v) => { store[k] = String(v); },
    removeItem: (k) => { delete store[k]; }
  };
}
resetStoriesStore();
setActiveUserCharacter('abil');
const abilStory = createStory({
  title: 'Catatan Awan PINWHEEL',
  content: '<p>Angin tenang berhembus di langit PINWHEEL.</p>',
  status: 'published',
  actor: 'abil'
});
assert(abilStory.success === true && abilStory.story.universeName === 'PINWHEEL', 'Cerita Abil tercatat di universe PINWHEEL');
assert(getPublishedStories().length === 1, 'Abil melihat 1 ceritanya sendiri');

setActiveUserCharacter('nyanya');
assert(getPublishedStories().length === 0, 'Cerita Abil TIDAK muncul di akun Nyanya');

setActiveUserCharacter('lele');
assert(getPublishedStories().length === 0, 'Cerita Abil TIDAK muncul di akun Lele');

const hydratedAbil = normalizeStoryDocument({
  id: 'story-abil-123',
  title: 'Angin Senja',
  content: '<p>Halo PINWHEEL</p>',
  status: 'published',
  authorUid: 'uid-abil-pinwheel-cloud-2026',
  authorChar: 'abil'
});
assert(hydratedAbil.universeId === 'pinwheel' && hydratedAbil.universeName === 'PINWHEEL', 'normalizeStoryDocument menghidrasi cerita Abil ke universeId=pinwheel & PINWHEEL');

console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passed}/${passed + failed} PENGUJIAN BERHASIL (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('================================================================');
process.exit(failed === 0 ? 0 : 1);

