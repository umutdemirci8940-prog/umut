#!/usr/bin/env node
'use strict';
/**
 * Seçili sinyal senaryolarında ekran görüntüsü alır → pluxee/preview/screens/*.jpg
 * Kullanım: NODE_PATH=$(npm root -g) node pluxee/tools/capture.js
 * (Playwright + Chromium gerekir; kreatif harici font kullanmaz, ağ gerekmez.)
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist', '970x250', 'index.html');
const outDir = path.join(root, 'preview', 'screens');
fs.mkdirSync(outDir, { recursive: true });

// [dosya adı, parametreler, ms]
const SCENES = [
  ['wc-lunch-stamp',   'seg=wc&h=12&m=31&geo=levent&demo=1', 1900],
  ['wc-lunch-mid',     'seg=wc&h=12&m=31&geo=levent', 6300],
  ['wc-lunch-final',   'seg=wc&h=12&m=31&geo=levent', 11900],
  ['hr-evening',       'seg=hr&h=19&m=5&geo=kadikoy', 4300],
  ['emp-rain',         'seg=emp&h=9&m=15&geo=cankaya&w=rain', 4300],
  ['wc-night',         'seg=wc&h=23&m=45&geo=alsancak', 2300],
  ['hr-breakfast',     'seg=hr&h=8&m=20&geo=maslak', 4300],
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  for (const [name, qs, at] of SCENES) {
    await page.goto('file://' + dist + '?' + qs);
    await page.mouse.move(10, 10); // sokağa girmeden (elle kontrol tetiklenmesin)
    await page.waitForTimeout(at);
    await page.screenshot({ path: path.join(outDir, name + '.jpg'), type: 'jpeg', quality: 88 });
    console.log(`✔ ${name}`);
  }
  await ctx.close();

  // Sunum sayfası (tam sayfa)
  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p2 = await ctx2.newPage();
  p2.on('pageerror', (e) => errors.push('preview: ' + e.message));
  await p2.goto('file://' + path.join(root, 'preview', 'index.html'));
  await p2.waitForTimeout(2600);
  await p2.screenshot({ path: path.join(outDir, 'showcase.jpg'), type: 'jpeg', quality: 80, fullPage: true });
  console.log('✔ showcase');
  await browser.close();
  if (errors.length) { console.log('⚠ ' + errors.join(' | ')); process.exit(1); }
})();
