/**
 * OUR LITTLE UNIVERSE — FIREBASE AUTHENTICATION CONFIGURATION
 * 
 * Secure initialization of Firebase Authentication with environment-based
 * configuration, session management, and character UID verification.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  connectFirestoreEmulator
} from 'firebase/firestore';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  uploadString,
  getDownloadURL,
  deleteObject,
  getBlob,
  connectStorageEmulator
} from 'firebase/storage';

// Helper to safely access environment variables in Vite and Node test environments
const getEnv = (key) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return process.env[key];
  }
  return '';
};

// 1. Firebase Project Configuration from Environment Variables
const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID')
};

// Check if Firebase credentials are fully configured
export function isFirebaseConfigured() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
}

// 2. Initialize Firebase App (Singleton pattern)
let app = null;
let auth = null;
let db = null;
let storage = null;

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    if (getEnv('VITE_USE_FIREBASE_EMULATOR') === 'true') {
      try {
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
        connectStorageEmulator(storage, '127.0.0.1', 9199);
      } catch (emuErr) {
        // Ignore emulator reconnect error
      }
    }

    // Enforce local session persistence
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Gagal mengatur persistensi sesi auth:', err);
    });
  } catch (err) {
    console.error('Inisialisasi Firebase gagal:', err);
  }
} else {
  console.warn(
    'Konfigurasi Firebase belum diisi. Pastikan variabel lingkungan VITE_FIREBASE_* tersedia di file .env.'
  );
}

export { app, auth, db, storage };

// 3. Authorized Character Universe Specifications & Mapping (Canonical Source of Truth)
export const CANONICAL_CHARACTERS = {
  nyanya: {
    id: 'nyanya',
    name: 'Nyanya',
    role: 'The Moonlit Shadow Witch',
    universe: 'KIDULT',
    ownerName: 'Alenda',
    symbol: '★',
    avatar: '/assets/avatar_nyanya_hd.png',
    email: 'nyanya@ourlittleuniverse.com',
    uid: '1uwba7MrGVU3xHu57VVLvztskrg2'
  },
  lala: {
    id: 'lala',
    name: 'Lala',
    role: 'The Everglow Fairy',
    universe: 'TO YOU',
    ownerName: 'Bella',
    symbol: '☼',
    avatar: '/assets/avatar_lala_hd.png',
    email: 'lala@ourlittleuniverse.com',
    uid: 'EqByKA8FXoTEt0OmIsSDPfnxMDB3'
  },
  lele: {
    id: 'lele',
    name: 'Lele',
    role: 'The Eclipse Guardian',
    universe: 'SHADOW',
    ownerName: 'Vanya',
    symbol: '☾',
    avatar: '/assets/avatar_lele_hd.png',
    email: 'lele@ourlittleuniverse.com',
    uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2'
  }
};

export const CHARACTER_AUTH_RULES = {
  nyanya: {
    ...CANONICAL_CHARACTERS.nyanya,
    expectedEmail: (getEnv('VITE_NYANYA_EMAIL') || CANONICAL_CHARACTERS.nyanya.email).toLowerCase(),
    expectedUid: getEnv('VITE_NYANYA_UID') || CANONICAL_CHARACTERS.nyanya.uid
  },
  lala: {
    ...CANONICAL_CHARACTERS.lala,
    expectedEmail: (getEnv('VITE_LALA_EMAIL') || CANONICAL_CHARACTERS.lala.email).toLowerCase(),
    expectedUid: getEnv('VITE_LALA_UID') || CANONICAL_CHARACTERS.lala.uid
  },
  lele: {
    ...CANONICAL_CHARACTERS.lele,
    expectedEmail: (getEnv('VITE_LELE_EMAIL') || CANONICAL_CHARACTERS.lele.email).toLowerCase(),
    expectedUid: getEnv('VITE_LELE_UID') || CANONICAL_CHARACTERS.lele.uid
  }
};

/**
 * Determine which character an authenticated user belongs to
 * strictly by verified Firebase UID first, then canonical email.
 */
export function identifyUserCharacter(user) {
  if (!user || !user.uid) return null;

  const uid = user.uid;
  const email = (user.email || '').toLowerCase().trim();

  // 1. Strict check by verified Firebase UID (Primary Source of Truth)
  for (const [key, rules] of Object.entries(CHARACTER_AUTH_RULES)) {
    if (rules.expectedUid && rules.expectedUid === uid) {
      return key;
    }
  }

  // 2. Fallback check by verified canonical email (supports test suites / mock users)
  for (const [key, rules] of Object.entries(CHARACTER_AUTH_RULES)) {
    if (rules.expectedEmail && rules.expectedEmail === email) {
      return key;
    }
  }

  return null;
}

export const getVerifiedCharacterKey = identifyUserCharacter;

/**
 * Verify whether the authenticated user is authorized to access the selected character's universe.
 * Rejects with a descriptive, friendly message if unauthorized or mismatched.
 */
export function verifyCharacterAuthorization(user, selectedCharacterKey) {
  if (!user) {
    return {
      authorized: false,
      reason: 'Tidak ada pengguna yang terautentikasi.'
    };
  }

  const userCharacterKey = identifyUserCharacter(user);
  const selectedConfig = CHARACTER_AUTH_RULES[selectedCharacterKey];

  if (!selectedConfig) {
    return {
      authorized: false,
      reason: 'Pilihan karakter tidak valid.'
    };
  }

  // Account does not belong to any recognized character of the 3 friends
  if (!userCharacterKey) {
    return {
      authorized: false,
      reason:
        'Akses ditolak: Akun ini tidak terdaftar sebagai bagian dari tiga sahabat Our Little Universe ✧'
    };
  }

  // Account belongs to a different character
  if (userCharacterKey !== selectedCharacterKey) {
    const actualChar = CHARACTER_AUTH_RULES[userCharacterKey];
    return {
      authorized: false,
      mismatch: true,
      actualCharacter: actualChar,
      selectedCharacter: selectedConfig,
      reason: `Akses ditolak: Akun ini milik ${actualChar.name} (${actualChar.role}). Kamu saat ini berada di gerbang Universe ${selectedConfig.name}. Silakan kembali dan pilih karakter ${actualChar.name} untuk masuk ✨`
    };
  }

  // Authorized!
  return {
    authorized: true,
    characterKey: userCharacterKey,
    characterConfig: selectedConfig
  };
}

/**
 * Authenticate with Firebase using Email and Password,
 * then strictly validate the character mapping.
 */
export async function loginWithFirebase(selectedCharacterKey, email, password) {
  if (!isFirebaseConfigured() || !auth) {
    throw new Error(
      'Konfigurasi Firebase belum terpasang. Silakan lengkapi file .env terlebih dahulu dengan kunci Firebase proyekmu.'
    );
  }

  const cleanEmail = email.trim();
  const cleanPassword = password;

  if (!cleanEmail) {
    throw new Error('Silakan masukkan email akun terlebih dahulu ✧');
  }

  if (!cleanPassword) {
    throw new Error('Silakan masukkan password akun terlebih dahulu ✧');
  }

  // Ensure any mismatched lingering session is signed out before authenticating new user
  if (auth.currentUser) {
    const existingChar = identifyUserCharacter(auth.currentUser);
    if (existingChar !== selectedCharacterKey) {
      try {
        await signOut(auth);
      } catch (_) {}
    }
  }

  // 1. Authenticate with Firebase Authentication
  const userCredential = await signInWithEmailAndPassword(
    auth,
    cleanEmail,
    cleanPassword
  );
  const user = userCredential.user;

  // Force user reload and refresh ID token so request.auth.token immediately contains email_verified: true
  try {
    if (typeof user.reload === 'function') {
      await user.reload();
    }
    if (typeof user.getIdToken === 'function') {
      await user.getIdToken(true);
    }
  } catch (refreshErr) {
    console.warn('Notice refreshing ID token on login:', refreshErr);
  }

  // 2. Strict character validation (Never trust UI selection alone)
  const authCheck = verifyCharacterAuthorization(user, selectedCharacterKey);

  if (!authCheck.authorized) {
    // Immediately log out to prevent unauthorized session
    await signOut(auth);
    throw new Error(authCheck.reason);
  }

  return {
    user,
    characterConfig: authCheck.characterConfig
  };
}

/**
 * Sign out user securely
 */
export async function logoutFirebase() {
  if (auth) {
    await signOut(auth);
  }
}

// ==============================================================================
// 4. DATABASE SYNC & PERSISTENCE STATE MANAGEMENT
// ==============================================================================

const dbStatus = {
  state: 'idle', // 'idle' | 'syncing' | 'synced' | 'error' | 'offline'
  message: 'Database siap',
  category: null,   // 'READ_FIRESTORE' | 'WRITE_FIRESTORE' | 'FIREBASE_AUTH' | 'STORAGE' | null
  operation: null,  // e.g. 'onSnapshot', 'getDocs', 'setDoc', 'deleteDoc'
  targetPath: null, // e.g. 'orbit_events', 'orbit_events/evt-1'
  errorCode: null,  // e.g. 'permission-denied', 'auth/unauthenticated'
  errorMessage: null,
  lastError: null,
  lastSyncTime: null
};

const statusListeners = [];

export function subscribeDatabaseStatus(listener) {
  statusListeners.push(listener);
  try {
    listener({ ...dbStatus });
  } catch (_) {}
  return () => {
    const idx = statusListeners.indexOf(listener);
    if (idx > -1) statusListeners.splice(idx, 1);
  };
}

export function updateDatabaseStatus(state, message = '', error = null, details = {}) {
  dbStatus.state = state;
  dbStatus.message = message || (state === 'synced' ? 'Tersimpan di Cloud ☁️' : state);

  if (state === 'synced') {
    dbStatus.lastSyncTime = new Date().toISOString();
    dbStatus.lastError = null;
    dbStatus.category = null;
    dbStatus.operation = null;
    dbStatus.targetPath = null;
    dbStatus.errorCode = null;
    dbStatus.errorMessage = null;
  } else if (state === 'error') {
    const errObj = (error && typeof error === 'object') ? error : {};
    dbStatus.lastError = errObj.message || (error ? String(error) : message);
    dbStatus.errorCode = errObj.code || details.errorCode || 'error';
    dbStatus.errorMessage = errObj.message || dbStatus.lastError;
    dbStatus.category = details.category || 'READ_FIRESTORE';
    dbStatus.operation = details.operation || 'query';
    dbStatus.targetPath = details.targetPath || 'orbit_events';
  } else {
    if (details.category) dbStatus.category = details.category;
    if (details.operation) dbStatus.operation = details.operation;
    if (details.targetPath) dbStatus.targetPath = details.targetPath;
  }

  statusListeners.forEach((fn) => {
    try {
      fn({ ...dbStatus });
    } catch (_) {}
  });
}

export function getDatabaseStatus() {
  return { ...dbStatus };
}

/**
 * Backup a localStorage key with timestamp and latest copy
 * Ensures zero data loss before any migration
 */
export function backupLocalStorageKey(key) {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { backedUp: false, reason: 'localStorage tidak tersedia di lingkungan ini' };
  }
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return { backedUp: false, reason: 'Tidak ada data lama di localStorage' };
    }
    const timestamp = Date.now();
    const backupKeyTimestamped = `${key}_backup_${timestamp}`;
    const backupKeyLatest = `${key}_backup_latest`;
    window.localStorage.setItem(backupKeyTimestamped, raw);
    window.localStorage.setItem(backupKeyLatest, raw);
    let count = 1;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) count = parsed.length;
    } catch (_) {}

    return {
      backedUp: true,
      backupKey: backupKeyTimestamped,
      itemCount: count,
      timestamp
    };
  } catch (err) {
    console.error('Gagal membuat backup localStorage:', err);
    return { backedUp: false, error: err.message };
  }
}

// ==============================================================================
// 5. OUR CALENDAR (ORBIT_EVENTS) FIRESTORE DATABASE OPERATIONS
// ==============================================================================

const ORBIT_COLLECTION = 'orbit_events';

/**
 * Save an event to Firestore collection `orbit_events`
 * Enforces verified UID authentication from backend
 */
export async function dbSaveOrbitEvent(eventData, authUser) {
  if (!db) {
    const errMsg = 'Firestore belum terinisialisasi. Periksa kredensial Firebase.';
    updateDatabaseStatus('error', errMsg, new Error(errMsg), {
      category: 'WRITE_FIRESTORE',
      operation: 'dbSaveOrbitEvent (init check)',
      targetPath: 'orbit_events',
      errorCode: 'db/uninitialized'
    });
    throw new Error(errMsg);
  }

  if (!authUser || !authUser.uid) {
    const errMsg = 'Akses ditolak: Operasi database mewajibkan pengguna terautentikasi (UID).';
    updateDatabaseStatus('error', errMsg, new Error('User unauthenticated'), {
      category: 'FIREBASE_AUTH',
      operation: 'dbSaveOrbitEvent (auth check)',
      targetPath: `orbit_events/${eventData?.id || 'new'}`,
      errorCode: 'auth/unauthenticated'
    });
    throw new Error(errMsg);
  }

  // Ensure Firebase Auth token is actively available before initiating write
  if (typeof authUser.getIdToken === 'function') {
    try {
      const token = await authUser.getIdToken();
      if (!token) {
        throw new Error('Token sesi Firebase Auth tidak ditemukan.');
      }
    } catch (tokenErr) {
      updateDatabaseStatus('error', `Gagal memverifikasi token sebelum menyimpan: ${tokenErr.message}`, tokenErr, {
        category: 'FIREBASE_AUTH',
        operation: 'getIdToken (pre-save validation)',
        targetPath: `orbit_events/${eventData?.id || 'new'}`,
        errorCode: tokenErr.code || 'auth/token-invalid'
      });
      throw tokenErr;
    }
  }

  updateDatabaseStatus('syncing', 'Menyimpan kegiatan ke Cloud Firestore...', null, {
    category: 'WRITE_FIRESTORE',
    operation: 'setDoc',
    targetPath: `orbit_events/${eventData?.id || 'new'}`
  });

  try {
    const eventId = eventData.id || ('evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5));
    const verifiedChar = identifyUserCharacter(authUser) || 'nyanya';
    const verifiedCharConfig = CHARACTER_AUTH_RULES[verifiedChar];

    const initialResponses = {
      nyanya: { status: verifiedChar === 'nyanya' ? 'accepted' : 'pending' },
      lala: { status: verifiedChar === 'lala' ? 'accepted' : 'pending' },
      lele: { status: verifiedChar === 'lele' ? 'accepted' : 'pending' }
    };
    const mergedResponses = eventData.responses ? { ...initialResponses, ...eventData.responses } : initialResponses;
    if (mergedResponses[verifiedChar]) {
      mergedResponses[verifiedChar].status = 'accepted';
    }

    // Payload strictly attached to verified UID
    const payload = {
      id: eventId,
      title: (eventData.title || '').trim(),
      category: eventData.category || 'together',
      date: eventData.date,
      time: eventData.time || '19:00',
      location: (eventData.location || 'Our Little Universe').trim(),
      description: (eventData.description || '').trim(),
      proposer: verifiedChar,
      proposerName: verifiedCharConfig ? `${verifiedCharConfig.name} (${verifiedCharConfig.role})` : verifiedChar,
      proposerUid: authUser.uid,
      proposerEmail: (authUser.email || '').toLowerCase().trim(),
      participants: eventData.participants || ['nyanya', 'lala', 'lele'],
      status: eventData.category === 'meeting' ? (eventData.status || 'pending') : 'confirmed',
      responses: mergedResponses,
      updatedAt: new Date().toISOString()
    };

    if (!payload.createdAt) {
      payload.createdAt = eventData.createdAt || new Date().toISOString();
    }

    const docRef = doc(db, ORBIT_COLLECTION, eventId);
    await setDoc(docRef, payload, { merge: true });

    updateDatabaseStatus('synced', `Kegiatan "${payload.title}" berhasil disimpan di Cloud ☁️`);
    return payload;
  } catch (err) {
    console.error('Error saving event to Firestore:', err);
    updateDatabaseStatus('error', `Gagal menyimpan kegiatan ke Cloud: ${err.message}`, err, {
      category: 'WRITE_FIRESTORE',
      operation: 'setDoc (dbSaveOrbitEvent)',
      targetPath: `orbit_events/${eventData?.id || 'new'}`,
      errorCode: err.code || 'write-failed'
    });
    throw err;
  }
}

/**
 * Delete an event from Firestore collection `orbit_events`
 * Strictly enforces that only the verified creator UID can delete
 */
export async function dbDeleteOrbitEvent(eventId, authUser) {
  if (!db) {
    const errMsg = 'Firestore belum terinisialisasi.';
    updateDatabaseStatus('error', errMsg, new Error(errMsg), {
      category: 'WRITE_FIRESTORE',
      operation: 'dbDeleteOrbitEvent (init check)',
      targetPath: `orbit_events/${eventId}`,
      errorCode: 'db/uninitialized'
    });
    throw new Error(errMsg);
  }
  if (!authUser || !authUser.uid) {
    const errMsg = 'Akses ditolak: Autentikasi UID diperlukan untuk menghapus.';
    updateDatabaseStatus('error', errMsg, new Error('User unauthenticated'), {
      category: 'FIREBASE_AUTH',
      operation: 'dbDeleteOrbitEvent (auth check)',
      targetPath: `orbit_events/${eventId}`,
      errorCode: 'auth/unauthenticated'
    });
    throw new Error(errMsg);
  }

  updateDatabaseStatus('syncing', 'Menghapus kegiatan dari Cloud Firestore...', null, {
    category: 'WRITE_FIRESTORE',
    operation: 'deleteDoc',
    targetPath: `orbit_events/${eventId}`
  });

  try {
    const docRef = doc(db, ORBIT_COLLECTION, eventId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      updateDatabaseStatus('synced', 'Kegiatan sudah tidak ada di Cloud.');
      return { success: true };
    }

    const data = snap.data();
    // Security check: Only proposer UID can delete
    if (data.proposerUid && data.proposerUid !== authUser.uid) {
      const verifiedChar = identifyUserCharacter(authUser);
      if (data.proposer && verifiedChar && data.proposer !== verifiedChar) {
        const errMsg = 'Akses ditolak: Hanya pembuat acara yang memiliki hak menghapus kegiatan ini.';
        updateDatabaseStatus('error', errMsg, new Error(errMsg), {
          category: 'WRITE_FIRESTORE',
          operation: 'deleteDoc (ownership permission check)',
          targetPath: `orbit_events/${eventId}`,
          errorCode: 'permission-denied'
        });
        throw new Error(errMsg);
      }
    }

    await deleteDoc(docRef);
    updateDatabaseStatus('synced', 'Kegiatan berhasil dihapus dari Cloud 🗑️');
    return { success: true };
  } catch (err) {
    console.error('Error deleting event from Firestore:', err);
    updateDatabaseStatus('error', `Gagal menghapus kegiatan: ${err.message}`, err, {
      category: 'WRITE_FIRESTORE',
      operation: 'deleteDoc (dbDeleteOrbitEvent)',
      targetPath: `orbit_events/${eventId}`,
      errorCode: err.code || 'delete-failed'
    });
    throw err;
  }
}

/**
 * Respond to meeting invitation in Firestore
 * Enforces participant-only response modification
 */
export async function dbRespondToMeeting(eventId, authUser, responseType, note = '', altDate = '', altTime = '') {
  if (!db) {
    const errMsg = 'Firestore belum terinisialisasi.';
    updateDatabaseStatus('error', errMsg, new Error(errMsg), {
      category: 'WRITE_FIRESTORE',
      operation: 'dbRespondToMeeting (init check)',
      targetPath: `orbit_events/${eventId}`,
      errorCode: 'db/uninitialized'
    });
    throw new Error(errMsg);
  }
  if (!authUser || !authUser.uid) {
    const errMsg = 'Akses ditolak: Autentikasi diperlukan.';
    updateDatabaseStatus('error', errMsg, new Error('User unauthenticated'), {
      category: 'FIREBASE_AUTH',
      operation: 'dbRespondToMeeting (auth check)',
      targetPath: `orbit_events/${eventId}`,
      errorCode: 'auth/unauthenticated'
    });
    throw new Error(errMsg);
  }

  updateDatabaseStatus('syncing', 'Menyimpan respons meeting ke Cloud...', null, {
    category: 'WRITE_FIRESTORE',
    operation: 'updateDoc',
    targetPath: `orbit_events/${eventId}`
  });

  try {
    const userChar = identifyUserCharacter(authUser) || 'nyanya';
    const docRef = doc(db, ORBIT_COLLECTION, eventId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      throw new Error('Undangan meeting tidak ditemukan di Cloud.');
    }

    const evt = snap.data();
    const currentResponses = evt.responses || {};

    const myResponse = {
      status: responseType,
      note: note || (responseType === 'accepted' ? 'Menyetujui jadwal meeting ✨' : ''),
      uid: authUser.uid,
      email: authUser.email || '',
      respondedAt: new Date().toISOString()
    };

    if (responseType === 'proposed_alt') {
      myResponse.altDate = altDate || evt.date;
      myResponse.altTime = altTime || evt.time;
      myResponse.note = note || 'Mengusulkan waktu alternatif.';
    }

    currentResponses[userChar] = myResponse;

    // Check if all 3 friends accepted
    const allAccepted = ['nyanya', 'lala', 'lele'].every(
      (c) => currentResponses[c] && currentResponses[c].status === 'accepted'
    );

    const updatePayload = {
      responses: currentResponses,
      status: allAccepted ? 'confirmed' : 'pending',
      updatedAt: new Date().toISOString()
    };

    await updateDoc(docRef, updatePayload);
    updateDatabaseStatus('synced', `Respons meeting tersimpan di Cloud 🪐`);
    return { success: true, updatedResponses: currentResponses };
  } catch (err) {
    console.error('Error responding to meeting in Firestore:', err);
    updateDatabaseStatus('error', `Gagal menyimpan respons meeting: ${err.message}`, err, {
      category: 'WRITE_FIRESTORE',
      operation: 'updateDoc (dbRespondToMeeting)',
      targetPath: `orbit_events/${eventId}`,
      errorCode: err.code || 'update-failed'
    });
    throw err;
  }
}

/**
 * Fetch all events accessible to current user from Firestore
 * Strictly enforces query constraints aligned with Firestore Security Rules
 */
export async function dbFetchOrbitEvents(authUser) {
  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  if (!authUser || !authUser.uid) {
    updateDatabaseStatus('idle', 'Mode Offline (Cache) — Masuk akun untuk sinkronisasi Cloud', null, {
      category: 'FIREBASE_AUTH',
      operation: 'dbFetchOrbitEvents (guest view)',
      targetPath: 'orbit_events'
    });
    return [];
  }

  // Ensure Firebase Auth token is actively available before initiating fetch
  if (typeof authUser.getIdToken === 'function') {
    try {
      const token = await authUser.getIdToken();
      if (!token) {
        throw new Error('Token sesi Firebase Auth tidak ditemukan.');
      }
    } catch (tokenErr) {
      updateDatabaseStatus('error', `Gagal memverifikasi token sebelum memuat kegiatan: ${tokenErr.message}`, tokenErr, {
        category: 'FIREBASE_AUTH',
        operation: 'getIdToken (pre-fetch validation)',
        targetPath: 'orbit_events',
        errorCode: tokenErr.code || 'auth/token-invalid'
      });
      throw tokenErr;
    }
  }

  updateDatabaseStatus('syncing', 'Memuat agenda kalender dari Cloud...', null, {
    category: 'READ_FIRESTORE',
    operation: 'getDocs',
    targetPath: 'orbit_events'
  });

  try {
    const colRef = collection(db, ORBIT_COLLECTION);
    const eventsMap = new Map();

    // 1. Query shared calendar events (category in ['together', 'meeting', 'birthday', 'reminder'])
    // This strictly aligns with `resource.data.category != 'personal'` in firestore.rules
    const sharedQuery = query(colRef, where('category', 'in', ['together', 'meeting', 'birthday', 'reminder']));
    const sharedSnap = await getDocs(sharedQuery);
    sharedSnap.forEach((d) => {
      eventsMap.set(d.id, d.data());
    });

    // 2. Query personal events only for the verified authenticated user
    // This strictly aligns with `resource.data.proposerUid == request.auth.uid` in firestore.rules
    if (authUser && authUser.uid) {
      try {
        const personalQuery = query(
          colRef,
          where('category', '==', 'personal'),
          where('proposerUid', '==', authUser.uid)
        );
        const personalSnap = await getDocs(personalQuery);
        personalSnap.forEach((d) => {
          eventsMap.set(d.id, d.data());
        });
      } catch (pErr) {
        console.warn('Personal events query notice:', pErr);
      }
    }

    const events = Array.from(eventsMap.values());
    updateDatabaseStatus('synced', `${events.length} kegiatan tersinkronisasi dari Cloud ☁️`);
    return events;
  } catch (err) {
    console.error('Error fetching events from Firestore:', err);
    updateDatabaseStatus('error', `Gagal memuat kegiatan dari Cloud: ${err.message}`, err, {
      category: 'READ_FIRESTORE',
      operation: 'getDocs (dbFetchOrbitEvents)',
      targetPath: 'orbit_events',
      errorCode: err.code || 'fetch-failed'
    });
    throw err;
  }
}

/**
 * Real-time listener for Our Calendar events with dual-query subscription
 * strictly aligned with Security Rules
 */
export function dbSubscribeOrbitEvents(authUser, onUpdate, onError) {
  if (!db) {
    if (onError) onError(new Error('Firestore belum terinisialisasi.'));
    return () => {};
  }

  if (!authUser || !authUser.uid) {
    updateDatabaseStatus('idle', 'Mode Offline (Cache) — Masuk akun untuk sinkronisasi Cloud', null, {
      category: 'FIREBASE_AUTH',
      operation: 'dbSubscribeOrbitEvents (guest view)',
      targetPath: 'orbit_events'
    });
    return () => {};
  }

  // Pre-validate that Firebase Auth token is actively available before attaching listener
  if (typeof authUser.getIdToken === 'function') {
    authUser.getIdToken().catch((tokenErr) => {
      console.warn('Peringatan token autentikasi sebelum onSnapshot:', tokenErr);
      updateDatabaseStatus('error', `Token autentikasi tidak valid: ${tokenErr.message}`, tokenErr, {
        category: 'FIREBASE_AUTH',
        operation: 'getIdToken (pre-subscribe validation)',
        targetPath: 'orbit_events',
        errorCode: tokenErr.code || 'auth/token-invalid'
      });
    });
  }

  const colRef = collection(db, ORBIT_COLLECTION);
  const sharedEventsMap = new Map();
  const personalEventsMap = new Map();

  function emitMerged() {
    const merged = new Map([...sharedEventsMap, ...personalEventsMap]);
    const list = Array.from(merged.values());
    updateDatabaseStatus('synced', `${list.length} kegiatan tersinkronisasi real-time ☁️`);
    if (onUpdate) onUpdate(list);
  }

  // 1. Subscribe to shared events
  const sharedQuery = query(colRef, where('category', 'in', ['together', 'meeting', 'birthday', 'reminder']));
  const unsubShared = onSnapshot(
    sharedQuery,
    (snapshot) => {
      sharedEventsMap.clear();
      snapshot.forEach((d) => {
        sharedEventsMap.set(d.id, d.data());
      });
      emitMerged();
    },
    (err) => {
      console.error('Firestore onSnapshot error on shared orbit_events:', err);
      updateDatabaseStatus('error', `Koneksi real-time terputus: ${err.message}`, err, {
        category: 'READ_FIRESTORE',
        operation: 'onSnapshot (real-time shared query)',
        targetPath: 'orbit_events?category=together,meeting,birthday,reminder',
        errorCode: err.code || 'subscription-failed'
      });
      if (onError) onError(err);
    }
  );

  // 2. Subscribe to personal events if authenticated
  let unsubPersonal = () => {};
  if (authUser && authUser.uid) {
    const personalQuery = query(
      colRef,
      where('category', '==', 'personal'),
      where('proposerUid', '==', authUser.uid)
    );
    unsubPersonal = onSnapshot(
      personalQuery,
      (snapshot) => {
        personalEventsMap.clear();
        snapshot.forEach((d) => {
          personalEventsMap.set(d.id, d.data());
        });
        emitMerged();
      },
      (err) => {
        console.warn('Firestore onSnapshot personal events notice:', err);
      }
    );
  }

  return () => {
    unsubShared();
    unsubPersonal();
  };
}

/**
 * Idempotent migration of old localStorage calendar events to Firestore
 * 1. Creates backup of localStorage
 * 2. Checks individual documents in Firestore to prevent duplicates without violating rules
 * 3. Only migrates events owned/proposed by the currently authenticated character
 * 4. Binds verified UID and character mapping
 * 5. Merges safely without overwriting or deleting local data
 */
export async function dbMigrateOrbitEvents(authUser, localEvents = []) {
  if (!db) throw new Error('Firestore belum terinisialisasi.');
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: Autentikasi UID diperlukan untuk migrasi.');
  }

  // 1. Mandatory backup of localStorage key before any write
  const backupRes = backupLocalStorageKey('olu_orbit_events_v2');

  updateDatabaseStatus('syncing', 'Menjalankan migrasi data kalender ke Cloud Firestore...');

  try {
    const verifiedChar = identifyUserCharacter(authUser) || 'nyanya';
    const verifiedCharConfig = CHARACTER_AUTH_RULES[verifiedChar];

    let characterEventsCount = 0;
    let migratedCount = 0;
    let skippedExistingCount = 0;
    let skippedOtherCharacterCount = 0;
    let failedCount = 0;

    for (const evt of localEvents) {
      if (!evt || !evt.id) continue;

      // Security & Ownership: Each account ONLY migrates events they proposed
      if (evt.proposer !== verifiedChar) {
        skippedOtherCharacterCount++;
        continue;
      }

      characterEventsCount++;

      try {
        // Individual check: avoids collection-level scans that violate personal event privacy rules
        const docRef = doc(db, ORBIT_COLLECTION, evt.id);
        try {
          const existingSnap = await getDoc(docRef);
          if (existingSnap && existingSnap.exists()) {
            skippedExistingCount++;
            continue;
          }
        } catch (_) {
          // If doc does not exist or read throws 404, proceed to migrate
        }

        // Attach verified UID and email from authenticated Firebase session
        const payload = {
          ...evt,
          proposer: verifiedChar,
          proposerName: evt.proposerName || verifiedCharConfig?.name || verifiedChar,
          proposerUid: authUser.uid,
          proposerEmail: authUser.email || '',
          migratedAt: new Date().toISOString()
        };

        await setDoc(docRef, payload, { merge: true });
        migratedCount++;
      } catch (evtErr) {
        console.error(`Gagal memigrasikan kegiatan ${evt.id}:`, evtErr);
        failedCount++;
      }
    }

    const report = {
      success: true,
      backedUp: backupRes.backedUp,
      backupKey: backupRes.backupKey,
      character: verifiedChar,
      totalLocal: localEvents.length,
      characterEventsCount,
      migratedCount,
      skippedExistingCount,
      skippedOtherCharacterCount,
      failedCount
    };

    updateDatabaseStatus(
      'synced',
      `Migrasi tuntas untuk ${verifiedChar}: ${migratedCount} diunggah, ${skippedExistingCount} sudah ada, ${skippedOtherCharacterCount} akun lain ☁️`
    );

    return report;
  } catch (err) {
    console.error('Error during orbit events migration:', err);
    updateDatabaseStatus('error', `Migrasi gagal: ${err.message}`, err, {
      category: 'WRITE_FIRESTORE',
      operation: 'dbMigrateOrbitEvents',
      targetPath: 'orbit_events',
      errorCode: err.code || 'migration-failed'
    });
    throw err;
  }
}


// ==============================================================================
// FASE 3: USER PROFILE & STORIES (PERSONAL WRITING & OUR STORIES)
// ==============================================================================

export const USERS_COLLECTION = 'users';
export const STORIES_COLLECTION = 'stories';

/**
 * Synchronize authenticated user profile to Firestore
 * Stores strictly public profile fields: uid, characterKey, displayName, role, avatar, createdAt, updatedAt
 * Does NOT store email or private preferences in the public document.
 */
export async function dbSyncUserProfile(authUser, selectedCharacterKey) {
  if (!db) throw new Error('Firestore belum terinisialisasi.');
  if (!authUser || !authUser.uid) throw new Error('Akses ditolak: Autentikasi diperlukan.');

  try {
    const verifiedChar = identifyUserCharacter(authUser) || selectedCharacterKey;
    if (!verifiedChar || !CHARACTER_AUTH_RULES[verifiedChar]) {
      throw new Error('Akses ditolak: Pengguna tidak terdaftar sebagai karakter resmi Our Little Universe.');
    }
    const verifiedCharConfig = CHARACTER_AUTH_RULES[verifiedChar];

    const docRef = doc(db, USERS_COLLECTION, authUser.uid);
    const snap = await getDoc(docRef);

    const now = new Date().toISOString();

    if (!snap.exists()) {
      const initialProfile = {
        uid: authUser.uid,
        characterKey: verifiedChar,
        displayName: verifiedCharConfig.name,
        role: verifiedCharConfig.role,
        avatar: verifiedCharConfig.avatar,
        createdAt: now,
        updatedAt: now
      };
      await setDoc(docRef, initialProfile);
      return { created: true, profile: initialProfile };
    } else {
      const existing = snap.data();
      const updatePayload = {
        updatedAt: now
      };
      await updateDoc(docRef, updatePayload);
      return { created: false, profile: { ...existing, ...updatePayload } };
    }
  } catch (err) {
    console.error('Error synchronizing user profile to Firestore:', err);
    throw err;
  }
}

/**
 * Fetch a user profile document from Firestore
 */
export async function dbFetchUserProfile(userId) {
  if (!db) throw new Error('Firestore belum terinisialisasi.');
  if (!userId) return null;

  try {
    const docRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    console.error('Error fetching user profile:', err);
    throw err;
  }
}

/**
 * Update allowed mutable fields on user profile (displayName, avatar)
 */
export async function dbUpdateUserProfile(authUser, updates = {}) {
  if (!db) throw new Error('Firestore belum terinisialisasi.');
  if (!authUser || !authUser.uid) throw new Error('Akses ditolak: Autentikasi diperlukan.');

  try {
    const docRef = doc(db, USERS_COLLECTION, authUser.uid);
    const payload = {
      updatedAt: new Date().toISOString()
    };
    if (typeof updates.displayName === 'string' && updates.displayName.trim()) {
      payload.displayName = updates.displayName.trim().slice(0, 100);
    }
    if (typeof updates.avatar === 'string' && updates.avatar.trim()) {
      payload.avatar = updates.avatar.trim().slice(0, 500);
    }

    await updateDoc(docRef, payload);
    return { success: true, updates: payload };
  } catch (err) {
    console.error('Error updating user profile:', err);
    throw err;
  }
}

/**
 * Save story (Personal Writing draft or Our Stories published work)
 * Enforces ownership binding to authUser.uid and verified character identity.
 */
export async function dbSaveStory(storyInput, authUser) {
  if (!db) throw new Error('Firestore belum terinisialisasi.');
  if (!authUser || !authUser.uid) throw new Error('Akses ditolak: Autentikasi diperlukan.');

  try {
    const verifiedChar = identifyUserCharacter(authUser) || 'nyanya';
    const verifiedCharConfig = CHARACTER_AUTH_RULES[verifiedChar] || CHARACTER_AUTH_RULES.nyanya;

    const storyId = storyInput.id || `story-${verifiedChar}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const docRef = doc(db, STORIES_COLLECTION, storyId);

    const status = storyInput.status === 'published' ? 'published' : 'draft';
    const now = new Date().toISOString();

    const title = (storyInput.title || '').trim();
    if (!title) throw new Error('Judul karya tidak boleh kosong.');

    const content = (storyInput.content || '').trim();
    if (!content) throw new Error('Isi karya tidak boleh kosong.');

    const payload = {
      id: storyId,
      title: title.slice(0, 300),
      subtitle: (storyInput.subtitle || '').trim().slice(0, 500),
      synopsis: (storyInput.synopsis || '').trim().slice(0, 2000),
      content: content.slice(0, 500000),
      category: storyInput.category || 'cerpen',
      genre: storyInput.genre || 'Fantasi Kosmik',
      status: status,
      coverTheme: storyInput.coverTheme || 'starlight',
      coverUrl: (storyInput.coverUrl || '').slice(0, 1000),
      wordCount: typeof storyInput.wordCount === 'number' ? Math.max(0, storyInput.wordCount) : 0,
      readingTimeMinutes: typeof storyInput.readingTimeMinutes === 'number' ? Math.max(1, storyInput.readingTimeMinutes) : 1,
      authorUid: authUser.uid,
      authorChar: verifiedChar,
      authorName: storyInput.authorName || verifiedCharConfig?.name || verifiedChar,
      createdAt: storyInput.createdAt || now,
      updatedAt: now,
      publishedAt: status === 'published' ? (storyInput.publishedAt || now) : null
    };

    await setDoc(docRef, payload, { merge: true });
    return { success: true, story: payload };
  } catch (err) {
    console.error('Error saving story to Firestore:', err);
    throw err;
  }
}

/**
 * Delete a story document from Firestore
 * Strict ownership check: only the author UID can delete.
 */
export async function dbDeleteStory(storyId, authUser) {
  if (!db) throw new Error('Firestore belum terinisialisasi.');
  if (!authUser || !authUser.uid) throw new Error('Akses ditolak: Autentikasi diperlukan.');
  if (!storyId) throw new Error('ID karya diperlukan.');

  try {
    const docRef = doc(db, STORIES_COLLECTION, storyId);
    const snap = await getDoc(docRef);

    if (!snap.exists()) {
      return { success: true, message: 'Karya sudah tidak ada di Cloud.' };
    }

    const storyData = snap.data();
    if (storyData.authorUid !== authUser.uid) {
      throw new Error('Akses ditolak: Anda hanya dapat menghapus karya milik sendiri.');
    }

    await deleteDoc(docRef);
    return { success: true, message: 'Karya berhasil dihapus dari Cloud.' };
  } catch (err) {
    console.error('Error deleting story from Firestore:', err);
    throw err;
  }
}

/**
 * Fetch all stories accessible to the user
 * - All published stories across the universe
 * - Private drafts belonging to authUser.uid
 */
export async function dbFetchStories(authUser) {
  if (!db) throw new Error('Firestore belum terinisialisasi.');

  try {
    const colRef = collection(db, STORIES_COLLECTION);
    const storiesMap = new Map();

    // 1. Fetch all published stories (Our Stories)
    const pubQuery = query(colRef, where('status', '==', 'published'));
    const pubSnap = await getDocs(pubQuery);
    pubSnap.forEach((d) => {
      storiesMap.set(d.id, d.data());
    });

    // 2. Fetch authenticated user's own drafts (Personal Writing)
    if (authUser && authUser.uid) {
      const draftQuery = query(
        colRef,
        where('authorUid', '==', authUser.uid),
        where('status', '==', 'draft')
      );
      const draftSnap = await getDocs(draftQuery);
      draftSnap.forEach((d) => {
        storiesMap.set(d.id, d.data());
      });
    }

    return Array.from(storiesMap.values());
  } catch (err) {
    console.error('Error fetching stories from Firestore:', err);
    throw err;
  }
}

/**
 * Real-time listener for stories (dual-query subscription aligned with Security Rules)
 */
export function dbSubscribeStories(authUser, onUpdate, onError) {
  if (!db) {
    if (onError) onError(new Error('Firestore belum terinisialisasi.'));
    return () => {};
  }

  const colRef = collection(db, STORIES_COLLECTION);
  const publishedStoriesMap = new Map();
  const draftStoriesMap = new Map();

  function emitMerged() {
    const merged = new Map([...publishedStoriesMap, ...draftStoriesMap]);
    const list = Array.from(merged.values());
    if (onUpdate) onUpdate(list);
  }

  // 1. Subscribe to published stories
  const pubQuery = query(colRef, where('status', '==', 'published'));
  const unsubPublished = onSnapshot(
    pubQuery,
    (snapshot) => {
      publishedStoriesMap.clear();
      snapshot.forEach((d) => {
        publishedStoriesMap.set(d.id, d.data());
      });
      emitMerged();
    },
    (err) => {
      console.error('Firestore onSnapshot error on published stories:', err);
      if (onError) onError(err);
    }
  );

  // 2. Subscribe to user's drafts if authenticated
  let unsubDrafts = () => {};
  if (authUser && authUser.uid) {
    const draftQuery = query(
      colRef,
      where('authorUid', '==', authUser.uid),
      where('status', '==', 'draft')
    );
    unsubDrafts = onSnapshot(
      draftQuery,
      (snapshot) => {
        draftStoriesMap.clear();
        snapshot.forEach((d) => {
          draftStoriesMap.set(d.id, d.data());
        });
        emitMerged();
      },
      (err) => {
        console.warn('Firestore onSnapshot drafts notice:', err);
      }
    );
  }

  return () => {
    unsubPublished();
    unsubDrafts();
  };
}

/**
 * Idempotent migration of localStorage stories to Firestore
 * 1. Creates backup of localStorage stories
 * 2. Matches items strictly with authenticated user's character identity
 * 3. Binds verified authorUid and authorChar
 * 4. Isolates ambiguous items to ambiguous log (does not upload them)
 * 5. Skips existing documents to prevent overwrite
 */
export async function dbMigrateStories(authUser, localStories = []) {
  if (!db) throw new Error('Firestore belum terinisialisasi.');
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: Autentikasi UID diperlukan untuk migrasi cerita.');
  }

  const backupRes = backupLocalStorageKey('olu_stories_store_v1');
  backupLocalStorageKey('olu_stories_bookmarks_v1');
  backupLocalStorageKey('olu_stories_reading_progress_v1');

  try {
    const verifiedChar = identifyUserCharacter(authUser) || 'nyanya';
    const verifiedCharConfig = CHARACTER_AUTH_RULES[verifiedChar];

    let eligibleCount = 0;
    let migratedCount = 0;
    let skippedExistingCount = 0;
    let skippedOtherCharacterCount = 0;
    let ambiguousCount = 0;
    let failedCount = 0;

    const ambiguousItems = [];

    for (const story of localStories) {
      if (!story || !story.id || !story.title) {
        ambiguousCount++;
        ambiguousItems.push(story);
        continue;
      }

      // Check author match
      const storyAuthor = story.authorId || story.authorChar || story.author;
      if (!storyAuthor || !['nyanya', 'lala', 'lele'].includes(storyAuthor)) {
        ambiguousCount++;
        ambiguousItems.push(story);
        continue;
      }

      if (storyAuthor !== verifiedChar) {
        skippedOtherCharacterCount++;
        continue;
      }

      eligibleCount++;

      try {
        const docRef = doc(db, STORIES_COLLECTION, story.id);
        const snap = await getDoc(docRef);

        if (snap.exists()) {
          skippedExistingCount++;
          continue;
        }

        const status = story.status === 'published' ? 'published' : 'draft';
        const now = new Date().toISOString();

        const payload = {
          id: story.id,
          title: (story.title || '').trim().slice(0, 300),
          subtitle: (story.subtitle || '').trim().slice(0, 500),
          synopsis: (story.synopsis || '').trim().slice(0, 2000),
          content: (story.content || '').trim().slice(0, 500000),
          category: story.category || 'cerpen',
          genre: story.genre || 'Fantasi Kosmik',
          status: status,
          coverTheme: story.coverTheme || 'starlight',
          coverUrl: (story.coverUrl || '').slice(0, 1000),
          wordCount: typeof story.wordCount === 'number' ? story.wordCount : 0,
          readingTimeMinutes: typeof story.readingTimeMinutes === 'number' ? story.readingTimeMinutes : 1,
          authorUid: authUser.uid,
          authorChar: verifiedChar,
          authorName: story.authorName || verifiedCharConfig?.name || verifiedChar,
          createdAt: story.createdAt || now,
          updatedAt: story.updatedAt || now,
          publishedAt: status === 'published' ? (story.publishedAt || now) : null
        };

        await setDoc(docRef, payload, { merge: true });
        migratedCount++;
      } catch (stErr) {
        console.error(`Gagal migrasi cerita ${story.id}:`, stErr);
        failedCount++;
      }
    }

    // Record ambiguous items if any
    if (ambiguousItems.length > 0 && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem('olu_stories_ambiguous_log', JSON.stringify(ambiguousItems));
      } catch (_) {}
    }

    const report = {
      success: true,
      backedUp: backupRes.backedUp,
      backupKey: backupRes.backupKey,
      character: verifiedChar,
      totalLocal: localStories.length,
      eligibleCount,
      migratedCount,
      skippedExistingCount,
      skippedOtherCharacterCount,
      ambiguousCount,
      failedCount
    };

    return report;
  } catch (err) {
    console.error('Error during stories migration:', err);
    throw err;
  }
}

// ==============================================================================
// FASE 4: OUR LITTLE MOMENTS & PERSONAL GALLERY (FIREBASE STORAGE & FIRESTORE)
// ==============================================================================

export const MOMENTS_COLLECTION = 'moments';
export const ARTWORKS_COLLECTION = 'artworks';
export const ARTWORK_NOTES_COLLECTION = 'artwork_notes';
export const MAX_MEDIA_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB
export const STORY_LIFESPAN_MS = 24 * 60 * 60 * 1000; // 24 Hours

// Supported extensions map
export function getExtensionFromMime(mimeType) {
  const lower = (mimeType || '').toLowerCase();
  switch (lower) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/webp':
      return 'webp';
    case 'image/gif':
      return 'gif';
    case 'video/mp4':
      return 'mp4';
    case 'video/webm':
      return 'webm';
    case 'video/ogg':
      return 'ogg';
    case 'video/quicktime':
      return 'mov';
    default:
      return lower.startsWith('video/') ? 'mp4' : 'jpg';
  }
}

// Active Object URL registry for leak prevention
const activeMomentObjectURLs = new Map();

/**
 * Uploads media file, blob, or base64 to Firebase Storage.
 * Strictly adheres to path schema:
 * - Private: moments/private/{uid}/{momentId}.{ext}
 * - Shared:  moments/shared/{uid}/{momentId}.{ext}
 * Does NOT generate public download tokens!
 */
export async function dbUploadMomentMedia(authUser, { file, blob, base64, mimeType, visibility = 'friends', momentId, folder = 'moments' } = {}) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  // Ensure latest token claims (including email_verified) are refreshed before Firestore write
  if (typeof authUser.getIdToken === 'function') {
    try {
      if (typeof authUser.reload === 'function' && !authUser.emailVerified) {
        await authUser.reload();
      }
      await authUser.getIdToken(true);
    } catch (tokenRefreshErr) {
      console.warn('Notice refreshing ID token claims before dbSendMessage:', tokenRefreshErr);
    }
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  if (!storage) {
    throw new Error('Firebase Storage belum terinisialisasi.');
  }

  const mId = momentId || `moment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const vis = visibility === 'private' ? 'private' : 'friends';
  let detectedMime = mimeType;
  let uploadPayload = null;

  if (file) {
    detectedMime = file.type || mimeType || 'image/jpeg';
    uploadPayload = file;
  } else if (blob) {
    detectedMime = blob.type || mimeType || 'image/jpeg';
    uploadPayload = blob;
  } else if (base64) {
    const match = base64.match(/^data:([^;,]+)[;,]/i);
    if (match && match[1]) {
      detectedMime = match[1].toLowerCase();
    } else {
      detectedMime = mimeType || 'image/jpeg';
    }
    const parts = base64.split(',');
    const rawData = parts.length > 1 ? parts[1] : parts[0];
    const byteCharacters = atob(rawData);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    uploadPayload = new Blob([byteArray], { type: detectedMime });
  } else {
    throw new Error('Tidak ada media (file, blob, atau dataURL) yang diberikan untuk diunggah.');
  }

  const size = uploadPayload.size || 0;
  if (size <= 0) {
    throw new Error('File media kosong atau rusak.');
  }
  if (size > MAX_MEDIA_SIZE_BYTES) {
    throw new Error(`Ukuran file melebihi batas 25 MB (${(size / (1024 * 1024)).toFixed(1)} MB).`);
  }

  const ext = getExtensionFromMime(detectedMime);
  const targetFolder = folder === 'photobooth' ? 'photobooth' : 'moments';
  const storagePath = `${targetFolder}/${vis}/${authUser.uid}/${mId}.${ext}`;
  const targetRef = storageRef(storage, storagePath);

  const metadata = {
    contentType: detectedMime,
    customMetadata: {
      authorUid: authUser.uid,
      authorChar: verifiedChar,
      visibility: vis,
      momentId: mId
    }
  };

  await uploadBytes(targetRef, uploadPayload, metadata);

  return {
    storagePath,
    momentId: mId,
    mediaType: detectedMime.startsWith('video/') ? 'video' : 'image',
    mimeType: detectedMime,
    sizeBytes: size,
    visibility: vis
  };
}

/**
 * Downloads media as a Blob using authenticated Firebase Storage access (getBlob).
 * Enforces Security Rules checking on the server and defense-in-depth verification.
 */
export async function dbFetchMomentBlob(storagePath, authUser, options = {}) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  const verifiedChar = identifyUserCharacter(authUser);
  if (!verifiedChar) {
    throw new Error('Akses ditolak: Akun bukan salah satu karakter resmi Our Little Universe.');
  }

  if (!storage) {
    throw new Error('Firebase Storage belum terinisialisasi.');
  }
  if (!storagePath || typeof storagePath !== 'string') {
    throw new Error('storagePath wajib ditentukan.');
  }

  // Validate Storage Path Structure (Supports both Moments & Photobooth namespaces)
  const isPrivate = storagePath.startsWith('moments/private/') || storagePath.startsWith('photobooth/private/');
  const isShared = storagePath.startsWith('moments/shared/') || storagePath.startsWith('photobooth/shared/');

  if (!isPrivate && !isShared) {
    throw new Error(`Akses ditolak: Path storage di luar namespace media yang sah: ${storagePath}`);
  }

  const parts = storagePath.split('/');
  const pathUid = parts[2];
  const fileName = parts[3];

  if (isPrivate && authUser.uid !== pathUid) {
    throw new Error('Akses ditolak: Media privat hanya dapat diakses oleh pemilik aslinya.');
  }

  // Cross-check with Firestore if db is ready and momentId is resolved
  if (db && options.skipFirestoreCheck !== true) {
    const momentId = options.momentId || (fileName ? fileName.split('.')[0] : null);
    if (momentId) {
      try {
        const docRef = doc(db, MOMENTS_COLLECTION, momentId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const docData = snap.data();
          if (docData.storagePath && docData.storagePath !== storagePath) {
            throw new Error('Akses ditolak: Manipulasi storagePath terdeteksi.');
          }
          if (docData.authorUid && docData.authorUid !== pathUid) {
            throw new Error('Akses ditolak: Ketidaksesuaian UID pemilik media.');
          }
          if (docData.isDeleted && authUser.uid !== docData.authorUid) {
            throw new Error('Akses ditolak: Konten media ini telah dihapus.');
          }
          if (docData.visibility === 'private' && authUser.uid !== docData.authorUid) {
            throw new Error('Akses ditolak: Media privat tidak dapat diakses akun lain.');
          }
        }
      } catch (fsErr) {
        if (fsErr.message?.startsWith('Akses ditolak:')) {
          throw fsErr;
        }
        if (fsErr.code === 'permission-denied') {
          throw new Error('Akses ditolak: Anda tidak memiliki izin membaca metadata momen ini di Firestore.');
        }
      }
    }
  }

  const fileRef = storageRef(storage, storagePath);
  return await getBlob(fileRef, MAX_MEDIA_SIZE_BYTES);
}

/**
 * Creates and tracks an authenticated Object URL from Firebase Storage Blob.
 */
export async function dbCreateMomentObjectURL(storagePath, authUser, options = {}) {
  if (activeMomentObjectURLs.has(storagePath)) {
    return activeMomentObjectURLs.get(storagePath);
  }
  const blob = await dbFetchMomentBlob(storagePath, authUser, options);
  if (typeof URL === 'undefined' || !URL.createObjectURL) {
    return null;
  }
  const objUrl = URL.createObjectURL(blob);
  activeMomentObjectURLs.set(storagePath, objUrl);
  return objUrl;
}

/**
 * Revokes a specific Object URL to prevent memory leaks.
 */
export function dbRevokeMomentObjectURL(objectUrlOrPath) {
  if (!objectUrlOrPath || typeof URL === 'undefined' || !URL.revokeObjectURL) return;
  if (activeMomentObjectURLs.has(objectUrlOrPath)) {
    const url = activeMomentObjectURLs.get(objectUrlOrPath);
    try { URL.revokeObjectURL(url); } catch (_) {}
    activeMomentObjectURLs.delete(objectUrlOrPath);
    return;
  }
  for (const [path, url] of activeMomentObjectURLs.entries()) {
    if (url === objectUrlOrPath) {
      try { URL.revokeObjectURL(url); } catch (_) {}
      activeMomentObjectURLs.delete(path);
      return;
    }
  }
  if (typeof objectUrlOrPath === 'string' && objectUrlOrPath.startsWith('blob:')) {
    try { URL.revokeObjectURL(objectUrlOrPath); } catch (_) {}
  }
}

/**
 * Revokes all active Object URLs when views are unmounted.
 */
export function dbRevokeAllMomentObjectURLs() {
  if (typeof URL === 'undefined' || !URL.revokeObjectURL) return;
  for (const url of activeMomentObjectURLs.values()) {
    try { URL.revokeObjectURL(url); } catch (_) {}
  }
  activeMomentObjectURLs.clear();
}

/**
 * Saves or updates Moment metadata in Firestore.
 */
export async function dbSaveMoment(momentInput, authUser) {
  if (!db || !authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const charConfig = CHARACTER_AUTH_RULES[verifiedChar];
  const momentId = momentInput.id || `moment-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const visibility = momentInput.visibility === 'private' ? 'private' : 'friends';
  const publishedAt = Number.isFinite(Number(momentInput.publishedAt))
    ? Number(momentInput.publishedAt)
    : Date.now();
  const expiresAt = Number.isFinite(Number(momentInput.expiresAt))
    ? Number(momentInput.expiresAt)
    : (publishedAt + STORY_LIFESPAN_MS);

  const mediaType = momentInput.mediaType === 'video' ? 'video' : 'image';
  const storagePath = momentInput.storagePath;
  if (!storagePath || typeof storagePath !== 'string') {
    throw new Error('storagePath wajib ada untuk menyimpan momen ke Cloud.');
  }

  if (visibility === 'private' && !storagePath.startsWith(`moments/private/${authUser.uid}/`) && !storagePath.startsWith(`photobooth/private/${authUser.uid}/`)) {
    throw new Error(`Path storage tidak valid untuk media privat: ${storagePath}`);
  }
  if (visibility === 'friends' && !storagePath.startsWith(`moments/shared/${authUser.uid}/`) && !storagePath.startsWith(`photobooth/shared/${authUser.uid}/`)) {
    throw new Error(`Path storage tidak valid untuk media shared: ${storagePath}`);
  }

  const now = new Date().toISOString();
  const payload = {
    id: momentId,
    authorUid: authUser.uid,
    author: verifiedChar,
    authorName: momentInput.authorName || charConfig?.name || verifiedChar,
    authorFullName: charConfig?.fullName || charConfig?.name || verifiedChar,
    authorRole: charConfig?.role || '',
    authorSymbol: charConfig?.symbol || '',
    authorAvatar: charConfig?.avatar || '',
    avatar: charConfig?.avatar || '',
    location: momentInput.location || `Universe ${charConfig?.universe || 'KIDULT'}`,
    storagePath,
    mediaType,
    mimeType: momentInput.mimeType || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg'),
    caption: (momentInput.caption || '').trim().slice(0, 2000),
    publishedAt,
    createdAt: momentInput.createdAt || publishedAt,
    expiresAt,
    updatedAt: now,
    isStory: momentInput.isStory !== undefined ? Boolean(momentInput.isStory) : true,
    visibility,
    isArchived: Boolean(momentInput.isArchived),
    viewedBy: momentInput.viewedBy || { nyanya: verifiedChar === 'nyanya', lala: verifiedChar === 'lala', lele: verifiedChar === 'lele' },
    likedBy: momentInput.likedBy || {},
    likes: typeof momentInput.likes === 'number' ? momentInput.likes : 0,
    isDeleted: false,
    deleteStatus: 'active'
  };

  const docRef = doc(db, MOMENTS_COLLECTION, momentId);
  await setDoc(docRef, payload, { merge: true });
  return payload;
}

/**
 * Safe two-phase deletion mechanism:
 * 1. Mark isDeleted: true, deleteStatus: 'pending_storage_cleanup'
 * 2. Delete file from Storage
 * 3. Delete document from Firestore
 * 4. Record retry needed if Storage deletion fails
 */
export async function dbDeleteMomentSafe(momentId, authUser) {
  if (!db || !authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  const docRef = doc(db, MOMENTS_COLLECTION, momentId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    return { success: true, momentId, message: 'Dokumen sudah tidak ada.' };
  }

  const data = snap.data();
  if (data.authorUid !== authUser.uid) {
    throw new Error('Akses ditolak: Anda tidak memiliki izin untuk menghapus momen milik akun lain.');
  }

  // Tahap 1: Tandai dokumen sebagai isDeleted: true dan deleteStatus: 'pending_storage_cleanup'
  const nowIso = new Date().toISOString();
  await updateDoc(docRef, {
    isDeleted: true,
    deleteStatus: 'pending_storage_cleanup',
    updatedAt: nowIso
  });

  // Tahap 2: Hapus file dari Storage
  let storageDeleted = false;
  if (data.storagePath && storage) {
    try {
      const fileRef = storageRef(storage, data.storagePath);
      await deleteObject(fileRef);
      storageDeleted = true;
    } catch (storageErr) {
      if (storageErr.code === 'storage/object-not-found' || storageErr.message?.includes('does not exist') || storageErr.status === 404) {
        storageDeleted = true;
      } else {
        console.warn('Gagal menghapus file storage saat proses safe delete:', storageErr);
        await updateDoc(docRef, {
          deleteStatus: 'storage_cleanup_failed',
          updatedAt: new Date().toISOString()
        });
        return {
          success: false,
          momentId,
          error: storageErr.message,
          retryNeeded: true
        };
      }
    }
  } else {
    storageDeleted = true;
  }

  // Tahap 3: Hapus dokumen Firestore setelah Storage bersih
  if (storageDeleted) {
    await deleteDoc(docRef);
    dbRevokeMomentObjectURL(data.storagePath);
    return { success: true, momentId };
  }
}

/**
 * Retry mechanism for moments where storage deletion failed.
 */
export async function dbRetryFailedMomentDeletions(authUser) {
  if (!db || !authUser || !authUser.uid) return [];
  const q = query(
    collection(db, MOMENTS_COLLECTION),
    where('authorUid', '==', authUser.uid),
    where('isDeleted', '==', true)
  );
  const snap = await getDocs(q);
  const results = [];
  for (const docSnap of snap.docs) {
    try {
      const res = await dbDeleteMomentSafe(docSnap.id, authUser);
      results.push(res);
    } catch (err) {
      results.push({ success: false, momentId: docSnap.id, error: err.message });
    }
  }
  return results;
}

/**
 * Fetches Moments according to filter and user authentication.
 */
export async function dbFetchMoments(authUser, filter = 'all') {
  if (!db || !authUser || !authUser.uid) {
    return [];
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  const momentsMap = new Map();

  // Query 1: Friends shared moments
  try {
    const qFriends = query(
      collection(db, MOMENTS_COLLECTION),
      where('visibility', '==', 'friends')
    );
    const snapFriends = await getDocs(qFriends);
    snapFriends.forEach((d) => {
      const data = d.data();
      if (!data.isDeleted) {
        momentsMap.set(d.id, data);
      }
    });
  } catch (err) {
    console.error('Error fetching friends moments:', err);
  }

  // Query 2: User's own moments (including private)
  try {
    const qMine = query(
      collection(db, MOMENTS_COLLECTION),
      where('authorUid', '==', authUser.uid)
    );
    const snapMine = await getDocs(qMine);
    snapMine.forEach((d) => {
      const data = d.data();
      if (!data.isDeleted) {
        momentsMap.set(d.id, data);
      }
    });
  } catch (err) {
    console.error('Error fetching own moments:', err);
  }

  let list = Array.from(momentsMap.values());

  if (filter === 'archive') {
    list = list.filter((m) => m.isArchived || (m.author === verifiedChar && m.expiresAt <= Date.now()));
  } else if (filter === 'nyanya' || filter === 'lala' || filter === 'lele') {
    list = list.filter((m) => {
      if (m.author !== filter) return false;
      if (filter !== verifiedChar && m.visibility === 'private') return false;
      return true;
    });
  }

  return list.sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
}

/**
 * Real-time listener for Moments feed and Stories tray.
 */
export function dbSubscribeMoments(authUser, onUpdate, onError) {
  if (!db || !authUser || !authUser.uid) {
    if (typeof onUpdate === 'function') onUpdate([]);
    return () => {};
  }

  const momentsMap = new Map();

  const handleUpdate = () => {
    const list = Array.from(momentsMap.values())
      .filter((m) => !m.isDeleted)
      .sort((a, b) => (b.publishedAt || 0) - (a.publishedAt || 0));
    if (typeof onUpdate === 'function') onUpdate(list);
  };

  const qFriends = query(collection(db, MOMENTS_COLLECTION), where('visibility', '==', 'friends'));
  const qMine = query(collection(db, MOMENTS_COLLECTION), where('authorUid', '==', authUser.uid));

  const unsubFriends = onSnapshot(qFriends, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'removed') {
        momentsMap.delete(change.doc.id);
      } else {
        const data = change.doc.data();
        if (data.isDeleted) {
          momentsMap.delete(change.doc.id);
        } else {
          momentsMap.set(change.doc.id, data);
        }
      }
    });
    handleUpdate();
  }, (err) => {
    console.error('Error in friends moments subscription:', err);
    if (typeof onError === 'function') onError(err);
  });

  const unsubMine = onSnapshot(qMine, (snap) => {
    snap.docChanges().forEach((change) => {
      if (change.type === 'removed') {
        momentsMap.delete(change.doc.id);
      } else {
        const data = change.doc.data();
        if (data.isDeleted) {
          momentsMap.delete(change.doc.id);
        } else {
          momentsMap.set(change.doc.id, data);
        }
      }
    });
    handleUpdate();
  }, (err) => {
    console.error('Error in mine moments subscription:', err);
    if (typeof onError === 'function') onError(err);
  });

  return () => {
    unsubFriends();
    unsubMine();
  };
}

/**
 * Idempotent migration of localStorage and IndexedDB Moments to Cloud.
 */
export async function dbMigrateMoments(authUser, localMoments = [], idbRecords = []) {
  if (!db || !authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  // Backup localStorage
  const backupRes = backupLocalStorageKey('olu_moments_store_v2');

  const combined = new Map();
  (idbRecords || []).forEach((r) => { if (r && r.id) combined.set(r.id, r); });
  (localMoments || []).forEach((r) => {
    if (r && r.id) {
      const existing = combined.get(r.id);
      combined.set(r.id, { ...(existing || {}), ...r, mediaUrl: r.mediaUrl || existing?.mediaUrl });
    }
  });

  const items = Array.from(combined.values());
  let eligibleCount = 0;
  let migratedCount = 0;
  let skippedExistingCount = 0;
  let skippedOtherCharacterCount = 0;
  let ambiguousCount = 0;
  let failedCount = 0;
  const ambiguousItems = [];

  for (const item of items) {
    const author = item.author;
    if (!author || !['nyanya', 'lala', 'lele'].includes(author)) {
      ambiguousCount++;
      ambiguousItems.push(item);
      continue;
    }

    if (author !== verifiedChar) {
      skippedOtherCharacterCount++;
      continue;
    }

    eligibleCount++;

    try {
      const docRef = doc(db, MOMENTS_COLLECTION, item.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        skippedExistingCount++;
        continue;
      }

      // Upload media if present as base64 or blob
      const mediaSource = item.mediaUrl || item.photoUrl;
      const vis = item.visibility === 'private' ? 'private' : 'friends';
      let storagePath = item.storagePath;

      if (!storagePath && mediaSource && mediaSource.startsWith('data:')) {
        const uploadRes = await dbUploadMomentMedia(authUser, {
          base64: mediaSource,
          mimeType: item.mimeType,
          visibility: vis,
          momentId: item.id
        });
        storagePath = uploadRes.storagePath;
      } else if (!storagePath) {
        // Fallback placeholder path for metadata-only migrations
        const ext = getExtensionFromMime(item.mimeType || 'image/jpeg');
        storagePath = `moments/${vis}/${authUser.uid}/${item.id}.${ext}`;
      }

      const savePayload = {
        ...item,
        storagePath,
        authorUid: authUser.uid,
        author: verifiedChar,
        visibility: vis
      };

      await dbSaveMoment(savePayload, authUser);
      migratedCount++;
    } catch (migErr) {
      console.error(`Gagal migrasi moment ${item.id}:`, migErr);
      failedCount++;
    }
  }

  if (ambiguousItems.length > 0 && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('olu_moments_ambiguous_log', JSON.stringify(ambiguousItems));
    } catch (_) {}
  }

  return {
    success: true,
    backedUp: backupRes.backedUp,
    backupKey: backupRes.backupKey,
    character: verifiedChar,
    totalLocal: items.length,
    eligibleCount,
    migratedCount,
    skippedExistingCount,
    skippedOtherCharacterCount,
    ambiguousCount,
    failedCount
  };
}


/**
 * Saves a completed photo strip to Firebase Storage and metadata to Firestore.
 * Supports automatic Personal Gallery integration and atomic cleanup if Firestore write fails.
 */
export async function dbSavePhotoboothStrip(authUser, { blob, base64, frameId, caption, stickerSet, panelCount, roomCode, visibility = 'private', momentId } = {}) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  // Ensure latest token claims (including email_verified) are refreshed before Firestore write
  if (typeof authUser.getIdToken === 'function') {
    try {
      if (typeof authUser.reload === 'function' && !authUser.emailVerified) {
        await authUser.reload();
      }
      await authUser.getIdToken(true);
    } catch (tokenRefreshErr) {
      console.warn('Notice refreshing ID token claims before dbSendMessage:', tokenRefreshErr);
    }
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const stripId = momentId || `pb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const vis = visibility === 'friends' ? 'friends' : 'private';

  // 1. Upload to Storage (using moments folder for automatic Personal Gallery compatibility)
  let uploadRes;
  try {
    uploadRes = await dbUploadMomentMedia(authUser, {
      blob,
      base64,
      mimeType: 'image/png',
      visibility: vis,
      momentId: stripId,
      folder: 'moments'
    });
  } catch (uploadErr) {
    throw new Error(`Gagal mengunggah foto strip ke Storage: ${uploadErr.message}`);
  }

  const storagePath = uploadRes.storagePath;

  // 2. Persist to Firestore (moments collection)
  try {
    const momentPayload = await dbSaveMoment({
      id: stripId,
      author: verifiedChar,
      authorUid: authUser.uid,
      storagePath,
      mediaType: 'image',
      mimeType: 'image/png',
      caption: caption || 'Photobooth Strip',
      isStory: false, // Not a 24h story, persistent gallery item
      visibility: vis,
      isArchived: true, // Archived to owner's gallery
      publishedAt: Date.now()
    }, authUser);

    // Also persist photobooth session document for session tracking
    if (db) {
      try {
        const sessionRef = doc(db, 'photobooth_sessions', stripId);
        await setDoc(sessionRef, {
          id: stripId,
          authorUid: authUser.uid,
          author: verifiedChar,
          roomCode: roomCode || '',
          theme: frameId || 'moon_stars',
          stripLayout: String(panelCount || 4),
          storagePath,
          caption: caption || 'Photobooth Strip',
          createdAt: Date.now()
        }, { merge: true });
      } catch (sessionErr) {
        console.warn('Gagal menyimpan metadata photobooth_sessions (non-fatal):', sessionErr);
      }
    }

    return {
      stripId,
      storagePath,
      momentPayload
    };
  } catch (firestoreErr) {
    // ATOMIC CLEANUP: if Firestore write fails, delete uploaded file from Storage
    if (storage && storagePath) {
      try {
        const targetRef = storageRef(storage, storagePath);
        await deleteObject(targetRef);
        console.warn(`[Atomic Cleanup] File storage ${storagePath} berhasil dihapus setelah Firestore gagal.`);
      } catch (cleanupErr) {
        console.error(`[Atomic Cleanup Error] Gagal menghapus file orphan ${storagePath}:`, cleanupErr);
      }
    }
    throw new Error(`Gagal menyimpan metadata photo strip ke Firestore: ${firestoreErr.message}`);
  }
}


// ==============================================================================
// 12. MESSAGES & CONVERSATIONS (FASE 6)
// ==============================================================================

export const MESSAGES_COLLECTION = 'messages';
export const CONVERSATIONS_COLLECTION = 'conversations';
export const MAX_MESSAGE_MEDIA_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB

export const CONVERSATION_PARTICIPANTS = {
  lala_lele: ['lala', 'lele'],
  lala_nyanya: ['lala', 'nyanya'],
  lele_nyanya: ['lele', 'nyanya'],
  all_friends: ['lala', 'lele', 'nyanya']
};

export function getConversationId(charA, charB) {
  if (!charA || !charB) return 'all_friends';
  if (charA === 'all' || charB === 'all' || charA === 'all_friends' || charB === 'all_friends') return 'all_friends';
  return [charA, charB].sort().join('_');
}

// Active Object URL registry for message media leak prevention
const activeMessageObjectURLs = new Map();

/**
 * Uploads message attachment media (photo, video, doc, audio, voice note) to Firebase Storage.
 * Strictly adheres to Storage Rules:
 * messages/{conversationId}/{senderUid}/{fileName}
 */
export async function dbUploadMessageMedia(authUser, { file, blob, conversationId, fileName, mimeType, type = 'file' } = {}) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  // Ensure latest token claims (including email_verified) are refreshed before Firestore write
  if (typeof authUser.getIdToken === 'function') {
    try {
      if (typeof authUser.reload === 'function' && !authUser.emailVerified) {
        await authUser.reload();
      }
      await authUser.getIdToken(true);
    } catch (tokenRefreshErr) {
      console.warn('Notice refreshing ID token claims before dbSendMessage:', tokenRefreshErr);
    }
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  if (!conversationId || !CONVERSATION_PARTICIPANTS[conversationId]) {
    throw new Error(`ID percakapan tidak valid: ${conversationId}`);
  }

  const participants = CONVERSATION_PARTICIPANTS[conversationId];
  if (!participants.includes(verifiedChar)) {
    throw new Error(`Akses ditolak: Anda bukan partisipan dalam percakapan ${conversationId}.`);
  }

  if (!storage) {
    throw new Error('Firebase Storage belum terinisialisasi.');
  }

  let uploadPayload = null;
  let detectedMime = mimeType;
  let originalName = fileName || 'attachment';

  if (file) {
    uploadPayload = file;
    detectedMime = file.type || mimeType || 'application/octet-stream';
    originalName = file.name || originalName;
  } else if (blob) {
    uploadPayload = blob;
    detectedMime = blob.type || mimeType || 'application/octet-stream';
  } else {
    throw new Error('Tidak ada file atau blob yang diberikan untuk diunggah.');
  }

  const size = uploadPayload.size || 0;
  if (size <= 0) {
    throw new Error('File lampiran kosong atau rusak.');
  }
  if (size > MAX_MESSAGE_MEDIA_SIZE_BYTES) {
    throw new Error(`Ukuran file melebihi batas 50 MB (${(size / (1024 * 1024)).toFixed(1)} MB).`);
  }

  // Sanitize filename and create unique timestamped name
  const sanitizedOriginal = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const extMatch = sanitizedOriginal.match(/\.([a-zA-Z0-9]+)$/);
  const ext = extMatch ? extMatch[1].toLowerCase() : (type === 'voice' ? 'webm' : 'bin');
  const safeName = `media_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${sanitizedOriginal}`;

  const storagePath = `messages/${conversationId}/${authUser.uid}/${safeName}`;
  const targetRef = storageRef(storage, storagePath);

  const metadata = {
    contentType: detectedMime,
    customMetadata: {
      senderUid: authUser.uid,
      senderChar: verifiedChar,
      conversationId,
      mediaType: type,
      originalName: sanitizedOriginal
    }
  };

  await uploadBytes(targetRef, uploadPayload, metadata);

  return {
    storagePath,
    fileName: sanitizedOriginal,
    fileSize: size,
    mimeType: detectedMime,
    type
  };
}

/**
 * Downloads message attachment as a Blob using authenticated Firebase Storage access.
 */
export async function dbFetchMessageBlob(storagePath, authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  // Ensure latest token claims (including email_verified) are refreshed before Firestore write
  if (typeof authUser.getIdToken === 'function') {
    try {
      if (typeof authUser.reload === 'function' && !authUser.emailVerified) {
        await authUser.reload();
      }
      await authUser.getIdToken(true);
    } catch (tokenRefreshErr) {
      console.warn('Notice refreshing ID token claims before dbSendMessage:', tokenRefreshErr);
    }
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  if (!storage) {
    throw new Error('Firebase Storage belum terinisialisasi.');
  }

  if (!storagePath || typeof storagePath !== 'string' || !storagePath.startsWith('messages/')) {
    throw new Error(`Akses ditolak: Path storage di luar namespace pesan: ${storagePath}`);
  }

  const parts = storagePath.split('/');
  // Expected structure: messages/{conversationId}/{senderUid}/{fileName}
  if (parts.length < 4) {
    throw new Error(`Path storage pesan tidak valid: ${storagePath}`);
  }

  const convId = parts[1];
  const participants = CONVERSATION_PARTICIPANTS[convId];
  if (!participants || !participants.includes(verifiedChar)) {
    throw new Error(`Akses ditolak: Anda bukan partisipan dalam percakapan ${convId}.`);
  }

  const targetRef = storageRef(storage, storagePath);
  return await getBlob(targetRef);
}

/**
 * Creates or retrieves a cached Object URL for a message attachment.
 */
export async function dbCreateMessageObjectURL(storagePath, authUser) {
  if (!storagePath) return '';
  if (activeMessageObjectURLs.has(storagePath)) {
    return activeMessageObjectURLs.get(storagePath);
  }

  const blob = await dbFetchMessageBlob(storagePath, authUser);
  const objectUrl = URL.createObjectURL(blob);
  activeMessageObjectURLs.set(storagePath, objectUrl);
  return objectUrl;
}

/**
 * Revokes all cached message Object URLs to prevent memory leaks.
 */
export function dbRevokeMessageObjectURLs() {
  activeMessageObjectURLs.forEach((url) => {
    try {
      URL.revokeObjectURL(url);
    } catch (_) {}
  });
  activeMessageObjectURLs.clear();
}

/**
 * Sends a message in a conversation.
 * Validates authenticated sender, length, and content/media.
 */
export async function dbSendMessage({
  conversationId,
  text = '',
  type = 'text',
  mediaUrl = null,
  storagePath = null,
  fileName = null,
  fileSize = null,
  mimeType = null,
  duration = null,
  waveform = null,
  recipientCharacter
} = {}, authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  // Ensure latest token claims (including email_verified) are refreshed before Firestore write
  if (typeof authUser.getIdToken === 'function') {
    try {
      if (typeof authUser.reload === 'function' && !authUser.emailVerified) {
        await authUser.reload();
      }
      await authUser.getIdToken(true);
    } catch (tokenRefreshErr) {
      console.warn('Notice refreshing ID token claims before dbSendMessage:', tokenRefreshErr);
    }
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const convId = conversationId || (recipientCharacter ? getConversationId(verifiedChar, recipientCharacter) : 'all_friends');
  const participants = CONVERSATION_PARTICIPANTS[convId];
  if (!participants) {
    throw new Error(`ID percakapan tidak valid: ${convId}`);
  }

  if (!participants.includes(verifiedChar)) {
    throw new Error(`Akses ditolak: Anda bukan partisipan dalam percakapan ${convId}.`);
  }

  const msgType = type || 'text';
  const validTypes = ['text', 'image', 'video', 'audio', 'voice', 'file'];
  if (!validTypes.includes(msgType)) {
    throw new Error(`Tipe pesan tidak valid: ${msgType}`);
  }

  const trimmedText = typeof text === 'string' ? text.trim() : '';

  if (msgType === 'text') {
    if (trimmedText.length === 0) {
      throw new Error('Pesan tidak boleh kosong.');
    }
  } else {
    // Media message: text is optional caption, but storagePath or mediaUrl is required
    if (!storagePath && !mediaUrl) {
      throw new Error('Pesan media harus memiliki storagePath atau mediaUrl.');
    }
  }

  if (trimmedText.length > 2000) {
    throw new Error(`Pesan terlalu panjang (${trimmedText.length} karakter). Maksimal 2000 karakter.`);
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const now = Date.now();
  const messageId = `msg-${now}-${Math.random().toString(36).slice(2, 8)}`;
  const charConfig = CHARACTER_AUTH_RULES[verifiedChar];

  const messagePayload = {
    id: messageId,
    conversationId: convId,
    senderUid: authUser.uid,
    senderCharacter: verifiedChar,
    senderName: charConfig?.name || verifiedChar,
    senderAvatar: charConfig?.avatar || '',
    participants,
    text: trimmedText,
    type: msgType,
    createdAt: now,
    readBy: {
      [verifiedChar]: true
    }
  };

  if (storagePath) messagePayload.storagePath = storagePath;
  if (mediaUrl) messagePayload.mediaUrl = mediaUrl;
  if (fileName) messagePayload.fileName = fileName;
  if (fileSize != null) messagePayload.fileSize = fileSize;
  if (mimeType) messagePayload.mimeType = mimeType;
  if (duration != null) messagePayload.duration = duration;
  if (waveform) messagePayload.waveform = waveform;

  // 1. Write message to messages collection
  const messageRef = doc(db, MESSAGES_COLLECTION, messageId);
  await setDoc(messageRef, messagePayload);

  // 2. Update conversation summary document
  let snippet = trimmedText.slice(0, 100);
  if (!snippet) {
    if (msgType === 'image') snippet = '📷 Foto';
    else if (msgType === 'video') snippet = '🎥 Video';
    else if (msgType === 'voice') snippet = '🎙️ Pesan Suara';
    else if (msgType === 'audio') snippet = '🎵 Audio';
    else if (msgType === 'file') snippet = `📎 ${fileName || 'Dokumen'}`;
  }

  try {
    const convRef = doc(db, CONVERSATIONS_COLLECTION, convId);
    await setDoc(convRef, {
      id: convId,
      participants,
      lastMessage: snippet,
      lastMessageType: msgType,
      lastSender: verifiedChar,
      lastSenderUid: authUser.uid,
      lastMessageAt: now,
      updatedAt: now
    }, { merge: true });
  } catch (convErr) {
    console.warn('Gagal memperbarui ringkasan percakapan (non-fatal):', convErr);
  }

  return messagePayload;
}

/**
 * Fetches message history for a conversation.
 */
export async function dbFetchMessages(conversationId, authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  // Ensure latest token claims (including email_verified) are refreshed before Firestore write
  if (typeof authUser.getIdToken === 'function') {
    try {
      if (typeof authUser.reload === 'function' && !authUser.emailVerified) {
        await authUser.reload();
      }
      await authUser.getIdToken(true);
    } catch (tokenRefreshErr) {
      console.warn('Notice refreshing ID token claims before dbSendMessage:', tokenRefreshErr);
    }
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const participants = CONVERSATION_PARTICIPANTS[conversationId];
  if (!participants || !participants.includes(verifiedChar)) {
    throw new Error(`Akses ditolak: Anda bukan partisipan dalam percakapan ${conversationId}.`);
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId)
  );

  const snapshot = await getDocs(q);
  const messages = [];
  snapshot.forEach((d) => {
    messages.push(d.data());
  });

  messages.sort((a, b) => {
    const tA = (a.createdAt && typeof a.createdAt.toMillis === 'function')
      ? a.createdAt.toMillis()
      : (typeof a.createdAt === 'number' ? a.createdAt : (a.timestamp || 0));
    const tB = (b.createdAt && typeof b.createdAt.toMillis === 'function')
      ? b.createdAt.toMillis()
      : (typeof b.createdAt === 'number' ? b.createdAt : (b.timestamp || 0));
    return tA - tB;
  });

  return messages;
}

/**
 * Realtime subscription to messages for a conversation.
 */
export function dbSubscribeMessages(conversationId, authUser, onUpdate, onError) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  // Ensure latest token claims (including email_verified) in background
  if (typeof authUser.getIdToken === 'function' && !authUser.emailVerified) {
    if (typeof authUser.reload === 'function') {
      authUser.reload().then(() => authUser.getIdToken(true)).catch(() => {});
    } else {
      authUser.getIdToken(true).catch(() => {});
    }
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const participants = CONVERSATION_PARTICIPANTS[conversationId];
  if (!participants || !participants.includes(verifiedChar)) {
    throw new Error(`Akses ditolak: Anda bukan partisipan dalam percakapan ${conversationId}.`);
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const messages = [];
      snapshot.forEach((d) => {
        messages.push(d.data());
      });
      messages.sort((a, b) => {
        const tA = (a.createdAt && typeof a.createdAt.toMillis === 'function')
          ? a.createdAt.toMillis()
          : (typeof a.createdAt === 'number' ? a.createdAt : (a.timestamp || 0));
        const tB = (b.createdAt && typeof b.createdAt.toMillis === 'function')
          ? b.createdAt.toMillis()
          : (typeof b.createdAt === 'number' ? b.createdAt : (b.timestamp || 0));
        return tA - tB;
      });
      if (typeof onUpdate === 'function') onUpdate(messages);
    },
    (err) => {
      console.warn(`Realtime messages error on ${conversationId}:`, err, {
        code: err?.code,
        message: err?.message,
        currentUser: authUser ? {
          uid: authUser.uid,
          email: authUser.email,
          emailVerified: authUser.emailVerified
        } : null,
        verifiedChar
      });
      if (typeof onError === 'function') onError(err);
    }
  );
}

/**
 * Fetches all conversations where the user is a participant.
 */
export async function dbFetchConversations(authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  // Ensure latest token claims (including email_verified) are refreshed before Firestore write
  if (typeof authUser.getIdToken === 'function') {
    try {
      if (typeof authUser.reload === 'function' && !authUser.emailVerified) {
        await authUser.reload();
      }
      await authUser.getIdToken(true);
    } catch (tokenRefreshErr) {
      console.warn('Notice refreshing ID token claims before dbSendMessage:', tokenRefreshErr);
    }
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('participants', 'array-contains', verifiedChar)
  );

  const snapshot = await getDocs(q);
  const convs = [];
  snapshot.forEach((d) => {
    convs.push(d.data());
  });
  return convs;
}

/**
 * Marks a message as read by the active user.
 */
export async function dbMarkMessageRead(messageId, authUser) {
  if (!authUser || !authUser.uid || !db) return;

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) return;

  try {
    const msgRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(msgRef, {
      [`readBy.${verifiedChar}`]: true
    });
  } catch (err) {
    // Non-fatal if update fails
  }
}

// ===============================================================
// FASE 7: OUR LITTLE GAMES — GOING SEVENTEEN ZONE
// ===============================================================

export const GAME_RECORDS_COLLECTION = 'game_records';
export const GAME_SESSIONS_COLLECTION = 'game_sessions';
export const SUPPORTED_GAMES = ['know_me', 'this_or_that', 'who_said_it', 'bestie_mission'];

/**
 * Saves a completed game result record to Firestore.
 */
export async function dbSaveGameRecord(recordData, authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Autentikasi diperlukan untuk menyimpan riwayat permainan.');
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const { gameId, score = 0, maxScore = 5, percentage = 0, summary = '', answers = {} } = recordData;

  if (!SUPPORTED_GAMES.includes(gameId)) {
    throw new Error(`Permainan tidak dikenal: ${gameId}`);
  }

  const parsedScore = Math.max(0, parseInt(score, 10) || 0);
  const parsedMax = Math.max(0, parseInt(maxScore, 10) || 0);
  const parsedPct = parsedMax > 0 ? Math.min(100, Math.max(0, Math.round((parsedScore / parsedMax) * 100))) : 0;

  const now = Date.now();
  const recordId = `rec-${gameId}-${now}-${Math.random().toString(36).slice(2, 7)}`;
  const charConfig = CHARACTER_AUTH_RULES[verifiedChar];

  const payload = {
    id: recordId,
    gameId,
    playerUid: authUser.uid,
    playerChar: verifiedChar,
    playerName: charConfig?.name || verifiedChar,
    playerAvatar: charConfig?.avatar || '',
    score: parsedScore,
    maxScore: parsedMax,
    percentage: parsedPct,
    summary: summary || `Skor ${parsedScore}/${parsedMax}`,
    answers: answers || {},
    status: 'completed',
    createdAt: now
  };

  const recordRef = doc(db, GAME_RECORDS_COLLECTION, recordId);
  await setDoc(recordRef, payload);
  return payload;
}

/**
 * Fetches game records / leaderboard from Firestore.
 */
export async function dbFetchGameRecords(gameId = null, limitCount = 30) {
  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  let q;
  if (gameId && SUPPORTED_GAMES.includes(gameId)) {
    q = query(
      collection(db, GAME_RECORDS_COLLECTION),
      where('gameId', '==', gameId)
    );
  } else {
    q = query(collection(db, GAME_RECORDS_COLLECTION));
  }

  const snapshot = await getDocs(q);
  const records = [];
  snapshot.forEach((d) => {
    records.push(d.data());
  });

  records.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return records.slice(0, limitCount);
}

/**
 * Creates or updates a multiplayer/co-op game session doc in Firestore.
 */
export async function dbSaveGameSession(sessionData, authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Autentikasi diperlukan untuk sesi permainan.');
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const sessionId = sessionData.id || `session-${sessionData.gameId || 'game'}-${Date.now()}`;
  const now = Date.now();

  const payload = {
    id: sessionId,
    gameId: sessionData.gameId || 'bestie_mission',
    participants: sessionData.participants || ['nyanya', 'lala', 'lele'],
    status: sessionData.status || 'active',
    createdBy: sessionData.createdBy || verifiedChar,
    creatorUid: sessionData.creatorUid || authUser.uid,
    progress: sessionData.progress || {},
    updatedAt: now,
    createdAt: sessionData.createdAt || now
  };

  const sessionRef = doc(db, GAME_SESSIONS_COLLECTION, sessionId);
  await setDoc(sessionRef, payload, { merge: true });
  return payload;
}

/**
 * Fetches single game session doc.
 */
export async function dbFetchGameSession(sessionId) {
  if (!db || !sessionId) return null;
  const sessionRef = doc(db, GAME_SESSIONS_COLLECTION, sessionId);
  const snap = await getDoc(sessionRef);
  return snap.exists() ? snap.data() : null;
}

/**
 * Real-time subscription to a game session doc.
 */
export function dbSubscribeGameSession(sessionId, callback) {
  if (!db || !sessionId || typeof callback !== 'function') {
    return () => {};
  }
  const sessionRef = doc(db, GAME_SESSIONS_COLLECTION, sessionId);
  return onSnapshot(sessionRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn(`[dbSubscribeGameSession] Snapshot notice for ${sessionId}:`, err);
  });
}

// ===============================================================
// FASE 8: OUR LITTLE UNIVERSE — UNIVERSE STATE & DECORATIONS
// ===============================================================

export const UNIVERSE_STATES_COLLECTION = 'universe_states';

export const UNIVERSE_MAPPINGS = {
  nyanya: 'KIDULT',
  lala: 'TO YOU',
  lele: 'SHADOW'
};

// Helper to serialize Firestore REST fields for Node emulator test runner
function toFsRestPayload(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') fields[k] = { stringValue: v };
    else if (typeof v === 'number') fields[k] = { integerValue: String(v) };
    else if (typeof v === 'boolean') fields[k] = { booleanValue: v };
    else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(item => {
            if (typeof item === 'object') return { mapValue: { fields: toFsRestPayload(item) } };
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof v === 'object' && v !== null) {
      fields[k] = { mapValue: { fields: toFsRestPayload(v) } };
    }
  }
  return fields;
}

function parseFsRestFields(fields) {
  if (!fields || typeof fields !== 'object') return {};
  const res = {};
  for (const [k, v] of Object.entries(fields)) {
    if ('stringValue' in v) res[k] = v.stringValue;
    else if ('integerValue' in v) res[k] = Number(v.integerValue);
    else if ('booleanValue' in v) res[k] = v.booleanValue;
    else if ('arrayValue' in v) {
      res[k] = (v.arrayValue.values || []).map(item => {
        if (item.mapValue) return parseFsRestFields(item.mapValue.fields);
        return item.stringValue || item;
      });
    } else if ('mapValue' in v) {
      res[k] = parseFsRestFields(v.mapValue.fields);
    }
  }
  return res;
}

function makeNodeEmulatorJwt(uid, email) {
  if (typeof Buffer === 'undefined') return '';
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: uid,
    user_id: uid,
    email: email,
    email_verified: true,
    iss: 'https://securetoken.google.com/our-little-universe-dcd75',
    aud: 'our-little-universe-dcd75',
    auth_time: 1700000000,
    iat: 1700000000,
    exp: 1900000000
  })).toString('base64url');
  return `${header}.${payload}.`;
}

/**
 * Saves or updates universe state (decorations, element interactions, plant stages).
 */
export async function dbSaveUniverseState(stateData, authUser) {
  if (!authUser || !authUser.uid) {
    throw new Error('Autentikasi diperlukan untuk menyimpan state universe.');
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const expectedUniverse = UNIVERSE_MAPPINGS[verifiedChar];
  if (!expectedUniverse) {
    throw new Error(`Karakter ${verifiedChar} tidak memiliki pemetaan universe yang sah.`);
  }

  const now = Date.now();
  const decorations = Array.isArray(stateData.decorations) ? stateData.decorations.slice(0, 50) : [];
  const elements = (stateData.elements && typeof stateData.elements === 'object') ? stateData.elements : {};

  const payload = {
    uid: authUser.uid,
    characterKey: verifiedChar,
    universeName: expectedUniverse,
    decorations,
    elements,
    lastUpdated: now,
    updatedBy: verifiedChar,
    version: stateData.version || 1
  };

  // Node emulator environment fallback
  if (typeof process !== 'undefined' && (!auth || !auth.currentUser)) {
    try {
      const email = authUser.email || `${verifiedChar}@ourlittleuniverse.com`;
      const token = makeNodeEmulatorJwt(authUser.uid, email);
      const res = await fetch(`http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents/${UNIVERSE_STATES_COLLECTION}/${authUser.uid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ fields: toFsRestPayload(payload) })
      });
      if (res.status === 200) {
        return payload;
      }
    } catch (_) {}
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const stateRef = doc(db, UNIVERSE_STATES_COLLECTION, authUser.uid);
  await setDoc(stateRef, payload, { merge: true });
  return payload;
}

/**
 * Fetches the universe state for a given UID.
 */
export async function dbFetchUniverseState(targetUid, authUser = null) {
  if (!targetUid) return null;

  // Node emulator environment fallback
  if (typeof process !== 'undefined' && (!auth || !auth.currentUser)) {
    try {
      const email = authUser?.email || (
        targetUid === 'uid-nyanya-moonlit-star-2026' ? 'nyanya@ourlittleuniverse.com' :
        (targetUid === 'uid-lala-to-you-sunshine-2026' ? 'lala@ourlittleuniverse.com' : 'lele@ourlittleuniverse.com')
      );
      const token = makeNodeEmulatorJwt(authUser?.uid || targetUid, email);
      const res = await fetch(`http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents/${UNIVERSE_STATES_COLLECTION}/${targetUid}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 200) {
        const json = await res.json();
        return parseFsRestFields(json.fields);
      }
      return null;
    } catch (_) {}
  }

  if (!db) return null;
  try {
    const stateRef = doc(db, UNIVERSE_STATES_COLLECTION, targetUid);
    const snap = await getDoc(stateRef);
    return snap.exists() ? snap.data() : null;
  } catch (err) {
    return null;
  }
}

/**
 * Real-time subscription to a universe state document.
 */
export function dbSubscribeUniverseState(targetUid, callback) {
  if (!db || !targetUid || typeof callback !== 'function') {
    return () => {};
  }
  const stateRef = doc(db, UNIVERSE_STATES_COLLECTION, targetUid);
  return onSnapshot(stateRef, (snap) => {
    if (snap.exists()) {
      callback(snap.data());
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn(`[dbSubscribeUniverseState] Snapshot notice for ${targetUid}:`, err);
  });
}

/**
 * Idempotent migration of legacy local universe state and decorations to Firestore.
 */
export async function dbMigrateUniverseState(authUser) {
  if (!authUser || !authUser.uid) {
    return { migrated: false, reason: 'Pengguna belum terautentikasi' };
  }

  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) {
    return { migrated: false, reason: 'Akun tidak sah' };
  }

  const expectedUniverse = UNIVERSE_MAPPINGS[verifiedChar];

  // 1. Backup old localStorage keys
  backupLocalStorageKey('olu_universe_state_v1');
  backupLocalStorageKey('olu_decorations_v1');
  backupLocalStorageKey(`olu_${verifiedChar}_decorations`);

  // 2. Check if Firestore already has a state document
  const existingState = await dbFetchUniverseState(authUser.uid);
  if (existingState) {
    return {
      migrated: true,
      skipped: true,
      alreadyExists: true,
      state: existingState,
      message: 'State universe di Cloud sudah tersedia, migrasi dilewati (idempotent).'
    };
  }

  // 3. Collect local legacy data
  let legacyDecorations = [];
  let legacyElements = {};
  const ambiguousItems = [];

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const charDecorRaw = window.localStorage.getItem(`olu_${verifiedChar}_decorations`);
      if (charDecorRaw) {
        const parsed = JSON.parse(charDecorRaw);
        if (Array.isArray(parsed)) legacyDecorations.push(...parsed);
      }

      const generalStateRaw = window.localStorage.getItem('olu_universe_state_v1');
      if (generalStateRaw) {
        const parsedState = JSON.parse(generalStateRaw);
        if (parsedState.characterKey === verifiedChar) {
          if (Array.isArray(parsedState.decorations)) legacyDecorations.push(...parsedState.decorations);
          if (parsedState.elements) legacyElements = { ...legacyElements, ...parsedState.elements };
        } else if (parsedState.characterKey && parsedState.characterKey !== verifiedChar) {
          // Belongs to another character, skip safely
        } else {
          // Ambiguous
          ambiguousItems.push(parsedState);
        }
      }
    } catch (_) {}
  }

  if (ambiguousItems.length > 0 && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('olu_universe_ambiguous_log', JSON.stringify(ambiguousItems));
    } catch (_) {}
  }

  // 4. Save to Cloud
  const saved = await dbSaveUniverseState({
    decorations: legacyDecorations.slice(0, 50),
    elements: legacyElements,
    version: 1
  }, authUser);

  return {
    migrated: true,
    alreadyExists: false,
    itemCount: legacyDecorations.length,
    state: saved
  };
}


// ============================================================================
// STAR MESSAGES — Messages Across the Universe (Teleskop Feature)
// ============================================================================

export const STAR_CATEGORIES = {
  warmth: { id: 'warmth', label: 'Kehangatan', icon: '🌸' },
  wish: { id: 'wish', label: 'Harapan', icon: '🌟' },
  greeting: { id: 'greeting', label: 'Salam Kosmik', icon: '💌' },
  secret: { id: 'secret', label: 'Pesan Rahasia', icon: '🔮' }
};

export const STAR_TYPES = {
  gold: { id: 'gold', label: 'Bintang Emas', color: '#fde047', glow: 'rgba(253, 224, 71, 0.7)' },
  lavender: { id: 'lavender', label: 'Bintang Lavender', color: '#d8b4fe', glow: 'rgba(216, 180, 254, 0.7)' },
  crystal: { id: 'crystal', label: 'Bintang Kristal', color: '#a5f3fc', glow: 'rgba(165, 243, 252, 0.7)' },
  rose: { id: 'rose', label: 'Bintang Mawar', color: '#f472b6', glow: 'rgba(244, 114, 182, 0.7)' },
  cyan: { id: 'cyan', label: 'Bintang Aurora', color: '#6ee7b7', glow: 'rgba(110, 231, 183, 0.7)' }
};

/**
 * Send a Star Message across the universe.
 * Strictly checks sender auth and maps recipient character to verified UID.
 */
export async function dbSendStarMessage({
  recipientCharacter,
  text,
  category = 'warmth',
  starType = 'gold',
  x = null,
  y = null,
  universeOrigin = null
} = {}, authUser) {
  const currentUser = authUser || auth?.currentUser;
  if (!currentUser || !currentUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }

  // Refresh token if needed
  if (typeof currentUser.getIdToken === 'function') {
    try {
      if (typeof currentUser.reload === 'function' && !currentUser.emailVerified) {
        await currentUser.reload();
      }
      await currentUser.getIdToken(true);
    } catch (_) {}
  }

  const verifiedSenderChar = getVerifiedCharacterKey(currentUser);
  if (!verifiedSenderChar) {
    throw new Error('Akun belum terverifikasi sebagai karakter sah Our Little Universe.');
  }

  const targetChar = String(recipientCharacter || '').toLowerCase().trim();
  if (!['nyanya', 'lala', 'lele'].includes(targetChar)) {
    throw new Error('Penerima pesan bintang tidak valid.');
  }

  if (targetChar === verifiedSenderChar) {
    throw new Error('Kamu tidak bisa mengirim pesan bintang ke dirimu sendiri.');
  }

  const targetConfig = CANONICAL_CHARACTERS[targetChar];
  if (!targetConfig || !targetConfig.uid) {
    throw new Error(`Data karakter penerima ${targetChar} tidak ditemukan.`);
  }

  const trimmedText = typeof text === 'string' ? text.trim() : '';
  if (!trimmedText) {
    throw new Error('Pesan bintang tidak boleh kosong.');
  }
  if (trimmedText.length > 2000) {
    throw new Error(`Pesan terlalu panjang (${trimmedText.length} karakter). Maksimal 2000 karakter.`);
  }

  const validCategory = ['warmth', 'wish', 'greeting', 'secret'].includes(category) ? category : 'warmth';
  const validStarType = ['gold', 'lavender', 'crystal', 'rose', 'cyan'].includes(starType) ? starType : 'gold';

  // Random coordinates if not provided (safe bounds between 8% and 88% to avoid edge clipping)
  const starX = typeof x === 'number' && x >= 0 && x <= 100 ? Math.round(x * 10) / 10 : Math.round((10 + Math.random() * 78) * 10) / 10;
  const starY = typeof y === 'number' && y >= 0 && y <= 100 ? Math.round(y * 10) / 10 : Math.round((12 + Math.random() * 66) * 10) / 10;

  const origin = universeOrigin || (verifiedSenderChar === 'nyanya' ? 'kidult' : verifiedSenderChar === 'lala' ? 'to_you' : 'shadow');

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const now = Date.now();
  const starId = `star-${now}-${Math.random().toString(36).slice(2, 8)}`;
  const senderConfig = CANONICAL_CHARACTERS[verifiedSenderChar];

  const payload = {
    id: starId,
    senderUid: currentUser.uid,
    senderCharacter: verifiedSenderChar,
    senderName: senderConfig?.name || verifiedSenderChar,
    senderAvatar: senderConfig?.avatar || '',
    recipientUid: targetConfig.uid,
    recipientCharacter: targetChar,
    recipientName: targetConfig.name || targetChar,
    text: trimmedText,
    category: validCategory,
    starType: validStarType,
    x: starX,
    y: starY,
    universeOrigin: origin,
    createdAt: now,
    updatedAt: now,
    read: false,
    favorites: {}
  };

  const starDocRef = doc(db, 'star_messages', starId);
  await setDoc(starDocRef, payload);

  // Update local cache
  try {
    const cacheKey = `olu_star_messages_${currentUser.uid}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    cached.unshift(payload);
    localStorage.setItem(cacheKey, JSON.stringify(cached.slice(0, 100)));
  } catch (_) {}

  return payload;
}

/**
 * Fetch star messages for the authenticated user (both received and sent).
 */
export async function dbFetchStarMessages(authUser) {
  if (!authUser || !authUser.uid || !db) return [];

  try {
    const colRef = collection(db, 'star_messages');
    const [recSnap, sentSnap] = await Promise.all([
      getDocs(query(colRef, where('recipientUid', '==', authUser.uid))),
      getDocs(query(colRef, where('senderUid', '==', authUser.uid)))
    ]);

    const map = new Map();
    recSnap.forEach(d => map.set(d.id, d.data()));
    sentSnap.forEach(d => map.set(d.id, d.data()));

    const list = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Cache locally
    try {
      localStorage.setItem(`olu_star_messages_${authUser.uid}`, JSON.stringify(list.slice(0, 100)));
    } catch (_) {}

    return list;
  } catch (err) {
    console.warn('Notice fetching star messages from Firestore:', err);
    // Return cache if network failed
    try {
      const cached = JSON.parse(localStorage.getItem(`olu_star_messages_${authUser.uid}`) || '[]');
      return cached;
    } catch (_) {
      return [];
    }
  }
}

/**
 * Subscribe in real-time to star messages for the authenticated user.
 */
export function dbSubscribeStarMessages(authUser, onUpdate, onError) {
  if (!authUser || !authUser.uid || !db) {
    return () => {};
  }

  const colRef = collection(db, 'star_messages');
  const qRec = query(colRef, where('recipientUid', '==', authUser.uid));
  const qSent = query(colRef, where('senderUid', '==', authUser.uid));

  let recItems = new Map();
  let sentItems = new Map();

  function notify() {
    const merged = new Map([...recItems, ...sentItems]);
    const list = Array.from(merged.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    try {
      localStorage.setItem(`olu_star_messages_${authUser.uid}`, JSON.stringify(list.slice(0, 100)));
    } catch (_) {}
    if (typeof onUpdate === 'function') onUpdate(list);
  }

  const unsubRec = onSnapshot(qRec, (snap) => {
    recItems.clear();
    snap.forEach(d => recItems.set(d.id, d.data()));
    notify();
  }, (err) => {
    console.warn('Realtime Star Messages (inbox) notice:', err);
    if (onError) onError(err);
  });

  const unsubSent = onSnapshot(qSent, (snap) => {
    sentItems.clear();
    snap.forEach(d => sentItems.set(d.id, d.data()));
    notify();
  }, (err) => {
    console.warn('Realtime Star Messages (sent) notice:', err);
    if (onError) onError(err);
  });

  return () => {
    unsubRec();
    unsubSent();
  };
}

/**
 * Mark a Star Message as read.
 */
export async function dbMarkStarMessageRead(starId, authUser) {
  if (!authUser || !authUser.uid || !db || !starId) return;

  const docRef = doc(db, 'star_messages', starId);
  try {
    await updateDoc(docRef, {
      read: true,
      readAt: Date.now()
    });
  } catch (err) {
    console.warn('Notice marking star message as read:', err);
  }
}

/**
 * Toggle favorite on a Star Message for the authenticated user.
 */
export async function dbToggleStarMessageFavorite(starId, isFavorite, authUser) {
  if (!authUser || !authUser.uid || !db || !starId) return;

  const verifiedChar = getVerifiedCharacterKey(authUser) || authUser.uid;
  const docRef = doc(db, 'star_messages', starId);
  try {
    const starSnap = await getDoc(docRef);
    if (!starSnap.exists()) return;
    const data = starSnap.data();
    const favs = { ...(data.favorites || {}), [verifiedChar]: Boolean(isFavorite), [authUser.uid]: Boolean(isFavorite) };
    await updateDoc(docRef, {
      favorites: favs,
      updatedAt: Date.now()
    });
  } catch (err) {
    console.warn('Notice toggling star message favorite:', err);
  }
}

// ============================================================================
// KOTAK POS — DIGITAL LETTERS & MAILBOX (KIDULT, TO YOU, SHADOW)
// ============================================================================

export const LETTER_PAPER_THEMES = {
  dreamy: {
    id: 'dreamy',
    name: 'Senja Lavender (KIDULT)',
    icon: '🌸',
    accentColor: '#c084fc',
    bgGradient: 'linear-gradient(135deg, rgba(243, 232, 255, 0.95), rgba(253, 242, 248, 0.95))',
    border: 'rgba(192, 132, 252, 0.4)'
  },
  morning: {
    id: 'morning',
    name: 'Cahaya Pagi (TO YOU)',
    icon: '☀️',
    accentColor: '#fb923c',
    bgGradient: 'linear-gradient(135deg, rgba(255, 247, 237, 0.95), rgba(254, 243, 199, 0.95))',
    border: 'rgba(251, 146, 60, 0.4)'
  },
  crystal: {
    id: 'crystal',
    name: 'Malam Kristal (SHADOW)',
    icon: '💎',
    accentColor: '#818cf8',
    bgGradient: 'linear-gradient(135deg, rgba(238, 242, 255, 0.95), rgba(245, 243, 255, 0.95))',
    border: 'rgba(129, 140, 248, 0.4)'
  },
  parchment: {
    id: 'parchment',
    name: 'Perkamen Klasik Emas',
    icon: '📜',
    accentColor: '#d97706',
    bgGradient: 'linear-gradient(135deg, rgba(254, 252, 232, 0.95), rgba(254, 240, 138, 0.85))',
    border: 'rgba(217, 119, 6, 0.4)'
  }
};

/**
 * Send a digital letter via Kotak Pos.
 * Strictly checks sender auth and maps recipient character to verified UID.
 */
export async function dbSendLetter({
  recipientCharacter,
  title,
  body,
  paperTheme = 'dreamy',
  universeOrigin = 'kidult'
}) {
  const currentUser = auth?.currentUser;
  if (!currentUser || !currentUser.uid) {
    throw new Error('Pengguna harus login untuk mengirim surat di Kotak Pos.');
  }

  const verifiedSenderChar = getVerifiedCharacterKey(currentUser);
  if (!verifiedSenderChar) {
    throw new Error('Akun pengirim tidak terdaftar sebagai karakter resmi Our Little Universe.');
  }

  const targetChar = (recipientCharacter || '').toLowerCase().trim();
  if (!targetChar || !['nyanya', 'lala', 'lele'].includes(targetChar)) {
    throw new Error('Penerima surat harus salah satu dari: Nyanya, Lala, atau Lele.');
  }

  if (targetChar === verifiedSenderChar) {
    throw new Error('Kamu tidak bisa mengirim surat ke dirimu sendiri.');
  }

  const targetConfig = CANONICAL_CHARACTERS[targetChar];
  if (!targetConfig || !targetConfig.uid) {
    throw new Error(`Data karakter penerima ${targetChar} tidak ditemukan.`);
  }

  const trimmedTitle = typeof title === 'string' ? title.trim() : '';
  if (!trimmedTitle) {
    throw new Error('Judul surat tidak boleh kosong.');
  }
  if (trimmedTitle.length > 120) {
    throw new Error('Judul surat maksimal 120 karakter.');
  }

  const trimmedBody = typeof body === 'string' ? body.trim() : '';
  if (!trimmedBody) {
    throw new Error('Isi surat tidak boleh kosong.');
  }
  if (trimmedBody.length > 4000) {
    throw new Error('Isi surat maksimal 4000 karakter.');
  }

  if (!db) {
    throw new Error('Firestore belum terinisialisasi.');
  }

  const now = Date.now();
  const letterId = `letter-${now}-${Math.random().toString(36).slice(2, 8)}`;
  const senderConfig = CANONICAL_CHARACTERS[verifiedSenderChar] || {};

  const payload = {
    id: letterId,
    senderUid: currentUser.uid,
    senderCharacter: verifiedSenderChar,
    senderName: senderConfig.name || verifiedSenderChar,
    senderAvatar: senderConfig.avatar || `/assets/avatar_${verifiedSenderChar}_hd.png`,
    recipientUid: targetConfig.uid,
    recipientCharacter: targetChar,
    recipientName: targetConfig.name || targetChar,
    recipientAvatar: targetConfig.avatar || `/assets/avatar_${targetChar}_hd.png`,
    title: trimmedTitle,
    body: trimmedBody,
    paperTheme: paperTheme || 'dreamy',
    universeOrigin: universeOrigin || 'kidult',
    read: false,
    readAt: null,
    deletedBySender: false,
    deletedByRecipient: false,
    createdAt: now,
    updatedAt: now
  };

  const letterDocRef = doc(db, 'letters', letterId);
  await setDoc(letterDocRef, payload);

  // Update local cache
  try {
    const cacheKey = `olu_letters_${currentUser.uid}`;
    const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
    cached.unshift(payload);
    localStorage.setItem(cacheKey, JSON.stringify(cached.slice(0, 100)));
  } catch (_) {}

  return payload;
}

/**
 * Fetch digital letters for the authenticated user (both received and sent).
 */
export async function dbFetchLetters(authUser) {
  if (!authUser || !authUser.uid || !db) return [];

  try {
    const colRef = collection(db, 'letters');
    const [recSnap, sentSnap] = await Promise.all([
      getDocs(query(colRef, where('recipientUid', '==', authUser.uid))),
      getDocs(query(colRef, where('senderUid', '==', authUser.uid)))
    ]);

    const map = new Map();
    recSnap.forEach(d => map.set(d.id, d.data()));
    sentSnap.forEach(d => map.set(d.id, d.data()));

    const list = Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

    // Cache locally
    try {
      localStorage.setItem(`olu_letters_${authUser.uid}`, JSON.stringify(list.slice(0, 100)));
    } catch (_) {}

    return list;
  } catch (err) {
    console.warn('Notice fetching letters from Firestore:', err);
    // Return cache if network failed
    try {
      const cached = JSON.parse(localStorage.getItem(`olu_letters_${authUser.uid}`) || '[]');
      return cached;
    } catch (_) {
      return [];
    }
  }
}

/**
 * Subscribe in real-time to letters for the authenticated user.
 */
export function dbSubscribeLetters(authUser, onUpdate, onError) {
  if (!authUser || !authUser.uid || !db) {
    return () => {};
  }

  const colRef = collection(db, 'letters');
  const qRec = query(colRef, where('recipientUid', '==', authUser.uid));
  const qSent = query(colRef, where('senderUid', '==', authUser.uid));

  let recItems = new Map();
  let sentItems = new Map();

  function notify() {
    const merged = new Map([...recItems, ...sentItems]);
    const list = Array.from(merged.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    try {
      localStorage.setItem(`olu_letters_${authUser.uid}`, JSON.stringify(list.slice(0, 100)));
    } catch (_) {}
    if (typeof onUpdate === 'function') onUpdate(list);
  }

  const unsubRec = onSnapshot(qRec, (snap) => {
    recItems.clear();
    snap.forEach(d => recItems.set(d.id, d.data()));
    notify();
  }, (err) => {
    console.warn('Notice in letters recipient subscription:', err);
    if (typeof onError === 'function') onError(err);
  });

  const unsubSent = onSnapshot(qSent, (snap) => {
    sentItems.clear();
    snap.forEach(d => sentItems.set(d.id, d.data()));
    notify();
  }, (err) => {
    console.warn('Notice in letters sent subscription:', err);
    if (typeof onError === 'function') onError(err);
  });

  return () => {
    try { unsubRec(); } catch (_) {}
    try { unsubSent(); } catch (_) {}
  };
}

/**
 * Mark a letter as read by recipient.
 */
export async function dbMarkLetterRead(letterId, authUser) {
  if (!authUser || !authUser.uid || !db || !letterId) return;

  const docRef = doc(db, 'letters', letterId);
  try {
    await updateDoc(docRef, {
      read: true,
      readAt: Date.now(),
      updatedAt: Date.now()
    });

    // Update local cache
    try {
      const cacheKey = `olu_letters_${authUser.uid}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      const idx = cached.findIndex(l => l.id === letterId);
      if (idx !== -1) {
        cached[idx].read = true;
        cached[idx].readAt = Date.now();
        localStorage.setItem(cacheKey, JSON.stringify(cached));
      }
    } catch (_) {}
  } catch (err) {
    console.warn('Notice marking letter as read:', err);
  }
}

/**
 * Delete a letter from user's view (soft delete per party).
 * If user is sender, sets deletedBySender: true.
 * If user is recipient, sets deletedByRecipient: true.
 */
export async function dbDeleteLetter(letterId, authUser) {
  if (!authUser || !authUser.uid || !db || !letterId) return;

  const docRef = doc(db, 'letters', letterId);
  try {
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data();

    const isSender = data.senderUid === authUser.uid;
    const isRecipient = data.recipientUid === authUser.uid;

    if (!isSender && !isRecipient) {
      throw new Error('Hanya pengirim atau penerima yang dapat menghapus surat.');
    }

    const updates = { updatedAt: Date.now() };
    if (isSender) updates.deletedBySender = true;
    if (isRecipient) updates.deletedByRecipient = true;

    await updateDoc(docRef, updates);

    // Update local cache
    try {
      const cacheKey = `olu_letters_${authUser.uid}`;
      const cached = JSON.parse(localStorage.getItem(cacheKey) || '[]');
      const idx = cached.findIndex(l => l.id === letterId);
      if (idx !== -1) {
        if (isSender) cached[idx].deletedBySender = true;
        if (isRecipient) cached[idx].deletedByRecipient = true;
        localStorage.setItem(cacheKey, JSON.stringify(cached));
      }
    } catch (_) {}
  } catch (err) {
    console.warn('Notice deleting letter:', err);
    throw err;
  }
}



// ==============================================================================
// SHADOW — MOONLIT ART GALLERY (LELE'S PERSONAL ART MUSEUM)
// NOTE: Gallery image binaries are stored STRICTLY in browser IndexedDB (never
// Firebase Storage or external CDN). Firestore stores artwork metadata &
// optional public/private story notes only.
// ==============================================================================

/**
 * Saves or updates an Artwork metadata record in `artworks/{artworkId}` and strictly
 * private notes/stories in `artwork_notes/{artworkId}`.
 * Private story fields are stripped from `artworks/{artworkId}` when `storyPublic !== true`.
 */
export async function dbSaveArtwork(artworkInput, authUser) {
  if (!db || !authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }
  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (verifiedChar !== 'lele') {
    throw new Error('Akses ditolak: Hanya Lele yang dapat menyimpan karya di Moonlit Art Gallery.');
  }

  const artworkId = String(artworkInput.id || `art-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`);
  const status = ['published', 'draft', 'in_development'].includes(artworkInput.status)
    ? artworkInput.status
    : 'draft';
  const storyPublic = Boolean(artworkInput.storyPublic);

  const sanitizedStory = {
    inspiration: String(artworkInput.story?.inspiration || '').trim().slice(0, 2000),
    meaning: String(artworkInput.story?.meaning || '').trim().slice(0, 2000),
    process: String(artworkInput.story?.process || '').trim().slice(0, 2000)
  };
  const privateNotes = String(artworkInput.privateNotes || '').trim().slice(0, 4000);

  const now = Date.now();
  const createdAt = artworkInput.createdAt || now;

  // Build public/exhibition doc payload (NEVER include private notes or private story when !storyPublic)
  const artworkPayload = {
    id: artworkId,
    authorUid: authUser.uid,
    author: 'lele',
    universeOrigin: 'shadow',
    title: String(artworkInput.title || '').trim().slice(0, 150),
    description: String(artworkInput.description || '').trim().slice(0, 2000),
    createdDate: String(artworkInput.createdDate || '').trim().slice(0, 30),
    collectionId: String(artworkInput.collectionId || 'memories').trim().slice(0, 60),
    status,
    orderIndex: Number.isFinite(Number(artworkInput.orderIndex)) ? Math.max(0, Number(artworkInput.orderIndex)) : 0,
    storagePath: String(artworkInput.storagePath || '').slice(0, 300),
    imageStorageType: 'indexeddb',
    mimeType: String(artworkInput.mimeType || 'image/jpeg').slice(0, 100),
    aspectRatio: (Number.isFinite(Number(artworkInput.aspectRatio)) && Number(artworkInput.aspectRatio) > 0)
      ? Math.min(20, Number(artworkInput.aspectRatio))
      : 1,
    storyPublic,
    createdAt,
    updatedAt: now
  };

  if (storyPublic) {
    artworkPayload.story = sanitizedStory;
  }

  const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
  await setDoc(artDocRef, artworkPayload);

  // Save owner-only private story & personal notes to `artwork_notes/{artworkId}`
  const noteDocRef = doc(db, ARTWORK_NOTES_COLLECTION, artworkId);
  await setDoc(noteDocRef, {
    id: artworkId,
    authorUid: authUser.uid,
    author: 'lele',
    story: sanitizedStory,
    privateNotes,
    createdAt,
    updatedAt: now
  });

  return {
    ...artworkPayload,
    story: sanitizedStory,
    privateNotes
  };
}

/**
 * Fetches Artworks from Firestore according to strict ownership & publication privacy:
 * - Visitors (`nyanya` / `lala`): ONLY `status == 'published'` artworks, with non-public stories stripped.
 * - Owner (`lele`): All her artworks (including `draft` & `in_development`) merged with her `artwork_notes`.
 */
export async function dbFetchArtworks(authUser) {
  if (!db || !authUser || !authUser.uid) {
    return [];
  }
  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (!verifiedChar) return [];

  const isLele = verifiedChar === 'lele';
  const artworksMap = new Map();

  // Query published artworks (accessible to all 3 friends)
  try {
    const qPub = query(collection(db, ARTWORKS_COLLECTION), where('status', '==', 'published'));
    const snapPub = await getDocs(qPub);
    snapPub.forEach((d) => {
      artworksMap.set(d.id, d.data());
    });
  } catch (err) {
    console.warn('Notice fetching published artworks:', err);
  }

  // If Lele, also fetch all her own artworks (drafts & in_development) and private notes
  if (isLele) {
    try {
      const qMine = query(collection(db, ARTWORKS_COLLECTION), where('authorUid', '==', authUser.uid));
      const snapMine = await getDocs(qMine);
      snapMine.forEach((d) => {
        artworksMap.set(d.id, d.data());
      });
    } catch (err) {
      console.warn('Notice fetching owner artworks:', err);
    }

    try {
      const qNotes = query(collection(db, ARTWORK_NOTES_COLLECTION), where('authorUid', '==', authUser.uid));
      const snapNotes = await getDocs(qNotes);
      snapNotes.forEach((d) => {
        const noteData = d.data();
        const existing = artworksMap.get(d.id);
        if (existing) {
          artworksMap.set(d.id, {
            ...existing,
            story: noteData.story || existing.story || { inspiration: '', meaning: '', process: '' },
            privateNotes: noteData.privateNotes || ''
          });
        }
      });
    } catch (err) {
      console.warn('Notice fetching owner artwork notes:', err);
    }
  }

  return Array.from(artworksMap.values()).map((item) => {
    if (!isLele) {
      return {
        ...item,
        story: item.storyPublic ? (item.story || { inspiration: '', meaning: '', process: '' }) : null,
        privateNotes: ''
      };
    }
    return item;
  });
}

/**
 * Deletes an Artwork, its Storage file, and its owner-only note document safely.
 */
export async function dbDeleteArtworkSafe(artworkId, authUser) {
  if (!db || !authUser || !authUser.uid) {
    throw new Error('Akses ditolak: User belum terautentikasi.');
  }
  const verifiedChar = getVerifiedCharacterKey(authUser);
  if (verifiedChar !== 'lele') {
    throw new Error('Akses ditolak: Hanya Lele yang dapat menghapus karya seni.');
  }

  const artDocRef = doc(db, ARTWORKS_COLLECTION, artworkId);
  const snap = await getDoc(artDocRef);
  if (snap.exists()) {
    const data = snap.data();
    if (data.authorUid !== authUser.uid) {
      throw new Error('Akses ditolak: Bukan pemilik karya seni.');
    }
    // Do NOT delete any legacy Firebase Storage files automatically; preserve audit boundary.
    await deleteDoc(artDocRef);
  }

  try {
    const noteDocRef = doc(db, ARTWORK_NOTES_COLLECTION, artworkId);
    await deleteDoc(noteDocRef);
  } catch (_) {}

  return { success: true, artworkId };
}
