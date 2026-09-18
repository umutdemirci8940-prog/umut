#!/usr/bin/env node
'use strict';
/**
 * Daikin 970x250 masthead derleyicisi: şablonlara siteden çekilen gerçek logoyu (SVG, satır içi) ve ürün
 * fotoğrafını (WebP, base64) gömer; hava/ısı çıkış çizgisi ve ışık konumlarını hesaplar, tek dosyalık HTML üretir.
 *
 *   node tools/build-daikin.js [--variant=klima|kombi|kaydir-klima|kaydir-kombi|termostat-klima|termostat-kombi|all] [--out=<dosya>] [--png]
 *     --png: WebP yerine PNG gömer (eski tarayıcılar; dosya çok daha büyük)
 */
const fs = require('fs');
const path = require('path');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const root = path.join(__dirname, '..');
const LOGO = 'assets/daikin/logo/logo-1.svg';

/* ---- Çip ikonları ---- */
const ICON = {
  shield: '<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z"/><path d="m9 12 2 2 4-4"/>',
  quiet: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6"/>',
  leaf: '<path d="M5 21c0-8 4-13 14-16-1 10-6 14-14 16z"/><path d="M5 21c3-5 7-9 11-12"/>',
  wifi: '<path d="M2 9a16 16 0 0 1 20 0M5.5 12.5a11 11 0 0 1 13 0M9 16a5.5 5.5 0 0 1 6 0"/><circle cx="12" cy="19.5" r="1" fill="currentColor"/>',
};
const chipsHtml = (list) => list.map((c, i) => `<div class="chip${c.blue ? ' blue' : ''}" style="--i:${i + 1}"><svg viewBox="0 0 24 24">${ICON[c.icon]}</svg>${c.text}</div>`).join('');

/* ---- Ürünler: fotoğraf, oranlar (kırpılmış görsele göre 0–1), gerçek metinler ---- */
const PRODUCTS = {
  klima: {
    season: 'cool', assets: 'assets/daikin', image: 'unit-emura',
    origin: { x1: 0.142, y1: 0.912, x2: 0.706, y2: 0.802 },   // kanat (hava çıkışı) çizgisi
    led: { x: 0.817, y: 0.861 }, glow: { x: 0.817, y: 0.861 },
    tBefore: 34, tAfter: 22, dialMin: 18, dialMax: 34, dialBefore: 34,
    modeLabel: 'COOL', boostLabel: 'TURBO',
    unitAlt: 'Daikin Emura III duvar tipi klima', name: 'Emura III',
    beforeLine: 'Sıcak bunaltıyor mu?', beforeHint: 'Çizgiyi çek, serinliğe geç',
    hl: ['SERİNLİĞİ', 'YÜZÜNDE', 'HİSSET.'], hlDial: ['SERİNLİĞİ', 'SEN', 'AYARLA.'],
    sub: 'Yeni <b>Emura III</b>: fısıltı kadar sessiz, A+++ verimli, ödüllü tasarım.',
    subShort: 'Fısıltı kadar sessiz, A+++ verimli <b>Emura III</b>.',
    subDial: 'Kadranı çevir; <b>Emura III</b> odayı 22°’ye getirsin.',
    ctaText: 'Emura’yı Keşfet',
    chips: [{ blue: true, icon: 'shield', text: '10 yıl garanti' }, { icon: 'quiet', text: '19 dB(A) sessizlik' }, { icon: 'leaf', text: 'A+++ verimlilik' }],
    chipsShort: [{ blue: true, icon: 'shield', text: '10 yıl garanti' }, { icon: 'quiet', text: '19 dB(A) sessizlik' }],
    hintSlide: 'Çizgiyi sürükle, serinliği hisset', hintDial: 'Kadranı çevir, serinliği ayarla',
    clickUrl: 'https://www.daikin.com.tr/klimalar/bireysel-klimalar/emura-iii-klimalar?utm_source=masthead&utm_medium=display&utm_campaign=serinligi-yuzunde-hisset',
    titleBase: 'Daikin Emura III',
  },
  kombi: {
    season: 'warm', assets: 'assets/daikin-kombi', image: 'unit-kombi',
    origin: { x1: 0.06, y1: 0.975, x2: 0.77, y2: 0.92 },     // siyah panelin alt kenarı (sıcak hava çıkışı)
    led: { x: 0.357, y: 0.875 }, glow: { x: 0.357, y: 0.875 },   // paneldeki halka ışığı
    tBefore: 3, tAfter: 22, dialMin: 5, dialMax: 30, dialBefore: 5,
    modeLabel: 'HEAT', boostLabel: 'BOOST',
    unitAlt: 'Daikin NDJ Premix tam yoğuşmalı kombi', name: 'NDJ Premix',
    beforeLine: 'Soğuk mu bastırdı?', beforeHint: 'Çizgiyi çek, sıcaklığa geç',
    hl: ['SICAKLIĞI', 'EVİNDE', 'HİSSET.'], hlDial: ['SICAKLIĞI', 'SEN', 'AYARLA.'],
    sub: '<b>NDJ Premix</b> tam yoğuşmalı kombi: %109’a kadar verimlilik, sessiz, kompakt.',
    subShort: '%109’a kadar verimli <b>NDJ Premix</b> kombi.',
    subDial: 'Kadranı çevir; <b>NDJ Premix</b> evi 22°’ye ısıtsın.',
    ctaText: 'Kombileri Keşfet',
    chips: [{ blue: true, icon: 'leaf', text: '%109’a kadar verimlilik' }, { icon: 'quiet', text: 'Sessiz fan devri' }],
    chipsShort: [{ blue: true, icon: 'leaf', text: '%109 verimlilik' }, { icon: 'quiet', text: 'Sessiz fan' }],
    hintSlide: 'Çizgiyi sürükle, sıcaklığı hisset', hintDial: 'Kadranı çevir, sıcaklığı ayarla',
    clickUrl: 'https://www.daikin.com.tr/kombiler/tam-yogusmali-premix-ndj?utm_source=masthead&utm_medium=display&utm_campaign=sicakligi-evinde-hisset',
    titleBase: 'Daikin NDJ Premix Kombi',
  },
};

/* ---- Yerleşimler: ürün konumu (CSS px) ve şablon ---- */
const LAYOUTS = {
  main: {
    template: (p) => p === 'klima' ? 'src/daikin/masthead.html' : 'src/daikin/masthead-kombi.html',
    out: (p) => p === 'klima' ? 'index.html' : 'kombi/index.html',
    unit: { klima: { left: 575, top: -34, width: 400 }, kombi: { left: 784, top: -6, width: 180 } },
    title: (P) => `${P.titleBase} – ${P.hl.join(' ')} · 970×250 Masthead`,
  },
  kaydir: {
    template: () => 'src/daikin/alt-kaydir.html',
    out: (p) => `alt/kaydir/${p}/index.html`,
    unit: { klima: { left: 640, top: -10, width: 340 }, kombi: { left: 795, top: -4, width: 170 } },
    chipsLeft: { klima: 660, kombi: 535 }, afterTempLeft: { klima: 566, kombi: 690 },
    title: (P) => `${P.titleBase} – Kaydır ve Hisset · 970×250 Masthead`,
  },
  termostat: {
    template: () => 'src/daikin/alt-termostat.html',
    out: (p) => `alt/termostat/${p}/index.html`,
    unit: { klima: { left: 660, top: -8, width: 320 }, kombi: { left: 795, top: -4, width: 170 } },
    dial: { klima: { x: 545, y: 132 }, kombi: { x: 610, y: 128 } },
    chipsLeft: { klima: 660, kombi: 262 },
    title: (P) => `${P.titleBase} – Termostat · 970×250 Masthead`,
  },
};
const VARIANT_KEYS = ['klima', 'kombi', 'kaydir-klima', 'kaydir-kombi', 'termostat-klima', 'termostat-kombi'];

function logoSvg(){
  return fs.readFileSync(path.join(root, LOGO), 'utf8')
    .replace(/<\?xml[^>]*\?>/, '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<title>[\s\S]*?<\/title>/, '').replace(/<desc>[\s\S]*?<\/desc>/, '')
    .replace(/<svg\b([^>]*)>/, (m, attrs) => '<svg' + attrs.replace(/\s(width|height)="[^"]*"/g, '') + ' aria-hidden="true" focusable="false">')
    .replace(/\s+/g, ' ').trim();
}

function build(key){
  const [layoutName, productName] = key.includes('-') ? key.split('-') : ['main', key];
  const L = LAYOUTS[layoutName], P = PRODUCTS[productName];
  if (!L || !P) { console.error(`Bilinmeyen varyant: ${key} (${VARIANT_KEYS.join(' | ')} | all)`); process.exit(1); }
  const OUT = path.resolve(root, String(args.out || L.out(productName)));
  const A = path.join(root, P.assets);
  const meta = JSON.parse(fs.readFileSync(path.join(A, P.image + '.json'), 'utf8'));
  const imgFile = path.join(root, args.png ? meta.files.png : meta.files.webp);
  const unitSrc = `data:${args.png ? 'image/png' : 'image/webp'};base64,${fs.readFileSync(imgFile).toString('base64')}`;

  const [iw, ih] = meta.size;
  const U = L.unit[productName], uh = U.width * ih / iw;
  const px = (n) => ({ x: U.left + n.x * U.width, y: U.top + n.y * uh });
  const o1 = px({ x: P.origin.x1, y: P.origin.y1 }), o2 = px({ x: P.origin.x2, y: P.origin.y2 }), led = px(P.led), glow = px(P.glow || P.led);
  const len = Math.hypot(o2.x - o1.x, o2.y - o1.y), angle = Math.atan2(o2.y - o1.y, o2.x - o1.x) * 180 / Math.PI;
  const r1 = (n) => Math.round(n * 10) / 10;
  const isDial = layoutName === 'termostat', isSlide = layoutName === 'kaydir';
  const hl = isDial ? P.hlDial : P.hl;
  const vars = {
    TITLE: L.title(P), ARIA: `${P.titleBase} – ${hl.join(' ')} ${P.ctaText}`,
    SEASON: P.season, SEASON_CLASS: 's-' + P.season,
    UNIT_SRC: unitSrc, LOGO_SVG: logoSvg(), CLICK_URL: P.clickUrl, UNIT_ALT: P.unitAlt,
    UNIT_LEFT: U.left, UNIT_TOP: U.top, UNIT_W: U.width, UNIT_H: r1(uh),
    VENT_X1: r1(o1.x), VENT_Y1: r1(o1.y), VENT_X2: r1(o2.x), VENT_Y2: r1(o2.y), VENT_CX: r1((o1.x + o2.x) / 2), VENT_CY: r1((o1.y + o2.y) / 2), VENT_LEN: r1(len), VENT_ANGLE: r1(angle),
    ORIGIN_X1: r1(o1.x), ORIGIN_Y1: r1(o1.y), ORIGIN_X2: r1(o2.x), ORIGIN_Y2: r1(o2.y), ORIGIN_CX: r1((o1.x + o2.x) / 2), ORIGIN_CY: r1((o1.y + o2.y) / 2), ORIGIN_LEN: r1(len), ORIGIN_ANGLE: r1(angle),
    LED_X: r1(led.x), LED_Y: r1(led.y), FLAME_X: r1(led.x), FLAME_Y: r1(led.y), GLOW_X: r1(glow.x), GLOW_Y: r1(glow.y),
    CHIPS_RIGHT: Math.round(970 - U.left + 14), CHIPS_LEFT: L.chipsLeft ? L.chipsLeft[productName] : 0,
    AFTERTEMP_LEFT: L.afterTempLeft ? L.afterTempLeft[productName] : 0,
    DIAL_X: L.dial ? L.dial[productName].x : 0, DIAL_Y: L.dial ? L.dial[productName].y : 0,
    DIAL_MIN: P.dialMin, DIAL_MAX: P.dialMax,
    T_COLD: P.tBefore, T_WARM: P.tAfter, T_BEFORE: isDial ? P.dialBefore : P.tBefore, T_AFTER: P.tAfter,
    MODE_LABEL: P.modeLabel, BOOST_LABEL: P.boostLabel,
    BEFORE_LINE: P.beforeLine, BEFORE_HINT: P.beforeHint,
    HL1: hl[0], HL2: hl[1], HL3: hl[2],
    SUB_HTML: isDial ? P.subDial : isSlide ? P.subShort : P.sub,
    CTA_TEXT: P.ctaText,
    CHIPS_HTML: chipsHtml(layoutName === 'main' ? P.chips : P.chipsShort),
    HINT_TEXT: isDial ? P.hintDial : P.hintSlide,
  };

  let html = fs.readFileSync(path.join(root, L.template(productName)), 'utf8');
  const missing = new Set();
  html = html.replace(/\{\{([A-Z_0-9]+)\}\}/g, (m, k) => (k in vars ? String(vars[k]) : (missing.add(k), m)));
  if (missing.size) { console.error(`[${key}] Eksik değişkenler:`, [...missing].join(', ')); process.exit(1); }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  const kb = (fs.statSync(OUT).size / 1024).toFixed(1);
  console.log(`✔ [${key}] ${path.relative(root, OUT)} (${kb} KB) – ${path.relative(root, imgFile)} ${iw}x${ih} → ${U.width}x${r1(uh)} @ (${U.left},${U.top}); çıkış (${r1(o1.x)},${r1(o1.y)})→(${r1(o2.x)},${r1(o2.y)}); ışık (${r1(led.x)},${r1(led.y)})`);
}

const which = String(args.variant || 'klima');
(which === 'all' ? VARIANT_KEYS : which.split(',')).forEach(build);
