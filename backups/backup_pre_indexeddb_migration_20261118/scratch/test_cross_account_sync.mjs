import fs from 'fs';
import assert from 'assert';

// 1. Load Lele's 3 real stories from Chrome Profile 3 LevelDB backup
import {
  CHARACTERS_STORIES,
  collectAllPublishedStoriesLocally,
  isStoryOwnedBy,
  DEFAULT_READING_PREFS
} from '../stories.js';

console.log('================================================================');
console.log('TEST SUITE: CROSS-ACCOUNT SYNCHRONIZATION FOR 8 CHARACTERS');
console.log('================================================================\n');

// Mock localStorage to verify collectAllPublishedStoriesLocally and storage behavior
class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(k) { return this.store.get(k) || null; }
  setItem(k, v) { this.store.set(k, String(v)); }
  removeItem(k) { this.store.delete(k); }
  clear() { this.store.clear(); }
  get length() { return this.store.size; }
  key(i) { return Array.from(this.store.keys())[i] || null; }
}

globalThis.localStorage = new MockLocalStorage();

// Let's populate mock localStorage with the exact 3 real stories from Lele
const leleStories = [
  {
    id: "story-lele-1794453021905-xx2a6",
    title: "Seandainya",
    subtitle: "Arsterophe",
    category: "lainnya",
    genre: "Slice of Life",
    status: "published",
    authorUid: "1ArxphLQpAOoOIvH9BKYw0ebD1e2",
    authorChar: "lele",
    authorName: "Lele",
    universeId: "shadow",
    universeName: "SHADOW",
    wordCount: 197,
    content: "Pada akhirnya, segala yang fana dipaksa menanggalkan gravitasinya..."
  },
  {
    id: "story-lele-1794011126592-7sk5o",
    title: "Kebetulan",
    subtitle: "hm",
    synopsis: "itu",
    category: "cerpen",
    genre: "Fantasi Kosmik",
    status: "published",
    authorUid: "1ArxphLQpAOoOIvH9BKYw0ebD1e2",
    authorChar: "lele",
    authorName: "Lele",
    universeId: "shadow",
    universeName: "SHADOW",
    wordCount: 10,
    content: "kita ketemu kebetulan , harusnya perpisahan ini juga kebetulan kan"
  },
  {
    id: "story-lele-1794493720872-mf53m",
    title: "Cinema",
    subtitle: "Arsterophe",
    synopsis: "Bab 1",
    category: "novel",
    genre: "Fantasi Kosmik",
    status: "published",
    authorUid: "1ArxphLQpAOoOIvH9BKYw0ebD1e2",
    authorChar: "lele",
    authorName: "Lele",
    universeId: "shadow",
    universeName: "SHADOW",
    wordCount: 679,
    content: "Pagi itu, Yogyakarta tampak begitu cerah..."
  }
];

// Add a private draft for Lele to verify privacy
const leleDraft = {
  id: "story-lele-draft-private-999",
  title: "Rahasia Malam Shadow",
  status: "draft",
  authorUid: "1ArxphLQpAOoOIvH9BKYw0ebD1e2",
  authorChar: "lele",
  authorName: "Lele",
  universeId: "shadow",
  content: "Ini catatan rahasia Lele..."
};

// Simulate Lele's scoped store
localStorage.setItem(
  'olu_stories_store_v2_1ArxphLQpAOoOIvH9BKYw0ebD1e2',
  JSON.stringify([leleStories[2], leleDraft])
);

// Simulate legacy backup store
localStorage.setItem(
  'olu_stories_store_v1_backup_1794565858494',
  JSON.stringify([leleStories[0], leleStories[1]])
);

console.log('1. TEST: collectAllPublishedStoriesLocally scans multi-store');
const collected = collectAllPublishedStoriesLocally();
console.log(`Found ${collected.length} published stories.`);
assert.strictEqual(collected.length, 3, 'Must collect exactly 3 published stories from Lele');
assert(collected.some(s => s.id === 'story-lele-1794453021905-xx2a6'), 'Must contain Seandainya');
assert(collected.some(s => s.id === 'story-lele-1794011126592-7sk5o'), 'Must contain Kebetulan');
assert(collected.some(s => s.id === 'story-lele-1794493720872-mf53m'), 'Must contain Cinema');
assert(!collected.some(s => s.id === 'story-lele-draft-private-999'), 'DRAFT must NEVER be collected in published pool');
console.log('✓ PASS: All 3 published stories from Lele collected without leaking draft');

// Now import stories controller functions
import {
  setActiveUserCharacter,
  getPublishedStories,
  getStoryById,
  getAuthorStories,
  createStory,
  publishStory,
  unpublishStory,
  deleteStory
} from '../stories.js';

console.log('\n2. TEST: Royan logs in and views Our Stories');
setActiveUserCharacter('royan', { uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2' });
const royanViewPublished = getPublishedStories();
console.log(`Royan sees ${royanViewPublished.length} published stories in Our Stories:`);
royanViewPublished.forEach(s => {
  console.log(` - "${s.title}" oleh ${s.authorName} (${s.universeName || s.universeId})`);
});

assert.strictEqual(royanViewPublished.length, 3, 'Royan must see all 3 published stories by Lele');
assert(royanViewPublished.some(s => s.title === 'Seandainya'), 'Royan can see Seandainya');
assert(royanViewPublished.some(s => s.title === 'Kebetulan'), 'Royan can see Kebetulan');
assert(royanViewPublished.some(s => s.title === 'Cinema'), 'Royan can see Cinema');

// Check Royan reading each of the 3 stories
const s1 = getStoryById('story-lele-1794453021905-xx2a6', 'royan');
assert(s1 && s1.title === 'Seandainya', 'Royan can read Seandainya');
const s2 = getStoryById('story-lele-1794011126592-7sk5o', 'royan');
assert(s2 && s2.title === 'Kebetulan', 'Royan can read Kebetulan');
const s3 = getStoryById('story-lele-1794493720872-mf53m', 'royan');
assert(s3 && s3.title === 'Cinema', 'Royan can read Cinema');
console.log('✓ PASS: Royan can see and read all 3 of Lele published works');

console.log('\n3. TEST: Privacy of Drafts from Royan');
const draftCheck = getStoryById('story-lele-draft-private-999', 'royan');
assert.strictEqual(draftCheck, null, 'Royan must NOT be able to read Lele private draft');
const royanOwnWorks = getAuthorStories('royan', 'swBN9XodDWRuHE5YbYmeoytrcAx2');
assert.strictEqual(royanOwnWorks.length, 0, 'Royan personal workspace must be empty (no Lele works inside)');
console.log('✓ PASS: Draft privacy verified: Lele draft is invisible to Royan');

console.log('\n4. TEST: Royan publishes a new story in HOT');
const newRoyanStory = createStory({
  title: 'Bintang di Langit Elven',
  subtitle: 'Kisah dari HOT',
  synopsis: 'Cahaya di pepohonan peri',
  content: 'Di tengah hutan berkabut ungu, Royan memandang bintang-bintang...',
  status: 'published',
  category: 'cerpen',
  genre: 'Fantasi Kosmik',
  actor: 'royan'
});

assert(newRoyanStory.success, 'Royan successfully publishes new story');
console.log('Royan published story ID:', newRoyanStory.story.id);

console.log('\n5. TEST: Switch to Lele and verify she sees Royan work + her 3 works');
setActiveUserCharacter('lele', { uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2' });
const leleViewPublished = getPublishedStories();
console.log(`Lele sees ${leleViewPublished.length} published stories in Our Stories:`);
leleViewPublished.forEach(s => {
  console.log(` - "${s.title}" oleh ${s.authorName} (${s.universeName || s.universeId})`);
});
assert.strictEqual(leleViewPublished.length, 4, 'Lele must see her 3 works + Royan 1 work');
assert(leleViewPublished.some(s => s.title === 'Bintang di Langit Elven'), 'Lele can see Royan new work');

const leleOwnWorks = getAuthorStories('lele', '1ArxphLQpAOoOIvH9BKYw0ebD1e2');
console.log(`Lele personal workspace has ${leleOwnWorks.length} works (3 published + 1 draft)`);
assert(leleOwnWorks.some(s => s.id === 'story-lele-draft-private-999'), 'Lele can see her own draft in personal workspace');

console.log('\n6. TEST: All other characters (Nyanya, Lala, Syma, Akhira, Ela, Ruben) view library');
const allOtherChars = ['nyanya', 'lala', 'abil', 'akhira', 'ela', 'ruben'];
allOtherChars.forEach(c => {
  const charCfg = CHARACTERS_STORIES[c];
  setActiveUserCharacter(c, { uid: charCfg.uid });
  const pubList = getPublishedStories();
  assert.strictEqual(pubList.length, 4, `${charCfg.name} must see all 4 published works in Our Stories`);
  console.log(`✓ ${charCfg.name} sees 4/4 published works`);
});

console.log('\n================================================================');
console.log('HASIL PENGUJIAN: SEMUA 6 SEKSI PENGUJIAN BERHASIL (100%)');
console.log('================================================================');
