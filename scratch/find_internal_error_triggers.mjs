import fs from 'fs';

const c = fs.readFileSync('node_modules/@firebase/auth/dist/esm/index-LY22yodV.js', 'utf8');
const lines = c.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('"internal-error"') && !l.includes('ServerError')) {
    console.log((idx+1) + ':', l.trim().slice(0, 140));
  }
});
