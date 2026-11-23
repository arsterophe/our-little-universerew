/**
 * TO YOU — EVERGLOW MORNING GAZEBO CONTROLLER
 * Lala's Fairy Forest Rotunda Gazebo Sanctuary
 * =============================================================================
 * Implements:
 * 1. Top Bar with Brand Title, Hero Quote, and Music Player (Zero Autoplay)
 * 2. Four Central Activity Cards:
 *    - 🫖 Tea Time: Warm floral teas, sweet treats & table serving display
 *    - 📖 Perpustakaan Kecil: Stories reading integrated with Our Stories, pagination & progress tracking
 *    - 📜 Jurnal Kenangan: Personal journal reflecting TO YOU philosophy (warmth, caring, serenity, self-love)
 *    - 🔮 Quiet Moment: 4 procedural ambient soundscapes with volume slider
 * 3. Bottom Action Dock (Pojok Kiri Bawah):
 *    - Quick action: Circular Tea Time button
 *    - Quick action: Circular "🎵 Songs We Share" button
 * 4. Interior Touch Interactivity:
 *    - Petting the sleeping white cat on the sofa 🐾
 *    - Strumming the acoustic guitar on the right 🎸
 *    - Cycling lantern atmospheres 🕯️
 * 5. Full equal access with isolated storage for Lala
 */

import {
  TOYOU_TEAS,
  TOYOU_TREATS,
  TOYOU_GAZEBO_LIGHTS,
  TOYOU_JOURNAL_MOODS,
  TOYOU_AMBIENT_OPTIONS,
  LALA_HERO_QUOTE,
  LALA_GAZEBO_DIALOGS,
  CAT_INTERACTIONS,
  GUITAR_INTERACTIONS,
  createDefaultToyouGazeboState,
  loadToyouGazeboState,
  saveToyouGazeboState,
  createToyouGazeboAudioEngine,
  LALA_CANONICAL_UID
} from './toyou_gazebo_state.js';

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

export function initToyouGazeboView(options = {}) {
  const {
    onShowToast,
    onTriggerSparkle,
    onNavigateBack,
    onNavigateStoryWorkspace
  } = options;

  const viewGazebo = document.getElementById('view-toyou-gazebo');
  if (!viewGazebo) return null;

  // Top Bar Elements
  const btnGazeboBack = document.getElementById('btn-tgazebo-back');
  const gardenerInfo = document.getElementById('tgazebo-gardener-info');
  const btnMusicToggle = document.getElementById('btn-tgazebo-music-toggle');
  const btnMusicMute = document.getElementById('btn-tgazebo-music-mute');
  const sliderMusicVol = document.getElementById('slider-tgazebo-music-vol');
  const musicNoteIcon = document.getElementById('tgazebo-music-icon');
  const trackTitleEl = document.getElementById('tgazebo-track-title');

  // Four Main Activity Cards
  const cardTea = document.getElementById('tgazebo-card-tea');
  const cardLibrary = document.getElementById('tgazebo-card-library');
  const cardJournal = document.getElementById('tgazebo-card-journal');
  const cardQuiet = document.getElementById('tgazebo-card-quiet');

  // Bottom Action Dock
  const btnSongsWeShare = document.getElementById('btn-tgazebo-songs-we-share');
  const btnQuickTea = document.getElementById('btn-tgazebo-quick-tea');

  // Modals
  const modalBackdrop = document.getElementById('tgazebo-modal-backdrop');
  const btnModalClose = document.getElementById('btn-tgazebo-modal-close');
  const modalHeaderIcon = document.getElementById('tgazebo-modal-header-icon');
  const modalHeaderTitle = document.getElementById('tgazebo-modal-header-title');
  const modalHeaderSub = document.getElementById('tgazebo-modal-header-sub');
  const modalBody = document.getElementById('tgazebo-modal-body');

  // Scene Interior Hotspots & Layers
  const lightingOverlay = document.getElementById('tgazebo-lighting-overlay');
  const hotspotCat = document.getElementById('hotspot-tg-cat');
  const hotspotGuitar = document.getElementById('hotspot-tg-guitar');
  const hotspotLanterns = document.getElementById('hotspot-tg-lanterns');
  const steamEffect = document.getElementById('tg-steam-effect');

  // State Management
  let activeCharKey = 'lala';
  let gazeboState = null;
  let activeActivity = null; // 'tea' | 'library' | 'journal' | 'quiet'
  let currentSelectedTea = TOYOU_TEAS.rose_honey;

  // Audio Engine
  const audioEngine = createToyouGazeboAudioEngine();
  let isMusicPlaying = false;
  let isMuted = false;
  let currentVol = 0.7;

  // Library / Reader State
  let allPublishedStories = [];
  let activeReadingStory = null;
  let currentReadingPage = 1;
  let currentStoryPages = [];
  let readerFontSize = 1.05; // rem

  // ---------------------------------------------------------------------------
  // 1. OPEN & CLOSE CONTROLLER LIFECYCLE
  // ---------------------------------------------------------------------------

  function openToyouGazebo(charKey = 'lala') {
    activeCharKey = charKey || 'lala';
    gazeboState = loadToyouGazeboState(activeCharKey);

    if (viewGazebo) {
      viewGazebo.classList.add('active');
      viewGazebo.setAttribute('aria-hidden', 'false');
    }

    // Apply lighting atmosphere
    applyLightingOverlay(gazeboState.currentLight || 'morning_sun');

    // Update active gardener / host badge
    renderGardenerInfo();

    // Setup active tea
    currentSelectedTea = TOYOU_TEAS[gazeboState.currentTea] || TOYOU_TEAS.rose_honey;

    // Trigger opening sparkle & toast
    if (typeof onTriggerSparkle === 'function') {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
    if (typeof onShowToast === 'function') {
      onShowToast('🏛 Selamat datang di Gazebo Lala — Everglow Morning Sanctuary 🌸');
    }
  }

  function closeToyouGazebo() {
    closeGazeboModal();
    audioEngine.stopMorningMelody();
    audioEngine.stopAmbientSoundscapes();
    isMusicPlaying = false;
    updateMusicButtonState();

    if (viewGazebo) {
      viewGazebo.classList.remove('active');
      viewGazebo.setAttribute('aria-hidden', 'true');
    }

    if (typeof onNavigateBack === 'function') {
      onNavigateBack();
    }
  }

  function renderGardenerInfo() {
    if (!gardenerInfo) return;
    const isOwner = (activeCharKey === 'lala');
    gardenerInfo.innerHTML = `
      <div class="tgazebo-gardener-badge">
        <span class="tg-badge-dot"></span>
        <span class="tg-badge-name">${isOwner ? 'Lala · Tuan Rumah ☼' : `${activeCharKey.toUpperCase()} · Pengunjung`}</span>
      </div>
    `;
  }

  function applyLightingOverlay(lightId) {
    const light = TOYOU_GAZEBO_LIGHTS[lightId] || TOYOU_GAZEBO_LIGHTS.morning_sun;
    if (lightingOverlay) {
      lightingOverlay.className = `tgazebo-lighting-overlay ${light.class}`;
    }
    gazeboState.currentLight = light.id;
    saveToyouGazeboState(gazeboState, activeCharKey);
  }

  // ---------------------------------------------------------------------------
  // 2. MUSIC PLAYER (ZERO AUTOPLAY)
  // ---------------------------------------------------------------------------

  function toggleMusic() {
    if (isMusicPlaying) {
      audioEngine.stopMorningMelody();
      isMusicPlaying = false;
      if (typeof onShowToast === 'function') onShowToast('⏸ Musik Gazebo dijeda');
    } else {
      audioEngine.startMorningMelody(() => {
        if (musicNoteIcon) {
          musicNoteIcon.classList.add('pulse');
          setTimeout(() => musicNoteIcon.classList.remove('pulse'), 300);
        }
      });
      isMusicPlaying = true;
      if (typeof onShowToast === 'function') onShowToast('▶ Memutar Fairy Morning Lullaby 🎵');
    }
    updateMusicButtonState();
  }

  function updateMusicButtonState() {
    if (btnMusicToggle) {
      btnMusicToggle.textContent = isMusicPlaying ? '⏸' : '▶';
      btnMusicToggle.classList.toggle('playing', isMusicPlaying);
    }
    if (musicNoteIcon) {
      musicNoteIcon.classList.toggle('playing', isMusicPlaying);
    }
  }

  function toggleMute() {
    isMuted = !isMuted;
    audioEngine.setMasterVolume(isMuted ? 0 : currentVol);
    if (btnMusicMute) {
      btnMusicMute.textContent = isMuted ? '🔇' : '🔊';
    }
  }

  function handleVolumeChange(e) {
    currentVol = parseFloat(e.target.value) / 100;
    if (!isMuted) {
      audioEngine.setMasterVolume(currentVol);
    }
  }

  // ---------------------------------------------------------------------------
  // 3. MODAL DIALOG CONTROLLER
  // ---------------------------------------------------------------------------

  function openGazeboModal(activityKey) {
    activeActivity = activityKey;
    if (!modalBackdrop) return;

    modalBackdrop.classList.add('open');
    modalBackdrop.setAttribute('aria-hidden', 'false');

    if (activityKey === 'tea') renderTeaModal();
    else if (activityKey === 'library') renderLibraryModal();
    else if (activityKey === 'journal') renderJournalModal();
    else if (activityKey === 'quiet') renderQuietModal();
  }

  function closeGazeboModal() {
    activeActivity = null;
    activeReadingStory = null;
    if (modalBackdrop) {
      modalBackdrop.classList.remove('open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // ---------------------------------------------------------------------------
  // 4. ACTIVITY 1: TEA TIME
  // ---------------------------------------------------------------------------

  function renderTeaModal() {
    if (modalHeaderIcon) modalHeaderIcon.textContent = '🫖';
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Tea Time di Gazebo Pagi';
    if (modalHeaderSub) modalHeaderSub.textContent = 'Nikmati seduhan teh kelopak bunga & camilan manis di teras peri';

    const teasList = Object.values(TOYOU_TEAS);
    const treatsList = Object.values(TOYOU_TREATS);

    const activeTea = currentSelectedTea || TOYOU_TEAS.rose_honey;
    const currentTreat = TOYOU_TREATS[gazeboState.currentTreat] || TOYOU_TREATS.butterfly_cupcake;

    modalBody.innerHTML = `
      <div class="tgazebo-tea-layout">
        <!-- Left: Tea Menu & Selector -->
        <div class="tgazebo-tea-selection-col">
          <h3 class="tg-section-heading">Pilihan Seduhan Teh Peri 🍵</h3>
          <div class="tg-tea-grid">
            ${teasList.map(tea => `
              <div class="tg-tea-card ${tea.id === activeTea.id ? 'selected' : ''}" data-tea-id="${tea.id}" role="button" tabindex="0">
                <span class="tg-tea-icon">${tea.icon}</span>
                <div class="tg-tea-meta">
                  <h4>${tea.name}</h4>
                  <p class="tg-tea-aroma">${tea.aroma}</p>
                </div>
              </div>
            `).join('')}
          </div>

          <h3 class="tg-section-heading" style="margin-top: 18px;">Camilan Manis Pendamping 🧁</h3>
          <div class="tg-treat-grid">
            ${treatsList.map(treat => `
              <div class="tg-treat-card ${treat.id === currentTreat.id ? 'selected' : ''}" data-treat-id="${treat.id}" role="button" tabindex="0">
                <span class="tg-treat-icon">${treat.icon}</span>
                <div class="tg-treat-meta">
                  <h4>${treat.name}</h4>
                  <p>${treat.desc}</p>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Right: Steaming Teapot & Table Service -->
        <div class="tgazebo-tea-display-col">
          <div class="tg-tea-pot-stage" style="border-color: ${activeTea.color};">
            <div class="tg-tea-pot-icon">🫖</div>
            <div class="tg-steam-cloud" style="background: radial-gradient(circle, ${activeTea.steamColor} 0%, transparent 70%);"></div>
            <div class="tg-tea-cup-icon">☕</div>
          </div>

          <div class="tg-active-tea-card">
            <h4 style="color: ${activeTea.color};">${activeTea.name}</h4>
            <p class="tg-tea-full-desc">${activeTea.desc}</p>
            <div class="tg-tea-effect-badge">${activeTea.effect}</div>
          </div>

          <button type="button" class="btn-tg-brew-tea" id="btn-tg-brew-tea">
            ✨ Seduh &amp; Sajikan di Meja Gazebo
          </button>
        </div>
      </div>
    `;

    // Bind Tea card selection
    modalBody.querySelectorAll('.tg-tea-card').forEach(card => {
      card.addEventListener('click', () => {
        const teaId = card.getAttribute('data-tea-id');
        currentSelectedTea = TOYOU_TEAS[teaId] || TOYOU_TEAS.rose_honey;
        gazeboState.currentTea = teaId;
        saveToyouGazeboState(gazeboState, activeCharKey);
        renderTeaModal();
      });
    });

    // Bind Treat card selection
    modalBody.querySelectorAll('.tg-treat-card').forEach(card => {
      card.addEventListener('click', () => {
        const treatId = card.getAttribute('data-treat-id');
        gazeboState.currentTreat = treatId;
        saveToyouGazeboState(gazeboState, activeCharKey);
        renderTeaModal();
      });
    });

    // Bind Brew Tea button
    const btnBrew = modalBody.querySelector('#btn-tg-brew-tea');
    if (btnBrew) {
      btnBrew.addEventListener('click', () => {
        gazeboState.teaBrewCount = (gazeboState.teaBrewCount || 0) + 1;
        saveToyouGazeboState(gazeboState, activeCharKey);

        // Update universe state element
        updateElementState('gazebo', {
          teaReady: true,
          teaType: currentSelectedTea.name,
          lastBrewTime: Date.now()
        });

        if (typeof onTriggerSparkle === 'function') {
          onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        }
        if (typeof onShowToast === 'function') {
          onShowToast(`🍵 ${currentSelectedTea.name} berhasil diseduh hangat di meja Gazebo! ✨`);
        }
        closeGazeboModal();
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. ACTIVITY 2: PERPUSTAKAAN KECIL (STORY READING)
  // ---------------------------------------------------------------------------

  async function renderLibraryModal() {
    if (modalHeaderIcon) modalHeaderIcon.textContent = '📖';
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Perpustakaan Kecil Gazebo';
    if (modalHeaderSub) modalHeaderSub.textContent = 'Membaca kisah hangat dan dongeng dari seluruh semesta Our Little Universe';

    modalBody.innerHTML = `<div class="tg-loading-spinner">Memuat buku dongeng dari perpustakaan... 🌸</div>`;

    try {
      allPublishedStories = await getPublishedStories();
    } catch (_) {
      allPublishedStories = [];
    }

    if (activeReadingStory) {
      renderStoryReader(activeReadingStory);
      return;
    }

    if (allPublishedStories.length === 0) {
      modalBody.innerHTML = `
        <div class="tg-empty-state">
          <span style="font-size: 2.2rem;">📚</span>
          <p>Belum ada karya cerita yang dipublikasikan di perpustakaan.</p>
          <button type="button" class="btn-tg-primary" id="btn-tg-go-workspace">Tulis Cerita Pertama di Workspace →</button>
        </div>
      `;
      const btnGo = modalBody.querySelector('#btn-tg-go-workspace');
      if (btnGo && typeof onNavigateStoryWorkspace === 'function') {
        btnGo.onclick = () => {
          closeToyouGazebo();
          onNavigateStoryWorkspace();
        };
      }
      return;
    }

    modalBody.innerHTML = `
      <div class="tg-library-layout">
        <div class="tg-library-header-actions">
          <span>Tersedia <strong>${allPublishedStories.length} karya dongeng</strong> untuk dibaca di gazebo:</span>
          ${typeof onNavigateStoryWorkspace === 'function' ? `
            <button type="button" class="btn-tg-link" id="btn-tg-open-workspace">
              ✍️ Tulis Cerita Baru di Workspace
            </button>
          ` : ''}
        </div>

        <div class="tg-stories-grid">
          ${allPublishedStories.map(story => {
            const savedProgress = getReadingProgress(story.id, activeCharKey);
            const isCompleted = savedProgress?.completed;

            return `
              <div class="tg-story-card" data-story-id="${story.id}">
                <div class="tg-story-card-top">
                  <span class="tg-universe-tag">${story.universe || 'TO YOU'}</span>
                  ${isCompleted ? '<span class="tg-completed-badge">✓ Selesai Dibaca</span>' : ''}
                </div>
                <h4>${story.title || 'Kisah Tanpa Judul'}</h4>
                <p class="tg-story-author">Karya: ${story.authorName || 'Peri Sahabat'}</p>
                <p class="tg-story-snippet">${(story.content || '').substring(0, 100)}...</p>
                <div class="tg-story-card-footer">
                  <button type="button" class="btn-tg-read-story" data-story-id="${story.id}">
                    📖 Baca Cerita Ini
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    modalBody.querySelectorAll('.btn-tg-read-story').forEach(btn => {
      btn.addEventListener('click', () => {
        const storyId = btn.getAttribute('data-story-id');
        const st = allPublishedStories.find(s => s.id === storyId);
        if (st) {
          activeReadingStory = st;
          paginateStory(st.content || '');
          renderStoryReader(st);
        }
      });
    });

    const btnWs = modalBody.querySelector('#btn-tg-open-workspace');
    if (btnWs && typeof onNavigateStoryWorkspace === 'function') {
      btnWs.onclick = () => {
        closeToyouGazebo();
        onNavigateStoryWorkspace();
      };
    }
  }

  function paginateStory(fullText) {
    const charsPerPage = 550;
    currentStoryPages = [];
    if (!fullText.trim()) {
      currentStoryPages = ['(Halaman ini belum memiliki tulisan...)'];
      currentReadingPage = 1;
      return;
    }

    let remaining = fullText;
    while (remaining.length > 0) {
      if (remaining.length <= charsPerPage) {
        currentStoryPages.push(remaining);
        break;
      }
      let splitIdx = remaining.lastIndexOf('\n', charsPerPage);
      if (splitIdx < charsPerPage * 0.6) {
        splitIdx = remaining.lastIndexOf(' ', charsPerPage);
      }
      if (splitIdx === -1 || splitIdx < charsPerPage * 0.5) {
        splitIdx = charsPerPage;
      }
      currentStoryPages.push(remaining.substring(0, splitIdx).trim());
      remaining = remaining.substring(splitIdx).trim();
    }

    const saved = getReadingProgress(activeReadingStory?.id, activeCharKey);
    currentReadingPage = Math.min(saved?.currentPage || 1, currentStoryPages.length);
  }

  function renderStoryReader(story) {
    const totalPages = currentStoryPages.length;
    const pageText = currentStoryPages[currentReadingPage - 1] || '';

    modalBody.innerHTML = `
      <div class="tg-reader-wrap">
        <div class="tg-reader-toolbar">
          <button type="button" class="btn-tg-secondary" id="btn-tg-back-library">← Kembali ke Koleksi</button>
          <div class="tg-reader-font-controls">
            <span style="font-size: 0.78rem; color: #64748b;">Ukuran Teks:</span>
            <button type="button" class="btn-tg-font" id="btn-tg-font-down">A-</button>
            <button type="button" class="btn-tg-font" id="btn-tg-font-reset">100%</button>
            <button type="button" class="btn-tg-font" id="btn-tg-font-up">A+</button>
          </div>
        </div>

        <div class="tg-reader-parchment" style="font-size: ${readerFontSize}rem;">
          <h2 class="tg-reader-title">${story.title}</h2>
          <div class="tg-reader-meta">Ditulis oleh: ${story.authorName || 'Peri'} · Semesta ${story.universe || 'TO YOU'}</div>
          <div class="tg-reader-content">
            <p>${pageText.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>
          </div>
        </div>

        <div class="tg-reader-pagination">
          <button type="button" class="btn-tg-page" id="btn-tg-page-prev" ${currentReadingPage <= 1 ? 'disabled' : ''}>← Halaman Sebelumnya</button>
          <span class="tg-page-counter">Halaman ${currentReadingPage} dari ${totalPages}</span>
          <button type="button" class="btn-tg-page" id="btn-tg-page-next" ${currentReadingPage >= totalPages ? 'disabled' : ''}>Halaman Berikutnya →</button>
        </div>
      </div>
    `;

    // Save reading progress
    saveReadingProgress(story.id, currentReadingPage, activeCharKey, currentReadingPage >= totalPages);

    const btnBackLib = modalBody.querySelector('#btn-tg-back-library');
    if (btnBackLib) {
      btnBackLib.onclick = () => {
        activeReadingStory = null;
        renderLibraryModal();
      };
    }

    const btnPrev = modalBody.querySelector('#btn-tg-page-prev');
    if (btnPrev) {
      btnPrev.onclick = () => {
        if (currentReadingPage > 1) {
          currentReadingPage--;
          renderStoryReader(story);
        }
      };
    }

    const btnNext = modalBody.querySelector('#btn-tg-page-next');
    if (btnNext) {
      btnNext.onclick = () => {
        if (currentReadingPage < totalPages) {
          currentReadingPage++;
          renderStoryReader(story);
        }
      };
    }

    const btnFDown = modalBody.querySelector('#btn-tg-font-down');
    const btnFReset = modalBody.querySelector('#btn-tg-font-reset');
    const btnFUp = modalBody.querySelector('#btn-tg-font-up');

    if (btnFDown) btnFDown.onclick = () => { readerFontSize = Math.max(0.85, readerFontSize - 0.1); renderStoryReader(story); };
    if (btnFReset) btnFReset.onclick = () => { readerFontSize = 1.05; renderStoryReader(story); };
    if (btnFUp) btnFUp.onclick = () => { readerFontSize = Math.min(1.4, readerFontSize + 0.1); renderStoryReader(story); };
  }

  // ---------------------------------------------------------------------------
  // 6. ACTIVITY 3: JURNAL KENANGAN
  // ---------------------------------------------------------------------------

  function renderJournalModal() {
    if (modalHeaderIcon) modalHeaderIcon.textContent = '📜';
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Jurnal Kenangan Gazebo';
    if (modalHeaderSub) modalHeaderSub.textContent = 'Tulis renungan hati, rasa syukur, dan impian indah di bawah naungan wisteria';

    const journals = Array.isArray(gazeboState.journals) ? gazeboState.journals : [];

    modalBody.innerHTML = `
      <div class="tg-journal-layout">
        <div class="tg-journal-top-bar">
          <span style="font-size: 0.88rem; color: #64748b;">Tersimpan <strong>${journals.length} catatan renungan</strong></span>
          <button type="button" class="btn-tg-primary" id="btn-tg-write-journal">✍️ Tulis Catatan Baru</button>
        </div>

        <div class="tg-journal-entries-list">
          ${journals.length === 0 ? `
            <div class="tg-empty-state">
              <span style="font-size: 2rem;">📜</span>
              <p>Belum ada catatan jurnal. Tuliskan renungan pertamamu hari ini!</p>
            </div>
          ` : journals.map((item, idx) => {
            const mood = TOYOU_JOURNAL_MOODS.find(m => m.id === item.mood) || TOYOU_JOURNAL_MOODS[0];
            return `
              <div class="tg-journal-item" data-idx="${idx}">
                <div class="tg-journal-item-header">
                  <span class="tg-mood-pill">${mood.label}</span>
                  <span class="tg-journal-date">${item.date || 'Hari ini'}</span>
                </div>
                <h4>${item.title || 'Renungan Tanpa Judul'}</h4>
                <p class="tg-journal-snippet">${(item.content || '').substring(0, 140)}...</p>
                <div class="tg-journal-item-actions">
                  <button type="button" class="btn-tg-view-journal" data-idx="${idx}">Baca Selengkapnya</button>
                  <button type="button" class="btn-tg-delete-journal" data-idx="${idx}" title="Hapus Catatan">🗑️</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const btnWrite = modalBody.querySelector('#btn-tg-write-journal');
    if (btnWrite) {
      btnWrite.onclick = renderJournalEditor;
    }

    modalBody.querySelectorAll('.btn-tg-view-journal').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        renderJournalDetail(journals[idx]);
      };
    });

    modalBody.querySelectorAll('.btn-tg-delete-journal').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (confirm('Hapus catatan jurnal ini?')) {
          gazeboState.journals.splice(idx, 1);
          saveToyouGazeboState(gazeboState, activeCharKey);
          if (typeof onShowToast === 'function') onShowToast('Catatan jurnal berhasil dihapus.');
          renderJournalModal();
        }
      };
    });
  }

  function renderJournalEditor() {
    modalBody.innerHTML = `
      <div class="tg-journal-editor-wrap">
        <div class="tg-form-group">
          <label class="tg-form-label">Suasana Hati (Mood Renungan):</label>
          <div class="tg-mood-options-grid">
            ${TOYOU_JOURNAL_MOODS.map((m, i) => `
              <label class="tg-mood-radio-label">
                <input type="radio" name="tg-journal-mood" value="${m.id}" ${i === 0 ? 'checked' : ''} />
                <span>${m.label}</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="tg-form-group">
          <label class="tg-form-label" for="tg-input-journal-title">Judul Renungan:</label>
          <input type="text" id="tg-input-journal-title" class="tg-input-text" placeholder="Contoh: Menemukan Hangatnya Mentari Pagi..." />
        </div>

        <div class="tg-form-group">
          <label class="tg-form-label" for="tg-textarea-journal-content">Isi Renungan:</label>
          <textarea id="tg-textarea-journal-content" class="tg-textarea" rows="6" placeholder="Tuliskan apa pun yang sedang kamu rasakan di sini..."></textarea>
        </div>

        <div class="tg-editor-actions">
          <button type="button" class="btn-tg-secondary" id="btn-tg-cancel-journal">Batal</button>
          <button type="button" class="btn-tg-primary" id="btn-tg-save-journal">💾 Simpan Renungan ke Gazebo</button>
        </div>
      </div>
    `;

    const btnCancel = modalBody.querySelector('#btn-tg-cancel-journal');
    if (btnCancel) btnCancel.onclick = renderJournalModal;

    const btnSave = modalBody.querySelector('#btn-tg-save-journal');
    if (btnSave) {
      btnSave.onclick = () => {
        const titleInput = modalBody.querySelector('#tg-input-journal-title');
        const contentInput = modalBody.querySelector('#tg-textarea-journal-content');
        const moodRadio = modalBody.querySelector('input[name="tg-journal-mood"]:checked');

        const title = (titleInput?.value || '').trim() || 'Renungan Pagi Gazebo';
        const content = (contentInput?.value || '').trim();
        const mood = moodRadio?.value || 'sunshine';

        if (!content) {
          alert('Silakan tuliskan renungan terlebih dahulu.');
          return;
        }

        gazeboState.journals = gazeboState.journals || [];
        gazeboState.journals.unshift({
          id: `toyou_journal_${Date.now()}`,
          title,
          mood,
          content,
          date: 'Hari ini',
          createdAt: Date.now()
        });

        saveToyouGazeboState(gazeboState, activeCharKey);
        if (typeof onTriggerSparkle === 'function') onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        if (typeof onShowToast === 'function') onShowToast('📜 Catatan renungan berhasil disimpan di Gazebo Lala! ✨');
        renderJournalModal();
      };
    }
  }

  function renderJournalDetail(entry) {
    if (!entry) return;
    const mood = TOYOU_JOURNAL_MOODS.find(m => m.id === entry.mood) || TOYOU_JOURNAL_MOODS[0];

    modalBody.innerHTML = `
      <div class="tg-journal-detail-wrap">
        <button type="button" class="btn-tg-secondary" id="btn-tg-back-jlist">← Kembali ke Daftar Jurnal</button>
        <div class="tg-journal-parchment">
          <div class="tg-detail-header">
            <span class="tg-mood-pill">${mood.label}</span>
            <span class="tg-journal-date">${entry.date || 'Hari ini'}</span>
          </div>
          <h2>${entry.title}</h2>
          <div class="tg-journal-detail-text">
            <p>${(entry.content || '').replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br/>')}</p>
          </div>
        </div>
      </div>
    `;

    const btnBack = modalBody.querySelector('#btn-tg-back-jlist');
    if (btnBack) btnBack.onclick = renderJournalModal;
  }

  // ---------------------------------------------------------------------------
  // 7. ACTIVITY 4: QUIET MOMENT (AMBIENT SOUNDSCAPES)
  // ---------------------------------------------------------------------------

  function renderQuietModal() {
    if (modalHeaderIcon) modalHeaderIcon.textContent = '🔮';
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Quiet Moment di Gazebo Peri';
    if (modalHeaderSub) modalHeaderSub.textContent = 'Resapi ketenangan alam, semilir angin wisteria, dan gemericik sungai jernih';

    const currentAmbient = audioEngine.getCurrentAmbient();

    modalBody.innerHTML = `
      <div class="tg-quiet-layout">
        <p class="tg-quiet-intro">
          Pilih salah satu suara latar alam yang menenangkan jiwa di bawah ini. Nikmati momen hening tanpa gangguan:
        </p>

        <div class="tg-ambient-cards-grid">
          ${TOYOU_AMBIENT_OPTIONS.map(amb => `
            <div class="tg-ambient-card ${currentAmbient === amb.id ? 'active' : ''}" data-amb-id="${amb.id}" role="button" tabindex="0">
              <span class="tg-ambient-icon">${amb.icon}</span>
              <h4>${amb.title}</h4>
              <p>${amb.desc}</p>
              <span class="tg-ambient-state-pill">${currentAmbient === amb.id ? '🔊 Sedang Berbunyi' : 'Klik untuk Memutar'}</span>
            </div>
          `).join('')}
        </div>

        <div class="tg-quiet-controls-bar">
          <button type="button" class="btn-tg-secondary" id="btn-tg-stop-ambient">
            ⏹ Matikan Suara Alam
          </button>
        </div>
      </div>
    `;

    modalBody.querySelectorAll('.tg-ambient-card').forEach(card => {
      card.addEventListener('click', () => {
        const ambId = card.getAttribute('data-amb-id');
        if (audioEngine.getCurrentAmbient() === ambId) {
          audioEngine.stopAmbientSoundscapes();
          if (typeof onShowToast === 'function') onShowToast('Suara alam dimatikan');
        } else {
          audioEngine.setAmbientSoundscape(ambId, 0.6);
          const amb = TOYOU_AMBIENT_OPTIONS.find(a => a.id === ambId);
          if (typeof onShowToast === 'function') onShowToast(`🔊 Memutar ${amb?.title || 'suara alam'}... 🍃`);
        }
        renderQuietModal();
      });
    });

    const btnStop = modalBody.querySelector('#btn-tg-stop-ambient');
    if (btnStop) {
      btnStop.onclick = () => {
        audioEngine.stopAmbientSoundscapes();
        if (typeof onShowToast === 'function') onShowToast('Suara alam dimatikan');
        renderQuietModal();
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 8. INTERIOR INTERACTIONS (CAT, GUITAR, LANTERNS)
  // ---------------------------------------------------------------------------

  function handlePetCat() {
    gazeboState.catPetCount = (gazeboState.catPetCount || 0) + 1;
    saveToyouGazeboState(gazeboState, activeCharKey);

    const reaction = CAT_INTERACTIONS[Math.floor(Math.random() * CAT_INTERACTIONS.length)];
    if (typeof onTriggerSparkle === 'function') {
      onTriggerSparkle(window.innerWidth * 0.25, window.innerHeight * 0.7);
    }
    if (typeof onShowToast === 'function') {
      onShowToast(`🐾 ${reaction}`);
    }
  }

  function handleStrumGuitar() {
    audioEngine.playGuitarChord();
    const quote = GUITAR_INTERACTIONS[Math.floor(Math.random() * GUITAR_INTERACTIONS.length)];

    if (typeof onTriggerSparkle === 'function') {
      onTriggerSparkle(window.innerWidth * 0.8, window.innerHeight * 0.7);
    }
    if (typeof onShowToast === 'function') {
      onShowToast(`🎸 ${quote}`);
    }
  }

  function handleCycleLanterns() {
    const lights = Object.values(TOYOU_GAZEBO_LIGHTS);
    const currentIdx = lights.findIndex(l => l.id === gazeboState.currentLight);
    const nextIdx = (currentIdx + 1) % lights.length;
    const nextLight = lights[nextIdx];

    applyLightingOverlay(nextLight.id);

    if (typeof onTriggerSparkle === 'function') {
      onTriggerSparkle(window.innerWidth * 0.5, window.innerHeight * 0.25);
    }
    if (typeof onShowToast === 'function') {
      onShowToast(`🕯️ Suasana lentera diganti: ${nextLight.name} (${nextLight.desc}) ✨`);
    }
  }

  // ---------------------------------------------------------------------------
  // 9. EVENT BINDINGS
  // ---------------------------------------------------------------------------

  if (btnGazeboBack) btnGazeboBack.addEventListener('click', closeToyouGazebo);

  // Music Player
  if (btnMusicToggle) btnMusicToggle.addEventListener('click', toggleMusic);
  if (btnMusicMute) btnMusicMute.addEventListener('click', toggleMute);
  if (sliderMusicVol) sliderMusicVol.addEventListener('input', handleVolumeChange);

  // Cards
  if (cardTea) cardTea.addEventListener('click', () => openGazeboModal('tea'));
  if (cardLibrary) cardLibrary.addEventListener('click', () => openGazeboModal('library'));
  if (cardJournal) cardJournal.addEventListener('click', () => openGazeboModal('journal'));
  if (cardQuiet) cardQuiet.addEventListener('click', () => openGazeboModal('quiet'));

  // Quick Action Buttons
  if (btnQuickTea) btnQuickTea.addEventListener('click', () => openGazeboModal('tea'));
  if (btnSongsWeShare) {
    btnSongsWeShare.addEventListener('click', () => {
      openSongsWeShareModal('to_you');
    });
  }

  // Modals
  if (btnModalClose) btnModalClose.addEventListener('click', closeGazeboModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeGazeboModal();
    });
  }

  // Hotspots
  if (hotspotCat) hotspotCat.addEventListener('click', handlePetCat);
  if (hotspotGuitar) hotspotGuitar.addEventListener('click', handleStrumGuitar);
  if (hotspotLanterns) hotspotLanterns.addEventListener('click', handleCycleLanterns);

  return {
    openToyouGazebo,
    closeToyouGazebo,
    openGazeboModal,
    closeGazeboModal
  };
}
