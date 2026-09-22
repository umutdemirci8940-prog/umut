#!/usr/bin/env node
'use strict';
/**
 * assets/ altındaki logo ve kart görselini kreatif için hazırlar (Playwright + Chromium):
 *   - kart: en fazla --width (vars. 640 px) genişliğe küçültür, WebP yazar (assets/card.opt.webp)
 *   - logo: raster ise şeffaf boşlukları kırpar, 96 px yüksekliğe indirir, PNG yazar; koyu renkliyse
 *           koyu zeminde beyaza çevrilmek üzere manifest'te işaretler (logo.white = true). SVG olduğu gibi kalır,
 *           renk analizi için yine render edilir.
 *   - fotoğraflar (assets/photos.json): en fazla --photo-width (vars. 1000 px) genişliğe küçültür, WebP yazar
 * Kullanım: NODE_PATH=$(npm root -g) node pluxee/tools/optimize-pluxee-assets.js [--width=640] [--quality=0.82] [--photo-width=1000] [--photo-quality=0.76]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'assets');
const mfPath = path.join(dir, 'manifest.json');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const WIDTH = +args.width || 640, Q = +args.quality || 0.82, PW = +args['photo-width'] || 1000, PQ = +args['photo-quality'] || 0.76;
const MIME = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
const uri = (f) => `data:${MIME[path.extname(f).slice(1).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(f).toString('base64')}`;
const manifest = fs.existsSync(mfPath) ? JSON.parse(fs.readFileSync(mfPath, 'utf8')) : {};
const findFile = (key) => { const e = manifest[key] || {}; const c = [e.file].filter(Boolean).map((f) => path.join(dir, f)); for (const ext of ['svg', 'png', 'webp', 'jpg', 'jpeg']) c.push(path.join(dir, `${key}.${ext}`)); return c.find((p) => fs.existsSync(p)); };

const PROCESS = async ({ src, mode, width, q }) => {
  const img = new Image(); await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('görsel yüklenemedi')); img.src = src; });
  let W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, W, H).data;
  let minX = W, minY = H, maxX = -1, maxY = -1, lum = 0, n = 0;
  for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) { const i = (y * W + xx) * 4; if (d[i + 3] > 20) { if (xx < minX) minX = xx; if (xx > maxX) maxX = xx; if (y < minY) minY = y; if (y > maxY) maxY = y; lum += (d[i] * .299 + d[i + 1] * .587 + d[i + 2] * .114); n++; } }
  const avgLum = n ? lum / n : 255;
  if (mode === 'logo') {
    if (maxX < 0) return { dark: false, skip: true };
    const cw = maxX - minX + 1, ch = maxY - minY + 1, s = Math.min(1, 96 / ch);
    const o = document.createElement('canvas'); o.width = Math.round(cw * s); o.height = Math.round(ch * s); o.getContext('2d').drawImage(c, minX, minY, cw, ch, 0, 0, o.width, o.height);
    return { dark: avgLum < 110, data: o.toDataURL('image/png') };
  }
  const s = Math.min(1, width / W); const o = document.createElement('canvas'); o.width = Math.round(W * s); o.height = Math.round(H * s); o.getContext('2d').drawImage(c, 0, 0, o.width, o.height);
  return { data: o.toDataURL('image/webp', q) };
};

(async () => {
  const browser = await chromium.launch(); const page = await browser.newPage();
  const logo = findFile('logo'), card = findFile('card');
  if (logo) {
    const r = await page.evaluate(PROCESS, { src: uri(logo), mode: 'logo' });
    manifest.logo = Object.assign(manifest.logo || {}, { file: path.basename(logo), white: !!r.dark });
    if (!/\.svg$/i.test(logo) && r.data) { fs.writeFileSync(path.join(dir, 'logo.opt.png'), Buffer.from(r.data.split(',')[1], 'base64')); manifest.logo.optimized = 'logo.opt.png'; }
    console.log(`✔ logo: ${path.basename(logo)} ${r.dark ? '(koyu → kreatifte beyaza çevrilir)' : '(açık renk, olduğu gibi)'}`);
  } else console.log('ℹ logo yok');
  if (card) {
    const r = await page.evaluate(PROCESS, { src: uri(card), mode: 'card', width: WIDTH, q: Q });
    fs.writeFileSync(path.join(dir, 'card.opt.webp'), Buffer.from(r.data.split(',')[1], 'base64'));
    manifest.card = Object.assign(manifest.card || {}, { file: path.basename(card), optimized: 'card.opt.webp' });
    console.log(`✔ kart: ${path.basename(card)} → card.opt.webp (${(fs.statSync(path.join(dir, 'card.opt.webp')).size / 1024).toFixed(0)} KB)`);
  } else console.log('ℹ kart görseli yok');
  const phPath = path.join(dir, 'photos.json');
  if (fs.existsSync(phPath)) {
    const ph = JSON.parse(fs.readFileSync(phPath, 'utf8'));
    for (const [slot, e] of Object.entries(ph.slots || {})) {
      const f = path.join(dir, e.file); if (!fs.existsSync(f)) continue;
      const r = await page.evaluate(PROCESS, { src: uri(f), mode: 'card', width: PW, q: PQ });
      const out = `photos/${slot}.opt.webp`; fs.writeFileSync(path.join(dir, out), Buffer.from(r.data.split(',')[1], 'base64')); e.optimized = out;
      console.log(`✔ fotoğraf ${slot}: ${e.file} → ${out} (${(fs.statSync(path.join(dir, out)).size / 1024).toFixed(0)} KB)`);
    }
    fs.writeFileSync(phPath, JSON.stringify(ph, null, 2));
  }
  await browser.close();
  fs.writeFileSync(mfPath, JSON.stringify(manifest, null, 2));
})();
