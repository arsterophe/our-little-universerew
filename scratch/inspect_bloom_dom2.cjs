const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('id="view-bloom-cottage"');
const end = html.indexOf('</section>', start);
console.log('Snippet 2:\n', html.substring(start + 2400, end));
