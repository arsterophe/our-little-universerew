/**
 * OUR LITTLE UNIVERSE — FASE 8 TEST SUITE
 * Universe State & Decorations:
 * - Persistent Island Condition & Interactive Elements (Greenhouse, River, Gazebo, Telescope, Mailbox, Atelier, Crystal Tower, Gallery, Bath)
 * - Themed Decoration System (Catalog, Placement, Move, Delete, Limits)
 * - Firestore Security Rules (/universe_states/{uid}), Anti-Spoofing & Strict Mapping
 * - Cross-Account Mutation Rejection & Friend Visit Read Access
 * - Idempotent Legacy Migration & Ambiguity Quarantine
 * - Offline Queue & Real-time Synchronization
 * - UI Controller Integration (universes_view.js)
 */

import './load_env.js';
import {
  UNIVERSE_DECORATION_CATALOG,
  DEFAULT_UNIVERSE_ELEMENTS,
  CANONICAL_UIDS,
  STORAGE_KEY_UNIVERSE_CACHE,
  STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE,
  normalizeCharacterKey,
  getUniverseNameByChar,
  createDefaultUniverseState,
  addDecoration,
  updateDecorationPosition,
  removeDecoration,
  updateElementState,
  resetDecorationsToDefault,
  flushUniverseOfflineQueue,
  loadUniverseState,
  scheduleUniverseSave,
  getCurrentUniverseState,
  onUniverseStateChange,
  onUniverseStatusChange
} from './universe_state.js';

import {
  UNIVERSE_MAPPINGS,
  UNIVERSE_STATES_COLLECTION,
  dbSaveUniverseState,
  dbFetchUniverseState,
  dbMigrateUniverseState
} from './firebase.js';

import { initUniversesView } from './universes_view.js';

// Setup Mock DOM for Node environment
const mockElements = {};
function createMockEl(id, className = '') {
  const el = {
    id,
    className,
    style: {},
    dataset: {},
    attributes: {},
    classList: {
      _classes: new Set(className ? className.split(' ') : []),
      add(cls) { this._classes.add(cls); el.className = Array.from(this._classes).join(' '); },
      remove(cls) { this._classes.delete(cls); el.className = Array.from(this._classes).join(' '); },
      toggle(cls, force) {
        if (force === undefined) {
          if (this._classes.has(cls)) this.remove(cls); else this.add(cls);
        } else if (force) {
          this.add(cls);
        } else {
          this.remove(cls);
        }
      },
      contains(cls) { return this._classes.has(cls); }
    },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] || null; },
    removeAttribute(k) { delete this.attributes[k]; },
    innerHTML: '',
    textContent: '',
    disabled: false,
    value: '',
    children: [],
    listeners: {},
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    },
    click() {
      if (this.listeners['click']) {
        this.listeners['click'].forEach((fn) => fn({ clientX: 100, clientY: 100, preventDefault: () => {}, stopPropagation: () => {} }));
      }
    },
    querySelector(sel) {
      if (sel === '.sync-text') return createMockEl(`${id}-text`);
      if (sel === '.sync-icon') return createMockEl(`${id}-icon`);
      if (sel === '.decor-delete-btn') return createMockEl(`${id}-del`);
      if (sel.startsWith('#btn-interact-')) return createMockEl(`${id}-btn-int`);
      return null;
    },
    querySelectorAll(sel) {
      if (sel.includes('.kidult-hotspot')) return [createMockEl('hotspot-rumah'), createMockEl('hotspot-rumah-kaca')];
      if (sel.includes('.toyou-hotspot')) return [createMockEl('hotspot-toyou-rumah'), createMockEl('hotspot-toyou-atelier')];
      if (sel.includes('.shadow-hotspot')) return [createMockEl('hotspot-shadow-rumah'), createMockEl('hotspot-shadow-galeri')];
      if (sel.includes('.univ-island-card')) return [createMockEl('card-kidult'), createMockEl('card-toyou'), createMockEl('card-shadow')];
      return [];
    },
    appendChild(child) {
      this.children.push(child);
      return child;
    },
    removeChild(child) {
      this.children = this.children.filter(c => c !== child);
      return child;
    },
    getBoundingClientRect() {
      return { left: 0, top: 0, width: 1000, height: 800, right: 1000, bottom: 800 };
    }
  };
  mockElements[id] = el;
  return el;
}

const mockIds = [
  'view-selection', 'view-login', 'view-private-universe', 'view-kidult-world',
  'view-toyou-world', 'view-shadow-world', 'kidult-2d-stage', 'toyou-2d-stage',
  'shadow-2d-stage', 'kidult-decor-layer', 'toyou-decor-layer', 'shadow-decor-layer',
  'kidult-sync-badge', 'toyou-sync-badge', 'shadow-sync-badge',
  'kidult-decor-dock', 'toyou-decor-dock', 'shadow-decor-dock',
  'btn-kidult-decor-toggle', 'btn-toyou-decor-toggle', 'btn-shadow-decor-toggle',
  'btn-close-kidult-dock', 'btn-close-toyou-dock', 'btn-close-shadow-dock',
  'btn-kidult-decor-reset', 'btn-toyou-decor-reset', 'btn-shadow-decor-reset',
  'kidult-catalog-grid', 'toyou-catalog-grid', 'shadow-catalog-grid',
  'kidult-decor-count', 'toyou-decor-count', 'shadow-decor-count',
  'kidult-element-state-box', 'toyou-element-state-box', 'shadow-element-state-box',
  'kidult-location-panel', 'toyou-location-panel', 'shadow-location-panel',
  'kidult-loc-icon', 'kidult-loc-tag', 'kidult-loc-title', 'kidult-loc-subtitle',
  'kidult-loc-desc', 'kidult-loc-highlight', 'btn-kidult-loc-action',
  'kidult-loc-action-label', 'btn-close-kidult-panel', 'btn-kidult-panel-dismiss',
  'toyou-loc-icon', 'toyou-loc-tag', 'toyou-loc-title', 'toyou-loc-subtitle',
  'toyou-loc-desc', 'toyou-loc-highlight', 'btn-toyou-loc-action',
  'toyou-loc-action-label', 'btn-close-toyou-panel', 'btn-toyou-panel-dismiss',
  'shadow-loc-icon', 'shadow-loc-tag', 'shadow-loc-title', 'shadow-loc-subtitle',
  'shadow-loc-desc', 'shadow-loc-highlight', 'btn-shadow-loc-action',
  'shadow-loc-action-label', 'btn-close-shadow-panel', 'btn-shadow-panel-dismiss',
  'btn-kidult-back', 'btn-toyou-top-return', 'btn-shadow-top-return',
  'btn-kidult-back-bottom', 'btn-kidult-return-univ',
  'kidult-user-greeting', 'toyou-user-greeting', 'shadow-user-greeting',
  'kidult-user-avatar', 'toyou-user-avatar', 'shadow-user-avatar',
  'user-greeting', 'user-avatar'
];

mockIds.forEach(id => createMockEl(id));

global.document = {
  addEventListener: () => {},
  removeEventListener: () => {},
  getElementById: (id) => mockElements[id] || createMockEl(id),
  querySelectorAll: (sel) => {
    if (sel.includes('.kidult-hotspot')) return [mockElements['hotspot-rumah'] || createMockEl('hotspot-rumah')];
    if (sel.includes('.toyou-hotspot')) return [mockElements['hotspot-toyou-rumah'] || createMockEl('hotspot-toyou-rumah')];
    if (sel.includes('.shadow-hotspot')) return [mockElements['hotspot-shadow-rumah'] || createMockEl('hotspot-shadow-rumah')];
    if (sel.includes('.univ-island-card')) return [mockElements['card-kidult'] || createMockEl('card-kidult')];
    return [];
  },
  createElement: (tag) => createMockEl(`mock-${tag}-${Math.random().toString(36).slice(2, 6)}`)
};

global.window = {
  document: global.document,
  innerWidth: 1280,
  innerHeight: 800,
  addEventListener: () => {},
  removeEventListener: () => {},
  scrollTo: () => {},
  triggerSparkleBurst: () => {},
  localStorage: {
    _data: {},
    getItem(k) { return this._data[k] || null; },
    setItem(k, v) { this._data[k] = String(v); },
    removeItem(k) { delete this._data[k]; },
    clear() { this._data = {}; }
  }
};

global.localStorage = global.window.localStorage;

// Helper to make JWT for Firestore Emulator REST API
function makeJwt(uid, email, emailVerified = true) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: uid,
    user_id: uid,
    email: email,
    email_verified: emailVerified,
    iss: 'https://securetoken.google.com/our-little-universe-dcd75',
    aud: 'our-little-universe-dcd75',
    auth_time: 1700000000,
    iat: 1700000000,
    exp: 1900000000
  })).toString('base64url');
  return `${header}.${payload}.`;
}

const BASE_URL = 'http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents';

const NYANYA_UID = 'uid-nyanya-moonlit-star-2026';
const LALA_UID = 'uid-lala-to-you-sunshine-2026';
const LELE_UID = 'uid-lele-crystal-shadow-2026';
const STRANGER_UID = 'uid-stranger-intruder-2026';

const NYANYA_TOKEN = makeJwt(NYANYA_UID, 'nyanya@ourlittleuniverse.com', true);
const LALA_TOKEN = makeJwt(LALA_UID, 'lala@ourlittleuniverse.com', true);
const LELE_TOKEN = makeJwt(LELE_UID, 'lele@ourlittleuniverse.com', true);
const UNVERIFIED_TOKEN = makeJwt(NYANYA_UID, 'nyanya@ourlittleuniverse.com', false);
const STRANGER_TOKEN = makeJwt(STRANGER_UID, 'stranger@outerspace.org', true);

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, desc) {
  if (condition) {
    totalPassed++;
    console.log(`  ✓ ${desc}`);
  } else {
    totalFailed++;
    console.error(`  ✗ FAIL: ${desc}`);
  }
}

async function runSuite() {
  console.log('\n=============================================================');
  console.log('   OUR LITTLE UNIVERSE — FASE 8: UNIVERSE STATE & DECORATIONS');
  console.log('=============================================================\n');

  // -------------------------------------------------------------
  // SECTION 1: Character-Universe Mapping & Themed Catalog
  // -------------------------------------------------------------
  console.log('--- SECTION 1: Canonical Universe Mapping & Catalog ---');
  {
    assert(UNIVERSE_MAPPINGS.nyanya === 'KIDULT', 'Nyanya maps strictly to KIDULT');
    assert(UNIVERSE_MAPPINGS.lala === 'TO YOU', 'Lala maps strictly to TO YOU');
    assert(UNIVERSE_MAPPINGS.lele === 'SHADOW', 'Lele maps strictly to SHADOW');

    assert(getUniverseNameByChar('nyanya') === 'KIDULT', 'getUniverseNameByChar nyanya returns KIDULT');
    assert(getUniverseNameByChar('lala') === 'TO YOU', 'getUniverseNameByChar lala returns TO YOU');
    assert(getUniverseNameByChar('lele') === 'SHADOW', 'getUniverseNameByChar lele returns SHADOW');

    assert(UNIVERSE_DECORATION_CATALOG.kidult.length === 6, 'KIDULT has 6 themed decorations');
    assert(UNIVERSE_DECORATION_CATALOG.to_you.length === 6, 'TO YOU has 6 themed decorations');
    assert(UNIVERSE_DECORATION_CATALOG.shadow.length === 6, 'SHADOW has 6 themed decorations');

    assert(UNIVERSE_DECORATION_CATALOG.kidult[0].itemId === 'star_lantern', 'KIDULT item 1 is Star Lantern');
    assert(UNIVERSE_DECORATION_CATALOG.to_you[0].itemId === 'sun_lantern', 'TO YOU item 1 is Sun Lantern');
    assert(UNIVERSE_DECORATION_CATALOG.shadow[0].itemId === 'crescent_crystal', 'SHADOW item 1 is Crescent Crystal');

    assert(DEFAULT_UNIVERSE_ELEMENTS.kidult.greenhouse.plant.includes('Lavender'), 'KIDULT has Greenhouse Lavender');
    assert(DEFAULT_UNIVERSE_ELEMENTS.kidult.river.lanterns === 3, 'KIDULT has River Lanterns');
    assert(DEFAULT_UNIVERSE_ELEMENTS.to_you.atelier.dressTheme.includes('Gaun Peri'), 'TO YOU has Atelier Dress');
    assert(DEFAULT_UNIVERSE_ELEMENTS.shadow.crystal_tower.resonance.includes('98%'), 'SHADOW has Crystal Tower resonance');
  }

  // -------------------------------------------------------------
  // SECTION 2: State Engine & Decoration Mechanics
  // -------------------------------------------------------------
  console.log('\n--- SECTION 2: State Engine & Decoration Operations ---');
  {
    global.window.localStorage.clear();
    const state = createDefaultUniverseState('nyanya', NYANYA_UID);
    assert(state.uid === NYANYA_UID, 'Default state UID matches NYANYA_UID');
    assert(state.characterKey === 'nyanya', 'Character key is nyanya');
    assert(state.universeName === 'KIDULT', 'Universe is KIDULT');
    assert(Array.isArray(state.decorations) && state.decorations.length === 2, 'Nyanya starts with 2 default decorations');
    assert(state.elements.greenhouse && state.elements.river, 'Elements map contains greenhouse and river');

    // Test loadUniverseState with local state
    const authUser = { uid: NYANYA_UID, email: 'nyanya@ourlittleuniverse.com' };
    const loaded = await loadUniverseState('nyanya', authUser);
    resetDecorationsToDefault();
    assert(loaded !== null, 'loadUniverseState loads active state');
    assert(loaded.universeName === 'KIDULT', 'Loaded universe is KIDULT');

    // Test add decoration
    const added = addDecoration('crystal_shroom', 42, 68);
    assert(added !== null, 'addDecoration returns created decoration item');
    assert(added.itemId === 'crystal_shroom', 'Added decoration item ID is crystal_shroom');
    assert(added.x === 42 && added.y === 68, 'Coordinates clamped and saved');

    // Test update decoration position
    updateDecorationPosition(added.id, 55, 75);
    const currAfterMove = getCurrentUniverseState();
    const updatedDecor = currAfterMove.decorations.find(d => d.id === added.id);
    assert(updatedDecor && updatedDecor.x === 55 && updatedDecor.y === 75, 'Decoration position updated to (55, 75)');

    // Test remove decoration
    const preCount = currAfterMove.decorations.length;
    removeDecoration(added.id);
    const currAfterRemove = getCurrentUniverseState();
    assert(currAfterRemove.decorations.length === preCount - 1, 'Decoration removed from list');

    // Test update element state
    updateElementState('greenhouse', { count: 10, status: 'Mekar Bersemi 🌸' });
    const currAfterElem = getCurrentUniverseState();
    assert(currAfterElem.elements.greenhouse.count === 10, 'Greenhouse water count updated to 10');
    assert(currAfterElem.elements.greenhouse.status === 'Mekar Bersemi 🌸', 'Greenhouse status updated');

    // Test decoration maximum cap (50 items)
    let threwMaxCap = false;
    try {
      for (let i = 0; i < 60; i++) {
        addDecoration('star_lantern', 50, 50);
      }
    } catch (e) {
      threwMaxCap = true;
    }
    assert(threwMaxCap, 'Adding >50 decorations is rejected locally with boundary error');
    const currAfterCap = getCurrentUniverseState();
    assert(currAfterCap.decorations.length <= 50, 'Decorations strictly capped at 50 items');
  }

  // -------------------------------------------------------------
  // SECTION 3: Firestore Security Rules on Emulator
  // -------------------------------------------------------------
  console.log('\n--- SECTION 3: Firestore Security Rules Validation ---');
  {
    // Helper to format Firestore REST fields
    function toFsFields(obj) {
      const fields = {};
      for (const [k, v] of Object.entries(obj)) {
        if (typeof v === 'string') fields[k] = { stringValue: v };
        else if (typeof v === 'number') fields[k] = { integerValue: String(v) };
        else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
        else if (Array.isArray(v)) {
          fields[k] = {
            arrayValue: {
              values: v.map(item => {
                if (typeof item === 'object') return { mapValue: { fields: toFsFields(item) } };
                return { stringValue: String(item) };
              })
            }
          };
        } else if (typeof v === 'object' && v !== null) {
          fields[k] = { mapValue: { fields: toFsFields(v) } };
        }
      }
      return fields;
    }

    // 3.1: Valid Write by Nyanya (KIDULT)
    const nyanyaDoc = {
      uid: NYANYA_UID,
      characterKey: 'nyanya',
      universeName: 'KIDULT',
      decorations: [
        { id: 'dec-1', itemId: 'star_lantern', name: 'Lentera Bintang', icon: '⭐', x: 30, y: 40, rotation: 0, placedAt: 1700000000 },
        { id: 'dec-2', itemId: 'sunset_rose', name: 'Mawar Senja', icon: '🌸', x: 65, y: 70, rotation: 0, placedAt: 1700000000 }
      ],
      elements: {
        greenhouse: { watered: true, count: 5, plant: 'Lavender Bintang' },
        river: { lanterns: 4, lastWish: 'Small joys make a big universe ★' }
      },
      lastUpdated: 1700000000,
      updatedBy: 'nyanya',
      version: 1
    };

    const resNyanya = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NYANYA_TOKEN}`
      },
      body: JSON.stringify({ fields: toFsFields(nyanyaDoc) })
    });
    assert(resNyanya.status === 200, `Nyanya saves KIDULT universe state successfully (HTTP ${resNyanya.status})`);

    // 3.2: Valid Write by Lala (TO YOU)
    const lalaDoc = {
      uid: LALA_UID,
      characterKey: 'lala',
      universeName: 'TO YOU',
      decorations: [
        { id: 'dec-l1', itemId: 'sun_lantern', name: 'Lentera Mentari', icon: '☀️', x: 25, y: 50, rotation: 0, placedAt: 1700000000 }
      ],
      elements: {
        atelier: { dressTheme: 'Gaun Peri Pagi 👗', sketchCount: 4 },
        butterfly: { friendlyFlock: 6 }
      },
      lastUpdated: 1700000000,
      updatedBy: 'lala',
      version: 1
    };

    const resLala = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${LALA_UID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LALA_TOKEN}`
      },
      body: JSON.stringify({ fields: toFsFields(lalaDoc) })
    });
    assert(resLala.status === 200, `Lala saves TO YOU universe state successfully (HTTP ${resLala.status})`);

    // 3.3: Valid Write by Lele (SHADOW)
    const leleDoc = {
      uid: LELE_UID,
      characterKey: 'lele',
      universeName: 'SHADOW',
      decorations: [
        { id: 'dec-s1', itemId: 'crescent_crystal', name: 'Kristal Bulan Sabit', icon: '🌙', x: 35, y: 45, rotation: 0, placedAt: 1700000000 }
      ],
      elements: {
        crystal_tower: { resonance: 'Harmoni Kristal 100% 💎' },
        gallery: { paintingTitle: 'Midnight Starlight 🎨' }
      },
      lastUpdated: 1700000000,
      updatedBy: 'lele',
      version: 1
    };

    const resLele = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${LELE_UID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LELE_TOKEN}`
      },
      body: JSON.stringify({ fields: toFsFields(leleDoc) })
    });
    assert(resLele.status === 200, `Lele saves SHADOW universe state successfully (HTTP ${resLele.status})`);

    // 3.4: Cross-Account Mutation Blocked (Lala tries to write to Nyanya's universe)
    const resLalaTamper = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LALA_TOKEN}`
      },
      body: JSON.stringify({ fields: toFsFields(nyanyaDoc) })
    });
    assert(resLalaTamper.status === 403, `Lala cannot modify Nyanya's universe state (HTTP ${resLalaTamper.status} Forbidden)`);

    // 3.5: Character-Universe Mismatch Blocked (Nyanya attempts to claim TO YOU)
    const forgedMappingDoc = {
      ...nyanyaDoc,
      universeName: 'TO YOU'
    };
    const resForgedMap = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NYANYA_TOKEN}`
      },
      body: JSON.stringify({ fields: toFsFields(forgedMappingDoc) })
    });
    assert(resForgedMap.status === 403, `Nyanya claiming TO YOU is rejected by mapping rule (HTTP ${resForgedMap.status} Forbidden)`);

    // 3.6: UID Anti-Spoofing Blocked (Forged auth.uid != doc.uid)
    const forgedUidDoc = {
      ...nyanyaDoc,
      uid: LALA_UID
    };
    const resForgedUid = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NYANYA_TOKEN}`
      },
      body: JSON.stringify({ fields: toFsFields(forgedUidDoc) })
    });
    assert(resForgedUid.status === 403, `Mismatched internal UID in payload is rejected (HTTP ${resForgedUid.status} Forbidden)`);

    // 3.7: Unauthenticated Mutation Blocked
    const resUnauth = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: toFsFields(nyanyaDoc) })
    });
    assert(resUnauth.status === 403 || resUnauth.status === 401, `Unauthenticated write is rejected (HTTP ${resUnauth.status})`);

    // 3.8: Unverified Email Blocked
    const resUnverified = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${UNVERIFIED_TOKEN}`
      },
      body: JSON.stringify({ fields: toFsFields(nyanyaDoc) })
    });
    assert(resUnverified.status === 403, `Unverified email cannot write universe state (HTTP ${resUnverified.status})`);

    // 3.9: Stranger / Non-Member Blocked from Read & Write
    const resStrangerRead = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      headers: { 'Authorization': `Bearer ${STRANGER_TOKEN}` }
    });
    assert(resStrangerRead.status === 403, `Stranger cannot read universe states (HTTP ${resStrangerRead.status} Forbidden)`);

    // 3.10: Visitor Read Allowed for Canon Besties (Lala and Lele can visit Nyanya's universe)
    const resLalaVisit = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      headers: { 'Authorization': `Bearer ${LALA_TOKEN}` }
    });
    assert(resLalaVisit.status === 200, `Lala can read Nyanya's universe state for VISIT UNIVERSE mode (HTTP ${resLalaVisit.status} OK)`);

    const resLeleVisit = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
    });
    assert(resLeleVisit.status === 200, `Lele can read Nyanya's universe state for VISIT UNIVERSE mode (HTTP ${resLeleVisit.status} OK)`);

    // 3.11: Oversized Document Blocked (>50 decorations)
    const oversizedDecorations = [];
    for (let i = 0; i < 55; i++) {
      oversizedDecorations.push({ id: `d-${i}`, itemId: 'star_lantern', x: 50, y: 50 });
    }
    const oversizedDoc = {
      ...nyanyaDoc,
      decorations: oversizedDecorations
    };
    const resOversized = await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${NYANYA_UID}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NYANYA_TOKEN}`
      },
      body: JSON.stringify({ fields: toFsFields(oversizedDoc) })
    });
    assert(resOversized.status === 403, `State with >50 decorations rejected by security rules (HTTP ${resOversized.status} Forbidden)`);
  }

  // -------------------------------------------------------------
  // SECTION 4: Idempotent Migration & Ambiguity Quarantine
  // -------------------------------------------------------------
  console.log('\n--- SECTION 4: Idempotent Migration & Quarantine ---');
  {
    const authNyanya = { uid: NYANYA_UID, email: 'nyanya@ourlittleuniverse.com' };

    // 4.1: When Cloud document already exists, migration skips cleanly (idempotent)
    const migResult = await dbMigrateUniverseState(authNyanya);
    assert(migResult.migrated === true, 'Migration call executed');
    assert(migResult.alreadyExists === true || migResult.skipped === true, 'Existing Cloud state respected, redundant write skipped');

    // 4.2: Ambiguous data handling: clear cloud doc temporarily so migration runs
    await fetch(`${BASE_URL}/${UNIVERSE_STATES_COLLECTION}/${LALA_UID}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${LALA_TOKEN}` }
    });

    window.localStorage.setItem('olu_universe_state_v1', JSON.stringify({
      decorations: [{ id: 'ambig-1', itemId: 'unknown_orb' }]
      // Note: missing characterKey -> ambiguous ownership!
    }));

    // Trigger migration for Lala on fresh state
    const authLala = { uid: LALA_UID, email: 'lala@ourlittleuniverse.com' };
    const migLala = await dbMigrateUniverseState(authLala);
    assert(migLala.migrated === true, 'Lala migration processed');

    // Check quarantine log
    const ambigLog = window.localStorage.getItem('olu_universe_ambiguous_log');
    assert(ambigLog !== null, 'Ambiguous records quarantined to olu_universe_ambiguous_log');
    const parsedAmbig = JSON.parse(ambigLog);
    assert(Array.isArray(parsedAmbig) && parsedAmbig.length > 0, 'Quarantine log contains ambiguous item');
  }

  // -------------------------------------------------------------
  // SECTION 5: Offline Queue & Resync
  // -------------------------------------------------------------
  console.log('\n--- SECTION 5: Offline Queue & Resilience ---');
  {
    const authNyanya = { uid: NYANYA_UID, email: 'nyanya@ourlittleuniverse.com' };

    // Simulate saving while offline by putting item directly into offline queue
    const pendingState = {
      uid: NYANYA_UID,
      characterKey: 'nyanya',
      universeName: 'KIDULT',
      decorations: [{ id: 'offline-dec', itemId: 'star_lantern', x: 20, y: 30 }],
      elements: { greenhouse: { count: 12 } },
      lastUpdated: Date.now(),
      updatedBy: 'nyanya',
      version: 1
    };

    window.localStorage.setItem(STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE, JSON.stringify({
      nyanya: { state: pendingState, queuedAt: Date.now() }
    }));

    // Flush offline queue
    const flushedCount = await flushUniverseOfflineQueue(authNyanya);
    assert(flushedCount === 1, 'Pending offline state successfully flushed to Cloud');

    // Verify queue is empty for nyanya
    const queueRaw = window.localStorage.getItem(STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE);
    const queueObj = JSON.parse(queueRaw);
    assert(!queueObj.nyanya, 'Flushed item cleared from offline queue');
  }

  // -------------------------------------------------------------
  // SECTION 6: UI & Controller Integration (universes_view.js)
  // -------------------------------------------------------------
  console.log('\n--- SECTION 6: UI Controller Integration ---');
  {
    let toastFired = '';
    let sparkleFired = false;

    const controller = initUniversesView({
      onShowToast: (msg) => { toastFired = msg; },
      onTriggerSparkle: () => { sparkleFired = true; }
    });

    assert(controller !== null, 'initUniversesView returns active controller');
    assert(typeof controller.openKidultWorld === 'function', 'Controller has openKidultWorld');
    assert(typeof controller.openToYouWorld === 'function', 'Controller has openToYouWorld');
    assert(typeof controller.openShadowWorld === 'function', 'Controller has openShadowWorld');
    assert(typeof controller.syncUniverseStateActiveCharacter === 'function', 'Controller has syncUniverseStateActiveCharacter');

    // 1. Sync character as Nyanya
    controller.syncUniverseStateActiveCharacter('nyanya', { uid: NYANYA_UID, email: 'nyanya@ourlittleuniverse.com' });

    // 2. Open KIDULT world
    controller.openKidultWorld();
    assert(mockElements['view-kidult-world'].classList.contains('active'), 'KIDULT 2D stage marked active');

    // 3. Select location Rumah Kaca (Greenhouse)
    controller.selectKidultLocation('rumah_kaca');
    assert(mockElements['kidult-location-panel'].classList.contains('open'), 'Kidult location panel opened');
    assert(mockElements['kidult-element-state-box'].style.display === 'flex', 'Element state box visible for greenhouse');
    assert(mockElements['kidult-element-state-box'].innerHTML.includes('Starlight Conservatory'), 'Element box contains Starlight Conservatory status');

    // 4. Select location Sungai Senja
    controller.selectKidultLocation('sungai_senja');
    assert(mockElements['kidult-element-state-box'].innerHTML.includes('Lentera Sungai Senja'), 'Element box contains Sungai Senja status');

    // 5. Select location Gazebo
    controller.selectKidultLocation('gazebo');
    assert(mockElements['kidult-element-state-box'].innerHTML.includes('Gazebo Tepi Sungai'), 'Element box contains Gazebo status');

    // 6. Select location Teleskop (Star Messages)
    controller.selectKidultLocation('teleskop');
    assert(mockElements['kidult-element-state-box'].innerHTML.includes('Pengamatan Bintang'), 'Element box contains Teleskop Star Messages status');

    // 7. Test Visitor Mode protection
    // Switch character to Lala (visitor to KIDULT)
    controller.syncUniverseStateActiveCharacter('lala', { uid: LALA_UID, email: 'lala@ourlittleuniverse.com' });
    const btnDecorToggle = mockElements['btn-kidult-decor-toggle'];
    btnDecorToggle.click();
    assert(toastFired.includes('Mode Pengunjung'), 'Visitor attempting to toggle decor dock receives polite visitor notification');
  }

  // -------------------------------------------------------------
  // TEST SUMMARY
  // -------------------------------------------------------------
  console.log('\n=============================================================');
  console.log(`FASE 8 TEST RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('=============================================================\n');

  if (totalFailed > 0) {
    console.error('❌ SOME TESTS FAILED IN FASE 8 SUITE!');
    process.exit(1);
  } else {
    console.log('✅ ALL FASE 8 TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  }
}

runSuite().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
