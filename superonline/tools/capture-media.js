// "Aynı Anda" ve "Fener" bannerlarının sahne görüntüleri ve etkileşim testi
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const res = {};
  async function open(dir) {
    const p = await b.newPage({ viewport: { width: 970, height: 250 } });
    const errs = []; p.on('pageerror', (e) => errs.push(String(e)));
    await p.addInitScript(() => { window.open = (u) => { window.__opened = u; return null; }; });
    await p.goto('file://' + path.join(__dirname, '..', dir, 'index.html'));
    const shot = (n) => p.screenshot({ path: path.join(__dirname, '..', dir, 'screens', n + '.jpg'), type: 'jpeg', quality: 85 });
    return { p, errs, shot };
  }
  require('fs').mkdirSync(path.join(__dirname, '..', '970x250-ayni-anda', 'screens'), { recursive: true });
  require('fs').mkdirSync(path.join(__dirname, '..', '970x250-fener', 'screens'), { recursive: true });

  // Aynı Anda
  let { p, errs, shot } = await open('970x250-ayni-anda');
  await p.waitForTimeout(1500); await shot('01-karanlik-ev');
  await p.hover('#r1'); await p.waitForTimeout(700); await p.hover('#r2'); await p.waitForTimeout(900); await shot('02-iki-oda');
  await p.click('#r1'); await p.waitForTimeout(400); await shot('03-kanal-mac');
  await p.click('#r2'); await p.click('#r2'); await p.waitForTimeout(400);
  await p.hover('#r3'); await p.waitForTimeout(300); await p.hover('#r4'); await p.waitForTimeout(1200); await shot('04-hepsi-acik');
  await p.waitForTimeout(1500); await shot('05-ayni-anda');
  await p.click('#r3'); await p.waitForTimeout(3200); await shot('06-teklif');
  let exitedByRoom = await p.evaluate(() => !!window.__opened);
  await p.click('#cta'); let ctaExit = await p.evaluate(() => !!window.__opened);
  res.ayniAnda = { errs, exitedByRoom, ctaExit };
  await p.close();

  // Fener
  ({ p, errs, shot } = await open('970x250-fener'));
  await p.waitForTimeout(2200); await shot('01-sehir');
  for (let i = 0; i < 40; i++) { await p.mouse.move(80 + i * 14, 200 - (i % 5) * 10); await p.waitForTimeout(40); }
  await p.waitForTimeout(600); await shot('02-fenerler');
  await p.mouse.move(960, 5); await p.waitForTimeout(6500); await shot('03-yuz');
  await p.waitForTimeout(1500); await shot('04-upload');
  await p.mouse.move(150, 120); await p.mouse.move(180, 110); await p.waitForTimeout(250); await shot('05-dagit');
  await p.mouse.move(960, 5); await p.waitForTimeout(2500); await shot('06-teklif');
  await p.click('#cta'); res.fener = { errs, ctaExit: await p.evaluate(() => !!window.__opened), count: await p.$eval('#cnt', (e) => e.textContent) };
  console.log(JSON.stringify(res));
  await b.close();
})();
