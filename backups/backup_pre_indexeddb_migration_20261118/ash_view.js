/**
 * ASH World Controller — Ruben's Universe: The Dragon's Den
 *
 * Responsibilities:
 * 1. Full-screen view lifecycle & modal transitions.
 * 2. Canvas particle & creature rendering:
 *    - Majestic silver-purple dragon flying across the celestial moon.
 *    - Falling cherry blossom petals, crystal glimmer, nebula mist.
 * 3. Web Audio API fantasy orchestral synthesizer (zero dependencies, offline-ready).
 * 4. Eight interactive locations:
 *    - Ruben's Castle (Personal Profile & Memories, UID-scoped)
 *    - Civil Engineering Lab (Architectural blueprints & progress)
 *    - Anime & Music Room (Watchlist & K-pop favorites)
 *    - Gaming Zone (Gaming space & direct link to shared Games page)
 *    - Zen Garden (Pathways & peaceful relaxation)
 *    - Moon Gazebo (Moon view & ambient moments)
 *    - Dragon Observatory (Interactive telescope & constellation log)
 *    - Dragon Mailbox (Letters & messaging, UID-scoped)
 *    - Gallery & Collection (Shared integration)
 */

export function initAshWorld(options = {}) {
  const { onShowToast, onTriggerSparkle, onOpenResidence } = options;
  let activeUser = null;

  const RUBEN_UID = '9PMychPZ4rZ4PBCtZB9GiASttc52';
  const KEY_PROFILE = `olu_ruben_profile_${RUBEN_UID}`;
  const KEY_OBSERVATIONS = `olu_ruben_observations_${RUBEN_UID}`;
  const KEY_MAILBOX = `olu_ruben_mailbox_${RUBEN_UID}`;
  const KEY_ENGINEERING = `olu_ruben_engineering_${RUBEN_UID}`;
  const KEY_ANIME = `olu_ruben_anime_music_${RUBEN_UID}`;

  const viewWorld = document.getElementById('view-ash-world');
  const canvas = document.getElementById('ash-magic-canvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  let animFrameId = null;
  let isViewActive = false;

  // Visual Effect Pools
  let petals = [];
  let stardust = [];
  let dragonAngle = 0;

  // Audio Engine
  let audioCtx = null;
  let isPlaying = false;
  let currentTrackIdx = 0;
  let synthInterval = null;

  const PLAYLIST = [
    { title: 'Song of the Dragon King', sub: 'Majestic Strings & Harp • 68 BPM', roots: [220.0, 261.63, 329.63, 440.0] }, // A minor
    { title: 'Silver Moonlit Spire', sub: 'Gothic Nocturne • 76 BPM', roots: [293.66, 349.23, 440.0, 523.25] },         // D minor
    { title: 'Echoes of the Den', sub: 'Celestial Orchestral • 60 BPM', roots: [196.0, 246.94, 293.66, 392.0] }          // G major
  ];

  /* ==========================================================================
     1. WEB AUDIO API SYNTHESIZER (Fantasy Orchestral Ambience)
     ========================================================================== */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (AudioClass) {
        audioCtx = new AudioClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration = 1.8, type = 'sine', gainLevel = 0.07) {
    const actx = getAudioContext();
    if (!actx) return;

    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      const filter = actx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, actx.currentTime);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1600, actx.currentTime);

      gain.gain.setValueAtTime(0.0001, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, actx.currentTime + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(actx.destination);

      osc.start();
      osc.stop(actx.currentTime + duration);
    } catch {
      // Audio safety
    }
  }

  function playOrchestralChords() {
    const track = PLAYLIST[currentTrackIdx];
    if (!track) return;
    const notes = track.roots;
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (isPlaying) {
          playTone(freq, 2.4 + idx * 0.3, 'sine', 0.05);
          if (idx === 3) {
            playTone(freq * 1.5, 1.4, 'triangle', 0.025);
          }
        }
      }, idx * 300);
    });
  }

  function updateMusicUI() {
    const track = PLAYLIST[currentTrackIdx];
    const titleEl = document.getElementById('ash-music-title');
    const subEl = document.getElementById('ash-music-sub');
    const vinylEl = document.getElementById('ash-music-vinyl');
    const playIconEl = document.getElementById('ash-play-icon');

    if (titleEl) titleEl.textContent = track.title;
    if (subEl) subEl.textContent = track.sub;

    if (vinylEl) {
      if (isPlaying) vinylEl.classList.add('is-playing');
      else vinylEl.classList.remove('is-playing');
    }

    if (playIconEl) {
      playIconEl.textContent = isPlaying ? '⏸' : '▶';
    }
  }

  function toggleMusic() {
    isPlaying = !isPlaying;
    getAudioContext();

    if (isPlaying) {
      playOrchestralChords();
      if (synthInterval) clearInterval(synthInterval);
      synthInterval = setInterval(() => {
        if (isPlaying) playOrchestralChords();
      }, 3400);
    } else {
      if (synthInterval) clearInterval(synthInterval);
    }
    updateMusicUI();
  }

  function nextTrack() {
    currentTrackIdx = (currentTrackIdx + 1) % PLAYLIST.length;
    updateMusicUI();
    if (isPlaying) playOrchestralChords();
  }

  function prevTrack() {
    currentTrackIdx = (currentTrackIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
    updateMusicUI();
    if (isPlaying) playOrchestralChords();
  }

  /* ==========================================================================
     2. CANVAS CREATURE & PARTICLE SYSTEM (Dragon, Sakura Petals, Starlight)
     ========================================================================== */
  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initParticles();
  }

  function initParticles() {
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;

    // Cherry Blossom Petals
    petals = [];
    const petalCount = Math.floor(w / 40);
    for (let i = 0; i < petalCount; i++) {
      petals.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 6 + 4,
        speedX: Math.random() * 1.2 + 0.4,
        speedY: Math.random() * 1.0 + 0.5,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.04,
        alpha: Math.random() * 0.5 + 0.4
      });
    }

    // Stardust
    stardust = [];
    const starCount = Math.floor(w / 30);
    for (let i = 0; i < starCount; i++) {
      stardust.push({
        x: Math.random() * w,
        y: Math.random() * (h * 0.75),
        radius: Math.random() * 1.8 + 0.5,
        pulse: Math.random() * Math.PI,
        pulseSpeed: Math.random() * 0.05 + 0.02
      });
    }
  }

  function drawEffects() {
    if (!ctx || !canvas || !isViewActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    // A. Draw Flying Silver-Purple Dragon
    dragonAngle += 0.007;
    // Oval flight path around upper center / moon
    const centerX = w * 0.62;
    const centerY = h * 0.22;
    const radiusX = w * 0.22;
    const radiusY = h * 0.12;

    const dragonX = centerX + Math.cos(dragonAngle) * radiusX;
    const dragonY = centerY + Math.sin(dragonAngle * 2) * (radiusY * 0.6);

    ctx.save();
    ctx.translate(dragonX, dragonY);
    // Face direction of travel
    const angleTangent = Math.atan2(
      Math.cos(dragonAngle * 2) * (radiusY * 1.2),
      -Math.sin(dragonAngle) * radiusX
    );
    ctx.rotate(angleTangent);

    // Draw Sinuous Dragon Body with Multiple Segments
    ctx.beginPath();
    ctx.moveTo(35, 0);
    // Wing
    const wingSpan = Math.sin(dragonAngle * 12) * 18;
    ctx.lineTo(10, -wingSpan - 12);
    ctx.lineTo(-12, -4);
    // Body curves
    for (let seg = 1; seg <= 6; seg++) {
      const segX = -seg * 12;
      const wave = Math.sin(dragonAngle * 8 + seg * 0.6) * 6;
      ctx.lineTo(segX, wave);
    }
    ctx.strokeStyle = 'rgba(216, 180, 254, 0.85)';
    ctx.lineWidth = 3.5;
    ctx.shadowColor = 'rgba(192, 132, 252, 0.9)';
    ctx.shadowBlur = 16;
    ctx.stroke();

    // Dragon glowing eye
    ctx.beginPath();
    ctx.arc(30, -2, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 8;
    ctx.fill();

    ctx.restore();

    // B. Draw Stardust Particles
    for (const s of stardust) {
      s.pulse += s.pulseSpeed;
      const alpha = (Math.sin(s.pulse) + 1) * 0.45 + 0.1;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(233, 213, 255, ${alpha})`;
      ctx.shadowColor = 'rgba(216, 180, 254, 0.8)';
      ctx.shadowBlur = 6;
      ctx.fill();
    }

    // C. Draw Cherry Blossom Petals
    for (const p of petals) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotSpeed;

      if (p.y > h + 20) {
        p.y = -20;
        p.x = Math.random() * w;
      }
      if (p.x > w + 20) {
        p.x = -20;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(244, 114, 182, ${p.alpha})`;
      ctx.shadowColor = 'rgba(236, 72, 153, 0.5)';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    }

    animFrameId = requestAnimationFrame(drawEffects);
  }

  /* ==========================================================================
     3. MODAL MANAGEMENT & HOTSPOT WIRING
     ========================================================================== */
  function closeAllAshModals() {
    document.querySelectorAll('.ash-modal-overlay').forEach((m) => {
      m.classList.remove('active');
      m.setAttribute('aria-hidden', 'true');
    });
  }

  function openAshModal(modalId) {
    closeAllAshModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  /* ==========================================================================
     4. RUBEN CASTLE PROFILE PERSISTENCE (UID-Scoped)
     ========================================================================== */
  function loadRubenProfile() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY_PROFILE) || '{}');
      const bioEl = document.getElementById('ash-profile-bio');
      const hobbiesEl = document.getElementById('ash-profile-hobbies');
      const animeEl = document.getElementById('ash-profile-anime');
      const musicEl = document.getElementById('ash-profile-music');

      if (bioEl && data.bio !== undefined) bioEl.value = data.bio;
      if (hobbiesEl && data.hobbies !== undefined) hobbiesEl.value = data.hobbies;
      if (animeEl && data.anime !== undefined) animeEl.value = data.anime;
      if (musicEl && data.music !== undefined) musicEl.value = data.music;
    } catch {
      // Ignored
    }
  }

  function saveRubenProfile() {
    const bioEl = document.getElementById('ash-profile-bio');
    const hobbiesEl = document.getElementById('ash-profile-hobbies');
    const animeEl = document.getElementById('ash-profile-anime');
    const musicEl = document.getElementById('ash-profile-music');

    const profileData = {
      bio: bioEl ? bioEl.value.trim() : '',
      hobbies: hobbiesEl ? hobbiesEl.value.trim() : '',
      anime: animeEl ? animeEl.value.trim() : '',
      music: musicEl ? musicEl.value.trim() : '',
      updatedAt: Date.now()
    };

    try {
      localStorage.setItem(KEY_PROFILE, JSON.stringify(profileData));
      if (onShowToast) onShowToast('🏰 Profil Ruben di The Dragon\'s Den berhasil disimpan!');
    } catch {
      // Storage fallback
    }
  }

  /* ==========================================================================
     5. DRAGON OBSERVATORY (Interactive Telescope & Observations)
     ========================================================================== */
  const CELESTIAL_OBJECTS = [
    { name: 'Draco Constellation', symbol: '🐉', desc: 'Rasi naga kosmik yang melingkari kutub utara langit ASH.' },
    { name: 'Supermoon of Den', symbol: '🌕', desc: 'Bulan raksasa berpendar violet terang yang memancarkan energi magis.' },
    { name: 'Silver Nebula Ring', symbol: '💫', desc: 'Cincin kabut perak angkasa tempat naga menenun sayap cahayanya.' },
    { name: 'Phoenix of Ash', symbol: '✨', desc: 'Gugusan bintang kebangkitan api ungu di cakrawala barat.' }
  ];
  let currentObsIdx = 0;

  function updateObservatoryUI() {
    const obj = CELESTIAL_OBJECTS[currentObsIdx];
    const nameEl = document.getElementById('ash-obs-name');
    const symbolEl = document.getElementById('ash-obs-symbol');
    const descEl = document.getElementById('ash-obs-desc');

    if (nameEl) nameEl.textContent = obj.name;
    if (symbolEl) symbolEl.textContent = obj.symbol;
    if (descEl) descEl.textContent = obj.desc;
  }

  function logAstronomyObservation() {
    const obj = CELESTIAL_OBJECTS[currentObsIdx];
    try {
      const existing = JSON.parse(localStorage.getItem(KEY_OBSERVATIONS) || '[]');
      existing.unshift({
        name: obj.name,
        symbol: obj.symbol,
        dateStr: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now()
      });
      localStorage.setItem(KEY_OBSERVATIONS, JSON.stringify(existing));
      if (onShowToast) onShowToast(`🔭 Pengamatan ${obj.name} berhasil dicatat ke Jurnal Observatorium!`);
      renderAstronomyCollection();
    } catch {
      // Storage error fallback
    }
  }

  function renderAstronomyCollection() {
    const grid = document.getElementById('ash-collection-astronomy-grid');
    if (!grid) return;
    try {
      const logs = JSON.parse(localStorage.getItem(KEY_OBSERVATIONS) || '[]');
      if (logs.length === 0) {
        grid.innerHTML = '<p style="color:#cbd5e1; font-size:0.78rem; font-style:italic;">Belum ada catatan astronomi. Gunakan teleskop di Dragon Observatory untuk mengamati rasi bintang!</p>';
        return;
      }
      grid.innerHTML = logs.slice(0, 6).map((item) => `
        <div class="ash-artifact-item">
          <span class="ash-artifact-icon">${item.symbol}</span>
          <div class="ash-artifact-info">
            <h4>${item.name}</h4>
            <p>Diamati pada ${item.dateStr}</p>
          </div>
        </div>
      `).join('');
    } catch {
      grid.innerHTML = '';
    }
  }

  /* ==========================================================================
     6. DRAGON MAILBOX (UID-Scoped Letters)
     ========================================================================== */
  function renderMailboxLetters() {
    const listEl = document.getElementById('ash-mailbox-letters-list');
    if (!listEl) return;
    try {
      const letters = JSON.parse(localStorage.getItem(KEY_MAILBOX) || '[]');
      if (letters.length === 0) {
        listEl.innerHTML = `
          <div style="padding:14px; background:rgba(20,9,38,0.7); border-radius:12px; border:1px dashed rgba(216,180,254,0.3);">
            <h4 style="margin:0; font-size:0.86rem; color:#e9d5ff;">✉ Pesan Selamat Datang dari Penjaga Naga</h4>
            <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1; line-height:1.4;">
              "Selamat datang di The Dragon's Den, Ruben! Kastil melayang dan langit kosmik ini adalah tempat perlindungan pribadimu."
            </p>
            <span style="font-size:0.68rem; color:#c084fc; display:block; margin-top:6px;">Dari: Our Little Universe Keeper</span>
          </div>
        `;
        return;
      }
      listEl.innerHTML = letters.map((l) => `
        <div style="padding:12px; background:rgba(20,9,38,0.7); border-radius:12px; border:1px solid rgba(216,180,254,0.3); margin-bottom:8px;">
          <h4 style="margin:0; font-size:0.85rem; color:#ffffff;">${l.title || 'Surat Naga'}</h4>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1;">${l.body}</p>
          <span style="font-size:0.68rem; color:#c084fc; display:block; margin-top:4px;">${l.dateStr}</span>
        </div>
      `).join('');
    } catch {
      // Ignored
    }
  }

  function sendDragonLetter() {
    const input = document.getElementById('ash-input-letter-body');
    if (!input || !input.value.trim()) {
      if (onShowToast) onShowToast('⚠️ Tuliskan pesan sebelum mengirim!');
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem(KEY_MAILBOX) || '[]');
      existing.unshift({
        title: 'Surat Terkirim ke Angkasa',
        body: input.value.trim(),
        dateStr: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });
      localStorage.setItem(KEY_MAILBOX, JSON.stringify(existing));
      input.value = '';
      if (onShowToast) onShowToast('💌 Surat berhasil dikirim melintasi langit naga!');
      renderMailboxLetters();
    } catch {
      // Storage fallback
    }
  }

  /* ==========================================================================
     7. WIRE ALL EVENT LISTENERS
     ========================================================================== */
  function wireEvents() {
    // 8 Location Hotspots on Artwork
    document.querySelector('.btn-loc-ash-castle')?.addEventListener('click', () => {
      loadRubenProfile();
      openAshModal('ash-castle-modal');
    });

    document.getElementById('btn-ash-enter-dragon-den')?.addEventListener('click', () => {
      closeAllAshModals();
      if (typeof onOpenResidence === 'function') {
        onOpenResidence();
      }
    });

    document.querySelector('.btn-loc-ash-engineering')?.addEventListener('click', () => {
      openAshModal('ash-engineering-modal');
    });

    document.querySelector('.btn-loc-ash-observatory')?.addEventListener('click', () => {
      updateObservatoryUI();
      openAshModal('ash-observatory-modal');
    });

    document.querySelector('.btn-loc-ash-gazebo')?.addEventListener('click', () => {
      openAshModal('ash-gazebo-modal');
    });

    document.querySelector('.btn-loc-ash-garden')?.addEventListener('click', () => {
      openAshModal('ash-garden-modal');
    });

    document.querySelector('.btn-loc-ash-mailbox')?.addEventListener('click', () => {
      renderMailboxLetters();
      openAshModal('ash-mailbox-modal');
    });

    document.querySelector('.btn-loc-ash-gaming')?.addEventListener('click', () => {
      openAshModal('ash-gaming-modal');
    });

    document.querySelector('.btn-loc-ash-music')?.addEventListener('click', () => {
      openAshModal('ash-music-modal');
    });

    // Profile Save
    document.getElementById('btn-ash-save-profile')?.addEventListener('click', () => {
      saveRubenProfile();
      playTone(523.25, 0.4, 'sine', 0.05);
    });

    // Observatory Controls
    document.getElementById('btn-ash-cycle-constellation')?.addEventListener('click', () => {
      currentObsIdx = (currentObsIdx + 1) % CELESTIAL_OBJECTS.length;
      updateObservatoryUI();
      playTone(659.25, 0.4, 'sine', 0.04);
    });

    document.getElementById('btn-ash-log-constellation')?.addEventListener('click', () => {
      logAstronomyObservation();
      playTone(880.0, 0.5, 'triangle', 0.05);
    });

    // Mailbox Send
    document.getElementById('btn-ash-send-letter')?.addEventListener('click', sendDragonLetter);

    // Gaming Zone shortcut to global games
    document.getElementById('btn-ash-goto-games')?.addEventListener('click', () => {
      closeAshWorld();
      if (onShowToast) onShowToast('🎮 Membuka sistem Games bersama...');
      const gamesView = document.getElementById('view-games');
      if (gamesView) {
        document.querySelectorAll('.view-section').forEach((v) => v.classList.remove('active'));
        gamesView.classList.add('active');
      }
    });

    // Gazebo moment
    document.getElementById('btn-ash-gazebo-relax')?.addEventListener('click', () => {
      if (onShowToast) onShowToast('🌙 Menikmati panorama bulan raksasa dan semilir angin kosmik.');
      playTone(440.0, 0.6, 'sine', 0.04);
    });

    // Bottom Action: Gallery & Collection
    document.getElementById('btn-ash-gallery')?.addEventListener('click', () => {
      openAshModal('ash-gallery-modal');
    });

    document.getElementById('btn-ash-collection')?.addEventListener('click', () => {
      renderAstronomyCollection();
      openAshModal('ash-collection-modal');
    });

    // Settings
    document.getElementById('btn-ash-settings')?.addEventListener('click', () => {
      openAshModal('ash-settings-modal');
    });

    // Close buttons on all modals
    document.querySelectorAll('.ash-modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', closeAllAshModals);
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.ash-modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAllAshModals();
      });
    });

    // Music Player controls
    document.getElementById('btn-ash-music-play')?.addEventListener('click', toggleMusic);
    document.getElementById('btn-ash-music-next')?.addEventListener('click', nextTrack);
    document.getElementById('btn-ash-music-prev')?.addEventListener('click', prevTrack);

    // Settings BGM and reset actions
    document.getElementById('btn-ash-toggle-bgm')?.addEventListener('click', toggleMusic);
    document.getElementById('btn-ash-reset-data')?.addEventListener('click', () => {
      localStorage.removeItem(KEY_PROFILE);
      localStorage.removeItem(KEY_OBSERVATIONS);
      localStorage.removeItem(KEY_MAILBOX);
      localStorage.removeItem(KEY_ENGINEERING);
      localStorage.removeItem(KEY_ANIME);
      renderAstronomyCollection();
      renderMailboxLetters();
      loadRubenProfile();
      if (onShowToast) onShowToast('🧹 Seluruh data lokal Ruben di The Dragon\'s Den telah direset.');
    });

    // Top Navigation: Explore Universe & Story
    document.getElementById('btn-ash-top-explore')?.addEventListener('click', () => {
      closeAshWorld();
      if (typeof window.showUniversesView === 'function') {
        window.showUniversesView();
      } else {
        const univSection = document.getElementById('view-universes');
        if (univSection) {
          document.querySelectorAll('.view-section').forEach((v) => v.classList.remove('active'));
          univSection.classList.add('active');
        }
      }
    });

    document.getElementById('btn-ash-top-story')?.addEventListener('click', () => {
      if (onShowToast) onShowToast('📖 Membuka lembaran kisah ASH: The Dragon\'s Den...');
      closeAshWorld();
      if (window.storiesController && typeof window.storiesController.openOurStories === 'function') {
        window.storiesController.openOurStories('view-ash-world');
      } else {
        document.querySelectorAll('.view-section').forEach((v) => v.classList.remove('active'));
        const storiesSection = document.getElementById('view-our-stories');
        if (storiesSection) storiesSection.classList.add('active');
      }
    });

    window.addEventListener('resize', resizeCanvas);
  }

  /* ==========================================================================
     8. LIFECYCLE (Open / Close)
     ========================================================================== */
  function openAshWorld(user) {
    if (user) {
      activeUser = user;
    }
    isViewActive = true;
    if (viewWorld) {
      viewWorld.classList.add('active');
      viewWorld.setAttribute('aria-hidden', 'false');
    }

    // Set Ruben profile avatar
    const avatarEl = document.getElementById('ash-profile-avatar');
    if (avatarEl) {
      avatarEl.src = '/assets/card_ruben_hd.jpg';
    }

    resizeCanvas();
    updateMusicUI();
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(drawEffects);
    }

    if (onShowToast) {
      onShowToast("Selamat datang di Ruben's Universe — ASH ❄️ The Dragon's Den");
    }
  }

  function closeAshWorld() {
    closeAllAshModals();
    isViewActive = false;
    if (viewWorld) {
      viewWorld.classList.remove('active');
      viewWorld.setAttribute('aria-hidden', 'true');
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

  // Initialize event bindings
  wireEvents();

  return {
    openAshWorld,
    closeAshWorld
  };
}

