import { auth, dbSavePhotoboothStrip } from './firebase.js';
import { addMoment } from './moments.js';
/**
 * OUR LITTLE PHOTOBOOTH — INTERACTIVE CONTROLLER & CANVAS PHOTO STRIP STUDIO
 * Separate top-level feature in Our Little Universe.
 *
 * Key Guarantees:
 *  - Supports all 3 characters (Nyanya ★, Lala ☼, Lele ☾) synced with active login session.
 *  - Clearly separates Active User, Room Host, and Second Participant (never shows an unjoined friend as present).
 *  - Distinguishes Local Mode (1 user) vs Room Mode (Create Room & Strictly Validated Join Room).
 *  - Real browser camera lifecycle (getUserMedia, mirror toggle, on/off toggle, clean track stop on exit).
 *  - Never substitutes a static graphic for an inactive camera preview.
 *  - Preserves captured poses when switching between 2, 3, and 4 panel layouts.
 *  - Prevents downloading an incomplete photo strip when required pose slots are still empty.
 */

const STORAGE_KEY_ROOMS = 'olu_photobooth_rooms_v1';
const STORAGE_KEY_SESSION = 'olu_session_state_v1';
const CHANNEL_NAME = 'olu_photobooth_sync_v1';

const PB_CHARACTERS = {
  nyanya: {
    key: 'nyanya',
    name: 'Nyanya',
    owner: 'Vanya',
    symbol: '★',
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
    owner: 'Bella',
    symbol: '☼',
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
    owner: 'Alenda',
    symbol: '☾',
    universe: 'SHADOW',
    avatar: '/assets/avatar_lele_hd.png',
    badgeColor: '#e9d5ff',
    gradStart: '#1e1b4b',
    gradEnd: '#a855f7',
    quote: 'Crystal Moon Guardian'
  }
};

const PB_FRAMES = {
  moon_stars: {
    id: 'moon_stars',
    name: 'Moon & Stars',
    bgTop: '#19143a',
    bgMid: '#2d1f5e',
    bgBottom: '#151130',
    borderOuter: '#fef08a',
    borderInner: 'rgba(254, 240, 138, 0.48)',
    titleColor: '#fef08a',
    captionColor: '#fce7f3',
    subColor: '#cbd5e1',
    panelBorder: '#fde047',
    cornerDecor: ['🌙', '✦', '★', '✧']
  },
  pastel_flowers: {
    id: 'pastel_flowers',
    name: 'Pastel Flowers',
    bgTop: '#fdf2f8',
    bgMid: '#fce7f3',
    bgBottom: '#f0fdf4',
    borderOuter: '#f472b6',
    borderInner: 'rgba(244, 114, 182, 0.45)',
    titleColor: '#9d174d',
    captionColor: '#831843',
    subColor: '#475569',
    panelBorder: '#f9a8d4',
    cornerDecor: ['🌸', '✿', '🌷', '🍃']
  },
  crystal_dreams: {
    id: 'crystal_dreams',
    name: 'Crystal Dreams',
    bgTop: '#1e1b4b',
    bgMid: '#312e81',
    bgBottom: '#3b0764',
    borderOuter: '#c4b5fd',
    borderInner: 'rgba(196, 181, 253, 0.52)',
    titleColor: '#e0e7ff',
    captionColor: '#ddd6fe',
    subColor: '#cbd5e1',
    panelBorder: '#a78bfa',
    cornerDecor: ['💎', '✧', '🔮', '✦']
  },
  retro_memories: {
    id: 'retro_memories',
    name: 'Retro Memories',
    bgTop: '#fffbeb',
    bgMid: '#fef3c7',
    bgBottom: '#fde68a',
    borderOuter: '#b45309',
    borderInner: 'rgba(180, 83, 9, 0.38)',
    titleColor: '#78350f',
    captionColor: '#92400e',
    subColor: '#57534e',
    panelBorder: '#d97706',
    cornerDecor: ['🎞️', '✦', '📸', '★']
  }
};

const PB_STICKER_SETS = {
  stars: ['✦', '★', '✧', '🌟'],
  hearts: ['💖', '💗', '💕', '💘'],
  moons: ['🌙', '☾', '✨', '🪐'],
  ribbons: ['🎀', '🌸', '✿', '🦋'],
  none: []
};

let isPhotoboothInitialized = false;
let currentStage = 'welcome'; // 'welcome' | 'booth' | 'result'

// Identity State
let selectedCharKey = 'nyanya';
let activeAuthSource = 'session'; // 'firebase' | 'demo' | 'manual'

// Room State
let roomMode = 'local'; // 'local' | 'waiting' | 'connected'
let roomRole = null; // null | 'host' | 'guest'
let currentRoomCode = null;
let roomHostChar = null;
let partnerCharKey = null; // null until a 2nd participant actually joins!
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
let targetPanelCount = 3; // 2, 3, or 4
let capturedPoses = []; // Preserved across layout changes!
let selectedFrameId = 'moon_stars';
let selectedCaption = 'Our Little Memories';
let selectedStickerSet = 'stars';
let showDateStamp = true;

// Cache of loaded Image objects for fast canvas rendering
const imageCache = new Map();

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

export const PHOTOBOOTH_FRAMES = PB_FRAMES;
export const PHOTOBOOTH_CAPTIONS = [
  'Our Little Memories',
  'Together, Even From Afar',
  'A Little Moment With You'
];
export const PHOTOBOOTH_LAYOUTS = [2, 3, 4];
export { PB_CHARACTERS };

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
 * Reads the active logged-in character from Our Little Universe session state if available.
 */
function detectLoggedInCharacter() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.characterKey && PB_CHARACTERS[parsed.characterKey]) {
      return {
        charKey: parsed.characterKey,
        mode: parsed.mode || 'session'
      };
    }
  } catch (e) {
    // ignore storage parse issues
  }
  return null;
}

/**
 * Syncs the active character in Photobooth with the logged-in user account (Nyanya, Lala, or Lele).
 */
export function syncPhotoboothActiveCharacter(charKey, source = 'session') {
  if (!charKey || !PB_CHARACTERS[charKey]) return;
  activeAuthSource = source;
  setSelectedCharacter(charKey, false);
}

/**
 * Updates the active user's character identity (Nyanya, Lala, or Lele).
 * IMPORTANT: Never hardcodes or fabricates a 2nd participant!
 */
function setSelectedCharacter(charKey, notify = true) {
  if (!PB_CHARACTERS[charKey]) return;

  // If currently in an active connected room where the partner already holds this character, prevent collision
  if (roomMode === 'connected' && partnerConnected && partnerCharKey === charKey) {
    showPhotoboothToast(
      `⚠️ Sahabatmu di room ini sudah menggunakan identitas ${PB_CHARACTERS[charKey].name}. Pilih identitas lain.`
    );
    return;
  }

  selectedCharKey = charKey;
  if (roomMode === 'waiting' && roomRole === 'host' && currentRoomCode) {
    roomHostChar = charKey;
    writeStoredRoom(currentRoomCode, { hostChar: charKey });
  }

  const charMeta = PB_CHARACTERS[selectedCharKey];

  // Update chip buttons
  document.querySelectorAll('.pb-char-chip[data-pb-char]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.pbChar === selectedCharKey);
  });

  // Update active identity banner
  const avatarEl = document.getElementById('pb-active-user-avatar');
  const nameEl = document.getElementById('pb-active-user-name');
  const subEl = document.getElementById('pb-active-user-sub');

  if (avatarEl) {
    avatarEl.src = charMeta.avatar;
    avatarEl.alt = `Avatar ${charMeta.name}`;
  }
  if (nameEl) {
    nameEl.textContent = `${charMeta.symbol} ${charMeta.name} (${charMeta.owner})`;
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

  // Update existing solo poses' selfChar metadata if in local mode
  if (roomMode === 'local') {
    capturedPoses = capturedPoses.map((pose) => ({
      ...pose,
      selfChar: selectedCharKey
    }));
  }

  updateRoomPresenceUI();
  renderPosesTray();
  renderPhotoStripCanvas();

  if (notify) {
    showPhotoboothToast(`✦ Identitas aktif diatur sebagai ${charMeta.symbol} ${charMeta.name} (${charMeta.universe})`);
  }
}

/**
 * Switches between Photobooth stages: 'welcome' | 'booth' | 'result'
 */
function switchPhotoboothStage(stageName) {
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

/**
 * Sets up BroadcastChannel and window 'storage' event listener so two tabs or
 * two browser windows on the same device synchronize room join/leave, countdown, and poses.
 */
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

/**
 * Merges hostPoses and guestPoses stored in a room into unified side-by-side duet poses.
 */
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
  if (roomRole === 'host') {
    if (room.guestChar && PB_CHARACTERS[room.guestChar]) {
      const wasConnected = partnerConnected;
      partnerCharKey = room.guestChar;
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

  // Update partner preview slot if partner has taken at least 1 pose
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

/**
 * Enters Studio Kamera in Local Mode (1 Participant / No Room Code needed).
 */
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

/**
 * Creates a new 2-participant Photobooth room with the active user as Room Host.
 */
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
    `🎟️ Room ${newCode} berhasil dibuat! Kamu (${selfMeta.name}) adalah Pemilik Room. Bagikan kode ke sahabatmu.`
  );
  return newCode;
}

/**
 * Validates and joins an existing Photobooth room as the 2nd participant (Guest).
 * CRITICAL: Never creates a new room if the code is invalid or not found!
 */
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

  if (existing.hostChar === selectedCharKey) {
    const hostMeta = PB_CHARACTERS[existing.hostChar] || PB_CHARACTERS.nyanya;
    const msg = `⚠️ Pemilik room "${cleanCode}" sudah menggunakan identitas ${hostMeta.symbol} ${hostMeta.name}. Pilih identitas sahabat yang berbeda (mis. Nyanya, Lala, atau Lele) untuk bergabung.`;
    setJoinFeedback(msg, false);
    showPhotoboothToast(msg);
    return false;
  }

  if (existing.guestChar && existing.guestChar !== selectedCharKey && existing.status === 'connected') {
    const hostMeta = PB_CHARACTERS[existing.hostChar] || PB_CHARACTERS.nyanya;
    const guestMeta = PB_CHARACTERS[existing.guestChar] || PB_CHARACTERS.lala;
    const msg = `❌ Room "${cleanCode}" sudah penuh (2 peserta: ${hostMeta.name} & ${guestMeta.name}).`;
    setJoinFeedback(msg, false);
    showPhotoboothToast(msg);
    return false;
  }

  // Valid room join! Register this user as guestChar
  currentRoomCode = cleanCode;
  roomMode = 'connected';
  roomRole = 'guest';
  roomHostChar = existing.hostChar;
  partnerCharKey = existing.hostChar;
  partnerConnected = true;

  const updatedRoom = writeStoredRoom(cleanCode, {
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

/**
 * Leaves the current Photobooth room, stops the camera, and returns to Stage A.
 */
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
        writeStoredRoom(code, { status: 'waiting', guestChar: null, guestPoses: [] });
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

/**
 * Updates the Room Header Bar, Presence Pills, and Partner Slot UI honestly.
 * Never shows a specific character as partner unless that partner has genuinely joined!
 */
function updateRoomPresenceUI() {
  const selfChar = PB_CHARACTERS[selectedCharKey] || PB_CHARACTERS.nyanya;
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
    localSlotTag.textContent = `📸 Kamera Kamu (${selfChar.symbol} ${selfChar.name})`;
  }

  if (roomMode === 'local' || !currentRoomCode) {
    if (codeDisplay) codeDisplay.textContent = 'MODE LOKAL';
    if (copyBtn) copyBtn.style.display = 'none';
    if (leaveBtn) leaveBtn.textContent = '← Kembali ke Menu Room';
    if (syncModeBadge) {
      syncModeBadge.textContent = `🟢 Mode Lokal (1 Peserta: ${selfChar.symbol} ${selfChar.name}) — Siap Mengambil Foto`;
      syncModeBadge.style.color = '#86efac';
    }
    if (selfText) {
      selfText.textContent = `${selfChar.symbol} Pengguna Aktif: ${selfChar.name} (${selfChar.owner})`;
    }
    if (partnerDot) partnerDot.classList.add('waiting');
    if (partnerText) {
      partnerText.textContent = customPartnerImageDataUrl
        ? '🖼️ Foto Pendamping Lokal Terpasang'
        : '👤 Mode Lokal (Tanpa Peserta Ke-2)';
    }
    if (partnerSlotTag) partnerSlotTag.textContent = '💌 Slot Foto Pendamping (Opsional)';
    if (partnerIcon) partnerIcon.textContent = '✨';
    if (partnerTitle) partnerTitle.textContent = 'Mode Foto Lokal (1 Perangkat)';
    if (partnerDesc) {
      partnerDesc.textContent =
        'Kamu sedang berada di Mode Lokal. Kamu bisa langsung mengambil foto sendiri, atau membuat/bergabung ke Room Bersama jika ingin berfoto 2 peserta.';
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
      partnerText.textContent = '⏳ Peserta 2: Belum bergabung';
    }
    if (partnerSlotTag) partnerSlotTag.textContent = '⏳ Slot Peserta Ke-2 (Menunggu)';
    if (partnerIcon) partnerIcon.textContent = '⏳';
    if (partnerTitle) partnerTitle.textContent = 'Menunggu Sahabat Bergabung...';
    if (partnerDesc) {
      partnerDesc.textContent = `Bagikan kode "${currentRoomCode}" ke sahabatmu (Nyanya, Lala, atau Lele) agar ia dapat bergabung ke room ini.`;
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
      const partnerRoleLabel = roomRole === 'host' ? '🤝 Guest' : '👑 Host';
      partnerText.textContent = `${partnerRoleLabel}: ${partnerChar.symbol} ${partnerChar.name} · Terhubung`;
    }
    if (partnerSlotTag) {
      partnerSlotTag.textContent = `💌 Sahabat Terhubung: ${partnerChar.symbol} ${partnerChar.name}`;
    }
    if (partnerIcon) partnerIcon.textContent = '🤝';
    if (partnerTitle) {
      partnerTitle.textContent = `${partnerChar.symbol} ${partnerChar.name} Terhubung di Room!`;
    }
    if (partnerDesc) {
      partnerDesc.textContent = `Saat ${partnerChar.name} mengambil foto pose di browsernya, fotonya akan otomatis digabungkan ke Photo Strip bersama fotomu.`;
    }
  }
}

/**
 * Updates camera buttons and capture button readiness state.
 * CRITICAL: Capture button is ONLY enabled when live camera is active OR a user photo file is loaded!
 */
function updateCameraControlsUI() {
  const isReadyToCapture = Boolean(isCameraActive || customSelfImageDataUrl);
  const captureBtn = document.getElementById('btn-pb-capture-pose');
  const captureLabel = document.getElementById('pb-capture-btn-label');
  const toggleCamBtn = document.getElementById('btn-pb-toggle-camera');
  const stopCamBtn = document.getElementById('btn-pb-stop-camera');
  const mirrorBtn = document.getElementById('btn-pb-mirror-toggle');
  const retakeBtn = document.getElementById('btn-pb-retake-pose');
  const statusText = document.getElementById('pb-camera-status-text');

  const isSecure =
    typeof window !== 'undefined' &&
    (window.isSecureContext ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  if (statusText && !isCameraActive && !customSelfImageDataUrl) {
    statusText.textContent = isSecure
      ? 'Klik tombol "Izinkan & Nyalakan Kamera" untuk mengaktifkan live preview kamera browser sebelum mengambil foto.'
      : '⚠️ Kamera membutuhkan konteks aman (localhost atau HTTPS). Gunakan localhost/HTTPS atau pilih file foto manual.';
  }

  if (toggleCamBtn) {
    toggleCamBtn.textContent = isCameraActive ? '⏹️ Matikan Kamera' : '📷 Hidupkan Kamera';
  }
  if (stopCamBtn) {
    stopCamBtn.style.display = isCameraActive ? 'inline-flex' : 'none';
  }
  if (mirrorBtn) {
    mirrorBtn.textContent = isMirrored ? '🪞 Mirror: Aktif' : '🪞 Mirror: Nonaktif';
  }
  if (retakeBtn) {
    retakeBtn.disabled = isCapturing || capturedPoses.length === 0;
  }

  if (captureBtn) {
    captureBtn.disabled = !isReadyToCapture || isCapturing;
    captureBtn.title = isReadyToCapture
      ? 'Ambil foto pose sekarang'
      : 'Nyalakan kamera terlebih dahulu untuk mengambil foto';
  }
  if (captureLabel) {
    if (isCapturing) {
      captureLabel.textContent = 'Mengambil Foto...';
    } else if (isReadyToCapture) {
      captureLabel.textContent = 'Ambil Foto Pose';
    } else {
      captureLabel.textContent = 'Nyalakan Kamera Dulu';
    }
  }
}

/**
 * Requests real browser camera via navigator.mediaDevices.getUserMedia
 */
export async function startLocalCamera() {
  const videoEl = document.getElementById('pb-local-video');
  const placeholderEl = document.getElementById('pb-local-placeholder');
  const fallbackImg = document.getElementById('pb-local-fallback-img');

  setCameraErrorFeedback(null);

  if (!navigator.mediaDevices || typeof navigator.mediaDevices.getUserMedia !== 'function') {
    const msg =
      '⚠️ Browser ini tidak mendukung API kamera (navigator.mediaDevices.getUserMedia). Pastikan kamu membuka via localhost/HTTPS atau pilih file foto manual.';
    setCameraErrorFeedback(msg);
    showPhotoboothToast(msg);
    updateCameraControlsUI();
    return false;
  }

  try {
    stopLocalCamera(false);
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
    customSelfImageDataUrl = null;

    if (videoEl) {
      videoEl.srcObject = stream;
      videoEl.style.display = 'block';
      videoEl.classList.toggle('mirrored', isMirrored);
      await videoEl.play().catch(() => {});
    }
    if (fallbackImg) {
      fallbackImg.style.display = 'none';
      fallbackImg.removeAttribute('src');
    }
    if (placeholderEl) placeholderEl.style.display = 'none';

    updateCameraControlsUI();
    showPhotoboothToast('📷 Kamera aktif! Pilih durasi hitung mundur lalu klik "Ambil Foto Pose".');
    return true;
  } catch (err) {
    isCameraActive = false;
    localStream = null;
    const errName = err && err.name ? err.name : 'CameraError';
    let friendlyMsg =
      '⚠️ Izin akses kamera ditolak atau perangkat kamera tidak tersedia. Izinkan kamera di pengaturan browser atau unggah file foto manual.';
    if (errName === 'NotAllowedError' || errName === 'PermissionDeniedError') {
      friendlyMsg =
        '⚠️ Izin kamera ditolak oleh browser. Klik ikon kunci/kamera di bilah alamat browser untuk mengizinkan kamera, lalu coba lagi.';
    } else if (errName === 'NotFoundError' || errName === 'DevicesNotFoundError') {
      friendlyMsg = '⚠️ Perangkat kamera (webcam) tidak ditemukan pada perangkat ini.';
    }
    setCameraErrorFeedback(friendlyMsg);
    showPhotoboothToast(friendlyMsg);
    updateCameraControlsUI();
    return false;
  }
}

/**
 * Stops active browser camera stream cleanly and releases hardware tracks.
 */
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

/**
 * Captures a single 4:3 frame from the user's active <video> stream (or uploaded image).
 * Returns null if neither active camera nor uploaded photo is available.
 * Mirror mode flips only the video pixels, never any text overlay!
 */
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

  return null;
}

/**
 * Runs the visual countdown overlay and captures a pose.
 */
async function triggerCountdownAndCapture() {
  if (isCapturing) return;

  // Strict readiness check: camera must be active OR user must have uploaded a photo file
  if (!isCameraActive && !customSelfImageDataUrl) {
    showPhotoboothToast('⚠️ Nyalakan kamera terlebih dahulu (atau pilih file foto) sebelum mengambil pose!');
    updateCameraControlsUI();
    return;
  }

  // Check if current layout slots are already full
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

  // Shutter flash animation
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
    // Local Mode
    const poseNumber = capturedPoses.length + 1;
    capturedPoses.push({
      id: `pose_${Date.now()}_${poseNumber}`,
      poseNumber,
      selfImg: selfDataUrl,
      selfChar: selectedCharKey,
      partnerImg: customPartnerImageDataUrl || null,
      partnerChar: null,
      mode: customPartnerImageDataUrl ? 'local_duet' : 'local_solo',
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

/**
 * Deletes a specific pose at index `idx` (or the last pose when retaking).
 */
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

/**
 * Retakes/removes only the last captured pose of the current user.
 */
function retakeLastPose() {
  if (capturedPoses.length === 0) {
    showPhotoboothToast('ℹ️ Belum ada pose yang diambil untuk diulangi.');
    return;
  }

  const removedIndex = capturedPoses.length - 1;
  removePoseAtIndex(removedIndex);
  showPhotoboothToast(`↺ Pose #${removedIndex + 1} dihapus. Silakan ambil ulang pose tersebut.`);
}

/**
 * Renders the Pose Slot list in the right sidebar of the Camera Booth.
 * Always shows all `targetPanelCount` slots (filled or empty), plus any extra preserved poses if layout was reduced.
 */
function renderPosesTray() {
  const listEl = document.getElementById('pb-poses-list');
  const counterEl = document.getElementById('pb-pose-counter');
  if (!listEl) return;

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

    if (pose && (pose.selfImg || pose.hostImg || pose.guestImg)) {
      const primaryThumb = pose.selfImg || pose.hostImg || pose.guestImg;
      const secondaryThumb = pose.partnerImg || (pose.hostImg && pose.guestImg ? pose.guestImg : null);
      const selfMeta = PB_CHARACTERS[pose.selfChar || selectedCharKey] || PB_CHARACTERS.nyanya;
      const partnerMeta = pose.partnerChar && PB_CHARACTERS[pose.partnerChar] ? PB_CHARACTERS[pose.partnerChar] : null;

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.55rem;">
          <div class="pb-pose-thumbs">
            ${primaryThumb ? `<img src="${primaryThumb}" alt="Pose ${i + 1}" class="pb-pose-thumb" />` : ''}
            ${secondaryThumb ? `<img src="${secondaryThumb}" alt="Pose Sahabat ${i + 1}" class="pb-pose-thumb" />` : ''}
          </div>
          <div>
            <div style="font-size: 0.78rem; font-weight: 700; color: #ffffff;">
              Slot Pose #${i + 1} · Tersimpan
            </div>
            <div style="font-size: 0.68rem; color: #cbd5e1;">
              ${selfMeta.symbol} ${selfMeta.name}${partnerMeta ? ` & ${partnerMeta.symbol} ${partnerMeta.name}` : ''} ${pose.timestamp ? `· ${pose.timestamp}` : ''}
            </div>
          </div>
        </div>
        <button type="button" class="pb-btn-mini danger" data-remove-pose="${i}" title="Hapus & Ulangi Slot Ini">✕</button>
      `;
    } else {
      item.style.opacity = '0.75';
      item.style.borderStyle = 'dashed';
      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.55rem;">
          <div style="width: 48px; height: 36px; border-radius: 6px; border: 1px dashed rgba(249,168,212,0.45); display: flex; align-items: center; justify-content: center; font-size: 0.85rem; color: #f9a8d4;">
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

/**
 * Checks whether all required pose slots for the selected layout (`targetPanelCount`) have been captured.
 */
function isPhotoStripComplete() {
  if (capturedPoses.length < targetPanelCount) return false;
  for (let i = 0; i < targetPanelCount; i++) {
    const pose = capturedPoses[i];
    if (!pose || (!pose.selfImg && !pose.hostImg && !pose.guestImg)) {
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
    capturedPoses.filter((p) => p && (p.selfImg || p.hostImg || p.guestImg)).length,
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

/**
 * Renders the combined Photo Strip onto #pb-strip-canvas.
 * CRITICAL: Empty pose slots are rendered as explicit empty placeholders, NEVER fake character graphics!
 */
export async function renderPhotoStripCanvas() {
  const canvas = document.getElementById('pb-strip-canvas');
  if (!canvas) return;

  updateStripCompletionBanner();

  const frame = PB_FRAMES[selectedFrameId] || PB_FRAMES.moon_stars;
  const stickers = PB_STICKER_SETS[selectedStickerSet] || [];
  const selfChar = PB_CHARACTERS[selectedCharKey] || PB_CHARACTERS.nyanya;
  const partnerChar =
    partnerConnected && partnerCharKey && PB_CHARACTERS[partnerCharKey]
      ? PB_CHARACTERS[partnerCharKey]
      : null;

  const panelCount = targetPanelCount;
  const width = 560;
  const headerHeight = 105;
  const rowHeight = 195;
  const rowGap = 18;
  const footerHeight = 135;
  const totalHeight = headerHeight + panelCount * rowHeight + (panelCount - 1) * rowGap + footerHeight;

  canvas.width = width;
  canvas.height = totalHeight;

  const ctx = canvas.getContext('2d');

  // 1. Strip Background Gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, totalHeight);
  bgGrad.addColorStop(0, frame.bgTop);
  bgGrad.addColorStop(0.5, frame.bgMid);
  bgGrad.addColorStop(1, frame.bgBottom);
  ctx.fillStyle = bgGrad;
  drawRoundedRect(ctx, 0, 0, width, totalHeight, 24);
  ctx.fill();

  // 2. Decorative Outer & Inner Borders
  ctx.strokeStyle = frame.borderOuter;
  ctx.lineWidth = 5;
  drawRoundedRect(ctx, 8, 8, width - 16, totalHeight - 16, 20);
  ctx.stroke();

  ctx.strokeStyle = frame.borderInner;
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, 18, 18, width - 36, totalHeight - 36, 15);
  ctx.stroke();

  // 3. Top Header Title
  ctx.fillStyle = frame.titleColor;
  ctx.font = 'bold 22px "Cinzel", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦ OUR LITTLE PHOTOBOOTH ✦', width / 2, 54);

  ctx.fillStyle = frame.subColor;
  ctx.font = 'italic 15px "Cormorant Garamond", Georgia, serif';
  const participantSubtitle = partnerChar
    ? `${selfChar.symbol} ${selfChar.name} × ${partnerChar.symbol} ${partnerChar.name} · Different places, same little memories.`
    : `${selfChar.symbol} ${selfChar.name} (${selfChar.universe}) · Different places, same little memories.`;
  ctx.fillText(participantSubtitle, width / 2, 80);

  // 4. Render each Panel Row (1..targetPanelCount)
  const padX = 34;
  const innerWidth = width - padX * 2;
  const slotGap = 14;
  const halfSlotWidth = (innerWidth - slotGap) / 2;

  for (let i = 0; i < panelCount; i++) {
    const rowY = headerHeight + i * (rowHeight + rowGap);
    const pose = capturedPoses[i] || null;

    if (!pose || (!pose.selfImg && !pose.hostImg && !pose.guestImg)) {
      // EMPTY POSE SLOT PLACEHOLDER
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.36)';
      drawRoundedRect(ctx, padX, rowY, innerWidth, rowHeight, 14);
      ctx.fill();

      ctx.strokeStyle = frame.panelBorder;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 6]);
      drawRoundedRect(ctx, padX, rowY, innerWidth, rowHeight, 14);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = frame.titleColor;
      ctx.font = 'bold 16px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(`SLOT FOTO POSE #${i + 1} MASIH KOSONG`, width / 2, rowY + rowHeight / 2 - 6);

      ctx.fillStyle = frame.subColor;
      ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('Ambil foto di Studio Kamera untuk mengisi panel ini', width / 2, rowY + rowHeight / 2 + 18);
      ctx.restore();
      continue;
    }

    // Determine whether this pose is a 2-photo duet or a 1-photo solo panel
    const isRoomMode = roomMode === 'waiting' || roomMode === 'connected' || pose.mode === 'room_duet' || pose.mode === 'room_waiting';
    const hasSecondPhoto = Boolean(pose.partnerImg || (pose.hostImg && pose.guestImg));

    if (isRoomMode || hasSecondPhoto) {
      // Side-by-side Duet Panel (Left: Self/Host, Right: Partner/Guest)
      const leftSrc = pose.hostImg !== undefined ? pose.hostImg : pose.selfImg;
      const rightSrc = pose.guestImg !== undefined ? pose.guestImg : pose.partnerImg;
      const leftCharKey = pose.hostChar || pose.selfChar || selectedCharKey;
      const rightCharKey = pose.guestChar || pose.partnerChar || partnerCharKey;

      const [leftImg, rightImg] = await Promise.all([
        loadImageElement(leftSrc),
        loadImageElement(rightSrc)
      ]);

      // Left Slot
      if (leftImg) {
        drawCoverImage(ctx, leftImg, padX, rowY, halfSlotWidth, rowHeight, 12);
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        drawRoundedRect(ctx, padX, rowY, halfSlotWidth, rowHeight, 12);
        ctx.fill();
        ctx.fillStyle = frame.subColor;
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Menunggu Foto Host...', padX + halfSlotWidth / 2, rowY + rowHeight / 2);
      }
      ctx.strokeStyle = frame.panelBorder;
      ctx.lineWidth = 2.5;
      drawRoundedRect(ctx, padX, rowY, halfSlotWidth, rowHeight, 12);
      ctx.stroke();

      // Right Slot
      const rightX = padX + halfSlotWidth + slotGap;
      if (rightImg) {
        drawCoverImage(ctx, rightImg, rightX, rowY, halfSlotWidth, rowHeight, 12);
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
        drawRoundedRect(ctx, rightX, rowY, halfSlotWidth, rowHeight, 12);
        ctx.fill();
        ctx.fillStyle = frame.subColor;
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          rightCharKey && PB_CHARACTERS[rightCharKey]
            ? `Menunggu Foto ${PB_CHARACTERS[rightCharKey].name}...`
            : 'Menunggu Peserta Ke-2...',
          rightX + halfSlotWidth / 2,
          rowY + rowHeight / 2
        );
      }
      ctx.strokeStyle = frame.panelBorder;
      ctx.lineWidth = 2.5;
      drawRoundedRect(ctx, rightX, rowY, halfSlotWidth, rowHeight, 12);
      ctx.stroke();

      // Character tags on bottom corners
      const leftMeta = PB_CHARACTERS[leftCharKey] || selfChar;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      drawRoundedRect(ctx, padX + 8, rowY + rowHeight - 28, 92, 20, 10);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${leftMeta.symbol} ${leftMeta.name}`, padX + 16, rowY + rowHeight - 14);

      if (rightCharKey && PB_CHARACTERS[rightCharKey]) {
        const rightMeta = PB_CHARACTERS[rightCharKey];
        ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
        drawRoundedRect(ctx, rightX + halfSlotWidth - 100, rowY + rowHeight - 28, 92, 20, 10);
        ctx.fill();
        ctx.fillStyle = '#fbcfe8';
        ctx.textAlign = 'right';
        ctx.fillText(`${rightMeta.symbol} ${rightMeta.name}`, rightX + halfSlotWidth - 16, rowY + rowHeight - 14);
      }
    } else {
      // Single Full-Width Panel (Local Solo Mode)
      const soloImg = await loadImageElement(pose.selfImg);
      if (soloImg) {
        drawCoverImage(ctx, soloImg, padX, rowY, innerWidth, rowHeight, 14);
      }
      ctx.strokeStyle = frame.panelBorder;
      ctx.lineWidth = 2.5;
      drawRoundedRect(ctx, padX, rowY, innerWidth, rowHeight, 14);
      ctx.stroke();

      const soloMeta = PB_CHARACTERS[pose.selfChar || selectedCharKey] || selfChar;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
      drawRoundedRect(ctx, padX + 10, rowY + rowHeight - 30, 110, 22, 11);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 11.5px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`${soloMeta.symbol} ${soloMeta.name}`, padX + 18, rowY + rowHeight - 15);
    }

    // Center badge between panels
    ctx.fillStyle = frame.borderOuter;
    ctx.beginPath();
    ctx.arc(width / 2, rowY + rowHeight / 2, 13, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(frame.cornerDecor[i % frame.cornerDecor.length], width / 2, rowY + rowHeight / 2 + 4);
  }

  // 5. Stickers Overlay
  if (stickers.length > 0) {
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'center';
    const positions = [
      [26, 42],
      [width - 26, 42],
      [24, totalHeight / 2],
      [width - 24, totalHeight / 2],
      [30, totalHeight - 40],
      [width - 30, totalHeight - 40]
    ];
    positions.forEach(([sx, sy], idx) => {
      ctx.fillText(stickers[idx % stickers.length], sx, sy);
    });
  }

  // 6. Footer Caption, Participant Identity & Date Stamp
  const footerStartY = headerHeight + panelCount * rowHeight + (panelCount - 1) * rowGap;

  ctx.fillStyle = frame.captionColor;
  ctx.font = 'italic bold 22px "Cormorant Garamond", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`"${selectedCaption}"`, width / 2, footerStartY + 46);

  ctx.fillStyle = frame.titleColor;
  ctx.font = 'bold 12.5px "Cinzel", Georgia, serif';
  const footerIdentity = partnerChar
    ? `${selfChar.symbol} ${selfChar.name}  ×  ${partnerChar.symbol} ${partnerChar.name}${currentRoomCode ? `  ·  ROOM ${currentRoomCode}` : ''}`
    : `${selfChar.symbol} ${selfChar.name} (${selfChar.owner} · ${selfChar.universe})`;
  ctx.fillText(footerIdentity, width / 2, footerStartY + 74);

  if (showDateStamp) {
    const nowStr = new Date().toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    ctx.fillStyle = frame.subColor;
    ctx.font = '500 11.5px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`Our Little Universe · ${nowStr}`, width / 2, footerStartY + 98);
  }
}

/**
 * Downloads the rendered Photo Strip canvas as a high-resolution PNG file.
 */

/**
 * Saves the rendered photo strip to Firebase Storage and metadata to Firestore.
 * Also mirrors to the owner's Personal Gallery so it appears immediately without duplication.
 */
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

function downloadPhotoStripPng() {
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

function handleFileInputUpload(file, isSelf) {
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
      showPhotoboothToast('🖼️ Foto kamu berhasil dimuat! Klik "Ambil Foto Pose" untuk memasukkannya ke slot.');
    } else {
      customPartnerImageDataUrl = dataUrl;
      showPartnerPreview(dataUrl);
      updateRoomPresenceUI();
      showPhotoboothToast('💌 Foto pendamping berhasil dimuat ke slot ke-2!');
    }
  };
  reader.readAsDataURL(file);
}

let previousPhotoboothViewId = 'view-private-universe';

/**
 * Opens the Our Little Photobooth top-level view and syncs the active user's identity.
 */
export function openPhotoboothView(fromViewId = 'view-private-universe') {
  if (fromViewId && typeof fromViewId === 'string' && fromViewId !== 'view-photobooth') {
    previousPhotoboothViewId = fromViewId;
  }

  const sessionInfo = detectLoggedInCharacter();
  if (sessionInfo) {
    syncPhotoboothActiveCharacter(sessionInfo.charKey, sessionInfo.mode);
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
    'view-photobooth'
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

  window.scrollTo({ top: 0, behavior: 'smooth' });
  renderPhotoStripCanvas();
}

/**
 * Closes the Photobooth view, stops the camera stream, and returns to the dashboard / previous view.
 */
export function closePhotoboothView() {
  stopLocalCamera(false);

  const viewPhotobooth = document.getElementById('view-photobooth');
  if (viewPhotobooth) {
    viewPhotobooth.classList.remove('active');
    viewPhotobooth.setAttribute('aria-hidden', 'true');
  }

  const targetView =
    document.getElementById(previousPhotoboothViewId) ||
    document.getElementById('view-private-universe') ||
    document.getElementById('view-selection');

  if (targetView) {
    targetView.classList.add('active');
    targetView.setAttribute('aria-hidden', 'false');
  }

  document.querySelectorAll('.univ-nav-btn[data-nav]').forEach((btn) => {
    const active = btn.getAttribute('data-nav') === 'universes';
    btn.classList.toggle('active', active);
    if (active) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Initializes all event listeners and state for #view-photobooth
 */
export function initPhotoboothView(options = {}) {
  const controller = {
    openPhotobooth: (fromView, charKey) => {
      if (charKey && PB_CHARACTERS[charKey]) {
        syncPhotoboothActiveCharacter(charKey, 'session');
      }
      openPhotoboothView(fromView);
    },
    closePhotobooth: closePhotoboothView,
    syncActiveCharacter: syncPhotoboothActiveCharacter
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

  // 1. Top Step Pills
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

  // 3. Character Identity Chips (Nyanya, Lala, Lele)
  root.querySelectorAll('.pb-char-chip[data-pb-char]').forEach((chip) => {
    chip.addEventListener('click', () => {
      activeAuthSource = 'manual';
      setSelectedCharacter(chip.dataset.pbChar, true);
    });
  });

  // 4. Welcome Stage Actions: Local Mode vs Create Room vs Join Room
  const startBtn = document.getElementById('btn-pb-start');
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      enterLocalPhotoboothMode();
      showPhotoboothToast('✨ Masuk ke Studio Kamera dalam Mode Lokal (1 Peserta). Nyalakan kamera untuk mulai berfoto!');
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

  // 5. Room Bar Controls: Copy Code & Leave Room
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

  // 6. Camera & File Upload Controls
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

  const stopCamBtn = document.getElementById('btn-pb-stop-camera');
  if (stopCamBtn) {
    stopCamBtn.addEventListener('click', () => {
      stopLocalCamera(true);
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

  // 7. Capture, Retake & Layout Selector (2, 3, 4 Panels — Preserves Poses!)
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

      // CRITICAL: Do NOT slice or delete capturedPoses when switching layout!
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

  // 8. Stage D: Photo Strip Customizer (Frames, Captions, Stickers, Date, Download)
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

  // Initial UI render
  updateRoomPresenceUI();
  updateCameraControlsUI();
  renderPosesTray();
  renderPhotoStripCanvas();

  return controller;
}
