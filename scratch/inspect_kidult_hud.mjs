import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('id="view-kidult-world"');
const end = html.indexOf('</section>', start);
const snippet = html.slice(start, end);

const matches = snippet.match(/id="([^"]+)"/g);
console.log('IDs in view-kidult-world:', matches);

// Check HUD / top bar in snippet
const hudIdx = snippet.indexOf('kidult-hud') !== -1 ? snippet.indexOf('kidult-hud') : snippet.indexOf('kidult-nav');
if (hudIdx !== -1) {
  console.log('HUD snippet:', snippet.slice(hudIdx - 50, hudIdx + 600));
} else {
  // search for header or buttons
  console.log('First 1500 chars of kidult view:\n', snippet.slice(0, 1500));
}
