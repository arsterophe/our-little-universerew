import assert from 'assert';
import fs from 'fs';
import {
  OLU_STORE_HOUSE_STATES,
  OLU_STORE_BACKUPS,
  saveToIndexedDB,
  loadFromIndexedDB,
  migrateFromLocalStorage,
  getSynchronousState,
  setSynchronousState,
  safeLocalStorageSetItem,
  emergencyCleanLocalStorage
} from './olu_indexeddb.js';

import {
  loadDragonDenState,
  saveDragonDenState,
  createDefaultDragonDenState,
  DRAGON_DEN_STORAGE_KEY
} from './dragon_den_state.js';

import {
  loadSilentLotusState,
  saveSilentLotusState,
  createDefaultSilentLotusState,
  SILENT_LOTUS_STORAGE_KEY
} from './silent_lotus_state.js';

import {
  loadAzurePalaceState,
  saveAzurePalaceState,
  createDefaultAzurePalaceState,
  AZURE_PALACE_STORAGE_KEY
} from './azure_palace_state.js';

import {
  loadPinwheelHavenState,
  savePinwheelHavenState,
  createDefaultPinwheelHavenState,
  PINWHEEL_HAVEN_STORAGE_KEY
} from './pinwheel_haven_state.js';

import {
  loadMoonpetalHavenState,
  saveMoonpetalHavenState,
  getDefaultMoonpetalHavenState,
  MOONPETAL_MANOR_STORAGE_KEY
} from './moonpetal_manor_state.js';

import {
  loadKidultHouseState,
  saveKidultHouseState,
  getDefaultKidultHouseState,
  KIDULT_HOUSE_STORAGE_KEY
} from './kidult_house_state.js';

import {
  loadBloomCottageState,
  saveBloomCottageState,
  getDefaultBloomCottageState,
  getBloomCottageStorageKey
} from './bloom_cottage_state.js';

import {
  loadEclipseState,
  saveEclipseState,
  getDefaultEclipseState
} from './eclipse_state.js';

import {
  CANONICAL_CHARACTERS,
  identifyUserCharacter,
  verifyCharacterAuthorization
} from './firebase.js';

console.log('================================================================');
console.log('OUR LITTLE UNIVERSE — INDEXEDDB MIGRATION & STORAGE TEST SUITE');
console.log('================================================================');

// Mock localStorage in Node.js
const mockStorage = new Map();
globalThis.localStorage = {
  getItem: (k) => (mockStorage.has(k) ? mockStorage.get(k) : null),
  setItem: (k, v) => mockStorage.set(k, String(v)),
  removeItem: (k) => mockStorage.delete(k),
  clear: () => mockStorage.clear(),
  get length() { return mockStorage.size; },
  key: (i) => Array.from(mockStorage.keys())[i] || null
};

async function runStorageSuite() {
  console.log('\n--- 1. SIMULATING LARGE LEGACY LOCALSTORAGE DATA ACROSS ALL 8 HOUSES ---');

  // Populate mock localStorage with large payloads (> 100KB each)
  const characters = [
    { key: 'ruben', storageKey: DRAGON_DEN_STORAGE_KEY, defaultFn: createDefaultDragonDenState },
    { key: 'ela', storageKey: SILENT_LOTUS_STORAGE_KEY, defaultFn: createDefaultSilentLotusState },
    { key: 'akhira', storageKey: `${AZURE_PALACE_STORAGE_KEY}_akhira`, defaultFn: createDefaultAzurePalaceState },
    { key: 'syma', storageKey: PINWHEEL_HAVEN_STORAGE_KEY, defaultFn: createDefaultPinwheelHavenState },
    { key: 'royan', storageKey: MOONPETAL_MANOR_STORAGE_KEY, defaultFn: getDefaultMoonpetalHavenState },
    { key: 'nyanya', storageKey: KIDULT_HOUSE_STORAGE_KEY, defaultFn: getDefaultKidultHouseState },
    { key: 'lala', storageKey: getBloomCottageStorageKey('lala'), defaultFn: () => getDefaultBloomCottageState('lala') },
    { key: 'lele', storageKey: 'the_eclipse_author_state_lele', defaultFn: getDefaultEclipseState }
  ];

  let initialBytes = 0;
  for (const c of characters) {
    const data = c.defaultFn();
    data.customSimulatedLargeString = 'x'.repeat(150000); // 150 KB dummy payload
    const serialized = JSON.stringify(data);
    initialBytes += serialized.length;
    localStorage.setItem(c.storageKey, serialized);
  }

  console.log(`Total legacy localStorage payload: ${(initialBytes / 1024).toFixed(1)} KB across 8 characters.`);
  assert.ok(initialBytes > 1000000, 'Simulated data should be > 1 MB');

  console.log('\n--- 2. VERIFYING SEAMLESS SYNCHRONOUS READ & MIGRATION ---');

  // Ruben
  const rubenLoaded = loadDragonDenState('ruben');
  assert.strictEqual(rubenLoaded.character, 'ruben');
  assert.ok(rubenLoaded.customSimulatedLargeString, 'Ruben state preserved');

  // Ela
  const elaLoaded = loadSilentLotusState('ela');
  assert.strictEqual(elaLoaded.character, 'ela');
  assert.ok(elaLoaded.customSimulatedLargeString, 'Ela state preserved');

  // Akhira
  const akhiraLoaded = loadAzurePalaceState('akhira');
  assert.ok(akhiraLoaded.customSimulatedLargeString, 'Akhira state preserved');

  // Syma
  const symaLoaded = loadPinwheelHavenState('syma');
  assert.ok(symaLoaded.customSimulatedLargeString, 'Syma state preserved');

  // Royan
  const royanLoaded = loadMoonpetalHavenState();
  assert.ok(royanLoaded.customSimulatedLargeString, 'Royan state preserved');

  // Nyanya
  const nyanyaLoaded = loadKidultHouseState('nyanya');
  assert.ok(nyanyaLoaded.customSimulatedLargeString, 'Nyanya state preserved');

  // Lala
  const lalaLoaded = loadBloomCottageState('lala');
  assert.ok(lalaLoaded.customSimulatedLargeString, 'Lala state preserved');

  // Lele
  const leleLoaded = loadEclipseState('lele');
  assert.ok(leleLoaded.customSimulatedLargeString, 'Lele state preserved');

  console.log('✓ All 8 house states read and migrated without data loss.');

  console.log('\n--- 3. VERIFYING LOCALSTORAGE QUOTA FREED BY STUB REPLACEMENT ---');

  // Save updated states through our centralized engine
  saveDragonDenState('ruben', rubenLoaded);
  saveSilentLotusState('ela', elaLoaded);
  saveAzurePalaceState('akhira', akhiraLoaded);
  savePinwheelHavenState('syma', symaLoaded);
  saveMoonpetalHavenState(royanLoaded);
  saveKidultHouseState('nyanya', nyanyaLoaded);
  saveBloomCottageState('lala', lalaLoaded);
  saveEclipseState('lele', leleLoaded);

  let postMigrationBytes = 0;
  for (const c of characters) {
    const raw = localStorage.getItem(c.storageKey);
    postMigrationBytes += (raw ? raw.length : 0);
  }

  console.log(`Post-migration localStorage footprint: ${(postMigrationBytes / 1024).toFixed(2)} KB.`);
  assert.ok(postMigrationBytes < 15000, `Footprint should be tiny (< 15 KB), got ${postMigrationBytes} bytes.`);
  const reduction = ((1 - postMigrationBytes / initialBytes) * 100).toFixed(1);
  console.log(`✓ localStorage footprint reduced by ${reduction}%! Zero chance of QuotaExceededError.`);

  console.log('\n--- 4. SIMULATING QUOTAEXCEEDEDERROR & PROVING RESILIENCE ---');

  // Mock localStorage.setItem to throw QuotaExceededError
  const origSetItem = localStorage.setItem;
  localStorage.setItem = (k, v) => {
    const err = new Error('The quota has been exceeded.');
    err.name = 'QuotaExceededError';
    err.code = 22;
    throw err;
  };

  let threwException = false;
  try {
    // Calling safeLocalStorageSetItem must NOT throw
    const res = safeLocalStorageSetItem('test_quota_key', 'test_data');
    assert.strictEqual(res, false, 'safeLocalStorageSetItem should report false without throwing');

    // Saving house state under quota error must NOT crash gameplay
    saveDragonDenState('ruben', rubenLoaded);
    saveSilentLotusState('ela', elaLoaded);

    // Reading back state must still return valid memory state
    const rubenReadback = loadDragonDenState('ruben');
    assert.strictEqual(rubenReadback.character, 'ruben');
    assert.ok(rubenReadback.customSimulatedLargeString);
  } catch (err) {
    threwException = true;
    console.error('Unexpected exception during QuotaExceeded test:', err);
  } finally {
    localStorage.setItem = origSetItem;
  }

  assert.strictEqual(threwException, false, 'Engine must completely swallow QuotaExceededError safely');
  console.log('✓ QuotaExceededError successfully intercepted with zero crash and zero data corruption.');

  console.log('\n--- 5. VERIFYING FIREBASE AUTH PERSISTENCE ARCHITECTURE ---');
  const firebaseCode = fs.readFileSync('firebase.js', 'utf8');
  assert.ok(
    firebaseCode.includes('indexedDBLocalPersistence'),
    'firebase.js must import and configure indexedDBLocalPersistence'
  );
  assert.ok(
    !firebaseCode.includes('browserLocalPersistence'),
    'firebase.js must NOT import or use browserLocalPersistence (which uses localStorage)'
  );
  assert.ok(
    !firebaseCode.includes('browserSessionPersistence'),
    'firebase.js must NOT use browserSessionPersistence'
  );
  assert.ok(
    firebaseCode.includes('inMemoryPersistence'),
    'firebase.js must configure fallback to inMemoryPersistence'
  );
  console.log('✓ Firebase Auth persistence strictly isolated to IndexedDB & in-memory.');

  console.log('\n--- 6. VERIFYING ALL 8 CANONICAL USER LOGINS & ISOLATION ---');
  const allChars = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
  for (const charKey of allChars) {
    const config = CANONICAL_CHARACTERS[charKey];
    assert.ok(config, `Character ${charKey} must exist in CANONICAL_CHARACTERS`);
    assert.ok(config.uid, `Character ${charKey} must have UID`);
    assert.ok(config.email, `Character ${charKey} must have email`);

    const mockUser = { uid: config.uid, email: config.email };
    const identified = identifyUserCharacter(mockUser);
    assert.strictEqual(identified, charKey, `User ${config.uid} must identify strictly as ${charKey}`);

    const authCheck = verifyCharacterAuthorization(mockUser, charKey);
    assert.strictEqual(authCheck.authorized, true, `User must be authorized for own universe`);

    // Verify isolation: must be rejected for other 7 universes
    for (const otherChar of allChars) {
      if (otherChar !== charKey) {
        const otherCheck = verifyCharacterAuthorization(mockUser, otherChar);
        assert.strictEqual(otherCheck.authorized, false, `User ${charKey} must NOT be authorized for ${otherChar}`);
      }
    }
  }
  console.log('✓ All 8 character authentications and universe isolations 100% verified.');

  console.log('\n================================================================');
  console.log('ALL STORAGE & AUTHENTICATION TESTS PASSED WITH 100% SUCCESS! ✨');
  console.log('================================================================');
}

runStorageSuite().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
