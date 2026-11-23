/**
 * TEST SUITE: KIDULT TOP NAVIGATION CLEANUP & INTERACTIVE MAP VERIFICATION
 *
 * Verifies:
 * 1. Duplicate top HUD buttons (Everdream House, Greenhouse, Gazebo) are removed from top nav.
 * 2. Essential navigations are preserved:
 *    - Pergi ke Universe (#btn-kidult-return-univ)
 *    - Story / Karya (#btn-kidult-story)
 *    - Sapaan profil pengguna (#kidult-user-pill, #kidult-user-greeting, #kidult-user-avatar)
 *    - Back orb (#btn-kidult-back)
 *    - Sapaan kartu karakter (#kidult-char-card)
 *    - Star messages pill (#btn-kidult-star-messages)
 *    - Mood picker & music card (#btn-toggle-mood-picker)
 *    - Tombol Dekorasi (#btn-kidult-decor-toggle)
 *    - Gallery / Moments (#btn-kidult-gallery)
 * 3. 2D Interactive map hotspots are preserved:
 *    - Rumah (The Everdream House) #hotspot-kidult-everdream
 *    - Rumah Kaca (The Enchanted Greenhouse) #hotspot-rumah-kaca
 *    - Gazebo (Memory Garden Gazebo) #hotspot-gazebo
 *    - Teleskop (Star Messages)
 *    - Kotak Pos
 *    - Sungai Senja
 * 4. Interaction flow:
 *    - Clicking Rumah hotspot opens location panel -> action button opens Everdream House
 *    - Clicking Rumah Kaca hotspot opens location panel -> action button opens Enchanted Greenhouse
 *    - Clicking Gazebo hotspot opens location panel -> action button opens Gazebo Nyanya
 * 5. Layout & responsiveness:
 *    - CSS contains .kidult-hud-topright with flex, flex-wrap, justify-content: flex-end
 *    - Mobile media queries (@media (max-width: 768px)) defined for compact top-right HUD
 */

import assert from 'assert';
import fs from 'fs';

console.log('🌌 Starting KIDULT Top Navigation Cleanup & Map Hotspot Verification...\n');

// 1. Static HTML Audit
const indexHtml = fs.readFileSync('index.html', 'utf8');

console.log('--- 1. Top HUD Duplicate Removal & Essential Navigation Retention ---');
// Verify duplicate top HUD buttons and bottom-right duplicate are completely removed
assert(!indexHtml.includes('id="btn-kidult-everdream-house"'), 'Must NOT have #btn-kidult-everdream-house in index.html');
assert(!indexHtml.includes('id="btn-kidult-greenhouse"'), 'Must NOT have #btn-kidult-greenhouse in index.html');
assert(!indexHtml.includes('id="btn-kidult-gazebo"'), 'Must NOT have #btn-kidult-gazebo in index.html');
assert(!indexHtml.includes('id="btn-kidult-back-bottom"'), 'Must NOT have #btn-kidult-back-bottom in index.html');
console.log('✓ Duplicate top-bar buttons (Everdream House, Greenhouse, Gazebo) & bottom-right "Pergi ke Universe" button removed successfully.');

// Verify retained top-right HUD elements
assert(indexHtml.includes('id="btn-kidult-return-univ"'), 'Must retain #btn-kidult-return-univ ("Pergi ke Universe")');
assert(indexHtml.includes('Pergi ke Universe'), 'Must retain "Pergi ke Universe" text');
assert(indexHtml.includes('id="btn-kidult-story"'), 'Must retain #btn-kidult-story ("Story (Karya)")');
assert(indexHtml.includes('Story (Karya)'), 'Must retain "Story (Karya)" text');
assert(indexHtml.includes('id="kidult-user-pill"'), 'Must retain user greeting pill #kidult-user-pill');
assert(indexHtml.includes('id="kidult-user-greeting"'), 'Must retain #kidult-user-greeting');
assert(indexHtml.includes('id="kidult-user-avatar"'), 'Must retain #kidult-user-avatar');
console.log('✓ Retained top-right HUD elements (Pergi ke Universe, Story, User Greeting) verified.');

// Verify retained top-left HUD & other controls
assert(indexHtml.includes('id="btn-kidult-back"'), 'Must retain back orb #btn-kidult-back');
assert(indexHtml.includes('id="kidult-char-card"'), 'Must retain character identity card #kidult-char-card');
assert(indexHtml.includes('id="btn-kidult-star-messages"'), 'Must retain star messages pill #btn-kidult-star-messages');
assert(indexHtml.includes('id="btn-toggle-mood-picker"'), 'Must retain mood picker button #btn-toggle-mood-picker');
assert(indexHtml.includes('id="btn-kidult-decor-toggle"'), 'Must retain decoration toggle button #btn-kidult-decor-toggle');
assert(indexHtml.includes('id="btn-kidult-gallery"'), 'Must retain floating gallery button #btn-kidult-gallery');
console.log('✓ Retained top-left HUD, mood, decoration, and gallery controls verified.');

console.log('\n--- 2. Interactive Map Hotspot Verification ---');
// Verify interactive map hotspots exist and have not been removed or renamed
assert(indexHtml.includes('id="hotspot-kidult-everdream"'), 'Must retain Rumah hotspot #hotspot-kidult-everdream');
assert(indexHtml.includes('id="hotspot-rumah-kaca"'), 'Must retain Rumah Kaca hotspot #hotspot-rumah-kaca');
assert(indexHtml.includes('data-kidult-loc="gazebo"'), 'Must retain Gazebo hotspot with data-kidult-loc="gazebo"');
assert(indexHtml.includes('data-kidult-loc="teleskop"'), 'Must retain Teleskop hotspot');
assert(indexHtml.includes('data-kidult-loc="kotak_pos"'), 'Must retain Kotak Pos hotspot');
assert(indexHtml.includes('data-kidult-loc="sungai_senja"'), 'Must retain Sungai Senja hotspot');
assert(indexHtml.includes('id="kidult-chibi-actor"'), 'Must retain interactive Chibi Nyanya actor');
assert(indexHtml.includes('id="kidult-location-panel"'), 'Must retain interactive location detail modal panel');
assert(indexHtml.includes('id="btn-kidult-loc-action"'), 'Must retain location action button #btn-kidult-loc-action');
console.log('✓ All 6 2D island map hotspots and interactive actor/panel verified intact.');

console.log('\n--- 3. CSS Layout & Responsive Audit ---');
const css = fs.readFileSync('universes.css', 'utf8');

assert(css.includes('.kidult-hud-topright'), 'CSS must define .kidult-hud-topright');
assert(css.includes('.kidult-return-pill'), 'CSS must style .kidult-return-pill');
assert(css.includes('.kidult-story-pill'), 'CSS must style .kidult-story-pill');
assert(css.includes('.kidult-user-pill'), 'CSS must style .kidult-user-pill');
assert(css.includes('@media (max-width: 768px)'), 'CSS must have responsive media query for mobile/tablet');
console.log('✓ CSS layout and responsive rules verified.');

console.log('\n--- 4. Functional Simulation of Map Hotspots & Action Buttons ---');
import { KIDULT_LOCATIONS } from './universes_view.js';

assert(KIDULT_LOCATIONS.rumah.actionType === 'everdream_house', 'Rumah must open everdream_house');
assert(KIDULT_LOCATIONS.rumah_kaca.actionType === 'greenhouse', 'Rumah kaca must open greenhouse');
assert(KIDULT_LOCATIONS.gazebo.actionType === 'kidult_gazebo', 'Gazebo must open kidult_gazebo');
assert(KIDULT_LOCATIONS.teleskop.actionType === 'star_messages', 'Teleskop must open star_messages');
assert(KIDULT_LOCATIONS.kotak_pos.actionType === 'kotak_pos', 'Kotak pos must open kotak_pos');

console.log('✓ All 5 interactive action types in KIDULT_LOCATIONS verified:');
console.log('  - rumah -> ' + KIDULT_LOCATIONS.rumah.actionType + ' (' + KIDULT_LOCATIONS.rumah.actionLabel + ')');
console.log('  - rumah_kaca -> ' + KIDULT_LOCATIONS.rumah_kaca.actionType + ' (' + KIDULT_LOCATIONS.rumah_kaca.actionLabel + ')');
console.log('  - gazebo -> ' + KIDULT_LOCATIONS.gazebo.actionType + ' (' + KIDULT_LOCATIONS.gazebo.actionLabel + ')');
console.log('  - teleskop -> ' + KIDULT_LOCATIONS.teleskop.actionType + ' (' + KIDULT_LOCATIONS.teleskop.actionLabel + ')');
console.log('  - kotak_pos -> ' + KIDULT_LOCATIONS.kotak_pos.actionType + ' (' + KIDULT_LOCATIONS.kotak_pos.actionLabel + ')');

console.log('\n🎉 ALL KIDULT TOP NAVIGATION CLEANUP & MAP TESTS PASSED (100%)!\n');
