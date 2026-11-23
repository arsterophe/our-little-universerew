import fs from 'fs';

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

const AKHIRA_UID = 'MT14ZHATNqe90frAeQ74QFk4iXs2';
const LELE_UID = '1ArxphLQpAOoOIvH9BKYw0ebD1e2';
const NYANYA_UID = '1uwba7MrGVU3xHu57VVLvztskrg2';
const LALA_UID = 'EqByKA8FXoTEt0OmIsSDPfnxMDB3';
const SYMA_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';
const ELA_UID = 'plxSNowjCkOMfUQMAwnZzQPR9Xr1';
const RUBEN_UID = '9PMychPZ4rZ4PBCtZB9GiASttc52';
const ROYAN_UID = 'swBN9XodDWRuHE5YbYmeoytrcAx2';

const AKHIRA_TOKEN = makeJwt(AKHIRA_UID, 'akhira@ourlittleuniverse.com', true);
const AKHIRA_UNVERIFIED_TOKEN = makeJwt(AKHIRA_UID, 'akhira@ourlittleuniverse.com', false);
const LELE_TOKEN = makeJwt(LELE_UID, 'lele@ourlittleuniverse.com', true);
const NYANYA_TOKEN = makeJwt(NYANYA_UID, 'nyanya@ourlittleuniverse.com', true);

// Helper to convert plain JS object to Firestore REST document fields
function toFirestoreFields(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === null || v === undefined) {
      fields[k] = { nullValue: null };
    } else if (typeof v === 'string') {
      fields[k] = { stringValue: v };
    } else if (typeof v === 'boolean') {
      fields[k] = { booleanValue: v };
    } else if (typeof v === 'number') {
      if (Number.isInteger(v)) {
        fields[k] = { integerValue: String(v) };
      } else {
        fields[k] = { doubleValue: v };
      }
    } else if (Array.isArray(v)) {
      fields[k] = {
        arrayValue: {
          values: v.map(item => {
            if (typeof item === 'string') return { stringValue: item };
            if (typeof item === 'number') return { integerValue: String(item) };
            if (typeof item === 'boolean') return { booleanValue: item };
            return { stringValue: String(item) };
          })
        }
      };
    } else if (typeof v === 'object') {
      fields[k] = {
        mapValue: {
          fields: toFirestoreFields(v)
        }
      };
    }
  }
  return fields;
}

async function run() {
  console.log('================================================================');
  console.log('AUDITING FIRESTORE SECURITY RULES FOR AKHIRA MESSAGING');
  console.log('================================================================');

  const now = Date.now();
  const msgId = `msg-test-${now}`;
  const convId = 'akhira_lele';

  // 1. Message Payload exactly matching dbSendMessage in firebase.js
  const messagePayload = {
    id: msgId,
    conversationId: convId,
    senderUid: AKHIRA_UID,
    senderCharacter: 'akhira',
    senderName: 'Akhira',
    senderAvatar: '/assets/avatar_akhira_hd.jpg',
    recipientUid: LELE_UID,
    recipientCharacter: 'lele',
    recipientName: 'Lele',
    recipientAvatar: '/assets/avatar_lele_hd.png',
    participants: ['akhira', 'lele'],
    text: 'Halo Lele! Ini Akhira dari samudra astral YAWN ⚡🌊',
    type: 'text',
    createdAt: now,
    readBy: {
      akhira: true
    }
  };

  // 2. Conversation Payload exactly matching dbSendMessage in firebase.js
  const convPayload = {
    id: convId,
    participants: ['akhira', 'lele'],
    lastMessage: 'Halo Lele! Ini Akhira dari samudra astral YAWN ⚡🌊',
    lastMessageType: 'text',
    lastSender: 'akhira',
    lastSenderUid: AKHIRA_UID,
    lastMessageAt: now,
    updatedAt: now,
    createdAt: now,
    recipientUid: LELE_UID,
    recipientCharacter: 'lele'
  };

  // 3. Notification Payload exactly matching dbSendMessage in firebase.js
  const notifId = `notif-msg-${msgId}-lele`;
  const notifPayload = {
    id: notifId,
    type: 'message',
    senderUid: AKHIRA_UID,
    senderCharacter: 'akhira',
    senderName: 'Akhira',
    recipientUid: LELE_UID,
    targetUid: LELE_UID,
    recipientCharacter: 'lele',
    conversationId: convId,
    messageId: msgId,
    title: 'Pesan baru dari Akhira',
    message: 'Halo Lele! Ini Akhira dari samudra astral YAWN ⚡🌊',
    text: 'Halo Lele! Ini Akhira dari samudra astral YAWN ⚡🌊',
    read: false,
    createdAt: now
  };

  console.log('\n--- TEST 1: WRITE TO messages/{messageId} ---');
  const resMsg = await fetch(`${BASE_URL}/messages/${msgId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AKHIRA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: toFirestoreFields(messagePayload) })
  });
  const resMsgText = await resMsg.text();
  console.log('Status messages write:', resMsg.status);
  if (resMsg.status !== 200) console.log('Response messages write:', resMsgText);

  console.log('\n--- TEST 2: WRITE TO conversations/{convId} ---');
  const resConv = await fetch(`${BASE_URL}/conversations/${convId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AKHIRA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: toFirestoreFields(convPayload) })
  });
  const resConvText = await resConv.text();
  console.log('Status conversations write:', resConv.status);
  if (resConv.status !== 200) console.log('Response conversations write:', resConvText);

  console.log('\n--- TEST 3: WRITE TO orbit_notifications/{notifId} ---');
  const resNotif = await fetch(`${BASE_URL}/orbit_notifications/${notifId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AKHIRA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: toFirestoreFields(notifPayload) })
  });
  const resNotifText = await resNotif.text();
  console.log('Status orbit_notifications write:', resNotif.status);
  if (resNotif.status !== 200) console.log('Response orbit_notifications write:', resNotifText);

  console.log('\n--- TEST 4: COMMIT BATCH WRITE (ALL 3 DOCS) ---');
  const commitUrl = `http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents:commit`;
  const batchBody = {
    writes: [
      {
        update: {
          name: `projects/our-little-universe-dcd75/databases/(default)/documents/messages/${msgId}-batch`,
          fields: toFirestoreFields({ ...messagePayload, id: `${msgId}-batch` })
        }
      },
      {
        update: {
          name: `projects/our-little-universe-dcd75/databases/(default)/documents/conversations/${convId}`,
          fields: toFirestoreFields(convPayload)
        }
      },
      {
        update: {
          name: `projects/our-little-universe-dcd75/databases/(default)/documents/orbit_notifications/${notifId}-batch`,
          fields: toFirestoreFields({ ...notifPayload, id: `${notifId}-batch` })
        }
      }
    ]
  };
  const resBatch = await fetch(commitUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AKHIRA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(batchBody)
  });
  const resBatchText = await resBatch.text();
  console.log('Status batch write:', resBatch.status);
  if (resBatch.status !== 200) console.log('Response batch write:', resBatchText);

  console.log('\n--- TEST 5: TEST UNVERIFIED EMAIL TOKEN FOR AKHIRA ---');
  const resUnver = await fetch(`${BASE_URL}/messages/${msgId}-unver`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${AKHIRA_UNVERIFIED_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ fields: toFirestoreFields({ ...messagePayload, id: `${msgId}-unver` }) })
  });
  console.log('Status unverified email Akhira write:', resUnver.status);
  if (resUnver.status !== 200) console.log('Response unverified email write:', await resUnver.text());
}

run().catch(console.error);
