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

async function runBenchmark() {
  console.log('=== BENCHMARK: ORBIT EVENT STORAGE LATENCY & OPERATIONS ===');

  const { addOrbitEvent, getOrbitEvents } = await import('../orbit.js');
  const { dbSaveOrbitEvent } = await import('../firebase.js');

  const testData = {
    title: 'Benchmarking Fast Save',
    category: 'reminder',
    date: '25/12/2026',
    time: '19:00',
    location: 'Pinwheel Sky Garden',
    description: 'Performance testing event save',
    proposer: 'abil'
  };

  const t0 = performance.now();
  const evt = addOrbitEvent(testData);
  const t1 = performance.now();

  console.log(`Local creation + normalization + state insertion: ${(t1 - t0).toFixed(2)} ms`);
  assert.ok(evt.id);
  assert.strictEqual(evt.date, '2026-12-25');
  console.log('Total local events now:', getOrbitEvents().length);
}

runBenchmark().catch(console.error);
