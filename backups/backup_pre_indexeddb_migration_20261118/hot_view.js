/**
 * OUR LITTLE UNIVERSE — ROYAN'S UNIVERSE: THE ENCHANTED ELVEN SANCTUARY (HOT 🎆)
 * Controller & Interactive Experience
 * Canonical Character: Royan
 * Canonical UID: swBN9XodDWRuHE5YbYmeoytrcAx2
 * Universe ID: hot (HOT)
 */

export function initHotWorld({ onShowToast, onTriggerSparkle, onOpenResidence } = {}) {
  const ROYAN_CANONICAL_UID = 'swBN9XodDWRuHE5YbYmeoytrcAx2';
  let activeUser = null;

  // DOM Elements
  const worldSection = document.getElementById('view-hot-world');
  const fxCanvas = document.getElementById('hot-fx-canvas');

  // Storage Keys Scoped to Royan's UID or Ephemeral Preview Mode
  let isPreviewMode = false;

  function getStorageKey(subKey) {
    return isPreviewMode 
      ? `olu_hot_preview_temp_${subKey}`
      : `olu_hot_${subKey}_${ROYAN_CANONICAL_UID}`;
  }

  /* ==========================================================================
     1. WEB AUDIO API SYNTHESIZER (Elven Forest Ambience, NO Autoplay)
     ========================================================================== */
  let audioCtx = null;
  let isPlaying = false;
  let currentTrackIdx = 0;
  let synthInterval = null;

  const PLAYLIST = [
    {
      title: 'Whispers of the Elven Wood',
      sub: 'Gentle Harp & Forest Wind • 58 BPM',
      tempo: 58,
      scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] // C Pentatonic Major
    },
    {
      title: 'Moonlit Waterfall Serenade',
      sub: 'Crystal Chimes & Soft Strings • 64 BPM',
      tempo: 64,
      scale: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00] // A Minor Pentatonic
    },
    {
      title: 'Twilight Embers & Stardust',
      sub: 'Lullaby Bells & Celestial Ambient • 52 BPM',
      tempo: 52,
      scale: [261.63, 311.13, 349.23, 392.00, 466.16, 523.25] // Minor 7th Ethereal
    }
  ];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playNote(freq, type = 'sine', duration = 1.8, gainLevel = 0.08) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  function startMusicLoop() {
    if (synthInterval) clearInterval(synthInterval);
    const track = PLAYLIST[currentTrackIdx];
    const beatInterval = (60 / track.tempo) * 1000;

    let step = 0;
    synthInterval = setInterval(() => {
      if (!isPlaying) return;
      const noteFreq = track.scale[step % track.scale.length];
      playNote(noteFreq, 'sine', 2.4, 0.07);

      if (step % 2 === 0) {
        playNote(track.scale[0] / 2, 'triangle', 3.0, 0.04);
      }
      step++;

      const fill = document.getElementById('hot-music-progress-fill');
      if (fill) {
        fill.style.width = `${((step % 32) / 32) * 100}%`;
      }
    }, beatInterval);
  }

  function updateMusicUI() {
    const playerEl = document.getElementById('hot-music-player');
    const playIcon = document.getElementById('hot-play-icon');
    const titleEl = document.getElementById('hot-music-title');
    const subEl = document.getElementById('hot-music-sub');
    const curTrack = PLAYLIST[currentTrackIdx];

    if (titleEl) titleEl.textContent = curTrack.title;
    if (subEl) subEl.textContent = curTrack.sub;

    if (playerEl) {
      playerEl.classList.toggle('is-playing', isPlaying);
    }
    if (playIcon) {
      playIcon.textContent = isPlaying ? '⏸' : '▶';
    }
  }

  function toggleMusic() {
    isPlaying = !isPlaying;
    if (isPlaying) {
      getAudioContext();
      startMusicLoop();
      if (onShowToast) onShowToast(`♫ Memutar: ${PLAYLIST[currentTrackIdx].title}`);
    } else {
      if (synthInterval) clearInterval(synthInterval);
      const fill = document.getElementById('hot-music-progress-fill');
      if (fill) fill.style.width = '0%';
    }
    updateMusicUI();
  }

  function nextTrack() {
    currentTrackIdx = (currentTrackIdx + 1) % PLAYLIST.length;
    updateMusicUI();
    if (isPlaying) startMusicLoop();
  }

  function prevTrack() {
    currentTrackIdx = (currentTrackIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
    updateMusicUI();
    if (isPlaying) startMusicLoop();
  }

  /* ==========================================================================
     2. CANVAS FX (Floating Fireflies, Falling Petals, Butterflies & Stardust)
     ========================================================================== */
  let animFrameId = null;
  let particles = [];

  function initParticles() {
    if (!fxCanvas) return;
    particles = [];
    const width = fxCanvas.width = window.innerWidth;
    const height = fxCanvas.height = window.innerHeight;

    // Fireflies & Stardust
    for (let i = 0; i < 40; i++) {
      particles.push({
        type: 'firefly',
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(192, 132, 252, ' : 'rgba(253, 224, 71, ',
        alpha: Math.random() * 0.7 + 0.3,
        speedX: (Math.random() - 0.5) * 0.45,
        speedY: (Math.random() - 0.5) * 0.35,
        pulseSpeed: Math.random() * 0.025 + 0.015
      });
    }

    // Drifting Blossom Petals
    for (let i = 0; i < 20; i++) {
      particles.push({
        type: 'petal',
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 5 + 4,
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        speedX: Math.random() * 0.4 + 0.2,
        speedY: Math.random() * 0.5 + 0.35,
        color: Math.random() > 0.5 ? 'rgba(244, 114, 182, 0.65)' : 'rgba(216, 180, 254, 0.65)'
      });
    }

    // Ethereal Butterflies
    for (let i = 0; i < 6; i++) {
      particles.push({
        type: 'butterfly',
        x: Math.random() * width,
        y: Math.random() * height,
        wingPhase: Math.random() * Math.PI * 2,
        wingSpeed: 0.15 + Math.random() * 0.1,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.5,
        color: 'rgba(233, 213, 255, 0.8)'
      });
    }
  }

  function renderParticles() {
    if (!fxCanvas) return;
    const ctx = fxCanvas.getContext('2d');
    if (!ctx) return;
    const width = fxCanvas.width;
    const height = fxCanvas.height;

    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      if (p.type === 'firefly') {
        p.x += p.speedX;
        p.y += p.speedY;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.015;
        p.alpha = Math.max(0.15, Math.min(0.9, p.alpha));

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#c084fc';
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.type === 'petal') {
        p.x += p.speedX;
        p.y += p.speedY;
        p.angle += p.rotSpeed;

        if (p.y > height) { p.y = -10; p.x = Math.random() * width; }
        if (p.x > width) p.x = 0;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#f472b6';
        ctx.fill();
        ctx.restore();
      } else if (p.type === 'butterfly') {
        p.x += p.speedX;
        p.y += p.speedY;
        p.wingPhase += p.wingSpeed;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.save();
        ctx.translate(p.x, p.y);
        const wingSpan = Math.abs(Math.sin(p.wingPhase)) * 8 + 2;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#c084fc';
        // Left wing
        ctx.beginPath();
        ctx.ellipse(-wingSpan / 2, 0, wingSpan / 2, 5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        // Right wing
        ctx.beginPath();
        ctx.ellipse(wingSpan / 2, 0, wingSpan / 2, 5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    animFrameId = requestAnimationFrame(renderParticles);
  }

  /* ==========================================================================
     3. MODAL MANAGEMENT & PERSISTENCE ENGINE
     ========================================================================== */
  function openModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.hot-modal-overlay').forEach(m => {
      m.classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
    });
  }

  /* --- 1. Elven Residence --- */
  function initResidence() {
    const key = getStorageKey('residence');
    const defaultData = {
      atmosphere: 'Cozy Warm Lantern',
      decor: 'Enchanted Moonlilies',
      diary: 'The gentle rain has stopped, and the stars are whispering through the wisteria leaves.'
    };
    let data = defaultData;
    try {
      const stored = localStorage.getItem(key);
      if (stored) data = { ...defaultData, ...JSON.parse(stored) };
    } catch (_) {}

    const atmoSelect = document.getElementById('hot-residence-atmo');
    const decorSelect = document.getElementById('hot-residence-decor');
    const diaryInput = document.getElementById('hot-residence-diary');
    if (atmoSelect) atmoSelect.value = data.atmosphere;
    if (decorSelect) decorSelect.value = data.decor;
    if (diaryInput) diaryInput.value = data.diary;

    const saveBtn = document.getElementById('btn-save-hot-residence');
    if (saveBtn) {
      saveBtn.onclick = () => {
        data.atmosphere = atmoSelect?.value || data.atmosphere;
        data.decor = decorSelect?.value || data.decor;
        data.diary = diaryInput?.value || data.diary;
        localStorage.setItem(key, JSON.stringify(data));
        if (onShowToast) {
          onShowToast(isPreviewMode 
            ? '✨ [Preview Mode] Suasana Elven Residence disimpan sementara (tidak mengubah data Royan)'
            : '🏡 Suasana & dekorasi Elven Residence berhasil disimpan ✨');
        }
        closeAllModals();
      };
    }
  }

  /* --- 2. Celestial Observatory --- */
  function initObservatory() {
    const key = getStorageKey('astronomy');
    let logs = [
      { date: 'Malam Purnama', target: 'The Silver Stag Constellation', note: 'Pendaran bintang sangat jernih di dekat bulan.' },
      { date: 'Malam Sabit', target: 'Twin Moons Horizon', note: 'Cahaya violet menyelimuti cakrawala utara.' }
    ];
    try {
      const stored = localStorage.getItem(key);
      if (stored) logs = JSON.parse(stored);
    } catch (_) {}

    const renderLogs = () => {
      const listEl = document.getElementById('hot-astronomy-logs');
      if (!listEl) return;
      listEl.innerHTML = logs.map(l => `
        <div style="background:rgba(18,11,35,0.6); padding:0.55rem; border-radius:8px; border:1px solid rgba(192,132,252,0.2); margin-bottom:0.4rem;">
          <div style="display:flex; justify-content:space-between; font-weight:700; color:#34d399; font-size:0.75rem;">
            <span>🔭 ${l.target}</span>
            <span style="color:#c4b5fd;">${l.date}</span>
          </div>
          <p style="margin:0.25rem 0 0; color:#e2d4f8; font-size:0.72rem;">${l.note}</p>
        </div>
      `).join('');
    };
    renderLogs();

    const logBtn = document.getElementById('btn-log-hot-astronomy');
    if (logBtn) {
      logBtn.onclick = () => {
        const targets = ['The Lotus Star Cluster', 'Dragon of Starlight', 'The Silver Stag', 'Twin Moons Horizon'];
        const chosen = targets[Math.floor(Math.random() * targets.length)];
        const newEntry = {
          date: 'Hari ini',
          target: chosen,
          note: `Pengamatan teleskop: ${chosen} memancarkan spektrum violet berkilau di langit HOT.`
        };
        logs.unshift(newEntry);
        if (logs.length > 6) logs.pop();
        localStorage.setItem(key, JSON.stringify(logs));
        renderLogs();
        playNote(523.25, 'sine', 1.8, 0.09);
        if (onShowToast) {
          onShowToast(isPreviewMode 
            ? `🔭 [Preview Mode] Catatan astronomi dicatat sementara: ${chosen}`
            : `🔭 Catatan astronomi baru ditambahkan: ${chosen} ✨`);
        }
      };
    }
  }

  /* --- 3. Enchanted Gazebo --- */
  function initGazebo() {
    const teaSelect = document.getElementById('hot-gazebo-tea');
    const brewBtn = document.getElementById('btn-hot-gazebo-brew');
    if (brewBtn) {
      brewBtn.onclick = () => {
        const tea = teaSelect?.value || 'Moonlight Chamomile';
        playNote(392.00, 'sine', 1.6, 0.08);
        if (onShowToast) onShowToast(`🌸 Seduhan ${tea} hangat siap dinikmati di Enchanted Gazebo ☕✨`);
      };
    }
  }

  /* --- 4. Elven Mailbox --- */
  function initMailbox() {
    const openMsgBtn = document.getElementById('btn-hot-open-messages');
    if (openMsgBtn) {
      openMsgBtn.onclick = () => {
        closeAllModals();
        // Switch to global Messages view
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        const msgView = document.getElementById('view-messages');
        if (msgView) {
          msgView.classList.add('active');
          msgView.setAttribute('aria-hidden', 'false');
        }
        if (onShowToast) onShowToast('💌 Membuka kotak pesan Our Little Messages ✧');
      };
    }
  }

  /* --- 5. Mystic Garden --- */
  function initGarden() {
    const key = getStorageKey('garden');
    let gardenState = {
      flower: 'Starlight Orchid',
      stage: 'Mekar Penuh 🌸',
      waterCount: 3
    };
    try {
      const stored = localStorage.getItem(key);
      if (stored) gardenState = JSON.parse(stored);
    } catch (_) {}

    const statusEl = document.getElementById('hot-garden-status');
    const updateUI = () => {
      if (statusEl) {
        statusEl.innerHTML = `
          <strong>Tanaman:</strong> ${gardenState.flower}<br>
          <strong>Kondisi:</strong> ${gardenState.stage}<br>
          <strong>Disiram:</strong> ${gardenState.waterCount} kali
        `;
      }
    };
    updateUI();

    const waterBtn = document.getElementById('btn-hot-garden-water');
    if (waterBtn) {
      waterBtn.onclick = () => {
        gardenState.waterCount++;
        playNote(440.00, 'sine', 1.5, 0.07);
        localStorage.setItem(key, JSON.stringify(gardenState));
        updateUI();
        if (onShowToast) {
          onShowToast(isPreviewMode 
            ? '💧 [Preview Mode] Bunga disiram sementara di Mystic Garden ✨'
            : '💧 Bunga-bunga di Mystic Garden disiram dengan air embun kristal ✨');
        }
      };
    }
  }

  /* --- 6. Gecko Sanctuary --- */
  function initGecko() {
    const key = getStorageKey('gecko');
    let gecko = {
      name: 'Kip',
      hunger: 'Kenyang (92%)',
      mood: 'Happy & Basking 🌿',
      temp: '26°C (Ideal)'
    };
    try {
      const stored = localStorage.getItem(key);
      if (stored) gecko = JSON.parse(stored);
    } catch (_) {}

    const updateUI = () => {
      const hEl = document.getElementById('hot-gecko-hunger');
      const mEl = document.getElementById('hot-gecko-mood');
      const tEl = document.getElementById('hot-gecko-temp');
      const sidePill = document.getElementById('hot-sidebar-pet-status');
      if (hEl) hEl.textContent = gecko.hunger;
      if (mEl) mEl.textContent = gecko.mood;
      if (tEl) tEl.textContent = gecko.temp;
      if (sidePill) sidePill.textContent = `🦎 Kip (${gecko.mood})`;
    };
    updateUI();

    const feedBtn = document.getElementById('btn-hot-gecko-feed');
    if (feedBtn) {
      feedBtn.onclick = () => {
        gecko.hunger = 'Kenyang (100%)';
        gecko.mood = 'Sangat Senang 🥰';
        playNote(349.23, 'sine', 1.2, 0.08);
        localStorage.setItem(key, JSON.stringify(gecko));
        updateUI();
        if (onShowToast) {
          onShowToast(isPreviewMode 
            ? '🦎 [Preview Mode] Kip menikmati camilan sementara ✨'
            : '🦎 Kip menikmati camilan jangkrik manis & madu buah! ✨');
        }
      };
    }

    const mistBtn = document.getElementById('btn-hot-gecko-mist');
    if (mistBtn) {
      mistBtn.onclick = () => {
        gecko.temp = '25°C (Lembap & Nyaman)';
        playNote(293.66, 'sine', 1.0, 0.07);
        localStorage.setItem(key, JSON.stringify(gecko));
        updateUI();
        if (onShowToast) {
          onShowToast(isPreviewMode 
            ? '💧 [Preview Mode] Terrarium disemprot embun sementara 🌿'
            : '💧 Terrarium disemprot embun lembut yang menyegarkan 🌿');
        }
      };
    }
  }

  /* --- 7. Lotus Pond --- */
  function initPond() {
    const feedFishBtn = document.getElementById('btn-hot-feed-fish');
    if (feedFishBtn) {
      feedFishBtn.onclick = () => {
        playNote(329.63, 'sine', 1.8, 0.08);
        if (onShowToast) onShowToast('🪷 Kawanan ikan koi teratai berenang riang mendekati permukaan air ✨');
      };
    }
  }

  /* --- 8. Crystal Waterfall --- */
  function initWaterfall() {
    const crystalNotes = [261.63, 329.63, 392.00, 523.25];
    document.querySelectorAll('.hot-crystal-tune-btn').forEach((btn, idx) => {
      btn.onclick = () => {
        const note = crystalNotes[idx % crystalNotes.length];
        playNote(note, 'sine', 2.2, 0.1);
        if (onShowToast) onShowToast(`✨ Resonansi Kristal: ${btn.getAttribute('data-crystal-name')} berbunyi harmonis ♫`);
      };
    });
  }

  /* --- Mood Picker (Minimalist Interactive Pills, Like Lele) --- */
  function initMood() {
    const key = getStorageKey('mood');
    const moods = ['Peaceful 🌿', 'Mischievous 🎆', 'Relaxed 🍵', 'Happy 🌸'];
    let curMood = localStorage.getItem(key) || moods[0];

    const updateMoodUI = () => {
      // 1. Update interactive mood pills active status
      document.querySelectorAll('.hot-mood-pill').forEach(pill => {
        const pMood = pill.getAttribute('data-mood');
        const isActive = (pMood === curMood);
        pill.classList.toggle('active', isActive);
        pill.setAttribute('aria-checked', isActive ? 'true' : 'false');
      });

      // 2. Update backward-compatibility alias
      const badge = document.getElementById('hot-profile-mood');
      if (badge) badge.textContent = curMood;
    };
    updateMoodUI();

    // Wire individual direct-click mood pills
    document.querySelectorAll('.hot-mood-pill').forEach(pill => {
      pill.onclick = (e) => {
        e.stopPropagation();
        const selected = pill.getAttribute('data-mood');
        if (!selected) return;
        curMood = selected;
        localStorage.setItem(key, curMood);
        updateMoodUI();
        playNote(440.00, 'sine', 1.2, 0.07);
        if (onTriggerSparkle) {
          const rect = pill.getBoundingClientRect();
          onTriggerSparkle(rect.left + rect.width / 2, rect.top + rect.height / 2);
        }
        if (onShowToast) {
          onShowToast(isPreviewMode 
            ? `[Preview Mode] Mood Royan: ${curMood} (sementara)`
            : `Mood Royan diperbarui: ${curMood} ✨`);
        }
      };
    });

    const moodBtn = document.getElementById('hot-profile-mood');
    if (moodBtn) {
      moodBtn.onclick = () => {
        const nextIdx = (moods.indexOf(curMood) + 1) % moods.length;
        curMood = moods[nextIdx];
        localStorage.setItem(key, curMood);
        updateMoodUI();
        playNote(440.00, 'sine', 1.2, 0.07);
        if (onShowToast) {
          onShowToast(isPreviewMode 
            ? `[Preview Mode] Mood Royan: ${curMood} (sementara)`
            : `Mood Royan diperbarui: ${curMood} ✨`);
        }
      };
    }
  }

  /* ==========================================================================
     4. EVENT LISTENERS WIRING
     ========================================================================== */
  function wireEvents() {
    // Hotspot button clicks
    const map = [
      { id: 'btn-loc-hot-residence', modal: 'hot-residence-modal' },
      { id: 'btn-loc-hot-observatory', modal: 'hot-observatory-modal' },
      { id: 'btn-loc-hot-gazebo', modal: 'hot-gazebo-modal' },
      { id: 'btn-loc-hot-mailbox', modal: 'hot-mailbox-modal' },
      { id: 'btn-loc-hot-garden', modal: 'hot-garden-modal' },
      { id: 'btn-loc-hot-gecko', modal: 'hot-gecko-modal' },
      { id: 'btn-loc-hot-pond', modal: 'hot-pond-modal' },
      { id: 'btn-loc-hot-waterfall', modal: 'hot-waterfall-modal' }
    ];

    map.forEach(item => {
      const btn = document.getElementById(item.id);
      if (btn) {
        if (item.id === 'btn-loc-hot-residence' && typeof onOpenResidence === 'function') {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            onOpenResidence();
          });
        } else {
          btn.addEventListener('click', () => openModal(item.modal));
        }
      }
    });

    // Close buttons
    document.querySelectorAll('.hot-modal-close-btn').forEach(btn => {
      btn.addEventListener('click', closeAllModals);
    });

    // Pet corner shortcut in sidebar
    const petShortcut = document.getElementById('hot-sidebar-pet-shortcut');
    if (petShortcut) {
      petShortcut.addEventListener('click', () => openModal('hot-gecko-modal'));
    }

    // Collection button in bottom bar
    const colBtn = document.getElementById('btn-hot-collection');
    if (colBtn) {
      colBtn.addEventListener('click', () => openModal('hot-collection-modal'));
    }

    // Pet Corner button in bottom bar
    const petBottomBtn = document.getElementById('btn-hot-pet-corner');
    if (petBottomBtn) {
      petBottomBtn.addEventListener('click', () => openModal('hot-gecko-modal'));
    }

    // Music controls
    const playBtn = document.getElementById('btn-hot-music-play');
    if (playBtn) playBtn.addEventListener('click', toggleMusic);

    const prevBtn = document.getElementById('btn-hot-music-prev');
    if (prevBtn) prevBtn.addEventListener('click', prevTrack);

    const nextBtn = document.getElementById('btn-hot-music-next');
    if (nextBtn) nextBtn.addEventListener('click', nextTrack);

    // Back to Universes selection button (← Universes)
    const backUniversesBtn = document.getElementById('btn-hot-back-universes');
    if (backUniversesBtn) {
      backUniversesBtn.addEventListener('click', () => {
        closeHotWorld();
        if (typeof window.showUniversesView === 'function') {
          window.showUniversesView();
        } else {
          document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
          const pu = document.getElementById('view-private-universe');
          if (pu) pu.classList.add('active');
        }
      });
    }

    // Global navigation pills (if present)
    const navUniverses = document.getElementById('btn-hot-nav-universes');
    if (navUniverses) {
      navUniverses.addEventListener('click', () => {
        closeHotWorld();
        if (typeof window.showUniversesView === 'function') {
          window.showUniversesView();
        }
      });
    }

    const navCalendar = document.getElementById('btn-hot-nav-calendar');
    if (navCalendar) {
      navCalendar.addEventListener('click', () => {
        closeHotWorld();
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById('view-orbit')?.classList.add('active');
      });
    }

    const navStories = document.getElementById('btn-hot-nav-stories');
    if (navStories) {
      navStories.addEventListener('click', () => {
        closeHotWorld();
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById('view-our-stories')?.classList.add('active');
      });
    }

    const navMessages = document.getElementById('btn-hot-nav-messages');
    if (navMessages) {
      navMessages.addEventListener('click', () => {
        closeHotWorld();
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById('view-messages')?.classList.add('active');
      });
    }

    const navGames = document.getElementById('btn-hot-nav-games');
    if (navGames) {
      navGames.addEventListener('click', () => {
        closeHotWorld();
        document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
        document.getElementById('view-games')?.classList.add('active');
      });
    }

    const navGallery = document.getElementById('btn-hot-nav-gallery');
    const bottomGallery = document.getElementById('btn-hot-gallery');
    const openGalleryHandler = () => {
      closeHotWorld();
      document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active'));
      const pbView = document.getElementById('view-photobooth') || document.getElementById('view-moments');
      if (pbView) pbView.classList.add('active');
    };
    if (navGallery) navGallery.addEventListener('click', openGalleryHandler);
    if (bottomGallery) bottomGallery.addEventListener('click', openGalleryHandler);

    window.addEventListener('resize', initParticles);
  }

  /* ==========================================================================
     5. LIFECYCLE (Open / Close)
     ========================================================================== */
  function openHotWorld(user = null, previewMode = false) {
    activeUser = user;
    isPreviewMode = Boolean(previewMode);

    const previewBadge = document.getElementById('hot-preview-badge');
    if (previewBadge) {
      previewBadge.style.display = isPreviewMode ? 'inline-flex' : 'none';
    }

    if (worldSection) {
      // Hide all other views first
      document.querySelectorAll('.view-section').forEach(v => {
        v.classList.remove('active');
        v.setAttribute('aria-hidden', 'true');
      });
      worldSection.classList.add('active');
      worldSection.setAttribute('aria-hidden', 'false');
    }

    initParticles();
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(renderParticles);
    }

    // Initialize sub-modules
    initResidence();
    initObservatory();
    initGazebo();
    initMailbox();
    initGarden();
    initGecko();
    initPond();
    initWaterfall();
    initMood();
    updateMusicUI();

    if (onShowToast) {
      if (isPreviewMode) {
        onShowToast("👁 PREVIEW MODE — Menjelajahi Royan's Universe (HOT 🎆) • Data aman terisolasi");
      } else {
        onShowToast("Selamat datang di Royan's Universe — HOT 🎆 The Enchanted Elven Sanctuary");
      }
    }
    if (onTriggerSparkle) {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  function closeHotWorld() {
    closeAllModals();
    if (worldSection) {
      worldSection.classList.remove('active');
      worldSection.setAttribute('aria-hidden', 'true');
    }
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (isPlaying) {
      isPlaying = false;
      if (synthInterval) clearInterval(synthInterval);
      updateMusicUI();
    }
  }

  // Self-wire events
  wireEvents();

  return {
    openHotWorld,
    closeHotWorld
  };
}

