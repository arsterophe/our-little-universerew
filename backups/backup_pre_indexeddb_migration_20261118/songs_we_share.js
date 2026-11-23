/**
 * =============================================================================
 * SONGS WE SHARE — UNIVERSAL MUSIC RECOMMENDATIONS SYSTEM
 * OUR LITTLE UNIVERSE · CROSS-UNIVERSE SHARED HARMONY
 * =============================================================================
 * Equal access across all 8 characters & universes:
 * - Nyanya (KIDULT)
 * - Lala (TO YOU)
 * - Lele (SHADOW)
 * - Syma (PINWHEEL)
 * - Akhira (YAWN)
 * - Ela (US AGAIN)
 * - Ruben (ASH)
 * - Royan (HOT)
 *
 * Capabilities:
 * - Share YouTube music links with Title, Artist, Personal Note & Mood
 * - Embedded responsive YouTube player
 * - Edit & Delete restricted exclusively to the recommendation author
 * - Global shared persistence (localStorage + optional Firestore sync)
 * - Automatic notifications dispatched to all other characters via Orbit Notifications
 */

import {
  normalizeCharacterKey
} from './orbit.js';
import {
  CANONICAL_CHARACTERS
} from './firebase.js';

export const SONGS_STORAGE_KEY = 'olu_global_songs_we_share';
const ORBIT_NOTIF_PREFIX = 'olu_orbit_notifications_';

// Initial seeds representing the heartfelt taste of each character
export const INITIAL_SONG_RECOMMENDATIONS = [
  {
    id: 'song-seed-nyanya-1',
    authorChar: 'nyanya',
    authorUid: 'uid-nyanya-star-kidult-2026',
    authorName: 'Nyanya ⭐',
    authorUniverse: 'KIDULT',
    authorAvatar: '/assets/avatar_nyanya_hd.png',
    title: 'Through the Arbor',
    artist: 'Kevin Kern',
    youtubeUrl: 'https://www.youtube.com/watch?v=kYJzX3e6Rrw',
    youtubeId: 'kYJzX3e6Rrw',
    note: 'Lagu piano lembut yang selalu mengingatkanku pada aroma taman bunga di sore hari. Sangat menenangkan saat kamu ingin memeluk dirimu sendiri.',
    mood: 'Dreamy',
    createdAt: Date.now() - 86400000 * 3
  },
  {
    id: 'song-seed-lele-1',
    authorChar: 'lele',
    authorUid: 'uid-lele-crystal-shadow-2026',
    authorName: 'Lele 🌙',
    authorUniverse: 'SHADOW',
    authorAvatar: '/assets/avatar_lele_hd.png',
    title: 'Reflections of Passion',
    artist: 'Secret Garden',
    youtubeUrl: 'https://www.youtube.com/watch?v=F07-u0u_4F8',
    youtubeId: 'F07-u0u_4F8',
    note: 'Musik hening di bawah cahaya rembulan. Dengarkan saat malam terasa terlalu sunyi dan kamu butuh ketenangan pikiran.',
    mood: 'Night',
    createdAt: Date.now() - 86400000 * 2
  },
  {
    id: 'song-seed-syma-1',
    authorChar: 'abil',
    authorUid: 'Euc0JLt3kWMveUEIjBwXHfOfvQD3',
    authorName: 'Syma ☁️',
    authorUniverse: 'PINWHEEL',
    authorAvatar: '/assets/avatar_abil_hd.jpg',
    title: 'Merry-Go-Round of Life',
    artist: 'Joe Hisaishi',
    youtubeUrl: 'https://www.youtube.com/watch?v=HMGetv40FkI',
    youtubeId: 'HMGetv40FkI',
    note: 'Melodi waltz yang selalu membuatku merasa seolah sedang menaiki kincir angin lembut di antara awan senja.',
    mood: 'Nostalgic',
    createdAt: Date.now() - 86400000
  },
  {
    id: 'song-seed-lala-1',
    authorChar: 'lala',
    authorUid: 'uid-lala-everglow-toyou-2026',
    authorName: 'Lala ☀️',
    authorUniverse: 'TO YOU',
    authorAvatar: '/assets/avatar_lala_hd.png',
    title: 'A Town with an Ocean View',
    artist: 'Joe Hisaishi',
    youtubeUrl: 'https://www.youtube.com/watch?v=vD1yAEWpzeQ',
    youtubeId: 'vD1yAEWpzeQ',
    note: 'Pagi yang cerah penuh harapan! Semoga hari-hari kalian selalu dipenuhi sinar mentari hangat dan senyuman.',
    mood: 'Joyful',
    createdAt: Date.now() - 3600000 * 12
  }
];

/**
 * Extract YouTube Video ID safely from various URL formats
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // 1. youtu.be/<id>
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // 2. youtube.com/watch?v=<id>
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // 3. youtube.com/embed/<id>
  const embedMatch = trimmed.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // 4. youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  // 5. Bare 11-char base64 ID (mixed case with digits, e.g. kYJzX3e6Rrw)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed) && /[0-9]/.test(trimmed) && /[A-Z]/.test(trimmed) && /[a-z]/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

let inMemorySongsCache = null;

/**
 * Get all shared songs from global storage
 */
export function getSongsWeShare() {
  const storage = (typeof window !== 'undefined' && window.localStorage)
    ? window.localStorage
    : (typeof localStorage !== 'undefined' ? localStorage : null);

  if (storage) {
    try {
      const raw = storage.getItem(SONGS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          inMemorySongsCache = parsed;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Gagal membaca data Songs We Share:', err);
    }
  }

  if (inMemorySongsCache && inMemorySongsCache.length > 0) {
    return inMemorySongsCache;
  }

  // Pre-seed initial recommendations
  const initial = JSON.parse(JSON.stringify(INITIAL_SONG_RECOMMENDATIONS));
  saveSongsWeShare(initial);
  return initial;
}

/**
 * Save shared songs array to global storage
 */
export function saveSongsWeShare(songs) {
  inMemorySongsCache = songs;
  const storage = (typeof window !== 'undefined' && window.localStorage)
    ? window.localStorage
    : (typeof localStorage !== 'undefined' ? localStorage : null);

  if (storage) {
    try {
      storage.setItem(SONGS_STORAGE_KEY, JSON.stringify(songs));
    } catch (err) {
      console.warn('Gagal menyimpan data Songs We Share:', err);
    }
  }
}

/**
 * Dispatch song recommendation notifications to all other characters
 */
export function dispatchSongNotifications(song, senderCharKey) {
  const storage = (typeof window !== 'undefined' && window.localStorage)
    ? window.localStorage
    : (typeof localStorage !== 'undefined' ? localStorage : null);

  if (!storage) return;
  const normSender = normalizeCharacterKey(senderCharKey);
  const senderConfig = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[normSender] : null;
  const senderName = senderConfig?.shortName || song.authorName || 'Sahabat Universe';

  const allCharKeys = ['nyanya', 'lala', 'lele', 'abil', 'akhira', 'ela', 'ruben', 'royan'];

  allCharKeys.forEach(targetKey => {
    if (targetKey === normSender) return; // Don't notify the sender

    const targetConfig = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[targetKey] : null;
    const targetUid = targetConfig?.uid || targetKey;

    const notifItem = {
      id: `notif-song-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      type: 'music_recommendation',
      songId: song.id,
      songTitle: song.title,
      songArtist: song.artist,
      youtubeUrl: song.youtubeUrl,
      proposer: normSender,
      proposerName: senderName,
      recipientChar: targetKey,
      recipientUid: targetUid,
      createdAt: new Date().toISOString(),
      read: false,
      message: `${senderName} merekomendasikan lagu "${song.title}" (${song.artist}) di Songs We Share! 🎵`
    };

    try {
      const raw = storage.getItem(ORBIT_NOTIF_PREFIX + targetUid);
      let notifs = [];
      if (raw) {
        notifs = JSON.parse(raw);
        if (!Array.isArray(notifs)) notifs = [];
      }
      notifs.unshift(notifItem);
      storage.setItem(ORBIT_NOTIF_PREFIX + targetUid, JSON.stringify(notifs));
    } catch (e) {
      console.warn('Gagal dispatch notifikasi lagu untuk:', targetKey, e);
    }
  });
}

/**
 * Add a new song recommendation
 */
export function addSongRecommendation({
  authorChar,
  authorUid = null,
  title,
  artist,
  youtubeUrl,
  note = '',
  mood = 'Dreamy'
}) {
  const normAuthor = normalizeCharacterKey(authorChar || 'nyanya');
  const charConfig = CANONICAL_CHARACTERS ? CANONICAL_CHARACTERS[normAuthor] : null;
  const authorName = charConfig?.shortName ? `${charConfig.shortName} ${charConfig.symbol || '✦'}` : 'Sahabat';
  const authorUniverse = charConfig?.universe || 'KIDULT';
  const authorAvatar = charConfig?.avatar || '/assets/avatar_nyanya_hd.png';
  const authorResolvedUid = authorUid || charConfig?.uid || normAuthor;

  const youtubeId = extractYouTubeId(youtubeUrl);
  if (!youtubeId) {
    throw new Error('Link YouTube tidak valid. Mohon masukkan link video YouTube yang benar.');
  }
  if (!title || !title.trim()) {
    throw new Error('Judul lagu tidak boleh kosong.');
  }

  const newSong = {
    id: `song-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    authorChar: normAuthor,
    authorUid: authorResolvedUid,
    authorName,
    authorUniverse,
    authorAvatar,
    title: title.trim(),
    artist: (artist || 'Unknown Artist').trim(),
    youtubeUrl: youtubeUrl.trim(),
    youtubeId,
    note: note.trim(),
    mood: mood || 'Dreamy',
    createdAt: Date.now()
  };

  const currentSongs = getSongsWeShare();
  currentSongs.unshift(newSong);
  saveSongsWeShare(currentSongs);

  // Dispatch notifications to the other 7 characters
  dispatchSongNotifications(newSong, normAuthor);

  return newSong;
}

/**
 * Update an existing recommendation (AUTHOR ONLY)
 */
export function updateSongRecommendation(songId, updatedFields, requesterChar, requesterUid = null) {
  const normRequester = normalizeCharacterKey(requesterChar);
  const currentSongs = getSongsWeShare();
  const idx = currentSongs.findIndex(s => s.id === songId);

  if (idx === -1) {
    throw new Error('Rekomendasi lagu tidak ditemukan.');
  }

  const song = currentSongs[idx];
  const isOwner = song.authorChar === normRequester ||
    (requesterUid && song.authorUid === requesterUid);

  if (!isOwner) {
    throw new Error('Hanya pemilik rekomendasi yang boleh mengedit lagu ini.');
  }

  let youtubeId = song.youtubeId;
  if (updatedFields.youtubeUrl) {
    const extracted = extractYouTubeId(updatedFields.youtubeUrl);
    if (!extracted) {
      throw new Error('Link YouTube baru tidak valid.');
    }
    youtubeId = extracted;
  }

  currentSongs[idx] = {
    ...song,
    ...updatedFields,
    youtubeId,
    updatedAt: Date.now()
  };

  saveSongsWeShare(currentSongs);
  return currentSongs[idx];
}

/**
 * Delete a recommendation (AUTHOR ONLY)
 */
export function deleteSongRecommendation(songId, requesterChar, requesterUid = null) {
  const normRequester = normalizeCharacterKey(requesterChar);
  const currentSongs = getSongsWeShare();
  const song = currentSongs.find(s => s.id === songId);

  if (!song) {
    throw new Error('Rekomendasi lagu tidak ditemukan.');
  }

  const isOwner = song.authorChar === normRequester ||
    (requesterUid && song.authorUid === requesterUid);

  if (!isOwner) {
    throw new Error('Hanya pemilik rekomendasi yang boleh menghapus lagu ini.');
  }

  const filtered = currentSongs.filter(s => s.id !== songId);
  saveSongsWeShare(filtered);
  return true;
}

/**
 * Helper to escape HTML safely
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * RENDER & CONTROLLER: Songs We Share Modal
 */
let songsModalBackdrop = null;
let currentActiveChar = 'nyanya';
let onToastCallback = null;
let onSparkleCallback = null;
let onNavigateGazeboCallback = null;
let activeMoodFilter = 'all';
let editingSongId = null;

export function initSongsWeShareUI({
  onShowToast,
  onTriggerSparkle,
  activeChar = 'nyanya',
  onNavigateToGazebo
} = {}) {
  onToastCallback = onShowToast;
  onSparkleCallback = onTriggerSparkle;
  currentActiveChar = normalizeCharacterKey(activeChar);
  onNavigateGazeboCallback = onNavigateToGazebo;

  ensureSongsModalDOM();
}

/**
 * Ensures modal backdrop exists in the DOM
 */
function ensureSongsModalDOM() {
  songsModalBackdrop = document.getElementById('modal-songs-we-share-backdrop');
  if (!songsModalBackdrop) {
    songsModalBackdrop = document.createElement('div');
    songsModalBackdrop.id = 'modal-songs-we-share-backdrop';
    songsModalBackdrop.className = 'sws-modal-backdrop';
    songsModalBackdrop.setAttribute('role', 'dialog');
    songsModalBackdrop.setAttribute('aria-modal', 'true');
    songsModalBackdrop.setAttribute('aria-hidden', 'true');

    songsModalBackdrop.innerHTML = `
      <div class="sws-modal-card">
        <header class="sws-modal-header">
          <div class="sws-header-title-wrap">
            <span class="sws-header-icon">🎵</span>
            <div>
              <h2>SONGS WE SHARE</h2>
              <p>Rekomendasi Musik &amp; Lagu Favorit Seluruh Sahabat Our Little Universe</p>
            </div>
          </div>
          <button type="button" class="btn-sws-close" id="btn-sws-modal-close" aria-label="Tutup Dialog">✕</button>
        </header>

        <div class="sws-modal-nav-tabs">
          <button type="button" class="sws-tab-btn active" id="sws-tab-list">🎶 Daftar Rekomendasi</button>
          <button type="button" class="sws-tab-btn" id="sws-tab-add">➕ Bagikan Lagu Baru</button>
        </div>

        <div class="sws-modal-body" id="sws-modal-body"></div>
      </div>
    `;

    document.body.appendChild(songsModalBackdrop);

    songsModalBackdrop.querySelector('#btn-sws-modal-close')?.addEventListener('click', closeSongsWeShareModal);
    songsModalBackdrop.addEventListener('click', (e) => {
      if (e.target === songsModalBackdrop) closeSongsWeShareModal();
    });

    songsModalBackdrop.querySelector('#sws-tab-list')?.addEventListener('click', () => {
      editingSongId = null;
      renderSongListTab();
    });
    songsModalBackdrop.querySelector('#sws-tab-add')?.addEventListener('click', () => {
      renderSongFormTab();
    });
  }
}

/**
 * Open the Songs We Share Modal
 */
export function openSongsWeShareModal(options = {}) {
  ensureSongsModalDOM();
  if (options.activeChar) {
    currentActiveChar = normalizeCharacterKey(options.activeChar);
  }
  if (options.highlightSongId) {
    editingSongId = null;
  }

  songsModalBackdrop.classList.add('active');
  songsModalBackdrop.setAttribute('aria-hidden', 'false');

  renderSongListTab(options.highlightSongId);

  if (onSparkleCallback) {
    onSparkleCallback(window.innerWidth / 2, window.innerHeight / 2);
  }
}

/**
 * Close the Songs We Share Modal
 */
export function closeSongsWeShareModal() {
  if (songsModalBackdrop) {
    songsModalBackdrop.classList.remove('active');
    songsModalBackdrop.setAttribute('aria-hidden', 'true');
    // Stop any embedded player
    const playerContainer = document.getElementById('sws-player-overlay');
    if (playerContainer) playerContainer.remove();
  }
}

/**
 * Render the List Tab
 */
function renderSongListTab(highlightSongId = null) {
  const body = document.getElementById('sws-modal-body');
  if (!body) return;

  const tabList = document.getElementById('sws-tab-list');
  const tabAdd = document.getElementById('sws-tab-add');
  tabList?.classList.add('active');
  tabAdd?.classList.remove('active');

  const songs = getSongsWeShare();
  const moods = ['all', 'Dreamy', 'Nostalgic', 'Night', 'Joyful', 'Chill', 'Acoustic'];

  const filteredSongs = activeMoodFilter === 'all'
    ? songs
    : songs.filter(s => (s.mood || '').toLowerCase() === activeMoodFilter.toLowerCase());

  body.innerHTML = `
    <!-- Mood Filter Pills -->
    <div class="sws-filter-row">
      <span class="sws-filter-label">Suasana Lagu:</span>
      ${moods.map(m => `
        <button type="button" class="sws-filter-pill ${activeMoodFilter === m ? 'selected' : ''}" data-mood="${m}">
          ${m === 'all' ? '✨ Semua Lagu' : m}
        </button>
      `).join('')}
    </div>

    <!-- Songs Cards Grid -->
    <div class="sws-cards-grid">
      ${filteredSongs.length === 0 ? `
        <div class="sws-empty-box">
          <div style="font-size: 3rem;">🎶</div>
          <h3>Belum ada rekomendasi lagu untuk suasana ini</h3>
          <p>Jadilah yang pertama membagikan lagu favoritmu kepada sahabat lainnya!</p>
          <button type="button" class="btn-sws-primary" id="btn-sws-first-add">
            ➕ Bagikan Lagu Sekarang
          </button>
        </div>
      ` : filteredSongs.map(song => {
        const isOwner = song.authorChar === currentActiveChar;
        const isHighlight = highlightSongId && song.id === highlightSongId;

        return `
          <div class="sws-song-card ${isHighlight ? 'highlighted' : ''}" data-song-id="${song.id}">
            <!-- Thumbnail & Quick Play Overlay -->
            <div class="sws-card-thumb-wrap">
              <img src="https://img.youtube.com/vi/${song.youtubeId}/mqdefault.jpg"
                   alt="${escapeHtml(song.title)}"
                   class="sws-card-thumb"
                   onerror="this.src='/assets/kidult_universe_bg.jpg'" />
              <button type="button" class="btn-sws-play-overlay" data-play-yt="${song.youtubeId}" data-title="${escapeHtml(song.title)}" data-artist="${escapeHtml(song.artist)}" aria-label="Putar Lagu">
                ▶
              </button>
              <span class="sws-mood-badge">${escapeHtml(song.mood || 'Dreamy')}</span>
            </div>

            <!-- Card Info & Author -->
            <div class="sws-card-info">
              <div class="sws-card-author-row">
                <img src="${song.authorAvatar || '/assets/avatar_nyanya_hd.png'}" class="sws-card-author-avatar" alt="${escapeHtml(song.authorName)}" />
                <div>
                  <span class="sws-author-name">${escapeHtml(song.authorName || 'Sahabat')}</span>
                  <span class="sws-author-univ">${escapeHtml(song.authorUniverse || 'Universe')}</span>
                </div>
              </div>

              <h3 class="sws-song-title">${escapeHtml(song.title)}</h3>
              <p class="sws-song-artist">Oleh: ${escapeHtml(song.artist)}</p>

              ${song.note ? `
                <div class="sws-song-note">
                  <span>💬</span> "${escapeHtml(song.note)}"
                </div>
              ` : ''}

              <!-- Actions -->
              <div class="sws-card-actions">
                <button type="button" class="btn-sws-play-action" data-play-yt="${song.youtubeId}" data-title="${escapeHtml(song.title)}" data-artist="${escapeHtml(song.artist)}">
                  <span>▶</span> Putar Lagu
                </button>

                ${isOwner ? `
                  <div class="sws-owner-btns">
                    <button type="button" class="btn-sws-edit" data-edit-id="${song.id}" title="Edit rekomendasi ini">✏️</button>
                    <button type="button" class="btn-sws-delete" data-delete-id="${song.id}" title="Hapus rekomendasi ini">🗑️</button>
                  </div>
                ` : ''}
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Attach filter event listeners
  body.querySelectorAll('.sws-filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      activeMoodFilter = btn.getAttribute('data-mood');
      renderSongListTab();
    });
  });

  // Play button listeners
  body.querySelectorAll('[data-play-yt]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ytId = btn.getAttribute('data-play-yt');
      const title = btn.getAttribute('data-title');
      const artist = btn.getAttribute('data-artist');
      playYouTubeEmbed(ytId, title, artist);
    });
  });

  // Edit button listeners (Owner only)
  body.querySelectorAll('[data-edit-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sId = btn.getAttribute('data-edit-id');
      editingSongId = sId;
      renderSongFormTab(sId);
    });
  });

  // Delete button listeners (Owner only)
  body.querySelectorAll('[data-delete-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const sId = btn.getAttribute('data-delete-id');
      if (window.confirm('Hapus rekomendasi lagu ini dari Songs We Share?')) {
        try {
          deleteSongRecommendation(sId, currentActiveChar);
          if (onToastCallback) onToastCallback('🗑️ Rekomendasi lagu berhasil dihapus.');
          renderSongListTab();
        } catch (err) {
          if (onToastCallback) onToastCallback(`⚠️ ${err.message}`);
        }
      }
    });
  });

  body.querySelector('#btn-sws-first-add')?.addEventListener('click', () => {
    renderSongFormTab();
  });
}

/**
 * Render Form Tab (Add / Edit)
 */
function renderSongFormTab(songIdToEdit = null) {
  const body = document.getElementById('sws-modal-body');
  if (!body) return;

  const tabList = document.getElementById('sws-tab-list');
  const tabAdd = document.getElementById('sws-tab-add');
  tabList?.classList.remove('active');
  tabAdd?.classList.add('active');

  const songs = getSongsWeShare();
  const existingSong = songIdToEdit ? songs.find(s => s.id === songIdToEdit) : null;
  const isEditing = Boolean(existingSong);

  body.innerHTML = `
    <div class="sws-form-container">
      <div class="sws-form-header">
        <h3>${isEditing ? '✏️ Edit Rekomendasi Lagu' : '➕ Bagikan Rekomendasi Lagu Baru'}</h3>
        <p>Lagu yang kamu bagikan akan muncul untuk seluruh 8 sahabat di gazebo masing-masing!</p>
      </div>

      <div class="sws-form-grid">
        <!-- YouTube URL -->
        <div class="sws-field">
          <label for="sws-input-url">Link YouTube (URL / Shorts / youtu.be): <span class="required">*</span></label>
          <input type="url" id="sws-input-url" class="sws-input"
                 placeholder="Contoh: https://www.youtube.com/watch?v=kYJzX3e6Rrw"
                 value="${escapeHtml(existingSong?.youtubeUrl || '')}" required />
          <span class="sws-field-help" id="sws-url-preview-info">Masukkan link video YouTube yang ingin kamu putar.</span>
        </div>

        <!-- Title -->
        <div class="sws-field">
          <label for="sws-input-title">Judul Lagu: <span class="required">*</span></label>
          <input type="text" id="sws-input-title" class="sws-input"
                 placeholder="Contoh: Through the Arbor"
                 value="${escapeHtml(existingSong?.title || '')}" required />
        </div>

        <!-- Artist -->
        <div class="sws-field">
          <label for="sws-input-artist">Penyanyi / Komposer: <span class="required">*</span></label>
          <input type="text" id="sws-input-artist" class="sws-input"
                 placeholder="Contoh: Kevin Kern"
                 value="${escapeHtml(existingSong?.artist || '')}" required />
        </div>

        <!-- Mood -->
        <div class="sws-field">
          <label for="sws-select-mood">Suasana / Mood Lagu:</label>
          <select id="sws-select-mood" class="sws-select">
            <option value="Dreamy" ${existingSong?.mood === 'Dreamy' ? 'selected' : ''}>✨ Dreamy (Mimpi Indah)</option>
            <option value="Nostalgic" ${existingSong?.mood === 'Nostalgic' ? 'selected' : ''}>🧸 Nostalgic (Kenangan Masa Kecil)</option>
            <option value="Night" ${existingSong?.mood === 'Night' ? 'selected' : ''}>🌙 Night (Hening &amp; Menenangkan)</option>
            <option value="Joyful" ${existingSong?.mood === 'Joyful' ? 'selected' : ''}>☀️ Joyful (Ceria &amp; Semangat Pagi)</option>
            <option value="Chill" ${existingSong?.mood === 'Chill' ? 'selected' : ''}>🍃 Chill (Santai Bersantai)</option>
            <option value="Acoustic" ${existingSong?.mood === 'Acoustic' ? 'selected' : ''}>🎸 Acoustic (Petikan Hangat)</option>
          </select>
        </div>

        <!-- Personal Note -->
        <div class="sws-field full-width">
          <label for="sws-input-note">Pesan Personal / Alasan Merekomendasikan Lagu Ini:</label>
          <textarea id="sws-input-note" class="sws-textarea" rows="3"
                    placeholder="Tuliskan cerita singkat, suasana saat mendengarkannya, atau perasaan hangat yang ingin kamu bagikan kepada sahabat...">${escapeHtml(existingSong?.note || '')}</textarea>
        </div>
      </div>

      <div class="sws-form-footer">
        <button type="button" class="btn-sws-cancel" id="btn-sws-form-cancel">Batal</button>
        <button type="button" class="btn-sws-primary" id="btn-sws-form-submit">
          ${isEditing ? '💾 Simpan Perubahan' : '🚀 Bagikan Lagu ke Seluruh Universe'}
        </button>
      </div>
    </div>
  `;

  body.querySelector('#btn-sws-form-cancel')?.addEventListener('click', () => {
    editingSongId = null;
    renderSongListTab();
  });

  body.querySelector('#btn-sws-form-submit')?.addEventListener('click', () => {
    const url = body.querySelector('#sws-input-url')?.value.trim();
    const title = body.querySelector('#sws-input-title')?.value.trim();
    const artist = body.querySelector('#sws-input-artist')?.value.trim();
    const mood = body.querySelector('#sws-select-mood')?.value;
    const note = body.querySelector('#sws-input-note')?.value.trim();

    try {
      if (isEditing && existingSong) {
        updateSongRecommendation(existingSong.id, {
          youtubeUrl: url,
          title,
          artist,
          mood,
          note
        }, currentActiveChar);

        if (onToastCallback) onToastCallback('✨ Rekomendasi lagu berhasil diperbarui!');
      } else {
        addSongRecommendation({
          authorChar: currentActiveChar,
          title,
          artist,
          youtubeUrl: url,
          mood,
          note
        });

        if (onToastCallback) onToastCallback('🎉 Lagu barumu berhasil dibagikan ke Songs We Share dan sahabat universe mendapatkan notifikasi!');
        if (onSparkleCallback) onSparkleCallback(window.innerWidth / 2, window.innerHeight / 2);
      }

      editingSongId = null;
      renderSongListTab();
    } catch (err) {
      if (onToastCallback) onToastCallback(`⚠️ ${err.message}`);
    }
  });
}

/**
 * YouTube Embed Inline Modal Player
 */
export function playYouTubeEmbed(youtubeId, title = 'Memutar Lagu', artist = '') {
  let playerOverlay = document.getElementById('sws-player-overlay');
  if (playerOverlay) playerOverlay.remove();

  playerOverlay = document.createElement('div');
  playerOverlay.id = 'sws-player-overlay';
  playerOverlay.className = 'sws-player-overlay';

  playerOverlay.innerHTML = `
    <div class="sws-player-modal">
      <div class="sws-player-header">
        <div class="sws-player-meta">
          <span style="font-size: 1.2rem;">🎶</span>
          <div>
            <h4>${escapeHtml(title)}</h4>
            <p>${escapeHtml(artist ? `Oleh: ${artist}` : 'Songs We Share · Our Little Universe')}</p>
          </div>
        </div>
        <button type="button" class="btn-sws-player-close" id="btn-sws-player-close" aria-label="Tutup Pemutar Musik">✕</button>
      </div>

      <div class="sws-iframe-container">
        <iframe src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1"
                title="${escapeHtml(title)}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(playerOverlay);

  playerOverlay.querySelector('#btn-sws-player-close')?.addEventListener('click', () => {
    playerOverlay.remove();
  });
  playerOverlay.addEventListener('click', (e) => {
    if (e.target === playerOverlay) playerOverlay.remove();
  });
}
