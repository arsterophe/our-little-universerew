/**
 * THE PINWHEEL HAVEN — VIEW CONTROLLER (SYMA ☁️ | UNIVERSE PINWHEEL)
 * 2D Interactive Simulation Game Loop, Obstacle Collision, Proximity Hotspots,
 * Audio Synthesizers, Cooking System, Gardening, Letters Archive, and Atmosphere Engine.
 * =============================================================================
 */

import {
  PINWHEEL_HAVEN_CHARACTER,
  PINWHEEL_HAVEN_ROOMS,
  PINWHEEL_HAVEN_RECIPES,
  PINWHEEL_HAVEN_FLORA,
  PINWHEEL_HAVEN_LETTERS,
  PINWHEEL_HAVEN_COLLECTIBLES,
  PINWHEEL_HAVEN_TASKS,
  PINWHEEL_HAVEN_ATMOSPHERES,
  loadPinwheelHavenState,
  savePinwheelHavenState,
  resetPinwheelHavenState,
  playPinwheelPianoNote,
  playSkyWindChime,
  playCloudHarpZen,
  playTeapotSimmer
} from './pinwheel_haven_state.js';

export function initPinwheelHavenView(options = {}) {
  const { onShowToast, onTriggerSparkle, onNavigateBack } = options;

  let activeAuthUser = null;
  let currentState = loadPinwheelHavenState('syma');
  let currentRoom = PINWHEEL_HAVEN_ROOMS[0]; // 'living'
  let playerX = 50;
  let playerY = 72;
  let isMoving = false;
  let facingLeft = false;
  let activeNearbyHotspot = null;
  let gameLoopAnimId = null;
  const keysPressed = {};

  // DOM Elements
  const viewSection = document.getElementById('view-pinwheel-haven');
  const stageEl = document.getElementById('haven-stage');
  const bgImgEl = document.getElementById('haven-bg-img');
  const playerEl = document.getElementById('haven-player-avatar');
  const promptEl = document.getElementById('haven-interaction-prompt');
  const hotspotsContainer = document.getElementById('haven-hotspots-container');
  const bottomBarEl = document.getElementById('haven-bottom-status');
  const btnBack = document.getElementById('btn-haven-back');
  const titleRoomEl = document.getElementById('haven-room-title');
  const titleSubtitleEl = document.getElementById('haven-room-subtitle');
  const navPillsContainer = document.getElementById('haven-nav-pills');

  // Quick Tools
  const btnToolAtmo = document.getElementById('btn-haven-tool-atmo');
  const btnToolTasks = document.getElementById('btn-haven-tool-tasks');
  const btnToolPinwheels = document.getElementById('btn-haven-tool-pinwheels');

  // Modals & Overlays
  const modalOverlay = document.getElementById('haven-modal-overlay');
  const modalTitle = document.getElementById('haven-modal-title');
  const modalBody = document.getElementById('haven-modal-body');
  const btnModalClose = document.getElementById('btn-haven-modal-close');
  const sleepOverlay = document.getElementById('haven-sleep-overlay');

  /* ==========================================================================
     1. ROOM SWITCHING & RENDERING
     ========================================================================== */
  function renderRoom(roomId, repositionPlayer = true) {
    const foundRoom = PINWHEEL_HAVEN_ROOMS.find(r => r.id === roomId) || PINWHEEL_HAVEN_ROOMS[0];
    currentRoom = foundRoom;
    currentState.currentRoom = foundRoom.id;
    savePinwheelHavenState('syma', currentState);

    // Update Room Title & Subtitle
    if (titleRoomEl) titleRoomEl.textContent = foundRoom.name;
    if (titleSubtitleEl) titleSubtitleEl.textContent = foundRoom.subtitle;

    // Update Background Art
    if (bgImgEl) {
      bgImgEl.style.opacity = '0.3';
      const img = new Image();
      img.onload = () => {
        bgImgEl.src = foundRoom.bgImage;
        bgImgEl.style.opacity = '1';
      };
      img.onerror = () => {
        bgImgEl.src = foundRoom.bgImage;
        bgImgEl.style.opacity = '1';
      };
      img.src = foundRoom.bgImage;
    }

    // Set Spawn Coordinates
    if (repositionPlayer) {
      playerX = foundRoom.spawnX;
      playerY = foundRoom.spawnY;
      updatePlayerPosition();
    }

    // Render Room Hotspots
    renderHotspots(foundRoom.hotspots);

    // Update Navigation Pills Highlight
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.haven-nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.roomId === foundRoom.id);
      });
    }

    // Apply Atmosphere Filter
    applyAtmosphere(currentState.atmosphere || 'morning_breeze', false);
    setStatusMsg(`Memasuki ${foundRoom.name} — ${PINWHEEL_HAVEN_CHARACTER.houseName}`);
  }

  function renderHotspots(hotspots = []) {
    if (!hotspotsContainer) return;
    hotspotsContainer.innerHTML = '';

    hotspots.forEach(hs => {
      const el = document.createElement('div');
      el.className = 'haven-hotspot-item';
      el.style.left = `${hs.x}%`;
      el.style.top = `${hs.y}%`;
      el.dataset.hotspotId = hs.id;
      el.innerHTML = `
        <div class="haven-hotspot-beacon" aria-hidden="true">${hs.icon}</div>
        <div class="haven-hotspot-label">${hs.label}</div>
      `;

      el.addEventListener('click', () => {
        triggerHotspotAction(hs);
      });

      hotspotsContainer.appendChild(el);
    });
  }

  /* ==========================================================================
     2. MOVEMENT, COLLISION, & PROXIMITY DETECTION
     ========================================================================== */
  function updatePlayerPosition() {
    if (!playerEl) return;
    playerEl.style.left = `${playerX}%`;
    playerEl.style.top = `${playerY}%`;
    playerEl.classList.toggle('facing-left', facingLeft);
    playerEl.classList.toggle('is-walking', isMoving);

    checkProximityToHotspots();
  }

  function canMoveTo(newX, newY) {
    if (!currentRoom) return true;
    const b = currentRoom.bounds;
    if (newX < b.minX || newX > b.maxX || newY < b.minY || newY > b.maxY) {
      return false;
    }
    for (const obs of currentRoom.obstacles) {
      if (newX >= obs.minX && newX <= obs.maxX && newY >= obs.minY && newY <= obs.maxY) {
        return false;
      }
    }
    return true;
  }

  function checkProximityToHotspots() {
    if (!currentRoom || !currentRoom.hotspots) return;
    const PROXIMITY_RADIUS = 7.5; // percentage radius
    let closest = null;
    let minDist = Infinity;

    for (const hs of currentRoom.hotspots) {
      const dist = Math.hypot(playerX - hs.x, playerY - hs.y);
      if (dist <= PROXIMITY_RADIUS && dist < minDist) {
        minDist = dist;
        closest = hs;
      }
    }

    activeNearbyHotspot = closest;

    if (promptEl) {
      if (closest) {
        promptEl.textContent = closest.prompt || `✦ [E] ${closest.label}`;
        promptEl.classList.add('visible');
      } else {
        promptEl.classList.remove('visible');
      }
    }
  }

  function gameLoop() {
    let dx = 0;
    let dy = 0;
    const speed = 0.55;

    if (keysPressed['KeyW'] || keysPressed['ArrowUp']) dy -= speed;
    if (keysPressed['KeyS'] || keysPressed['ArrowDown']) dy += speed;
    if (keysPressed['KeyA'] || keysPressed['ArrowLeft']) {
      dx -= speed;
      facingLeft = true;
    }
    if (keysPressed['KeyD'] || keysPressed['ArrowRight']) {
      dx += speed;
      facingLeft = false;
    }

    if (dx !== 0 || dy !== 0) {
      isMoving = true;
      const targetX = playerX + dx;
      const targetY = playerY + dy;

      if (canMoveTo(targetX, targetY)) {
        playerX = targetX;
        playerY = targetY;
      } else if (canMoveTo(targetX, playerY)) {
        playerX = targetX;
      } else if (canMoveTo(playerX, targetY)) {
        playerY = targetY;
      }
      updatePlayerPosition();
    } else {
      if (isMoving) {
        isMoving = false;
        updatePlayerPosition();
      }
    }

    gameLoopAnimId = requestAnimationFrame(gameLoop);
  }

  /* ==========================================================================
     3. INTERACTIVE HOTSPOT ACTIONS
     ========================================================================== */
  function triggerHotspotAction(hs) {
    if (!hs) return;

    // A. Room Transitions
    if (hs.action === 'goto_bedroom') {
      renderRoom('bedroom', true);
      playSkyWindChime();
      return;
    }
    if (hs.action === 'goto_kitchen') {
      renderRoom('kitchen', true);
      playSkyWindChime();
      return;
    }
    if (hs.action === 'goto_conservatory') {
      renderRoom('conservatory', true);
      playSkyWindChime();
      return;
    }
    if (hs.action === 'goto_attic') {
      renderRoom('attic', true);
      playSkyWindChime();
      return;
    }
    if (hs.action === 'goto_living') {
      renderRoom('living', true);
      playSkyWindChime();
      return;
    }

    // B. Living Room Actions
    if (hs.action === 'sit_sofa') {
      playerEl?.classList.add('is-sitting');
      playCloudHarpZen();
      openModal(
        '🛋️ Sofa Empuk Cloud White & Powder Blue',
        `
        <div style="text-align:center; padding:10px 0;">
          <p style="font-size:0.92rem; color:#bae6fd; line-height:1.6; margin-bottom:14px;">
            "Sofa ini empuk sekali seperti berbaring di atas gumpalan awan. Dari sini terdengar suara kincir angin berputar lembut di luar jendela."
          </p>
          <div style="display:flex; justify-content:center; gap:10px;">
            <button type="button" id="btn-haven-sofa-relax" class="haven-nav-btn active" style="padding:8px 16px;">
              ☕ Santai & Tarik Napas Tenang
            </button>
          </div>
        </div>
        `
      );
      document.getElementById('btn-haven-sofa-relax')?.addEventListener('click', () => {
        closeModal();
        setStatusMsg('Syma beristirahat sejenak, melepas penat diiringi semilir angin...');
        if (onShowToast) onShowToast('☁️ Kehangatan sofa awan membuat suasana hati begitu damai.');
      });
      return;
    }

    if (hs.action === 'play_piano') {
      openPianoModal();
      return;
    }

    if (hs.action === 'sip_tea') {
      playTeapotSimmer();
      openModal(
        '☕ Meja Kopi Awan & Teh Bunga Langit',
        `
        <div style="text-align:center; padding:10px 0;">
          <p style="font-size:0.9rem; color:#f0f9ff; line-height:1.6; margin-bottom:12px;">
            "Secangkir teh bunga melati hangat dengan aroma madu pegunungan mengepul di atas cangkir porselen putih."
          </p>
          <button type="button" id="btn-haven-drink-tea" class="haven-nav-btn active" style="padding:8px 16px;">
            🍵 Minum Teh Bunga Hangat
          </button>
        </div>
        `
      );
      document.getElementById('btn-haven-drink-tea')?.addEventListener('click', () => {
        closeModal();
        playTeapotSimmer();
        completeTask('task_tea');
        setStatusMsg('Menikmati teh bunga langit hangat... Pikiran terasa tenang dan jernih.');
        if (onShowToast) onShowToast('🍵 Aroma melati menenangkan hati Syma.');
      });
      return;
    }

    if (hs.action === 'read_book') {
      openModal(
        '📚 Rak Buku Putih & Dongeng Negeri Awan',
        `
        <div style="padding:10px 0;">
          <h4 style="margin:0 0 8px 0; color:#38bdf8; font-size:0.95rem;">Koleksi Buku & Manuskrip Angin</h4>
          <p style="color:#bae6fd; font-size:0.85rem; line-height:1.5;">
            Rak buku putih ini dipenuhi kisah petualangan di atas awan, peta bintang rasi rubah, dan puisi tentang angin persahabatan dari seluruh semesta.
          </p>
          <div style="background:rgba(56,189,248,0.1); border:1px solid rgba(186,230,253,0.3); padding:12px; border-radius:12px; margin-top:10px;">
            <p style="margin:0; font-style:italic; font-size:0.8rem; color:#f8fafc;">
              "Kemanapun angin berhembus, di sanalah ada cerita baru yang menanti." — Syma ☁️
            </p>
          </div>
        </div>
        `
      );
      return;
    }

    if (hs.action === 'gaze_clouds') {
      completeTask('task_clouds');
      playSkyWindChime();
      openModal(
        '🪟 Jendela Panorama Pulau Awan Melayang',
        `
        <div style="text-align:center; padding:10px 0;">
          <p style="font-size:0.92rem; color:#f0f9ff; line-height:1.6; margin-bottom:14px;">
            "Dari jendela lengkung ini, terlihat pulau-pulau awan berarak pelan di bawah sinar mentari. Kincir angin raksasa di kejauhan berputar anggun menjaga ritme semesta."
          </p>
          <button type="button" id="btn-haven-clouds-deep" class="haven-nav-btn active" style="padding:8px 16px;">
            ✨ Renungkan Keindahan Langit
          </button>
        </div>
        `
      );
      document.getElementById('btn-haven-clouds-deep')?.addEventListener('click', () => {
        closeModal();
        setStatusMsg('Menatap langit biru dan formasi awan yang tenang...');
        if (onShowToast) onShowToast('☁️ Syma tersenyum menatap keindahan langit PINWHEEL.');
      });
      return;
    }

    if (hs.action === 'enjoy_breeze') {
      completeTask('task_balcony');
      playSkyWindChime();
      setStatusMsg('Melangkah ke beranda, menyambut semilir angin sepoi-sepoi...');
      if (onShowToast) onShowToast('🎐 Angin sejuk membelai lembut, membunyikan lonceng perak.');
      return;
    }

    // C. Bedroom Actions
    if (hs.action === 'sleep_bed') {
      triggerBedtimeRest();
      return;
    }

    if (hs.action === 'open_wardrobe') {
      openWardrobeModal();
      return;
    }

    if (hs.action === 'vanity_mirror') {
      openModal(
        '🪞 Meja Rias Lampu Bintang & Cermin',
        `
        <div style="text-align:center; padding:10px 0;">
          <p style="font-size:0.9rem; color:#bae6fd; line-height:1.6; margin-bottom:12px;">
            "Cermin bundar berhiaskan peri lampu berkilau lembut. Di sampingnya terdapat sisir kayu berukir pita kincir angin dan parfum aroma lavender segar."
          </p>
          <button type="button" id="btn-haven-groom" class="haven-nav-btn active" style="padding:8px 16px;">
            🌸 Rapikan Rambut & Pita Kincir
          </button>
        </div>
        `
      );
      document.getElementById('btn-haven-groom')?.addEventListener('click', () => {
        closeModal();
        playCloudHarpZen();
        setStatusMsg('Syma merapikan pita kincir angin dan siap menyambut hari cerah!');
        if (onShowToast) onShowToast('✨ Penampilan Syma tampak begitu segar dan anggun!');
      });
      return;
    }

    if (hs.action === 'bedside_journal') {
      openModal(
        '📖 Meja Samping Lampu Awan & Jurnal',
        `
        <div style="padding:10px 0;">
          <h4 style="margin:0 0 8px 0; color:#38bdf8; font-size:0.95rem;">Catatan Harian Syma</h4>
          <textarea id="haven-bedside-text" style="width:100%; height:90px; background:rgba(7,17,30,0.8); border:1px solid rgba(186,230,253,0.3); border-radius:10px; color:#f8fafc; padding:8px; font-family:inherit; font-size:0.82rem; resize:none;" placeholder="Tuliskan harapan atau doa malam ini...">${currentState.journalEntries[0]?.content || ''}</textarea>
          <div style="display:flex; justify-content:flex-end; margin-top:8px;">
            <button type="button" id="btn-haven-save-bedside" class="haven-nav-btn active" style="padding:6px 14px;">
              💾 Simpan Catatan
            </button>
          </div>
        </div>
        `
      );
      document.getElementById('btn-haven-save-bedside')?.addEventListener('click', () => {
        const text = document.getElementById('haven-bedside-text')?.value;
        if (text) {
          currentState.journalEntries[0].content = text;
          savePinwheelHavenState('syma', currentState);
          closeModal();
          setStatusMsg('Catatan harian berhasil disimpan ke jurnal samping tempat tidur.');
          if (onShowToast) onShowToast('📝 Jurnal kamar tidur Syma diperbarui.');
        }
      });
      return;
    }

    if (hs.action === 'balcony_view') {
      completeTask('task_balcony');
      playSkyWindChime();
      openModal(
        '🌸 Balkon Pribadi & Pemandangan Samudra Awan',
        `
        <div style="text-align:center; padding:10px 0;">
          <p style="font-size:0.9rem; color:#bae6fd; line-height:1.6; margin-bottom:12px;">
            "Dari balkon kayu kamar tidur, udara sejuk menyegarkan tercium harum dari pot-pot bunga wisteria dan petunia yang bergoyang lembut."
          </p>
          <button type="button" id="btn-haven-balcony-breathe" class="haven-nav-btn active" style="padding:8px 16px;">
            🎐 Hirup Udara Sejuk Awan
          </button>
        </div>
        `
      );
      document.getElementById('btn-haven-balcony-breathe')?.addEventListener('click', () => {
        closeModal();
        setStatusMsg('Menghirup udara pagi yang segar di balkon awan...');
        if (onShowToast) onShowToast('☁️ Hati Syma dipenuhi rasa damai dan syukur.');
      });
      return;
    }

    // D. Kitchen Actions
    if (hs.action === 'cook_stove' || hs.action === 'prep_food') {
      openKitchenModal();
      return;
    }

    if (hs.action === 'open_fridge') {
      openFridgeModal();
      return;
    }

    if (hs.action === 'dine_table') {
      openModal(
        '🪑 Meja Makan Kayu Dekat Jendela Berangin',
        `
        <div style="text-align:center; padding:10px 0;">
          <p style="font-size:0.9rem; color:#bae6fd; line-height:1.6; margin-bottom:14px;">
            "Meja makan kayu beralaskan taplak renda putih bersih. Cahaya pagi menyinari piring keramik pastel dan cangkir teh."
          </p>
          <button type="button" id="btn-haven-dine-enjoy" class="haven-nav-btn active" style="padding:8px 16px;">
            🥞 Santap Hidangan Souffle Awan
          </button>
        </div>
        `
      );
      document.getElementById('btn-haven-dine-enjoy')?.addEventListener('click', () => {
        closeModal();
        playCloudHarpZen();
        setStatusMsg('Menikmati santapan sarapan manis sambil memandangi awan...');
        if (onShowToast) onShowToast('🥞 Sarapan lezat memberi energi hangat untuk Syma!');
      });
      return;
    }

    if (hs.action === 'inspect_pantry') {
      openModal(
        '🍯 Lemari Madu Lavender & Teh Pinwheel',
        `
        <div style="padding:10px 0;">
          <h4 style="margin:0 0 8px 0; color:#38bdf8; font-size:0.95rem;">Persediaan Rempah & Madu Alami</h4>
          <p style="color:#bae6fd; font-size:0.85rem; line-height:1.5;">
            Toples kaca tersusun rapi berisi madu bunga lavender liar, daun teh pegunungan pinwheel, kayu manis manis, dan gula kristal salju.
          </p>
          <div style="display:flex; gap:8px; margin-top:12px;">
            <span style="background:rgba(56,189,248,0.15); border:1px solid rgba(186,230,253,0.3); padding:4px 10px; border-radius:12px; font-size:0.75rem;">🍯 Madu Lavender: 5 Botol</span>
            <span style="background:rgba(56,189,248,0.15); border:1px solid rgba(186,230,253,0.3); padding:4px 10px; border-radius:12px; font-size:0.75rem;">🍃 Daun Teh: 6 Kantung</span>
          </div>
        </div>
        `
      );
      return;
    }

    // E. Conservatory Actions
    if (hs.action.startsWith('garden_plot_')) {
      const slotIndex = parseInt(hs.action.replace('garden_plot_', ''), 10) - 1;
      openGardeningModal(slotIndex);
      return;
    }

    if (hs.action === 'fill_water') {
      playTeapotSimmer();
      setStatusMsg('Mengambil air embun pagi murni dari kendi perak...');
      if (onShowToast) onShowToast('💧 Kaleng penyiram terisi air embun pagi yang jernih!');
      return;
    }

    if (hs.action === 'rest_bench') {
      playerEl?.classList.add('is-sitting');
      playCloudHarpZen();
      openModal(
        '🪑 Bangku Taman Putih Menghadap Samudra Awan',
        `
        <div style="text-align:center; padding:10px 0;">
          <p style="font-size:0.9rem; color:#bae6fd; line-height:1.6; margin-bottom:12px;">
            "Duduk di bangku taman putih ini dikelilingi harum semerbak bunga wisteria dan petunia awan. Kupu-kupu pastel terbang melintas di hadapanmu."
          </p>
          <button type="button" id="btn-haven-bench-breathe" class="haven-nav-btn active" style="padding:8px 16px;">
            ✨ Nikmati Momen Damai
          </button>
        </div>
        `
      );
      document.getElementById('btn-haven-bench-breathe')?.addEventListener('click', () => {
        closeModal();
        setStatusMsg('Berdiam menikmati kedamaian taman bunga langit...');
        if (onShowToast) onShowToast('🌸 Jiwa Syma disegarkan oleh keharuman bunga langit.');
      });
      return;
    }

    if (hs.action === 'spin_windmill') {
      playSkyWindChime();
      setStatusMsg('Memutar kincir angin mini... Desirannya membawa melodi angin yang riang!');
      if (onShowToast) onShowToast('🎐 Kincir angin mini berputar cepat, menyebarkan serbuk cahaya.');
      return;
    }

    // F. Memory Attic Actions
    if (hs.action === 'read_letters') {
      openLettersModal();
      return;
    }

    if (hs.action === 'write_scrapbook') {
      openModal(
        '🪶 Meja Menulis Scrapbook & Jurnal Pena Bulu',
        `
        <div style="padding:10px 0;">
          <h4 style="margin:0 0 8px 0; color:#38bdf8; font-size:0.95rem;">Buku Scrapbook Kenangan Langit</h4>
          <p style="color:#bae6fd; font-size:0.85rem; line-height:1.5;">
            Buku bersampul linen biru pastel dengan foto-foto Polaroid, potongan pita kincir angin, dan daun-daun kering persahabatan dari seluruh 8 universe.
          </p>
          <button type="button" id="btn-haven-add-scrapbook" class="haven-nav-btn active" style="padding:8px 16px; margin-top:8px;">
            ✨ Tambahkan Momen Persahabatan Baru
          </button>
        </div>
        `
      );
      document.getElementById('btn-haven-add-scrapbook')?.addEventListener('click', () => {
        closeModal();
        playCloudHarpZen();
        setStatusMsg('Menempelkan kenangan baru ke dalam scrapbook...');
        if (onShowToast) onShowToast('📖 Halaman scrapbook bertambah dengan cerita persahabatan!');
      });
      return;
    }

    if (hs.action === 'view_pinwheel_collection') {
      openPinwheelCollectionModal();
      return;
    }

    if (hs.action === 'open_keepsake') {
      openModal(
        '🧳 Peti Koper Kenangan & Album Foto Nostalgia',
        `
        <div style="padding:10px 0;">
          <h4 style="margin:0 0 8px 0; color:#38bdf8; font-size:0.95rem;">Harta Karun Emosional Syma</h4>
          <p style="color:#bae6fd; font-size:0.85rem; line-height:1.5;">
            Di dalam koper kulit tua tersimpan jubah miko pertamanya, pita kincir perak, kristal embun pertama, dan foto kebersamaan dengan sahabat-sahabat OLU.
          </p>
          <div style="background:rgba(56,189,248,0.1); border:1px solid rgba(186,230,253,0.3); padding:10px; border-radius:12px; margin-top:10px; font-size:0.8rem; color:#f0f9ff;">
            📷 <em>"Setiap lembar foto adalah bukti bahwa jarak antar-planet tak pernah memudarkan rasa sayang kita."</em>
          </div>
        </div>
        `
      );
      return;
    }

    if (hs.action === 'gaze_sunbeam') {
      playCloudHarpZen();
      openModal(
        '☀️ Jendela Kaca Patri Bundar & Berkas Cahaya Mentari',
        `
        <div style="text-align:center; padding:10px 0;">
          <p style="font-size:0.9rem; color:#bae6fd; line-height:1.6; margin-bottom:12px;">
            "Sinar matahari menembus kaca patri bundar, membiaskan spektrum pelangi pastel di lantai kayu loteng yang hangat."
          </p>
          <button type="button" id="btn-haven-bask-sun" class="haven-nav-btn active" style="padding:8px 16px;">
            🌈 Mandi Cahaya Pelangi Mentari
          </button>
        </div>
        `
      );
      document.getElementById('btn-haven-bask-sun')?.addEventListener('click', () => {
        closeModal();
        setStatusMsg('Menikmati hangatnya berkas sinar mentari di lantai loteng...');
        if (onShowToast) onShowToast('☀️ Tubuh dan hati Syma terasa hangat dan bersemangat.');
      });
      return;
    }
  }

  /* ==========================================================================
     4. SPECIALIZED MODAL HANDLERS
     ========================================================================== */

  // A. Grand Star Piano Sonata
  function openPianoModal() {
    completeTask('task_piano');
    const notes = [
      { key: 'C4', name: 'Do', freq: 261.63 },
      { key: 'D4', name: 'Re', freq: 293.66 },
      { key: 'E4', name: 'Mi', freq: 329.63 },
      { key: 'F4', name: 'Fa', freq: 349.23 },
      { key: 'G4', name: 'Sol', freq: 392.00 },
      { key: 'A4', name: 'La', freq: 440.00 },
      { key: 'B4', name: 'Si', freq: 493.88 },
      { key: 'C5', name: 'Do High', freq: 523.25 }
    ];

    const keysHtml = notes.map(n => `
      <button type="button" class="haven-nav-btn haven-piano-key" data-freq="${n.freq}" style="flex:1; padding:22px 6px; background:linear-gradient(180deg, #ffffff, #e0f2fe); border:1px solid #bae6fd; color:#0369a1; font-weight:700; border-radius:8px; box-shadow:0 3px 6px rgba(0,0,0,0.2);">
        ${n.name}<br><small style="font-size:0.65rem; color:#64748b;">${n.key}</small>
      </button>
    `).join('');

    openModal(
      '🎹 Piano Putih dengan Detail Bintang',
      `
      <div style="padding:10px 0;">
        <p style="color:#bae6fd; font-size:0.85rem; margin-bottom:14px; text-align:center;">
          Tekan tuts piano untuk memainkan melodi senandung langit di atas awan.
        </p>
        <div style="display:flex; gap:6px; margin-bottom:18px;">
          ${keysHtml}
        </div>
        <div style="text-align:center;">
          <button type="button" id="btn-haven-auto-melody" class="haven-nav-btn active" style="padding:8px 20px; display:inline-flex;">
            🎶 Mainkan Lagu Angin Pinwheel (Sonata)
          </button>
        </div>
      </div>
      `
    );

    document.querySelectorAll('.haven-piano-key').forEach(btn => {
      btn.addEventListener('click', () => {
        const freq = parseFloat(btn.dataset.freq);
        playPinwheelPianoNote(freq);
        btn.style.transform = 'translateY(3px)';
        setTimeout(() => { btn.style.transform = ''; }, 120);
      });
    });

    document.getElementById('btn-haven-auto-melody')?.addEventListener('click', () => {
      const melody = [392.0, 440.0, 523.25, 440.0, 392.0, 329.63, 349.23, 392.0];
      melody.forEach((f, idx) => {
        setTimeout(() => {
          playPinwheelPianoNote(f);
        }, idx * 260);
      });
      setStatusMsg('Melodi merdu lagu kincir angin bergema di Cloud Nine Living Room...');
    });
  }

  // B. Sky Kitchen Cooking Minigame
  function openKitchenModal() {
    const recipesHtml = PINWHEEL_HAVEN_RECIPES.map(r => `
      <div class="haven-recipe-card" data-recipe-id="${r.id}" style="padding:12px; background:rgba(14,165,233,0.1); border:1px solid rgba(186,230,253,0.3); border-radius:12px; margin-bottom:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">${r.name}</h4>
          <p style="margin:3px 0 0 0; font-size:0.75rem; color:#bae6fd;">${r.desc}</p>
          <div style="margin-top:4px; font-size:0.7rem; color:#fde047;">Bahan: ${r.ingredients.join(', ')}</div>
        </div>
        <button type="button" class="haven-nav-btn active haven-cook-btn" data-recipe-id="${r.id}" style="padding:6px 14px; white-space:nowrap;">
          🍳 Masak (${r.timeSeconds}s)
        </button>
      </div>
    `).join('');

    openModal(
      '🍳 Sky Kitchen — Dapur Jamuan Langit',
      `
      <div style="padding:10px 0;">
        <p style="color:#bae6fd; font-size:0.85rem; margin-bottom:12px;">
          Pilih resep kue dan minuman khas langit untuk disajikan:
        </p>
        <div id="haven-recipes-list">
          ${recipesHtml}
        </div>
      </div>
      `
    );

    document.querySelectorAll('.haven-cook-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rId = btn.dataset.recipeId;
        const recipe = PINWHEEL_HAVEN_RECIPES.find(r => r.id === rId);
        if (!recipe) return;

        playTeapotSimmer();
        btn.textContent = '⏳ Memasak...';
        btn.disabled = true;

        setTimeout(() => {
          playSkyWindChime();
          if (!currentState.cookedDishes.includes(rId)) {
            currentState.cookedDishes.push(rId);
          }
          currentState.stats.dishesCooked = (currentState.stats.dishesCooked || 0) + 1;
          savePinwheelHavenState('syma', currentState);
          closeModal();
          setStatusMsg(`✨ Berhasil memasak ${recipe.name}! Aroma lezat memenuhi dapur.`);
          if (onShowToast) onShowToast(`🥞 Hidangan ${recipe.name} siap dinikmati! (+${recipe.rewardXp} XP)`);
        }, recipe.timeSeconds * 1000);
      });
    });
  }

  // C. Sky Fridge Modal
  function openFridgeModal() {
    const invHtml = currentState.inventory.map(item => `
      <div style="padding:10px; background:rgba(12,24,43,0.7); border:1px solid rgba(186,230,253,0.25); border-radius:10px; display:flex; align-items:center; gap:8px;">
        <span style="font-size:1.3rem;">${item.icon}</span>
        <div>
          <div style="font-size:0.82rem; font-weight:700; color:#ffffff;">${item.name}</div>
          <div style="font-size:0.72rem; color:#bae6fd;">Jumlah: ${item.count} buah</div>
        </div>
      </div>
    `).join('');

    openModal(
      '🧊 Kulkas Biru Langit Retro & Magnet Kincir',
      `
      <div style="padding:10px 0;">
        <p style="color:#bae6fd; font-size:0.85rem; margin-bottom:12px;">
          Bahan makanan segar yang tersimpan sejuk di dalam kulkas:
        </p>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          ${invHtml}
        </div>
      </div>
      `
    );
  }

  // D. Floating Conservatory Gardening
  function openGardeningModal(slotIndex = 0) {
    completeTask('task_garden');
    const slot = currentState.gardenSlots[slotIndex] || currentState.gardenSlots[0];
    const flora = PINWHEEL_HAVEN_FLORA.find(f => f.id === slot.seedId) || PINWHEEL_HAVEN_FLORA[0];

    openModal(
      `🌿 Floating Conservatory — Petak Bunga (Slot ${slot.slotId})`,
      `
      <div style="text-align:center; padding:10px 0;">
        <div style="font-size:3rem; margin-bottom:8px;">
          ${slot.stage === 'blooming' ? flora.bloomIcon : (slot.stage === 'growing' ? '🌱' : '🌰')}
        </div>
        <h4 style="margin:0 0 4px 0; color:#38bdf8; font-size:1rem;">${flora.name}</h4>
        <p style="color:#bae6fd; font-size:0.82rem; margin:0 0 12px 0;">${flora.desc}</p>
        <div style="display:flex; justify-content:center; gap:8px; margin-bottom:16px;">
          <span style="background:rgba(56,189,248,0.15); border:1px solid rgba(186,230,253,0.3); padding:4px 10px; border-radius:12px; font-size:0.72rem;">Status: ${slot.stage.toUpperCase()}</span>
          <span style="background:rgba(56,189,248,0.15); border:1px solid rgba(186,230,253,0.3); padding:4px 10px; border-radius:12px; font-size:0.72rem;">Disiram: ${slot.watered ? 'Ya 💧' : 'Belum 🍂'}</span>
        </div>
        <div style="display:flex; justify-content:center; gap:10px;">
          <button type="button" id="btn-haven-water" class="haven-nav-btn active" style="padding:8px 16px;">
            💧 Siram Tanaman
          </button>
          ${slot.stage === 'blooming' ? `
            <button type="button" id="btn-haven-harvest" class="haven-nav-btn active" style="padding:8px 16px; background:linear-gradient(135deg, #10b981, #059669); border-color:#6ee7b7;">
              🌸 Panen Bunga Langit
            </button>
          ` : ''}
        </div>
      </div>
      `
    );

    document.getElementById('btn-haven-water')?.addEventListener('click', () => {
      slot.watered = true;
      if (slot.stage === 'seed') slot.stage = 'growing';
      else if (slot.stage === 'growing') slot.stage = 'blooming';
      savePinwheelHavenState('syma', currentState);
      playTeapotSimmer();
      closeModal();
      setStatusMsg(`Menyiram ${flora.name} dengan air embun sejuk. Bunga tumbuh subur!`);
      if (onShowToast) onShowToast(`💧 ${flora.name} telah disiram dan berkembang!`);
    });

    document.getElementById('btn-haven-harvest')?.addEventListener('click', () => {
      slot.stage = 'seed';
      slot.watered = false;
      currentState.stats.flowersHarvested = (currentState.stats.flowersHarvested || 0) + 1;
      savePinwheelHavenState('syma', currentState);
      playSkyWindChime();
      closeModal();
      setStatusMsg(`Berhasil memanen ${flora.yieldItem}! Harumnya menyegarkan.`);
      if (onShowToast) onShowToast(`🌸 Panen ${flora.yieldItem} berhasil!`);
    });
  }

  // E. Friendship Letters Archive Modal
  function openLettersModal() {
    completeTask('task_letter');
    const lettersHtml = PINWHEEL_HAVEN_LETTERS.map(l => `
      <div class="haven-letter-card" data-letter-id="${l.id}" style="padding:12px; background:rgba(12,24,43,0.75); border:1px solid rgba(186,230,253,0.3); border-radius:12px; margin-bottom:10px; cursor:pointer;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <span style="font-size:0.88rem; font-weight:700; color:#ffffff;">${l.icon} Dari: ${l.sender}</span>
          <span style="font-size:0.72rem; color:#bae6fd;">${l.universe} • ${l.date}</span>
        </div>
        <p style="margin:0; font-size:0.78rem; color:#cbd5e1; line-height:1.4;">${l.excerpt}</p>
      </div>
    `).join('');

    openModal(
      '💌 Arsip Surat Sahabat di Atas Awan',
      `
      <div style="padding:10px 0;">
        <p style="color:#bae6fd; font-size:0.85rem; margin-bottom:12px;">
          Pilih surat untuk membaca pesan penuh kehangatan dari para sahabat:
        </p>
        <div id="haven-letters-list">
          ${lettersHtml}
        </div>
      </div>
      `
    );

    document.querySelectorAll('.haven-letter-card').forEach(card => {
      card.addEventListener('click', () => {
        const lId = card.dataset.letterId;
        const letter = PINWHEEL_HAVEN_LETTERS.find(l => l.id === lId);
        if (!letter) return;
        playCloudHarpZen();
        openModal(
          `💌 Surat dari ${letter.sender} (${letter.universe})`,
          `
          <div style="padding:10px 0;">
            <div style="font-size:0.75rem; color:#bae6fd; margin-bottom:8px;">Dikirim pada: ${letter.date}</div>
            <div style="background:rgba(7,17,30,0.8); border:1px solid rgba(186,230,253,0.3); padding:16px; border-radius:12px; font-size:0.84rem; color:#f8fafc; line-height:1.6; white-space:pre-wrap;">
              ${letter.fullLetter}
            </div>
            <div style="display:flex; justify-content:center; margin-top:14px;">
              <button type="button" id="btn-haven-back-letters" class="haven-nav-btn active" style="padding:6px 16px;">
                ← Kembali ke Daftar Surat
              </button>
            </div>
          </div>
          `
        );
        document.getElementById('btn-haven-back-letters')?.addEventListener('click', openLettersModal);
      });
    });
  }

  // F. Wardrobe Styling Modal
  function openWardrobeModal() {
    const outfits = [
      { id: 'sacred_miko', name: 'Sacred Kitsune Shrine Robe', desc: 'Jubah putih suci dan lavender lembut berhias pita kincir angin dan sulaman perak.', icon: '👘' },
      { id: 'wind_wanderer', name: 'Moonlit Pinwheel Adventurer', desc: 'Pakaian pengembara berangin dengan syal berenda lavender dan bros kincir perak.', icon: '🧣' },
      { id: 'celestial_dreamer', name: 'Star Blossom Kimono', desc: 'Yukata sutra malam midnight blue dan lavender halus bermotif rasi bintang.', icon: '✨' }
    ];

    const outfitsHtml = outfits.map(o => `
      <div style="padding:12px; background:rgba(12,24,43,0.7); border:1px solid rgba(186,230,253,0.3); border-radius:12px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">${o.icon} ${o.name}</h4>
          <p style="margin:4px 0 0 0; font-size:0.75rem; color:#bae6fd;">${o.desc}</p>
        </div>
        <button type="button" class="haven-nav-btn active haven-equip-btn" data-outfit-id="${o.id}" style="padding:6px 14px; white-space:nowrap;">
          Kenakan
        </button>
      </div>
    `).join('');

    openModal(
      '👗 Lemari Pakaian Sutra & Jubah Pinwheel',
      `
      <div style="padding:10px 0;">
        <p style="color:#bae6fd; font-size:0.85rem; margin-bottom:12px;">Pilih jubah dan busana favorit Syma:</p>
        ${outfitsHtml}
      </div>
      `
    );

    document.querySelectorAll('.haven-equip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const oId = btn.dataset.outfitId;
        const outfit = outfits.find(o => o.id === oId);
        playCloudHarpZen();
        closeModal();
        setStatusMsg(`Syma mengenakan ${outfit.name}. Tampil begitu anggun!`);
        if (onShowToast) onShowToast(`✨ Busana ${outfit.name} berhasil dikenakan!`);
      });
    });
  }

  // G. Mini Pinwheel Collectibles Modal
  function openPinwheelCollectionModal() {
    const listHtml = PINWHEEL_HAVEN_COLLECTIBLES.map(c => `
      <div style="padding:12px; background:rgba(12,24,43,0.7); border:1px solid rgba(186,230,253,0.3); border-radius:12px; margin-bottom:10px; display:flex; gap:12px; align-items:center;">
        <span style="font-size:2rem;">${c.icon}</span>
        <div>
          <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">${c.name}</h4>
          <p style="margin:3px 0 0 0; font-size:0.75rem; color:#bae6fd;">${c.desc}</p>
          <div style="margin-top:4px; font-size:0.7rem; color:${c.discovered ? '#6ee7b7' : '#94a3b8'};">
            ${c.discovered ? `✓ Ditemukan di: ${c.location}` : '🔒 Belum ditemukan (Jelajahi sudut rumah)'}
          </div>
        </div>
      </div>
    `).join('');

    openModal(
      '🎐 Koleksi Kincir Angin Mini Unik',
      `
      <div style="padding:10px 0;">
        <p style="color:#bae6fd; font-size:0.85rem; margin-bottom:12px;">
          Kincir angin pusaka yang dikumpulkan dari berbagai petualangan di atas awan:
        </p>
        ${listHtml}
      </div>
      `
    );
  }

  // H. Daily Tasks Checklist
  function openTasksModal() {
    const tasksHtml = currentState.tasks.map(t => `
      <div style="padding:10px 14px; background:rgba(12,24,43,0.7); border:1px solid rgba(186,230,253,0.25); border-radius:10px; margin-bottom:8px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span>${t.icon}</span>
          <span style="font-size:0.84rem; color:${t.completed ? '#6ee7b7' : '#f8fafc'}; ${t.completed ? 'text-decoration:line-through;' : ''}">${t.title}</span>
        </div>
        <span style="font-size:0.75rem; font-weight:700; color:#fde047;">+${t.xp} XP ${t.completed ? '✓' : ''}</span>
      </div>
    `).join('');

    openModal(
      '📋 Agenda Harian di The Pinwheel Haven',
      `
      <div style="padding:10px 0;">
        <p style="color:#bae6fd; font-size:0.85rem; margin-bottom:12px;">
          Aktivitas santai harian Syma untuk menjaga keharmonisan rumah awan:
        </p>
        ${tasksHtml}
      </div>
      `
    );
  }

  // I. Atmosphere Lighting Selection
  function openAtmosphereModal() {
    const atmoHtml = PINWHEEL_HAVEN_ATMOSPHERES.map(a => `
      <div class="haven-atmo-card" data-atmo-id="${a.id}" style="padding:12px; background:rgba(12,24,43,0.7); border:1px solid rgba(186,230,253,0.3); border-radius:12px; margin-bottom:10px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">${a.icon} ${a.name}</h4>
          <p style="margin:3px 0 0 0; font-size:0.75rem; color:#bae6fd;">${a.desc}</p>
        </div>
        <button type="button" class="haven-nav-btn active haven-atmo-btn" data-atmo-id="${a.id}" style="padding:6px 14px;">
          ${currentState.atmosphere === a.id ? 'Aktif ✓' : 'Terapkan'}
        </button>
      </div>
    `).join('');

    openModal(
      '☀️ Atmosfer & Cahaya Langit',
      `
      <div style="padding:10px 0;">
        <p style="color:#bae6fd; font-size:0.85rem; margin-bottom:12px;">Pilih nuansa pencahayaan di dalam rumah awan:</p>
        ${atmoHtml}
      </div>
      `
    );

    document.querySelectorAll('.haven-atmo-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const atmoId = btn.dataset.atmoId;
        applyAtmosphere(atmoId, true);
        closeModal();
      });
    });
  }

  function applyAtmosphere(atmoId = 'morning_breeze', notify = true) {
    const atmo = PINWHEEL_HAVEN_ATMOSPHERES.find(a => a.id === atmoId) || PINWHEEL_HAVEN_ATMOSPHERES[0];
    currentState.atmosphere = atmo.id;
    savePinwheelHavenState('syma', currentState);

    if (bgImgEl) {
      bgImgEl.style.filter = atmo.filter;
    }

    if (notify) {
      playSkyWindChime();
      setStatusMsg(`Atmosfer diubah ke: ${atmo.name}`);
      if (onShowToast) onShowToast(`☀️ Pencahayaan ${atmo.name} diterapkan.`);
    }
  }

  // J. Bedtime Sleep Routine
  function triggerBedtimeRest() {
    if (!sleepOverlay) return;
    playCloudHarpZen();
    sleepOverlay.classList.add('active');
    setStatusMsg('Syma terlelap tidur di atas awan, bermimpi indah diiringi senandung angin...');

    setTimeout(() => {
      playSkyWindChime();
      sleepOverlay.classList.remove('active');
      setStatusMsg('Syma terbangun dengan bugar dan hati yang penuh semangat baru!');
      if (onShowToast) onShowToast('☁️ Istirahat pulas memulihkan seluruh tenaga dan kebahagiaan Syma.');
    }, 2400);
  }

  // Complete a Task helper
  function completeTask(taskId) {
    const t = currentState.tasks.find(x => x.id === taskId);
    if (t && !t.completed) {
      t.completed = true;
      savePinwheelHavenState('syma', currentState);
      if (onShowToast) onShowToast(`🎉 Tugas Selesai: ${t.title}! (+${t.xp} XP)`);
    }
  }

  /* ==========================================================================
     5. MODAL UTILITIES
     ========================================================================== */
  function openModal(title, contentHtml) {
    if (modalTitle) modalTitle.innerHTML = title;
    if (modalBody) modalBody.innerHTML = contentHtml;
    if (modalOverlay) modalOverlay.classList.add('active');
  }

  function closeModal() {
    if (modalOverlay) modalOverlay.classList.remove('active');
    playerEl?.classList.remove('is-sitting');
  }

  function setStatusMsg(text) {
    if (bottomBarEl) {
      bottomBarEl.textContent = text;
    }
  }

  /* ==========================================================================
     6. EVENT BINDINGS
     ========================================================================== */
  function bindEvents() {
    // Keyboard Navigation
    window.addEventListener('keydown', (e) => {
      if (!viewSection || !viewSection.classList.contains('active')) return;
      keysPressed[e.code] = true;

      if (e.code === 'KeyE') {
        if (activeNearbyHotspot) {
          triggerHotspotAction(activeNearbyHotspot);
        }
      }

      if (e.code === 'Escape') {
        closeModal();
      }
    });

    window.addEventListener('keyup', (e) => {
      keysPressed[e.code] = false;
    });

    // Touch D-Pad for Mobile
    document.querySelectorAll('.haven-dpad-btn').forEach(btn => {
      const dir = btn.dataset.dir;
      const keyMap = { up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight' };
      const code = keyMap[dir];

      const start = (ev) => {
        ev.preventDefault();
        if (code) keysPressed[code] = true;
      };
      const end = (ev) => {
        ev.preventDefault();
        if (code) keysPressed[code] = false;
      };

      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', end);
      btn.addEventListener('mouseleave', end);
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
    });

    // Navigation Pills Click
    if (navPillsContainer) {
      navPillsContainer.querySelectorAll('.haven-nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetRoom = btn.dataset.roomId;
          if (targetRoom) renderRoom(targetRoom, true);
        });
      });
    }

    // Back to Universe PINWHEEL
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        closePinwheelHaven();
        if (typeof onNavigateBack === 'function') {
          onNavigateBack();
        }
      });
    }

    // Modal Close
    if (btnModalClose) {
      btnModalClose.addEventListener('click', closeModal);
    }
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
      });
    }

    // Quick Tool Buttons
    if (btnToolAtmo) btnToolAtmo.addEventListener('click', openAtmosphereModal);
    if (btnToolTasks) btnToolTasks.addEventListener('click', openTasksModal);
    if (btnToolPinwheels) btnToolPinwheels.addEventListener('click', openPinwheelCollectionModal);
  }

  /* ==========================================================================
     7. LIFECYCLE (OPEN / CLOSE)
     ========================================================================== */
  function openPinwheelHaven(user = null, targetRoom = 'living') {
    activeAuthUser = user;
    currentState = loadPinwheelHavenState('syma');

    if (viewSection) {
      viewSection.classList.add('active');
      viewSection.setAttribute('aria-hidden', 'false');
    }

    // Reset Player
    playerX = 50;
    playerY = 72;
    facingLeft = false;
    isMoving = false;

    renderRoom(targetRoom, true);

    if (!gameLoopAnimId) {
      gameLoopAnimId = requestAnimationFrame(gameLoop);
    }

    if (onShowToast) {
      onShowToast(`Selamat datang di ${PINWHEEL_HAVEN_CHARACTER.houseName} — ${PINWHEEL_HAVEN_CHARACTER.subtitle} ☁️`);
    }
  }

  function closePinwheelHaven() {
    closeModal();
    if (viewSection) {
      viewSection.classList.remove('active');
      viewSection.setAttribute('aria-hidden', 'true');
    }

    if (gameLoopAnimId) {
      cancelAnimationFrame(gameLoopAnimId);
      gameLoopAnimId = null;
    }

    Object.keys(keysPressed).forEach(k => delete keysPressed[k]);
  }

  // Initialize event bindings
  bindEvents();

  return {
    openPinwheelHaven,
    closePinwheelHaven,
    getCurrentState: () => currentState
  };
}
