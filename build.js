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
const useVector = process.argv.includes('--vector');
const GOOGLE_ADS_LIMIT_KB = 150;

/** PNG / JPEG / WebP / SVG için piksel boyutlarını okur (ek paket gerektirmez). */
function imageSize(buf, ext) {
  try {
    if (ext === 'png' && buf.readUInt32BE(12) === 0x49484452) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (ext === 'jpg') {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xFF) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
        if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) { i += 2; continue; }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (ext === 'webp' && buf.toString('ascii', 0, 4) === 'RIFF') {
      const t = buf.toString('ascii', 12, 16);
      if (t === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (t === 'VP8L') { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3FFF), h: 1 + ((b >> 14) & 0x3FFF) }; }
      if (t === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3FFF, h: buf.readUInt16LE(28) & 0x3FFF };
    }
    if (ext === 'svg') {
      const t = buf.toString('utf8', 0, 4000);
      const vb = t.match(/viewBox="([\d.\s,-]+)"/);
      if (vb) { const v = vb[1].trim().split(/[\s,]+/).map(Number); return { w: v[2], h: v[3] }; }
      const w = t.match(/\bwidth="([\d.]+)/), h = t.match(/\bheight="([\d.]+)/);
      if (w && h) return { w: +w[1], h: +h[1] };
    }
  } catch { /* boyut okunamadı */ }
  return null;
}

/** assets/manifest.json varsa gerçek görselleri (base64 gömülü) yükler; yoksa null (vektör mod). */
function loadAssets() {
  const mf = path.join(root, 'assets', 'manifest.json');
  if (useVector || !fs.existsSync(mf)) return null;
  const m = JSON.parse(fs.readFileSync(mf, 'utf8'));
  const MIME = { svg: 'image/svg+xml', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif' };
  const load = (rel) => {
    const f = rel && path.join(root, rel);
    if (!f || !fs.existsSync(f)) return null;
    const ext = path.extname(f).slice(1).toLowerCase().replace('jpeg', 'jpg');
    const buf = fs.readFileSync(f);
    const dim = imageSize(buf, ext);
    return { uri: `data:${MIME[ext] || 'application/octet-stream'};base64,${buf.toString('base64')}`, bytes: buf.length, aspect: dim && dim.h ? dim.w / dim.h : null, file: rel };
  };
  const out = { logo: null, products: {} };
  if (m.logo) {
    const img = load(m.logo.optimized || m.logo.file);
    if (img) out.logo = Object.assign(img, { invert: !!m.logo.invert, alt: m.logo.alt || '' });
  }
  for (const p of m.products || []) {
    if (!p.image) continue;
    const img = load(p.image.optimized || p.image.file);
    if (!img) continue;
    out.products[p.key] = Object.assign(img, { transparent: !!p.image.transparent, price: p.price, url: p.url, title: p.title });
  }
  return out;
}
const assets = loadAssets();
if (assets) {
  const n = Object.keys(assets.products).length;
  console.log(`Görsel modu: FOTOĞRAF (assets/) – ${n} ürün görseli${assets.logo ? ', logo' : ', logo yok'}. Vektör için: node build.js --vector`);
} else console.log('Görsel modu: VEKTÖR (assets/manifest.json yok). Gerçek görseller için: node tools/fetch-assets.js');

let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }

for (const key of Object.keys(SIZES)) {
  const out = path.join(dist, key);
  fs.mkdirSync(out, { recursive: true });
  const html = render(key, data, assets);
  fs.writeFileSync(path.join(out, 'index.html'), html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  let zipNote = '';
  if (hasZip) {
    const zipPath = path.join(zipDir, `ilacsizyasam-${key}.zip`);
    fs.rmSync(zipPath, { force: true });
    execSync(`zip -q -j "${zipPath}" "${path.join(out, 'index.html')}"`);
    zipNote = ` → ${path.relative(root, zipPath)}`;
  }
  const warn = +kb > GOOGLE_ADS_LIMIT_KB ? `  ⚠ ${GOOGLE_ADS_LIMIT_KB} KB Google Ads sınırının üstünde (tools/optimize-assets.js veya --vector)` : '';
  console.log(`✔ ${key.padEnd(8)} ${SIZES[key].label.padEnd(17)} ${kb.padStart(6)} KB${zipNote}${warn}`);
}
if (!hasZip) console.log('ℹ `zip` bulunamadı; zip paketleri atlandı.');
