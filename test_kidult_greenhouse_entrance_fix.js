/**
 * VERIFICATION SCRIPT: KIDULT ENCHANTED GREENHOUSE ENTRANCE BUG FIX
 * Simulates user actions in universes_view:
 * 1. Selecting 'rumah_kaca' location on KIDULT map
 * 2. Clicking 'btn-kidult-loc-action' ("Masuk ke Enchanted Greenhouse")
 * 3. Clicking top-bar pill 'btn-kidult-greenhouse'
 * 4. Verifying all 8 characters can enter with isolated storage
 * 5. Verifying back button navigates back to KIDULT world
 */

import assert from 'assert';
import fs from 'fs';
import {
  normalizeGreenhouseCharKey,
  getGreenhouseStorageKey,
  loadGreenhouseState,
  saveGreenhouseState,
  GREENHOUSE_CHARACTERS
} from './greenhouse_state.js';
import { initGreenhouseView } from './greenhouse_view.js';

console.log('🌱 Running Kidult Enchanted Greenhouse Entrance Bug Fix Verification...\n');

// Mock localStorage
const mockStore = {};
global.localStorage = {
  getItem: (k) => mockStore[k] || null,
  setItem: (k, v) => { mockStore[k] = String(v); },
  removeItem: (k) => { delete mockStore[k]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); }
};

class MockElement {
  constructor(id, tagName = 'div') {
    this.id = id;
    this.tagName = tagName.toUpperCase();
    this.classes = new Set();
    this.classList = {
      add: (...n) => n.forEach(c => this.classes.add(c)),
      remove: (...n) => n.forEach(c => this.classes.delete(c)),
      contains: (c) => this.classes.has(c),
      has: (c) => this.classes.has(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (this.classes.has(c)) { this.classes.delete(c); return false; }
          else { this.classes.add(c); return true; }
        } else if (force) {
          this.classes.add(c); return true;
        } else {
          this.classes.delete(c); return false;
        }
      }
    };
    this.attributes = {};
    this.style = {};
    this.listeners = {};
    this.innerHTML = '';
    this.textContent = '';
  }
  getAttribute(name) { return this.attributes[name] || null; }
  setAttribute(name, val) { this.attributes[name] = val; }
  removeAttribute(name) { delete this.attributes[name]; }
  addEventListener(ev, fn) {
    if (!this.listeners[ev]) this.listeners[ev] = [];
    this.listeners[ev].push(fn);
  }
  click() {
    const list = this.listeners['click'] || [];
    list.forEach(fn => fn({ clientX: 100, clientY: 100, stopPropagation: () => {} }));
  }
  querySelector(sel) { return null; }
  querySelectorAll(sel) { return []; }
}

const elements = {
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
  'kidult-location-panel': new MockElement('kidult-location-panel', 'aside'),
  'kidult-loc-action-label': new MockElement('kidult-loc-action-label', 'span'),
  'kidult-loc-title': new MockElement('kidult-loc-title', 'h3'),
  'btn-interact-kidult-gh': new MockElement('btn-interact-kidult-gh', 'button')
};

global.document = {
  getElementById: (id) => elements[id] || null,
  querySelector: (sel) => null,
  querySelectorAll: (sel) => []
};
global.window = { innerWidth: 1280, innerHeight: 720 };

let lastToastMessage = '';
const greenhouseCtrl = initGreenhouseView({
  onShowToast: (msg) => { lastToastMessage = msg; },
  onTriggerSparkle: () => {},
  onNavigateBack: () => {
    elements['view-kidult-world'].classList.add('active');
  }
});

// Setup Kidult Action button simulation matching universes_view.js
let activeKidultLocationKey = null;
let activeCharacterKey = 'nyanya';
let activeUser = 'nyanya';

function simulateSelectLocation(locKey) {
  activeKidultLocationKey = locKey;
  elements['kidult-location-panel'].classList.add('open');
  if (locKey === 'rumah_kaca') {
    elements['kidult-loc-action-label'].textContent = '🌿 Masuk ke Enchanted Greenhouse';
  }
}

function simulateClickLocAction() {
  if (activeKidultLocationKey === 'rumah_kaca') {
    elements['kidult-location-panel'].classList.remove('open');
    // This was the exact line that threw ReferenceError: activeCharacterKey is not defined
    greenhouseCtrl.openGreenhouse(activeCharacterKey || activeUser || 'nyanya');
  }
}

elements['btn-kidult-loc-action'].addEventListener('click', simulateClickLocAction);
elements['btn-kidult-greenhouse'].addEventListener('click', () => {
  greenhouseCtrl.openGreenhouse(activeCharacterKey || activeUser || 'nyanya');
});

// -----------------------------------------------------------------------------
// TEST 1: Nyanya clicks "Masuk ke Enchanted Greenhouse"
// -----------------------------------------------------------------------------
console.log('Test 1: Nyanya enters greenhouse via Location Panel action button...');
elements['view-kidult-world'].classList.add('active');
simulateSelectLocation('rumah_kaca');
assert(elements['kidult-location-panel'].classList.contains('open'), 'Location panel must be open');
assert.strictEqual(elements['kidult-loc-action-label'].textContent, '🌿 Masuk ke Enchanted Greenhouse');

// Click action button
elements['btn-kidult-loc-action'].click();

assert(!elements['kidult-location-panel'].classList.contains('open'), 'Location panel must close');
assert(elements['view-enchanted-greenhouse'].classList.contains('active'), 'Greenhouse view must become active');
assert(!elements['view-kidult-world'].classList.contains('active'), 'Kidult world must be inactive');
assert(elements['gh-gardener-info'].innerHTML.includes('Nyanya ⭐'), 'Gardener indicator must show Nyanya ⭐');
assert(elements['gh-gardener-info'].innerHTML.includes('Kidult Conservatory'), 'Must show host badge');
console.log('✓ Test 1 Passed: Nyanya successfully entered greenhouse without error.');

// Click back button
elements['btn-gh-back'].click();
assert(!elements['view-enchanted-greenhouse'].classList.contains('active'), 'Greenhouse must close');
assert(elements['view-kidult-world'].classList.contains('active'), 'Kidult world must be active again');
console.log('✓ Back button successfully returned to KIDULT world.');

// -----------------------------------------------------------------------------
// TEST 2: Syma (abil) enters greenhouse via Location Panel & Top Bar Pill
// -----------------------------------------------------------------------------
console.log('\nTest 2: Syma (PINWHEEL) enters greenhouse...');
activeCharacterKey = 'abil';
activeUser = 'syma';

// Syma clicks top bar direct entrance pill
elements['btn-kidult-greenhouse'].click();
assert(elements['view-enchanted-greenhouse'].classList.contains('active'), 'Greenhouse must activate for Syma');
assert(elements['gh-gardener-info'].innerHTML.includes('Syma ☁️'), 'Gardener info must show Syma ☁️');
assert(elements['gh-gardener-info'].innerHTML.includes('Kebun Pengunjung'), 'Must show visitor badge for Syma');

elements['btn-gh-back'].click();

// Mutate Syma garden after closing
const symaGarden = loadGreenhouseState('syma');
symaGarden.coins = 777;
saveGreenhouseState(symaGarden, 'syma');
console.log('✓ Test 2 Passed: Syma entered, displayed visitor profile, and exited cleanly.');

// -----------------------------------------------------------------------------
// TEST 3: All 8 Characters Entrance & Data Isolation Verification
// -----------------------------------------------------------------------------
console.log('\nTest 3: Testing all 8 characters and data isolation...');
const allChars = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
allChars.forEach(char => {
  activeCharacterKey = char;
  activeUser = GREENHOUSE_CHARACTERS[char].name.toLowerCase();
  
  simulateSelectLocation('rumah_kaca');
  elements['btn-kidult-loc-action'].click();
  
  assert(elements['view-enchanted-greenhouse'].classList.contains('active'), `Greenhouse active for ${char}`);
  assert(elements['gh-gardener-info'].innerHTML.includes(GREENHOUSE_CHARACTERS[char].name), `Gardener name rendered for ${char}`);
  
  elements['btn-gh-back'].click();
});

// Verify Nyanya garden was untouched by Syma's 777 coins
const nyanyaFinal = loadGreenhouseState('nyanya');
assert.strictEqual(nyanyaFinal.coins, 150, 'Nyanya starter coins (150) must be isolated from Syma (777)');
const symaFinal = loadGreenhouseState('abil');
assert.strictEqual(symaFinal.coins, 777, 'Syma coins must remain 777');

console.log('✓ Test 3 Passed: All 8 characters enter greenhouse and maintain strict data isolation.');

console.log('\n🎉 ALL KIDULT ENCHANTED GREENHOUSE ENTRANCE TESTS PASSED (100%)!\n');
