import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
let s = -1, e = -1;
lines.forEach((l, i) => {
  if (l.includes('id="view-toyou-world"')) s = i + 1;
  if (s !== -1 && e === -1 && l.includes('id="view-bloom-cottage"')) e = i + 1;
});
console.log('view-toyou-world start line:', s, 'bloom-cottage line:', e);
