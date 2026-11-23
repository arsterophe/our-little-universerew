import { spawn } from 'child_process';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';
import os from 'os';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'olu-storage-live-'));
const port = 9399;

const chrome = spawn(chromePath, [
  '--headless=new',
  `--remote-debugging-port=${port}`,
  `--user-data-dir=${tmpDir}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-gpu'
]);

async function main() {
  await new Promise(r => setTimeout(r, 1500));

  let pageTarget;
  for (let i = 0; i < 15; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      pageTarget = list.find(t => t.type === 'page');
      if (pageTarget) break;
    } catch (_) {
      await new Promise(r => setTimeout(r, 200));
    }
  }

  const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);
  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      pending.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  const consoleLogs = [];
  ws.onmessage = (evt) => {
    const data = JSON.parse(evt.data);
    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map(a => a.value || a.description || '').join(' ');
      consoleLogs.push(`[${data.params.type}] ${text}`);
    }
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data.result || data.error || data);
      pending.delete(data.id);
    }
  };

  await new Promise(r => ws.onopen = r);
  await send('Page.enable');
  await send('Runtime.enable');

  console.log('Navigating to http://localhost:5173...');
  await send('Page.navigate', { url: 'http://localhost:5173' });

  // Wait for page ready
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

  console.log('Page loaded. Checking in-browser storage and Firebase Auth persistence...');

  const evalResult = await send('Runtime.evaluate', {
    expression: `(async () => {
      try {
        const idbModule = await import('/olu_indexeddb.js');
        const fbModule = await import('/firebase.js');
        
        // Test IndexedDB connection
        const db = await idbModule.openOluDatabase();
        const idbAvailable = Boolean(db);

        // Preload house states
        const preloaded = await idbModule.preloadAllHouseStates();

        // Test saving Ruben and Ela house states through synchronous bridge
        const dragonDenModule = await import('/dragon_den_state.js');
        const rubenDefault = dragonDenModule.createDefaultDragonDenState();
        dragonDenModule.saveDragonDenState('ruben', rubenDefault);
        const rubenReadback = dragonDenModule.loadDragonDenState('ruben');

        const silentLotusModule = await import('/silent_lotus_state.js');
        const elaDefault = silentLotusModule.createDefaultSilentLotusState();
        silentLotusModule.saveSilentLotusState('ela', elaDefault);
        const elaReadback = silentLotusModule.loadSilentLotusState('ela');

        // Check localStorage keys and length
        const lsKeys = Object.keys(localStorage);
        const lsTotalBytes = Object.values(localStorage).reduce((sum, v) => sum + v.length, 0);

        return {
          idbAvailable,
          idbDatabaseName: db ? db.name : null,
          preloadedCount: preloaded,
          rubenLoaded: Boolean(rubenReadback && rubenReadback.character === 'ruben'),
          elaLoaded: Boolean(elaReadback && elaReadback.character === 'ela'),
          lsTotalKeys: lsKeys.length,
          lsTotalBytes,
          firebaseConfigured: fbModule.isFirebaseConfigured ? fbModule.isFirebaseConfigured() : null
        };
      } catch (err) {
        return { error: err.message, stack: err.stack };
      }
    })()`,
    awaitPromise: true,
    returnByValue: true
  });

  console.log('Raw evalResult:', JSON.stringify(evalResult, null, 2));

  console.log('\nRelevant Browser Console Logs:');
  consoleLogs.filter(l => l.includes('Firebase') || l.includes('OLU') || l.includes('Storage')).forEach(l => console.log(' ', l));

  ws.close();
  chrome.kill();
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch (_) {}
}

main().catch(err => {
  console.error('Diagnostic failed:', err);
  process.exit(1);
});
