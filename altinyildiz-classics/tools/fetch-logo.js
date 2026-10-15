#!/usr/bin/env node
'use strict';
/** Sitedeki logoyu 4x çözünürlükte, şeffaf zeminli PNG olarak (raster) kaydeder: assets/raw/logo@4x.png */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const out = path.join(__dirname, '..', 'assets', 'raw');
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4, locale: 'tr-TR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' });
  const page = await ctx.newPage();
  await page.goto('https://www.altinyildizclassics.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  // Sitedeki <symbol id="logo"> tanımını büyük ölçekte çizip ekran görüntüsünü PNG (raster) olarak alıyoruz.
  const sym = await page.evaluate(() => {
    const s = document.getElementById('logo');
    return s ? { vb: s.getAttribute('viewBox'), inner: s.innerHTML } : null;
  });
  if (!sym || !sym.vb) throw new Error('logo sembolü bulunamadı');
  const [, , vw, vh] = sym.vb.split(/[\s,]+/).map(Number);
  console.log('logo viewBox', sym.vb);
  const W = 1200, H = Math.round(W * vh / vw);
  for (const [name, color] of [['logo@4x.png', '#000'], ['logo-white@4x.png', '#fff']]) {
    const p = await browser.newPage({ viewport: { width: W + 20, height: H + 20 }, deviceScaleFactor: 1 });
    await p.setContent(`<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" viewBox="${sym.vb}" width="${W}" height="${H}" style="display:block;margin:10px;color:${color};fill:${color}">${sym.inner}</svg></body></html>`);
    await p.locator('svg').screenshot({ path: path.join(out, name), omitBackground: true });
    await p.close();
  }
  await browser.close();
  console.log('✔ logo@4x.png, logo-white@4x.png');
})();
