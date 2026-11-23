/**
 * Automated Test Suite: All 8 Characters Photobooth Studio Expansion
 * Verifies equal studio capabilities, visual universe personalizations,
 * group sizes (1-8), memory isolation per character in IndexedDB, RBAC security,
 * universe navigation hooks, and zero leakage onto selection/login views.
 */

import assert from 'assert';
import {
  PB_CHARACTERS,
  ALL_PB_CHARACTERS,
  PB_GROUP_SIZES,
  PB_TEMPLATES,
  PB_THEME_CLASSES,
  PB_CHAR_THEME_MAP,
  applyPhotoboothUniverseTheme,
  detectLoggedInCharacter,
  setSelectedCharacter,
  getSelectedGroupSize,
  getSelectedParticipants,
  setGroupSize,
  toggleParticipant,
  resetParticipants,
  initPhotoboothView,
  openPhotoboothView,
  closePhotoboothView
} from './photobooth_view.js';

import {
  PhotoboothStudioManager,
  PB_BACKGROUND_PRESETS,
  PB_STICKER_CATEGORIES,
  PB_STUDIO_LAYOUTS,
  PB_FONTS,
  PB_UNIVERSE_INFO,
  createDefaultStudioState
} from './photobooth_studio.js';

import {
  savePhotoboothMemory,
  getPhotoboothMemories,
  getPhotoboothMemoryById,
  deletePhotoboothMemory
} from './photobooth_storage.js';

import fs from 'fs';

console.log('============================================================');
console.log('🧪 VERIFICATION: ALL 8 CHARACTERS PHOTOBOOTH EXPANSION SUITE');
console.log('============================================================\n');

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`✓ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`✗ FAIL: ${desc}`);
    console.error(err);
    failed++;
  }
}

async function itAsync(desc, fn) {
  try {
    await fn();
    console.log(`✓ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`✗ FAIL: ${desc}`);
    console.error(err);
    failed++;
  }
}

// Mock DOM Environment
const mockElements = new Map();
function createMockEl(id, className = '') {
  const el = {
    id,
    className,
    style: {},
    dataset: {},
    classList: {
      classes: new Set(className.split(' ').filter(Boolean)),
      add(...cls) { cls.forEach(c => this.classes.add(c)); },
      remove(...cls) { cls.forEach(c => this.classes.delete(c)); },
      contains(c) { return this.classes.has(c); },
      toggle(c, force) {
        if (force === undefined) {
          if (this.classes.has(c)) { this.classes.delete(c); return false; }
          else { this.classes.add(c); return true; }
        }
        if (force) { this.classes.add(c); return true; }
        this.classes.delete(c); return false;
      }
    },
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k]; },
    removeAttribute(k) { delete this.attributes[k]; },
    listeners: {},
    addEventListener(evt, cb) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(cb);
    },
    click() {
      if (this.listeners['click']) {
        this.listeners['click'].forEach(cb => cb({ stopPropagation: () => {} }));
      }
    },
    value: '',
    innerHTML: '',
    textContent: '',
    children: [],
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    removeChild(child) {
      const idx = this.children.indexOf(child);
      if (idx !== -1) this.children.splice(idx, 1);
      return child;
    },
    querySelectorAll(sel) { return []; },
    querySelector(sel) { return null; },
    getContext: () => ({
      clearRect: () => {},
      fillRect: () => {},
      beginPath: () => {},
      closePath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      arc: () => {},
      arcTo: () => {},
      stroke: () => {},
      fill: () => {},
      save: () => {},
      restore: () => {},
      rotate: () => {},
      translate: () => {},
      drawImage: () => {},
      fillText: () => {},
      strokeText: () => {},
      measureText: () => ({ width: 60 }),
      setLineDash: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      createRadialGradient: () => ({ addColorStop: () => {} })
    }),
    toDataURL: () => 'data:image/png;base64,mockCanvasData'
  };
  mockElements.set(id, el);
  return el;
}

globalThis.document = {
  getElementById: (id) => mockElements.get(id) || createMockEl(id),
  querySelectorAll: (sel) => [],
  querySelector: (sel) => null,
  createElement: (tag) => createMockEl(`mock-${tag}-${Date.now()}`),
  body: createMockEl('body')
};

globalThis.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; },
  clear() { this.store = {}; }
};

// --- TEST SECTION 1: All 8 Characters and Universe Theming ---
console.log('--- 1. All 8 Characters & Visual Universe Theming ---');

it('PB_CHARACTERS contains all 8 universe characters', () => {
  assert.strictEqual(ALL_PB_CHARACTERS.length, 8);
  const expected = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
  expected.forEach(k => {
    assert.ok(PB_CHARACTERS[k], `Character ${k} must exist in PB_CHARACTERS`);
    assert.ok(PB_CHARACTERS[k].name, `Character ${k} must have name`);
    assert.ok(PB_CHARACTERS[k].symbol, `Character ${k} must have symbol`);
    assert.ok(PB_CHARACTERS[k].universe, `Character ${k} must have universe`);
  });
});

it('Theme classes mapped correctly for all 8 universes', () => {
  assert.strictEqual(PB_CHAR_THEME_MAP.nyanya, 'theme-kidult');
  assert.strictEqual(PB_CHAR_THEME_MAP.lala, 'theme-toyou');
  assert.strictEqual(PB_CHAR_THEME_MAP.lele, 'theme-shadow');
  assert.strictEqual(PB_CHAR_THEME_MAP.abil, 'theme-pinwheel');
  assert.strictEqual(PB_CHAR_THEME_MAP.syma, 'theme-pinwheel');
  assert.strictEqual(PB_CHAR_THEME_MAP.akhira, 'theme-yawn');
  assert.strictEqual(PB_CHAR_THEME_MAP.ela, 'theme-usagain');
  assert.strictEqual(PB_CHAR_THEME_MAP.ruben, 'theme-ash');
  assert.strictEqual(PB_CHAR_THEME_MAP.royan, 'theme-hot');
});

it('applyPhotoboothUniverseTheme sets theme correctly and clears other themes', () => {
  const pbSec = createMockEl('view-photobooth');
  applyPhotoboothUniverseTheme('nyanya');
  assert.ok(pbSec.classList.contains('theme-kidult'));
  assert.strictEqual(pbSec.classList.contains('theme-yawn'), false);

  applyPhotoboothUniverseTheme('ela');
  assert.ok(pbSec.classList.contains('theme-usagain'));
  assert.strictEqual(pbSec.classList.contains('theme-kidult'), false);

  applyPhotoboothUniverseTheme('ruben');
  assert.ok(pbSec.classList.contains('theme-ash'));
  assert.strictEqual(pbSec.classList.contains('theme-usagain'), false);
});

// --- TEST SECTION 2: Full Access Without Modal Gate ---
console.log('\n--- 2. Full Access for All Characters (No Exclusive Modal Gate) ---');

it('openPhotoboothView hides exclusive preview modal for all characters', () => {
  const previewModal = createMockEl('pb-exclusive-preview-modal');
  previewModal.style.display = 'flex';

  ALL_PB_CHARACTERS.forEach(char => {
    setSelectedCharacter(char, false);
    openPhotoboothView('view-private-universe');
    assert.strictEqual(previewModal.style.display, 'none', `Modal must remain hidden for ${char}`);
    assert.strictEqual(previewModal.attributes['aria-hidden'], 'true');
  });
});

// --- TEST SECTION 3: Group Photo Sizes (1-8 Persons) ---
console.log('\n--- 3. Group Photo Mode (1–8 Persons) ---');

it('Group sizes 1 to 8 work seamlessly with active user locked as #1', () => {
  setSelectedCharacter('ela', false);
  assert.strictEqual(getSelectedParticipants()[0], 'ela');

  // Solo
  setGroupSize(1);
  assert.strictEqual(getSelectedGroupSize(), 1);
  assert.deepStrictEqual(getSelectedParticipants(), ['ela']);

  // Trio
  setGroupSize(3);
  toggleParticipant('nyanya');
  toggleParticipant('lala');
  assert.strictEqual(getSelectedParticipants().length, 3);
  assert.deepStrictEqual(getSelectedParticipants(), ['ela', 'nyanya', 'lala']);

  // Full Circle (7)
  setGroupSize(7);
  toggleParticipant('lele');
  toggleParticipant('abil');
  toggleParticipant('akhira');
  toggleParticipant('ruben');
  assert.strictEqual(getSelectedParticipants().length, 7);

  // All Universe (8)
  setGroupSize(8);
  toggleParticipant('royan');
  assert.strictEqual(getSelectedParticipants().length, 8);
  const set8 = new Set(getSelectedParticipants());
  assert.strictEqual(set8.size, 8, 'Zero duplicates in 8-person selection');
  assert.strictEqual(getSelectedParticipants()[0], 'ela', 'Ela remains host participant #1');
});

// --- TEST SECTION 4: Interactive Studio Defaults per Universe ---
console.log('\n--- 4. Studio Presets & Personalization per Character ---');

it('createDefaultStudioState adapts presets, colors, and text to active character', () => {
  const nyanyaState = createDefaultStudioState('nyanya');
  assert.strictEqual(nyanyaState.background.presetId, 'galaxy_night');
  assert.strictEqual(nyanyaState.frame.borderColor, '#f472b6');
  assert.ok(nyanyaState.title.includes('KIDULT'));

  const lalaState = createDefaultStudioState('lala');
  assert.strictEqual(lalaState.background.presetId, 'flower_garden');
  assert.strictEqual(lalaState.frame.borderColor, '#fbbf24');
  assert.ok(lalaState.title.includes('TO YOU'));

  const leleState = createDefaultStudioState('lele');
  assert.strictEqual(leleState.background.presetId, 'japanese_garden');
  assert.strictEqual(leleState.frame.borderColor, '#a855f7');
  assert.ok(leleState.title.includes('SHADOW'));

  const symaState = createDefaultStudioState('abil');
  assert.strictEqual(symaState.background.presetId, 'dreamy_clouds');
  assert.strictEqual(symaState.frame.borderColor, '#38bdf8');
  assert.ok(symaState.title.includes('PINWHEEL'));

  const akhiraState = createDefaultStudioState('akhira');
  assert.strictEqual(akhiraState.background.presetId, 'astral_ocean');
  assert.strictEqual(akhiraState.frame.borderColor, '#38bdf8');
  assert.ok(akhiraState.title.includes('YAWN'));

  const elaState = createDefaultStudioState('ela');
  assert.strictEqual(elaState.background.presetId, 'flower_garden');
  assert.strictEqual(elaState.frame.borderColor, '#ec4899');
  assert.ok(elaState.title.includes('US AGAIN'));

  const rubenState = createDefaultStudioState('ruben');
  assert.strictEqual(rubenState.background.presetId, 'sunset');
  assert.strictEqual(rubenState.frame.borderColor, '#f97316');
  assert.ok(rubenState.title.includes('ASH'));

  const royanState = createDefaultStudioState('royan');
  assert.strictEqual(royanState.background.presetId, 'galaxy_night');
  assert.strictEqual(royanState.frame.borderColor, '#f43f5e');
  assert.ok(royanState.title.includes('HOT'));
});

it('PhotoboothStudioManager supports full studio capabilities', () => {
  const sm = new PhotoboothStudioManager({ activeChar: 'ruben' });
  assert.strictEqual(sm.activeChar, 'ruben');
  assert.strictEqual(PB_BACKGROUND_PRESETS.length, 10);
  assert.strictEqual(PB_STUDIO_LAYOUTS.length, 10);
  assert.strictEqual(PB_STICKER_CATEGORIES.length, 11);
  assert.strictEqual(PB_FONTS.length, 5);

  // Undo / Redo
  sm.setBackgroundPreset('sunset');
  assert.ok(sm.undoStack.length > 0);
  sm.undo();
  assert.ok(sm.redoStack.length > 0);
  sm.redo();

  // Element transform and zoom
  sm.setCanvasZoom(1.5);
  assert.strictEqual(sm.state.zoomLevel, 1.5);
  sm.resetZoom();
  assert.strictEqual(sm.state.zoomLevel, 1.0);
});

// --- TEST SECTION 5: IndexedDB Memory Gallery Isolation & Security ---
console.log('\n--- 5. IndexedDB Memory Isolation & RBAC Security ---');

await itAsync('Saves memories with character-isolated authorship in IndexedDB', async () => {
  // Save memories for Nyanya, Ela, and Ruben
  await savePhotoboothMemory({
    id: 'test-mem-nyanya-1',
    title: 'Nyanya Starlight Moment',
    author: 'nyanya',
    participants: ['nyanya'],
    imageDataUrl: 'data:image/png;base64,mockNyanya',
    createdAt: Date.now()
  });

  await savePhotoboothMemory({
    id: 'test-mem-ela-1',
    title: 'Ela Silent Lotus',
    author: 'ela',
    participants: ['ela', 'nyanya'],
    imageDataUrl: 'data:image/png;base64,mockEla',
    createdAt: Date.now()
  });

  await savePhotoboothMemory({
    id: 'test-mem-ruben-1',
    title: 'Ruben Ember Flame',
    author: 'ruben',
    participants: ['ruben'],
    imageDataUrl: 'data:image/png;base64,mockRuben',
    createdAt: Date.now()
  });

  // Query isolated by author
  const nyanyaMems = await getPhotoboothMemories('nyanya');
  const elaMems = await getPhotoboothMemories('ela');
  const rubenMems = await getPhotoboothMemories('ruben');

  assert.ok(nyanyaMems.some(m => m.id === 'test-mem-nyanya-1'));
  assert.ok(elaMems.some(m => m.id === 'test-mem-ela-1'));
  assert.strictEqual(elaMems.some(m => m.id === 'test-mem-ruben-1'), false, 'Ruben memory must not leak into Ela gallery');
  assert.strictEqual(rubenMems.some(m => m.id === 'test-mem-nyanya-1'), false, 'Nyanya memory must not leak into Ruben gallery');
});

await itAsync('RBAC deletion check prevents cross-user deletion', async () => {
  let denied = false;
  try {
    // Lele tries to delete Ruben's memory
    await deletePhotoboothMemory('test-mem-ruben-1', 'lele');
  } catch (err) {
    denied = true;
    assert.ok(err.message.includes('Akses ditolak'));
  }
  assert.ok(denied, 'Cross-user deletion must be strictly denied');

  // Ruben deletes his own memory
  const success = await deletePhotoboothMemory('test-mem-ruben-1', 'ruben');
  assert.strictEqual(success, true);
  const check = await getPhotoboothMemoryById('test-mem-ruben-1');
  assert.strictEqual(check, null);
});

// --- TEST SECTION 6: Navigation Integration Across All 8 Universes ---
console.log('\n--- 6. Navigation Integration Across Universes & Clean Flow ---');

it('Top navbar Photobooth buttons removed and dedicated menus preserved', () => {
  const indexHtml = fs.readFileSync('./index.html', 'utf8');

  // Universal top nav pill & profile dropdown
  assert.ok(indexHtml.includes('id="nav-btn-photobooth"'), 'Universal nav button #nav-btn-photobooth must exist');
  assert.ok(indexHtml.includes('id="btn-drop-photobooth"'), 'Profile dropdown button #btn-drop-photobooth must exist');

  // 8 Universe top navbar buttons must be removed
  assert.ok(!indexHtml.includes('id="btn-kidult-photobooth"'), 'KIDULT #btn-kidult-photobooth must be removed from top navbar');
  assert.ok(!indexHtml.includes('id="btn-toyou-photobooth"'), 'TO YOU #btn-toyou-photobooth must be removed from top navbar');
  assert.ok(!indexHtml.includes('id="btn-shadow-photobooth"'), 'SHADOW #btn-shadow-photobooth must be removed from top navbar');
  assert.ok(!indexHtml.includes('id="btn-pinwheel-top-photobooth"'), 'PINWHEEL #btn-pinwheel-top-photobooth must be removed from top navbar');
  assert.ok(!indexHtml.includes('id="btn-yawn-top-photobooth"'), 'YAWN #btn-yawn-top-photobooth must be removed from top navbar');
  assert.ok(!indexHtml.includes('id="btn-usagain-nav-photobooth"'), 'US AGAIN #btn-usagain-nav-photobooth must be removed from top navbar');
  assert.ok(!indexHtml.includes('id="btn-ash-top-photobooth"'), 'ASH #btn-ash-top-photobooth must be removed from top navbar');
  assert.ok(!indexHtml.includes('id="btn-hot-nav-photobooth"'), 'HOT #btn-hot-nav-photobooth must be removed from top navbar');

  // Dedicated universe location buttons exist
  assert.ok(indexHtml.includes('id="btn-yawn-open-photobooth"'), 'YAWN #btn-yawn-open-photobooth must exist in gallery modal');
  assert.ok(indexHtml.includes('id="btn-pinwheel-open-photobooth"'), 'PINWHEEL #btn-pinwheel-open-photobooth must exist in gallery modal');
  assert.ok(indexHtml.includes('id="btn-ash-open-photobooth"'), 'ASH #btn-ash-open-photobooth must exist in gallery modal');
  assert.ok(indexHtml.includes('id="btn-usagain-open-photobooth"'), 'US AGAIN #btn-usagain-open-photobooth must exist in gallery modal');
});

it('closePhotoboothView cleanly restores the originating universe view', () => {
  const kidultWorld = createMockEl('view-kidult-world');
  const pbSec = createMockEl('view-photobooth');

  openPhotoboothView('view-kidult-world');
  assert.strictEqual(pbSec.classList.contains('active'), true);

  closePhotoboothView();
  assert.strictEqual(pbSec.classList.contains('active'), false);
  assert.strictEqual(kidultWorld.classList.contains('active'), true, 'Restored to view-kidult-world');
});

console.log('\n============================================================');
console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
console.log('============================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL 8 CHARACTERS PHOTOBOOTH EXPANSION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}
