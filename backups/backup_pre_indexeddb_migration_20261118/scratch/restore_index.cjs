const fs = require('fs');

const distHtml = fs.readFileSync('dist/index.html', 'utf-8');

// Find where <div class="universe-container" id="universe-app"> starts
const bodyStartIdx = distHtml.indexOf('<div class="universe-container" id="universe-app">');
// Find where </body> starts
const bodyEndIdx = distHtml.indexOf('</body>');

const bodyContent = distHtml.substring(bodyStartIdx, bodyEndIdx).trim();

const devHead = `<!DOCTYPE html>
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
  <link rel="stylesheet" href="/usagain.css">
  <link rel="stylesheet" href="/hot.css">
</head>

<body>
<!-- Ambient Audio / Cosmic Canvas Background -->`;

const fullHtml = devHead + '\n  ' + bodyContent + '\n\n  <script type="module" src="/main.js"></script>\n</body>\n\n</html>\n';
fs.writeFileSync('index.html', fullHtml, 'utf-8');
console.log('Restored index.html, total lines:', fullHtml.split('\n').length);
