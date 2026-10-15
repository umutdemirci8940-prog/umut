#!/usr/bin/env node
'use strict';
/**
 * Bannerların ekran görüntülerini alır ve temel etkileşimleri dener.
 * Çıktı: altinyildiz/preview/screens/*.png      Kullanım: node altinyildiz/tools/capture.js
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'preview', 'screens');
fs.mkdirSync(OUT, { recursive: true });
const url = (n) => 'file://' + path.join(ROOT, 'dist', n, 'index.html');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  const errors = [];
  const open = async (n) => {
    const p = await ctx.newPage();
    p.on('pageerror', (e) => errors.push(n + ': ' + e.message));
    p.on('popup', (pp) => { errors.push(n + ': popup ' + pp.url()); pp.close(); });
    await p.goto(url(n), { waitUntil: 'load' });
    return p;
  };
  const shot = (p, f) => p.screenshot({ path: path.join(OUT, f + '.png') });

  // 1) Askılı vitrin
  let p = await open('vitrin');
  await p.waitForTimeout(1500); await shot(p, 'vitrin-1-acilis');
  await p.waitForTimeout(3500); await shot(p, 'vitrin-2-urun');
  await p.hover('.chip[data-cat="2"]'); await p.waitForTimeout(900); await shot(p, 'vitrin-3-kategori');
  await p.hover('#mascot'); await p.waitForTimeout(500); await p.click('#mascot'); await p.waitForTimeout(500); await shot(p, 'vitrin-4-maskot');
  await p.close();

  // 2) Pop-up lookbook
  p = await open('lookbook');
  await p.waitForTimeout(1600); await shot(p, 'lookbook-1-kapak');
  await p.waitForTimeout(3000); await shot(p, 'lookbook-2-sayfa1');
  await p.click('#next'); await p.waitForTimeout(2300); await shot(p, 'lookbook-3-sayfa2');
  await p.close();

  await browser.close();
  console.log(errors.length ? 'HATALAR:\n' + errors.join('\n') : '✔ hata yok');
})();
