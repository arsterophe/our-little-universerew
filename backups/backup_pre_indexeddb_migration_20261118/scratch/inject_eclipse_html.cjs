const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add link in head
if (!html.includes('/eclipse.css')) {
  const cssTarget = '<link rel="stylesheet" href="/bloom_cottage.css">';
  if (html.includes(cssTarget)) {
    html = html.replace(cssTarget, cssTarget + '\n  <link rel="stylesheet" href="/eclipse.css">');
    console.log('Added eclipse.css link to head.');
  } else {
    console.error('Target css link not found!');
  }
} else {
  console.log('eclipse.css already in head.');
}

// 2. Add btn-shadow-to-eclipse in shadow-hud-topright
if (!html.includes('id="btn-shadow-to-eclipse"')) {
  const storyBtnTarget = `<button type="button" class="univ-goto-btn shadow-story-pill" id="btn-shadow-story"
              aria-label="Buka Ruang Menulis Story">
              <span class="goto-icon">✍️</span>
              <span class="goto-text">Story (Karya)</span>
            </button>`;
  
  const eclipseBtnMarkup = `
            <button type="button" class="univ-goto-btn shadow-eclipse-pill" id="btn-shadow-to-eclipse"
              aria-label="Masuk ke Private Author Sanctuary THE ECLIPSE">
              <span class="goto-icon">👑</span>
              <span class="goto-text">THE ECLIPSE</span>
            </button>`;

  if (html.includes(storyBtnTarget)) {
    html = html.replace(storyBtnTarget, storyBtnTarget + '\n' + eclipseBtnMarkup);
    console.log('Added btn-shadow-to-eclipse to shadow-hud-topright.');
  } else {
    console.error('Target story button not found in shadow HUD!');
  }
} else {
  console.log('btn-shadow-to-eclipse already in html.');
}

// 3. Add view-eclipse section right after view-shadow-world
if (!html.includes('id="view-eclipse"')) {
  const shadowWorldIdx = html.indexOf('view-shadow-world');
  if (shadowWorldIdx !== -1) {
    const endShadowWorldIdx = html.indexOf('</section>', shadowWorldIdx);
    if (endShadowWorldIdx !== -1) {
      const insertionPoint = endShadowWorldIdx + '</section>'.length;

      const eclipseSectionHtml = `

      <!-- ============================================== -->
      <!-- VIEW: THE ECLIPSE — THE AUTHOR'S ETERNAL SANCTUARY -->
      <!-- PRIVATE ROYAL CELESTIAL SANCTUARY (LELE 🌙)    -->
      <!-- ============================================== -->
      <section class="view-section view-eclipse" id="view-eclipse"
        aria-label="THE ECLIPSE - The Author's Eternal Sanctuary" aria-hidden="true">

        <div class="eclipse-stage" id="eclipse-stage" tabindex="0" role="region" aria-label="Interactive Eclipse Sanctuary Stage">
          <!-- Background Artwork Layer -->
          <div class="eclipse-bg-layer" aria-hidden="true">
            <img src="/assets/eclipse_grand_hall.jpg" alt="The Eclipse Palace" class="eclipse-bg-img" id="eclipse-bg-img" fetchpriority="high">
          </div>

          <!-- Celestial Atmosphere & Particles -->
          <div class="eclipse-atmo-overlay" aria-hidden="true"></div>
          <div class="eclipse-particles-layer" aria-hidden="true">
            <span class="eclipse-star st1">✦</span>
            <span class="eclipse-star st2">✧</span>
            <span class="eclipse-star st3">★</span>
            <span class="eclipse-star st4">✦</span>
            <span class="eclipse-star st5">⋆</span>
          </div>

          <!-- Interactive Hotspots Layer -->
          <div class="eclipse-hotspots-layer" id="eclipse-hotspots-container"></div>

          <!-- 2D Player Avatar: Lele (The Author) -->
          <div class="eclipse-player-avatar" id="eclipse-player-avatar" style="left: 50%; top: 70%;">
            <div class="eclipse-avatar-body">
              <img src="/assets/chibi_lele_avatar.png" alt="Lele (The Author)" class="eclipse-avatar-img" width="72" height="94">
              <div class="eclipse-author-halo"></div>
            </div>
            <div class="eclipse-player-shadow"></div>
          </div>

          <!-- Proximity Interaction Prompt -->
          <div class="eclipse-interaction-prompt" id="eclipse-interaction-prompt" role="button" tabindex="0" aria-label="Interaksi">
            <span class="eclipse-prompt-key">✦ [E]</span>
            <span class="eclipse-prompt-label" id="eclipse-prompt-text">Berinteraksi</span>
          </div>

          <!-- Transition & Discovery Overlays -->
          <div class="eclipse-sleep-overlay" id="eclipse-sleep-overlay" aria-hidden="true"></div>
          <div class="eclipse-discovery-flash" id="eclipse-discovery-flash" aria-hidden="true"></div>

          <!-- TOP-LEFT HUD: Return & Title -->
          <div class="eclipse-hud-topleft">
            <button type="button" class="eclipse-back-orb" id="btn-eclipse-back" aria-label="Kembali ke SHADOW Sanctuary" title="Kembali ke SHADOW">
              <span>🌙</span>
            </button>
            <div class="eclipse-title-badge">
              <h2 id="eclipse-room-title">The Grand Hall</h2>
              <span id="eclipse-room-subtitle">Aula Utama Kristal Obsidian</span>
            </div>
          </div>

          <!-- TOP-RIGHT HUD: Room Navigation & Author Tools -->
          <div class="eclipse-hud-topright">
            <nav class="eclipse-nav-pills" id="eclipse-nav-pills" aria-label="Navigasi Ruangan The Eclipse">
              <button type="button" class="eclipse-room-btn" data-room-id="garden"><span>🌹</span> Garden</button>
              <button type="button" class="eclipse-room-btn active" data-room-id="grand_hall"><span>🏰</span> Grand Hall</button>
              <button type="button" class="eclipse-room-btn" data-room-id="library"><span>📚</span> Library</button>
              <button type="button" class="eclipse-room-btn" data-room-id="bedroom"><span>🛏️</span> Bedroom</button>
              <button type="button" class="eclipse-room-btn" data-room-id="observatory"><span>🔭</span> Observatory</button>
              <button type="button" class="eclipse-room-btn" data-room-id="gallery"><span>🖼️</span> Gallery</button>
              <button type="button" class="eclipse-room-btn" data-room-id="secret_chamber"><span>🔮</span> Secret Chamber</button>
            </nav>
            <div class="eclipse-hud-quick-tools">
              <button type="button" class="eclipse-tool-btn" id="btn-eclipse-tool-desk" title="The Author's Desk" aria-label="The Author's Desk">
                <span>✒️</span>
              </button>
              <button type="button" class="eclipse-tool-btn" id="btn-eclipse-tool-journal" title="Jurnal Malam Author" aria-label="Jurnal Author">
                <span>📜</span>
              </button>
              <button type="button" class="eclipse-tool-btn" id="btn-eclipse-tool-obs" title="Observatorium &amp; Starmap" aria-label="Observatory">
                <span>🔭</span>
              </button>
            </div>
          </div>

          <!-- Control Hints (Desktop Keyboard) -->
          <div class="eclipse-hud-controls-hint" aria-hidden="true">
            <span>Gerak:</span>
            <span class="eclipse-kbd-pill">W</span>
            <span class="eclipse-kbd-pill">A</span>
            <span class="eclipse-kbd-pill">S</span>
            <span class="eclipse-kbd-pill">D</span>
            <span style="margin-left: 6px;">Interaksi:</span>
            <span class="eclipse-kbd-pill">E</span>
          </div>

          <!-- Mobile Virtual Touch Controls -->
          <div class="eclipse-touch-controls" id="eclipse-touch-controls">
            <div class="eclipse-dpad-grid" id="eclipse-dpad">
              <button type="button" class="eclipse-dpad-btn dpad-up" id="eclipse-dpad-up" aria-label="Atas">▲</button>
              <button type="button" class="eclipse-dpad-btn dpad-left" id="eclipse-dpad-left" aria-label="Kiri">◀</button>
              <div class="eclipse-dpad-btn dpad-center">✦</div>
              <button type="button" class="eclipse-dpad-btn dpad-right" id="eclipse-dpad-right" aria-label="Kanan">▶</button>
              <button type="button" class="eclipse-dpad-btn dpad-down" id="eclipse-dpad-down" aria-label="Bawah">▼</button>
            </div>
            <button type="button" class="eclipse-touch-action-btn" id="eclipse-touch-action" aria-label="Aksi Interaksi">
              <span>✦</span>
              <span>AKSI</span>
            </button>
          </div>

          <!-- Modal Backdrop & Card Dialog -->
          <div class="eclipse-modal-backdrop" id="eclipse-modal-backdrop" aria-hidden="true" style="display: none;">
            <div class="eclipse-modal-card" role="dialog" aria-modal="true" aria-labelledby="eclipse-modal-title">
              <header class="eclipse-modal-header">
                <h3 id="eclipse-modal-title">Judul Dialog</h3>
                <button type="button" class="eclipse-modal-close-btn" id="btn-eclipse-modal-close" aria-label="Tutup Dialog">✕</button>
              </header>
              <div class="eclipse-modal-body" id="eclipse-modal-body"></div>
            </div>
          </div>
        </div>

      </section>`;

      html = html.substring(0, insertionPoint) + eclipseSectionHtml + html.substring(insertionPoint);
      console.log('Inserted view-eclipse section right after view-shadow-world.');
    } else {
      console.error('End of view-shadow-world not found!');
    }
  } else {
    console.error('view-shadow-world not found in index.html!');
  }
} else {
  console.log('view-eclipse already in html.');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html updated successfully.');
