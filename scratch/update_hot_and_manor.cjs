const fs = require('fs');

console.log('--- STARTING ROYAN UI CLEANUP & MOONPETAL MANOR INTEGRATION ---');

// 1. UPDATE index.html
let html = fs.readFileSync('index.html', 'utf8');

// A. Add stylesheet link if not present
if (!html.includes('moonpetal_manor.css')) {
  html = html.replace(
    '<link rel="stylesheet" href="/pinwheel_haven.css">',
    '<link rel="stylesheet" href="/pinwheel_haven.css">\n  <link rel="stylesheet" href="/moonpetal_manor.css">'
  );
  console.log('[index.html] Added moonpetal_manor.css link.');
}

// B. Insert view-moonpetal-manor section after view-pinwheel-haven
if (!html.includes('id="view-moonpetal-manor"')) {
  const havenSectionEnd = '</section>\n\n      <!-- ============================================== -->\n      <!-- VIEW: US AGAIN — THE SILENT LOTUS (ELA)';
  const manorSectionHTML = `</section>

      <!-- ============================================== -->
      <!-- VIEW: THE MOONPETAL MANOR (ROYAN 🎆 | HOT)     -->
      <!-- ROYAN'S ENCHANTED ELVEN RESIDENCE              -->
      <!-- ============================================== -->
      <section class="view-section view-moonpetal-manor" id="view-moonpetal-manor"
        aria-label="THE MOONPETAL MANOR — Royan's Enchanted Elven Residence" aria-hidden="true">

        <div class="manor-viewport">
          <div class="manor-stage" id="manor-stage">

            <!-- Background Scene Artwork -->
            <img src="/assets/moonpetal_manor_living.jpg" alt="The Moonpetal Manor Scene" class="manor-bg-img" id="manor-bg-img">

            <!-- Environmental FX Layer (Stardust, Butterflies & Moonbeams) -->
            <div class="manor-fx-layer" aria-hidden="true">
              <div class="manor-moonbeam-overlay"></div>
              <div class="manor-butterfly" style="left: 15%; top: 35%; animation-delay: 0s;">🦋</div>
              <div class="manor-butterfly" style="left: 65%; top: 25%; animation-delay: 4s;">🦋</div>
              <div class="manor-stardust" style="left: 20%; top: 70%; animation-delay: 0.5s;"></div>
              <div class="manor-stardust" style="left: 45%; top: 85%; animation-delay: 2.2s;"></div>
              <div class="manor-stardust" style="left: 70%; top: 60%; animation-delay: 4.8s;"></div>
              <div class="manor-stardust" style="left: 85%; top: 75%; animation-delay: 1.2s;"></div>
            </div>

            <!-- Top HUD Bar -->
            <header class="manor-top-hud">
              <!-- Left: Room Info & Exit Back Button -->
              <div class="manor-hud-left">
                <button type="button" class="manor-hud-btn" id="btn-manor-back" aria-label="Kembali ke Universe HOT">
                  <span>←</span>
                  <span>HOT World</span>
                </button>
                <div class="manor-hud-avatar-wrap">
                  <img src="/assets/avatar_royan_hd.jpg" alt="Royan" class="manor-hud-avatar-img">
                </div>
                <div class="manor-hud-titles">
                  <span class="manor-hud-title" id="manor-room-title">Enchanted Elven Living Room</span>
                  <span class="manor-hud-subtitle" id="manor-room-subtitle">Ruang Keluarga Bangsawan Elf & Grand Piano Kristal</span>
                </div>
              </div>

              <!-- Center: Room Navigation Pills (5 Rooms) -->
              <nav class="manor-hud-nav" id="manor-nav-pills" aria-label="Navigasi Ruangan Moonpetal Manor">
                <button type="button" class="manor-nav-pill active" data-room-id="living">
                  <span>🏛️</span><span>Living Room</span>
                </button>
                <button type="button" class="manor-nav-pill" data-room-id="bedroom">
                  <span>🛏️</span><span>Bedroom</span>
                </button>
                <button type="button" class="manor-nav-pill" data-room-id="kitchen">
                  <span>🍳</span><span>Kitchen</span>
                </button>
                <button type="button" class="manor-nav-pill" data-room-id="conservatory">
                  <span>🌿</span><span>Conservatory</span>
                </button>
                <button type="button" class="manor-nav-pill" data-room-id="atelier">
                  <span>📜</span><span>Atelier</span>
                </button>
              </nav>

              <!-- Right: Quick Tools -->
              <div class="manor-hud-right">
                <button type="button" class="manor-hud-btn" id="btn-manor-tool-atmo" aria-label="Atmosfer Cahaya" title="Pencahayaan & Suasana Ruangan">
                  <span>🔮</span>
                  <span>Atmosphere</span>
                </button>
                <button type="button" class="manor-hud-btn" id="btn-manor-tool-tasks" aria-label="Tugas Harian" title="Agenda Harian">
                  <span>📋</span>
                  <span>Tasks</span>
                </button>
                <button type="button" class="manor-hud-btn" id="btn-manor-tool-relics" aria-label="Relik Elven" title="Koleksi Relik & Artefak">
                  <span>🏺</span>
                  <span>Relics</span>
                </button>
              </div>
            </header>

            <!-- Interactive Hotspots Container -->
            <div class="manor-hotspots" id="manor-hotspots-container"></div>

            <!-- 2D Player Avatar (Royan 🎆) -->
            <div class="manor-avatar" id="manor-player-avatar" style="left: 50%; top: 72%;">
              <div class="manor-avatar-head">
                <img src="/assets/portrait_royan_hd.jpg" alt="Royan Avatar" class="manor-avatar-img">
                <div class="manor-avatar-halo" aria-hidden="true">✧</div>
              </div>
              <div class="manor-avatar-shadow" aria-hidden="true"></div>
            </div>

            <!-- Proximity Prompt Bubble -->
            <div class="manor-proximity-prompt" id="manor-interaction-prompt">
              ✦ [E] Berinteraksi
            </div>

            <!-- Touch D-Pad Controls for Mobile -->
            <div class="manor-dpad" aria-label="Kontrol Gerak Layar Sentuh">
              <button type="button" class="manor-dpad-btn manor-dpad-up" id="manor-dpad-up" aria-label="Atas">▲</button>
              <button type="button" class="manor-dpad-btn manor-dpad-left" id="manor-dpad-left" aria-label="Kiri">◀</button>
              <button type="button" class="manor-dpad-btn manor-dpad-right" id="manor-dpad-right" aria-label="Kanan">▶</button>
              <button type="button" class="manor-dpad-btn manor-dpad-down" id="manor-dpad-down" aria-label="Bawah">▼</button>
            </div>

            <!-- Interactive Modal Container -->
            <div class="manor-modal-overlay" id="manor-modal-overlay" role="dialog" aria-modal="true" aria-hidden="true">
              <div class="manor-modal-card">
                <div class="manor-modal-header">
                  <div class="manor-modal-title-wrap">
                    <h3 class="manor-modal-title" id="manor-modal-title">Interaksi</h3>
                  </div>
                  <button type="button" class="manor-modal-close" id="btn-manor-modal-close" aria-label="Tutup Modal">&times;</button>
                </div>
                <div class="manor-modal-body" id="manor-modal-body"></div>
              </div>
            </div>

            <!-- Sleep Blackout Fade Overlay -->
            <div class="manor-sleep-overlay" id="manor-sleep-overlay" aria-hidden="true">
              <span style="font-size: 3rem;">🌙</span>
              <span class="manor-sleep-text">Royan terlelap dalam keheningan malam...</span>
            </div>

          </div>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- VIEW: US AGAIN — THE SILENT LOTUS (ELA)`;

  if (html.includes(havenSectionEnd)) {
    html = html.replace(havenSectionEnd, manorSectionHTML);
    console.log('[index.html] Inserted view-moonpetal-manor section.');
  } else {
    console.warn('[index.html] Could not find insertion point for view-moonpetal-manor!');
  }
}

// C. Update Royan's Universe HOT Header, Sidebar and Residence Button in index.html
const oldProfileSidebar = `<aside class="hot-profile-sidebar" aria-label="Profil Karakter Royan">
            <div class="hot-profile-top">
              <div class="hot-profile-avatar-wrap">
                <img src="/assets/portrait_royan_hd.jpg" alt="Royan Profile" class="hot-profile-avatar-img">
                <span class="hot-profile-level-badge">Lv. ∞</span>
              </div>
              <div class="hot-profile-meta">
                <h2 class="hot-profile-name">Royan 🎆</h2>
                <span class="hot-profile-race-title">The Gentle Guardian · Elven</span>
                <span class="hot-profile-status">
                  <span class="hot-status-dot"></span>
                  <span>Awake in Sanctuary</span>
                </span>
              </div>
            </div>

            <blockquote class="hot-profile-quote">
              “Even the quietest souls can make the brightest difference.”
            </blockquote>

            <div class="hot-profile-details">
              <div class="hot-profile-row">
                <span class="hot-profile-row-label">Suasana Hati:</span>
                <button type="button" class="hot-mood-badge-interactive" id="hot-profile-mood" title="Klik untuk mengubah suasana hati">
                  Peaceful 🌿
                </button>
              </div>
              <div class="hot-profile-row">
                <span class="hot-profile-row-label">Universe Realm:</span>
                <span style="font-weight:600; color:#c084fc;">HOT • Sanctuary</span>
              </div>
              <div class="hot-pet-shortcut" id="hot-sidebar-pet-shortcut" role="button" tabindex="0" title="Buka Terrarium Kip">
                <span id="hot-sidebar-pet-status">🦎 Kip (Happy &amp; Basking 🌿)</span>
              </div>
            </div>
          </aside>`;

const newProfileSidebar = `<aside class="hot-profile-sidebar" aria-label="Profil Karakter Royan">
            <!-- 1. Foto Profil Royan -->
            <div class="hot-profile-avatar-wrap">
              <img src="/assets/portrait_royan_hd.jpg" alt="Royan Profile" class="hot-profile-avatar-img">
              <span class="hot-profile-level-badge">Lv. ∞</span>
            </div>

            <!-- 2. Nama ROYAN 🎆 -->
            <h2 class="hot-profile-name">ROYAN 🎆</h2>

            <!-- 3. Gelar The Gentle Guardian · Elven -->
            <span class="hot-profile-race-title">The Gentle Guardian · Elven</span>

            <!-- 4. Status atau mood saat ini -->
            <div class="hot-profile-status-block">
              <span class="hot-profile-status">
                <span class="hot-status-dot"></span>
                <span>Awake in Sanctuary</span>
              </span>
              <button type="button" class="hot-mood-badge-interactive" id="hot-profile-mood" title="Klik untuk mengubah suasana hati">
                Peaceful 🌿
              </button>
            </div>

            <!-- 5. Quote singkat -->
            <blockquote class="hot-profile-quote">
              “Even the quietest souls can make the brightest difference.”
            </blockquote>

            <!-- 6. Informasi nama universe -->
            <div class="hot-profile-universe-info">
              <span class="hot-universe-badge">UNIVERSE</span>
              <span class="hot-universe-name">HOT • The Enchanted Elven Sanctuary</span>
            </div>

            <!-- Pet Shortcut Kip -->
            <div class="hot-pet-shortcut" id="hot-sidebar-pet-shortcut" role="button" tabindex="0" title="Buka Terrarium Kip">
              <span id="hot-sidebar-pet-status">🦎 Kip (Happy &amp; Basking 🌿)</span>
            </div>
          </aside>`;

if (html.includes(oldProfileSidebar)) {
  html = html.replace(oldProfileSidebar, newProfileSidebar);
  console.log('[index.html] Cleaned up Royan profile sidebar layout.');
}

// D. Update Elven Residence Button to Moonpetal Manor in index.html
const oldResidenceBtn = `<button type="button" class="hot-loc-btn btn-loc-hot-residence" id="btn-loc-hot-residence" aria-label="Elven Residence">
              <div class="hot-loc-pulse" aria-hidden="true"></div>
              <span class="hot-loc-icon">🏡</span>
              <span class="hot-loc-label">Elven Residence</span>
            </button>`;

const newResidenceBtn = `<button type="button" class="hot-loc-btn btn-loc-hot-residence" id="btn-loc-hot-residence" aria-label="Moonpetal Manor" title="Masuk ke Moonpetal Manor (Kediaman Royan)">
              <div class="hot-loc-pulse" aria-hidden="true"></div>
              <span class="hot-loc-icon">🏛️</span>
              <span class="hot-loc-label">Moonpetal Manor</span>
              <span class="hot-loc-tooltip">Masuk ke Moonpetal Manor ✧</span>
            </button>`;

if (html.includes(oldResidenceBtn)) {
  html = html.replace(oldResidenceBtn, newResidenceBtn);
  console.log('[index.html] Updated residence button to Moonpetal Manor.');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('[index.html] Successfully saved.');

// 2. UPDATE hot.css
let hotCss = fs.readFileSync('hot.css', 'utf8');

// Hide redundant left brand in header so it doesn't collide with profile sidebar
if (hotCss.includes('.hot-header-left {')) {
  hotCss = hotCss.replace(
    '.hot-header-left {\n  display: flex;',
    '.hot-header-left {\n  display: none !important;\n  /* Replaced by structured profile sidebar to eliminate layout collision */\n  /* display: flex;'
  );
  console.log('[hot.css] Hid duplicate hot-header-left.');
}

// Center the nav bar cleanly
if (hotCss.includes('.hot-top-center-nav {')) {
  hotCss = hotCss.replace(
    '.hot-top-center-nav {\n  display: flex;',
    '.hot-top-center-nav {\n  position: absolute;\n  left: 50%;\n  transform: translateX(-50%);\n  display: flex;'
  );
  console.log('[hot.css] Centered hot-top-center-nav.');
}

// Replace hot-profile-sidebar styles with elegant structured vertical translucent panel
const oldSidebarCssStart = '/* --- 4. Left Minimalist Character Identity & Mood (Natural Floating Elven Style, Like Lele) --- */\n.hot-profile-sidebar {';
if (hotCss.includes(oldSidebarCssStart)) {
  const sidebarIdx = hotCss.indexOf(oldSidebarCssStart);
  const nextSectionIdx = hotCss.indexOf('/* --- 5. Interactive Location Hotspots --- */', sidebarIdx);
  if (sidebarIdx !== -1 && nextSectionIdx !== -1) {
    const newSidebarCss = `/* --- 4. Left Structured Character Identity Panel (Royan - HOT) --- */
.hot-profile-sidebar {
  position: absolute;
  top: 1.15rem;
  left: 1.5rem;
  width: 270px;
  background: rgba(18, 11, 35, 0.76);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(192, 132, 252, 0.4);
  border-radius: 18px;
  padding: 1.1rem 1.15rem;
  box-shadow: 0 10px 32px rgba(7, 3, 14, 0.65), 0 0 20px rgba(147, 51, 234, 0.22);
  z-index: 12;
  color: #fdf4ff;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.55rem;
  pointer-events: auto;
  transition: all 0.3s ease;
}

.hot-profile-sidebar:hover {
  border-color: rgba(233, 213, 255, 0.7);
  box-shadow: 0 12px 36px rgba(7, 3, 14, 0.75), 0 0 24px rgba(192, 132, 252, 0.38);
}

.hot-profile-avatar-wrap {
  position: relative;
  width: 66px;
  height: 66px;
  border-radius: 50%;
  padding: 2.5px;
  background: linear-gradient(135deg, #c084fc, #34d399, #fbbf24);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5), 0 0 16px rgba(192, 132, 252, 0.6);
  flex-shrink: 0;
  margin-bottom: 0.15rem;
}

.hot-profile-avatar-img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.hot-profile-level-badge {
  position: absolute;
  bottom: -3px;
  right: -3px;
  background: linear-gradient(135deg, #7c3aed, #9333ea);
  border: 1px solid #fdf4ff;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 999px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.6);
}

.hot-profile-name {
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-size: 1.15rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 0 12px rgba(192, 132, 252, 0.8);
  line-height: 1.15;
}

.hot-profile-race-title {
  font-size: 0.76rem;
  color: #34d399;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin: 0;
  text-shadow: 0 0 8px rgba(52, 211, 153, 0.6);
}

.hot-profile-status-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 100%;
}

.hot-profile-status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: #e9d5ff;
}

.hot-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #34d399;
  box-shadow: 0 0 8px #34d399;
  animation: pulseStatus 2s infinite ease-in-out;
  flex-shrink: 0;
}

.hot-mood-badge-interactive {
  background: rgba(147, 51, 234, 0.25);
  border: 1px solid rgba(192, 132, 252, 0.45);
  color: #fdf4ff;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.hot-mood-badge-interactive:hover {
  background: rgba(147, 51, 234, 0.45);
  border-color: #fdf4ff;
  transform: scale(1.04);
}

.hot-profile-quote {
  font-size: 0.74rem;
  font-style: italic;
  line-height: 1.45;
  color: #e9d5ff;
  margin: 0.15rem 0;
  padding: 0.45rem 0.65rem;
  background: rgba(255, 255, 255, 0.04);
  border-left: 2px solid #c084fc;
  border-radius: 0 8px 8px 0;
  width: 100%;
  box-sizing: border-box;
}

.hot-profile-universe-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  width: 100%;
  border-top: 1px solid rgba(192, 132, 252, 0.2);
  padding-top: 0.45rem;
}

.hot-universe-badge {
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #fbbf24;
  background: rgba(251, 191, 36, 0.15);
  border: 1px solid rgba(251, 191, 36, 0.3);
  padding: 1px 8px;
  border-radius: 999px;
}

.hot-universe-name {
  font-size: 0.72rem;
  font-weight: 600;
  color: #d8b4fe;
}

.hot-pet-shortcut {
  font-size: 0.72rem;
  color: #a7f3d0;
  background: rgba(52, 211, 153, 0.15);
  border: 1px solid rgba(52, 211, 153, 0.35);
  padding: 3px 10px;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.15rem;
}

.hot-pet-shortcut:hover {
  background: rgba(52, 211, 153, 0.3);
  border-color: #a7f3d0;
}

`;
    hotCss = hotCss.substring(0, sidebarIdx) + newSidebarCss + hotCss.substring(nextSectionIdx);
    console.log('[hot.css] Replaced hot-profile-sidebar styles.');
  }
}

// Move residence button to right side with hover and tooltip
if (hotCss.includes('.btn-loc-hot-residence   { top: 46%; left: 18%; }')) {
  const newResidenceCss = `.btn-loc-hot-residence {
  top: 40%;
  left: auto;
  right: clamp(1.5rem, 3.5vw, 3.5rem);
  z-index: 12;
  background: rgba(22, 13, 44, 0.88);
  border: 1.5px solid #c084fc;
  box-shadow: 0 0 20px rgba(147, 51, 234, 0.6), inset 0 0 10px rgba(192, 132, 252, 0.35);
  padding: 0.45rem 1.15rem 0.45rem 0.75rem;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-loc-hot-residence:hover {
  transform: translateY(-3px) scale(1.08);
  border-color: #fdf4ff;
  box-shadow: 0 0 28px rgba(192, 132, 252, 0.95), 0 8px 30px rgba(0, 0, 0, 0.6);
}

.btn-loc-hot-residence .hot-loc-tooltip {
  position: absolute;
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  background: rgba(18, 11, 35, 0.92);
  border: 1px solid #c084fc;
  border-radius: 8px;
  padding: 5px 12px;
  color: #fdf4ff;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease, transform 0.25s ease;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.6);
}

.btn-loc-hot-residence:hover .hot-loc-tooltip {
  opacity: 1;
  transform: translateY(-50%) translateX(-4px);
}`;
  hotCss = hotCss.replace('.btn-loc-hot-residence   { top: 46%; left: 18%; }', newResidenceCss);
  console.log('[hot.css] Positioned btn-loc-hot-residence to the right side.');
}

fs.writeFileSync('hot.css', hotCss, 'utf8');
console.log('[hot.css] Successfully saved.');

// 3. UPDATE hot_view.js
let hotView = fs.readFileSync('hot_view.js', 'utf8');

// Accept onOpenResidence in initHotWorld
if (hotView.includes('export function initHotWorld({ onShowToast, onTriggerSparkle } = {}) {')) {
  hotView = hotView.replace(
    'export function initHotWorld({ onShowToast, onTriggerSparkle } = {}) {',
    'export function initHotWorld({ onShowToast, onTriggerSparkle, onOpenResidence } = {}) {'
  );
  console.log('[hot_view.js] Added onOpenResidence parameter.');
}

// Wire onOpenResidence when btn-loc-hot-residence is clicked
if (hotView.includes('map.forEach(item => {')) {
  const oldWiring = `    map.forEach(item => {
      const btn = document.getElementById(item.id);
      if (btn) {
        btn.addEventListener('click', () => openModal(item.modal));
      }
    });`;

  const newWiring = `    map.forEach(item => {
      const btn = document.getElementById(item.id);
      if (btn) {
        if (item.id === 'btn-loc-hot-residence' && typeof onOpenResidence === 'function') {
          btn.addEventListener('click', (e) => {
            e.preventDefault();
            onOpenResidence();
          });
        } else {
          btn.addEventListener('click', () => openModal(item.modal));
        }
      }
    });`;

  if (hotView.includes(oldWiring)) {
    hotView = hotView.replace(oldWiring, newWiring);
    console.log('[hot_view.js] Wired btn-loc-hot-residence to onOpenResidence.');
  }
}

fs.writeFileSync('hot_view.js', hotView, 'utf8');
console.log('[hot_view.js] Successfully saved.');

// 4. UPDATE universes_view.js
let uv = fs.readFileSync('universes_view.js', 'utf8');

if (!uv.includes('initMoonpetalManorView')) {
  uv = uv.replace(
    "import { initHotWorld } from './hot_view.js';",
    "import { initHotWorld } from './hot_view.js';\nimport { initMoonpetalManorView } from './moonpetal_manor_view.js';"
  );
  console.log('[universes_view.js] Imported initMoonpetalManorView.');
}

// Initialize moonpetalManorCtrl & wire onOpenResidence
const oldHotInit = `  // Initialize Royan's Universe (HOT — THE ENCHANTED ELVEN SANCTUARY) controller
  const hotCtrl = typeof initHotWorld === 'function' ? initHotWorld({ onShowToast, onTriggerSparkle }) : null;`;

const newHotInit = `  // Initialize Royan's Universe (HOT — THE ENCHANTED ELVEN SANCTUARY) & The Moonpetal Manor controllers
  let moonpetalManorCtrl = null;
  const hotCtrl = typeof initHotWorld === 'function' ? initHotWorld({
    onShowToast,
    onTriggerSparkle,
    onOpenResidence: () => {
      if (hotCtrl) hotCtrl.closeHotWorld();
      if (moonpetalManorCtrl) moonpetalManorCtrl.openMoonpetalManor(activeAuthUser);
    }
  }) : null;

  moonpetalManorCtrl = typeof initMoonpetalManorView === 'function' ? initMoonpetalManorView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      if (moonpetalManorCtrl) moonpetalManorCtrl.closeMoonpetalManor();
      if (hotCtrl) hotCtrl.openHotWorld(activeAuthUser);
    }
  }) : null;`;

if (uv.includes(oldHotInit)) {
  uv = uv.replace(oldHotInit, newHotInit);
  console.log('[universes_view.js] Wired hotCtrl & moonpetalManorCtrl.');
}

// Expose public API in return object
if (uv.includes('hotController: hotCtrl,')) {
  uv = uv.replace(
    'hotController: hotCtrl,',
    `hotController: hotCtrl,
    openMoonpetalManor: (user, room) => moonpetalManorCtrl?.openMoonpetalManor(user || activeAuthUser, room),
    closeMoonpetalManor: () => moonpetalManorCtrl?.closeMoonpetalManor(),
    moonpetalManorController: moonpetalManorCtrl,`
  );
  console.log('[universes_view.js] Exposed moonpetalManorController in public API.');
}

fs.writeFileSync('universes_view.js', uv, 'utf8');
console.log('[universes_view.js] Successfully saved.');

// 5. UPDATE main.js
let mainJs = fs.readFileSync('main.js', 'utf8');

// Array 1 (line ~973)
if (mainJs.includes("'view-pinwheel-haven', 'view-yawn-world'")) {
  mainJs = mainJs.replaceAll(
    "'view-hot-world', 'view-everdream-house'",
    "'view-hot-world', 'view-moonpetal-manor', 'view-everdream-house'"
  );
  console.log('[main.js] Added view-moonpetal-manor to view arrays.');
}

// Array 4 (line ~1400)
if (mainJs.includes("'view-pinwheel-haven'\n  ];")) {
  mainJs = mainJs.replace(
    "'view-pinwheel-haven'\n  ];",
    "'view-pinwheel-haven',\n    'view-moonpetal-manor'\n  ];"
  );
  console.log('[main.js] Added view-moonpetal-manor to 4th view array.');
}

fs.writeFileSync('main.js', mainJs, 'utf8');
console.log('[main.js] Successfully saved.');

// 6. UPDATE style.css
let styleCss = fs.readFileSync('style.css', 'utf8');
if (styleCss.includes('body:has(#view-selection.active) .view-pinwheel-haven,')) {
  styleCss = styleCss.replace(
    'body:has(#view-selection.active) .view-pinwheel-haven,',
    'body:has(#view-selection.active) .view-pinwheel-haven,\nbody:has(#view-login.active) .view-moonpetal-manor,\nbody:has(#view-selection.active) .view-moonpetal-manor,'
  );
  console.log('[style.css] Added defensive view hiding for view-moonpetal-manor.');
}
fs.writeFileSync('style.css', styleCss, 'utf8');
console.log('[style.css] Successfully saved.');

console.log('--- ALL UPDATES COMPLETED SUCCESSFULLY ---');
