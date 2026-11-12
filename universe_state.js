/**
 * OUR LITTLE UNIVERSE — UNIVERSE STATE & DECORATIONS ENGINE (FASE 8)
 * 
 * Manages persistent condition, interactive elements, and custom decorations
 * for KIDULT (Nyanya ⭐), TO YOU (Lala ☀️), and SHADOW (Lele 🌙).
 * 
 * Strictly bounds writes to authenticated Firebase Auth UID and validates
 * canonical character-to-universe mappings.
 */

import {
  dbSaveUniverseState,
  dbFetchUniverseState,
  dbSubscribeUniverseState,
  dbMigrateUniverseState,
  UNIVERSE_MAPPINGS,
  getVerifiedCharacterKey,
  CHARACTER_AUTH_RULES
} from './firebase.js';

// Local storage cache keys
export const STORAGE_KEY_UNIVERSE_CACHE = 'olu_universe_state_cache_v1';
export const STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE = 'olu_universe_offline_queue_v1';

// Canonical Character UIDs
export const CANONICAL_UIDS = {
  nyanya: 'uid-nyanya-moonlit-star-2026',
  lala: 'uid-lala-to-you-sunshine-2026',
  lele: 'uid-lele-crystal-shadow-2026'
};

// Themed decoration catalogs for each universe
export const UNIVERSE_DECORATION_CATALOG = {
  kidult: [
    { itemId: 'star_lantern', name: 'Lentera Bintang Melayang', icon: '⭐', desc: 'Lentera kosmik bersinar ungu-keemasan' },
    { itemId: 'sunset_rose', name: 'Pot Mawar Senja', icon: '🌸', desc: 'Mawar mekar di bawah cahaya senja galaksi' },
    { itemId: 'crystal_shroom', name: 'Jamur Kristal Ungu', icon: '🍄', desc: 'Jamur berpendar pendaran mimpi kosmik' },
    { itemId: 'lavender_bench', name: 'Bangku Kayu Lavender', icon: '🪑', desc: 'Bangku taman nyaman untuk menikmati senja' },
    { itemId: 'starlight_candle', name: 'Lilin Aromaterapi Bintang', icon: '🕯️', desc: 'Aroma lavender dan vanila manis' },
    { itemId: 'cloud_teddy', name: 'Boneka Beruang Awan', icon: '🧸', desc: 'Teman kecil pengantar mimpi indah' }
  ],
  to_you: [
    { itemId: 'sun_lantern', name: 'Lentera Mentari Emas', icon: '☀️', desc: 'Pendaran cahaya pagi hangat nan ceria' },
    { itemId: 'butterfly_bath', name: 'Air Mancur Kupu-kupu', icon: '🦋', desc: 'Kupu-kupu menari di atas gemericik air' },
    { itemId: 'peach_tulips', name: 'Hamparan Tulip Peach', icon: '🌷', desc: 'Kuncup bunga menyambut pagi cerah' },
    { itemId: 'ribbon_garland', name: 'Untaian Pita Bunga', icon: '🎀', desc: 'Hiasan garland peri warna pastel' },
    { itemId: 'flower_swing', name: 'Ayunan Ranting Mawar', icon: '🌸', desc: 'Ayunan kayu di antara bunga harum' },
    { itemId: 'tea_table', name: 'Meja Teh Peri Pagi', icon: '🍰', desc: 'Meja teh mungil berhias camilan manis' }
  ],
  shadow: [
    { itemId: 'crescent_crystal', name: 'Kristal Bulan Sabit', icon: '🌙', desc: 'Kristal perak memancarkan energi kosmik' },
    { itemId: 'amethyst_geode', name: 'Geode Ametis Berpendar', icon: '💎', desc: 'Batu ametis ungu berkilau tenang' },
    { itemId: 'snowdrop_pot', name: 'Pot Snowdrop Perak', icon: '❄️', desc: 'Bunga salju bermekaran di kegelapan malam' },
    { itemId: 'candelabra', name: 'Kandelabra Lilin Indigo', icon: '🕯️', desc: 'Lilin misterius beraroma malam tenang' },
    { itemId: 'galaxy_orb', name: 'Bola Kristal Galaksi', icon: '🔮', desc: 'Pantulan nebula dan cincin planet' },
    { itemId: 'velvet_chair', name: 'Kursi Beludru Malam', icon: '🪑', desc: 'Kursi anggun di sudut observatorium' }
  ]
};

// Default interactive elements state for each universe
export const DEFAULT_UNIVERSE_ELEMENTS = {
  nyanya: {
    greenhouse: { watered: false, count: 2, plant: 'Lavender Bintang & Mawar Senja', status: 'Mekar Indah 🌸', lastWatered: null },
    river: { lanterns: 3, lastWish: 'Semoga harimu penuh kebahagiaan ✦', lastFloated: null },
    gazebo: { teaReady: true, teaType: 'Teh Chamomile Bintang 🍵', mood: 'tenang' },
    telescope: { observedStars: 3, lastMessage: 'Small joys make a big universe ★' },
    mailbox: { letterCount: 1, lastChecked: null }
  },
  lala: {
    atelier: { dressTheme: 'Gaun Peri Pagi 👗', sketchCount: 3 },
    butterfly: { friendlyFlock: 5, lastGreeted: null },
    gazebo: { teaReady: true, teaType: 'Teh Earl Grey & Bunga Persik ☕' },
    telescope: { clearSky: true, skyNotes: 'A little closer, for a brighter tomorrow ☼' },
    mailbox: { letterCount: 1, lastChecked: null }
  },
  lele: {
    crystal_tower: { resonance: 'Harmoni Kristal 98% 💎', energy: 'Tinggi' },
    gallery: { paintingTitle: 'Midnight Starlight 🎨', exhibited: true },
    bath: { waterWarmth: 'Hangat Menenangkan 💧', petals: 'Snowdrop' },
    gazebo: { teaReady: true, teaType: 'Teh Melati & Embun Malam 🌙' },
    telescope: { discoveredNebula: 'Nebula Crescent Veil 🔭' },
    mailbox: { letterCount: 1, lastChecked: null }
  },
  kidult: {
    greenhouse: { watered: false, count: 2, plant: 'Lavender Bintang & Mawar Senja', status: 'Mekar Indah 🌸', lastWatered: null },
    river: { lanterns: 3, lastWish: 'Semoga harimu penuh kebahagiaan ✦', lastFloated: null },
    gazebo: { teaReady: true, teaType: 'Teh Chamomile Bintang 🍵', mood: 'tenang' },
    telescope: { observedStars: 3, lastMessage: 'Small joys make a big universe ★' },
    mailbox: { letterCount: 1, lastChecked: null }
  },
  to_you: {
    atelier: { dressTheme: 'Gaun Peri Pagi 👗', sketchCount: 3 },
    butterfly: { friendlyFlock: 5, lastGreeted: null },
    gazebo: { teaReady: true, teaType: 'Teh Earl Grey & Bunga Persik ☕' },
    telescope: { clearSky: true, skyNotes: 'A little closer, for a brighter tomorrow ☼' },
    mailbox: { letterCount: 1, lastChecked: null }
  },
  shadow: {
    crystal_tower: { resonance: 'Harmoni Kristal 98% 💎', energy: 'Tinggi' },
    gallery: { paintingTitle: 'Midnight Starlight 🎨', exhibited: true },
    bath: { waterWarmth: 'Hangat Menenangkan 💧', petals: 'Snowdrop' },
    gazebo: { teaReady: true, teaType: 'Teh Melati & Embun Malam 🌙' },
    telescope: { discoveredNebula: 'Nebula Crescent Veil 🔭' },
    mailbox: { letterCount: 1, lastChecked: null }
  }
};

// In-memory module state
let activeUniverseKey = 'kidult';
let activeOwnerUid = null;
let activeAuthUser = null;
let currentUniverseState = null;
let saveDebounceTimer = null;
let activeUnsubscribe = null;
let isSaving = false;

// Listeners
const stateChangeListeners = new Set();
const statusChangeListeners = new Set();

/**
 * Normalizes character key.
 */
export function normalizeCharacterKey(rawKey) {
  if (!rawKey) return 'nyanya';
  const k = String(rawKey).toLowerCase().trim();
  if (k.includes('nyanya')) return 'nyanya';
  if (k.includes('lala')) return 'lala';
  if (k.includes('lele')) return 'lele';
  return 'nyanya';
}

/**
 * Gets universe name from character key.
 */
export function getUniverseNameByChar(charKey) {
  const norm = normalizeCharacterKey(charKey);
  return UNIVERSE_MAPPINGS[norm] || 'KIDULT';
}

/**
 * Reads local cached state for a specific character/UID.
 */
export function getCachedUniverseState(charKey) {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_UNIVERSE_CACHE);
    if (!raw) return null;
    const allCache = JSON.parse(raw);
    const norm = normalizeCharacterKey(charKey);
    return allCache[norm] || null;
  } catch (_) {
    return null;
  }
}

/**
 * Writes state to local cache.
 */
export function setCachedUniverseState(charKey, state) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_UNIVERSE_CACHE);
    const allCache = raw ? JSON.parse(raw) : {};
    const norm = normalizeCharacterKey(charKey);
    allCache[norm] = state;
    window.localStorage.setItem(STORAGE_KEY_UNIVERSE_CACHE, JSON.stringify(allCache));
  } catch (_) {}
}

/**
 * Generates initial default state for a character.
 */
export function createDefaultUniverseState(charKey, uid) {
  const norm = normalizeCharacterKey(charKey);
  const univName = getUniverseNameByChar(norm);
  const initialElements = JSON.parse(JSON.stringify(DEFAULT_UNIVERSE_ELEMENTS[norm] || {}));

  // Initial placed decorations (default 2 starter items)
  let initialDecorations = [];
  if (norm === 'nyanya') {
    initialDecorations = [
      { id: 'decor-nyanya-1', itemId: 'star_lantern', name: 'Lentera Bintang Melayang', icon: '⭐', x: 28, y: 45, rotation: 0, placedAt: Date.now() },
      { id: 'decor-nyanya-2', itemId: 'sunset_rose', name: 'Pot Mawar Senja', icon: '🌸', x: 74, y: 62, rotation: 0, placedAt: Date.now() }
    ];
  } else if (norm === 'lala') {
    initialDecorations = [
      { id: 'decor-lala-1', itemId: 'sun_lantern', name: 'Lentera Mentari Emas', icon: '☀️', x: 25, y: 50, rotation: 0, placedAt: Date.now() },
      { id: 'decor-lala-2', itemId: 'butterfly_bath', name: 'Air Mancur Kupu-kupu', icon: '🦋', x: 68, y: 55, rotation: 0, placedAt: Date.now() }
    ];
  } else if (norm === 'lele') {
    initialDecorations = [
      { id: 'decor-lele-1', itemId: 'crescent_crystal', name: 'Kristal Bulan Sabit', icon: '🌙', x: 30, y: 48, rotation: 0, placedAt: Date.now() },
      { id: 'decor-lele-2', itemId: 'amethyst_geode', name: 'Geode Ametis Berpendar', icon: '💎', x: 72, y: 58, rotation: 0, placedAt: Date.now() }
    ];
  }

  return {
    uid: uid || CANONICAL_UIDS[norm],
    characterKey: norm,
    universeName: univName,
    decorations: initialDecorations,
    elements: initialElements,
    lastUpdated: Date.now(),
    updatedBy: norm,
    version: 1
  };
}

/**
 * Notifies all registered listeners of state changes.
 */
function broadcastState(state) {
  currentUniverseState = state;
  stateChangeListeners.forEach((fn) => {
    try { fn(state); } catch (e) { console.warn('[UniverseState] broadcastState listener err:', e); }
  });
}

/**
 * Notifies all registered listeners of save/sync status changes.
 * Statuses: 'loading' | 'saving' | 'saved' | 'offline_saved' | 'error' | 'idle'
 */
function broadcastStatus(status, message, extra = {}) {
  statusChangeListeners.forEach((fn) => {
    try { fn(status, message, extra); } catch (e) { console.warn('[UniverseState] broadcastStatus listener err:', e); }
  });
}

/**
 * Subscribes to state updates.
 */
export function onUniverseStateChange(callback) {
  stateChangeListeners.add(callback);
  if (currentUniverseState) {
    callback(currentUniverseState);
  }
  return () => stateChangeListeners.delete(callback);
}

/**
 * Subscribes to sync/save status changes.
 */
export function onUniverseStatusChange(callback) {
  statusChangeListeners.add(callback);
  return () => statusChangeListeners.delete(callback);
}

/**
 * Returns current active universe state.
 */
export function getCurrentUniverseState() {
  return currentUniverseState;
}

/**
 * Loads and initializes universe state for a given character and visitor.
 * 
 * @param {string} targetCharKey - Character who owns the universe ('nyanya', 'lala', 'lele')
 * @param {object} authUser - Currently logged in Firebase Auth user
 * @param {string} targetOwnerUid - Optional owner UID (defaults to canonical or authUser.uid)
 */
export async function loadUniverseState(targetCharKey, authUser, targetOwnerUid = null) {
  const normChar = normalizeCharacterKey(targetCharKey);
  activeUniverseKey = normChar;
  activeAuthUser = authUser || null;

  // Determine owner UID: if caller is the verified owner, use authUser.uid; otherwise use canonical/configured UID
  let resolvedOwnerUid = targetOwnerUid;
  if (!resolvedOwnerUid) {
    if (authUser && typeof getVerifiedCharacterKey === 'function' && getVerifiedCharacterKey(authUser) === normChar) {
      resolvedOwnerUid = authUser.uid;
    } else {
      resolvedOwnerUid = CHARACTER_AUTH_RULES?.[normChar]?.expectedUid || CANONICAL_UIDS[normChar];
    }
  }
  activeOwnerUid = resolvedOwnerUid;

  // Clean up previous real-time listener if any
  if (typeof activeUnsubscribe === 'function') {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }

  broadcastStatus('loading', `Memuat kondisi Universe ${getUniverseNameByChar(normChar)}...`);

  // 1. Instant render from local cache if available
  const cached = getCachedUniverseState(normChar);
  if (cached) {
    broadcastState(cached);
  } else {
    const defaultState = createDefaultUniverseState(normChar, resolvedOwnerUid);
    broadcastState(defaultState);
  }

  // 2. Fetch latest from Firestore if online & authenticated
  try {
    const cloudState = await dbFetchUniverseState(resolvedOwnerUid);
    if (cloudState && cloudState.characterKey === normChar) {
      setCachedUniverseState(normChar, cloudState);
      broadcastState(cloudState);
      broadcastStatus('saved', 'Kondisi Universe tersinkron dari Cloud ✦');
    } else if (authUser && authUser.uid === resolvedOwnerUid) {
      // Owner logged in for the first time without cloud doc: save default initial state to Cloud
      const initial = currentUniverseState || createDefaultUniverseState(normChar, resolvedOwnerUid);
      try {
        const saved = await dbSaveUniverseState(initial, authUser);
        setCachedUniverseState(normChar, saved);
        broadcastState(saved);
        broadcastStatus('saved', 'Universe baru berhasil dibuat di Cloud ✦');
      } catch (err) {
        console.warn('[loadUniverseState] Init cloud save error:', err);
        broadcastStatus('offline_saved', 'Tersimpan lokal (belum tersinkron ke Cloud)');
      }
    } else {
      broadcastStatus('saved', 'Mode Penjelajahan Universe aktif ✦');
    }
  } catch (err) {
    console.warn('[loadUniverseState] Cloud fetch notice:', err);
    broadcastStatus('offline_saved', 'Menggunakan kondisi lokal (koneksi offline)');
  }

  // 3. Set up real-time listener for multi-device sync and friend visits
  try {
    activeUnsubscribe = dbSubscribeUniverseState(resolvedOwnerUid, (snapData) => {
      if (snapData && snapData.characterKey === normChar) {
        setCachedUniverseState(normChar, snapData);
        broadcastState(snapData);
        broadcastStatus('saved', 'Kondisi diperbarui dari Cloud ✦');
      }
    });
  } catch (subErr) {
    console.warn('[loadUniverseState] Realtime subscribe notice:', subErr);
  }

  return currentUniverseState;
}

/**
 * Saves current universe state with debounced auto-save.
 * Only allowed if activeAuthUser is the owner of the universe.
 * 
 * @param {object} partialMutations - Partial state to merge (decorations, elements)
 * @param {number} debounceMs - Debounce delay in ms (default 600ms)
 * @param {boolean} immediate - Whether to trigger save immediately without debounce
 */
export function scheduleUniverseSave(partialMutations = {}, debounceMs = 600, immediate = false) {
  if (!currentUniverseState) return;

  // Verify ownership
  const isOwner = activeAuthUser && (activeAuthUser.uid === currentUniverseState.uid);
  
  // Merge mutations into local state immediately
  const updatedDecorations = partialMutations.decorations
    ? partialMutations.decorations.slice(0, 50)
    : (currentUniverseState.decorations || []);

  const updatedElements = partialMutations.elements
    ? { ...currentUniverseState.elements, ...partialMutations.elements }
    : (currentUniverseState.elements || {});

  const nextState = {
    ...currentUniverseState,
    decorations: updatedDecorations,
    elements: updatedElements,
    lastUpdated: Date.now(),
    updatedBy: currentUniverseState.characterKey,
    version: (currentUniverseState.version || 1)
  };

  // Immediate local update & cache
  setCachedUniverseState(currentUniverseState.characterKey, nextState);
  broadcastState(nextState);

  // If visitor (not owner), changes are local view only
  if (!isOwner) {
    broadcastStatus('idle', 'Mode Pengunjung: Perubahan hanya bersifat tampilan sementara');
    return;
  }

  // Queue to offline queue as backup
  saveToOfflineQueue(nextState);

  // Clear existing debounce timer
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }

  broadcastStatus('saving', 'Menyimpan perubahan ke Cloud...');

  const performWrite = async () => {
    isSaving = true;
    try {
      const saved = await dbSaveUniverseState(nextState, activeAuthUser);
      isSaving = false;
      clearFromOfflineQueue(nextState.characterKey);
      setCachedUniverseState(nextState.characterKey, saved);
      broadcastState(saved);
      broadcastStatus('saved', 'Tersimpan di Cloud ✦', { timestamp: saved.lastUpdated });
    } catch (err) {
      isSaving = false;
      console.warn('[scheduleUniverseSave] Firestore save notice:', err);
      // Offline fallback
      broadcastStatus('offline_saved', 'Offline: Perubahan tersimpan lokal, akan disinkronkan saat online');
    }
  };

  if (immediate) {
    performWrite();
  } else {
    saveDebounceTimer = setTimeout(performWrite, debounceMs);
  }
}

/**
 * Adds a decoration item to the current universe.
 */
export function addDecoration(catalogItemId, x = 50, y = 50) {
  if (!currentUniverseState) return null;

  const charKey = currentUniverseState.characterKey;
  const catalog = UNIVERSE_DECORATION_CATALOG[charKey] || [];
  const catalogItem = catalog.find((c) => c.itemId === catalogItemId) || catalog[0];

  const currentDecorations = currentUniverseState.decorations || [];
  if (currentDecorations.length >= 50) {
    throw new Error('Batas maksimal dekorasi tercapai (50 item). Hapus beberapa dekorasi terlebih dahulu.');
  }

  const newDecor = {
    id: `decor-${charKey}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    itemId: catalogItem ? catalogItem.itemId : catalogItemId,
    name: catalogItem ? catalogItem.name : 'Dekorasi Fantasi',
    icon: catalogItem ? catalogItem.icon : '✨',
    x: Math.min(95, Math.max(5, Math.round(x))),
    y: Math.min(95, Math.max(10, Math.round(y))),
    rotation: 0,
    placedAt: Date.now()
  };

  const nextList = [...currentDecorations, newDecor];
  scheduleUniverseSave({ decorations: nextList });
  return newDecor;
}

/**
 * Updates position of a placed decoration.
 */
export function updateDecorationPosition(decorId, x, y, rotation = null) {
  if (!currentUniverseState) return;
  const currentDecorations = currentUniverseState.decorations || [];
  const idx = currentDecorations.findIndex((d) => d.id === decorId);
  if (idx === -1) return;

  const updatedItem = {
    ...currentDecorations[idx],
    x: Math.min(95, Math.max(5, Math.round(x))),
    y: Math.min(95, Math.max(10, Math.round(y)))
  };
  if (rotation !== null && Number.isFinite(rotation)) {
    updatedItem.rotation = rotation;
  }

  const nextList = [...currentDecorations];
  nextList[idx] = updatedItem;
  scheduleUniverseSave({ decorations: nextList });
}

/**
 * Removes a placed decoration.
 */
export function removeDecoration(decorId) {
  if (!currentUniverseState) return;
  const currentDecorations = currentUniverseState.decorations || [];
  const nextList = currentDecorations.filter((d) => d.id !== decorId);
  scheduleUniverseSave({ decorations: nextList });
}

/**
 * Updates state for an interactive element (e.g. greenhouse plants, river lanterns, gazebo tea).
 */
export function updateElementState(elementKey, partialElementData) {
  if (!currentUniverseState) return;
  const currentElements = currentUniverseState.elements || {};
  const currentSub = currentElements[elementKey] || {};

  const updatedSub = {
    ...currentSub,
    ...partialElementData
  };

  const nextElements = {
    ...currentElements,
    [elementKey]: updatedSub
  };

  scheduleUniverseSave({ elements: nextElements });
}

/**
 * Resets universe decorations to defaults.
 */
export function resetDecorationsToDefault() {
  if (!currentUniverseState) return;
  const def = createDefaultUniverseState(currentUniverseState.characterKey, currentUniverseState.uid);
  scheduleUniverseSave({ decorations: def.decorations });
}

/**
 * Offline queue helper.
 */
function saveToOfflineQueue(state) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE);
    const queue = raw ? JSON.parse(raw) : {};
    queue[state.characterKey] = {
      state,
      queuedAt: Date.now()
    };
    window.localStorage.setItem(STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (_) {}
}

function clearFromOfflineQueue(charKey) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE);
    if (!raw) return;
    const queue = JSON.parse(raw);
    delete queue[charKey];
    window.localStorage.setItem(STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE, JSON.stringify(queue));
  } catch (_) {}
}

/**
 * Flushes all pending offline updates to Firestore when connection is restored.
 */
export async function flushUniverseOfflineQueue(authUser) {
  if (!authUser || !authUser.uid || typeof window === 'undefined' || !window.localStorage) return 0;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE);
    if (!raw) return 0;
    const queue = JSON.parse(raw);
    const keys = Object.keys(queue);
    let flushedCount = 0;

    for (const charKey of keys) {
      const item = queue[charKey];
      if (item && item.state) {
        // Only flush if authUser matches the state UID
        if (item.state.uid === authUser.uid) {
          try {
            await dbSaveUniverseState(item.state, authUser);
            delete queue[charKey];
            flushedCount++;
          } catch (e) {
            console.warn(`[flushUniverseOfflineQueue] Failed flushing ${charKey}:`, e);
          }
        }
      }
    }

    window.localStorage.setItem(STORAGE_KEY_UNIVERSE_OFFLINE_QUEUE, JSON.stringify(queue));
    if (flushedCount > 0) {
      broadcastStatus('saved', `Sinkronisasi berhasil: ${flushedCount} perubahan lokal tersimpan di Cloud ✦`);
    }
    return flushedCount;
  } catch (_) {
    return 0;
  }
}

/**
 * Immediately flushes any pending debounced save to Firestore.
 * Prevents loss of recent changes on navigation, window unload, or logout.
 */
export async function flushPendingUniverseSave() {
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  if (currentUniverseState && activeAuthUser && (activeAuthUser.uid === currentUniverseState.uid)) {
    try {
      const saved = await dbSaveUniverseState(currentUniverseState, activeAuthUser);
      clearFromOfflineQueue(currentUniverseState.characterKey);
      setCachedUniverseState(currentUniverseState.characterKey, saved);
      broadcastState(saved);
      broadcastStatus('saved', 'Tersimpan di Cloud ✦', { timestamp: saved.lastUpdated });
      return saved;
    } catch (e) {
      console.warn('[flushPendingUniverseSave] notice:', e);
    }
  }
  return null;
}

/**
 * Cleans up real-time snapshot listeners and state on logout.
 */
export function cleanupUniverseStateOnLogout() {
  if (typeof activeUnsubscribe === 'function') {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }
  if (saveDebounceTimer) {
    clearTimeout(saveDebounceTimer);
    saveDebounceTimer = null;
  }
  activeAuthUser = null;
  currentUniverseState = null;
  activeOwnerUid = null;
  broadcastStatus('idle', 'Sesi ditutup');
}

// Auto-flush when window comes online or page is closing
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('online', () => {
    if (activeAuthUser) {
      flushUniverseOfflineQueue(activeAuthUser);
    }
  });

  window.addEventListener('beforeunload', () => {
    flushPendingUniverseSave();
  });
}
