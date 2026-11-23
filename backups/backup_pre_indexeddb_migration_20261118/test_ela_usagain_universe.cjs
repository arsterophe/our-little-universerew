/**
 * test_ela_usagain_universe.cjs
 * Comprehensive test suite for Ela's Universe — THE SILENT LOTUS (US AGAIN 🌸)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('ELA\'S UNIVERSE (THE SILENT LOTUS — US AGAIN 🌸) VERIFICATION');
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

// 1. ASSET VERIFICATION
console.log('\n1. ASSET VERIFICATION');
check('usagain_world_bg.jpg exists and is > 200KB', () => {
  const filePath = path.resolve(__dirname, 'public/assets/usagain_world_bg.jpg');
  assert(fs.existsSync(filePath), 'usagain_world_bg.jpg must exist in public/assets/');
  const stats = fs.statSync(filePath);
  assert(stats.size > 200000, `File size ${stats.size} is too small`);
});

check('avatar_ela_hd.jpg exists', () => {
  const filePath = path.resolve(__dirname, 'public/assets/avatar_ela_hd.jpg');
  assert(fs.existsSync(filePath), 'avatar_ela_hd.jpg must exist in public/assets/');
});

// 2. DOM STRUCTURE IN INDEX.HTML
console.log('\n2. DOM STRUCTURE IN INDEX.HTML');
const indexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

check('index.html includes usagain.css link tag', () => {
  assert(indexHtml.includes('<link rel="stylesheet" href="/usagain.css">'), 'Missing usagain.css link in index.html');
});

check('index.html contains #view-usagain-world section', () => {
  assert(indexHtml.includes('id="view-usagain-world"'), 'Missing view-usagain-world section');
});

check('Header contains Ela\'s profile avatar, title, and subtitle', () => {
  assert(indexHtml.includes('THE SILENT LOTUS'), 'Missing THE SILENT LOTUS title in header');
  assert(indexHtml.includes('A Sanctuary of Stillness'), 'Missing A Sanctuary of Stillness subtitle');
  assert(indexHtml.includes('src="/assets/avatar_ela_hd.jpg"'), 'Missing Ela\'s avatar');
});

const requiredHotspots = [
  { id: 'btn-loc-usagain-observatory', name: "Star Observatory" },
  { id: 'btn-loc-usagain-residence', name: "My Residence" },
  { id: 'btn-loc-usagain-cinema', name: "Private Cinema" },
  { id: 'btn-loc-usagain-library', name: "Lotus Library" },
  { id: 'btn-loc-usagain-gazebo', name: "Meditation Gazebo" },
  { id: 'btn-loc-usagain-mailbox', name: "Private Mailbox" },
  { id: 'btn-loc-usagain-garden', name: "Rose Garden" },
  { id: 'btn-loc-usagain-pond', name: "Lotus Pond" }
];

requiredHotspots.forEach(loc => {
  check(`Hotspot button exists for ${loc.name} (#${loc.id})`, () => {
    assert(indexHtml.includes(loc.id), `Missing hotspot ${loc.id}`);
  });
});

check('Bottom music player, tagline, and bottom action buttons present', () => {
  assert(indexHtml.includes('usagain-music-player'), 'Missing music player widget');
  assert(indexHtml.includes('In the silence, the soul blooms.'), 'Missing tagline widget');
  assert(indexHtml.includes('btn-usagain-gallery'), 'Missing gallery button');
  assert(indexHtml.includes('btn-usagain-collection'), 'Missing collection button');
});

const requiredModals = [
  'usagain-residence-modal',
  'usagain-observatory-modal',
  'usagain-cinema-modal',
  'usagain-library-modal',
  'usagain-gazebo-modal',
  'usagain-mailbox-modal',
  'usagain-garden-modal',
  'usagain-pond-modal',
  'usagain-gallery-modal',
  'usagain-collection-modal',
  'usagain-settings-modal'
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
const usagainView = fs.readFileSync(path.resolve(__dirname, 'usagain_view.js'), 'utf-8');

check('usagain_view.js exports initUsAgainWorld', () => {
  assert(usagainView.includes('export function initUsAgainWorld'), 'usagain_view.js must export initUsAgainWorld');
});

check('usagain_view.js implements Web Audio API synthesizer for BGM', () => {
  assert(usagainView.includes('AudioContext') || usagainView.includes('webkitAudioContext'), 'Must support Web Audio API');
  assert(usagainView.includes('Lotus in the Moonlight'), 'Must include track 1');
});

check('usagain_view.js scopes personal data to Ela\'s UID plxSNowjCkOMfUQMAwnZzQPR9Xr1', () => {
  assert(usagainView.includes('plxSNowjCkOMfUQMAwnZzQPR9Xr1'), 'Must scope Ela UID');
});

check('universes_view.js imports and initializes usagain_view', () => {
  assert(universesView.includes('import { initUsAgainWorld } from \'./usagain_view.js\''), 'Missing import initUsAgainWorld');
  assert(universesView.includes('const usagainCtrl = typeof initUsAgainWorld === \'function\''), 'Missing usagainCtrl initialization');
});

check('universes_view.js handles univKey === \'us_again\' and exports openUsAgainWorld', () => {
  assert(universesView.includes('usagainCtrl?.openUsAgainWorld'), 'Missing card click or enter handler for us_again');
  assert(universesView.includes('openUsAgainWorld: (user = activeAuthUser) => usagainCtrl?.openUsAgainWorld(user)'), 'Missing openUsAgainWorld export');
});

check('main.js routes Ela to openUsAgainWorld upon login / universe entry', () => {
  assert(mainJs.includes('charId === \'ela\' && typeof univCtrl.openUsAgainWorld === \'function\''), 'Missing ela routing to openUsAgainWorld');
  assert(mainJs.includes('view-usagain-world'), 'view-usagain-world must be registered in protected views');
});

console.log('\n================================================================');
console.log(`TOTAL: ${passed}/${total} TESTS PASSED (${Math.round(passed/total * 100)}%)`);
console.log('================================================================');

if (passed !== total) {
  process.exit(1);
}

