const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/IndexedDB/http_localhost_5173.indexeddb.leveldb';
const files = fs.readdirSync(dir);

console.log('Files in http_localhost_5173.indexeddb.leveldb:', files);

files.forEach(f => {
  if (f.endsWith('.ldb') || f.endsWith('.log')) {
    const full = path.join(dir, f);
    const buf = fs.readFileSync(full);
    const str = buf.toString('latin1');
    
    // Look for Firebase Auth tokens
    let p = 0;
    while ((p = str.indexOf('stsTokenManager', p)) !== -1) {
      console.log(`\n--- stsTokenManager in ${f} at ${p} ---`);
      console.log(str.slice(Math.max(0, p - 50), p + 300).replace(/[\x00-\x1f]/g, ' '));
      p += 15;
    }

    // Look for story titles or IDs
    ['story-lele', '1ArxphLQpAOoOIvH9BKYw0ebD1e2', 'swBN9XodDWRuHE5YbYmeoytrcAx2', 'Kebetulan', 'Seandainya'].forEach(k => {
      let kp = 0;
      while ((kp = str.indexOf(k, kp)) !== -1) {
        console.log(`\n--- ${k} in ${f} at ${kp} ---`);
        console.log(str.slice(Math.max(0, kp - 40), kp + 400).replace(/[\x00-\x1f]/g, ' '));
        kp += k.length + 10;
      }
    });
  }
});

