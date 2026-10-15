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
  const handle = await page.evaluateHandle(() => {
    const use = document.querySelector('use[href="#logo"], use[*|href="#logo"]');
    if (use) return use.closest('svg');
    // yedek: ekranın üst ortasındaki en geniş svg/img
    const c = [...document.querySelectorAll('header svg, header img')].map((e) => ({ e, r: e.getBoundingClientRect() }))
      .filter((o) => o.r.top < 80 && Math.abs(o.r.left + o.r.width / 2 - innerWidth / 2) < 200).sort((a, b) => b.r.width - a.r.width);
    return c[0] && c[0].e;
  });
  const el = handle.asElement();
  const box = await el.boundingBox();
  console.log('logo kutusu', box);
  // Arka planı şeffaf yapıp yalnızca logoyu çek (çevresindeki öğeleri gizle)
  await page.evaluate((e) => {
    document.documentElement.style.background = 'transparent'; document.body.style.background = 'transparent';
    for (const n of document.querySelectorAll('body *')) if (!n.contains(e) && !e.contains(n) && n !== e) n.style.visibility = 'hidden';
    let p = e; while (p) { if (p.style) p.style.background = 'transparent'; p = p.parentElement; }
  }, el);
  await page.screenshot({ path: path.join(out, 'logo@4x.png'), omitBackground: true, clip: { x: box.x - 2, y: box.y - 2, width: box.width + 4, height: box.height + 4 } });
  // Beyaz sürüm (koyu zemin için) – raster olarak renk değiştirerek
  await page.evaluate((e) => { e.style.color = '#fff'; e.style.fill = '#fff'; for (const n of e.querySelectorAll('*')) { n.style.fill = '#fff'; } }, el);
  await page.screenshot({ path: path.join(out, 'logo-white@4x.png'), omitBackground: true, clip: { x: box.x - 2, y: box.y - 2, width: box.width + 4, height: box.height + 4 } });
  await browser.close();
  console.log('✔ logo@4x.png, logo-white@4x.png');
})();
