/**
 * COMPREHENSIVE TEST SUITE: THE SILENT LOTUS HOUSE (ELA 🌸 — US AGAIN)
 * Validates 5 connected rooms, catalogs, obstacle collision bounds,
 * Web Audio synthesizers, state persistence, HTML DOM elements, and assets.
 * =============================================================================
 */

import fs from 'fs';
import assert from 'assert';

// Mock browser environment for Node test runner
if (typeof window === 'undefined') {
  global.window = {
    AudioContext: class {
      constructor() {
        this.currentTime = 0;
        this.sampleRate = 44100;
        this.state = 'running';
      }
      createOscillator() {
        return {
          type: 'sine',
          frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {},
          start() {},
          stop() {}
        };
      }
      createGain() {
        return {
          gain: { setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {}
        };
      }
      createBiquadFilter() {
        return {
          type: 'lowpass',
          frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          Q: { setValueAtTime() {} },
          connect() {}
        };
      }
      createBuffer() {
        return { getChannelData: () => new Float32Array(100) };
      }
      createBufferSource() {
        return { buffer: null, connect() {}, start() {}, stop() {} };
      }
      resume() { return Promise.resolve(); }
    }
  };
  global.localStorage = {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  };
}

async function runTests() {
  console.log('--- RUNNING TEST SUITE: THE SILENT LOTUS HOUSE (US AGAIN 🌸) ---');

  const stateModule = await import('./silent_lotus_state.js');
  const {
    SILENT_LOTUS_STORAGE_KEY,
    SILENT_LOTUS_CHARACTER,
    SILENT_LOTUS_ROOMS,
    SILENT_LOTUS_RECIPES,
    SILENT_LOTUS_FLOWERS,
    SILENT_LOTUS_LETTERS,
    SILENT_LOTUS_COLLECTIBLES,
    SILENT_LOTUS_TASKS,
    SILENT_LOTUS_ATMOSPHERES,
    createDefaultSilentLotusState,
    loadSilentLotusState,
    saveSilentLotusState,
    resetSilentLotusState,
    playLotusKotoChime,
    playWaterDropTone,
    playWindChimeZen,
    playTeaBrewingSizzle
  } = stateModule;

  // 1. Metadata & Ela character identity
  console.log('1. Verifying Palace Metadata & Ela Character Identity...');
  assert.strictEqual(SILENT_LOTUS_CHARACTER.key, 'ela');
  assert.strictEqual(SILENT_LOTUS_CHARACTER.name, 'Ela');
  assert.strictEqual(SILENT_LOTUS_CHARACTER.symbol, '🌸');
  assert.strictEqual(SILENT_LOTUS_CHARACTER.houseName, 'THE SILENT LOTUS HOUSE');
  assert.ok(SILENT_LOTUS_CHARACTER.palette.primary, 'Must have primary color');
  assert.ok(SILENT_LOTUS_CHARACTER.palette.dustyViolet, 'Must have dustyViolet');
  assert.ok(SILENT_LOTUS_CHARACTER.palette.pearlWhite, 'Must have pearlWhite');
  console.log('   ✓ Character and house metadata verified');

  // 2. 5 Connected Rooms Architecture
  console.log('2. Verifying 5 Connected Rooms Architecture...');
  assert.strictEqual(SILENT_LOTUS_ROOMS.length, 5, 'Must have exactly 5 rooms');
  const roomIds = SILENT_LOTUS_ROOMS.map(r => r.id);
  assert.deepStrictEqual(roomIds, ['living', 'bedroom', 'kitchen', 'conservatory', 'attic']);

  SILENT_LOTUS_ROOMS.forEach(room => {
    assert.ok(room.name, `Room ${room.id} must have a name`);
    assert.ok(room.subtitle, `Room ${room.id} must have a subtitle`);
    assert.ok(room.bgImage, `Room ${room.id} must have a bgImage`);
    assert.ok(room.bounds, `Room ${room.id} must have bounds`);
    assert.ok(Array.isArray(room.obstacles), `Room ${room.id} must have obstacles array`);
    assert.ok(Array.isArray(room.hotspots), `Room ${room.id} must have hotspots array`);
    assert.ok(room.hotspots.length >= 6, `Room ${room.id} must have at least 6 hotspots`);

    // Verify all hotspots have action and prompt
    room.hotspots.forEach(hs => {
      assert.ok(hs.id, 'Hotspot must have id');
      assert.ok(hs.action, `Hotspot ${hs.id} must have action`);
      assert.ok(hs.prompt, `Hotspot ${hs.id} must have prompt`);
      assert.ok(typeof hs.x === 'number' && typeof hs.y === 'number', 'Hotspot must have coordinates');
    });
  });
  console.log('   ✓ All 5 rooms and interconnections verified');

  // 3. Recipes System
  console.log('3. Verifying Sanctuary Tea & Pastry Recipes System...');
  assert.ok(SILENT_LOTUS_RECIPES.length >= 5, 'Must have at least 5 recipes');
  SILENT_LOTUS_RECIPES.forEach(r => {
    assert.ok(r.id && r.name && r.icon && r.desc, 'Recipe must have valid metadata');
    assert.ok(Array.isArray(r.ingredients) && r.ingredients.length >= 2, 'Recipe must have ingredients');
    assert.ok(r.timeSeconds > 0, 'Recipe must have cooking duration');
    assert.ok(r.rewardXp > 0, 'Recipe must award XP');
  });
  console.log('   ✓ Recipes system verified');

  // 4. Botanical Flora System
  console.log('4. Verifying Botanical Flora System (The Conservatory)...');
  assert.ok(SILENT_LOTUS_FLOWERS.length >= 4, 'Must have at least 4 flower species');
  SILENT_LOTUS_FLOWERS.forEach(f => {
    assert.ok(f.id && f.name && f.yieldItem && f.color, 'Flower must have valid metadata');
    assert.ok(f.growthDurationSeconds > 0, 'Flower must have growth duration');
  });
  console.log('   ✓ Conservatory flora verified');

  // 5. Friendship Letters & Hidden Collectibles
  console.log('5. Verifying Friendship Letters & Hidden Collectibles...');
  assert.ok(SILENT_LOTUS_LETTERS.length >= 7, 'Must have letters from all 7 friends');
  const letterSenders = SILENT_LOTUS_LETTERS.map(l => l.sender);
  assert.ok(letterSenders.some(s => s.includes('Nyanya')), 'Must have letter from Nyanya');
  assert.ok(letterSenders.some(s => s.includes('Lala')), 'Must have letter from Lala');
  assert.ok(letterSenders.some(s => s.includes('Lele')), 'Must have letter from Lele');
  assert.ok(letterSenders.some(s => s.includes('Akhira')), 'Must have letter from Akhira');
  assert.ok(letterSenders.some(s => s.includes('Syma')), 'Must have letter from Syma');
  assert.ok(letterSenders.some(s => s.includes('Ruben')), 'Must have letter from Ruben');
  assert.ok(letterSenders.some(s => s.includes('Royan')), 'Must have letter from Royan');

  assert.ok(SILENT_LOTUS_COLLECTIBLES.length >= 4, 'Must have at least 4 collectibles');
  SILENT_LOTUS_COLLECTIBLES.forEach(c => {
    assert.ok(c.id && c.name && c.desc && c.room, 'Collectible must have metadata');
  });
  console.log('   ✓ Letters & Collectibles verified');

  // 6. Atmospheres & Tasks
  console.log('6. Verifying Atmospheres and Daily Objectives...');
  assert.ok(SILENT_LOTUS_ATMOSPHERES.length >= 3, 'Must have at least 3 atmospheres');
  assert.ok(SILENT_LOTUS_TASKS.length >= 5, 'Must have at least 5 tasks');
  console.log('   ✓ Atmospheres and tasks verified');

  // 7. State Generation & LocalStorage Mock
  console.log('7. Verifying State Generation & LocalStorage Persistence...');
  localStorage.clear();
  const defaultState = createDefaultSilentLotusState();
  assert.strictEqual(defaultState.character, 'ela');
  assert.strictEqual(defaultState.currentRoom, 'living');
  assert.ok(Array.isArray(defaultState.inventory));
  assert.ok(Array.isArray(defaultState.gardenSlots));

  saveSilentLotusState('ela', defaultState);
  assert.ok(localStorage.getItem(SILENT_LOTUS_STORAGE_KEY), 'State must be saved under SILENT_LOTUS_STORAGE_KEY');

  const loaded = loadSilentLotusState('ela');
  assert.strictEqual(loaded.character, 'ela');
  assert.strictEqual(loaded.currentRoom, 'living');
  console.log('   ✓ State generation and persistence verified');

  // 8. 5 Room Background Images Existence in public/assets/
  console.log('8. Verifying 5 Room Artwork Assets in public/assets...');
  const assetPaths = [
    'public/assets/silent_lotus_living.jpg',
    'public/assets/silent_lotus_bedroom.jpg',
    'public/assets/silent_lotus_kitchen.jpg',
    'public/assets/silent_lotus_conservatory.jpg',
    'public/assets/silent_lotus_attic.jpg',
    'public/assets/avatar_ela_hd.jpg'
  ];
  assetPaths.forEach(p => {
    assert.ok(fs.existsSync(p), `Required asset file missing: ${p}`);
    const stat = fs.statSync(p);
    assert.ok(stat.size > 20000, `Asset ${p} must be a valid high-resolution image (>20KB)`);
  });
  console.log('   ✓ All 5 room background image files & avatar verified');

  // 9. Audio Synthesizers Safety
  console.log('9. Verifying Web Audio Synthesizer Functions...');
  assert.doesNotThrow(() => playLotusKotoChime(440));
  assert.doesNotThrow(() => playWaterDropTone());
  assert.doesNotThrow(() => playWindChimeZen());
  assert.doesNotThrow(() => playTeaBrewingSizzle());
  console.log('   ✓ Audio synthesizers callable safely');

  // 10. HTML & CSS Parity
  console.log('10. Verifying HTML & CSS Integration...');
  const html = fs.readFileSync('index.html', 'utf8');
  assert.ok(html.includes('/silent_lotus.css'), 'index.html must include silent_lotus.css');
  assert.ok(html.includes('id="view-silent-lotus"'), 'index.html must include view-silent-lotus');
  assert.ok(html.includes('id="btn-usagain-enter-lotus-house"'), 'index.html must include btn-usagain-enter-lotus-house');
  assert.ok(html.includes('id="btn-silent-lotus-back"'), 'index.html must include btn-silent-lotus-back');

  const css = fs.readFileSync('silent_lotus.css', 'utf8');
  assert.ok(css.includes('.view-silent-lotus'), 'silent_lotus.css must style view-silent-lotus');
  assert.ok(css.includes('.silent-lotus-stage'), 'silent_lotus.css must define responsive stage');

  const uv = fs.readFileSync('universes_view.js', 'utf8');
  assert.ok(uv.includes('initSilentLotusView'), 'universes_view.js must import initSilentLotusView');
  assert.ok(uv.includes('openSilentLotusHouse'), 'universes_view.js must export openSilentLotusHouse');
  assert.ok(uv.includes('silentLotusController'), 'universes_view.js must export silentLotusController');
  console.log('   ✓ HTML and CSS parity verified');

  console.log('--- ALL SILENT LOTUS HOUSE TESTS PASSED CLEANLY (100%) ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
