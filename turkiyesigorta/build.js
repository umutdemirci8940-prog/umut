#!/usr/bin/env node
'use strict';
/**
 * Türkiye Sigorta – 970x250 billboard üretici (sitenin gerçek logo ve görselleriyle).
 *
 *  assets/pick.json → logo / beyaz logo / iki markalı logo / amblem / filigran dosyaları ve
 *                     sahne görselleri (assets/site/… veya assets/brand/…), odak ve sığdırma ayarları.
 *  Görseller Chromium canvas ile hedef boyuta getirilip (contain: şeffaf boşluk kırpma; cover: odaklı kırpma)
 *  base64 gömülür; SVG'ler PNG'ye çevrilir (teslimde vektör yoktur). Arka plan src/bg.html'den JPEG olarak üretilir.
 *
 * Kullanım: NODE_PATH=$(npm root -g) node build.js [--scale=2] [--quality=0.82]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const data = require('./src/data');
const { render, W, H } = require('./src/template');

const root = __dirname;
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const SCALE = +args.scale || 2;
const Q = +args.quality || 0.82;
const kb = (n) => (n / 1024).toFixed(1) + ' KB';
const MIME = { svg: 'image/svg+xml', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', woff2: 'font/woff2', woff: 'font/woff' };
const uriOf = (f) => `data:${MIME[path.extname(f).slice(1).toLowerCase()] || 'application/octet-stream'};base64,${fs.readFileSync(f).toString('base64')}`;
const pickPath = path.join(root, 'assets', 'pick.json');
const pick = fs.existsSync(pickPath) ? JSON.parse(fs.readFileSync(pickPath, 'utf8')) : {};
const resolveFile = (rel) => (rel ? [path.join(root, rel), path.join(root, 'assets', 'site', rel)].find(fs.existsSync) : null);
const b64len = (uri) => Math.round((uri.length - uri.indexOf(',') - 1) * 0.75);

/* --- tarayıcı içi işlemler --- */
const COVER = async ({ src, w, h, fx, fy, q, zoom, type }) => {
  const img = new Image(); await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('görsel yüklenemedi')); img.src = src; });
  const iw = img.naturalWidth, ih = img.naturalHeight;
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  const s = Math.max(w / iw, h / ih) * (zoom || 1); const dw = iw * s, dh = ih * s;
  ctx.drawImage(img, (w - dw) * (fx == null ? .5 : fx), (h - dh) * (fy == null ? .5 : fy), dw, dh);
  return c.toDataURL(type === 'png' ? 'image/png' : 'image/jpeg', q);
};
/* Şeffaf boşlukları kırpar (isteğe bağlı beyaz zemini şeffaflaştırır), w×h kutusuna sığdırır; PNG döndürür */
const CONTAIN = async ({ src, w, h, keyWhite, pad, noUpscale, fmt, q }) => {
  const img = new Image(); await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('görsel yüklenemedi')); img.src = src; });
  let iw = img.naturalWidth || 800, ih = img.naturalHeight || 600;
  const pre = Math.min(1, 1800 / Math.max(iw, ih)); const c0 = document.createElement('canvas'); c0.width = Math.round(iw * pre); c0.height = Math.round(ih * pre);
  const x0 = c0.getContext('2d', { willReadFrequently: true }); x0.imageSmoothingQuality = 'high'; x0.drawImage(img, 0, 0, c0.width, c0.height);
  const id = x0.getImageData(0, 0, c0.width, c0.height), d = id.data;
  if (keyWhite) { for (let i = 0; i < d.length; i += 4) { const m = Math.min(d[i], d[i + 1], d[i + 2]); if (m > 236) { const a = Math.round(Math.max(0, (255 - m) / 19) * 255); d[i + 3] = Math.min(d[i + 3], a); } } x0.putImageData(id, 0, 0); }
  let minx = c0.width, miny = c0.height, maxx = -1, maxy = -1;
  for (let y = 0; y < c0.height; y++) for (let x = 0; x < c0.width; x++) { if (d[(y * c0.width + x) * 4 + 3] > 10) { if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; } }
  if (maxx < 0) { minx = 0; miny = 0; maxx = c0.width - 1; maxy = c0.height - 1; }
  const cw = maxx - minx + 1, ch = maxy - miny + 1; const p = pad || 0;
  let s = Math.min((w - 2 * p) / cw, (h - 2 * p) / ch); if (noUpscale) s = Math.min(s, 1);
  const c = document.createElement('canvas'); c.width = Math.round(cw * s) + 2 * p; c.height = Math.round(ch * s) + 2 * p;
  const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high'; ctx.drawImage(c0, minx, miny, cw, ch, p, p, Math.round(cw * s), Math.round(ch * s));
  return { uri: fmt === 'webp' ? c.toDataURL('image/webp', q || .86) : c.toDataURL('image/png'), w: c.width, h: c.height };
};
const CIRCLE = async ({ src, d, fx, fy, zoom, ring, fmt, q }) => {
  const img = new Image(); await new Promise((res, rej) => { img.onload = res; img.onerror = () => rej(new Error('görsel yüklenemedi')); img.src = src; });
  const iw = img.naturalWidth, ih = img.naturalHeight; const c = document.createElement('canvas'); c.width = d; c.height = d; const ctx = c.getContext('2d'); ctx.imageSmoothingQuality = 'high';
  const r = d / 2 - 6; ctx.save(); ctx.beginPath(); ctx.arc(d / 2, d / 2, r, 0, Math.PI * 2); ctx.clip();
  const s = Math.max((2 * r) / iw, (2 * r) / ih) * (zoom || 1); const dw = iw * s, dh = ih * s;
  ctx.drawImage(img, (d - dw) * (fx == null ? .5 : fx), (d - dh) * (fy == null ? .5 : fy), dw, dh); ctx.restore();
  if (ring) { ctx.beginPath(); ctx.arc(d / 2, d / 2, r + 3, 0, Math.PI * 2); ctx.lineWidth = 6; ctx.strokeStyle = ring; ctx.stroke(); }
  return { uri: fmt === 'webp' ? c.toDataURL('image/webp', q || .86) : c.toDataURL('image/png'), w: d, h: d };
};
const PLACEHOLDER = async ({ w, h, a, b, label }) => {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const ctx = c.getContext('2d');
  ctx.beginPath(); ctx.arc(w * .5, h * .5, Math.min(w, h) * .46, 0, 7); ctx.fillStyle = a; ctx.fill();
  ctx.beginPath(); ctx.arc(w * .42, h * .58, Math.min(w, h) * .3, 0, 7); ctx.fillStyle = b; ctx.fill();
  ctx.fillStyle = 'rgba(10,20,90,.45)'; ctx.font = `bold ${Math.round(h / 10)}px sans-serif`; ctx.textAlign = 'center'; ctx.fillText(label, w / 2, h / 2);
  return c.toDataURL('image/png');
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const page = await ctx.newPage(); await page.setContent('<!doctype html><title>x</title>');
  const report = [];
  const assets = { fonts: {}, scenes: {} };

  // SVG → PNG (iç boyutu olmayan SVG'ler canvas'a çizilemez): büyük çizip ekran görüntüsü
  async function rasterSource(file, width = 1600) {
    if (!/\.svg$/i.test(file)) return uriOf(file);
    const lp = await ctx.newPage();
    await lp.setContent(`<!doctype html><body style="margin:0;background:transparent"><img id="l" src="${uriOf(file)}" style="display:block;width:${width}px;height:auto"></body>`);
    await lp.waitForLoadState('load'); await lp.waitForTimeout(150);
    const buf = await lp.locator('#l').screenshot({ omitBackground: true, type: 'png' }); await lp.close();
    return 'data:image/png;base64,' + buf.toString('base64');
  }
  const fitFile = async (key, box, opt = {}) => {
    const f = resolveFile(pick[key] && pick[key].file); if (!f) return null;
    const r = await page.evaluate(CONTAIN, { src: await rasterSource(f), w: box[0], h: box[1], keyWhite: opt.keyWhite, pad: opt.pad });
    report.push(`${key}: ${path.relative(root, f)} → ${r.w}x${r.h} png (${kb(b64len(r.uri))})`); return r;
  };

  // Fontlar: site fontu (Avenir) varsa o, yoksa Manrope alt kümesi
  const fontDir = path.join(root, 'assets', 'fonts');
  const avenir = ['book', 'medium', 'heavy'].map((wgt) => ({ wgt, f: [path.join(fontDir, `avenir-${wgt}.woff2`), path.join(fontDir, `avenir-${wgt}.woff`)].find(fs.existsSync) })).filter((x) => x.f);
  if (avenir.length >= 2) {
    const wmap = { book: '100 500', medium: '600 700', heavy: '800 900' };
    assets.fonts.css = avenir.map((x) => `@font-face{font-family:'Avenir';font-style:normal;font-weight:${wmap[x.wgt]};font-display:block;src:url(${uriOf(x.f)}) format('${x.f.endsWith('woff2') ? 'woff2' : 'woff'}')}`).join('\n');
    assets.fonts.family = "'Avenir'"; report.push(`font: Avenir (${avenir.map((x) => x.wgt).join(', ')}) – siteden`);
  } else {
    assets.fonts.css = `@font-face{font-family:'Manrope';font-style:normal;font-weight:200 800;font-display:block;src:url(${uriOf(path.join(fontDir, 'Manrope-subset-latin.woff2'))}) format('woff2');unicode-range:U+0000-00FF,U+0131,U+2000-206F}\n@font-face{font-family:'Manrope';font-style:normal;font-weight:200 800;font-display:block;src:url(${uriOf(path.join(fontDir, 'Manrope-subset-ext.woff2'))}) format('woff2');unicode-range:U+0100-024F}`;
    assets.fonts.family = "'Manrope'"; report.push('font: Manrope (site fontu bulunamadı)');
  }

  // Logolar
  assets.logo = await fitFile('logo', [600, 80]);
  assets.logoWhite = await fitFile('logoWhite', [600, 80]);
  assets.lockup = await fitFile('lockup', [760, 90]);
  assets.emblem = await fitFile('emblem', [64, 64]);
  if (!assets.logo) throw new Error('pick.json → logo gerekli');

  // Arka plan (filigran dahil) → JPEG
  const swooshFile = resolveFile(pick.swoosh && pick.swoosh.file);
  const bgHtml = fs.readFileSync(path.join(root, 'src', 'bg.html'), 'utf8').replace('__SWOOSH__', swooshFile ? uriOf(swooshFile) : '');
  const bp = await ctx.newPage(); await bp.setContent(bgHtml); await bp.waitForTimeout(150);
  const bgBuf = await bp.screenshot({ type: 'jpeg', quality: 86, clip: { x: 0, y: 0, width: W, height: H } }); await bp.close();
  assets.bg = { uri: 'data:image/jpeg;base64,' + bgBuf.toString('base64') }; report.push(`bg: src/bg.html → jpeg (${kb(bgBuf.length)})`);

  // Sahne görselleri
  const SW = Math.round(352 * SCALE), SH = Math.round(238 * SCALE);
  const pal = [['#f6c9c9', '#b0e6f1'], ['#b0e6f1', '#f6c9c9'], ['#f6c9c9', '#8adaea'], ['#e6f7fb', '#f6c9c9'], ['#f6c9c9', '#b0e6f1']];
  for (const [i, s] of data.scenes.entries()) {
    const p = (pick.scenes || {})[s.key]; const f = p && resolveFile(p.file);
    if (f) {
      if (p.mode === 'circle') { assets.scenes[s.key] = await page.evaluate(CIRCLE, { src: await rasterSource(f), d: SH, fx: p.fx, fy: p.fy, zoom: p.zoom, ring: '#b0e6f1', fmt: 'webp', q: Q }); }
      else if (p.mode === 'cover') { const uri = await page.evaluate(COVER, { src: await rasterSource(f), w: SW, h: SH, fx: p.fx, fy: p.fy, zoom: p.zoom, q: Q, type: 'png' }); assets.scenes[s.key] = { uri }; }
      else { const r = await page.evaluate(CONTAIN, { src: await rasterSource(f), w: SW, h: SH, keyWhite: !!p.keyWhite, noUpscale: true, fmt: 'webp', q: Q }); assets.scenes[s.key] = r; }
      report.push(`${s.key}: ${path.relative(root, f)} (${kb(b64len(assets.scenes[s.key].uri))})`);
    } else { assets.scenes[s.key] = { uri: await page.evaluate(PLACEHOLDER, { w: SW, h: SH, a: pal[i][0], b: pal[i][1], label: s.kicker }) }; report.push(`${s.key}: yer tutucu`); }
  }
  const of = pick.outro && resolveFile(pick.outro.file);
  assets.hero = of ? await page.evaluate(CONTAIN, { src: await rasterSource(of), w: Math.round(340 * SCALE), h: Math.round(240 * SCALE), keyWhite: !!pick.outro.keyWhite, noUpscale: true, fmt: 'webp', q: Q }) : assets.scenes[data.scenes[data.scenes.length - 1].key];

  const html = render(data, assets);
  const out = path.join(root, 'index.html'); fs.writeFileSync(out, html);
  report.forEach((l) => console.log('  ' + l));
  console.log(`✔ index.html ${kb(Buffer.byteLength(html))}`);

  // Önizleme kareleri
  const prev = path.join(root, 'preview'); fs.mkdirSync(prev, { recursive: true });
  const errors = []; const p2 = await ctx.newPage();
  p2.on('pageerror', (e) => errors.push(e.message)); p2.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await p2.goto('file://' + out); await p2.evaluate(() => document.fonts.ready);
  const T = data.timing, n = data.scenes.length;
  const moments = [['intro', 1500], ['scene1', T.intro + 1500], ['scene2', T.intro + T.slide + 1500], ['scene3', T.intro + 2 * T.slide + 1500], ['scene4', T.intro + 3 * T.slide + 1500], ['scene5', T.intro + 4 * T.slide + 1500], ['outro', T.intro + n * T.slide + 1600]];
  let t = 0; for (const [name, at] of moments) { await p2.waitForTimeout(at - t); t = at; await p2.screenshot({ path: path.join(prev, `${name}.png`), clip: { x: 0, y: 0, width: W, height: H } }); }
  await p2.reload(); await p2.evaluate(() => document.fonts.ready); await p2.waitForTimeout(T.intro + 1200); await p2.mouse.move(700, 120); await p2.waitForTimeout(500);
  await p2.screenshot({ path: path.join(prev, 'hover.png'), clip: { x: 0, y: 0, width: W, height: H } });
  const ctx1 = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p1 = await ctx1.newPage(); await p1.goto('file://' + out); await p1.evaluate(() => document.fonts.ready); await p1.waitForTimeout(T.intro + 1500);
  await p1.screenshot({ path: path.join(root, 'banner-970x250.jpg'), type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: W, height: H } });
  console.log(`✔ preview/*.png, banner-970x250.jpg${errors.length ? '\n⚠ konsol: ' + errors.join(' | ') : ''}`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
