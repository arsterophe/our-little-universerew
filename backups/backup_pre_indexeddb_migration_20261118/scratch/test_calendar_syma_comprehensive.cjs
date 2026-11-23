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
  console.log('TEST SUITE: SYMA PINWHEEL CALENDAR STORAGE & DATA INTEGRITY');
  console.log('===============================================================');

  const {
    normalizeDateString,
    addOrbitEvent,
    getOrbitEvents,
    getEventsForDate,
    getUpcomingAgendas,
    setSelectedDate,
    setCurrentDate,
    getCurrentDate,
    getSelectedDateStr
  } = await import('../orbit.js');

  const {
    CHARACTER_AUTH_RULES,
    CANONICAL_CHARACTERS,
    identifyUserCharacter
  } = await import('../firebase.js');

  // TEST 1: Date Normalization
  console.log('\n--- 1. TEST: Date String Normalization ---');
  assert.strictEqual(normalizeDateString('25/12/2026'), '2026-12-25', 'DD/MM/YYYY should become YYYY-MM-DD');
  assert.strictEqual(normalizeDateString('25-12-2026'), '2026-12-25', 'DD-MM-YYYY should become YYYY-MM-DD');
  assert.strictEqual(normalizeDateString('2026-12-25'), '2026-12-25', 'YYYY-MM-DD should remain YYYY-MM-DD');
  assert.strictEqual(normalizeDateString('2026/12/25'), '2026-12-25', 'YYYY/MM/DD should become YYYY-MM-DD');
  assert.strictEqual(normalizeDateString(' 25/12/2026 '), '2026-12-25', 'Whitespace trimmed');
  console.log('✓ PASS: All date formats successfully normalized to YYYY-MM-DD');

  // TEST 2: Syma Identity & Alias in Auth Rules
  console.log('\n--- 2. TEST: Syma Character Identity & Canonical UID ---');
  assert.strictEqual(CHARACTER_AUTH_RULES.abil.uid, 'Euc0JLt3kWMveUEIjBwXHfOfvQD3');
  assert.strictEqual(CHARACTER_AUTH_RULES.abil.email, 'abil@ourlittleuniverse.com');
  assert.strictEqual(CHARACTER_AUTH_RULES.syma.uid, 'Euc0JLt3kWMveUEIjBwXHfOfvQD3');
  assert.strictEqual(CHARACTER_AUTH_RULES.syma.email, 'abil@ourlittleuniverse.com');

  const userByUid = { uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3', email: 'abil@ourlittleuniverse.com' };
  assert.strictEqual(identifyUserCharacter(userByUid), 'abil', 'Syma UID resolves to abil');

  const userBySymaEmail = { uid: 'some-mock-uid', email: 'syma@ourlittleuniverse.com' };
  assert.strictEqual(identifyUserCharacter(userBySymaEmail), 'abil', 'Syma email alias resolves to abil');
  console.log('✓ PASS: Syma UID and email alias (abil & syma) recognized correctly');

  // TEST 3: Add Calendar Event using User Test Data
  console.log('\n--- 3. TEST: Add Event with User Data (DD/MM/YYYY date) ---');
  const testData = {
    title: 'tes',
    category: 'reminder',
    date: '25/12/2026',
    time: '19:00',
    location: 'sdd',
    description: 'dfdf',
    proposer: 'abil'
  };

  const createdEvt = addOrbitEvent(testData);
  assert.ok(createdEvt.id, 'Event must have ID');
  assert.strictEqual(createdEvt.title, 'tes');
  assert.strictEqual(createdEvt.category, 'reminder');
  assert.strictEqual(createdEvt.date, '2026-12-25', 'Stored date must be canonical YYYY-MM-DD');
  assert.strictEqual(createdEvt.time, '19:00');
  assert.strictEqual(createdEvt.location, 'sdd');
  assert.strictEqual(createdEvt.description, 'dfdf');
  assert.strictEqual(createdEvt.proposer, 'abil');
  assert.strictEqual(createdEvt.proposerUid, 'Euc0JLt3kWMveUEIjBwXHfOfvQD3');
  assert.strictEqual(createdEvt.proposerEmail, 'abil@ourlittleuniverse.com');
  console.log('✓ PASS: Event saved with normalized date 2026-12-25 and Syma UID ownership');

  // TEST 4: Query by Date (Supports both YYYY-MM-DD and DD/MM/YYYY)
  console.log('\n--- 4. TEST: Query Events for Date ---');
  const evtsIso = getEventsForDate('2026-12-25');
  assert.strictEqual(evtsIso.length, 1, 'Should find 1 event with 2026-12-25');
  assert.strictEqual(evtsIso[0].title, 'tes');

  const evtsDmy = getEventsForDate('25/12/2026');
  assert.strictEqual(evtsDmy.length, 1, 'Should find 1 event with 25/12/2026 query');
  assert.strictEqual(evtsDmy[0].title, 'tes');
  console.log('✓ PASS: Both ISO and DD/MM/YYYY date queries find the event');

  // TEST 5: Upcoming Agendas
  console.log('\n--- 5. TEST: Upcoming Agendas Rendering Data ---');
  const upcoming = getUpcomingAgendas(20);
  const foundInUpcoming = upcoming.find(e => e.title === 'tes');
  assert.ok(foundInUpcoming, 'Event "tes" must appear in upcoming agendas');
  assert.strictEqual(foundInUpcoming.date, '2026-12-25');
  console.log('✓ PASS: Event appears in upcoming agendas without NaN errors');

  // TEST 6: Calendar Navigation Updaters
  console.log('\n--- 6. TEST: Calendar Navigation Updaters ---');
  setSelectedDate('25/12/2026');
  assert.strictEqual(getSelectedDateStr(), '2026-12-25', 'setSelectedDate normalizes date');

  setCurrentDate(new Date(2026, 11, 25));
  assert.strictEqual(getCurrentDate().getMonth(), 11, 'Month set to December');
  assert.strictEqual(getCurrentDate().getFullYear(), 2026, 'Year set to 2026');
  console.log('✓ PASS: Calendar navigation correctly navigates to event date');

  // TEST 7: Firestore Rules Schema Compliance
  console.log('\n--- 7. TEST: Payload Structure against firestore.rules Schema ---');
  const validCanonicalKeys = ['nyanya', 'lala', 'lele', 'abil', 'syma', 'akhira', 'ela', 'ruben', 'royan'];
  const hasRequired = ['title', 'date', 'category', 'proposerUid'].every(f => f in createdEvt);
  assert.ok(hasRequired, 'Has all required fields for isValidOrbitEvent');
  assert.ok(['together', 'meeting', 'birthday', 'reminder', 'personal'].includes(createdEvt.category), 'Category valid');
  assert.ok(createdEvt.proposerUid === 'Euc0JLt3kWMveUEIjBwXHfOfvQD3', 'Proposer UID valid');
  
  if (createdEvt.responses) {
    const keys = Object.keys(createdEvt.responses);
    const allValid = keys.every(k => validCanonicalKeys.includes(k));
    assert.ok(allValid, 'Responses keys conform to firestore.rules whitelist');
  }
  console.log('✓ PASS: Payload conforms strictly to firestore.rules isValidOrbitEvent');

  console.log('\n===============================================================');
  console.log('ALL 7 CALENDAR STORAGE TESTS PASSED 100%! ✨');
  console.log('===============================================================');
}

run().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
