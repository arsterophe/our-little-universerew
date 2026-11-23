const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add kidult_house.css link to head if not present
if (!html.includes('/kidult_house.css')) {
  const cssTarget = '<link rel="stylesheet" href="/everdream_house.css">';
  if (html.includes(cssTarget)) {
    html = html.replace(cssTarget, cssTarget + '\n  <link rel="stylesheet" href="/kidult_house.css">');
    console.log('Added kidult_house.css link to head.');
  }
}

// 2. Locate start and end of view-everdream-house
const startSection = html.indexOf('<section class="view-section view-everdream-house');
const nextViewSection = html.indexOf('<!-- ==================================================== -->\n      <!-- VIEW: THE ENCHANTED GREENHOUSE', startSection);
const endSection = html.lastIndexOf('</section>', nextViewSection) + '</section>'.length;

console.log('view-everdream-house start:', startSection, 'end:', endSection);

const newKidultHouseHtml = `<section class="view-section view-everdream-house view-kidult-house atmo-twilight" id="view-everdream-house"
        aria-label="KIDULT DREAM HOUSE — The Everdream House (Nyanya ⭐)" aria-hidden="true">

        <!-- 2D Exploration Stage (16:9 Responsive) -->
        <div class="kidult-house-stage" id="kidult-house-stage" tabindex="0" role="region" aria-label="KIDULT Dream House Stage">

          <!-- Background Artwork Layer -->
          <div class="kidult-house-bg-layer" id="kidult-house-bg-layer" aria-hidden="true">
            <img src="/assets/kidult_house_living.jpg" alt="Interior KIDULT Dream House"
              class="kidult-house-bg-img" id="kidult-house-bg-img" fetchpriority="high">
          </div>

          <!-- Dynamic Atmosphere Lighting Overlay -->
          <div class="kidult-house-atmo-overlay" id="kidult-house-atmo-overlay" aria-hidden="true"></div>

          <!-- Drifting Stardust & Fireflies Particles -->
          <div class="kidult-house-particles-layer" aria-hidden="true">
            <span class="kidult-house-star s1">✦</span>
            <span class="kidult-house-star s2">✧</span>
            <span class="kidult-house-star s3">★</span>
            <span class="kidult-house-star s4">⋆</span>
            <span class="kidult-house-star s5">✦</span>
          </div>

          <!-- Interactive Hotspots Layer -->
          <div class="kidult-house-hotspots-layer" id="kidult-house-hotspots-container"></div>

          <!-- 2D Player Avatar: Nyanya ⭐ -->
          <div class="kidult-house-player-avatar" id="kidult-house-player-avatar">
            <div class="kidult-house-interaction-prompt" id="kidult-house-interaction-prompt" role="button" tabindex="0" aria-label="Interaksi">
              <span id="kidult-house-prompt-text">✦ [E] Interaksi</span>
            </div>
            <div class="kidult-avatar-body">
              <img src="/assets/chibi_nyanya_avatar.png" alt="Nyanya (The Starlight Dreamer)" class="kidult-avatar-img" id="kidult-avatar-img" width="76" height="96">
            </div>
            <div class="kidult-player-shadow"></div>
          </div>

          <!-- TOP-LEFT HUD: Return Orb & Room Title -->
          <div class="kidult-house-hud-topleft">
            <button type="button" class="kidult-house-back-orb" id="btn-kidult-house-back"
              title="Kembali ke Universe KIDULT" aria-label="Kembali ke Universe KIDULT">
              <span>←</span>
            </button>
            <button type="button" id="btn-everdream-back" style="display:none;" aria-hidden="true">←</button>
            <div class="kidult-house-title-badge">
              <h2 id="kidult-house-room-title">KIDULT Living Room</h2>
              <span id="kidult-house-room-subtitle">THE EVERDREAM HOUSE · Where Childhood Dreams Never Fade.</span>
            </div>
          </div>

          <!-- TOP-RIGHT HUD: Room Navigation Tabs & Quick Tools -->
          <div class="kidult-house-hud-topright">
            <div class="kidult-house-nav-pills" id="kidult-house-nav-pills" aria-label="Navigasi Ruangan">
              <button type="button" class="kidult-house-room-btn active" data-room-id="living" data-room="living" title="Living Room">
                <span>🛋️</span>
                <span>Living Room</span>
              </button>
              <button type="button" class="kidult-house-room-btn" data-room-id="bedroom" data-room="bedroom" title="Dreamy Bedroom">
                <span>🛏️</span>
                <span>Bedroom</span>
              </button>
              <button type="button" class="kidult-house-room-btn" data-room-id="kitchen" data-room="kitchen" title="Little Kitchen">
                <span>🍳</span>
                <span>Kitchen</span>
              </button>
              <button type="button" class="kidult-house-room-btn" data-room-id="hobby" data-room="atelier" title="Creative Hobby Room">
                <span>🎨</span>
                <span>Hobby Room</span>
              </button>
              <button type="button" class="kidult-house-room-btn" data-room-id="attic" data-room="attic" title="Memory Attic">
                <span>🗝️</span>
                <span>Memory Attic</span>
              </button>
            </div>

            <div class="kidult-house-hud-quick-tools">
              <button type="button" class="kidult-house-tool-btn" id="btn-kidult-tool-atmo" title="Ganti Suasana Cahaya (Siang/Sore/Malam)" aria-label="Ganti Pencahayaan">
                <span>🌤️</span>
              </button>
              <button type="button" class="kidult-house-tool-btn" id="btn-kidult-tool-tasks" title="Daftar Aktivitas Harian" aria-label="Aktivitas Harian">
                <span>📋</span>
              </button>
              <button type="button" class="kidult-house-tool-btn" id="btn-kidult-tool-bag" title="Tas &amp; Koleksi Pribadi" aria-label="Tas dan Koleksi">
                <span>🎒</span>
              </button>
            </div>
          </div>

          <!-- Bottom Control Hint -->
          <div class="kidult-house-hud-controls-hint" aria-hidden="true">
            <span>Gerakan:</span>
            <span class="kidult-house-kbd-pill">W</span>
            <span class="kidult-house-kbd-pill">A</span>
            <span class="kidult-house-kbd-pill">S</span>
            <span class="kidult-house-kbd-pill">D</span>
            <span>atau Panah · Interaksi:</span>
            <span class="kidult-house-kbd-pill">E</span>
          </div>

          <!-- Mobile Virtual Touch D-Pad -->
          <div class="kidult-house-touch-controls" id="kidult-house-touch-controls">
            <div class="kidult-house-dpad-grid" id="kidult-house-dpad">
              <button type="button" class="kidult-house-dpad-btn dpad-up" id="kidult-house-dpad-up" aria-label="Gerak Atas">▲</button>
              <button type="button" class="kidult-house-dpad-btn dpad-left" id="kidult-house-dpad-left" aria-label="Gerak Kiri">◀</button>
              <div class="kidult-house-dpad-btn dpad-center" aria-hidden="true">⭐</div>
              <button type="button" class="kidult-house-dpad-btn dpad-right" id="kidult-house-dpad-right" aria-label="Gerak Kanan">▶</button>
              <button type="button" class="kidult-house-dpad-btn dpad-down" id="kidult-house-dpad-down" aria-label="Gerak Bawah">▼</button>
            </div>
            <button type="button" class="kidult-house-touch-action-btn" id="kidult-house-touch-action" aria-label="Tombol Interaksi">
              <span>✦</span>
              <span>Aksi</span>
            </button>
          </div>

        </div>

        <!-- Activity Modal Backdrop -->
        <div class="kidult-house-modal-backdrop" id="kidult-house-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="kidult-house-modal-title">
          <div class="kidult-house-modal-card">
            <div class="kidult-house-modal-header">
              <h3 id="kidult-house-modal-title">Aktivitas KIDULT</h3>
              <button type="button" class="kidult-house-modal-close-btn" id="btn-kidult-modal-close" aria-label="Tutup dialog">✕</button>
            </div>
            <div class="kidult-house-modal-body" id="kidult-house-modal-body"></div>
          </div>
        </div>

        <!-- Peaceful Sleep Transition Overlay -->
        <div class="kidult-house-sleep-overlay" id="kidult-house-sleep-overlay" aria-hidden="true">
          <span class="kidult-sleep-star">⭐</span>
          <p class="kidult-sleep-text">Selamat beristirahat dalam buaian mimpi manis masa kecil...</p>
        </div>

        <!-- Legacy Integration & Accessibility Hooks -->
        <div class="everdream-legacy-hooks" style="display:none;" aria-hidden="true">
          <button type="button" data-atmo="twilight"></button>
          <button type="button" data-atmo="rosy"></button>
          <button type="button" data-atmo="morning"></button>
          <button type="button" data-atmo="starry"></button>
          <div data-room="exterior"></div>
          <button type="button" id="btn-cottage-door-enter"></button>
          <button type="button" id="btn-hub-greenhouse"></button>
          <button type="button" id="btn-hub-gazebo"></button>
          <button type="button" id="btn-hub-river"></button>
          <button type="button" id="btn-hub-picnic"></button>
          <div id="living-fireplace-visual"></div>
          <button type="button" id="btn-fireplace-toggle"></button>
          <button type="button" id="btn-living-sofa"></button>
          <button type="button" id="btn-bookshelf-open"></button>
          <div id="bedroom-starlamp-visual"></div>
          <button type="button" id="btn-starlamp-toggle"></button>
          <button type="button" id="btn-bedroom-rest"></button>
          <button type="button" id="btn-bedroom-desk"></button>
          <button type="button" id="btn-atelier-paint"></button>
          <button type="button" id="btn-atelier-scrapbook"></button>
          <button type="button" id="btn-kitchen-bake"></button>
          <button type="button" id="btn-memory-chest-open"></button>
          <div id="everdream-memory-modal"></div>
          <div id="everdream-bookshelf-modal"></div>
          <div id="everdream-journal-modal"></div>
          <div id="everdream-kitchen-modal"></div>
          <div id="everdream-sleep-overlay"></div>
        </div>

      </section>`;

html = html.substring(0, startSection) + newKidultHouseHtml + html.substring(endSection);

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with KIDULT DREAM HOUSE 2D simulation stage.');
