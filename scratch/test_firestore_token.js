import fs from 'fs';

// Read .env
const envContent = fs.readFileSync('.env', 'utf-8');
const envConfig = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      envConfig[key] = val;
    }
  }
});

const apiKey = envConfig.VITE_FIREBASE_API_KEY;
const projectId = envConfig.VITE_FIREBASE_PROJECT_ID;

// Extract refreshToken from the indexeddb leveldb log
const logBuf = fs.readFileSync('C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/IndexedDB/http_localhost_5173.indexeddb.leveldb/001163.log');
const str = logBuf.toString('latin1');
const tokenIdx = str.indexOf('refreshToken');
let refreshToken = '';
if (tokenIdx > -1) {
  // Extract refreshToken string
  const after = str.slice(tokenIdx + 15, tokenIdx + 500);
  const match = after.match(/([A-Za-z0-9_-]{50,})/);
  if (match) {
    refreshToken = match[1];
  }
}

console.log('Extracted Refresh Token prefix:', refreshToken.slice(0, 20) + '...');

async function testToken() {
  const tokenRes = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.id_token) {
    console.error('Failed to get id_token:', tokenData);
    return;
  }

  console.log('Got ID token! User ID:', tokenData.user_id);

  // Decode JWT payload
  const parts = tokenData.id_token.split('.');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
  console.log('JWT Payload:', {
    email: payload.email,
    email_verified: payload.email_verified,
    user_id: payload.user_id,
    sub: payload.sub
  });

  // Now query Firestore REST API
  console.log('\n--- Querying Firestore stories via REST API using ID Token ---');
  const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  
  // 1. Query published stories
  console.log('\n1. Testing query where status == "published"...');
  const pubQueryRes = await fetch(firestoreUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenData.id_token}`
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'stories' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'status' },
            op: 'EQUAL',
            value: { stringValue: 'published' }
          }
        }
      }
    })
  });

  const pubResult = await pubQueryRes.json();
  console.log('Query status == published result HTTP:', pubQueryRes.status);
  console.log('Result sample:', JSON.stringify(pubResult, null, 2).slice(0, 1500));

  // 2. Query stories by authorUid == Lele (1ArxphLQpAOoOIvH9BKYw0ebD1e2)
  console.log('\n2. Testing query where authorUid == Lele...');
  const leleQueryRes = await fetch(firestoreUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenData.id_token}`
    },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: 'stories' }],
        where: {
          fieldFilter: {
            field: { fieldPath: 'authorUid' },
            op: 'EQUAL',
            value: { stringValue: '1ArxphLQpAOoOIvH9BKYw0ebD1e2' }
          }
        }
      }
    })
  });
  console.log('Query authorUid == Lele result HTTP:', leleQueryRes.status);
  const leleResult = await leleQueryRes.json();
  console.log('Result sample:', JSON.stringify(leleResult, null, 2).slice(0, 1500));
}

testToken().catch(console.error);

