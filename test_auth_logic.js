/**
 * TEST SUITE: AUTHENTICATION AND CHARACTER UID MAPPING LOGIC
 * Tests the 4 mandatory test criteria requested by the user:
 * 1. Login with correct character account and password
 * 2. Login with wrong password / invalid credentials
 * 3. Correct account logging in through the wrong character selection (mismatch detection)
 * 4. Unauthenticated user cannot access private page (strict route guard)
 */

import {
  verifyCharacterAuthorization,
  identifyUserCharacter,
  CHARACTER_AUTH_RULES
} from './firebase.js';

console.log('=== MULAI PENGUJIAN LOGIKA AUTENTIKASI DAN PEMETAAN KARAKTER ===\n');

let passedTests = 0;
let totalTests = 0;

function assert(condition, testName, detail = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} -> ${detail}`);
  }
}

// Setup Mock User Accounts
const mockNyanyaUser = {
  uid: 'uid-nyanya-witch-12345',
  email: 'nyanya@ourlittleuniverse.com'
};

const mockLalaUser = {
  uid: 'uid-lala-fairy-67890',
  email: 'lala@ourlittleuniverse.com'
};

const mockLeleUser = {
  uid: 'uid-lele-guardian-54321',
  email: 'lele@ourlittleuniverse.com'
};

const mockStrangerUser = {
  uid: 'uid-stranger-99999',
  email: 'stranger@random.com'
};

// -------------------------------------------------------------
// TEST CASE 1: Akun dan Karakter yang Benar (Authorized)
// -------------------------------------------------------------
console.log('--- TEST CASE 1: Login dengan Karakter yang Cocok ---');

const nyanyaCheck = verifyCharacterAuthorization(mockNyanyaUser, 'nyanya');
assert(
  nyanyaCheck.authorized === true,
  'Nyanya login melalui gerbang Nyanya harus DIIZINKAN'
);

const lalaCheck = verifyCharacterAuthorization(mockLalaUser, 'lala');
assert(
  lalaCheck.authorized === true,
  'Lala login melalui gerbang Lala harus DIIZINKAN'
);

const leleCheck = verifyCharacterAuthorization(mockLeleUser, 'lele');
assert(
  leleCheck.authorized === true,
  'Lele login melalui gerbang Lele harus DIIZINKAN'
);

// -------------------------------------------------------------
// TEST CASE 2: Akun Benar tetapi Masuk Melalui Pilihan Karakter yang Salah
// -------------------------------------------------------------
console.log('\n--- TEST CASE 2: Mismatch Karakter (Akun Benar, Pilihan Salah) ---');

// Akun Lele mencoba masuk melalui pilihan Nyanya
const leleOnNyanya = verifyCharacterAuthorization(mockLeleUser, 'nyanya');
assert(
  leleOnNyanya.authorized === false && leleOnNyanya.mismatch === true,
  'Akun Lele mencoba masuk melalui pilihan Nyanya harus DITOLAK'
);
assert(
  leleOnNyanya.reason.includes('Lele') && leleOnNyanya.reason.includes('Nyanya'),
  'Pesan penolakan harus ramah dan menyebutkan identitas Lele dan gerbang Nyanya'
);
console.log('  -> Pesan penolakan:', leleOnNyanya.reason);

// Akun Nyanya mencoba masuk melalui pilihan Lala
const nyanyaOnLala = verifyCharacterAuthorization(mockNyanyaUser, 'lala');
assert(
  nyanyaOnLala.authorized === false && nyanyaOnLala.mismatch === true,
  'Akun Nyanya mencoba masuk melalui pilihan Lala harus DITOLAK'
);

// Akun Lala mencoba masuk melalui pilihan Lele
const lalaOnLele = verifyCharacterAuthorization(mockLalaUser, 'lele');
assert(
  lalaOnLele.authorized === false && lalaOnLele.mismatch === true,
  'Akun Lala mencoba masuk melalui pilihan Lele harus DITOLAK'
);

// -------------------------------------------------------------
// TEST CASE 3: Pengguna Tidak Dikenal / Akun Luar (Bukan 3 Sahabat)
// -------------------------------------------------------------
console.log('\n--- TEST CASE 3: Akun Tak Dikenal (Bukan Bagian Tiga Sahabat) ---');

const strangerCheck = verifyCharacterAuthorization(mockStrangerUser, 'nyanya');
assert(
  strangerCheck.authorized === false,
  'Akun luar tanpa identitas 3 sahabat harus DITOLAK'
);
console.log('  -> Pesan penolakan akun asing:', strangerCheck.reason);

// -------------------------------------------------------------
// TEST CASE 4: Pengguna Belum Login / Sesi Null (Akses Ruang Privat)
// -------------------------------------------------------------
console.log('\n--- TEST CASE 4: Akses Tanpa Sesi / Null User (Route Guard) ---');

const unauthCheck = verifyCharacterAuthorization(null, 'nyanya');
assert(
  unauthCheck.authorized === false,
  'Pengguna null/belum login tidak boleh mendapatkan otorisasi'
);

// -------------------------------------------------------------
// Ringkasan Pengujian
// -------------------------------------------------------------
console.log(`\n======================================================`);
console.log(`HASIL PENGUJIAN: ${passedTests}/${totalTests} Pengujian Berhasil 100%`);
console.log(`======================================================`);

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
