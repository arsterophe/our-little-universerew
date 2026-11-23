import fs from 'fs';

const filePath = 'universes_view.js';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add TOYOU_MOODS right after KIDULT_MOODS
const toyouMoodsCode = `
// Minimalist Mood Picker Definitions & Curated Soundtrack Recommendations (TO YOU — Lala ☼)
export const TOYOU_MOODS = {
  bahagia: {
    id: 'bahagia',
    label: 'Bahagia',
    icon: '😊',
    songTitle: '♫ Sunny Blossom Waltz ♫',
    songDesc: 'Irama ceria menyambut semerbak bunga bermekaran di hutan TO YOU'
  },
  bersemangat: {
    id: 'bersemangat',
    label: 'Bersemangat',
    icon: '🥰',
    songTitle: '♫ Golden Sunbeam Sparkle ♫',
    songDesc: 'Melodi hangat penuh semangat langkah riang di padang bunga Lala'
  },
  tenang: {
    id: 'tenang',
    label: 'Tenang',
    icon: '🌸',
    songTitle: '♫ Forest Whispering Breeze ♫',
    songDesc: 'Alunan seruling dan petikan harpa di bawah naungan pohon peri'
  },
  sedih: {
    id: 'sedih',
    label: 'Sedih',
    icon: '🌧️',
    songTitle: '♫ Petal Droplet Lullaby ♫',
    songDesc: 'Tetesan embun lembut yang meredakan riak hati gundah'
  },
  lelah: {
    id: 'lelah',
    label: 'Lelah',
    icon: '🌙',
    songTitle: '♫ Twilight Firefly Glow ♫',
    songDesc: 'Harmoni pengantar tidur berhias pendar kunang-kunang temaram'
  },
  bersyukur: {
    id: 'bersyukur',
    label: 'Bersyukur',
    icon: '✨',
    songTitle: '♫ Everglow Blossom Hymn ♫',
    songDesc: 'Kidungan syukur penuh kehangatan kasih dan persahabatan'
  },
  melamun: {
    id: 'melamun',
    label: 'Melamun',
    icon: '💭',
    songTitle: '♫ Dandelion Dreams ♫',
    songDesc: 'Alunan lembut melayang bebas bersama spora dandelion di langit TO YOU'
  }
};
`;

const targetKidultMoodsEnd = `    songTitle: '♫ Floating Clouds Lo-Fi ♫',
    songDesc: 'Alunan lo-fi santai mengembara di antara awan lavender (KIDULT)'
  }
};`;

if (!content.includes('export const TOYOU_MOODS =')) {
  if (!content.includes(targetKidultMoodsEnd)) {
    console.error('Could not find targetKidultMoodsEnd');
    process.exit(1);
  }
  content = content.replace(targetKidultMoodsEnd, targetKidultMoodsEnd + '\n' + toyouMoodsCode);
  console.log('✅ Added TOYOU_MOODS');
}

// 2. Add element declarations inside initUniversesView
const targetDecl = `  const toyouChibiActor = document.getElementById('toyou-chibi-actor');`;
const newDecls = `  const toyouChibiActor = document.getElementById('toyou-chibi-actor');
  // TO YOU Mood and Music Elements
  const toyouMoodContainer = document.getElementById('toyou-mood-container');
  const toyouMoodCard = document.getElementById('toyou-mood-card');
  const toyouMoodIcon = document.getElementById('toyou-mood-icon');
  const toyouMoodText = document.getElementById('toyou-mood-text');
  const toyouMoodSong = document.getElementById('toyou-mood-song');
  const toyouMoodOptionsBar = document.getElementById('toyou-mood-options-bar');
  const toyouMoodOptionPills = document.querySelectorAll('.toyou-mood-option-pill');
  const btnToggleToYouMoodPicker = document.getElementById('btn-toggle-toyou-mood-picker');
  const btnToYouMoodPlay = document.getElementById('btn-toyou-mood-play');
  const toyouMusicIcon = document.getElementById('toyou-music-icon');
  const btnToYouStarMessages = document.getElementById('btn-toyou-star-messages');`;

if (!content.includes('const toyouMoodContainer = document.getElementById(\'toyou-mood-container\');')) {
  if (!content.includes(targetDecl)) {
    console.error('Could not find targetDecl');
    process.exit(1);
  }
  content = content.replace(targetDecl, newDecls);
  console.log('✅ Added TO YOU Mood element declarations');
}

// 3. Add restoreToYouMood() call in openToYouWorld
const targetOpen = `    // Load persistent state and decorations from Firestore (Fase 8)
    loadUniverseState('lala', activeAuthUser);`;
const newOpen = `    // Load persistent state and decorations from Firestore (Fase 8)
    loadUniverseState('lala', activeAuthUser);
    restoreToYouMood();`;

if (!content.includes('restoreToYouMood();')) {
  if (!content.includes(targetOpen)) {
    console.error('Could not find targetOpen');
    process.exit(1);
  }
  content = content.replace(targetOpen, newOpen);
  console.log('✅ Added restoreToYouMood() call in openToYouWorld');
}

// 4. Add TO YOU Mood and Music functions and listeners
const targetCharCardEnd = `  // Interactive Lala Character Card click feedback
  const toyouCharCard = document.getElementById('toyou-char-card');
  if (toyouCharCard) {
    toyouCharCard.addEventListener('click', (e) => {
      e.stopPropagation();
      if (toyouChibiActor) {
        toyouChibiActor.classList.add('bubble-open');
        setTimeout(() => toyouChibiActor.classList.remove('bubble-open'), 3200);
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || window.innerWidth / 4, e.clientY || window.innerHeight / 4);
      }
      if (onShowToast) {
        onShowToast('☼ Lala — The Everglow Fairy: "Small joy, make a big universe! Selamat menjelajahi dunia Bella~"');
      }
    });
  }`;

const toyouMoodLogic = `
  // ==========================================================
  // TO YOU — MINIMALIST MOOD PICKER & FAIRY MUSIC CONTROLLER (LALA ☼)
  // ==========================================================
  let currentToYouMoodKey = 'tenang';
  let isToYouMusicActive = false;

  function applyToYouMood(moodKey, saveToState = true) {
    const moodData = TOYOU_MOODS[moodKey] || TOYOU_MOODS.tenang;
    currentToYouMoodKey = moodData.id;

    if (toyouMoodIcon) {
      toyouMoodIcon.textContent = moodData.icon;
    }
    if (toyouMoodText) {
      toyouMoodText.textContent = moodData.label;
    }
    if (toyouMoodSong) {
      toyouMoodSong.textContent = moodData.songTitle;
    }

    if (toyouMoodOptionPills && toyouMoodOptionPills.length > 0) {
      toyouMoodOptionPills.forEach((pill) => {
        const isCurrent = pill.getAttribute('data-mood') === moodData.id;
        pill.classList.toggle('active', isCurrent);
      });
    }

    if (saveToState) {
      try {
        updateElementState('gazebo', { mood: moodData.id });
      } catch (err) {
        console.warn('Notice saving Lala mood to state:', err);
      }

      const userUid = activeAuthUser?.uid || '1uwba7MrGVU3xHu57VVLvztskrg2';
      try {
        localStorage.setItem(\`olu_toyou_mood_\${userUid}\`, moodData.id);
      } catch (_) { }

      if (onTriggerSparkle) {
        onTriggerSparkle(160, window.innerHeight - 50);
      }
      if (onShowToast) {
        onShowToast(isToYouMusicActive
          ? \`☼ Mood hari ini: \${moodData.icon} \${moodData.label} · Memutar: \${moodData.songTitle} ♫\`
          : \`☼ Mood hari ini: \${moodData.icon} \${moodData.label} · Rekomendasi lagu: \${moodData.songTitle} ♫\`
        );
      }
    }
  }

  function restoreToYouMood() {
    const userUid = activeAuthUser?.uid || '1uwba7MrGVU3xHu57VVLvztskrg2';
    let savedMood = null;
    try {
      savedMood = localStorage.getItem(\`olu_toyou_mood_\${userUid}\`);
    } catch (_) { }
    if (!savedMood && activeUniverseState?.elements?.gazebo?.mood) {
      savedMood = activeUniverseState.elements.gazebo.mood;
    }
    applyToYouMood(savedMood || 'tenang', false);
  }

  function toggleToYouMoodPicker(forceOpen = null) {
    if (!toyouMoodOptionsBar) return;
    const isOpen = forceOpen !== null ? forceOpen : !toyouMoodOptionsBar.classList.contains('is-open');
    toyouMoodOptionsBar.classList.toggle('is-open', isOpen);
    if (btnToggleToYouMoodPicker) {
      btnToggleToYouMoodPicker.classList.toggle('is-active', isOpen);
    }
    if (isOpen && onTriggerSparkle) {
      onTriggerSparkle(180, window.innerHeight - 45);
    }
  }

  if (btnToggleToYouMoodPicker) {
    btnToggleToYouMoodPicker.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleToYouMoodPicker();
    });
  }

  if (toyouMoodText) {
    toyouMoodText.style.cursor = 'pointer';
    toyouMoodText.title = 'Klik untuk memilih mood hari ini';
    toyouMoodText.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleToYouMoodPicker();
    });
  }

  if (toyouMoodOptionPills && toyouMoodOptionPills.length > 0) {
    toyouMoodOptionPills.forEach((pill) => {
      pill.addEventListener('click', (e) => {
        e.stopPropagation();
        const chosenMood = pill.getAttribute('data-mood');
        applyToYouMood(chosenMood, true);
        toggleToYouMoodPicker(false);
      });
    });
  }

  // Close mood options when clicking outside
  document.addEventListener('click', (e) => {
    if (toyouMoodContainer && !toyouMoodContainer.contains(e.target)) {
      toggleToYouMoodPicker(false);
    }
  });

  if (btnToYouMoodPlay) {
    btnToYouMoodPlay.addEventListener('click', (e) => {
      e.stopPropagation();
      isToYouMusicActive = !isToYouMusicActive;
      const moodData = TOYOU_MOODS[currentToYouMoodKey] || TOYOU_MOODS.tenang;
      if (toyouMusicIcon) {
        toyouMusicIcon.textContent = isToYouMusicActive ? '⏸' : '▶';
      }
      if (onTriggerSparkle) {
        onTriggerSparkle(e.clientX || 120, e.clientY || window.innerHeight - 80);
      }
      if (onShowToast) {
        onShowToast(isToYouMusicActive
          ? \`♫ Memutar \${moodData.songTitle}: \${moodData.songDesc} ☼\`
          : '⏸ Alunan musik suasana TO YOU dijeda ☼'
        );
      }
    });
  }

  // Top-left Quick Action Pill for Star Messages (Teleskop)
  if (btnToYouStarMessages) {
    btnToYouStarMessages.addEventListener('click', (e) => {
      e.stopPropagation();
      selectToYouLocation('teleskop', e);
    });
  }`;

if (!content.includes('function applyToYouMood(')) {
  if (!content.includes(targetCharCardEnd)) {
    console.error('Could not find targetCharCardEnd');
    process.exit(1);
  }
  content = content.replace(targetCharCardEnd, targetCharCardEnd + '\n' + toyouMoodLogic);
  console.log('✅ Added TO YOU Mood controller logic & event listeners');
}

// 5. Sync Lala mood from Firestore state if present
const targetFirestoreSync = `      // Sync Kidult mood from Firestore state if present
      if (charKey === 'nyanya' && state.elements?.gazebo?.mood) {
        applyKidultMood(state.elements.gazebo.mood, false);
      }`;
const newFirestoreSync = `      // Sync Kidult mood from Firestore state if present
      if (charKey === 'nyanya' && state.elements?.gazebo?.mood) {
        applyKidultMood(state.elements.gazebo.mood, false);
      }

      // Sync TO YOU mood from Firestore state if present
      if (charKey === 'lala' && state.elements?.gazebo?.mood) {
        applyToYouMood(state.elements.gazebo.mood, false);
      }`;

if (!content.includes('if (charKey === \'lala\' && state.elements?.gazebo?.mood)')) {
  if (!content.includes(targetFirestoreSync)) {
    console.error('Could not find targetFirestoreSync');
    process.exit(1);
  }
  content = content.replace(targetFirestoreSync, newFirestoreSync);
  console.log('✅ Added TO YOU Firestore state mood sync');
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('🎉 universes_view.js successfully updated completely!');
