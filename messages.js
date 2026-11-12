/**
 * OUR LITTLE MESSAGES — CORE DATA & BUSINESS LOGIC (FASE 6)
 * Pairwise & Trio realtime messaging between Nyanya ★, Lala ☼, and Lele 🌙.
 * Enhanced with WhatsApp-like rich media: photos, videos, documents, audio, and voice notes.
 */

import {
  auth,
  dbSendMessage as firebaseSendMessage,
  dbFetchMessages as firebaseFetchMessages,
  dbSubscribeMessages as firebaseSubscribeMessages,
  dbFetchConversations as firebaseFetchConversations,
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

export const CHARACTERS_MESSAGES = {
  nyanya: {
    key: 'nyanya',
    name: 'Nyanya',
    owner: 'Vanya',
    symbol: '★',
    universe: 'KIDULT',
    avatar: '/assets/avatar_nyanya_hd.png',
    badgeColor: '#fef08a',
    accentColor: '#ec4899'
  },
  lala: {
    key: 'lala',
    name: 'Lala',
    owner: 'Bella',
    symbol: '☼',
    universe: 'TO YOU',
    avatar: '/assets/avatar_lala_hd.png',
    badgeColor: '#fde68a',
    accentColor: '#10b981'
  },
  lele: {
    key: 'lele',
    name: 'Lele',
    owner: 'Alenda',
    symbol: '☾',
    universe: 'SHADOW',
    avatar: '/assets/avatar_lele_hd.png',
    badgeColor: '#e9d5ff',
    accentColor: '#a855f7'
  }
};

let activeUserCharacter = 'nyanya';
let activeConversationId = 'lala_nyanya';
let activeUnsubscribe = null;
let conversationListeners = [];

// In-memory message store per conversation ID
const inMemoryMessages = {
  lala_nyanya: [],
  lele_nyanya: [],
  lala_lele: [],
  all_friends: []
};

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
  } catch (_) {}
}

// Hydrate in-memory store from local cache
const initialCache = loadCacheFromStorage();
Object.keys(inMemoryMessages).forEach((convId) => {
  if (Array.isArray(initialCache[convId])) {
    inMemoryMessages[convId] = initialCache[convId];
  }
});

/**
 * Gets the current active user character key.
 * Always prioritizes verified Firebase Auth character identity to prevent permission mismatch.
 */
export function getActiveUserCharacter() {
  if (auth && auth.currentUser) {
    const verified = getVerifiedCharacterKey(auth.currentUser);
    if (verified && CHARACTERS_MESSAGES[verified]) {
      if (activeUserCharacter !== verified) {
        activeUserCharacter = verified;
      }
      return verified;
    }
  }
  return activeUserCharacter;
}

export function setActiveUserCharacter(charKey) {
  if (charKey === null || charKey === undefined || charKey === '') {
    activeUserCharacter = null;
    notifyConversationListeners();
    return;
  }
  if (CHARACTERS_MESSAGES[charKey]) {
    activeUserCharacter = charKey;
    // Ensure active conversation includes the new character
    if (!CONVERSATION_PARTICIPANTS[activeConversationId]?.includes(charKey)) {
      const partners = Object.keys(CHARACTERS_MESSAGES).filter((c) => c !== charKey);
      activeConversationId = getConversationId(charKey, partners[0]);
    }
  }
  notifyConversationListeners();
}

export function setActiveConversationId(convId) {
  const current = getActiveUserCharacter();
  if (CONVERSATION_PARTICIPANTS[convId] && CONVERSATION_PARTICIPANTS[convId].includes(current)) {
    activeConversationId = convId;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_ACTIVE_CONV, convId);
      } catch (_) {}
    }
    notifyConversationListeners();
  } else {
    // If not participant in target conv, route to default valid conversation
    const partners = Object.keys(CHARACTERS_MESSAGES).filter((c) => c !== current);
    activeConversationId = getConversationId(current, partners[0]);
    notifyConversationListeners();
  }
}

export function getActiveConversationId() {
  const current = getActiveUserCharacter();
  if (!CONVERSATION_PARTICIPANTS[activeConversationId]?.includes(current)) {
    const partners = Object.keys(CHARACTERS_MESSAGES).filter((c) => c !== current);
    activeConversationId = getConversationId(current, partners[0]);
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

export function getAvailableConversations(viewerChar) {
  const current = viewerChar && CHARACTERS_MESSAGES[viewerChar] ? viewerChar : getActiveUserCharacter();
  const list = [];

  // Pairwise chats
  const otherChars = Object.keys(CHARACTERS_MESSAGES).filter((c) => c !== current);
  otherChars.forEach((otherKey) => {
    const otherChar = CHARACTERS_MESSAGES[otherKey];
    const convId = getConversationId(current, otherKey);
    const msgs = inMemoryMessages[convId] || [];
    const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;

    list.push({
      id: convId,
      type: 'direct',
      partnerKey: otherKey,
      title: `${otherChar.name} ${otherChar.symbol}`,
      subtitle: `Universe ${otherChar.universe}`,
      avatar: otherChar.avatar,
      participants: [current, otherKey],
      lastMessage: getMessagePreviewSnippet(lastMsg),
      lastMessageTime: lastMsg ? formatMessageTimestamp(lastMsg.createdAt) : '',
      lastMessageTimestamp: lastMsg ? lastMsg.createdAt : 0,
      unreadCount: msgs.filter((m) => m.senderCharacter !== current && (!m.readBy || !m.readBy[current])).length
    });
  });

  // Trio group chat
  const trioMsgs = inMemoryMessages['all_friends'] || [];
  const trioLastMsg = trioMsgs.length > 0 ? trioMsgs[trioMsgs.length - 1] : null;
  const trioSender = trioLastMsg ? (CHARACTERS_MESSAGES[trioLastMsg.senderCharacter]?.name || 'Sahabat') : '';
  const trioSnippet = trioLastMsg ? `${trioSender}: ${getMessagePreviewSnippet(trioLastMsg)}` : 'Percakapan grup kita bertiga ✨';

  list.push({
    id: 'all_friends',
    type: 'group',
    partnerKey: 'all',
    title: 'Tiga Sahabat (Little Universe)',
    subtitle: 'Nyanya ★, Lala ☼, Lele ☾',
    avatar: '/assets/avatar_nyanya_hd.png',
    participants: ['nyanya', 'lala', 'lele'],
    lastMessage: trioSnippet,
    lastMessageTime: trioLastMsg ? formatMessageTimestamp(trioLastMsg.createdAt) : '',
    lastMessageTimestamp: trioLastMsg ? trioLastMsg.createdAt : 0,
    unreadCount: trioMsgs.filter((m) => m.senderCharacter !== current && (!m.readBy || !m.readBy[current])).length
  });

  return list;
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
  return inMemoryMessages[convId] || [];
}

/**
 * Sends a text message in the active conversation.
 * Handles optimistic UI, actual cloud persistence, and explicit error status.
 */
export async function sendMessage(text, convId = getActiveConversationId()) {
  const validation = validateMessageInput(text);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const current = getActiveUserCharacter();
  const char = CHARACTERS_MESSAGES[current];
  const participants = CONVERSATION_PARTICIPANTS[convId] || ['lala', 'nyanya'];

  if (!participants.includes(current)) {
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
    status: 'sending' // 'sending' | 'sent' | 'failed'
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
    const savedMessage = await firebaseSendMessage(
      {
        conversationId: convId,
        text: validation.text,
        type: 'text'
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
  const current = getActiveUserCharacter();
  const char = CHARACTERS_MESSAGES[current];
  const participants = CONVERSATION_PARTICIPANTS[convId] || ['lala', 'nyanya'];

  if (!participants.includes(current)) {
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

  // Generate temporary local object URL for instant preview in bubble
  let localPreviewUrl = '';
  if (typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    try {
      localPreviewUrl = URL.createObjectURL(payloadSource);
    } catch (_) {}
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
    status: 'uploading', // 'uploading' | 'sent' | 'failed'
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
        waveform
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
  const msgs = inMemoryMessages[convId] || [];
  const msg = msgs.find((m) => m.id === msgId);
  if (!msg || msg.status !== 'failed') return;

  // Remove existing failed optimistic message
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
 */
export function subscribeToActiveConversation(convId = getActiveConversationId(), onUpdate, onError) {
  if (activeUnsubscribe) {
    activeUnsubscribe();
    activeUnsubscribe = null;
  }

  const current = getActiveUserCharacter();
  if (!CONVERSATION_PARTICIPANTS[convId]?.includes(current)) {
    const partners = Object.keys(CHARACTERS_MESSAGES).filter((c) => c !== current);
    convId = getConversationId(current, partners[0]);
    activeConversationId = convId;
  }

  if (!auth || !auth.currentUser) {
    // When offline, deliver cached messages immediately
    const cached = inMemoryMessages[convId] || [];
    if (typeof onUpdate === 'function') onUpdate(cached);
    return () => {};
  }

  try {
    activeUnsubscribe = firebaseSubscribeMessages(
      convId,
      auth.currentUser,
      (cloudMessages) => {
        // Merge cloud messages with any pending local uploads
        const pending = (inMemoryMessages[convId] || []).filter((m) => m.status === 'uploading' || m.status === 'sending');
        const formatted = cloudMessages.map((m) => ({ ...m, status: 'sent' }));
        inMemoryMessages[convId] = [...formatted, ...pending];

        // Update local cache
        const cache = loadCacheFromStorage();
        cache[convId] = formatted;
        saveCacheToStorage(cache);

        if (typeof onUpdate === 'function') onUpdate(inMemoryMessages[convId]);
        notifyConversationListeners();
      },
      (err) => {
        console.warn('Realtime messages subscription error:', err);
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

export function subscribeConversationList(listener) {
  conversationListeners.push(listener);
  try {
    listener(getAvailableConversations());
  } catch (_) {}
  return () => {
    conversationListeners = conversationListeners.filter((l) => l !== listener);
  };
}

function notifyConversationListeners() {
  const convs = getAvailableConversations();
  conversationListeners.forEach((l) => {
    try {
      l(convs);
    } catch (_) {}
  });
}
