/**
 * =============================================================================
 * AUTOMATED TEST SUITE: THE WHISPERING POND FISHING SIMULATOR
 * SYMA'S UNIVERSE · PINWHEEL
 * =============================================================================
 */

import assert from 'node:assert';
import {
  FISH_SPECIES_DEFS,
  FISHING_RODS_DEFS,
  FISHING_BAITS_DEFS,
  FISHING_AREAS_DEFS,
  WEATHER_SYSTEM_DEFS,
  FISHING_LEVELS,
  calculateFishingLevel,
  createDefaultFishingState,
  loadFishingState,
  saveFishingState,
  updateUnlockedAssets,
  pickRandomFish,
  renderFishSvg,
  SYMA_CANONICAL_UID
} from './fishing_pond.js';

let passed = 0;
let failed = 0;

function it(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(err);
  }
}

console.log('=== TESTING THE WHISPERING POND FISHING SIMULATOR ===\n');

// 1. Fish Species Audit (10 species across 4 rarities)
console.log('1. Fish Species Definitions:');
it('should have exactly 10 unique fish species', () => {
  const keys = Object.keys(FISH_SPECIES_DEFS);
  assert.strictEqual(keys.length, 10, 'Must have 10 fish species');
});

it('should have 3 COMMON fish: Koi, Goldfish, Minnow', () => {
  assert.ok(FISH_SPECIES_DEFS.koi, 'Koi exists');
  assert.strictEqual(FISH_SPECIES_DEFS.koi.rarity, 'COMMON');
  assert.ok(FISH_SPECIES_DEFS.goldfish, 'Goldfish exists');
  assert.strictEqual(FISH_SPECIES_DEFS.goldfish.rarity, 'COMMON');
  assert.ok(FISH_SPECIES_DEFS.minnow, 'Minnow exists');
  assert.strictEqual(FISH_SPECIES_DEFS.minnow.rarity, 'COMMON');
});

it('should have 3 RARE fish: Moonfin, Silvertail, Bluebell Fish', () => {
  assert.ok(FISH_SPECIES_DEFS.moonfin, 'Moonfin exists');
  assert.strictEqual(FISH_SPECIES_DEFS.moonfin.rarity, 'RARE');
  assert.ok(FISH_SPECIES_DEFS.silvertail, 'Silvertail exists');
  assert.strictEqual(FISH_SPECIES_DEFS.silvertail.rarity, 'RARE');
  assert.ok(FISH_SPECIES_DEFS.bluebell_fish, 'Bluebell Fish exists');
  assert.strictEqual(FISH_SPECIES_DEFS.bluebell_fish.rarity, 'RARE');
});

it('should have 2 EPIC fish: Stardust Koi, Twilight Fish', () => {
  assert.ok(FISH_SPECIES_DEFS.stardust_koi, 'Stardust Koi exists');
  assert.strictEqual(FISH_SPECIES_DEFS.stardust_koi.rarity, 'EPIC');
  assert.ok(FISH_SPECIES_DEFS.twilight_fish, 'Twilight Fish exists');
  assert.strictEqual(FISH_SPECIES_DEFS.twilight_fish.rarity, 'EPIC');
});

it('should have 2 LEGENDARY fish: Celestial Fish, Aurora Koi', () => {
  assert.ok(FISH_SPECIES_DEFS.celestial_fish, 'Celestial Fish exists');
  assert.strictEqual(FISH_SPECIES_DEFS.celestial_fish.rarity, 'LEGENDARY');
  assert.ok(FISH_SPECIES_DEFS.aurora_koi, 'Aurora Koi exists');
  assert.strictEqual(FISH_SPECIES_DEFS.aurora_koi.rarity, 'LEGENDARY');
});

it('all species should have valid minLen, maxLen, description and baseExp', () => {
  Object.values(FISH_SPECIES_DEFS).forEach(f => {
    assert.ok(f.minLen > 0, `${f.name} minLen > 0`);
    assert.ok(f.maxLen > f.minLen, `${f.name} maxLen > minLen`);
    assert.ok(f.description && f.description.length > 10, `${f.name} has descriptive lore`);
    assert.ok(f.baseExp > 0, `${f.name} awards EXP`);
  });
});

// 2. Fishing Gear (4 Rods & 4 Baits)
console.log('\n2. Fishing Rods & Baits:');
it('should have 4 rods with level requirements', () => {
  const rods = Object.values(FISHING_RODS_DEFS);
  assert.strictEqual(rods.length, 4);
  assert.strictEqual(FISHING_RODS_DEFS.beginner_rod.levelReq, 1);
  assert.strictEqual(FISHING_RODS_DEFS.wooden_rod.levelReq, 3);
  assert.strictEqual(FISHING_RODS_DEFS.silver_rod.levelReq, 6);
  assert.strictEqual(FISHING_RODS_DEFS.celestial_rod.levelReq, 10);
});

it('should have 4 baits with level requirements', () => {
  const baits = Object.values(FISHING_BAITS_DEFS);
  assert.strictEqual(baits.length, 4);
  assert.strictEqual(FISHING_BAITS_DEFS.basic_bait.levelReq, 1);
  assert.strictEqual(FISHING_BAITS_DEFS.flower_bait.levelReq, 2);
  assert.strictEqual(FISHING_BAITS_DEFS.glow_bait.levelReq, 5);
  assert.strictEqual(FISHING_BAITS_DEFS.moonlight_bait.levelReq, 8);
});

// 3. Secret Fishing Areas
console.log('\n3. Secret Fishing Areas:');
it('should have 3 secret areas with unlock conditions', () => {
  assert.ok(FISHING_AREAS_DEFS.whispering_shore);
  assert.strictEqual(FISHING_AREAS_DEFS.whispering_shore.levelReq, 1);

  assert.ok(FISHING_AREAS_DEFS.moonlight_corner);
  assert.strictEqual(FISHING_AREAS_DEFS.moonlight_corner.levelReq, 4);
  assert.strictEqual(FISHING_AREAS_DEFS.moonlight_corner.minCatches, 8);

  assert.ok(FISHING_AREAS_DEFS.starlight_cove);
  assert.strictEqual(FISHING_AREAS_DEFS.starlight_cove.levelReq, 8);
  assert.strictEqual(FISHING_AREAS_DEFS.starlight_cove.minCatches, 20);
});

// 4. Weather & Time System
console.log('\n4. Weather & Time System:');
it('should have 4 distinct weather types with gradients', () => {
  const weathers = ['morning', 'afternoon', 'rainy', 'night'];
  weathers.forEach(w => {
    assert.ok(WEATHER_SYSTEM_DEFS[w], `Weather ${w} exists`);
    assert.ok(WEATHER_SYSTEM_DEFS[w].skyGradient, `${w} has sky gradient`);
    assert.ok(WEATHER_SYSTEM_DEFS[w].waterTint, `${w} has water tint`);
  });
});

// 5. Progression & Leveling Curve
console.log('\n5. Progression & Level Math:');
it('should calculate Level 1 at 0 EXP', () => {
  const res = calculateFishingLevel(0);
  assert.strictEqual(res.level, 1);
  assert.strictEqual(res.title, 'Pemula Kolam');
  assert.strictEqual(res.nextLevelReq, 50);
});

it('should calculate Level 4 at 250 EXP', () => {
  const res = calculateFishingLevel(250);
  assert.strictEqual(res.level, 4);
  assert.strictEqual(res.title, 'Penjaga Senja');
});

it('should reach max Level 10 at 1600+ EXP', () => {
  const res = calculateFishingLevel(1800);
  assert.strictEqual(res.level, 10);
  assert.strictEqual(res.title, 'Pemancing Surgawi');
  assert.strictEqual(res.progressPercent, 100);
});

// 6. State Persistence & Unlocks
console.log('\n6. State Persistence & Unlocks:');
it('new state starts with only Beginner Rod, Basic Bait, and Whispering Shore', () => {
  const state = createDefaultFishingState(SYMA_CANONICAL_UID);
  assert.deepStrictEqual(state.unlockedRods, ['beginner_rod']);
  assert.deepStrictEqual(state.unlockedBaits, ['basic_bait']);
  assert.deepStrictEqual(state.unlockedAreas, ['whispering_shore']);
});

it('unlocks wooden rod at level 3, and moonlight corner at level 4 with 8 catches', () => {
  const state = createDefaultFishingState(SYMA_CANONICAL_UID);
  state.level = 4;
  state.totalCatches = 10;
  updateUnlockedAssets(state);

  assert.ok(state.unlockedRods.includes('wooden_rod'), 'wooden rod unlocked');
  assert.ok(state.unlockedBaits.includes('flower_bait'), 'flower bait unlocked');
  assert.ok(state.unlockedAreas.includes('moonlight_corner'), 'moonlight corner unlocked');
});

// 7. Random Fish Generator
console.log('\n7. Random Fish Generator:');
it('picks valid fish from area pool', () => {
  const state = createDefaultFishingState(SYMA_CANONICAL_UID);
  state.activeArea = 'whispering_shore';
  const picked = pickRandomFish(state);
  assert.ok(picked && picked.id, 'Picked a valid fish');
  assert.ok(FISHING_AREAS_DEFS.whispering_shore.fishPool.includes(picked.id));
});

// 8. SVG Graphics
console.log('\n8. SVG Graphics Rendering:');
it('renders SVG markup for all 10 fish and silhouette mode', () => {
  Object.values(FISH_SPECIES_DEFS).forEach(f => {
    const liveSvg = renderFishSvg(f, 100, false);
    assert.ok(liveSvg.includes('<svg'), `${f.name} renders live svg`);
    assert.ok(liveSvg.includes('</svg>'));

    const silSvg = renderFishSvg(f, 100, true);
    assert.ok(silSvg.includes('fish-silhouette-svg'), `${f.name} renders silhouette`);
    assert.ok(silSvg.includes('?'));
  });
});

console.log(`\n========================================`);
console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
}

