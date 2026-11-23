import { spawn } from 'child_process';

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
const SYMA_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';
const SYMA_TOKEN = makeJwt(SYMA_UID, 'abil@ourlittleuniverse.com', true);

async function test() {
  const testId = `diag-msg-${Date.now()}`;
  
  // Test minimal payload exactly like Nyanya's payload in test_fase6_messages.js
  const minimalPayload = {
    fields: {
      id: { stringValue: testId },
      conversationId: { stringValue: 'abil_lele' },
      senderUid: { stringValue: SYMA_UID },
      senderCharacter: { stringValue: 'abil' },
      senderName: { stringValue: 'Syma' },
      senderAvatar: { stringValue: 'assets/avatar_abil_hd.jpg' },
      participants: {
        arrayValue: {
          values: [{ stringValue: 'abil' }, { stringValue: 'lele' }]
        }
      },
      text: { stringValue: 'Halo dari Syma!' },
      createdAt: { integerValue: String(Date.now()) },
      readBy: {
        mapValue: {
          fields: {
            abil: { booleanValue: true }
          }
        }
      }
    }
  };

  console.log('Sending minimal payload via PATCH:');
  const res1 = await fetch(`${BASE_URL}/messages/${testId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${SYMA_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(minimalPayload)
  });
  console.log('Response status:', res1.status);
  const text1 = await res1.text();
  console.log('Response body:', text1);
}

test();
