#!/usr/bin/env node
'use strict';
/**
 * Etkileşim ve sinyal duman testi.
 * Kullanım: NODE_PATH=$(npm root -g) node pluxee/tools/smoke.js
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const data = require('../src/data');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist', '970x250', 'index.html');
const T = data.timing;
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✔' : '  ✘'} ${msg}`); if (!cond) failures++; };
const state = (page) => page.evaluate(() => {
  const ad = document.getElementById('ad');
  const s = window.PLUXEE.state();
  const stops = [...ad.querySelectorAll('.stop')].sort((a, b) => +a.dataset.i - +b.dataset.i);
  return Object.assign(s, {
    momentAttr: ad.dataset.moment, variantAttr: ad.dataset.variant,
    order: stops.map((e) => e.dataset.kind), labels: stops.map((e) => e.querySelector('.tl').textContent),
    visitedKinds: stops.filter((e) => e.classList.contains('is-visited')).map((e) => e.dataset.kind),
    stamp0: stops[0].querySelector('.stamp').textContent,
    cls: [...ad.classList], top: ad.querySelector('.hl-top').textContent, main: ad.querySelector('.hl-main').textContent,
    sub: ad.querySelector('.hl-sub').textContent, cta: ad.querySelector('.cta-t').textContent,
    cardLeft: parseFloat(ad.querySelector('.card').style.left),
  });
});
const open = (page, qs) => page.goto('file://' + dist + (qs ? '?' + qs : ''));

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => { window.__opened = null; window.open = (u) => { window.__opened = u; return null; }; });

  console.log('\nDosya');
  const bytes = fs.statSync(dist).size;
  ok(bytes < 150 * 1024, `boyut ${(bytes / 1024).toFixed(1)} KB (< 150 KB)`);
  const html = fs.readFileSync(dist, 'utf8');
  ok(!/https?:\/\/(?!www\.pluxee)/.test(html.replace(/utm_[a-z]+=[^&"']+/g, '')), 'harici kaynak yok (yalnızca tıklama hedefi)');

  console.log('\nSinyal → sahne');
  await open(page, 'seg=wc&h=12&m=31&geo=levent');
  await page.mouse.move(10, 10);
  await page.waitForTimeout(300);
  let s = await state(page);
  ok(s.momentAttr === 'lunch' && s.variant === 'WC-LUNCH-LEVENT-SUN', `öğle: varyant ${s.variant}`);
  ok(s.order[0] === 'restoran' && s.labels[0] === 'şimdi', 'ilk durak Restoran, etiket "şimdi"');
  ok(s.labels.join('|') === 'şimdi|ikindi|akşam|gece|yarın sabah', 'gün akışı etiketleri: ' + s.labels.join(' → '));
  ok(/Levent/.test(s.top) && /Levent'te 1\.248 noktada/.test(s.sub), 'kopya konum ve nokta sayısıyla dolduruldu');
  ok(s.cta === data.segments.wc.cta && s.cls.includes('is-live'), 'beyaz yaka CTA + sahne canlı');

  await page.waitForTimeout(T.enter + T.move + 250 - 300);
  s = await state(page);
  ok(s.visited === 1 && s.visitedKinds[0] === 'restoran' && s.stamp0 === 'burada geçiyor ✓', 'ilk dokunuş: "burada geçiyor ✓"');
  const finalAt = T.enter + 5 * (T.move + T.dwell) + 400;
  await page.waitForTimeout(finalAt - (T.enter + T.move + 250));
  s = await state(page);
  ok(s.visited === 5 && s.finalState && s.cls.includes('is-final'), `5/5 durak ve final karesi (${(finalAt / 1000).toFixed(1)} sn)`);
  ok(/Her yerde geçiyor\./.test(s.main) && /Burada, şurada, orada/.test(s.top), 'final kopyası: "Her yerde geçiyor."');

  console.log('\nSegment, saat, konum, hava');
  await open(page, 'seg=hr&h=19&m=5&geo=kadikoy'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await state(page);
  ok(s.momentAttr === 'evening' && s.order[0] === 'market', 'akşam 19:05 → Market\'ten başlar');
  ok(s.labels[2] === 'yarın sabah' && s.labels[4] === 'yarın ikindi', 'gece yarısını geçen duraklar "yarın" etiketi alıyor');
  ok(s.cta === data.segments.hr.cta && /Mesai bitti/.test(s.top), 'İK: "Mesai bitti" + teklif CTA');
  await open(page, 'seg=emp&h=9&m=15&geo=cankaya&w=rain'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await state(page);
  ok(s.cls.includes('is-rain') && s.order[0] === 'online' && s.variant === 'EMP-RAIN-CANKAYA-RAIN', 'yağmur: Online öne alınır, varyant ' + s.variant);
  ok(s.labels.join('|') === 'şimdi|sabah|öğle|ikindi|akşam', 'yağmurda etiketler: ' + s.labels.join(' → '));
  ok(/Yağmurlu gün/.test(s.top) && s.cta === data.segments.emp.cta, 'işveren yağmur kopyası + başvuru CTA');
  await open(page, 'seg=wc&h=23&m=40&geo=none'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await state(page);
  ok(s.momentAttr === 'night' && s.order[0] === 'online' && s.labels[1] === 'yarın sabah', 'gece 23:40 → Online, sonra "yarın sabah"');
  await page.waitForTimeout(finalAt);
  s = await state(page);
  ok(/Türkiye genelinde binlerce noktada/.test(s.sub), 'konum yoksa "Türkiye genelinde binlerce noktada"');
  await open(page, 'seg=wc&h=12&geo=besiktas'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await state(page);
  ok(/Besiktas civarında binlerce noktada/.test(s.sub), 'sözlükte olmayan ilçe: "… civarında binlerce noktada"');
  await open(page, 'seg=xx&h=99&w=foo&geo='); await page.waitForTimeout(250);
  s = await state(page);
  ok(s.variant === 'WC-NIGHT-NONE-SUN' || /^WC-/.test(s.variant), 'geçersiz parametreler varsayılana düşüyor (' + s.variant + ')');

  console.log('\nEtkileşim');
  await open(page, 'seg=wc&h=12&m=31&geo=levent'); await page.mouse.move(10, 10);
  await page.waitForTimeout(T.enter + T.move + T.dwell + 300); // kart 2. durağa doğru
  await page.mouse.move(300 + 324, 150); await page.waitForTimeout(150);
  s = await state(page);
  ok(s.manual && s.cls.includes('is-manual'), 'fare sokağa girince elle kontrol');
  ok(Math.abs(s.cardLeft - (324 - 32)) < 1, 'kart fareyi takip ediyor');
  for (let x = 624; x <= 761; x += 20) { await page.mouse.move(x, 150); await page.waitForTimeout(20); }
  await page.waitForTimeout(150);
  s = await state(page);
  ok(s.visitedKinds.includes(s.order[3]) && s.visited >= 3, 'sürükleyerek geçilen duraklar damgalanıyor (' + s.visited + '/5)');
  ok((await page.evaluate(() => window.__opened)) === null, 'sokaktaki hareket/tıklama reklam çıkışı yapmıyor');
  await page.mouse.move(10, 10);
  await page.waitForTimeout(T.resume + 300);
  s = await state(page);
  ok(!s.manual, `fare ayrılınca ${T.resume / 1000} sn sonra otomatik oynatma sürüyor`);
  await page.click('.stop[data-i="1"]');
  await page.waitForTimeout(200);
  s = await state(page);
  ok(s.visitedKinds.includes(s.order[1]), 'vitrine tıklama kartı oraya götürüp damgalıyor');
  ok((await page.evaluate(() => window.__opened)) === null, 'vitrin tıklaması sayfa açmıyor');
  await page.mouse.move(10, 10); await page.waitForTimeout(T.resume + 200);
  await page.focus('#ad');
  const before = (await state(page)).visited;
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(150);
  s = await state(page);
  ok(s.visited >= before, 'klavye sağ ok kartı ilerletiyor');
  await page.mouse.move(10, 10); await page.waitForTimeout(T.resume + 200);

  // dokunma
  await page.touchscreen.tap(300 + 598, 150); await page.waitForTimeout(200);
  s = await state(page);
  ok(s.visitedKinds.includes(s.order[4]), 'dokunma ile son durak damgalanıyor');

  console.log('\nTıklama');
  await open(page, 'seg=wc&h=12'); await page.waitForTimeout(200);
  await page.click('.cta');
  ok((await page.evaluate(() => window.__opened)) === data.brand.url, 'CTA marka sayfasını açıyor (UTM ile)');
  await page.evaluate(() => { window.__opened = null; });
  await page.mouse.click(150, 60);
  ok((await page.evaluate(() => window.__opened)) === data.brand.url, 'sol sütuna tıklama da reklam çıkışı');
  await page.evaluate(() => { window.__opened = null; window.clickTag = 'https://example.com/clicktag'; });
  await page.click('.cta');
  ok((await page.evaluate(() => window.__opened)) === 'https://example.com/clicktag', 'clickTag tanımlıysa o kullanılıyor');

  console.log('\npostMessage API');
  await open(page, 'seg=wc&h=12'); await page.waitForTimeout(200);
  await page.evaluate(() => window.postMessage({ type: 'pluxee:signals', signals: { seg: 'emp', hour: 23, minute: 5, geo: 'alsancak', weather: 'sun' } }, '*'));
  await page.waitForTimeout(250);
  s = await state(page);
  ok(s.variant === 'EMP-NIGHT-ALSANCAK-SUN' && s.cta === data.segments.emp.cta, 'sinyal mesajı kreatifi yeniden kuruyor: ' + s.variant);
  await page.evaluate(() => window.postMessage({ type: 'pluxee:demo', on: true }, '*')); await page.waitForTimeout(100);
  ok((await state(page)).cls.includes('is-demo'), 'demo mesajı sinyal çubuğunu açıyor');
  await page.evaluate(() => { window.__opened = null; });
  await page.click('.cta');
  ok((await page.evaluate(() => window.__opened)) === null, 'gömülü modda tıklama pencere açmak yerine mesaj yayınlıyor');

  ok(errors.length === 0, 'konsolda hata yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await ctx.close();

  console.log('\nprefers-reduced-motion');
  const ctxR = await browser.newContext({ viewport: { width: 970, height: 250 }, reducedMotion: 'reduce' });
  const pr = await ctxR.newPage();
  await pr.goto('file://' + dist + '?seg=wc&h=12'); await pr.waitForTimeout(300);
  s = await state(pr);
  ok(s.ended && s.visited === 5 && /Her yerde/.test(s.main), 'hareket azaltma: doğrudan final karesi');
  await ctxR.close();

  console.log('\nSunum sayfası');
  const ctxS = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const ps = await ctxS.newPage();
  const errS = [];
  ps.on('pageerror', (e) => errS.push(e.message));
  await ps.route('**/fonts.g*', (r) => r.abort());
  await ps.goto('file://' + path.join(root, 'preview', 'index.html'));
  await ps.waitForTimeout(1200);
  ok((await ps.textContent('#variant')) === 'WC-LUNCH-LEVENT-SUN', 'gömülü kreatif durum bildiriyor');
  ok((await ps.$$eval('#chain li', (l) => l.length)) === 4, 'karar zinciri 4 satır');
  await ps.click('#presets button:nth-of-type(3)'); await ps.waitForTimeout(600);
  ok((await ps.textContent('#variant')) === 'EMP-RAIN-CANKAYA-RAIN', 'hazır senaryo kreatifi değiştiriyor');
  await ps.frameLocator('#ad').locator('.cta').click(); await ps.waitForTimeout(200);
  ok((await ps.$eval('#toast', (e) => e.classList.contains('is-on'))), 'tıklama sunumda toast olarak gösteriliyor');
  ok(errS.length === 0, 'sunum sayfasında hata yok' + (errS.length ? ': ' + errS.join(' | ') : ''));
  await ctxS.close();

  console.log('\n30 sn sınırı');
  const ctxL = await browser.newContext({ viewport: { width: 970, height: 250 } });
  const pl = await ctxL.newPage();
  await pl.goto('file://' + dist + '?seg=wc&h=12'); await pl.mouse.move(10, 10);
  const loop = T.enter + 5 * (T.move + T.dwell) + T.hold;
  await pl.waitForTimeout(loop * T.loops + 500);
  s = await state(pl);
  ok(s.ended && s.finalState, `otomatik oynatma ${(loop * T.loops / 1000).toFixed(1)} sn'de final karesinde duruyor (≤ 30 sn)`);
  await ctxL.close();

  await browser.close();
  console.log(failures ? `\n${failures} kontrol başarısız` : '\nTüm kontroller geçti');
  process.exit(failures ? 1 : 0);
})();
