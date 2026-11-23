const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const regex = /(<div\s+class="modal-actions-row">[\s\S]*?<button\s+type="submit"\s+class="btn-modal-submit">Kirim Undangan Meeting ✦<\/button>)/;
const match = regex.exec(html);

if (match) {
  const replacement = `<div class="input-field-group">
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
            </div>\n\n            ` + match[1];

  html = html.replace(match[0], replacement);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('✓ Successfully injected orbit-participants-select-grid into index.html');
} else {
  console.log('Regex did not match');
}
