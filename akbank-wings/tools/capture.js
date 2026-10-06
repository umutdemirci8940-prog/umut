#!/usr/bin/env node
'use strict';
/** Masthead'in farklı anlarından ekran görüntüsü alır: akbank-wings/screens/
 *  Kullanım: NODE_PATH=$(npm root -g) node akbank-wings/tools/capture.js */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
// Kullanım: node capture.js [çalışma klasörü]  (varsayılan: 970x250)
const work = process.argv[2] || '970x250';
const out = path.join(root, 'screens', work === '970x250' ? '' : work);
const cache = path.join(root, '.fontcache');
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(cache, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const file = path.join(root, work, 'index.html');
const html = fs.readFileSync(file, 'utf8');
const cssUrl = html.match(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1].replace(/&amp;/g, '&');
const cssFile = path.join(cache, 'fonts-' + require('crypto').createHash('md5').update(cssUrl).digest('hex').slice(0, 8) + '.css');
if (!fs.existsSync(cssFile)) {
  execSync(`curl -sS -A "${UA}" -o "${cssFile}" "${cssUrl}"`);
  for (const m of fs.readFileSync(cssFile, 'utf8').matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g))
    { const f = path.join(cache, path.basename(m[1])); if (!fs.existsSync(f)) execSync(`curl -sS -o "${f}" "${m[1]}"`); }
}
const fontCss = fs.readFileSync(cssFile, 'utf8');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 300 }, deviceScaleFactor: 2 });
  await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fontCss }));
  await ctx.route('**/fonts.gstatic.com/**', (r) => {
    const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
    fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.mouse.move(5, 295);
  await page.goto('file://' + file);
  const shot = (n) => page.screenshot({ path: path.join(out, n + '.jpg'), type: 'jpeg', quality: 88, clip: { x: 0, y: 0, width: 970, height: 250 } });
  await page.mouse.move(5, 295); // imleç banner dışında: otomatik döngü çalışsın
  if (work === '970x250-binis-karti') {
    await page.waitForTimeout(1100); await shot('01-pano-donuyor');
    await page.waitForTimeout(1900); await shot('02-lounge');
    await page.waitForTimeout(3600); await shot('03-transfer');
    await page.mouse.move(470, 150); await page.waitForTimeout(800); await shot('04-hover-dining');
    const k = await page.locator('#knob').boundingBox();
    await page.mouse.move(k.x + k.width / 2, k.y + k.height / 2); await page.mouse.down();
    await page.mouse.move(k.x + 80, k.y + k.height / 2, { steps: 6 }); await shot('05-kaydiriliyor');
    await page.mouse.move(k.x + 240, k.y + k.height / 2, { steps: 8 }); await page.mouse.up();
    await page.waitForTimeout(900); await shot('06-binis-onaylandi');
    const boarded = await page.evaluate(() => document.getElementById('pass').classList.contains('boarded'));
    if (!boarded) errors.push('Kaydır-bin etkileşimi tamamlanmadı');
    const popups = []; page.context().on('page', (p) => popups.push(p.url()));
    await page.click('#cta'); await page.waitForTimeout(500);
    if (!popups.length) errors.push('CTA tıklaması yeni sekme açmadı'); else console.log('CTA → ' + popups[0]);
  } else {
    await page.waitForTimeout(900); await shot('01-acilis');
    await page.waitForTimeout(2800); await shot('02-seyahat');
    await page.waitForTimeout(3400); await shot('03-gastronomi');
    await page.mouse.move(470, 80); await page.waitForTimeout(500);
    await page.mouse.move(700, 120); await page.waitForTimeout(900); await shot('04-hover-mil');
    await page.mouse.move(900, 120); await page.waitForTimeout(900); await shot('05-hover-sanat');
    await page.mouse.move(380, 200); await page.waitForTimeout(600); await shot('06-kart-egim');
  }
  await browser.close();
  if (errors.length) { console.error('Sayfa hataları:\n' + errors.join('\n')); process.exit(1); }
  console.log('Ekran görüntüleri: ' + out);
})();
