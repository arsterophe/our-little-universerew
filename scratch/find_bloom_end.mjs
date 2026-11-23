import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
for (let i = 2828; i < lines.length; i++) {
  if (lines[i].includes('</section>') && (lines[i+1]?.includes('<section') || lines[i+2]?.includes('<section') || lines[i-1]?.includes('bloom-cottage'))) {
    console.log(`Potential end at line ${i + 1}: ${lines[i].trim()} -> next: ${lines[i+1]?.trim().slice(0, 50)}`);
    if (i > 3200) break;
  }
}
