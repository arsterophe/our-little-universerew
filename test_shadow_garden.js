/**
 * OUR LITTLE UNIVERSE — MOONLIT HYDRANGEA GARDEN TEST SUITE
 * 
 * Verifies:
 * 1. Hotspot Ladang Hydrangea in SHADOW & untouched status of KIDULT and TO YOU.
 * 2. DOM structure & CSS styling matching Moonlit Hydrangea Garden specifications.
 * 3. Activity A: Little Gardener (watering, leaf cleaning, blooming, time progression).
 * 4. Activity B: Flower of Feelings (5 official meanings, quotes, mood picking).
 * 5. Activity C: Create Your Bouquet (flower combination, ribbon, live preview, Gallery saving via moments.js).
 * 6. Activity D: Moonlight Pond (reflections, lotuses, meditation thoughts, ambient sounds).
 * 7. Navigation return to SHADOW universe.
 * 8. Firestore rules compatibility.
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(message);
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('1. HOTSPOT LADANG BUNGA SHADOW & UNTOUCHED OTHER UNIVERSES');
  console.log('================================================================');

  const { SHADOW_LOCATIONS, KIDULT_LOCATIONS, TOYOU_LOCATIONS } = await import('./universes_view.js');

  // Verify SHADOW ladang_bunga
  assert(Boolean(SHADOW_LOCATIONS.ladang_bunga), 'SHADOW has ladang_bunga location configured');
  assert(SHADOW_LOCATIONS.ladang_bunga.actionType === 'shadow_garden', 'SHADOW ladang_bunga actionType is shadow_garden');
  assert(SHADOW_LOCATIONS.ladang_bunga.title === 'Moonlit Hydrangea Garden', 'SHADOW ladang_bunga title is Moonlit Hydrangea Garden');

  // Verify KIDULT and TO YOU are untouched
  assert(!KIDULT_LOCATIONS.ladang_bunga, 'KIDULT has no ladang_bunga modification');
  if (TOYOU_LOCATIONS.ladang_bunga) {
    assert(TOYOU_LOCATIONS.ladang_bunga.actionType !== 'shadow_garden', 'TO YOU ladang_bunga remains untouched');
  }

  // Also verify Gazebo in SHADOW remains untouched
  assert(SHADOW_LOCATIONS.gazebo.actionType === 'shadow_gazebo', 'SHADOW gazebo remains active as shadow_gazebo');

  console.log('\n================================================================');
  console.log('2. DOM STRUCTURE & CSS STYLING FOR MOONLIT HYDRANGEA GARDEN');
  console.log('================================================================');

  const indexHtml = fs.readFileSync(path.resolve('./index.html'), 'utf-8');
  const cssContent = fs.readFileSync(path.resolve('./shadow_garden.css'), 'utf-8');

  assert(indexHtml.includes('id="view-shadow-garden"'), 'index.html contains view-shadow-garden section');
  assert(indexHtml.includes('id="btn-garden-back"'), 'index.html contains return button (id="btn-garden-back")');
  assert(indexHtml.includes('MOONLIT HYDRANGEA GARDEN'), 'index.html contains MOONLIT HYDRANGEA GARDEN title');
  assert(indexHtml.includes('id="btn-garden-music-toggle"'), 'index.html contains music toggle button');
  assert(indexHtml.includes('id="garden-music-volume"'), 'index.html contains music volume slider');

  // 4 Activity Cards
  assert(indexHtml.includes('id="garden-card-gardener"'), 'index.html contains Little Gardener activity card');
  assert(indexHtml.includes('id="garden-card-feelings"'), 'index.html contains Flower of Feelings activity card');
  assert(indexHtml.includes('id="garden-card-bouquet"'), 'index.html contains Create Your Bouquet activity card');
  assert(indexHtml.includes('id="garden-card-pond"'), 'index.html contains Moonlight Pond activity card');

  // Modals & Moonlight Pond immersion
  assert(indexHtml.includes('id="modal-little-gardener"'), 'index.html contains Little Gardener modal');
  assert(indexHtml.includes('id="modal-flower-feelings"'), 'index.html contains Flower of Feelings modal');
  assert(indexHtml.includes('id="modal-create-bouquet"'), 'index.html contains Create Your Bouquet modal');
  assert(indexHtml.includes('id="view-moonlight-pond"'), 'index.html contains Moonlight Pond immersion view');

  // CSS assertions
  assert(cssContent.includes('.view-shadow-garden'), 'shadow_garden.css styles view-shadow-garden');
  assert(cssContent.includes('.garden-card'), 'shadow_garden.css styles garden-card');
  assert(cssContent.includes('.garden-firefly'), 'shadow_garden.css styles animated fireflies');
  assert(cssContent.includes('.view-moonlight-pond'), 'shadow_garden.css styles view-moonlight-pond immersion');

  console.log('\n================================================================');
  console.log('3. ACTIVITY A: LITTLE GARDENER (PLANT CARE & PERSISTENCE)');
  console.log('================================================================');

  const { GARDEN_FLOWERS } = await import('./shadow_garden_view.js');
  const { loadUniverseState, getCurrentUniverseState, updateElementState } = await import('./universe_state.js');

  // Load Lele's universe state
  await loadUniverseState('lele', { uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2', email: 'vanya.lele@universe.app' });

  // Simulate Little Gardener state update
  const testPlants = [
    {
      id: 'h1',
      flowerKey: 'blue',
      name: 'Hydrangea Biru Ketenangan',
      stage: 'mekar_sempurna',
      health: 100,
      waterLevel: 95,
      cleanliness: 90,
      growthPoints: 140,
      lastWatered: Date.now()
    },
    {
      id: 'h2',
      flowerKey: 'purple',
      name: 'Hydrangea Ungu Imajinasi',
      stage: 'setengah_mekar',
      health: 85,
      waterLevel: 80,
      cleanliness: 85,
      growthPoints: 90,
      lastWatered: Date.now()
    }
  ];

  updateElementState('greenhouse', { plants: testPlants, lastTended: Date.now() });

  let state = getCurrentUniverseState();
  assert(Boolean(state.elements.greenhouse), 'universe_states has greenhouse element');
  assert(state.elements.greenhouse.plants.length === 2, 'Greenhouse plants count matches');
  assert(state.elements.greenhouse.plants[0].name === 'Hydrangea Biru Ketenangan', 'Plant 1 name matches');
  assert(state.elements.greenhouse.plants[0].health === 100, 'Plant 1 health is recorded at 100%');

  console.log('\n================================================================');
  console.log('4. ACTIVITY B: FLOWER OF FEELINGS (SHADOW MEANINGS & MOOD)');
  console.log('================================================================');

  // Verify the 5 specific meanings requested in the prompt
  assert(GARDEN_FLOWERS.blue.meaning === 'Ketenangan', 'Blue Hydrangea represents Ketenangan');
  assert(GARDEN_FLOWERS.purple.meaning === 'Imajinasi', 'Purple Hydrangea represents Imajinasi');
  assert(GARDEN_FLOWERS.pink.meaning === 'Kehangatan', 'Pink Hydrangea represents Kehangatan');
  assert(GARDEN_FLOWERS.white.meaning === 'Ketulusan', 'White Hydrangea represents Ketulusan');
  assert(GARDEN_FLOWERS.snowdrop.meaning === 'Harapan Baru', 'Snowdrop represents Harapan Baru');

  // Test mood picking
  const moodChoice = {
    id: 'blue',
    name: 'Hydrangea Biru',
    meaning: 'Ketenangan',
    color: '#60a5fa',
    note: 'Malam ini jiwaku merasa tenang di bawah rembulan ☾',
    pickedAt: Date.now()
  };

  updateElementState('greenhouse', { moodFlower: moodChoice, moodHistory: [moodChoice] });
  state = getCurrentUniverseState();
  assert(state.elements.greenhouse.moodFlower.meaning === 'Ketenangan', 'Mood flower saved in universe_states');
  assert(state.elements.greenhouse.moodHistory.length === 1, 'Mood history tracked in universe_states');

  console.log('\n================================================================');
  console.log('5. ACTIVITY C: CREATE YOUR BOUQUET & GALLERY INTEGRATION');
  console.log('================================================================');

  const { addMoment, getMomentsFeed } = await import('./moments.js');

  const bouquetTitle = 'Buket Harapan Malam Lele';
  const bouquetDedication = 'Untuk sahabat-sahabat tercinta di seberang semesta';
  const testDataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  // Test saving bouquet to Lele's Personal Gallery via moments.js
  const newMoment = addMoment({
    author: 'lele',
    type: 'feed',
    isStory: false,
    location: 'Moonlit Hydrangea Garden · SHADOW',
    mediaUrl: testDataUrl,
    mediaType: 'image',
    mimeType: 'image/png',
    caption: `Buket Hydrangea: "${bouquetTitle}" 💐\nDedikasi: ${bouquetDedication} ✦ Dirangkai di Moonlit Hydrangea Garden.`
  });

  assert(Boolean(newMoment), 'addMoment successfully created gallery item for bouquet');
  assert(newMoment.author === 'lele', 'Bouquet gallery item is owned by Lele');
  assert(newMoment.caption.includes(bouquetTitle), 'Bouquet caption includes title');

  // Verify it appears in Lele's gallery feed
  const leleFeed = getMomentsFeed('lele');
  const foundBouquetInGallery = leleFeed.some(item => item.caption && item.caption.includes(bouquetTitle));
  assert(foundBouquetInGallery, 'Bouquet is retrievable from Lele Personal Gallery feed');

  // Also test storing bouquet in universe_states
  const bouquetRecord = {
    id: `bouquet-${Date.now()}`,
    title: bouquetTitle,
    dedication: bouquetDedication,
    flowers: ['blue', 'purple', 'snowdrop'],
    ribbon: 'lavender',
    imageDataUrl: testDataUrl,
    dateStr: '11 Nov 2026',
    createdAt: Date.now()
  };

  updateElementState('greenhouse', { bouquets: [bouquetRecord] });
  state = getCurrentUniverseState();
  assert(state.elements.greenhouse.bouquets.length === 1, 'Bouquet stored in universe_states greenhouse bouquets');
  assert(state.elements.greenhouse.bouquets[0].title === bouquetTitle, 'Bouquet title preserved in universe_states');

  console.log('\n================================================================');
  console.log('6. ACTIVITY D: MOONLIGHT POND IMMERSION & MEDITATION');
  console.log('================================================================');

  assert(indexHtml.includes('id="pond-reflection-card"'), 'Moonlight Pond has reflection card');
  assert(indexHtml.includes('id="btn-pond-meditate"'), 'Moonlight Pond has meditate button');
  assert(indexHtml.includes('id="btn-pond-back"'), 'Moonlight Pond has return button');
  assert(indexHtml.includes('pond-moon-reflection'), 'Moonlight Pond has moon reflection element');
  assert(indexHtml.includes('pond-floating-lotus'), 'Moonlight Pond has floating lotus flowers');
  assert(indexHtml.includes('pond-environment-backdrop'), 'Moonlight Pond has 2D fantasy environment backdrop layer');
  assert(indexHtml.includes('hydrangea_blossom.svg'), 'Moonlight Pond uses detailed multi-floret Hydrangea SVG blossoms');
  assert(indexHtml.includes('snowdrop_cluster.svg'), 'Moonlight Pond uses realistic nodding Snowdrop SVG clusters');
  assert(indexHtml.includes('pond_lotus_pad.svg'), 'Moonlight Pond uses floating water lily pad SVGs');
  assert(indexHtml.includes('pond-water-ripple-ring'), 'Moonlight Pond has organic concentric water ripple rings');
  assert(indexHtml.includes('pond-foreground-botanicals'), 'Moonlight Pond has foreground botanical clusters framing the scene');
  assert(cssContent.includes('shadow_moonlight_pond_bg.jpg'), 'shadow_garden.css references high-res 2D fantasy environment background');
  assert(cssContent.includes('.pond-svg-hydrangea'), 'shadow_garden.css styles detailed SVG hydrangea blossoms');
  assert(cssContent.includes('.pond-svg-snowdrop'), 'shadow_garden.css styles detailed SVG snowdrop clusters');
  assert(cssContent.includes('.view-moonlight-pond.is-sitting'), 'shadow_garden.css styles peaceful sitting mode');

  console.log('\n================================================================');
  console.log('7. FIRESTORE SECURITY RULES COMPATIBILITY');
  console.log('================================================================');

  const rulesContent = fs.readFileSync(path.resolve('./firestore.rules.final'), 'utf-8');

  // Verify universe_states elements keys allow greenhouse
  assert(rulesContent.includes("'greenhouse'"), "firestore.rules explicitly permits 'greenhouse' in elements");
  assert(rulesContent.includes("match /universe_states/{uid}"), 'universe_states security rule is defined');
  assert(rulesContent.includes("match /moments/{momentId}"), 'moments gallery security rule is preserved');

  console.log('\n================================================================');
  console.log(`HASIL AKHIR: ${passed}/${total} PENGUJIAN BERHASIL (100%)`);
  console.log('================================================================');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
