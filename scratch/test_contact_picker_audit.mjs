/**
 * ESM Contact Picker Audit Test for Our Little Messages (Syma PINWHEEL)
 */
import {
  setActiveUserCharacter,
  getActiveUserCharacter,
  getAvailableFriendsToChat,
  startNewConversation,
  getActiveConversationId,
  CHARACTERS_MESSAGES
} from '../messages.js';

import {
  openNewChatModal,
  closeNewChatModal,
  selectConversation
} from '../messages_view.js';

// Setup minimal DOM Mock for messages_view
class MockElement {
  constructor(id = '', tagName = 'div') {
    this.id = id;
    this.tagName = tagName;
    this.style = {};
    this._classes = new Set();
    this.classList = {
      add: (cls) => this._classes.add(cls),
      remove: (cls) => this._classes.delete(cls),
      contains: (cls) => this._classes.has(cls),
      toggle: (cls, force) => {
        if (force !== undefined) {
          if (force) this._classes.add(cls);
          else this._classes.delete(cls);
        } else {
          if (this._classes.has(cls)) this._classes.delete(cls);
          else this._classes.add(cls);
        }
      }
    };
    this.children = [];
    this.attributes = {};
    this.innerHTML = '';
    this.textContent = '';
    this.disabled = false;
    this.eventListeners = {};
  }

  setAttribute(k, v) {
    this.attributes[k] = v;
  }

  getAttribute(k) {
    return this.attributes[k];
  }

  removeAttribute(k) {
    delete this.attributes[k];
  }

  appendChild(el) {
    this.children.push(el);
  }

  addEventListener(event, handler) {
    if (!this.eventListeners[event]) this.eventListeners[event] = [];
    this.eventListeners[event].push(handler);
  }

  dispatchEvent(event) {
    const list = this.eventListeners[event.type] || [];
    for (const h of list) {
      h(event);
    }
  }

  querySelector(sel) {
    if (sel.startsWith('#')) {
      const id = sel.slice(1);
      if (this.id === id) return this;
      for (const c of this.children) {
        const found = c.querySelector(sel);
        if (found) return found;
      }
    }
    return null;
  }

  querySelectorAll() {
    return [];
  }

  focus() {
    this.isFocused = true;
  }
}

const elements = new Map();
function getOrCreate(id, tag = 'div') {
  if (!elements.has(id)) {
    elements.set(id, new MockElement(id, tag));
  }
  return elements.get(id);
}

// Register required DOM elements
getOrCreate('modal-msg-new-chat');
getOrCreate('msg-friends-picker-grid');
getOrCreate('btn-close-new-chat', 'button');
getOrCreate('btn-msg-new-chat', 'button');
getOrCreate('msg-active-user-avatar', 'img');
getOrCreate('msg-active-user-name');
getOrCreate('msg-active-user-sub');
getOrCreate('msg-partner-avatar', 'img');
getOrCreate('msg-partner-name');
getOrCreate('msg-partner-sub');
getOrCreate('msg-input-text', 'textarea');
getOrCreate('btn-msg-send', 'button');
getOrCreate('btn-msg-attach', 'button');
getOrCreate('btn-msg-mic', 'button');
getOrCreate('msg-feed-area');
getOrCreate('msg-conversation-list');
getOrCreate('view-messages');

globalThis.document = {
  getElementById: (id) => elements.get(id) || null,
  createElement: (tag) => new MockElement('', tag),
  querySelectorAll: () => [],
  addEventListener: () => {}
};

globalThis.window = {
  scrollTo: () => {},
  addEventListener: () => {}
};

globalThis.localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {}
};

async function testContactPicker() {
  console.log('🧪 Starting Contact Picker Verification for Syma PINWHEEL...');

  // 1. Identify active user as Syma (abil)
  setActiveUserCharacter('abil');
  const currentUser = getActiveUserCharacter();
  console.log(`✓ Active character: ${currentUser} (${CHARACTERS_MESSAGES[currentUser].name})`);
  if (currentUser !== 'abil') throw new Error('Active user must be abil');

  // 2. Query available friends to chat
  const friends = getAvailableFriendsToChat('abil');
  console.log(`✓ Friends count: ${friends.length}`);
  if (friends.length !== 7) {
    throw new Error(`Expected exactly 7 contacts, got ${friends.length}`);
  }

  // 3. Verify exact 7 contacts, avatars, symbols, and universes
  const expectedList = [
    { key: 'nyanya', name: 'Nyanya', symbol: '⭐', universe: 'KIDULT' },
    { key: 'lala', name: 'Lala', symbol: '☀️', universe: 'TO YOU' },
    { key: 'lele', name: 'Lele', symbol: '🌙', universe: 'SHADOW' },
    { key: 'akhira', name: 'Akhira', symbol: '⚡', universe: 'YAWN' },
    { key: 'ela', name: 'Ela', symbol: '🌸', universe: 'US AGAIN' },
    { key: 'ruben', name: 'Ruben', symbol: '🐉', universe: 'ASH' },
    { key: 'royan', name: 'Royan', symbol: '🎆', universe: 'HOT' }
  ];

  for (const exp of expectedList) {
    const found = friends.find(f => f.key === exp.key);
    if (!found) throw new Error(`Missing expected character: ${exp.name}`);
    if (found.name !== exp.name) throw new Error(`Name mismatch: expected ${exp.name}, got ${found.name}`);
    if (found.symbol !== exp.symbol) throw new Error(`Symbol mismatch for ${exp.name}: expected ${exp.symbol}, got ${found.symbol}`);
    if (found.universe !== exp.universe) throw new Error(`Universe mismatch for ${exp.name}: expected ${exp.universe}, got ${found.universe}`);
    if (!found.avatar) throw new Error(`Avatar missing for ${exp.name}`);
    console.log(`  ✓ ${found.name} ${found.symbol} — Universe ${found.universe}`);
  }

  // Syma must not be in contacts
  const symaFound = friends.find(f => f.key === 'abil' || f.key === 'syma');
  if (symaFound) throw new Error('Syma should never be in her own contact list');
  console.log('✓ Syma correctly excluded from self-contact list');

  // 4. Test openNewChatModal
  const modal = elements.get('modal-msg-new-chat');
  const grid = elements.get('msg-friends-picker-grid');

  openNewChatModal();

  if (modal.style.display !== 'flex') {
    throw new Error(`Modal display style is '${modal.style.display}', expected 'flex'`);
  }
  if (!modal._classes.has('open')) {
    throw new Error('Modal does NOT have .open class, so it would remain invisible due to CSS opacity: 0!');
  }
  if (grid.children.length !== 7) {
    throw new Error(`Expected 7 cards in modal grid, got ${grid.children.length}`);
  }
  console.log('✓ openNewChatModal successfully opened with 7 friend cards and .open class');

  // 5. Test selecting a contact (e.g. Akhira ⚡)
  const akhiraCard = grid.children.find(c => c.getAttribute('data-key') === 'akhira');
  if (!akhiraCard) throw new Error('Akhira card not found in grid children');

  akhiraCard.dispatchEvent({ type: 'click' });

  // Modal must close
  if (modal._classes.has('open') || modal.style.display !== 'none') {
    throw new Error('Modal did not close after card selection');
  }
  console.log('✓ Modal closed automatically after contact selection');

  // Active conversation must be 'abil_akhira'
  const activeConv = getActiveConversationId();
  if (activeConv !== 'abil_akhira') {
    throw new Error(`Expected active conversation 'abil_akhira', got '${activeConv}'`);
  }
  console.log(`✓ Active conversation successfully initiated: '${activeConv}'`);

  // Header partner info must reflect Akhira
  const partnerName = elements.get('msg-partner-name').textContent;
  const partnerSub = elements.get('msg-partner-sub').textContent;
  console.log(`✓ Header partner name: "${partnerName}", subtitle: "${partnerSub}"`);
  if (!partnerName.includes('Akhira') || !partnerName.includes('⚡')) {
    throw new Error(`Header partner name does not match: '${partnerName}'`);
  }
  if (!partnerSub.includes('YAWN')) {
    throw new Error(`Header partner subtitle does not match: '${partnerSub}'`);
  }

  // Text input must be enabled and focused
  const input = elements.get('msg-input-text');
  if (input.disabled) throw new Error('Message input is still disabled');
  if (!input.isFocused) throw new Error('Message input was not focused');
  console.log('✓ Message input enabled and focused for immediate typing');

  // 6. Test duplicate prevention: Selecting Akhira again opens same conversation ID
  const secondConv = startNewConversation('akhira');
  if (secondConv !== 'abil_akhira') {
    throw new Error(`Conversation duplication detected! Expected 'abil_akhira', got '${secondConv}'`);
  }
  console.log('✓ Duplicate prevention verified: reused existing conversation ID deterministically');

  console.log('\n🎉 ALL AUDIT CHECKS PASSED WITH 100% SUCCESS!');
}

testContactPicker().catch(err => {
  console.error('\n❌ Audit Test Failed:', err);
  process.exit(1);
});
