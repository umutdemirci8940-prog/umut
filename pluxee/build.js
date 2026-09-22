#!/usr/bin/env node
'use strict';
/**
 * Pluxee "Geçiyor" masthead derleyicisi – üç konsept + sunum sayfası.
 *   dist/koridor/index.html, dist/mercek/index.html, dist/fis/index.html  – yayına hazır tek dosyalar
 *   dist/970x250/index.html                                              – varsayılan konsept (koridor) kopyası
 *   dist/zip/pluxee-<konsept>-970x250.zip                                – reklam ağı paketleri
 *   dist/arsiv/pos, dist/arsiv/flat                                      – önceki sürümler
 *   preview/index.html                                                   – sunum sayfası (üç konsept gömülü)
 *
 * Gerçek marka varlıkları: pluxee/assets/ altında logo.(svg|png|webp) ve card.(png|jpg|webp) varsa
 * (ya da assets/manifest.json bunları gösteriyorsa) kreatiflere gömülür; yoksa çizim kullanılır.
 * Kullanım: node pluxee/build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('./src/data');
const CONCEPTS = [require('./src/concepts/koridor'), require('./src/concepts/mercek'), require('./src/concepts/fis')];
const DEFAULT = 'koridor';

const root = __dirname;
const dist = path.join(root, 'dist');
const zipDir = path.join(dist, 'zip');
fs.mkdirSync(zipDir, { recursive: true });
const LIMIT_KB = 150;
let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }

/* ---- gerçek varlıklar ---- */
const { loadAssets } = require('./src/assets');
const assets = loadAssets({ standin: process.argv.includes('--standin') });

function emit(dirName, zipName, html, label) {
  const dir = path.join(dist, dirName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const kb = Buffer.byteLength(html) / 1024;
  let note = '';
  if (hasZip && zipName) {
    const zipPath = path.join(zipDir, zipName);
    fs.rmSync(zipPath, { force: true });
    execSync(`zip -q -j "${zipPath}" "${path.join(dir, 'index.html')}"`);
    note = ` → ${path.relative(root, zipPath)}`;
  }
  console.log(`✔ ${label.padEnd(34)} ${kb.toFixed(1).padStart(6)} KB${note}${kb > LIMIT_KB ? `  ⚠ ${LIMIT_KB} KB sınırının üstünde` : ''}`);
  return kb;
}

/* ---- konseptler ---- */
const built = {};
for (const c of CONCEPTS) {
  const html = c.render(data, assets);
  built[c.id] = { html, kb: emit(c.id, `pluxee-${c.id}-970x250.zip`, html, `${c.title} – ${c.tagline}`) };
}
emit('970x250', null, built[DEFAULT].html, `970x250 (varsayılan: ${DEFAULT})`);

/* ---- arşiv ---- */
try {
  emit('arsiv/pos', null, require('./src/template-cinematic').render(data), 'arşiv: POS sürükle-okut');
  emit('arsiv/flat', null, require('./src/template').render(data), 'arşiv: illüstrasyon (ilk taslak)');
} catch (e) { console.log('ℹ arşiv sürümleri atlandı: ' + e.message); }
for (const old of ['970x250-pos', '970x250-flat']) fs.rmSync(path.join(dist, old), { recursive: true, force: true });
for (const z of ['pluxee-970x250.zip', 'pluxee-970x250-pos.zip', 'pluxee-970x250-flat.zip']) fs.rmSync(path.join(zipDir, z), { force: true });
if (!hasZip) console.log('ℹ zip bulunamadı; paketler atlandı.');

/* ---- sunum sayfası ---- */
const tplPath = path.join(root, 'src', 'showcase.html');
const tpl = fs.readFileSync(tplPath, 'utf8');
if (!tpl.includes('__CONCEPTS_JSON__')) {
  console.log('ℹ src/showcase.html konsept yer tutucularını içermiyor; sunum sayfası atlandı.');
} else {
  const C = data.cinematic;
  const showcaseData = {
    segments: Object.fromEntries(Object.entries(data.segments).map(([k, v]) => [k, { label: v.label, cta: C.segments[k].cta, sub: C.segments[k].sub }])),
    scenes: C.scenes,
    weather: data.weather,
    brand: { name: data.brand.name, campaign: data.brand.campaign, url: data.brand.url },
    assets: { logo: !!assets.logo, card: !!assets.card, photos: Object.fromEntries(Object.entries(assets.photos).map(([k, v]) => [k, { source: v.source, credit: v.credit, kb: Math.round(v.bytes / 1024) }])) },
  };
  const concepts = CONCEPTS.map((c) => ({ id: c.id, title: c.title, tagline: c.tagline, howto: c.howto, kb: built[c.id].kb.toFixed(0), src: built[c.id].html }));
  const jsString = (s) => JSON.stringify(s).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
  const variants = Object.keys(C.segments).length * C.scenes.length;
  const showcase = tpl
    .replace('__CONCEPTS_JSON__', () => jsString(concepts))
    .replace('__SHOWCASE_DATA__', () => jsString(showcaseData))
    .replace(/__VARIANTS__/g, String(variants))
    .replace(/__SEGMENTS__/g, String(Object.keys(C.segments).length))
    .replace(/__SCENES__/g, String(C.scenes.length))
    .replace(/__DEFAULT__/g, DEFAULT)
    .replace(/__BUILD_DATE__/g, new Date().toISOString().slice(0, 10));
  fs.mkdirSync(path.join(root, 'preview'), { recursive: true });
  fs.writeFileSync(path.join(root, 'preview', 'index.html'), showcase);
  console.log(`✔ preview/index.html  (${CONCEPTS.length} konsept · ${variants} versiyon)`);
}
