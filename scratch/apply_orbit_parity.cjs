const fs = require('fs');

console.log('=== FIXING ORBIT PARITY APPLICATION ACROSS ALL 8 UNIVERSES ===');

// 1. UPDATE index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

// A. KIDULT Orbit button
if (!indexHtml.includes('id="btn-kidult-nav-orbit"')) {
  const match = indexHtml.match(/<button[^>]*id="btn-kidult-return-univ"[^>]*>/);
  if (match) {
    const kidultBtn = `<button type="button" class="univ-goto-btn kidult-orbit-pill" id="btn-kidult-nav-orbit"
              title="Our Little Orbit (Kalender Bersama)" aria-label="Buka Our Little Orbit">
              <span class="goto-icon">📅</span>
              <span class="goto-text">Orbit</span>
            </button>\n            `;
    indexHtml = indexHtml.replace(match[0], kidultBtn + match[0]);
    console.log('✓ Added btn-kidult-nav-orbit to KIDULT');
  }
}

// B. TO YOU Orbit button
if (!indexHtml.includes('id="btn-toyou-nav-orbit"')) {
  const match = indexHtml.match(/<button[^>]*id="btn-toyou-top-return"[^>]*>/);
  if (match) {
    const toyouBtn = `<button type="button" class="univ-goto-btn toyou-orbit-pill" id="btn-toyou-nav-orbit"
              title="Our Little Orbit (Kalender Bersama)" aria-label="Buka Our Little Orbit">
              <span class="goto-icon">📅</span>
              <span class="goto-text">Orbit</span>
            </button>\n            `;
    indexHtml = indexHtml.replace(match[0], toyouBtn + match[0]);
    console.log('✓ Added btn-toyou-nav-orbit to TO YOU');
  }
}

// C. SHADOW Orbit button
if (!indexHtml.includes('id="btn-shadow-nav-orbit"')) {
  const match = indexHtml.match(/<button[^>]*id="btn-shadow-top-return"[^>]*>/);
  if (match) {
    const shadowBtn = `<button type="button" class="univ-goto-btn shadow-orbit-pill" id="btn-shadow-nav-orbit"
              title="Our Little Orbit (Kalender Bersama)" aria-label="Buka Our Little Orbit">
              <span class="goto-icon">📅</span>
              <span class="goto-text">Orbit</span>
            </button>\n            `;
    indexHtml = indexHtml.replace(match[0], shadowBtn + match[0]);
    console.log('✓ Added btn-shadow-nav-orbit to SHADOW');
  }
}

// D. PINWHEEL Orbit button
if (!indexHtml.includes('id="btn-pinwheel-nav-orbit"')) {
  const match = indexHtml.match(/<button[^>]*id="btn-pinwheel-top-story"[^>]*>/);
  if (match) {
    const pinwheelBtn = `<button type="button" class="pinwheel-nav-pill-btn" id="btn-pinwheel-nav-orbit" aria-label="Our Little Orbit">
                <span class="pill-icon">📅</span>
                <span>Orbit</span>
              </button>\n              `;
    indexHtml = indexHtml.replace(match[0], pinwheelBtn + match[0]);
    console.log('✓ Added btn-pinwheel-nav-orbit to PINWHEEL');
  }
}

// E. YAWN Orbit button
if (!indexHtml.includes('id="btn-yawn-nav-orbit"')) {
  const match = indexHtml.match(/<button[^>]*id="btn-yawn-top-story"[^>]*>/);
  if (match) {
    const yawnBtn = `<button type="button" class="yawn-nav-pill-btn" id="btn-yawn-nav-orbit" aria-label="Our Little Orbit">
                <span class="pill-icon">📅</span>
                <span>Orbit</span>
              </button>\n              `;
    indexHtml = indexHtml.replace(match[0], yawnBtn + match[0]);
    console.log('✓ Added btn-yawn-nav-orbit to YAWN');
  }
}

// F. ASH Orbit button
if (!indexHtml.includes('id="btn-ash-nav-orbit"')) {
  const match = indexHtml.match(/<button[^>]*id="btn-ash-top-story"[^>]*>/);
  if (match) {
    const ashBtn = `<button type="button" class="ash-nav-pill-btn" id="btn-ash-nav-orbit" aria-label="Our Little Orbit">
                <span class="pill-icon">📅</span>
                <span>Orbit</span>
              </button>\n              `;
    indexHtml = indexHtml.replace(match[0], ashBtn + match[0]);
    console.log('✓ Added btn-ash-nav-orbit to ASH');
  }
}

// G. US AGAIN Orbit button
if (!indexHtml.includes('id="btn-usagain-nav-orbit"')) {
  const match = indexHtml.match(/<button[^>]*id="btn-usagain-nav-story"[^>]*>/);
  if (match) {
    const usagainBtn = `<button type="button" class="usagain-nav-pill-btn" id="btn-usagain-nav-orbit" aria-label="Our Little Orbit">
                <span>📅</span>
                <span>Orbit</span>
              </button>\n              `;
    indexHtml = indexHtml.replace(match[0], usagainBtn + match[0]);
    console.log('✓ Added btn-usagain-nav-orbit to US AGAIN');
  }
}

// H. Meeting participant selector in modal-propose-meeting
if (!indexHtml.includes('id="orbit-participants-select-grid"')) {
  const descTarget = '</textarea>\n            </div>';
  const selectorHtml = `</textarea>
            </div>

            <div class="input-field-group">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem;">
                <label class="input-label" style="margin-bottom:0;">Pilih Sahabat yang Diundang</label>
                <div style="display: flex; gap: 0.5rem;">
                  <button type="button" id="btn-select-all-participants" class="btn-text-action" style="font-size:0.75rem; color:#93c5fd; background:none; border:none; cursor:pointer;">Pilih Semua</button>
                  <button type="button" id="btn-clear-all-participants" class="btn-text-action" style="font-size:0.75rem; color:#f87171; background:none; border:none; cursor:pointer;">Kosongkan</button>
                </div>
              </div>
              <div class="orbit-participants-select-grid" id="orbit-participants-select-grid">
                <!-- Dynamically rendered by renderParticipantSelector() -->
              </div>
              <div class="participant-selection-counter" style="display:flex; justify-content:flex-end; margin-top:0.35rem; font-size:0.75rem; color:#cbd5e1;">
                <span>Terpilih: <strong id="selected-participants-count" style="color:#60a5fa;">0</strong> sahabat</span>
              </div>
            </div>`;
  indexHtml = indexHtml.replace(descTarget, selectorHtml);
  console.log('✓ Injected orbit-participants-select-grid into modal-propose-meeting in index.html');
}

fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('✓ index.html successfully saved.');
