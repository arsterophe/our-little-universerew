/**
 * STORY OWNERSHIP AUDIT & SAFE MIGRATION SCRIPT — OUR LITTLE UNIVERSE
 * Target Project: our-little-universe-dcd75
 * Collection    : stories
 *
 * Default Mode (READ-ONLY DRY-RUN):
 *   node scripts/audit_story_ownership.js
 *
 * Explicit Confirmed Migration Mode (Admin SDK only, requires explicit IDs):
 *   node scripts/audit_story_ownership.js --apply --target=lele --confirm-ids=<docId1>,<docId2>
 *
 * Guarantees:
 * - Never guesses or auto-reassigns story ownership without --apply and --confirm-ids.
 * - Preserves title, subtitle, synopsis, content, coverTheme, coverUrl, category,
 *   genre, status, wordCount, readingTimeMinutes, createdAt, updatedAt, publishedAt.
 * - Never deletes or duplicates existing documents.
 */

import admin from 'firebase-admin';

const CANONICAL_ACCOUNTS = {
  nyanya: {
    charKey: 'nyanya',
    name: 'Nyanya',
    uid: '1uwba7MrGVU3xHu57VVLvztskrg2',
    universeId: 'kidult',
    universeName: 'KIDULT'
  },
  lala: {
    charKey: 'lala',
    name: 'Lala',
    uid: 'EqByKA8FXoTEt0OmIsSDPfnxMDB3',
    universeId: 'to_you',
    universeName: 'TO YOU'
  },
  lele: {
    charKey: 'lele',
    name: 'Lele',
    uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2',
    universeId: 'shadow',
    universeName: 'SHADOW'
  }
};

const UID_TO_CHAR = Object.fromEntries(
  Object.values(CANONICAL_ACCOUNTS).map((acc) => [acc.uid, acc.charKey])
);

function parseArgs(argv) {
  const args = {
    apply: argv.includes('--apply'),
    target: 'lele',
    confirmIds: []
  };

  for (const token of argv) {
    if (token.startsWith('--target=')) {
      args.target = token.slice('--target='.length).trim().toLowerCase();
    } else if (token.startsWith('--confirm-ids=')) {
      args.confirmIds = token
        .slice('--confirm-ids='.length)
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    }
  }

  return args;
}

function detectDocIdPrefixChar(docId) {
  const match = String(docId || '').match(/^story-(nyanya|lala|lele)-/);
  return match ? match[1] : null;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (!CANONICAL_ACCOUNTS[args.target]) {
    console.error(`❌ --target tidak valid: "${args.target}". Gunakan nyanya | lala | lele.`);
    process.exit(1);
  }

  if (args.apply && args.confirmIds.length === 0) {
    console.error('❌ Mode --apply wajib menyertakan --confirm-ids=<docId1,docId2>.');
    process.exit(1);
  }

  admin.initializeApp({
    projectId: 'our-little-universe-dcd75'
  });

  const db = admin.firestore();
  const snap = await db.collection('stories').get();

  console.log('===============================================================');
  console.log('  AUDIT KEPEMILIKAN CERITA (STORIES) — OUR LITTLE UNIVERSE');
  console.log(`  Mode: ${args.apply ? 'APPLY CONFIRMED MIGRATION' : 'READ-ONLY AUDIT'}`);
  console.log(`  Total dokumen ditemukan: ${snap.size}`);
  console.log('===============================================================\n');

  const docsById = new Map();
  let flaggedCount = 0;

  snap.forEach((docSnap) => {
    const data = docSnap.data() || {};
    docsById.set(docSnap.id, data);

    const uidChar = UID_TO_CHAR[data.authorUid] || null;
    const prefixChar = detectDocIdPrefixChar(docSnap.id);
    const anomalies = [];

    if (!data.authorUid) {
      anomalies.push('missing_authorUid');
    } else if (!uidChar) {
      anomalies.push(`unknown_authorUid:${data.authorUid}`);
    }

    if (uidChar && data.authorChar && data.authorChar !== uidChar) {
      anomalies.push(`char_uid_mismatch(authorChar=${data.authorChar}, uidChar=${uidChar})`);
    }

    if (prefixChar && uidChar && prefixChar !== uidChar) {
      anomalies.push(`id_prefix_uid_mismatch(prefix=${prefixChar}, uidChar=${uidChar})`);
    }

    if (anomalies.length > 0) flaggedCount += 1;

    console.log(`- [${docSnap.id}] "${data.title || '(tanpa judul)'}"`);
    console.log(`  status     : ${data.status || '-'}`);
    console.log(`  authorUid  : ${data.authorUid || '-'} (${uidChar || 'unknown'})`);
    console.log(`  authorChar : ${data.authorChar || '-'} | authorName: ${data.authorName || '-'}`);
    console.log(`  timestamps : createdAt=${data.createdAt || '-'} | updatedAt=${data.updatedAt || '-'}`);
    if (anomalies.length > 0) {
      console.log(`  ⚠ anomali  : ${anomalies.join(', ')}`);
    }
    console.log('');
  });

  console.log(`Ringkasan audit: ${snap.size} dokumen diperiksa, ${flaggedCount} dokumen memiliki anomali metadata.`);

  if (!args.apply) {
    console.log('\nTidak ada perubahan dilakukan (mode read-only).');
    console.log('Jika ID dokumen milik Lele sudah dipastikan, jalankan:');
    console.log('  node scripts/audit_story_ownership.js --apply --target=lele --confirm-ids=<id1>,<id2>');
    return;
  }

  const targetAccount = CANONICAL_ACCOUNTS[args.target];
  console.log(`\nMemproses koreksi terkonfirmasi ke akun ${targetAccount.name} (${targetAccount.uid})...`);

  for (const docId of args.confirmIds) {
    if (!docsById.has(docId)) {
      console.error(`  ❌ Dokumen "${docId}" tidak ditemukan di Firestore. Dilewati.`);
      continue;
    }

    const docRef = db.collection('stories').doc(docId);
    // Hanya ubah field kepemilikan kanonik sesuai firestore.rules (isValidStory)
    // tanpa menyentuh title, subtitle, synopsis, content, cover, atau timestamps.
    await docRef.update({
      authorUid: targetAccount.uid,
      authorChar: targetAccount.charKey,
      authorName: targetAccount.name
    });

    const verified = (await docRef.get()).data();
    console.log(
      `  ✓ "${verified?.title || docId}" [${docId}] -> authorUid=${verified?.authorUid}, authorChar=${verified?.authorChar}, authorName=${verified?.authorName}`
    );
  }
}

main().catch((err) => {
  console.error('❌ Error menjalankan audit/migrasi story:', err);
  process.exit(1);
});

