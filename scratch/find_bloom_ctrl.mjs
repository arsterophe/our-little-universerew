import fs from 'fs';

const content = fs.readFileSync('universes_view.js', 'utf8');
const lines = content.split('\n');
lines.forEach((l, i) => {
  if (l.includes('initBloomCottageView') || l.includes('bloomCottageCtrl =') || l.includes('bloomCottageCtrl?.')) {
    console.log(`Line ${i + 1}: ${l.trim().slice(0, 90)}`);
  }
});
