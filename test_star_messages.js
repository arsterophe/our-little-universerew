/**
 * TEST SUITE: STAR MESSAGES — Messages Across the Universe
 *
 * Verifies:
 * 1. Teleskop Hotspot Configuration across all 3 Universes (KIDULT, TO YOU, SHADOW)
 * 2. Star Message Categories & Types Specification
 * 3. Canonical Account Routing & Security Boundaries (Nyanya, Lala, Lele)
 * 4. Star Message Data Validation & Business Rules (Self-send prevention, bounds, limits)
 * 5. Firestore Security Rules Compliance for star_messages Collection
 * 6. Composite Indexes in firestore.indexes.json
 * 7. UI DOM Elements & CSS Theme Integration
 */

import fs from 'node:fs';
import {
  STAR_CATEGORIES,
  STAR_TYPES,
  CANONICAL_CHARACTERS,
  dbSendStarMessage
} from './firebase.js';
import {
  KIDULT_LOCATIONS,
  TOYOU_LOCATIONS,
  SHADOW_LOCATIONS
} from './universes_view.js';

let passed = 0;
let total = 0;

function assert(condition, message, detail = '') {
  total++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✕ FAIL: ${message} ${detail ? '-> ' + detail : ''}`);
    process.exitCode = 1;
  }
}

console.log('================================================================');
console.log('1. TELESKOP INTEGRATION IN ALL 3 UNIVERSES');
console.log('================================================================');

assert(
  Boolean(KIDULT_LOCATIONS.teleskop),
  'KIDULT has Teleskop location configured'
);
assert(
  KIDULT_LOCATIONS.teleskop.actionType === 'star_messages',
  'KIDULT Teleskop actionType is star_messages'
);

assert(
  Boolean(TOYOU_LOCATIONS.teleskop),
  'TO YOU has Teleskop location configured'
);
assert(
  TOYOU_LOCATIONS.teleskop.actionType === 'star_messages',
  'TO YOU Teleskop actionType is star_messages'
);

assert(
  Boolean(SHADOW_LOCATIONS.teleskop),
  'SHADOW has Teleskop location configured'
);
assert(
  SHADOW_LOCATIONS.teleskop.actionType === 'star_messages',
  'SHADOW Teleskop actionType is star_messages'
);

console.log('\n================================================================');
console.log('2. STAR CATEGORIES & STAR TYPES SPECIFICATION');
console.log('================================================================');

const catKeys = Object.keys(STAR_CATEGORIES);
const catLabels = Object.values(STAR_CATEGORIES).map((c) => c.label);
assert(
  catKeys.includes('warmth') && catKeys.includes('wish') && catKeys.includes('greeting') && catKeys.includes('secret'),
  'STAR_CATEGORIES defines keys: warmth, wish, greeting, secret'
);
assert(
  catLabels.some((l) => l.includes('Kehangatan')) &&
  catLabels.some((l) => l.includes('Harapan')) &&
  catLabels.some((l) => l.includes('Salam')) &&
  catLabels.some((l) => l.includes('Rahasia')),
  'STAR_CATEGORIES labels cover: Kehangatan, Harapan, Salam, Rahasia'
);

const typeKeys = Object.keys(STAR_TYPES);
assert(
  typeKeys.includes('gold') && typeKeys.includes('lavender') && typeKeys.includes('crystal') && typeKeys.includes('rose') && typeKeys.includes('cyan'),
  'STAR_TYPES defines celestial types: gold, lavender, crystal, rose, cyan'
);

console.log('\n================================================================');
console.log('3. CANONICAL CHARACTER & UID MAPPING');
console.log('================================================================');

assert(
  CANONICAL_CHARACTERS.nyanya.uid === '1uwba7MrGVU3xHu57VVLvztskrg2' &&
  CANONICAL_CHARACTERS.nyanya.universe === 'KIDULT',
  'Nyanya maps to UID 1uwba7MrGVU3xHu57VVLvztskrg2 and universe KIDULT'
);

assert(
  CANONICAL_CHARACTERS.lala.uid === 'EqByKA8FXoTEt0OmIsSDPfnxMDB3' &&
  CANONICAL_CHARACTERS.lala.universe === 'TO YOU',
  'Lala maps to UID EqByKA8FXoTEt0OmIsSDPfnxMDB3 and universe TO YOU'
);

assert(
  CANONICAL_CHARACTERS.lele.uid === '1ArxphLQpAOoOIvH9BKYw0ebD1e2' &&
  CANONICAL_CHARACTERS.lele.universe === 'SHADOW',
  'Lele maps to UID 1ArxphLQpAOoOIvH9BKYw0ebD1e2 and universe SHADOW'
);

console.log('\n================================================================');
console.log('4. STAR MESSAGE VALIDATION & BUSINESS RULES');
console.log('================================================================');

const mockNyanyaUser = {
  uid: CANONICAL_CHARACTERS.nyanya.uid,
  email: CANONICAL_CHARACTERS.nyanya.email
};

// Test 4.1: Reject unauthenticated sender
async function testSenderValidation() {
  try {
    await dbSendStarMessage({
      recipientCharacter: 'lala',
      text: 'Halo Lala!',
      category: 'greeting',
      starType: 'gold',
      universeOrigin: 'kidult'
    }, null);
    assert(false, 'Should reject unauthenticated sender');
  } catch (err) {
    assert(true, 'dbSendStarMessage rejects unauthenticated sender', err.message);
  }

  // Test 4.2: Reject unknown recipient
  try {
    await dbSendStarMessage({
      recipientCharacter: 'unknown_alien',
      text: 'Halo alien!',
      category: 'greeting',
      starType: 'gold',
      universeOrigin: 'kidult'
    }, mockNyanyaUser);
    assert(false, 'Should reject unknown recipient');
  } catch (err) {
    assert(true, 'dbSendStarMessage rejects unknown recipient', err.message);
  }

  // Test 4.3: Prevent sending message to oneself
  try {
    await dbSendStarMessage({
      recipientCharacter: 'nyanya',
      text: 'Pesan untuk diriku sendiri',
      category: 'warmth',
      starType: 'lavender',
      universeOrigin: 'kidult'
    }, mockNyanyaUser);
    assert(false, 'Should prevent sending star message to oneself');
  } catch (err) {
    assert(true, 'dbSendStarMessage strictly blocks sending to oneself', err.message);
  }

  // Test 4.4: Reject empty text
  try {
    await dbSendStarMessage({
      recipientCharacter: 'lala',
      text: '   ',
      category: 'wish',
      starType: 'crystal',
      universeOrigin: 'kidult'
    }, mockNyanyaUser);
    assert(false, 'Should reject empty message');
  } catch (err) {
    assert(true, 'dbSendStarMessage rejects empty message content', err.message);
  }

  // Test 4.5: Reject text exceeding 400 characters
  try {
    const overlyLongText = 'A'.repeat(401);
    await dbSendStarMessage({
      recipientCharacter: 'lala',
      text: overlyLongText,
      category: 'wish',
      starType: 'crystal',
      universeOrigin: 'kidult'
    }, mockNyanyaUser);
    assert(false, 'Should reject message exceeding 400 characters');
  } catch (err) {
    assert(true, 'dbSendStarMessage rejects text exceeding 400 characters limit', err.message);
  }
}

await testSenderValidation();

console.log('\n================================================================');
console.log('5. FIRESTORE SECURITY RULES FOR STAR MESSAGES');
console.log('================================================================');

const rulesContent = fs.readFileSync('./firestore.rules', 'utf8');

assert(
  rulesContent.includes('match /star_messages/{messageId}'),
  'firestore.rules contains match rule for /star_messages/{messageId}'
);

assert(
  rulesContent.includes('function isValidStarMessage(data)'),
  'firestore.rules has isValidStarMessage validator function'
);

assert(
  rulesContent.includes('resource.data.senderUid == request.auth.uid') &&
  rulesContent.includes('resource.data.recipientUid == request.auth.uid'),
  'Star messages read rule enforces strict sender/recipient authorization'
);

assert(
  rulesContent.includes('request.resource.data.senderUid == request.auth.uid'),
  'Star messages create rule verifies senderUid matches request.auth.uid'
);

assert(
  rulesContent.includes('data.recipientUid in [') &&
  rulesContent.includes('1uwba7MrGVU3xHu57VVLvztskrg2'),
  'isValidStarMessage restricts recipientUid strictly to canonical member UIDs'
);

assert(
  rulesContent.includes('request.resource.data.text == resource.data.text') &&
  rulesContent.includes('request.resource.data.senderUid == resource.data.senderUid'),
  'Star messages update rule preserves message text and sender immutability'
);

console.log('\n================================================================');
console.log('6. FIRESTORE COMPOSITE INDEXES SPECIFICATION');
console.log('================================================================');

const indexesJson = JSON.parse(fs.readFileSync('./firestore.indexes.json', 'utf8'));
const starMessageIndexes = indexesJson.indexes.filter(
  (idx) => idx.collectionGroup === 'star_messages'
);

assert(
  starMessageIndexes.length >= 2,
  `firestore.indexes.json defines at least 2 composite indexes for star_messages (found ${starMessageIndexes.length})`
);

const hasRecipientIndex = starMessageIndexes.some((idx) => {
  const fields = idx.fields.map((f) => `${f.fieldPath}:${f.order}`).join(',');
  return fields === 'recipientUid:ASCENDING,createdAt:DESCENDING';
});
assert(
  hasRecipientIndex,
  'Composite index for recipientUid ASC + createdAt DESC is present'
);

const hasSenderIndex = starMessageIndexes.some((idx) => {
  const fields = idx.fields.map((f) => `${f.fieldPath}:${f.order}`).join(',');
  return fields === 'senderUid:ASCENDING,createdAt:DESCENDING';
});
assert(
  hasSenderIndex,
  'Composite index for senderUid ASC + createdAt DESC is present'
);

console.log('\n================================================================');
console.log('7. UI DOM & CSS STRUCTURE VERIFICATION');
console.log('================================================================');

const indexHtml = fs.readFileSync('./index.html', 'utf8');
assert(
  indexHtml.includes('id="view-star-messages"'),
  'index.html contains view-star-messages element'
);
assert(
  indexHtml.includes('id="star-sky-canvas"'),
  'index.html contains star-sky-canvas for dynamic celestial rendering'
);
assert(
  indexHtml.includes('id="tab-btn-explore"'),
  'index.html contains explore tab button (id="tab-btn-explore")'
);
assert(
  indexHtml.includes('id="tab-btn-inbox"'),
  'index.html contains inbox tab button (id="tab-btn-inbox")'
);
assert(
  indexHtml.includes('id="tab-btn-compose"'),
  'index.html contains compose tab button (id="tab-btn-compose")'
);
assert(
  indexHtml.includes('id="tab-btn-favorites"'),
  'index.html contains favorites tab button (id="tab-btn-favorites")'
);
assert(
  indexHtml.includes('id="btn-star-return-univ"'),
  'index.html contains return button (id="btn-star-return-univ")'
);
assert(
  indexHtml.includes('id="star-letter-modal"'),
  'index.html contains star letter reading modal'
);

const cssContent = fs.readFileSync('./star_messages.css', 'utf8');
assert(
  cssContent.includes('.theme-kidult'),
  'star_messages.css has Kidult twilight theme styling'
);
assert(
  cssContent.includes('.theme-toyou'),
  'star_messages.css has To You dawn garden theme styling'
);
assert(
  cssContent.includes('.theme-shadow'),
  'star_messages.css has Shadow midnight sanctuary theme styling'
);

console.log('\n================================================================');
console.log(`SUMMARY: ${passed}/${total} PASSED (${Math.round((passed / total) * 100)}%)`);
console.log('================================================================\n');

if (passed !== total) {
  process.exit(1);
} else {
  process.exit(0);
}
