#!/usr/bin/env node
'use strict';
/**
 * Rich media (genişleyen, yaz/kış geçişli) Daikin masthead derleyicisi.
 *   node tools/build-rich.js [--out=rich/index.html]
 * Şablon: src/daikin/rich-media.html · görseller: assets/daikin/unit-emura.webp, assets/daikin-kombi/unit-kombi.webp, assets/daikin/rich/*.webp
 */
const fs = require('fs');
const path = require('path');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const root = path.join(__dirname, '..');
const OUT = path.resolve(root, String(args.out || 'rich/index.html'));
const b64 = (f) => `data:image/webp;base64,${fs.readFileSync(path.join(root, f)).toString('base64')}`;
const meta = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));

/* Koyu zemin için ters (beyaz) logo: harfler ve küçük üçgen beyaz, büyük üçgen açık mavi */
const logo = fs.readFileSync(path.join(root, 'assets/daikin/logo/logo-1.svg'), 'utf8')
  .replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '').replace(/<title>[\s\S]*?<\/title>/, '').replace(/<desc>[\s\S]*?<\/desc>/, '')
  .replace(/<svg\b([^>]*)>/, (m, attrs) => '<svg' + attrs.replace(/\s(width|height)="[^"]*"/g, '') + ' aria-hidden="true" focusable="false">')
  .replace(/fill="#2694D1"/g, 'fill="#FFFFFF"').replace(/fill="#010202"/g, 'fill="#FFFFFF"')
  .replace(/\s+/g, ' ').trim();

/* Ürün yerleşimleri (CSS px) ve fotoğraf oranları */
const E = { left: 540, top: -36, width: 440, meta: meta('assets/daikin/unit-emura.json'), vent: { x1: 0.142, y1: 0.912, x2: 0.706, y2: 0.802 }, led: { x: 0.817, y: 0.861 }, dir: 2.0 };
const K = { left: 700, top: -6, width: 176, meta: meta('assets/daikin-kombi/unit-kombi.json'), vent: { x1: 0.06, y1: 0.975, x2: 0.77, y2: 0.92 }, led: { x: 0.357, y: 0.875 }, dir: 3.4 };
const r1 = (n) => Math.round(n * 10) / 10;
function place(P, prefix){
  const [iw, ih] = P.meta.size, h = P.width * ih / iw;
  const px = (n) => ({ x: P.left + n.x * P.width, y: P.top + n.y * h });
  const v1 = px({ x: P.vent.x1, y: P.vent.y1 }), v2 = px({ x: P.vent.x2, y: P.vent.y2 }), led = px(P.led);
  const len = Math.hypot(v2.x - v1.x, v2.y - v1.y), ang = Math.atan2(v2.y - v1.y, v2.x - v1.x) * 180 / Math.PI;
  const o = {};
  o[prefix + '_LEFT'] = P.left; o[prefix + '_TOP'] = P.top; o[prefix + '_W'] = P.width; o[prefix + '_H'] = r1(h);
  o[prefix + '_VX'] = r1(v1.x); o[prefix + '_VY'] = r1(v1.y); o[prefix + '_VLEN'] = r1(len); o[prefix + '_VANG'] = r1(ang);
  o[prefix + '_VX1'] = r1(v1.x); o[prefix + '_VY1'] = r1(v1.y + 3); o[prefix + '_VX2'] = r1(v2.x); o[prefix + '_VY2'] = r1(v2.y + 3);
  o[prefix + '_LX'] = r1(led.x); o[prefix + '_LY'] = r1(led.y); o[prefix + '_DIR'] = P.dir;
  o[prefix + '_POOL_X'] = r1((v1.x + v2.x) / 2); o[prefix + '_POOL_Y'] = r1(Math.min(H_MAX, P.top + h + 10));
  return o;
}
const H_MAX = 236;
const vars = Object.assign({
  LOGO_WHITE: logo,
  IMG_EMURA: b64('assets/daikin/unit-emura.webp'), IMG_KOMBI: b64('assets/daikin-kombi/unit-kombi.webp'),
  IMG_EMURA_FRONT: b64('assets/daikin/rich/emura-front.webp'), IMG_EMURA_SIDE: b64('assets/daikin/rich/emura-side.webp'), IMG_EMURA_REMOTE: b64('assets/daikin/rich/emura-remote.webp'),
  IMG_KOMBI_FRONT: b64('assets/daikin/rich/kombi-front.webp'), IMG_KOMBI_SIDE: b64('assets/daikin/rich/kombi-side.webp'), IMG_KOMBI_CUT: b64('assets/daikin/rich/kombi-extra.webp'),
  URL_YAZ: 'https://www.daikin.com.tr/klimalar/bireysel-klimalar/emura-iii-klimalar?utm_source=masthead&utm_medium=richmedia&utm_campaign=yaz-kis',
  URL_YAZ_ALL: 'https://www.daikin.com.tr/klimalar?utm_source=masthead&utm_medium=richmedia&utm_campaign=yaz-kis',
  URL_KIS: 'https://www.daikin.com.tr/kombiler/tam-yogusmali-premix-ndj?utm_source=masthead&utm_medium=richmedia&utm_campaign=yaz-kis',
  URL_KIS_ALL: 'https://www.daikin.com.tr/kombiler?utm_source=masthead&utm_medium=richmedia&utm_campaign=yaz-kis',
}, place(E, 'E'), place(K, 'K'));
vars.POOL_X = vars.E_POOL_X; vars.POOL_Y = vars.E_POOL_Y;

let html = fs.readFileSync(path.join(root, 'src/daikin/rich-media.html'), 'utf8');
const missing = new Set();
html = html.replace(/\{\{([A-Z_0-9]+)\}\}/g, (m, k) => (k in vars ? String(vars[k]) : (missing.add(k), m)));
if (missing.size) { console.error('Eksik değişkenler:', [...missing].join(', ')); process.exit(1); }
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log(`✔ ${path.relative(root, OUT)} (${(fs.statSync(OUT).size / 1024).toFixed(1)} KB) – Emura ${vars.E_W}x${vars.E_H} @ (${vars.E_LEFT},${vars.E_TOP}), kanat (${vars.E_VX1},${vars.E_VY1})→(${vars.E_VX2},${vars.E_VY2}); Kombi ${vars.K_W}x${vars.K_H} @ (${vars.K_LEFT},${vars.K_TOP}), çıkış (${vars.K_VX1},${vars.K_VY1})→(${vars.K_VX2},${vars.K_VY2})`);
