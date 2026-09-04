const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');

const idx = 60422;
console.log(content.slice(Math.max(0, idx - 1000), idx));
