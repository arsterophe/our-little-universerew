import fs from 'fs';

const audit = JSON.parse(fs.readFileSync('scratch/localstorage_audit.json', 'utf8'));
const appFiles = audit.filter(a => !a.file.startsWith('test_') && !a.file.startsWith('verify_'));

console.log('App files with localStorage:');
for (const item of appFiles) {
  const setCalls = item.samples.filter(s => s.text.includes('.setItem('));
  const keys = setCalls.map(s => {
    const m = s.text.match(/localStorage\.setItem\(\s*['"`]([^'"`]+)['"`]/);
    return m ? m[1] : s.text.slice(0, 70);
  });
  console.log(`- ${item.file} (${setCalls.length} setItem):`, [...new Set(keys)]);
}
