const fs = require('fs');
const mv = fs.readFileSync('messages_view.js', 'utf8');

const lines = mv.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('CONVERSATION') || l.includes('convId') || l.includes('conversationId') || l.includes('activeConv')) {
    console.log(`Line ${idx+1}: ${l.trim().slice(0, 100)}`);
  }
});
