const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove btn-shadow-to-eclipse from shadow-hud-topright
const btnToEclipseRegex = /<button type="button" class="univ-goto-btn shadow-eclipse-pill" id="btn-shadow-to-eclipse"[\s\S]*?<\/button>\s*/;
if (btnToEclipseRegex.test(html)) {
  html = html.replace(btnToEclipseRegex, '');
  console.log('Removed duplicate btn-shadow-to-eclipse from shadow-hud-topright.');
} else {
  console.log('btn-shadow-to-eclipse not found in shadow-hud-topright.');
}

// 2. Update hotspot-shadow-rumah to THE ECLIPSE
const oldHotspot = `<!-- A. MENARA KRISTAL — RUMAH LELE -->
          <button type="button" class="shadow-hotspot hotspot-shadow-rumah" data-shadow-loc="rumah_kristal"
            aria-label="Lokasi A: Menara Kristal - Rumah Lele">
            <span class="shadow-building-zone" aria-hidden="true"></span>
            <span class="shadow-loc-pill">
              <span class="shadow-pill-icon">☾</span>
              <span class="shadow-pill-text">Rumah<br>Kristal</span>
            </span>
            <span class="shadow-hover-hint" aria-hidden="true">✦ Masuk ke Menara Kristal — Rumah Lele</span>
          </button>`;

const newHotspot = `<!-- A. THE ECLIPSE — RUMAH UTAMA LELE -->
          <button type="button" class="shadow-hotspot hotspot-shadow-rumah" id="btn-shadow-house-hotspot" data-shadow-loc="rumah_kristal"
            aria-label="Lokasi A: THE ECLIPSE - Rumah Utama Lele">
            <span class="shadow-building-zone" aria-hidden="true"></span>
            <span class="shadow-loc-pill">
              <span class="shadow-pill-icon">👑</span>
              <span class="shadow-pill-text">THE<br>ECLIPSE</span>
            </span>
            <span class="shadow-hover-hint" aria-hidden="true">✦ Masuk ke THE ECLIPSE — Rumah Utama Lele</span>
          </button>`;

// Normalize CRLF to LF for matching
const normHtml = html.replace(/\r\n/g, '\n');
const normOld = oldHotspot.replace(/\r\n/g, '\n');

if (normHtml.includes(normOld)) {
  html = normHtml.replace(normOld, newHotspot);
  console.log('Updated hotspot-shadow-rumah to THE ECLIPSE.');
} else {
  console.error('Could not find oldHotspot in index.html!');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('index.html saved successfully.');
