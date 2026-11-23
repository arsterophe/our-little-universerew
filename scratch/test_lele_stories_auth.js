import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import fs from 'fs';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function testAuthAndFetch() {
  const passwordsToTry = ['password123', 'ourlittleuniverse'];
  let loggedInUser = null;
  
  for (const pwd of passwordsToTry) {
    try {
      console.log(`Trying to sign in as lele@ourlittleuniverse.com with pwd: ${pwd}...`);
      const cred = await signInWithEmailAndPassword(auth, 'lele@ourlittleuniverse.com', pwd);
      console.log('Successfully signed in as Lele! UID:', cred.user.uid);
      loggedInUser = cred.user;
      break;
    } catch (e) {
      console.log(`Failed with pwd ${pwd}: ${e.code}`);
    }
  }

  if (!loggedInUser) {
    console.error('Could not log in as Lele!');
    return;
  }

  console.log('\n--- 1. Fetching Lele own stories (where authorUid == Lele.uid) ---');
  try {
    const qOwn = query(collection(db, 'stories'), where('authorUid', '==', loggedInUser.uid));
    const snapOwn = await getDocs(qOwn);
    console.log(`Found ${snapOwn.size} stories with where authorUid == ${loggedInUser.uid}`);
    snapOwn.forEach(docSnap => {
      console.log(`Doc ID: ${docSnap.id}`);
      console.log(JSON.stringify(docSnap.data(), null, 2));
    });
  } catch (err) {
    console.error('Error fetching own stories:', err);
  }

  console.log('\n--- 2. Fetching published stories (where status == "published") ---');
  try {
    const qPub = query(collection(db, 'stories'), where('status', '==', 'published'));
    const snapPub = await getDocs(qPub);
    console.log(`Found ${snapPub.size} published stories with where status == 'published'`);
    snapPub.forEach(docSnap => {
      console.log(`Doc ID: ${docSnap.id}, Author: ${docSnap.data().authorName || docSnap.data().authorUid}, Title: ${docSnap.data().title}, Status: ${docSnap.data().status}`);
    });
  } catch (err) {
    console.error('Error fetching published stories:', err);
  }

  console.log('\n--- 3. Trying unbounded getDocs(collection(db, "stories")) ---');
  try {
    const snapAll = await getDocs(collection(db, 'stories'));
    console.log(`Unbounded collection size: ${snapAll.size}`);
    snapAll.forEach(d => {
      console.log(`Doc ID: ${d.id}, Author: ${d.data().authorName || d.data().authorUid}, Title: ${d.data().title}, Status: ${d.data().status}`);
    });
  } catch (err) {
    console.log('Unbounded getDocs error (expected if security rules disallow reading others drafts):', err.code, err.message);
  }
}

testAuthAndFetch().then(() => process.exit(0)).catch(e => {
  console.error(e);
  process.exit(1);
});

