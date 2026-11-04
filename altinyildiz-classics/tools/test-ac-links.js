// Kombin Makinesi (AC): her makaradaki tüm ürünler için "Satın Al" tıklanır; açılan adresler markanın listesiyle birebir karşılaştırılır.
// Kullanım: NODE_PATH=$(npm root -g) node tools/test-ac-links.js
const path = require('path');
const { chromium } = require('playwright');
const list = require('../src/ac-urunler.json').filter((p) => !p.dup).map((p) => p.url);
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 970, height: 250 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/fonts.g*/**', (r) => r.abort());
  await p.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); }; });
  await p.goto('file://' + path.join(__dirname, '..', 'dist', '09-kombin-makinesi-ac', 'index.html'));
  await p.waitForTimeout(5200); // açılış + demo çevirme bitsin
  for (const r of [0, 1]) {
    const n = r ? 5 : 18;
    for (let i = 0; i < n; i++) { await p.click('#l' + r); await p.hover('#r' + r); await p.click(`#r${r} .dn`); await p.waitForTimeout(450); }
  }
  const opened = await p.evaluate(() => window.__opened);
  const uniq = [...new Set(opened)];
  const missing = list.filter((u) => !uniq.includes(u)), extra = uniq.filter((u) => !list.includes(u));
  console.log(`Satın Al tıklaması: ${opened.length} · farklı adres: ${uniq.length}/${list.length} · eksik: ${missing.length} · listede olmayan: ${extra.length}${errs.length ? ' · HATA ' + errs : ''}`);
  missing.concat(extra).forEach((u) => console.log('  ', u));
  await b.close(); process.exit(missing.length || extra.length || errs.length ? 1 : 0);
})();
