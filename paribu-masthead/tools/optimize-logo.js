#!/usr/bin/env node
'use strict';
/**
 * Siteden çekilen logo/sembolü koyu zemine hazırlar (Playwright + Chromium canvas):
 *  - PNG/WebP: şeffaf kenar boşluklarını kırpar; koyu (siyah/lacivert) nötr pikselleri beyaza çevirir,
 *    renkli pikselleri (marka yeşili vb.) korur → assets/logo/<ad>-white.png
 *  - SVG: koyu nötr dolgular derlemede (build.js → whitenSvg) beyaza çevrilir; burada yalnız kırpma bilgisi alınır.
 *  Sonuçlar assets/manifest.json → logo.white / symbol.white alanlarına yazılır.
 * Kullanım: NODE_PATH=$(npm root -g) node tools/optimize-logo.js [--keep-colors]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const mf = path.join(root, 'assets', 'manifest.json');
if (!fs.existsSync(mf)) { console.log('assets/manifest.json yok; önce tools/fetch-assets.js'); process.exit(0); }
const manifest = JSON.parse(fs.readFileSync(mf, 'utf8'));

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext()).newPage();
  await page.setContent('<!doctype html><canvas id="c"></canvas>');
  for (const key of ['logo', 'symbol']) {
    const e = manifest[key]; if (!e || !e.file) continue;
    const f = path.join(root, e.file); if (!fs.existsSync(f)) continue;
    const ext = path.extname(f).slice(1).toLowerCase();
    if (ext === 'svg') { console.log(`${key}: SVG (${e.file}) – koyu: ${e.dark}; beyazlatma derlemede yapılır`); continue; }
    if (!['png', 'webp', 'jpg', 'jpeg'].includes(ext)) continue;
    const uri = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${fs.readFileSync(f).toString('base64')}`;
    const res = await page.evaluate(async ({ uri, isSymbol }) => {
      const im = new Image(); im.src = uri; await im.decode();
      const c = document.getElementById('c'); c.width = im.naturalWidth; c.height = im.naturalHeight;
      const x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0);
      const d = x.getImageData(0, 0, c.width, c.height), p = d.data, W = c.width, H = c.height;
      // arka plan düz renk mi? (köşeler opak ve aynı renkse: ör. beyaz zeminli logo) → şeffaflaştır
      const corner = [0, (W - 1) * 4, (H - 1) * W * 4, ((H - 1) * W + W - 1) * 4].map((i) => [p[i], p[i + 1], p[i + 2], p[i + 3]]);
      const opaqueBg = corner.every((c0) => c0[3] > 250) && corner.every((c0) => Math.abs(c0[0] - corner[0][0]) < 8 && Math.abs(c0[1] - corner[0][1]) < 8 && Math.abs(c0[2] - corner[0][2]) < 8);
      let bg = opaqueBg ? corner[0] : null;
      if (bg && !isSymbol) { for (let i = 0; i < p.length; i += 4) { if (Math.abs(p[i] - bg[0]) < 18 && Math.abs(p[i + 1] - bg[1]) < 18 && Math.abs(p[i + 2] - bg[2]) < 18) p[i + 3] = 0; } }
      // kırpma sınırları
      let x0 = W, y0 = H, x1 = -1, y1 = -1, dark = 0, light = 0, colored = 0, n = 0;
      for (let y = 0; y < H; y++) for (let xx = 0; xx < W; xx++) {
        const i = (y * W + xx) * 4; if (p[i + 3] < 16) continue;
        n++; if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y;
        const r = p[i], g = p[i + 1], b = p[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0, lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        if (sat > 0.35) colored++; else if (lum < 0.45) dark++; else light++;
      }
      if (x1 < 0) return null;
      const isDark = dark > light && dark > colored * 0.6;
      // beyazlat: nötr koyu pikseller → beyaz (alfa korunur), renkliler kalır
      if (isDark && !isSymbol) for (let i = 0; i < p.length; i += 4) { if (p[i + 3] < 16) continue; const r = p[i], g = p[i + 1], b = p[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = mx ? (mx - mn) / mx : 0; if (sat <= 0.35) { p[i] = p[i + 1] = p[i + 2] = 255; } }
      x.putImageData(d, 0, 0);
      const pad = 2, cw = x1 - x0 + 1 + pad * 2, ch = y1 - y0 + 1 + pad * 2;
      const o = document.createElement('canvas'); o.width = cw; o.height = ch; o.getContext('2d').drawImage(c, x0 - pad, y0 - pad, cw, ch, 0, 0, cw, ch);
      return { png: o.toDataURL('image/png').split(',')[1], w: cw, h: ch, isDark, opaqueBg, stats: { dark, light, colored, n } };
    }, { uri, isSymbol: key === 'symbol' });
    if (!res) { console.log(`${key}: boş görsel`); continue; }
    const outName = e.file.replace(/\.(png|webp|jpe?g)$/i, '') + (res.isDark || res.opaqueBg ? '-white.png' : '-trim.png');
    fs.writeFileSync(path.join(root, outName), Buffer.from(res.png, 'base64'));
    e.white = outName; e.dark = res.isDark; e.w = res.w; e.h = res.h; e.stats = res.stats;
    console.log(`${key}: ${e.file} → ${outName} (${res.w}×${res.h}, koyu: ${res.isDark}, opak zemin: ${res.opaqueBg})`);
  }
  await browser.close();
  fs.writeFileSync(mf, JSON.stringify(manifest, null, 1));
  console.log('✔ manifest güncellendi');
})().catch((e) => { console.error(e); process.exit(1); });
