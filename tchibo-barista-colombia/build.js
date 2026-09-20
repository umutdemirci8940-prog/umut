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
const TARGETS = [
  { src: 'src/masthead.html', out: 'dist/970x250', zip: 'tchibo-barista-colombia-970x250.zip', label: '3 perdelik sinematik' },
  { src: 'src/masthead-kv.html', out: 'dist/970x250-kampanya', zip: 'tchibo-barista-colombia-970x250-kampanya.zip', label: 'kampanya KV (gerçek paketler)' },
];
const only = process.argv.find((a) => a.startsWith('--only='));
const manifestPath = path.join(root, 'assets', 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.error('assets/manifest.json yok. Önce görselleri üretin: python3 tools/render-assets.py');
  process.exit(1);
}
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const readJson = (rel) => (fs.existsSync(path.join(root, rel)) ? JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8')) : {});
const kvMan = readJson('assets/kv/manifest.json');
const packMan = readJson('assets/packs/manifest.json');
const products = (readJson('assets/products/products.json').products || []);
const dataUri = (rel) => { const f = path.join(root, rel); const ext = path.extname(f).slice(1).toLowerCase(); return `data:${MIME[ext] || 'application/octet-stream'};base64,${fs.readFileSync(f).toString('base64')}`; };
function productUrl(slug) { const p = products.find((x) => x.url && x.url.indexOf('/' + slug) >= 0); return p ? p.url + '?utm_source=display&utm_medium=masthead&utm_campaign=barista-colombia' : ''; }
const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg' };

let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }

// Marka logosu: assets/logo-light.png (tools/fetch-logo.js + tools/render-logo.js ile üretilir) varsa <img>, yoksa tipografik yer tutucu
const logoFile = path.join(root, 'assets', 'logo-light.png');
const logoMeta = readJson('assets/logo.json');
let logoHtml = '<span class="wordmark">TCHIBO</span>';
if (fs.existsSync(logoFile)) {
  const r = (logoMeta.render && logoMeta.render.light) || { w: 0, h: 104 };
  const h = 30, w = r.w && r.h ? Math.round(r.w / r.h * h) : 0;
  logoHtml = `<img class="logo" src="${dataUri('assets/logo-light.png')}" alt="Tchibo" height="${h}"${w ? ` width="${w}"` : ''}>`;
  console.log(`ℹ Logo: assets/logo-light.png (${w}x${h} px)${logoMeta.source ? ' ← ' + logoMeta.source : ''}`);
} else console.log('ℹ Logo dosyası yok (assets/logo-light.png); tipografik yer tutucu kullanıldı. Üretmek için: node tools/fetch-logo.js && node tools/render-logo.js');

for (const tgt of TARGETS) {
  if (only && !tgt.out.endsWith(only.split('=')[1])) continue;
  const srcFile = path.join(root, tgt.src);
  if (!fs.existsSync(srcFile)) { console.log('ℹ Kaynak yok, atlandı:', tgt.src); continue; }
  let html = fs.readFileSync(srcFile, 'utf8');
  const used = new Set();
  html = html.replace(/\{\{asset:([a-z0-9_-]+)\}\}/gi, (_, name) => { const m = manifest[name]; if (!m) throw new Error(`manifest'te yok: ${name}`); used.add(name); return dataUri(m.file); });
  html = html.replace(/\{\{kv:([a-z0-9_-]+)\}\}/gi, (_, name) => { const m = kvMan[name]; if (!m) throw new Error(`kv manifest'te yok: ${name} (python3 tools/render-kv.py)`); return dataUri(m.file); });
  html = html.replace(/\{\{pack:([a-z0-9_-]+)\}\}/gi, (_, name) => { const m = packMan[name]; if (!m) throw new Error(`paket yok: ${name} (python3 tools/cutout.py)`); return dataUri(m.file); });
  html = html.replace(/\{\{url:([a-z0-9_-]+)\}\}/gi, (_, slug) => productUrl(slug));
  if (html.includes('{{photo}}')) {
    const photo = path.join(root, 'assets', 'packs', 'photo.jpg');
    if (!fs.existsSync(photo)) throw new Error('assets/packs/photo.jpg yok (python3 tools/cutout.py)');
    html = html.replace('{{photo}}', dataUri('assets/packs/photo.jpg'));
  }
  html = html.replace('{{logo}}', logoHtml);
  if (tgt.src === 'src/masthead.html') { const missing = Object.keys(manifest).filter((k) => !used.has(k)); if (missing.length) console.log('ℹ Kullanılmayan görseller:', missing.join(', ')); }
  const outDir = path.join(root, tgt.out);
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'index.html');
  fs.writeFileSync(outFile, html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  console.log(`✔ ${tgt.out}/index.html  ${kb} KB (${tgt.label}; tek dosya, tüm görseller gömülü)`);
  if (hasZip) {
    const zipPath = path.join(root, 'dist', tgt.zip);
    fs.rmSync(zipPath, { force: true });
    execSync(`zip -q -j "${zipPath}" "${outFile}"`);
    console.log(`✔ dist/${tgt.zip}  ${(fs.statSync(zipPath).size / 1024).toFixed(1)} KB`);
  }
}
if (!hasZip) console.log('ℹ `zip` bulunamadı; zip paketleri atlandı.');
