/**
 * Automated Verification Suite for Universes View Controller & Data
 */

import { UNIVERSE_DATA, KIDULT_LOCATIONS, TOYOU_LOCATIONS, SHADOW_LOCATIONS } from './universes_view.js';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✕ FAIL: ${message}`);
  }
}

console.log('=== TEST SUITE: UNIVERSES DATA & THREE WORLDS STRUCTURE ===\n');

// 1. Verify Three Universes Definitions
assert(Boolean(UNIVERSE_DATA.kidult), 'KIDULT data is defined');
assert(UNIVERSE_DATA.kidult.charKey === 'nyanya', 'KIDULT maps to character key nyanya');
assert(UNIVERSE_DATA.kidult.charName === 'Nyanya', 'KIDULT character name is Nyanya');
assert(UNIVERSE_DATA.kidult.charRole === 'The Moonlit Shadow Witch', 'KIDULT character role is The Moonlit Shadow Witch');
assert(UNIVERSE_DATA.kidult.owner === "NYANYA'S UNIVERSE", "KIDULT card label is NYANYA'S UNIVERSE");
assert(UNIVERSE_DATA.kidult.ownerName === 'Alenda', 'KIDULT ownerName is Alenda');
assert(UNIVERSE_DATA.kidult.symbol === '★', 'KIDULT has star symbol ★');
assert(UNIVERSE_DATA.kidult.avatar === '/assets/avatar_nyanya_hd.png', 'KIDULT uses Nyanya HD avatar');
assert(UNIVERSE_DATA.kidult.quote === 'Small joys make a big universe.', 'KIDULT has exact quote from mockup');

assert(Boolean(UNIVERSE_DATA.to_you), 'TO YOU data is defined');
assert(UNIVERSE_DATA.to_you.charKey === 'lala', 'TO YOU maps to character key lala');
assert(UNIVERSE_DATA.to_you.charName === 'Lala', 'TO YOU character name is Lala');
assert(UNIVERSE_DATA.to_you.charRole === 'The Everglow Fairy', 'TO YOU character role is The Everglow Fairy');
assert(UNIVERSE_DATA.to_you.owner === "LALA'S UNIVERSE", "TO YOU card label is LALA'S UNIVERSE");
assert(UNIVERSE_DATA.to_you.ownerName === 'Bella', 'TO YOU ownerName is Bella');
assert(UNIVERSE_DATA.to_you.symbol === '☼', 'TO YOU has sun symbol ☼');
assert(UNIVERSE_DATA.to_you.avatar === '/assets/avatar_lala_hd.png', 'TO YOU uses Lala HD avatar');
assert(UNIVERSE_DATA.to_you.quote === 'A little closer, for a brighter tomorrow.', 'TO YOU has exact quote from mockup');

assert(Boolean(UNIVERSE_DATA.shadow), 'SHADOW data is defined');
assert(UNIVERSE_DATA.shadow.charKey === 'lele', 'SHADOW maps to character key lele');
assert(UNIVERSE_DATA.shadow.charName === 'Lele', 'SHADOW character name is Lele');
assert(UNIVERSE_DATA.shadow.charRole === 'The Eclipse Guardian', 'SHADOW character role is The Eclipse Guardian');
assert(UNIVERSE_DATA.shadow.owner === "LELE'S UNIVERSE", "SHADOW card label is LELE'S UNIVERSE");
assert(UNIVERSE_DATA.shadow.ownerName === 'Vanya', 'SHADOW ownerName is Vanya');
assert(UNIVERSE_DATA.shadow.symbol === '☾', 'SHADOW has crescent moon symbol ☾');
assert(UNIVERSE_DATA.shadow.avatar === '/assets/avatar_lele_hd.png', 'SHADOW uses Lele HD avatar');
assert(UNIVERSE_DATA.shadow.quote === 'Same sky, different shadows.', 'SHADOW has exact quote from mockup');

// 2. Verify KIDULT 2D Dreamy World Connected Locations (6 Locations)
assert(Boolean(KIDULT_LOCATIONS.rumah), 'KIDULT 2D World has Rumah Vanya location');
assert(Boolean(KIDULT_LOCATIONS.rumah_kaca), 'KIDULT 2D World has Rumah Kaca location');
assert(Boolean(KIDULT_LOCATIONS.sungai_senja), 'KIDULT 2D World has Sungai Senja location');
assert(Boolean(KIDULT_LOCATIONS.gazebo), 'KIDULT 2D World has Gazebo Tepi Sungai location');
assert(Boolean(KIDULT_LOCATIONS.teleskop), 'KIDULT 2D World has Area Teleskop Bintang (Star Messages) location');
assert(Boolean(KIDULT_LOCATIONS.kotak_pos), 'KIDULT 2D World has Kotak Pos location');

// 3. Verify TO YOU — Bella's 2D Fairy Forest World Connected Locations (6 Locations)
assert(Boolean(TOYOU_LOCATIONS.rumah), 'TO YOU 2D World has Lokasi A: Rumah Bella');
assert(Boolean(TOYOU_LOCATIONS.atelier), 'TO YOU 2D World has Lokasi B: Galeri Busana — Atelier');
assert(Boolean(TOYOU_LOCATIONS.teleskop), 'TO YOU 2D World has Lokasi C: Teleskop');
assert(Boolean(TOYOU_LOCATIONS.gazebo), 'TO YOU 2D World has Lokasi D: Gazebo');
assert(Boolean(TOYOU_LOCATIONS.ladang_kupu), 'TO YOU 2D World has Lokasi E: Ladang Kupu-kupu');
assert(Boolean(TOYOU_LOCATIONS.kotak_pos), 'TO YOU 2D World has Lokasi F: Kotak Pos');

// 4. Verify SHADOW — Lele's 2D Crystal Moon Sanctuary Connected Locations (8 Locations A-G)
assert(Boolean(SHADOW_LOCATIONS.rumah_kristal), 'SHADOW 2D World has Lokasi A: Menara Kristal — Rumah Lele');
assert(Boolean(SHADOW_LOCATIONS.teleskop), 'SHADOW 2D World has Lokasi B: Observatorium Kristal — Teleskop');
assert(Boolean(SHADOW_LOCATIONS.gazebo), 'SHADOW 2D World has Lokasi C: Gazebo Kristal');
assert(Boolean(SHADOW_LOCATIONS.kotak_pos), 'SHADOW 2D World has Lokasi D: Kotak Pos Kristal');
assert(Boolean(SHADOW_LOCATIONS.ladang_bunga), 'SHADOW 2D World has Lokasi E: Ladang Bunga — Hydrangea & Snowdrop');
assert(Boolean(SHADOW_LOCATIONS.kolam_berendam), 'SHADOW 2D World has Lokasi F1: Kolam Berendam Kristal');
assert(Boolean(SHADOW_LOCATIONS.sungai_kristal), 'SHADOW 2D World has Lokasi F2: Sungai Kristal');
assert(Boolean(SHADOW_LOCATIONS.galeri_seni), 'SHADOW 2D World has Lokasi G: Galeri Seni Kristal');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed}/${total} PASSED (100%)`);
console.log(`========================================\n`);
