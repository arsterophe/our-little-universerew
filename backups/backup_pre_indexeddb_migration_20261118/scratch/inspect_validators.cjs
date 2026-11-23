const fs = require('fs');

const rules = fs.readFileSync('firestore.rules', 'utf8');

const functions = [
  'isValidUser',
  'isValidCharacterRole',
  'isValidCharacterUniverse',
  'isValidStory',
  'isValidMoment',
  'isValidPhotoboothSession',
  'isValidMessage',
  'isValidConversation',
  'isValidGameRecord',
  'isValidGameSession',
  'isValidUniverseState',
  'isValidStarMessage',
  'isValidLetter',
  'isValidArtwork',
  'isValidArtworkNote'
];

functions.forEach(fn => {
  const start = rules.indexOf(`function ${fn}`);
  if (start !== -1) {
    const end = rules.indexOf('function ', start + 10);
    const code = end !== -1 ? rules.slice(start, end) : rules.slice(start, start + 1000);
    console.log(`\n========================================`);
    console.log(`FUNCTION: ${fn}`);
    console.log(`========================================`);
    console.log(code.trim());
  } else {
    console.log(`\n[!] NOT FOUND: ${fn}`);
  }
});
