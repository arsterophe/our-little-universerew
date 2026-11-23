const fs = require('fs');

const indexPath = 'index.html';
let html = fs.readFileSync(indexPath, 'utf8');

// 1. Add CSS Link in head
if (!html.includes('pinwheel_haven.css')) {
  html = html.replace(
    '</head>',
    '  <link rel="stylesheet" href="/pinwheel_haven.css">\n</head>'
  );
  console.log('Added pinwheel_haven.css link');
}

// 2. Update Residence modal button in PINWHEEL if needed
if (html.includes('id="btn-enter-pinwheel-residence"')) {
  html = html.replace(
    /⛩️ Masuk ke The Windwhisper Residence ✨/g,
    '☁️ Masuk ke THE PINWHEEL HAVEN ✨'
  );
  console.log('Updated btn-enter-pinwheel-residence label');
}

// 3. Add <section id="view-pinwheel-haven"> before closing </main>
if (!html.includes('id="view-pinwheel-haven"')) {
  const havenSectionHtml = `
      <!-- ============================================== -->
      <!-- VIEW: THE PINWHEEL HAVEN — SYMA'S RESIDENCE   -->
      <!-- ============================================== -->
      <section class="view-section view-pinwheel-haven" id="view-pinwheel-haven"
        aria-label="THE PINWHEEL HAVEN — Syma's Floating Sky Residence" aria-hidden="true">

        <div class="haven-viewport">
          <div class="haven-stage" id="haven-stage">

            <!-- Background Artwork -->
            <img src="/assets/pinwheel_haven_living.jpg" alt="The Pinwheel Haven Scene" class="haven-bg-img" id="haven-bg-img">

            <!-- Environmental FX Layer (Drifting Clouds & Light Motes) -->
            <div class="haven-fx-layer" aria-hidden="true">
              <div class="haven-cloud-puff" style="width: 220px; height: 100px; top: 18%; animation-duration: 28s; animation-delay: 0s;"></div>
              <div class="haven-cloud-puff" style="width: 180px; height: 80px; top: 42%; animation-duration: 34s; animation-delay: 6s;"></div>
              <div class="haven-cloud-puff" style="width: 260px; height: 110px; top: 65%; animation-duration: 30s; animation-delay: 14s;"></div>
              <div class="haven-dust-mote" style="left: 20%; top: 40%; animation-delay: 0.2s;"></div>
              <div class="haven-dust-mote" style="left: 45%; top: 60%; animation-delay: 1.5s;"></div>
              <div class="haven-dust-mote" style="left: 75%; top: 35%; animation-delay: 2.8s;"></div>
              <div class="haven-dust-mote" style="left: 85%; top: 70%; animation-delay: 0.9s;"></div>
            </div>

            <!-- Top Left Info Card & Back Button -->
            <div class="haven-header-left">
              <button type="button" class="haven-btn-back" id="btn-haven-back" aria-label="Kembali ke Universe PINWHEEL">
                <span>←</span>
              </button>
              <div class="haven-room-info">
                <h3 class="haven-room-title" id="haven-room-title">Cloud Nine Living Room</h3>
                <p class="haven-room-sub" id="haven-room-subtitle">Ruang Keluarga Awan Putih, Piano Kristal Bintang & Panorama Kincir Angin</p>
              </div>
            </div>

            <!-- Top Center Navigation Pills (5 Rooms) -->
            <nav class="haven-nav-bar" id="haven-nav-pills" aria-label="Navigasi Ruangan">
              <button type="button" class="haven-nav-btn active" data-room-id="living">
                <span>☁️</span> Living Room
              </button>
              <button type="button" class="haven-nav-btn" data-room-id="bedroom">
                <span>🛏️</span> Bedroom
              </button>
              <button type="button" class="haven-nav-btn" data-room-id="kitchen">
                <span>🍳</span> Sky Kitchen
              </button>
              <button type="button" class="haven-nav-btn" data-room-id="conservatory">
                <span>🌿</span> Conservatory
              </button>
              <button type="button" class="haven-nav-btn" data-room-id="attic">
                <span>📜</span> Memory Attic
              </button>
            </nav>

            <!-- Top Right Tools & HUD -->
            <div class="haven-header-right">
              <button type="button" class="haven-tool-btn" id="btn-haven-tool-atmo" aria-label="Atmosfer Cahaya" title="Pencahayaan & Suasana Langit">
                <span>☀️</span>
              </button>
              <button type="button" class="haven-tool-btn" id="btn-haven-tool-tasks" aria-label="Agenda Harian" title="Agenda & Tugas Harian">
                <span>📋</span>
              </button>
              <button type="button" class="haven-tool-btn" id="btn-haven-tool-pinwheels" aria-label="Koleksi Kincir Angin" title="Koleksi Kincir Angin Mini">
                <span>🎐</span>
              </button>
            </div>

            <!-- Interactive Hotspots Container -->
            <div class="haven-hotspots" id="haven-hotspots-container"></div>

            <!-- 2D Player Avatar (Syma ☁️) -->
            <div class="haven-player" id="haven-player-avatar" style="left: 50%; top: 72%;">
              <div class="haven-player-inner">
                <img src="/assets/avatar_abil_hd.jpg" alt="Avatar Syma" class="haven-avatar-img">
                <div class="haven-avatar-badge" aria-hidden="true">☁️</div>
                <!-- Proximity Prompt Bubble -->
                <div class="haven-prompt" id="haven-interaction-prompt">
                  ✦ [E] Berinteraksi
                </div>
              </div>
            </div>

            <!-- Bottom Status Toast -->
            <div class="haven-bottom-bar" id="haven-bottom-status">
              ✦ ☁️ Memasuki THE PINWHEEL HAVEN — Syma's Floating Sky Residence
            </div>

            <!-- Touch D-Pad Controls for Mobile -->
            <div class="haven-dpad" aria-label="Kontrol Sentuh Pergerakan">
              <div></div>
              <button type="button" class="haven-dpad-btn" data-dir="up" aria-label="Atas">▲</button>
              <div></div>
              <button type="button" class="haven-dpad-btn" data-dir="left" aria-label="Kiri">◀</button>
              <div></div>
              <button type="button" class="haven-dpad-btn" data-dir="right" aria-label="Kanan">▶</button>
              <div></div>
              <button type="button" class="haven-dpad-btn" data-dir="down" aria-label="Bawah">▼</button>
              <div></div>
            </div>

            <!-- Interactive Modal Container -->
            <div class="haven-modal-overlay" id="haven-modal-overlay" role="dialog" aria-modal="true" aria-hidden="true">
              <div class="haven-modal-card">
                <div class="haven-modal-header">
                  <h3 class="haven-modal-title" id="haven-modal-title">Interaksi</h3>
                  <button type="button" class="haven-modal-close" id="btn-haven-modal-close" aria-label="Tutup Modal">&times;</button>
                </div>
                <div class="haven-modal-body" id="haven-modal-body"></div>
              </div>
            </div>

            <!-- Sleep Fade Overlay -->
            <div class="haven-sleep-overlay" id="haven-sleep-overlay" aria-hidden="true"></div>

          </div>
        </div>
      </section>
`;

  // Insert before </main>
  html = html.replace('</main>', havenSectionHtml + '\n    </main>');
  console.log('Added view-pinwheel-haven section');
}

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Successfully updated index.html! New length:', html.length);
