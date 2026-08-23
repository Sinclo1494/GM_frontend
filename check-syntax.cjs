const fs = require('fs');
const c = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
console.log('braces', (c.match(/{/g) || []).length, (c.match(/}/g) || []).length);
console.log('parens', (c.match(/\(/g) || []).length, (c.match(/\)/g) || []).length);
console.log('square', (c.match(/\[/g) || []).length, (c.match(/\]/g) || []).length);
