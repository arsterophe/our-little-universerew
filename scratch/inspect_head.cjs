const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const lines = html.split('\n').slice(0, 45);
console.log(lines.join('\n'));
