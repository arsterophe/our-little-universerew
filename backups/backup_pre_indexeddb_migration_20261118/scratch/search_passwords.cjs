const fs = require('fs');

function search(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git' || f === 'dist') continue;
    const p = dir + '/' + f;
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      search(p);
    } else if (f.endsWith('.js') || f.endsWith('.mjs') || f.endsWith('.cjs') || f.endsWith('.json')) {
      const content = fs.readFileSync(p, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if ((l.includes('password') || l.includes('Password')) && !l.includes('passwordInput') && !l.includes('type="password"')) {
          if (l.includes("'") || l.includes('"')) {
            console.log(`${p}:${idx + 1}: ${l.trim()}`);
          }
        }
      });
    }
  }
}

search('.');
