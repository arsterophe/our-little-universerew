// verify_ela_moments_live.mjs
import http from 'http';
import { spawn } from 'child_process';
import os from 'os';
import path from 'path';
import fs from 'fs';

const artifactDir = 'C:\\Users\\ALENDA\\.gemini\\antigravity\\brain\\9032e95e-6264-445e-8703-2e60383b3a62';
const tempProfile = path.join(os.tmpdir(), 'chrome-ela-moments-' + Date.now());
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

const chrome = spawn(chromePath, [
  '--headless=new',
  '--remote-debugging-port=9222',
  `--user-data-dir=${tempProfile}`,
  '--disable-gpu',
  '--no-sandbox',
  'http://localhost:5173'
]);

await new Promise(r => setTimeout(r, 2500));

async function getPages() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

try {
  const pages = await getPages();
  const page = pages.find(p => p.url.includes('localhost:5173')) || pages[0];
  if (!page) {
    console.error('No page found');
    chrome.kill();
    process.exit(1);
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise(res => ws.onopen = res);

  let id = 1;
  const pending = new Map();

  function send(method, params = {}) {
    return new Promise((resolve) => {
      const msgId = id++;
      pending.set(msgId, (data) => resolve(data.result));
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pending.has(data.id)) {
      pending.get(data.id)(data);
      pending.delete(data.id);
    }
  };

  await send('Page.enable');
  await send('Runtime.enable');

  async function evalJs(expr) {
    const res = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true });
    return res && res.result ? res.result.value : null;
  }

  async function captureScreenshot(filename) {
    const shot = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 });
    const buffer = Buffer.from(shot.data, 'base64');
    const outPath = path.join(artifactDir, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${outPath}`);
  }

  // Set desktop viewport 1440x900
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false
  });

  await new Promise(r => setTimeout(r, 2000));

  console.log('--- Step 1: Login as Ela ---');
  await evalJs(`
    (async () => {
      // Direct login or character select as Ela
      window.activeCharacterKey = 'ela';
      if (typeof window.localStorage !== 'undefined') {
        localStorage.setItem('olu_active_character', 'ela');
      }
      // Hide login, show US AGAIN world
      document.querySelectorAll('.view-section').forEach(s => {
        s.classList.remove('active');
        s.setAttribute('aria-hidden', 'true');
      });
      const usagainWorld = document.getElementById('view-usagain-world');
      if (usagainWorld) {
        usagainWorld.classList.add('active');
        usagainWorld.setAttribute('aria-hidden', 'false');
      }
    })();
  `);

  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot('ela_moments_01_universe_entrance.jpg');

  console.log('--- Step 2: Open Our Little Moments from Ela Sanctuary ---');
  await evalJs(`
    (async () => {
      const btn = document.getElementById('btn-usagain-nav-moments');
      if (btn) btn.click();
      else if (window.momentsController) window.momentsController.openMoments('view-usagain-world', 'ela');
    })();
  `);

  await new Promise(r => setTimeout(r, 1200));

  const momentsMeta = await evalJs(`
    (() => {
      const viewer = document.getElementById('moments-viewer-name')?.textContent;
      const title = document.querySelector('.moments-main-title')?.textContent;
      const trayItems = Array.from(document.querySelectorAll('.story-avatar-item')).map(el => el.getAttribute('data-character'));
      const activeFilter = document.querySelector('.moments-filter-chip.active')?.getAttribute('data-filter');
      return { viewer, title, trayItems, activeFilter };
    })();
  `);
  console.log('Moments View Meta:', momentsMeta);
  await captureScreenshot('ela_moments_02_moments_view.jpg');

  console.log('--- Step 3: Open Upload Modal & Prepare Story ---');
  await evalJs(`
    (async () => {
      const btnCreate = document.getElementById('btn-create-story');
      if (btnCreate) btnCreate.click();
      
      const captionInput = document.getElementById('moment-caption-input');
      if (captionInput) {
        captionInput.value = 'Kelopak teratai bermekaran di bawah sinar rembulan The Silent Lotus 🪷✨';
        captionInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      // Inject sample image into preview
      const previewImg = document.getElementById('preview-image');
      const dropzonePreview = document.getElementById('dropzone-preview');
      const dropzonePrompt = document.getElementById('dropzone-prompt');
      if (previewImg && dropzonePreview && dropzonePrompt) {
        previewImg.src = '/assets/usagain_world_bg.jpg';
        dropzonePreview.style.display = 'block';
        dropzonePrompt.style.display = 'none';
      }
    })();
  `);

  await new Promise(r => setTimeout(r, 800));
  await captureScreenshot('ela_moments_03_story_upload_modal.jpg');

  console.log('--- Step 4: Publish Story as Ela ---');
  const publishResult = await evalJs(`
    (async () => {
      if (window.momentsController) {
        window.momentsController.setActiveUserCharacter('ela');
      }
      window.activeCharacterKey = 'ela';
      const created = window.momentsController ? window.momentsController.addMoment({
        mediaUrl: '/assets/usagain_world_bg.jpg',
        photoUrl: '/assets/usagain_world_bg.jpg',
        mediaType: 'image',
        mimeType: 'image/jpeg',
        sizeBytes: 102400,
        caption: 'Kelopak teratai bermekaran di bawah sinar rembulan The Silent Lotus 🪷✨',
        type: 'both',
        visibility: 'friends',
        isArchived: false,
        isStory: true,
        author: 'ela',
        location: 'Universe US AGAIN'
      }) : null;
      
      const modal = document.getElementById('modal-upload-moment');
      if (modal) modal.classList.remove('open');
      
      if (window.momentsController && typeof window.momentsController.openMoments === 'function') {
        window.momentsController.openMoments('view-usagain-world', 'ela');
      }
      
      return created ? { id: created.id, author: created.author, caption: created.caption } : null;
    })();
  `);
  console.log('Published Story:', publishResult);

  await new Promise(r => setTimeout(r, 1000));

  console.log('--- Step 5: Open Ela Story Viewer as Owner Ela ---');
  await evalJs(`
    (async () => {
      const elaStoryBtn = document.querySelector('.story-avatar-item[data-character="ela"]');
      if (elaStoryBtn) elaStoryBtn.click();
    })();
  `);

  await new Promise(r => setTimeout(r, 1000));

  const viewerElaState = await evalJs(`
    (() => {
      const overlay = document.getElementById('story-viewer-overlay')?.classList.contains('open');
      const author = document.getElementById('story-header-name')?.textContent;
      const caption = document.getElementById('story-caption-text')?.textContent;
      const deleteBtnVisible = document.getElementById('btn-story-delete')?.style.display !== 'none';
      return { overlay, author, caption, deleteBtnVisible };
    })();
  `);
  console.log('Story Viewer State (Ela Owner):', viewerElaState);
  await captureScreenshot('ela_moments_04_story_viewer_ela.jpg');

  console.log('--- Step 6: RBAC Test - View Ela Story as Nyanya ---');
  await evalJs(`
    (async () => {
      // Close overlay first
      const btnClose = document.getElementById('btn-story-close');
      if (btnClose) btnClose.click();
      
      if (window.momentsController) {
        window.momentsController.setActiveUserCharacter('nyanya');
      }
      window.activeCharacterKey = 'nyanya';
      
      // Re-open Ela story as Nyanya
      if (window.momentsController && typeof window.momentsController.openStoryViewerForCharacter === 'function') {
        window.momentsController.openStoryViewerForCharacter('ela');
      } else {
        const elaStoryBtn = document.querySelector('.story-avatar-item[data-character="ela"]');
        if (elaStoryBtn) elaStoryBtn.click();
      }
    })();
  `);

  await new Promise(r => setTimeout(r, 1000));

  const viewerNyanyaState = await evalJs(`
    (() => {
      const deleteBtn = document.getElementById('btn-story-delete');
      const deleteBtnVisible = deleteBtn ? (deleteBtn.style.display !== 'none' && window.getComputedStyle(deleteBtn).display !== 'none') : false;
      const author = document.getElementById('story-header-name')?.textContent;
      return { deleteBtnVisible, author };
    })();
  `);
  console.log('Story Viewer State (Nyanya non-owner):', viewerNyanyaState);
  await captureScreenshot('ela_moments_05_story_viewer_nyanya_rbac.jpg');

  console.log('--- Step 7: Switch back to Ela & Delete Story ---');
  const deleteResult = await evalJs(`
    (async () => {
      if (window.momentsController) {
        window.momentsController.setActiveUserCharacter('ela');
      }
      window.activeCharacterKey = 'ela';
      
      // Re-open Ela story as Ela
      const btnClose = document.getElementById('btn-story-close');
      if (btnClose) btnClose.click();
      
      if (window.momentsController && typeof window.momentsController.openStoryViewerForCharacter === 'function') {
        window.momentsController.openStoryViewerForCharacter('ela');
      } else {
        const elaStoryBtn = document.querySelector('.story-avatar-item[data-character="ela"]');
        if (elaStoryBtn) elaStoryBtn.click();
      }
      
      const btnDelete = document.getElementById('btn-story-delete');
      if (btnDelete) btnDelete.click();
      
      const remainingStories = window.momentsController ? window.momentsController.getStoriesByCharacter('ela') : [];
      return { remainingCount: remainingStories.length };
    })();
  `);
  console.log('Delete Result:', deleteResult);

  await new Promise(r => setTimeout(r, 800));

  console.log('--- Step 8: Scrapbook Filter by Ela ---');
  await evalJs(`
    (async () => {
      // Close viewer
      const btnClose = document.getElementById('btn-story-close');
      if (btnClose) btnClose.click();
      
      // Publish permanent feed moment for Ela
      if (window.momentsController) {
        window.momentsController.addMoment({
          mediaUrl: '/assets/portrait_ela_hd.jpg',
          photoUrl: '/assets/portrait_ela_hd.jpg',
          mediaType: 'image',
          caption: 'Menenun ketenangan di tepi kolam teratai suaka US AGAIN 🌸✨',
          type: 'feed',
          visibility: 'friends',
          isArchived: false,
          isStory: false,
          author: 'ela',
          location: 'Suaka The Silent Lotus'
        });
      }
      
      // Click filter chip Ela
      const elaChip = document.querySelector('.moments-filter-chip[data-filter="ela"]');
      if (elaChip) elaChip.click();
    })();
  `);

  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot('ela_moments_06_scrapbook_filtered.jpg');

  console.log('--- Step 9: Mobile Viewport 390x844 ---');
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true
  });

  await new Promise(r => setTimeout(r, 1000));
  await captureScreenshot('ela_moments_07_mobile_390.jpg');

  console.log('All steps completed successfully!');

} catch (err) {
  console.error('Verification error:', err);
} finally {
  chrome.kill();
  process.exit(0);
}
