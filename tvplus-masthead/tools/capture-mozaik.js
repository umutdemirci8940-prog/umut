// Mozaik ekran görüntüleri: NODE_PATH=$(npm root -g) node tools/capture-mozaik.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && !/ERR_FAILED|fonts/.test(m.text()) && errs.push(m.text()));
  await p.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  await p.addInitScript(() => { window.open = () => null; });
  const url = 'file://' + path.resolve(__dirname, '../dist/mozaik/index.html');
  const shot = n => p.screenshot({ path: path.resolve(__dirname, '../screens/mozaik', n + '.png') });
  await p.goto(url);
  await p.waitForTimeout(700); await shot('01-toplanma');
  await p.waitForTimeout(2800); await shot('02-logo');
  await p.waitForTimeout(3200); await shot('03-kategoriler');
  await p.mouse.move(236 + 90, 200); await p.waitForTimeout(400); await shot('04-kategori-hover');
  await p.mouse.move(100, 100); await p.waitForTimeout(6500); await shot('05-kapanis');
  await p.mouse.move(236 + 200, 120); await p.waitForTimeout(500); await shot('06-logo-hover');
  await p.mouse.click(236 + 230, 130); await p.waitForTimeout(150); await shot('07-dagit');
  await p.click('#dice'); await p.waitForTimeout(4000); await shot('08-oneri');
  await p.goto(url + '?tvsync=1'); await p.waitForTimeout(12500); await shot('09-tvsync');
  console.log(errs.length ? 'HATALAR:\n' + errs.join('\n') : 'Konsol hatası yok');
  await b.close();
})();
