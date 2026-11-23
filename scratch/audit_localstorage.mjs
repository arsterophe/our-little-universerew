import fs from 'fs';
import path from 'path';

const results = [];
const ignore = new Set(['node_modules', '.git', 'dist', 'backups', '.tmp_cdp_residence_profile', 'scratch']);

function scan(dir) {
  for (const item of fs.readdirSync(dir)) {
    if (ignore.has(item)) continue;
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      scan(full);
    } else if (item.endsWith('.js') || item.endsWith('.mjs') || item.endsWith('.cjs') || item.endsWith('.html')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('localStorage')) {
          results.push({ file: path.relative(process.cwd(), full).replace(/\\/g, '/'), line: idx + 1, text: line.trim() });
        }
      });
    }
  }
}

scan(process.cwd());

console.log('Total localStorage usages found:', results.length);

const byFile = {};
for (const r of results) {
  byFile[r.file] = byFile[r.file] || [];
  byFile[r.file].push(r);
}

const report = [];
for (const [file, items] of Object.entries(byFile)) {
  report.push({
    file,
    count: items.length,
    samples: items.map(i => ({ line: i.line, text: i.text }))
  });
}

fs.writeFileSync('scratch/localstorage_audit.json', JSON.stringify(report, null, 2));
console.log('Audit saved to scratch/localstorage_audit.json. Summary:');
for (const r of report) {
  console.log(`- ${r.file}: ${r.count} occurrences`);
}
