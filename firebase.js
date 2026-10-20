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

if (isFirebaseConfigured()) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
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

export { app, auth };

// 3. Authorized Character Universe Specifications & Mapping
export const CHARACTER_AUTH_RULES = {
  nyanya: {
    id: 'nyanya',
    name: 'Nyanya',
    role: 'Moonlit Shadow Witch',
    universe: 'SHADOW',
    expectedEmail: (getEnv('VITE_NYANYA_EMAIL') || '').toLowerCase(),
    expectedUid: getEnv('VITE_NYANYA_UID') || ''
  },
  lala: {
    id: 'lala',
    name: 'Lala',
    role: 'The Everglow Fairy',
    universe: 'TO YOU',
    expectedEmail: (getEnv('VITE_LALA_EMAIL') || '').toLowerCase(),
    expectedUid: getEnv('VITE_LALA_UID') || ''
  },
  lele: {
    id: 'lele',
    name: 'Lele',
    role: 'The Eclipse Guardian',
    universe: 'KIDULT',
    expectedEmail: (getEnv('VITE_LELE_EMAIL') || '').toLowerCase(),
    expectedUid: getEnv('VITE_LELE_UID') || ''
  }
};

/**
 * Determine which character an authenticated user belongs to
 * by checking UID first, then email.
 */
export function identifyUserCharacter(user) {
  if (!user) return null;

  const uid = user.uid;
  const email = (user.email || '').toLowerCase().trim();

  // 1. Check by UID if configured
  for (const [key, rules] of Object.entries(CHARACTER_AUTH_RULES)) {
    if (rules.expectedUid && rules.expectedUid === uid) {
      return key;
    }
  }

  // 2. Check by Email if configured
  for (const [key, rules] of Object.entries(CHARACTER_AUTH_RULES)) {
    if (rules.expectedEmail && rules.expectedEmail === email) {
      return key;
    }
  }

  // 3. Fallback heuristic for standard user identity (e.g. email containing nyanya, lala, or lele)
  if (email.includes('nyanya')) return 'nyanya';
  if (email.includes('lala')) return 'lala';
  if (email.includes('lele')) return 'lele';

  return null;
}

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

  // 1. Authenticate with Firebase Authentication
  const userCredential = await signInWithEmailAndPassword(
    auth,
    cleanEmail,
    cleanPassword
  );
  const user = userCredential.user;

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
