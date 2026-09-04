const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');
const matches = content.match(/https:\/\/[a-zA-Z0-9.\-_]+/g) || [];
console.log('All domains in chunk:', [...new Set(matches)]);
