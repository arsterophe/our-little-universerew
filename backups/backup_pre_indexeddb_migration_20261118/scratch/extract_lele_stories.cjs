const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/Local Storage/leveldb';
const files = fs.readdirSync(dir);

const allFound = new Map();

files.forEach(f => {
  if (f.endsWith('.ldb') || f.endsWith('.log')) {
    const full = path.join(dir, f);
    const buf = fs.readFileSync(full);
    const latin = buf.toString('latin1');

    // Look for all occurrences of story-lele-
    let pos = 0;
    while ((pos = latin.indexOf('story-lele-', pos)) !== -1) {
      // Find the ID
      const idMatch = latin.slice(pos, pos + 40).match(/story-lele-[a-zA-Z0-9_-]+/);
      if (idMatch) {
        const id = idMatch[0];
        // Scan backwards for start of object '{'
        let start = pos;
        while (start > 0 && pos - start < 1000 && latin[start] !== '{') {
          start--;
        }
        // Scan forwards for end of object '}'
        let end = pos;
        while (end < latin.length && end - pos < 5000 && latin[end] !== '}') {
          end++;
        }
        const snippet = latin.slice(start, end + 1);
        if (!allFound.has(id) || allFound.get(id).length < snippet.length) {
          allFound.set(id, { id, file: f, pos, snippet });
        }
      }
      pos += 11;
    }
  }
});

console.log(`Total unique Lele story IDs found: ${allFound.size}`);
for (const [id, data] of allFound.entries()) {
  console.log(`\n========================================`);
  console.log(`STORY ID: ${id} (found in ${data.file} at ${data.pos})`);
  console.log(`========================================`);
  console.log(data.snippet.replace(/[\x00-\x1f]/g, ' '));
}

