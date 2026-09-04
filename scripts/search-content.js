const fs = require('fs');
const content = fs.readFileSync('C:/Users/DELL/.gemini/antigravity-ide/brain/fee46ca7-1d63-4776-97f3-b2c970f6994c/.system_generated/steps/592/content.md', 'utf8');

const keywords = ['configPart', 'epcfg', 'cfg', 'RAM', 'Hard Disk', 'Processor', 'System Configuration', 'Intel Core'];
keywords.forEach(kw => {
  let count = 0;
  let pos = 0;
  while ((pos = content.indexOf(kw, pos)) !== -1) {
    count++;
    if (count <= 3) {
      console.log(`[${kw}] at ${pos}:`, content.slice(Math.max(0, pos - 80), Math.min(content.length, pos + 120)));
    }
    pos += kw.length;
  }
  console.log(`Total '${kw}':`, count);
});
