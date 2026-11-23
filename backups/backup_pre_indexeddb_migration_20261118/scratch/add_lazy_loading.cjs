const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// Match all img tags
let count = 0;
html = html.replace(/<img\s+([^>]+)>/gi, (match, attrs) => {
  // If it's already in the selection cards with loading="eager", leave it
  if (attrs.includes('loading="eager"')) {
    return match;
  }
  // Otherwise, ensure loading="lazy" decoding="async"
  count++;
  let newAttrs = attrs;
  if (!newAttrs.includes('loading=')) {
    newAttrs += ' loading="lazy"';
  }
  if (!newAttrs.includes('decoding=')) {
    newAttrs += ' decoding="async"';
  }
  return `<img ${newAttrs}>`;
});

console.log(`Updated ${count} img tags with lazy loading.`);
fs.writeFileSync('index.html', html, 'utf8');

