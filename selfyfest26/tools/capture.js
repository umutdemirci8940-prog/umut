#!/usr/bin/env node
'use strict';
/** Masthead ekran görüntüleri + basit etkileşim testi. Kullanım: NODE_PATH=$(npm root -g) node selfyfest26/tools/capture.js */
const path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const file = 'file://' + path.join(root, 'dist', '970x250', 'index.html');
const shots = path.join(root, 'preview');

(async () => {
  const browser = await chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {});
  const page = await browser.newPage({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.addInitScript(() => { window.open = (u) => { window.__opened = u; }; });
  await page.goto(file);
  const snap = (n) => page.screenshot({ path: path.join(shots, n + '.jpg'), quality: 88, type: 'jpeg' });
  await page.waitForTimeout(450); await snap('01-acilis');
  await page.waitForTimeout(2600); await snap('02-sayfa1');
  await page.mouse.move(262 + 176 + 82, 80); await page.waitForTimeout(900); await snap('03-hover-kart');
  await page.mouse.move(940, 245);
  await page.click('#nextBtn'); await page.waitForTimeout(1400); await snap('04-sayfa2');
  await page.mouse.move(885, 118); await page.waitForTimeout(600); await snap('05-hover-cta');
  // etkileşim kontrolleri
  const pageAfterNav = await page.evaluate(() => document.querySelector('.card .name').textContent);
  await page.mouse.move(600, 120); await page.click('#prev'); await page.waitForTimeout(900);
  const first = await page.evaluate(() => document.querySelector('.card .name').textContent);
  // tarih şeridini sola sürükle → 2. sayfa, tıklama çıkışı tetiklenmemeli
  await page.mouse.move(600, 236); await page.mouse.down(); await page.mouse.move(520, 236, { steps: 8 }); await page.mouse.up();
  await page.waitForTimeout(900);
  const dragged = await page.evaluate(() => [document.querySelector('.card .name').textContent, window.__opened || null]);
  await page.screenshot({ path: path.join(shots, '06-serit-surukleme.jpg'), quality: 88, type: 'jpeg' });
  if (dragged[0] !== 'FATMA TURGUT' || dragged[1]) { errors.push('sürükleme: ' + dragged); }
  await page.mouse.click(600, 30); const opened = await page.evaluate(() => window.__opened);
  console.log({ pageAfterNav, first, opened, errors });
  if (errors.length || !opened || first !== 'MURAT DALKILIÇ') process.exitCode = 1;
  await browser.close();
})();
