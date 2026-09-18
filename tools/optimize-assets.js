#!/usr/bin/env node
'use strict';
/**
 * assets/ altındaki gerçek görselleri banner için hazırlar (Playwright + Chromium):
 *   - Ürün fotoğrafı: düz (beyaz/açık) arka planı şeffaflaştırır, boşlukları kırpar,
 *     en fazla --height (vars. 460 px) yüksekliğe küçültür, alfa kanallı WebP yazar.
 *   - Logo: şeffaf boşlukları kırpar, koyu renkliyse bannerda beyaza çevrilmesi için işaretler.
 *   - Sonuçları assets/manifest.json içine yazar (image.optimized, image.transparent, logo.invert).
 *
 * Kullanım: NODE_PATH=$(npm root -g) node tools/optimize-assets.js [--height=460] [--quality=0.8] [--logoQuality=0.85] [--tolerance=22] [--keep-bg]
 *   --tolerance : arka plan rengine benzerlik eşiği (0-255). Açık renkli ürünlerde düşürün (ör. 14).
 *   --keep-bg   : hiçbir üründe fon temizleme yapma (kart görünümü). Ürün bazında: manifest → image.removeBg=false
 *   --keep-reflection : ürün fotoğrafının altındaki ayna yansımasını/gölgeyi kesme (varsayılan: kesilir)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const mfPath = path.join(root, 'assets', 'manifest.json');
if (!fs.existsSync(mfPath)) { console.error('assets/manifest.json yok. Önce: node tools/fetch-assets.js'); process.exit(1); }
const manifest = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const MAXH = +args.height || 460;
const Q = +args.quality || 0.8;
const LQ = +args.logoQuality || 0.85;
const TOL = args.tolerance !== undefined ? +args.tolerance : 22;
const KEEP_BG = !!args['keep-bg'];
const CUT_REFLECTION = !args['keep-reflection'];
const MIME = { svg: 'image/svg+xml', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
const toDataUri = (file) => `data:${MIME[path.extname(file).slice(1).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(file).toString('base64')}`;

/* Tarayıcı içinde çalışan işleme fonksiyonu */
const PROCESS = async ({ src, maxH, quality, mode, tol, keepBg, cutReflection }) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('görsel yüklenemedi')); img.src = src; });
  let W = img.naturalWidth || img.width, H = img.naturalHeight || img.height;
  // Çok büyük kaynakları önce makul boyuta indir (işlem hızı)
  const pre = Math.min(1, 1400 / Math.max(W, H));
  W = Math.round(W * pre); H = Math.round(H * pre);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, W, H);
  const id = ctx.getImageData(0, 0, W, H), d = id.data;
  const px = (x, y) => (y * W + x) * 4;

  // Kaynakta zaten şeffaflık var mı?
  let hasAlpha = false;
  for (let i = 3; i < d.length; i += 4 * 97) if (d[i] < 250) { hasAlpha = true; break; }

  let transparent = hasAlpha;
  let removed = false;
  if (mode === 'product' && !hasAlpha && !keepBg) {
    // Köşe rengi tutarlı ve açıksa arka plan olarak kabul et ve kenardan taşarak şeffaflaştır
    const corners = [[0, 0], [W - 1, 0], [0, H - 1], [W - 1, H - 1], [Math.floor(W / 2), 0], [Math.floor(W / 2), H - 1], [0, Math.floor(H / 2)], [W - 1, Math.floor(H / 2)]];
    const cols = corners.map(([x, y]) => [d[px(x, y)], d[px(x, y) + 1], d[px(x, y) + 2]]);
    const mean = cols.reduce((a, c) => [a[0] + c[0] / cols.length, a[1] + c[1] / cols.length, a[2] + c[2] / cols.length], [0, 0, 0]);
    const spread = Math.max(...cols.map((c) => Math.max(Math.abs(c[0] - mean[0]), Math.abs(c[1] - mean[1]), Math.abs(c[2] - mean[2]))));
    const light = (mean[0] + mean[1] + mean[2]) / 3 > 200;
    if (spread < 24 && light) {
      const near = (i) => Math.abs(d[i] - mean[0]) < tol && Math.abs(d[i + 1] - mean[1]) < tol && Math.abs(d[i + 2] - mean[2]) < tol;
      const seen = new Uint8Array(W * H);
      const stack = [];
      for (let x = 0; x < W; x++) { stack.push(x, 0, x, H - 1); }
      for (let y = 0; y < H; y++) { stack.push(0, y, W - 1, y); }
      while (stack.length) {
        const y = stack.pop(), x = stack.pop();
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const k = y * W + x;
        if (seen[k]) continue;
        seen[k] = 1;
        const i = k * 4;
        if (!near(i)) continue;
        d[i + 3] = 0;
        stack.push(x + 1, y, x - 1, y, x, y + 1, x, y - 1);
      }
      // Ayna yansıması / zemin gölgesi: nesnenin altındaki zayıf satırları (en güçlü satırın %55'inin altı) kaldır
      if (cutReflection) {
        const strength = new Float32Array(H);
        let maxS = 0;
        for (let y = 0; y < H; y++) {
          let m = 0;
          for (let x = 0; x < W; x++) {
            const i = px(x, y);
            if (d[i + 3] === 0) continue;
            const df = Math.max(Math.abs(d[i] - mean[0]), Math.abs(d[i + 1] - mean[1]), Math.abs(d[i + 2] - mean[2]));
            if (df > m) m = df;
          }
          strength[y] = m; if (m > maxS) maxS = m;
        }
        const thr = maxS * 0.55;
        for (let y = H - 1; y >= 0; y--) {
          if (strength[y] >= thr) break;
          for (let x = 0; x < W; x++) d[px(x, y) + 3] = 0;
        }
      }
      // Kenar yumuşatma (2 px): dış halka %40, iç halka %75 alfa
      const a = new Uint8ClampedArray(W * H);
      for (let k = 0; k < W * H; k++) a[k] = d[k * 4 + 3];
      const ring = new Uint8Array(W * H);
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const k = y * W + x;
        if (a[k] === 0) continue;
        if (a[k - 1] === 0 || a[k + 1] === 0 || a[k - W] === 0 || a[k + W] === 0) { ring[k] = 1; d[k * 4 + 3] = Math.round(a[k] * 0.4); }
      }
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const k = y * W + x;
        if (a[k] === 0 || ring[k]) continue;
        if (ring[k - 1] || ring[k + 1] || ring[k - W] || ring[k + W]) d[k * 4 + 3] = Math.round(a[k] * 0.75);
      }
      transparent = true; removed = true;
    }
  }
  ctx.putImageData(id, 0, 0);

  // Şeffaf/boş kenar boşluklarını kırp
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  if (transparent) {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[px(x, y) + 3] > 10) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
  const pad = Math.round(Math.max(x1 - x0, y1 - y0) * 0.03);
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(W - 1, x1 + pad); y1 = Math.min(H - 1, y1 + pad);
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

  // Ortalama parlaklık (logo için: koyu mu?)
  let lum = 0, cnt = 0;
  for (let y = y0; y <= y1; y += 2) for (let x = x0; x <= x1; x += 2) { const i = px(x, y); if (d[i + 3] > 40) { lum += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; cnt++; } }
  lum = cnt ? lum / cnt : 1;

  const scale = Math.min(1, maxH / ch);
  const out = document.createElement('canvas');
  out.width = Math.max(1, Math.round(cw * scale)); out.height = Math.max(1, Math.round(ch * scale));
  const octx = out.getContext('2d');
  octx.imageSmoothingQuality = 'high';
  octx.drawImage(c, x0, y0, cw, ch, 0, 0, out.width, out.height);
  return { dataUrl: out.toDataURL('image/webp', quality), width: out.width, height: out.height, transparent, removed, lum, hasAlpha };
};

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<!doctype html><title>optimize</title>');
  const writeOut = (dataUrl, file) => { fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64')); return fs.statSync(file).size; };
  const kb = (n) => (n / 1024).toFixed(1) + ' KB';

  for (const p of manifest.products || []) {
    if (!p.image || !p.image.file) continue;
    const src = path.join(root, p.image.file);
    if (!fs.existsSync(src)) { console.log(`⚠ ${p.key}: ${p.image.file} yok`); continue; }
    const r = await page.evaluate(PROCESS, { src: toDataUri(src), maxH: MAXH, quality: Q, mode: 'product', tol: TOL, keepBg: KEEP_BG || p.image.removeBg === false, cutReflection: CUT_REFLECTION && p.image.cutReflection !== false });
    const outFile = path.join(root, 'assets', 'products', `${p.key}.webp`);
    const bytes = writeOut(r.dataUrl, outFile);
    Object.assign(p.image, { optimized: path.relative(root, outFile), transparent: r.transparent, bytes, outWidth: r.width, outHeight: r.height });
    console.log(`✔ ${p.key.padEnd(10)} ${String(r.width + '×' + r.height).padEnd(9)} ${kb(bytes).padStart(9)}  ${r.removed ? 'arka plan kaldırıldı' : r.hasAlpha ? 'zaten şeffaf' : 'arka plan korundu (kart görünümü)'}`);
  }

  if (manifest.logo && manifest.logo.file) {
    const src = path.join(root, manifest.logo.file);
    if (fs.existsSync(src)) {
      const r = await page.evaluate(PROCESS, { src: toDataUri(src), maxH: 160, quality: LQ, mode: 'logo', tol: TOL, keepBg: true, cutReflection: false });
      const isSvg = /\.svg$/i.test(src);
      manifest.logo.invert = r.lum < 0.45; // koyu logo → bannerda beyaz
      if (!isSvg) {
        const outFile = path.join(root, 'assets', 'logo.webp');
        const bytes = writeOut(r.dataUrl, outFile);
        manifest.logo.optimized = path.relative(root, outFile);
        console.log(`✔ logo       ${String(r.width + '×' + r.height).padEnd(9)} ${kb(bytes).padStart(9)}  ${manifest.logo.invert ? 'koyu logo → beyaza çevrilecek' : 'açık logo, olduğu gibi'}`);
      } else console.log(`✔ logo (svg) ${manifest.logo.invert ? 'koyu → beyaza çevrilecek' : 'açık, olduğu gibi'}`);
    }
  }
  await browser.close();
  fs.writeFileSync(mfPath, JSON.stringify(manifest, null, 2));
  console.log('✔ assets/manifest.json güncellendi. Şimdi: node build.js');
})().catch((e) => { console.error(e); process.exit(1); });
