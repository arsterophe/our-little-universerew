const fs = require('fs');

const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add <link rel="stylesheet" href="/silent_lotus.css"> after usagain.css
if (!html.includes('/silent_lotus.css')) {
  const targetCss = '<link rel="stylesheet" href="/usagain.css">';
  if (html.includes(targetCss)) {
    html = html.replace(targetCss, targetCss + '\n  <link rel="stylesheet" href="/silent_lotus.css">');
    console.log('Added silent_lotus.css link');
  } else {
    console.error('Target CSS link not found!');
  }
}

// 2. Add #btn-usagain-enter-lotus-house in usagain-residence-modal
const targetModalBody = `<div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Kediaman pribadi bernuansa kuil Jepang di atas bukit suci dengan pemandangan danau teratai dan cahaya rembulan ungu.</p>`;

const replacementModalBody = `<div class="usagain-modal-body">
              <p style="margin-bottom:1rem; color:#fbcfe8;">Kediaman pribadi bernuansa kuil Jepang di atas bukit suci dengan pemandangan danau teratai dan cahaya rembulan ungu.</p>
              <button type="button" class="usagain-primary-btn" id="btn-usagain-enter-lotus-house" style="width: 100%; margin-bottom: 1.25rem; background: linear-gradient(135deg, #a855f7, #ec4899); border: none; padding: 0.85rem 1.25rem; border-radius: 9999px; color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 15px rgba(168,85,247,0.35);">
                🌸 Masuk ke THE SILENT LOTUS HOUSE (Simulasi 2D)
              </button>`;

if (html.includes(targetModalBody) && !html.includes('id="btn-usagain-enter-lotus-house"')) {
  html = html.replace(targetModalBody, replacementModalBody);
  console.log('Added btn-usagain-enter-lotus-house button');
}

// 3. Add view-silent-lotus section right after view-usagain-world </section>
const silentLotusSection = `

      <!-- ======================================================== -->
      <!-- VIEW: THE SILENT LOTUS HOUSE — ELA (US AGAIN 🌸)          -->
      <!-- 2D INTERACTIVE SIMULATION GAME                            -->
      <!-- ======================================================== -->
      <section class="view-section view-silent-lotus" id="view-silent-lotus"
        aria-label="THE SILENT LOTUS HOUSE — Ela's Sanctuary of Stillness (Universe US AGAIN 🌸)" aria-hidden="true">

        <div class="silent-lotus-viewport">
          <!-- 2D Exploration Stage (16:9 Responsive) -->
          <div class="silent-lotus-stage" id="silent-lotus-stage" tabindex="0" role="region" aria-label="The Silent Lotus House Stage">

            <!-- Background Artwork Layer -->
            <img class="silent-lotus-bg-img" id="silent-lotus-bg-img" src="/assets/silent_lotus_living.jpg" alt="Lotus Living Room — THE SILENT LOTUS HOUSE">

            <!-- Atmosphere Dynamic Lighting Overlay -->
            <div class="silent-lotus-atmo-overlay" id="silent-lotus-atmo-overlay"></div>

            <!-- Drifting Petals & Butterflies Overlay -->
            <div class="silent-lotus-fx-overlay" id="silent-lotus-fx-overlay"></div>

            <!-- Top Left Room Info & Back to World Button -->
            <div class="silent-lotus-header-left">
              <button type="button" class="btn-silent-lotus-back" id="btn-silent-lotus-back" aria-label="Kembali ke US AGAIN World">
                ←
              </button>
              <div class="silent-lotus-title-badge">
                <h3 class="silent-lotus-room-title" id="silent-lotus-room-title">Lotus Living Room</h3>
                <p class="silent-lotus-room-subtitle" id="silent-lotus-room-subtitle">RUANG KELUARGA UTAMA, SOFA LAVENDER & PIANO BUNGA PUTIH</p>
              </div>
            </div>

            <!-- Top Center Navigation Pills (5 Rooms) -->
            <nav class="silent-lotus-nav-bar" id="silent-lotus-nav-pills" aria-label="Navigasi Ruangan">
              <button type="button" class="lotus-nav-btn active" data-room-id="living">
                <span>🪷</span> Living
              </button>
              <button type="button" class="lotus-nav-btn" data-room-id="bedroom">
                <span>🛏️</span> Bedroom
              </button>
              <button type="button" class="lotus-nav-btn" data-room-id="kitchen">
                <span>🍳</span> Kitchen
              </button>
              <button type="button" class="lotus-nav-btn" data-room-id="conservatory">
                <span>🌿</span> Conservatory
              </button>
              <button type="button" class="lotus-nav-btn" data-room-id="attic">
                <span>📜</span> Attic
              </button>
            </nav>

            <!-- Top Right HUD Tools -->
            <div class="silent-lotus-header-right">
              <button type="button" class="silent-lotus-tool-btn" id="btn-silent-lotus-tool-atmo" aria-label="Pilih Atmosfer Cahaya" title="Pencahayaan & Atmosfer">☀️</button>
              <button type="button" class="silent-lotus-tool-btn" id="btn-silent-lotus-tool-tasks" aria-label="Agenda Keseharian" title="Agenda Keseharian">📋</button>
              <button type="button" class="silent-lotus-tool-btn" id="btn-silent-lotus-tool-bag" aria-label="Tas Penyimpanan" title="Tas Penyimpanan">🎒</button>
            </div>

            <!-- Hotspots Layer -->
            <div class="silent-lotus-hotspots" id="silent-lotus-hotspots-container"></div>

            <!-- 2D Player Avatar (Ela 🌸) -->
            <div class="silent-lotus-player" id="silent-lotus-player-avatar" style="left: 50%; top: 72%;">
              <div class="silent-lotus-player-inner">
                <img src="/assets/avatar_ela_hd.jpg" alt="Avatar Ela" class="silent-lotus-avatar-img">
                <div class="silent-lotus-avatar-badge" aria-hidden="true">🌸</div>
                <!-- Proximity Prompt Bubble -->
                <div class="silent-lotus-prompt" id="silent-lotus-interaction-prompt">
                  <span id="silent-lotus-prompt-text">✦ [E] Interaksi</span>
                </div>
              </div>
            </div>

            <!-- Interactive Modal Dialog -->
            <div class="silent-lotus-modal-backdrop" id="silent-lotus-modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
              <div class="silent-lotus-modal-card">
                <div class="silent-lotus-modal-header">
                  <h3 class="silent-lotus-modal-title" id="silent-lotus-modal-title">Santuari Ela</h3>
                  <button type="button" class="btn-silent-lotus-modal-close" id="btn-silent-lotus-modal-close" aria-label="Tutup Dialog">✕</button>
                </div>
                <div class="silent-lotus-modal-body" id="silent-lotus-modal-body"></div>
              </div>
            </div>

            <!-- Sleep / Transition Overlay -->
            <div class="silent-lotus-sleep-overlay" id="silent-lotus-sleep-overlay"></div>

            <!-- Touch D-Pad Controls (Mobile) -->
            <div class="silent-lotus-touch-controls">
              <div class="silent-lotus-dpad">
                <button type="button" class="silent-lotus-dpad-btn silent-lotus-dpad-up" id="silent-dpad-up" aria-label="Atas">▲</button>
                <button type="button" class="silent-lotus-dpad-btn silent-lotus-dpad-down" id="silent-dpad-down" aria-label="Bawah">▼</button>
                <button type="button" class="silent-lotus-dpad-btn silent-lotus-dpad-left" id="silent-dpad-left" aria-label="Kiri">◀</button>
                <button type="button" class="silent-lotus-dpad-btn silent-lotus-dpad-right" id="silent-dpad-right" aria-label="Kanan">▶</button>
              </div>
            </div>
            <div class="silent-lotus-touch-action">
              <button type="button" class="silent-lotus-action-btn" id="silent-touch-action" aria-label="Tombol Aksi">✦</button>
            </div>

          </div>
        </div>
      </section>`;

const targetSectionEnd = `              </div>
            </div>
          </div>
        </div>

      </section>

      <!-- ======================================================== -->
      <!-- VIEW: ROYAN'S UNIVERSE — HOT`;

if (!html.includes('id="view-silent-lotus"')) {
  if (html.includes(targetSectionEnd)) {
    const replacementSection = `              </div>
            </div>
          </div>
        </div>

      </section>` + silentLotusSection + `

      <!-- ======================================================== -->
      <!-- VIEW: ROYAN'S UNIVERSE — HOT`;
    html = html.replace(targetSectionEnd, replacementSection);
    console.log('Added view-silent-lotus section');
  } else {
    console.error('Target section end not found!');
  }
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully updated index.html! New length:', html.length);
