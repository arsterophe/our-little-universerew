/**
 * FIRESTORE RULES EMULATOR TEST SUITE: OUR LITTLE MESSAGES SECURITY & PRIVACY
 * 
 * Verifies live Firestore Security Rules running inside the real Firestore Emulator:
 * 1. Participant message creation (Syma -> Lele) -> 200 OK
 * 2. Spoofing prevention:
 *    - User tries to spoof another character (senderCharacter mismatch) -> 403 Forbidden
 *    - User tries to spoof another UID (senderUid mismatch) -> 403 Forbidden
 * 3. Privacy isolation:
 *    - Non-participant canonical character (Nyanya) tries to read 1-on-1 direct message -> 403 Forbidden
 *    - Stranger / unauthenticated tries to read 1-on-1 message -> 403 Forbidden
 * 4. Legitimate participant read & read-receipt update:
 *    - Recipient (Lele) reads message -> 200 OK
 *    - Recipient (Lele) marks message read -> 200 OK
 *    - Non-participant (Nyanya) tries to update read receipt -> 403 Forbidden
 * 5. Conversations summary protection:
 *    - Participant reads/updates conversation doc -> 200 OK
 *    - Non-participant tries to read conversation doc -> 403 Forbidden
 * 6. Orbit notifications recipient validation:
 *    - Valid canonical recipient notification -> 200 OK
 *    - Self-notification attempt -> 403 Forbidden
 *    - Non-canonical random UID notification attempt -> 403 Forbidden
 *    - Non-recipient tries to read notification -> 403 Forbidden
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

// Canonical UIDs
const NYANYA_UID = '1uwba7MrGVU3xHu57VVLvztskrg2';
const LALA_UID   = 'EqByKA8FXoTEt0OmIsSDPfnxMDB3';
const LELE_UID   = '1ArxphLQpAOoOIvH9BKYw0ebD1e2';
const SYMA_UID   = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';
const STRANGER_UID = 'stranger-intruder-uid-999';

const NYANYA_TOKEN = makeJwt(NYANYA_UID, 'nyanya@ourlittleuniverse.com', true);
const LELE_TOKEN   = makeJwt(LELE_UID, 'lele@ourlittleuniverse.com', true);
const SYMA_TOKEN   = makeJwt(SYMA_UID, 'abil@ourlittleuniverse.com', true);
const STRANGER_TOKEN = makeJwt(STRANGER_UID, 'stranger@outerspace.org', true);

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, desc) {
  if (condition) {
    totalPassed++;
    console.log(`  ✓ PASS: ${desc}`);
  } else {
    totalFailed++;
    console.error(`  ✗ FAIL: ${desc}`);
  }
}

async function runSuite() {
  console.log('=============================================================');
  console.log('   FIRESTORE SECURITY RULES EMULATOR: MESSAGES & PRIVACY     ');
  console.log('=============================================================\n');

  const testMsgId = `test-msg-${Date.now()}`;
  const testConvId = 'abil_lele';

  // -------------------------------------------------------------
  // TEST SECTION 1: Message Creation & Anti-Spoofing
  // -------------------------------------------------------------
  console.log('--- SECTION 1: Message Creation & Anti-Spoofing ---');

  // 1.1 Syma sends valid message to Lele in abil_lele
  const validMessageBody = {
    fields: {
      id: { stringValue: testMsgId },
      conversationId: { stringValue: testConvId },
      senderUid: { stringValue: SYMA_UID },
      senderCharacter: { stringValue: 'abil' },
      senderName: { stringValue: 'Syma' },
      senderAvatar: { stringValue: '/assets/avatar_abil_hd.jpg' },
      recipientUid: { stringValue: LELE_UID },
      recipientCharacter: { stringValue: 'lele' },
      recipientName: { stringValue: 'Lele' },
      recipientAvatar: { stringValue: '/assets/avatar_lele_hd.png' },
      participants: { arrayValue: { values: [{ stringValue: 'abil' }, { stringValue: 'lele' }] } },
      text: { stringValue: 'Halo Lele, ini pesan rahasia kosmik!' },
      type: { stringValue: 'text' },
      createdAt: { integerValue: String(Date.now()) },
      readBy: { mapValue: { fields: { abil: { booleanValue: true } } } }
    }
  };

  const resCreate = await fetch(`${BASE_URL}/messages/${testMsgId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(validMessageBody)
  });
  assert(resCreate.status === 200, `Syma creates valid message in abil_lele -> Status ${resCreate.status}`);

  // 1.2 Syma attempts to spoof senderCharacter as 'nyanya'
  const spoofCharBody = {
    fields: {
      ...validMessageBody.fields,
      id: { stringValue: `spoof-char-${Date.now()}` },
      senderCharacter: { stringValue: 'nyanya' }
    }
  };
  const resSpoofChar = await fetch(`${BASE_URL}/messages/${spoofCharBody.fields.id.stringValue}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(spoofCharBody)
  });
  assert(resSpoofChar.status === 403, `Anti-Spoofing: Syma cannot spoof senderCharacter: 'nyanya' -> Status ${resSpoofChar.status} (Expected 403)`);

  // 1.3 Syma attempts to spoof senderUid as Nyanya UID
  const spoofUidBody = {
    fields: {
      ...validMessageBody.fields,
      id: { stringValue: `spoof-uid-${Date.now()}` },
      senderUid: { stringValue: NYANYA_UID }
    }
  };
  const resSpoofUid = await fetch(`${BASE_URL}/messages/${spoofUidBody.fields.id.stringValue}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(spoofUidBody)
  });
  assert(resSpoofUid.status === 403, `Anti-Spoofing: Syma cannot spoof senderUid: Nyanya UID -> Status ${resSpoofUid.status} (Expected 403)`);

  // 1.4 Stranger attempts to send message into abil_lele
  const strangerMsgBody = {
    fields: {
      ...validMessageBody.fields,
      id: { stringValue: `stranger-msg-${Date.now()}` },
      senderUid: { stringValue: STRANGER_UID }
    }
  };
  const resStrangerMsg = await fetch(`${BASE_URL}/messages/${strangerMsgBody.fields.id.stringValue}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${STRANGER_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(strangerMsgBody)
  });
  assert(resStrangerMsg.status === 403, `Authorization: Stranger cannot send message into abil_lele -> Status ${resStrangerMsg.status} (Expected 403)`);

  // -------------------------------------------------------------
  // TEST SECTION 2: Privacy Isolation & Message Reading
  // -------------------------------------------------------------
  console.log('\n--- SECTION 2: Privacy Isolation & Message Reading ---');

  // 2.1 Legitimate recipient (Lele) reads the message
  const resReadLele = await fetch(`${BASE_URL}/messages/${testMsgId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
  });
  assert(resReadLele.status === 200, `Privacy: Intended recipient Lele CAN read message -> Status ${resReadLele.status} (Expected 200)`);

  // 2.2 Legitimate sender (Syma) reads the message
  const resReadSyma = await fetch(`${BASE_URL}/messages/${testMsgId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${SYMA_TOKEN}` }
  });
  assert(resReadSyma.status === 200, `Privacy: Sender Syma CAN read message -> Status ${resReadSyma.status} (Expected 200)`);

  // 2.3 Non-participant canonical character (Nyanya) tries to read message
  const resReadNyanya = await fetch(`${BASE_URL}/messages/${testMsgId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${NYANYA_TOKEN}` }
  });
  assert(resReadNyanya.status === 403, `Privacy Barrier: Non-participant Nyanya CANNOT read abil_lele message -> Status ${resReadNyanya.status} (Expected 403)`);

  // 2.4 Stranger tries to read message
  const resReadStranger = await fetch(`${BASE_URL}/messages/${testMsgId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${STRANGER_TOKEN}` }
  });
  assert(resReadStranger.status === 403, `Privacy Barrier: Stranger CANNOT read message -> Status ${resReadStranger.status} (Expected 403)`);

  // -------------------------------------------------------------
  // TEST SECTION 3: Read Receipts (Update Rules)
  // -------------------------------------------------------------
  console.log('\n--- SECTION 3: Read Receipts (Update Rules) ---');

  // 3.1 Recipient Lele updates readBy
  const readUpdateBody = {
    fields: {
      ...validMessageBody.fields,
      readBy: {
        mapValue: {
          fields: {
            abil: { booleanValue: true },
            lele: { booleanValue: true }
          }
        }
      }
    }
  };
  const resUpdateLele = await fetch(`${BASE_URL}/messages/${testMsgId}?updateMask.fieldPaths=readBy`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${LELE_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(readUpdateBody)
  });
  assert(resUpdateLele.status === 200, `Read Receipt: Recipient Lele updates read receipt -> Status ${resUpdateLele.status} (Expected 200)`);

  // 3.2 Non-participant Nyanya tries to update read receipt
  const resUpdateNyanya = await fetch(`${BASE_URL}/messages/${testMsgId}?updateMask.fieldPaths=readBy`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${NYANYA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(readUpdateBody)
  });
  assert(resUpdateNyanya.status === 403, `Privacy Barrier: Non-participant Nyanya CANNOT update read receipt -> Status ${resUpdateNyanya.status} (Expected 403)`);

  // -------------------------------------------------------------
  // TEST SECTION 4: Conversation Summaries (/conversations)
  // -------------------------------------------------------------
  console.log('\n--- SECTION 4: Conversation Summaries (/conversations) ---');

  const convSummaryBody = {
    fields: {
      id: { stringValue: testConvId },
      participants: { arrayValue: { values: [{ stringValue: 'abil' }, { stringValue: 'lele' }] } },
      lastMessage: { stringValue: 'Halo Lele!' },
      lastMessageType: { stringValue: 'text' },
      lastSender: { stringValue: 'abil' },
      lastSenderUid: { stringValue: SYMA_UID },
      lastMessageAt: { integerValue: String(Date.now()) },
      updatedAt: { integerValue: String(Date.now()) },
      recipientUid: { stringValue: LELE_UID },
      recipientCharacter: { stringValue: 'lele' }
    }
  };

  // 4.1 Syma creates/updates conversations/abil_lele
  const resConvSyma = await fetch(`${BASE_URL}/conversations/${testConvId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(convSummaryBody)
  });
  assert(resConvSyma.status === 200, `Participant Syma updates conversation summary -> Status ${resConvSyma.status} (Expected 200)`);

  // 4.2 Lele reads conversations/abil_lele
  const resConvLele = await fetch(`${BASE_URL}/conversations/${testConvId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
  });
  assert(resConvLele.status === 200, `Participant Lele reads conversation summary -> Status ${resConvLele.status} (Expected 200)`);

  // 4.3 Non-participant Nyanya tries to read conversations/abil_lele
  const resConvNyanya = await fetch(`${BASE_URL}/conversations/${testConvId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${NYANYA_TOKEN}` }
  });
  assert(resConvNyanya.status === 403, `Privacy Barrier: Non-participant Nyanya CANNOT read conversations/abil_lele -> Status ${resConvNyanya.status} (Expected 403)`);

  // -------------------------------------------------------------
  // TEST SECTION 5: Orbit Notifications (/orbit_notifications)
  // -------------------------------------------------------------
  console.log('\n--- SECTION 5: Orbit Notifications (/orbit_notifications) ---');

  const notifId = `notif-msg-${testMsgId}-lele`;
  const validNotifBody = {
    fields: {
      id: { stringValue: notifId },
      type: { stringValue: 'message' },
      senderUid: { stringValue: SYMA_UID },
      senderCharacter: { stringValue: 'abil' },
      senderName: { stringValue: 'Syma' },
      recipientUid: { stringValue: LELE_UID },
      targetUid: { stringValue: LELE_UID },
      recipientCharacter: { stringValue: 'lele' },
      conversationId: { stringValue: testConvId },
      messageId: { stringValue: testMsgId },
      title: { stringValue: 'Pesan baru dari Syma' },
      message: { stringValue: 'Halo Lele!' },
      text: { stringValue: 'Halo Lele!' },
      read: { booleanValue: false },
      createdAt: { integerValue: String(Date.now()) }
    }
  };

  // 5.1 Syma creates valid notification for Lele
  const resNotifCreate = await fetch(`${BASE_URL}/orbit_notifications/${notifId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(validNotifBody)
  });
  assert(resNotifCreate.status === 200, `Syma creates valid recipient notification for Lele -> Status ${resNotifCreate.status} (Expected 200)`);

  // 5.2 Recipient Lele reads the notification
  const resNotifReadLele = await fetch(`${BASE_URL}/orbit_notifications/${notifId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${LELE_TOKEN}` }
  });
  assert(resNotifReadLele.status === 200, `Recipient Lele reads notification -> Status ${resNotifReadLele.status} (Expected 200)`);

  // 5.3 Non-recipient Nyanya tries to read Lele's notification
  const resNotifReadNyanya = await fetch(`${BASE_URL}/orbit_notifications/${notifId}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${NYANYA_TOKEN}` }
  });
  assert(resNotifReadNyanya.status === 403, `Privacy Barrier: Non-recipient Nyanya CANNOT read Lele's notification -> Status ${resNotifReadNyanya.status} (Expected 403)`);

  // 5.4 Self-notification attempt: Syma tries to create notification for Syma
  const selfNotifId = `self-notif-${Date.now()}`;
  const selfNotifBody = {
    fields: {
      ...validNotifBody.fields,
      id: { stringValue: selfNotifId },
      recipientUid: { stringValue: SYMA_UID },
      targetUid: { stringValue: SYMA_UID }
    }
  };
  const resSelfNotif = await fetch(`${BASE_URL}/orbit_notifications/${selfNotifId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(selfNotifBody)
  });
  assert(resSelfNotif.status === 403, `Integrity: Cannot create self-notification (recipientUid == senderUid) -> Status ${resSelfNotif.status} (Expected 403)`);

  // 5.5 Random UID notification attempt: Syma tries to create notification for random external UID
  const randomNotifId = `random-notif-${Date.now()}`;
  const randomNotifBody = {
    fields: {
      ...validNotifBody.fields,
      id: { stringValue: randomNotifId },
      recipientUid: { stringValue: 'attacker-random-foreign-uid' },
      targetUid: { stringValue: 'attacker-random-foreign-uid' }
    }
  };
  const resRandomNotif = await fetch(`${BASE_URL}/orbit_notifications/${randomNotifId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(randomNotifBody)
  });
  assert(resRandomNotif.status === 403, `Integrity: Cannot create notification for invalid foreign UID -> Status ${resRandomNotif.status} (Expected 403)`);

  console.log('\n=============================================================');
  console.log(`EMULATOR TEST SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log('=============================================================');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

runSuite().catch(err => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
