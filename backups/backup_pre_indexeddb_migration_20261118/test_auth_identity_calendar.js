/**
 * COMPREHENSIVE TEST SUITE: AUTHENTICATION, USER IDENTITY & SHARED CALENDAR
 * Verifies all criteria requested for:
 * 1. Navigasi Utama: Menu 📅 Our Calendar
 * 2. Fungsi Kalender Bersama: CRUD, Persistence, Owner Permissions
 * 3. Identitas Pengguna & Hak Akses Universe: Single Source of Truth
 */

import fs from 'fs';
import path from 'path';
import {
  getOrbitEvents,
  addOrbitEvent,
  deleteOrbitEvent,
  updateOrbitEvent,
  setActiveUserCharacter,
  getActiveUserCharacter,
  getEventsForDate,
  navigateCalendar,
  getCurrentDate,
  getSelectedDateStr
} from './orbit.js';

import {
  verifyCharacterAuthorization,
  identifyUserCharacter,
  CHARACTER_AUTH_RULES
} from './firebase.js';

let passed = 0;
let total = 0;

function assert(condition, message, detail = '') {
  total++;
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✕ FAIL: ${message} ${detail ? '-> ' + detail : ''}`);
  }
}

console.log('================================================================');
console.log('1. TEST: HTML INTEGRITY — NAVBAR & CALENDAR ELEMENTS');
console.log('================================================================');

const indexHtml = fs.readFileSync(path.resolve('./index.html'), 'utf-8');

// A. Navbar Calendar Menu Check
assert(
  indexHtml.includes('id="nav-btn-calendar"') && indexHtml.includes('data-nav="calendar"'),
  'Menu "📅 Our Calendar" tersedia di dalam navbar navigasi utama'
);
assert(
  indexHtml.includes('Our Calendar') && indexHtml.includes('📅'),
  'Menu Calendar memiliki label "Our Calendar" dan ikon 📅'
);

// B. Island Access Badges Check
assert(
  indexHtml.includes('island-universe-badge-container'),
  'Tiga kartu pulau universe memiliki container badge akses'
);
assert(
  indexHtml.includes('MY UNIVERSE') && indexHtml.includes('VISIT UNIVERSE'),
  'Badge "MY UNIVERSE" dan "VISIT UNIVERSE" terdaftar di markup kartu universe'
);

// C. Profile Greeting Check (No hardcoded "Hello, Ale")
assert(
  !indexHtml.includes('Hello, Ale'),
  'Markup index.html tidak lagi memiliki teks hardcoded "Hello, Ale"'
);
assert(
  indexHtml.includes('id="univ-user-greeting"'),
  'Elemen sapaan profil univ-user-greeting tersedia'
);

// D. Event Detail Delete Button Check
assert(
  indexHtml.includes('id="btn-delete-event"'),
  'Tombol "Hapus Agenda" tersedia di modal detail kegiatan'
);

// E. Selected Day Events Container Check
assert(
  indexHtml.includes('id="selected-day-events-container"'),
  'Container agenda terpilih/empty-state tersedia di bawah strip kalender'
);

console.log('\n================================================================');
console.log('2. TEST: OUR CALENDAR (ORBIT) — PERSISTENCE & OWNER PERMISSIONS');
console.log('================================================================');

// Set active character to Nyanya
setActiveUserCharacter('nyanya');
assert(getActiveUserCharacter() === 'nyanya', 'Active user perspective diatur ke nyanya');

// A. Add event as Nyanya
const newEvent = addOrbitEvent({
  title: 'Uji Coba Acara Kalender Bersama ✦',
  category: 'together',
  date: '2026-10-24',
  time: '20:00',
  location: 'Sky Lounge',
  description: 'Acara pengujian kalender',
  proposer: 'nyanya'
});

assert(Boolean(newEvent.id), 'Acara baru berhasil dibuat dengan ID unik');
assert(newEvent.proposer === 'nyanya', 'Pembuat acara tercatat sebagai nyanya');

// Verify found in query
const eventsOn24th = getEventsForDate('2026-10-24');
assert(
  eventsOn24th.some(e => e.id === newEvent.id),
  'Acara ditemukan saat pencarian tanggal 2026-10-24'
);

// B. Unauthorized Delete Test (Lala tries to delete Nyanya\'s event)
const unauthorizedDelete = deleteOrbitEvent(newEvent.id, 'lala');
assert(
  unauthorizedDelete.success === false,
  'Pengguna lain (Lala) DITOLAK saat mencoba menghapus acara milik Nyanya'
);
assert(
  unauthorizedDelete.message.includes('Hanya pembuat acara'),
  'Pesan penolakan penghapusan acara jelas dan informatif'
);

// C. Unauthorized Edit Test (Lele tries to update Nyanya\'s event)
const unauthorizedUpdate = updateOrbitEvent(newEvent.id, { title: 'Dibajak' }, 'lele');
assert(
  unauthorizedUpdate.success === false,
  'Pengguna lain (Lele) DITOLAK saat mencoba mengubah acara milik Nyanya'
);

// D. Authorized Update Test (Nyanya updates her own event)
const authorizedUpdate = updateOrbitEvent(newEvent.id, { title: 'Uji Coba Diperbarui ✦' }, 'nyanya');
assert(
  authorizedUpdate.success === true,
  'Pembuat acara (Nyanya) DIIZINKAN memperbarui acaranya sendiri'
);
assert(
  authorizedUpdate.event.title === 'Uji Coba Diperbarui ✦',
  'Judul acara berhasil diperbarui'
);

// E. Authorized Delete Test (Nyanya deletes her own event)
const authorizedDelete = deleteOrbitEvent(newEvent.id, 'nyanya');
assert(
  authorizedDelete.success === true,
  'Pembuat acara (Nyanya) DIIZINKAN menghapus acaranya sendiri'
);
assert(
  !getOrbitEvents().some(e => e.id === newEvent.id),
  'Acara benar-benar terhapus dari daftar kegiatan kalender'
);

// F. Input Validation Test (Empty title should throw)
let validationFailed = false;
try {
  addOrbitEvent({ title: '', date: '2026-10-25' });
} catch (e) {
  validationFailed = true;
}
assert(validationFailed, 'Input acara tanpa judul memicu error validasi');

let dateValidationFailed = false;
try {
  addOrbitEvent({ title: 'Acara Tanpa Tanggal', date: '' });
} catch (e) {
  dateValidationFailed = true;
}
assert(dateValidationFailed, 'Input acara tanpa tanggal memicu error validasi');

console.log('\n================================================================');
console.log('3. TEST: IDENTITY MAPPING & UNIVERSE ROLE-BASED ACCESS');
console.log('================================================================');

// Master Character Profile Expectations
const EXPECTED_PROFILES = {
  nyanya: {
    name: 'Nyanya',
    avatar: '/assets/avatar_nyanya_hd.png',
    greeting: 'Hello, Nyanya',
    myUniverse: 'kidult',
    visitUniverses: ['to_you', 'shadow']
  },
  lala: {
    name: 'Lala',
    avatar: '/assets/avatar_lala_hd.png',
    greeting: 'Hello, Lala',
    myUniverse: 'to_you',
    visitUniverses: ['kidult', 'shadow']
  },
  lele: {
    name: 'Lele',
    avatar: '/assets/avatar_lele_hd.png',
    greeting: 'Hello, Lele',
    myUniverse: 'shadow',
    visitUniverses: ['kidult', 'to_you']
  }
};

Object.entries(EXPECTED_PROFILES).forEach(([charKey, exp]) => {
  console.log(`\n--- Evaluasi Akun: ${exp.name} ---`);

  // Simulate user object
  const mockUser = {
    uid: `uid-${charKey}-123`,
    email: `${charKey}@ourlittleuniverse.com`
  };

  const check = verifyCharacterAuthorization(mockUser, charKey);
  assert(check.authorized === true, `Akun ${charKey} terverifikasi otentik`);
  assert(check.characterConfig.name === exp.name, `Nama karakter adalah ${exp.name}`);
  assert(check.characterConfig.avatar === exp.avatar, `Avatar karakter adalah ${exp.avatar}`);

  // Check Universe Ownership
  const univKey = check.characterConfig.universe.toLowerCase().replace(' ', '_');
  assert(univKey === exp.myUniverse, `Universe milik ${exp.name} adalah ${check.characterConfig.universe} (MY UNIVERSE)`);
});

// Test Authentication Guard: Unauthenticated user cannot enter
const nullUserCheck = verifyCharacterAuthorization(null, 'nyanya');
assert(
  nullUserCheck.authorized === false,
  'Pengguna yang belum login diblokir dari otorisasi (Strict Route Guard)'
);

// Test wrong character gate mismatch
const mismatchCheck = verifyCharacterAuthorization({ uid: 'uid-lele-123', email: 'lele@ourlittleuniverse.com' }, 'nyanya');
assert(
  mismatchCheck.authorized === false && mismatchCheck.mismatch === true,
  'Akun Lele yang mencoba login via gerbang Nyanya ditolak dengan ramah'
);

console.log('\n================================================================');
console.log(`RINGKASAN PENGUJIAN: ${passed}/${total} PENGUJIAN BERHASIL (${Math.round((passed/total)*100)}%)`);
console.log('================================================================');

if (passed === total) {
  console.log('\n✨ SEMUA PENGUJIAN INTEGRITAS NAVIGASI, KALENDER & IDENTITAS BERHASIL 100%! ✨\n');
  process.exit(0);
} else {
  console.error('\n⚠️ TERDAPAT PENGUJIAN YANG GAGAL!\n');
  process.exit(1);
}

