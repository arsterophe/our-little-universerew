import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('kidult-hud-topright');
if (start !== -1) {
  console.log(html.slice(start - 50, start + 1200));
} else {
  const startK = html.indexOf('id="view-kidult-world"');
  const endK = html.indexOf('</section>', startK);
  console.log('Searching for topright or controls in kidult:\n', html.slice(startK, endK));
}
