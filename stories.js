/**
 * OUR LITTLE UNIVERSE — STORIES CORE MODULE
 * 
 * Manages literary works, personal writing sanctuary (Story),
 * public library (Our Stories), authorization, publishing workflow,
 * reading progress, and bookmarking.
 */

import {
  auth,
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
    name: 'Lele',
    role: 'The Eclipse Guardian',
    universeId: 'shadow',
    universeName: 'SHADOW',
    symbol: '☾',
    avatar: '/assets/avatar_lele_hd.png',
    accentColor: '#818cf8'
  }
};

// Storage Keys
const STORIES_STORAGE_KEY = 'olu_stories_store_v1';
const BOOKMARKS_STORAGE_KEY = 'olu_stories_bookmarks_v1';
const READING_PROGRESS_KEY = 'olu_stories_reading_progress_v1';
const READING_PREFS_KEY = 'olu_stories_reading_prefs_v1';

// Active in-memory state
let activeUserCharacter = 'nyanya';
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
 * Load store from localStorage
 */
function loadFromStorage() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    const rawStories = window.localStorage.getItem(STORIES_STORAGE_KEY);
    if (rawStories) {
      const parsed = JSON.parse(rawStories);
      if (Array.isArray(parsed)) {
        storiesStore = parsed;
      }
    }
  } catch (err) {
    console.warn('Gagal membaca stories dari localStorage:', err);
  }

  try {
    const rawBookmarks = window.localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (rawBookmarks) {
      bookmarksStore = JSON.parse(rawBookmarks) || {};
    }
  } catch (err) {
    console.warn('Gagal membaca bookmarks dari localStorage:', err);
  }

  try {
    const rawProgress = window.localStorage.getItem(READING_PROGRESS_KEY);
    if (rawProgress) {
      readingProgressStore = JSON.parse(rawProgress) || {};
    }
  } catch (err) {
    console.warn('Gagal membaca reading progress dari localStorage:', err);
  }
}

/**
 * Save stories to localStorage
 */
function saveStoriesToStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORIES_STORAGE_KEY, JSON.stringify(storiesStore));
  } catch (err) {
    console.warn('Gagal menyimpan stories ke localStorage:', err);
  }
}

/**
 * Save bookmarks to localStorage
 */
function saveBookmarksToStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarksStore));
  } catch (err) {
    console.warn('Gagal menyimpan bookmarks ke localStorage:', err);
  }
}

/**
 * Save reading progress to localStorage
 */
function saveProgressToStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify(readingProgressStore));
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
 */
export function initStoriesFirebaseSync() {
  if (!auth) return;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        backupLocalStorageKey(STORIES_STORAGE_KEY);

        // Perform idempotent migration of existing local stories
        await dbMigrateStories(user, storiesStore);

        if (firestoreStoriesUnsubscribe) {
          firestoreStoriesUnsubscribe();
          firestoreStoriesUnsubscribe = null;
        }

        firestoreStoriesUnsubscribe = dbSubscribeStories(
          user,
          (remoteStories) => {
            if (Array.isArray(remoteStories) && remoteStories.length > 0) {
              const map = new Map();
              remoteStories.forEach((s) => map.set(s.id, s));
              storiesStore.forEach((s) => {
                if (!map.has(s.id)) map.set(s.id, s);
              });
              storiesStore = Array.from(map.values()).sort(
                (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
              );
              saveStoriesToStorage();
              notifyListeners();
            }
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
      if (firestoreStoriesUnsubscribe) {
        firestoreStoriesUnsubscribe();
        firestoreStoriesUnsubscribe = null;
      }
      isFirestoreStoriesSynced = false;
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
 * Set active character identity (called upon login or switch)
 */
export function setActiveUserCharacter(charKey) {
  if (charKey && CHARACTERS_STORIES[charKey]) {
    activeUserCharacter = charKey;
    notifyListeners();
  }
}

export function getActiveUserCharacter() {
  return activeUserCharacter;
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
 * Create a new story draft or published work
 */
export function createStory(input = {}) {
  const actor = input.actor || activeUserCharacter;
  const author = CHARACTERS_STORIES[actor] || CHARACTERS_STORIES.nyanya;

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

  const newStory = {
    id: `story-${author.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
  };

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
 * Strict Security: Only author can update their own work
 */
export function updateStory(storyId, updates = {}, actor = activeUserCharacter) {
  const index = storiesStore.findIndex((s) => s.id === storyId);
  if (index === -1) {
    return { success: false, error: 'Karya tidak ditemukan ✧' };
  }

  const story = storiesStore[index];

  // Authorization Check
  if (story.authorId !== actor) {
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
    // If unpublished, keep track or clear publishedAt
    publishedAt = null;
  }

  const updatedStory = {
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
  };

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
export function publishStory(storyId, actor = activeUserCharacter) {
  return updateStory(storyId, { status: 'published' }, actor);
}

/**
 * Unpublish a story back to draft (removes from Our Stories)
 */
export function unpublishStory(storyId, actor = activeUserCharacter) {
  return updateStory(storyId, { status: 'draft' }, actor);
}

/**
 * Delete a story
 * Strict Security: Only author can delete their own work
 */
export function deleteStory(storyId, actor = activeUserCharacter) {
  const index = storiesStore.findIndex((s) => s.id === storyId);
  if (index === -1) {
    return { success: false, error: 'Karya tidak ditemukan ✧' };
  }

  const story = storiesStore[index];

  if (story.authorId !== actor) {
    return { success: false, error: 'Akses ditolak: Anda hanya dapat menghapus karya milik sendiri 🔒' };
  }

  storiesStore.splice(index, 1);
  saveStoriesToStorage();

  // Clean up bookmarks for this story across all users
  for (const userKey of Object.keys(bookmarksStore)) {
    if (Array.isArray(bookmarksStore[userKey])) {
      bookmarksStore[userKey] = bookmarksStore[userKey].filter((id) => id !== storyId);
    }
  }
  saveBookmarksToStorage();

  notifyListeners();

  let cloudPromise = null;
  if (auth && auth.currentUser) {
    cloudPromise = dbDeleteStory(storyId, auth.currentUser);
  }

  return { success: true, message: 'Karya berhasil dihapus ✧', cloudPromise };
}

/**
 * Get all published stories for Our Stories (Public Library)
 * Strict Security: Never leaks drafts of other users
 */
export function getPublishedStories(filters = {}) {
  let list = storiesStore.filter((s) => s.status === 'published');

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
    list = list.filter((s) => s.universeId === filters.universe || s.authorId === filters.universe);
  }

  // Search query (title or author name)
  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        (s.subtitle && s.subtitle.toLowerCase().includes(q)) ||
        s.authorName.toLowerCase().includes(q) ||
        (s.synopsis && s.synopsis.toLowerCase().includes(q))
    );
  }

  // Bookmarks only filter
  if (filters.bookmarksOnly) {
    const userBookmarks = bookmarksStore[activeUserCharacter] || [];
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
 * Returns all works (drafts & published) belonging ONLY to the author
 */
export function getAuthorStories(actor = activeUserCharacter, statusFilter = 'all') {
  let list = storiesStore.filter((s) => s.authorId === actor);

  if (statusFilter === 'draft') {
    list = list.filter((s) => s.status === 'draft');
  } else if (statusFilter === 'published') {
    list = list.filter((s) => s.status === 'published');
  }

  list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  return list;
}

/**
 * Get single story by ID with access control
 * - Author can read their own story whether draft or published
 * - Other users can ONLY read if status is published
 */
export function getStoryById(storyId, viewer = activeUserCharacter) {
  const story = storiesStore.find((s) => s.id === storyId);
  if (!story) return null;

  if (story.status === 'published' || story.authorId === viewer) {
    return story;
  }

  // Unauthorized access to someone else's draft
  return null;
}

/**
 * Bookmark toggle for current user
 */
export function toggleBookmark(storyId, actor = activeUserCharacter) {
  if (!bookmarksStore[actor]) {
    bookmarksStore[actor] = [];
  }

  const list = bookmarksStore[actor];
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
 * Check if a story is bookmarked by user
 */
export function isStoryBookmarked(storyId, actor = activeUserCharacter) {
  const list = bookmarksStore[actor] || [];
  return list.includes(storyId);
}

/**
 * Save user's reading progress for a story
 */
export function saveReadingProgress(storyId, percent = 0, scrollRatio = 0, actor = activeUserCharacter) {
  if (!storyId) return;

  if (!readingProgressStore[actor]) {
    readingProgressStore[actor] = {};
  }

  const clampedPercent = Math.min(100, Math.max(0, Math.round(percent)));
  readingProgressStore[actor][storyId] = {
    percent: clampedPercent,
    scrollRatio: Number(scrollRatio.toFixed(4)),
    updatedAt: new Date().toISOString()
  };

  saveProgressToStorage();
}

/**
 * Get reading progress for a story
 */
export function getReadingProgress(storyId, actor = activeUserCharacter) {
  if (!readingProgressStore[actor] || !readingProgressStore[actor][storyId]) {
    return { percent: 0, scrollRatio: 0, updatedAt: null };
  }
  return readingProgressStore[actor][storyId];
}

/**
 * Reading Customization Preferences (Persisted)
 */
export function getReadingPreferences() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_READING_PREFS };
  }

  try {
    const raw = window.localStorage.getItem(READING_PREFS_KEY);
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

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(READING_PREFS_KEY, JSON.stringify(merged));
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
  saveStoriesToStorage();
  saveBookmarksToStorage();
  saveProgressToStorage();
  notifyListeners();
}

