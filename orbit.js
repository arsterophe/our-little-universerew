/**
 * OUR LITTLE ORBIT — SHARED CALENDAR & CELESTIAL PLANNER
 * 
 * Shared schedule, event calendar, and remote meeting coordinator
 * for the three besties: Nyanya, Lala, and Lele.
 * 
 * Note: Data in this phase is maintained in a local reactive store,
 * strictly architected for seamless future Firebase Firestore integration.
 */

// 1. Initial Mock Data for Our Little Orbit (October - November 2026)
export const INITIAL_ORBIT_EVENTS = [
  {
    id: 'evt-1',
    title: 'Nonton Bareng: Going Seventeen Marathon 🍿',
    category: 'together',
    date: '2026-10-14',
    time: '19:30',
    location: 'Our Room Virtual Lounge',
    proposer: 'lele',
    proposerName: 'Lele (The Eclipse Guardian)',
    description: 'Nonton episode terbaru bareng sambil makan camilan favorit masing-masing!',
    participants: ['nyanya', 'lala', 'lele'],
    status: 'confirmed',
    responses: {
      nyanya: { status: 'accepted', note: 'Sudah siapkan popcorn!' },
      lala: { status: 'accepted', note: 'Gas pol!' },
      lele: { status: 'accepted', note: 'Host room siap.' }
    }
  },
  {
    id: 'evt-2',
    title: 'Meeting Catch-Up & Perencanaan Akhir Tahun ✨',
    category: 'meeting',
    date: '2026-10-22',
    time: '20:00',
    location: 'Google Meet / Orbit Call',
    proposer: 'nyanya',
    proposerName: 'Nyanya (The Moonlit Shadow Witch)',
    description: 'Bahas ide kado akhir tahun, jadwal libur kuliah/kerja, dan update cerita satu bulan ini.',
    participants: ['nyanya', 'lala', 'lele'],
    status: 'pending',
    responses: {
      nyanya: { status: 'accepted', note: 'Pengaju meeting' },
      lala: { status: 'pending', note: 'Menunggu konfirmasi' },
      lele: { 
        status: 'proposed_alt', 
        altDate: '2026-10-23', 
        altTime: '20:30', 
        note: 'Tanggal 22 ada lembur lab. Kalau Jumat 23 malam jam 20:30 gimana?' 
      }
    }
  },
  {
    id: 'evt-3',
    title: 'Ulang Tahun Nyanya (Alenda) 🎂⭐',
    category: 'birthday',
    date: '2026-10-28',
    time: '00:00',
    location: 'Universe KIDULT',
    proposer: 'lala',
    proposerName: 'Lala (The Everglow Fairy)',
    description: 'Hari spesial untuk The Moonlit Shadow Witch kita! Kirim surat Little Post Office & hadiah virtual.',
    participants: ['nyanya', 'lala', 'lele'],
    status: 'confirmed',
    responses: {
      nyanya: { status: 'accepted', note: 'Terima kasih banyak sahabatku 💜' },
      lala: { status: 'accepted', note: 'Sudah siapin surprise!' },
      lele: { status: 'accepted', note: 'Surat sudah dijadwalkan!' }
    }
  },
  {
    id: 'evt-4',
    title: 'Deadline Pengumpulan Tugas Desain Alenda',
    category: 'personal',
    date: '2026-10-18',
    time: '23:59',
    location: 'Personal Task',
    proposer: 'nyanya',
    proposerName: 'Nyanya (Alenda)',
    description: 'Submit mockup portofolio bab 3 ke dosen pembimbing.',
    participants: ['nyanya'],
    status: 'confirmed',
    responses: {
      nyanya: { status: 'accepted' }
    }
  },
  {
    id: 'evt-5',
    title: 'Study & Chill Co-Working Session ☕',
    category: 'together',
    date: '2026-11-06',
    time: '14:00',
    location: 'Discord Voice & Video Study',
    proposer: 'lala',
    proposerName: 'Lala (The Everglow Fairy)',
    description: 'Kerja bareng dengan kamera on, musik lofi lembut, sambil saling semangatin.',
    participants: ['nyanya', 'lala', 'lele'],
    status: 'confirmed',
    responses: {
      nyanya: { status: 'accepted' },
      lala: { status: 'accepted' },
      lele: { status: 'accepted' }
    }
  },
  {
    id: 'evt-6',
    title: 'Ulang Tahun Lala (Bella) 🌸👑',
    category: 'birthday',
    date: '2026-11-17',
    time: '00:00',
    location: 'Universe TO YOU',
    proposer: 'lele',
    proposerName: 'Lele (The Eclipse Guardian)',
    description: 'Hari ulang tahun The Everglow Fairy! Pesta kebun virtual & ucapan doa bersama.',
    participants: ['nyanya', 'lala', 'lele'],
    status: 'confirmed',
    responses: {
      nyanya: { status: 'accepted' },
      lala: { status: 'accepted' },
      lele: { status: 'accepted' }
    }
  },
  {
    id: 'evt-7',
    title: 'Ulang Tahun Lele (Vanya) 🌙🖤',
    category: 'birthday',
    date: '2026-11-27',
    time: '00:00',
    location: 'Universe SHADOW',
    proposer: 'nyanya',
    proposerName: 'Nyanya (The Moonlit Shadow Witch)',
    description: 'Hari kelahiran The Eclipse Guardian! Malam konstelasi bintang dan kenangan.',
    participants: ['nyanya', 'lala', 'lele'],
    status: 'confirmed',
    responses: {
      nyanya: { status: 'accepted' },
      lala: { status: 'accepted' },
      lele: { status: 'accepted' }
    }
  },
  {
    id: 'evt-8',
    title: 'Pengingat: Buka Surat Rahasia Little Post Office 💌',
    category: 'reminder',
    date: '2026-10-31',
    time: '21:00',
    location: 'Little Post Office',
    proposer: 'nyanya',
    proposerName: 'Nyanya',
    description: 'Surat berwaktu khusus akhir bulan Oktober yang dikirim awal bulan lalu!',
    participants: ['nyanya', 'lala', 'lele'],
    status: 'confirmed',
    responses: {
      nyanya: { status: 'accepted' },
      lala: { status: 'accepted' },
      lele: { status: 'accepted' }
    }
  }
];

// Reactive Store
let orbitEvents = [...INITIAL_ORBIT_EVENTS];
let currentDate = new Date(2026, 9, 20); // Default to October 2026 (matching system date)
let selectedDateStr = '2026-10-20';
let activeViewMode = 'month'; // 'month' or 'week'
let activeCategoryFilter = 'all'; // 'all', 'together', 'meeting', 'birthday', 'reminder'
let activeUserCharacter = 'nyanya'; // default viewing perspective (matches logged in user)

// Subscribers for UI re-renders
const listeners = [];
function notifyListeners() {
  listeners.forEach(fn => fn());
}
export function subscribeOrbit(fn) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx > -1) listeners.splice(idx, 1);
  };
}

// Getters
export function getOrbitEvents() {
  return orbitEvents;
}

export function getCurrentDate() {
  return currentDate;
}

export function getSelectedDateStr() {
  return selectedDateStr;
}

export function getActiveViewMode() {
  return activeViewMode;
}

export function getActiveCategoryFilter() {
  return activeCategoryFilter;
}

export function getActiveUserCharacter() {
  return activeUserCharacter;
}

export function setActiveUserCharacter(charKey) {
  activeUserCharacter = charKey;
  notifyListeners();
}

// Navigation & View State Updaters
export function setViewMode(mode) {
  activeViewMode = mode;
  notifyListeners();
}

export function setCategoryFilter(category) {
  activeCategoryFilter = category;
  notifyListeners();
}

export function setSelectedDate(dateStr) {
  selectedDateStr = dateStr;
  notifyListeners();
}

export function navigateCalendar(direction) {
  if (activeViewMode === 'month') {
    // direction: -1 (prev month), 1 (next month), 0 (today)
    if (direction === 0) {
      currentDate = new Date(2026, 9, 20);
      selectedDateStr = '2026-10-20';
    } else {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    }
  } else {
    // Week navigation: -7 days, +7 days, or today
    if (direction === 0) {
      currentDate = new Date(2026, 9, 20);
      selectedDateStr = '2026-10-20';
    } else {
      currentDate = new Date(currentDate.getTime() + direction * 7 * 24 * 60 * 60 * 1000);
    }
  }
  notifyListeners();
}

// Filtering Events
export function getFilteredEvents() {
  return orbitEvents.filter(evt => {
    if (activeCategoryFilter === 'all') return true;
    return evt.category === activeCategoryFilter;
  });
}

export function getEventsForDate(dateStr) {
  return getFilteredEvents().filter(evt => evt.date === dateStr);
}

export function getUpcomingAgendas(limit = 6) {
  const todayStr = '2026-10-20';
  return [...orbitEvents]
    .filter(evt => evt.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, limit);
}

export function getMeetingInvitations() {
  return orbitEvents
    .filter(evt => evt.category === 'meeting')
    .sort((a, b) => b.date.localeCompare(a.date));
}

// Event Actions
export function addOrbitEvent(newEventData) {
  const id = 'evt-' + Date.now();
  const created = {
    id,
    title: newEventData.title.trim(),
    category: newEventData.category || 'together',
    date: newEventData.date,
    time: newEventData.time || '19:00',
    location: newEventData.location ? newEventData.location.trim() : 'Our Little Universe',
    proposer: newEventData.proposer || activeUserCharacter,
    proposerName: getCharacterDisplayName(newEventData.proposer || activeUserCharacter),
    description: newEventData.description ? newEventData.description.trim() : '',
    participants: newEventData.participants || ['nyanya', 'lala', 'lele'],
    status: newEventData.category === 'meeting' ? 'pending' : 'confirmed',
    responses: {
      nyanya: { status: newEventData.proposer === 'nyanya' ? 'accepted' : 'pending' },
      lala: { status: newEventData.proposer === 'lala' ? 'accepted' : 'pending' },
      lele: { status: newEventData.proposer === 'lele' ? 'accepted' : 'pending' }
    }
  };

  orbitEvents.unshift(created);
  notifyListeners();
  return created;
}

// Respond to Meeting Proposal
export function respondToMeeting(eventId, userChar, responseType, note = '', altDate = '', altTime = '') {
  const evt = orbitEvents.find(e => e.id === eventId);
  if (!evt) return false;

  if (!evt.responses) evt.responses = {};

  if (responseType === 'accepted') {
    evt.responses[userChar] = {
      status: 'accepted',
      note: note || 'Menyetujui jadwal meeting ✨'
    };
  } else if (responseType === 'rejected') {
    evt.responses[userChar] = {
      status: 'rejected',
      note: note || 'Tidak dapat hadir pada jam tersebut.'
    };
  } else if (responseType === 'proposed_alt') {
    evt.responses[userChar] = {
      status: 'proposed_alt',
      altDate: altDate || evt.date,
      altTime: altTime || evt.time,
      note: note || 'Mengusulkan waktu alternatif.'
    };
  }

  // Check overall meeting status: If all accepted, mark confirmed
  const allAccepted = ['nyanya', 'lala', 'lele'].every(
    char => evt.responses[char] && evt.responses[char].status === 'accepted'
  );
  if (allAccepted) {
    evt.status = 'confirmed';
  }

  notifyListeners();
  return true;
}

// Helpers
export function getCharacterDisplayName(key) {
  const map = {
    nyanya: 'Nyanya (The Moonlit Shadow Witch)',
    lala: 'Lala (The Everglow Fairy)',
    lele: 'Lele (The Eclipse Guardian)'
  };
  return map[key] || key;
}

export function getCategoryBadge(category) {
  const map = {
    together: { label: 'Kegiatan Bersama', color: 'purple', icon: '🌌' },
    meeting: { label: 'Meeting Jarak Jauh', color: 'blue', icon: '🪐' },
    birthday: { label: 'Ulang Tahun', color: 'pink', icon: '🎂' },
    reminder: { label: 'Pengingat Acara', color: 'amber', icon: '⭐' },
    personal: { label: 'Kegiatan Pribadi', color: 'lavender', icon: '📖' }
  };
  return map[category] || { label: category, color: 'gray', icon: '✦' };
}
