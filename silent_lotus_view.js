/**
 * THE SILENT LOTUS HOUSE — ELA 🌸 (UNIVERSE US AGAIN)
 * 2D Interactive Simulation Controller & Game Loop
 * =============================================================================
 */

import {
  SILENT_LOTUS_CHARACTER,
  SILENT_LOTUS_ROOMS,
  SILENT_LOTUS_RECIPES,
  SILENT_LOTUS_FLOWERS,
  SILENT_LOTUS_LETTERS,
  SILENT_LOTUS_COLLECTIBLES,
  SILENT_LOTUS_TASKS,
  SILENT_LOTUS_ATMOSPHERES,
  loadSilentLotusState,
  saveSilentLotusState,
  playLotusKotoChime,
  playWaterDropTone,
  playWindChimeZen,
  playTeaBrewingSizzle
} from './silent_lotus_state.js';

export function initSilentLotusView({ onShowToast, onTriggerSparkle, onNavigateBack } = {}) {
  // DOM Elements
  const lotusView = document.getElementById('view-silent-lotus');
  const stageEl = document.getElementById('silent-lotus-stage');
  const roomBgImg = document.getElementById('silent-lotus-bg-img');
  const hotspotsContainer = document.getElementById('silent-lotus-hotspots-container');
  const playerAvatar = document.getElementById('silent-lotus-player-avatar');
  const promptEl = document.getElementById('silent-lotus-interaction-prompt');
  const promptTextEl = document.getElementById('silent-lotus-prompt-text');

  // Navigation HUDs
  const btnBack = document.getElementById('btn-silent-lotus-back');
  const titleRoomEl = document.getElementById('silent-lotus-room-title');
  const titleSubtitleEl = document.getElementById('silent-lotus-room-subtitle');
  const navPillsContainer = document.getElementById('silent-lotus-nav-pills');

  // Quick Tools
  const btnToolAtmo = document.getElementById('btn-silent-lotus-tool-atmo');
  const btnToolTasks = document.getElementById('btn-silent-lotus-tool-tasks');
  const btnToolBag = document.getElementById('btn-silent-lotus-tool-bag');

  // Modals & Overlays
  const modalBackdrop = document.getElementById('silent-lotus-modal-backdrop');
  const modalTitle = document.getElementById('silent-lotus-modal-title');
  const modalBody = document.getElementById('silent-lotus-modal-body');
  const btnModalClose = document.getElementById('btn-silent-lotus-modal-close');
  const sleepOverlay = document.getElementById('silent-lotus-sleep-overlay');
  const atmoOverlay = document.getElementById('silent-lotus-atmo-overlay');
  const fxOverlay = document.getElementById('silent-lotus-fx-overlay');

  // Touch controls
  const dpadUp = document.getElementById('silent-dpad-up');
  const dpadDown = document.getElementById('silent-dpad-down');
  const dpadLeft = document.getElementById('silent-dpad-left');
  const dpadRight = document.getElementById('silent-dpad-right');
  const touchActionBtn = document.getElementById('silent-touch-action');

  let activeCharacter = 'ela';
  let currentState = null;
  let currentRoomConfig = SILENT_LOTUS_ROOMS[0]; // Start at Lotus Living Room

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
    currentState = loadSilentLotusState(activeCharacter);
    const room = SILENT_LOTUS_ROOMS.find(r => r.id === currentState.currentRoom) || SILENT_LOTUS_ROOMS[0];
    currentRoomConfig = room;
    return true;
  }

  function saveCurrentState() {
    if (!currentState) return;
    saveSilentLotusState(activeCharacter, currentState);
  }

  // ---------------------------------------------------------------------------
  // 1. RENDER ROOM & ATMOSPHERE
  // ---------------------------------------------------------------------------
  function renderRoom(roomId, spawnAtDefault = false) {
    const room = SILENT_LOTUS_ROOMS.find(r => r.id === roomId) || SILENT_LOTUS_ROOMS[0];
    currentRoomConfig = room;
    if (currentState) currentState.currentRoom = room.id;

    // Update Titles
    if (titleRoomEl) titleRoomEl.textContent = room.name;
    if (titleSubtitleEl) titleSubtitleEl.textContent = room.subtitle;

    // Update Background Image
    if (roomBgImg) {
      roomBgImg.src = room.bgImage;
      roomBgImg.alt = `${room.name} — THE SILENT LOTUS HOUSE`;
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
      navPillsContainer.querySelectorAll('.lotus-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.roomId === room.id);
      });
    }

    // Hide any previous interaction prompt
    hidePrompt();

    // Spawning drifting petals
    initPetalParticles();

    // Sound chime
    playWindChimeZen();
    saveCurrentState();
  }

  function applyAtmosphere(atmoId) {
    const atmo = SILENT_LOTUS_ATMOSPHERES.find(a => a.id === atmoId) || SILENT_LOTUS_ATMOSPHERES[0];
    if (currentState) currentState.atmosphere = atmo.id;
    if (atmoOverlay) {
      atmoOverlay.style.background = atmo.ambientOverlay;
    }
    saveCurrentState();
  }

  function initPetalParticles() {
    if (!fxOverlay) return;
    fxOverlay.innerHTML = '';

    // Create 12 drifting sakura petals
    for (let i = 0; i < 12; i++) {
      const petal = document.createElement('div');
      petal.className = 'lotus-petal';
      const size = 8 + Math.random() * 8;
      petal.style.width = `${size}px`;
      petal.style.height = `${size * 1.4}px`;
      petal.style.left = `${Math.random() * 100}%`;
      petal.style.top = `${-10 - Math.random() * 20}%`;
      petal.style.animationDuration = `${7 + Math.random() * 8}s`;
      petal.style.animationDelay = `${Math.random() * 5}s`;
      fxOverlay.appendChild(petal);
    }

    // Create 2 gentle butterflies
    for (let i = 0; i < 2; i++) {
      const bfly = document.createElement('div');
      bfly.className = 'lotus-butterfly';
      bfly.textContent = '🦋';
      bfly.style.left = `${20 + Math.random() * 60}%`;
      bfly.style.top = `${25 + Math.random() * 50}%`;
      bfly.style.animationDuration = `${5 + Math.random() * 4}s`;
      bfly.style.animationDelay = `${Math.random() * 3}s`;
      fxOverlay.appendChild(bfly);
    }
  }

  // ---------------------------------------------------------------------------
  // 2. HOTSPOT RENDERING & DETECTION
  // ---------------------------------------------------------------------------
  function renderHotspots(hotspots = []) {
    if (!hotspotsContainer) return;
    hotspotsContainer.innerHTML = '';

    hotspots.forEach(hs => {
      const item = document.createElement('div');
      item.className = 'silent-lotus-hotspot-item';
      item.dataset.hotspotId = hs.id;
      item.style.left = `${hs.x}%`;
      item.style.top = `${hs.y}%`;

      const beacon = document.createElement('div');
      beacon.className = 'silent-lotus-beacon';
      beacon.textContent = hs.icon || '🌸';

      const label = document.createElement('div');
      label.className = 'silent-lotus-beacon-label';
      label.textContent = hs.label;

      item.appendChild(beacon);
      item.appendChild(label);

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHotspotAction(hs);
      });

      hotspotsContainer.appendChild(item);
    });
  }

  function showPrompt(text) {
    if (!promptEl || !promptTextEl) return;
    promptTextEl.textContent = text;
    promptEl.classList.add('active');
  }

  function hidePrompt() {
    if (!promptEl) return;
    promptEl.classList.remove('active');
    activeNearbyHotspot = null;
  }

  function checkProximity() {
    if (!currentState || !currentRoomConfig) return;
    const px = currentState.playerX;
    const py = currentState.playerY;

    let nearest = null;
    let minDist = 8.5; // Detection radius in percentage

    for (const hs of currentRoomConfig.hotspots) {
      const dx = px - hs.x;
      const dy = py - hs.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDist) {
        minDist = dist;
        nearest = hs;
      }
    }

    if (nearest) {
      activeNearbyHotspot = nearest;
      showPrompt(nearest.prompt);
    } else {
      hidePrompt();
    }
  }

  // ---------------------------------------------------------------------------
  // 3. 2D MOVEMENT & COLLISION SIMULATION
  // ---------------------------------------------------------------------------
  function isCollidingWithObstacle(x, y) {
    if (!currentRoomConfig || !currentRoomConfig.obstacles) return false;
    for (const obs of currentRoomConfig.obstacles) {
      if (x >= obs.minX && x <= obs.maxX && y >= obs.minY && y <= obs.maxY) {
        return true;
      }
    }
    return false;
  }

  function updateAvatarDOM(x, y) {
    if (!playerAvatar) return;
    playerAvatar.style.left = `${x}%`;
    playerAvatar.style.top = `${y}%`;
    playerAvatar.classList.toggle('facing-left', facingLeft);
    playerAvatar.classList.toggle('is-walking', isMoving);
  }

  function gameLoop() {
    if (lotusView && lotusView.classList.contains('active')) {
      let dx = 0;
      let dy = 0;
      const speed = 0.55;

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

        const bounds = currentRoomConfig.bounds || { minX: 10, maxX: 90, minY: 35, maxY: 85 };
        const nextX = Math.min(Math.max(currentState.playerX + dx, bounds.minX), bounds.maxX);
        const nextY = Math.min(Math.max(currentState.playerY + dy, bounds.minY), bounds.maxY);

        if (!isCollidingWithObstacle(nextX, nextY)) {
          currentState.playerX = nextX;
          currentState.playerY = nextY;
          updateAvatarDOM(nextX, nextY);
          checkProximity();
        } else if (!isCollidingWithObstacle(nextX, currentState.playerY)) {
          currentState.playerX = nextX;
          updateAvatarDOM(nextX, currentState.playerY);
          checkProximity();
        } else if (!isCollidingWithObstacle(currentState.playerX, nextY)) {
          currentState.playerY = nextY;
          updateAvatarDOM(currentState.playerX, nextY);
          checkProximity();
        }
      } else {
        isMoving = false;
        if (playerAvatar) playerAvatar.classList.remove('is-walking');
      }
    }
    animFrameId = requestAnimationFrame(gameLoop);
  }

  // ---------------------------------------------------------------------------
  // 4. MODALS & INTERACTIVE ACTIONS
  // ---------------------------------------------------------------------------
  function openModal(title, contentHtml) {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = title;
    modalBody.innerHTML = contentHtml;
    modalBackdrop.classList.add('active');
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('active');
  }

  function markTaskDone(taskId) {
    if (!currentState || !currentState.tasks) return;
    const task = currentState.tasks.find(t => t.id === taskId);
    if (task && !task.done) {
      task.done = true;
      toast(`🌸 Tugas Selesai: ${task.label} (+${task.xp} XP)`);
      saveCurrentState();
    }
  }

  function triggerHotspotAction(hs) {
    if (!hs) return;

    // Movement to room
    if (hs.action === 'goto_bedroom') {
      renderRoom('bedroom', true);
      return;
    }
    if (hs.action === 'goto_kitchen') {
      renderRoom('kitchen', true);
      return;
    }
    if (hs.action === 'goto_conservatory') {
      renderRoom('conservatory', true);
      return;
    }
    if (hs.action === 'goto_attic') {
      renderRoom('attic', true);
      return;
    }
    if (hs.action === 'goto_living') {
      renderRoom('living', true);
      return;
    }

    // Specific Room Actions
    switch (hs.action) {
      case 'sit_sofa': {
        if (playerAvatar) playerAvatar.classList.add('is-sitting');
        playLotusKotoChime(523.25);
        toast('🌸 Ela duduk bersantai di sofa lavender yang empuk...');
        break;
      }

      case 'play_piano': {
        markTaskDone('task_piano');
        const notes = [
          { name: 'Do (C5)', freq: 523.25, note: 'C' },
          { name: 'Re (D5)', freq: 587.33, note: 'D' },
          { name: 'Mi (E5)', freq: 659.25, note: 'E' },
          { name: 'Sol (G5)', freq: 783.99, note: 'G' },
          { name: 'La (A5)', freq: 880.00, note: 'A' },
          { name: 'Do (C6)', freq: 1046.50, note: 'C6' }
        ];

        let keysHtml = '<div style="display:flex; justify-content:center; gap:8px; margin:20px 0;">';
        notes.forEach(n => {
          keysHtml += `
            <button type="button" class="silent-piano-key" data-freq="${n.freq}" style="
              width: 58px; height: 160px; background: linear-gradient(to bottom, #fff, #fdf4ff);
              border: 1.5px solid #d8b4fe; border-radius: 0 0 10px 10px; cursor: pointer;
              font-weight: 700; color: #6b21a8; font-size: 0.85rem; display: flex;
              flex-direction: column; justify-content: flex-end; padding-bottom: 12px;
              box-shadow: 0 6px 16px rgba(0,0,0,0.3); transition: transform 0.1s ease;
            ">${n.note}<br><span style="font-size:0.65rem; color:#a855f7;">${Math.round(n.freq)}Hz</span></button>
          `;
        });
        keysHtml += '</div>';

        openModal('🎹 White Floral Grand Piano — Melodi Koto Teratai', `
          <p style="color:#e9d5ff; margin-bottom:12px;">Mainkan tangga nada pentatonik tradisional Jepang bernuansa teratai yang syahdu dan menyejukkan hati.</p>
          ${keysHtml}
          <div style="background:rgba(88, 28, 135, 0.3); padding:12px 16px; border-radius:12px; border:1px solid rgba(168, 85, 247, 0.3); font-size:0.85rem;">
            <strong>✦ Melodi Teratai:</strong> Alunan nada menghasilkan resonansi akustik koto kayu dan keheningan air danau.
          </div>
        `);

        setTimeout(() => {
          const keyBtns = modalBody.querySelectorAll('.silent-piano-key');
          keyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              const freq = parseFloat(btn.dataset.freq);
              playLotusKotoChime(freq);
              btn.style.transform = 'translateY(4px)';
              setTimeout(() => { btn.style.transform = 'translateY(0)'; }, 120);
            });
          });
        }, 50);
        break;
      }

      case 'gaze_garden': {
        playWaterDropTone();
        openModal('🪟 Panorama Danau Teratai & Sakura Twilight', `
          <div style="text-align:center; padding:10px 0;">
            <div style="font-size:3.5rem; margin-bottom:10px;">🪷🌸🌊</div>
            <h4 style="color:#fdf4ff; margin-bottom:8px;">Danau Teratai Abadi US AGAIN</h4>
            <p style="color:#e9d5ff; font-style:italic; line-height:1.6;">
              "Di bawah semilir angin fajar dan senja, bunga-bunga teratai putih dan ungu mekar dalam keheningan. Riak air kecil mencerminkan ketenangan jiwa Ela yang tak tergoyahkan."
            </p>
          </div>
        `);
        break;
      }

      case 'read_bookshelf': {
        openModal('📚 Rak Sastra, Puisi & Filosofi Jepang', `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="background:rgba(46, 16, 101, 0.4); padding:12px; border-radius:12px; border:1px solid rgba(168, 85, 247, 0.3);">
              <h4 style="color:#fdf4ff; margin:0 0 4px 0;">🌸 The Book of Stillness — Makna Mekar Teratai</h4>
              <p style="margin:0; font-size:0.85rem; color:#d8b4fe;">Renungan tentang bagaimana kedamaian sejati tidak ditemukan dengan menjauhi dunia, melainkan dengan memelihara kemurnian di dalam batin.</p>
            </div>
            <div style="background:rgba(46, 16, 101, 0.4); padding:12px; border-radius:12px; border:1px solid rgba(168, 85, 247, 0.3);">
              <h4 style="color:#fdf4ff; margin:0 0 4px 0;">🍵 Seni Upacara Teh & Ketenangan Batin</h4>
              <p style="margin:0; font-size:0.85rem; color:#d8b4fe;">Tata cara meracik teh herbal lavender dan teratai air dingin yang diajarkan oleh para leluhur santuari.</p>
            </div>
          </div>
        `);
        break;
      }

      case 'sip_tea': {
        markTaskDone('task_tea');
        playWaterDropTone();
        toast('🍵 Menikmati secangkir Moonlit Lotus Tea hangat di meja kayu...');
        break;
      }

      case 'rest_bed': {
        if (!sleepOverlay) return;
        toast('🌙 Ela berbaring di tempat tidur kanopi sutra lavender...');
        sleepOverlay.classList.add('active');
        playWindChimeZen();
        setTimeout(() => {
          sleepOverlay.classList.remove('active');
          toast('☀️ Ela terbangun dengan pikiran yang jernih dan damai.');
        }, 1800);
        break;
      }

      case 'write_journal': {
        markTaskDone('task_journal');
        renderJournalModal();
        break;
      }

      case 'open_wardrobe': {
        renderWardrobeModal();
        break;
      }

      case 'look_window': {
        playWaterDropTone();
        openModal('🌙 Jendela Danau Teratai Malam', `
          <p style="line-height:1.6; color:#e9d5ff;">
            Bulan purnama menggantung di atas kanopi bambu. Cahaya peraknya menyentuh mahkota teratai ungu dan putih yang mengapung di atas air danau. Keheningan malam ini begitu hangat dan memulihkan rasa lelah.
          </p>
        `);
        break;
      }

      case 'bedroom_decor': {
        renderBedroomDecorModal();
        break;
      }

      case 'cook_oven':
      case 'prep_counter':
      case 'cookbook': {
        renderKitchenCookingModal();
        break;
      }

      case 'open_fridge': {
        gatherFreshKitchenIngredients();
        break;
      }

      case 'tea_table': {
        playLotusKotoChime(587.33);
        toast('🍡 Ela menikmati hidangan mochi sakura manis di meja makan...');
        break;
      }

      case 'plant_garden':
      case 'crystal_pot':
      case 'water_plants':
      case 'harvest_flowers': {
        renderConservatoryModal();
        break;
      }

      case 'lotus_pond': {
        playWaterDropTone();
        toast('🪷 Mengamati teratai mekar dan memberi makan ikan koi di kolam...');
        break;
      }

      case 'observe_butterflies': {
        playWindChimeZen();
        toast('🦋 Kupu-kupu lavender beterbangan di antara ranting pohon sakura...');
        break;
      }

      case 'meditate_bench': {
        markTaskDone('task_meditate');
        playLotusKotoChime(440);
        toast('🧘 Ela duduk hening di bangku taman... kedamaian batin meliputi seluruh ruangan.');
        break;
      }

      case 'write_memory': {
        renderAtticWritingModal();
        break;
      }

      case 'read_letters': {
        markTaskDone('task_letter');
        renderFriendshipLettersModal();
        break;
      }

      case 'view_scrapbook': {
        renderScrapbookModal();
        break;
      }

      case 'preserved_flowers': {
        renderPreservedFlowersModal();
        break;
      }

      case 'open_chest': {
        renderCollectiblesModal();
        break;
      }

      case 'secret_corner': {
        markTaskDone('task_meditate');
        playLotusKotoChime(659.25);
        openModal('✨ Sudut Meditasi Teratai Abadi (Secret Sanctuary Corner)', `
          <div style="text-align:center; padding:15px;">
            <div style="font-size:3rem; margin-bottom:12px;">🪷🕯️✨</div>
            <h3 style="color:#fdf4ff; margin-bottom:10px;">Sanctuary of Stillness — Inti Rohaniah Ela</h3>
            <p style="color:#e9d5ff; line-height:1.6; font-style:italic;">
              "Di sudut tersembunyi ini, waktu seolah berhenti berdetik. Lampion lotus bersinar abadi, membimbing batin Ela untuk senantiasa tetap tenang, lembut, dan menjadi naungan bagi siapapun yang membutuhkannya."
            </p>
          </div>
        `);
        break;
      }

      default:
        toast(`Interaksi: ${hs.label}`);
    }
  }

  // ---------------------------------------------------------------------------
  // 5. DETAIL MODAL BUILDERS
  // ---------------------------------------------------------------------------
  function renderJournalModal() {
    let entriesHtml = '';
    if (currentState.journalEntries && currentState.journalEntries.length > 0) {
      entriesHtml = currentState.journalEntries.map(j => `
        <div style="background:rgba(46, 16, 101, 0.4); padding:12px 14px; border-radius:12px; border:1px solid rgba(168, 85, 247, 0.3); margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="color:#fdf4ff; font-size:0.95rem;">${j.title}</strong>
            <span style="font-size:0.75rem; color:#c084fc;">${j.date}</span>
          </div>
          <p style="margin:0; font-size:0.85rem; color:#e9d5ff; line-height:1.5;">${j.content}</p>
        </div>
      `).join('');
    }

    openModal('📓 Jurnal Pribadi Ela — Renungan Sang Teratai', `
      <div style="margin-bottom:16px;">
        <h4 style="color:#fdf4ff; margin-bottom:8px;">Catatan Refleksi Baru:</h4>
        <input type="text" id="silent-journal-title" placeholder="Judul renungan..." style="width:100%; padding:8px 12px; margin-bottom:8px; border-radius:10px; border:1px solid #a855f7; background:#0f051d; color:#fff; box-sizing:border-box;">
        <textarea id="silent-journal-text" rows="3" placeholder="Tuliskan isi hati & kedamaian batin Ela..." style="width:100%; padding:8px 12px; border-radius:10px; border:1px solid #a855f7; background:#0f051d; color:#fff; box-sizing:border-box;"></textarea>
        <button type="button" id="btn-silent-save-journal" class="silent-lotus-btn-primary" style="margin-top:8px;">
          🌸 Simpan Renungan
        </button>
      </div>
      <h4 style="color:#fdf4ff; margin-bottom:8px;">Lembaran Jurnal Terdahulu:</h4>
      ${entriesHtml}
    `);

    setTimeout(() => {
      const btnSave = document.getElementById('btn-silent-save-journal');
      if (btnSave) {
        btnSave.addEventListener('click', () => {
          const title = document.getElementById('silent-journal-title')?.value.trim();
          const content = document.getElementById('silent-journal-text')?.value.trim();
          if (!title || !content) {
            toast('Silakan isi judul dan teks jurnal.');
            return;
          }
          currentState.journalEntries.unshift({
            id: 'j_' + Date.now(),
            title,
            date: 'Hari Penuh Kedamaian',
            content
          });
          saveCurrentState();
          toast('🌸 Jurnal berhasil disimpan!');
          renderJournalModal();
        });
      }
    }, 50);
  }

  function renderWardrobeModal() {
    const outfits = [
      { id: 'serene_kimono', name: 'Serene Lotus Kimono', icon: '👘', desc: 'Kimono sutra lavender dengan sulaman bunga teratai putih di bagian kelim.' },
      { id: 'sakura_yukata', name: 'Sakura Twilight Yukata', icon: '🌸', desc: 'Yukata katun blush pink lembut dengan ornamen pita rose gold.' },
      { id: 'sanctuary_robe', name: 'Sanctuary Tea Robe', icon: '🤍', desc: 'Jubah santuari warna pearl white yang nyaman untuk menyeduh teh di pagi hari.' }
    ];

    let html = '<div style="display:flex; flex-direction:column; gap:10px;">';
    outfits.forEach(o => {
      html += `
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(46,16,101,0.4); padding:12px; border-radius:12px; border:1px solid rgba(168,85,247,0.3);">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">${o.icon}</span>
            <div>
              <strong style="color:#fdf4ff;">${o.name}</strong>
              <p style="margin:2px 0 0 0; font-size:0.8rem; color:#d8b4fe;">${o.desc}</p>
            </div>
          </div>
          <button type="button" class="silent-lotus-btn-primary btn-select-outfit" data-name="${o.name}" style="padding:6px 14px; font-size:0.8rem;">Kenakan</button>
        </div>
      `;
    });
    html += '</div>';

    openModal('👘 Lemari Pakaian & Busana Ela', html);

    setTimeout(() => {
      modalBody.querySelectorAll('.btn-select-outfit').forEach(btn => {
        btn.addEventListener('click', () => {
          toast(`🌸 Ela kini mengenakan: ${btn.dataset.name}`);
          closeModal();
        });
      });
    }, 50);
  }

  function renderBedroomDecorModal() {
    openModal('🦋 Pengaturan Dekorasi Bilik Ela', `
      <p style="color:#e9d5ff; margin-bottom:14px;">Pilih nuansa kelambu kanopi sutra di kamar tidur Ela:</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button type="button" class="silent-lotus-btn-primary btn-canopy" data-color="lavender" style="justify-content:center;">💜 Lavender Mist</button>
        <button type="button" class="silent-lotus-btn-primary btn-canopy" data-color="pearl" style="justify-content:center; background:linear-gradient(135deg, #e2e8f0, #cbd5e1); color:#334155;">🤍 Pearl White</button>
        <button type="button" class="silent-lotus-btn-primary btn-canopy" data-color="rose_gold" style="justify-content:center; background:linear-gradient(135deg, #fb7185, #f43f5e);">🌸 Rose Gold</button>
        <button type="button" class="silent-lotus-btn-primary btn-canopy" data-color="blush" style="justify-content:center; background:linear-gradient(135deg, #f472b6, #ec4899);">🎀 Muted Blush</button>
      </div>
    `);

    setTimeout(() => {
      modalBody.querySelectorAll('.btn-canopy').forEach(btn => {
        btn.addEventListener('click', () => {
          if (currentState) {
            currentState.decorOptions.bedroomCanopyColor = btn.dataset.color;
            saveCurrentState();
          }
          toast(`🌸 Dekorasi kanopi diubah menjadi nuansa: ${btn.textContent.trim()}`);
          closeModal();
        });
      });
    }, 50);
  }

  function renderKitchenCookingModal() {
    let recipesHtml = '<div style="display:flex; flex-direction:column; gap:12px;">';
    SILENT_LOTUS_RECIPES.forEach(r => {
      const isCooked = currentState.cookedDishes && currentState.cookedDishes.includes(r.id);
      recipesHtml += `
        <div style="background:rgba(46, 16, 101, 0.4); padding:12px 14px; border-radius:12px; border:1px solid rgba(168, 85, 247, 0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.8rem;">${r.icon}</span>
              <div>
                <strong style="color:#fdf4ff; font-size:0.95rem;">${r.name}</strong>
                <div style="font-size:0.75rem; color:#a855f7;">Bahan: ${r.ingredients.join(', ')}</div>
              </div>
            </div>
            <button type="button" class="silent-lotus-btn-primary btn-cook-recipe" data-recipe-id="${r.id}" style="padding:6px 14px; font-size:0.8rem;">
              ${isCooked ? 'Seduh Ulang' : 'Buat Resep'}
            </button>
          </div>
          <p style="margin:6px 0 0 0; font-size:0.8rem; color:#e9d5ff;">${r.desc}</p>
        </div>
      `;
    });
    recipesHtml += '</div>';

    openModal('🍳 Lavender Tea Kitchen — Racikan Teh & Manisan', recipesHtml);

    setTimeout(() => {
      modalBody.querySelectorAll('.btn-cook-recipe').forEach(btn => {
        btn.addEventListener('click', () => {
          const recipeId = btn.dataset.recipeId;
          const recipe = SILENT_LOTUS_RECIPES.find(r => r.id === recipeId);
          if (!recipe) return;

          playTeaBrewingSizzle();
          toast(`🍵 Sedang menyeduh: ${recipe.name}...`);
          markTaskDone('task_tea');

          if (!currentState.cookedDishes.includes(recipeId)) {
            currentState.cookedDishes.push(recipeId);
          }
          currentState.stats.dishesCooked = (currentState.stats.dishesCooked || 0) + 1;
          saveCurrentState();

          setTimeout(() => {
            playWaterDropTone();
            toast(`✨ Selesai! Menikmati aroma harum ${recipe.name} (+${recipe.rewardXp} XP).`);
            renderKitchenCookingModal();
          }, 1200);
        });
      });
    }, 50);
  }

  function gatherFreshKitchenIngredients() {
    playWaterDropTone();
    const items = ['Kuncup Teratai Putih', 'Kelopak Sakura Segar', 'Madu Bunga Liar', 'Esensi Lavender'];
    items.forEach(itName => {
      const invItem = currentState.inventory.find(i => i.name === itName);
      if (invItem) invItem.count += 2;
    });
    saveCurrentState();
    toast('❄️ Mengambil kuncup teratai, kelopak sakura, dan madu segar dari kulkas!');
  }

  function renderConservatoryModal() {
    markTaskDone('task_garden');
    let slotsHtml = '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:16px;">';
    currentState.gardenSlots.forEach(slot => {
      const stageText = slot.stage === 'blooming' ? '🌸 Mekar Indah' : slot.stage === 'growing' ? '🌱 Tumbuh Sehat' : '🌰 Benih Tertanam';
      slotsHtml += `
        <div style="background:rgba(46,16,101,0.5); padding:12px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); text-align:center;">
          <div style="font-size:2rem; margin-bottom:6px;">${slot.stage === 'blooming' ? '🪷' : slot.stage === 'growing' ? '🌿' : '🌰'}</div>
          <strong style="font-size:0.85rem; color:#fdf4ff;">Slot #${slot.slotId}</strong>
          <div style="font-size:0.75rem; color:#d8b4fe; margin:2px 0 6px 0;">${slot.plantName}</div>
          <div style="font-size:0.72rem; color:#a855f7; margin-bottom:8px;">${stageText}</div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${slot.stage === 'blooming'
              ? `<button type="button" class="silent-lotus-btn-primary btn-harvest-slot" data-slot="${slot.slotId}" style="padding:4px 8px; font-size:0.72rem; justify-content:center;">🧺 Panen</button>`
              : `<button type="button" class="silent-lotus-btn-primary btn-water-slot" data-slot="${slot.slotId}" style="padding:4px 8px; font-size:0.72rem; justify-content:center;">💧 Siram</button>`
            }
          </div>
        </div>
      `;
    });
    slotsHtml += '</div>';

    openModal('🌿 Enchanted Lotus Conservatory — Kebun Teratai & Flora Suci', `
      <p style="color:#e9d5ff; margin-bottom:12px;">Rawat bunga teratai, sakura, dan lavender di rumah kaca pribadi Ela.</p>
      ${slotsHtml}
      <div style="background:rgba(88, 28, 135, 0.3); padding:10px 14px; border-radius:12px; border:1px solid rgba(168, 85, 247, 0.3); font-size:0.82rem; color:#e9d5ff;">
        <strong>✦ Petunjuk Berkebun:</strong> Siram benih secara teratur dengan air mata air suci untuk mempercepat proses mekarnya bunga.
      </div>
    `);

    setTimeout(() => {
      modalBody.querySelectorAll('.btn-water-slot').forEach(btn => {
        btn.addEventListener('click', () => {
          const slotId = parseInt(btn.dataset.slot, 10);
          const slot = currentState.gardenSlots.find(s => s.slotId === slotId);
          if (slot) {
            slot.watered = true;
            slot.stage = 'blooming';
            saveCurrentState();
            playWaterDropTone();
            toast(`💧 Menyiram ${slot.plantName} dengan air sejuk... bunganya kini bermekaran!`);
            renderConservatoryModal();
          }
        });
      });

      modalBody.querySelectorAll('.btn-harvest-slot').forEach(btn => {
        btn.addEventListener('click', () => {
          const slotId = parseInt(btn.dataset.slot, 10);
          const slot = currentState.gardenSlots.find(s => s.slotId === slotId);
          if (slot) {
            slot.stage = 'seed';
            slot.watered = false;
            currentState.stats.flowersHarvested = (currentState.stats.flowersHarvested || 0) + 1;
            saveCurrentState();
            playLotusKotoChime(880);
            toast(`🧺 Berhasil memanen kelopak harum ${slot.plantName}!`);
            renderConservatoryModal();
          }
        });
      });
    }, 50);
  }

  function renderAtticWritingModal() {
    openModal('✍️ Meja Menulis Vintage & Kotak Puisi', `
      <div style="padding:8px 0;">
        <h4 style="color:#fdf4ff; margin-bottom:8px;">Puisi Keheningan Teratai:</h4>
        <div style="background:rgba(46,16,101,0.4); padding:14px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); font-style:italic; line-height:1.6; color:#fdf4ff;">
          "Di atas air yang jernih tak beriak,<br>
          Kelopak ungu dan putih perlahan terbuka,<br>
          Menyimpan rahasia malam yang damai,<br>
          Untuk dibagikan kepada mereka yang singgah."
        </div>
      </div>
    `);
  }

  function renderFriendshipLettersModal() {
    let lettersHtml = '<div style="display:flex; flex-direction:column; gap:12px;">';
    SILENT_LOTUS_LETTERS.forEach(letItem => {
      lettersHtml += `
        <div style="background:rgba(46, 16, 101, 0.4); padding:14px; border-radius:12px; border:1px solid rgba(168, 85, 247, 0.3);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.6rem;">${letItem.icon}</span>
              <div>
                <strong style="color:#fdf4ff;">${letItem.sender}</strong>
                <span style="font-size:0.75rem; color:#c084fc; margin-left:6px;">(${letItem.universe})</span>
              </div>
            </div>
            <span style="font-size:0.75rem; color:#a855f7;">${letItem.date}</span>
          </div>
          <div style="font-size:0.85rem; color:#e9d5ff; white-space:pre-line; line-height:1.55; background:rgba(15,5,29,0.5); padding:10px 12px; border-radius:8px; border-left:3px solid #a855f7;">
            ${letItem.fullLetter}
          </div>
        </div>
      `;
    });
    lettersHtml += '</div>';

    openModal('💌 Rak Surat Sahabat Our Little Universe', lettersHtml);
  }

  function renderScrapbookModal() {
    openModal('🖼️ Scrapbook & Album Foto Kenangan', `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div style="background:rgba(46,16,101,0.4); padding:10px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:6px;">🪷☀️</div>
          <strong style="color:#fdf4ff; font-size:0.85rem;">Piknik Teh Bersama Lala</strong>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#d8b4fe;">Di bawah naungan pohon Bloom Cottage.</p>
        </div>
        <div style="background:rgba(46,16,101,0.4); padding:10px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:6px;">⭐🌸</div>
          <strong style="color:#fdf4ff; font-size:0.85rem;">Membuat Boneka Bintang Nyanya</strong>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#d8b4fe;">Tertawa bersama di ruang hobi Kidult.</p>
        </div>
        <div style="background:rgba(46,16,101,0.4); padding:10px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:6px;">🌙🪷</div>
          <strong style="color:#fdf4ff; font-size:0.85rem;">Malam Keheningan dengan Lele</strong>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#d8b4fe;">Membaca naskah kuno di The Eclipse.</p>
        </div>
        <div style="background:rgba(46,16,101,0.4); padding:10px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:6px;">⚡🌸</div>
          <strong style="color:#fdf4ff; font-size:0.85rem;">Mutiara Laut Bersama Akhira</strong>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#d8b4fe;">Pertukaran hadiah laut & daratan.</p>
        </div>
      </div>
    `);
  }

  function renderPreservedFlowersModal() {
    openModal('🌸 Etalase Bunga Sakura & Teratai Awetan', `
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="background:rgba(46,16,101,0.4); padding:12px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); display:flex; align-items:center; gap:12px;">
          <span style="font-size:2.2rem;">🪷</span>
          <div>
            <strong style="color:#fdf4ff;">Kelopak Teratai Putih Musim Gugur</strong>
            <p style="margin:2px 0 0 0; font-size:0.8rem; color:#d8b4fe;">Bunga pertama yang mekar saat The Silent Lotus House pertama kali didirikan.</p>
          </div>
        </div>
        <div style="background:rgba(46,16,101,0.4); padding:12px; border-radius:12px; border:1px solid rgba(168,85,247,0.3); display:flex; align-items:center; gap:12px;">
          <span style="font-size:2.2rem;">🌸</span>
          <div>
            <strong style="color:#fdf4ff;">Ranting Kering Sakura Musim Semi</strong>
            <p style="margin:2px 0 0 0; font-size:0.8rem; color:#d8b4fe;">Pemberian dari taman bunga sebagai simbol persahabatan abadi.</p>
          </div>
        </div>
      </div>
    `);
  }

  function renderCollectiblesModal() {
    let listHtml = '<div style="display:flex; flex-direction:column; gap:10px;">';
    SILENT_LOTUS_COLLECTIBLES.forEach(c => {
      const foundItem = currentState.collectibles && currentState.collectibles.find(it => it.id === c.id);
      const isFound = foundItem ? foundItem.found : false;
      listHtml += `
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(46,16,101,0.4); padding:12px; border-radius:12px; border:1px solid rgba(168,85,247,0.3);">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">${isFound ? c.icon : '❓'}</span>
            <div>
              <strong style="color:#fdf4ff;">${isFound ? c.name : 'Artefak Tersembunyi'}</strong>
              <p style="margin:2px 0 0 0; font-size:0.8rem; color:#d8b4fe;">${isFound ? c.desc : 'Dapat ditemukan melalui eksplorasi di dalam ruangan rumah.'}</p>
            </div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:${isFound ? '#a855f7' : '#94a3b8'};">
            ${isFound ? '✓ Ditemukan' : 'Belum'}
          </span>
        </div>
      `;
    });
    listHtml += '</div>';

    openModal('🧰 Peti Pusaka & Benda Sentimental', listHtml);
  }

  // ---------------------------------------------------------------------------
  // 6. EVENT WIRING & KEYBOARD HANDLERS
  // ---------------------------------------------------------------------------
  function wireEvents() {
    // Back Button to US AGAIN world
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (typeof onNavigateBack === 'function') {
          onNavigateBack();
        }
      });
    }

    // Modal Close Button
    if (btnModalClose) {
      btnModalClose.addEventListener('click', closeModal);
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', (e) => {
        if (e.target === modalBackdrop) closeModal();
      });
    }

    // Navigation Pills Click
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.lotus-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetRoom = btn.dataset.roomId;
          if (targetRoom) renderRoom(targetRoom, true);
        });
      });
    }

    // Top Tools: Atmosphere
    if (btnToolAtmo) {
      btnToolAtmo.addEventListener('click', () => {
        let optionsHtml = '<div style="display:flex; flex-direction:column; gap:10px;">';
        SILENT_LOTUS_ATMOSPHERES.forEach(atmo => {
          const isActive = currentState && currentState.atmosphere === atmo.id;
          optionsHtml += `
            <button type="button" class="btn-select-atmo" data-atmo-id="${atmo.id}" style="
              display:flex; align-items:center; justify-content:space-between;
              background:${isActive ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'rgba(46,16,101,0.4)'};
              border:1px solid rgba(168,85,247,0.35); padding:12px; border-radius:12px;
              color:#fff; cursor:pointer; text-align:left;
            ">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.8rem;">${atmo.icon}</span>
                <div>
                  <strong>${atmo.name}</strong>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#e9d5ff;">${atmo.desc}</p>
                </div>
              </div>
              <span style="font-size:1.1rem;">${isActive ? '✓' : ''}</span>
            </button>
          `;
        });
        optionsHtml += '</div>';

        openModal('☀️ Pengaturan Atmosfer & Cahaya Santuari', optionsHtml);

        setTimeout(() => {
          modalBody.querySelectorAll('.btn-select-atmo').forEach(btn => {
            btn.addEventListener('click', () => {
              applyAtmosphere(btn.dataset.atmoId);
              toast(`🌸 Atmosfer diubah menjadi: ${btn.querySelector('strong').textContent}`);
              closeModal();
            });
          });
        }, 50);
      });
    }

    // Top Tools: Daily Tasks
    if (btnToolTasks) {
      btnToolTasks.addEventListener('click', () => {
        let tasksHtml = '<div style="display:flex; flex-direction:column; gap:8px;">';
        currentState.tasks.forEach(t => {
          tasksHtml += `
            <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(46,16,101,0.4); padding:10px 14px; border-radius:10px; border:1px solid rgba(168,85,247,0.3);">
              <span style="color:#fdf4ff; font-size:0.88rem;">${t.label}</span>
              <span style="font-weight:700; color:${t.done ? '#a855f7' : '#94a3b8'}; font-size:0.85rem;">
                ${t.done ? '✓ Selesai' : `+${t.xp} XP`}
              </span>
            </div>
          `;
        });
        tasksHtml += '</div>';
        openModal('📋 Agenda Keseharian Santuari Ela', tasksHtml);
      });
    }

    // Top Tools: Backpack Inventory
    if (btnToolBag) {
      btnToolBag.addEventListener('click', () => {
        let invHtml = '<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">';
        currentState.inventory.forEach(item => {
          invHtml += `
            <div style="background:rgba(46,16,101,0.4); padding:10px; border-radius:10px; border:1px solid rgba(168,85,247,0.3); display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.8rem;">${item.icon}</span>
              <div>
                <strong style="color:#fdf4ff; font-size:0.85rem;">${item.name}</strong>
                <div style="font-size:0.75rem; color:#d8b4fe;">Jumlah: ${item.count}</div>
              </div>
            </div>
          `;
        });
        invHtml += '</div>';
        openModal('🎒 Tas Penyimpanan Ela', invHtml);
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
      if (!lotusView || !lotusView.classList.contains('active')) return;
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
  // 7. INITIALIZATION & PUBLIC API
  // ---------------------------------------------------------------------------
  loadState();
  wireEvents();
  renderRoom(currentState.currentRoom || 'living', true);
  applyAtmosphere(currentState.atmosphere || 'afternoon_bloom');
  gameLoop();

  return {
    openSilentLotusHouse(authUser = null, targetRoom = 'living') {
      if (authUser && authUser.uid) {
        activeCharacter = 'ela';
      }
      loadState();

      // Deactivate other views so house displays fullscreen
      document.querySelectorAll('.view-section').forEach(el => {
        if (el !== lotusView) {
          el.classList.remove('active');
          el.setAttribute('aria-hidden', 'true');
        }
      });

      if (lotusView) {
        lotusView.classList.add('active');
        lotusView.setAttribute('aria-hidden', 'false');
      }
      renderRoom(targetRoom || currentState.currentRoom || 'living', true);
      applyAtmosphere(currentState.atmosphere || 'afternoon_bloom');
      playWindChimeZen();
      toast('🌸 Memasuki THE SILENT LOTUS HOUSE — Santuari Kedamaian Ela');
    },

    closeSilentLotusHouse() {
      if (lotusView) {
        lotusView.classList.remove('active');
        lotusView.setAttribute('aria-hidden', 'true');
      }
      hidePrompt();
      closeModal();
    },

    getCurrentState() {
      return currentState;
    }
  };
}
