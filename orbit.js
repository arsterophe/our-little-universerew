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
  CANONICAL_CHARACTERS,
  dbSaveOrbitEvent,
  dbDeleteOrbitEvent,
  dbRespondToMeeting,
  dbFetchOrbitEvents,
  dbSubscribeOrbitEvents,
  dbSubscribeOrbitNotifications,
  dbMigrateOrbitEvents,
  backupLocalStorageKey,
  subscribeDatabaseStatus,
  getDatabaseStatus,
  updateDatabaseStatus
} from './firebase.js';
import { onAuthStateChanged } from 'firebase/auth';

// 8 Canonical Characters definition for equal access across Our Little Orbit
export const ALL_ORBIT_CHARACTERS = [
  { id: 'nyanya', name: 'Nyanya', role: 'The Moonlit Shadow Witch', universe: 'KIDULT', avatar: '/assets/avatar_nyanya_hd.png', color: '#c084fc' },
  { id: 'lala', name: 'Lala', role: 'The Everglow Fairy', universe: 'TO YOU', avatar: '/assets/avatar_lala_hd.png', color: '#f472b6' },
  { id: 'lele', name: 'Lele', role: 'The Eclipse Guardian', universe: 'SHADOW', avatar: '/assets/avatar_lele_hd.png', color: '#60a5fa' },
  { id: 'abil', name: 'Syma', role: 'The Windwhisper Kitsune', universe: 'PINWHEEL', avatar: '/assets/avatar_abil_hd.jpg', color: '#e879f9' },
  { id: 'akhira', name: 'Akhira', role: 'The Starlight Navigator', universe: 'YAWN', avatar: '/assets/avatar_akhira_hd.jpg', color: '#38bdf8' },
  { id: 'ela', name: 'Ela', role: 'The Solar Alchemist', universe: 'US AGAIN', avatar: '/assets/avatar_ela_hd.jpg', color: '#fb923c' },
  { id: 'ruben', name: 'Ruben', role: 'The Nebula Chronicler', universe: 'ASH', avatar: '/assets/avatar_ruben_hd.jpg', color: '#4ade80' },
  { id: 'royan', name: 'Royan', role: 'The Cosmic Horizon Pioneer', universe: 'HOT', avatar: '/assets/avatar_royan_hd.jpg', color: '#f87171' }
];

/**
 * Normalizes any date format (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY, YYYY/MM/DD)
 * into canonical ISO format 'YYYY-MM-DD'.
 */
export function normalizeDateString(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return '';
  const trimmed = dateStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  const dmyMatch = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }
  const ymdMatch = trimmed.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const d = String(parsed.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return trimmed;
}

export function normalizeCharacterKey(key) {
  if (!key) return 'nyanya';
  const lower = String(key).toLowerCase().trim();
  if (lower === 'syma') return 'abil';
  if (CANONICAL_CHARACTERS && CANONICAL_CHARACTERS[lower]) return lower;
  const found = ALL_ORBIT_CHARACTERS.find(c => c.id === lower);
  if (found) return found.id;
  return 'nyanya';
}

export function getCharacterDisplayName(key) {
  const k = normalizeCharacterKey(key);
  const char = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[k] : ALL_ORBIT_CHARACTERS.find(c => c.id === k);
  if (char) {
    return `${char.name} (${char.role})`;
  }
  return key;
}

export function getCharacterShortName(key) {
  const k = normalizeCharacterKey(key);
  const char = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[k] : ALL_ORBIT_CHARACTERS.find(c => c.id === k);
  return char ? char.name : key;
}

export function getCharacterAvatar(key) {
  const k = normalizeCharacterKey(key);
  const char = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[k] : ALL_ORBIT_CHARACTERS.find(c => c.id === k);
  return char ? char.avatar : '/assets/avatar_nyanya_hd.png';
}

export function getCharacterUniverse(key) {
  const k = normalizeCharacterKey(key);
  const char = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[k] : ALL_ORBIT_CHARACTERS.find(c => c.id === k);
  return char ? char.universe : 'KIDULT';
}

export function getCharacterRole(key) {
  const k = normalizeCharacterKey(key);
  const char = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[k] : ALL_ORBIT_CHARACTERS.find(c => c.id === k);
  return char ? char.role : '';
}

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
let notifUnsubscribe = null;
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

        // 3. Clear existing listeners if any
        if (firestoreUnsubscribe) {
          firestoreUnsubscribe();
          firestoreUnsubscribe = null;
        }
        if (notifUnsubscribe) {
          notifUnsubscribe();
          notifUnsubscribe = null;
        }

        // 4. Start real-time Firestore events listener
        firestoreUnsubscribe = dbSubscribeOrbitEvents(
          user,
          (remoteEvents) => {
            if (Array.isArray(remoteEvents) && remoteEvents.length > 0) {
              orbitEvents = remoteEvents;
              saveStoredOrbitEvents(orbitEvents);

              // Auto-reconstruct meeting notifications if missing locally for invited meetings
              if (authChar) {
                remoteEvents.forEach(evt => {
                  if (evt.category === 'meeting' && Array.isArray(evt.invitedParticipants)) {
                    const isInvited = evt.invitedParticipants.map(normalizeCharacterKey).includes(authChar);
                    if (isInvited) {
                      const existingNotifs = getOrbitNotifications(authChar);
                      const alreadyHasNotif = existingNotifs.some(n => n.meetingId === evt.id);
                      if (!alreadyHasNotif) {
                        const proposerShortName = getCharacterShortName(evt.proposer);
                        const charConfig = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[authChar] : null;
                        existingNotifs.unshift({
                          id: `notif-meet-${evt.id}-${authChar}`,
                          type: 'meeting_invitation',
                          meetingId: evt.id,
                          meetingTitle: evt.title,
                          meetingDate: evt.date,
                          meetingTime: evt.time,
                          location: evt.location,
                          proposer: evt.proposer,
                          proposerName: proposerShortName,
                          recipientChar: authChar,
                          recipientUid: charConfig?.uid || authChar,
                          createdAt: evt.createdAt || new Date().toISOString(),
                          read: evt.responses && evt.responses[authChar] && evt.responses[authChar].status !== 'pending',
                          message: `${proposerShortName} mengundangmu ke meeting "${evt.title}" pada ${evt.date} pukul ${evt.time} WIB.`
                        });
                        saveOrbitNotifications(authChar, existingNotifs);
                      }
                    }
                  }
                });
              }

              notifyListeners();
            }
          },
          (err) => {
            console.error('Firestore listener error on Our Calendar:', err);
          }
        );

        // 5. Start real-time Firestore notifications listener
        if (typeof dbSubscribeOrbitNotifications === 'function') {
          notifUnsubscribe = dbSubscribeOrbitNotifications(
            user,
            (remoteNotifs) => {
              if (Array.isArray(remoteNotifs) && authChar) {
                const currentLocal = getOrbitNotifications(authChar);
                const mergedMap = new Map();
                currentLocal.forEach(n => mergedMap.set(n.id || n.meetingId, n));
                remoteNotifs.forEach(n => {
                  const key = n.id || n.meetingId;
                  const existing = mergedMap.get(key);
                  mergedMap.set(key, { ...existing, ...n });
                });
                const mergedList = Array.from(mergedMap.values()).sort((a, b) =>
                  (b.createdAt || '').localeCompare(a.createdAt || '')
                );
                saveOrbitNotifications(authChar, mergedList);
                notifyListeners();
              }
            },
            (err) => {
              console.warn('Firestore notifications listener notice:', err);
            }
          );
        }

        isFirestoreSynced = true;
      } catch (err) {
        console.error('Gagal sinkronisasi kalender ke Firestore:', err);
      }
    } else {
      if (firestoreUnsubscribe) {
        firestoreUnsubscribe();
        firestoreUnsubscribe = null;
      }
      if (notifUnsubscribe) {
        notifUnsubscribe();
        notifUnsubscribe = null;
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
  selectedDateStr = normalizeDateString(dateStr) || dateStr;
  notifyListeners();
}

export function setCurrentDate(date) {
  if (date instanceof Date && !isNaN(date.getTime())) {
    currentDate = date;
    notifyListeners();
  }
}

/**
 * Batched state updater for navigating to a specific date and resetting the category filter,
 * triggering only a single re-render of listeners instead of multiple sequential renders.
 */
export function focusCalendarOnDate(dateStr) {
  const normDate = normalizeDateString(dateStr);
  if (!normDate) return;
  selectedDateStr = normDate;
  activeCategoryFilter = 'all';
  const parts = normDate.split('-');
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    currentDate = new Date(y, m, d);
  }
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
  const currentViewer = normalizeCharacterKey(activeUserCharacter || 'nyanya');
  return orbitEvents.filter(evt => {
    // Privacy check for meetings in getFilteredEvents: only host or invited participants can see
    if (evt.category === 'meeting') {
      const hostChar = normalizeCharacterKey(evt.proposer);
      const isHost = hostChar === currentViewer;
      const isParticipant = (Array.isArray(evt.participants) && evt.participants.map(normalizeCharacterKey).includes(currentViewer)) ||
                            (Array.isArray(evt.invitedParticipants) && evt.invitedParticipants.map(normalizeCharacterKey).includes(currentViewer));
      const hasResponse = evt.responses && (
        evt.responses[currentViewer] ||
        (currentViewer === 'abil' && evt.responses['syma']) ||
        (currentViewer === 'syma' && evt.responses['abil'])
      );
      if (!isHost && !isParticipant && !hasResponse) return false;
    }
    if (evt.category === 'personal') {
      const hostChar = normalizeCharacterKey(evt.proposer);
      if (hostChar !== currentViewer) return false;
    }
    if (activeCategoryFilter === 'all') return true;
    return evt.category === activeCategoryFilter;
  });
}

export function getEventsForDate(dateStr) {
  const norm = normalizeDateString(dateStr);
  return getFilteredEvents().filter(evt => normalizeDateString(evt.date) === norm);
}

export function getUpcomingAgendas(limit = 6) {
  const todayStr = '2026-10-20';
  return [...orbitEvents]
    .filter(evt => evt.date >= todayStr)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
    .slice(0, limit);
}

// Notification Store for Selective Meeting Invitations
const ORBIT_NOTIF_PREFIX = 'olu_orbit_notifications_';

export function getOrbitNotifications(charKey) {
  const normChar = normalizeCharacterKey(charKey || activeUserCharacter);
  const charConfig = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[normChar] : null;
  const uid = charConfig?.uid || normChar;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const raw = window.localStorage.getItem(ORBIT_NOTIF_PREFIX + uid);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Gagal membaca notifikasi Orbit:', e);
    }
  }
  return [];
}

export function saveOrbitNotifications(charKey, notifications) {
  const normChar = normalizeCharacterKey(charKey);
  const charConfig = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[normChar] : null;
  const uid = charConfig?.uid || normChar;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(ORBIT_NOTIF_PREFIX + uid, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Gagal menyimpan notifikasi Orbit:', e);
    }
  }
}

export function createOrbitMeetingNotifications(meetingEvent) {
  if (!meetingEvent || !Array.isArray(meetingEvent.invitedParticipants)) return;

  const proposerShortName = getCharacterShortName(meetingEvent.proposer);

  meetingEvent.invitedParticipants.forEach(targetChar => {
    const normTarget = normalizeCharacterKey(targetChar);
    const charConfig = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[normTarget] : null;
    const targetUid = charConfig?.uid || normTarget;

    const notifItem = {
      id: 'notif-meet-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
      type: 'meeting_invitation',
      meetingId: meetingEvent.id,
      meetingTitle: meetingEvent.title,
      meetingDate: meetingEvent.date,
      meetingTime: meetingEvent.time,
      location: meetingEvent.location,
      proposer: meetingEvent.proposer,
      proposerName: proposerShortName,
      recipientChar: normTarget,
      recipientUid: targetUid,
      createdAt: new Date().toISOString(),
      read: false,
      message: `${proposerShortName} mengundangmu ke meeting "${meetingEvent.title}" pada ${meetingEvent.date} pukul ${meetingEvent.time} WIB.`
    };

    const currentList = getOrbitNotifications(normTarget);
    const filtered = currentList.filter(n => n.meetingId !== meetingEvent.id);
    filtered.unshift(notifItem);
    saveOrbitNotifications(normTarget, filtered);
  });
}

export function markOrbitNotificationRead(notifId, charKey) {
  const normChar = normalizeCharacterKey(charKey || activeUserCharacter);
  const currentList = getOrbitNotifications(normChar);
  const updated = currentList.map(n => n.id === notifId ? { ...n, read: true } : n);
  saveOrbitNotifications(normChar, updated);
  notifyListeners();
}

export function markAllOrbitNotificationsRead(charKey) {
  const normChar = normalizeCharacterKey(charKey || activeUserCharacter);
  const currentList = getOrbitNotifications(normChar);
  const updated = currentList.map(n => ({ ...n, read: true }));
  saveOrbitNotifications(normChar, updated);
  notifyListeners();
}

export function getUnreadNotificationsCount(charKey) {
  const list = getOrbitNotifications(charKey);
  return list.filter(n => !n.read).length;
}

// Meeting Invitations Filter (Strict isolation: only creator or invited participants see it)
export function getMeetingInvitations(viewerChar) {
  const currentViewer = normalizeCharacterKey(viewerChar || activeUserCharacter || 'nyanya');
  return orbitEvents
    .filter(evt => {
      if (evt.category !== 'meeting') return false;
      const hostChar = normalizeCharacterKey(evt.proposer);
      const isHost = hostChar === currentViewer;
      const isParticipant = Array.isArray(evt.participants) && evt.participants.map(normalizeCharacterKey).includes(currentViewer);
      const hasResponse = evt.responses && (
        evt.responses[currentViewer] ||
        (currentViewer === 'abil' && evt.responses['syma']) ||
        (currentViewer === 'syma' && evt.responses['abil'])
      );
      return isHost || isParticipant || Boolean(hasResponse);
    })
    .sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
}

// Event Actions
export function addOrbitEvent(newEventData) {
  if (!newEventData || !newEventData.title || !newEventData.title.trim()) {
    throw new Error('Judul kegiatan tidak boleh kosong');
  }
  const normDate = normalizeDateString(newEventData.date);
  if (!normDate) {
    throw new Error('Tanggal kegiatan wajib dipilih (format: YYYY-MM-DD atau DD/MM/YYYY)');
  }

  const id = 'evt-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
  const proposerKey = normalizeCharacterKey(newEventData.proposer || activeUserCharacter || 'nyanya');
  const isMeeting = newEventData.category === 'meeting';

  // Determine selective participants
  let participants = [];
  let invitedParticipants = [];

  if (isMeeting) {
    // If explicit invitedParticipants or participants are provided
    const rawInvited = Array.isArray(newEventData.invitedParticipants)
      ? newEventData.invitedParticipants
      : (Array.isArray(newEventData.participants) ? newEventData.participants.filter(p => normalizeCharacterKey(p) !== proposerKey) : []);

    invitedParticipants = [...new Set(rawInvited.map(normalizeCharacterKey))];

    if (invitedParticipants.length === 0) {
      throw new Error('Silakan pilih minimal 1 peserta yang diundang ke meeting');
    }

    participants = [proposerKey, ...invitedParticipants];
  } else {
    participants = Array.isArray(newEventData.participants) && newEventData.participants.length > 0
      ? [...new Set(newEventData.participants.map(normalizeCharacterKey))]
      : ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
  }

  // Responses map strictly for participating characters
  const responses = {};
  participants.forEach(char => {
    if (char === proposerKey) {
      responses[char] = {
        status: 'accepted',
        note: isMeeting ? 'Pembuat meeting (Host)' : 'Pembuat kegiatan',
        respondedAt: new Date().toISOString()
      };
    } else {
      responses[char] = {
        status: 'pending',
        note: 'Menunggu konfirmasi',
        respondedAt: null
      };
    }
  });

  const participantUids = participants
    .map(p => CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[p]?.uid : null)
    .filter(Boolean);
  const invitedParticipantUids = invitedParticipants
    .map(p => CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[p]?.uid : null)
    .filter(Boolean);

  const created = {
    id,
    title: newEventData.title.trim(),
    category: newEventData.category || 'together',
    date: normDate,
    time: newEventData.time || '19:00',
    location: newEventData.location ? newEventData.location.trim() : 'Our Little Universe',
    proposer: proposerKey,
    proposerName: getCharacterDisplayName(proposerKey),
    proposerUid: CANONICAL_CHARACTERS ? (CANONICAL_CHARACTERS[proposerKey]?.uid || null) : null,
    proposerEmail: CANONICAL_CHARACTERS ? (CANONICAL_CHARACTERS[proposerKey]?.email || null) : null,
    description: newEventData.description ? newEventData.description.trim() : '',
    participants,
    participantUids,
    invitedParticipants,
    invitedParticipantUids,
    status: isMeeting ? 'pending' : 'confirmed',
    syncStatus: newEventData.syncStatus || 'synced',
    responses,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  orbitEvents.unshift(created);
  saveStoredOrbitEvents(orbitEvents);

  // If meeting: dispatch notifications strictly to invited participants
  if (isMeeting && invitedParticipants.length > 0) {
    createOrbitMeetingNotifications(created);
  }

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

// Delete Orbit Event (Strict owner permission check across all 8 characters)
export function deleteOrbitEvent(eventId, actorChar) {
  const idx = orbitEvents.findIndex(e => e.id === eventId);
  if (idx === -1) {
    return { success: false, message: 'Kegiatan tidak ditemukan di kalender.' };
  }

  const evt = orbitEvents[idx];
  const normActor = normalizeCharacterKey(actorChar);
  const normProposer = normalizeCharacterKey(evt.proposer);

  if (normProposer && normActor && normProposer !== normActor) {
    const ownerName = getCharacterShortName(evt.proposer);
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

// Update Orbit Event
export function updateOrbitEvent(eventId, updatedData, actorChar) {
  const evt = orbitEvents.find(e => e.id === eventId);
  if (!evt) {
    return { success: false, message: 'Kegiatan tidak ditemukan di kalender.' };
  }

  const normActor = normalizeCharacterKey(actorChar);
  const normProposer = normalizeCharacterKey(evt.proposer);

  if (normProposer && normActor && normProposer !== normActor) {
    const ownerName = getCharacterShortName(evt.proposer);
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
  evt.updatedAt = new Date().toISOString();

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

// Respond to Meeting Proposal (Supports accept, decline, propose_alt)
export async function respondToMeeting(eventId, userChar, responseType, note = '', altDate = '', altTime = '') {
  const evt = orbitEvents.find(e => e.id === eventId);
  if (!evt) {
    throw new Error('Undangan meeting tidak ditemukan.');
  }

  // 1. Resolve character identity
  let normChar = normalizeCharacterKey(userChar || activeUserCharacter);
  if (auth && auth.currentUser) {
    const authChar = identifyUserCharacter(auth.currentUser);
    if (authChar) {
      normChar = normalizeCharacterKey(authChar);
    }
  }

  if (!evt.responses) evt.responses = {};

  // Store previous response for rollback if remote fails
  const prevResponse = evt.responses[normChar] ? { ...evt.responses[normChar] } : null;
  const prevStatus = evt.status;
  const prevUpdatedAt = evt.updatedAt;

  const cleanNote = note ? note.trim() : '';
  const isAccepted = responseType === 'accepted';
  const isDeclined = responseType === 'declined' || responseType === 'rejected';
  const isProposedAlt = responseType === 'proposed_alt';

  if (isAccepted) {
    evt.responses[normChar] = {
      status: 'accepted',
      note: cleanNote || 'Menyetujui jadwal meeting ✨',
      respondedAt: new Date().toISOString()
    };
  } else if (isDeclined) {
    evt.responses[normChar] = {
      status: 'declined',
      note: cleanNote || 'Tidak dapat hadir pada jadwal ini.',
      respondedAt: new Date().toISOString()
    };
  } else if (isProposedAlt) {
    evt.responses[normChar] = {
      status: 'proposed_alt',
      altDate: altDate || evt.date,
      altTime: altTime || evt.time,
      note: cleanNote || 'Mengusulkan waktu alternatif.',
      respondedAt: new Date().toISOString()
    };
  }

  // Check if all designated participants have accepted
  const participantsList = Array.isArray(evt.participants) && evt.participants.length > 0
    ? evt.participants.map(normalizeCharacterKey)
    : Object.keys(evt.responses).map(normalizeCharacterKey);

  const allAccepted = participantsList.length > 0 && participantsList.every(
    char => {
      const resp = evt.responses[char] || (char === 'abil' && evt.responses['syma']) || (char === 'syma' && evt.responses['abil']);
      return resp && resp.status === 'accepted';
    }
  );

  evt.status = allAccepted ? 'confirmed' : 'pending';
  evt.updatedAt = new Date().toISOString();

  saveStoredOrbitEvents(orbitEvents);

  // Mark notification as read
  const notifs = getOrbitNotifications(normChar);
  const matchNotif = notifs.find(n => n.meetingId === eventId);
  if (matchNotif) {
    markOrbitNotificationRead(matchNotif.id, normChar);
  }

  notifyListeners();

  // If authenticated with Firebase, await Cloud update and roll back on failure
  if (auth && auth.currentUser) {
    const cloudRespType = isAccepted ? 'accepted' : (isDeclined ? 'declined' : 'proposed_alt');
    try {
      await dbRespondToMeeting(eventId, auth.currentUser, cloudRespType, cleanNote, altDate, altTime);
    } catch (cloudErr) {
      console.error('Gagal menyimpan respons meeting ke Firestore:', cloudErr);
      if (prevResponse) {
        evt.responses[normChar] = prevResponse;
      } else {
        delete evt.responses[normChar];
      }
      evt.status = prevStatus;
      evt.updatedAt = prevUpdatedAt;
      saveStoredOrbitEvents(orbitEvents);
      notifyListeners();
      throw cloudErr;
    }
  }

  return { success: true, event: evt };
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
