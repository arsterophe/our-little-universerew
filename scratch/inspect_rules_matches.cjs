const fs = require('fs');

const rules = fs.readFileSync('firestore.rules', 'utf8');
const lines = rules.split('\n');

const matchIndices = [];
lines.forEach((l, idx) => {
  if (l.trim().startsWith('match /') && !l.includes('{database}')) {
    matchIndices.push({ line: idx + 1, text: l.trim() });
  }
});

for (let i = 0; i < matchIndices.length; i++) {
  const current = matchIndices[i];
  const next = matchIndices[i + 1];
  const endLine = next ? next.line - 1 : lines.length;
  console.log(`\n======================================================`);
  console.log(`BLOCK: ${current.text} (Lines ${current.line} - ${endLine})`);
  console.log(`======================================================`);
  console.log(lines.slice(current.line - 1, endLine).join('\n'));
}
