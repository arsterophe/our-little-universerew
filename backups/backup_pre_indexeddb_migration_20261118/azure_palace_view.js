/**
 * THE AZURE TIDE PALACE — AKHIRA ⚡ (UNIVERSE YAWN)
 * 2D Interactive Simulation Controller & Game Loop
 * =============================================================================
 */

import {
  AZURE_PALACE_CHARACTER,
  AZURE_PALACE_ROOMS,
  AZURE_OCEAN_RECIPES,
  AZURE_CONSERVATORY_FLORA,
  AZURE_OCEAN_MEMORABILIA,
  AZURE_COLLECTIBLES,
  AZURE_PALACE_TASKS,
  AZURE_ATMOSPHERES,
  loadAzurePalaceState,
  saveAzurePalaceState,
  playAquaticPianoNote,
  playOceanChime,
  playElectricCyanResonance,
  playOceanCookingSizzle
} from './azure_palace_state.js';

export function initAzurePalaceView({ onShowToast, onTriggerSparkle, onNavigateBack } = {}) {
  // DOM Elements
  const palaceView = document.getElementById('view-azure-palace');
  const stageEl = document.getElementById('azure-palace-stage');
  const roomBgImg = document.getElementById('azure-palace-bg-img');
  const hotspotsContainer = document.getElementById('azure-palace-hotspots-container');
  const playerAvatar = document.getElementById('azure-palace-player-avatar');
  const promptEl = document.getElementById('azure-palace-interaction-prompt');
  const promptTextEl = document.getElementById('azure-palace-prompt-text');

  // Navigation HUDs
  const btnBack = document.getElementById('btn-azure-palace-back');
  const titleRoomEl = document.getElementById('azure-palace-room-title');
  const titleSubtitleEl = document.getElementById('azure-palace-room-subtitle');
  const navPillsContainer = document.getElementById('azure-palace-nav-pills');

  // Quick Tools
  const btnToolAtmo = document.getElementById('btn-azure-tool-atmo');
  const btnToolTasks = document.getElementById('btn-azure-tool-tasks');
  const btnToolBag = document.getElementById('btn-azure-tool-bag');

  // Modals & Overlays
  const modalBackdrop = document.getElementById('azure-palace-modal-backdrop');
  const modalTitle = document.getElementById('azure-palace-modal-title');
  const modalBody = document.getElementById('azure-palace-modal-body');
  const btnModalClose = document.getElementById('btn-azure-modal-close');
  const sleepOverlay = document.getElementById('azure-palace-sleep-overlay');
  const atmoOverlay = document.getElementById('azure-palace-atmo-overlay');

  // Touch controls
  const dpadUp = document.getElementById('azure-dpad-up');
  const dpadDown = document.getElementById('azure-dpad-down');
  const dpadLeft = document.getElementById('azure-dpad-left');
  const dpadRight = document.getElementById('azure-dpad-right');
  const touchActionBtn = document.getElementById('azure-touch-action');

  let activeCharacter = 'akhira';
  let currentState = null;
  let currentRoomConfig = AZURE_PALACE_ROOMS[0]; // Start at Ocean Living Room

  // Movement & Game Loop State
  const pressedKeys = new Set();
  const touchState = { up: false, down: false, left: false, right: false };
  let animFrameId = null;
  let isMoving = false;
  let facingLeft = false;
  let activeNearbyHotspot = null;

  function toast(msg) {
    if (typeof onShowToast === 'function') onShowToast(msg);
  }

  function sparkle(x, y) {
    if (typeof onTriggerSparkle === 'function') onTriggerSparkle(x, y);
  }

  function loadState() {
    currentState = loadAzurePalaceState(activeCharacter);
    const room = AZURE_PALACE_ROOMS.find(r => r.id === currentState.currentRoom) || AZURE_PALACE_ROOMS[0];
    currentRoomConfig = room;
    return true;
  }

  function saveCurrentState() {
    if (!currentState) return;
    saveAzurePalaceState(activeCharacter, currentState);
  }

  // ---------------------------------------------------------------------------
  // 1. RENDER ROOM & ATMOSPHERE
  // ---------------------------------------------------------------------------
  function renderRoom(roomId, spawnAtDefault = false) {
    const room = AZURE_PALACE_ROOMS.find(r => r.id === roomId) || AZURE_PALACE_ROOMS[0];
    currentRoomConfig = room;
    if (currentState) currentState.currentRoom = room.id;

    // Update Titles
    if (titleRoomEl) titleRoomEl.textContent = room.name;
    if (titleSubtitleEl) titleSubtitleEl.textContent = room.subtitle;

    // Update Background Image
    if (roomBgImg) {
      roomBgImg.src = room.bgImage;
      roomBgImg.alt = `${room.name} — THE AZURE TIDE PALACE`;
    }

    // Set Spawn Coordinates
    if (spawnAtDefault || !currentState.playerX) {
      currentState.playerX = room.spawnX;
      currentState.playerY = room.spawnY;
    }
    updateAvatarDOM(currentState.playerX, currentState.playerY);

    // Update Hotspots
    renderHotspots(room.hotspots);

    // Update Navigation Pills Highlight
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.azure-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.roomId === room.id);
      });
    }

    // Hide any previous interaction prompt
    hidePrompt();

    // Sound chime
    playOceanChime();
    saveCurrentState();
  }

  function applyAtmosphere(atmoId) {
    const atmo = AZURE_ATMOSPHERES.find(a => a.id === atmoId) || AZURE_ATMOSPHERES[0];
    if (currentState) currentState.atmosphere = atmo.id;
    if (atmoOverlay) {
      atmoOverlay.style.background = atmo.ambientOverlay;
    }
    saveCurrentState();
  }

  // ---------------------------------------------------------------------------
  // 2. RENDER HOTSPOTS DOM
  // ---------------------------------------------------------------------------
  function renderHotspots(hotspots = []) {
    if (!hotspotsContainer) return;
    hotspotsContainer.innerHTML = '';

    hotspots.forEach(hs => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'azure-palace-hotspot-item';
      btn.style.left = `${hs.x}%`;
      btn.style.top = `${hs.y}%`;
      btn.dataset.hotspotId = hs.id;
      btn.dataset.action = hs.action;
      btn.setAttribute('aria-label', hs.label);

      btn.innerHTML = `
        <span class="azure-palace-hotspot-beacon" aria-hidden="true">${hs.icon}</span>
        <span class="azure-palace-hotspot-label">${hs.label}</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHotspotAction(hs);
      });

      hotspotsContainer.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------------------
  // 3. AVATAR MOVEMENT & PROXIMITY DETECTION LOOP
  // ---------------------------------------------------------------------------
  function updateAvatarDOM(x, y) {
    if (!playerAvatar) return;
    playerAvatar.style.left = `${x}%`;
    playerAvatar.style.top = `${y}%`;
    playerAvatar.classList.toggle('facing-left', facingLeft);
    playerAvatar.classList.toggle('is-walking', isMoving);
  }

  function checkCollision(x, y) {
    const { bounds, obstacles } = currentRoomConfig;
    // Boundary check
    if (x < bounds.minX || x > bounds.maxX || y < bounds.minY || y > bounds.maxY) {
      return true;
    }
    // Obstacles check
    if (obstacles && obstacles.length > 0) {
      for (const obs of obstacles) {
        if (x >= obs.minX && x <= obs.maxX && y >= obs.minY && y <= obs.maxY) {
          return true;
        }
      }
    }
    return false;
  }

  function checkProximityHotspots() {
    if (!currentRoomConfig || !currentRoomConfig.hotspots || !currentState) return;
    const px = currentState.playerX;
    const py = currentState.playerY;

    let nearest = null;
    let minDist = 14; // Distance threshold in percentage

    for (const hs of currentRoomConfig.hotspots) {
      const dist = Math.hypot(hs.x - px, hs.y - py);
      if (dist < minDist) {
        minDist = dist;
        nearest = hs;
      }
    }

    if (nearest) {
      activeNearbyHotspot = nearest;
      showPrompt(nearest.prompt, nearest.x, nearest.y);
    } else {
      activeNearbyHotspot = null;
      hidePrompt();
    }
  }

  function showPrompt(text, x, y) {
    if (!promptEl || !promptTextEl) return;
    promptTextEl.textContent = text;
    promptEl.style.left = `${x}%`;
    promptEl.style.top = `calc(${y}% - 35px)`;
    promptEl.classList.add('show');
  }

  function hidePrompt() {
    if (!promptEl) return;
    promptEl.classList.remove('show');
  }

  function gameLoop() {
    if (!palaceView || !palaceView.classList.contains('active')) {
      animFrameId = requestAnimationFrame(gameLoop);
      return;
    }

    let dx = 0;
    let dy = 0;
    const speed = 0.52; // Percentage per frame

    if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp') || touchState.up) dy -= speed;
    if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown') || touchState.down) dy += speed;
    if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft') || touchState.left) {
      dx -= speed;
      facingLeft = true;
    }
    if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight') || touchState.right) {
      dx += speed;
      facingLeft = false;
    }

    if (dx !== 0 || dy !== 0) {
      isMoving = true;
      if (playerAvatar) playerAvatar.classList.remove('is-sitting');

      const nextX = currentState.playerX + dx;
      const nextY = currentState.playerY + dy;

      if (!checkCollision(nextX, currentState.playerY)) {
        currentState.playerX = nextX;
      }
      if (!checkCollision(currentState.playerX, nextY)) {
        currentState.playerY = nextY;
      }

      updateAvatarDOM(currentState.playerX, currentState.playerY);
      checkProximityHotspots();
    } else {
      if (isMoving) {
        isMoving = false;
        updateAvatarDOM(currentState.playerX, currentState.playerY);
        saveCurrentState();
      }
    }

    animFrameId = requestAnimationFrame(gameLoop);
  }

  // ---------------------------------------------------------------------------
  // 4. HOTSPOT ACTIONS & INTERACTIVE SUB-MODALS
  // ---------------------------------------------------------------------------
  function triggerHotspotAction(hs) {
    if (!hs) return;
    const action = hs.action;

    // Room door transitions
    if (action === 'goto_living') {
      renderRoom('living', true);
      toast('🌊 Masuk ke Ocean Living Room');
      return;
    }
    if (action === 'goto_bedroom') {
      renderRoom('bedroom', true);
      toast('🛏️ Masuk ke Pearl Dream Bedroom');
      return;
    }
    if (action === 'goto_kitchen') {
      renderRoom('kitchen', true);
      toast('🍳 Masuk ke Coral Kitchen');
      return;
    }
    if (action === 'goto_conservatory') {
      renderRoom('conservatory', true);
      toast('🌿 Masuk ke The Bioluminescent Conservatory');
      return;
    }
    if (action === 'goto_gallery') {
      renderRoom('gallery', true);
      toast('🏛️ Masuk ke The Ocean Memory Gallery');
      return;
    }

    // Specific Room Activities
    switch (action) {
      case 'sit_sofa':
        handleSitSofa();
        break;
      case 'play_piano':
        openPianoModal();
        break;
      case 'gaze_ocean':
        openGazeOceanModal();
        break;
      case 'read_bookshelf':
        openBookshelfModal();
        break;
      case 'sip_tea':
        handleSipTea();
        break;
      case 'rest_bed':
        handleRestBed();
        break;
      case 'write_journal':
        openJournalModal();
        break;
      case 'open_wardrobe':
        openWardrobeModal();
        break;
      case 'look_balcony':
        openBalconyModal();
        break;
      case 'bedroom_decor':
        openDecorModal();
        break;
      case 'cook_oven':
      case 'recipe_book':
        openCookingModal();
        break;
      case 'open_fridge':
        openFridgeModal();
        break;
      case 'prep_counter':
      case 'dining_table':
        handleDiningTable();
        break;
      case 'tend_garden_bed':
      case 'tend_crystal_pot':
        openGardenModal();
        break;
      case 'interact_pond':
        handlePearlPond();
        break;
      case 'water_all_plants':
        handleWaterAllPlants();
        break;
      case 'harvest_garden':
        handleHarvestGarden();
        break;
      case 'read_bottles':
        openBottlesModal();
        break;
      case 'channel_lightning':
        handleChannelLightning();
        break;
      case 'view_album':
        openAlbumModal();
        break;
      case 'pearl_showcase':
        openPearlShowcaseModal();
        break;
      case 'secret_collectibles':
        openCollectiblesModal();
        break;
      default:
        toast(`✦ Mengamati ${hs.label}`);
    }
  }

  // --- A. Living Room Activities ---
  function handleSitSofa() {
    if (playerAvatar) playerAvatar.classList.add('is-sitting');
    playOceanChime();
    completeTask('task_relax_sofa');
    toast('🛋️ Akhira bersantai di sofa mutiara pearl white yang lembut...');
  }

  function handleSipTea() {
    playOceanChime();
    toast('🫖 Menikmati Eliksir Teh Rumput Laut dingin bertabur kristal gula samudra.');
  }

  function openPianoModal() {
    const keys = [
      { note: 'C4', label: 'Do', freq: 261.63 },
      { note: 'D4', label: 'Re', freq: 293.66 },
      { note: 'E4', label: 'Mi', freq: 329.63 },
      { note: 'F4', label: 'Fa', freq: 349.23 },
      { note: 'G4', label: 'Sol', freq: 392.00 },
      { note: 'A4', label: 'La', freq: 440.00 },
      { note: 'B4', label: 'Si', freq: 493.88 },
      { note: 'C5', label: 'Do ✦', freq: 523.25 }
    ];

    let html = `
      <p style="margin-bottom:14px;color:var(--az-aquamarine);">
        Piano kristal akuatik memancarkan notasi bergaung lembut bagaikan gelombang samudra. Tekan tuts untuk bermain:
      </p>
      <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:18px 0;">
    `;

    keys.forEach(k => {
      html += `
        <button type="button" class="azure-piano-key" data-freq="${k.freq}"
          style="background:linear-gradient(180deg,#fff 0%,#e0f2fe 100%);color:#0369a1;border:1.5px solid var(--az-glass-border);border-radius:8px;padding:24px 14px;font-weight:700;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.4);transition:all 0.15s ease;">
          <div style="font-size:1.1rem;">${k.note}</div>
          <div style="font-size:0.75rem;opacity:0.75;margin-top:4px;">${k.label}</div>
        </button>
      `;
    });

    html += `
      </div>
      <p style="font-size:0.75rem;color:var(--az-soft-silver);text-align:center;">
        ✦ Melodi astral yang menenangkan kehidupan laut di sekitar istana.
      </p>
    `;

    showModal('🎹 Piano Kristal Akuatik', html);

    modalBody.querySelectorAll('.azure-piano-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const freq = parseFloat(btn.dataset.freq);
        playAquaticPianoNote(freq);
        btn.style.transform = 'translateY(4px)';
        setTimeout(() => btn.style.transform = 'none', 150);
        currentState.stats.notesPlayed++;
        completeTask('task_play_piano');
        saveCurrentState();
      });
    });
  }

  function openGazeOceanModal() {
    currentState.stats.oceanGazedCount++;
    saveCurrentState();
    playOceanChime();

    const html = `
      <div style="text-align:center;padding:10px 0;">
        <div style="font-size:3rem;margin-bottom:10px;animation:azureBeaconPulse 3s infinite;">🐋 🫧 🌊</div>
        <h4 style="color:#fff;margin:0 0 8px;font-size:1.1rem;">Pemandangan Palung Samudra & Paus Astral</h4>
        <p style="color:var(--az-soft-silver);margin-bottom:14px;">
          Di luar jendela kaca aquarium kristal, seekor Paus Astral bercahaya berenang melintasi langit bawah laut YAWN.
          Keluarga ubur-ubur neon berpendar gemerlap, sementara terumbu karang ungu dan aquamarine menari perlahan mengikuti arus pasang samudra.
        </p>
        <div style="background:rgba(34,211,238,0.1);border:1px solid var(--az-glass-border);border-radius:12px;padding:12px;color:var(--az-aquamarine);font-size:0.8rem;">
          ✦ Energi samudra memulihkan pikiran. Ketenangan dan keteduhan mengisi setiap sudut istana.
        </div>
      </div>
    `;
    showModal('🐋 Aquarium Window Bawah Laut', html);
  }

  function openBookshelfModal() {
    playOceanChime();
    const html = `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <h4 style="color:#fff;margin:0;">Pustaka Gulungan Samudra & Peta Bintang YAWN</h4>
        <div style="background:rgba(2,132,199,0.15);padding:10px;border-radius:10px;border-left:3px solid var(--az-electric-cyan);">
          <strong style="color:var(--az-electric-cyan);">📖 Bab I: Lahirnya Samudra Astral</strong>
          <p style="margin:4px 0 0;font-size:0.8rem;">Ketika petir angkasa pertama kali menyentuh palung lautan, terciptalah kristal biru yang menyerap keheningan samudra abadi.</p>
        </div>
        <div style="background:rgba(2,132,199,0.15);padding:10px;border-radius:10px;border-left:3px solid var(--az-aquamarine);">
          <strong style="color:var(--az-aquamarine);">📖 Bab II: Menara-Menara Kristal YAWN</strong>
          <p style="margin:4px 0 0;font-size:0.8rem;">Istana The Azure Tide Palace dibangun dengan pondasi karang purba yang berakar kuat pada jantung planet.</p>
        </div>
      </div>
    `;
    showModal('📚 Rak Buku Kerang & Gulungan Samudra', html);
  }

  // --- B. Bedroom Activities ---
  function handleRestBed() {
    if (!sleepOverlay) return;
    sleepOverlay.classList.add('active');
    playOceanChime();

    setTimeout(() => {
      sleepOverlay.classList.remove('active');
      completeTask('task_relax_sofa');
      toast('✨ Akhira telah bangun dengan energi samudra yang segar dan penuh semangat!');
    }, 2400);
  }

  function openJournalModal() {
    let entriesHtml = '';
    currentState.journalEntries.forEach(j => {
      entriesHtml += `
        <div style="background:rgba(3,20,31,0.6);border:1px solid var(--az-glass-border);border-radius:10px;padding:10px;margin-bottom:10px;">
          <div style="display:flex;justify-content:space-between;color:var(--az-champagne-gold);font-weight:700;font-size:0.85rem;">
            <span>${j.title}</span>
            <span style="font-size:0.75rem;opacity:0.8;">${j.date}</span>
          </div>
          <p style="margin:6px 0 0;font-size:0.8rem;color:var(--az-soft-silver);">${j.content}</p>
        </div>
      `;
    });

    const html = `
      <div>
        <p style="margin-bottom:12px;color:var(--az-aquamarine);">Catatan & Renungan Harian Akhira di Bawah Laut:</p>
        <div style="max-height:160px;overflow-y:auto;margin-bottom:14px;">${entriesHtml}</div>
        <div style="border-top:1px solid var(--az-glass-border);padding-top:12px;">
          <input type="text" id="azure-journal-title" placeholder="Judul Catatan Baru..." 
            style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--az-glass-border);color:#fff;border-radius:8px;padding:8px;margin-bottom:8px;font-size:0.85rem;">
          <textarea id="azure-journal-body" placeholder="Tuliskan renungan ombak dan mimpimu di sini..." rows="3"
            style="width:100%;box-sizing:border-box;background:rgba(0,0,0,0.4);border:1px solid var(--az-glass-border);color:#fff;border-radius:8px;padding:8px;font-size:0.85rem;resize:none;"></textarea>
          <button type="button" id="btn-save-azure-journal"
            style="margin-top:8px;background:linear-gradient(135deg,var(--az-ocean-blue),var(--az-deep-teal));color:#fff;border:none;border-radius:10px;padding:8px 16px;font-weight:700;cursor:pointer;width:100%;">
            ✦ Simpan ke Jurnal Ombak
          </button>
        </div>
      </div>
    `;

    showModal('📓 Meja Rias & Jurnal Samudra', html);

    const btnSave = document.getElementById('btn-save-azure-journal');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const titleInput = document.getElementById('azure-journal-title');
        const bodyInput = document.getElementById('azure-journal-body');
        const title = titleInput?.value.trim() || 'Renungan Samudra';
        const content = bodyInput?.value.trim();

        if (content) {
          currentState.journalEntries.unshift({
            id: 'j_' + Date.now(),
            title,
            date: 'Hari Tenang',
            content
          });
          saveCurrentState();
          playOceanChime();
          toast('✦ Catatan berhasil disimpan ke dalam Jurnal Ombak!');
          closeModal();
        }
      });
    }
  }

  function openWardrobeModal() {
    const outfits = [
      { id: 'robe_tide', name: 'Jubah Pasang Samudra (Default)', icon: '👗', desc: 'Jubah sutra bergradasi biru samudra dengan bordir mutiara.' },
      { id: 'robe_storm', name: 'Gaun Petir Angkasa ⚡', icon: '⚡', desc: 'Gaun anggun berpendar cyan bertepi kilatan energi halus.' },
      { id: 'robe_coral', name: 'Busana Karang Senja', icon: '🌺', desc: 'Pakaian pesta bawah laut warna peach karang dan aquamarine.' }
    ];

    let html = '<div style="display:flex;flex-direction:column;gap:10px;">';
    outfits.forEach(o => {
      html += `
        <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(3,20,31,0.6);border:1px solid var(--az-glass-border);border-radius:12px;padding:12px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.6rem;">${o.icon}</span>
            <div>
              <strong style="color:#fff;display:block;">${o.name}</strong>
              <span style="font-size:0.75rem;color:var(--az-soft-silver);">${o.desc}</span>
            </div>
          </div>
          <button type="button" class="btn-select-outfit" data-id="${o.id}"
            style="background:rgba(34,211,238,0.2);border:1px solid var(--az-electric-cyan);color:#fff;padding:6px 12px;border-radius:8px;font-size:0.75rem;font-weight:700;cursor:pointer;">
            Kenakan
          </button>
        </div>
      `;
    });
    html += '</div>';

    showModal('👗 Lemari Busana Samudra', html);

    modalBody.querySelectorAll('.btn-select-outfit').forEach(btn => {
      btn.addEventListener('click', () => {
        playOceanChime();
        toast(`👗 Akhira telah mengenakan ${btn.dataset.id}!`);
        closeModal();
      });
    });
  }

  function openBalconyModal() {
    playOceanChime();
    const html = `
      <div style="text-align:center;padding:12px 0;">
        <div style="font-size:3rem;margin-bottom:10px;">🫧 🪼 🌊</div>
        <h4 style="color:#fff;margin:0 0 8px;">Teras Observasi Laut Dalam</h4>
        <p style="color:var(--az-soft-silver);font-size:0.85rem;">
          Berdiri di balkon teras bawah laut yang dilindungi kubah gelembung udara hangat.
          Di kejauhan tampak formasi terumbu karang bercahaya dan kawanan ubur-ubur ungu yang melayang tenang.
        </p>
      </div>
    `;
    showModal('🌅 Balkon Observasi Laut Dalam', html);
  }

  function openDecorModal() {
    const html = `
      <div>
        <p style="color:var(--az-aquamarine);margin-bottom:12px;">Pilih warna kanopi dan pencahayaan kamar tidur:</p>
        <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
          <button type="button" class="btn-decor-opt" data-opt="aquamarine" style="padding:12px;border-radius:10px;background:#0d9488;color:#fff;font-weight:700;border:none;cursor:pointer;">Aquamarine Silk</button>
          <button type="button" class="btn-decor-opt" data-opt="pearl" style="padding:12px;border-radius:10px;background:#f8fafc;color:#0369a1;font-weight:700;border:none;cursor:pointer;">Pearl White</button>
          <button type="button" class="btn-decor-opt" data-opt="deep_blue" style="padding:12px;border-radius:10px;background:#0369a1;color:#fff;font-weight:700;border:none;cursor:pointer;">Deep Ocean</button>
          <button type="button" class="btn-decor-opt" data-opt="lavender" style="padding:12px;border-radius:10px;background:#6366f1;color:#fff;font-weight:700;border:none;cursor:pointer;">Lavender Tide</button>
        </div>
      </div>
    `;
    showModal('🐚 Kustomisasi Dekorasi Mutiara', html);

    modalBody.querySelectorAll('.btn-decor-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        currentState.decorOptions.bedroomCanopyColor = btn.dataset.opt;
        saveCurrentState();
        playOceanChime();
        toast(`✦ Dekorasi kamar tidur diatur ke nuansa ${btn.dataset.opt}!`);
        closeModal();
      });
    });
  }

  // --- C. Kitchen Activities ---
  function openCookingModal() {
    let recipesHtml = '<div style="display:flex;flex-direction:column;gap:12px;">';

    AZURE_OCEAN_RECIPES.forEach(r => {
      const hasCooked = currentState.cookedDishes.includes(r.id);
      recipesHtml += `
        <div style="background:rgba(3,20,31,0.6);border:1px solid var(--az-glass-border);border-radius:12px;padding:12px;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:2rem;">${r.icon}</span>
            <div>
              <strong style="color:#fff;font-size:0.95rem;">${r.name} ${hasCooked ? '⭐' : ''}</strong>
              <p style="margin:2px 0;font-size:0.75rem;color:var(--az-soft-silver);">${r.desc}</p>
              <span style="font-size:0.7rem;color:var(--az-aquamarine);">Bahan: ${r.ingredients.join(' + ')}</span>
            </div>
          </div>
          <button type="button" class="btn-cook-recipe" data-recipe-id="${r.id}"
            style="background:linear-gradient(135deg,var(--az-ocean-blue),var(--az-deep-teal));border:1px solid var(--az-electric-cyan);color:#fff;padding:8px 14px;border-radius:10px;font-weight:700;cursor:pointer;white-space:nowrap;">
            Masak 🍳
          </button>
        </div>
      `;
    });

    recipesHtml += '</div>';

    showModal('📖 Buku Resep & Kompor Coral Kitchen', recipesHtml);

    modalBody.querySelectorAll('.btn-cook-recipe').forEach(btn => {
      btn.addEventListener('click', () => {
        const recipeId = btn.dataset.recipeId;
        const recipe = AZURE_OCEAN_RECIPES.find(r => r.id === recipeId);
        if (!recipe) return;

        btn.disabled = true;
        btn.textContent = 'Memasak... ♨️';
        playOceanCookingSizzle();

        setTimeout(() => {
          if (!currentState.cookedDishes.includes(recipe.id)) {
            currentState.cookedDishes.push(recipe.id);
          }
          currentState.stats.dishesCooked++;
          completeTask('task_cook_recipe');
          saveCurrentState();
          playOceanChime();
          toast(`🍳 Berhasil memasak ${recipe.name}! (+${recipe.rewardXp} XP)`);
          closeModal();
        }, 1800);
      });
    });
  }

  function openFridgeModal() {
    playOceanChime();
    const ingredients = [
      { id: 'glow_kelp', name: 'Glow Kelp', icon: '🌿' },
      { id: 'pearl_rice', name: 'Pearl Rice', icon: '🍚' },
      { id: 'coral_berries', name: 'Coral Berries', icon: '🍒' },
      { id: 'crystal_sugar', name: 'Crystal Sugar', icon: '🍬' },
      { id: 'seafoam_cream', name: 'Seafoam Cream', icon: '🥛' },
      { id: 'abyssal_water', name: 'Abyssal Essence Water', icon: '💧' }
    ];

    let html = `
      <p style="color:var(--az-aquamarine);margin-bottom:12px;">Kulkas mutiara berisi bahan-bahan segar dari samudra. Pilih bahan untuk dimasukkan ke tas:</p>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
    `;

    ingredients.forEach(ing => {
      html += `
        <button type="button" class="btn-gather-ing" data-name="${ing.name}" data-icon="${ing.icon}" data-id="${ing.id}"
          style="display:flex;align-items:center;gap:8px;background:rgba(3,20,31,0.6);border:1px solid var(--az-glass-border);color:#fff;padding:10px;border-radius:10px;cursor:pointer;">
          <span style="font-size:1.4rem;">${ing.icon}</span>
          <div style="text-align:left;">
            <strong style="font-size:0.8rem;display:block;">${ing.name}</strong>
            <span style="font-size:0.7rem;color:var(--az-soft-silver);">+1 ke Tas</span>
          </div>
        </button>
      `;
    });

    html += '</div>';

    showModal('❄️ Kulkas Mutiara Bahan Segar', html);

    modalBody.querySelectorAll('.btn-gather-ing').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const icon = btn.dataset.icon;

        let item = currentState.inventory.find(i => i.id === id);
        if (item) {
          item.count++;
        } else {
          currentState.inventory.push({ id, name, icon, count: 1 });
        }
        saveCurrentState();
        playOceanChime();
        toast(`✦ Mengambil 1x ${name} dari kulkas mutiara!`);
      });
    });
  }

  function handleDiningTable() {
    playOceanChime();
    toast('🍽️ Duduk di meja makan karang, menikmati hidangan laut hangat bersama.');
  }

  // --- D. The Conservatory Activities ---
  function openGardenModal() {
    let slotsHtml = '<div style="display:flex;flex-direction:column;gap:12px;">';

    currentState.gardenSlots.forEach(slot => {
      const flora = AZURE_CONSERVATORY_FLORA.find(f => f.id === slot.seedId) || AZURE_CONSERVATORY_FLORA[0];
      const isBlooming = slot.stage === 'blooming';
      const isGrowing = slot.stage === 'growing';

      slotsHtml += `
        <div style="background:rgba(3,20,31,0.6);border:1px solid var(--az-glass-border);border-radius:12px;padding:12px;display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:12px;">
            <span style="font-size:2.2rem;animation:${isBlooming ? 'azureBeaconPulse 3s infinite' : 'none'};">
              ${isBlooming ? flora.bloomIcon : (isGrowing ? flora.icon : '🌱')}
            </span>
            <div>
              <strong style="color:#fff;display:block;">Slot ${slot.slotId}: ${slot.plantName}</strong>
              <span style="font-size:0.75rem;color:${isBlooming ? 'var(--az-champagne-gold)' : 'var(--az-aquamarine)'};">
                Status: ${isBlooming ? 'Mekar Sempurna! (Siap Panen)' : (isGrowing ? 'Sedang Bertumbuh 🌿' : 'Benih Tertanam 🌱')}
              </span>
              <p style="margin:2px 0 0;font-size:0.7rem;color:var(--az-soft-silver);">${flora.desc}</p>
            </div>
          </div>
          <div>
            ${isBlooming ? `
              <button type="button" class="btn-harvest-slot" data-slot="${slot.slotId}"
                style="background:linear-gradient(135deg,#059669,#10b981);border:none;color:#fff;padding:8px 14px;border-radius:10px;font-weight:700;cursor:pointer;">
                Panen ✨
              </button>
            ` : `
              <button type="button" class="btn-water-slot" data-slot="${slot.slotId}"
                style="background:linear-gradient(135deg,var(--az-ocean-blue),var(--az-deep-teal));border:1px solid var(--az-electric-cyan);color:#fff;padding:8px 14px;border-radius:10px;font-weight:700;cursor:pointer;">
                Siram 💧
              </button>
            `}
          </div>
        </div>
      `;
    });

    slotsHtml += '</div>';

    showModal('🌿 The Bioluminescent Conservatory', slotsHtml);

    modalBody.querySelectorAll('.btn-water-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = parseInt(btn.dataset.slot, 10);
        const slot = currentState.gardenSlots.find(s => s.slotId === slotId);
        if (slot) {
          slot.watered = true;
          slot.stage = 'blooming';
          saveCurrentState();
          playOceanChime();
          completeTask('task_water_plants');
          toast(`💧 Menyiram Slot ${slotId} dengan air esensi samudra! Tanaman mekar sempurna!`);
          openGardenModal();
        }
      });
    });

    modalBody.querySelectorAll('.btn-harvest-slot').forEach(btn => {
      btn.addEventListener('click', () => {
        const slotId = parseInt(btn.dataset.slot, 10);
        const slot = currentState.gardenSlots.find(s => s.slotId === slotId);
        if (slot) {
          const flora = AZURE_CONSERVATORY_FLORA.find(f => f.id === slot.seedId) || AZURE_CONSERVATORY_FLORA[0];
          let item = currentState.inventory.find(i => i.id === flora.id);
          if (item) {
            item.count += 2;
          } else {
            currentState.inventory.push({ id: flora.id, name: flora.yieldItem, icon: flora.icon, count: 2 });
          }
          slot.stage = 'growing';
          slot.watered = false;
          currentState.stats.plantsHarvested++;
          saveCurrentState();
          playOceanChime();
          toast(`✨ Berhasil memanen 2x ${flora.yieldItem}!`);
          openGardenModal();
        }
      });
    });
  }

  function handlePearlPond() {
    playOceanChime();
    toast('🦪 Kolam kerang raksasa membuka kelopaknya, memancarkan air esensi laut berkilau mutiara.');
  }

  function handleWaterAllPlants() {
    currentState.gardenSlots.forEach(s => {
      s.watered = true;
      s.stage = 'blooming';
    });
    saveCurrentState();
    playOceanChime();
    completeTask('task_water_plants');
    toast('💧 Seluruh petak tanaman laut telah disiram dengan air esensi arus samudra!');
  }

  function handleHarvestGarden() {
    let harvestedCount = 0;
    currentState.gardenSlots.forEach(s => {
      if (s.stage === 'blooming') {
        const flora = AZURE_CONSERVATORY_FLORA.find(f => f.id === s.seedId) || AZURE_CONSERVATORY_FLORA[0];
        let item = currentState.inventory.find(i => i.id === flora.id);
        if (item) item.count += 2;
        else currentState.inventory.push({ id: flora.id, name: flora.yieldItem, icon: flora.icon, count: 2 });
        s.stage = 'seed';
        s.watered = false;
        harvestedCount++;
      }
    });
    currentState.stats.plantsHarvested += harvestedCount;
    saveCurrentState();
    playOceanChime();
    toast(harvestedCount > 0 ? `✨ Berhasil memanen ${harvestedCount} petak tanaman laut!` : '🌱 Belum ada tanaman yang mekar sempurna untuk dipanen.');
  }

  // --- E. Ocean Memory Gallery Activities ---
  function openBottlesModal() {
    let html = '<div style="display:flex;flex-direction:column;gap:12px;">';
    AZURE_OCEAN_MEMORABILIA.forEach(b => {
      html += `
        <div style="background:rgba(3,20,31,0.6);border:1px solid var(--az-glass-border);border-radius:12px;padding:12px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="font-size:1.5rem;">${b.icon}</span>
            <strong style="color:var(--az-champagne-gold);font-size:0.9rem;">${b.title}</strong>
            <span style="margin-left:auto;font-size:0.75rem;color:var(--az-soft-silver);">${b.date}</span>
          </div>
          <p style="margin:0;font-size:0.8rem;color:var(--az-soft-silver);line-height:1.5;font-style:italic;">
            ${b.text}
          </p>
        </div>
      `;
    });
    html += '</div>';

    showModal('🍾 Rak Botol Pesan Terapung Samudra', html);
    completeTask('task_read_bottle');
  }

  function handleChannelLightning() {
    playElectricCyanResonance();
    currentState.stats.lightningChanneledCount++;
    completeTask('task_channel_lightning');
    saveCurrentState();

    if (stageEl) {
      stageEl.style.boxShadow = '0 0 80px rgba(34, 211, 238, 0.95), 0 0 40px #fff';
      setTimeout(() => {
        stageEl.style.boxShadow = '';
      }, 700);
    }

    toast('⚡ Akhira menyalurkan energi petir laut ke altar! Kristal cyan beresonansi dengan gelombang pasang samudra!');
  }

  function openAlbumModal() {
    playOceanChime();
    const html = `
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">
        <div style="background:rgba(0,0,0,0.4);border:1px solid var(--az-glass-border);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:2.5rem;margin-bottom:6px;">✨ 🏰</div>
          <strong style="color:#fff;font-size:0.8rem;display:block;">Pembangunan Istana</strong>
          <span style="font-size:0.7rem;color:var(--az-soft-silver);">Dasar Laut YAWN</span>
        </div>
        <div style="background:rgba(0,0,0,0.4);border:1px solid var(--az-glass-border);border-radius:10px;padding:10px;text-align:center;">
          <div style="font-size:2.5rem;margin-bottom:6px;">🐋 ⚡</div>
          <strong style="color:#fff;font-size:0.8rem;display:block;">Pertemuan Paus Astral</strong>
          <span style="font-size:0.7rem;color:var(--az-soft-silver);">Palung Bintang</span>
        </div>
      </div>
    `;
    showModal('🖼️ Album Kenangan Eksplorasi Samudra', html);
  }

  function openPearlShowcaseModal() {
    playOceanChime();
    const html = `
      <div style="display:flex;flex-direction:column;gap:10px;">
        <div style="background:rgba(3,20,31,0.6);border:1px solid var(--az-glass-border);border-radius:10px;padding:12px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:2rem;color:var(--az-champagne-gold);">🦪</span>
          <div>
            <strong style="color:#fff;">Mutiara Bintang Aquamarine</strong>
            <p style="margin:2px 0 0;font-size:0.75rem;color:var(--az-soft-silver);">Mutiara jernih berbias cahaya langit yang memantulkan rasi bintang YAWN.</p>
          </div>
        </div>
        <div style="background:rgba(3,20,31,0.6);border:1px solid var(--az-glass-border);border-radius:10px;padding:12px;display:flex;align-items:center;gap:12px;">
          <span style="font-size:2rem;color:var(--az-electric-cyan);">🔮</span>
          <div>
            <strong style="color:#fff;">Mutiara Petir Samudra ⚡</strong>
            <p style="margin:2px 0 0;font-size:0.75rem;color:var(--az-soft-silver);">Mutiara bermuatan arus elektrik mikro hangat yang tak pernah padam.</p>
          </div>
        </div>
      </div>
    `;
    showModal('🔮 Pajangan Koleksi Mutiara Berharga', html);
  }

  function openCollectiblesModal() {
    playOceanChime();
    let html = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">';

    AZURE_COLLECTIBLES.forEach(c => {
      const stateItem = currentState.collectibles.find(item => item.id === c.id);
      const isFound = stateItem && stateItem.found;

      html += `
        <div style="background:rgba(3,20,31,0.6);border:1px solid ${isFound ? 'var(--az-electric-cyan)' : 'rgba(255,255,255,0.1)'};border-radius:12px;padding:12px;text-align:center;">
          <span style="font-size:2.2rem;display:block;margin-bottom:6px;filter:${isFound ? 'none' : 'grayscale(1) opacity(0.4)'};">
            ${c.icon}
          </span>
          <strong style="color:${isFound ? '#fff' : 'rgba(255,255,255,0.4)'};font-size:0.8rem;display:block;">
            ${c.name}
          </strong>
          <span style="font-size:0.7rem;color:${isFound ? 'var(--az-aquamarine)' : 'rgba(255,255,255,0.3)'};">
            ${isFound ? 'Ditemukan ✦' : 'Belum Ditemukan'}
          </span>
          <p style="margin:4px 0 0;font-size:0.68rem;color:var(--az-soft-silver);">${c.desc}</p>
        </div>
      `;
    });

    html += '</div>';

    showModal('🗝️ Peti Artefak & Kolektibel Rahasia', html);
  }

  // --- F. Quick Tools Modals ---
  function openAtmosphereModal() {
    let html = '<div style="display:flex;flex-direction:column;gap:10px;">';
    AZURE_ATMOSPHERES.forEach(a => {
      const isActive = currentState.atmosphere === a.id;
      html += `
        <button type="button" class="btn-select-atmo" data-id="${a.id}"
          style="display:flex;align-items:center;gap:12px;background:${isActive ? 'rgba(34,211,238,0.2)' : 'rgba(3,20,31,0.6)'};border:1.5px solid ${isActive ? 'var(--az-electric-cyan)' : 'var(--az-glass-border)'};border-radius:12px;padding:12px;color:#fff;text-align:left;cursor:pointer;">
          <span style="font-size:2rem;">${a.icon}</span>
          <div>
            <strong style="font-size:0.95rem;display:block;">${a.name} ${isActive ? '✓' : ''}</strong>
            <span style="font-size:0.75rem;color:var(--az-soft-silver);">${a.desc}</span>
          </div>
        </button>
      `;
    });
    html += '</div>';

    showModal('🌤️ Pencahayaan & Suasana Samudra', html);

    modalBody.querySelectorAll('.btn-select-atmo').forEach(btn => {
      btn.addEventListener('click', () => {
        applyAtmosphere(btn.dataset.id);
        playOceanChime();
        toast(`✦ Suasana istana diatur ke: ${btn.dataset.id}`);
        closeModal();
      });
    });
  }

  function openTasksModal() {
    let html = '<div style="display:flex;flex-direction:column;gap:10px;">';
    currentState.tasks.forEach(t => {
      html += `
        <div style="background:rgba(3,20,31,0.6);border:1px solid ${t.completed ? 'var(--az-aquamarine)' : 'var(--az-glass-border)'};border-radius:10px;padding:10px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <strong style="color:${t.completed ? 'var(--az-aquamarine)' : '#fff'};font-size:0.85rem;">
              ${t.completed ? '☑' : '☐'} ${t.title}
            </strong>
            <p style="margin:2px 0 0;font-size:0.75rem;color:var(--az-soft-silver);">${t.desc}</p>
          </div>
          <span style="font-size:0.75rem;font-weight:700;color:var(--az-champagne-gold);">+${t.xp} XP</span>
        </div>
      `;
    });
    html += '</div>';

    showModal('📋 Misi & Aktivitas Istana Bawah Laut', html);
  }

  function openBagModal() {
    let html = '<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;">';

    if (currentState.inventory.length === 0) {
      html = '<p style="text-align:center;color:var(--az-soft-silver);">Tas masih kosong. Ambil bahan di kulkas atau kebun!</p>';
    } else {
      currentState.inventory.forEach(item => {
        html += `
          <div style="background:rgba(3,20,31,0.6);border:1px solid var(--az-glass-border);border-radius:10px;padding:10px;display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.8rem;">${item.icon}</span>
            <div>
              <strong style="color:#fff;font-size:0.85rem;display:block;">${item.name}</strong>
              <span style="font-size:0.75rem;color:var(--az-champagne-gold);">Jumlah: ${item.count}</span>
            </div>
          </div>
        `;
      });
      html += '</div>';
    }

    showModal('🎒 Tas & Inventaris Bahan Samudra', html);
  }

  function completeTask(taskId) {
    if (!currentState) return;
    const task = currentState.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      task.completed = true;
      saveCurrentState();
      toast(`✦ Misi Selesai: ${task.title} (+${task.xp} XP)!`);
    }
  }

  // --- Modal Helpers ---
  function showModal(title, contentHtml) {
    if (modalTitle) modalTitle.innerHTML = title;
    if (modalBody) modalBody.innerHTML = contentHtml;
    if (modalBackdrop) modalBackdrop.classList.add('show');
  }

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('show');
  }

  // ---------------------------------------------------------------------------
  // 5. EVENT LISTENERS WIRING
  // ---------------------------------------------------------------------------
  function wireEvents() {
    // Return button -> back to YAWN main universe
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (typeof onNavigateBack === 'function') {
          onNavigateBack();
        }
      });
    }

    // Room navigation buttons in HUD
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.azure-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetRoom = btn.dataset.roomId;
          if (targetRoom && targetRoom !== currentRoomConfig.id) {
            renderRoom(targetRoom, true);
          }
        });
      });
    }

    // Quick Tool buttons
    if (btnToolAtmo) btnToolAtmo.addEventListener('click', openAtmosphereModal);
    if (btnToolTasks) btnToolTasks.addEventListener('click', openTasksModal);
    if (btnToolBag) btnToolBag.addEventListener('click', openBagModal);

    // Modal Close
    if (btnModalClose) btnModalClose.addEventListener('click', closeModal);
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    // Proximity Prompt Click
    if (promptEl) {
      promptEl.addEventListener('click', () => {
        if (activeNearbyHotspot) triggerHotspotAction(activeNearbyHotspot);
      });
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (!palaceView || !palaceView.classList.contains('active')) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        pressedKeys.add(e.code);
      }
      if (e.code === 'KeyE') {
        if (activeNearbyHotspot) triggerHotspotAction(activeNearbyHotspot);
      }
      if (e.code === 'Escape') {
        closeModal();
      }
    });

    window.addEventListener('keyup', (e) => {
      pressedKeys.delete(e.code);
    });

    // Touch D-Pad
    if (dpadUp) {
      dpadUp.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.up = true; });
      dpadUp.addEventListener('touchend', () => { touchState.up = false; });
    }
    if (dpadDown) {
      dpadDown.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.down = true; });
      dpadDown.addEventListener('touchend', () => { touchState.down = false; });
    }
    if (dpadLeft) {
      dpadLeft.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.left = true; });
      dpadLeft.addEventListener('touchend', () => { touchState.left = false; });
    }
    if (dpadRight) {
      dpadRight.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.right = true; });
      dpadRight.addEventListener('touchend', () => { touchState.right = false; });
    }
    if (touchActionBtn) {
      touchActionBtn.addEventListener('click', () => {
        if (activeNearbyHotspot) triggerHotspotAction(activeNearbyHotspot);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. INITIALIZATION & PUBLIC API
  // ---------------------------------------------------------------------------
  loadState();
  wireEvents();
  renderRoom(currentState.currentRoom || 'living', true);
  applyAtmosphere(currentState.atmosphere || 'sunlit_azure');
  gameLoop();

  return {
    openAzurePalace(authUser = null) {
      if (authUser && authUser.uid) {
        activeCharacter = 'akhira';
      }
      loadState();
      if (palaceView) {
        palaceView.classList.add('active');
        palaceView.setAttribute('aria-hidden', 'false');
      }
      renderRoom(currentState.currentRoom || 'living', true);
      applyAtmosphere(currentState.atmosphere || 'sunlit_azure');
      playOceanChime();
      toast('⚡ Memasuki THE AZURE TIDE PALACE — Kediaman Bawah Laut Akhira');
    },

    closeAzurePalace() {
      if (palaceView) {
        palaceView.classList.remove('active');
        palaceView.setAttribute('aria-hidden', 'true');
      }
      hidePrompt();
      closeModal();
    },

    getCurrentState() {
      return currentState;
    }
  };
}

