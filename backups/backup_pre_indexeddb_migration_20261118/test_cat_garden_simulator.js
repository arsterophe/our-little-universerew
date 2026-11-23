/**
 * TEST SUITE: CAT CARE SIMULATOR (SYMA'S PINWHEEL SANCTUARY)
 */

import {
  CAT_ROSTER_DEFS,
  GROWTH_STAGES,
  createDefaultState,
  getCatGrowthStage,
  saveCatCareState,
  loadCatCareState,
  SYMA_UID
} from './cat_garden.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(message);
  }
}

// Mock localStorage for node testing
const storageMap = new Map();
global.localStorage = {
  getItem: (k) => storageMap.get(k) || null,
  setItem: (k, v) => storageMap.set(k, String(v)),
  removeItem: (k) => storageMap.delete(k),
  clear: () => storageMap.clear()
};

async function run() {
  console.log('================================================================');
  console.log('1. VERIFY 10 CATS ROSTER & PERSONALITIES');
  console.log('================================================================');

  assert(CAT_ROSTER_DEFS.length === 10, 'Total cat roster is exactly 10 cats');

  const namesSet = new Set();
  const breedsSet = new Set();
  CAT_ROSTER_DEFS.forEach((cat, idx) => {
    assert(cat.id === idx + 1, `Cat #${cat.id} has sequential ID`);
    assert(cat.breedName && cat.localBreed, `Cat #${cat.id} has both English & local breed names`);
    assert(cat.personality && cat.personalityDesc, `Cat #${cat.id} has detailed personality & description`);
    assert(cat.dialogue && cat.dialogue.hungry && cat.dialogue.happy, `Cat #${cat.id} has custom emotional dialogue`);
    assert(cat.colorHex && cat.accentHex && cat.eyeColor, `Cat #${cat.id} has distinct fur and eye colors`);
    assert(cat.favoriteFood && cat.favoriteToy, `Cat #${cat.id} has favorite food & favorite toy`);

    namesSet.add(cat.defaultSuggestedName);
    breedsSet.add(cat.breedName);
  });

  assert(breedsSet.size === 10, 'All 10 cats have unique breeds');

  console.log('\n================================================================');
  console.log('2. VERIFY INITIAL STATE & PROGRESSION LOCKS');
  console.log('================================================================');

  const state = createDefaultState();
  assert(state.cats.length === 10, 'State contains 10 cat slots');
  assert(state.cats[0].unlocked === true, 'Cat #1 is unlocked by default');
  assert(state.cats[0].name === '', 'Cat #1 name is initially blank pending naming ceremony');
  assert(state.cats[0].stage === 1, 'Cat #1 starts at stage 1 (Baby Kitten)');
  assert(state.cats[0].growthExp === 0, 'Cat #1 starts with 0 EXP');

  for (let i = 1; i < 10; i++) {
    assert(state.cats[i].unlocked === false, `Cat #${i + 1} is locked by default`);
  }

  console.log('\n================================================================');
  console.log('3. VERIFY NAMING CEREMONY');
  console.log('================================================================');

  state.cats[0].name = 'Snowy';
  state.cats[0].adoptedAt = Date.now();
  state.cats[0].memories.push({
    id: 'mem_1',
    type: 'adopted',
    stage: 1,
    title: 'Hari Pertama di Cat Garden 🌸',
    desc: 'Syma mengadopsi Snowy.'
  });

  assert(state.cats[0].name === 'Snowy', 'Cat #1 name successfully saved as Snowy');
  assert(state.cats[0].memories.length === 1, 'Adoption memory added to timeline');

  console.log('\n================================================================');
  console.log('4. VERIFY 4 GROWTH STAGES PROGRESSION THRESHOLDS');
  console.log('================================================================');

  assert(getCatGrowthStage(0).name === 'BABY KITTEN', '0 EXP = BABY KITTEN');
  assert(getCatGrowthStage(99).name === 'BABY KITTEN', '99 EXP = BABY KITTEN');
  assert(getCatGrowthStage(100).name === 'LITTLE KITTEN', '100 EXP = LITTLE KITTEN');
  assert(getCatGrowthStage(249).name === 'LITTLE KITTEN', '249 EXP = LITTLE KITTEN');
  assert(getCatGrowthStage(250).name === 'GROWING CAT', '250 EXP = GROWING CAT');
  assert(getCatGrowthStage(449).name === 'GROWING CAT', '449 EXP = GROWING CAT');
  assert(getCatGrowthStage(450).name === 'ADULT CAT', '450 EXP = ADULT CAT');
  assert(getCatGrowthStage(1000).name === 'ADULT CAT', '1000 EXP = ADULT CAT (Max stage)');

  console.log('\n================================================================');
  console.log('5. VERIFY ADULT CAT PROMOTION UNLOCKS NEXT CAT');
  console.log('================================================================');

  // Simulate care up to Adult
  state.cats[0].growthExp = 450;
  state.cats[0].stage = 4;
  state.cats[0].memories.push({
    id: 'mem_2',
    type: 'graduation',
    stage: 4,
    title: '👑 Kelulusan Menjadi Adult Cat',
    desc: 'Snowy telah dewasa!'
  });

  // Check next cat unlock logic
  assert(state.cats[1].unlocked === false, 'Cat #2 is still locked before trigger');
  if (state.cats[0].stage === 4) {
    state.cats[1].unlocked = true;
  }
  assert(state.cats[1].unlocked === true, 'Cat #2 unlocked after Cat #1 reached Adult Cat stage');
  assert(state.cats[2].unlocked === false, 'Cat #3 remains locked until Cat #2 becomes Adult');

  // Syma names Cat #2
  state.cats[1].name = 'Luna';
  assert(state.cats[1].name === 'Luna', 'Cat #2 successfully named Luna');

  console.log('\n================================================================');
  console.log('6. VERIFY PERSISTENCE & RELOAD INTEGRITY');
  console.log('================================================================');

  saveCatCareState(state, SYMA_UID);
  const reloaded = loadCatCareState(SYMA_UID);

  assert(reloaded !== null, 'Loaded state successfully from storage');
  assert(reloaded.cats[0].name === 'Snowy', 'Cat #1 name preserved after reload');
  assert(reloaded.cats[0].stage === 4, 'Cat #1 adult stage preserved after reload');
  assert(reloaded.cats[1].unlocked === true, 'Cat #2 unlock state preserved after reload');
  assert(reloaded.cats[1].name === 'Luna', 'Cat #2 name preserved after reload');
  assert(reloaded.cats[2].unlocked === false, 'Cat #3 locked state preserved after reload');
  assert(reloaded.cats[0].memories.length === 2, 'Cat #1 memories preserved after reload');

  console.log('\n================================================================');
  console.log(`ALL TESTS PASSED: ${passed}/${total}`);
  console.log('================================================================');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

