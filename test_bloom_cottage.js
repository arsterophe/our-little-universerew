/**
 * Comprehensive Test Suite for Bella's Enchanted Bloom Cottage
 * Universe: TO YOU — Lala ☀️
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import {
  BLOOM_ROOMS,
  BLOOM_RECIPES,
  BLOOM_PLANTS,
  BLOOM_BUTTERFLIES,
  BLOOM_MEMORIES,
  BLOOM_SECRETS,
  loadBloomCottageState,
  saveBloomCottageState,
  getDefaultBloomCottageState
} from './bloom_cottage_state.js';
import { TOYOU_LOCATIONS } from './universes_view.js';

console.log('🌸 STARTING ENCHANTED BLOOM COTTAGE TEST SUITE...\n');

// 1. Verify 5 Rooms Structure & Data Integrity
console.log('Test 1: Room definitions & coordinates');
const requiredRooms = ['living', 'bedroom', 'kitchen', 'conservatory', 'attic'];
assert.strictEqual(BLOOM_ROOMS.length, 5, 'Must have exactly 5 rooms defined');

requiredRooms.forEach(roomId => {
  const room = BLOOM_ROOMS.find(r => r.id === roomId);
  assert(room, `Room ${roomId} must exist in BLOOM_ROOMS`);
  assert(room.title, `Room ${roomId} must have title`);
  assert(room.bounds, `Room ${roomId} must have bounds`);
  assert(Array.isArray(room.obstacles), `Room ${roomId} must have obstacles array`);
  assert(Array.isArray(room.hotspots), `Room ${roomId} must have hotspots array`);
  assert(room.hotspots.length >= 3, `Room ${roomId} must have at least 3 interactive hotspots`);
  console.log(`  ✓ Room '${roomId}': "${room.title}" (${room.hotspots.length} hotspots, ${room.obstacles.length} obstacles)`);
});

// 2. Verify Simulation Content Catalogs
console.log('\nTest 2: Catalogs (Recipes, Plants, Butterflies, Memories, Easter Eggs)');
assert(BLOOM_RECIPES.length >= 5, 'Must have at least 5 recipes');
BLOOM_RECIPES.forEach(r => {
  assert(r.id && r.name && r.prepTime && Array.isArray(r.ingredients), `Recipe ${r.name} valid`);
});
console.log(`  ✓ Sweetheart Kitchen: ${BLOOM_RECIPES.length} recipes defined (${BLOOM_RECIPES.map(r => r.name).join(', ')})`);

assert(BLOOM_PLANTS.length >= 4, 'Must have at least 4 plant varieties');
console.log(`  ✓ Conservatory: ${BLOOM_PLANTS.length} flower varieties defined (${BLOOM_PLANTS.map(p => p.name).join(', ')})`);

assert(BLOOM_BUTTERFLIES.length >= 4, 'Must have at least 4 butterfly species');
console.log(`  ✓ Conservatory: ${BLOOM_BUTTERFLIES.length} butterfly species defined (${BLOOM_BUTTERFLIES.map(b => b.name).join(', ')})`);

const characters = ['lala', 'nyanya', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
characters.forEach(charKey => {
  const mem = BLOOM_MEMORIES.find(m => m.charId === charKey);
  assert(mem, `Sacred memories must include ${charKey}`);
  assert(mem.title && mem.note, `Memory for ${charKey} must have title and note`);
});
console.log(`  ✓ Memory Attic: Sacred friendship memories defined for all ${characters.length} characters`);

assert(BLOOM_SECRETS.length >= 5, 'Must have at least 5 hidden secrets/easter eggs');
requiredRooms.forEach(roomId => {
  assert(BLOOM_SECRETS.some(s => s.room === roomId), `Easter egg secret must exist for room ${roomId}`);
});
console.log(`  ✓ Easter Eggs: Hidden secrets defined across all 5 rooms (${BLOOM_SECRETS.length} total)`);

// 3. Verify Collision and Movement Logic
console.log('\nTest 3: Collision boundaries and obstacle simulation');
function testCheckCollision(targetX, targetY, room) {
  if (
    targetX < room.bounds.minX ||
    targetX > room.bounds.maxX ||
    targetY < room.bounds.minY ||
    targetY > room.bounds.maxY
  ) {
    return true;
  }
  for (const obs of room.obstacles) {
    if (
      targetX >= obs.minX &&
      targetX <= obs.maxX &&
      targetY >= obs.minY &&
      targetY <= obs.maxY
    ) {
      return true;
    }
  }
  return false;
}

const living = BLOOM_ROOMS.find(r => r.id === 'living');
// Center of room walkable
assert.strictEqual(testCheckCollision(48, 75, living), false, 'Center of living room should be walkable');
// Outside bounds blocked
assert.strictEqual(testCheckCollision(5, 75, living), true, 'X < minX should collide');
assert.strictEqual(testCheckCollision(95, 75, living), true, 'X > maxX should collide');
assert.strictEqual(testCheckCollision(48, 10, living), true, 'Y < minY should collide');
assert.strictEqual(testCheckCollision(48, 95, living), true, 'Y > maxY should collide');

// Inside fireplace blocked
const fp = living.obstacles.find(o => o.id === 'fireplace');
assert(fp, 'Fireplace obstacle must exist');
const fpMidX = (fp.minX + fp.maxX) / 2;
const fpMidY = (fp.minY + fp.maxY) / 2;
assert.strictEqual(testCheckCollision(fpMidX, fpMidY, living), true, 'Center of fireplace must collide');
console.log('  ✓ 2D Collision box and obstacle boundaries verified');

// 4. Verify Per-Character State Isolation
console.log('\nTest 4: State persistence and isolation');
const storageMock = {};
global.localStorage = {
  getItem: (key) => storageMock[key] || null,
  setItem: (key, val) => { storageMock[key] = String(val); },
  removeItem: (key) => { delete storageMock[key]; }
};

const lalaState = loadBloomCottageState('lala');
lalaState.inventory.cookedFoods.push('strawberry_cupcake_deluxe');
lalaState.gardenPlots[0].plantId = 'crystal_star_lily';
saveBloomCottageState('lala', lalaState);

const nyanyaState = loadBloomCottageState('nyanya');
assert.strictEqual(nyanyaState.inventory.cookedFoods.includes('strawberry_cupcake_deluxe'), false, 'Nyanya state must be isolated from Lala');
assert.strictEqual(nyanyaState.gardenPlots[0].plantId, 'sun_blossom', 'Nyanya garden must be fresh default');

const reloadedLala = loadBloomCottageState('lala');
assert(reloadedLala.inventory.cookedFoods.includes('strawberry_cupcake_deluxe'), 'Lala state must persist properly');
console.log('  ✓ Multi-character state isolation confirmed (Lala vs Nyanya)');

// 5. Verify index.html Integration
console.log('\nTest 5: index.html markup and assets');
const indexHtml = fs.readFileSync('index.html', 'utf8');

assert(indexHtml.includes('bloom_cottage.css'), 'index.html must link bloom_cottage.css');
assert(indexHtml.includes('id="view-bloom-cottage"'), 'index.html must contain #view-bloom-cottage section');

const requiredElementIds = [
  'view-bloom-cottage',
  'bloom-cottage-stage',
  'bloom-room-bg-layer',
  'bloom-room-bg-img',
  'bloom-atmo-overlay',
  'bloom-hotspots-container',
  'bloom-player-avatar',
  'bloom-interaction-prompt',
  'bloom-prompt-text',
  'btn-bcottage-back',
  'bloom-room-title',
  'bloom-room-subtitle',
  'bloom-nav-pills',
  'btn-bcottage-atmo',
  'btn-bcottage-tasks',
  'btn-bcottage-bag',
  'bloom-touch-controls',
  'bloom-dpad-up',
  'bloom-dpad-down',
  'bloom-dpad-left',
  'bloom-dpad-right',
  'bloom-touch-action',
  'bloom-modal-backdrop',
  'bloom-modal-title',
  'bloom-modal-body',
  'btn-bloom-modal-close',
  'bloom-sleep-overlay'
];

requiredElementIds.forEach(id => {
  assert(indexHtml.includes(`id="${id}"`), `index.html must have element #${id}`);
});
console.log(`  ✓ All ${requiredElementIds.length} required DOM elements verified in index.html`);

// 6. Verify TO YOU Hotspot & Location routing
console.log('\nTest 6: universes_view.js integration');
assert(TOYOU_LOCATIONS.rumah, 'TOYOU_LOCATIONS must have rumah');
assert.strictEqual(TOYOU_LOCATIONS.rumah.actionType, 'bloom_cottage', 'rumah actionType must be bloom_cottage');
assert(TOYOU_LOCATIONS.rumah.actionLabel.includes('Bloom Cottage'), 'actionLabel must mention Bloom Cottage');

const universesViewCode = fs.readFileSync('universes_view.js', 'utf8');
assert(universesViewCode.includes('initBloomCottageView'), 'universes_view.js must import initBloomCottageView');
assert(universesViewCode.includes('bloomCottageCtrl.openBloomCottage'), 'universes_view.js must call openBloomCottage');
assert(universesViewCode.includes('openBloomCottage:'), 'universes_view.js must export openBloomCottage');
console.log('  ✓ universes_view.js hotspot, quick menu, and navigation properly wired');

// 7. Verify main.js View Protection
console.log('\nTest 7: main.js protected views');
const mainJs = fs.readFileSync('main.js', 'utf8');
const occurrences = (mainJs.match(/'view-bloom-cottage'/g) || []).length;
assert(occurrences >= 4, `view-bloom-cottage must be present in all 4 main.js protected views arrays (found ${occurrences})`);
console.log(`  ✓ main.js protects 'view-bloom-cottage' in ${occurrences} view switch locations`);

// 8. Verify Assets for All 5 Rooms
console.log('\nTest 8: Assets existence for all 5 rooms');
const requiredArtworks = [
  'bloom_cottage_living.jpg',
  'bloom_cottage_bedroom.jpg',
  'bloom_cottage_kitchen.jpg',
  'bloom_cottage_conservatory.jpg',
  'bloom_cottage_attic.jpg'
];
requiredArtworks.forEach(art => {
  const filePath = path.join('public/assets', art);
  assert(fs.existsSync(filePath), `Artwork ${art} must exist in public/assets/`);
  const size = fs.statSync(filePath).size;
  assert(size > 500000, `Artwork ${art} must be high resolution (>500KB, got ${size} bytes)`);
  console.log(`  ✓ ${art} (${size} bytes)`);
});
assert(fs.existsSync('public/assets/chibi_lala_avatar.png'), 'Chibi Lala avatar sprite must exist in public/assets/');
console.log('  ✓ All 5 room storybook environment backgrounds & avatar verified');

console.log('\n🌟 ALL ENCHANTED BLOOM COTTAGE TESTS PASSED SUCCESSFULLY! 🌸✨\n');
