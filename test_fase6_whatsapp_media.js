/**
 * OUR LITTLE UNIVERSE — FASE 6 WHATSAPP-LIKE RICH MEDIA TEST SUITE
 * Tests photo, video, document, audio, and voice note message persistence,
 * Storage security rules, participant privacy isolation, and frontend formatting.
 */

import './load_env.js';
import {
  formatDuration,
  formatFileSize,
  getConversationId,
  CONVERSATION_PARTICIPANTS,
  MAX_MESSAGE_MEDIA_SIZE_BYTES
} from './messages.js';

const PROJECT_ID = 'our-little-universe-dcd75';
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || '127.0.0.1:8080';
const FIREBASE_STORAGE_EMULATOR_HOST = process.env.FIREBASE_STORAGE_EMULATOR_HOST || '127.0.0.1:9199';

const FIRESTORE_BASE_URL = `http://${FIRESTORE_EMULATOR_HOST}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const STORAGE_BASE_URL = `http://${FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${PROJECT_ID}.appspot.com/o`;

// Characters test tokens
function createTestToken(characterKey) {
  const users = {
    nyanya: { uid: 'uid-nyanya-vanya-test', email: 'nyanya@ourlittleuniverse.com' },
    lala: { uid: 'uid-lala-bella-test', email: 'lala@ourlittleuniverse.com' },
    lele: { uid: 'uid-lele-alenda-test', email: 'lele@ourlittleuniverse.com' },
    stranger: { uid: 'uid-stranger-intruder', email: 'intruder@unknown.com' }
  };

  const user = users[characterKey] || users.nyanya;
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: `https://securetoken.google.com/${PROJECT_ID}`,
    aud: PROJECT_ID,
    auth_time: Math.floor(Date.now() / 1000),
    user_id: user.uid,
    sub: user.uid,
    email: user.email,
    email_verified: true,
    firebase: { sign_in_provider: 'password' }
  })).toString('base64url');

  return `${header}.${payload}.`;
}

// REST helper for Storage upload via emulator
async function uploadToStorage(storagePath, content, contentType, token) {
  const encodedPath = encodeURIComponent(storagePath);
  const url = `${STORAGE_BASE_URL}/${encodedPath}?uploadType=media`;

  const headers = {
    'Content-Type': contentType,
    'x-goog-meta-author': 'test'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: content
  });
  return res.status;
}

// REST helper for Storage download via emulator
async function downloadFromStorage(storagePath, token) {
  const encodedPath = encodeURIComponent(storagePath);
  const url = `${STORAGE_BASE_URL}/${encodedPath}?alt=media`;

  const headers = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: 'GET',
    headers
  });
  return res.status;
}

// REST helper for Firestore writes
async function writeFirestoreDoc(collectionName, docId, fields, token) {
  const url = `${FIRESTORE_BASE_URL}/${collectionName}/${docId}`;
  const firestoreFields = {};

  for (const [key, value] of Object.entries(fields)) {
    if (typeof value === 'string') {
      firestoreFields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      firestoreFields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === 'boolean') {
      firestoreFields[key] = { booleanValue: value };
    } else if (Array.isArray(value)) {
      firestoreFields[key] = {
        arrayValue: {
          values: value.map((v) => ({ stringValue: String(v) }))
        }
      };
    } else if (typeof value === 'object' && value !== null) {
      const mapVal = {};
      for (const [k, v] of Object.entries(value)) {
        mapVal[k] = { booleanValue: Boolean(v) };
      }
      firestoreFields[key] = { mapValue: { fields: mapVal } };
    }
  }

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ fields: firestoreFields })
  });

  return res.status;
}

async function runSuite() {
  console.log('\n=============================================================');
  console.log('   OUR LITTLE UNIVERSE — FASE 6: WHATSAPP-LIKE MEDIA SUITE   ');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  const tokenNyanya = createTestToken('nyanya');
  const tokenLala = createTestToken('lala');
  const tokenLele = createTestToken('lele');
  const tokenStranger = createTestToken('stranger');

  console.log('--- SECTION 1: Utility Formatter Verification ---');
  assert(formatDuration(0) === '0:00', 'formatDuration(0) returns 0:00');
  assert(formatDuration(45) === '0:45', 'formatDuration(45) returns 0:45');
  assert(formatDuration(75) === '1:15', 'formatDuration(75) returns 1:15');
  assert(formatDuration(360) === '6:00', 'formatDuration(360) returns 6:00');

  assert(formatFileSize(500) === '500 B', 'formatFileSize(500) returns 500 B');
  assert(formatFileSize(1024) === '1 KB', 'formatFileSize(1024) returns 1 KB');
  assert(formatFileSize(2.5 * 1024 * 1024) === '2.5 MB', 'formatFileSize(2.5MB) returns 2.5 MB');
  assert(MAX_MESSAGE_MEDIA_SIZE_BYTES === 50 * 1024 * 1024, 'MAX_MESSAGE_MEDIA_SIZE_BYTES is 50MB');

  console.log('\n--- SECTION 2: Photo Upload & Privacy Barriers ---');
  const photoPath = 'messages/lala_nyanya/uid-nyanya-vanya-test/foto_pantai.jpg';
  const photoContent = Buffer.from('FAKE_JPEG_IMAGE_BINARY_DATA');
  const uploadPhotoStatus = await uploadToStorage(photoPath, photoContent, 'image/jpeg', tokenNyanya);
  assert(uploadPhotoStatus === 200, `Nyanya uploads photo to lala_nyanya -> Status 200 (Got ${uploadPhotoStatus})`);

  const readPhotoNyanya = await downloadFromStorage(photoPath, tokenNyanya);
  assert(readPhotoNyanya === 200, `Nyanya (author) can download photo -> Status 200 (Got ${readPhotoNyanya})`);

  const readPhotoLala = await downloadFromStorage(photoPath, tokenLala);
  assert(readPhotoLala === 200, `Lala (participant) can download photo -> Status 200 (Got ${readPhotoLala})`);

  const readPhotoLele = await downloadFromStorage(photoPath, tokenLele);
  assert(readPhotoLele === 403, `PRIVACY: Lele (non-participant) CANNOT access photo in lala_nyanya -> 403 Forbidden (Got ${readPhotoLele})`);

  const readPhotoStranger = await downloadFromStorage(photoPath, tokenStranger);
  assert(readPhotoStranger === 403, `SECURITY: Stranger CANNOT access photo -> 403 Forbidden (Got ${readPhotoStranger})`);

  const unauthPhoto = await downloadFromStorage(photoPath, null);
  assert(unauthPhoto === 403, `SECURITY: Unauthenticated request CANNOT access photo -> 403 Forbidden (Got ${unauthPhoto})`);

  console.log('\n--- SECTION 3: Video Upload & Privacy Barriers ---');
  const videoPath = 'messages/lala_lele/uid-lala-bella-test/senja_indah.mp4';
  const videoContent = Buffer.from('FAKE_MP4_VIDEO_BINARY_DATA');
  const uploadVideoStatus = await uploadToStorage(videoPath, videoContent, 'video/mp4', tokenLala);
  assert(uploadVideoStatus === 200, `Lala uploads video to lala_lele -> Status 200 (Got ${uploadVideoStatus})`);

  const readVideoLele = await downloadFromStorage(videoPath, tokenLele);
  assert(readVideoLele === 200, `Lele (participant) can download video -> Status 200 (Got ${readVideoLele})`);

  const readVideoNyanya = await downloadFromStorage(videoPath, tokenNyanya);
  assert(readVideoNyanya === 403, `PRIVACY: Nyanya (non-participant) CANNOT access video in lala_lele -> 403 Forbidden (Got ${readVideoNyanya})`);

  console.log('\n--- SECTION 4: Document Upload & Group Access ---');
  const docPath = 'messages/all_friends/uid-lele-alenda-test/rencana_liburan.pdf';
  const docContent = Buffer.from('FAKE_PDF_DOCUMENT_BINARY');
  const uploadDocStatus = await uploadToStorage(docPath, docContent, 'application/pdf', tokenLele);
  assert(uploadDocStatus === 200, `Lele uploads PDF document to all_friends -> Status 200 (Got ${uploadDocStatus})`);

  const readDocNyanya = await downloadFromStorage(docPath, tokenNyanya);
  assert(readDocNyanya === 200, `Nyanya (group member) can download document -> Status 200 (Got ${readDocNyanya})`);

  const readDocLala = await downloadFromStorage(docPath, tokenLala);
  assert(readDocLala === 200, `Lala (group member) can download document -> Status 200 (Got ${readDocLala})`);

  const readDocStranger = await downloadFromStorage(docPath, tokenStranger);
  assert(readDocStranger === 403, `Stranger CANNOT download document in all_friends -> 403 Forbidden (Got ${readDocStranger})`);

  console.log('\n--- SECTION 5: Voice Note & Audio Uploads ---');
  const voicePath = 'messages/lala_nyanya/uid-nyanya-vanya-test/voice_catatan.webm';
  const voiceContent = Buffer.from('FAKE_WEBM_VOICE_NOTE_BINARY');
  const uploadVoiceStatus = await uploadToStorage(voicePath, voiceContent, 'audio/webm', tokenNyanya);
  assert(uploadVoiceStatus === 200, `Nyanya uploads voice note to lala_nyanya -> Status 200 (Got ${uploadVoiceStatus})`);

  const readVoiceLala = await downloadFromStorage(voicePath, tokenLala);
  assert(readVoiceLala === 200, `Lala can play voice note -> Status 200 (Got ${readVoiceLala})`);

  const audioPath = 'messages/all_friends/uid-lala-bella-test/lagu_sahabat.mp3';
  const audioContent = Buffer.from('FAKE_MP3_AUDIO_BINARY');
  const uploadAudioStatus = await uploadToStorage(audioPath, audioContent, 'audio/mpeg', tokenLala);
  assert(uploadAudioStatus === 200, `Lala uploads audio to all_friends -> Status 200 (Got ${uploadAudioStatus})`);

  console.log('\n--- SECTION 6: Firestore Message Schema Validation with Attachments ---');
  const msgImagePayload = {
    id: `msg-photo-${Date.now()}`,
    conversationId: 'lala_nyanya',
    senderUid: 'uid-nyanya-vanya-test',
    senderCharacter: 'nyanya',
    senderName: 'Nyanya',
    senderAvatar: '/assets/avatar_nyanya_hd.png',
    participants: ['lala', 'nyanya'],
    type: 'image',
    storagePath: photoPath,
    fileName: 'foto_pantai.jpg',
    fileSize: photoContent.length,
    mimeType: 'image/jpeg',
    text: 'Ini fotoku waktu di pantai kemarin! 🏖️',
    createdAt: Date.now(),
    readBy: { nyanya: true }
  };
  const writeImageMsg = await writeFirestoreDoc('messages', msgImagePayload.id, msgImagePayload, tokenNyanya);
  assert(writeImageMsg === 200, `Firestore accepts image message with caption -> Status 200 (Got ${writeImageMsg})`);

  // Voice note without text (pure audio message)
  const msgVoicePayload = {
    id: `msg-voice-${Date.now()}`,
    conversationId: 'lala_nyanya',
    senderUid: 'uid-nyanya-vanya-test',
    senderCharacter: 'nyanya',
    senderName: 'Nyanya',
    senderAvatar: '/assets/avatar_nyanya_hd.png',
    participants: ['lala', 'nyanya'],
    type: 'voice',
    storagePath: voicePath,
    fileName: 'voice_catatan.webm',
    fileSize: voiceContent.length,
    mimeType: 'audio/webm',
    duration: 15,
    text: '',
    createdAt: Date.now(),
    readBy: { nyanya: true }
  };
  const writeVoiceMsg = await writeFirestoreDoc('messages', msgVoicePayload.id, msgVoicePayload, tokenNyanya);
  assert(writeVoiceMsg === 200, `Firestore accepts voice note without text -> Status 200 (Got ${writeVoiceMsg})`);

  // Document message in all_friends
  const msgDocPayload = {
    id: `msg-doc-${Date.now()}`,
    conversationId: 'all_friends',
    senderUid: 'uid-lele-alenda-test',
    senderCharacter: 'lele',
    senderName: 'Lele',
    senderAvatar: '/assets/avatar_lele_hd.png',
    participants: ['lala', 'lele', 'nyanya'],
    type: 'file',
    storagePath: docPath,
    fileName: 'rencana_liburan.pdf',
    fileSize: docContent.length,
    mimeType: 'application/pdf',
    text: 'Jadwal kumpul kita bulan depan ✨',
    createdAt: Date.now(),
    readBy: { lele: true }
  };
  const writeDocMsg = await writeFirestoreDoc('messages', msgDocPayload.id, msgDocPayload, tokenLele);
  assert(writeDocMsg === 200, `Firestore accepts document message in trio chat -> Status 200 (Got ${writeDocMsg})`);

  console.log('\n--- SECTION 7: Anti-Spoofing & Security Boundary Tests ---');
  // Forged senderUid in storage path
  const forgedPath = 'messages/lala_nyanya/uid-stranger-intruder/evil.jpg';
  const forgedUpload = await uploadToStorage(forgedPath, Buffer.from('FAKE'), 'image/jpeg', tokenNyanya);
  assert(forgedUpload === 403, `Anti-Spoofing: Nyanya cannot upload to stranger UID storage path -> 403 Forbidden (Got ${forgedUpload})`);

  // Upload to a conversation not belonging to sender
  const wrongConvPath = 'messages/lala_lele/uid-nyanya-vanya-test/intrude.jpg';
  const wrongConvUpload = await uploadToStorage(wrongConvPath, Buffer.from('FAKE'), 'image/jpeg', tokenNyanya);
  assert(wrongConvUpload === 403, `Privacy: Nyanya cannot upload to lala_lele conversation -> 403 Forbidden (Got ${wrongConvUpload})`);

  console.log('\n=============================================================');
  console.log(`FASE 6 WHATSAPP MEDIA TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});

