const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/\s*\/\s*loading="lazy"/g, ' loading="lazy"');
fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed trailing slashes before loading="lazy".');

