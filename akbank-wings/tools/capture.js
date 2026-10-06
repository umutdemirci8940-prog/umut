#!/usr/bin/env node
'use strict';
/** Masthead'in farklı anlarından ekran görüntüsü alır: akbank-wings/screens/
 *  Kullanım: NODE_PATH=$(npm root -g) node akbank-wings/tools/capture.js */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const out = path.join(root, 'screens');
const cache = path.join(root, '.fontcache');
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(cache, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const file = path.join(root, '970x250', 'index.html');
const html = fs.readFileSync(file, 'utf8');
const cssUrl = html.match(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1].replace(/&amp;/g, '&');
const cssFile = path.join(cache, 'fonts.css');
if (!fs.existsSync(cssFile)) {
  execSync(`curl -sS -A "${UA}" -o "${cssFile}" "${cssUrl}"`);
  for (const m of fs.readFileSync(cssFile, 'utf8').matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g))
    execSync(`curl -sS -o "${path.join(cache, path.basename(m[1]))}" "${m[1]}"`);
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
  await page.waitForTimeout(900); await shot('01-acilis');
  await page.waitForTimeout(2800); await shot('02-seyahat');
  await page.waitForTimeout(3400); await shot('03-gastronomi');
  await page.mouse.move(470, 80); await page.waitForTimeout(500);
  await page.mouse.move(700, 120); await page.waitForTimeout(900); await shot('04-hover-mil');
  await page.mouse.move(900, 120); await page.waitForTimeout(900); await shot('05-hover-sanat');
  await page.mouse.move(380, 200); await page.waitForTimeout(600); await shot('06-kart-egim');
  await browser.close();
  if (errors.length) { console.error('Sayfa hataları:\n' + errors.join('\n')); process.exit(1); }
  console.log('Ekran görüntüleri: ' + out);
})();
