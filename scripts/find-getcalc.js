const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('getCalculator', pos)) !== -1) {
  console.log('--- getCalculator at', pos, '---');
  console.log(content.slice(Math.max(0, pos - 150), Math.min(content.length, pos + 300)));
  pos += 14;
}
