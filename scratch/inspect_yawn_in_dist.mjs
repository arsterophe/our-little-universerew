import fs from 'fs';

const dist = fs.readFileSync('dist/index.html', 'utf8');
const azurePalaceIdx = dist.indexOf('id="view-azure-palace"');
const snippet = dist.substring(azurePalaceIdx - 400, azurePalaceIdx);
console.log('Snippet before azure-palace:');
console.log(snippet);
