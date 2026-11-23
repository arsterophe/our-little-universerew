/**
 * OUR LITTLE UNIVERSE — ELA'S UNIVERSE: THE SILENT LOTUS (US AGAIN 🌸)
 * Controller & Interactive Experience
 * Canonical Character: Ela
 * Canonical UID: plxSNowjCkOMfUQMAwnZzQPR9Xr1
 * Universe ID: us_again (US AGAIN)
 */

export function initUsAgainWorld({ onShowToast, onTriggerSparkle, onOpenResidence } = {}) {
  const ELA_CANONICAL_UID = 'plxSNowjCkOMfUQMAwnZzQPR9Xr1';
  let activeUser = null;

  // DOM Elements
  const worldSection = document.getElementById('view-usagain-world');
  const fxCanvas = document.getElementById('usagain-fx-canvas');

  // Music Player State & Web Audio API Synthesizer
  let audioCtx = null;
  let isPlaying = false;
  let currentTrackIdx = 0;
  let musicTimer = null;
  let synthInterval = null;

  const PLAYLIST = [
    {
      title: 'Lotus in the Moonlight',
      sub: 'Zen Meditation Bells & Gentle Koto • 56 BPM',
      tempo: 56,
      scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25] // Pentatonic Major
    },
    {
      title: 'Sanctuary of Stillness',
      sub: 'Serene Ambient Piano & River Waves • 60 BPM',
      tempo: 60,
      scale: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00] // Minor Pentatonic
    },
    {
      title: 'Night Bloom',
      sub: 'Lavender Strings & Singing Bowls • 50 BPM',
      tempo: 50,
      scale: [261.63, 311.13, 349.23, 392.00, 466.16, 523.25] // Minor 7th
    }
  ];

  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playNote(freq, type = 'sine', duration = 1.6, gainLevel = 0.08) {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainLevel, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  function startMusicLoop() {
    if (synthInterval) clearInterval(synthInterval);
    const track = PLAYLIST[currentTrackIdx];
    const beatInterval = (60 / track.tempo) * 1000;

    let step = 0;
    synthInterval = setInterval(() => {
      if (!isPlaying) return;
      const noteFreq = track.scale[step % track.scale.length];
      playNote(noteFreq, 'sine', 2.2, 0.07);

      if (step % 2 === 0) {
        playNote(track.scale[0] * 0.5, 'triangle', 2.8, 0.04);
      }
      if (step % 4 === 3) {
        playNote(track.scale[track.scale.length - 1] * 1.5, 'sine', 1.4, 0.03);
      }
      step++;
    }, beatInterval);
  }

  function stopMusicLoop() {
    if (synthInterval) {
      clearInterval(synthInterval);
      synthInterval = null;
    }
  }

  function togglePlayMusic() {
    const playIcon = document.getElementById('usagain-play-icon');
    const discEl = document.getElementById('usagain-music-disc');

    if (isPlaying) {
      isPlaying = false;
      stopMusicLoop();
      if (playIcon) playIcon.textContent = '▶';
      if (discEl) discEl.classList.remove('playing');
      if (musicTimer) clearInterval(musicTimer);
    } else {
      isPlaying = true;
      getAudioContext();
      startMusicLoop();
      if (playIcon) playIcon.textContent = '⏸';
      if (discEl) discEl.classList.add('playing');

      let progress = 0;
      const fillEl = document.getElementById('usagain-music-progress-fill');
      if (musicTimer) clearInterval(musicTimer);
      musicTimer = setInterval(() => {
        if (!isPlaying) return;
        progress = (progress + 1) % 100;
        if (fillEl) fillEl.style.width = `${progress}%`;
      }, 500);
    }
  }

  function changeTrack(direction) {
    currentTrackIdx = (currentTrackIdx + direction + PLAYLIST.length) % PLAYLIST.length;
    const track = PLAYLIST[currentTrackIdx];
    const titleEl = document.getElementById('usagain-music-title');
    const subEl = document.getElementById('usagain-music-sub');
    const fillEl = document.getElementById('usagain-music-progress-fill');

    if (titleEl) titleEl.textContent = track.title;
    if (subEl) subEl.textContent = track.sub;
    if (fillEl) fillEl.style.width = '0%';

    if (isPlaying) {
      startMusicLoop();
    }
    if (onShowToast) {
      onShowToast(`🌸 Memutar: ${track.title}`);
    }
  }

  // --- Canvas FX: Falling Pink Lotus Petals & Floating Butterflies ---
  let fxAnimationId = null;
  const particles = [];
  const butterflies = [];

  function initFxCanvas() {
    if (!fxCanvas) return;
    const ctx = fxCanvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      fxCanvas.width = window.innerWidth;
      fxCanvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Initialize 36 lotus petals
    particles.length = 0;
    for (let i = 0; i < 36; i++) {
      particles.push({
        x: Math.random() * fxCanvas.width,
        y: Math.random() * fxCanvas.height,
        size: Math.random() * 5 + 3,
        speedY: Math.random() * 0.7 + 0.3,
        speedX: Math.random() * 0.6 - 0.3,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: Math.random() * 0.6 + 0.3
      });
    }

    // Initialize 6 glowing butterflies
    butterflies.length = 0;
    for (let i = 0; i < 6; i++) {
      butterflies.push({
        x: Math.random() * fxCanvas.width,
        y: Math.random() * fxCanvas.height * 0.7 + fxCanvas.height * 0.2,
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.5,
        wingPhase: Math.random() * Math.PI * 2,
        size: Math.random() * 4 + 5,
        opacity: Math.random() * 0.4 + 0.5
      });
    }

    function render() {
      ctx.clearRect(0, 0, fxCanvas.width, fxCanvas.height);

      // Render Lotus Petals
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        if (p.y > fxCanvas.height) {
          p.y = -10;
          p.x = Math.random() * fxCanvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.beginPath();
        // Draw delicate oval petal
        ctx.ellipse(0, 0, p.size, p.size * 1.8, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(244, 114, 182, ${p.opacity})`;
        ctx.shadowColor = 'rgba(251, 207, 232, 0.6)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.restore();
      });

      // Render Floating Butterflies
      butterflies.forEach(b => {
        b.x += b.speedX;
        b.y += b.speedY;
        b.wingPhase += 0.12;

        if (b.x < 0) b.x = fxCanvas.width;
        if (b.x > fxCanvas.width) b.x = 0;
        if (b.y < fxCanvas.height * 0.1) b.y = fxCanvas.height * 0.8;
        if (b.y > fxCanvas.height * 0.9) b.y = fxCanvas.height * 0.2;

        const wingSpan = Math.sin(b.wingPhase) * b.size;

        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.fillStyle = `rgba(251, 207, 232, ${b.opacity})`;
        ctx.shadowColor = 'rgba(244, 114, 182, 0.8)';
        ctx.shadowBlur = 10;

        // Left Wing
        ctx.beginPath();
        ctx.ellipse(-wingSpan / 2, 0, Math.abs(wingSpan) / 2, b.size, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Right Wing
        ctx.beginPath();
        ctx.ellipse(wingSpan / 2, 0, Math.abs(wingSpan) / 2, b.size, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });

      fxAnimationId = requestAnimationFrame(render);
    }

    render();
  }

  // --- Modal Management & Hotspots ---
  function openUsAgainModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    if (onTriggerSparkle) {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
  }

  function closeUsAgainModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
  }

  // --- Storage Scoped to Ela's UID ---
  function getScopedKey(suffix) {
    const uid = activeUser?.uid || ELA_CANONICAL_UID;
    return `olu_usagain_${uid}_${suffix}`;
  }

  // 1. My Residence — Profile & Zen Arrangement
  function setupResidenceModal() {
    const form = document.getElementById('form-usagain-residence');
    const bioInput = document.getElementById('usagain-residence-bio');
    const hobbyInput = document.getElementById('usagain-residence-hobbies');
    const meditationCornerInput = document.getElementById('usagain-residence-meditation');

    // Load saved
    try {
      const savedBio = localStorage.getItem(getScopedKey('bio')) || 'In the silence of the night, I find my peace. The lotus blooms unseen, spreading fragrance into eternity.';
      const savedHobby = localStorage.getItem(getScopedKey('hobbies')) || 'Meditation, Japanese Tea Ceremony, Poetry, Horror Movies';
      const savedMed = localStorage.getItem(getScopedKey('meditation_corner')) || 'Tatami Mat, Incense Burner, White Crane Screen';
      if (bioInput) bioInput.value = savedBio;
      if (hobbyInput) hobbyInput.value = savedHobby;
      if (meditationCornerInput) meditationCornerInput.value = savedMed;
    } catch (_) {}

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        try {
          if (bioInput) localStorage.setItem(getScopedKey('bio'), bioInput.value.trim());
          if (hobbyInput) localStorage.setItem(getScopedKey('hobbies'), hobbyInput.value.trim());
          if (meditationCornerInput) localStorage.setItem(getScopedKey('meditation_corner'), meditationCornerInput.value.trim());
          if (onShowToast) onShowToast('🌸 Pengaturan Rumah Ela berhasil disimpan!');
          closeUsAgainModal('usagain-residence-modal');
        } catch (_) {}
      });
    }
  }

  // 2. Lotus Pond — Fishing Activity & Fish Collection
  const FISH_TYPES = [
    { name: 'Moonlit Lotus Koi', rarity: 'Legendary ⭐⭐⭐', icon: '🐟', desc: 'Ikan koi bersisik mutiara perak yang hanya berenang di bawah pantulan bulan purnama.' },
    { name: 'Golden Sakura Carp', rarity: 'Rare ⭐⭐', icon: '🐠', desc: 'Ikan mas anggun berwarna merah muda keemasan seperti kelopak sakura gugur.' },
    { name: 'Lavender Stardust Guppy', rarity: 'Common ⭐', icon: '🐡', desc: 'Ikan kecil berwarna lavender berkilau yang suka berkumpul di akar bunga teratai.' },
    { name: 'Celestial Amethyst Betta', rarity: 'Epic ⭐⭐⭐', icon: '🐬', desc: 'Ikan petarung berekor ungu violet panjang yang memancarkan pendaran cahaya malam.' }
  ];

  function setupPondFishing() {
    const btnFish = document.getElementById('btn-usagain-start-fishing');
    const fishStatus = document.getElementById('usagain-fish-status');
    const collectionList = document.getElementById('usagain-fish-collection-list');

    function renderCollection() {
      if (!collectionList) return;
      try {
        const saved = JSON.parse(localStorage.getItem(getScopedKey('fish_collection')) || '[]');
        if (saved.length === 0) {
          collectionList.innerHTML = '<p class="text-sm text-pink-200/60 italic">Belum ada tangkapan ikan. Lempar pancingmu ke dalam danau teratai!</p>';
        } else {
          collectionList.innerHTML = saved.map(item => `
            <div class="usagain-card-box flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xl">${item.icon}</span>
                <div>
                  <div class="font-bold text-white text-xs">${item.name}</div>
                  <div class="text-[10px] text-pink-200/70">${item.rarity}</div>
                </div>
              </div>
              <span class="text-[10px] text-pink-300 font-mono">${item.time}</span>
            </div>
          `).join('');
        }
      } catch (_) {}
    }

    renderCollection();

    if (btnFish) {
      btnFish.addEventListener('click', () => {
        btnFish.disabled = true;
        if (fishStatus) fishStatus.textContent = '🎣 Melemparkan kail ke danau teratai... Tunggu umpan tersentuh air...';

        setTimeout(() => {
          if (fishStatus) fishStatus.textContent = '🌊 Ada riak air! Menarik pancing perlahan...';
          setTimeout(() => {
            const caught = FISH_TYPES[Math.floor(Math.random() * FISH_TYPES.length)];
            const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            if (fishStatus) fishStatus.textContent = `✨ Berhasil menangkap: ${caught.name} (${caught.rarity})!`;

            try {
              const current = JSON.parse(localStorage.getItem(getScopedKey('fish_collection')) || '[]');
              current.unshift({ ...caught, time: timeStr });
              localStorage.setItem(getScopedKey('fish_collection'), JSON.stringify(current.slice(0, 15)));
              renderCollection();
            } catch (_) {}

            if (onShowToast) onShowToast(`🎣 Berhasil menangkap ${caught.name}!`);
            if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
            btnFish.disabled = false;
          }, 1500);
        }, 1500);
      });
    }
  }

  // 3. Meditation Gazebo — Breathing Exercise & Timer
  function setupMeditationGazebo() {
    const btnStartMed = document.getElementById('btn-usagain-meditation-start');
    const breathCircle = document.getElementById('usagain-breath-circle');
    const breathText = document.getElementById('usagain-breath-text');
    let medTimer = null;
    let isMeditating = false;

    if (btnStartMed && breathCircle && breathText) {
      btnStartMed.addEventListener('click', () => {
        if (isMeditating) {
          isMeditating = false;
          clearInterval(medTimer);
          btnStartMed.textContent = 'Mulai Meditasi (3 Menit)';
          breathText.textContent = 'Tarik napas perlahan...';
          breathCircle.style.transform = 'scale(1)';
        } else {
          isMeditating = true;
          btnStartMed.textContent = 'Selesaikan Meditasi';
          let cycle = 0;
          medTimer = setInterval(() => {
            cycle = (cycle + 1) % 3;
            if (cycle === 0) {
              breathText.textContent = '🌸 Tarik napas lembut (Inhale)...';
              breathCircle.style.transform = 'scale(1.4)';
              breathCircle.style.borderColor = '#f472b6';
            } else if (cycle === 1) {
              breathText.textContent = '✨ Tahan napas dengan tenang (Hold)...';
              breathCircle.style.transform = 'scale(1.4)';
              breathCircle.style.borderColor = '#c084fc';
            } else {
              breathText.textContent = '🍃 Hembuskan napas perlahan (Exhale)...';
              breathCircle.style.transform = 'scale(1)';
              breathCircle.style.borderColor = 'rgba(244, 114, 182, 0.4)';
            }
          }, 4000);
        }
      });
    }
  }

  // 4. Rose Garden — Bouquet Arranger
  function setupRoseGarden() {
    const btnWater = document.getElementById('btn-usagain-water-garden');
    const btnPick = document.getElementById('btn-usagain-pick-rose');
    const gardenStatus = document.getElementById('usagain-garden-status');
    const bouquetCounter = document.getElementById('usagain-bouquet-count');

    function updateCount() {
      try {
        const count = parseInt(localStorage.getItem(getScopedKey('rose_count')) || '3', 10);
        if (bouquetCounter) bouquetCounter.textContent = count;
      } catch (_) {}
    }
    updateCount();

    if (btnWater) {
      btnWater.addEventListener('click', () => {
        if (gardenStatus) gardenStatus.textContent = '💧 Menyiram tanaman mawar & lavender dengan embun rembulan... Bunga bermekaran indah!';
        if (onShowToast) onShowToast('💧 Mawar merah muda bermekaran segar di taman Ela!');
        if (onTriggerSparkle) onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
      });
    }

    if (btnPick) {
      btnPick.addEventListener('click', () => {
        try {
          const current = parseInt(localStorage.getItem(getScopedKey('rose_count')) || '3', 10) + 1;
          localStorage.setItem(getScopedKey('rose_count'), current.toString());
          updateCount();
          if (gardenStatus) gardenStatus.textContent = '🌹 Memetik satu tangkai mawar merah muda untuk dirangkai menjadi buket!';
          if (onShowToast) onShowToast('🌹 Mawar berhasil ditambahkan ke koleksi buket!');
        } catch (_) {}
      });
    }
  }

  // 5. Private Cinema — Horror Movie Watchlist
  function setupCinemaWatchlist() {
    const listEl = document.getElementById('usagain-cinema-watchlist');
    const btnAdd = document.getElementById('btn-usagain-add-movie');
    const movieInput = document.getElementById('usagain-new-movie-input');

    const DEFAULT_MOVIES = [
      { title: 'A Tale of Two Sisters (Janghwa, Hongryeon)', genre: 'Psychological Horror / Mystery', watched: true },
      { title: 'Incantation (咒)', genre: 'Found Footage / Folk Horror', watched: true },
      { title: 'The Medium (ร่างทรง)', genre: 'Supernatural Shamanism Horror', watched: false },
      { title: 'Noroi: The Curse', genre: 'Occult Mystery Documentarian', watched: false }
    ];

    function renderMovies() {
      if (!listEl) return;
      try {
        const movies = JSON.parse(localStorage.getItem(getScopedKey('movie_watchlist')) || JSON.stringify(DEFAULT_MOVIES));
        listEl.innerHTML = movies.map((m, idx) => `
          <div class="usagain-card-box flex items-center justify-between">
            <div>
              <div class="font-bold text-white text-xs ${m.watched ? 'line-through text-pink-300/60' : ''}">🎬 ${m.title}</div>
              <div class="text-[10px] text-pink-200/70">${m.genre}</div>
            </div>
            <button type="button" class="text-xs px-2 py-1 rounded bg-pink-500/20 hover:bg-pink-500/40 border border-pink-400/40 text-pink-200 cursor-pointer" data-movie-idx="${idx}">
              ${m.watched ? '✓ Ditonton' : 'Tandai Tonton'}
            </button>
          </div>
        `).join('');

        listEl.querySelectorAll('button[data-movie-idx]').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.getAttribute('data-movie-idx'), 10);
            movies[idx].watched = !movies[idx].watched;
            localStorage.setItem(getScopedKey('movie_watchlist'), JSON.stringify(movies));
            renderMovies();
          });
        });
      } catch (_) {}
    }

    renderMovies();

    if (btnAdd && movieInput) {
      btnAdd.addEventListener('click', () => {
        const val = movieInput.value.trim();
        if (!val) return;
        try {
          const movies = JSON.parse(localStorage.getItem(getScopedKey('movie_watchlist')) || JSON.stringify(DEFAULT_MOVIES));
          movies.unshift({ title: val, genre: 'Personal Recommendation', watched: false });
          localStorage.setItem(getScopedKey('movie_watchlist'), JSON.stringify(movies));
          movieInput.value = '';
          renderMovies();
          if (onShowToast) onShowToast(`🎬 Film "${val}" ditambahkan ke watchlist bioskop pribadi!`);
        } catch (_) {}
      });
    }
  }

  // 6. Lotus Library — Books & Philosophy Reading List
  function setupLibraryList() {
    const listEl = document.getElementById('usagain-library-booklist');
    const btnAdd = document.getElementById('btn-usagain-add-book');
    const bookInput = document.getElementById('usagain-new-book-input');

    const DEFAULT_BOOKS = [
      { title: 'The Heart of the Buddha\'s Teaching', author: 'Thich Nhat Hanh', status: 'Selesai Dibaca' },
      { title: 'Zen Mind, Beginner\'s Mind', author: 'Shunryu Suzuki', status: 'Sedang Dibaca' },
      { title: 'No Death, No Fear', author: 'Thich Nhat Hanh', status: 'Daftar Bacaan' }
    ];

    function renderBooks() {
      if (!listEl) return;
      try {
        const books = JSON.parse(localStorage.getItem(getScopedKey('library_books')) || JSON.stringify(DEFAULT_BOOKS));
        listEl.innerHTML = books.map(b => `
          <div class="usagain-card-box flex items-center justify-between">
            <div>
              <div class="font-bold text-white text-xs">📖 ${b.title}</div>
              <div class="text-[10px] text-pink-200/70">Karya: ${b.author}</div>
            </div>
            <span class="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/30 text-purple-200">${b.status}</span>
          </div>
        `).join('');
      } catch (_) {}
    }

    renderBooks();

    if (btnAdd && bookInput) {
      btnAdd.addEventListener('click', () => {
        const val = bookInput.value.trim();
        if (!val) return;
        try {
          const books = JSON.parse(localStorage.getItem(getScopedKey('library_books')) || JSON.stringify(DEFAULT_BOOKS));
          books.unshift({ title: val, author: 'Buku Favorit Ela', status: 'Sedang Dibaca' });
          localStorage.setItem(getScopedKey('library_books'), JSON.stringify(books));
          bookInput.value = '';
          renderBooks();
          if (onShowToast) onShowToast(`📖 Buku "${val}" berhasil ditambahkan ke perpustakaan teratai!`);
        } catch (_) {}
      });
    }
  }

  // 7. Star Observatory — Constellation Viewer
  function setupObservatory() {
    const constellationSelect = document.getElementById('usagain-constellation-select');
    const constellationDesc = document.getElementById('usagain-constellation-desc');

    const CONSTELLATIONS = {
      lotus: 'Rasi Bintang Teratai Abadi (Eternal Lotus): Terdiri dari 7 bintang lavender yang mekar di langit utara, melambangkan kemurnian jiwa dan ketenangan batin.',
      crane: 'Rasi Burung Bangau Perak (Silver Crane): Rasi bintang pelindung suaka yang terbang mengitari rembulan purnama, melambangkan kedamaian dan umur panjang.',
      archer: 'Rasi Pemanah Rembulan (Moon Archer): Gugusan bintang keemasan yang menunjuk ke arah bintang fajar, melambangkan keteguhan arah hati.'
    };

    if (constellationSelect && constellationDesc) {
      constellationSelect.addEventListener('change', () => {
        const val = constellationSelect.value;
        constellationDesc.textContent = CONSTELLATIONS[val] || CONSTELLATIONS.lotus;
      });
    }
  }

  // 8. Private Mailbox — Kotak Pos
  function setupMailbox() {
    const form = document.getElementById('form-usagain-mailbox');
    const inputMsg = document.getElementById('usagain-mailbox-message');
    const listEl = document.getElementById('usagain-mailbox-list');

    function renderLetters() {
      if (!listEl) return;
      try {
        const letters = JSON.parse(localStorage.getItem(getScopedKey('mailbox_letters')) || '[]');
        if (letters.length === 0) {
          listEl.innerHTML = '<p class="text-xs text-pink-200/60 italic">Belum ada surat masuk di kotak pos mawar ini.</p>';
        } else {
          listEl.innerHTML = letters.map(item => `
            <div class="usagain-card-box">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold text-pink-300">✉️ Dari: ${item.sender || 'Teman Sejati'}</span>
                <span class="text-[10px] text-pink-200/60">${item.date}</span>
              </div>
              <p class="text-xs text-white/90 leading-relaxed">${item.body}</p>
            </div>
          `).join('');
        }
      } catch (_) {}
    }

    renderLetters();

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = inputMsg?.value?.trim();
        if (!text) return;
        const newLetter = {
          sender: 'Ela',
          body: text,
          date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        try {
          const letters = JSON.parse(localStorage.getItem(getScopedKey('mailbox_letters')) || '[]');
          letters.unshift(newLetter);
          localStorage.setItem(getScopedKey('mailbox_letters'), JSON.stringify(letters.slice(0, 15)));
          if (inputMsg) inputMsg.value = '';
          renderLetters();
          if (onShowToast) onShowToast('✉️ Surat tersimpan aman di Kotak Pos Mawar!');
        } catch (_) {}
      });
    }
  }

  // --- Attach Event Listeners ---
  function setupEventListeners() {
    // Music Controls
    const btnPlay = document.getElementById('btn-usagain-music-play');
    const btnPrev = document.getElementById('btn-usagain-music-prev');
    const btnNext = document.getElementById('btn-usagain-music-next');

    if (btnPlay) btnPlay.addEventListener('click', togglePlayMusic);
    if (btnPrev) btnPrev.addEventListener('click', () => changeTrack(-1));
    if (btnNext) btnNext.addEventListener('click', () => changeTrack(1));

    // Hotspot Buttons
    const hotspots = [
      { btnId: 'btn-loc-usagain-observatory', modalId: 'usagain-observatory-modal' },
      { btnId: 'btn-loc-usagain-residence', modalId: 'usagain-residence-modal' },
      { btnId: 'btn-loc-usagain-cinema', modalId: 'usagain-cinema-modal' },
      { btnId: 'btn-loc-usagain-library', modalId: 'usagain-library-modal' },
      { btnId: 'btn-loc-usagain-gazebo', modalId: 'usagain-gazebo-modal' },
      { btnId: 'btn-loc-usagain-mailbox', modalId: 'usagain-mailbox-modal' },
      { btnId: 'btn-loc-usagain-garden', modalId: 'usagain-garden-modal' },
      { btnId: 'btn-loc-usagain-pond', modalId: 'usagain-pond-modal' }
    ];

    hotspots.forEach(({ btnId, modalId }) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => openUsAgainModal(modalId));
      }
    });

    // Close Modal Buttons
    const closeButtons = [
      { btnId: 'btn-close-usagain-observatory', modalId: 'usagain-observatory-modal' },
      { btnId: 'btn-close-usagain-residence', modalId: 'usagain-residence-modal' },
      { btnId: 'btn-close-usagain-cinema', modalId: 'usagain-cinema-modal' },
      { btnId: 'btn-close-usagain-library', modalId: 'usagain-library-modal' },
      { btnId: 'btn-close-usagain-gazebo', modalId: 'usagain-gazebo-modal' },
      { btnId: 'btn-close-usagain-mailbox', modalId: 'usagain-mailbox-modal' },
      { btnId: 'btn-close-usagain-garden', modalId: 'usagain-garden-modal' },
      { btnId: 'btn-close-usagain-pond', modalId: 'usagain-pond-modal' },
      { btnId: 'btn-close-usagain-gallery', modalId: 'usagain-gallery-modal' },
      { btnId: 'btn-close-usagain-collection', modalId: 'usagain-collection-modal' },
      { btnId: 'btn-close-usagain-settings', modalId: 'usagain-settings-modal' }
    ];

    closeButtons.forEach(({ btnId, modalId }) => {
      const btn = document.getElementById(btnId);
      if (btn) {
        btn.addEventListener('click', () => closeUsAgainModal(modalId));
      }
    });

    // Enter The Silent Lotus House (2D Simulation)
    const btnEnterLotusHouse = document.getElementById('btn-usagain-enter-lotus-house');
    if (btnEnterLotusHouse) {
      btnEnterLotusHouse.addEventListener('click', () => {
        closeUsAgainModal('usagain-residence-modal');
        if (typeof onOpenResidence === 'function') {
          onOpenResidence();
        }
      });
    }

    // Gallery & Collection Shortcuts
    const btnGallery = document.getElementById('btn-usagain-gallery');
    if (btnGallery) {
      btnGallery.addEventListener('click', () => openUsAgainModal('usagain-gallery-modal'));
    }

    const btnCollection = document.getElementById('btn-usagain-collection');
    if (btnCollection) {
      btnCollection.addEventListener('click', () => openUsAgainModal('usagain-collection-modal'));
    }

    // Top Settings
    const btnSettings = document.getElementById('btn-usagain-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => openUsAgainModal('usagain-settings-modal'));
    }

    // Top Story Navigation Pill -> Open Our Stories
    const btnStory = document.getElementById('btn-usagain-nav-story');
    if (btnStory) {
      btnStory.addEventListener('click', () => {
        if (window.storiesController && typeof window.storiesController.openStories === 'function') {
          window.storiesController.openStories();
        } else {
          document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
          const storiesView = document.getElementById('view-our-stories');
          if (storiesView) storiesView.classList.add('active');
        }
      });
    }

    // Top Explore Universe Pill -> Return to 7 Planets Universe Selection
    const btnExplore = document.getElementById('btn-usagain-nav-explore');
    if (btnExplore) {
      btnExplore.addEventListener('click', () => {
        closeUsAgainWorld();
        const viewPrivate = document.getElementById('view-private-universe');
        if (viewPrivate) {
          viewPrivate.classList.add('active');
          viewPrivate.setAttribute('aria-hidden', 'false');
        }
      });
    }

    // Setup interactive sub-features
    setupResidenceModal();
    setupPondFishing();
    setupMeditationGazebo();
    setupRoseGarden();
    setupCinemaWatchlist();
    setupLibraryList();
    setupObservatory();
    setupMailbox();
  }

  // --- Public Methods ---
  function openUsAgainWorld(user) {
    if (user) {
      activeUser = user;
    }
    document.querySelectorAll('.view-section').forEach(section => {
      section.classList.remove('active');
      section.setAttribute('aria-hidden', 'true');
    });

    if (worldSection) {
      worldSection.classList.add('active');
      worldSection.setAttribute('aria-hidden', 'false');
    }

    // Initialize Canvas FX
    initFxCanvas();

    if (onTriggerSparkle) {
      onTriggerSparkle(window.innerWidth / 2, window.innerHeight / 2);
    }
    if (onShowToast) {
      onShowToast('🌸 Memasuki THE SILENT LOTUS — A Sanctuary of Stillness');
    }
  }

  function closeUsAgainWorld() {
    if (worldSection) {
      worldSection.classList.remove('active');
      worldSection.setAttribute('aria-hidden', 'true');
    }
    if (fxAnimationId) {
      cancelAnimationFrame(fxAnimationId);
      fxAnimationId = null;
    }
    if (isPlaying) {
      togglePlayMusic();
    }
  }

  // Initialize once
  setupEventListeners();

  return {
    openUsAgainWorld,
    closeUsAgainWorld,
    togglePlayMusic
  };
}

