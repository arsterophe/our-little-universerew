const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const m = html.match(/<link rel="stylesheet"[^>]+>/g);
console.log(m);
