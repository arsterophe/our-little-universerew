/**
 * OUR LITTLE UNIVERSE — FASE 3 TEST SUITE
 * Profile, Personal Writing (Drafts), and Our Stories (Published)
 * 
 * Tests:
 * 1. User Profile CRUD & Role Escalation Prevention
 * 2. Story / Personal Writing (Draft) Isolation
 * 3. Our Stories (Published) Library Sharing & Immutability
 * 4. Author-Only Update & Delete Enforcement
 * 5. Idempotent Migration with Backup & Ambiguity Isolation
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

const BASE_URL = 'http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents';

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

async function runFase3Tests() {
  try {
    await fetch('http://127.0.0.1:8080/emulator/v1/projects/our-little-universe-dcd75/databases/(default)/documents', { method: 'DELETE' });
  } catch (_) {}

  console.log('================================================================');
  console.log('FASE 3 TEST SUITE: PROFILE, PERSONAL WRITING, & OUR STORIES');
  console.log('================================================================');

  // -------------------------------------------------------------------------
  // 1. USER PROFILE TESTING
  // -------------------------------------------------------------------------
  console.log('\n--- 1. User Profile CRUD & Security Rules ---');

  // Nyanya creates her profile
  const createNyanyaProfile = await fetch(`${BASE_URL}/users/uid_nyanya_alenda`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        uid: { stringValue: 'uid_nyanya_alenda' },
        characterKey: { stringValue: 'nyanya' },
        displayName: { stringValue: 'Alenda (Nyanya)' },
        role: { stringValue: 'The Moonlit Shadow Witch' },
        avatar: { stringValue: '/assets/avatar_nyanya_hd.png' },
        createdAt: { stringValue: new Date().toISOString() },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    })
  });
  assert(createNyanyaProfile.status === 200, 'Nyanya creates her public user profile (Status 200)');

  // Lala reads Nyanya public profile
  const readNyanyaProfile = await fetch(`${BASE_URL}/users/uid_nyanya_alenda`, {
    headers: { 'Authorization': `Bearer ${tokenLala}` }
  });
  assert(readNyanyaProfile.status === 200, 'Lala can view Nyanya public profile (Status 200)');

  // Lala tries to tamper with Nyanya profile
  const lalaTamper = await fetch(`${BASE_URL}/users/uid_nyanya_alenda`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        displayName: { stringValue: 'Hacked by Lala' }
      }
    })
  });
  assert(lalaTamper.status === 403, 'Lala BLOCKED from editing Nyanya profile (Status 403 Forbidden)');

  // Nyanya tries role escalation (changing role to Admin)
  const nyanyaRoleEscalate = await fetch(`${BASE_URL}/users/uid_nyanya_alenda`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        uid: { stringValue: 'uid_nyanya_alenda' },
        characterKey: { stringValue: 'nyanya' },
        displayName: { stringValue: 'Alenda (Nyanya)' },
        role: { stringValue: 'Superadmin' }, // Escalate!
        avatar: { stringValue: '/assets/avatar_nyanya_hd.png' }
      }
    })
  });
  assert(nyanyaRoleEscalate.status === 403, 'Nyanya BLOCKED from escalating her role (Status 403 Forbidden)');

  // Nyanya updates her allowed field (displayName)
  const nyanyaValidUpdate = await fetch(`${BASE_URL}/users/uid_nyanya_alenda`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        uid: { stringValue: 'uid_nyanya_alenda' },
        characterKey: { stringValue: 'nyanya' },
        displayName: { stringValue: 'Alenda Nyanya Updated ✨' },
        role: { stringValue: 'The Moonlit Shadow Witch' },
        avatar: { stringValue: '/assets/avatar_nyanya_hd.png' },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    })
  });
  assert(nyanyaValidUpdate.status === 200, 'Nyanya ALLOWED to update allowed profile fields (Status 200)');

  // -------------------------------------------------------------------------
  // 2. PERSONAL WRITING (DRAFT) ISOLATION
  // -------------------------------------------------------------------------
  console.log('\n--- 2. Personal Writing (Draft) Privacy & Isolation ---');

  const draftId = 'story-nyanya-draft-001';
  const createDraft = await fetch(`${BASE_URL}/stories/${draftId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        id: { stringValue: draftId },
        title: { stringValue: 'Catatan Rahasia Malam Hari di Menara' },
        content: { stringValue: 'Ini adalah draft cerita pribadi yang belum dipublikasikan.' },
        status: { stringValue: 'draft' },
        authorUid: { stringValue: 'uid_nyanya_alenda' },
        authorChar: { stringValue: 'nyanya' },
        authorName: { stringValue: 'Nyanya' },
        category: { stringValue: 'puisi' },
        genre: { stringValue: 'Puisi & Renungan' },
        createdAt: { stringValue: new Date().toISOString() },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    })
  });
  assert(createDraft.status === 200, 'Nyanya creates Personal Writing draft (Status 200)');

  // Nyanya reads her own draft
  const readOwnDraft = await fetch(`${BASE_URL}/stories/${draftId}`, {
    headers: { 'Authorization': `Bearer ${tokenNyanya}` }
  });
  assert(readOwnDraft.status === 200, 'Nyanya can read her own draft (Status 200)');

  // Lala tries to read Nyanya draft -> MUST BE 403 Forbidden
  const lalaReadDraft = await fetch(`${BASE_URL}/stories/${draftId}`, {
    headers: { 'Authorization': `Bearer ${tokenLala}` }
  });
  assert(lalaReadDraft.status === 403, 'Lala BLOCKED from reading Nyanya draft (Status 403 Forbidden)');

  // Lele tries to read Nyanya draft -> MUST BE 403 Forbidden
  const leleReadDraft = await fetch(`${BASE_URL}/stories/${draftId}`, {
    headers: { 'Authorization': `Bearer ${tokenLele}` }
  });
  assert(leleReadDraft.status === 403, 'Lele BLOCKED from reading Nyanya draft (Status 403 Forbidden)');

  // -------------------------------------------------------------------------
  // 3. OUR STORIES (PUBLISHED) & AUTHOR IMMUTABILITY
  // -------------------------------------------------------------------------
  console.log('\n--- 3. Our Stories (Published) Sharing & Immutability ---');

  const pubStoryId = 'story-nyanya-pub-001';
  const createPublished = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        id: { stringValue: pubStoryId },
        title: { stringValue: 'Kisah Tiga Bintang di Langit Senja' },
        content: { stringValue: 'Pada suatu ketika di alam semesta kecil kami...' },
        status: { stringValue: 'published' },
        authorUid: { stringValue: 'uid_nyanya_alenda' },
        authorChar: { stringValue: 'nyanya' },
        authorName: { stringValue: 'Nyanya' },
        category: { stringValue: 'novel' },
        genre: { stringValue: 'Fantasi Kosmik' },
        createdAt: { stringValue: new Date().toISOString() },
        updatedAt: { stringValue: new Date().toISOString() },
        publishedAt: { stringValue: new Date().toISOString() }
      }
    })
  });
  assert(createPublished.status === 200, 'Nyanya publishes story to Our Stories (Status 200)');

  // Lala reads published story
  const lalaReadPub = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    headers: { 'Authorization': `Bearer ${tokenLala}` }
  });
  assert(lalaReadPub.status === 200, 'Lala ALLOWED to read published story (Status 200)');

  // Lele reads published story
  const leleReadPub = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    headers: { 'Authorization': `Bearer ${tokenLele}` }
  });
  assert(leleReadPub.status === 200, 'Lele ALLOWED to read published story (Status 200)');

  // Lala tries to edit Nyanya published story
  const lalaTamperStory = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenLala}` },
    body: JSON.stringify({
      fields: {
        title: { stringValue: 'Judul Diubah Oleh Lala' }
      }
    })
  });
  assert(lalaTamperStory.status === 403, 'Lala BLOCKED from updating Nyanya story (Status 403 Forbidden)');

  // Lala tries to delete Nyanya published story
  const lalaDeleteStory = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenLala}` }
  });
  assert(lalaDeleteStory.status === 403, 'Lala BLOCKED from deleting Nyanya story (Status 403 Forbidden)');

  // Nyanya updates her own published story
  const nyanyaUpdateStory = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        id: { stringValue: pubStoryId },
        title: { stringValue: 'Kisah Tiga Bintang di Langit Senja (Revisi Emas)' },
        content: { stringValue: 'Pada suatu ketika di alam semesta kecil kami yang megah...' },
        status: { stringValue: 'published' },
        authorUid: { stringValue: 'uid_nyanya_alenda' },
        authorChar: { stringValue: 'nyanya' },
        authorName: { stringValue: 'Nyanya' },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    })
  });
  assert(nyanyaUpdateStory.status === 200, 'Nyanya ALLOWED to update her own story (Status 200)');

  // Nyanya tries to change authorUid to someone else (Immutability Violation)
  const nyanyaTamperAuthorUid = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        id: { stringValue: pubStoryId },
        title: { stringValue: 'Kisah Tiga Bintang' },
        content: { stringValue: 'Konten...' },
        status: { stringValue: 'published' },
        authorUid: { stringValue: 'uid_lala_bella' }, // Tamper!
        authorChar: { stringValue: 'nyanya' }
      }
    })
  });
  assert(nyanyaTamperAuthorUid.status === 403, 'Author BLOCKED from altering authorUid (Status 403 Forbidden)');

  // Nyanya unpublishes her story back to draft
  const nyanyaUnpublish = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        id: { stringValue: pubStoryId },
        title: { stringValue: 'Kisah Tiga Bintang di Langit Senja (Draft)' },
        content: { stringValue: 'Konten draft...' },
        status: { stringValue: 'draft' }, // Unpublished!
        authorUid: { stringValue: 'uid_nyanya_alenda' },
        authorChar: { stringValue: 'nyanya' },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    })
  });
  assert(nyanyaUnpublish.status === 200, 'Nyanya unpublishes her story back to draft (Status 200)');

  // Lala now tries to read the unpublished story -> MUST BE 403 Forbidden
  const lalaReadUnpublished = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    headers: { 'Authorization': `Bearer ${tokenLala}` }
  });
  assert(lalaReadUnpublished.status === 403, 'Lala BLOCKED from reading story after it was unpublished (Status 403 Forbidden)');

  // Nyanya deletes her own story
  const nyanyaDeleteStory = await fetch(`${BASE_URL}/stories/${pubStoryId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${tokenNyanya}` }
  });
  assert(nyanyaDeleteStory.status === 200, 'Nyanya deletes her own story (Status 200)');

  // -------------------------------------------------------------------------
  // 4. ANTI-SPOOFING AUTHOR & CHARACTER BINDING
  // -------------------------------------------------------------------------
  console.log('\n--- 4. Anti-Spoofing & Character Binding ---');

  // Nyanya tries to create a story with authorChar: 'lele'
  const spoofStory = await fetch(`${BASE_URL}/stories/story-spoof-001`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${tokenNyanya}` },
    body: JSON.stringify({
      fields: {
        id: { stringValue: 'story-spoof-001' },
        title: { stringValue: 'Cerita Palsu Mengaku Lele' },
        content: { stringValue: 'Mencoba mengaku sebagai Lele...' },
        status: { stringValue: 'published' },
        authorUid: { stringValue: 'uid_nyanya_alenda' },
        authorChar: { stringValue: 'lele' }, // Spoofed character!
        createdAt: { stringValue: new Date().toISOString() },
        updatedAt: { stringValue: new Date().toISOString() }
      }
    })
  });
  assert(spoofStory.status === 403, 'Account BLOCKED from creating story claiming another character identity (Status 403 Forbidden)');

  // Anonymous user tries to read drafts
  const anonRead = await fetch(`${BASE_URL}/stories/${draftId}`);
  assert(anonRead.status === 403, 'Unauthenticated user BLOCKED from reading stories (Status 403 Forbidden)');

  console.log('\n================================================================');
  console.log(`FASE 3 TEST SUITE RESULTS: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================');
}

runFase3Tests().catch(console.error);

