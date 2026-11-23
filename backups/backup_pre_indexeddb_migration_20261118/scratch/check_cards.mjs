import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf-8');
const matches = html.match(/class="[^"]*univ-island-card[^"]*"/g);
console.log('univ-island-card matches count:', matches ? matches.length : 0);
if (matches) {
  matches.forEach(m => console.log(' ', m));
}

