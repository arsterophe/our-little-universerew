import fs from 'fs';

const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Add CSS in head
if (!html.includes('/fairy_atelier.css')) {
  html = html.replace('<link rel="stylesheet" href="/toyou_behind.css">', '<link rel="stylesheet" href="/toyou_behind.css">\n  <link rel="stylesheet" href="/fairy_atelier.css">');
  console.log('Added /fairy_atelier.css to <head>');
}

// 2. Add Fairy Atelier Section markup
const fairyAtelierMarkup = `
      <!-- ================================================================= -->
      <!-- THE FAIRY ATELIER — LALA (TO YOU) FASHION BOUTIQUE & STUDIO       -->
      <!-- ================================================================= -->
      <section class="view-fairy-atelier" id="view-fairy-atelier"
        aria-label="The Fairy Atelier — Lala (TO YOU) Enchanted Fashion Boutique & Design Simulator"
        aria-hidden="true">

        <div class="atelier-backdrop" aria-hidden="true"></div>
        <div class="atelier-sparkle-overlay" aria-hidden="true"></div>

        <!-- Top Header Bar -->
        <header class="atelier-top-header">
          <div class="atelier-header-left">
            <button type="button" class="btn-atelier-back" id="btn-fairy-atelier-back" aria-label="Kembali ke TO YOU">
              ← Kembali ke TO YOU
            </button>
            <div class="atelier-brand">
              <span class="atelier-title">THE FAIRY ATELIER 👗✨</span>
              <span class="atelier-subtitle">Enchanted Fairy Fashion Boutique & Design Simulator · TO YOU</span>
            </div>
          </div>

          <!-- Main Nav Tabs -->
          <nav class="atelier-nav-tabs" aria-label="Navigasi Atelier">
            <button type="button" class="atelier-tab-btn active" id="tab-atelier-wardrobe">
              👗 Wardrobe
            </button>
            <button type="button" class="atelier-tab-btn" id="tab-atelier-dressing-room">
              🪞 Dressing Room
            </button>
            <button type="button" class="atelier-tab-btn" id="tab-atelier-accessories">
              🧚‍♀️ Wings &amp; Aksesori
            </button>
            <button type="button" class="atelier-tab-btn" id="tab-atelier-designer-corner">
              🎨 Designer's Corner
            </button>
            <button type="button" class="atelier-tab-btn" id="tab-atelier-lookbook">
              📖 My Lookbook
            </button>
            <button type="button" class="atelier-tab-btn" id="tab-atelier-seasonal">
              🌸 Seasonal
            </button>
          </nav>

          <!-- Current User identity badge -->
          <div class="atelier-header-right">
            <div class="atelier-current-user-tag">
              <img src="/assets/avatar_lala_hd.png" alt="Lala" class="atelier-avatar-thumb" />
              <span>Lala · The Everglow Fairy</span>
            </div>
          </div>
        </header>

        <!-- Main Stage Container -->
        <div class="atelier-stage">

          <!-- 1. FAIRY WARDROBE PANEL -->
          <main class="atelier-panel active" id="panel-atelier-wardrobe">
            <div class="atelier-section-header">
              <div class="atelier-section-title-wrap">
                <span class="atelier-section-title">👗 Fairy Wardrobe — Koleksi Busana Peri Lala</span>
                <span class="atelier-section-desc">Pilih dan coba berbagai gaun, atasan, rok berenda, dan busana peri beraroma mawar.</span>
              </div>
            </div>

            <div class="wardrobe-container">
              <!-- Category Sidebar -->
              <aside class="wardrobe-category-sidebar" id="wardrobe-cat-sidebar"></aside>

              <!-- Items Content Area -->
              <section class="wardrobe-content-area">
                <div class="wardrobe-items-grid" id="wardrobe-items-grid"></div>
              </section>
            </div>
          </main>

          <!-- 2. MAGIC DRESSING ROOM PANEL -->
          <main class="atelier-panel" id="panel-atelier-dressing-room">
            <div class="atelier-section-header">
              <div class="atelier-section-title-wrap">
                <span class="atelier-section-title">🪞 Magic Dressing Room — Cermin Ajaib Paduan Gaya</span>
                <span class="atelier-section-desc">Padukan busana peri impianmu dan lihat hasilnya langsung pada cermin megah Lala.</span>
              </div>
            </div>

            <div class="dressing-room-layout">
              <!-- Mirror & Avatar Live Preview -->
              <div class="dressing-mirror-stage">
                <div class="fairy-mirror-frame">
                  <div class="mirror-shimmer-top"></div>
                  <div class="avatar-preview-canvas-wrap">
                    <img src="/assets/card_lala_hd_2x.png" alt="Lala Avatar" class="avatar-character-art" id="dressing-avatar-img" />
                    <div class="avatar-wings-glow" id="dressing-wings-glow"></div>
                  </div>
                  <div class="avatar-active-badges" id="dressing-active-badges"></div>
                </div>
              </div>

              <!-- Dressing Controls Column -->
              <div class="dressing-controls-col">
                <div class="dressing-slots-card">
                  <div style="font-size: 0.96rem; font-weight: 700; color: #831843; margin-bottom: 4px;">
                    ✨ Item yang Sedang Dikenakan:
                  </div>
                  <div id="dressing-slots-list" style="display: flex; flex-direction: column; gap: 6px;"></div>
                </div>

                <div class="dressing-action-buttons">
                  <button type="button" class="atelier-btn-primary" id="btn-dressing-apply">
                    ✨ Terapkan Outfit (Apply Outfit)
                  </button>
                  <button type="button" class="atelier-btn-secondary" id="btn-dressing-save-lookbook">
                    📖 Simpan ke My Lookbook (Save Outfit)
                  </button>
                  <button type="button" class="atelier-btn-secondary" id="btn-dressing-reset" style="color: #64748b;">
                    ↺ Kembalikan ke Standar (Reset)
                  </button>
                </div>
              </div>
            </div>
          </main>

          <!-- 3. WINGS & ACCESSORIES PANEL -->
          <main class="atelier-panel" id="panel-atelier-accessories">
            <div class="atelier-section-header">
              <div class="atelier-section-title-wrap">
                <span class="atelier-section-title">🧚‍♀️ Wings &amp; Accessories — Koleksi Sayap &amp; Perhiasan Peri</span>
                <span class="atelier-section-desc">Lengkapi gayamu dengan sayap berkilau emas, mahkota bunga segar, jepit kupu-kupu, dan permata embun.</span>
              </div>
            </div>

            <div class="accessories-layout">
              <aside class="wardrobe-category-sidebar" id="accessories-cat-sidebar"></aside>
              <section class="wardrobe-content-area">
                <div class="wardrobe-items-grid" id="accessories-items-grid"></div>
              </section>
            </div>
          </main>

          <!-- 4. DESIGNER'S CORNER PANEL (RUANG DESAIN PRIBADI LALA) -->
          <main class="atelier-panel" id="panel-atelier-designer-corner">
            <div class="designer-corner-wrapper">
              <!-- Sub-navigation Bar -->
              <div class="designer-subnav-bar">
                <button type="button" class="designer-subnav-btn active" data-subtab="sketchbook">
                  📝 Fashion Sketchbook
                </button>
                <button type="button" class="designer-subnav-btn" data-subtab="inspiration_board">
                  📌 Inspiration Board
                </button>
                <button type="button" class="designer-subnav-btn" data-subtab="fabric_library">
                  🧵 Fabric &amp; Color Library
                </button>
                <button type="button" class="designer-subnav-btn" data-subtab="mannequin_studio">
                  👗 Mannequin Studio
                </button>
                <button type="button" class="designer-subnav-btn" data-subtab="portfolio">
                  📁 My Fashion Portfolio
                </button>
              </div>

              <!-- 4.A FASHION SKETCHBOOK SUBPANEL -->
              <div class="designer-subpanel active" id="subpanel-designer-sketchbook">
                <div class="sketchbook-stage">
                  <!-- Tools Column -->
                  <div class="sketchbook-tools-column">
                    <div>
                      <div class="tool-group-label">Alat Gambar</div>
                      <div style="display: flex; gap: 6px;">
                        <button type="button" class="atelier-btn-primary" id="btn-sketch-brush" style="flex: 1; padding: 6px;">🖌️ Brush</button>
                        <button type="button" class="atelier-btn-secondary" id="btn-sketch-eraser" style="flex: 1; padding: 6px;">🧹 Hapus</button>
                      </div>
                    </div>

                    <div>
                      <div class="tool-group-label">Ukuran Kuas</div>
                      <div class="brush-sizes-row">
                        <button type="button" class="btn-brush-size" data-size="2">Halus<span>2px</span></button>
                        <button type="button" class="btn-brush-size active" data-size="6">Sedang<span>6px</span></button>
                        <button type="button" class="btn-brush-size" data-size="14">Tebal<span>14px</span></button>
                        <button type="button" class="btn-brush-size" data-size="28">Kuas<span>28px</span></button>
                      </div>
                    </div>

                    <div>
                      <div class="tool-group-label">Pilihan Warna Pastel</div>
                      <div class="color-palette-grid">
                        <button type="button" class="btn-color-swatch active" data-color="#f472b6" style="background:#f472b6;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#fbcfe8" style="background:#fbcfe8;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#fef08a" style="background:#fef08a;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#fed7aa" style="background:#fed7aa;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#a7f3d0" style="background:#a7f3d0;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#6ee7b7" style="background:#6ee7b7;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#bae6fd" style="background:#bae6fd;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#e9d5ff" style="background:#e9d5ff;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#c084fc" style="background:#c084fc;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#f43f5e" style="background:#f43f5e;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#78350f" style="background:#78350f;"></button>
                        <button type="button" class="btn-color-swatch" data-color="#0f172a" style="background:#0f172a;"></button>
                      </div>
                      <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                        <span style="font-size: 0.78rem; color: #64748b;">Kustom:</span>
                        <input type="color" id="input-custom-brush-color" value="#f472b6" style="width: 32px; height: 32px; border: none; cursor: pointer; border-radius: 6px; background: transparent;" />
                      </div>
                    </div>

                    <div>
                      <div class="tool-group-label">Template Figur (Croquis)</div>
                      <select id="select-croquis-template" class="atelier-select" style="font-size: 0.8rem; padding: 6px 10px;">
                        <option value="croquis_fairy_standard">🧍‍♀️ Standard Fairy Croquis</option>
                        <option value="croquis_ballgown_flare">👗 Ballgown Flare Silhouette</option>
                        <option value="croquis_ethereal_wings">🧚‍♀️ Winged Fairy Pose</option>
                        <option value="croquis_none">⬜ Blank Canvas (Freeform)</option>
                      </select>
                    </div>

                    <div style="margin-top: auto; display: flex; flex-direction: column; gap: 6px;">
                      <button type="button" class="atelier-btn-primary" id="btn-sketch-save">💾 Simpan Sketsa</button>
                      <button type="button" class="atelier-btn-secondary" id="btn-sketch-export-png">⬇️ Ekspor PNG</button>
                      <button type="button" class="atelier-btn-secondary" id="btn-sketch-new-page" style="color: #64748b;">📄 Halaman Baru</button>
                    </div>
                  </div>

                  <!-- Canvas Column -->
                  <div class="sketchbook-canvas-column">
                    <div class="sketch-canvas-header-bar">
                      <div style="display: flex; gap: 6px;">
                        <button type="button" class="atelier-btn-secondary" id="btn-sketch-undo" style="padding: 4px 10px; font-size: 0.78rem;">↩ Undo</button>
                        <button type="button" class="atelier-btn-secondary" id="btn-sketch-redo" style="padding: 4px 10px; font-size: 0.78rem;">↪ Redo</button>
                        <button type="button" class="atelier-btn-secondary" id="btn-sketch-clear" style="padding: 4px 10px; font-size: 0.78rem; color: #ef4444;">🗑️ Clear</button>
                      </div>
                      <div style="display: flex; gap: 6px; align-items: center;">
                        <span style="font-size: 0.76rem; color: #64748b;">Zoom:</span>
                        <button type="button" class="atelier-btn-secondary" id="btn-sketch-zoom-out" style="padding: 3px 8px; font-size: 0.76rem;">-</button>
                        <button type="button" class="atelier-btn-secondary" id="btn-sketch-zoom-reset" style="padding: 3px 8px; font-size: 0.76rem;">100%</button>
                        <button type="button" class="atelier-btn-secondary" id="btn-sketch-zoom-in" style="padding: 3px 8px; font-size: 0.76rem;">+</button>
                      </div>
                    </div>

                    <div class="canvas-viewport-wrap">
                      <div id="sketch-canvas-zoom-target" style="position: relative; transition: transform 0.1s ease;">
                        <canvas id="atelier-drawing-canvas" width="650" height="520"></canvas>
                        <div class="croquis-guide-overlay" id="croquis-guide-overlay"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4.B INSPIRATION BOARD SUBPANEL -->
              <div class="designer-subpanel" id="subpanel-designer-board">
                <div class="moodboard-layout">
                  <div class="moodboard-toolbar">
                    <div style="font-size: 0.98rem; font-weight: 700; color: #831843;">
                      📌 <span id="moodboard-active-title">Papan Inspirasi Mode Peri</span>
                    </div>
                    <div style="display: flex; gap: 8px;">
                      <button type="button" class="atelier-btn-secondary" id="btn-board-add-note">📝 Tambah Catatan</button>
                      <button type="button" class="atelier-btn-secondary" id="btn-board-upload-img">🖼️ Unggah Foto Referensi</button>
                      <input type="file" id="input-board-file-upload" accept="image/*" style="display: none;" />
                      <button type="button" class="atelier-btn-primary" id="btn-board-new-board">✨ Papan Baru</button>
                    </div>
                  </div>

                  <div class="moodboard-canvas-stage" id="moodboard-canvas-stage"></div>
                </div>
              </div>

              <!-- 4.C FABRIC & COLOR LIBRARY SUBPANEL -->
              <div class="designer-subpanel" id="subpanel-designer-fabrics">
                <div style="display: flex; flex-direction: column; gap: 20px; overflow-y: auto; padding-right: 6px;">
                  <div>
                    <div style="font-size: 1rem; font-weight: 700; color: #831843; margin-bottom: 8px;">🧵 Tekstur Kain &amp; Material Peri</div>
                    <div class="fabrics-grid" id="fabrics-swatches-grid"></div>
                  </div>

                  <div>
                    <div style="font-size: 1rem; font-weight: 700; color: #831843; margin-bottom: 8px;">🌸 Motif &amp; Pola Fantasi</div>
                    <div class="fabrics-grid" id="motifs-swatches-grid"></div>
                  </div>

                  <div>
                    <div style="font-size: 1rem; font-weight: 700; color: #831843; margin-bottom: 8px;">🎨 Kombinasi Palet Warna Favorit</div>
                    <div class="fabrics-grid" id="palettes-swatches-grid"></div>
                  </div>
                </div>
              </div>

              <!-- 4.D MANNEQUIN STUDIO SUBPANEL -->
              <div class="designer-subpanel" id="subpanel-designer-mannequin">
                <div class="mannequin-layout">
                  <div class="mannequin-preview-stage" id="mannequin-render-stage"></div>

                  <div class="mannequin-controls-stage">
                    <div class="atelier-glass-card">
                      <div style="font-size: 1.05rem; font-weight: 700; color: #831843; margin-bottom: 12px;">
                        👗 Sesuaikan Rancangan Manekin
                      </div>

                      <div class="atelier-form-group">
                        <label class="atelier-form-label">Siluet Gaun</label>
                        <select id="mannequin-sel-silhouette" class="atelier-select">
                          <option value="ballgown">👗 Ballgown (Mekar Mengembang)</option>
                          <option value="a-line">👗 A-Line (Ramping Anggun)</option>
                          <option value="mermaid">🧜‍♀️ Mermaid (Berekor)</option>
                        </select>
                      </div>

                      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
                        <div class="atelier-form-group">
                          <label class="atelier-form-label">Warna Atasan</label>
                          <input type="color" id="mannequin-color-top" value="#fbcfe8" style="width: 100%; height: 38px; border: none; cursor: pointer; border-radius: 8px;" />
                        </div>
                        <div class="atelier-form-group">
                          <label class="atelier-form-label">Warna Rok</label>
                          <input type="color" id="mannequin-color-skirt" value="#f472b6" style="width: 100%; height: 38px; border: none; cursor: pointer; border-radius: 8px;" />
                        </div>
                      </div>

                      <div class="atelier-form-group" style="margin-top: 10px;">
                        <label class="atelier-form-label">Warna Aksen / Pita</label>
                        <input type="color" id="mannequin-color-accent" value="#fef08a" style="width: 100%; height: 38px; border: none; cursor: pointer; border-radius: 8px;" />
                      </div>

                      <div style="display: flex; gap: 14px; margin-top: 14px;">
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #334155; cursor: pointer;">
                          <input type="checkbox" id="mannequin-chk-wings" checked /> Tampilkan Sayap Peri
                        </label>
                        <label style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #334155; cursor: pointer;">
                          <input type="checkbox" id="mannequin-chk-crown" checked /> Mahkota Bunga
                        </label>
                      </div>

                      <button type="button" class="atelier-btn-primary" id="btn-mannequin-save-portfolio" style="width: 100%; margin-top: 18px;">
                        💾 Simpan ke My Fashion Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4.E MY FASHION PORTFOLIO SUBPANEL -->
              <div class="designer-subpanel" id="subpanel-designer-portfolio">
                <div class="portfolio-grid" id="portfolio-grid"></div>
              </div>
            </div>
          </main>

          <!-- 5. MY LOOKBOOK PANEL -->
          <main class="atelier-panel" id="panel-atelier-lookbook">
            <div class="atelier-section-header">
              <div class="atelier-section-title-wrap">
                <span class="atelier-section-title">📖 My Lookbook — Album Paduan Outfit Lala</span>
                <span class="atelier-section-desc">Koleksi gaya berbusana yang telah kamu rangkai dan kenakan. Klik "Pakai Outfit Ini" untuk menggunakannya kembali kapan saja!</span>
              </div>
            </div>

            <div class="lookbook-grid" id="lookbook-grid"></div>
          </main>

          <!-- 6. SEASONAL COLLECTIONS PANEL -->
          <main class="atelier-panel" id="panel-atelier-seasonal">
            <div class="atelier-section-header">
              <div class="atelier-section-title-wrap">
                <span class="atelier-section-title">🌸 Seasonal Collections — Koleksi Busana Tematik Peri</span>
                <span class="atelier-section-desc">Eksplorasi ragam inspirasi busana tematik dari bunga musim semi hingga keindahan galaksi malam.</span>
              </div>
            </div>

            <div class="seasonal-collections-grid" id="seasonal-collections-grid"></div>
          </main>
        </div>

        <!-- Portfolio Detail Modal -->
        <div class="atelier-modal-overlay" id="modal-portfolio-detail" aria-hidden="true">
          <div class="atelier-modal-box">
            <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(244, 114, 182, 0.2); padding-bottom: 10px;">
              <span style="font-size: 1.15rem; font-weight: 800; color: #831843;" id="modal-port-title">Detail Desain</span>
              <button type="button" id="btn-close-modal-port" style="border: none; background: transparent; font-size: 1.2rem; cursor: pointer; color: #94a3b8;">✕</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              <div style="font-size: 0.85rem; color: #db2777; font-weight: 600;">
                Tema: <span id="modal-port-theme" style="color: #334155;">-</span> · Status: <span id="modal-port-status" style="color: #334155;">-</span>
              </div>
              <p id="modal-port-desc" style="font-size: 0.9rem; color: #475569; line-height: 1.4; margin: 0;"></p>
            </div>
            <button type="button" class="atelier-btn-secondary" onclick="document.getElementById('modal-portfolio-detail').classList.remove('open')" style="align-self: flex-end;">
              Tutup
            </button>
          </div>
        </div>

      </section>
`;

if (!html.includes('id="view-fairy-atelier"')) {
  // Insert right before view-shadow-world
  const marker = '<section class="view-section view-shadow-world" id="view-shadow-world"';
  html = html.replace(marker, `${fairyAtelierMarkup}\n\n      ${marker}`);
  console.log('Successfully inserted #view-fairy-atelier into index.html');
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Updated index.html successfully!');
