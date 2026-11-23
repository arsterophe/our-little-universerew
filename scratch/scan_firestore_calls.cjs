const fs = require('fs');
const path = require('path');

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((l, idx) => {
    if (l.includes('collection(') || l.includes('doc(') || l.includes('_COLLECTION') || l.includes('setDoc') || l.includes('getDoc') || l.includes('addDoc')) {
      if (!l.includes('node_modules') && !l.includes('test_')) {
        console.log(`${filePath}:${idx+1}: ${l.trim().slice(0, 120)}`);
      }
    }
  });
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    if (f === 'node_modules' || f === '.git' || f === 'dist' || f === 'scratch' || f.startsWith('test_')) continue;
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scanDir(full);
    } else if (f.endsWith('.js')) {
      scanFile(full);
    }
  }
}

scanDir('.');
