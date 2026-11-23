/**
 * ADMINISTRATIVE SCRIPT: SECURE CHARACTER PASSWORD UPDATE
 * Target Project: our-little-universe-dcd75
 * 
 * Ketentuan Keamanan & Integritas:
 * 1. Menggunakan Firebase Admin SDK resmi dengan target project `our-little-universe-dcd75`.
 * 2. Password baru diinput secara interaktif oleh pengguna saat script dijalankan.
 * 3. Password tidak pernah ditulis di source code, log, atau terminal (input di-mask dengan '*').
 * 4. Meminta konfirmasi ulang password untuk mencegah kesalahan pengetikan.
 * 5. Hanya memperbarui properti `password`. Tidak mengubah UID, email, status verifikasi, maupun data Firestore.
 * 6. Memastikan akun terverifikasi kecocokan UID & Email sebelum pembaruan dilakukan.
 * 7. Menampilkan konfirmasi keberhasilan dengan nama karakter dan email tanpa mengekspos password.
 */

import admin from 'firebase-admin';
import readline from 'readline';

// Inisialisasi Firebase Admin SDK dengan project ID target
admin.initializeApp({
  projectId: 'our-little-universe-dcd75'
});

const auth = admin.auth();

// Daftar akun karakter resmi Our Little Universe
const CHARACTERS = [
  {
    key: 'nyanya',
    name: 'Nyanya ⭐',
    email: 'nyanya@ourlittleuniverse.com',
    uid: '1uwba7MrGVU3xHu57VVLvztskrg2'
  },
  {
    key: 'lala',
    name: 'Lala ☀️',
    email: 'lala@ourlittleuniverse.com',
    uid: 'EqByKA8FXoTEt0OmIsSDPfnxMDB3'
  },
  {
    key: 'lele',
    name: 'Lele 🌙',
    email: 'lele@ourlittleuniverse.com',
    uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2'
  }
];

// Helper untuk membaca input teks biasa
function askText(query) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

// Helper untuk membaca password secara aman (karakter disamarkan dengan '*')
function askPasswordMasked(query) {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    process.stdout.write(query);

    let password = '';
    const wasRaw = stdin.isRaw;
    if (stdin.setRawMode) stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    const onData = (chunk) => {
      for (const char of chunk) {
        // Enter / Return
        if (char === '\r' || char === '\n' || char === '\u0004') {
          if (stdin.setRawMode) stdin.setRawMode(wasRaw || false);
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          resolve(password);
          return;
        }
        // Ctrl+C (Interupsi aman)
        if (char === '\u0003') {
          if (stdin.setRawMode) stdin.setRawMode(wasRaw || false);
          process.stdout.write('\n\nProses dibatalkan oleh pengguna.\n');
          process.exit(130);
        }
        // Backspace
        if (char === '\u0008' || char === '\x7f') {
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
        }
        // Karakter umum yang dapat dicetak
        else if (char.charCodeAt(0) >= 32) {
          password += char;
          process.stdout.write('*');
        }
      }
    };

    stdin.on('data', onData);
  });
}

// Fungsi utama untuk memperbarui password satu akun
async function updateSingleAccountPassword(account) {
  console.log(`\n---------------------------------------------------------------`);
  console.log(`Akun Terpilih: ${account.name}`);
  console.log(`Email        : ${account.email}`);
  console.log(`UID          : ${account.uid}`);
  console.log(`---------------------------------------------------------------`);

  // Validasi akun di Firebase Authentication
  try {
    const userRecord = await auth.getUser(account.uid);
    if ((userRecord.email || '').toLowerCase() !== account.email.toLowerCase()) {
      console.error(`❌ Mismatch: Email akun di Cloud (${userRecord.email}) tidak sesuai dengan target (${account.email}).`);
      return false;
    }
  } catch (err) {
    console.error(`❌ Gagal mengambil data akun dari Firebase: ${err.message}`);
    return false;
  }

  // Input password baru secara aman
  let newPassword = '';
  while (true) {
    newPassword = await askPasswordMasked(`Masukkan password baru untuk ${account.name} (min. 6 karakter): `);
    
    if (newPassword.length < 6) {
      console.log('⚠️  Password terlalu pendek. Firebase Authentication mewajibkan minimal 6 karakter.');
      continue;
    }

    const confirmPassword = await askPasswordMasked(`Ulangi password baru untuk konfirmasi: `);
    if (newPassword !== confirmPassword) {
      console.log('⚠️  Konfirmasi password tidak cocok. Silakan coba lagi.\n');
      continue;
    }

    break;
  }

  // Update password ke Firebase Authentication
  try {
    process.stdout.write(`Mengirim pembaruan password untuk ${account.name}... `);
    await auth.updateUser(account.uid, {
      password: newPassword
    });

    // Bersihkan variabel password dari memori
    newPassword = null;

    console.log(`\n✅ BERHASIL: Password akun ${account.name} (${account.email}) telah berhasil diperbarui!`);
    return true;
  } catch (err) {
    newPassword = null;
    console.error(`\n❌ GAGAL: Tidak dapat memperbarui password ${account.name}: ${err.message}`);
    return false;
  }
}

// Menu Navigasi Utama
async function run() {
  console.log('===============================================================');
  console.log('   PEMBARUAN PASSWORD KARAKTER — OUR LITTLE UNIVERSE');
  console.log('   Target Project: our-little-universe-dcd75');
  console.log('===============================================================\n');

  console.log('Pilih akun yang ingin diperbarui password-nya:');
  console.log('1. Nyanya ⭐ (nyanya@ourlittleuniverse.com)');
  console.log('2. Lala   ☀️ (lala@ourlittleuniverse.com)');
  console.log('3. Lele   🌙 (lele@ourlittleuniverse.com)');
  console.log('4. Perbarui ketiga akun sekaligus (bergantian)');
  console.log('0. Batal / Keluar\n');

  const choice = await askText('Masukkan pilihan [0-4]: ');

  if (choice === '1') {
    await updateSingleAccountPassword(CHARACTERS[0]);
  } else if (choice === '2') {
    await updateSingleAccountPassword(CHARACTERS[1]);
  } else if (choice === '3') {
    await updateSingleAccountPassword(CHARACTERS[2]);
  } else if (choice === '4') {
    console.log('\n--- Mode Pembaruan Ketiga Akun Sekaligus ---');
    for (const char of CHARACTERS) {
      await updateSingleAccountPassword(char);
    }
  } else {
    console.log('\nOperasi dibatalkan. Tidak ada perubahan yang dilakukan.');
    process.exit(0);
  }

  console.log('\n===============================================================');
  console.log('   SELESAI: Proses pembaruan password telah rampung.');
  console.log('===============================================================\n');
}

run().catch((err) => {
  console.error('\nTerjadi kesalahan fatal:', err);
  process.exit(1);
});

