#!/usr/bin/env node
'use strict';
/**
 * KFC Türkiye 970x250 bannerını derler.
 *   node build-kfc.js            → dist/kfc-970x250/index.html (varlıklar base64 gömülü, tek dosya)
 *                                   dist/kfc-970x250/index-linked.html (varlıklar doğrudan siteden)
 *                                   release/kfc-970x250.html (teslim: gömülü sürüm)
 *   --assets=<klasör>             varlık kökü (varsayılan assets/kfc)
 */
const fs = require('fs');
const path = require('path');
const render = require('./src/kfc/template');
const D = require('./src/kfc/data');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const root = __dirname;
const A = path.resolve(root, args.assets || 'assets/kfc');
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', svg: 'image/svg+xml', gif: 'image/gif', avif: 'image/avif', mp4: 'video/mp4', webm: 'video/webm', woff2: 'font/woff2', woff: 'font/woff', ttf: 'font/ttf', otf: 'font/otf' };
const abs = (f) => (path.isAbsolute(f) ? f : path.join(A, f));
const dataUri = (f) => { const p = abs(f); const ext = path.extname(p).slice(1).toLowerCase(); return `data:${MIME[ext] || 'application/octet-stream'};base64,${fs.readFileSync(p).toString('base64')}`; };
const has = (f) => f && fs.existsSync(abs(f));

function resolveAssets(mode) {
  const S = D.assets;
  const pick = (e) => { if (!e) return null; if (mode === 'linked') return e.url || (has(e.file) ? dataUri(e.file) : null); return has(e.file) ? dataUri(e.file) : (e.url || null); };
  const out = {
    logo: pick(S.logo),
    video: pick(S.video),
    poster: S.video && S.video.poster ? pick({ file: S.video.poster, url: S.video.posterUrl }) : null,
    hero: pick(S.hero),
    products: (S.products || []).map((p) => ({ ...p, src: pick(p) })).filter((p) => p.src),
    steam: S.steam || [],
    headFont: null, textFont: null, fontCss: '',
  };
  // Fontlar: önce sitenin kendi fontu (varsa), sonra src/kfc/fonts altındaki Google Fonts kopyaları
  const faces = [];
  if (S.font && S.font.family && (S.font.faces || []).some((f) => has(f.file))) {
    out.headFont = S.font.family;
    for (const f of S.font.faces) if (has(f.file)) faces.push({ family: S.font.family, weight: f.weight || 400, style: f.style || 'normal', src: dataUri(f.file), range: f.range });
  }
  const gf = path.join(root, 'src', 'kfc', 'fonts', 'fonts.json');
  if (fs.existsSync(gf)) {
    for (const f of JSON.parse(fs.readFileSync(gf, 'utf8'))) {
      const file = path.join(root, 'src', 'kfc', 'fonts', f.file);
      if (!fs.existsSync(file)) continue;
      if (f.family === (out.headFont || '')) continue;
      if (f.family === 'Inter' && ![600, 800].includes(f.weight)) continue;
      faces.push({ family: f.family, weight: f.weight, style: f.style || 'normal', src: dataUri(file), range: f.unicodeRange });
    }
  }
  out.headFont = out.headFont || (S.font && S.font.headFallback) || 'Anton';
  out.textFont = (S.font && S.font.textFamily) || 'Inter';
  out.fontCss = faces.map((f) => `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};font-display:block;src:url(${f.src}) format('${f.src.startsWith('data:font/woff2') ? 'woff2' : f.src.startsWith('data:font/woff') ? 'woff' : 'truetype'}');${f.range ? `unicode-range:${f.range};` : ''}}`).join('\n');
  return out;
}

const outDir = path.join(root, 'dist', 'kfc-970x250');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(root, 'release'), { recursive: true });
const report = [];
for (const mode of ['embed', 'linked']) {
  const assets = resolveAssets(mode);
  const html = render({ data: D, assets });
  const file = path.join(outDir, mode === 'embed' ? 'index.html' : 'index-linked.html');
  fs.writeFileSync(file, html);
  report.push([path.relative(root, file), (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB', `logo:${!!assets.logo} video:${!!assets.video} hero:${!!assets.hero} ürün:${assets.products.length} font:${assets.headFont}/${assets.textFont}`]);
  if (mode === 'embed') fs.copyFileSync(file, path.join(root, 'release', 'kfc-970x250.html'));
}
for (const r of report) console.log(r.join('  '));
// Reklam ağlarına yükleme için zip (içinde index.html)
try {
  const { execSync } = require('child_process');
  const zip = path.join(root, 'release', 'kfc-970x250.zip');
  fs.rmSync(zip, { force: true });
  execSync(`cd "${outDir}" && zip -q -X "${zip}" index.html`);
  console.log(`release/kfc-970x250.html ve release/kfc-970x250.zip güncellendi (${(fs.statSync(zip).size / 1024).toFixed(0)} KB zip)`);
} catch (e) { console.log('zip üretilemedi:', e.message.split('\n')[0]); }
