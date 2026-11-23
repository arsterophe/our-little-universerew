import fs from 'fs';

const content = fs.readFileSync('universes_view.js', 'utf8');
const lines = content.split('\n');
lines.slice(2110, 2220).forEach((l, i) => {
  if (l.includes('toyouHotspots') || l.includes('btnToYouLocAction') || l.includes('locKey ===') || l.includes('loc.actionType ===')) {
    console.log(`Line ${2111 + i}: ${l}`);
  }
});
