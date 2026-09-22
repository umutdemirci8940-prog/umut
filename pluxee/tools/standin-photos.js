#!/usr/bin/env node
'use strict';
/**
 * GEÇİCİ geliştirme görselleri üretir (assets/photos/standin/*.jpg, git'e girmez).
 * Gerçek fotoğraflar assets/photos.json ile gelince kullanılmaz. `node build.js --standin` bunları gömer.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { PAINT_JS } = require('../src/common');
const out = path.join(__dirname, '..', 'assets', 'photos', 'standin');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent('<div id="ad"></div>');
  for (const [slot, pal] of [['restoran', 'restoran'], ['kafe', 'kafe'], ['market', 'market'], ['online', 'online'], ['hero', 'city']]) {
    const data = await page.evaluate(({ js, pal }) => { const ad = document.getElementById('ad'); eval(js); const c = paint(PAL[pal], 1400, 800); const x = c.getContext('2d'); x.font = '700 40px sans-serif'; x.fillStyle = 'rgba(255,255,255,.5)'; x.fillText('GEÇİCİ · ' + pal.toUpperCase(), 40, 760); return c.toDataURL('image/jpeg', 0.8); }, { js: PAINT_JS, pal });
    fs.writeFileSync(path.join(out, slot + '.jpg'), Buffer.from(data.split(',')[1], 'base64'));
    console.log('✔ standin', slot);
  }
  await browser.close();
})();
