import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import fs from 'fs';

// Load .env
const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const idx = trimmed.indexOf('=');
  if (idx !== -1) {
    const k = trimmed.substring(0, idx).trim();
    const v = trimmed.substring(idx + 1).trim();
    env[k] = v;
  }
});

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: env.VITE_FIREBASE_APP_ID || undefined
};

console.log('Project ID:', firebaseConfig.projectId);
console.log('Auth Domain:', firebaseConfig.authDomain);
console.log('API Key present:', Boolean(firebaseConfig.apiKey));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function testLogin(email, password) {
  console.log(`\nTesting login for: ${email}...`);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log(`✅ SUCCESS! UID: ${userCredential.user.uid}`);
    return { success: true, uid: userCredential.user.uid };
  } catch (err) {
    console.error(`❌ FAILED!`);
    console.error(`  code: ${err.code}`);
    console.error(`  message: ${err.message}`);
    if (err.customData) console.error('  customData:', err.customData);
    return { success: false, code: err.code, message: err.message };
  }
}

async function main() {
  await testLogin('nyanya@ourlittleuniverse.com', 'ourlittleuniverse');
}

main();
