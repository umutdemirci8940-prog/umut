// Ekran görüntüleri + duman testi: NODE_PATH=$(npm root -g) node tools/capture.js
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => m.type() === 'error' && !/ERR_FAILED|fonts/.test(m.text()) && errs.push(m.text()));
  await p.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  const url = 'file://' + path.resolve(__dirname, '../dist/index.html');
  const shot = n => p.screenshot({ path: path.resolve(__dirname, '../screens', n + '.png') });
  await p.goto(url); await p.waitForTimeout(2600); await shot('01-spor');
  await p.waitForTimeout(4400); await shot('02-dizi-film');
  await p.waitForTimeout(4000); await shot('03-canli-tv');
  await p.waitForTimeout(4000); await shot('04-belgesel');
  await p.waitForTimeout(4200); await shot('05-kapanis');
  await p.click('[data-ch="0"]'); await p.click('.chip[data-lg="5"]'); await p.waitForTimeout(500); await shot('06-ufc');
  await p.click('[data-dev="mobile"]'); await p.waitForTimeout(800); await shot('07-mobil');
  await p.click('[data-dev="tablet"]'); await p.click('[data-ch="3"]'); await p.mouse.move(560, 60); await p.waitForTimeout(900); await shot('08-tablet-belgesel');
  await p.goto(url + '?tvsync=1&kanal=' + encodeURIComponent('Bu kanal')); await p.waitForTimeout(20000); await shot('09-tvsync-kapanis');
  console.log(errs.length ? 'HATALAR:\n' + errs.join('\n') : 'Konsol hatası yok');
  await b.close();
})();
