const fs = require('fs');
const c = fs.readFileSync('universes_view.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, i) => {
  if (l.includes('btnToYouLocAction') || (l.includes('selectToYouLocation') && l.includes('function'))) {
    console.log(`${i+1}: ${l}`);
  }
});
