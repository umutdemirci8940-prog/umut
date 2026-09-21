#!/usr/bin/env node
'use strict';
/**
 * Türkiye Sigorta – 970x250 billboard üretici.
 *
 *  assets/pick.json  → hangi site görselinin hangi sahnede kullanılacağı (assets/site/… dosyaları, odak noktası),
 *                      logo dosyası ve beyaz plaka ayarı. Yoksa örnek (degrade) yer tutucularla derlenir.
 *  Görseller Chromium canvas ile hedef boyuta kırpılıp (cover + odak) JPEG olarak gömülür; logo SVG ise PNG'ye çevrilir.
 *
 * Kullanım: NODE_PATH=$(npm root -g) node build.js [--scale=1.5] [--quality=0.8]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const data = require('./src/data');
const { render, W, H } = require('./src/template');

const root = __dirname;
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const SCALE = +args.scale || 1.5;
const Q = +args.quality || 0.8;
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
const MIME = { svg: 'image/svg+xml', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', woff2: 'font/woff2' };
const uriOf = (f) => `data:${MIME[path.extname(f).slice(1).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(f).toString('base64')}`;
const pickPath = path.join(root, 'assets', 'pick.json');
const pick = fs.existsSync(pickPath) ? JSON.parse(fs.readFileSync(pickPath, 'utf8')) : null;
const resolveFile = (rel) => (rel ? [path.join(root, rel), path.join(root, 'assets', 'site', rel)].find(fs.existsSync) : null);

/* Tarayıcı içinde: kaynağı hedef kutuya "cover" kırpar (odak noktasıyla), JPEG/PNG data URI döndürür */
const CROP = async ({ src, w, h, fx, fy, type, q, zoom }) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('görsel yüklenemedi')); img.src = src; });
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  const s = Math.max(w / iw, h / ih) * (zoom || 1);
  const dw = iw * s, dh = ih * s;
  const dx = (w - dw) * (fx == null ? .5 : fx), dy = (h - dh) * (fy == null ? .5 : fy);
  ctx.drawImage(img, dx, dy, dw, dh);
  return c.toDataURL(type === 'png' ? 'image/png' : 'image/jpeg', q);
};
/* Logo: içeriğe göre kırpıp (şeffaf boşluk) en fazla w×h kutusuna sığdırır, PNG döndürür */
const LOGO = async ({ src, w, h }) => {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('logo yüklenemedi')); img.src = src; });
  let iw = img.naturalWidth || img.width || 400, ih = img.naturalHeight || img.height || 120;
  // SVG'ler çok küçük olabilir: önce büyük çiz
  const pre = Math.max(1, 1600 / Math.max(iw, ih));
  const c0 = document.createElement('canvas'); c0.width = Math.round(iw * pre); c0.height = Math.round(ih * pre);
  const x0 = c0.getContext('2d', { willReadFrequently: true }); x0.imageSmoothingQuality = 'high'; x0.drawImage(img, 0, 0, c0.width, c0.height);
  const d = x0.getImageData(0, 0, c0.width, c0.height).data;
  let minx = c0.width, miny = c0.height, maxx = -1, maxy = -1;
  for (let y = 0; y < c0.height; y++) for (let x = 0; x < c0.width; x++) { if (d[(y * c0.width + x) * 4 + 3] > 8) { if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; } }
  if (maxx < 0) { minx = 0; miny = 0; maxx = c0.width - 1; maxy = c0.height - 1; }
  const cw = maxx - minx + 1, ch = maxy - miny + 1;
  const s = Math.min(w / cw, h / ch);
  const c = document.createElement('canvas'); c.width = Math.round(cw * s); c.height = Math.round(ch * s);
  const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(c0, minx, miny, cw, ch, 0, 0, c.width, c.height);
  return { uri: c.toDataURL('image/png'), w: c.width, h: c.height };
};
const PLACEHOLDER = async ({ w, h, a, b, label }) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) { ctx.beginPath(); ctx.arc(Math.random() * w, Math.random() * h, 10 + Math.random() * 90, 0, 7); ctx.fillStyle = `rgba(255,255,255,${(Math.random() * .08).toFixed(3)})`; ctx.fill(); }
  ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.font = `bold ${Math.round(h / 8)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(label, w / 2, h / 2);
  return c.toDataURL('image/jpeg', .7);
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.setContent('<!doctype html><title>x</title>');
  const assets = { logo: null, hero: null, scenes: {}, fonts: {} };
  const report = [];

  // Fontlar
  const fontDir = path.join(root, 'assets', 'fonts');
  assets.fonts.latin = uriOf(path.join(fontDir, 'Manrope-subset-latin.woff2'));
  assets.fonts.ext = uriOf(path.join(fontDir, 'Manrope-subset-ext.woff2'));

  // Logo
  // SVG logoyu önce gerçek boyutta PNG'ye çevir (iç boyutu olmayan SVG'ler canvas'a çizilemez)
  async function logoSource(file) {
    if (!/\.svg$/i.test(file)) return uriOf(file);
    const lp = await ctx.newPage();
    await lp.setContent(`<!doctype html><body style="margin:0;background:transparent"><img id="l" src="${uriOf(file)}" style="display:block;width:1400px;height:auto"></body>`);
    await lp.waitForLoadState('load'); await lp.waitForTimeout(200);
    const buf = await lp.locator('#l').screenshot({ omitBackground: true, type: 'png' });
    await lp.close();
    return 'data:image/png;base64,' + buf.toString('base64');
  }
  const logoFile = pick && resolveFile(pick.logo && pick.logo.file);
  if (logoFile) {
    const r = await page.evaluate(LOGO, { src: await logoSource(logoFile), w: 460, h: 150 });
    assets.logo = { uri: r.uri, w: r.w, h: r.h, plate: !!(pick.logo.plate) };
    report.push(`logo: ${path.relative(root, logoFile)} → ${r.w}x${r.h} png${pick.logo.plate ? ' (beyaz plaka)' : ''}`);
  } else {
    const r = await page.evaluate(LOGO, { src: uriOf(path.join(root, 'assets', 'logo.png')), w: 460, h: 150 });
    assets.logo = { uri: r.uri, w: r.w, h: r.h, plate: false }; report.push('logo: assets/logo.png (yer tutucu – pick.json yok)');
  }

  // Sahne fotoğrafları
  const SW = Math.round(378 * SCALE), SH = Math.round(H * SCALE);
  const pal = [['#0b5f70', '#1fb6c1'], ['#0a3d4e', '#0e7c8c'], ['#12707e', '#5ee6e9'], ['#083a4b', '#1fb6c1'], ['#0c4f5e', '#9ff0f2']];
  for (const [i, s] of data.scenes.entries()) {
    const p = pick && pick.scenes && pick.scenes[s.key];
    const f = p && resolveFile(p.file);
    if (f) {
      const uri = await page.evaluate(CROP, { src: uriOf(f), w: SW, h: SH, fx: p.fx, fy: p.fy, zoom: p.zoom, type: 'jpg', q: Q });
      assets.scenes[s.key] = { uri }; report.push(`${s.key}: ${path.relative(root, f)} → ${SW}x${SH} (${kb(uri.length * .75)})`);
    } else {
      assets.scenes[s.key] = { uri: await page.evaluate(PLACEHOLDER, { w: SW, h: SH, a: pal[i % pal.length][0], b: pal[i % pal.length][1], label: s.kicker }) };
      report.push(`${s.key}: yer tutucu`);
    }
  }
  // Açılış fotoğrafı
  const hp = pick && pick.hero; const hf = hp && resolveFile(hp.file);
  if (hf) { const uri = await page.evaluate(CROP, { src: uriOf(hf), w: Math.round(W * SCALE), h: SH, fx: hp.fx, fy: hp.fy, zoom: hp.zoom, type: 'jpg', q: Q }); assets.hero = { uri }; report.push(`hero: ${path.relative(root, hf)} (${kb(uri.length * .75)})`); }
  else assets.hero = { uri: await page.evaluate(PLACEHOLDER, { w: Math.round(W * SCALE), h: SH, a: '#062a38', b: '#0e7c8c', label: '' }) };

  const html = render(data, assets);
  const out = path.join(root, 'index.html');
  fs.writeFileSync(out, html);
  report.forEach((l) => console.log('  ' + l));
  console.log(`✔ index.html ${kb(Buffer.byteLength(html))}`);

  // Önizleme kareleri
  const prev = path.join(root, 'preview'); fs.mkdirSync(prev, { recursive: true });
  const errors = [];
  const p2 = await ctx.newPage();
  p2.on('pageerror', (e) => errors.push(e.message)); p2.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p2.goto('file://' + out); await p2.evaluate(() => document.fonts.ready);
  const T = data.timing; const n = data.scenes.length;
  const moments = [['intro', 1500], ['scene1', T.intro + 1500], ['scene2', T.intro + T.slide + 1500], ['scene4', T.intro + 3 * T.slide + 1500], ['outro', T.intro + n * T.slide + 1600]];
  let t = 0;
  for (const [name, at] of moments) { await p2.waitForTimeout(at - t); t = at; await p2.screenshot({ path: path.join(prev, `${name}.png`), clip: { x: 0, y: 0, width: W, height: H } }); }
  // hover kare
  await p2.reload(); await p2.evaluate(() => document.fonts.ready); await p2.waitForTimeout(T.intro + 1200); await p2.mouse.move(700, 120); await p2.waitForTimeout(500);
  await p2.screenshot({ path: path.join(prev, 'hover.png'), clip: { x: 0, y: 0, width: W, height: H } });
  const ctx1 = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p1 = await ctx1.newPage(); await p1.goto('file://' + out); await p1.evaluate(() => document.fonts.ready); await p1.waitForTimeout(T.intro + 1500);
  await p1.screenshot({ path: path.join(root, 'banner-970x250.jpg'), type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: W, height: H } });
  console.log(`✔ preview/*.png, banner-970x250.jpg${errors.length ? '\n⚠ konsol: ' + errors.join(' | ') : ''}`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
