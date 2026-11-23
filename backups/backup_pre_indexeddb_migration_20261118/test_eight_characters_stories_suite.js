/**
 * TEST SUITE: OUR STORIES — FULL 8-CHARACTER ACCESS & WORKSPACE LIFECYCLE
 *
 * Verifies:
 * 1. All 8 canonical characters registered in CHARACTERS_STORIES
 * 2. Creating drafts for each of the 8 characters
 * 3. Strict privacy of Drafts (Drafts NEVER visible to other characters)
 * 4. Cross-character protection (Cannot edit or delete another character's story)
 * 5. Publishing stories across all 8 characters and cross-character reading
 * 6. Author and Universe metadata accuracy
 * 7. Category, Genre, and Universe filtering across all 8 characters
 * 8. Author workflow: Edit draft, publish, unpublish, delete own work
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
  STORY_CATEGORIES,
  STORY_GENRES
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
console.log('1. TEST: CANONICAL 8-CHARACTER MAPPING IN CHARACTERS_STORIES');
console.log('================================================================');

const EXPECTED_CHARACTERS = [
  { key: 'nyanya', name: 'Nyanya', univ: 'KIDULT', uid: '1uwba7MrGVU3xHu57VVLvztskrg2' },
  { key: 'lala', name: 'Lala', univ: 'TO YOU', uid: 'EqByKA8FXoTEt0OmIsSDPfnxMDB3' },
  { key: 'lele', name: 'Lele', univ: 'SHADOW', uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2' },
  { key: 'abil', name: 'Syma', univ: 'PINWHEEL', uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3' },
  { key: 'akhira', name: 'Akhira', univ: 'YAWN', uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2' },
  { key: 'ela', name: 'Ela', univ: 'US AGAIN', uid: 'plxSNowjCkOMfUQMAwnZzQPR9Xr1' },
  { key: 'ruben', name: 'Ruben', univ: 'ASH', uid: '9PMychPZ4rZ4PBCtZB9GiASttc52' },
  { key: 'royan', name: 'Royan', univ: 'HOT', uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2' }
];

EXPECTED_CHARACTERS.forEach(({ key, name, univ, uid }) => {
  it(`Karakter ${name} (${key}) terdaftar dengan UID dan Universe ${univ}`, () => {
    const cfg = CHARACTERS_STORIES[key];
    assert(cfg, `Config untuk ${key} harus ada`);
    assert.strictEqual(cfg.name, name, `Nama ${key} harus ${name}`);
    assert.strictEqual(cfg.universeName, univ, `UniverseName ${key} harus ${univ}`);
    assert.strictEqual(cfg.uid, uid, `UID ${key} harus cocok dengan ${uid}`);
    assert.strictEqual(CHARACTER_AUTH_RULES[key].expectedUid, uid, `CHARACTER_AUTH_RULES.${key}.expectedUid cocok`);
  });
});

console.log('\n================================================================');
console.log('2. TEST: SELURUH 8 KARAKTER BISA MEMBUAT DRAFT PRIBADI');
console.log('================================================================');

const draftsByChar = {};

EXPECTED_CHARACTERS.forEach(({ key, name, univ, uid }) => {
  it(`${name} (${key}) berhasil membuat draft di ruang pribadinya`, () => {
    setActiveUserCharacter(key);
    assert.strictEqual(getActiveUserCharacter(), key, `Active user harus ${key}`);
    assert.strictEqual(getActiveUserUid(), uid, `Active UID harus ${uid}`);

    const res = createStory({
      title: `Catatan Hening ${name}`,
      subtitle: `Kisah dari alam ${univ}`,
      category: 'puisi',
      genre: 'Puisi & Renungan',
      synopsis: `Renungan malam dari ${name}`,
      content: `<p>Di bawah naungan ${univ}, kata-kata merekah lembut.</p>`,
      status: 'draft',
      actor: key
    });

    assert.strictEqual(res.success, true, `Pembuatan draft ${name} harus berhasil`);
    assert(res.story && res.story.id, `Story ID harus ada`);
    assert.strictEqual(res.story.status, 'draft', `Status harus draft`);
    assert.strictEqual(res.story.authorUid, uid, `authorUid harus ${uid}`);
    assert.strictEqual(res.story.authorChar, key, `authorChar harus ${key}`);
    assert.strictEqual(res.story.authorName, name, `authorName harus ${name}`);
    assert.strictEqual(res.story.universeName, univ, `universeName harus ${univ}`);

    draftsByChar[key] = res.story;
  });
});

console.log('\n================================================================');
console.log('3. TEST: PRIVASI DRAFT — DRAFT TIDAK PERNAH BOCOR KE KARAKTER LAIN');
console.log('================================================================');

it('Draft Royan TIDAK BISA dilihat atau dibaca oleh Nyanya', () => {
  setActiveUserCharacter('nyanya');
  const story = getStoryById(draftsByChar['royan'].id, 'nyanya');
  assert.strictEqual(story, null, 'Nyanya harus ditolak membaca draft Royan');
});

it('Draft Ela TIDAK BISA dilihat atau dibaca oleh Lele', () => {
  setActiveUserCharacter('lele');
  const story = getStoryById(draftsByChar['ela'].id, 'lele');
  assert.strictEqual(story, null, 'Lele harus ditolak membaca draft Ela');
});

it('Draft Syma (abil) TIDAK BISA dilihat atau dibaca oleh Ruben', () => {
  setActiveUserCharacter('ruben');
  const story = getStoryById(draftsByChar['abil'].id, 'ruben');
  assert.strictEqual(story, null, 'Ruben harus ditolak membaca draft Syma');
});

it('Draft Akhira TIDAK BISA dilihat atau dibaca oleh Lala', () => {
  setActiveUserCharacter('lala');
  const story = getStoryById(draftsByChar['akhira'].id, 'lala');
  assert.strictEqual(story, null, 'Lala harus ditolak membaca draft Akhira');
});

it('Seluruh 8 draft TIDAK MUNCUL di daftar Our Stories publik (getPublishedStories)', () => {
  EXPECTED_CHARACTERS.forEach(({ key }) => {
    setActiveUserCharacter(key);
    const pub = getPublishedStories();
    assert.strictEqual(pub.length, 0, `Our Stories harus kosong dari draft saat dilihat oleh ${key}`);
  });
});

console.log('\n================================================================');
console.log('4. TEST: KEAMANAN & OTORISASI — TIDAK BISA EDIT ATAU HAPUS KARYA LAIN');
console.log('================================================================');

it('Akhira DITOLAK mengedit draft milik Lala', () => {
  setActiveUserCharacter('akhira');
  const res = updateStory(draftsByChar['lala'].id, { title: 'Judul Bajakan' }, 'akhira');
  assert.strictEqual(res.success, false, 'Update harus ditolak');
  assert(res.error.includes('Akses ditolak'), 'Pesan error harus menjelaskan akses ditolak');
});

it('Akhira DITOLAK menghapus karya milik Lala', () => {
  setActiveUserCharacter('akhira');
  const res = deleteStory(draftsByChar['lala'].id, 'akhira');
  assert.strictEqual(res.success, false, 'Delete harus ditolak');
  assert(res.error.includes('Akses ditolak'), 'Pesan error harus menjelaskan akses ditolak');
});

it('Ruben DITOLAK mengedit karya milik Syma (abil)', () => {
  setActiveUserCharacter('ruben');
  const res = updateStory(draftsByChar['abil'].id, { title: 'Ruben mengubah ini' }, 'ruben');
  assert.strictEqual(res.success, false, 'Ruben tidak boleh bisa mengedit karya Syma');
});

it('Royan DITOLAK menghapus karya milik Nyanya', () => {
  setActiveUserCharacter('royan');
  const res = deleteStory(draftsByChar['nyanya'].id, 'royan');
  assert.strictEqual(res.success, false, 'Royan tidak boleh bisa menghapus karya Nyanya');
});

it('Lele DITOLAK mempublikasikan draft milik Ela', () => {
  setActiveUserCharacter('lele');
  const res = publishStory(draftsByChar['ela'].id, 'lele');
  assert.strictEqual(res.success, false, 'Lele tidak boleh mempublikasikan draft Ela');
});

console.log('\n================================================================');
console.log('5. TEST: PUBLIKASI KARYA & MEMBACA KARYA LINTAS 8 KARAKTER');
console.log('================================================================');

const publishedByChar = {};

EXPECTED_CHARACTERS.forEach(({ key, name, univ, uid }) => {
  it(`${name} (${key}) mempublikasikan karyanya ke Our Stories`, () => {
    setActiveUserCharacter(key);
    const pubRes = publishStory(draftsByChar[key].id, key);
    assert.strictEqual(pubRes.success, true, `Publikasi karya ${name} harus berhasil`);
    assert.strictEqual(pubRes.story.status, 'published', 'Status karya harus published');
    publishedByChar[key] = pubRes.story;
  });
});

it('Our Stories (getPublishedStories) kini memuat tepat 8 karya dari seluruh 8 karakter', () => {
  const allPub = getPublishedStories();
  assert.strictEqual(allPub.length, 8, 'Harus ada 8 karya published');
  
  EXPECTED_CHARACTERS.forEach(({ key, name }) => {
    const found = allPub.find((s) => s.authorChar === key);
    assert(found, `Karya dari ${name} (${key}) harus ditemukan di Our Stories`);
    assert.strictEqual(found.authorName, name, `Nama penulis harus ${name}`);
  });
});

it('Royan membuat karya Published, lalu Nyanya DAPAT membacanya', () => {
  setActiveUserCharacter('nyanya');
  const story = getStoryById(publishedByChar['royan'].id, 'nyanya');
  assert(story, 'Nyanya harus bisa mengambil cerita published Royan');
  assert.strictEqual(story.title, draftsByChar['royan'].title, 'Judul cerita cocok');
  assert.strictEqual(story.authorName, 'Royan', 'Penulis terbaca Royan');
  assert.strictEqual(story.universeName, 'HOT', 'Universe terbaca HOT');
});

it('Syma membuat karya Published, lalu Ruben DAPAT membacanya', () => {
  setActiveUserCharacter('ruben');
  const story = getStoryById(publishedByChar['abil'].id, 'ruben');
  assert(story, 'Ruben harus bisa membaca cerita Syma');
  assert.strictEqual(story.authorName, 'Syma', 'Penulis terbaca Syma');
  assert.strictEqual(story.universeName, 'PINWHEEL', 'Universe terbaca PINWHEEL');
});

it('Lala membookmark karya Lele dan status bookmark tercatat', () => {
  setActiveUserCharacter('lala');
  const bkmRes = toggleBookmark(publishedByChar['lele'].id, 'lala');
  assert.strictEqual(bkmRes.isBookmarked, true, 'Lala berhasil membookmark karya Lele');
  assert.strictEqual(isStoryBookmarked(publishedByChar['lele'].id, 'lala'), true, 'Status bookmark true');
});

console.log('\n================================================================');
console.log('6. TEST: FILTER UNIVERSE & KATEGORI LINTAS 8 KARAKTER');
console.log('================================================================');

EXPECTED_CHARACTERS.forEach(({ key, name, univ }) => {
  it(`Filter universe "${key}" di Our Stories mengembalikan karya ${name} (${univ})`, () => {
    const filtered = getPublishedStories({ universe: key });
    assert.strictEqual(filtered.length, 1, `Harus ada tepat 1 karya untuk universe ${key}`);
    assert.strictEqual(filtered[0].authorChar, key, `Author karya harus ${key}`);
    assert.strictEqual(filtered[0].universeName, univ, `UniverseName harus ${univ}`);
  });
});

console.log('\n================================================================');
console.log('7. TEST: WORKSPACE MY WORKS & PENGELOLAAN KARYA OLEH PEMILIK');
console.log('================================================================');

it('Karya Saya (getAuthorStories) hanya memuat karya milik pemilik yang sedang aktif', () => {
  EXPECTED_CHARACTERS.forEach(({ key, name }) => {
    setActiveUserCharacter(key);
    const myWorks = getAuthorStories(key);
    assert.strictEqual(myWorks.length, 1, `${name} hanya boleh melihat karyanya sendiri di Karya Saya`);
    assert.strictEqual(myWorks[0].authorChar, key, `Karya Saya harus milik ${key}`);
  });
});

it('Ela dapat melanjutkan penulisan karyanya (edit karya sendiri)', () => {
  setActiveUserCharacter('ela');
  const res = updateStory(publishedByChar['ela'].id, {
    title: 'Catatan Hening Ela (Edisi Revisi)',
    content: '<p>Di bawah bunga teratai US AGAIN, bait-bait suci bergema syahdu.</p>'
  }, 'ela');

  assert.strictEqual(res.success, true, 'Ela harus berhasil mengedit karyanya sendiri');
  assert.strictEqual(res.story.title, 'Catatan Hening Ela (Edisi Revisi)', 'Judul harus terupdate');
});

it('Ela dapat menarik (unpublish) karyanya kembali menjadi draft', () => {
  setActiveUserCharacter('ela');
  const res = unpublishStory(publishedByChar['ela'].id, 'ela');
  assert.strictEqual(res.success, true, 'Unpublish harus berhasil');
  assert.strictEqual(res.story.status, 'draft', 'Status harus menjadi draft');

  // Karya Ela sekarang hilang dari Our Stories publik
  setActiveUserCharacter('lele');
  const allPub = getPublishedStories();
  assert.strictEqual(allPub.length, 7, 'Our Stories sekarang hanya berisi 7 karya');
  assert.strictEqual(allPub.some((s) => s.authorChar === 'ela'), false, 'Karya Ela tidak lagi tampil di publik');

  // Tapi Ela tetap bisa melihatnya di Karya Saya
  setActiveUserCharacter('ela');
  const elaWorks = getAuthorStories('ela');
  assert.strictEqual(elaWorks.length, 1, 'Ela tetap memiliki karyanya di Karya Saya');
  assert.strictEqual(elaWorks[0].status, 'draft', 'Status di Karya Saya tercatat draft');
});

it('Ela dapat menghapus karyanya sendiri', () => {
  setActiveUserCharacter('ela');
  const delRes = deleteStory(publishedByChar['ela'].id, 'ela');
  assert.strictEqual(delRes.success, true, 'Hapus karya sendiri harus berhasil');

  const elaWorks = getAuthorStories('ela');
  assert.strictEqual(elaWorks.length, 0, 'Karya Saya Ela sekarang kosong');
});

console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passed}/${passed + failed} PENGUJIAN BERHASIL (${Math.round((passed / (passed + failed)) * 100)}%)`);
console.log('================================================================');

if (failed > 0) {
  process.exit(1);
}

