/**
 * AUTOMATED TEST SUITE: ROYAN'S UNIVERSE (HOT 🎆) & THE MOONPETAL MANOR
 * 1. UI Cleanup Verification of Royan's Universe (Left Sidebar & Right Residence Button)
 * 2. Five Connected 2D Simulation Rooms
 * 3. Hotspots, Obstacles, Bounds & Collision
 * 4. Elven Recipes, Conservatory Flora, Friendship Letters & Royal Amethyst Relic
 * 5. State Management & Audio Synthesizers
 */

import assert from 'node:assert';
import fs from 'node:fs';
import {
  MOONPETAL_MANOR_CHARACTER,
  MOONPETAL_MANOR_ROOMS,
  MOONPETAL_MANOR_RECIPES,
  MOONPETAL_MANOR_FLORA,
  MOONPETAL_MANOR_LETTERS,
  MOONPETAL_MANOR_COLLECTIBLES,
  MOONPETAL_MANOR_TASKS,
  MOONPETAL_MANOR_ATMOSPHERES,
  getDefaultMoonpetalHavenState,
  loadMoonpetalHavenState,
  saveMoonpetalHavenState,
  resetMoonpetalHavenState,
  playElvenPianoNote,
  playElvenHarpChime,
  playCrystalSparkle,
  playTeapotSimmer
} from './moonpetal_manor_state.js';

let passed = 0;
let total = 0;

function it(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  ✅ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${desc}`);
    console.error(err);
  }
}

console.log('\n======================================================');
console.log('🧪 TESTING ROYAN UI CLEANUP & THE MOONPETAL MANOR');
console.log('======================================================\n');

// -------------------------------------------------------------
// Test 1: Royan Profile Sidebar in index.html & hot.css
// -------------------------------------------------------------
it('1. Royan profile sidebar has strict vertical structure without duplicate collision', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const css = fs.readFileSync('hot.css', 'utf8');

  // Must contain all 6 ordered items:
  assert(html.includes('hot-profile-avatar-img'), 'Avatar image present');
  assert(html.includes('ROYAN 🎆'), 'Character name present');
  assert(html.includes('The Gentle Guardian · Elven'), 'Title present');
  assert(html.includes('hot-profile-status-block'), 'Status & mood present');
  assert(html.includes('“Even the quietest souls can make the brightest difference.”'), 'Quote present');
  assert(html.includes('HOT • The Enchanted Elven Sanctuary'), 'Universe name info present');
  assert(html.includes('hot-sidebar-pet-shortcut'), 'Kip pet shortcut present');

  // Check CSS: hot-header-left is hidden to prevent overlap
  assert(css.includes('.hot-header-left {\n  display: none !important;'), 'hot-header-left hidden to prevent collision');
  assert(css.includes('.hot-profile-sidebar {'), 'hot-profile-sidebar styles defined');
});

// -------------------------------------------------------------
// Test 2: Moonpetal Manor Residence Button Positioned on the Right
// -------------------------------------------------------------
it('2. Residence button renamed to Moonpetal Manor and placed on the right side', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const css = fs.readFileSync('hot.css', 'utf8');

  assert(html.includes('id="btn-loc-hot-residence"'), 'btn-loc-hot-residence exists in DOM');
  assert(html.includes('Moonpetal Manor'), 'Label text is Moonpetal Manor');
  assert(html.includes('hot-loc-tooltip'), 'Tooltip element exists');

  // Check CSS right-side placement
  assert(css.includes('right: clamp(1.5rem, 3.5vw, 3.5rem);'), 'Positioned on right side');
  assert(css.includes('.btn-loc-hot-residence:hover .hot-loc-tooltip'), 'Hover tooltip rule exists');
});

// -------------------------------------------------------------
// Test 3: Other 7 HOT Landmarks Preserved Intact
// -------------------------------------------------------------
it('3. Other 7 landmarks in universe HOT are preserved and untouched', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const landmarks = [
    'btn-loc-hot-observatory',
    'btn-loc-hot-gazebo',
    'btn-loc-hot-mailbox',
    'btn-loc-hot-garden',
    'btn-loc-hot-gecko',
    'btn-loc-hot-pond',
    'btn-loc-hot-waterfall'
  ];

  landmarks.forEach(id => {
    assert(html.includes(`id="${id}"`), `Landmark ${id} must exist in index.html`);
  });
});

// -------------------------------------------------------------
// Test 4: Moonpetal Manor 5 Rooms Architecture
// -------------------------------------------------------------
it('4. The Moonpetal Manor defines 5 connected rooms with bounds & obstacles', () => {
  assert.strictEqual(MOONPETAL_MANOR_ROOMS.length, 5, 'Must have exactly 5 rooms');
  const expectedRoomIds = ['living', 'bedroom', 'kitchen', 'conservatory', 'atelier'];
  expectedRoomIds.forEach(id => {
    const room = MOONPETAL_MANOR_ROOMS.find(r => r.id === id);
    assert(room, `Room ${id} must exist`);
    assert(room.bounds, `Room ${id} must have movement bounds`);
    assert(room.obstacles.length >= 2, `Room ${id} must have collision obstacles`);
    assert(room.hotspots.length >= 5, `Room ${id} must have interactive hotspots`);
    assert(fs.existsSync(`public${room.bgImage}`), `Room background image public${room.bgImage} must exist on disk`);
  });
});

// -------------------------------------------------------------
// Test 5: 5 Special Elven Recipes Catalog
// -------------------------------------------------------------
it('5. Elven Recipes catalog contains 5 magical delicacies with buffs', () => {
  assert.strictEqual(MOONPETAL_MANOR_RECIPES.length, 5, 'Must have 5 recipes');
  const expected = ['moonpetal_dew_tea', 'amethyst_berry_tart', 'starlight_ambrosia', 'silverleaf_brioche', 'twilight_nectar_parfait'];
  expected.forEach(id => {
    const r = MOONPETAL_MANOR_RECIPES.find(rec => rec.id === id);
    assert(r, `Recipe ${id} exists`);
    assert(r.ingredients.length >= 3, `Recipe ${id} has ingredients`);
    assert(r.buff, `Recipe ${id} provides a buff`);
  });
});

// -------------------------------------------------------------
// Test 6: 4 Conservatory Magical Flora
// -------------------------------------------------------------
it('6. Conservatory Flora catalog contains 4 magical plants', () => {
  assert.strictEqual(MOONPETAL_MANOR_FLORA.length, 4, 'Must have 4 flora');
  const expected = ['flora_moonpetal_orchid', 'flora_starlight_lotus', 'flora_amethyst_fern', 'flora_glimmering_sunberry'];
  expected.forEach(id => {
    const f = MOONPETAL_MANOR_FLORA.find(flora => flora.id === id);
    assert(f, `Flora ${id} exists`);
    assert(f.yield, `Flora ${id} has harvest yield`);
  });
});

// -------------------------------------------------------------
// Test 7: 7 Friendship Letters from Cross-Universe Companions
// -------------------------------------------------------------
it('7. Friendship Letters archive contains 7 letters from all companions', () => {
  assert.strictEqual(MOONPETAL_MANOR_LETTERS.length, 7, 'Must have 7 letters');
  const senders = ['Nyanya ⭐', 'Lala ☀️', 'Lele 🌙', 'Akhira ⚡', 'Ela 🌸', 'Ruben 🐉', 'Syma ☁️'];
  senders.forEach(s => {
    const letter = MOONPETAL_MANOR_LETTERS.find(l => l.sender === s);
    assert(letter, `Letter from ${s} exists`);
    assert(letter.content.length > 20, `Letter from ${s} has meaningful content`);
  });
});

// -------------------------------------------------------------
// Test 8: Collectibles & Exclusive Royal Amethyst Relic
// -------------------------------------------------------------
it('8. Collectibles catalog includes the exclusive Royal Amethyst Relic', () => {
  const relic = MOONPETAL_MANOR_COLLECTIBLES.find(c => c.id === 'relic_royal_amethyst');
  assert(relic, 'Royal Amethyst Relic must exist');
  assert.strictEqual(relic.rarity, 'Eksklusif & Legendaris');
  assert(relic.location.includes('Atelier'), 'Located in Memory Atelier');
});

// -------------------------------------------------------------
// Test 9: Web Audio API Synthesizers
// -------------------------------------------------------------
it('9. Web Audio API synthesizers are defined and call safely without throwing', () => {
  assert.strictEqual(typeof playElvenPianoNote, 'function');
  assert.strictEqual(typeof playElvenHarpChime, 'function');
  assert.strictEqual(typeof playCrystalSparkle, 'function');
  assert.strictEqual(typeof playTeapotSimmer, 'function');

  // Should run without throwing in Node environment (guarded window checks)
  playElvenPianoNote(440);
  playElvenHarpChime();
  playCrystalSparkle();
  playTeapotSimmer();
});

// -------------------------------------------------------------
// Test 10: State Management & Resilient Persistence
// -------------------------------------------------------------
it('10. State management handles default state, loading, saving and reset', () => {
  const mockStorage = {};
  global.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  };

  const defaultState = getDefaultMoonpetalHavenState();
  assert.strictEqual(defaultState.character, 'Royan');
  assert.strictEqual(defaultState.currentRoom, 'living');
  assert(defaultState.inventory.length >= 3);

  // Save state
  const saved = saveMoonpetalHavenState(defaultState);
  assert.strictEqual(saved, true, 'State should save successfully');

  // Load state
  const loaded = loadMoonpetalHavenState();
  assert.strictEqual(loaded.character, 'Royan');
  assert.strictEqual(loaded.currentRoom, 'living');

  // Reset state
  const resetState = resetMoonpetalHavenState();
  assert.strictEqual(resetState.character, 'Royan');
});

console.log(`\n======================================================`);
console.log(`📊 RESULTS: ${passed}/${total} TESTS PASSED`);
console.log(`======================================================\n`);

if (passed !== total) {
  process.exit(1);
}
