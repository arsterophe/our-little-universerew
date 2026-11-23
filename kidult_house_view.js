/**
 * KIDULT DREAM HOUSE — NYANYA ⭐ (UNIVERSE KIDULT)
 * 2D Interactive Simulation Controller & Game Loop
 * =============================================================================
 */

import {
  KIDULT_HOUSE_CHARACTER,
  KIDULT_HOUSE_ROOMS,
  KIDULT_RECIPES,
  KIDULT_HOBBY_PROJECTS,
  KIDULT_MEMORY_ITEMS,
  KIDULT_HOUSE_TASKS,
  KIDULT_ATMOSPHERES,
  loadKidultHouseState,
  saveKidultHouseState,
  playToyPianoNote,
  playKidultChime,
  playMusicBoxLullaby,
  playCookingSizzle
} from './kidult_house_state.js';

export function initKidultHouseView({ onShowToast, onTriggerSparkle, onNavigateBack } = {}) {
  // DOM Elements
  const houseView = document.getElementById('view-kidult-house') || document.getElementById('view-everdream-house');
  const stageEl = document.getElementById('kidult-house-stage');
  const roomBgImg = document.getElementById('kidult-house-bg-img');
  const hotspotsContainer = document.getElementById('kidult-house-hotspots-container');
  const playerAvatar = document.getElementById('kidult-house-player-avatar');
  const promptEl = document.getElementById('kidult-house-interaction-prompt');
  const promptTextEl = document.getElementById('kidult-house-prompt-text');

  // Navigation HUDs
  const btnBack = document.getElementById('btn-kidult-house-back') || document.getElementById('btn-everdream-back');
  const titleRoomEl = document.getElementById('kidult-house-room-title');
  const titleSubtitleEl = document.getElementById('kidult-house-room-subtitle');
  const navPillsContainer = document.getElementById('kidult-house-nav-pills');

  // Quick Tools
  const btnToolAtmo = document.getElementById('btn-kidult-tool-atmo');
  const btnToolTasks = document.getElementById('btn-kidult-tool-tasks');
  const btnToolBag = document.getElementById('btn-kidult-tool-bag');

  // Modals & Overlays
  const modalBackdrop = document.getElementById('kidult-house-modal-backdrop');
  const modalTitle = document.getElementById('kidult-house-modal-title');
  const modalBody = document.getElementById('kidult-house-modal-body');
  const btnModalClose = document.getElementById('btn-kidult-modal-close');
  const sleepOverlay = document.getElementById('kidult-house-sleep-overlay');
  const atmoOverlay = document.getElementById('kidult-house-atmo-overlay');

  // Touch controls
  const dpadUp = document.getElementById('kidult-house-dpad-up');
  const dpadDown = document.getElementById('kidult-house-dpad-down');
  const dpadLeft = document.getElementById('kidult-house-dpad-left');
  const dpadRight = document.getElementById('kidult-house-dpad-right');
  const touchActionBtn = document.getElementById('kidult-house-touch-action');

  let activeCharacter = 'nyanya';
  let currentState = null;
  let currentRoomConfig = KIDULT_HOUSE_ROOMS[0]; // Start at Living Room

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

  function loadStateForActiveChar() {
    currentState = loadKidultHouseState(activeCharacter);
    const room = KIDULT_HOUSE_ROOMS.find(r => r.id === currentState.currentRoom) || KIDULT_HOUSE_ROOMS[0];
    currentRoomConfig = room;
    return true;
  }

  function saveCurrentState() {
    if (!currentState) return;
    saveKidultHouseState(activeCharacter, currentState);
  }

  // ---------------------------------------------------------------------------
  // 1. RENDER ROOM & ATMOSPHERE
  // ---------------------------------------------------------------------------
  function renderRoom(roomId, spawnAtDefault = false) {
    const room = KIDULT_HOUSE_ROOMS.find(r => r.id === roomId) || KIDULT_HOUSE_ROOMS[0];
    currentRoomConfig = room;
    if (currentState) currentState.currentRoom = room.id;

    // Update Titles
    if (titleRoomEl) titleRoomEl.textContent = room.name;
    if (titleSubtitleEl) titleSubtitleEl.textContent = `${room.subtitle} · NYANYA ⭐`;

    // Update Nav Pills
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.kidult-house-room-btn').forEach(btn => {
        const target = btn.getAttribute('data-room-id');
        btn.classList.toggle('active', target === room.id);
      });
    }

    // Update Background Image
    if (roomBgImg) {
      roomBgImg.src = room.bgImage || `/assets/kidult_house_${room.id}.jpg`;
    }

    // Position Avatar
    if (currentState) {
      if (spawnAtDefault || !currentState.playerPos) {
        currentState.playerPos = { x: room.spawnX, y: room.spawnY };
      }
      updateAvatarPosition(currentState.playerPos.x, currentState.playerPos.y);
    }

    // Render Hotspots
    renderHotspots(room.hotspots);

    // Apply Atmosphere Filter
    applyAtmosphere(currentState?.currentAtmo || 'twilight');

    playKidultChime();
    saveCurrentState();
  }

  function applyAtmosphere(atmoId) {
    const atmo = KIDULT_ATMOSPHERES.find(a => a.id === atmoId) || KIDULT_ATMOSPHERES[1];
    if (currentState) currentState.currentAtmo = atmo.id;
    if (roomBgImg) roomBgImg.style.filter = atmo.filter;
    if (atmoOverlay) {
      if (atmo.id === 'night') {
        atmoOverlay.style.background = 'radial-gradient(circle at 50% 25%, rgba(192, 132, 252, 0.15) 0%, rgba(30, 27, 75, 0.6) 70%, rgba(15, 10, 28, 0.85) 100%)';
      } else if (atmo.id === 'afternoon') {
        atmoOverlay.style.background = 'radial-gradient(circle at 50% 30%, rgba(251, 191, 36, 0.18) 0%, rgba(244, 114, 182, 0.12) 60%, rgba(30, 27, 75, 0.4) 100%)';
      } else {
        atmoOverlay.style.background = 'radial-gradient(circle at 50% 30%, rgba(244, 114, 182, 0.12) 0%, rgba(30, 27, 75, 0.35) 60%, rgba(15, 10, 28, 0.7) 100%)';
      }
    }
  }

  function renderHotspots(hotspots) {
    if (!hotspotsContainer) return;
    hotspotsContainer.innerHTML = '';
    hotspots.forEach(h => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'kidult-house-hotspot-item';
      btn.style.left = `${h.x}%`;
      btn.style.top = `${h.y}%`;
      btn.setAttribute('data-hotspot-id', h.id);
      btn.setAttribute('aria-label', h.label);

      btn.innerHTML = `
        <div class="kidult-house-hotspot-beacon">
          <span>${h.icon}</span>
        </div>
        <div class="kidult-house-hotspot-label">${h.label}</div>
      `;

      btn.addEventListener('click', () => {
        triggerHotspotAction(h);
      });

      hotspotsContainer.appendChild(btn);
    });
  }

  // ---------------------------------------------------------------------------
  // 2. AVATAR MOVEMENT, COLLISION & GAME LOOP
  // ---------------------------------------------------------------------------
  function updateAvatarPosition(x, y) {
    if (!playerAvatar) return;
    playerAvatar.style.left = `${x}%`;
    playerAvatar.style.top = `${y}%`;

    playerAvatar.classList.toggle('facing-left', facingLeft);
    playerAvatar.classList.toggle('is-walking', isMoving);

    // Check Proximity to Hotspots
    checkProximity(x, y);
  }

  function checkProximity(x, y) {
    if (!currentRoomConfig || !currentRoomConfig.hotspots) return;
    let closest = null;
    let minDistance = 8.5; // Proximity threshold in percent

    currentRoomConfig.hotspots.forEach(h => {
      const dx = h.x - x;
      const dy = h.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < minDistance) {
        minDistance = dist;
        closest = h;
      }
    });

    activeNearbyHotspot = closest;
    if (promptEl) {
      if (closest) {
        promptEl.classList.add('show');
        if (promptTextEl) promptTextEl.textContent = closest.prompt;
      } else {
        promptEl.classList.remove('show');
      }
    }
  }

  function checkCollision(nextX, nextY) {
    const b = currentRoomConfig.bounds;
    // Room Bounding Box Check
    if (nextX < b.minX || nextX > b.maxX || nextY < b.minY || nextY > b.maxY) {
      return true;
    }
    // Obstacle Check
    if (currentRoomConfig.obstacles) {
      for (const obs of currentRoomConfig.obstacles) {
        if (nextX >= obs.minX && nextX <= obs.maxX && nextY >= obs.minY && nextY <= obs.maxY) {
          return true;
        }
      }
    }
    return false;
  }

  function gameLoop() {
    if (!houseView || !houseView.classList.contains('active')) {
      animFrameId = requestAnimationFrame(gameLoop);
      return;
    }

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

    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    isMoving = (dx !== 0 || dy !== 0);

    if (isMoving && currentState && currentState.playerPos) {
      const curX = currentState.playerPos.x;
      const curY = currentState.playerPos.y;

      let nextX = curX;
      let nextY = curY;

      // Try X movement
      if (!checkCollision(curX + dx, curY)) {
        nextX = curX + dx;
      }
      // Try Y movement
      if (!checkCollision(curX, curY + dy)) {
        nextY = curY + dy;
      }

      currentState.playerPos.x = nextX;
      currentState.playerPos.y = nextY;
      updateAvatarPosition(nextX, nextY);
    } else {
      if (playerAvatar) playerAvatar.classList.remove('is-walking');
    }

    animFrameId = requestAnimationFrame(gameLoop);
  }

  // ---------------------------------------------------------------------------
  // 3. HOTSPOT ACTIONS & INTERACTIVE MODALS
  // ---------------------------------------------------------------------------
  function triggerHotspotAction(h) {
    if (!h) return;
    sparkle(window.innerWidth / 2, window.innerHeight / 2);

    // Door Portal Transitions
    if (h.action === 'goto_bedroom') {
      renderRoom('bedroom', true);
      toast('🚪 Berpindah ke Dreamy Bedroom ⭐');
      return;
    }
    if (h.action === 'goto_living') {
      renderRoom('living', true);
      toast('🚪 Berpindah ke KIDULT Living Room 🛋️');
      return;
    }
    if (h.action === 'goto_kitchen') {
      renderRoom('kitchen', true);
      toast('🚪 Berpindah ke Little Kitchen 🍳');
      return;
    }
    if (h.action === 'goto_hobby') {
      renderRoom('hobby', true);
      toast('🚪 Berpindah ke Creative Hobby Room 🎨');
      return;
    }
    if (h.action === 'goto_attic') {
      renderRoom('attic', true);
      toast('🚪 Naik tangga ke Memory Attic 🗝️');
      return;
    }

    // Interactive Modals
    switch (h.action) {
      case 'play_piano':
        openPianoModal();
        break;
      case 'bake_oven':
      case 'open_fridge':
      case 'prep_counter':
      case 'recipe_book':
        openCookingModal();
        break;
      case 'dining_table':
        toast('🍰 Menikmati sepotong kue stroberi manis di meja makan keluarga ~');
        break;
      case 'paint_canvas':
      case 'craft_scrapbook':
      case 'moodboard_pin':
      case 'art_supplies':
      case 'read_comics':
        openHobbyModal();
        break;
      case 'memory_chest':
      case 'photo_album':
      case 'read_letters':
        openMemoryModal();
        break;
      case 'music_box':
        playMusicBoxLullaby();
        toast('🎶 Kotak musik berputar memancarkan melodi nina bobo masa kecil yang menenangkan...');
        break;
      case 'rocking_chair':
        toast('🪑 Duduk berayun tenang di kursi goyang sudut loteng kenangan ⭐');
        break;
      case 'sit_sofa':
        toast('🛋️ Duduk nyaman di sofa beludru berbintang sambil bersandar empuk ~');
        break;
      case 'warm_fireplace':
        toast('🔥 Menghangatkan diri di perapian dengan tawa boneka-boneka kesayangan ⭐');
        break;
      case 'read_bookshelf':
        openStoryBookshelfModal();
        break;
      case 'sip_tea':
        toast('🫖 Menyesap secangkir teh lavender hangat yang menyegarkan pikiran...');
        break;
      case 'rest_bed':
        triggerBedSleep();
        break;
      case 'write_journal':
        openJournalModal();
        break;
      case 'cuddle_plushie':
        playKidultChime();
        toast('🧸 Memeluk boneka beruang dan kucing pastel dengan penuh kasih sayang 💕');
        break;
      case 'open_wardrobe':
        openWardrobeModal();
        break;
      case 'look_window':
        toast('✨ Menatap langit twilight berbintang dari jendela lengkung kamar tidur ⭐');
        break;
      case 'bedroom_decor':
        openAtmoModal();
        break;
      default:
        toast(`✦ Berinteraksi dengan ${h.label}`);
        break;
    }
  }

  // ---------------------------------------------------------------------------
  // 4. MODALS IMPLEMENTATION
  // ---------------------------------------------------------------------------
  function openModal(title, contentHtml) {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = title;
    modalBody.innerHTML = contentHtml;
    modalBackdrop.classList.add('active');
    modalBackdrop.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modalBackdrop) return;
    modalBackdrop.classList.remove('active');
    modalBackdrop.setAttribute('aria-hidden', 'true');
  }

  // A. Playable Vintage Toy Piano
  function openPianoModal() {
    const notes = [
      { name: 'Do (C4)', midi: 60, key: '1' },
      { name: 'Re (D4)', midi: 62, key: '2' },
      { name: 'Mi (E4)', midi: 64, key: '3' },
      { name: 'Fa (F4)', midi: 65, key: '4' },
      { name: 'Sol (G4)', midi: 67, key: '5' },
      { name: 'La (A4)', midi: 69, key: '6' },
      { name: 'Si (B4)', midi: 71, key: '7' },
      { name: 'Do (C5)', midi: 72, key: '8' }
    ];

    let html = `
      <div style="text-align: center; margin-bottom: 14px;">
        <p style="margin: 0; font-size: 0.9rem; color: #fce7f3;">
          Mainkan nada-nada riang di piano vintage masa kecil Nyanya. Sentuh atau klik tuts piano di bawah:
        </p>
      </div>
      <div class="kidult-piano-keyboard" id="kidult-piano-keys">
    `;

    notes.forEach(n => {
      html += `
        <button type="button" class="kidult-piano-key" data-midi="${n.midi}">
          <span>${n.name}</span>
          <span style="font-size: 0.65rem; color: #db2777;">[${n.key}]</span>
        </button>
      `;
    });

    html += `
      </div>
      <div style="margin-top: 18px; padding: 12px; background: rgba(30, 27, 75, 0.7); border-radius: 12px; font-size: 0.8rem; text-align: center;">
        <span style="color: #fbbf24;">⭐ Melodi Nostalgia:</span> "Twinkle Twinkle Little Star" · [1-1-5-5-6-6-5]
      </div>
    `;

    openModal('🎹 Piano Vintage Masa Kecil — KIDULT', html);

    const keysWrap = document.getElementById('kidult-piano-keys');
    if (keysWrap) {
      keysWrap.querySelectorAll('.kidult-piano-key').forEach(btn => {
        btn.addEventListener('click', () => {
          const midi = parseInt(btn.getAttribute('data-midi'), 10);
          playToyPianoNote(midi);
          btn.style.transform = 'translateY(4px)';
          setTimeout(() => { btn.style.transform = ''; }, 120);
        });
      });
    }
  }

  // B. Little Kitchen Cooking & Recipes
  function openCookingModal() {
    let html = `
      <p style="margin-top: 0; font-size: 0.88rem; color: #fce7f3;">
        Pilih resep kue atau minuman dongeng untuk dipanggang di oven dapur Nyanya:
      </p>
      <div class="kidult-card-grid">
    `;

    KIDULT_RECIPES.forEach(recipe => {
      html += `
        <div class="kidult-item-card" data-recipe-id="${recipe.id}">
          <div class="kidult-item-card-header">
            <div class="kidult-item-card-icon">${recipe.icon}</div>
            <div>
              <h4 class="kidult-item-card-title">${recipe.name}</h4>
              <span style="font-size: 0.7rem; color: #fbbf24;">Waktu Panggang: ${recipe.bakeTime}</span>
            </div>
          </div>
          <p class="kidult-item-card-desc">${recipe.desc}</p>
          <div style="font-size: 0.72rem; color: #e9d5ff; margin-top: 4px;">
            <strong>Bahan:</strong> ${recipe.ingredients.join(', ')}
          </div>
          <button type="button" class="btn-cook-recipe" data-recipe-name="${recipe.name}"
            style="margin-top: 10px; background: linear-gradient(135deg, #f472b6, #db2777); border: none; color: #fff; padding: 6px 12px; border-radius: 10px; font-weight: 700; cursor: pointer;">
            Panggang Sekarang ✨
          </button>
        </div>
      `;
    });

    html += `</div>`;
    openModal('🍳 Little Kitchen — Resep Kue & Minuman Dongeng', html);

    const modalB = document.getElementById('kidult-house-modal-body');
    if (modalB) {
      modalB.querySelectorAll('.btn-cook-recipe').forEach(btn => {
        btn.addEventListener('click', () => {
          const name = btn.getAttribute('data-recipe-name');
          playCookingSizzle();
          btn.disabled = true;
          btn.textContent = 'Memanggang... 🔥';
          setTimeout(() => {
            playKidultChime();
            btn.textContent = 'Selesai! 🧁✨';
            toast(`🧁 Berhasil memanggang "${name}"! Aroma manis semerbak di seluruh dapur.`);
            if (currentState) {
              currentState.bakedItemsCount = (currentState.bakedItemsCount || 0) + 1;
              saveCurrentState();
            }
          }, 1500);
        });
      });
    }
  }

  // C. Creative Hobby Studio
  function openHobbyModal() {
    let html = `
      <p style="margin-top: 0; font-size: 0.88rem; color: #fce7f3;">
        Pilih proyek seni dan kerajinan tangan masa kecil untuk diselesaikan di meja atelier:
      </p>
      <div class="kidult-card-grid">
    `;

    KIDULT_HOBBY_PROJECTS.forEach(proj => {
      html += `
        <div class="kidult-item-card">
          <div class="kidult-item-card-header">
            <div class="kidult-item-card-icon">${proj.icon}</div>
            <div>
              <h4 class="kidult-item-card-title">${proj.title}</h4>
              <span style="font-size: 0.7rem; color: #a7f3d0;">${proj.category}</span>
            </div>
          </div>
          <p class="kidult-item-card-desc">${proj.desc}</p>
          <div style="font-size: 0.72rem; color: #e9d5ff; margin-top: 4px;">
            <strong>Bahan:</strong> ${proj.materials.join(', ')}
          </div>
          <button type="button" class="btn-craft-project" data-proj-title="${proj.title}"
            style="margin-top: 10px; background: linear-gradient(135deg, #a855f7, #7c3aed); border: none; color: #fff; padding: 6px 12px; border-radius: 10px; font-weight: 700; cursor: pointer;">
            Buat Karya 🎨
          </button>
        </div>
      `;
    });

    html += `</div>`;
    openModal('🎨 Creative Hobby Room — Proyek Seni & Kerajinan', html);

    const modalB = document.getElementById('kidult-house-modal-body');
    if (modalB) {
      modalB.querySelectorAll('.btn-craft-project').forEach(btn => {
        btn.addEventListener('click', () => {
          const t = btn.getAttribute('data-proj-title');
          playKidultChime();
          btn.disabled = true;
          btn.textContent = 'Mengerjakan... ✂️';
          setTimeout(() => {
            btn.textContent = 'Tersimpan di Atelier! ⭐';
            toast(`🎨 Karya "${t}" berhasil diselesaikan dan dipajang dengan indah!`);
          }, 1200);
        });
      });
    }
  }

  // D. Memory Attic Chest & 8 Friends Letters
  function openMemoryModal() {
    let html = `
      <p style="margin-top: 0; font-size: 0.88rem; color: #fce7f3;">
        Peti kenangan loteng menyimpan surat dan kenangan tulus dari kedelapan sahabat Our Little Universe:
      </p>
      <div class="kidult-card-grid">
    `;

    KIDULT_MEMORY_ITEMS.forEach(item => {
      html += `
        <div class="kidult-item-card">
          <div class="kidult-item-card-header">
            <div class="kidult-item-card-icon">${item.icon}</div>
            <div>
              <h4 class="kidult-item-card-title">${item.title}</h4>
              <span style="font-size: 0.7rem; color: #fbbf24;">Pengirim: ${item.char}</span>
            </div>
          </div>
          <div style="font-size: 0.68rem; color: #fbcfe8; margin-top: 2px;">📅 ${item.date}</div>
          <blockquote style="margin: 8px 0 0 0; padding-left: 10px; border-left: 2px solid #f472b6; font-style: italic; font-size: 0.8rem; color: #fdf2f8;">
            "${item.excerpt}"
          </blockquote>
        </div>
      `;
    });

    html += `</div>`;
    openModal('🗝️ Memory Attic — Peti Surat & Kenangan 8 Sahabat', html);
  }

  // E. Fairy Story Bookshelf
  function openStoryBookshelfModal() {
    const stories = [
      { title: 'Kisah Bintang yang Lupa Bersinar', author: 'Nyanya ⭐', desc: 'Sebuah dongeng tentang bintang kecil yang menemukan kembali kilau terindahnya saat berbagi cahaya dengan kawan.' },
      { title: 'Matahari di Ladang Bunga Persik', author: 'Lala ☀️', desc: 'Perjalanan peri bunga menemukan musim semi abadi di tanah persahabatan.' },
      { title: 'Melodi Malam Sang Penjaga Bayangan', author: 'Lele 🌙', desc: 'Kisah istana obsidian dan lagu sunyi yang selalu menemani mereka yang bermimpi.' }
    ];

    let html = `
      <p style="margin-top: 0; font-size: 0.88rem; color: #fce7f3;">
        Pilihan buku cerita dongeng yang tersusun rapi di rak buku ruang keluarga:
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
    `;

    stories.forEach(s => {
      html += `
        <div style="background: rgba(30, 27, 75, 0.7); border: 1px solid rgba(244, 114, 182, 0.4); border-radius: 12px; padding: 12px 14px;">
          <h4 style="margin: 0; font-size: 0.95rem; color: #fff;">📖 ${s.title}</h4>
          <span style="font-size: 0.72rem; color: #fbbf24;">Penulis: ${s.author}</span>
          <p style="margin: 6px 0 0 0; font-size: 0.8rem; color: #fce7f3; line-height: 1.4;">${s.desc}</p>
        </div>
      `;
    });

    html += `</div>`;
    openModal('📚 Rak Buku Dongeng Favorit — KIDULT', html);
  }

  // F. KIDULT Journal
  function openJournalModal() {
    const entries = currentState?.journalEntries || [];
    let html = `
      <div style="margin-bottom: 14px;">
        <label style="display: block; font-size: 0.8rem; color: #fbcfe8; margin-bottom: 4px;">Tulis Catatan / Renungan Hari Ini:</label>
        <input type="text" id="kidult-journal-title-input" placeholder="Judul catatan..."
          style="width: 100%; box-sizing: border-box; background: rgba(30, 27, 75, 0.8); border: 1px solid #f472b6; border-radius: 8px; color: #fff; padding: 8px 12px; margin-bottom: 8px;">
        <textarea id="kidult-journal-content-input" rows="3" placeholder="Tuliskan rasa syukur atau kenangan manismu hari ini..."
          style="width: 100%; box-sizing: border-box; background: rgba(30, 27, 75, 0.8); border: 1px solid #f472b6; border-radius: 8px; color: #fff; padding: 8px 12px;"></textarea>
        <button type="button" id="btn-save-kidult-journal"
          style="margin-top: 8px; background: linear-gradient(135deg, #f472b6, #db2777); border: none; color: #fff; font-weight: 700; padding: 6px 16px; border-radius: 10px; cursor: pointer;">
          Simpan ke Jurnal ⭐
        </button>
      </div>
      <h4 style="margin: 16px 0 8px 0; font-size: 0.9rem; color: #fbbf24;">Riwayat Jurnal:</h4>
      <div id="kidult-journal-list" style="display: flex; flex-direction: column; gap: 8px;">
    `;

    entries.forEach(e => {
      html += `
        <div style="background: rgba(30, 27, 75, 0.7); border: 1px solid rgba(244, 114, 182, 0.35); border-radius: 10px; padding: 10px 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <strong style="color: #fff; font-size: 0.88rem;">${e.title}</strong>
            <span style="font-size: 0.68rem; color: #fbcfe8;">${e.date}</span>
          </div>
          <p style="margin: 4px 0 0 0; font-size: 0.78rem; color: #fdf2f8;">${e.content}</p>
        </div>
      `;
    });

    html += `</div>`;
    openModal('📓 Jurnal Malam & Catatan Impian — KIDULT', html);

    const btnSave = document.getElementById('btn-save-kidult-journal');
    if (btnSave) {
      btnSave.addEventListener('click', () => {
        const titleInput = document.getElementById('kidult-journal-title-input');
        const contentInput = document.getElementById('kidult-journal-content-input');
        if (!titleInput || !contentInput || !titleInput.value.trim()) return;

        const newEntry = {
          id: `j_${Date.now()}`,
          date: 'Hari ini',
          title: titleInput.value.trim(),
          content: contentInput.value.trim()
        };

        if (currentState) {
          currentState.journalEntries = currentState.journalEntries || [];
          currentState.journalEntries.unshift(newEntry);
          saveCurrentState();
        }

        playKidultChime();
        toast('📓 Catatan berhasil disimpan ke dalam Jurnal KIDULT!');
        closeModal();
      });
    }
  }

  // G. Wardrobe Styling
  function openWardrobeModal() {
    const outfits = [
      { name: 'Pastel Dream Pajamas', icon: '🎀', desc: 'Piyama sutra merah muda berhias pola bintang lavender.' },
      { name: 'Cottage Afternoon Dress', icon: '👗', desc: 'Gaun vintage berkancing kayu dengan apron manis untuk memanggang kue.' },
      { name: 'Twilight Star Capelet', icon: '⭐', desc: 'Jubah pendek berornamen rasi bintang untuk menikmati malam di teras.' }
    ];

    let html = `
      <p style="margin-top: 0; font-size: 0.88rem; color: #fce7f3;">
        Ganti busana Nyanya sesuai aktivitas rumah impian hari ini:
      </p>
      <div class="kidult-card-grid">
    `;

    outfits.forEach(o => {
      html += `
        <div class="kidult-item-card">
          <div class="kidult-item-card-header">
            <div class="kidult-item-card-icon">${o.icon}</div>
            <h4 class="kidult-item-card-title">${o.name}</h4>
          </div>
          <p class="kidult-item-card-desc">${o.desc}</p>
          <button type="button" class="btn-wear-outfit" data-name="${o.name}"
            style="margin-top: 8px; background: linear-gradient(135deg, #f472b6, #db2777); border: none; color: #fff; font-weight: 700; padding: 6px 12px; border-radius: 10px; cursor: pointer;">
            Kenakan Busana ✨
          </button>
        </div>
      `;
    });

    html += `</div>`;
    openModal('👗 Lemari Busana & Piyama — KIDULT', html);

    const modalB = document.getElementById('kidult-house-modal-body');
    if (modalB) {
      modalB.querySelectorAll('.btn-wear-outfit').forEach(btn => {
        btn.addEventListener('click', () => {
          const n = btn.getAttribute('data-name');
          playKidultChime();
          toast(`👗 Nyanya sekarang mengenakan "${n}"!`);
          closeModal();
        });
      });
    }
  }

  // H. Quick Tool: Atmosphere Picker
  function openAtmoModal() {
    let html = `
      <p style="margin-top: 0; font-size: 0.88rem; color: #fce7f3;">
        Pilih suasana pencahayaan rumah KIDULT Dream House:
      </p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
    `;

    KIDULT_ATMOSPHERES.forEach(a => {
      const isCurrent = (currentState?.currentAtmo === a.id);
      html += `
        <button type="button" class="btn-select-atmo" data-atmo-id="${a.id}"
          style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: ${isCurrent ? 'linear-gradient(135deg, #f472b6, #db2777)' : 'rgba(30, 27, 75, 0.7)'}; border: 1.5px solid ${isCurrent ? '#fff' : 'rgba(244, 114, 182, 0.4)'}; border-radius: 14px; color: #fff; font-weight: 700; cursor: pointer;">
          <span style="display: flex; align-items: center; gap: 10px; font-size: 0.95rem;">
            <span>${a.icon}</span>
            <span>${a.name}</span>
          </span>
          <span>${isCurrent ? '✓ Aktif' : 'Pilih'}</span>
        </button>
      `;
    });

    html += `</div>`;
    openModal('🌤️ Pengaturan Pencahayaan Suasana — KIDULT', html);

    const modalB = document.getElementById('kidult-house-modal-body');
    if (modalB) {
      modalB.querySelectorAll('.btn-select-atmo').forEach(btn => {
        btn.addEventListener('click', () => {
          const atmoId = btn.getAttribute('data-atmo-id');
          applyAtmosphere(atmoId);
          saveCurrentState();
          playKidultChime();
          toast('🌤️ Suasana pencahayaan rumah berhasil disesuaikan!');
          closeModal();
        });
      });
    }
  }

  // I. Quick Tool: Daily Tasks
  function openTasksModal() {
    let html = `
      <p style="margin-top: 0; font-size: 0.88rem; color: #fce7f3;">
        Aktivitas harian yang menyenangkan untuk dilakukan di KIDULT Dream House:
      </p>
      <div style="display: flex; flex-direction: column; gap: 8px;">
    `;

    KIDULT_HOUSE_TASKS.forEach(task => {
      html += `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(30, 27, 75, 0.7); border: 1px solid rgba(244, 114, 182, 0.35); border-radius: 12px;">
          <span style="font-size: 0.88rem; color: #fff;">✦ ${task.title}</span>
          <span style="font-size: 0.75rem; color: #fbbf24; font-weight: 700;">+${task.xp} XP</span>
        </div>
      `;
    });

    html += `</div>`;
    openModal('📋 Aktivitas Harian Rumah — KIDULT', html);
  }

  // J. Quick Tool: Bag & Collectibles
  function openInventoryModal() {
    const items = currentState?.inventory || [];
    let html = `
      <p style="margin-top: 0; font-size: 0.88rem; color: #fce7f3;">
        Barang-barang sentimental dan koleksi kecil yang disimpan Nyanya:
      </p>
      <div class="kidult-card-grid">
    `;

    items.forEach(item => {
      html += `
        <div class="kidult-item-card">
          <div class="kidult-item-card-header">
            <div class="kidult-item-card-icon">${item.icon}</div>
            <div>
              <h4 class="kidult-item-card-title">${item.name}</h4>
              <span style="font-size: 0.72rem; color: #fbbf24;">Jumlah: x${item.count}</span>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    openModal('🎒 Tas & Koleksi Pribadi Nyanya — KIDULT', html);
  }

  // Peaceful Bed Sleep Transition
  function triggerBedSleep() {
    if (!sleepOverlay) return;
    sleepOverlay.classList.add('active');
    playMusicBoxLullaby();
    setTimeout(() => {
      sleepOverlay.classList.remove('active');
      toast('⭐ Bangun dengan tubuh segar dan mimpi-mimpi indah yang bermekaran ~');
    }, 2800);
  }

  // ---------------------------------------------------------------------------
  // 5. EVENT LISTENERS INITIALIZATION
  // ---------------------------------------------------------------------------
  function attachEventListeners() {
    // Return button to KIDULT universe
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        closeKidultHouse();
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

    // Room Navigation Pills
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.kidult-house-room-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-room-id');
          if (target && target !== currentRoomConfig.id) {
            renderRoom(target, true);
          }
        });
      });
    }

    // Quick Tool buttons
    if (btnToolAtmo) btnToolAtmo.addEventListener('click', openAtmoModal);
    if (btnToolTasks) btnToolTasks.addEventListener('click', openTasksModal);
    if (btnToolBag) btnToolBag.addEventListener('click', openInventoryModal);

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (!houseView || !houseView.classList.contains('active')) return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.code)) {
        pressedKeys.add(e.code);
        e.preventDefault();
      }

      if ((e.code === 'KeyE' || e.code === 'Space') && activeNearbyHotspot) {
        triggerHotspotAction(activeNearbyHotspot);
        e.preventDefault();
      }
    });

    window.addEventListener('keyup', (e) => {
      pressedKeys.delete(e.code);
    });

    // Touch D-Pad setup
    function setupTouchBtn(el, dir) {
      if (!el) return;
      const start = (e) => { e.preventDefault(); touchState[dir] = true; };
      const end = (e) => { e.preventDefault(); touchState[dir] = false; };
      el.addEventListener('touchstart', start, { passive: false });
      el.addEventListener('touchend', end, { passive: false });
      el.addEventListener('mousedown', start);
      el.addEventListener('mouseup', end);
      el.addEventListener('mouseleave', end);
    }

    setupTouchBtn(dpadUp, 'up');
    setupTouchBtn(dpadDown, 'down');
    setupTouchBtn(dpadLeft, 'left');
    setupTouchBtn(dpadRight, 'right');

    if (touchActionBtn) {
      touchActionBtn.addEventListener('click', () => {
        if (activeNearbyHotspot) triggerHotspotAction(activeNearbyHotspot);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. PUBLIC LIFECYCLE API
  // ---------------------------------------------------------------------------
  function openKidultHouse(charKey = 'nyanya', roomId = 'living') {
    activeCharacter = charKey || 'nyanya';
    loadStateForActiveChar();

    if (houseView) {
      houseView.classList.add('active');
      houseView.setAttribute('aria-hidden', 'false');
    }

    renderRoom(roomId || currentState?.currentRoom || 'living', false);
    toast('🏡 Memasuki KIDULT DREAM HOUSE — Rumah Impian Nyanya ⭐');
  }

  function closeKidultHouse() {
    saveCurrentState();
    closeModal();
    if (houseView) {
      houseView.classList.remove('active');
      houseView.setAttribute('aria-hidden', 'true');
    }
  }

  // Initialize
  attachEventListeners();
  loadStateForActiveChar();
  animFrameId = requestAnimationFrame(gameLoop);

  return {
    openKidultHouse,
    closeKidultHouse,
    openEverdreamHouse: (roomId) => openKidultHouse('nyanya', roomId), // Backward-compatible alias
    closeEverdreamHouse: () => closeKidultHouse(),                     // Backward-compatible alias
    renderRoom,
    triggerHotspotAction,
    getCurrentRoom: () => currentRoomConfig?.id,
    openCookingModal,
    openPianoModal,
    openHobbyModal,
    openMemoryModal,
    openJournalModal
  };
}
