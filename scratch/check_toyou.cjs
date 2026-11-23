const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n');
let start = -1;
let end = -1;
lines.forEach((l, i) => {
  if (l.includes('id="view-toyou-world"')) start = i + 1;
  if (start > 0 && end === -1 && i > start && l.includes('</section>')) {
    end = i + 1;
    console.log(`view-toyou-world starts at ${start} and section ends at ${end}`);
  }
});
