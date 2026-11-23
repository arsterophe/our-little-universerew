import readline from 'readline';
import fs from 'fs';

const rl = readline.createInterface({
  input: fs.createReadStream('C:/Users/ALENDA/.gemini/antigravity/brain/9032e95e-6264-445e-8703-2e60383b3a62/.system_generated/logs/transcript.jsonl')
});

rl.on('line', (line) => {
  if (line.includes('"step_index":12756') || line.includes('"step_index": 12756')) {
    const o = JSON.parse(line);
    console.log(o.content.slice(0, 1500));
    process.exit(0);
  }
});
