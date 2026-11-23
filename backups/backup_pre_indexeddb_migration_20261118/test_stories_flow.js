/**
 * TEST SUITE: STORY & OUR STORIES OWNERSHIP & PER-ACCOUNT ISOLATION
 *
 * Verifies:
 * 1. Clean unauthenticated initial state (no default fallback to 'nyanya').
 * 2. Strict UID & character ownership binding for Nyanya (KIDULT), Lala (TO YOU), and Lele (SHADOW).
 * 3. Strict per-account separation across Our Stories, Karya Saya, Reading Mode, Bookmarks, and Progress.
 * 4. Security & access control: rejecting mismatched actors, spoofed UIDs, and cross-account mutations.
 * 5. Logout & re-login isolation across UID-scoped localStorage partitions.
 * 6. Firestore document normalization (authorUid/authorChar -> authorId/universeId/universeName).
 * 7. Unpublish workflow, filtering, search, reading preferences, and word stats.
 */

import {
  CHARACTERS_STORIES,
  createStory,
  updateStory,
  deleteStory,
  publishStory,
  unpublishStory,
  getPublishedStories,
  getAuthorStories,
  getStoryById,
  getReadingHistory,
  toggleBookmark,
  isStoryBookmarked,
  saveReadingProgress,
  getReadingProgress,
  getReadingPreferences,
  saveReadingPreferences,
  resetStoriesStore,
  setActiveUserCharacter,
  getActiveUserCharacter,
  getActiveUserUid,
  isStoryOwnedBy,
  calculateStoryStats
} from './stories.js';
import { normalizeStoryDocument } from './firebase.js';

function createMemoryStorage() {
  const store = {};
  return {
    getItem(k) { return Object.prototype.hasOwnProperty.call(store, k) ? store[k] : null; },
    setItem(k, v) { store[k] = String(v); },
    removeItem(k) { delete store[k]; },
    clear() { Object.keys(store).forEach((k) => delete store[k]); }
  };
}

if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = createMemoryStorage();
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('1. TEST: SETUP & INITIAL STATE TANPA DEFAULT FALLBACK NYANYA');
console.log('================================================================');
resetStoriesStore();
setActiveUserCharacter(null);
assert(getActiveUserCharacter() === null, 'Default awal karakter aktif bernilai null (tidak fallback ke nyanya)');
assert(getActiveUserUid() === null, 'Default awal UID aktif bernilai null saat belum login');
assert(getPublishedStories().length === 0, 'Our Stories kosong saat belum ada user aktif');

console.log('\n================================================================');
console.log('2. TEST: NYANYA MEMBUAT KARYA DRAFT & MEMUBLIKASIKAN DI KIDULT');
console.log('================================================================');
setActiveUserCharacter('nyanya');
assert(getActiveUserUid() === CHARACTERS_STORIES.nyanya.uid, 'UID aktif cocok dengan UID Nyanya');

const nyanyaDraftRes = createStory({
  title: 'Catatan Senja di Atap Menara Lavender',
  subtitle: 'Kisah tentang lentera dan rindu di langit KIDULT',
  category: 'puisi',
  genre: 'Puisi & Renungan',
  synopsis: 'Kumpulan bait reflektif tentang hangatnya persahabatan di bawah langit senja.',
  content: '<p>Di atas menara lavender yang tenang,</p><p>cahaya senja menyapa seperti pelukan lama.</p>',
  status: 'draft',
  actor: 'nyanya'
});

assert(nyanyaDraftRes.success === true, 'Karya baru Nyanya berhasil dibuat');
assert(nyanyaDraftRes.story.authorUid === CHARACTERS_STORIES.nyanya.uid, 'authorUid tercatat sebagai UID Nyanya');
assert(nyanyaDraftRes.story.authorId === 'nyanya' && nyanyaDraftRes.story.authorChar === 'nyanya', 'Author tercatat sebagai nyanya');
assert(nyanyaDraftRes.story.universeId === 'kidult' && nyanyaDraftRes.story.universeName === 'KIDULT', 'Universe asal tercatat sebagai KIDULT');

// Draft tidak boleh muncul di daftar published bahkan untuk Nyanya
assert(getPublishedStories().length === 0, 'Our Stories tetap kosong sebelum dipublikasikan');
assert(getAuthorStories('nyanya', 'draft').length === 1, 'Nyanya memiliki 1 draft di ruang pribadinya');

// Lala dan Lele ditolak mengakses draft Nyanya
assert(getStoryById(nyanyaDraftRes.story.id, 'lala') === null, 'Lala DITOLAK mengakses draft Nyanya');
assert(getStoryById(nyanyaDraftRes.story.id, 'lele') === null, 'Lele DITOLAK mengakses draft Nyanya');

const publishNyanyaRes = publishStory(nyanyaDraftRes.story.id, 'nyanya');
assert(publishNyanyaRes.success === true, 'Karya Nyanya berhasil dipublikasikan');
assert(getPublishedStories().length === 1, 'Nyanya melihat 1 karya published miliknya sendiri');

console.log('\n================================================================');
console.log('3. TEST: PRIVASI DRAFT — DRAFT NYANYA TIDAK BOCOR KE LALA & LELE');
console.log('================================================================');
// Unpublish sementara untuk menguji isolasi draft murni
unpublishStory(nyanyaDraftRes.story.id, 'nyanya');

setActiveUserCharacter('lala');
assert(getActiveUserUid() === CHARACTERS_STORIES.lala.uid, 'UID aktif cocok dengan UID Lala');
assert(getPublishedStories().length === 0, 'Our Stories Lala kosong saat karya Nyanya berstatus draft');
assert(getAuthorStories('lala').length === 0, 'Karya Saya Lala kosong');
assert(getStoryById(nyanyaDraftRes.story.id, 'lala') === null, 'Lala DITOLAK membaca draft milik Nyanya');

setActiveUserCharacter('lele');
assert(getActiveUserUid() === CHARACTERS_STORIES.lele.uid, 'UID aktif cocok dengan UID Lele');
assert(getPublishedStories().length === 0, 'Our Stories Lele kosong saat karya Nyanya berstatus draft');
assert(getAuthorStories('lele').length === 0, 'Karya Saya Lele kosong');
assert(getStoryById(nyanyaDraftRes.story.id, 'lele') === null, 'Lele DITOLAK membaca draft milik Nyanya');

// Publikasikan kembali karya Nyanya
setActiveUserCharacter('nyanya');
publishStory(nyanyaDraftRes.story.id, 'nyanya');

console.log('\n================================================================');
console.log('4. TEST: LALA MEMBUAT & MEMUBLIKASIKAN CERITA DI TO YOU');
console.log('================================================================');
setActiveUserCharacter('lala');
const lalaNovelRes = createStory({
  title: 'Matahari di Ujung Hutan Peri',
  subtitle: 'Langkah-langkah kecil menuju esok hari yang lebih hangat',
  category: 'novel',
  genre: 'Fantasi Kosmik',
  synopsis: 'Petualangan seorang peri yang mengumpulkan butir embun berkilau untuk menerangi malam.',
  content: '<p>Bab 1: Cahaya Pertama di Ranting Villa.</p><p>Ketika fajar menyingsing di pulau TO YOU, embun pagi bernyanyi riang.</p>',
  status: 'published',
  actor: 'lala'
});

assert(lalaNovelRes.success === true, 'Lala berhasil membuat dan memublikasikan novel');
assert(lalaNovelRes.story.authorUid === CHARACTERS_STORIES.lala.uid, 'authorUid karya Lala tercatat dengan UID Lala');
assert(lalaNovelRes.story.universeName === 'TO YOU', 'Universe karya Lala tercatat TO YOU');
assert(getAuthorStories('lala').length === 1 && getAuthorStories('lala')[0].id === lalaNovelRes.story.id, 'Karya Saya Lala hanya menampilkan karya milik Lala');

console.log('\n================================================================');
console.log('5. TEST: LELE MEMBUAT DUA CERITA ("Seandainya" & CERPEN SHADOW)');
console.log('================================================================');
setActiveUserCharacter('lele');
const leleStory1Res = createStory({
  title: 'Seandainya',
  subtitle: 'Monolog di bawah lentera gazebo',
  category: 'cerpen',
  genre: 'Drama Reflektif',
  synopsis: 'Tentang malam sunyi di taman hydrangea SHADOW.',
  content: '<p>Seandainya malam tidak pernah tergesa berlalu.</p>',
  status: 'published',
  actor: 'lele'
});

const leleStory2Res = createStory({
  title: 'Observatorium Cincin Malam',
  subtitle: 'Kisah penjaga bayangan dan kristal waktu',
  category: 'cerpen',
  genre: 'Misteri & Petualangan',
  synopsis: 'Di menara kastel SHADOW, sebuah telegram bintang tiba dari galaksi seberang.',
  content: '<p>Malam selalu menyimpan kejujuran yang sunyi.</p>',
  status: 'published',
  actor: 'lele'
});

assert(leleStory1Res.success === true && leleStory2Res.success === true, 'Lele berhasil membuat 2 cerita');
assert(leleStory1Res.story.authorUid === CHARACTERS_STORIES.lele.uid, 'Cerita "Seandainya" terikat ke UID Lele');
assert(leleStory1Res.story.authorName === 'Lele' && leleStory1Res.story.universeName === 'SHADOW', 'Metadata penulis cerita Lele tercatat "Lele" / "SHADOW"');

const lelePublished = getPublishedStories({ universe: 'shadow' });
assert(lelePublished.length === 2, 'Filter universe SHADOW menampilkan tepat 2 cerita milik Lele');
assert(lelePublished.every((s) => isStoryOwnedBy(s, 'lele')), 'Seluruh cerita di universe SHADOW benar-benar dimiliki oleh UID Lele');
assert(getAuthorStories('lele').length === 2, 'Karya Saya Lele menampilkan 2 cerita milik Lele');

// Pastikan di Our Stories publik, semua cerita Published dapat dibaca
setActiveUserCharacter('nyanya');
const nyanyaPublished = getPublishedStories();
assert(nyanyaPublished.length === 4, 'Our Stories publik memuat seluruh karya published');
assert(getStoryById(leleStory1Res.story.id, 'nyanya') !== null, 'Nyanya DAPAT membaca cerita published "Seandainya" milik Lele');

setActiveUserCharacter('lala');
const lalaPublished = getPublishedStories();
assert(lalaPublished.length === 4, 'Our Stories publik memuat seluruh karya published untuk Lala');
assert(getStoryById(leleStory1Res.story.id, 'lala') !== null, 'Lala DAPAT membaca cerita published "Seandainya" milik Lele');

console.log('\n================================================================');
console.log('6. TEST: HYDRATION DATA FIRESTORE (TANPA FALLBACK NYANYA)');
console.log('================================================================');
const rawFirestoreLeleStory = {
  id: 'story-lele-1794500000000-abc12',
  title: 'Seandainya',
  subtitle: 'Versi Firestore',
  synopsis: 'Sinopsis dari Firestore',
  content: '<p>Isi cerita dari cloud.</p>',
  category: 'cerpen',
  genre: 'Drama Reflektif',
  status: 'published',
  authorUid: CHARACTERS_STORIES.lele.uid,
  authorChar: 'lele',
  authorName: 'Lele',
  createdAt: '2026-11-12T03:00:00.000Z',
  updatedAt: '2026-11-12T03:00:00.000Z',
  publishedAt: '2026-11-12T03:00:00.000Z'
};
const hydratedLele = normalizeStoryDocument(rawFirestoreLeleStory);
assert(hydratedLele.authorId === 'lele' && hydratedLele.authorChar === 'lele', 'Hydration Firestore mengisi authorId=lele dari authorUid/authorChar');
assert(hydratedLele.universeId === 'shadow' && hydratedLele.universeName === 'SHADOW', 'Hydration Firestore mengisi universeId=shadow dan universeName=SHADOW');
assert(hydratedLele.authorRole === 'The Eclipse Guardian', 'Hydration Firestore mengisi role Lele dengan benar');
assert(isStoryOwnedBy(hydratedLele, 'nyanya') === false, 'Dokumen Firestore Lele TIDAK dianggap milik Nyanya');
assert(isStoryOwnedBy(hydratedLele, 'lele') === true, 'Dokumen Firestore Lele valid dimiliki oleh Lele');

console.log('\n================================================================');
console.log('7. TEST: FILTERING & PENCARIAN DALAM AKUN LELE');
console.log('================================================================');
setActiveUserCharacter('lele');
const searchSeandainya = getPublishedStories({ searchQuery: 'seandainya' });
assert(searchSeandainya.length === 1 && searchSeandainya[0].authorId === 'lele', 'Pencarian "seandainya" menemukan karya milik Lele');

const filterShadow = getPublishedStories({ universe: 'shadow' });
assert(filterShadow.length === 2, 'Filter universe SHADOW mengembalikan kedua karya Lele');

const filterKidultOnLele = getPublishedStories({ universe: 'kidult' });
assert(filterKidultOnLele.length === 1 && filterKidultOnLele[0].authorId === 'nyanya', 'Filter KIDULT di Our Stories menampilkan karya published Nyanya');

console.log('\n================================================================');
console.log('8. TEST: OTORISASI & KEAMANAN AKSES');
console.log('================================================================');
// Dari sesi Lele, karya Nyanya tidak dimuat di store Lele -> otomatis ditolak
const leleTriesEditNyanyaIsolated = updateStory(nyanyaDraftRes.story.id, { title: 'Judul Palsu oleh Lele' }, 'lele');
assert(leleTriesEditNyanyaIsolated.success === false, 'Dari sesi Lele, karya Nyanya tidak dapat disentuh');

// Bahkan ketika store Nyanya sedang aktif di memori, aktor Lele/Lala tetap DITOLAK oleh otorisasi pemilik
setActiveUserCharacter('nyanya');
const leleTriesEditNyanya = updateStory(nyanyaDraftRes.story.id, { title: 'Judul Palsu oleh Lele' }, 'lele');
assert(leleTriesEditNyanya.success === false && leleTriesEditNyanya.error.includes('Akses ditolak'), 'Lele DITOLAK mengedit karya Nyanya');

const lalaTriesDeleteNyanya = deleteStory(nyanyaDraftRes.story.id, 'lala');
assert(lalaTriesDeleteNyanya.success === false && lalaTriesDeleteNyanya.error.includes('Akses ditolak'), 'Lala DITOLAK menghapus karya Nyanya');

// Mismatched actor / spoofed UID saat membuat cerita -> DITOLAK
const spoofActorCreate = createStory({
  title: 'Percobaan Spoof',
  content: '<p>Harus ditolak.</p>',
  status: 'published',
  actor: 'lele'
});
assert(spoofActorCreate.success === false, 'Membuat cerita atas nama karakter lain saat login Nyanya DITOLAK');

// Pemilik asli (Nyanya) diizinkan mengedit dan unpublish karyanya sendiri
const nyanyaEditsOwn = updateStory(nyanyaDraftRes.story.id, { title: 'Catatan Senja di Atap Menara Lavender (Edisi Khusus)' }, 'nyanya');
assert(nyanyaEditsOwn.success === true && nyanyaEditsOwn.story.title.includes('Edisi Khusus'), 'Nyanya DIIZINKAN mengedit karyanya sendiri');

const unpublishRes = unpublishStory(nyanyaDraftRes.story.id, 'nyanya');
assert(unpublishRes.success === true && unpublishRes.story.status === 'draft', 'Nyanya DIIZINKAN unpublish karyanya sendiri');
assert(getPublishedStories().some((s) => s.id === nyanyaDraftRes.story.id) === false, 'Karya yang di-unpublish hilang dari daftar published');

// Publish kembali agar siap diuji saat logout -> re-login
publishStory(nyanyaDraftRes.story.id, 'nyanya');

console.log('\n================================================================');
console.log('9. TEST: LOGOUT & LOGIN ULANG (PARTISI LOCALSTORAGE PER UID)');
console.log('================================================================');
setActiveUserCharacter(null);
assert(getActiveUserCharacter() === null, 'Logout membersihkan karakter aktif menjadi null');
assert(getPublishedStories().length === 0, 'Setelah logout, daftar cerita kosong dan tidak bocor');
assert(getAuthorStories('lele').length === 0, 'Saat logout, Karya Saya juga terkunci kosong');

// Login ulang sebagai Lele -> Karya Saya Lele memuat 2 cerita
setActiveUserCharacter('lele');
const leleAfterRelogin = getAuthorStories('lele');
assert(leleAfterRelogin.length === 2 && leleAfterRelogin.every((s) => s.authorId === 'lele'), 'Login ulang sebagai Lele memuat tepat 2 cerita milik Lele di Karya Saya');

// Login ulang sebagai Lala -> Karya Saya Lala memuat 1 cerita
setActiveUserCharacter('lala');
const lalaAfterRelogin = getAuthorStories('lala');
assert(lalaAfterRelogin.length === 1 && lalaAfterRelogin[0].authorId === 'lala', 'Login ulang sebagai Lala memuat tepat 1 cerita milik Lala di Karya Saya');

// Login ulang sebagai Nyanya -> Karya Saya Nyanya memuat 1 cerita
setActiveUserCharacter('nyanya');
const nyanyaAfterRelogin = getAuthorStories('nyanya');
assert(nyanyaAfterRelogin.length === 1 && nyanyaAfterRelogin[0].authorId === 'nyanya', 'Login ulang sebagai Nyanya memuat tepat 1 cerita milik Nyanya di Karya Saya');

console.log('\n================================================================');
console.log('10. TEST: BOOKMARK, READING HISTORY, & READING PROGRESS TERISOLASI');
console.log('================================================================');
setActiveUserCharacter('lele');
const leleBookmarkRes = toggleBookmark(leleStory1Res.story.id, 'lele');
assert(leleBookmarkRes.isBookmarked === true && isStoryBookmarked(leleStory1Res.story.id, 'lele') === true, 'Lele dapat membookmark ceritanya sendiri');

// Lala membookmark cerita published milik Lele (tersimpan di profil Lala sendiri, tidak mencampuri Lele)
setActiveUserCharacter('lala');
const lalaCrossBookmark = toggleBookmark(leleStory1Res.story.id, 'lala');
assert(lalaCrossBookmark.isBookmarked === true, 'Lala dapat membookmark karya published Lele');
assert(isStoryBookmarked(leleStory1Res.story.id, 'lala') === true, 'Bookmark tersimpan di akun Lala');
assert(isStoryBookmarked(leleStory2Res.story.id, 'lala') === false, 'Cerita lain Lele yang tidak dibookmark Lala tetap false');

saveReadingProgress(leleStory1Res.story.id, 65, 0.65, 'lele');
const leleProgress = getReadingProgress(leleStory1Res.story.id, 'lele');
assert(leleProgress && leleProgress.percent === 65, 'Progress membaca tersimpan untuk cerita milik sendiri');

const leleHistory = getReadingHistory('lele');
assert(leleHistory.length === 1 && leleHistory[0].story.id === leleStory1Res.story.id, 'Reading history Lele hanya memuat cerita milik Lele');

setActiveUserCharacter('nyanya');
assert(getReadingHistory('nyanya').length === 0, 'Reading history Nyanya tidak tercampur dengan history Lele');

console.log('\n================================================================');
console.log('11. TEST: READING PREFERENCES & STATISTIK KATA');
console.log('================================================================');
const savedPrefs = saveReadingPreferences({
  fontSize: 'large',
  fontFamily: 'serif',
  lineHeight: 'relaxed',
  readingWidth: 'narrow',
  theme: 'sepia'
});
assert(savedPrefs.fontSize === 'large' && savedPrefs.theme === 'sepia', 'Preferensi membaca tersimpan dengan benar');

const stats = calculateStoryStats('Satu dua tiga empat lima enam tujuh delapan sembilan sepuluh.');
assert(stats.wordCount === 10 && stats.readingTimeMinutes >= 1, 'Perhitungan jumlah kata & estimasi waktu baca akurat');

console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passed}/${passed + failed} PENGUJIAN BERHASIL (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('================================================================');

if (failed === 0) {
  console.log('\n✨ SEMUA PENGUJIAN KEPEMILIKAN & ISOLASI OUR STORIES BERHASIL 100%! ✨\n');
  process.exit(0);
} else {
  console.error(`\n❌ TERDAPAT ${failed} PENGUJIAN YANG GAGAL!\n`);
  process.exit(1);
}
