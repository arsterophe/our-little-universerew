/**
 * YAWN World Controller — Akhira's Universe: Underwater Astral City
 *
 * Responsibilities:
 * 1. Full-screen view state & seamless modal transitions.
 * 2. Canvas particle animations: rising bubbles, glowing plankton, ethereal jellyfish, astral whale shadows.
 * 3. Web Audio API oceanic-astral music engine (zero copyright dependencies, offline-ready).
 * 4. Interactive locations:
 *    - My Residence (Castle)
 *    - Observatory (Astral Celestial Telescope & Constellation Log)
 *    - Gazebo (Moonlit Serenity Canopy & Peaceful Moments)
 *    - Cinema (Astral Starlight Theater & Feature Showcases)
 *    - Mailbox (Astral Seashell Post tied to Akhira's UID)
 *    - Gallery & Collection (UID-bound Astronomy & Deep Sea Relics)
 *    - Settings (Audio toggle, FX toggle, Reset Data)
 */

export function initYawnWorld(options = {}) {
  const { onShowToast } = options;

  const AKHIRA_UID = 'MT14ZHATNqe90frAeQ74QFk4iXs2';
  const STORAGE_KEY_ASTRONOMY = `olu_astronomy_log_${AKHIRA_UID}`;
  const STORAGE_KEY_LETTERS = `olu_yawn_mailbox_${AKHIRA_UID}`;

  const viewWorld = document.getElementById('view-yawn-world');
  const canvas = document.getElementById('yawn-magic-canvas');
  let ctx = canvas ? canvas.getContext('2d') : null;
  let animFrameId = null;
  let isViewActive = false;

  // Particle Pools
  let bubbles = [];
  let plankton = [];
  let jellyfishList = [];
  let astralWhale = null;

  // Audio Engine
  let audioCtx = null;
  let isPlaying = false;
  let currentTrackIdx = 0;
  let synthInterval = null;

  const PLAYLIST = [
    { title: 'Astral Ocean Waves', sub: 'Bioluminescent Ambient • 72 BPM', roots: [261.63, 329.63, 392.0, 523.25] }, // C major 7th / Astral
    { title: 'Starlight Deep Abyss', sub: 'Deep Sea Harmonics • 64 BPM', roots: [220.0, 277.18, 329.63, 440.0] },    // A minor / Celestial
    { title: 'Bioluminescent Dream', sub: 'Crystal Tide Melody • 80 BPM', roots: [293.66, 369.99, 440.0, 587.33] }   // D major / Ethereal
  ];

  /* ==========================================================================
     1. WEB AUDIO API SYNTHESIZER (Underwater Astral Ambience)
     ========================================================================== */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(freq, duration = 1.6, type = 'sine', gainLevel = 0.08) {
    const actx = getAudioContext();
    if (!actx) return;

    try {
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      const filter = actx.createBiquadFilter();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, actx.currentTime);

      // Lowpass filter for underwater warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, actx.currentTime);

      gain.gain.setValueAtTime(0.0001, actx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainLevel, actx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(actx.destination);

      osc.start();
      osc.stop(actx.currentTime + duration);
    } catch {
      // Audio autoplay policy fail-safe
    }
  }

  function playUnderwaterChord() {
    const track = PLAYLIST[currentTrackIdx];
    if (!track) return;
    const notes = track.roots;
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        if (isPlaying) {
          playTone(freq, 2.2 + idx * 0.4, 'sine', 0.05);
          // Harmonic overtone bell
          if (idx === 3) {
            playTone(freq * 1.5, 1.2, 'triangle', 0.02);
          }
        }
      }, idx * 320);
    });
  }

  function updateMusicUI() {
    const track = PLAYLIST[currentTrackIdx];
    const titleEl = document.getElementById('yawn-music-title');
    const subEl = document.getElementById('yawn-music-sub');
    const vinylEl = document.getElementById('yawn-music-vinyl');
    const playIconEl = document.getElementById('yawn-play-icon');

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
      playUnderwaterChord();
      if (synthInterval) clearInterval(synthInterval);
      synthInterval = setInterval(() => {
        if (isPlaying) playUnderwaterChord();
      }, 3400);
    } else {
      if (synthInterval) clearInterval(synthInterval);
    }
    updateMusicUI();
  }

  function nextTrack() {
    currentTrackIdx = (currentTrackIdx + 1) % PLAYLIST.length;
    updateMusicUI();
    if (isPlaying) {
      playUnderwaterChord();
    }
  }

  function prevTrack() {
    currentTrackIdx = (currentTrackIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
    updateMusicUI();
    if (isPlaying) {
      playUnderwaterChord();
    }
  }

  /* ==========================================================================
     2. CANVAS PARTICLE SYSTEM (Bubbles, Plankton, Jellyfish, Astral Whale)
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

    // Bubbles
    bubbles = [];
    const bubbleCount = Math.floor(w / 45);
    for (let i = 0; i < bubbleCount; i++) {
      bubbles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 4 + 1.5,
        speedY: Math.random() * 0.9 + 0.4,
        wobble: Math.random() * Math.PI * 2,
        wobbleSpeed: Math.random() * 0.03 + 0.015,
        alpha: Math.random() * 0.5 + 0.25
      });
    }

    // Plankton (Stardust)
    plankton = [];
    const planktonCount = Math.floor(w / 25);
    for (let i = 0; i < planktonCount; i++) {
      plankton.push({
        x: Math.random() * w,
        y: Math.random() * h,
        radius: Math.random() * 1.8 + 0.6,
        speedY: -(Math.random() * 0.3 + 0.1),
        speedX: (Math.random() - 0.5) * 0.3,
        pulse: Math.random() * Math.PI,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        color: Math.random() > 0.5 ? '125, 211, 252' : '192, 132, 252'
      });
    }

    // Jellyfish
    jellyfishList = [];
    for (let i = 0; i < 4; i++) {
      jellyfishList.push({
        x: (w * (i + 1)) / 5 + (Math.random() - 0.5) * 80,
        y: h * 0.4 + Math.random() * (h * 0.5),
        size: Math.random() * 14 + 18,
        pulse: Math.random() * Math.PI * 2,
        speedY: -(Math.random() * 0.4 + 0.25)
      });
    }

    // Astral Whale
    astralWhale = {
      x: -300,
      y: h * 0.16,
      speedX: 0.8,
      opacity: 0,
      active: false
    };
  }

  function drawParticles() {
    if (!ctx || !canvas || !isViewActive) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const w = canvas.width;
    const h = canvas.height;

    // A. Draw Astral Whale Silhouette
    if (astralWhale) {
      if (!astralWhale.active && Math.random() < 0.002) {
        astralWhale.active = true;
        astralWhale.x = -240;
        astralWhale.y = h * (0.08 + Math.random() * 0.14);
      }
      if (astralWhale.active) {
        astralWhale.x += astralWhale.speedX;
        if (astralWhale.x > w + 260) {
          astralWhale.active = false;
        }

        // Draw luminous whale body
        ctx.save();
        ctx.beginPath();
        const wx = astralWhale.x;
        const wy = astralWhale.y;
        ctx.ellipse(wx, wy, 80, 24, -0.05, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(186, 230, 253, 0.15)';
        ctx.shadowColor = 'rgba(56, 189, 248, 0.8)';
        ctx.shadowBlur = 18;
        ctx.fill();

        // Tail fluke
        ctx.beginPath();
        ctx.moveTo(wx - 75, wy);
        ctx.lineTo(wx - 105, wy - 18);
        ctx.lineTo(wx - 95, wy);
        ctx.lineTo(wx - 105, wy + 18);
        ctx.closePath();
        ctx.fillStyle = 'rgba(186, 230, 253, 0.2)';
        ctx.fill();
        ctx.restore();
      }
    }

    // B. Draw Plankton
    for (const p of plankton) {
      p.x += p.speedX;
      p.y += p.speedY;
      p.pulse += p.pulseSpeed;

      if (p.y < 0) p.y = h;
      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;

      const alpha = (Math.sin(p.pulse) + 1) * 0.4 + 0.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color}, ${alpha})`;
      ctx.shadowColor = `rgba(${p.color}, 0.8)`;
      ctx.shadowBlur = 6;
      ctx.fill();
    }

    // C. Draw Jellyfish
    for (const j of jellyfishList) {
      j.pulse += 0.035;
      j.y += j.speedY;
      j.x += Math.sin(j.pulse * 0.5) * 0.35;

      if (j.y < -50) {
        j.y = h + 40;
        j.x = Math.random() * w;
      }

      ctx.save();
      const expand = 1 + Math.sin(j.pulse) * 0.15;
      const jw = j.size * expand;
      const jh = j.size * 0.75;

      // Bell cap
      ctx.beginPath();
      ctx.ellipse(j.x, j.y, jw, jh, 0, Math.PI, 0);
      ctx.fillStyle = 'rgba(192, 132, 252, 0.22)';
      ctx.shadowColor = 'rgba(56, 189, 248, 0.6)';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.45)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Tentacles
      for (let t = -2; t <= 2; t++) {
        ctx.beginPath();
        ctx.moveTo(j.x + t * (jw * 0.35), j.y);
        const wave = Math.sin(j.pulse + t) * 6;
        ctx.quadraticCurveTo(j.x + t * (jw * 0.35) + wave, j.y + jh * 1.5, j.x + t * (jw * 0.35) - wave, j.y + jh * 2.8);
        ctx.strokeStyle = 'rgba(125, 211, 252, 0.3)';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();
    }

    // D. Draw Bubbles
    for (const b of bubbles) {
      b.wobble += b.wobbleSpeed;
      b.x += Math.sin(b.wobble) * 0.5;
      b.y -= b.speedY;

      if (b.y < -20) {
        b.y = h + 20;
        b.x = Math.random() * w;
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(186, 230, 253, ${b.alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Bubble highlight glint
      ctx.beginPath();
      ctx.arc(b.x - b.radius * 0.3, b.y - b.radius * 0.3, b.radius * 0.25, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      ctx.restore();
    }

    animFrameId = requestAnimationFrame(drawParticles);
  }

  /* ==========================================================================
     3. MODAL MANAGEMENT & HOTSPOT WIRING
     ========================================================================== */
  function closeAllYawnModals() {
    document.querySelectorAll('.yawn-modal-overlay').forEach((m) => {
      m.classList.remove('active');
      m.setAttribute('aria-hidden', 'true');
    });
  }

  function openYawnModal(modalId) {
    closeAllYawnModals();
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
    }
  }

  /* ==========================================================================
     4. ASTRONOMY OBSERVATORY INTERACTION (UID-Bound Log)
     ========================================================================== */
  const CONSTELLATIONS = [
    { name: 'Aquarius Astral', symbol: '♒', desc: 'Rasi pembawa aliran air kosmik abadi.' },
    { name: 'Whale of Cetus', symbol: '🐋', desc: 'Rasi sang paus bintang penjaga kedalaman laut.' },
    { name: 'Star Jellyfish', symbol: '🪼', desc: 'Rasi ubur-ubur bercahaya pembimbing pelaut mimpi.' },
    { name: 'Nebula Coralia', symbol: '🪸', desc: 'Awan nebula merah muda berbentuk terumbu karang kosmik.' }
  ];
  let currentConstellationIdx = 0;

  function updateConstellationUI() {
    const c = CONSTELLATIONS[currentConstellationIdx];
    const nameEl = document.getElementById('yawn-constellation-name');
    const symbolEl = document.getElementById('yawn-constellation-symbol');
    const descEl = document.getElementById('yawn-constellation-desc');

    if (nameEl) nameEl.textContent = c.name;
    if (symbolEl) symbolEl.textContent = c.symbol;
    if (descEl) descEl.textContent = c.desc;
  }

  function logAstronomyObservation() {
    const c = CONSTELLATIONS[currentConstellationIdx];
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_ASTRONOMY) || '[]');
      const entry = {
        name: c.name,
        symbol: c.symbol,
        timestamp: Date.now(),
        dateStr: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      existing.unshift(entry);
      localStorage.setItem(STORAGE_KEY_ASTRONOMY, JSON.stringify(existing));
      if (onShowToast) onShowToast(`✨ Pengamatan tercatat: ${c.name} telah disimpan ke Jurnal Astronomi!`);
      renderAstronomyCollection();
    } catch {
      // Storage fallback
    }
  }

  function renderAstronomyCollection() {
    const grid = document.getElementById('yawn-collection-astronomy-grid');
    if (!grid) return;
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEY_ASTRONOMY) || '[]');
      if (logs.length === 0) {
        grid.innerHTML = '<p style="color:#94a3b8; font-size:0.8rem; font-style:italic;">Belum ada catatan astronomi. Gunakan teleskop di Observatory untuk mengamati rasi bintang!</p>';
        return;
      }
      grid.innerHTML = logs.slice(0, 6).map((item) => `
        <div class="yawn-artifact-item">
          <span class="yawn-artifact-icon">${item.symbol}</span>
          <div class="yawn-artifact-info">
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
     5. MAILBOX INTERACTION (UID-Bound Letters)
     ========================================================================== */
  function renderMailboxLetters() {
    const listEl = document.getElementById('yawn-mailbox-letters-list');
    if (!listEl) return;
    try {
      const letters = JSON.parse(localStorage.getItem(STORAGE_KEY_LETTERS) || '[]');
      if (letters.length === 0) {
        listEl.innerHTML = `
          <div style="padding:14px; background:rgba(8,24,62,0.6); border-radius:12px; border:1px dashed rgba(125,211,252,0.3);">
            <h4 style="margin:0; font-size:0.86rem; color:#bae6fd;">✉ Sambutan Hangat dari Seluruh Universe</h4>
            <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1; line-height:1.4;">
              "Halo Akhira! Selamat datang di kota bawah laut astral YAWN. Bintang-bintang bawah laut bersinar menyambutmu."
            </p>
            <span style="font-size:0.68rem; color:#38bdf8; display:block; margin-top:6px;">Dari: Penduduk Our Little Universe</span>
          </div>
        `;
        return;
      }
      listEl.innerHTML = letters.map((l) => `
        <div style="padding:12px; background:rgba(8,24,62,0.6); border-radius:12px; border:1px solid rgba(125,211,252,0.3); margin-bottom:8px;">
          <h4 style="margin:0; font-size:0.85rem; color:#ffffff;">${l.title || 'Surat Astral'}</h4>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1;">${l.body}</p>
          <span style="font-size:0.68rem; color:#38bdf8; display:block; margin-top:4px;">${l.dateStr}</span>
        </div>
      `).join('');
    } catch {
      // Ignored
    }
  }

  function sendAstralLetter() {
    const input = document.getElementById('yawn-input-letter-body');
    if (!input || !input.value.trim()) {
      if (onShowToast) onShowToast('⚠️ Tuliskan pesanmu sebelum mengirim!');
      return;
    }
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY_LETTERS) || '[]');
      existing.unshift({
        title: 'Surat Terkirim ke Samudra',
        body: input.value.trim(),
        dateStr: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })
      });
      localStorage.setItem(STORAGE_KEY_LETTERS, JSON.stringify(existing));
      input.value = '';
      if (onShowToast) onShowToast('💌 Surat astral berhasil dikirim dan dihanyutkan ke arus bintang!');
      renderMailboxLetters();
    } catch {
      // Storage fallback
    }
  }

  /* ==========================================================================
     6. WIRE ALL EVENT LISTENERS
     ========================================================================== */
  function wireEvents() {
    // 6 Hotspots on Artwork
    document.querySelector('.btn-loc-yawn-residence')?.addEventListener('click', () => {
      if (typeof options.onOpenResidence === 'function') {
        options.onOpenResidence();
      } else {
        openYawnModal('yawn-residence-modal');
      }
    });

    document.getElementById('btn-yawn-enter-palace')?.addEventListener('click', () => {
      closeAllYawnModals();
      if (typeof options.onOpenResidence === 'function') {
        options.onOpenResidence();
      }
    });

    document.querySelector('.btn-loc-yawn-observatory')?.addEventListener('click', () => {
      updateConstellationUI();
      openYawnModal('yawn-observatory-modal');
    });

    document.querySelector('.btn-loc-yawn-gazebo')?.addEventListener('click', () => {
      openYawnModal('yawn-gazebo-modal');
    });

    document.querySelector('.btn-loc-yawn-cinema')?.addEventListener('click', () => {
      openYawnModal('yawn-cinema-modal');
    });

    document.querySelector('.btn-loc-yawn-mailbox')?.addEventListener('click', () => {
      renderMailboxLetters();
      openYawnModal('yawn-mailbox-modal');
    });

    // Observatory interactions
    document.getElementById('btn-yawn-cycle-constellation')?.addEventListener('click', () => {
      currentConstellationIdx = (currentConstellationIdx + 1) % CONSTELLATIONS.length;
      updateConstellationUI();
      playTone(659.25, 0.4, 'sine', 0.04);
    });

    document.getElementById('btn-yawn-log-constellation')?.addEventListener('click', () => {
      logAstronomyObservation();
      playTone(880.0, 0.6, 'triangle', 0.05);
    });

    // Mailbox send button
    document.getElementById('btn-yawn-send-letter')?.addEventListener('click', () => {
      sendAstralLetter();
    });

    // Cinema seat reservation interaction
    document.getElementById('btn-yawn-cinema-reserve')?.addEventListener('click', () => {
      if (onShowToast) onShowToast('🎟 Kursi VIP Pearl Lounger berhasil dipesan untuk Akhira!');
      playTone(523.25, 0.5, 'sine', 0.04);
    });

    // Gazebo tea moment
    document.getElementById('btn-yawn-gazebo-tea')?.addEventListener('click', () => {
      if (onShowToast) onShowToast('🍵 Secangkir teh karang aromatik disajikan. Nikmati keheningan.');
      playTone(392.0, 0.6, 'sine', 0.04);
    });

    // Gallery & Collection
    document.getElementById('btn-yawn-gallery')?.addEventListener('click', () => {
      openYawnModal('yawn-gallery-modal');
    });

    document.getElementById('btn-yawn-collection')?.addEventListener('click', () => {
      renderAstronomyCollection();
      openYawnModal('yawn-collection-modal');
    });

    // Settings
    document.getElementById('btn-yawn-settings')?.addEventListener('click', () => {
      openYawnModal('yawn-settings-modal');
    });

    // Close buttons on all modals
    document.querySelectorAll('.yawn-modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', closeAllYawnModals);
    });

    // Close on overlay backdrop click
    document.querySelectorAll('.yawn-modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeAllYawnModals();
      });
    });

    // Music Player controls
    document.getElementById('btn-yawn-music-play')?.addEventListener('click', toggleMusic);
    document.getElementById('btn-yawn-music-next')?.addEventListener('click', nextTrack);
    document.getElementById('btn-yawn-music-prev')?.addEventListener('click', prevTrack);

    // Settings action buttons
    document.getElementById('btn-yawn-toggle-bgm')?.addEventListener('click', toggleMusic);

    document.getElementById('btn-yawn-reset-data')?.addEventListener('click', () => {
      localStorage.removeItem(STORAGE_KEY_ASTRONOMY);
      localStorage.removeItem(STORAGE_KEY_LETTERS);
      renderAstronomyCollection();
      renderMailboxLetters();
      if (onShowToast) onShowToast('🧹 Data pengamatan dan surat astral Akhira telah direset.');
    });

    // Top Navigation: Explore Universe & Story
    document.getElementById('btn-yawn-top-explore')?.addEventListener('click', () => {
      closeYawnWorld();
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

    document.getElementById('btn-yawn-top-story')?.addEventListener('click', () => {
      if (onShowToast) onShowToast('📖 Membuka lembaran kisah YAWN: Underwater Astral City...');
      closeYawnWorld();
      if (window.storiesController && typeof window.storiesController.openOurStories === 'function') {
        window.storiesController.openOurStories('view-yawn-world');
      } else {
        document.querySelectorAll('.view-section').forEach((v) => v.classList.remove('active'));
        const storiesSection = document.getElementById('view-our-stories');
        if (storiesSection) storiesSection.classList.add('active');
      }
    });

    window.addEventListener('resize', resizeCanvas);
  }

  /* ==========================================================================
     7. LIFECYCLE (Open / Close)
     ========================================================================== */
  function openYawnWorld() {
    isViewActive = true;
    if (viewWorld) {
      viewWorld.classList.add('active');
      viewWorld.setAttribute('aria-hidden', 'false');
    }

    // Ensure Akhira avatar matches login card
    const avatarEl = document.getElementById('yawn-profile-avatar');
    if (avatarEl) {
      avatarEl.src = '/assets/card_akhira_hd.jpg';
    }

    resizeCanvas();
    updateMusicUI();
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(drawParticles);
    }

    if (onShowToast) {
      onShowToast("Selamat datang di Akhira's Universe — YAWN ⚡ Underwater Astral City");
    }
  }

  function closeYawnWorld() {
    closeAllYawnModals();
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

  // Initialize events on instantiation
  wireEvents();

  return {
    openYawnWorld,
    closeYawnWorld
  };
}

