/**
 * =============================================================================
 * PINWHEEL — MOONLIT BLOSSOM GAZEBO CONTROLLER
 * SYMA'S UNIVERSE · PINWHEEL
 * =============================================================================
 * Immersive Japanese fantasy gazebo experience with:
 * - Tea Time (Sakura Tea, Honey Milk Tea, Moonlight Herbal Tea)
 * - Little Library (Reading published stories from Our Little Universe with pagination)
 * - Memory Journal (Create, read, edit, delete personal journal with moods)
 * - Quiet Moment (4 Procedural Web Audio ambiances: Pond, Breeze, Rain, Night)
 * - PINWHEEL Melody (Independent Japanese Koto & Shakuhachi instrumental player)
 * - Personal Quote & Table Tea Indicator
 * - UID-bound persistence for Syma
 */

import {
  getPublishedStories,
  saveReadingProgress,
  getReadingProgress
} from './stories.js';

export const SYMA_CANONICAL_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';

export function initPinwheelGazeboView(options = {}) {
  const {
    onShowToast,
    onTriggerSparkle,
    onNavigateBack
  } = options;

  const viewGazebo = document.getElementById('view-pinwheel-gazebo');
  if (!viewGazebo) return null;

  let currentUid = SYMA_CANONICAL_UID;

  // DOM Elements - Top Bar
  const btnGazeboBack = document.getElementById('btn-pinwheel-gazebo-back');
  const btnMusicPlay = document.getElementById('btn-pinwheel-gazebo-music-toggle');
  const btnMusicMute = document.getElementById('btn-pinwheel-gazebo-music-mute');
  const sliderMusicVol = document.getElementById('slider-pinwheel-gazebo-music-vol');
  const musicNoteIcon = document.getElementById('pinwheel-gazebo-music-icon');

  // DOM Elements - Main Activity Cards
  const cardTeaTime = document.getElementById('pinwheel-gazebo-card-tea');
  const cardLibrary = document.getElementById('pinwheel-gazebo-card-library');
  const cardJournal = document.getElementById('pinwheel-gazebo-card-journal');
  const cardQuiet = document.getElementById('pinwheel-gazebo-card-quiet');
  const tableTeaIndicator = document.getElementById('pinwheel-gazebo-table-tea-indicator');
  const tableTeaText = document.getElementById('pinwheel-gazebo-table-tea-text');

  // DOM Elements - Modal Dialog
  const modalBackdrop = document.getElementById('pinwheel-gazebo-modal-backdrop');
  const btnModalClose = document.getElementById('btn-pinwheel-gazebo-modal-close');
  const modalHeaderIcon = document.getElementById('pinwheel-gazebo-modal-header-icon');
  const modalHeaderTitle = document.getElementById('pinwheel-gazebo-modal-header-title');
  const modalHeaderSub = document.getElementById('pinwheel-gazebo-modal-header-sub');
  const modalBody = document.getElementById('pinwheel-gazebo-modal-body');

  // State
  let activeActivity = null; // 'tea' | 'library' | 'journal' | 'quiet'
  let currentTea = {
    id: 'sakura',
    name: 'Sakura Tea — Teh Sakura',
    icon: '🌸',
    desc: 'Seduhan kelopak bunga sakura musim semi dengan aroma manis lembut yang menenangkan jiwa di bawah cahaya rembulan.'
  };

  // Music Player State (PINWHEEL MELODY)
  let isMusicPlaying = false;
  let musicVolume = 0.7;
  let isMusicMuted = false;
  let musicKotoInterval = null;

  // Quiet Moment State
  let activeAmbient = 'none'; // 'pond' | 'breeze' | 'rain' | 'night'
  let ambientVolume = 0.6;
  let isAmbientMuted = false;

  // Web Audio Context
  let audioCtx = null;
  let activeAmbientSources = [];

  // Library / Reader State
  let activeReadingStory = null;
  let currentReaderPage = 1;
  let totalReaderPages = 1;
  let readerFontSize = 1.1; // rem

  // Journal State
  let currentJournals = [];

  // ---------------------------------------------------------------------------
  // 1. DATA DEFINITIONS: TEA CATALOG
  // ---------------------------------------------------------------------------
  const TEA_CATALOG = {
    sakura: {
      id: 'sakura',
      name: 'Sakura Tea — Teh Sakura',
      icon: '🌸',
      desc: 'Seduhan kelopak bunga sakura musim semi dengan aroma manis lembut yang menenangkan jiwa di bawah cahaya rembulan.',
      flavorNotes: 'Bunga sakura liar, madu embun, kelopak segar'
    },
    honeymilk: {
      id: 'honeymilk',
      name: 'Honey Milk Tea — Susu Madu Hangat',
      icon: '🍯',
      desc: 'Perpaduan susu hangat creamy dan madu murni hutan bunga wisteria yang menghangatkan hati di malam sejuk.',
      flavorNotes: 'Susu murni, madu wisteria, vanila lembut'
    },
    moonlight: {
      id: 'moonlight',
      name: 'Moonlight Herbal Tea — Teh Herbal Malam',
      icon: '🌙',
      desc: 'Racikan herbal chamomile malam, lavender perak, dan embun pegunungan suci untuk kedamaian tidur nyenyak.',
      flavorNotes: 'Lavender malam, chamomile, daun mint sejuk'
    }
  };

  // ---------------------------------------------------------------------------
  // 2. WEB AUDIO API SYNTHESIZER
  // ---------------------------------------------------------------------------
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // --- Koto & Shakuhachi Synthesizer (PINWHEEL MELODY) ---
  // Traditional Japanese Yo / In pentatonic scale: D4, F4, G4, A4, C5, D5, F5
  const KOTO_NOTES = [293.66, 349.23, 392.00, 440.00, 523.25, 587.33, 698.46];

  function playKotoPluck(freq, delay = 0) {
    const ctx = getAudioContext();
    if (!ctx) return;

    setTimeout(() => {
      if (!isMusicPlaying) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sharp wooden string pluck: Triangle wave with fast decay
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      const pluckVol = isMusicMuted ? 0 : musicVolume * 0.22;
      gain.gain.setValueAtTime(pluckVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 2.6);
    }, delay * 1000);
  }

  function playShakuhachiBreath(freq, duration = 3.5, delay = 0) {
    const ctx = getAudioContext();
    if (!ctx) return;

    setTimeout(() => {
      if (!isMusicPlaying) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Flute vibrato (5 Hz)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5.2;
      lfoGain.gain.value = 3.5;
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);

      const masterVol = isMusicMuted ? 0 : musicVolume * 0.16;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(masterVol, now + 0.5); // Soft breath attack
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    }, delay * 1000);
  }

  function startPinwheelMelody() {
    isMusicPlaying = true;
    updateMusicUI();

    function playPhrase() {
      if (!isMusicPlaying) return;
      // Play 3 koto plucks
      for (let i = 0; i < 3; i++) {
        const note = KOTO_NOTES[Math.floor(Math.random() * KOTO_NOTES.length)];
        playKotoPluck(note, i * 1.4);
      }
      // Play 1 long shakuhachi breath
      const fluteNote = KOTO_NOTES[Math.floor(Math.random() * (KOTO_NOTES.length - 2)) + 1];
      playShakuhachiBreath(fluteNote, 4.0, 1.2);
    }

    playPhrase();
    if (musicKotoInterval) clearInterval(musicKotoInterval);
    musicKotoInterval = setInterval(playPhrase, 9000);
  }

  function stopPinwheelMelody() {
    isMusicPlaying = false;
    updateMusicUI();
    if (musicKotoInterval) {
      clearInterval(musicKotoInterval);
      musicKotoInterval = null;
    }
  }

  function toggleMusic() {
    getAudioContext();
    if (isMusicPlaying) {
      stopPinwheelMelody();
    } else {
      startPinwheelMelody();
    }
  }

  function setMusicVolume(vol) {
    musicVolume = Math.max(0, Math.min(1, vol));
    try {
      localStorage.setItem('olu_syma_gazebo_music_vol', String(musicVolume));
    } catch (_) {}
  }

  function toggleMusicMute() {
    isMusicMuted = !isMusicMuted;
    updateMusicUI();
  }

  function updateMusicUI() {
    if (btnMusicPlay) {
      btnMusicPlay.innerHTML = isMusicPlaying ? '⏸' : '▶';
      btnMusicPlay.title = isMusicPlaying ? 'Jeda Musik' : 'Putar PINWHEEL Melody';
    }
    if (btnMusicMute) {
      btnMusicMute.textContent = isMusicMuted ? '🔇' : (musicVolume > 0.5 ? '🔊' : '🔉');
    }
    if (sliderMusicVol) {
      sliderMusicVol.value = isMusicMuted ? 0 : Math.round(musicVolume * 100);
    }
    if (musicNoteIcon) {
      musicNoteIcon.style.animationPlayState = isMusicPlaying ? 'running' : 'paused';
    }
  }

  // --- Ambient Sound Synthesis (Quiet Moment) ---
  function stopAmbientSound() {
    activeAmbientSources.forEach(src => {
      try { src.stop(); } catch (_) {}
      try { src.disconnect(); } catch (_) {}
    });
    activeAmbientSources = [];
    activeAmbient = 'none';
  }

  function startAmbientSound(type) {
    stopAmbientSound();
    const ctx = getAudioContext();
    if (!ctx) return;

    activeAmbient = type;
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    const vol = isAmbientMuted ? 0 : ambientVolume * 0.45;
    masterGain.gain.setValueAtTime(vol, now);
    masterGain.connect(ctx.destination);

    // Create White/Pink Noise Buffer for natural atmospheric sound
    const bufferSize = ctx.sampleRate * 2.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    if (type === 'pond') {
      // Flowing water & gentle ripples: Bandpass filtered noise
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(480, now);
      filter.Q.value = 1.9;

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      activeAmbientSources.push(noise);

    } else if (type === 'rain') {
      // Gentle rain on pavilion roof: Lowpass noise + soft drops
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1150, now);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      activeAmbientSources.push(noise);

    } else if (type === 'breeze') {
      // Soft sakura breeze: Oscillating lowpass noise
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.2;
      lfoGain.gain.value = 170;
      lfo.connect(filter.frequency);
      lfo.start(now);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      activeAmbientSources.push(noise, lfo);

    } else if (type === 'night') {
      // Midnight garden: Periodic cricket chirps + peaceful night hum
      const cricketTimer = setInterval(() => {
        if (activeAmbient !== 'night') {
          clearInterval(cricketTimer);
          return;
        }
        const t = ctx.currentTime;
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(4400, t);
        g.gain.setValueAtTime(0.001, t);
        g.gain.linearRampToValueAtTime(0.05, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.16);
      }, 1600);
      activeAmbientSources.push({ stop: () => clearInterval(cricketTimer), disconnect: () => {} });
    }
  }

  // ---------------------------------------------------------------------------
  // 3. PERSISTENCE & DATA HANDLERS
  // ---------------------------------------------------------------------------
  function getJournalStorageKey(uid = currentUid) {
    return `olu_syma_gazebo_journal_${uid || SYMA_CANONICAL_UID}`;
  }

  function getTeaStorageKey(uid = currentUid) {
    return `olu_syma_gazebo_tea_${uid || SYMA_CANONICAL_UID}`;
  }

  function loadJournals(uid = currentUid) {
    try {
      const raw = localStorage.getItem(getJournalStorageKey(uid));
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveJournals(list, uid = currentUid) {
    try {
      localStorage.setItem(getJournalStorageKey(uid), JSON.stringify(list));
    } catch (_) {}
  }

  function loadSavedTea(uid = currentUid) {
    try {
      const raw = localStorage.getItem(getTeaStorageKey(uid));
      if (raw && TEA_CATALOG[raw]) {
        currentTea = TEA_CATALOG[raw];
      }
    } catch (_) {}
    updateTableTeaIndicator();
  }

  function saveSelectedTea(teaId, uid = currentUid) {
    if (TEA_CATALOG[teaId]) {
      currentTea = TEA_CATALOG[teaId];
      try {
        localStorage.setItem(getTeaStorageKey(uid), teaId);
      } catch (_) {}
      updateTableTeaIndicator();
    }
  }

  function updateTableTeaIndicator() {
    if (tableTeaText && currentTea) {
      tableTeaText.textContent = `${currentTea.name} · Sedang Disajikan 🍵`;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. MODAL DIALOGS & FEATURE VIEWS
  // ---------------------------------------------------------------------------
  function openModal(activity) {
    activeActivity = activity;
    if (!modalBackdrop) return;

    if (activity === 'tea') {
      renderTeaModal();
    } else if (activity === 'library') {
      renderLibraryModal();
    } else if (activity === 'journal') {
      renderJournalModal('list');
    } else if (activity === 'quiet') {
      renderQuietModal();
    }

    modalBackdrop.classList.add('active');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    activeActivity = null;
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // --- A. TEA TIME MODAL ---
  function renderTeaModal() {
    modalHeaderIcon.textContent = '🫖';
    modalHeaderTitle.textContent = 'Tea Time di Gazebo';
    modalHeaderSub.textContent = 'Pilih sajian teh hangat untuk menemani waktumu di bawah naungan sakura';

    modalBody.innerHTML = `
      <div class="tea-time-view">
        <div class="tea-cup-hero">
          <div class="tea-steam-anim">♨️</div>
          <div class="tea-cup-visual">${currentTea.icon}</div>
          <h3 class="tea-hero-title">${currentTea.name}</h3>
          <p class="tea-hero-desc">${currentTea.desc}</p>
        </div>

        <div style="font-size: 0.82rem; font-weight: 700; color: #fbcfe8; margin-top: 0.5rem;">
          PILIHAN SEDUHAN TEH:
        </div>

        <div class="tea-selection-grid">
          ${Object.values(TEA_CATALOG).map(tea => `
            <div class="tea-option-card ${currentTea.id === tea.id ? 'selected' : ''}" data-tea-id="${tea.id}" tabindex="0">
              <span class="tea-opt-icon">${tea.icon}</span>
              <span class="tea-opt-name">${tea.name}</span>
              <span class="tea-opt-desc">${tea.desc}</span>
              <span class="tea-serving-badge">
                ${currentTea.id === tea.id ? '✓ Sedang Disajikan' : 'Pilih Teh Ini'}
              </span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Attach click listeners to cards
    const cards = modalBody.querySelectorAll('.tea-option-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-tea-id');
        saveSelectedTea(id);
        renderTeaModal();
        if (onShowToast) onShowToast(`🍵 ${currentTea.name} kini tersaji hangat di atas meja Gazebo.`);
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      });
    });
  }

  // --- B. LITTLE LIBRARY MODAL ---
  function renderLibraryModal() {
    modalHeaderIcon.textContent = '📖';
    modalHeaderTitle.textContent = 'Perpustakaan Kecil PINWHEEL';
    modalHeaderSub.textContent = 'Koleksi karya sastra & cerita yang tersedia di Our Little Universe';

    // Retrieve published stories accessible to Syma
    let stories = [];
    try {
      stories = getPublishedStories({ actor: 'abil' }) || [];
    } catch (_) {
      stories = [];
    }

    if (stories.length === 0) {
      modalBody.innerHTML = `
        <div style="text-align:center; padding: 2.5rem 1rem; color: #cbd5e1;">
          <span style="font-size: 3rem; display: block; margin-bottom: 0.5rem;">📚</span>
          <h4 style="margin: 0 0 0.5rem 0; color: #ffffff;">Rak Buku Belum Terisi Karya</h4>
          <p style="font-size: 0.84rem; max-width: 440px; margin: 0 auto; line-height: 1.5;">
            Semua karya sastra yang dipublikasikan oleh para karakter Our Little Universe akan muncul di sini. Buka fitur Our Stories untuk mulai menulis!
          </p>
        </div>
      `;
      return;
    }

    modalBody.innerHTML = `
      <div class="library-view">
        <div class="library-stories-grid">
          ${stories.map(story => {
            const author = story.authorName || story.authorChar || 'Penulis Semesta';
            const prog = getReadingProgress(story.id, 'abil');
            const percent = prog?.percent || 0;

            return `
              <div class="library-story-card" data-story-id="${story.id}">
                <div>
                  <div class="story-card-top">
                    <span class="story-char-badge">${author}</span>
                    <span class="story-prog-badge">${percent > 0 ? `${percent}% Dibaca` : 'Baru'}</span>
                  </div>
                  <h4 class="story-card-title">${story.title || 'Tanpa Judul'}</h4>
                  <p class="story-card-summary">${story.summary || story.synopsis || story.content?.slice(0, 110) || 'Sebuah karya cerita penuh keindahan...'}</p>
                </div>
                <button type="button" class="btn-read-story" data-read-id="${story.id}">
                  ${percent > 0 ? 'Lanjutkan Membaca 📖' : 'Buka & Baca Karya 🌸'}
                </button>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Click handlers to open reader
    const readBtns = modalBody.querySelectorAll('[data-read-id]');
    readBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-read-id');
        const story = stories.find(s => s.id === id);
        if (story) openStoryReader(story);
      });
    });
  }

  function openStoryReader(story) {
    activeReadingStory = story;
    const content = story.content || story.manuscript || story.summary || 'Karya ini sedang dalam penulisan.';

    // Split content into pages (~750 chars per page)
    const pageSize = 750;
    const pages = [];
    for (let i = 0; i < content.length; i += pageSize) {
      pages.push(content.slice(i, i + pageSize));
    }
    totalReaderPages = Math.max(1, pages.length);

    // Restore saved progress
    const saved = getReadingProgress(story.id, 'abil') || {};
    currentReaderPage = Math.min(totalReaderPages, Math.max(1, saved.page || 1));

    modalHeaderIcon.textContent = '📖';
    modalHeaderTitle.textContent = story.title || 'Membaca Buku';
    modalHeaderSub.textContent = `Halaman ${currentReaderPage} dari ${totalReaderPages}`;

    function renderPage() {
      const pageText = pages[currentReaderPage - 1] || '';
      const percent = Math.round((currentReaderPage / totalReaderPages) * 100);

      // Save progress to stories system
      saveReadingProgress(story.id, percent, currentReaderPage / totalReaderPages, 'abil');
      try {
        const progKey = `olu_syma_gazebo_reading_${currentUid}`;
        const prev = JSON.parse(localStorage.getItem(progKey) || '{}');
        prev[story.id] = { page: currentReaderPage, totalPages: totalReaderPages, percent };
        localStorage.setItem(progKey, JSON.stringify(prev));
      } catch (_) {}

      modalHeaderSub.textContent = `Halaman ${currentReaderPage} dari ${totalReaderPages} (${percent}%)`;

      modalBody.innerHTML = `
        <div class="gazebo-reader-container">
          <div class="reader-nav-header">
            <button type="button" class="btn-reader-back" id="btn-back-to-library">
              ← Kembali ke Rak Buku
            </button>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="btn-reader-back" id="btn-font-smaller" title="Perkecil Ukuran Teks">A-</button>
              <button type="button" class="btn-reader-back" id="btn-font-larger" title="Perbesar Ukuran Teks">A+</button>
            </div>
          </div>

          <div class="reader-content-sheet" id="reader-text-sheet" style="font-size: ${readerFontSize}rem;">
            ${escapeHtml(pageText)}
          </div>

          <div class="reader-pager-footer">
            <button type="button" class="btn-reader-page" id="btn-prev-page" ${currentReaderPage <= 1 ? 'disabled' : ''}>
              ← Halaman Sebelumnya
            </button>
            <span style="font-size: 0.8rem; color: #fbcfe8;">
              Halaman ${currentReaderPage} / ${totalReaderPages}
            </span>
            <button type="button" class="btn-reader-page" id="btn-next-page" ${currentReaderPage >= totalReaderPages ? 'disabled' : ''}>
              Halaman Berikutnya →
            </button>
          </div>
        </div>
      `;

      modalBody.querySelector('#btn-back-to-library')?.addEventListener('click', renderLibraryModal);

      modalBody.querySelector('#btn-prev-page')?.addEventListener('click', () => {
        if (currentReaderPage > 1) {
          currentReaderPage--;
          renderPage();
        }
      });

      modalBody.querySelector('#btn-next-page')?.addEventListener('click', () => {
        if (currentReaderPage < totalReaderPages) {
          currentReaderPage++;
          renderPage();
        }
      });

      modalBody.querySelector('#btn-font-smaller')?.addEventListener('click', () => {
        readerFontSize = Math.max(0.95, readerFontSize - 0.1);
        const sheet = modalBody.querySelector('#reader-text-sheet');
        if (sheet) sheet.style.fontSize = `${readerFontSize}rem`;
      });

      modalBody.querySelector('#btn-font-larger')?.addEventListener('click', () => {
        readerFontSize = Math.min(1.6, readerFontSize + 0.1);
        const sheet = modalBody.querySelector('#reader-text-sheet');
        if (sheet) sheet.style.fontSize = `${readerFontSize}rem`;
      });
    }

    renderPage();
  }

  // --- C. MEMORY JOURNAL MODAL ---
  function renderJournalModal(subTab = 'list') {
    modalHeaderIcon.textContent = '📜';
    modalHeaderTitle.textContent = 'Memory Journal — Jurnal Kenangan Syma';
    modalHeaderSub.textContent = 'Catatan pribadi, renungan hati, dan momen damai di bawah rembulan';

    currentJournals = loadJournals(currentUid);

    if (subTab === 'write') {
      renderJournalComposer();
      return;
    }

    // List View
    modalBody.innerHTML = `
      <div class="journal-view">
        <div class="journal-subnav">
          <button type="button" class="btn-journal-tab active" id="tab-journal-list">Daftar Kenangan (${currentJournals.length})</button>
          <button type="button" class="btn-journal-tab" id="tab-journal-write">✍️ Tulis Kenangan Baru</button>
        </div>

        ${currentJournals.length === 0 ? `
          <div style="text-align:center; padding: 2.5rem 1rem; color: #cbd5e1;">
            <span style="font-size: 2.8rem; display: block; margin-bottom: 0.5rem;">🌸</span>
            <h4 style="margin: 0 0 0.5rem 0; color: #ffffff;">Belum Ada Catatan Kenangan</h4>
            <p style="font-size: 0.82rem; margin: 0 0 1rem 0;">Gunakan gazebo ini untuk menumpahkan refleksi dan perasaanmu.</p>
            <button type="button" class="btn-pinwheel-music-play" id="btn-first-journal-write" style="width: auto; padding: 8px 18px; border-radius: 999px; margin: 0 auto;">
              Tulis Catatan Pertama ✦
            </button>
          </div>
        ` : `
          <div class="journal-entries-list">
            ${currentJournals.map(entry => `
              <div class="journal-entry-card" data-entry-id="${entry.id}">
                <div class="entry-header-row">
                  <h4 class="entry-title">${escapeHtml(entry.title || 'Catatan Tanpa Judul')}</h4>
                  <span class="entry-mood-pill">${escapeHtml(entry.mood || '🌸 Tenang')}</span>
                </div>
                <p class="entry-snippet">${escapeHtml(entry.content || '')}</p>
                <div class="entry-date">${new Date(entry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    modalBody.querySelector('#tab-journal-write')?.addEventListener('click', () => renderJournalModal('write'));
    modalBody.querySelector('#btn-first-journal-write')?.addEventListener('click', () => renderJournalModal('write'));

    modalBody.querySelectorAll('.journal-entry-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-entry-id');
        const entry = currentJournals.find(j => j.id === id);
        if (entry) renderJournalDetail(entry);
      });
    });
  }

  function renderJournalComposer(editEntry = null) {
    const isEdit = !!editEntry;
    let selectedMood = editEntry?.mood || '🌸 Tenang & Bersyukur';

    modalBody.innerHTML = `
      <div class="journal-view">
        <div class="journal-subnav">
          <button type="button" class="btn-journal-tab" id="tab-journal-list">← Kembali ke Daftar</button>
          <button type="button" class="btn-journal-tab active">${isEdit ? '✏️ Edit Kenangan' : '✍️ Menulis Kenangan Baru'}</button>
        </div>

        <form id="journal-composer-form">
          <div class="journal-form-group">
            <label for="journal-title-input">Judul Kenangan:</label>
            <input type="text" id="journal-title-input" class="journal-input-text" placeholder="Misal: Angin Malam & Secangkir Teh Sakura..." value="${escapeHtml(editEntry?.title || '')}" required />
          </div>

          <div class="journal-form-group">
            <label>Suasana Hati (Mood):</label>
            <div class="journal-mood-select">
              ${[
                '🌸 Tenang & Bersyukur',
                '🌙 Damai Malam Hari',
                '🎐 Reflektif & Nostalgia',
                '💖 Hangat & Bahagia',
                '✨ Penuh Harapan'
              ].map(mood => `
                <button type="button" class="mood-chip-btn ${selectedMood === mood ? 'active' : ''}" data-mood="${mood}">
                  ${mood}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="journal-form-group">
            <label for="journal-body-input">Isi Tulisan Kenangan:</label>
            <textarea id="journal-body-input" class="journal-textarea" placeholder="Tuliskan renungan, momen indah, atau apa yang kau rasakan hari ini di Gazebo..." required>${escapeHtml(editEntry?.content || '')}</textarea>
          </div>

          <div class="journal-form-actions">
            <button type="button" class="btn-journal-action cancel" id="btn-journal-cancel">Batal</button>
            <button type="submit" class="btn-journal-action save">${isEdit ? 'Simpan Perubahan 🌸' : 'Simpan ke Buku Harian 🌸'}</button>
          </div>
        </form>
      </div>
    `;

    modalBody.querySelector('#tab-journal-list')?.addEventListener('click', () => renderJournalModal('list'));
    modalBody.querySelector('#btn-journal-cancel')?.addEventListener('click', () => renderJournalModal('list'));

    modalBody.querySelectorAll('.mood-chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalBody.querySelectorAll('.mood-chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedMood = btn.getAttribute('data-mood');
      });
    });

    const form = modalBody.querySelector('#journal-composer-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = modalBody.querySelector('#journal-title-input')?.value.trim();
      const content = modalBody.querySelector('#journal-body-input')?.value.trim();

      if (!title || !content) return;

      const journals = loadJournals(currentUid);
      if (isEdit) {
        const idx = journals.findIndex(j => j.id === editEntry.id);
        if (idx !== -1) {
          journals[idx].title = title;
          journals[idx].content = content;
          journals[idx].mood = selectedMood;
          journals[idx].updatedAt = Date.now();
        }
      } else {
        journals.unshift({
          id: 'journal_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          title,
          content,
          mood: selectedMood,
          createdAt: Date.now()
        });
      }

      saveJournals(journals, currentUid);
      if (onShowToast) onShowToast(isEdit ? '🌸 Perubahan kenangan berhasil disimpan!' : '🌸 Kenangan baru terabadikan di jurnal Gazebo!');
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);

      renderJournalModal('list');
    });
  }

  function renderJournalDetail(entry) {
    modalBody.innerHTML = `
      <div class="journal-view">
        <div class="journal-subnav">
          <button type="button" class="btn-journal-tab" id="tab-journal-back">← Kembali ke Daftar</button>
          <button type="button" class="btn-journal-tab active">Membaca Kenangan</button>
        </div>

        <div style="background: rgba(18, 10, 34, 0.7); border: 1px solid rgba(244, 114, 182, 0.35); border-radius: 16px; padding: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.85rem;">
            <div>
              <h3 style="margin: 0 0 0.35rem 0; font-size: 1.2rem; color: #ffffff;">${escapeHtml(entry.title)}</h3>
              <div style="font-size: 0.74rem; color: #a855f7;">${new Date(entry.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <span class="entry-mood-pill">${escapeHtml(entry.mood || '🌸 Tenang')}</span>
          </div>

          <div style="font-size: 0.92rem; line-height: 1.7; color: #f8fafc; white-space: pre-wrap; margin-bottom: 1.5rem; font-family: 'Plus Jakarta Sans', Georgia, serif;">
            ${escapeHtml(entry.content)}
          </div>

          <div style="display: flex; gap: 0.75rem; border-top: 1px solid rgba(244, 114, 182, 0.2); padding-top: 1rem;">
            <button type="button" class="btn-journal-action save" id="btn-edit-journal">✏️ Edit Kenangan</button>
            <button type="button" class="btn-journal-action cancel" id="btn-delete-journal" style="background: rgba(239, 68, 68, 0.25); border: 1px solid #ef4444; color: #fca5a5;">🗑️ Hapus</button>
          </div>
        </div>
      </div>
    `;

    modalBody.querySelector('#tab-journal-back')?.addEventListener('click', () => renderJournalModal('list'));
    modalBody.querySelector('#btn-edit-journal')?.addEventListener('click', () => renderJournalComposer(entry));
    modalBody.querySelector('#btn-delete-journal')?.addEventListener('click', () => {
      if (confirm('Apakah kamu yakin ingin menghapus catatan kenangan ini?')) {
        const list = loadJournals(currentUid).filter(j => j.id !== entry.id);
        saveJournals(list, currentUid);
        if (onShowToast) onShowToast('Catatan kenangan telah dihapus.');
        renderJournalModal('list');
      }
    });
  }

  // --- D. QUIET MOMENT MODAL ---
  function renderQuietModal() {
    modalHeaderIcon.textContent = '🌸';
    modalHeaderTitle.textContent = 'Quiet Moment — Keheningan Gazebo';
    modalHeaderSub.textContent = 'Dengarkan suara alam malam hari untuk meditasi, membaca, atau beristirahat';

    const ambients = [
      { id: 'pond', name: 'Sakura Pond', icon: '🪷', desc: 'Gemericik air kolam teratai yang mengalir damai' },
      { id: 'breeze', name: 'Gentle Breeze', icon: '🎐', desc: 'Semilir angin sepoi yang membelai dedaunan sakura' },
      { id: 'rain', name: 'Soft Rain', icon: '🌧️', desc: 'Rintik hujan senja yang jatuh di atap paviliun gazebo' },
      { id: 'night', name: 'Midnight Garden', icon: '🦗', desc: 'Keheningan malam diiringi dengung serangga taman' }
    ];

    modalBody.innerHTML = `
      <div class="quiet-moment-view">
        <div class="quiet-ambient-grid">
          ${ambients.map(amb => `
            <div class="quiet-ambient-card ${activeAmbient === amb.id ? 'active' : ''}">
              <div class="ambient-card-header">
                <span class="ambient-icon">${amb.icon}</span>
                <div class="ambient-meta">
                  <h4>${amb.name}</h4>
                  <p>${amb.desc}</p>
                </div>
              </div>
              <div class="ambient-controls-row">
                <button type="button" class="btn-ambient-toggle ${activeAmbient === amb.id ? 'playing' : ''}" data-amb-id="${amb.id}">
                  ${activeAmbient === amb.id ? '⏸ Hentikan' : '▶ Dengarkan'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="quiet-master-vol-card">
          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; font-weight: 700; color: #fbcfe8;">
            <span>🔊</span>
            <span>Volume Suasana Alam</span>
          </div>
          <input type="range" class="gazebo-vol-slider" id="slider-ambient-vol" min="0" max="100" value="${Math.round(ambientVolume * 100)}" style="width: 130px;">
        </div>

        ${activeAmbient !== 'none' ? `
          <div style="text-align: center; margin-top: 0.5rem;">
            <button type="button" id="btn-stop-all-ambient" style="background: rgba(239, 68, 68, 0.2); border: 1px solid rgba(239, 68, 68, 0.4); color: #fca5a5; padding: 6px 16px; border-radius: 999px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">
              ⏹ Hentikan Semua Suara Alam
            </button>
          </div>
        ` : ''}
      </div>
    `;

    // Ambient card toggles
    modalBody.querySelectorAll('[data-amb-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ambId = btn.getAttribute('data-amb-id');
        if (activeAmbient === ambId) {
          stopAmbientSound();
        } else {
          startAmbientSound(ambId);
        }
        renderQuietModal();
      });
    });

    modalBody.querySelector('#btn-stop-all-ambient')?.addEventListener('click', () => {
      stopAmbientSound();
      renderQuietModal();
    });

    const volSlider = modalBody.querySelector('#slider-ambient-vol');
    volSlider?.addEventListener('input', (e) => {
      ambientVolume = Number(e.target.value) / 100;
      if (activeAmbient !== 'none') {
        startAmbientSound(activeAmbient);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 5. EVENT LISTENERS
  // ---------------------------------------------------------------------------
  function bindEvents() {
    // Back button
    btnGazeboBack?.addEventListener('click', closeGazebo);

    // Music Player controls
    btnMusicPlay?.addEventListener('click', toggleMusic);
    btnMusicMute?.addEventListener('click', toggleMusicMute);
    sliderMusicVol?.addEventListener('input', (e) => {
      setMusicVolume(Number(e.target.value) / 100);
      isMusicMuted = false;
      updateMusicUI();
    });

    // 4 Activity Card clicks
    cardTeaTime?.addEventListener('click', () => openModal('tea'));
    cardLibrary?.addEventListener('click', () => openModal('library'));
    cardJournal?.addEventListener('click', () => openModal('journal'));
    cardQuiet?.addEventListener('click', () => openModal('quiet'));

    // Table tea indicator click
    tableTeaIndicator?.addEventListener('click', () => openModal('tea'));

    // Modal close button & backdrop click
    btnModalClose?.addEventListener('click', closeModal);
    modalBackdrop?.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  bindEvents();

  // ---------------------------------------------------------------------------
  // 6. PUBLIC CONTROLLER INTERFACE
  // ---------------------------------------------------------------------------
  function openGazebo(userUid = null) {
    if (userUid) currentUid = userUid;
    loadSavedTea(currentUid);

    // Restore music volume
    try {
      const savedVol = localStorage.getItem('olu_syma_gazebo_music_vol');
      if (savedVol) musicVolume = Number(savedVol);
    } catch (_) {}
    updateMusicUI();

    viewGazebo.classList.add('active');
    viewGazebo.setAttribute('aria-hidden', 'false');

    if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.4);
    if (onShowToast) onShowToast('🌸 Memasuki PINWHEEL — Moonlit Blossom Gazebo...');
  }

  function closeGazebo() {
    stopPinwheelMelody();
    stopAmbientSound();
    closeModal();

    viewGazebo.classList.remove('active');
    viewGazebo.setAttribute('aria-hidden', 'true');

    if (typeof onNavigateBack === 'function') {
      onNavigateBack();
    }
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    openGazebo,
    closeGazebo,
    openModal,
    closeModal,
    startPinwheelMelody,
    stopPinwheelMelody,
    startAmbientSound,
    stopAmbientSound,
    getCurrentTea: () => ({ ...currentTea }),
    setSelectedTea: (teaId) => saveSelectedTea(teaId),
    getJournals: () => loadJournals(currentUid),
    addJournal: (entry) => {
      const list = loadJournals(currentUid);
      list.unshift({ ...entry, id: 'j_' + Date.now(), createdAt: Date.now() });
      saveJournals(list, currentUid);
      return list;
    }
  };
}

