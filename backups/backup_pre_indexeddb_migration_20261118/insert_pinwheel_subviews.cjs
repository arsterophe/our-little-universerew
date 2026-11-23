const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');

// 1. Ensure pinwheel_gazebo.css and pinwheel_studio.css are linked in head
if (!html.includes('/pinwheel_gazebo.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/pinwheel_gazebo.css">\n</head>');
}
if (!html.includes('/pinwheel_studio.css')) {
  html = html.replace('</head>', '  <link rel="stylesheet" href="/pinwheel_studio.css">\n</head>');
}

// 2. Extract gazebo section from scratch/insert_gazebo_html.cjs
if (!html.includes('id="view-pinwheel-gazebo"')) {
  const gScript = fs.readFileSync('scratch/insert_gazebo_html.cjs', 'utf8').replace(/\r\n/g, '\n');
  const startG = gScript.indexOf('<!-- ============================================== -->\n      <!-- VIEW: PINWHEEL — MOONLIT BLOSSOM GAZEBO');
  const endG = gScript.indexOf('</section>`;\n\n  if (normalized.includes(target2))');
  if (startG !== -1 && endG !== -1) {
    const gazeboHtml = gScript.substring(startG, endG + 10);
    const anchor = '<section class="view-section view-shadow-gazebo"';
    html = html.replace(anchor, `${gazeboHtml}\n\n      ${anchor}`);
    console.log('✓ Inserted view-pinwheel-gazebo');
  }
}

// 3. Ensure enter gazebo button exists in modal or pinwheel view
if (!html.includes('id="btn-enter-pinwheel-gazebo"')) {
  const modalTarget = 'id="pinwheel-gazebo-modal"';
  const mIdx = html.indexOf(modalTarget);
  if (mIdx !== -1) {
    const cardEnd = html.indexOf('</div>', html.indexOf('class="pinwheel-modal-card"', mIdx));
    const btnHtml = `\n            <div style="margin-top:14px; text-align:center;">
              <button type="button" class="btn-enter-pinwheel-gazebo" id="btn-enter-pinwheel-gazebo"
                style="width:100%; padding:11px 16px; border-radius:12px; background:linear-gradient(135deg, #f472b6, #a855f7); color:#ffffff; font-weight:700; cursor:pointer;">
                <span>Masuk ke Moonlit Blossom Gazebo 🌸</span>
              </button>
            </div>`;
    html = html.substring(0, cardEnd) + btnHtml + html.substring(cardEnd);
    console.log('✓ Inserted btn-enter-pinwheel-gazebo');
  }
}

// 4. Extract photography and vision studio sections from scratch/insert_studio_html.cjs
if (!html.includes('id="view-pinwheel-photography"')) {
  const sScript = fs.readFileSync('scratch/insert_studio_html.cjs', 'utf8').replace(/\r\n/g, '\n');
  const startP = sScript.indexOf('<!-- ============================================== -->\n      <!-- VIEW: PINWHEEL — PHOTOGRAPHY & VIDEO STUDIO');
  const endV = sScript.indexOf('</section>`;\n\n// 4. Inject views before');
  
  if (startP !== -1 && endV !== -1) {
    const studioHtml = sScript.substring(startP, endV + 10);
    const anchor = '<section class="view-section view-shadow-gazebo"';
    html = html.replace(anchor, `${studioHtml}\n\n      ${anchor}`);
    console.log('✓ Inserted view-pinwheel-photography & view-pinwheel-vision-studio');
  } else {
    console.error('Studio indices not found:', startP, endV);
  }
}

// 5. Ensure enter photo and enter vision buttons exist
if (!html.includes('id="btn-enter-pinwheel-photo"')) {
  const modalTarget = 'id="pinwheel-studio-modal"';
  const mIdx = html.indexOf(modalTarget);
  if (mIdx !== -1) {
    const cardEnd = html.indexOf('</div>', html.indexOf('class="pinwheel-modal-card"', mIdx));
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
    html = html.substring(0, cardEnd) + btnHtml + html.substring(cardEnd);
    console.log('✓ Inserted btn-enter-pinwheel-photo and vision');
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ Pinwheel subviews updated successfully!');
