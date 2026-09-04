const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');

// Where is L assigned?
const match = content.match(/([a-zA-Z0-9_$]+)=r\(([0-9]+)\)/g);
// Search for E = or function that takes url and options
const matches = content.match(/function\s+[a-zA-Z0-9_$]+\s*\([a-zA-Z0-9_$,\s]*\)\s*\{[^}]*serviceGroup[^}]*\}/g);
console.log('Matches:', matches);

// Search where "api" or backend url is configured
const apiMatches = content.match(/https:\/\/[^"'\s`]+/g);
console.log('All http urls in chunk:', [...new Set(apiMatches)]);
