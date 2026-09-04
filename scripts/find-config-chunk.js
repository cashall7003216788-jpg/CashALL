const fs = require('fs');
const content = fs.readFileSync('cashify_calculator_chunk.js', 'utf8');

// Find configPart or epcfg or r(8913)
let pos = 0;
while ((pos = content.indexOf('configPart', pos)) !== -1) {
  console.log('--- configPart at', pos, '---');
  console.log(content.slice(Math.max(0, pos - 150), Math.min(content.length, pos + 300)));
  pos += 10;
}

// Find dropdown or select components or "System Configuration"
while ((pos = content.indexOf('System Configuration', pos)) !== -1) {
  console.log('--- System Configuration at', pos, '---');
  console.log(content.slice(Math.max(0, pos - 150), Math.min(content.length, pos + 300)));
  pos += 20;
}
