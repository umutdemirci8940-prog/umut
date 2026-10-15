#!/usr/bin/env node
'use strict';
/**
 * config.js'te seçilen orijinal ürün fotoğraflarını banner boyutuna indirger (WebP) ve
 * sitedeki logo sembolünden bağımsız, renklendirilebilir logo.svg üretir.
 *   girdi : altinyildiz/assets/site/products/*.jpg, assets/site/pages/home.html
 *   çıktı : altinyildiz/assets/banner/<kategori>-<n>.webp, altinyildiz/assets/banner/logo.svg
 * Gerekli: Playwright + Chromium.  Kullanım: node altinyildiz/tools/prepare-images.js [--w=220] [--q=0.72]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const cfg = require('../src/config');

const ROOT = path.join(__dirname, '..');
const SITE = path.join(ROOT, 'assets', 'site');
const OUT = path.join(ROOT, 'assets', 'banner');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? +a.split('=')[1] : d; };
const W = arg('w', 220), H = Math.round(W * 1.5), Q = arg('q', 0.72);
fs.mkdirSync(OUT, { recursive: true });

// Logo: <symbol id="logo"> → bağımsız SVG, dolgu currentColor
const home = fs.readFileSync(path.join(SITE, 'pages', 'home.html'), 'utf8');
const sym = home.match(/<symbol[^>]*id="logo"[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/symbol>/);
if (sym) {
  const inner = sym[2].replace(/fill="#0A0B09"/gi, 'fill="currentColor"').replace(/fill="#[0-9a-f]{6}"/gi, 'fill="currentColor"');
  fs.writeFileSync(path.join(OUT, 'logo.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${sym[1]}" fill="currentColor">${inner}</svg>`);
  console.log('✔ logo.svg');
} else console.log('⚠ logo sembolü bulunamadı');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let total = 0;
  for (const c of cfg.cats) {
    for (let i = 0; i < c.items.length; i++) {
      const src = path.join(SITE, c.items[i].src);
      const uri = 'data:image/jpeg;base64,' + fs.readFileSync(src).toString('base64');
      const b64 = await page.evaluate(async ({ uri, W, H, Q }) => {
        const img = new Image(); img.src = uri; await img.decode();
        const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
        const ctx = cv.getContext('2d'); ctx.imageSmoothingQuality = 'high';
        // 2:3 kadraj, üstten hizalı (yüz ve yaka korunur)
        const r = Math.max(W / img.naturalWidth, H / img.naturalHeight);
        const w = img.naturalWidth * r, h = img.naturalHeight * r;
        ctx.drawImage(img, (W - w) / 2, 0, w, h);
        return cv.toDataURL('image/webp', Q).split(',')[1];
      }, { uri, W, H, Q });
      const f = path.join(OUT, `${c.key}-${i}.webp`);
      fs.writeFileSync(f, Buffer.from(b64, 'base64'));
      const kb = fs.statSync(f).size / 1024; total += kb;
      console.log(`✔ ${path.basename(f).padEnd(12)} ${kb.toFixed(1)} KB  ← ${c.items[i].src}`);
    }
  }
  console.log(`Toplam ${total.toFixed(1)} KB`);
  await browser.close();
})();
