import fs from 'fs';

let distHtml = fs.readFileSync('dist/index.html', 'utf-8');

const bundledHead = `  <script type="module" crossorigin src="/assets/index-XR-_Obdd.js"></script>\n  <link rel="modulepreload" crossorigin href="/assets/vendor-firebase-CA2oaAJL.js">\n  <link rel="stylesheet" crossorigin href="/assets/index-BSdRFbxM.css">`;

const devHead = `  <link rel="stylesheet" href="/style.css">\n  <link rel="stylesheet" href="/orbit.css">\n  <link rel="stylesheet" href="/moments.css">\n  <link rel="stylesheet" href="/universes.css">\n  <link rel="stylesheet" href="/stories.css">\n  <link rel="stylesheet" href="/photobooth.css">\n  <link rel="stylesheet" href="/messages.css">\n  <link rel="stylesheet" href="/games.css">\n  <link rel="stylesheet" href="/universe_state.css">\n  <link rel="stylesheet" href="/star_messages.css">\n  <link rel="stylesheet" href="/mailbox.css">\n  <link rel="stylesheet" href="/shadow_gazebo.css">`;

if (!distHtml.includes(bundledHead)) {
  console.error('bundledHead not found in dist/index.html');
  process.exit(1);
}

let srcHtml = distHtml.replace(bundledHead, devHead);

srcHtml = srcHtml.replace('</body>', '  <script type="module" src="/main.js"></script>\n</body>');

fs.writeFileSync('index.html', srcHtml, 'utf-8');
console.log('Restored index.html, length:', srcHtml.length);
