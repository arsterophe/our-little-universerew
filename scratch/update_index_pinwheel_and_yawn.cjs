const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Update island card labels
html = html.replace('alt="PINWHEEL - Abil\'s Universe"', 'alt="PINWHEEL - Syma\'s Universe"');
html = html.replace('aria-label="Buka Universe PINWHEEL - Abil\'s Universe"', 'aria-label="Buka Universe PINWHEEL - Syma\'s Universe"');
html = html.replace('alt="Abil - PINWHEEL"', 'alt="Syma - PINWHEEL"');

// 2. Add PINWHEEL and YAWN sections
const pinwheelSection = `
      <!-- ============================================== -->
      <!-- VIEW: PINWHEEL — SYMA'S UNIVERSE: THE NINE TAILED SANCTUARY -->
      <!-- ============================================== -->
      <section class="view-section view-pinwheel-world" id="view-pinwheel-world"
        aria-label="PINWHEEL - Syma's Universe: The Nine Tailed Sanctuary" aria-hidden="true">

        <div class="pinwheel-2d-stage" id="pinwheel-2d-stage">

          <!-- 1. BASE BACKGROUND IMAGE (Pristine Full-Screen Landscape) -->
          <div class="pinwheel-base-layer">
            <img src="/assets/pinwheel_world_bg.jpg"
              alt="Dunia 2D PINWHEEL - Syma's Universe: The Nine Tailed Sanctuary" class="pinwheel-scene-img"
              decoding="async" width="1920" height="1080" fetchpriority="high">
            <div class="pinwheel-color-grade" aria-hidden="true"></div>
          </div>

          <!-- 2. CANVAS FX (Sakura Petals, Fireflies, Starlight & Pond Swimming Fish) -->
          <canvas id="pinwheel-magic-canvas" class="pinwheel-magic-canvas" aria-hidden="true"></canvas>

          <!-- 3. TOP HEADER (Exact Reference: Title Badge, Center Nav, Profile & Settings) -->
          <header class="pinwheel-top-header">

            <!-- A. Left: Syma's Universe Identity & Profile Avatar -->
            <div class="pinwheel-header-left">
              <div class="pinwheel-header-avatar-wrap" title="Syma — The Nine Tailed Fox of PINWHEEL">
                <img src="/assets/card_abil_hd.jpg" alt="Syma" class="pinwheel-header-avatar" id="pinwheel-profile-avatar" width="44" height="44">
              </div>
              <div class="pinwheel-header-titles">
                <h1 class="pinwheel-header-main-title">SYMA'S UNIVERSE</h1>
                <p class="pinwheel-header-sub-title">The Nine Tailed Sanctuary ✧</p>
              </div>
            </div>

            <!-- B. Center: Explore Universe & Story Buttons -->
            <nav class="pinwheel-header-center" aria-label="Navigasi Utama Syma">
              <button type="button" class="pinwheel-nav-pill-btn" id="btn-pinwheel-top-explore" aria-label="Explore Universe">
                <span class="pill-icon">🧭</span>
                <span>Explore Universe</span>
              </button>
              <button type="button" class="pinwheel-nav-pill-btn" id="btn-pinwheel-top-story" aria-label="Story">
                <span class="pill-icon">📖</span>
                <span>Story</span>
              </button>
            </nav>

            <!-- C. Right: Settings Button -->
            <div class="pinwheel-header-right">
              <button type="button" class="pinwheel-settings-btn" id="btn-pinwheel-settings" aria-label="Pengaturan Universe" title="Settings">
                <span>⚙</span>
              </button>
            </div>

          </header>

          <!-- 4. INTERACTIVE LOCATIONS ON THE ARTWORK (Exact Reference Hotspots) -->
          <div class="pinwheel-locations-stage" aria-label="Lokasi Utama Universe PINWHEEL">
            
            <!-- A. My Residence (Top 32%, Left 44%) -->
            <button type="button" class="pinwheel-loc-btn btn-loc-residence" aria-label="My Residence">
              <span class="pinwheel-loc-icon">🏠</span>
              <span>My Residence</span>
            </button>

            <!-- B. Observatory (Top 33%, Left 71%) -->
            <button type="button" class="pinwheel-loc-btn btn-loc-observatory" aria-label="Observatory">
              <span class="pinwheel-loc-icon">🔭</span>
              <span>Observatory</span>
            </button>

            <!-- C. Photography & Video Studio (Top 39%, Left 90%) -->
            <button type="button" class="pinwheel-loc-btn btn-loc-studio" aria-label="Photography & Video Studio">
              <span class="pinwheel-loc-icon">📷</span>
              <span>Photography & Video Studio</span>
            </button>

            <!-- D. Gazebo (Top 54%, Left 41%) -->
            <button type="button" class="pinwheel-loc-btn btn-loc-gazebo" aria-label="Gazebo">
              <span class="pinwheel-loc-icon">🌸</span>
              <span>Gazebo</span>
            </button>

            <!-- E. Fishing Pond (Top 56%, Left 63% - Replaces Garden) -->
            <button type="button" class="pinwheel-loc-btn btn-loc-fishing" aria-label="Fishing Pond">
              <span class="pinwheel-loc-icon">🎣</span>
              <span>Fishing Pond</span>
            </button>

            <!-- F. Cat Garden (Top 67%, Left 24%) -->
            <button type="button" class="pinwheel-loc-btn btn-loc-catgarden" aria-label="Cat Garden">
              <span class="pinwheel-loc-icon">🐱</span>
              <span>Cat Garden</span>
            </button>

            <!-- G. Mailbox (Top 68%, Left 91%) -->
            <button type="button" class="pinwheel-loc-btn btn-loc-mailbox" aria-label="Mailbox">
              <span class="pinwheel-loc-icon">✉</span>
              <span>Mailbox</span>
            </button>

          </div>

          <!-- 5. BOTTOM BAR (Music Player, Center Tagline, Gallery & Collection) -->
          <div class="pinwheel-bottom-bar">

            <!-- Bottom Left: Music Player -->
            <div class="pinwheel-music-player" id="pinwheel-music-player" aria-label="Pemutar Musik PINWHEEL">
              <div class="pinwheel-music-vinyl" id="pinwheel-music-vinyl" title="Piringan Hitam Moonlight Whispers">
                <span>🌸</span>
              </div>
              <div class="pinwheel-music-info">
                <span class="pinwheel-music-title" id="pinwheel-music-title">Moonlight Whispers</span>
                <span class="pinwheel-music-sub" id="pinwheel-music-sub">Now Playing ♫</span>
                <div class="pinwheel-music-progress-bar">
                  <div class="pinwheel-music-progress-fill" id="pinwheel-music-progress-fill"></div>
                </div>
              </div>
              <div class="pinwheel-music-controls">
                <button type="button" class="pinwheel-music-ctrl-btn" id="btn-music-prev" aria-label="Lagu Sebelumnya" title="Previous">⏮</button>
                <button type="button" class="pinwheel-music-ctrl-btn pinwheel-play-btn" id="btn-music-play" aria-label="Putar Musik" title="Play / Pause">
                  <span id="pinwheel-play-icon">▶</span>
                </button>
                <button type="button" class="pinwheel-music-ctrl-btn" id="btn-music-next" aria-label="Lagu Berikutnya" title="Next">⏭</button>
              </div>
            </div>

            <!-- Bottom Center: Tagline -->
            <div class="pinwheel-tagline-panel">
              <span class="pinwheel-tagline-diamond">✦</span>
              <span class="pinwheel-tagline-text">A quiet world, filled with endless possibilities.</span>
              <span class="pinwheel-tagline-diamond">✦</span>
            </div>

            <!-- Bottom Right: Gallery & Collection Big Round Buttons -->
            <div class="pinwheel-bottom-actions">
              <button type="button" class="pinwheel-big-action-btn" id="btn-pinwheel-gallery" aria-label="Buka Galeri Foto Syma">
                <div class="pinwheel-big-action-circle">🖼</div>
                <span class="pinwheel-big-action-label">Gallery</span>
              </button>
              <button type="button" class="pinwheel-big-action-btn" id="btn-pinwheel-collection" aria-label="Buka Koleksi Ikan & Barang Unik">
                <div class="pinwheel-big-action-circle">🧰</div>
                <span class="pinwheel-big-action-label">Collection</span>
              </button>
            </div>

          </div>

        </div>

        <!-- ============================================== -->
        <!-- PINWHEEL SUB-MODALS & INTERACTIVE DIALOGS      -->
        <!-- ============================================== -->

        <!-- MODAL 1: FISHING POND (Interactive Mini-game) -->
        <div class="pinwheel-modal-overlay" id="pinwheel-fishing-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">🎣</span>
                <div>
                  <span class="pinwheel-modal-tag">MINI-GAME • KOLAM PEMANCINGAN</span>
                  <h3 class="pinwheel-modal-title">Fishing Pond</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-fishing-modal" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Duduklah di dermaga kayu teratai dan lemparkan kailmu ke air jernih. Ikan-ikan langka sering berenang di bawah cahaya bulan.
            </p>
            <div class="pinwheel-fishing-pond-view">
              <div class="pinwheel-fishing-water-surface">
                <div class="pinwheel-fishing-bobber" id="pinwheel-bobber"></div>
                <div class="pinwheel-fishing-bite-alert" id="pinwheel-bite-alert">TARIK SEKARANG! ⚡</div>
              </div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span id="pinwheel-fish-status" style="font-size:0.8rem; color:#e9d5ff; font-weight:600;">Siap memancing...</span>
              <button type="button" class="pinwheel-fishing-action-btn" id="btn-fish-action">Lempar Kail 🎣</button>
            </div>
          </div>
        </div>

        <!-- MODAL 2: MY RESIDENCE -->
        <div class="pinwheel-modal-overlay" id="pinwheel-residence-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">🏠</span>
                <div>
                  <span class="pinwheel-modal-tag">KEDIAMAN UTAMA • SYMA</span>
                  <h3 class="pinwheel-modal-title">My Residence</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-residence-modal" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Rumah bergaya arsitektur Jepang klasik beratap pagoda, bertabur cahaya lentera hangat di antara pepohonan sakura dan air terjun.
            </p>
            <div style="background:rgba(22,11,42,0.6); padding:12px; border-radius:12px; border:1px solid rgba(220,180,255,0.2);">
              <h4 style="margin:0 0 6px 0; color:#f5f3ff; font-size:0.9rem;">Ruang Istirahat & Tatami</h4>
              <p style="margin:0; font-size:0.8rem; color:#cbd5e1;">Aroma teh melati dan gemerisik daun sakura menemani waktu istirahat Syma setelah berpetualang.</p>
            </div>
          </div>
        </div>

        <!-- MODAL 3: OBSERVATORY -->
        <div class="pinwheel-modal-overlay" id="pinwheel-observatory-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">🔭</span>
                <div>
                  <span class="pinwheel-modal-tag">OBSERVATORIUM BINTANG</span>
                  <h3 class="pinwheel-modal-title">Observatory</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-observatory-modal" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Kubah kaca astronomi di puncak tebing berbatu. Dari sini terlihat jelas rasi bintang Rubah Ekor Sembilan dan bulan sabit kembar PINWHEEL.
            </p>
          </div>
        </div>

        <!-- MODAL 4: PHOTOGRAPHY & VIDEO STUDIO -->
        <div class="pinwheel-modal-overlay" id="pinwheel-studio-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">📷</span>
                <div>
                  <span class="pinwheel-modal-tag">KREASI KONTEN &amp; FOTO</span>
                  <h3 class="pinwheel-modal-title">Photography &amp; Video Studio</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-studio-modal" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Studio kreatif tepi danau dengan pencahayaan profesional, kamera sinematik, dan latar belakang pemandangan air terjun yang memesona.
            </p>
          </div>
        </div>

        <!-- MODAL 5: GAZEBO -->
        <div class="pinwheel-modal-overlay" id="pinwheel-gazebo-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">🌸</span>
                <div>
                  <span class="pinwheel-modal-tag">TEMPAT BERSANTAI</span>
                  <h3 class="pinwheel-modal-title">Gazebo</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-gazebo-modal" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Gazebo beratap pagoda terbuka di pinggir danau. Tirai putih melambai tertiup angin sepoi, menjadikannya tempat ternyaman untuk membaca buku.
            </p>
          </div>
        </div>

        <!-- MODAL 6: CAT GARDEN -->
        <div class="pinwheel-modal-overlay" id="pinwheel-catgarden-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">🐱</span>
                <div>
                  <span class="pinwheel-modal-tag">TAMAN KUCING SUCI</span>
                  <h3 class="pinwheel-modal-title">Cat Garden</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-catgarden-modal" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Taman bunga hydrangea ungu di mana kucing-kucing putih penunggu kuil bermain riang, mendengkur di atas jembatan, dan menemani hari Syma.
            </p>
          </div>
        </div>

        <!-- MODAL 7: MAILBOX -->
        <div class="pinwheel-modal-overlay" id="pinwheel-mailbox-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">✉</span>
                <div>
                  <span class="pinwheel-modal-tag">KOTAK POS SANCTUARY</span>
                  <h3 class="pinwheel-modal-title">Mailbox</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-mailbox-modal" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Kotak pos lentera bergaya Torii. Di sini tersimpan surat-surat hangat dari seluruh penjuru universe untuk Syma.
            </p>
          </div>
        </div>

        <!-- MODAL 8: GALLERY -->
        <div class="pinwheel-modal-overlay" id="pinwheel-gallery-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">🖼</span>
                <div>
                  <span class="pinwheel-modal-tag">GALERI FOTO • SYMA</span>
                  <h3 class="pinwheel-modal-title">Gallery</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-gallery-modal" aria-label="Tutup">✕</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(140px, 1fr)); gap:10px;">
              <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(220,180,255,0.3); height:100px;">
                <img src="/assets/pinwheel_world_bg.jpg" alt="Pemandangan Sanctuary" style="width:100%; height:100%; object-fit:cover;">
              </div>
              <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(220,180,255,0.3); height:100px;">
                <img src="/assets/island_pinwheel_floating.jpg" alt="Planet Pinwheel" style="width:100%; height:100%; object-fit:cover;">
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 9: COLLECTION -->
        <div class="pinwheel-modal-overlay" id="pinwheel-collection-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">🧰</span>
                <div>
                  <span class="pinwheel-modal-tag">KOTAK KOLEKSI • SYMA</span>
                  <h3 class="pinwheel-modal-title">Collection</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-collection-modal" aria-label="Tutup">✕</button>
            </div>
            <div style="display:flex; gap:8px; border-bottom:1px solid rgba(220,180,255,0.2); padding-bottom:8px;">
              <button type="button" class="pinwheel-cat-btn" id="btn-tab-fish-collection" style="background:#a855f7;">🐟 Koleksi Ikan (<span id="fish-count-badge">0</span>)</button>
              <button type="button" class="pinwheel-cat-btn" id="btn-tab-relic-collection">✨ Pusaka Sanctuary</button>
            </div>
            <div id="collection-fish-panel">
              <div class="pinwheel-catches-grid" id="collection-all-fish-grid"></div>
            </div>
            <div id="collection-relic-panel" style="display:none;">
              <div class="pinwheel-collection-grid">
                <div class="pinwheel-artifact-item">
                  <span class="pinwheel-artifact-icon">🎐</span>
                  <div class="pinwheel-artifact-info">
                    <h4>Wind Chime of Pinwheel</h4>
                    <p>Lonceng angin kristal bersuara merdu pembawa berkah.</p>
                  </div>
                </div>
                <div class="pinwheel-artifact-item">
                  <span class="pinwheel-artifact-icon">🦊</span>
                  <div class="pinwheel-artifact-info">
                    <h4>Nine-Tailed Fox Talisman</h4>
                    <p>Jimat pelindung rubah ekor sembilan pembawa kedamaian.</p>
                  </div>
                </div>
                <div class="pinwheel-artifact-item">
                  <span class="pinwheel-artifact-icon">🌸</span>
                  <div class="pinwheel-artifact-info">
                    <h4>Eternal Sakura Blossom</h4>
                    <p>Kelopak sakura abadi yang tak pernah layu di musim apa pun.</p>
                  </div>
                </div>
                <div class="pinwheel-artifact-item">
                  <span class="pinwheel-artifact-icon">🌙</span>
                  <div class="pinwheel-artifact-info">
                    <h4>Moon Crescent Crystal</h4>
                    <p>Pecahan batu bulan yang memendarkan cahaya violet lembut.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 10: SETTINGS -->
        <div class="pinwheel-modal-overlay" id="pinwheel-settings-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">⚙</span>
                <div>
                  <span class="pinwheel-modal-tag">PENGATURAN • SYMA'S UNIVERSE</span>
                  <h3 class="pinwheel-modal-title">Settings</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-settings-modal" aria-label="Tutup">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">Musik Latar (Moonlight Whispers)</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Musik instrumen Jepang &amp; semilir angin</p>
                </div>
                <button type="button" class="pinwheel-cat-btn" id="btn-toggle-bgm">ON / OFF</button>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">Hujan Kelopak Sakura</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Kelopak sakura beterbangan di panggung</p>
                </div>
                <button type="button" class="pinwheel-cat-btn" id="btn-toggle-sakura">Aktif</button>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">Reset Tangkapan Ikan</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Kosongkan riwayat tangkapan memancing</p>
                </div>
                <button type="button" class="pinwheel-cat-btn" id="btn-reset-fish-data" style="background:#dc2626;">Reset Data</button>
              </div>
            </div>
          </div>
        </div>

      </section>
`;

const yawnSection = `
      <!-- ============================================== -->
      <!-- VIEW: YAWN — AKHIRA'S UNIVERSE: UNDERWATER ASTRAL CITY -->
      <!-- ============================================== -->
      <section class="view-section view-yawn-world" id="view-yawn-world"
        aria-label="YAWN - Akhira's Universe: Underwater Astral City" aria-hidden="true">

        <div class="yawn-2d-stage" id="yawn-2d-stage">

          <!-- 1. BASE BACKGROUND IMAGE (Underwater Astral City Landscape) -->
          <div class="yawn-base-layer">
            <img src="/assets/yawn_world_bg.jpg"
              alt="Dunia 2D YAWN - Akhira's Universe: Underwater Astral City" class="yawn-scene-img"
              decoding="async" width="1024" height="576" fetchpriority="high">
            <div class="yawn-color-grade" aria-hidden="true"></div>
          </div>

          <!-- 2. CANVAS FX (Rising Bubbles, Glowing Plankton, Jellyfish, Astral Whale) -->
          <canvas id="yawn-magic-canvas" class="yawn-magic-canvas" aria-hidden="true"></canvas>

          <!-- 3. TOP HEADER (Left: Akhira Profile, Center: Nav, Right: Settings) -->
          <header class="yawn-top-header">

            <!-- A. Left: Akhira's Universe Identity & Profile Avatar -->
            <div class="yawn-header-left">
              <div class="yawn-header-avatar-wrap" title="Akhira — YAWN: Underwater Astral City">
                <img src="/assets/card_akhira_hd.jpg" alt="Akhira" class="yawn-header-avatar" id="yawn-profile-avatar" width="44" height="44">
              </div>
              <div class="yawn-header-titles">
                <h1 class="yawn-header-main-title">AKHIRA'S UNIVERSE</h1>
                <p class="yawn-header-sub-title">YAWN — Underwater Astral City ✧</p>
              </div>
            </div>

            <!-- B. Center: Explore Universe & Story Buttons -->
            <nav class="yawn-header-center" aria-label="Navigasi Utama Akhira">
              <button type="button" class="yawn-nav-pill-btn" id="btn-yawn-top-explore" aria-label="Explore Universe">
                <span class="pill-icon">🧭</span>
                <span>Explore Universe</span>
              </button>
              <button type="button" class="yawn-nav-pill-btn" id="btn-yawn-top-story" aria-label="Story">
                <span class="pill-icon">📖</span>
                <span>Story</span>
              </button>
            </nav>

            <!-- C. Right: Settings Button -->
            <div class="yawn-header-right">
              <button type="button" class="yawn-settings-btn" id="btn-yawn-settings" aria-label="Pengaturan Universe" title="Settings">
                <span>⚙</span>
              </button>
            </div>

          </header>

          <!-- 4. INTERACTIVE LOCATIONS ON THE ARTWORK (6 Floating Glass Hotspots) -->
          <div class="yawn-locations-stage" aria-label="Lokasi Utama YAWN">
            
            <!-- A. My Residence (Castle) -->
            <button type="button" class="yawn-loc-btn btn-loc-yawn-residence" id="btn-loc-yawn-residence" aria-label="My Residence">
              <span class="yawn-loc-icon">🏰</span>
              <span>My Residence</span>
            </button>

            <!-- B. Observatory (Telescope Upper-Left) -->
            <button type="button" class="yawn-loc-btn btn-loc-yawn-observatory" id="btn-loc-yawn-observatory" aria-label="Observatory">
              <span class="yawn-loc-icon">🔭</span>
              <span>Observatory</span>
            </button>

            <!-- C. Gazebo (Center Canopy) -->
            <button type="button" class="yawn-loc-btn btn-loc-yawn-gazebo" id="btn-loc-yawn-gazebo" aria-label="Gazebo">
              <span class="yawn-loc-icon">🌙</span>
              <span>Gazebo</span>
            </button>

            <!-- D. Cinema (Upper-Right Theater) -->
            <button type="button" class="yawn-loc-btn btn-loc-yawn-cinema" id="btn-loc-yawn-cinema" aria-label="Cinema">
              <span class="yawn-loc-icon">🎬</span>
              <span>Cinema</span>
            </button>

            <!-- E. Mailbox (Lower-Right Seashell Post) -->
            <button type="button" class="yawn-loc-btn btn-loc-yawn-mailbox" id="btn-loc-yawn-mailbox" aria-label="Mailbox">
              <span class="yawn-loc-icon">💌</span>
              <span>Mailbox</span>
            </button>

          </div>

          <!-- 5. BOTTOM BAR (Music Player, Tagline & Action Circles) -->
          <div class="yawn-bottom-bar">

            <!-- Bottom Left: Oceanic Astral Music Player -->
            <div class="yawn-music-player" id="yawn-music-player" aria-label="Pemutar Musik YAWN">
              <div class="yawn-music-vinyl" id="yawn-music-vinyl" title="Piringan Musik Astral">
                <span>🌊</span>
              </div>
              <div class="yawn-music-info">
                <span class="yawn-music-title" id="yawn-music-title">Astral Ocean Waves</span>
                <span class="yawn-music-sub" id="yawn-music-sub">Bioluminescent Ambient • 72 BPM</span>
                <div class="yawn-music-progress-bar">
                  <div class="yawn-music-progress-fill" id="yawn-music-progress-fill"></div>
                </div>
              </div>
              <div class="yawn-music-controls">
                <button type="button" class="yawn-music-ctrl-btn" id="btn-yawn-music-prev" aria-label="Lagu Sebelumnya" title="Previous">⏮</button>
                <button type="button" class="yawn-music-ctrl-btn yawn-play-btn" id="btn-yawn-music-play" aria-label="Putar Musik" title="Play / Pause">
                  <span id="yawn-play-icon">▶</span>
                </button>
                <button type="button" class="yawn-music-ctrl-btn" id="btn-yawn-music-next" aria-label="Lagu Berikutnya" title="Next">⏭</button>
              </div>
            </div>

            <!-- Bottom Center: Tagline -->
            <div class="yawn-tagline-panel">
              <span class="yawn-tagline-diamond">✦</span>
              <span class="yawn-tagline-text">Beneath the celestial tides, where dreams take flight among the stars.</span>
              <span class="yawn-tagline-diamond">✦</span>
            </div>

            <!-- Bottom Right: Gallery & Collection -->
            <div class="yawn-bottom-actions">
              <button type="button" class="yawn-big-action-btn" id="btn-yawn-gallery" aria-label="Buka Galeri Foto Akhira">
                <div class="yawn-big-action-circle">🖼</div>
                <span class="yawn-big-action-label">Gallery</span>
              </button>
              <button type="button" class="yawn-big-action-btn" id="btn-yawn-collection" aria-label="Buka Koleksi Bintang & Relik Laut">
                <div class="yawn-big-action-circle">🧰</div>
                <span class="yawn-big-action-label">Collection</span>
              </button>
            </div>

          </div>

        </div>

        <!-- ============================================== -->
        <!-- YAWN SUB-MODALS & INTERACTIVE DIALOGS          -->
        <!-- ============================================== -->

        <!-- MODAL 1: MY RESIDENCE (Castle) -->
        <div class="yawn-modal-overlay" id="yawn-residence-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="yawn-modal-card">
            <div class="yawn-modal-header">
              <div class="yawn-modal-header-left">
                <span class="yawn-modal-icon-badge">🏰</span>
                <div>
                  <span class="yawn-modal-tag">KEDIAMAN UTAMA • AKHIRA</span>
                  <h3 class="yawn-modal-title">My Residence</h3>
                </div>
              </div>
              <button type="button" class="yawn-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Istana kristal bawah laut megah yang menjadi pusat perlindungan dan peristirahatan Akhira. Dikelilingi air terjun bercahaya dan kawanan ubur-ubur bintang.
            </p>
            <div style="background:rgba(8,24,62,0.6); padding:14px; border-radius:12px; border:1px solid rgba(125,211,252,0.3); display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                <span style="color:#94a3b8;">Suasana Istana</span>
                <span style="color:#38bdf8; font-weight:700;">Tenang &amp; Damai</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                <span style="color:#94a3b8;">Suhu Air Suci</span>
                <span style="color:#c084fc; font-weight:700;">22°C (Harmonis)</span>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:0.82rem;">
                <span style="color:#94a3b8;">Perlindungan Astral</span>
                <span style="color:#34d399; font-weight:700;">Aktif 100%</span>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <button type="button" class="yawn-action-btn" onclick="this.closest('.yawn-modal-overlay').classList.remove('active')">Kembali ke Universe</button>
            </div>
          </div>
        </div>

        <!-- MODAL 2: OBSERVATORY (Astral Celestial Telescope) -->
        <div class="yawn-modal-overlay" id="yawn-observatory-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="yawn-modal-card">
            <div class="yawn-modal-header">
              <div class="yawn-modal-header-left">
                <span class="yawn-modal-icon-badge">🔭</span>
                <div>
                  <span class="yawn-modal-tag">ASTRONOMI • TELESKOP ANGKASA</span>
                  <h3 class="yawn-modal-title">Observatory</h3>
                </div>
              </div>
              <button type="button" class="yawn-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Arahkan teleskop kubah kaca untuk mengamati lintasan rasi bintang kosmik yang berpendar menembus permukaan air laut astral.
            </p>
            <div class="yawn-constellation-box">
              <span class="yawn-constellation-graphic" id="yawn-constellation-symbol">♒</span>
              <h4 style="margin:0; font-size:1.05rem; color:#ffffff;" id="yawn-constellation-name">Aquarius Astral</h4>
              <p style="margin:0; font-size:0.78rem; color:#94a3b8;" id="yawn-constellation-desc">Rasi pembawa aliran air kosmik abadi.</p>
            </div>
            <div style="display:flex; gap:10px; justify-content:space-between;">
              <button type="button" class="yawn-action-btn" id="btn-yawn-cycle-constellation" style="background:rgba(8,24,62,0.8); border:1px solid rgba(125,211,252,0.5);">Arahkan Teleskop 🔄</button>
              <button type="button" class="yawn-action-btn" id="btn-yawn-log-constellation">Catat Pengamatan ✍️</button>
            </div>
          </div>
        </div>

        <!-- MODAL 3: GAZEBO (Moonlit Serenity Canopy) -->
        <div class="yawn-modal-overlay" id="yawn-gazebo-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="yawn-modal-card">
            <div class="yawn-modal-header">
              <div class="yawn-modal-header-left">
                <span class="yawn-modal-icon-badge">🌙</span>
                <div>
                  <span class="yawn-modal-tag">RELAKSASI • CANOPY KRISTAL</span>
                  <h3 class="yawn-modal-title">Gazebo</h3>
                </div>
              </div>
              <button type="button" class="yawn-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Gazebo berkanopi kaca berukir dengan sofa sutra putih. Tempat Akhira membaca buku kuno, mendengarkan desir ombak, dan menikmati keheningan bawah laut.
            </p>
            <div style="background:rgba(8,24,62,0.6); padding:14px; border-radius:12px; border:1px solid rgba(125,211,252,0.3); font-style:italic; color:#e0f2fe; font-size:0.82rem; line-height:1.5;">
              "Dalam keheningan samudra terdalam, setiap kilauan cahaya adalah bisikan bintang yang membimbing jiwa pulang."
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.75rem; color:#94a3b8;">🍵 Teh Karang Mutiara Tersedia</span>
              <button type="button" class="yawn-action-btn" id="btn-yawn-gazebo-tea">Seduh Teh &amp; Santai</button>
            </div>
          </div>
        </div>

        <!-- MODAL 4: CINEMA (Astral Starlight Theater) -->
        <div class="yawn-modal-overlay" id="yawn-cinema-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="yawn-modal-card">
            <div class="yawn-modal-header">
              <div class="yawn-modal-header-left">
                <span class="yawn-modal-icon-badge">🎬</span>
                <div>
                  <span class="yawn-modal-tag">HIBURAN • BIOSKOP PRIBADI</span>
                  <h3 class="yawn-modal-title">Cinema</h3>
                </div>
              </div>
              <button type="button" class="yawn-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <div class="yawn-cinema-screen">
              <div class="yawn-cinema-glow"></div>
              <span style="font-size:2.4rem; z-index:2;">📽️</span>
              <h4 style="margin:0; font-size:0.95rem; color:#ffffff; z-index:2;">Now Screening: The Song of Astral Whale</h4>
              <span style="font-size:0.75rem; color:#7dd3fc; z-index:2;">Koleksi Rekaman Teater Bawah Laut Akhira</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(8,24,62,0.5); padding:10px 14px; border-radius:10px; border:1px solid rgba(125,211,252,0.2);">
                <div>
                  <h5 style="margin:0; font-size:0.84rem; color:#ffffff;">1. Tales from the Deep Abyss</h5>
                  <span style="font-size:0.72rem; color:#94a3b8;">Durasi: 42 Menit • Audio 8D Ombak</span>
                </div>
                <span style="font-size:0.72rem; color:#38bdf8;">Siap Putar</span>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(8,24,62,0.5); padding:10px 14px; border-radius:10px; border:1px solid rgba(125,211,252,0.2);">
                <div>
                  <h5 style="margin:0; font-size:0.84rem; color:#ffffff;">2. Constellation Odyssey</h5>
                  <span style="font-size:0.72rem; color:#94a3b8;">Durasi: 38 Menit • Panorama Bintang</span>
                </div>
                <span style="font-size:0.72rem; color:#38bdf8;">Siap Putar</span>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end;">
              <button type="button" class="yawn-action-btn" id="btn-yawn-cinema-reserve">Pesan Kursi VIP Pearl 🎟️</button>
            </div>
          </div>
        </div>

        <!-- MODAL 5: MAILBOX (Seashell Post) -->
        <div class="yawn-modal-overlay" id="yawn-mailbox-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="yawn-modal-card">
            <div class="yawn-modal-header">
              <div class="yawn-modal-header-left">
                <span class="yawn-modal-icon-badge">💌</span>
                <div>
                  <span class="yawn-modal-tag">KOTAK POS • ASTRAL SEASHELL</span>
                  <h3 class="yawn-modal-title">Mailbox</h3>
                </div>
              </div>
              <button type="button" class="yawn-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div id="yawn-mailbox-letters-list"></div>
              <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
                <label for="yawn-input-letter-body" style="font-size:0.78rem; color:#94a3b8;">Tulis Surat Baru ke Lautan Lepas:</label>
                <textarea id="yawn-input-letter-body" rows="3" placeholder="Tuliskan pesanmu untuk universe..." style="background:rgba(8,20,52,0.8); border:1px solid rgba(125,211,252,0.4); border-radius:10px; padding:10px; color:#ffffff; font-size:0.82rem; font-family:inherit; resize:none;"></textarea>
                <div style="display:flex; justify-content:flex-end;">
                  <button type="button" class="yawn-action-btn" id="btn-yawn-send-letter">Kirim Surat 🕊️</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 6: GALLERY -->
        <div class="yawn-modal-overlay" id="yawn-gallery-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="yawn-modal-card">
            <div class="yawn-modal-header">
              <div class="yawn-modal-header-left">
                <span class="yawn-modal-icon-badge">🖼</span>
                <div>
                  <span class="yawn-modal-tag">GALERI • ABSTRAK &amp; MOMEN</span>
                  <h3 class="yawn-modal-title">Gallery</h3>
                </div>
              </div>
              <button type="button" class="yawn-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.84rem;">Koleksi visual &amp; lanskap mengagumkan di Underwater Astral City.</p>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:10px;">
              <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(125,211,252,0.3); height:110px; position:relative;">
                <img src="/assets/yawn_world_bg.jpg" alt="Palace" style="width:100%; height:100%; object-fit:cover;">
                <span style="position:absolute; bottom:4px; left:6px; font-size:0.68rem; color:#ffffff; text-shadow:0 1px 4px #000;">Istana Kristal</span>
              </div>
              <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(125,211,252,0.3); height:110px; position:relative;">
                <img src="/assets/island_yawn_floating.jpg" alt="Planet Yawn" style="width:100%; height:100%; object-fit:cover;">
                <span style="position:absolute; bottom:4px; left:6px; font-size:0.68rem; color:#ffffff; text-shadow:0 1px 4px #000;">Planet YAWN</span>
              </div>
              <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(125,211,252,0.3); height:110px; position:relative; background:linear-gradient(135deg, #0369a1, #1e1b4b); display:flex; align-items:center; justify-content:center;">
                <span style="font-size:2rem;">🐋</span>
                <span style="position:absolute; bottom:4px; left:6px; font-size:0.68rem; color:#ffffff; text-shadow:0 1px 4px #000;">Paus Astral</span>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 7: COLLECTION -->
        <div class="yawn-modal-overlay" id="yawn-collection-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="yawn-modal-card">
            <div class="yawn-modal-header">
              <div class="yawn-modal-header-left">
                <span class="yawn-modal-icon-badge">🧰</span>
                <div>
                  <span class="yawn-modal-tag">KOLEKSI PRIBADI • AKHIRA</span>
                  <h3 class="yawn-modal-title">Collection</h3>
                </div>
              </div>
              <button type="button" class="yawn-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <h4 style="margin:0; font-size:0.88rem; color:#38bdf8;">🪐 Hasil Pengamatan Astronomi:</h4>
            <div class="yawn-collection-grid" id="yawn-collection-astronomy-grid"></div>
            <h4 style="margin:12px 0 0 0; font-size:0.88rem; color:#c084fc;">✨ Relik Samudra Kosmik:</h4>
            <div class="yawn-collection-grid">
              <div class="yawn-artifact-item">
                <span class="yawn-artifact-icon">🪸</span>
                <div class="yawn-artifact-info">
                  <h4>Coral of Eternity</h4>
                  <p>Karang bersinar yang menyerap energi bintang laut.</p>
                </div>
              </div>
              <div class="yawn-artifact-item">
                <span class="yawn-artifact-icon">🪼</span>
                <div class="yawn-artifact-info">
                  <h4>Luminous Jellyfish Essence</h4>
                  <p>Cahaya murni ubur-ubur astral pemandu malam.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 8: SETTINGS -->
        <div class="yawn-modal-overlay" id="yawn-settings-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="yawn-modal-card">
            <div class="yawn-modal-header">
              <div class="yawn-modal-header-left">
                <span class="yawn-modal-icon-badge">⚙</span>
                <div>
                  <span class="yawn-modal-tag">PENGATURAN • AKHIRA'S UNIVERSE</span>
                  <h3 class="yawn-modal-title">Settings</h3>
                </div>
              </div>
              <button type="button" class="yawn-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">Musik Bawah Laut Astral</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Melodi synthesizer harmonik laut</p>
                </div>
                <button type="button" class="yawn-action-btn" id="btn-yawn-toggle-bgm">ON / OFF</button>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">Reset Data Pribadi</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Kosongkan riwayat pengamatan dan surat</p>
                </div>
                <button type="button" class="yawn-action-btn" id="btn-yawn-reset-data" style="background:#dc2626;">Reset Data</button>
              </div>
            </div>
          </div>
        </div>

      </section>
`;

const anchor = '<!-- VIEW: SHADOW — MOONLIT SERENITY GAZEBO';
if (html.includes(anchor)) {
  const parts = html.split(anchor);
  html = parts[0] + pinwheelSection + '\n' + yawnSection + '\n      <!-- ' + anchor + parts[1];
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully inserted PINWHEEL and YAWN sections into index.html');
} else {
  console.error('Anchor not found!');
  process.exit(1);
}

