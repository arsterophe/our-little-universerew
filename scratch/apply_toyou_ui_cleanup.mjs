import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add #btn-toyou-star-messages to .toyou-hud-topleft under #toyou-char-card
const charCardTarget = `              <div class="toyou-char-info">
                <h2 class="toyou-char-name"><span class="toyou-sun-symbol">☼</span> Lala</h2>
                <p class="toyou-char-role">The Everglow Fairy</p>
                <p class="toyou-char-quote">Small joy, make a big universe.</p>
              </div>
            </div>`;

const charCardWithPill = `              <div class="toyou-char-info">
                <h2 class="toyou-char-name"><span class="toyou-sun-symbol">☼</span> Lala</h2>
                <p class="toyou-char-role">The Everglow Fairy</p>
                <p class="toyou-char-quote">Small joy, make a big universe.</p>
              </div>
            </div>

            <!-- Quick Star Messages Pill Button (Matching Nyanya Layout) -->
            <button type="button" class="toyou-quick-item toyou-quick-pill toyou-star-messages-pill" id="btn-toyou-star-messages"
              data-toyou-nav="teleskop" aria-label="Buka Star Messages (Teleskop)">
              <span class="quick-pill-icon">🔭</span>
              <span class="quick-pill-text">Star Messages (Teleskop)</span>
            </button>`;

if (html.includes(charCardTarget)) {
  html = html.replace(charCardTarget, charCardWithPill);
  console.log('✅ Added #btn-toyou-star-messages in toyou-hud-topleft');
} else {
  console.error('charCardTarget not found in index.html');
  process.exit(1);
}

// 2. Remove .toyou-quick-menu from .toyou-hud-topright
const oldTopRight = `          <!-- TOP-RIGHT HUD: Return Button, Greeting Pill & Quick Location Directory ("Mau ke mana dulu, Lala?") -->
          <div class="toyou-hud-topright">
            <button type="button" class="univ-goto-btn toyou-return-pill" id="btn-toyou-top-return"
              aria-label="Kembali ke tiga universe">
              <span class="goto-icon">🌌</span>
              <span class="goto-text">Pergi ke Universe</span>
            </button>
            <button type="button" class="univ-goto-btn toyou-story-pill" id="btn-toyou-story"
              aria-label="Buka Ruang Menulis Story">
              <span class="goto-icon">✍️</span>
              <span class="goto-text">Story (Karya)</span>
            </button>
            <div class="toyou-user-pill" id="toyou-user-pill">
              <img src="/assets/avatar_lala_hd.png" alt="Lala" class="toyou-user-avatar" id="toyou-user-avatar"
                loading="lazy" decoding="async">
              <span class="toyou-user-greeting" id="toyou-user-greeting">Hello, Lala</span>
              <span class="toyou-user-sparkle">✦</span>
            </div>

            <!-- Quick Directory Menu Matching Reference ("Mau ke mana dulu, Lala?") -->
            <nav class="toyou-quick-menu" aria-label="Daftar Lokasi Dunia TO YOU">
              <p class="toyou-quick-title">Mau ke mana dulu,<br>Lala?</p>
              <button type="button" class="toyou-quick-item" data-toyou-nav="rumah">
                <span class="q-icon">🌸</span>
                <span>Bloom Cottage</span>
              </button>
              <button type="button" class="toyou-quick-item" data-toyou-nav="atelier">
                <span class="q-icon">👗</span>
                <span>Atelier (Galeri Busana)</span>
              </button>
              <button type="button" class="toyou-quick-item" data-toyou-nav="ladang_kupu">
                <span class="q-icon">🦋</span>
                <span>Taman Kupu-kupu</span>
              </button>
              <button type="button" class="toyou-quick-item" data-toyou-nav="teleskop">
                <span class="q-icon">🔭</span>
                <span>Teleskop</span>
              </button>
              <button type="button" class="toyou-quick-item" data-toyou-nav="gazebo">
                <span class="q-icon">🏛</span>
                <span>Gazebo</span>
              </button>
              <button type="button" class="toyou-quick-item" data-toyou-nav="kotak_pos">
                <span class="q-icon">✉</span>
                <span>Kotak Pos</span>
              </button>
            </nav>
          </div>`;

const newTopRight = `          <!-- TOP-RIGHT HUD: Return Button, Story Pill & User Greeting (Matching Nyanya Layout) -->
          <div class="toyou-hud-topright">
            <button type="button" class="univ-goto-btn toyou-return-pill" id="btn-toyou-top-return"
              aria-label="Kembali ke tiga universe">
              <span class="goto-icon">🌌</span>
              <span class="goto-text">Pergi ke Universe</span>
            </button>
            <button type="button" class="univ-goto-btn toyou-story-pill" id="btn-toyou-story"
              aria-label="Buka Ruang Menulis Story">
              <span class="goto-icon">✍️</span>
              <span class="goto-text">Story (Karya)</span>
            </button>
            <div class="toyou-user-pill" id="toyou-user-pill">
              <img src="/assets/avatar_lala_hd.png" alt="Lala" class="toyou-user-avatar" id="toyou-user-avatar"
                loading="lazy" decoding="async">
              <span class="toyou-user-greeting" id="toyou-user-greeting">Hello, Lala</span>
              <span class="toyou-user-sparkle">✦</span>
            </div>
          </div>`;

if (html.includes(oldTopRight)) {
  html = html.replace(oldTopRight, newTopRight);
  console.log('✅ Removed .toyou-quick-menu box from .toyou-hud-topright');
} else {
  console.error('oldTopRight not found in index.html');
  process.exit(1);
}

// 3. Remove duplicate #btn-toyou-back and add bottom-left Mood/Music container + bottom-right Quick Nav Dock
const oldBottomSection = `          <!-- BOTTOM-LEFT QUOTE & BOTTOM-RIGHT BACK BUTTON -->
          <div class="toyou-bottom-quote" aria-hidden="true">
            <span>✦</span> A little closer, for a brighter tomorrow. <span>✦</span>
          </div>

          <button type="button" class="univ-goto-btn toyou-back-btn" id="btn-toyou-back"
            aria-label="Kembali ke tiga universe">
            <span class="goto-icon">🌌</span>
            <span class="goto-text">Pergi ke Universe</span>
          </button>`;

const newBottomSection = `          <!-- BOTTOM-LEFT: MOOD & REKOMENDASI MUSIK CARD (LALA — TO YOU) -->
          <div class="toyou-mood-container" id="toyou-mood-container">
            <div class="toyou-mood-music-card" id="toyou-mood-card">
              <div class="toyou-mood-icon-wrap" id="toyou-mood-icon-wrap" title="Mood Hari Ini">
                <span class="toyou-mood-sun-icon" id="toyou-mood-icon">🌸</span>
              </div>
              <div class="toyou-mood-details">
                <span class="toyou-mood-header-text">Mood Hari Ini</span>
                <div class="toyou-mood-state-row">
                  <strong class="toyou-mood-state-text" id="toyou-mood-text">Tenang</strong>
                  <button type="button" class="btn-toggle-toyou-mood-picker" id="btn-toggle-toyou-mood-picker"
                    title="Pilih Mood Hari Ini" aria-label="Buka Pilihan Mood">
                    <span class="picker-caret-icon" id="toyou-picker-caret">▾</span>
                  </button>
                </div>
                <span class="toyou-mood-song-title" id="toyou-mood-song">♫ Whispering Breeze & Petals ♫</span>
              </div>
              <button type="button" class="toyou-mood-play-btn" id="btn-toyou-mood-play" aria-label="Putar Musik Suasana">
                <span class="play-icon" id="toyou-music-icon">▶</span>
              </button>
            </div>

            <!-- Horizontal Mood Choices Bar -->
            <div class="toyou-mood-options-bar" id="toyou-mood-options-bar" aria-label="Pilihan Mood Hari Ini">
              <button type="button" class="toyou-mood-option-pill" data-mood="bahagia" title="Bahagia">
                <span class="mood-opt-icon">🌞</span>
                <span class="mood-opt-label">Bahagia</span>
              </button>
              <button type="button" class="toyou-mood-option-pill" data-mood="bersemangat" title="Bersemangat">
                <span class="mood-opt-icon">✨</span>
                <span class="mood-opt-label">Bersemangat</span>
              </button>
              <button type="button" class="toyou-mood-option-pill active" data-mood="tenang" title="Tenang">
                <span class="mood-opt-icon">🌸</span>
                <span class="mood-opt-label">Tenang</span>
              </button>
              <button type="button" class="toyou-mood-option-pill" data-mood="sedih" title="Sendu">
                <span class="mood-opt-icon">🌧️</span>
                <span class="mood-opt-label">Sendu</span>
              </button>
              <button type="button" class="toyou-mood-option-pill" data-mood="lelah" title="Lelah">
                <span class="mood-opt-icon">🍃</span>
                <span class="mood-opt-label">Lelah</span>
              </button>
              <button type="button" class="toyou-mood-option-pill" data-mood="bersyukur" title="Bersyukur">
                <span class="mood-opt-icon">🌻</span>
                <span class="mood-opt-label">Bersyukur</span>
              </button>
              <button type="button" class="toyou-mood-option-pill" data-mood="melamun" title="Melamun">
                <span class="mood-opt-icon">🦋</span>
                <span class="mood-opt-label">Melamun</span>
              </button>
            </div>
          </div>

          <!-- BOTTOM-RIGHT: FLOATING QUICK NAVIGATION DOCK (LALA — TO YOU) -->
          <nav class="toyou-quick-nav-dock" id="toyou-quick-nav-dock" aria-label="Navigasi Cepat Lokasi TO YOU">
            <button type="button" class="toyou-quick-item toyou-dock-btn" data-toyou-nav="rumah" title="Masuk ke Bloom Cottage">
              <span class="q-icon">🌸</span>
              <span class="q-text">Bloom Cottage</span>
            </button>
            <button type="button" class="toyou-quick-item toyou-dock-btn" data-toyou-nav="atelier" title="Galeri Busana (Moments)">
              <span class="q-icon">👗</span>
              <span class="q-text">Atelier</span>
            </button>
            <button type="button" class="toyou-quick-item toyou-dock-btn" data-toyou-nav="ladang_kupu" title="Taman Kupu-kupu (Orbit)">
              <span class="q-icon">🦋</span>
              <span class="q-text">Taman Kupu</span>
            </button>
            <button type="button" class="toyou-quick-item toyou-dock-btn" data-toyou-nav="teleskop" title="Teleskop Langit Pagi">
              <span class="q-icon">🔭</span>
              <span class="q-text">Teleskop</span>
            </button>
            <button type="button" class="toyou-quick-item toyou-dock-btn" data-toyou-nav="gazebo" title="Gazebo Tepi Sungai">
              <span class="q-icon">🏛</span>
              <span class="q-text">Gazebo</span>
            </button>
            <button type="button" class="toyou-quick-item toyou-dock-btn" data-toyou-nav="kotak_pos" title="Buka Kotak Pos">
              <span class="q-icon">✉</span>
              <span class="q-text">Kotak Pos</span>
            </button>
          </nav>`;

if (html.includes(oldBottomSection)) {
  html = html.replace(oldBottomSection, newBottomSection);
  console.log('✅ Removed duplicate #btn-toyou-back and added bottom-left Mood/Music + bottom-right Quick Nav Dock');
} else {
  console.error('oldBottomSection not found in index.html');
  process.exit(1);
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('🎉 Successfully updated index.html for TO YOU (Lala)!');
