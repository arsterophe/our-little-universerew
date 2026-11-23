import fs from 'fs';

const path = 'universes_view.js';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('initFairyAtelierView')) {
  content = content.replace(
    "import { initBloomCottageView } from './bloom_cottage_view.js';",
    "import { initBloomCottageView } from './bloom_cottage_view.js';\nimport { initFairyAtelierView } from './fairy_atelier_view.js';"
  );
  console.log('Added initFairyAtelierView import');
}

// 2. Update TOYOU_LOCATIONS.atelier
const oldAtelier = `  atelier: {
    id: 'atelier',
    icon: '👗',
    tag: 'LOKASI B · TO YOU',
    title: 'Galeri Busana — Atelier',
    subtitle: 'Studio Mode Kubah Kaca & Bingkai Kayu Peri',
    description: 'Bangunan studio fantasi dengan struktur kaca dan bingkai kayu berhias bunga merambat. Di dalamnya tampak manekin, gaun-gaun pastel, rak pakaian, serta dekorasi bunga tempat Bella menampilkan karya dan gaya favoritnya.',
    highlight: '🌸 Koleksi gaun peri pagi & sketsa busana Bella dipajang di galeri',
    actionLabel: 'Lihat Galeri & Scrapbook Momen',
    actionType: 'moments',
    toastMsg: '👗 Mengunjungi Atelier (Galeri Busana) Bella: Gaun pastel berkilau di bawah sinar matahari pagi!'
  },`;

const newAtelier = `  atelier: {
    id: 'atelier',
    icon: '👗',
    tag: 'LOKASI B · TO YOU',
    title: 'The Fairy Atelier',
    subtitle: 'Enchanted Fairy Fashion Boutique & Design Simulator',
    description: 'Studio dan butik fantasi kubah kaca berhias mawar merambat dan kelopak emas. Di dalamnya terdapat ruang kreasi busana peri Lala, manekin display, buku sketsa interaktif, lemari aksesori, serta album koleksi rancangan mode.',
    highlight: '👗 Wardrobe & Dressing Room · 🎨 Fashion Sketchbook · 🪡 Designer\\'s Corner · 📖 Lookbook & Portfolio',
    actionLabel: 'Masuk ke Fairy Atelier 👗✨',
    actionType: 'fairy_atelier',
    toastMsg: '👗 Memasuki The Fairy Atelier — Studio & Butik Mode Lala 🌸'
  },`;

if (content.includes(oldAtelier)) {
  content = content.replace(oldAtelier, newAtelier);
  console.log('Updated TOYOU_LOCATIONS.atelier');
} else {
  console.log('Old atelier string not matched exactly, checking substring...');
}

// 3. Initialize fairyAtelierCtrl
const bloomCtrlMarker = `  const bloomCottageCtrl = typeof initBloomCottageView === 'function' ? initBloomCottageView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewToYou = document.getElementById('view-toyou-world');
      if (viewToYou) {
        viewToYou.classList.add('active');
        viewToYou.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;`;

const fairyCtrlInit = `  const fairyAtelierCtrl = typeof initFairyAtelierView === 'function' ? initFairyAtelierView({
    onShowToast,
    onTriggerSparkle,
    onNavigateBack: () => {
      const viewToYou = document.getElementById('view-toyou-world');
      if (viewToYou) {
        viewToYou.classList.add('active');
        viewToYou.setAttribute('aria-hidden', 'false');
      }
    }
  }) : null;`;

if (!content.includes('fairyAtelierCtrl =') && content.includes(bloomCtrlMarker)) {
  content = content.replace(bloomCtrlMarker, `${bloomCtrlMarker}\n\n${fairyCtrlInit}`);
  console.log('Added fairyAtelierCtrl initialization');
}

// 4. Hotspot click for atelier
const hotspotClickMarker = `      if (locKey === 'rumah' && activeToYouLocationKey === 'rumah') {`;
const atelierHotspotClick = `      if (locKey === 'atelier' && activeToYouLocationKey === 'atelier') {
        if (fairyAtelierCtrl && typeof fairyAtelierCtrl.openFairyAtelier === 'function') {
          closeToYouLocationPanel();
          if (viewToYouWorld) {
            viewToYouWorld.classList.remove('active');
            viewToYouWorld.setAttribute('aria-hidden', 'true');
          }
          fairyAtelierCtrl.openFairyAtelier(activeCharacterKey || activeUser || 'lala');
          return;
        }
      }
      if (locKey === 'rumah' && activeToYouLocationKey === 'rumah') {`;

if (!content.includes("locKey === 'atelier' && activeToYouLocationKey === 'atelier'") && content.includes(hotspotClickMarker)) {
  content = content.replace(hotspotClickMarker, atelierHotspotClick);
  console.log('Added atelier hotspot repeat click direct entry');
}

// 5. Hotspot dblclick for atelier
const dblclickMarker = `      if (locKey === 'kotak_pos' && typeof onNavigateKotakPos === 'function') {`;
const atelierDblClick = `      if (locKey === 'atelier' && fairyAtelierCtrl && typeof fairyAtelierCtrl.openFairyAtelier === 'function') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        fairyAtelierCtrl.openFairyAtelier(activeCharacterKey || activeUser || 'lala');
        return;
      }
      if (locKey === 'kotak_pos' && typeof onNavigateKotakPos === 'function') {`;

if (!content.includes("locKey === 'atelier' && fairyAtelierCtrl") && content.includes(dblclickMarker)) {
  content = content.replace(dblclickMarker, atelierDblClick);
  console.log('Added atelier hotspot dblclick direct entry');
}

// 6. Action button click
const actionMarker = `      if (loc.actionType === 'bloom_cottage') {`;
const atelierActionClick = `      if (loc.actionType === 'fairy_atelier') {
        closeToYouLocationPanel();
        if (viewToYouWorld) {
          viewToYouWorld.classList.remove('active');
          viewToYouWorld.setAttribute('aria-hidden', 'true');
        }
        if (fairyAtelierCtrl && typeof fairyAtelierCtrl.openFairyAtelier === 'function') {
          fairyAtelierCtrl.openFairyAtelier(activeCharacterKey || activeUser || 'lala');
        }
      } else if (loc.actionType === 'bloom_cottage') {`;

if (!content.includes("loc.actionType === 'fairy_atelier'") && content.includes(actionMarker)) {
  content = content.replace(actionMarker, atelierActionClick);
  console.log('Added loc.actionType === fairy_atelier handler');
}

// 7. Returned controller object
const returnMarker = `    openBloomCottage: (char = null, room = 'living') => bloomCottageCtrl?.openBloomCottage(char || activeCharacterKey || activeUser || 'lala', room),
    closeBloomCottage: () => bloomCottageCtrl?.closeBloomCottage(),`;

const returnAddition = `    openBloomCottage: (char = null, room = 'living') => bloomCottageCtrl?.openBloomCottage(char || activeCharacterKey || activeUser || 'lala', room),
    closeBloomCottage: () => bloomCottageCtrl?.closeBloomCottage(),
    fairyAtelierController: fairyAtelierCtrl,
    openFairyAtelier: (char = null) => fairyAtelierCtrl?.openFairyAtelier(char || activeCharacterKey || activeUser || 'lala'),
    closeFairyAtelier: () => fairyAtelierCtrl?.closeFairyAtelier(),`;

if (!content.includes('fairyAtelierController:') && content.includes(returnMarker)) {
  content = content.replace(returnMarker, returnAddition);
  console.log('Added fairyAtelierController to export object');
}

fs.writeFileSync(path, content, 'utf8');
console.log('universes_view.js integration finished successfully!');
