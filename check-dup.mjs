import fs from 'fs';
const c = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
const lines = c.split('\n');
console.log('total', lines.length);
const counts = {};
for (const l of lines) {
  const m = l.match(/function (Dashboard|KPICard|EmptyState|AlertCard|MetricGroup|StatCard|ProgressBar|render\w+Tab|renderTabContent)/);
  if (m) counts[m[1]] = (counts[m[1]] || 0) + 1;
}
console.log(counts);
