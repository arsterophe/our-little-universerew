const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Normalize line endings to \n for consistent matching
const isCrlf = html.includes('\r\n');
if (isCrlf) {
  html = html.replace(/\r\n/g, '\n');
}

const target1 = '<link rel="stylesheet" href="/songs_we_share.css">\n</head>';
const repl1 = '<link rel="stylesheet" href="/songs_we_share.css">\n  <link rel="stylesheet" href="/bloom_cottage.css">\n</head>';

if (!html.includes(target1)) {
  console.error('Target 1 still not found, checking nearby:');
  const idx = html.indexOf('/songs_we_share.css');
  console.log(JSON.stringify(html.slice(idx - 20, idx + 60)));
  process.exit(1);
}

const target2 = `      <!-- ============================================== -->
      <!-- VIEW 3D: SHADOW — 2D CRYSTAL MOON SANCTUARY    -->`;

if (!html.includes(target2)) {
  console.error('Target 2 not found!');
  process.exit(1);
}

const bloomCottageHtml = `      <!-- ============================================== -->
      <!-- VIEW: ENCHANTED BLOOM COTTAGE — LALA (TO YOU)  -->
      <!-- ============================================== -->
      <section class="view-section view-bloom-cottage atmo-day" id="view-bloom-cottage"
        aria-label="Enchanted Bloom Cottage — Lala's Fairy Home" aria-hidden="true">

        <!-- 2D Exploration Stage -->
        <div class="bloom-cottage-stage" id="bloom-cottage-stage">

          <!-- Background Artwork Layer -->
          <div class="bloom-room-bg-layer" id="bloom-room-bg-layer">
            <img src="/assets/bloom_cottage_living.jpg" alt="Interior Enchanted Bloom Cottage"
              class="bloom-room-bg-img" id="bloom-room-bg-img" loading="lazy" decoding="async">
          </div>

          <!-- Dynamic Atmosphere Lighting Overlay -->
          <div class="bloom-atmo-overlay" id="bloom-atmo-overlay"></div>

          <!-- Drifting Fairy Sparkles & Petals Particles -->
          <div class="bloom-particles-layer" aria-hidden="true">
            <span class="bloom-sparkle sp1">✦</span>
            <span class="bloom-sparkle sp2">✧</span>
            <span class="bloom-sparkle sp3">★</span>
            <span class="bloom-sparkle sp4">⋆</span>
            <span class="bloom-sparkle sp5">✦</span>
          </div>

          <!-- Interactive Hotspots Layer -->
          <div class="bloom-hotspots-layer" id="bloom-hotspots-container"></div>

          <!-- 2D Player Avatar Character -->
          <div class="bloom-player-avatar" id="bloom-player-avatar">
            <div class="bloom-interaction-prompt" id="bloom-interaction-prompt" role="button" tabindex="0">
              <span id="bloom-prompt-text">✦ [E] Interaksi</span>
            </div>
            <div class="bloom-avatar-body">
              <span class="bloom-fairy-wing wing-left"></span>
              <img src="/assets/chibi_lala_avatar.png" alt="Chibi Lala" class="bloom-avatar-img" id="bloom-avatar-img">
              <span class="bloom-fairy-wing wing-right"></span>
            </div>
            <div class="bloom-player-shadow"></div>
          </div>

          <!-- TOP-LEFT HUD: Return Orb & Room Title -->
          <div class="bloom-hud-topleft">
            <button type="button" class="bloom-back-orb" id="btn-bcottage-back"
              title="Kembali ke Pulau TO YOU" aria-label="Kembali ke pulau TO YOU">
              <span>←</span>
            </button>
            <div class="bloom-title-badge">
              <h2 id="bloom-room-title">Bloom Living Room</h2>
              <span id="bloom-room-subtitle">ENCHANTED BLOOM COTTAGE · LALA</span>
            </div>
          </div>

          <!-- TOP-RIGHT HUD: Room Navigation Tabs & Quick Tools -->
          <div class="bloom-hud-topright">
            <div class="bloom-nav-pills" id="bloom-nav-pills">
              <button type="button" class="bloom-room-btn active" data-room-id="living" title="Living Room">
                <span>🛋️</span>
                <span>Living Room</span>
              </button>
              <button type="button" class="bloom-room-btn" data-room-id="bedroom" title="Dreamy Bedroom">
                <span>🛏️</span>
                <span>Bedroom</span>
              </button>
              <button type="button" class="bloom-room-btn" data-room-id="kitchen" title="Sweetheart Kitchen">
                <span>🍳</span>
                <span>Kitchen</span>
              </button>
              <button type="button" class="bloom-room-btn" data-room-id="conservatory" title="Butterfly Conservatory">
                <span>🦋</span>
                <span>Conservatory</span>
              </button>
              <button type="button" class="bloom-room-btn" data-room-id="attic" title="Memory Attic">
                <span>🗝️</span>
                <span>Memory Attic</span>
              </button>
            </div>

            <div class="bloom-hud-quick-tools">
              <button type="button" class="bloom-tool-btn" id="btn-bcottage-atmo" title="Ganti Suasana Cahaya (Siang/Sore/Malam)" aria-label="Ganti Pencahayaan">
                <span>🌤️</span>
              </button>
              <button type="button" class="bloom-tool-btn" id="btn-bcottage-tasks" title="Daftar Aktivitas Harian" aria-label="Aktivitas Harian">
                <span>📋</span>
              </button>
              <button type="button" class="bloom-tool-btn" id="btn-bcottage-bag" title="Tas & Koleksi Pribadi" aria-label="Tas dan Koleksi">
                <span>🎒</span>
              </button>
            </div>
          </div>

          <!-- Bottom Control Hint -->
          <div class="bloom-hud-controls-hint" aria-hidden="true">
            <span>Gerakan:</span>
            <span class="bloom-kbd-pill">W</span>
            <span class="bloom-kbd-pill">A</span>
            <span class="bloom-kbd-pill">S</span>
            <span class="bloom-kbd-pill">D</span>
            <span>atau Panah · Interaksi:</span>
            <span class="bloom-kbd-pill">E</span>
          </div>

          <!-- Mobile Virtual Touch D-Pad -->
          <div class="bloom-touch-controls" id="bloom-touch-controls">
            <div class="bloom-dpad-grid">
              <button type="button" class="bloom-dpad-btn dpad-up" id="bloom-dpad-up" aria-label="Gerak Atas">▲</button>
              <button type="button" class="bloom-dpad-btn dpad-left" id="bloom-dpad-left" aria-label="Gerak Kiri">◀</button>
              <button type="button" class="bloom-dpad-btn dpad-center" aria-hidden="true">🌸</button>
              <button type="button" class="bloom-dpad-btn dpad-right" id="bloom-dpad-right" aria-label="Gerak Kanan">▶</button>
              <button type="button" class="bloom-dpad-btn dpad-down" id="bloom-dpad-down" aria-label="Gerak Bawah">▼</button>
            </div>
            <button type="button" class="bloom-touch-action-btn" id="bloom-touch-action" aria-label="Tombol Interaksi">
              <span>✦</span>
              <span>Aksi</span>
            </button>
          </div>

        </div>

        <!-- Activity Modal Backdrop -->
        <div class="bloom-modal-backdrop" id="bloom-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="bloom-modal-title">
          <div class="bloom-modal-card">
            <div class="bloom-modal-header">
              <h3 id="bloom-modal-title">Aktivitas Peri</h3>
              <button type="button" class="bloom-modal-close" id="btn-bloom-modal-close" aria-label="Tutup dialog">✕</button>
            </div>
            <div class="bloom-modal-body" id="bloom-modal-body"></div>
          </div>
        </div>

        <!-- Peaceful Sleep Transition Overlay -->
        <div class="bloom-sleep-overlay" id="bloom-sleep-overlay" aria-hidden="true">
          <span class="bloom-sleep-moon">🌙</span>
          <p class="bloom-sleep-text">Selamat beristirahat dalam buaian mimpi peri...</p>
        </div>

      </section>

`;

let updatedHtml = html.replace(target1, repl1);
updatedHtml = updatedHtml.replace(target2, bloomCottageHtml + target2);

if (isCrlf) {
  updatedHtml = updatedHtml.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', updatedHtml, 'utf8');
console.log('Successfully updated index.html with Bloom Cottage markup and CSS link!');
