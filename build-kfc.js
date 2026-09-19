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
    heroPos: (S.hero && S.hero.pos) || '50% 50%',
    products: (S.products || []).map((p) => ({ ...p, src: pick(p) })).filter((p) => p.src),
    slides: (S.slides || []).map((sl) => {
      const useWebm = !!args.webm;
      let video = null, type = 'video/mp4';
      if (mode === 'linked' && sl.url) { video = sl.url; type = /\.webm(\?|$)/i.test(sl.url) ? 'video/webm' : 'video/mp4'; }
      else if (useWebm && has(sl.webm)) { video = dataUri(sl.webm); type = 'video/webm'; }
      else if (has(sl.file)) { video = dataUri(sl.file); }
      return { name: sl.name, video, type, thumb: pick(sl.thumb) };
    }).filter((sl) => sl.video && sl.thumb),
    videoScale: S.videoScale, videoX: S.videoX,
    steam: S.steam || [],
    headFont: null, textFont: null, fontCss: '',
  };
  // Fontlar: önce sitenin kendi fontları (varsa), yoksa src/kfc/fonts altındaki Google Fonts kopyaları (Anton + Inter)
  const faces = [];
  const siteFaces = (S.font && S.font.faces || []).filter((f) => has(f.file));
  if (siteFaces.length) {
    for (const f of siteFaces) faces.push({ family: f.family, weight: f.weight || 400, style: f.style || 'normal', src: (mode === 'linked' && f.url) ? f.url : dataUri(f.file), range: f.range });
    out.headFont = S.font.headFamily || siteFaces[0].family;
    out.textFont = S.font.textFamily || siteFaces[0].family;
  } else {
    const gf = path.join(root, 'src', 'kfc', 'fonts', 'fonts.json');
    if (fs.existsSync(gf)) {
      for (const f of JSON.parse(fs.readFileSync(gf, 'utf8'))) {
        const file = path.join(root, 'src', 'kfc', 'fonts', f.file);
        if (!fs.existsSync(file)) continue;
        if (f.family === 'Inter' && ![500, 700].includes(f.weight)) continue;
        faces.push({ family: f.family, weight: f.weight, style: f.style || 'normal', src: dataUri(file), range: f.unicodeRange });
      }
    }
    out.headFont = 'Anton'; out.textFont = 'Inter';
  }
  out.fontCss = faces.map((f) => `@font-face{font-family:'${f.family}';font-style:${f.style};font-weight:${f.weight};font-display:block;src:url(${f.src}) format('${/woff2/.test(f.src.slice(0, 40)) || /\.woff2/.test(f.src) ? 'woff2' : 'woff'}');${f.range ? `unicode-range:${f.range};` : ''}}`).join('\n');
  return out;
}

const outDir = path.join(root, 'dist', 'kfc-970x250');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.join(root, 'release'), { recursive: true });
const report = [];
// --webm: yalnızca yerel test sürümü (Playwright Chromium H.264 çözemez) → index-test.html
const targets = args.webm ? [['embed', 'index-test.html']] : [['embed', 'index.html'], ['linked', 'index-linked.html']];
for (const [mode, name] of targets) {
  const assets = resolveAssets(mode);
  const html = render({ data: D, assets });
  const file = path.join(outDir, name);
  fs.writeFileSync(file, html);
  report.push([path.relative(root, file), (Buffer.byteLength(html) / 1024).toFixed(0) + ' KB', `logo:${!!assets.logo} video:${assets.slides.length} hero:${!!assets.hero} ürün:${assets.products.length} font:${assets.headFont}/${assets.textFont}`]);
  if (mode === 'embed' && !args.webm) fs.copyFileSync(file, path.join(root, 'release', 'kfc-970x250.html'));
}
if (args.webm) { for (const r of report) console.log(r.join('  ')); process.exit(0); }
for (const r of report) console.log(r.join('  '));
// Reklam ağlarına yükleme için zip (içinde index.html)
try {
  const { execSync } = require('child_process');
  const zip = path.join(root, 'release', 'kfc-970x250.zip');
  fs.rmSync(zip, { force: true });
  execSync(`cd "${outDir}" && zip -q -X "${zip}" index.html`);
  console.log(`release/kfc-970x250.html ve release/kfc-970x250.zip güncellendi (${(fs.statSync(zip).size / 1024).toFixed(0)} KB zip)`);
} catch (e) { console.log('zip üretilemedi:', e.message.split('\n')[0]); }
