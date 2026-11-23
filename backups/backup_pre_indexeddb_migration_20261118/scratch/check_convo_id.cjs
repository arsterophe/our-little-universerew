const fs = require('fs');
const fb = fs.readFileSync('firebase.js', 'utf8');

const lines = fb.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('conversationId') || l.includes('convId') || l.includes('getConversationId')) {
    console.log(`Line ${idx+1}: ${l.trim().slice(0, 100)}`);
  }
});
