import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('id="view-bloom-cottage"') || l.includes('id="view-kotak-pos"') || l.includes('fairy_atelier')) {
    console.log(`Line ${i + 1}: ${l.trim().slice(0, 100)}`);
  }
});
