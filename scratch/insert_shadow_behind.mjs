import fs from 'fs';

const htmlPath = 'index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// 1. Insert CSS link into <head>
if (!html.includes('shadow_behind.css')) {
  html = html.replace(
    '<link rel="stylesheet" href="/toyou_behind.css">',
    '<link rel="stylesheet" href="/toyou_behind.css">\n  <link rel="stylesheet" href="/shadow_behind.css">'
  );
  console.log('Added shadow_behind.css link in <head>');
}

// 2. Insert Button into .shadow-hud-topright
const buttonMarkup = `            <button type="button" class="univ-goto-btn shadow-behind-pill" id="btn-shadow-behind"
              aria-label="Buka Rahasia Behind the Shadow">
              <span class="goto-icon">🌓</span>
              <span class="shadow-behind-label">
                <span class="shadow-behind-main">BEHIND THE SHADOW</span>
                <span class="shadow-behind-sub">The angel I became, the devil I never truly left.</span>
              </span>
            </button>`;

if (!html.includes('id="btn-shadow-behind"')) {
  html = html.replace(
    '<div class="shadow-user-pill" id="shadow-user-pill">',
    `${buttonMarkup}\n\n            <div class="shadow-user-pill" id="shadow-user-pill">`
  );
  console.log('Added #btn-shadow-behind button in .shadow-hud-topright');
}

// 3. Construct #shadow-behind-overlay
const overlayMarkup = `
      <!-- ============================================== -->
      <!-- FEATURE: BEHIND THE SHADOW (LELE · SHADOW)     -->
      <!-- ============================================== -->
      <div class="shadow-behind-overlay" id="shadow-behind-overlay" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Behind the Shadow Storybook">
        <!-- Floating Midnight & Ethereal Particles -->
        <div class="shadow-behind-particles" aria-hidden="true">
          <span class="particle p1">✦</span>
          <span class="particle p2">☽</span>
          <span class="particle p3">✧</span>
          <span class="particle p4">🌑</span>
          <span class="particle p5">⋆</span>
          <span class="particle p6">✨</span>
        </div>

        <div class="shadow-behind-container">
          <!-- Header Bar -->
          <header class="shadow-behind-header">
            <button type="button" class="shadow-behind-back-btn" id="btn-back-shadow-behind" aria-label="Kembali ke Universe SHADOW">
              <span class="back-arrow">←</span>
              <span>Kembali ke SHADOW</span>
            </button>
            <div class="shadow-behind-title-badge">
              <span class="shadow-badge-icon" aria-hidden="true">🌓</span>
              <div>
                <span class="shadow-badge-tag">Our Little Universe · Secret Reflection Journal</span>
                <h1 class="shadow-badge-title">BEHIND THE SHADOW</h1>
                <p class="shadow-badge-subtitle">The angel I became, the devil I never truly left.</p>
              </div>
            </div>
            <button type="button" class="shadow-behind-close-btn" id="btn-close-shadow-behind" aria-label="Tutup Behind the Shadow">
              <span aria-hidden="true">✕</span>
            </button>
          </header>

          <!-- Chapter Navigation Tabs -->
          <nav class="shadow-behind-nav" role="tablist" aria-label="Daftar Bab Behind the Shadow">
            <button type="button" class="shadow-behind-tab-btn active" role="tab" aria-selected="true" data-chapter="1">
              <span class="tab-num">I</span>
              <span class="tab-label">Why Half Angel, Half Devil?</span>
            </button>
            <button type="button" class="shadow-behind-tab-btn" role="tab" aria-selected="false" data-chapter="2">
              <span class="tab-num">II</span>
              <span class="tab-label">Why SHADOW?</span>
            </button>
            <button type="button" class="shadow-behind-tab-btn" role="tab" aria-selected="false" data-chapter="3">
              <span class="tab-num">III</span>
              <span class="tab-label">To the Shadow I Kept Running From</span>
            </button>
            <button type="button" class="shadow-behind-tab-btn" role="tab" aria-selected="false" data-chapter="4">
              <span class="tab-num">IV</span>
              <span class="tab-label">Epilogue: SHADOW</span>
            </button>
          </nav>

          <!-- Book Content Deck (Scrollable Pages) -->
          <main class="shadow-behind-book-deck">

            <!-- ============================================== -->
            <!-- CHAPTER I: WHY HALF ANGEL, HALF DEVIL?          -->
            <!-- ============================================== -->
            <article class="shadow-behind-chapter-panel active" id="shadow-behind-chapter-1" role="tabpanel" tabindex="0" aria-label="Bab I: Why Half Angel, Half Devil?">
              <header class="shadow-behind-page-header">
                <span class="shadow-chapter-kicker">CHAPTER I</span>
                <h2 class="shadow-chapter-main-title">WHY HALF ANGEL, HALF DEVIL?</h2>
                <p class="shadow-chapter-sub-title">The angel I became, the devil I never truly left.</p>
              </header>

              <div class="shadow-journal-quote">
                <p>“Aku tidak terlahir sebagai malaikat. Kebaikan yang kuberikan hari ini adalah pilihan sadar yang kuperjuangkan setiap hari dari reruntuhan bayanganku sendiri.”</p>
              </div>

              <!-- Character Identity Profile Card -->
              <div class="shadow-char-profile-card">
                <div class="shadow-profile-header">
                  <div class="shadow-profile-avatar-wrap">
                    <img src="/assets/chibi_lele_avatar.png" alt="Lele — The Eclipse Guardian" class="shadow-profile-avatar" loading="lazy" decoding="async">
                    <span class="shadow-profile-badge">🌓 Half Angel, Half Devil</span>
                  </div>
                  <div class="shadow-profile-meta">
                    <h3 class="shadow-profile-name">Lele</h3>
                    <p class="shadow-profile-role">The Eclipse Guardian · Crystal Moon Sanctuary</p>
                    <p class="shadow-profile-quote">“Find your light in the darkness.”</p>
                  </div>
                </div>
                <div class="shadow-profile-traits">
                  <span class="shadow-trait-tag">Empathetic Listener</span>
                  <span class="shadow-trait-tag">Quiet Protector</span>
                  <span class="shadow-trait-tag">Deeply Loyal</span>
                  <span class="shadow-trait-tag">Guarded Heart</span>
                  <span class="shadow-trait-tag">Sharp Instinct</span>
                  <span class="shadow-trait-tag">Silent Memory</span>
                </div>
              </div>

              <div class="shadow-story-prose">
                <p>
                  Banyak orang yang mengenal Lele hari ini melihat sosok yang teduh, pendengar yang sabar, dan seseorang yang selalu berusaha ada ketika orang lain membutuhkan pertolongan. Namun, bagi sang author, Lele bukanlah malaikat yang turun dari langit tanpa cela. Lele adalah perwujudan dari dua sisi yang bertolak belakang: <strong>setengah malaikat dan setengah iblis</strong>. Bukan karena ia memiliki dua kepribadian yang terpisah, melainkan karena ada dua kutub karakter yang tumbuh, bertarung, dan hidup berdampingan di dalam satu jiwa.
                </p>

                <h3 class="shadow-section-title">THE ANGEL — Sisi Malaikat yang Bersinar</h3>
                <p>
                  Ketika Lele sudah merasa nyaman dan mempercayai seseorang, ia bisa menjadi sosok yang luar biasa hangat dan penuh perhatian. Ia adalah orang yang:
                </p>
                <ul class="shadow-story-list">
                  <li><strong>Memberikan yang terbaik tanpa menuntut pamrih:</strong> Ia memberi perhatian, waktu, dan ketulusan tanpa menghitung untung rugi atau menuntut orang lain membalasnya dengan hal yang setara.</li>
                  <li><strong>Pendengar yang tulus:</strong> Bersedia duduk berjam-jam mendengarkan keluh kesah dan kerapuhan orang lain, menyimpan rahasia mereka dengan rapat di tempat yang paling aman.</li>
                  <li><strong>Membantu sebisanya:</strong> Bahkan ketika dirinya sendiri sedang lelah atau tidak selalu diperlakukan dengan adil oleh dunia, tangannya tetap terulur untuk menopang orang lain.</li>
                  <li><strong>Memberi ruang untuk memaafkan:</strong> Masih bisa membuka pintu komunikasi dan bersikap santun kepada seseorang yang pernah menyakiti perasaannya.</li>
                  <li><strong>Memahami dan bertahan:</strong> Berusaha melihat dari sudut pandang orang lain dan tidak mudah meninggalkan ikatan yang sudah ia anggap berarti.</li>
                </ul>
                <p>
                  Bagi sang author, sisi ini terasa seperti malaikat sejati. Kebaikan yang ia curahkan murni dan hangat. Namun, kebaikan itu bukanlah kepolosan tanpa rasa sakit. Di balik senyum malaikatnya, Lele adalah manusia yang tetap bisa merasa hancur, kecewa, dan terluka ketika ketulusannya disia-siakan.
                </p>

                <h3 class="shadow-section-title">THE DEVIL — Sisi Iblis yang Dingin dan Tersembunyi</h3>
                <p>
                  Sebelum sisi malaikatnya berkembang dan menemukan kedamaian, Lele pernah hidup lebih lama di bawah kendali sisi iblisnya. Masa lalunya membentuk mekanisme pertahanan diri yang keras dan tidak kenal ampun:
                </p>
                <ul class="shadow-story-list">
                  <li><strong>Egois dan berjarak:</strong> Cenderung mengutamakan kepentingan dirinya sendiri di atas segalanya demi memastikan ia tidak pernah menjadi pihak yang dirugikan.</li>
                  <li><strong>Sangat selektif dalam berteman:</strong> Dahulu menilai hubungan berdasarkan manfaat timbal balik dan nilai guna yang bisa dihasilkan.</li>
                  <li><strong>Licik dan penuh perhitungan:</strong> Pandai membaca situasi, melihat celah kelemahan lawan bicara, dan merancang langkah seperti permainan catur yang tak kasat mata.</li>
                  <li><strong>Dingin ketika kehilangan kepercayaan:</strong> Begitu batas toleransinya terlewati, pintu hatinya tertutup rapat dan menjadi sangat dingin, tanpa ada kesempatan untuk negosiasi.</li>
                  <li><strong>Ingatan yang panjang terhadap luka:</strong> Tidak mudah melupakan kesalahan orang lain dan menyimpan rekaman setiap perlakuan buruk yang pernah ia terima.</li>
                </ul>
                <p>
                  Ia memiliki kemampuan untuk memanfaatkan situasi dan orang lain demi mencapai tujuannya. Sisi manipulatif ini bukanlah sesuatu yang patut diagungkan, melainkan bagian dari cacat karakter nyata yang diakui secara jujur. Ketika seseorang mengkhianatinya, sisi ini bisa kembali melintas: Lele masih bisa tersenyum dan berbicara santai di hadapan orang tersebut, namun di balik tatapan matanya, ia tidak pernah benar-benar melupakan apa yang terjadi. Ia bukan sosok yang mudah memberikan maaf untuk kedua kalinya.
                </p>

                <div class="shadow-callout-box">
                  <h4 class="shadow-callout-title">Dua Kutub di Satu Jiwa</h4>
                  <p>
                    Kedua sisi tersebut bukan sekadar label baik dan jahat. Sisi malaikat menunjukkan bagaimana ia memperlakukan orang-orang yang disayanginya, sedangkan sisi iblis menunjukkan bagaimana ia pernah memandang dunia dan bagaimana ia melindungi dirinya saat kepercayaannya dihancurkan. Lele membuktikan bahwa seseorang bisa memiliki sisi yang paling lembut sekaligus sisi yang paling sulit untuk ditembus.
                  </p>
                </div>
              </div>
            </article>

            <!-- ============================================== -->
            <!-- CHAPTER II: WHY SHADOW?                         -->
            <!-- ============================================== -->
            <article class="shadow-behind-chapter-panel" id="shadow-behind-chapter-2" role="tabpanel" tabindex="0" aria-label="Bab II: Why SHADOW?">
              <header class="shadow-behind-page-header">
                <span class="shadow-chapter-kicker">CHAPTER II</span>
                <h2 class="shadow-chapter-main-title">WHY SHADOW?</h2>
                <p class="shadow-chapter-sub-title">The shadow that follows wherever the light falls.</p>
              </header>

              <div class="shadow-journal-quote">
                <p>“Seberapa kencang pun kau berlari mengejar cahaya, bayanganmu tidak pernah tertinggal di belakang. Ia selalu ada, melangkah di sampingmu.”</p>
              </div>

              <!-- Philosophical Symbols Grid -->
              <div class="shadow-symbols-card">
                <div class="shadow-symbol-item">
                  <span class="shadow-sym-icon">♟️</span>
                  <h4 class="shadow-sym-title">The Chessboard</h4>
                  <p class="shadow-sym-desc">Kecerdikan kalkulatif dan insting strategis yang pernah menjadi perisai utama untuk bertahan hidup.</p>
                </div>
                <div class="shadow-symbol-item">
                  <span class="shadow-sym-icon">🪞</span>
                  <h4 class="shadow-sym-title">The Broken Mirror</h4>
                  <p class="shadow-sym-desc">Cermin refleksi yang memantulkan ketakutan terbesar: melihat kembali bayangan kelam yang pernah dibenci.</p>
                </div>
                <div class="shadow-symbol-item">
                  <span class="shadow-sym-icon">⚖️</span>
                  <h4 class="shadow-sym-title">The Silent Scale</h4>
                  <p class="shadow-sym-desc">Timbangan batin yang menimbang antara keinginan untuk memaafkan dan ingatan tajam akan rasa sakit.</p>
                </div>
                <div class="shadow-symbol-item">
                  <span class="shadow-sym-icon">🛡️</span>
                  <h4 class="shadow-sym-title">The Shadow Armor</h4>
                  <p class="shadow-sym-desc">Bukan senjata untuk menyakiti orang lain, melainkan baju zirah batin agar hati tidak hancur untuk kedua kalinya.</p>
                </div>
              </div>

              <div class="shadow-story-prose">
                <p>
                  Mengapa universe Lele diberi nama <strong>SHADOW</strong>? Nama ini terinspirasi langsung dari lagu mendalam karya SEVENTEEN yang bertajuk <em>“Shadow”</em>. Bagi sang author, lirik, nada, dan esensi lagu tersebut menyuarakan pergulatan batin Lele secara sempurna.
                </p>
                <p>
                  Ketika Lele mulai bertumbuh dan lebih nyaman dengan sisi malaikatnya, ia memiliki lebih banyak teman, ikatan yang berharga, dan kebahagiaan sejati saat berbagi kebaikan. Seiring dengan itu, muncul kebencian mendalam terhadap sisi iblisnya. Ia tidak ingin sisi tersebut bangkit kembali. Ada ketakutan hebat bahwa orang-orang yang kini mencintainya akan berpaling jika melihat bayangan dingin dan manipulatif yang pernah ia miliki.
                </p>
                <p>
                  Ia mencoba berlari. Ia mencoba membuang jauh-jauh kenangan tentang siapa dirinya di masa lalu. Namun, semakin keras ia berusaha mengubur sisi kelamnya, semakin ia tersadar akan satu kenyataan tak terbantahkan: <strong>bayangan selalu mengikuti ke mana pun seseorang melangkah, terutama ketika ia mendekati cahaya yang paling terang.</strong>
                </p>
                <p>
                  Lagu <em>Shadow</em> mengajarkan bahwa bayangan bukanlah musuh yang harus dihancurkan sampai tiada. Bayangan adalah bukti bahwa kita nyata dan memiliki wujud. Rasa tidak suka terhadap kelemahan diri di masa lalu adalah hal yang wajar, namun menolak keberadaannya hanya akan memperpanjang perang batin yang melelahkan.
                </p>
                <p>
                  Universe SHADOW diciptakan bukan sebagai tempat pemujaan kegelapan, melainkan sebagai tempat suci untuk berdamai. Menerima bayangan bukan berarti membiarkannya kembali berkuasa dan menyakiti orang lain. Menerima bayangan berarti memiliki kedewasaan untuk berkata: <em>“Aku tahu bagian kelam itu pernah ada, namun hari ini aku memiliki kendali untuk memilih menjadi terang.”</em>
                </p>
              </div>
            </article>

            <!-- ============================================== -->
            <!-- CHAPTER III: TO THE SHADOW I KEPT RUNNING FROM  -->
            <!-- ============================================== -->
            <article class="shadow-behind-chapter-panel" id="shadow-behind-chapter-3" role="tabpanel" tabindex="0" aria-label="Bab III: To the Shadow I Kept Running From">
              <header class="shadow-behind-page-header">
                <span class="shadow-chapter-kicker">CHAPTER III</span>
                <h2 class="shadow-chapter-main-title">TO THE SHADOW I KEPT RUNNING FROM</h2>
                <p class="shadow-chapter-sub-title">A personal letter from the author to Lele.</p>
              </header>

              <!-- Author's Parchment Letter -->
              <div class="shadow-parchment-letter">
                <div class="shadow-parchment-seal" aria-hidden="true">
                  <span class="seal-icon">🌓</span>
                </div>
                <div class="shadow-letter-header">
                  <span class="shadow-letter-date">Midnight Hour · Crystal Moon Sanctuary</span>
                  <h3 class="shadow-letter-salutation">Untuk Lele, dan Bayangan yang Selalu Menyertainya:</h3>
                </div>

                <div class="shadow-letter-body">
                  <p>
                    Aku tahu kamu jauh lebih nyaman dengan sisi malaikatmu sekarang. Aku melihat bagaimana kamu tersenyum dengan lebih lepas, bagaimana kamu berusaha ada untuk teman-temanmu, dan bagaimana kamu mencurahkan perhatian tanpa menuntut balasan. Aku bangga melihat versi dirimu yang hari ini.
                  </p>
                  <p>
                    Namun, aku juga tahu ketakutan yang sering kamu simpan sendirian di keheningan malam. Kamu takut orang lain melihat sisi iblismu. Kamu takut ada orang yang mengetahui bahwa di balik ketenanganmu, kamu pernah bersikap egois, perhitungan, dingin, dan bahkan manipulatif demi menyelamatkan dirimu sendiri.
                  </p>
                  <p>
                    Dengarkan aku baik-baik: <strong>kamu tidak harus membenci dirimu hanya karena kamu pernah memiliki bagian yang tidak kamu sukai.</strong>
                  </p>
                  <p>
                    Kamu boleh mengakui bahwa dahulu kamu pernah egois. Kamu boleh jujur bahwa kamu pernah menilai orang lain berdasarkan kepentingannya, dan kamu pernah begitu licik saat keadaan memaksamu untuk tidak percaya pada siapa pun. Aku tidak memintamu membenarkan kesalahan itu, apalagi menjadikannya alasan untuk kembali mempermainkan atau menyakiti orang lain. Sama sekali tidak.
                  </p>
                  <p>
                    Tetapi kamu harus menyadari bahwa kamu sudah bertumbuh begitu jauh. Rasa sakit yang kamu alami di masa lalu adalah alasan mengapa cangkang itu pernah terbentuk, namun sekarang kamu telah memilih jalan yang berbeda. Kamu tidak perlu menghapus sejarahmu untuk membuktikan kepada siapa pun bahwa kamu telah berubah menjadi pribadi yang lebih baik.
                  </p>
                  <p>
                    Aku tidak ingin kamu kembali menjadi sosok dingin di masa lalu. Tetapi aku juga tidak ingin kamu menghabiskan sisa hidupmu dengan membenci bayanganmu sendiri. Berhentilah berlari dari dirimu. Bayanganmu tidak ingin menelanmu—ia hanya ingin kamu tahu bahwa kamu telah selamat.
                  </p>
                </div>

                <div class="shadow-letter-signature">
                  <p class="shadow-sign-line">Dengan segala pemahaman dan kejujuran,</p>
                  <p class="shadow-sign-author">— Sang Author (Lele's Creator) —</p>
                  <span class="shadow-sign-stamp">VERITAS ET UMBRA · 2026</span>
                </div>
              </div>
            </article>

            <!-- ============================================== -->
            <!-- CHAPTER IV: EPILOGUE: SHADOW                    -->
            <!-- ============================================== -->
            <article class="shadow-behind-chapter-panel" id="shadow-behind-chapter-4" role="tabpanel" tabindex="0" aria-label="Bab IV: Epilogue: SHADOW">
              <header class="shadow-behind-page-header">
                <span class="shadow-chapter-kicker">CHAPTER IV</span>
                <h2 class="shadow-chapter-main-title">EPILOGUE: SHADOW</h2>
                <p class="shadow-chapter-sub-title">The eclipse where light and darkness finally make peace.</p>
              </header>

              <!-- YouTube Music Showcase Card -->
              <div class="shadow-player-card">
                <div class="shadow-player-header">
                  <span class="shadow-music-pill">🎵 OFFICIAL INSPIRATION</span>
                  <h3 class="shadow-music-title">SEVENTEEN — “Shadow”</h3>
                  <p class="shadow-music-meta">From the album <em>Face the Sun</em> · Lagu Inspirasi Utama Universe SHADOW</p>
                </div>

                <div class="shadow-player-frame-wrap">
                  <iframe
                    id="shadow-youtube-iframe"
                    class="shadow-youtube-frame"
                    src="https://www.youtube-nocookie.com/embed/8WA9iFj_g9s?enablejsapi=1"
                    title="SEVENTEEN - Shadow (Official Audio / Video)"
                    frameborder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowfullscreen
                    loading="lazy">
                  </iframe>
                </div>

                <div class="shadow-player-caption">
                  <span class="player-tip-icon">💡</span>
                  <p>Tekan tombol Play untuk mendengarkan lagu secara manual. Video akan otomatis berhenti saat jendela ini ditutup.</p>
                  <a href="https://www.youtube.com/watch?v=8WA9iFj_g9s" target="_blank" rel="noopener noreferrer" class="shadow-ext-link">
                    Tonton di YouTube ↗
                  </a>
                </div>
              </div>

              <!-- Philosophical Meaning Card -->
              <div class="shadow-meaning-card">
                <h3 class="shadow-meaning-heading">The Meaning Behind the Song</h3>
                <p>
                  Lagu <em>“Shadow”</em> bukan sekadar lantunan melodi yang indah. Bagi Lele, lagu ini adalah pengingat bahwa proses berdamai dengan diri sendiri membutuhkan keberanian untuk menatap bayangan tanpa rasa benci.
                </p>
                <p>
                  Akan selalu ada hari-hari di mana kenangan buruk kembali mengetuk pintu. Akan ada saat-saat di mana insting dingin dan perhitungan itu melintas kembali di benak ketika seseorang berbuat jahat. Namun, kemunculan kilatan itu tidak membuat semua pertumbuhan yang telah dilalui menjadi sia-sia.
                </p>
                <p>
                  Lele tidak perlu menjadi malaikat suci tanpa noda untuk layak dicintai, dan ia tidak harus menjadi iblis hanya karena dunia pernah membuatnya terluka. Ia selalu memiliki pilihan untuk berjalan dalam kebaikan, dengan bayangannya yang setia menemani di sisinya.
                </p>
              </div>

              <!-- Mandatory Closing Quotes -->
              <div class="shadow-closing-quote-wrap">
                <div class="shadow-quote-symbol-top">“</div>
                <blockquote class="shadow-closing-quote">
                  You don't have to destroy your shadow to become the light. You only have to stop running from the parts of yourself you never learned to understand.
                </blockquote>
                <p class="shadow-closing-echo">
                  “Even in the brightest light, I will still be your shadow.”
                </p>
                <div class="shadow-quote-symbol-bottom">”</div>
                <p class="shadow-closing-author">— Lele · The Eclipse Guardian of SHADOW —</p>
              </div>
            </article>

          </main>

          <!-- Footer Chapter Navigation Controls -->
          <footer class="shadow-behind-footer">
            <button type="button" class="shadow-behind-nav-btn" id="btn-shadow-behind-prev" disabled>
              <span>←</span>
              <span>Previous Chapter</span>
            </button>
            <div class="shadow-chapter-indicators" role="tablist" aria-label="Indikator Bab">
              <button type="button" class="shadow-indicator-dot active" data-chapter="1" aria-label="Bab 1: Why Half Angel, Half Devil?"></button>
              <button type="button" class="shadow-indicator-dot" data-chapter="2" aria-label="Bab 2: Why SHADOW?"></button>
              <button type="button" class="shadow-indicator-dot" data-chapter="3" aria-label="Bab 3: To the Shadow I Kept Running From"></button>
              <button type="button" class="shadow-indicator-dot" data-chapter="4" aria-label="Bab 4: Epilogue: SHADOW"></button>
            </div>
            <button type="button" class="shadow-behind-nav-btn" id="btn-shadow-behind-next">
              <span>Next Chapter</span>
              <span>→</span>
            </button>
          </footer>
        </div>
      </div>
`;

if (!html.includes('id="shadow-behind-overlay"')) {
  // Insert right after the closing tag of view-shadow-world section
  const targetTag = '</section>\n\n      <!-- ============================================== -->\n      <!-- VIEW: THE ECLIPSE — THE AUTHOR\'S ETERNAL SANCTUARY -->';
  if (html.includes(targetTag)) {
    html = html.replace(targetTag, `</section>\n${overlayMarkup}\n      <!-- ============================================== -->\n      <!-- VIEW: THE ECLIPSE — THE AUTHOR'S ETERNAL SANCTUARY -->`);
    console.log('Inserted #shadow-behind-overlay after view-shadow-world section');
  } else {
    // Fallback: search for id="view-eclipse"
    const eclipseIdx = html.indexOf('id="view-eclipse"');
    if (eclipseIdx !== -1) {
      const sectionEnd = html.lastIndexOf('</section>', eclipseIdx);
      if (sectionEnd !== -1) {
        html = html.slice(0, sectionEnd + 10) + '\n' + overlayMarkup + '\n' + html.slice(sectionEnd + 10);
        console.log('Inserted #shadow-behind-overlay before view-eclipse section');
      }
    }
  }
}

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('Successfully updated index.html with BEHIND THE SHADOW markup!');
