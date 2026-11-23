/**
 * YAWN CINEMA VIEW — THE QUIET ABYSS
 * Private Underwater Sanctuary Controller for Akhira ⚡
 * =============================================================================
 */

import {
  AKHIRA_CANONICAL_ID,
  CINEMA_CATEGORIES,
  CINEMA_FILMS,
  OCEAN_SOUNDSCAPES,
  RESTING_STATES,
  LETTER_CATEGORIES,
  LIGHTING_MODES,
  CEILING_PROJECTIONS,
  loadYawnCinemaState,
  saveYawnCinemaState,
  createYawnCinemaAudioEngine
} from './yawn_cinema_state.js';

export function initYawnCinemaView(options = {}) {
  const {
    onShowToast = (msg) => console.log(msg),
    onTriggerSparkle = () => {},
    onNavigateBack = () => {}
  } = options;

  let state = loadYawnCinemaState('akhira');
  const audioEngine = createYawnCinemaAudioEngine();

  // DOM Elements cache
  const viewEl = document.getElementById('view-yawn-cinema');
  if (!viewEl) {
    console.warn('[YawnCinemaView] Target container #view-yawn-cinema not found in DOM.');
    return null;
  }

  // Sub-elements
  const btnBack = document.getElementById('btn-ycinema-back');
  const btnQuickAudio = document.getElementById('btn-ycinema-quick-audio');
  const btnLighting = document.getElementById('btn-ycinema-lighting');
  const btnCeiling = document.getElementById('btn-ycinema-ceiling');
  const btnObservation = document.getElementById('btn-ycinema-observation');
  const btnExitObservation = document.getElementById('btn-exit-whale-watch');
  const welcomeCard = document.getElementById('ycinema-welcome-card');
  const btnDismissWelcome = document.getElementById('btn-ycinema-welcome-dismiss');

  // Modals
  const playerModal = document.getElementById('ycinema-player-modal');
  const donothingModal = document.getElementById('ycinema-donothing-modal');
  const soundscapeModal = document.getElementById('ycinema-soundscape-modal');
  const lettersModal = document.getElementById('ycinema-letters-modal');

  // Film player refs
  const filmCanvas = document.getElementById('ycinema-screen-canvas');
  let animationFrameId = null;
  let activeLetterId = null;
  let restTimerInterval = null;

  // ---------------------------------------------------------------------------
  // Canvas Visualizer Engine for Starlight Cinema
  // ---------------------------------------------------------------------------
  function startFilmVisualizer(film) {
    if (!filmCanvas) return;
    const ctx = filmCanvas.getContext('2d');
    if (!ctx) return;

    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }

    let frame = 0;
    const width = (filmCanvas.width = filmCanvas.clientWidth || 800);
    const height = (filmCanvas.height = filmCanvas.clientHeight || 450);

    function render() {
      if (!state.isPlayingFilm) return;
      frame++;
      ctx.fillStyle = '#060919';
      ctx.fillRect(0, 0, width, height);

      // Render procedural ambiance based on film type
      if (film.category === 'astral_ocean') {
        // Glowing deep ocean waves with swimming astral whale silhouette
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#09153a');
        grad.addColorStop(1, '#020617');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Whale silhouette & light particles
        const whaleX = (frame * 1.2) % (width + 300) - 150;
        const whaleY = height * 0.5 + Math.sin(frame * 0.02) * 35;

        // Bioluminescent particles
        for (let i = 0; i < 28; i++) {
          const px = (i * 47 + frame * 0.8) % width;
          const py = (i * 31 + Math.cos(frame * 0.03 + i) * 30) % height;
          ctx.beginPath();
          ctx.arc(px, py, (i % 3) + 1.5, 0, Math.PI * 2);
          ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(192, 132, 252, 0.6)';
          ctx.fill();
        }

        // Whale body
        ctx.save();
        ctx.translate(whaleX, whaleY);
        ctx.beginPath();
        ctx.ellipse(0, 0, 90, 28, 0.05, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 25;
        ctx.fill();

        // Whale tail
        ctx.beginPath();
        ctx.moveTo(-80, 0);
        ctx.lineTo(-125, -22 + Math.sin(frame * 0.06) * 12);
        ctx.lineTo(-120, 0);
        ctx.lineTo(-125, 22 + Math.sin(frame * 0.06) * 12);
        ctx.closePath();
        ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
        ctx.fill();
        ctx.restore();

      } else if (film.category === 'celestial_ambient') {
        // Aurora curtains & stars
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#0f0a28');
        grad.addColorStop(1, '#02030d');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Aurora ribbons
        for (let r = 0; r < 3; r++) {
          ctx.beginPath();
          ctx.moveTo(0, height * 0.35 + r * 30);
          for (let x = 0; x <= width; x += 25) {
            const y = height * 0.35 + r * 30 + Math.sin(x * 0.008 + frame * 0.02 + r) * 45;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          ctx.fillStyle = r === 0 ? 'rgba(192, 132, 252, 0.22)' : 'rgba(56, 189, 248, 0.18)';
          ctx.fill();
        }

        // Falling comets
        if (frame % 80 < 40) {
          const cometProgress = (frame % 80) / 40;
          ctx.beginPath();
          ctx.moveTo(width * 0.7 - cometProgress * 220, cometProgress * 150);
          ctx.lineTo(width * 0.7 - cometProgress * 220 + 40, cometProgress * 150 - 25);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.lineWidth = 2.5;
          ctx.stroke();
        }

      } else {
        // Gentle wave oscillations & soothing lo-fi glow
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#101d33');
        grad.addColorStop(1, '#030712');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        for (let w = 0; w < 4; w++) {
          ctx.beginPath();
          ctx.moveTo(0, height * 0.55 + w * 25);
          for (let x = 0; x <= width; x += 20) {
            const y = height * 0.55 + w * 25 + Math.sin(x * 0.012 + frame * 0.025 + w * 1.5) * 20;
            ctx.lineTo(x, y);
          }
          ctx.lineTo(width, height);
          ctx.lineTo(0, height);
          ctx.closePath();
          ctx.fillStyle = `rgba(14, 165, 233, ${0.12 + w * 0.08})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    }
    render();
  }

  function stopFilmVisualizer() {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  // ---------------------------------------------------------------------------
  // Renderers & UI Updates
  // ---------------------------------------------------------------------------
  function applyAtmosphere() {
    // Lighting class on view
    LIGHTING_MODES.forEach(m => viewEl.classList.remove(m.id));
    viewEl.classList.add(state.activeLightingMode || 'light-deep');

    // Ceiling projection
    const ceilingOverlay = document.getElementById('ycinema-ceiling-overlay');
    if (ceilingOverlay) {
      ceilingOverlay.className = 'ycinema-ceiling-overlay';
      if (state.activeCeilingProjection && state.activeCeilingProjection !== 'off') {
        ceilingOverlay.classList.add(`proj-${state.activeCeilingProjection}`);
      }
    }

    // Starry quilt state on stage
    const sofaStateEl = document.getElementById('ycinema-sofa-indicator');
    if (sofaStateEl) {
      sofaStateEl.textContent = state.blanketWrapped ? '⭐ Berselimut Bintang' : '🛋️ Sofa Empuk';
    }

    // Whale plush state on stage
    const whaleStateEl = document.getElementById('ycinema-whale-indicator');
    if (whaleStateEl) {
      whaleStateEl.textContent = state.whaleHugged ? '🐋 Dipeluk Hangat' : '🐋 Boneka Paus';
    }

    // Lantern state
    const lanternEl = document.getElementById('ycinema-stage-lantern');
    if (lanternEl) {
      lanternEl.classList.toggle('is-off', !state.tableLanternOn);
    }

    // Welcome card visibility
    if (welcomeCard) {
      welcomeCard.style.display = state.welcomeDismissed ? 'none' : 'block';
    }

    // Quick soundscape indicator
    if (btnQuickAudio) {
      const activeSc = OCEAN_SOUNDSCAPES.find(s => s.id === state.activeSoundscape);
      btnQuickAudio.innerHTML = activeSc
        ? `${activeSc.icon} <span class="ycinema-hud-label">${activeSc.name}</span>`
        : `🔇 <span class="ycinema-hud-label">Audio Laut: Hening</span>`;
      btnQuickAudio.classList.toggle('is-active', !!activeSc);
    }

    // Observation mode toggle
    viewEl.classList.toggle('whale-watching-active', !!state.observationMode);
  }

  // ---------------------------------------------------------------------------
  // Starlight Cinema Modal Renderer
  // ---------------------------------------------------------------------------
  let currentFilmCategory = 'all';

  function renderFilmList() {
    const listEl = document.getElementById('ycinema-film-list');
    if (!listEl) return;

    const filtered = currentFilmCategory === 'all'
      ? CINEMA_FILMS
      : CINEMA_FILMS.filter(f => f.category === currentFilmCategory);

    listEl.innerHTML = filtered.map(film => {
      const isActive = film.id === state.activeFilmId;
      const isFav = state.favoriteFilmIds.includes(film.id);
      return `
        <div class="ycinema-film-card ${isActive ? 'active' : ''}" data-film-id="${film.id}">
          <div class="film-card-header">
            <span class="film-tag" style="background:${film.color}22; color:${film.color}">${film.tag}</span>
            <span class="film-duration">⏱ ${film.duration}</span>
            <button class="btn-fav-film ${isFav ? 'is-fav' : ''}" data-film-id="${film.id}" title="Favorit Akhira">
              ${isFav ? '★' : '☆'}
            </button>
          </div>
          <h4 class="film-title">${film.title}</h4>
          <p class="film-subtitle">${film.subtitle}</p>
          <div class="film-card-footer">
            <button class="btn-play-film" data-film-id="${film.id}">
              ${isActive && state.isPlayingFilm ? '⏸ Jeda' : '▶ Putar di Layar'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Wire clicks
    listEl.querySelectorAll('.btn-play-film').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fId = btn.getAttribute('data-film-id');
        toggleFilmPlay(fId);
      });
    });

    listEl.querySelectorAll('.btn-fav-film').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const fId = btn.getAttribute('data-film-id');
        toggleFilmFavorite(fId);
      });
    });

    listEl.querySelectorAll('.ycinema-film-card').forEach(card => {
      card.addEventListener('click', () => {
        const fId = card.getAttribute('data-film-id');
        selectFilm(fId);
      });
    });
  }

  function selectFilm(filmId) {
    state.activeFilmId = filmId;
    saveYawnCinemaState(state, 'akhira');
    updateNowPlayingInfo();
    renderFilmList();
  }

  function toggleFilmPlay(filmId) {
    if (filmId && filmId !== state.activeFilmId) {
      state.activeFilmId = filmId;
      state.isPlayingFilm = true;
    } else {
      state.isPlayingFilm = !state.isPlayingFilm;
    }

    const currentFilm = CINEMA_FILMS.find(f => f.id === state.activeFilmId) || CINEMA_FILMS[0];

    if (state.isPlayingFilm) {
      startFilmVisualizer(currentFilm);
      // Auto sync soundscape if ambientType matches
      if (currentFilm.ambientType) {
        state.activeSoundscape = currentFilm.ambientType;
        audioEngine.setSoundscape(currentFilm.ambientType);
      }
      onShowToast(`🎬 Memutar "${currentFilm.title}" di Layar Proyeksi Starlight`);
      onTriggerSparkle();
    } else {
      stopFilmVisualizer();
      onShowToast(`⏸ Pemutaran dijeda`);
    }

    saveYawnCinemaState(state, 'akhira');
    applyAtmosphere();
    updateNowPlayingInfo();
    renderFilmList();
  }

  function toggleFilmFavorite(filmId) {
    if (state.favoriteFilmIds.includes(filmId)) {
      state.favoriteFilmIds = state.favoriteFilmIds.filter(id => id !== filmId);
      onShowToast('☆ Dihapus dari daftar favorit Akhira');
    } else {
      state.favoriteFilmIds.push(filmId);
      onShowToast('★ Ditambahkan ke tontonan favorit Akhira!');
      onTriggerSparkle();
    }
    saveYawnCinemaState(state, 'akhira');
    renderFilmList();
  }

  function updateNowPlayingInfo() {
    const currentFilm = CINEMA_FILMS.find(f => f.id === state.activeFilmId) || CINEMA_FILMS[0];
    const titleEl = document.getElementById('ycinema-player-title');
    const subEl = document.getElementById('ycinema-player-desc');
    const btnPlayMain = document.getElementById('btn-film-play-toggle');

    if (titleEl) titleEl.textContent = currentFilm.title;
    if (subEl) subEl.textContent = `${currentFilm.subtitle} • ${currentFilm.desc}`;
    if (btnPlayMain) {
      btnPlayMain.innerHTML = state.isPlayingFilm ? '⏸ Jeda' : '▶ Putar';
      btnPlayMain.classList.toggle('is-playing', state.isPlayingFilm);
    }
  }

  // ---------------------------------------------------------------------------
  // Do Nothing Corner Modal Renderer
  // ---------------------------------------------------------------------------
  function renderDoNothingCorner() {
    const statusBox = document.getElementById('ycinema-rest-status-box');
    const timerBox = document.getElementById('ycinema-rest-timer-box');
    const restBtnsContainer = document.getElementById('ycinema-resting-states-grid');

    if (restBtnsContainer) {
      restBtnsContainer.innerHTML = Object.values(RESTING_STATES).map(st => {
        const isActive = state.restingState === st.id;
        return `
          <button class="btn-resting-state ${isActive ? 'active' : ''}" data-state-id="${st.id}">
            <span class="st-icon">${st.icon}</span>
            <div class="st-info">
              <span class="st-title">${st.label}</span>
              <span class="st-sub">${st.affirmation}</span>
            </div>
          </button>
        `;
      }).join('');

      restBtnsContainer.querySelectorAll('.btn-resting-state').forEach(btn => {
        btn.addEventListener('click', () => {
          const sId = btn.getAttribute('data-state-id');
          setRestingState(sId);
        });
      });
    }

    if (statusBox) {
      const activeObj = RESTING_STATES[state.restingState] || RESTING_STATES.sitting;
      statusBox.innerHTML = `
        <div class="current-rest-badge">${activeObj.icon} ${activeObj.label}</div>
        <p class="current-rest-affirmation">"${activeObj.affirmation}"</p>
      `;
    }

    if (timerBox) {
      timerBox.textContent = `Telah beristirahat selama ${state.restMinutesTotal || 15} menit yang tenang`;
    }

    // Toggle button states in modal
    const btnBlanket = document.getElementById('btn-wrap-blanket');
    if (btnBlanket) {
      btnBlanket.textContent = state.blanketWrapped ? '⭐ Lepas Selimut Bintang' : '⭐ Kenakan Selimut Bintang';
      btnBlanket.classList.toggle('active', state.blanketWrapped);
    }

    const btnWhale = document.getElementById('btn-hug-whale-modal');
    if (btnWhale) {
      btnWhale.textContent = state.whaleHugged ? '🐋 Lepaskan Pelukan Paus' : '🐋 Dekap Erat Boneka Paus';
      btnWhale.classList.toggle('active', state.whaleHugged);
    }
  }

  function setRestingState(stateId) {
    state.restingState = stateId;
    const item = RESTING_STATES[stateId];
    if (item) {
      onShowToast(item.toast);
      audioEngine.playUiTone(440, 0.4, 'sine');
      onTriggerSparkle();
    }
    saveYawnCinemaState(state, 'akhira');
    applyAtmosphere();
    renderDoNothingCorner();
  }

  // ---------------------------------------------------------------------------
  // Ocean Soundscape Modal Renderer
  // ---------------------------------------------------------------------------
  function renderSoundscapeModal() {
    const listEl = document.getElementById('ycinema-soundscape-grid');
    if (!listEl) return;

    listEl.innerHTML = OCEAN_SOUNDSCAPES.map(sc => {
      const isActive = state.activeSoundscape === sc.id;
      return `
        <button class="ycinema-sound-card ${isActive ? 'active' : ''}" data-sound-id="${sc.id}">
          <div class="sound-card-header">
            <span class="sound-icon">${sc.icon}</span>
            <span class="sound-badge" style="background:${sc.color}22; color:${sc.color}">${sc.badge}</span>
          </div>
          <h4 class="sound-title">${sc.name}</h4>
          <p class="sound-desc">${sc.sub}</p>
          <div class="sound-status-pill">
            ${isActive ? '🔊 Mengalun Lembut' : '▷ Putar Suasana'}
          </div>
        </button>
      `;
    }).join('');

    listEl.querySelectorAll('.ycinema-sound-card').forEach(btn => {
      btn.addEventListener('click', () => {
        const scId = btn.getAttribute('data-sound-id');
        toggleSoundscape(scId);
      });
    });

    const volSlider = document.getElementById('input-soundscape-volume');
    if (volSlider) {
      volSlider.value = state.soundscapeVolume;
    }
  }

  function toggleSoundscape(soundId) {
    if (state.activeSoundscape === soundId) {
      state.activeSoundscape = 'none';
      audioEngine.stopAllSoundscape();
      onShowToast('🔇 Suasana suara dinonaktifkan (hening)');
    } else {
      state.activeSoundscape = soundId;
      audioEngine.setSoundscape(soundId);
      const chosen = OCEAN_SOUNDSCAPES.find(s => s.id === soundId);
      onShowToast(`🌊 Memutar: ${chosen ? chosen.name : soundId}`);
      onTriggerSparkle();
    }
    saveYawnCinemaState(state, 'akhira');
    applyAtmosphere();
    renderSoundscapeModal();
  }

  // ---------------------------------------------------------------------------
  // Letters to Myself Modal Renderer
  // ---------------------------------------------------------------------------
  let currentLetterCategory = 'all';

  function renderLettersModal() {
    const listEl = document.getElementById('ycinema-letters-list');
    const catBar = document.getElementById('ycinema-letters-categories');
    if (!listEl) return;

    // Category buttons
    if (catBar) {
      catBar.innerHTML = LETTER_CATEGORIES.map(c => `
        <button class="btn-letter-cat ${currentLetterCategory === c.id ? 'active' : ''}" data-cat-id="${c.id}">
          ${c.icon} ${c.name}
        </button>
      `).join('');

      catBar.querySelectorAll('.btn-letter-cat').forEach(b => {
        b.addEventListener('click', () => {
          currentLetterCategory = b.getAttribute('data-cat-id');
          renderLettersModal();
        });
      });
    }

    const filtered = currentLetterCategory === 'all'
      ? state.letters
      : state.letters.filter(l => l.category === currentLetterCategory);

    if (filtered.length === 0) {
      listEl.innerHTML = `
        <div class="letters-empty-state">
          <p>Belum ada catatan pada kategori ini.</p>
          <button class="btn-create-first-letter" id="btn-create-first-letter">+ Tulis Catatan Baru</button>
        </div>
      `;
      document.getElementById('btn-create-first-letter')?.addEventListener('click', openNewLetterForm);
      return;
    }

    listEl.innerHTML = filtered.map(item => {
      const catObj = LETTER_CATEGORIES.find(c => c.id === item.category) || LETTER_CATEGORIES[1];
      const isSelected = activeLetterId === item.id;
      return `
        <div class="ycinema-letter-item ${isSelected ? 'selected' : ''}" data-letter-id="${item.id}">
          <div class="letter-item-header">
            <span class="letter-cat-pill" style="color:${catObj.color}">${catObj.icon} ${catObj.name}</span>
            <span class="letter-date">${item.date} ${item.time || ''}</span>
          </div>
          <h4 class="letter-title">${item.title}</h4>
          <p class="letter-snippet">${item.content.slice(0, 110)}${item.content.length > 110 ? '...' : ''}</p>
          <div class="letter-item-footer">
            <span class="letter-mood">${item.mood || '🌙'}</span>
            <button class="btn-open-letter" data-letter-id="${item.id}">Buka & Edit ✦</button>
          </div>
        </div>
      `;
    }).join('');

    listEl.querySelectorAll('.ycinema-letter-item, .btn-open-letter').forEach(el => {
      el.addEventListener('click', (e) => {
        const lId = el.getAttribute('data-letter-id');
        openLetterEditor(lId);
      });
    });
  }

  function openLetterEditor(letterId) {
    activeLetterId = letterId;
    const letter = state.letters.find(l => l.id === letterId);
    if (!letter) return;

    const editorEl = document.getElementById('ycinema-letter-editor');
    const listContainer = document.getElementById('ycinema-letters-list-container');

    if (editorEl && listContainer) {
      listContainer.style.display = 'none';
      editorEl.style.display = 'flex';

      document.getElementById('input-letter-title').value = letter.title || '';
      document.getElementById('select-letter-category').value = letter.category || 'catatan_hari_ini';
      document.getElementById('textarea-letter-content').value = letter.content || '';
      document.getElementById('ycinema-editor-status').textContent = 'Terakhir disimpan: ' + letter.date;
    }
  }

  function openNewLetterForm() {
    activeLetterId = null;
    const editorEl = document.getElementById('ycinema-letter-editor');
    const listContainer = document.getElementById('ycinema-letters-list-container');

    if (editorEl && listContainer) {
      listContainer.style.display = 'none';
      editorEl.style.display = 'flex';

      document.getElementById('input-letter-title').value = '';
      document.getElementById('select-letter-category').value = 'catatan_hari_ini';
      document.getElementById('textarea-letter-content').value = '';
      document.getElementById('ycinema-editor-status').textContent = 'Catatan baru (belum disimpan)';
    }
  }

  function closeLetterEditor() {
    activeLetterId = null;
    const editorEl = document.getElementById('ycinema-letter-editor');
    const listContainer = document.getElementById('ycinema-letters-list-container');
    if (editorEl && listContainer) {
      editorEl.style.display = 'none';
      listContainer.style.display = 'block';
    }
    renderLettersModal();
  }

  function saveCurrentLetter() {
    const title = (document.getElementById('input-letter-title').value || '').trim() || 'Catatan Tanpa Judul';
    const category = document.getElementById('select-letter-category').value || 'catatan_hari_ini';
    const content = (document.getElementById('textarea-letter-content').value || '').trim();

    if (!content) {
      onShowToast('Tuliskan beberapa patah kata terlebih dahulu...');
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    if (activeLetterId) {
      const idx = state.letters.findIndex(l => l.id === activeLetterId);
      if (idx !== -1) {
        state.letters[idx] = {
          ...state.letters[idx],
          title,
          category,
          content,
          date: dateStr,
          time: timeStr
        };
      }
    } else {
      const newEntry = {
        id: 'letter_' + Date.now(),
        category,
        title,
        content,
        date: dateStr,
        time: timeStr,
        mood: '🌙',
        pinned: false
      };
      state.letters.unshift(newEntry);
      activeLetterId = newEntry.id;
    }

    saveYawnCinemaState(state, 'akhira');
    document.getElementById('ycinema-editor-status').textContent = 'Tersimpan rapi di sanctuari Akhira ✓';
    onShowToast('📜 Catatan berhasil disimpan ke Jurnal Akhira');
    audioEngine.playUiTone(659.25, 0.25, 'triangle');
    onTriggerSparkle();
  }

  function deleteCurrentLetter() {
    if (!activeLetterId) {
      closeLetterEditor();
      return;
    }
    state.letters = state.letters.filter(l => l.id !== activeLetterId);
    saveYawnCinemaState(state, 'akhira');
    onShowToast('🗑️ Catatan telah dihapus');
    closeLetterEditor();
  }

  // ---------------------------------------------------------------------------
  // Modal Helpers
  // ---------------------------------------------------------------------------
  function openModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('active');
    modalEl.setAttribute('aria-hidden', 'false');
  }

  function closeModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('active');
    modalEl.setAttribute('aria-hidden', 'true');
  }

  function closeAllModals() {
    [playerModal, donothingModal, soundscapeModal, lettersModal].forEach(closeModal);
    closeLetterEditor();
  }

  // ---------------------------------------------------------------------------
  // Event Bindings
  // ---------------------------------------------------------------------------
  function bindEvents() {
    // Top HUD
    btnBack?.addEventListener('click', () => {
      closeYawnCinema();
      onNavigateBack();
    });

    btnQuickAudio?.addEventListener('click', () => {
      openModal(soundscapeModal);
      renderSoundscapeModal();
    });

    btnLighting?.addEventListener('click', () => {
      const order = ['light-deep', 'light-aurora', 'light-warm', 'light-cinema'];
      const curIdx = order.indexOf(state.activeLightingMode || 'light-deep');
      const nextIdx = (curIdx + 1) % order.length;
      state.activeLightingMode = order[nextIdx];
      const modeObj = LIGHTING_MODES.find(m => m.id === state.activeLightingMode);
      onShowToast(`💡 Pencahayaan: ${modeObj ? modeObj.name : state.activeLightingMode}`);
      saveYawnCinemaState(state, 'akhira');
      applyAtmosphere();
      audioEngine.playUiTone(587.33, 0.2, 'sine');
    });

    btnCeiling?.addEventListener('click', () => {
      const order = ['caustics', 'nebula', 'stars', 'off'];
      const curIdx = order.indexOf(state.activeCeilingProjection || 'caustics');
      const nextIdx = (curIdx + 1) % order.length;
      state.activeCeilingProjection = order[nextIdx];
      const projObj = CEILING_PROJECTIONS.find(p => p.id === state.activeCeilingProjection);
      onShowToast(`🌌 Proyeksi Langit-Langit: ${projObj ? projObj.name : state.activeCeilingProjection}`);
      saveYawnCinemaState(state, 'akhira');
      applyAtmosphere();
      audioEngine.playUiTone(783.99, 0.2, 'triangle');
    });

    btnObservation?.addEventListener('click', () => {
      state.observationMode = true;
      applyAtmosphere();
      onShowToast('🐋 Mode Observasi Bawah Laut aktif. Nikmati keheningan...');
    });

    btnExitObservation?.addEventListener('click', () => {
      state.observationMode = false;
      applyAtmosphere();
    });

    btnDismissWelcome?.addEventListener('click', () => {
      state.welcomeDismissed = true;
      saveYawnCinemaState(state, 'akhira');
      applyAtmosphere();
      onShowToast('Catatan sambutan disembunyikan.');
    });

    // Stage Hotspots
    document.getElementById('btn-spot-cinema-screen')?.addEventListener('click', () => {
      openModal(playerModal);
      updateNowPlayingInfo();
      renderFilmList();
    });

    document.getElementById('btn-spot-do-nothing')?.addEventListener('click', () => {
      openModal(donothingModal);
      renderDoNothingCorner();
    });

    document.getElementById('btn-spot-soundscape')?.addEventListener('click', () => {
      openModal(soundscapeModal);
      renderSoundscapeModal();
    });

    document.getElementById('btn-spot-letters')?.addEventListener('click', () => {
      openModal(lettersModal);
      renderLettersModal();
    });

    document.getElementById('btn-spot-whale-watch')?.addEventListener('click', () => {
      state.observationMode = true;
      applyAtmosphere();
      onShowToast('🐋 Membuka jendela samudra penuh...');
    });

    // Stage quick interactive buttons
    document.getElementById('btn-stage-blanket-toggle')?.addEventListener('click', () => {
      state.blanketWrapped = !state.blanketWrapped;
      onShowToast(state.blanketWrapped ? '⭐ Akhira berselimut bintang...' : '⭐ Selimut bintang dilipat rapi.');
      audioEngine.playUiTone(440, 0.25, 'sine');
      saveYawnCinemaState(state, 'akhira');
      applyAtmosphere();
    });

    document.getElementById('btn-stage-whale-hug')?.addEventListener('click', () => {
      state.whaleHugged = !state.whaleHugged;
      onShowToast(state.whaleHugged ? '🐋 Akhira mendekap erat boneka paus astral...' : '🐋 Boneka paus diletakkan kembali.');
      audioEngine.playUiTone(523.25, 0.3, 'sine');
      saveYawnCinemaState(state, 'akhira');
      applyAtmosphere();
      onTriggerSparkle();
    });

    document.getElementById('btn-stage-lantern-toggle')?.addEventListener('click', () => {
      state.tableLanternOn = !state.tableLanternOn;
      onShowToast(state.tableLanternOn ? '🕯️ Lentera kristal meja menyala lembut' : '🕯️ Lentera kristal meja dipadamkan');
      saveYawnCinemaState(state, 'akhira');
      applyAtmosphere();
    });

    // Player Modal Buttons
    document.getElementById('btn-close-ycinema-player')?.addEventListener('click', () => closeModal(playerModal));
    document.getElementById('btn-film-play-toggle')?.addEventListener('click', () => toggleFilmPlay(state.activeFilmId));

    const filmCategoriesBar = document.getElementById('ycinema-film-categories');
    if (filmCategoriesBar) {
      filmCategoriesBar.innerHTML = CINEMA_CATEGORIES.map(c => `
        <button class="btn-film-cat ${currentFilmCategory === c.id ? 'active' : ''}" data-cat-id="${c.id}">
          ${c.icon} ${c.name}
        </button>
      `).join('');

      filmCategoriesBar.querySelectorAll('.btn-film-cat').forEach(b => {
        b.addEventListener('click', () => {
          currentFilmCategory = b.getAttribute('data-cat-id');
          filmCategoriesBar.querySelectorAll('.btn-film-cat').forEach(x => x.classList.remove('active'));
          b.classList.add('active');
          renderFilmList();
        });
      });
    }

    document.getElementById('btn-film-fullscreen')?.addEventListener('click', () => {
      const playerContainer = document.querySelector('.ycinema-player-stage');
      if (playerContainer) {
        if (!document.fullscreenElement) {
          playerContainer.requestFullscreen?.().catch(() => {});
        } else {
          document.exitFullscreen?.().catch(() => {});
        }
      }
    });

    // Do Nothing Modal Buttons
    document.getElementById('btn-close-donothing')?.addEventListener('click', () => closeModal(donothingModal));
    document.getElementById('btn-fluff-pillows')?.addEventListener('click', () => {
      state.pillowsFluffedCount = (state.pillowsFluffedCount || 0) + 1;
      onShowToast('🐚 Bantal kerang & bintang ditepuk empuk...');
      audioEngine.playUiTone(698.46, 0.2, 'sine');
      saveYawnCinemaState(state, 'akhira');
      onTriggerSparkle();
    });

    document.getElementById('btn-wrap-blanket')?.addEventListener('click', () => {
      state.blanketWrapped = !state.blanketWrapped;
      onShowToast(state.blanketWrapped ? '⭐ Akhira berselimut bintang hangat...' : '⭐ Selimut dibuka perlahan.');
      saveYawnCinemaState(state, 'akhira');
      applyAtmosphere();
      renderDoNothingCorner();
    });

    document.getElementById('btn-hug-whale-modal')?.addEventListener('click', () => {
      state.whaleHugged = !state.whaleHugged;
      onShowToast(state.whaleHugged ? '🐋 Boneka paus dipeluk erat...' : '🐋 Pelukan dilepaskan.');
      saveYawnCinemaState(state, 'akhira');
      applyAtmosphere();
      renderDoNothingCorner();
      onTriggerSparkle();
    });

    // Soundscape Modal Buttons
    document.getElementById('btn-close-soundscape')?.addEventListener('click', () => closeModal(soundscapeModal));
    document.getElementById('btn-stop-soundscape')?.addEventListener('click', () => {
      state.activeSoundscape = 'none';
      audioEngine.stopAllSoundscape();
      onShowToast('🔇 Hening total.');
      saveYawnCinemaState(state, 'akhira');
      applyAtmosphere();
      renderSoundscapeModal();
    });

    const volSlider = document.getElementById('input-soundscape-volume');
    volSlider?.addEventListener('input', (e) => {
      const v = Number(e.target.value);
      state.soundscapeVolume = v;
      audioEngine.setVolume(v);
      saveYawnCinemaState(state, 'akhira');
    });

    // Letters Modal Buttons
    document.getElementById('btn-close-letters')?.addEventListener('click', () => closeModal(lettersModal));
    document.getElementById('btn-new-letter')?.addEventListener('click', openNewLetterForm);
    document.getElementById('btn-cancel-letter')?.addEventListener('click', closeLetterEditor);
    document.getElementById('btn-save-letter')?.addEventListener('click', saveCurrentLetter);
    document.getElementById('btn-delete-letter')?.addEventListener('click', deleteCurrentLetter);

    // Close on backdrop click
    [playerModal, donothingModal, soundscapeModal, lettersModal].forEach(m => {
      m?.addEventListener('click', (e) => {
        if (e.target === m) closeModal(m);
      });
    });

    // Keyboard ESC
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (state.observationMode) {
          state.observationMode = false;
          applyAtmosphere();
          return;
        }
        const openM = [playerModal, donothingModal, soundscapeModal, lettersModal].find(m => m?.classList.contains('active'));
        if (openM) {
          closeModal(openM);
        }
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Lifecycle: Open & Close
  // ---------------------------------------------------------------------------
  function openYawnCinema(activeUser = null) {
    state = loadYawnCinemaState('akhira');
    viewEl.style.display = 'flex';
    viewEl.classList.add('active');
    viewEl.setAttribute('aria-hidden', 'false');

    applyAtmosphere();

    // Rest time counter interval
    if (restTimerInterval) clearInterval(restTimerInterval);
    restTimerInterval = setInterval(() => {
      state.restMinutesTotal = (state.restMinutesTotal || 0) + 1;
      saveYawnCinemaState(state, 'akhira');
      const timerBox = document.getElementById('ycinema-rest-timer-box');
      if (timerBox) {
        timerBox.textContent = `Telah beristirahat selama ${state.restMinutesTotal} menit yang tenang`;
      }
    }, 60000);

    // Initial audio resume if enabled
    if (state.activeSoundscape && state.activeSoundscape !== 'none') {
      audioEngine.setSoundscape(state.activeSoundscape);
    }

    onShowToast('🌌 Memasuki THE QUIET ABYSS — Istirahatlah sejenak, Akhira.');
    onTriggerSparkle();
  }

  function closeYawnCinema() {
    viewEl.style.display = 'none';
    viewEl.classList.remove('active');
    viewEl.setAttribute('aria-hidden', 'true');

    // Clean audio & visualizers
    audioEngine.stopAllSoundscape();
    stopFilmVisualizer();
    state.isPlayingFilm = false;
    closeAllModals();

    if (restTimerInterval) {
      clearInterval(restTimerInterval);
      restTimerInterval = null;
    }

    saveYawnCinemaState(state, 'akhira');
  }

  // Initial bindings
  bindEvents();

  return {
    openYawnCinema,
    closeYawnCinema,
    getState: () => state,
    audioEngine
  };
}
