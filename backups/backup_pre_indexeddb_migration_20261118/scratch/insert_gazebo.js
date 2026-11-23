import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf-8');

const gazeboSection = `
      <!-- ============================================== -->
      <!-- VIEW: SHADOW — MOONLIT SERENITY GAZEBO         -->
      <!-- LELE'S UNIVERSE IMMERSIVE GAZEBO SANCTUARY     -->
      <!-- ============================================== -->
      <section class="view-section view-shadow-gazebo" id="view-shadow-gazebo"
        aria-label="Moonlit Serenity Gazebo" aria-hidden="true">

        <!-- Background Atmospheric Vignette & Gentle Fireflies -->
        <div class="gazebo-ambient-vignette" aria-hidden="true"></div>
        <div class="gazebo-fireflies-layer" aria-hidden="true">
          <div class="gazebo-firefly" style="width: 5px; height: 5px; top: 35%; left: 22%; animation-delay: 0s;"></div>
          <div class="gazebo-firefly" style="width: 6px; height: 6px; top: 55%; left: 68%; animation-delay: 2.5s;"></div>
          <div class="gazebo-firefly" style="width: 4px; height: 4px; top: 25%; left: 78%; animation-delay: 5s;"></div>
          <div class="gazebo-firefly" style="width: 7px; height: 7px; top: 72%; left: 38%; animation-delay: 1.2s;"></div>
          <div class="gazebo-firefly" style="width: 5px; height: 5px; top: 48%; left: 88%; animation-delay: 3.8s;"></div>
        </div>

        <!-- 1. TOP BAR -->
        <header class="gazebo-top-bar">
          <div class="gazebo-brand-area">
            <button type="button" class="btn-gazebo-back" id="btn-gazebo-back" aria-label="Kembali ke Universe SHADOW">
              <span>←</span>
              <span>Kembali</span>
            </button>
            <div class="gazebo-title-group">
              <span class="gazebo-crescent-icon" aria-hidden="true">☾</span>
              <div class="gazebo-title-texts">
                <h1>SHADOW</h1>
                <p>Lele's Universe — ✦</p>
              </div>
            </div>
            <p class="gazebo-hero-quote">
              "Di sini, semua pikiran bisa beristirahat... dan cerita-cerita baru bisa dimulai." — Lele ♡
            </p>
          </div>

          <!-- Ambient Music Player Pill -->
          <div class="gazebo-music-pill">
            <div class="music-title-wrap">
              <span class="music-note-icon" id="gazebo-music-icon">🎵</span>
              <span>Seruling Malam</span>
            </div>
            <button type="button" class="btn-music-play" id="btn-gazebo-music-toggle" aria-label="Putar / Jeda Musik">
              ▶
            </button>
            <div class="music-vol-group">
              <button type="button" class="btn-music-mute" id="btn-gazebo-music-mute" aria-label="Mute / Unmute Musik">
                🔊
              </button>
              <input type="range" class="gazebo-vol-slider" id="slider-gazebo-music-vol" min="0" max="100" value="70" aria-label="Volume Musik">
            </div>
            <!-- Audio element ready for external / local asset -->
            <audio id="audio-gazebo-seruling" src="/assets/seruling_malam.mp3" preload="none"></audio>
          </div>
        </header>

        <!-- 2. FOUR CENTRAL ACTIVITY CARDS -->
        <main class="gazebo-center-stage">
          <div class="gazebo-cards-grid">
            <!-- Card 1: Tea Time -->
            <div class="gazebo-card" id="gazebo-card-tea" role="button" tabindex="0" aria-label="Buka Tea Time">
              <div class="card-icon-halo">🫖</div>
              <h3>Tea Time</h3>
              <p>Nikmati teh hangat di bawah cahaya bulan ♡</p>
            </div>

            <!-- Card 2: Perpustakaan Kecil -->
            <div class="gazebo-card" id="gazebo-card-library" role="button" tabindex="0" aria-label="Buka Perpustakaan Kecil">
              <div class="card-icon-halo">📖</div>
              <h3>Perpustakaan Kecil</h3>
              <p>Baca karya cerita yang pernah kamu tulis ♡</p>
            </div>

            <!-- Card 3: Jurnal Malam -->
            <div class="gazebo-card" id="gazebo-card-journal" role="button" tabindex="0" aria-label="Buka Jurnal Malam">
              <div class="card-icon-halo">📜</div>
              <h3>Jurnal Malam</h3>
              <p>Tulis catatan di bawah langit malam ♡</p>
            </div>

            <!-- Card 4: Quiet Moment -->
            <div class="gazebo-card" id="gazebo-card-quiet" role="button" tabindex="0" aria-label="Buka Quiet Moment">
              <div class="card-icon-halo">🔮</div>
              <h3>Quiet Moment</h3>
              <p>Dengarkan suara malam dan nikmati ketenangan ♡</p>
            </div>
          </div>
        </main>

        <!-- 3. BOTTOM FOOTER & BADGES -->
        <footer class="gazebo-bottom-bar">
          <div class="gazebo-serenity-badge">
            <span class="badge-star-icon">✦</span>
            <span class="badge-quote-text">Gazebo ini adalah tempat kecil untuk bermimpi, membaca, dan merasa tenang. — Lele ♡</span>
          </div>

          <div class="gazebo-table-tea-indicator" id="gazebo-table-tea-indicator">
            <span>🍵</span>
            <span id="gazebo-table-tea-text">Jasmine Tea · Sedang Disajikan 🌙</span>
          </div>
        </footer>

        <!-- 4. GAZEBO MODAL DIALOG CONTAINER -->
        <div class="gazebo-modal-backdrop" id="gazebo-modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="gazebo-modal-dialog">
            <div class="gazebo-modal-header">
              <div class="modal-header-meta">
                <span class="modal-header-icon" id="gazebo-modal-header-icon">🍵</span>
                <div>
                  <h2 id="gazebo-modal-header-title">Aktivitas Gazebo</h2>
                  <p id="gazebo-modal-header-sub">Suasana tenang malam hari</p>
                </div>
              </div>
              <button type="button" class="btn-gazebo-modal-close" id="btn-gazebo-modal-close" aria-label="Tutup Dialog">✕</button>
            </div>

            <div class="gazebo-modal-body" id="gazebo-modal-body">
              <!-- Dynamically rendered by shadow_gazebo_view.js -->
            </div>
          </div>
        </div>

      </section>
`;

const marker = 'id="btn-shadow-decor-reset">Reset Default</button>';
const markerIdx = html.indexOf(marker);

if (markerIdx === -1) {
  console.error('Marker not found');
  process.exit(1);
}

// Find closing </section> of view-shadow-world after marker
const closeSectionIdx = html.indexOf('</section>', markerIdx);
if (closeSectionIdx === -1) {
  console.error('Closing section not found');
  process.exit(1);
}

const insertionPoint = closeSectionIdx + '</section>'.length;
const updatedHtml = html.slice(0, insertionPoint) + gazeboSection + html.slice(insertionPoint);

fs.writeFileSync('index.html', updatedHtml, 'utf-8');
console.log('Inserted view-shadow-gazebo successfully!');

