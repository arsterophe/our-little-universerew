import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import os from 'os';
import WebSocket from 'ws';

// Read .env manually for standalone Node verification
const envPath = path.resolve('.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        envVars[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim();
      }
    }
  }
}

console.log('================================================================');
console.log('OUR LITTLE UNIVERSE — LIVE FIREBASE AUTH DEEP DIAGNOSTIC');
console.log('================================================================');

// --- SECTION 1: ENVIRONMENT & CONFIGURATION CHECK ---
console.log('\n--- 1. ENVIRONMENT & CONFIGURATION VERIFICATION ---');
const apiKey = envVars['VITE_FIREBASE_API_KEY'];
const projectId = envVars['VITE_FIREBASE_PROJECT_ID'];
const authDomain = envVars['VITE_FIREBASE_AUTH_DOMAIN'];
const storageBucket = envVars['VITE_FIREBASE_STORAGE_BUCKET'];

console.log(`Project ID        : ${projectId || 'MISSING'}`);
console.log(`Auth Domain       : ${authDomain || 'MISSING'}`);
console.log(`Storage Bucket    : ${storageBucket || 'MISSING'}`);
console.log(`API Key Configured: ${apiKey ? `YES (Length: ${apiKey.length}, Prefix: ${apiKey.slice(0, 4)}..., Suffix: ...${apiKey.slice(-4)})` : 'MISSING'}`);

// --- SECTION 2: DIRECT NETWORK & IDENTITY TOOLKIT API ENDPOINT TEST ---
console.log('\n--- 2. IDENTITY TOOLKIT API DIRECT NETWORK REACHABILITY ---');
async function testDirectApi() {
  const result = {
    projectsConfigStatus: null,
    projectsConfigBody: null,
    signInEndpointStatus: null,
    signInEndpointBody: null
  };

  // Check project config
  try {
    const projUrl = `https://identitytoolkit.googleapis.com/v1/projects?key=${apiKey}`;
    const pRes = await fetch(projUrl);
    result.projectsConfigStatus = pRes.status;
    const pData = await pRes.json();
    result.projectsConfigBody = pData;
    console.log(`Project Metadata Status: ${pRes.status} ${pRes.statusText}`);
    console.log(`Authorized Domains     : ${JSON.stringify(pData.authorizedDomains)}`);
  } catch (err) {
    console.error(`Project Metadata Fetch Error: ${err.message}`);
  }

  // Check signInWithPassword endpoint reachability (with safe dummy payload)
  try {
    const signUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
    const sRes = await fetch(signUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nyanya@ourlittleuniverse.com',
        password: 'DiagnosticProbeOnly_NotARealPassword',
        returnSecureToken: true,
        clientType: 'CLIENT_TYPE_WEB'
      })
    });
    result.signInEndpointStatus = sRes.status;
    const sData = await sRes.json();
    result.signInEndpointBody = sData;
    console.log(`SignIn Endpoint Status : ${sRes.status} ${sRes.statusText}`);
    console.log(`Identity Toolkit Error : ${sData.error?.message} (HTTP Code: ${sData.error?.code})`);
  } catch (err) {
    console.error(`SignIn Endpoint Fetch Error: ${err.message}`);
  }

  return result;
}

// --- SECTION 3: REAL CHROME BROWSER CDP DIAGNOSTIC ---
console.log('\n--- 3. LIVE BROWSER DEVTOOLS PROTOCOL (CDP) DIAGNOSTIC ---');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-deep-diag-'));
const port = 9377;

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu',
  'about:blank'
], { stdio: 'ignore' });

async function getWsUrl() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const p = list.find(t => t.type === 'page');
      if (p && p.webSocketDebuggerUrl) return p.webSocketDebuggerUrl;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 200));
  }
  throw new Error('Chrome WS unreachable');
}

async function runBrowserDiagnostics() {
  const wsUrl = await getWsUrl();
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  const networkLog = [];
  const consoleLog = [];
  const exceptions = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value !== undefined ? a.value : (a.description || JSON.stringify(a))).join(' ');
      consoleLog.push({
        type: data.params.type,
        text,
        timestamp: new Date().toISOString()
      });
    }

    if (data.method === 'Runtime.exceptionThrown') {
      exceptions.push(data.params.exceptionDetails);
    }

    if (data.method === 'Network.requestWillBeSent') {
      const req = data.params.request;
      if (req.url.includes('identitytoolkit') || req.url.includes('googleapis') || req.url.includes('firebase')) {
        networkLog.push({
          requestId: data.params.requestId,
          url: req.url,
          method: req.method,
          headers: req.headers,
          hasPostData: Boolean(req.postData),
          timestamp: new Date().toISOString()
        });
      }
    }

    if (data.method === 'Network.responseReceived') {
      const resp = data.params.response;
      const target = networkLog.find(r => r.requestId === data.params.requestId);
      if (target) {
        target.status = resp.status;
        target.statusText = resp.statusText;
        target.mimeType = resp.mimeType;
        target.responseHeaders = resp.headers;
      }
    }

    if (data.method === 'Network.loadingFailed') {
      const target = networkLog.find(r => r.requestId === data.params.requestId);
      if (target) {
        target.failed = true;
        target.errorText = data.params.errorText;
        target.canceled = data.params.canceled;
      }
    }

    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data.result);
      pending.delete(data.id);
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');
  await send('Network.enable');

  console.log('Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173' });

  // Wait for initial load
  await send('Runtime.evaluate', {
    expression: `new Promise(resolve => {
      const check = () => {
        if (document.readyState === 'complete' && document.querySelectorAll('.character-card').length >= 8) {
          resolve(true);
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    })`,
    awaitPromise: true
  });
  console.log('Page loaded. Waiting 1.5s for initial idle frames...');
  await new Promise(r => setTimeout(r, 1500));

  // Step 3a: Inspect in-browser Firebase instances & persistence
  console.log('\n--- 3a. In-Browser Firebase & Auth Initialization Inspection ---');
  const browserFirebaseCheck = await send('Runtime.evaluate', {
    expression: `(async () => {
      try {
        const fbModule = await import('/firebase.js');
        const auth = fbModule.auth;
        const app = fbModule.app;
        return {
          appExists: Boolean(app),
          appName: app ? app.name : null,
          appOptionsKey: app?.options?.apiKey ? 'EXISTS' : 'MISSING',
          appOptionsProjectId: app?.options?.projectId || null,
          authExists: Boolean(auth),
          authCurrentUser: auth?.currentUser ? { uid: auth.currentUser.uid, email: auth.currentUser.email } : null,
          authConfigApiKey: auth?.config?.apiKey ? 'EXISTS' : 'MISSING',
          authConfigAuthDomain: auth?.config?.authDomain || null,
          isFirebaseConfigured: fbModule.isFirebaseConfigured ? fbModule.isFirebaseConfigured() : null
        };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('In-Browser Firebase Instance:', JSON.stringify(browserFirebaseCheck?.value, null, 2));

  // Step 3b: Select Nyanya and probe form behavior
  console.log('\n--- 3b. Selecting Nyanya Character & Inspecting Form State ---');
  await send('Runtime.evaluate', {
    expression: `(() => {
      const card = document.getElementById('card-nyanya');
      if (card) card.click();
    })()`
  });
  await new Promise(r => setTimeout(r, 1200));

  const formState = await send('Runtime.evaluate', {
    expression: `(() => {
      const emailInput = document.getElementById('email-input');
      const pwdInput = document.getElementById('password-input');
      const viewLogin = document.getElementById('view-login');
      return {
        loginActive: viewLogin?.classList.contains('active'),
        emailValue: emailInput?.value || null,
        pwdType: pwdInput?.type || null
      };
    })()`,
    returnByValue: true
  });
  console.log('Form State after Card Selection:', formState?.value);

  // Step 3c: Submit Login with probe password and catch exact thrown error
  console.log('\n--- 3c. Direct Execution of loginWithFirebase with Full Error Capture ---');
  const directLoginCallResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      const results = {};
      try {
        const fbModule = await import('/firebase.js');
        const loginFn = fbModule.loginWithFirebase;
        
        try {
          await loginFn('nyanya', 'nyanya@ourlittleuniverse.com', 'ProbeDiagnosticPassword123');
          results.success = true;
        } catch (authErr) {
          results.caughtError = {
            name: authErr.name,
            code: authErr.code || null,
            message: authErr.message || null,
            customData: authErr.customData || null,
            stack: authErr.stack || null,
            isFirebaseError: authErr.name === 'FirebaseError'
          };
        }
      } catch (importErr) {
        results.importError = importErr.message;
      }
      return results;
    })()`,
    awaitPromise: true,
    returnByValue: true
  });
  console.log('Direct loginWithFirebase Execution:', JSON.stringify(directLoginCallResult?.value, null, 2));

  // Fetch response bodies for intercepted network requests
  for (const item of networkLog) {
    try {
      const bodyResult = await send('Network.getResponseBody', { requestId: item.requestId });
      item.responseBody = bodyResult.body;
    } catch (_) {}
  }

  console.log('\n--- 3d. Intercepted Network Requests to Google/Firebase ---');
  networkLog.forEach(req => {
    console.log(`[NETWORK] ${req.method} ${req.url.split('?')[0]} -> Status: ${req.status} ${req.statusText || ''}`);
    if (req.responseBody) {
      console.log(`          Response: ${req.responseBody.replace(/\n/g, ' ').slice(0, 150)}...`);
    }
    if (req.failed) {
      console.log(`          Failed: ${req.errorText}`);
    }
  });

  console.log('\n--- 3e. Browser Console Warnings & Errors ---');
  consoleLog.filter(c => c.type === 'error' || c.type === 'warning').forEach(c => {
    console.log(`[${c.type.toUpperCase()}] ${c.text}`);
  });

  if (exceptions.length > 0) {
    console.log('\n--- 3f. Uncaught Browser Exceptions ---');
    console.log(JSON.stringify(exceptions, null, 2));
  }

  ws.close();
  chrome.kill();
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

async function main() {
  try {
    await testDirectApi();
    await runBrowserDiagnostics();
    console.log('\n================================================================');
    console.log('DIAGNOSTIC COMPLETE');
    console.log('================================================================');
  } catch (err) {
    console.error('Diagnostic error:', err);
    try { chrome.kill(); } catch (_) {}
  }
}

main();
