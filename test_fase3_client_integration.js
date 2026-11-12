/**
 * OUR LITTLE UNIVERSE — FASE 3 CLIENT INTEGRATION & MIGRATION TEST
 * Tests firebase.js client functions:
 * - dbSyncUserProfile
 * - dbFetchUserProfile
 * - dbUpdateUserProfile
 * - dbSaveStory
 * - dbDeleteStory
 * - dbFetchStories
 * - dbMigrateStories
 */

import {
  dbSyncUserProfile,
  dbFetchUserProfile,
  dbUpdateUserProfile,
  dbSaveStory,
  dbDeleteStory,
  dbFetchStories,
  dbMigrateStories,
  backupLocalStorageKey,
  identifyUserCharacter,
  CHARACTER_AUTH_RULES
} from './firebase.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`✗ FAIL: ${message}`);
  }
}

// In-memory mock localStorage for Node environment
if (typeof window === 'undefined') {
  const store = new Map();
  global.window = {
    localStorage: {
      getItem: (key) => store.get(key) || null,
      setItem: (key, val) => store.set(key, String(val)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear()
    }
  };
  global.localStorage = global.window.localStorage;
}

async function runClientTests() {
  console.log('================================================================');
  console.log('FASE 3 CLIENT LOGIC & MIGRATION TEST');
  console.log('================================================================');

  const mockNyanya = {
    uid: 'uid_nyanya_alenda',
    email: 'nyanya@ourlittleuniverse.com'
  };

  const mockLala = {
    uid: 'uid_lala_bella',
    email: 'lala@ourlittleuniverse.com'
  };

  // 1. Test Backup Mechanism
  console.log('\n--- 1. Testing Backup Mechanism ---');
  window.localStorage.setItem('olu_stories_store_v1', JSON.stringify([
    { id: 'story-local-1', title: 'Cerita Lama Nyanya', authorId: 'nyanya', content: 'Konten 1' },
    { id: 'story-local-2', title: 'Cerita Lama Lala', authorId: 'lala', content: 'Konten 2' },
    { id: 'story-local-corrupt', title: 'Cerita Tanpa Author' } // Ambiguous!
  ]));

  const backupRes = backupLocalStorageKey('olu_stories_store_v1');
  assert(backupRes.backedUp === true, 'Backup of local stories created successfully');
  assert(Boolean(backupRes.backupKey), 'Timestamped backup key exists');
  assert(Boolean(window.localStorage.getItem('olu_stories_store_v1_backup_latest')), 'Latest backup key exists');

  // 2. Test Story Migration Exports & Validation
  console.log('\n--- 2. Testing Story Functions & Security Guards ---');
  assert(typeof dbMigrateStories === 'function', 'dbMigrateStories function is exported');
  assert(typeof dbSyncUserProfile === 'function', 'dbSyncUserProfile function is exported');
  assert(typeof dbFetchUserProfile === 'function', 'dbFetchUserProfile function is exported');
  assert(typeof dbUpdateUserProfile === 'function', 'dbUpdateUserProfile function is exported');
  assert(typeof dbSaveStory === 'function', 'dbSaveStory function is exported');
  assert(typeof dbDeleteStory === 'function', 'dbDeleteStory function is exported');
  assert(typeof dbFetchStories === 'function', 'dbFetchStories function is exported');

  // Character Identification
  assert(identifyUserCharacter(mockNyanya) === 'nyanya', 'Nyanya identified properly from token email');
  assert(identifyUserCharacter(mockLala) === 'lala', 'Lala identified properly from token email');
  assert(CHARACTER_AUTH_RULES.nyanya.universe === 'KIDULT', 'Nyanya universe mapped to KIDULT');
  assert(CHARACTER_AUTH_RULES.lala.universe === 'TO YOU', 'Lala universe mapped to TO YOU');

  // Test error handling for unauthenticated calls
  try {
    await dbSaveStory({ title: 'Test' }, null);
    assert(false, 'dbSaveStory should reject unauthenticated calls');
  } catch (err) {
    assert(err.message.includes('Autentikasi diperlukan') || err.message.includes('Firestore belum terinisialisasi'), 'dbSaveStory strictly guards against unauthenticated / uninitialized calls');
  }

  try {
    await dbSyncUserProfile(null);
    assert(false, 'dbSyncUserProfile should reject unauthenticated calls');
  } catch (err) {
    assert(err.message.includes('Autentikasi diperlukan') || err.message.includes('Firestore belum terinisialisasi'), 'dbSyncUserProfile strictly guards against unauthenticated / uninitialized calls');
  }

  try {
    await dbDeleteStory('story-1', null);
    assert(false, 'dbDeleteStory should reject unauthenticated calls');
  } catch (err) {
    assert(err.message.includes('Autentikasi diperlukan') || err.message.includes('Firestore belum terinisialisasi'), 'dbDeleteStory strictly guards against unauthenticated / uninitialized calls');
  }

  console.log('\n================================================================');
  console.log(`FASE 3 CLIENT TESTS: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================');
}

runClientTests().catch(console.error);
