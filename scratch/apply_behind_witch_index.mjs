import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');

// 1. Add CSS link in head if not already present
if (!html.includes('/kidult_behind.css')) {
  const cssTarget = '<link rel="stylesheet" href="/moonpetal_manor.css">';
  if (html.includes(cssTarget)) {
    html = html.replace(cssTarget, cssTarget + '\n  <link rel="stylesheet" href="/kidult_behind.css">');
    console.log('✅ Added kidult_behind.css link in head');
  } else {
    console.error('Target moonpetal_manor.css not found in head!');
    process.exit(1);
  }
}

// 2. Add button in kidult-hud-topright if not already present
if (!html.includes('id="btn-kidult-behind"')) {
  const storyBtnTarget = `            <button type="button" class="univ-goto-btn kidult-story-pill" id="btn-kidult-story"
              aria-label="Buka Ruang Menulis Story">
              <span class="goto-icon">📖</span>
              <span class="goto-text">Story (Karya)</span>
            </button>`;

  const behindBtnHtml = `            <button type="button" class="univ-goto-btn kidult-behind-pill" id="btn-kidult-behind"
              aria-label="Buka Rahasia Behind the Witch">
              <span class="goto-icon">🧙‍♀️</span>
              <span class="kidult-behind-label">
                <span class="kidult-behind-main">BEHIND THE WITCH</span>
                <span class="kidult-behind-sub">The story behind the girl who learned to stand alone.</span>
              </span>
            </button>`;

  if (html.includes(storyBtnTarget)) {
    html = html.replace(storyBtnTarget, storyBtnTarget + '\n' + behindBtnHtml);
    console.log('✅ Added #btn-kidult-behind to kidult-hud-topright');
  } else {
    console.error('Story button target not found in kidult-hud-topright!');
    process.exit(1);
  }
}

// 3. Add #witch-behind-overlay after #view-kidult-world if not already present
if (!html.includes('id="witch-behind-overlay"')) {
  const sectionEndTarget = `        </div>

      </section>

      <!-- ============================================== -->
      <!-- VIEW 3C: TO YOU — 2D FAIRY FOREST WORLD        -->`;

  const overlayHtml = `        </div>

      </section>

      <!-- ============================================== -->
      <!-- BEHIND THE WITCH — SECRET STORYBOOK OVERLAY    -->
      <!-- ============================================== -->
      <div class="kidult-behind-overlay" id="witch-behind-overlay" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Behind the Witch Storybook">
        <!-- Floating Magical Ambient Particles -->
        <div class="kidult-behind-particles" aria-hidden="true">
          <span class="particle p1">✦</span>
          <span class="particle p2">🌿</span>
          <span class="particle p3">✧</span>
          <span class="particle p4">🕯️</span>
          <span class="particle p5">⋆</span>
          <span class="particle p6">🔮</span>
        </div>

        <div class="kidult-behind-container">
          <!-- Header Bar -->
          <header class="kidult-behind-header">
            <button type="button" class="kidult-behind-back-btn" id="btn-back-witch-behind" aria-label="Kembali ke KIDULT World">
              <span class="back-arrow">←</span>
              <span>Kembali ke KIDULT</span>
            </button>
            <div class="kidult-behind-title-badge">
              <span class="witch-badge-icon" aria-hidden="true">🧙‍♀️</span>
              <div>
                <span class="witch-badge-tag">Our Little Universe · Secret Grimoire</span>
                <h1 class="witch-badge-title">BEHIND THE WITCH</h1>
              </div>
            </div>
            <button type="button" class="kidult-behind-close-btn" id="btn-close-witch-behind" aria-label="Tutup Behind the Witch">✕</button>
          </header>

          <!-- Stepper Navigation (Tabs) -->
          <nav class="kidult-behind-nav" role="tablist" aria-label="Daftar Bab Behind the Witch">
            <button type="button" class="witch-behind-tab-btn active" role="tab" aria-selected="true" data-chapter="1">
              <span class="tab-num">Chapter I</span>
              <span class="tab-title">Why a Witch?</span>
            </button>
            <button type="button" class="witch-behind-tab-btn" role="tab" aria-selected="false" data-chapter="2">
              <span class="tab-num">Chapter II</span>
              <span class="tab-title">Why KIDULT?</span>
            </button>
            <button type="button" class="witch-behind-tab-btn" role="tab" aria-selected="false" data-chapter="3">
              <span class="tab-num">Chapter III</span>
              <span class="tab-title">To the Little Girl Within</span>
            </button>
            <button type="button" class="witch-behind-tab-btn" role="tab" aria-selected="false" data-chapter="4">
              <span class="tab-num">Epilogue</span>
              <span class="tab-title">KIDULT</span>
            </button>
          </nav>

          <!-- Deck of Chapters -->
          <main class="kidult-behind-book-deck">

            <!-- CHAPTER I: WHY A WITCH? -->
            <article class="witch-behind-chapter-panel active" id="witch-behind-chapter-1" role="tabpanel" tabindex="0">
              <header class="kidult-behind-page-header">
                <span class="witch-chapter-badge">Chapter I · Identity & Solitude</span>
                <h2 class="witch-chapter-main-title">Why a Witch?</h2>
                <p class="witch-chapter-sub-title">The story behind the girl who learned to stand alone.</p>
              </header>

              <div class="witch-chapter-grid">
                <div class="witch-text-column">
                  <p class="witch-journal-p drop-cap">
                    Ada alasan mengapa aku selalu memilih sosok seorang penyihir untuk Nyanya. Di balik jubah ungu gelap dan lentera senja yang selalu menyala di pondoknya, penyihir bukanlah sosok yang jahat atau menakutkan, melainkan simbol bagi seseorang yang terbiasa menjalani banyak hal dalam hidup ini sendirian.
                  </p>
                  <p class="witch-journal-p">
                    Sejak awal penciptaan semesta ini, Nyanya adalah jiwa yang ketika menghadapi badai, luka, atau kerumitan dunia luar, kecenderungan pertamanya bukanlah berteriak atau mencari kerumunan untuk berkeluh kesah. Sebaliknya, ia akan menarik diri perlahan. Ia menghilang sementara dari pandangan orang-orang, menutup pintu pondok kayunya rapat-rapat, lalu menyalakan kuali kecil dan membolak-balik lembaran grimoire tuanya. Ia berusaha menyelesaikan, mencerna, dan menambal segalanya seorang diri.
                  </p>
                  <div class="witch-journal-highlight">
                    "Bukan karena dia tidak membutuhkan siapa pun di dunia ini, melainkan karena dia sudah terlalu lama terbiasa mengandalkan dirinya sendiri."
                  </div>
                  <p class="witch-journal-p">
                    Kemandirian itu lahir dari perjalanan panjang di mana ia belajar bahwa sandaran paling aman yang ia miliki adalah kedua kakinya sendiri. Ada sisi penyendiri yang tenang, misterius, dan penuh kehati-hatian. Namun jangan salah mengartikan cangkang pertahanan ini sebagai kedinginan. Nyanya memiliki kehangatan yang amat dalam bagi mereka yang tulus melangkah masuk ke dalam lingkarannya. Keheningannya bukan tanda penolakan terhadap kasih sayang, melainkan perisai agar hatinya yang peka tidak mudah tergores.
                  </p>
                  <div class="witch-journal-quote">
                    "Seorang penyihir merajut keajaibannya di dalam sunyi, bukan untuk menjauhi dunia, melainkan untuk menjaga agar apinya tetap menyala saat angin bertiup kencang."
                  </div>
                </div>

                <aside class="witch-char-profile-card">
                  <div class="witch-portrait-frame">
                    <img src="/assets/avatar_nyanya_hd.png" alt="Nyanya - The Moonlit Shadow Witch" class="witch-portrait-img" loading="lazy">
                    <span class="witch-moonlit-badge">The Moonlit Shadow Witch 🔮</span>
                  </div>
                  <div class="witch-specs-list">
                    <div class="witch-spec-row">
                      <span class="spec-label">Universe</span>
                      <span class="spec-val">KIDULT · Twilight Haven</span>
                    </div>
                    <div class="witch-spec-row">
                      <span class="spec-label">Archetype</span>
                      <span class="spec-val">The Self-Reliant Solitary Caster</span>
                    </div>
                    <div class="witch-spec-row">
                      <span class="spec-label">Key Traits</span>
                      <span class="spec-val">Independent, Guarded, Resilient, Empathetic, Observant</span>
                    </div>
                    <div class="witch-spec-row">
                      <span class="spec-label">Defense Mechanism</span>
                      <span class="spec-val">Solitary Retreat & Self-Reliance</span>
                    </div>
                    <div class="witch-spec-row">
                      <span class="spec-label">Heart Nature</span>
                      <span class="spec-val">Quietly Affectionate & Loyal</span>
                    </div>
                    <div class="witch-spec-row">
                      <span class="spec-label">Sacred Relics</span>
                      <span class="spec-val">Grimoire, Crystal Orb, Dried Lavender</span>
                    </div>
                  </div>
                </aside>
              </div>
            </article>

            <!-- CHAPTER II: WHY KIDULT? -->
            <article class="witch-behind-chapter-panel" id="witch-behind-chapter-2" role="tabpanel" tabindex="0">
              <header class="kidult-behind-page-header">
                <span class="witch-chapter-badge">Chapter II · Philosophy & Duality</span>
                <h2 class="witch-chapter-main-title">Why KIDULT?</h2>
                <p class="witch-chapter-sub-title">Growing up doesn't mean letting go of the child within.</p>
              </header>

              <div class="witch-chapter-grid">
                <div class="witch-text-column">
                  <p class="witch-journal-p drop-cap">
                    Kata <em>KIDULT</em> bukanlah sekadar paduan huruf yang terdengar estetik. Nama ini adalah intisari dari pertarungan batin yang paling jujur: persimpangan antara kedewasaan yang dituntut oleh kenyataan, dan seorang anak kecil yang terperangkap di dalam dada.
                  </p>
                  <p class="witch-journal-p">
                    Dilihat dari luar, Nyanya memancarkan ketegasan orang dewasa yang serba matang. Ia selalu bersikap rasional, terbiasa berada dalam <em>survival mode</em> konstan, dan jarang sekali mengizinkan kelemahannya tampak ke permukaan. Ia adalah orang yang akan mengatur langkah ketika situasi kacau, memastikan segala hal terkendali, dan memikul tanggung jawab tanpa banyak mengeluh.
                  </p>
                  <p class="witch-journal-p">
                    Namun jika kita menyingkap tirai malam itu lebih dalam, di sudut paling tenang hatinya, masih ada seorang gadis kecil yang duduk bersimpuh. Seorang anak kecil yang merindukan rasa aman, kehangatan pelukan yang tulus, dan kehadiran seseorang yang bersedia memahaminya tanpa sedikit pun menuntutnya untuk selalu kuat.
                  </p>
                  <div class="witch-journal-highlight">
                    "Lagu KIDULT milik SEVENTEEN adalah cermin jiwa bagi siapa saja yang dipaksa dewasa terlalu cepat oleh keadaan hidup."
                  </div>
                  <p class="witch-journal-p">
                    Lagu tersebut tidak sekadar berkisah tentang menjadi tua. Bagi author, lagu itu adalah dekapan hangat bagi mereka yang merasa seperti anak kecil yang kehilangan arah di balik sepatu orang dewasa. Lagu itu membisikkan bahwa tidak ada yang salah dengan merasa lelah, menangis ketika dunia terlalu bising, atau ingin sejenak melepaskan topeng ketangguhan. Menjadi dewasa bukan berarti membunuh anak kecil di dalam diri kita, melainkan belajar melindunginya dengan penuh kelembutan.
                  </p>
                  <div class="witch-journal-quote">
                    "Terkadang keberanian terbesar seorang dewasa bukanlah menahan air mata, melainkan mengizinkan anak kecil di dalam dirinya untuk berkata: 'Hari ini aku lelah, bisakah aku beristirahat?'"
                  </div>
                </div>

                <aside class="witch-symbols-card">
                  <div class="witch-symbols-visual">
                    <svg class="witch-symbols-svg" width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="44" stroke="#facc15" stroke-width="2" stroke-dasharray="4 4" opacity="0.6"/>
                      <path d="M50 15 L58 38 L82 38 L63 53 L70 76 L50 62 L30 76 L37 53 L18 38 L42 38 Z" fill="rgba(192, 132, 252, 0.45)" stroke="#facc15" stroke-width="2"/>
                      <circle cx="50" cy="50" r="14" fill="#6b21a8" stroke="#fef08a" stroke-width="2"/>
                      <path d="M50 38 Q58 50 50 62 Q42 50 50 38 Z" fill="#facc15"/>
                    </svg>
                  </div>
                  <h3 class="witch-symbols-title">Empat Pilar Jiwa KIDULT</h3>
                  <div class="witch-symbol-item">
                    <span class="witch-symbol-icon">🛡️</span>
                    <div class="witch-symbol-info">
                      <strong>The Grown-up Armor</strong>
                      <p>Baju zirah kedewasaan dan survival mode yang terpaksa dibentuk lebih awal demi menjaga diri dari badai.</p>
                    </div>
                  </div>
                  <div class="witch-symbol-item">
                    <span class="witch-symbol-icon">💧</span>
                    <div class="witch-symbol-info">
                      <strong>The Hidden Tear</strong>
                      <p>Air mata yang disimpan rapat dalam keheningan agar orang-orang di sekitarnya tidak merasa terbebani.</p>
                    </div>
                  </div>
                  <div class="witch-symbol-item">
                    <span class="witch-symbol-icon">🕯️</span>
                    <div class="witch-symbol-info">
                      <strong>The Permission to Be Tired</strong>
                      <p>Izin sakral untuk melepaskan beban dan beristirahat tanpa rasa bersalah, malu, ataupun takut diabaikan.</p>
                    </div>
                  </div>
                  <div class="witch-symbol-item">
                    <span class="witch-symbol-icon">🌸</span>
                    <div class="witch-symbol-info">
                      <strong>The Healing Bloom</strong>
                      <p>Memeluk sang anak kecil di dalam diri dengan kasih murni, memberinya ruang untuk tertawa dan merasa aman.</p>
                    </div>
                  </div>
                </aside>
              </div>
            </article>

            <!-- CHAPTER III: TO THE LITTLE GIRL WITHIN -->
            <article class="witch-behind-chapter-panel" id="witch-behind-chapter-3" role="tabpanel" tabindex="0">
              <header class="kidult-behind-page-header">
                <span class="witch-chapter-badge">Chapter III · An Intimate Letter</span>
                <h2 class="witch-chapter-main-title">To the Little Girl Within</h2>
                <p class="witch-chapter-sub-title">A warm letter to the inner child who fought so hard to survive.</p>
              </header>

              <div class="behind-witch-parchment">
                <div class="witch-wax-seal" title="Wax Seal of the Moonlit Sanctuary">✦</div>
                <div class="witch-date-stamp">
                  <span>📅 Malam Berbintang</span>
                  <span>·</span>
                  <span>The Moonlit Haven Sanctuary</span>
                </div>
                <h3 class="witch-letter-salutation">Untuk Gadis Kecil di Dalam Diriku...</h3>
                <div class="witch-letter-body">
                  <p>
                    Jika surat ini sampai ke tanganmu saat malam sedang larut dan angin berbisik di luar jendela pondokmu, aku ingin kamu menarik napas panjang dan melepaskan peganganmu sejenak. Letakkan tongkat sihirmu di dekat perapian, tutup buku grimoire yang berat itu, dan duduklah bersamaku di sini.
                  </p>
                  <p>
                    Aku tahu seberapa keras kamu telah berjuang. Aku melihat setiap jejak langkah yang kamu tempuh saat jalanan terasa begitu terjal dan dingin. Aku tahu ada masa-masa di mana kamu merasa harus menjadi benteng yang tak boleh retak, menelan semua kekhawatiranmu sendiri karena kamu tidak yakin siapa yang bisa kamu percaya untuk menopangmu jika kamu runtuh.
                  </p>
                  <div class="witch-letter-emphasis">
                    "Kamu sudah berjuang dengan sangat baik selama ini. Sangat, sangat baik."
                  </div>
                  <p>
                    Maka dengarkanlah perkataanku ini, wahai jiwaku yang pemberani: <em>Kamu tidak harus selalu menjadi orang yang paling kuat di dalam ruangan.</em> Kamu tidak perlu membuktikan kepada siapa pun bahwa kamu kebal terhadap rasa sakit. Tidak apa-apa jika sesekali langkahmu melambat. Tidak apa-apa jika kamu ingin bersandar pada bahu seseorang tanpa perlu merasa berhutang budi. Dan sungguh, sangat tidak apa-apa jika malam ini kamu ingin menangis sampai dadamu terasa lega.
                  </p>
                  <p>
                    Duniamu sekarang aman. Pondok KIDULT ini dibangun bukan sebagai tempat bersembunyi karena takut, melainkan sebagai istana perlindungan abadi tempat anak kecil di dalam dirimu boleh tertawa bebas, memetik bunga lavender, dan tidur lelap tanpa kecemasan hari esok. Kamu tidak lagi sendirian di tengah kegelapan hutan. Ada cinta yang tulus dan tak bersyarat yang selalu menunggumu pulang.
                  </p>
                </div>
                <div class="witch-letter-signoff">
                  <p>Dengan segenap kehangatan dan pelukan paling tulus,</p>
                  <strong>— Author of Our Little Universe · Dedicated to Nyanya —</strong>
                </div>
              </div>
            </article>

            <!-- EPILOGUE: KIDULT -->
            <article class="witch-behind-chapter-panel" id="witch-behind-chapter-4" role="tabpanel" tabindex="0">
              <header class="kidult-behind-page-header">
                <span class="witch-chapter-badge">Epilogue · The Sound of KIDULT</span>
                <h2 class="witch-chapter-main-title">Melody of the Inner Child</h2>
                <p class="witch-chapter-sub-title">Even in an adult world, our inner child deserves a melody of peace.</p>
              </header>

              <div class="witch-epilogue-container">
                <!-- YouTube Music Player Card -->
                <div class="witch-song-player-card">
                  <div class="witch-track-bar">
                    <div class="witch-track-left">
                      <span class="witch-track-disc" aria-hidden="true">💿</span>
                      <div>
                        <span class="witch-track-title">KIDULT (어른 아이)</span>
                        <span class="witch-track-artist">SEVENTEEN · 7th Mini Album 'Heng:garæ' (2020)</span>
                      </div>
                    </div>
                    <span class="witch-track-badge">Official Audio · YouTube nocookie</span>
                  </div>

                  <div class="witch-youtube-box">
                    <iframe id="witch-youtube-iframe"
                      src="https://www.youtube-nocookie.com/embed/T463pgGnNVc?enablejsapi=1"
                      title="SEVENTEEN - KIDULT"
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen>
                    </iframe>
                  </div>
                  <p class="witch-player-hint">
                    🎵 Sentuh tombol Play untuk mendengarkan lagu. Audio otomatis berhenti saat overlay ditutup atau kamu berpindah chapter.
                  </p>
                </div>

                <!-- Song Meaning & Lyrics Section -->
                <div class="witch-meaning-card">
                  <div class="witch-meaning-header">
                    <span class="witch-meaning-icon" aria-hidden="true">📖</span>
                    <div>
                      <h3 class="witch-meaning-title">The Meaning Behind the Song</h3>
                      <p class="witch-meaning-sub">Filosofi & Lirik Resmi Lagu KIDULT — SEVENTEEN</p>
                    </div>
                  </div>
                  <div class="witch-meaning-body">
                    <p>
                      Bagi Nyanya dan semesta KIDULT, lagu ini adalah pengingat bahwa masa lalu dan rasa sakit bukanlah kegagalan, melainkan tanah subur tempat kita bertumbuh. Dalam liriknya tersimpan pesan menyentuh bahwa menangis bukanlah tanda kelemahan orang dewasa, melainkan cara jiwa kita menyiram kembali bunga ketulusan yang sempat layu.
                    </p>
                    <p>
                      Ketika dunia menuntut kita untuk menjadi sempurna, serba tahu, dan tak tergoyahkan, melodi KIDULT hadir seperti selimut hangat di malam yang dingin: membisikkan bahwa kita tetap berharga apa adanya, baik sebagai orang dewasa yang bertanggung jawab maupun sebagai anak kecil yang ingin dicintai.
                    </p>
                    <a href="https://www.sonora.id/read/423847723/lirik-lagu-kidult-seventeen-dengan-terjemahan-indonesia-dan-inggris"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="witch-external-link">
                      <span>🔗 Baca Lirik & Terjemahan Lengkap KIDULT di Sonora.id</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>

                <!-- Closing Atmosphere & Quote -->
                <div class="witch-closing-atmosphere">
                  <div class="witch-closing-halo" aria-hidden="true">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#facc15" stroke-width="1.5">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>
                    </svg>
                  </div>
                  <div class="witch-closing-quote-wrap">
                    <span class="witch-quote-symbol-top">“</span>
                    <blockquote class="witch-closing-quote">
                      Kita tidak harus kehilangan anak kecil di dalam diri kita hanya untuk membuktikan bahwa kita mampu bertahan sebagai orang dewasa. Di sini, di pondok malammu, kamu boleh lelah, dan kamu selalu dicintai.
                    </blockquote>
                    <span class="witch-quote-symbol-bottom">”</span>
                  </div>
                  <span class="witch-closing-author">— Author of Our Little Universe · Dedicated to Nyanya —</span>
                </div>
              </div>
            </article>

          </main>

          <!-- Footer Navigation Bar -->
          <footer class="kidult-behind-footer">
            <button type="button" class="kidult-behind-nav-btn" id="btn-witch-behind-prev" disabled>
              <span>←</span>
              <span>Previous Chapter</span>
            </button>
            <div class="witch-chapter-indicators" role="tablist" aria-label="Indikator Bab">
              <button type="button" class="witch-indicator-dot active" data-chapter="1" aria-label="Bab 1: Why a Witch?"></button>
              <button type="button" class="witch-indicator-dot" data-chapter="2" aria-label="Bab 2: Why KIDULT?"></button>
              <button type="button" class="witch-indicator-dot" data-chapter="3" aria-label="Bab 3: To the Little Girl Within"></button>
              <button type="button" class="witch-indicator-dot" data-chapter="4" aria-label="Epilog: KIDULT"></button>
            </div>
            <button type="button" class="kidult-behind-nav-btn" id="btn-witch-behind-next">
              <span>Next Chapter</span>
              <span>→</span>
            </button>
          </footer>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- VIEW 3C: TO YOU — 2D FAIRY FOREST WORLD        -->`;

  if (html.includes(sectionEndTarget)) {
    html = html.replace(sectionEndTarget, overlayHtml);
    console.log('✅ Added #witch-behind-overlay after #view-kidult-world');
  } else {
    console.error('Section end target not found!');
    process.exit(1);
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('🎉 Successfully updated index.html with BEHIND THE WITCH markup!');
