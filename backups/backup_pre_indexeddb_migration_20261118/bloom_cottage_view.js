/**
 * ENCHANTED BLOOM COTTAGE — VIEW CONTROLLER & SIMULATION ENGINE
 * Universe: TO YOU — Lala ☀️ (Bella)
 * Concept: 2D Interactive Fairy Home Simulation Game
 * =============================================================================
 */

import {
  BLOOM_COTTAGE_CHARACTER,
  BLOOM_ROOMS,
  BLOOM_RECIPES,
  BLOOM_PLANTS,
  BLOOM_BUTTERFLIES,
  BLOOM_MEMORIES,
  BLOOM_SECRETS,
  BLOOM_ATMOSPHERES,
  normalizeBloomCharKey,
  loadBloomCottageState,
  saveBloomCottageState,
  playPianoNote,
  playChimeSuccess,
  playTeaPourSound
} from './bloom_cottage_state.js';

export function initBloomCottageView({ onShowToast, onTriggerSparkle, onNavigateBack } = {}) {
  // DOM Elements
  const cottageView = document.getElementById('view-bloom-cottage');
  const stageEl = document.getElementById('bloom-cottage-stage');
  const roomBgImg = document.getElementById('bloom-room-bg-img');
  const hotspotsContainer = document.getElementById('bloom-hotspots-container');
  const playerAvatar = document.getElementById('bloom-player-avatar');
  const promptEl = document.getElementById('bloom-interaction-prompt');
  const promptTextEl = document.getElementById('bloom-prompt-text');

  // Navigation HUDs
  const btnBack = document.getElementById('btn-bcottage-back');
  const titleRoomEl = document.getElementById('bloom-room-title');
  const titleSubtitleEl = document.getElementById('bloom-room-subtitle');
  const navPillsContainer = document.getElementById('bloom-nav-pills');
  const btnAtmoToggle = document.getElementById('btn-bcottage-atmo');
  const btnTasksModal = document.getElementById('btn-bcottage-tasks');
  const btnBagModal = document.getElementById('btn-bcottage-bag');

  // Modals & Overlays
  const modalBackdrop = document.getElementById('bloom-modal-backdrop');
  const modalTitle = document.getElementById('bloom-modal-title');
  const modalBody = document.getElementById('bloom-modal-body');
  const btnModalClose = document.getElementById('btn-bloom-modal-close');
  const sleepOverlay = document.getElementById('bloom-sleep-overlay');

  // Touch controls
  const dpadUp = document.getElementById('bloom-dpad-up');
  const dpadDown = document.getElementById('bloom-dpad-down');
  const dpadLeft = document.getElementById('bloom-dpad-left');
  const dpadRight = document.getElementById('bloom-dpad-right');
  const touchActionBtn = document.getElementById('bloom-touch-action');

  let activeCharacter = 'lala';
  let currentState = null;
  let currentRoomConfig = BLOOM_ROOMS[0];

  // Real-time movement & input state
  const pressedKeys = new Set();
  const touchState = { up: false, down: false, left: false, right: false };
  let animFrameId = null;
  let isMoving = false;
  let facingLeft = false;
  let activeNearbyHotspot = null;

  function loadStateForActiveChar() {
    currentState = loadBloomCottageState(activeCharacter);
    const room = BLOOM_ROOMS.find(r => r.id === currentState.currentRoom) || BLOOM_ROOMS[0];
    currentRoomConfig = room;
  }

  function saveCurrentState() {
    if (!currentState) return;
    saveBloomCottageState(activeCharacter, currentState);
  }

  // ---------------------------------------------------------------------------
  // 1. RENDER ROOM & ATMOSPHERE
  // ---------------------------------------------------------------------------
  function renderRoom(roomId, spawnAtDefault = false) {
    const room = BLOOM_ROOMS.find(r => r.id === roomId) || BLOOM_ROOMS[0];
    currentRoomConfig = room;
    if (currentState) currentState.currentRoom = room.id;

    // Update Titles
    if (titleRoomEl) titleRoomEl.textContent = room.name;
    if (titleSubtitleEl) titleSubtitleEl.textContent = room.subtitle;

    // Update Active Nav Pill
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.bloom-room-btn').forEach(btn => {
        const target = btn.getAttribute('data-room-id');
        btn.classList.toggle('active', target === room.id);
      });
    }

    // Update Room Background Artwork
    if (roomBgImg) {
      roomBgImg.src = room.bgImage || `/assets/bloom_cottage_${room.id}.jpg`;
    }

    // Set Spawn Coordinates
    if (spawnAtDefault || !currentState?.playerPos) {
      currentState.playerPos = { x: room.spawnX, y: room.spawnY };
    }
    updateAvatarDOM(currentState.playerPos.x, currentState.playerPos.y);

    // Render Hotspots for Current Room
    renderHotspots(room);

    // Apply Atmosphere Theme
    applyAtmosphere(currentState.atmosphere || 'day');

    saveCurrentState();
  }

  function renderHotspots(room) {
    if (!hotspotsContainer) return;
    hotspotsContainer.innerHTML = '';

    room.hotspots.forEach(hs => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'bloom-hotspot-item';
      btn.id = hs.id;
      btn.style.left = `${hs.x}%`;
      btn.style.top = `${hs.y}%`;
      btn.setAttribute('aria-label', hs.label);

      btn.innerHTML = `
        <div class="bloom-hotspot-beacon">
          <span>${hs.icon}</span>
          <span class="bloom-beacon-pulse"></span>
        </div>
        <span class="bloom-hotspot-badge">${hs.label}</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHotspotAction(hs);
      });

      hotspotsContainer.appendChild(btn);
    });
  }

  function applyAtmosphere(atmoId) {
    if (!cottageView) return;
    cottageView.classList.remove('atmo-day', 'atmo-golden', 'atmo-twilight', 'atmo-night');
    cottageView.classList.add(`atmo-${atmoId}`);
    if (currentState) currentState.atmosphere = atmoId;
  }

  // ---------------------------------------------------------------------------
  // 2. 2D EXPLORATION & COLLISION DETECTION
  // ---------------------------------------------------------------------------
  function updateAvatarDOM(x, y) {
    if (!playerAvatar) return;
    playerAvatar.style.left = `${x}%`;
    playerAvatar.style.top = `${y}%`;
    playerAvatar.classList.toggle('facing-left', facingLeft);
    playerAvatar.classList.toggle('is-walking', isMoving);
  }

  function checkCollision(targetX, targetY, room) {
    // 1. Boundary checking
    if (
      targetX < room.bounds.minX ||
      targetX > room.bounds.maxX ||
      targetY < room.bounds.minY ||
      targetY > room.bounds.maxY
    ) {
      return true; // Collided with room wall
    }

    // 2. Obstacle checking
    for (const obs of room.obstacles) {
      if (
        targetX >= obs.minX &&
        targetX <= obs.maxX &&
        targetY >= obs.minY &&
        targetY <= obs.maxY
      ) {
        return true; // Collided with furniture
      }
    }

    return false;
  }

  function checkProximityToHotspots(x, y, room) {
    let closest = null;
    let minDistance = 14; // Proximity threshold in percentage units

    for (const hs of room.hotspots) {
      const dist = Math.hypot(hs.x - x, hs.y - y);
      if (dist < minDistance) {
        minDistance = dist;
        closest = hs;
      }
    }

    activeNearbyHotspot = closest;

    if (closest && promptEl && promptTextEl) {
      promptTextEl.textContent = closest.prompt || `✦ [E] ${closest.label}`;
      promptEl.classList.add('show');
    } else if (promptEl) {
      promptEl.classList.remove('show');
    }
  }

  function gameLoop() {
    if (!cottageView.classList.contains('active')) {
      animFrameId = null;
      return;
    }

    let dx = 0;
    let dy = 0;
    const moveSpeed = 0.55; // Percentage step per frame

    if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft') || touchState.left) dx -= 1;
    if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight') || touchState.right) dx += 1;
    if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp') || touchState.up) dy -= 1;
    if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown') || touchState.down) dy += 1;

    isMoving = dx !== 0 || dy !== 0;

    if (isMoving && currentState?.playerPos) {
      if (dx < 0) facingLeft = true;
      if (dx > 0) facingLeft = false;

      // Normalize diagonal speed
      if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
      }

      const nextX = currentState.playerPos.x + dx * moveSpeed;
      const nextY = currentState.playerPos.y + dy * moveSpeed;

      // Try moving on X axis
      if (!checkCollision(nextX, currentState.playerPos.y, currentRoomConfig)) {
        currentState.playerPos.x = nextX;
      }

      // Try moving on Y axis
      if (!checkCollision(currentState.playerPos.x, nextY, currentRoomConfig)) {
        currentState.playerPos.y = nextY;
      }

      updateAvatarDOM(currentState.playerPos.x, currentState.playerPos.y);
      checkProximityToHotspots(currentState.playerPos.x, currentState.playerPos.y, currentRoomConfig);
    }

    animFrameId = requestAnimationFrame(gameLoop);
  }

  function startMovementLoop() {
    if (!animFrameId) {
      animFrameId = requestAnimationFrame(gameLoop);
    }
  }

  function stopMovementLoop() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
  }

  // ---------------------------------------------------------------------------
  // 3. ACTION & MODAL HANDLERS
  // ---------------------------------------------------------------------------
  function triggerHotspotAction(hs) {
    if (!hs) return;

    if (onTriggerSparkle) {
      const rect = playerAvatar?.getBoundingClientRect();
      const sx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const sy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      onTriggerSparkle(sx, sy);
    }

    switch (hs.action) {
      // Room navigation
      case 'goto_living':
        renderRoom('living', true);
        toast(`🛋️ Melangkah masuk ke Bloom Living Room`);
        break;
      case 'goto_bedroom':
        renderRoom('bedroom', true);
        toast(`🛏️ Melangkah masuk ke Dreamy Bedroom`);
        break;
      case 'goto_kitchen':
        renderRoom('kitchen', true);
        toast(`🍳 Memasuki Sweetheart Kitchen yang harum semerbak`);
        break;
      case 'goto_conservatory':
        renderRoom('conservatory', true);
        toast(`🌱 Melangkah ke Butterfly Conservatory yang penuh bunga`);
        break;
      case 'goto_attic':
        renderRoom('attic', true);
        toast(`🗝️ Menapaki tangga kayu menuju Memory Attic`);
        break;

      // Living Room Interactions
      case 'piano':
        openPianoModal();
        break;
      case 'sit_sofa':
        playerAvatar?.classList.add('is-sitting');
        toast(`🛋️ Duduk santai di sofa beludru peach yang sangat empuk 🌸`);
        setTimeout(() => playerAvatar?.classList.remove('is-sitting'), 3000);
        break;
      case 'tea_time':
        openTeaModal();
        break;
      case 'fireplace':
        toast(`🔥 Api peri keemasan berkobar lembut, menghangatkan seluruh ruangan ✦`);
        playChimeSuccess();
        break;
      case 'bookshelf':
        openBookshelfModal();
        break;

      // Bedroom Interactions
      case 'sleep':
        triggerSleepCycle();
        break;
      case 'vanity':
        openVanityModal();
        break;
      case 'wardrobe_decor':
        openWardrobeModal();
        break;
      case 'change_decor':
        openDecorModal();
        break;
      case 'balcony_view':
        playerAvatar?.classList.add('is-sitting');
        toast(`🌸 Duduk di balkon bunga: Semilir angin sejuk dan panorama pulau TO YOU begitu memesona ☀️`);
        playChimeSuccess();
        setTimeout(() => playerAvatar?.classList.remove('is-sitting'), 3000);
        break;

      // Kitchen Interactions
      case 'cook_bake':
        openCookingModal();
        break;
      case 'brew_drink':
        openBrewDrinkModal();
        break;
      case 'open_fridge':
        openFridgePantryModal();
        break;
      case 'recipe_book':
        openRecipeBookModal();
        break;
      case 'dining_table':
        openDiningTableModal();
        break;
      case 'pantry_storage':
        openPantryStorageModal();
        break;

      // Conservatory Interactions
      case 'garden_care':
        openGardenModal();
        break;
      case 'collect_seeds':
        openSeedCollectorModal();
        break;
      case 'harvest_flowers':
        openHarvestModal();
        break;
      case 'catch_butterfly':
        openButterflyModal();
        break;
      case 'fountain_sip':
        openKoiPondModal();
        break;

      // Memory Attic Interactions
      case 'memory_chest':
        openMemoryChestModal();
        break;
      case 'scrapbook':
        openScrapbookModal();
        break;
      case 'read_letters':
        openLettersModal();
        break;
      case 'save_photo':
        openSavePhotoModal();
        break;
      case 'find_secrets':
        openSecretsModal();
        break;

      default:
        toast(`✦ Berinteraksi dengan ${hs.label}`);
    }
  }

  function toast(msg) {
    if (onShowToast) onShowToast(msg);
  }

  // --- MODAL: PIANO ---
  function openPianoModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🎹 Piano Melodi Peri — Bloom Melody`;

    const notes = [
      { key: 'C', freq: 261.63, label: 'Do' },
      { key: 'D', freq: 293.66, label: 'Re' },
      { key: 'E', freq: 329.63, label: 'Mi' },
      { key: 'F', freq: 349.23, label: 'Fa' },
      { key: 'G', freq: 392.00, label: 'Sol' },
      { key: 'A', freq: 440.00, label: 'La' },
      { key: 'B', freq: 493.88, label: 'Si' },
      { key: 'C5', freq: 523.25, label: 'Do²' }
    ];

    let keysHtml = '<div class="bloom-piano-keyboard">';
    notes.forEach(n => {
      keysHtml += `
        <button type="button" class="bloom-piano-key" data-freq="${n.freq}">
          <span>${n.label}</span>
          <small>${n.key}</small>
        </button>
      `;
    });
    keysHtml += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Tekan tuts piano di bawah untuk memainkan nada melodi peri.</p>
      ${keysHtml}
      <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.78rem; color: #a855f7;">✨ Musik melembutkan suasana hati</span>
        <button type="button" class="bloom-btn-primary" id="btn-play-fairy-melody">♫ Mainkan Lagu Peri</button>
      </div>
    `;

    modalBackdrop.classList.add('active');

    // Attach piano key listeners
    modalBody.querySelectorAll('.bloom-piano-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const freq = parseFloat(btn.getAttribute('data-freq'));
        playPianoNote(freq);
        btn.classList.add('playing');
        setTimeout(() => btn.classList.remove('playing'), 150);
        if (currentState) {
          currentState.stats.pianoPlaysCount = (currentState.stats.pianoPlaysCount || 0) + 1;
          currentState.dailyChecklist.pianoPlayed = true;
          saveCurrentState();
        }
      });
    });

    const btnPlayMelody = modalBody.querySelector('#btn-play-fairy-melody');
    if (btnPlayMelody) {
      btnPlayMelody.addEventListener('click', () => {
        const melody = [523.25, 659.25, 783.99, 1046.50, 783.99, 659.25, 523.25];
        melody.forEach((freq, idx) => {
          setTimeout(() => playPianoNote(freq), idx * 260);
        });
        toast('🎶 Memainkan melodi "Fairy Morning Waltz" yang merdu 🌸');
      });
    }
  }

  // --- MODAL: TEA TIME ---
  function openTeaModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🫖 Meja Teh Peri — After Tea Time`;

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Pilih seduhan teh bunga segar yang disajikan di meja berenda:</p>
      <div class="bloom-card-grid">
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">🪻</span>
            <div>
              <h4 class="bloom-item-card-title">Star Lavender Tea</h4>
              <p class="bloom-item-card-desc">Aroma menenangkan untuk melepas penat dan menenangkan pikiran.</p>
            </div>
          </div>
          <button type="button" class="bloom-btn-primary btn-brew-tea" data-tea="Star Lavender">Seduh Teh</button>
        </div>
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">🍑</span>
            <div>
              <h4 class="bloom-item-card-title">Peach Blossom Tea</h4>
              <p class="bloom-item-card-desc">Seduhan buah persik manis dengan kelopak mawar pink segar.</p>
            </div>
          </div>
          <button type="button" class="bloom-btn-primary btn-brew-tea" data-tea="Peach Blossom">Seduh Teh</button>
        </div>
      </div>
    `;

    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-brew-tea').forEach(btn => {
      btn.addEventListener('click', () => {
        const teaName = btn.getAttribute('data-tea');
        playTeaPourSound();
        toast(`🫖 Menyeduh secangkir ${teaName}: Aroma hangat menyegarkan jiwa 🌸`);
        closeModal();
        if (currentState) {
          currentState.stats.teaBrewedCount = (currentState.stats.teaBrewedCount || 0) + 1;
          currentState.dailyChecklist.teaSipped = true;
          saveCurrentState();
        }
      });
    });
  }

  // --- MODAL: COOKING & RECIPES ---
  function openCookingModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🧁 Oven Kue Peri — Sweetheart Bakery`;

    let recipesHtml = '<div class="bloom-card-grid">';
    BLOOM_RECIPES.forEach(r => {
      const isCooked = currentState?.inventory?.cookedFoods?.includes(r.id);
      recipesHtml += `
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${r.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${r.name}</h4>
              <p class="bloom-item-card-desc">${r.desc}</p>
            </div>
          </div>
          <p style="font-size: 0.72rem; color: #a855f7; margin: 4px 0;">✨ ${r.buff}</p>
          <button type="button" class="bloom-btn-primary btn-bake-recipe" data-recipe-id="${r.id}">
            ${isCooked ? 'Panggang Ulang ✦' : 'Panggang Kue 🧁'}
          </button>
        </div>
      `;
    });
    recipesHtml += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Pilih resep kue dan makanan manis untuk dipanggang di oven peri:</p>
      ${recipesHtml}
    `;

    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-bake-recipe').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.getAttribute('data-recipe-id');
        const recipe = BLOOM_RECIPES.find(r => r.id === rId);
        btn.textContent = '⏳ Memanggang...';
        btn.disabled = true;

        setTimeout(() => {
          playChimeSuccess();
          toast(`🧁 Berhasil memanggang ${recipe ? recipe.name : 'kue'}! Hasil disimpan ke koleksi makanan ✨`);
          if (currentState) {
            if (!currentState.inventory.cookedFoods.includes(rId)) {
              currentState.inventory.cookedFoods.push(rId);
            }
            currentState.stats.cakesBakedCount = (currentState.stats.cakesBakedCount || 0) + 1;
            currentState.dailyChecklist.cakeBaked = true;
            saveCurrentState();
          }
          closeModal();
        }, 1200);
      });
    });
  }

  // --- MODAL: GARDEN & CONSERVATORY ---
  function openGardenModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🌸 Petak Bunga Botani — Butterfly Conservatory`;

    let plotsHtml = '<div class="bloom-card-grid">';
    (currentState?.gardenPlots || []).forEach(p => {
      const plant = BLOOM_PLANTS.find(pl => pl.id === p.plantId);
      plotsHtml += `
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${plant ? plant.icon : '🌱'}</span>
            <div>
              <h4 class="bloom-item-card-title">Petak #${p.id} ${plant ? plant.name : '(Kosong)'}</h4>
              <p class="bloom-item-card-desc">Status: ${p.stage === 'bloomed' ? '🌸 Mekar Sempurna' : p.stage === 'growing' ? '🌿 Tumbuh Segar' : p.stage === 'sprout' ? '🌱 Tunas Muda' : 'Kosong'}</p>
            </div>
          </div>
          <div style="display: flex; gap: 6px; margin-top: 6px;">
            <button type="button" class="bloom-btn-primary btn-water-plot" data-plot-id="${p.id}" style="flex: 1;">💧 Siram</button>
            ${p.stage === 'bloomed' ? `<button type="button" class="bloom-btn-primary btn-harvest-plot" data-plot-id="${p.id}" style="flex: 1; background: #34d399;">🧺 Petik</button>` : ''}
          </div>
        </div>
      `;
    });
    plotsHtml += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Rawat petak bunga di conservatory untuk menarik kupu-kupu peri:</p>
      ${plotsHtml}
    `;

    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-water-plot').forEach(btn => {
      btn.addEventListener('click', () => {
        playTeaPourSound();
        toast('💧 Petak bunga disirami dengan air embun sejuk ✨');
        if (currentState) {
          currentState.dailyChecklist.gardenWatered = true;
          saveCurrentState();
        }
      });
    });

    modalBody.querySelectorAll('.btn-harvest-plot').forEach(btn => {
      btn.addEventListener('click', () => {
        playChimeSuccess();
        toast('🧺 Kelopak bunga harum berhasil dipanen ke kantong perhiasan! 🌸');
        closeModal();
      });
    });
  }

  // --- MODAL: BUTTERFLY CATCHING ---
  function openButterflyModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🦋 Kupu-kupu Langka — Butterfly Field`;

    let butterfliesHtml = '<div class="bloom-card-grid">';
    BLOOM_BUTTERFLIES.forEach(b => {
      const isFound = currentState?.inventory?.discoveredButterflies?.includes(b.id);
      butterfliesHtml += `
        <div class="bloom-item-card" style="${isFound ? 'border-color: #facc15;' : 'opacity: 0.85;'}">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${b.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${b.name} (${b.rarity})</h4>
              <p class="bloom-item-card-desc">${b.desc}</p>
            </div>
          </div>
          <span style="font-size: 0.72rem; color: ${isFound ? '#16a34a' : '#9ca3af'}; margin-top: 4px;">
            ${isFound ? '✓ Sudah Tercatat di Katalog' : '✦ Belum Ditemukan'}
          </span>
        </div>
      `;
    });
    butterfliesHtml += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Katalog kupu-kupu yang singgah di kubah kaca Bella:</p>
      ${butterfliesHtml}
      <div style="margin-top: 1rem; text-align: center;">
        <button type="button" class="bloom-btn-primary" id="btn-catch-random-bf">🦋 Ayunkan Jaring Kupu-kupu</button>
      </div>
    `;

    modalBackdrop.classList.add('active');

    const btnCatch = modalBody.querySelector('#btn-catch-random-bf');
    if (btnCatch) {
      btnCatch.addEventListener('click', () => {
        const uncollected = BLOOM_BUTTERFLIES.filter(b => !currentState?.inventory?.discoveredButterflies?.includes(b.id));
        const target = uncollected.length > 0 ? uncollected[0] : BLOOM_BUTTERFLIES[0];

        playChimeSuccess();
        toast(`🦋 Selamat! Kamu berhasil menemukan kupu-kupu ${target.name} (${target.rarity})! ✨`);
        if (currentState) {
          if (!currentState.inventory.discoveredButterflies.includes(target.id)) {
            currentState.inventory.discoveredButterflies.push(target.id);
          }
          currentState.stats.butterfliesFound = (currentState.stats.butterfliesFound || 0) + 1;
          currentState.dailyChecklist.butterflyCaught = true;
          saveCurrentState();
        }
        closeModal();
      });
    }
  }

  // --- MODAL: MEMORY CHEST (ALL 8 FRIENDS) ---
  function openMemoryChestModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `📦 Peti Kenangan Abadi — 8 Sahabat Semesta`;

    let memsHtml = '<div class="bloom-card-grid">';
    BLOOM_MEMORIES.forEach(m => {
      memsHtml += `
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${m.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${m.char} · ${m.title}</h4>
              <p style="font-size: 0.65rem; color: #a855f7; margin: 0;">${m.date}</p>
            </div>
          </div>
          <p class="bloom-item-card-desc" style="margin-top: 6px;">"${m.note}"</p>
        </div>
      `;
    });
    memsHtml += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Peti kayu ukir berisi rekaman persahabatan suci antara Lala dan ketujuh sahabat semesta:</p>
      ${memsHtml}
    `;

    modalBackdrop.classList.add('active');
  }

  // --- MODAL: SCRAPBOOK & LETTERS ---
  function openScrapbookModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `📒 Scrapbook Persahabatan Peri`;
    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Buku tempel berhias kelopak mawar kering dan pita satin:</p>
      <div style="background: #fffbeb; border: 1.5px dashed #f472b6; border-radius: 16px; padding: 1.2rem; text-align: center;">
        <span style="font-size: 2.5rem;">🌸 📸 ☀️</span>
        <h4 style="margin: 8px 0; color: #831843;">Our Little Universe — Memories that Sparkle</h4>
        <p style="font-size: 0.78rem; color: #701a75; line-height: 1.4;">"Setiap tawa kecil, secangkir teh hangat, dan langkah di bawah matahari adalah benih kebahagiaan yang tumbuh mekar selamanya."</p>
        <button type="button" class="bloom-btn-primary" id="btn-add-scrapbook-photo" style="margin-top: 8px;">Tambah Foto Kenangan ✦</button>
      </div>
    `;
    modalBackdrop.classList.add('active');

    const btnAdd = modalBody.querySelector('#btn-add-scrapbook-photo');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        playChimeSuccess();
        toast('📸 Foto kenangan baru berhasil disematkan ke Scrapbook! ✨');
        closeModal();
      });
    }
  }

  function openLettersModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `💌 Meja Surat Sahabat`;
    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">Dari Nyanya ⭐: "Kue Bintang untuk Sahabatku"</h4>
          <p class="bloom-item-card-desc">"Terima kasih untuk gaun mawar yang begitu indah, Lala. Kapanpun kamu ingin melamun sambil minum teh lavender, gerbang Everdream House selalu terbuka untukmu."</p>
        </div>
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">Dari Lele 🌙: "Sebuah Janji Tenang"</h4>
          <p class="bloom-item-card-desc">"Dunia tidak selalu harus terburu-buru, Lala. Tetaplah bersinar dengan kehangatanmu yang lembut."</p>
        </div>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }

  // --- MODAL: BOOKSHELF ---
  function openBookshelfModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `📖 Rak Dongeng Peri — Chronicles of Everglow`;
    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">Jilid I: Rahasia Bunga Matahari Abadi</h4>
          <p class="bloom-item-card-desc">Kisah tentang bunga pertama yang mekar di puncak pulau TO YOU dan melahirkan sayap peri kemilau.</p>
        </div>
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">Jilid II: Nyanyian Angin & Sahabat Bintang</h4>
          <p class="bloom-item-card-desc">Catatan perjalanan menjelajahi 8 semesta dengan jalinan benang takdir yang tak terpisahkan.</p>
        </div>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }

  // --- SLEEP CYCLE OVERLAY ---
  function triggerSleepCycle() {
    if (!sleepOverlay) return;
    sleepOverlay.classList.add('active');
    toast(`🛏️ Merebahkan diri di ranjang kanopi berbulu lembut... Selamat tidur nyenyak 🌙`);

    setTimeout(() => {
      playChimeSuccess();
      sleepOverlay.classList.remove('active');
      toast(`☀️ Bangun dengan tubuh segar bugar dan hati penuh sukacita! 🌸`);
      if (currentState) {
        currentState.stats.napsTaken = (currentState.stats.napsTaken || 0) + 1;
        currentState.dailyChecklist.restedInBed = true;
        saveCurrentState();
      }
    }, 2800);
  }

  // --- MODAL: ROOM DECORATION ---
  function openDecorModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🎨 Dekorasi & Nuansa Kamar Tidur`;
    modalBody.innerHTML = `
      <div class="bloom-card-grid">
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">🌸 Sweet Peach & Rose (Default)</h4>
          <p class="bloom-item-card-desc">Kombinasi pink mawar pastel dan buah persik ceria.</p>
          <button type="button" class="bloom-btn-primary btn-apply-decor" data-decor="sweet_peach">Terapkan</button>
        </div>
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">💜 Lavender Moonlight</h4>
          <p class="bloom-item-card-desc">Nuansa ungu lembut menenangkan berhias kristal malam.</p>
          <button type="button" class="bloom-btn-primary btn-apply-decor" data-decor="lavender_moon">Terapkan</button>
        </div>
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">🌿 Mint Blossom</h4>
          <p class="bloom-item-card-desc">Kesegaran hijau sage dan embun pagi yang menyejukkan.</p>
          <button type="button" class="bloom-btn-primary btn-apply-decor" data-decor="mint_blossom">Terapkan</button>
        </div>
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">✨ Starlight Glow</h4>
          <p class="bloom-item-card-desc">Cahaya hangat champagne gold bertabur debu bintang peri.</p>
          <button type="button" class="bloom-btn-primary btn-apply-decor" data-decor="starlight_glow">Terapkan</button>
        </div>
      </div>
    `;
    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-apply-decor').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = btn.getAttribute('data-decor');
        playChimeSuccess();
        toast(`🎨 Dekorasi kamar diperbarui: ${d}! ✨`);
        closeModal();
      });
    });
  }

  // --- MODAL: VANITY & ACCESSORIES ---
  function openVanityModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🪞 Meja Rias Kristal — Fairy Charm & Vanity`;
    const accessories = [
      { id: 'rose_hairpin', name: 'Jepit Bunga Mawar Sutra', icon: '🌸', desc: 'Kelopak mawar pink pastel dengan butiran mutiara embun.' },
      { id: 'star_tiara', name: 'Mahkota Bintang Kristal', icon: '👑', desc: 'Mahkota mini perak bertabur kilau bintang malam.' },
      { id: 'lavender_bow', name: 'Pita Rambut Lavender', icon: '🎀', desc: 'Pita satin sutra harum semerbak bunga lavender.' },
      { id: 'dew_wings', name: 'Sayap Embun Berkilau', icon: '🪽', desc: 'Sepasang sayap peri transparan yang berkilauan saat terkena cahaya.' }
    ];
    let cards = '<div class="bloom-card-grid">';
    accessories.forEach(a => {
      cards += `
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${a.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${a.name}</h4>
              <p class="bloom-item-card-desc">${a.desc}</p>
            </div>
          </div>
          <button type="button" class="bloom-btn-primary btn-equip-acc" data-acc="${a.name}">Kenakan Hiasan</button>
        </div>
      `;
    });
    cards += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Rapikan rambut peri, kenakan jepit bunga, dan tatap cermin ajaib penuh afirmasi hangat:</p>
      ${cards}
      <div style="margin-top: 1rem; text-align: center;">
        <button type="button" class="bloom-btn-primary" id="btn-mirror-reflection" style="background: linear-gradient(135deg, #f472b6, #c084fc);">
          ✨ Tatap Cermin Ajaib Peri
        </button>
      </div>
    `;
    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-equip-acc').forEach(btn => {
      btn.addEventListener('click', () => {
        const acc = btn.getAttribute('data-acc');
        playChimeSuccess();
        toast(`✨ Mengenakan ${acc}: Bella tampak semakin manis dan berseri-seri! 🌸`);
        closeModal();
      });
    });

    const btnMirror = modalBody.querySelector('#btn-mirror-reflection');
    if (btnMirror) {
      btnMirror.addEventListener('click', () => {
        playChimeSuccess();
        toast(`🪞 Cermin Ajaib berbisik: "Senyumanmu adalah kehangatan terindah di semesta ini, Lala!" ☀️`);
        closeModal();
      });
    }
  }

  // --- MODAL: WARDROBE ---
  function openWardrobeModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `👗 Lemari Busana Peri Bella`;
    const dresses = [
      { id: 'rose_dress', name: 'Rose Petal Evening Dress', icon: '🌹', desc: 'Gaun sutra kelopak mawar pink pastel berenda lembut.' },
      { id: 'sun_gown', name: 'Sunflower Fairy Gown', icon: '🌻', desc: 'Gaun kuning cerah bertenun benang matahari pagi.' },
      { id: 'lavender_robe', name: 'Lavender Dream Robe', icon: '🪻', desc: 'Jubah santai ungu beraroma bunga tidur menenangkan.' },
      { id: 'wisteria_gown', name: 'Wisteria Gala Gown', icon: '💜', desc: 'Gaun sulur wisteria anggun bertabur partikel cahaya.' }
    ];
    let cards = '<div class="bloom-card-grid">';
    dresses.forEach(d => {
      cards += `
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${d.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${d.name}</h4>
              <p class="bloom-item-card-desc">${d.desc}</p>
            </div>
          </div>
          <button type="button" class="bloom-btn-primary btn-equip-dress" data-dress="${d.name}">Kenakan Gaun</button>
        </div>
      `;
    });
    cards += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Pilih gaun peri favorit dari lemari ukir mawar untuk hari ini:</p>
      ${cards}
    `;
    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-equip-dress').forEach(btn => {
      btn.addEventListener('click', () => {
        const dress = btn.getAttribute('data-dress');
        playChimeSuccess();
        toast(`👗 Mengenakan ${dress}: Anggun, nyaman, dan siap menjelajahi semesta! ✨`);
        closeModal();
      });
    });
  }

  // --- MODAL: FRIDGE & INGREDIENTS ---
  function openFridgePantryModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🧊 Kulkas & Lemari Bahan Makanan`;
    const ingredients = [
      { id: 'strawberries', name: 'Stroberi Liar Segar', icon: '🍓', desc: 'Dipetik langsung dari semak manis pulau TO YOU.' },
      { id: 'honey', name: 'Madu Bintang Murni', icon: '🍯', desc: 'Madu keemasan kental dari nektar bunga matahari.' },
      { id: 'flour', name: 'Tepung Gandum Peri', icon: '🌾', desc: 'Tepung lembut beraroma vanila untuk adonan kue empuk.' },
      { id: 'sugar', name: 'Gula Kristal Pelangi', icon: '✨', desc: 'Kristal gula warna-warni yang berkilau di bawah cahaya.' },
      { id: 'cream', name: 'Krim Susu Vanila', icon: '🥛', desc: 'Krim segar lembut untuk topping cupcake dan parfait.' },
      { id: 'mint', name: 'Daun Mint Embun', icon: '🌿', desc: 'Daun mint dingin menyegarkan untuk campuran minuman bersoda.' }
    ];
    let cards = '<div class="bloom-card-grid">';
    ingredients.forEach(ing => {
      cards += `
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${ing.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${ing.name}</h4>
              <p class="bloom-item-card-desc">${ing.desc}</p>
            </div>
          </div>
          <button type="button" class="bloom-btn-primary btn-take-ing" data-ing="${ing.name}">Ambil Bahan</button>
        </div>
      `;
    });
    cards += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Bahan-bahan segar dari kebun peri untuk memanggang kue dan meracik minuman:</p>
      ${cards}
    `;
    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-take-ing').forEach(btn => {
      btn.addEventListener('click', () => {
        const ing = btn.getAttribute('data-ing');
        playChimeSuccess();
        toast(`🧺 Mengambil ${ing}: Siap diolah di atas meja adonan dapur! 🧁`);
        closeModal();
      });
    });
  }

  // --- MODAL: RECIPE BOOK ---
  function openRecipeBookModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `📖 Buku Resep Peri — Sweetheart Recipe Codex`;
    let cards = '<div class="bloom-card-grid">';
    BLOOM_RECIPES.forEach(r => {
      cards += `
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${r.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${r.name}</h4>
              <p class="bloom-item-card-desc">${r.desc}</p>
            </div>
          </div>
          <p style="font-size: 0.72rem; color: #64748b; margin: 4px 0;">Bahan: ${r.ingredients.join(', ')}</p>
          <span style="font-size: 0.72rem; color: #a855f7; font-weight: 600;">✨ Buff: ${r.buff}</span>
        </div>
      `;
    });
    cards += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Daftar resep kue dongeng dan hidangan manis favorit Bella:</p>
      ${cards}
      <div style="margin-top: 1rem; text-align: center;">
        <button type="button" class="bloom-btn-primary" id="btn-cook-from-book">🧁 Buka Oven untuk Memasak</button>
      </div>
    `;
    modalBackdrop.classList.add('active');

    const btnCook = modalBody.querySelector('#btn-cook-from-book');
    if (btnCook) {
      btnCook.addEventListener('click', () => {
        closeModal();
        setTimeout(openCookingModal, 200);
      });
    }
  }

  // --- MODAL: BREW DRINK ---
  function openBrewDrinkModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🍹 Meja Racik Minuman Segar`;
    const drinks = [
      { id: 'fairy_berry_fizz', name: 'Sparkling Fairy Berry Fizz', icon: '🍹', desc: 'Soda berry hutan dengan es kristal bercahaya dan daun mint segar.' },
      { id: 'honey_lavender_iced', name: 'Honey Lavender Iced Tea', icon: '🧋', desc: 'Teh seduh dingin beraroma lavender dengan madu kental manis.' },
      { id: 'peach_nectar', name: 'Peach Blossom Nectar', icon: '🍑', desc: 'Jus buah persik segar dengan taburan kelopak mawar pink.' }
    ];
    let cards = '<div class="bloom-card-grid">';
    drinks.forEach(d => {
      cards += `
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${d.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${d.name}</h4>
              <p class="bloom-item-card-desc">${d.desc}</p>
            </div>
          </div>
          <button type="button" class="bloom-btn-primary btn-mix-drink" data-drink-id="${d.id}" data-drink-name="${d.name}">Racik Minuman</button>
        </div>
      `;
    });
    cards += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Pilih minuman buah dan rempah segar untuk diracik di meja marmer:</p>
      ${cards}
    `;
    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-mix-drink').forEach(btn => {
      btn.addEventListener('click', () => {
        const dId = btn.getAttribute('data-drink-id');
        const dName = btn.getAttribute('data-drink-name');
        playTeaPourSound();
        btn.textContent = '⏳ Mengocok Minuman...';
        btn.disabled = true;

        setTimeout(() => {
          playChimeSuccess();
          toast(`🍹 Berhasil meracik ${dName}! Disimpan ke koleksi pantry ✦`);
          if (currentState) {
            if (!currentState.inventory.cookedFoods.includes(dId)) {
              currentState.inventory.cookedFoods.push(dId);
            }
            saveCurrentState();
          }
          closeModal();
        }, 1000);
      });
    });
  }

  // --- MODAL: DINING TABLE ---
  function openDiningTableModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🪑 Meja Makan Berenda & Jamuan Santai`;
    modalBody.innerHTML = `
      <div style="background: #fffbeb; border: 1.5px solid #fed7aa; border-radius: 16px; padding: 1.2rem; text-align: center;">
        <span style="font-size: 2.2rem;">🍰 🫖 🌸</span>
        <h4 style="margin: 8px 0; color: #9a3412;">Meja Makan Kayu Berenda Bunga</h4>
        <p style="font-size: 0.82rem; color: #7c2d12; line-height: 1.4;">"Duduk di kursi berukir bunga mawar, mencicipi sepotong kue hangat bersama sahabat di bawah sinar matahari pagi."</p>
        <div style="display: flex; gap: 8px; justify-content: center; margin-top: 1rem;">
          <button type="button" class="bloom-btn-primary" id="btn-taste-pastry">🧁 Cicipi Kue Hangat</button>
          <button type="button" class="bloom-btn-primary" id="btn-sip-table-tea" style="background: #c084fc;">🫖 Nikmati Teh Bersama</button>
        </div>
      </div>
    `;
    modalBackdrop.classList.add('active');

    const btnTaste = modalBody.querySelector('#btn-taste-pastry');
    if (btnTaste) {
      btnTaste.addEventListener('click', () => {
        playerAvatar?.classList.add('is-sitting');
        playChimeSuccess();
        toast(`🍰 Hmm... Rasa manisnya lembut dan lumer sempurna di lidah! Sukacita peri bertambah ☀️`);
        setTimeout(() => playerAvatar?.classList.remove('is-sitting'), 3000);
        closeModal();
      });
    }

    const btnSip = modalBody.querySelector('#btn-sip-table-tea');
    if (btnSip) {
      btnSip.addEventListener('click', () => {
        playTeaPourSound();
        toast(`🫖 Menyeruput teh hangat: Udara sejuk dan rasa manis persik berpadu indah 🌸`);
        closeModal();
      });
    }
  }

  // --- MODAL: PANTRY STORAGE ---
  function openPantryStorageModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🧺 Pantry Penyimpanan Hidangan`;
    const inv = currentState?.inventory?.cookedFoods || [];
    let listHtml = '';
    if (inv.length === 0) {
      listHtml = '<p style="color: #64748b; font-size: 0.85rem; text-align: center;">Pantry masih kosong. Yuk panggang kue atau racik minuman di dapur!</p>';
    } else {
      listHtml = '<div class="bloom-card-grid">';
      inv.forEach(id => {
        const r = BLOOM_RECIPES.find(rc => rc.id === id) || { name: id, icon: '🧁', desc: 'Hidangan manis buatan Bella' };
        listHtml += `
          <div class="bloom-item-card">
            <div class="bloom-item-card-header">
              <span class="bloom-item-card-icon">${r.icon}</span>
              <div>
                <h4 class="bloom-item-card-title">${r.name}</h4>
                <p class="bloom-item-card-desc">${r.desc}</p>
              </div>
            </div>
            <button type="button" class="bloom-btn-primary btn-eat-dish" data-dish="${r.name}">Nikmati Hidangan</button>
          </div>
        `;
      });
      listHtml += '</div>';
    }

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Hidangan kue, pai, dan minuman segar yang tersimpan di lemari pendingin peri:</p>
      ${listHtml}
    `;
    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-eat-dish').forEach(btn => {
      btn.addEventListener('click', () => {
        const dish = btn.getAttribute('data-dish');
        playChimeSuccess();
        toast(`✨ Menikmati ${dish}: Kehangatan manis menyegarkan hati! 🌸`);
        closeModal();
      });
    });
  }

  // --- MODAL: SEED COLLECTOR ---
  function openSeedCollectorModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🌱 Meja Pemilahan Benih Bunga`;
    let cards = '<div class="bloom-card-grid">';
    BLOOM_PLANTS.forEach(p => {
      cards += `
        <div class="bloom-item-card">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${p.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${p.name} (${p.rarity})</h4>
              <p class="bloom-item-card-desc">${p.desc}</p>
            </div>
          </div>
          <button type="button" class="bloom-btn-primary btn-take-seed" data-seed-id="${p.id}" data-seed-name="${p.name}">Kumpulkan Benih</button>
        </div>
      `;
    });
    cards += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Pilih benih tanaman bunga langka untuk ditanam di petak kubah kaca:</p>
      ${cards}
    `;
    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-take-seed').forEach(btn => {
      btn.addEventListener('click', () => {
        const sName = btn.getAttribute('data-seed-name');
        playChimeSuccess();
        toast(`🌱 Benih ${sName} berhasil dikumpulkan ke kantong benih peri! ✦`);
        closeModal();
      });
    });
  }

  // --- MODAL: HARVEST BENCH ---
  function openHarvestModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🧺 Petik Bunga Mekar & Panen Kelopak`;
    const plots = (currentState?.gardenPlots || []).filter(p => p.stage === 'bloomed');
    let content = '';
    if (plots.length === 0) {
      content = `
        <div style="text-align: center; padding: 1.5rem;">
          <span style="font-size: 2.2rem;">🌿 🌱</span>
          <p style="color: #64748b; font-size: 0.85rem; margin-top: 8px;">Belum ada bunga yang mekar sempurna. Sirami petak bunga di conservatory agar lekas mekar!</p>
        </div>
      `;
    } else {
      content = '<div class="bloom-card-grid">';
      plots.forEach(p => {
        const plant = BLOOM_PLANTS.find(pl => pl.id === p.plantId);
        content += `
          <div class="bloom-item-card">
            <div class="bloom-item-card-header">
              <span class="bloom-item-card-icon">${plant ? plant.icon : '🌸'}</span>
              <div>
                <h4 class="bloom-item-card-title">${plant ? plant.name : 'Bunga Peri'}</h4>
                <p class="bloom-item-card-desc">Petak #${p.id} · Kelopak harum siap dirangkai</p>
              </div>
            </div>
            <button type="button" class="bloom-btn-primary btn-do-harvest" data-plot-id="${p.id}">Petik Bunga</button>
          </div>
        `;
      });
      content += '</div>';
    }

    modalBody.innerHTML = content;
    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-do-harvest').forEach(btn => {
      btn.addEventListener('click', () => {
        const pId = parseInt(btn.getAttribute('data-plot-id'));
        if (currentState) {
          const plot = currentState.gardenPlots.find(p => p.id === pId);
          if (plot) {
            plot.stage = 'sprout';
            plot.watered = false;
          }
          currentState.stats.flowersHarvested = (currentState.stats.flowersHarvested || 0) + 1;
          saveCurrentState();
        }
        playChimeSuccess();
        toast(`🧺 Bunga harum berhasil dipetik ke keranjang panen! Tunas baru mulai tumbuh kembali 🌱`);
        closeModal();
      });
    });
  }

  // --- MODAL: KOI POND ---
  function openKoiPondModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `⛲ Kolam Teratai & Ikan Koi Kristal`;
    modalBody.innerHTML = `
      <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 16px; padding: 1.2rem; text-align: center;">
        <span style="font-size: 2.2rem;">🪷 🐟 ✨</span>
        <h4 style="margin: 8px 0; color: #166534;">Kolam Batu Air Teratai Jernih</h4>
        <p style="font-size: 0.82rem; color: #14532d; line-height: 1.4;">"Air jernih berkilauan dari mata air pulau peri. Ikan-ikan koi kristal berenang lincah di bawah daun teratai mekar."</p>
        <div style="display: flex; gap: 8px; justify-content: center; margin-top: 1rem;">
          <button type="button" class="bloom-btn-primary" id="btn-sip-pond-water" style="background: #10b981;">💧 Segarkan Wajah & Minum</button>
          <button type="button" class="bloom-btn-primary" id="btn-feed-koi" style="background: #f59e0b;">🐟 Beri Makan Ikan Koi</button>
        </div>
      </div>
    `;
    modalBackdrop.classList.add('active');

    const btnSip = modalBody.querySelector('#btn-sip-pond-water');
    if (btnSip) {
      btnSip.addEventListener('click', () => {
        playChimeSuccess();
        toast(`💧 Membasuh wajah dengan air embun teratai: Kesegaran murni memenuhi jiwa! 🌸`);
        closeModal();
      });
    }

    const btnFeed = modalBody.querySelector('#btn-feed-koi');
    if (btnFeed) {
      btnFeed.addEventListener('click', () => {
        playChimeSuccess();
        toast(`🐟 Ikan koi kristal melompat gembira menyambut remahan roti peri! ✨`);
        closeModal();
      });
    }
  }

  // --- MODAL: SAVE PHOTO ---
  function openSavePhotoModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🖼️ Pigura Foto Kenangan Skylight`;
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 1.2rem; background: #faf5ff; border: 1.5px dashed #c084fc; border-radius: 16px;">
        <span style="font-size: 2.5rem;">📸 🖼️ ☀️</span>
        <h4 style="margin: 8px 0; color: #581c87;">Pigura Kenangan di Bawah Cahaya Langit</h4>
        <p style="font-size: 0.82rem; color: #6b21a8; line-height: 1.4;">"Setiap potret merekam kehangatan persahabatan sejati di antara bintang-bintang semesta kita."</p>
        <button type="button" class="bloom-btn-primary" id="btn-pin-new-photo" style="margin-top: 8px;">📷 Abadikan Foto Baru</button>
      </div>
    `;
    modalBackdrop.classList.add('active');

    const btnPin = modalBody.querySelector('#btn-pin-new-photo');
    if (btnPin) {
      btnPin.addEventListener('click', () => {
        playChimeSuccess();
        toast(`📷 Momen persahabatan baru berhasil diabadikan dan dipajang di dinding loteng! ✨`);
        closeModal();
      });
    }
  }

  // --- MODAL: SECRETS ---
  function openSecretsModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `✨ Koleksi Tersembunyi & Rahasia Loteng`;
    let cards = '<div class="bloom-card-grid">';
    BLOOM_SECRETS.forEach(s => {
      const isFound = currentState?.inventory?.foundSecrets?.includes(s.id);
      cards += `
        <div class="bloom-item-card" style="${isFound ? 'border-color: #facc15;' : 'opacity: 0.8;'}">
          <div class="bloom-item-card-header">
            <span class="bloom-item-card-icon">${s.icon}</span>
            <div>
              <h4 class="bloom-item-card-title">${s.name}</h4>
              <p class="bloom-item-card-desc">${s.hint}</p>
            </div>
          </div>
          <span style="font-size: 0.72rem; color: ${isFound ? '#16a34a' : '#9ca3af'}; margin-top: 4px;">
            ${isFound ? '✓ Ditemukan & Disimpan di Peti' : '✦ Masih Tersembunyi'}
          </span>
        </div>
      `;
    });
    cards += '</div>';

    modalBody.innerHTML = `
      <p style="color: #64748b; font-size: 0.85rem; margin-top: 0;">Relik dan rahasia tersembunyi yang tersimpan di sudut-sudut Enchanted Bloom Cottage:</p>
      ${cards}
      <div style="margin-top: 1rem; text-align: center;">
        <button type="button" class="bloom-btn-primary" id="btn-search-attic-corners">🔍 Cari di Sudut Loteng</button>
      </div>
    `;
    modalBackdrop.classList.add('active');

    const btnSearch = modalBody.querySelector('#btn-search-attic-corners');
    if (btnSearch) {
      btnSearch.addEventListener('click', () => {
        const uncollected = BLOOM_SECRETS.filter(s => !currentState?.inventory?.foundSecrets?.includes(s.id));
        if (uncollected.length > 0) {
          const found = uncollected[0];
          if (currentState) {
            currentState.inventory.foundSecrets.push(found.id);
            saveCurrentState();
          }
          playChimeSuccess();
          toast(`✨ Menemukan ${found.name}! Tersimpan rapi ke koleksi rahasia 💎`);
        } else {
          playChimeSuccess();
          toast(`✨ Seluruh relik rahasia cottage sudah berhasil kamu kumpulkan! 👑`);
        }
        closeModal();
      });
    }
  }

  // --- MODAL: DAILY TASKS ---
  function openTasksModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `📋 Aktivitas Harian Peri — Daily Living Checklist`;

    const c = currentState?.dailyChecklist || {};
    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #4a2840;">
          <input type="checkbox" ${c.teaSipped ? 'checked' : ''} disabled> 🫖 Menyeduh & Menikmati Teh Hangat
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #4a2840;">
          <input type="checkbox" ${c.pianoPlayed ? 'checked' : ''} disabled> 🎹 Memainkan Piano Melodi Peri
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #4a2840;">
          <input type="checkbox" ${c.cakeBaked ? 'checked' : ''} disabled> 🧁 Memanggang Kue / Cupcake di Dapur
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #4a2840;">
          <input type="checkbox" ${c.gardenWatered ? 'checked' : ''} disabled> 💧 Menyiram Petak Bunga di Conservatory
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #4a2840;">
          <input type="checkbox" ${c.butterflyCaught ? 'checked' : ''} disabled> 🦋 Menemukan Kupu-kupu Langka
        </label>
        <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: #4a2840;">
          <input type="checkbox" ${c.restedInBed ? 'checked' : ''} disabled> 🛏️ Beristirahat di Ranjang Kanopi
        </label>
      </div>
      <div style="margin-top: 1rem; text-align: center;">
        <span style="font-size: 0.76rem; color: #16a34a; font-weight: 700;">★ Progres aktivitas tersimpan otomatis</span>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }

  // --- MODAL: INVENTORY ---
  function openInventoryModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = `🎒 Tas & Koleksi Pribadi Lala`;

    const inv = currentState?.inventory || {};
    const cookedList = (inv.cookedFoods || []).map(fId => {
      const r = BLOOM_RECIPES.find(rc => rc.id === fId);
      return `<li>${r ? r.icon + ' ' + r.name : fId}</li>`;
    }).join('') || '<li>Belum ada makanan tersimpan</li>';

    const bfList = (inv.discoveredButterflies || []).map(bId => {
      const b = BLOOM_BUTTERFLIES.find(bf => bf.id === bId);
      return `<li>${b ? b.icon + ' ' + b.name : bId}</li>`;
    }).join('') || '<li>Belum ada kupu-kupu ditemukan</li>';

    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">🧁 Makanan & Hidangan Tersimpan:</h4>
          <ul style="font-size: 0.78rem; color: #4a2840; margin: 4px 0 0 16px;">${cookedList}</ul>
        </div>
        <div class="bloom-item-card">
          <h4 class="bloom-item-card-title">🦋 Kupu-kupu Terkoleksi:</h4>
          <ul style="font-size: 0.78rem; color: #4a2840; margin: 4px 0 0 16px;">${bfList}</ul>
        </div>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  // ---------------------------------------------------------------------------
  // 4. EVENT LISTENERS SETUP
  // ---------------------------------------------------------------------------
  function setupEventListeners() {
    // Return button
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        closeBloomCottage();
        if (typeof onNavigateBack === 'function') {
          onNavigateBack();
        }
      });
    }

    // Modal Close
    if (btnModalClose) {
      btnModalClose.addEventListener('click', closeModal);
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    // Interaction prompt click
    if (promptEl) {
      promptEl.addEventListener('click', () => {
        if (activeNearbyHotspot) triggerHotspotAction(activeNearbyHotspot);
      });
    }

    // Room navigation tabs in top-right HUD
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.bloom-room-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-room-id');
          if (target && target !== currentRoomConfig.id) {
            renderRoom(target, true);
          }
        });
      });
    }

    // Atmosphere switcher
    if (btnAtmoToggle) {
      btnAtmoToggle.addEventListener('click', () => {
        const order = ['day', 'golden', 'twilight', 'night'];
        const currentIdx = order.indexOf(currentState?.atmosphere || 'day');
        const nextAtmo = order[(currentIdx + 1) % order.length];
        applyAtmosphere(nextAtmo);
        const atmoConfig = BLOOM_ATMOSPHERES.find(a => a.id === nextAtmo);
        toast(`🌤️ Pencahayaan diubah: ${atmoConfig?.name} (${atmoConfig?.icon}) ✨`);
        saveCurrentState();
      });
    }

    if (btnTasksModal) {
      btnTasksModal.addEventListener('click', openTasksModal);
    }

    if (btnBagModal) {
      btnBagModal.addEventListener('click', openInventoryModal);
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (!cottageView?.classList.contains('active')) return;

      // Handle Interaction key
      if (e.code === 'KeyE' || e.code === 'Enter') {
        if (activeNearbyHotspot) {
          e.preventDefault();
          triggerHotspotAction(activeNearbyHotspot);
          return;
        }
      }

      // Close modal on Escape
      if (e.code === 'Escape') {
        closeModal();
        return;
      }

      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        pressedKeys.add(e.code);
        startMovementLoop();
      }
    });

    window.addEventListener('keyup', (e) => {
      pressedKeys.delete(e.code);
    });

    // Touch D-Pad bindings
    const bindTouchDir = (el, dirKey) => {
      if (!el) return;
      const activate = (e) => { e.preventDefault(); touchState[dirKey] = true; startMovementLoop(); };
      const deactivate = (e) => { e.preventDefault(); touchState[dirKey] = false; };

      el.addEventListener('mousedown', activate);
      el.addEventListener('mouseup', deactivate);
      el.addEventListener('mouseleave', deactivate);
      el.addEventListener('touchstart', activate, { passive: false });
      el.addEventListener('touchend', deactivate, { passive: false });
    };

    bindTouchDir(dpadUp, 'up');
    bindTouchDir(dpadDown, 'down');
    bindTouchDir(dpadLeft, 'left');
    bindTouchDir(dpadRight, 'right');

    if (touchActionBtn) {
      touchActionBtn.addEventListener('click', () => {
        if (activeNearbyHotspot) triggerHotspotAction(activeNearbyHotspot);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 5. PUBLIC API
  // ---------------------------------------------------------------------------
  function openBloomCottage(charId = 'lala', targetRoom = 'living') {
    activeCharacter = normalizeBloomCharKey(charId);
    loadStateForActiveChar();

    if (cottageView) {
      cottageView.classList.add('active');
      cottageView.setAttribute('aria-hidden', 'false');
    }

    // Hide any outer views
    const viewToYou = document.getElementById('view-toyou-world');
    if (viewToYou) {
      viewToYou.classList.remove('active');
      viewToYou.setAttribute('aria-hidden', 'true');
    }

    renderRoom(targetRoom || currentState.currentRoom || 'living', true);
    startMovementLoop();

    toast(`🏡 Selamat datang di Enchanted Bloom Cottage — Lala's Fairy Home ☀️`);
    playChimeSuccess();
  }

  function closeBloomCottage() {
    stopMovementLoop();
    pressedKeys.clear();
    saveCurrentState();
    closeModal();

    if (cottageView) {
      cottageView.classList.remove('active');
      cottageView.setAttribute('aria-hidden', 'true');
    }

    const viewToYou = document.getElementById('view-toyou-world');
    if (viewToYou) {
      viewToYou.classList.add('active');
      viewToYou.setAttribute('aria-hidden', 'false');
    }
  }

  setupEventListeners();

  return {
    openBloomCottage,
    closeBloomCottage,
    renderRoom,
    triggerHotspotAction
  };
}
