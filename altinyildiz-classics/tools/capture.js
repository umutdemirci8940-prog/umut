#!/usr/bin/env node
'use strict';
/**
 * Banner'ın kilit anlarının ekran görüntülerini alır (preview/) ve temel etkileşimleri doğrular.
 * Kullanım: NODE_PATH=$(npm root -g) node tools/capture.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const out = path.join(root, 'preview');
const cache = path.join(out, '.fontcache');
fs.mkdirSync(cache, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const file = path.join(root, 'dist', '970x250', 'index.html');
const html = fs.readFileSync(file, 'utf8');

// Bazı ortamlarda Chromium Google Fonts'a doğrudan erişemez: curl ile önbelleğe al, yerelden servis et.
const cssUrl = html.match(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1].replace(/&amp;/g, '&');
const cssFile = path.join(cache, 'fonts.css');
if (!fs.existsSync(cssFile)) {
  execSync(`curl -sS -A "${UA}" -o "${cssFile}" "${cssUrl}"`);
  for (const m of fs.readFileSync(cssFile, 'utf8').matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g))
    execSync(`curl -sS -o "${path.join(cache, path.basename(m[1]))}" "${m[1]}"`);
}
const fontCss = fs.readFileSync(cssFile, 'utf8');

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fontCss }));
  await ctx.route('**/fonts.gstatic.com/**', (r) => {
    const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
    fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
  });
  const p = await ctx.newPage();
  const errors = [], opened = [];
  p.on('pageerror', (e) => errors.push(e.message));
  await p.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); }; });
  await p.mouse.move(969, 249);
  await p.goto('file://' + file);
  const shot = async (name, wait) => { await p.waitForTimeout(wait); await p.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 88 }); };
  await shot('01-acilis', 1000);
  await shot('02-is-gunu', 2300);
  await shot('03-otomatik-gecis', 3900);
  await p.click('.chip:nth-child(3)'); await p.mouse.move(150, 240); await shot('04-hafta-sonu', 1600);
  await p.click('.chip:nth-child(2)'); await p.mouse.move(150, 240); await shot('05-ozel-davet', 1400);
  await p.mouse.move(652 + 16 + 46, 14 + 22 + 30); await shot('06-buyutec', 500);
  await p.hover('.hs.on >> nth=1'); await shot('07-etkilesim-noktasi', 500);
  await p.click('.card >> nth=0'); await p.click('.cta'); await p.click('.hs.on >> nth=0');
  opened.push(...(await p.evaluate(() => window.__opened)));
  await ctx.close(); await b.close();
  console.log('Açılan bağlantılar:\n  ' + opened.join('\n  '));
  if (errors.length) { console.error('Sayfa hataları:', errors); process.exit(1); }
  console.log('✔ preview/ ekran görüntüleri alındı, hata yok');
})();
