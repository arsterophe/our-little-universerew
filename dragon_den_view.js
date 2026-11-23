/**
 * THE DRAGON'S DEN — RUBEN 🐉 (UNIVERSE ASH)
 * 2D Interactive Simulation Controller & Game Loop
 * =============================================================================
 */

import {
  DRAGON_DEN_CHARACTER,
  DRAGON_DEN_ROOMS,
  DRAGON_DEN_RECIPES,
  DRAGON_DEN_FLORA,
  DRAGON_DEN_LETTERS,
  DRAGON_DEN_COLLECTIBLES,
  DRAGON_DEN_TASKS,
  DRAGON_DEN_ATMOSPHERES,
  loadDragonDenState,
  saveDragonDenState,
  playDragonPianoNote,
  playVioletHearthCrackling,
  playCastleChimeZen,
  playKettleSimmerSizzle
} from './dragon_den_state.js';

export function initDragonDenView({ onShowToast, onTriggerSparkle, onNavigateBack } = {}) {
  // DOM Elements
  const dragonView = document.getElementById('view-dragon-den');
  const stageEl = document.getElementById('dragon-den-stage');
  const roomBgImg = document.getElementById('dragon-den-bg-img');
  const hotspotsContainer = document.getElementById('dragon-den-hotspots-container');
  const playerAvatar = document.getElementById('dragon-den-player-avatar');
  const promptEl = document.getElementById('dragon-den-interaction-prompt');
  const promptTextEl = document.getElementById('dragon-den-prompt-text');

  // Navigation HUDs
  const btnBack = document.getElementById('btn-dragon-den-back');
  const titleRoomEl = document.getElementById('dragon-den-room-title');
  const titleSubtitleEl = document.getElementById('dragon-den-room-subtitle');
  const navPillsContainer = document.getElementById('dragon-den-nav-pills');

  // Quick Tools
  const btnToolAtmo = document.getElementById('btn-dragon-den-tool-atmo');
  const btnToolTasks = document.getElementById('btn-dragon-den-tool-tasks');
  const btnToolBag = document.getElementById('btn-dragon-den-tool-bag');

  // Modals & Overlays
  const modalBackdrop = document.getElementById('dragon-den-modal-backdrop');
  const modalTitle = document.getElementById('dragon-den-modal-title');
  const modalBody = document.getElementById('dragon-den-modal-body');
  const btnModalClose = document.getElementById('btn-dragon-den-modal-close');
  const sleepOverlay = document.getElementById('dragon-den-sleep-overlay');
  const atmoOverlay = document.getElementById('dragon-den-atmo-overlay');
  const fxOverlay = document.getElementById('dragon-den-fx-overlay');

  // Touch controls
  const dpadUp = document.getElementById('dragon-dpad-up');
  const dpadDown = document.getElementById('dragon-dpad-down');
  const dpadLeft = document.getElementById('dragon-dpad-left');
  const dpadRight = document.getElementById('dragon-dpad-right');
  const touchActionBtn = document.getElementById('dragon-touch-action');

  let activeCharacter = 'ruben';
  let currentState = null;
  let currentRoomConfig = DRAGON_DEN_ROOMS[0]; // Start at Grand Hall

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
    currentState = loadDragonDenState(activeCharacter);
    const room = DRAGON_DEN_ROOMS.find(r => r.id === currentState.currentRoom) || DRAGON_DEN_ROOMS[0];
    currentRoomConfig = room;
    return true;
  }

  function saveCurrentState() {
    if (!currentState) return;
    saveDragonDenState(activeCharacter, currentState);
  }

  // ---------------------------------------------------------------------------
  // 1. RENDER ROOM & ATMOSPHERE
  // ---------------------------------------------------------------------------
  function renderRoom(roomId, spawnAtDefault = false) {
    const room = DRAGON_DEN_ROOMS.find(r => r.id === roomId) || DRAGON_DEN_ROOMS[0];
    currentRoomConfig = room;
    if (currentState) currentState.currentRoom = room.id;

    // Update Titles
    if (titleRoomEl) titleRoomEl.textContent = room.name;
    if (titleSubtitleEl) titleSubtitleEl.textContent = room.subtitle;

    // Update Background Image
    if (roomBgImg) {
      roomBgImg.src = room.bgImage;
      roomBgImg.alt = `${room.name} — THE DRAGON'S DEN`;
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
      navPillsContainer.querySelectorAll('.dragon-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.roomId === room.id);
      });
    }

    // Hide prompt
    hidePrompt();

    // Spawning embers & fog
    initEmberParticles();

    // Sound chime
    playCastleChimeZen();
    saveCurrentState();
  }

  function applyAtmosphere(atmoId) {
    const atmo = DRAGON_DEN_ATMOSPHERES.find(a => a.id === atmoId) || DRAGON_DEN_ATMOSPHERES[0];
    if (currentState) currentState.atmosphere = atmo.id;
    if (atmoOverlay) {
      atmoOverlay.style.background = atmo.ambientOverlay;
    }
    saveCurrentState();
  }

  function initEmberParticles() {
    if (!fxOverlay) return;
    fxOverlay.innerHTML = '<div class="dragon-fog"></div>';

    // Create 14 rising embers
    for (let i = 0; i < 14; i++) {
      const ember = document.createElement('div');
      ember.className = 'dragon-ember';
      const size = 3 + Math.random() * 5;
      ember.style.width = `${size}px`;
      ember.style.height = `${size}px`;
      ember.style.left = `${Math.random() * 100}%`;
      ember.style.animationDuration = `${5 + Math.random() * 6}s`;
      ember.style.animationDelay = `${Math.random() * 4}s`;
      fxOverlay.appendChild(ember);
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
      item.className = 'dragon-den-hotspot-item';
      item.dataset.hotspotId = hs.id;
      item.style.left = `${hs.x}%`;
      item.style.top = `${hs.y}%`;

      const beacon = document.createElement('div');
      beacon.className = 'dragon-den-beacon';
      beacon.textContent = hs.icon || '🐉';

      const label = document.createElement('div');
      label.className = 'dragon-den-beacon-label';
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
    let minDist = 8.5;

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
    if (dragonView && dragonView.classList.contains('active')) {
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
      toast(`🐉 Tugas Selesai: ${task.label} (+${task.xp} XP)`);
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
    if (hs.action === 'goto_memory') {
      renderRoom('memory', true);
      return;
    }
    if (hs.action === 'goto_hall') {
      renderRoom('hall', true);
      return;
    }

    // Specific Room Actions
    switch (hs.action) {
      case 'sit_sofa': {
        if (playerAvatar) playerAvatar.classList.add('is-sitting');
        playDragonPianoNote(440);
        toast('🐉 Ruben duduk bersantai di sofa beludru arang kerajaan...');
        break;
      }

      case 'play_piano': {
        markTaskDone('task_piano');
        const notes = [
          { name: 'La (A4)', freq: 440.00, note: 'A' },
          { name: 'Do (C5)', freq: 523.25, note: 'C' },
          { name: 'Re (D5)', freq: 587.33, note: 'D' },
          { name: 'Mi (E5)', freq: 659.25, note: 'E' },
          { name: 'Sol (G5)', freq: 783.99, note: 'G' },
          { name: 'La (A5)', freq: 880.00, note: 'A5' }
        ];

        let keysHtml = '<div style="display:flex; justify-content:center; gap:8px; margin:20px 0;">';
        notes.forEach(n => {
          keysHtml += `
            <button type="button" class="dragon-piano-key" data-freq="${n.freq}" style="
              width: 58px; height: 160px; background: linear-gradient(to bottom, #1e293b, #0f172a);
              border: 1.5px solid #a855f7; border-radius: 0 0 10px 10px; cursor: pointer;
              font-weight: 700; color: #f8fafc; font-size: 0.85rem; display: flex;
              flex-direction: column; justify-content: flex-end; padding-bottom: 12px;
              box-shadow: 0 6px 16px rgba(0,0,0,0.5); transition: transform 0.1s ease;
            ">${n.note}<br><span style="font-size:0.65rem; color:#c084fc;">${Math.round(n.freq)}Hz</span></button>
          `;
        });
        keysHtml += '</div>';

        openModal('🎹 Grand Piano Gotik Hitam & Perak — Sonata Benteng Naga', `
          <p style="color:#cbd5e1; margin-bottom:12px;">Mainkan alunan sonata malam yang megah, anggun, dan bergema di seluruh pilar batu The Dragon\'s Grand Hall.</p>
          ${keysHtml}
          <div style="background:rgba(30, 17, 54, 0.4); padding:12px 16px; border-radius:12px; border:1px solid rgba(124, 58, 237, 0.35); font-size:0.85rem;">
            <strong>✦ Resonansi Akustik Kastil:</strong> Dentingan nada diperkaya resonansi pilar batu gotik dan kehangatan bara api naga.
          </div>
        `);

        setTimeout(() => {
          const keyBtns = modalBody.querySelectorAll('.dragon-piano-key');
          keyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
              const freq = parseFloat(btn.dataset.freq);
              playDragonPianoNote(freq);
              btn.style.transform = 'translateY(4px)';
              setTimeout(() => { btn.style.transform = 'translateY(0)'; }, 120);
            });
          });
        }, 50);
        break;
      }

      case 'warm_hearth': {
        markTaskDone('task_hearth');
        playVioletHearthCrackling();
        toast('🔥 Menghangatkan diri di dekat perapian agung api ungu... kehangatan menembus rasa dingin pegunungan.');
        break;
      }

      case 'gaze_mountains': {
        playCastleChimeZen();
        openModal('🌕 Pemandangan Puncak Bersalju & Langit Rembulan', `
          <div style="text-align:center; padding:10px 0;">
            <div style="font-size:3.5rem; margin-bottom:10px;">🐉🌕🏔️</div>
            <h4 style="color:#f8fafc; margin-bottom:8px;">Benteng Puncak Salju ASH</h4>
            <p style="color:#cbd5e1; font-style:italic; line-height:1.6;">
              "Di luar jendela lengkung gotik, angin malam berhembus kencang di antara tebing-tebing curam. Bayangan naga perak meluncur megah di depan lingkaran bulan purnama yang sempurna, menjaga semesta dalam keheningan abadi."
            </p>
          </div>
        `);
        break;
      }

      case 'dragon_statues': {
        openModal('🛡️ Pedestal Patung & Artefak Sayap Naga', `
          <div style="display:flex; flex-direction:column; gap:12px;">
            <div style="background:rgba(30, 17, 54, 0.4); padding:12px; border-radius:12px; border:1px solid rgba(124, 58, 237, 0.35);">
              <h4 style="color:#f8fafc; margin:0 0 4px 0;">🐉 Patung Naga Perak Kuno</h4>
              <p style="margin:0; font-size:0.85rem; color:#cbd5e1;">Pahat batu pualam hitam dan perak yang menggambarkan naga leluhur penjaga puncak tertinggi ASH.</p>
            </div>
            <div style="background:rgba(30, 17, 54, 0.4); padding:12px; border-radius:12px; border:1px solid rgba(124, 58, 237, 0.35);">
              <h4 style="color:#f8fafc; margin:0 0 4px 0;">⚔️ Sumpah Pelindung Sembilan Alam</h4>
              <p style="margin:0; font-size:0.85rem; color:#cbd5e1;">Ukiran kuno yang memuat janji kesetiaan penjaga naga untuk melindungi seluruh sahabat Our Little Universe.</p>
            </div>
          </div>
        `);
        break;
      }

      case 'rest_bed': {
        if (!sleepOverlay) return;
        toast('🌙 Ruben beristirahat di ranjang kanopi beludru ungu kerajaan...');
        sleepOverlay.classList.add('active');
        playCastleChimeZen();
        setTimeout(() => {
          sleepOverlay.classList.remove('active');
          toast('☀️ Ruben terbangun dengan stamina penuh dan energi naga yang menyala.');
        }, 1800);
        break;
      }

      case 'write_journal': {
        renderJournalModal();
        break;
      }

      case 'open_wardrobe': {
        renderWardrobeModal();
        break;
      }

      case 'look_balcony': {
        playVioletHearthCrackling();
        openModal('🌌 Balkon Batu Langit Malam', `
          <p style="line-height:1.6; color:#cbd5e1;">
            Berdiri di teras balkon batu dengan hembusan angin dingin pegunungan. Dari kejauhan, pulau-pulau kosmik Our Little Universe tampak bersinar indah seperti permata di tengah malam.
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

      case 'dining_table': {
        playDragonPianoNote(523.25);
        toast('🍷 Menikmati santapan sup daging hangat dan kue beri malam di meja perjamuan...');
        break;
      }

      case 'plant_garden':
      case 'crystal_pot':
      case 'water_plants':
      case 'harvest_flowers': {
        renderConservatoryModal();
        break;
      }

      case 'crystal_pond': {
        playCastleChimeZen();
        toast('🪷 Mengamati kolam kristal dengan pantulan cahaya bulan dan teratai ungu...');
        break;
      }

      case 'energy_crystal': {
        playCastleChimeZen();
        toast('🔮 Menyerap resonansi kristal energi amethyst... kekuatan pelindung naga meningkat!');
        break;
      }

      case 'garden_bench': {
        playDragonPianoNote(392);
        toast('🪑 Duduk tenang di bangku batu menghirup kesegaran aroma mawar malam dan pohon perak...');
        break;
      }

      case 'write_chronicle': {
        renderWritingModal();
        break;
      }

      case 'read_letters': {
        markTaskDone('task_letters');
        renderFriendshipLettersModal();
        break;
      }

      case 'view_map': {
        renderKingdomMapModal();
        break;
      }

      case 'view_album': {
        renderAlbumModal();
        break;
      }

      case 'open_chest': {
        renderCollectiblesModal();
        break;
      }

      case 'dragon_altar': {
        markTaskDone('task_altar');
        playVioletHearthCrackling();
        openModal('✨ Altar Perlindungan Naga & Api Abadi', `
          <div style="text-align:center; padding:15px;">
            <div style="font-size:3rem; margin-bottom:12px;">🐉🔥✨</div>
            <h3 style="color:#f8fafc; margin-bottom:10px;">Heart of the Ashen Flame — Kekuatan Perlindungan</h3>
            <p style="color:#cbd5e1; line-height:1.6; font-style:italic;">
              "Di hadapan altar naga abadi, Ruben memperbarui tekadnya: Menjadi benteng pelindung yang tak tergoyahkan, menjaga persahabatan, dan menyinari kegelapan malam dengan api kesetiaan."
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
        <div style="background:rgba(30, 17, 54, 0.4); padding:12px 14px; border-radius:12px; border:1px solid rgba(124, 58, 237, 0.35); margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <strong style="color:#f8fafc; font-size:0.95rem;">${j.title}</strong>
            <span style="font-size:0.75rem; color:#c084fc;">${j.date}</span>
          </div>
          <p style="margin:0; font-size:0.85rem; color:#cbd5e1; line-height:1.5;">${j.content}</p>
        </div>
      `).join('');
    }

    openModal('📓 Catatan Kronik Ruben — Jurnal Sang Penjaga', `
      <div style="margin-bottom:16px;">
        <h4 style="color:#f8fafc; margin-bottom:8px;">Tulis Kronik Baru:</h4>
        <input type="text" id="dragon-journal-title" placeholder="Judul kronik..." style="width:100%; padding:8px 12px; margin-bottom:8px; border-radius:10px; border:1px solid #7c3aed; background:#0f172a; color:#fff; box-sizing:border-box;">
        <textarea id="dragon-journal-text" rows="3" placeholder="Tuliskan catatan perlindungan & renungan malam..." style="width:100%; padding:8px 12px; border-radius:10px; border:1px solid #7c3aed; background:#0f172a; color:#fff; box-sizing:border-box;"></textarea>
        <button type="button" id="btn-dragon-save-journal" class="dragon-den-btn-primary" style="margin-top:8px;">
          🐉 Simpan Catatan Kronik
        </button>
      </div>
      <h4 style="color:#f8fafc; margin-bottom:8px;">Lembaran Kronik Terdahulu:</h4>
      ${entriesHtml}
    `);

    setTimeout(() => {
      const btnSave = document.getElementById('btn-dragon-save-journal');
      if (btnSave) {
        btnSave.addEventListener('click', () => {
          const title = document.getElementById('dragon-journal-title')?.value.trim();
          const content = document.getElementById('dragon-journal-text')?.value.trim();
          if (!title || !content) {
            toast('Silakan isi judul dan teks kronik.');
            return;
          }
          currentState.journalEntries.unshift({
            id: 'j_' + Date.now(),
            title,
            date: 'Malam Penuh Bintang',
            content
          });
          saveCurrentState();
          toast('🐉 Kronik berhasil disimpan!');
          renderJournalModal();
        });
      }
    }, 50);
  }

  function renderWardrobeModal() {
    const outfits = [
      { id: 'dragon_armor', name: 'Dragon Guardian Battle Armor', icon: '🛡️', desc: 'Zirah lempeng besi arang kokoh dengan pelindung bahu kristal violet bersisik naga.' },
      { id: 'royal_cloak', name: 'Royal Ashen Velvet Cloak', icon: '🧥', desc: 'Jubah beludru ungu tua berhias bulu perak rembulan untuk jamuan malam di aula.' },
      { id: 'gothic_tunic', name: 'Gothic Castle Casual Tunic', icon: '🖤', desc: 'Tunika hitam tengah malam berbordir naga emas antik yang nyaman untuk bersantai.' }
    ];

    let html = '<div style="display:flex; flex-direction:column; gap:10px;">';
    outfits.forEach(o => {
      html += `
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(30,17,54,0.4); padding:12px; border-radius:12px; border:1px solid rgba(124,58,237,0.35);">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">${o.icon}</span>
            <div>
              <strong style="color:#f8fafc;">${o.name}</strong>
              <p style="margin:2px 0 0 0; font-size:0.8rem; color:#c084fc;">${o.desc}</p>
            </div>
          </div>
          <button type="button" class="dragon-den-btn-primary btn-select-outfit" data-name="${o.name}" style="padding:6px 14px; font-size:0.8rem;">Kenakan</button>
        </div>
      `;
    });
    html += '</div>';

    openModal('🧥 Lemari Zirah & Busana Kerajaan Ruben', html);

    setTimeout(() => {
      modalBody.querySelectorAll('.btn-select-outfit').forEach(btn => {
        btn.addEventListener('click', () => {
          toast(`🐉 Ruben kini mengenakan: ${btn.dataset.name}`);
          closeModal();
        });
      });
    }, 50);
  }

  function renderBedroomDecorModal() {
    openModal('💎 Pengaturan Dekorasi Bilik Tidur Ruben', `
      <p style="color:#cbd5e1; margin-bottom:14px;">Pilih warna kain beludru kanopi ranjang kerajaan:</p>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <button type="button" class="dragon-den-btn-primary btn-canopy" data-color="deep_purple" style="justify-content:center;">💜 Deep Royal Purple</button>
        <button type="button" class="dragon-den-btn-primary btn-canopy" data-color="midnight_black" style="justify-content:center; background:linear-gradient(135deg, #1e293b, #0f172a);">🖤 Midnight Black</button>
        <button type="button" class="dragon-den-btn-primary btn-canopy" data-color="silver_crest" style="justify-content:center; background:linear-gradient(135deg, #cbd5e1, #94a3b8); color:#0f172a;">🛡️ Silver Crest</button>
        <button type="button" class="dragon-den-btn-primary btn-canopy" data-color="ashen_gold" style="justify-content:center; background:linear-gradient(135deg, #fbbf24, #d97706); color:#0f172a;">👑 Ashen Gold</button>
      </div>
    `);

    setTimeout(() => {
      modalBody.querySelectorAll('.btn-canopy').forEach(btn => {
        btn.addEventListener('click', () => {
          if (currentState) {
            currentState.decorOptions.bedroomCanopyColor = btn.dataset.color;
            saveCurrentState();
          }
          toast(`🐉 Dekorasi kanopi diubah ke nuansa: ${btn.textContent.trim()}`);
          closeModal();
        });
      });
    }, 50);
  }

  function renderKitchenCookingModal() {
    let recipesHtml = '<div style="display:flex; flex-direction:column; gap:12px;">';
    DRAGON_DEN_RECIPES.forEach(r => {
      const isCooked = currentState.cookedDishes && currentState.cookedDishes.includes(r.id);
      recipesHtml += `
        <div style="background:rgba(30, 17, 54, 0.4); padding:12px 14px; border-radius:12px; border:1px solid rgba(124, 58, 237, 0.35);">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.8rem;">${r.icon}</span>
              <div>
                <strong style="color:#f8fafc; font-size:0.95rem;">${r.name}</strong>
                <div style="font-size:0.75rem; color:#fbbf24;">Bahan: ${r.ingredients.join(', ')}</div>
              </div>
            </div>
            <button type="button" class="dragon-den-btn-primary btn-cook-recipe" data-recipe-id="${r.id}" style="padding:6px 14px; font-size:0.8rem;">
              ${isCooked ? 'Masak Ulang' : 'Masak Hidangan'}
            </button>
          </div>
          <p style="margin:6px 0 0 0; font-size:0.8rem; color:#cbd5e1;">${r.desc}</p>
        </div>
      `;
    });
    recipesHtml += '</div>';

    openModal('🍳 Ashen Kitchen — Jamuan Malam & Santapan Kastil', recipesHtml);

    setTimeout(() => {
      modalBody.querySelectorAll('.btn-cook-recipe').forEach(btn => {
        btn.addEventListener('click', () => {
          const recipeId = btn.dataset.recipeId;
          const recipe = DRAGON_DEN_RECIPES.find(r => r.id === recipeId);
          if (!recipe) return;

          playKettleSimmerSizzle();
          toast(`🍲 Memasak hidangan kastil: ${recipe.name}...`);
          markTaskDone('task_cook');

          if (!currentState.cookedDishes.includes(recipeId)) {
            currentState.cookedDishes.push(recipeId);
          }
          currentState.stats.dishesCooked = (currentState.stats.dishesCooked || 0) + 1;
          saveCurrentState();

          setTimeout(() => {
            playVioletHearthCrackling();
            toast(`✨ Selesai! Hidangan ${recipe.name} siap disantap (+${recipe.rewardXp} XP).`);
            renderKitchenCookingModal();
          }, 1200);
        });
      });
    }, 50);
  }

  function gatherFreshKitchenIngredients() {
    playVioletHearthCrackling();
    const items = ['Daging Panggang Kastil', 'Kentang Salju', 'Rempah Ashen Panas', 'Madu Malam Rembulan'];
    items.forEach(itName => {
      const invItem = currentState.inventory.find(i => i.name === itName);
      if (invItem) invItem.count += 2;
    });
    saveCurrentState();
    toast('❄️ Mengambil daging panggang segar, kentang salju, dan rempah kastil dari larder!');
  }

  function renderConservatoryModal() {
    markTaskDone('task_garden');
    let slotsHtml = '<div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px; margin-bottom:16px;">';
    currentState.gardenSlots.forEach(slot => {
      const stageText = slot.stage === 'blooming' ? '🌸 Mekar Berpendar' : slot.stage === 'growing' ? '🌱 Tumbuh Subur' : '🌰 Benih Tertanam';
      slotsHtml += `
        <div style="background:rgba(30,17,54,0.5); padding:12px; border-radius:12px; border:1px solid rgba(124,58,237,0.35); text-align:center;">
          <div style="font-size:2rem; margin-bottom:6px;">${slot.stage === 'blooming' ? '🌺' : slot.stage === 'growing' ? '🌿' : '🌰'}</div>
          <strong style="font-size:0.85rem; color:#f8fafc;">Slot #${slot.slotId}</strong>
          <div style="font-size:0.75rem; color:#c084fc; margin:2px 0 6px 0;">${slot.plantName}</div>
          <div style="font-size:0.72rem; color:#f97316; margin-bottom:8px;">${stageText}</div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${slot.stage === 'blooming'
              ? `<button type="button" class="dragon-den-btn-primary btn-harvest-slot" data-slot="${slot.slotId}" style="padding:4px 8px; font-size:0.72rem; justify-content:center;">🧺 Panen</button>`
              : `<button type="button" class="dragon-den-btn-primary btn-water-slot" data-slot="${slot.slotId}" style="padding:4px 8px; font-size:0.72rem; justify-content:center;">💧 Siram</button>`
            }
          </div>
        </div>
      `;
    });
    slotsHtml += '</div>';

    openModal("🌿 The Dragon's Conservatory — Rumah Kaca & Flora Malam", `
      <p style="color:#cbd5e1; margin-bottom:12px;">Rawat flora bercahaya perak dan bunga api abadi naga di bawah rangka besi gotik.</p>
      ${slotsHtml}
      <div style="background:rgba(30, 17, 54, 0.4); padding:10px 14px; border-radius:12px; border:1px solid rgba(124, 58, 237, 0.35); font-size:0.82rem; color:#cbd5e1;">
        <strong>✦ Petunjuk Konservatori:</strong> Siram tanaman secara teratur dengan air gletser murni untuk mempercepat mekarnya kelopak magis.
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
            playCastleChimeZen();
            toast(`💧 Menyiram ${slot.plantName} dengan air gletser... bunganya kini berpendar memukau!`);
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
            playDragonPianoNote(659.25);
            toast(`🧺 Berhasil memanen kelopak magis ${slot.plantName}!`);
            renderConservatoryModal();
          }
        });
      });
    }, 50);
  }

  function renderWritingModal() {
    openModal('✍️ Meja Tulis Antik & Kode Etik Penjaga Naga', `
      <div style="padding:8px 0;">
        <h4 style="color:#f8fafc; margin-bottom:8px;">Kronik Sumpah Penjaga:</h4>
        <div style="background:rgba(30,17,54,0.4); padding:14px; border-radius:12px; border:1px solid rgba(124,58,237,0.35); font-style:italic; line-height:1.6; color:#f8fafc;">
          "Di puncak tertinggi semesta ASH,<br>
          Bara api naga menyala abadi di tengah dinginnya malam,<br>
          Sayap perak kami membentang melindungi sembilan alam,<br>
          Menjaga persahabatan yang tak akan pernah pudar."
        </div>
      </div>
    `);
  }

  function renderFriendshipLettersModal() {
    let lettersHtml = '<div style="display:flex; flex-direction:column; gap:12px;">';
    DRAGON_DEN_LETTERS.forEach(letItem => {
      lettersHtml += `
        <div style="background:rgba(30, 17, 54, 0.4); padding:14px; border-radius:12px; border:1px solid rgba(124, 58, 237, 0.35);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:1.6rem;">${letItem.icon}</span>
              <div>
                <strong style="color:#f8fafc;">${letItem.sender}</strong>
                <span style="font-size:0.75rem; color:#c084fc; margin-left:6px;">(${letItem.universe})</span>
              </div>
            </div>
            <span style="font-size:0.75rem; color:#fbbf24;">${letItem.date}</span>
          </div>
          <div style="font-size:0.85rem; color:#cbd5e1; white-space:pre-line; line-height:1.55; background:rgba(15,23,42,0.6); padding:10px 12px; border-radius:8px; border-left:3px solid #7c3aed;">
            ${letItem.fullLetter}
          </div>
        </div>
      `;
    });
    lettersHtml += '</div>';

    openModal('💌 Kotak Surat Sahabat Our Little Universe', lettersHtml);
  }

  function renderKingdomMapModal() {
    openModal('🗺️ Peta Kuno Kerajaan & Rute Penerbangan Naga', `
      <div style="text-align:center; padding:10px 0;">
        <div style="font-size:3.2rem; margin-bottom:8px;">🪐🗺️🐉</div>
        <h4 style="color:#f8fafc; margin-bottom:6px;">Atlas Sembilan Alam Kosmik</h4>
        <p style="color:#cbd5e1; font-size:0.85rem; line-height:1.5; margin-bottom:12px;">
          Peta ini mendokumentasikan koordinat langit dan jalur angin naga yang menghubungkan ASH dengan KIDULT, TO YOU, SHADOW, THE ECLIPSE, PINWHEEL, YAWN, US AGAIN, dan HOT.
        </p>
        <div style="background:rgba(30,17,54,0.5); padding:10px; border-radius:10px; border:1px solid rgba(124,58,237,0.3); font-size:0.8rem; color:#c084fc;">
          ✦ Jalur Patroli Udara: Puncak ASH ➔ Lembah YAWN ➔ Danau US AGAIN ➔ Menara The Eclipse
        </div>
      </div>
    `);
  }

  function renderAlbumModal() {
    openModal('🖼️ Album Kenangan Petualangan Bersama', `
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div style="background:rgba(30,17,54,0.4); padding:10px; border-radius:12px; border:1px solid rgba(124,58,237,0.35); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:6px;">🐉☁️</div>
          <strong style="color:#f8fafc; font-size:0.85rem;">Terbang Bersama Balon Syma</strong>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Naga perak meluncur anggun di awan Pinwheel.</p>
        </div>
        <div style="background:rgba(30,17,54,0.4); padding:10px; border-radius:12px; border:1px solid rgba(124,58,237,0.35); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:6px;">🐉⚡</div>
          <strong style="color:#f8fafc; font-size:0.85rem;">Malam Badai Petir Akhira</strong>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Kilatan petir biru dan bara api naga.</p>
        </div>
        <div style="background:rgba(30,17,54,0.4); padding:10px; border-radius:12px; border:1px solid rgba(124,58,237,0.35); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:6px;">🐉🌙</div>
          <strong style="color:#f8fafc; font-size:0.85rem;">Pertemuan Bintang dengan Lele</strong>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Membahas kosmologi naga di The Eclipse.</p>
        </div>
        <div style="background:rgba(30,17,54,0.4); padding:10px; border-radius:12px; border:1px solid rgba(124,58,237,0.35); text-align:center;">
          <div style="font-size:2.5rem; margin-bottom:6px;">🐉🌸</div>
          <strong style="color:#f8fafc; font-size:0.85rem;">Upacara Teh Hening bersama Ela</strong>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Ketenangan teratai di tepi kolam US AGAIN.</p>
        </div>
      </div>
    `);
  }

  function renderCollectiblesModal() {
    let listHtml = '<div style="display:flex; flex-direction:column; gap:10px;">';
    DRAGON_DEN_COLLECTIBLES.forEach(c => {
      const foundItem = currentState.collectibles && currentState.collectibles.find(it => it.id === c.id);
      const isFound = foundItem ? foundItem.found : false;
      listHtml += `
        <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(30,17,54,0.4); padding:12px; border-radius:12px; border:1px solid rgba(124,58,237,0.35);">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:2rem;">${isFound ? c.icon : '❓'}</span>
            <div>
              <strong style="color:#f8fafc;">${isFound ? c.name : 'Relik Tersembunyi'}</strong>
              <p style="margin:2px 0 0 0; font-size:0.8rem; color:#cbd5e1;">${isFound ? c.desc : 'Dapat ditemukan melalui penjelajahan di dalam benteng kastil.'}</p>
            </div>
          </div>
          <span style="font-size:0.8rem; font-weight:700; color:${isFound ? '#fbbf24' : '#64748b'};">
            ${isFound ? '✓ Ditemukan' : 'Belum'}
          </span>
        </div>
      `;
    });
    listHtml += '</div>';

    openModal('🧰 Peti Pusaka & Relik Kerajaan Naga', listHtml);
  }

  // ---------------------------------------------------------------------------
  // 6. EVENT WIRING & KEYBOARD HANDLERS
  // ---------------------------------------------------------------------------
  function wireEvents() {
    // Back Button to ASH world
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
      navPillsContainer.querySelectorAll('.dragon-nav-btn').forEach(btn => {
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
        DRAGON_DEN_ATMOSPHERES.forEach(atmo => {
          const isActive = currentState && currentState.atmosphere === atmo.id;
          optionsHtml += `
            <button type="button" class="btn-select-atmo" data-atmo-id="${atmo.id}" style="
              display:flex; align-items:center; justify-content:space-between;
              background:${isActive ? 'linear-gradient(135deg, #7c3aed, #475569)' : 'rgba(30,17,54,0.4)'};
              border:1px solid rgba(124,58,237,0.35); padding:12px; border-radius:12px;
              color:#fff; cursor:pointer; text-align:left;
            ">
              <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.8rem;">${atmo.icon}</span>
                <div>
                  <strong>${atmo.name}</strong>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">${atmo.desc}</p>
                </div>
              </div>
              <span style="font-size:1.1rem;">${isActive ? '✓' : ''}</span>
            </button>
          `;
        });
        optionsHtml += '</div>';

        openModal('☀️ Pengaturan Atmosfer & Cahaya Kastil Gotik', optionsHtml);

        setTimeout(() => {
          modalBody.querySelectorAll('.btn-select-atmo').forEach(btn => {
            btn.addEventListener('click', () => {
              applyAtmosphere(btn.dataset.atmoId);
              toast(`🐉 Atmosfer diubah menjadi: ${btn.querySelector('strong').textContent}`);
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
            <div style="display:flex; align-items:center; justify-content:space-between; background:rgba(30,17,54,0.4); padding:10px 14px; border-radius:10px; border:1px solid rgba(124,58,237,0.35);">
              <span style="color:#f8fafc; font-size:0.88rem;">${t.label}</span>
              <span style="font-weight:700; color:${t.done ? '#fbbf24' : '#94a3b8'}; font-size:0.85rem;">
                ${t.done ? '✓ Selesai' : `+${t.xp} XP`}
              </span>
            </div>
          `;
        });
        tasksHtml += '</div>';
        openModal("📋 Agenda Harian Penjaga The Dragon's Den", tasksHtml);
      });
    }

    // Top Tools: Backpack Inventory
    if (btnToolBag) {
      btnToolBag.addEventListener('click', () => {
        let invHtml = '<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px;">';
        currentState.inventory.forEach(item => {
          invHtml += `
            <div style="background:rgba(30,17,54,0.4); padding:10px; border-radius:10px; border:1px solid rgba(124,58,237,0.35); display:flex; align-items:center; gap:10px;">
              <span style="font-size:1.8rem;">${item.icon}</span>
              <div>
                <strong style="color:#f8fafc; font-size:0.85rem;">${item.name}</strong>
                <div style="font-size:0.75rem; color:#cbd5e1;">Jumlah: ${item.count}</div>
              </div>
            </div>
          `;
        });
        invHtml += '</div>';
        openModal('🎒 Tas Perlengkapan & Logistik Ruben', invHtml);
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
      if (!dragonView || !dragonView.classList.contains('active')) return;
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
  renderRoom(currentState.currentRoom || 'hall', true);
  applyAtmosphere(currentState.atmosphere || 'ashen_twilight');
  gameLoop();

  return {
    openDragonDen(authUser = null, targetRoom = 'hall') {
      if (authUser && authUser.uid) {
        activeCharacter = 'ruben';
      }
      loadState();

      // Deactivate other views so house displays fullscreen
      document.querySelectorAll('.view-section').forEach(el => {
        if (el !== dragonView) {
          el.classList.remove('active');
          el.setAttribute('aria-hidden', 'true');
        }
      });

      if (dragonView) {
        dragonView.classList.add('active');
        dragonView.setAttribute('aria-hidden', 'false');
      }
      renderRoom(targetRoom || currentState.currentRoom || 'hall', true);
      applyAtmosphere(currentState.atmosphere || 'ashen_twilight');
      playCastleChimeZen();
      toast("🐉 Memasuki THE DRAGON'S DEN — The Eternal Ashen Castle Ruben");
    },

    closeDragonDen() {
      if (dragonView) {
        dragonView.classList.remove('active');
        dragonView.setAttribute('aria-hidden', 'true');
      }
      hidePrompt();
      closeModal();
    },

    getCurrentState() {
      return currentState;
    }
  };
}
