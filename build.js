#!/usr/bin/env node
'use strict';
/**
 * Üç boyutu src/data.js + src/template.js'ten üretir:
 *   dist/300x250/index.html, dist/300x600/index.html, dist/970x250/index.html
 * ve reklam ağlarına yüklemeye hazır zip paketleri: dist/zip/ilacsizyasam-<boyut>.zip
 *
 * Kullanım: node build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('./src/data');
const { render, SIZES } = require('./src/template');

const root = __dirname;
const dist = path.join(root, 'dist');
const zipDir = path.join(dist, 'zip');
fs.mkdirSync(zipDir, { recursive: true });

let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }

for (const key of Object.keys(SIZES)) {
  const out = path.join(dist, key);
  fs.mkdirSync(out, { recursive: true });
  const html = render(key, data);
  fs.writeFileSync(path.join(out, 'index.html'), html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  let zipNote = '';
  if (hasZip) {
    const zipPath = path.join(zipDir, `ilacsizyasam-${key}.zip`);
    fs.rmSync(zipPath, { force: true });
    execSync(`zip -q -j "${zipPath}" "${path.join(out, 'index.html')}"`);
    zipNote = ` → ${path.relative(root, zipPath)}`;
  }
  console.log(`✔ ${key.padEnd(8)} ${SIZES[key].label.padEnd(17)} ${kb.padStart(5)} KB${zipNote}`);
}
if (!hasZip) console.log('ℹ `zip` bulunamadı; zip paketleri atlandı.');
