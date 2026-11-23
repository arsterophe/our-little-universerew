/**
 * OUR LITTLE PHOTOBOOTH — INDEXEDDB STORAGE ENGINE
 * Database: olu_photobooth_db_v1
 * Stores high-resolution photo strips, project states, and custom assets.
 * Strictly avoids polluting localStorage with heavy base64/blob media.
 */

const DB_NAME = 'olu_photobooth_db_v1';
const DB_VERSION = 1;
const STORE_MEMORIES = 'memories';
const STORE_ASSETS = 'custom_assets';

let dbInstance = null;
let dbOpenPromise = null;

// Memory fallback cache for testing environments
const memoryStore = {
  memories: new Map(),
  custom_assets: new Map()
};

/**
 * Opens or returns the singleton IndexedDB connection
 */
export async function getPhotoboothDb() {
  if (dbInstance) return dbInstance;
  if (dbOpenPromise) return dbOpenPromise;

  if (typeof indexedDB === 'undefined') {
    return null;
  }

  dbOpenPromise = new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_MEMORIES)) {
          const memStore = db.createObjectStore(STORE_MEMORIES, { keyPath: 'id' });
          memStore.createIndex('author', 'author', { unique: false });
          memStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        if (!db.objectStoreNames.contains(STORE_ASSETS)) {
          const assetStore = db.createObjectStore(STORE_ASSETS, { keyPath: 'id' });
          assetStore.createIndex('type', 'type', { unique: false });
        }
      };

      request.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };

      request.onerror = (e) => {
        console.warn('[Photobooth IDB] Error opening database:', e.target.error);
        resolve(null);
      };
    } catch (err) {
      console.warn('[Photobooth IDB] Exception opening database:', err);
      resolve(null);
    }
  });

  return dbOpenPromise;
}

/**
 * Saves a photobooth memory item into IndexedDB
 */
export async function savePhotoboothMemory(memoryItem) {
  if (!memoryItem || !memoryItem.id) {
    throw new Error('Item memory tidak valid atau tidak memiliki ID.');
  }

  const record = {
    ...memoryItem,
    savedAt: Date.now()
  };

  const db = await getPhotoboothDb();
  if (!db) {
    memoryStore.memories.set(record.id, record);
    return record;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_MEMORIES, 'readwrite');
      const store = tx.objectStore(STORE_MEMORIES);
      const req = store.put(record);

      req.onsuccess = () => {
        memoryStore.memories.set(record.id, record);
        resolve(record);
      };
      req.onerror = () => reject(req.error);
    } catch (err) {
      memoryStore.memories.set(record.id, record);
      resolve(record);
    }
  });
}

/**
 * Loads all saved memories for an author or all participants
 */
export async function getPhotoboothMemories(authorFilter = null) {
  const db = await getPhotoboothDb();
  if (!db) {
    const list = Array.from(memoryStore.memories.values());
    if (authorFilter) {
      return list.filter(m => m.author === authorFilter || (Array.isArray(m.participants) && m.participants.includes(authorFilter)));
    }
    return list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_MEMORIES, 'readonly');
      const store = tx.objectStore(STORE_MEMORIES);
      const req = store.getAll();

      req.onsuccess = () => {
        let list = req.result || [];
        if (authorFilter) {
          list = list.filter(m => m.author === authorFilter || (Array.isArray(m.participants) && m.participants.includes(authorFilter)));
        }
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        resolve(list);
      };
      req.onerror = () => {
        resolve(Array.from(memoryStore.memories.values()));
      };
    } catch (_) {
      resolve(Array.from(memoryStore.memories.values()));
    }
  });
}

/**
 * Gets a single memory by ID
 */
export async function getPhotoboothMemoryById(id) {
  const db = await getPhotoboothDb();
  if (!db) {
    return memoryStore.memories.get(id) || null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_MEMORIES, 'readonly');
      const store = tx.objectStore(STORE_MEMORIES);
      const req = store.get(id);

      req.onsuccess = () => resolve(req.result || memoryStore.memories.get(id) || null);
      req.onerror = () => resolve(memoryStore.memories.get(id) || null);
    } catch (_) {
      resolve(memoryStore.memories.get(id) || null);
    }
  });
}

/**
 * Deletes a memory item from IndexedDB
 */
export async function deletePhotoboothMemory(id, actorChar = null) {
  const existing = await getPhotoboothMemoryById(id);
  if (!existing) return true;

  if (actorChar && existing.author && existing.author !== actorChar) {
    throw new Error(`Akses ditolak: ${actorChar} tidak memiliki izin menghapus karya milik ${existing.author}`);
  }

  const db = await getPhotoboothDb();
  memoryStore.memories.delete(id);

  if (!db) return true;

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_MEMORIES, 'readwrite');
      const store = tx.objectStore(STORE_MEMORIES);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    } catch (err) {
      resolve(true);
    }
  });
}

/**
 * Saves a custom uploaded asset (background or sticker)
 */
export async function saveCustomAsset(assetItem) {
  if (!assetItem || !assetItem.id) {
    throw new Error('Asset tidak valid');
  }

  const record = {
    ...assetItem,
    createdAt: Date.now()
  };

  const db = await getPhotoboothDb();
  if (!db) {
    memoryStore.custom_assets.set(record.id, record);
    return record;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_ASSETS, 'readwrite');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.put(record);

      req.onsuccess = () => {
        memoryStore.custom_assets.set(record.id, record);
        resolve(record);
      };
      req.onerror = () => reject(req.error);
    } catch (err) {
      memoryStore.custom_assets.set(record.id, record);
      resolve(record);
    }
  });
}

/**
 * Loads all custom assets of a given type ('bg' | 'sticker')
 */
export async function getCustomAssets(typeFilter = null) {
  const db = await getPhotoboothDb();
  if (!db) {
    const list = Array.from(memoryStore.custom_assets.values());
    return typeFilter ? list.filter(a => a.type === typeFilter) : list;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_ASSETS, 'readonly');
      const store = tx.objectStore(STORE_ASSETS);
      const req = store.getAll();

      req.onsuccess = () => {
        let list = req.result || [];
        if (typeFilter) {
          list = list.filter(a => a.type === typeFilter);
        }
        resolve(list);
      };
      req.onerror = () => resolve([]);
    } catch (_) {
      resolve([]);
    }
  });
}
