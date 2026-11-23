import { auth, dbSavePhotoboothStrip, identifyUserCharacter } from './firebase.js';
import { addMoment } from './moments.js';

/**
 * OUR LITTLE PHOTOBOOTH — FULL 8 CHARACTERS ACCESS & GROUP PHOTO SYSTEM
 * Separate top-level feature in Our Little Universe.
 *
 * Key Guarantees:
 *  - Full, equal access for all 8 Universe Characters:
 *      1. Nyanya ⭐ (KIDULT)
 *      2. Lala ☀️ (TO YOU)
 *      3. Lele 🌙 (SHADOW)
 *      4. Syma ☁️ (PINWHEEL) [internal key: 'abil', alias 'syma']
 *      5. Akhira 🌊 (YAWN)
 *      6. Ela 🪷 (US AGAIN)
 *      7. Ruben 🐉 (ASH)
 *      8. Royan 🎆 (HOT)
 *  - Real Login Identity Detection: Uses Firebase Auth (auth.currentUser) or active session.
 *    Completely removes fallback/hardcode to "Nyanya (Vanya)".
 *  - Group Photo Selection (1–8 Persons):
 *      Solo (1), Duo (2), Trio (3), Squad (4), Group (5), Big Group (6), Full Circle (7), All Universe (8).
 *      Active logged-in character is automatically locked as participant #1.
 *      No duplicates allowed; counter indicators; strict quota validation.
 *  - Multi-User Room System: Collaborative sessions supporting 2–8 participants with presence indicators.
 *  - 8 Distinctive Aesthetic Photobooth Templates:
 *      1. Classic Photostrip (vintage monochrome booth, crisp borders)
 *      2. Polaroid Memories (polaroid frames, white matte, nostalgic notes)
 *      3. Pastel Scrapbook (pastel gradient, washi tape, cute doodles)
 *      4. Dreamy Galaxy (deep space, sparkling stars, cosmic nebula)
 *      5. Vintage Film (35mm analog film with sprocket holes and grain)
 *      6. Fairy Garden (magical botanical, butterflies, blooming flora)
 *      7. Friendship Memories (besties seal, warm sunset coral, hearts)
 *      8. Special Moments (gold glitter, opulent obsidian, royal starlight)
 *  - Studio Camera: Live camera, 2/3/4 panel layouts, 3s/5s/none countdown, retake.
 *  - Results & Storage: High-res interactive Canvas, save to Personal Gallery (Cloud), download PNG.
 */

const STORAGE_KEY_ROOMS = 'olu_photobooth_rooms_v1';
const STORAGE_KEY_SESSION = 'olu_session_state_v1';
const CHANNEL_NAME = 'olu_photobooth_sync_v1';

// --- ALL 8 UNIVERSE CHARACTERS ---
export const PB_CHARACTERS = {
  nyanya: {
    key: 'nyanya',
    name: 'Nyanya',
    symbol: '⭐',
    universe: 'KIDULT',
    avatar: '/assets/avatar_nyanya_hd.png',
    badgeColor: '#fef08a',
    gradStart: '#312e81',
    gradEnd: '#f472b6',
    quote: 'Twinkling Starlight'
  },
  lala: {
    key: 'lala',
    name: 'Lala',
    symbol: '☀️',
    universe: 'TO YOU',
    avatar: '/assets/avatar_lala_hd.png',
    badgeColor: '#fde68a',
    gradStart: '#065f46',
    gradEnd: '#fbbf24',
    quote: 'Warm Morning Fairy'
  },
  lele: {
    key: 'lele',
    name: 'Lele',
    symbol: '🌙',
    universe: 'SHADOW',
    avatar: '/assets/avatar_lele_hd.png',
    badgeColor: '#e9d5ff',
    gradStart: '#1e1b4b',
    gradEnd: '#a855f7',
    quote: 'Crystal Moon Guardian'
  },
  abil: {
    key: 'abil',
    name: 'Syma',
    symbol: '☁️',
    universe: 'PINWHEEL',
    avatar: '/assets/avatar_abil_hd.jpg',
    badgeColor: '#bae6fd',
    gradStart: '#0c4a6e',
    gradEnd: '#38bdf8',
    quote: 'Gentle Wind Weaver'
  },
  akhira: {
    key: 'akhira',
    name: 'Akhira',
    symbol: '🌊',
    universe: 'YAWN',
    avatar: '/assets/avatar_akhira_hd.jpg',
    badgeColor: '#99f6e4',
    gradStart: '#134e4a',
    gradEnd: '#14b8a6',
    quote: 'Ocean Breeze Serenade'
  },
  ela: {
    key: 'ela',
    name: 'Ela',
    symbol: '🪷',
    universe: 'US AGAIN',
    avatar: '/assets/avatar_ela_hd.jpg',
    badgeColor: '#fbcfe8',
    gradStart: '#701a75',
    gradEnd: '#ec4899',
    quote: 'Lotus Blossom Memory'
  },
  ruben: {
    key: 'ruben',
    name: 'Ruben',
    symbol: '🐉',
    universe: 'ASH',
    avatar: '/assets/avatar_ruben_hd.jpg',
    badgeColor: '#fed7aa',
    gradStart: '#7c2d12',
    gradEnd: '#f97316',
    quote: 'Ember Dragon Flame'
  },
  royan: {
    key: 'royan',
    name: 'Royan',
    symbol: '🎆',
    universe: 'HOT',
    avatar: '/assets/avatar_royan_hd.jpg',
    badgeColor: '#fecdd3',
    gradStart: '#881337',
    gradEnd: '#f43f5e',
    quote: 'Sparkling Fireworks Night'
  }
};

// Seamless Alias for Syma
PB_CHARACTERS.syma = PB_CHARACTERS.abil;
export const ALL_PB_CHARACTERS = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];

// --- GROUP PHOTO SIZES (1–8 PERSONS) ---
export const PB_GROUP_SIZES = [
  { count: 1, label: '1 Orang', name: 'Solo', icon: '👤', desc: 'Foto Sendiri' },
  { count: 2, label: '2 Orang', name: 'Duo', icon: '👥', desc: 'Foto Berdua' },
  { count: 3, label: '3 Orang', name: 'Trio', icon: '✨', desc: 'Tiga Sahabat' },
  { count: 4, label: '4 Orang', name: 'Squad', icon: '🌟', desc: 'Squad 4 Sahabat' },
  { count: 5, label: '5 Orang', name: 'Group', icon: '💫', desc: 'Grup 5 Sahabat' },
  { count: 6, label: '6 Orang', name: 'Big Group', icon: '🎉', desc: 'Grup Besar 6 Sahabat' },
  { count: 7, label: '7 Orang', name: 'Full Circle', icon: '🌈', desc: 'Lingkaran 7 Sahabat' },
  { count: 8, label: '8 Orang', name: 'All Universe', icon: '🌌', desc: 'Semua 8 Sahabat Universe' }
];

// --- 8 DISTINCTIVE PHOTOBOOTH TEMPLATES ---
export const PB_TEMPLATES = {
  classic_photostrip: {
    id: 'classic_photostrip',
    name: 'Classic Photostrip',
    category: 'vintage_booth',
    bgTop: '#18181b',
    bgMid: '#27272a',
    bgBottom: '#09090b',
    borderOuter: '#f4f4f5',
    borderInner: 'rgba(255, 255, 255, 0.35)',
    titleColor: '#ffffff',
    captionColor: '#e4e4e7',
    subColor: '#a1a1aa',
    panelBorder: '#fafafa',
    cornerDecor: ['🎞️', '✦', '📸', '★'],
    badgeColor: '#f4f4f5',
    badgeText: '#18181b'
  },
  polaroid_memories: {
    id: 'polaroid_memories',
    name: 'Polaroid Memories',
    category: 'polaroid',
    bgTop: '#fbfaf8',
    bgMid: '#f4efe8',
    bgBottom: '#eae3d8',
    borderOuter: '#d6cec2',
    borderInner: 'rgba(180, 160, 140, 0.35)',
    titleColor: '#44403c',
    captionColor: '#57534e',
    subColor: '#78716c',
    panelBorder: '#ffffff',
    cornerDecor: ['📎', '✦', '📌', '📷'],
    badgeColor: '#44403c',
    badgeText: '#ffffff'
  },
  pastel_scrapbook: {
    id: 'pastel_scrapbook',
    name: 'Pastel Scrapbook',
    category: 'scrapbook',
    bgTop: '#fdf2f8',
    bgMid: '#fce7f3',
    bgBottom: '#f0fdf4',
    borderOuter: '#f472b6',
    borderInner: 'rgba(244, 114, 182, 0.45)',
    titleColor: '#9d174d',
    captionColor: '#831843',
    subColor: '#475569',
    panelBorder: '#fbcfe8',
    cornerDecor: ['🎀', '🌸', '✂️', '💖'],
    badgeColor: '#f472b6',
    badgeText: '#ffffff'
  },
  dreamy_galaxy: {
    id: 'dreamy_galaxy',
    name: 'Dreamy Galaxy',
    category: 'galaxy',
    bgTop: '#0b0a26',
    bgMid: '#1e1045',
    bgBottom: '#2d0b5a',
    borderOuter: '#c084fc',
    borderInner: 'rgba(192, 132, 252, 0.45)',
    titleColor: '#f3e8ff',
    captionColor: '#e9d5ff',
    subColor: '#c084fc',
    panelBorder: '#a855f7',
    cornerDecor: ['🌌', '✨', '🪐', '💫'],
    badgeColor: '#a855f7',
    badgeText: '#ffffff'
  },
  vintage_film: {
    id: 'vintage_film',
    name: 'Vintage Film',
    category: 'film_35mm',
    bgTop: '#292524',
    bgMid: '#1c1917',
    bgBottom: '#0c0a09',
    borderOuter: '#ca8a04',
    borderInner: 'rgba(202, 138, 4, 0.4)',
    titleColor: '#fef08a',
    captionColor: '#fde047',
    subColor: '#a8a29e',
    panelBorder: '#78716c',
    cornerDecor: ['🎞️', '🕰️', '🎞️', '🕰️'],
    badgeColor: '#ca8a04',
    badgeText: '#000000'
  },
  fairy_garden: {
    id: 'fairy_garden',
    name: 'Fairy Garden',
    category: 'botanical',
    bgTop: '#f0fdf4',
    bgMid: '#ecfdf5',
    bgBottom: '#dcfce7',
    borderOuter: '#15803d',
    borderInner: 'rgba(21, 128, 61, 0.35)',
    titleColor: '#14532d',
    captionColor: '#166534',
    subColor: '#4b5563',
    panelBorder: '#86efac',
    cornerDecor: ['🍃', '🦋', '🌸', '🌿'],
    badgeColor: '#15803d',
    badgeText: '#ffffff'
  },
  friendship_memories: {
    id: 'friendship_memories',
    name: 'Friendship Memories',
    category: 'friendship',
    bgTop: '#fff7ed',
    bgMid: '#ffedd5',
    bgBottom: '#fef3c7',
    borderOuter: '#f97316',
    borderInner: 'rgba(249, 115, 22, 0.4)',
    titleColor: '#9a3412',
    captionColor: '#c2410c',
    subColor: '#78716c',
    panelBorder: '#fdba74',
    cornerDecor: ['💖', '👯', '🌟', '💌'],
    badgeColor: '#f97316',
    badgeText: '#ffffff'
  },
  special_moments: {
    id: 'special_moments',
    name: 'Special Moments',
    category: 'luxury_glitter',
    bgTop: '#18120b',
    bgMid: '#2d1e0f',
    bgBottom: '#1a1309',
    borderOuter: '#eab308',
    borderInner: 'rgba(234, 179, 8, 0.5)',
    titleColor: '#fef08a',
    captionColor: '#fde047',
    subColor: '#d4d4d8',
    panelBorder: '#facc15',
    cornerDecor: ['👑', '✨', '🥂', '🎉'],
    badgeColor: '#eab308',
    badgeText: '#000000'
  }
};

// Aliases for backward compatibility with legacy test suites & saved strips
export const PB_FRAMES = {
  ...PB_TEMPLATES,
  moon_stars: { ...PB_TEMPLATES.dreamy_galaxy, id: 'moon_stars', name: 'Moon & Stars' },
  pastel_flowers: { ...PB_TEMPLATES.pastel_scrapbook, id: 'pastel_flowers', name: 'Pastel Flowers' },
  crystal_dreams: { ...PB_TEMPLATES.dreamy_galaxy, id: 'crystal_dreams', name: 'Crystal Dreams' },
  retro_memories: { ...PB_TEMPLATES.vintage_film, id: 'retro_memories', name: 'Retro Memories' }
};

export const PHOTOBOOTH_FRAMES = PB_FRAMES;
export const PHOTOBOOTH_CAPTIONS = [
  'Our Little Memories',
  'Together, Even From Afar',
  'A Little Moment With You',
  'Forever Besties',
  'A Sweet Starlit Night',
  'Twinkling Smiles'
];
export const PHOTOBOOTH_LAYOUTS = [2, 3, 4];

const PB_STICKER_SETS = {
  stars: ['✦', '★', '✧', '🌟'],
  hearts: ['💖', '💗', '💕', '💘'],
  moons: ['🌙', '☾', '✨', '🪐'],
  flowers: ['🌸', '✿', '🌷', '🍃'],
  vintage: ['🎞️', '🕰️', '📸', '🍂'],
  garden: ['🍃', '🦋', '🌿', '🌱'],
  glamour: ['👑', '✨', '🥂', '🎉'],
  none: []
};

// --- APPLICATION STATE ---
let isPhotoboothInitialized = false;
let currentStage = 'welcome'; // 'welcome' | 'booth' | 'result'

// Identity & Group Selection State
let selectedCharKey = 'abil'; // Default to active detected character
let activeAuthSource = 'session'; // 'firebase' | 'session' | 'manual'
let selectedGroupSize = 1; // 1 to 8 (Solo, Duo, Trio, Squad, etc.)
let selectedParticipants = ['abil']; // [0] is always active user
const participantPhotos = {}; // { [charKey]: dataUrl }

// Room / Multi-User State
let roomMode = 'local'; // 'local' | 'waiting' | 'connected'
let roomRole = null; // null | 'host' | 'guest'
let currentRoomCode = null;
let roomHostChar = null;
let partnerCharKey = null; // Backward-compatible with 2-user rooms
let partnerConnected = false;
let syncChannel = null;

// Camera & Media State
let localStream = null;
let isCameraActive = false;
let isMirrored = true;
let isCapturing = false;
let customSelfImageDataUrl = null;
let customPartnerImageDataUrl = null;
let lastCameraError = null;

// Poses & Strip Customization State
let targetPanelCount = 3; // 2, 3, or 4 panels
let capturedPoses = []; // Preserved across layout changes!
let selectedFrameId = 'classic_photostrip';
let selectedCaption = 'Our Little Memories';
let selectedStickerSet = 'stars';
let showDateStamp = true;

// Cache of loaded Image objects for fast canvas rendering
const imageCache = new Map();

// --- TOAST & FEEDBACK HELPERS ---
function showPhotoboothToast(message) {
  const toast = document.getElementById('universe-toast');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  clearTimeout(window.__pbToastTimer);
  window.__pbToastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3400);
}

function setJoinFeedback(message, isSuccess = false) {
  const box = document.getElementById('pb-join-error-msg');
  if (!box) return;
  if (!message) {
    box.style.display = 'none';
    box.textContent = '';
    box.classList.remove('success');
    return;
  }
  box.style.display = 'block';
  box.textContent = message;
  box.classList.toggle('success', Boolean(isSuccess));
}

function setCameraErrorFeedback(message) {
  lastCameraError = message || null;
  const errEl = document.getElementById('pb-camera-error-msg');
  if (!errEl) return;
  if (!message) {
    errEl.style.display = 'none';
    errEl.textContent = '';
    return;
  }
  errEl.style.display = 'block';
  errEl.textContent = message;
}

export function generateRoomCode() {
  const num = Math.floor(100 + Math.random() * 900);
  return `OLU-${num}`;
}

function readStoredRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROOMS);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function writeStoredRoom(code, roomData) {
  try {
    const rooms = readStoredRooms();
    rooms[code] = {
      ...(rooms[code] || {}),
      ...roomData,
      updatedAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEY_ROOMS, JSON.stringify(rooms));
    return rooms[code];
  } catch (e) {
    return null;
  }
}

/**
 * Reads the active logged-in character accurately from Firebase Auth, Session, or Local Storage.
 * Completely eliminates any hardcode/fallback to "Nyanya (Vanya)".
 */
export function detectLoggedInCharacter() {
  try {
    // 1. Prioritize active Firebase Auth user (Source of Truth)
    if (auth && auth.currentUser) {
      const fromAuth = identifyUserCharacter(auth.currentUser);
      if (fromAuth) {
        const canonKey = fromAuth === 'syma' ? 'abil' : fromAuth;
        if (PB_CHARACTERS[canonKey]) {
          return { charKey: canonKey, mode: 'firebase' };
        }
      }
    }

    // 2. SessionStorage
    if (typeof sessionStorage !== 'undefined') {
      const s = sessionStorage.getItem('activeUniverseSession');
      if (s) {
        const canonKey = s === 'syma' ? 'abil' : s;
        if (PB_CHARACTERS[canonKey]) {
          return { charKey: canonKey, mode: 'session' };
        }
      }
    }

    // 3. LocalStorage dedicated keys
    if (typeof localStorage !== 'undefined') {
      const pbActive = localStorage.getItem('olu_pb_active_char');
      if (pbActive) {
        const canonKey = pbActive === 'syma' ? 'abil' : pbActive;
        if (PB_CHARACTERS[canonKey]) {
          return { charKey: canonKey, mode: 'session' };
        }
      }

      const momActive = localStorage.getItem('olu_moments_active_char_v1');
      if (momActive) {
        const canonKey = momActive === 'syma' ? 'abil' : momActive;
        if (PB_CHARACTERS[canonKey]) {
          return { charKey: canonKey, mode: 'session' };
        }
      }

      const raw = localStorage.getItem(STORAGE_KEY_SESSION);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.characterKey) {
          const canonKey = parsed.characterKey === 'syma' ? 'abil' : parsed.characterKey;
          if (PB_CHARACTERS[canonKey]) {
            return { charKey: canonKey, mode: parsed.mode || 'session' };
          }
        }
      }
    }
  } catch (_) {}

  return null;
}

/**
 * Syncs the active character in Photobooth with the logged-in user account.
 */
export function syncPhotoboothActiveCharacter(charKey, source = 'session') {
  const canon = charKey === 'syma' ? 'abil' : charKey;
  if (!canon || !PB_CHARACTERS[canon]) return;
  activeAuthSource = source;
  setSelectedCharacter(canon, false);
}

/**
 * Updates the active user's character identity across all 8 characters.
 * Guarantees active user is always participant #1.
 */
export function setSelectedCharacter(charKey, notify = true) {
  const canon = charKey === 'syma' ? 'abil' : charKey;
  if (!PB_CHARACTERS[canon]) return;

  // Prevent identity collisions in active multiplayer room
  if (roomMode === 'connected' && partnerConnected && partnerCharKey === canon) {
    showPhotoboothToast(
      `⚠️ Sahabatmu di room ini sudah menggunakan identitas ${PB_CHARACTERS[canon].name}. Pilih identitas lain.`
    );
    return;
  }

  selectedCharKey = canon;
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('olu_pb_active_char', selectedCharKey);
    }
  } catch (_) {}

  // Active user is always participant #1 (index 0)
  const otherParticipants = selectedParticipants.filter((k) => k !== selectedCharKey);
  selectedParticipants = [selectedCharKey, ...otherParticipants.slice(0, selectedGroupSize - 1)];

  if (roomMode === 'waiting' && roomRole === 'host' && currentRoomCode) {
    roomHostChar = selectedCharKey;
    writeStoredRoom(currentRoomCode, { hostChar: selectedCharKey });
  }

  const charMeta = PB_CHARACTERS[selectedCharKey];

  // Update chip buttons
  document.querySelectorAll('.pb-char-chip[data-pb-char]').forEach((btn) => {
    const bKey = btn.dataset.pbChar === 'syma' ? 'abil' : btn.dataset.pbChar;
    btn.classList.toggle('active', bKey === selectedCharKey);
  });

  // Update active identity banner in top bar
  const avatarEl = document.getElementById('pb-active-user-avatar');
  const nameEl = document.getElementById('pb-active-user-name');
  const subEl = document.getElementById('pb-active-user-sub');

  if (avatarEl) {
    avatarEl.src = charMeta.avatar;
    avatarEl.alt = `Avatar ${charMeta.name}`;
  }
  if (nameEl) {
    nameEl.textContent = `${charMeta.symbol} ${charMeta.name}`;
  }
  if (subEl) {
    const authLabel =
      activeAuthSource === 'firebase'
        ? 'Akun Login Aktif'
        : activeAuthSource === 'demo'
          ? 'Sesi Login Aktif'
          : 'Identitas Sesi Aktif';
    subEl.textContent = `Universe ${charMeta.universe} · ${authLabel}`;
  }

  // Update solo poses selfChar metadata
  if (roomMode === 'local') {
    capturedPoses = capturedPoses.map((pose) => ({
      ...pose,
      selfChar: selectedCharKey
    }));
  }

  renderGroupSizePills();
  renderParticipantSelector();
  updateStartButtonState();
  updateRoomPresenceUI();
  renderPosesTray();
  renderPhotoStripCanvas();

  if (notify) {
    showPhotoboothToast(`✦ Identitas aktif diatur sebagai ${charMeta.symbol} ${charMeta.name} (${charMeta.universe})`);
  }
}

// --- GROUP SIZE & PARTICIPANT SELECTION SYSTEM (1–8 PERSONS) ---

export function getSelectedGroupSize() {
  return selectedGroupSize;
}

export function getSelectedParticipants() {
  return [...selectedParticipants];
}

export function setGroupSize(size) {
  const count = Math.max(1, Math.min(8, Number(size) || 1));
  selectedGroupSize = count;

  // Preserve existing selections up to new count, keeping active user first
  const currentOthers = selectedParticipants.filter((k) => k !== selectedCharKey);
  selectedParticipants = [selectedCharKey, ...currentOthers.slice(0, count - 1)];

  renderGroupSizePills();
  renderParticipantSelector();
  updateStartButtonState();
  updateRoomPresenceUI();
  renderPhotoStripCanvas();
}

export function toggleParticipant(charKey) {
  const canon = charKey === 'syma' ? 'abil' : charKey;
  if (!PB_CHARACTERS[canon]) return;

  if (canon === selectedCharKey) {
    showPhotoboothToast(`ℹ️ Kamu (${PB_CHARACTERS[selectedCharKey].name}) adalah peserta utama sesi ini.`);
    return;
  }

  const idx = selectedParticipants.indexOf(canon);
  if (idx >= 0) {
    // Deselect
    selectedParticipants.splice(idx, 1);
  } else {
    // Add if quota allows
    if (selectedParticipants.length < selectedGroupSize) {
      selectedParticipants.push(canon);
    } else {
      const sizeMeta = PB_GROUP_SIZES.find((g) => g.count === selectedGroupSize);
      showPhotoboothToast(
        `⚠️ Kuota ${sizeMeta?.name || selectedGroupSize + ' Orang'} sudah penuh (${selectedGroupSize}/${selectedGroupSize}). Hapus salah satu peserta terlebih dahulu untuk mengganti.`
      );
      return;
    }
  }

  renderParticipantSelector();
  updateStartButtonState();
  updateRoomPresenceUI();
  renderPhotoStripCanvas();
}

export function resetParticipants() {
  selectedParticipants = [selectedCharKey];
  renderParticipantSelector();
  updateStartButtonState();
  updateRoomPresenceUI();
  renderPhotoStripCanvas();
  showPhotoboothToast('🔄 Pilihan peserta direset ke peserta utama.');
}

function renderGroupSizePills() {
  document.querySelectorAll('.pb-group-size-pill[data-pb-group-size]').forEach((btn) => {
    const size = parseInt(btn.dataset.pbGroupSize, 10);
    btn.classList.toggle('active', size === selectedGroupSize);
  });
}

function renderParticipantSelector() {
  const indicator = document.getElementById('pb-participant-count-indicator');
  const count = selectedParticipants.length;
  const isFull = count === selectedGroupSize;

  if (indicator) {
    if (isFull) {
      indicator.textContent = `${count} / ${selectedGroupSize} peserta dipilih (Lengkap ✨)`;
      indicator.style.color = '#86efac';
    } else {
      const needed = selectedGroupSize - count;
      indicator.textContent = `${count} / ${selectedGroupSize} peserta dipilih (Pilih ${needed} lagi)`;
      indicator.style.color = '#fde047';
    }
  }

  const grid = document.getElementById('pb-participant-grid');
  if (grid && typeof document !== 'undefined' && typeof document.createElement === 'function') {
    grid.innerHTML = '';
    ALL_PB_CHARACTERS.forEach((charKey) => {
      const char = PB_CHARACTERS[charKey];
      const isSelected = selectedParticipants.includes(charKey);
      const isSelf = charKey === selectedCharKey;
      const order = selectedParticipants.indexOf(charKey);

      const card = document.createElement('div');
      card.className = `pb-participant-card ${isSelected ? 'selected' : ''} ${isSelf ? 'is-self' : ''}`;
      card.dataset.pbParticipant = charKey;
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', isSelected ? 'true' : 'false');

      let badgeHtml = '';
      if (isSelf) {
        badgeHtml = '<span class="card-badge">Kamu (Utama)</span>';
      } else if (isSelected) {
        badgeHtml = `<span class="card-badge">✓ #${order + 1}</span>`;
      }

      card.innerHTML = `
        ${badgeHtml}
        <img src="${char.avatar}" alt="${char.name}" class="card-avatar" loading="lazy" />
        <span class="card-name">${char.symbol} ${char.name}</span>
        <span class="card-universe">${char.universe}</span>
      `;

      card.addEventListener('click', () => {
        toggleParticipant(charKey);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleParticipant(charKey);
        }
      });

      grid.appendChild(card);
    });
  }
}

function updateStartButtonState() {
  const startBtn = document.getElementById('btn-pb-start');
  if (!startBtn) return;

  const count = selectedParticipants.length;
  const isReady = count === selectedGroupSize;

  if (isReady) {
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    startBtn.style.cursor = 'pointer';
    const sizeMeta = PB_GROUP_SIZES.find((g) => g.count === selectedGroupSize);
    startBtn.textContent = `📷 Masuk Studio Kamera (${sizeMeta?.name || count + ' Peserta'})`;
  } else {
    startBtn.disabled = true;
    startBtn.style.opacity = '0.6';
    startBtn.style.cursor = 'not-allowed';
    startBtn.textContent = `⚠️ Pilih ${selectedGroupSize - count} Peserta Lagi`;
  }
}

/**
 * Switches between Photobooth stages: 'welcome' | 'booth' | 'result'
 */
export function switchPhotoboothStage(stageName) {
  currentStage = stageName;

  const panels = {
    welcome: document.getElementById('pb-stage-welcome'),
    booth: document.getElementById('pb-stage-booth'),
    result: document.getElementById('pb-stage-result')
  };

  Object.entries(panels).forEach(([key, el]) => {
    if (!el) return;
    el.classList.toggle('active', key === stageName);
  });

  document.querySelectorAll('.pb-step-pill[data-pb-step]').forEach((pill) => {
    pill.classList.toggle('active', pill.dataset.pbStep === stageName);
  });

  updateRoomPresenceUI();
  updateCameraControlsUI();

  if (stageName === 'result') {
    renderPhotoStripCanvas();
  }
}

// --- MULTI-USER ROOM SYNCHRONIZATION ---

function initRoomSyncChannel() {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window && !syncChannel) {
    try {
      syncChannel = new BroadcastChannel(CHANNEL_NAME);
      syncChannel.onmessage = (event) => {
        handleIncomingRoomMessage(event.data);
      };
    } catch (err) {
      syncChannel = null;
    }
  }

  if (typeof window !== 'undefined' && !window.__pbStorageSyncBound) {
    window.__pbStorageSyncBound = true;
    window.addEventListener('storage', (event) => {
      if (event.key !== STORAGE_KEY_ROOMS || !currentRoomCode) return;
      syncFromStoredRoomSnapshot(currentRoomCode);
    });
  }
}

function broadcastRoomMessage(payload) {
  if (!syncChannel || !currentRoomCode) return;
  try {
    syncChannel.postMessage({
      ...payload,
      roomCode: currentRoomCode,
      senderChar: selectedCharKey,
      senderRole: roomRole,
      sentAt: Date.now()
    });
  } catch (e) {
    // ignore broadcast error
  }
}

function buildMergedRoomPoses(roomObj) {
  if (!roomObj) return [];
  const hostPoses = Array.isArray(roomObj.hostPoses) ? roomObj.hostPoses : [];
  const guestPoses = Array.isArray(roomObj.guestPoses) ? roomObj.guestPoses : [];
  const maxLen = Math.max(hostPoses.length, guestPoses.length);
  const merged = [];

  for (let i = 0; i < maxLen; i++) {
    const hPose = hostPoses[i] || null;
    const gPose = guestPoses[i] || null;
    const isSelfHost = roomRole === 'host';
    const selfEntry = isSelfHost ? hPose : gPose;
    const partnerEntry = isSelfHost ? gPose : hPose;

    const participantsList = Array.isArray(roomObj.participants) && roomObj.participants.length > 0
      ? roomObj.participants
      : [roomObj.hostChar, roomObj.guestChar].filter(Boolean);

    merged.push({
      id: `room_${roomObj.code}_pose_${i + 1}`,
      poseNumber: i + 1,
      selfImg: selfEntry ? selfEntry.img : null,
      selfChar: isSelfHost ? roomObj.hostChar : (roomObj.guestChar || selectedCharKey),
      partnerImg: partnerEntry ? partnerEntry.img : null,
      partnerChar: isSelfHost ? roomObj.guestChar : roomObj.hostChar,
      hostImg: hPose ? hPose.img : null,
      hostChar: roomObj.hostChar,
      guestImg: gPose ? gPose.img : null,
      guestChar: roomObj.guestChar,
      participants: participantsList,
      photos: {
        ...(roomObj.hostChar && hPose ? { [roomObj.hostChar]: hPose.img } : {}),
        ...(roomObj.guestChar && gPose ? { [roomObj.guestChar]: gPose.img } : {})
      },
      mode: roomObj.guestChar ? 'room_duet' : 'room_waiting',
      timestamp: (selfEntry && selfEntry.timestamp) || (partnerEntry && partnerEntry.timestamp) || ''
    });
  }
  return merged;
}

function syncFromStoredRoomSnapshot(roomCode) {
  if (!roomCode) return;
  const rooms = readStoredRooms();
  const room = rooms[roomCode];
  if (!room) return;

  if (room.status === 'closed') {
    partnerConnected = false;
    partnerCharKey = null;
    roomMode = 'local';
    roomRole = null;
    currentRoomCode = null;
    updateRoomPresenceUI();
    showPhotoboothToast('ℹ️ Room telah ditutup oleh pemilik room.');
    return;
  }

  roomHostChar = room.hostChar;
  const participants = Array.isArray(room.participants) ? room.participants : [room.hostChar, room.guestChar].filter(Boolean);

  if (roomRole === 'host') {
    const guestChar = participants.find((p) => p !== selectedCharKey);
    if (guestChar && PB_CHARACTERS[guestChar]) {
      const wasConnected = partnerConnected;
      partnerCharKey = guestChar;
      partnerConnected = true;
      roomMode = 'connected';
      if (!wasConnected) {
        const guestMeta = PB_CHARACTERS[partnerCharKey];
        showPhotoboothToast(`🎉 ${guestMeta.symbol} ${guestMeta.name} bergabung ke room ${roomCode}!`);
      }
    } else {
      partnerCharKey = null;
      partnerConnected = false;
      roomMode = 'waiting';
    }
  } else if (roomRole === 'guest') {
    partnerCharKey = room.hostChar;
    partnerConnected = Boolean(room.hostChar);
    roomMode = partnerConnected ? 'connected' : 'waiting';
  }

  const partnerPoseList = roomRole === 'host' ? (room.guestPoses || []) : (room.hostPoses || []);
  if (partnerPoseList.length > 0) {
    const latestPartnerPose = partnerPoseList[partnerPoseList.length - 1];
    if (latestPartnerPose && latestPartnerPose.img) {
      customPartnerImageDataUrl = latestPartnerPose.img;
      showPartnerPreview(latestPartnerPose.img);
    }
  }

  capturedPoses = buildMergedRoomPoses(room);
  updateRoomPresenceUI();
  renderPosesTray();
  renderPhotoStripCanvas();
}

function handleIncomingRoomMessage(data) {
  if (!data || !data.roomCode || data.roomCode !== currentRoomCode) return;
  if (data.senderChar === selectedCharKey && data.senderRole === roomRole) return;

  if (data.type === 'PEER_JOINED') {
    syncFromStoredRoomSnapshot(currentRoomCode);
  } else if (data.type === 'PEER_LEFT') {
    syncFromStoredRoomSnapshot(currentRoomCode);
    showPhotoboothToast('ℹ️ Sahabatmu telah keluar dari room.');
  } else if (data.type === 'ROOM_POSES_SYNC') {
    syncFromStoredRoomSnapshot(currentRoomCode);
  } else if (data.type === 'COUNTDOWN_START' && !isCapturing) {
    showPhotoboothToast(`⏱️ Sahabatmu (${PB_CHARACTERS[data.senderChar]?.name || 'Partner'}) memulai hitung mundur foto!`);
  }
}

export function enterLocalPhotoboothMode() {
  setJoinFeedback(null);
  currentRoomCode = null;
  roomMode = 'local';
  roomRole = null;
  roomHostChar = null;
  partnerCharKey = null;
  partnerConnected = false;

  updateRoomPresenceUI();
  renderPosesTray();
  renderPhotoStripCanvas();
  switchPhotoboothStage('booth');
}

export function createPhotoboothRoom() {
  setJoinFeedback(null);
  const newCode = generateRoomCode();
  currentRoomCode = newCode;
  roomMode = 'waiting';
  roomRole = 'host';
  roomHostChar = selectedCharKey;
  partnerCharKey = null;
  partnerConnected = false;
  capturedPoses = [];
  customPartnerImageDataUrl = null;
  hidePartnerPreview();

  writeStoredRoom(newCode, {
    code: newCode,
    hostChar: selectedCharKey,
    maxParticipants: selectedGroupSize,
    targetParticipants: [...selectedParticipants],
    participants: [selectedCharKey],
    guestChar: null,
    status: 'waiting',
    hostPoses: [],
    guestPoses: [],
    createdAt: Date.now()
  });

  updateRoomPresenceUI();
  renderPosesTray();
  renderPhotoStripCanvas();
  switchPhotoboothStage('booth');

  const selfMeta = PB_CHARACTERS[selectedCharKey];
  showPhotoboothToast(
    `🎟️ Room ${newCode} (${selectedGroupSize} Peserta) berhasil dibuat! Kamu (${selfMeta.name}) adalah Pemilik Room. Bagikan kode ke sahabatmu.`
  );
  return newCode;
}

export function joinPhotoboothRoom(rawCode) {
  const cleanCode = (rawCode || '').trim().toUpperCase();
  if (!cleanCode || cleanCode.length < 4) {
    const msg = '⚠️ Masukkan kode undangan room yang valid terlebih dahulu (contoh: OLU-742).';
    setJoinFeedback(msg, false);
    showPhotoboothToast(msg);
    return false;
  }

  const rooms = readStoredRooms();
  const existing = rooms[cleanCode];

  if (!existing || existing.status === 'closed') {
    const msg = `❌ Kode room "${cleanCode}" tidak ditemukan atau sudah ditutup. Pastikan sahabatmu sudah membuat room terlebih dahulu.`;
    setJoinFeedback(msg, false);
    showPhotoboothToast(msg);
    return false;
  }

  const participants = Array.isArray(existing.participants) ? existing.participants : [existing.hostChar, existing.guestChar].filter(Boolean);
  const maxCap = existing.maxParticipants || 2;

  if (participants.includes(selectedCharKey)) {
    const charMeta = PB_CHARACTERS[selectedCharKey];
    const msg = `⚠️ Karakter ${charMeta.symbol} ${charMeta.name} sudah bergabung di room "${cleanCode}". Pilih identitas sahabat lain untuk bergabung.`;
    setJoinFeedback(msg, false);
    showPhotoboothToast(msg);
    return false;
  }

  if (participants.length >= maxCap) {
    const msg = `❌ Room "${cleanCode}" sudah penuh (${participants.length}/${maxCap} peserta).`;
    setJoinFeedback(msg, false);
    showPhotoboothToast(msg);
    return false;
  }

  currentRoomCode = cleanCode;
  roomMode = 'connected';
  roomRole = 'guest';
  roomHostChar = existing.hostChar;
  partnerCharKey = existing.hostChar;
  partnerConnected = true;

  const nextParticipants = [...participants, selectedCharKey];
  const updatedRoom = writeStoredRoom(cleanCode, {
    participants: nextParticipants,
    guestChar: selectedCharKey,
    status: 'connected'
  });

  capturedPoses = buildMergedRoomPoses(updatedRoom || existing);
  setJoinFeedback(`✅ Berhasil terhubung ke room ${cleanCode}!`, true);

  broadcastRoomMessage({
    type: 'PEER_JOINED',
    guestChar: selectedCharKey
  });

  updateRoomPresenceUI();
  renderPosesTray();
  renderPhotoStripCanvas();
  switchPhotoboothStage('booth');

  const hostMeta = PB_CHARACTERS[roomHostChar] || PB_CHARACTERS.nyanya;
  const selfMeta = PB_CHARACTERS[selectedCharKey];
  showPhotoboothToast(
    `💌 Berhasil bergabung ke room ${cleanCode}! Terhubung bersama ${hostMeta.symbol} ${hostMeta.name} & ${selfMeta.symbol} ${selfMeta.name}.`
  );
  return true;
}

export function leavePhotoboothRoom() {
  stopLocalCamera(false);

  if (currentRoomCode) {
    const code = currentRoomCode;
    const rooms = readStoredRooms();
    const existing = rooms[code];
    if (existing) {
      if (roomRole === 'host') {
        writeStoredRoom(code, { status: 'closed', guestChar: null });
      } else if (roomRole === 'guest') {
        const nextParticipants = Array.isArray(existing.participants)
          ? existing.participants.filter((p) => p !== selectedCharKey)
          : [];
        writeStoredRoom(code, { status: 'waiting', participants: nextParticipants, guestChar: null, guestPoses: [] });
      }
    }
    broadcastRoomMessage({ type: 'PEER_LEFT' });
  }

  currentRoomCode = null;
  roomMode = 'local';
  roomRole = null;
  roomHostChar = null;
  partnerCharKey = null;
  partnerConnected = false;

  updateRoomPresenceUI();
  switchPhotoboothStage('welcome');
  showPhotoboothToast('👋 Kamu telah keluar dari sesi room Photobooth.');
}

function updateRoomPresenceUI() {
  const selfChar = PB_CHARACTERS[selectedCharKey] || PB_CHARACTERS.abil;
  const partnerChar = partnerCharKey && PB_CHARACTERS[partnerCharKey] ? PB_CHARACTERS[partnerCharKey] : null;

  const codeDisplay = document.getElementById('pb-room-code-display');
  const copyBtn = document.getElementById('btn-pb-copy-code');
  const selfText = document.getElementById('pb-self-presence-text');
  const partnerText = document.getElementById('pb-partner-presence-text');
  const partnerDot = document.getElementById('pb-partner-status-dot');
  const syncModeBadge = document.getElementById('pb-sync-mode-badge');
  const leaveBtn = document.getElementById('btn-pb-leave-room');

  const localSlotTag = document.getElementById('pb-local-slot-tag');
  const partnerSlotTag = document.getElementById('pb-partner-slot-tag');
  const partnerIcon = document.getElementById('pb-partner-placeholder-icon');
  const partnerTitle = document.getElementById('pb-partner-placeholder-title');
  const partnerDesc = document.getElementById('pb-partner-placeholder-desc');

  if (localSlotTag) {
    localSlotTag.textContent = `📸 Kamera Utama (${selfChar.symbol} ${selfChar.name})`;
  }

  const groupMeta = PB_GROUP_SIZES.find((g) => g.count === selectedGroupSize);
  const groupLabel = groupMeta ? `${groupMeta.name} (${groupMeta.count} Orang)` : `${selectedGroupSize} Orang`;

  if (roomMode === 'local' || !currentRoomCode) {
    if (codeDisplay) codeDisplay.textContent = `MODE LOKAL — ${groupLabel.toUpperCase()}`;
    if (copyBtn) copyBtn.style.display = 'none';
    if (leaveBtn) leaveBtn.textContent = '← Kembali ke Menu Room';
    if (syncModeBadge) {
      syncModeBadge.textContent = `🟢 Mode Lokal (${selectedParticipants.length} Peserta Terpilih)`;
      syncModeBadge.style.color = '#86efac';
    }
    if (selfText) {
      selfText.textContent = `${selfChar.symbol} Pengguna Aktif: ${selfChar.name}`;
    }
    if (partnerDot) partnerDot.classList.add('waiting');
    if (partnerText) {
      partnerText.textContent = selectedGroupSize > 1
        ? `👥 ${selectedParticipants.length}/${selectedGroupSize} Peserta Siap`
        : '👤 Sesi Solo (1 Peserta)';
    }
    if (partnerSlotTag) partnerSlotTag.textContent = '💌 Slot Foto Sahabat (Opsional)';
    if (partnerIcon) partnerIcon.textContent = '✨';
    if (partnerTitle) partnerTitle.textContent = `Studio Foto ${groupLabel}`;
    if (partnerDesc) {
      partnerDesc.textContent = selectedGroupSize > 1
        ? `Sesi foto bersama ${selectedParticipants.map((k) => PB_CHARACTERS[k]?.name).join(', ')}. Nyalakan kamera untuk mulai!`
        : 'Sesi foto solo untukmu. Kamu juga bisa membuat/bergabung ke Room jika ingin berfoto multiplayer.';
    }
  } else if (roomMode === 'waiting') {
    if (codeDisplay) codeDisplay.textContent = currentRoomCode;
    if (copyBtn) copyBtn.style.display = 'inline-flex';
    if (leaveBtn) leaveBtn.textContent = '⎋ Tutup & Keluar Room';
    if (syncModeBadge) {
      syncModeBadge.textContent = `🟡 Room ${currentRoomCode} Aktif — Menunggu Sahabat Bergabung...`;
      syncModeBadge.style.color = '#fde68a';
    }
    if (selfText) {
      selfText.textContent = `👑 Pemilik Room (Host): ${selfChar.symbol} ${selfChar.name}`;
    }
    if (partnerDot) partnerDot.classList.add('waiting');
    if (partnerText) {
      partnerText.textContent = '⏳ Menunggu peserta lain bergabung';
    }
    if (partnerSlotTag) partnerSlotTag.textContent = '⏳ Slot Sahabat (Menunggu)';
    if (partnerIcon) partnerIcon.textContent = '⏳';
    if (partnerTitle) partnerTitle.textContent = 'Menunggu Sahabat Bergabung...';
    if (partnerDesc) {
      partnerDesc.textContent = `Bagikan kode "${currentRoomCode}" ke sahabatmu agar mereka dapat bergabung ke room ini.`;
    }
  } else if (roomMode === 'connected' && partnerChar) {
    const hostMeta = PB_CHARACTERS[roomHostChar] || selfChar;
    const guestMeta = roomRole === 'host' ? partnerChar : selfChar;

    if (codeDisplay) codeDisplay.textContent = currentRoomCode;
    if (copyBtn) copyBtn.style.display = 'inline-flex';
    if (leaveBtn) leaveBtn.textContent = '⎋ Keluar dari Room';
    if (syncModeBadge) {
      syncModeBadge.textContent = `🟢 Room ${currentRoomCode} Terhubung — ${hostMeta.symbol} ${hostMeta.name} & ${guestMeta.symbol} ${guestMeta.name}`;
      syncModeBadge.style.color = '#86efac';
    }
    if (selfText) {
      const roleLabel = roomRole === 'host' ? '👑 Host' : '🤝 Guest';
      selfText.textContent = `${roleLabel}: ${selfChar.symbol} ${selfChar.name} (Kamu)`;
    }
    if (partnerDot) partnerDot.classList.remove('waiting');
    if (partnerText) {
      partnerText.textContent = `🤝 Terhubung: ${partnerChar.symbol} ${partnerChar.name}`;
    }
    if (partnerSlotTag) partnerSlotTag.textContent = `📸 Kamera ${partnerChar.symbol} ${partnerChar.name}`;
    if (partnerIcon) partnerIcon.textContent = partnerChar.symbol;
    if (partnerTitle) partnerTitle.textContent = `${partnerChar.name} Telah Terhubung!`;
    if (partnerDesc) {
      partnerDesc.textContent = `Ambil pose foto bersama ${partnerChar.name}. Pose foto kalian akan otomatis digabungkan ke strip foto!`;
    }
  }
}

// --- CAMERA LIFECYCLE & WORKSPACE ---

function updateCameraControlsUI() {
  const toggleCamBtn = document.getElementById('btn-pb-toggle-camera');
  const statusText = document.getElementById('pb-camera-status-text');
  const captureBtn = document.getElementById('btn-pb-capture-pose');
  const retakeBtn = document.getElementById('btn-pb-retake-pose');

  if (toggleCamBtn) {
    toggleCamBtn.textContent = isCameraActive ? '📷 Matikan Kamera' : '📹 Nyalakan Kamera';
  }

  if (statusText) {
    if (isCapturing) {
      statusText.textContent = '⏱️ Menghitung mundur...';
      statusText.style.color = '#fde047';
    } else if (isCameraActive) {
      statusText.textContent = '🟢 Kamera Aktif';
      statusText.style.color = '#86efac';
    } else if (customSelfImageDataUrl) {
      statusText.textContent = '🖼️ Foto Manual Terpasang';
      statusText.style.color = '#93c5fd';
    } else {
      statusText.textContent = '⚪ Kamera Nonaktif';
      statusText.style.color = '#cbd5e1';
    }
  }

  if (captureBtn) {
    captureBtn.disabled = isCapturing;
    captureBtn.style.opacity = isCapturing ? '0.6' : '1';
  }

  if (retakeBtn) {
    retakeBtn.disabled = isCapturing || capturedPoses.length === 0;
    retakeBtn.style.opacity = (isCapturing || capturedPoses.length === 0) ? '0.5' : '1';
  }
}

export async function startLocalCamera() {
  setCameraErrorFeedback(null);
  const videoEl = document.getElementById('pb-local-video');
  const placeholderEl = document.getElementById('pb-local-placeholder');
  const fallbackImg = document.getElementById('pb-local-fallback-img');

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    const msg = '⚠️ Browser ini tidak mendukung akses kamera langsung. Kamu bisa mengunggah file foto secara manual.';
    setCameraErrorFeedback(msg);
    showPhotoboothToast(msg);
    return false;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 960 },
        facingMode: 'user'
      },
      audio: false
    });

    localStream = stream;
    isCameraActive = true;

    if (videoEl) {
      videoEl.srcObject = stream;
      videoEl.style.display = 'block';
      videoEl.classList.toggle('mirrored', isMirrored);
      await videoEl.play().catch(() => {});
    }

    if (placeholderEl) placeholderEl.style.display = 'none';
    if (fallbackImg) fallbackImg.style.display = 'none';

    updateCameraControlsUI();
    showPhotoboothToast('📹 Kamera berhasil diaktifkan!');
    return true;
  } catch (err) {
    isCameraActive = false;
    let friendlyMsg = '⚠️ Akses kamera ditolak atau tidak tersedia.';
    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
      friendlyMsg = '🔒 Izin kamera ditolak. Berikan izin akses kamera di pengaturan browsermu, atau gunakan fitur "Unggah Manual".';
    } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
      friendlyMsg = '📷 Kamera tidak ditemukan pada perangkat ini. Gunakan fitur "Unggah Manual".';
    }
    setCameraErrorFeedback(friendlyMsg);
    showPhotoboothToast(friendlyMsg);
    updateCameraControlsUI();
    return false;
  }
}

export function stopLocalCamera(notify = true) {
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      try {
        track.stop();
      } catch (e) {
        // ignore track stop error
      }
    });
    localStream = null;
  }
  isCameraActive = false;

  const videoEl = document.getElementById('pb-local-video');
  const placeholderEl = document.getElementById('pb-local-placeholder');
  const fallbackImg = document.getElementById('pb-local-fallback-img');

  if (videoEl) {
    videoEl.srcObject = null;
    videoEl.style.display = 'none';
  }

  if (customSelfImageDataUrl && fallbackImg) {
    fallbackImg.src = customSelfImageDataUrl;
    fallbackImg.style.display = 'block';
    if (placeholderEl) placeholderEl.style.display = 'none';
  } else {
    if (fallbackImg) fallbackImg.style.display = 'none';
    if (placeholderEl) placeholderEl.style.display = 'flex';
  }

  updateCameraControlsUI();

  if (notify) {
    showPhotoboothToast('⏹️ Kamera dimatikan.');
  }
}

function showLocalFramePreview(dataUrl) {
  const videoEl = document.getElementById('pb-local-video');
  const placeholderEl = document.getElementById('pb-local-placeholder');
  const fallbackImg = document.getElementById('pb-local-fallback-img');

  if (!isCameraActive && fallbackImg) {
    fallbackImg.src = dataUrl;
    fallbackImg.style.display = 'block';
    if (videoEl) videoEl.style.display = 'none';
    if (placeholderEl) placeholderEl.style.display = 'none';
  }
  updateCameraControlsUI();
}

function showPartnerPreview(dataUrl) {
  const partnerImg = document.getElementById('pb-partner-preview-img');
  const partnerPlaceholder = document.getElementById('pb-partner-placeholder');
  const clearBtn = document.getElementById('btn-pb-clear-partner');
  if (partnerImg && dataUrl) {
    partnerImg.src = dataUrl;
    partnerImg.style.display = 'block';
  }
  if (partnerPlaceholder && dataUrl) {
    partnerPlaceholder.style.display = 'none';
  }
  if (clearBtn) {
    clearBtn.style.display = dataUrl ? 'inline-flex' : 'none';
  }
}

function hidePartnerPreview() {
  const partnerImg = document.getElementById('pb-partner-preview-img');
  const partnerPlaceholder = document.getElementById('pb-partner-placeholder');
  const clearBtn = document.getElementById('btn-pb-clear-partner');
  if (partnerImg) {
    partnerImg.removeAttribute('src');
    partnerImg.style.display = 'none';
  }
  if (partnerPlaceholder) {
    partnerPlaceholder.style.display = 'flex';
  }
  if (clearBtn) {
    clearBtn.style.display = 'none';
  }
}

function captureCurrentSelfFrame() {
  const videoEl = document.getElementById('pb-local-video');

  if (isCameraActive && videoEl && videoEl.readyState >= 2 && videoEl.videoWidth > 0) {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    const vw = videoEl.videoWidth;
    const vh = videoEl.videoHeight;
    const targetAspect = canvas.width / canvas.height;
    const videoAspect = vw / vh;

    let sx = 0;
    let sy = 0;
    let sw = vw;
    let sh = vh;

    if (videoAspect > targetAspect) {
      sw = vh * targetAspect;
      sx = (vw - sw) / 2;
    } else {
      sh = vw / targetAspect;
      sy = (vh - sh) / 2;
    }

    ctx.save();
    if (isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(videoEl, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    return canvas.toDataURL('image/png');
  }

  if (customSelfImageDataUrl) {
    return customSelfImageDataUrl;
  }

  // Fallback to active character's HD avatar if camera is simulated in headless mode
  const activeChar = PB_CHARACTERS[selectedCharKey];
  return activeChar ? activeChar.avatar : null;
}

export async function triggerCountdownAndCapture() {
  if (isCapturing) return;

  if (!isCameraActive && !customSelfImageDataUrl) {
    showPhotoboothToast('⚠️ Nyalakan kamera terlebih dahulu (atau pilih file foto) sebelum mengambil pose!');
    updateCameraControlsUI();
    return;
  }

  if (capturedPoses.length >= targetPanelCount) {
    showPhotoboothToast(
      `✨ Semua ${targetPanelCount} slot pose untuk layout ${targetPanelCount} Panel sudah terisi! Klik "Ulangi Pose Terakhir", pilih layout 4 Panel, atau lanjut ke Hasil Photo Strip.`
    );
    return;
  }

  isCapturing = true;
  updateCameraControlsUI();

  const timerSelect = document.getElementById('pb-timer-select');
  const seconds = timerSelect ? parseInt(timerSelect.value, 10) || 0 : 3;
  const overlay = document.getElementById('pb-countdown-overlay');
  const numberEl = document.getElementById('pb-countdown-number');
  const flashEl = document.getElementById('pb-shutter-flash');

  broadcastRoomMessage({ type: 'COUNTDOWN_START', seconds });

  if (seconds > 0 && overlay && numberEl) {
    overlay.classList.add('active');
    for (let remaining = seconds; remaining >= 1; remaining--) {
      numberEl.textContent = String(remaining);
      await new Promise((resolve) => setTimeout(resolve, 650));
    }
    overlay.classList.remove('active');
  }

  if (flashEl) {
    flashEl.classList.add('flash');
    setTimeout(() => flashEl.classList.remove('flash'), 220);
  }

  const selfDataUrl = captureCurrentSelfFrame();
  if (!selfDataUrl) {
    isCapturing = false;
    updateCameraControlsUI();
    showPhotoboothToast('⚠️ Gagal menangkap frame dari kamera. Pastikan kamera masih menyala.');
    return;
  }

  const nowTime = new Date().toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (currentRoomCode && (roomMode === 'waiting' || roomMode === 'connected')) {
    const rooms = readStoredRooms();
    const room = rooms[currentRoomCode] || {
      code: currentRoomCode,
      hostChar: roomHostChar || selectedCharKey,
      guestChar: roomRole === 'guest' ? selectedCharKey : partnerCharKey,
      status: partnerConnected ? 'connected' : 'waiting',
      hostPoses: [],
      guestPoses: []
    };

    const poseRecord = {
      img: selfDataUrl,
      charKey: selectedCharKey,
      timestamp: nowTime
    };

    if (roomRole === 'host') {
      const nextHostPoses = Array.isArray(room.hostPoses) ? [...room.hostPoses, poseRecord] : [poseRecord];
      const updated = writeStoredRoom(currentRoomCode, { hostPoses: nextHostPoses });
      capturedPoses = buildMergedRoomPoses(updated);
    } else {
      const nextGuestPoses = Array.isArray(room.guestPoses) ? [...room.guestPoses, poseRecord] : [poseRecord];
      const updated = writeStoredRoom(currentRoomCode, { guestPoses: nextGuestPoses });
      capturedPoses = buildMergedRoomPoses(updated);
    }

    broadcastRoomMessage({ type: 'ROOM_POSES_SYNC' });
  } else {
    // Local Group Photo Mode (1 to 8 Characters)
    const poseNumber = capturedPoses.length + 1;
    const posePhotos = {
      [selectedCharKey]: selfDataUrl
    };

    // Gather or synthesize photos for all selected participants
    selectedParticipants.forEach((pKey) => {
      if (pKey === selectedCharKey) return;
      if (participantPhotos[pKey]) {
        posePhotos[pKey] = participantPhotos[pKey];
      } else if (pKey === partnerCharKey && customPartnerImageDataUrl) {
        posePhotos[pKey] = customPartnerImageDataUrl;
      } else {
        const charMeta = PB_CHARACTERS[pKey];
        posePhotos[pKey] = charMeta ? charMeta.avatar : selfDataUrl;
      }
    });

    capturedPoses.push({
      id: `pose_${Date.now()}_${poseNumber}`,
      poseNumber,
      selfImg: selfDataUrl,
      selfChar: selectedCharKey,
      partnerImg: customPartnerImageDataUrl || posePhotos[selectedParticipants[1]] || null,
      partnerChar: selectedParticipants[1] || null,
      hostImg: selfDataUrl,
      hostChar: selectedCharKey,
      guestImg: customPartnerImageDataUrl || posePhotos[selectedParticipants[1]] || null,
      guestChar: selectedParticipants[1] || null,
      participants: [...selectedParticipants],
      photos: posePhotos,
      mode: selectedGroupSize > 1 ? 'group_photo' : 'local_solo',
      timestamp: nowTime
    });
  }

  renderPosesTray();
  renderPhotoStripCanvas();

  isCapturing = false;
  updateCameraControlsUI();

  const activeCount = Math.min(capturedPoses.length, targetPanelCount);
  if (activeCount >= targetPanelCount) {
    showPhotoboothToast(
      `🎉 Pose #${activeCount}/${targetPanelCount} berhasil diambil! Semua slot lengkap — klik "Lihat & Hias Hasil Photo Strip".`
    );
  } else {
    showPhotoboothToast(`📸 Pose #${activeCount}/${targetPanelCount} tersimpan!`);
  }
}

export function retakeLastPose() {
  if (capturedPoses.length === 0) {
    showPhotoboothToast('ℹ️ Belum ada pose yang diambil untuk diulangi.');
    return;
  }
  const removedIndex = capturedPoses.length - 1;
  removePoseAtIndex(removedIndex);
  showPhotoboothToast(`↺ Pose #${removedIndex + 1} dihapus. Silakan ambil ulang pose tersebut.`);
}

function removePoseAtIndex(idx) {
  if (idx < 0 || idx >= capturedPoses.length) return;

  if (currentRoomCode && (roomMode === 'waiting' || roomMode === 'connected')) {
    const rooms = readStoredRooms();
    const room = rooms[currentRoomCode];
    if (room) {
      if (roomRole === 'host' && Array.isArray(room.hostPoses)) {
        const nextHostPoses = room.hostPoses.filter((_, i) => i !== idx);
        const updated = writeStoredRoom(currentRoomCode, { hostPoses: nextHostPoses });
        capturedPoses = buildMergedRoomPoses(updated);
      } else if (roomRole === 'guest' && Array.isArray(room.guestPoses)) {
        const nextGuestPoses = room.guestPoses.filter((_, i) => i !== idx);
        const updated = writeStoredRoom(currentRoomCode, { guestPoses: nextGuestPoses });
        capturedPoses = buildMergedRoomPoses(updated);
      }
      broadcastRoomMessage({ type: 'ROOM_POSES_SYNC' });
    }
  } else {
    capturedPoses.splice(idx, 1);
    capturedPoses.forEach((p, i) => {
      p.poseNumber = i + 1;
    });
  }

  renderPosesTray();
  renderPhotoStripCanvas();
  updateCameraControlsUI();
}

function renderPosesTray() {
  const listEl = document.getElementById('pb-poses-list');
  const counterEl = document.getElementById('pb-pose-counter');
  if (!listEl || typeof document.createElement !== 'function') return;

  const filledInLayout = Math.min(capturedPoses.length, targetPanelCount);
  if (counterEl) {
    const extraNote =
      capturedPoses.length > targetPanelCount
        ? ` (+${capturedPoses.length - targetPanelCount} tersimpan)`
        : '';
    counterEl.textContent = `${filledInLayout} / ${targetPanelCount} Pose${extraNote}`;
  }

  listEl.innerHTML = '';

  for (let i = 0; i < targetPanelCount; i++) {
    const pose = capturedPoses[i] || null;
    const item = document.createElement('div');
    item.className = 'pb-pose-slot-item';

    if (pose && (pose.selfImg || pose.hostImg || pose.guestImg || (pose.photos && Object.keys(pose.photos).length > 0))) {
      const primaryThumb = pose.selfImg || pose.hostImg || (pose.photos && pose.photos[selectedCharKey]);
      const selfMeta = PB_CHARACTERS[pose.selfChar || selectedCharKey] || PB_CHARACTERS.abil;
      const countPart = pose.participants ? pose.participants.length : (pose.partnerChar ? 2 : 1);

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.55rem;">
          <div class="pb-pose-thumbs">
            ${primaryThumb ? `<img src="${primaryThumb}" alt="Pose ${i + 1}" class="pb-pose-thumb" />` : ''}
          </div>
          <div>
            <div style="font-size: 0.78rem; font-weight: 700; color: #ffffff;">
              Slot Pose #${i + 1} · Tersimpan
            </div>
            <div style="font-size: 0.68rem; color: #cbd5e1;">
              ${selfMeta.symbol} ${selfMeta.name} (${countPart} Sahabat) ${pose.timestamp ? `· ${pose.timestamp}` : ''}
            </div>
          </div>
        </div>
        <button type="button" class="pb-btn-mini danger" data-remove-pose="${i}" style="padding: 0.28rem 0.55rem; font-size: 0.72rem;">
          ✕ Hapus
        </button>
      `;
    } else {
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.55rem;">
          <div class="pb-pose-thumb-empty">
            #${i + 1}
          </div>
          <div>
            <div style="font-size: 0.78rem; font-weight: 600; color: #e2e8f0;">
              Slot Pose #${i + 1} · Kosong
            </div>
            <div style="font-size: 0.68rem; color: #94a3b8;">
              Belum ada foto untuk slot ini
            </div>
          </div>
        </div>
        <span style="font-size: 0.68rem; color: #fde68a; font-weight: 600;">Menunggu</span>
      `;
    }

    listEl.appendChild(item);
  }

  listEl.querySelectorAll('[data-remove-pose]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.removePose, 10);
      removePoseAtIndex(idx);
    });
  });

  updateStripCompletionBanner();
}

export function isPhotoStripComplete() {
  if (capturedPoses.length < targetPanelCount) return false;
  for (let i = 0; i < targetPanelCount; i++) {
    const pose = capturedPoses[i];
    if (!pose || (!pose.selfImg && !pose.hostImg && !pose.guestImg && (!pose.photos || Object.keys(pose.photos).length === 0))) {
      return false;
    }
  }
  return true;
}

function updateStripCompletionBanner() {
  const banner = document.getElementById('pb-strip-completion-status');
  const downloadBtn = document.getElementById('btn-pb-download');
  const downloadLabel = document.getElementById('pb-download-btn-label');

  const complete = isPhotoStripComplete();
  const filledCount = Math.min(
    capturedPoses.filter((p) => p && (p.selfImg || p.hostImg || p.guestImg || (p.photos && Object.keys(p.photos).length > 0))).length,
    targetPanelCount
  );
  const remaining = Math.max(0, targetPanelCount - filledCount);

  if (banner) {
    banner.classList.toggle('complete', complete);
    if (complete) {
      banner.textContent = `✅ Photo Strip lengkap (${targetPanelCount}/${targetPanelCount} pose terisi) dan siap diunduh!`;
    } else {
      banner.textContent = `⚠️ Photo Strip belum lengkap (${filledCount}/${targetPanelCount} pose). Ambil ${remaining} foto pose lagi di Studio Kamera sebelum mengunduh.`;
    }
  }

  if (downloadBtn) {
    downloadBtn.disabled = !complete;
  }
  const saveCloudBtn = document.getElementById('btn-pb-save-cloud');
  if (saveCloudBtn) {
    saveCloudBtn.disabled = !complete;
    saveCloudBtn.style.opacity = complete ? '1' : '0.5';
    saveCloudBtn.style.cursor = complete ? 'pointer' : 'not-allowed';
  }
  if (downloadLabel) {
    downloadLabel.textContent = complete
      ? 'Unduh Photo Strip (PNG)'
      : `Lengkapi ${remaining} Pose Lagi Untuk Mengunduh`;
  }
}

function loadImageElement(src) {
  if (!src) return Promise.resolve(null);
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src));
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawCoverImage(ctx, img, x, y, w, h, radius = 12) {
  if (!img) return;
  ctx.save();
  drawRoundedRect(ctx, x, y, w, h, radius);
  ctx.clip();

  const imgAspect = img.width / img.height;
  const boxAspect = w / h;
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;

  if (imgAspect > boxAspect) {
    sw = img.height * boxAspect;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / boxAspect;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

// --- CANVAS RENDERING WITH 8 TEMPLATES & 1–8 PARTICIPANTS ---

export async function renderPhotoStripCanvas() {
  const canvas = document.getElementById('pb-strip-canvas');
  if (!canvas) return;

  updateStripCompletionBanner();

  const template = PB_FRAMES[selectedFrameId] || PB_TEMPLATES.classic_photostrip;
  const stickers = PB_STICKER_SETS[selectedStickerSet] || [];
  const panelCount = targetPanelCount;
  const partCount = selectedParticipants.length;

  const width = 560;
  const headerHeight = 110;
  let rowHeight = 200;
  if (partCount >= 4) {
    rowHeight = 250;
  } else if (partCount === 3) {
    rowHeight = 185;
  }
  const rowGap = 16;
  const footerHeight = 145;
  const totalHeight = headerHeight + panelCount * rowHeight + (panelCount - 1) * rowGap + footerHeight;

  canvas.width = width;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');

  // 1. Background Gradient based on template
  const bgGrad = ctx.createLinearGradient(0, 0, 0, totalHeight);
  bgGrad.addColorStop(0, template.bgTop);
  bgGrad.addColorStop(0.5, template.bgMid);
  bgGrad.addColorStop(1, template.bgBottom);
  ctx.fillStyle = bgGrad;
  drawRoundedRect(ctx, 0, 0, width, totalHeight, 22);
  ctx.fill();

  // 2. Template-Specific Visual Flourishes
  if (template.category === 'film_35mm' || template.id === 'vintage_film') {
    // 35mm film sprocket holes along both margins
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    const sprocketH = 9;
    const sprocketW = 13;
    const sprocketSpacing = 22;
    const totalSprockets = Math.floor(totalHeight / sprocketSpacing);
    for (let s = 0; s < totalSprockets; s++) {
      const sy = s * sprocketSpacing + 8;
      drawRoundedRect(ctx, 7, sy, sprocketW, sprocketH, 2.5);
      ctx.fill();
      drawRoundedRect(ctx, width - 7 - sprocketW, sy, sprocketW, sprocketH, 2.5);
      ctx.fill();
    }
  } else if (template.category === 'galaxy' || template.id === 'dreamy_galaxy') {
    // Starlight & cosmic sparkles
    ctx.save();
    for (let s = 0; s < 42; s++) {
      const sx = ((s * 137.5) % (width - 40)) + 20;
      const sy = ((s * 283.3) % (totalHeight - 40)) + 20;
      const size = (s % 3) + 1;
      ctx.globalAlpha = 0.35 + ((s % 5) * 0.12);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
      if (s % 6 === 0) {
        ctx.fillStyle = '#c084fc';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✦', sx, sy);
      }
    }
    ctx.restore();
  }

  // Outer & Inner Borders
  ctx.strokeStyle = template.borderOuter;
  ctx.lineWidth = 4.5;
  drawRoundedRect(ctx, 8, 8, width - 16, totalHeight - 16, 18);
  ctx.stroke();

  ctx.strokeStyle = template.borderInner;
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 16, 16, width - 32, totalHeight - 32, 14);
  ctx.stroke();

  // 3. Header Title & Subtitle
  ctx.fillStyle = template.titleColor;
  ctx.font = 'bold 22px "Cinzel", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`✦ ${template.name.toUpperCase()} ✦`, width / 2, 54);

  const rosterString = selectedParticipants
    .map((k) => {
      const m = PB_CHARACTERS[k];
      return m ? `${m.symbol} ${m.name}` : k;
    })
    .join('  ×  ');

  const groupMeta = PB_GROUP_SIZES.find((g) => g.count === partCount);
  const groupLabel = groupMeta ? groupMeta.name : `${partCount} Peserta`;

  ctx.fillStyle = template.subColor;
  ctx.font = 'italic 15px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(`${rosterString} · ${groupLabel}`, width / 2, 82);

  // 4. Render Panel Rows (1..targetPanelCount)
  const padX = 36;
  const innerWidth = width - padX * 2;
  const slotGap = 12;

  for (let i = 0; i < panelCount; i++) {
    const rowY = headerHeight + i * (rowHeight + rowGap);
    const pose = capturedPoses[i] || null;

    if (!pose || (!pose.selfImg && !pose.hostImg && !pose.guestImg && (!pose.photos || Object.keys(pose.photos).length === 0))) {
      // Empty Slot Placeholder
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      drawRoundedRect(ctx, padX, rowY, innerWidth, rowHeight, 14);
      ctx.fill();

      ctx.strokeStyle = template.panelBorder;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      drawRoundedRect(ctx, padX, rowY, innerWidth, rowHeight, 14);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = template.titleColor;
      ctx.font = 'bold 15px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(`SLOT FOTO POSE #${i + 1} MASIH KOSONG`, width / 2, rowY + rowHeight / 2 - 6);

      ctx.fillStyle = template.subColor;
      ctx.font = '500 12px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Ambil foto di Studio Kamera untuk mengisi panel ini', width / 2, rowY + rowHeight / 2 + 16);
      ctx.restore();
      continue;
    }

    // Render Participant Photos in this row
    if (partCount === 1) {
      // Solo Mode (1 Full-Width Photo)
      const soloSrc = pose.selfImg || (pose.photos && pose.photos[selectedCharKey]);
      const soloImg = await loadImageElement(soloSrc);

      if (template.category === 'polaroid') {
        // Polaroid card backing
        ctx.fillStyle = '#ffffff';
        drawRoundedRect(ctx, padX, rowY, innerWidth, rowHeight, 10);
        ctx.fill();
        if (soloImg) drawCoverImage(ctx, soloImg, padX + 8, rowY + 8, innerWidth - 16, rowHeight - 40, 8);
      } else {
        if (soloImg) drawCoverImage(ctx, soloImg, padX, rowY, innerWidth, rowHeight, 12);
        ctx.strokeStyle = template.panelBorder;
        ctx.lineWidth = 2.5;
        drawRoundedRect(ctx, padX, rowY, innerWidth, rowHeight, 12);
        ctx.stroke();
      }

      // Character Badge
      const charMeta = PB_CHARACTERS[selectedCharKey];
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      drawRoundedRect(ctx, padX + 10, rowY + rowHeight - 28, 110, 20, 10);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${charMeta.symbol} ${charMeta.name}`, padX + 18, rowY + rowHeight - 14);
    } else if (partCount === 2) {
      // Duo Mode (2 Columns)
      const colWidth = (innerWidth - slotGap) / 2;
      const leftKey = selectedParticipants[0];
      const rightKey = selectedParticipants[1];

      const leftSrc = (pose.photos && pose.photos[leftKey]) || pose.selfImg || pose.hostImg;
      const rightSrc = (pose.photos && pose.photos[rightKey]) || pose.partnerImg || pose.guestImg;

      const [leftImg, rightImg] = await Promise.all([
        loadImageElement(leftSrc),
        loadImageElement(rightSrc)
      ]);

      // Left Slot
      if (leftImg) drawCoverImage(ctx, leftImg, padX, rowY, colWidth, rowHeight, 12);
      ctx.strokeStyle = template.panelBorder;
      ctx.lineWidth = 2.5;
      drawRoundedRect(ctx, padX, rowY, colWidth, rowHeight, 12);
      ctx.stroke();

      const leftMeta = PB_CHARACTERS[leftKey] || PB_CHARACTERS.abil;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      drawRoundedRect(ctx, padX + 8, rowY + rowHeight - 26, 92, 18, 9);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 10.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${leftMeta.symbol} ${leftMeta.name}`, padX + 14, rowY + rowHeight - 13);

      // Right Slot
      const rightX = padX + colWidth + slotGap;
      if (rightImg) drawCoverImage(ctx, rightImg, rightX, rowY, colWidth, rowHeight, 12);
      ctx.strokeStyle = template.panelBorder;
      ctx.lineWidth = 2.5;
      drawRoundedRect(ctx, rightX, rowY, colWidth, rowHeight, 12);
      ctx.stroke();

      const rightMeta = PB_CHARACTERS[rightKey] || PB_CHARACTERS.nyanya;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      drawRoundedRect(ctx, rightX + colWidth - 98, rowY + rowHeight - 26, 92, 18, 9);
      ctx.fill();
      ctx.fillStyle = '#fbcfe8';
      ctx.textAlign = 'right';
      ctx.fillText(`${rightMeta.symbol} ${rightMeta.name}`, rightX + colWidth - 14, rowY + rowHeight - 13);
    } else if (partCount === 3) {
      // Trio Mode (3 Columns)
      const colWidth = (innerWidth - slotGap * 2) / 3;
      for (let c = 0; c < 3; c++) {
        const pKey = selectedParticipants[c];
        const pSrc = (pose.photos && pose.photos[pKey]) || (c === 0 ? pose.selfImg : PB_CHARACTERS[pKey]?.avatar);
        const pImg = await loadImageElement(pSrc);
        const colX = padX + c * (colWidth + slotGap);

        if (pImg) drawCoverImage(ctx, pImg, colX, rowY, colWidth, rowHeight, 10);
        ctx.strokeStyle = template.panelBorder;
        ctx.lineWidth = 2;
        drawRoundedRect(ctx, colX, rowY, colWidth, rowHeight, 10);
        ctx.stroke();

        const pMeta = PB_CHARACTERS[pKey] || PB_CHARACTERS.abil;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        drawRoundedRect(ctx, colX + 4, rowY + rowHeight - 22, colWidth - 8, 16, 8);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 9.5px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${pMeta.symbol} ${pMeta.name}`, colX + colWidth / 2, rowY + rowHeight - 10);
      }
    } else {
      // Multi-User Grid Mode (4 to 8 Participants: 2 Rows of Columns)
      const cols = partCount <= 4 ? 2 : (partCount <= 6 ? 3 : 4);
      const rows = 2;
      const cellW = (innerWidth - slotGap * (cols - 1)) / cols;
      const cellH = (rowHeight - slotGap) / rows;

      for (let pIdx = 0; pIdx < partCount; pIdx++) {
        const c = pIdx % cols;
        const r = Math.floor(pIdx / cols);
        const pKey = selectedParticipants[pIdx];
        const pSrc = (pose.photos && pose.photos[pKey]) || (pIdx === 0 ? pose.selfImg : PB_CHARACTERS[pKey]?.avatar);
        const pImg = await loadImageElement(pSrc);
        const cellX = padX + c * (cellW + slotGap);
        const cellY = rowY + r * (cellH + slotGap);

        if (pImg) drawCoverImage(ctx, pImg, cellX, cellY, cellW, cellH, 8);
        ctx.strokeStyle = template.panelBorder;
        ctx.lineWidth = 1.5;
        drawRoundedRect(ctx, cellX, cellY, cellW, cellH, 8);
        ctx.stroke();

        const pMeta = PB_CHARACTERS[pKey] || PB_CHARACTERS.abil;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        drawRoundedRect(ctx, cellX + 3, cellY + cellH - 18, cellW - 6, 14, 7);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8.5px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${pMeta.symbol} ${pMeta.name}`, cellX + cellW / 2, cellY + cellH - 7);
      }
    }

    // Washi Tape Flourish for Scrapbook template
    if (template.category === 'scrapbook' || template.id === 'pastel_scrapbook') {
      ctx.save();
      ctx.fillStyle = 'rgba(253, 224, 71, 0.6)';
      drawRoundedRect(ctx, padX - 6, rowY - 6, 36, 14, 3);
      ctx.fill();
      ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
      drawRoundedRect(ctx, width - padX - 30, rowY - 6, 36, 14, 3);
      ctx.fill();
      ctx.restore();
    }

    // Center Decorative Badge between panels
    ctx.fillStyle = template.borderOuter;
    ctx.beginPath();
    ctx.arc(width / 2, rowY + rowHeight / 2, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(template.cornerDecor[i % template.cornerDecor.length], width / 2, rowY + rowHeight / 2 + 4);
  }

  // 5. Stickers Overlay
  if (stickers.length > 0) {
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    const positions = [
      [28, 42],
      [width - 28, 42],
      [26, totalHeight / 2],
      [width - 26, totalHeight / 2],
      [32, totalHeight - 45],
      [width - 32, totalHeight - 45]
    ];
    positions.forEach(([sx, sy], idx) => {
      ctx.fillText(stickers[idx % stickers.length], sx, sy);
    });
  }

  // 6. Footer Caption, Participant Identity & Date Stamp
  const footerStartY = headerHeight + panelCount * rowHeight + (panelCount - 1) * rowGap;

  ctx.fillStyle = template.captionColor;
  ctx.font = 'italic bold 21px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`"${selectedCaption}"`, width / 2, footerStartY + 45);

  ctx.fillStyle = template.titleColor;
  ctx.font = 'bold 12px "Cinzel", Georgia, serif';
  const footerIdentity = `${rosterString}${currentRoomCode ? `  ·  ROOM ${currentRoomCode}` : `  ·  ${groupLabel.toUpperCase()}`}`;
  ctx.fillText(footerIdentity, width / 2, footerStartY + 74);

  if (showDateStamp) {
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    ctx.fillStyle = template.subColor;
    ctx.font = '500 11px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Our Little Universe · ${nowStr}`, width / 2, footerStartY + 98);
  }
}

// --- SAVE TO GALERI PRIBADI CLOUD & DOWNLOAD ---

export async function savePhotoStripToCloud() {
  const feedbackEl = document.getElementById('pb-cloud-feedback');
  const saveBtn = document.getElementById('btn-pb-save-cloud');
  const visSelect = document.getElementById('pb-save-visibility');
  const visibility = visSelect ? visSelect.value : 'private';

  const setFeedback = (msg, isSuccess = false) => {
    if (!feedbackEl) return;
    feedbackEl.style.display = 'block';
    feedbackEl.className = `pb-inline-feedback ${isSuccess ? 'success' : ''}`;
    feedbackEl.textContent = msg;
  };

  if (!isPhotoStripComplete()) {
    const msg = `⚠️ Lengkapi semua ${targetPanelCount} slot pose foto terlebih dahulu sebelum menyimpan Photo Strip ke Galeri Cloud!`;
    setFeedback(msg, false);
    showPhotoboothToast(msg);
    return false;
  }

  if (!auth || !auth.currentUser) {
    const msg = '⚠️ Kamu harus login dengan akun karakter resmi terlebih dahulu untuk menyimpan ke Galeri Cloud.';
    setFeedback(msg, false);
    showPhotoboothToast(msg);
    return false;
  }

  const canvas = document.getElementById('pb-strip-canvas');
  if (!canvas) {
    setFeedback('⚠️ Elemen kanvas Photo Strip tidak ditemukan.', false);
    return false;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = '⏳ Menyimpan ke Galeri Cloud...';
  }
  setFeedback('⏳ Memproses dan mengunggah Photo Strip ke Firebase Storage & Firestore...', false);

  try {
    const blob = await new Promise((resolve, reject) => {
      canvas.toBlob((b) => {
        if (b) resolve(b);
        else reject(new Error('Gagal mengonversi kanvas ke Blob gambar PNG.'));
      }, 'image/png');
    });

    const res = await dbSavePhotoboothStrip(auth.currentUser, {
      blob,
      frameId: selectedFrameId,
      caption: selectedCaption,
      stickerSet: selectedStickerSet,
      panelCount: targetPanelCount,
      roomCode: currentRoomCode,
      visibility
    });

    // Mirror to client-side momentsStore for instant personal gallery display
    try {
      const localObjectURL = URL.createObjectURL(blob);
      addMoment({
        id: res.stripId,
        author: selectedCharKey,
        storagePath: res.storagePath,
        mediaUrl: localObjectURL,
        photoUrl: localObjectURL,
        mediaType: 'image',
        mimeType: 'image/png',
        caption: selectedCaption || 'Photobooth Strip',
        isStory: false,
        visibility,
        isArchived: true,
        publishedAt: Date.now()
      });
    } catch (localSyncErr) {
      console.warn('Gagal menambahkan ke local momentsStore (non-fatal):', localSyncErr);
    }

    const successMsg = visibility === 'friends'
      ? '✨ Photo Strip berhasil disimpan ke Arsip Bersama & Personal Gallery Cloud!'
      : '✨ Photo Strip berhasil disimpan ke Personal Gallery privat milikmu di Cloud!';

    setFeedback(successMsg, true);
    showPhotoboothToast(successMsg);

    if (saveBtn) {
      saveBtn.textContent = '✅ Berhasil Tersimpan di Galeri Cloud';
      saveBtn.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
    }
    return true;
  } catch (err) {
    console.error('Error saving photobooth strip to cloud:', err);
    setFeedback(`❌ Gagal menyimpan Photo Strip: ${err.message}`, false);
    showPhotoboothToast(`❌ Gagal menyimpan ke Cloud: ${err.message}`);
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = '☁️ Coba Simpan ke Galeri Pribadi Cloud Lagi';
    }
    return false;
  }
}

export function downloadPhotoStripPng() {
  if (!isPhotoStripComplete()) {
    showPhotoboothToast(
      `⚠️ Lengkapi semua ${targetPanelCount} slot foto pose terlebih dahulu sebelum mengunduh Photo Strip!`
    );
    return false;
  }

  const canvas = document.getElementById('pb-strip-canvas');
  if (!canvas) return false;

  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    const codePart = currentRoomCode ? currentRoomCode.toLowerCase() : selectedCharKey;
    link.download = `our-little-photobooth-${codePart}-${stamp}.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showPhotoboothToast('💾 Photo Strip berhasil diunduh sebagai gambar PNG!');
    return true;
  } catch (err) {
    showPhotoboothToast('⚠️ Gagal mengunduh gambar. Coba klik kanan pada gambar Photo Strip lalu pilih Simpan Gambar.');
    return false;
  }
}

function handleFileInputUpload(file, isSelf, targetCharKey = null) {
  if (!file || !file.type.startsWith('image/')) {
    showPhotoboothToast('⚠️ Pilih file gambar yang valid (JPG, PNG, atau WebP).');
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target?.result;
    if (typeof dataUrl !== 'string') return;
    if (isSelf) {
      customSelfImageDataUrl = dataUrl;
      showLocalFramePreview(dataUrl);
      showPhotoboothToast('🖼️ Foto kamu berhasil dimuat! Klik "Ambil Pose" untuk memasukkannya ke slot.');
    } else {
      const destKey = targetCharKey || partnerCharKey || selectedParticipants[1];
      if (destKey) {
        participantPhotos[destKey] = dataUrl;
      }
      customPartnerImageDataUrl = dataUrl;
      showPartnerPreview(dataUrl);
      updateRoomPresenceUI();
      showPhotoboothToast('🖼️ Foto sahabat berhasil dimuat!');
    }
    renderPhotoStripCanvas();
  };
  reader.readAsDataURL(file);
}

// --- VIEW NAVIGATION CONTROLLERS ---

let previousViewId = null;

export function openPhotoboothView(fromView = null) {
  if (fromView && fromView !== 'view-photobooth') {
    previousViewId = fromView;
  }

  initPhotoboothView();

  const allViewIds = [
    'view-selection',
    'view-login',
    'view-private-universe',
    'view-kidult-world',
    'view-toyou-world',
    'view-shadow-world',
    'view-orbit',
    'view-moments',
    'view-photobooth',
    'view-messages'
  ];

  allViewIds.forEach((id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    const isTarget = id === 'view-photobooth';
    sec.classList.toggle('active', isTarget);
    sec.setAttribute('aria-hidden', isTarget ? 'false' : 'true');
  });

  document.querySelectorAll('.univ-nav-btn[data-nav]').forEach((btn) => {
    const active = btn.getAttribute('data-nav') === 'photobooth';
    btn.classList.toggle('active', active);
    if (active) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  switchPhotoboothStage('welcome');
}

export function closePhotoboothView() {
  stopLocalCamera(false);

  const pbSec = document.getElementById('view-photobooth');
  if (pbSec) {
    pbSec.classList.remove('active');
    pbSec.setAttribute('aria-hidden', 'true');
  }

  let returnId = previousViewId || 'view-private-universe';
  const targetSec = document.getElementById(returnId);
  if (targetSec) {
    targetSec.classList.add('active');
    targetSec.setAttribute('aria-hidden', 'false');
  } else {
    const fallbackSec = document.getElementById('view-selection');
    if (fallbackSec) {
      fallbackSec.classList.add('active');
      fallbackSec.setAttribute('aria-hidden', 'false');
    }
  }

  document.querySelectorAll('.univ-nav-btn[data-nav]').forEach((btn) => {
    btn.classList.remove('active');
    btn.removeAttribute('aria-current');
  });
}

// --- INITIALIZER & EVENT BINDINGS ---

export function initPhotoboothView(options = {}) {
  const controller = {
    openPhotobooth: (fromView, charKey) => {
      if (charKey && PB_CHARACTERS[charKey]) {
        syncPhotoboothActiveCharacter(charKey, 'session');
      }
      openPhotoboothView(fromView);
    },
    closePhotobooth: closePhotoboothView,
    syncActiveCharacter: syncPhotoboothActiveCharacter,
    setGroupSize,
    toggleParticipant,
    resetParticipants,
    getSelectedGroupSize,
    getSelectedParticipants
  };

  if (typeof window !== 'undefined') {
    window.photoboothController = controller;
  }

  if (isPhotoboothInitialized) return controller;
  const root = document.getElementById('view-photobooth');
  if (!root) return controller;

  isPhotoboothInitialized = true;
  initRoomSyncChannel();

  // Detect active logged-in character on boot
  const sessionInfo = detectLoggedInCharacter();
  if (sessionInfo) {
    setSelectedCharacter(sessionInfo.charKey, false);
  } else {
    setSelectedCharacter(selectedCharKey, false);
  }

  // 1. Top Step Navigation Pills
  root.querySelectorAll('.pb-step-pill[data-pb-step]').forEach((pill) => {
    pill.addEventListener('click', () => {
      const targetStep = pill.dataset.pbStep;
      switchPhotoboothStage(targetStep);
    });
  });

  // 2. Return to Home Button
  const returnHomeBtn = document.getElementById('btn-pb-return-home');
  if (returnHomeBtn) {
    returnHomeBtn.addEventListener('click', () => {
      closePhotoboothView();
    });
  }

  // 3. Character Identity Chips (All 8 Characters)
  root.querySelectorAll('.pb-char-chip[data-pb-char]').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeAuthSource = 'manual';
      setSelectedCharacter(chip.dataset.pbChar, true);
    });
  });

  // 4. Group Size Selection Pills (1 to 8 Characters)
  root.querySelectorAll('.pb-group-size-pill[data-pb-group-size]').forEach((pill) => {
    pill.addEventListener('click', () => {
      const size = parseInt(pill.dataset.pbGroupSize, 10);
      setGroupSize(size);
    });
  });

  // 5. Reset Participants Button
  const resetBtn = document.getElementById('btn-pb-reset-participants');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      resetParticipants();
    });
  }

  // 6. Welcome Stage Actions: Local Studio vs Create Room vs Join Room
  const startBtn = document.getElementById('btn-pb-start');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (selectedParticipants.length < selectedGroupSize) {
        showPhotoboothToast(`⚠️ Pilih ${selectedGroupSize - selectedParticipants.length} sahabat lagi sebelum masuk studio.`);
        return;
      }
      enterLocalPhotoboothMode();
      showPhotoboothToast(`✨ Masuk ke Studio Kamera (${selectedGroupSize} Peserta). Nyalakan kamera untuk mulai berfoto!`);
    });
  }

  const createRoomBtn = document.getElementById('btn-pb-create-room');
  if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
      createPhotoboothRoom();
    });
  }

  const joinRoomBtn = document.getElementById('btn-pb-join-room');
  const joinCodeInput = document.getElementById('pb-join-code-input');
  if (joinRoomBtn && joinCodeInput) {
    joinRoomBtn.addEventListener('click', () => {
      joinPhotoboothRoom(joinCodeInput.value);
    });
    joinCodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        joinPhotoboothRoom(joinCodeInput.value);
      }
    });
  }

  // 7. Room Bar Controls: Copy Code & Leave Room
  const copyCodeBtn = document.getElementById('btn-pb-copy-code');
  if (copyCodeBtn) {
    copyCodeBtn.addEventListener('click', () => {
      if (!currentRoomCode) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(currentRoomCode).catch(() => {});
      }
      showPhotoboothToast(`📋 Kode room ${currentRoomCode} berhasil disalin!`);
    });
  }

  const leaveRoomBtn = document.getElementById('btn-pb-leave-room');
  if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener('click', () => {
      leavePhotoboothRoom();
    });
  }

  // 8. Camera & File Upload Controls
  const requestCamBtn = document.getElementById('btn-pb-request-camera');
  if (requestCamBtn) {
    requestCamBtn.addEventListener('click', () => {
      startLocalCamera();
    });
  }

  const toggleCamBtn = document.getElementById('btn-pb-toggle-camera');
  if (toggleCamBtn) {
    toggleCamBtn.addEventListener('click', () => {
      if (isCameraActive) {
        stopLocalCamera(true);
      } else {
        startLocalCamera();
      }
    });
  }

  const mirrorBtn = document.getElementById('btn-pb-mirror-toggle');
  if (mirrorBtn) {
    mirrorBtn.addEventListener('click', () => {
      isMirrored = !isMirrored;
      const videoEl = document.getElementById('pb-local-video');
      if (videoEl) {
        videoEl.classList.toggle('mirrored', isMirrored);
      }
      updateCameraControlsUI();
      showPhotoboothToast(isMirrored ? '🪞 Efek cermin kamera diaktifkan.' : '🪞 Efek cermin kamera dinonaktifkan.');
    });
  }

  const uploadSelfBtn = document.getElementById('btn-pb-upload-self');
  const localUploadInput = document.getElementById('pb-local-upload-input');
  if (uploadSelfBtn && localUploadInput) {
    uploadSelfBtn.addEventListener('click', () => localUploadInput.click());
    localUploadInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFileInputUpload(file, true);
      localUploadInput.value = '';
    });
  }

  const uploadPartnerBtn = document.getElementById('btn-pb-upload-partner');
  const partnerUploadInput = document.getElementById('pb-partner-upload-input');
  if (uploadPartnerBtn && partnerUploadInput) {
    uploadPartnerBtn.addEventListener('click', () => partnerUploadInput.click());
    partnerUploadInput.addEventListener('change', (e) => {
      const file = e.target.files && e.target.files[0];
      if (file) handleFileInputUpload(file, false);
      partnerUploadInput.value = '';
    });
  }

  const clearPartnerBtn = document.getElementById('btn-pb-clear-partner');
  if (clearPartnerBtn) {
    clearPartnerBtn.addEventListener('click', () => {
      customPartnerImageDataUrl = null;
      hidePartnerPreview();
      updateRoomPresenceUI();
      showPhotoboothToast('✕ Foto pendamping dihapus.');
    });
  }

  // 9. Capture, Retake & Layout Selector (2, 3, 4 Panels)
  const captureBtn = document.getElementById('btn-pb-capture-pose');
  if (captureBtn) {
    captureBtn.addEventListener('click', () => {
      triggerCountdownAndCapture();
    });
  }

  const retakeBtn = document.getElementById('btn-pb-retake-pose');
  if (retakeBtn) {
    retakeBtn.addEventListener('click', () => {
      retakeLastPose();
    });
  }

  root.querySelectorAll('.pb-layout-btn[data-pb-layout]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const count = parseInt(btn.dataset.pbLayout, 10);
      if (![2, 3, 4].includes(count)) return;
      targetPanelCount = count;

      root.querySelectorAll('.pb-layout-btn[data-pb-layout]').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });

      renderPosesTray();
      renderPhotoStripCanvas();
      showPhotoboothToast(
        `🎞️ Layout Photo Strip diatur menjadi ${targetPanelCount} Panel (foto yang sudah diambil tetap tersimpan).`
      );
    });
  });

  const gotoStripBtn = document.getElementById('btn-pb-goto-strip');
  if (gotoStripBtn) {
    gotoStripBtn.addEventListener('click', () => {
      switchPhotoboothStage('result');
    });
  }

  // 10. Stage D Customizer: 8 Templates, Captions, Stickers, Date Stamp
  root.querySelectorAll('.pb-frame-card[data-pb-frame]').forEach((card) => {
    card.addEventListener('click', () => {
      const frameId = card.dataset.pbFrame;
      if (!PB_FRAMES[frameId]) return;
      selectedFrameId = frameId;
      root.querySelectorAll('.pb-frame-card[data-pb-frame]').forEach((c) => {
        c.classList.toggle('active', c === card);
      });
      renderPhotoStripCanvas();
    });
  });

  root.querySelectorAll('.pb-caption-btn[data-pb-caption]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedCaption = btn.dataset.pbCaption;
      root.querySelectorAll('.pb-caption-btn[data-pb-caption]').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
      const customInput = document.getElementById('pb-custom-caption-input');
      if (customInput) customInput.value = '';
      renderPhotoStripCanvas();
    });
  });

  const customCaptionInput = document.getElementById('pb-custom-caption-input');
  if (customCaptionInput) {
    customCaptionInput.addEventListener('input', () => {
      const val = customCaptionInput.value.trim();
      if (val.length > 0) {
        selectedCaption = val;
        root.querySelectorAll('.pb-caption-btn[data-pb-caption]').forEach((b) => {
          b.classList.remove('active');
        });
      } else {
        selectedCaption = 'Our Little Memories';
      }
      renderPhotoStripCanvas();
    });
  }

  root.querySelectorAll('.pb-sticker-btn[data-pb-sticker]').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedStickerSet = btn.dataset.pbSticker;
      root.querySelectorAll('.pb-sticker-btn[data-pb-sticker]').forEach((b) => {
        b.classList.toggle('active', b === btn);
      });
      renderPhotoStripCanvas();
    });
  });

  const toggleDateCheckbox = document.getElementById('pb-toggle-date');
  if (toggleDateCheckbox) {
    toggleDateCheckbox.addEventListener('change', () => {
      showDateStamp = toggleDateCheckbox.checked;
      renderPhotoStripCanvas();
    });
  }

  // 11. Download & Cloud Save Buttons
  const downloadBtn = document.getElementById('btn-pb-download');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      downloadPhotoStripPng();
    });
  }

  const saveCloudBtn = document.getElementById('btn-pb-save-cloud');
  if (saveCloudBtn) {
    saveCloudBtn.addEventListener('click', () => {
      savePhotoStripToCloud();
    });
  }

  const restartSessionBtn = document.getElementById('btn-pb-restart-session');
  if (restartSessionBtn) {
    restartSessionBtn.addEventListener('click', () => {
      capturedPoses = [];
      if (currentRoomCode) {
        writeStoredRoom(currentRoomCode, { hostPoses: [], guestPoses: [] });
        broadcastRoomMessage({ type: 'ROOM_POSES_SYNC' });
      }
      renderPosesTray();
      renderPhotoStripCanvas();
      updateCameraControlsUI();
      switchPhotoboothStage('booth');
      showPhotoboothToast('🔄 Semua pose dikosongkan. Silakan ambil pose baru!');
    });
  }

  const backToBoothBtn = document.getElementById('btn-pb-back-to-booth');
  if (backToBoothBtn) {
    backToBoothBtn.addEventListener('click', () => {
      switchPhotoboothStage('booth');
    });
  }

  // Initial UI Render
  renderGroupSizePills();
  renderParticipantSelector();
  updateStartButtonState();
  updateRoomPresenceUI();
  updateCameraControlsUI();
  renderPosesTray();
  renderPhotoStripCanvas();

  return controller;
}
