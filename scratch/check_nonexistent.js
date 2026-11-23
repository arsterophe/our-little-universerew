import fs from 'fs';

const envContent = fs.readFileSync('.env', 'utf-8');
const envConfig = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx > -1) {
      envConfig[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
    }
  }
});

const apiKey = envConfig.VITE_FIREBASE_API_KEY;
const projectId = envConfig.VITE_FIREBASE_PROJECT_ID;

const logBuf = fs.readFileSync('C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/IndexedDB/http_localhost_5173.indexeddb.leveldb/001163.log');
const str = logBuf.toString('latin1');
const tokenIdx = str.indexOf('refreshToken');
let refreshToken = '';
if (tokenIdx > -1) {
  const after = str.slice(tokenIdx + 15, tokenIdx + 500);
  const match = after.match(/([A-Za-z0-9_-]{50,})/);
  if (match) refreshToken = match[1];
}

async function checkNonExistent() {
  const tokenRes = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${refreshToken}`
  });
  const tokenData = await tokenRes.json();

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stories/story-definitely-does-not-exist-123`;
  const resAuth = await fetch(url, {
    headers: { 'Authorization': `Bearer ${tokenData.id_token}` }
  });
  console.log(`Non existent with Royan token HTTP: ${resAuth.status}`);
  const data = await resAuth.json();
  console.log(data);
}

checkNonExistent();

