// tools/portfolio/portfolyo.html dosyasını PDF'e çevirir (Playwright + Chromium).
// Kullanım: node tools/splash-portfolio-pdf.js [çıktı.pdf]
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const src = path.join(__dirname, 'portfolio', 'portfolyo.html');
  const out = process.argv[2] || path.join(__dirname, '..', 'splashdigital-site', 'splash-digital-portfolyo.pdf');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + src, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: out, width: '297mm', height: '210mm', printBackground: true, preferCSSPageSize: true });
  await browser.close();
  console.log('PDF:', out);
})();
