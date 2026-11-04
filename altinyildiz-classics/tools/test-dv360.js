// DV360 paketi testi: (1) varsayılan clickTag'ler = markanın adresleri, (2) DV360'ın değiştirdiği clickTag'lere yönlenme,
// (3) dış ağ isteği yok, gömülü font yüklü. Kullanım: NODE_PATH=$(npm root -g) node tools/test-dv360.js
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const list = require('../src/ac-urunler.json').filter((p) => !p.dup).map((p) => p.url);
const file = fs.readdirSync(path.join(__dirname, '..', 'dv360')).filter((d) => !/\./.test(d))[0];
const html = fs.readFileSync(path.join(__dirname, '..', 'dv360', file, 'index.html'), 'utf8');
async function run(label, source, expected) {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 970, height: 250 } });
  const errs = [], external = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/*', (r) => { const u = r.request().url(); if (!u.startsWith('data:') && !u.startsWith('file:') && !u.startsWith('about:')) { external.push(u); return r.abort(); } r.continue(); });
  await p.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); }; });
  const tmp = path.join(require('os').tmpdir(), 'dv360-test.html'); fs.writeFileSync(tmp, source);
  await p.goto('file://' + tmp); await p.waitForTimeout(5200);
  const font = await p.evaluate(() => document.fonts.check('700 16px Urbanist') && [...document.fonts].some((f) => f.family.includes('Urbanist') && f.status === 'loaded'));
  for (const r of [0, 1]) for (let i = 0; i < (r ? 5 : 18); i++) { await p.click('#l' + r); await p.hover('#r' + r); await p.click(`#r${r} .dn`); await p.waitForTimeout(420); }
  await p.mouse.click(120, 200); // banner zemini
  const opened = await p.evaluate(() => window.__opened);
  const got = new Set(opened.slice(0, -1)), miss = expected.filter((u) => !got.has(u));
  console.log(`${label}: Satın Al ${opened.length - 1} tık · beklenen ${expected.length} adresin ${expected.length - miss.length}'i açıldı · zemin → ${opened[opened.length - 1].slice(0, 60)}… · font ${font ? 'gömülü, yüklendi' : 'YOK'} · dış istek ${external.length}${errs.length ? ' · HATA ' + errs : ''}`);
  await b.close();
  return !miss.length && font && !external.length && !errs.length;
}
(async () => {
  const ok1 = await run('1) Varsayılan', html, list);
  // DV360'ın clickTag değerlerini kendi izleme adresleriyle değiştirmesini taklit et
  const dv = list.map((_, i) => `https://ad.doubleclick.net/ddm/trackclk/test${i + 1}`);
  let swapped = html; list.forEach((u, i) => { swapped = swapped.replace(`var clickTag${i + 1} = ${JSON.stringify(u)};`, `var clickTag${i + 1} = "${dv[i]}";`); });
  const ok2 = await run('2) DV360 değiştirdi', swapped, dv);
  process.exit(ok1 && ok2 ? 0 : 1);
})();
