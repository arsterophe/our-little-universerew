const fs = require('fs');

const distHtml = fs.readFileSync('dist/index.html', 'utf8');
const bodyIndex = distHtml.indexOf('<body>');
if (bodyIndex === -1) throw new Error('No body found in dist/index.html');
const bodyContent = distHtml.slice(bodyIndex);

const headContent = `<!DOCTYPE html>
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
  <link rel="stylesheet" href="/pinwheel.css">
  <link rel="stylesheet" href="/pinwheel_studio.css">
  <link rel="stylesheet" href="/pinwheel_gazebo.css">
  <link rel="stylesheet" href="/pinwheel_residence.css">
  <link rel="stylesheet" href="/yawn.css">
  <link rel="stylesheet" href="/yawn_gazebo.css">
  <link rel="stylesheet" href="/yawn_cinema.css">
  <link rel="stylesheet" href="/usagain.css">
  <link rel="stylesheet" href="/ash.css">
  <link rel="stylesheet" href="/hot.css">
  <link rel="stylesheet" href="/everdream_house.css">
  <link rel="stylesheet" href="/kidult_house.css">
  <link rel="stylesheet" href="/kidult_gazebo.css">
  <link rel="stylesheet" href="/greenhouse.css">
  <link rel="stylesheet" href="/bloom_cottage.css">
  <link rel="stylesheet" href="/eclipse.css">
  <link rel="stylesheet" href="/azure_palace.css">
  <link rel="stylesheet" href="/silent_lotus.css">
  <link rel="stylesheet" href="/dragon_den.css">
  <link rel="stylesheet" href="/songs_we_share.css">
  <link rel="stylesheet" href="/pinwheel_haven.css">
  <link rel="stylesheet" href="/moonpetal_manor.css">
  <link rel="stylesheet" href="/kidult_behind.css">
  <link rel="stylesheet" href="/toyou_behind.css">
  <link rel="stylesheet" href="/shadow_behind.css">
  <link rel="stylesheet" href="/shadow_mood.css">
  <link rel="stylesheet" href="/yawn_behind.css">
  <link rel="stylesheet" href="/usagain_behind.css">
  <link rel="stylesheet" href="/pinwheel_behind.css">
  <link rel="stylesheet" href="/ash_behind.css">
  <link rel="stylesheet" href="/fairy_atelier.css">
  <link rel="stylesheet" href="/toyou_gazebo.css">
  <script type="module" src="/main.js"></script>
</head>
`;

fs.writeFileSync('index.html', headContent + bodyContent, 'utf8');
console.log('Restored index.html successfully! Length:', fs.readFileSync('index.html', 'utf8').length);
