const fs = require('fs');

const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add <link rel="stylesheet" href="/dragon_den.css"> after ash.css
if (!html.includes('/dragon_den.css')) {
  const targetCss = '<link rel="stylesheet" href="/ash.css">';
  if (html.includes(targetCss)) {
    html = html.replace(targetCss, targetCss + '\n  <link rel="stylesheet" href="/dragon_den.css">');
    console.log('Added dragon_den.css link');
  } else {
    console.error('Target CSS link not found!');
  }
}

// 2. Add #btn-ash-enter-dragon-den in ash-castle-modal
const targetCastleDesc = `<p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Kastil gotik megah yang bertengger di atas pulau melayang. Ruang pribadi Ruben dengan pilar kristal violet, perpustakaan, dan perapian hangat.
            </p>`;

const replacementCastleDesc = `<p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Kastil gotik megah yang bertengger di atas pulau melayang. Ruang pribadi Ruben dengan pilar kristal violet, perpustakaan, dan perapian hangat.
            </p>
            <button type="button" class="ash-primary-btn" id="btn-ash-enter-dragon-den" style="width: 100%; margin-bottom: 1.25rem; background: linear-gradient(135deg, #7c3aed, #475569); border: none; padding: 0.85rem 1.25rem; border-radius: 9999px; color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; box-shadow: 0 4px 15px rgba(124,58,237,0.35);">
              🐉 Masuk ke THE DRAGON'S DEN (Simulasi 2D)
            </button>`;

if (html.includes(targetCastleDesc) && !html.includes('id="btn-ash-enter-dragon-den"')) {
  html = html.replace(targetCastleDesc, replacementCastleDesc);
  console.log('Added btn-ash-enter-dragon-den button');
}

// 3. Add view-dragon-den section right after view-ash-world </section>
const dragonDenSection = `

      <!-- ======================================================== -->
      <!-- VIEW: THE DRAGON'S DEN — RUBEN (ASH 🐉)                   -->
      <!-- 2D INTERACTIVE SIMULATION GAME                            -->
      <!-- ======================================================== -->
      <section class="view-section view-dragon-den" id="view-dragon-den"
        aria-label="THE DRAGON'S DEN — Ruben's Castle Sanctuary (Universe ASH 🐉)" aria-hidden="true">

        <div class="dragon-den-viewport">
          <!-- 2D Exploration Stage (16:9 Responsive) -->
          <div class="dragon-den-stage" id="dragon-den-stage" tabindex="0" role="region" aria-label="The Dragon's Den Stage">

            <!-- Background Artwork Layer -->
            <img class="dragon-den-bg-img" id="dragon-den-bg-img" src="/assets/dragon_den_hall.jpg" alt="The Dragon's Grand Hall — THE DRAGON'S DEN">

            <!-- Atmosphere Dynamic Lighting Overlay -->
            <div class="dragon-den-atmo-overlay" id="dragon-den-atmo-overlay"></div>

            <!-- Drifting Embers & Fog Overlay -->
            <div class="dragon-den-fx-overlay" id="dragon-den-fx-overlay"></div>

            <!-- Top Left Room Info & Back to World Button -->
            <div class="dragon-den-header-left">
              <button type="button" class="btn-dragon-den-back" id="btn-dragon-den-back" aria-label="Kembali ke ASH World">
                ←
              </button>
              <div class="dragon-den-title-badge">
                <h3 class="dragon-den-room-title" id="dragon-den-room-title">The Dragon's Grand Hall</h3>
                <p class="dragon-den-room-subtitle" id="dragon-den-room-subtitle">AULA MEGAH KASTIL GOTIK, PERAPIAN API UNGU & PIANO KRISTAL HITAM</p>
              </div>
            </div>

            <!-- Top Center Navigation Pills (5 Rooms) -->
            <nav class="dragon-den-nav-bar" id="dragon-den-nav-pills" aria-label="Navigasi Ruangan">
              <button type="button" class="dragon-nav-btn active" data-room-id="hall">
                <span>🏰</span> Grand Hall
              </button>
              <button type="button" class="dragon-nav-btn" data-room-id="bedroom">
                <span>🛏️</span> Bedroom
              </button>
              <button type="button" class="dragon-nav-btn" data-room-id="kitchen">
                <span>🍳</span> Kitchen
              </button>
              <button type="button" class="dragon-nav-btn" data-room-id="conservatory">
                <span>🌿</span> Conservatory
              </button>
              <button type="button" class="dragon-nav-btn" data-room-id="memory">
                <span>📜</span> Memory Chamber
              </button>
            </nav>

            <!-- Top Right HUD Tools -->
            <div class="dragon-den-header-right">
              <button type="button" class="dragon-den-tool-btn" id="btn-dragon-den-tool-atmo" aria-label="Pilih Atmosfer Cahaya" title="Pencahayaan & Atmosfer">☀️</button>
              <button type="button" class="dragon-den-tool-btn" id="btn-dragon-den-tool-tasks" aria-label="Agenda Harian" title="Agenda Harian">📋</button>
              <button type="button" class="dragon-den-tool-btn" id="btn-dragon-den-tool-bag" aria-label="Tas Perlengkapan" title="Tas Perlengkapan">🎒</button>
            </div>

            <!-- Hotspots Layer -->
            <div class="dragon-den-hotspots" id="dragon-den-hotspots-container"></div>

            <!-- 2D Player Avatar (Ruben 🐉) -->
            <div class="dragon-den-player" id="dragon-den-player-avatar" style="left: 50%; top: 72%;">
              <div class="dragon-den-player-inner">
                <img src="/assets/avatar_ruben_hd.jpg" alt="Avatar Ruben" class="dragon-den-avatar-img">
                <div class="dragon-den-avatar-badge" aria-hidden="true">🐉</div>
                <!-- Proximity Prompt Bubble -->
                <div class="dragon-den-prompt" id="dragon-den-interaction-prompt">
                  <span id="dragon-den-prompt-text">✦ [E] Interaksi</span>
                </div>
              </div>
            </div>

            <!-- Interactive Modal Dialog -->
            <div class="dragon-den-modal-backdrop" id="dragon-den-modal-backdrop" role="dialog" aria-modal="true" aria-hidden="true">
              <div class="dragon-den-modal-card">
                <div class="dragon-den-modal-header">
                  <h3 class="dragon-den-modal-title" id="dragon-den-modal-title">Benteng Ruben</h3>
                  <button type="button" class="btn-dragon-den-modal-close" id="btn-dragon-den-modal-close" aria-label="Tutup Dialog">✕</button>
                </div>
                <div class="dragon-den-modal-body" id="dragon-den-modal-body"></div>
              </div>
            </div>

            <!-- Sleep / Transition Overlay -->
            <div class="dragon-den-sleep-overlay" id="dragon-den-sleep-overlay"></div>

            <!-- Touch D-Pad Controls (Mobile) -->
            <div class="dragon-den-touch-controls">
              <div class="dragon-den-dpad">
                <button type="button" class="dragon-den-dpad-btn dragon-den-dpad-up" id="dragon-dpad-up" aria-label="Atas">▲</button>
                <button type="button" class="dragon-den-dpad-btn dragon-den-dpad-down" id="dragon-dpad-down" aria-label="Bawah">▼</button>
                <button type="button" class="dragon-den-dpad-btn dragon-den-dpad-left" id="dragon-dpad-left" aria-label="Kiri">◀</button>
                <button type="button" class="dragon-den-dpad-btn dragon-den-dpad-right" id="dragon-dpad-right" aria-label="Kanan">▶</button>
              </div>
            </div>
            <div class="dragon-den-touch-action">
              <button type="button" class="dragon-den-action-btn" id="dragon-touch-action" aria-label="Tombol Aksi">✦</button>
            </div>

          </div>
        </div>
      </section>`;

const targetSectionEnd = `              </div>
            </div>
          </div>
        </div>

      </section>

      <!-- ============================================== -->
      <!-- VIEW: US AGAIN — THE SILENT LOTUS (ELA)`;

if (!html.includes('id="view-dragon-den"')) {
  if (html.includes(targetSectionEnd)) {
    const replacementSection = `              </div>
            </div>
          </div>
        </div>

      </section>` + dragonDenSection + `

      <!-- ============================================== -->
      <!-- VIEW: US AGAIN — THE SILENT LOTUS (ELA)`;
    html = html.replace(targetSectionEnd, replacementSection);
    console.log('Added view-dragon-den section');
  } else {
    console.error('Target section end not found!');
  }
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully updated index.html! New length:', html.length);
