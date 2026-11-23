const fs = require('fs');
const c = fs.readFileSync('main.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('PROTECTED_VIEWS') || l.includes('view-everdream') || l.includes('view-pinwheel')) {
    console.log(`${i+1}: ${l}`);
  }
});
