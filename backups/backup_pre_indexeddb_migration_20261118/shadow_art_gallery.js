/**
 * SHADOW — MOONLIT ART GALLERY (LELE'S PERSONAL ART MUSEUM) ENGINE
 *
 * Storage Architecture (FINAL DECISION):
 * - Browser IndexedDB (`olu_shadow_art_gallery_db_v2`) is the SINGLE storage for
 *   original gallery image files (`Blob` / `File` + safe fallback).
 * - ZERO Firebase Storage uploads, reads, relocations, or deletions.
 * - ZERO external storage services (Cloudinary, Supabase Storage, etc.).
 * - Firestore stores artwork metadata (`artworks` & `artwork_notes` +
 *   `universe_states.elements.gallery`) when authenticated.
 * - Strict user UID (`ownerUid`) data separation across IndexedDB & localStorage.
 *
 * Important Cross-Device Note:
 * Because image files live strictly inside browser-local IndexedDB on the active
 * device, uploaded image files persist across refreshes on this same browser/device
 * but DO NOT sync across devices or appear automatically to visitors on other browsers.
 */

import {
  auth,
  CANONICAL_CHARACTERS,
  getVerifiedCharacterKey,
  dbSaveArtwork,
  dbFetchArtworks,
  dbDeleteArtworkSafe
} from './firebase.js';
import {
  getCurrentUniverseState,
  updateElementState
} from './universe_state.js';

export const ARTWORK_STATUSES = {
  published: {
    id: 'published',
    label: 'Published',
    badge: '✦ Tayang di Museum',
    desc: 'Karya siap dipamerkan dan dapat dilihat oleh pengunjung museum.'
  },
  draft: {
    id: 'draft',
    label: 'Draft',
    badge: '🔒 Draft Pribadi',
    desc: 'Masih dalam proses; hanya dapat dilihat oleh Lele.'
  },
  in_development: {
    id: 'in_development',
    label: 'In Development',
    badge: '🛠️ Sedang Dikembangkan',
    desc: 'Sedang disempurnakan; tersembunyi dari pameran publik.'
  }
};

export const DEFAULT_COLLECTIONS = [
  { id: 'nature', name: 'Nature', icon: '🌿', order: 0, isDefault: true },
  { id: 'memories', name: 'Memories', icon: '🕰️', order: 1, isDefault: true },
  { id: 'fantasy', name: 'Fantasy', icon: '✨', order: 2, isDefault: true },
  { id: 'portrait', name: 'Portrait', icon: '🖼️', order: 3, isDefault: true },
  { id: 'abstract', name: 'Abstract', icon: '🌌', order: 4, isDefault: true }
];

export const SUPPORTED_ART_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif'
];
export const MAX_ARTWORK_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

const IDB_NAME = 'olu_shadow_art_gallery_db_v2';
const IDB_LEGACY_V1_NAME = 'olu_shadow_art_gallery_db_v1';
const IDB_VERSION = 1;
const IDB_STORE_ARTWORKS = 'artworks';
const IDB_STORE_FILES = 'artwork_files';
const IDB_STORE_META = 'gallery_meta';
const LS_META_PREFIX = 'olu_shadow_art_gallery_meta_v2_';
const LS_ARTWORKS_LIGHT_PREFIX = 'olu_shadow_art_gallery_cache_v2_';
const LS_LEGACY_META_KEY = 'olu_shadow_art_gallery_meta_v1';
const LS_LEGACY_CACHE_KEY = 'olu_shadow_art_gallery_cache_v1';

// Module State
let artworksStore = [];
let collectionsStore = DEFAULT_COLLECTIONS.map((c) => ({ ...c }));
let favoriteArtworkId = null;
let idbPromise = null;
let listeners = new Set();
let isLoaded = false;
let activeOwnerUid = '';
let activeObjectUrls = new Map(); // artworkId -> objectUrl
let customIdbProvider = undefined; // undefined => use globalThis.indexedDB

let storageDiagnostics = {
  uid: '',
  indexedDbSupported: typeof indexedDB !== 'undefined',
  indexedDbAvailable: typeof indexedDB !== 'undefined',
  storageStatus: 'ready', // 'ready' | 'degraded_fallback' | 'quota_exceeded' | 'unavailable'
  lastStorageError: '',
  quotaEstimate: null,
  corruptedCount: 0,
  missingLocalCount: 0,
  legacyCloudCount: 0,
  legacyCloudArtworks: []
};

// ============================================================================
// PERMISSION & UID ISOLATION HELPERS
// ============================================================================

export function resolveActiveViewerCharacter() {
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
  return 'visitor';
}

export function resolveActiveUserUid(viewerChar = resolveActiveViewerCharacter()) {
  if (auth && auth.currentUser && auth.currentUser.uid) {
    return String(auth.currentUser.uid);
  }
  if (viewerChar === 'lele' || viewerChar === 'nyanya' || viewerChar === 'lala') {
    const canonical = CANONICAL_CHARACTERS && CANONICAL_CHARACTERS[viewerChar];
    if (canonical && canonical.uid) return String(canonical.uid);
  }
  return 'visitor_anonymous';
}

export function verifyMuseumOwner(actorChar = resolveActiveViewerCharacter()) {
  if (actorChar !== 'lele') {
    return {
      allowed: false,
      error: 'Akses ditolak: Hanya Lele (pemilik museum SHADOW) yang dapat mengelola atau melihat karya privat.'
    };
  }
  return { allowed: true };
}

export function sanitizeArtworkForViewer(artwork, { viewerChar = resolveActiveViewerCharacter(), visitorPreview = false } = {}) {
  if (!artwork) return null;
  const isOwnerEffective = viewerChar === 'lele' && !visitorPreview;

  if (!isOwnerEffective && artwork.status !== 'published') {
    return null;
  }

  const baseStory = artwork.story && typeof artwork.story === 'object'
    ? {
        inspiration: String(artwork.story.inspiration || ''),
        meaning: String(artwork.story.meaning || ''),
        process: String(artwork.story.process || '')
      }
    : { inspiration: '', meaning: '', process: '' };

  return {
    ...artwork,
    isOwnerView: isOwnerEffective,
    story: (isOwnerEffective || artwork.storyPublic) ? baseStory : null,
    privateNotes: isOwnerEffective ? String(artwork.privateNotes || '') : ''
  };
}

function makeCompositeKey(uid, id) {
  return `${String(uid || 'visitor_anonymous')}::${String(id || '')}`;
}

function getScopedLsMetaKey(uid) {
  return `${LS_META_PREFIX}${String(uid || 'visitor_anonymous')}`;
}

function getScopedLsCacheKey(uid) {
  return `${LS_ARTWORKS_LIGHT_PREFIX}${String(uid || 'visitor_anonymous')}`;
}

// ============================================================================
// BLOB / OBJECT URL LIFECYCLE HELPERS
// ============================================================================

function revokeTrackedObjectUrl(artworkId) {
  const existing = activeObjectUrls.get(artworkId);
  if (existing && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    try {
      URL.revokeObjectURL(existing);
    } catch (_) {}
  }
  activeObjectUrls.delete(artworkId);
}

function revokeAllTrackedObjectUrls() {
  if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
    activeObjectUrls.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (_) {}
    });
  }
  activeObjectUrls.clear();
}

function dataUrlToBlob(dataUrl, fallbackMime = 'image/jpeg') {
  if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:')) return null;
  if (typeof Blob === 'undefined') return null;
  const commaIdx = dataUrl.indexOf(',');
  if (commaIdx === -1) return null;
  const header = dataUrl.slice(5, commaIdx);
  const body = dataUrl.slice(commaIdx + 1);
  const mimeMatch = header.match(/^([^;]+)/);
  const mime = mimeMatch ? mimeMatch[1] : fallbackMime;
  const isBase64 = /;base64/i.test(header);

  try {
    let bytes;
    if (isBase64) {
      if (typeof atob === 'function') {
        const bin = atob(body);
        bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      } else if (typeof Buffer !== 'undefined') {
        bytes = new Uint8Array(Buffer.from(body, 'base64'));
      } else {
        return null;
      }
    } else {
      const decoded = decodeURIComponent(body);
      bytes = new Uint8Array(decoded.length);
      for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } catch (_) {
    return null;
  }
}

function isBlobLike(val) {
  if (!val || typeof val !== 'object') return false;
  if (typeof Blob !== 'undefined' && val instanceof Blob) return true;
  return typeof val.size === 'number' && typeof val.type === 'string' && typeof val.arrayBuffer === 'function';
}

function createRenderUrlForFileRecord(artworkId, fileRecord) {
  if (!fileRecord) return { url: '', status: 'missing_local', error: 'File gambar tidak ditemukan di penyimpanan lokal IndexedDB.' };

  if (fileRecord.corrupted === true) {
    return { url: '', status: 'corrupted', error: fileRecord.error || 'Data gambar rusak atau tidak dapat dibaca.' };
  }

  const blob = fileRecord.blob;
  if (blob) {
    const size = Number(blob.size ?? fileRecord.sizeBytes ?? 0);
    if (size <= 0) {
      return { url: '', status: 'corrupted', error: 'File gambar di IndexedDB kosong (0 byte).' };
    }
    if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function' && isBlobLike(blob)) {
      try {
        revokeTrackedObjectUrl(artworkId);
        const objUrl = URL.createObjectURL(blob);
        activeObjectUrls.set(artworkId, objUrl);
        return { url: objUrl, status: 'ok', error: '' };
      } catch (_) {}
    }
  }

  if (typeof fileRecord.fallbackDataUrl === 'string' && fileRecord.fallbackDataUrl.startsWith('data:image/')) {
    return { url: fileRecord.fallbackDataUrl, status: 'ok', error: '' };
  }

  return { url: '', status: 'corrupted', error: 'File gambar gagal didekode dari IndexedDB.' };
}

// ============================================================================
// FILE & INPUT VALIDATION
// ============================================================================

export function validateArtworkImageInput({ file, blob, imageDataUrl, mimeType, sizeBytes } = {}) {
  const binary = file || blob;
  if (binary) {
    const type = String(binary.type || mimeType || '').toLowerCase();
    const size = Number(binary.size || 0);

    if (size <= 0) {
      return { valid: false, error: 'File gambar kosong atau rusak. Silakan pilih file gambar yang valid.' };
    }
    if (size > MAX_ARTWORK_SIZE_BYTES) {
      const mb = (size / (1024 * 1024)).toFixed(1);
      return { valid: false, error: `Ukuran file terlalu besar (${mb} MB). Batas maksimal adalah 25 MB.` };
    }
    if (!SUPPORTED_ART_IMAGE_TYPES.includes(type)) {
      return { valid: false, error: 'Format file tidak didukung. Gunakan gambar JPG, PNG, WebP, atau GIF.' };
    }
    return { valid: true, mimeType: type, sizeBytes: size };
  }

  if (imageDataUrl && typeof imageDataUrl === 'string') {
    const trimmed = imageDataUrl.trim();
    if (!trimmed) {
      return { valid: false, error: 'Gambar karya belum dipilih.' };
    }
    if (sizeBytes && Number(sizeBytes) > MAX_ARTWORK_SIZE_BYTES) {
      return { valid: false, error: 'Ukuran gambar melebihi batas maksimal 25 MB.' };
    }

    let detectedMime = String(mimeType || '').toLowerCase();
    if (!detectedMime && trimmed.startsWith('data:')) {
      const m = trimmed.match(/^data:([^;,]+)[;,]/i);
      if (m && m[1]) detectedMime = m[1].toLowerCase();
    }
    if (!detectedMime) detectedMime = 'image/jpeg';

    const validUrl = trimmed.startsWith('data:image/') ||
      trimmed.startsWith('blob:') ||
      SUPPORTED_ART_IMAGE_TYPES.includes(detectedMime);

    if (!validUrl || detectedMime.startsWith('video/')) {
      return { valid: false, error: 'Format gambar karya tidak valid. Hanya gambar JPG, PNG, WebP, atau GIF yang didukung.' };
    }
    return { valid: true, mimeType: detectedMime, sizeBytes: Number(sizeBytes || 0) };
  }

  return { valid: false, error: 'Silakan unggah gambar karya seni terlebih dahulu.' };
}

// ============================================================================
// INDEXEDDB LAYER (UID-ISOLATED, BLOB + METADATA, QUOTA & ERROR HANDLING)
// ============================================================================

function getActiveIndexedDBFactory() {
  if (customIdbProvider !== undefined) return customIdbProvider;
  if (typeof indexedDB !== 'undefined') return indexedDB;
  return null;
}

function isQuotaError(err) {
  if (!err) return false;
  const name = String(err.name || '');
  const msg = String(err.message || '');
  const code = Number(err.code || 0);
  return name === 'QuotaExceededError' ||
    name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    code === 22 ||
    code === 1014 ||
    /quota/i.test(msg);
}

async function refreshQuotaEstimate() {
  try {
    if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.estimate === 'function') {
      const est = await navigator.storage.estimate();
      if (est && Number.isFinite(est.quota) && est.quota > 0) {
        storageDiagnostics.quotaEstimate = {
          usageBytes: Number(est.usage || 0),
          quotaBytes: Number(est.quota),
          percentUsed: Number((((est.usage || 0) / est.quota) * 100).toFixed(2))
        };
        return storageDiagnostics.quotaEstimate;
      }
    }
  } catch (_) {}
  return null;
}

function openGalleryIdb() {
  const idbFactory = getActiveIndexedDBFactory();
  storageDiagnostics.indexedDbSupported = Boolean(idbFactory);
  if (!idbFactory) {
    storageDiagnostics.indexedDbAvailable = false;
    storageDiagnostics.storageStatus = 'unavailable';
    storageDiagnostics.lastStorageError = 'IndexedDB tidak tersedia pada browser atau mode penjelajahan ini.';
    return Promise.resolve(null);
  }
  if (idbPromise) return idbPromise;

  idbPromise = new Promise((resolve) => {
    try {
      const req = idbFactory.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE_ARTWORKS)) {
          const artStore = db.createObjectStore(IDB_STORE_ARTWORKS, { keyPath: 'compositeKey' });
          if (typeof artStore.createIndex === 'function') {
            artStore.createIndex('by_owner', 'ownerUid', { unique: false });
          }
        }
        if (!db.objectStoreNames.contains(IDB_STORE_FILES)) {
          const fileStore = db.createObjectStore(IDB_STORE_FILES, { keyPath: 'compositeKey' });
          if (typeof fileStore.createIndex === 'function') {
            fileStore.createIndex('by_owner', 'ownerUid', { unique: false });
          }
        }
        if (!db.objectStoreNames.contains(IDB_STORE_META)) {
          db.createObjectStore(IDB_STORE_META, { keyPath: 'compositeKey' });
        }
      };
      req.onsuccess = (e) => {
        storageDiagnostics.indexedDbAvailable = true;
        if (storageDiagnostics.storageStatus === 'unavailable') {
          storageDiagnostics.storageStatus = 'ready';
        }
        resolve(e.target.result);
      };
      req.onerror = (e) => {
        const err = e?.target?.error || req.error;
        storageDiagnostics.indexedDbAvailable = false;
        storageDiagnostics.storageStatus = 'unavailable';
        storageDiagnostics.lastStorageError = err?.message || 'Gagal membuka database lokal IndexedDB.';
        idbPromise = null;
        resolve(null);
      };
    } catch (err) {
      storageDiagnostics.indexedDbAvailable = false;
      storageDiagnostics.storageStatus = 'unavailable';
      storageDiagnostics.lastStorageError = err?.message || 'IndexedDB diblokir oleh pengaturan browser.';
      idbPromise = null;
      resolve(null);
    }
  });
  return idbPromise;
}

async function idbPutRecord(storeName, record) {
  const idb = await openGalleryIdb();
  if (!idb) {
    return { ok: false, reason: 'unavailable', error: storageDiagnostics.lastStorageError || 'IndexedDB tidak tersedia.' };
  }
  return new Promise((resolve) => {
    try {
      const tx = idb.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(record);
      tx.oncomplete = () => resolve({ ok: true });
      tx.onerror = (e) => {
        const err = tx.error || e?.target?.error;
        if (isQuotaError(err)) {
          resolve({ ok: false, reason: 'quota_exceeded', error: 'Penyimpanan browser penuh (QuotaExceededError).' });
        } else {
          resolve({ ok: false, reason: 'error', error: err?.message || 'Gagal menulis ke IndexedDB.' });
        }
      };
      tx.onabort = (e) => {
        const err = tx.error || e?.target?.error;
        if (isQuotaError(err)) {
          resolve({ ok: false, reason: 'quota_exceeded', error: 'Penyimpanan browser penuh (QuotaExceededError).' });
        } else {
          resolve({ ok: false, reason: 'aborted', error: err?.message || 'Transaksi IndexedDB dibatalkan.' });
        }
      };
    } catch (err) {
      if (isQuotaError(err)) {
        resolve({ ok: false, reason: 'quota_exceeded', error: 'Penyimpanan browser penuh (QuotaExceededError).' });
      } else {
        resolve({ ok: false, reason: 'error', error: err?.message || 'Gagal mengakses IndexedDB.' });
      }
    }
  });
}

async function idbDeleteRecord(storeName, compositeKey) {
  const idb = await openGalleryIdb();
  if (!idb) return false;
  return new Promise((resolve) => {
    try {
      const tx = idb.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete(compositeKey);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

async function idbGetAllByOwner(storeName, ownerUid) {
  const idb = await openGalleryIdb();
  if (!idb) return null;
  return new Promise((resolve) => {
    try {
      const tx = idb.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      if (typeof store.index === 'function') {
        try {
          const idx = store.index('by_owner');
          const req = idx.getAll(ownerUid);
          req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
          req.onerror = () => resolve(null);
          return;
        } catch (_) {}
      }
      const req = store.getAll();
      req.onsuccess = () => {
        const all = Array.isArray(req.result) ? req.result : [];
        resolve(all.filter((r) => r && r.ownerUid === ownerUid));
      };
      req.onerror = () => resolve(null);
    } catch (_) {
      resolve(null);
    }
  });
}

async function idbGetRecord(storeName, compositeKey) {
  const idb = await openGalleryIdb();
  if (!idb) return null;
  return new Promise((resolve) => {
    try {
      const tx = idb.transaction(storeName, 'readonly');
      const req = tx.objectStore(storeName).get(compositeKey);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    } catch (_) {
      resolve(null);
    }
  });
}

/**
 * Safely checks legacy v1 database (`olu_shadow_art_gallery_db_v1`) once if the owner's
 * v2 store has no entries yet, copying records into Lele's UID-scoped v2 store WITHOUT
 * deleting legacy v1 data automatically.
 */
async function readLegacyV1IfNeeded(ownerUid) {
  if (ownerUid !== CANONICAL_CHARACTERS?.lele?.uid) return { artworks: [], meta: null };
  const idbFactory = getActiveIndexedDBFactory();
  if (!idbFactory) return { artworks: [], meta: null };

  return new Promise((resolve) => {
    try {
      const req = idbFactory.open(IDB_LEGACY_V1_NAME, 1);
      req.onupgradeneeded = (e) => {
        // If v1 did not exist before, abort creation rather than spawning empty legacy db
        try {
          e.target.transaction?.abort();
        } catch (_) {}
      };
      req.onsuccess = (e) => {
        const legacyDb = e.target.result;
        if (!legacyDb.objectStoreNames.contains('artworks')) {
          legacyDb.close?.();
          resolve({ artworks: [], meta: null });
          return;
        }
        try {
          const storeNames = legacyDb.objectStoreNames.contains('gallery_meta')
            ? ['artworks', 'gallery_meta']
            : ['artworks'];
          const tx = legacyDb.transaction(storeNames, 'readonly');
          const artReq = tx.objectStore('artworks').getAll();
          const metaReq = storeNames.includes('gallery_meta')
            ? tx.objectStore('gallery_meta').get('museum_config')
            : null;
          tx.oncomplete = () => {
            const artworks = Array.isArray(artReq.result) ? artReq.result : [];
            const meta = metaReq ? (metaReq.result || null) : null;
            legacyDb.close?.();
            resolve({ artworks, meta });
          };
          tx.onerror = () => {
            legacyDb.close?.();
            resolve({ artworks: [], meta: null });
          };
        } catch (_) {
          legacyDb.close?.();
          resolve({ artworks: [], meta: null });
        }
      };
      req.onerror = () => resolve({ artworks: [], meta: null });
    } catch (_) {
      resolve({ artworks: [], meta: null });
    }
  });
}

function buildMetadataRecordForStorage(art, ownerUid) {
  return {
    compositeKey: makeCompositeKey(ownerUid, art.id),
    ownerUid,
    id: art.id,
    authorUid: art.authorUid || ownerUid,
    author: 'lele',
    universeOrigin: 'shadow',
    title: art.title,
    description: art.description,
    createdDate: art.createdDate,
    collectionId: art.collectionId,
    status: art.status,
    orderIndex: art.orderIndex,
    imageStorageType: 'indexeddb',
    storagePath: art.storagePath || '', // preserved purely for legacy audit, never uploaded/deleted
    mimeType: art.mimeType || 'image/jpeg',
    sizeBytes: Number(art.sizeBytes || 0),
    aspectRatio: art.aspectRatio || 1,
    storyPublic: Boolean(art.storyPublic),
    story: art.story,
    privateNotes: art.privateNotes || '',
    createdAt: art.createdAt,
    updatedAt: art.updatedAt,
    cloudSyncStatus: art.cloudSyncStatus || 'local_only',
    cloudError: art.cloudError || ''
  };
}

function persistLocalFallback(uid = activeOwnerUid || resolveActiveUserUid()) {
  const scopedMetaKey = getScopedLsMetaKey(uid);
  const scopedCacheKey = getScopedLsCacheKey(uid);
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(scopedMetaKey, JSON.stringify({
        uid,
        collections: collectionsStore,
        favoriteArtworkId
      }));
      // Metadata-only cache (plus tiny dataUrls ONLY if IndexedDB is unavailable)
      const light = artworksStore.map((a) => {
        const meta = buildMetadataRecordForStorage(a, uid);
        if (!storageDiagnostics.indexedDbAvailable && typeof a.imageDataUrl === 'string' && a.imageDataUrl.startsWith('data:') && a.imageDataUrl.length < 350000) {
          meta.fallbackDataUrl = a.imageDataUrl;
        }
        return meta;
      });
      localStorage.setItem(scopedCacheKey, JSON.stringify(light));
    }
  } catch (err) {
    if (isQuotaError(err)) {
      storageDiagnostics.storageStatus = 'quota_exceeded';
      storageDiagnostics.lastStorageError = 'Kuota penyimpanan lokal browser (localStorage/IndexedDB) penuh.';
    }
  }
  idbPutRecord(IDB_STORE_META, {
    compositeKey: makeCompositeKey(uid, 'museum_config'),
    ownerUid: uid,
    collections: collectionsStore,
    favoriteArtworkId
  });
}

function updateGalleryDiagnosticsCounters() {
  const legacyItems = artworksStore.filter((a) => Boolean(a.storagePath && String(a.storagePath).trim()));
  const corruptedItems = artworksStore.filter((a) => a.imageStatus === 'corrupted');
  const missingItems = artworksStore.filter((a) => a.imageStatus === 'missing_local');

  storageDiagnostics.legacyCloudCount = legacyItems.length;
  storageDiagnostics.legacyCloudArtworks = legacyItems.map((a) => ({
    id: a.id,
    title: a.title,
    storagePath: a.storagePath,
    status: a.status
  }));
  storageDiagnostics.corruptedCount = corruptedItems.length;
  storageDiagnostics.missingLocalCount = missingItems.length;
}

function notifyListeners() {
  updateGalleryDiagnosticsCounters();
  const snapshot = {
    artworksCount: artworksStore.length,
    collections: getCollections(),
    favoriteArtworkId,
    diagnostics: getGalleryStorageDiagnostics()
  };
  listeners.forEach((cb) => {
    try { cb(snapshot); } catch (_) {}
  });
}

export function subscribeGalleryChanges(callback) {
  if (typeof callback === 'function') {
    listeners.add(callback);
    return () => listeners.delete(callback);
  }
  return () => {};
}

export function getGalleryStorageDiagnostics() {
  updateGalleryDiagnosticsCounters();
  return {
    ...storageDiagnostics,
    legacyCloudArtworks: storageDiagnostics.legacyCloudArtworks.map((i) => ({ ...i }))
  };
}

export function auditLegacyCloudStorageArtworks() {
  updateGalleryDiagnosticsCounters();
  return {
    count: storageDiagnostics.legacyCloudCount,
    items: storageDiagnostics.legacyCloudArtworks.map((i) => ({ ...i }))
  };
}

// ============================================================================
// HYDRATION & FIRESTORE METADATA SYNC
// ============================================================================

function mergeCollections(rawList) {
  if (!Array.isArray(rawList) || rawList.length === 0) {
    return DEFAULT_COLLECTIONS.map((c) => ({ ...c }));
  }
  const map = new Map();
  rawList.forEach((col, idx) => {
    if (col && col.id && col.name) {
      map.set(col.id, {
        id: String(col.id),
        name: String(col.name).trim(),
        icon: String(col.icon || '🎨'),
        order: Number.isFinite(Number(col.order)) ? Number(col.order) : idx,
        isDefault: Boolean(col.isDefault || DEFAULT_COLLECTIONS.some((d) => d.id === col.id))
      });
    }
  });
  DEFAULT_COLLECTIONS.forEach((def) => {
    if (!map.has(def.id)) {
      map.set(def.id, { ...def, order: map.size });
    }
  });
  return Array.from(map.values()).sort((a, b) => a.order - b.order);
}

function normalizeArtworkRecord(raw, fallbackOwnerUid = '') {
  if (!raw || typeof raw !== 'object') return null;
  const status = ['published', 'draft', 'in_development'].includes(raw.status) ? raw.status : 'draft';
  const ownerUid = String(raw.ownerUid || raw.authorUid || fallbackOwnerUid || '');
  return {
    id: String(raw.id || `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`),
    ownerUid,
    authorUid: String(raw.authorUid || ownerUid),
    author: 'lele',
    universeOrigin: 'shadow',
    title: String(raw.title || 'Tanpa Judul').trim(),
    description: String(raw.description || '').trim(),
    createdDate: String(raw.createdDate || new Date(raw.createdAt || Date.now()).toISOString().slice(0, 10)),
    collectionId: String(raw.collectionId || 'memories'),
    status,
    orderIndex: Number.isFinite(Number(raw.orderIndex)) ? Number(raw.orderIndex) : 0,
    imageStorageType: 'indexeddb',
    storagePath: String(raw.storagePath || ''), // preserved if present on legacy records; never uploaded/deleted
    imageDataUrl: String(raw.imageDataUrl || raw.localPreviewUrl || raw.fallbackDataUrl || ''),
    imageStatus: raw.imageStatus || ((raw.imageDataUrl || raw.fallbackDataUrl) ? 'ok' : 'missing_local'),
    imageError: String(raw.imageError || ''),
    mimeType: String(raw.mimeType || 'image/jpeg'),
    sizeBytes: Number(raw.sizeBytes || 0),
    aspectRatio: (Number.isFinite(Number(raw.aspectRatio)) && Number(raw.aspectRatio) > 0) ? Number(raw.aspectRatio) : 1,
    storyPublic: Boolean(raw.storyPublic),
    story: raw.story && typeof raw.story === 'object'
      ? {
          inspiration: String(raw.story.inspiration || ''),
          meaning: String(raw.story.meaning || ''),
          process: String(raw.story.process || '')
        }
      : { inspiration: '', meaning: '', process: '' },
    privateNotes: String(raw.privateNotes || ''),
    createdAt: Number(raw.createdAt || Date.now()),
    updatedAt: Number(raw.updatedAt || raw.createdAt || Date.now()),
    cloudSyncStatus: raw.cloudSyncStatus || 'local_only',
    cloudError: raw.cloudError || ''
  };
}

export async function loadArtGalleryStore(viewerChar = resolveActiveViewerCharacter()) {
  const uid = resolveActiveUserUid(viewerChar);
  activeOwnerUid = uid;
  storageDiagnostics.uid = uid;
  storageDiagnostics.lastStorageError = '';
  storageDiagnostics.storageStatus = 'ready';

  revokeAllTrackedObjectUrls();
  collectionsStore = DEFAULT_COLLECTIONS.map((c) => ({ ...c }));
  favoriteArtworkId = null;

  const localMap = new Map();

  // 1. Read UID-scoped localStorage cache first
  try {
    if (typeof localStorage !== 'undefined') {
      const metaRaw = localStorage.getItem(getScopedLsMetaKey(uid));
      if (metaRaw) {
        const metaParsed = JSON.parse(metaRaw);
        if (metaParsed.collections) collectionsStore = mergeCollections(metaParsed.collections);
        if (metaParsed.favoriteArtworkId !== undefined) favoriteArtworkId = metaParsed.favoriteArtworkId;
      }
      const cacheRaw = localStorage.getItem(getScopedLsCacheKey(uid));
      if (cacheRaw) {
        const arr = JSON.parse(cacheRaw);
        if (Array.isArray(arr)) {
          arr.forEach((item) => {
            if (item && (!item.ownerUid || item.ownerUid === uid)) {
              const norm = normalizeArtworkRecord(item, uid);
              if (norm) localMap.set(norm.id, norm);
            }
          });
        }
      }
    }
  } catch (_) {}

  // 2. Read UID-scoped IndexedDB metadata & files
  const idbMeta = await idbGetRecord(IDB_STORE_META, makeCompositeKey(uid, 'museum_config'));
  if (idbMeta) {
    if (idbMeta.collections) collectionsStore = mergeCollections(idbMeta.collections);
    if (idbMeta.favoriteArtworkId !== undefined) favoriteArtworkId = idbMeta.favoriteArtworkId;
  }

  const idbArtworks = await idbGetAllByOwner(IDB_STORE_ARTWORKS, uid);
  if (Array.isArray(idbArtworks)) {
    idbArtworks.forEach((item) => {
      const norm = normalizeArtworkRecord(item, uid);
      if (norm) localMap.set(norm.id, norm);
    });
  }

  // Non-destructive read migration from legacy v1 store for Lele if v2 is empty
  if (localMap.size === 0 && uid === CANONICAL_CHARACTERS?.lele?.uid && storageDiagnostics.indexedDbAvailable) {
    const legacy = await readLegacyV1IfNeeded(uid);
    if (legacy.meta) {
      if (legacy.meta.collections) collectionsStore = mergeCollections(legacy.meta.collections);
      if (legacy.meta.favoriteArtworkId !== undefined) favoriteArtworkId = legacy.meta.favoriteArtworkId;
    }
    if (legacy.artworks.length > 0) {
      for (const oldItem of legacy.artworks) {
        const norm = normalizeArtworkRecord(oldItem, uid);
        if (!norm) continue;
        localMap.set(norm.id, norm);
        // Copy into v2 metadata & file stores if it had an inline imageDataUrl
        await idbPutRecord(IDB_STORE_ARTWORKS, buildMetadataRecordForStorage(norm, uid));
        if (norm.imageDataUrl && norm.imageDataUrl.startsWith('data:image/')) {
          const blob = dataUrlToBlob(norm.imageDataUrl, norm.mimeType);
          await idbPutRecord(IDB_STORE_FILES, {
            compositeKey: makeCompositeKey(uid, norm.id),
            ownerUid: uid,
            artworkId: norm.id,
            blob: blob || null,
            fallbackDataUrl: norm.imageDataUrl,
            mimeType: norm.mimeType,
            sizeBytes: blob ? blob.size : norm.imageDataUrl.length,
            updatedAt: norm.updatedAt
          });
        }
      }
    }
    // Check legacy v1 localStorage keys for Lele if still empty
    try {
      if (localMap.size === 0 && typeof localStorage !== 'undefined') {
        const legacyCache = localStorage.getItem(LS_LEGACY_CACHE_KEY);
        if (legacyCache) {
          const arr = JSON.parse(legacyCache);
          if (Array.isArray(arr)) {
            arr.forEach((item) => {
              const norm = normalizeArtworkRecord(item, uid);
              if (norm) localMap.set(norm.id, norm);
            });
          }
        }
        const legacyMeta = localStorage.getItem(LS_LEGACY_META_KEY);
        if (legacyMeta) {
          const parsedMeta = JSON.parse(legacyMeta);
          if (parsedMeta.collections) collectionsStore = mergeCollections(parsedMeta.collections);
          if (parsedMeta.favoriteArtworkId !== undefined) favoriteArtworkId = parsedMeta.favoriteArtworkId;
        }
      }
    } catch (_) {}
  }

  // 3. Check universe_states.elements.gallery for collections/favorite metadata
  try {
    const univState = getCurrentUniverseState();
    const gState = univState?.elements?.gallery;
    if (gState) {
      if (Array.isArray(gState.collections) && gState.collections.length > 0) {
        collectionsStore = mergeCollections(gState.collections);
      }
      if (gState.favoriteArtworkId !== undefined) {
        favoriteArtworkId = gState.favoriteArtworkId;
      }
    }
  } catch (_) {}

  // 4. Sync metadata ONLY from Firestore when Firebase Auth is active (NEVER touches Storage)
  if (auth && auth.currentUser) {
    try {
      const cloudItems = await dbFetchArtworks(auth.currentUser);
      cloudItems.forEach((cloudItem) => {
        const norm = normalizeArtworkRecord(cloudItem, cloudItem.authorUid || uid);
        if (!norm) return;
        const localExisting = localMap.get(norm.id);
        if (localExisting && localExisting.imageDataUrl) {
          norm.imageDataUrl = localExisting.imageDataUrl;
          norm.imageStatus = localExisting.imageStatus;
        }
        norm.cloudSyncStatus = 'synced';
        localMap.set(norm.id, norm);
      });
    } catch (err) {
      console.warn('Notice syncing artworks metadata from Firestore:', err);
    }
  }

  // 5. Hydrate binary image files STRICTLY from the active UID's IndexedDB `artwork_files`
  const fileRecordsList = await idbGetAllByOwner(IDB_STORE_FILES, uid);
  const filesMap = new Map();
  if (Array.isArray(fileRecordsList)) {
    fileRecordsList.forEach((f) => {
      if (f && f.artworkId) filesMap.set(f.artworkId, f);
    });
  }

  artworksStore = Array.from(localMap.values()).map((art) => {
    const fileRec = filesMap.get(art.id);
    if (fileRec) {
      const resolved = createRenderUrlForFileRecord(art.id, fileRec);
      art.imageDataUrl = resolved.url;
      art.imageStatus = resolved.status;
      art.imageError = resolved.error;
      art.mimeType = fileRec.mimeType || art.mimeType;
      art.sizeBytes = Number(fileRec.sizeBytes || art.sizeBytes || 0);
    } else if (art.imageDataUrl && (art.imageDataUrl.startsWith('data:image/') || art.imageDataUrl.startsWith('blob:'))) {
      art.imageStatus = 'ok';
      art.imageError = '';
    } else {
      art.imageDataUrl = '';
      art.imageStatus = 'missing_local';
      art.imageError = art.storagePath
        ? 'Karya lama ini masih menyimpan referensi jalur Firebase Storage. Unggah ulang gambar di perangkat ini untuk menyimpannya di IndexedDB.'
        : 'Gambar tersimpan di IndexedDB perangkat/browser lain, atau belum tersedia pada penyimpanan lokal browser ini.';
    }
    return art;
  }).sort((a, b) => {
    if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
    return (b.createdAt || 0) - (a.createdAt || 0);
  });

  if (!storageDiagnostics.indexedDbAvailable) {
    storageDiagnostics.storageStatus = artworksStore.some((a) => a.imageDataUrl) ? 'degraded_fallback' : 'unavailable';
  }

  await refreshQuotaEstimate();
  validateFavoriteIntegrity();

  isLoaded = true;
  notifyListeners();
  return artworksStore;
}

function validateFavoriteIntegrity() {
  if (!favoriteArtworkId) return;
  const fav = artworksStore.find((a) => a.id === favoriteArtworkId);
  if (!fav || fav.status !== 'published') {
    favoriteArtworkId = null;
    syncGalleryMetaToUniverseState();
  }
}

function syncGalleryMetaToUniverseState() {
  const uid = activeOwnerUid || resolveActiveUserUid();
  persistLocalFallback(uid);
  const fav = artworksStore.find((a) => a.id === favoriteArtworkId && a.status === 'published');
  const activeChar = resolveActiveViewerCharacter();
  if (activeChar === 'lele') {
    try {
      const univState = getCurrentUniverseState();
      if (univState && univState.characterKey === 'lele') {
        updateElementState('gallery', {
          paintingTitle: fav ? fav.title : 'Moonlit Art Gallery 🎨',
          exhibited: artworksStore.some((a) => a.status === 'published'),
          favoriteArtworkId: favoriteArtworkId || null,
          collections: collectionsStore
        });
      }
    } catch (_) {}
  }
}

/**
 * Allows the UI to report when an `<img>` element fails to decode a locally stored file.
 */
export function markArtworkImageLoadError(artworkId, reason = 'Gambar tidak dapat dimuat atau didekode dari penyimpanan lokal.') {
  const art = artworksStore.find((a) => a.id === artworkId);
  if (!art) return null;
  art.imageStatus = 'corrupted';
  art.imageError = reason;
  notifyListeners();
  return art;
}

// ============================================================================
// READ QUERIES (WITH STRICT PRIVACY BOUNDARIES)
// ============================================================================

export function getCollections() {
  return [...collectionsStore].sort((a, b) => a.order - b.order);
}

export function getExhibitionArtworks({
  collectionId = 'all',
  viewerChar = resolveActiveViewerCharacter(),
  visitorPreview = false
} = {}) {
  const colFilter = collectionId || 'all';
  return artworksStore
    .filter((art) => {
      if (art.status !== 'published') return false;
      if (colFilter !== 'all' && art.collectionId !== colFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return (b.createdAt || 0) - (a.createdAt || 0);
    })
    .map((art) => sanitizeArtworkForViewer(art, { viewerChar, visitorPreview }))
    .filter(Boolean);
}

export function getStudioArtworks({
  statusFilter = 'all',
  collectionId = 'all',
  viewerChar = resolveActiveViewerCharacter()
} = {}) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) {
    throw new Error(authCheck.error);
  }
  return artworksStore
    .filter((art) => {
      if (statusFilter !== 'all' && art.status !== statusFilter) return false;
      if (collectionId !== 'all' && art.collectionId !== collectionId) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.orderIndex !== b.orderIndex) return a.orderIndex - b.orderIndex;
      return (b.updatedAt || b.createdAt || 0) - (a.updatedAt || a.createdAt || 0);
    })
    .map((art) => sanitizeArtworkForViewer(art, { viewerChar: 'lele', visitorPreview: false }));
}

export function getArtworkById(artworkId, {
  viewerChar = resolveActiveViewerCharacter(),
  visitorPreview = false
} = {}) {
  const raw = artworksStore.find((a) => a.id === artworkId);
  if (!raw) return null;
  return sanitizeArtworkForViewer(raw, { viewerChar, visitorPreview });
}

export function getFavoriteMasterpiece({
  viewerChar = resolveActiveViewerCharacter(),
  visitorPreview = false
} = {}) {
  if (!favoriteArtworkId) return null;
  const raw = artworksStore.find((a) => a.id === favoriteArtworkId && a.status === 'published');
  if (!raw) return null;
  return sanitizeArtworkForViewer(raw, { viewerChar, visitorPreview });
}

export function getArtworkCounts(viewerChar = resolveActiveViewerCharacter()) {
  const pubCount = artworksStore.filter((a) => a.status === 'published').length;
  if (viewerChar !== 'lele') {
    return { published: pubCount, draft: 0, in_development: 0, total: pubCount };
  }
  const draftCount = artworksStore.filter((a) => a.status === 'draft').length;
  const inDevCount = artworksStore.filter((a) => a.status === 'in_development').length;
  return {
    published: pubCount,
    draft: draftCount,
    in_development: inDevCount,
    total: artworksStore.length
  };
}

// ============================================================================
// OWNER MUTATIONS: ARTWORKS (INDEXEDDB IMAGE FILES + FIRESTORE METADATA)
// ============================================================================

export async function saveArtworkItem(input = {}, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) {
    throw new Error(authCheck.error);
  }

  const title = String(input.title || '').trim();
  if (!title) {
    throw new Error('Judul karya wajib diisi.');
  }
  if (title.length > 150) {
    throw new Error('Judul karya maksimal 150 karakter.');
  }

  const ownerUid = resolveActiveUserUid(viewerChar);
  activeOwnerUid = ownerUid;

  const existingIndex = input.id ? artworksStore.findIndex((a) => a.id === input.id) : -1;
  const existing = existingIndex >= 0 ? artworksStore[existingIndex] : null;
  const previousSnapshot = existing ? { ...existing, story: { ...existing.story } } : null;
  const previousFavoriteId = favoriteArtworkId;

  let nextImageDataUrl = existing ? existing.imageDataUrl : '';
  let nextMimeType = existing ? existing.mimeType : 'image/jpeg';
  let nextSizeBytes = existing ? Number(existing.sizeBytes || 0) : 0;
  let nextImageStatus = existing ? (existing.imageStatus || 'missing_local') : 'ok';
  let nextImageError = existing ? (existing.imageError || '') : '';
  let fileRecordToPersist = null;
  const hasNewImageUpload = Boolean(input.file || input.blob || input.newImageDataUrl);

  if (hasNewImageUpload) {
    const val = validateArtworkImageInput({
      file: input.file,
      blob: input.blob,
      imageDataUrl: input.newImageDataUrl,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes
    });
    if (!val.valid) {
      throw new Error(val.error);
    }

    nextMimeType = val.mimeType;
    const rawBlob = input.file || input.blob || dataUrlToBlob(input.newImageDataUrl, nextMimeType);
    const fallbackDataUrl = (typeof input.newImageDataUrl === 'string' && input.newImageDataUrl.startsWith('data:image/'))
      ? input.newImageDataUrl
      : '';
    nextSizeBytes = rawBlob ? Number(rawBlob.size || val.sizeBytes || 0) : Number(val.sizeBytes || fallbackDataUrl.length || 0);

    fileRecordToPersist = {
      blob: rawBlob || null,
      fallbackDataUrl,
      mimeType: nextMimeType,
      sizeBytes: nextSizeBytes
    };

    nextImageStatus = 'ok';
    nextImageError = '';
  } else if (!existing) {
    throw new Error('Silakan pilih dan unggah gambar karya seni terlebih dahulu.');
  }

  const nextStatus = ['published', 'draft', 'in_development'].includes(input.status)
    ? input.status
    : (existing ? existing.status : 'draft');

  const now = Date.now();
  const artworkId = existing ? existing.id : `art-${now}-${Math.random().toString(36).slice(2, 8)}`;

  // Pre-build ObjectURL or dataUrl preview if new image uploaded
  if (hasNewImageUpload && fileRecordToPersist) {
    if (fileRecordToPersist.blob && isBlobLike(fileRecordToPersist.blob) && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
      revokeTrackedObjectUrl(artworkId);
      const objUrl = URL.createObjectURL(fileRecordToPersist.blob);
      activeObjectUrls.set(artworkId, objUrl);
      nextImageDataUrl = objUrl;
    } else if (fileRecordToPersist.fallbackDataUrl) {
      nextImageDataUrl = fileRecordToPersist.fallbackDataUrl;
    }
  }

  const nextRecord = normalizeArtworkRecord({
    id: artworkId,
    ownerUid,
    authorUid: ownerUid,
    author: 'lele',
    universeOrigin: 'shadow',
    title,
    description: input.description !== undefined ? String(input.description).trim() : (existing?.description || ''),
    createdDate: input.createdDate || existing?.createdDate || new Date().toISOString().slice(0, 10),
    collectionId: input.collectionId || existing?.collectionId || 'memories',
    status: nextStatus,
    orderIndex: existing ? existing.orderIndex : artworksStore.length,
    imageStorageType: 'indexeddb',
    storagePath: existing?.storagePath || '', // never write/touch Firebase Storage
    imageDataUrl: nextImageDataUrl,
    imageStatus: nextImageStatus,
    imageError: nextImageError,
    mimeType: nextMimeType,
    sizeBytes: nextSizeBytes,
    aspectRatio: (Number.isFinite(Number(input.aspectRatio)) && Number(input.aspectRatio) > 0)
      ? Number(input.aspectRatio)
      : (existing?.aspectRatio || 1),
    storyPublic: input.storyPublic !== undefined ? Boolean(input.storyPublic) : Boolean(existing?.storyPublic),
    story: {
      inspiration: input.story?.inspiration !== undefined ? String(input.story.inspiration) : (existing?.story?.inspiration || ''),
      meaning: input.story?.meaning !== undefined ? String(input.story.meaning) : (existing?.story?.meaning || ''),
      process: input.story?.process !== undefined ? String(input.story.process) : (existing?.story?.process || '')
    },
    privateNotes: input.privateNotes !== undefined ? String(input.privateNotes) : (existing?.privateNotes || ''),
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
    cloudSyncStatus: 'local_only'
  }, ownerUid);

  // 1. Persist binary file in IndexedDB BEFORE committing in-memory updates so QuotaExceeded / Unavailable aborts cleanly
  if (hasNewImageUpload && fileRecordToPersist) {
    const fileWriteRes = await idbPutRecord(IDB_STORE_FILES, {
      compositeKey: makeCompositeKey(ownerUid, artworkId),
      ownerUid,
      artworkId,
      blob: fileRecordToPersist.blob,
      fallbackDataUrl: fileRecordToPersist.fallbackDataUrl,
      mimeType: fileRecordToPersist.mimeType,
      sizeBytes: fileRecordToPersist.sizeBytes,
      updatedAt: now
    });

    if (!fileWriteRes.ok) {
      if (hasNewImageUpload && previousSnapshot && previousSnapshot.imageDataUrl) {
        revokeTrackedObjectUrl(artworkId);
      }
      if (fileWriteRes.reason === 'quota_exceeded') {
        storageDiagnostics.storageStatus = 'quota_exceeded';
        storageDiagnostics.lastStorageError = 'Penyimpanan browser penuh. Karya lama tetap aman tidak berubah.';
        notifyListeners();
        throw new Error('Penyimpanan lokal browser (IndexedDB) penuh. Kosongkan ruang penyimpanan atau hapus karya lain terlebih dahulu; data sebelumnya tetap aman.');
      }
      if (fileWriteRes.reason === 'unavailable') {
        // Fallback only for small dataUrl in localStorage if IndexedDB unavailable
        const canFitFallback = Boolean(
          fileRecordToPersist.fallbackDataUrl &&
          fileRecordToPersist.fallbackDataUrl.length < 350000 &&
          typeof localStorage !== 'undefined'
        );
        if (!canFitFallback) {
          storageDiagnostics.storageStatus = 'unavailable';
          storageDiagnostics.lastStorageError = 'IndexedDB tidak tersedia untuk menyimpan file gambar karya seni.';
          notifyListeners();
          throw new Error('IndexedDB tidak tersedia di browser ini untuk menyimpan file gambar asli. Karya lama tetap aman.');
        }
        storageDiagnostics.storageStatus = 'degraded_fallback';
      } else {
        throw new Error(fileWriteRes.error || 'Gagal menyimpan file gambar ke IndexedDB.');
      }
    }
  }

  // 2. Persist metadata in IndexedDB `artworks`
  const metaWriteRes = await idbPutRecord(IDB_STORE_ARTWORKS, buildMetadataRecordForStorage(nextRecord, ownerUid));
  if (!metaWriteRes.ok && metaWriteRes.reason === 'quota_exceeded') {
    if (hasNewImageUpload && !existing) {
      await idbDeleteRecord(IDB_STORE_FILES, makeCompositeKey(ownerUid, artworkId));
    }
    if (previousSnapshot && existingIndex >= 0) {
      artworksStore[existingIndex] = previousSnapshot;
    }
    favoriteArtworkId = previousFavoriteId;
    storageDiagnostics.storageStatus = 'quota_exceeded';
    storageDiagnostics.lastStorageError = 'Penyimpanan metadata di IndexedDB penuh.';
    notifyListeners();
    throw new Error('Penyimpanan lokal browser (IndexedDB) penuh saat menyimpan metadata karya. Data sebelumnya tetap aman.');
  }

  // 3. Commit to in-memory store
  if (existingIndex >= 0) {
    artworksStore[existingIndex] = nextRecord;
  } else {
    artworksStore.push(nextRecord);
  }

  if (favoriteArtworkId === artworkId && nextStatus !== 'published') {
    favoriteArtworkId = null;
  }

  await refreshQuotaEstimate();
  syncGalleryMetaToUniverseState();

  // 4. Sync metadata ONLY to Firestore if Lele is authenticated (NEVER Firebase Storage)
  if (auth && auth.currentUser && getVerifiedCharacterKey(auth.currentUser) === 'lele') {
    try {
      await dbSaveArtwork(nextRecord, auth.currentUser);
      nextRecord.cloudSyncStatus = 'synced';
      nextRecord.cloudError = '';
    } catch (cloudErr) {
      console.warn('Notice syncing artwork metadata to Firestore:', cloudErr);
      nextRecord.cloudSyncStatus = 'pending_rules';
      nextRecord.cloudError = cloudErr.message || 'Gagal menyinkronkan metadata ke Firestore.';
    }
    await idbPutRecord(IDB_STORE_ARTWORKS, buildMetadataRecordForStorage(nextRecord, ownerUid));
    persistLocalFallback(ownerUid);
  }

  notifyListeners();
  return sanitizeArtworkForViewer(nextRecord, { viewerChar: 'lele', visitorPreview: false });
}

export async function updateArtworkStatus(artworkId, newStatus, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) throw new Error(authCheck.error);
  if (!['published', 'draft', 'in_development'].includes(newStatus)) {
    throw new Error('Status karya tidak valid.');
  }
  const existing = artworksStore.find((a) => a.id === artworkId);
  if (!existing) throw new Error('Karya tidak ditemukan.');

  return await saveArtworkItem({ id: artworkId, title: existing.title, status: newStatus }, viewerChar);
}

export async function moveArtworkToCollection(artworkId, collectionId, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) throw new Error(authCheck.error);
  const existing = artworksStore.find((a) => a.id === artworkId);
  if (!existing) throw new Error('Karya tidak ditemukan.');

  return await saveArtworkItem({ id: artworkId, title: existing.title, collectionId }, viewerChar);
}

export async function reorderArtwork(artworkId, direction, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) throw new Error(authCheck.error);

  const ownerUid = activeOwnerUid || resolveActiveUserUid(viewerChar);
  artworksStore.sort((a, b) => a.orderIndex - b.orderIndex);
  const idx = artworksStore.findIndex((a) => a.id === artworkId);
  if (idx === -1) return false;

  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= artworksStore.length) return false;

  const temp = artworksStore[idx];
  artworksStore[idx] = artworksStore[swapIdx];
  artworksStore[swapIdx] = temp;

  for (let i = 0; i < artworksStore.length; i++) {
    artworksStore[i].orderIndex = i;
    await idbPutRecord(IDB_STORE_ARTWORKS, buildMetadataRecordForStorage(artworksStore[i], ownerUid));
  }
  persistLocalFallback(ownerUid);

  if (auth && auth.currentUser && getVerifiedCharacterKey(auth.currentUser) === 'lele') {
    for (const item of [artworksStore[idx], artworksStore[swapIdx]]) {
      try {
        await dbSaveArtwork(item, auth.currentUser);
      } catch (_) {}
    }
  }

  notifyListeners();
  return true;
}

export async function deleteArtworkItem(artworkId, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) throw new Error(authCheck.error);

  const ownerUid = activeOwnerUid || resolveActiveUserUid(viewerChar);
  const idx = artworksStore.findIndex((a) => a.id === artworkId);
  if (idx === -1) throw new Error('Karya tidak ditemukan.');

  artworksStore.splice(idx, 1);
  revokeTrackedObjectUrl(artworkId);

  if (favoriteArtworkId === artworkId) {
    favoriteArtworkId = null;
  }

  const key = makeCompositeKey(ownerUid, artworkId);
  await idbDeleteRecord(IDB_STORE_ARTWORKS, key);
  await idbDeleteRecord(IDB_STORE_FILES, key);
  await refreshQuotaEstimate();
  syncGalleryMetaToUniverseState();

  if (auth && auth.currentUser && getVerifiedCharacterKey(auth.currentUser) === 'lele') {
    try {
      await dbDeleteArtworkSafe(artworkId, auth.currentUser);
    } catch (err) {
      console.warn('Notice deleting artwork metadata from Firestore:', err);
    }
  }

  notifyListeners();
  return { success: true, artworkId };
}

// ============================================================================
// MY FAVORITE MASTERPIECE
// ============================================================================

export function setFavoriteMasterpiece(artworkId, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) throw new Error(authCheck.error);

  if (!artworkId) {
    favoriteArtworkId = null;
    syncGalleryMetaToUniverseState();
    notifyListeners();
    return null;
  }

  const art = artworksStore.find((a) => a.id === artworkId);
  if (!art) {
    throw new Error('Karya tidak ditemukan.');
  }
  if (art.status !== 'published') {
    throw new Error('Hanya karya berstatus Published yang boleh dijadikan karya utama publik (My Favorite Masterpiece).');
  }

  favoriteArtworkId = artworkId;
  syncGalleryMetaToUniverseState();
  notifyListeners();
  return sanitizeArtworkForViewer(art, { viewerChar: 'lele', visitorPreview: false });
}

// ============================================================================
// CURATED COLLECTIONS MANAGEMENT
// ============================================================================

export function createCustomCollection({ name, icon = '🎨' } = {}, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) throw new Error(authCheck.error);

  const trimmed = String(name || '').trim();
  if (!trimmed) throw new Error('Nama koleksi wajib diisi.');
  if (trimmed.length > 40) throw new Error('Nama koleksi maksimal 40 karakter.');

  const slug = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  const id = collectionsStore.some((c) => c.id === slug)
    ? `${slug}_${Date.now().toString(36).slice(-4)}`
    : (slug || `col_${Date.now().toString(36)}`);

  const newCol = {
    id,
    name: trimmed,
    icon: String(icon || '🎨').slice(0, 8),
    order: collectionsStore.length,
    isDefault: false
  };
  collectionsStore.push(newCol);
  syncGalleryMetaToUniverseState();
  notifyListeners();
  return newCol;
}

export function renameCollection(collectionId, newName, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) throw new Error(authCheck.error);

  const trimmed = String(newName || '').trim();
  if (!trimmed) throw new Error('Nama koleksi tidak boleh kosong.');
  const col = collectionsStore.find((c) => c.id === collectionId);
  if (!col) throw new Error('Koleksi tidak ditemukan.');

  col.name = trimmed.slice(0, 40);
  syncGalleryMetaToUniverseState();
  notifyListeners();
  return col;
}

export async function deleteCustomCollection(collectionId, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) throw new Error(authCheck.error);

  const ownerUid = activeOwnerUid || resolveActiveUserUid(viewerChar);
  const col = collectionsStore.find((c) => c.id === collectionId);
  if (!col) throw new Error('Koleksi tidak ditemukan.');
  if (col.isDefault) {
    throw new Error('Koleksi bawaan museum tidak dapat dihapus.');
  }

  collectionsStore = collectionsStore.filter((c) => c.id !== collectionId);
  collectionsStore.forEach((c, i) => { c.order = i; });

  for (const art of artworksStore) {
    if (art.collectionId === collectionId) {
      art.collectionId = 'memories';
      await idbPutRecord(IDB_STORE_ARTWORKS, buildMetadataRecordForStorage(art, ownerUid));
      if (auth && auth.currentUser && getVerifiedCharacterKey(auth.currentUser) === 'lele') {
        try { await dbSaveArtwork(art, auth.currentUser); } catch (_) {}
      }
    }
  }

  syncGalleryMetaToUniverseState();
  notifyListeners();
  return true;
}

export function reorderCollection(collectionId, direction, viewerChar = resolveActiveViewerCharacter()) {
  const authCheck = verifyMuseumOwner(viewerChar);
  if (!authCheck.allowed) throw new Error(authCheck.error);

  collectionsStore.sort((a, b) => a.order - b.order);
  const idx = collectionsStore.findIndex((c) => c.id === collectionId);
  if (idx === -1) return false;
  const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= collectionsStore.length) return false;

  const temp = collectionsStore[idx];
  collectionsStore[idx] = collectionsStore[swapIdx];
  collectionsStore[swapIdx] = temp;
  collectionsStore.forEach((c, i) => { c.order = i; });

  syncGalleryMetaToUniverseState();
  notifyListeners();
  return true;
}

export function getStoreLoadedState() {
  return isLoaded;
}

// ============================================================================
// TEST HOOKS (NODE UNIT TESTING WITHOUT MOCKING REAL BROWSER STORAGE)
// ============================================================================

export function setIndexedDBProviderForTest(provider) {
  customIdbProvider = provider;
  idbPromise = null;
}

export function clearMemoryGalleryStoreForTest({ keepPersistent = false } = {}) {
  revokeAllTrackedObjectUrls();
  artworksStore = [];
  collectionsStore = DEFAULT_COLLECTIONS.map((c) => ({ ...c }));
  favoriteArtworkId = null;
  isLoaded = false;
  activeOwnerUid = '';
  if (!keepPersistent) {
    idbPromise = null;
  }
  storageDiagnostics = {
    uid: '',
    indexedDbSupported: Boolean(getActiveIndexedDBFactory()),
    indexedDbAvailable: Boolean(getActiveIndexedDBFactory()),
    storageStatus: 'ready',
    lastStorageError: '',
    quotaEstimate: null,
    corruptedCount: 0,
    missingLocalCount: 0,
    legacyCloudCount: 0,
    legacyCloudArtworks: []
  };
  notifyListeners();
}
