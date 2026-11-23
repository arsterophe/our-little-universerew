import fs from 'fs';

const filePath = 'index.html';
let html = fs.readFileSync(filePath, 'utf8');

// 1. Link toyou_behind.css in <head>
const targetCss = `<link rel="stylesheet" href="/kidult_behind.css">`;
const newCss = `<link rel="stylesheet" href="/kidult_behind.css">
  <link rel="stylesheet" href="/toyou_behind.css">`;

if (!html.includes('/toyou_behind.css')) {
  if (!html.includes(targetCss)) {
    console.error('Could not find targetCss');
    process.exit(1);
  }
  html = html.replace(targetCss, newCss);
  console.log('✅ Added toyou_behind.css link in <head>');
}

// 2. Add #btn-toyou-behind in .toyou-hud-topright
const targetStoryBtn = `            <button type="button" class="univ-goto-btn toyou-story-pill" id="btn-toyou-story"
              aria-label="Buka Ruang Menulis Story">
              <span class="goto-icon">✍️</span>
              <span class="goto-text">Story (Karya)</span>
            </button>`;

const newBehindBtn = `            <button type="button" class="univ-goto-btn toyou-story-pill" id="btn-toyou-story"
              aria-label="Buka Ruang Menulis Story">
              <span class="goto-icon">✍️</span>
              <span class="goto-text">Story (Karya)</span>
            </button>
            <button type="button" class="univ-goto-btn toyou-behind-pill" id="btn-toyou-behind"
              aria-label="Buka Rahasia Behind the Fairy">
              <span class="goto-icon">🧚‍♀️</span>
              <span class="toyou-behind-label">
                <span class="toyou-behind-main">BEHIND THE FAIRY</span>
                <span class="toyou-behind-sub">The girl who carries sunshine wherever she goes.</span>
              </span>
            </button>`;

if (!html.includes('id="btn-toyou-behind"')) {
  if (!html.includes(targetStoryBtn)) {
    console.error('Could not find targetStoryBtn');
    process.exit(1);
  }
  html = html.replace(targetStoryBtn, newBehindBtn);
  console.log('✅ Added #btn-toyou-behind in .toyou-hud-topright');
}

// 3. Add fairy-behind-overlay right after view-toyou-world
const overlayHtml = `
      <!-- ============================================== -->
      <!-- BEHIND THE FAIRY — SECRET STORYBOOK OVERLAY    -->
      <!-- ============================================== -->
      <div class="toyou-behind-overlay" id="fairy-behind-overlay" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Behind the Fairy Storybook">
        <!-- Floating Magical Ambient Particles -->
        <div class="toyou-behind-particles" aria-hidden="true">
          <span class="particle p1">✦</span>
          <span class="particle p2">🌸</span>
          <span class="particle p3">✧</span>
          <span class="particle p4">🦋</span>
          <span class="particle p5">☼</span>
          <span class="particle p6">✨</span>
        </div>

        <div class="toyou-behind-container">
          <!-- Header Bar -->
          <header class="toyou-behind-header">
            <button type="button" class="toyou-behind-back-btn" id="btn-back-fairy-behind" aria-label="Kembali ke TO YOU World">
              <span class="back-arrow">←</span>
              <span>Kembali ke TO YOU</span>
            </button>
            <div class="toyou-behind-title-badge">
              <span class="fairy-badge-icon" aria-hidden="true">🧚‍♀️</span>
              <div>
                <span class="fairy-badge-tag">Our Little Universe · Secret Fairy Journal</span>
                <h1 class="fairy-badge-title">BEHIND THE FAIRY</h1>
              </div>
            </div>
            <button type="button" class="toyou-behind-close-btn" id="btn-close-fairy-behind" aria-label="Tutup Behind the Fairy">✕</button>
          </header>

          <!-- Stepper Navigation (Tabs) -->
          <nav class="toyou-behind-nav" role="tablist" aria-label="Daftar Bab Behind the Fairy">
            <button type="button" class="fairy-behind-tab-btn active" role="tab" aria-selected="true" data-chapter="1">
              <span class="tab-num">Chapter I</span>
              <span class="tab-title">Why a Fairy?</span>
            </button>
            <button type="button" class="fairy-behind-tab-btn" role="tab" aria-selected="false" data-chapter="2">
              <span class="tab-num">Chapter II</span>
              <span class="tab-title">Why TO YOU?</span>
            </button>
            <button type="button" class="fairy-behind-tab-btn" role="tab" aria-selected="false" data-chapter="3">
              <span class="tab-num">Chapter III</span>
              <span class="tab-title">A Letter to My Sunshine</span>
            </button>
            <button type="button" class="fairy-behind-tab-btn" role="tab" aria-selected="false" data-chapter="4">
              <span class="tab-num">Epilogue</span>
              <span class="tab-title">TO YOU</span>
            </button>
          </nav>

          <!-- Deck of Chapters -->
          <main class="toyou-behind-book-deck">

            <!-- CHAPTER I: WHY A FAIRY? -->
            <article class="fairy-behind-chapter-panel active" id="fairy-behind-chapter-1" role="tabpanel" tabindex="0">
              <header class="toyou-behind-page-header">
                <span class="fairy-chapter-badge">Chapter I · The Light Bringer</span>
                <h2 class="fairy-chapter-main-title">Why a Fairy?</h2>
                <p class="fairy-chapter-sub-title">Bukan sekadar sayap bercahaya, melainkan kehangatan yang membuat dunia terasa hidup.</p>
              </header>

              <div class="fairy-chapter-grid">
                <div class="fairy-text-column">
                  <p class="fairy-journal-p drop-cap">
                    Ada alasan mendalam mengapa dari sekian banyak kemungkinan wujud di semesta ini, aku selalu melihat Lala sebagai sosok seorang peri. Di balik pendar sayap tipisnya dan semerbak kelopak bunga yang selalu mekar di setiap langkahnya, peri bukanlah sekadar makhluk dongeng yang manis dan berkilauan, melainkan simbol bagi seseorang yang hadir ke dunia untuk membawa kehangatan, keceriaan, dan kehidupan bagi siapa saja yang berada di sekitarnya.
                  </p>
                  <p class="fairy-journal-p">
                    Lala memiliki energi yang seolah tak pernah padam. Kehadirannya menyerupai mentari pagi pertama yang menembus celah dedaunan basah setelah malam yang panjang dan dingin. Di mana pun ia berada, ia meniupkan semangat baru, membuat tawa kembali terdengar, dan mengubah suasana yang kaku menjadi hangat penuh kehidupan. Kehangatan itu tidak dibuat-buat; ia mengalir secara alami dari ketulusan hatinya yang begitu luas.
                  </p>
                  <div class="fairy-journal-highlight">
                    "Lala adalah seseorang yang sangat peduli kepada orang lain. Ia selalu berusaha hadir dan menolong, bahkan kepada mereka yang mungkin pernah memperlakukannya dengan kurang baik."
                  </div>
                  <p class="fairy-journal-p">
                    Bagi author, hati Lala adalah sesuatu yang luar biasa berharga dan menakjubkan. Di dunia yang sering kali membuat orang menjadi sinis dan menutup diri setelah disakiti, Lala memiliki daya tahan langka: ia tetap memilih untuk memberi kebaikan. Ia mungkin pernah terluka, ia mungkin pernah merasakan kekecewaan yang sunyi, namun kebaikan itu tidak pernah ia racuni dengan dendam. Itulah keajaiban peri yang sesungguhnya—bukan kemampuannya memikat mata dengan kilauan magis, melainkan kemampuannya menjaga agar hatinya tetap lembut dan peduli di tengah dunia yang terkadang begitu keras.
                  </p>
                  <p class="fairy-journal-p">
                    Namun, jangan pernah mengira peri tidak pernah lelah. Jangan menganggap seseorang yang selalu tersenyum berarti tidak pernah meneteskan air mata di balik keheningan. Menjadi orang yang selalu diharapkan membawa cahaya adalah tanggung jawab yang begitu berat. Dan di semesta TO YOU ini, aku ingin menegaskan satu hal penting: <em>sosok yang selalu menjadi matahari bagi orang lain juga berhak mendapatkan pelukan hangat, perhatian tulus, dan cahaya bagi dirinya sendiri.</em>
                  </p>
                  <div class="fairy-journal-quote">
                    "Menjadi peri bukan berarti kebal terhadap rasa sakit, melainkan keberanian untuk tetap menyalakan lentera harapan saat malam terasa begitu dingin."
                  </div>
                </div>

                <aside class="fairy-char-profile-card">
                  <div class="fairy-portrait-frame">
                    <img src="/assets/avatar_lala_hd.png" alt="Lala - The Everglow Fairy" class="fairy-portrait-img" loading="lazy">
                    <span class="fairy-sunbeam-badge">The Everglow Fairy 🧚‍♀️</span>
                  </div>
                  <div class="fairy-specs-list">
                    <div class="fairy-spec-row">
                      <span class="spec-label">Universe</span>
                      <span class="spec-val">TO YOU · Fairy Forest</span>
                    </div>
                    <div class="fairy-spec-row">
                      <span class="spec-label">Element</span>
                      <span class="spec-val">Sunbeam & Blossom Dew</span>
                    </div>
                    <div class="fairy-spec-row">
                      <span class="spec-label">Soul Trait</span>
                      <span class="spec-val">Radiant Kindness & Joy</span>
                    </div>
                    <div class="fairy-spec-row">
                      <span class="spec-label">Sacred Relics</span>
                      <span class="spec-val">Golden Wings, Bloom Lantern</span>
                    </div>
                  </div>
                </aside>
              </div>
            </article>

            <!-- CHAPTER II: WHY TO YOU? -->
            <article class="fairy-behind-chapter-panel" id="fairy-behind-chapter-2" role="tabpanel" tabindex="0">
              <header class="toyou-behind-page-header">
                <span class="fairy-chapter-badge">Chapter II · The Warmth Returned</span>
                <h2 class="fairy-chapter-main-title">Why TO YOU?</h2>
                <p class="fairy-chapter-sub-title">Terinspirasi dari melodi hangat SEVENTEEN — pengingat bahwa kebahagiaan terbesar tersimpan dalam hal-hal sederhana.</p>
              </header>

              <div class="fairy-chapter-grid">
                <div class="fairy-text-column">
                  <p class="fairy-journal-p drop-cap">
                    Ketika mencari nama untuk semesta milik Lala, pikiranku selalu kembali pada sebuah lagu yang sangat istimewa: <em>TO YOU</em> milik SEVENTEEN. Ada sesuatu di dalam irama dan harmoni lagu itu yang tidak bisa dijelaskan dengan kata-kata sederhana—sebuah getaran yang hangat, bahagia, menenangkan, dan sarat akan rasa syukur yang meluap dari dalam dada.
                  </p>
                  <p class="fairy-journal-p">
                    Lagu <em>TO YOU</em> mengingatkan author pada sebuah kebenaran sederhana yang sering kali dilupakan dunia modern: bahwa untuk merasa bahagia, kita tidak selalu membutuhkan hal-hal yang megah atau perayaan yang luar biasa. Terkadang, kebahagiaan sejati hanyalah kehadiran seseorang yang duduk tenang di samping kita, senyuman kecil yang tulus di sela hari yang melelahkan, sebuah pesan singkat yang menanyakan kabar, atau tatapan mata yang memahami tanpa perlu sepatah kata pun diucapkan.
                  </p>
                  <p class="fairy-journal-p">
                    Dan itulah cerminan diri Lala di mata author. Lala adalah sosok yang dalam langkah hariannya selalu ingin membagikan sepotong kecil kebahagiaan kepada siapa saja yang berpapasan dengannya. Di tengah riuhnya kesibukan dan hari-hari yang terus bergulir cepat, ia membuat orang-orang di sekitarnya merasa ditemani, merasa dihargai, dan yang paling penting: merasa tidak sendirian menanggung beban hidup.
                  </p>
                  <div class="fairy-journal-highlight">
                    "Nama TO YOU adalah doa sekaligus pesan tulus dari author untuk Lala: 'Semua kehangatan yang selama ini kamu berikan kepada orang lain, semoga suatu hari kembali kepadamu.'"
                  </div>
                  <p class="fairy-journal-p">
                    Semesta TO YOU diciptakan sebagai tempat berteduh di mana cinta dan kebaikan itu berputar kembali. Di bawah naungan pohon-pohon rimbun berhias pendar kunang-kunang keemasan ini, Lala tidak perlu lagi menjadi pihak yang memberi tanpa jeda. Di sini, semesta ini bernyanyi kembali khusus untuk dirinya: membisikkan bahwa setiap cinta yang pernah ia tabur kini bersiap memeluknya pulang.
                  </p>
                  <div class="fairy-journal-quote">
                    "Kebahagiaan bukan tentang seberapa banyak yang kita genggam, melainkan tentang senyuman sederhana yang berhasil kita nyalakan di hati orang lain."
                  </div>
                </div>

                <aside class="fairy-symbols-card">
                  <div class="fairy-symbols-visual">
                    <svg class="fairy-symbols-svg" width="90" height="90" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="50" cy="50" r="44" stroke="#fde047" stroke-width="2" stroke-dasharray="4 4" opacity="0.6"/>
                      <path d="M50 18 Q62 38 82 50 Q62 62 50 82 Q38 62 18 50 Q38 38 50 18 Z" fill="rgba(254, 240, 138, 0.35)" stroke="#f59e0b" stroke-width="2"/>
                      <circle cx="50" cy="50" r="15" fill="#f59e0b" stroke="#fef08a" stroke-width="2"/>
                      <path d="M50 35 L54 46 L65 50 L54 54 L50 65 L46 54 L35 50 L46 46 Z" fill="#ffffff"/>
                    </svg>
                  </div>
                  <h3 class="fairy-symbols-title">Empat Pilar Jiwa TO YOU</h3>
                  <div class="fairy-symbol-item">
                    <span class="fairy-symbol-icon">☀️</span>
                    <div class="fairy-symbol-info">
                      <strong>The Sunbeam Gift</strong>
                      <p>Membawa seberkas cahaya dan dorongan semangat tanpa pamrih ke setiap sudut yang dingin.</p>
                    </div>
                  </div>
                  <div class="fairy-symbol-item">
                    <span class="fairy-symbol-icon">🌸</span>
                    <div class="fairy-symbol-info">
                      <strong>The Gentle Presence</strong>
                      <p>Hadir menemani dalam keheningan, memastikan bahwa tidak ada seorang pun yang merasa terlupakan.</p>
                    </div>
                  </div>
                  <div class="fairy-symbol-item">
                    <span class="fairy-symbol-icon">🕊️</span>
                    <div class="fairy-symbol-info">
                      <strong>The Unyielding Kindness</strong>
                      <p>Keteguhan hati untuk tetap menyebarkan kebaikan murni meskipun pernah merasakan luka.</p>
                    </div>
                  </div>
                  <div class="fairy-symbol-item">
                    <span class="fairy-symbol-icon">🌿</span>
                    <div class="fairy-symbol-info">
                      <strong>The Reciprocal Grace</strong>
                      <p>Ruang perlindungan suci tempat seluruh kehangatan yang ia bagikan berbalik memeluknya dengan damai.</p>
                    </div>
                  </div>
                </aside>
              </div>
            </article>

            <!-- CHAPTER III: A LETTER TO MY SUNSHINE -->
            <article class="fairy-behind-chapter-panel" id="fairy-behind-chapter-3" role="tabpanel" tabindex="0">
              <header class="toyou-behind-page-header">
                <span class="fairy-chapter-badge">Chapter III · An Author's Heart</span>
                <h2 class="fairy-chapter-main-title">A Letter to My Sunshine</h2>
                <p class="fairy-chapter-sub-title">Sebuah surat tulus dari lubuk hati Lele untuk Lala yang selalu bersinar.</p>
              </header>

              <div class="behind-fairy-parchment">
                <div class="fairy-wax-seal" title="Wax Seal of the Everglow Sanctuary">☼</div>
                <div class="fairy-date-stamp">
                  <span>📅 Pagi Berhias Embun</span>
                  <span>·</span>
                  <span>The Everglow Forest Sanctuary</span>
                </div>
                <h3 class="fairy-letter-salutation">Untuk Sahabatku, Matahariku yang Selalu Bersinar...</h3>
                <div class="fairy-letter-body">
                  <p>
                    Jika surat ini sampai ke hadapanmu di saat angin pagi berhembus lembut melewati jendela pondokmu, aku ingin kamu menarik napas dalam-dalam dan meletakkan semua kesibukanmu sejenak. Duduklah di sini bersamaku di bawah kehangatan sinar mentari yang kamu cintai.
                  </p>
                  <p>
                    Pertama-tama, terima kasih... terima kasih banyak karena kamu sudah memilih untuk ada di dunia ini dan menjadi sosok yang selalu membawa senyuman, tawa, dan gelora semangat bagi kami semua. Aku melihat caramu memandang dunia dengan mata yang selalu mencari kebaikan, dan caramu berusaha membuat hari-hari orang lain terasa lebih ringan hanya dengan keberadaanmu.
                  </p>
                  <p>
                    Terima kasih karena kamu tidak pernah lelah peduli. Bahkan ketika orang-orang mungkin tidak menyadari betapa besarnya usahamu, bahkan ketika kamu pernah diperlakukan dengan kurang adil oleh keadaan atau oleh orang lain, kamu tetap memilih untuk mengulurkan tangan. Kebaikanmu itu bukan kelemahan, Lala; itu adalah keberanian terbesar yang pernah kusaksikan.
                  </p>
                  <div class="fairy-letter-emphasis">
                    "Tapi Lala, dengarkan perkataanku ini baik-baik: Kamu tidak harus selalu ceria demi menyenangkan orang-orang di sekitarmu."
                  </div>
                  <p>
                    Kamu tidak harus selalu menjadi matahari yang tak pernah terbenam. Matahari pun butuh beristirahat ketika malam tiba. Bunga-bunga di hutan peri pun mengatupkan kelopaknya saat hening menjemput. Kamu diizinkan untuk merasa lelah. Kamu berhak merasa sedih, kecewa, bingung, atau membutuhkan seseorang untuk bersandar. Dan sungguh, sangat tidak apa-apa jika sesekali kamu ingin melepaskan senyuman itu dan berkata: <em>'Hari ini aku tidak kuat, tolong temani aku.'</em>
                  </p>
                  <p>
                    Jangan pernah merasa bahwa orang-orang hanya menyayangimu saat kamu ceria dan penuh energi. Kami menyayangimu seutuhnya—dengan segala kelelahanmu, kerapuhanmu, dan keheninganmu. Kamu tidak harus selalu menjadi pihak yang memberi kehangatan; kamu juga pantas menerima kehangatan yang melimpah dari orang-orang yang tulus mencintaimu.
                  </p>
                  <p>
                    Semoga semua kebaikan yang pernah kamu tabur dengan tulus kembali kepadamu dalam bentuk damai yang abadi, pelukan yang menenangkan, dan kebahagiaan yang tak pernah habis. Kamu adalah keajaiban yang nyata bagi semesta ini.
                  </p>
                </div>
                <div class="fairy-letter-signoff">
                  <p>Dengan seluruh rasa syukur, kehangatan, dan pelukan paling tulus,</p>
                  <strong>— Author of Our Little Universe (Lele) · Dedicated to Lala —</strong>
                </div>
              </div>
            </article>

            <!-- EPILOGUE: TO YOU -->
            <article class="fairy-behind-chapter-panel" id="fairy-behind-chapter-4" role="tabpanel" tabindex="0">
              <header class="toyou-behind-page-header">
                <span class="fairy-chapter-badge">Epilogue · Melody of Gratitude</span>
                <h2 class="fairy-chapter-main-title">Melody of TO YOU</h2>
                <p class="fairy-chapter-sub-title">A tribute to SEVENTEEN's heartwarming masterpiece that inspired this haven.</p>
              </header>

              <div class="fairy-epilogue-container">
                <!-- YouTube Music Player Card -->
                <div class="fairy-song-player-card">
                  <div class="fairy-track-bar">
                    <div class="fairy-track-left">
                      <span class="fairy-track-disc" aria-hidden="true">💿</span>
                      <div>
                        <span class="fairy-track-title">TO YOU (소용돌이)</span>
                        <span class="fairy-track-artist">SEVENTEEN · 9th Mini Album 'Attacca' (2021)</span>
                      </div>
                    </div>
                    <span class="fairy-track-badge">Official Video · YouTube nocookie</span>
                  </div>

                  <div class="fairy-youtube-box">
                    <iframe id="fairy-youtube-iframe"
                      src="https://www.youtube-nocookie.com/embed/g9JL4YrBqng?enablejsapi=1"
                      title="SEVENTEEN - TO YOU"
                      allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen>
                    </iframe>
                  </div>
                  <p class="fairy-player-hint">
                    🎵 Sentuh tombol Play untuk mendengarkan lagu. Audio otomatis berhenti saat overlay ditutup atau kamu berpindah chapter.
                  </p>
                </div>

                <!-- Song Meaning & Interpretation Section -->
                <div class="fairy-meaning-card">
                  <div class="fairy-meaning-header">
                    <span class="fairy-meaning-icon" aria-hidden="true">📖</span>
                    <div>
                      <h3 class="fairy-meaning-title">The Heartbeat Behind TO YOU</h3>
                      <p class="fairy-meaning-sub">Interpretasi Orisinal & Makna Personal Author mengenai Lagu TO YOU — SEVENTEEN</p>
                    </div>
                  </div>
                  <div class="fairy-meaning-body">
                    <p>
                      Bagi author dan semesta TO YOU, lagu ini bukanlah sekadar komposisi pop rock yang manis; ia adalah sebuah perlindungan jiwa di tengah badai kehidupan yang tak terduga. Lirik dan melodinya menggambarkan bagaimana pusaran angin kencang dan kekacauan dunia mendadak hening dan damai seketika saat kita menyadari ada satu sosok yang memandang kita dengan penuh ketulusan dan penerimaan.
                    </p>
                    <p>
                      Petikan gitar dinamis dan harmoni vokal yang hangat menyampaikan sebuah pesan mendalam: bahwa cinta dan kebaikan sejati tidak pernah menuntut kemegahan. Keberadaan seseorang yang rela melangkah beriringan di samping kita, saling menguatkan saat dunia terasa runtuh, adalah hadiah terindah yang bisa kita terima dalam hidup. Dan untuk Lala, semesta TO YOU ini adalah persembahan terima kasih abadi atas setiap sinar hangat yang telah ia pancarkan ke dalam hidup kami.
                    </p>
                    <a href="https://www.youtube.com/watch?v=g9JL4YrBqng"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="fairy-external-link">
                      <span>🔗 Buka Video Musik Resmi TO YOU di YouTube</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </div>

                <!-- Closing Atmosphere & Quote -->
                <div class="fairy-closing-atmosphere">
                  <div class="fairy-closing-halo" aria-hidden="true">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#fde047" stroke-width="1.5">
                      <circle cx="12" cy="12" r="9"/>
                      <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
                      <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                    </svg>
                  </div>
                  <div class="fairy-closing-quote-wrap">
                    <span class="fairy-quote-symbol-top">“</span>
                    <blockquote class="fairy-closing-quote">
                      Di antara jutaan badai di dunia ini, kehangatan sederhanamu adalah alasan seseorang mampu melangkah lagi. Terima kasih sudah menjadi matahariku, Lala.
                    </blockquote>
                    <span class="fairy-quote-symbol-bottom">”</span>
                  </div>
                  <span class="fairy-closing-author">— Author of Our Little Universe (Lele) · Dedicated to Lala —</span>
                </div>
              </div>
            </article>

          </main>

          <!-- Footer Navigation Bar -->
          <footer class="toyou-behind-footer">
            <button type="button" class="toyou-behind-nav-btn" id="btn-fairy-behind-prev" disabled>
              <span>←</span>
              <span>Previous Chapter</span>
            </button>
            <div class="fairy-chapter-indicators" role="tablist" aria-label="Indikator Bab">
              <button type="button" class="fairy-indicator-dot active" data-chapter="1" aria-label="Bab 1: Why a Fairy?"></button>
              <button type="button" class="fairy-indicator-dot" data-chapter="2" aria-label="Bab 2: Why TO YOU?"></button>
              <button type="button" class="fairy-indicator-dot" data-chapter="3" aria-label="Bab 3: A Letter to My Sunshine"></button>
              <button type="button" class="fairy-indicator-dot" data-chapter="4" aria-label="Epilog: TO YOU"></button>
            </div>
            <button type="button" class="toyou-behind-nav-btn" id="btn-fairy-behind-next">
              <span>Next Chapter</span>
              <span>→</span>
            </button>
          </footer>
        </div>
      </div>
`;

// Insert overlay right after </section> of view-toyou-world
const targetSectionEnd = `              <button type="button" class="btn-decor-reset" id="btn-toyou-decor-reset">Reset Default</button>
            </div>
          </div>

        </div>

      </section>`;

if (!html.includes('id="fairy-behind-overlay"')) {
  if (!html.includes(targetSectionEnd)) {
    console.error('Could not find targetSectionEnd');
    process.exit(1);
  }
  html = html.replace(targetSectionEnd, targetSectionEnd + '\n' + overlayHtml);
  console.log('✅ Added #fairy-behind-overlay after view-toyou-world');
}

fs.writeFileSync(filePath, html, 'utf8');
console.log('🎉 index.html successfully updated for BEHIND THE FAIRY!');
