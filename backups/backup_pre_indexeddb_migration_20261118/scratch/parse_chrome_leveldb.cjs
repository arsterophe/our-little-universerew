const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/Local Storage/leveldb';
const files = fs.readdirSync(dir);

function searchInLevelDB() {
  files.forEach(f => {
    if (f.endsWith('.ldb') || f.endsWith('.log')) {
      const fullPath = path.join(dir, f);
      const buf = fs.readFileSync(fullPath);
      const str = buf.toString('latin1');

      // Look for olu_stories
      let pos = 0;
      while ((pos = str.indexOf('olu_stories', pos)) !== -1) {
        const keySnippet = str.slice(pos, pos + 80);
        // Find JSON nearby
        const jsonStart = str.indexOf('[', pos);
        if (jsonStart !== -1 && jsonStart - pos < 150) {
          // let's grab up to next ']' or reasonable chunk
          const chunk = str.slice(jsonStart, jsonStart + 8000);
          console.log(`\n=== Found key around ${f} (pos ${pos}): ${keySnippet.replace(/[\x00-\x1f]/g, ' ')} ===`);
          console.log(chunk.slice(0, 1500).replace(/[\x00-\x1f]/g, ' '));
        }
        pos += 11;
      }
    }
  });
}

searchInLevelDB();

