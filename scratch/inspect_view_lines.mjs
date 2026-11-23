import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('id="view-pinwheel-vision-studio"') || line.includes('id="view-bloom-cottage"')) {
    console.log(`Line ${idx + 1}: ${line.trim().slice(0, 80)}`);
  }
});
