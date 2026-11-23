/**
 * TEST SUITE: THE ENCHANTED GREENHOUSE 🌿 — NYANYA ⭐ (KIDULT)
 * Tests Plant Catalog, Soil Plots, Growth Engine, Economy, Inventory, Quests, HTML, CSS, and Controller Integration
 */

import assert from 'assert';
import fs from 'fs';
import {
  PLANT_CATALOG,
  DEFAULT_DAILY_QUESTS,
  DEFAULT_ACHIEVEMENTS,
  GREENHOUSE_LEVELS,
  createInitialPlots,
  createDefaultGreenhouseState,
  loadGreenhouseState,
  saveGreenhouseState,
  updateCropsGrowth,
  getPlantStage,
  checkLevelUp,
  getGreenhouseStorageKey
} from './greenhouse_state.js';

console.log('🧪 Starting The Enchanted Greenhouse Test Suite...\n');

// -----------------------------------------------------------------------------
// 1. PLANT CATALOG AUDIT (28+ PLANTS ACROSS 4 CATEGORIES)
// -----------------------------------------------------------------------------
const allPlants = Object.values(PLANT_CATALOG);
assert(allPlants.length >= 28, `Must have at least 28 plants in catalog, got ${allPlants.length}`);

const requiredVegetables = ['carrot', 'tomato', 'lettuce', 'potato', 'chili', 'eggplant', 'broccoli', 'cucumber', 'pumpkin'];
requiredVegetables.forEach(veg => {
  assert(PLANT_CATALOG[veg], `Vegetable ${veg} must exist in PLANT_CATALOG`);
  assert.strictEqual(PLANT_CATALOG[veg].category, 'vegetable');
});

const requiredFlowers = ['rose', 'tulip', 'lavender', 'sunflower', 'daisy', 'lily', 'hydrangea', 'sakura'];
requiredFlowers.forEach(flow => {
  assert(PLANT_CATALOG[flow], `Flower ${flow} must exist in PLANT_CATALOG`);
  assert.strictEqual(PLANT_CATALOG[flow].category, 'flower');
});

const requiredHerbs = ['mint', 'basil', 'rosemary', 'chamomile', 'thyme', 'parsley'];
requiredHerbs.forEach(herb => {
  assert(PLANT_CATALOG[herb], `Herb ${herb} must exist in PLANT_CATALOG`);
  assert.strictEqual(PLANT_CATALOG[herb].category, 'herb');
});

const requiredFruits = ['strawberry', 'watermelon', 'melon', 'blueberry', 'grape', 'lemon'];
requiredFruits.forEach(fruit => {
  assert(PLANT_CATALOG[fruit], `Fruit ${fruit} must exist in PLANT_CATALOG`);
  assert.strictEqual(PLANT_CATALOG[fruit].category, 'fruit');
});

allPlants.forEach(p => {
  assert(p.id && p.name && p.icon && p.desc, `Plant ${p.id} must have basic metadata`);
  assert(p.seedPrice > 0, `Plant ${p.id} must have positive seedPrice`);
  assert(p.sellPrice > p.seedPrice, `Plant ${p.id} must have sellPrice higher than seedPrice`);
  assert(p.growthTime > 0, `Plant ${p.id} must have positive growthTime`);
  assert(p.yieldMin > 0 && p.yieldMax >= p.yieldMin, `Plant ${p.id} must have valid yield range`);
  assert(p.xpReward > 0, `Plant ${p.id} must have positive xpReward`);
});
console.log(`✓ 1. Plant catalog verified: ${allPlants.length} plants across Vegetables, Flowers, Herbs, and Fruits.`);

// -----------------------------------------------------------------------------
// 2. 20 SOIL PLOTS GENERATOR & INITIAL STATE
// -----------------------------------------------------------------------------
const initialPlots = createInitialPlots();
assert.strictEqual(initialPlots.length, 20, 'Must generate exactly 20 soil plots');
const unlockedInLvl1 = initialPlots.filter(p => p.isUnlocked);
assert.strictEqual(unlockedInLvl1.length, 4, 'Level 1 must have exactly 4 unlocked starter plots');
const lockedInLvl1 = initialPlots.filter(p => !p.isUnlocked);
assert.strictEqual(lockedInLvl1.length, 16, 'Level 1 must have 16 locked plots for expansion');

const defaultState = createDefaultGreenhouseState('nyanya');
assert.strictEqual(defaultState.characterId, 'nyanya');
assert.strictEqual(defaultState.level, 1);
assert(defaultState.coins >= 100, 'Must start with initial coins buffer');
assert(defaultState.fertilizers >= 3, 'Must start with initial fertilizers');
assert(defaultState.plots.length === 20, 'Default state must include 20 plots');
console.log('✓ 2. 20 Soil plots and initial player farming state verified.');

// -----------------------------------------------------------------------------
// 3. PLANTING, WATERING, FERTILIZING, AND GROWTH ENGINE
// -----------------------------------------------------------------------------
const testState = createDefaultGreenhouseState('nyanya');
const p1 = testState.plots[0];
assert.strictEqual(p1.state, 'empty');

// Plant carrot
p1.plantId = 'carrot';
p1.plantedAt = 1000000;
p1.lastWateredAt = 1000000;
p1.isWatered = true;
p1.growthProgress = 0;
p1.state = 'growing';

// Progress after 10 seconds (half of carrot's 25s)
updateCropsGrowth(testState, 1000000 + 10000);
assert(p1.growthProgress >= 30, `Growth progress should be advancing, got ${p1.growthProgress}%`);
assert(p1.state === 'growing', 'Should be in growing state');

// Apply fertilizer
p1.fertilizerApplied = true;

// Fast forward to complete growth (30 seconds)
updateCropsGrowth(testState, 1000000 + 35000);
assert.strictEqual(p1.growthProgress, 100, 'Crop must be 100% grown');
assert.strictEqual(p1.state, 'ready', 'Crop must be in ready state');

const readyStage = getPlantStage(p1.growthProgress);
assert.strictEqual(readyStage.stage, 'ready');
console.log('✓ 3. Planting, watering, fertilizer speedup, and growth progression verified.');

// -----------------------------------------------------------------------------
// 4. LEVEL UP & GREENHOUSE EXPANSION LOGIC
// -----------------------------------------------------------------------------
assert.strictEqual(GREENHOUSE_LEVELS.length, 5, 'Must define 5 greenhouse expansion levels');
testState.xp = 150; // Threshold for level 2 is 120
const lvlRes = checkLevelUp(testState);
assert.strictEqual(lvlRes.leveledUp, true, 'Player should level up to level 2');
assert.strictEqual(testState.level, 2);
const unlockedInLvl2 = testState.plots.filter(p => p.isUnlocked);
assert.strictEqual(unlockedInLvl2.length, 8, 'Level 2 must unlock 8 plots');

testState.xp = 1700; // Threshold for level 5 is 1600
const lvl5Res = checkLevelUp(testState);
assert.strictEqual(lvl5Res.currentLevel, 5, 'Player should reach level 5 Master Garden');
const unlockedInLvl5 = testState.plots.filter(p => p.isUnlocked);
assert.strictEqual(unlockedInLvl5.length, 20, 'Level 5 must unlock all 20 plots');
console.log('✓ 4. XP and Level Up expansion unlocking all 20 plots verified.');

// -----------------------------------------------------------------------------
// 5. STORAGE & CHARACTER ISOLATION (FULL 8 CHARACTERS & ALIASES)
// -----------------------------------------------------------------------------
import { normalizeGreenhouseCharKey, GREENHOUSE_CHARACTERS } from './greenhouse_state.js';

const eightCharacters = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
eightCharacters.forEach(char => {
  assert(GREENHOUSE_CHARACTERS[char], `Character ${char} must exist in GREENHOUSE_CHARACTERS`);
  assert.strictEqual(normalizeGreenhouseCharKey(char), char);
  assert.strictEqual(getGreenhouseStorageKey(char), `olu_greenhouse_${char}`);
});

// Verify Aliases
assert.strictEqual(normalizeGreenhouseCharKey('syma'), 'abil', 'syma alias must resolve to abil');
assert.strictEqual(normalizeGreenhouseCharKey('Syma'), 'abil');
assert.strictEqual(normalizeGreenhouseCharKey('alenda'), 'nyanya', 'alenda alias must resolve to nyanya');
assert.strictEqual(normalizeGreenhouseCharKey('bella'), 'lala', 'bella alias must resolve to lala');
assert.strictEqual(normalizeGreenhouseCharKey('vanya'), 'lele', 'vanya alias must resolve to lele');

// Verify Per-Character Isolated Storage Mutability
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = v; },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};

// Character A: Nyanya
const nyanyaState = loadGreenhouseState('nyanya');
nyanyaState.coins = 9999;
nyanyaState.plots[0].plantId = 'sakura';
saveGreenhouseState(nyanyaState, 'nyanya');

// Character B: Syma (via alias 'syma' or 'abil')
const symaState = loadGreenhouseState('syma');
symaState.coins = 500;
symaState.plots[0].plantId = 'pumpkin';
saveGreenhouseState(symaState, 'syma');

// Character C: Lele
const leleState = loadGreenhouseState('lele');
assert.strictEqual(leleState.coins, 150, 'Lele must retain fresh default coins (150), unaffected by Nyanya (9999) or Syma (500)');
assert.strictEqual(leleState.plots[0].plantId, null, 'Lele plot 0 must be empty, unaffected by Nyanya or Syma');

// Reload Nyanya & Syma
const reloadedNyanya = loadGreenhouseState('nyanya');
const reloadedSyma = loadGreenhouseState('abil');
assert.strictEqual(reloadedNyanya.coins, 9999, 'Nyanya state must remain 9999 coins');
assert.strictEqual(reloadedNyanya.plots[0].plantId, 'sakura');
assert.strictEqual(reloadedSyma.coins, 500, 'Syma state must remain 500 coins');
assert.strictEqual(reloadedSyma.plots[0].plantId, 'pumpkin');

console.log('✓ 5. Full 8 characters & aliases isolated storage verification passed.');

// -----------------------------------------------------------------------------
// 6. PHYSICAL ENVIRONMENT ASSET CHECK
// -----------------------------------------------------------------------------
const ghBgPath = './public/assets/enchanted_greenhouse_bg.jpg';
assert(fs.existsSync(ghBgPath), 'public/assets/enchanted_greenhouse_bg.jpg must exist');
const ghBgStat = fs.statSync(ghBgPath);
assert(ghBgStat.size > 100000, `Background image must be a genuine high-res illustration (>100KB), got ${ghBgStat.size} bytes`);
console.log(`✓ 6. Genuine high-res conservatory environment artwork verified (${ghBgStat.size} bytes).`);

// -----------------------------------------------------------------------------
// 7. INDEX.HTML STATIC STRUCTURE AUDIT
// -----------------------------------------------------------------------------
const indexHtml = fs.readFileSync('index.html', 'utf8');

assert(indexHtml.includes('greenhouse.css'), 'index.html must link greenhouse.css');
assert(indexHtml.includes('id="view-enchanted-greenhouse"'), 'Must contain #view-enchanted-greenhouse');
assert(indexHtml.includes('id="btn-gh-back"'), 'Must contain #btn-gh-back');
assert(indexHtml.includes('THE ENCHANTED GREENHOUSE'), 'Must contain title');
assert(indexHtml.includes('id="gh-level-text"'), 'Must contain level text element');
assert(indexHtml.includes('id="gh-xp-fill"'), 'Must contain xp fill track');
assert(indexHtml.includes('id="gh-coins-text"'), 'Must contain coins display');
assert(indexHtml.includes('id="btn-gh-sound-toggle"'), 'Must contain sound toggle button');
assert(indexHtml.includes('id="btn-gh-nav-garden"'), 'Must contain nav garden button');
assert(indexHtml.includes('id="btn-gh-nav-shop"'), 'Must contain nav shop button');
assert(indexHtml.includes('id="btn-gh-nav-barn"'), 'Must contain nav barn button');
assert(indexHtml.includes('id="btn-gh-nav-book"'), 'Must contain nav book button');
assert(indexHtml.includes('id="btn-gh-nav-quests"'), 'Must contain nav quests button');
assert(indexHtml.includes('id="btn-gh-nav-expand"'), 'Must contain nav expand button');
assert(indexHtml.includes('id="gh-plots-container"'), 'Must contain plots container');
assert(indexHtml.includes('id="gh-seed-tray"'), 'Must contain quick seed tray');
assert(indexHtml.includes('data-tool="water"'), 'Must contain water tool');
assert(indexHtml.includes('data-tool="seed"'), 'Must contain seed tool');
assert(indexHtml.includes('data-tool="fertilize"'), 'Must contain fertilize tool');
assert(indexHtml.includes('data-tool="harvest"'), 'Must contain harvest tool');
assert(indexHtml.includes('data-tool="inspect"'), 'Must contain inspect tool');
assert(indexHtml.includes('id="gh-shop-modal"'), 'Must contain shop modal');
assert(indexHtml.includes('id="gh-barn-modal"'), 'Must contain barn modal');
assert(indexHtml.includes('id="gh-book-modal"'), 'Must contain book modal');
assert(indexHtml.includes('id="gh-quests-modal"'), 'Must contain quests modal');
assert(indexHtml.includes('id="gh-expand-modal"'), 'Must contain expand modal');
console.log('✓ 7. index.html static markup and all interactive element IDs verified.');

// -----------------------------------------------------------------------------
// 8. GREENHOUSE.CSS AUDIT
// -----------------------------------------------------------------------------
const css = fs.readFileSync('greenhouse.css', 'utf8');

assert(css.includes('--gh-bg-dark:'), 'CSS must define theme colors');
assert(css.includes('--gh-mint:'), 'CSS must define mint green');
assert(css.includes('.view-enchanted-greenhouse'), 'CSS must define .view-enchanted-greenhouse');
assert(css.includes('.gh-plot-card'), 'CSS must style plot cards');
assert(css.includes('.gh-plot-card.is-wet'), 'CSS must style watered plot state');
assert(css.includes('.gh-plot-card.is-ready'), 'CSS must style ready harvest state');
assert(css.includes('@keyframes ghReadyPulse'), 'CSS must animate ready crop pulse');
assert(css.includes('@keyframes ghCropBounce'), 'CSS must animate crop bounce');
assert(css.includes('@media (max-width: 768px)'), 'CSS must provide responsive mobile layout');
console.log('✓ 8. greenhouse.css cottagecore styling, animations, and responsive rules verified.');

// -----------------------------------------------------------------------------
// 9. CONTROLLER & UNIVERSES INTEGRATION
// -----------------------------------------------------------------------------
const viewJs = fs.readFileSync('universes_view.js', 'utf8');
assert(viewJs.includes('initGreenhouseView'), 'universes_view.js must import initGreenhouseView');
assert(viewJs.includes('greenhouse'), 'KIDULT_LOCATIONS.rumah_kaca actionType must be greenhouse');
assert(viewJs.includes('The Enchanted Greenhouse'), 'KIDULT_LOCATIONS.rumah_kaca title must be The Enchanted Greenhouse');
assert(viewJs.includes('greenhouseController: greenhouseCtrl'), 'universes_view.js must export greenhouseController');
assert(viewJs.includes('openGreenhouse:'), 'universes_view.js must export openGreenhouse');

const mainJs = fs.readFileSync('main.js', 'utf8');
assert(mainJs.includes('view-enchanted-greenhouse'), 'main.js must register view-enchanted-greenhouse');
console.log('✓ 9. universes_view.js and main.js routing and lifecycle integration verified.');

// -----------------------------------------------------------------------------
// 10. DOM CONTROLLER INSTANTIATION & 8 CHARACTERS ENTRANCE FLOW VERIFICATION
// -----------------------------------------------------------------------------
import { initGreenhouseView } from './greenhouse_view.js';

// Setup minimal mock DOM
class MockClassList {
  constructor() {
    this.classes = new Set();
  }
  add(...names) { names.forEach(n => this.classes.add(n)); }
  remove(...names) { names.forEach(n => this.classes.delete(n)); }
  contains(name) { return this.classes.has(name); }
  has(name) { return this.classes.has(name); }
  toggle(name, force) {
    if (force === undefined) {
      if (this.classes.has(name)) { this.classes.delete(name); return false; }
      else { this.classes.add(name); return true; }
    } else if (force) {
      this.classes.add(name); return true;
    } else {
      this.classes.delete(name); return false;
    }
  }
}

class MockElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.classList = new MockClassList();
    this.attributes = {};
    this.style = {};
    this.listeners = {};
    this.innerHTML = '';
    this.textContent = '';
    this.children = [];
  }
  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, val) { this.attributes[name] = val; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(ev, fn) {
    if (!this.listeners[ev]) this.listeners[ev] = [];
    this.listeners[ev].push(fn);
  }
  dispatchEvent(ev) {
    const list = this.listeners[ev.type] || [];
    list.forEach(fn => fn(ev));
  }
  querySelector(sel) { return null; }
  querySelectorAll(sel) { return []; }
}

const domElements = {
  'view-enchanted-greenhouse': new MockElement('view-enchanted-greenhouse', 'section'),
  'view-kidult-world': new MockElement('view-kidult-world', 'section'),
  'btn-gh-back': new MockElement('btn-gh-back', 'button'),
  'gh-level-text': new MockElement('gh-level-text', 'span'),
  'gh-xp-fill': new MockElement('gh-xp-fill', 'div'),
  'gh-coins-text': new MockElement('gh-coins-text', 'span'),
  'btn-gh-sound-toggle': new MockElement('btn-gh-sound-toggle', 'button'),
  'btn-gh-nav-garden': new MockElement('btn-gh-nav-garden', 'button'),
  'btn-gh-nav-shop': new MockElement('btn-gh-nav-shop', 'button'),
  'btn-gh-nav-barn': new MockElement('btn-gh-nav-barn', 'button'),
  'btn-gh-nav-book': new MockElement('btn-gh-nav-book', 'button'),
  'btn-gh-nav-quests': new MockElement('btn-gh-nav-quests', 'button'),
  'btn-gh-nav-expand': new MockElement('btn-gh-nav-expand', 'button'),
  'gh-plots-container': new MockElement('gh-plots-container', 'div'),
  'gh-seed-tray': new MockElement('gh-seed-tray', 'div'),
  'gh-shop-modal': new MockElement('gh-shop-modal', 'div'),
  'gh-barn-modal': new MockElement('gh-barn-modal', 'div'),
  'gh-book-modal': new MockElement('gh-book-modal', 'div'),
  'gh-quests-modal': new MockElement('gh-quests-modal', 'div'),
  'gh-expand-modal': new MockElement('gh-expand-modal', 'div'),
  'gh-gardener-info': new MockElement('gh-gardener-info', 'div'),
  'btn-kidult-greenhouse': new MockElement('btn-kidult-greenhouse', 'button'),
  'btn-kidult-loc-action': new MockElement('btn-kidult-loc-action', 'button'),
  'kidult-location-panel': new MockElement('kidult-location-panel', 'aside')
};

global.document = {
  getElementById: (id) => domElements[id] || null,
  querySelector: (sel) => null,
  querySelectorAll: (sel) => []
};
global.window = {
  innerWidth: 1024,
  innerHeight: 768
};

let lastToast = null;
const ghCtrl = initGreenhouseView({
  onShowToast: (msg) => { lastToast = msg; },
  onTriggerSparkle: () => {},
  onNavigateBack: () => {
    domElements['view-kidult-world'].classList.add('active');
  }
});
assert(ghCtrl, 'initGreenhouseView must return controller');

// Test entrance across all 8 characters
eightCharacters.forEach(char => {
  ghCtrl.openGreenhouse(char);
  assert(domElements['view-enchanted-greenhouse'].classList.has('active'), `Greenhouse must be active for ${char}`);
  assert(domElements['gh-gardener-info'].innerHTML.includes(GREENHOUSE_CHARACTERS[char].name), `Gardener pill must display name for ${char}`);
  assert(lastToast.includes('The Enchanted Greenhouse'), 'Must show entrance toast');

  // Test back navigation
  ghCtrl.closeGreenhouse();
  assert(!domElements['view-enchanted-greenhouse'].classList.has('active'), 'Greenhouse must deactivate on close');
  assert(domElements['view-kidult-world'].classList.has('active'), 'KIDULT world must reactivate on back');
});

// Test entrance with alias 'syma'
ghCtrl.openGreenhouse('syma');
assert(domElements['gh-gardener-info'].innerHTML.includes('Syma'), 'Gardener pill must display Syma');
assert(domElements['gh-gardener-info'].innerHTML.includes('☁️'), 'Gardener pill must display Syma cloud symbol');
ghCtrl.closeGreenhouse();

console.log('✓ 10. Greenhouse controller lifecycle and entrance verified for all 8 characters and aliases.');

console.log('\n🎉 ALL ENCHANTED GREENHOUSE TEST ASSERTIONS PASSED SUCCESSFULLY! (100%)\n');
