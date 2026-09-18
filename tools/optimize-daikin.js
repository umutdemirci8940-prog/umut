#!/usr/bin/env node
'use strict';
/**
 * Siteden çekilen ürün fotoğrafını (şeffaf PNG) saydam kenarlarından kırpar, masthead için
 * 2x çözünürlükte WebP + PNG olarak assets/daikin/ altına yazar. Playwright + Chromium kullanır.
 *
 *   NODE_PATH=$(npm root -g) node tools/optimize-daikin.js [--src=<png>] [--out=unit-emura] [--width=800]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const root = path.join(__dirname, '..');
const SRC = path.resolve(root, args.src || 'assets/daikin/products/8-emura-9000-btu-h-a-ftxj25aw9-inverter-klima-r32/img-5-900.png');
const OUT = path.join(root, 'assets', 'daikin', String(args.out || 'unit-emura'));
const WIDTH = +args.width || 800;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const b64 = fs.readFileSync(SRC).toString('base64');
  await p.setContent(`<img id="u" src="data:image/png;base64,${b64}">`);
  await p.waitForFunction(() => document.getElementById('u').complete);
  const res = await p.evaluate(async (WIDTH) => {
    const u = document.getElementById('u');
    const c = document.createElement('canvas'); c.width = u.naturalWidth; c.height = u.naturalHeight;
    const g = c.getContext('2d'); g.drawImage(u, 0, 0);
    const d = g.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { if (d[(y * c.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } }
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const scale = Math.min(1, WIDTH / w);
    const o = document.createElement('canvas'); o.width = Math.round(w * scale); o.height = Math.round(h * scale);
    const og = o.getContext('2d'); og.imageSmoothingQuality = 'high';
    og.drawImage(u, x0, y0, w, h, 0, 0, o.width, o.height);
    const blob = (type, q) => new Promise((r) => o.toBlob((bl) => { const fr = new FileReader(); fr.onload = () => r(fr.result.split(',')[1]); fr.readAsDataURL(bl); }, type, q));
    return { bbox: [x0, y0, x1, y1], src: [c.width, c.height], out: [o.width, o.height], webp: await blob('image/webp', 0.9), png: await blob('image/png') };
  }, WIDTH);
  fs.writeFileSync(OUT + '.webp', Buffer.from(res.webp, 'base64'));
  fs.writeFileSync(OUT + '.png', Buffer.from(res.png, 'base64'));
  const meta = { source: path.relative(root, SRC), sourceSize: res.src, bbox: res.bbox, size: res.out, files: { webp: path.relative(root, OUT + '.webp'), png: path.relative(root, OUT + '.png') } };
  fs.writeFileSync(OUT + '.json', JSON.stringify(meta, null, 2));
  console.log(JSON.stringify(meta), `\nwebp ${fs.statSync(OUT + '.webp').size} B, png ${fs.statSync(OUT + '.png').size} B`);
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
