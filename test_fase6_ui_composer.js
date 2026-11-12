/**
 * OUR LITTLE UNIVERSE — FASE 6 UI COMPOSER TEST SUITE
 * Tests text messaging, Enter & Shift+Enter key events, (+) attachment menu,
 * hidden file inputs isolation, attachment preview & cancel, and text preservation.
 */

import './load_env.js';
import {
  initMessagesView,
  openMessagesView,
  closeMessagesView
} from './messages_view.js';
import {
  validateMessageInput,
  formatFileSize,
  setActiveUserCharacter,
  getActiveUserCharacter,
  getActiveConversationId
} from './messages.js';

// Setup Mock DOM
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
    value: '',
    scrollTop: 0,
    scrollHeight: 1000,
    listeners: {},
    addEventListener(evt, fn) {
      if (!this.listeners[evt]) this.listeners[evt] = [];
      this.listeners[evt].push(fn);
    },
    trigger(evt, eventObj = {}) {
      if (this.listeners[evt]) {
        this.listeners[evt].forEach((fn) => fn(eventObj));
      }
    },
    click() {
      this.trigger('click', { preventDefault: () => {}, stopPropagation: () => {} });
    },
    querySelector(selector) {
      return null;
    },
    querySelectorAll(selector) {
      return [];
    },
    appendChild(child) { return child; },
    removeChild(child) { return child; },
    focus() {}
  };
  mockElements[id] = el;
  return el;
}

const mockIds = [
  'view-messages', 'btn-msg-return-home', 'msg-active-user-avatar', 'msg-active-user-name',
  'msg-active-user-sub', 'msg-conversation-list', 'msg-partner-avatar', 'msg-partner-name',
  'msg-partner-sub', 'msg-feed-area', 'msg-thread-status', 'msg-input-text', 'btn-msg-send',
  'msg-char-counter', 'btn-msg-attach', 'msg-attach-menu', 'btn-attach-image', 'btn-attach-video',
  'btn-attach-doc', 'btn-attach-audio', 'file-input-image', 'file-input-video', 'file-input-doc',
  'file-input-audio', 'btn-msg-mic', 'msg-recording-bar', 'msg-record-timer', 'btn-record-cancel',
  'btn-record-send', 'msg-normal-input-row', 'msg-attachment-preview', 'msg-preview-content',
  'btn-msg-preview-remove', 'msg-spark-notice', 'btn-spark-notice-close', 'msg-media-lightbox',
  'btn-msg-lightbox-close', 'msg-lightbox-img', 'msg-lightbox-caption'
];

mockIds.forEach(id => createMockEl(id));

global.document = {
  getElementById: (id) => mockElements[id] || createMockEl(id),
  createElement: (tag) => createMockEl(`mock-${tag}-${Math.random().toString(36).slice(2, 6)}`),
  querySelectorAll: () => [],
  addEventListener: () => {}
};

async function runSuite() {
  console.log('\n=============================================================');
  console.log('   OUR LITTLE UNIVERSE — FASE 6: UI COMPOSER TEST SUITE      ');
  console.log('=============================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, desc) {
    if (condition) {
      console.log(`  ✓ ${desc}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${desc}`);
      failed++;
    }
  }

  console.log('--- SECTION 1: Text Message Validation & Input Constraints ---');
  const validText = validateMessageInput('Halo sahabatku Lala!');
  assert(validText.valid === true, 'Valid text message accepted');
  assert(validText.text === 'Halo sahabatku Lala!', 'Whitespace trimmed correctly');

  const emptyText = validateMessageInput('   ');
  assert(emptyText.valid === false, 'Whitespace-only message rejected');
  assert(emptyText.error === 'Pesan tidak boleh hanya berisi spasi kosong.', 'Appropriate error message for whitespace');

  const emptyObj = validateMessageInput('');
  assert(emptyObj.valid === false, 'Empty string rejected');

  const longText = validateMessageInput('a'.repeat(2001));
  assert(longText.valid === false, 'Oversized text (>2000 chars) rejected');

  console.log('\n--- SECTION 2: UI Controller Initialization & Hidden File Inputs ---');
  let lastToast = null;
  const ctrl = initMessagesView({
    onShowToast: (msg) => { lastToast = msg; }
  });
  assert(ctrl && typeof ctrl.openMessages === 'function', 'initMessagesView returns valid controller');

  const fileInputImage = document.getElementById('file-input-image');
  const fileInputVideo = document.getElementById('file-input-video');
  const fileInputDoc = document.getElementById('file-input-doc');
  const fileInputAudio = document.getElementById('file-input-audio');

  assert(fileInputImage !== null, 'Hidden image file input exists');
  assert(fileInputVideo !== null, 'Hidden video file input exists');
  assert(fileInputDoc !== null, 'Hidden doc file input exists');
  assert(fileInputAudio !== null, 'Hidden audio file input exists');

  console.log('\n--- SECTION 3: Tombol (+) Menu Lampiran & Popover Toggling ---');
  const attachBtn = document.getElementById('btn-msg-attach');
  const attachMenu = document.getElementById('msg-attach-menu');
  attachMenu.classList.add('hidden');

  // Click (+) button to open
  attachBtn.click();
  assert(!attachMenu.classList.contains('hidden'), '(+) button toggles menu to visible');
  assert(attachBtn.classList.contains('active'), '(+) button gains active class when open');

  // Click (+) again to close
  attachBtn.click();
  assert(attachMenu.classList.contains('hidden'), 'Clicking (+) again closes attachment menu');
  assert(!attachBtn.classList.contains('active'), '(+) button removes active class when closed');

  console.log('\n--- SECTION 4: Menu Items Trigger Hidden File Inputs ---');
  let imageInputClicked = false;
  fileInputImage.click = () => { imageInputClicked = true; };
  const btnAttachImage = document.getElementById('btn-attach-image');
  btnAttachImage.click();
  assert(imageInputClicked === true, 'Foto & Gambar menu item triggers hidden image input');

  let docInputClicked = false;
  fileInputDoc.click = () => { docInputClicked = true; };
  const btnAttachDoc = document.getElementById('btn-attach-doc');
  btnAttachDoc.click();
  assert(docInputClicked === true, 'Dokumen menu item triggers hidden doc input');

  console.log('\n--- SECTION 5: Attachment Selection & Preview Bar ---');
  const previewBar = document.getElementById('msg-attachment-preview');
  const previewContent = document.getElementById('msg-preview-content');
  const removeBtn = document.getElementById('btn-msg-preview-remove');
  const inputEl = document.getElementById('msg-input-text');
  const sendBtn = document.getElementById('btn-msg-send');

  // Simulate file selection
  const mockFile = { name: 'foto_liburan.jpg', size: 1024 * 500, type: 'image/jpeg' };
  fileInputImage.trigger('change', { target: { files: [mockFile] } });

  assert(!previewBar.classList.contains('hidden'), 'Preview bar is shown after file selection');
  assert(previewContent.innerHTML.includes('foto_liburan.jpg'), 'Preview displays file name');
  assert(sendBtn.disabled === false, 'Send button is enabled when attachment is present');
  assert(inputEl.disabled === false, 'Text input remains enabled for optional caption');

  // Cancel attachment
  removeBtn.click();
  assert(previewBar.classList.contains('hidden'), 'Clicking ✕ removes attachment preview');
  assert(sendBtn.disabled === true, 'Send button disabled if text is empty after removing attachment');

  console.log('\n--- SECTION 6: Text Input & Enter/Shift+Enter Handlers ---');
  // Type text
  inputEl.value = 'Halo dunia!';
  inputEl.trigger('input');
  assert(sendBtn.disabled === false, 'Typing text enables send button');

  const charCounter = document.getElementById('msg-char-counter');
  assert(charCounter.textContent === '11 / 2000', 'Char counter updates correctly');

  // Test Shift+Enter: does NOT call send action
  let sendActionTriggered = false;
  inputEl.trigger('keydown', {
    key: 'Enter',
    shiftKey: true,
    preventDefault: () => { sendActionTriggered = true; }
  });
  assert(sendActionTriggered === false, 'Shift+Enter does not trigger send (allows multiline)');

  // Test Enter (without Shift): triggers send action (calls preventDefault)
  inputEl.trigger('keydown', {
    key: 'Enter',
    shiftKey: false,
    preventDefault: () => { sendActionTriggered = true; }
  });
  assert(sendActionTriggered === true, 'Enter key triggers send action');

  console.log('\n--- SECTION 7: Spark Storage Notice Handling ---');
  const noticeBanner = document.getElementById('msg-spark-notice');
  const noticeCloseBtn = document.getElementById('btn-spark-notice-close');

  noticeBanner.classList.remove('hidden');
  assert(!noticeBanner.classList.contains('hidden'), 'Spark notice banner displayed');

  noticeCloseBtn.click();
  assert(noticeBanner.classList.contains('hidden'), 'Clicking notice ✕ hides Spark notice');

  console.log('\n=============================================================');
  console.log(`FASE 6 UI COMPOSER TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('=============================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
