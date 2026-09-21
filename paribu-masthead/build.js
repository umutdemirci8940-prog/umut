#!/usr/bin/env node
'use strict';
/**
 * Paribu 970×250 interaktif masthead derleyicisi.
 *   dist/970x250/index.html            – reklam ağına yüklenecek tek dosya
 *   dist/zip/paribu-masthead-970x250.zip
 *
 * Kullanım: node build.js [--no-embed-fonts] [--placeholder-logo] [--no-campaign]
 *  - assets/manifest.json varsa (tools/fetch-assets.js üretir) sitedeki gerçek logo/sembol ve renkler kullanılır.
 *  - Yoksa yer tutucu (vektör) logo ile derlenir.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('./src/data');
const { render, SIZE } = require('./src/template');

const root = __dirname;
const args = new Set(process.argv.slice(2));
const dist = path.join(root, 'dist');
const out = path.join(dist, '970x250');
const zipDir = path.join(dist, 'zip');
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(zipDir, { recursive: true });

const MIME = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', woff2: 'font/woff2' };
const extOf = (f) => path.extname(f).slice(1).toLowerCase();
function dataUri(file) {
  const buf = fs.readFileSync(file); const ext = extOf(file);
  if (ext === 'svg') {
    const svg = buf.toString('utf8').replace(/<\?xml[^>]*>/, '').replace(/<!--[\s\S]*?-->/g, '').replace(/\s+/g, ' ').replace(/> </g, '><').trim();
    return { uri: 'data:image/svg+xml;utf8,' + encodeURIComponent(svg).replace(/%20/g, ' ').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%22/g, "'"), bytes: buf.length, svg };
  }
  return { uri: `data:${MIME[ext] || 'application/octet-stream'};base64,${buf.toString('base64')}`, bytes: buf.length };
}
function imageSize(buf, ext) {
  try {
    if (ext === 'png' && buf.readUInt32BE(12) === 0x49484452) return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    if (ext === 'webp' && buf.toString('ascii', 0, 4) === 'RIFF') {
      const t = buf.toString('ascii', 12, 16);
      if (t === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3) };
      if (t === 'VP8L') { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3FFF), h: 1 + ((b >> 14) & 0x3FFF) }; }
      if (t === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3FFF, h: buf.readUInt16LE(28) & 0x3FFF };
    }
    if (ext === 'svg') {
      const t = buf.toString('utf8', 0, 4000);
      const vb = t.match(/viewBox="([\d.\s,-]+)"/);
      if (vb) { const v = vb[1].trim().split(/[\s,]+/).map(Number); return { w: v[2], h: v[3] }; }
      const w = t.match(/\bwidth="([\d.]+)/), h = t.match(/\bheight="([\d.]+)/);
      if (w && h) return { w: +w[1], h: +h[1] };
    }
  } catch { /* boyut okunamadı */ }
  return null;
}
/** Koyu zemin için: SVG'deki koyu/nötr dolguları beyaza çevirir, renkli (marka yeşili vb.) dolgulara dokunmaz. */
function whitenSvg(svg) {
  const lum = (hex) => { let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); const r = n >> 16, g = (n >> 8) & 255, b = n & 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return { l: (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255, s: mx === 0 ? 0 : (mx - mn) / mx }; };
  const dark = (hex) => { const { l, s } = lum(hex); return l < 0.42 && s < 0.35; };
  return svg
    .replace(/(fill|stroke)="(#[0-9a-fA-F]{3,6})"/g, (m, k, hex) => dark(hex) ? `${k}="#ffffff"` : m)
    .replace(/(fill|stroke):\s*(#[0-9a-fA-F]{3,6})/g, (m, k, hex) => dark(hex) ? `${k}:#ffffff` : m)
    .replace(/(fill|stroke)="(black|#000)"/gi, '$1="#ffffff"')
    .replace(/(fill|stroke):\s*black/gi, '$1:#ffffff');
}


/** SVG path d → yaklaşık sınır kutusu (kontrol noktaları dâhil; M L H V C S Q T Z, mutlak/göreli). */
function pathBBox(d) {
  const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [];
  let cmd = '', i = 0, x = 0, y = 0, sx = 0, sy = 0, minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const pt = (px, py) => { if (px < minX) minX = px; if (px > maxX) maxX = px; if (py < minY) minY = py; if (py > maxY) maxY = py; };
  const num = () => parseFloat(tok[i++]);
  while (i < tok.length) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase(); const C = cmd.toUpperCase();
    if (C === 'Z') { x = sx; y = sy; continue; }
    if (C === 'H') { const v = num(); x = rel ? x + v : v; pt(x, y); continue; }
    if (C === 'V') { const v = num(); y = rel ? y + v : v; pt(x, y); continue; }
    const n = C === 'C' ? 3 : (C === 'S' || C === 'Q') ? 2 : 1;
    if (C === 'A') { i += 5; const ex = num(), ey = num(); x = rel ? x + ex : ex; y = rel ? y + ey : ey; pt(x, y); continue; }
    for (let k = 0; k < n; k++) { const px = num(), py = num(); if (isNaN(px) || isNaN(py)) { i = tok.length; break; } const ax = rel ? x + px : px, ay = rel ? y + py : py; pt(ax, ay); if (k === n - 1) { x = ax; y = ay; } }
    if (C === 'M') { sx = x; sy = y; cmd = rel ? 'l' : 'L'; }
  }
  return isFinite(minX) ? { x: minX, y: minY, w: maxX - minX, h: maxY - minY } : null;
}
/** Kelime markası SVG'sinin ilk glifinden (ör. "P") beyaz sembol üretir – cüzdan üzerindeki işaret. */
function glyphFromWordmark(svg) {
  const paths = [...svg.matchAll(/<path[^>]*\sd="([^"]+)"[^>]*>/g)].map((m) => m[1]);
  if (paths.length < 2) return null;
  const bb = pathBBox(paths[0]); if (!bb || bb.w < 4 || bb.h < 4) return null;
  const pad = Math.max(bb.w, bb.h) * 0.04;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(bb.x - pad).toFixed(2)} ${(bb.y - pad).toFixed(2)} ${(bb.w + 2 * pad).toFixed(2)} ${(bb.h + 2 * pad).toFixed(2)}"><path d="${paths[0]}" fill="#ffffff"/></svg>`;
}
/** Logodaki baskın doygun dolgu rengi (marka rengi). */
function dominantFill(svg) {
  const count = {};
  for (const m of svg.matchAll(/(?:fill|stroke)[=:]\s*"?(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})\b/g)) { let h = m[1].toLowerCase(); if (h.length === 4) h = '#' + h.slice(1).split('').map((c) => c + c).join(''); count[h] = (count[h] || 0) + 1; }
  const sat = (h) => { const n = parseInt(h.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx ? (mx - mn) / mx : 0; };
  return Object.keys(count).filter((h) => sat(h) > 0.35).sort((a, b) => count[b] - count[a])[0] || null;
}
function mix(hex, pct) { const n = parseInt(hex.slice(1), 16); const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct / 100) * (pct > 0 ? 255 - c : c)))); return '#' + ((1 << 24) + (f(n >> 16) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1); }

/* ---------- varlıklar ---------- */
const assets = { coins: {}, fonts: null, logo: null, symbol: null, colors: null };

for (const c of data.coins) {
  const f = path.join(root, 'assets', 'coins', `${c.key}.svg`);
  if (fs.existsSync(f)) assets.coins[c.key] = dataUri(f).uri;
  else console.log(`⚠ coin ikonu yok: assets/coins/${c.key}.svg`);
}

if (data.fonts.embed && !args.has('--no-embed-fonts')) {
  const fj = path.join(root, 'assets', 'fonts', 'fonts.json');
  if (fs.existsSync(fj)) {
    assets.fonts = JSON.parse(fs.readFileSync(fj, 'utf8')).map((f) => Object.assign({}, f, { uri: dataUri(path.join(root, 'assets', 'fonts', f.file)).uri }));
  } else console.log('⚠ assets/fonts/fonts.json yok; Google Fonts bağlantısı kullanılacak');
} else data.fonts.embed = false;

const mf = path.join(root, 'assets', 'manifest.json');
let manifest = null;
if (fs.existsSync(mf) && !args.has('--placeholder-logo')) {
  manifest = JSON.parse(fs.readFileSync(mf, 'utf8'));
  const pick = (entry) => {
    if (!entry) return null;
    const rel = entry.white || entry.optimized || entry.file; if (!rel) return null;
    const f = path.join(root, rel); if (!fs.existsSync(f)) { console.log(`⚠ manifest dosyası yok: ${rel}`); return null; }
    const ext = extOf(f); let d = dataUri(f);
    if (ext === 'svg' && entry.dark && !entry.white) { const w = whitenSvg(d.svg); d = { uri: 'data:image/svg+xml;utf8,' + encodeURIComponent(w).replace(/%20/g, ' ').replace(/%3D/g, '=').replace(/%3A/g, ':').replace(/%2F/g, '/').replace(/%22/g, "'"), bytes: Buffer.byteLength(w) }; }
    const dim = imageSize(fs.readFileSync(f), ext);
    return { uri: d.uri, bytes: d.bytes, aspect: dim && dim.h ? dim.w / dim.h : null, kind: entry.kind || 'wordmark', file: rel };
  };
  assets.logo = pick(manifest.logo);
  assets.symbol = pick(manifest.symbol);
  // Sembol: kelime markası SVG ise ilk glifi (beyaz) cüzdan işareti olarak türet; --icon-symbol ile sitenin uygulama ikonu kullanılır
  const logoSvg = assets.logo && extOf(assets.logo.file) === 'svg' ? fs.readFileSync(path.join(root, assets.logo.file), 'utf8') : null;
  if (logoSvg && !args.has('--icon-symbol')) {
    const g = glyphFromWordmark(logoSvg);
    if (g) {
      const gf = path.join(root, 'assets', 'logo', 'symbol-glyph.svg'); fs.writeFileSync(gf, g);
      assets.symbol = { uri: dataUri(gf).uri, bytes: Buffer.byteLength(g), aspect: 1, kind: 'glyph', file: 'assets/logo/symbol-glyph.svg (kelime markasının ilk harfi)' };
    }
  }
  // Marka rengi: önce logonun dolgusu, sonra manifest.colors.brand; --data-colors ile data.js
  if (!args.has('--data-colors')) {
    const fromLogo = logoSvg ? dominantFill(logoSvg) : null;
    const brand = fromLogo || (manifest.colors && manifest.colors.brand) || null;
    if (brand) { assets.colors = { brand, brandDark: mix(brand, -40) }; assets.colors.source = fromLogo ? 'logo' : 'manifest'; }
    if (!fromLogo && manifest.colors && manifest.colors.brand2) assets.colors.brand2 = manifest.colors.brand2;
  }
}
if (args.has('--no-campaign')) data.campaign.enabled = false;

console.log(`Logo: ${assets.logo ? `SİTEDEN (${assets.logo.file}, ${(assets.logo.bytes / 1024).toFixed(1)} KB)` : 'YER TUTUCU (assets/manifest.json yok → tools/fetch-assets.js / GitHub Actions)'}`);
console.log(`Sembol: ${assets.symbol ? assets.symbol.file : 'yok (cüzdanda baş harf)'}  ·  Renk: ${assets.colors ? assets.colors.brand + ' (' + (assets.colors.source === 'logo' ? 'logodan' : 'siteden') + ')' : 'data.js ' + data.colors.brand}  ·  Font: ${data.fonts.embed ? 'gömülü Sora' : 'Google Fonts'}`);

/* ---------- derleme ---------- */
const html = render(data, assets);
fs.writeFileSync(path.join(out, 'index.html'), html);
const kb = Buffer.byteLength(html) / 1024;
let zipNote = '';
try {
  execSync('zip -v', { stdio: 'ignore' });
  const zipPath = path.join(zipDir, 'paribu-masthead-970x250.zip');
  fs.rmSync(zipPath, { force: true });
  execSync(`zip -q -j "${zipPath}" "${path.join(out, 'index.html')}"`);
  zipNote = ` → ${path.relative(root, zipPath)} (${(fs.statSync(zipPath).size / 1024).toFixed(0)} KB)`;
} catch { zipNote = '  (zip yok; paket atlandı)'; }
console.log(`✔ 970x250  ${SIZE.label}  ${kb.toFixed(1)} KB${zipNote}`);
if (kb > 200) console.log('  ℹ 200 KB üstü: bazı ağlar standart display için 150–200 KB ister; rich media/masthead sınırları genelde daha yüksektir (yayıncıyla teyit edin).');
