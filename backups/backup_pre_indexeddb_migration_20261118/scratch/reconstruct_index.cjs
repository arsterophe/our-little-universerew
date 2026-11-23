const fs = require('fs');

let distHtml = fs.readFileSync('dist/index.html', 'utf8').replace(/\r\n/g, '\n');

// Extract the body content from distHtml
const bodyStartTag = '<body>';
const bodyEndTag = '</body>';
const bodyStartIndex = distHtml.indexOf(bodyStartTag) + bodyStartTag.length;
const bodyEndIndex = distHtml.indexOf(bodyEndTag);

let bodyContent = distHtml.slice(bodyStartIndex, bodyEndIndex).trim();

// Head stylesheets
const headStyles = `<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Little Universe — Choose Your Universe</title>
  <meta name="description"
    content="Our Little Universe: Tiga dunia kecil, satu galaksi persahabatan privat untuk Nyanya, Lala, dan Lele.">

  <!-- Google Fonts: Cinzel, Cormorant Garamond, Plus Jakarta Sans, Alex Brush, and Great Vibes -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/orbit.css">
  <link rel="stylesheet" href="/moments.css">
  <link rel="stylesheet" href="/universes.css">
  <link rel="stylesheet" href="/shadow_kingdom.css">
  <link rel="stylesheet" href="/stories.css">
  <link rel="stylesheet" href="/photobooth.css">
  <link rel="stylesheet" href="/messages.css">
  <link rel="stylesheet" href="/games.css">
  <link rel="stylesheet" href="/universe_state.css">
  <link rel="stylesheet" href="/star_messages.css">
  <link rel="stylesheet" href="/mailbox.css">
  <link rel="stylesheet" href="/shadow_gazebo.css">
  <link rel="stylesheet" href="/shadow_garden.css">
  <link rel="stylesheet" href="/shadow_art_gallery.css">
  <link rel="stylesheet" href="/shadow_crystal_tower.css">
  <link rel="stylesheet" href="/everdream_house.css">
  <link rel="stylesheet" href="/greenhouse.css">
  <link rel="stylesheet" href="/kidult_gazebo.css">
  <link rel="stylesheet" href="/songs_we_share.css">
  <link rel="stylesheet" href="/bloom_cottage.css">
</head>

<body>`;

const bloomCottageSection = `
      <!-- ============================================== -->
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

const shadowMarker = '<section class="view-section view-shadow-world" id="view-shadow-world"';
if (!bodyContent.includes(shadowMarker)) {
  console.error('Shadow marker not found in bodyContent!');
  process.exit(1);
}

bodyContent = bodyContent.replace(shadowMarker, bloomCottageSection + '\n      ' + shadowMarker);

const finalHtml = headStyles + '\n' + bodyContent + '\n\n  <script type="module" src="/main.js"></script>\n</body>\n</html>\n';

fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log('Successfully reconstructed index.html with Bloom Cottage!');
