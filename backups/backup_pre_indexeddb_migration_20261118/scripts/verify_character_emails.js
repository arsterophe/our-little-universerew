/**
 * ONE-TIME ADMINISTRATIVE SCRIPT (STRICT RESILIENCE & VERIFICATION REVISION)
 * Target Project: our-little-universe-dcd75
 * Purpose: Strictly update emailVerified to true for Nyanya, Lala, and Lele
 * 
 * Safety & Integrity Guarantees:
 * 1. Pre-Check Phase (All-or-Nothing): Reads all 3 accounts first. If any account
 *    is missing or email/UID does not match, the entire operation ABORTS before any mutation.
 * 2. Displays initial emailVerified status of all 3 accounts.
 * 3. Mutation Phase: Updates ONLY emailVerified. Tracks individual successes and failures explicitly.
 * 4. Verification Phase: Re-fetches all 3 accounts fresh from Firebase Auth.
 *    If any account still has emailVerified !== true, flags as FAILURE and exits with code 1.
 * 5. Summary: Prints explicit tally of successful and failed accounts.
 * 6. Never mutates any other user property (passwords, UIDs, emails, roles).
 */

import admin from 'firebase-admin';

// Initialize Firebase Admin with project ID and Google Cloud Shell Default Credentials
admin.initializeApp({
  projectId: 'our-little-universe-dcd75'
});

const auth = admin.auth();

// Exact target definitions
const TARGET_CHARACTERS = [
  {
    name: 'Nyanya',
    uid: '1uwba7MrGVU3xHu57VVLvztskrg2',
    email: 'nyanya@ourlittleuniverse.com'
  },
  {
    name: 'Lala',
    uid: 'EqByKA8FXoTEt0OmIsSDPfnxMDB3',
    email: 'lala@ourlittleuniverse.com'
  },
  {
    name: 'Lele',
    uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2',
    email: 'lele@ourlittleuniverse.com'
  }
];

async function verifyCharacterAccounts() {
  console.log('===============================================================');
  console.log('   FIREBASE AUTH EMAIL VERIFICATION — OUR LITTLE UNIVERSE');
  console.log('   Target Project: our-little-universe-dcd75');
  console.log('===============================================================\n');

  // -----------------------------------------------------------------
  // TAHAP 1: PRE-CHECK SEMUA AKUN (ALL-OR-NOTHING)
  // -----------------------------------------------------------------
  console.log('--- TAHAP 1: PRE-CHECK VALIDASI SEMUA AKUN ---');
  const fetchedUsers = [];
  let allValid = true;

  for (const target of TARGET_CHARACTERS) {
    try {
      const user = await auth.getUser(target.uid);
      const isEmailMatch = (user.email || '').toLowerCase() === target.email.toLowerCase();

      if (!isEmailMatch) {
        console.error(`  ❌ MISMATCH: UID ${target.uid} ditemukan dengan email '${user.email}', tetapi diharapkan '${target.email}'`);
        allValid = false;
        break;
      }

      console.log(`  ✓ [VALID] ${target.name} (${target.uid})`);
      console.log(`            Email : ${user.email}`);
      console.log(`            Status emailVerified awal: ${user.emailVerified}`);

      fetchedUsers.push({
        target,
        currentRecord: user
      });
    } catch (err) {
      console.error(`  ❌ GAGAL MENEMUKAN AKUN: ${target.name} (UID: ${target.uid}) -> ${err.message}`);
      allValid = false;
      break;
    }
  }

  // Jika ada salah satu yang gagal atau tidak cocok, batalkan seluruh proses
  if (!allValid || fetchedUsers.length !== TARGET_CHARACTERS.length) {
    console.error('\n🚨 PRE-CHECK GAGAL! Salah satu akun tidak valid atau tidak ditemukan.');
    console.error('   SELURUH PROSES UPDATE DIBATALKAN DEMI KEAMANAN.');
    process.exit(1);
  }

  console.log('\n  ✅ Pre-check sukses: Ketiga akun cocok 100% dengan target.');

  // -----------------------------------------------------------------
  // TAHAP 2: EKSEKUSI PEMBARUAN emailVerified DENGAN ERROR HANDLING PER-AKUN
  // -----------------------------------------------------------------
  console.log('\n--- TAHAP 2: EKSEKUSI PEMBARUAN emailVerified ---');
  const updateErrors = [];

  for (const item of fetchedUsers) {
    const { target, currentRecord } = item;
    if (!currentRecord.emailVerified) {
      console.log(`  ⏳ Mengubah emailVerified menjadi true untuk ${target.name} (${target.email})...`);
      try {
        await auth.updateUser(target.uid, {
          emailVerified: true
        });
        console.log(`  ✓ Pembaruan berhasil dikirim untuk ${target.name}`);
      } catch (updateErr) {
        console.error(`  ❌ Gagal memperbarui ${target.name} (${target.uid}): ${updateErr.message}`);
        updateErrors.push({
          target,
          error: updateErr.message
        });
      }
    } else {
      console.log(`  ℹ️ ${target.name} (${target.email}) sudah true, tidak memerlukan pembaruan.`);
    }
  }

  // -----------------------------------------------------------------
  // TAHAP 3: BACA ULANG & VERIFIKASI AKHIR DARI CLOUD (STRICT CHECK)
  // -----------------------------------------------------------------
  console.log('\n--- TAHAP 3: VERIFIKASI AKHIR (BACA ULANG DARI CLOUD) ---');
  const finalResults = [];
  let unverifiedCount = 0;

  for (const target of TARGET_CHARACTERS) {
    try {
      const reloadedUser = await auth.getUser(target.uid);
      const isVerified = reloadedUser.emailVerified === true;
      if (!isVerified) {
        unverifiedCount++;
      }

      finalResults.push({
        name: target.name,
        uid: reloadedUser.uid,
        email: reloadedUser.email,
        emailVerified: isVerified
      });

      console.log(`  ✦ Karakter     : ${target.name}`);
      console.log(`    UID          : ${reloadedUser.uid}`);
      console.log(`    Email        : ${reloadedUser.email}`);
      console.log(`    emailVerified: ${isVerified ? '✅ TRUE (Terverifikasi)' : '❌ FALSE (Belum Terverifikasi)'}`);
      console.log('  -------------------------------------------------------------');
    } catch (reloadErr) {
      unverifiedCount++;
      console.error(`  ❌ Gagal membaca ulang akun ${target.name}: ${reloadErr.message}`);
      finalResults.push({
        name: target.name,
        uid: target.uid,
        email: target.email,
        emailVerified: false,
        error: reloadErr.message
      });
      console.log('  -------------------------------------------------------------');
    }
  }

  // -----------------------------------------------------------------
  // TAHAP 4: RINGKASAN AKHIR & KEPUTUSAN STATUS KELUARAN (EXIT CODE)
  // -----------------------------------------------------------------
  const successfulAccounts = finalResults.filter((r) => r.emailVerified);
  const failedAccounts = finalResults.filter((r) => !r.emailVerified);

  console.log('\n===============================================================');
  console.log('                      RINGKASAN AKHIR');
  console.log('===============================================================');
  console.log(`  Total Akun Diperiksa : ${TARGET_CHARACTERS.length}`);
  console.log(`  Akun Terverifikasi   : ${successfulAccounts.length} (${successfulAccounts.map((a) => a.name).join(', ') || 'tidak ada'})`);
  console.log(`  Akun Gagal / Belum   : ${failedAccounts.length} (${failedAccounts.map((a) => a.name).join(', ') || 'tidak ada'})`);

  if (failedAccounts.length > 0 || updateErrors.length > 0 || unverifiedCount > 0) {
    console.error('\n❌ STATUS AKHIR: GAGAL!');
    console.error('   Masih terdapat akun yang belum terverifikasi atau gagal diupdate.');
    process.exit(1);
  }

  console.log('\n✨ STATUS AKHIR: SUKSES PENUH!');
  console.log('   Semua akun karakter (Nyanya, Lala, Lele) telah 100% berstatus emailVerified: true.');
}

verifyCharacterAccounts()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\n❌ Terjadi kesalahan fatal tak terduga:', err);
    process.exit(1);
  });
