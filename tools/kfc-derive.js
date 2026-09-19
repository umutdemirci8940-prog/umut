#!/usr/bin/env node
'use strict';
/**
 * Sitenin og görselindeki KFC yazı logosunun beyaz fonunu şeffaflaştırır ve kırpar:
 *   assets/kfc/img/397-og-image-logo.jpg → assets/kfc-derived/logo-wordmark.png
 * Kullanım: NODE_PATH=$(npm root -g) node tools/kfc-derive.js [--src=assets/kfc/img/397-og-image-logo.jpg]
 */
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const src = path.resolve(root, args.src || 'assets/kfc/img/397-og-image-logo.jpg');
const outDir = path.join(root, 'assets', 'kfc-derived'); fs.mkdirSync(outDir, { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  const dataUrl = `data:image/jpeg;base64,${fs.readFileSync(src).toString('base64')}`;
  const png = await p.evaluate(async (u) => {
    const i = new Image(); i.src = u; await i.decode();
    const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height); const px = d.data; let minx = 1e9, miny = 1e9, maxx = 0, maxy = 0;
    for (let k = 0; k < px.length; k += 4) {
      const r = px[k], g = px[k + 1], bl = px[k + 2]; const lum = (r + g + bl) / 3; const sat = Math.max(r, g, bl) - Math.min(r, g, bl);
      let a = 255; if (lum > 235 && sat < 20) a = 0; else if (lum > 200 && sat < 40) a = Math.round(255 * (235 - lum) / 35);
      px[k + 3] = a;
      if (a > 30) { const xx = (k / 4) % c.width, yy = Math.floor(k / 4 / c.width); if (xx < minx) minx = xx; if (xx > maxx) maxx = xx; if (yy < miny) miny = yy; if (yy > maxy) maxy = yy; }
    }
    x.putImageData(d, 0, 0); const pad = 6; const w = maxx - minx + 1 + pad * 2, h = maxy - miny + 1 + pad * 2;
    const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; c2.getContext('2d').drawImage(c, minx - pad, miny - pad, w, h, 0, 0, w, h);
    return { url: c2.toDataURL('image/png'), w, h };
  }, dataUrl);
  const out = path.join(outDir, 'logo-wordmark.png');
  fs.writeFileSync(out, Buffer.from(png.url.split(',')[1], 'base64'));
  console.log(`✔ ${path.relative(root, out)} ${png.w}×${png.h}`);
  await b.close();
})();
