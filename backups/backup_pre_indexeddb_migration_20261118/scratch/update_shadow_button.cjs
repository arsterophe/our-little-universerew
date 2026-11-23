const fs = require('fs');

let s = fs.readFileSync('index.html', 'utf8');
const target = '<div class="gazebo-table-tea-indicator" id="gazebo-table-tea-indicator">';
const idx = s.indexOf(target);
console.log('Index in index.html:', idx);

if (idx !== -1) {
  const endTag = '</div>';
  const endIdx = s.indexOf(endTag, idx);
  const oldSub = s.substring(idx, endIdx + endTag.length);
  const replacement = `<div style="display: flex; align-items: center; gap: 0.85rem; pointer-events: auto;">
            ${oldSub}
            <button type="button" class="btn-gazebo-songs-we-share" id="btn-gazebo-songs-we-share" aria-label="Buka Songs We Share">
              <span>🎵</span> Songs We Share
            </button>
          </div>`;
  s = s.substring(0, idx) + replacement + s.substring(endIdx + endTag.length);
  fs.writeFileSync('index.html', s, 'utf8');
  console.log('Successfully added Songs We Share button to view-shadow-gazebo in index.html');
} else {
  console.warn('Target not found in index.html');
}
