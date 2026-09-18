#!/usr/bin/env node
'use strict';
/**
 * Daikin 970x250 masthead derleyicisi: şablona siteden çekilen gerçek logoyu (SVG, satır içi) ve ürün
 * fotoğrafını (WebP, base64) gömer; hava/ısı çıkış çizgisi ve ışık konumlarını hesaplar, tek dosyalık HTML üretir.
 *
 *   node tools/build-daikin.js [--variant=klima|kombi|all] [--out=<dosya>] [--png]
 *     --png: WebP yerine PNG gömer (eski tarayıcılar; dosya çok daha büyük)
 */
const fs = require('fs');
const path = require('path');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const root = path.join(__dirname, '..');

/* ---- Varyantlar (yerleşim CSS px; oranlar kırpılmış fotoğrafa göre 0–1) ---- */
const VARIANTS = {
  klima: {
    template: 'src/daikin/masthead.html', out: 'index.html',
    assets: 'assets/daikin', image: 'unit-emura', logo: 'assets/daikin/logo/logo-1.svg',
    unit: { left: 575, top: -34, width: 400 },
    origin: { x1: 0.142, y1: 0.912, x2: 0.706, y2: 0.802 },   // kanat (hava çıkışı) çizgisi
    led: { x: 0.817, y: 0.861 },
    clickUrl: 'https://www.daikin.com.tr/klimalar/bireysel-klimalar/emura-iii-klimalar?utm_source=masthead&utm_medium=display&utm_campaign=serinligi-yuzunde-hisset',
  },
  kombi: {
    template: 'src/daikin/masthead-kombi.html', out: 'kombi/index.html',
    assets: 'assets/daikin-kombi', image: 'unit-kombi', logo: 'assets/daikin/logo/logo-1.svg',
    unit: { left: 790, top: 6, width: 150 },
    origin: { x1: 0.05, y1: 0.98, x2: 0.7, y2: 0.98 },       // kombi alt kenarı (sıcak hava çıkışı)
    led: { x: 0.5, y: 0.6 },                                   // alev / ekran ışığı
    glow: { x: 0.5, y: 0.75 },                                 // sıcak ışık merkezi
    tCold: 3, tWarm: 22,
    unitAlt: 'Daikin yoğuşmalı kombi',
    ctaText: 'Kombileri Keşfet',
    subHtml: 'Daikin <b>yoğuşmalı kombi</b>: kışın en soğuk gününde bile ev sıcacık.',
    chipsHtml: '',
    clickUrl: 'https://www.daikin.com.tr/kombiler?utm_source=masthead&utm_medium=display&utm_campaign=sicakligi-evinde-hisset',
  },
};
// Varyant ayarları için isteğe bağlı yerel dosya (metinler, oranlar, adres): src/daikin/<variant>.config.json
function loadVariant(name){
  const base = VARIANTS[name];
  if (!base) { console.error(`Bilinmeyen varyant: ${name} (klima | kombi | all)`); process.exit(1); }
  const cfgFile = path.join(root, 'src', 'daikin', `${name}.config.json`);
  return fs.existsSync(cfgFile) ? Object.assign({}, base, JSON.parse(fs.readFileSync(cfgFile, 'utf8'))) : base;
}

function build(name){
  const V = loadVariant(name);
  const OUT = path.resolve(root, String(args.out || V.out));
  const A = path.join(root, V.assets);

  const meta = JSON.parse(fs.readFileSync(path.join(A, V.image + '.json'), 'utf8'));
  const imgFile = path.join(root, args.png ? meta.files.png : meta.files.webp);
  const mime = args.png ? 'image/png' : 'image/webp';
  const unitSrc = `data:${mime};base64,${fs.readFileSync(imgFile).toString('base64')}`;

  const logo = fs.readFileSync(path.join(root, V.logo), 'utf8')
    .replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<title>[\s\S]*?<\/title>/, '').replace(/<desc>[\s\S]*?<\/desc>/, '')
    .replace(/<svg\b([^>]*)>/, (m, attrs) => '<svg' + attrs.replace(/\s(width|height)="[^"]*"/g, '') + ' aria-hidden="true" focusable="false">')
    .replace(/\s+/g, ' ').trim();

  const [iw, ih] = meta.size;
  const U = V.unit, uh = U.width * ih / iw;
  const px = (n) => ({ x: U.left + n.x * U.width, y: U.top + n.y * uh });
  const o1 = px({ x: V.origin.x1, y: V.origin.y1 }), o2 = px({ x: V.origin.x2, y: V.origin.y2 }), led = px(V.led), glow = px(V.glow || V.led);
  const len = Math.hypot(o2.x - o1.x, o2.y - o1.y), angle = Math.atan2(o2.y - o1.y, o2.x - o1.x) * 180 / Math.PI;
  const r1 = (n) => Math.round(n * 10) / 10;
  const vars = {
    UNIT_SRC: unitSrc, LOGO_SVG: logo, CLICK_URL: V.clickUrl,
    UNIT_LEFT: U.left, UNIT_TOP: U.top, UNIT_W: U.width, UNIT_H: r1(uh), UNIT_ALT: V.unitAlt || '',
    // klima şablonu (VENT_*) ve kombi şablonu (ORIGIN_*) aynı çizgiyi kullanır
    VENT_X1: r1(o1.x), VENT_Y1: r1(o1.y), VENT_X2: r1(o2.x), VENT_Y2: r1(o2.y), VENT_CX: r1((o1.x + o2.x) / 2), VENT_CY: r1((o1.y + o2.y) / 2), VENT_LEN: r1(len), VENT_ANGLE: r1(angle),
    ORIGIN_X1: r1(o1.x), ORIGIN_Y1: r1(o1.y), ORIGIN_X2: r1(o2.x), ORIGIN_Y2: r1(o2.y), ORIGIN_CX: r1((o1.x + o2.x) / 2), ORIGIN_CY: r1((o1.y + o2.y) / 2), ORIGIN_LEN: r1(len), ORIGIN_ANGLE: r1(angle),
    LED_X: r1(led.x), LED_Y: r1(led.y), FLAME_X: r1(led.x), FLAME_Y: r1(led.y), GLOW_X: r1(glow.x), GLOW_Y: r1(glow.y),
    CHIPS_RIGHT: V.chipsRight != null ? V.chipsRight : Math.round(970 - U.left + 14),
    T_COLD: V.tCold != null ? V.tCold : 3, T_WARM: V.tWarm != null ? V.tWarm : 22,
    CTA_TEXT: V.ctaText || '', SUB_HTML: V.subHtml || '', CHIPS_HTML: V.chipsHtml || '',
  };

  let html = fs.readFileSync(path.join(root, V.template), 'utf8');
  const missing = new Set();
  html = html.replace(/\{\{([A-Z_0-9]+)\}\}/g, (m, k) => (k in vars ? String(vars[k]) : (missing.add(k), m)));
  if (missing.size) { console.error('Eksik değişkenler:', [...missing].join(', ')); process.exit(1); }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`✔ [${name}] ${path.relative(root, OUT)} (${kb} KB) – ürün: ${path.relative(root, imgFile)} ${iw}x${ih} → ${U.width}x${r1(uh)} @ (${U.left},${U.top}); çıkış (${r1(o1.x)},${r1(o1.y)})→(${r1(o2.x)},${r1(o2.y)}) ${r1(angle)}°; ışık (${r1(led.x)},${r1(led.y)})`);
}

const which = String(args.variant || 'klima');
(which === 'all' ? Object.keys(VARIANTS) : [which]).forEach(build);
