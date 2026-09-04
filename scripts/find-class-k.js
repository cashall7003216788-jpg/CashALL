const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');

// Find definition of k
const idx = 61422;
console.log(content.slice(Math.max(0, idx - 1000), idx));
