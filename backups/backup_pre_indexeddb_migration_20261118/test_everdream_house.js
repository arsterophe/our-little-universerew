/**
 * TEST SUITE: THE EVERDREAM HOUSE — NYANYA ⭐ (UNIVERSE KIDULT)
 * Tests static HTML, CSS classes, State data, View Controller, and Integration
 */

import assert from 'assert';
import fs from 'fs';
import {
  EVERDREAM_CHARACTER,
  EVERDREAM_ROOMS,
  EVERDREAM_ATMOSPHERES,
  EVERDREAM_MEMORY_CHEST,
  EVERDREAM_BOOKSHELF,
  EVERDREAM_RECIPES,
  EVERDREAM_NYANYA_DIALOGS,
  loadEverdreamState,
  saveEverdreamState
} from './everdream_house_state.js';

console.log('🧪 Starting The Everdream House Test Suite...\n');

// -----------------------------------------------------------------------------
// 1. CHARACTER IDENTITY & METADATA TESTS
// -----------------------------------------------------------------------------
assert.strictEqual(EVERDREAM_CHARACTER.id, 'nyanya', 'Character must be nyanya');
assert.strictEqual(EVERDREAM_CHARACTER.name, 'Nyanya', 'Character name must be Nyanya');
assert.strictEqual(EVERDREAM_CHARACTER.symbol, '⭐', 'Symbol must be ⭐');
assert.strictEqual(EVERDREAM_CHARACTER.universe, 'KIDULT', 'Universe must be KIDULT');
assert.strictEqual(EVERDREAM_CHARACTER.quote, 'Where childhood dreams never fade.', 'Tagline must match');
console.log('✓ 1. Nyanya character identity and metadata verified.');

// -----------------------------------------------------------------------------
// 2. ROOM DEFINITIONS (ALL 6 ROOMS)
// -----------------------------------------------------------------------------
assert.strictEqual(EVERDREAM_ROOMS.length, 6, 'Must define exactly 6 rooms (exterior + 5 personal rooms)');
const roomIds = EVERDREAM_ROOMS.map(r => r.id);
assert(roomIds.includes('exterior'), 'Must include exterior (Halaman & Taman Dongeng)');
assert(roomIds.includes('living'), 'Must include living (The Memory Living Room)');
assert(roomIds.includes('bedroom'), 'Must include bedroom (The Dreamer\'s Bedroom)');
assert(roomIds.includes('atelier'), 'Must include atelier (The Little Wonder Atelier)');
assert(roomIds.includes('kitchen'), 'Must include kitchen (The Sweet Memories Kitchen)');
assert(roomIds.includes('attic'), 'Must include attic (The Little Memory Attic)');
console.log('✓ 2. All 6 Storybook Victorian rooms defined and verified.');

// -----------------------------------------------------------------------------
// 3. ATMOSPHERES (4 MODES)
// -----------------------------------------------------------------------------
assert.strictEqual(EVERDREAM_ATMOSPHERES.length, 4, 'Must have 4 atmospheres');
const atmoIds = EVERDREAM_ATMOSPHERES.map(a => a.id);
assert(atmoIds.includes('twilight'), 'Must include Golden Twilight');
assert(atmoIds.includes('rosy'), 'Must include Rosy Sunset');
assert(atmoIds.includes('morning'), 'Must include Warm Morning');
assert(atmoIds.includes('starry'), 'Must include Starry Night');
console.log('✓ 3. 4 Atmosphere time & weather presets verified.');

// -----------------------------------------------------------------------------
// 4. PETI KENANGAN (MEMORY CHEST) — 7 SACRED MEMORIES
// -----------------------------------------------------------------------------
assert.strictEqual(EVERDREAM_MEMORY_CHEST.length, 7, 'Must have 7 memories spanning all characters');
const memOwners = EVERDREAM_MEMORY_CHEST.map(m => m.owner);
assert(memOwners.some(o => o.includes('Nyanya')), 'Must include Nyanya memory');
assert(memOwners.some(o => o.includes('Lala')), 'Must include Lala memory');
assert(memOwners.some(o => o.includes('Lele')), 'Must include Lele memory');
assert(memOwners.some(o => o.includes('Syma')), 'Must include Syma memory');
assert(memOwners.some(o => o.includes('Akhira')), 'Must include Akhira memory');
assert(memOwners.some(o => o.includes('Ela')), 'Must include Ela memory');
assert(memOwners.some(o => o.includes('Ruben')), 'Must include Ruben/Royan memory');
console.log('✓ 4. Peti Kenangan with 7 cross-universe sacred friendship memories verified.');

// -----------------------------------------------------------------------------
// 5. BOOKSHELF & RECIPES
// -----------------------------------------------------------------------------
assert(EVERDREAM_BOOKSHELF.length >= 4, 'Bookshelf must contain at least 4 classic stories');
assert(EVERDREAM_RECIPES.length >= 4, 'Must have at least 4 baking and tea recipes');
console.log('✓ 5. Bookshelf and baking recipes verified.');

// -----------------------------------------------------------------------------
// 6. PHYSICAL ENVIRONMENT ASSET CHECK
// -----------------------------------------------------------------------------
const bgPath = './public/assets/everdream_house_exterior.jpg';
assert(fs.existsSync(bgPath), 'public/assets/everdream_house_exterior.jpg must physically exist');
const bgStats = fs.statSync(bgPath);
assert(bgStats.size > 50000, 'Image file must be a genuine high-res illustration (> 50KB)');
console.log(`✓ 6. Genuine Victorian Cottage environment background verified (${bgStats.size} bytes).`);

// -----------------------------------------------------------------------------
// 7. INDEX.HTML STATIC STRUCTURE
// -----------------------------------------------------------------------------
const indexHtml = fs.readFileSync('index.html', 'utf8');

assert(indexHtml.includes('everdream_house.css'), 'index.html must link everdream_house.css in head');
assert(indexHtml.includes('id="view-everdream-house"'), 'index.html must contain #view-everdream-house');
assert(indexHtml.includes('id="btn-everdream-back"'), 'Must contain #btn-everdream-back');
assert(indexHtml.includes('THE EVERDREAM HOUSE'), 'Must contain title "THE EVERDREAM HOUSE"');
assert(indexHtml.includes('Where Childhood Dreams Never Fade.'), 'Must contain tagline');
assert(indexHtml.includes('data-atmo="twilight"'), 'Must contain twilight atmosphere button');
assert(indexHtml.includes('data-atmo="rosy"'), 'Must contain rosy atmosphere button');
assert(indexHtml.includes('data-atmo="morning"'), 'Must contain morning atmosphere button');
assert(indexHtml.includes('data-atmo="starry"'), 'Must contain starry atmosphere button');
assert(indexHtml.includes('data-room="exterior"'), 'Must contain exterior room');
assert(indexHtml.includes('data-room="living"'), 'Must contain living room');
assert(indexHtml.includes('data-room="bedroom"'), 'Must contain bedroom');
assert(indexHtml.includes('data-room="atelier"'), 'Must contain atelier');
assert(indexHtml.includes('data-room="kitchen"'), 'Must contain kitchen');
assert(indexHtml.includes('data-room="attic"'), 'Must contain attic');
assert(indexHtml.includes('id="btn-cottage-door-enter"'), 'Must contain door enter button');
assert(indexHtml.includes('id="btn-hub-greenhouse"'), 'Must integrate with Greenhouse');
assert(indexHtml.includes('id="btn-hub-gazebo"'), 'Must integrate with Gazebo');
assert(indexHtml.includes('id="btn-hub-river"'), 'Must integrate with Sungai Senja');
assert(indexHtml.includes('id="btn-hub-picnic"'), 'Must integrate with Area Piknik');
assert(indexHtml.includes('id="living-fireplace-visual"'), 'Must contain fireplace visual');
assert(indexHtml.includes('id="btn-fireplace-toggle"'), 'Must contain fireplace toggle');
assert(indexHtml.includes('id="btn-living-sofa"'), 'Must contain sofa sit button');
assert(indexHtml.includes('id="btn-bookshelf-open"'), 'Must contain bookshelf open button');
assert(indexHtml.includes('id="bedroom-starlamp-visual"'), 'Must contain star lamp visual');
assert(indexHtml.includes('id="btn-starlamp-toggle"'), 'Must contain star lamp toggle');
assert(indexHtml.includes('id="btn-bedroom-rest"'), 'Must contain bed rest button');
assert(indexHtml.includes('id="btn-bedroom-desk"'), 'Must contain journal desk button');
assert(indexHtml.includes('id="btn-atelier-paint"'), 'Must contain atelier paint button');
assert(indexHtml.includes('id="btn-atelier-scrapbook"'), 'Must contain atelier scrapbook button');
assert(indexHtml.includes('id="btn-kitchen-bake"'), 'Must contain kitchen bake button');
assert(indexHtml.includes('id="btn-memory-chest-open"'), 'Must contain memory chest open button');
assert(indexHtml.includes('id="everdream-memory-modal"'), 'Must contain #everdream-memory-modal');
assert(indexHtml.includes('id="everdream-bookshelf-modal"'), 'Must contain #everdream-bookshelf-modal');
assert(indexHtml.includes('id="everdream-journal-modal"'), 'Must contain #everdream-journal-modal');
assert(indexHtml.includes('id="everdream-kitchen-modal"'), 'Must contain #everdream-kitchen-modal');
assert(indexHtml.includes('id="everdream-sleep-overlay"'), 'Must contain #everdream-sleep-overlay');
assert(indexHtml.includes('id="hotspot-kidult-everdream"'), 'Must have hotspot in KIDULT world');
assert(!indexHtml.includes('id="btn-kidult-everdream-house"'), 'Duplicate Everdream House pill must be removed from KIDULT top HUD');
console.log('✓ 7. index.html static markup and all interactive element IDs verified.');

// -----------------------------------------------------------------------------
// 8. CSS RULES & PALETTE AUDIT
// -----------------------------------------------------------------------------
const css = fs.readFileSync('everdream_house.css', 'utf8');

assert(css.includes('--ed-ivory:'), 'CSS must define ivory cream palette');
assert(css.includes('--ed-dusty-pink:'), 'CSS must define dusty pink palette');
assert(css.includes('--ed-soft-lavender:'), 'CSS must define soft lavender palette');
assert(css.includes('--ed-champagne-gold:'), 'CSS must define champagne gold palette');
assert(css.includes('--ed-warm-beige:'), 'CSS must define warm beige palette');
assert(css.includes('.atmo-twilight'), 'CSS must contain .atmo-twilight');
assert(css.includes('.atmo-rosy'), 'CSS must contain .atmo-rosy');
assert(css.includes('.atmo-morning'), 'CSS must contain .atmo-morning');
assert(css.includes('.atmo-starry'), 'CSS must contain .atmo-starry');
assert(css.includes('@keyframes edSmokeCurl'), 'CSS must animate chimney smoke');
assert(css.includes('@keyframes edDoorGlowPulse'), 'CSS must animate door glow');
assert(css.includes('@keyframes edButterflyFlutter'), 'CSS must animate butterflies');
assert(css.includes('@keyframes edFireplaceFlicker'), 'CSS must animate fireplace flames');
assert(css.includes('@keyframes edStarPulse'), 'CSS must animate star lamp');
assert(css.includes('@media (max-width: 768px)'), 'CSS must provide responsive mobile rules');
console.log('✓ 8. everdream_house.css palette, atmospheric themes, and animations verified.');

// -----------------------------------------------------------------------------
// 9. CONTROLLER & UNIVERSES VIEW INTEGRATION
// -----------------------------------------------------------------------------
const viewJs = fs.readFileSync('universes_view.js', 'utf8');
assert(viewJs.includes('initEverdreamHouseView'), 'universes_view.js must import initEverdreamHouseView');
assert(viewJs.includes('everdream_house'), 'KIDULT_LOCATIONS.rumah actionType must be everdream_house');
assert(viewJs.includes('The Everdream House'), 'KIDULT_LOCATIONS.rumah title must be The Everdream House');
assert(viewJs.includes('Where Childhood Dreams Never Fade'), 'KIDULT_LOCATIONS.rumah subtitle must match');
assert(viewJs.includes('everdreamHouseController: everdreamHouseCtrl'), 'universes_view.js must export everdreamHouseController');
assert(viewJs.includes('openEverdreamHouse:'), 'universes_view.js must export openEverdreamHouse');

const mainJs = fs.readFileSync('main.js', 'utf8');
assert(mainJs.includes('view-everdream-house'), 'main.js must register view-everdream-house in protected views');
console.log('✓ 9. universes_view.js and main.js routing integration verified.');

console.log('\n🎉 ALL EVERDREAM HOUSE TEST ASSERTIONS PASSED SUCCESSFULLY! (100%)\n');
