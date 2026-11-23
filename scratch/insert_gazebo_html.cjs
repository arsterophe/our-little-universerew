const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Insert button into #pinwheel-gazebo-modal
const gazeboModalP = `<p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Gazebo beratap pagoda terbuka di pinggir danau. Tirai putih melambai tertiup angin sepoi, menjadikannya
              tempat ternyaman untuk membaca buku.
            </p>`;

const gazeboModalButton = `
            <div style="margin-top:14px; padding-top:12px; border-top:1px solid rgba(244, 114, 182, 0.25); text-align:center;">
              <button type="button" class="btn-enter-pinwheel-gazebo" id="btn-enter-pinwheel-gazebo"
                style="width:100%; padding:11px 16px; border-radius:12px; background:linear-gradient(135deg, #f472b6, #a855f7); color:#ffffff; font-weight:700; font-size:0.9rem; border:1px solid rgba(255,255,255,0.25); box-shadow:0 6px 20px rgba(244,114,182,0.35); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                <span>Masuk ke Moonlit Blossom Gazebo</span>
                <span>🌸</span>
              </button>
            </div>`;

if (!html.includes('id="btn-enter-pinwheel-gazebo"')) {
  // Normalize CRLF to LF temporarily for matching
  const hasCRLF = html.includes('\r\n');
  const normalized = hasCRLF ? html.replace(/\r\n/g, '\n') : html;
  const target1 = `<p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">\n              Gazebo beratap pagoda terbuka di pinggir danau. Tirai putih melambai tertiup angin sepoi, menjadikannya\n              tempat ternyaman untuk membaca buku.\n            </p>`;
  
  if (normalized.includes(target1)) {
    const replaced = normalized.replace(target1, target1 + gazeboModalButton);
    html = hasCRLF ? replaced.replace(/\n/g, '\r\n') : replaced;
    console.log('Inserted #btn-enter-pinwheel-gazebo');
  } else {
    console.error('Target 1 not found in index.html');
  }
}

// 2. Insert view-pinwheel-gazebo section
const gazeboSection = `
      <!-- ============================================== -->
      <!-- VIEW: PINWHEEL — MOONLIT BLOSSOM GAZEBO (SYMA) -->
      <!-- ============================================== -->
      <section class="view-section view-pinwheel-gazebo" id="view-pinwheel-gazebo" aria-label="Moonlit Blossom Gazebo" aria-hidden="true">

        <!-- Background Atmospheric Vignette & Animated Layers -->
        <div class="pinwheel-gazebo-ambient-vignette" aria-hidden="true"></div>

        <!-- Falling Sakura Petals Layer -->
        <div class="pinwheel-gazebo-petals-layer" aria-hidden="true">
          <div class="pinwheel-gazebo-petal p1">🌸</div>
          <div class="pinwheel-gazebo-petal p2">🌸</div>
          <div class="pinwheel-gazebo-petal p3">🌸</div>
          <div class="pinwheel-gazebo-petal p4">🌸</div>
          <div class="pinwheel-gazebo-petal p5">🌸</div>
          <div class="pinwheel-gazebo-petal p6">🌸</div>
          <div class="pinwheel-gazebo-petal p7">🌸</div>
          <div class="pinwheel-gazebo-petal p8">🌸</div>
        </div>

        <!-- Glowing Butterflies Layer -->
        <div class="pinwheel-gazebo-butterflies-layer" aria-hidden="true">
          <div class="pinwheel-gazebo-butterfly b1">🦋</div>
          <div class="pinwheel-gazebo-butterfly b2">🦋</div>
          <div class="pinwheel-gazebo-butterfly b3">🦋</div>
          <div class="pinwheel-gazebo-butterfly b4">🦋</div>
        </div>

        <!-- Water Moonlight Shimmer Layer -->
        <div class="pinwheel-gazebo-water-shimmer" aria-hidden="true"></div>

        <!-- 1. TOP BAR -->
        <header class="pinwheel-gazebo-top-bar">
          <div class="pinwheel-gazebo-brand">
            <button type="button" class="btn-pinwheel-gazebo-back" id="btn-pinwheel-gazebo-back" aria-label="Kembali ke Universe PINWHEEL">
              <span>←</span>
              <span>Kembali ke PINWHEEL</span>
            </button>
            <div class="pinwheel-gazebo-title-group">
              <span class="pinwheel-gazebo-crescent" aria-hidden="true">🌸</span>
              <div class="pinwheel-gazebo-title-texts">
                <h1>PINWHEEL</h1>
                <p>Moonlit Blossom Gazebo — ✦</p>
              </div>
            </div>
            <p class="pinwheel-gazebo-subquote">
              "A peaceful little sanctuary beneath the cherry blossoms."
            </p>
          </div>

          <!-- Top Right: Independent Instrumental Music Player (PINWHEEL MELODY) -->
          <div class="pinwheel-gazebo-music-pill" id="pinwheel-gazebo-music-pill">
            <div class="music-title-wrap">
              <span class="music-note-icon" id="pinwheel-gazebo-music-icon">🎵</span>
              <span>PINWHEEL Melody</span>
            </div>
            <button type="button" class="btn-pinwheel-music-play" id="btn-pinwheel-gazebo-music-toggle" aria-label="Putar / Jeda Musik">
              ▶
            </button>
            <div class="music-vol-group">
              <button type="button" class="btn-pinwheel-music-mute" id="btn-pinwheel-gazebo-music-mute" aria-label="Mute / Unmute Musik">
                🔊
              </button>
              <input type="range" class="gazebo-vol-slider" id="slider-pinwheel-gazebo-music-vol" min="0" max="100" value="70"
                aria-label="Volume Musik">
            </div>
          </div>
        </header>

        <!-- 2. FOUR CENTRAL ACTIVITY CARDS -->
        <main class="pinwheel-gazebo-center-stage">
          <div class="pinwheel-gazebo-cards-grid">
            <!-- Card 1: Tea Time -->
            <div class="pinwheel-gazebo-card" id="pinwheel-gazebo-card-tea" role="button" tabindex="0" aria-label="Buka Tea Time">
              <div class="card-icon-halo">🫖</div>
              <h3>Tea Time</h3>
              <p>Nikmati seduhan teh hangat di bawah naungan sakura ♡</p>
            </div>

            <!-- Card 2: Perpustakaan Kecil -->
            <div class="pinwheel-gazebo-card" id="pinwheel-gazebo-card-library" role="button" tabindex="0"
              aria-label="Buka Perpustakaan Kecil">
              <div class="card-icon-halo">📖</div>
              <h3>Perpustakaan Kecil</h3>
              <p>Jelajahi dan baca karya sastra Our Little Universe ♡</p>
            </div>

            <!-- Card 3: Memory Journal -->
            <div class="pinwheel-gazebo-card" id="pinwheel-gazebo-card-journal" role="button" tabindex="0" aria-label="Buka Jurnal Kenangan">
              <div class="card-icon-halo">📜</div>
              <h3>Memory Journal</h3>
              <p>Catat kenangan dan refleksi hatimu di bawah rembulan ♡</p>
            </div>

            <!-- Card 4: Quiet Moment -->
            <div class="pinwheel-gazebo-card" id="pinwheel-gazebo-card-quiet" role="button" tabindex="0" aria-label="Buka Quiet Moment">
              <div class="card-icon-halo">🌸</div>
              <h3>Quiet Moment</h3>
              <p>Resapi keheningan malam dan suasana damai gazebo ♡</p>
            </div>
          </div>
        </main>

        <!-- 3. BOTTOM FOOTER & BADGES -->
        <footer class="pinwheel-gazebo-bottom-bar">
          <!-- Bottom Left: Personal Quote of Syma -->
          <div class="pinwheel-gazebo-quote-card">
            <span class="quote-star-icon">✦</span>
            <div class="quote-text-wrap">
              <p class="quote-phrase">"Even when the wind changes, a little heart can still find its way home."</p>
              <span class="quote-author">— Syma · PINWHEEL</span>
            </div>
          </div>

          <!-- Bottom Right: Table Tea Indicator -->
          <div class="pinwheel-gazebo-table-tea-indicator" id="pinwheel-gazebo-table-tea-indicator" role="button" tabindex="0" title="Klik untuk mengganti sajian teh">
            <span>🌸</span>
            <span id="pinwheel-gazebo-table-tea-text">Sakura Tea · Sedang Disajikan 🍵</span>
          </div>
        </footer>

        <!-- 4. GAZEBO MODAL DIALOG CONTAINER -->
        <div class="pinwheel-gazebo-modal-backdrop" id="pinwheel-gazebo-modal-backdrop" role="dialog" aria-modal="true"
          aria-hidden="true">
          <div class="pinwheel-gazebo-modal-dialog">
            <div class="pinwheel-gazebo-modal-header">
              <div class="modal-header-meta">
                <span class="modal-header-icon" id="pinwheel-gazebo-modal-header-icon">🌸</span>
                <div>
                  <h2 id="pinwheel-gazebo-modal-header-title">Aktivitas Gazebo</h2>
                  <p id="pinwheel-gazebo-modal-header-sub">Suasana tenang di bawah naungan sakura</p>
                </div>
              </div>
              <button type="button" class="btn-pinwheel-gazebo-modal-close" id="btn-pinwheel-gazebo-modal-close"
                aria-label="Tutup Dialog">✕</button>
            </div>

            <div class="pinwheel-gazebo-modal-body" id="pinwheel-gazebo-modal-body">
              <!-- Dynamically rendered by pinwheel_gazebo_view.js -->
            </div>
          </div>
        </div>

      </section>
`;

if (!html.includes('id="view-pinwheel-gazebo"')) {
  const hasCRLF = html.includes('\r\n');
  const normalized = hasCRLF ? html.replace(/\r\n/g, '\n') : html;
  
  const target2 = `            <div class="levelup-reward">Hadiah Terbuka: Umpan Bunga (Flower Bait)</div>
            <button type="button" class="btn-catch-action primary" id="btn-close-levelup-modal" style="margin-top: 18px; width: 100%;">
              Lanjutkan Petualangan Memancing 🎐
            </button>
          </div>
        </div>

      </section>`;

  if (normalized.includes(target2)) {
    const replaced = normalized.replace(target2, target2 + '\n' + gazeboSection);
    html = hasCRLF ? replaced.replace(/\n/g, '\r\n') : replaced;
    console.log('Inserted view-pinwheel-gazebo section');
  } else {
    console.error('Target 2 not found in index.html');
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Updated index.html successfully!');

