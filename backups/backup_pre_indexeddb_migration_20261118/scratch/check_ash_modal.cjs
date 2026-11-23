const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const idx = html.indexOf('id="ash-castle-modal"');
if (idx !== -1) {
  console.log(html.slice(idx - 50, idx + 800));
} else {
  console.log('not found');
}
