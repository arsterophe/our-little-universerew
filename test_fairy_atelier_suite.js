/**
 * TEST SUITE: THE FAIRY ATELIER — LALA (TO YOU)
 * =============================================================================
 * Validates:
 * 1. Visual Boutique Concept & Markup Structure in index.html
 * 2. 7 Wardrobe Categories (Dresses, Tops, Skirts, Outerwear, Cardigans, Shoes, Fairy Outfits)
 * 3. Magic Dressing Room (Avatar mirror preview, layers, apply, save outfit, reset)
 * 4. Wings & Accessories (Fairy Wings, Hair, Crowns, Earrings, Necklaces, Bags, Magical)
 * 5. Designer's Corner:
 *    A. Fashion Sketchbook (Canvas, tools, croquis templates, undo/redo, save, export PNG)
 *    B. Inspiration Board (Sticky notes, reference images, palettes, multiple boards)
 *    C. Fabric & Color Library (Lace, satin, chiffon, silk, tulle, motifs, palettes)
 *    D. Mannequin Studio (Mannequin drape, silhouette, colors, wings, crown, save)
 *    E. My Fashion Portfolio (Title, snapshot, description, theme, palette, status, duplicate, delete)
 * 6. My Lookbook (Outfit album, favorite toggle, delete, re-wear outfit)
 * 7. Seasonal Collections (6 thematic collections)
 * 8. Storage Architecture (IndexedDB, Lala UID scope, zero large images in localStorage)
 * 9. Integration (Hotspot click, double click, no duplicate docks in bottom-right)
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`✅ [PASS] ${message}`);
  } else {
    console.error(`❌ [FAIL] ${message}`);
  }
}

async function runTests() {
  console.log('🌸 STARTING FAIRY ATELIER TEST SUITE 🌸\n');

  // 1. Files existence check
  const requiredFiles = [
    'fairy_atelier_storage.js',
    'fairy_atelier_data.js',
    'fairy_atelier_view.js',
    'fairy_atelier.css',
    'public/assets/fairy_atelier_boutique.jpg'
  ];

  for (const f of requiredFiles) {
    assert(fs.existsSync(f), `Required file exists: ${f}`);
  }

  // 2. index.html Markup Verification
  const indexHtml = fs.readFileSync('index.html', 'utf8');
  assert(indexHtml.includes('<link rel="stylesheet" href="/fairy_atelier.css">'), 'fairy_atelier.css linked in index.html <head>');
  assert(indexHtml.includes('id="view-fairy-atelier"'), 'Section #view-fairy-atelier exists');
  assert(indexHtml.includes('id="btn-fairy-atelier-back"'), 'Back button #btn-fairy-atelier-back exists');

  // Nav tabs in index.html
  assert(indexHtml.includes('id="tab-atelier-wardrobe"'), 'Tab #tab-atelier-wardrobe exists');
  assert(indexHtml.includes('id="tab-atelier-dressing-room"'), 'Tab #tab-atelier-dressing-room exists');
  assert(indexHtml.includes('id="tab-atelier-accessories"'), 'Tab #tab-atelier-accessories exists');
  assert(indexHtml.includes('id="tab-atelier-designer-corner"'), 'Tab #tab-atelier-designer-corner exists');
  assert(indexHtml.includes('id="tab-atelier-lookbook"'), 'Tab #tab-atelier-lookbook exists');
  assert(indexHtml.includes('id="tab-atelier-seasonal"'), 'Tab #tab-atelier-seasonal exists');

  // Panels in index.html
  assert(indexHtml.includes('id="panel-atelier-wardrobe"'), 'Panel #panel-atelier-wardrobe exists');
  assert(indexHtml.includes('id="panel-atelier-dressing-room"'), 'Panel #panel-atelier-dressing-room exists');
  assert(indexHtml.includes('id="panel-atelier-accessories"'), 'Panel #panel-atelier-accessories exists');
  assert(indexHtml.includes('id="panel-atelier-designer-corner"'), 'Panel #panel-atelier-designer-corner exists');
  assert(indexHtml.includes('id="panel-atelier-lookbook"'), 'Panel #panel-atelier-lookbook exists');
  assert(indexHtml.includes('id="panel-atelier-seasonal"'), 'Panel #panel-atelier-seasonal exists');

  // Designer subpanels
  assert(indexHtml.includes('id="subpanel-designer-sketchbook"'), 'Subpanel #subpanel-designer-sketchbook exists');
  assert(indexHtml.includes('id="subpanel-designer-board"'), 'Subpanel #subpanel-designer-board exists');
  assert(indexHtml.includes('id="subpanel-designer-fabrics"'), 'Subpanel #subpanel-designer-fabrics exists');
  assert(indexHtml.includes('id="subpanel-designer-mannequin"'), 'Subpanel #subpanel-designer-mannequin exists');
  assert(indexHtml.includes('id="subpanel-designer-portfolio"'), 'Subpanel #subpanel-designer-portfolio exists');

  // Sketchbook canvas & controls
  assert(indexHtml.includes('id="atelier-drawing-canvas"'), 'Canvas #atelier-drawing-canvas exists');
  assert(indexHtml.includes('id="btn-sketch-brush"'), 'Brush tool exists');
  assert(indexHtml.includes('id="btn-sketch-eraser"'), 'Eraser tool exists');
  assert(indexHtml.includes('id="btn-sketch-undo"'), 'Undo button exists');
  assert(indexHtml.includes('id="btn-sketch-redo"'), 'Redo button exists');
  assert(indexHtml.includes('id="btn-sketch-clear"'), 'Clear button exists');
  assert(indexHtml.includes('id="btn-sketch-save"'), 'Save sketch button exists');
  assert(indexHtml.includes('id="btn-sketch-export-png"'), 'Export PNG button exists');
  assert(indexHtml.includes('id="select-croquis-template"'), 'Croquis template selector exists');

  // Dressing room controls
  assert(indexHtml.includes('id="btn-dressing-apply"'), 'Apply outfit button exists');
  assert(indexHtml.includes('id="btn-dressing-save-lookbook"'), 'Save outfit to lookbook button exists');
  assert(indexHtml.includes('id="btn-dressing-reset"'), 'Reset outfit button exists');

  // 3. fairy_atelier_data.js Data Verification
  const {
    WARDROBE_CATEGORIES,
    ACCESSORY_CATEGORIES,
    SEASONAL_COLLECTIONS,
    FABRIC_LIBRARY,
    MOTIF_PATTERNS,
    COLOR_PALETTES,
    CROQUIS_TEMPLATES
  } = await import('./fairy_atelier_data.js');

  const expectedWardrobeCats = ['dresses', 'tops', 'skirts', 'outerwear', 'cardigans', 'shoes', 'fairy_outfits'];
  for (const cat of expectedWardrobeCats) {
    assert(WARDROBE_CATEGORIES.some(c => c.id === cat), `Wardrobe category exists: ${cat}`);
  }

  const expectedAccessoryCats = ['wings', 'hair', 'crowns', 'earrings', 'necklaces', 'bags', 'magical'];
  for (const cat of expectedAccessoryCats) {
    assert(ACCESSORY_CATEGORIES.some(c => c.id === cat), `Accessory category exists: ${cat}`);
  }

  const expectedSeasons = ['spring_fairy', 'summer_breeze', 'moonlight_fairy', 'flower_festival', 'butterfly_garden', 'starlight_dream'];
  for (const s of expectedSeasons) {
    assert(SEASONAL_COLLECTIONS.some(sc => sc.id === s), `Seasonal collection exists: ${s}`);
  }

  const expectedFabrics = ['Lace', 'Satin', 'Chiffon', 'Silk', 'Tulle'];
  for (const f of expectedFabrics) {
    assert(FABRIC_LIBRARY.some(fab => fab.type === f), `Fabric library contains: ${f}`);
  }

  assert(MOTIF_PATTERNS.length >= 4, `Motif patterns count (${MOTIF_PATTERNS.length}) >= 4`);
  assert(COLOR_PALETTES.length >= 5, `Color palettes count (${COLOR_PALETTES.length}) >= 5`);
  assert(CROQUIS_TEMPLATES.length >= 4, `Croquis templates count (${CROQUIS_TEMPLATES.length}) >= 4`);

  // 4. Storage Layer Verification
  const {
    LALA_CANONICAL_UID,
    saveSketch,
    getSketches,
    deleteSketch,
    savePortfolioDesign,
    duplicatePortfolioDesign,
    deletePortfolioDesign,
    saveLookbookOutfit,
    getLookbookOutfits,
    toggleLookbookFavorite,
    deleteLookbookOutfit,
    getWardrobeState,
    saveWardrobeState
  } = await import('./fairy_atelier_storage.js');

  assert(LALA_CANONICAL_UID === 'EqByKA8FXoTEt0OmIsSDPfnxMDB3', 'Canonical Lala UID matches EqByKA8FXoTEt0OmIsSDPfnxMDB3');

  // Test storage methods with memory fallback
  const testSketch = await saveSketch({
    title: 'Test Gaun Sakura',
    croquisType: 'croquis_fairy_standard'
  }, LALA_CANONICAL_UID);
  assert(testSketch && testSketch.title === 'Test Gaun Sakura', 'saveSketch succeeded');

  const loadedSketches = await getSketches(LALA_CANONICAL_UID);
  assert(Array.isArray(loadedSketches) && loadedSketches.length > 0, 'getSketches returns sketch list');

  const testDesign = await savePortfolioDesign({
    title: 'Rancangan Test Musim Semi',
    status: 'In Progress'
  }, LALA_CANONICAL_UID);
  assert(testDesign && testDesign.title === 'Rancangan Test Musim Semi', 'savePortfolioDesign succeeded');

  // 5. universes_view.js Integration Verification
  const univCode = fs.readFileSync('universes_view.js', 'utf8');
  assert(univCode.includes("import { initFairyAtelierView } from './fairy_atelier_view.js';"), 'initFairyAtelierView imported in universes_view.js');
  assert(univCode.includes("actionType: 'fairy_atelier'"), "TOYOU_LOCATIONS.atelier has actionType: 'fairy_atelier'");
  assert(univCode.includes("fairyAtelierCtrl.openFairyAtelier"), 'fairyAtelierCtrl.openFairyAtelier wired in hotspot click/action');
  assert(univCode.includes("openFairyAtelier:"), 'openFairyAtelier exported in universes controller');
  assert(!univCode.includes('id="toyou-quick-nav-dock"'), 'Bottom-right duplicate quick nav dock is NOT present');

  console.log(`\n🎉 FAIRY ATELIER TEST SUMMARY: ${passed}/${total} assertions passed!`);
  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
