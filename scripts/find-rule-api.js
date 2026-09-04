const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');
const idx = content.indexOf('calculator/rules');
if (idx !== -1) {
  console.log(content.slice(Math.max(0, idx - 400), Math.min(content.length, idx + 400)));
}
