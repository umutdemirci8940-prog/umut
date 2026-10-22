'use strict';
// Ekran görüntüleri: screens/<boyut>-<an>.png  (NODE_PATH=$(npm root -g) node capture.js)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { SIZES } = require('./src/template');
const cache = path.join(__dirname, '..', 'preview', '.fontcache');

(async () => {
  const browser = await chromium.launch();
  for (const [key, { w, h }] of Object.entries(SIZES)) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    // Fontları yerel önbellekten servis etmeyi dene (ağ Google Fonts'a kapalıysa)
    const fontCss = path.join(cache, 'wb-fonts.css');
    if (fs.existsSync(fontCss)) {
      await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fs.readFileSync(fontCss, 'utf8') }));
      await ctx.route('**/fonts.gstatic.com/**', (r) => {
        const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
        fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
      });
    }
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('popup', (p) => console.log('  popup:', p.url()));
    await page.goto('file://' + path.join(__dirname, 'dist', key, 'index.html'));
    const shot = async (n) => page.screenshot({ path: path.join(__dirname, 'screens', `${key}-${n}.png`) });
    await page.waitForTimeout(1300); await shot('1-acilis');
    await page.waitForTimeout(4000); await shot('2-otomatik');
    await page.waitForTimeout(5400); await shot('3-otomatik');
    await page.waitForTimeout(5600); await shot('4-kapanis');
    await page.click('.chip[data-k="zihin"]'); await page.waitForTimeout(900); await shot('5-secim');
    await page.click('.cta');
    await page.waitForTimeout(500);
    if (errors.length) console.log(key, 'HATA:', errors);
    console.log('✔', key);
    await ctx.close();
  }
  await browser.close();
})();
