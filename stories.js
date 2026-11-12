/**
 * OUR LITTLE UNIVERSE — STORIES CORE MODULE
 * 
 * Manages literary works, personal writing sanctuary (Story),
 * public library (Our Stories), authorization, publishing workflow,
 * reading progress, and bookmarking.
 */

import {
  auth,
  CHARACTER_AUTH_RULES,
  identifyUserCharacter,
  normalizeStoryDocument,
  resolveStoryCanonicalCharacter,
  dbSaveStory,
  dbDeleteStory,
  dbSubscribeStories,
  dbMigrateStories,
  backupLocalStorageKey
} from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// Supported work types & default genres
export const STORY_CATEGORIES = [
  { id: 'all', label: 'Semua Karya', icon: '✦' },
  { id: 'novel', label: 'Novel', icon: '📖' },
  { id: 'cerpen', label: 'Cerpen', icon: '📜' },
  { id: 'puisi', label: 'Puisi', icon: '✒️' },
  { id: 'sastra', label: 'Sastra', icon: '🌿' },
  { id: 'lainnya', label: 'Lainnya', icon: '✨' }
];

export const STORY_GENRES = [
  'Semua Genre',
  'Fantasi Kosmik',
  'Romansa Hangat',
  'Slice of Life',
  'Misteri & Petualangan',
  'Puisi & Renungan',
  'Fiksi Ilmiah',
  'Dongeng & Fabel'
];

export const COVER_THEMES = [
  { id: 'starlight', label: 'Starlight Lavender', gradient: 'linear-gradient(135deg, #2e1065 0%, #7c3aed 50%, #c084fc 100%)', badge: '★' },
  { id: 'sunburst', label: 'Warm Sunburst', gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f472b6 100%)', badge: '☼' },
  { id: 'eclipse', label: 'Moonlit Eclipse', gradient: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #4338ca 100%)', badge: '☾' },
  { id: 'emerald', label: 'Cosmic Emerald', gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #34d399 100%)', badge: '🍃' },
  { id: 'twilight', label: 'Twilight Rose', gradient: 'linear-gradient(135deg, #831843 0%, #db2777 50%, #f472b6 100%)', badge: '🌸' },
  { id: 'aurora', label: 'Nordic Aurora', gradient: 'linear-gradient(135deg, #0f172a 0%, #0369a1 50%, #38bdf8 100%)', badge: '🌌' }
];

// Character mapping matching PRD & main auth
export const CHARACTERS_STORIES = {
  nyanya: {
    id: 'nyanya',
    uid: CHARACTER_AUTH_RULES.nyanya.expectedUid,
    ownerId: CHARACTER_AUTH_RULES.nyanya.expectedUid,
    name: 'Nyanya',
    role: 'The Moonlit Shadow Witch',
    universeId: 'kidult',
    universeName: 'KIDULT',
    symbol: '★',
    avatar: '/assets/avatar_nyanya_hd.png',
    accentColor: '#c084fc'
  },
  lala: {
    id: 'lala',
    uid: CHARACTER_AUTH_RULES.lala.expectedUid,
    ownerId: CHARACTER_AUTH_RULES.lala.expectedUid,
    name: 'Lala',
    role: 'The Everglow Fairy',
    universeId: 'to_you',
    universeName: 'TO YOU',
    symbol: '☼',
    avatar: '/assets/avatar_lala_hd.png',
    accentColor: '#f472b6'
  },
  lele: {
    id: 'lele',
    uid: CHARACTER_AUTH_RULES.lele.expectedUid,
    ownerId: CHARACTER_AUTH_RULES.lele.expectedUid,
    name: 'Lele',
    role: 'The Eclipse Guardian',
    universeId: 'shadow',
    universeName: 'SHADOW',
    symbol: '☾',
    avatar: '/assets/avatar_lele_hd.png',
    accentColor: '#818cf8'
  },
  abil: {
    id: 'abil',
    uid: CHARACTER_AUTH_RULES.abil.expectedUid || 'uid-abil-pinwheel-cloud-2026',
    ownerId: CHARACTER_AUTH_RULES.abil.expectedUid || 'uid-abil-pinwheel-cloud-2026',
    name: 'Abil',
    role: 'PINWHEEL ☁️',
    universeId: 'pinwheel',
    universeName: 'PINWHEEL',
    symbol: '☁️',
    avatar: '/assets/avatar_abil_hd.jpg',
    accentColor: '#93c5fd'
  },
  akhira: {
    id: 'akhira',
    uid: CHARACTER_AUTH_RULES.akhira.expectedUid || 'uid-akhira-yawn-spark-2026',
    ownerId: CHARACTER_AUTH_RULES.akhira.expectedUid || 'uid-akhira-yawn-spark-2026',
    name: 'Akhira',
    role: 'YAWN ⚡',
    universeId: 'yawn',
    universeName: 'YAWN',
    symbol: '⚡',
    avatar: '/assets/avatar_akhira_hd.jpg',
    accentColor: '#c084fc'
  },
  ela: {
    id: 'ela',
    uid: CHARACTER_AUTH_RULES.ela.expectedUid || 'uid-ela-us-again-blossom-2026',
    ownerId: CHARACTER_AUTH_RULES.ela.expectedUid || 'uid-ela-us-again-blossom-2026',
    name: 'Ela',
    role: 'US AGAIN 🌸',
    universeId: 'us_again',
    universeName: 'US AGAIN',
    symbol: '🌸',
    avatar: '/assets/avatar_ela_hd.jpg',
    accentColor: '#f472b6'
  },
  ruben: {
    id: 'ruben',
    uid: CHARACTER_AUTH_RULES.ruben.expectedUid || 'uid-ruben-ash-snow-2026',
    ownerId: CHARACTER_AUTH_RULES.ruben.expectedUid || 'uid-ruben-ash-snow-2026',
    name: 'Ruben',
    role: 'ASH ❄️',
    universeId: 'ash',
    universeName: 'ASH',
    symbol: '❄️',
    avatar: '/assets/avatar_ruben_hd.jpg',
    accentColor: '#94a3b8'
  }
};

// Storage Keys
const STORIES_STORAGE_KEY = 'olu_stories_store_v1';
const STORIES_SCOPED_PREFIX = 'olu_stories_store_v2_';
const BOOKMARKS_STORAGE_KEY = 'olu_stories_bookmarks_v1';
const READING_PROGRESS_KEY = 'olu_stories_reading_progress_v1';
const READING_PREFS_KEY = 'olu_stories_reading_prefs_v1';

// Active in-memory state (NEVER defaults silently to any character)
let activeUserCharacter = null;
let activeUserUid = null;
let storiesStore = [];
let bookmarksStore = {}; // { [charKey]: [storyId, ...] }
let readingProgressStore = {}; // { [charKey]: { [storyId]: { percent, scrollRatio, updatedAt } } }
let listeners = [];

// Default reading customization
export const DEFAULT_READING_PREFS = {
  fontSize: 'medium', // 'small' (16px), 'medium' (19px), 'large' (22px), 'xlarge' (25px)
  fontFamily: 'serif', // 'serif' (Merriweather), 'sans' (Inter), 'literary' (Georgia/Lora)
  lineHeight: 'normal', // 'compact' (1.6), 'normal' (1.85), 'relaxed' (2.1)
  readingWidth: 'standard', // 'narrow' (640px), 'standard' (760px), 'wide' (920px)
  theme: 'sepia' // 'light', 'sepia', 'dark'
};

/**
 * Resolve character key ('nyanya' | 'lala' | 'lele') from a character key or UID.
 * Returns null if invalid or empty (NEVER defaults to 'nyanya').
 */
function resolveActorKey(actorOrUid) {
  if (!actorOrUid) return null;
  if (CHARACTERS_STORIES[actorOrUid]) return actorOrUid;
  for (const [key, cfg] of Object.entries(CHARACTERS_STORIES)) {
    if (cfg.uid === actorOrUid) return key;
  }
  return null;
}

/**
 * Resolve effective character identity.
 * When Firebase Auth has an active user, its UID mapping is the strict Single Source of Truth.
 */
function resolveEffectiveActor(explicitActor = null) {
  if (auth && auth.currentUser && auth.currentUser.uid) {
    return identifyUserCharacter(auth.currentUser) || null;
  }
  return resolveActorKey(explicitActor) || resolveActorKey(activeUserCharacter) || null;
}

function resolveUidForActor(actorChar, explicitUid = null) {
  if (auth && auth.currentUser && auth.currentUser.uid) {
    const verified = identifyUserCharacter(auth.currentUser);
    if (verified === actorChar) return auth.currentUser.uid;
  }
  if (explicitUid) return explicitUid;
  if (activeUserUid && activeUserCharacter === actorChar) return activeUserUid;
  return CHARACTERS_STORIES[actorChar]?.uid || null;
}

/**
 * Normalize a story record locally with canonical author & universe fields
 * while preserving original content, title, dates, cover, and metadata.
 */
function normalizeStoryRecord(story) {
  if (!story || typeof story !== 'object') return null;
  const normalized = normalizeStoryDocument(story);
  if (!normalized) return null;
  const charCfg = normalized.authorChar ? CHARACTERS_STORIES[normalized.authorChar] : null;
  if (charCfg) {
    normalized.universeId = charCfg.universeId;
    normalized.universeName = charCfg.universeName;
    normalized.authorRole = charCfg.role;
    normalized.authorAvatar = charCfg.avatar;
    normalized.authorName = charCfg.name;
    normalized.authorId = charCfg.id;
    normalized.authorChar = charCfg.id;
    normalized.authorUid = normalized.authorUid || charCfg.uid;
    normalized.ownerId = normalized.authorUid;
  }
  return normalized;
}

/**
 * Strict ownership verification comparing both verified character key and UID.
 */
export function isStoryOwnedBy(story, actorChar, actorUid = null) {
  const norm = normalizeStoryRecord(story);
  if (!norm || !actorChar) return false;

  const expectedChar = resolveActorKey(actorChar);
  if (!expectedChar) return false;

  const storyChar = norm.authorChar || norm.authorId || resolveStoryCanonicalCharacter(norm);
  if (storyChar !== expectedChar) return false;

  const expectedUid = actorUid || CHARACTERS_STORIES[expectedChar]?.uid || null;
  if (norm.authorUid && expectedUid && norm.authorUid !== expectedUid) {
    return false;
  }

  return true;
}

function getStorageRef() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  return null;
}

function readBookmarksAndProgressFromStorage() {
  const storage = getStorageRef();
  if (!storage) return;

  try {
    const rawBookmarks = storage.getItem(BOOKMARKS_STORAGE_KEY);
    if (rawBookmarks) {
      bookmarksStore = JSON.parse(rawBookmarks) || {};
    }
  } catch (err) {
    console.warn('Gagal membaca bookmarks dari localStorage:', err);
  }

  try {
    const rawProgress = storage.getItem(READING_PROGRESS_KEY);
    if (rawProgress) {
      readingProgressStore = JSON.parse(rawProgress) || {};
    }
  } catch (err) {
    console.warn('Gagal membaca reading progress dari localStorage:', err);
  }
}

/**
 * Load store from localStorage safely.
 * In authenticated mode, isolates stories strictly by UID (`olu_stories_store_v2_<uid>`).
 */
function loadFromStorage(uidScope = null, verifiedChar = null) {
  const storage = getStorageRef();
  if (!storage) {
    return;
  }

  readBookmarksAndProgressFromStorage();

  try {
    if (uidScope && verifiedChar) {
      const scopedRaw = storage.getItem(`${STORIES_SCOPED_PREFIX}${uidScope}`);
      if (scopedRaw) {
        const parsed = JSON.parse(scopedRaw);
        if (Array.isArray(parsed)) {
          storiesStore = parsed
            .map(normalizeStoryRecord)
            .filter((s) => s && isStoryOwnedBy(s, verifiedChar, uidScope));
          return;
        }
      }
      storiesStore = [];
      return;
    }

    // Do NOT preload shared legacy store into memory while Firebase Auth is initialized
    // without an authenticated user (prevents cross-account local leakage).
    if (auth) {
      storiesStore = [];
      return;
    }

    const rawStories = storage.getItem(STORIES_STORAGE_KEY);
    if (rawStories) {
      const parsed = JSON.parse(rawStories);
      if (Array.isArray(parsed)) {
        storiesStore = parsed.map(normalizeStoryRecord).filter(Boolean);
      }
    }
  } catch (err) {
    console.warn('Gagal membaca stories dari localStorage:', err);
  }
}

/**
 * Extract unambiguous legacy stories belonging to the authenticated user for safe migration.
 */
function collectUnambiguousLegacyStoriesForUser(uidScope, verifiedChar) {
  const storage = getStorageRef();
  if (!storage) return [];
  const results = [];
  const seenIds = new Set();

  const pushIfMatch = (item) => {
    const norm = normalizeStoryRecord(item);
    if (!norm || !norm.id || seenIds.has(norm.id)) return;
    const idPrefixMatch = /^story-(nyanya|lala|lele)-/.exec(String(norm.id));
    if (idPrefixMatch && idPrefixMatch[1] !== verifiedChar) return;
    if (isStoryOwnedBy(norm, verifiedChar, uidScope)) {
      seenIds.add(norm.id);
      results.push(norm);
    }
  };

  try {
    const scopedRaw = storage.getItem(`${STORIES_SCOPED_PREFIX}${uidScope}`);
    if (scopedRaw) {
      const parsedScoped = JSON.parse(scopedRaw);
      if (Array.isArray(parsedScoped)) parsedScoped.forEach(pushIfMatch);
    }
  } catch (_) {}

  try {
    const legacyRaw = storage.getItem(STORIES_STORAGE_KEY);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      if (Array.isArray(parsedLegacy)) {
        parsedLegacy.forEach((raw) => {
          // Strict check: only migrate legacy items that explicitly belong to this verified UID/char
          if (!raw || !raw.id) return;
          if (raw.authorUid && raw.authorUid !== uidScope) return;
          const explicitChar = raw.authorChar || raw.authorId || raw.author;
          if (explicitChar !== verifiedChar) return;
          pushIfMatch(raw);
        });
      }
    }
  } catch (_) {}

  return results;
}

/**
 * Save stories to localStorage (UID-partitioned when UID is known)
 */
function saveStoriesToStorage() {
  const storage = getStorageRef();
  if (!storage) return;
  try {
    if (activeUserUid && activeUserCharacter) {
      const scopedList = storiesStore.filter((s) =>
        isStoryOwnedBy(s, activeUserCharacter, activeUserUid)
      );
      storage.setItem(
        `${STORIES_SCOPED_PREFIX}${activeUserUid}`,
        JSON.stringify(scopedList)
      );
    } else if (!auth) {
      storage.setItem(STORIES_STORAGE_KEY, JSON.stringify(storiesStore));
    }
  } catch (err) {
    console.warn('Gagal menyimpan stories ke localStorage:', err);
  }
}

/**
 * Save bookmarks to localStorage
 */
function saveBookmarksToStorage() {
  const storage = getStorageRef();
  if (!storage) return;
  try {
    storage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarksStore));
  } catch (err) {
    console.warn('Gagal menyimpan bookmarks ke localStorage:', err);
  }
}

/**
 * Save reading progress to localStorage
 */
function saveProgressToStorage() {
  const storage = getStorageRef();
  if (!storage) return;
  try {
    storage.setItem(READING_PROGRESS_KEY, JSON.stringify(readingProgressStore));
  } catch (err) {
    console.warn('Gagal menyimpan reading progress ke localStorage:', err);
  }
}

// Initial hydration
loadFromStorage();

let firestoreStoriesUnsubscribe = null;
let isFirestoreStoriesSynced = false;

/**
 * Initialize real-time synchronization with Cloud Firestore for stories
 * Strictly isolates stories per verified Firebase Auth UID.
 */
export function initStoriesFirebaseSync() {
  if (!auth) return;

  onAuthStateChanged(auth, async (user) => {
    if (firestoreStoriesUnsubscribe) {
      firestoreStoriesUnsubscribe();
      firestoreStoriesUnsubscribe = null;
    }

    if (user && user.uid) {
      const verifiedChar = identifyUserCharacter(user);
      if (!verifiedChar) {
        activeUserCharacter = null;
        activeUserUid = null;
        storiesStore = [];
        isFirestoreStoriesSynced = false;
        notifyListeners();
        return;
      }

      activeUserCharacter = verifiedChar;
      activeUserUid = user.uid;
      loadFromStorage(user.uid, verifiedChar);
      notifyListeners();

      try {
        backupLocalStorageKey(STORIES_STORAGE_KEY);

        const localCandidates = collectUnambiguousLegacyStoriesForUser(user.uid, verifiedChar);
        await dbMigrateStories(user, localCandidates);

        firestoreStoriesUnsubscribe = dbSubscribeStories(
          user,
          (remoteStories) => {
            if (!activeUserUid || activeUserUid !== user.uid) return;

            const normalizedRemote = Array.isArray(remoteStories)
              ? remoteStories
                  .map(normalizeStoryRecord)
                  .filter((s) => s && isStoryOwnedBy(s, verifiedChar, user.uid))
              : [];

            const map = new Map();
            normalizedRemote.forEach((s) => map.set(s.id, s));

            // Preserve only unsaved/pending local stories that strictly belong to the same UID
            storiesStore.forEach((s) => {
              if (s && s._pendingCloudSync && !map.has(s.id) && isStoryOwnedBy(s, verifiedChar, user.uid)) {
                map.set(s.id, s);
              }
            });

            storiesStore = Array.from(map.values()).sort(
              (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
            );
            saveStoriesToStorage();
            notifyListeners();
          },
          (err) => {
            console.error('Firestore listener error on Stories:', err);
          }
        );

        isFirestoreStoriesSynced = true;
      } catch (err) {
        console.error('Gagal sinkronisasi stories ke Firestore:', err);
      }
    } else {
      activeUserCharacter = null;
      activeUserUid = null;
      storiesStore = [];
      isFirestoreStoriesSynced = false;
      notifyListeners();
    }
  });
}

// Auto-initialize stories sync
initStoriesFirebaseSync();

/**
 * Notify reactive listeners on state change
 */
function notifyListeners() {
  listeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {
      console.error('Error in story listener:', e);
    }
  });
}

/**
 * Subscribe to story updates
 */
export function subscribeStories(listener) {
  if (typeof listener === 'function') {
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }
  return () => {};
}

/**
 * Set active character identity (called upon login, logout, or verified session sync)
 */
export function setActiveUserCharacter(charKey, authUser = null) {
  if (charKey === null || charKey === undefined) {
    activeUserCharacter = null;
    activeUserUid = null;
    storiesStore = [];
    notifyListeners();
    return;
  }

  // If Firebase Auth has an active user, never allow UI selection to drift from verified UID
  if (authUser && authUser.uid) {
    const verified = identifyUserCharacter(authUser);
    if (verified && CHARACTERS_STORIES[verified]) {
      const uidChanged = activeUserUid !== authUser.uid;
      activeUserCharacter = verified;
      activeUserUid = authUser.uid;
      if (uidChanged) {
        loadFromStorage(authUser.uid, verified);
      }
      notifyListeners();
      return;
    }
  }

  const resolvedKey = resolveActorKey(charKey);
  if (resolvedKey && CHARACTERS_STORIES[resolvedKey]) {
    let targetChar = resolvedKey;
    let targetUid = CHARACTERS_STORIES[resolvedKey].uid;

    if (auth && auth.currentUser && auth.currentUser.uid) {
      const authChar = identifyUserCharacter(auth.currentUser);
      if (authChar && authChar !== resolvedKey) {
        console.warn(`Mengabaikan setActiveUserCharacter(${resolvedKey}) karena Firebase UID aktif milik ${authChar}.`);
        targetChar = authChar;
      }
      targetUid = auth.currentUser.uid;
    }

    const uidChanged = activeUserUid !== targetUid;
    activeUserCharacter = targetChar;
    activeUserUid = targetUid;
    if (uidChanged && targetUid) {
      loadFromStorage(targetUid, targetChar);
    }
    notifyListeners();
  }
}

export function getActiveUserCharacter() {
  return resolveEffectiveActor();
}

export function getActiveUserUid() {
  const charKey = getActiveUserCharacter();
  return charKey ? resolveUidForActor(charKey) : null;
}

/**
 * Calculate word count and estimated reading time
 */
export function calculateStoryStats(content = '') {
  // Strip HTML tags for word counting
  const plainText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  const words = plainText ? plainText.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  // Average Indonesian reading speed: ~180-200 wpm
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
  return { wordCount, readingTimeMinutes };
}

/**
 * Create a new story draft or published work.
 * Binds ownership strictly to verified UID and canonical universe.
 */
export function createStory(input = {}) {
  const authVerifiedChar = (auth && auth.currentUser && auth.currentUser.uid)
    ? identifyUserCharacter(auth.currentUser)
    : null;

  if (auth && auth.currentUser && !authVerifiedChar) {
    return { success: false, error: 'Akses ditolak: Akun UID belum terdaftar sebagai pemilik universe 🔒' };
  }

  const activeSessionChar = authVerifiedChar || resolveActorKey(activeUserCharacter);
  if (activeSessionChar && input.actor && resolveActorKey(input.actor) !== activeSessionChar) {
    return { success: false, error: 'Akses ditolak: Identitas penulis tidak sesuai dengan akun yang sedang login 🔒' };
  }

  const actor = activeSessionChar || resolveEffectiveActor(input.actor);
  const author = actor ? CHARACTERS_STORIES[actor] : null;
  if (!author) {
    return { success: false, error: 'Identitas akun belum terverifikasi. Silakan login terlebih dahulu ✧' };
  }

  const resolvedUid = resolveUidForActor(author.id);

  const title = (input.title || '').trim();
  if (!title) {
    return { success: false, error: 'Judul karya tidak boleh kosong ✧' };
  }

  const content = (input.content || '').trim();
  if (!content) {
    return { success: false, error: 'Isi tulisan karya tidak boleh kosong ✧' };
  }

  const { wordCount, readingTimeMinutes } = calculateStoryStats(content);

  const now = new Date().toISOString();
  const status = input.status === 'published' ? 'published' : 'draft';

  const newStory = normalizeStoryRecord({
    id: `story-${author.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    authorUid: resolvedUid,
    ownerId: resolvedUid,
    authorChar: author.id,
    authorId: author.id,
    authorName: author.name,
    authorRole: author.role,
    authorAvatar: author.avatar,
    universeId: author.universeId,
    universeName: author.universeName,
    title: title,
    subtitle: (input.subtitle || '').trim(),
    synopsis: (input.synopsis || '').trim(),
    category: input.category || 'cerpen',
    genre: input.genre || 'Fantasi Kosmik',
    coverTheme: input.coverTheme || 'starlight',
    coverUrl: input.coverUrl || '',
    content: content,
    wordCount: wordCount,
    readingTimeMinutes: readingTimeMinutes,
    status: status,
    createdAt: now,
    updatedAt: now,
    publishedAt: status === 'published' ? now : null
  });

  storiesStore.unshift(newStory);
  saveStoriesToStorage();
  notifyListeners();

  let cloudPromise = null;
  if (auth && auth.currentUser) {
    cloudPromise = dbSaveStory(newStory, auth.currentUser);
  }

  return { success: true, story: newStory, cloudPromise };
}

/**
 * Update an existing story
 * Strict Security: Only verified author UID/character can update their own work
 */
export function updateStory(storyId, updates = {}, actor = null) {
  const index = storiesStore.findIndex((s) => s.id === storyId);
  if (index === -1) {
    return { success: false, error: 'Karya tidak ditemukan ✧' };
  }

  const resolvedActor = resolveEffectiveActor(actor);
  if (!resolvedActor) {
    return { success: false, error: 'Akses ditolak: Identitas pengguna belum terverifikasi 🔒' };
  }
  const resolvedUid = resolveUidForActor(resolvedActor);

  const story = normalizeStoryRecord(storiesStore[index]);

  // Authorization Check (strict UID + character check)
  if (!isStoryOwnedBy(story, resolvedActor, resolvedUid)) {
    return { success: false, error: 'Akses ditolak: Anda hanya dapat mengubah karya milik sendiri 🔒' };
  }

  const title = updates.title !== undefined ? updates.title.trim() : story.title;
  if (!title) {
    return { success: false, error: 'Judul karya tidak boleh kosong ✧' };
  }

  const content = updates.content !== undefined ? updates.content.trim() : story.content;
  if (!content) {
    return { success: false, error: 'Isi karya tidak boleh kosong ✧' };
  }

  const { wordCount, readingTimeMinutes } = calculateStoryStats(content);
  const now = new Date().toISOString();

  let nextStatus = updates.status !== undefined ? updates.status : story.status;
  let publishedAt = story.publishedAt;

  if (nextStatus === 'published' && story.status !== 'published') {
    publishedAt = now;
  } else if (nextStatus === 'draft') {
    publishedAt = null;
  }

  const updatedStory = normalizeStoryRecord({
    ...story,
    title: title,
    subtitle: updates.subtitle !== undefined ? updates.subtitle.trim() : story.subtitle,
    synopsis: updates.synopsis !== undefined ? updates.synopsis.trim() : story.synopsis,
    category: updates.category || story.category,
    genre: updates.genre || story.genre,
    coverTheme: updates.coverTheme || story.coverTheme,
    coverUrl: updates.coverUrl !== undefined ? updates.coverUrl : story.coverUrl,
    content: content,
    wordCount: wordCount,
    readingTimeMinutes: readingTimeMinutes,
    status: nextStatus,
    updatedAt: now,
    publishedAt: publishedAt
  });

  storiesStore[index] = updatedStory;
  saveStoriesToStorage();
  notifyListeners();

  let cloudPromise = null;
  if (auth && auth.currentUser) {
    cloudPromise = dbSaveStory(updatedStory, auth.currentUser);
  }

  return { success: true, story: updatedStory, cloudPromise };
}

/**
 * Publish a story to Our Stories
 */
export function publishStory(storyId, actor = null) {
  return updateStory(storyId, { status: 'published' }, actor);
}

/**
 * Unpublish a story back to draft (removes from Our Stories)
 */
export function unpublishStory(storyId, actor = null) {
  return updateStory(storyId, { status: 'draft' }, actor);
}

/**
 * Delete a story
 * Strict Security: Only verified author can delete their own work
 */
export function deleteStory(storyId, actor = null) {
  const index = storiesStore.findIndex((s) => s.id === storyId);
  if (index === -1) {
    return { success: false, error: 'Karya tidak ditemukan ✧' };
  }

  const resolvedActor = resolveEffectiveActor(actor);
  if (!resolvedActor) {
    return { success: false, error: 'Akses ditolak: Identitas pengguna belum terverifikasi 🔒' };
  }
  const resolvedUid = resolveUidForActor(resolvedActor);

  const story = normalizeStoryRecord(storiesStore[index]);

  if (!isStoryOwnedBy(story, resolvedActor, resolvedUid)) {
    return { success: false, error: 'Akses ditolak: Anda hanya dapat menghapus karya milik sendiri 🔒' };
  }

  storiesStore.splice(index, 1);
  saveStoriesToStorage();

  // Clean up bookmarks for this story for its owner
  if (Array.isArray(bookmarksStore[resolvedActor])) {
    bookmarksStore[resolvedActor] = bookmarksStore[resolvedActor].filter((id) => id !== storyId);
    saveBookmarksToStorage();
  }

  notifyListeners();

  let cloudPromise = null;
  if (auth && auth.currentUser) {
    cloudPromise = dbDeleteStory(storyId, auth.currentUser);
  }

  return { success: true, message: 'Karya berhasil dihapus ✧', cloudPromise };
}

/**
 * Get published stories for Our Stories strictly scoped to the logged-in owner.
 * - Cerita Nyanya hanya tampil di Our Stories Nyanya
 * - Cerita Lala hanya tampil di Our Stories Lala
 * - Cerita Lele hanya tampil di Our Stories Lele
 */
export function getPublishedStories(filters = {}) {
  const viewerChar = resolveEffectiveActor(filters.actor);
  if (!viewerChar) return [];
  const viewerUid = filters.uid || resolveUidForActor(viewerChar);

  let list = storiesStore
    .map(normalizeStoryRecord)
    .filter((s) => s && s.status === 'published' && isStoryOwnedBy(s, viewerChar, viewerUid));

  // Filter by category
  if (filters.category && filters.category !== 'all') {
    list = list.filter((s) => s.category === filters.category);
  }

  // Filter by genre
  if (filters.genre && filters.genre !== 'Semua Genre') {
    list = list.filter((s) => s.genre === filters.genre);
  }

  // Filter by universe
  if (filters.universe && filters.universe !== 'all') {
    list = list.filter(
      (s) => s.universeId === filters.universe || s.authorId === filters.universe || s.authorChar === filters.universe
    );
  }

  // Search query (title or author name)
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
        (s.authorName && s.authorName.toLowerCase().includes(q)) ||
        (s.synopsis && s.synopsis.toLowerCase().includes(q))
    );
  }

  // Bookmarks only filter
  if (filters.bookmarksOnly) {
    const userBookmarks = bookmarksStore[viewerChar] || [];
    list = list.filter((s) => userBookmarks.includes(s.id));
  }

  // Sorting
  const sortBy = filters.sortBy || 'latest';
  if (sortBy === 'latest') {
    list.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
  } else if (sortBy === 'title') {
    list.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'wordCount') {
    list.sort((a, b) => (b.wordCount || 0) - (a.wordCount || 0));
  }

  return list;
}

/**
 * Get stories belonging to the author (Personal Writing Space / My Works)
 * Returns all works (drafts & published) belonging ONLY to the verified author UID/character
 */
export function getAuthorStories(actor = null, statusFilter = 'all') {
  const resolvedActor = resolveEffectiveActor(actor);
  if (!resolvedActor) return [];
  const resolvedUid = resolveUidForActor(resolvedActor);

  let list = storiesStore
    .map(normalizeStoryRecord)
    .filter((s) => s && isStoryOwnedBy(s, resolvedActor, resolvedUid));

  if (statusFilter === 'draft') {
    list = list.filter((s) => s.status === 'draft');
  } else if (statusFilter === 'published') {
    list = list.filter((s) => s.status === 'published');
  }

  list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return list;
}

/**
 * Get single story by ID with strict owner isolation.
 * Story detail, draft editing, and reading views belong exclusively to the story's owner.
 */
export function getStoryById(storyId, viewer = null) {
  const resolvedViewer = resolveEffectiveActor(viewer);
  if (!resolvedViewer || !storyId) return null;
  const resolvedUid = resolveUidForActor(resolvedViewer);

  const raw = storiesStore.find((s) => s.id === storyId);
  if (!raw) return null;

  const story = normalizeStoryRecord(raw);
  if (story && isStoryOwnedBy(story, resolvedViewer, resolvedUid)) {
    return story;
  }

  return null;
}

/**
 * Bookmark toggle strictly scoped to the verified story owner
 */
export function toggleBookmark(storyId, actor = null) {
  const resolvedActor = resolveEffectiveActor(actor);
  if (!resolvedActor || !storyId) {
    return { isBookmarked: false, totalBookmarks: 0 };
  }

  const story = getStoryById(storyId, resolvedActor);
  if (!story) {
    return { isBookmarked: false, totalBookmarks: (bookmarksStore[resolvedActor] || []).length };
  }

  if (!bookmarksStore[resolvedActor]) {
    bookmarksStore[resolvedActor] = [];
  }

  const list = bookmarksStore[resolvedActor];
  const idx = list.indexOf(storyId);
  let isBookmarked = false;

  if (idx > -1) {
    list.splice(idx, 1);
    isBookmarked = false;
  } else {
    list.push(storyId);
    isBookmarked = true;
  }

  saveBookmarksToStorage();
  notifyListeners();

  return { isBookmarked, totalBookmarks: list.length };
}

/**
 * Check if a story is bookmarked by verified owner
 */
export function isStoryBookmarked(storyId, actor = null) {
  const resolvedActor = resolveEffectiveActor(actor);
  if (!resolvedActor || !storyId) return false;
  const story = getStoryById(storyId, resolvedActor);
  if (!story) return false;
  const list = bookmarksStore[resolvedActor] || [];
  return list.includes(storyId);
}

/**
 * Save user's reading progress for an owned story
 */
export function saveReadingProgress(storyId, percent = 0, scrollRatio = 0, actor = null) {
  const resolvedActor = resolveEffectiveActor(actor);
  if (!storyId || !resolvedActor) return;

  const story = getStoryById(storyId, resolvedActor);
  if (!story) return;

  if (!readingProgressStore[resolvedActor]) {
    readingProgressStore[resolvedActor] = {};
  }

  const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)));
  readingProgressStore[resolvedActor][storyId] = {
    percent: clampedPercent,
    scrollRatio: Number(scrollRatio.toFixed(4)),
    updatedAt: new Date().toISOString()
  };

  saveProgressToStorage();
}

/**
 * Get reading progress for an owned story
 */
export function getReadingProgress(storyId, actor = null) {
  const resolvedActor = resolveEffectiveActor(actor);
  if (!resolvedActor || !storyId) {
    return { percent: 0, scrollRatio: 0, updatedAt: null };
  }
  const story = getStoryById(storyId, resolvedActor);
  if (!story) {
    return { percent: 0, scrollRatio: 0, updatedAt: null };
  }
  if (!readingProgressStore[resolvedActor] || !readingProgressStore[resolvedActor][storyId]) {
    return { percent: 0, scrollRatio: 0, updatedAt: null };
  }
  return readingProgressStore[resolvedActor][storyId];
}

/**
 * Get reading history strictly scoped to the verified story owner
 */
export function getReadingHistory(actor = null) {
  const resolvedActor = resolveEffectiveActor(actor);
  if (!resolvedActor) return [];
  const progressMap = readingProgressStore[resolvedActor] || {};
  return Object.entries(progressMap)
    .map(([storyId, entry]) => {
      const story = getStoryById(storyId, resolvedActor);
      return story ? { storyId, story, ...entry } : null;
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

/**
 * Reading Customization Preferences (Persisted)
 */
export function getReadingPreferences() {
  const storage = getStorageRef();
  if (!storage) {
    return { ...DEFAULT_READING_PREFS };
  }

  try {
    const raw = storage.getItem(READING_PREFS_KEY);
    if (raw) {
      return { ...DEFAULT_READING_PREFS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Gagal membaca preferensi membaca:', e);
  }

  return { ...DEFAULT_READING_PREFS };
}

export function saveReadingPreferences(prefs = {}) {
  const current = getReadingPreferences();
  const merged = { ...current, ...prefs };
  const storage = getStorageRef();

  if (storage) {
    try {
      storage.setItem(READING_PREFS_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn('Gagal menyimpan preferensi membaca:', e);
    }
  }

  return merged;
}

/**
 * Clear all stories (useful for tests and resets)
 */
export function resetStoriesStore() {
  storiesStore = [];
  bookmarksStore = {};
  readingProgressStore = {};
  const storage = getStorageRef();
  if (storage) {
    storage.removeItem(STORIES_STORAGE_KEY);
    Object.values(CHARACTERS_STORIES).forEach((cfg) => {
      if (cfg?.uid) storage.removeItem(`${STORIES_SCOPED_PREFIX}${cfg.uid}`);
    });
  }
  saveStoriesToStorage();
  saveBookmarksToStorage();
  saveProgressToStorage();
  notifyListeners();
}

