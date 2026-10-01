// 970x250 sahnelerinin ekran görüntüleri ve basit etkileşim testi
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 970, height: 250 } });
  const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
  await p.addInitScript(() => { window.open = (u) => { window.__opened = u; return null; }; });
  await p.goto('file://' + path.join(__dirname, '..', '970x250', 'index.html'));
  const out = (n) => path.join(__dirname, '..', '970x250', 'screens', n + '.jpg');
  const shot = (n) => p.screenshot({ path: out(n), type: 'jpeg', quality: 85, clip: { x: 0, y: 0, width: 970, height: 250 } });
  await p.waitForTimeout(1500); await shot('01-oynatici');
  await p.waitForTimeout(2200); await shot('02-reklami-gec');
  await p.click('#skip', { force: true }); await p.waitForTimeout(1600); await shot('03-sessizlik');
  await p.waitForTimeout(3500); await shot('04-sifir-dusuyor');
  await p.waitForTimeout(1800); await shot('05-fiyat-ayni');
  await p.waitForTimeout(2600); await shot('06-teklif');
  const opened0 = await p.evaluate(() => window.__opened || null);
  await p.click('#cta'); const opened = await p.evaluate(() => window.__opened);
  const scale = await p.evaluate(() => document.getElementById('ad').style.transform || 'none');
  console.log(JSON.stringify({ errs, skipDidNotExit: opened0 === null, ctaExit: !!opened, scale }));
  await b.close();
})();
