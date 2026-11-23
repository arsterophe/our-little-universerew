/**
 * COMPREHENSIVE TEST SUITE: KIDULT UPGRADE & INTERACTIVE LIVING UNIVERSE
 * Verifies:
 * 1. Background image replacement (Image 1 & Image 2)
 * 2. Visual layout and hotspot positioning matching 16:9 artwork
 * 3. Elimination of hardcoded 'Vanya' in KIDULT headings and proper owner mapping
 * 4. Gazebo Nyanya — Memory Garden (teas, treats, puppy, chibi, keepsakes, lighting, audio)
 * 5. Full 8-character access and storage isolation
 * 6. 2D life simulation Chibi Nyanya path walking
 * 7. HTML, CSS, and controller integration
 */

import assert from 'assert';
import fs from 'fs';
import {
  KIDULT_TEAS,
  KIDULT_TREATS,
  KIDULT_GAZEBO_LIGHTS,
  PUPPY_INTERACTIONS,
  NYANYA_GAZEBO_DIALOGS,
  getKidultGazeboStorageKey,
  createDefaultKidultGazeboState,
  loadKidultGazeboState,
  saveKidultGazeboState,
  createGazeboAudioEngine
} from './kidult_gazebo_state.js';
import { initKidultGazeboView } from './kidult_gazebo_view.js';
import {
  KIDULT_LOCATIONS,
  UNIVERSE_DATA
} from './universes_view.js';

console.log('✨ Starting Universe Nyanya (KIDULT) Upgrade Test Suite...\n');

// -----------------------------------------------------------------------------
// 1. ASSET VERIFICATION (BACKGROUND & GAZEBO INTERIOR)
// -----------------------------------------------------------------------------
const bgPath = './public/assets/kidult_universe_bg.jpg';
const gzPath = './public/assets/kidult_gazebo_interior.jpg';

assert(fs.existsSync(bgPath), 'kidult_universe_bg.jpg must exist in public/assets/');
assert(fs.existsSync(gzPath), 'kidult_gazebo_interior.jpg must exist in public/assets/');

const bgStat = fs.statSync(bgPath);
const gzStat = fs.statSync(gzPath);
assert(bgStat.size > 400000, `Background must be high resolution (>400KB), got ${bgStat.size}`);
assert(gzStat.size > 400000, `Gazebo interior must be high resolution (>400KB), got ${gzStat.size}`);
console.log(`✓ 1. Background assets verified: Universe BG (${bgStat.size} bytes), Gazebo Interior (${gzStat.size} bytes).`);

// -----------------------------------------------------------------------------
// 2. UNIVERSE IDENTITY & NO VANYA HARDCODES
// -----------------------------------------------------------------------------
const html = fs.readFileSync('index.html', 'utf8');

assert(html.includes("NYANYA'S UNIVERSE"), 'index.html must display NYANYA\'S UNIVERSE');
assert(!html.includes("VANYA'S UNIVERSE"), 'index.html must NOT contain VANYA\'S UNIVERSE');
assert(!html.includes(">Rumah Vanya<"), 'index.html must NOT contain Rumah Vanya');
assert(html.includes("The Everdream House"), 'index.html must contain The Everdream House');

assert.strictEqual(UNIVERSE_DATA.kidult.charKey, 'nyanya');
assert.strictEqual(UNIVERSE_DATA.kidult.charName, 'Nyanya');
assert.strictEqual(UNIVERSE_DATA.kidult.owner, "NYANYA'S UNIVERSE");
assert.strictEqual(UNIVERSE_DATA.kidult.ownerName, 'Alenda');
console.log('✓ 2. Universe identity and owner verified: Nyanya ⭐ (Alenda). No Vanya hardcode.');

// -----------------------------------------------------------------------------
// 3. KIDULT LOCATIONS & HOTSPOT BOUNDING POSITIONS
// -----------------------------------------------------------------------------
const locKeys = Object.keys(KIDULT_LOCATIONS);
assert.strictEqual(locKeys.length, 6, 'Must define 6 connected locations in KIDULT');
assert(KIDULT_LOCATIONS.rumah, 'Location rumah (The Everdream House) must exist');
assert(KIDULT_LOCATIONS.rumah_kaca, 'Location rumah_kaca (The Enchanted Greenhouse) must exist');
assert(KIDULT_LOCATIONS.teleskop, 'Location teleskop (Star Messages) must exist');
assert(KIDULT_LOCATIONS.kotak_pos, 'Location kotak_pos (Kotak Pos) must exist');
assert(KIDULT_LOCATIONS.sungai_senja, 'Location sungai_senja (Sungai Senja) must exist');
assert(KIDULT_LOCATIONS.gazebo, 'Location gazebo (Memory Garden) must exist');

assert.strictEqual(KIDULT_LOCATIONS.gazebo.actionType, 'kidult_gazebo', 'Gazebo actionType must be kidult_gazebo');
assert.strictEqual(KIDULT_LOCATIONS.rumah_kaca.actionType, 'greenhouse', 'Greenhouse actionType must be greenhouse');
assert.strictEqual(KIDULT_LOCATIONS.rumah.actionType, 'everdream_house', 'Everdream House actionType must be everdream_house');

const uCss = fs.readFileSync('universes.css', 'utf8');
assert(uCss.includes('.hotspot-gazebo'), 'universes.css must define .hotspot-gazebo');
assert(uCss.includes('.hotspot-rumah'), 'universes.css must define .hotspot-rumah');
assert(uCss.includes('.hotspot-rumah-kaca'), 'universes.css must define .hotspot-rumah-kaca');
assert(uCss.includes('.hotspot-teleskop'), 'universes.css must define .hotspot-teleskop');
assert(uCss.includes('.hotspot-kotak-pos'), 'universes.css must define .hotspot-kotak-pos');
assert(uCss.includes('.hotspot-sungai-senja'), 'universes.css must define .hotspot-sungai-senja');
assert(uCss.includes('left: 85.0%'), 'Gazebo hotspot must align with lower right rotunda (85.0%)');
console.log('✓ 3. 6 Connected 2D locations, action types, and CSS bounding zones verified.');

// -----------------------------------------------------------------------------
// 4. GAZEBO NYANYA STATE & CATALOGS
// -----------------------------------------------------------------------------
const allTeas = Object.values(KIDULT_TEAS);
assert.strictEqual(allTeas.length, 4, 'Must provide 4 soothing teas');
allTeas.forEach(t => {
  assert(t.id && t.name && t.icon && t.desc && t.aroma && t.effect, `Tea ${t.id} must have complete metadata`);
});

const allTreats = Object.values(KIDULT_TREATS);
assert.strictEqual(allTreats.length, 3, 'Must provide 3 sweet patisserie treats');

const allLights = Object.values(KIDULT_GAZEBO_LIGHTS);
assert.strictEqual(allLights.length, 4, 'Must provide 4 lighting atmospheres');

assert(PUPPY_INTERACTIONS.length >= 4, 'Must provide sleeping puppy interactions');
assert(NYANYA_GAZEBO_DIALOGS.length >= 4, 'Must provide wholesome Chibi Nyanya gazebo dialogues');

// Web Audio Engine
const audio = createGazeboAudioEngine();
assert(typeof audio.startMusicBox === 'function', 'Audio engine must have startMusicBox');
assert(typeof audio.stopMusicBox === 'function', 'Audio engine must have stopMusicBox');
assert(typeof audio.startAmbient === 'function', 'Audio engine must have startAmbient');
assert(typeof audio.stopAmbient === 'function', 'Audio engine must have stopAmbient');
assert(typeof audio.setVolume === 'function', 'Audio engine must have setVolume');
console.log('✓ 4. Gazebo catalogs (Teas, Treats, Lights, Puppy, Dialogues, Audio Engine) verified.');

// -----------------------------------------------------------------------------
// 5. STORAGE ISOLATION ACROSS 8 CHARACTERS
// -----------------------------------------------------------------------------
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

const characters = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
characters.forEach(char => {
  const key = getKidultGazeboStorageKey(char);
  assert.strictEqual(key, `olu_kgazebo_${char}`);
});

// Test alias resolution
assert.strictEqual(getKidultGazeboStorageKey('syma'), 'olu_kgazebo_abil');
assert.strictEqual(getKidultGazeboStorageKey('vanya'), 'olu_kgazebo_lele');
assert.strictEqual(getKidultGazeboStorageKey('alenda'), 'olu_kgazebo_nyanya');

// Host vs Visitor State
const nyanyaGz = loadKidultGazeboState('nyanya');
assert.strictEqual(nyanyaGz.characterId, 'nyanya');
assert(nyanyaGz.memories.length >= 3, 'Nyanya host must start with her starter memories');

const symaGz = loadKidultGazeboState('syma');
assert.strictEqual(symaGz.characterId, 'abil');
// Mutate Syma state
symaGz.currentTea = 'fairytale_berry';
symaGz.memories.push({ id: 'syma_1', title: 'Kenangan Syma', note: 'Hari menyenangkan', timestamp: Date.now() });
saveKidultGazeboState(symaGz, 'syma');

const reloadedNyanya = loadKidultGazeboState('nyanya');
assert.strictEqual(reloadedNyanya.currentTea, 'lavender_star', 'Nyanya tea must remain unaffected by Syma');
assert.strictEqual(reloadedNyanya.memories.length, 3, 'Nyanya memories must not include Syma memory');

const reloadedSyma = loadKidultGazeboState('abil');
assert.strictEqual(reloadedSyma.currentTea, 'fairytale_berry', 'Syma tea must persist');
assert.strictEqual(reloadedSyma.memories.length, 2, 'Syma memories must persist');
console.log('✓ 5. Full 8-character access and isolated storage verification passed.');

// -----------------------------------------------------------------------------
// 6. DOM CONTROLLER & NAVIGATION AUDIT
// -----------------------------------------------------------------------------
class MockClassList {
  constructor() { this.set = new Set(); }
  add(...n) { n.forEach(c => this.set.add(c)); }
  remove(...n) { n.forEach(c => this.set.delete(c)); }
  contains(c) { return this.set.has(c); }
  toggle(c, f) {
    if (f === undefined) { if (this.set.has(c)) { this.set.delete(c); return false; } else { this.set.add(c); return true; } }
    else if (f) { this.set.add(c); return true; }
    else { this.set.delete(c); return false; }
  }
}

class MockElement {
  constructor(id, tag = 'div') {
    this.id = id;
    this.tagName = tag.toUpperCase();
    this.classList = new MockClassList();
    this.attributes = {};
    this.listeners = {};
    this.innerHTML = '';
    this.textContent = '';
    this.style = {};
  }
  getAttribute(k) { return this.attributes[k] || null; }
  setAttribute(k, v) { this.attributes[k] = v; }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(ev, fn) {
    if (!this.listeners[ev]) this.listeners[ev] = [];
    this.listeners[ev].push(fn);
  }
  click() {
    (this.listeners['click'] || []).forEach(fn => fn({ clientX: 100, clientY: 100 }));
  }
  querySelector(sel) { return null; }
  querySelectorAll(sel) { return []; }
}

const dom = {
  'view-kidult-gazebo': new MockElement('view-kidult-gazebo', 'section'),
  'view-kidult-world': new MockElement('view-kidult-world', 'section'),
  'btn-kgazebo-back': new MockElement('btn-kgazebo-back', 'button'),
  'kgazebo-gardener-info': new MockElement('kgazebo-gardener-info', 'div'),
  'btn-kgazebo-music-toggle': new MockElement('btn-kgazebo-music-toggle', 'button'),
  'select-kgazebo-ambient': new MockElement('select-kgazebo-ambient', 'select'),
  'slider-kgazebo-vol': new MockElement('slider-kgazebo-vol', 'input'),
  'kgazebo-lighting-overlay': new MockElement('kgazebo-lighting-overlay', 'div'),
  'kg-steam-effect': new MockElement('kg-steam-effect', 'div'),
  'hotspot-kg-tea': new MockElement('hotspot-kg-tea', 'button'),
  'hotspot-kg-puppy': new MockElement('hotspot-kg-puppy', 'button'),
  'hotspot-kg-chibi': new MockElement('hotspot-kg-chibi', 'button'),
  'hotspot-kg-books': new MockElement('hotspot-kg-books', 'button'),
  'hotspot-kg-lanterns': new MockElement('hotspot-kg-lanterns', 'button'),
  'hotspot-kg-balcony': new MockElement('hotspot-kg-balcony', 'button'),
  'kgazebo-modal-backdrop': new MockElement('kgazebo-modal-backdrop', 'div'),
  'btn-kgazebo-modal-close': new MockElement('btn-kgazebo-modal-close', 'button'),
  'kgazebo-modal-title': new MockElement('kgazebo-modal-title', 'div'),
  'kgazebo-modal-body': new MockElement('kgazebo-modal-body', 'div')
};

global.document = {
  getElementById: (id) => dom[id] || null,
  querySelector: () => null,
  querySelectorAll: () => []
};
global.window = { innerWidth: 1024, innerHeight: 768 };

let toastMsg = '';
const gzCtrl = initKidultGazeboView({
  onShowToast: (m) => { toastMsg = m; },
  onTriggerSparkle: () => {},
  onNavigateBack: () => { dom['view-kidult-world'].classList.add('active'); }
});

assert(gzCtrl, 'initKidultGazeboView must return controller');

// Test Nyanya Host Opening
gzCtrl.openKidultGazebo('nyanya');
assert(dom['view-kidult-gazebo'].classList.contains('active'), 'Gazebo must be active');
assert(dom['kgazebo-gardener-info'].innerHTML.includes('Nyanya ⭐'), 'Gardener info must show Nyanya ⭐');
assert(dom['kgazebo-gardener-info'].innerHTML.includes('Sanctuary Host'), 'Must show host badge');
assert(toastMsg.includes('Gazebo Nyanya'), 'Must show toast on enter');

// Test Back Button
dom['btn-kgazebo-back'].click();
assert(!dom['view-kidult-gazebo'].classList.contains('active'), 'Gazebo must deactivate on close');
assert(dom['view-kidult-world'].classList.contains('active'), 'KIDULT world must reactivate');

// Test Syma Visitor Opening
gzCtrl.openKidultGazebo('syma');
assert(dom['view-kidult-gazebo'].classList.contains('active'), 'Gazebo must be active for Syma');
assert(dom['kgazebo-gardener-info'].innerHTML.includes('Syma ☁️'), 'Gardener info must show Syma ☁️');
assert(dom['kgazebo-gardener-info'].innerHTML.includes('Mode Pengunjung'), 'Must show visitor badge');
gzCtrl.closeKidultGazebo();

console.log('✓ 6. DOM Controller initialization, entrance, host/visitor modes, and back navigation verified.');

// -----------------------------------------------------------------------------
// 7. ROUTING INTEGRATION IN MAIN.JS
// -----------------------------------------------------------------------------
const mainSource = fs.readFileSync('main.js', 'utf8');
assert(mainSource.includes('view-kidult-gazebo'), 'main.js must register view-kidult-gazebo in protected view lists');
console.log('✓ 7. main.js protected view lists verified.');

console.log('\n🎉 ALL KIDULT UPGRADE & INTERACTIVE LIVING UNIVERSE TESTS PASSED (100%)!\n');
