const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('id="view-bloom-cottage"');
const end = html.indexOf('</section>', start);
console.log('Bloom Cottage length:', end - start);
console.log('Snippet:\n', html.substring(start, start + 2500));
