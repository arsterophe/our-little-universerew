const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

const ashSection = `
      <!-- ============================================== -->
      <!-- VIEW: ASH — RUBEN'S UNIVERSE: THE DRAGON'S DEN -->
      <!-- ============================================== -->
      <section class="view-section view-ash-world" id="view-ash-world"
        aria-label="ASH - Ruben's Universe: The Dragon's Den" aria-hidden="true">

        <div class="ash-2d-stage" id="ash-2d-stage">

          <!-- 1. BASE BACKGROUND IMAGE (Gothic Fantasy Dragon Den Landscape) -->
          <div class="ash-base-layer">
            <img src="/assets/ash_world_bg.jpg"
              alt="Dunia 2D ASH - Ruben's Universe: The Dragon's Den" class="ash-scene-img"
              decoding="async" width="1024" height="576" fetchpriority="high">
            <div class="ash-color-grade" aria-hidden="true"></div>
          </div>

          <!-- 2. CANVAS FX (Flying Dragon, Stardust, Petals, Glowing Crystals) -->
          <canvas id="ash-magic-canvas" class="ash-magic-canvas" aria-hidden="true"></canvas>

          <!-- 3. TOP HEADER (Left: Profile Avatar, Center: Nav, Right: Settings) -->
          <header class="ash-top-header">

            <!-- A. Left: Ruben's Universe Identity & Profile Avatar -->
            <div class="ash-header-left">
              <div class="ash-header-avatar-wrap" title="Ruben — ASH: The Dragon's Den">
                <img src="/assets/card_ruben_hd.jpg" alt="Ruben" class="ash-header-avatar" id="ash-profile-avatar" width="44" height="44">
              </div>
              <div class="ash-header-titles">
                <h1 class="ash-header-main-title">RUBEN'S UNIVERSE</h1>
                <p class="ash-header-sub-title">THE DRAGON'S DEN ✧</p>
              </div>
            </div>

            <!-- B. Center: Explore Universe & Story Buttons -->
            <nav class="ash-header-center" aria-label="Navigasi Utama Ruben">
              <button type="button" class="ash-nav-pill-btn" id="btn-ash-top-explore" aria-label="Explore Universe">
                <span class="pill-icon">🧭</span>
                <span>Explore Universe</span>
              </button>
              <button type="button" class="ash-nav-pill-btn" id="btn-ash-top-story" aria-label="Story">
                <span class="pill-icon">📖</span>
                <span>Story</span>
              </button>
            </nav>

            <!-- C. Right: Settings Button -->
            <div class="ash-header-right">
              <button type="button" class="ash-settings-btn" id="btn-ash-settings" aria-label="Pengaturan Universe" title="Settings">
                <span>⚙</span>
              </button>
            </div>

          </header>

          <!-- 4. INTERACTIVE LOCATIONS ON THE ARTWORK (8 Floating Glass Hotspots) -->
          <div class="ash-locations-stage" aria-label="Lokasi Utama The Dragon's Den">
            
            <!-- A. Ruben's Castle (Center High Castle) -->
            <button type="button" class="ash-loc-btn btn-loc-ash-castle" id="btn-loc-ash-castle" aria-label="Ruben's Castle">
              <span class="ash-loc-icon">🏰</span>
              <span>Ruben's Castle</span>
            </button>

            <!-- B. Civil Engineering Lab (Left High Glass Observatory Lab) -->
            <button type="button" class="ash-loc-btn btn-loc-ash-engineering" id="btn-loc-ash-engineering" aria-label="Civil Engineering Lab">
              <span class="ash-loc-icon">📐</span>
              <span>Civil Engineering Lab</span>
            </button>

            <!-- C. Dragon Observatory (Telescope on Terrace) -->
            <button type="button" class="ash-loc-btn btn-loc-ash-observatory" id="btn-loc-ash-observatory" aria-label="Dragon Observatory">
              <span class="ash-loc-icon">🔭</span>
              <span>Dragon Observatory</span>
            </button>

            <!-- D. Moon Gazebo (Left Lower Island Canopy) -->
            <button type="button" class="ash-loc-btn btn-loc-ash-gazebo" id="btn-loc-ash-gazebo" aria-label="Moon Gazebo">
              <span class="ash-loc-icon">🌙</span>
              <span>Moon Gazebo</span>
            </button>

            <!-- E. Zen Garden (Center Lower Garden & Pathways) -->
            <button type="button" class="ash-loc-btn btn-loc-ash-garden" id="btn-loc-ash-garden" aria-label="Zen Garden">
              <span class="ash-loc-icon">🌸</span>
              <span>Zen Garden</span>
            </button>

            <!-- F. Dragon Mailbox (Stairway Crystal Post) -->
            <button type="button" class="ash-loc-btn btn-loc-ash-mailbox" id="btn-loc-ash-mailbox" aria-label="Dragon Mailbox">
              <span class="ash-loc-icon">💌</span>
              <span>Dragon Mailbox</span>
            </button>

            <!-- G. Gaming Zone (Right Lower Island PC Setup) -->
            <button type="button" class="ash-loc-btn btn-loc-ash-gaming" id="btn-loc-ash-gaming" aria-label="Gaming Zone">
              <span class="ash-loc-icon">🎮</span>
              <span>Gaming Zone</span>
            </button>

            <!-- H. Anime & Music Room (Right Spire Lounge) -->
            <button type="button" class="ash-loc-btn btn-loc-ash-music" id="btn-loc-ash-music" aria-label="Anime & Music Room">
              <span class="ash-loc-icon">🎵</span>
              <span>Anime & Music Room</span>
            </button>

          </div>

          <!-- 5. BOTTOM BAR (Music Player, Tagline & Action Circles) -->
          <div class="ash-bottom-bar">

            <!-- Bottom Left: Fantasy Orchestral Music Player -->
            <div class="ash-music-player" id="ash-music-player" aria-label="Pemutar Musik ASH">
              <div class="ash-music-vinyl" id="ash-music-vinyl" title="Piringan Musik Naga">
                <span>🐉</span>
              </div>
              <div class="ash-music-info">
                <span class="ash-music-title" id="ash-music-title">Song of the Dragon King</span>
                <span class="ash-music-sub" id="ash-music-sub">Majestic Strings &amp; Harp • 68 BPM</span>
                <div class="ash-music-progress-bar">
                  <div class="ash-music-progress-fill" id="ash-music-progress-fill"></div>
                </div>
              </div>
              <div class="ash-music-controls">
                <button type="button" class="ash-music-ctrl-btn" id="btn-ash-music-prev" aria-label="Lagu Sebelumnya" title="Previous">⏮</button>
                <button type="button" class="ash-music-ctrl-btn ash-play-btn" id="btn-ash-music-play" aria-label="Putar Musik" title="Play / Pause">
                  <span id="ash-play-icon">▶</span>
                </button>
                <button type="button" class="ash-music-ctrl-btn" id="btn-ash-music-next" aria-label="Lagu Berikutnya" title="Next">⏭</button>
              </div>
            </div>

            <!-- Bottom Center: Main Title & Subtitle Tagline -->
            <div class="ash-tagline-panel">
              <span class="ash-tagline-main">A thousand worlds, one dragon.</span>
              <span class="ash-tagline-sub">"Just another place to hide... and maybe, with you."</span>
            </div>

            <!-- Bottom Right: Gallery & Collection -->
            <div class="ash-bottom-actions">
              <button type="button" class="ash-big-action-btn" id="btn-ash-gallery" aria-label="Buka Galeri Foto Ruben">
                <div class="ash-big-action-circle">🖼</div>
                <span class="ash-big-action-label">Gallery</span>
              </button>
              <button type="button" class="ash-big-action-btn" id="btn-ash-collection" aria-label="Buka Koleksi Bintang & Relik Naga">
                <div class="ash-big-action-circle">🧰</div>
                <span class="ash-big-action-label">Collection</span>
              </button>
            </div>

          </div>

        </div>

        <!-- ============================================== -->
        <!-- ASH SUB-MODALS & INTERACTIVE DIALOGS           -->
        <!-- ============================================== -->

        <!-- MODAL 1: RUBEN'S CASTLE (Personal Profile & Memories) -->
        <div class="ash-modal-overlay" id="ash-castle-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">🏰</span>
                <div>
                  <span class="ash-modal-tag">KEDIAMAN UTAMA • RUBEN</span>
                  <h3 class="ash-modal-title">Ruben's Castle</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Kastil gotik megah yang bertengger di atas pulau melayang. Ruang pribadi Ruben dengan pilar kristal violet, perpustakaan, dan perapian hangat.
            </p>
            <div style="display:flex; flex-direction:column; gap:12px;">
              <div class="ash-field-group">
                <label class="ash-field-label" for="ash-profile-bio">Biografi / Filosofi Pribadi:</label>
                <textarea id="ash-profile-bio" rows="2" class="ash-field-input" placeholder="Tuliskan biografi singkat Ruben..."></textarea>
              </div>
              <div class="ash-grid-2col">
                <div class="ash-field-group">
                  <label class="ash-field-label" for="ash-profile-hobbies">Hobi &amp; Aktivitas Favorit:</label>
                  <input type="text" id="ash-profile-hobbies" class="ash-field-input" placeholder="Civil Engineering, Gaming, Anime...">
                </div>
                <div class="ash-field-group">
                  <label class="ash-field-label" for="ash-profile-anime">Anime Favorit:</label>
                  <input type="text" id="ash-profile-anime" class="ash-field-input" placeholder="Judul anime favorit...">
                </div>
              </div>
              <div class="ash-field-group">
                <label class="ash-field-label" for="ash-profile-music">Musik &amp; Artis Favorit:</label>
                <input type="text" id="ash-profile-music" class="ash-field-input" placeholder="K-pop, Guitar Fingerstyle, Orchestral...">
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button type="button" class="ash-action-btn" id="btn-ash-save-profile">Simpan Profil 💾</button>
            </div>
          </div>
        </div>

        <!-- MODAL 2: CIVIL ENGINEERING LAB -->
        <div class="ash-modal-overlay" id="ash-engineering-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">📐</span>
                <div>
                  <span class="ash-modal-tag">STUDIO TEKNIK SIPIL &amp; ARSITEKTUR</span>
                  <h3 class="ash-modal-title">Civil Engineering Lab</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Studio kreatif teknik sipil dengan meja cetak biru (blueprint), model jembatan melayang, dan instrumen kalkulasi struktur kastil kosmik.
            </p>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div style="background:rgba(20,9,38,0.7); padding:12px; border-radius:10px; border:1px solid rgba(216,180,254,0.3);">
                <h4 style="margin:0; font-size:0.86rem; color:#ffffff;">🏗 Proyek: Floating Island Bridge Resonance</h4>
                <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Analisis kestabilan lengkung jembatan batu yang menghubungkan kastil naga dengan pulau-pulau melayang.</p>
                <div style="margin-top:6px; display:flex; justify-content:space-between; font-size:0.72rem; color:#c084fc;">
                  <span>Status: Desain Selesai</span>
                  <span>Faktor Keamanan: 2.8</span>
                </div>
              </div>
              <div style="background:rgba(20,9,38,0.7); padding:12px; border-radius:10px; border:1px solid rgba(216,180,254,0.3);">
                <h4 style="margin:0; font-size:0.86rem; color:#ffffff;">🏛 Proyek: Dragon Spire Structural Load</h4>
                <p style="margin:4px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Penyelidikan beban angin kosmik dan gaya gravitasi lokal pada menara gotik tertinggi.</p>
                <div style="margin-top:6px; display:flex; justify-content:space-between; font-size:0.72rem; color:#c084fc;">
                  <span>Status: Simulasi Berjalan</span>
                  <span>Efisiensi: 98%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 3: DRAGON OBSERVATORY -->
        <div class="ash-modal-overlay" id="ash-observatory-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">🔭</span>
                <div>
                  <span class="ash-modal-tag">ASTRONOMI • DRAGON TELESCOPE</span>
                  <h3 class="ash-modal-title">Dragon Observatory</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Teleskop raksasa di teras berbatu untuk mengamati konstelasi naga kosmik dan bulan raksasa yang menerangi The Dragon's Den.
            </p>
            <div style="background:radial-gradient(circle at center, #1e0d38 0%, #0c0517 100%); border:1px solid rgba(216,180,254,0.35); border-radius:14px; padding:16px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px;">
              <span id="ash-obs-symbol" style="font-size:3rem; filter:drop-shadow(0 0 16px rgba(192,132,252,0.8));">🐉</span>
              <h4 id="ash-obs-name" style="margin:0; font-size:1.05rem; color:#ffffff;">Draco Constellation</h4>
              <p id="ash-obs-desc" style="margin:0; font-size:0.78rem; color:#d8b4fe;">Rasi naga kosmik yang melingkari kutub utara langit ASH.</p>
            </div>
            <div style="display:flex; justify-content:space-between; gap:10px;">
              <button type="button" class="ash-action-btn" id="btn-ash-cycle-constellation" style="background:rgba(20,9,38,0.8); border:1px solid rgba(216,180,254,0.5);">Arahkan Teleskop 🔄</button>
              <button type="button" class="ash-action-btn" id="btn-ash-log-constellation">Catat Pengamatan ✍️</button>
            </div>
          </div>
        </div>

        <!-- MODAL 4: MOON GAZEBO -->
        <div class="ash-modal-overlay" id="ash-gazebo-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">🌙</span>
                <div>
                  <span class="ash-modal-tag">RELAKSASI • CANOPY BULAN</span>
                  <h3 class="ash-modal-title">Moon Gazebo</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Gazebo berukir kayu elegan dengan tirai sutra putih di pulau barat. Dari sini bulan raksasa terlihat paling megah dan damai.
            </p>
            <div style="background:rgba(20,9,38,0.6); padding:14px; border-radius:12px; border:1px solid rgba(216,180,254,0.3); font-style:italic; color:#e9d5ff; font-size:0.82rem; line-height:1.5;">
              "Dikelilingi lautan bintang dan sayap naga yang meluncur tenang, dunia ini menjadi tempat berlindung ternyaman."
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:0.75rem; color:#d8b4fe;">🕯 Lentera Kristal Ungu Menyala</span>
              <button type="button" class="ash-action-btn" id="btn-ash-gazebo-relax">Momen Tenang ☕</button>
            </div>
          </div>
        </div>

        <!-- MODAL 5: ZEN GARDEN -->
        <div class="ash-modal-overlay" id="ash-garden-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">🌸</span>
                <div>
                  <span class="ash-modal-tag">TAMAN SAKURA &amp; KRISTAL</span>
                  <h3 class="ash-modal-title">Zen Garden</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Jalan setapak batu dihiasi formasi kristal violet raksasa, rumpun bunga sakura abadi, dan lentera batu bercahaya lembut.
            </p>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
              <div style="background:rgba(20,9,38,0.6); padding:10px; border-radius:10px; border:1px solid rgba(216,180,254,0.2);">
                <span style="font-size:1.5rem;">🌸</span>
                <h5 style="margin:4px 0 2px 0; font-size:0.82rem; color:#ffffff;">Eternal Sakura</h5>
                <p style="margin:0; font-size:0.72rem; color:#cbd5e1;">Kelopak bunga yang tak pernah layu dihembus angin kosmik.</p>
              </div>
              <div style="background:rgba(20,9,38,0.6); padding:10px; border-radius:10px; border:1px solid rgba(216,180,254,0.2);">
                <span style="font-size:1.5rem;">💎</span>
                <h5 style="margin:4px 0 2px 0; font-size:0.82rem; color:#ffffff;">Violet Crystal Spire</h5>
                <p style="margin:0; font-size:0.72rem; color:#cbd5e1;">Batu kristal penstabil energi gravitasi pulau melayang.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 6: DRAGON MAILBOX -->
        <div class="ash-modal-overlay" id="ash-mailbox-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">💌</span>
                <div>
                  <span class="ash-modal-tag">KOTAK SURAT • THE DRAGON'S DEN</span>
                  <h3 class="ash-modal-title">Dragon Mailbox</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:10px;">
              <div id="ash-mailbox-letters-list"></div>
              <div style="display:flex; flex-direction:column; gap:6px; margin-top:6px;">
                <label for="ash-input-letter-body" style="font-size:0.78rem; color:#d8b4fe;">Tulis Surat Baru ke Alam Semesta:</label>
                <textarea id="ash-input-letter-body" rows="3" placeholder="Tuliskan pesanmu dari The Dragon's Den..." style="background:rgba(20,9,38,0.8); border:1px solid rgba(216,180,254,0.4); border-radius:10px; padding:10px; color:#ffffff; font-size:0.82rem; font-family:inherit; resize:none;"></textarea>
                <div style="display:flex; justify-content:flex-end;">
                  <button type="button" class="ash-action-btn" id="btn-ash-send-letter">Kirim Surat 🕊️</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 7: GAMING ZONE -->
        <div class="ash-modal-overlay" id="ash-gaming-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">🎮</span>
                <div>
                  <span class="ash-modal-tag">RUANG GAMING • BATTLESTATION</span>
                  <h3 class="ash-modal-title">Gaming Zone</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Pulau terbuka dengan setup multi-monitor gaming bercahaya RGB ungu, kursi ergonomis, dan headphone studio berpendar di samping air terjun melayang.
            </p>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="background:rgba(20,9,38,0.6); padding:10px 14px; border-radius:10px; border:1px solid rgba(216,180,254,0.2); display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h5 style="margin:0; font-size:0.84rem; color:#ffffff;">🖥 Setup: Dragon Battlestation Pro</h5>
                  <span style="font-size:0.72rem; color:#d8b4fe;">Triple Curved OLED • Low Latency Starlink</span>
                </div>
                <span style="font-size:0.72rem; color:#34d399; font-weight:700;">ONLINE</span>
              </div>
              <div style="background:rgba(20,9,38,0.6); padding:10px 14px; border-radius:10px; border:1px solid rgba(216,180,254,0.2); display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h5 style="margin:0; font-size:0.84rem; color:#ffffff;">🎯 Hub Games Bersama</h5>
                  <span style="font-size:0.72rem; color:#d8b4fe;">Mainkan game mini interaktif Our Little Universe</span>
                </div>
                <button type="button" class="ash-action-btn" id="btn-ash-goto-games" style="padding:6px 14px; font-size:0.76rem;">Buka Games 🕹️</button>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 8: ANIME & MUSIC ROOM -->
        <div class="ash-modal-overlay" id="ash-music-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">🎵</span>
                <div>
                  <span class="ash-modal-tag">LOUNGE MUSIK &amp; ANIME</span>
                  <h3 class="ash-modal-title">Anime &amp; Music Room</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Ruang santai dengan rak koleksi manga, poster anime klasik, gitar akustik di sudut ruangan, dan pemutar piringan hitam K-pop &amp; orchestral.
            </p>
            <div style="display:flex; flex-direction:column; gap:8px;">
              <div style="background:rgba(20,9,38,0.6); padding:10px 14px; border-radius:10px; border:1px solid rgba(216,180,254,0.2);">
                <h5 style="margin:0; font-size:0.84rem; color:#ffffff;">🎸 Guitar Corner</h5>
                <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Gitar akustik dengan nada-nada fingerstyle yang menenangkan di malam hari.</p>
              </div>
              <div style="background:rgba(20,9,38,0.6); padding:10px 14px; border-radius:10px; border:1px solid rgba(216,180,254,0.2);">
                <h5 style="margin:0; font-size:0.84rem; color:#ffffff;">📺 Anime Watchlist</h5>
                <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Koleksi serial fantasi, petualangan dunia lain, dan cerita persahabatan.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 9: GALLERY -->
        <div class="ash-modal-overlay" id="ash-gallery-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">🖼</span>
                <div>
                  <span class="ash-modal-tag">GALERI FOTO • RUBEN</span>
                  <h3 class="ash-modal-title">Gallery</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.84rem;">Koleksi pemandangan mengagumkan di The Dragon's Den.</p>
            <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(150px, 1fr)); gap:10px;">
              <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(216,180,254,0.3); height:110px; position:relative;">
                <img src="/assets/ash_world_bg.jpg" alt="Castle" style="width:100%; height:100%; object-fit:cover;">
                <span style="position:absolute; bottom:4px; left:6px; font-size:0.68rem; color:#ffffff; text-shadow:0 1px 4px #000;">Kastil Naga</span>
              </div>
              <div style="border-radius:10px; overflow:hidden; border:1px solid rgba(216,180,254,0.3); height:110px; position:relative;">
                <img src="/assets/island_ash_floating.jpg" alt="Planet Ash" style="width:100%; height:100%; object-fit:cover;">
                <span style="position:absolute; bottom:4px; left:6px; font-size:0.68rem; color:#ffffff; text-shadow:0 1px 4px #000;">Planet ASH</span>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 10: COLLECTION -->
        <div class="ash-modal-overlay" id="ash-collection-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">🧰</span>
                <div>
                  <span class="ash-modal-tag">KOLEKSI PRIBADI • RUBEN</span>
                  <h3 class="ash-modal-title">Collection</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <h4 style="margin:0; font-size:0.88rem; color:#c084fc;">🔭 Pengamatan Observatorium:</h4>
            <div class="ash-collection-grid" id="ash-collection-astronomy-grid"></div>
            <h4 style="margin:12px 0 0 0; font-size:0.88rem; color:#e9d5ff;">✨ Pusaka &amp; Relik Naga:</h4>
            <div class="ash-collection-grid">
              <div class="ash-artifact-item">
                <span class="ash-artifact-icon">🐉</span>
                <div class="ash-artifact-info">
                  <h4>Scale of the Silver Dragon</h4>
                  <p>Sisik naga perak yang memancarkan pendar perlindungan.</p>
                </div>
              </div>
              <div class="ash-artifact-item">
                <span class="ash-artifact-icon">💎</span>
                <div class="ash-artifact-info">
                  <h4>Den Heart Crystal</h4>
                  <p>Inti kristal ungu penopang gravitasi pulau kastil.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MODAL 11: SETTINGS -->
        <div class="ash-modal-overlay" id="ash-settings-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="ash-modal-card">
            <div class="ash-modal-header">
              <div class="ash-modal-header-left">
                <span class="ash-modal-icon-badge">⚙</span>
                <div>
                  <span class="ash-modal-tag">PENGATURAN • RUBEN'S UNIVERSE</span>
                  <h3 class="ash-modal-title">Settings</h3>
                </div>
              </div>
              <button type="button" class="ash-modal-close-btn" aria-label="Tutup">✕</button>
            </div>
            <div style="display:flex; flex-direction:column; gap:14px;">
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">Musik Fantasy Orchestral</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Instrumen senar naga &amp; harpa</p>
                </div>
                <button type="button" class="ash-action-btn" id="btn-ash-toggle-bgm">ON / OFF</button>
              </div>
              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">Reset Data Pribadi</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Kosongkan riwayat profil, surat, dan pengamatan</p>
                </div>
                <button type="button" class="ash-action-btn" id="btn-ash-reset-data" style="background:#dc2626;">Reset Data</button>
              </div>
            </div>
          </div>
        </div>

      </section>
`;

const anchor = '<!-- VIEW: SHADOW — MOONLIT SERENITY GAZEBO';
if (html.includes(anchor)) {
  const parts = html.split(anchor);
  html = parts[0] + ashSection + '\n      <!-- ' + anchor + parts[1];
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('Successfully inserted ASH section into index.html');
} else {
  console.error('Anchor not found!');
  process.exit(1);
}

