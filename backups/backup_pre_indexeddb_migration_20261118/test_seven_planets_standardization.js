import fs from 'fs';
import { UNIVERSE_DATA } from './universes_view.js';

let passed = 0;
let total = 0;
function assert(cond, msg) {
  total++;
  if (cond) {
    console.log(`  ✓ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${msg}`);
    process.exitCode = 1;
  }
}

console.log('1. ARTWORK MAPPING VERIFICATION FOR ALL 7 PLANETS');
assert(UNIVERSE_DATA.kidult?.islandArt === '/assets/planet_kidult_sphere.jpg', 'KIDULT uses /assets/planet_kidult_sphere.jpg');
assert(UNIVERSE_DATA.to_you?.islandArt === '/assets/planet_toyou_sphere.jpg', 'TO YOU uses /assets/planet_toyou_sphere.jpg');
assert(UNIVERSE_DATA.shadow?.islandArt === '/assets/planet_shadow_sphere.jpg', 'SHADOW uses /assets/planet_shadow_sphere.jpg');
assert(UNIVERSE_DATA.yawn?.islandArt === '/assets/island_yawn_floating.jpg', 'YAWN uses /assets/island_yawn_floating.jpg');
assert(UNIVERSE_DATA.us_again?.islandArt === '/assets/island_usagain_floating.jpg', 'US AGAIN uses /assets/island_usagain_floating.jpg');
assert(UNIVERSE_DATA.ash?.islandArt === '/assets/island_ash_floating.jpg', 'ASH uses /assets/island_ash_floating.jpg');
assert(UNIVERSE_DATA.pinwheel?.islandArt === '/assets/island_pinwheel_floating.jpg', 'PINWHEEL uses /assets/island_pinwheel_floating.jpg');

// Check physical existence and non-zero size of all 7 files in public/assets/
const assetPaths = [
  'public/assets/planet_kidult_sphere.jpg',
  'public/assets/planet_toyou_sphere.jpg',
  'public/assets/planet_shadow_sphere.jpg',
  'public/assets/island_yawn_floating.jpg',
  'public/assets/island_usagain_floating.jpg',
  'public/assets/island_ash_floating.jpg',
  'public/assets/island_pinwheel_floating.jpg'
];
for (const p of assetPaths) {
  assert(fs.existsSync(p) && fs.statSync(p).size > 100000, `Asset ${p} exists and is valid size (>100KB)`);
}

console.log('\n2. UNIFIED CIRCULAR STYLING IN universes.css');
const css = fs.readFileSync('universes.css', 'utf8');
assert(css.includes('aspect-ratio: 1 / 1;'), 'Aspect ratio 1:1 enforced');
assert(css.includes('border-radius: 50%;'), 'Border radius 50% circular enforced');
assert(css.includes('object-fit: cover;'), 'Object fit cover enforced');
assert(css.includes('mask-image: radial-gradient(circle,'), 'Radial gradient circular mask enforced');

console.log('\n3. HTML DOM MARKUP CONSISTENCY');
const html = fs.readFileSync('index.html', 'utf8');
assert(html.includes('src="/assets/planet_kidult_sphere.jpg"'), 'index.html has planet_kidult_sphere.jpg');
assert(html.includes('src="/assets/planet_toyou_sphere.jpg"'), 'index.html has planet_toyou_sphere.jpg');
assert(html.includes('src="/assets/planet_shadow_sphere.jpg"'), 'index.html has planet_shadow_sphere.jpg');
assert(html.includes('id="btn-planets-prev"') && html.includes('id="btn-planets-next"'), 'Navigation arrows present in DOM');
assert(html.includes('class="univ-nav-dots"'), 'Navigation dots indicator present in DOM');

console.log(`\nSummary: ${passed}/${total} passed`);
process.exit(passed === total ? 0 : 1);

