import fs from 'fs';

const distHtml = fs.readFileSync('dist/index.html', 'utf8').replace(/\r\n/g, '\n');

// 1. Extract body content from distHtml
const bodyStartTag = '<body>';
const bodyEndTag = '</body>';
const bodyStartIndex = distHtml.indexOf(bodyStartTag) + bodyStartTag.length;
const bodyEndIndex = distHtml.indexOf(bodyEndTag);
let bodyContent = distHtml.slice(bodyStartIndex, bodyEndIndex).trim();

// 2. Define Dev Head Stylesheets
const devHead = `<!DOCTYPE html>
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
  <link rel="stylesheet" href="/kidult_house.css">
  <link rel="stylesheet" href="/greenhouse.css">
  <link rel="stylesheet" href="/kidult_gazebo.css">
  <link rel="stylesheet" href="/songs_we_share.css">
  <link rel="stylesheet" href="/bloom_cottage.css">
  <link rel="stylesheet" href="/eclipse.css">
  <link rel="stylesheet" href="/pinwheel.css">
  <link rel="stylesheet" href="/pinwheel_gazebo.css">
  <link rel="stylesheet" href="/pinwheel_residence.css">
  <link rel="stylesheet" href="/pinwheel_studio.css">
  <link rel="stylesheet" href="/pinwheel_haven.css">
  <link rel="stylesheet" href="/moonpetal_manor.css">
  <link rel="stylesheet" href="/yawn.css">
  <link rel="stylesheet" href="/azure_palace.css">
  <link rel="stylesheet" href="/ash.css">
  <link rel="stylesheet" href="/dragon_den.css">
  <link rel="stylesheet" href="/usagain.css">
  <link rel="stylesheet" href="/silent_lotus.css">
  <link rel="stylesheet" href="/hot.css">
  <link rel="stylesheet" href="/kidult_behind.css">
  <link rel="stylesheet" href="/toyou_behind.css">
  <link rel="stylesheet" href="/shadow_behind.css">
  <link rel="stylesheet" href="/fairy_atelier.css">
  <link rel="stylesheet" href="/toyou_gazebo.css">
  <link rel="stylesheet" href="/yawn_gazebo.css">
</head>

<body>
`;

// 3. Define Markup for #view-yawn-gazebo
const yawnGazeboMarkup = `
      <!-- ============================================== -->
      <!-- VIEW: YAWN GAZEBO — AKHIRA ⚡ (UNIVERSE YAWN) -->
      <!-- ============================================== -->
      <section class="view-section view-yawn-gazebo" id="view-yawn-gazebo"
        aria-label="Gazebo Akhira — YAWN Astral Ocean & Moonlit Serenity Gazebo" aria-hidden="true">

        <!-- Background Artwork & Dynamic Lighting Layer -->
        <div class="ygazebo-scene-layer"></div>
        <div class="ygazebo-lighting-overlay light-cyan" id="ygazebo-lighting-overlay" aria-hidden="true"></div>

        <!-- Drifting Astral Bubbles & Bioluminescent Sparkles -->
        <div class="ygazebo-bubbles-layer" aria-hidden="true">
          <div class="yg-bubble" style="left: 12%; animation-delay: 0s;">🫧</div>
          <div class="yg-bubble" style="left: 28%; animation-delay: 2.5s; font-size: 0.9rem;">⚡</div>
          <div class="yg-bubble" style="left: 45%; animation-delay: 4.8s;">✨</div>
          <div class="yg-bubble" style="left: 64%; animation-delay: 1.8s; font-size: 1.2rem;">🐋</div>
          <div class="yg-bubble" style="left: 80%; animation-delay: 3.5s;">🪼</div>
          <div class="yg-bubble" style="left: 92%; animation-delay: 5.7s;">🫧</div>
        </div>

        <!-- 1. TOP BAR HUD -->
        <header class="ygazebo-top-bar">
          <div class="ygazebo-brand-group">
            <button type="button" class="btn-ygazebo-back" id="btn-ygazebo-back"
              aria-label="Kembali ke Universe YAWN">
              <span>←</span>
              <span>Kembali</span>
            </button>
            <div class="ygazebo-title-group">
              <span class="ygazebo-lightning-icon" aria-hidden="true">⚡</span>
              <div class="ygazebo-title-texts">
                <h1>YAWN</h1>
                <p>Akhira's Universe — Astral Ocean Gazebo</p>
              </div>
            </div>
            <p class="ygazebo-top-quote" id="ygazebo-top-quote">
              "Di kedalaman samudra yang tenang, biarkan pikiran beristirahat dan mimpi melayang bebas bersama paus astral." — Akhira ⚡
            </p>
          </div>

          <!-- Ambient Music Player Pill -->
          <div class="ygazebo-music-pill">
            <div class="ygazebo-music-title-wrap">
              <span class="ygazebo-music-icon" id="ygazebo-music-icon">🎵</span>
              <span id="ygazebo-track-title">Astral Ocean Lullaby</span>
            </div>
            <button type="button" class="btn-ygazebo-music-toggle" id="btn-ygazebo-music-toggle" aria-label="Putar / Jeda Musik">
              ▶
            </button>
            <div class="ygazebo-music-vol-group">
              <button type="button" class="btn-ygazebo-music-mute" id="btn-ygazebo-music-mute" aria-label="Mute / Unmute Musik">
                🔊
              </button>
              <input type="range" class="ygazebo-vol-slider" id="slider-ygazebo-music-vol" min="0" max="100" value="70"
                aria-label="Volume Musik">
            </div>
          </div>
        </header>

        <!-- 2. FOUR CENTRAL ACTIVITY CARDS -->
        <main class="ygazebo-center-stage">
          <div class="ygazebo-cards-grid">
            <!-- Card 1: Tea Time -->
            <div class="ygazebo-card" id="ygazebo-card-tea" role="button" tabindex="0" aria-label="Buka Tea Time">
              <div class="card-icon-halo">🫖</div>
              <h3>Tea Time</h3>
              <p>Nikmati seduhan teh mutiara laut dalam &amp; camilan manis bioluminesen ♡</p>
            </div>

            <!-- Card 2: Astral Cinema -->
            <div class="ygazebo-card" id="ygazebo-card-cinema" role="button" tabindex="0" aria-label="Buka Astral Cinema &amp; Koleksi Cerita">
              <div class="card-icon-halo">🎬</div>
              <h3>Astral Cinema</h3>
              <p>Layar proyeksi samudra, lagu paus, dan dongeng semesta ♡</p>
            </div>

            <!-- Card 3: Jurnal Kenangan -->
            <div class="ygazebo-card" id="ygazebo-card-journal" role="button" tabindex="0" aria-label="Buka Jurnal Kenangan">
              <div class="card-icon-halo">📜</div>
              <h3>Jurnal Kenangan</h3>
              <p>Tulis renungan hati &amp; impian indah di bawah naungan wisteria laut ♡</p>
            </div>

            <!-- Card 4: Quiet Moment -->
            <div class="ygazebo-card" id="ygazebo-card-quiet" role="button" tabindex="0" aria-label="Buka Quiet Moment">
              <div class="card-icon-halo">🔮</div>
              <h3>Quiet Moment</h3>
              <p>Resapi kedamaian samudra dalam &amp; gema dengungan paus astral ♡</p>
            </div>
          </div>
        </main>

        <!-- Hotspot Interactions on Stage -->
        <div class="yg-hotspot-cat" id="hotspot-yg-cat" role="button" tabindex="0" title="Elus Kucing Putih &amp; Boneka Paus di Sofa 🐾" aria-label="Elus Kucing Putih"></div>
        <div class="yg-hotspot-gamepad" id="hotspot-yg-gamepad" role="button" tabindex="0" title="Sentuh Controller Game &amp; Headset 🎮" aria-label="Main Game"></div>
        <div class="yg-hotspot-table" id="hotspot-yg-table" role="button" tabindex="0" title="Cicipi Popcorn &amp; Cupcake Mutiara 🍿" aria-label="Camilan Manis"></div>
        <div class="yg-hotspot-lanterns" id="hotspot-yg-lanterns" role="button" tabindex="0" title="Ganti Suasana Lentera &amp; Ubur-Ubur 🕯️" aria-label="Ganti Lentera"></div>
        <div class="yg-hotspot-screen" id="hotspot-yg-screen" role="button" tabindex="0" title="Nyalakan Layar Bioskop Samudra 🎬" aria-label="Layar Bioskop"></div>

        <!-- 3. BOTTOM ACTION DOCK (POJOK KIRI BAWAH) -->
        <footer class="ygazebo-bottom-bar">
          <div class="ygazebo-quick-actions" id="ygazebo-quick-actions">
            <!-- 🫖 Quick Action: Tea Time -->
            <button type="button" class="btn-ygazebo-circle-action" id="btn-ygazebo-quick-tea"
              data-tooltip="Tea Time — Seduh Teh Mutiara &amp; Camilan"
              title="Tea Time — Seduh Teh Mutiara &amp; Camilan"
              aria-label="Buka Tea Time">
              <span class="circle-action-icon">🫖</span>
            </button>

            <!-- 🎬 Quick Action: Cinema & Music -->
            <button type="button" class="btn-ygazebo-circle-action" id="btn-ygazebo-quick-cinema"
              data-tooltip="Astral Cinema — Bioskop &amp; Musik Samudra"
              title="Astral Cinema — Bioskop &amp; Musik Samudra"
              aria-label="Buka Astral Cinema">
              <span class="circle-action-icon">🎬</span>
            </button>

            <!-- 🎵 Quick Action: Songs We Share -->
            <button type="button" class="btn-ygazebo-circle-action" id="btn-ygazebo-songs-we-share"
              data-tooltip="Songs We Share — Rekomendasi Lagu Bersama"
              title="Songs We Share — Rekomendasi Lagu Bersama"
              aria-label="Buka Songs We Share">
              <span class="circle-action-icon">🎵</span>
            </button>
          </div>
        </footer>

        <!-- 4. GAZEBO MODAL DIALOG CONTAINER -->
        <div class="ygazebo-modal-backdrop" id="ygazebo-modal-backdrop" role="dialog" aria-modal="true"
          aria-hidden="true">
          <div class="ygazebo-modal-dialog">
            <div class="ygazebo-modal-header">
              <div class="ygazebo-modal-header-meta">
                <span class="ygazebo-modal-header-icon" id="ygazebo-modal-header-icon">🫖</span>
                <div>
                  <h2 id="ygazebo-modal-header-title">Aktivitas Gazebo</h2>
                  <p id="ygazebo-modal-header-sub">Suasana tenang samudra dalam</p>
                </div>
              </div>
              <button type="button" class="btn-ygazebo-modal-close" id="btn-ygazebo-modal-close"
                aria-label="Tutup Dialog">✕</button>
            </div>

            <div class="ygazebo-modal-body" id="ygazebo-modal-body">
              <!-- Dynamically rendered by yawn_gazebo_view.js -->
            </div>
          </div>
        </div>

      </section>
`;

// 4. Insert #view-yawn-gazebo right before <!-- VIEW: THE AZURE TIDE PALACE
const targetMarker = '<!-- VIEW: THE AZURE TIDE PALACE';
if (bodyContent.includes(targetMarker)) {
  bodyContent = bodyContent.replace(targetMarker, `${yawnGazeboMarkup}\n\n      ${targetMarker}`);
  console.log('✓ Successfully inserted #view-yawn-gazebo before Azure Palace');
} else {
  console.error('Target marker not found in bodyContent!');
}

const finalHtml = devHead + bodyContent + '\n\n  <script type="module" src="/main.js"></script>\n</body>\n\n</html>\n';
fs.writeFileSync('index.html', finalHtml, 'utf8');
console.log('index.html reconstructed cleanly, total lines:', finalHtml.split('\n').length);
