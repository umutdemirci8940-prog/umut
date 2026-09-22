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
const T = require('../src/data').corridor.timing;

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'preview', 'screens');
fs.mkdirSync(outDir, { recursive: true });
const gateAt = (i) => T.enter + T.gates[i] * T.cruise;

// [dosya, dist klasörü, parametreler, ms]  (dokunmadan)
const SCENES = [
  ['wc-lunch-hint',     '970x250', 'seg=wc&h=12&m=31&demo=1', 1500],
  ['wc-lunch-approach', '970x250', 'seg=wc&h=12&m=31', gateAt(0) - 700],
  ['wc-lunch-pass',     '970x250', 'seg=wc&h=12&m=31', gateAt(0) + 260],
  ['hr-evening',        '970x250', 'seg=hr&h=19&m=5', gateAt(1) - 900],
  ['emp-morning',       '970x250', 'seg=emp&h=9&m=15', 1500],
  ['wc-night',          '970x250', 'seg=wc&h=23&m=45', gateAt(0) - 500],
  ['hr-rain',           '970x250', 'seg=hr&h=13&m=0&w=rain', 1500],
  ['pos-version',       '970x250-pos', 'seg=wc&h=12&m=31', 2100],
  ['flat-first-draft',  '970x250-flat', 'seg=wc&h=12&m=31', 6300],
];
const KEEP = ['wc-lunch-drag', 'wc-lunch-final', 'showcase'];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  await routeFonts(ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const shot = (name) => page.screenshot({ path: path.join(outDir, name + '.jpg'), type: 'jpeg', quality: 88 }).then(() => console.log(`✔ ${name}`));
  for (const [name, dir, qs, at] of SCENES) {
    await page.goto('file://' + path.join(root, 'dist', dir, 'index.html') + '?' + qs);
    await page.mouse.move(10, 10);
    await page.waitForTimeout(at);
    await shot(name);
  }
  // Kullanıcı aksiyonu: sürükleyerek hızlı geçiş ve final
  await page.goto('file://' + path.join(root, 'dist', '970x250', 'index.html') + '?seg=wc&h=12&m=31');
  await page.mouse.move(10, 10); await page.waitForTimeout(T.enter + 1500);
  await page.mouse.move(820, 140); await page.mouse.down();
  for (let i = 1; i <= 7; i++) { await page.mouse.move(820 - 150 * i / 7, 140); await page.waitForTimeout(28); }
  await page.waitForTimeout(90); await shot('wc-lunch-drag');
  await page.mouse.up();
  await page.click('.node[data-i="3"]'); await page.waitForTimeout(900);
  await page.waitForTimeout(0.14 * T.cruise + 900); await shot('wc-lunch-final');
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
  for (const f of fs.readdirSync(outDir)) if (!SCENES.some(([n]) => f === n + '.jpg') && !KEEP.includes(f.replace(/\.jpg$/, ''))) fs.rmSync(path.join(outDir, f));
  if (errors.length) { console.log('⚠ ' + errors.join(' | ')); process.exit(1); }
})();
