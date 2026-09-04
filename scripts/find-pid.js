const fs = require('fs');
const content = fs.readFileSync('C:/Users/DELL/.gemini/antigravity-ide/brain/fee46ca7-1d63-4776-97f3-b2c970f6994c/.system_generated/steps/592/content.md', 'utf8');

const pids = ['21235', 'IdeaPad', '8eab44d2'];
pids.forEach(p => {
  let pos = 0;
  while ((pos = content.indexOf(p, pos)) !== -1) {
    console.log(`[${p}] at ${pos}:`, content.slice(Math.max(0, pos - 100), Math.min(content.length, pos + 200)));
    pos += p.length;
  }
});
