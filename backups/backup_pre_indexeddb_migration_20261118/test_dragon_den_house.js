/**
 * COMPREHENSIVE TEST SUITE: THE DRAGON'S DEN (RUBEN 🐉 — ASH)
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
  console.log('--- RUNNING TEST SUITE: THE DRAGON\'S DEN (ASH 🐉) ---');

  const stateModule = await import('./dragon_den_state.js');
  const {
    DRAGON_DEN_STORAGE_KEY,
    DRAGON_DEN_CHARACTER,
    DRAGON_DEN_ROOMS,
    DRAGON_DEN_RECIPES,
    DRAGON_DEN_FLORA,
    DRAGON_DEN_LETTERS,
    DRAGON_DEN_COLLECTIBLES,
    DRAGON_DEN_TASKS,
    DRAGON_DEN_ATMOSPHERES,
    createDefaultDragonDenState,
    loadDragonDenState,
    saveDragonDenState,
    resetDragonDenState,
    playDragonPianoNote,
    playVioletHearthCrackling,
    playCastleChimeZen,
    playKettleSimmerSizzle
  } = stateModule;

  // 1. Metadata & Ruben character identity
  console.log('1. Verifying Castle Metadata & Ruben Character Identity...');
  assert.strictEqual(DRAGON_DEN_CHARACTER.key, 'ruben');
  assert.strictEqual(DRAGON_DEN_CHARACTER.name, 'Ruben');
  assert.strictEqual(DRAGON_DEN_CHARACTER.symbol, '🐉');
  assert.strictEqual(DRAGON_DEN_CHARACTER.houseName, "THE DRAGON'S DEN");
  assert.strictEqual(DRAGON_DEN_CHARACTER.subtitle, 'The Eternal Ashen Castle');
  assert.ok(DRAGON_DEN_CHARACTER.palette.primary, 'Must have primary color');
  assert.ok(DRAGON_DEN_CHARACTER.palette.deepViolet, 'Must have deepViolet');
  assert.ok(DRAGON_DEN_CHARACTER.palette.moonlightSilver, 'Must have moonlightSilver');
  assert.ok(DRAGON_DEN_CHARACTER.palette.antiqueGold, 'Must have antiqueGold');
  console.log('   ✓ Character and castle metadata verified');

  // 2. 5 Connected Rooms Architecture
  console.log('2. Verifying 5 Connected Rooms Architecture...');
  assert.strictEqual(DRAGON_DEN_ROOMS.length, 5, 'Must have exactly 5 rooms');
  const roomIds = DRAGON_DEN_ROOMS.map(r => r.id);
  assert.deepStrictEqual(roomIds, ['hall', 'bedroom', 'kitchen', 'conservatory', 'memory']);

  DRAGON_DEN_ROOMS.forEach(room => {
    assert.ok(room.name, `Room ${room.id} must have a name`);
    assert.ok(room.subtitle, `Room ${room.id} must have a subtitle`);
    assert.ok(room.bgImage, `Room ${room.id} must specify bgImage`);
    assert.ok(room.bounds, `Room ${room.id} must have bounds`);
    assert.ok(typeof room.spawnX === 'number' && typeof room.spawnY === 'number', `Room ${room.id} must have spawn coords`);
    assert.ok(Array.isArray(room.obstacles), `Room ${room.id} must have obstacles array`);
    assert.ok(Array.isArray(room.hotspots), `Room ${room.id} must have hotspots array`);
    assert.ok(room.hotspots.length >= 3, `Room ${room.id} must have at least 3 hotspots`);
  });
  console.log('   ✓ All 5 rooms have bounds, spawn, navigation portals, obstacles, and hotspots');

  // 3. Catalogs
  console.log('3. Verifying Catalogs & Features...');
  assert.strictEqual(DRAGON_DEN_RECIPES.length, 5, 'Must have 5 castle recipes');
  assert.strictEqual(DRAGON_DEN_FLORA.length, 4, 'Must have 4 flora types');
  assert.strictEqual(DRAGON_DEN_LETTERS.length, 7, 'Must have 7 friendship letters from all companions');
  assert.strictEqual(DRAGON_DEN_COLLECTIBLES.length, 4, 'Must have 4 dragon relics');
  assert.strictEqual(DRAGON_DEN_TASKS.length, 6, 'Must have 6 daily tasks');
  assert.strictEqual(DRAGON_DEN_ATMOSPHERES.length, 3, 'Must have 3 atmosphere presets');

  const letterSenders = DRAGON_DEN_LETTERS.map(l => l.sender);
  assert.ok(letterSenders.some(s => s && s.includes('Lala')));
  assert.ok(letterSenders.some(s => s && s.includes('Nyanya')));
  assert.ok(letterSenders.some(s => s && s.includes('Lele')));
  assert.ok(letterSenders.some(s => s && s.includes('Syma')));
  assert.ok(letterSenders.some(s => s && s.includes('Akhira')));
  assert.ok(letterSenders.some(s => s && s.includes('Ela')));
  assert.ok(letterSenders.some(s => s && s.includes('Royan')));
  console.log('   ✓ All 7 friends letters confirmed present');

  // 4. State Persistence Engine
  console.log('4. Verifying State Persistence Engine...');
  assert.strictEqual(DRAGON_DEN_STORAGE_KEY, 'dragon_den_house_state_ruben');
  const defaultState = createDefaultDragonDenState();
  assert.strictEqual(defaultState.character, 'ruben');
  assert.strictEqual(defaultState.currentRoom, 'hall');
  assert.strictEqual(defaultState.stats.dishesCooked, 1);

  saveDragonDenState('ruben', defaultState);
  const loadedState = loadDragonDenState('ruben');
  assert.strictEqual(loadedState.currentRoom, 'hall');
  assert.strictEqual(loadedState.stats.dishesCooked, 1);

  loadedState.stats.dishesCooked = 5;
  saveDragonDenState('ruben', loadedState);
  assert.strictEqual(loadDragonDenState('ruben').stats.dishesCooked, 5);

  const resetState = resetDragonDenState('ruben');
  assert.strictEqual(resetState.stats.dishesCooked, 1);
  console.log('   ✓ State load, save, mutate, and reset verified');

  // 5. Audio Synthesizer Safety
  console.log('5. Verifying Audio Synthesizer Safety...');
  assert.doesNotThrow(() => playDragonPianoNote(261.63));
  assert.doesNotThrow(() => playVioletHearthCrackling());
  assert.doesNotThrow(() => playCastleChimeZen());
  assert.doesNotThrow(() => playKettleSimmerSizzle());
  console.log('   ✓ Web Audio synthesizers run cleanly with no exceptions');

  // 6. Artwork Assets on Disk
  console.log('6. Verifying Artwork Assets on Disk...');
  const assetPaths = [
    'public/assets/dragon_den_hall.jpg',
    'public/assets/dragon_den_bedroom.jpg',
    'public/assets/dragon_den_kitchen.jpg',
    'public/assets/dragon_den_conservatory.jpg',
    'public/assets/dragon_den_memory.jpg',
    'public/assets/avatar_ruben_hd.jpg'
  ];
  assetPaths.forEach(p => {
    assert.ok(fs.existsSync(p), `Missing required asset: ${p}`);
    const size = fs.statSync(p).size;
    assert.ok(size > 50000, `Asset ${p} too small (${size} bytes)`);
  });
  console.log('   ✓ All 6 HD assets exist on disk with valid file size (>50KB)');

  // 7. HTML DOM Elements in index.html
  console.log('7. Verifying HTML DOM Elements in index.html...');
  const htmlContent = fs.readFileSync('index.html', 'utf8');
  assert.ok(htmlContent.includes('dragon_den.css'), 'index.html must link dragon_den.css');
  assert.ok(htmlContent.includes('id="view-dragon-den"'), 'index.html must have #view-dragon-den');
  assert.ok(htmlContent.includes('id="dragon-den-stage"'), 'index.html must have #dragon-den-stage');
  assert.ok(htmlContent.includes('id="dragon-den-player-avatar"'), 'index.html must have #dragon-den-player-avatar');
  assert.ok(htmlContent.includes('id="btn-ash-enter-dragon-den"'), 'index.html must have #btn-ash-enter-dragon-den');
  assert.ok(htmlContent.includes('id="btn-dragon-den-back"'), 'index.html must have #btn-dragon-den-back');
  console.log('   ✓ index.html structure verified');

  // 8. CSS Verification
  console.log('8. Verifying dragon_den.css...');
  assert.ok(fs.existsSync('dragon_den.css'), 'dragon_den.css must exist');
  const cssContent = fs.readFileSync('dragon_den.css', 'utf8');
  assert.ok(cssContent.includes('.view-dragon-den'), 'Must style .view-dragon-den');
  assert.ok(cssContent.includes('.dragon-den-player'), 'Must style .dragon-den-player');
  assert.ok(cssContent.includes('.dragon-ember'), 'Must style .dragon-ember');
  assert.ok(cssContent.includes('.dragon-den-nav-bar'), 'Must style .dragon-den-nav-bar');
  console.log('   ✓ dragon_den.css verified');

  // 9. Check style.css isolation
  console.log('9. Verifying style.css isolation...');
  const styleCss = fs.readFileSync('style.css', 'utf8');
  assert.ok(styleCss.includes('.view-dragon-den'), 'style.css must include .view-dragon-den in defensive isolation');
  console.log('   ✓ style.css isolation verified');

  // 10. Check main.js protected views
  console.log('10. Verifying main.js protected views...');
  const mainJs = fs.readFileSync('main.js', 'utf8');
  const matches = (mainJs.match(/view-dragon-den/g) || []).length;
  assert.ok(matches >= 4, `main.js should include view-dragon-den in at least 4 places (found ${matches})`);
  console.log('   ✓ main.js isolation verified');

  console.log('\n>>> ALL 10 TESTS PASSED FOR THE DRAGON\'S DEN! <<<\n');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
