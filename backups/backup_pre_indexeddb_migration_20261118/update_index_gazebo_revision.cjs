const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add songs_we_share.css in head
if (!html.includes('/songs_we_share.css')) {
  html = html.replace(
    '<link rel="stylesheet" href="/kidult_gazebo.css">',
    '<link rel="stylesheet" href="/kidult_gazebo.css">\n  <link rel="stylesheet" href="/songs_we_share.css">'
  );
  console.log('✓ songs_we_share.css added to <head>');
}

// 2. Replace view-kidult-gazebo with the revised structure
const startKidultMarker = '      <!-- VIEW 3B-3: KIDULT — GAZEBO NYANYA (MEMORY GARDEN) -->';
const altStartMarker = '      <!-- VIEW 3B-3: KIDULT — GAZEBO NYANYA';
const endKidultMarker = '      <section class="view-section view-toyou-world" id="view-toyou-world"';

let startIdx = html.indexOf(startKidultMarker);
if (startIdx === -1) {
  startIdx = html.indexOf(altStartMarker);
}
const endIdx = html.indexOf(endKidultMarker);

if (startIdx !== -1 && endIdx !== -1) {
  const newKidultGazeboHtml = `      <!-- VIEW 3B-3: KIDULT — GAZEBO NYANYA (EVERDREAM GAZEBO) -->
      <!-- ============================================== -->
      <section class="view-section view-kidult-gazebo" id="view-kidult-gazebo"
        aria-label="Gazebo Nyanya — KIDULT Everdream Gazebo" aria-hidden="true">

        <!-- Background Artwork & Dynamic Lighting Layer -->
        <div class="kgazebo-scene-layer"></div>
        <div class="kgazebo-lighting-overlay light-golden" id="kgazebo-lighting-overlay" aria-hidden="true"></div>

        <!-- Drifting Wisteria Petals & Magical Starlight -->
        <div class="kgazebo-petals-layer" aria-hidden="true">
          <div class="kg-petal" style="left: 12%; animation-delay: 0s;">🌸</div>
          <div class="kg-petal" style="left: 28%; animation-delay: 2.5s; font-size: 0.9rem;">💜</div>
          <div class="kg-petal" style="left: 45%; animation-delay: 4.8s;">✨</div>
          <div class="kg-petal" style="left: 64%; animation-delay: 1.2s; font-size: 1.1rem;">🌸</div>
          <div class="kg-petal" style="left: 82%; animation-delay: 3.4s;">💜</div>
          <div class="kg-petal" style="left: 93%; animation-delay: 5.6s;">✨</div>
        </div>

        <!-- 1. TOP BAR HUD (MATCHING LELE'S GAZEBO STRUCTURE IN KIDULT PALETTE) -->
        <header class="kgazebo-top-bar">
          <div class="kgazebo-brand-group">
            <button type="button" class="btn-kgazebo-back" id="btn-kgazebo-back"
              aria-label="Kembali ke Universe KIDULT">
              <span>←</span>
              <span>Kembali</span>
            </button>
            <div class="kgazebo-title-group">
              <span class="kgazebo-star-icon" aria-hidden="true">⭐</span>
              <div class="kgazebo-title-texts">
                <h1>KIDULT</h1>
                <p>Nyanya's Universe — ✦</p>
              </div>
            </div>
            <p class="kgazebo-top-quote" id="kgazebo-top-quote">
              "Di sini, kita selalu boleh menjadi anak kecil lagi yang berani bermimpi." — Nyanya ⭐
            </p>
          </div>

          <!-- Ambient Music Player Pill (Zero Autoplay) -->
          <div class="kgazebo-music-pill">
            <div class="kgazebo-music-title-wrap">
              <span class="kgazebo-music-icon" id="kgazebo-music-icon">🎵</span>
              <span id="kgazebo-track-title">Fairytale Lullaby</span>
            </div>
            <button type="button" class="btn-kgazebo-music-toggle" id="btn-kgazebo-music-toggle" aria-label="Putar / Jeda Musik">
              ▶
            </button>
            <div class="kgazebo-music-vol-group">
              <button type="button" class="btn-kgazebo-music-mute" id="btn-kgazebo-music-mute" aria-label="Mute / Unmute Musik">
                🔊
              </button>
              <input type="range" class="kgazebo-vol-slider" id="slider-kgazebo-music-vol" min="0" max="100" value="70"
                aria-label="Volume Musik">
            </div>
          </div>
        </header>

        <!-- 2. FOUR CENTRAL ACTIVITY CARDS -->
        <main class="kgazebo-center-stage">
          <div class="kgazebo-cards-grid">
            <!-- Card 1: Tea Time -->
            <div class="kgazebo-card" id="kgazebo-card-tea" role="button" tabindex="0" aria-label="Buka Tea Time">
              <div class="card-icon-halo">🫖</div>
              <h3>Tea Time</h3>
              <p>Nikmati teh hangat &amp; camilan manis di taman bintang ♡</p>
            </div>

            <!-- Card 2: Perpustakaan Kecil -->
            <div class="kgazebo-card" id="kgazebo-card-library" role="button" tabindex="0"
              aria-label="Buka Perpustakaan Kecil">
              <div class="card-icon-halo">📖</div>
              <h3>Perpustakaan Kecil</h3>
              <p>Baca dongeng &amp; karya cerita yang pernah kamu tulis ♡</p>
            </div>

            <!-- Card 3: Jurnal Malam -->
            <div class="kgazebo-card" id="kgazebo-card-journal" role="button" tabindex="0" aria-label="Buka Jurnal Malam">
              <div class="card-icon-halo">📜</div>
              <h3>Jurnal Malam</h3>
              <p>Tulis renungan &amp; temukan kembali sisi kecil dalam dirimu ♡</p>
            </div>

            <!-- Card 4: Quiet Moment -->
            <div class="kgazebo-card" id="kgazebo-card-quiet" role="button" tabindex="0" aria-label="Buka Quiet Moment">
              <div class="card-icon-halo">🔮</div>
              <h3>Quiet Moment</h3>
              <p>Dengarkan suara alam wisteria &amp; nikmati ketenangan langit senja ♡</p>
            </div>
          </div>
        </main>

        <!-- Hotspot Puppy & Lanterns for Interior Touch -->
        <div class="kg-hotspot-puppy" id="hotspot-kg-puppy" role="button" tabindex="0" title="Elus Mochi Anak Anjing Tidur 🐾" aria-label="Elus Mochi"></div>
        <div id="hotspot-kg-lanterns" style="position: absolute; top: 18%; left: 46%; width: 90px; height: 90px; cursor: pointer; z-index: 5;" title="Ganti Suasana Lentera 🕯️" aria-label="Ganti Lentera"></div>

        <!-- 3. BOTTOM FOOTER & BADGES -->
        <footer class="kgazebo-bottom-bar">
          <div class="kgazebo-serenity-badge" id="kgazebo-serenity-badge">
            <span class="kgazebo-badge-star">⭐</span>
            <span class="kgazebo-badge-quote" id="kgazebo-badge-quote-text">
              "Sometimes, growing up means learning to hold the little child inside you a little closer." — Nyanya ⭐
            </span>
          </div>

          <div class="kgazebo-bottom-right-group">
            <div class="kgazebo-table-tea-indicator" id="kgazebo-table-tea-indicator">
              <span>🍵</span>
              <span id="kgazebo-table-tea-text">Star Lavender Tea · Siap Diseduh ⭐</span>
            </div>
            <button type="button" class="btn-kgazebo-songs-we-share" id="btn-kgazebo-songs-we-share" aria-label="Buka Songs We Share">
              <span>🎵</span> Songs We Share
            </button>
          </div>
        </footer>

        <!-- 4. GAZEBO MODAL DIALOG CONTAINER -->
        <div class="kgazebo-modal-backdrop" id="kgazebo-modal-backdrop" role="dialog" aria-modal="true"
          aria-hidden="true">
          <div class="kgazebo-modal-dialog">
            <div class="kgazebo-modal-header">
              <div class="kgazebo-modal-header-meta">
                <span class="kgazebo-modal-header-icon" id="kgazebo-modal-header-icon">🫖</span>
                <div>
                  <h2 id="kgazebo-modal-header-title">Aktivitas Gazebo</h2>
                  <p id="kgazebo-modal-header-sub">Suasana tenang malam hari</p>
                </div>
              </div>
              <button type="button" class="btn-kgazebo-modal-close" id="btn-kgazebo-modal-close"
                aria-label="Tutup Dialog">✕</button>
            </div>

            <div class="kgazebo-modal-body" id="kgazebo-modal-body">
              <!-- Dynamically rendered by kidult_gazebo_view.js -->
            </div>
          </div>
        </div>

      </section>

`;

  html = html.substring(0, startIdx) + newKidultGazeboHtml + html.substring(endIdx);
  console.log('✓ view-kidult-gazebo replaced successfully');
} else {
  console.error('✗ Failed to locate view-kidult-gazebo markers');
}

// 3. Add Songs We Share button to view-shadow-gazebo bottom bar if not present
if (!html.includes('id="btn-gazebo-songs-we-share"')) {
  const shadowIndicatorMarker = '<div class="gazebo-table-tea-indicator" id="gazebo-table-tea-indicator">';
  const newShadowBottomRight = `<div style="display: flex; align-items: center; gap: 0.85rem; pointer-events: auto;">
            <div class="gazebo-table-tea-indicator" id="gazebo-table-tea-indicator">
              <span>🍵</span>
              <span id="gazebo-table-tea-text">Jasmine Tea · Sedang Disajikan 🌙</span>
            </div>
            <button type="button" class="btn-gazebo-songs-we-share" id="btn-gazebo-songs-we-share" aria-label="Buka Songs We Share">
              <span>🎵</span> Songs We Share
            </button>
          </div>`;

  const shadowOldSection = `<div class="gazebo-table-tea-indicator" id="gazebo-table-tea-indicator">
            <span>🍵</span>
            <span id="gazebo-table-tea-text">Jasmine Tea · Sedang Disajikan 🌙</span>
          </div>`;

  if (html.includes(shadowOldSection)) {
    html = html.replace(shadowOldSection, newShadowBottomRight);
    console.log('✓ Songs We Share button added to view-shadow-gazebo');
  } else if (html.includes(shadowIndicatorMarker)) {
    console.log('shadow indicator marker found, adjusting replacement');
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('All index.html updates written successfully.');
