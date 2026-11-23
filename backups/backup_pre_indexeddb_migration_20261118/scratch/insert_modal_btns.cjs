// scratch/insert_modal_btns.cjs
const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const target = 'air terjun yang memesona.';
const idx = html.indexOf(target);

if (idx !== -1 && !html.includes('id="btn-enter-pinwheel-photo"')) {
  const pClose = html.indexOf('</p>', idx);
  const insertPos = pClose + 4;
  const btnHtml = `\n            <div style="margin-top:14px; padding-top:12px; border-top:1px solid rgba(192, 132, 252, 0.25); display:flex; flex-direction:column; gap:10px;">
              <button type="button" class="btn-enter-pinwheel-photo" id="btn-enter-pinwheel-photo"
                style="width:100%; padding:11px 16px; border-radius:12px; background:linear-gradient(135deg, #a855f7, #ec4899); color:#ffffff; font-weight:700; font-size:0.9rem; border:1px solid rgba(255,255,255,0.25); box-shadow:0 6px 20px rgba(168,85,247,0.35); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                <span>📷</span> Masuk ke Photography: The Moment Archive
              </button>
              <button type="button" class="btn-enter-pinwheel-vision" id="btn-enter-pinwheel-vision"
                style="width:100%; padding:11px 16px; border-radius:12px; background:linear-gradient(135deg, #6366f1, #a855f7); color:#ffffff; font-weight:700; font-size:0.9rem; border:1px solid rgba(255,255,255,0.25); box-shadow:0 6px 20px rgba(99,102,241,0.35); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                <span>🎨</span> Masuk ke Vision Studio: The Creative Atelier
              </button>
            </div>`;
  html = html.slice(0, insertPos) + btnHtml + html.slice(insertPos);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('✓ Successfully inserted buttons into pinwheel-studio-modal!');
} else {
  console.log('Already inserted or target not found');
}

