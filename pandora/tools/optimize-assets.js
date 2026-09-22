#!/usr/bin/env node
'use strict';
/**
 * Toplayıcının indirdiği ham görselleri masthead için hazırlar (Playwright + Chromium canvas):
 *   - Packshot (bileklik / charm): beyaz fonu şeffaflaştırır, boşlukları kırpar, en fazla --max (px) boyuta
 *     küçültür, alfa kanallı WebP yazar.
 *   - Hero (arka plan fotoğrafı): 1940 px genişliğe küçültür, WebP.
 *   - Logo: SVG ise temizleyip satır içi kullanır; PNG ise şeffaf boşlukları kırpar.
 * Seçimler assets/pick.json ile yapılır (hangi ürünün hangi görseli, hero dosyası, logo dosyası, odak noktası).
 * Çıktı: assets/opt/*.webp|svg ve assets/opt.json (build.js bunu okur).
 *
 * Kullanım: NODE_PATH=$(npm root -g) node tools/optimize-assets.js [--tolerance=26] [--bracelet=720] [--charm=200] [--quality=0.82]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');
const optDir = path.join(assets, 'opt');
fs.mkdirSync(optDir, { recursive: true });
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const TOL = args.tolerance !== undefined ? +args.tolerance : 26;
const BR = +args.bracelet || 720, CH = +args.charm || 200, HERO_W = +args.hero || 1940, Q = +args.quality || 0.82;
const manifest = JSON.parse(fs.readFileSync(path.join(assets, 'manifest.json'), 'utf8'));
const pick = fs.existsSync(path.join(assets, 'pick.json')) ? JSON.parse(fs.readFileSync(path.join(assets, 'pick.json'), 'utf8')) : {};
const MIME = { svg: 'image/svg+xml', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
const toDataUri = (file) => `data:${MIME[path.extname(file).slice(1).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(file).toString('base64')}`;
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

/* Tarayıcıda çalışır: fon temizleme + kırpma + küçültme */
const PROCESS = async ({ src, max, quality, mode, tol, crop, pad, seeds, keyTol }) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('görsel yüklenemedi')); img.src = src; });
  let W = img.naturalWidth, H = img.naturalHeight;
  const pre = Math.min(1, 1800 / Math.max(W, H)); W = Math.round(W * pre); H = Math.round(H * pre);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true }); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, W, H);
  if (mode === 'hero') {
    // isteğe bağlı kırpma (oranlar) → hedef genişlik
    let sx = 0, sy = 0, sw = W, sh = H;
    if (crop) { sx = Math.round(crop.x * W); sy = Math.round(crop.y * H); sw = Math.round(crop.w * W); sh = Math.round(crop.h * H); }
    const scale = Math.min(1, max / sw); const o = document.createElement('canvas'); o.width = Math.round(sw * scale); o.height = Math.round(sh * scale);
    const octx = o.getContext('2d'); octx.imageSmoothingQuality = 'high'; octx.drawImage(c, sx, sy, sw, sh, 0, 0, o.width, o.height);
    return { dataUrl: o.toDataURL('image/webp', quality), width: o.width, height: o.height };
  }
  const id = ctx.getImageData(0, 0, W, H), d = id.data; const px = (x, y) => (y * W + x) * 4;
  let hasAlpha = false; for (let i = 3; i < d.length; i += 4 * 61) if (d[i] < 250) { hasAlpha = true; break; }
  let removed = false;
  if (!hasAlpha) {
    const corners = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1], [W >> 1, 0], [W >> 1, H - 1], [0, H >> 1], [W - 1, H >> 1]];
    const cols = corners.map(([x, y]) => [d[px(x, y)], d[px(x, y) + 1], d[px(x, y) + 2]]);
    const mean = cols.reduce((a, cc) => [a[0] + cc[0] / cols.length, a[1] + cc[1] / cols.length, a[2] + cc[2] / cols.length], [0, 0, 0]);
    const light = (mean[0] + mean[1] + mean[2]) / 3 > 190;
    if (light) {
      const near = (i) => Math.abs(d[i] - mean[0]) < tol && Math.abs(d[i + 1] - mean[1]) < tol && Math.abs(d[i + 2] - mean[2]) < tol;
      const seen = new Uint8Array(W * H); const stack = [];
      for (let x = 0; x < W; x++) stack.push(x, 0, x, H - 1);
      for (let y = 0; y < H; y++) stack.push(0, y, W - 1, y);
      for (const sd of seeds || []) stack.push(Math.round(sd[0] * (W - 1)), Math.round(sd[1] * (H - 1)));
      while (stack.length) { const y = stack.pop(), x = stack.pop(); if (x < 0 || y < 0 || x >= W || y >= H) continue; const k = y * W + x; if (seen[k]) continue; seen[k] = 1; const i = k * 4; if (!near(i)) continue; d[i + 3] = 0; stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1); }
      if (keyTol) { for (let k = 0; k < W * H; k++) { const i = k * 4; if (d[i + 3] && Math.abs(d[i] - mean[0]) < keyTol && Math.abs(d[i + 1] - mean[1]) < keyTol && Math.abs(d[i + 2] - mean[2]) < keyTol) d[i + 3] = 0; } }
      // kenar yumuşatma: dış halka %35, ikinci halka %70 (gölge kalıntıları için ayrıca hafif toleranslı sönüm)
      const a = new Uint8ClampedArray(W * H); for (let k = 0; k < W * H; k++) a[k] = d[k * 4 + 3];
      const ring = new Uint8Array(W * H);
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const k = y * W + x; if (a[k] === 0) continue; if (a[k - 1] === 0 || a[k + 1] === 0 || a[k - W] === 0 || a[k + W] === 0) { ring[k] = 1; const i = k * 4; const df = Math.max(Math.abs(d[i] - mean[0]), Math.abs(d[i + 1] - mean[1]), Math.abs(d[i + 2] - mean[2])); d[i + 3] = Math.round(a[k] * Math.min(1, 0.25 + df / (tol * 3))); } }
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const k = y * W + x; if (a[k] === 0 || ring[k]) continue; if (ring[k - 1] || ring[k + 1] || ring[k - W] || ring[k + W]) d[k * 4 + 3] = Math.round(a[k] * 0.78); }
      removed = true;
    }
  }
  ctx.putImageData(id, 0, 0);
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[px(x, y) + 3] > 12) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
  const p = Math.round(Math.max(x1 - x0, y1 - y0) * (pad == null ? 0.03 : pad));
  x0 = Math.max(0, x0 - p); y0 = Math.max(0, y0 - p); x1 = Math.min(W - 1, x1 + p); y1 = Math.min(H - 1, y1 + p);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;
  const scale = Math.min(1, max / Math.max(cw, ch));
  const o = document.createElement('canvas'); o.width = Math.max(1, Math.round(cw * scale)); o.height = Math.max(1, Math.round(ch * scale));
  const octx = o.getContext('2d'); octx.imageSmoothingQuality = 'high'; octx.drawImage(c, x0, y0, cw, ch, 0, 0, o.width, o.height);
  return { dataUrl: o.toDataURL('image/webp', quality), width: o.width, height: o.height, removed, hasAlpha, bbox: { x0, y0, cw, ch, W, H } };
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage(); await page.setContent('<!doctype html><title>optimize</title>');
  const write = (dataUrl, file) => { fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64')); return fs.statSync(file).size; };
  const opt = { generatedAt: new Date().toISOString(), bracelets: {}, charms: {}, logo: null, hero: null };
  const byKey = {}; for (const p of manifest.products) byKey[p.key] = p;
  // ürünler
  for (const p of manifest.products) {
    const pk = (pick.products && pick.products[p.key]) || {};
    if (pk.skip) continue;
    let file = pk.file ? path.join(root, pk.file) : null;
    if (!file) { const idx = pk.index != null ? pk.index : 0; const im = (p.images || []).filter((i) => !i.skip)[idx] || (p.images || [])[0]; if (im) file = path.join(root, im.file); }
    if (!file || !fs.existsSync(file)) { console.log(`⚠ ${p.key}: görsel yok`); continue; }
    const isBr = p.kind === 'bracelet';
    const r = await page.evaluate(PROCESS, { src: toDataUri(file), max: isBr ? BR : CH, quality: Q, mode: 'packshot', tol: pk.tolerance != null ? +pk.tolerance : TOL, pad: pk.pad, seeds: pk.seeds || (isBr ? [[0.5, 0.5]] : null), keyTol: pk.keyTol || 0 });
    const outFile = path.join(optDir, `${p.key}.webp`); const bytes = write(r.dataUrl, outFile);
    (isBr ? opt.bracelets : opt.charms)[p.key] = { file: path.relative(root, outFile), w: r.width, h: r.height, bytes, title: p.title, price: p.price, sku: p.sku, url: p.sourceUrl || p.url, from: path.relative(root, file), transparent: r.removed || r.hasAlpha };
    console.log(`✔ ${p.key.padEnd(12)} ${String(r.width + '×' + r.height).padEnd(9)} ${kb(bytes).padStart(9)}  ${r.removed ? 'fon temizlendi' : r.hasAlpha ? 'zaten şeffaf' : 'fon korundu'}  ${p.title} ${p.price ? p.price + ' TL' : ''}`);
  }
  // hero
  if (pick.hero && pick.hero.file) {
    const f = path.join(root, pick.hero.file);
    if (fs.existsSync(f)) {
      const r = await page.evaluate(PROCESS, { src: toDataUri(f), max: pick.hero.max || HERO_W, quality: pick.hero.quality || 0.74, mode: 'hero', crop: pick.hero.crop });
      const outFile = path.join(optDir, 'hero.webp'); const bytes = write(r.dataUrl, outFile);
      opt.hero = { file: path.relative(root, outFile), w: r.width, h: r.height, bytes, pos: pick.hero.pos || '50% 50%', from: pick.hero.file };
      console.log(`✔ hero         ${r.width}×${r.height} ${kb(bytes)}`);
    } else console.log(`⚠ hero dosyası yok: ${pick.hero.file}`);
  }
  // logo
  const lg = (pick.logo && pick.logo.file) || (manifest.logo && manifest.logo.file);
  if (lg) {
    const f = path.join(root, lg);
    if (/\.svg$/i.test(f)) {
      let svg = fs.readFileSync(f, 'utf8').replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<metadata[\s\S]*?<\/metadata>/gi, '').replace(/<sodipodi:namedview[\s\S]*?\/>/gi, '').replace(/<sodipodi:namedview[\s\S]*?<\/sodipodi:namedview>/gi, '').replace(/\s(?:inkscape|sodipodi):[a-zA-Z-]+="[^"]*"/g, '').replace(/\sxmlns:(?:dc|cc|rdf|svg|sodipodi|inkscape)="[^"]*"/g, '').replace(/<defs[^>]*\/>|<defs[^>]*>\s*<\/defs>/g, '').replace(/\sstyle="text-align:center"/, '').replace(/\s+/g, ' ').replace(/> </g, '><').trim();
      if (pick.logo && pick.logo.fill) { svg = svg.replace(/fill="(?!none)[^"]*"/g, `fill="${pick.logo.fill}"`).replace(/stroke="(?!none)[^"]*"/g, `stroke="${pick.logo.fill}"`); svg = svg.replace(/^(<svg[^>]*?)\sfill="[^"]*"/, '$1').replace(/^<svg/, `<svg fill="${pick.logo.fill}"`); }
      svg = svg.replace(/\swidth="100%"/, '').replace(/<title>[\s\S]*?<\/title>/, '');
      const outFile = path.join(optDir, 'logo.svg'); fs.writeFileSync(outFile, svg);
      const vb = svg.match(/viewBox="([\d.\s,-]+)"/); const v = vb ? vb[1].trim().split(/[\s,]+/).map(Number) : null;
      opt.logo = { file: path.relative(root, outFile), inline: true, aspect: v ? v[2] / v[3] : null, from: lg, bytes: svg.length };
      console.log(`✔ logo (svg)   ${kb(svg.length)}  ${lg}`);
    } else if (fs.existsSync(f)) {
      const r = await page.evaluate(PROCESS, { src: toDataUri(f), max: 480, quality: 0.9, mode: 'packshot', tol: 10, pad: 0 });
      const outFile = path.join(optDir, 'logo.webp'); const bytes = write(r.dataUrl, outFile);
      opt.logo = { file: path.relative(root, outFile), aspect: r.width / r.height, from: lg, bytes };
      console.log(`✔ logo (webp)  ${r.width}×${r.height} ${kb(bytes)}`);
    }
  }
  await browser.close();
  fs.writeFileSync(path.join(assets, 'opt.json'), JSON.stringify(opt, null, 2));
  console.log('✔ assets/opt.json yazıldı. Şimdi: node build.js');
})().catch((e) => { console.error(e); process.exit(1); });
