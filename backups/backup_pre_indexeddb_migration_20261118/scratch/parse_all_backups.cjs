const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/Local Storage/leveldb';
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (f.endsWith('.ldb') || f.endsWith('.log')) {
    const full = path.join(dir, f);
    const buf = fs.readFileSync(full);
    const latin = buf.toString('latin1');

    let pos = 0;
    while ((pos = latin.indexOf('olu_stories_store_v1', pos)) !== -1) {
      console.log(`\n=== Found olu_stories_store_v1 in ${f} at ${pos} ===`);
      // Find JSON array '['
      const jsonStart = latin.indexOf('[', pos);
      if (jsonStart !== -1 && jsonStart - pos < 120) {
        // find matching ']'
        let depth = 0;
        let jsonEnd = -1;
        for (let i = jsonStart; i < latin.length && i - jsonStart < 50000; i++) {
          if (latin[i] === '[') depth++;
          else if (latin[i] === ']') {
            depth--;
            if (depth === 0) {
              jsonEnd = i;
              break;
            }
          }
        }
        if (jsonEnd !== -1) {
          const raw = latin.slice(jsonStart, jsonEnd + 1);
          try {
            const parsed = JSON.parse(raw);
            console.log(`Successfully parsed JSON with ${parsed.length} items!`);
            parsed.forEach((item, idx) => {
              console.log(` Item #${idx + 1}: id=${item.id}, title="${item.title}", author="${item.authorName || item.authorChar || item.authorUid}", status=${item.status}, category=${item.category}`);
            });
          } catch (e) {
            console.log('JSON parse error, raw snippet:', raw.slice(0, 300).replace(/[\x00-\x1f]/g, ' '));
          }
        }
      }
      pos += 20;
    }
  }
});

