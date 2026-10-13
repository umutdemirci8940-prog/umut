// Tüm mağaza görsellerini üretir: node store/render-all.cjs  (Playwright + Chromium gerekir)
const { chromium } = require('playwright');
const { pathToFileURL } = require('node:url');
const path = require('node:path');
(async () => {
  const dir = __dirname;
  const page0 = pathToFileURL(path.join(dir, 'poster.html')).href;
  const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined });
  const jobs = [];
  for (let i = 1; i <= 6; i++) {
    jobs.push({ q: `i=${i}&size=ios`, w: 1320, h: 2868, out: `appstore/iphone-6.9-${i}.png` });
    jobs.push({ q: `i=${i}&size=play`, w: 1080, h: 1920, out: `googleplay/phone-${i}.png` });
  }
  jobs.push({ q: 'size=feature', w: 1024, h: 500, out: 'googleplay/feature-graphic-1024x500.png' });
  for (const j of jobs) {
    const page = await browser.newPage({ viewport: { width: j.w, height: j.h } });
    await page.goto(`${page0}?${j.q}`);
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(dir, j.out) });
    await page.close();
    console.log(j.out);
  }
  await browser.close();
})();
