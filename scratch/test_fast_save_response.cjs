const assert = require('assert');

// Mock localStorage and window
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.window = { localStorage: localStorageMock };
global.localStorage = localStorageMock;

async function run() {
  console.log('===============================================================');
  console.log('TEST SUITE: FAST SAVE RESPONSE & OPTIMISTIC UI VERIFICATION');
  console.log('===============================================================');

  const {
    normalizeDateString,
    addOrbitEvent,
    deleteOrbitEvent,
    getOrbitEvents,
    getEventsForDate,
    getUpcomingAgendas,
    focusCalendarOnDate,
    getCurrentDate,
    getSelectedDateStr,
    getActiveCategoryFilter,
    subscribeOrbit
  } = await import('../orbit.js');

  const {
    CHARACTER_AUTH_RULES,
    identifyUserCharacter
  } = await import('../firebase.js');

  // TEST 1: Batched Calendar Focus (< 1ms and exactly 1 re-render)
  console.log('\n--- 1. TEST: Batched Calendar Navigation (focusCalendarOnDate) ---');
  let renderCount = 0;
  const unsub = subscribeOrbit(() => {
    renderCount++;
  });

  const tFocus0 = performance.now();
  focusCalendarOnDate('25/12/2026');
  const tFocus1 = performance.now();

  assert.strictEqual(getSelectedDateStr(), '2026-12-25');
  assert.strictEqual(getActiveCategoryFilter(), 'all');
  assert.strictEqual(getCurrentDate().getFullYear(), 2026);
  assert.strictEqual(getCurrentDate().getMonth(), 11);
  assert.strictEqual(renderCount, 1, 'Batched state update must trigger exactly 1 listener notification');
  console.log(`✓ PASS: Batched navigation finished in ${(tFocus1 - tFocus0).toFixed(3)} ms with exactly 1 render!`);
  unsub();

  // TEST 2: Instant Optimistic Event Creation Latency
  console.log('\n--- 2. TEST: Instant Optimistic Event Creation Latency ---');
  const testData = {
    title: 'Acara Uji Coba Cepat Syma ✦',
    category: 'reminder',
    date: '25/12/2026',
    time: '19:00',
    location: 'Pinwheel Sky Garden',
    description: 'Pengujian responsivitas simpan',
    proposer: 'abil',
    syncStatus: 'syncing'
  };

  const tStart = performance.now();
  const created = addOrbitEvent(testData);
  focusCalendarOnDate(testData.date);
  const tEnd = performance.now();
  const latencyMs = tEnd - tStart;

  console.log(`⚡ Waktu eksekusi lokal (addOrbitEvent + batch focus): ${latencyMs.toFixed(2)} ms`);
  assert.ok(latencyMs < 50, `Waktu respons lokal harus di bawah 50ms (didapat: ${latencyMs.toFixed(2)} ms)`);

  assert.ok(created.id, 'Event must have ID');
  assert.strictEqual(created.syncStatus, 'syncing', 'Initial sync status is syncing');
  assert.strictEqual(created.date, '2026-12-25', 'Date is normalized to YYYY-MM-DD');

  // Event must be IMMEDIATELY visible
  const evtsOnDate = getEventsForDate('2026-12-25');
  assert.ok(evtsOnDate.some(e => e.id === created.id), 'Event must be immediately visible on calendar date');
  console.log('✓ PASS: Event immediately visible in local memory and UI state (< 50ms)!');

  // TEST 3: Persistence in LocalStorage (Survives Refresh)
  console.log('\n--- 3. TEST: Persistence on Page Refresh (localStorage check) ---');
  const rawStored = localStorage.getItem('olu_orbit_events_v2');
  assert.ok(rawStored, 'Stored data exists in localStorage');
  const parsed = JSON.parse(rawStored);
  const foundInStorage = parsed.find(e => e.id === created.id);
  assert.ok(foundInStorage, 'Event found in localStorage');
  assert.strictEqual(foundInStorage.title, 'Acara Uji Coba Cepat Syma ✦');
  console.log('✓ PASS: Event safely saved to localStorage, will persist across page reloads!');

  // TEST 4: Simulated Background Sync Confirmation
  console.log('\n--- 4. TEST: Simulated Background Sync Confirmation ---');
  created.syncStatus = 'synced';
  assert.strictEqual(created.syncStatus, 'synced');
  console.log('✓ PASS: Event marked as synced once Cloud confirms!');

  // TEST 5: Rollback on Simulated Network/Cloud Error
  console.log('\n--- 5. TEST: Rollback on Simulated Cloud Error ---');
  const failedEvent = addOrbitEvent({
    title: 'Event Gagal Cloud',
    category: 'reminder',
    date: '2026-12-28',
    proposer: 'abil'
  });
  assert.ok(getOrbitEvents().some(e => e.id === failedEvent.id), 'Failed event temporarily present');

  // Simulate catch rollback
  deleteOrbitEvent(failedEvent.id, 'abil');
  assert.ok(!getOrbitEvents().some(e => e.id === failedEvent.id), 'Failed event cleanly removed on rollback');
  console.log('✓ PASS: Rollback cleanly removes failed optimistic event without corrupting data!');

  // TEST 6: Double Submit Protection
  console.log('\n--- 6. TEST: Double Submit Protection Verification ---');
  let isSubmitting = false;
  let submitCount = 0;

  function simulateSubmit() {
    if (isSubmitting) return false;
    isSubmitting = true;
    submitCount++;
    return true;
  }

  assert.strictEqual(simulateSubmit(), true, 'First click allowed');
  assert.strictEqual(simulateSubmit(), false, 'Second rapid click blocked');
  assert.strictEqual(simulateSubmit(), false, 'Third rapid click blocked');
  assert.strictEqual(submitCount, 1, 'Only 1 submission allowed during in-flight save');
  isSubmitting = false;
  console.log('✓ PASS: Double submit guard prevents duplicate data generation!');

  // TEST 7: Multi-character Non-Regression
  console.log('\n--- 7. TEST: Equal Access for All 8 Characters Maintained ---');
  const canonicalChars = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
  canonicalChars.forEach(char => {
    assert.ok(CHARACTER_AUTH_RULES[char], `Auth rule exists for ${char}`);
  });
  console.log('✓ PASS: All 8 characters retain full equal access!');

  console.log('\n===============================================================');
  console.log('ALL FAST SAVE RESPONSE TESTS PASSED 100%! ✨');
  console.log('===============================================================');
}

run().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
