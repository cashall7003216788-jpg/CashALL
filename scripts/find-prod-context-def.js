const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');

const matches = content.match(/async getProductContext\([^)]*\)\{[^}]+\}/g);
console.log('Definition:', matches);
