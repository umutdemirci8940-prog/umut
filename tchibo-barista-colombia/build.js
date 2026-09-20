#!/usr/bin/env node
'use strict';
/**
 * Tchibo Barista Colombia – 970x250 masthead derleyici.
 * src/masthead.html içindeki {{asset:ad}} yer tutucularını assets/ altındaki
 * raster görsellerin base64 data URI'leriyle değiştirir ve tek dosyalık
 * dist/970x250/index.html + dist/tchibo-barista-colombia-970x250.zip üretir.
 *
 * Kullanım: node build.js          (görseller yoksa önce: python3 tools/render-assets.py)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const src = path.join(root, 'src', 'masthead.html');
const manifestPath = path.join(root, 'assets', 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('assets/manifest.json yok. Önce görselleri üretin: python3 tools/render-assets.py');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

let html = fs.readFileSync(src, 'utf8');
const used = new Set();
html = html.replace(/\{\{asset:([a-z0-9_-]+)\}\}/gi, (_, name) => {
  const m = manifest[name];
  if (!m) throw new Error(`manifest'te yok: ${name}`);
  const file = path.join(root, m.file);
  const ext = path.extname(file).slice(1).toLowerCase();
  used.add(name);
  return `data:${MIME[ext] || 'application/octet-stream'};base64,${fs.readFileSync(file).toString('base64')}`;
});
const missing = Object.keys(manifest).filter((k) => !used.has(k));
if (missing.length) console.log('ℹ Kullanılmayan görseller:', missing.join(', '));

const outDir = path.join(root, 'dist', '970x250');
fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'index.html');
fs.writeFileSync(outFile, html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
console.log(`✔ dist/970x250/index.html  ${kb} KB (tek dosya, tüm görseller gömülü)`);

let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }
if (hasZip) {
  const zipPath = path.join(root, 'dist', 'tchibo-barista-colombia-970x250.zip');
  fs.rmSync(zipPath, { force: true });
  execSync(`zip -q -j "${zipPath}" "${outFile}"`);
  console.log(`✔ ${path.relative(root, zipPath)}  ${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB`);
} else console.log('ℹ `zip` bulunamadı; zip paketi atlandı.');
