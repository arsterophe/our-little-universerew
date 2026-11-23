/**
 * THE MOONPETAL MANOR — VIEW CONTROLLER (ROYAN 🎆 | UNIVERSE HOT)
 * 2D Interactive Simulation Game Loop, Obstacle Collision, Proximity Hotspots,
 * Audio Synthesizers, Elven Cooking, Conservatory Gardening, Letters Archive,
 * Secret Royal Amethyst Relic, and Atmosphere Engine.
 * =============================================================================
 */

import {
  MOONPETAL_MANOR_CHARACTER,
  MOONPETAL_MANOR_ROOMS,
  MOONPETAL_MANOR_RECIPES,
  MOONPETAL_MANOR_FLORA,
  MOONPETAL_MANOR_LETTERS,
  MOONPETAL_MANOR_COLLECTIBLES,
  MOONPETAL_MANOR_TASKS,
  MOONPETAL_MANOR_ATMOSPHERES,
  loadMoonpetalHavenState,
  saveMoonpetalHavenState,
  resetMoonpetalHavenState,
  playElvenPianoNote,
  playElvenHarpChime,
  playCrystalSparkle,
  playTeapotSimmer
} from './moonpetal_manor_state.js';

export function initMoonpetalManorView(options = {}) {
  const { onShowToast, onTriggerSparkle, onNavigateBack } = options;

  let activeAuthUser = null;
  let currentState = loadMoonpetalHavenState();
  let currentRoom = MOONPETAL_MANOR_ROOMS[0]; // 'living'
  let playerX = 50;
  let playerY = 72;
  let isMoving = false;
  let facingLeft = false;
  let isSitting = false;
  let activeNearbyHotspot = null;
  let gameLoopAnimId = null;
  const keysPressed = {};

  // DOM Elements
  const viewSection = document.getElementById('view-moonpetal-manor');
  const stageEl = document.getElementById('manor-stage');
  const bgImgEl = document.getElementById('manor-bg-img');
  const playerEl = document.getElementById('manor-player-avatar');
  const promptEl = document.getElementById('manor-interaction-prompt');
  const hotspotsContainer = document.getElementById('manor-hotspots-container');
  const btnBack = document.getElementById('btn-manor-back');
  const titleRoomEl = document.getElementById('manor-room-title');
  const titleSubtitleEl = document.getElementById('manor-room-subtitle');
  const navPillsContainer = document.getElementById('manor-nav-pills');

  // Quick Tools
  const btnToolAtmo = document.getElementById('btn-manor-tool-atmo');
  const btnToolTasks = document.getElementById('btn-manor-tool-tasks');
  const btnToolRelics = document.getElementById('btn-manor-tool-relics');

  // Modals & Overlays
  const modalOverlay = document.getElementById('manor-modal-overlay');
  const modalTitle = document.getElementById('manor-modal-title');
  const modalBody = document.getElementById('manor-modal-body');
  const btnModalClose = document.getElementById('btn-manor-modal-close');
  const sleepOverlay = document.getElementById('manor-sleep-overlay');

  /* ==========================================================================
     1. ROOM SWITCHING & RENDERING
     ========================================================================== */
  function renderRoom(roomId, repositionPlayer = true) {
    const foundRoom = MOONPETAL_MANOR_ROOMS.find(r => r.id === roomId) || MOONPETAL_MANOR_ROOMS[0];
    currentRoom = foundRoom;
    currentState.currentRoom = foundRoom.id;
    saveMoonpetalHavenState(currentState);

    if (bgImgEl) {
      bgImgEl.style.opacity = '0.3';
      setTimeout(() => {
        bgImgEl.src = foundRoom.bgImage;
        bgImgEl.alt = `${foundRoom.name} — Moonpetal Manor`;
        bgImgEl.style.opacity = '1';
      }, 150);
    }

    if (titleRoomEl) {
      titleRoomEl.textContent = foundRoom.name;
    }
    if (titleSubtitleEl) {
      titleSubtitleEl.textContent = foundRoom.subtitle;
    }

    if (repositionPlayer) {
      playerX = foundRoom.spawnX;
      playerY = foundRoom.spawnY;
      isSitting = false;
      updatePlayerDOM();
    }

    renderNavPills();
    renderHotspots();
    applyAtmosphere(currentState.atmosphere);
  }

  function renderNavPills() {
    if (!navPillsContainer) return;
    navPillsContainer.innerHTML = '';
    MOONPETAL_MANOR_ROOMS.forEach(r => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `manor-nav-pill ${r.id === currentRoom.id ? 'active' : ''}`;
      btn.innerHTML = `<span>${r.icon}</span><span>${r.name.replace('Enchanted ', '').replace('Moonpetal ', '').replace('The ', '')}</span>`;
      btn.title = r.name;
      btn.onclick = () => {
        playCrystalSparkle();
        renderRoom(r.id, true);
      };
      navPillsContainer.appendChild(btn);
    });
  }

  function renderHotspots() {
    if (!hotspotsContainer) return;
    hotspotsContainer.innerHTML = '';
    currentRoom.hotspots.forEach(hs => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'manor-hotspot';
      btn.style.left = `${hs.x}%`;
      btn.style.top = `${hs.y}%`;
      btn.dataset.id = hs.id;
      btn.dataset.action = hs.action;
      btn.innerHTML = `
        <div class="manor-hotspot-pin">
          <span>${hs.icon}</span>
          <div class="manor-hotspot-pulse" aria-hidden="true"></div>
        </div>
        <div class="manor-hotspot-label">${hs.label}</div>
      `;
      btn.onclick = (e) => {
        e.stopPropagation();
        triggerHotspotAction(hs);
      };
      hotspotsContainer.appendChild(btn);
    });
  }

  function applyAtmosphere(atmoId) {
    currentState.atmosphere = atmoId;
    saveMoonpetalHavenState(currentState);
    const atmo = MOONPETAL_MANOR_ATMOSPHERES.find(a => a.id === atmoId) || MOONPETAL_MANOR_ATMOSPHERES[0];
    const overlay = document.querySelector('.manor-moonbeam-overlay');
    if (overlay) {
      overlay.style.backgroundColor = atmo.tint;
    }
  }

  /* ==========================================================================
     2. 2D SIMULATION ENGINE & COLLISION DETECTION
     ========================================================================== */
  function updatePlayerDOM() {
    if (!playerEl) return;
    playerEl.style.left = `${playerX}%`;
    playerEl.style.top = `${playerY}%`;

    playerEl.classList.toggle('is-walking', isMoving);
    playerEl.classList.toggle('facing-left', facingLeft);
    playerEl.classList.toggle('is-sitting', isSitting);

    checkNearbyHotspots();
  }

  function canMoveTo(newX, newY) {
    const { bounds, obstacles } = currentRoom;
    if (newX < bounds.minX || newX > bounds.maxX || newY < bounds.minY || newY > bounds.maxY) {
      return false;
    }
    for (const obs of obstacles) {
      if (newX >= obs.minX && newX <= obs.maxX && newY >= obs.minY && newY <= obs.maxY) {
        return false;
      }
    }
    return true;
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
      isSitting = false;
      const targetX = Math.max(0, Math.min(100, playerX + dx));
      const targetY = Math.max(0, Math.min(100, playerY + dy));

      if (canMoveTo(targetX, targetY)) {
        playerX = targetX;
        playerY = targetY;
      } else if (canMoveTo(targetX, playerY)) {
        playerX = targetX;
      } else if (canMoveTo(playerX, targetY)) {
        playerY = targetY;
      }
      updatePlayerDOM();
    } else {
      if (isMoving) {
        isMoving = false;
        updatePlayerDOM();
      }
    }

    gameLoopAnimId = requestAnimationFrame(gameLoop);
  }

  function checkNearbyHotspots() {
    let nearest = null;
    let minDistance = 8.5; // Radius threshold in % coordinates

    currentRoom.hotspots.forEach(hs => {
      const dist = Math.hypot(playerX - hs.x, playerY - hs.y);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = hs;
      }
    });

    activeNearbyHotspot = nearest;

    if (promptEl) {
      if (nearest) {
        promptEl.textContent = nearest.prompt;
        promptEl.classList.add('active');
      } else {
        promptEl.classList.remove('active');
      }
    }
  }

  /* ==========================================================================
     3. INTERACTIVE HOTSPOT MODALS & ACTIONS
     ========================================================================== */
  function openModal(title, htmlContent) {
    if (!modalOverlay || !modalTitle || !modalBody) return;
    modalTitle.innerHTML = title;
    modalBody.innerHTML = htmlContent;
    modalOverlay.classList.add('active');
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
    }
  }

  function completeTask(taskId) {
    const task = currentState.tasks.find(t => t.id === taskId);
    if (task && !task.done) {
      task.done = true;
      saveMoonpetalHavenState(currentState);
      if (onShowToast) onShowToast(`✨ Tugas Harian Selesai: ${task.title}`);
      if (onTriggerSparkle) onTriggerSparkle();
    }
  }

  function triggerHotspotAction(hs) {
    if (!hs) return;

    // Room transit doorways
    if (hs.action === 'goto_bedroom') return renderRoom('bedroom', true);
    if (hs.action === 'goto_kitchen') return renderRoom('kitchen', true);
    if (hs.action === 'goto_conservatory') return renderRoom('conservatory', true);
    if (hs.action === 'goto_atelier') return renderRoom('atelier', true);
    if (hs.action === 'goto_living') return renderRoom('living', true);

    switch (hs.action) {
      case 'sit_sofa':
        isSitting = true;
        updatePlayerDOM();
        playElvenHarpChime();
        openModal('🛋️ Sofa Royal Lavender & Pearl White', `
          <p>Royan duduk bersandar dengan nyaman di atas bantalan sutra ungu yang empuk. Di hadapannya terhampar karpet bunga dan perapian kristal yang menyala lembut.</p>
          <div style="background: rgba(147, 51, 234, 0.15); border: 1px solid rgba(192, 132, 252, 0.4); border-radius: 12px; padding: 12px; margin-top: 8px;">
            <span style="font-weight:700; color:#fbbf24;">“Keheningan yang sejati bukanlah ketiadaan suara, melainkan kedamaian di mana jiwa dapat berbisik dengan tenang.”</span>
          </div>
          <div style="margin-top: 14px; display:flex; gap: 8px;">
            <button class="manor-btn-primary" id="btn-sofa-relax">Tutup Mata Sejenak 🌿</button>
          </div>
        `);
        setTimeout(() => {
          const btn = document.getElementById('btn-sofa-relax');
          if (btn) btn.onclick = () => {
            playCrystalSparkle();
            if (onShowToast) onShowToast('🍃 Royan merasa damai dan segar kembali.');
            closeModal();
          };
        }, 50);
        break;

      case 'play_piano':
        playElvenPianoNote(523.25);
        openModal('🎹 Grand Piano Putih Aksen Amethyst', `
          <p>Sentuh tuts-tuts tuts piano marmer putih berhias kristal amethyst untuk memainkan melodi harmoni hutan elf:</p>
          <div style="display:flex; justify-content:center; gap:8px; margin: 16px 0;">
            <button class="manor-btn-secondary piano-key" data-freq="261.63" style="min-width:48px; font-weight:700;">C (Do)</button>
            <button class="manor-btn-secondary piano-key" data-freq="293.66" style="min-width:48px; font-weight:700;">D (Re)</button>
            <button class="manor-btn-secondary piano-key" data-freq="329.63" style="min-width:48px; font-weight:700;">E (Mi)</button>
            <button class="manor-btn-secondary piano-key" data-freq="392.00" style="min-width:48px; font-weight:700;">G (Sol)</button>
            <button class="manor-btn-secondary piano-key" data-freq="440.00" style="min-width:48px; font-weight:700;">A (La)</button>
            <button class="manor-btn-secondary piano-key" data-freq="523.25" style="min-width:48px; font-weight:700;">C² (Do tinggi)</button>
          </div>
          <p style="font-size:0.8rem; color:#d8b4fe; text-align:center;">Melodi yang dimainkan merambat lembut menembus dahan-dahan pohon kuno di luar jendela.</p>
        `);
        completeTask('task_piano');
        setTimeout(() => {
          document.querySelectorAll('.piano-key').forEach(btn => {
            btn.onclick = () => {
              const freq = parseFloat(btn.dataset.freq);
              playElvenPianoNote(freq);
              btn.style.transform = 'scale(0.92)';
              setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
            };
          });
        }, 50);
        break;

      case 'sip_tea':
        playTeapotSimmer();
        openModal('🍵 Meja Kristal & Teh Bunga Moonpetal', `
          <p>Secangkir teh herbal yang diseduh dari kelopak bunga moonpetal segar mengepulkan aroma manis lavender dan madu hutan.</p>
          <div style="display:flex; align-items:center; gap:12px; margin-top:12px; background:rgba(255,255,255,0.06); padding:10px; border-radius:10px;">
            <span style="font-size:2rem;">🫖</span>
            <div>
              <div style="font-weight:700; color:#fbbf24;">Teh Embun Moonpetal Panas</div>
              <div style="font-size:0.8rem; color:#e2e8f0;">Menghangatkan batin & memperbarui kelembutan batin.</div>
            </div>
          </div>
          <div style="margin-top:16px;">
            <button class="manor-btn-primary" id="btn-sip-tea-now">Hirup Teh Hangat 🍵</button>
          </div>
        `);
        completeTask('task_tea');
        setTimeout(() => {
          const btn = document.getElementById('btn-sip-tea-now');
          if (btn) btn.onclick = () => {
            playCrystalSparkle();
            if (onShowToast) onShowToast('✨ Kehangatan teh Moonpetal mengalir lembut di tubuh.');
            closeModal();
          };
        }, 50);
        break;

      case 'warm_fireplace':
        playCrystalSparkle();
        openModal('🔥 Perapian Kristal Hangat', `
          <p>Batu bara kristal ungu di dalam perapian membakar percikan api tanpa asap, memancarkan kehangatan yang nyaman ke seluruh ruangan.</p>
          <p style="color:#d8b4fe; font-size:0.85rem;">Api ini terus menyala abadi berkat berkah batu bara amethyst purba.</p>
        `);
        break;

      case 'read_book':
        playCrystalSparkle();
        openModal('📚 Manuskrip Puisi & Hikayat Elven', `
          <p>Royan mengambil gulungan perkamen bersampul kulit rusa bertuliskan bait pujangga hutan kuno:</p>
          <blockquote style="border-left: 3px solid #c084fc; padding-left: 12px; margin: 12px 0; font-style: italic; color: #fdf4ff;">
            “Di naungan daun wisteria yang merunduk perlahan,<br>
            Bintang-bintang merajut selimut bagi malam yang sunyi.<br>
            Jagalah setiap denyut kehidupan dengan kasih yang tulus,<br>
            Sebab di sanalah keabadian bersemi.”
          </blockquote>
        `);
        break;

      case 'gaze_forest':
        playElvenHarpChime();
        openModal('🪟 Jendela Panorama Hutan Elf', `
          <p>Dari balik lengkungan jendela kaca yang tinggi, tampak pemandangan magis hutan The Enchanted Elven Sanctuary.</p>
          <p>Air terjun kristal mengalirkan air jernih berkilau di kejauhan, sementara kunang-kunang dan kupu-kupu peri melayang anggun di antara dedaunan.</p>
        `);
        break;

      case 'sleep_bed':
        openModal('🛏️ Moonpetal Royal Bedroom', `
          <p>Ranjang kanopi bertirai sutra lavender tampak begitu nyaman. Apakah Royan ingin beristirahat dan tidur nyenyak malam ini?</p>
          <div style="margin-top: 14px; display:flex; gap: 10px;">
            <button class="manor-btn-primary" id="btn-sleep-confirm">Tidur Pulas di Bawah Tirai Bulan 🌙</button>
            <button class="manor-btn-secondary" onclick="document.getElementById('manor-modal-overlay').classList.remove('active')">Nanti Saja</button>
          </div>
        `);
        setTimeout(() => {
          const btn = document.getElementById('btn-sleep-confirm');
          if (btn) btn.onclick = () => {
            closeModal();
            triggerSleepSequence();
          };
        }, 50);
        break;

      case 'open_wardrobe':
        openWardrobeModal();
        break;

      case 'vanity_mirror':
        playCrystalSparkle();
        openModal('🪞 Meja Rias & Cermin Kristal', `
          <p>Cermin kristal membingkai pantulan wajah Royan dengan hiasan dedaunan perak dan jubah bangsawan elf yang bersahaja.</p>
          <div style="text-align:center; padding:12px; background:rgba(255,255,255,0.05); border-radius:12px;">
            <div style="font-weight:700; color:#fbbf24;">Royan 🎆</div>
            <div style="font-size:0.85rem; color:#d8b4fe;">The Gentle Guardian · Elven</div>
            <div style="font-size:0.8rem; color:#34d399; margin-top:4px;">Status: Tenang, Penuh Kasih &amp; Waspada</div>
          </div>
        `);
        break;

      case 'adjust_decor':
        openAtmosphereModal();
        break;

      case 'balcony_view':
        playElvenHarpChime();
        openModal('🌙 Balkon Pribadi Cahaya Bulan', `
          <p>Royan melangkah keluar ke balkon batu berukir. Angin malam yang sejuk menerpa rambutnya perlahan.</p>
          <p>Bunga wisteria ungu yang merambat di pagar balkon memancarkan aroma manis yang menyejukkan hati.</p>
        `);
        break;

      case 'open_cooking':
        openCookingModal();
        break;

      case 'open_pantry':
      case 'open_fridge':
        playCrystalSparkle();
        openModal('❄️ Lemari Bahan Makanan Ajaib', `
          <p>Daftar bahan makanan segar di lemari pendingin kristal Moonpetal Manor:</p>
          <ul style="padding-left: 20px; line-height: 1.8; color: #fdf4ff;">
            <li>🌸 Kelopak Moonpetal Segar (12 helai)</li>
            <li>🍇 Blackberry Liar Amethyst (1 keranjang)</li>
            <li>✨ Sari Belimbing Bintang (3 botol kristal)</li>
            <li>🍞 Tepung Gandum Sutra Halus (5 kantong)</li>
            <li>🍯 Madu Bunga Akasia Elven (2 toples)</li>
          </ul>
        `);
        break;

      case 'bake_pastry':
        openCookingModal();
        break;

      case 'dine_table':
        playCrystalSparkle();
        openModal('🍽️ Meja Makan Kecil Sudut Jendela', `
          <p>Meja kayu mahoni halus ditata rapi dengan taplak berenda lavender, cangkir porselen elven, dan vas berisi bunga aster ungu.</p>
          <p style="color:#d8b4fe;">Tempat favorit Royan untuk menikmati sarapan sambil memandang matahari terbit di sela pepohonan.</p>
        `);
        break;

      case 'tend_garden':
        openGardeningModal();
        break;

      case 'relax_pond':
        playCrystalSparkle();
        openModal('🪷 Kolam Refleksi & Air Mancur Kristal', `
          <p>Air jernih di kolam memantulkan pendaran bunga lotus dan gugusan bintang di langit kubah kaca.</p>
          <p>Suara gemericik air mancur bertingkat menciptakan melodi relaksasi alami yang mengikis segala rasa lelah.</p>
        `);
        break;

      case 'harvest_bloom':
        playCrystalSparkle();
        if (onShowToast) onShowToast('🍇 Berhasil memanen 5 buah Beri Surya keemasan!');
        completeTask('task_garden');
        openModal('🍇 Panen Buah Beri Surya', `
          <p>Royan memetik buah Beri Surya yang telah matang sempurna. Butiran buahnya terasa hangat dan bersinar manis di telapak tangan.</p>
        `);
        break;

      case 'watch_butterflies':
        playElvenHarpChime();
        openModal('🦋 Kupu-Kupu Peri Bercahaya', `
          <p>Sekelompok kupu-kupu bercahaya ungu dan hijau zamrud berputar riang mengitari Royan, meninggalkan jejak serbuk cahaya yang berkilau.</p>
        `);
        break;

      case 'collect_moonpetal':
        playCrystalSparkle();
        if (onShowToast) onShowToast('🌸 Memetik sekuntum Bunga Moonpetal Abadi.');
        openModal('🌸 Bunga Moonpetal Abadi', `
          <p>Bunga suci ini hanya mekar penuh ketika malam tiba. Kelopaknya yang seputih mutiara memendarkan pendaran ungu violet magis.</p>
        `);
        break;

      case 'read_letters':
        openLettersModal();
        break;

      case 'write_scrapbook':
        openScrapbookModal();
        break;

      case 'view_photos':
        playCrystalSparkle();
        openModal('🖼️ Album Foto Kenangan Sanctuary', `
          <p>Royan membuka album bersampul beludru yang menyimpan momen-momen hangat di semesta HOT:</p>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;">
            <div style="background:rgba(255,255,255,0.06); padding:10px; border-radius:10px; text-align:center;">
              <span style="font-size:2rem;">🦎</span>
              <div style="font-weight:700; color:#fbbf24; margin-top:4px;">Bersama Kip</div>
              <div style="font-size:0.75rem; color:#d8b4fe;">Pojok Terrarium Batu Hangat</div>
            </div>
            <div style="background:rgba(255,255,255,0.06); padding:10px; border-radius:10px; text-align:center;">
              <span style="font-size:2rem;">🔭</span>
              <div style="font-weight:700; color:#fbbf24; margin-top:4px;">Kubah Observatorium</div>
              <div style="font-size:0.75rem; color:#d8b4fe;">Mengamati Rasi Bintang Elf</div>
            </div>
          </div>
        `);
        break;

      case 'view_artifacts':
        openArtifactsModal();
        break;

      case 'discover_relic':
        triggerDiscoverRelic();
        break;

      default:
        openModal(hs.label, `<p>${hs.prompt}</p>`);
        break;
    }
  }

  function triggerSleepSequence() {
    if (!sleepOverlay) return;
    sleepOverlay.classList.add('active');
    playCrystalSparkle();

    setTimeout(() => {
      completeTask('task_sleep');
      if (onShowToast) onShowToast('✨ Royan telah beristirahat dengan damai. Energi & kedamaian batin pulih penuh!');
      if (onTriggerSparkle) onTriggerSparkle();

      setTimeout(() => {
        sleepOverlay.classList.remove('active');
      }, 1400);
    }, 1800);
  }

  function triggerDiscoverRelic() {
    playCrystalSparkle();
    const hasRelic = currentState.foundCollectibles.includes('relic_royal_amethyst');
    if (!hasRelic) {
      currentState.foundCollectibles.push('relic_royal_amethyst');
      saveMoonpetalHavenState(currentState);
    }
    completeTask('task_letters');

    openModal('🔮 Penemuan Rahasia: Royal Amethyst Relic', `
      <div style="text-align:center; padding: 10px;">
        <div style="font-size: 3.5rem; filter: drop-shadow(0 0 20px #9333ea); animation: manorHaloTwinkle 2s infinite;">🔮</div>
        <h3 style="margin: 8px 0; color: #fbbf24; font-size: 1.3rem;">Royal Amethyst Relic Ditemukan!</h3>
        <p style="color: #e9d5ff; font-size: 0.95rem; line-height: 1.6;">
          Di sudut tersembunyi balik rak buku atelier, terpancar mahkota kristal peninggalan bangsa elf kuno.
          Relik suci ini memancarkan aura perlindungan abadi untuk The Enchanted Elven Sanctuary.
        </p>
        <div style="background: rgba(147, 51, 234, 0.2); border: 1.5px solid #c084fc; border-radius: 12px; padding: 12px; margin-top: 14px;">
          <span style="font-weight: 700; color: #ffffff;">✨ Item Eksklusif Ditambahkan ke Koleksi Royan</span>
        </div>
      </div>
    `);
  }

  /* ==========================================================================
     4. DETAILED FEATURE MODALS (COOKING, GARDENING, LETTERS, ATMOSPHERE)
     ========================================================================== */
  function openCookingModal() {
    playTeapotSimmer();
    let recipesHTML = MOONPETAL_MANOR_RECIPES.map(rec => {
      const isCooked = currentState.cookedRecipes.includes(rec.id);
      return `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 12px; padding: 12px; display:flex; justify-content:space-between; align-items:center; gap: 12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:2.2rem;">${rec.icon}</span>
            <div>
              <div style="font-weight:800; color:#ffffff;">${rec.name} <span style="font-size:0.75rem; color:#fbbf24;">(${rec.category})</span></div>
              <div style="font-size:0.8rem; color:#d8b4fe;">${rec.desc}</div>
              <div style="font-size:0.75rem; color:#34d399; margin-top:2px;">✨ ${rec.buff}</div>
            </div>
          </div>
          <button class="manor-btn-primary btn-cook-action" data-id="${rec.id}" style="flex-shrink:0;">
            ${isCooked ? 'Masak Lagi 🍳' : 'Masak 🍳'}
          </button>
        </div>
      `;
    }).join('');

    openModal('🍳 Resep Spesial Bangsawan Elf & Dapur Starlight', `
      <p style="margin-bottom:12px;">Pilih resep hidangan istimewa bernuansa bunga, buah magis, dan cahaya bintang untuk dimasak:</p>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${recipesHTML}
      </div>
    `);

    setTimeout(() => {
      document.querySelectorAll('.btn-cook-action').forEach(btn => {
        btn.onclick = () => {
          const recId = btn.dataset.id;
          const recipe = MOONPETAL_MANOR_RECIPES.find(r => r.id === recId);
          if (!currentState.cookedRecipes.includes(recId)) {
            currentState.cookedRecipes.push(recId);
          }
          completeTask('task_cook');
          saveMoonpetalHavenState(currentState);
          playCrystalSparkle();
          if (onShowToast) onShowToast(`✨ Berhasil memasak ${recipe.name}! Aroma lezat memenuhi dapur.`);
          closeModal();
        };
      });
    }, 50);
  }

  function openGardeningModal() {
    playCrystalSparkle();
    let floraHTML = MOONPETAL_MANOR_FLORA.map(f => {
      const isWatered = currentState.wateredFlora.includes(f.id);
      return `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 12px; padding: 12px; display:flex; justify-content:space-between; align-items:center; gap: 12px;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:2.2rem;">${f.icon}</span>
            <div>
              <div style="font-weight:800; color:#ffffff;">${f.name}</div>
              <div style="font-size:0.8rem; color:#d8b4fe;">${f.desc}</div>
              <div style="font-size:0.75rem; color:#fbbf24; margin-top:2px;">Kondisi: ${isWatered ? 'Segar Berkilau 💧' : f.stage} • Panen: ${f.yield}</div>
            </div>
          </div>
          <button class="manor-btn-secondary btn-water-flora" data-id="${f.id}" style="flex-shrink:0;">
            ${isWatered ? 'Siram Lagi 💧' : 'Siram 💧'}
          </button>
        </div>
      `;
    }).join('');

    openModal('🌿 Mystic Elven Conservatory — Perawatan Flora Magis', `
      <p style="margin-bottom:12px;">Rawat dan siram koleksi tanaman langka bangsawan elf untuk menjaga keharuman dan pendaran cahayanya:</p>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${floraHTML}
      </div>
    `);

    setTimeout(() => {
      document.querySelectorAll('.btn-water-flora').forEach(btn => {
        btn.onclick = () => {
          const fId = btn.dataset.id;
          const targetFlora = MOONPETAL_MANOR_FLORA.find(f => f.id === fId);
          if (!currentState.wateredFlora.includes(fId)) {
            currentState.wateredFlora.push(fId);
          }
          completeTask('task_garden');
          saveMoonpetalHavenState(currentState);
          playCrystalSparkle();
          if (onShowToast) onShowToast(`💧 ${targetFlora.name} segar dan bercahaya lembut!`);
          closeModal();
        };
      });
    }, 50);
  }

  function openLettersModal() {
    playElvenHarpChime();
    let tabsHTML = MOONPETAL_MANOR_LETTERS.map((l, i) => `
      <button class="manor-btn-secondary letter-tab-btn ${i === 0 ? 'active' : ''}" data-idx="${i}" style="font-size:0.8rem; padding: 6px 12px;">
        ${l.sender}
      </button>
    `).join('');

    const first = MOONPETAL_MANOR_LETTERS[0];
    const letterBodyHTML = `
      <div id="letter-content-container" style="background: rgba(18, 10, 36, 0.7); border: 1px solid rgba(192, 132, 252, 0.4); border-radius: 12px; padding: 16px; margin-top: 10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(192, 132, 252, 0.25); padding-bottom: 8px; margin-bottom: 12px;">
          <div>
            <span style="font-weight:800; font-size:1.05rem; color:#ffffff;" id="letter-title">${first.title}</span>
            <div style="font-size:0.78rem; color:#d8b4fe;" id="letter-sender">Dari: ${first.sender} (${first.universe})</div>
          </div>
          <span style="font-size:0.75rem; color:#e2e8f0;" id="letter-date">${first.date}</span>
        </div>
        <div style="line-height:1.7; color:#fdf4ff; font-size:0.92rem;" id="letter-text">${first.content}</div>
      </div>
    `;

    openModal('💌 Arsip Surat Persahabatan Lintas Semesta', `
      <p>Surat-surat penuh ketulusan dari para sahabat lintas semesta Our Little Universe:</p>
      <div style="display:flex; flex-wrap:wrap; gap:6px; margin-top:8px;">
        ${tabsHTML}
      </div>
      ${letterBodyHTML}
    `);

    setTimeout(() => {
      document.querySelectorAll('.letter-tab-btn').forEach(btn => {
        btn.onclick = () => {
          document.querySelectorAll('.letter-tab-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          const idx = parseInt(btn.dataset.idx, 10);
          const item = MOONPETAL_MANOR_LETTERS[idx];
          playCrystalSparkle();
          document.getElementById('letter-title').textContent = item.title;
          document.getElementById('letter-sender').textContent = `Dari: ${item.sender} (${item.universe})`;
          document.getElementById('letter-date').textContent = item.date;
          document.getElementById('letter-text').textContent = item.content;
        };
      });
    }, 50);
  }

  function openScrapbookModal() {
    playCrystalSparkle();
    let notesHTML = currentState.scrapbookNotes.map(n => `
      <div style="background:rgba(255,255,255,0.06); border:1px solid rgba(192,132,252,0.3); border-radius:10px; padding:12px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; font-weight:700; color:#fbbf24; font-size:0.88rem;">
          <span>${n.title}</span>
          <span style="font-size:0.75rem; color:#d8b4fe;">${n.date}</span>
        </div>
        <p style="margin-top:6px; color:#fdf4ff; font-size:0.86rem; line-height:1.6;">${n.text}</p>
      </div>
    `).join('');

    openModal('✍️ Buku Jurnal & Scrapbook Kenangan Royan', `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <p style="margin:0;">Catatan dan refleksi pribadi Royan:</p>
        <button class="manor-btn-primary" id="btn-add-scrapbook-note" style="font-size:0.8rem; padding:6px 14px;">+ Tulis Catatan Baru</button>
      </div>
      <div style="max-height:300px; overflow-y:auto;">
        ${notesHTML}
      </div>
    `);

    setTimeout(() => {
      const btnAdd = document.getElementById('btn-add-scrapbook-note');
      if (btnAdd) {
        btnAdd.onclick = () => {
          const newNote = {
            id: `note_${Date.now()}`,
            date: '17 November 2026',
            title: 'Harmoni di Balik Keheningan',
            text: 'Malam ini suara dedaunan bernyanyi bersama riak air mancur. Betapa berharganya setiap ikatan persahabatan yang telah kita bina.'
          };
          currentState.scrapbookNotes.unshift(newNote);
          saveMoonpetalHavenState(currentState);
          playCrystalSparkle();
          if (onShowToast) onShowToast('✍️ Catatan baru berhasil disimpan ke buku jurnal.');
          openScrapbookModal();
        };
      }
    }, 50);
  }

  function openWardrobeModal() {
    playCrystalSparkle();
    const outfits = [
      'Royal Elven Robe (Lavender & Silver)',
      'Guardian Woodland Tunic (Emerald & Gold)',
      'Moonlight Silk Mantle (Midnight Purple)'
    ];

    let outfitsHTML = outfits.map(o => `
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 12px; padding: 12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; color:#ffffff;">${o}</div>
          <div style="font-size:0.78rem; color:#d8b4fe;">${o === currentState.wardrobeOutfit ? '✦ Sedang Dikenakan' : 'Tersimpan di Lemari'}</div>
        </div>
        <button class="manor-btn-secondary btn-wear-outfit" data-name="${o}" ${o === currentState.wardrobeOutfit ? 'disabled' : ''}>
          ${o === currentState.wardrobeOutfit ? 'Aktif' : 'Kenakan ✨'}
        </button>
      </div>
    `).join('');

    openModal('👘 Lemari Pakaian Bangsawan Elf', `
      <p style="margin-bottom:12px;">Pilih busana sutra dan jubah bangsawan untuk dikenakan oleh Royan:</p>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${outfitsHTML}
      </div>
    `);

    setTimeout(() => {
      document.querySelectorAll('.btn-wear-outfit').forEach(btn => {
        btn.onclick = () => {
          currentState.wardrobeOutfit = btn.dataset.name;
          saveMoonpetalHavenState(currentState);
          playCrystalSparkle();
          if (onShowToast) onShowToast(`✨ Royan mengenakan ${btn.dataset.name}`);
          closeModal();
        };
      });
    }, 50);
  }

  function openAtmosphereModal() {
    playCrystalSparkle();
    let atmoHTML = MOONPETAL_MANOR_ATMOSPHERES.map(a => `
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 12px; padding: 12px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; color:#ffffff;">${a.name}</div>
          <div style="font-size:0.8rem; color:#d8b4fe;">${a.desc}</div>
        </div>
        <button class="manor-btn-primary btn-select-atmo" data-id="${a.id}">
          ${a.id === currentState.atmosphere ? 'Aktif' : 'Terapkan ✨'}
        </button>
      </div>
    `).join('');

    openModal('🔮 Suasana & Pencahayaan Moonpetal Manor', `
      <p style="margin-bottom:12px;">Sesuaikan nuansa cahaya rembulan dan sihir di seluruh ruangan rumah:</p>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${atmoHTML}
      </div>
    `);

    setTimeout(() => {
      document.querySelectorAll('.btn-select-atmo').forEach(btn => {
        btn.onclick = () => {
          applyAtmosphere(btn.dataset.id);
          playCrystalSparkle();
          if (onShowToast) onShowToast('🔮 Suasana ruangan berhasil diperbarui.');
          closeModal();
        };
      });
    }, 50);
  }

  function openTasksModal() {
    playCrystalSparkle();
    let tasksHTML = currentState.tasks.map(t => `
      <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 12px; padding: 12px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:10px;">
          <span style="font-size:1.5rem;">${t.icon}</span>
          <div>
            <div style="font-weight:700; color:${t.done ? '#34d399' : '#ffffff'}; text-decoration:${t.done ? 'line-through' : 'none'};">
              ${t.title}
            </div>
            <div style="font-size:0.75rem; color:#d8b4fe;">Lokasi: ${t.room.toUpperCase()}</div>
          </div>
        </div>
        <span style="font-size:1.1rem;">${t.done ? '✅' : '⏳'}</span>
      </div>
    `).join('');

    openModal('📋 Aktivitas & Tugas Harian di Manor', `
      <p style="margin-bottom:12px;">Daftar aktivitas santai harian di kediaman Royan:</p>
      <div style="display:flex; flex-direction:column; gap:8px;">
        ${tasksHTML}
      </div>
    `);
  }

  function openArtifactsModal() {
    playCrystalSparkle();
    let relicsHTML = MOONPETAL_MANOR_COLLECTIBLES.map(c => {
      const isFound = currentState.foundCollectibles.includes(c.id);
      return `
        <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(192, 132, 252, 0.3); border-radius: 12px; padding: 12px; display:flex; align-items:center; gap:12px;">
          <span style="font-size:2.2rem; filter:${isFound ? 'none' : 'grayscale(1) opacity(0.5)'};">${c.icon}</span>
          <div>
            <div style="font-weight:800; color:${isFound ? '#fbbf24' : '#94a3b8'};">${c.name} <span style="font-size:0.75rem; color:#c084fc;">(${c.rarity})</span></div>
            <div style="font-size:0.8rem; color:#e2e8f0;">${isFound ? c.desc : 'Belum ditemukan. Jelajahi ruangan manor untuk menemukan relik ini.'}</div>
            <div style="font-size:0.75rem; color:#34d399; margin-top:2px;">📍 ${c.location}</div>
          </div>
        </div>
      `;
    }).join('');

    openModal('🏺 Koleksi Artefak & Relik Suci Elven', `
      <p style="margin-bottom:12px;">Relik kuno dan kenangan berharga yang dikumpulkan di The Enchanted Elven Sanctuary:</p>
      <div style="display:flex; flex-direction:column; gap:10px;">
        ${relicsHTML}
      </div>
    `);
  }

  /* ==========================================================================
     5. EVENT LISTENERS WIRING & CONTROLS
     ========================================================================== */
  function handleKeyDown(e) {
    keysPressed[e.code] = true;
    if (e.code === 'KeyE') {
      if (activeNearbyHotspot) {
        triggerHotspotAction(activeNearbyHotspot);
      }
    }
  }

  function handleKeyUp(e) {
    keysPressed[e.code] = false;
  }

  function wireControls() {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    if (btnModalClose) {
      btnModalClose.onclick = closeModal;
    }

    if (modalOverlay) {
      modalOverlay.onclick = (e) => {
        if (e.target === modalOverlay) closeModal();
      };
    }

    if (btnBack) {
      btnBack.onclick = () => {
        playCrystalSparkle();
        closeMoonpetalManor();
        if (typeof onNavigateBack === 'function') {
          onNavigateBack();
        }
      };
    }

    if (btnToolAtmo) btnToolAtmo.onclick = openAtmosphereModal;
    if (btnToolTasks) btnToolTasks.onclick = openTasksModal;
    if (btnToolRelics) btnToolRelics.onclick = openArtifactsModal;

    // Mobile Virtual D-Pad
    const setupDpadBtn = (id, code) => {
      const btn = document.getElementById(id);
      if (btn) {
        btn.addEventListener('touchstart', (e) => { e.preventDefault(); keysPressed[code] = true; });
        btn.addEventListener('touchend', (e) => { e.preventDefault(); keysPressed[code] = false; });
        btn.addEventListener('mousedown', () => { keysPressed[code] = true; });
        btn.addEventListener('mouseup', () => { keysPressed[code] = false; });
        btn.addEventListener('mouseleave', () => { keysPressed[code] = false; });
      }
    };

    setupDpadBtn('manor-dpad-up', 'KeyW');
    setupDpadBtn('manor-dpad-down', 'KeyS');
    setupDpadBtn('manor-dpad-left', 'KeyA');
    setupDpadBtn('manor-dpad-right', 'KeyD');
  }

  function teardownControls() {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
    if (gameLoopAnimId) {
      cancelAnimationFrame(gameLoopAnimId);
      gameLoopAnimId = null;
    }
  }

  /* ==========================================================================
     6. PUBLIC API
     ========================================================================== */
  function openMoonpetalManor(user = null, targetRoom = 'living') {
    activeAuthUser = user;
    currentState = loadMoonpetalHavenState();

    if (viewSection) {
      viewSection.classList.add('active');
      viewSection.setAttribute('aria-hidden', 'false');
    }

    renderRoom(targetRoom, true);
    wireControls();
    gameLoop();
    playElvenHarpChime();

    if (onShowToast) {
      onShowToast(`🏛️ Selamat datang di Moonpetal Manor, Royan 🎆`);
    }
  }

  function closeMoonpetalManor() {
    teardownControls();
    if (viewSection) {
      viewSection.classList.remove('active');
      viewSection.setAttribute('aria-hidden', 'true');
    }
    closeModal();
  }

  return {
    openMoonpetalManor,
    closeMoonpetalManor,
    renderRoom,
    getCurrentState: () => currentState
  };
}
