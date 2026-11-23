/**
 * COMPREHENSIVE TEST SUITE: OUR STORIES — AKHIRA (YAWN ⚡) INTEGRATION
 *
 * Verifies:
 * 1. Akhira canonical registration in CHARACTERS_STORIES
 * 2. Akhira reading published stories from all other 7 characters
 * 3. Akhira creating draft in personal writing space
 * 4. Strict draft isolation (draft not leaked to others, not in public library)
 * 5. Akhira continuing & updating draft
 * 6. Akhira publishing story to shared library
 * 7. All other 7 characters reading Akhira's published story
 * 8. Author metadata verification (name, UID, universe YAWN, symbol ⚡)
 * 9. Security guardrails (other characters cannot edit or delete Akhira's work)
 * 10. Akhira modifying or unpublishing own work
 * 11. Universe filter "yawn" returns Akhira's work
 */

import assert from 'assert';
import {
  CHARACTERS_STORIES,
  createStory,
  updateStory,
  deleteStory,
  publishStory,
  unpublishStory,
  getStoryById,
  getPublishedStories,
  getAuthorStories,
  setActiveUserCharacter,
  getActiveUserCharacter,
  getActiveUserUid,
  toggleBookmark,
  isStoryBookmarked,
  calculateStoryStats,
  COVER_THEMES
} from './stories.js';
import { CHARACTER_AUTH_RULES } from './firebase.js';

let passed = 0;
let failed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    -> ${err.message}`);
    failed++;
  }
}

console.log('================================================================');
console.log('1. TEST: AKHIRA CANONICAL REGISTRATION IN CHARACTERS_STORIES');
console.log('================================================================');

it('Akhira terdaftar dengan UID dan Universe YAWN yang tepat', () => {
  const cfg = CHARACTERS_STORIES.akhira;
  assert(cfg, 'Config akhira harus ada');
  assert.strictEqual(cfg.id, 'akhira');
  assert.strictEqual(cfg.name, 'Akhira');
  assert.strictEqual(cfg.universeName, 'YAWN');
  assert.strictEqual(cfg.universeId, 'yawn');
  assert.strictEqual(cfg.symbol, '⚡');
  assert.strictEqual(cfg.uid, 'MT14ZHATNqe90frAeQ74QFk4iXs2');
  assert.strictEqual(cfg.uid, CHARACTER_AUTH_RULES.akhira.expectedUid);
});

it('Tema cover Quiet Abyss (YAWN) terdaftar di COVER_THEMES', () => {
  const abyssTheme = COVER_THEMES.find(t => t.id === 'abyss');
  assert(abyssTheme, 'Cover theme abyss harus terdaftar');
  assert.strictEqual(abyssTheme.badge, '⚡');
});

console.log('\n================================================================');
console.log('2. TEST: PUBLIKASI KARYA DARI 7 KARAKTER LAIN KE PERPUSTAKAAN');
console.log('================================================================');

const otherChars = [
  { key: 'nyanya', name: 'Nyanya', univ: 'KIDULT', title: 'Bayangan Bintang Kidult' },
  { key: 'lala', name: 'Lala', univ: 'TO YOU', title: 'Cahaya Abadi Peri' },
  { key: 'lele', name: 'Lele', univ: 'SHADOW', title: 'Seandainya Sang Gerhana' },
  { key: 'abil', name: 'Syma', univ: 'PINWHEEL', title: 'Angin Putar Pinwheel' },
  { key: 'ela', name: 'Ela', univ: 'US AGAIN', title: 'Bunga Teratai Abadi' },
  { key: 'ruben', name: 'Ruben', univ: 'ASH', title: 'Kristal Abu dan Naga' },
  { key: 'royan', name: 'Royan', univ: 'HOT', title: 'Kembang Api Malam Panas' }
];

const publishedIds = {};

otherChars.forEach(({ key, name, univ, title }) => {
  it(`${name} (${key}) menerbitkan karya ke perpustakaan sastra bersama`, () => {
    setActiveUserCharacter(key);
    const res = createStory({
      title,
      subtitle: `Karya sastra dari alam ${univ}`,
      category: 'cerpen',
      genre: 'Fantasi Kosmik',
      synopsis: `Sinopsis karya dari ${name}`,
      content: `<p>Ini adalah karya sastra resmi milik ${name} di alam ${univ}.</p>`,
      status: 'published',
      actor: key
    });
    assert.strictEqual(res.success, true, 'createStory harus berhasil');
    assert(res.story && res.story.id, 'Story harus memiliki id');
    assert.strictEqual(res.story.status, 'published');
    publishedIds[key] = res.story.id;
  });
});

console.log('\n================================================================');
console.log('3. TEST: AKHIRA MEMBACA KARYA DARI SELURUH 7 KARAKTER LAIN');
console.log('================================================================');

it('Login sebagai Akhira dan verifikasi sesi aktif', () => {
  setActiveUserCharacter('akhira');
  assert.strictEqual(getActiveUserCharacter(), 'akhira');
  assert.strictEqual(getActiveUserUid(), 'MT14ZHATNqe90frAeQ74QFk4iXs2');
});

otherChars.forEach(({ key, name, title }) => {
  it(`Akhira dapat membaca karya "${title}" karya ${name}`, () => {
    setActiveUserCharacter('akhira');
    const storyId = publishedIds[key];
    const story = getStoryById(storyId, 'akhira');
    assert(story, `Story id ${storyId} harus dapat dibaca oleh Akhira`);
    assert.strictEqual(story.title, title);
    assert.strictEqual(story.status, 'published');
    assert(story.content.includes(name), 'Konten cerita harus memuat identitas penulis');
  });
});

it('Perpustakaan publik yang dilihat Akhira memuat semua karya terbit', () => {
  setActiveUserCharacter('akhira');
  const allPub = getPublishedStories({ actor: 'akhira' });
  assert(allPub.length >= 7, 'Semua 7 karya terbit harus terlihat oleh Akhira');
});

console.log('\n================================================================');
console.log('4. TEST: AKHIRA MEMBUAT DRAFT PRIBADI & UJI PRIVASI DRAFT');
console.log('================================================================');

let akhiraDraftId = null;

it('Akhira membuat karya draft pribadi: "Abyss Sanctuary"', () => {
  setActiveUserCharacter('akhira');
  const res = createStory({
    title: 'Abyss Sanctuary: Suara Bawah Laut',
    subtitle: 'Catatan Hening dari Kedalaman Samudra YAWN',
    category: 'sastra',
    genre: 'Puisi & Renungan',
    synopsis: 'Ketika dunia melambat dan samudra memeluk jiwa yang lelah.',
    content: '<p>Di dasar samudra terdalam, di antara pendar ubur-ubur astral dan lambaian paus kosmik, keheningan adalah tempat terbaik untuk beristirahat.</p>',
    coverTheme: 'abyss',
    status: 'draft',
    actor: 'akhira'
  });

  assert.strictEqual(res.success, true, 'Draft harus berhasil dibuat');
  assert(res.story && res.story.id, 'Draft harus memiliki id');
  assert.strictEqual(res.story.status, 'draft');
  assert.strictEqual(res.story.authorChar, 'akhira');
  assert.strictEqual(res.story.authorUid, 'MT14ZHATNqe90frAeQ74QFk4iXs2');
  assert.strictEqual(res.story.universeName, 'YAWN');
  akhiraDraftId = res.story.id;
});

it('Draft Akhira terlihat di Karya Saya milik Akhira', () => {
  setActiveUserCharacter('akhira');
  const myWorks = getAuthorStories({ actor: 'akhira', filter: 'draft' });
  const found = myWorks.find(s => s.id === akhiraDraftId);
  assert(found, 'Draft Akhira harus muncul di daftar Karya Saya milik Akhira');
});

it('Draft Akhira TIDAK MUNCUL di perpustakaan publik getPublishedStories', () => {
  const pub = getPublishedStories({ actor: 'akhira' });
  const found = pub.find(s => s.id === akhiraDraftId);
  assert(!found, 'Draft tidak boleh muncul di perpustakaan publik');
});

otherChars.forEach(({ key, name }) => {
  it(`Karakter ${name} (${key}) DITOLAK membaca atau melihat draft milik Akhira`, () => {
    setActiveUserCharacter(key);
    // getStoryById harus menolak draft karakter lain
    const readAttempt = getStoryById(akhiraDraftId, key);
    assert.strictEqual(readAttempt, null, `Draft Akhira tidak boleh dapat dibaca oleh ${key}`);

    // Karya Saya karakter lain tidak boleh memuat draft Akhira
    const otherMyWorks = getAuthorStories({ actor: key, filter: 'draft' });
    const foundInOther = otherMyWorks.find(s => s.id === akhiraDraftId);
    assert(!foundInOther, `Draft Akhira tidak boleh muncul di Karya Saya milik ${key}`);
  });
});

console.log('\n================================================================');
console.log('5. TEST: AKHIRA MELANJUTKAN & MENGEDIT DRAFT SENDIRI');
console.log('================================================================');

it('Akhira melanjutkan dan mengupdate draft karyanya', () => {
  setActiveUserCharacter('akhira');
  const res = updateStory(akhiraDraftId, {
    title: 'Abyss Sanctuary: Nyanyian Bawah Laut',
    subtitle: 'Babak Baru Catatan Hening YAWN',
    content: '<p>Di dasar samudra terdalam, ombak kosmik bersinar ungu lavender dan membisikkan kedamaian tanpa batas.</p>',
    status: 'draft'
  }, 'akhira');

  assert.strictEqual(res.success, true, 'Update draft harus berhasil');
  assert(res.story, 'Updated story harus dikembalikan');
  assert.strictEqual(res.story.title, 'Abyss Sanctuary: Nyanyian Bawah Laut');
  assert.strictEqual(res.story.status, 'draft');
  assert(res.story.content.includes('ungu lavender'));
});

console.log('\n================================================================');
console.log('6. TEST: KEAMANAN & OTORISASI — KARAKTER LAIN DITOLAK UBAH KARYA AKHIRA');
console.log('================================================================');

otherChars.forEach(({ key, name }) => {
  it(`${name} (${key}) DITOLAK mengedit draft milik Akhira`, () => {
    setActiveUserCharacter(key);
    const res = updateStory(akhiraDraftId, {
      title: `Hacked by ${name}`
    }, key);
    assert.strictEqual(res.success, false, 'Edit harus ditolak');
    assert(/Akses ditolak|bukan milik|hanya dapat diedit|tidak memiliki izin/i.test(res.error));
  });

  it(`${name} (${key}) DITOLAK menghapus draft milik Akhira`, () => {
    setActiveUserCharacter(key);
    const res = deleteStory(akhiraDraftId, key);
    assert.strictEqual(res.success, false, 'Delete harus ditolak');
    assert(/Akses ditolak|bukan milik|hanya dapat dihapus|tidak memiliki izin/i.test(res.error));
  });
});

console.log('\n================================================================');
console.log('7. TEST: AKHIRA MEMPUBLIKASIKAN KARYA KE PERPUSTAKAAN BERSAMA');
console.log('================================================================');

it('Akhira mempublikasikan ceritanya ke Our Stories', () => {
  setActiveUserCharacter('akhira');
  const pubRes = publishStory(akhiraDraftId, 'akhira');
  assert.strictEqual(pubRes.success, true, 'Publish harus berhasil');
  assert.strictEqual(pubRes.story.status, 'published');
  assert(pubRes.story.publishedAt, 'publishedAt harus terisi');
});

otherChars.forEach(({ key, name }) => {
  it(`${name} (${key}) SEKARANG DAPAT MEMBACA karya yang diterbitkan oleh Akhira`, () => {
    setActiveUserCharacter(key);
    const read = getStoryById(akhiraDraftId, key);
    assert(read, `Karya terbit Akhira harus dapat dibaca oleh ${key}`);
    assert.strictEqual(read.title, 'Abyss Sanctuary: Nyanyian Bawah Laut');
    assert.strictEqual(read.authorChar, 'akhira');
    assert.strictEqual(read.authorUid, 'MT14ZHATNqe90frAeQ74QFk4iXs2');
    assert.strictEqual(read.universeName, 'YAWN');
  });
});

it('Filter Universe "yawn" mengembalikan karya terbit Akhira', () => {
  setActiveUserCharacter('lala');
  const yawnFiltered = getPublishedStories({ actor: 'lala', universe: 'yawn' });
  assert(yawnFiltered.length >= 1, 'Filter universe yawn harus menemukan karya Akhira');
  const item = yawnFiltered.find(s => s.id === akhiraDraftId);
  assert(item, 'Karya Akhira harus ada di hasil filter yawn');
});

console.log('\n================================================================');
console.log('8. TEST: PENGELOLAAN KARYA SENDIRI OLEH AKHIRA');
console.log('================================================================');

it('Akhira dapat menarik (unpublish) karyanya kembali menjadi draft', () => {
  setActiveUserCharacter('akhira');
  const unpub = unpublishStory(akhiraDraftId, 'akhira');
  assert.strictEqual(unpub.success, true, 'Unpublish harus berhasil');
  assert.strictEqual(unpub.story.status, 'draft');

  // Karakter lain tidak lagi dapat membaca setelah di-unpublish
  setActiveUserCharacter('lele');
  const readAfterUnpub = getStoryById(akhiraDraftId, 'lele');
  assert.strictEqual(readAfterUnpub, null, 'Setelah di-unpublish karya tidak boleh dapat dibaca karakter lain');
});

it('Akhira dapat menerbitkan kembali ceritanya', () => {
  setActiveUserCharacter('akhira');
  const rePub = publishStory(akhiraDraftId, 'akhira');
  assert.strictEqual(rePub.success, true, 'Re-publish harus berhasil');
  assert.strictEqual(rePub.story.status, 'published');

  setActiveUserCharacter('royan');
  const readAgain = getStoryById(akhiraDraftId, 'royan');
  assert(readAgain, 'Karya harus dapat dibaca kembali setelah diterbitkan ulang');
});

it('Akhira dapat menghapus karyanya sendiri', () => {
  setActiveUserCharacter('akhira');
  const del = deleteStory(akhiraDraftId, 'akhira');
  assert.strictEqual(del.success, true, 'Delete story oleh pemilik harus berhasil');

  const checkDeleted = getStoryById(akhiraDraftId, 'akhira');
  assert.strictEqual(checkDeleted, null, 'Story yang dihapus harus bernilai null');
});

console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passed} / ${passed + failed} PENGUJIAN BERHASIL (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}
