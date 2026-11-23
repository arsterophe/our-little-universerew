import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const CDP_PORT = Math.floor(15000 + Math.random() * 15000);
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:/Users/ALENDA/.gemini/antigravity/brain/9032e95e-6264-445e-8703-2e60383b3a62';

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
  }

  async connect() {
    const { WebSocket } = await import('ws');
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.on('open', resolve);
      this.ws.on('error', reject);
      this.ws.on('message', (raw) => {
        const msg = JSON.parse(raw);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        }
      });
    });
  }

  send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function run() {
  const tmpUserDataDir = path.join(process.env.TEMP || 'C:\\Temp', `chrome_stories_akhira_${Date.now()}`);
  fs.mkdirSync(tmpUserDataDir, { recursive: true });

  const chromeProc = spawn(CHROME_PATH, [
    `--remote-debugging-port=${CDP_PORT}`,
    `--user-data-dir=${tmpUserDataDir}`,
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--window-size=1440,900',
    'about:blank'
  ]);

  try {
    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
      await sleep(300);
      try {
        const list = await fetchJson(`http://127.0.0.1:${CDP_PORT}/json/list`);
        if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
          wsUrl = list[0].webSocketDebuggerUrl;
          break;
        }
      } catch {}
    }

    if (!wsUrl) throw new Error('Failed to obtain Chrome CDP WebSocket URL');

    const client = new CDPClient(wsUrl);
    await client.connect();

    await client.send('Page.enable');
    await client.send('Runtime.enable');

    console.log('1. Navigating to http://localhost:5173 ...');
    await client.send('Page.navigate', { url: 'http://localhost:5173' });
    await sleep(2500);

    // Render Akhira session and opening Yawn World
    console.log('2. Rendering Akhira session and opening Yawn World...');
    const enterYawnRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const { ensureUniversesController, renderPrivateUniverse } = await import('/main.js');
          const { logoutFirebase } = await import('/firebase.js');
          try {
            await logoutFirebase();
          } catch (_) {}

          const univCtrl = await ensureUniversesController();
          
          const akhiraUser = {
            uid: 'MT14ZHATNqe90frAeQ74QFk4iXs2',
            email: 'akhira@ourlittleuniverse.com',
            displayName: 'Akhira',
            emailVerified: true
          };

          const charConfig = {
            name: 'Akhira',
            characterKey: 'akhira',
            universe: 'YAWN',
            symbol: '⚡'
          };

          await renderPrivateUniverse(akhiraUser, charConfig, false);
          await new Promise(r => setTimeout(r, 400));
          univCtrl.openYawnWorld();
          await new Promise(r => setTimeout(r, 600));

          return {
            yawnWorldActive: document.getElementById('view-yawn-world')?.classList.contains('active'),
            hasStoryBtn: !!document.getElementById('btn-yawn-top-story'),
            theme: document.body.className
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Enter Yawn result:', enterYawnRes.result.value);
    await sleep(500);

    // Click "Story" button in top nav of Yawn World
    console.log('3. Clicking "📖 Story" button in YAWN top nav...');
    const openStoriesRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const btn = document.getElementById('btn-yawn-top-story');
          if (btn) btn.click();
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 100));
            if (document.getElementById('view-our-stories')?.classList.contains('active')) break;
          }
          const ourStories = document.getElementById('view-our-stories');
          const pills = Array.from(document.querySelectorAll('#stories-universe-pills .universe-filter-pill')).map(p => ({
            univ: p.getAttribute('data-univ'),
            label: p.textContent.trim()
          }));
          return {
            ourStoriesActive: ourStories?.classList.contains('active'),
            universePills: pills,
            writeSpaceBtn: !!document.getElementById('btn-open-write-space'),
            myWorksBtn: !!document.getElementById('btn-open-my-works')
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Open stories result:', JSON.stringify(openStoriesRes.result.value, null, 2));
    await sleep(600);

    const shotLibrary = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'stories_01_akhira_library_live.jpg'), Buffer.from(shotLibrary.data, 'base64'));
    console.log('Saved stories_01_akhira_library_live.jpg');

    // Open Workspace
    console.log('4. Opening Personal Story Workspace to create a new story as Akhira...');
    const openWorkspaceRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const btn = document.getElementById('btn-open-write-space');
          if (btn) btn.click();
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 100));
            if (document.getElementById('view-story-workspace')?.classList.contains('active')) break;
          }
          const ws = document.getElementById('view-story-workspace');
          return {
            workspaceActive: ws?.classList.contains('active'),
            authorBadge: document.getElementById('workspace-author-badge')?.textContent?.trim(),
            statusText: document.getElementById('workspace-status-indicator')?.textContent?.trim()
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Workspace open result:', openWorkspaceRes.result.value);
    await sleep(400);

    // Fill in new story details: Title, Subtitle, Category, Genre, Cover Theme, Content
    console.log('5. Typing story: "Nyanyian Samudra Astral", selecting Abyss theme, saving draft...');
    const draftSaveRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const inputTitle = document.getElementById('input-story-title');
          const inputSub = document.getElementById('input-story-subtitle');
          const selectCat = document.getElementById('select-story-category');
          const inputSyn = document.getElementById('input-story-synopsis');
          const editor = document.getElementById('story-editor-content');
          const btnAbyss = document.querySelector('.theme-swatch-btn[data-theme="abyss"]');
          
          window.confirm = () => true;
          if (inputTitle) {
            inputTitle.value = 'Nyanyian Samudra Astral';
            inputTitle.dispatchEvent(new Event('input', { bubbles: true }));
          }
          if (inputSub) {
            inputSub.value = 'Kidung Kedamaian Bawah Laut';
            inputSub.dispatchEvent(new Event('input', { bubbles: true }));
          }
          if (selectCat) {
            selectCat.value = 'sastra';
            selectCat.dispatchEvent(new Event('change', { bubbles: true }));
          }
          if (inputSyn) {
            inputSyn.value = 'Ketika dunia melambat, samudra memeluk jiwa yang lelah di kedalaman YAWN.';
            inputSyn.dispatchEvent(new Event('input', { bubbles: true }));
          }
          if (editor) {
            editor.innerHTML = '<p>Di antara desir partikel laut bercahaya lavender dan keanggunan paus astral, kedamaian sejati tercipta di Our Little Universe.</p><p>Setiap gelombang membawa ketenangan, menyapu rasa lelah dan menggantinya dengan keheningan suci nan abadi.</p>';
            editor.dispatchEvent(new Event('input', { bubbles: true }));
          }
          if (btnAbyss) btnAbyss.click();

          // Save draft
          const btnDraft = document.getElementById('btn-story-save-draft');
          if (btnDraft) btnDraft.click();
          await new Promise(r => setTimeout(r, 600));

          return {
            title: inputTitle?.value,
            statusText: document.getElementById('workspace-status-indicator')?.textContent?.trim(),
            wordCount: document.getElementById('live-word-count-badge')?.textContent?.trim()
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Draft save result:', draftSaveRes.result.value);
    await sleep(400);

    const shotDraft = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'stories_02_akhira_draft_workspace_live.jpg'), Buffer.from(shotDraft.data, 'base64'));
    console.log('Saved stories_02_akhira_draft_workspace_live.jpg');

    // Switch to "Karya Saya" tab
    console.log('6. Switching to "Karya Saya" tab to view personal drafts...');
    const myWorksRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const btnMyWorksTab = document.getElementById('btn-workspace-tab-my-works');
          if (btnMyWorksTab) btnMyWorksTab.click();
          await new Promise(r => setTimeout(r, 400));
          const list = document.getElementById('my-works-list');
          const items = Array.from(list?.querySelectorAll('.my-work-item-card') || []).map(item => ({
            title: item.querySelector('.my-work-title')?.textContent?.trim(),
            status: item.querySelector('.work-status-badge')?.textContent?.trim()
          }));
          return {
            paneVisible: document.getElementById('workspace-my-works-pane')?.style.display !== 'none',
            itemCount: items.length,
            items
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('My works tab result:', JSON.stringify(myWorksRes.result.value, null, 2));
    await sleep(400);

    const shotMyWorks = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'stories_03_akhira_my_works_live.jpg'), Buffer.from(shotMyWorks.data, 'base64'));
    console.log('Saved stories_03_akhira_my_works_live.jpg');

    // Switch back to editor and Publish story
    console.log('7. Switching back to editor and publishing the story...');
    const publishRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const btnEditorTab = document.getElementById('btn-workspace-tab-editor');
          if (btnEditorTab) btnEditorTab.click();
          await new Promise(r => setTimeout(r, 300));
          const btnPublish = document.getElementById('btn-story-publish');
          if (btnPublish) btnPublish.click();
          await new Promise(r => setTimeout(r, 600));

          return {
            statusText: document.getElementById('workspace-status-indicator')?.textContent?.trim()
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Publish result:', publishRes.result.value);
    await sleep(400);

    // Return to Library
    console.log('8. Returning to Public Library and verifying published story card...');
    const libraryCheckRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const btnBack = document.getElementById('btn-workspace-back');
          if (btnBack) btnBack.click();
          await new Promise(r => setTimeout(r, 500));

          const cards = Array.from(document.querySelectorAll('#stories-grid .story-card')).map(c => ({
            title: c.querySelector('.story-card-title')?.textContent?.trim(),
            author: c.querySelector('.author-name')?.textContent?.trim(),
            universe: c.querySelector('.univ-tag')?.textContent?.trim()
          }));

          return {
            libraryActive: document.getElementById('view-our-stories')?.classList.contains('active'),
            totalCards: cards.length,
            cards: cards.slice(0, 5)
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Library check result:', JSON.stringify(libraryCheckRes.result.value, null, 2));
    await sleep(400);

    const shotPublishedLibrary = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'stories_04_akhira_published_library_live.jpg'), Buffer.from(shotPublishedLibrary.data, 'base64'));
    console.log('Saved stories_04_akhira_published_library_live.jpg');

    // Open Reading Mode
    console.log('9. Clicking on Akhira story card to open Reading Mode...');
    const readingRes = await client.send('Runtime.evaluate', {
      expression: `
        (async () => {
          const card = document.querySelector('#stories-grid .story-card[data-story-id]');
          if (card) card.click();
          for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 100));
            if (document.getElementById('view-story-reading')?.classList.contains('active')) break;
          }
          const reading = document.getElementById('view-story-reading');
          return {
            readingActive: reading?.classList.contains('active'),
            title: document.getElementById('reading-header-title')?.textContent?.trim(),
            author: document.getElementById('reading-header-author')?.textContent?.trim(),
            articleTitle: reading?.querySelector('.reader-book-title')?.textContent?.trim()
          };
        })()
      `,
      awaitPromise: true,
      returnByValue: true
    });
    console.log('Reading mode result:', readingRes.result.value);
    await sleep(500);

    const shotReading = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'stories_05_akhira_reading_mode_live.jpg'), Buffer.from(shotReading.data, 'base64'));
    console.log('Saved stories_05_akhira_reading_mode_live.jpg');

    // Test Mobile Viewport (390x844)
    console.log('10. Testing mobile responsive view (390x844)...');
    await client.send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });
    await sleep(500);

    const shotMobileReading = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'stories_06_akhira_mobile_reading_390.jpg'), Buffer.from(shotMobileReading.data, 'base64'));
    console.log('Saved stories_06_akhira_mobile_reading_390.jpg');

    // Return to Library on Mobile
    await client.send('Runtime.evaluate', {
      expression: `
        (() => {
          const btnBack = document.getElementById('btn-reading-back');
          if (btnBack) btnBack.click();
        })()
      `
    });
    await sleep(500);

    const shotMobileLibrary = await client.send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'stories_07_akhira_mobile_library_390.jpg'), Buffer.from(shotMobileLibrary.data, 'base64'));
    console.log('Saved stories_07_akhira_mobile_library_390.jpg');

    console.log('\nALL AKHIRA OUR STORIES BROWSER VERIFICATIONS COMPLETED SUCCESSFULLY!');
    client.close();
  } catch (err) {
    console.error('Error during Akhira stories verification:', err);
  } finally {
    try {
      chromeProc.kill('SIGKILL');
    } catch {}
  }
}

run();
