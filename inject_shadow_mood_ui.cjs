const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Normalize line endings for replacement search
const hasCRLF = html.includes('\r\n');
const nl = hasCRLF ? '\r\n' : '\n';

// 1. Inject status bar into #shadow-char-card
const quoteStr = `<p class="shadow-char-quote">Find your light in the darkness.</p>`;
const statusBar = `${nl}                <div class="shadow-char-duality-bar" id="shadow-char-duality-bar" aria-label="Status Mood & Sisi Lele">` +
  `${nl}                  <span class="shadow-status-pill shadow-status-mood" id="shadow-char-mood-pill" title="Mood Hari Ini">` +
  `${nl}                    <span class="status-icon" id="shadow-char-mood-icon">🌸</span>` +
  `${nl}                    <span class="status-text" id="shadow-char-mood-text">Tenang</span>` +
  `${nl}                  </span>` +
  `${nl}                  <span class="shadow-status-pill shadow-status-side" id="shadow-char-side-pill" title="Sisi Kepribadian Aktif">` +
  `${nl}                    <span class="status-icon" id="shadow-char-side-icon">🌓</span>` +
  `${nl}                    <span class="status-text" id="shadow-char-side-text">Eclipse</span>` +
  `${nl}                  </span>` +
  `${nl}                </div>`;

if (!html.includes('id="shadow-char-duality-bar"')) {
  if (!html.includes(quoteStr)) {
    console.error('quoteStr not found!');
    process.exit(1);
  }
  html = html.replace(quoteStr, quoteStr + statusBar);
  console.log('✅ #shadow-char-card status bar injected!');
} else {
  console.log('ℹ️ #shadow-char-duality-bar already present.');
}

// 2. Inject #shadow-mood-container and #shadow-mood-history-modal
if (!html.includes('id="shadow-mood-container"')) {
  const dockTag = '<!-- PALET DEKORASI SHADOW (FASE 8) -->';
  const pos = html.indexOf(dockTag);
  if (pos === -1) {
    console.error('dockTag not found!');
    process.exit(1);
  }

  const moodContainerSnippet = `<!-- BOTTOM-LEFT: SHADOW MOOD OF THE DAY & ANGEL/DEVIL DUALITY CARD -->${nl}` +
`          <div class="shadow-mood-container" id="shadow-mood-container" aria-label="Sistem Mood & Duality Lele (SHADOW)">${nl}` +
`            <div class="shadow-mood-card" id="shadow-mood-card">${nl}` +
`              <div class="shadow-mood-icon-wrap" id="shadow-mood-icon-wrap" title="Pilih Mood Hari Ini">${nl}` +
`                <span class="shadow-mood-moon-icon" id="shadow-mood-icon">🌸</span>${nl}` +
`                <span class="shadow-mood-side-orb" id="shadow-mood-side-orb" title="Indikator Sisi Aktif">🌓</span>${nl}` +
`              </div>${nl}` +
`              <div class="shadow-mood-details">${nl}` +
`                <div class="shadow-mood-top-row">${nl}` +
`                  <span class="shadow-mood-tag">MOOD OF THE DAY</span>${nl}` +
`                  <span class="shadow-side-badge-pill" id="shadow-side-badge" title="Sisi Kepribadian Aktif">Eclipse 🌓</span>${nl}` +
`                </div>${nl}` +
`                <div class="shadow-mood-state-row">${nl}` +
`                  <strong class="shadow-mood-state-text" id="shadow-mood-text" title="Klik untuk memilih mood">Tenang</strong>${nl}` +
`                  <button type="button" class="btn-toggle-shadow-mood-picker" id="btn-toggle-shadow-mood-picker"${nl}` +
`                    title="Pilih Mood Hari Ini" aria-label="Buka Pilihan Mood">${nl}` +
`                    <span class="picker-caret-icon" id="shadow-picker-caret">▾</span>${nl}` +
`                  </button>${nl}` +
`                  <button type="button" class="btn-shadow-mood-history" id="btn-shadow-mood-history"${nl}` +
`                    title="Lihat Riwayat Mood" aria-label="Riwayat Mood">${nl}` +
`                    <span class="history-icon">📜</span>${nl}` +
`                  </button>${nl}` +
`                </div>${nl}` +
`                <div class="shadow-duality-row" id="shadow-duality-row">${nl}` +
`                  <div class="shadow-duality-buttons">${nl}` +
`                    <button type="button" class="btn-duality-choice btn-duality-angel" id="btn-side-angel"${nl}` +
`                      title="Pilih Angel Side (The Gentle Light)" data-side="angel">${nl}` +
`                      <span class="side-btn-icon">🪽</span>${nl}` +
`                      <span class="side-btn-label">Angel</span>${nl}` +
`                    </button>${nl}` +
`                    <button type="button" class="btn-duality-choice btn-duality-devil" id="btn-side-devil"${nl}` +
`                      title="Pilih Devil Side (The Dark Flame)" data-side="devil">${nl}` +
`                      <span class="side-btn-icon">🔥</span>${nl}` +
`                      <span class="side-btn-label">Devil</span>${nl}` +
`                    </button>${nl}` +
`                    <button type="button" class="btn-duality-choice btn-duality-eclipse active" id="btn-side-eclipse"${nl}` +
`                      title="Pilih Eclipse Side (Balanced Duality)" data-side="eclipse">${nl}` +
`                      <span class="side-btn-icon">🌓</span>${nl}` +
`                      <span class="side-btn-label">Both</span>${nl}` +
`                    </button>${nl}` +
`                  </div>${nl}` +
`                </div>${nl}` +
`                <div class="shadow-duality-quote-row">${nl}` +
`                  <span class="shadow-duality-quote-text" id="shadow-side-quote">“The angel I became, the devil I never truly left.”</span>${nl}` +
`                </div>${nl}` +
`                <span class="shadow-mood-song-title" id="shadow-mood-song">♫ Crystal Moon Serenade ♫</span>${nl}` +
`              </div>${nl}` +
`              <button type="button" class="shadow-mood-play-btn" id="btn-shadow-mood-play" aria-label="Putar Musik Suasana">${nl}` +
`                <span class="play-icon" id="shadow-mood-music-icon">▶</span>${nl}` +
`              </button>${nl}` +
`            </div>${nl}` +
`${nl}` +
`            <!-- Horizontal Mood Choices Bar -->${nl}` +
`            <div class="shadow-mood-options-bar" id="shadow-mood-options-bar" aria-label="Pilihan Mood Hari Ini">${nl}` +
`              <button type="button" class="shadow-mood-option-pill" data-mood="bahagia" title="Bahagia — Sedang merasa bahagia">${nl}` +
`                <span class="mood-opt-icon">😊</span>${nl}` +
`                <span class="mood-opt-label">Bahagia</span>${nl}` +
`              </button>${nl}` +
`              <button type="button" class="shadow-mood-option-pill active" data-mood="tenang" title="Tenang — Tenang dan damai">${nl}` +
`                <span class="mood-opt-icon">🌸</span>${nl}` +
`                <span class="mood-opt-label">Tenang</span>${nl}` +
`              </button>${nl}` +
`              <button type="button" class="shadow-mood-option-pill" data-mood="lelah" title="Lelah — Sedang lelah">${nl}` +
`                <span class="mood-opt-icon">🌙</span>${nl}` +
`                <span class="mood-opt-label">Lelah</span>${nl}` +
`              </button>${nl}` +
`              <button type="button" class="shadow-mood-option-pill" data-mood="sedih" title="Sedih — Sedang sedih">${nl}` +
`                <span class="mood-opt-icon">🌧️</span>${nl}` +
`                <span class="mood-opt-label">Sedih</span>${nl}` +
`              </button>${nl}` +
`              <button type="button" class="shadow-mood-option-pill" data-mood="bersemangat" title="Bersemangat — Penuh semangat">${nl}` +
`                <span class="mood-opt-icon">✨</span>${nl}` +
`                <span class="mood-opt-label">Semangat</span>${nl}` +
`              </button>${nl}` +
`              <button type="button" class="shadow-mood-option-pill" data-mood="bingung" title="Bingung — Sedang bingung">${nl}` +
`                <span class="mood-opt-icon">🌀</span>${nl}` +
`                <span class="mood-opt-label">Bingung</span>${nl}` +
`              </button>${nl}` +
`              <button type="button" class="shadow-mood-option-pill" data-mood="menyendiri" title="Menyendiri — Ingin menikmati waktu sendiri">${nl}` +
`                <span class="mood-opt-icon">🌘</span>${nl}` +
`                <span class="mood-opt-label">Sendiri</span>${nl}` +
`              </button>${nl}` +
`              <button type="button" class="shadow-mood-option-pill" data-mood="bersyukur" title="Bersyukur — Sedang merasa bersyukur">${nl}` +
`                <span class="mood-opt-icon">🙏</span>${nl}` +
`                <span class="mood-opt-label">Bersyukur</span>${nl}` +
`              </button>${nl}` +
`              <button type="button" class="shadow-mood-option-pill" data-mood="ceria" title="Playful — Sedang ingin bercanda">${nl}` +
`                <span class="mood-opt-icon">🎭</span>${nl}` +
`                <span class="mood-opt-label">Playful</span>${nl}` +
`              </button>${nl}` +
`              <button type="button" class="shadow-mood-option-pill" data-mood="hening" title="Quiet — Ingin menikmati ketenangan">${nl}` +
`                <span class="mood-opt-icon">🕯️</span>${nl}` +
`                <span class="mood-opt-label">Quiet</span>${nl}` +
`              </button>${nl}` +
`            </div>${nl}` +
`          </div>${nl}` +
`${nl}` +
`          <!-- Modal Riwayat Mood Lele (SHADOW) -->${nl}` +
`          <div class="shadow-mood-history-modal" id="shadow-mood-history-modal" role="dialog" aria-modal="true" aria-labelledby="shadow-mood-history-title" aria-hidden="true">${nl}` +
`            <div class="shadow-mood-history-backdrop" id="shadow-mood-history-backdrop"></div>${nl}` +
`            <div class="shadow-mood-history-card">${nl}` +
`              <div class="shadow-mood-history-header">${nl}` +
`                <div class="shadow-mood-history-title-wrap">${nl}` +
`                  <span class="history-header-icon">📜</span>${nl}` +
`                  <div>${nl}` +
`                    <h3 class="shadow-mood-history-title" id="shadow-mood-history-title">Riwayat Mood & Duality Lele</h3>${nl}` +
`                    <p class="shadow-mood-history-sub">Catatan suasana hati & sisi batin di Crystal Moon Sanctuary</p>${nl}` +
`                  </div>${nl}` +
`                </div>${nl}` +
`                <button type="button" class="btn-close-shadow-mood-history" id="btn-close-shadow-mood-history" aria-label="Tutup riwayat mood">✕</button>${nl}` +
`              </div>${nl}` +
`              <div class="shadow-mood-history-list" id="shadow-mood-history-list"></div>${nl}` +
`            </div>${nl}` +
`          </div>${nl}${nl}          `;

  html = html.slice(0, pos) + moodContainerSnippet + html.slice(pos);
  console.log('✅ #shadow-mood-container and #shadow-mood-history-modal injected!');
} else {
  console.log('ℹ️ #shadow-mood-container already present.');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html! Length:', fs.readFileSync('index.html', 'utf8').length);
