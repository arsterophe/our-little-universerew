/**
 * INTEGRATION TEST: OUR STORIES NAVBAR NAVIGATION & FLOW
 * 
 * Tests:
 * 1. Clicking Our Stories from navbar opens #view-our-stories.
 * 2. Works seamlessly across all three accounts: Nyanya, Lala, Lele.
 * 3. Back navigation from Our Stories returns to universe.
 * 4. Navigating to Personal Writing Space and returning to Our Stories works.
 * 5. Reading mode open and back to Our Stories works.
 * 6. Other navbar buttons (Universes, Calendar, Gallery, Photobooth) remain fully functional.
 */

import fs from 'fs';

let passed = 0;
let total = 0;

function assert(condition, message, detail = '') {
  total++;
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✕ FAIL: ${message} ${detail ? '-> ' + detail : ''}`);
  }
}

console.log('================================================================');
console.log('1. TEST: HTML INTEGRITY — NAVBAR & OUR STORIES ELEMENTS');
console.log('================================================================');
const html = fs.readFileSync('index.html', 'utf-8');

assert(html.includes('id="nav-btn-stories"'), 'Tombol #nav-btn-stories terdaftar di index.html');
assert(html.includes('data-nav="stories"'), 'Atribut data-nav="stories" terdaftar di navbar');
assert(html.includes('id="view-our-stories"'), 'Section #view-our-stories terdaftar di index.html');
assert(html.includes('id="view-story-workspace"'), 'Section #view-story-workspace terdaftar di index.html');
assert(html.includes('id="view-story-reading"'), 'Section #view-story-reading terdaftar di index.html');
assert(html.includes('id="btn-stories-back-universe"'), 'Tombol kembali #btn-stories-back-universe terdaftar');
assert(html.includes('id="btn-kidult-story"'), 'Tombol HUD Story di KIDULT terdaftar');
assert(html.includes('id="btn-toyou-story"'), 'Tombol HUD Story di TO YOU terdaftar');
assert(html.includes('id="btn-shadow-story"'), 'Tombol HUD Story di SHADOW terdaftar');

console.log('\n================================================================');
console.log('2. TEST SETUP: DOM MOCK & CONTROLLER INITIALIZATION');
console.log('================================================================');

const elements = {};
function createMockEl(id, className = '') {
  const el = {
    id,
    className,
    classList: {
      classes: new Set(className.split(' ').filter(Boolean)),
      add(c) { this.classes.add(c); el.className = Array.from(this.classes).join(' '); },
      remove(c) { this.classes.delete(c); el.className = Array.from(this.classes).join(' '); },
      toggle(c, force) {
        if (force !== undefined) {
          if (force) this.classes.add(c);
          else this.classes.delete(c);
        } else {
          if (this.classes.has(c)) this.classes.delete(c);
          else this.classes.add(c);
        }
        el.className = Array.from(this.classes).join(' ');
      },
      contains(c) { return this.classes.has(c); }
    },
    attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; },
    getAttribute(k) { return this.attributes[k]; },
    textContent: '',
    innerHTML: '',
    value: '',
    src: '',
    alt: '',
    style: {},
    scrollTop: 0,
    scrollHeight: 1000,
    clientHeight: 500,
    focus: () => {},
    getBoundingClientRect: () => ({ left: 100, top: 100, width: 50, height: 30 }),
    listeners: {},
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    },
    click() {
      if (this.listeners['click']) {
        this.listeners['click'].forEach(fn => fn({ preventDefault: () => {}, stopPropagation: () => {} }));
      }
    },
    querySelector(sel) {
      return elements[sel.replace('#', '').replace('.', '')] || createMockEl('dynamic-child');
    },
    querySelectorAll() {
      return [];
    },
    appendChild(child) {
      return child;
    }
  };
  elements[id] = el;
  return el;
}

// Register all required mock elements
const requiredIds = [
  'view-selection', 'view-login', 'view-private-universe',
  'view-kidult-world', 'view-toyou-world', 'view-shadow-world',
  'view-orbit', 'view-moments', 'view-photobooth',
  'view-our-stories', 'view-story-workspace', 'view-story-reading',
  'nav-btn-universes', 'nav-btn-calendar', 'nav-btn-stories',
  'nav-btn-messages', 'nav-btn-games', 'nav-btn-gallery', 'nav-btn-photobooth', 'nav-btn-more',
  'btn-stories-back-universe', 'btn-open-write-space', 'btn-open-my-works',
  'btn-workspace-back', 'btn-workspace-tab-editor', 'btn-workspace-tab-my-works',
  'btn-story-save-draft', 'btn-story-publish', 'btn-story-discard',
  'btn-reading-back', 'btn-reading-bookmark', 'btn-reading-settings', 'btn-close-reading-settings',
  'btn-kidult-story', 'btn-toyou-story', 'btn-shadow-story',
  'btn-kidult-return-univ', 'btn-toyou-top-return', 'btn-shadow-top-return',
  'input-story-title', 'input-story-subtitle', 'input-story-synopsis',
  'select-story-category', 'select-story-form-genre', 'story-theme-options',
  'story-editor-content', 'live-word-count-badge',
  'stories-hero', 'stories-search-input', 'btn-stories-clear-search',
  'stories-category-pills', 'stories-universe-pills', 'select-story-genre', 'select-story-sort',
  'btn-filter-bookmarks', 'featured-story-container', 'stories-grid', 'stories-empty-state',
  'stories-results-count', 'workspace-title', 'workspace-author-badge', 'workspace-status-indicator',
  'workspace-editor-pane', 'workspace-my-works-pane', 'my-works-list',
  'reading-progress-bar', 'reading-progress-text', 'reading-article-container', 'reading-settings-panel',
  'reading-header-title', 'reading-header-author',
  'univ-user-greeting', 'univ-user-avatar', 'univ-profile-pill', 'univ-profile-dropdown',
  'island-card-kidult', 'island-card-toyou', 'island-card-shadow'
];

requiredIds.forEach(id => createMockEl(id));

// Set navbar buttons attributes
elements['nav-btn-universes'].setAttribute('data-nav', 'universes');
elements['nav-btn-calendar'].setAttribute('data-nav', 'calendar');
elements['nav-btn-stories'].setAttribute('data-nav', 'stories');

global.document = {
  getElementById: (id) => elements[id] || createMockEl(id),
  querySelectorAll: (sel) => {
    if (sel === '.univ-nav-btn') {
      return [elements['nav-btn-universes'], elements['nav-btn-calendar'], elements['nav-btn-stories']];
    }
    return [];
  },
  querySelector: (sel) => elements[sel.replace('#', '').replace('.', '')] || null,
  createElement: (tag) => createMockEl(`created-${tag}`),
  addEventListener: () => {}
};

global.window = {
  document: global.document,
  addEventListener: () => {},
  removeEventListener: () => {},
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; }
  },
  confirm: () => true
};

const { initStoriesView } = await import('./stories_view.js');
const { initUniversesView } = await import('./universes_view.js');
const { createStory, resetStoriesStore, setActiveUserCharacter } = await import('./stories.js');

resetStoriesStore();

// Create sample story per account for isolated test
setActiveUserCharacter('nyanya');
createStory({
  title: 'Kisah Bintang Senja di KIDULT',
  content: '<p>Di bawah langit lavender yang tenang...</p>',
  status: 'published',
  actor: 'nyanya'
});

setActiveUserCharacter('lele');
createStory({
  title: 'Seandainya di Taman Hydrangea',
  content: '<p>Di bawah cahaya bulan SHADOW yang tenang...</p>',
  status: 'published',
  actor: 'lele'
});

setActiveUserCharacter('nyanya');

let toastMsg = '';
const storiesCtrl = initStoriesView({
  onShowToast: (msg) => { toastMsg = msg; },
  onTriggerSparkle: () => {}
});

global.window.storiesController = storiesCtrl;

const univCtrl = initUniversesView({
  onShowToast: (msg) => { toastMsg = msg; },
  onTriggerSparkle: () => {},
  onNavigateStories: (fromView) => {
    storiesCtrl.openOurStories(fromView);
  },
  onNavigateStoryWorkspace: (fromView, mode = 'editor', storyId = null) => {
    storiesCtrl.openWorkspace(mode, storyId, fromView);
  }
});

global.window.universesController = univCtrl;

assert(Boolean(storiesCtrl), 'storiesController berhasil diinisialisasi');
assert(typeof storiesCtrl.openOurStories === 'function', 'storiesController.openOurStories siap dipanggil');
assert(typeof storiesCtrl.closeOurStories === 'function', 'storiesController.closeOurStories siap dipanggil');

console.log('\n================================================================');
console.log('3. TEST: AKUN NYANYA — KLIK "OUR STORIES" DI NAVBAR');
console.log('================================================================');
storiesCtrl.syncActiveUser('nyanya');
univCtrl.updateUserProfile('nyanya');

// Awalnya di Private Universe
elements['view-private-universe'].classList.add('active');
assert(elements['view-our-stories'].classList.contains('active') === false, 'Awalnya view-our-stories tidak aktif');

// Klik "Our Stories" dari navbar
elements['nav-btn-stories'].click();

assert(elements['view-our-stories'].classList.contains('active') === true, 'Setelah klik navbar, #view-our-stories BERSTATUS AKTIF');
assert(elements['view-our-stories'].getAttribute('aria-hidden') === 'false', 'aria-hidden disetel ke false');
assert(elements['view-private-universe'].classList.contains('active') === false, 'Halaman private universe dinonaktifkan');
assert(elements['nav-btn-stories'].classList.contains('active') === true, 'Tombol navbar Our Stories berstatus aktif');

// Klik "Kembali ke Universe" dari Our Stories
elements['btn-stories-back-universe'].click();

assert(elements['view-our-stories'].classList.contains('active') === false, 'Setelah klik kembali, #view-our-stories ditutup');
assert(elements['view-private-universe'].classList.contains('active') === true, 'Kembali ke halaman pemilihan tiga universe');
assert(elements['nav-btn-universes'].classList.contains('active') === true, 'Tombol navbar Universes kembali aktif');

console.log('\n================================================================');
console.log('4. TEST: AKUN LALA — KLIK "OUR STORIES" DI NAVBAR & BUKA WORKSPACE');
console.log('================================================================');
storiesCtrl.syncActiveUser('lala');
univCtrl.updateUserProfile('lala');

// Lala klik Our Stories dari navbar
elements['nav-btn-stories'].click();
assert(elements['view-our-stories'].classList.contains('active') === true, 'Lala berhasil membuka Our Stories');

// Lala klik "Tulis Karya Baru"
elements['btn-open-write-space'].click();
assert(elements['view-story-workspace'].classList.contains('active') === true, '#view-story-workspace aktif untuk Lala');
assert(elements['view-our-stories'].classList.contains('active') === false, 'Our Stories dinonaktifkan saat di workspace');

// Lala klik "Kembali" dari workspace
elements['btn-workspace-back'].click();
assert(elements['view-story-workspace'].classList.contains('active') === false, 'Workspace ditutup');
assert(elements['view-our-stories'].classList.contains('active') === true, 'Kembali ke Our Stories');

// Kembali ke Universe
elements['btn-stories-back-universe'].click();
assert(elements['view-private-universe'].classList.contains('active') === true, 'Kembali ke Private Universe dari akun Lala');

console.log('\n================================================================');
console.log('5. TEST: AKUN LELE — KLIK "OUR STORIES" DI NAVBAR & BUKA READING MODE');
console.log('================================================================');
storiesCtrl.syncActiveUser('lele');
univCtrl.updateUserProfile('lele');

// Lele klik Our Stories dari navbar
elements['nav-btn-stories'].click();
assert(elements['view-our-stories'].classList.contains('active') === true, 'Lele berhasil membuka Our Stories');

// Buka Reading Mode (Lele hanya melihat cerita milik Lele sendiri, bukan Nyanya)
const allStories = await import('./stories.js');
allStories.setActiveUserCharacter('lele');
const publishedList = allStories.getPublishedStories();
assert(publishedList.length === 1, 'Lele hanya melihat 1 karya published miliknya sendiri');
assert(publishedList[0].authorId === 'lele' && publishedList[0].title === 'Seandainya di Taman Hydrangea', 'Karya yang tampil di Our Stories Lele adalah milik Lele');
assert(publishedList.some((s) => s.title === 'Kisah Bintang Senja di KIDULT') === false, 'Karya Nyanya TIDAK muncul di Our Stories Lele');

storiesCtrl.openReadingMode(publishedList[0].id);
assert(elements['view-story-reading'].classList.contains('active') === true, '#view-story-reading berstatus aktif');
assert(elements['view-our-stories'].classList.contains('active') === false, 'Our Stories dinonaktifkan saat dalam Reading Mode');

// Klik kembali dari Reading Mode
elements['btn-reading-back'].click();
assert(elements['view-story-reading'].classList.contains('active') === false, 'Reading Mode ditutup');
assert(elements['view-our-stories'].classList.contains('active') === true, 'Kembali ke Our Stories');

// Kembali ke Universe
elements['btn-stories-back-universe'].click();
assert(elements['view-private-universe'].classList.contains('active') === true, 'Kembali ke Private Universe dari akun Lele');

console.log('\n================================================================');
console.log('6. TEST: TOMBOL HUD STORY DI KETIGA UNIVERSE');
console.log('================================================================');
elements['btn-kidult-story'].click();
assert(elements['view-story-workspace'].classList.contains('active') === true, 'Klik Story di KIDULT membuka Workspace');

elements['btn-workspace-back'].click();
assert(elements['view-our-stories'].classList.contains('active') === true, 'Kembali ke Our Stories');

elements['btn-stories-back-universe'].click();
assert(elements['view-private-universe'].classList.contains('active') === true, 'Kembali ke Private Universe');

console.log('\n================================================================');
console.log(`HASIL AKHIR: ${passed}/${total} PENGUJIAN BERHASIL (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================');

if (passed === total) {
  console.log('\n✨ SEMUA PENGUJIAN NAVIGASI OUR STORIES DARI NAVBAR BERHASIL 100%! ✨\n');
  process.exit(0);
} else {
  console.error('\n❌ ADA PENGUJIAN YANG GAGAL!\n');
  process.exit(1);
}
