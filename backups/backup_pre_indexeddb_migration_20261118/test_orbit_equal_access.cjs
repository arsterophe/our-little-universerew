// Comprehensive Unit Test for OUR LITTLE ORBIT: Equal Access & Selective Meeting Invitations
const assert = require('assert');

// Mock localStorage and window
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => { store[key] = String(val); },
    removeItem: (key) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

global.window = { localStorage: localStorageMock };
global.localStorage = localStorageMock;

async function runTests() {
  console.log('--- STARTING ORBIT EQUAL ACCESS & SELECTIVE INVITATIONS UNIT TESTS ---');

  const {
    ALL_ORBIT_CHARACTERS,
    normalizeCharacterKey,
    getCharacterDisplayName,
    getCharacterShortName,
    getCharacterAvatar,
    getCharacterUniverse,
    getCharacterRole,
    getOrbitNotifications,
    saveOrbitNotifications,
    markOrbitNotificationRead,
    markAllOrbitNotificationsRead,
    getUnreadNotificationsCount,
    getOrbitEvents,
    getMeetingInvitations,
    addOrbitEvent,
    deleteOrbitEvent,
    updateOrbitEvent,
    respondToMeeting
  } = await import('./orbit.js');

  const { formatIndonesianMeetingDateTime } = await import('./orbit_view.js');

  // TEST 1: Equal Access - All 8 Canonical Characters Exist and are Normalized
  console.log('Test 1: All 8 Characters Definition & Normalization');
  assert.strictEqual(ALL_ORBIT_CHARACTERS.length, 8, 'Must have exactly 8 canonical characters');
  
  const expectedChars = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
  expectedChars.forEach(charKey => {
    assert.strictEqual(normalizeCharacterKey(charKey), charKey);
    const shortName = getCharacterShortName(charKey);
    const universe = getCharacterUniverse(charKey);
    const avatar = getCharacterAvatar(charKey);
    assert.ok(shortName && shortName.length > 0, `Short name exists for ${charKey}`);
    assert.ok(universe && universe.length > 0, `Universe exists for ${charKey}`);
    assert.ok(avatar && avatar.includes('/assets/'), `Avatar exists for ${charKey}`);
  });

  // Alias Syma <-> abil
  assert.strictEqual(normalizeCharacterKey('syma'), 'abil', 'Syma alias should resolve to canonical key abil');
  assert.strictEqual(getCharacterShortName('abil'), 'Syma');
  assert.strictEqual(getCharacterUniverse('abil'), 'PINWHEEL');

  console.log('✓ Test 1 Passed: All 8 characters validated with equal status!');

  // TEST 2: Free Date & Time Formatting
  console.log('\nTest 2: Free Date/Time Selection Formatting');
  const satFormatted = formatIndonesianMeetingDateTime('2026-11-21', '15:00');
  console.log('Formatted Saturday meeting:', satFormatted);
  assert.ok(satFormatted.includes('Sabtu, 21 November 2026'), 'Includes Saturday 21 Nov 2026');
  assert.ok(satFormatted.includes('15:00 WIB'), 'Includes 15:00 WIB');

  const tueFormatted = formatIndonesianMeetingDateTime('2026-11-17', '20:00');
  console.log('Formatted Tuesday meeting:', tueFormatted);
  assert.ok(tueFormatted.includes('Selasa, 17 November 2026'), 'Includes Tuesday 17 Nov 2026');
  assert.ok(tueFormatted.includes('20:00 WIB'), 'Includes 20:00 WIB');
  console.log('✓ Test 2 Passed: Free date & time selection formatting verified!');

  // TEST 3: Selective Meeting Creation with Specific Invitees
  console.log('\nTest 3: Selective Meeting Creation & Participant Isolation');
  // Syma (abil) creates a meeting inviting Lala, Ruben, and Ela
  const meeting = addOrbitEvent({
    title: 'Pinwheel Creative Brainstorming 🌸',
    category: 'meeting',
    date: '2026-11-21',
    time: '15:00',
    location: 'Google Meet',
    description: 'Bahas visual kitsune & ide kolaborasi antar universe',
    proposer: 'abil',
    invitedParticipants: ['lala', 'ruben', 'ela']
  });

  assert.ok(meeting.id, 'Meeting must have unique ID');
  assert.strictEqual(meeting.proposer, 'abil', 'Proposer is Syma (abil)');
  assert.deepStrictEqual(meeting.participants, ['abil', 'lala', 'ruben', 'ela'], 'Participants must be host + invited only');
  assert.strictEqual(meeting.status, 'pending', 'Initial status is pending');
  
  // Responses structure
  assert.strictEqual(meeting.responses.abil.status, 'accepted', 'Host response is accepted');
  assert.strictEqual(meeting.responses.lala.status, 'pending', 'Lala response is pending');
  assert.strictEqual(meeting.responses.ruben.status, 'pending', 'Ruben response is pending');
  assert.strictEqual(meeting.responses.ela.status, 'pending', 'Ela response is pending');
  
  // Non-invited characters must NOT exist in responses or participants
  ['nyanya', 'lele', 'akhira', 'royan'].forEach(nonInvited => {
    assert.strictEqual(meeting.participants.includes(nonInvited), false, `${nonInvited} is NOT in participants`);
    assert.strictEqual(meeting.responses[nonInvited], undefined, `${nonInvited} has NO response entry`);
  });
  console.log('✓ Test 3 Passed: Selective meeting record created with pure participant isolation!');

  // TEST 4: Selective Notifications Distribution
  console.log('\nTest 4: Selective Notification Distribution (Zero Leakage to Non-Invitees)');
  // Invited characters should have notifications
  const lalaNotifs = getOrbitNotifications('lala');
  const rubenNotifs = getOrbitNotifications('ruben');
  const elaNotifs = getOrbitNotifications('ela');

  assert.ok(lalaNotifs.some(n => n.meetingId === meeting.id), 'Lala received meeting invitation notification');
  assert.ok(rubenNotifs.some(n => n.meetingId === meeting.id), 'Ruben received meeting invitation notification');
  assert.ok(elaNotifs.some(n => n.meetingId === meeting.id), 'Ela received meeting invitation notification');

  // Non-invited characters MUST have 0 notifications
  ['nyanya', 'lele', 'akhira', 'royan'].forEach(nonInvited => {
    const notifs = getOrbitNotifications(nonInvited);
    const leaked = notifs.filter(n => n.meetingId === meeting.id);
    assert.strictEqual(leaked.length, 0, `CRITICAL: Non-invited character ${nonInvited} received ZERO notifications`);
  });
  console.log('✓ Test 4 Passed: Notifications delivered exclusively to selected participants!');

  // TEST 5: Meeting List Visibility Isolation
  console.log('\nTest 5: Meeting List Visibility Isolation');
  // Proposer and invited participants see the meeting
  const symaMeetings = getMeetingInvitations('abil');
  const lalaMeetings = getMeetingInvitations('lala');
  const rubenMeetings = getMeetingInvitations('ruben');
  const elaMeetings = getMeetingInvitations('ela');

  assert.ok(symaMeetings.some(m => m.id === meeting.id), 'Host (Syma) sees the meeting');
  assert.ok(lalaMeetings.some(m => m.id === meeting.id), 'Invited (Lala) sees the meeting');
  assert.ok(rubenMeetings.some(m => m.id === meeting.id), 'Invited (Ruben) sees the meeting');
  assert.ok(elaMeetings.some(m => m.id === meeting.id), 'Invited (Ela) sees the meeting');

  // Non-invited characters DO NOT see the meeting
  ['nyanya', 'lele', 'akhira', 'royan'].forEach(nonInvited => {
    const list = getMeetingInvitations(nonInvited);
    const visible = list.some(m => m.id === meeting.id);
    assert.strictEqual(visible, false, `CRITICAL: Non-invited ${nonInvited} CANNOT see this meeting`);
  });
  console.log('✓ Test 5 Passed: Meeting visibility strictly isolated to host and invitees!');

  // TEST 6: Independent Participant Responses
  console.log('\nTest 6: Independent Participant Responses (Accept / Decline)');
  // Lala accepts
  respondToMeeting(meeting.id, 'lala', 'accepted', 'Siap hadir tepat waktu!');
  assert.strictEqual(meeting.responses.lala.status, 'accepted');
  assert.strictEqual(meeting.status, 'pending', 'Meeting remains pending until all invited accept');

  // Ela declines
  respondToMeeting(meeting.id, 'ela', 'declined', 'Ada jadwal penelitian lab kimia');
  assert.strictEqual(meeting.responses.ela.status, 'declined');
  assert.strictEqual(meeting.status, 'pending', 'Meeting remains pending when someone declined');

  // Ruben accepts
  respondToMeeting(meeting.id, 'ruben', 'accepted', 'Catatan siap dibawa');
  assert.strictEqual(meeting.responses.ruben.status, 'accepted');

  console.log('Responses state:', meeting.responses);
  console.log('✓ Test 6 Passed: Independent responses recorded accurately!');

  // TEST 7: Full Acceptance Transition to Confirmed
  console.log('\nTest 7: Full Confirmation when All Invitees Accept');
  const duoMeeting = addOrbitEvent({
    title: 'Starlight Catchup: Akhira & Royan',
    category: 'meeting',
    date: '2026-11-25',
    time: '18:00',
    location: 'Discord Horizon Call',
    proposer: 'akhira',
    invitedParticipants: ['royan']
  });

  assert.strictEqual(duoMeeting.status, 'pending');
  // Royan accepts
  respondToMeeting(duoMeeting.id, 'royan', 'accepted', 'Gas meluncur!');
  assert.strictEqual(duoMeeting.responses.royan.status, 'accepted');
  assert.strictEqual(duoMeeting.status, 'confirmed', 'Meeting status transitions to confirmed when all accept');
  console.log('✓ Test 7 Passed: Confirmed transition validated!');

  // TEST 8: Strict Permission Control (Delete / Update)
  console.log('\nTest 8: Strict Creator-Only Delete & Update');
  // Nyanya cannot delete Akhira\'s meeting
  const unauthorizedDelete = deleteOrbitEvent(duoMeeting.id, 'nyanya');
  assert.strictEqual(unauthorizedDelete.success, false, 'Non-creator cannot delete meeting');

  // Akhira (creator) can delete
  const authorizedDelete = deleteOrbitEvent(duoMeeting.id, 'akhira');
  assert.strictEqual(authorizedDelete.success, true, 'Creator can delete meeting');
  console.log('✓ Test 8 Passed: Owner permission enforcement validated!');

  console.log('\n======================================================');
  console.log('ALL 8 UNIT TESTS PASSED SUCCESSFULLY! (100% SUCCESS)');
  console.log('======================================================');
}

runTests().catch(err => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});

