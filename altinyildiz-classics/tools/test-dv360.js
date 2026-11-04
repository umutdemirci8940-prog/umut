// DV360 paketi testi: (1) varsayılan clickTag'ler = markanın adresleri, (2) DV360'ın değiştirdiği clickTag'lere yönlenme,
// (3) dış ağ isteği yok, gömülü font yüklü. Kullanım: NODE_PATH=$(npm root -g) node tools/test-dv360.js
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const list = require('../src/ac-urunler.json').filter((p) => !p.dup).map((p) => p.url);
const DIR = (v) => path.join(__dirname, '..', 'dv360', fs.readdirSync(path.join(__dirname, '..', 'dv360')).find((d) => d.endsWith('_DV360_' + v)));
const html = fs.readFileSync(path.join(DIR('A'), 'index.html'), 'utf8');
async function run(label, source, expected, dir = DIR('A')) {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 970, height: 250 } });
  const errs = [], external = [];
  p.on('pageerror', (e) => errs.push(e.message));
  await p.route('**/*', (r) => { const u = r.request().url(); if (!u.startsWith('data:') && !u.startsWith('file:') && !u.startsWith('about:')) { external.push(u); return r.abort(); } r.continue(); });
  await p.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); }; });
  const tmp = path.join(dir, '__test.html'); fs.writeFileSync(tmp, source);
  await p.goto('file://' + tmp); await p.waitForTimeout(5200);
  const font = await p.evaluate(() => document.fonts.check('700 16px Urbanist') && [...document.fonts].some((f) => f.family.includes('Urbanist') && f.status === 'loaded'));
  for (const r of [0, 1]) for (let i = 0; i < (r ? 5 : 18); i++) { await p.click('#l' + r); await p.hover('#r' + r); await p.click(`#r${r} .dn`); await p.waitForTimeout(420); }
  await p.mouse.click(120, 200); // banner zemini
  const opened = await p.evaluate(() => window.__opened);
  const got = new Set(opened.slice(0, -1)), miss = expected.filter((u) => !got.has(u));
  console.log(`${label}: Satın Al ${opened.length - 1} tık · beklenen ${expected.length} adresin ${expected.length - miss.length}'i açıldı · zemin → ${opened[opened.length - 1].slice(0, 60)}… · font ${font ? 'gömülü, yüklendi' : 'YOK'} · dış istek ${external.length}${errs.length ? ' · HATA ' + errs : ''}`);
  await b.close(); fs.rmSync(tmp);
  return !miss.length && font && !external.length && !errs.length;
}
(async () => {
  const ok1 = await run('1) Varsayılan', html, list);
  // DV360'ın clickTag değerlerini kendi izleme adresleriyle değiştirmesini taklit et
  const dv = list.map((_, i) => `https://ad.doubleclick.net/ddm/trackclk/test${i + 1}`);
  let swapped = html; list.forEach((u, i) => { swapped = swapped.replace(`var clickTag${i + 1} = ${JSON.stringify(u)};`, `var clickTag${i + 1} = "${dv[i]}";`); });
  const ok2 = await run('2) DV360 değiştirdi', swapped, dv);
  // B: tek clickTag – DV360 izleme adresi verildiğinde tüm çıkışlar oraya gitmeli
  const htmlB = fs.readFileSync(path.join(DIR('B'), 'index.html'), 'utf8').replace(/var clickTag = "[^"]*";/, 'var clickTag = "https://ad.doubleclick.net/ddm/trackclk/tek";');
  const ok3 = await run('3) B: tek clickTag', htmlB, ['https://ad.doubleclick.net/ddm/trackclk/tek'], DIR('B'));
  process.exit(ok1 && ok2 && ok3 ? 0 : 1);
})();
