import assert from 'node:assert';
import fs from 'node:fs';
import {
  SHADOW_LOCATIONS,
  KIDULT_LOCATIONS,
  TOYOU_LOCATIONS
} from './universes_view.js';
import {
  TIME_CYCLES,
  WEATHER_MODES,
  LELE_OUTFITS,
  ROOM_DECOR_ITEMS,
  KITCHEN_RECIPES,
  TOWER_ROOMS,
  PLAYER_RADIUS
} from './shadow_crystal_tower_data.js';
import {
  createInitialTowerState,
  stepPlayerMovement,
  isPositionBlocked,
  transitionToRoom,
  getNearbyInteractable,
  startTimedActivity,
  cancelCurrentActivity,
  tickCrystalTowerState,
  craftKitchenRecipe,
  consumeInventoryItem,
  equipOutfit,
  toggleRoomDecoration,
  setTimeCycle,
  advanceTimeCycle,
  setWeatherMode,
  addJournalEntry,
  toggleFavoriteBook,
  recordBookRead,
  saveCrystalTowerProgress,
  loadCrystalTowerProgress,
  setCrystalIndexedDBProviderForTest
} from './shadow_crystal_tower_state.js';

let passed = 0;
let total = 0;

function check(cond, msg) {
  total++;
  if (cond) {
    passed++;
    console.log(`  ✓ PASS: ${msg}`);
  } else {
    console.error(`  ✗ FAIL: ${msg}`);
    throw new Error(msg);
  }
}

function createMockTowerPersistence() {
  const databases = new Map();
  const lsMap = new Map();

  globalThis.localStorage = {
    getItem: (k) => (lsMap.has(k) ? lsMap.get(k) : null),
    setItem: (k, v) => { lsMap.set(k, String(v)); },
    removeItem: (k) => { lsMap.delete(k); },
    clear: () => { lsMap.clear(); }
  };

  const mockIdb = {
    open(dbName, version = 1) {
      const req = { result: null, error: null, onupgradeneeded: null, onsuccess: null, onerror: null };
      queueMicrotask(() => {
        let dbState = databases.get(dbName);
        const upgrade = !dbState || dbState.version < version;
        if (!dbState) {
          dbState = { version, stores: new Map() };
          databases.set(dbName, dbState);
        }
        const handle = {
          objectStoreNames: { contains: (n) => dbState.stores.has(n) },
          createObjectStore(n, opts = {}) {
            if (!dbState.stores.has(n)) {
              dbState.stores.set(n, { keyPath: opts.keyPath || 'uid', records: new Map() });
            }
            return {};
          },
          transaction(storeName) {
            const name = Array.isArray(storeName) ? storeName[0] : storeName;
            const tx = { oncomplete: null, onerror: null, objectStore() {
              const s = dbState.stores.get(name);
              return {
                put(rec) {
                  s.records.set(rec[s.keyPath], JSON.parse(JSON.stringify(rec)));
                  queueMicrotask(() => { if (tx.oncomplete) tx.oncomplete(); });
                  return {};
                },
                get(key) {
                  const gr = { result: s.records.get(key), onsuccess: null, onerror: null };
                  queueMicrotask(() => {
                    if (gr.onsuccess) gr.onsuccess();
                    if (tx.oncomplete) tx.oncomplete();
                  });
                  return gr;
                }
              };
            } };
            return tx;
          }
        };
        req.result = handle;
        if (upgrade && req.onupgradeneeded) req.onupgradeneeded({ target: req });
        if (req.onsuccess) req.onsuccess({ target: req });
      });
      return req;
    }
  };

  return { mockIdb, databases, lsMap };
}

async function runTests() {
  const persist = createMockTowerPersistence();
  setCrystalIndexedDBProviderForTest(persist.mockIdb);

  console.log('================================================================');
  console.log('1. SHADOW HOTSPOT INTEGRATION & OTHER UNIVERSES ISOLATION');
  console.log('================================================================');
  check(SHADOW_LOCATIONS.rumah_kristal.actionType === 'shadow_crystal_tower', 'SHADOW rumah_kristal launches 2D Crystal Tower game');
  check(SHADOW_LOCATIONS.galeri_seni.actionType === 'shadow_art_gallery', 'SHADOW Moonlit Art Gallery untouched');
  check(SHADOW_LOCATIONS.gazebo.actionType === 'shadow_gazebo', 'SHADOW Gazebo untouched');
  check(SHADOW_LOCATIONS.ladang_bunga.actionType === 'shadow_garden', 'SHADOW Moonlit Hydrangea Garden untouched');
  check(SHADOW_LOCATIONS.kotak_pos.actionType === 'kotak_pos', 'SHADOW Kotak Pos untouched');
  check(KIDULT_LOCATIONS.rumah.actionType === 'orbit', 'KIDULT locations untouched');
  check(TOYOU_LOCATIONS.rumah.actionType === 'orbit', 'TO YOU locations untouched');

  console.log('\n================================================================');
  console.log('2. DOM, CSS & MOBILE/KEYBOARD STRUCTURE');
  console.log('================================================================');
  const html = fs.readFileSync('./index.html', 'utf8');
  const css = fs.readFileSync('./shadow_crystal_tower.css', 'utf8');
  const viewSrc = fs.readFileSync('./shadow_crystal_tower_view.js', 'utf8');
  const rendererSrc = fs.readFileSync('./shadow_crystal_tower_renderer.js', 'utf8');
  const audioSrc = fs.readFileSync('./shadow_crystal_tower_audio.js', 'utf8');
  const stateSrc = fs.readFileSync('./shadow_crystal_tower_state.js', 'utf8');

  check(html.includes('id="view-shadow-crystal-tower"'), 'index.html contains view-shadow-crystal-tower');
  check(html.includes('id="crystal-tower-canvas"'), 'index.html contains 2D game canvas');
  check(html.includes('id="crystal-touch-controls"') && html.includes('data-dir="up"'), 'index.html contains mobile D-pad touch controls');
  check(html.includes('id="btn-crystal-touch-interact"'), 'index.html contains mobile touch interact button');
  check(html.includes('id="btn-crystal-pause-menu"'), 'index.html contains pause menu trigger');
  check(css.includes('.crystal-dpad') && css.includes('#crystal-tower-canvas'), 'CSS styles responsive canvas frame & D-pad');
  check(viewSrc.includes("KeyW") && viewSrc.includes("ArrowUp") && viewSrc.includes("KeyE") && viewSrc.includes("Escape"), 'View handles WASD/Arrow, E interact, ESC pause');

  console.log('\n================================================================');
  console.log('3. BEDROOM 4-DIRECTION MOVEMENT, COLLISION & INTERACTION');
  console.log('================================================================');
  const st = createInitialTowerState('1ArxphLQpAOoOIvH9BKYw0ebD1e2');
  check(st.currentRoom === 'bedroom', 'Player spawns inside Bedroom initially');
  check(!isPositionBlocked('bedroom', st.player.x, st.player.y, PLAYER_RADIUS), 'Bedroom spawn position is unobstructed');

  // Test all 4 movement directions
  const startY = st.player.y;
  stepPlayerMovement(st, { dx: 0, dy: -1 }, 0.05);
  check(st.player.y < startY && st.player.facing === 'up', 'Move UP updates position and facing=up');

  const upY = st.player.y;
  stepPlayerMovement(st, { dx: 0, dy: 1 }, 0.05);
  check(st.player.y > upY && st.player.facing === 'down', 'Move DOWN updates position and facing=down');

  const startX = st.player.x;
  stepPlayerMovement(st, { dx: -1, dy: 0 }, 0.05);
  check(st.player.x < startX && st.player.facing === 'left', 'Move LEFT updates position and facing=left');

  const leftX = st.player.x;
  stepPlayerMovement(st, { dx: 1, dy: 0 }, 0.05);
  check(st.player.x > leftX && st.player.facing === 'right', 'Move RIGHT updates position and facing=right');

  // Test wall collision clamping
  st.player.x = TOWER_ROOMS.bedroom.bounds.minX + PLAYER_RADIUS + 1;
  stepPlayerMovement(st, { dx: -1, dy: 0 }, 0.08);
  check(st.player.x >= TOWER_ROOMS.bedroom.bounds.minX + PLAYER_RADIUS, 'Wall collision prevents escaping left room boundary');

  // Test furniture collision against Bed collider (x: 678..846, y: 132..258)
  st.player.x = 660;
  st.player.y = 195;
  stepPlayerMovement(st, { dx: 1, dy: 0 }, 0.08);
  check(!isPositionBlocked('bedroom', st.player.x, st.player.y, PLAYER_RADIUS), 'Furniture collision prevents walking through solid Bed collider');

  // Test proximity detection near Bedroom Wardrobe
  st.player.x = 155;
  st.player.y = 212;
  const nearWardrobe = getNearbyInteractable(st);
  check(nearWardrobe && nearWardrobe.id === 'wardrobe', 'Proximity detects Wardrobe inside Bedroom');

  console.log('\n================================================================');
  console.log('4. CONNECTED 6 ROOMS & PORTAL TRANSITIONS');
  console.log('================================================================');
  check(Object.keys(TOWER_ROOMS).length === 6, 'All 6 Tower rooms defined (bedroom, living_room, kitchen, library, bathroom, balcony)');

  // Bedroom -> Living Room via south portal (x: 425..535, y: 516..554)
  st.player.x = 480;
  st.player.y = 515;
  const toLiving = stepPlayerMovement(st, { dx: 0, dy: 1 }, 0.05);
  check(toLiving.triggeredPortal && st.currentRoom === 'living_room', 'Walking into Bedroom south door transitions to Living Room');
  check(!isPositionBlocked('living_room', st.player.x, st.player.y, PLAYER_RADIUS), 'Living Room spawn is collision-free');

  // Living Room -> Kitchen
  st.player.x = 865;
  st.player.y = 330;
  const toKitchen = stepPlayerMovement(st, { dx: 1, dy: 0 }, 0.08);
  check(toKitchen.triggeredPortal && st.currentRoom === 'kitchen', 'Walking east from Living Room transitions to Kitchen');

  // Kitchen -> Living Room -> Library
  transitionToRoom(st, 'living_room');
  st.player.x = 480;
  st.player.y = 515;
  const toLibrary = stepPlayerMovement(st, { dx: 0, dy: 1 }, 0.05);
  check(toLibrary.triggeredPortal && st.currentRoom === 'library', 'Walking south from Living Room transitions to Private Library');

  // Bedroom -> Bathroom & Bedroom -> Balcony
  transitionToRoom(st, 'bedroom');
  st.player.x = 84;
  st.player.y = 462;
  const toBath = stepPlayerMovement(st, { dx: -1, dy: 0 }, 0.05);
  check(toBath.triggeredPortal && st.currentRoom === 'bathroom', 'Walking west door transitions from Bedroom to Crystal Bathroom');

  transitionToRoom(st, 'bedroom');
  st.player.x = 290;
  st.player.y = 156;
  const toBalcony = stepPlayerMovement(st, { dx: 0, dy: -1 }, 0.05);
  check(toBalcony.triggeredPortal && st.currentRoom === 'balcony', 'Walking north crystal door transitions from Bedroom to Crystal Balcony');

  console.log('\n================================================================');
  console.log('5. ACTIVITIES, POSES, RECIPES, INVENTORY & ATMOSPHERE');
  console.log('================================================================');
  transitionToRoom(st, 'bedroom');
  const bedObj = TOWER_ROOMS.bedroom.objects.find((o) => o.id === 'bed');
  st.player.x = 760;
  st.player.y = 278;
  startTimedActivity(st, bedObj, { summaryText: 'Tidur di Kasur Kristal' });
  check(st.player.pose === 'sleep' && st.activeActivity !== null, 'Bed interaction switches Lele sprite pose to sleep');

  // Canceling or moving during sleep exits safely onto walkable floor
  stepPlayerMovement(st, { dx: 0, dy: 1 }, 0.05);
  check(st.activeActivity === null && st.player.pose === 'walk' && !isPositionBlocked('bedroom', st.player.x, st.player.y, PLAYER_RADIUS), 'Moving during activity cleanly restores walkable position');

  // Complete a kitchen recipe & verify inventory + log + consumption
  transitionToRoom(st, 'kitchen');
  const recipe = KITCHEN_RECIPES[0];
  const craftRes = craftKitchenRecipe(st, recipe.id);
  check(craftRes.ok && st.player.pose === 'brew', 'Kitchen crafting starts brew animation');
  const completedRecipe = tickCrystalTowerState(st, recipe.durationMs + 50);
  check(completedRecipe && st.inventory.some((i) => i.id === recipe.id && i.count >= 1), 'Completed cooking adds crafted drink/food to Inventory');

  const drinkRes = consumeInventoryItem(st, recipe.id);
  check(drinkRes.ok, 'Crafted tea/snack can be consumed from Inventory');

  // Test Outfit, Room Decor, Journal, Books, Time Cycle & Weather
  const eq = equipOutfit(st, LELE_OUTFITS[1].id);
  check(eq && st.player.outfitId === LELE_OUTFITS[1].id, 'Wardrobe changes active character outfit ID');

  const decRes = toggleRoomDecoration(st, ROOM_DECOR_ITEMS[2].id);
  check(decRes && decRes.active && st.equippedDecorations.includes(ROOM_DECOR_ITEMS[2].id), 'Bedroom decor pedestal toggles room decorations');

  const jrn = addJournalEntry(st, 'Malam yang damai di menara kristal.');
  check(Boolean(jrn) && st.journalEntries.length === 1, 'Study desk saves journal entries');

  toggleFavoriteBook(st, 'book-crystal-tower-lore');
  recordBookRead(st, { id: 'book-crystal-tower-lore', title: 'Kronik Menara Kristal', author: 'Lele' });
  check(st.favoriteBooks.includes('book-crystal-tower-lore') && st.readingHistory.length === 1, 'Library favorites and reading history update properly');

  const nextTime = advanceTimeCycle(st);
  setWeatherMode(st, 'rain');
  check(TIME_CYCLES.some((t) => t.id === nextTime.id) && st.weather === 'rain', 'Time cycle & Rain weather state update cleanly');

  console.log('\n================================================================');
  console.log('6. UID-ISOLATED PERSISTENCE & ZERO FIREBASE STORAGE CHECK');
  console.log('================================================================');
  transitionToRoom(st, 'library');
  await saveCrystalTowerProgress(st, { viewerChar: 'lele', syncCloudSummary: false });

  const reloadedLele = await loadCrystalTowerProgress('lele');
  check(reloadedLele.currentRoom === 'library', 'Last room persists across simulated refresh for Lele UID');
  check(reloadedLele.player.outfitId === LELE_OUTFITS[1].id, 'Equipped outfit persists across refresh');
  check(reloadedLele.journalEntries.length === 1 && reloadedLele.weather === 'rain', 'Journal, decorations & atmosphere persist across refresh');

  const isolatedNyanya = await loadCrystalTowerProgress('nyanya');
  check(isolatedNyanya.uid !== reloadedLele.uid, 'Strict UID isolation separates Nyanya UID from Lele UID');
  check(isolatedNyanya.currentRoom === 'bedroom' && isolatedNyanya.journalEntries.length === 0, 'Nyanya state stays completely isolated from Lele progress');

  check(
    !stateSrc.includes('firebase/storage') &&
    !rendererSrc.includes('firebase/storage') &&
    !viewSrc.includes('firebase/storage'),
    'Zero Firebase Storage imports/calls in Crystal Tower game modules'
  );
  const { createCrystalTowerAudioEngine } = await import('./shadow_crystal_tower_audio.js');
  const audioStatus = createCrystalTowerAudioEngine().getStatus();
  check(!audioStatus.isMusicPlaying && !audioStatus.isAmbiencePlaying && audioSrc.includes('unlockOnUserGesture'), 'Web Audio synthesizer never autoplays before user interaction');

  console.log('\n================================================================');
  console.log(`HASIL AKHIR: ${passed}/${total} PENGUJIAN BERHASIL (100%)`);
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
