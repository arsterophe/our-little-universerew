/**
 * scratch/insert_usagain_section.cjs
 * Safely inserts Ela's Universe (THE SILENT LOTUS — US AGAIN 🌸) section into index.html
 */

const fs = require('fs');
const path = require('path');

const indexPath = path.resolve(__dirname, '../index.html');
let html = fs.readFileSync(indexPath, 'utf-8');

const targetAnchor = '      <!-- VIEW: SHADOW — MOONLIT SERENITY GAZEBO';

if (!html.includes(targetAnchor)) {
  console.error('Target anchor not found!');
  process.exit(1);
}

if (html.includes('id="view-usagain-world"')) {
  console.log('view-usagain-world already present in index.html!');
  process.exit(0);
}

const usagainSectionHtml = `      <!-- ============================================== -->
      <!-- VIEW: US AGAIN — THE SILENT LOTUS (ELA)         -->
      <!-- A SANCTUARY OF STILLNESS                         -->
      <!-- ============================================== -->
      <section class="view-section view-usagain-world" id="view-usagain-world" aria-label="The Silent Lotus" aria-hidden="true">
        <div class="usagain-world-viewport">
          <!-- Background Artwork Layer -->
          <div class="usagain-world-bg" id="usagain-world-bg" aria-hidden="true"></div>

          <!-- Atmospheric Vignette & Soft Mist -->
          <div class="usagain-world-overlay" aria-hidden="true"></div>

          <!-- Canvas for Falling Lotus Petals & Glowing Butterflies -->
          <canvas class="usagain-fx-canvas" id="usagain-fx-canvas" aria-hidden="true"></canvas>

          <!-- Top Header Navigation Bar -->
          <header class="usagain-top-header">
            <!-- Left: Ela Profile Pill Header -->
            <div class="usagain-profile-header">
              <div class="usagain-avatar-frame">
                <img src="/assets/avatar_ela_hd.jpg" alt="Foto Profil Ela" class="usagain-avatar-img">
              </div>
              <div class="usagain-header-text">
                <div class="usagain-world-title-wrap">
                  <span class="usagain-world-title">THE SILENT LOTUS</span>
                  <span style="font-size:0.8rem; color:#f472b6;">✧</span>
                </div>
                <span class="usagain-world-subtitle">A Sanctuary of Stillness</span>
              </div>
            </div>

            <!-- Center: Navigation Pills -->
            <div class="usagain-top-center-nav">
              <button type="button" class="usagain-nav-pill-btn" id="btn-usagain-nav-explore" aria-label="Jelajahi Universe Lainnya">
                <span>🧭</span>
                <span>Explore Universe</span>
              </button>
              <button type="button" class="usagain-nav-pill-btn" id="btn-usagain-nav-story" aria-label="Buka Cerita Universe">
                <span>📖</span>
                <span>Story</span>
              </button>
            </div>

            <!-- Right: Settings & Control -->
            <div class="usagain-top-right-nav">
              <button type="button" class="usagain-circle-btn" id="btn-usagain-settings" aria-label="Pengaturan Universe" title="Pengaturan Suaka">⚙</button>
            </div>
          </header>

          <!-- 8 Interactive Location Hotspots -->
          <div class="usagain-hotspots-container">
            <!-- 1. Star Observatory — Telescope (Upper Left Dome) -->
            <button type="button" class="usagain-loc-btn btn-loc-usagain-observatory" id="btn-loc-usagain-observatory" aria-label="Star Observatory">
              <div class="usagain-loc-pulse" aria-hidden="true"></div>
              <span class="usagain-loc-icon">🔭</span>
              <span class="usagain-loc-label">Star Observatory</span>
            </button>

            <!-- 2. My Residence — Rumah Ela (Grand Central Temple Palace) -->
            <button type="button" class="usagain-loc-btn btn-loc-usagain-residence" id="btn-loc-usagain-residence" aria-label="My Residence — Rumah Ela">
              <div class="usagain-loc-pulse" aria-hidden="true"></div>
              <span class="usagain-loc-icon">🏯</span>
              <span class="usagain-loc-label">My Residence</span>
            </button>

            <!-- 3. Private Cinema — Horror Movie Theater (Upper Right Outdoor Cinema) -->
            <button type="button" class="usagain-loc-btn btn-loc-usagain-cinema" id="btn-loc-usagain-cinema" aria-label="Private Cinema">
              <div class="usagain-loc-pulse" aria-hidden="true"></div>
              <span class="usagain-loc-icon">🎬</span>
              <span class="usagain-loc-label">Private Cinema</span>
            </button>

            <!-- 4. Lotus Library — Perpustakaan (Mid-Left Wooden Pavilion) -->
            <button type="button" class="usagain-loc-btn btn-loc-usagain-library" id="btn-loc-usagain-library" aria-label="Lotus Library">
              <div class="usagain-loc-pulse" aria-hidden="true"></div>
              <span class="usagain-loc-icon">📖</span>
              <span class="usagain-loc-label">Lotus Library</span>
            </button>

            <!-- 5. Meditation Gazebo — Gazebo (Lower-Right Draped Pavilion) -->
            <button type="button" class="usagain-loc-btn btn-loc-usagain-gazebo" id="btn-loc-usagain-gazebo" aria-label="Meditation Gazebo">
              <div class="usagain-loc-pulse" aria-hidden="true"></div>
              <span class="usagain-loc-icon">🌸</span>
              <span class="usagain-loc-label">Meditation Gazebo</span>
            </button>

            <!-- 6. Private Mailbox — Kotak Pos (Lower-Left Pink Mailbox on Steps) -->
            <button type="button" class="usagain-loc-btn btn-loc-usagain-mailbox" id="btn-loc-usagain-mailbox" aria-label="Private Mailbox">
              <div class="usagain-loc-pulse" aria-hidden="true"></div>
              <span class="usagain-loc-icon">✉️</span>
              <span class="usagain-loc-label">Private Mailbox</span>
            </button>

            <!-- 7. Rose Garden — Taman Mawar (Bottom-Left Foreground Roses) -->
            <button type="button" class="usagain-loc-btn btn-loc-usagain-garden" id="btn-loc-usagain-garden" aria-label="Rose Garden">
              <div class="usagain-loc-pulse" aria-hidden="true"></div>
              <span class="usagain-loc-icon">🌹</span>
              <span class="usagain-loc-label">Rose Garden</span>
            </button>

            <!-- 8. Lotus Pond — Kolam Teratai (Foreground Lotus Pond & Boat) -->
            <button type="button" class="usagain-loc-btn btn-loc-usagain-pond" id="btn-loc-usagain-pond" aria-label="Lotus Pond">
              <div class="usagain-loc-pulse" aria-hidden="true"></div>
              <span class="usagain-loc-icon">🪷</span>
              <span class="usagain-loc-label">Lotus Pond</span>
            </button>
          </div>

          <!-- Bottom Interface -->
          <div class="usagain-bottom-bar">
            <!-- Bottom Left: Web Audio API Music Player -->
            <div class="usagain-music-player" id="usagain-music-player">
              <div class="usagain-music-disc" id="usagain-music-disc">
                <span class="usagain-disc-icon">🌸</span>
              </div>
              <div class="usagain-music-info">
                <span class="usagain-music-title" id="usagain-music-title">Lotus in the Moonlight</span>
                <span class="usagain-music-sub" id="usagain-music-sub">Zen Meditation Bells &amp; Gentle Koto • 56 BPM</span>
                <div class="usagain-music-progress-bar">
                  <div class="usagain-music-progress-fill" id="usagain-music-progress-fill"></div>
                </div>
              </div>
              <div class="usagain-music-controls">
                <button type="button" class="usagain-music-ctrl-btn" id="btn-usagain-music-prev" aria-label="Lagu Sebelumnya" title="Previous">⏮</button>
                <button type="button" class="usagain-music-ctrl-btn usagain-play-btn" id="btn-usagain-music-play" aria-label="Putar Musik" title="Play / Pause">
                  <span id="usagain-play-icon">▶</span>
                </button>
                <button type="button" class="usagain-music-ctrl-btn" id="btn-usagain-music-next" aria-label="Lagu Berikutnya" title="Next">⏭</button>
              </div>
            </div>

            <!-- Bottom Center: Main Title & Subtitle Tagline -->
            <div class="usagain-tagline-panel">
              <span class="usagain-tagline-main">In the silence, the soul blooms.</span>
              <span class="usagain-tagline-sub">"A quiet sanctuary where every moment finds its own peace."</span>
            </div>

            <!-- Bottom Right: Gallery & Collection -->
            <div class="usagain-bottom-actions">
              <button type="button" class="usagain-big-action-btn" id="btn-usagain-gallery" aria-label="Buka Galeri Foto Ela">
                <div class="usagain-big-action-circle">🖼</div>
                <span class="usagain-big-action-label">Gallery</span>
              </button>
              <button type="button" class="usagain-big-action-btn" id="btn-usagain-collection" aria-label="Buka Koleksi Teratai & Ikan">
                <div class="usagain-big-action-circle">🪷</div>
                <span class="usagain-big-action-label">Collection</span>
              </button>
            </div>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- ELA SUB-MODALS & INTERACTIVE DIALOGS           -->
        <!-- ============================================== -->

        <!-- MODAL 1: MY RESIDENCE (Rumah Ela) -->
        <div class="usagain-modal-overlay" id="usagain-residence-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">🏯</span>
                <div>
                  <span class="usagain-modal-tag">KEDIAMAN UTAMA • ELA</span>
                  <h3 class="usagain-modal-title">My Residence — Rumah Ela</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-residence" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Kediaman pribadi bernuansa kuil Jepang di atas bukit suci dengan pemandangan danau teratai dan cahaya rembulan ungu.</p>
              <form id="form-usagain-residence">
                <div class="usagain-form-group">
                  <label class="usagain-form-label">Filosofi Diri &amp; Catatan Pribadi:</label>
                  <textarea class="usagain-textarea" id="usagain-residence-bio" rows="3" placeholder="Tuliskan renungan batin Ela..."></textarea>
                </div>
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem;">
                  <div class="usagain-form-group">
                    <label class="usagain-form-label">Hobi &amp; Ketenangan:</label>
                    <input type="text" class="usagain-input" id="usagain-residence-hobbies" placeholder="Meditasi, Teh, Menulis...">
                  </div>
                  <div class="usagain-form-group">
                    <label class="usagain-form-label">Dekorasi Sudut Meditasi:</label>
                    <input type="text" class="usagain-input" id="usagain-residence-meditation" placeholder="Matras Tatami, Dupa Cendana...">
                  </div>
                </div>
                <div style="display:flex; justify-content:flex-end; margin-top:0.75rem;">
                  <button type="submit" class="usagain-btn-primary">Simpan Suaka 🌸</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- MODAL 2: STAR OBSERVATORY (Telescope) -->
        <div class="usagain-modal-overlay" id="usagain-observatory-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">🔭</span>
                <div>
                  <span class="usagain-modal-tag">OBSERVATORIUM BINTANG</span>
                  <h3 class="usagain-modal-title">Star Observatory — Telescope</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-observatory" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Kubah teleskop kuno berbingkai kuningan di atas tebing air terjun. Amati rasi bintang teratai di langit kosmik.</p>
              <div class="usagain-form-group">
                <label class="usagain-form-label">Pilih Rasi Bintang Langit Malam:</label>
                <select class="usagain-select" id="usagain-constellation-select">
                  <option value="lotus">🪷 Rasi Bintang Teratai Abadi (Eternal Lotus)</option>
                  <option value="crane">🪶 Rasi Burung Bangau Perak (Silver Crane)</option>
                  <option value="archer">🏹 Rasi Pemanah Rembulan (Moon Archer)</option>
                </select>
              </div>
              <div class="usagain-card-box">
                <h4 style="font-size:0.85rem; font-weight:700; color:#fff; margin-bottom:0.35rem;">Catatan Astronomi:</h4>
                <p id="usagain-constellation-desc" style="font-size:0.8rem; color:#fce7f3; line-height:1.6;">Rasi Bintang Teratai Abadi (Eternal Lotus): Terdiri dari 7 bintang lavender yang mekar di langit utara, melambangkan kemurnian jiwa dan ketenangan batin.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 3: PRIVATE CINEMA (Horror Movie Theater) -->
        <div class="usagain-modal-overlay" id="usagain-cinema-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">🎬</span>
                <div>
                  <span class="usagain-modal-tag">BIOSKOP PRIBADI • NOBAR</span>
                  <h3 class="usagain-modal-title">Private Cinema — Horror Movie Theater</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-cinema" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Layar bioskop terbuka di bawah langit malam berbintang. Tempat favorit Ela untuk menonton film horor psikologis dan misteri supranatural.</p>
              <div class="usagain-form-group">
                <label class="usagain-form-label">Tambah Film ke Watchlist:</label>
                <div style="display:flex; gap:0.5rem;">
                  <input type="text" class="usagain-input" id="usagain-new-movie-input" placeholder="Contoh: The Wailing (곡성)...">
                  <button type="button" class="usagain-btn-primary" id="btn-usagain-add-movie" style="white-space:nowrap;">+ Tambah</button>
                </div>
              </div>
              <h4 style="font-size:0.85rem; font-weight:700; color:#fff; margin:1rem 0 0.5rem 0;">Daftar Film Favorit &amp; Tontonan:</h4>
              <div id="usagain-cinema-watchlist" style="display:flex; flex-direction:column; gap:0.5rem;"></div>
            </div>
          </div>
        </div>

        <!-- MODAL 4: LOTUS LIBRARY (Perpustakaan) -->
        <div class="usagain-modal-overlay" id="usagain-library-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">📖</span>
                <div>
                  <span class="usagain-modal-tag">RUANG BACA &amp; FILOSOFI</span>
                  <h3 class="usagain-modal-title">Lotus Library — Perpustakaan</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-library" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Perpustakaan kayu beraroma dupa cendana dengan rak-rak buku filosofi, puisi damai, dan jurnal spiritual.</p>
              <div class="usagain-form-group">
                <label class="usagain-form-label">Tambah Buku ke Daftar Bacaan:</label>
                <div style="display:flex; gap:0.5rem;">
                  <input type="text" class="usagain-input" id="usagain-new-book-input" placeholder="Judul buku / puisi baru...">
                  <button type="button" class="usagain-btn-primary" id="btn-usagain-add-book" style="white-space:nowrap;">+ Tambah</button>
                </div>
              </div>
              <h4 style="font-size:0.85rem; font-weight:700; color:#fff; margin:1rem 0 0.5rem 0;">Koleksi Buku &amp; Naskah:</h4>
              <div id="usagain-library-booklist" style="display:flex; flex-direction:column; gap:0.5rem;"></div>
            </div>
          </div>
        </div>

        <!-- MODAL 5: MEDITATION GAZEBO (Gazebo) -->
        <div class="usagain-modal-overlay" id="usagain-gazebo-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">🌸</span>
                <div>
                  <span class="usagain-modal-tag">PAVILIUN KETENANGAN</span>
                  <h3 class="usagain-modal-title">Meditation Gazebo — Gazebo</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-gazebo" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Gazebo berhiaskan tirai sutra putih dan lentera hangat di tepi danau. Latihan pernapasan kesadaran penuh (Mindfulness Breathing).</p>
              <div style="display:flex; flex-direction:column; align-items:center; margin:1.5rem 0; gap:1rem;">
                <div id="usagain-breath-circle" style="width:120px; height:120px; border-radius:50%; border:3px solid rgba(244, 114, 182, 0.4); display:flex; align-items:center; justify-content:center; background:radial-gradient(circle, rgba(244,114,182,0.15), transparent); transition:all 3.8s ease-in-out;">
                  <span style="font-size:1.75rem;">🪷</span>
                </div>
                <div id="usagain-breath-text" style="font-size:0.88rem; font-weight:700; color:#fce7f3; text-align:center;">Tarik napas perlahan...</div>
                <button type="button" class="usagain-btn-primary" id="btn-usagain-meditation-start">Mulai Meditasi (3 Menit)</button>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 6: PRIVATE MAILBOX (Kotak Pos) -->
        <div class="usagain-modal-overlay" id="usagain-mailbox-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">✉️</span>
                <div>
                  <span class="usagain-modal-tag">KOTAK SURAT MAWAR</span>
                  <h3 class="usagain-modal-title">Private Mailbox — Kotak Pos</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-mailbox" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Kotak surat merah muda antik di tangga batu taman. Tempat meninggalkan surat batin dan pesan penuh kehangatan.</p>
              <form id="form-usagain-mailbox" style="margin-bottom:1.25rem;">
                <div class="usagain-form-group">
                  <label class="usagain-form-label">Tulis Surat Baru untuk Suaka:</label>
                  <textarea class="usagain-textarea" id="usagain-mailbox-message" rows="3" placeholder="Tuliskan pesan atau doa damai di sini..."></textarea>
                </div>
                <div style="display:flex; justify-content:flex-end;">
                  <button type="submit" class="usagain-btn-primary">Kirim Surat ✉️</button>
                </div>
              </form>
              <h4 style="font-size:0.85rem; font-weight:700; color:#fff; margin-bottom:0.5rem;">Surat Masuk:</h4>
              <div id="usagain-mailbox-list" style="display:flex; flex-direction:column; gap:0.5rem;"></div>
            </div>
          </div>
        </div>

        <!-- MODAL 7: ROSE GARDEN (Taman Mawar) -->
        <div class="usagain-modal-overlay" id="usagain-garden-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">🌹</span>
                <div>
                  <span class="usagain-modal-tag">TAMAN BUNGA SUCI</span>
                  <h3 class="usagain-modal-title">Rose Garden — Taman Mawar</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-garden" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Hamparan mawar merah muda dan lavender ungu yang bermekaran segar di samping lentera batu dan kupu-kupu bersayap cahaya.</p>
              <div class="usagain-card-box">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                  <span style="font-size:0.82rem; font-weight:700; color:#fff;">Status Rangkaian Buket Mawar:</span>
                  <span style="font-size:0.85rem; font-weight:800; color:#f472b6;"><span id="usagain-bouquet-count">3</span> Tangkai Mekar</span>
                </div>
                <p id="usagain-garden-status" style="font-size:0.78rem; color:#fbcfe8; font-style:italic; margin-bottom:0.75rem;">Bunga-bunga mawar segar dan harum di bawah cahaya rembulan ungu.</p>
                <div style="display:flex; gap:0.5rem;">
                  <button type="button" class="usagain-btn-primary" id="btn-usagain-water-garden" style="flex:1;">💧 Siram Taman</button>
                  <button type="button" class="usagain-btn-primary" id="btn-usagain-pick-rose" style="flex:1;">🌹 Petik &amp; Rangkai</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 8: LOTUS POND (Kolam Teratai) -->
        <div class="usagain-modal-overlay" id="usagain-pond-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">🪷</span>
                <div>
                  <span class="usagain-modal-tag">DANAU DAN PERAHU</span>
                  <h3 class="usagain-modal-title">Lotus Pond — Kolam Teratai</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-pond" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Danau air jernih dengan bunga teratai merah muda yang mengapung anggun dan ikan-ikan koi mistis yang berenang di bawah pantulan rembulan.</p>
              <div class="usagain-card-box" style="text-align:center;">
                <p id="usagain-fish-status" style="font-size:0.85rem; color:#fce7f3; margin-bottom:0.75rem;">Perahu kayu siap berlayar. Duduk santai dan lempar kailmu ke air danau yang tenang.</p>
                <button type="button" class="usagain-btn-primary" id="btn-usagain-start-fishing">🎣 Mulai Memancing Ikan</button>
              </div>
              <h4 style="font-size:0.85rem; font-weight:700; color:#fff; margin:1rem 0 0.5rem 0;">Koleksi Tangkapan Ikan Teratai:</h4>
              <div id="usagain-fish-collection-list" style="display:flex; flex-direction:column; gap:0.5rem;"></div>
            </div>
          </div>
        </div>

        <!-- MODAL 9: GALLERY SHORTCUT -->
        <div class="usagain-modal-overlay" id="usagain-gallery-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">🖼</span>
                <div>
                  <span class="usagain-modal-tag">GALERI FOTO • ELA</span>
                  <h3 class="usagain-modal-title">Ela's Gallery</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-gallery" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Koleksi potret kenangan indah Ela di suaka The Silent Lotus.</p>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap:0.75rem;">
                <div style="aspect-ratio:1; border-radius:0.75rem; overflow:hidden; border:1px solid rgba(244,114,182,0.4);">
                  <img src="/assets/portrait_ela_hd.jpg" alt="Ela Portrait" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="aspect-ratio:1; border-radius:0.75rem; overflow:hidden; border:1px solid rgba(244,114,182,0.4);">
                  <img src="/assets/card_ela_hd.jpg" alt="Ela Card" style="width:100%; height:100%; object-fit:cover;">
                </div>
                <div style="aspect-ratio:1; border-radius:0.75rem; overflow:hidden; border:1px solid rgba(244,114,182,0.4);">
                  <img src="/assets/usagain_world_bg.jpg" alt="The Silent Lotus" style="width:100%; height:100%; object-fit:cover;">
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 10: COLLECTION SHORTCUT -->
        <div class="usagain-modal-overlay" id="usagain-collection-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">🪷</span>
                <div>
                  <span class="usagain-modal-tag">RELIQ &amp; KOLEKSI</span>
                  <h3 class="usagain-modal-title">Sanctuary Collection</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-collection" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Koleksi pusaka ketenangan dan teratai suci milik Ela.</p>
              <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.75rem;">
                <div class="usagain-card-box">
                  <div style="font-size:1.5rem; margin-bottom:0.25rem;">🪷</div>
                  <div style="font-weight:700; font-size:0.85rem; color:#fff;">Teratai Rembulan</div>
                  <div style="font-size:0.72rem; color:#fbcfe8;">Mekar abadi di air danau tenang.</div>
                </div>
                <div class="usagain-card-box">
                  <div style="font-size:1.5rem; margin-bottom:0.25rem;">📿</div>
                  <div style="font-weight:700; font-size:0.85rem; color:#fff;">Mala Cendana</div>
                  <div style="font-size:0.72rem; color:#fbcfe8;">Untaian 108 butir doa damai.</div>
                </div>
                <div class="usagain-card-box">
                  <div style="font-size:1.5rem; margin-bottom:0.25rem;">🏮</div>
                  <div style="font-weight:700; font-size:0.85rem; color:#fff;">Lentera Kupu-kupu</div>
                  <div style="font-size:0.72rem; color:#fbcfe8;">Penerang jalan setapak taman mawar.</div>
                </div>
                <div class="usagain-card-box">
                  <div style="font-size:1.5rem; margin-bottom:0.25rem;">📜</div>
                  <div style="font-weight:700; font-size:0.85rem; color:#fff;">Gita Keheningan</div>
                  <div style="font-size:0.72rem; color:#fbcfe8;">Gulungan naskah puitis suaka.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 11: SETTINGS -->
        <div class="usagain-modal-overlay" id="usagain-settings-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="usagain-modal-card">
            <div class="usagain-modal-header">
              <div class="usagain-modal-header-left">
                <span class="usagain-modal-icon-badge">⚙</span>
                <div>
                  <span class="usagain-modal-tag">PENGATURAN</span>
                  <h3 class="usagain-modal-title">Pengaturan Suaka Ela</h3>
                </div>
              </div>
              <button type="button" class="usagain-modal-close-btn" id="btn-close-usagain-settings" aria-label="Tutup">✕</button>
            </div>
            <div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Kustomisasi suasana dan data pribadi suaka The Silent Lotus.</p>
              <div class="usagain-card-box">
                <h4 style="font-size:0.85rem; font-weight:700; color:#fff; margin-bottom:0.25rem;">Autentikasi Terverifikasi</h4>
                <p style="font-size:0.75rem; color:#cbd5e1;">Karakter: <strong>Ela</strong> • Universe: <strong>US AGAIN 🌸</strong></p>
                <p style="font-size:0.72rem; color:#94a3b8; font-family:monospace; margin-top:2px;">UID: plxSNowjCkOMfUQMAwnZzQPR9Xr1</p>
              </div>
              <div class="usagain-card-box" style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.85rem; color:#ffffff;">Reset Data Suaka</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Kosongkan riwayat ikan, surat, dan buku bacaan lokal</p>
                </div>
                <button type="button" class="usagain-btn-primary" id="btn-usagain-reset-data" style="background:#dc2626;">Reset Data</button>
              </div>
            </div>
          </div>
        </div>

      </section>

`;

const updatedHtml = html.replace(targetAnchor, usagainSectionHtml + targetAnchor);
fs.writeFileSync(indexPath, updatedHtml, 'utf-8');
console.log('Successfully inserted Ela usagain section into index.html');

