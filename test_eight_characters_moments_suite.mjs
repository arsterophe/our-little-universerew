/**
 * COMPREHENSIVE TEST SUITE: OUR LITTLE MOMENTS — 8 CANONICAL CHARACTERS
 *
 * Verifies:
 * 1. Metadata and alias mapping for all 8 characters (Nyanya, Lala, Lele, Syma/abil, Akhira, Ela, Ruben, Royan)
 * 2. Story creation and Stories Sahabat 24h tray tracking for each character
 * 3. Gallery scrapbook feed and per-character filtering for all 8 characters
 * 4. Privacy isolation: private moments are hidden from other characters
 * 5. Strict Role-Based Access Control (RBAC): non-owners are strictly blocked from editing/deleting other characters' content
 * 6. Deletion and archive management by rightful owner
 * 7. Seamless compatibility between internal ID 'abil' and display name 'syma'
 */

import {
  CHARACTERS_MOMENTS,
  ALL_MOMENTS_CHARACTERS,
  STORY_LIFESPAN_MS,
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
  getPersonalGallery,
  markStoryAsViewed,
  saveStoryToArchive,
  toggleLikeMoment,
  toggleArchiveMoment,
  updateMomentPrivacy,
  updateMomentCaption,
  deleteMomentItem,
  addMoment,
  clearAllMomentsStore,
  verifyOwnership,
  canUserAccessItem
} from './moments.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition, testName) {
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedCount++;
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

async function runEightCharactersMomentsSuite() {
  console.log('======================================================================');
  console.log('OUR LITTLE MOMENTS — FULL 8 CHARACTERS COMPREHENSIVE VERIFICATION');
  console.log('======================================================================\n');

  await clearAllMomentsStore();

  const samplePhoto = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

  // ------------------------------------------------------------------
  // STAGE 1: METADATA & CONFIGURATION AUDIT FOR ALL 8 CHARACTERS
  // ------------------------------------------------------------------
  console.log('--- STAGE 1: Configuration & Metadata Audit (All 8 Characters) ---');

  const expectedCharacters = [
    { key: 'nyanya', name: 'Nyanya', symbol: '⭐', universe: 'KIDULT' },
    { key: 'lala', name: 'Lala', symbol: '☀️', universe: 'TO YOU' },
    { key: 'lele', name: 'Lele', symbol: '🌙', universe: 'SHADOW' },
    { key: 'abil', name: 'Syma', symbol: '☁️', universe: 'PINWHEEL' },
    { key: 'akhira', name: 'Akhira', symbol: '🌊', universe: 'YAWN' },
    { key: 'ela', name: 'Ela', symbol: '🪷', universe: 'US AGAIN' },
    { key: 'ruben', name: 'Ruben', symbol: '🐉', universe: 'ASH' },
    { key: 'royan', name: 'Royan', symbol: '🎆', universe: 'HOT' }
  ];

  assert(ALL_MOMENTS_CHARACTERS.length === 8, 'ALL_MOMENTS_CHARACTERS contains exactly 8 entries');

  expectedCharacters.forEach((exp) => {
    const cfg = CHARACTERS_MOMENTS[exp.key];
    assert(Boolean(cfg), `Character config exists for ${exp.name} (${exp.key})`);
    assert(cfg.name === exp.name, `Correct name for ${exp.key}: "${cfg.name}"`);
    assert(cfg.symbol === exp.symbol, `Correct symbol for ${exp.key}: "${cfg.symbol}"`);
    assert(cfg.universe === exp.universe, `Correct universe for ${exp.key}: "${cfg.universe}"`);
    assert(typeof cfg.avatar === 'string' && cfg.avatar.length > 0, `Avatar exists for ${exp.key}`);
  });

  // Verify Syma alias
  assert(CHARACTERS_MOMENTS.syma === CHARACTERS_MOMENTS.abil, 'CHARACTERS_MOMENTS.syma is aliased to abil');
  assert(CHARACTERS_MOMENTS.syma.name === 'Syma', 'CHARACTERS_MOMENTS.syma resolves to Syma');

  // ------------------------------------------------------------------
  // STAGE 2: PUBLISHING STORIES & GALLERY MOMENTS FOR ALL 8 CHARACTERS
  // ------------------------------------------------------------------
  console.log('\n--- STAGE 2: Publishing Stories & Gallery Moments (All 8 Characters) ---');

  const createdMoments = {};

  expectedCharacters.forEach((exp) => {
    setActiveUserCharacter(exp.key);
    assert(getActiveUserCharacter() === exp.key, `Active character switched to ${exp.name} (${exp.key})`);

    // 1. Publish active story
    const storyItem = addMoment({
      photoUrl: samplePhoto,
      caption: `Story harian ${exp.name} di ${exp.universe} ✨`,
      type: 'story',
      author: exp.key,
      visibility: 'friends'
    });
    assert(Boolean(storyItem && storyItem.id), `${exp.name} successfully published 24h Story`);
    assert(storyItem.author === exp.key, `Story author is correctly recorded as ${exp.key}`);
    assert(storyItem.isActiveStory === true, `Story is recognized as active`);

    // 2. Publish permanent scrapbook gallery moment
    const galleryItem = addMoment({
      photoUrl: samplePhoto,
      caption: `Momen kenangan galeri ${exp.name} 📸`,
      type: 'feed',
      author: exp.key,
      visibility: 'friends'
    });
    assert(Boolean(galleryItem && galleryItem.id), `${exp.name} successfully published Gallery Moment`);
    assert(galleryItem.author === exp.key, `Gallery moment author is ${exp.key}`);

    createdMoments[exp.key] = { story: storyItem, gallery: galleryItem };
  });

  // Test publishing using alias 'syma'
  setActiveUserCharacter('syma');
  assert(getActiveUserCharacter() === 'abil', 'setActiveUserCharacter("syma") correctly sets canonical "abil"');
  const symaAliasStory = addMoment({
    photoUrl: samplePhoto,
    caption: 'Story Syma via alias syma',
    type: 'story',
    author: 'syma',
    visibility: 'friends'
  });
  assert(symaAliasStory.author === 'abil', 'Moment added with author "syma" is normalized to "abil"');

  // ------------------------------------------------------------------
  // STAGE 3: STORIES SAHABAT TRAY & VIEW TRACKING
  // ------------------------------------------------------------------
  console.log('\n--- STAGE 3: Stories Sahabat Tray & Multi-User Viewing ---');

  // Switch to Royan as viewer
  setActiveUserCharacter('royan');

  expectedCharacters.forEach((exp) => {
    const hasActive = hasActiveStories(exp.key, Date.now(), 'royan');
    assert(hasActive === true, `Stories Sahabat recognizes active stories for ${exp.name} (${exp.key})`);

    const charStories = getStoriesByCharacter(exp.key, Date.now(), 'royan');
    assert(charStories.length >= 1, `${exp.name} has ${charStories.length} active stories`);

    if (exp.key !== 'royan') {
      const unseenBefore = hasUnseenStories(exp.key, Date.now(), 'royan');
      assert(unseenBefore === true, `Royan has unseen story from ${exp.name} initially`);

      // Royan views the story
      const viewed = markStoryAsViewed(charStories[0].id, 'royan');
      assert(Boolean(viewed), `Royan successfully viewed story of ${exp.name}`);
    }
  });

  // ------------------------------------------------------------------
  // STAGE 4: GALLERY SCRAPBOOK FEED & FILTERING FOR ALL 8 CHARACTERS
  // ------------------------------------------------------------------
  console.log('\n--- STAGE 4: Scrapbook Feed & Per-Character Filters ---');

  const allFeed = getMomentsFeed('all', 'nyanya');
  assert(allFeed.length >= 17, `Semua filter returns all shared moments & active stories (count: ${allFeed.length})`);

  expectedCharacters.forEach((exp) => {
    setActiveFilter(exp.key);
    assert(getActiveFilter() === exp.key, `Filter switched to ${exp.key}`);

    const filtered = getMomentsFeed(exp.key, 'nyanya');
    assert(filtered.length >= 2, `Filter for ${exp.name} returns ${filtered.length} moments`);
    assert(
      filtered.every((m) => m.author === exp.key),
      `Filter ${exp.name} strictly contains ONLY moments authored by ${exp.key}`
    );
  });

  // Test filtering with alias 'syma'
  setActiveFilter('syma');
  assert(getActiveFilter() === 'abil', 'setActiveFilter("syma") correctly normalizes to "abil"');
  const symaFiltered = getMomentsFeed('abil', 'nyanya');
  assert(symaFiltered.every((m) => m.author === 'abil'), 'Syma filter returns all abil moments');

  // ------------------------------------------------------------------
  // STAGE 5: PRIVACY ISOLATION (PRIVATE MOMENTS)
  // ------------------------------------------------------------------
  console.log('\n--- STAGE 5: Privacy Isolation (Private Moments Protection) ---');

  // Akhira creates a private moment
  setActiveUserCharacter('akhira');
  const privateMomentAkhira = addMoment({
    photoUrl: samplePhoto,
    caption: 'Catatan pribadi rahasia samudra Akhira 🔒',
    type: 'feed',
    author: 'akhira',
    visibility: 'private'
  });
  assert(privateMomentAkhira.visibility === 'private', 'Akhira created a private moment');

  // Akhira can access her own private moment
  assert(canUserAccessItem(privateMomentAkhira, 'akhira', 'gallery') === true, 'Owner Akhira can access her own private moment');
  const akhiraOwnGallery = getPersonalGallery('akhira', 'akhira', { includePrivate: true });
  assert(akhiraOwnGallery.some((m) => m.id === privateMomentAkhira.id), 'Private moment appears in Akhira own Personal Gallery');

  // Another character (e.g. Syma / abil) CANNOT access Akhira private moment
  assert(canUserAccessItem(privateMomentAkhira, 'abil', 'gallery') === false, 'Syma (abil) cannot access Akhira private moment');
  const symaViewsAkhiraGallery = getMomentsFeed('akhira', 'abil');
  assert(
    !symaViewsAkhiraGallery.some((m) => m.id === privateMomentAkhira.id),
    'Private moment is strictly hidden when Syma views Akhira gallery'
  );

  let privateAccessBlocked = false;
  try {
    getPersonalGallery('akhira', 'abil', { includePrivate: true });
  } catch (err) {
    privateAccessBlocked = true;
  }
  assert(privateAccessBlocked === true, 'Syma requesting Akhira Private Personal Archive throws Access Denied');

  // ------------------------------------------------------------------
  // STAGE 6: STRICT ROLE-BASED ACCESS CONTROL (ANTI-TAMPERING & RBAC)
  // ------------------------------------------------------------------
  console.log('\n--- STAGE 6: RBAC & Anti-Tampering (Edit, Privacy, Delete) ---');

  const rubenMoment = createdMoments.ruben.gallery;

  // 1. Non-owner (Ela) attempting to edit Ruben caption
  let elaTamperBlocked = false;
  try {
    updateMomentCaption(rubenMoment.id, 'Hacked caption by Ela', 'ela');
  } catch (err) {
    elaTamperBlocked = true;
    assert(err.message.includes('Akses ditolak'), `Proper access denied error on caption edit: "${err.message}"`);
  }
  assert(elaTamperBlocked === true, 'Non-owner Ela is strictly blocked from editing Ruben moment caption');

  // 2. Non-owner (Nyanya) attempting to change Ruben privacy
  let nyanyaPrivacyBlocked = false;
  try {
    updateMomentPrivacy(rubenMoment.id, 'private', 'nyanya');
  } catch (err) {
    nyanyaPrivacyBlocked = true;
  }
  assert(nyanyaPrivacyBlocked === true, 'Non-owner Nyanya is strictly blocked from changing Ruben moment privacy');

  // 3. Non-owner (Lele) attempting to toggle archive on Ruben moment
  let leleArchiveBlocked = false;
  try {
    toggleArchiveMoment(rubenMoment.id, 'lele');
  } catch (err) {
    leleArchiveBlocked = true;
  }
  assert(leleArchiveBlocked === true, 'Non-owner Lele is strictly blocked from toggling archive on Ruben moment');

  // 4. Non-owner (Lala) attempting to delete Ruben moment
  let lalaDeleteBlocked = false;
  try {
    deleteMomentItem(rubenMoment.id, 'lala');
  } catch (err) {
    lalaDeleteBlocked = true;
  }
  assert(lalaDeleteBlocked === true, 'Non-owner Lala is strictly blocked from deleting Ruben moment');

  // ------------------------------------------------------------------
  // STAGE 7: OWNER MUTATION & DELETION BY RIGHTFUL OWNER
  // ------------------------------------------------------------------
  console.log('\n--- STAGE 7: Owner Operations (Edit, Archive, Delete by Owner) ---');

  // Ruben updates his own caption
  const updatedRuben = updateMomentCaption(rubenMoment.id, 'Caption baru diperbarui oleh Ruben sendiri 🐉', 'ruben');
  assert(updatedRuben.caption.includes('Ruben sendiri'), 'Ruben successfully updated his own caption');

  // Ruben toggles archive
  const arcStatus = toggleArchiveMoment(rubenMoment.id, 'ruben');
  assert(arcStatus === true, 'Ruben successfully pinned moment to Arsip Kita');

  const archiveList = getArchiveMoments('ruben');
  assert(archiveList.some((m) => m.id === rubenMoment.id), 'Ruben moment appears in Arsip Kita');

  // Ruben deletes his moment
  const deleteRes = deleteMomentItem(rubenMoment.id, 'ruben');
  assert(deleteRes === true, 'Ruben successfully deleted his own moment');

  const feedAfterDelete = getMomentsFeed('ruben', 'ruben');
  assert(!feedAfterDelete.some((m) => m.id === rubenMoment.id), 'Deleted moment is no longer in feed');

  // ------------------------------------------------------------------
  // STAGE 8: SYMA ALIAS EQUIVALENCE FOR MUTATION
  // ------------------------------------------------------------------
  console.log('\n--- STAGE 8: Syma / abil Alias Equivalence ---');

  const symaMoment = createdMoments.abil.gallery;

  // Verify ownership checks pass regardless of whether 'abil' or 'syma' is passed
  const checkAbil = verifyOwnership(symaMoment, 'abil');
  assert(checkAbil.allowed === true, 'verifyOwnership passes when actor is "abil"');

  const checkSyma = verifyOwnership(symaMoment, 'syma');
  assert(checkSyma.allowed === true, 'verifyOwnership passes when actor is "syma"');

  const updatedBySyma = updateMomentCaption(symaMoment.id, 'Caption diupdate via alias syma ☁️', 'syma');
  assert(updatedBySyma.caption.includes('alias syma'), 'Syma can mutate moment created with author "abil"');

  // ------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------
  console.log('\n======================================================================');
  console.log(`SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('======================================================================');

  if (failedCount > 0) {
    console.error(`\nTest suite FAILED with ${failedCount} failure(s).`);
    process.exit(1);
  } else {
    console.log('\nAll 8 characters in Our Little Moments passed 100% successfully! ✧');
    process.exit(0);
  }
}

runEightCharactersMomentsSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
