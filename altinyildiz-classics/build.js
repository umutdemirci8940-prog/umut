#!/usr/bin/env node
'use strict';
/**
 * src/template.html + src/data.js + assets/banner/ → dist/970x250/index.html (tek dosya, görseller base64 gömülü)
 * ve reklam ağına yüklemeye hazır dist/altinyildiz-classics-970x250.zip
 * Kullanım: node build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = __dirname;
const data = require('./src/data');
const dir = path.join(root, 'assets', 'banner');
const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg' };
const uri = (f) => `data:${MIME[path.extname(f).slice(1)]};base64,${fs.readFileSync(path.join(dir, f)).toString('base64')}`;

const img = {};
for (const f of fs.readdirSync(dir)) if (/\.(webp|jpg)$/.test(f)) img[f.replace(/\.\w+$/, '')] = uri(f);
const need = data.occasions.flatMap((o) => ['scene-' + o.key, ...o.products.map((p) => p.img)]);
const missing = need.filter((k) => !img[k]);
if (missing.length) { console.error('Eksik görsel:', missing.join(', '), '→ python3 tools/prepare-images.py'); process.exit(1); }
const logoFile = fs.existsSync(path.join(dir, 'logo.png')) ? 'logo.png' : null;
if (!logoFile) { console.error('assets/banner/logo.png yok (siteden çekilen logo). → python3 tools/prepare-images.py'); process.exit(1); }
const used = Object.fromEntries(need.map((k) => [k, img[k]]));

const html = fs.readFileSync(path.join(root, 'src', 'template.html'), 'utf8')
  .split('%%LOGO%%').join(uri(logoFile))
  .replace('/*DATA*/null', JSON.stringify(data).replace(/</g, '\\u003c'))
  .replace('/*IMG*/null', JSON.stringify(used));

const out = path.join(root, 'dist', '970x250');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'index.html'), html);
const kb = Buffer.byteLength(html) / 1024;
const zip = path.join(root, 'dist', 'altinyildiz-classics-970x250.zip');
fs.rmSync(zip, { force: true });
try { execSync(`zip -q -j -9 "${zip}" "${path.join(out, 'index.html')}"`); } catch { console.log('zip bulunamadı, paket atlandı'); }
const zkb = fs.existsSync(zip) ? fs.statSync(zip).size / 1024 : 0;
console.log(`✔ dist/970x250/index.html  ${kb.toFixed(1)} KB  (zip ${zkb.toFixed(1)} KB)${zkb > 150 ? '  ⚠ 150 KB üstü' : ''}`);
