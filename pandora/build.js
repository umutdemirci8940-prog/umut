#!/usr/bin/env node
'use strict';
/**
 * Pandora Moments 970×250 masthead derleyicisi.
 *   dist/970x250/index.html              – reklam ağına yüklenecek tek dosya (görseller/logo/font gömülü)
 *   dist/zip/pandora-moments-970x250.zip – aynı dosya zip içinde
 *   release/Pandora2027.html             – teslim kopyası
 *
 * Kullanım: node build.js [--no-embed-fonts] [--vector] [--no-hero]
 *  - assets/opt.json varsa (tools/optimize-assets.js üretir) gerçek packshot/charm/logo/hero kullanılır.
 *  - Yoksa (veya --vector) vektör yer tutucularla derler.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('./src/data');
const { render, SIZE } = require('./src/template');

const root = __dirname;
const args = new Set(process.argv.slice(2));
const out = path.join(root, 'dist', '970x250');
const zipDir = path.join(root, 'dist', 'zip');
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(zipDir, { recursive: true }); fs.mkdirSync(path.join(root, 'release'), { recursive: true });

const MIME = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', woff2: 'font/woff2' };
const ext = (f) => path.extname(f).slice(1).toLowerCase();
function dataUri(file) {
  const buf = fs.readFileSync(file); const e = ext(file);
  if (e === 'svg') {
    const svg = buf.toString('utf8').replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    return { uri: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg).replace(/%20/g, ' ').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%22/g, "'"), bytes: buf.length, svg };
  }
  return { uri: `data:${MIME[e] || 'application/octet-stream'};base64,${buf.toString('base64')}`, bytes: buf.length };
}

const assets = { bracelets: {}, charms: {}, overrides: { bracelets: {}, charms: {} } };
const optPath = path.join(root, 'assets', 'opt.json');
let mode = 'VEKTÖR (assets/opt.json yok)';
if (!args.has('--vector') && fs.existsSync(optPath)) {
  const opt = JSON.parse(fs.readFileSync(optPath, 'utf8'));
  const load = (rel) => { const f = rel && path.join(root, rel); return f && fs.existsSync(f) ? dataUri(f) : null; };
  for (const [k, v] of Object.entries(opt.bracelets || {})) { const a = load(v.file); if (a) assets.bracelets[k] = a; if (v.title || v.price) assets.overrides.bracelets[k] = { title: v.title, price: v.price }; }
  for (const [k, v] of Object.entries(opt.charms || {})) { const a = load(v.file); if (a) assets.charms[k] = a; if (v.title || v.price) assets.overrides.charms[k] = { title: v.title, price: v.price }; }
  if (opt.logo && opt.logo.file) { const a = load(opt.logo.file); if (a) assets.logo = Object.assign(a, { aspect: opt.logo.aspect, svg: opt.logo.inline ? a.svg : undefined }); }
  if (opt.hero && opt.hero.file && !args.has('--no-hero')) { const a = load(opt.hero.file); if (a) { assets.hero = a; assets.heroPos = opt.hero.pos; } }
  mode = `FOTOĞRAF (${Object.keys(assets.bracelets).length} bileklik, ${Object.keys(assets.charms).length} charm${assets.logo ? ', logo' : ''}${assets.hero ? ', hero' : ''})`;
}
// Fontlar: assets/fonts/inter-subset.css varsa gömülür (tools/subset-fonts.sh üretir)
const fontCssFile = path.join(root, 'assets', 'fonts', 'inter-subset.css');
if (!args.has('--no-embed-fonts') && fs.existsSync(fontCssFile)) assets.fontCss = fs.readFileSync(fontCssFile, 'utf8');

const html = render(data, assets);
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.writeFileSync(path.join(root, 'release', 'Pandora2027.html'), html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
let zipNote = '';
try { execSync('zip -v', { stdio: 'ignore' }); const z = path.join(zipDir, 'pandora-moments-970x250.zip'); fs.rmSync(z, { force: true }); execSync(`zip -q -j "${z}" "${path.join(out, 'index.html')}"`); zipNote = ` → ${path.relative(root, z)}`; } catch { zipNote = ' (zip yok)'; }
console.log(`Görsel modu: ${mode}${assets.fontCss ? ' · Inter gömülü' : ' · Google Fonts bağlantısı'}`);
console.log(`✔ 970x250 ${SIZE.label}  ${kb} KB  → dist/970x250/index.html, release/Pandora2027.html${zipNote}`);
