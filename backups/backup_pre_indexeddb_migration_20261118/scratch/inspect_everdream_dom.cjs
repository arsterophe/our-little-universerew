const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const start = html.indexOf('id="view-everdream-house"');
const end = html.indexOf('</section>', start);
console.log('Length:', end - start);
console.log('Snippet:\n', html.substring(start, start + 1500));
