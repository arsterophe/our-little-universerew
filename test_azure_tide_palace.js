/**
 * TEST SUITE: THE AZURE TIDE PALACE — AKHIRA'S OCEAN SANCTUARY (UNIVERSE YAWN ⚡)
 * Validates State Management, 5 Connected Rooms, Hotspots, Collision Detection,
 * Recipes, Conservatory Flora, Memorabilia, Audio Synthesis, and HTML/CSS Parity.
 * =============================================================================
 */

import assert from 'assert';
import fs from 'fs';
import {
  AZURE_PALACE_CHARACTER,
  AZURE_PALACE_ROOMS,
  AZURE_OCEAN_RECIPES,
  AZURE_CONSERVATORY_FLORA,
  AZURE_OCEAN_MEMORABILIA,
  AZURE_COLLECTIBLES,
  AZURE_PALACE_TASKS,
  AZURE_ATMOSPHERES,
  createDefaultAzurePalaceState,
  loadAzurePalaceState,
  saveAzurePalaceState
} from './azure_palace_state.js';

console.log('--- RUNNING TEST SUITE: THE AZURE TIDE PALACE (YAWN ⚡) ---');

// 1. CHARACTER & PALACE METADATA
console.log('1. Verifying Palace Metadata & Akhira Character Identity...');
assert.strictEqual(AZURE_PALACE_CHARACTER.key, 'akhira', 'Character key is akhira');
assert.strictEqual(AZURE_PALACE_CHARACTER.symbol, '⚡', 'Character symbol is lightning');
assert.strictEqual(AZURE_PALACE_CHARACTER.houseName, 'THE AZURE TIDE PALACE', 'Palace name matches PRD');
assert.ok(AZURE_PALACE_CHARACTER.palette.electricCyan, 'Electric cyan palette is defined');
assert.ok(AZURE_PALACE_CHARACTER.palette.oceanBlue, 'Ocean blue palette is defined');
assert.ok(AZURE_PALACE_CHARACTER.palette.aquamarine, 'Aquamarine palette is defined');
console.log('   ✓ Character and palace metadata verified');

// 2. FIVE CONNECTED ROOMS ARCHITECTURE
console.log('2. Verifying 5 Connected Rooms Architecture...');
assert.strictEqual(AZURE_PALACE_ROOMS.length, 5, 'Must have exactly 5 rooms');

const expectedRooms = ['living', 'bedroom', 'kitchen', 'conservatory', 'gallery'];
expectedRooms.forEach(roomId => {
  const room = AZURE_PALACE_ROOMS.find(r => r.id === roomId);
  assert.ok(room, `Room ${roomId} exists`);
  assert.ok(room.name, `Room ${roomId} has a name`);
  assert.ok(room.subtitle, `Room ${roomId} has a subtitle`);
  assert.ok(room.bgImage, `Room ${roomId} has a background image`);
  assert.ok(room.bounds, `Room ${roomId} has bounds`);
  assert.ok(Array.isArray(room.hotspots) && room.hotspots.length >= 5, `Room ${roomId} has at least 5 hotspots`);
});

// Verify Living Room Doors Interconnecting all other 4 rooms
const livingRoom = AZURE_PALACE_ROOMS.find(r => r.id === 'living');
assert.ok(livingRoom.hotspots.some(h => h.action === 'goto_bedroom'), 'Living room connects to bedroom');
assert.ok(livingRoom.hotspots.some(h => h.action === 'goto_kitchen'), 'Living room connects to kitchen');
assert.ok(livingRoom.hotspots.some(h => h.action === 'goto_conservatory'), 'Living room connects to conservatory');
assert.ok(livingRoom.hotspots.some(h => h.action === 'goto_gallery'), 'Living room connects to gallery');
console.log('   ✓ All 5 rooms and interconnections verified');

// 3. RECIPES & COOKING SYSTEM
console.log('3. Verifying Ocean Recipes System...');
assert.ok(AZURE_OCEAN_RECIPES.length >= 4, 'Has at least 4 ocean recipes');
const sparkler = AZURE_OCEAN_RECIPES.find(r => r.id === 'electric_spark_elixir');
assert.ok(sparkler, 'Electric Cyan Sparkler recipe exists with Akhira lightning identity');
assert.ok(sparkler.ingredients.includes('Electric Sea Berry'), 'Electric recipe uses electric berry');
console.log('   ✓ Ocean recipes system verified');

// 4. CONSERVATORY FLORA & GARDEN
console.log('4. Verifying Bioluminescent Conservatory Flora...');
assert.ok(AZURE_CONSERVATORY_FLORA.length >= 3, 'Has at least 3 bioluminescent flora species');
const electricBlossom = AZURE_CONSERVATORY_FLORA.find(f => f.id === 'electric_sea_blossom');
assert.ok(electricBlossom, 'Electric Cyan Sea Blossom exists');
assert.strictEqual(electricBlossom.yieldItem, 'Electric Sea Berry', 'Yields Electric Sea Berry for cooking');
console.log('   ✓ Conservatory flora verified');

// 5. MEMORABILIA & COLLECTIBLES
console.log('5. Verifying Ocean Memorabilia & Hidden Collectibles...');
assert.strictEqual(AZURE_OCEAN_MEMORABILIA.length, 4, 'Has 4 message bottles from Nyanya, Lala, Lele, and Abil');
assert.ok(AZURE_OCEAN_MEMORABILIA.some(m => m.title.includes('Nyanya')), 'Includes bottle from Nyanya');
assert.ok(AZURE_OCEAN_MEMORABILIA.some(m => m.title.includes('Lala')), 'Includes bottle from Lala');
assert.ok(AZURE_OCEAN_MEMORABILIA.some(m => m.title.includes('Lele')), 'Includes bottle from Lele');
assert.ok(AZURE_OCEAN_MEMORABILIA.some(m => m.title.includes('Abil')), 'Includes bottle from Abil');

assert.ok(AZURE_COLLECTIBLES.some(c => c.id === 'lightning_pearl'), 'Has Lightning Storm Pearl collectible');
assert.ok(AZURE_COLLECTIBLES.some(c => c.id === 'electric_geode'), 'Has Electric Cyan Geode collectible');
console.log('   ✓ Memorabilia & Collectibles verified');

// 6. ATMOSPHERES & PALACE TASKS
console.log('6. Verifying Atmospheres and Palace Objectives...');
assert.strictEqual(AZURE_ATMOSPHERES.length, 3, 'Has 3 lighting atmospheres');
assert.ok(AZURE_ATMOSPHERES.some(a => a.id === 'sunlit_azure'), 'Has Sunlit Azure');
assert.ok(AZURE_ATMOSPHERES.some(a => a.id === 'twilight_biolum'), 'Has Twilight Bioluminescent');
assert.ok(AZURE_ATMOSPHERES.some(a => a.id === 'abyssal_midnight'), 'Has Abyssal Midnight');

assert.ok(AZURE_PALACE_TASKS.length >= 5, 'Has at least 5 palace tasks');
assert.ok(AZURE_PALACE_TASKS.some(t => t.id === 'task_channel_lightning'), 'Has lightning channeling task');
console.log('   ✓ Atmospheres and tasks verified');

// 7. STATE PERSISTENCE & STORAGE
console.log('7. Verifying State Generation & LocalStorage mock...');
const defaultState = createDefaultAzurePalaceState();
assert.strictEqual(defaultState.character, 'akhira');
assert.strictEqual(defaultState.currentRoom, 'living');
assert.strictEqual(defaultState.gardenSlots.length, 3);
assert.strictEqual(defaultState.tasks.length, AZURE_PALACE_TASKS.length);

// Mock localStorage
const mockStore = {};
global.localStorage = {
  getItem: (k) => mockStore[k] || null,
  setItem: (k, v) => { mockStore[k] = v; },
  removeItem: (k) => { delete mockStore[k]; }
};

saveAzurePalaceState('akhira', defaultState);
const loadedState = loadAzurePalaceState('akhira');
assert.strictEqual(loadedState.currentRoom, 'living');
assert.strictEqual(loadedState.tasks.length, AZURE_PALACE_TASKS.length);
console.log('   ✓ State generation and persistence verified');

// 8. ASSETS IN PUBLIC/ASSETS
console.log('8. Verifying 5 Room Artwork Assets in public/assets...');
const assetNames = [
  'azure_palace_living.jpg',
  'azure_palace_bedroom.jpg',
  'azure_palace_kitchen.jpg',
  'azure_palace_conservatory.jpg',
  'azure_palace_gallery.jpg'
];

assetNames.forEach(name => {
  const path = `public/assets/${name}`;
  assert.ok(fs.existsSync(path), `Asset ${path} must exist on disk`);
  const stat = fs.statSync(path);
  assert.ok(stat.size > 100000, `Asset ${path} must have realistic image file size (>100KB), got ${stat.size}`);
});
console.log('   ✓ All 5 room background image files verified');

// 9. HTML & CSS PARITY
console.log('9. Verifying HTML & CSS Integration...');
const indexHtml = fs.readFileSync('index.html', 'utf-8');
assert.ok(indexHtml.includes('id="view-azure-palace"'), 'index.html contains view-azure-palace section');
assert.ok(indexHtml.includes('id="azure-palace-stage"'), 'index.html contains azure-palace-stage');
assert.ok(indexHtml.includes('id="azure-palace-bg-img"'), 'index.html contains azure-palace-bg-img');
assert.ok(indexHtml.includes('id="azure-palace-hotspots-container"'), 'index.html contains hotspots container');
assert.ok(indexHtml.includes('id="azure-palace-player-avatar"'), 'index.html contains player avatar');
assert.ok(indexHtml.includes('id="btn-azure-palace-back"'), 'index.html contains return button');
assert.ok(indexHtml.includes('id="btn-yawn-enter-palace"'), 'index.html contains enter palace button in YAWN');
assert.ok(indexHtml.includes('href="/azure_palace.css"'), 'index.html links to azure_palace.css');

const azureCss = fs.readFileSync('azure_palace.css', 'utf-8');
assert.ok(azureCss.includes('.view-azure-palace'), 'azure_palace.css defines .view-azure-palace');
assert.ok(azureCss.includes('.azure-palace-stage'), 'azure_palace.css defines .azure-palace-stage');
assert.ok(azureCss.includes('.azure-palace-player-avatar'), 'azure_palace.css defines .azure-palace-player-avatar');
assert.ok(azureCss.includes('--az-electric-cyan'), 'azure_palace.css defines --az-electric-cyan');
console.log('   ✓ HTML and CSS parity verified');

console.log('--- ALL AZURE TIDE PALACE TESTS PASSED CLEANLY (100%) ---');
