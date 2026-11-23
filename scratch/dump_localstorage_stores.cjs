const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/Local Storage/leveldb';
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (f.endsWith('.ldb') || f.endsWith('.log')) {
    const full = path.join(dir, f);
    const buf = fs.readFileSync(full);
    const str = buf.toString('latin1');
    
    // Look for olu_stories_store_v2_
    let p = 0;
    while ((p = str.indexOf('olu_stories_store_v2_', p)) !== -1) {
      console.log(`\n=== Found olu_stories_store_v2_ in ${f} at ${p} ===`);
      console.log(str.slice(p, p + 100).replace(/[\x00-\x1f]/g, ' '));
      // Let's see JSON after this
      const jsonStart = str.indexOf('[', p);
      if (jsonStart !== -1 && jsonStart - p < 100) {
        // Find matching close bracket or print chunk
        console.log(str.slice(jsonStart, jsonStart + 2000).replace(/[\x00-\x1f]/g, ' '));
      }
      p += 21;
    }

    // Also look for olu_stories_store_v1
    let p1 = 0;
    while ((p1 = str.indexOf('olu_stories_store_v1', p1)) !== -1) {
      console.log(`\n=== Found olu_stories_store_v1 in ${f} at ${p1} ===`);
      console.log(str.slice(p1, p1 + 100).replace(/[\x00-\x1f]/g, ' '));
      const jsonStart = str.indexOf('[', p1);
      if (jsonStart !== -1 && jsonStart - p1 < 100) {
        console.log(str.slice(jsonStart, jsonStart + 2000).replace(/[\x00-\x1f]/g, ' '));
      }
      p1 += 20;
    }
  }
});

