// scratch/insert_studio_html.cjs
const fs = require('fs');

const indexHtmlPath = 'index.html';
let content = fs.readFileSync(indexHtmlPath, 'utf8');

// 1. Add link stylesheet pinwheel_studio.css if not present
if (!content.includes('pinwheel_studio.css')) {
  content = content.replace(
    '<link rel="stylesheet" href="/pinwheel_gazebo.css">',
    '<link rel="stylesheet" href="/pinwheel_gazebo.css">\n  <link rel="stylesheet" href="/pinwheel_studio.css">'
  );
  console.log('✓ Added pinwheel_studio.css link to <head>');
}

// 2. Update #pinwheel-studio-modal to have two gateway buttons
const oldStudioModalTarget = `<div class="pinwheel-modal-overlay" id="pinwheel-studio-modal" role="dialog" aria-modal="true"
          aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">📷</span>
                <div>
                  <span class="pinwheel-modal-tag">KREASI KONTEN &amp; FOTO</span>
                  <h3 class="pinwheel-modal-title">Photography &amp; Video Studio</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-studio-modal"
                aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Studio kreatif tepi danau dengan pencahayaan profesional, kamera sinematik, dan latar belakang pemandangan
              air terjun yang memesona.
            </p>
          </div>
        </div>`;

const newStudioModalReplacement = `<div class="pinwheel-modal-overlay" id="pinwheel-studio-modal" role="dialog" aria-modal="true"
          aria-hidden="true">
          <div class="pinwheel-modal-card">
            <div class="pinwheel-modal-header">
              <div class="pinwheel-modal-header-left">
                <span class="pinwheel-modal-icon-badge">📷</span>
                <div>
                  <span class="pinwheel-modal-tag">KREASI KONTEN &amp; FOTO</span>
                  <h3 class="pinwheel-modal-title">Photography &amp; Video Studio</h3>
                </div>
              </div>
              <button type="button" class="pinwheel-modal-close-btn" id="btn-close-studio-modal"
                aria-label="Tutup">✕</button>
            </div>
            <p style="color:#cbd5e1; font-size:0.86rem; line-height:1.5;">
              Studio kreatif tepi danau dengan pencahayaan profesional, kamera sinematik, dan latar belakang pemandangan
              air terjun yang memesona.
            </p>
            <div style="margin-top:14px; padding-top:12px; border-top:1px solid rgba(192, 132, 252, 0.25); display:flex; flex-direction:column; gap:10px;">
              <button type="button" class="btn-enter-pinwheel-photo" id="btn-enter-pinwheel-photo"
                style="width:100%; padding:11px 16px; border-radius:12px; background:linear-gradient(135deg, #a855f7, #ec4899); color:#ffffff; font-weight:700; font-size:0.9rem; border:1px solid rgba(255,255,255,0.25); box-shadow:0 6px 20px rgba(168,85,247,0.35); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                <span>📷</span> Masuk ke Photography: The Moment Archive
              </button>
              <button type="button" class="btn-enter-pinwheel-vision" id="btn-enter-pinwheel-vision"
                style="width:100%; padding:11px 16px; border-radius:12px; background:linear-gradient(135deg, #6366f1, #a855f7); color:#ffffff; font-weight:700; font-size:0.9rem; border:1px solid rgba(255,255,255,0.25); box-shadow:0 6px 20px rgba(99,102,241,0.35); cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px;">
                <span>🎨</span> Masuk ke Vision Studio: The Creative Atelier
              </button>
            </div>
          </div>
        </div>`;

if (content.includes('id="pinwheel-studio-modal"') && !content.includes('id="btn-enter-pinwheel-photo"')) {
  content = content.replace(oldStudioModalTarget, newStudioModalReplacement);
  console.log('✓ Updated #pinwheel-studio-modal with enter buttons');
}

// 3. Insert view-pinwheel-photography and view-pinwheel-vision-studio
const studioViewsHtml = `
      <!-- ============================================== -->
      <!-- VIEW: PINWHEEL — PHOTOGRAPHY: THE MOMENT ARCHIVE -->
      <!-- ============================================== -->
      <section class="view-section view-pinwheel-photography" id="view-pinwheel-photography"
        aria-label="Photography — The Moment Archive (Syma's Pinwheel)" aria-hidden="true">

        <div class="studio-backdrop-glow" aria-hidden="true"></div>

        <!-- Top Header -->
        <header class="studio-top-header">
          <div class="studio-header-left">
            <button type="button" class="btn-studio-back" id="btn-pinwheel-photo-back" aria-label="Kembali ke PINWHEEL">
              ← Kembali ke PINWHEEL
            </button>
            <div class="studio-identity">
              <span class="studio-identity-title">PHOTOGRAPHY · THE MOMENT ARCHIVE</span>
              <span class="studio-identity-sub">"Every little moment deserves to be remembered."</span>
            </div>
          </div>

          <div class="studio-header-center">
            <button type="button" class="studio-tab-btn active" id="tab-photo-camera">
              📷 Photo Mode
            </button>
            <button type="button" class="studio-tab-btn" id="tab-photo-album">
              🖼️ Photo Album
            </button>
          </div>

          <div class="studio-header-right">
            <button type="button" class="btn-studio-switch" id="btn-photo-switch-atelier" title="Buka Vision Studio">
              🎨 Buka Vision Studio →
            </button>
          </div>
        </header>

        <!-- PANEL 1: CAMERA & PHOTO MODE -->
        <main class="studio-panel active" id="panel-photo-camera">
          <!-- Left: Camera Viewfinder Stage -->
          <div class="photo-camera-column">
            <div class="photo-viewfinder-stage portrait" id="photo-viewfinder-stage">
              <img id="photo-bg-scenery" class="photo-bg-scenery" src="/assets/pinwheel_world_bg.jpg" alt="Scenery Background" />
              <div class="photo-scenery-unavailable-badge" id="photo-scenery-unavailable-badge"></div>
              <img id="photo-char-sprite" class="photo-char-sprite" src="/assets/portrait_abil_hd.jpg" alt="Syma" />
              <div class="photo-viewfinder-frame frame-sakura" id="photo-viewfinder-frame"></div>
              <div class="photo-timer-countdown" id="photo-timer-countdown">3</div>
            </div>

            <!-- Viewfinder HUD Controls -->
            <div class="photo-camera-hud">
              <!-- Orientation Pill Selector -->
              <div class="photo-hud-tool">
                <span>Orientasi</span>
                <div class="photo-orientation-pills">
                  <button type="button" class="photo-orientation-pill active" data-orientation="portrait">Portrait</button>
                  <button type="button" class="photo-orientation-pill" data-orientation="landscape">Landscape</button>
                </div>
              </div>

              <!-- Shutter Capture Button -->
              <button type="button" class="btn-photo-capture" id="btn-photo-capture" title="Ambil Foto">
                📷
              </button>

              <!-- Timer Selector -->
              <div class="photo-hud-tool">
                <span>Timer</span>
                <select id="select-photo-timer" class="vision-input-text" style="padding: 3px 8px; font-size: 0.76rem;">
                  <option value="0">Off (Langsung)</option>
                  <option value="3">3 Detik</option>
                  <option value="5">5 Detik</option>
                  <option value="10">10 Detik</option>
                </select>
              </div>

              <!-- Zoom Slider -->
              <div class="photo-hud-tool">
                <span>Zoom: <strong id="text-photo-zoom-val" style="color: #fbcfe8;">1.0x</strong></span>
                <input type="range" id="slider-photo-zoom" min="0.8" max="2.0" step="0.1" value="1.0" style="width: 80px;" />
              </div>
            </div>
          </div>

          <!-- Right: Sidebar Studio Controls -->
          <div class="photo-controls-column">
            <!-- Scenery Selection -->
            <section class="photo-control-section">
              <div class="photo-control-title">
                <span>🏔️ Pilihan Latar Belakang (Scenery)</span>
              </div>
              <div class="photo-sceneries-grid" id="photo-sceneries-list"></div>
            </section>

            <!-- Pose & Expression Selection -->
            <section class="photo-control-section">
              <div class="photo-control-title">
                <span>🦊 Pose &amp; Ekspresi Karakter Syma</span>
              </div>
              <div class="photo-sceneries-grid" id="photo-poses-list"></div>
            </section>

            <!-- Frames Selection -->
            <section class="photo-control-section">
              <div class="photo-control-title">
                <span>🖼️ Pilihan Bingkai (Photo Frame)</span>
              </div>
              <div class="photo-chips-scroll" id="photo-frames-list"></div>
            </section>

            <!-- Filters Selection -->
            <section class="photo-control-section">
              <div class="photo-control-title">
                <span>✨ Nuansa Cahaya (Filter)</span>
              </div>
              <div class="photo-chips-scroll" id="photo-filters-list"></div>
            </section>
          </div>
        </main>

        <!-- PANEL 2: PHOTO ALBUM -->
        <main class="studio-panel" id="panel-photo-album">
          <div class="photo-album-header-bar">
            <div class="photo-album-tabs">
              <button type="button" class="photo-album-tab active" data-album-cat="All Photos">All Photos</button>
              <button type="button" class="photo-album-tab" data-album-cat="Favorites">Favorites ⭐</button>
              <button type="button" class="photo-album-tab" data-album-cat="Special Moments">Special Moments 🌸</button>
            </div>
            <div style="font-size: 0.8rem; color: #cbd5e1;">
              Koleksi foto eksklusif semesta PINWHEEL milik Syma
            </div>
          </div>

          <div class="photo-album-grid" id="photo-album-grid"></div>

          <div class="photo-album-empty" id="photo-album-empty" style="display: none;">
            <span>📷</span>
            <h3 style="color: #ffffff; margin: 0;">Album Foto Masih Kosong</h3>
            <p>Ambil foto pertamamu di Photo Mode untuk mengabadikan keindahan PINWHEEL.</p>
          </div>
        </main>

        <!-- PREVIEW MODAL BEFORE SAVE -->
        <div class="studio-modal-backdrop" id="photo-preview-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="studio-modal-dialog">
            <div class="studio-modal-header">
              <h3>Preview Foto yang Ditangkap</h3>
              <button type="button" class="btn-studio-modal-close" id="btn-photo-preview-close">✕</button>
            </div>
            <div class="studio-modal-body">
              <div class="studio-preview-display">
                <img id="photo-preview-img" class="studio-preview-img" alt="Captured Preview" />
              </div>
              <div class="vision-form-group">
                <label for="photo-preview-title">Judul Foto:</label>
                <input type="text" id="photo-preview-title" class="vision-input-text" placeholder="Beri judul momen ini..." />
              </div>
              <div class="vision-form-group">
                <label for="photo-preview-caption">Keterangan (Caption):</label>
                <textarea id="photo-preview-caption" class="vision-textarea" placeholder="Tuliskan cerita singkat di balik foto ini..."></textarea>
              </div>
              <div class="vision-form-group">
                <label for="photo-preview-category">Kategori Album:</label>
                <select id="photo-preview-category" class="vision-input-text">
                  <option value="Special Moments">Special Moments 🌸</option>
                  <option value="Favorites">Favorites ⭐</option>
                  <option value="All Photos">General Memories 📷</option>
                </select>
              </div>
            </div>
            <div class="studio-modal-actions">
              <button type="button" class="btn-modal-action secondary" id="btn-photo-preview-download">💾 Unduh PNG</button>
              <button type="button" class="btn-modal-action save" id="btn-photo-preview-save">✨ Simpan ke Album</button>
            </div>
          </div>
        </div>

        <!-- LIGHTBOX MODAL FOR ALBUM -->
        <div class="studio-modal-backdrop" id="photo-lightbox-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="studio-modal-dialog">
            <div class="studio-modal-header">
              <h3 id="photo-lightbox-title">Detail Foto</h3>
              <button type="button" class="btn-studio-modal-close" id="btn-photo-lightbox-close">✕</button>
            </div>
            <div class="studio-modal-body">
              <div class="studio-preview-display">
                <img id="photo-lightbox-img" class="studio-preview-img" alt="Detail Foto" />
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span id="photo-lightbox-date" style="font-size: 0.8rem; color: #c084fc;"></span>
              </div>
              <p id="photo-lightbox-caption" style="font-size: 0.88rem; line-height: 1.6; color: #f1f5f9; margin: 0;"></p>
            </div>
            <div class="studio-modal-actions">
              <button type="button" class="btn-modal-action danger" id="btn-photo-lightbox-delete">🗑️ Hapus Foto</button>
              <button type="button" class="btn-modal-action secondary" id="btn-photo-lightbox-fav">⭐ Jadikan Favorit</button>
              <button type="button" class="btn-modal-action save" id="btn-photo-lightbox-download">💾 Unduh Foto (PNG)</button>
            </div>
          </div>
        </div>

      </section>

      <!-- ============================================== -->
      <!-- VIEW: PINWHEEL — VISION STUDIO: THE CREATIVE ATELIER -->
      <!-- ============================================== -->
      <section class="view-section view-pinwheel-vision-studio" id="view-pinwheel-vision-studio"
        aria-label="Vision Studio — The Creative Atelier (Syma's Pinwheel)" aria-hidden="true">

        <div class="studio-backdrop-glow" aria-hidden="true"></div>

        <!-- Top Header -->
        <header class="studio-top-header">
          <div class="studio-header-left">
            <button type="button" class="btn-studio-back" id="btn-pinwheel-vision-back" aria-label="Kembali ke PINWHEEL">
              ← Kembali ke PINWHEEL
            </button>
            <div class="studio-identity">
              <span class="studio-identity-title">VISION STUDIO · THE CREATIVE ATELIER</span>
              <span class="studio-identity-sub">"Create something beautiful, one little idea at a time."</span>
            </div>
          </div>

          <div class="studio-header-center">
            <button type="button" class="studio-tab-btn active" id="tab-vision-canvas">
              🎨 Digital Canvas
            </button>
            <button type="button" class="studio-tab-btn" id="tab-vision-editor">
              💌 Creative Editor
            </button>
            <button type="button" class="studio-tab-btn" id="tab-vision-gallery">
              🏛️ Creative Gallery
            </button>
          </div>

          <div class="studio-header-right">
            <button type="button" class="btn-studio-switch" id="btn-vision-switch-photo" title="Buka Photography Studio">
              📷 Buka Photography Studio →
            </button>
          </div>
        </header>

        <!-- PANEL 1: DIGITAL ART CANVAS -->
        <main class="studio-panel active" id="panel-vision-canvas">
          <!-- Left: Canvas Stage & Toolbar -->
          <div class="vision-canvas-column">
            <!-- Canvas Toolbar -->
            <div class="vision-canvas-toolbar">
              <button type="button" class="vision-tool-btn active" id="btn-tool-brush">🖌️ Brush</button>
              <button type="button" class="vision-tool-btn" id="btn-tool-eraser">🧹 Eraser</button>
              <button type="button" class="vision-tool-btn" id="btn-tool-undo" disabled>↩ Undo</button>
              <button type="button" class="vision-tool-btn" id="btn-tool-redo" disabled>↪ Redo</button>
              <button type="button" class="vision-tool-btn" id="btn-tool-clear">🗑️ Clear</button>

              <div style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #cbd5e1;">
                <span>Ukuran: <strong id="text-brush-size-val" style="color: #fbcfe8;">6px</strong></span>
                <input type="range" id="slider-brush-size" min="2" max="50" value="6" style="width: 70px;" />
              </div>

              <!-- Color Preview Indicator & Custom Color Picker -->
              <div style="display: flex; align-items: center; gap: 6px;">
                <div class="vision-color-preview" id="color-active-preview" style="background-color: #A855F7;"></div>
                <input type="color" id="input-custom-color" value="#A855F7" title="Pilih Warna Kustom"
                  style="width: 28px; height: 28px; border: none; border-radius: 6px; cursor: pointer; background: transparent;" />
              </div>

              <button type="button" class="vision-tool-btn" id="btn-vision-save" style="background: linear-gradient(135deg, #a855f7, #ec4899); color: #ffffff;">
                💾 Simpan Karya
              </button>
              <button type="button" class="vision-tool-btn" id="btn-vision-download">
                ⬇️ Unduh PNG
              </button>
            </div>

            <!-- Canvas Workspace Wrap -->
            <div class="vision-canvas-wrap" id="vision-canvas-wrap">
              <canvas id="vision-main-canvas" class="vision-main-canvas" width="800" height="600"></canvas>
              <div class="vision-elements-layer" id="vision-elements-layer"></div>
            </div>

            <!-- Canvas Format Preset Selectors -->
            <div style="display: flex; gap: 1rem; font-size: 0.78rem; color: #cbd5e1;">
              <div>
                <span>Ukuran Kanvas: </span>
                <select id="select-canvas-size" class="vision-input-text" style="padding: 3px 8px; font-size: 0.78rem;">
                  <option value="landscape" selected>Landscape (800 x 600)</option>
                  <option value="square">Square (800 x 800)</option>
                  <option value="portrait">Portrait (600 x 800)</option>
                  <option value="banner">Banner (960 x 540)</option>
                </select>
              </div>
              <div>
                <span>Warna Latar: </span>
                <select id="select-canvas-bg" class="vision-input-text" style="padding: 3px 8px; font-size: 0.78rem;">
                  <option value="#18122B" selected>Midnight Dark (#18122B)</option>
                  <option value="#2D1B4E">Lavender Mist (#2D1B4E)</option>
                  <option value="#0F172A">Deep Ocean (#0F172A)</option>
                  <option value="#FFFBEB">Soft Cream (#FFFBEB)</option>
                  <option value="#FFFFFF">Pure White (#FFFFFF)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Right: Color Lab & Stickers Sidebar -->
          <div class="vision-sidebar-column">
            <!-- Color Lab Panel -->
            <section class="vision-sidebar-card">
              <div class="vision-sidebar-title">
                <span>🎨 Color Lab — Palet Warna PINWHEEL</span>
              </div>
              <div id="vision-palettes-container"></div>
            </section>

            <!-- Stickers & Decoration Library -->
            <section class="vision-sidebar-card">
              <div class="vision-sidebar-title">
                <span>✨ Koleksi Stiker &amp; Ornamen Fantasi</span>
              </div>
              <div class="vision-stickers-grid" id="vision-stickers-container"></div>
            </section>
          </div>
        </main>

        <!-- PANEL 2: CREATIVE EDITOR (TEMPLATES) -->
        <main class="studio-panel" id="panel-vision-editor">
          <div class="vision-templates-grid" id="vision-templates-container"></div>

          <div class="vision-editor-form-col">
            <h4 style="margin: 0 0 0.5rem 0; font-size: 1.05rem; color: #ffffff;">Kustomisasi Template</h4>
            <div class="vision-form-group">
              <label for="input-editor-headline">Judul / Headline:</label>
              <input type="text" id="input-editor-headline" class="vision-input-text" value="Warm Wishes from PINWHEEL" />
            </div>
            <div class="vision-form-group">
              <label for="input-editor-body">Isi Pesan / Kutipan:</label>
              <textarea id="input-editor-body" class="vision-textarea">May gentle winds carry peace, hope, and joy into your days.</textarea>
            </div>
            <div class="vision-form-group">
              <label for="input-editor-sub">Keterangan / Tanda Tangan:</label>
              <input type="text" id="input-editor-sub" class="vision-input-text" value="— Syma · PINWHEEL" />
            </div>
            <button type="button" class="btn-apply-template" id="btn-apply-template">
              ✨ Terapkan ke Kanvas Studio
            </button>
          </div>
        </main>

        <!-- PANEL 3: CREATIVE GALLERY -->
        <main class="studio-panel" id="panel-vision-gallery">
          <div class="vision-gallery-header-bar">
            <div class="vision-gallery-tabs">
              <button type="button" class="vision-gallery-tab active" data-gallery-cat="All Artworks">All Artworks</button>
              <button type="button" class="vision-gallery-tab" data-gallery-cat="Digital Art">Digital Art 🖌️</button>
              <button type="button" class="vision-gallery-tab" data-gallery-cat="Posters">Posters 📜</button>
              <button type="button" class="vision-gallery-tab" data-gallery-cat="Greeting Cards">Greeting Cards 💌</button>
              <button type="button" class="vision-gallery-tab" data-gallery-cat="Scrapbook">Scrapbook 📔</button>
              <button type="button" class="vision-gallery-tab" data-gallery-cat="Photo Collage">Photo Collage 🎞️</button>
            </div>
            <div style="font-size: 0.8rem; color: #cbd5e1;">
              Galeri karya seni visual dan kreasi digital Syma
            </div>
          </div>

          <div class="vision-gallery-grid" id="vision-gallery-grid"></div>

          <div class="vision-gallery-empty" id="vision-gallery-empty" style="display: none;">
            <span>🎨</span>
            <h3 style="color: #ffffff; margin: 0;">Galeri Masih Kosong</h3>
            <p>Mulai menggambar atau gunakan Creative Editor untuk membuat karya pertamamu.</p>
          </div>
        </main>

        <!-- LIGHTBOX MODAL FOR ARTWORK -->
        <div class="studio-modal-backdrop" id="vision-art-lightbox-modal" role="dialog" aria-modal="true" aria-hidden="true">
          <div class="studio-modal-dialog">
            <div class="studio-modal-header">
              <h3 id="vision-art-lightbox-title">Karya Seni Syma</h3>
              <button type="button" class="btn-studio-modal-close" id="btn-art-lightbox-close">✕</button>
            </div>
            <div class="studio-modal-body">
              <div class="studio-preview-display">
                <img id="vision-art-lightbox-img" class="studio-preview-img" alt="Artwork Preview" />
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span id="vision-art-lightbox-cat" class="vision-card-category-badge" style="position: static;"></span>
                <span id="vision-art-lightbox-date" style="font-size: 0.8rem; color: #cbd5e1;"></span>
              </div>
            </div>
            <div class="studio-modal-actions">
              <button type="button" class="btn-modal-action danger" id="btn-art-lightbox-delete">🗑️ Hapus Karya</button>
              <button type="button" class="btn-modal-action secondary" id="btn-art-lightbox-rename">✏️ Ubah Judul</button>
              <button type="button" class="btn-modal-action secondary" id="btn-art-lightbox-edit">🎨 Lanjutkan Editing</button>
              <button type="button" class="btn-modal-action save" id="btn-art-lightbox-download">💾 Unduh Karya (PNG)</button>
            </div>
          </div>
        </div>

      </section>
`;

const marker = "<!-- VIEW: YAWN — AKHIRA'S UNIVERSE";
const idx = content.indexOf(marker);

if (idx !== -1 && !content.includes('id="view-pinwheel-photography"')) {
  // Find preceding </section>
  const precedingSectionClose = content.lastIndexOf('</section>', idx);
  if (precedingSectionClose !== -1) {
    const insertPos = precedingSectionClose + '</section>'.length;
    content = content.slice(0, insertPos) + '\n\n' + studioViewsHtml + '\n\n' + content.slice(insertPos);
    console.log('✓ Inserted view-pinwheel-photography and view-pinwheel-vision-studio sections cleanly at', insertPos);
  }
} else {
  console.log('Marker condition not met: idx =', idx, 'already included =', content.includes('id="view-pinwheel-photography"'));
}

fs.writeFileSync(indexHtmlPath, content, 'utf8');
console.log('Successfully updated index.html!');
