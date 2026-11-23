const fs = require('fs');

const path = 'index.html';
let content = fs.readFileSync(path, 'utf8');

// 1. Top Bar subtitle & notification bell
const topBarTarget = `          <div class="orbit-brand-group">
            <div class="orbit-brand-title-row">
              <span class="orbit-icon-planet" aria-hidden="true">🪐</span>
              <h1 class="orbit-main-title">OUR LITTLE ORBIT</h1>
            </div>
            <p class="orbit-subtitle">Three little worlds, one shared time.</p>
          </div>

          <div class="orbit-top-actions">
            <!-- Active Perspective Badge -->
            <div class="user-viewing-badge" id="orbit-user-badge">
              <span class="badge-dot"></span>
              <span>Melihat sebagai: <strong id="orbit-viewer-name">Nyanya</strong></span>
            </div>

            <!-- Cloud Firestore Sync Badge -->`;

const topBarReplacement = `          <div class="orbit-brand-group">
            <div class="orbit-brand-title-row">
              <span class="orbit-icon-planet" aria-hidden="true">🪐</span>
              <h1 class="orbit-main-title">OUR LITTLE ORBIT</h1>
            </div>
            <p class="orbit-subtitle">Eight little worlds, one shared time.</p>
          </div>

          <div class="orbit-top-actions">
            <!-- Active Perspective Badge -->
            <div class="user-viewing-badge" id="orbit-user-badge">
              <span class="badge-dot"></span>
              <span>Melihat sebagai: <strong id="orbit-viewer-name">Nyanya</strong></span>
            </div>

            <!-- Orbit Meeting Notifications Bell -->
            <button type="button" class="btn-orbit-notifications" id="btn-orbit-notifications"
              aria-label="Notifikasi Meeting Orbit" title="Notifikasi Undangan Meeting Orbit">
              <span class="bell-icon">🔔</span>
              <span class="orbit-notif-badge" id="orbit-notif-count-badge" style="display: none;">0</span>
            </button>

            <!-- Cloud Firestore Sync Badge -->`;

// Handle CRLF vs LF
function replaceFlexible(str, target, replacement) {
  const normStr = str.replace(/\r\n/g, '\n');
  const normTarget = target.replace(/\r\n/g, '\n');
  const normRepl = replacement.replace(/\r\n/g, '\n');
  if (!normStr.includes(normTarget)) {
    throw new Error('Target string not found in index.html');
  }
  return normStr.replace(normTarget, normRepl);
}

content = replaceFlexible(content, topBarTarget, topBarReplacement);

// 2. Add selective participant selector to #form-propose-meeting
const formTarget = `            <div class="input-field-group">
              <label for="meeting-loc-input" class="input-label">Platform Meeting</label>
              <input type="text" id="meeting-loc-input" class="form-input"
                placeholder="Contoh: Google Meet, Discord Voice, Zoom..." value="Google Meet" />
            </div>

            <div class="input-field-group">
              <label for="meeting-desc-input" class="input-label">Deskripsi & Catatan Undangan</label>`;

const formReplacement = `            <div class="input-field-group">
              <label for="meeting-loc-input" class="input-label">Platform Meeting</label>
              <input type="text" id="meeting-loc-input" class="form-input"
                placeholder="Contoh: Google Meet, Discord Voice, Zoom..." value="Google Meet" />
            </div>

            <!-- Selective Meeting Participants Selector -->
            <div class="input-field-group">
              <div class="participant-select-header">
                <label class="input-label" style="margin-bottom: 0;">Pilih Peserta Meeting yang Diundang *</label>
                <div class="participant-select-quick-actions">
                  <button type="button" class="btn-select-action" id="btn-select-all-participants">Pilih Semua</button>
                  <button type="button" class="btn-select-action" id="btn-clear-all-participants">Bersihkan</button>
                </div>
              </div>
              <p class="input-hint" style="font-size: 0.76rem; color: #cbd5e1; margin-top: 0.25rem; margin-bottom: 0.6rem;">
                Undangan & notifikasi hanya akan dikirimkan kepada karakter yang Anda pilih di bawah ini:
              </p>
              <div class="orbit-participants-select-grid" id="orbit-participants-select-grid">
                <!-- Populated dynamically by orbit_view.js -->
              </div>
              <div class="participant-selection-counter" id="participant-selection-counter">
                <span>Peserta terpilih: <strong id="selected-participants-count" style="color: #60a5fa;">0</strong> sahabat</span>
              </div>
            </div>

            <div class="input-field-group">
              <label for="meeting-desc-input" class="input-label">Deskripsi & Catatan Undangan</label>`;

content = replaceFlexible(content, formTarget, formReplacement);

// 3. Add modal #modal-orbit-notifications right after modal #modal-propose-alt
const modalTarget = `            <div class="modal-actions-row">
              <button type="button" class="btn-modal-cancel" data-close-modal>Batal</button>
              <button type="submit" class="btn-modal-submit"
                style="background: linear-gradient(135deg, #7c3aed, #a855f7);">Kirim Usulan Waktu ✦</button>
            </div>
          </form>
        </div>
      </div>`;

const modalReplacement = `            <div class="modal-actions-row">
              <button type="button" class="btn-modal-cancel" data-close-modal>Batal</button>
              <button type="submit" class="btn-modal-submit"
                style="background: linear-gradient(135deg, #7c3aed, #a855f7);">Kirim Usulan Waktu ✦</button>
            </div>
          </form>
        </div>
      </div>

      <!-- 6. MODAL: NOTIFIKASI MEETING ORBIT -->
      <div class="orbit-modal-overlay" id="modal-orbit-notifications" role="dialog" aria-modal="true"
        aria-labelledby="title-orbit-notifications">
        <div class="orbit-modal-card" style="max-width: 520px;">
          <div class="modal-header-row">
            <div class="modal-title-group">
              <span class="modal-symbol" style="color: #60a5fa;">🔔</span>
              <h3 class="modal-title" id="title-orbit-notifications">Notifikasi Meeting Orbit</h3>
            </div>
            <button type="button" class="btn-close-modal" data-close-modal aria-label="Tutup modal">✕</button>
          </div>

          <div class="orbit-notifications-modal-body">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; padding-bottom: 0.5rem; border-bottom: 1px solid rgba(255,255,255,0.08);">
              <span style="font-size: 0.78rem; color: #c4b5fd;" id="notif-viewer-info">Notifikasi untuk karakter aktif</span>
              <button type="button" class="btn-select-action" id="btn-mark-all-notifs-read">Tandai Semua Dibaca</button>
            </div>
            <div class="orbit-notifications-list" id="orbit-notifications-list">
              <!-- Dynamically rendered notification cards -->
            </div>
          </div>

          <div class="modal-actions-row">
            <button type="button" class="btn-modal-cancel" data-close-modal>Tutup</button>
          </div>
        </div>
      </div>`;

content = replaceFlexible(content, modalTarget, modalReplacement);

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully updated index.html for Orbit equal access & selective invitations!');

