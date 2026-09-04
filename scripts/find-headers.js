const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');
const match = content.match(/addCommonHeaders/g);
console.log('addCommonHeaders occurrences:', match ? match.length : 0);
// Find definition or usage
let pos = 0;
while ((pos = content.indexOf('addCommonHeaders', pos)) !== -1) {
  console.log('--- at pos', pos, '---');
  console.log(content.slice(Math.max(0, pos - 150), Math.min(content.length, pos + 250)));
  pos += 16;
}
