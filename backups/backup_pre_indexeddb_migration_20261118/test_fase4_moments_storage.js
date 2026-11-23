/**
 * OUR LITTLE UNIVERSE — FASE 4 TEST SUITE
 * Our Little Moments, Personal Gallery, Firebase Storage & Security Rules
 */

function makeJwt(uid, email, emailVerified = true) {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    sub: uid,
    user_id: uid,
    email: email,
    email_verified: emailVerified,
    iss: 'https://securetoken.google.com/our-little-universe-dcd75',
    aud: 'our-little-universe-dcd75',
    auth_time: 1700000000,
    iat: 1700000000,
    exp: 1900000000
  })).toString('base64url');
  return `${header}.${payload}.`;
}

const FIRESTORE_BASE = 'http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents';
const STORAGE_BASE = 'http://127.0.0.1:9199/v0/b/our-little-universe-dcd75.firebasestorage.app/o';

const tokenNyanya = makeJwt('uid_nyanya_alenda', 'nyanya@ourlittleuniverse.com', true);
const tokenLala = makeJwt('uid_lala_bella', 'lala@ourlittleuniverse.com', true);
const tokenLele = makeJwt('uid_lele_vanya', 'lele@ourlittleuniverse.com', true);
const tokenStranger = makeJwt('uid_stranger_guest', 'stranger@example.com', true);

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

// Convert JSON object to Firestore REST fields format
function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (typeof val === 'number') {
      if (Number.isInteger(val)) {
        fields[key] = { integerValue: String(val) };
      } else {
        fields[key] = { doubleValue: val };
      }
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((item) => toFirestoreFields({ item }).item)
        }
      };
    } else if (typeof val === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(val) } };
    }
  }
  return fields;
}

// Helper to write Firestore document
async function setFirestoreDoc(collection, docId, data, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields: toFirestoreFields(data) })
  });
  return res;
}

// Helper to get Firestore document
async function getFirestoreDoc(collection, docId, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}`, {
    method: 'GET',
    headers
  });
  return res;
}

// Helper to delete Firestore document
async function deleteFirestoreDoc(collection, docId, token) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${FIRESTORE_BASE}/${collection}/${docId}`, {
    method: 'DELETE',
    headers
  });
  return res;
}

// Helper to upload media to Storage emulator
async function uploadStorageFile(storagePath, bytes, contentType, token) {
  const encodedName = encodeURIComponent(storagePath);
  const headers = { 'Content-Type': contentType };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${STORAGE_BASE}?uploadType=media&name=${encodedName}`, {
    method: 'POST',
    headers,
    body: bytes
  });
  return res;
}

// Helper to read media from Storage emulator
async function readStorageFile(storagePath, token) {
  const encodedName = encodeURIComponent(storagePath);
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${STORAGE_BASE}/${encodedName}?alt=media`, {
    method: 'GET',
    headers
  });
  return res;
}

// Helper to delete media from Storage emulator
async function deleteStorageFile(storagePath, token) {
  const encodedName = encodeURIComponent(storagePath);
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${STORAGE_BASE}/${encodedName}`, {
    method: 'DELETE',
    headers
  });
  return res;
}

async function runFase4Suite() {
  // Pre-test cleanup of test artifacts
  await deleteFirestoreDoc('moments', 'moment_nyanya_shared_001', tokenNyanya);
  await deleteFirestoreDoc('moments', 'moment_nyanya_private_001', tokenNyanya);
  await deleteFirestoreDoc('moments', 'moment_lala_001', tokenLala);
  await deleteFirestoreDoc('moments', 'moment_lele_001', tokenLele);

  console.log('================================================================');
  console.log('1. TEST: FIREBASE STORAGE SECURITY RULES & MIME/SIZE CHECKS');
  console.log('================================================================');

  const samplePng = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  const sampleMp4 = Buffer.from([0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109]); // ftypisom

  // 1.1 Upload photo as Nyanya to shared
  const upPhotoShared = await uploadStorageFile('moments/shared/uid_nyanya_alenda/photo1.png', samplePng, 'image/png', tokenNyanya);
  assert(upPhotoShared.status === 200, `Nyanya uploads shared photo (Status: ${upPhotoShared.status})`);

  // 1.2 Upload video as Nyanya to shared
  const upVideoShared = await uploadStorageFile('moments/shared/uid_nyanya_alenda/video1.mp4', sampleMp4, 'video/mp4', tokenNyanya);
  assert(upVideoShared.status === 200, `Nyanya uploads shared video MP4 (Status: ${upVideoShared.status})`);

  // 1.3 Upload photo as Nyanya to private
  const upPhotoPrivate = await uploadStorageFile('moments/private/uid_nyanya_alenda/secret.png', samplePng, 'image/png', tokenNyanya);
  assert(upPhotoPrivate.status === 200, `Nyanya uploads private photo (Status: ${upPhotoPrivate.status})`);

  // 1.4 Rejection of unsupported mime type (e.g. application/exe)
  const upBadMime = await uploadStorageFile('moments/shared/uid_nyanya_alenda/bad.exe', Buffer.from([77, 90]), 'application/x-msdownload', tokenNyanya);
  assert(upBadMime.status === 403, `Unsupported mime type blocked by Storage Rules (Status: ${upBadMime.status})`);

  // 1.5 Rejection of cross-account upload (Lala uploading to Nyanya's folder)
  const upCrossAccount = await uploadStorageFile('moments/shared/uid_nyanya_alenda/spoof.png', samplePng, 'image/png', tokenLala);
  assert(upCrossAccount.status === 403, `Cross-account upload spoof blocked by Storage Rules (Status: ${upCrossAccount.status})`);

  // 1.6 Unauthenticated upload rejection
  const upNoAuth = await uploadStorageFile('moments/shared/uid_nyanya_alenda/anon.png', samplePng, 'image/png', null);
  assert(upNoAuth.status === 403 || upNoAuth.status === 401, `Unauthenticated upload blocked (Status: ${upNoAuth.status})`);

  console.log('\n================================================================');
  console.log('2. TEST: STORAGE AUTHENTICATED READS & PRIVACY ISOLATION');
  console.log('================================================================');

  // 2.1 Owner (Nyanya) can read her shared photo
  const readOwnShared = await readStorageFile('moments/shared/uid_nyanya_alenda/photo1.png', tokenNyanya);
  assert(readOwnShared.status === 200, `Nyanya reads her own shared photo (Status: ${readOwnShared.status})`);

  // 2.2 Friend (Lala) can read Nyanya's shared photo
  const readFriendShared = await readStorageFile('moments/shared/uid_nyanya_alenda/photo1.png', tokenLala);
  assert(readFriendShared.status === 200, `Lala reads Nyanya shared photo (Status: ${readFriendShared.status})`);

  // 2.3 Friend (Lele) can read Nyanya's shared video
  const readLeleShared = await readStorageFile('moments/shared/uid_nyanya_alenda/video1.mp4', tokenLele);
  assert(readLeleShared.status === 200, `Lele reads Nyanya shared video (Status: ${readLeleShared.status})`);

  // 2.4 Owner (Nyanya) can read her private photo
  const readOwnPrivate = await readStorageFile('moments/private/uid_nyanya_alenda/secret.png', tokenNyanya);
  assert(readOwnPrivate.status === 200, `Nyanya reads her own private photo (Status: ${readOwnPrivate.status})`);

  // 2.5 Friend (Lala) is BLOCKED from reading Nyanya's private photo
  const readFriendPrivate = await readStorageFile('moments/private/uid_nyanya_alenda/secret.png', tokenLala);
  assert(readFriendPrivate.status === 403, `Lala strictly BLOCKED from reading Nyanya private photo (Status: ${readFriendPrivate.status})`);

  // 2.6 Stranger is BLOCKED from reading private photo
  const readStrangerPrivate = await readStorageFile('moments/private/uid_nyanya_alenda/secret.png', tokenStranger);
  assert(readStrangerPrivate.status === 403, `Stranger strictly BLOCKED from reading private photo (Status: ${readStrangerPrivate.status})`);

  // 2.7 Stranger is also BLOCKED from reading shared photo (Only 3 characters allowed)
  const readStrangerShared = await readStorageFile('moments/shared/uid_nyanya_alenda/photo1.png', tokenStranger);
  assert(readStrangerShared.status === 403, `Stranger strictly BLOCKED from reading Nyanya shared photo (Status: ${readStrangerShared.status})`);

  // 2.8 Unauthenticated read is BLOCKED for private photo
  const readAnonPrivate = await readStorageFile('moments/private/uid_nyanya_alenda/secret.png', null);
  assert(readAnonPrivate.status === 403 || readAnonPrivate.status === 401, `Unauthenticated read of private photo BLOCKED (Status: ${readAnonPrivate.status})`);

  // 2.9 Unauthenticated read is BLOCKED for shared photo
  const readAnonShared = await readStorageFile('moments/shared/uid_nyanya_alenda/photo1.png', null);
  assert(readAnonShared.status === 403 || readAnonShared.status === 401, `Unauthenticated read of shared photo BLOCKED (Status: ${readAnonShared.status})`);

  console.log('\n================================================================');
  console.log('3. TEST: FIRESTORE MOMENTS RULES — VALIDATION & CREATION');
  console.log('================================================================');

  const nowMs = Date.now();
  const lifespanMs = 24 * 60 * 60 * 1000;

  // 3.1 Valid shared moment creation by Nyanya
  const momentSharedPayload = {
    id: 'moment_nyanya_shared_001',
    authorUid: 'uid_nyanya_alenda',
    author: 'nyanya',
    authorName: 'Nyanya',
    mediaType: 'image',
    mimeType: 'image/png',
    storagePath: 'moments/shared/uid_nyanya_alenda/photo1.png',
    caption: 'Bintang pertama di senja KIDULT ⭐',
    visibility: 'friends',
    publishedAt: nowMs,
    expiresAt: nowMs + lifespanMs,
    likes: 0,
    isStory: true,
    isArchived: false,
    isDeleted: false,
    deleteStatus: 'active'
  };

  const createSharedRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', momentSharedPayload, tokenNyanya);
  assert(createSharedRes.status === 200, `Nyanya creates valid shared moment (Status: ${createSharedRes.status})`);

  // 3.2 Valid private moment creation by Nyanya
  const momentPrivatePayload = {
    id: 'moment_nyanya_private_001',
    authorUid: 'uid_nyanya_alenda',
    author: 'nyanya',
    authorName: 'Nyanya',
    mediaType: 'image',
    mimeType: 'image/png',
    storagePath: 'moments/private/uid_nyanya_alenda/secret.png',
    caption: 'Catatan rahasia galeri pribadi 🔒',
    visibility: 'private',
    publishedAt: nowMs,
    expiresAt: nowMs + lifespanMs,
    likes: 0,
    isStory: true,
    isArchived: false,
    isDeleted: false,
    deleteStatus: 'active'
  };

  const createPrivateRes = await setFirestoreDoc('moments', 'moment_nyanya_private_001', momentPrivatePayload, tokenNyanya);
  assert(createPrivateRes.status === 200, `Nyanya creates valid private moment (Status: ${createPrivateRes.status})`);

  // 3.3 Author UID Spoofing Rejection
  const spoofUidPayload = {
    ...momentSharedPayload,
    id: 'moment_spoof_uid',
    authorUid: 'uid_lala_bella' // Nyanya claims to be Lala UID
  };
  const spoofUidRes = await setFirestoreDoc('moments', 'moment_spoof_uid', spoofUidPayload, tokenNyanya);
  assert(spoofUidRes.status === 403, `Author UID spoofing strictly BLOCKED (Status: ${spoofUidRes.status})`);

  // 3.4 Character Spoofing Rejection (author: 'lala' with Nyanya's token)
  const spoofCharPayload = {
    ...momentSharedPayload,
    id: 'moment_spoof_char',
    author: 'lala' // Mismatch with token email nyanya@ourlittleuniverse.com
  };
  const spoofCharRes = await setFirestoreDoc('moments', 'moment_spoof_char', spoofCharPayload, tokenNyanya);
  assert(spoofCharRes.status === 403, `Character spoofing strictly BLOCKED by email mapping (Status: ${spoofCharRes.status})`);

  // 3.5 Storage Path & Visibility Mismatch Rejection
  const badPathPayload = {
    ...momentPrivatePayload,
    id: 'moment_bad_path',
    visibility: 'private',
    storagePath: 'moments/shared/uid_nyanya_alenda/secret.png' // Private visibility but shared path!
  };
  const badPathRes = await setFirestoreDoc('moments', 'moment_bad_path', badPathPayload, tokenNyanya);
  assert(badPathRes.status === 403, `Visibility/StoragePath mismatch strictly BLOCKED (Status: ${badPathRes.status})`);

  // 3.6 Stranger / Unauthenticated creation blocked
  const strangerCreateRes = await setFirestoreDoc('moments', 'moment_stranger', {
    ...momentSharedPayload,
    id: 'moment_stranger',
    authorUid: 'uid_stranger_guest',
    author: 'guest'
  }, tokenStranger);
  assert(strangerCreateRes.status === 403, `Stranger creation BLOCKED (Status: ${strangerCreateRes.status})`);

  console.log('\n================================================================');
  console.log('4. TEST: FIRESTORE MOMENTS READ & PRIVACY ENFORCEMENT');
  console.log('================================================================');

  // 4.1 Lala reads Nyanya's shared moment
  const readSharedRes = await getFirestoreDoc('moments', 'moment_nyanya_shared_001', tokenLala);
  assert(readSharedRes.status === 200, `Lala reads Nyanya's shared moment (Status: ${readSharedRes.status})`);

  // 4.2 Lala reading Nyanya's private moment is BLOCKED
  const readPrivateRes = await getFirestoreDoc('moments', 'moment_nyanya_private_001', tokenLala);
  assert(readPrivateRes.status === 403, `Lala strictly BLOCKED from reading Nyanya's private moment (Status: ${readPrivateRes.status})`);

  // 4.3 Lele reading Nyanya's private moment is BLOCKED
  const readPrivateLeleRes = await getFirestoreDoc('moments', 'moment_nyanya_private_001', tokenLele);
  assert(readPrivateLeleRes.status === 403, `Lele strictly BLOCKED from reading Nyanya's private moment (Status: ${readPrivateLeleRes.status})`);

  // 4.4 Nyanya reading her own private moment SUCCEEDS
  const readPrivateOwnerRes = await getFirestoreDoc('moments', 'moment_nyanya_private_001', tokenNyanya);
  assert(readPrivateOwnerRes.status === 200, `Nyanya successfully reads her own private moment (Status: ${readPrivateOwnerRes.status})`);

  console.log('\n================================================================');
  console.log('5. TEST: IMMUTABILITY & ANTI-MANIPULATION RULES');
  console.log('================================================================');

  // 5.1 Lala tries to update Nyanya's moment -> 403
  const lalaUpdateRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', {
    ...momentSharedPayload,
    caption: 'Hacked by Lala'
  }, tokenLala);
  assert(lalaUpdateRes.status === 403, `Non-owner update strictly BLOCKED (Status: ${lalaUpdateRes.status})`);

  // 5.2 Attempt to mutate immutable authorUid -> 403
  const mutateUidRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', {
    ...momentSharedPayload,
    authorUid: 'uid_lala_bella'
  }, tokenNyanya);
  assert(mutateUidRes.status === 403, `Immutability of authorUid enforced (Status: ${mutateUidRes.status})`);

  // 5.3 Attempt to mutate immutable mediaType -> 403
  const mutateTypeRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', {
    ...momentSharedPayload,
    mediaType: 'video'
  }, tokenNyanya);
  assert(mutateTypeRes.status === 403, `Immutability of mediaType enforced (Status: ${mutateTypeRes.status})`);

  // 5.4 Attempt to mutate immutable publishedAt -> 403
  const mutatePubRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', {
    ...momentSharedPayload,
    publishedAt: 1000
  }, tokenNyanya);
  assert(mutatePubRes.status === 403, `Immutability of publishedAt enforced (Status: ${mutatePubRes.status})`);

  // 5.5 Attempt to mutate immutable expiresAt -> 403
  const mutateExpRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', {
    ...momentSharedPayload,
    expiresAt: 999999999999
  }, tokenNyanya);
  assert(mutateExpRes.status === 403, `Immutability of expiresAt enforced (Status: ${mutateExpRes.status})`);

  // 5.6 Attempt to mutate immutable storagePath -> 403
  const mutatePathRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', {
    ...momentSharedPayload,
    storagePath: 'moments/shared/uid_nyanya_alenda/other.png'
  }, tokenNyanya);
  assert(mutatePathRes.status === 403, `Immutability of storagePath enforced (Status: ${mutatePathRes.status})`);

  // 5.7 Attempt to mutate immutable visibility -> 403
  const mutateVisRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', {
    ...momentSharedPayload,
    visibility: 'private'
  }, tokenNyanya);
  assert(mutateVisRes.status === 403, `Immutability of visibility enforced (Status: ${mutateVisRes.status})`);

  // 5.8 Valid caption update by owner -> 200
  const validCaptionRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', {
    ...momentSharedPayload,
    caption: 'Bintang pertama di senja KIDULT (Pembaruan) ⭐✨'
  }, tokenNyanya);
  assert(validCaptionRes.status === 200, `Owner updates valid caption (Status: ${validCaptionRes.status})`);

  console.log('\n================================================================');
  console.log('6. TEST: SAFE TWO-PHASE DELETION & RETRY MECHANISM');
  console.log('================================================================');

  // 6.1 Non-owner (Lala) tries to delete Nyanya's moment -> 403
  const lalaDeleteRes = await deleteFirestoreDoc('moments', 'moment_nyanya_shared_001', tokenLala);
  assert(lalaDeleteRes.status === 403, `Non-owner delete strictly BLOCKED (Status: ${lalaDeleteRes.status})`);

  // 6.2 Phase 1: Mark isDeleted: true and deleteStatus: 'pending_storage_cleanup'
  const markDeletedRes = await setFirestoreDoc('moments', 'moment_nyanya_shared_001', {
    ...momentSharedPayload,
    caption: 'Bintang pertama di senja KIDULT (Pembaruan) ⭐✨',
    isDeleted: true,
    deleteStatus: 'pending_storage_cleanup'
  }, tokenNyanya);
  assert(markDeletedRes.status === 200, `Phase 1: Owner marks isDeleted: true (Status: ${markDeletedRes.status})`);

  // 6.3 Friend (Lala) reading soft-deleted moment is now BLOCKED (hidden from gallery & tray)
  const lalaReadDeleted = await getFirestoreDoc('moments', 'moment_nyanya_shared_001', tokenLala);
  assert(lalaReadDeleted.status === 403, `Soft-deleted moment is hidden from friends (Status: ${lalaReadDeleted.status})`);

  // 6.4 Owner can still read soft-deleted document to complete storage cleanup
  const ownerReadDeleted = await getFirestoreDoc('moments', 'moment_nyanya_shared_001', tokenNyanya);
  assert(ownerReadDeleted.status === 200, `Owner can read soft-deleted moment for cleanup (Status: ${ownerReadDeleted.status})`);

  // 6.5 Phase 2: Delete file from Storage
  const delStorageRes = await deleteStorageFile('moments/shared/uid_nyanya_alenda/photo1.png', tokenNyanya);
  assert(delStorageRes.status === 200 || delStorageRes.status === 204, `Phase 2: Storage file deleted (Status: ${delStorageRes.status})`);

  // 6.6 Phase 3: Delete Firestore document permanently
  const delDocRes = await deleteFirestoreDoc('moments', 'moment_nyanya_shared_001', tokenNyanya);
  assert(delDocRes.status === 200, `Phase 3: Firestore document deleted permanently (Status: ${delDocRes.status})`);

  // 6.7 Verify document is gone
  const checkGone = await getFirestoreDoc('moments', 'moment_nyanya_shared_001', tokenNyanya);
  assert(checkGone.status === 404, `Document is completely removed from Firestore (Status: ${checkGone.status})`);

  console.log('\n================================================================');
  console.log('7. TEST: LALA & LELE MOMENTS CREATION & THREE-ACCOUNT ISOLATION');
  console.log('================================================================');

  // 7.1 Lala creates shared moment
  await uploadStorageFile('moments/shared/uid_lala_bella/lala_sun.png', samplePng, 'image/png', tokenLala);
  const lalaCreateRes = await setFirestoreDoc('moments', 'moment_lala_001', {
    id: 'moment_lala_001',
    authorUid: 'uid_lala_bella',
    author: 'lala',
    authorName: 'Lala',
    mediaType: 'image',
    storagePath: 'moments/shared/uid_lala_bella/lala_sun.png',
    caption: 'Taman bunga TO YOU yang cerah ☀️',
    visibility: 'friends',
    publishedAt: nowMs,
    expiresAt: nowMs + lifespanMs,
    likes: 1,
    isStory: true,
    isArchived: false,
    isDeleted: false,
    deleteStatus: 'active'
  }, tokenLala);
  assert(lalaCreateRes.status === 200, `Lala creates shared moment (Status: ${lalaCreateRes.status})`);

  // 7.2 Lele creates shared moment
  await uploadStorageFile('moments/shared/uid_lele_vanya/lele_moon.png', samplePng, 'image/png', tokenLele);
  const leleCreateRes = await setFirestoreDoc('moments', 'moment_lele_001', {
    id: 'moment_lele_001',
    authorUid: 'uid_lele_vanya',
    author: 'lele',
    authorName: 'Lele',
    mediaType: 'image',
    storagePath: 'moments/shared/uid_lele_vanya/lele_moon.png',
    caption: 'Cahaya gerhana di observatorium SHADOW 🌙',
    visibility: 'friends',
    publishedAt: nowMs,
    expiresAt: nowMs + lifespanMs,
    likes: 2,
    isStory: true,
    isArchived: false,
    isDeleted: false,
    deleteStatus: 'active'
  }, tokenLele);
  assert(leleCreateRes.status === 200, `Lele creates shared moment (Status: ${leleCreateRes.status})`);

  // 7.3 Nyanya can read Lala and Lele moments
  const nyanyaReadsLala = await getFirestoreDoc('moments', 'moment_lala_001', tokenNyanya);
  const nyanyaReadsLele = await getFirestoreDoc('moments', 'moment_lele_001', tokenNyanya);
  assert(nyanyaReadsLala.status === 200, `Nyanya reads Lala shared moment (Status: ${nyanyaReadsLala.status})`);
  assert(nyanyaReadsLele.status === 200, `Nyanya reads Lele shared moment (Status: ${nyanyaReadsLele.status})`);

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
  process.exit(0);
}

runFase4Suite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});

