#!/usr/bin/env node
'use strict';
/**
 * Ekran görüntüleri → pluxee/preview/screens/*.jpg
 * Kullanım: NODE_PATH=$(npm root -g) node pluxee/tools/capture.js
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { routeFonts } = require('./fonts');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'preview', 'screens');
fs.mkdirSync(outDir, { recursive: true });

// [dosya, dist klasörü, parametreler, ms]
const SCENES = [
  ['wc-lunch-tap',    '970x250', 'seg=wc&h=12&m=31&demo=1', 2100],
  ['wc-lunch-kafe',   '970x250', 'seg=wc&h=12&m=31', 4300],
  ['wc-lunch-final',  '970x250', 'seg=wc&h=12&m=31', 9900],
  ['hr-evening',      '970x250', 'seg=hr&h=19&m=5', 2100],
  ['emp-morning',     '970x250', 'seg=emp&h=9&m=15', 2100],
  ['wc-night',        '970x250', 'seg=wc&h=23&m=45', 2100],
  ['hr-rain',         '970x250', 'seg=hr&h=13&m=0&w=rain', 2100],
  ['flat-first-draft','970x250-flat', 'seg=wc&h=12&m=31', 6300],
];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  await routeFonts(ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  for (const [name, dir, qs, at] of SCENES) {
    await page.goto('file://' + path.join(root, 'dist', dir, 'index.html') + '?' + qs);
    await page.mouse.move(10, 10); // sahneye girmeden (elle kontrol tetiklenmesin)
    await page.waitForTimeout(at);
    await page.screenshot({ path: path.join(outDir, name + '.jpg'), type: 'jpeg', quality: 88 });
    console.log(`✔ ${name}`);
  }
  await ctx.close();

  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await routeFonts(ctx2);
  const p2 = await ctx2.newPage();
  p2.on('pageerror', (e) => errors.push('preview: ' + e.message));
  await p2.goto('file://' + path.join(root, 'preview', 'index.html'));
  await p2.waitForTimeout(2600);
  await p2.screenshot({ path: path.join(outDir, 'showcase.jpg'), type: 'jpeg', quality: 78, fullPage: true });
  console.log('✔ showcase');
  await browser.close();
  // eski görüntüleri temizle
  for (const f of fs.readdirSync(outDir)) if (!SCENES.some(([n]) => f === n + '.jpg') && f !== 'showcase.jpg') fs.rmSync(path.join(outDir, f));
  if (errors.length) { console.log('⚠ ' + errors.join(' | ')); process.exit(1); }
})();
