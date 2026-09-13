import fs from 'node:fs';
import path from 'node:path';

let hit = false;

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git') {
        scan(full);
      }
    } else if (/\.(ts|js|astro|md|css|json)$/.test(entry.name)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        // Skip code comments and scanner internals
        if (
          trimmed.startsWith('//') ||
          trimmed.startsWith('/*') ||
          trimmed.startsWith('*') ||
          full.includes('todo.')
        ) {
          return;
        }
        if (line.includes('TODO —') || line.includes('TODO:')) {
          console.log(`Placeholder found in ${full}:${idx + 1} -> ${trimmed}`);
          hit = true;
        }
      });
    }
  }
}

for (const target of ['./src/data', './src/content', './src/pages']) {
  if (fs.existsSync(target)) {
    scan(target);
  }
}

if (!hit) {
  console.log('No placeholders left in content, data or pages.');
}
