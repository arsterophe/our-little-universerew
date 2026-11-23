/**
 * Verification test suite for Royan's Universe (HOT 🎆)
 * The Enchanted Elven Sanctuary
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('--- 🧪 STARTING ROYAN (HOT 🎆) UNIVERSE VERIFICATION ---');

// 1. Verify Assets
const bgPath = path.resolve('public/assets/hot_world_bg.jpg');
assert(fs.existsSync(bgPath), 'hot_world_bg.jpg must exist in public/assets/');
const bgStats = fs.statSync(bgPath);
assert(bgStats.size > 200000, `hot_world_bg.jpg size should be substantial (>200KB), got ${bgStats.size} bytes`);
console.log('✅ Background artwork verified:', bgStats.size, 'bytes');

const spherePath = path.resolve('public/assets/planet_hot_sphere.jpg');
assert(fs.existsSync(spherePath), 'planet_hot_sphere.jpg must exist');
console.log('✅ Planet HOT sphere asset verified');

const avatarPath = path.resolve('public/assets/avatar_royan_hd.jpg');
const portraitPath = path.resolve('public/assets/portrait_royan_hd.jpg');
const cardPath = path.resolve('public/assets/card_royan_hd.jpg');
assert(fs.existsSync(avatarPath), 'avatar_royan_hd.jpg must exist');
assert(fs.existsSync(portraitPath), 'portrait_royan_hd.jpg must exist');
assert(fs.existsSync(cardPath), 'card_royan_hd.jpg must exist');
console.log('✅ Royan HD character image assets verified');

// 2. Verify Stylesheet Link in index.html
const indexHtml = fs.readFileSync('index.html', 'utf8');
assert(indexHtml.includes('<link rel="stylesheet" href="/hot.css">'), 'hot.css stylesheet link missing in index.html');
console.log('✅ hot.css link verified in index.html');

// 3. Verify Universe Section in index.html
assert(indexHtml.includes('id="view-hot-world"'), 'view-hot-world section missing in index.html');
assert(indexHtml.includes('hot-fx-canvas'), 'hot-fx-canvas missing in index.html');
console.log('✅ view-hot-world section verified');

// 4. Verify 8 Interactive Hotspots
const expectedHotspots = [
  'btn-loc-hot-residence',
  'btn-loc-hot-observatory',
  'btn-loc-hot-gazebo',
  'btn-loc-hot-mailbox',
  'btn-loc-hot-garden',
  'btn-loc-hot-gecko',
  'btn-loc-hot-pond',
  'btn-loc-hot-waterfall'
];
expectedHotspots.forEach(id => {
  assert(indexHtml.includes(`id="${id}"`), `Hotspot #${id} missing in index.html`);
});
console.log('✅ All 8 interactive hotspots verified in index.html');

// 5. Verify Modals
const expectedModals = [
  'hot-residence-modal',
  'hot-observatory-modal',
  'hot-gazebo-modal',
  'hot-mailbox-modal',
  'hot-garden-modal',
  'hot-gecko-modal',
  'hot-pond-modal',
  'hot-waterfall-modal',
  'hot-collection-modal'
];
expectedModals.forEach(id => {
  assert(indexHtml.includes(`id="${id}"`), `Modal #${id} missing in index.html`);
});
console.log('✅ All 9 sub-modals verified in index.html');

// 6. Verify Web Audio Player & Bottom Controls
const playerIds = [
  'hot-music-player',
  'hot-music-title',
  'hot-music-sub',
  'hot-music-progress-fill',
  'btn-hot-music-prev',
  'btn-hot-music-play',
  'btn-hot-music-next',
  'btn-hot-gallery',
  'btn-hot-collection',
  'btn-hot-pet-corner'
];
playerIds.forEach(id => {
  assert(indexHtml.includes(`id="${id}"`), `Player/Control #${id} missing in index.html`);
});
console.log('✅ Web Audio Player and Bottom Controls verified');

// 7. Verify Profile Sidebar & Pet Status
const profileIds = [
  'hot-profile-mood',
  'hot-sidebar-pet-shortcut',
  'hot-sidebar-pet-status'
];
profileIds.forEach(id => {
  assert(indexHtml.includes(`id="${id}"`), `Profile element #${id} missing in index.html`);
});
console.log('✅ Profile sidebar & Pet status verified');

// 8. Verify hot_view.js
const hotViewJs = fs.readFileSync('hot_view.js', 'utf8');
assert(hotViewJs.includes('export function initHotWorld'), 'initHotWorld export missing in hot_view.js');
assert(hotViewJs.includes('AudioContext'), 'Web Audio API missing in hot_view.js');
assert(hotViewJs.includes('swBN9XodDWRuHE5YbYmeoytrcAx2'), 'Royan canonical UID missing in hot_view.js');
assert(hotViewJs.includes('Whispers of the Elven Wood'), 'Playlist tracks missing in hot_view.js');
console.log('✅ hot_view.js controller logic verified');

// 9. Verify universes_view.js Integration
const univViewJs = fs.readFileSync('universes_view.js', 'utf8');
assert(univViewJs.includes("import { initHotWorld } from './hot_view.js'"), 'initHotWorld import missing in universes_view.js');
assert(univViewJs.includes('const hotCtrl = typeof initHotWorld'), 'hotCtrl initialization missing in universes_view.js');
assert(univViewJs.includes('openHotWorld:'), 'openHotWorld missing in universes_view.js exports');
assert(univViewJs.includes('closeHotWorld:'), 'closeHotWorld missing in universes_view.js exports');
assert(univViewJs.includes('hotController: hotCtrl'), 'hotController missing in universes_view.js exports');
console.log('✅ universes_view.js wiring verified');

// 10. Verify main.js View-Clearing Arrays
const mainJs = fs.readFileSync('main.js', 'utf8');
assert(mainJs.includes("'view-hot-world'"), 'view-hot-world missing in main.js');
console.log('✅ main.js view-clearing integration verified');

// 11. Verify Firebase Configuration
const firebaseJs = fs.readFileSync('firebase.js', 'utf8');
assert(firebaseJs.includes('swBN9XodDWRuHE5YbYmeoytrcAx2'), 'Royan UID missing in firebase.js');
assert(firebaseJs.includes('royan@ourlittleuniverse.com'), 'Royan email missing in firebase.js');
console.log('✅ firebase.js Royan configuration verified');

console.log('🎉 ALL 11 VERIFICATION CHECKS PASSED SUCCESSFULLY! 🎉');

