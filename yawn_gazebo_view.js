/**
 * YAWN GAZEBO — VIEW CONTROLLER & INTERACTION ENGINE
 * Astral Ocean & Moonlit Serenity Gazebo for Akhira (YAWN ⚡)
 * =============================================================================
 */

import {
  AKHIRA_CANONICAL_UID,
  AKHIRA_CANONICAL_ID,
  YAWN_TEAS,
  YAWN_TREATS,
  YAWN_GAZEBO_LIGHTS,
  YAWN_CINEMA_TRACKS,
  YAWN_JOURNAL_MOODS,
  YAWN_AMBIENT_OPTIONS,
  AKHIRA_HERO_QUOTE,
  AKHIRA_GAZEBO_DIALOGS,
  CAT_AND_WHALE_INTERACTIONS,
  GAMING_INTERACTIONS,
  TABLE_REFRESHMENTS_INTERACTIONS,
  JELLYFISH_INTERACTIONS,
  loadYawnGazeboState,
  saveYawnGazeboState,
  createYawnGazeboAudioEngine
} from './yawn_gazebo_state.js';

import { getPublishedStories } from './stories.js';

export function initYawnGazeboView(options = {}) {
  const {
    onShowToast,
    onTriggerSparkle,
    onNavigateBack,
    onNavigateStoryWorkspace
  } = options;

  const viewGazebo = document.getElementById('view-yawn-gazebo');
  if (!viewGazebo) return null;

  // DOM Elements
  const btnGazeboBack = document.getElementById('btn-ygazebo-back');
  const lightingOverlay = document.getElementById('ygazebo-lighting-overlay');

  // Music Player in Top Bar
  const btnMusicToggle = document.getElementById('btn-ygazebo-music-toggle');
  const btnMusicMute = document.getElementById('btn-ygazebo-music-mute');
  const sliderMusicVol = document.getElementById('slider-ygazebo-music-vol');
  const trackTitleDisplay = document.getElementById('ygazebo-track-title');
  const musicIconDisplay = document.getElementById('ygazebo-music-icon');

  // Central Cards
  const cardTea = document.getElementById('ygazebo-card-tea');
  const cardCinema = document.getElementById('ygazebo-card-cinema');
  const cardJournal = document.getElementById('ygazebo-card-journal');
  const cardQuiet = document.getElementById('ygazebo-card-quiet');

  // Bottom Quick Action Buttons
  const btnQuickTea = document.getElementById('btn-ygazebo-quick-tea');
  const btnQuickCinema = document.getElementById('btn-ygazebo-quick-cinema');
  const btnSongsWeShare = document.getElementById('btn-ygazebo-songs-we-share');

  // Modal Dialog Elements
  const modalBackdrop = document.getElementById('ygazebo-modal-backdrop');
  const btnModalClose = document.getElementById('btn-ygazebo-modal-close');
  const modalHeaderIcon = document.getElementById('ygazebo-modal-header-icon');
  const modalHeaderTitle = document.getElementById('ygazebo-modal-header-title');
  const modalHeaderSub = document.getElementById('ygazebo-modal-header-sub');
  const modalBody = document.getElementById('ygazebo-modal-body');

  // Hotspots for Direct Stage Interaction
  const hotspotCat = document.getElementById('hotspot-yg-cat');
  const hotspotGamepad = document.getElementById('hotspot-yg-gamepad');
  const hotspotTable = document.getElementById('hotspot-yg-table');
  const hotspotLanterns = document.getElementById('hotspot-yg-lanterns');
  const hotspotScreen = document.getElementById('hotspot-yg-screen');

  // Audio Engine & State
  const audioEngine = createYawnGazeboAudioEngine();
  let activeCharKey = 'akhira';
  let gazeboState = loadYawnGazeboState(activeCharKey);
  let activeActivity = null;
  let activeReadingStory = null;
  let allPublishedStories = [];
  let isMuted = false;
  let preMuteVolume = 0.7;

  // ---------------------------------------------------------------------------
  // 1. LIGHTING ATMOSPHERE
  // ---------------------------------------------------------------------------
  function applyLightingOverlay(lightId) {
    if (!lightingOverlay) return;
    lightingOverlay.className = 'ygazebo-lighting-overlay';
    const config = YAWN_GAZEBO_LIGHTS[lightId] || YAWN_GAZEBO_LIGHTS.deep_bioluminescence;
    lightingOverlay.classList.add(config.class);
    if (config.filter) {
      lightingOverlay.style.backdropFilter = config.filter;
      lightingOverlay.style.webkitBackdropFilter = config.filter;
    } else {
      lightingOverlay.style.backdropFilter = '';
      lightingOverlay.style.webkitBackdropFilter = '';
    }
    gazeboState.currentLight = lightId;
    saveYawnGazeboState(gazeboState, activeCharKey);
  }

  // ---------------------------------------------------------------------------
  // 2. OPEN & CLOSE VIEW
  // ---------------------------------------------------------------------------
  function openYawnGazebo(charKey = 'akhira') {
    activeCharKey = charKey || 'akhira';
    gazeboState = loadYawnGazeboState(activeCharKey);

    ['view-selection', 'view-login', 'view-private-universe', 'view-yawn-world'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.setAttribute('aria-hidden', 'true');
      }
    });

    if (viewGazebo) {
      viewGazebo.classList.add('active');
      viewGazebo.setAttribute('aria-hidden', 'false');
    }

    applyLightingOverlay(gazeboState.currentLight || 'deep_bioluminescence');

    if (trackTitleDisplay) {
      const track = YAWN_CINEMA_TRACKS.find(t => t.id === gazeboState.currentTrack) || YAWN_CINEMA_TRACKS[0];
      trackTitleDisplay.textContent = track.title;
    }

    if (typeof onShowToast === 'function') {
      const greeting = AKHIRA_GAZEBO_DIALOGS[Math.floor(Math.random() * AKHIRA_GAZEBO_DIALOGS.length)];
      onShowToast(`⚡ ${greeting}`);
    }
  }

  function closeYawnGazebo() {
    audioEngine.stopCinemaMelody();
    audioEngine.stopAmbient();
    closeGazeboModal();

    if (viewGazebo) {
      viewGazebo.classList.remove('active');
      viewGazebo.setAttribute('aria-hidden', 'true');
    }

    if (btnMusicToggle) {
      btnMusicToggle.textContent = '▶';
      btnMusicToggle.classList.remove('playing');
    }

    if (typeof onNavigateBack === 'function') {
      onNavigateBack();
    }
  }

  // ---------------------------------------------------------------------------
  // 3. MUSIC PLAYER CONTROLLER
  // ---------------------------------------------------------------------------
  function toggleMusic() {
    if (audioEngine.isMusicPlaying()) {
      audioEngine.stopCinemaMelody();
      if (btnMusicToggle) {
        btnMusicToggle.textContent = '▶';
        btnMusicToggle.classList.remove('playing');
      }
      if (musicIconDisplay) musicIconDisplay.classList.remove('pulsing');
    } else {
      audioEngine.startCinemaMelody();
      if (btnMusicToggle) {
        btnMusicToggle.textContent = '⏸';
        btnMusicToggle.classList.add('playing');
      }
      if (musicIconDisplay) musicIconDisplay.classList.add('pulsing');
      if (typeof onShowToast === 'function') {
        const track = YAWN_CINEMA_TRACKS.find(t => t.id === gazeboState.currentTrack) || YAWN_CINEMA_TRACKS[0];
        onShowToast(`🎶 Memutar alunan musik: ${track.title} ✨`);
      }
    }
  }

  function toggleMute() {
    if (isMuted) {
      isMuted = false;
      audioEngine.setVolume(preMuteVolume);
      if (sliderMusicVol) sliderMusicVol.value = Math.round(preMuteVolume * 100);
      if (btnMusicMute) btnMusicMute.textContent = '🔊';
    } else {
      isMuted = true;
      preMuteVolume = audioEngine.getVolume() || 0.7;
      audioEngine.setVolume(0);
      if (sliderMusicVol) sliderMusicVol.value = 0;
      if (btnMusicMute) btnMusicMute.textContent = '🔇';
    }
  }

  function handleVolumeChange(e) {
    const val = parseFloat(e.target.value) / 100;
    audioEngine.setVolume(val);
    gazeboState.musicVolume = val;
    saveYawnGazeboState(gazeboState, activeCharKey);

    if (val > 0) {
      isMuted = false;
      if (btnMusicMute) btnMusicMute.textContent = val > 0.5 ? '🔊' : '🔉';
    } else {
      isMuted = true;
      if (btnMusicMute) btnMusicMute.textContent = '🔇';
    }
  }

  // ---------------------------------------------------------------------------
  // 4. MODAL DISPATCHER
  // ---------------------------------------------------------------------------
  function openGazeboModal(activityKey) {
    activeActivity = activityKey;
    if (modalBackdrop) {
      modalBackdrop.classList.add('active', 'open');
      modalBackdrop.setAttribute('aria-hidden', 'false');
    }

    if (activityKey === 'tea') renderTeaModal();
    else if (activityKey === 'cinema') renderCinemaModal();
    else if (activityKey === 'journal') renderJournalModal();
    else if (activityKey === 'quiet') renderQuietModal();
  }

  function closeGazeboModal() {
    activeActivity = null;
    activeReadingStory = null;
    if (modalBackdrop) {
      modalBackdrop.classList.remove('active', 'open');
      modalBackdrop.setAttribute('aria-hidden', 'true');
    }
  }

  // ---------------------------------------------------------------------------
  // 5. ACTIVITY 1: TEA TIME & REFRESHMENTS
  // ---------------------------------------------------------------------------
  function renderTeaModal() {
    if (modalHeaderIcon) modalHeaderIcon.textContent = '🫖';
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Tea Time di Gazebo Samudra';
    if (modalHeaderSub) modalHeaderSub.textContent = 'Nikmati seduhan teh mutiara laut dalam & camilan manis bioluminesen';

    const teasList = Object.values(YAWN_TEAS);
    const treatsList = Object.values(YAWN_TREATS);
    const currentTea = YAWN_TEAS[gazeboState.currentTea] || YAWN_TEAS.pearl_tea;
    const currentTreat = YAWN_TREATS[gazeboState.currentTreat] || YAWN_TREATS.astral_popcorn;

    modalBody.innerHTML = `
      <div class="yg-tea-layout">
        <!-- Tea Pot Visual & Aura -->
        <div class="yg-tea-pot-stage" style="--tea-color: ${currentTea.color};">
          <div class="yg-pot-halo" style="background: radial-gradient(circle, ${currentTea.steamColor} 0%, transparent 70%);"></div>
          <div class="yg-pot-avatar">${currentTea.icon}</div>
          <div class="yg-pot-info">
            <h3>${currentTea.name}</h3>
            <p class="yg-pot-aroma">🌸 <em>${currentTea.aroma}</em></p>
            <p class="yg-pot-desc">${currentTea.desc}</p>
            <div class="yg-pot-effect-tag">${currentTea.effect}</div>
          </div>
        </div>

        <!-- Tea Selection List -->
        <div class="yg-tea-section">
          <h4>Pilihan Teh Bioluminesen</h4>
          <div class="yg-tea-grid">
            ${teasList.map(tea => `
              <div class="yg-tea-card ${tea.id === currentTea.id ? 'selected' : ''}" data-tea-id="${tea.id}">
                <div class="yg-tea-card-icon" style="background:${tea.color}22; border-color:${tea.color};">${tea.icon}</div>
                <div class="yg-tea-card-text">
                  <h5>${tea.name.split('(')[0]}</h5>
                  <small>${tea.effect.split(' ')[1] || 'Ketenangan'}</small>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Treats Selection List -->
        <div class="yg-tea-section">
          <h4>Camilan Pendamping Teh</h4>
          <div class="yg-treats-grid">
            ${treatsList.map(treat => `
              <div class="yg-treat-card ${treat.id === currentTreat.id ? 'selected' : ''}" data-treat-id="${treat.id}">
                <span class="yg-treat-icon">${treat.icon}</span>
                <div class="yg-treat-info">
                  <h5>${treat.name}</h5>
                  <small>${treat.desc}</small>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Brew Button & Action Row -->
        <div class="yg-tea-actions">
          <button type="button" class="btn-yg-primary" id="btn-yg-brew-tea">
            🍵 Seduh Secangkir Teh Ini (${gazeboState.teaBrewCount || 0}x diseduh)
          </button>
        </div>
      </div>
    `;

    // Bind Tea card selection
    modalBody.querySelectorAll('.yg-tea-card').forEach(card => {
      card.addEventListener('click', () => {
        const teaId = card.getAttribute('data-tea-id');
        gazeboState.currentTea = teaId;
        saveYawnGazeboState(gazeboState, activeCharKey);
        audioEngine.playBubblePop();
        renderTeaModal();
      });
    });

    // Bind Treat card selection
    modalBody.querySelectorAll('.yg-treat-card').forEach(card => {
      card.addEventListener('click', () => {
        const treatId = card.getAttribute('data-treat-id');
        gazeboState.currentTreat = treatId;
        saveYawnGazeboState(gazeboState, activeCharKey);
        audioEngine.playBubblePop();
        renderTeaModal();
      });
    });

    // Bind Brew Tea button
    const btnBrew = modalBody.querySelector('#btn-yg-brew-tea');
    if (btnBrew) {
      btnBrew.addEventListener('click', () => {
        gazeboState.teaBrewCount = (gazeboState.teaBrewCount || 0) + 1;
        saveYawnGazeboState(gazeboState, activeCharKey);

        audioEngine.playOceanChime();
        if (typeof onTriggerSparkle === 'function') {
          onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        }
        if (typeof onShowToast === 'function') {
          onShowToast(`🍵 ${currentTea.name} berhasil diseduh hangat! Efek: ${currentTea.effect} ✨`);
        }
        renderTeaModal();
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. ACTIVITY 2: ASTRAL CINEMA & LIBRARY LOUNGE
  // ---------------------------------------------------------------------------
  async function renderCinemaModal() {
    if (modalHeaderIcon) modalHeaderIcon.textContent = '🎬';
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Astral Cinema & Koleksi Cerita';
    if (modalHeaderSub) modalHeaderSub.textContent = 'Layar bioskop samudra dan kumpulan dongeng hangat dari seluruh semesta';

    modalBody.innerHTML = `<div class="yg-loading-spinner">Menyiapkan proyeksi sinematik & memuat buku dongeng... 🌊</div>`;

    try {
      allPublishedStories = await getPublishedStories();
    } catch (_) {
      allPublishedStories = [];
    }

    if (activeReadingStory) {
      renderStoryReader(activeReadingStory);
      return;
    }

    const currentTrack = YAWN_CINEMA_TRACKS.find(t => t.id === gazeboState.currentTrack) || YAWN_CINEMA_TRACKS[0];

    modalBody.innerHTML = `
      <div class="yg-cinema-layout">
        <!-- Cinema Screen Preview Box -->
        <div class="yg-screen-preview-box">
          <div class="yg-screen-aspect">
            <div class="yg-screen-glow"></div>
            <div class="yg-screen-content">
              <span class="yg-screen-moon">🌕</span>
              <div class="yg-screen-title">${currentTrack.title}</div>
              <p class="yg-screen-desc">${currentTrack.desc}</p>
              <div class="yg-screen-bar">
                <span>⏮</span>
                <span class="yg-play-screen-btn" id="yg-screen-play-btn">▶ / ⏸ Putar Alunan</span>
                <span>⏭</span>
                <small>${currentTrack.duration}</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Cinema Screen Projections -->
        <div class="yg-cinema-tracks-section">
          <h4>Pilihan Proyeksi Musik & Visual Samudra</h4>
          <div class="yg-tracks-grid">
            ${YAWN_CINEMA_TRACKS.map(t => `
              <div class="yg-track-card ${t.id === currentTrack.id ? 'selected' : ''}" data-track-id="${t.id}">
                <span class="yg-track-icon">🌌</span>
                <div class="yg-track-meta">
                  <h5>${t.title}</h5>
                  <small>${t.duration} • ${t.desc}</small>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Story Reader Section (Library Parity) -->
        <div class="yg-stories-section">
          <div class="yg-stories-header">
            <h4>📖 Arsip Dongeng & Cerita Semesta (${allPublishedStories.length} Karya)</h4>
            ${typeof onNavigateStoryWorkspace === 'function' ? `
              <button type="button" class="btn-yg-link" id="btn-yg-open-workspace">
                ✍️ Tulis Cerita Baru di Workspace
              </button>
            ` : ''}
          </div>

          ${allPublishedStories.length === 0 ? `
            <div class="yg-empty-stories">
              <p>Belum ada karya cerita publik. Kamu bisa menulis kisah pertama di Workspace!</p>
            </div>
          ` : `
            <div class="yg-stories-grid">
              ${allPublishedStories.map(story => `
                <div class="yg-story-card" data-story-id="${story.id}">
                  <div class="yg-story-card-top">
                    <span class="yg-universe-tag">${story.universe || 'YAWN'}</span>
                  </div>
                  <h5>${story.title || 'Kisah Samudra'}</h5>
                  <p class="yg-story-author">Karya: ${story.authorName || 'Sahabat Semesta'}</p>
                  <p class="yg-story-snippet">${(story.content || '').substring(0, 85)}...</p>
                  <button type="button" class="btn-yg-read-story" data-story-id="${story.id}">
                    📖 Baca Cerita
                  </button>
                </div>
              `).join('')}
            </div>
          `}
        </div>
      </div>
    `;

    // Bind Screen Play button
    const screenPlayBtn = modalBody.querySelector('#yg-screen-play-btn');
    if (screenPlayBtn) {
      screenPlayBtn.onclick = () => {
        toggleMusic();
      };
    }

    // Bind Track Card selection
    modalBody.querySelectorAll('.yg-track-card').forEach(card => {
      card.addEventListener('click', () => {
        const trackId = card.getAttribute('data-track-id');
        gazeboState.currentTrack = trackId;
        saveYawnGazeboState(gazeboState, activeCharKey);
        if (trackTitleDisplay) {
          const track = YAWN_CINEMA_TRACKS.find(t => t.id === trackId);
          if (track) trackTitleDisplay.textContent = track.title;
        }
        audioEngine.playArcadeChime();
        renderCinemaModal();
      });
    });

    // Bind Workspace link
    const btnWorkspace = modalBody.querySelector('#btn-yg-open-workspace');
    if (btnWorkspace && typeof onNavigateStoryWorkspace === 'function') {
      btnWorkspace.onclick = () => {
        closeYawnGazebo();
        onNavigateStoryWorkspace();
      };
    }

    // Bind Read Story buttons
    modalBody.querySelectorAll('.btn-yg-read-story').forEach(btn => {
      btn.addEventListener('click', () => {
        const storyId = btn.getAttribute('data-story-id');
        const story = allPublishedStories.find(s => s.id === storyId);
        if (story) {
          activeReadingStory = story;
          renderStoryReader(story);
        }
      });
    });
  }

  function renderStoryReader(story) {
    modalBody.innerHTML = `
      <div class="yg-story-reader">
        <button type="button" class="btn-yg-back-to-library" id="btn-yg-back-to-cinema">
          ← Kembali ke Layar Bioskop & Koleksi
        </button>
        <article class="yg-reader-article">
          <h3>${story.title || 'Kisah Tanpa Judul'}</h3>
          <div class="yg-reader-meta">
            <span>✍️ Penulis: ${story.authorName || 'Sahabat Semesta'}</span>
            <span>🌌 Universe: ${story.universe || 'YAWN'}</span>
          </div>
          <div class="yg-reader-content">
            ${(story.content || '').split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
          </div>
        </article>
      </div>
    `;

    const btnBack = modalBody.querySelector('#btn-yg-back-to-cinema');
    if (btnBack) {
      btnBack.onclick = () => {
        activeReadingStory = null;
        renderCinemaModal();
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 7. ACTIVITY 3: JURNAL KENANGAN / ABYSSAL JOURNAL
  // ---------------------------------------------------------------------------
  function renderJournalModal() {
    if (modalHeaderIcon) modalHeaderIcon.textContent = '📜';
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Jurnal Kenangan Samudra';
    if (modalHeaderSub) modalHeaderSub.textContent = 'Tulis renungan hati, rasa syukur, dan impian indah di bawah naungan wisteria laut';

    const journals = Array.isArray(gazeboState.journals) ? gazeboState.journals : [];

    modalBody.innerHTML = `
      <div class="yg-journal-layout">
        <div class="yg-journal-top-row">
          <span>Tersimpan <strong>${journals.length} catatan renungan</strong> di suaka YAWN:</span>
          <button type="button" class="btn-yg-primary" id="btn-yg-new-journal">
            ✍️ Tulis Catatan Baru
          </button>
        </div>

        <div class="yg-journal-list">
          ${journals.map(entry => {
            const moodObj = YAWN_JOURNAL_MOODS.find(m => m.id === entry.mood) || YAWN_JOURNAL_MOODS[0];
            return `
              <div class="yg-journal-card" data-journal-id="${entry.id}">
                <div class="yg-journal-card-header">
                  <span class="yg-journal-mood-tag">${moodObj.label}</span>
                  <span class="yg-journal-date">${entry.date || 'Hari ini'}</span>
                </div>
                <h4>${entry.title}</h4>
                <p>${entry.content.substring(0, 110)}...</p>
                <div class="yg-journal-card-actions">
                  <button type="button" class="btn-yg-read-journal" data-journal-id="${entry.id}">Baca Selengkapnya →</button>
                  <button type="button" class="btn-yg-delete-journal" data-journal-id="${entry.id}" title="Hapus catatan">🗑️</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    const btnNew = modalBody.querySelector('#btn-yg-new-journal');
    if (btnNew) btnNew.onclick = renderJournalEditor;

    modalBody.querySelectorAll('.btn-yg-read-journal').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-journal-id');
        const entry = journals.find(j => j.id === id);
        if (entry) renderJournalDetail(entry);
      };
    });

    modalBody.querySelectorAll('.btn-yg-delete-journal').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-journal-id');
        if (confirm('Hapus catatan renungan ini dari jurnal gazebo?')) {
          gazeboState.journals = gazeboState.journals.filter(j => j.id !== id);
          saveYawnGazeboState(gazeboState, activeCharKey);
          if (typeof onShowToast === 'function') onShowToast('Catatan berhasil dihapus.');
          renderJournalModal();
        }
      };
    });
  }

  function renderJournalEditor() {
    modalBody.innerHTML = `
      <div class="yg-journal-editor">
        <h4>Tulis Renungan Samudra</h4>
        <div class="yg-field-group">
          <label>Judul Catatan</label>
          <input type="text" id="yg-input-journal-title" class="yg-input-text" placeholder="Misal: Ketenangan di Bawah Ombak..." maxlength="60">
        </div>
        <div class="yg-field-group">
          <label>Suasana Hati (Mood)</label>
          <div class="yg-mood-selector">
            ${YAWN_JOURNAL_MOODS.map((m, idx) => `
              <label class="yg-mood-radio">
                <input type="radio" name="yg-mood-opt" value="${m.id}" ${idx === 0 ? 'checked' : ''}>
                <span>${m.label}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="yg-field-group">
          <label>Isi Renungan</label>
          <textarea id="yg-input-journal-content" class="yg-textarea" rows="6" placeholder="Tuliskan apa pun yang ingin kamu ceritakan atau renungkan hari ini..."></textarea>
        </div>
        <div class="yg-editor-buttons">
          <button type="button" class="btn-yg-cancel" id="btn-yg-cancel-journal">Batal</button>
          <button type="button" class="btn-yg-primary" id="btn-yg-save-journal">Simpan ke Jurnal ✨</button>
        </div>
      </div>
    `;

    const btnCancel = modalBody.querySelector('#btn-yg-cancel-journal');
    if (btnCancel) btnCancel.onclick = renderJournalModal;

    const btnSave = modalBody.querySelector('#btn-yg-save-journal');
    if (btnSave) {
      btnSave.onclick = () => {
        const titleInput = modalBody.querySelector('#yg-input-journal-title');
        const contentInput = modalBody.querySelector('#yg-input-journal-content');
        const selectedMood = modalBody.querySelector('input[name="yg-mood-opt"]:checked')?.value || 'calm_abyss';

        const title = (titleInput?.value || '').trim();
        const content = (contentInput?.value || '').trim();

        if (!title || !content) {
          alert('Mohon isi judul dan konten renungan.');
          return;
        }

        const newEntry = {
          id: `yawn_journal_${Date.now()}`,
          title,
          mood: selectedMood,
          content,
          date: 'Hari ini',
          createdAt: Date.now()
        };

        if (!Array.isArray(gazeboState.journals)) gazeboState.journals = [];
        gazeboState.journals.unshift(newEntry);
        saveYawnGazeboState(gazeboState, activeCharKey);

        audioEngine.playOceanChime();
        if (typeof onTriggerSparkle === 'function') {
          onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
        }
        if (typeof onShowToast === 'function') {
          onShowToast('📜 Catatan renungan berhasil disimpan di Jurnal Gazebo YAWN! ✨');
        }

        renderJournalModal();
      };
    }
  }

  function renderJournalDetail(entry) {
    const moodObj = YAWN_JOURNAL_MOODS.find(m => m.id === entry.mood) || YAWN_JOURNAL_MOODS[0];
    modalBody.innerHTML = `
      <div class="yg-journal-detail">
        <button type="button" class="btn-yg-back-to-library" id="btn-yg-back-to-journal">
          ← Kembali ke Daftar Jurnal
        </button>
        <article class="yg-detail-article">
          <div class="yg-journal-card-header">
            <span class="yg-journal-mood-tag">${moodObj.label}</span>
            <span class="yg-journal-date">${entry.date || 'Hari ini'}</span>
          </div>
          <h3>${entry.title}</h3>
          <div class="yg-detail-content">
            ${entry.content.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('')}
          </div>
        </article>
      </div>
    `;

    const btnBack = modalBody.querySelector('#btn-yg-back-to-journal');
    if (btnBack) btnBack.onclick = renderJournalModal;
  }

  // ---------------------------------------------------------------------------
  // 8. ACTIVITY 4: QUIET MOMENT (AMBIENT SOUNDSCAPES & CALM TIMER)
  // ---------------------------------------------------------------------------
  function renderQuietModal() {
    if (modalHeaderIcon) modalHeaderIcon.textContent = '🔮';
    if (modalHeaderTitle) modalHeaderTitle.textContent = 'Quiet Moment di Palung Bintang';
    if (modalHeaderSub) modalHeaderSub.textContent = 'Resapi ketenangan samudra kosmik, dengungan paus astral, dan dentingan kristal';

    const currentAmbient = audioEngine.getCurrentAmbient();

    modalBody.innerHTML = `
      <div class="yg-quiet-layout">
        <div class="yg-quiet-breathing-stage">
          <div class="yg-breathing-circle ${currentAmbient !== 'none' ? 'active' : ''}">
            <span class="yg-breathing-icon">${currentAmbient === 'whale_song' ? '🐋' : currentAmbient === 'ocean_waves' ? '🌊' : '🫧'}</span>
            <span class="yg-breathing-guide">Tarik Napas... Hembuskan...</span>
          </div>
        </div>

        <div class="yg-ambient-section">
          <h4>Pilihan Suara Alam Bawah Laut</h4>
          <div class="yg-ambient-grid">
            ${YAWN_AMBIENT_OPTIONS.map(opt => `
              <div class="yg-ambient-card ${opt.id === currentAmbient ? 'selected' : ''}" data-ambient-id="${opt.id}">
                <span class="yg-ambient-icon">${opt.icon}</span>
                <div class="yg-ambient-meta">
                  <h5>${opt.title}</h5>
                  <small>${opt.desc}</small>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="yg-quiet-actions">
          <button type="button" class="btn-yg-secondary" id="btn-yg-stop-ambient">
            ⏹ Matikan Suara Alam
          </button>
        </div>
      </div>
    `;

    modalBody.querySelectorAll('.yg-ambient-card').forEach(card => {
      card.addEventListener('click', () => {
        const ambId = card.getAttribute('data-ambient-id');
        audioEngine.setAmbientSoundscape(ambId);
        if (typeof onShowToast === 'function') {
          const opt = YAWN_AMBIENT_OPTIONS.find(o => o.id === ambId);
          onShowToast(`Suasana suara diaktifkan: ${opt.title} ✨`);
        }
        renderQuietModal();
      });
    });

    const btnStop = modalBody.querySelector('#btn-yg-stop-ambient');
    if (btnStop) {
      btnStop.onclick = () => {
        audioEngine.stopAmbient();
        if (typeof onShowToast === 'function') onShowToast('Suara alam dimatikan.');
        renderQuietModal();
      };
    }
  }

  // ---------------------------------------------------------------------------
  // 9. STAGE HOTSPOT INTERACTIONS
  // ---------------------------------------------------------------------------
  function handlePetCat() {
    gazeboState.catPetCount = (gazeboState.catPetCount || 0) + 1;
    saveYawnGazeboState(gazeboState, activeCharKey);

    audioEngine.playCatPurrTone();
    const reaction = CAT_AND_WHALE_INTERACTIONS[Math.floor(Math.random() * CAT_AND_WHALE_INTERACTIONS.length)];
    if (typeof onTriggerSparkle === 'function') {
      onTriggerSparkle(window.innerWidth * 0.22, window.innerHeight * 0.75);
    }
    if (typeof onShowToast === 'function') {
      onShowToast(`🐾 ${reaction}`);
    }
  }

  function handleTouchGamepad() {
    gazeboState.gamePlayedCount = (gazeboState.gamePlayedCount || 0) + 1;
    saveYawnGazeboState(gazeboState, activeCharKey);

    audioEngine.playArcadeChime();
    const quote = GAMING_INTERACTIONS[Math.floor(Math.random() * GAMING_INTERACTIONS.length)];
    if (typeof onTriggerSparkle === 'function') {
      onTriggerSparkle(window.innerWidth * 0.88, window.innerHeight * 0.82);
    }
    if (typeof onShowToast === 'function') {
      onShowToast(`🎮 ${quote}`);
    }
  }

  function handleTouchTable() {
    audioEngine.playBubblePop();
    const quote = TABLE_REFRESHMENTS_INTERACTIONS[Math.floor(Math.random() * TABLE_REFRESHMENTS_INTERACTIONS.length)];
    if (typeof onTriggerSparkle === 'function') {
      onTriggerSparkle(window.innerWidth * 0.52, window.innerHeight * 0.72);
    }
    if (typeof onShowToast === 'function') {
      onShowToast(`🍿 ${quote}`);
    }
  }

  function handleCycleLanterns() {
    const lights = Object.values(YAWN_GAZEBO_LIGHTS);
    const currentIdx = lights.findIndex(l => l.id === gazeboState.currentLight);
    const nextIdx = (currentIdx + 1) % lights.length;
    const nextLight = lights[nextIdx];

    applyLightingOverlay(nextLight.id);
    audioEngine.playOceanChime();

    if (typeof onTriggerSparkle === 'function') {
      onTriggerSparkle(window.innerWidth * 0.5, window.innerHeight * 0.22);
    }
    if (typeof onShowToast === 'function') {
      onShowToast(`🕯️ Suasana lentera diganti: ${nextLight.name} (${nextLight.desc}) ✨`);
    }
  }

  function handleTouchScreen() {
    openGazeboModal('cinema');
  }

  // ---------------------------------------------------------------------------
  // 10. EVENT BINDINGS
  // ---------------------------------------------------------------------------
  if (btnGazeboBack) btnGazeboBack.addEventListener('click', closeYawnGazebo);

  // Top Bar Music Player
  if (btnMusicToggle) btnMusicToggle.addEventListener('click', toggleMusic);
  if (btnMusicMute) btnMusicMute.addEventListener('click', toggleMute);
  if (sliderMusicVol) sliderMusicVol.addEventListener('input', handleVolumeChange);

  // 4 Central Activity Cards
  if (cardTea) cardTea.addEventListener('click', () => openGazeboModal('tea'));
  if (cardCinema) cardCinema.addEventListener('click', () => openGazeboModal('cinema'));
  if (cardJournal) cardJournal.addEventListener('click', () => openGazeboModal('journal'));
  if (cardQuiet) cardQuiet.addEventListener('click', () => openGazeboModal('quiet'));

  // Quick Action Buttons
  if (btnQuickTea) btnQuickTea.addEventListener('click', () => openGazeboModal('tea'));
  if (btnQuickCinema) btnQuickCinema.addEventListener('click', () => openGazeboModal('cinema'));
  if (btnSongsWeShare) {
    btnSongsWeShare.addEventListener('click', () => {
      // Connect to Songs We Share for YAWN
      import('./songs_we_share.js').then(module => {
        if (typeof module.openSongsWeShareModal === 'function') {
          module.openSongsWeShareModal('yawn');
        }
      }).catch(err => {
        if (typeof onShowToast === 'function') onShowToast('🎵 Membuka rekomendasi lagu...');
      });
    });
  }

  // Modal Backdrop & Close
  if (btnModalClose) btnModalClose.addEventListener('click', closeGazeboModal);
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeGazeboModal();
    });
  }

  // Hotspots
  if (hotspotCat) hotspotCat.addEventListener('click', handlePetCat);
  if (hotspotGamepad) hotspotGamepad.addEventListener('click', handleTouchGamepad);
  if (hotspotTable) hotspotTable.addEventListener('click', handleTouchTable);
  if (hotspotLanterns) hotspotLanterns.addEventListener('click', handleCycleLanterns);
  if (hotspotScreen) hotspotScreen.addEventListener('click', handleTouchScreen);

  // Keyboard shortcut: Escape to close modal / view
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && viewGazebo && viewGazebo.classList.contains('active')) {
      if (modalBackdrop && modalBackdrop.classList.contains('active')) {
        closeGazeboModal();
      } else {
        closeYawnGazebo();
      }
    }
  });

  return {
    openYawnGazebo,
    closeYawnGazebo,
    openGazeboModal,
    closeGazeboModal
  };
}
