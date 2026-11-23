const fs = require('fs');

const f = 'C:/Users/ALENDA/AppData/Local/Google/Chrome/User Data/Profile 3/Local Storage/leveldb/003535.ldb';
const buf = fs.readFileSync(f);

// In LevelDB, string values might be UTF-16LE or ASCII/latin1
// Let's inspect the bytes around offset 8400 to 18000
const slice = buf.slice(8400, 25000);

// Look for "[{" or "[ {" in utf16 or latin1
let text = '';
for (let i = 0; i < slice.length; i++) {
  const code = slice[i];
  if (code >= 32 && code <= 126) {
    text += String.fromCharCode(code);
  } else if (code === 10 || code === 13) {
    text += '\n';
  } else {
    text += ' ';
  }
}

console.log('Cleaned text sample:');
console.log(text.slice(0, 3000));

