/**
 * THE ECLIPSE — THE AUTHOR'S ETERNAL SANCTUARY
 * Universe: Private Royal Celestial Sanctuary for Lele 🌙 (The Author)
 * 
 * 2D simulation exploration, player avatar controller,
 * room transitions, interactive hotspots, audio synthesis,
 * and Author's Desk modal management.
 */

import {
  ECLIPSE_ROOMS,
  AUTHOR_STORY_DRAFTS,
  OLU_UNIVERSE_LORE,
  CELESTIAL_OBSERVATIONS,
  ROYAL_WARDROBE_COLLECTION,
  isAuthorAuthorized,
  loadEclipseState,
  saveEclipseState,
  playGothicPianoNote,
  playCelestialBell,
  playEclipseChordSuccess
} from './eclipse_state.js';

export function initEclipseView({ onShowToast, onTriggerSparkle, onNavigateBack } = {}) {
  // DOM Elements
  const eclipseView = document.getElementById('view-eclipse');
  const stageEl = document.getElementById('eclipse-stage');
  const roomBgImg = document.getElementById('eclipse-bg-img');
  const hotspotsContainer = document.getElementById('eclipse-hotspots-container');
  const playerAvatar = document.getElementById('eclipse-player-avatar');
  const promptEl = document.getElementById('eclipse-interaction-prompt');
  const promptTextEl = document.getElementById('eclipse-prompt-text');

  // Navigation HUDs
  const btnBack = document.getElementById('btn-eclipse-back');
  const titleRoomEl = document.getElementById('eclipse-room-title');
  const titleSubtitleEl = document.getElementById('eclipse-room-subtitle');
  const navPillsContainer = document.getElementById('eclipse-nav-pills');
  const btnAuthorDeskTool = document.getElementById('btn-eclipse-tool-desk');
  const btnJournalTool = document.getElementById('btn-eclipse-tool-journal');
  const btnObsTool = document.getElementById('btn-eclipse-tool-obs');

  // Modals & Overlays
  const modalBackdrop = document.getElementById('eclipse-modal-backdrop');
  const modalTitle = document.getElementById('eclipse-modal-title');
  const modalBody = document.getElementById('eclipse-modal-body');
  const btnModalClose = document.getElementById('btn-eclipse-modal-close');
  const sleepOverlay = document.getElementById('eclipse-sleep-overlay');
  const discoveryFlash = document.getElementById('eclipse-discovery-flash');

  // Touch controls
  const dpadUp = document.getElementById('eclipse-dpad-up');
  const dpadDown = document.getElementById('eclipse-dpad-down');
  const dpadLeft = document.getElementById('eclipse-dpad-left');
  const dpadRight = document.getElementById('eclipse-dpad-right');
  const touchActionBtn = document.getElementById('eclipse-touch-action');

  let activeCharacter = 'lele';
  let currentState = null;
  let currentRoomConfig = ECLIPSE_ROOMS[1]; // Start at Grand Hall

  // Movement & Game Loop State
  const pressedKeys = new Set();
  const touchState = { up: false, down: false, left: false, right: false };
  let animFrameId = null;
  let isMoving = false;
  let facingLeft = false;
  let activeNearbyHotspot = null;

  function loadStateForActiveChar() {
    currentState = loadEclipseState(activeCharacter);
    if (!currentState) {
      toast('✦ The Eclipse Sanctuary dijaga oleh segel gerhana abadi.');
      return false;
    }
    const room = ECLIPSE_ROOMS.find(r => r.id === currentState.currentRoom) || ECLIPSE_ROOMS[1];
    currentRoomConfig = room;
    return true;
  }

  function saveCurrentState() {
    if (!currentState) return;
    saveEclipseState(activeCharacter, currentState);
  }

  // ---------------------------------------------------------------------------
  // 1. RENDER ROOM & ATMOSPHERE
  // ---------------------------------------------------------------------------
  function renderRoom(roomId, spawnAtDefault = false) {
    const room = ECLIPSE_ROOMS.find(r => r.id === roomId) || ECLIPSE_ROOMS[1];
    currentRoomConfig = room;
    if (currentState) currentState.currentRoom = room.id;

    // Update Titles
    if (titleRoomEl) titleRoomEl.textContent = room.name;
    if (titleSubtitleEl) titleSubtitleEl.textContent = room.subtitle;

    // Update Active Nav Pill
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.eclipse-room-btn').forEach(btn => {
        const target = btn.getAttribute('data-room-id');
        btn.classList.toggle('active', target === room.id);
      });
    }

    // Update Background Image
    if (roomBgImg) {
      roomBgImg.src = room.bgImage || `/assets/eclipse_${room.id}.jpg`;
    }

    // Set Spawn Coordinates
    if (spawnAtDefault || !currentState?.playerPos) {
      currentState.playerPos = { x: room.spawnX, y: room.spawnY };
    }
    updateAvatarDOM(currentState.playerPos.x, currentState.playerPos.y);

    // Render Hotspots
    renderHotspots(room);

    saveCurrentState();
  }

  function renderHotspots(room) {
    if (!hotspotsContainer) return;
    hotspotsContainer.innerHTML = '';

    room.hotspots.forEach(hs => {
      // Hide secret passage if already discovered or show book
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'eclipse-hotspot-item';
      btn.id = hs.id;
      btn.style.left = `${hs.x}%`;
      btn.style.top = `${hs.y}%`;
      btn.setAttribute('aria-label', hs.label);

      btn.innerHTML = `
        <div class="eclipse-hotspot-beacon">
          <span>${hs.icon}</span>
        </div>
        <span class="eclipse-hotspot-label">${hs.label}</span>
      `;

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerHotspotAction(hs);
      });

      hotspotsContainer.appendChild(btn);
    });
  }

  function updateAvatarDOM(x, y) {
    if (!playerAvatar) return;
    playerAvatar.style.left = `${x}%`;
    playerAvatar.style.top = `${y}%`;
    playerAvatar.classList.toggle('facing-left', facingLeft);
    playerAvatar.classList.toggle('is-walking', isMoving);
  }

  // ---------------------------------------------------------------------------
  // 2. COLLISION & PROXIMITY DETECTION
  // ---------------------------------------------------------------------------
  function checkCollision(targetX, targetY, room) {
    if (
      targetX < room.bounds.minX ||
      targetX > room.bounds.maxX ||
      targetY < room.bounds.minY ||
      targetY > room.bounds.maxY
    ) {
      return true; // Wall collision
    }

    for (const obs of room.obstacles) {
      if (
        targetX >= obs.minX &&
        targetX <= obs.maxX &&
        targetY >= obs.minY &&
        targetY <= obs.maxY
      ) {
        return true; // Furniture collision
      }
    }
    return false;
  }

  function checkProximityToHotspots(x, y, room) {
    let closest = null;
    let minDistance = 14;

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

  // ---------------------------------------------------------------------------
  // 3. REAL-TIME GAME MOVEMENT LOOP
  // ---------------------------------------------------------------------------
  function gameLoop() {
    if (!currentState || !currentRoomConfig) return;

    let dx = 0;
    let dy = 0;
    const speed = 0.48; // Movement speed per frame

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
      const norm = Math.SQRT1_2;
      dx *= norm;
      dy *= norm;
    }

    isMoving = (dx !== 0 || dy !== 0);

    if (isMoving) {
      const nextX = currentState.playerPos.x + dx;
      const nextY = currentState.playerPos.y + dy;

      if (!checkCollision(nextX, currentState.playerPos.y, currentRoomConfig)) {
        currentState.playerPos.x = nextX;
      }
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
    isMoving = false;
    if (playerAvatar) playerAvatar.classList.remove('is-walking');
  }

  // ---------------------------------------------------------------------------
  // 4. INTERACTIVE HOTSPOTS & MODAL CONTROLLERS
  // ---------------------------------------------------------------------------
  function triggerHotspotAction(hs) {
    if (!hs) return;

    if (onTriggerSparkle) {
      const el = document.getElementById(hs.id) || playerAvatar;
      const rect = el ? el.getBoundingClientRect() : null;
      const sx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
      const sy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
      onTriggerSparkle(sx, sy);
    }

    switch (hs.action) {
      // Room navigation
      case 'goto_garden':
        renderRoom('garden', true);
        toast('🌹 Melangkah ke The Eclipse Garden di bawah langit malam abadi');
        break;
      case 'goto_grand_hall':
        renderRoom('grand_hall', true);
        toast('🏰 Memasuki The Grand Hall istana celestial');
        break;
      case 'goto_library':
        renderRoom('library', true);
        toast("📚 Memasuki The Author's Library yang hening dan megah");
        break;
      case 'goto_bedroom':
        renderRoom('bedroom', true);
        toast('🛏️ Memasuki The Royal Bedroom bernuansa velvet midnight');
        break;
      case 'goto_observatory':
        renderRoom('observatory', true);
        toast('🔭 Menaiki tangga spiral menuju The Celestial Observatory');
        break;
      case 'goto_gallery':
        renderRoom('gallery', true);
        toast('🖼️ Memasuki The Memory Gallery arsip kenangan 8 sahabat');
        break;

      // Garden Interactions
      case 'moon_fountain':
        playCelestialBell(880);
        toast('⛲ Air mancur bulan kristal memancarkan cahaya perak sejuk yang menenangkan jiwa 🌙');
        break;
      case 'royal_gazebo':
        playerAvatar?.classList.add('is-sitting');
        toast('🏛️ Duduk di gazebo kerajaan perak, menikmati semilir angin malam berbintang ✨');
        playCelestialBell(659.25);
        setTimeout(() => playerAvatar?.classList.remove('is-sitting'), 3000);
        break;
      case 'reflection_pond':
        playCelestialBell(523.25);
        toast('✨ Menatap kolam refleksi: Bayangan bintang dan gerhana tampak begitu jernih 🌌');
        break;
      case 'black_roses':
        playEclipseChordSuccess();
        toast('🥀 Memetik setangkai mawar hitam berembun perak: Keindahan langka yang abadi ✦');
        break;

      // Grand Hall Interactions
      case 'grand_piano':
        openGrandPianoModal();
        break;
      case 'author_throne':
        playerAvatar?.classList.add('is-sitting');
        playEclipseChordSuccess();
        toast('👑 Duduk di Singgasana Celestial Author: Aura ketenangan agung melingkupi seluruh istana 🌙');
        setTimeout(() => playerAvatar?.classList.remove('is-sitting'), 3000);
        break;
      case 'stained_glass':
        toast('🌌 Jendela kaca patri gerhana: Membiaskan cahaya ungu amethyst ke lantai marmer obsidian ✦');
        break;

      // Library Interactions
      case 'author_desk':
        openAuthorDeskModal();
        break;
      case 'story_books':
        openStoryArchiveModal();
        break;
      case 'lib_fireplace':
        toast('🔥 Beristirahat di kursi beludru dekat perapian perak, tenggelam dalam alur cerita 📖');
        playCelestialBell(440);
        break;
      case 'secret_passage':
        unlockSecretChamber();
        break;

      // Bedroom Interactions
      case 'royal_sleep':
        triggerRoyalSleep();
        break;
      case 'royal_vanity':
        openRoyalVanityModal();
        break;
      case 'royal_wardrobe':
        openRoyalWardrobeModal();
        break;
      case 'bedroom_decor':
        openBedroomDecorModal();
        break;
      case 'bedroom_balcony':
        toast('🌙 Berdiri di balkon pribadi kamar tidur, memandang rasi bintang dan galaksi luas ✨');
        playCelestialBell(784);
        break;

      // Observatory Interactions
      case 'use_telescope':
        openTelescopeModal();
        break;
      case 'starmap':
        openStarmapModal();
        break;
      case 'star_globe':
        playCelestialBell(1046.5);
        toast('🌐 Memutar globe langit kristal: Menampilkan orbit 8 alam semesta Our Little Universe ✦');
        break;

      // Gallery Interactions
      case 'view_frames':
        openGalleryFramesModal();
        break;
      case 'view_letters':
        openLettersArchiveModal();
        break;
      case 'custom_frame':
        openCustomFrameModal();
        break;

      // Secret Chamber Interactions
      case 'cosmology_map':
        openCosmologyMapModal();
        break;
      case 'creation_manuscript':
        openCreationManuscriptModal();
        break;
      case 'eclipse_relic':
        playEclipseChordSuccess();
        toast('💎 Menyentuh Eclipse Crystal: Jalinan energi penciptaan semesta berdenyut hangat ✦');
        break;

      default:
        toast(`✦ Berinteraksi dengan ${hs.label}`);
    }
  }

  function toast(msg) {
    if (onShowToast) onShowToast(msg);
  }

  // --- MODAL: GRAND PIANO ---
  function openGrandPianoModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '🎹 Obsidian Grand Piano — Eclipse Melody';

    const notes = [
      { key: 'A3', freq: 220.00, label: 'La₃' },
      { key: 'B3', freq: 246.94, label: 'Si₃' },
      { key: 'C4', freq: 261.63, label: 'Do' },
      { key: 'D4', freq: 293.66, label: 'Re' },
      { key: 'E4', freq: 329.63, label: 'Mi' },
      { key: 'F4', freq: 349.23, label: 'Fa' },
      { key: 'G4', freq: 392.00, label: 'Sol' },
      { key: 'A4', freq: 440.00, label: 'La' },
      { key: 'B4', freq: 493.88, label: 'Si' },
      { key: 'C5', freq: 523.25, label: 'Do²' }
    ];

    let keysHtml = '<div class="eclipse-piano-keyboard">';
    notes.forEach(n => {
      keysHtml += `
        <button type="button" class="eclipse-piano-key" data-freq="${n.freq}">
          <span>${n.label}</span>
          <small>${n.key}</small>
        </button>
      `;
    });
    keysHtml += '</div>';

    modalBody.innerHTML = `
      <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0;">Mainkan tuts piano grand obsidian bernada minor klasik yang memancarkan gema hening:</p>
      ${keysHtml}
      <div style="margin-top: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 0.78rem; color: var(--eclipse-amethyst-light);">✨ Alunan musik bergema di seluruh istana</span>
        <button type="button" class="eclipse-btn-primary" id="btn-play-eclipse-nocturne">♫ Mainkan Eclipse Nocturne</button>
      </div>
    `;

    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.eclipse-piano-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const freq = parseFloat(btn.getAttribute('data-freq'));
        playGothicPianoNote(freq);
        btn.classList.add('playing');
        setTimeout(() => btn.classList.remove('playing'), 180);
        if (currentState) {
          currentState.stats.pianoNotesPlayed = (currentState.stats.pianoNotesPlayed || 0) + 1;
          saveCurrentState();
        }
      });
    });

    const btnNocturne = modalBody.querySelector('#btn-play-eclipse-nocturne');
    if (btnNocturne) {
      btnNocturne.addEventListener('click', () => {
        const nocturneMelody = [220, 261.63, 329.63, 440, 392, 349.23, 329.63, 261.63, 220];
        nocturneMelody.forEach((freq, idx) => {
          setTimeout(() => {
            playGothicPianoNote(freq);
          }, idx * 240);
        });
        toast('♫ Memainkan "Eclipse Nocturne" — Simfoni malam abadi bergema anggun 🌙');
      });
    }
  }

  // --- MODAL: THE AUTHOR'S DESK (CENTRAL CONSOLE) ---
  function openAuthorDeskModal(initialTab = 'drafts') {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = "🖋️ THE AUTHOR'S DESK — Pusat Kendali Sang Penulis Semesta";

    function renderDeskContent(tab) {
      let content = '';

      if (tab === 'drafts') {
        content = '<div class="eclipse-card-grid">';
        AUTHOR_STORY_DRAFTS.forEach(d => {
          content += `
            <div class="eclipse-item-card">
              <div class="eclipse-item-card-header">
                <span class="eclipse-item-card-icon">📜</span>
                <div>
                  <h4 class="eclipse-item-card-title">${d.title}</h4>
                  <span style="font-size: 0.7rem; color: var(--eclipse-amethyst-light); font-weight: 700;">${d.genre} · ${d.status}</span>
                </div>
              </div>
              <p class="eclipse-item-card-desc">"${d.excerpt}"</p>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <span style="font-size: 0.68rem; color: #64748b;">${d.wordCount} · ${d.lastModified}</span>
                <button type="button" class="eclipse-btn-primary btn-read-draft" data-title="${d.title}">Buka Naskah</button>
              </div>
            </div>
          `;
        });
        content += '</div>';
        content += `
          <div style="margin-top: 1.2rem; text-align: center;">
            <button type="button" class="eclipse-btn-primary" id="btn-write-new-draft">✍️ Tulis Catatan / Ide Cerita Baru</button>
          </div>
        `;
      } else if (tab === 'journal') {
        const jList = currentState?.authorJournal || [];
        content = '<div style="display: flex; flex-direction: column; gap: 12px;">';
        jList.forEach(j => {
          content += `
            <div class="eclipse-item-card">
              <div style="display: flex; justify-content: space-between; align-items: baseline;">
                <h4 class="eclipse-item-card-title">${j.title}</h4>
                <span style="font-size: 0.7rem; color: var(--eclipse-amethyst-light);">${j.date}</span>
              </div>
              <p class="eclipse-item-card-desc" style="margin-top: 6px; font-style: italic;">"${j.content}"</p>
            </div>
          `;
        });
        content += '</div>';
      } else if (tab === 'lore') {
        content = '<div class="eclipse-card-grid">';
        OLU_UNIVERSE_LORE.forEach(u => {
          content += `
            <div class="eclipse-item-card">
              <div class="eclipse-item-card-header">
                <span class="eclipse-item-card-icon">🪐</span>
                <div>
                  <h4 class="eclipse-item-card-title">${u.name}</h4>
                  <span style="font-size: 0.7rem; color: #38bdf8;">${u.realm}</span>
                </div>
              </div>
              <p class="eclipse-item-card-desc">${u.desc}</p>
              <span style="font-size: 0.68rem; color: var(--eclipse-amethyst-light); margin-top: 4px;">Elemen: ${u.element}</span>
            </div>
          `;
        });
        content += '</div>';
      } else if (tab === 'board') {
        const bList = currentState?.inspirationBoard || [];
        content = '<div class="eclipse-card-grid">';
        bList.forEach(b => {
          content += `
            <div class="eclipse-item-card" style="border-left: 3px solid var(--eclipse-amethyst);">
              <h4 class="eclipse-item-card-title">${b.title}</h4>
              <p class="eclipse-item-card-desc">${b.note}</p>
            </div>
          `;
        });
        content += '</div>';
      }

      return content;
    }

    modalBody.innerHTML = `
      <div class="eclipse-author-desk-tabs">
        <button type="button" class="eclipse-desk-tab-btn ${initialTab === 'drafts' ? 'active' : ''}" data-tab="drafts">📚 Naskah & Karya</button>
        <button type="button" class="eclipse-desk-tab-btn ${initialTab === 'journal' ? 'active' : ''}" data-tab="journal">📜 Jurnal Pribadi</button>
        <button type="button" class="eclipse-desk-tab-btn ${initialTab === 'lore' ? 'active' : ''}" data-tab="lore">🌌 Kosmologi & Peta OLU</button>
        <button type="button" class="eclipse-desk-tab-btn ${initialTab === 'board' ? 'active' : ''}" data-tab="board">💡 Papan Inspirasi</button>
      </div>
      <div id="eclipse-desk-tab-content">
        ${renderDeskContent(initialTab)}
      </div>
    `;

    modalBackdrop.classList.add('active');

    // Tab switcher
    modalBody.querySelectorAll('.eclipse-desk-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modalBody.querySelectorAll('.eclipse-desk-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        const container = modalBody.querySelector('#eclipse-desk-tab-content');
        if (container) {
          container.innerHTML = renderDeskContent(targetTab);
          wireDeskActions();
        }
      });
    });

    wireDeskActions();

    function wireDeskActions() {
      modalBody.querySelectorAll('.btn-read-draft').forEach(b => {
        b.addEventListener('click', () => {
          const t = b.getAttribute('data-title');
          playCelestialBell(880);
          toast(`📖 Membaca "${t}" — Naskah karya author dibuka dengan penuh ketelitian ✨`);
          closeModal();
        });
      });

      const btnNew = modalBody.querySelector('#btn-write-new-draft');
      if (btnNew) {
        btnNew.addEventListener('click', () => {
          playCelestialBell(659.25);
          toast('✍️ Ide cerita baru berhasil dicatat ke dalam The Author\'s Desk! 🌙');
          closeModal();
        });
      }
    }
  }

  // --- MODAL: TELESCOPE & STARGAZING ---
  function openTelescopeModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '🔭 The Celestial Telescope — Teropong Gerhana Abadi';

    let obsHtml = '<div class="eclipse-card-grid">';
    CELESTIAL_OBSERVATIONS.forEach(c => {
      obsHtml += `
        <div class="eclipse-item-card">
          <div class="eclipse-item-card-header">
            <span class="eclipse-item-card-icon">${c.icon}</span>
            <div>
              <h4 class="eclipse-item-card-title">${c.name}</h4>
              <span style="font-size: 0.7rem; color: #38bdf8;">Status: ${c.status}</span>
            </div>
          </div>
          <p class="eclipse-item-card-desc">${c.desc}</p>
        </div>
      `;
    });
    obsHtml += '</div>';

    modalBody.innerHTML = `
      <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0;">Mengamati panorama gerhana abadi dan konstelasi pelindung Our Little Universe:</p>
      ${obsHtml}
      <div style="margin-top: 1rem; text-align: center;">
        <button type="button" class="eclipse-btn-primary" id="btn-discover-starlight">✨ Rekam Posisi Bintang Baru</button>
      </div>
    `;

    modalBackdrop.classList.add('active');

    const btnStar = modalBody.querySelector('#btn-discover-starlight');
    if (btnStar) {
      btnStar.addEventListener('click', () => {
        playEclipseChordSuccess();
        toast('🔭 Konstelasi baru berhasil dipetakan ke peta langit observatorium! ✦');
        if (currentState) {
          currentState.stats.starsObserved = (currentState.stats.starsObserved || 0) + 1;
          saveCurrentState();
        }
        closeModal();
      });
    }
  }

  // --- MODAL: ROYAL WARDROBE ---
  function openRoyalWardrobeModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '👑 Lemari Busana & Jubah Kerajaan Author';

    let cards = '<div class="eclipse-card-grid">';
    ROYAL_WARDROBE_COLLECTION.forEach(w => {
      const isEquipped = currentState?.activeWardrobe === w.name;
      cards += `
        <div class="eclipse-item-card" style="${isEquipped ? 'border-color: var(--eclipse-gold);' : ''}">
          <div class="eclipse-item-card-header">
            <span class="eclipse-item-card-icon">${w.icon}</span>
            <div>
              <h4 class="eclipse-item-card-title">${w.name}</h4>
              <p class="eclipse-item-card-desc">${w.desc}</p>
            </div>
          </div>
          <button type="button" class="eclipse-btn-primary btn-equip-royal" data-name="${w.name}">
            ${isEquipped ? '✓ Sedang Dikenakan' : 'Kenakan Busana'}
          </button>
        </div>
      `;
    });
    cards += '</div>';

    modalBody.innerHTML = `
      <p style="color: #94a3b8; font-size: 0.85rem; margin-top: 0;">Pilih jubah kerajaan dan busana eksklusif author sang pencipta semesta:</p>
      ${cards}
    `;

    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-equip-royal').forEach(btn => {
      btn.addEventListener('click', () => {
        const name = btn.getAttribute('data-name');
        playEclipseChordSuccess();
        toast(`👑 Mengenakan ${name}: Keanggunan megah terpancar sempurna! ✨`);
        if (currentState) {
          currentState.activeWardrobe = name;
          saveCurrentState();
        }
        closeModal();
      });
    });
  }

  // --- MODAL: ROYAL VANITY ---
  function openRoyalVanityModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '🪞 Meja Rias Kristal Bulan — Vanity of the Moon';
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 1.2rem; background: rgba(37, 18, 71, 0.4); border-radius: 16px; border: 1px solid var(--eclipse-amethyst);">
        <span style="font-size: 2.4rem;">🌙 🪞 👑</span>
        <h4 style="margin: 8px 0; color: #fff;">Cermin Oval Obsidian & Perak</h4>
        <p style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.5;">"Di cermin ini, Lele melihat bukan hanya dirinya, tetapi juga semesta kecil yang telah ia jaga dengan penuh cinta dan dedikasi."</p>
        <button type="button" class="eclipse-btn-primary" id="btn-wear-moon-tiara" style="margin-top: 8px;">👑 Kenakan Mahkota Bulan Sabit</button>
      </div>
    `;
    modalBackdrop.classList.add('active');

    const btnTiara = modalBody.querySelector('#btn-wear-moon-tiara');
    if (btnTiara) {
      btnTiara.addEventListener('click', () => {
        playCelestialBell(880);
        toast('👑 Mahkota Bulan Sabit tersemat indah di rambut Lele: Cahaya perak bersinar lembut 🌙');
        closeModal();
      });
    }
  }

  // --- MODAL: BEDROOM DECOR ---
  function openBedroomDecorModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '🎨 Kustomisasi Bilik Peristirahatan Kerajaan';
    modalBody.innerHTML = `
      <div class="eclipse-card-grid">
        <div class="eclipse-item-card">
          <h4 class="eclipse-item-card-title">🌑 Midnight Velvet (Default)</h4>
          <p class="eclipse-item-card-desc">Nuansa tirai beludru hitam pekat dan bantal bordir perak.</p>
          <button type="button" class="eclipse-btn-primary btn-apply-bdecor" data-d="Midnight Velvet">Terapkan</button>
        </div>
        <div class="eclipse-item-card">
          <h4 class="eclipse-item-card-title">💜 Royal Amethyst Chamber</h4>
          <p class="eclipse-item-card-desc">Pancaran kristal ungu dan seprai sutra wisteria menenangkan.</p>
          <button type="button" class="eclipse-btn-primary btn-apply-bdecor" data-d="Royal Amethyst">Terapkan</button>
        </div>
      </div>
    `;
    modalBackdrop.classList.add('active');

    modalBody.querySelectorAll('.btn-apply-bdecor').forEach(b => {
      b.addEventListener('click', () => {
        playCelestialBell(659.25);
        toast(`🎨 Dekorasi kamar diperbarui: ${b.getAttribute('data-d')}! ✨`);
        closeModal();
      });
    });
  }

  // --- SLEEP CYCLE OVERLAY ---
  function triggerRoyalSleep() {
    if (!sleepOverlay) return;
    sleepOverlay.classList.add('active');
    toast('🛏️ Merebahkan diri di ranjang kanopi velvet midnight... Istirahat dalam hening abadi 🌙');

    setTimeout(() => {
      playEclipseChordSuccess();
      sleepOverlay.classList.remove('active');
      toast('🌙 Terbangun dengan jiwa yang segar, pikiran jernih, dan inspirasi baru mengalir ✦');
    }, 2800);
  }

  // --- UNLOCK SECRET AUTHOR CHAMBER ---
  function unlockSecretChamber() {
    if (currentState) {
      currentState.secretChamberUnlocked = true;
      saveCurrentState();
    }

    if (discoveryFlash) {
      discoveryFlash.classList.add('active');
      playEclipseChordSuccess();
      setTimeout(() => {
        discoveryFlash.classList.remove('active');
        renderRoom('secret_chamber', true);
        toast('🔮 RAHASIA TERBUKA! Dinding rak buku bergeser, memperlihatkan The Secret Author Chamber! ✦');
      }, 900);
    } else {
      renderRoom('secret_chamber', true);
      toast('🔮 Melangkah masuk ke The Secret Author Chamber!');
    }
  }

  // --- MODAL: COSMOLOGY MAP ---
  function openCosmologyMapModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '🌌 Peta Kosmologi Semesta Our Little Universe';
    modalBody.innerHTML = `
      <div style="background: rgba(13, 13, 38, 0.9); border: 1.5px solid var(--eclipse-amethyst); border-radius: 16px; padding: 1.2rem;">
        <h4 style="margin-top: 0; color: #fff; text-align: center;">KOSMOLOGI UTAMA OLU — 8 DUNIA & 1 SANCTUARY</h4>
        <p style="font-size: 0.78rem; color: #cbd5e1; line-height: 1.5; text-align: center;">
          "Di pusat pusaran galaksi berdiri The Eclipse Sanctuary, memancarkan poros keseimbangan bagi delapan alam sahabat."
        </p>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-top: 10px;">
          <div class="eclipse-item-card">⭐ KIDULT — Nyanya</div>
          <div class="eclipse-item-card">☀️ TO YOU — Lala</div>
          <div class="eclipse-item-card">🌙 SHADOW — Lele</div>
          <div class="eclipse-item-card">☁️ PINWHEEL — Syma / Abil</div>
          <div class="eclipse-item-card">🌊 YAWN — Akhira</div>
          <div class="eclipse-item-card">🪷 US AGAIN — Ela</div>
          <div class="eclipse-item-card">🐉 ASH — Ruben</div>
          <div class="eclipse-item-card">🎆 HOT — Royan</div>
        </div>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }

  function openCreationManuscriptModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '📜 Naskah Rahasia Penciptaan Dunia OLU';
    modalBody.innerHTML = `
      <div style="background: #fffbeb; color: #1c1917; border-radius: 16px; padding: 1.5rem; font-family: var(--eclipse-font-serif);">
        <h3 style="margin-top: 0; color: #581c87; text-align: center;">Prasasti Asal Mula Persahabatan</h3>
        <p style="font-size: 0.85rem; line-height: 1.6;">
          "Kita menciptakan dunia ini bukan untuk melarikan diri dari kenyataan, melainkan untuk membangun tempat di mana setiap jiwa sahabat dapat merasa aman, dicintai, dan tak pernah sendirian. Selama bintang-bintang di langit tetap bersinar, ikatan ini akan kekal abadi."
        </p>
        <p style="text-align: right; font-size: 0.8rem; font-weight: 700; margin-bottom: 0;">— Lele 🌙 (The Author)</p>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }

  function openGalleryFramesModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '🖼️ Koleksi Bingkai Kenangan OLU';
    const frames = currentState?.customFrames || [];
    let listHtml = '<div class="eclipse-card-grid">';
    frames.forEach(f => {
      listHtml += `
        <div class="eclipse-item-card">
          <div class="eclipse-item-card-header">
            <span class="eclipse-item-card-icon">🖼️</span>
            <div>
              <h4 class="eclipse-item-card-title">${f.title}</h4>
              <p class="eclipse-item-card-desc">${f.char} · ${f.year}</p>
            </div>
          </div>
        </div>
      `;
    });
    listHtml += '</div>';

    modalBody.innerHTML = listHtml;
    modalBackdrop.classList.add('active');
  }

  function openLettersArchiveModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '💌 Kotak Surat Kerajaan Sahabat';
    modalBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="eclipse-item-card">
          <h4 class="eclipse-item-card-title">Dari Nyanya ⭐: "Untuk Sahabat Penjagaku"</h4>
          <p class="eclipse-item-card-desc">"Terima kasih telah menciptakan tempat yang begitu hangat bagi mimpi-mimpiku, Lele. Gazebo malam selalu menantimu."</p>
        </div>
        <div class="eclipse-item-card">
          <h4 class="eclipse-item-card-title">Dari Lala ☀️: "Secangkir Teh & Bunga Mawar"</h4>
          <p class="eclipse-item-card-desc">"Jangan lupa istirahat di tengah kesibukanmu menulis dunia, Lele! Aku selalu menyisihkan cupcake stroberi termanis untukmu."</p>
        </div>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }

  function openCustomFrameModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '✨ Kustomisasi Bingkai Kenangan Baru';
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 1.2rem;">
        <span style="font-size: 2.2rem;">🖼️ 📷 ✨</span>
        <p style="color: #cbd5e1; font-size: 0.85rem;">Pilih momen persahabatan untuk diabadikan ke dinding galeri kerajaan:</p>
        <button type="button" class="eclipse-btn-primary" id="btn-add-gal-moment" style="margin-top: 8px;">Pajang Momen Baru ✦</button>
      </div>
    `;
    modalBackdrop.classList.add('active');

    const btnAdd = modalBody.querySelector('#btn-add-gal-moment');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        playCelestialBell(880);
        toast('🖼️ Bingkai kenangan baru berhasil dipasang di dinding galeri! ✨');
        closeModal();
      });
    }
  }

  function openStarmapModal() {
    if (!modalBackdrop || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = '🗺️ Peta Konstelasi Semesta OLU';
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 1.2rem; background: rgba(13, 13, 38, 0.9); border-radius: 16px; border: 1px solid var(--eclipse-amethyst);">
        <span style="font-size: 2.5rem;">🌌 🗺️ 🔭</span>
        <h4 style="color: #fff; margin: 8px 0;">Konstelasi Perlindungan Delapan Semesta</h4>
        <p style="font-size: 0.82rem; color: #cbd5e1;">"Garis-garis bintang membentuk pelindung melingkar di sekeliling The Eclipse, menghubungkan seluruh dunia dalam harmoni abadi."</p>
      </div>
    `;
    modalBackdrop.classList.add('active');
  }

  function openStoryArchiveModal() {
    openAuthorDeskModal('drafts');
  }

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  // ---------------------------------------------------------------------------
  // 5. EVENT LISTENERS SETUP
  // ---------------------------------------------------------------------------
  function setupEventListeners() {
    // Return button
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        closeEclipseSanctuary();
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

    // Top-right Room navigation tabs
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.eclipse-room-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.getAttribute('data-room-id');
          if (target && target !== currentRoomConfig.id) {
            renderRoom(target, true);
          }
        });
      });
    }

    // Top-right Quick tool buttons
    if (btnAuthorDeskTool) {
      btnAuthorDeskTool.addEventListener('click', () => openAuthorDeskModal('drafts'));
    }
    if (btnJournalTool) {
      btnJournalTool.addEventListener('click', () => openAuthorDeskModal('journal'));
    }
    if (btnObsTool) {
      btnObsTool.addEventListener('click', openTelescopeModal);
    }

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (!eclipseView || !eclipseView.classList.contains('active')) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight'].includes(e.code)) {
        pressedKeys.add(e.code);
      }
      if (e.code === 'KeyE' || e.code === 'Space') {
        if (activeNearbyHotspot) {
          e.preventDefault();
          triggerHotspotAction(activeNearbyHotspot);
        }
      }
      if (e.code === 'Escape') {
        closeModal();
      }
    });

    window.addEventListener('keyup', (e) => {
      pressedKeys.delete(e.code);
    });

    // Mobile Virtual Touch D-Pad
    if (dpadUp) {
      dpadUp.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.up = true; });
      dpadUp.addEventListener('touchend', (e) => { e.preventDefault(); touchState.up = false; });
    }
    if (dpadDown) {
      dpadDown.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.down = true; });
      dpadDown.addEventListener('touchend', (e) => { e.preventDefault(); touchState.down = false; });
    }
    if (dpadLeft) {
      dpadLeft.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.left = true; });
      dpadLeft.addEventListener('touchend', (e) => { e.preventDefault(); touchState.left = false; });
    }
    if (dpadRight) {
      dpadRight.addEventListener('touchstart', (e) => { e.preventDefault(); touchState.right = true; });
      dpadRight.addEventListener('touchend', (e) => { e.preventDefault(); touchState.right = false; });
    }
    if (touchActionBtn) {
      touchActionBtn.addEventListener('click', () => {
        if (activeNearbyHotspot) triggerHotspotAction(activeNearbyHotspot);
      });
    }
  }

  // ---------------------------------------------------------------------------
  // 6. PUBLIC API
  // ---------------------------------------------------------------------------
  function openEclipseSanctuary(authCharKey, roomId = 'grand_hall') {
    if (!isAuthorAuthorized(authCharKey)) {
      toast('✦ Akses ditolak: The Eclipse Sanctuary hanya dapat dibuka oleh Lele 🌙 (The Author).');
      return false;
    }

    activeCharacter = 'lele';
    const loaded = loadStateForActiveChar();
    if (!loaded) return false;

    if (eclipseView) {
      eclipseView.classList.add('active');
      eclipseView.setAttribute('aria-hidden', 'false');
    }

    renderRoom(roomId, true);
    startMovementLoop();

    toast('👑 Memasuki THE ECLIPSE — The Author\'s Eternal Sanctuary 🌙');
    return true;
  }

  function closeEclipseSanctuary() {
    stopMovementLoop();
    closeModal();
    if (eclipseView) {
      eclipseView.classList.remove('active');
      eclipseView.setAttribute('aria-hidden', 'true');
    }
  }

  setupEventListeners();

  return {
    openEclipseSanctuary,
    closeEclipseSanctuary,
    renderRoom,
    triggerHotspotAction,
    unlockSecretChamber,
    openAuthorDeskModal,
    openGrandPianoModal,
    openTelescopeModal,
    getCurrentRoom: () => currentRoomConfig?.id
  };
}
