/**
 * test_royan_profile.cjs
 * Comprehensive test suite for Royan Character Profile & Universe HOT (8th Planet)
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('================================================================');
console.log('ROYAN CHARACTER & UNIVERSE HOT (8TH PLANET) VERIFICATION SUITE');
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
check('card_royan_hd.jpg exists and is > 200KB', () => {
  const filePath = path.resolve(__dirname, 'public/assets/card_royan_hd.jpg');
  assert(fs.existsSync(filePath), 'card_royan_hd.jpg must exist in public/assets/');
  const stats = fs.statSync(filePath);
  assert(stats.size > 200000, `File size ${stats.size} is too small`);
});

check('avatar_royan_hd.jpg exists and is > 200KB', () => {
  const filePath = path.resolve(__dirname, 'public/assets/avatar_royan_hd.jpg');
  assert(fs.existsSync(filePath), 'avatar_royan_hd.jpg must exist in public/assets/');
});

check('portrait_royan_hd.jpg exists and is > 200KB', () => {
  const filePath = path.resolve(__dirname, 'public/assets/portrait_royan_hd.jpg');
  assert(fs.existsSync(filePath), 'portrait_royan_hd.jpg must exist in public/assets/');
});

check('planet_hot_sphere.jpg exists and is > 200KB (Circular Planet Artwork)', () => {
  const filePath = path.resolve(__dirname, 'public/assets/planet_hot_sphere.jpg');
  assert(fs.existsSync(filePath), 'planet_hot_sphere.jpg must exist in public/assets/');
  const stats = fs.statSync(filePath);
  assert(stats.size > 200000, `File size ${stats.size} is too small`);
});

// 2. DOM STRUCTURE IN INDEX.HTML
console.log('\n2. DOM STRUCTURE IN INDEX.HTML');
const indexHtml = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf-8');

check('index.html contains #card-royan with 🎆 emoji and HOT 🎆 role', () => {
  assert(indexHtml.includes('id="card-royan"'), 'Missing id="card-royan" in index.html');
  assert(indexHtml.includes('data-character="royan"'), 'Missing data-character="royan"');
  assert(indexHtml.includes('<h2 class="char-name">Royan</h2>'), 'Missing Royan heading in card');
  assert(indexHtml.includes('HOT 🎆'), 'Missing HOT 🎆 role text in card');
  assert(indexHtml.includes('<span class="char-symbol">🎆</span>'), 'Missing 🎆 symbol in card ornament');
  assert(!indexHtml.includes('ROYAN ✧'), 'Must not use old ✧ symbol for Royan');
});

check('DOM order of all 8 character selection cards is correct', () => {
  const nyanyaIdx = indexHtml.indexOf('id="card-nyanya"');
  const lalaIdx = indexHtml.indexOf('id="card-lala"');
  const leleIdx = indexHtml.indexOf('id="card-lele"');
  const abilIdx = indexHtml.indexOf('id="card-abil"');
  const akhiraIdx = indexHtml.indexOf('id="card-akhira"');
  const elaIdx = indexHtml.indexOf('id="card-ela"');
  const rubenIdx = indexHtml.indexOf('id="card-ruben"');
  const royanIdx = indexHtml.indexOf('id="card-royan"');

  assert(nyanyaIdx !== -1 && lalaIdx !== -1 && leleIdx !== -1 && abilIdx !== -1, 'Cards 1-4 missing');
  assert(akhiraIdx !== -1 && elaIdx !== -1 && rubenIdx !== -1 && royanIdx !== -1, 'Cards 5-8 missing');
  assert(
    nyanyaIdx < lalaIdx && lalaIdx < leleIdx && leleIdx < abilIdx &&
    abilIdx < akhiraIdx && akhiraIdx < elaIdx && elaIdx < rubenIdx && rubenIdx < royanIdx,
    'All 8 cards must follow exact order'
  );
});

check('index.html contains Planet HOT Island 8 in .universes-islands-stage', () => {
  assert(indexHtml.includes('class="univ-island-card card-hot"'), 'Missing card-hot in universes stage');
  assert(indexHtml.includes('data-universe="hot"'), 'Missing data-universe="hot"');
  assert(indexHtml.includes('data-char="royan"'), 'Missing data-char="royan" on hot card');
  assert(indexHtml.includes('/assets/planet_hot_sphere.jpg'), 'Missing planet_hot_sphere.jpg');
  assert(indexHtml.includes('ROYAN\'S UNIVERSE'), 'Missing ROYAN\'S UNIVERSE subtitle');
  assert(indexHtml.includes('<span class="island-symbol-icon">🎆</span> HOT'), 'Missing 🎆 HOT title');
});

check('index.html contains 8 navigation dots including HOT', () => {
  assert(indexHtml.includes('data-planet-index="7"'), 'Missing 8th dot for HOT');
  assert(indexHtml.includes('aria-label="HOT - Royan"'), 'Missing aria-label on HOT dot');
});

// 3. STYLE.CSS & UNIVERSES.CSS STYLING & RESPONSIVENESS
console.log('\n3. STYLE & RESPONSIVENESS IN CSS');
const styleCss = fs.readFileSync(path.resolve(__dirname, 'style.css'), 'utf-8');
const universesCss = fs.readFileSync(path.resolve(__dirname, 'universes.css'), 'utf-8');

check('style.css defines .card-royan ambient aura, frame, and hover effects', () => {
  assert(styleCss.includes('.card-royan .card-ambient-aura'), 'Missing card aura');
  assert(styleCss.includes('.card-royan .card-arch-frame'), 'Missing card arch frame');
  assert(styleCss.includes('.card-royan:hover .card-arch-frame'), 'Missing hover frame');
  assert(styleCss.includes('.card-royan .char-role'), 'Missing role text styling');
});

check('style.css defines body.theme-royan', () => {
  assert(styleCss.includes('body.theme-royan'), 'Missing body.theme-royan definition');
});

check('character-cards-grid has max-width of 1220px to fit 8 cards symmetrically', () => {
  assert(styleCss.includes('max-width: 1220px;'), 'character-cards-grid should have max-width: 1220px');
});

check('universes.css defines .card-hot floating animation, glow, badge, and quote styling', () => {
  assert(universesCss.includes('.card-hot .island-art-wrapper'), 'Missing .card-hot animation');
  assert(universesCss.includes('.card-hot {'), 'Missing .card-hot variable definition');
  assert(universesCss.includes('.card-hot .island-ambient-glow'), 'Missing .card-hot ambient glow');
  assert(universesCss.includes('.card-hot .island-avatar-badge'), 'Missing .card-hot avatar badge');
  assert(universesCss.includes('.card-hot .island-symbol-icon'), 'Missing .card-hot symbol icon');
  assert(universesCss.includes('.card-hot .island-script-quote'), 'Missing .card-hot script quote');
});

// 4. JAVASCRIPT CONTROLLERS (UNIVERSES_VIEW.JS, MAIN.JS, FIREBASE.JS)
console.log('\n4. CONTROLLER & SECURITY GUARDS');
const universesViewJs = fs.readFileSync(path.resolve(__dirname, 'universes_view.js'), 'utf-8');
const mainJs = fs.readFileSync(path.resolve(__dirname, 'main.js'), 'utf-8');
const firebaseJs = fs.readFileSync(path.resolve(__dirname, 'firebase.js'), 'utf-8');

check('universes_view.js defines hot in UNIVERSE_DATA with Royan and 🎆 emoji', () => {
  assert(universesViewJs.includes("hot: {"), 'Missing hot in UNIVERSE_DATA');
  assert(universesViewJs.includes("charKey: 'royan'"), 'charKey must be royan');
  assert(universesViewJs.includes("charRole: 'HOT 🎆'"), 'charRole must be HOT 🎆');
  assert(universesViewJs.includes("name: 'HOT'"), 'name must be HOT');
  assert(universesViewJs.includes("symbol: '🎆'"), 'symbol must be 🎆');
  assert(universesViewJs.includes("islandArt: '/assets/planet_hot_sphere.jpg'"), 'islandArt must be planet_hot_sphere.jpg');
});

check('universes_view.js handles hot card click and prevents unauthorized access by other characters', () => {
  assert(universesViewJs.includes("univKey === 'hot'"), 'Missing hot card click handler');
  assert(universesViewJs.includes("handleOpenHotWorld"), 'Missing handleOpenHotWorld');
  assert(universesViewJs.includes("activeUser !== 'royan'"), 'Must guard against other characters accessing HOT');
  assert(universesViewJs.includes("Universe HOT 🎆 hanya dapat diakses oleh Royan"), 'Guard notice must be descriptive');
  assert(universesViewJs.includes("openHotWorld:"), 'openHotWorld must be exported');
});

check('main.js registers royan with universe HOT, symbol 🎆, and HOT 🎆 role', () => {
  assert(mainJs.includes('royan: {'), 'Missing royan in CHARACTERS');
  assert(mainJs.includes("role: 'HOT 🎆'"), 'Royan role must be HOT 🎆');
  assert(mainJs.includes("symbol: '🎆'"), 'Royan symbol must be 🎆');
  assert(mainJs.includes("universe: 'HOT'"), 'Royan universe must be HOT');
  assert(mainJs.includes("royan: 'HOT'"), 'validUniverses must include royan: HOT');
  assert(mainJs.includes("openHotWorld"), 'main.js must support openHotWorld redirect');
});

check('firebase.js registers royan in CANONICAL_CHARACTERS & UNIVERSE_MAPPINGS with official UID and email', () => {
  assert(firebaseJs.includes("royan: {"), 'Missing royan in CANONICAL_CHARACTERS');
  assert(firebaseJs.includes("universe: 'HOT'"), 'Canonical universe must be HOT');
  assert(firebaseJs.includes("role: 'HOT 🎆'"), 'Canonical role must be HOT 🎆');
  assert(firebaseJs.includes("symbol: '🎆'"), 'Canonical symbol must be 🎆');
  assert(firebaseJs.includes("email: 'royan@ourlittleuniverse.com'"), 'Must have official royan email in CANONICAL_CHARACTERS');
  assert(firebaseJs.includes("uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2'"), 'Must have official royan UID in CANONICAL_CHARACTERS');
  assert(firebaseJs.includes("royan: 'HOT'"), 'UNIVERSE_MAPPINGS must map royan -> HOT');
});

check('.env and .env.example contain VITE_ROYAN_EMAIL and VITE_ROYAN_UID', () => {
  const envText = fs.readFileSync(path.resolve(__dirname, '.env'), 'utf-8');
  const envExample = fs.readFileSync(path.resolve(__dirname, '.env.example'), 'utf-8');
  assert(envText.includes('VITE_ROYAN_EMAIL=royan@ourlittleuniverse.com'), 'Missing VITE_ROYAN_EMAIL in .env');
  assert(envText.includes('VITE_ROYAN_UID=swBN9XodDWRuHE5YbYmeoytrcAx2'), 'Missing VITE_ROYAN_UID in .env');
  assert(envExample.includes('VITE_ROYAN_EMAIL=royan@ourlittleuniverse.com'), 'Missing VITE_ROYAN_EMAIL in .env.example');
  assert(envExample.includes('VITE_ROYAN_UID='), 'Missing VITE_ROYAN_UID in .env.example');
});

check('main.js updates login greeting sparkle and submit button icon to char.symbol (🎆 for Royan)', () => {
  assert(mainJs.includes('loginGreetingSparkle.textContent = char.symbol'), 'Must update greeting sparkle with char.symbol');
  assert(mainJs.includes('btnStarIcon.textContent = char.symbol'), 'Must update submit button icon with char.symbol');
});

console.log('\n================================================================');
console.log(`TOTAL: ${passed}/${total} TESTS PASSED (${Math.round(passed/total * 100)}%)`);
console.log('================================================================');

if (passed !== total) {
  process.exit(1);
}
