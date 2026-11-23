/**
 * PINWHEEL — SYMA'S UNIVERSE: THE NINE TAILED SANCTUARY
 *
 * Full Interactive Controller:
 * 1. Web Audio API Music Player (Moonlight Whispers, Sakura Rainfall, Nine-Tailed Dream)
 * 2. Canvas FX (Sakura Petals, Fireflies, Starlight & Pond Swimming Fish)
 * 3. Interactive Fishing Pond Mini-Game with UID-bound persistence
 * 4. Locations modals: Residence, Observatory, Studio, Gazebo, Fishing Pond, Cat Garden, Mailbox
 * 5. Bottom action buttons: Gallery & Collection
 * 6. Top nav: Explore Universe, Story, Syma Profile & Settings
 */

import { CANONICAL_CHARACTERS, dbSubscribeLetters, dbFetchLetters } from './firebase.js';
import { initCatGardenController } from './cat_garden.js';
import { initFishingPondController } from './fishing_pond.js';
import { initPinwheelGazeboView } from './pinwheel_gazebo_view.js';
import { initPinwheelPhotographyView } from './pinwheel_photography_view.js';
import { initPinwheelVisionStudioView } from './pinwheel_vision_studio_view.js';
import { initPinwheelResidenceView } from './pinwheel_residence_view.js';

// Default Syma UID (from Firebase Authentication)
const SYMA_CANONICAL_UID = 'Euc0JLt3kWMveUEIjBwXHfOfvQD3';

// Music Tracks for The Nine Tailed Sanctuary
const MUSIC_TRACKS = [
  { title: 'Moonlight Whispers', sub: 'Now Playing ♫', scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] },
  { title: 'Sakura Rainfall', sub: 'Now Playing ♫', scale: [329.63, 349.23, 392.00, 493.88, 523.25, 659.25] },
  { title: 'Nine-Tailed Dream', sub: 'Now Playing ♫', scale: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00] }
];

// Fish Species for the Fishing Pond
const FISH_SPECIES = [
  { name: 'Golden Koi', localName: 'Ikan Koi Emas Berkilau', icon: '🐟', rarity: 'Rare', minLen: 35, maxLen: 58 },
  { name: 'Moonlight Carp', localName: 'Ikan Karper Perak Bulan', icon: '🌙', rarity: 'Uncommon', minLen: 28, maxLen: 46 },
  { name: 'Sakura Betta', localName: 'Ikan Cupang Bunga Sakura', icon: '🌸', rarity: 'Common', minLen: 6, maxLen: 12 },
  { name: 'Violet Dragonscale', localName: 'Ikan Sisik Naga Violet', icon: '💜', rarity: 'Epic', minLen: 42, maxLen: 65 },
  { name: 'Celestial Starlight Guppy', localName: 'Guppy Cahaya Bintang', icon: '🌟', rarity: 'Legendary', minLen: 5, maxLen: 10 }
];

export function initPinwheelWorld(options = {}) {
  const { onShowToast, onTriggerSparkle, onNavigateStarMessages, onNavigateKotakPos, onOpenResidence } = options;

  let audioCtx = null;
  let isPlayingMusic = false;
  let currentTrackIndex = 0;
  let musicTimer = null;
  let musicProgress = 0;
  let musicProgressTimer = null;

  let canvas = null;
  let ctx = null;
  let animFrameId = null;
  let petals = [];
  let fireflies = [];
  let fishList = [];
  let isSakuraEnabled = true;

  // Fishing state
  let fishingState = 'idle'; // 'idle' | 'cast' | 'biting' | 'caught'
  let biteTimer = null;
  let biteExpiryTimer = null;
  let currentActiveUid = SYMA_CANONICAL_UID;

  // DOM Elements
  const viewWorld = document.getElementById('view-pinwheel-world');
  const btnTopExplore = document.getElementById('btn-pinwheel-top-explore');
  const btnTopStory = document.getElementById('btn-pinwheel-top-story');
  const btnSettings = document.getElementById('btn-pinwheel-settings');

  // Music Player DOM
  const vinylEl = document.getElementById('pinwheel-music-vinyl');
  const musicTitleEl = document.getElementById('pinwheel-music-title');
  const musicSubEl = document.getElementById('pinwheel-music-sub');
  const progressFillEl = document.getElementById('pinwheel-music-progress-fill');
  const btnPlay = document.getElementById('btn-music-play');
  const btnPrev = document.getElementById('btn-music-prev');
  const btnNext = document.getElementById('btn-music-next');

  // Big Action Buttons
  const btnGallery = document.getElementById('btn-pinwheel-gallery');
  const btnCollection = document.getElementById('btn-pinwheel-collection');

  // Location Buttons
  const locButtons = document.querySelectorAll('.pinwheel-loc-btn[data-pinwheel-loc]');

  // Modals
  const modalFishing = document.getElementById('pinwheel-fishing-modal');
  const modalResidence = document.getElementById('pinwheel-residence-modal');
  const modalObservatory = document.getElementById('pinwheel-observatory-modal');
  const modalStudio = document.getElementById('pinwheel-studio-modal');
  const modalGazebo = document.getElementById('pinwheel-gazebo-modal');
  const modalCatGarden = document.getElementById('pinwheel-catgarden-modal');
  const modalMailbox = document.getElementById('pinwheel-mailbox-modal');
  const modalGallery = document.getElementById('pinwheel-gallery-modal');
  const modalCollection = document.getElementById('pinwheel-collection-modal');
  const modalSettings = document.getElementById('pinwheel-settings-modal');

  // Fishing UI Elements
  const btnFishAction = document.getElementById('btn-fish-action');
  const fishActionLabel = document.getElementById('fish-action-label');
  const fishingBobber = document.getElementById('fishing-bobber');
  const fishingBiteAlert = document.getElementById('fishing-bite-alert');
  const fishingStatusHint = document.getElementById('fishing-status-hint');
  const recentCatchesGrid = document.getElementById('pinwheel-recent-catches-grid');
  const allFishGrid = document.getElementById('collection-all-fish-grid');
  const fishCountBadge = document.getElementById('fish-count-badge');

  // =========================================================================
  // 1. WEB AUDIO API SYNTHESIZER (COPYRIGHT-FREE ORIGINAL JAPANESE FANTASY)
  // =========================================================================
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

  function playTone(freq, duration = 1.2, type = 'sine', gainVal = 0.12) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(gainVal, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  // Initialize Cat Care Simulator Controller
  const catGardenCtrl = typeof initCatGardenController === 'function' ? initCatGardenController({
    onShowToast,
    onTriggerSparkle,
    getAudioCtx: getAudioContext,
    activeUid: SYMA_CANONICAL_UID
  }) : null;

  // Initialize The Whispering Pond Fishing Simulator Controller
  const fishingPondCtrl = typeof initFishingPondController === 'function' ? initFishingPondController({
    onShowToast,
    onTriggerSparkle
  }) : null;

  // Initialize Moonlit Blossom Gazebo Controller
  const pinwheelGazeboCtrl = typeof initPinwheelGazeboView === 'function' ? initPinwheelGazeboView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const pw = document.getElementById('view-pinwheel-world');
      if (pw) {
        pw.classList.add('active');
        pw.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;

  // Initialize Photography & Vision Studio Controllers
  const pinwheelPhotoCtrl = typeof initPinwheelPhotographyView === 'function' ? initPinwheelPhotographyView({
    onShowToast,
    onNavigateBack: () => {
      const pw = document.getElementById('view-pinwheel-world');
      if (pw) {
        pw.classList.add('active');
        pw.setAttribute('aria-hidden', 'false');
      }
    },
    onSwitchToVisionStudio: () => {
      if (pinwheelVisionCtrl && typeof pinwheelVisionCtrl.openVisionStudio === 'function') {
        pinwheelVisionCtrl.openVisionStudio(currentActiveUid);
      }
    }
  }) : null;

  const pinwheelVisionCtrl = typeof initPinwheelVisionStudioView === 'function' ? initPinwheelVisionStudioView({
    onShowToast,
    onNavigateBack: () => {
      const pw = document.getElementById('view-pinwheel-world');
      if (pw) {
        pw.classList.add('active');
        pw.setAttribute('aria-hidden', 'false');
      }
    },
    onSwitchToPhotography: () => {
      if (pinwheelPhotoCtrl && typeof pinwheelPhotoCtrl.openPhotography === 'function') {
        pinwheelPhotoCtrl.openPhotography(currentActiveUid);
      }
    }
  }) : null;

  // Initialize The Windwhisper Residence Controller
  const pinwheelResidenceCtrl = typeof initPinwheelResidenceView === 'function' ? initPinwheelResidenceView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const pw = document.getElementById('view-pinwheel-world');
      if (pw) {
        pw.classList.add('active');
        pw.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;

  function startMusicMelody() {
    if (musicTimer) clearInterval(musicTimer);
    const track = MUSIC_TRACKS[currentTrackIndex];
    let noteIdx = 0;

    musicTimer = setInterval(() => {
      if (!isPlayingMusic) return;
      const freq = track.scale[noteIdx % track.scale.length];
      playTone(freq, 1.4, 'sine', 0.08);
      // Occasional chime
      if (Math.random() > 0.6) {
        setTimeout(() => {
          if (isPlayingMusic) playTone(freq * 1.5, 0.8, 'triangle', 0.04);
        }, 300);
      }
      noteIdx = (noteIdx + Math.floor(Math.random() * 2) + 1);
    }, 750);

    // Progress bar loop
    if (musicProgressTimer) clearInterval(musicProgressTimer);
    musicProgressTimer = setInterval(() => {
      if (!isPlayingMusic) return;
      musicProgress = (musicProgress + 1) % 100;
      if (progressFillEl) progressFillEl.style.width = `${musicProgress}%`;
    }, 600);
  }

  function toggleMusicPlayback() {
    isPlayingMusic = !isPlayingMusic;
    getAudioContext();
    if (isPlayingMusic) {
      vinylEl?.classList.add('is-playing');
      if (btnPlay) btnPlay.textContent = '⏸';
      startMusicMelody();
      if (onShowToast) onShowToast(`♫ Memutar musik: ${MUSIC_TRACKS[currentTrackIndex].title}`);
    } else {
      vinylEl?.classList.remove('is-playing');
      if (btnPlay) btnPlay.textContent = '▶';
      if (musicTimer) clearInterval(musicTimer);
      if (musicProgressTimer) clearInterval(musicProgressTimer);
    }
  }

  function changeTrack(direction = 1) {
    currentTrackIndex = (currentTrackIndex + direction + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
    const track = MUSIC_TRACKS[currentTrackIndex];
    if (musicTitleEl) musicTitleEl.textContent = track.title;
    if (musicSubEl) musicSubEl.textContent = track.sub;
    musicProgress = 0;
    if (progressFillEl) progressFillEl.style.width = '0%';
    if (isPlayingMusic) {
      startMusicMelody();
      if (onShowToast) onShowToast(`♫ Lagu berganti: ${track.title}`);
    }
  }

  // =========================================================================
  // 2. CANVAS FX (SAKURA PETALS, FIREFLIES, POND SWIMMING FISH)
  // =========================================================================
  function initCanvas() {
    canvas = document.getElementById('pinwheel-magic-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Create 35 sakura petals
    petals = Array.from({ length: 35 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 8 + 6,
      vx: Math.random() * 1.5 + 0.6,
      vy: Math.random() * 1.2 + 0.8,
      angle: Math.random() * Math.PI * 2,
      vAngle: (Math.random() - 0.5) * 0.04,
      color: Math.random() > 0.4 ? 'rgba(244, 114, 182, 0.75)' : 'rgba(216, 180, 254, 0.75)'
    }));

    // Create 20 gentle ambient fireflies
    fireflies = Array.from({ length: 20 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height * 0.4 + Math.random() * (canvas.height * 0.6),
      radius: Math.random() * 2 + 1.2,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.5,
      alpha: Math.random(),
      dAlpha: (Math.random() - 0.5) * 0.02
    }));

    // Create 4 swimming fish in the pond area
    fishList = [
      { x: canvas.width * 0.45, y: canvas.height * 0.75, vx: 0.8, vy: 0.1, length: 28, color: '#f59e0b', finAngle: 0 },
      { x: canvas.width * 0.55, y: canvas.height * 0.82, vx: -0.6, vy: -0.08, length: 34, color: '#ec4899', finAngle: 1 },
      { x: canvas.width * 0.62, y: canvas.height * 0.78, vx: 0.7, vy: -0.15, length: 24, color: '#c084fc', finAngle: 2 },
      { x: canvas.width * 0.38, y: canvas.height * 0.86, vx: -0.5, vy: 0.12, length: 30, color: '#fbbf24', finAngle: 3 }
    ];

    startCanvasLoop();
  }

  function startCanvasLoop() {
    if (animFrameId) cancelAnimationFrame(animFrameId);

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Draw swimming fish in pond area
      fishList.forEach((fish) => {
        fish.x += fish.vx;
        fish.y += fish.vy;
        fish.finAngle += 0.15;

        // Bounce within pond boundary
        const pondMinX = canvas.width * 0.32;
        const pondMaxX = canvas.width * 0.78;
        const pondMinY = canvas.height * 0.68;
        const pondMaxY = canvas.height * 0.94;

        if (fish.x < pondMinX || fish.x > pondMaxX) fish.vx *= -1;
        if (fish.y < pondMinY || fish.y > pondMaxY) fish.vy *= -1;

        ctx.save();
        ctx.translate(fish.x, fish.y);
        ctx.rotate(Math.atan2(fish.vy, fish.vx));
        ctx.fillStyle = fish.color;
        ctx.globalAlpha = 0.55;

        // Fish body
        ctx.beginPath();
        ctx.ellipse(0, 0, fish.length / 2, fish.length / 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wiggling tail
        ctx.beginPath();
        const tailX = -fish.length / 2;
        const tailWiggle = Math.sin(fish.finAngle) * 5;
        ctx.moveTo(tailX, 0);
        ctx.lineTo(tailX - 10, tailWiggle - 5);
        ctx.lineTo(tailX - 10, tailWiggle + 5);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      });

      // 2. Draw falling sakura petals
      if (isSakuraEnabled) {
        petals.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.angle += p.vAngle;

          if (p.y > canvas.height + 20) {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
          if (p.x > canvas.width + 20) {
            p.x = -20;
          }

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.angle);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.45, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        });
      }

      // 3. Draw gentle glowing fireflies
      fireflies.forEach((f) => {
        f.x += f.vx;
        f.y += f.vy;
        f.alpha += f.dAlpha;
        if (f.alpha < 0.2 || f.alpha > 0.95) f.dAlpha *= -1;

        if (f.x < 0 || f.x > canvas.width) f.vx *= -1;
        if (f.y < canvas.height * 0.3 || f.y > canvas.height) f.vy *= -1;

        ctx.save();
        ctx.globalAlpha = f.alpha;
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animFrameId = requestAnimationFrame(render);
    };

    render();
  }

  // =========================================================================
  // 3. INTERACTIVE FISHING POND SYSTEM (UID-BOUND STORAGE)
  // =========================================================================
  function getFishStorageKey(uid = currentActiveUid) {
    return `olu_fishing_collection_${uid || SYMA_CANONICAL_UID}`;
  }

  function loadFishingCollection(uid = currentActiveUid) {
    try {
      const raw = localStorage.getItem(getFishStorageKey(uid));
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  function saveFishCatch(fish, uid = currentActiveUid) {
    const list = loadFishingCollection(uid);
    list.unshift(fish);
    try {
      localStorage.setItem(getFishStorageKey(uid), JSON.stringify(list));
    } catch (_) {}
    renderFishingCollection();
  }

  function renderFishingCollection() {
    const list = loadFishingCollection(currentActiveUid);
    if (fishCountBadge) fishCountBadge.textContent = String(list.length);

    // Recent Catches in Fishing Modal (Max 4)
    if (recentCatchesGrid) {
      if (list.length === 0) {
        recentCatchesGrid.innerHTML = `
          <div style="grid-column: span 2; font-size:0.75rem; color:#a855f7; font-style:italic;">
            Belum ada ikan yang ditangkap. Mulai lempar kailmu!
          </div>
        `;
      } else {
        recentCatchesGrid.innerHTML = list.slice(0, 4).map(item => `
          <div class="pinwheel-catch-card">
            <span class="pinwheel-catch-icon">${item.icon}</span>
            <div class="pinwheel-catch-details">
              <p class="pinwheel-catch-name">${item.name}</p>
              <p class="pinwheel-catch-meta">${item.length} cm • ${item.rarity}</p>
            </div>
          </div>
        `).join('');
      }
    }

    // All Fish in Collection Vault Modal
    if (allFishGrid) {
      if (list.length === 0) {
        allFishGrid.innerHTML = `
          <div style="grid-column: span 2; font-size:0.8rem; color:#cbd5e1; text-align:center; padding:18px;">
            Akuarium masih kosong. Kunjungi Fishing Pond untuk memancing ikan magis! 🎣
          </div>
        `;
      } else {
        allFishGrid.innerHTML = list.map(item => `
          <div class="pinwheel-catch-card">
            <span class="pinwheel-catch-icon">${item.icon}</span>
            <div class="pinwheel-catch-details">
              <p class="pinwheel-catch-name">${item.name}</p>
              <p class="pinwheel-catch-meta">${item.length} cm • ${item.rarity} • ${new Date(item.caughtAt).toLocaleTimeString()}</p>
            </div>
          </div>
        `).join('');
      }
    }
  }

  function handleFishButtonAction() {
    if (fishingState === 'idle') {
      // Cast rod
      fishingState = 'cast';
      if (fishingBobber) fishingBobber.classList.add('cast');
      if (fishingBiteAlert) fishingBiteAlert.style.display = 'none';
      if (fishActionLabel) fishActionLabel.textContent = 'Menunggu Ikan...';
      if (fishingStatusHint) fishingStatusHint.textContent = 'Kail telah dilempar! Perhatikan pelampung... 🌊';
      playTone(440, 0.3, 'sine', 0.1);

      // Random bite timer between 1.8s and 3.5s
      const delay = 1800 + Math.random() * 1700;
      biteTimer = setTimeout(() => {
        if (fishingState !== 'cast') return;
        fishingState = 'biting';
        if (fishingBiteAlert) fishingBiteAlert.style.display = 'block';
        if (fishActionLabel) fishActionLabel.textContent = 'Tarik Kail Sekarang! ⚡';
        if (fishingStatusHint) fishingStatusHint.textContent = '❗ IKAN MENYAMBAR KAIL! CEPAT TARIK! ❗';
        playTone(880, 0.4, 'triangle', 0.18);

        // Window to reel in (2.2 seconds)
        biteExpiryTimer = setTimeout(() => {
          if (fishingState === 'biting') {
            // Escaped
            fishingState = 'idle';
            if (fishingBobber) fishingBobber.classList.remove('cast');
            if (fishingBiteAlert) fishingBiteAlert.style.display = 'none';
            if (fishActionLabel) fishActionLabel.textContent = 'Lempar Kail';
            if (fishingStatusHint) fishingStatusHint.textContent = 'Ikan terlepas! Jangan menyerah, coba lagi ✨';
            if (onShowToast) onShowToast('Ikan terlepas dari kail... Coba lagi!');
          }
        }, 2200);
      }, delay);

    } else if (fishingState === 'biting') {
      // Successful catch!
      clearTimeout(biteExpiryTimer);
      clearTimeout(biteTimer);
      fishingState = 'caught';

      const randomSpecies = FISH_SPECIES[Math.floor(Math.random() * FISH_SPECIES.length)];
      const randomLen = Math.floor(randomSpecies.minLen + Math.random() * (randomSpecies.maxLen - randomSpecies.minLen + 1));
      const caughtFish = {
        name: randomSpecies.name,
        localName: randomSpecies.localName,
        icon: randomSpecies.icon,
        rarity: randomSpecies.rarity,
        length: randomLen,
        caughtAt: Date.now()
      };

      saveFishCatch(caughtFish, currentActiveUid);

      if (fishingBobber) fishingBobber.classList.remove('cast');
      if (fishingBiteAlert) fishingBiteAlert.style.display = 'none';
      if (fishActionLabel) fishActionLabel.textContent = 'Lempar Kail Lagi';
      if (fishingStatusHint) fishingStatusHint.textContent = `🎉 Berhasil menangkap ${caughtFish.name} (${caughtFish.length} cm)!`;

      playTone(523.25, 0.3, 'sine', 0.15);
      setTimeout(() => playTone(659.25, 0.3, 'sine', 0.15), 120);
      setTimeout(() => playTone(783.99, 0.5, 'triangle', 0.2), 240);

      if (onShowToast) onShowToast(`🎣 Berhasil menangkap ${caughtFish.name}! Tersimpan di akun Syma.`);
      if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);

      fishingState = 'idle';
    }
  }

  // =========================================================================
  // 4. MODALS & NAVIGATION HANDLERS
  // =========================================================================
  function closeAllPinwheelModals() {
    [
      modalFishing, modalResidence, modalObservatory, modalStudio,
      modalGazebo, modalCatGarden, modalMailbox, modalGallery,
      modalCollection, modalSettings
    ].forEach((m) => {
      if (m) {
        m.classList.remove('active');
        m.setAttribute('aria-hidden', 'true');
      }
    });
    const ovBehind = document.getElementById('pinwheel-behind-overlay');
    if (ovBehind) {
      ovBehind.classList.remove('active');
      ovBehind.setAttribute('aria-hidden', 'true');
    }
    stopBehindPinwheelVideo();
    if (catGardenCtrl && typeof catGardenCtrl.closeCatGarden === 'function') {
      catGardenCtrl.closeCatGarden();
    }
    if (fishingPondCtrl && typeof fishingPondCtrl.closeFishingPond === 'function') {
      fishingPondCtrl.closeFishingPond();
    }
    if (pinwheelGazeboCtrl && typeof pinwheelGazeboCtrl.closeGazebo === 'function') {
      pinwheelGazeboCtrl.closeGazebo();
    }
    if (pinwheelPhotoCtrl && typeof pinwheelPhotoCtrl.closePhotography === 'function') {
      pinwheelPhotoCtrl.closePhotography();
    }
        if (pinwheelResidenceCtrl && typeof pinwheelResidenceCtrl.closeResidence === 'function') {
      pinwheelResidenceCtrl.closeResidence();
    }
    if (pinwheelVisionCtrl && typeof pinwheelVisionCtrl.closeVisionStudio === 'function') {
      pinwheelVisionCtrl.closeVisionStudio();
    }
  }

  function openModal(modalEl) {
    closeAllPinwheelModals();
    if (modalEl) {
      modalEl.classList.add('active');
      modalEl.setAttribute('aria-hidden', 'false');
    }
  }

  // Setup click listeners on location buttons
  locButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const loc = btn.getAttribute('data-pinwheel-loc');
      if (onTriggerSparkle) onTriggerSparkle(e.clientX, e.clientY);

      switch (loc) {
        case 'residence':
          if (typeof onOpenResidence === 'function') {
            onOpenResidence();
          } else if (pinwheelResidenceCtrl && typeof pinwheelResidenceCtrl.openResidence === 'function') {
            pinwheelResidenceCtrl.openResidence(currentActiveUid);
          } else {
            openModal(modalResidence);
          }
          break;
        case 'observatory':
          openModal(modalObservatory);
          break;
        case 'studio':
          openModal(modalStudio);
          break;
        case 'gazebo':
          if (pinwheelGazeboCtrl && typeof pinwheelGazeboCtrl.openGazebo === 'function') {
            pinwheelGazeboCtrl.openGazebo(currentActiveUid);
          } else {
            openModal(modalGazebo);
          }
          break;
        case 'fishing':
          if (fishingPondCtrl && typeof fishingPondCtrl.openFishingPond === 'function') {
            fishingPondCtrl.openFishingPond(currentActiveUid);
          } else {
            renderFishingCollection();
            openModal(modalFishing);
          }
          break;
        case 'catgarden':
          if (catGardenCtrl && typeof catGardenCtrl.openCatGarden === 'function') {
            catGardenCtrl.openCatGarden();
          } else {
            openModal(modalCatGarden);
          }
          break;
        case 'mailbox':
          openModal(modalMailbox);
          break;
      }
    });
  });

  const btnEnterCatcare = document.getElementById('btn-enter-catcare-simulator');
  if (btnEnterCatcare) {
    btnEnterCatcare.addEventListener('click', () => {
      closeAllPinwheelModals();
      if (catGardenCtrl && typeof catGardenCtrl.openCatGarden === 'function') {
        catGardenCtrl.openCatGarden();
      }
    });
  }

  const btnEnterWhisperingPond = document.getElementById('btn-enter-whispering-pond');
  if (btnEnterWhisperingPond) {
    btnEnterWhisperingPond.addEventListener('click', () => {
      closeAllPinwheelModals();
      if (fishingPondCtrl && typeof fishingPondCtrl.openFishingPond === 'function') {
        fishingPondCtrl.openFishingPond(currentActiveUid);
      }
    });
  }

    const btnEnterPinwheelResidence = document.getElementById('btn-enter-pinwheel-residence');
  if (btnEnterPinwheelResidence) {
    btnEnterPinwheelResidence.addEventListener('click', () => {
      closeAllPinwheelModals();
      if (typeof onOpenResidence === 'function') {
        onOpenResidence();
      } else if (pinwheelResidenceCtrl && typeof pinwheelResidenceCtrl.openResidence === 'function') {
        pinwheelResidenceCtrl.openResidence(currentActiveUid);
      }
    });
  }

  const btnEnterPinwheelGazebo = document.getElementById('btn-enter-pinwheel-gazebo');
  if (btnEnterPinwheelGazebo) {
    btnEnterPinwheelGazebo.addEventListener('click', () => {
      closeAllPinwheelModals();
      if (pinwheelGazeboCtrl && typeof pinwheelGazeboCtrl.openGazebo === 'function') {
        pinwheelGazeboCtrl.openGazebo(currentActiveUid);
      }
    });
  }

  const btnEnterPinwheelPhoto = document.getElementById('btn-enter-pinwheel-photo');
  if (btnEnterPinwheelPhoto) {
    btnEnterPinwheelPhoto.addEventListener('click', () => {
      closeAllPinwheelModals();
      if (pinwheelPhotoCtrl && typeof pinwheelPhotoCtrl.openPhotography === 'function') {
        pinwheelPhotoCtrl.openPhotography(currentActiveUid, 'camera');
      }
    });
  }

  const btnEnterPinwheelVision = document.getElementById('btn-enter-pinwheel-vision');
  if (btnEnterPinwheelVision) {
    btnEnterPinwheelVision.addEventListener('click', () => {
      closeAllPinwheelModals();
      if (pinwheelVisionCtrl && typeof pinwheelVisionCtrl.openVisionStudio === 'function') {
        pinwheelVisionCtrl.openVisionStudio(currentActiveUid, 'canvas');
      }
    });
  }

  const btnBottomGallery = document.getElementById('btn-pinwheel-gallery');
  if (btnBottomGallery) {
    btnBottomGallery.addEventListener('click', () => {
      closeAllPinwheelModals();
      if (pinwheelPhotoCtrl && typeof pinwheelPhotoCtrl.openPhotography === 'function') {
        pinwheelPhotoCtrl.openPhotography(currentActiveUid, 'album');
      }
    });
  }

  // Modal Close buttons
  [
    'btn-close-fishing-modal', 'btn-close-residence-modal', 'btn-close-observatory-modal',
    'btn-close-studio-modal', 'btn-close-gazebo-modal', 'btn-close-catgarden-modal',
    'btn-close-mailbox-modal', 'btn-close-gallery-modal', 'btn-close-collection-modal',
    'btn-close-settings-modal'
  ].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('click', closeAllPinwheelModals);
  });

  // Close modals when clicking backdrop
  document.querySelectorAll('.pinwheel-modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllPinwheelModals();
    });
  });

  // Bottom Big Action Buttons
  if (btnGallery) {
    btnGallery.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(modalGallery);
    });
  }

  if (btnCollection) {
    btnCollection.addEventListener('click', (e) => {
      e.stopPropagation();
      renderFishingCollection();
      openModal(modalCollection);
    });
  }

  // Collection Tabs
  const btnTabFish = document.getElementById('btn-tab-fish-collection');
  const btnTabRelic = document.getElementById('btn-tab-relic-collection');
  const panelFish = document.getElementById('collection-fish-panel');
  const panelRelic = document.getElementById('collection-relic-panel');

  if (btnTabFish && btnTabRelic && panelFish && panelRelic) {
    btnTabFish.addEventListener('click', () => {
      btnTabFish.style.background = '#a855f7';
      btnTabRelic.style.background = 'rgba(168, 85, 247, 0.4)';
      panelFish.style.display = 'block';
      panelRelic.style.display = 'none';
    });
    btnTabRelic.addEventListener('click', () => {
      btnTabRelic.style.background = '#a855f7';
      btnTabFish.style.background = 'rgba(168, 85, 247, 0.4)';
      panelFish.style.display = 'none';
      panelRelic.style.display = 'block';
    });
  }

  // =========================================================================
  // PINWHEEL OBSERVATORY & TELESCOPE CONTROLLER (STAR MESSAGES BRIDGE)
  // =========================================================================
  function openTelescope(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (onTriggerSparkle) {
      const x = e?.clientX || window.innerWidth / 2;
      const y = e?.clientY || window.innerHeight / 3;
      onTriggerSparkle(x, y);
    }
    playTone(523.25, 0.6, 'sine', 0.15); // C5 crystalline chime
    closeAllPinwheelModals();
    if (viewWorld) {
      viewWorld.classList.remove('active');
      viewWorld.setAttribute('aria-hidden', 'true');
    }

    if (typeof onNavigateStarMessages === 'function') {
      onNavigateStarMessages('pinwheel');
    } else if (typeof window.starMessagesController?.openStarMessages === 'function') {
      window.starMessagesController.openStarMessages('pinwheel', 'abil');
    } else if (typeof window.ensureStarMessagesController === 'function') {
      window.ensureStarMessagesController().then(ctrl => {
        if (ctrl && typeof ctrl.openStarMessages === 'function') {
          ctrl.openStarMessages('pinwheel', 'abil');
        }
      });
    }
  }

  const btnOpenTelescope = document.getElementById('btn-pinwheel-open-telescope');
  if (btnOpenTelescope) {
    btnOpenTelescope.addEventListener('click', openTelescope);
  }

  // =========================================================================
  // PINWHEEL MAILBOX CONTROLLER (KOTAK POS BRIDGE & REAL-TIME UNREAD LISTENER)
  // =========================================================================
  let mailboxUnsub = null;

  function updateMailboxUnreadBadge(unreadCount) {
    const badge = document.getElementById('pinwheel-mailbox-unread-badge');
    const btnMailbox = document.getElementById('btn-loc-pinwheel-mailbox');
    const statusBadge = document.getElementById('pinwheel-mailbox-status-badge');

    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = 'inline-flex';
        badge.textContent = String(unreadCount);
      } else {
        badge.style.display = 'none';
        badge.textContent = '0';
      }
    }

    if (btnMailbox) {
      if (unreadCount > 0) {
        btnMailbox.classList.add('has-unread');
      } else {
        btnMailbox.classList.remove('has-unread');
      }
    }

    if (statusBadge) {
      if (unreadCount > 0) {
        statusBadge.innerHTML = `<span style="color:#f43f5e; font-weight:700;">💌 Ada ${unreadCount} surat baru belum dibaca</span>`;
      } else {
        statusBadge.innerHTML = `<span style="color:#93c5fd;">✓ Kotak pos tersinkron (tidak ada surat baru)</span>`;
      }
    }
  }

  function subscribeMailboxUnread(uid) {
    if (typeof mailboxUnsub === 'function') {
      try { mailboxUnsub(); } catch (_) {}
      mailboxUnsub = null;
    }
    const targetUser = { uid: uid || currentActiveUid || SYMA_CANONICAL_UID };
    try {
      mailboxUnsub = dbSubscribeLetters(targetUser, (letters) => {
        const incoming = (letters || []).filter(l => l.recipientUid === targetUser.uid);
        const unread = incoming.filter(l => !l.read).length;
        updateMailboxUnreadBadge(unread);
      }, (err) => {
        console.warn('PINWHEEL mailbox unread subscription notice:', err);
        dbFetchLetters(targetUser).then(letters => {
          const incoming = (letters || []).filter(l => l.recipientUid === targetUser.uid);
          const unread = incoming.filter(l => !l.read).length;
          updateMailboxUnreadBadge(unread);
        }).catch(() => {});
      });
    } catch (e) {
      console.warn('PINWHEEL mailbox setup notice:', e);
    }
  }

  function openPinwheelMailbox(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    if (onTriggerSparkle) {
      const x = e?.clientX || window.innerWidth / 2;
      const y = e?.clientY || window.innerHeight / 3;
      onTriggerSparkle(x, y);
    }
    playTone(587.33, 0.5, 'sine', 0.15); // D5 gentle bell
    closeAllPinwheelModals();
    if (viewWorld) {
      viewWorld.classList.remove('active');
      viewWorld.setAttribute('aria-hidden', 'true');
    }

    if (typeof onNavigateKotakPos === 'function') {
      onNavigateKotakPos('pinwheel');
    } else if (typeof window.kotakPosController?.openKotakPos === 'function') {
      window.kotakPosController.openKotakPos('pinwheel', 'abil');
    } else if (typeof window.ensureKotakPosController === 'function') {
      window.ensureKotakPosController().then(ctrl => {
        if (ctrl && typeof ctrl.openKotakPos === 'function') {
          ctrl.openKotakPos('pinwheel', 'abil');
        }
      });
    } else {
      const viewMailbox = document.getElementById('view-kotak-pos');
      if (viewMailbox) {
        viewMailbox.classList.add('active');
        viewMailbox.setAttribute('aria-hidden', 'false');
      }
    }
  }

  const btnPinwheelOpenMailbox = document.getElementById('btn-pinwheel-open-mailbox');
  if (btnPinwheelOpenMailbox) {
    btnPinwheelOpenMailbox.addEventListener('click', openPinwheelMailbox);
  }

  // Settings Button
  if (btnSettings) {
    btnSettings.addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(modalSettings);
    });
  }

  // Settings Toggles
  const btnToggleBgm = document.getElementById('btn-toggle-bgm');
  if (btnToggleBgm) {
    btnToggleBgm.addEventListener('click', () => {
      toggleMusicPlayback();
      btnToggleBgm.textContent = isPlayingMusic ? 'ON' : 'OFF';
    });
  }

  const btnToggleSakura = document.getElementById('btn-toggle-sakura');
  if (btnToggleSakura) {
    btnToggleSakura.addEventListener('click', () => {
      isSakuraEnabled = !isSakuraEnabled;
      btnToggleSakura.textContent = isSakuraEnabled ? 'Aktif' : 'Nonaktif';
    });
  }

  const btnResetFish = document.getElementById('btn-reset-fish-data');
  if (btnResetFish) {
    btnResetFish.addEventListener('click', () => {
      try {
        localStorage.removeItem(getFishStorageKey(currentActiveUid));
      } catch (_) {}
      renderFishingCollection();
      if (onShowToast) onShowToast('Data tangkapan ikan telah direset.');
    });
  }

  // Music Player Event Listeners
  if (btnPlay) btnPlay.addEventListener('click', toggleMusicPlayback);
  if (btnPrev) btnPrev.addEventListener('click', () => changeTrack(-1));
  if (btnNext) btnNext.addEventListener('click', () => changeTrack(1));

  // Fishing Action Button
  if (btnFishAction) btnFishAction.addEventListener('click', handleFishButtonAction);

  // Cat petting interactions
  document.querySelectorAll('.pinwheel-cat-btn').forEach((cBtn) => {
    cBtn.addEventListener('click', () => {
      const catName = cBtn.getAttribute('data-cat-name');
      playTone(659.25, 0.4, 'sine', 0.1);
      setTimeout(() => playTone(880, 0.4, 'triangle', 0.12), 150);
      if (onShowToast) onShowToast(`🤍 Kamu mengelus ${catName}. Dia mendengkur manja purr~`);
    });
  });

  // Residence Relax
  const btnResRelax = document.getElementById('btn-residence-relax');
  if (btnResRelax) {
    btnResRelax.addEventListener('click', () => {
      playTone(523.25, 1.2, 'sine', 0.15);
      if (onShowToast) onShowToast('🍵 Menyeruput teh sakura hangat di beranda istana...');
      closeAllPinwheelModals();
    });
  }

  // Gazebo Bell
  const btnGazBell = document.getElementById('btn-gazebo-bell');
  if (btnGazBell) {
    btnGazBell.addEventListener('click', () => {
      playTone(783.99, 1.8, 'sine', 0.15);
      setTimeout(() => playTone(1046.5, 1.8, 'triangle', 0.12), 200);
      if (onShowToast) onShowToast('🎐 Suara lonceng angin PINWHEEL berdentang merdu...');
    });
  }

  // Cross-Navigation Shortcuts to Existing Subsystems
  const btnLaunchPhotobooth = document.getElementById('btn-launch-photobooth');
  if (btnLaunchPhotobooth) {
    btnLaunchPhotobooth.addEventListener('click', () => {
      closeAllPinwheelModals();
      closePinwheelWorld();
      const viewPhoto = document.getElementById('view-photobooth');
      if (viewPhoto) {
        viewPhoto.classList.add('active');
        viewPhoto.setAttribute('aria-hidden', 'false');
      }
    });
  }

  const btnLaunchMailbox = document.getElementById('btn-launch-mailbox');
  if (btnLaunchMailbox) {
    btnLaunchMailbox.addEventListener('click', openPinwheelMailbox);
  }

  const btnLaunchMoments = document.getElementById('btn-launch-moments');
  if (btnLaunchMoments) {
    btnLaunchMoments.addEventListener('click', () => {
      closeAllPinwheelModals();
      closePinwheelWorld();
      const viewMoments = document.getElementById('view-moments');
      if (viewMoments) {
        viewMoments.classList.add('active');
        viewMoments.setAttribute('aria-hidden', 'false');
      }
    });
  }

  if (btnTopExplore) {
    btnTopExplore.addEventListener('click', () => {
      closeAllPinwheelModals();
      closePinwheelWorld();
    });
  }

  if (btnTopStory) {
    btnTopStory.addEventListener('click', () => {
      closeAllPinwheelModals();
      closePinwheelWorld();
      if (window.storiesController && typeof window.storiesController.openOurStories === 'function') {
        window.storiesController.openOurStories('view-pinwheel-world');
      } else {
        const viewStories = document.getElementById('view-our-stories');
        if (viewStories) {
          viewStories.classList.add('active');
          viewStories.setAttribute('aria-hidden', 'false');
        }
      }
    });
  }

  // =========================================================================
  // 4B. BEHIND THE PINWHEEL CONTROLLER (SECRET JOURNAL / ENCHANTED STORYBOOK)
  // =========================================================================
  let currentBehindChapter = 1;

  function stopBehindPinwheelVideo() {
    const iframe = document.getElementById('pinwheel-youtube-iframe');
    if (iframe) {
      try {
        iframe.contentWindow?.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } catch (e) {}
      // Reset src ensures audio completely terminates when leaving or closing
      const currentSrc = iframe.getAttribute('src');
      if (currentSrc) {
        iframe.setAttribute('src', currentSrc);
      }
    }
  }

  function pauseBehindPinwheelVideo() {
    const iframe = document.getElementById('pinwheel-youtube-iframe');
    if (iframe) {
      try {
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      } catch (e) {}
    }
  }

  function switchBehindChapter(targetCh) {
    const ch = Math.max(1, Math.min(4, targetCh));
    currentBehindChapter = ch;

    // Pause YouTube audio if leaving chapter 4
    if (ch !== 4) {
      pauseBehindPinwheelVideo();
    }

    // 1. Update Tabs
    const allTabs = document.querySelectorAll('.behind-tab-btn');
    allTabs.forEach((tab) => {
      const tabCh = parseInt(tab.getAttribute('data-chapter'), 10);
      const isActive = tabCh === ch;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // 2. Update Chapter Panels
    const allPanels = document.querySelectorAll('.behind-chapter-panel');
    allPanels.forEach((panel) => {
      const isActive = panel.id === `behind-chapter-${ch}`;
      panel.classList.toggle('active', isActive);
      if (isActive) {
        panel.scrollTop = 0;
      }
    });

    // 3. Update Indicator Dots
    const allDots = document.querySelectorAll('.indicator-dot');
    allDots.forEach((dot) => {
      const dotCh = parseInt(dot.getAttribute('data-chapter'), 10);
      dot.classList.toggle('active', dotCh === ch);
    });

    // 4. Update Prev / Next Buttons
    const prevBtn = document.getElementById('btn-behind-prev-chapter');
    const nextBtn = document.getElementById('btn-behind-next-chapter');
    if (prevBtn) prevBtn.disabled = (ch === 1);
    if (nextBtn) nextBtn.disabled = (ch === 4);

    // 5. Ambient Chime Tone
    const pitchMap = { 1: 523.25, 2: 587.33, 3: 659.25, 4: 783.99 };
    playTone(pitchMap[ch] || 523.25, 0.35, 'sine', 0.1);
  }

  function openBehindPinwheel() {
    closeAllPinwheelModals();
    const ov = document.getElementById('pinwheel-behind-overlay');
    if (ov) {
      ov.classList.add('active');
      ov.setAttribute('aria-hidden', 'false');
    }
    switchBehindChapter(1);
    playTone(523.25, 0.3, 'sine', 0.12);
    setTimeout(() => playTone(659.25, 0.35, 'triangle', 0.15), 100);
    if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight * 0.35);
    if (onShowToast) onShowToast('Membuka Behind the Pinwheel... 🎐✨');
  }

  function closeBehindPinwheel() {
    stopBehindPinwheelVideo();
    const ov = document.getElementById('pinwheel-behind-overlay');
    if (ov) {
      ov.classList.remove('active');
      ov.setAttribute('aria-hidden', 'true');
    }
    playTone(440.00, 0.25, 'sine', 0.08);
  }

  // Bind Behind The Pinwheel Listeners
  const btnBehindPinwheel = document.getElementById('btn-pinwheel-behind');
  if (btnBehindPinwheel) {
    btnBehindPinwheel.addEventListener('click', (e) => {
      e.stopPropagation();
      openBehindPinwheel();
    });
  }

  const btnBackBehind = document.getElementById('btn-back-pinwheel-behind');
  if (btnBackBehind) {
    btnBackBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindPinwheel();
    });
  }

  const btnCloseBehind = document.getElementById('btn-close-pinwheel-behind');
  if (btnCloseBehind) {
    btnCloseBehind.addEventListener('click', (e) => {
      e.stopPropagation();
      closeBehindPinwheel();
    });
  }

  // Chapter Tabs Click
  document.querySelectorAll('.behind-tab-btn').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(tab.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchBehindChapter(ch);
    });
  });

  // Indicator Dots Click
  document.querySelectorAll('.indicator-dot').forEach((dot) => {
    dot.addEventListener('click', (e) => {
      e.stopPropagation();
      const ch = parseInt(dot.getAttribute('data-chapter'), 10);
      if (!isNaN(ch)) switchBehindChapter(ch);
    });
  });

  // Prev / Next Chapter Click
  const btnBehindPrev = document.getElementById('btn-behind-prev-chapter');
  if (btnBehindPrev) {
    btnBehindPrev.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentBehindChapter > 1) {
        switchBehindChapter(currentBehindChapter - 1);
      }
    });
  }

  const btnBehindNext = document.getElementById('btn-behind-next-chapter');
  if (btnBehindNext) {
    btnBehindNext.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentBehindChapter < 4) {
        switchBehindChapter(currentBehindChapter + 1);
      }
    });
  }

  // Backdrop Click to close
  const overlayBehindEl = document.getElementById('pinwheel-behind-overlay');
  if (overlayBehindEl) {
    overlayBehindEl.addEventListener('click', (e) => {
      if (e.target === overlayBehindEl) {
        closeBehindPinwheel();
      }
    });
  }

  // =========================================================================
  // 5. LIFECYCLE: OPEN & CLOSE PINWHEEL WORLD
  // =========================================================================
  function openPinwheelWorld(user) {
    closeAllPinwheelModals();

    // Determine current user UID
    if (user && user.uid) {
      currentActiveUid = user.uid;
    } else {
      currentActiveUid = SYMA_CANONICAL_UID;
    }

    // Hide other views
    [
      'view-selection', 'view-login', 'view-private-universe', 'view-orbit',
      'view-kidult-world', 'view-toyou-world', 'view-shadow-world', 'view-yawn-world',
      'view-ash-world', 'view-usagain-world', 'view-hot-world',
      'view-photobooth', 'view-kotak-pos', 'view-moments', 'view-our-stories',
      'view-star-messages', 'view-messages', 'view-games'
    ].forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove('active');
        el.setAttribute('aria-hidden', 'true');
      }
    });

    const activeView = viewWorld || document.getElementById('view-pinwheel-world');
    if (activeView) {
      activeView.classList.add('active');
      activeView.setAttribute('aria-hidden', 'false');
    }

    // Initialize Canvas FX
    initCanvas();

    // Render loaded fish collection
    renderFishingCollection();

    // Ensure Syma avatar is set from card_abil_hd.jpg
    const profAvatar = document.getElementById('pinwheel-profile-avatar');
    if (profAvatar) {
      profAvatar.src = '/assets/card_abil_hd.jpg';
    }

    // Subscribe real-time unread mailbox badge
    subscribeMailboxUnread(currentActiveUid);

    if (onShowToast) {
      onShowToast("Selamat datang di Syma's Universe — The Nine Tailed Sanctuary ☁️");
    }
  }

  function closePinwheelWorld() {
    closeAllPinwheelModals();
    if (viewWorld) {
      viewWorld.classList.remove('active');
      viewWorld.setAttribute('aria-hidden', 'true');
    }

    // Clean up mailbox unread subscription
    if (typeof mailboxUnsub === 'function') {
      try { mailboxUnsub(); } catch (_) {}
      mailboxUnsub = null;
    }

    // Pause music
    if (isPlayingMusic) {
      toggleMusicPlayback();
    }

    // Stop canvas animation
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }

    // Reopen 7 Universes selection view
    const viewUniv = document.getElementById('view-private-universe');
    if (viewUniv) {
      viewUniv.classList.add('active');
      viewUniv.setAttribute('aria-hidden', 'false');
    }
  }

  const controllerInstance = {
    openPinwheelWorld,
    closePinwheelWorld,
    openTelescope,
    openPinwheelMailbox,
    updateMailboxUnreadBadge,
    openCatGarden: () => catGardenCtrl?.openCatGarden(),
    closeCatGarden: () => catGardenCtrl?.closeCatGarden(),
    catGardenController: catGardenCtrl,
    openFishingPond: (uid = currentActiveUid) => fishingPondCtrl?.openFishingPond(uid),
    closeFishingPond: () => fishingPondCtrl?.closeFishingPond(),
    fishingPondController: fishingPondCtrl,
    openGazebo: (uid = currentActiveUid) => pinwheelGazeboCtrl?.openGazebo(uid),
    closeGazebo: () => pinwheelGazeboCtrl?.closeGazebo(),
    pinwheelGazeboController: pinwheelGazeboCtrl,
    openPhotography: (uid = currentActiveUid, tab = 'camera') => pinwheelPhotoCtrl?.openPhotography(uid, tab),
    closePhotography: () => pinwheelPhotoCtrl?.closePhotography(),
    photographyController: pinwheelPhotoCtrl,
    openResidence: (uid = currentActiveUid, targetRoom = 'exterior') => pinwheelResidenceCtrl?.openResidence(uid, targetRoom),
    closeResidence: () => pinwheelResidenceCtrl?.closeResidence(),
    residenceController: pinwheelResidenceCtrl,
    openVisionStudio: (uid = currentActiveUid, tab = 'canvas') => pinwheelVisionCtrl?.openVisionStudio(uid, tab),
    closeVisionStudio: () => pinwheelVisionCtrl?.closeVisionStudio(),
    visionStudioController: pinwheelVisionCtrl,
    openBehindPinwheel,
    closeBehindPinwheel,
    stopBehindPinwheelVideo,
    pauseBehindPinwheelVideo,
    switchBehindChapter,
    loadFishingCollection,
    saveFishCatch,
    renderFishingCollection,
    toggleMusicPlayback,
    changeTrack
  };

  if (typeof window !== 'undefined') {
    window.pinwheelWorldController = controllerInstance;
  }

  return controllerInstance;
}
