import fs from 'fs';

const path = 'src/pages/Dashboard.tsx';

const append = (text) => {
  fs.appendFileSync(path, text);
};

append('  );\n');
append('}\n');

console.log('Dashboard.tsx completed');
