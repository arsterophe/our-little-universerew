/**
 * PINWHEEL RESIDENCE VIEW CONTROLLER
 * THE WINDWHISPER RESIDENCE — A Japanese Fantasy Kitsune Home
 * Character: Syma (abil) · UID: Euc0JLt3kWMveUEIjBwXHfOfvQD3
 * =============================================================================
 * Orchestrates:
 * - Room Navigation (Exterior, Living, Kitchen, Bedroom, Archive, Engawa, Attic)
 * - Weather & Day/Night Atmosphere (Morning, Afternoon, Rainy Day, Night)
 * - Cooking Minigame with Recipes, Ingredients & Progress Animation
 * - Sleep & Wake Up Cycles with Peaceful Lullaby Arpeggios
 * - Wardrobe Outfit Switcher using Genuine Syma Assets
 * - Genuine Collections Integration (Photography, Vision Studio, Gazebo Journal, Fishing Pond)
 * - Wind Chime Harmonic Bell Synthesis & Equip System
 * - Home Decoration System (Slot placement, catalogue, save & restore)
 * - Kitsune Shrine Corner & Secret Attic Lore
 */

import {
  SYMA_CANONICAL_UID,
  SYMA_OUTFITS,
  COOKING_RECIPES,
  WIND_CHIMES,
  DECOR_ITEMS,
  DEFAULT_ROOM_DECOR,
  loadResidenceDecor,
  saveResidenceDecor,
  loadResidenceOutfit,
  saveResidenceOutfit,
  loadResidenceWeather,
  saveResidenceWeather,
  loadResidenceChime,
  saveResidenceChime,
  loadResidenceCookingHistory,
  saveResidenceCookingHistory,
  isAtticUnlocked,
  unlockAttic,
  loadSymaPhotographyArchive,
  loadSymaVisionArtworksArchive,
  loadSymaGazeboJournalArchive,
  loadSymaFishingCollectionArchive,
  playSynthesizedChime,
  setProceduralRainAudio,
  playCookingSound,
  playBedtimeLullaby
} from './pinwheel_residence_state.js';

export function initPinwheelResidenceView(options = {}) {
  const { onShowToast, onTriggerSparkle } = options;

  let currentUid = SYMA_CANONICAL_UID;
  let currentRoom = 'exterior';
  let currentWeather = 'afternoon';
  let currentOutfit = 'sacred_miko';
  let currentChime = 'lavender_glass';
  let roomDecorState = JSON.parse(JSON.stringify(DEFAULT_ROOM_DECOR));
  let isDecorModeActive = false;
  let activeDecorSlot = null;
  let selectedRecipe = COOKING_RECIPES[0];
  let isCookingInProgress = false;

  // DOM Elements Cache
  const residenceView = document.getElementById('view-pinwheel-residence');
  if (!residenceView) {
    console.warn('[ResidenceView] #view-pinwheel-residence container not found.');
    return null;
  }

  const btnBack = document.getElementById('btn-pinwheel-residence-back');
  const btnChimeRing = document.getElementById('btn-residence-chime-ring');
  const roomNavButtons = residenceView.querySelectorAll('.btn-room-nav');
  const atmoButtons = residenceView.querySelectorAll('.btn-atmo-choice');
  const roomContainers = residenceView.querySelectorAll('.residence-room-container');
  const symaPresence = document.getElementById('residence-syma-presence');
  const symaSpeechText = document.getElementById('syma-speech-text');
  const symaAvatarImg = document.getElementById('syma-avatar-img');

  // Modals
  const modalBackdrop = document.getElementById('residence-modal-backdrop');
  const modalTitle = document.getElementById('residence-modal-title');
  const modalBody = document.getElementById('residence-modal-body');
  const btnModalClose = document.getElementById('btn-residence-modal-close');
  const sleepOverlay = document.getElementById('residence-sleep-overlay');
  const btnWakeUp = document.getElementById('btn-residence-wake-up');

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

  function triggerSparkle() {
    if (typeof onTriggerSparkle === 'function') {
      onTriggerSparkle();
    }
  }

  // ---------------------------------------------------------------------------
  // 1. OPEN / CLOSE CONTROLLER
  // ---------------------------------------------------------------------------
  function openResidence(uid = SYMA_CANONICAL_UID, targetRoom = 'exterior') {
    currentUid = uid || SYMA_CANONICAL_UID;

    // Load persisted state for this user
    roomDecorState = loadResidenceDecor(currentUid);
    currentOutfit = loadResidenceOutfit(currentUid);
    currentWeather = loadResidenceWeather(currentUid);
    currentChime = loadResidenceChime(currentUid);

    // Apply weather atmosphere
    applyWeather(currentWeather, false);

    // Apply outfit to Syma presence
    applySymaOutfit(currentOutfit);

    // Switch to target room
    switchRoom(targetRoom);

    // Show view
    residenceView.classList.add('active');
    residenceView.setAttribute('aria-hidden', 'false');

    showToast('⛩️ Selamat datang di The Windwhisper Residence, kediaman Syma.');
    triggerSparkle();
  }

  function closeResidence() {
    // Stop any audio synthesis (rain, cooking)
    setProceduralRainAudio(false);

    // Close any open modals
    closeModal();
    if (sleepOverlay) sleepOverlay.classList.remove('active');

    residenceView.classList.remove('active');
    residenceView.setAttribute('aria-hidden', 'true');
  }

  // ---------------------------------------------------------------------------
  // 2. ROOM SWITCHING & RENDERING
  // ---------------------------------------------------------------------------
  function switchRoom(roomName) {
    if (roomName === 'attic') {
      unlockAttic(currentUid);
    }
    currentRoom = roomName;

    // Update Nav buttons
    roomNavButtons.forEach(btn => {
      const r = btn.getAttribute('data-room');
      btn.classList.toggle('active', r === roomName);
    });

    // Update Room containers
    roomContainers.forEach(container => {
      const r = container.getAttribute('data-room');
      container.classList.toggle('active', r === roomName);
    });

    // Render decoration slots in this room
    renderRoomDecorSlots(roomName);

    // Update Syma speech bubble based on room
    updateSymaRoomDialogue(roomName);
  }

  function updateSymaRoomDialogue(roomName) {
    if (!symaSpeechText) return;
    const quotes = {
      exterior: '"Taman ini selalu tenang... dengar gemerisik sakura dan lonceng angin."',
      living: '"Ayo duduk di kotatsu hangat, secangkir teh panas sudah menunggumu."',
      kitchen: '"Aroma manis sakura dan madu... mau mencoba resep teh buatanku?"',
      bedroom: '"Kasur futon awan ini sangat empuk untuk beristirahat dan bermimpi indah."',
      archive: '"Di sudut ini tersimpan foto, lukisan, dan cerita perjalanan semesta kita."',
      engawa: '"Duduk di beranda sambil memandang langit dan merasakan semilir angin..."',
      attic: '"Ruang loteng rahasia di bawah rasi bintang... penuh kenangan misterius."'
    };
    symaSpeechText.textContent = quotes[roomName] || quotes.living;
  }

  // ---------------------------------------------------------------------------
  // 3. WEATHER & ATMOSPHERE SYSTEM
  // ---------------------------------------------------------------------------
  function applyWeather(weatherMode, persist = true) {
    currentWeather = weatherMode;
    if (persist) saveResidenceWeather(weatherMode, currentUid);

    // Remove old atmo classes
    residenceView.classList.remove('atmo-morning', 'atmo-afternoon', 'atmo-rain', 'atmo-night');
    residenceView.classList.add(`atmo-${weatherMode}`);

    // Update button states
    atmoButtons.forEach(btn => {
      const w = btn.getAttribute('data-atmo');
      btn.classList.toggle('active', w === weatherMode);
    });

    // Handle rain audio
    if (weatherMode === 'rain') {
      setProceduralRainAudio(true, 0.4);
    } else {
      setProceduralRainAudio(false);
    }
  }

  // ---------------------------------------------------------------------------
  // 4. SYMA OUTFIT WARDROBE
  // ---------------------------------------------------------------------------
  function applySymaOutfit(outfitId) {
    currentOutfit = outfitId;
    saveResidenceOutfit(outfitId, currentUid);

    const outfit = SYMA_OUTFITS.find(o => o.id === outfitId) || SYMA_OUTFITS[0];
    if (symaAvatarImg) {
      symaAvatarImg.src = outfit.image;
      symaAvatarImg.alt = outfit.name;
    }
    const badge = document.getElementById('syma-presence-badge');
    if (badge) {
      badge.textContent = outfit.name.split(' ')[0] + ' 🦊';
    }
  }

  function openWardrobeModal() {
    modalTitle.innerHTML = '<span>👘</span> Lemari Pakaian Syma (Outfit Wardrobe)';
    
    let html = `
      <div class="wardrobe-outfits-grid">
        ${SYMA_OUTFITS.map(outfit => {
          const isEquipped = outfit.id === currentOutfit;
          return `
            <div class="wardrobe-card ${isEquipped ? 'equipped' : ''}" data-outfit-id="${outfit.id}">
              <div class="wardrobe-img-wrap">
                <img src="${outfit.thumb}" alt="${outfit.name}" />
              </div>
              <div class="wardrobe-name">${outfit.name}</div>
              <div class="wardrobe-type">${outfit.nameJp}</div>
              <p style="font-size:0.75rem; color:#cbd5e1; line-height:1.4; margin-bottom:8px;">${outfit.description}</p>
              <div style="font-size:0.72rem; color:#fde047; font-style:italic; margin-bottom:10px;">${outfit.quote}</div>
              <button type="button" class="btn-wear-outfit" data-outfit-id="${outfit.id}">
                ${isEquipped ? '✓ Sedang Dikenakan' : '✨ Kenakan Outfit'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modalBody.innerHTML = html;

    modalBody.querySelectorAll('.btn-wear-outfit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-outfit-id');
        applySymaOutfit(id);
        showToast('👘 Syma telah mengenakan outfit baru!');
        triggerSparkle();
        openWardrobeModal(); // re-render equipped state
      });
    });

    openModal();
  }

  // ---------------------------------------------------------------------------
  // 5. SLEEP & WAKE UP INTERACTION
  // ---------------------------------------------------------------------------
  function triggerSleepCycle() {
    if (!sleepOverlay) return;

    // Start peaceful lullaby audio
    playBedtimeLullaby(0.5);

    sleepOverlay.classList.add('active');
    showToast('🌙 Syma bersiap untuk tidur nyenyak di futon lembut...');

    // Switch weather to night if desired or keep peaceful ambient
    applyWeather('night', true);
  }

  if (btnWakeUp) {
    btnWakeUp.addEventListener('click', () => {
      if (sleepOverlay) sleepOverlay.classList.remove('active');
      applyWeather('morning', true);
      showToast('☀️ Selamat pagi! Syma bangun dengan segar dan bertenaga.');
      triggerSparkle();
    });
  }

  // ---------------------------------------------------------------------------
  // 6. COOKING MINIGAME (Kitchen - Little Kitchen)
  // ---------------------------------------------------------------------------
  function openCookingModal() {
    modalTitle.innerHTML = '<span>🍳</span> Dapur Syma — Resep Teh & Camilan';

    function renderCookingContent() {
      modalBody.innerHTML = `
        <div style="margin-bottom:14px; font-size:0.85rem; color:#cbd5e1;">
          Pilih salah satu resep racikan tradisional Kitsune untuk diseduh atau disiapkan bersama Syma:
        </div>
        <div class="cooking-recipes-grid">
          ${COOKING_RECIPES.map(recipe => {
            const isSelected = recipe.id === selectedRecipe.id;
            return `
              <div class="recipe-choice-card ${isSelected ? 'selected' : ''}" data-recipe-id="${recipe.id}">
                <div class="recipe-header">
                  <span class="recipe-icon">${recipe.icon}</span>
                  <div>
                    <div class="recipe-title">${recipe.name}</div>
                    <span style="font-size:0.72rem; color:#93c5fd;">${recipe.category}</span>
                  </div>
                </div>
                <div class="recipe-flavor">${recipe.flavorProfile}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="cooking-process-panel">
          <h4 style="margin:0 0 8px 0; color:#f8fafc; font-size:0.95rem;">Bahan-Bahan yang Dibutuhkan:</h4>
          <div style="display:flex; justify-content:center; gap:16px; margin-bottom:12px; flex-wrap:wrap;">
            ${selectedRecipe.ingredients.map(ing => `
              <div style="background:rgba(30,20,50,0.8); border:1px solid rgba(192,132,252,0.25); border-radius:10px; padding:6px 12px; font-size:0.8rem; display:flex; align-items:center; gap:6px;">
                <span>${ing.icon}</span>
                <span style="color:#ffffff; font-weight:600;">${ing.name}</span>
                <span style="color:#cbd5e1;">(${ing.amount})</span>
              </div>
            `).join('')}
          </div>

          <div style="font-size:0.8rem; color:#fbcfe8; font-style:italic; margin-bottom:10px;">
            ${selectedRecipe.symaComment}
          </div>

          <div class="cooking-progress-bar" id="cooking-progress-bar">
            <div class="cooking-progress-fill" id="cooking-progress-fill"></div>
          </div>

          <button type="button" class="btn-room-action primary" id="btn-start-cooking" style="margin:0 auto;" ${isCookingInProgress ? 'disabled' : ''}>
            ${isCookingInProgress ? '⏳ Sedang Memasak...' : `✨ Mulai Racik ${selectedRecipe.name.split('—')[0]}`}
          </button>
        </div>
      `;

      // Wire recipe selection
      modalBody.querySelectorAll('.recipe-choice-card').forEach(card => {
        card.addEventListener('click', () => {
          if (isCookingInProgress) return;
          const rId = card.getAttribute('data-recipe-id');
          selectedRecipe = COOKING_RECIPES.find(r => r.id === rId) || COOKING_RECIPES[0];
          renderCookingContent();
        });
      });

      // Wire start cooking
      const btnStart = modalBody.querySelector('#btn-start-cooking');
      if (btnStart) {
        btnStart.addEventListener('click', () => {
          runCookingAction();
        });
      }
    }

    renderCookingContent();
    openModal();
  }

  function runCookingAction() {
    isCookingInProgress = true;
    const fill = document.getElementById('cooking-progress-fill');
    const btn = document.getElementById('btn-start-cooking');
    if (btn) btn.disabled = true;

    // Play procedural cooking sizzle/kettle sound
    playCookingSound(selectedRecipe.cookingTimeSec, 0.4);

    let progress = 0;
    const intervalTime = 50;
    const step = 100 / ((selectedRecipe.cookingTimeSec * 1000) / intervalTime);

    const timer = setInterval(() => {
      progress += step;
      if (fill) fill.style.width = Math.min(progress, 100) + '%';

      if (progress >= 100) {
        clearInterval(timer);
        isCookingInProgress = false;

        // Save to cooking history
        const history = loadResidenceCookingHistory(currentUid);
        history.unshift({
          recipeId: selectedRecipe.id,
          name: selectedRecipe.name,
          cookedAt: Date.now()
        });
        saveResidenceCookingHistory(history, currentUid);

        triggerSparkle();
        showToast(`🍵 ${selectedRecipe.name} berhasil dibuat! Nikmati kehangatannya.`);

        modalBody.innerHTML = `
          <div style="text-align:center; padding:24px 16px;">
            <div style="font-size:3.5rem; filter:drop-shadow(0 0 16px rgba(251,191,36,0.6)); margin-bottom:12px;">
              ${selectedRecipe.icon}
            </div>
            <h3 style="color:#ffffff; font-family:'Cinzel',serif; margin:0 0 8px 0;">Sajian Siap Dinikmati!</h3>
            <p style="color:#e9d5ff; font-size:0.9rem; max-width:420px; margin:0 auto 16px auto;">
              ${selectedRecipe.name} telah selesai diracik dengan sempurna oleh Syma.
            </p>
            <div style="background:rgba(30,20,50,0.8); border:1px solid rgba(192,132,252,0.3); border-radius:12px; padding:12px; max-width:400px; margin:0 auto 20px auto; font-style:italic; font-size:0.82rem; color:#fde047;">
              ${selectedRecipe.symaComment}
            </div>
            <button type="button" class="btn-room-action primary" id="btn-finish-cooking" style="margin:0 auto;">
              🌸 Nikmati Bersama Syma
            </button>
          </div>
        `;

        modalBody.querySelector('#btn-finish-cooking')?.addEventListener('click', () => {
          closeModal();
          updateSymaRoomDialogue('kitchen');
        });
      }
    }, intervalTime);
  }

  // ---------------------------------------------------------------------------
  // 7. BOOK READER (Living Room)
  // ---------------------------------------------------------------------------
  function openBookReaderModal() {
    modalTitle.innerHTML = '<span>📖</span> Buku Cerita & Renungan Syma';
    
    const stories = [
      {
        title: 'Legenda Rubah Ekor Sembilan & Angin Lembah',
        content: `Dahulu kala, saat semesta Our Little Universe pertama kali merajut bintang-bintangnya, seekor rubah perak bertelinga lembut menari di atas perbukitan PINWHEEL. Setiap kepakan ekornya melahirkan angin semilir yang memutar kincir-kincir harapan.<br><br>
        "Rumah bukanlah sekadar dinding kayu dan atap jerami," bisik sang rubah kepada sang angin. "Rumah adalah tempat di mana hatimu merasa tenang, di mana sahabatmu dapat singgah tanpa rasa takut, dan di mana setiap tegukan teh terasa seperti pelukan hangat."`
      },
      {
        title: 'Filosofi Nama PINWHEEL — Putaran Harapan',
        content: `Kincir angin hanya dapat berputar ketika angin datang menyapanya. Seperti itulah hati manusia dan persahabatan sejati. Kita tidak bisa bergerak sendirian di tengah hampa.<br><br>
        Lagu PINWHEEL mengingatkan kita bahwa sejauh apapun kita melangkah, hembusan angin yang akrab akan selalu membawa kabar tentang mereka yang kita sayangi. Di The Windwhisper Residence, angin tidak pernah berhenti bernyanyi.`
      },
      {
        title: 'Catatan Kecil Syma untuk Sahabat',
        content: `Untuk Nyanya sang penyihir malam yang tangguh, Lala sang peri benderang yang ceria, dan Lele sang penjaga bayang-bayang yang teduh:<br><br>
        Pintu gerbang rumah ini akan selalu terbuka bagi kalian. Jika dunia luar terasa melelahkan, kemarilah. Kotatsu ini cukup luas untuk kita berempat, dan teko teh sakura tidak akan pernah kehabisan air hangat.`
      }
    ];

    modalBody.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        ${stories.map((s, idx) => `
          <div style="background:rgba(28,18,48,0.8); border:1px solid var(--res-card-border); border-radius:14px; padding:16px;">
            <h4 style="margin:0 0 10px 0; color:#f8fafc; font-family:'Cinzel',serif; font-size:0.98rem; display:flex; align-items:center; gap:8px;">
              <span>📜</span> ${s.title}
            </h4>
            <div style="font-size:0.84rem; color:#cbd5e1; line-height:1.6;">
              ${s.content}
            </div>
          </div>
        `).join('')}
      </div>
    `;

    openModal();
  }

  // ---------------------------------------------------------------------------
  // 8. PERSONAL ARCHIVE INTEGRATION (Personal Corner)
  // ---------------------------------------------------------------------------
  async function openArchiveModal(initialTab = 'photos') {
    modalTitle.innerHTML = '<span>📚</span> Arsip Kenangan Syma (The Little Archive)';

    modalBody.innerHTML = `
      <div style="display:flex; gap:8px; margin-bottom:16px; border-bottom:1px solid rgba(192,132,252,0.2); padding-bottom:8px;">
        <button type="button" class="btn-atmo-choice ${initialTab === 'photos' ? 'active' : ''}" id="tab-arc-photos">📷 Foto (${await getPhotoCount()})</button>
        <button type="button" class="btn-atmo-choice ${initialTab === 'art' ? 'active' : ''}" id="tab-arc-art">🎨 Karya Seni (${await getArtCount()})</button>
        <button type="button" class="btn-atmo-choice ${initialTab === 'journal' ? 'active' : ''}" id="tab-arc-journal">📖 Jurnal Gazebo (${getJournalCount()})</button>
        <button type="button" class="btn-atmo-choice ${initialTab === 'fish' ? 'active' : ''}" id="tab-arc-fish">🐟 Koleksi Ikan (${getFishCount()})</button>
      </div>
      <div id="archive-tab-content" style="min-height:240px;">
        <div style="text-align:center; padding:30px; color:#cbd5e1;">Memuat data arsip...</div>
      </div>
    `;

    openModal();

    modalBody.querySelector('#tab-arc-photos')?.addEventListener('click', () => renderArchivePhotos());
    modalBody.querySelector('#tab-arc-art')?.addEventListener('click', () => renderArchiveArt());
    modalBody.querySelector('#tab-arc-journal')?.addEventListener('click', () => renderArchiveJournal());
    modalBody.querySelector('#tab-arc-fish')?.addEventListener('click', () => renderArchiveFish());

    if (initialTab === 'photos') renderArchivePhotos();
    else if (initialTab === 'art') renderArchiveArt();
    else if (initialTab === 'journal') renderArchiveJournal();
    else if (initialTab === 'fish') renderArchiveFish();
  }

  async function getPhotoCount() {
    try {
      const photos = await loadSymaPhotographyArchive(currentUid);
      return photos.length;
    } catch (_) { return 0; }
  }

  async function getArtCount() {
    try {
      const arts = await loadSymaVisionArtworksArchive(currentUid);
      return arts.length;
    } catch (_) { return 0; }
  }

  function getJournalCount() {
    const journals = loadSymaGazeboJournalArchive(currentUid);
    return journals.length;
  }

  function getFishCount() {
    const catches = loadSymaFishingCollectionArchive(currentUid);
    return catches.length;
  }

  async function renderArchivePhotos() {
    const container = document.getElementById('archive-tab-content');
    if (!container) return;
    const photos = await loadSymaPhotographyArchive(currentUid);

    if (photos.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px; color:#cbd5e1;">
          <div style="font-size:2.5rem; margin-bottom:8px;">📷</div>
          <p style="margin:0 0 6px 0; font-weight:600;">Belum Ada Foto Tersimpan</p>
          <p style="font-size:0.8rem; margin:0;">Abadikan momen indah di Photography Studio PINWHEEL.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
        ${photos.map(p => `
          <div style="background:rgba(25,18,45,0.8); border:1px solid var(--res-card-border); border-radius:12px; padding:8px; text-align:center;">
            <div style="width:100%; height:100px; border-radius:8px; overflow:hidden; background:#120c22; margin-bottom:6px;">
              <img src="${p.imageDataUrl || p.thumbDataUrl || '/assets/card_abil_hd.jpg'}" style="width:100%; height:100%; object-fit:cover;" alt="${p.title || 'Foto'}" />
            </div>
            <div style="font-size:0.75rem; font-weight:700; color:#ffffff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${p.title || 'Foto Syma'}</div>
            <div style="font-size:0.68rem; color:#94a3b8;">${new Date(p.createdAt || Date.now()).toLocaleDateString('id-ID')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  async function renderArchiveArt() {
    const container = document.getElementById('archive-tab-content');
    if (!container) return;
    const arts = await loadSymaVisionArtworksArchive(currentUid);

    if (arts.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px; color:#cbd5e1;">
          <div style="font-size:2.5rem; margin-bottom:8px;">🎨</div>
          <p style="margin:0 0 6px 0; font-weight:600;">Belum Ada Karya Seni</p>
          <p style="font-size:0.8rem; margin:0;">Goreskan kuas kreatifmu di Vision Studio PINWHEEL.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:10px;">
        ${arts.map(a => `
          <div style="background:rgba(25,18,45,0.8); border:1px solid var(--res-card-border); border-radius:12px; padding:8px; text-align:center;">
            <div style="width:100%; height:100px; border-radius:8px; overflow:hidden; background:#120c22; margin-bottom:6px;">
              <img src="${a.imageDataUrl || a.thumbDataUrl || '/assets/avatar_abil_hd.jpg'}" style="width:100%; height:100%; object-fit:cover;" alt="${a.title || 'Karya'}" />
            </div>
            <div style="font-size:0.75rem; font-weight:700; color:#ffffff; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.title || 'Karya Syma'}</div>
            <div style="font-size:0.68rem; color:#c084fc;">${a.category || 'Atelier'}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderArchiveJournal() {
    const container = document.getElementById('archive-tab-content');
    if (!container) return;
    const journals = loadSymaGazeboJournalArchive(currentUid);

    if (journals.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:30px; color:#cbd5e1;">
          <div style="font-size:2.5rem; margin-bottom:8px;">📖</div>
          <p style="margin:0 0 6px 0; font-weight:600;">Belum Ada Catatan Jurnal</p>
          <p style="font-size:0.8rem; margin:0;">Tuliskan renungan hatimu di Gazebo PINWHEEL.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${journals.map(j => `
          <div style="background:rgba(30,20,52,0.8); border:1px solid var(--res-card-border); border-radius:12px; padding:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-weight:700; color:#f8fafc; font-size:0.88rem;">${j.title || 'Kenangan Tanpa Judul'}</span>
              <span style="font-size:0.72rem; color:#93c5fd;">${new Date(j.createdAt || Date.now()).toLocaleDateString('id-ID')}</span>
            </div>
            <p style="margin:0; font-size:0.8rem; color:#cbd5e1; line-height:1.45;">${j.content || ''}</p>
          </div>
        `).join('')}
      </div>
    `;
  }

  function renderArchiveFish() {
    const container = document.getElementById('archive-tab-content');
    if (!container) return;
    const catches = loadSymaFishingCollectionArchive(currentUid);

    container.innerHTML = `
      <div class="archive-aquarium-box">
        <span class="aquarium-fish-actor">🐟</span>
        <span class="aquarium-fish-actor" style="animation-delay:2.5s; top:30%;">🐠</span>
        <span class="aquarium-fish-actor" style="animation-delay:4.5s; top:60%;">🐡</span>
      </div>
      <div style="margin-top:14px; font-size:0.82rem; color:#cbd5e1;">
        ${catches.length > 0 ? `Ikan tangkapan dari The Whispering Pond berenang dengan tenang di akuarium kediaman Syma (${catches.length} jenis ikan tercatat).` : 'Belum ada ikan yang tertangkap di kolam. Kunjungi The Whispering Pond untuk memancing!'}
      </div>
    `;
  }

  // ---------------------------------------------------------------------------
  // 9. WIND CHIME COLLECTION PICKER
  // ---------------------------------------------------------------------------
  function openWindChimeModal() {
    modalTitle.innerHTML = '<span>🎐</span> Koleksi Lonceng Angin (Wind Chimes)';

    modalBody.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
        ${WIND_CHIMES.map(chime => {
          const isEquipped = chime.id === currentChime;
          return `
            <div style="background:rgba(28,18,48,0.8); border:1px solid ${isEquipped ? 'var(--res-gold)' : 'var(--res-card-border)'}; border-radius:14px; padding:14px; display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.8rem;">${chime.icon}</span>
                <button type="button" class="btn-residence-chime-ring" data-test-chime="${chime.id}" style="padding:4px 10px; font-size:0.75rem;">
                  🔔 Uji Denting
                </button>
              </div>
              <div style="font-weight:700; color:#ffffff; font-size:0.92rem;">${chime.name}</div>
              <div style="font-size:0.75rem; color:#93c5fd;">${chime.nameJp}</div>
              <p style="margin:0; font-size:0.76rem; color:#cbd5e1; line-height:1.4;">${chime.description}</p>
              <button type="button" class="btn-room-action ${isEquipped ? 'primary' : ''}" data-equip-chime="${chime.id}" style="margin-top:auto; width:100%; justify-content:center;">
                ${isEquipped ? '✓ Terpasang di Teras' : '🎐 Pasang Lonceng Ini'}
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;

    modalBody.querySelectorAll('[data-test-chime]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-test-chime');
        playSynthesizedChime(id, 0.6);
      });
    });

    modalBody.querySelectorAll('[data-equip-chime]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-equip-chime');
        currentChime = id;
        saveResidenceChime(id, currentUid);
        playSynthesizedChime(id, 0.6);
        showToast('🎐 Lonceng angin teras telah diganti!');
        triggerSparkle();
        openWindChimeModal(); // re-render
      });
    });

    openModal();
  }

  // ---------------------------------------------------------------------------
  // 10. KITSUNE SHRINE PRAYER MODAL
  // ---------------------------------------------------------------------------
  function openKitsuneShrineModal() {
    modalTitle.innerHTML = '<span>⛩️</span> Sudut Doa Rubah Suci (Kitsune Sanctuary)';

    modalBody.innerHTML = `
      <div style="text-align:center; padding:16px;">
        <div style="font-size:3.5rem; filter:drop-shadow(0 0 18px rgba(192,132,252,0.8)); margin-bottom:12px;">
          🦊
        </div>
        <h3 style="color:#ffffff; font-family:'Cinzel',serif; margin:0 0 8px 0;">Kitsune Shrine Corner</h3>
        <p style="color:#cbd5e1; font-size:0.86rem; max-width:440px; margin:0 auto 16px auto; line-height:1.5;">
          Altar suci porselen rubah putih yang dihiasi lentera andon hangat dan kelopak sakura mekar. Tempat Syma memanjatkan doa ketenangan bagi seluruh sahabat di semesta Our Little Universe.
        </p>
        <div style="display:flex; justify-content:center; gap:12px;">
          <button type="button" class="btn-room-action primary" id="btn-shrine-offering">
            🌸 Persembahkan Kelopak Bunga & Panjatkan Doa
          </button>
        </div>
      </div>
    `;

    modalBody.querySelector('#btn-shrine-offering')?.addEventListener('click', () => {
      playSynthesizedChime('kitsune_ceramic', 0.6);
      triggerSparkle();
      showToast('✨ Berkah damai sang rubah suci menyelimuti kediaman.');
      closeModal();
    });

    openModal();
  }

  // ---------------------------------------------------------------------------
  // 11. HOME DECORATION SYSTEM
  // ---------------------------------------------------------------------------
  function toggleDecorMode() {
    isDecorModeActive = !isDecorModeActive;
    renderRoomDecorSlots(currentRoom);

    const btn = document.getElementById(`btn-decor-toggle-${currentRoom}`);
    if (btn) {
      btn.textContent = isDecorModeActive ? '✓ Selesai Dekorasi' : '🎨 Mode Dekorasi';
    }

    if (isDecorModeActive) {
      showToast('🎨 Mode Dekorasi Aktif: Klik pada slot dekorasi untuk mengganti ornamen.');
    }
  }

  function renderRoomDecorSlots(roomName) {
    const container = document.getElementById(`room-slots-${roomName}`);
    if (!container) return;

    const slots = roomDecorState[roomName] || {};
    const slotKeys = Object.keys(slots);

    container.innerHTML = slotKeys.map(slotKey => {
      const itemId = slots[slotKey];
      const itemDef = DECOR_ITEMS.find(d => d.id === itemId);

      return `
        <div class="residence-decor-slot ${isDecorModeActive ? 'mode-edit' : ''}" data-slot-key="${slotKey}" style="${getSlotStyle(roomName, slotKey)}">
          <span class="decor-item-display">${itemDef ? itemDef.icon : '✨'}</span>
          <span class="decor-item-label">${itemDef ? itemDef.name.split(' ')[0] : 'Slot'}</span>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.residence-decor-slot').forEach(slotEl => {
      slotEl.addEventListener('click', () => {
        if (!isDecorModeActive) {
          const sKey = slotEl.getAttribute('data-slot-key');
          const iId = slots[sKey];
          const item = DECOR_ITEMS.find(d => d.id === iId);
          if (item) showToast(`Ornamen: ${item.name} — ${item.desc}`);
          return;
        }
        activeDecorSlot = slotEl.getAttribute('data-slot-key');
        openDecorDrawer(roomName, activeDecorSlot);
      });
    });
  }

  function getSlotStyle(room, slotKey) {
    const coords = {
      exterior: {
        slot_ext_1: 'bottom: 25px; left: 45%;',
        slot_ext_2: 'bottom: 50px; right: 80px;',
        slot_ext_3: 'bottom: 70px; left: 160px;',
        slot_ext_4: 'bottom: 110px; left: 80px;'
      },
      living: {
        slot_liv_1: 'bottom: 30px; left: 50%; transform: translateX(-50%);',
        slot_liv_2: 'bottom: 80px; left: 50px;',
        slot_liv_3: 'top: 60px; right: 80px;',
        slot_liv_4: 'bottom: 70px; right: 120px;',
        slot_liv_5: 'top: 90px; left: 90px;'
      },
      kitchen: {
        slot_kit_1: 'bottom: 60px; left: 120px;',
        slot_kit_2: 'bottom: 70px; right: 120px;',
        slot_kit_3: 'top: 60px; left: 80px;'
      },
      bedroom: {
        slot_bed_1: 'bottom: 30px; left: 50%; transform: translateX(-50%);',
        slot_bed_2: 'bottom: 60px; left: 80px;',
        slot_bed_3: 'top: 50px; left: 80px;',
        slot_bed_4: 'bottom: 20px; right: 100px;'
      },
      archive: {
        slot_arc_1: 'top: 50px; left: 60px;',
        slot_arc_2: 'top: 50px; right: 60px;',
        slot_arc_3: 'bottom: 40px; left: 80px;',
        slot_arc_4: 'bottom: 40px; right: 80px;'
      },
      engawa: {
        slot_eng_1: 'bottom: 30px; left: 40%;',
        slot_eng_2: 'bottom: 30px; right: 40%;',
        slot_eng_3: 'bottom: 80px; right: 80px;',
        slot_eng_4: 'top: 40px; right: 60px;'
      },
      attic: {
        slot_att_1: 'top: 60px; left: 80px;',
        slot_att_2: 'bottom: 40px; left: 100px;',
        slot_att_3: 'bottom: 40px; right: 100px;'
      }
    };
    return (coords[room] && coords[room][slotKey]) || 'bottom: 30px; left: 50%;';
  }

  function openDecorDrawer(roomName, slotKey) {
    modalTitle.innerHTML = '<span>🎨</span> Pilih Ornamen Dekorasi';

    let activeCategory = 'all';

    function renderItems() {
      const filtered = activeCategory === 'all' 
        ? DECOR_ITEMS 
        : DECOR_ITEMS.filter(d => d.category === activeCategory);

      modalBody.innerHTML = `
        <div class="decor-drawer-categories">
          <button type="button" class="btn-decor-cat ${activeCategory === 'all' ? 'active' : ''}" data-cat="all">Semua</button>
          <button type="button" class="btn-decor-cat ${activeCategory === 'furniture' ? 'active' : ''}" data-cat="furniture">Perabot</button>
          <button type="button" class="btn-decor-cat ${activeCategory === 'lighting' ? 'active' : ''}" data-cat="lighting">Lampu & Lentera</button>
          <button type="button" class="btn-decor-cat ${activeCategory === 'plants' ? 'active' : ''}" data-cat="plants">Tanaman</button>
          <button type="button" class="btn-decor-cat ${activeCategory === 'wall' ? 'active' : ''}" data-cat="wall">Dinding</button>
          <button type="button" class="btn-decor-cat ${activeCategory === 'japanese_ornaments' ? 'active' : ''}" data-cat="japanese_ornaments">Ornamen Jepang</button>
          <button type="button" class="btn-decor-cat ${activeCategory === 'kitsune' ? 'active' : ''}" data-cat="kitsune">Kitsune</button>
        </div>
        <div class="decor-items-grid">
          ${filtered.map(item => `
            <div class="decor-item-card" data-item-id="${item.id}">
              <span style="font-size:2.2rem; margin-bottom:6px;">${item.icon}</span>
              <div style="font-weight:700; font-size:0.82rem; color:#ffffff;">${item.name}</div>
              <p style="margin:4px 0 0 0; font-size:0.72rem; color:#cbd5e1; line-height:1.3;">${item.desc}</p>
              <button type="button" class="btn-room-action primary" style="margin-top:8px; padding:4px 10px; font-size:0.75rem; width:100%; justify-content:center;">
                Pasang ke Slot
              </button>
            </div>
          `).join('')}
        </div>
      `;

      modalBody.querySelectorAll('.btn-decor-cat').forEach(b => {
        b.addEventListener('click', () => {
          activeCategory = b.getAttribute('data-cat');
          renderItems();
        });
      });

      modalBody.querySelectorAll('.decor-item-card').forEach(card => {
        card.addEventListener('click', () => {
          const itemId = card.getAttribute('data-item-id');
          if (!roomDecorState[roomName]) roomDecorState[roomName] = {};
          roomDecorState[roomName][slotKey] = itemId;
          saveResidenceDecor(roomDecorState, currentUid);

          renderRoomDecorSlots(roomName);
          showToast('✨ Dekorasi berhasil dipasang dan tersimpan!');
          triggerSparkle();
          closeModal();
        });
      });
    }

    renderItems();
    openModal();
  }

  // ---------------------------------------------------------------------------
  // 12. MODAL UTILITY
  // ---------------------------------------------------------------------------
  function openModal() {
    if (modalBackdrop) modalBackdrop.classList.add('active');
  }

  function closeModal() {
    if (modalBackdrop) modalBackdrop.classList.remove('active');
  }

  if (btnModalClose) {
    btnModalClose.addEventListener('click', closeModal);
  }
  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
  }

  // ---------------------------------------------------------------------------
  // 13. GLOBAL EVENT LISTENERS & HOTSPOT WIRING
  // ---------------------------------------------------------------------------
  if (btnBack) {
    btnBack.addEventListener('click', closeResidence);
  }

  // Chime Ring Button
  if (btnChimeRing) {
    btnChimeRing.addEventListener('click', () => {
      btnChimeRing.classList.add('ringing');
      playSynthesizedChime(currentChime, 0.6);
      setTimeout(() => btnChimeRing.classList.remove('ringing'), 1200);
    });
  }

  // Atmosphere switcher buttons
  atmoButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const atmo = btn.getAttribute('data-atmo');
      applyWeather(atmo, true);
    });
  });

  // Room dock buttons
  roomNavButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const room = btn.getAttribute('data-room');
      switchRoom(room);
    });
  });

  // Syma Presence click -> talk
  if (symaPresence) {
    symaPresence.addEventListener('click', () => {
      const dialogues = [
        '"Senang sekali kamu berada di sini menemaniku di The Windwhisper Residence."',
        '"Angin semesta selalu membawa berkah dan kedamaian ke dalam rumah ini."',
        '"Apakah kamu mau secangkir teh hangat atau mendengarkan denting lonceng angin?"',
        '"Bintang-bintang di luar tersenyum melihat persahabatan kita berempat."'
      ];
      const pick = dialogues[Math.floor(Math.random() * dialogues.length)];
      if (symaSpeechText) symaSpeechText.textContent = pick;
      triggerSparkle();
    });
  }

  // Wire Hotspots across rooms
  residenceView.querySelectorAll('[data-residence-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.getAttribute('data-residence-action');

      switch (action) {
        case 'enter_house':
          switchRoom('living');
          break;
        case 'sit_porch':
          showToast('🍵 Syma duduk santai di teras luar, menikmati semilir angin sejuk.');
          break;
        case 'watch_pond':
          showToast('🐟 Air kolam jernih beriak lembut saat ikan koi berenang damai.');
          break;
        case 'toggle_lanterns':
          showToast('🏮 Lentera taman menyala dengan kehangatan cahaya keemasan.');
          break;
        case 'chime_menu':
          openWindChimeModal();
          break;
        case 'shrine_menu':
          openKitsuneShrineModal();
          break;
        case 'sit_kotatsu':
          showToast('🛋️ Syma duduk santai di bawah kotatsu hangat berwarna lavender.');
          break;
        case 'read_book':
          openBookReaderModal();
          break;
        case 'drink_tea':
          showToast('🍵 Menghirup aroma teh hangat... pikiran menjadi tenang dan segar.');
          break;
        case 'toggle_decor':
          toggleDecorMode();
          break;
        case 'open_cooking':
          openCookingModal();
          break;
        case 'sleep_futon':
          triggerSleepCycle();
          break;
        case 'open_wardrobe':
          openWardrobeModal();
          break;
        case 'open_archive_photos':
          openArchiveModal('photos');
          break;
        case 'open_archive_art':
          openArchiveModal('art');
          break;
        case 'open_archive_journal':
          openArchiveModal('journal');
          break;
        case 'open_archive_fish':
          openArchiveModal('fish');
          break;
        case 'engawa_breeze':
          showToast('🍃 Hembusan angin sejuk menerbangkan dedaunan sakura di beranda.');
          break;
        case 'attic_skylight':
          showToast('🌌 Langit malam dan gugusan rasi bintang berpendar di atas loteng.');
          break;
      }
    });
  });

  return {
    openResidence,
    closeResidence,
    switchRoom,
    applyWeather,
    applySymaOutfit,
    openCookingModal,
    openWardrobeModal,
    openArchiveModal,
    openWindChimeModal,
    openBookReaderModal,
    triggerSleepCycle,
    toggleDecorMode,
    getCurrentRoom: () => currentRoom,
    getCurrentWeather: () => currentWeather,
    getCurrentOutfit: () => currentOutfit
  };
}

