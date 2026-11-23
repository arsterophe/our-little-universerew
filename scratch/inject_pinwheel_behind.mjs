import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf8');
const isCrlf = html.includes('\r\n');
if (isCrlf) {
  html = html.replace(/\r\n/g, '\n');
}

// 1. Inject #btn-pinwheel-behind into .pinwheel-header-right
const targetHeader = `            <!-- C. Right: Settings Button -->
            <div class="pinwheel-header-right">
              <button type="button" class="pinwheel-settings-btn" id="btn-pinwheel-settings" aria-label="Pengaturan Universe" title="Settings">
                <span>⚙</span>
              </button>
            </div>`;

const replacementHeader = `            <!-- C. Right: Settings Button & Behind the Pinwheel Pill -->
            <div class="pinwheel-header-right">
              <button type="button" class="pinwheel-behind-pill" id="btn-pinwheel-behind" title="Buka Cerita Rahasia: BEHIND THE PINWHEEL">
                <span class="pinwheel-behind-icon" aria-hidden="true">🎐</span>
                <span class="pinwheel-behind-label">
                  <span class="pinwheel-behind-main">BEHIND THE PINWHEEL</span>
                  <span class="pinwheel-behind-sub">A Future Self Is Waiting for You</span>
                </span>
                <span class="pinwheel-behind-sparkle" aria-hidden="true">✦</span>
              </button>
              <button type="button" class="pinwheel-settings-btn" id="btn-pinwheel-settings" aria-label="Pengaturan Universe" title="Settings">
                <span>⚙</span>
              </button>
            </div>`;

if (!html.includes('id="btn-pinwheel-behind"')) {
  if (html.includes(targetHeader)) {
    html = html.replace(targetHeader, replacementHeader);
    console.log('✅ Injected #btn-pinwheel-behind into pinwheel-header-right');
  } else {
    console.error('❌ Could not find targetHeader in index.html');
    process.exit(1);
  }
}

// 2. Build complete #pinwheel-behind-overlay markup
const overlayMarkup = `
        <!-- ============================================== -->
        <!-- BEHIND THE PINWHEEL — SECRET STORYTELLING MEMOIR -->
        <!-- ============================================== -->
        <div class="pinwheel-behind-overlay" id="pinwheel-behind-overlay" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Behind the Pinwheel Memoir">
          
          <div class="pinwheel-behind-backdrop" aria-hidden="true"></div>
          
          <!-- Floating Ambient Particles -->
          <div class="pinwheel-behind-particles" aria-hidden="true">
            <span class="particle p1">🎐</span>
            <span class="particle p2">✦</span>
            <span class="particle p3">🌸</span>
            <span class="particle p4">🦊</span>
            <span class="particle p5">✧</span>
            <span class="particle p6">🍃</span>
          </div>

          <div class="pinwheel-behind-wind-glow" aria-hidden="true"></div>

          <div class="pinwheel-behind-container">

            <!-- 1. Header Bar -->
            <header class="pinwheel-behind-header">
              <button type="button" class="pinwheel-behind-back-btn" id="btn-back-pinwheel-behind" aria-label="Kembali ke PINWHEEL">
                <span class="back-arrow">←</span>
                <span>Kembali ke PINWHEEL</span>
              </button>

              <div class="pinwheel-behind-title-badge">
                <span class="pinwheel-badge-icon" aria-hidden="true">🎐</span>
                <div>
                  <span class="pinwheel-badge-tag">Our Little Universe · Secret Kitsune Memoir</span>
                  <h1 class="pinwheel-badge-title">BEHIND THE PINWHEEL</h1>
                </div>
              </div>

              <button type="button" class="pinwheel-behind-close-btn" id="btn-close-pinwheel-behind" aria-label="Tutup Behind the Pinwheel">✕</button>
            </header>

            <!-- 2. Reading Progress Track -->
            <div class="pinwheel-behind-progress-track" aria-hidden="true">
              <div class="pinwheel-behind-progress-bar" id="pinwheel-behind-progress-bar"></div>
            </div>

            <!-- 3. Stepper Navigation (5 Tabs) -->
            <nav class="pinwheel-behind-nav" role="tablist" aria-label="Daftar Bab Behind the Pinwheel">
              <button type="button" class="pinwheel-behind-tab-btn active" role="tab" aria-selected="true" data-chapter="1">
                <span class="tab-num">Chapter I</span>
                <span class="tab-title">The Kitsune</span>
              </button>
              <button type="button" class="pinwheel-behind-tab-btn" role="tab" aria-selected="false" data-chapter="2">
                <span class="tab-num">Chapter II</span>
                <span class="tab-title">Why PINWHEEL?</span>
              </button>
              <button type="button" class="pinwheel-behind-tab-btn" role="tab" aria-selected="false" data-chapter="3">
                <span class="tab-num">Chapter III</span>
                <span class="tab-title">The Self You're Becoming</span>
              </button>
              <button type="button" class="pinwheel-behind-tab-btn" role="tab" aria-selected="false" data-chapter="4">
                <span class="tab-num">Chapter IV</span>
                <span class="tab-title">A Letter from Lele</span>
              </button>
              <button type="button" class="pinwheel-behind-tab-btn" role="tab" aria-selected="false" data-chapter="5">
                <span class="tab-num">Epilogue</span>
                <span class="tab-title">PINWHEEL</span>
              </button>
            </nav>

            <!-- 4. OPENING SCENE HERO CARD -->
            <section class="pinwheel-behind-intro" id="pinwheel-behind-intro" aria-label="Opening Scene The Enchanted Meadow">
              <div class="pinwheel-behind-intro-card">
                <div class="pinwheel-intro-ambient-moon" aria-hidden="true"></div>
                <div class="pinwheel-intro-fox-silhouette" aria-hidden="true">🦊🎐</div>
                <span class="pinwheel-intro-eyebrow">The Nine Tailed Sanctuary · Meadow of Wind &amp; Petals</span>
                <h2 class="pinwheel-intro-main-title">BEHIND THE PINWHEEL</h2>
                <p class="pinwheel-intro-subtitle">A Future Self Is Waiting for You.</p>
                <div class="pinwheel-intro-divider"></div>
                <p class="pinwheel-intro-desc">
                  Sebuah perjalanan waktu dan percakapan personal antara Syma yang sekarang dengan Syma di masa depan. Kincir angin yang berputar mengikuti angin—simbol perjalanan hidup, perubahan, penantian, dan harapan. Bahwa sejauh apa pun perjalanan ini membawamu, versi terbaik dirimu masih menunggumu di depan sana.
                </p>
                <button type="button" class="btn-pinwheel-begin-journey" id="btn-pinwheel-begin-journey">
                  <span>Begin the Journey</span>
                  <span aria-hidden="true">🎐✦</span>
                </button>
              </div>
            </section>

            <!-- 5. DECK OF 5 CHAPTER PANELS -->
            <main class="pinwheel-behind-deck" id="pinwheel-behind-deck">

              <!-- CHAPTER I: THE KITSUNE -->
              <article class="pinwheel-behind-chapter-panel active" id="pinwheel-behind-chapter-1" role="tabpanel" tabindex="0">
                <header class="pinwheel-behind-page-header">
                  <span class="pinwheel-chapter-badge">Chapter I · The Enchanted Spirit</span>
                  <h2 class="pinwheel-chapter-main-title">The Kitsune</h2>
                  <p class="pinwheel-chapter-sub-title">Some Charms Are Impossible to Ignore.</p>
                </header>

                <div class="pinwheel-chapter-grid">
                  <div class="pinwheel-text-column">
                    <p class="pinwheel-journal-p drop-cap">
                      Ada alasan mendalam mengapa dari sekian banyak kemungkinan wujud di semesta ini, aku selalu melihat Syma sebagai sosok seekor rubah berekor sembilan—seorang Kitsune. Rubah bukanlah sekadar makhluk dongeng biasa yang anggun dan bersembunyi di balik bayang-bayang kabut hutan Jepang; ia adalah simbol dari daya tarik yang tak kasat mata, kecerdasan yang lincah, dan pesona yang sulit dijelaskan namun selalu berhasil memikat perhatian siapa saja.
                    </p>
                    <p class="pinwheel-journal-p">
                      Syma memiliki pesona yang sungguh unik. Bahkan ketika seseorang baru pertama kali mengenalnya, pembawaannya langsung memancing rasa ingin tahu. Ada kontras yang menawan dalam dirinya: di satu saat ia bisa tampak begitu tenang, kalem, dan sulit ditebak pikirannya—seperti rubah yang sedang mengamati angin dari dahan pohon tinggi. Namun di saat berikutnya, ia bisa seketika menjelma menjadi orang paling ramai, penuh tawa, dan menghadirkan suasana hidup dengan keusilan serta tingkah absurd yang kadang sama sekali tidak masuk akal.
                    </p>
                    <div class="pinwheel-journal-highlight">
                      "Ia cerdik, pintar membaca keadaan, penuh akal, dan menyebalkan dengan caranya sendiri yang khas—tetapi justru itulah kehangatan yang membuat Syma begitu mudah diingat."
                    </div>
                    <p class="pinwheel-journal-p">
                      Sebagai seorang Kitsune laki-laki, Syma tidak pernah digambarkan sebagai sosok yang manipulatif atau berniat jahat. Metafora rubah di sini sepenuhnya berakar pada ketajaman berpikirnya, kemampuan adaptasinya yang luwes, serta sisi playful yang membuat hari-hari biasa terasa berwarna. Di balik candaannya yang terkadang seenaknya sendiri, tersimpan kecerdasan tajam dan pemikiran yang tidak dangkal.
                    </p>
                    <p class="pinwheel-journal-p">
                      Namun, di balik jubah magis Kitsune dan senyum cerdiknya yang memesona, ada hal penting yang tak boleh kita lupakan: di dalam dirinya tetap ada seorang manusia yang sedang bertumbuh, meraba arah, dan berusaha menemukan jati diri sejatinya di tengah luasnya dunia.
                    </p>
                    <div class="pinwheel-journal-quote">
                      "Menjadi Kitsune bukan tentang selalu memiliki jawaban atas segala teka-teki, melainkan kelincahan hati untuk tetap melangkah dengan ceria saat jalanan terasa berliku."
                    </div>
                  </div>

                  <aside class="pinwheel-char-profile-card">
                    <div class="pinwheel-portrait-frame">
                      <img src="/assets/portrait_abil_hd.jpg" alt="Syma - The Kitsune of PINWHEEL" class="pinwheel-portrait-img" loading="lazy">
                      <span class="pinwheel-kitsune-badge">The Kitsune · Nine Tailed Fox 🦊🎐</span>
                    </div>
                    <div class="pinwheel-specs-list">
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Character</span>
                        <span class="spec-val">Syma (Abil)</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Gender</span>
                        <span class="spec-val">Male</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Archetype</span>
                        <span class="spec-val">Kitsune / Celestial Fox Spirit</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Universe</span>
                        <span class="spec-val">PINWHEEL · Enchanted Meadow</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Soul Traits</span>
                        <span class="spec-val">Witty, Charming, Playful &amp; Sharp</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Sacred Relics</span>
                        <span class="spec-val">Silver Pinwheel, Wind Chimes</span>
                      </div>
                    </div>
                  </aside>
                </div>
              </article>

              <!-- CHAPTER II: WHY PINWHEEL? -->
              <article class="pinwheel-behind-chapter-panel" id="pinwheel-behind-chapter-2" role="tabpanel" tabindex="0">
                <header class="pinwheel-behind-page-header">
                  <span class="pinwheel-chapter-badge">Chapter II · The Whispering Wind</span>
                  <h2 class="pinwheel-chapter-main-title">Why PINWHEEL?</h2>
                  <p class="pinwheel-chapter-sub-title">Somewhere in the Future, Someone Is Waiting for You.</p>
                </header>

                <div class="pinwheel-chapter-grid">
                  <div class="pinwheel-text-column">
                    <p class="pinwheel-journal-p drop-cap">
                      Ketika mencari nama untuk semesta milik Syma, hatiku selalu tertambat pada melodi syahdu dari lagu <em>Pinwheel</em> milik SEVENTEEN. Ada kehangatan melankolis yang terselip di dalam setiap denting nadanya—sebuah gambaran tentang penantian yang setia, jarak yang terbentang, dan keyakinan bahwa sejauh apa pun angin berhembus, ada harapan yang tak akan pernah padam.
                    </p>
                    <p class="pinwheel-journal-p">
                      Bagi author, PINWHEEL bukanlah sekadar kincir kertas yang berputar di atas bukit berumput. PINWHEEL adalah metafora sebuah dialog antarwaktu: percakapan yang tulus antara Syma yang sedang berjuang hari ini dengan Syma di masa depan yang telah melangkah jauh lebih bijak.
                    </p>
                    <div class="pinwheel-journal-highlight">
                      "Bayangkan Syma di masa depan sedang berdiri di ujung padang rumput, menatap ke arahmu dengan senyuman sabar. Ia tahu setiap kerikil yang sedang kamu lewati, dan ia tetap menunggumu tanpa syarat."
                    </div>
                    <p class="pinwheel-journal-p">
                      Kincir angin melambangkan perjalanan hidup kita sendiri. Sayap-sayapnya yang berputar mencerminkan upaya tanpa henti untuk terus bergerak maju. Sementara itu, angin melambangkan waktu, perubahan, serta rintangan hidup yang kerap datang tanpa diduga. Terkadang angin bertiup begitu kencang hingga membuat kita goyah; namun terkadang angin berhenti sama sekali, menyisakan keheningan yang panjang.
                    </p>
                    <p class="pinwheel-journal-p">
                      Ketika kincir berhenti berputar karena tiadanya angin, bukan berarti perjalananmu telah berakhir atau kamu telah gagal. Kincir itu hanya sedang beristirahat, bersiap menyambut hembusan angin berikutnya. Setiap manusia memiliki ritme dan musimnya masing-masing. Syma tidak harus tergesa-gesa; kamu boleh membutuhkan waktu lebih lama untuk bernapas dan menemukan kembali arahmu.
                    </p>
                    <div class="pinwheel-journal-quote">
                      "Jangan menyerah hanya karena sekarang kamu belum sampai di tempat yang kamu inginkan. Mungkin perjalanan ini terasa panjang. Mungkin ada saat ketika kamu harus kembali dari titik paling bawah dan memulai semuanya lagi. Tapi versi terbaik dirimu tidak menghilang. Dia masih ada di depan sana, menunggumu untuk terus berjalan."
                    </div>
                  </div>

                  <aside class="pinwheel-char-profile-card">
                    <div class="pinwheel-portrait-frame">
                      <img src="/assets/card_abil_hd.jpg" alt="Padang Kincir Angin PINWHEEL" class="pinwheel-portrait-img" loading="lazy">
                      <span class="pinwheel-kitsune-badge">The Meadow of Time 🎐⛅</span>
                    </div>
                    <div class="pinwheel-specs-list">
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Symbol</span>
                        <span class="spec-val">The Pinwheel (Perjalanan Hidup)</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Element</span>
                        <span class="spec-val">Gentle Wind (Waktu &amp; Perubahan)</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Present Self</span>
                        <span class="spec-val">Seseorang yang terus berjuang</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Future Self</span>
                        <span class="spec-val">Harapan yang sabar menanti</span>
                      </div>
                    </div>
                  </aside>
                </div>
              </article>

              <!-- CHAPTER III: THE SELF YOU'RE BECOMING -->
              <article class="pinwheel-behind-chapter-panel" id="pinwheel-behind-chapter-3" role="tabpanel" tabindex="0">
                <header class="pinwheel-behind-page-header">
                  <span class="pinwheel-chapter-badge">Chapter III · The Gentle Horizon</span>
                  <h2 class="pinwheel-chapter-main-title">The Self You're Becoming</h2>
                  <p class="pinwheel-chapter-sub-title">You Don't Have to Be Perfect to Keep Moving.</p>
                </header>

                <div class="pinwheel-chapter-grid">
                  <div class="pinwheel-text-column">
                    <p class="pinwheel-journal-p drop-cap">
                      Proses bertumbuh menjadi versi terbaik diri sendiri kerap kali disalahpahami sebagai keharusan untuk selalu menang, selalu tampak kuat, atau selalu memiliki jawaban atas segala ketidakpastian. Kita sering dipaksa berpikir bahwa keberhasilan hanya dihitung ketika trofi telah terangkat ke udara. Padahal, kehidupan yang nyata justru terjadi di antara detik-detik yang sunyi.
                    </p>
                    <p class="pinwheel-journal-p">
                      Akan ada hari-hari di mana Syma merasa penuh percaya diri, merasa sanggup menaklukkan dunia, dan mampu menyelesaikan semua hal dengan mudah. Namun, akan ada pula hari-hari di mana rasa lelah menumpuk, keraguan menyelinap ke dalam hati, dan kamu mulai mempertanyakan apakah usahamu selama ini benar-benar ada artinya.
                    </p>
                    <div class="pinwheel-journal-highlight">
                      "Dan di semesta PINWHEEL ini, aku ingin kamu selalu mengingat: tidak apa-apa jika prosesmu membutuhkan waktu lebih lama. Tidak apa-apa jika sesekali kamu harus menangis di sudut sepi."
                    </div>
                    <p class="pinwheel-journal-p">
                      Dari kejauhan, author tidak hanya ingin menyaksikan Syma ketika ia berdiri di podium kemenangan. Author juga ingin menghargai seluruh proses yang tak kasat mata—hari-hari ketika kamu bangun di pagi hari, menghela napas panjang, dan tetap memilih untuk mencoba sekali lagi meskipun kemarin terasa begitu berat.
                    </p>
                    <p class="pinwheel-journal-p">
                      Jangan pernah mengukur nilai dirimu dengan membandingkan langkahmu dengan langkah orang lain. Perjalananmu adalah milikmu seutuhnya, diukir di bawah langit yang memiliki musim tersendiri. Kamu tidak perlu menjadi sempurna untuk membuat orang-orang yang menyayangimu merasa bangga.
                    </p>
                    <div class="pinwheel-journal-quote">
                      "Aku tidak ingin kamu hanya bangga kepada dirimu ketika berhasil. Aku juga ingin kamu belajar menghargai dirimu ketika sedang berusaha. Sebab, tidak semua keberanian terlihat seperti kemenangan. Terkadang, keberanian hanya berarti kamu masih mau mencoba sekali lagi."
                    </div>
                    <p class="pinwheel-journal-p">
                      Suatu hari nanti, aku harap kamu bisa melihat dirimu yang sekarang dan merasa bangga. Bukan karena kamu tidak pernah gagal, tetapi karena kamu tidak pernah berhenti mencoba.
                    </p>
                  </div>

                  <aside class="pinwheel-char-profile-card">
                    <div class="pinwheel-portrait-frame">
                      <img src="/assets/avatar_abil_hd.jpg" alt="Syma Growing" class="pinwheel-portrait-img" loading="lazy">
                      <span class="pinwheel-kitsune-badge">Becoming Who You Are 🎐✧</span>
                    </div>
                    <div class="pinwheel-specs-list">
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Patience</span>
                        <span class="spec-val">Boleh beristirahat tanpa bersalah</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Resilience</span>
                        <span class="spec-val">Keberanian mencoba satu kali lagi</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Self-Compassion</span>
                        <span class="spec-val">Memandang diri dengan lebih lembut</span>
                      </div>
                      <div class="pinwheel-spec-row">
                        <span class="spec-label">Destination</span>
                        <span class="spec-val">Versi diri yang utuh &amp; bangga</span>
                      </div>
                    </div>
                  </aside>
                </div>
              </article>

              <!-- CHAPTER IV: A LETTER FROM LELE -->
              <article class="pinwheel-behind-chapter-panel" id="pinwheel-behind-chapter-4" role="tabpanel" tabindex="0">
                <header class="pinwheel-behind-page-header">
                  <span class="pinwheel-chapter-badge">Chapter IV · Most Personal Memoir</span>
                  <h2 class="pinwheel-chapter-main-title">A Letter from Lele</h2>
                  <p class="pinwheel-chapter-sub-title">Even If It Takes You a Long Time, I'll Still Be Here.</p>
                </header>

                <div class="pinwheel-letter-wrapper">
                  <div class="pinwheel-manuscript-parchment">
                    <div class="pinwheel-wax-seal" title="Author Wax Seal · Lele 🌙">
                      <span class="seal-icon">🌙</span>
                      <span class="seal-text">LELE · AUTHOR SEAL</span>
                    </div>

                    <div class="pinwheel-letter-content">
                      <h3 class="pinwheel-letter-salutation">Untuk Syma,</h3>

                      <p class="pinwheel-letter-p">Hai, Syma.</p>

                      <p class="pinwheel-letter-p">
                        Lucu juga, ya. Dari sekian banyak hal yang bisa aku lakukan, aku justru memilih menuliskan surat sepanjang ini untukmu.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku tidak tahu kapan kamu akan membacanya. Mungkin sekarang, ketika semuanya masih terasa dekat. Mungkin beberapa bulan lagi, atau bahkan bertahun-tahun dari sekarang, ketika kita sudah sama-sama menjadi orang yang sedikit berbeda.
                      </p>

                      <p class="pinwheel-letter-p">
                        Entah bagaimana keadaanmu nanti, aku harap kamu membacanya dalam keadaan baik.
                      </p>

                      <p class="pinwheel-letter-p">
                        Kalau tidak pun, tidak apa-apa. Kita mulai dari sini saja.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku ingin bercerita sedikit tentang alasan kenapa aku memilihmu sebagai Kitsune.
                      </p>

                      <p class="pinwheel-letter-p">
                        Sejujurnya, menurutku kamu memang punya sesuatu yang sulit dijelaskan. Ada daya tarik yang membuat orang bisa penasaran bahkan sebelum benar-benar mengenalmu. Kamu bisa terlihat tenang dan sulit ditebak, lalu tiba-tiba berubah menjadi orang paling ramai dengan tingkah yang kadang tidak masuk akal.
                      </p>

                      <p class="pinwheel-letter-p">
                        Kamu cerdik, banyak akal, dan punya cara sendiri dalam menghadapi sesuatu. Kadang aku sampai bertanya-tanya, sebenarnya apa lagi yang sedang kamu pikirkan di balik semua tingkahmu itu?
                      </p>

                      <p class="pinwheel-letter-p">
                        Tapi justru itu yang membuatmu menjadi Syma.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku tidak ingin mengingatmu hanya sebagai seseorang yang pintar, lucu, atau punya banyak cara untuk menyelesaikan masalah. Aku juga ingin mengingat semua sisi kecilmu yang mungkin tidak pernah kamu anggap istimewa.
                      </p>

                      <p class="pinwheel-letter-p">
                        Sebab, bagiku, kamu tidak harus melakukan sesuatu yang luar biasa untuk membuat keberadaanmu berarti.
                      </p>

                      <div class="pinwheel-letter-callout">
                        "Aku menyukai gagasan bahwa seseorang bisa menjadi begitu berharga hanya dengan menjadi dirinya sendiri."
                      </div>

                      <p class="pinwheel-letter-p">
                        Dan aku harap suatu hari nanti kamu juga bisa melihat dirimu dengan cara yang sama.
                      </p>

                      <p class="pinwheel-letter-p">
                        Syma, ada satu hal yang ingin aku bicarakan lebih lama: tentang perjalananmu.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku tahu, mungkin sekarang kamu punya banyak hal yang ingin dicapai. Ada banyak impian yang sedang kamu kejar, banyak hal yang ingin kamu buktikan, dan mungkin ada beberapa bagian hidup yang masih ingin kamu perbaiki.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku berharap kamu berhasil mendapatkan hal-hal yang kamu inginkan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Namun, kalau ternyata perjalananmu jauh lebih panjang daripada yang kamu bayangkan, aku harap kamu tidak langsung menganggap dirimu tertinggal.
                      </p>

                      <p class="pinwheel-letter-p">
                        Tidak semua orang punya waktu yang sama untuk sampai ke tujuan. Tidak semua orang menemukan jalannya dalam sekali percobaan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Kadang kita harus berjalan cukup jauh hanya untuk menyadari bahwa arah yang kita cari ternyata ada di tempat yang berbeda. Kadang kita harus tersesat, berhenti, memikirkan semuanya kembali, lalu memberanikan diri untuk melanjutkan perjalanan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Dan itu tidak membuat perjalananmu menjadi sia-sia.
                      </p>

                      <p class="pinwheel-letter-p">
                        Kalau suatu hari kamu merasa sudah berjalan terlalu jauh, sampai-sampai tidak lagi mengenali dirimu sendiri, aku ingin kamu mengingat satu hal:
                      </p>

                      <div class="pinwheel-letter-callout">
                        "Kamu selalu boleh kembali kepada dirimu sendiri."
                      </div>

                      <p class="pinwheel-letter-p">
                        Kamu tidak harus terus berlari hanya karena takut tertinggal. Kamu tidak harus berpura-pura baik-baik saja hanya karena tidak ingin membuat orang lain khawatir.
                      </p>

                      <p class="pinwheel-letter-p">Kalau lelah, istirahatlah.</p>

                      <p class="pinwheel-letter-p">Kalau ingin menangis, menangislah.</p>

                      <p class="pinwheel-letter-p">
                        Kalau belum tahu harus melakukan apa, tidak apa-apa. Kamu tidak perlu memaksakan jawaban hanya supaya terlihat mampu menghadapi semuanya.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku ingin kamu punya kesempatan untuk tumbuh tanpa harus terus-menerus menyalahkan dirimu sendiri.
                      </p>

                      <p class="pinwheel-letter-p">
                        Dan, Syma, tolong jangan terlalu sering membandingkan dirimu dengan orang lain. Kamu tidak pernah tahu berapa banyak hal yang sudah mereka lalui sebelum sampai di tempat mereka sekarang. Sama seperti mereka tidak pernah benar-benar tahu seluruh perjalananmu.
                      </p>

                      <p class="pinwheel-letter-p">
                        Jadi, berjalanlah dengan waktumu sendiri.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku tidak sedang menunggu seseorang yang sempurna. Aku juga tidak sedang menunggu Syma yang selalu berhasil, selalu kuat, dan tidak pernah melakukan kesalahan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku ingin melihat Syma yang terus bertumbuh. Syma yang berani mencoba lagi setelah gagal. Syma yang masih bisa tertawa meskipun hari-harinya tidak selalu mudah. Syma yang suatu hari nanti bisa memandang dirinya sendiri dengan lebih lembut.
                      </p>

                      <div class="pinwheel-letter-callout">
                        "Aku ingin kamu sampai ke masa depan tanpa harus kehilangan dirimu sendiri di sepanjang perjalanan."
                      </div>

                      <p class="pinwheel-letter-p">
                        Sekarang, mungkin kamu bertanya-tanya kenapa aku memilih nama PINWHEEL untuk tempat ini.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku punya sebuah bayangan sederhana.
                      </p>

                      <p class="pinwheel-letter-p">
                        Bayangkan suatu hari nanti, kamu sedang berdiri di sebuah padang rumput. Di sekelilingmu ada banyak kincir kecil yang bergerak mengikuti angin. Kamu melihatnya satu per satu, lalu menyadari bahwa masing-masing berputar dengan caranya sendiri.
                      </p>

                      <p class="pinwheel-letter-p">
                        Ada yang bergerak cepat ketika angin datang. Ada yang hanya berputar perlahan. Ada pula yang seolah diam ketika angin sedang tidak bertiup.
                      </p>

                      <p class="pinwheel-letter-p">
                        Tapi bukan berarti kincir yang diam itu kehilangan kemampuannya untuk berputar.
                      </p>

                      <p class="pinwheel-letter-p">
                        Mungkin dia hanya sedang menunggu angin berikutnya.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku ingin PINWHEEL menjadi pengingat seperti itu.
                      </p>

                      <p class="pinwheel-letter-p">
                        Bahwa hidup tidak selalu tentang seberapa cepat kamu bergerak. Ada masa untuk berlari, ada masa untuk berhenti, dan ada masa ketika kamu perlu membiarkan dirimu menemukan arah kembali.
                      </p>

                      <p class="pinwheel-letter-p">
                        Dan di dalam bayanganku, ada satu sosok yang sedang menunggumu di kejauhan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Itu adalah dirimu sendiri di masa depan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Dia tidak datang untuk bertanya kenapa kamu membutuhkan waktu begitu lama. Dia tidak datang untuk menghitung berapa banyak kesalahan yang pernah kamu lakukan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Dia hanya ingin melihatmu sampai di sana.
                      </p>

                      <p class="pinwheel-letter-p">
                        Mungkin ketika kamu akhirnya bertemu dengannya, kamu akan menyadari bahwa perjalanan yang selama ini terasa begitu panjang ternyata telah membentuk seseorang yang jauh lebih kuat, lebih bijaksana, dan lebih mengenal dirinya sendiri.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku berharap kamu tidak melupakan Syma yang sekarang ketika hari itu tiba.
                      </p>

                      <p class="pinwheel-letter-p">
                        Jangan menganggapnya sebagai seseorang yang harus kamu tinggalkan karena dia belum cukup baik.
                      </p>

                      <p class="pinwheel-letter-p">
                        Justru, berterima kasihlah kepadanya.
                      </p>

                      <p class="pinwheel-letter-p">
                        Karena dia yang tetap mencoba ketika belum ada kepastian. Dia yang bertahan melewati hari-hari yang tidak mudah. Dia yang mengumpulkan keberanian sedikit demi sedikit, bahkan ketika belum tahu akan dibawa ke mana semua usahanya.
                      </p>

                      <p class="pinwheel-letter-p">
                        Tanpa dia, kamu tidak akan menjadi dirimu yang sekarang.
                      </p>

                      <p class="pinwheel-letter-p">
                        Dan tanpa dirimu yang sekarang, tidak akan ada dirimu yang sedang kamu tunggu di masa depan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Ada satu hal lagi yang ingin aku katakan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku tidak tahu apakah suatu hari nanti kita akan tetap berada sedekat sekarang. Waktu bisa mengubah banyak hal. Kesibukan bisa membawa kita ke tempat yang berbeda. Masing-masing dari kita mungkin akan memiliki perjalanan, tanggung jawab, dan cerita baru.
                      </p>

                      <p class="pinwheel-letter-p">
                        Mungkin akan ada hari ketika kita tidak lagi mengetahui setiap hal kecil yang terjadi dalam kehidupan satu sama lain.
                      </p>

                      <p class="pinwheel-letter-p">
                        Tapi aku harap jarak tidak membuatmu berpikir bahwa semua yang pernah ada menjadi tidak berarti.
                      </p>

                      <p class="pinwheel-letter-p">
                        Sebab, ada hal-hal yang tetap pantas dikenang meskipun waktu sudah berjalan jauh.
                      </p>

                      <p class="pinwheel-letter-p">
                        Dan kalau suatu hari kamu kembali ke PINWHEEL, aku ingin tempat ini terasa seperti sesuatu yang familiar. Seperti menemukan sebuah surat lama yang ternyata masih menyimpan kehangatan yang sama.
                      </p>

                      <p class="pinwheel-letter-p">
                        Kamu boleh datang dengan cerita baru. Kamu boleh datang sebagai seseorang yang sudah berubah. Kamu bahkan boleh datang dengan versi dirimu yang belum sepenuhnya selesai.
                      </p>

                      <p class="pinwheel-letter-p">
                        Kamu tidak perlu menjelaskan kenapa kamu pergi begitu lama.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku hanya berharap kamu masih punya alasan untuk kembali.
                      </p>

                      <p class="pinwheel-letter-p">
                        Syma, terima kasih sudah menjadi dirimu sendiri.
                      </p>

                      <p class="pinwheel-letter-p">
                        Terima kasih untuk segala sisi yang membuatmu berbeda. Untuk kecerdasanmu, tingkah absurdmu, keusilanmu, dan semua hal kecil yang mungkin tidak pernah kamu sadari telah membuatmu begitu mudah diingat.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku harap kamu tidak pernah merasa bahwa keberadaanmu hanya berarti ketika kamu sedang berguna bagi orang lain.
                      </p>

                      <p class="pinwheel-letter-p">
                        Kamu juga pantas diperhatikan ketika sedang diam. Kamu juga pantas didengarkan ketika tidak tahu harus berkata apa. Dan kamu juga pantas mendapatkan kehangatan tanpa harus terlebih dahulu melakukan sesuatu untuk mendapatkannya.
                      </p>

                      <div class="pinwheel-letter-callout">
                        "Jangan pernah merasa bahwa kamu harus menjadi luar biasa dulu agar seseorang punya alasan untuk tetap menghargaimu."
                      </div>

                      <p class="pinwheel-letter-p">
                        Kalau suatu hari dunia terasa terlalu jauh dan kamu merasa tidak ada yang benar-benar memahami perjalananmu, bacalah surat ini sekali lagi.
                      </p>

                      <p class="pinwheel-letter-p">
                        Ingat bahwa ada seseorang yang pernah meluangkan waktu untuk memikirkanmu, mengenal berbagai sisi dirimu, dan menyusun semua harapan ini hanya agar kamu punya sesuatu untuk dibaca ketika membutuhkannya.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku tidak tahu seberapa jauh kamu akan pergi.
                      </p>

                      <p class="pinwheel-letter-p">
                        Aku tidak tahu berapa lama waktu yang kamu perlukan.
                      </p>

                      <p class="pinwheel-letter-p">
                        Tapi aku berharap, di antara semua tempat yang nantinya kamu kunjungi, kamu tidak pernah kehilangan jalan pulang menuju dirimu sendiri.
                      </p>

                      <p class="pinwheel-letter-p">
                        Dan jika suatu hari nanti kamu sudah sampai di tempat yang selama ini kamu impikan, semoga kamu sempat menoleh ke belakang.
                      </p>

                      <p class="pinwheel-letter-p">Lihatlah perjalananmu.</p>

                      <p class="pinwheel-letter-p">Lihatlah dirimu yang dulu.</p>

                      <p class="pinwheel-letter-p">Lalu, tersenyumlah sedikit untuknya.</p>

                      <p class="pinwheel-letter-p">
                        Dia sudah melakukan yang terbaik dengan apa yang dia miliki saat itu.
                      </p>

                      <div class="pinwheel-letter-callout">
                        "Aku bangga kepadamu, Syma. Bukan hanya karena seseorang yang mungkin akan kamu jadi nanti, tetapi juga karena seseorang yang sedang kamu perjuangkan untuk menjadi hari ini."
                      </div>

                      <p class="pinwheel-letter-p">Jadi, jangan menyerah, ya?</p>

                      <p class="pinwheel-letter-p">
                        Kalau perjalananmu membutuhkan waktu yang sangat lama, tidak apa-apa.
                      </p>

                      <p class="pinwheel-letter-p">
                        Kalau suatu hari kamu tersesat, temukan jalanmu kembali.
                      </p>

                      <p class="pinwheel-letter-p">
                        Kalau anginnya sedang tidak bertiup, jangan menganggap semuanya sudah berakhir.
                      </p>

                      <p class="pinwheel-letter-p">Kincir kecil itu masih ada di sana.</p>

                      <p class="pinwheel-letter-p">Dan masa depanmu masih menunggumu.</p>

                      <div class="pinwheel-letter-signature">
                        <p class="sig-closing">With all the warmth I could leave in these words,</p>
                        <p class="sig-author">Lele</p>
                        <p class="sig-role">Your author, who will always be glad that this little universe has a place for you.</p>
                      </div>

                      <div class="pinwheel-ending-quote">
                        <p class="quote-text">
                          "Somewhere, beyond the wind, there is still a little pinwheel turning. And somewhere in the future, there is a version of you who is grateful that you never stopped."
                        </p>
                      </div>

                      <!-- Interactive Action Buttons -->
                      <div class="pinwheel-letter-actions">
                        <button type="button" class="btn-pinwheel-letter-act" id="btn-pinwheel-letter-replay" aria-label="Baca Ulang Surat">
                          <span>🔄</span>
                          <span>Read Again</span>
                        </button>
                        <button type="button" class="btn-pinwheel-letter-act primary" id="btn-pinwheel-letter-keep" aria-label="Simpan Surat Ini">
                          <span>💌</span>
                          <span>Keep This Letter</span>
                        </button>
                        <button type="button" class="btn-pinwheel-letter-act" id="btn-pinwheel-letter-return" aria-label="Kembali ke PINWHEEL">
                          <span>🎐</span>
                          <span>Return to PINWHEEL</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>

              <!-- CHAPTER V: EPILOGUE: PINWHEEL -->
              <article class="pinwheel-behind-chapter-panel" id="pinwheel-behind-chapter-5" role="tabpanel" tabindex="0">
                <header class="pinwheel-behind-page-header">
                  <span class="pinwheel-chapter-badge">Chapter V · Epilogue</span>
                  <h2 class="pinwheel-chapter-main-title">PINWHEEL</h2>
                  <p class="pinwheel-chapter-sub-title">The Future Is Still Waiting for You.</p>
                </header>

                <div class="pinwheel-chapter-grid">
                  <div class="pinwheel-text-column">
                    <p class="pinwheel-journal-p drop-cap">
                      Suatu hari nanti, mungkin kamu akan berdiri di tempat yang dulu hanya bisa kamu bayangkan. Kamu akan melihat betapa jauh perjalanan yang sudah kamu lalui. Betapa banyak hal yang pernah membuatmu ragu, tetapi ternyata berhasil kamu lewati dengan caramu sendiri.
                    </p>
                    <p class="pinwheel-journal-p">
                      Dan ketika hari itu tiba, jangan pernah melupakan dirimu yang sekarang. Dia yang masih mencoba di tengah ketidakpastian. Dia yang terkadang takut, pernah menangis dalam hening, pernah gagal, tetapi tetap memilih untuk mengikat tali sepatunya dan melanjutkan perjalanan.
                    </p>
                    <div class="pinwheel-journal-highlight">
                      "Karena dialah—Syma hari ini—yang membawamu sampai ke titik terjauh itu."
                    </div>
                    <p class="pinwheel-journal-p">
                      Masa depan bukanlah arena perlombaan yang harus kamu kejar dengan napas terengah-engah. Ia dibangun sedikit demi sedikit melalui setiap pilihan kecil, setiap keberanian untuk bangun kembali, dan setiap kejujuran kepada diri sendiri.
                    </p>
                    <p class="pinwheel-journal-p">
                      Jadi, teruslah berjalan, Syma. Tidak perlu menjadi sempurna. Tidak perlu menjadi orang lain. Jadilah dirimu sendiri, dan tumbuhlah dengan caramu. Versi terbaikmu masih setia menunggumu. Dan di suatu tempat di masa depan... aku pun akan selalu menunggu untuk melihat senyum banggamu.
                    </p>

                    <div class="pinwheel-epilogue-climax">
                      <h3>Keep becoming. I'll see you in the future.</h3>
                      <p>
                        "Di mana pun angin berhembus, kincir kecil itu akan terus berputar menyambut mentari pagi yang baru."
                      </p>
                    </div>
                  </div>

                  <aside class="pinwheel-char-profile-card">
                    <!-- Soundtrack Player Section -->
                    <div class="pinwheel-soundtrack-card">
                      <div class="pinwheel-soundtrack-header">
                        <div class="pinwheel-soundtrack-info">
                          <div class="pinwheel-song-disc" id="pinwheel-song-disc" aria-hidden="true">🎐</div>
                          <div class="pinwheel-song-titles">
                            <h4>SEVENTEEN — PINWHEEL</h4>
                            <p>Official Universe Soundtrack · Instrumental &amp; Vocal</p>
                          </div>
                        </div>
                        <button type="button" class="btn-pinwheel-song-toggle" id="btn-pinwheel-song-toggle" aria-label="Toggle Soundtrack">
                          <span>▶</span>
                          <span>Play Soundtrack</span>
                        </button>
                      </div>

                      <div class="pinwheel-youtube-wrapper">
                        <iframe
                          id="pinwheel-youtube-iframe"
                          src="https://www.youtube-nocookie.com/embed/SialXSC7-og?enablejsapi=1&rel=0"
                          title="SEVENTEEN - PINWHEEL"
                          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen
                          loading="lazy">
                        </iframe>
                      </div>

                      <p class="pinwheel-soundtrack-note">
                        <em>*Audio pemutar resmi. Musik dapat diputar sebagai teman membaca yang hangat dan tenang. Tidak ada autoplay otomatis.</em>
                      </p>
                    </div>
                  </aside>
                </div>
              </article>

            </main>

            <!-- 6. Footer Navigation Bar -->
            <footer class="pinwheel-behind-footer">
              <button type="button" class="pinwheel-behind-nav-btn" id="btn-pinwheel-behind-prev" disabled>
                <span>‹</span>
                <span>Bab Sebelumnya</span>
              </button>

              <div class="pinwheel-behind-footer-indicator" aria-label="Indikator Bab">
                <span class="pinwheel-indicator-dot active" data-chapter="1"></span>
                <span class="pinwheel-indicator-dot" data-chapter="2"></span>
                <span class="pinwheel-indicator-dot" data-chapter="3"></span>
                <span class="pinwheel-indicator-dot" data-chapter="4"></span>
                <span class="pinwheel-indicator-dot" data-chapter="5"></span>
              </div>

              <button type="button" class="pinwheel-behind-nav-btn" id="btn-pinwheel-behind-next">
                <span>Bab Selanjutnya</span>
                <span>›</span>
              </button>
            </footer>

          </div>
        </div>
`;

// Insert overlayMarkup right before the closing tag of view-pinwheel-world
const targetEnd = `              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">Reset Tangkapan Ikan</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Kosongkan riwayat tangkapan memancing</p>
                </div>
                <button type="button" class="pinwheel-cat-btn" id="btn-reset-fish-data" style="background:#dc2626;">Reset Data</button>
              </div>
            </div>
          </div>
        </div>

      </section>`;

const replacementEnd = `              <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                  <h4 style="margin:0; font-size:0.9rem; color:#ffffff;">Reset Tangkapan Ikan</h4>
                  <p style="margin:2px 0 0 0; font-size:0.75rem; color:#cbd5e1;">Kosongkan riwayat tangkapan memancing</p>
                </div>
                <button type="button" class="pinwheel-cat-btn" id="btn-reset-fish-data" style="background:#dc2626;">Reset Data</button>
              </div>
            </div>
          </div>
        </div>
${overlayMarkup}
      </section>`;

if (!html.includes('id="pinwheel-behind-overlay"')) {
  if (html.includes(targetEnd)) {
    html = html.replace(targetEnd, replacementEnd);
    console.log('✅ Injected #pinwheel-behind-overlay into view-pinwheel-world');
  } else {
    console.error('❌ Could not find targetEnd in index.html');
    process.exit(1);
  }
}

if (isCrlf) {
  html = html.replace(/\n/g, '\r\n');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('🎉 index.html updated successfully with Behind the Pinwheel feature!');
