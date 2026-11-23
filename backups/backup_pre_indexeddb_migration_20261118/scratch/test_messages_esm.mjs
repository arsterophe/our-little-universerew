import assert from 'assert';
import {
  CHARACTERS_MESSAGES,
  getActiveUserCharacter,
  setActiveUserCharacter,
  getActiveConversationId,
  setActiveConversationId,
  getAvailableConversations,
  getAvailableFriendsToChat,
  startNewConversation,
  getConversationId,
  CONVERSATION_PARTICIPANTS
} from '../messages.js';

console.log('Testing messages.js directly in ESM:');

// 1. All 8 characters present
assert(CHARACTERS_MESSAGES.abil, 'abil must exist');
assert.strictEqual(CHARACTERS_MESSAGES.abil.name, 'Syma');
assert.strictEqual(CHARACTERS_MESSAGES.abil.universe, 'PINWHEEL');
assert(CHARACTERS_MESSAGES.syma, 'syma alias must exist');
assert.strictEqual(CHARACTERS_MESSAGES.syma.name, 'Syma');
console.log('✓ Syma identity verified in CHARACTERS_MESSAGES');

// 2. Active User Character does not default to Nyanya
setActiveUserCharacter(null);
assert.strictEqual(getActiveUserCharacter(), null, 'Should return null when unauthenticated and unset');
console.log('✓ getActiveUserCharacter does not fallback to Nyanya');

// 3. Set active user to Syma (abil)
setActiveUserCharacter('abil');
assert.strictEqual(getActiveUserCharacter(), 'abil');
console.log('✓ setActiveUserCharacter abil sets correctly');

// 4. Initial inbox for Syma with no messages is completely empty
const initialConvs = getAvailableConversations('abil');
assert.strictEqual(initialConvs.length, 0, 'Inbox should be empty for new character');
assert.strictEqual(getActiveConversationId(), null, 'activeConversationId should be null');
console.log('✓ Empty inbox for new user verified (WhatsApp model)');

// 5. Available friends to chat with Syma
const friends = getAvailableFriendsToChat('abil');
assert.strictEqual(friends.length, 7, 'Must have 7 other friends available to chat');
const friendKeys = friends.map(f => f.key);
assert(!friendKeys.includes('abil'), 'Should not include self');
assert(!friendKeys.includes('syma'), 'Should not include alias of self');
assert(friendKeys.includes('nyanya'), 'Includes Nyanya');
assert(friendKeys.includes('lala'), 'Includes Lala');
assert(friendKeys.includes('lele'), 'Includes Lele');
assert(friendKeys.includes('akhira'), 'Includes Akhira');
assert(friendKeys.includes('ela'), 'Includes Ela');
assert(friendKeys.includes('ruben'), 'Includes Ruben');
assert(friendKeys.includes('royan'), 'Includes Royan');
console.log('✓ getAvailableFriendsToChat returns exactly 7 other friends');

// 6. Start new conversation with Lala
const newConvId = startNewConversation('lala');
assert.strictEqual(newConvId, 'abil_lala');
assert.strictEqual(getActiveConversationId(), 'abil_lala');

const convsAfterInitiate = getAvailableConversations('abil');
assert.strictEqual(convsAfterInitiate.length, 1, 'Initiated conversation appears in list');
assert.strictEqual(convsAfterInitiate[0].id, 'abil_lala');
assert.strictEqual(convsAfterInitiate[0].partnerKey, 'lala');
assert.strictEqual(convsAfterInitiate[0].title, 'Lala ☼');
console.log('✓ startNewConversation with Lala verified');

// 7. Deterministic Conversation IDs
assert.strictEqual(getConversationId('abil', 'lala'), 'abil_lala');
assert.strictEqual(getConversationId('lala', 'abil'), 'abil_lala');
assert.strictEqual(getConversationId('syma', 'lala'), 'abil_lala');
assert.strictEqual(getConversationId('lala', 'syma'), 'abil_lala');
console.log('✓ getConversationId handles syma alias deterministically');

console.log('✨ ALL ESM MESSAGES TESTS PASSED! ✨');
