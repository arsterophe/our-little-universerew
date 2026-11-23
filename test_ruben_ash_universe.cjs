/**
 * test_ruben_ash_universe.cjs
 * Comprehensive test suite for Ruben's Universe — The Dragon's Den (ASH ❄️)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('RUBEN\'S UNIVERSE (ASH — THE DRAGON\'S DEN) VERIFICATION SUITE');
console.log('================================================================');

let passed = 0;
let total = 0;

function check(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    ${err.message}`);
  }
}

// 1. ASSET INSPECTION
console.log('\n1. ASSET VERIFICATION');
check('ash_world_bg.jpg exists and is > 200KB', () => {
  const filePath = path.resolve(__dirname, 'public/assets/ash_world_bg.jpg');
  assert(fs.existsSync(filePath), 'ash_world_bg.jpg must exist in public/assets/');
  const stats = fs.statSync(filePath);
  assert(stats.size > 200000, `File size ${stats.size} is too small`);
});

check('avatar_ruben_hd.jpg exists', () => {
  const filePath = path.resolve(__dirname, 'public/assets/avatar_ruben_hd.jpg');
  assert(fs.existsSync(filePath), 'avatar_ruben_hd.jpg must exist in public/assets/');
});

// 2. DOM STRUCTURE IN INDEX.HTML
console.log('\n2. DOM STRUCTURE IN INDEX.HTML');
const indexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

check('index.html includes ash.css link tag', () => {
  assert(indexHtml.includes('<link rel="stylesheet" href="/ash.css">'), 'Missing ash.css link in index.html');
});

check('index.html contains #view-ash-world section', () => {
  assert(indexHtml.includes('id="view-ash-world"'), 'Missing view-ash-world section');
});

check('Header contains Ruben\'s profile avatar, title, and subtitle', () => {
  assert(indexHtml.includes('RUBEN\'S UNIVERSE'), 'Missing RUBEN\'S UNIVERSE title in header');
  assert(indexHtml.includes('The Dragon\'s Den'), 'Missing The Dragon\'s Den subtitle');
  assert(indexHtml.includes('src="/assets/avatar_ruben_hd.jpg"'), 'Missing Ruben\'s avatar');
});

const requiredHotspots = [
  { id: 'btn-loc-ash-castle', name: "Ruben's Castle" },
  { id: 'btn-loc-ash-engineering', name: "Civil Engineering Lab" },
  { id: 'btn-loc-ash-observatory', name: "Dragon Observatory" },
  { id: 'btn-loc-ash-gazebo', name: "Moon Gazebo" },
  { id: 'btn-loc-ash-garden', name: "Zen Garden" },
  { id: 'btn-loc-ash-mailbox', name: "Dragon Mailbox" },
  { id: 'btn-loc-ash-gaming', name: "Gaming Zone" },
  { id: 'btn-loc-ash-music', name: "Anime & Music Room" }
];

requiredHotspots.forEach(loc => {
  check(`Hotspot button exists for ${loc.name} (#${loc.id})`, () => {
    assert(indexHtml.includes(loc.id), `Missing hotspot ${loc.id}`);
    assert(indexHtml.includes(loc.name), `Missing name ${loc.name}`);
  });
});

check('Bottom music player, tagline, and bottom action buttons present', () => {
  assert(indexHtml.includes('ash-music-player'), 'Missing music player widget');
  assert(indexHtml.includes('ash-tagline'), 'Missing tagline widget');
  assert(indexHtml.includes('btn-ash-gallery'), 'Missing gallery button');
  assert(indexHtml.includes('btn-ash-collection'), 'Missing collection button');
});

const requiredModals = [
  'ash-castle-modal',
  'ash-engineering-modal',
  'ash-observatory-modal',
  'ash-gazebo-modal',
  'ash-garden-modal',
  'ash-mailbox-modal',
  'ash-gaming-modal',
  'ash-music-modal',
  'ash-gallery-modal',
  'ash-collection-modal',
  'ash-settings-modal'
];

requiredModals.forEach(m => {
  check(`Modal exists: #${m}`, () => {
    assert(indexHtml.includes(`id="${m}"`), `Missing modal #${m}`);
  });
});

// 3. CODE INTEGRATION IN CONTROLLERS
console.log('\n3. CONTROLLER & CODE INTEGRATION');
const universesView = fs.readFileSync(path.resolve(__dirname, 'universes_view.js'), 'utf-8');
const mainJs = fs.readFileSync(path.resolve(__dirname, 'main.js'), 'utf-8');
const ashView = fs.readFileSync(path.resolve(__dirname, 'ash_view.js'), 'utf-8');

check('ash_view.js exports initAshWorld', () => {
  assert(ashView.includes('export function initAshWorld'), 'ash_view.js must export initAshWorld');
});

check('ash_view.js implements Web Audio API synthesizer for BGM', () => {
  assert(ashView.includes('AudioContext') || ashView.includes('webkitAudioContext'), 'Must support Web Audio API');
  assert(ashView.includes('Song of the Dragon King'), 'Must include track 1');
});

check('ash_view.js scopes personal data to Ruben\'s UID 9PMychPZ4rZ4PBCtZB9GiASttc52', () => {
  assert(ashView.includes('9PMychPZ4rZ4PBCtZB9GiASttc52'), 'Must scope Ruben UID');
});

check('universes_view.js imports and initializes ash_view', () => {
  assert(universesView.includes('import { initAshWorld } from \'./ash_view.js\''), 'Missing import initAshWorld');
  assert(universesView.includes('const ashCtrl = typeof initAshWorld === \'function\''), 'Missing ashCtrl initialization');
});

check('universes_view.js handles univKey === \'ash\' and exports openAshWorld', () => {
  assert(universesView.includes('ashCtrl?.openAshWorld'), 'Missing card click or enter handler for ash');
  assert(universesView.includes('openAshWorld: (user = activeAuthUser) => ashCtrl?.openAshWorld(user)'), 'Missing openAshWorld export');
});

check('main.js routes Ruben to openAshWorld upon login / universe entry', () => {
  assert(mainJs.includes('charId === \'ruben\' && typeof univCtrl.openAshWorld === \'function\''), 'Missing ruben routing to openAshWorld');
  assert(mainJs.includes('view-ash-world'), 'view-ash-world must be registered in protected views');
});

console.log('\n================================================================');
console.log(`TOTAL: ${passed}/${total} TESTS PASSED (${Math.round(passed/total * 100)}%)`);
console.log('================================================================');

if (passed !== total) {
  process.exit(1);
}
