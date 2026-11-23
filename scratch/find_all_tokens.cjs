const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/IndexedDB/http_localhost_5173.indexeddb.leveldb';
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (f.endsWith('.ldb') || f.endsWith('.log')) {
    const full = path.join(dir, f);
    const buf = fs.readFileSync(full);
    const str = buf.toString('latin1');
    
    // Look for all refresh tokens
    let p = 0;
    while ((p = str.indexOf('refreshToken', p)) !== -1) {
      const chunk = str.slice(Math.max(0, p - 300), p + 400).replace(/[\x00-\x1f]/g, ' ');
      console.log(`\n=== Refresh Token in ${f} at ${p} ===`);
      console.log(chunk);
      p += 15;
    }
  }
});

