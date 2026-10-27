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

// Logo dosyası bannerın içine gömülür (harici istek yok)
const logoFile = config.brand.logo && path.join(root, config.brand.logo);
if (logoFile && fs.existsSync(logoFile)) config.brand.logoImg = 'data:image/png;base64,' + fs.readFileSync(logoFile).toString('base64');

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
