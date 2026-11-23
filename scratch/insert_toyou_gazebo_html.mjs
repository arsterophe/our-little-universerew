import fs from 'fs';

const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add CSS in head
if (!html.includes('/toyou_gazebo.css')) {
  html = html.replace('<link rel="stylesheet" href="/fairy_atelier.css">', '<link rel="stylesheet" href="/fairy_atelier.css">\n  <link rel="stylesheet" href="/toyou_gazebo.css">');
  console.log('Added /toyou_gazebo.css to <head>');
}

// 2. Add markup for view-toyou-gazebo
const toyouGazeboMarkup = `
      <!-- ================================================================= -->
      <!-- TO YOU GAZEBO — LALA (EVERGLOW MORNING GAZEBO)                   -->
      <!-- ================================================================= -->
      <section class="view-section view-toyou-gazebo" id="view-toyou-gazebo"
        aria-label="Gazebo Lala — TO YOU Everglow Morning Gazebo" aria-hidden="true">

        <!-- Background Artwork & Dynamic Lighting Layer -->
        <div class="tgazebo-scene-layer"></div>
        <div class="tgazebo-lighting-overlay light-golden" id="tgazebo-lighting-overlay" aria-hidden="true"></div>

        <!-- Drifting Flower Petals & Fairy Sparkles -->
        <div class="tgazebo-petals-layer" aria-hidden="true">
          <div class="tg-petal" style="left: 10%; animation-delay: 0s;">🌸</div>
          <div class="tg-petal" style="left: 25%; animation-delay: 2.2s; font-size: 0.9rem;">💜</div>
          <div class="tg-petal" style="left: 42%; animation-delay: 4.5s;">✨</div>
          <div class="tg-petal" style="left: 60%; animation-delay: 1.5s; font-size: 1.1rem;">🌸</div>
          <div class="tg-petal" style="left: 78%; animation-delay: 3.2s;">💜</div>
          <div class="tg-petal" style="left: 92%; animation-delay: 5.4s;">✨</div>
        </div>

        <!-- 1. TOP BAR HUD -->
        <header class="tgazebo-top-bar">
          <div class="tgazebo-brand-group">
            <button type="button" class="btn-tgazebo-back" id="btn-tgazebo-back"
              aria-label="Kembali ke Universe TO YOU">
              <span>←</span>
              <span>Kembali</span>
            </button>
            <div class="tgazebo-title-group">
              <span class="tgazebo-sun-icon" aria-hidden="true">☼</span>
              <div class="tgazebo-title-texts">
                <h1>TO YOU</h1>
                <p>Lala's Universe — Everglow Fairy</p>
              </div>
            </div>
            <p class="tgazebo-top-quote" id="tgazebo-top-quote">
              "A little closer, for a brighter tomorrow." — Lala ☼
            </p>
          </div>

          <!-- Active Character / Gardener Identity -->
          <div class="tgazebo-gardener-info" id="tgazebo-gardener-info"></div>

          <!-- Ambient Music Player Pill (Zero Autoplay) -->
          <div class="tgazebo-music-pill">
            <div class="tgazebo-music-title-wrap">
              <span class="tgazebo-music-icon" id="tgazebo-music-icon">🎵</span>
              <span id="tgazebo-track-title">Fairy Morning Lullaby</span>
            </div>
            <button type="button" class="btn-tgazebo-music-toggle" id="btn-tgazebo-music-toggle" aria-label="Putar / Jeda Musik">
              ▶
            </button>
            <div class="tgazebo-music-vol-group">
              <button type="button" class="btn-tgazebo-music-mute" id="btn-tgazebo-music-mute" aria-label="Mute / Unmute Musik">
                🔊
              </button>
              <input type="range" class="tgazebo-vol-slider" id="slider-tgazebo-music-vol" min="0" max="100" value="70"
                aria-label="Volume Musik">
            </div>
          </div>
        </header>

        <!-- 2. FOUR CENTRAL ACTIVITY CARDS -->
        <main class="tgazebo-center-stage">
          <div class="tgazebo-cards-grid">
            <!-- Card 1: Tea Time -->
            <div class="tgazebo-card" id="tgazebo-card-tea" role="button" tabindex="0" aria-label="Buka Tea Time">
              <div class="card-icon-halo">🫖</div>
              <h3>Tea Time</h3>
              <p>Nikmati seduhan teh kelopak bunga &amp; camilan manis peri ♡</p>
            </div>

            <!-- Card 2: Perpustakaan Kecil -->
            <div class="tgazebo-card" id="tgazebo-card-library" role="button" tabindex="0"
              aria-label="Buka Perpustakaan Kecil">
              <div class="card-icon-halo">📖</div>
              <h3>Perpustakaan Kecil</h3>
              <p>Baca dongeng &amp; kisah hangat dari seluruh semesta ♡</p>
            </div>

            <!-- Card 3: Jurnal Kenangan -->
            <div class="tgazebo-card" id="tgazebo-card-journal" role="button" tabindex="0" aria-label="Buka Jurnal Kenangan">
              <div class="card-icon-halo">📜</div>
              <h3>Jurnal Kenangan</h3>
              <p>Tulis renungan hati &amp; impian indah di bawah naungan bunga ♡</p>
            </div>

            <!-- Card 4: Quiet Moment -->
            <div class="tgazebo-card" id="tgazebo-card-quiet" role="button" tabindex="0" aria-label="Buka Quiet Moment">
              <div class="card-icon-halo">🔮</div>
              <h3>Quiet Moment</h3>
              <p>Dengarkan semilir angin wisteria &amp; gemericik sungai jernih ♡</p>
            </div>
          </div>
        </main>

        <!-- Hotspot Cat, Guitar & Lanterns for Interior Touch -->
        <div class="tg-hotspot-cat" id="hotspot-tg-cat" role="button" tabindex="0" title="Elus Kucing Putih yang Tidur di Sofa 🐾" aria-label="Elus Kucing Putih"></div>
        <div class="tg-hotspot-guitar" id="hotspot-tg-guitar" role="button" tabindex="0" title="Petik Gitar Akustik Peri 🎸" aria-label="Petik Gitar"></div>
        <div class="tg-hotspot-lanterns" id="hotspot-tg-lanterns" role="button" tabindex="0" title="Ganti Suasana Lentera 🕯️" aria-label="Ganti Lentera"></div>

        <!-- 3. BOTTOM ACTION DOCK (POJOK KIRI BAWAH) -->
        <footer class="tgazebo-bottom-bar">
          <div class="tgazebo-quick-actions" id="tgazebo-quick-actions">
            <!-- 🫖 Quick Action: Tea Time -->
            <button type="button" class="btn-tgazebo-circle-action" id="btn-tgazebo-quick-tea"
              data-tooltip="Tea Time — Nikmati Teh Hangat &amp; Camilan Peri"
              title="Tea Time — Nikmati Teh Hangat &amp; Camilan Peri"
              aria-label="Buka Tea Time">
              <span class="circle-action-icon">🫖</span>
            </button>

            <!-- 🎵 Quick Action: Songs We Share -->
            <button type="button" class="btn-tgazebo-circle-action" id="btn-tgazebo-songs-we-share"
              data-tooltip="Songs We Share — Rekomendasi Lagu Bersama"
              title="Songs We Share — Rekomendasi Lagu Bersama"
              aria-label="Buka Songs We Share">
              <span class="circle-action-icon">🎵</span>
            </button>
          </div>
        </footer>

        <!-- 4. GAZEBO MODAL DIALOG CONTAINER -->
        <div class="tgazebo-modal-backdrop" id="tgazebo-modal-backdrop" role="dialog" aria-modal="true"
          aria-hidden="true">
          <div class="tgazebo-modal-dialog">
            <div class="tgazebo-modal-header">
              <div class="tgazebo-modal-header-meta">
                <span class="tgazebo-modal-header-icon" id="tgazebo-modal-header-icon">🫖</span>
                <div>
                  <h2 id="tgazebo-modal-header-title">Aktivitas Gazebo</h2>
                  <p id="tgazebo-modal-header-sub">Suasana tenang pagi hari</p>
                </div>
              </div>
              <button type="button" class="btn-tgazebo-modal-close" id="btn-tgazebo-modal-close"
                aria-label="Tutup Dialog">✕</button>
            </div>

            <div class="tgazebo-modal-body" id="tgazebo-modal-body">
              <!-- Dynamically rendered by toyou_gazebo_view.js -->
            </div>
          </div>
        </div>

      </section>
`;

if (!html.includes('id="view-toyou-gazebo"')) {
  const marker = '<section class="view-section view-shadow-world" id="view-shadow-world"';
  html = html.replace(marker, `${toyouGazeboMarkup}\n\n      ${marker}`);
  console.log('Successfully inserted #view-toyou-gazebo into index.html');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('index.html updated successfully!');
