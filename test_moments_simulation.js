/**
 * Automated Test Suite for Our Little Moments Store & Logic
 */

import {
  INITIAL_STORIES,
  INITIAL_MOMENTS,
  CHARACTERS_MOMENTS,
  getStories,
  getStoriesByCharacter,
  hasActiveStories,
  hasUnseenStories,
  getActiveFilter,
  setActiveFilter,
  getActiveUserCharacter,
  setActiveUserCharacter,
  getMomentsFeed,
  getArchiveMoments,
  markStoryAsViewed,
  saveStoryToArchive,
  toggleLikeMoment,
  toggleArchiveMoment,
  addMoment
} from './moments.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✕ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- TEST 1: Initial Stories & 24h Expiration Logic ---');
const activeStories = getStories();
assert(activeStories.length >= 2, `Active stories loaded: ${activeStories.length}`);
assert(hasActiveStories('nyanya') === true, 'Nyanya has active story');
assert(hasActiveStories('lala') === true, 'Lala has active story');
assert(hasActiveStories('lele') === false, 'Lele has NO story today (verifies visual indicator requirement)');
assert(hasUnseenStories('nyanya') === true, 'Nyanya has unseen story initially');

console.log('\n--- TEST 2: Story Viewed & Archive Actions ---');
const nyanyaStory = activeStories.find(s => s.author === 'nyanya');
assert(Boolean(nyanyaStory), 'Nyanya story found');
markStoryAsViewed(nyanyaStory.id);
assert(hasUnseenStories('nyanya') === false, 'After viewing, Nyanya has no unseen stories');

const arcSuccess = saveStoryToArchive(nyanyaStory.id);
assert(arcSuccess === true, 'Story successfully saved to archive');
const archivedMoments = getArchiveMoments();
assert(archivedMoments.some(m => m.photoUrl === nyanyaStory.photoUrl), 'Archived story is present in archive moments');

console.log('\n--- TEST 3: Scrapbook Feed & Filtering ---');
const allMoments = getMomentsFeed('all');
assert(allMoments.length >= 3, `Feed has ${allMoments.length} moments`);

const nyanyaFeed = getMomentsFeed('nyanya');
assert(nyanyaFeed.every(m => m.author === 'nyanya'), 'Nyanya filter returns only Nyanya moments');

const lalaFeed = getMomentsFeed('lala');
assert(lalaFeed.every(m => m.author === 'lala'), 'Lala filter returns only Lala moments');

const leleFeed = getMomentsFeed('lele');
assert(leleFeed.every(m => m.author === 'lele'), 'Lele filter returns only Lele moments');

const archiveFeed = getMomentsFeed('archive');
assert(archiveFeed.every(m => m.isArchived === true), 'Archive filter returns only archived moments');

console.log('\n--- TEST 4: Like & Archive Toggles ---');
const testMoment = allMoments[0];
const initialLikes = testMoment.likes;
const initialLikedByMe = testMoment.likedByMe;

const likedMoment = toggleLikeMoment(testMoment.id);
assert(likedMoment.likedByMe === !initialLikedByMe, 'Like toggle flips likedByMe status');
assert(
  initialLikedByMe ? likedMoment.likes === initialLikes - 1 : likedMoment.likes === initialLikes + 1,
  'Like count updated appropriately'
);

// Toggle back
const unlikedMoment = toggleLikeMoment(testMoment.id);
assert(unlikedMoment.likedByMe === initialLikedByMe, 'Like toggle back restores original state');
assert(unlikedMoment.likes === initialLikes, 'Like count restored');

const initialArchivedStatus = testMoment.isArchived;
const toggledArc = toggleArchiveMoment(testMoment.id);
assert(toggledArc === !initialArchivedStatus, 'Archive status toggled successfully');

console.log('\n--- TEST 5: Uploading New Moment & Story ---');
const customPhotoUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

// Test 5A: Add to Stories only
const storyCreated = addMoment({
  photoUrl: customPhotoUrl,
  caption: 'Momen senja yang indah dari balkon ✦',
  type: 'story',
  author: 'lele'
});
assert(storyCreated === true, 'New story uploaded successfully');
assert(hasActiveStories('lele') === true, 'Lele now has an active story!');
assert(hasUnseenStories('lele') === true, 'Lele has unseen story now');

// Test 5B: Add to Feed only
const feedCreated = addMoment({
  photoUrl: customPhotoUrl,
  caption: 'Foto kenangan scrapbook bersama 🌸',
  type: 'feed',
  author: 'lala'
});
assert(feedCreated === true, 'New scrapbook moment uploaded successfully');
const updatedLalaFeed = getMomentsFeed('lala');
assert(updatedLalaFeed.some(m => m.caption.includes('kenangan scrapbook')), 'New moment visible in feed');

// Test 5C: Add to Both
const bothCreated = addMoment({
  photoUrl: customPhotoUrl,
  caption: 'Momen spesial di Universe SHADOW ☾',
  type: 'both',
  author: 'nyanya'
});
assert(bothCreated === true, 'Moment added to both stories and feed');

console.log('\n--- TEST 6: Character Metadata ---');
assert(CHARACTERS_MOMENTS.nyanya.name === 'Nyanya', 'Nyanya config is present');
assert(CHARACTERS_MOMENTS.lala.name === 'Lala', 'Lala config is present');
assert(CHARACTERS_MOMENTS.lele.name === 'Lele', 'Lele config is present');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Our Little Moments simulation tests PASSED successfully! ✦');
}
