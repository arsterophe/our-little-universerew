import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
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

console.log('Connecting to Firestore project:', firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function runAudit() {
  console.log('\n=== AUDIT ALL STORIES IN FIRESTORE ===');
  const snap = await getDocs(collection(db, 'stories'));
  console.log(`Total documents found in 'stories' collection: ${snap.size}`);

  const leleUid = '1ArxphLQpAOoOIvH9BKYw0ebD1e2';
  const allDocs = [];

  snap.forEach(docSnap => {
    const d = docSnap.data();
    allDocs.push({ id: docSnap.id, ...d });
  });

  console.log('\n--- ALL DOCUMENTS SUMMARY ---');
  allDocs.forEach((d, i) => {
    console.log(`\n[${i + 1}] Document ID: ${d.id}`);
    console.log(`    Title: "${d.title}"`);
    console.log(`    Status: "${d.status}" (publicationStatus: "${d.publicationStatus}")`);
    console.log(`    AuthorUid: "${d.authorUid}" (Matches Lele? ${d.authorUid === leleUid})`);
    console.log(`    AuthorId / Char: "${d.authorId || d.authorChar || d.author}"`);
    console.log(`    AuthorName: "${d.authorName}"`);
    console.log(`    Universe: "${d.universeId || d.universe}" (${d.universeName})`);
    console.log(`    Category: "${d.category}" | Genre: "${d.genre}"`);
    console.log(`    PublishedAt: "${d.publishedAt}" | CreatedAt: "${d.createdAt}" | UpdatedAt: "${d.updatedAt}"`);
    console.log(`    All keys:`, Object.keys(d));
  });

  console.log('\n--- LELE STORIES SPECIFIC AUDIT ---');
  const leleStories = allDocs.filter(d => 
    d.authorUid === leleUid || 
    d.authorId === 'lele' || 
    d.authorChar === 'lele' || 
    d.author === 'lele' ||
    d.id.includes('lele')
  );

  console.log(`Total stories matching Lele: ${leleStories.length}`);
  leleStories.forEach((s, idx) => {
    console.log(`\nLele Story #${idx + 1}:`);
    console.log(JSON.stringify(s, null, 2));
  });
}

runAudit()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Audit failed:', err);
    process.exit(1);
  });

