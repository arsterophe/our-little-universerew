/**
 * SHADOW — CRYSTAL TOWER LIFE SIMULATION: GAME ENGINE, PHYSICS & PERSISTENCE
 *
 * Pure deterministic 2D movement, AABB collision with axis sliding,
 * portal transitions, modular interaction resolution, activity lifecycle,
 * time/weather cycles, inventory/collections, and UID-isolated persistence
 * (IndexedDB + localStorage fallback + non-destructive universe_states summary).
 *
 * ZERO Firebase Storage usage.
 */

import {
  auth,
  CANONICAL_CHARACTERS,
  getVerifiedCharacterKey
} from './firebase.js';
import {
  getCurrentUniverseState,
  updateElementState
} from './universe_state.js';
import {
  TOWER_WORLD_WIDTH,
  TOWER_WORLD_HEIGHT,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  DEFAULT_INTERACT_DISTANCE,
  TIME_CYCLES,
  WEATHER_MODES,
  LELE_OUTFITS,
  ROOM_DECOR_ITEMS,
  KITCHEN_RECIPES,
  INITIAL_INVENTORY_ITEMS,
  TOWER_ROOMS
} from './shadow_crystal_tower_data.js';

const IDB_NAME = 'olu_shadow_crystal_tower_db_v1';
const IDB_VERSION = 1;
const IDB_STORE_SAVES = 'tower_saves';
const LS_SAVE_PREFIX = 'olu_shadow_crystal_tower_save_v1_';

let customIdbProvider = undefined;
let idbPromise = null;
const listeners = new Set();

function getActiveIndexedDBFactory() {
  if (customIdbProvider !== undefined) return customIdbProvider;
  if (typeof indexedDB !== 'undefined') return indexedDB;
  return null;
}

export function resolveCrystalViewerCharacter() {
  if (auth && auth.currentUser) {
    const verified = getVerifiedCharacterKey(auth.currentUser);
    if (verified) return verified;
  }
  try {
    if (typeof sessionStorage !== 'undefined') {
      const s = sessionStorage.getItem('activeUniverseSession');
      if (s === 'nyanya' || s === 'lala' || s === 'lele') return s;
    }
    if (typeof localStorage !== 'undefined') {
      const l = localStorage.getItem('olu_moments_active_char_v1');
      if (l === 'nyanya' || l === 'lala' || l === 'lele') return l;
    }
  } catch (_) {}
  return 'lele';
}

export function resolveCrystalOwnerUid(viewerChar = resolveCrystalViewerCharacter()) {
  if (auth && auth.currentUser && auth.currentUser.uid) {
    return String(auth.currentUser.uid);
  }
  if (viewerChar === 'lele' || viewerChar === 'nyanya' || viewerChar === 'lala') {
    const canonical = CANONICAL_CHARACTERS && CANONICAL_CHARACTERS[viewerChar];
    if (canonical && canonical.uid) return String(canonical.uid);
  }
  return 'visitor_anonymous';
}

export function createInitialTowerState(uid = resolveCrystalOwnerUid()) {
  const spawn = TOWER_ROOMS.bedroom.defaultSpawn;
  return {
    uid: String(uid || 'visitor_anonymous'),
    version: 1,
    currentRoom: 'bedroom',
    player: {
      x: spawn.x,
      y: spawn.y,
      facing: spawn.facing || 'down',
      pose: 'idle', // idle | walk | sleep | sit | read | write | cook | brew | bathe | stargaze | clean | dress
      isMoving: false,
      walkPhase: 0,
      outfitId: 'eclipse_cloak'
    },
    timeOfDay: 'night',
    weather: 'clear',
    moodEnergy: 88,
    crystalResonance: 98,
    equippedDecorations: ['crescent_crystal', 'amethyst_geode'],
    inventory: INITIAL_INVENTORY_ITEMS.map((item) => ({ ...item })),
    favoriteBooks: [],
    readingHistory: [],
    journalEntries: [],
    activityLog: [],
    unlockedCollections: ['Fragmen Kristal Bulan', 'Kronik Menara Kristal'],
    activeActivity: null,
    preActivityPos: null,
    settings: {
      musicEnabled: false,
      ambienceEnabled: false,
      masterVolume: 0.65,
      isMuted: false,
      showMobileControls: false
    },
    lastSavedAt: Date.now()
  };
}

function normalizeTowerState(raw, uid) {
  const base = createInitialTowerState(uid);
  if (!raw || typeof raw !== 'object') return base;

  const validRoom = TOWER_ROOMS[raw.currentRoom] ? raw.currentRoom : 'bedroom';
  const roomDef = TOWER_ROOMS[validRoom];
  const rawPlayer = raw.player && typeof raw.player === 'object' ? raw.player : {};
  const validOutfit = LELE_OUTFITS.some((o) => o.id === rawPlayer.outfitId)
    ? rawPlayer.outfitId
    : base.player.outfitId;

  const clampedX = Math.max(
    roomDef.bounds.minX + PLAYER_RADIUS,
    Math.min(roomDef.bounds.maxX - PLAYER_RADIUS, Number(rawPlayer.x || roomDef.defaultSpawn.x))
  );
  const clampedY = Math.max(
    roomDef.bounds.minY + PLAYER_RADIUS,
    Math.min(roomDef.bounds.maxY - PLAYER_RADIUS, Number(rawPlayer.y || roomDef.defaultSpawn.y))
  );

  // Never restore inside a collider or portal trigger on reload
  const safePos = findSafeFloorPosition(validRoom, clampedX, clampedY, roomDef.defaultSpawn);

  return {
    ...base,
    uid: String(uid),
    currentRoom: validRoom,
    player: {
      x: safePos.x,
      y: safePos.y,
      facing: ['up', 'down', 'left', 'right'].includes(rawPlayer.facing) ? rawPlayer.facing : 'down',
      pose: 'idle',
      isMoving: false,
      walkPhase: 0,
      outfitId: validOutfit
    },
    timeOfDay: TIME_CYCLES.some((t) => t.id === raw.timeOfDay) ? raw.timeOfDay : 'night',
    weather: WEATHER_MODES.some((w) => w.id === raw.weather) ? raw.weather : 'clear',
    moodEnergy: Number.isFinite(Number(raw.moodEnergy)) ? Math.max(0, Math.min(100, Number(raw.moodEnergy))) : 88,
    crystalResonance: Number.isFinite(Number(raw.crystalResonance)) ? Math.max(0, Math.min(100, Number(raw.crystalResonance))) : 98,
    equippedDecorations: Array.isArray(raw.equippedDecorations)
      ? raw.equippedDecorations.filter((id) => ROOM_DECOR_ITEMS.some((d) => d.id === id))
      : base.equippedDecorations,
    inventory: Array.isArray(raw.inventory) && raw.inventory.length > 0
      ? raw.inventory.map((i) => ({ ...i }))
      : base.inventory,
    favoriteBooks: Array.isArray(raw.favoriteBooks) ? [...raw.favoriteBooks] : [],
    readingHistory: Array.isArray(raw.readingHistory) ? raw.readingHistory.slice(0, 30) : [],
    journalEntries: Array.isArray(raw.journalEntries) ? raw.journalEntries.slice(0, 40) : [],
    activityLog: Array.isArray(raw.activityLog) ? raw.activityLog.slice(0, 40) : [],
    unlockedCollections: Array.isArray(raw.unlockedCollections) ? [...raw.unlockedCollections] : base.unlockedCollections,
    activeActivity: null,
    preActivityPos: null,
    settings: {
      ...base.settings,
      ...(raw.settings && typeof raw.settings === 'object' ? raw.settings : {}),
      musicEnabled: false, // Never autoplay audio across reloads
      ambienceEnabled: false
    },
    lastSavedAt: Number(raw.lastSavedAt || Date.now())
  };
}

// ============================================================================
// COLLISION, PHYSICS & ROOM NAVIGATION
// ============================================================================

export function circleIntersectsRect(cx, cy, radius, rect) {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return (dx * dx + dy * dy) < (radius * radius);
}

export function pointInRect(px, py, rect) {
  return px >= rect.x && px <= rect.x + rect.w && py >= rect.y && py <= rect.y + rect.h;
}

export function isPositionBlocked(roomId, x, y, radius = PLAYER_RADIUS) {
  const room = TOWER_ROOMS[roomId];
  if (!room) return true;
  const b = room.bounds;
  if (x - radius < b.minX || x + radius > b.maxX || y - radius < b.minY || y + radius > b.maxY) {
    return true;
  }
  for (const col of room.colliders) {
    if (circleIntersectsRect(x, y, radius, col)) {
      return true;
    }
  }
  return false;
}

function findSafeFloorPosition(roomId, x, y, fallback) {
  if (!isPositionBlocked(roomId, x, y, PLAYER_RADIUS)) {
    return { x, y };
  }
  return { x: fallback.x, y: fallback.y };
}

/**
 * Advances character 4-directional movement with smooth axis-separated collision
 * sliding and portal detection.
 * Returns `{ moved, triggeredPortal }`
 */
export function stepPlayerMovement(state, inputVec, dtSec = 0.016) {
  if (!state || !state.player) return { moved: false, triggeredPortal: null };
  const room = TOWER_ROOMS[state.currentRoom];
  if (!room) return { moved: false, triggeredPortal: null };

  let dx = Number(inputVec?.dx || 0);
  let dy = Number(inputVec?.dy || 0);

  if (dx === 0 && dy === 0) {
    if (state.player.isMoving) {
      state.player.isMoving = false;
      if (!state.activeActivity) state.player.pose = 'idle';
    }
    return { moved: false, triggeredPortal: null };
  }

  // If the player was performing a stationary activity (sit/sleep/bathe/read/cook/stargaze),
  // pressing movement exits the activity smoothly back onto walkable floor.
  if (state.activeActivity) {
    cancelCurrentActivity(state);
  }

  // Normalize diagonal vectors so speed stays consistent
  const mag = Math.hypot(dx, dy);
  if (mag > 0) {
    dx /= mag;
    dy /= mag;
  }

  // Determine facing direction
  if (Math.abs(dx) > Math.abs(dy)) {
    state.player.facing = dx < 0 ? 'left' : 'right';
  } else {
    state.player.facing = dy < 0 ? 'up' : 'down';
  }

  const dist = PLAYER_SPEED * Math.min(0.08, Math.max(0.001, Number(dtSec || 0.016)));
  const prevX = state.player.x;
  const prevY = state.player.y;

  // Axis-separated movement (X then Y) for crisp corner sliding
  const tryX = Math.max(
    room.bounds.minX + PLAYER_RADIUS,
    Math.min(room.bounds.maxX - PLAYER_RADIUS, prevX + dx * dist)
  );
  if (!isPositionBlocked(state.currentRoom, tryX, prevY, PLAYER_RADIUS)) {
    state.player.x = tryX;
  }

  const tryY = Math.max(
    room.bounds.minY + PLAYER_RADIUS,
    Math.min(room.bounds.maxY - PLAYER_RADIUS, prevY + dy * dist)
  );
  if (!isPositionBlocked(state.currentRoom, state.player.x, tryY, PLAYER_RADIUS)) {
    state.player.y = tryY;
  }

  const actuallyMoved = Math.hypot(state.player.x - prevX, state.player.y - prevY) > 0.05;
  state.player.isMoving = actuallyMoved;
  state.player.pose = actuallyMoved ? 'walk' : 'idle';
  if (actuallyMoved) {
    state.player.walkPhase = (state.player.walkPhase + dist * 0.09) % (Math.PI * 2);
  }

  // Check portal doorway triggers
  for (const portal of room.portals) {
    if (pointInRect(state.player.x, state.player.y, portal)) {
      transitionToRoom(state, portal.targetRoom, portal.spawn);
      return { moved: true, triggeredPortal: portal };
    }
  }

  return { moved: actuallyMoved, triggeredPortal: null };
}

export function transitionToRoom(state, targetRoomId, customSpawn = null) {
  const target = TOWER_ROOMS[targetRoomId];
  if (!target || !state) return false;
  if (state.activeActivity) {
    cancelCurrentActivity(state);
  }
  const sp = customSpawn || target.defaultSpawn;
  state.currentRoom = target.id;
  state.player.x = sp.x;
  state.player.y = sp.y;
  state.player.facing = sp.facing || target.defaultSpawn.facing || 'down';
  state.player.pose = 'idle';
  state.player.isMoving = false;
  state.preActivityPos = null;
  state.lastSavedAt = Date.now();
  return true;
}

export function getNearbyInteractable(state) {
  if (!state || !state.player) return null;
  const room = TOWER_ROOMS[state.currentRoom];
  if (!room) return null;

  let best = null;
  let bestDist = Infinity;
  for (const obj of room.objects) {
    const ix = Number(obj.interactX ?? (obj.x + obj.w / 2));
    const iy = Number(obj.interactY ?? (obj.y + obj.h / 2));
    const maxR = Number(obj.radius || DEFAULT_INTERACT_DISTANCE);
    const d = Math.hypot(state.player.x - ix, state.player.y - iy);
    if (d <= maxR && d < bestDist) {
      bestDist = d;
      best = obj;
    }
  }
  return best;
}

export function getNearbyPortalHint(state) {
  if (!state || !state.player) return null;
  const room = TOWER_ROOMS[state.currentRoom];
  if (!room) return null;
  for (const p of room.portals) {
    const cx = p.x + p.w / 2;
    const cy = p.y + p.h / 2;
    if (Math.hypot(state.player.x - cx, state.player.y - cy) < 88) {
      return p;
    }
  }
  return null;
}

// ============================================================================
// INVENTORY, COLLECTIONS & LIFE-SIM ACTIVITY ENGINE
// ============================================================================

export function addInventoryItem(state, { id, name, category = 'hasil', desc = '', delta = 1 }) {
  if (!state || !id) return null;
  const existing = state.inventory.find((i) => i.id === id);
  if (existing) {
    existing.count = Math.max(0, Number(existing.count || 0) + Number(delta || 1));
  } else {
    state.inventory.push({
      id,
      name: name || id,
      category,
      desc,
      count: Math.max(1, Number(delta || 1))
    });
  }
  if (name && category !== 'bahan' && !state.unlockedCollections.includes(name)) {
    state.unlockedCollections.push(name);
  }
  return state.inventory.find((i) => i.id === id);
}

export function consumeInventoryItem(state, itemId) {
  if (!state || !itemId) return { ok: false, message: 'Item tidak ditemukan.' };
  const idx = state.inventory.findIndex((i) => i.id === itemId && i.count > 0);
  if (idx === -1) return { ok: false, message: 'Stok item habis atau belum dibuat di dapur.' };
  const item = state.inventory[idx];
  item.count -= 1;
  state.moodEnergy = Math.min(100, (state.moodEnergy || 80) + 12);
  appendActivityLog(state, `Menikmati ${item.name}`);
  if (item.count <= 0 && item.category !== 'bahan') {
    state.inventory.splice(idx, 1);
  }
  return { ok: true, itemName: item.name };
}

export function appendActivityLog(state, summary, category = 'activity') {
  if (!state || !summary) return;
  state.activityLog.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    room: state.currentRoom,
    category,
    summary: String(summary),
    timestamp: Date.now()
  });
  if (state.activityLog.length > 40) {
    state.activityLog.length = 40;
  }
}

export function startTimedActivity(state, obj, customConfig = {}) {
  if (!state || !obj) return null;

  if (!state.preActivityPos) {
    state.preActivityPos = {
      x: state.player.x,
      y: state.player.y,
      facing: state.player.facing
    };
  }

  // Visually place character onto object spot (e.g. bed, sofa, chair, bathtub, stove front)
  if (Number.isFinite(obj.spotX) && Number.isFinite(obj.spotY)) {
    state.player.x = obj.spotX;
    state.player.y = obj.spotY;
  }
  state.player.isMoving = false;
  state.player.pose = customConfig.pose || obj.pose || 'idle';

  const durationMs = Number(customConfig.durationMs ?? obj.durationMs ?? 2400);
  state.activeActivity = {
    id: customConfig.id || obj.id,
    kind: customConfig.kind || obj.kind,
    objectId: obj.id,
    objectName: obj.name,
    label: customConfig.label || obj.actionLabel,
    pose: state.player.pose,
    elapsedMs: 0,
    durationMs: Math.max(500, durationMs),
    progress: 0,
    reward: customConfig.reward || null,
    summaryText: customConfig.summaryText || `Menyelesaikan ${obj.actionLabel} di ${obj.name}`
  };
  return state.activeActivity;
}

export function cancelCurrentActivity(state) {
  if (!state || !state.activeActivity) return false;
  if (state.preActivityPos) {
    state.player.x = state.preActivityPos.x;
    state.player.y = state.preActivityPos.y;
    state.player.facing = state.preActivityPos.facing || state.player.facing;
  }
  state.preActivityPos = null;
  state.activeActivity = null;
  state.player.pose = 'idle';
  state.player.isMoving = false;
  return true;
}

export function completeCurrentActivity(state) {
  if (!state || !state.activeActivity) return null;
  const completed = { ...state.activeActivity };

  if (completed.reward) {
    addInventoryItem(state, completed.reward);
  }

  if (completed.kind === 'sleep') {
    state.moodEnergy = 100;
  } else {
    state.moodEnergy = Math.min(100, (state.moodEnergy || 80) + 8);
  }

  if (completed.kind === 'harvest_crystal') {
    state.crystalResonance = 100;
  }

  appendActivityLog(state, completed.summaryText, completed.kind);

  // Return player safely to walkable floor right beside the object
  if (state.preActivityPos) {
    state.player.x = state.preActivityPos.x;
    state.player.y = state.preActivityPos.y;
    state.player.facing = state.preActivityPos.facing || state.player.facing;
  }
  state.preActivityPos = null;
  state.activeActivity = null;
  state.player.pose = 'idle';
  state.player.isMoving = false;
  state.lastSavedAt = Date.now();
  return completed;
}

export function tickCrystalTowerState(state, dtMs = 16) {
  if (!state || !state.activeActivity) return null;
  state.activeActivity.elapsedMs += Math.max(0, Number(dtMs || 0));
  state.activeActivity.progress = Math.min(
    1,
    state.activeActivity.elapsedMs / Math.max(1, state.activeActivity.durationMs)
  );
  if (state.activeActivity.elapsedMs >= state.activeActivity.durationMs) {
    return completeCurrentActivity(state);
  }
  return null;
}

export function craftKitchenRecipe(state, recipeId, stoveObj) {
  const recipe = KITCHEN_RECIPES.find((r) => r.id === recipeId);
  if (!recipe) return { ok: false, error: 'Resep tidak ditemukan.' };

  const obj = stoveObj || TOWER_ROOMS.kitchen.objects.find((o) => o.id === 'stove');
  startTimedActivity(state, obj, {
    id: `recipe_${recipe.id}`,
    kind: recipe.type,
    label: `${recipe.type === 'brew' ? 'Menyeduh' : 'Memasak'} ${recipe.name}...`,
    pose: recipe.type === 'brew' ? 'brew' : 'cook',
    durationMs: recipe.durationMs,
    summaryText: `Berhasil membuat ${recipe.name} di Dapur Kristal`,
    reward: {
      id: recipe.id,
      name: recipe.name,
      category: recipe.category,
      desc: recipe.desc,
      delta: 1
    }
  });
  return { ok: true, recipe };
}

export function equipOutfit(state, outfitId) {
  const outfit = LELE_OUTFITS.find((o) => o.id === outfitId);
  if (!outfit || !state) return null;
  state.player.outfitId = outfit.id;
  appendActivityLog(state, `Mengganti pakaian menjadi ${outfit.name}`, 'wardrobe');
  state.lastSavedAt = Date.now();
  return outfit;
}

export function toggleRoomDecoration(state, decorId) {
  const decor = ROOM_DECOR_ITEMS.find((d) => d.id === decorId);
  if (!decor || !state) return null;
  const idx = state.equippedDecorations.indexOf(decorId);
  let active = false;
  if (idx >= 0) {
    state.equippedDecorations.splice(idx, 1);
    appendActivityLog(state, `Menyimpan dekorasi kamar: ${decor.name}`, 'decor');
  } else {
    state.equippedDecorations.push(decorId);
    active = true;
    if (!state.unlockedCollections.includes(decor.name)) {
      state.unlockedCollections.push(decor.name);
    }
    appendActivityLog(state, `Memasang dekorasi kamar: ${decor.name}`, 'decor');
  }
  state.lastSavedAt = Date.now();
  return { decor, active };
}

export function setTimeCycle(state, timeId) {
  const found = TIME_CYCLES.find((t) => t.id === timeId);
  if (!found || !state) return null;
  state.timeOfDay = found.id;
  appendActivityLog(state, `Suasana menara beralih ke ${found.label}`, 'atmosphere');
  return found;
}

export function advanceTimeCycle(state) {
  if (!state) return null;
  const idx = TIME_CYCLES.findIndex((t) => t.id === state.timeOfDay);
  const next = TIME_CYCLES[(idx + 1) % TIME_CYCLES.length];
  state.timeOfDay = next.id;
  appendActivityLog(state, `Waktu menara berganti menjadi ${next.label}`, 'atmosphere');
  return next;
}

export function setWeatherMode(state, weatherId) {
  const found = WEATHER_MODES.find((w) => w.id === weatherId);
  if (!found || !state) return null;
  state.weather = found.id;
  appendActivityLog(state, `Cuaca luar menara berubah menjadi ${found.label}`, 'atmosphere');
  return found;
}

export function addJournalEntry(state, text) {
  const clean = String(text || '').trim();
  if (!clean || !state) return null;
  const entry = {
    id: `jrn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    text: clean.slice(0, 1200),
    timeOfDay: state.timeOfDay,
    weather: state.weather,
    createdAt: Date.now()
  };
  state.journalEntries.unshift(entry);
  if (state.journalEntries.length > 40) state.journalEntries.length = 40;
  appendActivityLog(state, `Menulis catatan jurnal malam di Meja Belajar`, 'journal');
  state.lastSavedAt = Date.now();
  return entry;
}

export function toggleFavoriteBook(state, bookId) {
  if (!state || !bookId) return false;
  const idx = state.favoriteBooks.indexOf(bookId);
  if (idx >= 0) {
    state.favoriteBooks.splice(idx, 1);
    return false;
  }
  state.favoriteBooks.push(bookId);
  return true;
}

export function recordBookRead(state, bookMeta) {
  if (!state || !bookMeta || !bookMeta.id) return null;
  const existingIdx = state.readingHistory.findIndex((b) => b.id === bookMeta.id);
  const rec = {
    id: bookMeta.id,
    title: String(bookMeta.title || 'Buku'),
    author: String(bookMeta.author || 'Lele'),
    lastReadAt: Date.now()
  };
  if (existingIdx >= 0) {
    state.readingHistory.splice(existingIdx, 1);
  }
  state.readingHistory.unshift(rec);
  if (state.readingHistory.length > 30) state.readingHistory.length = 30;
  appendActivityLog(state, `Membaca "${rec.title}"`, 'read');
  return rec;
}

// ============================================================================
// UID-ISOLATED INDEXEDDB & LOCALSTORAGE PERSISTENCE + FIRESTORE SUMMARY SYNC
// ============================================================================

function openTowerIdb() {
  const idbFactory = getActiveIndexedDBFactory();
  if (!idbFactory) return Promise.resolve(null);
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve) => {
    try {
      const req = idbFactory.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE_SAVES)) {
          db.createObjectStore(IDB_STORE_SAVES, { keyPath: 'uid' });
        }
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = () => {
        idbPromise = null;
        resolve(null);
      };
    } catch (_) {
      idbPromise = null;
      resolve(null);
    }
  });
  return idbPromise;
}

async function idbPutTowerSave(record) {
  const idb = await openTowerIdb();
  if (!idb) return false;
  return new Promise((resolve) => {
    try {
      const tx = idb.transaction(IDB_STORE_SAVES, 'readwrite');
      tx.objectStore(IDB_STORE_SAVES).put(record);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

async function idbGetTowerSave(uid) {
  const idb = await openTowerIdb();
  if (!idb) return null;
  return new Promise((resolve) => {
    try {
      const tx = idb.transaction(IDB_STORE_SAVES, 'readonly');
      const req = tx.objectStore(IDB_STORE_SAVES).get(uid);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch (_) {
      resolve(null);
    }
  });
}

export async function saveCrystalTowerProgress(state, { viewerChar = resolveCrystalViewerCharacter(), syncCloudSummary = true } = {}) {
  if (!state) return false;
  const uid = state.uid || resolveCrystalOwnerUid(viewerChar);
  const serializable = normalizeTowerState(state, uid);
  serializable.lastSavedAt = Date.now();

  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`${LS_SAVE_PREFIX}${uid}`, JSON.stringify(serializable));
    }
  } catch (_) {}

  await idbPutTowerSave(serializable);

  // Strictly sync summary ONLY to Lele's own universe_states.elements.crystal_tower
  if (syncCloudSummary && viewerChar === 'lele') {
    try {
      const univState = getCurrentUniverseState();
      if (univState && univState.characterKey === 'lele') {
        const roomName = TOWER_ROOMS[serializable.currentRoom]?.name || 'Kamar Pribadi Lele';
        updateElementState('crystal_tower', {
          resonance: `Harmoni Kristal ${serializable.crystalResonance}% 💎`,
          energy: serializable.moodEnergy >= 80 ? 'Tinggi' : 'Tenang',
          lastRoom: roomName,
          outfitId: serializable.player.outfitId,
          lastTuned: serializable.lastSavedAt
        });
      }
    } catch (_) {}
  }

  listeners.forEach((cb) => {
    try { cb(serializable); } catch (_) {}
  });
  return true;
}

export async function loadCrystalTowerProgress(viewerChar = resolveCrystalViewerCharacter()) {
  const uid = resolveCrystalOwnerUid(viewerChar);
  let loadedRaw = await idbGetTowerSave(uid);

  if (!loadedRaw) {
    try {
      if (typeof localStorage !== 'undefined') {
        const rawStr = localStorage.getItem(`${LS_SAVE_PREFIX}${uid}`);
        if (rawStr) loadedRaw = JSON.parse(rawStr);
      }
    } catch (_) {}
  }

  return normalizeTowerState(loadedRaw, uid);
}

export function subscribeCrystalTowerChanges(cb) {
  if (typeof cb === 'function') {
    listeners.add(cb);
    return () => listeners.delete(cb);
  }
  return () => {};
}

export function setCrystalIndexedDBProviderForTest(provider) {
  customIdbProvider = provider;
  idbPromise = null;
}

export function resetCrystalTowerIdbPromiseForTest() {
  idbPromise = null;
}

