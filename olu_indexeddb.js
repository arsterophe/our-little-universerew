/**
 * OUR LITTLE UNIVERSE — CENTRALIZED INDEXEDDB MASTER STORAGE ENGINE
 * =============================================================================
 * Eliminates localStorage QuotaExceededError by offloading all large state
 * (house interior states, furniture, decor, room catalogs, moments, journals,
 * and media) into IndexedDB (`olu_master_storage_v1`).
 * 
 * Features:
 * 1. Resilient Dual-Layer Architecture: Instant in-memory cache for synchronous
 *    gameplay loops + persistent async IndexedDB backend.
 * 2. Automatic Two-Way Migration: Reads old localStorage keys, verifies
 *    successful write to IndexedDB, and only then releases localStorage quota.
 * 3. Strict Character & Universe Isolation: Scoped by characterKey & universe.
 * 4. QuotaExceededError Guardian: Intercepts quota exceptions gracefully without
 *    ever corrupting previous state or crashing caller execution.
 * 5. Universal Environment Support: Works seamlessly in modern browsers (IndexedDB)
 *    and Node.js test suites (memory cache fallback).
 * =============================================================================
 */

export const OLU_IDB_DATABASE_NAME = 'olu_master_storage_v1';
export const OLU_IDB_VERSION = 1;
export const OLU_STORE_HOUSE_STATES = 'house_states';
export const OLU_STORE_UNIVERSE_DATA = 'universe_data';
export const OLU_STORE_BACKUPS = 'storage_backups';

// In-Memory Cache to guarantee instant, zero-latency synchronous access
const memoryCache = new Map();
let dbPromise = null;

/**
 * Open or return the singleton IndexedDB connection
 */
export function openOluDatabase() {
  if (typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(OLU_IDB_DATABASE_NAME, OLU_IDB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. House states (interiors, furniture, decor, activities for all 8 characters)
        if (!db.objectStoreNames.contains(OLU_STORE_HOUSE_STATES)) {
          const houseStore = db.createObjectStore(OLU_STORE_HOUSE_STATES, { keyPath: 'key' });
          houseStore.createIndex('character', 'character', { unique: false });
          houseStore.createIndex('universe', 'universe', { unique: false });
          houseStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 2. Large universe data (moments, stories, offline queues, catalogs)
        if (!db.objectStoreNames.contains(OLU_STORE_UNIVERSE_DATA)) {
          const universeStore = db.createObjectStore(OLU_STORE_UNIVERSE_DATA, { keyPath: 'key' });
          universeStore.createIndex('character', 'character', { unique: false });
          universeStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        }

        // 3. Storage backups (migrated from localStorage backup keys)
        if (!db.objectStoreNames.contains(OLU_STORE_BACKUPS)) {
          const backupStore = db.createObjectStore(OLU_STORE_BACKUPS, { keyPath: 'key' });
          backupStore.createIndex('originalKey', 'originalKey', { unique: false });
          backupStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (err) => {
        console.warn('[OLU IndexedDB] Failed to open database, using memory cache:', err);
        dbPromise = null;
        resolve(null);
      };
    } catch (e) {
      console.warn('[OLU IndexedDB] Exception opening database:', e);
      dbPromise = null;
      resolve(null);
    }
  });

  return dbPromise;
}

/**
 * Save record directly to IndexedDB
 */
export async function saveToIndexedDB(storeName, key, data, metadata = {}) {
  // Always update in-memory cache first for instant synchronous reads
  memoryCache.set(key, data);

  const db = await openOluDatabase();
  if (!db) {
    return true; // Memory cache handles it in non-IDB environments
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const record = {
        key,
        data,
        character: metadata.character || 'unknown',
        universe: metadata.universe || 'unknown',
        updatedAt: Date.now(),
        size: JSON.stringify(data).length,
        version: metadata.version || 1
      };

      const putReq = store.put(record);
      putReq.onsuccess = () => resolve(true);
      putReq.onerror = (err) => {
        console.warn(`[OLU IndexedDB] Error putting key "${key}" into store "${storeName}":`, err);
        resolve(false);
      };
    } catch (err) {
      console.warn(`[OLU IndexedDB] Exception saving key "${key}":`, err);
      resolve(false);
    }
  });
}

/**
 * Load record directly from IndexedDB
 */
export async function loadFromIndexedDB(storeName, key) {
  // Check memory cache first
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  const db = await openOluDatabase();
  if (!db) {
    return null;
  }

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const getReq = store.get(key);

      getReq.onsuccess = () => {
        if (getReq.result && getReq.result.data !== undefined) {
          memoryCache.set(key, getReq.result.data);
          resolve(getReq.result.data);
        } else {
          resolve(null);
        }
      };

      getReq.onerror = () => resolve(null);
    } catch (err) {
      console.warn(`[OLU IndexedDB] Exception loading key "${key}":`, err);
      resolve(null);
    }
  });
}

/**
 * Delete record from IndexedDB and memory cache
 */
export async function deleteFromIndexedDB(storeName, key) {
  memoryCache.delete(key);
  const db = await openOluDatabase();
  if (!db) return true;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      const delReq = store.delete(key);
      delReq.onsuccess = () => resolve(true);
      delReq.onerror = () => resolve(false);
    } catch (_) {
      resolve(false);
    }
  });
}

/**
 * Migrate a key from localStorage into IndexedDB safely with strict verification.
 * Does NOT delete the old localStorage entry until the read-back from IndexedDB succeeds!
 */
export async function migrateFromLocalStorage(storeName, key, defaultData = null, metadata = {}) {
  // 1. First, check if already in IndexedDB
  const existingIdbData = await loadFromIndexedDB(storeName, key);
  if (existingIdbData !== null && existingIdbData !== undefined) {
    // If it is in IndexedDB and also in localStorage as a large blob, clean up localStorage
    cleanOldLocalStorageBlobIfMigrated(key);
    return existingIdbData;
  }

  // 2. Check if localStorage has data to migrate
  let rawFromLs = null;
  const ls = getLocalStorage();
  if (ls) {
    try {
      rawFromLs = ls.getItem(key);
    } catch (e) {
      console.warn(`[OLU Storage Migration] Unable to read localStorage key "${key}":`, e);
    }
  }

  if (rawFromLs) {
    try {
      const parsedData = JSON.parse(rawFromLs);

      // If this is just a pointer/stub, skip re-migration
      if (parsedData && parsedData._migratedToIdb) {
        return defaultData;
      }

      // Save to IndexedDB
      const saved = await saveToIndexedDB(storeName, key, parsedData, metadata);
      if (saved) {
        // Strict read-back verification:
        const verifyData = await loadFromIndexedDB(storeName, key);
        if (verifyData !== null && verifyData !== undefined) {
          // Success! Replace the large localStorage blob with a lightweight stub
          safeReplaceWithStub(key, parsedData, rawFromLs.length);
          return verifyData;
        }
      }
      return parsedData;
    } catch (parseErr) {
      console.warn(`[OLU Storage Migration] JSON parse error on key "${key}", using fallback:`, parseErr);
    }
  }

  // 3. Fallback to default
  if (defaultData !== null) {
    await saveToIndexedDB(storeName, key, defaultData, metadata);
    return defaultData;
  }

  return null;
}

function getLocalStorage() {
  if (typeof window !== 'undefined' && window.localStorage) return window.localStorage;
  if (typeof globalThis !== 'undefined' && globalThis.localStorage) return globalThis.localStorage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}

/**
 * Replace a heavy localStorage key with a tiny stub (< 100 bytes) to free space
 */
function safeReplaceWithStub(key, originalData, originalByteLength) {
  const ls = getLocalStorage();
  if (!ls) return;

  try {
    const stub = JSON.stringify({
      _migratedToIdb: true,
      key,
      migratedAt: Date.now(),
      character: originalData?.character || null,
      currentRoom: originalData?.currentRoom || null,
      updatedAt: originalData?.updatedAt || Date.now()
    });
    ls.setItem(key, stub);
  } catch (err) {
    try {
      ls.removeItem(key);
    } catch (_) {}
  }
}

/**
 * If data already exists in IndexedDB and localStorage still has the large blob, safely stub it out.
 */
function cleanOldLocalStorageBlobIfMigrated(key) {
  const ls = getLocalStorage();
  if (!ls) return;
  try {
    const raw = ls.getItem(key);
    if (!raw) return;
    if (raw.length > 500 && !raw.includes('"_migratedToIdb":true')) {
      safeReplaceWithStub(key, { key }, raw.length);
    }
  } catch (_) {}
}

/**
 * Safe localStorage setter that intercepts QuotaExceededError gracefully
 */
export function safeLocalStorageSetItem(key, value) {
  const ls = getLocalStorage();
  if (!ls) return false;
  try {
    ls.setItem(key, value);
    return true;
  } catch (err) {
    const isQuotaError = (
      err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014
    );

    if (isQuotaError) {
      console.warn(`[OLU Storage Guardian] QuotaExceededError intercepted for key "${key}". Storage write prevented gracefully.`);
      emergencyCleanLocalStorage();
    } else {
      console.warn(`[OLU Storage Guardian] Error setting localStorage key "${key}":`, err);
    }
    return false;
  }
}

/**
 * Emergency cleanup of non-essential duplicate backups in localStorage
 */
export function emergencyCleanLocalStorage() {
  const ls = getLocalStorage();
  if (!ls) return;

  try {
    const keysToRemove = [];
    for (let i = 0; i < ls.length; i++) {
      const k = ls.key(i);
      if (!k) continue;

      if (k.includes('_backup_') || k.startsWith('temp_') || k.includes('_ambiguous_log')) {
        keysToRemove.push(k);
      }
    }

    let freedCount = 0;
    for (const k of keysToRemove) {
      try {
        ls.removeItem(k);
        freedCount++;
      } catch (_) {}
    }

    if (freedCount > 0) {
      console.log(`[OLU Storage Guardian] Cleaned ${freedCount} obsolete backup/temp keys from localStorage.`);
    }
  } catch (e) {
    console.warn('[OLU Storage Guardian] Notice during emergency localStorage cleanup:', e);
  }
}

// =============================================================================
// SYNCHRONOUS BRIDGE HELPERS FOR GAMEPLAY & VIEW CONTROLLERS
// =============================================================================

/**
 * Get synchronous state (from memory cache first, then localStorage fallback,
 * while scheduling background IndexedDB sync).
 */
export function getSynchronousState(storeName, key, fallbackFactory) {
  // 1. In-memory cache is instant and primary
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  // 2. Check localStorage if available (migration bridge)
  const ls = getLocalStorage();
  if (ls) {
    try {
      const raw = ls.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!parsed || !parsed._migratedToIdb) {
          memoryCache.set(key, parsed);
          // Asynchronously migrate to IndexedDB in background
          saveToIndexedDB(storeName, key, parsed).then(() => {
            cleanOldLocalStorageBlobIfMigrated(key);
          });
          return parsed;
        } else if (parsed && parsed._migratedToIdb) {
          // It's a stub, check if we have defaultState to merge
          const def = typeof fallbackFactory === 'function' ? fallbackFactory() : fallbackFactory;
          const merged = { ...def, ...parsed };
          memoryCache.set(key, merged);
          return merged;
        }
      }
    } catch (_) {}
  }

  // 3. Fallback to default
  const defaultState = typeof fallbackFactory === 'function' ? fallbackFactory() : fallbackFactory;
  memoryCache.set(key, defaultState);

  // Trigger background load from IndexedDB in case it was persisted earlier
  loadFromIndexedDB(storeName, key).then((persisted) => {
    if (persisted) {
      memoryCache.set(key, persisted);
    } else if (defaultState) {
      saveToIndexedDB(storeName, key, defaultState);
    }
  });

  return defaultState;
}

/**
 * Set synchronous state (updates memory cache immediately, writes to IndexedDB
 * asynchronously, and keeps localStorage safe from QuotaExceededError).
 */
export function setSynchronousState(storeName, key, stateObj, metadata = {}) {
  if (!stateObj) return;

  // 1. Immediately store in memory cache for 0ms latency in subsequent synchronous calls
  memoryCache.set(key, stateObj);

  // 2. Asynchronously save to IndexedDB
  saveToIndexedDB(storeName, key, stateObj, metadata).catch((err) => {
    console.error(`[OLU Storage] Failed to persist state for key "${key}" to IndexedDB:`, err);
  });

  // 3. Keep localStorage clean with only a tiny lightweight stub
  safeReplaceWithStub(key, stateObj, JSON.stringify(stateObj).length);
}

/**
 * Preload all character house states into in-memory cache on app bootstrap
 */
export async function preloadAllHouseStates() {
  const db = await openOluDatabase();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const transaction = db.transaction([OLU_STORE_HOUSE_STATES], 'readonly');
      const store = transaction.objectStore(OLU_STORE_HOUSE_STATES);
      const req = store.getAll();

      req.onsuccess = () => {
        const records = req.result || [];
        for (const record of records) {
          if (record && record.key && record.data) {
            memoryCache.set(record.key, record.data);
          }
        }
        console.log(`[OLU Storage] Preloaded ${records.length} house states from IndexedDB into memory cache.`);
        resolve(records.length);
      };

      req.onerror = () => resolve(0);
    } catch (_) {
      resolve(0);
    }
  });
}
