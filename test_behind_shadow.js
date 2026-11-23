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
assert(textOnly.includes('The angel I became, the devil I never truly left.'), 'index.html contains button subtitle "The angel I became, the devil I never truly left."');

// 2. Overlay & Navigation Elements
assert(html.includes('id="shadow-behind-overlay"'), 'index.html contains #shadow-behind-overlay');
assert(html.includes('id="btn-back-shadow-behind"'), 'index.html contains #btn-back-shadow-behind');
assert(html.includes('id="btn-close-shadow-behind"'), 'index.html contains #btn-close-shadow-behind');
assert(html.includes('id="btn-shadow-behind-prev"'), 'index.html contains #btn-shadow-behind-prev');
assert(html.includes('id="btn-shadow-behind-next"'), 'index.html contains #btn-shadow-behind-next');
assert(textOnly.includes('Kembali ke SHADOW'), 'index.html back button text specifies "Kembali ke SHADOW"');

// 3. Chapter I: WHY HALF ANGEL, HALF DEVIL?
assert(textOnly.includes('WHY HALF ANGEL, HALF DEVIL?'), 'index.html contains Chapter I title');
assert(textOnly.includes('THE ANGEL — Sisi Malaikat yang Bersinar'), 'index.html contains The Angel section heading');
assert(textOnly.includes('THE DEVIL — Sisi Iblis yang Dingin dan Tersembunyi'), 'index.html contains The Devil section heading');
assert(textOnly.includes('Half Angel, Half Devil'), 'index.html contains duality badge');
assert(textOnly.includes('The Eclipse Guardian'), 'index.html contains character role');
assert(textOnly.includes('Find your light in the darkness.'), 'index.html contains character quote');
assert(textOnly.includes('Memberikan yang terbaik tanpa menuntut pamrih'), 'index.html contains angel trait');
assert(textOnly.includes('Egois dan berjarak'), 'index.html contains devil trait');

// 4. Chapter II: WHY SHADOW?
assert(textOnly.includes('WHY SHADOW?'), 'index.html contains Chapter II title');
assert(textOnly.includes('The shadow that follows wherever the light falls.'), 'index.html contains Chapter II subtitle');
assert(textOnly.includes('SEVENTEEN'), 'index.html contains SEVENTEEN inspiration reference');
assert(textOnly.includes('The Chessboard'), 'index.html contains Chessboard symbol');
assert(textOnly.includes('The Broken Mirror'), 'index.html contains Broken Mirror symbol');
assert(textOnly.includes('The Silent Scale'), 'index.html contains Silent Scale symbol');
assert(textOnly.includes('The Shadow Armor'), 'index.html contains Shadow Armor symbol');
assert(textOnly.includes('bayangan selalu mengikuti ke mana pun seseorang melangkah'), 'index.html contains philosophical reflection on shadows');

// 5. Chapter III: TO THE SHADOW I KEPT RUNNING FROM
assert(textOnly.includes('TO THE SHADOW I KEPT RUNNING FROM'), 'index.html contains Chapter III title');
assert(textOnly.includes('A personal letter from the author to Lele.'), 'index.html contains Chapter III subtitle');
assert(textOnly.includes('Untuk Lele, dan Bayangan yang Selalu Menyertainya:'), 'index.html contains letter salutation');
assert(textOnly.includes('Aku tahu kamu jauh lebih nyaman dengan sisi malaikatmu sekarang.'), 'index.html contains author acknowledgment');
assert(textOnly.includes('kamu tidak harus membenci dirimu hanya karena kamu pernah memiliki bagian yang tidak kamu sukai.'), 'index.html contains core truth');
assert(textOnly.includes('Aku tidak ingin kamu kembali menjadi sosok dingin di masa lalu.'), 'index.html contains author reassurance');

// 6. Chapter IV / Epilogue: EPILOGUE: SHADOW
assert(textOnly.includes('EPILOGUE: SHADOW'), 'index.html contains Epilogue title');
assert(html.includes('8WA9iFj_g9s'), 'index.html contains YouTube Video ID 8WA9iFj_g9s');
assert(html.includes('https://www.youtube-nocookie.com/embed/8WA9iFj_g9s'), 'index.html embeds YouTube nocookie iframe');
assert(!html.includes('autoplay=1'), 'index.html ensures NO autoplay on YouTube embed');
assert(html.includes('https://www.youtube.com/watch?v=8WA9iFj_g9s'), 'index.html links to official YouTube song');
assert(textOnly.includes("You don't have to destroy your shadow to become the light. You only have to stop running from the parts of yourself you never learned to understand."), 'index.html contains mandatory closing quote 1');
assert(textOnly.includes('“Even in the brightest light, I will still be your shadow.”'), 'index.html contains mandatory closing quote 2');
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
