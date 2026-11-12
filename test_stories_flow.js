/**
 * TEST SUITE: STORY & OUR STORIES COMPREHENSIVE VERIFICATION
 * 
 * Verifies:
 * 1. Creation of draft works in Personal Writing Space (Story).
 * 2. Strict isolation: Drafts do not leak into Our Stories.
 * 3. Publishing workflow: Published stories become available to all users across universes.
 * 4. Cross-universe reading: Lala and Lele can read Nyanya's published story.
 * 5. Multi-author publishing: Lala creates novel, Lele creates cerpen.
 * 6. Authorization & Security: Other users cannot edit, delete, or unpublish someone else's work.
 * 7. Unpublish workflow: Story is cleanly removed from Our Stories and returns to draft.
 * 8. Reading progress and bookmark persistence.
 * 9. Reading customization preferences (size, font, spacing, width, theme).
 * 10. Search by title/author, category and genre filtering, and browse by universe.
 */

import {
  createStory,
  updateStory,
  deleteStory,
  publishStory,
  unpublishStory,
  getPublishedStories,
  getAuthorStories,
  getStoryById,
  toggleBookmark,
  isStoryBookmarked,
  saveReadingProgress,
  getReadingProgress,
  getReadingPreferences,
  saveReadingPreferences,
  resetStoriesStore,
  setActiveUserCharacter,
  calculateStoryStats
} from './stories.js';

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
console.log('1. TEST: SETUP & REINITIALIZATION');
console.log('================================================================');
resetStoriesStore();
assert(getPublishedStories().length === 0, 'Our Stories diawali dengan state bersih (kosong/empty state)');

console.log('\n================================================================');
console.log('2. TEST: NYANYA MEMBUAT KARYA DRAFT (PERSONAL WRITING SPACE)');
console.log('================================================================');
setActiveUserCharacter('nyanya');

const draftRes = createStory({
  title: 'Catatan Senja di Atap Menara Lavender',
  subtitle: 'Kisah tentang lentera dan rindu di langit KIDULT',
  category: 'puisi',
  genre: 'Puisi & Renungan',
  synopsis: 'Kumpulan bait reflektif tentang hangatnya persahabatan di bawah langit senja.',
  content: '<p>Di atas menara lavender yang tenang,</p><p>cahaya senja menyapa seperti pelukan lama.</p>',
  status: 'draft',
  actor: 'nyanya'
});

assert(draftRes.success === true, 'Karya baru Nyanya berhasil dibuat');
assert(draftRes.story.status === 'draft', 'Status karya tercatat sebagai "draft"');
assert(draftRes.story.authorId === 'nyanya', 'Penulis karya tercatat sebagai "nyanya"');
assert(draftRes.story.universeName === 'KIDULT', 'Universe asal tercatat sebagai "KIDULT"');

const nyanyaDrafts = getAuthorStories('nyanya', 'draft');
assert(nyanyaDrafts.length === 1, 'Nyanya memiliki 1 draft di ruang pribadinya');

console.log('\n================================================================');
console.log('3. TEST: DRAFT NYANYA TIDAK MUNCUL DI OUR STORIES (ISOLASI DRAFT)');
console.log('================================================================');
const publicStoriesBeforePublish = getPublishedStories();
assert(publicStoriesBeforePublish.length === 0, 'Our Stories tetap kosong, draft Nyanya TIDAK bocor ke publik');

// Lala dan Lele mencoba mengakses ID draft Nyanya
const lalaAccessDraft = getStoryById(draftRes.story.id, 'lala');
const leleAccessDraft = getStoryById(draftRes.story.id, 'lele');
assert(lalaAccessDraft === null, 'Lala DITOLAK saat mencoba mengakses draft karya Nyanya');
assert(leleAccessDraft === null, 'Lele DITOLAK saat mencoba mengakses draft karya Nyanya');

// Namun Nyanya sendiri dapat mengakses draft miliknya
const nyanyaAccessDraft = getStoryById(draftRes.story.id, 'nyanya');
assert(nyanyaAccessDraft !== null, 'Nyanya sendiri DIIZINKAN membuka dan melanjutkan draft miliknya');

console.log('\n================================================================');
console.log('4. TEST: NYANYA MEMUBLIKASIKAN KARYA KE OUR STORIES');
console.log('================================================================');
const publishRes = publishStory(draftRes.story.id, 'nyanya');
assert(publishRes.success === true, 'Karya Nyanya berhasil dipublikasikan');
assert(publishRes.story.status === 'published', 'Status karya berubah menjadi "published"');
assert(publishRes.story.publishedAt !== null, 'Timestamp publikasi berhasil dicatat');

const publicStoriesAfterPublish = getPublishedStories();
assert(publicStoriesAfterPublish.length === 1, 'Our Stories kini menampilkan 1 karya yang dipublikasikan');
assert(publicStoriesAfterPublish[0].title === 'Catatan Senja di Atap Menara Lavender', 'Judul karya publik cocok');

console.log('\n================================================================');
console.log('5. TEST: LALA & LELE MEMBACA KARYA NYANYA LINTAS UNIVERSE');
console.log('================================================================');
setActiveUserCharacter('lala');
const lalaReadsNyanya = getStoryById(draftRes.story.id, 'lala');
assert(lalaReadsNyanya !== null, 'Lala dari TO YOU dapat membaca karya Nyanya yang dipublikasikan');
assert(lalaReadsNyanya.authorName === 'Nyanya', 'Nama penulis Nyanya terbaca dengan benar oleh Lala');
assert(lalaReadsNyanya.universeName === 'KIDULT', 'Universe asal KIDULT terbaca dengan benar oleh Lala');

setActiveUserCharacter('lele');
const leleReadsNyanya = getStoryById(draftRes.story.id, 'lele');
assert(leleReadsNyanya !== null, 'Lele dari SHADOW dapat membaca karya Nyanya yang dipublikasikan');

console.log('\n================================================================');
console.log('6. TEST: LALA MEMBUAT NOVEL & MEMUBLIKASIKAN KE OUR STORIES');
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

assert(lalaNovelRes.success === true, 'Lala berhasil membuat novel');
assert(lalaNovelRes.story.authorId === 'lala', 'Author karya Lala tercatat "lala"');
assert(lalaNovelRes.story.universeName === 'TO YOU', 'Universe karya Lala tercatat "TO YOU"');

// Periksa Our Stories kini memiliki 2 karya
const allPublishedAfterLala = getPublishedStories();
assert(allPublishedAfterLala.length === 2, 'Our Stories kini menampung 2 karya dari dua universe berbeda');

console.log('\n================================================================');
console.log('7. TEST: LELE MEMBUAT CERPEN & MEMUBLIKASIKAN KE OUR STORIES');
console.log('================================================================');
setActiveUserCharacter('lele');

const leleCerpenRes = createStory({
  title: 'Observatorium Cincin Malam',
  subtitle: 'Kisah penjaga bayangan dan kristal waktu',
  category: 'cerpen',
  genre: 'Misteri & Petualangan',
  synopsis: 'Di menara kastel SHADOW, sebuah telegram bintang tiba dari galaksi seberang.',
  content: '<p>Malam selalu menyimpan kejujuran yang sunyi.</p><p>Dari teleskop kristal, Lele mengamati tiga bintang sejajar.</p>',
  status: 'published',
  actor: 'lele'
});

assert(leleCerpenRes.success === true, 'Lele berhasil membuat cerpen');
assert(getPublishedStories().length === 3, 'Our Stories kini lengkap menampung 3 karya dari 3 universe (KIDULT, TO YOU, SHADOW)');

console.log('\n================================================================');
console.log('8. TEST: FILTERING & SEARCH DI OUR STORIES');
console.log('================================================================');
// Filter category
const poetryOnly = getPublishedStories({ category: 'puisi' });
assert(poetryOnly.length === 1 && poetryOnly[0].title === 'Catatan Senja di Atap Menara Lavender', 'Filter kategori "puisi" hanya menampilkan karya Nyanya');

const novelOnly = getPublishedStories({ category: 'novel' });
assert(novelOnly.length === 1 && novelOnly[0].title === 'Matahari di Ujung Hutan Peri', 'Filter kategori "novel" hanya menampilkan karya Lala');

// Filter Universe
const kidultOnly = getPublishedStories({ universe: 'kidult' });
assert(kidultOnly.length === 1 && kidultOnly[0].universeName === 'KIDULT', 'Browse by Universe KIDULT hanya menampilkan karya dari KIDULT');

const toYouOnly = getPublishedStories({ universe: 'to_you' });
assert(toYouOnly.length === 1 && toYouOnly[0].universeName === 'TO YOU', 'Browse by Universe TO YOU hanya menampilkan karya dari TO YOU');

// Search query
const searchLala = getPublishedStories({ searchQuery: 'Lala' });
assert(searchLala.length === 1, 'Pencarian dengan kata kunci nama "Lala" berhasil');

const searchObservatorium = getPublishedStories({ searchQuery: 'observatorium' });
assert(searchObservatorium.length === 1 && searchObservatorium[0].authorId === 'lele', 'Pencarian judul "observatorium" menemukan karya Lele');

console.log('\n================================================================');
console.log('9. TEST: OTORISASI & KEAMANAN AKSES (SECURITY ACCESS CONTROL)');
console.log('================================================================');
// Lele mencoba mengedit karya Nyanya -> DITOLAK
const leleTriesEditNyanya = updateStory(draftRes.story.id, { title: 'Judul Palsu oleh Lele' }, 'lele');
assert(leleTriesEditNyanya.success === false, 'Percobaan Lele mengedit karya Nyanya DITOLAK secara ketat');
assert(leleTriesEditNyanya.error.includes('Akses ditolak'), 'Pesan penolakan otorisasi jelas');

// Lala mencoba menghapus karya Nyanya -> DITOLAK
const lalaTriesDeleteNyanya = deleteStory(draftRes.story.id, 'lala');
assert(lalaTriesDeleteNyanya.success === false, 'Percobaan Lala menghapus karya Nyanya DITOLAK');

// Pemilik asli (Nyanya) DIIZINKAN mengedit karyanya sendiri
setActiveUserCharacter('nyanya');
const nyanyaEditsOwn = updateStory(draftRes.story.id, { title: 'Catatan Senja di Atap Menara Lavender (Edisi Khusus)' }, 'nyanya');
assert(nyanyaEditsOwn.success === true, 'Nyanya DIIZINKAN mengedit karyanya sendiri');
assert(nyanyaEditsOwn.story.title.includes('Edisi Khusus'), 'Pembaruan judul tersimpan dengan benar');

console.log('\n================================================================');
console.log('10. TEST: UNPUBLISH WORKFLOW');
console.log('================================================================');
const unpublishRes = unpublishStory(draftRes.story.id, 'nyanya');
assert(unpublishRes.success === true, 'Karya Nyanya berhasil ditarik (unpublish)');
assert(unpublishRes.story.status === 'draft', 'Status karya kembali menjadi "draft"');

const publicStoriesAfterUnpublish = getPublishedStories();
assert(publicStoriesAfterUnpublish.length === 2, 'Karya Nyanya seketika hilang dari Our Stories');
assert(publicStoriesAfterUnpublish.some((s) => s.id === draftRes.story.id) === false, 'Karya yang ditarik tidak ditemukan di Our Stories');

console.log('\n================================================================');
console.log('11. TEST: BOOKMARKS & READING PROGRESS');
console.log('================================================================');
// Lala membookmark karya Lele
setActiveUserCharacter('lala');
const bookmarkAction = toggleBookmark(leleCerpenRes.story.id, 'lala');
assert(bookmarkAction.isBookmarked === true, 'Lala berhasil membookmark karya Lele');
assert(isStoryBookmarked(leleCerpenRes.story.id, 'lala') === true, 'Status bookmark tersimpan true');

// Lala menyimpan progress membaca (50%, scrollRatio 0.5)
saveReadingProgress(leleCerpenRes.story.id, 50, 0.5, 'lala');
const progress = getReadingProgress(leleCerpenRes.story.id, 'lala');
assert(progress.percent === 50, 'Progress membaca 50% tersimpan untuk karya Lele');

// Filter Our Stories hanya bookmark
const lalaBookmarksOnly = getPublishedStories({ bookmarksOnly: true });
assert(lalaBookmarksOnly.length === 1 && lalaBookmarksOnly[0].id === leleCerpenRes.story.id, 'Filter Bookmark Lala hanya menampilkan karya Lele yang dibookmark');

console.log('\n================================================================');
console.log('12. TEST: READING CUSTOMIZATION PREFERENCES');
console.log('================================================================');
const initialPrefs = getReadingPreferences();
assert(initialPrefs.fontSize !== undefined, 'Preferensi default memiliki fontSize');

const savedPrefs = saveReadingPreferences({
  fontSize: 'large',
  fontFamily: 'serif',
  lineHeight: 'relaxed',
  readingWidth: 'narrow',
  theme: 'sepia'
});

assert(savedPrefs.fontSize === 'large', 'Ukuran font "large" tersimpan');
assert(savedPrefs.theme === 'sepia', 'Tema "sepia" tersimpan');
assert(savedPrefs.lineHeight === 'relaxed', 'Jarak baris "relaxed" tersimpan');

console.log('\n================================================================');
console.log('13. TEST: PERHITUNGAN STATISTIK KATA & WAKTU BACA');
console.log('================================================================');
const stats = calculateStoryStats('Satu dua tiga empat lima enam tujuh delapan sembilan sepuluh.');
assert(stats.wordCount === 10, 'Perhitungan jumlah kata akurat (10 kata)');
assert(stats.readingTimeMinutes >= 1, 'Estimasi waktu membaca minimal 1 menit');

console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passed}/${passed + failed} PENGUJIAN BERHASIL (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('================================================================');

if (failed === 0) {
  console.log('\n✨ SEMUA PENGUJIAN FITUR STORY & OUR STORIES BERHASIL 100%! ✨\n');
  process.exit(0);
} else {
  console.error(`\n❌ TERDAPAT ${failed} PENGUJIAN YANG GAGAL!\n`);
  process.exit(1);
}

