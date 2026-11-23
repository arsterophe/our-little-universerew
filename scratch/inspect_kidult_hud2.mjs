import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('class="kidult-hud-topleft"');
console.log(html.slice(start, start + 2500));
