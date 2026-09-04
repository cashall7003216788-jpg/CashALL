const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('getProductContext', pos)) !== -1) {
  console.log('--- getProductContext at', pos, '---');
  console.log(content.slice(Math.max(0, pos - 100), Math.min(content.length, pos + 300)));
  pos += 18;
}
