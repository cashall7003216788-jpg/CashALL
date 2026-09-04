const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');
const match = content.match(/function\s+[a-zA-Z0-9_$]+\s*\(.*?\)\s*\{[^}]*serviceGroup/g);
console.log('Matches:', match);
const idx = content.indexOf('serviceGroup:');
if (idx !== -1) {
  console.log(content.slice(Math.max(0, idx - 200), Math.min(content.length, idx + 200)));
}
// Also search where L is defined
const lDef = content.match(/[a-zA-Z0-9_$]+=r\([0-9]+\)/g);
console.log('Imports:', lDef ? lDef.slice(0, 20) : null);
