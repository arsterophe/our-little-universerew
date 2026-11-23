const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Link stylesheet
const cssTarget = '<link rel="stylesheet" href="/pinwheel_studio.css">';
if (!html.includes('/pinwheel_residence.css')) {
  if (html.includes(cssTarget)) {
    html = html.replace(cssTarget, cssTarget + '\r\n  <link rel="stylesheet" href="/pinwheel_residence.css">');
    console.log('Added stylesheet link');
  } else {
    console.error('cssTarget not found');
  }
}

// 2. Add enter residence button to #pinwheel-residence-modal
const modalTarget = 'id="btn-close-residence-modal"';
if (html.includes(modalTarget) && !html.includes('id="btn-enter-pinwheel-residence"')) {
  const modalBlockEnd = 'id="pinwheel-observatory-modal"';
  const pos = html.indexOf(modalBlockEnd);
  if (pos !== -1) {
    const beforeBlock = html.substring(0, pos);
    const lastCloseDiv = beforeBlock.lastIndexOf('</div>');
    const secondLastCloseDiv = beforeBlock.lastIndexOf('</div>', lastCloseDiv - 1);
    const enterBtnHtml = `
            <div style="display:flex; justify-content:flex-end; margin-top:14px;">
              <button type="button" class="pinwheel-action-btn" id="btn-enter-pinwheel-residence" style="background: linear-gradient(135deg, #7e22ce, #9333ea); border: 1px solid #c084fc; color: #ffffff; padding: 10px 18px; border-radius: 999px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(192, 132, 252, 0.4);">
                ⛩️ Masuk ke The Windwhisper Residence ✨
              </button>
            </div>`;
    html = html.substring(0, secondLastCloseDiv) + enterBtnHtml + '\r\n          ' + html.substring(secondLastCloseDiv);
    console.log('Added enter residence button to modal');
  }
}

// 3. Insert view section for residence
const sectionTarget = 'id="view-pinwheel-vision-studio"';
const nextSectionTarget = 'id="view-yawn-world"';

if (!html.includes('id="view-pinwheel-residence"')) {
  const nextPos = html.indexOf(nextSectionTarget);
  if (nextPos !== -1) {
    const beforeNext = html.substring(0, nextPos);
    const lastSectionEnd = beforeNext.lastIndexOf('</section>');
    if (lastSectionEnd !== -1) {
      const insertIdx = lastSectionEnd + '</section>'.length;

      const residenceSectionHtml = `

      <!-- ============================================== -->
      <!-- VIEW: THE WINDWHISPER RESIDENCE — SYMA'S UNIVERSE -->
      <!-- ============================================== -->
      <section class="view-section view-pinwheel-residence atmo-afternoon" id="view-pinwheel-residence"
        aria-label="The Windwhisper Residence — Syma's Japanese Kitsune Home" aria-hidden="true">

        <!-- Dynamic Atmosphere & Weather Overlays -->
        <div class="residence-atmo-layer" aria-hidden="true"></div>

        <!-- Rain streaks layer -->
        <div class="residence-rain-container" aria-hidden="true">
          <div class="residence-rain-streak" style="left: 10%; animation-delay: 0s;"></div>
          <div class="residence-rain-streak" style="left: 22%; animation-delay: 0.3s;"></div>
          <div class="residence-rain-streak" style="left: 35%; animation-delay: 0.1s;"></div>
          <div class="residence-rain-streak" style="left: 48%; animation-delay: 0.5s;"></div>
          <div class="residence-rain-streak" style="left: 60%; animation-delay: 0.2s;"></div>
          <div class="residence-rain-streak" style="left: 74%; animation-delay: 0.4s;"></div>
          <div class="residence-rain-streak" style="left: 88%; animation-delay: 0.15s;"></div>
        </div>

        <!-- Floating Sakura Petals -->
        <div class="residence-petals-layer" aria-hidden="true">
          <div class="residence-petal" style="left: 15%; animation-duration: 11s; animation-delay: 0s;">🌸</div>
          <div class="residence-petal" style="left: 32%; animation-duration: 13s; animation-delay: 2s; font-size: 1.3rem;">🌸</div>
          <div class="residence-petal" style="left: 55%; animation-duration: 10s; animation-delay: 4s;">🌸</div>
          <div class="residence-petal" style="left: 75%; animation-duration: 14s; animation-delay: 1.5s;">🌸</div>
          <div class="residence-petal" style="left: 88%; animation-duration: 12s; animation-delay: 3s;">🌸</div>
        </div>

        <!-- Top Navigation & Branding Bar -->
        <header class="residence-top-bar">
          <div class="residence-brand-group">
            <button type="button" class="btn-residence-back" id="btn-pinwheel-residence-back" aria-label="Kembali ke Universe PINWHEEL">
              <span>←</span>
              <span>PINWHEEL</span>
            </button>
            <div class="residence-title-badge">
              <h2 class="residence-main-title">
                <span>⛩️</span> THE WINDWHISPER RESIDENCE
              </h2>
              <p class="residence-subtitle">"Where the wind rests, and little moments become home."</p>
            </div>
          </div>

          <div class="residence-controls-group">
            <div class="residence-atmo-pill" role="group" aria-label="Pilihan Waktu & Cuaca">
              <button type="button" class="btn-atmo-choice" data-atmo="morning" title="Pagi Hari">☀️ Pagi</button>
              <button type="button" class="btn-atmo-choice active" data-atmo="afternoon" title="Sore Hari">🌤️ Sore</button>
              <button type="button" class="btn-atmo-choice" data-atmo="rain" title="Hari Hujan">🌧️ Hujan</button>
              <button type="button" class="btn-atmo-choice" data-atmo="night" title="Malam Hari">🌙 Malam</button>
            </div>

            <button type="button" class="btn-residence-chime-ring" id="btn-residence-chime-ring" title="Bunyikan Lonceng Angin">
              <span class="chime-bell-icon">🎐</span>
              <span>Denting Angin</span>
            </button>
          </div>
        </header>

        <!-- Room Navigation Dock -->
        <nav class="residence-room-dock" aria-label="Navigasi Ruangan Rumah Syma">
          <button type="button" class="btn-room-nav active" data-room="exterior">
            <span>⛩️</span> Halaman & Teras
          </button>
          <button type="button" class="btn-room-nav" data-room="living">
            <span>🛋️</span> Ruang Tamu (Kotatsu)
          </button>
          <button type="button" class="btn-room-nav" data-room="kitchen">
            <span>🍳</span> Dapur (Little Kitchen)
          </button>
          <button type="button" class="btn-room-nav" data-room="bedroom">
            <span>🛏️</span> Kamar Tidur (Cloud Nine)
          </button>
          <button type="button" class="btn-room-nav" data-room="archive">
            <span>📚</span> Sudut Arsip (The Archive)
          </button>
          <button type="button" class="btn-room-nav" data-room="engawa">
            <span>🍵</span> Beranda (Engawa)
          </button>
          <button type="button" class="btn-room-nav" data-room="attic">
            <span>🗝️</span> Loteng Rahasia (Attic)
          </button>
        </nav>

        <!-- Center Stage for 5 Personal Rooms + Exterior + Attic -->
        <main class="residence-center-stage">

          <!-- 1. ROOM: EXTERIOR (The Little Sanctuary) -->
          <section class="residence-room-container room-exterior active" data-room="exterior">
            <div class="room-info-card">
              <div class="room-info-left">
                <span class="room-info-icon">⛩️</span>
                <div>
                  <h3 class="room-info-title">Halaman & Teras — The Little Sanctuary</h3>
                  <p class="room-info-desc">Jalan setapak batu alam di antara pohon sakura, kincir angin, dan kolam koi yang tenang.</p>
                </div>
              </div>
              <div class="room-info-actions">
                <button type="button" class="btn-room-action primary" data-residence-action="enter_house">
                  🚪 Masuk ke Dalam Rumah
                </button>
                <button type="button" class="btn-room-action" id="btn-decor-toggle-exterior" data-residence-action="toggle_decor">
                  🎨 Mode Dekorasi
                </button>
              </div>
            </div>

            <div class="room-scenery-canvas">
              <div class="scenery-pagoda-roof">
                <span class="pagoda-eaves-tile">🏮</span>
                <span class="pagoda-eaves-tile">🎐</span>
                <span class="pagoda-eaves-tile">🏮</span>
              </div>
              <div class="scenery-stone-path"></div>
              
              <!-- Koi Pond -->
              <div class="scenery-koi-pond" data-residence-action="watch_pond" title="Kolam Koi Refleksi">
                <span class="koi-fish-swimming">🐟</span>
              </div>

              <!-- Animated Pinwheel Prop -->
              <div class="scenery-pinwheel-prop" title="Kincir Angin Berputar">🌸</div>

              <!-- Wind Chime Prop on Porch -->
              <div class="scenery-wind-chime-prop" data-residence-action="chime_menu" title="Lonceng Angin Teras">
                <span style="font-size:2.2rem;">🎐</span>
                <span style="font-size:0.68rem; background:rgba(0,0,0,0.6); padding:2px 6px; border-radius:4px;">Ubah Lonceng</span>
              </div>

              <!-- Hotspot Buttons in Exterior -->
              <button type="button" class="residence-hotspot" style="top:110px; left:40px;" data-residence-action="shrine_menu">
                <span class="hotspot-pulse-dot"></span>
                <span>⛩️ Altar Kitsune</span>
              </button>
              <button type="button" class="residence-hotspot" style="bottom:120px; left:35%;" data-residence-action="enter_house">
                <span class="hotspot-pulse-dot"></span>
                <span>🚪 Pintu Masuk Shoji</span>
              </button>
              <button type="button" class="residence-hotspot" style="bottom:70px; right:120px;" data-residence-action="sit_porch">
                <span class="hotspot-pulse-dot"></span>
                <span>🪑 Duduk di Teras</span>
              </button>
              <button type="button" class="residence-hotspot" style="top:80px; left:25%;" data-residence-action="toggle_lanterns">
                <span class="hotspot-pulse-dot"></span>
                <span>🏮 Lentera Taman</span>
              </button>

              <!-- Dynamic Placed Decor Slots -->
              <div id="room-slots-exterior"></div>
            </div>
          </section>

          <!-- 2. ROOM: LIVING ROOM (The Heart of Home) -->
          <section class="residence-room-container room-living" data-room="living">
            <div class="room-info-card">
              <div class="room-info-left">
                <span class="room-info-icon">🛋️</span>
                <div>
                  <h3 class="room-info-title">Ruang Tamu — The Heart of Home</h3>
                  <p class="room-info-desc">Lantai tatami tradisional dengan kotatsu hangat berselimut lavender dan rak buku kenangan.</p>
                </div>
              </div>
              <div class="room-info-actions">
                <button type="button" class="btn-room-action primary" data-residence-action="sit_kotatsu">
                  🛋️ Duduk di Kotatsu
                </button>
                <button type="button" class="btn-room-action" id="btn-decor-toggle-living" data-residence-action="toggle_decor">
                  🎨 Mode Dekorasi
                </button>
              </div>
            </div>

            <div class="room-scenery-canvas">
              <div class="scenery-shoji-wall">
                <div class="shoji-panel"></div>
                <div class="shoji-panel"></div>
                <div class="shoji-panel"></div>
              </div>
              <div class="scenery-tatami-floor"></div>

              <!-- Kotatsu Prop in Center -->
              <div class="scenery-kotatsu-prop" data-residence-action="sit_kotatsu" title="Kotatsu Hangat">
                <div class="kotatsu-top-table">
                  <span title="Cangkir Teh">🍵</span>
                  <span title="Camilan Dango">🍡</span>
                </div>
              </div>

              <!-- Hotspot Buttons in Living Room -->
              <button type="button" class="residence-hotspot" style="top:110px; left:50px;" data-residence-action="read_book">
                <span class="hotspot-pulse-dot"></span>
                <span>📚 Rak Buku Kisah</span>
              </button>
              <button type="button" class="residence-hotspot" style="bottom:150px; right:60px;" data-residence-action="drink_tea">
                <span class="hotspot-pulse-dot"></span>
                <span>🍵 Seduh Teh Hangat</span>
              </button>
              <button type="button" class="residence-hotspot" style="top:90px; right:40px;" data-residence-action="shrine_menu">
                <span class="hotspot-pulse-dot"></span>
                <span>🦊 Ornamen Rubah</span>
              </button>

              <!-- Dynamic Placed Decor Slots -->
              <div id="room-slots-living"></div>
            </div>
          </section>

          <!-- 3. ROOM: KITCHEN (Little Kitchen) -->
          <section class="residence-room-container room-kitchen" data-room="kitchen">
            <div class="room-info-card">
              <div class="room-info-left">
                <span class="room-info-icon">🍳</span>
                <div>
                  <h3 class="room-info-title">Dapur Kecil — Little Kitchen</h3>
                  <p class="room-info-desc">Dapur Japanese cottage dengan ketel teh mendidih, rak rempah, dan aroma bunga sakura.</p>
                </div>
              </div>
              <div class="room-info-actions">
                <button type="button" class="btn-room-action primary" data-residence-action="open_cooking">
                  ✨ Resep & Memasak
                </button>
                <button type="button" class="btn-room-action" id="btn-decor-toggle-kitchen" data-residence-action="toggle_decor">
                  🎨 Mode Dekorasi
                </button>
              </div>
            </div>

            <div class="room-scenery-canvas">
              <div class="scenery-kitchen-counter">
                <div class="steaming-kettle" data-residence-action="open_cooking" title="Ketel Teh Mendidih">
                  <span>🫖</span>
                  <span class="kettle-steam-fx">💨</span>
                </div>
                <div style="font-size:2.2rem; cursor:pointer;" data-residence-action="open_cooking" title="Rak Bahan Teh">
                  🍯
                </div>
                <div style="font-size:2.2rem; cursor:pointer;" data-residence-action="open_cooking" title="Piring Saji">
                  🍡
                </div>
              </div>

              <!-- Hotspot Buttons in Kitchen -->
              <button type="button" class="residence-hotspot" style="top:90px; left:50px;" data-residence-action="open_cooking">
                <span class="hotspot-pulse-dot"></span>
                <span>🌸 Seduh Sakura Tea</span>
              </button>
              <button type="button" class="residence-hotspot" style="top:90px; right:50px;" data-residence-action="open_cooking">
                <span class="hotspot-pulse-dot"></span>
                <span>🍯 Racik Honey Milk Tea</span>
              </button>

              <!-- Dynamic Placed Decor Slots -->
              <div id="room-slots-kitchen"></div>
            </div>
          </section>

          <!-- 4. ROOM: BEDROOM (Cloud Nine) -->
          <section class="residence-room-container room-bedroom" data-room="bedroom">
            <div class="room-info-card">
              <div class="room-info-left">
                <span class="room-info-icon">🛏️</span>
                <div>
                  <h3 class="room-info-title">Kamar Pribadi — Cloud Nine</h3>
                  <p class="room-info-desc">Kasur futon nyaman selembut awan dengan pemandangan rembulan dan lemari pakaian pribadi.</p>
                </div>
              </div>
              <div class="room-info-actions">
                <button type="button" class="btn-room-action primary" data-residence-action="sleep_futon">
                  🌙 Tidur & Beristirahat
                </button>
                <button type="button" class="btn-room-action" data-residence-action="open_wardrobe">
                  👘 Lemari Pakaian
                </button>
                <button type="button" class="btn-room-action" id="btn-decor-toggle-bedroom" data-residence-action="toggle_decor">
                  🎨 Mode Dekorasi
                </button>
              </div>
            </div>

            <div class="room-scenery-canvas">
              <div class="scenery-moon-window" title="Jendela Rembulan">
                <span style="font-size:2.4rem;">🌙</span>
              </div>

              <!-- Futon Bed Prop -->
              <div class="scenery-futon-bed" data-residence-action="sleep_futon" title="Kasur Futon Awan">
                <div class="futon-pillow"></div>
                <div class="futon-duvet">
                  <span>💤</span>
                  <span>Futon Awan Syma</span>
                </div>
              </div>

              <!-- Hotspot Buttons in Bedroom -->
              <button type="button" class="residence-hotspot" style="top:110px; left:40px;" data-residence-action="open_wardrobe">
                <span class="hotspot-pulse-dot"></span>
                <span>👘 Lemari Wardrobe</span>
              </button>
              <button type="button" class="residence-hotspot" style="bottom:170px; left:45%;" data-residence-action="sleep_futon">
                <span class="hotspot-pulse-dot"></span>
                <span>🌙 Tidur di Futon</span>
              </button>

              <!-- Dynamic Placed Decor Slots -->
              <div id="room-slots-bedroom"></div>
            </div>
          </section>

          <!-- 5. ROOM: PERSONAL CORNER (The Little Archive) -->
          <section class="residence-room-container room-archive" data-room="archive">
            <div class="room-info-card">
              <div class="room-info-left">
                <span class="room-info-icon">📚</span>
                <div>
                  <h3 class="room-info-title">Sudut Arsip — The Little Archive</h3>
                  <p class="room-info-desc">Rak pajangan koleksi foto, lukisan Vision Studio, catatan jurnal Gazebo, dan akuarium ikan.</p>
                </div>
              </div>
              <div class="room-info-actions">
                <button type="button" class="btn-room-action primary" data-residence-action="open_archive_photos">
                  📷 Buka Arsip Lengkap
                </button>
                <button type="button" class="btn-room-action" id="btn-decor-toggle-archive" data-residence-action="toggle_decor">
                  🎨 Mode Dekorasi
                </button>
              </div>
            </div>

            <div class="room-scenery-canvas">
              <div class="scenery-archive-shelves">
                <!-- 1. Photography Showcase -->
                <div class="archive-category-showcase" data-residence-action="open_archive_photos">
                  <div>
                    <span class="archive-showcase-icon">📷</span>
                    <h4 class="archive-showcase-title">Photography</h4>
                    <span class="archive-showcase-count">The Moment Archive</span>
                  </div>
                  <div class="archive-showcase-preview">
                    <span style="font-size:1.8rem;">🖼️</span>
                  </div>
                </div>

                <!-- 2. Vision Studio Showcase -->
                <div class="archive-category-showcase" data-residence-action="open_archive_art">
                  <div>
                    <span class="archive-showcase-icon">🎨</span>
                    <h4 class="archive-showcase-title">Vision Studio</h4>
                    <span class="archive-showcase-count">The Creative Atelier</span>
                  </div>
                  <div class="archive-showcase-preview">
                    <span style="font-size:1.8rem;">🖌️</span>
                  </div>
                </div>

                <!-- 3. Gazebo Memory Journal -->
                <div class="archive-category-showcase" data-residence-action="open_archive_journal">
                  <div>
                    <span class="archive-showcase-icon">📖</span>
                    <h4 class="archive-showcase-title">Memory Journal</h4>
                    <span class="archive-showcase-count">Renungan Gazebo</span>
                  </div>
                  <div class="archive-showcase-preview">
                    <span style="font-size:1.8rem;">📜</span>
                  </div>
                </div>

                <!-- 4. Fishing Pond Catches -->
                <div class="archive-category-showcase" data-residence-action="open_archive_fish">
                  <div>
                    <span class="archive-showcase-icon">🐟</span>
                    <h4 class="archive-showcase-title">Whispering Pond</h4>
                    <span class="archive-showcase-count">Akuarium Koleksi Ikan</span>
                  </div>
                  <div class="archive-showcase-preview">
                    <span style="font-size:1.8rem;">🐠</span>
                  </div>
                </div>
              </div>

              <!-- Dynamic Placed Decor Slots -->
              <div id="room-slots-archive"></div>
            </div>
          </section>

          <!-- 6. ROOM: ENGAWA (The Wind's Embrace) -->
          <section class="residence-room-container room-engawa" data-room="engawa">
            <div class="room-info-card">
              <div class="room-info-left">
                <span class="room-info-icon">🍵</span>
                <div>
                  <h3 class="room-info-title">Beranda Kayu — The Wind's Embrace</h3>
                  <p class="room-info-desc">Teras kayu menghadap taman sakura dengan tirai tipis berayun ditiup semilir angin pegunungan.</p>
                </div>
              </div>
              <div class="room-info-actions">
                <button type="button" class="btn-room-action primary" data-residence-action="engawa_breeze">
                  🍃 Nikmati Angin Semilir
                </button>
                <button type="button" class="btn-room-action" id="btn-decor-toggle-engawa" data-residence-action="toggle_decor">
                  🎨 Mode Dekorasi
                </button>
              </div>
            </div>

            <div class="room-scenery-canvas">
              <div class="engawa-curtain-sheer"></div>
              <div class="scenery-engawa-deck">
                <div style="font-size:2.4rem; cursor:pointer;" data-residence-action="drink_tea" title="Meja Teh Beranda">
                  🍵
                </div>
                <div style="font-size:2.4rem; cursor:pointer;" data-residence-action="engawa_breeze" title="Bantal Zabuton">
                  🪑
                </div>
              </div>

              <!-- Hotspot Buttons in Engawa -->
              <button type="button" class="residence-hotspot" style="top:80px; right:80px;" data-residence-action="chime_menu">
                <span class="hotspot-pulse-dot"></span>
                <span>🎐 Lonceng Angin Beranda</span>
              </button>
              <button type="button" class="residence-hotspot" style="bottom:180px; left:50%; transform:translateX(-50%);" data-residence-action="engawa_breeze">
                <span class="hotspot-pulse-dot"></span>
                <span>🌸 Memandang Sakura Melayang</span>
              </button>

              <!-- Dynamic Placed Decor Slots -->
              <div id="room-slots-engawa"></div>
            </div>
          </section>

          <!-- 7. ROOM: SECRET ATTIC (Ruang Loteng Rahasia) -->
          <section class="residence-room-container room-attic" data-room="attic">
            <div class="room-info-card">
              <div class="room-info-left">
                <span class="room-info-icon">🗝️</span>
                <div>
                  <h3 class="room-info-title">Loteng Rahasia — Secret Attic</h3>
                  <p class="room-info-desc">Ruang rahasia di bawah atap kayu dengan jendela kaca bundar menghadap rasi bintang semesta.</p>
                </div>
              </div>
              <div class="room-info-actions">
                <button type="button" class="btn-room-action primary" data-residence-action="attic_skylight">
                  🌌 Pandangi Rasi Bintang
                </button>
                <button type="button" class="btn-room-action" id="btn-decor-toggle-attic" data-residence-action="toggle_decor">
                  🎨 Mode Dekorasi
                </button>
              </div>
            </div>

            <div class="room-scenery-canvas">
              <div class="scenery-attic-skylight" data-residence-action="attic_skylight" title="Jendela Langit Malam">
                <span class="attic-constellation-fx">✨</span>
              </div>

              <!-- Hotspot Buttons in Attic -->
              <button type="button" class="residence-hotspot" style="bottom:60px; left:80px;" data-residence-action="read_book">
                <span class="hotspot-pulse-dot"></span>
                <span>📜 Gulungan Rahasia Kitsune</span>
              </button>
              <button type="button" class="residence-hotspot" style="bottom:60px; right:80px;" data-residence-action="open_archive_photos">
                <span class="hotspot-pulse-dot"></span>
                <span>📦 Peti Kenangan Spesial</span>
              </button>

              <!-- Dynamic Placed Decor Slots -->
              <div id="room-slots-attic"></div>
            </div>
          </section>

          <!-- Syma Living Presence (Interactive Character in Residence) -->
          <div class="residence-syma-presence" id="residence-syma-presence" title="Syma (Klik untuk menyapa)">
            <div class="syma-speech-bubble">
              <span id="syma-speech-text">"Selamat datang di The Windwhisper Residence... rumah yang selalu menanti kepulanganmu."</span>
            </div>
            <div class="syma-avatar-portrait-wrap">
              <img src="/assets/avatar_abil_hd.jpg" alt="Syma" class="syma-avatar-img" id="syma-avatar-img" />
            </div>
            <span class="syma-presence-badge" id="syma-presence-badge">Syma 🦊</span>
          </div>

        </main>

        <!-- General Residence Modal Dialog -->
        <div class="residence-modal-backdrop" id="residence-modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="residence-modal-dialog">
            <div class="residence-modal-header">
              <h3 id="residence-modal-title">Aktivitas Kediaman</h3>
              <button type="button" class="btn-residence-modal-close" id="btn-residence-modal-close" aria-label="Tutup">✕</button>
            </div>
            <div class="residence-modal-body" id="residence-modal-body">
              <!-- Dynamically populated -->
            </div>
          </div>
        </div>

        <!-- Sleep & Wake Up Overlay -->
        <div class="residence-sleep-overlay" id="residence-sleep-overlay" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="sleep-moon-icon">🌙</div>
          <h2 class="sleep-greeting-title">Selamat Beristirahat, Syma...</h2>
          <p class="sleep-greeting-desc">"Angin malam berbisik pelan, mengusap lelah dan menyulam mimpi indah di semesta bintang."</p>
          <button type="button" class="btn-wake-up" id="btn-residence-wake-up">
            ☀️ Bangun Tidur & Mulai Hari Baru
          </button>
        </div>

      </section>`;

      html = html.substring(0, insertIdx) + residenceSectionHtml + html.substring(insertIdx);
      console.log('Inserted view-pinwheel-residence section');
    }
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated successfully!');
