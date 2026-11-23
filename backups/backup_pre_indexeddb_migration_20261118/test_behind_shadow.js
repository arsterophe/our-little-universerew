import fs from 'fs';

console.log('--- Verifying BEHIND THE SHADOW static content, CSS rules, and JS controller ---');

const html = fs.readFileSync('index.html', 'utf8');
const textOnly = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const css = fs.readFileSync('shadow_behind.css', 'utf8');
const js = fs.readFileSync('shadow_behind_view.js', 'utf8');
const univJs = fs.readFileSync('universes_view.js', 'utf8');

function assert(condition, message) {
  if (!condition) {
    console.error('❌ FAIL:', message);
    process.exit(1);
  }
  console.log('✅ PASS:', message);
}

// 1. Button in index.html (SHADOW HUD Top-Right)
assert(html.includes('id="btn-shadow-behind"'), 'index.html contains #btn-shadow-behind');
assert(textOnly.includes('BEHIND THE SHADOW'), 'index.html contains "BEHIND THE SHADOW" text');
assert(textOnly.includes('The Angel I Show, The Devil I Hide.'), 'index.html contains button subtitle "The Angel I Show, The Devil I Hide."');

// 2. Overlay & Navigation Elements
assert(html.includes('id="shadow-behind-overlay"'), 'index.html contains #shadow-behind-overlay');
assert(html.includes('id="btn-back-shadow-behind"'), 'index.html contains #btn-back-shadow-behind');
assert(html.includes('id="btn-close-shadow-behind"'), 'index.html contains #btn-close-shadow-behind');
assert(html.includes('id="btn-shadow-behind-prev"'), 'index.html contains #btn-shadow-behind-prev');
assert(html.includes('id="btn-shadow-behind-next"'), 'index.html contains #btn-shadow-behind-next');
assert(textOnly.includes('Kembali ke SHADOW'), 'index.html back button text specifies "Kembali ke SHADOW"');

// 3. Chapter I: The Angel I Show
assert(textOnly.includes('The Angel I Show'), 'index.html contains Chapter I title');
assert(textOnly.includes('The kindness behind the quiet eyes.'), 'index.html contains Chapter I subtitle');
assert(textOnly.includes('Ada alasan mengapa aku selalu memilih untuk menjadi pihak yang tersenyum dan mengalah.'), 'index.html contains Chapter I opening');
assert(textOnly.includes('Sampai kapan aku harus selalu menjadi pihak yang mengalah?'), 'index.html contains Chapter I core internal conflict question');
assert(textOnly.includes('Half Angel, Half Shadow'), 'index.html contains duality specification');
assert(textOnly.includes('The Eclipse Guardian'), 'index.html contains character role');
assert(textOnly.includes('Find your light in the darkness.'), 'index.html contains character quote');
assert(textOnly.includes('Gentle, Empathetic, Observant, Calculating, Guarded, Resilient'), 'index.html contains character personality traits');

// 4. Chapter II: The Devil I Hide
assert(textOnly.includes('The Devil I Hide'), 'index.html contains Chapter II title');
assert(textOnly.includes('Not every silence means forgiveness.'), 'index.html contains Chapter II subtitle');
assert(textOnly.includes('Banyak orang salah mengartikan keheninganku sebagai ketidaktahuan atau kepasrahan.'), 'index.html contains Chapter II opening');
assert(textOnly.includes('sikap sopan bukanlah tanda bahwa luka telah sembuh'), 'index.html contains Chapter II politeness vs healing truth');
assert(textOnly.includes('The Chessboard'), 'index.html contains Chessboard symbol');
assert(textOnly.includes('The Broken Mirror'), 'index.html contains Broken Mirror symbol');
assert(textOnly.includes('The Silent Scale'), 'index.html contains Silent Scale symbol');
assert(textOnly.includes('The Shadow Armor'), 'index.html contains Shadow Armor symbol');

// 5. Chapter III: The Shadow Is Me
assert(textOnly.includes('The Shadow Is Me'), 'index.html contains Chapter III title');
assert(textOnly.includes('I hated you because I recognized myself.'), 'index.html contains Chapter III subtitle');
assert(textOnly.includes('Malam Tanpa Bintang · Crystal Moon Sanctuary'), 'index.html contains Chapter III date stamp');
assert(textOnly.includes('Pernah ada masa di mana aku sangat membenci sisi dinginku sendiri.'), 'index.html contains Chapter III confession');
assert(textOnly.includes('Menerima kegelapan bukan berarti membenarkan kejahatan.'), 'index.html contains Chapter III core philosophical truth');
assert(textOnly.includes('Aku tidak lagi memusuhimu, wahai bayanganku.'), 'index.html contains Chapter III resolution');

// 6. Chapter IV / Epilogue: My Shadow, My Other Half
assert(textOnly.includes('My Shadow, My Other Half'), 'index.html contains Epilogue title');
assert(textOnly.includes('Even my darkness deserves to be understood.'), 'index.html contains Epilogue subtitle');
assert(html.includes('8WA9iFj_g9s'), 'index.html contains YouTube Video ID 8WA9iFj_g9s');
assert(html.includes('https://www.youtube-nocookie.com/embed/8WA9iFj_g9s'), 'index.html embeds YouTube nocookie iframe');
assert(!html.includes('autoplay=1'), 'index.html ensures NO autoplay on YouTube embed');
assert(textOnly.includes('SEVENTEEN'), 'index.html contains SEVENTEEN');
assert(textOnly.includes('The Meaning Behind the Song'), 'index.html contains Section "The Meaning Behind the Song"');
assert(html.includes('https://www.youtube.com/watch?v=8WA9iFj_g9s'), 'index.html links to YouTube for official song/lyrics');
assert(textOnly.includes('Aku tidak harus menjadi malaikat untuk pantas dicintai, dan aku tidak harus menjadi iblis hanya karena pernah disakiti.'), 'index.html contains Closing Quote');
assert(textOnly.includes('— Lele · The Eclipse Guardian of SHADOW —'), 'index.html contains closing author signature');

// 7. Stylesheet link in index.html
assert(html.includes('<link rel="stylesheet" href="/shadow_behind.css">'), 'index.html links shadow_behind.css in head');

// 8. CSS Rules in shadow_behind.css
assert(css.includes('.shadow-behind-overlay'), 'shadow_behind.css contains .shadow-behind-overlay');
assert(css.includes('.shadow-behind-container'), 'shadow_behind.css contains .shadow-behind-container');
assert(css.includes('.shadow-behind-pill'), 'shadow_behind.css contains .shadow-behind-pill');
assert(css.includes('.shadow-parchment-letter'), 'shadow_behind.css contains .shadow-parchment-letter');
assert(css.includes('.shadow-parchment-seal'), 'shadow_behind.css contains .shadow-parchment-seal');
assert(css.includes('.shadow-player-card'), 'shadow_behind.css contains .shadow-player-card');
assert(css.includes('.shadow-meaning-card'), 'shadow_behind.css contains .shadow-meaning-card');
assert(css.includes('.shadow-closing-quote'), 'shadow_behind.css contains .shadow-closing-quote');

// 9. JS Controller in shadow_behind_view.js
assert(js.includes('switchShadowBehindChapter'), 'shadow_behind_view.js has switchShadowBehindChapter');
assert(js.includes('openBehindShadow'), 'shadow_behind_view.js has openBehindShadow');
assert(js.includes('closeBehindShadow'), 'shadow_behind_view.js has closeBehindShadow');
assert(js.includes('stopShadowBehindVideo'), 'shadow_behind_view.js has stopShadowBehindVideo');
assert(js.includes('pauseShadowBehindVideo'), 'shadow_behind_view.js has pauseShadowBehindVideo');
assert(js.includes('initShadowBehindView'), 'shadow_behind_view.js has initShadowBehindView');

// 10. Universes View Integration
assert(univJs.includes('initShadowBehindView'), 'universes_view.js imports and initializes initShadowBehindView');
assert(univJs.includes('shadowBehindController'), 'universes_view.js exports shadowBehindController');
assert(univJs.includes('closeBehindShadow()'), 'universes_view.js calls closeBehindShadow() on closeShadowWorld');

console.log('\n🎉 ALL BEHIND THE SHADOW ASSERTIONS PASSED SUCCESSFULLY!');
