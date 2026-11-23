/**
 * PINWHEEL STUDIO STORAGE LAYER
 * SYMA'S UNIVERSE · PINWHEEL
 * =============================================================================
 * Handles persistent storage for:
 * 1. PHOTOGRAPHY (The Moment Archive) — photos, metadata, frames, filters, categories
 * 2. VISION STUDIO (The Creative Atelier) — artworks, canvas drawings, templates, stickers
 * 
 * Storage Architecture:
 * - IndexedDB (`olu_pinwheel_studio_db_v1`) stores full binary/dataURL payloads.
 * - LocalStorage (`olu_syma_studio_index_${uid}`) stores lightweight metadata for instant sync.
 * - Strictly UID-bound to Syma (`Euc0JLt3kWMveUEIjBwXHfOfvQD3` or canonical `abil`).
 * - ZERO Firebase Storage usage.
 */

export const SYMA_CANONICAL_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';
export const SYMA_CANONICAL_ID = 'abil';

const IDB_NAME = 'olu_pinwheel_studio_db_v1';
const IDB_VERSION = 1;
const STORE_PHOTOS = 'photos';
const STORE_ARTWORKS = 'artworks';

let idbPromise = null;

function getStorageUid(uid) {
  return uid || SYMA_CANONICAL_UID;
}

function openStudioIdb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve) => {
    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_PHOTOS)) {
          const photoStore = db.createObjectStore(STORE_PHOTOS, { keyPath: 'id' });
          photoStore.createIndex('uid', 'uid', { unique: false });
          photoStore.createIndex('category', 'category', { unique: false });
          photoStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_ARTWORKS)) {
          const artStore = db.createObjectStore(STORE_ARTWORKS, { keyPath: 'id' });
          artStore.createIndex('uid', 'uid', { unique: false });
          artStore.createIndex('category', 'category', { unique: false });
          artStore.createIndex('createdAt', 'createdAt', { unique: false });
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
// A. PHOTOGRAPHY STORAGE (THE MOMENT ARCHIVE)
// =============================================================================

const LS_PHOTOS_KEY_PREFIX = 'olu_syma_photos_meta_';

function getPhotosMetaKey(uid) {
  return `${LS_PHOTOS_KEY_PREFIX}${getStorageUid(uid)}`;
}

export async function savePhoto(photoItem, uid = SYMA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const now = Date.now();
  const id = photoItem.id || `photo_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const record = {
    id,
    uid: targetUid,
    title: String(photoItem.title || 'Momen Tanpa Judul').trim(),
    caption: String(photoItem.caption || '').trim(),
    category: photoItem.category || 'Special Moments', // 'All Photos' | 'Favorites' | 'Special Moments'
    isFavorite: Boolean(photoItem.isFavorite),
    sceneryId: photoItem.sceneryId || 'garden',
    sceneryName: photoItem.sceneryName || 'Pinwheel Garden',
    poseId: photoItem.poseId || 'portrait',
    poseName: photoItem.poseName || 'Syma Potret Cantik',
    frameId: photoItem.frameId || 'sakura',
    frameName: photoItem.frameName || 'Sakura Frame',
    filterId: photoItem.filterId || 'soft_lavender',
    filterName: photoItem.filterName || 'Soft Lavender',
    orientation: photoItem.orientation || 'portrait', // 'portrait' | 'landscape'
    imageDataUrl: photoItem.imageDataUrl || '', // Full resolution captured image
    createdAt: photoItem.createdAt || now,
    updatedAt: now
  };

  // 1. Save full record to IndexedDB
  const db = await openStudioIdb();
  if (db) {
    await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_PHOTOS, 'readwrite');
        tx.objectStore(STORE_PHOTOS).put(record);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  // 2. Save metadata (with small thumbnail or without huge payload) to localStorage
  try {
    const metaList = loadPhotosMetaSync(targetUid);
    const existingIdx = metaList.findIndex((p) => p.id === id);
    const metaEntry = {
      id: record.id,
      uid: record.uid,
      title: record.title,
      caption: record.caption,
      category: record.category,
      isFavorite: record.isFavorite,
      sceneryId: record.sceneryId,
      sceneryName: record.sceneryName,
      frameId: record.frameId,
      filterId: record.filterId,
      orientation: record.orientation,
      createdAt: record.createdAt,
      // Store small thumbnail if available or truncated
      thumbDataUrl: record.imageDataUrl.length < 50000 ? record.imageDataUrl : ''
    };

    if (existingIdx !== -1) {
      metaList[existingIdx] = metaEntry;
    } else {
      metaList.unshift(metaEntry);
    }
    localStorage.setItem(getPhotosMetaKey(targetUid), JSON.stringify(metaList));
  } catch (e) {
    console.warn('[StudioStorage] localStorage photo meta write warning:', e.message);
  }

  return record;
}

export function loadPhotosMetaSync(uid = SYMA_CANONICAL_UID) {
  try {
    const raw = localStorage.getItem(getPhotosMetaKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function loadAllPhotos(uid = SYMA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openStudioIdb();

  if (db) {
    try {
      const records = await new Promise((resolve) => {
        const tx = db.transaction(STORE_PHOTOS, 'readonly');
        const store = tx.objectStore(STORE_PHOTOS);
        const index = store.index('uid');
        const req = index.getAll(targetUid);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      if (records && records.length > 0) {
        // Sort newest first
        records.sort((a, b) => b.createdAt - a.createdAt);
        return records;
      }
    } catch (_) {}
  }

  // Fallback to localStorage metadata
  return loadPhotosMetaSync(targetUid);
}

export async function deletePhoto(photoId, uid = SYMA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openStudioIdb();

  if (db) {
    try {
      await new Promise((resolve) => {
        const tx = db.transaction(STORE_PHOTOS, 'readwrite');
        tx.objectStore(STORE_PHOTOS).delete(photoId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (_) {}
  }

  try {
    const list = loadPhotosMetaSync(targetUid).filter((p) => p.id !== photoId);
    localStorage.setItem(getPhotosMetaKey(targetUid), JSON.stringify(list));
  } catch (_) {}

  return true;
}

export async function toggleFavoritePhoto(photoId, uid = SYMA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const photos = await loadAllPhotos(targetUid);
  const item = photos.find((p) => p.id === photoId);
  if (!item) return false;

  item.isFavorite = !item.isFavorite;
  if (item.isFavorite && item.category === 'Special Moments') {
    item.category = 'Favorites';
  }
  await savePhoto(item, targetUid);
  return item.isFavorite;
}

// =============================================================================
// B. VISION STUDIO STORAGE (THE CREATIVE ATELIER)
// =============================================================================

const LS_ARTWORKS_KEY_PREFIX = 'olu_syma_artworks_meta_';

function getArtworksMetaKey(uid) {
  return `${LS_ARTWORKS_KEY_PREFIX}${getStorageUid(uid)}`;
}

export async function saveArtwork(artworkData, uid = SYMA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const now = Date.now();
  const id = artworkData.id || `art_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const record = {
    id,
    uid: targetUid,
    title: String(artworkData.title || 'Karya Tanpa Judul').trim(),
    category: artworkData.category || 'Digital Art', // 'Digital Art' | 'Posters' | 'Greeting Cards' | 'Scrapbook' | 'Photo Collage'
    type: artworkData.type || 'freehand', // 'freehand' | 'template_editor'
    templateId: artworkData.templateId || 'none',
    dimensions: artworkData.dimensions || { width: 800, height: 600, aspect: '4:3' },
    bgColor: artworkData.bgColor || '#18122B',
    thumbnailDataUrl: artworkData.thumbnailDataUrl || '', // Rendered thumbnail
    canvasDataUrl: artworkData.canvasDataUrl || '', // Full rendered image for display & download
    // Re-editable state:
    editableState: artworkData.editableState || null, // Contains layers, lines, text items, stickers
    createdAt: artworkData.createdAt || now,
    updatedAt: now
  };

  // 1. Save full record into IndexedDB
  const db = await openStudioIdb();
  if (db) {
    await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_ARTWORKS, 'readwrite');
        tx.objectStore(STORE_ARTWORKS).put(record);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      } catch (_) {
        resolve(false);
      }
    });
  }

  // 2. Save metadata to localStorage
  try {
    const metaList = loadArtworksMetaSync(targetUid);
    const existingIdx = metaList.findIndex((a) => a.id === id);
    const metaEntry = {
      id: record.id,
      uid: record.uid,
      title: record.title,
      category: record.category,
      type: record.type,
      templateId: record.templateId,
      dimensions: record.dimensions,
      editableState: record.editableState,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      thumbDataUrl: record.thumbnailDataUrl.length < 50000 ? record.thumbnailDataUrl : ''
    };

    if (existingIdx !== -1) {
      metaList[existingIdx] = metaEntry;
    } else {
      metaList.unshift(metaEntry);
    }
    localStorage.setItem(getArtworksMetaKey(targetUid), JSON.stringify(metaList));
  } catch (e) {
    console.warn('[StudioStorage] localStorage artwork meta write warning:', e.message);
  }

  return record;
}

export function loadArtworksMetaSync(uid = SYMA_CANONICAL_UID) {
  try {
    const raw = localStorage.getItem(getArtworksMetaKey(uid));
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export async function loadAllArtworks(uid = SYMA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openStudioIdb();

  if (db) {
    try {
      const records = await new Promise((resolve) => {
        const tx = db.transaction(STORE_ARTWORKS, 'readonly');
        const store = tx.objectStore(STORE_ARTWORKS);
        const index = store.index('uid');
        const req = index.getAll(targetUid);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });

      if (records && records.length > 0) {
        records.sort((a, b) => b.updatedAt - a.updatedAt);
        return records;
      }
    } catch (_) {}
  }

  return loadArtworksMetaSync(targetUid);
}

export async function getArtworkById(artId, uid = SYMA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openStudioIdb();

  if (db) {
    try {
      const item = await new Promise((resolve) => {
        const tx = db.transaction(STORE_ARTWORKS, 'readonly');
        const store = tx.objectStore(STORE_ARTWORKS);
        const req = store.get(artId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
      if (item && item.uid === targetUid) return item;
    } catch (_) {}
  }

  const all = await loadAllArtworks(targetUid);
  return all.find((a) => a.id === artId) || null;
}

export async function deleteArtwork(artId, uid = SYMA_CANONICAL_UID) {
  const targetUid = getStorageUid(uid);
  const db = await openStudioIdb();

  if (db) {
    try {
      await new Promise((resolve) => {
        const tx = db.transaction(STORE_ARTWORKS, 'readwrite');
        tx.objectStore(STORE_ARTWORKS).delete(artId);
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => resolve(false);
      });
    } catch (_) {}
  }

  try {
    const list = loadArtworksMetaSync(targetUid).filter((a) => a.id !== artId);
    localStorage.setItem(getArtworksMetaKey(targetUid), JSON.stringify(list));
  } catch (_) {}

  return true;
}

export async function renameArtwork(artId, newTitle, uid = SYMA_CANONICAL_UID) {
  const item = await getArtworkById(artId, uid);
  if (!item) return false;
  item.title = String(newTitle).trim() || 'Karya Tanpa Judul';
  await saveArtwork(item, uid);
  return true;
}
