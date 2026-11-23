/**
 * FAIRY ATELIER STORAGE LAYER
 * LALA'S UNIVERSE · TO YOU
 * =============================================================================
 * Handles persistent storage for:
 * 1. FASHION SKETCHBOOK — Digital sketches, canvas dataURLs, croquis guides, strokes
 * 2. INSPIRATION BOARDS — Uploaded reference images, sticky notes, color palettes
 * 3. FABRIC & COLOR LIBRARY — Saved favorite color combinations & textile swatches
 * 4. MANNEQUIN STUDIO & PORTFOLIO — Complete design collections (Idea / In Progress / Completed)
 * 5. MY LOOKBOOK — Styled outfits, favorites, worn outfit state
 * 6. WARDROBE & ACCESSORIES — Items, favorites, and mix-and-match states
 * 
 * Storage Architecture:
 * - IndexedDB (`olu_fairy_atelier_db_v1`) stores full binary/dataURL payloads.
 * - IndexedDB Object Stores:
 *     - `sketches`
 *     - `inspiration_boards`
 *     - `portfolio`
 *     - `lookbook`
 *     - `wardrobe_state`
 * - Scoped strictly to Lala's canonical UID (`EqByKA8FXoTEt0OmIsSDPfnxMDB3` or 'lala').
 * - Zero localStorage bloat for large images (prevent QuotaExceededError).
 * - Zero Firebase Storage dependency.
 */

export const LALA_CANONICAL_UID = 'EqByKA8FXoTEt0OmIsSDPfnxMDB3';
export const LALA_CANONICAL_ID = 'lala';

const IDB_NAME = 'olu_fairy_atelier_db_v1';
const IDB_VERSION = 1;

const STORE_SKETCHES = 'sketches';
const STORE_BOARDS = 'inspiration_boards';
const STORE_PORTFOLIO = 'portfolio';
const STORE_LOOKBOOK = 'lookbook';
const STORE_STATE = 'wardrobe_state';

let idbPromise = null;

export function getStorageUid(uid) {
  return uid || LALA_CANONICAL_UID;
}

export function openAtelierIdb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_SKETCHES)) {
          const store = db.createObjectStore(STORE_SKETCHES, { keyPath: 'id' });
          store.createIndex('uid', 'uid', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_BOARDS)) {
          const store = db.createObjectStore(STORE_BOARDS, { keyPath: 'id' });
          store.createIndex('uid', 'uid', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_PORTFOLIO)) {
          const store = db.createObjectStore(STORE_PORTFOLIO, { keyPath: 'id' });
          store.createIndex('uid', 'uid', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_LOOKBOOK)) {
          const store = db.createObjectStore(STORE_LOOKBOOK, { keyPath: 'id' });
          store.createIndex('uid', 'uid', { unique: false });
          store.createIndex('isFavorite', 'isFavorite', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_STATE)) {
          db.createObjectStore(STORE_STATE, { keyPath: 'uid' });
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

// =============================================================================
// 1. FASHION SKETCHBOOK STORAGE
// =============================================================================

export async function getSketches(uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openAtelierIdb();
  if (!db) return getFallbackMemorySketches(targetUid);

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SKETCHES, 'readonly');
      const store = tx.objectStore(STORE_SKETCHES);
      const index = store.index('uid');
      const req = index.getAll(IDBKeyRange.only(targetUid));
      req.onsuccess = () => {
        const results = req.result || [];
        results.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    } catch (_) {
      resolve([]);
    }
  });
}

export async function getSketchById(id, uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openAtelierIdb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SKETCHES, 'readonly');
      const store = tx.objectStore(STORE_SKETCHES);
      const req = store.get(id);
      req.onsuccess = () => {
        const item = req.result;
        if (item && item.uid === targetUid) resolve(item);
        else resolve(null);
      };
      req.onerror = () => resolve(null);
    } catch (_) {
      resolve(null);
    }
  });
}

export async function saveSketch(sketchItem, uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const now = Date.now();
  const id = sketchItem.id || `sketch_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const record = {
    id,
    uid: targetUid,
    title: String(sketchItem.title || 'Sketsa Busana Peri').trim(),
    description: String(sketchItem.description || '').trim(),
    imageDataUrl: sketchItem.imageDataUrl || '', // Base64 drawing
    croquisType: sketchItem.croquisType || 'fairy_standard',
    theme: sketchItem.theme || 'Spring Fairy',
    palette: Array.isArray(sketchItem.palette) ? sketchItem.palette : ['#fbcfe8', '#fef08a', '#bbf7d0', '#f472b6'],
    notes: String(sketchItem.notes || '').trim(),
    createdAt: sketchItem.createdAt || now,
    updatedAt: now
  };

  const db = await openAtelierIdb();
  if (!db) {
    saveFallbackMemorySketch(record);
    return record;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_SKETCHES, 'readwrite');
      const store = tx.objectStore(STORE_SKETCHES);
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function deleteSketch(id, uid = LALA_CANONICAL_UID) {
  const db = await openAtelierIdb();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_SKETCHES, 'readwrite');
      const store = tx.objectStore(STORE_SKETCHES);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

// =============================================================================
// 2. INSPIRATION BOARDS STORAGE
// =============================================================================

export async function getInspirationBoards(uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openAtelierIdb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_BOARDS, 'readonly');
      const store = tx.objectStore(STORE_BOARDS);
      const index = store.index('uid');
      const req = index.getAll(IDBKeyRange.only(targetUid));
      req.onsuccess = () => {
        const results = req.result || [];
        results.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    } catch (_) {
      resolve([]);
    }
  });
}

export async function saveInspirationBoard(boardItem, uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const now = Date.now();
  const id = boardItem.id || `board_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const record = {
    id,
    uid: targetUid,
    title: String(boardItem.title || 'Papan Inspirasi Mode Peri').trim(),
    concept: String(boardItem.concept || '').trim(),
    theme: boardItem.theme || 'Spring Fairy',
    images: Array.isArray(boardItem.images) ? boardItem.images : [], // array of { id, dataUrl, caption, x, y }
    notes: Array.isArray(boardItem.notes) ? boardItem.notes : [],   // array of { id, text, color, x, y }
    palette: Array.isArray(boardItem.palette) ? boardItem.palette : ['#f472b6', '#fef08a', '#99f6e4', '#e9d5ff'],
    fabrics: Array.isArray(boardItem.fabrics) ? boardItem.fabrics : ['chiffon', 'lace'],
    createdAt: boardItem.createdAt || now,
    updatedAt: now
  };

  const db = await openAtelierIdb();
  if (!db) return record;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_BOARDS, 'readwrite');
      const store = tx.objectStore(STORE_BOARDS);
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function deleteInspirationBoard(id, uid = LALA_CANONICAL_UID) {
  const db = await openAtelierIdb();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_BOARDS, 'readwrite');
      const store = tx.objectStore(STORE_BOARDS);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

// =============================================================================
// 3. MY FASHION PORTFOLIO STORAGE
// =============================================================================

export async function getPortfolioDesigns(uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openAtelierIdb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PORTFOLIO, 'readonly');
      const store = tx.objectStore(STORE_PORTFOLIO);
      const index = store.index('uid');
      const req = index.getAll(IDBKeyRange.only(targetUid));
      req.onsuccess = () => {
        const results = req.result || [];
        results.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    } catch (_) {
      resolve([]);
    }
  });
}

export async function savePortfolioDesign(designItem, uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const now = Date.now();
  const id = designItem.id || `design_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const record = {
    id,
    uid: targetUid,
    title: String(designItem.title || 'Rancangan Gaun Peri Cantik').trim(),
    description: String(designItem.description || '').trim(),
    theme: designItem.theme || 'Spring Fairy',
    palette: Array.isArray(designItem.palette) ? designItem.palette : ['#f472b6', '#fbcfe8', '#fef08a'],
    fabrics: Array.isArray(designItem.fabrics) ? designItem.fabrics : ['lace', 'chiffon'],
    status: designItem.status || 'In Progress', // 'Idea' | 'In Progress' | 'Completed'
    sketchId: designItem.sketchId || null,
    previewDataUrl: designItem.previewDataUrl || '', // Mannequin or sketch snapshot
    mannequinConfig: designItem.mannequinConfig || {
      silhouette: 'ballgown',
      topColor: '#fbcfe8',
      skirtColor: '#f472b6',
      accentColor: '#fef08a',
      hasWings: true,
      hasCrown: true
    },
    createdAt: designItem.createdAt || now,
    updatedAt: now
  };

  const db = await openAtelierIdb();
  if (!db) return record;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_PORTFOLIO, 'readwrite');
      const store = tx.objectStore(STORE_PORTFOLIO);
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function duplicatePortfolioDesign(id, uid = LALA_CANONICAL_UID) {
  const designs = await getPortfolioDesigns(uid);
  const original = designs.find(d => d.id === id);
  if (!original) return null;

  const duplicateItem = {
    ...original,
    id: `design_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: `${original.title} (Salinan)`,
    status: 'Idea',
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  return await savePortfolioDesign(duplicateItem, uid);
}

export async function deletePortfolioDesign(id, uid = LALA_CANONICAL_UID) {
  const db = await openAtelierIdb();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_PORTFOLIO, 'readwrite');
      const store = tx.objectStore(STORE_PORTFOLIO);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

// =============================================================================
// 4. MY LOOKBOOK STORAGE
// =============================================================================

export async function getLookbookOutfits(uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openAtelierIdb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_LOOKBOOK, 'readonly');
      const store = tx.objectStore(STORE_LOOKBOOK);
      const index = store.index('uid');
      const req = index.getAll(IDBKeyRange.only(targetUid));
      req.onsuccess = () => {
        const results = req.result || [];
        results.sort((a, b) => (b.updatedAt || b.createdAt) - (a.updatedAt || a.createdAt));
        resolve(results);
      };
      req.onerror = () => resolve([]);
    } catch (_) {
      resolve([]);
    }
  });
}

export async function saveLookbookOutfit(outfitItem, uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const now = Date.now();
  const id = outfitItem.id || `outfit_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const record = {
    id,
    uid: targetUid,
    title: String(outfitItem.title || 'Paduan Busana Cantik').trim(),
    description: String(outfitItem.description || '').trim(),
    isFavorite: Boolean(outfitItem.isFavorite),
    seasonTag: outfitItem.seasonTag || 'Spring Fairy',
    items: outfitItem.items || {
      dress: null,
      top: 'silk_blouse_peach',
      skirt: 'petal_skirt_rose',
      outerwear: null,
      cardigan: 'fairy_knit_cream',
      shoes: 'ballerina_slippers_gold',
      wings: 'ethereal_glimmer_wings',
      hairAccessory: 'sunlight_ribbon',
      flowerCrown: 'golden_buttercup_crown',
      earrings: 'dewdrop_pearls',
      necklace: 'rose_quartz_choker',
      bag: 'blossom_pouch',
      magicalItem: 'starlight_wand'
    },
    previewColor: outfitItem.previewColor || '#f472b6',
    previewDataUrl: outfitItem.previewDataUrl || '',
    createdAt: outfitItem.createdAt || now,
    updatedAt: now
  };

  const db = await openAtelierIdb();
  if (!db) return record;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_LOOKBOOK, 'readwrite');
      const store = tx.objectStore(STORE_LOOKBOOK);
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

export async function toggleLookbookFavorite(id, uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openAtelierIdb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_LOOKBOOK, 'readwrite');
      const store = tx.objectStore(STORE_LOOKBOOK);
      const req = store.get(id);
      req.onsuccess = () => {
        const item = req.result;
        if (item && item.uid === targetUid) {
          item.isFavorite = !item.isFavorite;
          item.updatedAt = Date.now();
          store.put(item);
          resolve(item.isFavorite);
        } else {
          resolve(false);
        }
      };
      req.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

export async function deleteLookbookOutfit(id, uid = LALA_CANONICAL_UID) {
  const db = await openAtelierIdb();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_LOOKBOOK, 'readwrite');
      const store = tx.objectStore(STORE_LOOKBOOK);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

// =============================================================================
// 5. WARDROBE STATE & WORN OUTFIT
// =============================================================================

export async function getWardrobeState(uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openAtelierIdb();
  if (!db) return getDefaultWardrobeState(targetUid);

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_STATE, 'readonly');
      const store = tx.objectStore(STORE_STATE);
      const req = store.get(targetUid);
      req.onsuccess = () => {
        resolve(req.result || getDefaultWardrobeState(targetUid));
      };
      req.onerror = () => resolve(getDefaultWardrobeState(targetUid));
    } catch (_) {
      resolve(getDefaultWardrobeState(targetUid));
    }
  });
}

export async function saveWardrobeState(state, uid = LALA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const record = {
    uid: targetUid,
    ...state,
    updatedAt: Date.now()
  };

  const db = await openAtelierIdb();
  if (!db) return record;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_STATE, 'readwrite');
      const store = tx.objectStore(STORE_STATE);
      const req = store.put(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => resolve(record);
    } catch (_) {
      resolve(record);
    }
  });
}

function getDefaultWardrobeState(uid) {
  return {
    uid,
    wornOutfit: {
      dress: 'dress_spring_morning',
      top: null,
      skirt: null,
      outerwear: null,
      cardigan: 'cardigan_blossom_knit',
      shoes: 'shoes_fairy_slippers',
      wings: 'wings_gossamer_gold',
      hairAccessory: 'hair_buttercup_ribbon',
      flowerCrown: 'crown_cherry_blossom',
      earrings: 'earrings_pearl_dew',
      necklace: 'necklace_fairy_pendant',
      bag: 'bag_petal_pouch',
      magicalItem: 'item_starlight_prism'
    },
    favoriteItemIds: ['dress_spring_morning', 'wings_gossamer_gold', 'crown_cherry_blossom'],
    favoritePaletteCombos: [
      { name: 'Peach & Buttercup Sunrise', colors: ['#f472b6', '#fef08a', '#fed7aa', '#fdf4ff'] },
      { name: 'Mint & Gossamer Dew', colors: ['#a7f3d0', '#6ee7b7', '#fbcfe8', '#ffffff'] },
      { name: 'Moonlight Lavender & Gold', colors: ['#e9d5ff', '#c084fc', '#fef08a', '#38bdf8'] }
    ]
  };
}

// Memory Fallback for testing environments without IndexedDB
const memorySketches = [];
function getFallbackMemorySketches(uid) {
  return memorySketches.filter(s => s.uid === uid);
}
function saveFallbackMemorySketch(item) {
  const idx = memorySketches.findIndex(s => s.id === item.id);
  if (idx >= 0) memorySketches[idx] = item;
  else memorySketches.push(item);
}
