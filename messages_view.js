/**
 * OUR LITTLE MESSAGES — UI CONTROLLER (FASE 6)
 * Orchestrates conversation selection, thread rendering, realtime sync,
 * and rich WhatsApp-like media messaging (photos, videos, docs, audio, voice notes).
 */

import { auth } from './firebase.js';
import {
  CHARACTERS_MESSAGES,
  getActiveUserCharacter,
  setActiveUserCharacter,
  getActiveConversationId,
  setActiveConversationId,
  getAvailableConversations,
  getCachedMessages,
  sendMessage,
  sendMediaMessage,
  retryMessage,
  subscribeToActiveConversation,
  subscribeConversationList,
  formatMessageTimestamp,
  formatDuration,
  formatFileSize,
  validateMessageInput,
  dbFetchMessageBlob,
  dbCreateMessageObjectURL,
  MAX_MESSAGE_MEDIA_SIZE_BYTES
} from './messages.js';

let isMessagesInitialized = false;
let previousMessagesViewId = 'view-private-universe';
let currentUnsubscribe = null;
let onShowToastCallback = null;

// Pending file attachment state
let pendingAttachment = null; // { file, type, name, size, mimeType, previewUrl }

// Audio recording state
let mediaRecorder = null;
let audioStream = null;
let recordedChunks = [];
let recordTimerInterval = null;
let recordStartTime = 0;
let isRecording = false;

// Audio player tracking to allow single playback at a time
let currentActiveAudio = null;

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function openMessagesView(fromView = 'view-private-universe', charKey = null) {
  previousMessagesViewId = fromView || 'view-private-universe';

  if (charKey && CHARACTERS_MESSAGES[charKey]) {
    setActiveUserCharacter(charKey);
  }

  const allViews = [
    'view-selection',
    'view-login',
    'view-private-universe',
    'view-kidult-world',
    'view-toyou-world',
    'view-shadow-world',
    'view-orbit',
    'view-moments',
    'view-photobooth',
    'view-our-stories',
    'view-story-workspace',
    'view-story-reading'
  ];

  allViews.forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.setAttribute('aria-hidden', 'true');
    }
  });

  const viewMessages = document.getElementById('view-messages');
  if (viewMessages) {
    viewMessages.classList.add('active');
    viewMessages.setAttribute('aria-hidden', 'false');
  }

  // Update navbar active state
  document.querySelectorAll('.univ-nav-btn[data-nav]').forEach((btn) => {
    const active = btn.getAttribute('data-nav') === 'messages';
    btn.classList.toggle('active', active);
    if (active) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Clear any open menus or pending attachments
  closeAttachMenu();
  clearPendingAttachment();
  cancelVoiceRecording();

  // Render UI
  renderActiveUserHeader();
  renderConversationListUI();
  setupActiveConversationSubscription();
}

export function closeMessagesView() {
  if (currentUnsubscribe) {
    currentUnsubscribe();
    currentUnsubscribe = null;
  }

  if (currentActiveAudio) {
    try {
      currentActiveAudio.pause();
    } catch (_) {}
    currentActiveAudio = null;
  }

  cancelVoiceRecording();
  clearPendingAttachment();
  closeAttachMenu();
  closeLightbox();

  const viewMessages = document.getElementById('view-messages');
  if (viewMessages) {
    viewMessages.classList.remove('active');
    viewMessages.setAttribute('aria-hidden', 'true');
  }

  const targetView =
    document.getElementById(previousMessagesViewId) ||
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

  if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function syncMessagesActiveCharacter(charKey) {
  if (charKey && CHARACTERS_MESSAGES[charKey]) {
    setActiveUserCharacter(charKey);
    renderActiveUserHeader();
    renderConversationListUI();
    setupActiveConversationSubscription();
  }
}

function renderActiveUserHeader() {
  const current = getActiveUserCharacter();
  const char = CHARACTERS_MESSAGES[current] || CHARACTERS_MESSAGES.nyanya;

  const avatarEl = document.getElementById('msg-active-user-avatar');
  const nameEl = document.getElementById('msg-active-user-name');
  const subEl = document.getElementById('msg-active-user-sub');

  if (avatarEl) {
    avatarEl.src = char.avatar;
    avatarEl.alt = char.name;
  }
  if (nameEl) {
    nameEl.textContent = `${char.name} ${char.symbol}`;
  }
  if (subEl) {
    subEl.textContent = `Universe ${char.universe}`;
  }
}

function renderConversationListUI() {
  const listContainer = document.getElementById('msg-conversation-list');
  if (!listContainer) return;

  const convs = getAvailableConversations();
  const currentConvId = getActiveConversationId();

  listContainer.innerHTML = '';
  convs.forEach((conv) => {
    const isActive = conv.id === currentConvId;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `msg-conv-item ${isActive ? 'active' : ''}`;
    btn.setAttribute('data-conv-id', conv.id);

    btn.innerHTML = `
      <img src="${escapeHtml(conv.avatar)}" alt="${escapeHtml(conv.title)}" class="msg-conv-avatar" />
      <div class="msg-conv-meta">
        <div class="msg-conv-row">
          <span class="msg-conv-name">${escapeHtml(conv.title)}</span>
          <span class="msg-conv-time">${escapeHtml(conv.lastMessageTime)}</span>
        </div>
        <div class="msg-conv-row">
          <p class="msg-conv-preview">${escapeHtml(conv.lastMessage)}</p>
          ${conv.unreadCount > 0 ? `<span class="msg-conv-badge">${conv.unreadCount}</span>` : ''}
        </div>
      </div>
    `;

    btn.addEventListener('click', () => {
      selectConversation(conv.id);
    });

    listContainer.appendChild(btn);
  });

  updateChatHeaderPartnerInfo();
}

function updateChatHeaderPartnerInfo() {
  const convId = getActiveConversationId();
  const convs = getAvailableConversations();
  const activeConv = convs.find((c) => c.id === convId) || convs[0];

  const avatarEl = document.getElementById('msg-partner-avatar');
  const nameEl = document.getElementById('msg-partner-name');
  const subEl = document.getElementById('msg-partner-sub');

  if (activeConv) {
    if (avatarEl) avatarEl.src = activeConv.avatar;
    if (nameEl) nameEl.textContent = activeConv.title;
    if (subEl) subEl.textContent = activeConv.subtitle;
  }
}

function getFileExtensionBadge(fileName = '') {
  const match = fileName.match(/\.([a-zA-Z0-9]+)$/);
  return match ? match[1].toUpperCase() : 'DOC';
}

function renderMessageThread(messages) {
  const feed = document.getElementById('msg-feed-area');
  if (!feed) return;

  const current = getActiveUserCharacter();

  if (!messages || messages.length === 0) {
    feed.innerHTML = `
      <div class="msg-empty-thread">
        <span class="msg-empty-icon">✉</span>
        <h4 class="msg-empty-title">Belum Ada Pesan</h4>
        <p class="msg-empty-desc">Kirim salam hangat atau surat rahasia pertamamu untuk membuka percakapan manis ini ✨</p>
      </div>
    `;
    return;
  }

  feed.innerHTML = '';
  messages.forEach((msg) => {
    const isMine = msg.senderCharacter === current;
    const char = CHARACTERS_MESSAGES[msg.senderCharacter] || CHARACTERS_MESSAGES.nyanya;
    const row = document.createElement('div');
    row.className = `msg-bubble-row ${isMine ? 'mine' : 'theirs'}`;

    let statusHtml = '';
    if (isMine) {
      if (msg.status === 'uploading' || msg.status === 'sending') {
        statusHtml = `<span class="msg-status-indicator" title="Mengirim...">⏳</span>`;
      } else if (msg.status === 'failed') {
        statusHtml = `<span class="msg-status-indicator failed" title="Gagal terkirim">⚠️ Gagal</span>`;
      } else {
        statusHtml = `<span class="msg-status-indicator" title="Terkirim ke Cloud">✓</span>`;
      }
    }

    // Media content renderers
    let mediaHtml = '';
    const msgType = msg.type || 'text';

    if (msgType === 'image') {
      const displayUrl = msg.localUrl || '';
      mediaHtml = `
        <div class="msg-bubble-media">
          <img
            src="${displayUrl}"
            data-storage-path="${escapeHtml(msg.storagePath || '')}"
            alt="Foto Percakapan"
            class="msg-bubble-media-img"
            loading="lazy"
          />
        </div>
      `;
    } else if (msgType === 'video') {
      const displayUrl = msg.localUrl || '';
      mediaHtml = `
        <div class="msg-bubble-media">
          <video
            src="${displayUrl}"
            data-storage-path="${escapeHtml(msg.storagePath || '')}"
            controls
            playsinline
            class="msg-bubble-media-video"
          ></video>
        </div>
      `;
    } else if (msgType === 'voice' || msgType === 'audio') {
      const isVoice = msgType === 'voice';
      const icon = isVoice ? '🎙️' : '🎵';
      const title = isVoice ? 'Pesan Suara' : (msg.fileName || 'Audio');
      const durationStr = formatDuration(msg.duration || 0);

      mediaHtml = `
        <div class="msg-bubble-media">
          <div class="msg-audio-player" data-storage-path="${escapeHtml(msg.storagePath || '')}" data-local-url="${escapeHtml(msg.localUrl || '')}">
            <button type="button" class="msg-audio-play-btn" title="Putar Audio">▶</button>
            <div class="msg-audio-track">
              <input type="range" class="msg-audio-slider" min="0" max="100" value="0" />
              <div class="msg-audio-meta">
                <span>${icon} ${escapeHtml(title)}</span>
                <span class="msg-audio-time-label">0:00 / ${durationStr}</span>
              </div>
            </div>
            <audio preload="none"></audio>
          </div>
        </div>
      `;
    } else if (msgType === 'file') {
      const ext = getFileExtensionBadge(msg.fileName);
      const sizeStr = formatFileSize(msg.fileSize || 0);

      mediaHtml = `
        <div class="msg-bubble-media">
          <div class="msg-doc-card">
            <div class="msg-doc-icon-badge">${escapeHtml(ext)}</div>
            <div class="msg-doc-info">
              <span class="msg-doc-title" title="${escapeHtml(msg.fileName || 'Dokumen')}">${escapeHtml(msg.fileName || 'Dokumen')}</span>
              <span class="msg-doc-sub">${sizeStr}</span>
            </div>
            <button type="button" class="msg-doc-download-btn" data-storage-path="${escapeHtml(msg.storagePath || '')}" data-filename="${escapeHtml(msg.fileName || 'dokumen')}" title="Unduh Dokumen">
              📥
            </button>
          </div>
        </div>
      `;
    }

    const textHtml = msg.text ? `<div class="msg-bubble-text">${escapeHtml(msg.text)}</div>` : '';
    const progressHtml = (msg.status === 'uploading' && msg.progress)
      ? `
        <div class="msg-upload-progress">
          <div class="msg-upload-bar" style="width: ${msg.progress}%;"></div>
        </div>
      `
      : '';

    const retryHtml = (isMine && msg.status === 'failed')
      ? `<button type="button" class="msg-retry-btn" data-retry-id="${escapeHtml(msg.id)}">↻ Coba lagi</button>`
      : '';

    const errorHtml = msg.error
      ? `<div class="msg-error-hint">${escapeHtml(msg.error)}</div>`
      : '';

    row.innerHTML = `
      ${!isMine ? `<img src="${escapeHtml(char.avatar)}" alt="${escapeHtml(char.name)}" class="msg-bubble-avatar" />` : ''}
      <div class="msg-bubble">
        ${!isMine ? `<div class="msg-bubble-sender">${escapeHtml(char.name)} ${escapeHtml(char.symbol)}</div>` : ''}
        ${mediaHtml}
        ${textHtml}
        <div class="msg-bubble-meta">
          <span class="msg-bubble-time">${formatMessageTimestamp(msg.createdAt)}</span>
          ${statusHtml}
        </div>
        ${progressHtml}
        ${retryHtml}
        ${errorHtml}
      </div>
    `;

    feed.appendChild(row);
  });

  // Attach interactive listeners to media bubbles
  attachMediaBubbleListeners(feed);

  // Scroll smoothly to bottom
  feed.scrollTop = feed.scrollHeight;
}

function attachMediaBubbleListeners(container) {
  // 1. Lazy fetch images without localUrl
  container.querySelectorAll('img.msg-bubble-media-img').forEach((img) => {
    const storagePath = img.dataset.storagePath;
    if (!img.src && storagePath && auth?.currentUser) {
      dbCreateMessageObjectURL(storagePath, auth.currentUser)
        .then((url) => {
          if (url) img.src = url;
        })
        .catch((err) => {
          console.warn('Gagal memuat gambar pesan:', err);
        });
    }

    img.addEventListener('click', () => {
      if (img.src) {
        const bubble = img.closest('.msg-bubble');
        const textEl = bubble ? bubble.querySelector('.msg-bubble-text') : null;
        openLightbox(img.src, textEl ? textEl.textContent : '');
      }
    });
  });

  // 2. Lazy fetch videos without localUrl
  container.querySelectorAll('video.msg-bubble-media-video').forEach((video) => {
    const storagePath = video.dataset.storagePath;
    if (!video.src && storagePath && auth?.currentUser) {
      dbCreateMessageObjectURL(storagePath, auth.currentUser)
        .then((url) => {
          if (url) video.src = url;
        })
        .catch((err) => {
          console.warn('Gagal memuat video pesan:', err);
        });
    }
  });

  // 3. Audio & Voice Player wiring
  container.querySelectorAll('.msg-audio-player').forEach((player) => {
    const playBtn = player.querySelector('.msg-audio-play-btn');
    const slider = player.querySelector('.msg-audio-slider');
    const timeLabel = player.querySelector('.msg-audio-time-label');
    const audio = player.querySelector('audio');
    const storagePath = player.dataset.storagePath;
    const localUrl = player.dataset.localUrl;

    if (!audio) return;

    let isLoaded = false;
    async function ensureAudioSrc() {
      if (isLoaded && audio.src) return true;
      if (localUrl) {
        audio.src = localUrl;
        isLoaded = true;
        return true;
      }
      if (storagePath && auth?.currentUser) {
        try {
          const url = await dbCreateMessageObjectURL(storagePath, auth.currentUser);
          if (url) {
            audio.src = url;
            isLoaded = true;
            return true;
          }
        } catch (err) {
          console.warn('Gagal memuat audio pesan:', err);
        }
      }
      return false;
    }

    if (playBtn) {
      playBtn.addEventListener('click', async () => {
        if (audio.paused) {
          const ready = await ensureAudioSrc();
          if (!ready) return;

          // Pause previous playing audio
          if (currentActiveAudio && currentActiveAudio !== audio) {
            try {
              currentActiveAudio.pause();
            } catch (_) {}
          }
          currentActiveAudio = audio;

          audio.play().then(() => {
            playBtn.textContent = '⏸';
          }).catch((err) => console.warn('Audio play prevented:', err));
        } else {
          audio.pause();
          playBtn.textContent = '▶';
        }
      });
    }

    audio.addEventListener('timeupdate', () => {
      if (audio.duration && !isNaN(audio.duration)) {
        const pct = (audio.currentTime / audio.duration) * 100;
        if (slider) slider.value = pct;
        if (timeLabel) {
          timeLabel.textContent = `${formatDuration(audio.currentTime)} / ${formatDuration(audio.duration)}`;
        }
      }
    });

    audio.addEventListener('ended', () => {
      if (playBtn) playBtn.textContent = '▶';
      if (slider) slider.value = 0;
      if (timeLabel && audio.duration) {
        timeLabel.textContent = `0:00 / ${formatDuration(audio.duration)}`;
      }
    });

    if (slider) {
      slider.addEventListener('input', () => {
        if (audio.duration && !isNaN(audio.duration)) {
          audio.currentTime = (slider.value / 100) * audio.duration;
        }
      });
    }
  });

  // 4. Document Download wiring
  container.querySelectorAll('.msg-doc-download-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const storagePath = btn.dataset.storagePath;
      const fileName = btn.dataset.filename || 'dokumen';
      if (!storagePath || !auth?.currentUser) return;

      const originalText = btn.textContent;
      btn.textContent = '⏳';
      btn.disabled = true;

      try {
        const blob = await dbFetchMessageBlob(storagePath, auth.currentUser);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        btn.textContent = '✓';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.disabled = false;
        }, 1500);
      } catch (err) {
        console.error('Download error:', err);
        if (typeof onShowToastCallback === 'function') {
          onShowToastCallback(`❌ Gagal mengunduh dokumen: ${err.message}`);
        }
        btn.textContent = originalText;
        btn.disabled = false;
      }
    });
  });

  // 5. Retry Button wiring
  container.querySelectorAll('.msg-retry-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const retryId = btn.dataset.retryId;
      if (retryId) {
        btn.disabled = true;
        btn.textContent = '⏳ Mengulang...';
        try {
          await retryMessage(retryId, getActiveConversationId());
        } catch (err) {
          if (typeof onShowToastCallback === 'function') {
            onShowToastCallback(`❌ Gagal mengirim ulang: ${err.message}`);
          }
        }
      }
    });
  });
}

function setupActiveConversationSubscription() {
  const convId = getActiveConversationId();

  // Render cached messages immediately
  const cached = getCachedMessages(convId);
  renderMessageThread(cached);

  // Subscribe to realtime updates
  if (currentUnsubscribe) {
    currentUnsubscribe();
    currentUnsubscribe = null;
  }

  currentUnsubscribe = subscribeToActiveConversation(
    convId,
    (updatedMessages) => {
      renderMessageThread(updatedMessages);
      const statusNotice = document.getElementById('msg-thread-status');
      if (statusNotice) {
        statusNotice.style.display = 'none';
      }
    },
    (err) => {
      const statusNotice = document.getElementById('msg-thread-status');
      if (statusNotice) {
        statusNotice.textContent = `Offline: ${err.message || 'Koneksi Firestore terganggu'}`;
        statusNotice.style.display = 'block';
      }
    }
  );
}

// Lightbox Handlers
function openLightbox(src, caption = '') {
  const lightbox = document.getElementById('msg-media-lightbox');
  const img = document.getElementById('msg-lightbox-img');
  const cap = document.getElementById('msg-lightbox-caption');

  if (lightbox && img) {
    img.src = src;
    if (cap) cap.textContent = caption || '';
    lightbox.classList.remove('hidden');
    lightbox.setAttribute('aria-hidden', 'false');
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('msg-media-lightbox');
  const img = document.getElementById('msg-lightbox-img');
  if (lightbox) {
    lightbox.classList.add('hidden');
    lightbox.setAttribute('aria-hidden', 'true');
    if (img) img.src = '';
  }
}

// Attachment Menu Handlers
function toggleAttachMenu() {
  const menu = document.getElementById('msg-attach-menu');
  const btn = document.getElementById('btn-msg-attach');
  if (!menu) return;

  const isHidden = menu.classList.contains('hidden');
  if (isHidden) {
    menu.classList.remove('hidden');
    if (btn) {
      btn.classList.add('active');
      btn.setAttribute('aria-expanded', 'true');
    }
  } else {
    closeAttachMenu();
  }
}

function closeAttachMenu() {
  const menu = document.getElementById('msg-attach-menu');
  const btn = document.getElementById('btn-msg-attach');
  if (menu) {
    menu.classList.add('hidden');
  }
  if (btn) {
    btn.classList.remove('active');
    btn.setAttribute('aria-expanded', 'false');
  }
}

// Spark Storage Notice Handlers
function showSparkStorageNotice() {
  const notice = document.getElementById('msg-spark-notice');
  if (notice) notice.classList.remove('hidden');
}

function hideSparkStorageNotice() {
  const notice = document.getElementById('msg-spark-notice');
  if (notice) notice.classList.add('hidden');
}

// Pending Attachment Preview Bar
function setPendingAttachment(file, type) {
  clearPendingAttachment();

  const previewBar = document.getElementById('msg-attachment-preview');
  const contentEl = document.getElementById('msg-preview-content');
  const sendBtn = document.getElementById('btn-msg-send');
  const input = document.getElementById('msg-input-text');
  if (!previewBar || !contentEl) return;

  let previewUrl = '';
  if (type === 'image') {
    try {
      previewUrl = URL.createObjectURL(file);
    } catch (_) {}
  }

  pendingAttachment = {
    file,
    type,
    name: file.name,
    size: file.size,
    mimeType: file.type,
    previewUrl
  };

  let thumbHtml = '';
  if (type === 'image' && previewUrl) {
    thumbHtml = `<img src="${previewUrl}" class="msg-preview-thumb" alt="Thumbnail" />`;
  } else if (type === 'video') {
    thumbHtml = `<div class="msg-preview-icon-box">🎥</div>`;
  } else if (type === 'audio') {
    thumbHtml = `<div class="msg-preview-icon-box">🎵</div>`;
  } else {
    thumbHtml = `<div class="msg-preview-icon-box">📁</div>`;
  }

  contentEl.innerHTML = `
    ${thumbHtml}
    <div class="msg-preview-meta">
      <span class="msg-preview-filename">${escapeHtml(file.name)}</span>
      <span class="msg-preview-size">${formatFileSize(file.size)}</span>
    </div>
  `;

  previewBar.classList.remove('hidden');
  if (sendBtn) sendBtn.disabled = false;
  if (input) {
    input.placeholder = "Tambahkan keterangan (opsional) lalu tekan Kirim...";
    input.focus();
  }
}

function clearPendingAttachment() {
  if (pendingAttachment && pendingAttachment.previewUrl) {
    try {
      URL.revokeObjectURL(pendingAttachment.previewUrl);
    } catch (_) {}
  }
  pendingAttachment = null;

  const previewBar = document.getElementById('msg-attachment-preview');
  const contentEl = document.getElementById('msg-preview-content');
  const input = document.getElementById('msg-input-text');
  const sendBtn = document.getElementById('btn-msg-send');

  if (contentEl) contentEl.innerHTML = '';
  if (previewBar) previewBar.classList.add('hidden');

  if (input) {
    input.placeholder = "Tulis pesan manis untuk sahabatmu...";
  }

  if (sendBtn && input) {
    sendBtn.disabled = input.value.trim().length === 0;
  }
}

// Voice Recording Handlers
async function startVoiceRecording() {
  if (isRecording) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (typeof onShowToastCallback === 'function') {
      onShowToastCallback('⚠️ Browser Anda tidak mendukung perekaman audio.');
    }
    return;
  }

  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    console.error('Mic access error:', err);
    if (typeof onShowToastCallback === 'function') {
      onShowToastCallback(`⚠️ Gagal mengakses mikrofon: ${err.message}`);
    }
    return;
  }

  recordedChunks = [];
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  try {
    mediaRecorder = new MediaRecorder(audioStream, { mimeType });
  } catch (_) {
    mediaRecorder = new MediaRecorder(audioStream);
  }

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.start(200);
  isRecording = true;
  recordStartTime = Date.now();

  // Switch UI to recording bar
  const normalRow = document.getElementById('msg-normal-input-row');
  const recBar = document.getElementById('msg-recording-bar');
  const timerEl = document.getElementById('msg-record-timer');

  if (normalRow) normalRow.classList.add('hidden');
  if (recBar) recBar.classList.remove('hidden');
  if (timerEl) timerEl.textContent = '0:00';

  if (recordTimerInterval) clearInterval(recordTimerInterval);
  recordTimerInterval = setInterval(() => {
    const elapsedSecs = Math.floor((Date.now() - recordStartTime) / 1000);
    if (timerEl) timerEl.textContent = formatDuration(elapsedSecs);
  }, 500);
}

function stopMediaTracks() {
  if (audioStream) {
    try {
      audioStream.getTracks().forEach((t) => t.stop());
    } catch (_) {}
    audioStream = null;
  }
  if (recordTimerInterval) {
    clearInterval(recordTimerInterval);
    recordTimerInterval = null;
  }
  isRecording = false;
}

function cancelVoiceRecording() {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try {
      mediaRecorder.stop();
    } catch (_) {}
  }
  stopMediaTracks();
  recordedChunks = [];

  const normalRow = document.getElementById('msg-normal-input-row');
  const recBar = document.getElementById('msg-recording-bar');
  if (recBar) recBar.classList.add('hidden');
  if (normalRow) normalRow.classList.remove('hidden');
}

async function sendVoiceRecording() {
  if (!mediaRecorder || !isRecording) return;

  const durationSecs = Math.max(1, Math.round((Date.now() - recordStartTime) / 1000));

  mediaRecorder.onstop = async () => {
    const blob = new Blob(recordedChunks, { type: 'audio/webm' });
    stopMediaTracks();

    const normalRow = document.getElementById('msg-normal-input-row');
    const recBar = document.getElementById('msg-recording-bar');
    if (recBar) recBar.classList.add('hidden');
    if (normalRow) normalRow.classList.remove('hidden');

    try {
      await sendMediaMessage({
        blob,
        type: 'voice',
        text: '',
        duration: durationSecs,
        convId: getActiveConversationId(),
        fileName: `voice_${Date.now()}.webm`,
        mimeType: 'audio/webm'
      });
      if (typeof onShowToastCallback === 'function') {
        onShowToastCallback('🎙️ Pesan suara berhasil terkirim!');
      }
    } catch (err) {
      console.error('Failed to send voice note:', err);
      if (typeof onShowToastCallback === 'function') {
        onShowToastCallback(`❌ Gagal mengirim pesan suara: ${err.message}`);
      }
    }
  };

  try {
    mediaRecorder.stop();
  } catch (err) {
    cancelVoiceRecording();
  }
}

async function handleSendMessageAction() {
  const input = document.getElementById('msg-input-text');
  const sendBtn = document.getElementById('btn-msg-send');
  if (!input) return;

  const rawText = input.value;
  const convId = getActiveConversationId();

  // Case A: Sending an attachment with optional caption
  if (pendingAttachment) {
    const attach = pendingAttachment;
    clearPendingAttachment();
    input.value = '';
    updateCharCounter(0);
    if (sendBtn) sendBtn.disabled = true;

    try {
      await sendMediaMessage({
        file: attach.file,
        type: attach.type,
        text: rawText.trim(),
        convId,
        fileName: attach.name,
        mimeType: attach.mimeType
      });
      if (sendBtn) sendBtn.disabled = input.value.trim().length === 0;
    } catch (err) {
      console.error('Failed to send media message:', err);
      // Restore user text so it is not lost
      input.value = rawText;
      updateCharCounter(rawText.length);
      if (sendBtn) sendBtn.disabled = false;

      const isStorageIssue = err.message && (
        err.message.includes('Storage') ||
        err.message.includes('bucket') ||
        err.message.includes('billing') ||
        err.message.includes('Blaze') ||
        err.message.includes('unauthorized') ||
        err.message.includes('permission')
      );

      if (isStorageIssue) {
        showSparkStorageNotice();
        if (typeof onShowToastCallback === 'function') {
          onShowToastCallback('ℹ️ Penyimpanan media awan belum aktif pada paket Spark. Pesan teks dapat dikirim langsung ✨');
        }
      } else {
        if (typeof onShowToastCallback === 'function') {
          onShowToastCallback(`❌ Gagal mengirim lampiran: ${err.message}`);
        }
      }
    }
    return;
  }

  // Case B: Standard text message
  const validation = validateMessageInput(rawText);
  if (!validation.valid) {
    if (typeof onShowToastCallback === 'function') {
      onShowToastCallback(validation.error);
    }
    return;
  }

  // Clear input
  input.value = '';
  updateCharCounter(0);
  if (sendBtn) sendBtn.disabled = true;

  try {
    await sendMessage(validation.text, convId);
    if (sendBtn) sendBtn.disabled = input.value.trim().length === 0;
  } catch (err) {
    console.error('Failed to send message:', err, {
      code: err?.code,
      message: err?.message,
      currentUser: auth?.currentUser ? {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        emailVerified: auth.currentUser.emailVerified
      } : null,
      activeChar: getActiveUserCharacter(),
      convId
    });
    // Restore user text so it is not lost
    input.value = rawText;
    updateCharCounter(rawText.length);
    if (sendBtn) sendBtn.disabled = false;
    if (typeof onShowToastCallback === 'function') {
      onShowToastCallback(`❌ Gagal mengirim pesan: ${err.message}`);
    }
  }
}

function updateCharCounter(length) {
  const counter = document.getElementById('msg-char-counter');
  if (counter) {
    counter.textContent = `${length} / 2000`;
    counter.style.color = length > 1900 ? '#f87171' : '#cbd5e1';
  }
}

export function selectConversation(convId) {
  setActiveConversationId(convId);
  renderConversationListUI();
  setupActiveConversationSubscription();
}

function handleFileInputSelect(e, type) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (file.size > MAX_MESSAGE_MEDIA_SIZE_BYTES) {
    if (typeof onShowToastCallback === 'function') {
      onShowToastCallback(`⚠️ Ukuran file melebihi batas 50 MB (${formatFileSize(file.size)}).`);
    }
    e.target.value = '';
    return;
  }

  setPendingAttachment(file, type);
  closeAttachMenu();
  e.target.value = '';
}

export function initMessagesView(options = {}) {
  onShowToastCallback = options.onShowToast || null;

  const controller = {
    openMessages: openMessagesView,
    closeMessages: closeMessagesView,
    syncActiveUser: syncMessagesActiveCharacter,
    switchConversation: selectConversation
  };

  if (typeof window !== 'undefined') {
    window.messagesController = controller;
  }

  if (isMessagesInitialized) return controller;
  const root = document.getElementById('view-messages');
  if (!root) return controller;

  isMessagesInitialized = true;

  // 1. Return button
  const backBtn = document.getElementById('btn-msg-return-home');
  if (backBtn) {
    backBtn.addEventListener('click', closeMessagesView);
  }

  // 2. Textarea and Send button
  const input = document.getElementById('msg-input-text');
  const sendBtn = document.getElementById('btn-msg-send');

  if (input) {
    input.addEventListener('input', () => {
      updateCharCounter(input.value.length);
      if (sendBtn) {
        sendBtn.disabled = !pendingAttachment && input.value.trim().length === 0;
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessageAction();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessageAction);
  }

  // 3. Quick Emoji buttons
  root.querySelectorAll('.msg-emoji-btn[data-emoji]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const emoji = btn.dataset.emoji;
      if (input) {
        input.value += emoji;
        input.focus();
        updateCharCounter(input.value.length);
        if (sendBtn) sendBtn.disabled = false;
      }
    });
  });

  // 4. Attachment (+) Button and Menu Items
  const attachBtn = document.getElementById('btn-msg-attach');
  if (attachBtn) {
    attachBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleAttachMenu();
    });
  }

  // File Inputs
  const inputImage = document.getElementById('file-input-image');
  const inputVideo = document.getElementById('file-input-video');
  const inputDoc = document.getElementById('file-input-doc');
  const inputAudio = document.getElementById('file-input-audio');

  const btnAttachImage = document.getElementById('btn-attach-image');
  const btnAttachVideo = document.getElementById('btn-attach-video');
  const btnAttachDoc = document.getElementById('btn-attach-doc');
  const btnAttachAudio = document.getElementById('btn-attach-audio');

  if (btnAttachImage && inputImage) {
    btnAttachImage.addEventListener('click', () => inputImage.click());
    inputImage.addEventListener('change', (e) => handleFileInputSelect(e, 'image'));
  }

  if (btnAttachVideo && inputVideo) {
    btnAttachVideo.addEventListener('click', () => inputVideo.click());
    inputVideo.addEventListener('change', (e) => handleFileInputSelect(e, 'video'));
  }

  if (btnAttachDoc && inputDoc) {
    btnAttachDoc.addEventListener('click', () => inputDoc.click());
    inputDoc.addEventListener('change', (e) => handleFileInputSelect(e, 'file'));
  }

  if (btnAttachAudio && inputAudio) {
    btnAttachAudio.addEventListener('click', () => inputAudio.click());
    inputAudio.addEventListener('change', (e) => handleFileInputSelect(e, 'audio'));
  }

  // Dismiss attach menu when clicking outside
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('msg-attach-menu');
      const btn = document.getElementById('btn-msg-attach');
      if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && e.target !== btn && !btn?.contains(e.target)) {
          closeAttachMenu();
        }
      }
    });
  }

  // Pending attachment remove button
  const removeAttachBtn = document.getElementById('btn-msg-preview-remove');
  if (removeAttachBtn) {
    removeAttachBtn.addEventListener('click', clearPendingAttachment);
  }

  // Spark notice close button
  const closeNoticeBtn = document.getElementById('btn-spark-notice-close');
  if (closeNoticeBtn) {
    closeNoticeBtn.addEventListener('click', hideSparkStorageNotice);
  }

  // 5. Voice Note Buttons
  const micBtn = document.getElementById('btn-msg-mic');
  if (micBtn) {
    micBtn.addEventListener('click', startVoiceRecording);
  }

  const cancelRecordBtn = document.getElementById('btn-record-cancel');
  if (cancelRecordBtn) {
    cancelRecordBtn.addEventListener('click', cancelVoiceRecording);
  }

  const sendRecordBtn = document.getElementById('btn-record-send');
  if (sendRecordBtn) {
    sendRecordBtn.addEventListener('click', sendVoiceRecording);
  }

  // 6. Lightbox close button & ESC key
  const lightboxCloseBtn = document.getElementById('btn-msg-lightbox-close');
  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeLightbox();
        closeAttachMenu();
      }
    });
  }

  // 7. Subscribe conversation list changes
  subscribeConversationList(() => {
    renderConversationListUI();
  });

  // Initial render
  renderActiveUserHeader();
  renderConversationListUI();

  return controller;
}
