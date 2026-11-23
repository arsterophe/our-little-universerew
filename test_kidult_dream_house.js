/**
 * TEST SUITE: KIDULT DREAM HOUSE — NYANYA ⭐
 * Universe: KIDULT (Nyanya's Universe)
 * 
 * Verifies:
 * 1. 2D Simulation Architecture (5 rooms: Living, Bedroom, Kitchen, Hobby, Attic)
 * 2. Visual assets existence and 16:9 widescreen storybook styling
 * 3. Gameplay systems: Vintage Toy Piano, Little Kitchen Recipes, Creative Hobby Projects, Memory Attic 8 Friends Letters
 * 4. Isolated storage persistence (kidult_dream_house_state_nyanya)
 * 5. Web Audio synthesizers (Toy Piano, Chime, Music Box Lullaby, Cooking Sizzle)
 * 6. DOM elements, Touch D-pad, HUD pills, and Modals in index.html
 * 7. universes_view.js integration with KIDULT map hotspot and lifecycle exports
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  KIDULT_HOUSE_CHARACTER,
  KIDULT_HOUSE_ROOMS,
  KIDULT_RECIPES,
  KIDULT_HOBBY_PROJECTS,
  KIDULT_MEMORY_ITEMS,
  KIDULT_HOUSE_TASKS,
  KIDULT_ATMOSPHERES,
  loadKidultHouseState,
  saveKidultHouseState,
  playToyPianoNote,
  playKidultChime,
  playMusicBoxLullaby,
  playCookingSizzle
} from './kidult_house_state.js';
import { KIDULT_LOCATIONS } from './universes_view.js';

let testsPassed = 0;
let testsFailed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
    testsFailed++;
  }
}

console.log('================================================================');
console.log('  TESTING KIDULT DREAM HOUSE — NYANYA ⭐ (2D GAME SIMULATION)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. CHARACTER IDENTITY & THEME PALETTE
// -----------------------------------------------------------------------------
console.log('[1] Character Identity & Aesthetics');

runTest('Character metadata and house branding match KIDULT Dream House', () => {
  assert.strictEqual(KIDULT_HOUSE_CHARACTER.key, 'nyanya');
  assert.strictEqual(KIDULT_HOUSE_CHARACTER.name, 'Nyanya');
  assert.strictEqual(KIDULT_HOUSE_CHARACTER.symbol, '⭐');
  assert.strictEqual(KIDULT_HOUSE_CHARACTER.houseName, 'KIDULT DREAM HOUSE');
  assert.ok(KIDULT_HOUSE_CHARACTER.palette.primary, 'Must define primary pastel pink');
  assert.ok(KIDULT_HOUSE_CHARACTER.palette.secondary, 'Must define secondary lavender');
  assert.ok(KIDULT_HOUSE_CHARACTER.palette.accent, 'Must define champagne gold');
});

// -----------------------------------------------------------------------------
// 2. FIVE CONNECTED ROOMS ARCHITECTURE & OBSTACLES
// -----------------------------------------------------------------------------
console.log('\n[2] Five Connected Rooms Architecture');

runTest('Contains exactly 5 interconnected rooms (Living, Bedroom, Kitchen, Hobby, Attic)', () => {
  assert.strictEqual(KIDULT_HOUSE_ROOMS.length, 5);
  const expectedRoomIds = ['living', 'bedroom', 'kitchen', 'hobby', 'attic'];
  const actualIds = KIDULT_HOUSE_ROOMS.map(r => r.id);
  assert.deepStrictEqual(actualIds, expectedRoomIds);
});

runTest('Each room has valid metadata, bounds (minX/maxX/minY/maxY), spawn, and obstacles', () => {
  KIDULT_HOUSE_ROOMS.forEach(room => {
    assert.ok(room.id, 'Room must have id');
    assert.ok(room.name, `Room ${room.id} must have name`);
    assert.ok(room.subtitle, `Room ${room.id} must have subtitle`);
    assert.ok(room.icon, `Room ${room.id} must have icon`);
    assert.ok(room.bgImage, `Room ${room.id} must have bgImage`);
    assert.ok(room.bounds, `Room ${room.id} must have bounds`);
    assert.ok(room.bounds.minX < room.bounds.maxX, `Room ${room.id} x bounds invalid`);
    assert.ok(room.bounds.minY < room.bounds.maxY, `Room ${room.id} y bounds invalid`);
    assert.ok(typeof room.spawnX === 'number' && typeof room.spawnY === 'number');
    assert.ok(Array.isArray(room.obstacles), `Room ${room.id} obstacles must be array`);
  });
});

runTest('Hotspots are properly placed with interactive actions across all 5 rooms', () => {
  let totalHotspots = 0;
  KIDULT_HOUSE_ROOMS.forEach(room => {
    assert.ok(Array.isArray(room.hotspots), `Room ${room.id} hotspots must be array`);
    assert.ok(room.hotspots.length >= 6, `Room ${room.id} should have at least 6 hotspots`);
    room.hotspots.forEach(h => {
      assert.ok(h.id, 'Hotspot must have id');
      assert.ok(h.label, 'Hotspot must have label');
      assert.ok(typeof h.x === 'number' && typeof h.y === 'number', 'Hotspot coordinates invalid');
      assert.ok(h.action, 'Hotspot must have an action');
      assert.ok(h.prompt, 'Hotspot must have a prompt');
      totalHotspots++;
    });
  });
  assert.ok(totalHotspots >= 30, `Expected >= 30 total hotspots, found ${totalHotspots}`);
});

// -----------------------------------------------------------------------------
// 3. CATALOGS: RECIPES, HOBBY PROJECTS, 8 FRIENDS LETTERS & TASKS
// -----------------------------------------------------------------------------
console.log('\n[3] Gameplay Catalogs & Systems');

runTest('Little Kitchen recipes catalog has 5 fairytale pastries and drinks', () => {
  assert.strictEqual(KIDULT_RECIPES.length, 5);
  KIDULT_RECIPES.forEach(r => {
    assert.ok(r.id && r.name && r.icon && r.desc && r.bakeTime);
    assert.ok(Array.isArray(r.ingredients) && r.ingredients.length >= 3);
  });
});

runTest('Creative Hobby Room projects catalog has 5 art and craft activities', () => {
  assert.strictEqual(KIDULT_HOBBY_PROJECTS.length, 5);
  KIDULT_HOBBY_PROJECTS.forEach(p => {
    assert.ok(p.id && p.title && p.icon && p.category && p.desc);
    assert.ok(Array.isArray(p.materials) && p.materials.length >= 2);
  });
});

runTest('Memory Attic contains heartfelt letters from all 8 characters', () => {
  assert.strictEqual(KIDULT_MEMORY_ITEMS.length, 8);
  const chars = KIDULT_MEMORY_ITEMS.map(m => m.char);
  assert.ok(chars.some(c => c.includes('Nyanya')));
  assert.ok(chars.some(c => c.includes('Lala')));
  assert.ok(chars.some(c => c.includes('Lele')));
  assert.ok(chars.some(c => c.includes('Kiki')));
  assert.ok(chars.some(c => c.includes('Momo')));
  assert.ok(chars.some(c => c.includes('Titi')));
  assert.ok(chars.some(c => c.includes('Bubu')));
  assert.ok(chars.some(c => c.includes('Yuyu')));
});

runTest('Daily house tasks and 3 lighting atmospheres are defined', () => {
  assert.ok(KIDULT_HOUSE_TASKS.length >= 5);
  assert.strictEqual(KIDULT_ATMOSPHERES.length, 3);
});

// -----------------------------------------------------------------------------
// 4. ISOLATED STATE PERSISTENCE
// -----------------------------------------------------------------------------
console.log('\n[4] Isolated Storage Persistence');

runTest('Operates on isolated key kidult_dream_house_state_nyanya', () => {
  const storageMap = {};
  globalThis.localStorage = {
    getItem: (k) => storageMap[k] || null,
    setItem: (k, v) => { storageMap[k] = String(v); },
    removeItem: (k) => { delete storageMap[k]; }
  };

  const initial = loadKidultHouseState('nyanya');
  assert.ok(initial, 'Initial state must be returned');
  assert.strictEqual(initial.owner, 'nyanya');
  assert.strictEqual(initial.currentRoom, 'living');

  initial.currentRoom = 'hobby';
  initial.bakedItemsCount = 4;
  saveKidultHouseState('nyanya', initial);

  assert.ok(storageMap['kidult_dream_house_state_nyanya'], 'Must be stored in isolated key');
  assert.strictEqual(storageMap['kidult_dream_house_state_lala'], undefined, 'Must not touch other character keys');

  const reloaded = loadKidultHouseState('nyanya');
  assert.strictEqual(reloaded.currentRoom, 'hobby');
  assert.strictEqual(reloaded.bakedItemsCount, 4);
});

// -----------------------------------------------------------------------------
// 5. WEB AUDIO SYNTHESIZERS
// -----------------------------------------------------------------------------
console.log('\n[5] Web Audio Synthesizers');

runTest('Audio synthesizer functions are callable without throwing in Node', () => {
  assert.strictEqual(typeof playToyPianoNote, 'function');
  assert.strictEqual(typeof playKidultChime, 'function');
  assert.strictEqual(typeof playMusicBoxLullaby, 'function');
  assert.strictEqual(typeof playCookingSizzle, 'function');
  playToyPianoNote(60);
  playKidultChime();
  playMusicBoxLullaby();
  playCookingSizzle();
});

// -----------------------------------------------------------------------------
// 6. HIGH-RESOLUTION ASSETS VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n[6] High-Resolution 16:9 Environment Assets');

const requiredAssets = [
  'public/assets/kidult_house_living.jpg',
  'public/assets/kidult_house_bedroom.jpg',
  'public/assets/kidult_house_kitchen.jpg',
  'public/assets/kidult_house_hobby.jpg',
  'public/assets/kidult_house_attic.jpg',
  'public/assets/chibi_nyanya_avatar.png'
];

requiredAssets.forEach(assetPath => {
  runTest(`Asset exists and has substantial size: ${assetPath}`, () => {
    assert.ok(fs.existsSync(assetPath), `Asset ${assetPath} must exist on disk`);
    const stats = fs.statSync(assetPath);
    assert.ok(stats.size > 100000, `Asset ${assetPath} must be > 100KB`);
  });
});

// -----------------------------------------------------------------------------
// 7. HTML DOM STRUCTURE & CSS STYLES
// -----------------------------------------------------------------------------
console.log('\n[7] HTML DOM & CSS Styles Integration');

runTest('index.html contains all 2D simulation stage, avatar, D-pad and modal elements', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('/kidult_house.css'), 'index.html must link kidult_house.css in head');
  assert.ok(html.includes('id="view-everdream-house"'), 'index.html must contain #view-everdream-house');
  assert.ok(html.includes('id="kidult-house-stage"'), 'Must contain 2D simulation stage');
  assert.ok(html.includes('id="kidult-house-bg-img"'), 'Must contain background image element');
  assert.ok(html.includes('id="kidult-house-hotspots-container"'), 'Must contain hotspots container');
  assert.ok(html.includes('id="kidult-house-player-avatar"'), 'Must contain player avatar');
  assert.ok(html.includes('id="kidult-house-interaction-prompt"'), 'Must contain proximity prompt');
  assert.ok(html.includes('id="btn-kidult-house-back"'), 'Must contain return back button');
  assert.ok(html.includes('id="kidult-house-room-title"'), 'Must contain room title');
  assert.ok(html.includes('id="kidult-house-room-subtitle"'), 'Must contain room subtitle');
  assert.ok(html.includes('id="kidult-house-nav-pills"'), 'Must contain room nav pills');
  assert.ok(html.includes('id="kidult-house-modal-backdrop"'), 'Must contain modal backdrop');
  assert.ok(html.includes('id="kidult-house-sleep-overlay"'), 'Must contain sleep overlay');
  assert.ok(html.includes('id="kidult-house-dpad"'), 'Must contain mobile touch D-pad');
});

runTest('kidult_house.css contains responsive 16:9 stage and playful pastel styling', () => {
  const css = fs.readFileSync('kidult_house.css', 'utf8');
  assert.ok(css.includes('.kidult-house-stage'), 'CSS must style .kidult-house-stage');
  assert.ok(css.includes('aspect-ratio: 16 / 9'), 'Stage must have 16:9 aspect ratio');
  assert.ok(css.includes('.kidult-house-player-avatar'), 'CSS must style player avatar');
  assert.ok(css.includes('.kidult-piano-keyboard'), 'CSS must style toy piano keyboard');
  assert.ok(css.includes('.kidult-house-modal-backdrop'), 'CSS must style modal backdrop');
});

// -----------------------------------------------------------------------------
// 8. UNIVERSE INTEGRATION & CONTROLLER EXPORTS
// -----------------------------------------------------------------------------
console.log('\n[8] KIDULT Universe Integration');

runTest('KIDULT_LOCATIONS.rumah is configured with KIDULT DREAM HOUSE branding', () => {
  assert.ok(KIDULT_LOCATIONS.rumah);
  assert.ok(KIDULT_LOCATIONS.rumah.title.includes('KIDULT DREAM HOUSE'));
  assert.strictEqual(KIDULT_LOCATIONS.rumah.actionType, 'everdream_house');
});

runTest('universes_view.js exports kidultHouseController and lifecycle methods', () => {
  const uv = fs.readFileSync('universes_view.js', 'utf8');
  assert.ok(uv.includes('initKidultHouseView'), 'Must import initKidultHouseView');
  assert.ok(uv.includes('kidultHouseController:'), 'Must export kidultHouseController');
  assert.ok(uv.includes('openKidultHouse:'), 'Must export openKidultHouse');
  assert.ok(uv.includes('closeKidultHouse:'), 'Must export closeKidultHouse');
});

console.log('\n================================================================');
console.log(`  KIDULT DREAM HOUSE TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('================================================================\n');

if (testsFailed > 0) {
  process.exit(1);
}
