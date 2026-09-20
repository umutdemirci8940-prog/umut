#!/usr/bin/env node
'use strict';
/**
 * Playwright ile masthead'in ekran görüntülerini alır (preview/screens/*.jpg).
 * Kullanım: NODE_PATH=$(npm root -g) node tools/capture.js
 * Gerekli: playwright + Chromium (npm i -D playwright && npx playwright install chromium)
 *
 * Not: Playwright ekran görüntüsü almadan önce web fontlarının yüklenmesini bekler; vekil sunuculu
 * ağlarda Google Fonts saniyeler sürebildiğinden fontlar curl ile bir kez indirilir
 * (preview/.fontcache) ve tarayıcıya yerelden servis edilir. Böylece kareler tam zamanında alınır.
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist', '970x250', 'index.html');
const out = path.join(root, 'preview', 'screens');
const cache = path.join(root, 'preview', '.fontcache');
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(cache, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

function ensureFonts(cssUrl) {
  const cssFile = path.join(cache, 'fonts.css');
  if (!fs.existsSync(cssFile)) {
    execSync(`curl -sS -A "${UA}" -o "${cssFile}" "${cssUrl}"`);
    const css = fs.readFileSync(cssFile, 'utf8');
    for (const m of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)) {
      const f = path.join(cache, path.basename(m[1]));
      if (!fs.existsSync(f)) execSync(`curl -sS -o "${f}" "${m[1]}"`);
    }
  }
  return fs.readFileSync(cssFile, 'utf8');
}

(async () => {
  const html = fs.readFileSync(dist, 'utf8');
  const cssUrl = html.match(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1].replace(/&amp;/g, '&');
  let fontCss = null;
  try { fontCss = ensureFonts(cssUrl); } catch (e) { console.log('ℹ Fontlar indirilemedi, sistem fontlarıyla devam:', e.message); }

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  if (fontCss) {
    await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fontCss }));
    await ctx.route('**/fonts.gstatic.com/**', (r) => {
      const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
      fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
    });
  } else {
    await ctx.route('**/fonts.g*.com/**', (r) => r.abort());
  }
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

  await page.goto('file://' + dist, { waitUntil: 'commit' });
  // Zaman çizgisi görseller çözülünce (#ad.go) başlar.
  await page.waitForSelector('#ad.go', { state: 'attached', timeout: 10000 });
  const start = Date.now();
  const at = async (ms) => { const d = start + ms - Date.now(); if (d > 0) await page.waitForTimeout(d); };
  const shot = (name) => page.screenshot({ path: path.join(out, `970x250-${name}.jpg`), type: 'jpeg', quality: 88 });

  await at(650); await shot('01-intro');          // ışık süpürmesi, çekirdekler düşüyor
  await at(1750); await shot('02-beans-land');    // fincan yerleşti, başlık yükseliyor
  await at(2600); await shot('03-headline');      // başlık + alt metin
  await at(5200); await shot('04-final');         // CTA, buhar, bokeh – nihai kare
  // fincana yaklaşma: buhar yoğunlaşır, ısı halkaları masaya yayılır, hale büyür
  await page.mouse.move(600, 150); await page.waitForTimeout(1500); await shot('05-hover-cup');
  // çekirdeğe dokunma: çekirdek takla atar, aroma kıvılcımları + tat notu
  await page.mouse.move(758, 232); await page.waitForTimeout(300);
  await page.mouse.down(); await page.mouse.up(); await page.waitForTimeout(380); await shot('06-bean-tap');
  await page.mouse.move(120, 120); await page.waitForTimeout(900); await shot('07-parallax-left');
  await browser.close();
  console.log('✔ Ekran görüntüleri:', path.relative(root, out) + (errors.length ? '  ⚠ ' + errors.join(' | ') : ''));
})().catch((e) => { console.error(e); process.exit(1); });
