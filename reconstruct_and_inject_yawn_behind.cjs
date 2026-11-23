const fs = require('fs');

// Read the dist/index.html which has the complete 8 universes body
const dist = fs.readFileSync('dist/index.html', 'utf8');

const headTags = `<!DOCTYPE html>
<html lang="id">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Our Little Universe — Choose Your Universe</title>
  <meta name="description"
    content="Our Little Universe: Tiga dunia kecil, satu galaksi persahabatan privat untuk Nyanya, Lala, dan Lele.">

  <!-- Google Fonts: Cinzel, Cormorant Garamond, Plus Jakarta Sans, Alex Brush, and Great Vibes -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@400;600;700;800&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap">
  <link rel="stylesheet" href="/style.css">
  <link rel="stylesheet" href="/orbit.css">
  <link rel="stylesheet" href="/moments.css">
  <link rel="stylesheet" href="/universes.css">
  <link rel="stylesheet" href="/shadow_kingdom.css">
  <link rel="stylesheet" href="/stories.css">
  <link rel="stylesheet" href="/photobooth.css">
  <link rel="stylesheet" href="/messages.css">
  <link rel="stylesheet" href="/games.css">
  <link rel="stylesheet" href="/universe_state.css">
  <link rel="stylesheet" href="/star_messages.css">
  <link rel="stylesheet" href="/mailbox.css">
  <link rel="stylesheet" href="/shadow_gazebo.css">
  <link rel="stylesheet" href="/shadow_garden.css">
  <link rel="stylesheet" href="/shadow_art_gallery.css">
  <link rel="stylesheet" href="/shadow_crystal_tower.css">
  <link rel="stylesheet" href="/everdream_house.css">
  <link rel="stylesheet" href="/kidult_house.css">
  <link rel="stylesheet" href="/greenhouse.css">
  <link rel="stylesheet" href="/kidult_gazebo.css">
  <link rel="stylesheet" href="/songs_we_share.css">
  <link rel="stylesheet" href="/bloom_cottage.css">
  <link rel="stylesheet" href="/eclipse.css">
  <link rel="stylesheet" href="/pinwheel.css">
  <link rel="stylesheet" href="/pinwheel_gazebo.css">
  <link rel="stylesheet" href="/pinwheel_residence.css">
  <link rel="stylesheet" href="/pinwheel_studio.css">
  <link rel="stylesheet" href="/yawn.css">
  <link rel="stylesheet" href="/azure_palace.css">
  <link rel="stylesheet" href="/ash.css">
  <link rel="stylesheet" href="/dragon_den.css">
  <link rel="stylesheet" href="/usagain.css">
  <link rel="stylesheet" href="/silent_lotus.css">
  <link rel="stylesheet" href="/hot.css">
  <link rel="stylesheet" href="/pinwheel_haven.css">
  <link rel="stylesheet" href="/moonpetal_manor.css">
  <link rel="stylesheet" href="/kidult_behind.css">
  <link rel="stylesheet" href="/toyou_behind.css">
  <link rel="stylesheet" href="/shadow_behind.css">
  <link rel="stylesheet" href="/yawn_behind.css">
  <link rel="stylesheet" href="/fairy_atelier.css">
  <link rel="stylesheet" href="/toyou_gazebo.css">
  <link rel="stylesheet" href="/yawn_gazebo.css">
  <link rel="stylesheet" href="/yawn_cinema.css">
</head>

<body>`;

const bodyStart = dist.indexOf('<body>');
const bodyEnd = dist.lastIndexOf('</body>');
let bodyContent = dist.substring(bodyStart + 6, bodyEnd);

// Ensure <script type="module" src="/main.js"></script> is at end of body
if (!bodyContent.includes('src="/main.js"')) {
  bodyContent = bodyContent.replace('</div>\n\n</body>', '</div>\n    <script type="module" src="/main.js"></script>\n</body>');
  if (!bodyContent.includes('src="/main.js"')) {
    bodyContent += '\n    <script type="module" src="/main.js"></script>';
  }
}

// 1. Add #btn-yawn-behind in yawn-header-right
const oldHeaderRight = `<div class="yawn-header-right">
              <button type="button" class="yawn-settings-btn" id="btn-yawn-settings" aria-label="Pengaturan Universe" title="Settings">
                <span>⚙</span>
              </button>
            </div>`;

const newHeaderRight = `<div class="yawn-header-right">
              <button type="button" class="univ-goto-btn yawn-behind-pill" id="btn-yawn-behind" aria-label="Buka Rahasia Behind the Yawn">
                <span class="goto-icon">🧜‍♀️</span>
                <span class="yawn-behind-label">
                  <span class="yawn-behind-main">BEHIND THE YAWN</span>
                  <span class="yawn-behind-sub">The mermaid who loved beyond the ocean.</span>
                </span>
              </button>
              <button type="button" class="yawn-settings-btn" id="btn-yawn-settings" aria-label="Pengaturan Universe" title="Settings">
                <span>⚙</span>
              </button>
            </div>`;

if (bodyContent.includes(oldHeaderRight)) {
  bodyContent = bodyContent.replace(oldHeaderRight, newHeaderRight);
  console.log('[OK] Replaced yawn-header-right with Behind the Yawn button');
} else {
  console.log('[WARN] oldHeaderRight pattern not directly matched, trying regex');
  bodyContent = bodyContent.replace(/<div class="yawn-header-right">[\s\S]*?<button[^>]*id="btn-yawn-settings"[\s\S]*?<\/div>/, newHeaderRight);
}

// 2. Add #yawn-behind-overlay right before </section> of view-yawn-world
const yawnOverlayHTML = `        <!-- ======================================================== -->
        <!-- OVERLAY: BEHIND THE YAWN (SECRET MERMAID SANCTUARY) -->
        <!-- ======================================================== -->
        <div class="yawn-behind-overlay" id="yawn-behind-overlay" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Behind the Yawn Storybook">
          <!-- Floating Underwater Ambient Particles & Caustic Rays -->
          <div class="yawn-behind-stage" aria-hidden="true">
            <div class="yawn-behind-caustics"></div>
            <div class="yawn-behind-backdrop-art"></div>
            <div class="yawn-behind-bubbles">
              <span class="yawn-behind-bubble b1"></span>
              <span class="yawn-behind-bubble b2"></span>
              <span class="yawn-behind-bubble b3"></span>
              <span class="yawn-behind-bubble b4"></span>
              <span class="yawn-behind-bubble b5"></span>
              <span class="yawn-behind-bubble b6"></span>
            </div>
            <div class="yawn-behind-particles">
              <span class="particle p1">🫧</span>
              <span class="particle p2">🐚</span>
              <span class="particle p3">🪸</span>
              <span class="particle p4">✨</span>
            </div>
          </div>

          <div class="yawn-behind-container">
            <!-- Header: Back Button, Author Badge & Close Button -->
            <header class="yawn-behind-header">
              <button type="button" class="yawn-behind-back-btn" id="btn-back-yawn-behind" aria-label="Kembali ke YAWN">
                <span>←</span>
                <span>Kembali ke YAWN</span>
              </button>
              <div class="yawn-behind-title-badge">
                <span class="yawn-behind-author-tag">THE MERMAID'S SANCTUARY ✧ A STORY BY LELE</span>
                <h2 class="yawn-behind-main-title">BEHIND THE YAWN</h2>
              </div>
              <button type="button" class="yawn-behind-close-btn" id="btn-close-yawn-behind" aria-label="Tutup Behind the Yawn">✕</button>
            </header>

            <!-- Navigation Tabs (5 Chapters) -->
            <nav class="yawn-behind-nav" role="tablist" aria-label="Daftar Bab Behind the Yawn">
              <button type="button" class="yawn-behind-tab-btn active" role="tab" aria-selected="true" data-chapter="1">
                <span class="tab-num">CH. I</span>
                <span class="tab-title">The Mermaid</span>
              </button>
              <button type="button" class="yawn-behind-tab-btn" role="tab" aria-selected="false" data-chapter="2">
                <span class="tab-num">CH. II</span>
                <span class="tab-title">Why YAWN?</span>
              </button>
              <button type="button" class="yawn-behind-tab-btn" role="tab" aria-selected="false" data-chapter="3">
                <span class="tab-num">CH. III</span>
                <span class="tab-title">The Pain You Never Told</span>
              </button>
              <button type="button" class="yawn-behind-tab-btn" role="tab" aria-selected="false" data-chapter="4">
                <span class="tab-num">CH. IV</span>
                <span class="tab-title">A Letter from Lele</span>
              </button>
              <button type="button" class="yawn-behind-tab-btn" role="tab" aria-selected="false" data-chapter="5">
                <span class="tab-num">CH. V</span>
                <span class="tab-title">Epilogue: YAWN</span>
              </button>
            </nav>

            <!-- Reading Progress Bar -->
            <div class="yawn-behind-progress-track" aria-hidden="true">
              <div class="yawn-behind-progress-bar" id="yawn-behind-progress-bar"></div>
            </div>

            <!-- Main Book Deck (Scrollable Chapters) -->
            <main class="yawn-behind-book-deck">

              <!-- ============================================== -->
              <!-- CHAPTER I: THE MERMAID -->
              <!-- ============================================== -->
              <article class="yawn-behind-chapter-panel active" id="yawn-behind-chapter-1" role="tabpanel" tabindex="0">
                <header class="yawn-chapter-header">
                  <span class="yawn-chapter-badge">CHAPTER I • THE ORIGIN</span>
                  <h3 class="yawn-chapter-main-title">THE MERMAID</h3>
                  <p class="yawn-chapter-sub-title">A Heart That Loved Beyond the Ocean.</p>
                </header>

                <div class="yawn-mermaid-hero-banner">
                  <div class="mermaid-avatar-frame">
                    <img src="/assets/portrait_akhira_hd.jpg" alt="Akhira — The Mermaid of YAWN">
                  </div>
                  <div class="mermaid-banner-text">
                    <h3>Sang Putri Duyung dari Kedalaman Samudra</h3>
                    <p>"Ketika seorang putri duyung jatuh cinta, ia rela menyerahkan suara dan dunianya sendiri demi melangkah di daratan yang asing."</p>
                  </div>
                </div>

                <p class="yawn-journal-p drop-cap">
                  Ada alasan yang begitu mendalam mengapa aku, sebagai author, memilih wujud seorang putri duyung untuk menggambarkan sosok Akhira di Our Little Universe. Dalam berbagai dongeng klasik yang pernah kita baca, putri duyung bukanlah sekadar makhluk mitologi dengan paras rupawan dan ekor yang berkilau di bawah permukaan air. Dia adalah personifikasi dari sebuah hati yang mencintai seseorang begitu dalam—begitu tulus dan tanpa syarat, hingga batas antara keberanian dan pengorbanan menjadi samar.
                </p>

                <p class="yawn-journal-p">
                  Menurut pandanganku, Akhira memiliki jiwa seperti putri duyung itu. Ketika dia sudah menaruh rasa cinta dan kepedulian kepada seseorang, dia tidak pernah mencintai dengan setengah hati. Dia mampu melakukan banyak hal yang di luar dugaan, berani mengambil keputusan-keputusan besar yang mengubah arah hidupnya, dan melangkah sejauh mungkin demi orang yang begitu berarti baginya. Kisah putri duyung yang rela mempertaruhkan segalanya hingga pada akhirnya larut menjadi buih laut sering kali dijadikan metafora tentang cinta yang mendalam, pengorbanan yang sunyi, dan rasa kehilangan yang teramat berat.
                </p>

                <div class="yawn-story-grid-2col">
                  <div class="yawn-story-card">
                    <span class="yawn-story-card-icon">🌊</span>
                    <h4>Cinta yang Melampaui Samudra</h4>
                    <p>
                      Mencintai dengan segenap jiwa adalah anugerah terindah yang dimiliki Akhira. Ketulusannya mampu menghangatkan samudra terdingin dan memberikan rasa aman bagi siapa pun yang ia sayangi.
                    </p>
                  </div>
                  <div class="yawn-story-card">
                    <span class="yawn-story-card-icon">🐚</span>
                    <h4>Hak untuk Menjaga Diri Sendiri</h4>
                    <p>
                      Namun pengorbanan bukanlah satu-satunya tolok ukur ketulusan. Seseorang yang mencintai begitu dalam tidak seharusnya kehilangan jati diri dan tetap memiliki hak mutlak untuk merawat serta mencintai dirinya sendiri.
                    </p>
                  </div>
                </div>

                <p class="yawn-journal-p">
                  Sebagai author, aku tidak ingin hanya melukiskan pengorbanan itu sebagai sebuah romantisme tragis yang dipuja-puja. Keindahan dongeng putri duyung tidak terletak pada rasa sakitnya, melainkan pada ketulusan hatinya yang tak terbantahkan. Melalui semesta YAWN, aku ingin mengingatkan Akhira bahwa hati yang begitu lapang memberikan kasih sayang kepada orang lain juga berhak—dan wajib—menerima kasih sayang, perlindungan, dan rasa aman yang sama besarnya untuk dirinya sendiri.
                </p>

                <div class="yawn-seafoam-quote">
                  <p>"Kisah putri duyung yang rela menjadi buih bukan sekadar tentang kehilangan, melainkan pengingat bahwa hati yang mencintai begitu dalam juga berhak untuk dijaga dan disayangi."</p>
                  <span>— Catatan Perjalanan Author Lele 🌙</span>
                </div>
              </article>

              <!-- ============================================== -->
              <!-- CHAPTER II: WHY YAWN? -->
              <!-- ============================================== -->
              <article class="yawn-behind-chapter-panel" id="yawn-behind-chapter-2" role="tabpanel" tabindex="0">
                <header class="yawn-chapter-header">
                  <span class="yawn-chapter-badge">CHAPTER II • THE UNIVERSE NAME</span>
                  <h3 class="yawn-chapter-main-title">WHY YAWN?</h3>
                  <p class="yawn-chapter-sub-title">Behind the Smile, There Is a Story.</p>
                </header>

                <p class="yawn-journal-p drop-cap">
                  Banyak yang mungkin bertanya mengapa aku memilih kata <strong>YAWN</strong> sebagai nama dari universe Akhira. Mengapa sebuah kata sederhana yang menggambarkan seseorang yang menguap dipilih untuk melambangkan sebuah istana kosmik bawah laut yang megah? Jawabannya tersembunyi di balik cara Akhira menjalani hari-harinya di dunia nyata.
                </p>

                <p class="yawn-journal-p">
                  Akhira adalah tipe orang yang sering kali memilih untuk menyimpan segala hal sendirian. Ketika hari-harinya dipenuhi kesulitan, ketika beban pikiran menumpuk, atau ketika hatinya sedang terluka, dia jarang sekali mengeluh atau menceritakan rasa sakitnya kepada orang lain. Dia tidak ingin membuat orang-orang di sekitarnya merasa cemas atau terbebani. Sebaliknya, dia selalu berusaha memasang senyuman terbaik, bersikap ceria, dan bertindak seolah-olah semuanya sedang berjalan baik-baik saja.
                </p>

                <div class="yawn-story-grid-2col">
                  <div class="yawn-story-card">
                    <span class="yawn-story-card-icon">🎭</span>
                    <h4>Senyuman di Depan Dunia</h4>
                    <p>
                      Mampu tersenyum dan menyebarkan kehangatan saat batin sedang lelah adalah bukti ketangguhan luar biasa. Namun senyuman itu sering kali menjadi tameng sunyi yang menyembunyikan badai di dalam dada.
                    </p>
                  </div>
                  <div class="yawn-story-card">
                    <span class="yawn-story-card-icon">🫧</span>
                    <h4>Kelelahan yang Disimpan Rapi</h4>
                    <p>
                      "Menguap" (YAWN) adalah helaan napas jujur ketika tubuh dan jiwa mengakui rasa lelahnya. Sebuah tanda kecil manusiawi bahwa seseorang telah berjuang sekuat tenaga sepanjang hari.
                    </p>
                  </div>
                </div>

                <p class="yawn-journal-p">
                  Tetapi sebagai author, dan sebagai sahabat yang memandangnya dengan tulus, aku tahu bahwa tidak semua senyum berarti seseorang sedang bahagia. Di balik senyum itu, ada cerita yang tak pernah diutarakan. <strong>YAWN</strong> adalah simbol dari perasaan yang tidak terucapkan, kelelahan batin yang disimpan rapi, dan ketabahan seseorang yang terus melangkah maju menjalani hari-harinya meskipun ada begitu banyak hal berat yang tidak pernah diketahui oleh dunia luar.
                </p>

                <div class="yawn-seafoam-quote">
                  <p>"YAWN adalah pelukan hangat bagi kelelahan yang tak pernah kau ceritakan, sebuah ruang aman di mana kamu tidak perlu berpura-pura selalu kuat."</p>
                  <span>— Filosofi Semesta YAWN ⚡</span>
                </div>
              </article>

              <!-- ============================================== -->
              <!-- CHAPTER III: THE PAIN YOU NEVER TOLD -->
              <!-- ============================================== -->
              <article class="yawn-behind-chapter-panel" id="yawn-behind-chapter-3" role="tabpanel" tabindex="0">
                <header class="yawn-chapter-header">
                  <span class="yawn-chapter-badge">CHAPTER III • SILENT WATERS</span>
                  <h3 class="yawn-chapter-main-title">THE PAIN YOU NEVER TOLD</h3>
                  <p class="yawn-chapter-sub-title">Some Feelings Are Difficult to Put Into Words.</p>
                </header>

                <p class="yawn-journal-p drop-cap">
                  Ada bagian dari samudra yang begitu dalam hingga sinar matahari pun tak mampu menembusnya. Begitu pula dengan hati manusia. Sebagai author, aku sadar sepenuhnya bahwa aku tidak mengetahui seluruh hal yang pernah dilalui Akhira. Ada begitu banyak malam-malam sepi, kegelisahan, dan rasa sakit yang pada akhirnya hanya bisa dipahami dan dirasakan oleh Akhira sendiri.
                </p>

                <p class="yawn-journal-p">
                  Namun satu hal yang ingin aku tegaskan padanya: memilih untuk tidak bercerita bukanlah sebuah kesalahan. Diam bukan berarti perasaannya tidak berharga, dan memendam bukan berarti rasa sakit itu tidak nyata. Terkadang, ada rasa sakit yang memang teramat sulit untuk dirangkai menjadi kata-kata, dan tidak ada keharusan bagi siapa pun untuk menjelaskan lukanya kepada dunia jika itu hanya akan menambah beban di hati.
                </p>

                <div class="yawn-story-grid-2col">
                  <div class="yawn-story-card">
                    <span class="yawn-story-card-icon">🌊</span>
                    <h4>Hening yang Bermakna</h4>
                    <p>
                      Memilih untuk diam sering kali adalah cara pertahanan diri yang paling lembut. Keheningan Akhira layak dihormati, didengar tanpa kata, dan ditemani tanpa desakan.
                    </p>
                  </div>
                  <div class="yawn-story-card">
                    <span class="yawn-story-card-icon">🧭</span>
                    <h4>Keputusan Terbaik pada Masanya</h4>
                    <p>
                      Setiap keputusan yang pernah diambil—untuk pergi, untuk bertahan, atau untuk melepaskan—dibuat dengan segenap pertimbangan dan kemampuan terbaik saat itu.
                    </p>
                  </div>
                </div>

                <p class="yawn-journal-p">
                  Aku tidak ingin Akhira merasa bersalah atas keputusannya untuk memilih diam. Aku pun tidak akan pernah menyudutkan atau meragukan jalan apa pun yang pernah ia ambil di masa lalu. Kita semua sering kali harus mengambil keputusan di tengah situasi yang rumit, dan apa pun yang ia putuskan saat itu adalah keputusan terbaik yang bisa ia ambil dengan bekal perasaan, keadaan, dan kekuatan yang ia miliki kala itu. Jangan pernah menghukum dirimu di masa kini atas apa yang kau putuskan di masa lalu.
                </p>

                <div class="yawn-seafoam-quote">
                  <p>"Jangan pernah menghukum dirimu atas keputusan masa lalu. Kamu telah berjuang dengan sebaik-baiknya bekal dan perasaan yang kamu miliki saat itu."</p>
                  <span>— Pesan Hati Author 🤍</span>
                </div>
              </article>

              <!-- ============================================== -->
              <!-- CHAPTER IV: A LETTER FROM LELE -->
              <!-- ============================================== -->
              <article class="yawn-behind-chapter-panel" id="yawn-behind-chapter-4" role="tabpanel" tabindex="0">
                <header class="yawn-chapter-header">
                  <span class="yawn-chapter-badge">CHAPTER IV • A PERSONAL LETTER</span>
                  <h3 class="yawn-chapter-main-title">A LETTER FROM LELE</h3>
                  <p class="yawn-chapter-sub-title">To the Mermaid Who Deserves to Be Loved, Too.</p>
                </header>

                <!-- Pearl Parchment Letter Card -->
                <div class="yawn-pearl-parchment">
                  <div class="yawn-pearl-seal">LELE 🌙 ~ AUTHOR SEAL</div>
                  <div class="yawn-letter-header">
                    <span class="yawn-letter-tag">SURAT PRIBADI DARI AUTHOR</span>
                    <span class="yawn-letter-date">Di bawah pendar kristal samudra</span>
                  </div>

                  <h4 class="yawn-letter-salutation">Untuk Akhira,</h4>

                  <div class="yawn-letter-body">
                    <p>
                      <strong>Jangan membenci dirimu sendiri</strong> hanya karena kamu pernah mencintai seseorang begitu dalam.
                    </p>

                    <p>
                      Jangan membenci keputusan yang pernah kamu ambil. Keputusanmu untuk memilih jalanmu sendiri, untuk pergi, atau untuk melepaskan sesuatu yang begitu berarti bagimu.
                    </p>

                    <p>
                      Author tidak tahu seluruh hal yang pernah kamu lalui. Bahkan mungkin ada banyak rasa sakit yang tidak pernah kamu ceritakan, termasuk kepadaku. Dan aku tahu, menyimpan semuanya sendirian pasti tidak mudah.
                    </p>

                    <p class="letter-highlight">
                      "Aku tidak ingin kamu terus menyalahkan dirimu atas sesuatu yang sudah terjadi. Kamu mengambil keputusan itu dengan segala perasaan, pertimbangan, dan keadaan yang kamu miliki saat itu. Jadi, jangan terus menghukum dirimu sendiri hanya karena sekarang kamu melihat semuanya dari sudut pandang yang berbeda."
                    </p>

                    <p>
                      Mungkin memang ada hal-hal yang tidak bisa kita miliki, meskipun kita sudah mencintainya sepenuh hati. Tetapi itu tidak membuat perasaanmu menjadi kesalahan.
                    </p>

                    <p>
                      Aku tahu kamu bisa begitu berarti bagi seseorang, bahkan ketika kamu sendiri mungkin tidak menyadarinya. Dan kamu juga begitu berarti bagi author.
                    </p>

                    <p>
                      Aku mungkin tidak selalu tahu kapan kamu sedang sedih. Aku mungkin tidak selalu bisa memahami apa yang sedang kamu pendam. Namun, aku ingin kamu tahu bahwa kamu tidak harus selalu terlihat bahagia. Kamu tidak perlu berpura-pura baik-baik saja setiap saat.
                    </p>

                    <p>
                      Anggaplah semua yang pernah terjadi sebagai bagian dari perjalananmu. Bukan sesuatu yang harus kamu sesali selamanya, tetapi sesuatu yang bisa mengajarkan kita untuk menjadi manusia yang lebih baik.
                    </p>

                    <p>
                      Jadi, tolong jangan membenci dirimu sendiri. Jangan membenci hatimu yang pernah mencintai begitu dalam. Dan jangan menyesali dirimu yang sudah berusaha mengambil keputusan terbaik menurutmu.
                    </p>

                    <p>
                      <strong>Kamu juga pantas mendapatkan ketenangan, pengertian, dan kasih sayang yang selama ini mungkin begitu mudah kamu berikan kepada orang lain.</strong>
                    </p>

                    <p>
                      Terima kasih sudah menjadi bagian yang begitu berarti bagi author.
                    </p>

                    <div class="yawn-letter-signoff">
                      <span>With love,</span>
                      <span class="author-signature">Lele — Your Author. 🌙</span>
                    </div>
                  </div>

                  <!-- Read Again Button -->
                  <div class="yawn-letter-actions">
                    <button type="button" class="btn-yawn-letter-replay" id="btn-yawn-letter-replay">
                      <span>✨</span>
                      <span>Baca Ulang Surat (Read Again)</span>
                    </button>
                  </div>
                </div>
              </article>

              <!-- ============================================== -->
              <!-- CHAPTER V: EPILOGUE & YAWN SONG -->
              <!-- ============================================== -->
              <article class="yawn-behind-chapter-panel" id="yawn-behind-chapter-5" role="tabpanel" tabindex="0">
                <header class="yawn-chapter-header">
                  <span class="yawn-chapter-badge">CHAPTER V • EPILOGUE & SOUNDTRACK</span>
                  <h3 class="yawn-chapter-main-title">EPILOGUE: YAWN</h3>
                  <p class="yawn-chapter-sub-title">Even the Sea Foam Deserves to Shine.</p>
                </header>

                <p class="yawn-journal-p drop-cap">
                  Kisah dongeng putri duyung klasik sering kali berakhir ketika buih-buih putih di permukaan laut perlahan menghilang tertiup angin senja. Namun di Our Little Universe, cerita Akhira tidak berhenti di sana. Akhira bukan hanya seorang putri duyung yang mencintai sampai kehilangan dirinya sendiri dalam sebuah dongeng sedih. Dia adalah jiwa yang hidup, yang masih memiliki masa depan panjang, dan berhak sepenuhnya untuk menemukan ketenangan serta kebahagiaannya sendiri.
                </p>

                <!-- Musical Experience: YAWN Official Soundtrack -->
                <div class="yawn-music-player-container">
                  <div class="yawn-song-header">
                    <div class="yawn-song-info">
                      <div class="yawn-song-disc" id="yawn-song-disc">🎶</div>
                      <div class="yawn-song-titles">
                        <h4>YAWN (하품) — SEVENTEEN</h4>
                        <p>Official Soundtrack ✧ Lagu Tema Narasi Semesta Akhira</p>
                      </div>
                    </div>
                    <div class="yawn-song-controls">
                      <button type="button" class="btn-yawn-song-toggle" id="btn-yawn-song-toggle">
                        <span>▶</span>
                        <span>Play Soundtrack</span>
                      </button>
                    </div>
                  </div>

                  <!-- Clean YouTube Embed (No Autoplay) -->
                  <div class="yawn-youtube-wrapper">
                    <iframe id="yawn-youtube-iframe"
                      src="https://www.youtube-nocookie.com/embed/0TQmr3Kq51I?enablejsapi=1&rel=0&modestbranding=1"
                      title="YAWN Official Soundtrack"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowfullscreen>
                    </iframe>
                  </div>

                  <div style="font-size:0.88rem; line-height:1.7; color:#cbd5e1;">
                    <p style="margin:0 0 10px 0;">
                      <strong style="color:#7dd3fc;">Makna &amp; Inspirasi Lagu YAWN:</strong> Alunan melodi lembut dan piano yang menyentuh dalam lagu ini menjadi cerminan dari sebuah helaan napas panjang di pengujung hari yang melelahkan. Lagu ini tidak berusaha memaksa seseorang untuk segera bangkit, melainkan hadir sebagai teman yang duduk di sampingmu dalam keheningan—mengakui rasa lelahmu, memvalidasi air matamu, dan berbisik lembut bahwa beristirahat adalah hak yang wajar bagi setiap jiwa yang telah berjuang.
                    </p>
                    <p style="margin:0; font-size:0.8rem; color:#94a3b8;">
                      Video resmi disediakan langsung dari YouTube: <a href="https://www.youtube.com/watch?v=0TQmr3Kq51I" target="_blank" rel="noopener noreferrer" style="color:#7dd3fc; text-decoration:underline;">Tonton di YouTube Resmi</a>.
                    </p>
                  </div>
                </div>

                <p class="yawn-journal-p">
                  Cinta yang pernah kau berikan di masa lalu tidak perlu pernah kau sesali. Keputusan-keputusan berat yang pernah kau ambil tidak harus menjadi alasan untuk membenci dirimu sendiri selamanya. Masa lalu boleh menjadi bagian dari bab dalam buku ceritamu, tetapi ia tidak memiliki hak untuk menentukan bagaimana kamu memandang dirimu di hari esok.
                </p>

                <!-- Epilogue Climax Quote -->
                <div class="yawn-epilogue-climax">
                  <h3>"Bahkan Buih Laut Pun Berhak untuk Bersinar."</h3>
                  <p>
                    "Di kedalaman samudra Underwater Astral City, biarkan hatimu bernapas bebas. Kamu tidak sendirian, kamu dicintai, dan kamu berhak menemukan kedamaian yang sejati."
                  </p>
                  <p style="margin-top:14px; font-weight:700; color:#7dd3fc; letter-spacing:0.06em;">
                    — With Love, Lele (Your Author) 🌙✨
                  </p>
                </div>
              </article>

            </main>

            <!-- Footer: Previous / Next & Dots Navigation -->
            <footer class="yawn-behind-footer">
              <button type="button" class="yawn-behind-nav-btn" id="btn-yawn-behind-prev" disabled>
                <span>←</span>
                <span>Bab Sebelumnya</span>
              </button>
              <div class="yawn-behind-footer-indicator">
                <span class="yawn-indicator-dot active" data-chapter="1"></span>
                <span class="yawn-indicator-dot" data-chapter="2"></span>
                <span class="yawn-indicator-dot" data-chapter="3"></span>
                <span class="yawn-indicator-dot" data-chapter="4"></span>
                <span class="yawn-indicator-dot" data-chapter="5"></span>
              </div>
              <button type="button" class="yawn-behind-nav-btn" id="btn-yawn-behind-next">
                <span>Bab Selanjutnya</span>
                <span>→</span>
              </button>
            </footer>
          </div>
        </div>
`;

// Insert the overlay right before </section> of view-yawn-world
const yawnSectionCloseTarget = `            <div class="yawn-mood-history-list" id="yawn-mood-history-list">
                <!-- Dynamically populated entries -->
              </div>
            </div>
          </div>
        </div>

      </section>`;

const yawnSectionCloseReplacement = `            <div class="yawn-mood-history-list" id="yawn-mood-history-list">
                <!-- Dynamically populated entries -->
              </div>
            </div>
          </div>
        </div>

${yawnOverlayHTML}
      </section>`;

if (bodyContent.includes(yawnSectionCloseTarget)) {
  bodyContent = bodyContent.replace(yawnSectionCloseTarget, yawnSectionCloseReplacement);
  console.log('[OK] Inserted yawnOverlayHTML before end of view-yawn-world');
} else {
  console.error('[ERROR] Could not find yawnSectionCloseTarget in bodyContent!');
  process.exit(1);
}

// Assemble full index.html
const finalIndexHTML = headTags + '\n' + bodyContent + '\n</body>\n\n</html>\n';

fs.writeFileSync('index.html', finalIndexHTML, 'utf8');
console.log('[SUCCESS] Reconstructed index.html with Behind the Yawn!');
