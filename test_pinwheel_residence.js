/**
 * TEST SUITE: THE WINDWHISPER RESIDENCE — PINWHEEL (SYMA)
 * Tests state, storage, collections integration, DOM elements, and CSS classes
 */

import assert from 'assert';
import fs from 'fs';
import {
  SYMA_CANONICAL_UID,
  SYMA_OUTFITS,
  COOKING_RECIPES,
  WIND_CHIMES,
  DECOR_ITEMS,
  DEFAULT_ROOM_DECOR,
  loadResidenceDecor,
  saveResidenceDecor,
  loadResidenceOutfit,
  saveResidenceOutfit,
  loadResidenceWeather,
  saveResidenceWeather,
  loadResidenceChime,
  saveResidenceChime,
  loadResidenceCookingHistory,
  saveResidenceCookingHistory,
  isAtticUnlocked,
  unlockAttic,
  loadSymaGazeboJournalArchive,
  loadSymaFishingCollectionArchive,
  playSynthesizedChime,
  setProceduralRainAudio,
  playCookingSound,
  playBedtimeLullaby
} from './pinwheel_residence_state.js';

console.log('🧪 Starting The Windwhisper Residence Test Suite...\n');

// -----------------------------------------------------------------------------
// 1. OUTFIT WARDROBE DEFINITION TESTS
// -----------------------------------------------------------------------------
assert.strictEqual(SYMA_OUTFITS.length, 3, 'Syma must have exactly 3 authentic outfits');
const outfitIds = SYMA_OUTFITS.map(o => o.id);
assert(outfitIds.includes('sacred_miko'), 'Must include sacred_miko (Sacred Kitsune Shrine Robe)');
assert(outfitIds.includes('wind_wanderer'), 'Must include wind_wanderer (Moonlit Pinwheel Adventurer)');
assert(outfitIds.includes('celestial_dreamer'), 'Must include celestial_dreamer (Star Blossom Kimono)');

SYMA_OUTFITS.forEach(o => {
  assert(o.name && o.nameJp && o.description && o.image, `Outfit ${o.id} must have complete metadata`);
  const physicalPath = fs.existsSync('.' + o.image) ? '.' + o.image : './public' + o.image;
  assert(fs.existsSync(physicalPath), `Asset file ${o.image} must physically exist in public directory`);
});
console.log('✓ 1. Syma outfits verified with genuine assets physically present.');

// -----------------------------------------------------------------------------
// 2. COOKING RECIPES DEFINITION TESTS
// -----------------------------------------------------------------------------
assert(COOKING_RECIPES.length >= 4, 'Must have at least 4 cooking recipes');
const recipeIds = COOKING_RECIPES.map(r => r.id);
assert(recipeIds.includes('sakura_tea'), 'Must include sakura_tea');
assert(recipeIds.includes('honey_milk_tea'), 'Must include honey_milk_tea');
assert(recipeIds.includes('moonlight_herbal_tea'), 'Must include moonlight_herbal_tea');
assert(recipeIds.includes('kitsune_dango'), 'Must include kitsune_dango');

COOKING_RECIPES.forEach(r => {
  assert(r.name && r.category && r.ingredients.length > 0 && r.flavorProfile && r.symaComment, `Recipe ${r.id} must be complete`);
});
console.log('✓ 2. Kitchen cooking recipes verified.');

// -----------------------------------------------------------------------------
// 3. WIND CHIME COLLECTION TESTS
// -----------------------------------------------------------------------------
assert.strictEqual(WIND_CHIMES.length, 4, 'Must have 4 wind chimes');
const chimeIds = WIND_CHIMES.map(c => c.id);
assert(chimeIds.includes('lavender_glass'), 'Must include lavender_glass');
assert(chimeIds.includes('bamboo_whisperer'), 'Must include bamboo_whisperer');
assert(chimeIds.includes('silver_star'), 'Must include silver_star');
assert(chimeIds.includes('kitsune_ceramic'), 'Must include kitsune_ceramic');

WIND_CHIMES.forEach(c => {
  assert(Array.isArray(c.frequencies) && c.frequencies.length >= 3, `Chime ${c.id} must have at least 3 harmonic frequencies`);
});
console.log('✓ 3. Wind chimes collection verified.');

// -----------------------------------------------------------------------------
// 4. HOME DECORATION CATALOGUE & ROOM LAYOUTS
// -----------------------------------------------------------------------------
assert(DECOR_ITEMS.length >= 18, 'Must have diverse catalogue of decor items');
const categories = new Set(DECOR_ITEMS.map(d => d.category));
assert(categories.has('furniture'), 'Decor category furniture must exist');
assert(categories.has('lighting'), 'Decor category lighting must exist');
assert(categories.has('plants'), 'Decor category plants must exist');
assert(categories.has('wall'), 'Decor category wall must exist');
assert(categories.has('floor'), 'Decor category floor must exist');
assert(categories.has('japanese_ornaments'), 'Decor category japanese_ornaments must exist');
assert(categories.has('kitsune'), 'Decor category kitsune must exist');

const roomsInDecor = Object.keys(DEFAULT_ROOM_DECOR);
assert(roomsInDecor.includes('exterior'), 'Exterior room decor default must exist');
assert(roomsInDecor.includes('living'), 'Living room decor default must exist');
assert(roomsInDecor.includes('kitchen'), 'Kitchen room decor default must exist');
assert(roomsInDecor.includes('bedroom'), 'Bedroom room decor default must exist');
assert(roomsInDecor.includes('archive'), 'Archive room decor default must exist');
assert(roomsInDecor.includes('engawa'), 'Engawa room decor default must exist');
assert(roomsInDecor.includes('attic'), 'Attic room decor default must exist');
console.log('✓ 4. Home decoration items and 7 room slot layouts verified.');

// -----------------------------------------------------------------------------
// 5. STORAGE & UID-BOUND PERSISTENCE TESTS (Mock LocalStorage)
// -----------------------------------------------------------------------------
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

const testUid = 'test_user_syma_123';

// A. Decor Persistence
const customDecor = { ...DEFAULT_ROOM_DECOR, living: { slot_liv_1: 'fur_futon_cloud' } };
saveResidenceDecor(customDecor, testUid);
const loadedDecor = loadResidenceDecor(testUid);
assert.strictEqual(loadedDecor.living.slot_liv_1, 'fur_futon_cloud', 'Decor must be persisted to UID');

// B. Outfit Persistence
saveResidenceOutfit('celestial_dreamer', testUid);
assert.strictEqual(loadResidenceOutfit(testUid), 'celestial_dreamer', 'Outfit must be persisted to UID');

// C. Weather Persistence
saveResidenceWeather('rain', testUid);
assert.strictEqual(loadResidenceWeather(testUid), 'rain', 'Weather must be persisted to UID');

// D. Chime Persistence
saveResidenceChime('bamboo_whisperer', testUid);
assert.strictEqual(loadResidenceChime(testUid), 'bamboo_whisperer', 'Chime must be persisted to UID');

// E. Cooking History Persistence
saveResidenceCookingHistory([{ recipeId: 'sakura_tea', name: 'Sakura Tea', cookedAt: 12345678 }], testUid);
const history = loadResidenceCookingHistory(testUid);
assert.strictEqual(history.length, 1);
assert.strictEqual(history[0].recipeId, 'sakura_tea');

// F. Attic Unlock Persistence
assert.strictEqual(isAtticUnlocked(testUid), false);
unlockAttic(testUid);
assert.strictEqual(isAtticUnlocked(testUid), true);

console.log('✓ 5. UID-bound persistence verified for decor, outfits, weather, chimes, recipes, and attic.');

// -----------------------------------------------------------------------------
// 6. COLLECTIONS INTEGRATION VERIFICATION
// -----------------------------------------------------------------------------
localStorage.setItem(`olu_syma_gazebo_journal_${testUid}`, JSON.stringify([{ id: 'j1', title: 'Renungan Malam', content: 'Damai...' }]));
const loadedJournals = loadSymaGazeboJournalArchive(testUid);
assert.strictEqual(loadedJournals.length, 1);
assert.strictEqual(loadedJournals[0].title, 'Renungan Malam');

localStorage.setItem(`olu_fishing_v2_${testUid}`, JSON.stringify({ catches: [{ speciesId: 'koi', count: 3 }] }));
const loadedCatches = loadSymaFishingCollectionArchive(testUid);
assert.strictEqual(loadedCatches.length, 1);
assert.strictEqual(loadedCatches[0].speciesId, 'koi');
console.log('✓ 6. Collections integration verified for Gazebo Journal and Whispering Pond Catches.');

// -----------------------------------------------------------------------------
// 7. WEB AUDIO SYNTHESIS ROBUSTNESS IN HEADLESS MODE
// -----------------------------------------------------------------------------
assert.doesNotThrow(() => {
  playSynthesizedChime('lavender_glass');
  setProceduralRainAudio(true);
  setProceduralRainAudio(false);
  playCookingSound(2);
  playBedtimeLullaby();
}, 'Audio synthesis helpers must gracefully handle lack of browser AudioContext');
console.log('✓ 7. Audio synthesis headless safety verified.');

// -----------------------------------------------------------------------------
// 8. INDEX.HTML DOM INTEGRITY CHECKS
// -----------------------------------------------------------------------------
const html = fs.readFileSync('index.html', 'utf8');

assert(html.includes('/pinwheel_residence.css'), 'index.html must link pinwheel_residence.css');
assert(html.includes('id="btn-enter-pinwheel-residence"'), 'index.html must have #btn-enter-pinwheel-residence');
assert(html.includes('id="view-pinwheel-residence"'), 'index.html must have #view-pinwheel-residence container');

const requiredRooms = ['exterior', 'living', 'kitchen', 'bedroom', 'archive', 'engawa', 'attic'];
requiredRooms.forEach(room => {
  assert(html.includes(`data-room="${room}"`), `index.html must contain section for room: ${room}`);
});

assert(html.includes('id="residence-syma-presence"'), 'index.html must have Syma presence avatar');
assert(html.includes('id="residence-modal-backdrop"'), 'index.html must have residence modal backdrop');
assert(html.includes('id="residence-sleep-overlay"'), 'index.html must have sleep overlay');
console.log('✓ 8. HTML DOM structure and 7 rooms verified in index.html.');

// -----------------------------------------------------------------------------
// 9. PINWHEEL_VIEW.JS INTEGRATION CHECKS
// -----------------------------------------------------------------------------
const viewJs = fs.readFileSync('pinwheel_view.js', 'utf8');
assert(viewJs.includes('initPinwheelResidenceView'), 'pinwheel_view.js must import initPinwheelResidenceView');
assert(viewJs.includes('pinwheelResidenceCtrl'), 'pinwheel_view.js must instantiate pinwheelResidenceCtrl');
assert(viewJs.includes('openResidence:'), 'pinwheel_view.js must export openResidence');
assert(viewJs.includes('residenceController:'), 'pinwheel_view.js must export residenceController');
console.log('✓ 9. pinwheel_view.js integration exports verified.');

// -----------------------------------------------------------------------------
// 10. CSS FILE INTEGRITY
// -----------------------------------------------------------------------------
const css = fs.readFileSync('pinwheel_residence.css', 'utf8');
assert(css.includes('.view-pinwheel-residence'), 'CSS must define .view-pinwheel-residence');
assert(css.includes('.atmo-morning'), 'CSS must define .atmo-morning');
assert(css.includes('.atmo-afternoon'), 'CSS must define .atmo-afternoon');
assert(css.includes('.atmo-rain'), 'CSS must define .atmo-rain');
assert(css.includes('.atmo-night'), 'CSS must define .atmo-night');
assert(css.includes('.residence-syma-presence'), 'CSS must define .residence-syma-presence');
assert(css.includes('.scenery-kotatsu-prop'), 'CSS must define kotatsu prop');
assert(css.includes('.scenery-futon-bed'), 'CSS must define futon bed prop');
console.log('✓ 10. CSS styling and atmosphere rules verified.');

console.log('\n🎉 ALL 10 TEST SECTIONS PASSED SUCCESSFULLY!\n');
