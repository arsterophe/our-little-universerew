/**
 * KIDULT — EVERDREAM GAZEBO CONTROLLER
 * Nyanya's Storybook Fairytale Gazebo Sanctuary
 * =============================================================================
 * Implements:
 * 1. Top Bar with Brand Title, Quote, and Music Player (Zero Autoplay)
 * 2. Four Central Activity Cards:
 *    - 🫖 Tea Time: Warm floral teas, sweet snacks & serving display
 *    - 📖 Perpustakaan Kecil: Stories reading integrated with Our Stories, pagination & progress tracking
 *    - 📜 Jurnal Malam: Personal journal reflecting KIDULT philosophy (inner child, growth, nostalgia)
 *    - 🔮 Quiet Moment: 4 procedural ambient soundscapes with volume slider
 * 3. Bottom Panel:
 *    - Left: Philosophical serenity quote
 *    - Right: Table tea indicator & Quick access to "🎵 Songs We Share"
 * 4. Interior Interactions: Petting sleeping puppy Mochi 🐾, cycling lantern atmospheres 🕯️
 * 5. Full 8-character equal access with isolated storage
 */

import {
  KIDULT_TEAS,
  KIDULT_TREATS,
  KIDULT_GAZEBO_LIGHTS,
  KIDULT_JOURNAL_MOODS,
  KIDULT_AMBIENT_OPTIONS,
  NYANYA_HERO_QUOTE,
  PUPPY_INTERACTIONS,
  createDefaultKidultGazeboState,
  loadKidultGazeboState,
  saveKidultGazeboState,
  createGazeboAudioEngine
} from './kidult_gazebo_state.js';

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

import {
  openSongsWeShareModal
} from './songs_we_share.js';

export function initKidultGazeboView(options = {}) {
  const {
    onShowToast,
    onTriggerSparkle,
    onNavigateBack,
    onNavigateStoryWorkspace
  } = options;

  const viewGazebo = document.getElementById('view-kidult-gazebo');
  if (!viewGazebo) return null;

  // Top Bar Elements
  const btnGazeboBack = document.getElementById('btn-kgazebo-back');
  const gardenerInfo = document.getElementById('kgazebo-gardener-info');
  const btnMusicToggle = document.getElementById('btn-kgazebo-music-toggle');
  const btnMusicMute = document.getElementById('btn-kgazebo-music-mute');
  const sliderMusicVol = document.getElementById('slider-kgazebo-music-vol');
  const musicNoteIcon = document.getElementById('kgazebo-music-icon');
  const trackTitleEl = document.getElementById('kgazebo-track-title');

  // Four Main Activity Cards
  const cardTea = document.getElementById('kgazebo-card-tea');
  const cardLibrary = document.getElementById('kgazebo-card-library');
  const cardJournal = document.getElementById('kgazebo-card-journal');
  const cardQuiet = document.getElementById('kgazebo-card-quiet');

  // Bottom Panel Elements
  const quoteBadgeText = document.getElementById('kgazebo-badge-quote-text');
  const tableTeaText = document.getElementById('kgazebo-table-tea-text');
  const btnSongsWeShare = document.getElementById('btn-kgazebo-songs-we-share');
  const btnQuickTea = document.getElementById('btn-kgazebo-quick-tea');

  // Modals
  const modalBackdrop = document.getElementById('kgazebo-modal-backdrop');
  const btnModalClose = document.getElementById('btn-kgazebo-modal-close');
  const modalHeaderIcon = document.getElementById('kgazebo-modal-header-icon');
  const modalHeaderTitle = document.getElementById('kgazebo-modal-header-title');
  const modalHeaderSub = document.getElementById('kgazebo-modal-header-sub');
  const modalBody = document.getElementById('kgazebo-modal-body');

  // Scene Interior Hotspots & Layers
  const lightingOverlay = document.getElementById('kgazebo-lighting-overlay');
  const hotspotPuppy = document.getElementById('hotspot-kg-puppy');
  const hotspotLanterns = document.getElementById('hotspot-kg-lanterns');
  const steamEffect = document.getElementById('kg-steam-effect');

  // State Management
  let activeCharKey = 'nyanya';
  let gazeboState = null;
  let activeActivity = null; // 'tea' | 'library' | 'journal' | 'quiet'
  let currentSelectedTea = KIDULT_TEAS.lavender_star;

  // Audio Engine
  const audioEngine = createGazeboAudioEngine();
  let isMusicPlaying = false;
  let isMusicMuted = false;
  let musicVolume = 0.7;

  // Reader State
  let activeReadingStory = null;
  let currentReaderPage = 1;
  let totalReaderPages = 1;
  let readerFontSize = 1.15; // rem

  const CHARACTER_NAMES = {
    nyanya: 'Nyanya ⭐',
    lala: 'Lala ☀️',
    lele: 'Lele 🌙',
    syma: 'Syma ☁️',
    abil: 'Syma ☁️',
    akhira: 'Akhira 🌊',
    ela: 'Ela 🪷',
    ruben: 'Ruben 🐉',
    royan: 'Royan 🎆'
  };

  function renderGardenerBadge(charKey) {
    if (!gardenerInfo) return;
    const isHost = (charKey === 'nyanya');
    const displayName = CHARACTER_NAMES[charKey] || 'Pengunjung';
    if (isHost) {
      gardenerInfo.innerHTML = `
        <span class="kg-badge-host">🏛 Sanctuary Host</span>
        <span class="kg-gardener-name">${displayName}</span>
      `;
    } else {
      gardenerInfo.innerHTML = `
        <span class="kg-badge-guest">Mode Pengunjung</span>
        <span class="kg-gardener-name">${displayName}</span>
      `;
    }
  }

  // ---------------------------------------------------------------------------
  // 1. STATE INITIALIZATION & HYDRATION
  // ---------------------------------------------------------------------------
  function hydrateState(charKey = 'nyanya') {
    activeCharKey = charKey;
    gazeboState = loadKidultGazeboState(charKey);

    renderGardenerBadge(charKey);

    if (gazeboState.currentTea && KIDULT_TEAS[gazeboState.currentTea]) {
      currentSelectedTea = KIDULT_TEAS[gazeboState.currentTea];
    }

    // Apply lighting
    applyLighting(gazeboState.currentLight || 'golden');

    // Update bottom tea text
    updateBottomTeaIndicator();

    // Update quote
    if (quoteBadgeText) {
      quoteBadgeText.textContent = NYANYA_HERO_QUOTE;
    }
  }

  function updateBottomTeaIndicator() {
    if (tableTeaText) {
      tableTeaText.textContent = `${currentSelectedTea.name} · Siap Diseduh ⭐`;
    }
    if (steamEffect && steamEffect.style && typeof steamEffect.style.setProperty === 'function') {
      steamEffect.style.setProperty('--steam-color', currentSelectedTea.steamColor || 'rgba(216, 180, 254, 0.65)');
    }
  }

  function applyLighting(lightId) {
    if (!lightingOverlay) return;
    const light = KIDULT_GAZEBO_LIGHTS[lightId] || KIDULT_GAZEBO_LIGHTS.golden;
    lightingOverlay.className = `kgazebo-lighting-overlay ${light.class}`;
    if (gazeboState) {
      gazeboState.currentLight = lightId;
      saveKidultGazeboState(gazeboState, activeCharKey);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. AUDIO & MUSIC PLAYER CONTROLS
  // ---------------------------------------------------------------------------
  function toggleMusic() {
    audioEngine.initAudioContext();
    if (isMusicPlaying) {
      audioEngine.stopMusicBox();
      isMusicPlaying = false;
    } else {
      audioEngine.startMusicBox();
      isMusicPlaying = true;
    }
    updateMusicUI();
  }

  function toggleMusicMute() {
    isMusicMuted = !isMusicMuted;
    if (isMusicMuted) {
      audioEngine.setVolume(0);
    } else {
      audioEngine.setVolume(musicVolume);
    }
    updateMusicUI();
  }

  function setMusicVolume(vol) {
    musicVolume = Math.max(0, Math.min(1, vol));
    if (!isMusicMuted) {
      audioEngine.setVolume(musicVolume);
    }
  }

  function updateMusicUI() {
    if (btnMusicToggle) {
      btnMusicToggle.innerHTML = isMusicPlaying ? '⏸' : '▶';
      btnMusicToggle.title = isMusicPlaying ? 'Jeda Musik Box' : 'Putar Musik Box Lullaby';
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
    if (trackTitleEl) {
      trackTitleEl.textContent = isMusicPlaying ? '♫ Fairytale Lullaby (Playing)' : 'Fairytale Lullaby';
    }
  }

  // ---------------------------------------------------------------------------
  // 3. ACTIVITY MODALS CONTROLLER
  // ---------------------------------------------------------------------------
  function openActivityModal(key) {
    activeActivity = key;
    if (!modalBackdrop || !modalBody) return;

    if (key === 'tea') {
      renderTeaModal();
    } else if (key === 'library') {
      renderLibraryModal();
    } else if (key === 'journal') {
      renderJournalModal('list');
    } else if (key === 'quiet') {
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

  // ===========================================================================
  // 3A. TEA TIME MODAL
  // ===========================================================================
  function renderTeaModal() {
    modalHeaderIcon.textContent = '🫖';
    modalHeaderTitle.textContent = 'Tea Time di Memory Garden';
    modalHeaderSub.textContent = 'Pilih racikan teh herbal hangat dan camilan manis untuk bersantai di gazebo';

    modalBody.innerHTML = `
      <div class="tea-selection-grid">
        ${Object.values(KIDULT_TEAS).map(tea => `
          <div class="tea-option-card ${currentSelectedTea.id === tea.id ? 'selected' : ''}" data-tea-id="${tea.id}">
            <div class="tea-option-icon">${tea.icon}</div>
            <h4>${tea.name}</h4>
            <p>${tea.desc}</p>
          </div>
        `).join('')}
      </div>

      <div class="tea-serving-display">
        <div class="tea-cup-visual" id="tea-serving-cup">
          ${currentSelectedTea.icon}
        </div>
        <div style="flex: 1;">
          <h4 style="margin: 0; font-size: 1.1rem; color: #ffffff;" id="tea-serving-name">${currentSelectedTea.name}</h4>
          <p style="margin: 0.25rem 0 0 0; font-size: 0.82rem; color: #cbd5e1;" id="tea-serving-desc">${currentSelectedTea.desc}</p>
          <span style="font-size: 0.78rem; color: #fbcfe8; display: block; margin-top: 0.35rem;" id="tea-serving-effect">${currentSelectedTea.effect}</span>
        </div>
      </div>

      <button type="button" class="btn-brew-tea" id="btn-brew-confirm">
        <span>🍵 Seduh Secangkir ${currentSelectedTea.name}</span>
      </button>
    `;

    // Click tea options
    modalBody.querySelectorAll('.tea-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const tId = card.getAttribute('data-tea-id');
        const selected = KIDULT_TEAS[tId];
        if (!selected) return;

        currentSelectedTea = selected;
        modalBody.querySelectorAll('.tea-option-card').forEach(c => c.classList.toggle('selected', c.getAttribute('data-tea-id') === tId));

        const sCup = modalBody.querySelector('#tea-serving-cup');
        const sName = modalBody.querySelector('#tea-serving-name');
        const sDesc = modalBody.querySelector('#tea-serving-desc');
        const sEffect = modalBody.querySelector('#tea-serving-effect');
        const btnBrew = modalBody.querySelector('#btn-brew-confirm');

        if (sCup) sCup.textContent = selected.icon;
        if (sName) sName.textContent = selected.name;
        if (sDesc) sDesc.textContent = selected.desc;
        if (sEffect) sEffect.textContent = selected.effect;
        if (btnBrew) btnBrew.innerHTML = `<span>🍵 Seduh Secangkir ${selected.name}</span>`;
      });
    });

    // Brew confirm
    modalBody.querySelector('#btn-brew-confirm')?.addEventListener('click', () => {
      gazeboState.currentTea = currentSelectedTea.id;
      gazeboState.teaBrewCount = (gazeboState.teaBrewCount || 0) + 1;
      saveKidultGazeboState(gazeboState, activeCharKey);

      // Persist in universe state if applicable
      updateElementState('gazebo', {
        teaReady: true,
        teaType: currentSelectedTea.name,
        selectedTea: currentSelectedTea.id,
        lastBrewed: Date.now()
      });

      updateBottomTeaIndicator();
      closeActivityModal();

      if (onShowToast) {
        onShowToast(`🍵 Secangkir ${currentSelectedTea.name} hangat telah tersaji di meja gazebo. Selamat menikmati! ⭐`);
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      }
    });
  }

  // ===========================================================================
  // 3B. PERPUSTAKAAN KECIL (STORY READER)
  // ===========================================================================
  function renderLibraryModal() {
    modalHeaderIcon.textContent = '📖';
    modalHeaderTitle.textContent = 'Perpustakaan Kecil Nyanya';
    modalHeaderSub.textContent = 'Koleksi dongeng dan karya cerita yang tersimpan di rak buku Gazebo';

    const nyanyaStories = getAuthorStories('nyanya') || [];
    const publishedStories = getPublishedStories() || [];

    // Merge without duplicates
    const allStories = [...nyanyaStories];
    publishedStories.forEach(ps => {
      if (!allStories.some(s => s.id === ps.id)) {
        allStories.push(ps);
      }
    });

    if (allStories.length === 0) {
      modalBody.innerHTML = `
        <div class="sws-empty-box" style="padding: 2.5rem 1rem;">
          <div style="font-size: 3rem;">📚</div>
          <h3>Rak Buku Masih Menanti Cerita Pertamamu</h3>
          <p>Belum ada karya cerita yang tersimpan. Tulis dongeng indahmu di Story Studio dan buku tersebut akan otomatis terpajang rapi di rak ini!</p>
          <button type="button" class="btn-brew-tea" id="btn-goto-story-studio" style="max-width: 280px; margin: 0 auto;">
            <span>✍️ Buka Story Studio</span>
          </button>
        </div>
      `;

      modalBody.querySelector('#btn-goto-story-studio')?.addEventListener('click', () => {
        closeActivityModal();
        closeKidultGazebo();
        if (typeof onNavigateStoryWorkspace === 'function') {
          onNavigateStoryWorkspace('view-kidult-world', 'editor');
        } else if (onShowToast) {
          onShowToast('Membuka Story Studio...');
        }
      });
      return;
    }

    const readingProgressMap = gazeboState?.readingProgress || {};

    modalBody.innerHTML = `
      <div class="library-books-grid">
        ${allStories.map(story => {
          const prog = readingProgressMap[story.id] || getReadingProgress(story.id, activeCharKey) || { percent: 0, page: 1 };
          const percent = prog.percent || 0;
          return `
            <div class="library-book-card" data-story-id="${story.id}">
              <div class="book-card-header">
                <span class="book-category-pill">${(story.category || 'Dongeng').toUpperCase()}</span>
                <span style="font-size: 0.75rem; color: #94a3b8;">${story.wordCount || 0} kata</span>
              </div>
              <h4>${escapeHtml(story.title || 'Cerita Tanpa Judul')}</h4>
              <p>${escapeHtml(story.synopsis || story.subtitle || 'Belum ada sinopsis singkat.')}</p>

              <div class="book-progress-bar-wrap">
                <div class="progress-track">
                  <div class="progress-fill" style="width: ${percent}%;"></div>
                </div>
                <div class="progress-label-text">
                  <span>${percent > 0 ? `Progres: ${percent}%` : 'Belum dibaca'}</span>
                  <span style="color: #fbcfe8; font-weight: 600;">Buka ➔</span>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modalBody.querySelectorAll('.library-book-card').forEach(card => {
      card.addEventListener('click', () => {
        const sId = card.getAttribute('data-story-id');
        const st = allStories.find(s => s.id === sId);
        if (st) openReaderView(st);
      });
    });
  }

  function openReaderView(story) {
    activeReadingStory = story;

    const rawContent = story.content || 'Buku ini masih belum memiliki isi cerita.';
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

    const readingProgressMap = gazeboState?.readingProgress || {};
    const saved = readingProgressMap[story.id] || getReadingProgress(story.id, activeCharKey) || {};
    currentReaderPage = Math.min(totalReaderPages, Math.max(1, saved.page || 1));

    modalHeaderIcon.textContent = '📖';
    modalHeaderTitle.textContent = story.title || 'Membaca Buku';
    modalHeaderSub.textContent = `Halaman ${currentReaderPage} dari ${totalReaderPages}`;

    function renderPage() {
      const pageText = pages[currentReaderPage - 1] || '';
      const percent = Math.round((currentReaderPage / totalReaderPages) * 100);

      // Save progress
      if (!gazeboState.readingProgress) gazeboState.readingProgress = {};
      gazeboState.readingProgress[story.id] = {
        page: currentReaderPage,
        totalPages: totalReaderPages,
        percent,
        lastRead: Date.now()
      };
      saveKidultGazeboState(gazeboState, activeCharKey);
      saveReadingProgress(story.id, percent, currentReaderPage / totalReaderPages, activeCharKey);

      modalHeaderSub.textContent = `Halaman ${currentReaderPage} dari ${totalReaderPages} (${percent}%)`;

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

  // ===========================================================================
  // 3C. JURNAL MALAM (KIDULT PHILOSOPHY)
  // ===========================================================================
  function renderJournalModal(subTab = 'list') {
    modalHeaderIcon.textContent = '📜';
    modalHeaderTitle.textContent = 'Jurnal Malam — The Everdream Journal';
    modalHeaderSub.textContent = 'Menemukan kembali sisi kecil dalam diri, merayakan pertumbuhan, dan memeluk diri sendiri';

    const journals = gazeboState?.journals || [];

    if (subTab === 'write') {
      renderJournalComposer();
      return;
    }

    modalBody.innerHTML = `
      <div class="journal-tabs-row">
        <button type="button" class="journal-tab-btn active" id="tab-journal-list">📜 Catatan Jurnal (${journals.length})</button>
        <button type="button" class="journal-tab-btn" id="tab-journal-write">✍️ Tulis Jurnal Baru</button>
      </div>

      <div class="journal-entries-list">
        ${journals.length === 0 ? `
          <div class="sws-empty-box" style="padding: 2.5rem 1rem;">
            <div style="font-size: 2.5rem;">⭐</div>
            <h3>Jurnalmu Masih Terbuka Bersih</h3>
            <p>Tulis renungan, harapan masa kecil, atau perasaan hangatmu malam ini.</p>
            <button type="button" class="btn-brew-tea" id="btn-first-journal-write" style="max-width: 240px; margin: 0 auto;">
              <span>✍️ Tulis Catatan Pertama</span>
            </button>
          </div>
        ` : journals.map(j => {
          const moodObj = KIDULT_JOURNAL_MOODS.find(m => m.id === j.mood) || KIDULT_JOURNAL_MOODS[0];
          return `
            <div class="journal-entry-card" data-journal-id="${j.id}">
              <div class="journal-card-top">
                <h4>${escapeHtml(j.title || 'Renungan Malam')}</h4>
                <span class="journal-card-date">${j.date || 'Malam ini'} · ${moodObj.label}</span>
              </div>
              <p class="journal-card-snippet">${escapeHtml(j.content || '')}</p>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modalBody.querySelector('#tab-journal-write')?.addEventListener('click', () => renderJournalModal('write'));
    modalBody.querySelector('#btn-first-journal-write')?.addEventListener('click', () => renderJournalModal('write'));

    modalBody.querySelectorAll('.journal-entry-card').forEach(card => {
      card.addEventListener('click', () => {
        const jId = card.getAttribute('data-journal-id');
        const entry = journals.find(j => j.id === jId);
        if (entry) renderJournalDetail(entry);
      });
    });
  }

  function renderJournalComposer() {
    let selectedMood = 'inner_child';

    modalBody.innerHTML = `
      <div class="journal-tabs-row">
        <button type="button" class="journal-tab-btn" id="tab-journal-back">← Kembali ke Daftar</button>
        <button type="button" class="journal-tab-btn active">✍️ Tulis Jurnal Baru</button>
      </div>

      <div class="journal-form">
        <input type="text" class="journal-input-title" id="journal-input-title"
          placeholder="Judul renungan malam ini (contoh: Memeluk Diri Sendiri yang Sedang Belajar Dewasa)" maxlength="100">

        <div class="journal-mood-selector">
          <span style="font-size: 0.8rem; color: #cbd5e1; font-weight: 600;">Filosofi Rasa:</span>
          ${KIDULT_JOURNAL_MOODS.map(m => `
            <button type="button" class="journal-mood-pill ${selectedMood === m.id ? 'selected' : ''}" data-mood="${m.id}" title="${m.desc}">
              ${m.label}
            </button>
          `).join('')}
        </div>

        <textarea class="journal-textarea-body" id="journal-input-body"
          placeholder="Tuliskan renungan, kenangan masa kecil, atau penerimaan diri malam ini di bawah naungan Gazebo..."></textarea>

        <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
          <button type="button" class="btn-reader-back" id="btn-journal-cancel">Batal</button>
          <button type="button" class="btn-brew-tea" id="btn-journal-save" style="margin: 0; width: auto; padding: 0.65rem 1.4rem;">
            <span>💾 Simpan ke Jurnal Malam</span>
          </button>
        </div>
      </div>
    `;

    modalBody.querySelector('#tab-journal-back')?.addEventListener('click', () => renderJournalModal('list'));
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
        id: `kjournal-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title || 'Renungan Bintang',
        content,
        mood: selectedMood,
        date: dateStr,
        createdAt: Date.now()
      };

      if (!gazeboState.journals) gazeboState.journals = [];
      gazeboState.journals.unshift(newEntry);
      saveKidultGazeboState(gazeboState, activeCharKey);

      // Also persist to universe_states
      updateElementState('gazebo', { journals: gazeboState.journals });

      if (onShowToast) onShowToast('📜 Catatan malammu berhasil disimpan ke dalam Jurnal Gazebo!');
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);

      renderJournalModal('list');
    });
  }

  function renderJournalDetail(entry) {
    const moodObj = KIDULT_JOURNAL_MOODS.find(m => m.id === entry.mood) || KIDULT_JOURNAL_MOODS[0];

    modalBody.innerHTML = `
      <div class="journal-tabs-row">
        <button type="button" class="journal-tab-btn active" id="tab-journal-back">← Kembali ke Daftar Jurnal</button>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.95rem;">
        <div style="border-bottom: 1px solid rgba(251, 207, 232, 0.25); padding-bottom: 0.75rem;">
          <h3 style="margin: 0; font-size: 1.35rem; color: #ffffff;">${escapeHtml(entry.title)}</h3>
          <span style="font-size: 0.8rem; color: #fbcfe8;">Ditulis pada ${entry.date} · ${moodObj.label} (${moodObj.desc})</span>
        </div>

        <div class="reader-content-sheet" style="font-family: inherit; font-size: 1rem; line-height: 1.8;">
          ${escapeHtml(entry.content)}
        </div>

        <div style="display: flex; justify-content: flex-end; padding-top: 0.5rem;">
          <button type="button" class="btn-reader-back" id="btn-delete-journal" style="color: #f43f5e; border-color: rgba(244, 63, 94, 0.4);">
            🗑️ Hapus Catatan Ini
          </button>
        </div>
      </div>
    `;

    modalBody.querySelector('#tab-journal-back')?.addEventListener('click', () => renderJournalModal('list'));

    modalBody.querySelector('#btn-delete-journal')?.addEventListener('click', () => {
      if (window.confirm('Hapus catatan jurnal ini?')) {
        gazeboState.journals = (gazeboState.journals || []).filter(j => j.id !== entry.id);
        saveKidultGazeboState(gazeboState, activeCharKey);
        updateElementState('gazebo', { journals: gazeboState.journals });

        if (onShowToast) onShowToast('🗑️ Catatan jurnal berhasil dihapus.');
        renderJournalModal('list');
      }
    });
  }

  // ===========================================================================
  // 3D. QUIET MOMENT MODAL
  // ===========================================================================
  function renderQuietModal() {
    modalHeaderIcon.textContent = '🔮';
    modalHeaderTitle.textContent = 'Quiet Moment di Gazebo Nyanya';
    modalHeaderSub.textContent = 'Dengarkan suara alam wisteria & nikmati ketenangan langit twilight';

    const currentAmb = audioEngine.getCurrentAmbient();

    modalBody.innerHTML = `
      <div class="ambient-options-grid">
        ${KIDULT_AMBIENT_OPTIONS.map(opt => `
          <div class="ambient-sound-card ${currentAmb === opt.id ? 'active' : ''}" data-sound-id="${opt.id}">
            <div class="sound-card-icon">${opt.icon}</div>
            <h4>${opt.title}</h4>
            <p>${opt.desc}</p>
          </div>
        `).join('')}
      </div>

      <div class="ambient-controls-bar">
        <div class="ambient-active-name">
          ${currentAmb !== 'none'
            ? `🔊 Sedang diputar: ${KIDULT_AMBIENT_OPTIONS.find(o => o.id === currentAmb)?.title || currentAmb}`
            : '⏸ Tidak ada suara alam yang aktif'}
        </div>

        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button type="button" class="btn-kgazebo-music-toggle" id="btn-ambient-toggle" title="Hentikan / Putar Suara Alam">
            ${currentAmb !== 'none' ? '⏹' : '▶'}
          </button>
        </div>
      </div>
    `;

    modalBody.querySelectorAll('.ambient-sound-card').forEach(card => {
      card.addEventListener('click', () => {
        const soundId = card.getAttribute('data-sound-id');
        audioEngine.initAudioContext();

        if (audioEngine.getCurrentAmbient() === soundId) {
          audioEngine.stopAmbient();
        } else {
          audioEngine.startAmbient(soundId);
        }
        renderQuietModal();
      });
    });

    modalBody.querySelector('#btn-ambient-toggle')?.addEventListener('click', () => {
      if (audioEngine.getCurrentAmbient() !== 'none') {
        audioEngine.stopAmbient();
      } else {
        audioEngine.startAmbient('breeze');
      }
      renderQuietModal();
    });
  }

  // ---------------------------------------------------------------------------
  // 4. INTERIOR HOTSPOT INTERACTIONS
  // ---------------------------------------------------------------------------
  function initInteriorHotspots() {
    if (hotspotPuppy) {
      hotspotPuppy.addEventListener('click', () => {
        const randomMsg = PUPPY_INTERACTIONS[Math.floor(Math.random() * PUPPY_INTERACTIONS.length)];
        if (onShowToast) onShowToast(randomMsg);
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth * 0.2, window.innerHeight * 0.8);
      });
    }

    if (hotspotLanterns) {
      hotspotLanterns.addEventListener('click', () => {
        const lightKeys = Object.keys(KIDULT_GAZEBO_LIGHTS);
        const currentIdx = lightKeys.indexOf(gazeboState.currentLight || 'golden');
        const nextLight = lightKeys[(currentIdx + 1) % lightKeys.length];
        applyLighting(nextLight);

        if (onShowToast) {
          onShowToast(`🕯️ Suasana lentera diubah ke: ${KIDULT_GAZEBO_LIGHTS[nextLight].name}`);
        }
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. LIFECYCLE & NAVIGATION
  // ---------------------------------------------------------------------------
  function openKidultGazebo(charKey = 'nyanya') {
    viewGazebo.classList.add('active');
    viewGazebo.setAttribute('aria-hidden', 'false');

    hydrateState(charKey);
    updateMusicUI();

    if (onShowToast) {
      onShowToast(charKey === 'nyanya'
        ? '🏛 Selamat datang di Gazebo Nyanya — Memory Garden Sanctuary ⭐'
        : `🏛 Selamat datang di Gazebo Nyanya, ${CHARACTER_NAMES[charKey] || charKey}! Nikmati ketenangan dan teh hangat ♡`);
    }

    if (onTriggerSparkle) {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  function closeKidultGazebo() {
    closeActivityModal();
    audioEngine.stopMusicBox();
    audioEngine.stopAmbient();
    isMusicPlaying = false;
    updateMusicUI();

    viewGazebo.classList.remove('active');
    viewGazebo.setAttribute('aria-hidden', 'true');

    if (typeof onNavigateBack === 'function') {
      onNavigateBack();
    } else {
      const kidultWorld = document.getElementById('view-kidult-world');
      if (kidultWorld) {
        kidultWorld.classList.add('active');
        kidultWorld.setAttribute('aria-hidden', 'false');
      }
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

  // ---------------------------------------------------------------------------
  // 6. EVENT LISTENERS SETUP
  // ---------------------------------------------------------------------------
  if (btnGazeboBack) {
    btnGazeboBack.addEventListener('click', closeKidultGazebo);
  }

  // Music controls
  if (btnMusicToggle) {
    btnMusicToggle.addEventListener('click', toggleMusic);
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

  // 4 Activity Cards
  if (cardTea) {
    cardTea.addEventListener('click', () => openActivityModal('tea'));
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

  // Bottom Bar Quick Actions (Tea Time & Songs We Share)
  if (btnQuickTea) {
    btnQuickTea.addEventListener('click', () => openActivityModal('tea'));
  }

  // Songs We Share Quick Access Button
  if (btnSongsWeShare) {
    btnSongsWeShare.addEventListener('click', () => {
      openSongsWeShareModal({
        activeChar: activeCharKey,
        onShowToast,
        onTriggerSparkle
      });
    });
  }

  // Modal Close
  if (btnModalClose) {
    btnModalClose.addEventListener('click', closeActivityModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeActivityModal();
    });
  }

  initInteriorHotspots();

  // Listen for external universe state updates
  onUniverseStateChange(() => {
    hydrateState(activeCharKey);
  });

  // Return Public API
  return {
    openKidultGazebo,
    closeKidultGazebo,
    openActivityModal,
    toggleMusic,
    setMusicVolume,
    refreshGazebo: () => hydrateState(activeCharKey)
  };
}
