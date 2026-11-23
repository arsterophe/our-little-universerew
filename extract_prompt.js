import fs from 'fs';
import readline from 'readline';

async function extractPrompt() {
  const fileStream = fs.createReadStream('C:/Users/ALENDA/.gemini/antigravity/brain/9032e95e-6264-445e-8703-2e60383b3a62/.system_generated/logs/transcript_full.jsonl');
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    if (line.includes('"step_index":25277') || line.includes('PENGEMBANGAN THE FAIRY ATELIER')) {
      try {
        const obj = JSON.parse(line);
        if (obj.content && obj.content.includes('PENGEMBANGAN THE FAIRY ATELIER')) {
          fs.writeFileSync('fairy_atelier_user_prompt.txt', obj.content, 'utf8');
          console.log('Successfully saved fairy_atelier_user_prompt.txt, length:', obj.content.length);
          return;
        }
      } catch (e) {
        // ignore
      }
    }
  }
}

extractPrompt();
