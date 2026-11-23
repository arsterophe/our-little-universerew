/**
 * COMPREHENSIVE TEST SUITE: THE PINWHEEL HAVEN (SYMA ☁️ — PINWHEEL)
 * Validates 5 connected sky rooms, catalogs, obstacle collision bounds,
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
          type: 'bandpass',
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
  console.log('--- RUNNING TEST SUITE: THE PINWHEEL HAVEN (PINWHEEL ☁️) ---');

  const stateModule = await import('./pinwheel_haven_state.js');
  const {
    PINWHEEL_HAVEN_STORAGE_KEY,
    PINWHEEL_HAVEN_CHARACTER,
    PINWHEEL_HAVEN_ROOMS,
    PINWHEEL_HAVEN_RECIPES,
    PINWHEEL_HAVEN_FLORA,
    PINWHEEL_HAVEN_LETTERS,
    PINWHEEL_HAVEN_COLLECTIBLES,
    PINWHEEL_HAVEN_TASKS,
    PINWHEEL_HAVEN_ATMOSPHERES,
    createDefaultPinwheelHavenState,
    loadPinwheelHavenState,
    savePinwheelHavenState,
    resetPinwheelHavenState,
    playPinwheelPianoNote,
    playSkyWindChime,
    playCloudHarpZen,
    playTeapotSimmer
  } = stateModule;

  // 1. Metadata & Syma character identity
  console.log('1. Verifying Residence Metadata & Syma Character Identity...');
  assert.strictEqual(PINWHEEL_HAVEN_CHARACTER.key, 'syma');
  assert.strictEqual(PINWHEEL_HAVEN_CHARACTER.name, 'Syma');
  assert.strictEqual(PINWHEEL_HAVEN_CHARACTER.symbol, '☁️');
  assert.strictEqual(PINWHEEL_HAVEN_CHARACTER.houseName, 'THE PINWHEEL HAVEN');
  assert.strictEqual(PINWHEEL_HAVEN_CHARACTER.subtitle, "Syma's Floating Sky Residence");
  assert.ok(PINWHEEL_HAVEN_CHARACTER.palette.primary, 'Must have primary color');
  assert.ok(PINWHEEL_HAVEN_CHARACTER.palette.powderBlue, 'Must have powderBlue');
  assert.ok(PINWHEEL_HAVEN_CHARACTER.palette.cloudWhite, 'Must have cloudWhite');
  assert.ok(PINWHEEL_HAVEN_CHARACTER.palette.butterYellow, 'Must have butterYellow');
  console.log('   ✓ Character and residence metadata verified');

  // 2. 5 Connected Rooms Architecture
  console.log('2. Verifying 5 Connected Rooms Architecture...');
  assert.strictEqual(PINWHEEL_HAVEN_ROOMS.length, 5, 'Must have exactly 5 rooms');
  const roomIds = PINWHEEL_HAVEN_ROOMS.map(r => r.id);
  assert.deepStrictEqual(roomIds, ['living', 'bedroom', 'kitchen', 'conservatory', 'attic']);

  PINWHEEL_HAVEN_ROOMS.forEach(room => {
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
  assert.strictEqual(PINWHEEL_HAVEN_RECIPES.length, 5, 'Must have 5 sky recipes');
  assert.strictEqual(PINWHEEL_HAVEN_FLORA.length, 4, 'Must have 4 flora types');
  assert.strictEqual(PINWHEEL_HAVEN_LETTERS.length, 7, 'Must have 7 friendship letters from all companions');
  assert.strictEqual(PINWHEEL_HAVEN_COLLECTIBLES.length, 4, 'Must have 4 mini pinwheels');
  assert.strictEqual(PINWHEEL_HAVEN_TASKS.length, 6, 'Must have 6 daily tasks');
  assert.strictEqual(PINWHEEL_HAVEN_ATMOSPHERES.length, 3, 'Must have 3 atmosphere presets');

  const letterSenders = PINWHEEL_HAVEN_LETTERS.map(l => l.sender);
  assert.ok(letterSenders.some(s => s && s.includes('Lala')));
  assert.ok(letterSenders.some(s => s && s.includes('Nyanya')));
  assert.ok(letterSenders.some(s => s && s.includes('Lele')));
  assert.ok(letterSenders.some(s => s && s.includes('Akhira')));
  assert.ok(letterSenders.some(s => s && s.includes('Ela')));
  assert.ok(letterSenders.some(s => s && s.includes('Ruben')));
  assert.ok(letterSenders.some(s => s && s.includes('Royan')));
  console.log('   ✓ All 7 friends letters confirmed present');

  // 4. State Persistence Engine
  console.log('4. Verifying State Persistence Engine...');
  assert.strictEqual(PINWHEEL_HAVEN_STORAGE_KEY, 'pinwheel_haven_house_state_syma');
  const defaultState = createDefaultPinwheelHavenState();
  assert.strictEqual(defaultState.character, 'syma');
  assert.strictEqual(defaultState.currentRoom, 'living');
  assert.strictEqual(defaultState.stats.dishesCooked, 1);

  savePinwheelHavenState('syma', defaultState);
  const loadedState = loadPinwheelHavenState('syma');
  assert.strictEqual(loadedState.currentRoom, 'living');
  assert.strictEqual(loadedState.stats.dishesCooked, 1);

  loadedState.stats.dishesCooked = 5;
  savePinwheelHavenState('syma', loadedState);
  assert.strictEqual(loadPinwheelHavenState('syma').stats.dishesCooked, 5);

  const resetState = resetPinwheelHavenState('syma');
  assert.strictEqual(resetState.stats.dishesCooked, 1);
  console.log('   ✓ State load, save, mutate, and reset verified');

  // 5. Audio Synthesizer Safety
  console.log('5. Verifying Audio Synthesizer Safety...');
  assert.doesNotThrow(() => playPinwheelPianoNote(261.63));
  assert.doesNotThrow(() => playSkyWindChime());
  assert.doesNotThrow(() => playCloudHarpZen());
  assert.doesNotThrow(() => playTeapotSimmer());
  console.log('   ✓ Web Audio synthesizers run cleanly with no exceptions');

  // 6. Artwork Assets on Disk
  console.log('6. Verifying Artwork Assets on Disk...');
  const assetPaths = [
    'public/assets/pinwheel_haven_living.jpg',
    'public/assets/pinwheel_haven_bedroom.jpg',
    'public/assets/pinwheel_haven_kitchen.jpg',
    'public/assets/pinwheel_haven_conservatory.jpg',
    'public/assets/pinwheel_haven_attic.jpg',
    'public/assets/avatar_abil_hd.jpg'
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
  assert.ok(htmlContent.includes('pinwheel_haven.css'), 'index.html must link pinwheel_haven.css');
  assert.ok(htmlContent.includes('id="view-pinwheel-haven"'), 'index.html must have #view-pinwheel-haven');
  assert.ok(htmlContent.includes('id="haven-stage"'), 'index.html must have #haven-stage');
  assert.ok(htmlContent.includes('id="haven-player-avatar"'), 'index.html must have #haven-player-avatar');
  assert.ok(htmlContent.includes('id="btn-haven-back"'), 'index.html must have #btn-haven-back');
  assert.ok(htmlContent.includes('id="haven-nav-pills"'), 'index.html must have #haven-nav-pills');
  console.log('   ✓ index.html structure verified');

  // 8. CSS Verification
  console.log('8. Verifying pinwheel_haven.css...');
  assert.ok(fs.existsSync('pinwheel_haven.css'), 'pinwheel_haven.css must exist');
  const cssContent = fs.readFileSync('pinwheel_haven.css', 'utf8');
  assert.ok(cssContent.includes('.view-pinwheel-haven'), 'Must style .view-pinwheel-haven');
  assert.ok(cssContent.includes('.haven-player'), 'Must style .haven-player');
  assert.ok(cssContent.includes('.haven-cloud-puff'), 'Must style .haven-cloud-puff');
  assert.ok(cssContent.includes('.haven-nav-bar'), 'Must style .haven-nav-bar');
  console.log('   ✓ pinwheel_haven.css verified');

  // 9. Check style.css isolation
  console.log('9. Verifying style.css isolation...');
  const styleCss = fs.readFileSync('style.css', 'utf8');
  assert.ok(styleCss.includes('.view-pinwheel-haven'), 'style.css must include .view-pinwheel-haven in defensive isolation');
  console.log('   ✓ style.css isolation verified');

  // 10. Check main.js protected views
  console.log('10. Verifying main.js protected views...');
  const mainJs = fs.readFileSync('main.js', 'utf8');
  const matches = (mainJs.match(/view-pinwheel-haven/g) || []).length;
  assert.ok(matches >= 4, `main.js should include view-pinwheel-haven in at least 4 places (found ${matches})`);
  console.log('   ✓ main.js isolation verified');

  console.log('\n>>> ALL 10 TESTS PASSED FOR THE PINWHEEL HAVEN! <<<\n');
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
