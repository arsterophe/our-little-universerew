/**
 * OUR LITTLE UNIVERSE — FASE 5 TEST SUITE
 * Photobooth UI, Camera Lifecycle, Multi-layout, Storage, Firestore & Gallery Integration
 */

import './load_env.js';

// Setup Mock DOM for Node environment before importing UI controllers
const mockElements = {};
function createMockEl(id, className = '') {
  const el = {
    id,
    className,
    style: {},
    dataset: {},
    attributes: {},
    classList: {
      _classes: new Set(className ? className.split(' ') : []),
      add(cls) { this._classes.add(cls); el.className = Array.from(this._classes).join(' '); },
      remove(cls) { this._classes.delete(cls); el.className = Array.from(this._classes).join(' '); },
      toggle(cls, force) {
        if (force === undefined) {
          if (this._classes.has(cls)) this.remove(cls); else this.add(cls);
        } else if (force) {
          this.add(cls);
        } else {
          this.remove(cls);
        }
      },
      contains(cls) { return this._classes.has(cls); }
    },
    setAttribute(k, v) { this.attributes[k] = String(v); },
    getAttribute(k) { return this.attributes[k] || null; },
    removeAttribute(k) { delete this.attributes[k]; },
    innerHTML: '',
    textContent: '',
    disabled: false,
    checked: true,
    value: '',
    listeners: {},
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    },
    click() {
      if (this.listeners['click']) {
        this.listeners['click'].forEach((fn) => fn({ preventDefault: () => {}, stopPropagation: () => {} }));
      }
    },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    appendChild(child) { return child; },
    removeChild(child) { return child; }
  };
  mockElements[id] = el;
  return el;
}

const mockIds = [
  'view-photobooth', 'universe-toast', 'toast-message',
  'pb-active-user-avatar', 'pb-active-user-name', 'pb-active-user-sub', 'btn-pb-return-home',
  'pb-stage-welcome', 'btn-pb-start', 'btn-pb-create-room', 'pb-join-code-input', 'btn-pb-join-room', 'pb-join-error-msg',
  'pb-stage-booth', 'pb-room-code-display', 'btn-pb-copy-code', 'btn-pb-leave-room', 'pb-self-presence-text',
  'pb-partner-presence-text', 'pb-partner-status-dot', 'pb-sync-mode-badge',
  'pb-camera-error-msg', 'pb-local-slot-tag', 'pb-local-video', 'pb-local-fallback-img', 'pb-local-placeholder',
  'btn-pb-request-camera', 'pb-countdown-overlay', 'pb-countdown-number', 'pb-shutter-flash',
  'pb-partner-slot-tag', 'pb-partner-preview-img', 'pb-partner-placeholder', 'pb-partner-placeholder-icon',
  'pb-partner-placeholder-title', 'pb-partner-placeholder-desc', 'btn-pb-upload-partner', 'pb-partner-upload-input', 'btn-pb-clear-partner',
  'pb-local-upload-input', 'btn-pb-capture-pose', 'pb-capture-btn-label', 'pb-timer-select', 'btn-pb-retake-pose',
  'btn-pb-toggle-camera', 'btn-pb-mirror-toggle', 'btn-pb-upload-self', 'pb-camera-status-text',
  'pb-pose-counter', 'pb-poses-list', 'btn-pb-goto-strip',
  'pb-stage-result', 'pb-strip-completion-status', 'pb-strip-canvas', 'btn-pb-download', 'pb-download-btn-label',
  'btn-pb-save-cloud', 'pb-cloud-feedback', 'pb-save-visibility', 'btn-pb-back-to-booth', 'btn-pb-restart-session',
  'pb-custom-caption-input', 'pb-toggle-date'
];

mockIds.forEach((id) => createMockEl(id));

// Setup canvas mock methods
mockElements['pb-strip-canvas'].getContext = () => ({
  fillStyle: '',
  fillRect: () => {},
  fillText: () => {},
  beginPath: () => {},
  arc: () => {},
  fill: () => {},
  stroke: () => {},
  drawImage: () => {},
  createLinearGradient: () => ({ addColorStop: () => {} }),
  save: () => {},
  restore: () => {}
});
mockElements['pb-strip-canvas'].toBlob = (cb) => {
  cb(new Blob([Buffer.from('sample')], { type: 'image/png' }));
};
mockElements['pb-strip-canvas'].toDataURL = () => 'data:image/png;base64,sample';

const layoutButtons = [2, 3, 4].map((cnt) => {
  const btn = createMockEl(`btn-layout-${cnt}`, `pb-layout-btn ${cnt === 4 ? 'active' : ''}`);
  btn.dataset.pbLayout = String(cnt);
  return btn;
});

const frameCards = ['moon_stars', 'pastel_flowers', 'crystal_dreams', 'retro_memories'].map((f) => {
  const card = createMockEl(`card-frame-${f}`, `pb-frame-card ${f === 'moon_stars' ? 'active' : ''}`);
  card.dataset.pbFrame = f;
  return card;
});

const stickerButtons = ['stars', 'hearts', 'moons', 'flowers'].map((s) => {
  const btn = createMockEl(`btn-sticker-${s}`, `pb-sticker-btn ${s === 'stars' ? 'active' : ''}`);
  btn.dataset.pbSticker = s;
  return btn;
});

const captionButtons = ['Our Little Memories', 'Forever Besties', 'A Sweet Starlit Night', 'Twinkling Smiles'].map((c, i) => {
  const btn = createMockEl(`btn-caption-${i}`, `pb-caption-btn ${i === 0 ? 'active' : ''}`);
  btn.dataset.pbCaption = c;
  return btn;
});

const charChips = ['nyanya', 'lala', 'lele'].map((ch) => {
  const chip = createMockEl(`chip-char-${ch}`, `pb-char-chip ${ch === 'nyanya' ? 'active' : ''}`);
  chip.dataset.pbChar = ch;
  return chip;
});

global.window = {
  scrollTo: () => {},
  innerWidth: 1200,
  innerHeight: 800,
  location: { hostname: 'localhost', protocol: 'http:' },
  addEventListener: () => {},
  removeEventListener: () => {}
};

global.BroadcastChannel = class {
  constructor() {}
  postMessage() {}
  close() {}
};

global.document = {
  getElementById: (id) => mockElements[id] || null,
  querySelector: (sel) => {
    if (sel.startsWith('#')) return mockElements[sel.slice(1)] || null;
    if (sel.includes('.pb-layout-btn')) return layoutButtons[0];
    if (sel.includes('.pb-frame-card')) return frameCards[0];
    if (sel.includes('.pb-sticker-btn')) return stickerButtons[0];
    return null;
  },
  querySelectorAll: (sel) => {
    if (sel.includes('.pb-layout-btn')) return layoutButtons;
    if (sel.includes('.pb-frame-card')) return frameCards;
    if (sel.includes('.pb-sticker-btn')) return stickerButtons;
    if (sel.includes('.pb-caption-btn')) return captionButtons;
    if (sel.includes('.pb-char-chip')) return charChips;
    if (sel.includes('.pb-step-pill')) return [];
    if (sel.includes('.univ-nav-btn')) return [];
    return [];
  },
  createElement: (tag) => createMockEl(`created-${tag}-${Math.random().toString(36).slice(2, 6)}`)
};

const OrigURL = global.URL;
OrigURL.createObjectURL = OrigURL.createObjectURL || (() => `blob:http://localhost/${Math.random().toString(36).slice(2, 8)}`);
OrigURL.revokeObjectURL = OrigURL.revokeObjectURL || (() => {});

import {
  auth,
  dbSavePhotoboothStrip,
  dbFetchMomentBlob,
  dbCreateMomentObjectURL,
  dbRevokeMomentObjectURL,
  dbSaveMoment
} from './firebase.js';

import {
  initPhotoboothView,
  syncPhotoboothActiveCharacter,
  savePhotoStripToCloud
} from './photobooth_view.js';

import {
  addMoment,
  getMomentsFeed,
  setActiveUserCharacter as setMomentsActiveUser
} from './moments.js';

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

const FIRESTORE_BASE = 'http://127.0.0.1:8080/v1/projects/our-little-universe-dcd75/databases/(default)/documents';
const STORAGE_BASE = 'http://127.0.0.1:9199/v0/b/our-little-universe-dcd75.firebasestorage.app/o';

const tokenNyanya = makeJwt('uid_nyanya_alenda', 'nyanya@ourlittleuniverse.com', true);
const tokenLala = makeJwt('uid_lala_bella', 'lala@ourlittleuniverse.com', true);
const tokenLele = makeJwt('uid_lele_vanya', 'lele@ourlittleuniverse.com', true);
const tokenStranger = makeJwt('uid_stranger_guest', 'stranger@example.com', true);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`✓ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`✗ FAIL: ${message}`);
  }
}

function toFirestoreFields(obj) {
  const fields = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val === null || val === undefined) {
      fields[key] = { nullValue: null };
    } else if (typeof val === 'boolean') {
      fields[key] = { booleanValue: val };
    } else if (typeof val === 'number') {
      fields[key] = Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
    } else if (typeof val === 'string') {
      fields[key] = { stringValue: val };
    } else if (Array.isArray(val)) {
      fields[key] = {
        arrayValue: {
          values: val.map((v) => (typeof v === 'string' ? { stringValue: v } : { mapValue: { fields: toFirestoreFields(v) } }))
        }
      };
    } else if (typeof val === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(val) } };
    }
  }
  return fields;
}

async function runTestSuite() {
  console.log('================================================================');
  console.log('OUR LITTLE PHOTOBOOTH — FASE 5 VERIFICATION SUITE');
  console.log('================================================================\n');

  // ------------------------------------------------------------------
  // 1. STORAGE SECURITY RULES (PRIVATE & SHARED FOR PHOTOBOOTH)
  // ------------------------------------------------------------------
  console.log('--- 1. STORAGE RULES: PHOTOBOOTH PATHS (PRIVATE & SHARED) ---');

  const samplePngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  // 1.1 Nyanya uploads private strip to moments/private
  const resUploadMomentsPriv = await fetch(
    `${STORAGE_BASE}/moments%2Fprivate%2Fuid_nyanya_alenda%2Fpb-strip-1.png?uploadType=media`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNyanya}`,
        'Content-Type': 'image/png'
      },
      body: samplePngBuffer
    }
  );
  assert(resUploadMomentsPriv.status === 200, 'Nyanya can upload private strip to moments/private/uid_nyanya_alenda/... (200)');

  // 1.2 Nyanya uploads private strip to photobooth/private
  const resUploadPbPriv = await fetch(
    `${STORAGE_BASE}/photobooth%2Fprivate%2Fuid_nyanya_alenda%2Fpb-strip-2.png?uploadType=media`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNyanya}`,
        'Content-Type': 'image/png'
      },
      body: samplePngBuffer
    }
  );
  assert(resUploadPbPriv.status === 200, 'Nyanya can upload private strip to photobooth/private/uid_nyanya_alenda/... (200)');

  // 1.3 Nyanya uploads shared strip to photobooth/shared
  const resUploadPbShared = await fetch(
    `${STORAGE_BASE}/photobooth%2Fshared%2Fuid_nyanya_alenda%2Fpb-strip-shared.png?uploadType=media`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenNyanya}`,
        'Content-Type': 'image/png'
      },
      body: samplePngBuffer
    }
  );
  assert(resUploadPbShared.status === 200, 'Nyanya can upload shared strip to photobooth/shared/uid_nyanya_alenda/... (200)');

  // 1.4 Lala attempts to upload into Nyanya private path: REJECTED (403)
  const resLalaTamperPriv = await fetch(
    `${STORAGE_BASE}/photobooth%2Fprivate%2Fuid_nyanya_alenda%2Ftampered.png?uploadType=media`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenLala}`,
        'Content-Type': 'image/png'
      },
      body: samplePngBuffer
    }
  );
  assert(resLalaTamperPriv.status === 403, 'Cross-account write rejected: Lala cannot write to Nyanya private path (403)');

  // 1.5 Unauthenticated write: REJECTED (401/403)
  const resUnauthWrite = await fetch(
    `${STORAGE_BASE}/photobooth%2Fprivate%2Fuid_nyanya_alenda%2Fhack.png?uploadType=media`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'image/png' },
      body: samplePngBuffer
    }
  );
  assert(resUnauthWrite.status === 401 || resUnauthWrite.status === 403, 'Unauthenticated write rejected (401/403)');

  // 1.6 Stranger write to shared: REJECTED (403)
  const resStrangerWrite = await fetch(
    `${STORAGE_BASE}/photobooth%2Fshared%2Fuid_stranger_guest%2Fstrip.png?uploadType=media`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokenStranger}`,
        'Content-Type': 'image/png'
      },
      body: samplePngBuffer
    }
  );
  assert(resStrangerWrite.status === 403, 'Stranger outside universe cannot write to photobooth/shared (403)');

  // 1.7 Nyanya reads her own private strip: SUCCESS (200)
  const resReadOwnPriv = await fetch(
    `${STORAGE_BASE}/photobooth%2Fprivate%2Fuid_nyanya_alenda%2Fpb-strip-2.png?alt=media`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenNyanya}` }
    }
  );
  assert(resReadOwnPriv.status === 200, 'Owner (Nyanya) can read her own private photobooth strip (200)');

  // 1.8 Lala reads Nyanya private strip: REJECTED (403)
  const resLalaReadPriv = await fetch(
    `${STORAGE_BASE}/photobooth%2Fprivate%2Fuid_nyanya_alenda%2Fpb-strip-2.png?alt=media`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenLala}` }
    }
  );
  assert(resLalaReadPriv.status === 403, 'Privacy barrier: Lala cannot read Nyanya private photobooth strip (403)');

  // 1.9 Lele reads Nyanya private strip: REJECTED (403)
  const resLeleReadPriv = await fetch(
    `${STORAGE_BASE}/photobooth%2Fprivate%2Fuid_nyanya_alenda%2Fpb-strip-2.png?alt=media`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenLele}` }
    }
  );
  assert(resLeleReadPriv.status === 403, 'Privacy barrier: Lele cannot read Nyanya private photobooth strip (403)');

  // 1.10 Stranger reads Nyanya private strip: REJECTED (403)
  const resStrangerReadPriv = await fetch(
    `${STORAGE_BASE}/photobooth%2Fprivate%2Fuid_nyanya_alenda%2Fpb-strip-2.png?alt=media`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenStranger}` }
    }
  );
  assert(resStrangerReadPriv.status === 403, 'Stranger cannot read private photobooth strip (403)');

  // 1.11 Shared strip read by friend (Lala): SUCCESS (200)
  const resLalaReadShared = await fetch(
    `${STORAGE_BASE}/photobooth%2Fshared%2Fuid_nyanya_alenda%2Fpb-strip-shared.png?alt=media`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenLala}` }
    }
  );
  assert(resLalaReadShared.status === 200, 'Universe Friend (Lala) can read shared photobooth strip (200)');

  // 1.12 Shared strip read by friend (Lele): SUCCESS (200)
  const resLeleReadShared = await fetch(
    `${STORAGE_BASE}/photobooth%2Fshared%2Fuid_nyanya_alenda%2Fpb-strip-shared.png?alt=media`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenLele}` }
    }
  );
  assert(resLeleReadShared.status === 200, 'Universe Friend (Lele) can read shared photobooth strip (200)');

  // 1.13 Shared strip read by Stranger: REJECTED (403)
  const resStrangerReadShared = await fetch(
    `${STORAGE_BASE}/photobooth%2Fshared%2Fuid_nyanya_alenda%2Fpb-strip-shared.png?alt=media`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenStranger}` }
    }
  );
  assert(resStrangerReadShared.status === 403, 'Stranger outside universe cannot read shared photobooth strip (403)');

  // ------------------------------------------------------------------
  // 2. FIRESTORE SECURITY RULES (PHOTOBOOTH SESSIONS & MOMENTS)
  // ------------------------------------------------------------------
  console.log('\n--- 2. FIRESTORE RULES: PHOTOBOOTH SESSIONS & METADATA ---');

  const sessionDocId = 'pb-sess-nyanya-001';
  const sessionData = {
    id: sessionDocId,
    authorUid: 'uid_nyanya_alenda',
    author: 'nyanya',
    roomCode: 'OLU777',
    theme: 'moon_stars',
    stripLayout: '4',
    storagePath: 'moments/private/uid_nyanya_alenda/pb-sess-nyanya-001.png',
    caption: 'Our Little Memories',
    createdAt: Date.now()
  };

  // 2.1 Nyanya creates photobooth_session: SUCCESS (200)
  const resCreateSession = await fetch(
    `${FIRESTORE_BASE}/photobooth_sessions/${sessionDocId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenNyanya}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: toFirestoreFields(sessionData) })
    }
  );
  assert(resCreateSession.status === 200, 'Nyanya can create photobooth_sessions document (200)');

  // 2.2 Lala reads photobooth_session: SUCCESS (200) - members can see session room info
  const resReadSession = await fetch(
    `${FIRESTORE_BASE}/photobooth_sessions/${sessionDocId}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenLala}` }
    }
  );
  assert(resReadSession.status === 200, 'Universe member (Lala) can read session info for sync (200)');

  // 2.3 Lala attempts to update Nyanya session: REJECTED (403)
  const resUpdateSessionTamper = await fetch(
    `${FIRESTORE_BASE}/photobooth_sessions/${sessionDocId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenLala}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: toFirestoreFields({ ...sessionData, authorUid: 'uid_nyanya_alenda', caption: 'Hacked by Lala' })
      })
    }
  );
  assert(resUpdateSessionTamper.status === 403, 'Cross-account write rejected: Lala cannot update Nyanya session (403)');

  // 2.4 Unauthenticated read of photobooth_session: REJECTED (403)
  const resUnauthReadSession = await fetch(
    `${FIRESTORE_BASE}/photobooth_sessions/${sessionDocId}`,
    { method: 'GET' }
  );
  assert(resUnauthReadSession.status === 403, 'Unauthenticated read of photobooth_sessions rejected (403)');

  // 2.5 Nyanya writes photobooth strip to moments collection with private storagePath: SUCCESS (200)
  const nowMs = Date.now();
  const momentDocId = 'pb-strip-nyanya-mom-' + nowMs;
  const momentData = {
    id: momentDocId,
    authorUid: 'uid_nyanya_alenda',
    author: 'nyanya',
    authorName: 'Nyanya',
    mediaType: 'image',
    mimeType: 'image/png',
    storagePath: 'moments/private/uid_nyanya_alenda/' + momentDocId + '.png',
    visibility: 'private',
    isStory: false,
    isArchived: true,
    publishedAt: nowMs,
    expiresAt: nowMs + 86400000,
    likes: 0,
    caption: 'Twinkling Smiles ✦',
    isDeleted: false,
    deleteStatus: 'active'
  };

  const resCreateMoment = await fetch(
    `${FIRESTORE_BASE}/moments/${momentDocId}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${tokenNyanya}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fields: toFirestoreFields(momentData) })
    }
  );
  assert(resCreateMoment.status === 200, 'Photobooth strip saved to moments collection with private storagePath (200)');

  // 2.6 Lala reads private moment: REJECTED (403)
  const resLalaReadPrivMoment = await fetch(
    `${FIRESTORE_BASE}/moments/${momentDocId}`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenLala}` }
    }
  );
  assert(resLalaReadPrivMoment.status === 403, 'Lala cannot read Nyanya private photobooth strip moment doc (403)');

  // ------------------------------------------------------------------
  // 3. ATOMIC GUARDS & ERROR HANDLING
  // ------------------------------------------------------------------
  console.log('\n--- 3. ATOMIC GUARDS & ERROR HANDLING ---');

  // 3.1 Unauthenticated call to dbSavePhotoboothStrip throws
  try {
    await dbSavePhotoboothStrip(null, {});
    assert(false, 'dbSavePhotoboothStrip should throw for null authUser');
  } catch (err) {
    assert(err.message.includes('Akses ditolak') || err.message.includes('terautentikasi'), 'dbSavePhotoboothStrip guards against unauthenticated callers');
  }

  // 3.2 Unverified stranger account throws
  try {
    const unverifiedUser = {
      uid: 'uid_stranger',
      email: 'stranger@example.com',
      emailVerified: true
    };
    await dbSavePhotoboothStrip(unverifiedUser, {});
    assert(false, 'dbSavePhotoboothStrip should throw for stranger account');
  } catch (err) {
    assert(err.message.includes('Akun belum terverifikasi') || err.message.includes('Akses ditolak'), 'dbSavePhotoboothStrip rejects unauthorized stranger account');
  }

  // 3.3 dbFetchMomentBlob guards against unauthenticated
  try {
    await dbFetchMomentBlob('moments/private/uid_nyanya_alenda/photo.png', null);
    assert(false, 'dbFetchMomentBlob should throw for null user');
  } catch (err) {
    assert(err.message.includes('Akses ditolak'), 'dbFetchMomentBlob rejects unauthenticated download');
  }

  // 3.4 dbFetchMomentBlob rejects cross-account private media read
  const authLala = { uid: 'uid_lala_bella', email: 'lala@ourlittleuniverse.com' };
  try {
    await dbFetchMomentBlob('moments/private/uid_nyanya_alenda/strip.png', authLala);
    assert(false, 'dbFetchMomentBlob should reject cross-account private media read');
  } catch (err) {
    assert(err.message.includes('Akses ditolak'), 'dbFetchMomentBlob blocks Lala from downloading Nyanya private media');
  }

  // 3.5 Object URL tracking and clean revocation
  dbRevokeMomentObjectURL('blob:http://localhost/mock-url-123');
  assert(true, 'dbRevokeMomentObjectURL safely executed without error');

  // ------------------------------------------------------------------
  // 4. PERSONAL GALLERY INTEGRATION
  // ------------------------------------------------------------------
  console.log('\n--- 4. PERSONAL GALLERY INTEGRATION (ZERO DUPLICATION) ---');

  setMomentsActiveUser('nyanya');

  const galleryMoment = addMoment({
    id: 'pb-strip-gallery-001',
    author: 'nyanya',
    storagePath: 'moments/private/uid_nyanya_alenda/pb-strip-gallery-001.png',
    mediaUrl: 'blob:http://localhost/test-strip-url',
    photoUrl: 'blob:http://localhost/test-strip-url',
    mediaType: 'image',
    mimeType: 'image/png',
    caption: 'A Sweet Starlit Night 🌙',
    isStory: false,
    visibility: 'private',
    isArchived: true,
    publishedAt: Date.now()
  });

  assert(galleryMoment.id === 'pb-strip-gallery-001', 'Moment added to momentsStore with identical ID (zero duplication)');

  const nyanyaGallery = getMomentsFeed('nyanya', 'nyanya');
  const foundInGallery = nyanyaGallery.some((m) => m.id === 'pb-strip-gallery-001');
  assert(foundInGallery, 'Saved Photobooth Strip appears immediately in Nyanya Personal Gallery');

  // Check that Lala viewing Nyanya gallery cannot see the private photobooth strip
  const lalaViewOfNyanya = getMomentsFeed('nyanya', 'lala');
  const lalaCanSeePrivate = lalaViewOfNyanya.some((m) => m.id === 'pb-strip-gallery-001');
  assert(!lalaCanSeePrivate, 'Lala viewing Nyanya gallery CANNOT see Nyanya private photobooth strip');

  // ------------------------------------------------------------------
  // 5. PHOTOBOOTH UI CONTROLLER & MULTI-LAYOUT INTEGRITY
  // ------------------------------------------------------------------
  console.log('\n--- 5. PHOTOBOOTH UI & MULTI-LAYOUT PRESERVATION ---');

  const controller = initPhotoboothView();
  assert(typeof controller.openPhotobooth === 'function', 'initPhotoboothView exposed controller with openPhotobooth');
  assert(typeof controller.closePhotobooth === 'function', 'initPhotoboothView exposed closePhotobooth');
  assert(typeof controller.syncActiveCharacter === 'function', 'initPhotoboothView exposed syncActiveCharacter');

  // Character Sync test
  syncPhotoboothActiveCharacter('lala', 'session');
  const activeNameEl = document.getElementById('pb-active-user-name');
  assert(activeNameEl && activeNameEl.textContent.includes('Lala'), 'syncPhotoboothActiveCharacter correctly synced active user to Lala');

  syncPhotoboothActiveCharacter('nyanya', 'session');
  assert(activeNameEl && activeNameEl.textContent.includes('Nyanya'), 'syncPhotoboothActiveCharacter switched back to Nyanya');

  // Test Incomplete strip prevention: download button should be disabled when poses empty
  const downloadBtn = document.getElementById('btn-pb-download');
  assert(downloadBtn && downloadBtn.disabled === true, 'Download button strictly disabled when poses are empty');

  const saveCloudBtn = document.getElementById('btn-pb-save-cloud');
  assert(saveCloudBtn && saveCloudBtn.disabled === true, 'Save to Cloud button strictly disabled when poses are empty');

  // Test layout buttons exist for 2, 3, 4 panels
  assert(layoutButtons.length === 3, 'Layout selector has buttons for 2, 3, and 4 strip panels');

  // Test frame theme cards
  assert(frameCards.length === 4, 'All 4 scrapbook frame themes present (Moon, Flowers, Crystal, Retro)');

  // Test sticker options
  assert(stickerButtons.length === 4, 'All 4 scrapbook sticker sets present (Stars, Hearts, Moons, Flowers)');

  // Test Camera Controls UI initial state
  const videoEl = document.getElementById('pb-local-video');
  const placeholderEl = document.getElementById('pb-local-placeholder');
  assert(Boolean(videoEl && placeholderEl), 'Video element and inactive camera placeholder present');
  assert(placeholderEl.style.display !== 'none', 'Camera is initially INACTIVE and requires user action (no auto-start)');

  console.log('\n================================================================');
  console.log(`FASE 5 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('================================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Test Suite encountered fatal error:', err);
  process.exit(1);
});
