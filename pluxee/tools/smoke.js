#!/usr/bin/env node
'use strict';
/**
 * Duman testi: sinematik sürüm (ana teslim), sunum sayfası ve ilk taslak.
 * Kullanım: NODE_PATH=$(npm root -g) node pluxee/tools/smoke.js
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const data = require('../src/data');
const { routeFonts } = require('./fonts');

const root = path.join(__dirname, '..');
const DIST = path.join(root, 'dist', '970x250', 'index.html');
const FLAT = path.join(root, 'dist', '970x250-flat', 'index.html');
const C = data.cinematic, T = data.timingCinematic;
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✔' : '  ✘'} ${msg}`); if (!cond) failures++; };
const openAt = (page, file, qs) => page.goto('file://' + file + (qs ? '?' + qs : ''));

const st = (page) => page.evaluate(() => {
  const ad = document.getElementById('ad');
  const s = window.PLUXEE.state();
  const steps = [...ad.querySelectorAll('.step')];
  return Object.assign(s, {
    cls: [...ad.classList], lead: ad.dataset.lead, variantAttr: ad.dataset.variant,
    steps: steps.map((e) => e.querySelector('b').textContent.trim()), done: steps.filter((e) => e.classList.contains('is-done')).map((e) => e.dataset.key),
    here: (steps.find((e) => e.classList.contains('is-here')) || { dataset: {} }).dataset.key,
    posOk: ad.querySelector('.pos').classList.contains('is-ok'), tagOk: ad.querySelector('.tag').classList.contains('is-ok'), tag: ad.querySelector('.tag .t').textContent,
    eyebrow: ad.querySelector('.eyebrow').textContent, word: (ad.querySelector('.l2 span.on') || {}).textContent, sub: ad.querySelector('.sub').textContent, cta: ad.querySelector('.cta-t').textContent,
    layer: (ad.querySelector('.bg canvas.is-on') || { dataset: {} }).dataset.key, layers: ad.querySelectorAll('.bg canvas').length,
  });
});

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, hasTouch: true });
  await routeFonts(ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => { window.__opened = null; window.open = (u) => { window.__opened = u; return null; }; });

  console.log('\nDosya (sinematik)');
  const html = fs.readFileSync(DIST, 'utf8');
  ok(Buffer.byteLength(html) < 150 * 1024, `boyut ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB (< 150 KB)`);
  const ext = [...html.matchAll(/https?:\/\/[^"' )]+/g)].map((m) => m[0]).filter((u) => !/fonts\.g(oogleapis|static)\.com|pluxee\.com\.tr/.test(u));
  ok(ext.length === 0, 'harici kaynak yalnızca Google Fonts + tıklama hedefi' + (ext.length ? ': ' + ext.join(', ') : ''));
  ok(!/Yemek Kartı/i.test(html) && !/Yemek Kartı/i.test(fs.readFileSync(FLAT, 'utf8')), 'logonun yanında "Yemek Kartı" yok (her iki sürüm)');
  ok(!/noktada|Levent|ikindi|yarın sabah/i.test(html), 'konum/nokta sayısı ve gün etiketleri kullanılmıyor');

  console.log('\nSinyal → sahne');
  await openAt(page, DIST, 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10); await page.waitForTimeout(300);
  let s = await st(page);
  ok(s.lead === 'restoran' && s.variant === 'WC-RESTORAN' && s.order.join(',') === 'restoran,kafe,market,online', `öğle 12:31 → Restoran ile açılır, varyant ${s.variant}`);
  ok(s.steps.join('|') === 'Restoran|Kafe|Market|Online', 'sahne başlıkları: ' + s.steps.join(' · '));
  ok(s.layers === 5 && s.layer === 'restoran', 'fotoğrafik arka plan katmanları üretildi, restoran katmanı açık');
  ok(s.cta === C.segments.wc.cta && s.sub === C.segments.wc.sub && s.cls.includes('is-live'), 'beyaz yaka alt metin + CTA');
  await page.waitForTimeout(T.enter + 300);
  s = await st(page);
  ok(s.eyebrow === 'Öğle yemeği' && s.word === 'restoranda.' && s.here === 'restoran', 'başlık: "Öğle yemeği / Pluxee geçiyor restoranda."');
  await page.waitForTimeout(T.tap + 500);
  s = await st(page);
  ok(s.posOk && s.tagOk && s.tag === 'burada' && s.visited === 1 && s.done[0] === 'restoran', 'kart POS\'a dokundu: Onaylandı + "burada" etiketi');
  const finalAt = T.enter + C.scenes.length * T.dwell + 500;
  await page.waitForTimeout(finalAt - (T.enter + 300 + T.tap + 500 + 300));
  s = await st(page);
  ok(s.finalState && s.visited === 4 && s.word === 'her yerde.' && s.eyebrow === C.final.title, `4/4 sahne ve final: "${s.eyebrow} / her yerde." (${(finalAt / 1000).toFixed(1)} sn)`);

  console.log('\nSegment, saat, hava');
  await openAt(page, DIST, 'seg=hr&h=19&m=5'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'HR-MARKET' && s.order.join(',') === 'market,online,restoran,kafe' && s.cta === C.segments.hr.cta, 'akşam 19:05 · İK → Market ile açılır, "Teklif alın"');
  await openAt(page, DIST, 'seg=emp&h=9&m=15'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'EMP-KAFE' && s.cta === C.segments.emp.cta, 'sabah 09:15 · işveren → Kafe ile açılır, "Bize ulaşın"');
  await openAt(page, DIST, 'seg=wc&h=23&m=45'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'WC-ONLINE' && s.layer === 'online', 'gece 23:45 → Online sipariş ile açılır');
  await openAt(page, DIST, 'seg=hr&h=13&m=0&w=rain'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'HR-ONLINE-RAIN' && s.cls.includes('is-rain') && s.layer === 'rain', 'yağmur (isteğe bağlı) → Online öne alınır, yağmur katmanı');
  await page.waitForTimeout(T.enter + 700);
  const fitted = await page.evaluate(() => { const l2 = document.querySelector('.l2'), n = l2.querySelector('span.on'); return { fits: n.getBoundingClientRect().right <= l2.getBoundingClientRect().right + 0.5, font: document.fonts.check('800 29px Manrope'), text: n.textContent }; });
  ok(fitted.fits && fitted.font, `uzun kelime sütuna sığıyor ("${fitted.text}", Manrope yüklü)`);
  await openAt(page, DIST, 'seg=xx&h=99&w=foo'); await page.waitForTimeout(250);
  s = await st(page);
  ok(/^WC-/.test(s.variant), 'geçersiz parametreler varsayılana düşüyor (' + s.variant + ')');

  console.log('\nEtkileşim');
  await openAt(page, DIST, 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10);
  await page.waitForTimeout(T.enter + T.dwell + 300);
  await page.mouse.move(470 + 20 + 3.5 * 115, 150); await page.waitForTimeout(250);
  s = await st(page);
  ok(s.manual && s.cls.includes('is-manual') && s.idx === 3 && s.here === 'online', 'fare sahneye girince elle kontrol; sağ uçta 4. sahne');
  await page.waitForTimeout(T.tap + 500);
  s = await st(page);
  ok(s.done.includes('online') && s.word === 'online siparişte.', 'gezilen sahnede kart dokunuyor, başlık değişiyor');
  ok((await page.evaluate(() => window.__opened)) === null, 'sahnedeki hareket reklam çıkışı yapmıyor');
  await page.mouse.move(10, 10); await page.waitForTimeout(T.resume + 300);
  s = await st(page);
  ok(!s.manual, `fare ayrılınca ${T.resume / 1000} sn sonra otomatik oynatma sürüyor`);
  await page.click('.step[data-i="2"]'); await page.waitForTimeout(T.tap + 400);
  s = await st(page);
  ok(s.idx === 2 && s.done.includes('market'), 'alt başlığa tıklama ilgili sahneye götürüyor');
  ok((await page.evaluate(() => window.__opened)) === null, 'başlık tıklaması sayfa açmıyor');
  await page.mouse.move(10, 10); await page.waitForTimeout(T.resume + 300);
  await page.focus('#ad'); const before = (await st(page)).idx;
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(150);
  s = await st(page);
  ok(s.idx === Math.min(before + 1, 3) || s.idx !== before, 'klavye sağ ok sahne değiştiriyor');
  await page.mouse.move(10, 10); await page.waitForTimeout(T.resume + 300);
  await page.touchscreen.tap(470 + 20 + 0.5 * 115, 150); await page.waitForTimeout(200);
  s = await st(page);
  ok(s.idx === 0, 'dokunma ile ilk sahneye gidiliyor');

  console.log('\nTıklama');
  await openAt(page, DIST, 'seg=wc&h=12'); await page.waitForTimeout(200);
  await page.click('.cta');
  ok((await page.evaluate(() => window.__opened)) === data.brand.url, 'CTA marka sayfasını açıyor (UTM ile)');
  await page.evaluate(() => { window.__opened = null; });
  await page.mouse.click(150, 60);
  ok((await page.evaluate(() => window.__opened)) === data.brand.url, 'sol sütuna tıklama da reklam çıkışı');
  await page.evaluate(() => { window.__opened = null; window.clickTag = 'https://example.com/clicktag'; });
  await page.click('.cta');
  ok((await page.evaluate(() => window.__opened)) === 'https://example.com/clicktag', 'clickTag tanımlıysa o kullanılıyor');

  console.log('\npostMessage API');
  await openAt(page, DIST, 'seg=wc&h=12'); await page.waitForTimeout(200);
  await page.evaluate(() => window.postMessage({ type: 'pluxee:signals', signals: { seg: 'emp', hour: 19, minute: 5, weather: 'sun' } }, '*'));
  await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'EMP-MARKET' && s.cta === C.segments.emp.cta, 'sinyal mesajı kreatifi yeniden kuruyor: ' + s.variant);
  await page.evaluate(() => window.postMessage({ type: 'pluxee:demo', on: true }, '*')); await page.waitForTimeout(100);
  ok((await st(page)).cls.includes('is-demo'), 'demo mesajı sinyal çubuğunu açıyor');
  await page.evaluate(() => { window.__opened = null; });
  await page.click('.cta');
  ok((await page.evaluate(() => window.__opened)) === null, 'gömülü modda tıklama pencere açmak yerine mesaj yayınlıyor');
  ok(errors.length === 0, 'konsolda hata yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await ctx.close();

  console.log('\nprefers-reduced-motion');
  const ctxR = await browser.newContext({ viewport: { width: 970, height: 250 }, reducedMotion: 'reduce' });
  await routeFonts(ctxR);
  const pr = await ctxR.newPage();
  await openAt(pr, DIST, 'seg=wc&h=12'); await pr.waitForTimeout(300);
  s = await st(pr);
  ok(s.ended && s.visited === 4 && s.word === 'her yerde.', 'hareket azaltma: doğrudan final karesi');
  await ctxR.close();

  console.log('\nSunum sayfası');
  const ctxS = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await routeFonts(ctxS);
  const ps = await ctxS.newPage();
  const errS = [];
  ps.on('pageerror', (e) => errS.push(e.message));
  await ps.goto('file://' + path.join(root, 'preview', 'index.html'));
  await ps.waitForTimeout(1200);
  ok((await ps.textContent('#variant')) === 'WC-RESTORAN', 'gömülü kreatif durum bildiriyor');
  ok((await ps.$$eval('#chain li', (l) => l.length)) === 3, 'karar zinciri 3 satır');
  await ps.click('#presets button:nth-of-type(3)'); await ps.waitForTimeout(600);
  ok((await ps.textContent('#variant')) === 'EMP-KAFE', 'hazır senaryo kreatifi değiştiriyor');
  await ps.frameLocator('#ad').locator('.cta').click(); await ps.waitForTimeout(200);
  ok((await ps.$eval('#toast', (e) => e.classList.contains('is-on'))), 'tıklama sunumda toast olarak gösteriliyor');
  ok(errS.length === 0, 'sunum sayfasında hata yok' + (errS.length ? ': ' + errS.join(' | ') : ''));
  await ctxS.close();

  console.log('\n30 sn sınırı');
  const ctxL = await browser.newContext({ viewport: { width: 970, height: 250 } });
  await routeFonts(ctxL);
  const pl = await ctxL.newPage();
  await openAt(pl, DIST, 'seg=wc&h=12'); await pl.mouse.move(10, 10);
  const loop = T.enter + C.scenes.length * T.dwell + T.hold;
  await pl.waitForTimeout(loop * T.loops + 600);
  s = await st(pl);
  ok(s.ended && s.finalState, `otomatik oynatma ${(loop * T.loops / 1000).toFixed(1)} sn'de final karesinde duruyor (≤ 30 sn)`);
  await ctxL.close();

  console.log('\nİlk taslak (illüstrasyon) – temel kontrol');
  const ctxF = await browser.newContext({ viewport: { width: 970, height: 250 } });
  const pf = await ctxF.newPage();
  const errF = [];
  pf.on('pageerror', (e) => errF.push(e.message));
  await openAt(pf, FLAT, 'seg=hr&h=19&m=5'); await pf.mouse.move(10, 10); await pf.waitForTimeout(300);
  const f = await pf.evaluate(() => window.PLUXEE.state());
  ok(f.variant === 'HR-EVENING-LEVENT-SUN' && errF.length === 0, 'ilk taslak hâlâ çalışıyor: ' + f.variant);
  await ctxF.close();

  await browser.close();
  console.log(failures ? `\n${failures} kontrol başarısız` : '\nTüm kontroller geçti');
  process.exit(failures ? 1 : 0);
})();
