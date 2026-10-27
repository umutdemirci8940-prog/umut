#!/usr/bin/env node
'use strict';
/**
 * "Çok da Coffy" – 10 interaktif HTML5 çalışma üretir. Her çalışma tek dosyadır ve
 * alan genişliğine göre 970x250 ya da 320x480 yerleşimine geçer.
 *
 *   coffy/dist/<no>-<ad>/index.html   reklam ağına yüklenecek dosya (iki boyut aynı dosyada)
 *   coffy/dist/zip/*.zip              ağ başına yükleme paketleri
 *
 * Ardından sunum sayfası: node coffy/tools/present.js → coffy/release/index.html
 * Kullanım: node coffy/build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('./src/config');
const { page } = require('./src/shared');
const concepts = [...require('./src/concepts-mobile'), ...require('./src/concepts-wide')].sort((a, b) => a.no.localeCompare(b.no));

const root = __dirname;
const dist = path.join(root, 'dist');
const LIMIT_KB = 150;

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'zip'), { recursive: true });

// Marka varlıkları bannerın içine gömülür (harici istek yok)
const read = (f) => fs.readFileSync(path.join(root, f));
const dataUri = (f) => `data:image/${path.extname(f).slice(1)};base64,` + read(f).toString('base64');
// Logo: resmi SVG, beyaz dolgu → currentColor (zemine göre renk alır)
config.brand.logoSvg = read(config.brand.logo).toString('utf8').replace(/<\?xml[^>]*>/, '').replace(/\s(width|height)="[^"]*"/g, '').replace(/fill="#fff(fff)?"/gi, 'fill="currentColor"').trim();
// Ürünler
const manifest = JSON.parse(read('assets/products/manifest.json'));
config.products = {};
for (const k of config.productKeys) {
  const m = manifest.find((x) => x.key === k);
  if (!m) throw new Error('Ürün görseli yok: ' + k);
  config.products[k] = { name: m.name, src: dataUri(m.file) };
}
config.photo = dataUri(config.photoFile);
// Şubeler (gerçek liste)
config.stores = JSON.parse(read(config.storesFile)).stores.map((x) => ({ name: x.name, lat: +x.lat.toFixed(5), lng: +x.lng.toFixed(5), area: x.area, city: x.city }));

for (const c of concepts) {
  let html = page(c, config);
  for (const [k, v] of Object.entries(c.inject || {})) html = html.split(k).join(v);
  const name = `${c.no}-${c.slug}`;
  const dir = path.join(dist, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  execSync(`cd "${dir}" && zip -q -X "${path.join(dist, 'zip', `coffy-${name}.zip`)}" index.html`);
  const kb = Buffer.byteLength(html) / 1024;
  console.log(`${kb > LIMIT_KB ? '⚠' : '✔'} ${name.padEnd(26)} 970x250 + 320x480  ${kb.toFixed(1)} KB`);
}
