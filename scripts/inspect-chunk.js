const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');
const matches = content.match(/https?:\/\/[^\s"'`]+/g) || [];
console.log('URLs:', [...new Set(matches)]);
const endpoints = content.match(/"\/[a-zA-Z0-9_\-\/]+"/g) || [];
console.log('Endpoints sample:', [...new Set(endpoints)].slice(0, 30));
