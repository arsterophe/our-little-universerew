// shadow_gazebo_view.js
// SHADOW — MOONLIT SERENITY GAZEBO CONTROLLER
// Immersive Donghua Fantasy Gazebo Experience for Lele's Universe

import { auth } from './firebase.js';
import {
  getAuthorStories,
  getPublishedStories,
  saveReadingProgress,
  getReadingProgress
} from './stories.js';
import {
  getCurrentUniverseState,
  updateElementState,
  onUniverseStateChange
} from './universe_state.js';

export function initShadowGazeboView({
  onShowToast,
  onTriggerSparkle,
  onNavigateBack,
  onNavigateStoryWorkspace
} = {}) {
  const viewGazebo = document.getElementById('view-shadow-gazebo');
  if (!viewGazebo) return null;

  // DOM Elements - Top Bar
  const btnGazeboBack = document.getElementById('btn-gazebo-back');
  const btnMusicPlay = document.getElementById('btn-gazebo-music-toggle');
  const btnMusicMute = document.getElementById('btn-gazebo-music-mute');
  const sliderMusicVol = document.getElementById('slider-gazebo-music-vol');
  const musicNoteIcon = document.getElementById('gazebo-music-icon');
  const audioSeruling = document.getElementById('audio-gazebo-seruling');

  // DOM Elements - Main Activity Cards
  const cardTeaTime = document.getElementById('gazebo-card-tea');
  const cardLibrary = document.getElementById('gazebo-card-library');
  const cardJournal = document.getElementById('gazebo-card-journal');
  const cardQuiet = document.getElementById('gazebo-card-quiet');
  const tableTeaIndicator = document.getElementById('gazebo-table-tea-indicator');
  const tableTeaText = document.getElementById('gazebo-table-tea-text');

  // DOM Elements - Modals
  const modalBackdrop = document.getElementById('gazebo-modal-backdrop');
  const btnModalClose = document.getElementById('btn-gazebo-modal-close');
  const modalHeaderIcon = document.getElementById('gazebo-modal-header-icon');
  const modalHeaderTitle = document.getElementById('gazebo-modal-header-title');
  const modalHeaderSub = document.getElementById('gazebo-modal-header-sub');
  const modalBody = document.getElementById('gazebo-modal-body');

  // State
  let activeActivity = null; // 'tea' | 'library' | 'journal' | 'quiet'
  let currentTea = {
    id: 'jasmine',
    name: 'Jasmine Tea (Teh Melati)',
    icon: '🍵',
    desc: 'Wangi lembut bunga melati yang menenangkan pikiran di bawah sinar rembulan malam.'
  };

  let isMusicPlaying = false;
  let musicVolume = 0.7;
  let isMusicMuted = false;

  // Quiet Moment State
  let activeAmbient = 'none'; // 'river' | 'wind' | 'rain' | 'night'
  let ambientVolume = 0.6;
  let isAmbientMuted = false;

  // Web Audio Context & Nodes
  let audioCtx = null;
  let musicDiziInterval = null;
  let musicGainNode = null;
  let ambientGainNode = null;
  let activeAmbientSources = [];

  // Library / Reader State
  let activeReadingStory = null;
  let currentReaderPage = 1;
  let totalReaderPages = 1;
  let readerFontSize = 1.15; // rem

  // Journal State
  let currentJournals = [];

  // Tea Catalog
  const TEA_CATALOG = {
    jasmine: {
      id: 'jasmine',
      name: 'Jasmine Tea (Teh Melati)',
      icon: '🍵',
      desc: 'Wangi lembut bunga melati yang menenangkan pikiran di bawah sinar rembulan malam.'
    },
    oolong: {
      id: 'oolong',
      name: 'Oolong Tea (Teh Oolong)',
      icon: '🫖',
      desc: 'Rasa hangat beraroma kayu manis dan daun teh pegunungan tinggi yang menyejukkan batin.'
    },
    herbal: {
      id: 'herbal',
      name: 'Herbal Tea (Teh Herbal Bulan)',
      icon: '🌸',
      desc: 'Seduhan chamomile, lavender malam, dan embun kristal untuk kedamaian tidur nyenyak.'
    }
  };

  // ==========================================================================
  // 1. AUDIO ENGINE (DONGHUA FLUTE & PROCEDURAL AMBIENT SYNTHESIS)
  // ==========================================================================

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  }

  // --- Dizi (Bamboo Flute) Pentatonic Melody Synthesizer ---
  // Pentatonic scale (D4, E4, G4, A4, B4, D5, E5) characteristic of oriental donghua soundtracks
  const DIZI_NOTES = [293.66, 329.63, 392.00, 440.00, 493.88, 587.33, 659.25];

  function playDiziNote(freq, duration = 3.2, delay = 0) {
    const ctx = getAudioContext();
    if (!ctx) return;

    setTimeout(() => {
      if (!isMusicPlaying) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Flute tone: Triangle wave through warm low-pass filter
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle breath vibrato (5 Hz)
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 5.2;
      lfoGain.gain.value = 3.5;
      lfo.connect(osc.frequency);
      lfo.start(now);
      lfo.stop(now + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.value = 2.5;

      const masterVol = isMusicMuted ? 0 : musicVolume * 0.28;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(masterVol, now + 0.6); // Soft breath attack
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.2);

      // Add a soft Guzheng string pluck 0.4s later on harmonic
      if (Math.random() > 0.4) {
        playGuzhengPluck(freq * 0.5, 0.4);
      }
    }, delay * 1000);
  }

  function playGuzhengPluck(freq, delay = 0) {
    const ctx = getAudioContext();
    if (!ctx) return;

    setTimeout(() => {
      if (!isMusicPlaying) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      const pluckVol = isMusicMuted ? 0 : musicVolume * 0.14;
      gain.gain.setValueAtTime(pluckVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 2.4);
    }, delay * 1000);
  }

  function startDiziMusic() {
    isMusicPlaying = true;
    updateMusicUI();

    // Check if real MP3 exists and can be played
    if (audioSeruling && audioSeruling.src && audioSeruling.canPlayType('audio/mpeg')) {
      audioSeruling.volume = isMusicMuted ? 0 : musicVolume;
      const playPromise = audioSeruling.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          return; // Native MP3 playing successfully
        }).catch(() => {
          // Fallback to Web Audio synthesis
          runProceduralDizi();
        });
        return;
      }
    }

    runProceduralDizi();
  }

  function runProceduralDizi() {
    const ctx = getAudioContext();
    if (!ctx) return;

    function playPhrase() {
      if (!isMusicPlaying) return;
      // Pick 3-5 pentatonic notes
      const phraseLength = Math.floor(Math.random() * 3) + 3;
      for (let i = 0; i < phraseLength; i++) {
        const note = DIZI_NOTES[Math.floor(Math.random() * DIZI_NOTES.length)];
        const dur = Math.random() * 1.5 + 2.5;
        playDiziNote(note, dur, i * 2.2);
      }
    }

    playPhrase();
    if (musicDiziInterval) clearInterval(musicDiziInterval);
    musicDiziInterval = setInterval(playPhrase, 9500);
  }

  function stopDiziMusic() {
    isMusicPlaying = false;
    updateMusicUI();
    if (musicDiziInterval) {
      clearInterval(musicDiziInterval);
      musicDiziInterval = null;
    }
    if (audioSeruling) {
      try { audioSeruling.pause(); } catch (_) {}
    }
  }

  function toggleMusic() {
    getAudioContext();
    if (isMusicPlaying) {
      stopDiziMusic();
    } else {
      startDiziMusic();
    }
  }

  function setMusicVolume(vol) {
    musicVolume = Math.max(0, Math.min(1, vol));
    if (audioSeruling) {
      audioSeruling.volume = isMusicMuted ? 0 : musicVolume;
    }
    try {
      localStorage.setItem('olu_gazebo_music_vol', String(musicVolume));
    } catch (_) {}
  }

  function toggleMusicMute() {
    isMusicMuted = !isMusicMuted;
    if (audioSeruling) {
      audioSeruling.muted = isMusicMuted;
    }
    updateMusicUI();
  }

  function updateMusicUI() {
    if (btnMusicPlay) {
      btnMusicPlay.innerHTML = isMusicPlaying ? '⏸' : '▶';
      btnMusicPlay.title = isMusicPlaying ? 'Jeda Musik' : 'Putar Musik Seruling Malam';
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

    // Create White/Pink Noise Buffer for water, rain, wind
    const bufferSize = ctx.sampleRate * 2.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    if (type === 'river') {
      // Flowing water: Bandpass filtered noise with fluctuating frequency
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.value = 1.8;

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      activeAmbientSources.push(noise);

    } else if (type === 'rain') {
      // Gentle rain: Lowpass noise + resonant droplets
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, now);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      activeAmbientSources.push(noise);

    } else if (type === 'wind') {
      // Night breeze: Deep oscillating lowpass noise
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      // LFO for swaying wind
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.22;
      lfoGain.gain.value = 180;
      lfo.connect(filter.frequency);
      lfo.start(now);

      noise.connect(filter);
      filter.connect(masterGain);
      noise.start(now);
      activeAmbientSources.push(noise, lfo);

    } else if (type === 'night') {
      // Night serenity: Crickets chirping + quiet night resonance
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
        g.gain.linearRampToValueAtTime(0.06, t + 0.04);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(t);
        osc.stop(t + 0.16);
      }, 750);
    }
  }

  // ==========================================================================
  // 2. STATE HYDRATION FROM FIRESTORE UNIVERSE_STATES
  // ==========================================================================

  function hydrateFromUniverseState() {
    const state = getCurrentUniverseState();
    const gazeboData = state?.elements?.gazebo || {};

    if (gazeboData.selectedTea && TEA_CATALOG[gazeboData.selectedTea]) {
      currentTea = TEA_CATALOG[gazeboData.selectedTea];
    } else if (gazeboData.teaType) {
      currentTea.name = gazeboData.teaType;
    }

    if (Array.isArray(gazeboData.journals)) {
      currentJournals = gazeboData.journals;
    }

    updateTeaTableIndicator();
  }

  function updateTeaTableIndicator() {
    if (tableTeaText) {
      tableTeaText.textContent = `${currentTea.name} · Siap Diseduh 🍵`;
    }
  }

  // ==========================================================================
  // 3. ACTIVITY MODALS CONTROLLER
  // ==========================================================================

  function openActivityModal(activityKey) {
    activeActivity = activityKey;
    if (!modalBackdrop || !modalBody) return;

    if (activityKey === 'tea') {
      renderTeaModal();
    } else if (activityKey === 'library') {
      renderLibraryModal();
    } else if (activityKey === 'journal') {
      renderJournalModal();
    } else if (activityKey === 'quiet') {
      renderQuietModal();
    }

    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');

    if (onTriggerSparkle) {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  function closeActivityModal() {
    activeActivity = null;
    activeReadingStory = null;
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // ==========================================================================
  // 3A. TEA TIME MODAL
  // ==========================================================================

  function renderTeaModal() {
    modalHeaderIcon.textContent = '🍵';
    modalHeaderTitle.textContent = 'Tea Time di Bawah Rembulan';
    modalHeaderSub.textContent = 'Pilih racikan teh hangat untuk menemani ketenangan malammu di Gazebo';

    modalBody.innerHTML = `
      <div class="tea-selection-grid">
        ${Object.values(TEA_CATALOG).map(tea => `
          <div class="tea-option-card ${currentTea.id === tea.id ? 'selected' : ''}" data-tea-id="${tea.id}">
            <div class="tea-option-icon">${tea.icon}</div>
            <h4>${tea.name}</h4>
            <p>${tea.desc}</p>
          </div>
        `).join('')}
      </div>

      <div class="tea-serving-display">
        <div class="tea-cup-visual" id="tea-cup-steam-target">
          ${currentTea.icon}
        </div>
        <div style="flex: 1;">
          <h4 style="margin: 0; font-size: 1.05rem; color: #ffffff;" id="tea-serving-name">${currentTea.name}</h4>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.82rem; color: #cbd5e1;" id="tea-serving-desc">${currentTea.desc}</p>
        </div>
      </div>

      <button type="button" class="btn-brew-tea" id="btn-brew-confirm">
        <span>🍵 Seduh Secangkir Teh Ini</span>
      </button>
    `;

    // Click tea options
    modalBody.querySelectorAll('.tea-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const teaId = card.getAttribute('data-tea-id');
        const selected = TEA_CATALOG[teaId];
        if (!selected) return;

        currentTea = selected;
        modalBody.querySelectorAll('.tea-option-card').forEach(c => c.classList.toggle('selected', c.getAttribute('data-tea-id') === teaId));
        const sName = modalBody.querySelector('#tea-serving-name');
        const sDesc = modalBody.querySelector('#tea-serving-desc');
        const sIcon = modalBody.querySelector('#tea-cup-steam-target');
        if (sName) sName.textContent = selected.name;
        if (sDesc) sDesc.textContent = selected.desc;
        if (sIcon) sIcon.textContent = selected.icon;
      });
    });

    // Brew confirm button
    modalBody.querySelector('#btn-brew-confirm')?.addEventListener('click', () => {
      // Save state to universe_states in Firestore
      updateElementState('gazebo', {
        teaReady: true,
        teaType: currentTea.name,
        selectedTea: currentTea.id,
        lastBrewed: Date.now()
      });

      updateTeaTableIndicator();
      closeActivityModal();

      if (onShowToast) {
        onShowToast(`🍵 Secangkir ${currentTea.name} telah diseduh di atas meja Gazebo. Nikmati kehangatannya! 🌙`);
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      }
    });
  }

  // ==========================================================================
  // 3B. PERPUSTAKAAN KECIL (SMALL LIBRARY — FITUR UTAMA)
  // ==========================================================================

  function renderLibraryModal() {
    modalHeaderIcon.textContent = '📖';
    modalHeaderTitle.textContent = 'Perpustakaan Kecil Lele';
    modalHeaderSub.textContent = 'Buku dan karya cerita yang pernah kamu tulis di Story Studio';

    // Fetch author stories for Lele
    const stories = getAuthorStories('lele') || [];

    if (stories.length === 0) {
      modalBody.innerHTML = `
        <div class="library-empty-box">
          <div style="font-size: 3rem; filter: drop-shadow(0 0 10px rgba(196, 181, 253, 0.5));">📚</div>
          <h3>Perpustakaan Masih Menanti Karya Pertamamu</h3>
          <p>Belum ada buku atau cerita yang kamu tulis. Tulis karya indah pertamamu di Story Studio dan buku tersebut akan otomatis tersimpan rapi di rak perpustakaan Gazebo ini!</p>
          <button type="button" class="btn-open-story-studio" id="btn-goto-story-studio">
            <span>✍️ Buka Story Studio & Tulis Buku</span>
          </button>
        </div>
      `;

      modalBody.querySelector('#btn-goto-story-studio')?.addEventListener('click', () => {
        closeActivityModal();
        closeShadowGazebo();
        if (typeof onNavigateStoryWorkspace === 'function') {
          onNavigateStoryWorkspace('view-shadow-world', 'editor');
        } else if (onShowToast) {
          onShowToast('Membuka Story Studio...');
        }
      });
      return;
    }

    // Retrieve saved reading progresses from universe_states
    const state = getCurrentUniverseState();
    const readingProgressMap = state?.elements?.gazebo?.readingProgress || {};

    modalBody.innerHTML = `
      <div class="library-books-grid">
        ${stories.map(story => {
          const prog = readingProgressMap[story.id] || getReadingProgress(story.id, 'lele') || { percent: 0, page: 1 };
          const percent = prog.percent || 0;
          return `
            <div class="library-book-card" data-story-id="${story.id}">
              <div class="book-card-header">
                <span class="book-category-pill">${(story.category || 'Novel').toUpperCase()}</span>
                <span style="font-size: 0.75rem; color: #94a3b8;">${story.wordCount || 0} kata</span>
              </div>
              <h4>${escapeHtml(story.title || 'Karya Tanpa Judul')}</h4>
              <p>${escapeHtml(story.synopsis || story.subtitle || 'Belum ada sinopsis singkat.')}</p>

              <div class="book-progress-bar-wrap">
                <div class="progress-track">
                  <div class="progress-fill" style="width: ${percent}%;"></div>
                </div>
                <div class="progress-label-text">
                  <span>${percent > 0 ? `Progres: ${percent}%` : 'Belum dibaca'}</span>
                  <span style="color: #c4b5fd;">Buka ➔</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modalBody.querySelectorAll('.library-book-card').forEach(card => {
      card.addEventListener('click', () => {
        const storyId = card.getAttribute('data-story-id');
        const story = stories.find(s => s.id === storyId);
        if (story) {
          openReaderView(story);
        }
      });
    });
  }

  // --- Gazebo Book Reader View ---
  function openReaderView(story) {
    activeReadingStory = story;

    // Split story content into comfortable pages (~280 words per page or paragraph blocks)
    const rawContent = story.content || 'Cerita ini masih belum memiliki isi.';
    const paragraphs = rawContent.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const pages = [];

    let curPage = [];
    let curWords = 0;

    paragraphs.forEach(p => {
      const words = p.split(/\s+/).length;
      if (curWords + words > 260 && curPage.length > 0) {
        pages.push(curPage.join('\n\n'));
        curPage = [p];
        curWords = words;
      } else {
        curPage.push(p);
        curWords += words;
      }
    });
    if (curPage.length > 0) pages.push(curPage.join('\n\n'));
    if (pages.length === 0) pages.push(rawContent);

    totalReaderPages = pages.length;

    // Restore saved progress
    const state = getCurrentUniverseState();
    const readingProgressMap = state?.elements?.gazebo?.readingProgress || {};
    const saved = readingProgressMap[story.id] || getReadingProgress(story.id, 'lele') || {};
    currentReaderPage = Math.min(totalReaderPages, Math.max(1, saved.page || 1));

    modalHeaderIcon.textContent = '📖';
    modalHeaderTitle.textContent = story.title || 'Membaca Buku';
    modalHeaderSub.textContent = `Karya Lele · Halaman ${currentReaderPage} dari ${totalReaderPages}`;

    function renderPage() {
      const pageText = pages[currentReaderPage - 1] || '';
      const percent = Math.round((currentReaderPage / totalReaderPages) * 100);

      // Save progress to universe_states & stories progress store
      const updatedProg = {
        ...readingProgressMap,
        [story.id]: {
          page: currentReaderPage,
          totalPages: totalReaderPages,
          percent: percent,
          lastRead: Date.now()
        }
      };

      updateElementState('gazebo', { readingProgress: updatedProg });
      saveReadingProgress(story.id, percent, currentReaderPage / totalReaderPages, 'lele');

      modalHeaderSub.textContent = `Karya Lele · Halaman ${currentReaderPage} dari ${totalReaderPages} (${percent}%)`;

      modalBody.innerHTML = `
        <div class="gazebo-reader-container">
          <div class="reader-nav-header">
            <button type="button" class="btn-reader-back" id="btn-back-to-library">
              ← Kembali ke Rak Buku
            </button>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="btn-reader-back" id="btn-font-smaller">A-</button>
              <button type="button" class="btn-reader-back" id="btn-font-larger">A+</button>
            </div>
          </div>

          <div class="reader-content-sheet" id="reader-text-sheet" style="font-size: ${readerFontSize}rem;">
            ${escapeHtml(pageText)}
          </div>

          <div class="reader-pager-footer">
            <button type="button" class="btn-reader-page" id="btn-prev-page" ${currentReaderPage <= 1 ? 'disabled' : ''}>
              ← Halaman Sebelumnya
            </button>
            <span style="font-size: 0.8rem; color: #c4b5fd;">
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

  // ==========================================================================
  // 3C. JURNAL MALAM (NIGHT JOURNAL)
  // ==========================================================================

  function renderJournalModal(subTab = 'list') {
    modalHeaderIcon.textContent = '📜';
    modalHeaderTitle.textContent = 'Jurnal Malam Lele';
    modalHeaderSub.textContent = 'Tulis renungan, mimpi, dan perasaanmu di bawah naungan Gazebo';

    const state = getCurrentUniverseState();
    currentJournals = state?.elements?.gazebo?.journals || currentJournals || [];

    if (subTab === 'write') {
      renderJournalComposer();
      return;
    }

    // Default: List view
    modalBody.innerHTML = `
      <div class="journal-tabs-row">
        <button type="button" class="journal-tab-btn active" id="tab-journal-list">📜 Daftar Catatan (${currentJournals.length})</button>
        <button type="button" class="journal-tab-btn" id="tab-journal-write">✍️ Tulis Jurnal Baru</button>
      </div>

      <div class="journal-entries-list">
        ${currentJournals.length === 0 ? `
          <div class="library-empty-box" style="padding: 2.5rem 1rem;">
            <div style="font-size: 2.5rem;">🌙</div>
            <h3>Jurnalmu Masih Bersih</h3>
            <p>Belum ada catatan yang ditulis malam ini. Tuangkan renungan atau harapanmu di sini.</p>
            <button type="button" class="btn-open-story-studio" id="btn-first-journal-write">
              <span>✍️ Tulis Catatan Pertama</span>
            </button>
          </div>
        ` : currentJournals.map(j => `
          <div class="journal-entry-card" data-journal-id="${j.id}">
            <div class="journal-card-top">
              <h4>${escapeHtml(j.title || 'Catatan Tanpa Judul')}</h4>
              <span class="journal-card-date">${j.date || 'Malam ini'}</span>
            </div>
            <p class="journal-card-snippet">${escapeHtml(j.content || '')}</p>
          </div>
        `).join('')}
      </div>
    `;

    modalBody.querySelector('#tab-journal-write')?.addEventListener('click', () => renderJournalModal('write'));
    modalBody.querySelector('#btn-first-journal-write')?.addEventListener('click', () => renderJournalModal('write'));

    modalBody.querySelectorAll('.journal-entry-card').forEach(card => {
      card.addEventListener('click', () => {
        const jId = card.getAttribute('data-journal-id');
        const entry = currentJournals.find(j => j.id === jId);
        if (entry) renderJournalDetail(entry);
      });
    });
  }

  function renderJournalComposer() {
    let selectedMood = 'tenang';

    modalBody.innerHTML = `
      <div class="journal-tabs-row">
        <button type="button" class="journal-tab-btn" id="tab-journal-list">← Kembali ke Daftar</button>
        <button type="button" class="journal-tab-btn active">✍️ Tulis Jurnal Baru</button>
      </div>

      <div class="journal-form">
        <input type="text" class="journal-input-title" id="journal-input-title"
          placeholder="Judul catatan malam ini (contoh: Menikmati Gemericik Sungai Kristal)" maxlength="100">

        <div class="journal-mood-selector">
          <span style="font-size: 0.8rem; color: #94a3b8;">Suasana Hati:</span>
          <button type="button" class="journal-mood-pill selected" data-mood="tenang">🌙 Tenang</button>
          <button type="button" class="journal-mood-pill" data-mood="damai">💎 Damai</button>
          <button type="button" class="journal-mood-pill" data-mood="bahagia">✨ Bahagia</button>
          <button type="button" class="journal-mood-pill" data-mood="rindu">🌸 Rindu</button>
        </div>

        <textarea class="journal-textarea-body" id="journal-input-body"
          placeholder="Tuliskan renungan, mimpi, atau perasaanmu malam ini di bawah naungan Gazebo..."></textarea>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn-gazebo-back" id="btn-journal-cancel">Batal</button>
          <button type="button" class="btn-brew-tea" id="btn-journal-save" style="margin: 0;">
            <span>💾 Simpan ke Jurnal Malam</span>
          </button>
        </div>
      </div>
    `;

    modalBody.querySelector('#tab-journal-list')?.addEventListener('click', () => renderJournalModal('list'));
    modalBody.querySelector('#btn-journal-cancel')?.addEventListener('click', () => renderJournalModal('list'));

    modalBody.querySelectorAll('.journal-mood-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedMood = btn.getAttribute('data-mood');
        modalBody.querySelectorAll('.journal-mood-pill').forEach(b => b.classList.toggle('selected', b.getAttribute('data-mood') === selectedMood));
      });
    });

    modalBody.querySelector('#btn-journal-save')?.addEventListener('click', () => {
      const title = modalBody.querySelector('#journal-input-title')?.value.trim();
      const content = modalBody.querySelector('#journal-input-body')?.value.trim();

      if (!content) {
        if (onShowToast) onShowToast('Mohon tulis isi catatan terlebih dahulu.');
        return;
      }

      const now = new Date();
      const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

      const newEntry = {
        id: `journal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title || 'Renungan Malam',
        content,
        mood: selectedMood,
        date: dateStr,
        createdAt: Date.now()
      };

      currentJournals.unshift(newEntry);

      // Persist to universe_states in Firestore
      updateElementState('gazebo', { journals: currentJournals });

      if (onShowToast) onShowToast('📜 Catatan malammu berhasil disimpan ke dalam Jurnal Gazebo!');
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);

      renderJournalModal('list');
    });
  }

  function renderJournalDetail(entry) {
    modalBody.innerHTML = `
      <div class="journal-tabs-row">
        <button type="button" class="journal-tab-btn active" id="tab-journal-back">← Kembali ke Daftar Jurnal</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        <div style="border-bottom: 1px solid rgba(196, 181, 253, 0.2); padding-bottom: 0.75rem;">
          <h3 style="margin: 0; font-size: 1.35rem; color: #ffffff;">${escapeHtml(entry.title)}</h3>
          <span style="font-size: 0.8rem; color: #c4b5fd;">Ditulis pada ${entry.date} · Suasana: ${entry.mood || 'tenang'}</span>
        </div>

        <div class="reader-content-sheet" style="font-family: inherit; font-size: 1rem; line-height: 1.75;">
          ${escapeHtml(entry.content)}
        </div>

        <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem;">
          <button type="button" class="btn-gazebo-back" id="btn-delete-journal" style="color: #f43f5e; border-color: rgba(244, 63, 94, 0.4);">
            🗑️ Hapus Catatan Ini
          </button>
        </div>
      </div>
    `;

    modalBody.querySelector('#tab-journal-back')?.addEventListener('click', () => renderJournalModal('list'));

    modalBody.querySelector('#btn-delete-journal')?.addEventListener('click', () => {
      if (window.confirm('Hapus catatan jurnal ini?')) {
        currentJournals = currentJournals.filter(j => j.id !== entry.id);
        updateElementState('gazebo', { journals: currentJournals });
        if (onShowToast) onShowToast('🗑️ Catatan jurnal berhasil dihapus.');
        renderJournalModal('list');
      }
    });
  }

  // ==========================================================================
  // 3D. QUIET MOMENT MODAL
  // ==========================================================================

  function renderQuietModal() {
    modalHeaderIcon.textContent = '🔮';
    modalHeaderTitle.textContent = 'Quiet Moment di Gazebo';
    modalHeaderSub.textContent = 'Dengarkan suara alam malam hari untuk meditasi dan ketenangan pikiran';

    const ambientOptions = [
      { id: 'river', icon: '🌊', title: 'Aliran Sungai', desc: 'Gemericik air Sungai Kristal yang mengalir lembut' },
      { id: 'wind', icon: '🍃', title: 'Angin Malam', desc: 'Semilir angin sejuk yang berbisik di antara tirai sutra' },
      { id: 'rain', icon: '🌧️', title: 'Suara Hujan', desc: 'Rintik hujan tenang di atas atap kristal gazebo' },
      { id: 'night', icon: '🌙', title: 'Suasana Malam', desc: 'Kicau jangkrik damai dan keheningan malam yang sunyi' }
    ];

    modalBody.innerHTML = `
      <div class="ambient-options-grid">
        ${ambientOptions.map(opt => `
          <div class="ambient-sound-card ${activeAmbient === opt.id ? 'active' : ''}" data-sound-id="${opt.id}">
            <div class="sound-card-icon">${opt.icon}</div>
            <div class="sound-card-meta">
              <h4>${opt.title}</h4>
              <p>${opt.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="ambient-controls-bar">
        <div class="ambient-active-name" id="ambient-active-name-display">
          ${activeAmbient !== 'none'
            ? `🔊 Sedang diputar: ${ambientOptions.find(o => o.id === activeAmbient)?.title || activeAmbient}`
            : '⏸ Tidak ada suara alam yang aktif'}
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button type="button" class="btn-music-play" id="btn-ambient-stop" title="Hentikan Suara Alam">
            ${activeAmbient !== 'none' ? '⏹' : '▶'}
          </button>
          <input type="range" class="gazebo-vol-slider" id="slider-ambient-vol" min="0" max="100" value="${Math.round(ambientVolume * 100)}">
        </div>
      </div>
    `;

    modalBody.querySelectorAll('.ambient-sound-card').forEach(card => {
      card.addEventListener('click', () => {
        const soundId = card.getAttribute('data-sound-id');
        getAudioContext();

        if (activeAmbient === soundId) {
          stopAmbientSound();
        } else {
          startAmbientSound(soundId);
        }
        renderQuietModal();
      });
    });

    modalBody.querySelector('#btn-ambient-stop')?.addEventListener('click', () => {
      if (activeAmbient !== 'none') {
        stopAmbientSound();
      } else {
        startAmbientSound('river');
      }
      renderQuietModal();
    });

    modalBody.querySelector('#slider-ambient-vol')?.addEventListener('input', (e) => {
      ambientVolume = e.target.value / 100;
      if (activeAmbientSources.length > 0 && activeAmbient !== 'none') {
        startAmbientSound(activeAmbient);
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // ==========================================================================
  // 4. NAVIGATION & VIEW LIFECYCLE
  // ==========================================================================

  function openShadowGazebo() {
    viewGazebo.classList.add('active');
    viewGazebo.setAttribute('aria-hidden', 'false');

    hydrateFromUniverseState();
    updateMusicUI();

    if (onTriggerSparkle) {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  function closeShadowGazebo() {
    closeActivityModal();
    stopDiziMusic();
    stopAmbientSound();

    viewGazebo.classList.remove('active');
    viewGazebo.setAttribute('aria-hidden', 'true');

    if (typeof onNavigateBack === 'function') {
      onNavigateBack();
    } else {
      const shadowWorld = document.getElementById('view-shadow-world');
      if (shadowWorld) {
        shadowWorld.classList.add('active');
        shadowWorld.setAttribute('aria-hidden', 'false');
      }
    }
  }

  // ==========================================================================
  // 5. EVENT LISTENERS SETUP
  // ==========================================================================

  if (btnGazeboBack) {
    btnGazeboBack.addEventListener('click', closeShadowGazebo);
  }

  if (cardTeaTime) {
    cardTeaTime.addEventListener('click', () => openActivityModal('tea'));
  }
  if (cardLibrary) {
    cardLibrary.addEventListener('click', () => openActivityModal('library'));
  }
  if (cardJournal) {
    cardJournal.addEventListener('click', () => openActivityModal('journal'));
  }
  if (cardQuiet) {
    cardQuiet.addEventListener('click', () => openActivityModal('quiet'));
  }

  if (btnModalClose) {
    btnModalClose.addEventListener('click', closeActivityModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeActivityModal();
    });
  }

  // Music controls
  if (btnMusicPlay) {
    btnMusicPlay.addEventListener('click', toggleMusic);
  }
  if (btnMusicMute) {
    btnMusicMute.addEventListener('click', toggleMusicMute);
  }
  if (sliderMusicVol) {
    sliderMusicVol.addEventListener('input', (e) => {
      setMusicVolume(e.target.value / 100);
      updateMusicUI();
    });
  }

  // Listen to universe state changes for sync
  onUniverseStateChange(() => {
    hydrateFromUniverseState();
  });

  // Load saved music volume preference
  try {
    const savedVol = localStorage.getItem('olu_gazebo_music_vol');
    if (savedVol !== null) musicVolume = parseFloat(savedVol) || 0.7;
  } catch (_) {}

  // ==========================================================================
  // 6. RETURN PUBLIC API
  // ==========================================================================

  return {
    openShadowGazebo,
    closeShadowGazebo,
    openActivityModal,
    startDiziMusic,
    stopDiziMusic,
    startAmbientSound,
    stopAmbientSound,
    refreshGazebo: hydrateFromUniverseState
  };
}

