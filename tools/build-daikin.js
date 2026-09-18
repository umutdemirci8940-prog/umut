#!/usr/bin/env node
'use strict';
/**
 * Daikin 970x250 masthead derleyicisi: şablona (src/daikin/masthead.html) siteden çekilen gerçek
 * logoyu (SVG, satır içi) ve ürün fotoğrafını (WebP, base64) gömer; kanat/LED konumlarını hesaplar
 * ve tek dosyalık index.html üretir.
 *
 *   node tools/build-daikin.js [--out=index.html] [--png]   (--png: WebP yerine PNG gömer, daha büyük dosya)
 */
const fs = require('fs');
const path = require('path');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const root = path.join(__dirname, '..');
const OUT = path.resolve(root, String(args.out || 'index.html'));
const A = path.join(root, 'assets', 'daikin');

/* ---- Yerleşim (CSS px) ---- */
const LAYOUT = {
  unit: { left: 575, top: -34, width: 400 },
  // ürün fotoğrafındaki kanat (hava çıkışı) çizgisi ve LED; kırpılmış görsele göre 0–1 oranları
  vent: { x1: 0.142, y1: 0.912, x2: 0.706, y2: 0.802 },
  led:  { x: 0.817, y: 0.861 },
  clickUrl: 'https://www.daikin.com.tr/klimalar/bireysel-klimalar/emura-iii-klimalar?utm_source=masthead&utm_medium=display&utm_campaign=serinligi-yuzunde-hisset',
};

/* ---- Varlıklar ---- */
const meta = JSON.parse(fs.readFileSync(path.join(A, 'unit-emura.json'), 'utf8'));
const imgFile = path.join(root, args.png ? meta.files.png : meta.files.webp);
const mime = args.png ? 'image/png' : 'image/webp';
const unitSrc = `data:${mime};base64,${fs.readFileSync(imgFile).toString('base64')}`;

let logo = fs.readFileSync(path.join(A, 'logo', 'logo-1.svg'), 'utf8')
  .replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<title>[\s\S]*?<\/title>/, '').replace(/<desc>[\s\S]*?<\/desc>/, '')
  .replace(/<svg\b([^>]*)>/, (m, attrs) => '<svg' + attrs.replace(/\s(width|height)="[^"]*"/g, '') + ' aria-hidden="true" focusable="false">')
  .replace(/\s+/g, ' ').trim();

/* ---- Geometri ---- */
const [iw, ih] = meta.size;
const U = LAYOUT.unit, uh = U.width * ih / iw;
const px = (nx, ny) => ({ x: U.left + nx * U.width, y: U.top + ny * uh });
const v1 = px(LAYOUT.vent.x1, LAYOUT.vent.y1), v2 = px(LAYOUT.vent.x2, LAYOUT.vent.y2), led = px(LAYOUT.led.x, LAYOUT.led.y);
const ventLen = Math.hypot(v2.x - v1.x, v2.y - v1.y), ventAngle = Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI;
const r1 = (n) => Math.round(n * 10) / 10;
const vars = {
  UNIT_SRC: unitSrc, LOGO_SVG: logo, CLICK_URL: LAYOUT.clickUrl,
  UNIT_LEFT: U.left, UNIT_TOP: U.top, UNIT_W: U.width, UNIT_H: r1(uh),
  VENT_X1: r1(v1.x), VENT_Y1: r1(v1.y), VENT_X2: r1(v2.x), VENT_Y2: r1(v2.y),
  VENT_CX: r1((v1.x + v2.x) / 2), VENT_CY: r1((v1.y + v2.y) / 2), VENT_LEN: r1(ventLen), VENT_ANGLE: r1(ventAngle),
  LED_X: r1(led.x), LED_Y: r1(led.y),
};

let html = fs.readFileSync(path.join(root, 'src', 'daikin', 'masthead.html'), 'utf8');
const missing = new Set();
html = html.replace(/\{\{([A-Z_0-9]+)\}\}/g, (m, k) => (k in vars ? String(vars[k]) : (missing.add(k), m)));
if (missing.size) { console.error('Eksik değişkenler:', [...missing].join(', ')); process.exit(1); }
fs.writeFileSync(OUT, html);
const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
console.log(`✔ ${path.relative(root, OUT)} (${kb} KB) – ürün: ${path.relative(root, imgFile)} ${iw}x${ih} → ${U.width}x${r1(uh)} @ (${U.left},${U.top}); kanat (${r1(v1.x)},${r1(v1.y)})→(${r1(v2.x)},${r1(v2.y)}) ${r1(ventAngle)}°; LED (${r1(led.x)},${r1(led.y)})`);
