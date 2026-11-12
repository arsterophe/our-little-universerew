/**
 * OUR LITTLE ORBIT — SHARED CALENDAR & CELESTIAL PLANNER
 * 
 * Shared schedule, event calendar, and remote meeting coordinator
 * for the three besties: Nyanya, Lala, and Lele.
 * 
 * Integrated with Cloud Firestore real-time synchronization,
 * idempotent migration, local backup, and verified UID security.
 */

import {
  auth,
  db,
  identifyUserCharacter,
  dbSaveOrbitEvent,
  dbDeleteOrbitEvent,
  dbRespondToMeeting,
  dbFetchOrbitEvents,
  dbSubscribeOrbitEvents,
  dbMigrateOrbitEvents,
  backupLocalStorageKey,
  subscribeDatabaseStatus,
  getDatabaseStatus,
  updateDatabaseStatus
} from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

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

// Reactive Store & Persistence Setup
const ORBIT_STORAGE_KEY = 'olu_orbit_events_v2';

function loadStoredOrbitEvents() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(ORBIT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Gagal memuat events dari localStorage:', e);
    }
  }
  return [...INITIAL_ORBIT_EVENTS];
}

function saveStoredOrbitEvents(events) {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(ORBIT_STORAGE_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('Gagal menyimpan events ke localStorage:', e);
    }
  }
}

let orbitEvents = loadStoredOrbitEvents();
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

// ==============================================================================
// FIRESTORE REAL-TIME SYNC & IDEMPOTENT MIGRATION
// ==============================================================================

let firestoreUnsubscribe = null;
let isFirestoreSynced = false;

export function initOrbitFirebaseSync() {
  if (!auth) return;

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Synchronize active perspective with authenticated character
        const authChar = identifyUserCharacter(user);
        if (authChar) {
          activeUserCharacter = authChar;
          notifyListeners();
        }

        // 1. Mandatory backup of localStorage key before any write
        backupLocalStorageKey(ORBIT_STORAGE_KEY);

        // 2. Perform idempotent migration of existing local events to Firestore
        await dbMigrateOrbitEvents(user, orbitEvents);

        // 3. Clear existing listener if any
        if (firestoreUnsubscribe) {
          firestoreUnsubscribe();
          firestoreUnsubscribe = null;
        }

        // 4. Start real-time Firestore listener
        firestoreUnsubscribe = dbSubscribeOrbitEvents(
          user,
          (remoteEvents) => {
            if (Array.isArray(remoteEvents) && remoteEvents.length > 0) {
              orbitEvents = remoteEvents;
              saveStoredOrbitEvents(orbitEvents);
              notifyListeners();
            }
          },
          (err) => {
            console.error('Firestore listener error on Our Calendar:', err);
          }
        );

        isFirestoreSynced = true;
      } catch (err) {
        console.error('Gagal sinkronisasi kalender ke Firestore:', err);
      }
    } else {
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }
      isFirestoreSynced = false;
      updateDatabaseStatus('idle', 'Mode Offline (Cache) — Masuk akun untuk sinkronisasi Cloud');
    }
  });
}

// Auto-initialize sync on load
if (typeof window !== 'undefined') {
  initOrbitFirebaseSync();
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
  if (!newEventData || !newEventData.title || !newEventData.title.trim()) {
    throw new Error('Judul kegiatan tidak boleh kosong');
  }
  if (!newEventData.date) {
    throw new Error('Tanggal kegiatan wajib dipilih');
  }

  const id = 'evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  const proposerKey = newEventData.proposer || activeUserCharacter || 'nyanya';
  const created = {
    id,
    title: newEventData.title.trim(),
    category: newEventData.category || 'together',
    date: newEventData.date,
    time: newEventData.time || '19:00',
    location: newEventData.location ? newEventData.location.trim() : 'Our Little Universe',
    proposer: proposerKey,
    proposerName: getCharacterDisplayName(proposerKey),
    description: newEventData.description ? newEventData.description.trim() : '',
    participants: newEventData.participants || ['nyanya', 'lala', 'lele'],
    status: newEventData.category === 'meeting' ? 'pending' : 'confirmed',
    responses: {
      nyanya: { status: proposerKey === 'nyanya' ? 'accepted' : 'pending' },
      lala: { status: proposerKey === 'lala' ? 'accepted' : 'pending' },
      lele: { status: proposerKey === 'lele' ? 'accepted' : 'pending' }
    }
  };

  orbitEvents.unshift(created);
  saveStoredOrbitEvents(orbitEvents);
  notifyListeners();

  let cloudPromise = null;
  if (auth && auth.currentUser) {
    cloudPromise = dbSaveOrbitEvent(created, auth.currentUser);
  }

  created.then = function (onResolve, onReject) {
    if (cloudPromise) {
      return cloudPromise.then(() => onResolve(created), onReject);
    }
    return Promise.resolve(created).then(onResolve, onReject);
  };

  return created;
}

// Delete Orbit Event (With strict owner permission check)
export function deleteOrbitEvent(eventId, actorChar) {
  const idx = orbitEvents.findIndex(e => e.id === eventId);
  if (idx === -1) {
    return { success: false, message: 'Kegiatan tidak ditemukan di kalender.' };
  }

  const evt = orbitEvents[idx];
  // Ownership check: only the proposer can delete
  if (evt.proposer && actorChar && evt.proposer !== actorChar) {
    const ownerName = getCharacterDisplayName(evt.proposer).split(' ')[0];
    return {
      success: false,
      message: `Hanya pembuat acara (${ownerName}) yang dapat menghapus kegiatan ini.`
    };
  }

  orbitEvents.splice(idx, 1);
  saveStoredOrbitEvents(orbitEvents);
  notifyListeners();

  let cloudPromise = null;
  if (auth && auth.currentUser) {
    cloudPromise = dbDeleteOrbitEvent(eventId, auth.currentUser);
  }

  const result = { success: true, message: 'Kegiatan berhasil dihapus dari kalender.' };
  result.then = function (onResolve, onReject) {
    if (cloudPromise) {
      return cloudPromise.then(() => onResolve(result), (err) => onReject(err));
    }
    return Promise.resolve(result).then(onResolve, onReject);
  };

  return result;
}

// Update Orbit Event (With strict owner permission check)
export function updateOrbitEvent(eventId, updatedData, actorChar) {
  const evt = orbitEvents.find(e => e.id === eventId);
  if (!evt) {
    return { success: false, message: 'Kegiatan tidak ditemukan di kalender.' };
  }

  // Ownership check
  if (evt.proposer && actorChar && evt.proposer !== actorChar) {
    const ownerName = getCharacterDisplayName(evt.proposer).split(' ')[0];
    return {
      success: false,
      message: `Hanya pembuat acara (${ownerName}) yang dapat mengubah kegiatan ini.`
    };
  }

  if (updatedData.title && updatedData.title.trim()) evt.title = updatedData.title.trim();
  if (updatedData.date) evt.date = updatedData.date;
  if (updatedData.time) evt.time = updatedData.time;
  if (updatedData.location !== undefined) evt.location = updatedData.location.trim();
  if (updatedData.description !== undefined) evt.description = updatedData.description.trim();
  if (updatedData.category) evt.category = updatedData.category;

  saveStoredOrbitEvents(orbitEvents);
  notifyListeners();

  let cloudPromise = null;
  if (auth && auth.currentUser) {
    cloudPromise = dbSaveOrbitEvent(evt, auth.currentUser);
  }

  const result = { success: true, message: 'Kegiatan berhasil diperbarui.', event: evt };
  result.then = function (onResolve, onReject) {
    if (cloudPromise) {
      return cloudPromise.then(() => onResolve(result), (err) => onReject(err));
    }
    return Promise.resolve(result).then(onResolve, onReject);
  };

  return result;
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

  saveStoredOrbitEvents(orbitEvents);
  notifyListeners();

  let cloudPromise = null;
  if (auth && auth.currentUser) {
    cloudPromise = dbRespondToMeeting(eventId, auth.currentUser, responseType, note, altDate, altTime);
  }

  const result = true;
  return result;
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
