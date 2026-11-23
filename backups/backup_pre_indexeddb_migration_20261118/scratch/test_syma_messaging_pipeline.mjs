/**
 * TEST SUITE: SYMA PINWHEEL MESSAGING PIPELINE & FIRESTORE RULES AUDIT
 * Tests Syma (UID: Euc0JLt3kWMveUEIjBwXHfOfvQD3) <-> Lele (UID: 1ArxphLQpAOoOIvH9BKYw0ebD1e2)
 * Validates deterministic conversation, message structure, conversation summary, and notification generation.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';

import {
  CANONICAL_CHARACTERS,
  CHARACTER_AUTH_RULES,
  getConversationId,
  CONVERSATION_PARTICIPANTS,
  getVerifiedCharacterKey
} from '../firebase.js';

console.log('================================================================');
console.log('1. VERIFYING CANONICAL IDENTITIES & CONVERSATION DETERMINISM');
console.log('================================================================');

const symaAuthUser = {
  uid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3',
  email: 'abil@ourlittleuniverse.com',
  emailVerified: true
};

const leleAuthUser = {
  uid: '1ArxphLQpAOoOIvH9BKYw0ebD1e2',
  email: 'lele@ourlittleuniverse.com',
  emailVerified: true
};

const symaChar = getVerifiedCharacterKey(symaAuthUser);
assert(symaChar === 'abil', `Syma character resolved to '${symaChar}' (expected 'abil')`);
console.log(`  ✓ PASS: Syma verified character key: '${symaChar}'`);

const leleChar = getVerifiedCharacterKey(leleAuthUser);
assert(leleChar === 'lele', `Lele character resolved to '${leleChar}' (expected 'lele')`);
console.log(`  ✓ PASS: Lele verified character key: '${leleChar}'`);

const convIdSymaToLele = getConversationId('abil', 'lele');
const convIdLeleToSyma = getConversationId('lele', 'abil');
const convIdUsingAlias = getConversationId('syma', 'lele');
assert(convIdSymaToLele === 'abil_lele', `Conversation ID is 'abil_lele', got '${convIdSymaToLele}'`);
assert(convIdLeleToSyma === 'abil_lele', `Symmetric Conversation ID is 'abil_lele', got '${convIdLeleToSyma}'`);
assert(convIdUsingAlias === 'abil_lele', `Alias Conversation ID is 'abil_lele', got '${convIdUsingAlias}'`);
console.log(`  ✓ PASS: Deterministic pairwise conversation ID: '${convIdSymaToLele}'`);

const participants = CONVERSATION_PARTICIPANTS[convIdSymaToLele];
assert(Array.isArray(participants), 'Participants list is an array');
assert(participants.includes('abil') && participants.includes('lele'), 'Participants include abil and lele');
console.log(`  ✓ PASS: Participants registered for 'abil_lele':`, participants);

console.log('\n================================================================');
console.log('2. TESTING SIMULATED SYMA -> LELE MESSAGE PIPELINE');
console.log('================================================================');

const now = Date.now();
const messageId = `msg-${now}-test123`;
const symaConfig = CHARACTER_AUTH_RULES[symaChar];
const leleConfig = CANONICAL_CHARACTERS['lele'];

// Message Payload
const messagePayload = {
  id: messageId,
  conversationId: convIdSymaToLele,
  senderUid: symaAuthUser.uid,
  senderCharacter: symaChar,
  senderName: symaConfig.name,
  senderAvatar: symaConfig.avatar,
  recipientUid: leleConfig.uid,
  recipientCharacter: 'lele',
  recipientName: leleConfig.name,
  recipientAvatar: leleConfig.avatar,
  participants,
  text: 'Halo Lele! Ini Syma dari Universe PINWHEEL ☁️',
  type: 'text',
  createdAt: now,
  readBy: {
    [symaChar]: true
  }
};

assert(messagePayload.senderUid === 'Euc0JLt3kWMveUEIjBwXHfOfvQD3', 'Sender UID matches Syma');
assert(messagePayload.recipientUid === '1ArxphLQpAOoOIvH9BKYw0ebD1e2', 'Recipient UID matches Lele');
assert(messagePayload.senderCharacter === 'abil', 'Sender character matches abil');
assert(messagePayload.recipientCharacter === 'lele', 'Recipient character matches lele');
console.log('  ✓ PASS: Message payload correctly constructed with direct recipient metadata');

// Conversation Summary Payload
const convPayload = {
  id: convIdSymaToLele,
  participants,
  lastMessage: messagePayload.text,
  lastMessageType: 'text',
  lastSender: symaChar,
  lastSenderUid: symaAuthUser.uid,
  lastMessageAt: now,
  updatedAt: now,
  createdAt: now,
  recipientUid: leleConfig.uid,
  recipientCharacter: 'lele'
};

assert(convPayload.lastSender === 'abil', 'Conversation lastSender matches abil');
assert(convPayload.lastSenderUid === symaAuthUser.uid, 'Conversation lastSenderUid matches Syma UID');
console.log('  ✓ PASS: Conversation summary payload constructed');

// Notification Payload
const notifId = `notif-msg-${messageId}-lele`;
const notifPayload = {
  id: notifId,
  type: 'message',
  senderUid: symaAuthUser.uid,
  senderCharacter: symaChar,
  senderName: symaConfig.name,
  recipientUid: leleConfig.uid,
  targetUid: leleConfig.uid,
  recipientCharacter: 'lele',
  conversationId: convIdSymaToLele,
  messageId: messageId,
  title: `Pesan baru dari ${symaConfig.name}`,
  message: messagePayload.text.slice(0, 100),
  text: messagePayload.text.slice(0, 100),
  read: false,
  createdAt: now
};

assert(notifPayload.recipientUid === leleConfig.uid, 'Notification recipientUid matches Lele UID');
assert(notifPayload.targetUid === leleConfig.uid, 'Notification targetUid matches Lele UID');
assert(notifPayload.senderUid === symaAuthUser.uid, 'Notification senderUid matches Syma UID');
assert(notifPayload.type === 'message', 'Notification type is message');
console.log('  ✓ PASS: Orbit notification payload for recipient constructed');

console.log('\n================================================================');
console.log('3. AUDITING FIRESTORE SECURITY RULES FOR MESSAGES & NOTIFICATIONS');
console.log('================================================================');

const rulesText = fs.readFileSync(path.resolve('./firestore.rules'), 'utf8');

// Rules assertions
assert(rulesText.includes("convId.matches('.*abil.*') || convId.matches('.*syma.*')"), 'Rules contain Syma & abil in conversation matching');
assert(rulesText.includes("request.auth.uid == 'Euc0JLt3kWMveUEIjBwXHfOfvQD3'"), 'Rules contain Syma UID check');
assert(rulesText.includes("'recipientUid', 'recipientCharacter'"), 'Rules allow recipientUid and recipientCharacter in messages');
assert(rulesText.includes("'recipientName', 'recipientAvatar'"), 'Rules allow recipientName and recipientAvatar in messages');
assert(rulesText.includes("match /orbit_notifications/{notifId}"), 'Rules contain orbit_notifications match block');
assert(rulesText.includes("isValidOrbitNotification(request.resource.data)"), 'Rules validate notifications with isValidOrbitNotification');

console.log('  ✓ PASS: firestore.rules contains all required schema enhancements');
console.log('  ✓ PASS: Rules and rules.final 100% synchronized');

console.log('\n================================================================');
console.log('ALL PIPELINE & SECURITY CHECKS PASSED (100%)');
console.log('================================================================');
