/**
 * Automated Test Suite for Our Little Orbit Store & Logic
 */

import {
  INITIAL_ORBIT_EVENTS,
  getOrbitEvents,
  getCurrentDate,
  getSelectedDateStr,
  getActiveViewMode,
  getActiveCategoryFilter,
  getActiveUserCharacter,
  setActiveUserCharacter,
  setViewMode,
  setCategoryFilter,
  setSelectedDate,
  navigateCalendar,
  getFilteredEvents,
  getEventsForDate,
  getUpcomingAgendas,
  getMeetingInvitations,
  addOrbitEvent,
  respondToMeeting,
  getCharacterDisplayName,
  getCategoryBadge
} from './orbit.js';

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`✕ FAIL: ${message}`);
    failed++;
  }
}

console.log('--- TEST 1: Initial Store State ---');
const initialEvents = getOrbitEvents();
assert(initialEvents.length >= 6, `Initial events loaded: ${initialEvents.length} items`);
assert(getActiveViewMode() === 'month', 'Default view mode is month');
assert(getActiveCategoryFilter() === 'all', 'Default filter is all');
assert(getActiveUserCharacter() === 'nyanya', 'Default perspective is nyanya');

console.log('\n--- TEST 2: Category Filtering ---');
setCategoryFilter('meeting');
const meetingEvents = getFilteredEvents();
assert(meetingEvents.every(e => e.category === 'meeting'), 'All filtered events are meetings');
assert(meetingEvents.length > 0, `Found ${meetingEvents.length} meetings`);

setCategoryFilter('birthday');
const bdayEvents = getFilteredEvents();
assert(bdayEvents.every(e => e.category === 'birthday'), 'All filtered events are birthdays');
assert(bdayEvents.length >= 3, `Found ${bdayEvents.length} birthday events`);

// Reset to all
setCategoryFilter('all');
assert(getFilteredEvents().length === initialEvents.length, 'Filter reset returns all events');

console.log('\n--- TEST 3: Calendar Navigation ---');
const curDate = getCurrentDate();
const initMonth = curDate.getMonth();
navigateCalendar(1);
assert(getCurrentDate().getMonth() === (initMonth + 1) % 12, 'Next month navigation advances month');
navigateCalendar(-1);
assert(getCurrentDate().getMonth() === initMonth, 'Prev month navigation returns to original month');
navigateCalendar(0);
assert(getCurrentDate().getMonth() === 9, 'Today navigation resets to October (month index 9)');

console.log('\n--- TEST 4: Add New Shared Event ---');
const createdEvent = addOrbitEvent({
  title: 'Piknik Virtual Bawah Bintang 🌌',
  category: 'together',
  date: '2026-10-25',
  time: '18:30',
  location: 'Virtual Meadow Lounge',
  description: 'Bawa minuman hangat masing-masing dan dengarkan cerita lucu.',
  proposer: 'lala'
});
assert(createdEvent.id.startsWith('evt-'), 'New event has valid ID');
assert(getOrbitEvents().some(e => e.id === createdEvent.id), 'New event exists in store');
assert(getEventsForDate('2026-10-25').some(e => e.id === createdEvent.id), 'Event found by date query');

console.log('\n--- TEST 5: Meeting Proposal & Response Workflow ---');
// Propose new meeting
const newMeeting = addOrbitEvent({
  title: 'Orbit Sync: Rencana Liburan Akhir Tahun 🪐',
  category: 'meeting',
  date: '2026-10-29',
  time: '20:00',
  location: 'Google Meet',
  description: 'Menentukan jadwal cuti bareng!',
  proposer: 'nyanya'
});

assert(newMeeting.category === 'meeting', 'Created event is categorized as meeting');
assert(newMeeting.status === 'pending', 'New meeting starts in pending status');
assert(newMeeting.responses.nyanya.status === 'accepted', 'Proposer is automatically accepted');
assert(newMeeting.responses.lala.status === 'pending', 'Lala response is pending initially');

// Test 5A: Lala accepts
respondToMeeting(newMeeting.id, 'lala', 'accepted', 'Bisa banget!');
const updated1 = getOrbitEvents().find(e => e.id === newMeeting.id);
assert(updated1.responses.lala.status === 'accepted', 'Lala response updated to accepted');
assert(updated1.status === 'pending', 'Meeting remains pending while Lele has not accepted');

// Test 5B: Lele proposes alternate time
respondToMeeting(
  newMeeting.id,
  'lele',
  'proposed_alt',
  'Kamis ada tugas akhir, usul Jumat 30 Okt jam 20:30',
  '2026-10-30',
  '20:30'
);
const updated2 = getOrbitEvents().find(e => e.id === newMeeting.id);
assert(updated2.responses.lele.status === 'proposed_alt', 'Lele response updated to proposed_alt');
assert(updated2.responses.lele.altDate === '2026-10-30', 'Lele altDate recorded');
assert(updated2.responses.lele.altTime === '20:30', 'Lele altTime recorded');

// Test 5C: Lele later accepts
respondToMeeting(newMeeting.id, 'lele', 'accepted', 'Jadwal lab dimajukan, jadi bisa ikut!');
const updated3 = getOrbitEvents().find(e => e.id === newMeeting.id);
assert(updated3.responses.lele.status === 'accepted', 'Lele response updated to accepted');
assert(updated3.status === 'confirmed', 'All 3 friends accepted -> meeting status becomes confirmed!');

// Test 5D: Rejection with reason
const rejectMeeting = addOrbitEvent({
  title: 'Meeting Jam 7 Pagi 😴',
  category: 'meeting',
  date: '2026-10-30',
  time: '07:00',
  proposer: 'nyanya'
});
respondToMeeting(rejectMeeting.id, 'lele', 'rejected', 'Masih tidur nyenyak, jamnya terlalu pagi!');
const rejectedEvt = getOrbitEvents().find(e => e.id === rejectMeeting.id);
assert(rejectedEvt.responses.lele.status === 'rejected', 'Lele rejected status recorded');
assert(rejectedEvt.responses.lele.note.includes('terlalu pagi'), 'Rejection reason note saved');

console.log('\n--- TEST 6: Upcoming Agendas & Helpers ---');
const upcoming = getUpcomingAgendas(5);
assert(upcoming.length <= 5, 'Upcoming agendas respects limit');
assert(upcoming.every(e => e.date >= '2026-10-20'), 'All upcoming agendas are today or in future');

assert(getCharacterDisplayName('nyanya').includes('Moonlit'), 'Character display name works');
assert(getCategoryBadge('together').color === 'purple', 'Category badge color mapping works');

console.log(`\n========================================`);
console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
console.log(`========================================\n`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Our Little Orbit logic tests PASSED successfully! ✦');
}
