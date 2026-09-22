#!/usr/bin/env node
'use strict';
/**
 * 12'yi Geçiyor · 970x250 birimin sahnelerini Playwright ile görüntüler ve
 * temel etkileşimleri (oy, kod kopyalama, fiş indirme, üç ekran) duman testinden geçirir.
 *
 * Kullanım:  NODE_PATH=$(npm root -g) node pluxee-geciyor/tools/capture.js [--out <klasör>]
 *
 * Google Fonts, kısıtlı ağlarda Chromium tarafından doğrudan çekilemeyebilir; bu yüzden
 * fontlar curl ile bir kez indirilip (.fontcache) yerelden servis edilir.
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const html = path.join(root, 'index.html');
const argOut = process.argv.indexOf('--out');
const outDir = argOut > -1 ? path.resolve(process.argv[argOut + 1]) : path.join(root, 'screens');
const cache = path.join(root, 'tools', '.fontcache');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cache, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

function ensureFonts(cssUrl) {
  const cssFile = path.join(cache, 'fonts.css');
  if (!fs.existsSync(cssFile)) {
    execSync(`curl -sS -A "${UA}" -o "${cssFile}" "${cssUrl}"`);
    const css = fs.readFileSync(cssFile, 'utf8');
    for (const m of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)) {
      const f = path.join(cache, path.basename(m[1]));
      if (!fs.existsSync(f)) execSync(`curl -sS -o "${f}" "${m[1]}"`);
    }
  }
  return fs.readFileSync(cssFile, 'utf8');
}

const SHOTS = [
  // [dosya adı, sorgu, bekleme ms, eylem]
  ['S0-isinma-11-57', 'hour=11&min=57&cat=news&city=06', 1600],
  ['S1-saat-12', 'hour=12&min=0&cat=news&city=06', 1300],
  ['S2-soru-finans-12-07', 'hour=12&min=7&cat=finance&city=06', 1800],
  ['S3-cevap-finans-12-07', 'hour=12&min=7&cat=finance&city=06', 1800, 'vote:siparis'],
  ['S3-kafe-azinlik', 'hour=12&min=9&cat=news&city=34', 1800, 'vote:kafe'],
  ['S3-erzurum-esik-alti', 'hour=12&min=20&cat=news&city=25', 1800, 'vote:siparis'],
  ['S4-ilk-okuma-market-izmir-yagmur', 'hour=12&min=38&cat=market&city=35&weather=rain&seq=2', 1800, 'vote:siparis'],
  ['S4b-gec-mola-spor-13-12', 'hour=13&min=12&cat=sport&city=06', 1800],
  ['S2-tarif-ceyrek', 'hour=12&min=15&cat=recipe&city=34', 1800],
  ['S3-kultur-cuma-bire-ceyrek', 'hour=12&min=45&cat=culture&city=34&dow=5', 1800, 'vote:kafe'],
  ['S2-teknoloji-on-iki-bucuk', 'hour=12&min=30&cat=tech&city=00', 1800],
  ['S5-isveren-kariyer-12-07', 'hour=12&min=7&cat=career&seg=hr&city=06', 2200],
  ['S5b-ogle-raporu-finans-15-10', 'hour=15&min=10&cat=finance&seg=hr&city=34', 2200],
  ['S5b-rapor-kariyer-ilan-satiri', 'hour=15&min=10&cat=career&seg=hr&city=34', 2200],
  ['S6a-pazartesi-12-04', 'hour=12&min=4&cat=news&cal=monday&dow=1&city=06', 1800],
  ['S6b-ayin-biri', 'hour=12&min=4&cat=news&cal=payday&dom=1&city=06', 1800],
  ['S6c-ay-sonu', 'hour=12&min=4&cat=market&cal=eom&dom=27&city=06', 1800],
  ['S7-kapanis-14-00', 'hour=14&min=0&cat=news&city=06&seq=3', 2600],
  ['S8-pencere-disi-15-10', 'hour=15&min=10&cat=news&city=06', 1800],
  ['E0-isveren-sabah-10-40', 'hour=10&min=40&cat=career&seg=hr&city=34', 1600],
  ['R1-ramazan-iftara-43-dk', 'hour=19&min=5&cat=news&cal=ramadan&city=35', 1800],
  ['R2-ramazan-cevap', 'hour=19&min=5&cat=news&cal=ramadan&city=35', 1800, 'vote:evde'],
  ['R3-iftar-vakti', 'hour=19&min=48&cat=news&cal=ramadan&city=35', 1300],
  ['R5-ramazan-isveren', 'hour=19&min=5&cat=career&cal=ramadan&city=35&seg=hr', 1800],
];

(async () => {
  const src = fs.readFileSync(html, 'utf8');
  const cssUrl = src.match(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1].replace(/&amp;/g, '&');
  const fontCss = ensureFonts(cssUrl);
  const browser = await chromium.launch();
  const errors = [];
  const mkCtx = async (w, h) => {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, acceptDownloads: true });
    await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fontCss }));
    await ctx.route('**/fonts.gstatic.com/**', (r) => {
      const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
      fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
    });
    return ctx;
  };
  const hook = (page, tag) => {
    page.on('pageerror', (e) => errors.push(`${tag}: ${e.message}`));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(`${tag}: ${m.text()}`); });
  };

  // 1) Birim sahneleri (canlı mod, 970x250, simülatörsüz)
  const ctx = await mkCtx(970, 250);
  const page = await ctx.newPage();
  hook(page, 'unit');
  for (const [name, q, wait, act] of SHOTS) {
    await page.goto('file://' + html + '?dev=0&' + q);
    await page.waitForTimeout(400);
    if (act && act.startsWith('vote:')) {
      const k = act.slice(5);
      await page.click(`.unit button[data-vote="${k}"]`);
    }
    await page.waitForTimeout(wait);
    const unitBox = await page.$eval('.unit', (el) => { const r = el.getBoundingClientRect(); return { w: r.width, h: r.height }; });
    if (unitBox.w !== 970 || unitBox.h !== 250) errors.push(`${name}: birim boyutu ${unitBox.w}x${unitBox.h}`);
    // satır sayısı kontrolü: H1 en fazla 2 satır (2×38), alt satır en fazla 2 satır (2×20); satır içi glif taşması (≤6px) tolere edilir
    const overflow = await page.$$eval('.unit > .left .h1, .unit > .left .sub', (els) => els.map((e) => ({ c: e.className, sh: e.scrollHeight, ch: e.clientHeight, t: e.textContent.trim().slice(0, 60) })).filter((x) => x.sh > x.ch + 6));
    for (const o of overflow) errors.push(`${name}: metin taşması (${o.c}: ${o.sh}>${o.ch}) "${o.t}"`);
    const simVisible = await page.$eval('.stage', (el) => getComputedStyle(el).display !== 'none');
    if (simVisible) errors.push(`${name}: canlı modda simülatör görünür`);
    await page.screenshot({ path: path.join(outDir, `${name}.png`) });
    const h1 = await page.$eval('.unit .h1', (e) => e.textContent.trim());
    const sub = await page.$eval('.unit .sub', (e) => e.textContent.trim());
    console.log(`✔ ${name.padEnd(36)} ${h1}  |  ${sub}`);
  }

  // 2) Etkileşim duman testi
  await page.goto('file://' + html + '?dev=0&hour=12&min=4&cat=news&cal=monday&dow=1&city=06');
  await page.waitForTimeout(600);
  await page.click('.unit button[data-copy]');
  await page.waitForTimeout(200);
  const copied = await page.$eval('.unit button[data-copy]', (b) => b.textContent);
  if (!/Kopyalandı/.test(copied)) errors.push('kod kopyalama geri bildirimi yok: ' + copied);
  await page.goto('file://' + html + '?dev=0&hour=12&min=7&cat=finance&city=06');
  await page.waitForTimeout(600);
  await page.click('.unit button[data-vote="siparis"]');
  await page.waitForTimeout(800);
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 5000 }).catch(() => null), page.click('.unit button[data-act="fis"]')]);
  if (!dl) errors.push('fiş indirme olayı gelmedi');
  else { const p = path.join(outDir, 'ogle-arasi-fisi.png'); await dl.saveAs(p); console.log('✔ fiş üretildi →', path.relative(root, p)); }
  // tıklama çıkışı: popup açılmalı
  const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null), page.click('.unit', { position: { x: 300, y: 60 } })]);
  if (!popup) errors.push('birime tıklama yeni pencere açmadı');
  else { console.log('✔ tıklama çıkışı →', popup.url()); await popup.close(); }
  await ctx.close();

  // 3) Sunum kabuğu (dev) + üç ekran
  const ctx2 = await mkCtx(1100, 900);
  const p2 = await ctx2.newPage();
  hook(p2, 'dev');
  await p2.goto('file://' + html);
  await p2.waitForTimeout(1800);
  const simShown = await p2.$eval('#sim', (el) => el.children.length > 3);
  if (!simShown) errors.push('dev modunda simülatör kurulmadı');
  await p2.screenshot({ path: path.join(outDir, 'sunum-kabugu.png'), fullPage: true });
  // döngüyü 15 sn izle: sahne değişmeli
  const ids = new Set();
  for (let i = 0; i < 16; i++) { ids.add(await p2.$eval('#ctxLine', (e) => e.textContent.split('sahne ')[1])); await p2.waitForTimeout(1000); }
  if (ids.size < 3) errors.push('döngü sahne değiştirmiyor: ' + [...ids].join(','));
  console.log('✔ döngü sahneleri:', [...ids].join(' → '));
  await p2.click('.pill:has-text("Üç ekran")');
  await p2.waitForTimeout(2000);
  await p2.screenshot({ path: path.join(outDir, 'uc-ekran.png'), fullPage: true });
  const units = await p2.$$eval('#triple > div > .unit', (els) => els.length);
  if (units !== 3) errors.push('üç ekran ' + units + ' birim üretti');
  // simülatörden Ramazan seç
  await p2.click('.grp[data-group="Gün"] .pill:has-text("Ramazan")');
  await p2.waitForTimeout(1600);
  await p2.screenshot({ path: path.join(outDir, 'sunum-ramazan.png'), clip: { x: 0, y: 0, width: 1100, height: 330 } });
  await ctx2.close();
  await browser.close();

  if (errors.length) { console.error('\n✖ Sorunlar:\n - ' + errors.join('\n - ')); process.exit(1); }
  console.log(`\n✔ ${SHOTS.length} sahne + duman testi temiz → ${path.relative(root, outDir)}/`);
})().catch((e) => { console.error(e); process.exit(1); });
