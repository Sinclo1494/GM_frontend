import fs from 'fs';

const path = 'src/pages/Dashboard.tsx';

function appendContent(text) {
  fs.appendFileSync(path, text);
}

appendContent('function MetricGroup({\n');
appendContent('  title,\n');
appendContent('  items,\n');
appendContent('}: {\n');
appendContent('  title: string;\n');
appendContent('  items: { label: string; value: number }[];\n');
appendContent('}) {\n');
appendContent('  return (\n');
appendContent('    <div className="rounded-lg border border-slate-200 p-3">\n');
appendContent('      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">{title}</p>\n');
appendContent('      <div className="space-y-1">\n');
appendContent('        {items.map((item) => (\n');
appendContent('          <div key={item.label} className="flex justify-between text-sm">\n');
appendContent('            <span className="text-gray-600">{item.label}</span>\n');
appendContent('            <span className="font-medium text-gray-800">{item.value.toLocaleString("fr-FR")}</span>\n');
appendContent('          </div>\n');
appendContent('        ))}\n');
appendContent('      </div>\n');
appendContent('    </div>\n');
appendContent('  );\n');
appendContent('}\n');

console.log('Part 2 written');
