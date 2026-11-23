const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/Local Storage/leveldb';
const files = fs.readdirSync(dir);

files.forEach(f => {
  if (f.endsWith('.ldb') || f.endsWith('.log')) {
    const full = path.join(dir, f);
    const buf = fs.readFileSync(full);
    
    // Convert buffer to both latin1 and utf16le
    const latin = buf.toString('latin1');
    const u16 = buf.toString('utf16le');

    const searchTerms = ['1ArxphLQpAOoOIvH9BKYw0ebD1e2', 'olu_stories', 'Kebetulan', 'Seandainya'];
    
    searchTerms.forEach(t => {
      let idx = 0;
      while ((idx = latin.indexOf(t, idx)) !== -1) {
        console.log(`[latin1] ${f} found "${t}" at ${idx}`);
        console.log(latin.slice(Math.max(0, idx - 40), idx + 200).replace(/[\x00-\x1f]/g, ' '));
        idx += t.length + 5;
      }
      let uidx = 0;
      while ((uidx = u16.indexOf(t, uidx)) !== -1) {
        console.log(`[utf16] ${f} found "${t}" at ${uidx}`);
        console.log(u16.slice(Math.max(0, uidx - 40), uidx + 200).replace(/[\x00-\x1f]/g, ' '));
        uidx += t.length + 5;
      }
    });
  }
});

