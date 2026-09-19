#!/usr/bin/env node
'use strict';
/** Google Fonts'tan Anton (başlık) ve Inter (metin) woff2 dosyalarını latin + latin-ext alt kümeleriyle indirir → src/kfc/fonts/ */
const fs = require('fs'); const path = require('path'); const { execSync } = require('child_process');
const dir = path.join(__dirname, '..', 'src', 'kfc', 'fonts'); fs.mkdirSync(dir, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@500;600;800&display=block';
const css = execSync(`curl -sS -A "${UA}" "${url}"`).toString();
const list = [];
for (const m of css.matchAll(/\/\*\s*([a-z-]+)\s*\*\/\s*@font-face\s*{([^}]*)}/g)) {
  const subset = m[1]; const b = m[2];
  if (subset !== 'latin' && subset !== 'latin-ext') continue;
  const family = b.match(/font-family:\s*'([^']+)'/)[1]; const weight = +b.match(/font-weight:\s*(\d+)/)[1]; const style = (b.match(/font-style:\s*(\w+)/) || [])[1] || 'normal';
  const src = b.match(/url\(([^)]+)\)/)[1]; const range = (b.match(/unicode-range:\s*([^;]+)/) || [])[1];
  const file = `${family.toLowerCase()}-${weight}-${subset}.woff2`;
  execSync(`curl -sS -o "${path.join(dir, file)}" "${src}"`);
  list.push({ family, weight, style, subset, unicodeRange: range, file, bytes: fs.statSync(path.join(dir, file)).size });
}
fs.writeFileSync(path.join(dir, 'fonts.json'), JSON.stringify(list, null, 1));
console.log(list.map((f) => `${f.family} ${f.weight} ${f.subset} ${(f.bytes / 1024).toFixed(0)} KB`).join('\n'));
