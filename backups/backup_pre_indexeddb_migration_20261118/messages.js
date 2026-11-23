/**
 * OUR LITTLE MESSAGES — CORE DATA & BUSINESS LOGIC (FASE 6)
 * Equal Access & WhatsApp-Style Inbox for all 8 Universe Characters:
 * Nyanya ★, Lala ☼, Lele ☾, Syma ☁️, Akhira ⚡, Ela 🌸, Ruben ❄️, Royan 🎆.
 * Enhanced with WhatsApp-like rich media: photos, videos, documents, audio, and voice notes.
 */

import {
  auth,
  dbSendMessage as firebaseSendMessage,
  dbFetchMessages as firebaseFetchMessages,
  dbSubscribeMessages as firebaseSubscribeMessages,
  dbFetchConversations as firebaseFetchConversations,
  dbSubscribeConversations as firebaseSubscribeConversations,
  dbSubscribeUserMessages as firebaseSubscribeUserMessages,
  dbMarkConversationMessagesRead as firebaseMarkConversationMessagesRead,
  dbUploadMessageMedia,
  dbFetchMessageBlob,
  dbCreateMessageObjectURL,
  dbRevokeMessageObjectURLs,
  MAX_MESSAGE_MEDIA_SIZE_BYTES,
  getConversationId,
  CONVERSATION_PARTICIPANTS,
  getVerifiedCharacterKey
} from './firebase.js';

export const STORAGE_KEY_MESSAGES_CACHE = 'olu_messages_cache_v1';
export const STORAGE_KEY_ACTIVE_CONV = 'olu_active_conversation_v1';

export {
  getConversationId,
  CONVERSATION_PARTICIPANTS,
  dbFetchMessageBlob,
  dbCreateMessageObjectURL,
  dbRevokeMessageObjectURLs,
  MAX_MESSAGE_MEDIA_SIZE_BYTES
};

// 8 Canonical Characters definition for equal access across Our Little Messages
export const CHARACTERS_MESSAGES = {
  nyanya: {
    key: 'nyanya',
    name: 'Nyanya',
    owner: 'Alenda',
    symbol: '⭐',
    universe: 'KIDULT',
    avatar: '/assets/avatar_nyanya_hd.png',
    badgeColor: '#fef08a',
    accentColor: '#c084fc'
  },
  lala: {
    key: 'lala',
    name: 'Lala',
    owner: 'Bella',
    symbol: '☀️',
    universe: 'TO YOU',
    avatar: '/assets/avatar_lala_hd.png',
    badgeColor: '#fde68a',
    accentColor: '#f472b6'
  },
  lele: {
    key: 'lele',
    name: 'Lele',
    owner: 'Vanya',
    symbol: '🌙',
    universe: 'SHADOW',
    avatar: '/assets/avatar_lele_hd.png',
    badgeColor: '#e9d5ff',
    accentColor: '#60a5fa'
  },
  abil: {
    key: 'abil',
    name: 'Syma',
    owner: 'Syma',
    symbol: '☁️',
    universe: 'PINWHEEL',
    avatar: '/assets/avatar_abil_hd.jpg',
    badgeColor: '#f5d0fe',
    accentColor: '#e879f9'
  },
  akhira: {
    key: 'akhira',
    name: 'Akhira',
    owner: 'Akhira',
    symbol: '⚡',
    universe: 'YAWN',
    avatar: '/assets/avatar_akhira_hd.jpg',
    badgeColor: '#bae6fd',
    accentColor: '#38bdf8'
  },
  ela: {
    key: 'ela',
    name: 'Ela',
    owner: 'Ela',
    symbol: '🌸',
    universe: 'US AGAIN',
    avatar: '/assets/avatar_ela_hd.jpg',
    badgeColor: '#fed7aa',
    accentColor: '#fb923c'
  },
  ruben: {
    key: 'ruben',
    name: 'Ruben',
    owner: 'Ruben',
    symbol: '🐉',
    universe: 'ASH',
    avatar: '/assets/avatar_ruben_hd.jpg',
    badgeColor: '#bbf7d0',
    accentColor: '#4ade80'
  },
  royan: {
    key: 'royan',
    name: 'Royan',
    owner: 'Royan',
    symbol: '🎆',
    universe: 'HOT',
    avatar: '/assets/avatar_royan_hd.jpg',
    badgeColor: '#fecaca',
    accentColor: '#f87171'
  }
};

// Recognize Syma alias
CHARACTERS_MESSAGES.syma = CHARACTERS_MESSAGES.abil;

let activeUserCharacter = null;
let activeConversationId = null;
let activeUnsubscribe = null;
let conversationListeners = [];
let remoteConversations = [];
let remoteConvUnsubscribe = null;
let userMessagesUnsubscribe = null;
let onIncomingMessageCallback = null;

// Dynamic In-memory message store per conversation ID (no hardcoded dummy chats)
const inMemoryMessages = {};

// --- Local Storage Cache Helpers ---
function loadCacheFromStorage() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
}

function saveCacheToStorage(cache) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES_CACHE, JSON.stringify(cache));
  } catch (_) { }
}

// Hydrate in-memory store from local cache
const initialCache = loadCacheFromStorage();
if (initialCache && typeof initialCache === 'object') {
  Object.keys(initialCache).forEach((convId) => {
    if (Array.isArray(initialCache[convId])) {
      inMemoryMessages[convId] = initialCache[convId];
    }
  });
}

/**
 * Gets the current active user character key.
 * Always prioritizes verified Firebase Auth character identity to prevent permission mismatch.
 * Never defaults or falls back to 'nyanya' for other users.
 */
export function getActiveUserCharacter() {
  if (auth && auth.currentUser) {
    const verified = getVerifiedCharacterKey(auth.currentUser);
    if (verified) {
      const canonicalKey = verified === 'syma' ? 'abil' : verified;
      if (CHARACTERS_MESSAGES[canonicalKey]) {
        activeUserCharacter = canonicalKey;
        return canonicalKey;
      }
    }
  }
  return activeUserCharacter || null;
}

export function setActiveUserCharacter(charKey) {
  if (!charKey) {
    activeUserCharacter = null;
    activeConversationId = null;
    notifyConversationListeners();
    return;
  }
  const normKey = charKey === 'syma' ? 'abil' : charKey;
  if (CHARACTERS_MESSAGES[normKey]) {
    activeUserCharacter = normKey;
    // If active conversation does not include new character, reset it cleanly
    if (activeConversationId && !CONVERSATION_PARTICIPANTS[activeConversationId]?.includes(normKey)) {
      activeConversationId = null;
    }
  }
  notifyConversationListeners();
}

export function setActiveConversationId(convId) {
  const current = getActiveUserCharacter();
  if (!convId) {
    activeConversationId = null;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEY_ACTIVE_CONV);
      } catch (_) { }
    }
    notifyConversationListeners();
    return;
  }
  if (!current) {
    activeConversationId = null;
    notifyConversationListeners();
    return;
  }
  const parts = CONVERSATION_PARTICIPANTS[convId];
  if (parts && (parts.includes(current) || (current === 'abil' && parts.includes('syma')))) {
    activeConversationId = convId;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE_CONV, convId);
      } catch (_) { }
    }
    notifyConversationListeners();
  }
}

export function getActiveConversationId() {
  const current = getActiveUserCharacter();
  if (!current || !activeConversationId) return null;
  const parts = CONVERSATION_PARTICIPANTS[activeConversationId];
  if (!parts || (!parts.includes(current) && !(current === 'abil' && parts.includes('syma')))) {
    return null;
  }
  return activeConversationId;
}

function getMessagePreviewSnippet(msg) {
  if (!msg) return 'Belum ada pesan';
  if (msg.type === 'image') return msg.text ? `📷 ${msg.text}` : '📷 Foto';
  if (msg.type === 'video') return msg.text ? `🎥 ${msg.text}` : '🎥 Video';
  if (msg.type === 'voice') return '🎙️ Pesan Suara';
  if (msg.type === 'audio') return `🎵 ${msg.fileName || 'Audio'}`;
  if (msg.type === 'file') return `📎 ${msg.fileName || 'Dokumen'}`;
  return msg.text || '';
}

/**
 * Returns available conversations in a WhatsApp-like inbox model.
 * New users with 0 message history see an empty inbox (empty array).
 * Only conversations that contain actual messages or are actively initiated by the user are listed.
 * Sorted by latest message timestamp descending.
 */
export function getAvailableConversations(viewerChar) {
  const current = viewerChar
    ? (viewerChar === 'syma' ? 'abil' : viewerChar)
    : getActiveUserCharacter();

  if (!current) return [];

  const conversationMap = new Map();

  // 1. Process remote conversations from Firestore
  if (Array.isArray(remoteConversations)) {
    remoteConversations.forEach((rc) => {
      if (rc && Array.isArray(rc.participants)) {
        const isParticipant =
          rc.participants.includes(current) ||
          (current === 'abil' && rc.participants.includes('syma'));
        if (isParticipant) {
          conversationMap.set(rc.id, rc);
        }
      }
    });
  }

  // 2. Process inMemoryMessages that have at least 1 message
  Object.keys(inMemoryMessages).forEach((convId) => {
    const msgs = inMemoryMessages[convId];
    if (Array.isArray(msgs) && msgs.length > 0) {
      const parts = CONVERSATION_PARTICIPANTS[convId];
      if (parts && (parts.includes(current) || (current === 'abil' && parts.includes('syma')))) {
        if (!conversationMap.has(convId)) {
          conversationMap.set(convId, {
            id: convId,
            participants: parts,
            lastMessage: getMessagePreviewSnippet(msgs[msgs.length - 1]),
            lastMessageAt: msgs[msgs.length - 1].createdAt || 0,
            updatedAt: msgs[msgs.length - 1].createdAt || 0
          });
        }
      }
    }
  });

  // 3. If there is an actively initiated conversation (e.g. user just clicked + Chat with a friend), include it
  if (activeConversationId && !conversationMap.has(activeConversationId)) {
    const parts = CONVERSATION_PARTICIPANTS[activeConversationId];
    if (parts && (parts.includes(current) || (current === 'abil' && parts.includes('syma')))) {
      conversationMap.set(activeConversationId, {
        id: activeConversationId,
        participants: parts,
        lastMessage: 'Belum ada pesan',
        lastMessageAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }

  // Build items array
  const list = [];
  conversationMap.forEach((conv, convId) => {
    const msgs = inMemoryMessages[convId] || [];
    const isGroup = convId === 'all_friends';
    let title = '';
    let subtitle = '';
    let avatar = '';
    let partnerKey = '';

    if (isGroup) {
      title = 'Tiga Sahabat (Little Universe)';
      subtitle = 'Grup Bersama';
      avatar = '/assets/avatar_nyanya_hd.png';
      partnerKey = 'all';
    } else {
      const parts = Array.isArray(conv.participants) ? conv.participants : CONVERSATION_PARTICIPANTS[convId] || [];
      const otherKey = parts.find((p) => p !== current && p !== 'syma') || parts[0] || 'sahabat';
      const normOther = otherKey === 'syma' ? 'abil' : otherKey;
      const otherChar = CHARACTERS_MESSAGES[normOther] || {
        name: 'Sahabat',
        symbol: '✦',
        universe: 'Universe',
        avatar: '/assets/avatar_abil_hd.jpg'
      };
      partnerKey = normOther;
      title = `${otherChar.name} ${otherChar.symbol}`;
      subtitle = `Universe ${otherChar.universe}`;
      avatar = otherChar.avatar;
    }

    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
    const snippet = lastMsg
      ? (isGroup ? `${CHARACTERS_MESSAGES[lastMsg.senderCharacter]?.name || 'Sahabat'}: ${getMessagePreviewSnippet(lastMsg)}` : getMessagePreviewSnippet(lastMsg))
      : (conv.lastMessage || 'Belum ada pesan');

    const lastTime = lastMsg
      ? formatMessageTimestamp(lastMsg.createdAt)
      : (conv.lastMessageAt ? formatMessageTimestamp(conv.lastMessageAt) : '');

    const lastTimestamp = lastMsg ? (lastMsg.createdAt || 0) : (conv.lastMessageAt || 0);

    const unreadCount = msgs.filter(
      (m) => m.senderCharacter !== current && (!m.readBy || !m.readBy[current])
    ).length;

    list.push({
      id: convId,
      type: isGroup ? 'group' : 'direct',
      partnerKey,
      title,
      subtitle,
      avatar,
      participants: conv.participants || CONVERSATION_PARTICIPANTS[convId] || [current],
      lastMessage: snippet,
      lastMessageTime: lastTime,
      lastMessageTimestamp: lastTimestamp,
      unreadCount
    });
  });

  // Sort by newest activity (lastMessageTimestamp descending)
  list.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));

  return list;
}

/**
 * Returns available universe friends to initiate a new direct chat with.
 * Excludes the current user and aliases.
 */
export function getAvailableFriendsToChat(viewerChar) {
  const current = viewerChar
    ? (viewerChar === 'syma' ? 'abil' : viewerChar)
    : getActiveUserCharacter();

  const canonicalList = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];
  return canonicalList
    .filter((k) => k !== current && !(current === 'abil' && k === 'abil'))
    .map((k) => CHARACTERS_MESSAGES[k])
    .filter(Boolean);
}

/**
 * Initiates a new conversation with a friend.
 * Sets the active conversation and notifies listeners without writing empty spam to cloud.
 */
export function startNewConversation(partnerKey) {
  const current = getActiveUserCharacter();
  if (!current || !partnerKey) return null;
  const normPartner = partnerKey === 'syma' ? 'abil' : partnerKey;
  if (current === normPartner) return null;

  const convId = getConversationId(current, normPartner);
  activeConversationId = convId;
  if (!inMemoryMessages[convId]) {
    inMemoryMessages[convId] = [];
  }
  notifyConversationListeners();
  return convId;
}

export function validateMessageInput(text) {
  if (!text || typeof text !== 'string') {
    return { valid: false, error: 'Pesan tidak boleh kosong.' };
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { valid: false, error: 'Pesan tidak boleh hanya berisi spasi kosong.' };
  }
  if (trimmed.length > 2000) {
    return { valid: false, error: `Pesan terlalu panjang (${trimmed.length} karakter). Maksimal 2000 karakter.` };
  }
  return { valid: true, text: trimmed };
}

export function formatMessageTimestamp(timestampMs) {
  if (!timestampMs) return '';
  const date = new Date(timestampMs);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;

  if (isToday) {
    return timeStr;
  }

  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const month = monthNames[date.getMonth()];

  return `${day} ${month}, ${timeStr}`;
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 1 ? 1 : 0)} ${units[i]}`;
}

export function getCachedMessages(convId = getActiveConversationId()) {
  if (!convId) return [];
  return inMemoryMessages[convId] || [];
}

/**
 * Sends a text message in the active conversation.
 * Handles optimistic UI, actual cloud persistence, and explicit error status.
 */
export async function sendMessage(text, convId = getActiveConversationId()) {
  if (!convId) {
    throw new Error('Pilih percakapan terlebih dahulu sebelum mengirim pesan.');
  }

  const validation = validateMessageInput(text);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const current = getActiveUserCharacter();
  if (!current || !CHARACTERS_MESSAGES[current]) {
    throw new Error('Identitas pengguna tidak terverifikasi.');
  }

  const char = CHARACTERS_MESSAGES[current];
  const participants = CONVERSATION_PARTICIPANTS[convId] || [current];

  if (!participants.includes(current) && !(current === 'abil' && participants.includes('syma'))) {
    throw new Error(`Akses ditolak: Anda bukan partisipan dalam percakapan ${convId}.`);
  }

  const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const optimisticMessage = {
    id: tempId,
    conversationId: convId,
    senderUid: auth?.currentUser?.uid || 'local-uid',
    senderCharacter: current,
    senderName: char.name,
    senderAvatar: char.avatar,
    participants,
    text: validation.text,
    type: 'text',
    createdAt: Date.now(),
    status: 'sending'
  };

  if (!inMemoryMessages[convId]) inMemoryMessages[convId] = [];
  inMemoryMessages[convId].push(optimisticMessage);
  notifyConversationListeners();

  if (!auth || !auth.currentUser) {
    optimisticMessage.status = 'failed';
    optimisticMessage.error = 'Belum terhubung ke Cloud. Masuk dengan akun karakter resmi untuk mengirim pesan.';
    const cache = loadCacheFromStorage();
    cache[convId] = inMemoryMessages[convId];
    saveCacheToStorage(cache);
    notifyConversationListeners();
    throw new Error('Belum terhubung ke Cloud. Masuk dengan akun karakter resmi untuk mengirim pesan.');
  }

  const otherChar = convId !== 'all_friends'
    ? participants.find(p => p !== current && !(current === 'abil' && p === 'syma') && !(current === 'syma' && p === 'abil'))
    : null;

  try {
    const savedMessage = await firebaseSendMessage(
      {
        conversationId: convId,
        text: validation.text,
        type: 'text',
        recipientCharacter: otherChar || undefined
      },
      auth.currentUser
    );

    const idx = inMemoryMessages[convId].findIndex((m) => m.id === tempId);
    if (idx !== -1) {
      inMemoryMessages[convId][idx] = {
        ...savedMessage,
        status: 'sent'
      };
    }

    const cache = loadCacheFromStorage();
    cache[convId] = inMemoryMessages[convId];
    saveCacheToStorage(cache);

    notifyConversationListeners();
    return savedMessage;
  } catch (err) {
    optimisticMessage.status = 'failed';
    optimisticMessage.error = err.message || 'Gagal mengirim pesan.';
    const cache = loadCacheFromStorage();
    cache[convId] = inMemoryMessages[convId];
    saveCacheToStorage(cache);
    notifyConversationListeners();
    throw err;
  }
}

/**
 * Sends a rich media message (image, video, doc, audio, voice note) with optional text caption.
 */
export async function sendMediaMessage({
  file = null,
  blob = null,
  type = 'file',
  text = '',
  convId = getActiveConversationId(),
  fileName = '',
  mimeType = '',
  duration = null,
  waveform = null,
  onProgress = null
} = {}) {
  if (!convId) {
    throw new Error('Pilih percakapan terlebih dahulu sebelum mengirim media.');
  }

  const current = getActiveUserCharacter();
  if (!current || !CHARACTERS_MESSAGES[current]) {
    throw new Error('Identitas pengguna tidak terverifikasi.');
  }

  const char = CHARACTERS_MESSAGES[current];
  const participants = CONVERSATION_PARTICIPANTS[convId] || [current];

  if (!participants.includes(current) && !(current === 'abil' && participants.includes('syma'))) {
    throw new Error(`Akses ditolak: Anda bukan partisipan dalam percakapan ${convId}.`);
  }

  const payloadSource = file || blob;
  if (!payloadSource) {
    throw new Error('Tidak ada file atau audio yang dipilih untuk dikirim.');
  }

  const size = payloadSource.size || 0;
  if (size <= 0) {
    throw new Error('File media kosong.');
  }
  if (size > MAX_MESSAGE_MEDIA_SIZE_BYTES) {
    throw new Error(`Ukuran file melebihi batas 50 MB (${formatFileSize(size)}).`);
  }

  const effectiveFileName = fileName || (file && file.name) || (type === 'voice' ? 'pesan_suara.webm' : 'lampiran');
  const effectiveMime = mimeType || (file && file.type) || (blob && blob.type) || 'application/octet-stream';
  const trimmedText = typeof text === 'string' ? text.trim() : '';

  let localPreviewUrl = '';
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      localPreviewUrl = URL.createObjectURL(payloadSource);
    } catch (_) { }
  }

  const tempId = `temp-media-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const optimisticMessage = {
    id: tempId,
    conversationId: convId,
    senderUid: auth?.currentUser?.uid || 'local-uid',
    senderCharacter: current,
    senderName: char.name,
    senderAvatar: char.avatar,
    participants,
    text: trimmedText,
    type,
    localUrl: localPreviewUrl,
    fileName: effectiveFileName,
    fileSize: size,
    mimeType: effectiveMime,
    duration,
    waveform,
    createdAt: Date.now(),
    status: 'uploading',
    progress: 10,
    retryPayload: { file, blob, type, text: trimmedText, convId, fileName: effectiveFileName, mimeType: effectiveMime, duration, waveform }
  };

  if (!inMemoryMessages[convId]) inMemoryMessages[convId] = [];
  inMemoryMessages[convId].push(optimisticMessage);
  notifyConversationListeners();

  if (!auth || !auth.currentUser) {
    optimisticMessage.status = 'failed';
    optimisticMessage.error = 'Belum terhubung ke Cloud. Masuk dengan akun karakter resmi untuk mengirim pesan.';
    const cache = loadCacheFromStorage();
    cache[convId] = inMemoryMessages[convId];
    saveCacheToStorage(cache);
    notifyConversationListeners();
    throw new Error('Belum terhubung ke Cloud. Masuk dengan akun karakter resmi untuk mengirim pesan.');
  }

  try {
    if (typeof onProgress === 'function') onProgress(30);
    optimisticMessage.progress = 40;
    notifyConversationListeners();

    // 1. Upload to Firebase Storage
    const uploadRes = await dbUploadMessageMedia(auth.currentUser, {
      file,
      blob,
      conversationId: convId,
      fileName: effectiveFileName,
      mimeType: effectiveMime,
      type
    });

    if (typeof onProgress === 'function') onProgress(75);
    optimisticMessage.progress = 80;
    notifyConversationListeners();

    // 2. Persist message record to Firestore
    const otherChar = convId !== 'all_friends'
      ? participants.find(p => p !== current && !(current === 'abil' && p === 'syma') && !(current === 'syma' && p === 'abil'))
      : null;

    const savedMessage = await firebaseSendMessage(
      {
        conversationId: convId,
        text: trimmedText,
        type,
        storagePath: uploadRes.storagePath,
        fileName: uploadRes.fileName,
        fileSize: uploadRes.fileSize,
        mimeType: uploadRes.mimeType,
        duration,
        waveform,
        recipientCharacter: otherChar || undefined
      },
      auth.currentUser
    );

    const idx = inMemoryMessages[convId].findIndex((m) => m.id === tempId);
    if (idx !== -1) {
      inMemoryMessages[convId][idx] = {
        ...savedMessage,
        localUrl: localPreviewUrl,
        status: 'sent'
      };
    }

    if (typeof onProgress === 'function') onProgress(100);

    const cache = loadCacheFromStorage();
    cache[convId] = inMemoryMessages[convId];
    saveCacheToStorage(cache);

    notifyConversationListeners();
    return savedMessage;
  } catch (err) {
    optimisticMessage.status = 'failed';
    optimisticMessage.error = err.message || 'Gagal mengunggah media.';
    const cache = loadCacheFromStorage();
    cache[convId] = inMemoryMessages[convId];
    saveCacheToStorage(cache);
    notifyConversationListeners();
    throw err;
  }
}

/**
 * Retries sending a failed message.
 */
export async function retryMessage(msgId, convId = getActiveConversationId()) {
  if (!convId) return;
  const msgs = inMemoryMessages[convId] || [];
  const msg = msgs.find((m) => m.id === msgId);
  if (!msg || msg.status !== 'failed') return;

  inMemoryMessages[convId] = msgs.filter((m) => m.id !== msgId);
  notifyConversationListeners();

  if (msg.retryPayload) {
    return await sendMediaMessage(msg.retryPayload);
  } else if (msg.text) {
    return await sendMessage(msg.text, convId);
  }
}

/**
 * Subscribes to realtime updates for the active conversation using Firestore onSnapshot.
 * Gracefully exits if no conversation is currently active.
 */
export function subscribeToActiveConversation(convId = getActiveConversationId(), onUpdate, onError) {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }

  const current = getActiveUserCharacter();
  if (!current || !convId) {
    activeConversationId = null;
    if (typeof onUpdate === 'function') onUpdate([]);
    return () => { };
  }

  const participants = CONVERSATION_PARTICIPANTS[convId];
  if (!participants || (!participants.includes(current) && !(current === 'abil' && participants.includes('syma')))) {
    activeConversationId = null;
    if (typeof onUpdate === 'function') onUpdate([]);
    return () => { };
  }

  if (!auth || !auth.currentUser) {
    const cached = inMemoryMessages[convId] || [];
    if (typeof onUpdate === 'function') onUpdate(cached);
    return () => { };
  }

  try {
    activeUnsubscribe = firebaseSubscribeMessages(
      convId,
      auth.currentUser,
      (cloudMessages) => {
        const pending = (inMemoryMessages[convId] || []).filter((m) => m.status === 'uploading' || m.status === 'sending');
        const formatted = cloudMessages.map((m) => ({ ...m, status: 'sent' }));
        inMemoryMessages[convId] = [...formatted, ...pending];

        const cache = loadCacheFromStorage();
        cache[convId] = formatted;
        saveCacheToStorage(cache);

        if (typeof onUpdate === 'function') onUpdate(inMemoryMessages[convId]);
        notifyConversationListeners();
      },
      (err) => {
        console.warn('Realtime messages subscription notice:', err);
        if (typeof onError === 'function') onError(err);
      }
    );
  } catch (err) {
    console.warn('Gagal memulai langganan realtime pesan:', err);
    if (typeof onError === 'function') onError(err);
  }

  return () => {
    if (activeUnsubscribe) {
      activeUnsubscribe();
      activeUnsubscribe = null;
    }
  };
}

/**
 * Marks messages in the active conversation as read.
 */
export async function markActiveConversationRead(convId = getActiveConversationId()) {
  const current = getActiveUserCharacter();
  if (!convId || !current) return;

  if (Array.isArray(inMemoryMessages[convId])) {
    let changed = false;
    inMemoryMessages[convId].forEach((m) => {
      if (m.senderCharacter !== current && (!m.readBy || !m.readBy[current])) {
        if (!m.readBy) m.readBy = {};
        m.readBy[current] = true;
        changed = true;
      }
    });
    if (changed) {
      const cache = loadCacheFromStorage();
      cache[convId] = inMemoryMessages[convId];
      saveCacheToStorage(cache);
      notifyConversationListeners();
    }
  }

  if (auth && auth.currentUser) {
    try {
      await firebaseMarkConversationMessagesRead(convId, auth.currentUser);
    } catch (_) { }
  }
}

/**
 * Real-time synchronization of conversations and incoming message notifications.
 */
export function initMessagesRealtimeSync(onIncomingMessage) {
  if (!auth) return () => { };

  if (typeof onIncomingMessage === 'function') {
    onIncomingMessageCallback = onIncomingMessage;
  }

  return auth.onAuthStateChanged((user) => {
    if (remoteConvUnsubscribe) {
      remoteConvUnsubscribe();
      remoteConvUnsubscribe = null;
    }
    if (userMessagesUnsubscribe) {
      userMessagesUnsubscribe();
      userMessagesUnsubscribe = null;
    }

    if (user) {
      const verified = getVerifiedCharacterKey(user);
      if (verified) {
        activeUserCharacter = verified === 'syma' ? 'abil' : verified;
      }

      remoteConvUnsubscribe = firebaseSubscribeConversations(
        user,
        (convs) => {
          remoteConversations = convs;
          notifyConversationListeners();
        },
        (err) => {
          console.warn('Remote conversations subscription notice:', err);
        }
      );

      userMessagesUnsubscribe = firebaseSubscribeUserMessages(
        user,
        (msg) => {
          if (activeConversationId && msg.conversationId === activeConversationId) {
            firebaseMarkConversationMessagesRead(activeConversationId, user).catch(() => { });
          }
          if (onIncomingMessageCallback) {
            onIncomingMessageCallback(msg);
          }
          notifyConversationListeners();
        },
        (err) => {
          console.warn('Remote user messages subscription notice:', err);
        }
      );
    } else {
      remoteConversations = [];
      activeUserCharacter = null;
      activeConversationId = null;
      notifyConversationListeners();
    }
  });
}

export function subscribeConversationList(listener) {
  conversationListeners.push(listener);
  try {
    listener(getAvailableConversations());
  } catch (_) { }
  return () => {
    conversationListeners = conversationListeners.filter((l) => l !== listener);
  };
}

function notifyConversationListeners() {
  const convs = getAvailableConversations();
  conversationListeners.forEach((l) => {
    try {
      l(convs);
    } catch (_) { }
  });
}
