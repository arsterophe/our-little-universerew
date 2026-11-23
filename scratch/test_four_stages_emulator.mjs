/**
 * CONTROLLED FIRESTORE EMULATOR TEST SUITE: 4 SEPARATE STAGES & AUDIT
 * Tests each Firestore operation individually and together for Syma & Lele:
 * Stage A: Create message document only (/messages/{messageId})
 * Stage B: Create or update conversation document only (/conversations/{conversationId})
 * Stage C: Create notification document only (/orbit_notifications/{notificationId})
 * Stage D: Atomic Batch Write of all 3 documents together via Firestore Commit API
 * Stage E: Reply flow (Lele -> Syma) and non-participant privacy isolation
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

const PROJECT_ID = 'our-little-universe-dcd75';
const BASE_URL = `http://127.0.0.1:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const COMMIT_URL = `http://127.0.0.1:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents:commit`;

// Canonical Character Identifiers
const SYMA_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';
const LELE_UID = '1ArxphLQpAOoOIvH9BKYw0ebD1e2';
const NYANYA_UID = '1uwba7MrGVU3xHu57VVLvztskrg2';

const SYMA_TOKEN = makeJwt(SYMA_UID, 'abil@ourlittleuniverse.com', true);
const LELE_TOKEN = makeJwt(LELE_UID, 'lele@ourlittleuniverse.com', true);
const NYANYA_TOKEN = makeJwt(NYANYA_UID, 'nyanya@ourlittleuniverse.com', true);

function inspectTypes(obj) {
  const result = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null) result[k] = 'null';
    else if (Array.isArray(v)) result[k] = `Array(${v.length})`;
    else if (typeof v === 'object') result[k] = `Object(${Object.keys(v).join(',')})`;
    else result[k] = typeof v;
  }
  return result;
}

async function runControlledTest() {
  console.log('=============================================================');
  console.log('   CONTROLLED 4-STAGE FIRESTORE EMULATOR DIAGNOSTIC SUITE    ');
  console.log('=============================================================');
  console.log('Target Project ID :', PROJECT_ID);
  console.log('Active User (Syma):', SYMA_UID, '(abil@ourlittleuniverse.com)');
  console.log('Target User (Lele):', LELE_UID, '(lele@ourlittleuniverse.com)');
  console.log('Conversation ID   :', 'abil_lele\n');

  let passed = 0;
  let failed = 0;

  function record(cond, name, details) {
    if (cond) {
      passed++;
      console.log(`[PASS] ${name}`);
      if (details) console.log('       Details:', details);
    } else {
      failed++;
      console.error(`[FAIL] ${name}`);
      if (details) console.error('       Details:', details);
    }
  }

  const nowMs = Date.now();
  const convId = 'abil_lele';
  const participants = ['lele', 'abil'];

  // -------------------------------------------------------------
  // STAGE A: Create message document ONLY (/messages/{messageId})
  // -------------------------------------------------------------
  console.log('\n--- [STAGE A] Uji Pembuatan Dokumen Pesan Saja ---');
  const stageAMsgId = `msg-stageA-${nowMs}`;
  const messageData = {
    id: stageAMsgId,
    conversationId: convId,
    senderUid: SYMA_UID,
    senderCharacter: 'abil',
    senderName: 'Syma',
    senderAvatar: '/assets/avatar_abil_hd.jpg',
    recipientUid: LELE_UID,
    recipientCharacter: 'lele',
    recipientName: 'Lele',
    recipientAvatar: '/assets/avatar_lele_hd.png',
    participants: participants,
    text: 'tes',
    type: 'text',
    createdAt: nowMs,
    readBy: { abil: true }
  };

  const messageFields = {
    id: { stringValue: messageData.id },
    conversationId: { stringValue: messageData.conversationId },
    senderUid: { stringValue: messageData.senderUid },
    senderCharacter: { stringValue: messageData.senderCharacter },
    senderName: { stringValue: messageData.senderName },
    senderAvatar: { stringValue: messageData.senderAvatar },
    recipientUid: { stringValue: messageData.recipientUid },
    recipientCharacter: { stringValue: messageData.recipientCharacter },
    recipientName: { stringValue: messageData.recipientName },
    recipientAvatar: { stringValue: messageData.recipientAvatar },
    participants: { arrayValue: { values: participants.map(p => ({ stringValue: p })) } },
    text: { stringValue: messageData.text },
    type: { stringValue: messageData.type },
    createdAt: { integerValue: String(messageData.createdAt) },
    readBy: { mapValue: { fields: { abil: { booleanValue: true } } } }
  };

  console.log('Payload Stage A (Message):', {
    path: `messages/${stageAMsgId}`,
    fields: Object.keys(messageData),
    types: inspectTypes(messageData)
  });

  const resA = await fetch(`${BASE_URL}/messages/${stageAMsgId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: messageFields })
  });
  const resAText = await resA.text();
  record(resA.status === 200, `Stage A: Syma creates message doc alone -> Status ${resA.status}`, resA.status !== 200 ? resAText : 'Created successfully');

  // -------------------------------------------------------------
  // STAGE B: Create/Update conversation document ONLY (/conversations/{id})
  // -------------------------------------------------------------
  console.log('\n--- [STAGE B] Uji Pembuatan Dokumen Percakapan Saja ---');
  const convData = {
    id: convId,
    participants: participants,
    lastMessage: 'tes',
    lastMessageType: 'text',
    lastSender: 'abil',
    lastSenderUid: SYMA_UID,
    lastMessageAt: nowMs,
    updatedAt: nowMs,
    createdAt: nowMs,
    recipientUid: LELE_UID,
    recipientCharacter: 'lele'
  };

  const convFields = {
    id: { stringValue: convData.id },
    participants: { arrayValue: { values: participants.map(p => ({ stringValue: p })) } },
    lastMessage: { stringValue: convData.lastMessage },
    lastMessageType: { stringValue: convData.lastMessageType },
    lastSender: { stringValue: convData.lastSender },
    lastSenderUid: { stringValue: convData.lastSenderUid },
    lastMessageAt: { integerValue: String(convData.lastMessageAt) },
    updatedAt: { integerValue: String(convData.updatedAt) },
    createdAt: { integerValue: String(convData.createdAt) },
    recipientUid: { stringValue: convData.recipientUid },
    recipientCharacter: { stringValue: convData.recipientCharacter }
  };

  console.log('Payload Stage B (Conversation):', {
    path: `conversations/${convId}`,
    fields: Object.keys(convData),
    types: inspectTypes(convData)
  });

  const resB = await fetch(`${BASE_URL}/conversations/${convId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: convFields })
  });
  const resBText = await resB.text();
  record(resB.status === 200, `Stage B: Syma creates/updates conversation doc alone -> Status ${resB.status}`, resB.status !== 200 ? resBText : 'Created/Updated successfully');

  // -------------------------------------------------------------
  // STAGE C: Create notification document ONLY (/orbit_notifications/{id})
  // -------------------------------------------------------------
  console.log('\n--- [STAGE C] Uji Pembuatan Dokumen Notifikasi Saja ---');
  const stageCNotifId = `notif-stageC-${nowMs}`;
  const notifData = {
    id: stageCNotifId,
    type: 'message',
    senderUid: SYMA_UID,
    senderCharacter: 'abil',
    senderName: 'Syma',
    recipientUid: LELE_UID,
    targetUid: LELE_UID,
    recipientCharacter: 'lele',
    conversationId: convId,
    messageId: stageAMsgId,
    title: 'Pesan baru dari Syma',
    message: 'tes',
    text: 'tes',
    read: false,
    createdAt: nowMs
  };

  const notifFields = {
    id: { stringValue: notifData.id },
    type: { stringValue: notifData.type },
    senderUid: { stringValue: notifData.senderUid },
    senderCharacter: { stringValue: notifData.senderCharacter },
    senderName: { stringValue: notifData.senderName },
    recipientUid: { stringValue: notifData.recipientUid },
    targetUid: { stringValue: notifData.targetUid },
    recipientCharacter: { stringValue: notifData.recipientCharacter },
    conversationId: { stringValue: notifData.conversationId },
    messageId: { stringValue: notifData.messageId },
    title: { stringValue: notifData.title },
    message: { stringValue: notifData.message },
    text: { stringValue: notifData.text },
    read: { booleanValue: false },
    createdAt: { integerValue: String(notifData.createdAt) }
  };

  console.log('Payload Stage C (Notification):', {
    path: `orbit_notifications/${stageCNotifId}`,
    fields: Object.keys(notifData),
    types: inspectTypes(notifData)
  });

  const resC = await fetch(`${BASE_URL}/orbit_notifications/${stageCNotifId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: notifFields })
  });
  const resCText = await resC.text();
  record(resC.status === 200, `Stage C: Syma creates notification doc alone -> Status ${resC.status}`, resC.status !== 200 ? resCText : 'Created successfully');

  // -------------------------------------------------------------
  // STAGE D: Atomic Batch Write of all 3 documents via commit API
  // -------------------------------------------------------------
  console.log('\n--- [STAGE D] Uji Atomic Batch Write (3 Operasi Serentak) ---');
  const stageDMsgId = `msg-batch-${nowMs}`;
  const stageDNotifId = `notif-msg-${stageDMsgId}-lele`;

  const batchMessageFields = {
    ...messageFields,
    id: { stringValue: stageDMsgId }
  };
  const batchNotifFields = {
    ...notifFields,
    id: { stringValue: stageDNotifId },
    messageId: { stringValue: stageDMsgId }
  };

  const commitPayload = {
    writes: [
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/messages/${stageDMsgId}`,
          fields: batchMessageFields
        }
      },
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/conversations/${convId}`,
          fields: convFields
        }
      },
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/orbit_notifications/${stageDNotifId}`,
          fields: batchNotifFields
        }
      }
    ]
  };

  console.log('Submitting Atomic Batch Write Commit:', {
    documents: [
      `messages/${stageDMsgId}`,
      `conversations/${convId}`,
      `orbit_notifications/${stageDNotifId}`
    ]
  });

  const resD = await fetch(COMMIT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commitPayload)
  });
  const resDText = await resD.text();
  record(resD.status === 200, `Stage D: Atomic Batch Write commit of 3 docs -> Status ${resD.status}`, resD.status !== 200 ? resDText : 'Batch committed atomically');

  // -------------------------------------------------------------
  // STAGE E: Verification of Reading, Notification Receipt & Reply Flow
  // -------------------------------------------------------------
  console.log('\n--- [STAGE E] Verifikasi Penerimaan, Notifikasi & Balasan Lele ---');

  // E1. Lele reads the message
  const resReadLele = await fetch(`${BASE_URL}/messages/${stageDMsgId}`, {
    headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
  });
  record(resReadLele.status === 200, `E1: Recipient Lele reads the message -> Status ${resReadLele.status}`);

  // E2. Lele reads the notification
  const resNotifReadLele = await fetch(`${BASE_URL}/orbit_notifications/${stageDNotifId}`, {
    headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
  });
  record(resNotifReadLele.status === 200, `E2: Recipient Lele reads incoming notification -> Status ${resNotifReadLele.status}`);

  // E3. Third-party Nyanya CANNOT read the message (Privacy Isolation)
  const resReadNyanya = await fetch(`${BASE_URL}/messages/${stageDMsgId}`, {
    headers: { 'Authorization': `Bearer ${NYANYA_TOKEN}` }
  });
  record(resReadNyanya.status === 403, `E3: Non-participant Nyanya CANNOT read message -> Status ${resReadNyanya.status} (Expected 403)`);

  // E4. Third-party Nyanya CANNOT read the notification
  const resNotifNyanya = await fetch(`${BASE_URL}/orbit_notifications/${stageDNotifId}`, {
    headers: { 'Authorization': `Bearer ${NYANYA_TOKEN}` }
  });
  record(resNotifNyanya.status === 403, `E4: Non-participant Nyanya CANNOT read notification -> Status ${resNotifNyanya.status} (Expected 403)`);

  // E5. Lele sends reply back to Syma (Atomic Batch)
  const replyMsgId = `msg-reply-${nowMs}`;
  const replyNotifId = `notif-msg-${replyMsgId}-abil`;
  const replyMessageFields = {
    id: { stringValue: replyMsgId },
    conversationId: { stringValue: convId },
    senderUid: { stringValue: LELE_UID },
    senderCharacter: { stringValue: 'lele' },
    senderName: { stringValue: 'Lele' },
    senderAvatar: { stringValue: '/assets/avatar_lele_hd.png' },
    recipientUid: { stringValue: SYMA_UID },
    recipientCharacter: { stringValue: 'abil' },
    recipientName: { stringValue: 'Syma' },
    recipientAvatar: { stringValue: '/assets/avatar_abil_hd.jpg' },
    participants: { arrayValue: { values: participants.map(p => ({ stringValue: p })) } },
    text: { stringValue: 'Pesan tes diterima, Syma! Salam dari Lele.' },
    type: { stringValue: 'text' },
    createdAt: { integerValue: String(nowMs + 1000) },
    readBy: { mapValue: { fields: { lele: { booleanValue: true } } } }
  };
  const replyConvFields = {
    ...convFields,
    lastMessage: { stringValue: 'Pesan tes diterima, Syma! Salam dari Lele.' },
    lastSender: { stringValue: 'lele' },
    lastSenderUid: { stringValue: LELE_UID },
    lastMessageAt: { integerValue: String(nowMs + 1000) },
    updatedAt: { integerValue: String(nowMs + 1000) },
    recipientUid: { stringValue: SYMA_UID },
    recipientCharacter: { stringValue: 'abil' }
  };
  const replyNotifFields = {
    id: { stringValue: replyNotifId },
    type: { stringValue: 'message' },
    senderUid: { stringValue: LELE_UID },
    senderCharacter: { stringValue: 'lele' },
    senderName: { stringValue: 'Lele' },
    recipientUid: { stringValue: SYMA_UID },
    targetUid: { stringValue: SYMA_UID },
    recipientCharacter: { stringValue: 'abil' },
    conversationId: { stringValue: convId },
    messageId: { stringValue: replyMsgId },
    title: { stringValue: 'Pesan baru dari Lele' },
    message: { stringValue: 'Pesan tes diterima, Syma! Salam dari Lele.' },
    text: { stringValue: 'Pesan tes diterima, Syma! Salam dari Lele.' },
    read: { booleanValue: false },
    createdAt: { integerValue: String(nowMs + 1000) }
  };

  const replyCommitPayload = {
    writes: [
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/messages/${replyMsgId}`,
          fields: replyMessageFields
        }
      },
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/conversations/${convId}`,
          fields: replyConvFields
        }
      },
      {
        update: {
          name: `projects/${PROJECT_ID}/databases/(default)/documents/orbit_notifications/${replyNotifId}`,
          fields: replyNotifFields
        }
      }
    ]
  };

  const resReply = await fetch(COMMIT_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${LELE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(replyCommitPayload)
  });
  const resReplyText = await resReply.text();
  record(resReply.status === 200, `E5: Lele submits atomic reply back to Syma -> Status ${resReply.status}`, resReply.status !== 200 ? resReplyText : 'Reply batch committed');

  // E6. Syma reads Lele's reply
  const resReadSymaReply = await fetch(`${BASE_URL}/messages/${replyMsgId}`, {
    headers: { 'Authorization': `Bearer ${SYMA_TOKEN}` }
  });
  record(resReadSymaReply.status === 200, `E6: Syma reads Lele's reply -> Status ${resReadSymaReply.status}`);

  console.log('\n=============================================================');
  console.log(`4-STAGE DIAGNOSTIC SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runControlledTest().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
