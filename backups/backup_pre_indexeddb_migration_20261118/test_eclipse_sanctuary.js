/**
 * TEST SUITE: THE ECLIPSE — THE AUTHOR'S ETERNAL SANCTUARY
 * Universe: SHADOW — Lele 🌙 (The Author / Creator)
 * 
 * Verifies:
 * 1. THE ECLIPSE is the sole main house of Lele in SHADOW.
 * 2. Old house concepts replaced, no duplicate buttons in HUD.
 * 3. Hotspot hotspot-shadow-rumah opens THE ECLIPSE directly.
 * 4. 7 Sanctuary Rooms (Grand Hall, Library, Bedroom, Observatory, Gallery, Secret Chamber, Garden).
 * 5. Strict author privacy gate (Lele/Vanya allowed, other 7 characters blocked).
 * 6. Isolated persistence (the_eclipse_author_state_lele).
 * 7. Audio synthesizer, high-res assets, 16:9 responsive CSS, DOM elements.
 */

import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  ECLIPSE_ROOMS,
  AUTHOR_STORY_DRAFTS,
  OLU_UNIVERSE_LORE,
  CELESTIAL_OBSERVATIONS,
  ROYAL_WARDROBE_COLLECTION,
  isAuthorAuthorized,
  loadEclipseState,
  saveEclipseState,
  playGothicPianoNote,
  playCelestialBell,
  playEclipseChordSuccess
} from './eclipse_state.js';
import { SHADOW_LOCATIONS } from './universes_view.js';

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
console.log('  TESTING THE ECLIPSE: SOLE MAIN HOUSE INTEGRATION (LELE 🌙)');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// 1. MAIN HOUSE INTEGRATION IN SHADOW & NO DUPLICATE BUTTONS
// -----------------------------------------------------------------------------
console.log('[1] Main House Integration in SHADOW');

runTest('SHADOW_LOCATIONS.rumah_kristal is configured as THE ECLIPSE (Sole Main House)', () => {
  assert.ok(SHADOW_LOCATIONS.rumah_kristal, 'rumah_kristal must exist in SHADOW_LOCATIONS');
  const loc = SHADOW_LOCATIONS.rumah_kristal;
  assert.strictEqual(loc.icon, '👑');
  assert.strictEqual(loc.actionType, 'eclipse_sanctuary');
  assert.strictEqual(loc.title, 'THE ECLIPSE — Rumah Lele');
  assert.ok(loc.description.includes('Satu-satunya rumah utama Lele'));
  assert.ok(loc.actionLabel.includes('Masuk ke THE ECLIPSE'));
});

runTest('No duplicate btn-shadow-to-eclipse button in SHADOW navigation HUD', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.strictEqual(html.includes('id="btn-shadow-to-eclipse"'), false, 'Duplicate top-bar button must NOT be present');
});

runTest('Stage hotspot hotspot-shadow-rumah is labeled and styled as THE ECLIPSE', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('hotspot-shadow-rumah'), 'Stage must contain hotspot-shadow-rumah');
  assert.ok(html.includes('THE<br>ECLIPSE'), 'Hotspot pill must display THE ECLIPSE');
  assert.ok(html.includes('Masuk ke THE ECLIPSE — Rumah Utama Lele'), 'Hint must specify Rumah Utama Lele');
});

// -----------------------------------------------------------------------------
// 2. ROOM DEFINITIONS & CONFIGURATION
// -----------------------------------------------------------------------------
console.log('\n[2] Room Architecture & Hotspots');

runTest('Contains exactly 7 sanctuary rooms', () => {
  assert.strictEqual(ECLIPSE_ROOMS.length, 7);
  const expectedRoomIds = ['garden', 'grand_hall', 'library', 'bedroom', 'observatory', 'gallery', 'secret_chamber'];
  const actualIds = ECLIPSE_ROOMS.map(r => r.id);
  assert.deepStrictEqual(actualIds, expectedRoomIds);
});

runTest('Each room has valid metadata, bounds (minX/maxX/minY/maxY), spawn, and obstacles', () => {
  ECLIPSE_ROOMS.forEach(room => {
    assert.ok(room.id, 'Room must have id');
    assert.ok(room.name, `Room ${room.id} must have name`);
    assert.ok(room.subtitle, `Room ${room.id} must have subtitle`);
    assert.ok(room.icon, `Room ${room.id} must have icon`);
    assert.ok(room.bounds, `Room ${room.id} must have bounds`);
    assert.ok(room.bounds.minX < room.bounds.maxX, `Room ${room.id} x bounds invalid`);
    assert.ok(room.bounds.minY < room.bounds.maxY, `Room ${room.id} y bounds invalid`);
    assert.ok(typeof room.spawnX === 'number' && typeof room.spawnY === 'number');
    assert.ok(Array.isArray(room.obstacles), `Room ${room.id} obstacles must be array`);
  });
});

runTest('Hotspots are properly placed with actions across all rooms', () => {
  let totalHotspots = 0;
  ECLIPSE_ROOMS.forEach(room => {
    assert.ok(Array.isArray(room.hotspots), `Room ${room.id} hotspots must be array`);
    assert.ok(room.hotspots.length >= 3, `Room ${room.id} should have at least 3 hotspots`);
    room.hotspots.forEach(h => {
      assert.ok(h.id, 'Hotspot must have id');
      assert.ok(h.label, 'Hotspot must have label');
      assert.ok(typeof h.x === 'number' && typeof h.y === 'number', 'Hotspot coordinates invalid');
      assert.ok(h.action, 'Hotspot must have an action');
      assert.ok(h.prompt, 'Hotspot must have a prompt');
      totalHotspots++;
    });
  });
  assert.ok(totalHotspots >= 25, `Expected >= 25 total hotspots, found ${totalHotspots}`);
});

// -----------------------------------------------------------------------------
// 3. STRICT AUTHOR PRIVACY & ACCESS CONTROL
// -----------------------------------------------------------------------------
console.log('\n[3] Strict Author Privacy & Authorization Gate');

runTest('Allows authorized author identities (lele, vanya, author, casing insensitive)', () => {
  assert.strictEqual(isAuthorAuthorized('lele'), true);
  assert.strictEqual(isAuthorAuthorized('vanya'), true);
  assert.strictEqual(isAuthorAuthorized('LeLe'), true);
  assert.strictEqual(isAuthorAuthorized('VANYA'), true);
  assert.strictEqual(isAuthorAuthorized(' lele '), true);
  assert.strictEqual(isAuthorAuthorized('author'), true);
});

runTest('Strictly blocks all other characters from entering The Eclipse', () => {
  const unauthorizedChars = ['lala', 'nyanya', 'bubu', 'kiki', 'momo', 'titi', 'yuyu', 'guest', 'stranger'];
  unauthorizedChars.forEach(char => {
    assert.strictEqual(isAuthorAuthorized(char), false, `Character ${char} should be rejected!`);
  });
  assert.strictEqual(isAuthorAuthorized(null), false);
  assert.strictEqual(isAuthorAuthorized(''), false);
  assert.strictEqual(isAuthorAuthorized(undefined), false);
});

// -----------------------------------------------------------------------------
// 4. STATE PERSISTENCE & STORAGE ISOLATION
// -----------------------------------------------------------------------------
console.log('\n[4] State Persistence & Isolation');

runTest('Isolated state persistence operates strictly on the_eclipse_author_state_lele', () => {
  // Mock localStorage in Node
  const storageMap = {};
  globalThis.localStorage = {
    getItem: (k) => storageMap[k] || null,
    setItem: (k, v) => { storageMap[k] = String(v); },
    removeItem: (k) => { delete storageMap[k]; }
  };

  // Unauthorized load
  const unauthorizedState = loadEclipseState('lala');
  assert.strictEqual(unauthorizedState, null, 'Unauthorized user must receive null state');

  // Authorized author load (initial default)
  const authorState = loadEclipseState('lele');
  assert.ok(authorState, 'Authorized author should receive default initial state');
  assert.strictEqual(authorState.secretChamberUnlocked, false);

  // Update and save
  authorState.secretChamberUnlocked = true;
  authorState.currentRoom = 'secret_chamber';
  saveEclipseState('lele', authorState);

  // Verify storage key isolation
  assert.ok(storageMap['the_eclipse_author_state_lele'], 'Must be stored in isolated key the_eclipse_author_state_lele');
  assert.strictEqual(storageMap['the_eclipse_author_state_lala'], undefined, 'Must not touch other character keys');

  // Reload and verify
  const reloadedState = loadEclipseState('vanya');
  assert.strictEqual(reloadedState.secretChamberUnlocked, true);
  assert.strictEqual(reloadedState.currentRoom, 'secret_chamber');
});

// -----------------------------------------------------------------------------
// 5. LORE, ARCHIVES & CONTENT REPOSITORY
// -----------------------------------------------------------------------------
console.log('\n[5] Lore & Content Archives');

runTest('Story drafts catalog is complete with excerpt, word count and progress', () => {
  assert.ok(Array.isArray(AUTHOR_STORY_DRAFTS));
  assert.ok(AUTHOR_STORY_DRAFTS.length >= 3);
  AUTHOR_STORY_DRAFTS.forEach(draft => {
    assert.ok(draft.id && draft.title && draft.genre && draft.excerpt && draft.wordCount);
  });
});

runTest('OLU Cosmology Lore includes 9 realms (8 characters + 1 Author Sanctuary)', () => {
  assert.strictEqual(OLU_UNIVERSE_LORE.length, 9);
  const requiredRealms = ['kidult', 'to_you', 'shadow', 'pinwheel', 'yawn', 'us_again', 'ash', 'hot', 'the_eclipse'];
  const actualRealmIds = OLU_UNIVERSE_LORE.map(r => r.id);
  assert.deepStrictEqual(actualRealmIds, requiredRealms);
});

runTest('Celestial constellations and Royal wardrobe collections are populated', () => {
  assert.ok(CELESTIAL_OBSERVATIONS.length >= 4);
  assert.ok(ROYAL_WARDROBE_COLLECTION.length >= 4);
});

// -----------------------------------------------------------------------------
// 6. AUDIO SYNTHESIS ENGINE
// -----------------------------------------------------------------------------
console.log('\n[6] Web Audio Synthesizer Functions');

runTest('Audio synthesizer functions are exported and callable without throwing', () => {
  assert.strictEqual(typeof playGothicPianoNote, 'function');
  assert.strictEqual(typeof playCelestialBell, 'function');
  assert.strictEqual(typeof playEclipseChordSuccess, 'function');
  playGothicPianoNote(60);
  playCelestialBell();
  playEclipseChordSuccess();
});

// -----------------------------------------------------------------------------
// 7. ASSET VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n[7] High-Resolution Assets & Sprites');

const requiredAssets = [
  'public/assets/eclipse_grand_hall.jpg',
  'public/assets/eclipse_library.jpg',
  'public/assets/eclipse_garden.jpg',
  'public/assets/eclipse_observatory.jpg',
  'public/assets/eclipse_bedroom.jpg',
  'public/assets/eclipse_secret_chamber.jpg',
  'public/assets/chibi_lele_avatar.png'
];

requiredAssets.forEach(assetPath => {
  runTest(`Asset exists: ${assetPath}`, () => {
    assert.ok(fs.existsSync(assetPath), `File ${assetPath} should exist on disk`);
    const stats = fs.statSync(assetPath);
    assert.ok(stats.size > 10000, `File ${assetPath} should have substantial content (> 10KB)`);
  });
});

// -----------------------------------------------------------------------------
// 8. HTML DOM STRUCTURE & CSS STYLES
// -----------------------------------------------------------------------------
console.log('\n[8] HTML & CSS Integration');

runTest('index.html contains view-eclipse, btn-eclipse-back (return to SHADOW) and eclipse.css', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('/eclipse.css'), 'index.html must link /eclipse.css in head');
  assert.ok(html.includes('id="view-eclipse"'), 'index.html must contain view-eclipse section');
  assert.ok(html.includes('id="btn-eclipse-back"'), 'index.html must contain return button to SHADOW');
  assert.ok(html.includes('id="eclipse-stage"'), 'index.html must contain eclipse-stage');
  assert.ok(html.includes('id="eclipse-bg-img"'), 'index.html must contain eclipse-bg-img');
  assert.ok(html.includes('id="eclipse-hotspots-container"'), 'index.html must contain hotspots container');
  assert.ok(html.includes('id="eclipse-player-avatar"'), 'index.html must contain player avatar');
  assert.ok(html.includes('id="eclipse-modal-backdrop"'), 'index.html must contain modal backdrop');
  assert.ok(html.includes('id="eclipse-dpad"'), 'index.html must contain touch D-pad');
});

runTest('eclipse.css contains necessary styling classes and responsive 16:9 stage', () => {
  const css = fs.readFileSync('eclipse.css', 'utf8');
  assert.ok(css.includes('.view-eclipse'), 'eclipse.css must have .view-eclipse');
  assert.ok(css.includes('.eclipse-stage'), 'eclipse.css must have .eclipse-stage');
  assert.ok(css.includes('aspect-ratio: 16 / 9'), 'eclipse.css must use 16:9 aspect ratio');
  assert.ok(css.includes('.eclipse-player-avatar'), 'eclipse.css must have .eclipse-player-avatar');
  assert.ok(css.includes('.eclipse-author-halo'), 'eclipse.css must have .eclipse-author-halo');
  assert.ok(css.includes('.eclipse-modal-backdrop'), 'eclipse.css must have .eclipse-modal-backdrop');
});

// -----------------------------------------------------------------------------
// 9. CODEBASE INTEGRATION: main.js & universes_view.js
// -----------------------------------------------------------------------------
console.log('\n[9] Main & Universes View Integration');

runTest('main.js includes view-eclipse in all 4 protected view arrays and forwards crystal tower navigation', () => {
  const main = fs.readFileSync('main.js', 'utf8');
  const count = (main.match(/['"]view-eclipse['"]/g) || []).length;
  assert.strictEqual(count, 4, `Expected view-eclipse 4 times in main.js, found ${count}`);
  assert.ok(main.includes('openEclipseSanctuary'), 'main.js must forward navigation to openEclipseSanctuary');
});

runTest('universes_view.js exports eclipseController, openEclipseSanctuary, and closeEclipseSanctuary', () => {
  const uv = fs.readFileSync('universes_view.js', 'utf8');
  assert.ok(uv.includes('initEclipseView'), 'universes_view.js must import initEclipseView');
  assert.ok(uv.includes('isAuthorAuthorized'), 'universes_view.js must import isAuthorAuthorized');
  assert.ok(uv.includes('eclipseController:'), 'universes_view.js must export eclipseController in return object');
  assert.ok(uv.includes('openEclipseSanctuary:'), 'universes_view.js must export openEclipseSanctuary');
  assert.ok(uv.includes('closeEclipseSanctuary:'), 'universes_view.js must export closeEclipseSanctuary');
});

console.log('\n================================================================');
console.log(`  THE ECLIPSE MAIN HOUSE TEST SUMMARY: ${testsPassed} PASSED, ${testsFailed} FAILED`);
console.log('================================================================\n');

if (testsFailed > 0) {
  process.exit(1);
}
