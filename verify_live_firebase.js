import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

// Parse .env manually
const envContent = fs.readFileSync('.env', 'utf-8');
const envConfig = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      envConfig[key] = val;
    }
  }
});

const firebaseConfig = {
  apiKey: envConfig.VITE_FIREBASE_API_KEY,
  authDomain: envConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envConfig.VITE_FIREBASE_STORAGE_BUCKET
};

console.log('Testing connection to Firebase project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function checkConnection() {
  console.log('\n--- 1. Testing Firestore Live Connection ---');
  try {
    const snap = await getDocs(collection(db, 'orbit_events'));
    console.log('Firestore connected successfully! Documents found:', snap.size);
    snap.forEach(d => {
      console.log(' - Doc ID:', d.id, 'Data:', JSON.stringify(d.data()).slice(0, 80));
    });
  } catch (err) {
    console.log('Firestore Live Result:', err.code, err.message);
  }

  console.log('\n--- 2. Testing Firebase Auth Accounts ---');
  const testUsers = [
    { name: 'Nyanya', email: envConfig.VITE_NYANYA_EMAIL },
    { name: 'Lala', email: envConfig.VITE_LALA_EMAIL },
    { name: 'Lele', email: envConfig.VITE_LELE_EMAIL }
  ];

  for (const u of testUsers) {
    console.log(`Checking user: ${u.name} (${u.email})`);
    try {
      await signInWithEmailAndPassword(auth, u.email, 'password123');
      console.log(` -> ${u.name}: Authenticated successfully with 'password123'!`);
    } catch (err) {
      console.log(` -> ${u.name}: Auth code: [${err.code}] - ${err.message}`);
    }
  }
}

checkConnection().then(() => process.exit(0)).catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
