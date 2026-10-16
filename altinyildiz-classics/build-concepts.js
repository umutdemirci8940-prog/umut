#!/usr/bin/env node
'use strict';
/**
 * concepts/<id>/{template.html,data.js} + assets/concepts/<id>/*.webp → dist/<id>/index.html + dist/altinyildiz-classics-<id>.zip
 * Görseller base64 olarak gömülür; hepsi altinyildizclassics.com'dan alınan raster fotoğraflardır.
 * Kullanım: node build-concepts.js [id ...]
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = __dirname;
const only = process.argv.slice(2);
const b64 = (f, mime) => `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`;
const LOGO = b64(path.join(root, 'assets', 'banner', 'logo.png'), 'image/png');

for (const id of fs.readdirSync(path.join(root, 'concepts')).sort()) {
  const dir = path.join(root, 'concepts', id);
  if (!fs.existsSync(path.join(dir, 'template.html')) || (only.length && !only.includes(id))) continue;
  delete require.cache[require.resolve(path.join(dir, 'data.js'))];
  const data = require(path.join(dir, 'data.js'));
  const imgDir = path.join(root, 'assets', 'concepts', id);
  const IMG = {};
  for (const f of fs.existsSync(imgDir) ? fs.readdirSync(imgDir) : []) if (f.endsWith('.webp')) IMG[f.slice(0, -5)] = b64(path.join(imgDir, f), 'image/webp');
  const html = fs.readFileSync(path.join(dir, 'template.html'), 'utf8')
    .split('%%LOGO%%').join(LOGO)
    .replace('/*DATA*/null', JSON.stringify(data).replace(/</g, '\\u003c'))
    .replace('/*IMG*/null', JSON.stringify(IMG));
  const out = path.join(root, 'dist', id);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  const zip = path.join(root, 'dist', `altinyildiz-classics-${id}.zip`);
  fs.rmSync(zip, { force: true });
  execSync(`zip -q -j -9 "${zip}" "${path.join(out, 'index.html')}"`);
  const zkb = fs.statSync(zip).size / 1024;
  console.log(`✔ ${id.padEnd(22)} ${(Buffer.byteLength(html) / 1024).toFixed(1).padStart(6)} KB  zip ${zkb.toFixed(1)} KB${zkb > 150 ? '  ⚠ 150 KB üstü' : ''}`);
}
