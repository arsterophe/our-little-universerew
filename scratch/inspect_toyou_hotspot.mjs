import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((l, i) => {
  if (l.includes('hotspot-toyou-gazebo') || l.includes('data-toyou-loc="gazebo"')) {
    console.log(`Line ${i + 1}: ${l.trim()}`);
  }
});
