import { addOrbitEvent, getOrbitEvents, ALL_ORBIT_CHARACTERS } from '../orbit.js';

console.log('Testing addOrbitEvent with meeting category...');

try {
  const result = addOrbitEvent({
    title: 'Test Meeting 1',
    category: 'meeting',
    date: '2026-11-20',
    time: '20:00',
    location: 'Google Meet',
    description: 'Diskusi bersama',
    proposer: 'nyanya',
    invitedParticipants: ['lala', 'lele']
  });

  console.log('Result of addOrbitEvent:', {
    id: result.id,
    title: result.title,
    category: result.category,
    participants: result.participants,
    invitedParticipants: result.invitedParticipants,
    responses: result.responses
  });

  if (typeof result.then === 'function') {
    console.log('Testing result.then...');
    const resolved = await result;
    console.log('Resolved promise:', resolved.id);
  }
} catch (err) {
  console.error('Error during test:', err);
}
