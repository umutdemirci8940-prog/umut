#!/usr/bin/env node
'use strict';
/**
 * Pluxee "Geçiyor" masthead derleyicisi.
 *   dist/970x250/index.html     – yayına hazır tek dosyalık kreatif
 *   dist/zip/pluxee-970x250.zip – reklam ağına yüklenecek paket
 *   preview/index.html          – sunum sayfası (kreatif srcdoc ile gömülü, tek dosya)
 *
 * Kullanım: node pluxee/build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('./src/data');
const { render, SIZE } = require('./src/template');

const root = __dirname;
const dist = path.join(root, 'dist', SIZE.key);
const zipDir = path.join(root, 'dist', 'zip');
const preview = path.join(root, 'preview');
fs.mkdirSync(dist, { recursive: true });
fs.mkdirSync(zipDir, { recursive: true });
fs.mkdirSync(preview, { recursive: true });
const LIMIT_KB = 150;

// 1) Kreatif
const html = render(data);
fs.writeFileSync(path.join(dist, 'index.html'), html);
const kb = Buffer.byteLength(html) / 1024;

// 2) Zip
let zipNote = '';
try {
  execSync('zip -v', { stdio: 'ignore' });
  const zipPath = path.join(zipDir, `pluxee-${SIZE.key}.zip`);
  fs.rmSync(zipPath, { force: true });
  execSync(`zip -q -j "${zipPath}" "${path.join(dist, 'index.html')}"`);
  zipNote = ` → ${path.relative(root, zipPath)}`;
} catch { zipNote = '  (zip bulunamadı; paket atlandı)'; }

// 3) Sunum sayfası: kreatif JS dizesi olarak gömülür (srcdoc), böylece tek dosya olarak paylaşılır
const segs = Object.keys(data.copy).length;
const momentsPerSeg = Object.keys(data.copy.wc).length - 1; // final hariç
const geos = Object.keys(data.geos).length + 1;              // + Türkiye geneli
const variants = segs * momentsPerSeg * geos;
const showcaseData = {
  segments: data.segments,
  geos: data.geos,
  geoNone: data.geoNone,
  moments: data.moments,
  stops: Object.fromEntries(Object.entries(data.stops).map(([k, v]) => [k, { name: v.name, awning: v.awning }])),
  weather: data.weather,
  timing: data.timing,
  brand: { name: data.brand.name, agency: data.brand.agency, campaign: data.brand.campaign, url: data.brand.url },
};
const jsString = (s) => JSON.stringify(s).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
const tpl = fs.readFileSync(path.join(root, 'src', 'showcase.html'), 'utf8');
const showcase = tpl
  .replace('__MASTHEAD_SRC__', () => jsString(html))
  .replace('__SHOWCASE_DATA__', () => jsString(showcaseData))
  .replace(/__VARIANTS__/g, String(variants))
  .replace(/__SEGMENTS__/g, String(segs))
  .replace(/__MOMENTS__/g, String(momentsPerSeg))
  .replace(/__GEOS__/g, String(geos))
  .replace(/__KB__/g, kb.toFixed(0))
  .replace(/__BUILD_DATE__/g, new Date().toISOString().slice(0, 10));
fs.writeFileSync(path.join(preview, 'index.html'), showcase);

console.log(`✔ ${SIZE.key} ${SIZE.label}  ${kb.toFixed(1)} KB${zipNote}${kb > LIMIT_KB ? `  ⚠ ${LIMIT_KB} KB sınırının üstünde` : ''}`);
console.log(`✔ preview/index.html  (${variants} versiyon: ${segs} segment × ${momentsPerSeg} an × ${geos} konum)`);
