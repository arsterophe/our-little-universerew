const fs = require('fs');
const path = require('path');

console.log('--- RESTORING ALL 8 UNIVERSES & PROFILES IN INDEX.HTML ---');

let html = fs.readFileSync('index.html', 'utf8');

// 1. HEAD STYLESHEETS
const requiredStylesheets = [
  '/pinwheel.css',
  '/pinwheel_gazebo.css',
  '/pinwheel_residence.css',
  '/pinwheel_studio.css',
  '/yawn.css',
  '/ash.css',
  '/usagain.css',
  '/hot.css'
];

requiredStylesheets.forEach(css => {
  if (!html.includes(css)) {
    const headClose = '</head>';
    html = html.replace(headClose, `  <link rel="stylesheet" href="${css}">\n${headClose}`);
    console.log(`✓ Added link for ${css}`);
  }
});

// 2. CHARACTER CARD FOR ROYAN (8TH PROFILE)
if (!html.includes('id="card-royan"')) {
  const rubenCardTarget = '</button>\n\n          </div>\n        </main>';
  const rubenCardFallback = '</button>\r\n\r\n          </div>\r\n        </main>';
  
  const royanCardHtml = `

            <!-- CARD 8: ROYAN -->
            <button class="character-card card-royan" data-character="royan" id="card-royan"
              aria-label="Pilih karakter Royan - HOT">
              <div class="card-ambient-aura"></div>
              <div class="card-arch-frame">
                <div class="card-inner-glow"></div>
                <div class="card-ornament-top">
                  <span class="char-symbol">🎆</span>
                </div>
                <div class="card-image-wrapper">
                  <img src="/assets/card_royan_hd.jpg" alt="Royan - HOT" class="char-card-img" width="275" height="420"
                    loading="lazy" decoding="async" />
                </div>
                <div class="card-caption">
                  <h2 class="char-name">Royan</h2>
                  <p class="char-role">HOT 🎆</p>
                </div>
              </div>
              <div class="card-hover-border"></div>
            </button>`;

  if (html.includes(rubenCardTarget)) {
    html = html.replace(rubenCardTarget, `</button>${royanCardHtml}\n\n          </div>\n        </main>`);
    console.log('✓ Added #card-royan to character selection grid (LF)');
  } else if (html.includes(rubenCardFallback)) {
    html = html.replace(rubenCardFallback, `</button>${royanCardHtml}\r\n\r\n          </div>\r\n        </main>`);
    console.log('✓ Added #card-royan to character selection grid (CRLF)');
  } else {
    // Search by ruben card
    const rubenIdx = html.indexOf('id="card-ruben"');
    if (rubenIdx !== -1) {
      const nextBtnClose = html.indexOf('</button>', rubenIdx) + '</button>'.length;
      html = html.substring(0, nextBtnClose) + royanCardHtml + html.substring(nextBtnClose);
      console.log('✓ Added #card-royan after card-ruben');
    }
  }
}

// 3. UNIVERSE SELECTION STAGE: EIGHT WORLDS TITLE & PLANET HOT CARD & 8TH DOT
if (html.includes('Seven worlds, one universe')) {
  html = html.replace('Seven worlds, one universe', 'Eight worlds, one universe');
  console.log('✓ Updated hero title to "Eight worlds, one universe"');
}

if (!html.includes('data-universe="hot"')) {
  const pinwheelCardTarget = 'data-universe="pinwheel"';
  const pIdx = html.indexOf(pinwheelCardTarget);
  if (pIdx !== -1) {
    const nextBtnClose = html.indexOf('</button>', pIdx) + '</button>'.length;
    const hotIslandHtml = `\n\n            <!-- ISLAND 8: HOT - ROYAN'S UNIVERSE -->
            <button type="button" class="univ-island-card card-hot" data-universe="hot" data-char="royan"
              aria-label="Buka Universe HOT - Royan's Universe">
              <div class="island-art-wrapper">
                <div class="island-ambient-glow"></div>
                <div class="island-planetary-ring"></div>
                <img src="/assets/planet_hot_sphere.jpg" alt="HOT - Royan's Universe" class="floating-island-image"
                  loading="eager" decoding="async">
              </div>
              <div class="island-avatar-badge">
                <img src="/assets/avatar_royan_hd.jpg" alt="Royan - HOT" loading="eager" decoding="async">
              </div>
              <div class="island-glass-card">
                <h2 class="island-card-title"><span class="island-symbol-icon">🎆</span> HOT</h2>
                <p class="island-card-sub">ROYAN'S UNIVERSE</p>
                <div class="island-universe-badge-container">
                  <span class="island-universe-badge univ-badge visit-universe"><span class="badge-star">✦</span> VISIT
                    UNIVERSE</span>
                </div>
              </div>
              <p class="island-script-quote">Fireworks in the celestial night.</p>
            </button>`;
    html = html.substring(0, nextBtnClose) + hotIslandHtml + html.substring(nextBtnClose);
    console.log('✓ Added Planet HOT (8th island card) to universes stage');
  }
}

if (!html.includes('data-planet-index="7"')) {
  const dot6Target = 'data-planet-index="6" aria-label="PINWHEEL - Abil"></button>';
  if (html.includes(dot6Target)) {
    html = html.replace(dot6Target, `${dot6Target}\n            <button type="button" class="univ-nav-dot" data-planet-index="7" aria-label="HOT - Royan"></button>`);
    console.log('✓ Added 8th navigation dot for HOT');
  }
}

// 4. LOAD & PREPARE SECTIONS
const pyContent = fs.readFileSync('scratch/update_index_pinwheel_and_yawn.cjs', 'utf8');
const pToken = 'const pinwheelSection = `';
const pStart = pyContent.indexOf(pToken) + pToken.length;
const pEnd = pyContent.indexOf('`;\n\nconst yawnSection = `');
let pinwheelSection = pyContent.substring(pStart, pEnd).trim();

const yToken = 'const yawnSection = `';
const yStart = pyContent.indexOf(yToken) + yToken.length;
const yEnd = pyContent.indexOf('`;\n\nconst anchor =');
const yawnSection = pyContent.substring(yStart, yEnd).trim();

const ashContent = fs.readFileSync('scratch/insert_ash_section.cjs', 'utf8');
const aToken = 'const ashSection = `';
const aStart = ashContent.indexOf(aToken) + aToken.length;
const aEnd = ashContent.indexOf('`;\n\nconst anchor =');
const ashSection = ashContent.substring(aStart, aEnd).trim();

const usaContent = fs.readFileSync('scratch/insert_usagain_section.cjs', 'utf8');
const uToken = 'const usagainSectionHtml = `';
const uStart = usaContent.indexOf(uToken) + uToken.length;
const uEnd = usaContent.indexOf('`;\n\nconst updatedHtml =');
const usagainSection = usaContent.substring(uStart, uEnd).trim();

const hotContent = fs.readFileSync('scratch/insert_hot_section.txt', 'utf8');
const hStart = hotContent.indexOf('<!-- ======================================================== -->\n      <!-- VIEW: ROYAN');
const hEnd = hotContent.indexOf('<!-- ======================================================== -->\n      <!-- VIEW: SHADOW');
const hotSection = hotContent.substring(hStart, hEnd).trim();

// Add enter buttons into pinwheelSection modals
// A. Enter Pinwheel Gazebo button in #pinwheel-gazebo-modal
if (!pinwheelSection.includes('id="btn-enter-pinwheel-gazebo"')) {
  const mTarget = 'id="pinwheel-gazebo-modal"';
  const mIdx = pinwheelSection.indexOf(mTarget);
  if (mIdx !== -1) {
    const cardEnd = pinwheelSection.indexOf('</div>', pinwheelSection.indexOf('class="pinwheel-modal-card"', mIdx));
    const btnHtml = `\n            <div style="margin-top:14px; text-align:center;">
              <button type="button" class="btn-enter-pinwheel-gazebo" id="btn-enter-pinwheel-gazebo"
                style="width:100%; padding:11px 16px; border-radius:12px; background:linear-gradient(135deg, #f472b6, #a855f7); color:#ffffff; font-weight:700; cursor:pointer;">
                <span>Masuk ke Moonlit Blossom Gazebo 🌸</span>
              </button>
            </div>`;
    pinwheelSection = pinwheelSection.substring(0, cardEnd) + btnHtml + pinwheelSection.substring(cardEnd);
    console.log('✓ Added btn-enter-pinwheel-gazebo inside pinwheelSection');
  }
}

// B. Enter Photo & Vision Studio buttons in #pinwheel-studio-modal
if (!pinwheelSection.includes('id="btn-enter-pinwheel-photo"')) {
  const mTarget = 'id="pinwheel-studio-modal"';
  const mIdx = pinwheelSection.indexOf(mTarget);
  if (mIdx !== -1) {
    const cardEnd = pinwheelSection.indexOf('</div>', pinwheelSection.indexOf('class="pinwheel-modal-card"', mIdx));
    const btnHtml = `\n            <div style="margin-top:14px; display:flex; gap:10px;">
              <button type="button" class="btn-enter-pinwheel-photo" id="btn-enter-pinwheel-photo"
                style="flex:1; padding:10px 14px; border-radius:12px; background:linear-gradient(135deg, #c084fc, #93c5fd); color:#ffffff; font-weight:700; cursor:pointer;">
                <span>📷 Photography Studio</span>
              </button>
              <button type="button" class="btn-enter-pinwheel-vision" id="btn-enter-pinwheel-vision"
                style="flex:1; padding:10px 14px; border-radius:12px; background:linear-gradient(135deg, #f472b6, #c084fc); color:#ffffff; font-weight:700; cursor:pointer;">
                <span>🎨 Vision Studio</span>
              </button>
            </div>`;
    pinwheelSection = pinwheelSection.substring(0, cardEnd) + btnHtml + pinwheelSection.substring(cardEnd);
    console.log('✓ Added btn-enter-pinwheel-photo and vision inside pinwheelSection');
  }
}

// C. Enter Residence button in #pinwheel-residence-modal
if (!pinwheelSection.includes('id="btn-enter-pinwheel-residence"')) {
  const mTarget = 'id="btn-close-residence-modal"';
  if (pinwheelSection.includes(mTarget)) {
    const modalBlockEnd = 'id="pinwheel-observatory-modal"';
    const pos = pinwheelSection.indexOf(modalBlockEnd);
    if (pos !== -1) {
      const beforeBlock = pinwheelSection.substring(0, pos);
      const lastCloseDiv = beforeBlock.lastIndexOf('</div>');
      const secondLastCloseDiv = beforeBlock.lastIndexOf('</div>', lastCloseDiv - 1);
      const enterBtnHtml = `
            <div style="display:flex; justify-content:flex-end; margin-top:14px;">
              <button type="button" class="pinwheel-action-btn" id="btn-enter-pinwheel-residence" style="background: linear-gradient(135deg, #7e22ce, #9333ea); border: 1px solid #c084fc; color: #ffffff; padding: 10px 18px; border-radius: 999px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 14px rgba(192, 132, 252, 0.4);">
                ⛩️ Masuk ke The Windwhisper Residence ✨
              </button>
            </div>`;
      pinwheelSection = pinwheelSection.substring(0, secondLastCloseDiv) + enterBtnHtml + '\r\n          ' + pinwheelSection.substring(secondLastCloseDiv);
      console.log('✓ Added btn-enter-pinwheel-residence inside pinwheelSection');
    }
  }
}

// Pinwheel Subviews
// A. Gazebo subview
const gScript = fs.readFileSync('scratch/insert_gazebo_html.cjs', 'utf8');
const startG = gScript.indexOf('<!-- ============================================== -->\n      <!-- VIEW: PINWHEEL — MOONLIT BLOSSOM GAZEBO');
const endG = gScript.indexOf('</section>`;\n\n  if (normalized.includes(target2))');
const pinwheelGazeboSection = gScript.substring(startG, endG + 10).trim();

// B. Studio subviews
const sScript = fs.readFileSync('scratch/insert_studio_html.cjs', 'utf8');
const startP = sScript.indexOf('<!-- ============================================== -->\n      <!-- VIEW: PINWHEEL — PHOTOGRAPHY & VIDEO STUDIO');
const endV = sScript.indexOf('</section>`;\n\n// 4. Inject views before');
const pinwheelStudioSection = sScript.substring(startP, endV + 10).trim();

// C. Residence subview
const rScript = fs.readFileSync('update_index_residence.cjs', 'utf8');
const rStart = rScript.indexOf('<!-- ============================================== -->\r\n      <!-- VIEW: THE WINDWHISPER RESIDENCE');
const rEnd = rScript.indexOf('</section>`;\r\n\r\n      html = html.substring(0, insertIdx)');
const pinwheelResidenceSection = rScript.substring(rStart, rEnd + 10).trim();

// Combine all 5 Universe views
const combinedAll5Universes = `
      ${pinwheelSection}

      ${pinwheelResidenceSection}

      ${pinwheelGazeboSection}

      ${pinwheelStudioSection}

      ${yawnSection}

      ${ashSection}

      ${usagainSection}

      ${hotSection}
`;

// Insert before '<!-- VIEW: SHADOW — MOONLIT SERENITY GAZEBO'
const shadowGazeboAnchor = '<!-- VIEW: SHADOW — MOONLIT SERENITY GAZEBO';
if (!html.includes('id="view-pinwheel-world"')) {
  if (html.includes(shadowGazeboAnchor)) {
    const parts = html.split(shadowGazeboAnchor);
    html = parts[0] + combinedAll5Universes + '\n\n      ' + shadowGazeboAnchor + parts[1];
    console.log('✓ Inserted all 5 universe sections (PINWHEEL, YAWN, ASH, US AGAIN, HOT) + subviews before Shadow Gazebo');
  } else {
    console.error('Shadow Gazebo anchor not found!');
    process.exit(1);
  }
} else {
  console.log('view-pinwheel-world already present in index.html!');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('--- RESTORATION COMPLETE ---');
