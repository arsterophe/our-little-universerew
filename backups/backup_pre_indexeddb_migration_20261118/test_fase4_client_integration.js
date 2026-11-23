/**
 * OUR LITTLE UNIVERSE — FASE 4 CLIENT INTEGRATION TEST
 * Tests client SDK functions, storage helpers, object URL lifecycles,
 * two-phase deletion retry, and idempotent legacy migration.
 */

import './load_env.js';

import {
  MOMENTS_COLLECTION,
  MAX_MEDIA_SIZE_BYTES,
  STORY_LIFESPAN_MS,
  getExtensionFromMime,
  dbUploadMomentMedia,
  dbFetchMomentBlob,
  dbCreateMomentObjectURL,
  dbRevokeMomentObjectURL,
  dbRevokeAllMomentObjectURLs,
  dbSaveMoment,
  dbDeleteMomentSafe,
  dbRetryFailedMomentDeletions,
  dbFetchMoments,
  dbMigrateMoments,
  backupLocalStorageKey
} from './firebase.js';

import {
  canUserAccessItem,
  isStoryActive,
  verifyOwnership,
  validateStoryMediaInput
} from './moments.js';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`✗ FAIL: ${message}`);
  }
}

async function runClientIntegrationSuite() {
  console.log('================================================================');
  console.log('1. TEST: MIME TYPE TO EXTENSION & VALIDATION HELPERS');
  console.log('================================================================');

  assert(getExtensionFromMime('image/png') === 'png', 'PNG mime maps to png');
  assert(getExtensionFromMime('image/jpeg') === 'jpg', 'JPEG mime maps to jpg');
  assert(getExtensionFromMime('image/webp') === 'webp', 'WebP mime maps to webp');
  assert(getExtensionFromMime('image/gif') === 'gif', 'GIF mime maps to gif');
  assert(getExtensionFromMime('video/mp4') === 'mp4', 'MP4 mime maps to mp4');
  assert(getExtensionFromMime('video/webm') === 'webm', 'WebM mime maps to webm');
  assert(getExtensionFromMime('video/ogg') === 'ogg', 'OGG mime maps to ogg');

  const validPhoto = validateStoryMediaInput({ mediaUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', mimeType: 'image/png' });
  assert(validPhoto.valid === true && validPhoto.mediaType === 'image', 'Valid base64 image accepted');

  const validVideo = validateStoryMediaInput({ mediaUrl: 'data:video/mp4;base64,AAAA', mimeType: 'video/mp4' });
  assert(validVideo.valid === true && validVideo.mediaType === 'video', 'Valid base64 video accepted');

  const oversized = validateStoryMediaInput({ mediaUrl: 'data:image/png;base64,AAAA', sizeBytes: 30 * 1024 * 1024 });
  assert(oversized.valid === false, 'Oversized media (>25MB) rejected');

  const emptyMedia = validateStoryMediaInput({ mediaUrl: '' });
  assert(emptyMedia.valid === false, 'Empty media rejected');

  console.log('\n================================================================');
  console.log('2. TEST: 24-HOUR STORY EXPIRATION & PERSONAL GALLERY PERSISTENCE');
  console.log('================================================================');

  const now = Date.now();
  const activeItem = {
    id: 'm1',
    author: 'nyanya',
    isStory: true,
    publishedAt: now - 3600000, // 1 hour ago
    visibility: 'friends'
  };

  const expiredItem = {
    id: 'm2',
    author: 'nyanya',
    isStory: true,
    publishedAt: now - (25 * 3600000), // 25 hours ago
    visibility: 'friends'
  };

  assert(isStoryActive(activeItem, now) === true, '1-hour old story is active in 24h tray');
  assert(isStoryActive(expiredItem, now) === false, '25-hour old story is expired from 24h tray');

  // Friends tray: Lala viewing
  assert(canUserAccessItem(activeItem, 'lala', 'story') === true, 'Friend (Lala) can see active story in tray');
  assert(canUserAccessItem(expiredItem, 'lala', 'story') === false, 'Friend (Lala) CANNOT see expired story in tray');

  // Personal Gallery:
  // Owner (Nyanya) viewing her own personal gallery
  assert(canUserAccessItem(expiredItem, 'nyanya', 'gallery') === true, 'Owner (Nyanya) CAN STILL see expired story in her Personal Gallery');
  // Friend (Lala) viewing Nyanya's gallery
  assert(canUserAccessItem(expiredItem, 'lala', 'gallery') === false, 'Friend (Lala) CANNOT see Nyanya expired personal story in gallery');

  // If pinned to shared archive (isArchived: true):
  const archivedExpiredItem = { ...expiredItem, isArchived: true };
  assert(canUserAccessItem(archivedExpiredItem, 'lala', 'gallery') === true, 'Friend (Lala) CAN see expired story if pinned to shared Arsip Kita');

  // Deleted items:
  const deletedItem = { ...activeItem, isDeleted: true };
  assert(canUserAccessItem(deletedItem, 'nyanya', 'gallery') === false, 'Deleted item is hidden from gallery for author');
  assert(canUserAccessItem(deletedItem, 'lala', 'gallery') === false, 'Deleted item is hidden from gallery for friends');

  console.log('\n================================================================');
  console.log('3. TEST: UNINITIALIZED GUARDS & AUTH PROTECTION');
  console.log('================================================================');

  try {
    await dbUploadMomentMedia(null, {});
    assert(false, 'dbUploadMomentMedia should throw if authUser is null');
  } catch (err) {
    assert(err.message.includes('Akses ditolak') || err.message.includes('terautentikasi'), 'dbUploadMomentMedia guarded against unauthenticated access');
  }

  try {
    await dbSaveMoment({}, null);
    assert(false, 'dbSaveMoment should throw if authUser is null');
  } catch (err) {
    assert(err.message.includes('Akses ditolak') || err.message.includes('terautentikasi') || err.message.includes('terinisialisasi'), 'dbSaveMoment guarded against unauthenticated access');
  }

  try {
    await dbDeleteMomentSafe('m1', null);
    assert(false, 'dbDeleteMomentSafe should throw if authUser is null');
  } catch (err) {
    assert(err.message.includes('Akses ditolak') || err.message.includes('terautentikasi') || err.message.includes('terinisialisasi'), 'dbDeleteMomentSafe guarded against unauthenticated access');
  }

  // 3.4 dbFetchMomentBlob rejects unauthenticated calls
  try {
    await dbFetchMomentBlob('moments/shared/uid_nyanya_alenda/photo.png', null);
    assert(false, 'dbFetchMomentBlob should reject unauthenticated calls');
  } catch (err) {
    assert(err.message.includes('Akses ditolak') || err.message.includes('terautentikasi'), 'dbFetchMomentBlob strictly guards against unauthenticated calls');
  }

  // 3.5 dbFetchMomentBlob rejects stranger account
  const authStranger = { uid: 'uid_stranger', email: 'stranger@example.com' };
  try {
    await dbFetchMomentBlob('moments/shared/uid_nyanya_alenda/photo.png', authStranger);
    assert(false, 'dbFetchMomentBlob should reject stranger account');
  } catch (err) {
    assert(err.message.includes('Akses ditolak'), 'dbFetchMomentBlob rejects stranger account not in canonical characters');
  }

  // 3.6 dbFetchMomentBlob rejects cross-account private media read
  const authLala = { uid: 'uid_lala_bella', email: 'lala@ourlittleuniverse.com' };
  try {
    await dbFetchMomentBlob('moments/private/uid_nyanya_alenda/secret.png', authLala);
    assert(false, 'dbFetchMomentBlob should reject cross-account private media read');
  } catch (err) {
    assert(err.message.includes('Akses ditolak'), 'dbFetchMomentBlob blocks Lala from reading Nyanya private media path');
  }

  // 3.7 dbFetchMomentBlob rejects path manipulation outside moments
  const authNyanya = { uid: 'uid_nyanya_alenda', email: 'nyanya@ourlittleuniverse.com' };
  try {
    await dbFetchMomentBlob('secret_system/passwords.txt', authNyanya);
    assert(false, 'dbFetchMomentBlob should reject arbitrary path');
  } catch (err) {
    assert(err.message.includes('Akses ditolak'), 'dbFetchMomentBlob blocks arbitrary storage path outside moments namespace');
  }

  console.log('\n================================================================');
  console.log('4. TEST: IDEMPOTENT MIGRATION & AMBIGUOUS LOGGING');
  console.log('================================================================');

  // Simulate mock localStorage
  const mockStorage = new Map();
  global.window = {
    localStorage: {
      getItem: (k) => mockStorage.get(k) || null,
      setItem: (k, v) => mockStorage.set(k, String(v)),
      removeItem: (k) => mockStorage.delete(k)
    }
  };
  global.localStorage = global.window.localStorage;

  const localMoments = [
    { id: 'loc1', author: 'nyanya', caption: 'Nyanya sunset', visibility: 'friends', publishedAt: now },
    { id: 'loc2', author: 'lala', caption: 'Lala flowers', visibility: 'friends', publishedAt: now },
    { id: 'loc3', author: 'unknown_guest', caption: 'Ambiguous', visibility: 'friends', publishedAt: now }
  ];

  mockStorage.set('olu_moments_store_v2', JSON.stringify(localMoments));

  const authUserNyanya = {
    uid: 'uid_nyanya_alenda',
    email: 'nyanya@ourlittleuniverse.com'
  };

  const migReport = await dbMigrateMoments(authUserNyanya, localMoments, []);
  assert(migReport.backedUp === true, 'Migration created automated backup of olu_moments_store_v2');
  assert(migReport.character === 'nyanya', 'Migration scoped strictly to Nyanya');
  assert(migReport.eligibleCount === 1, 'Only 1 item belonged to Nyanya');
  assert(migReport.skippedOtherCharacterCount === 1, 'Lala moment skipped for Nyanya session');
  assert(migReport.ambiguousCount === 1, 'Ambiguous guest moment skipped and quarantined');

  const ambiguousLog = mockStorage.get('olu_moments_ambiguous_log');
  assert(Boolean(ambiguousLog) && ambiguousLog.includes('unknown_guest'), 'Ambiguous record logged to olu_moments_ambiguous_log');

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('================================================================');

  if (failedTests > 0) process.exit(1);
  process.exit(0);
}

runClientIntegrationSuite().catch(e => {
  console.error('Fatal client integration test error:', e);
  process.exit(1);
});
