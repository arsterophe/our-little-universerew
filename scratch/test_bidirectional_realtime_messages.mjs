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

const CHARACTERS = {
  nyanya: { key: 'nyanya', uid: '1uwba7MrGVU3xHu57VVLvztskrg2', email: 'nyanya@ourlittleuniverse.com', name: 'Nyanya', symbol: '⭐' },
  lala:   { key: 'lala',   uid: 'EqByKA8FXoTEt0OmIsSDPfnxMDB3', email: 'lala@ourlittleuniverse.com',   name: 'Lala',   symbol: '☀️' },
  lele:   { key: 'lele',   uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2', email: 'lele@ourlittleuniverse.com',   name: 'Lele',   symbol: '🌙' },
  abil:   { key: 'abil',   uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3', email: 'abil@ourlittleuniverse.com',   name: 'Syma',   symbol: '☁️' },
  akhira: { key: 'akhira', uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2', email: 'akhira@ourlittleuniverse.com', name: 'Akhira', symbol: '⚡' },
  ela:    { key: 'ela',    uid: 'plxSNowjCkOMfUQMAwnZzQPR9Xr1', email: 'ela@ourlittleuniverse.com',    name: 'Ela',    symbol: '🪷' },
  ruben:  { key: 'ruben',  uid: '9PMychPZ4rZ4PBCtZB9GiASttc52', email: 'ruben@ourlittleuniverse.com',  name: 'Ruben',  symbol: '🐉' },
  royan:  { key: 'royan',  uid: 'swBN9XodDWRuHE5YbYmeoytrcAx2', email: 'royan@ourlittleuniverse.com',  name: 'Royan',  symbol: '🎆' }
};

const TOKENS = {};
for (const [key, c] of Object.entries(CHARACTERS)) {
  TOKENS[key] = makeJwt(c.uid, c.email, true);
}
const STRANGER_TOKEN = makeJwt('unauthorized-intruder-uid-999', 'intruder@unknown.com', true);

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

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

async function sendFirestoreMessage(senderKey, recipientKey, text, convId) {
  const sender = CHARACTERS[senderKey];
  const recipient = CHARACTERS[recipientKey];
  const now = Date.now();
  const msgId = `msg-${senderKey}-${recipientKey}-${now}-${Math.random().toString(36).slice(2, 6)}`;
  const notifId = `notif-msg-${msgId}-${recipientKey}`;

  const messagePayload = {
    id: msgId,
    conversationId: convId,
    senderUid: sender.uid,
    senderCharacter: senderKey,
    senderName: sender.name,
    senderAvatar: `/assets/avatar_${senderKey}_hd.jpg`,
    recipientUid: recipient.uid,
    recipientCharacter: recipientKey,
    recipientName: recipient.name,
    recipientAvatar: `/assets/avatar_${recipientKey}_hd.jpg`,
    participants: [senderKey, recipientKey].sort(),
    text,
    type: 'text',
    createdAt: now,
    readBy: {
      [senderKey]: true
    }
  };

  const convPayload = {
    id: convId,
    participants: [senderKey, recipientKey].sort(),
    lastMessage: text,
    lastMessageType: 'text',
    lastSender: senderKey,
    lastSenderUid: sender.uid,
    lastMessageAt: now,
    updatedAt: now,
    createdAt: now,
    recipientUid: recipient.uid,
    recipientCharacter: recipientKey
  };

  const notifPayload = {
    id: notifId,
    type: 'message',
    senderUid: sender.uid,
    senderCharacter: senderKey,
    senderName: sender.name,
    recipientUid: recipient.uid,
    targetUid: recipient.uid,
    recipientCharacter: recipientKey,
    conversationId: convId,
    messageId: msgId,
    title: `Pesan baru dari ${sender.name}`,
    message: text,
    text,
    read: false,
    createdAt: now
  };

  // Commit batch write
  const commitUrl = `http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents:commit`;
  const batchBody = {
    writes: [
      {
        update: {
          name: `projects/our-little-universe-dcd75/databases/(default)/documents/messages/${msgId}`,
          fields: toFirestoreFields(messagePayload)
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
          name: `projects/our-little-universe-dcd75/databases/(default)/documents/orbit_notifications/${notifId}`,
          fields: toFirestoreFields(notifPayload)
        }
      }
    ]
  };

  const res = await fetch(commitUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKENS[senderKey]}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(batchBody)
  });

  return {
    status: res.status,
    msgId,
    notifId,
    text
  };
}

async function main() {
  console.log('================================================================');
  console.log('1. PENGUJIAN A: AKHIRA MENGIRIM PESAN KE LELE');
  console.log('================================================================');
  const convIdAkhiraLele = 'akhira_lele';
  const sendResA = await sendFirestoreMessage('akhira', 'lele', 'Halo Lele ☾', convIdAkhiraLele);
  assert(sendResA.status === 200, `Akhira berhasil mengirim pesan "Halo Lele ☾" ke Lele (Status ${sendResA.status})`);

  // Verify Akhira can read her own sent message
  const readResAkhira = await fetch(`${BASE_URL}/messages/${sendResA.msgId}`, {
    headers: { 'Authorization': `Bearer ${TOKENS['akhira']}` }
  });
  assert(readResAkhira.status === 200, `Akhira dapat membaca pesan yang dikirimnya di messages/${sendResA.msgId}`);

  // Verify Lele can read Akhira's message
  const readResLele = await fetch(`${BASE_URL}/messages/${sendResA.msgId}`, {
    headers: { 'Authorization': `Bearer ${TOKENS['lele']}` }
  });
  assert(readResLele.status === 200, `Lele dapat membaca pesan dari Akhira di messages/${sendResA.msgId}`);

  console.log('\n================================================================');
  console.log('2. PENGUJIAN B: LELE MEMBALAS AKHIRA');
  console.log('================================================================');
  const sendResB = await sendFirestoreMessage('lele', 'akhira', 'Halo juga Akhira! Salam hangat dari Eclipse Sanctuary ☾', convIdAkhiraLele);
  assert(sendResB.status === 200, `Lele berhasil membalas pesan Akhira (Status ${sendResB.status})`);

  // Verify Akhira can read Lele's reply
  const readReplyAkhira = await fetch(`${BASE_URL}/messages/${sendResB.msgId}`, {
    headers: { 'Authorization': `Bearer ${TOKENS['akhira']}` }
  });
  assert(readReplyAkhira.status === 200, `Akhira dapat membaca balasan dari Lele di messages/${sendResB.msgId}`);

  // Verify Lele can update readBy on Akhira's message
  const updateReadRes = await fetch(`${BASE_URL}/messages/${sendResA.msgId}?updateMask.fieldPaths=readBy.lele`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${TOKENS['lele']}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        readBy: {
          mapValue: {
            fields: {
              akhira: { booleanValue: true },
              lele: { booleanValue: true }
            }
          }
        }
      }
    })
  });
  assert(updateReadRes.status === 200, `Lele berhasil memperbarui status dibaca (readBy.lele = true)`);

  console.log('\n================================================================');
  console.log('3. PENGUJIAN C: KOMUNIKASI DUA ARAH AKHIRA DENGAN 6 SAHABAT LAIN');
  console.log('================================================================');
  const otherFriends = [
    { key: 'nyanya', convId: 'akhira_nyanya', greeting: 'Halo Nyanya ⭐' },
    { key: 'lala',   convId: 'akhira_lala',   greeting: 'Halo Lala ☀️' },
    { key: 'abil',   convId: 'abil_akhira',   greeting: 'Halo Syma ☁️' },
    { key: 'ela',    convId: 'akhira_ela',    greeting: 'Halo Ela 🪷' },
    { key: 'ruben',  convId: 'akhira_ruben',  greeting: 'Halo Ruben 🐉' },
    { key: 'royan',  convId: 'akhira_royan',  greeting: 'Halo Royan 🎆' }
  ];

  for (const f of otherFriends) {
    // Akhira sends to friend
    const sendAtoF = await sendFirestoreMessage('akhira', f.key, f.greeting, f.convId);
    assert(sendAtoF.status === 200, `Akhira -> ${CHARACTERS[f.key].name}: Pesan terkirim (Status ${sendAtoF.status})`);

    // Friend replies back to Akhira
    const replyFtoA = await sendFirestoreMessage(f.key, 'akhira', `Salam balik Akhira dari ${CHARACTERS[f.key].name}!`, f.convId);
    assert(replyFtoA.status === 200, `${CHARACTERS[f.key].name} -> Akhira: Balasan terkirim (Status ${replyFtoA.status})`);

    // Verify conversation summary exists and is readable by both
    const convA = await fetch(`${BASE_URL}/conversations/${f.convId}`, {
      headers: { 'Authorization': `Bearer ${TOKENS['akhira']}` }
    });
    const convF = await fetch(`${BASE_URL}/conversations/${f.convId}`, {
      headers: { 'Authorization': `Bearer ${TOKENS[f.key]}` }
    });
    assert(convA.status === 200 && convF.status === 200, `Percakapan ${f.convId} dapat dibaca oleh Akhira (200) dan ${CHARACTERS[f.key].name} (200)`);
  }

  console.log('\n================================================================');
  console.log('4. PENGUJIAN KEAMANAN & PRIVACY BARRIER');
  console.log('================================================================');
  // Stranger cannot read akhira_lele messages
  const strangerRead = await fetch(`${BASE_URL}/messages/${sendResA.msgId}`, {
    headers: { 'Authorization': `Bearer ${STRANGER_TOKEN}` }
  });
  assert(strangerRead.status === 403, `User tidak sah (Stranger) DITOLAK membaca pesan Akhira-Lele -> 403 Forbidden`);

  // Ruben (third-party character) cannot read akhira_lele messages
  const rubenRead = await fetch(`${BASE_URL}/messages/${sendResA.msgId}`, {
    headers: { 'Authorization': `Bearer ${TOKENS['ruben']}` }
  });
  assert(rubenRead.status === 403, `Karakter pihak ketiga (Ruben) DITOLAK membaca percakapan privat Akhira-Lele -> 403 Forbidden`);

  console.log('\n================================================================');
  console.log(`TOTAL HASIL PENGUJIAN: ${passed} / ${total} PASS (${Math.round((passed / total) * 100)}%)`);
  console.log('================================================================');
}

main().catch(console.error);
