const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');

let pos = 0;
while ((pos = content.indexOf('80589', pos)) !== -1) {
  console.log('--- 80589 at', pos, '---');
  console.log(content.slice(Math.max(0, pos - 100), Math.min(content.length, pos + 200)));
  pos += 5;
}
