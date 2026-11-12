/**
 * OUR LITTLE MOMENTS — PERSISTENT STORY & PERSONAL GALLERY ENGINE
 *
 * Implements:
 * 1. Persistent Story & Gallery storage (IndexedDB `olu_moments_db_v1` + synchronous
 *    `localStorage` cache + `BroadcastChannel` cross-tab sync).
 * 2. Photo & Video support (`image/*` and `video/*`) with validation.
 * 3. 24-Hour Active Story lifespan (`STORY_LIFESPAN_MS = 24 * 60 * 60 * 1000`).
 *    After 24 hours, stories automatically expire from the Stories Sahabat tray
 *    while remaining permanently stored in the creator's Personal Gallery archive.
 * 4. Automatic integration between Stories and each user's Personal Gallery
 *    (Nyanya ⭐, Lala ☀️, Lele 🌙) without re-uploading.
 * 5. Strict Role-Based Access Control (RBAC) & Privacy enforcement:
 *    - Active stories (<= 24h, visibility !== 'private') are viewable by all 3 friends.
 *    - Personal expired story archives (> 24h, not pinned to shared Arsip Kita) and
 *      private gallery items (`visibility === 'private'`) are strictly accessible
 *      ONLY to their owner (`author === activeUserCharacter`).
 *    - Non-owners are strictly blocked from editing privacy or deleting another user's items.
 */

import {
  auth,
  dbUploadMomentMedia,
  dbSaveMoment,
  dbDeleteMomentSafe,
  dbFetchMoments,
  dbSubscribeMoments,
  dbMigrateMoments,
  dbCreateMomentObjectURL,
  dbRevokeMomentObjectURL,
  dbRevokeAllMomentObjectURLs
} from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

export const STORY_LIFESPAN_MS = 24 * 60 * 60 * 1000; // 24 Hours in milliseconds (86,400,000 ms)

const STORAGE_KEY_V2 = 'olu_moments_store_v2';
const ACTIVE_CHAR_STORAGE_KEY = 'olu_moments_active_char_v1';
const IDB_NAME = 'olu_moments_db_v1';
const IDB_VERSION = 1;
const IDB_STORE_NAME = 'moments_items';
const BROADCAST_CHANNEL_NAME = 'olu_moments_sync_v1';

//Supported Media MIME Types & Max File Size (25 MB)
export const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
export const SUPPORTED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
export const MAX_MEDIA_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const CHARACTERS_MOMENTS = {
  nyanya: {
    id: 'nyanya',
    name: 'Nyanya',
    fullName: 'Alenda (Nyanya)',
    role: 'The Moonlit Shadow Witch',
    universe: 'KIDULT',
    symbol: '⭐',
    accentColor: '#c084fc',
    avatar: '/assets/avatar_nyanya_hd.png'
  },
  lala: {
    id: 'lala',
    name: 'Lala',
    fullName: 'Bella (Lala)',
    role: 'The Everglow Fairy',
    universe: 'TO YOU',
    symbol: '☀️',
    accentColor: '#f472b6',
    avatar: '/assets/avatar_lala_hd.png'
  },
  lele: {
    id: 'lele',
    name: 'Lele',
    fullName: 'Vanya (Lele)',
    role: 'The Eclipse Guardian',
    universe: 'SHADOW',
    symbol: '🌙',
    accentColor: '#818cf8',
    avatar: '/assets/avatar_lele_hd.png'
  }
};

// --- Active State ---
let activeUserCharacter = loadSavedActiveCharacter();
let activeFilter = 'all'; // 'all' | 'nyanya' | 'lala' | 'lele' | 'archive'
let momentsStore = []; // Unified persistent list of Story + Gallery records
let listeners = [];
let idbReadyPromise = null;
let broadcastChannel = null;

function loadSavedActiveCharacter() {
  try {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(ACTIVE_CHAR_STORAGE_KEY);
      if (saved && CHARACTERS_MOMENTS[saved]) {
        return saved;
      }
      // Also check global session character if present
      const pbSession = localStorage.getItem('olu_pb_active_char');
      if (pbSession && CHARACTERS_MOMENTS[pbSession]) {
        return pbSession;
      }
    }
  } catch (_) {
    // Ignore storage access errors in restricted environments
  }
  return 'nyanya';
}

// --- Format Relative Timestamp in Indonesian ---
export function formatRelativeTime(publishedAtMs, nowMs = Date.now()) {
  const ts = Number(publishedAtMs);
  if (!Number.isFinite(ts) || ts <= 0) return 'Baru saja';

  const diffMs = Math.max(0, nowMs - ts);
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Baru saja';

  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit yang lalu`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours} jam yang lalu`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Kemarin (Arsip 24j+)';
  if (diffDays < 7) return `${diffDays} hari yang lalu`;

  const dateObj = new Date(ts);
  return dateObj.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

// --- Normalize Record Schema ---
function normalizeRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const authorKey = CHARACTERS_MOMENTS[raw.author] ? raw.author : 'nyanya';
  const char = CHARACTERS_MOMENTS[authorKey];

  const publishedAt = Number.isFinite(Number(raw.publishedAt))
    ? Number(raw.publishedAt)
    : Number.isFinite(Number(raw.createdAt))
      ? Number(raw.createdAt)
      : typeof raw.timestamp === 'number'
        ? raw.timestamp
        : Date.now();

  const expiresAt = Number.isFinite(Number(raw.expiresAt))
    ? Number(raw.expiresAt)
    : publishedAt + STORY_LIFESPAN_MS;

  const mediaUrl = raw.mediaUrl || raw.photoUrl || '';
  const mimeType = raw.mimeType || inferMimeType(mediaUrl);
  const mediaType = raw.mediaType || (mimeType.startsWith('video/') ? 'video' : 'image');

  const viewedBy = raw.viewedBy && typeof raw.viewedBy === 'object'
    ? {
        nyanya: Boolean(raw.viewedBy.nyanya),
        lala: Boolean(raw.viewedBy.lala),
        lele: Boolean(raw.viewedBy.lele)
      }
    : {
        nyanya: authorKey === 'nyanya',
        lala: authorKey === 'lala',
        lele: authorKey === 'lele'
      };

  const likedBy = raw.likedBy && typeof raw.likedBy === 'object'
    ? {
        nyanya: Boolean(raw.likedBy.nyanya),
        lala: Boolean(raw.likedBy.lala),
        lele: Boolean(raw.likedBy.lele)
      }
    : {};

  const likesCount = Number.isFinite(Number(raw.likes))
    ? Math.max(0, Number(raw.likes))
    : Object.values(likedBy).filter(Boolean).length;

  const visibility = raw.visibility === 'private' ? 'private' : 'friends';
  const isStory = raw.isStory !== undefined ? Boolean(raw.isStory) : true;
  const isArchived = Boolean(raw.isArchived);

  return {
    id: String(raw.id || `story-${publishedAt}-${Math.random().toString(36).slice(2, 8)}`),
    author: authorKey,
    authorName: char.name,
    authorFullName: char.fullName,
    authorRole: char.role,
    authorSymbol: char.symbol,
    authorAvatar: char.avatar,
    avatar: char.avatar,
    location: raw.location || `Universe ${char.universe}`,
    mediaUrl,
    photoUrl: mediaUrl, // Backward-compatible alias
    storagePath: raw.storagePath || '',
    mediaType, // 'image' | 'video'
    mimeType,
    caption: typeof raw.caption === 'string' ? raw.caption.trim() : '',
    publishedAt,
    createdAt: publishedAt,
    expiresAt,
    isStory,
    visibility, // 'friends' | 'private'
    isArchived, // true when saved to shared 'Arsip Kita'
    viewedBy,
    likedBy,
    likes: likesCount,
    isDeleted: Boolean(raw.isDeleted),
    deleteStatus: raw.deleteStatus || 'active'
  };
}

function inferMimeType(dataUrlOrPath) {
  if (!dataUrlOrPath || typeof dataUrlOrPath !== 'string') return 'image/jpeg';
  if (dataUrlOrPath.startsWith('data:')) {
    const match = dataUrlOrPath.match(/^data:([^;,]+)[;,]/i);
    if (match && match[1]) return match[1].toLowerCase();
  }
  const lower = dataUrlOrPath.toLowerCase();
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.webm')) return 'video/webm';
  if (lower.endsWith('.ogg') || lower.endsWith('.ogv')) return 'video/ogg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

// --- Validate Media File / Data Before Upload ---
export function validateStoryMediaInput({ file, mediaUrl, mimeType, sizeBytes } = {}) {
  if (file) {
    const type = (file.type || '').toLowerCase();
    const size = Number(file.size || 0);

    if (size <= 0) {
      return {
        valid: false,
        error: 'File kosong atau rusak. Silakan pilih file foto atau video yang valid.'
      };
    }

    if (size > MAX_MEDIA_SIZE_BYTES) {
      const sizeMb = (size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Ukuran file terlalu besar (${sizeMb} MB). Maksimal ukuran foto/video adalah 25 MB.`
      };
    }

    const isSupportedImage = SUPPORTED_IMAGE_TYPES.includes(type) || type.startsWith('image/');
    const isSupportedVideo = SUPPORTED_VIDEO_TYPES.includes(type) || type.startsWith('video/');

    if (!isSupportedImage && !isSupportedVideo) {
      return {
        valid: false,
        error: 'Format file tidak didukung. Gunakan foto (JPG, PNG, WebP, GIF) atau video (MP4, WebM, OGG).'
      };
    }

    return {
      valid: true,
      mediaType: isSupportedVideo ? 'video' : 'image',
      mimeType: type
    };
  }

  if (mediaUrl && typeof mediaUrl === 'string') {
    const trimmed = mediaUrl.trim();
    if (!trimmed) {
      return {
        valid: false,
        error: 'Konten media kosong. Silakan pilih foto atau video terlebih dahulu.'
      };
    }

    if (sizeBytes && Number(sizeBytes) > MAX_MEDIA_SIZE_BYTES) {
      return {
        valid: false,
        error: 'Ukuran file melebihi batas maksimal 25 MB.'
      };
    }

    const detectedMime = (mimeType || inferMimeType(trimmed)).toLowerCase();
    const isImage = detectedMime.startsWith('image/') || trimmed.startsWith('/assets/') || trimmed.startsWith('blob:') || trimmed.startsWith('http');
    const isVideo = detectedMime.startsWith('video/');

    if (!isImage && !isVideo) {
      return {
        valid: false,
        error: 'Format media tidak dikenali. Gunakan foto atau video yang didukung.'
      };
    }

    return {
      valid: true,
      mediaType: isVideo ? 'video' : 'image',
      mimeType: detectedMime
    };
  }

  return {
    valid: false,
    error: 'Silakan pilih foto atau video terlebih dahulu sebelum membagikan Story.'
  };
}

// --- IndexedDB & LocalStorage Persistence Layer ---
function openMomentsIdb() {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  if (idbReadyPromise) return idbReadyPromise;

  idbReadyPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(IDB_NAME, IDB_VERSION);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(IDB_STORE_NAME)) {
          const store = db.createObjectStore(IDB_STORE_NAME, { keyPath: 'id' });
          store.createIndex('author', 'author', { unique: false });
          store.createIndex('publishedAt', 'publishedAt', { unique: false });
        }
      };
      request.onsuccess = (event) => {
        resolve(event.target.result);
      };
      request.onerror = () => {
        resolve(null);
      };
    } catch (_) {
      resolve(null);
    }
  });

  return idbReadyPromise;
}

async function saveAllToIdb(records) {
  const db = await openMomentsIdb();
  if (!db) return false;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_NAME, 'readwrite');
      const store = tx.objectStore(IDB_STORE_NAME);
      store.clear();
      records.forEach((rec) => {
        store.put(rec);
      });
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

async function readAllFromIdb() {
  const db = await openMomentsIdb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IDB_STORE_NAME, 'readonly');
      const store = tx.objectStore(IDB_STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        resolve(Array.isArray(req.result) ? req.result : []);
      };
      req.onerror = () => resolve(null);
    } catch (_) {
      resolve(null);
    }
  });
}

function saveToLocalStorageSync(records) {
  if (typeof localStorage === 'undefined') return;
  try {
    const serialized = JSON.stringify(records);
    localStorage.setItem(STORAGE_KEY_V2, serialized);
  } catch (quotaErr) {
    // If a large video dataURL exceeds localStorage 5MB quota, store lightweight metadata in localStorage
    // while IndexedDB holds the full binary/dataURL payload.
    try {
      const compactRecords = records.map((r) => {
        if (r.mediaUrl && r.mediaUrl.length > 250000) {
          return { ...r, mediaUrl: '', photoUrl: '', mediaStoredInIdb: true };
        }
        return r;
      });
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(compactRecords));
    } catch (_) {
      // Ignore secondary quota error
    }
  }
}

function loadFromLocalStorageSync() {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeRecord).filter(Boolean);
  } catch (_) {
    return [];
  }
}

let storeMutationCounter = 0;

function persistMomentsState(broadcast = true) {
  storeMutationCounter += 1;
  // Sort newest first
  momentsStore.sort((a, b) => b.publishedAt - a.publishedAt);
  saveToLocalStorageSync(momentsStore);
  saveAllToIdb(momentsStore);

  if (broadcast && broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'MOMENTS_UPDATED', timestamp: Date.now() });
    } catch (_) {
      // Ignore broadcast errors
    }
  }
}

export async function reloadMomentsFromStorage() {
  const startCounter = storeMutationCounter;
  const localRecords = loadFromLocalStorageSync();
  const idbRecords = await readAllFromIdb();

  // If a synchronous mutation occurred while awaiting IndexedDB, keep the newer in-memory store
  if (storeMutationCounter !== startCounter) {
    return momentsStore;
  }

  if (Array.isArray(idbRecords) && idbRecords.length > 0) {
    const normalizedIdb = idbRecords.map(normalizeRecord).filter(Boolean);
    const idbById = new Map();
    normalizedIdb.forEach((item) => idbById.set(item.id, item));

    if (localRecords.length > 0) {
      // Keep localStorage metadata as authoritative and restore any large mediaUrl from IndexedDB
      momentsStore = localRecords.map((locItem) => {
        const idbItem = idbById.get(locItem.id);
        if (!locItem.mediaUrl && idbItem && idbItem.mediaUrl) {
          return { ...locItem, mediaUrl: idbItem.mediaUrl, photoUrl: idbItem.mediaUrl };
        }
        return locItem;
      }).sort((a, b) => b.publishedAt - a.publishedAt);
    } else {
      momentsStore = normalizedIdb.sort((a, b) => b.publishedAt - a.publishedAt);
    }
    saveToLocalStorageSync(momentsStore);
  } else {
    momentsStore = localRecords.sort((a, b) => b.publishedAt - a.publishedAt);
    if (momentsStore.length > 0) {
      await saveAllToIdb(momentsStore);
    }
  }

  notifyListeners();
  return momentsStore;
}

// Initialize store synchronously from localStorage, then hydrate any large blobs from IndexedDB
momentsStore = loadFromLocalStorageSync();
reloadMomentsFromStorage();

// Setup cross-tab sync
if (typeof BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === 'MOMENTS_UPDATED') {
        reloadMomentsFromStorage();
      }
    };
  } catch (_) {
    broadcastChannel = null;
  }
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY_V2) {
      momentsStore = loadFromLocalStorageSync();
      notifyListeners();
    } else if (event.key === ACTIVE_CHAR_STORAGE_KEY && event.newValue && CHARACTERS_MOMENTS[event.newValue]) {
      activeUserCharacter = event.newValue;
      notifyListeners();
    }
  });
}

// --- 24-Hour Expiration Check ---
export function isStoryActive(item, nowMs = Date.now()) {
  if (!item || !item.isStory) return false;
  const pub = Number(item.publishedAt);
  if (!Number.isFinite(pub) || pub <= 0) return false;
  const elapsed = nowMs - pub;
  return elapsed >= 0 && elapsed <= STORY_LIFESPAN_MS;
}

// --- Privacy & Access Control Rules ---
/**
 * Determines whether `viewerChar` is allowed to view `item` in a given context.
 * Rules:
 * 1. Owner (`viewerChar === item.author`) ALWAYS has full access to all of their own items
 *    (active stories, expired stories in personal gallery archive, and private items).
 * 2. If `item.visibility === 'private'`, ONLY the owner can access it.
 * 3. For active stories (`<= 24h`), any authenticated friend (`nyanya`, `lala`, `lele`) can view it
 *    as long as `visibility !== 'private'`.
 * 4. Once a story expires (`> 24h`), it transitions into the owner's Personal Gallery Archive.
 *    Other users CANNOT access another user's expired personal story archive unless the owner
 *    explicitly shared/pinned it to `Arsip Kita` (`item.isArchived === true`).
 */
export function canUserAccessItem(item, viewerChar = activeUserCharacter, context = 'gallery') {
  if (!item || item.isDeleted) return false;
  const viewer = CHARACTERS_MOMENTS[viewerChar] ? viewerChar : activeUserCharacter;

  // Owner always has full access to their own items
  if (item.author === viewer) {
    return true;
  }

  // Strictly block private items from non-owners
  if (item.visibility === 'private') {
    return false;
  }

  const activeNow = isStoryActive(item);

  if (context === 'story') {
    // Active stories within 24 hours are viewable by friends
    return activeNow;
  }

  // In gallery / feed context:
  // Non-owners can see permanent feed posts (!item.isStory), active shared stories, OR items pinned to shared 'Arsip Kita'
  // Expired personal stories (> 24h) that are not in 'Arsip Kita' remain private in the owner's Personal Gallery!
  if (!item.isStory || activeNow || item.isArchived) {
    return true;
  }

  return false;
}

/**
 * Asserts whether `actorChar` is the rightful owner of `item` before allowing mutation or deletion.
 */
export function verifyOwnership(item, actorChar = activeUserCharacter) {
  if (!item) {
    return {
      allowed: false,
      error: 'Item tidak ditemukan.'
    };
  }
  const actor = CHARACTERS_MOMENTS[actorChar] ? actorChar : activeUserCharacter;
  if (item.author !== actor) {
    const ownerName = CHARACTERS_MOMENTS[item.author]?.name || item.author;
    const actorName = CHARACTERS_MOMENTS[actor]?.name || actor;
    return {
      allowed: false,
      error: `Akses ditolak: ${actorName} tidak memiliki izin untuk mengubah atau menghapus konten Gallery/Arsip milik ${ownerName}.`
    };
  }
  return { allowed: true };
}

// --- Getters & Setters ---
export function getActiveUserCharacter() {
  return activeUserCharacter;
}

export function setActiveUserCharacter(charKey) {
  if (CHARACTERS_MOMENTS[charKey]) {
    activeUserCharacter = charKey;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(ACTIVE_CHAR_STORAGE_KEY, charKey);
      }
    } catch (_) {
      // Ignore storage error
    }
    notifyListeners();
  }
}

export function getActiveFilter() {
  return activeFilter;
}

export function setActiveFilter(filterKey) {
  const validFilters = ['all', 'nyanya', 'lala', 'lele', 'archive'];
  activeFilter = validFilters.includes(filterKey) ? filterKey : 'all';
  notifyListeners();
}

// --- Decorate Item for View Consumption ---
function decorateItemForViewer(item, viewerChar = activeUserCharacter, nowMs = Date.now()) {
  const active = isStoryActive(item, nowMs);
  const isOwner = item.author === viewerChar;
  const remainingMs = Math.max(0, (item.publishedAt + STORY_LIFESPAN_MS) - nowMs);
  const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));

  return {
    ...item,
    timeAgo: formatRelativeTime(item.publishedAt, nowMs),
    timestamp: formatRelativeTime(item.publishedAt, nowMs),
    isActiveStory: active,
    isExpiredStory: item.isStory && !active,
    remainingHours: active ? remainingHours : 0,
    isOwner,
    likedByMe: Boolean(item.likedBy && item.likedBy[viewerChar]),
    viewedByMe: Boolean(item.viewedBy && item.viewedBy[viewerChar])
  };
}

// --- 1. ACTIVE STORIES (24-Hour Window) ---
export function getStories(nowMs = Date.now(), viewerChar = activeUserCharacter) {
  return momentsStore
    .filter((item) => isStoryActive(item, nowMs) && canUserAccessItem(item, viewerChar, 'story'))
    .sort((a, b) => a.publishedAt - b.publishedAt) // Chronological order for story playback
    .map((item) => decorateItemForViewer(item, viewerChar, nowMs));
}

export function getStoriesByCharacter(charKey, nowMs = Date.now(), viewerChar = activeUserCharacter) {
  if (!CHARACTERS_MOMENTS[charKey]) return [];
  return getStories(nowMs, viewerChar).filter((s) => s.author === charKey);
}

export function hasActiveStories(charKey, nowMs = Date.now(), viewerChar = activeUserCharacter) {
  return getStoriesByCharacter(charKey, nowMs, viewerChar).length > 0;
}

export function hasUnseenStories(charKey, nowMs = Date.now(), viewerChar = activeUserCharacter) {
  const charStories = getStoriesByCharacter(charKey, nowMs, viewerChar);
  if (charStories.length === 0) return false;
  return charStories.some((s) => !s.viewedBy || !s.viewedBy[viewerChar]);
}

export function markStoryAsViewed(storyId, viewerChar = activeUserCharacter) {
  const item = momentsStore.find((s) => s.id === storyId);
  if (!item) return null;
  if (!canUserAccessItem(item, viewerChar, 'story')) return null;

  if (!item.viewedBy || typeof item.viewedBy !== 'object') {
    item.viewedBy = { nyanya: false, lala: false, lele: false };
  }
  item.viewedBy[viewerChar] = true;
  persistMomentsState();
  notifyListeners();
  return decorateItemForViewer(item, viewerChar);
}

// --- 2. GALLERY & FILTERED FEED ---
/**
 * Returns Moments / Gallery items according to the requested filter and active user permissions:
 * - 'all': All accessible active stories & shared moments across the 3 friends + active user's own items.
 * - 'nyanya' | 'lala' | 'lele': That character's Gallery.
 *    * If `viewerChar === filter`: returns the owner's COMPLETE Personal Gallery (including expired >24h stories and private archive items).
 *    * If `viewerChar !== filter`: returns ONLY items from that character that are permitted for friends (excludes private items and expired personal story archives).
 * - 'archive': Shared 'Arsip Kita' items + the active user's own archived/expired stories.
 */
export function getMomentsFeed(filter = activeFilter, viewerChar = activeUserCharacter, nowMs = Date.now()) {
  const viewer = CHARACTERS_MOMENTS[viewerChar] ? viewerChar : activeUserCharacter;

  let filtered = [];

  if (filter === 'archive') {
    filtered = momentsStore.filter((item) => {
      if (!canUserAccessItem(item, viewer, 'gallery')) return false;
      // Show items pinned to Arsip Kita OR owner's own expired stories (Personal Story Archive)
      const isExpiredOwnStory = item.author === viewer && item.isStory && !isStoryActive(item, nowMs);
      return Boolean(item.isArchived || isExpiredOwnStory);
    });
  } else if (filter === 'nyanya' || filter === 'lala' || filter === 'lele') {
    filtered = momentsStore.filter((item) => {
      if (item.author !== filter) return false;
      return canUserAccessItem(item, viewer, 'gallery');
    });
  } else {
    // 'all' filter
    filtered = momentsStore.filter((item) => canUserAccessItem(item, viewer, 'gallery'));
  }

  return filtered
    .sort((a, b) => b.publishedAt - a.publishedAt)
    .map((item) => decorateItemForViewer(item, viewer, nowMs));
}

export function getArchiveMoments(viewerChar = activeUserCharacter, nowMs = Date.now()) {
  return getMomentsFeed('archive', viewerChar, nowMs);
}

/**
 * Strictly retrieves a user's Private Personal Archive (`includePrivate: true`).
 * Throws/returns an access denied error if `viewerChar !== targetChar`.
 */
export function getPersonalGallery(targetChar, viewerChar = activeUserCharacter, options = { includePrivate: false, nowMs: Date.now() }) {
  const viewer = CHARACTERS_MOMENTS[viewerChar] ? viewerChar : activeUserCharacter;
  if (!CHARACTERS_MOMENTS[targetChar]) {
    throw new Error('Karakter tidak valid.');
  }

  if (options.includePrivate && viewer !== targetChar) {
    const ownerName = CHARACTERS_MOMENTS[targetChar].name;
    const viewerName = CHARACTERS_MOMENTS[viewer].name;
    throw new Error(
      `Akses ditolak: ${viewerName} tidak diizinkan mengakses Arsip Pribadi milik ${ownerName}.`
    );
  }

  return getMomentsFeed(targetChar, viewer, options.nowMs || Date.now());
}

// --- 3. CREATE STORY & AUTOMATICALLY RECORD IN PERSONAL GALLERY ---
/**
 * Publishes a new Story (photo or video) and automatically saves it to the creator's Personal Gallery.
 * Supports:
 * - `mediaUrl` or `photoUrl`: Data URL / media source
 * - `mediaType`: 'image' | 'video'
 * - `mimeType`: e.g. 'image/png', 'video/mp4'
 * - `caption`: optional string
 * - `author`: 'nyanya' | 'lala' | 'lele'
 * - `visibility`: 'friends' (default) | 'private'
 * - `publishedAt`: optional numeric timestamp (defaults to `Date.now()`)
 */
export function addMoment(input = {}) {
  const authorKey = CHARACTERS_MOMENTS[input.author] ? input.author : activeUserCharacter;
  const char = CHARACTERS_MOMENTS[authorKey];
  const mediaUrl = input.mediaUrl || input.photoUrl || '';

  const validation = validateStoryMediaInput({
    mediaUrl,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes
  });

  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const publishedAt = Number.isFinite(Number(input.publishedAt))
    ? Number(input.publishedAt)
    : Date.now();

  const visibility = input.visibility === 'private' ? 'private' : 'friends';
  const isArchived = Boolean(input.isArchived || input.type === 'archive');
  const mId = input.id || `story-${publishedAt}-${Math.random().toString(36).slice(2, 8)}`;

  const newRecord = normalizeRecord({
    id: mId,
    author: authorKey,
    location: input.location || `Universe ${char.universe}`,
    mediaUrl,
    photoUrl: mediaUrl,
    storagePath: input.storagePath || '',
    mediaType: input.mediaType || validation.mediaType,
    mimeType: input.mimeType || validation.mimeType,
    caption: input.caption || '',
    publishedAt,
    expiresAt: publishedAt + STORY_LIFESPAN_MS,
    isStory: input.isStory !== undefined ? Boolean(input.isStory) : (input.type === 'feed' ? false : true),
    visibility,
    isArchived,
    viewedBy: {
      nyanya: authorKey === 'nyanya',
      lala: authorKey === 'lala',
      lele: authorKey === 'lele'
    },
    likedBy: {},
    likes: 0
  });

  momentsStore.unshift(newRecord);
  persistMomentsState();
  notifyListeners();

  // Async Cloud Persistence when Firebase Auth is active
  if (auth && auth.currentUser) {
    (async () => {
      try {
        let storagePath = input.storagePath;
        if (!storagePath && (mediaUrl.startsWith('data:') || input.file || input.blob)) {
          const uploadRes = await dbUploadMomentMedia(auth.currentUser, {
            file: input.file,
            blob: input.blob,
            base64: mediaUrl.startsWith('data:') ? mediaUrl : null,
            mimeType: newRecord.mimeType,
            visibility,
            momentId: mId
          });
          storagePath = uploadRes.storagePath;
          newRecord.storagePath = storagePath;
        }

        if (storagePath) {
          await dbSaveMoment({
            ...newRecord,
            storagePath
          }, auth.currentUser);
          newRecord.cloudSyncStatus = 'synced';
          persistMomentsState(false);
        }
      } catch (cloudErr) {
        console.warn('Gagal sinkronisasi moment ke Cloud:', cloudErr);
        newRecord.cloudSyncStatus = 'failed';
        newRecord.syncError = cloudErr.message;
      }
    })();
  }

  return decorateItemForViewer(newRecord, activeUserCharacter, Date.now());
}

// --- 4. INTERACTIONS & STRICT OWNERSHIP MUTATIONS ---
export function toggleLikeMoment(momentId, actorChar = activeUserCharacter) {
  const actor = CHARACTERS_MOMENTS[actorChar] ? actorChar : activeUserCharacter;
  const item = momentsStore.find((m) => m.id === momentId);
  if (!item) return null;

  if (!canUserAccessItem(item, actor, 'gallery') && !canUserAccessItem(item, actor, 'story')) {
    throw new Error('Akses ditolak: Anda tidak dapat menyukai momen privat milik pengguna lain.');
  }

  if (!item.likedBy || typeof item.likedBy !== 'object') {
    item.likedBy = {};
  }

  const currentlyLiked = Boolean(item.likedBy[actor]);
  item.likedBy[actor] = !currentlyLiked;
  item.likes = Math.max(0, (item.likes || 0) + (item.likedBy[actor] ? 1 : -1));

  persistMomentsState();
  notifyListeners();
  return decorateItemForViewer(item, actor);
}

/**
 * Toggles whether an item is pinned to 'Arsip Kita' (`isArchived`).
 * Strictly requires ownership (`item.author === actorChar`) to modify archive status!
 */
export function toggleArchiveMoment(momentId, actorChar = activeUserCharacter) {
  const actor = CHARACTERS_MOMENTS[actorChar] ? actorChar : activeUserCharacter;
  const item = momentsStore.find((m) => m.id === momentId);
  if (!item) return false;

  const check = verifyOwnership(item, actor);
  if (!check.allowed) {
    throw new Error(check.error);
  }

  item.isArchived = !item.isArchived;
  persistMomentsState();
  notifyListeners();
  return item.isArchived;
}

export function saveStoryToArchive(storyId, actorChar = activeUserCharacter) {
  const actor = CHARACTERS_MOMENTS[actorChar] ? actorChar : activeUserCharacter;
  const item = momentsStore.find((s) => s.id === storyId);
  if (!item) return null;

  const check = verifyOwnership(item, actor);
  if (!check.allowed) {
    throw new Error(check.error);
  }

  item.isArchived = true;
  persistMomentsState();
  notifyListeners();
  return decorateItemForViewer(item, actor);
}

/**
 * Updates the privacy (`'friends'` vs `'private'`) of a Gallery/Story item.
 * Only the owner (`item.author === actorChar`) is permitted to change privacy.
 */
export function updateMomentPrivacy(momentId, newVisibility, actorChar = activeUserCharacter) {
  const actor = CHARACTERS_MOMENTS[actorChar] ? actorChar : activeUserCharacter;
  const item = momentsStore.find((m) => m.id === momentId);
  if (!item) {
    throw new Error('Momen atau Story tidak ditemukan.');
  }

  const check = verifyOwnership(item, actor);
  if (!check.allowed) {
    throw new Error(check.error);
  }

  item.visibility = newVisibility === 'private' ? 'private' : 'friends';
  if (item.visibility === 'private') {
    item.isArchived = false; // Private items are only in personal archive, not shared Arsip Kita
  }

  persistMomentsState();
  notifyListeners();
  return decorateItemForViewer(item, actor);
}

/**
 * Updates the caption of an existing Story/Gallery item.
 * Only the owner (`item.author === actorChar`) is permitted.
 */
export function updateMomentCaption(momentId, newCaption, actorChar = activeUserCharacter) {
  const actor = CHARACTERS_MOMENTS[actorChar] ? actorChar : activeUserCharacter;
  const item = momentsStore.find((m) => m.id === momentId);
  if (!item) {
    throw new Error('Momen atau Story tidak ditemukan.');
  }

  const check = verifyOwnership(item, actor);
  if (!check.allowed) {
    throw new Error(check.error);
  }

  item.caption = typeof newCaption === 'string' ? newCaption.trim() : '';
  persistMomentsState();
  notifyListeners();
  return decorateItemForViewer(item, actor);
}

/**
 * Deletes a Story/Gallery item.
 * Strictly enforces ownership (`item.author === actorChar`).
 */
export function deleteMomentItem(momentId, actorChar = activeUserCharacter) {
  const actor = CHARACTERS_MOMENTS[actorChar] ? actorChar : activeUserCharacter;
  const idx = momentsStore.findIndex((m) => m.id === momentId);
  if (idx === -1) {
    throw new Error('Momen atau Story tidak ditemukan.');
  }

  const item = momentsStore[idx];
  const check = verifyOwnership(item, actor);
  if (!check.allowed) {
    throw new Error(check.error);
  }

  momentsStore.splice(idx, 1);
  persistMomentsState();
  notifyListeners();

  // Safe Cloud Deletion
  if (auth && auth.currentUser) {
    dbDeleteMomentSafe(momentId, auth.currentUser).catch((err) => {
      console.warn('Gagal safe delete moment dari Cloud:', err);
    });
  }

  return true;
}

/**
 * Helper to update a story's `publishedAt` timestamp (used for verifying 24h expiration behavior).
 * Strictly requires ownership.
 */
export function updateStoryTimestamp(storyId, newPublishedAtMs, actorChar = activeUserCharacter) {
  const actor = CHARACTERS_MOMENTS[actorChar] ? actorChar : activeUserCharacter;
  const item = momentsStore.find((m) => m.id === storyId);
  if (!item) {
    throw new Error('Story tidak ditemukan.');
  }
  const check = verifyOwnership(item, actor);
  if (!check.allowed) {
    throw new Error(check.error);
  }

  const ts = Number(newPublishedAtMs);
  if (!Number.isFinite(ts) || ts <= 0) {
    throw new Error('Timestamp tidak valid.');
  }

  item.publishedAt = ts;
  item.createdAt = ts;
  item.expiresAt = ts + STORY_LIFESPAN_MS;
  persistMomentsState();
  notifyListeners();
  return decorateItemForViewer(item, actor);
}

/**
 * Clears all stored stories and moments (for clean test runs).
 */
export async function clearAllMomentsStore() {
  momentsStore = [];
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY_V2);
    } catch (_) {}
  }
  await saveAllToIdb([]);
  notifyListeners();
}

// --- Subscription System ---
export function subscribeMoments(callback) {
  if (typeof callback === 'function') {
    listeners.push(callback);
  }
  return () => {
    listeners = listeners.filter((cb) => cb !== callback);
  };
}

// --- Realtime Firebase Sync & Migration System ---
let momentsFirebaseUnsub = null;

export function initMomentsFirebaseSync() {
  if (!auth) return;

  onAuthStateChanged(auth, async (user) => {
    if (momentsFirebaseUnsub) {
      momentsFirebaseUnsub();
      momentsFirebaseUnsub = null;
    }

    if (user) {
      // 1. Subscribe to Cloud moments
      momentsFirebaseUnsub = dbSubscribeMoments(user, (cloudMoments) => {
        if (Array.isArray(cloudMoments) && cloudMoments.length > 0) {
          const localMap = new Map();
          momentsStore.forEach((m) => localMap.set(m.id, m));

          cloudMoments.forEach((cm) => {
            const normalized = normalizeRecord(cm);
            const existing = localMap.get(cm.id);
            if (existing && existing.mediaUrl && !normalized.mediaUrl) {
              normalized.mediaUrl = existing.mediaUrl;
              normalized.photoUrl = existing.mediaUrl;
            }
            localMap.set(cm.id, normalized);
          });

          momentsStore = Array.from(localMap.values())
            .filter((m) => !m.isDeleted)
            .sort((a, b) => b.publishedAt - a.publishedAt);

          persistMomentsState(false);
          notifyListeners();
        }
      });

      // 2. Perform idempotent migration of legacy localStorage/IndexedDB items
      try {
        const idbItems = await readAllFromIdb();
        await dbMigrateMoments(user, momentsStore, idbItems || []);
      } catch (migErr) {
        console.warn('Moments migration notice:', migErr);
      }
    }
  });
}

function notifyListeners() {
  listeners.forEach((cb) => {
    try {
      cb({
        activeUserCharacter,
        activeFilter,
        stories: getStories(),
        moments: getMomentsFeed(activeFilter)
      });
    } catch (err) {
      console.error('Moments listener error:', err);
    }
  });
}
