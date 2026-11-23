/**
 * THE EVERDREAM HOUSE — NYANYA ⭐ (UNIVERSE KIDULT)
 * View Controller for Storybook Victorian Cottage
 * Tagline: "Where Childhood Dreams Never Fade."
 * =============================================================================
 */

import {
  EVERDREAM_CHARACTER,
  EVERDREAM_ROOMS,
  EVERDREAM_ATMOSPHERES,
  EVERDREAM_MEMORY_CHEST,
  EVERDREAM_BOOKSHELF,
  EVERDREAM_RECIPES,
  EVERDREAM_NYANYA_DIALOGS,
  loadEverdreamState,
  saveEverdreamState,
  playEverdreamChime,
  playEverdreamLullaby,
  playFireplaceCrackleSound
} from './everdream_house_state.js';

export function initEverdreamHouseView(options = {}) {
  const {
    onShowToast,
    onTriggerSparkle,
    onNavigateBack,
    onNavigateGreenhouse,
    onNavigateGazebo,
    onNavigateRiver,
    onNavigatePicnic
  } = options;

  const houseView = document.getElementById('view-everdream-house');
  if (!houseView) {
    console.warn('[EverdreamHouseView] #view-everdream-house element not found.');
    return null;
  }

  // Load persistent state
  const state = loadEverdreamState();
  let currentRoom = state.activeRoom || 'exterior';
  let currentAtmo = state.atmosphere || 'twilight';
  let isFireplaceLit = state.isFireplaceLit;
  let isStarLampOn = state.isStarLampOn;
  let unlockedMemories = new Set(state.unlockedMemories || ['mem_first_star']);
  let isMusicPlaying = false;
  let musicInterval = null;

  // DOM Elements
  const btnBack = document.getElementById('btn-everdream-back');
  const btnAudioToggle = document.getElementById('btn-ed-audio-toggle');
  const atmoButtons = houseView.querySelectorAll('.btn-ed-atmo');
  const roomNavButtons = houseView.querySelectorAll('.btn-ed-room-nav');
  const roomContainers = houseView.querySelectorAll('.everdream-room-container');
  const speechText = document.getElementById('nyanya-speech-text');

  // Modals
  const memoryModal = document.getElementById('everdream-memory-modal');
  const bookshelfModal = document.getElementById('everdream-bookshelf-modal');
  const journalModal = document.getElementById('everdream-journal-modal');
  const kitchenModal = document.getElementById('everdream-kitchen-modal');
  const sleepOverlay = document.getElementById('everdream-sleep-overlay');
  const btnSleepWakeup = document.getElementById('btn-sleep-wakeup');

  function showToast(msg) {
    if (typeof onShowToast === 'function') {
      onShowToast(msg);
    } else {
      const toast = document.getElementById('universe-toast');
      const text = document.getElementById('toast-text');
      if (toast && text) {
        text.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3200);
      }
    }
  }

  function triggerSparkle(e) {
    if (typeof onTriggerSparkle === 'function') {
      const x = e?.clientX || window.innerWidth / 2;
      const y = e?.clientY || window.innerHeight / 2;
      onTriggerSparkle(x, y);
    }
  }

  function closeAllModals() {
    [memoryModal, bookshelfModal, journalModal, kitchenModal, sleepOverlay].forEach(modal => {
      if (modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Apply Atmosphere
  function setAtmosphere(atmoId, silent = false) {
    currentAtmo = atmoId;
    EVERDREAM_ATMOSPHERES.forEach(a => {
      houseView.classList.remove(`atmo-${a.id}`);
    });
    houseView.classList.add(`atmo-${atmoId}`);

    atmoButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-atmo') === atmoId);
    });

    saveEverdreamState({ atmosphere: atmoId });

    if (!silent) {
      const atmoObj = EVERDREAM_ATMOSPHERES.find(a => a.id === atmoId);
      showToast(`✨ Suasana berganti: ${atmoObj ? atmoObj.name : atmoId}`);
      playEverdreamChime(587.33, 0.6);
    }
  }

  // Update Nyanya Speech Bubble
  function updateNyanyaSpeech(roomId = currentRoom) {
    if (!speechText) return;
    const dialogs = EVERDREAM_NYANYA_DIALOGS[roomId] || EVERDREAM_NYANYA_DIALOGS.exterior;
    const randomLine = dialogs[Math.floor(Math.random() * dialogs.length)];
    speechText.textContent = randomLine;
  }

  // Switch Active Room
  function switchRoom(roomId, silent = false) {
    currentRoom = roomId;

    roomContainers.forEach(container => {
      const isTarget = container.getAttribute('data-room') === roomId;
      container.classList.toggle('active', isTarget);
      container.setAttribute('aria-hidden', !isTarget);
    });

    roomNavButtons.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-room') === roomId);
    });

    updateNyanyaSpeech(roomId);
    saveEverdreamState({ activeRoom: roomId });

    if (!silent) {
      const roomObj = EVERDREAM_ROOMS.find(r => r.id === roomId);
      showToast(`${roomObj?.icon || '✦'} Menuju ${roomObj?.title || roomId}`);
      playEverdreamChime(659.25, 0.5);
    }
  }

  // Open & Close House Views
  function openEverdreamHouse(targetRoom = 'exterior') {
    closeAllModals();

    const viewKidult = document.getElementById('view-kidult-world');
    if (viewKidult) {
      viewKidult.classList.remove('active');
      viewKidult.setAttribute('aria-hidden', 'true');
    }

    houseView.classList.add('active');
    houseView.setAttribute('aria-hidden', 'false');

    setAtmosphere(currentAtmo, true);
    switchRoom(targetRoom, true);
    updateFireplaceUI();
    updateStarLampUI();

    playEverdreamChime(523.25, 0.9);
    showToast('🏡 Memasuki The Everdream House — Where Childhood Dreams Never Fade ⭐');
  }

  function closeEverdreamHouse() {
    closeAllModals();
    if (musicInterval) {
      clearInterval(musicInterval);
      musicInterval = null;
      isMusicPlaying = false;
    }

    houseView.classList.remove('active');
    houseView.setAttribute('aria-hidden', 'true');

    if (typeof onNavigateBack === 'function') {
      onNavigateBack();
    } else {
      const viewKidult = document.getElementById('view-kidult-world');
      if (viewKidult) {
        viewKidult.classList.add('active');
        viewKidult.setAttribute('aria-hidden', 'false');
      }
    }

    showToast('★ Kembali ke Dunia 2D KIDULT');
  }

  // Fireplace Interaction
  function updateFireplaceUI() {
    const fireplaceBox = document.getElementById('living-fireplace-visual');
    const fireplaceBtn = document.getElementById('btn-fireplace-toggle');
    if (fireplaceBox) {
      fireplaceBox.classList.toggle('fireplace-off', !isFireplaceLit);
    }
    if (fireplaceBtn) {
      fireplaceBtn.textContent = isFireplaceLit ? '🔥 Hangatkan Jemari' : '🪵 Nyalakan Perapian';
    }
  }

  function toggleFireplace(e) {
    triggerSparkle(e);
    if (!isFireplaceLit) {
      isFireplaceLit = true;
      saveEverdreamState({ isFireplaceLit: true });
      updateFireplaceUI();
      playFireplaceCrackleSound();
      showToast('🔥 Api perapian batu menyala hangat berderak lembut.');
    } else {
      playFireplaceCrackleSound();
      showToast('☕ Menghangatkan kedua jemari di depan perapian batu yang nyaman.');
    }
  }

  // Star Lamp Interaction
  function updateStarLampUI() {
    const lampVisual = document.getElementById('bedroom-starlamp-visual');
    const lampBtn = document.getElementById('btn-starlamp-toggle');
    if (lampVisual) {
      lampVisual.classList.toggle('starlamp-glow-active', isStarLampOn);
    }
    if (lampBtn) {
      lampBtn.textContent = isStarLampOn ? '✨ Redupkan Lampu Bintang' : '⭐ Nyalakan Cahaya Bintang';
    }
  }

  function toggleStarLamp(e) {
    triggerSparkle(e);
    isStarLampOn = !isStarLampOn;
    saveEverdreamState({ isStarLampOn });
    updateStarLampUI();
    playEverdreamChime(isStarLampOn ? 783.99 : 440, 0.5);
    showToast(isStarLampOn ? '⭐ Lampu bintang emas menyala berkilau menerangi kamar tidur.' : '🌙 Lampu bintang diredupkan untuk suasana tidur yang damai.');
  }

  // Bed Sleep & Lullaby Interaction
  function restOnBed(e) {
    triggerSparkle(e);
    if (sleepOverlay) {
      sleepOverlay.classList.add('open');
      sleepOverlay.setAttribute('aria-hidden', 'false');
    }
    playEverdreamLullaby();
    showToast('🛏️ Merebahkan diri di atas ranjang kanopi awan... Selamat bermimpi indah ♡');
  }

  function wakeUp(e) {
    triggerSparkle(e);
    if (sleepOverlay) {
      sleepOverlay.classList.remove('open');
      sleepOverlay.setAttribute('aria-hidden', 'true');
    }
    playEverdreamChime(659.25, 0.6);
    showToast('☀️ Bangun dengan hati yang segar dan penuh kehangatan!');
  }

  // Peti Kenangan (Memory Chest Modal)
  function openMemoryChest(e) {
    triggerSparkle(e);
    if (!memoryModal) return;

    const listContainer = document.getElementById('memory-chest-list');
    if (listContainer) {
      listContainer.innerHTML = EVERDREAM_MEMORY_CHEST.map(mem => `
        <div class="memory-chest-item" data-mem-id="${mem.id}">
          <div class="memory-chest-item-header">
            <span class="memory-chest-title">${mem.icon} ${mem.title}</span>
            <span class="memory-chest-date">${mem.date}</span>
          </div>
          <p class="memory-chest-excerpt">${mem.excerpt}</p>
          <div class="memory-chest-gift">🎁 <strong>Benda Kenangan:</strong> ${mem.gift}</div>
        </div>
      `).join('');
    }

    memoryModal.classList.add('open');
    memoryModal.setAttribute('aria-hidden', 'false');
    playEverdreamChime(783.99, 0.9);
    showToast('🗝️ Membuka Peti Kenangan Rahasia di Loteng Nyanya...');
  }

  // Bookshelf Modal
  function openBookshelf(e) {
    triggerSparkle(e);
    if (!bookshelfModal) return;

    const bookList = document.getElementById('bookshelf-list');
    if (bookList) {
      bookList.innerHTML = EVERDREAM_BOOKSHELF.map(b => `
        <div class="memory-chest-item">
          <div class="memory-chest-item-header">
            <span class="memory-chest-title">${b.icon} ${b.title}</span>
            <span class="memory-chest-date">${b.genre}</span>
          </div>
          <p class="memory-chest-excerpt">${b.snippet}</p>
          <div class="memory-chest-gift">✍️ <em>${b.author}</em></div>
        </div>
      `).join('');
    }

    bookshelfModal.classList.add('open');
    bookshelfModal.setAttribute('aria-hidden', 'false');
    playEverdreamChime(587.33, 0.6);
  }

  // Journal Desk Modal
  function openJournalDesk(e) {
    triggerSparkle(e);
    if (!journalModal) return;

    journalModal.classList.add('open');
    journalModal.setAttribute('aria-hidden', 'false');
    playEverdreamChime(659.25, 0.6);
  }

  // Kitchen Modal (Baking & Tea)
  function openKitchen(e) {
    triggerSparkle(e);
    if (!kitchenModal) return;

    const recipeList = document.getElementById('kitchen-recipe-list');
    if (recipeList) {
      recipeList.innerHTML = EVERDREAM_RECIPES.map(r => `
        <div class="memory-chest-item">
          <div class="memory-chest-item-header">
            <span class="memory-chest-title">${r.icon} ${r.name}</span>
            <span class="memory-chest-date">⏱️ ${r.prepTime}</span>
          </div>
          <p class="memory-chest-excerpt">${r.desc}</p>
          <div class="memory-chest-gift">
            🥄 Bahan: ${r.ingredients.join(', ')}
          </div>
          <button type="button" class="btn-station-action btn-bake-action" data-recipe-id="${r.id}" style="margin-top: 8px;">
            ✨ Sajikan Menu Ini
          </button>
        </div>
      `).join('');

      recipeList.querySelectorAll('.btn-bake-action').forEach(btn => {
        btn.addEventListener('click', (ev) => {
          triggerSparkle(ev);
          const rId = btn.getAttribute('data-recipe-id');
          const rec = EVERDREAM_RECIPES.find(item => item.id === rId);
          playEverdreamChime(880, 0.7);
          showToast(`🍪 Berhasil membuat: ${rec?.name || 'Sajian Lezat'}! Aroma manis memenuhi dapur.`);
        });
      });
    }

    kitchenModal.classList.add('open');
    kitchenModal.setAttribute('aria-hidden', 'false');
    playEverdreamChime(659.25, 0.6);
  }

  // Event Listeners Binding
  if (btnBack) {
    btnBack.addEventListener('click', closeEverdreamHouse);
  }

  atmoButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const atmo = btn.getAttribute('data-atmo');
      if (atmo) setAtmosphere(atmo);
    });
  });

  roomNavButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rId = btn.getAttribute('data-room');
      if (rId) switchRoom(rId);
    });
  });

  // Exterior Interactions
  const btnCottageDoor = document.getElementById('btn-cottage-door-enter');
  const doorZone = document.getElementById('cottage-front-door-zone');
  if (btnCottageDoor) {
    btnCottageDoor.addEventListener('click', (e) => {
      e.stopPropagation();
      triggerSparkle(e);
      switchRoom('living');
    });
  }
  if (doorZone) {
    doorZone.addEventListener('click', (e) => {
      triggerSparkle(e);
      switchRoom('living');
    });
  }

  // Surrounding Outdoor Area Integrations
  const btnHubGreenhouse = document.getElementById('btn-hub-greenhouse');
  if (btnHubGreenhouse) {
    btnHubGreenhouse.addEventListener('click', (e) => {
      triggerSparkle(e);
      closeEverdreamHouse();
      if (typeof onNavigateGreenhouse === 'function') {
        onNavigateGreenhouse();
      }
    });
  }

  const btnHubGazebo = document.getElementById('btn-hub-gazebo');
  if (btnHubGazebo) {
    btnHubGazebo.addEventListener('click', (e) => {
      triggerSparkle(e);
      closeEverdreamHouse();
      if (typeof onNavigateGazebo === 'function') {
        onNavigateGazebo();
      }
    });
  }

  const btnHubRiver = document.getElementById('btn-hub-river');
  if (btnHubRiver) {
    btnHubRiver.addEventListener('click', (e) => {
      triggerSparkle(e);
      closeEverdreamHouse();
      if (typeof onNavigateRiver === 'function') {
        onNavigateRiver();
      }
    });
  }

  const btnHubPicnic = document.getElementById('btn-hub-picnic');
  if (btnHubPicnic) {
    btnHubPicnic.addEventListener('click', (e) => {
      triggerSparkle(e);
      showToast('🧺 Duduk santai di atas tikar piknik pastel, menikmati angin sore dan teh bunga bersama Nyanya 🌸');
    });
  }

  // Room Station Buttons
  // Living Room: Sofa & Fireplace & Bookshelf
  const btnSofaSit = document.getElementById('btn-living-sofa');
  if (btnSofaSit) {
    btnSofaSit.addEventListener('click', (e) => {
      triggerSparkle(e);
      playEverdreamChime(523.25, 0.5);
      showToast('🛋️ Duduk santai di atas sofa beludru dusty pink yang empuk... Nyaman sekali.');
    });
  }

  const btnFireplace = document.getElementById('btn-fireplace-toggle');
  if (btnFireplace) {
    btnFireplace.addEventListener('click', toggleFireplace);
  }

  const btnBookshelf = document.getElementById('btn-bookshelf-open');
  if (btnBookshelf) {
    btnBookshelf.addEventListener('click', openBookshelf);
  }

  // Bedroom: Bed Rest & Star Lamp & Writing Desk
  const btnBedRest = document.getElementById('btn-bedroom-rest');
  if (btnBedRest) {
    btnBedRest.addEventListener('click', restOnBed);
  }

  const btnStarLamp = document.getElementById('btn-starlamp-toggle');
  if (btnStarLamp) {
    btnStarLamp.addEventListener('click', toggleStarLamp);
  }

  const btnWritingDesk = document.getElementById('btn-bedroom-desk');
  if (btnWritingDesk) {
    btnWritingDesk.addEventListener('click', openJournalDesk);
  }

  if (btnSleepWakeup) {
    btnSleepWakeup.addEventListener('click', wakeUp);
  }

  // Atelier: Painting & Scrapbook
  const btnAtelierPaint = document.getElementById('btn-atelier-paint');
  if (btnAtelierPaint) {
    btnAtelierPaint.addEventListener('click', (e) => {
      triggerSparkle(e);
      playEverdreamChime(698.46, 0.6);
      showToast('🎨 Mencelupkan kuas ke cat air peach & lavender, menyempurnakan lukisan pulau senja...');
    });
  }

  const btnAtelierScrapbook = document.getElementById('btn-atelier-scrapbook');
  if (btnAtelierScrapbook) {
    btnAtelierScrapbook.addEventListener('click', (e) => {
      triggerSparkle(e);
      playEverdreamChime(783.99, 0.6);
      showToast('✂️ Menempelkan pita renda & stempel bintang pada lembar scrapbook kenangan sahabat.');
    });
  }

  // Kitchen: Bake & Tea
  const btnKitchenBake = document.getElementById('btn-kitchen-bake');
  if (btnKitchenBake) {
    btnKitchenBake.addEventListener('click', openKitchen);
  }

  // Attic: Peti Kenangan & Old Trinkets
  const btnMemoryChest = document.getElementById('btn-memory-chest-open');
  if (btnMemoryChest) {
    btnMemoryChest.addEventListener('click', openMemoryChest);
  }

  const btnAtticTrinkets = document.getElementById('btn-attic-trinkets');
  if (btnAtticTrinkets) {
    btnAtticTrinkets.addEventListener('click', (e) => {
      triggerSparkle(e);
      playEverdreamChime(880, 0.6);
      showToast('✨ Memeriksa kompas bintang kuno dan prisma kaca kosmik yang membiaskan pelangi di dinding loteng.');
    });
  }

  // Modal Close Buttons
  houseView.querySelectorAll('.btn-modal-close').forEach(btn => {
    btn.addEventListener('click', closeAllModals);
  });

  // Modal Backdrop Click
  houseView.querySelectorAll('.everdream-modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeAllModals();
    });
  });

  // Ambient Audio Melody Toggle
  if (btnAudioToggle) {
    btnAudioToggle.addEventListener('click', () => {
      isMusicPlaying = !isMusicPlaying;
      if (isMusicPlaying) {
        btnAudioToggle.innerHTML = '<span>⏸</span><span>Jeda Melodi</span>';
        showToast('♫ Memutar alunan melodi kotak musik The Everdream House');
        playEverdreamLullaby();
        musicInterval = setInterval(() => {
          if (isMusicPlaying) playEverdreamLullaby();
        }, 12000);
      } else {
        btnAudioToggle.innerHTML = '<span>♫</span><span>Melodi Dongeng</span>';
        if (musicInterval) {
          clearInterval(musicInterval);
          musicInterval = null;
        }
        showToast('♫ Melodi dihentikan.');
      }
    });
  }

  // Chibi Nyanya Click
  const avatarDock = document.getElementById('everdream-nyanya-dock');
  if (avatarDock) {
    avatarDock.addEventListener('click', (e) => {
      triggerSparkle(e);
      updateNyanyaSpeech(currentRoom);
      playEverdreamChime(659.25, 0.4);
    });
  }

  // Initialize UI with initial state
  setAtmosphere(currentAtmo, true);
  updateFireplaceUI();
  updateStarLampUI();
  updateNyanyaSpeech(currentRoom);

  return {
    openEverdreamHouse,
    closeEverdreamHouse,
    switchRoom,
    setAtmosphere,
    stokeFireplace: toggleFireplace,
    toggleStarLamp,
    restOnBed,
    wakeUp,
    openMemoryChest,
    openBookshelf,
    openJournalDesk,
    openKitchen
  };
}
