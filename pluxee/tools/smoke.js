#!/usr/bin/env node
'use strict';
/**
 * Duman testi: koridor sürümü (ana teslim), sunum sayfası ve arşiv sürümleri.
 * Kullanım: NODE_PATH=$(npm root -g) node pluxee/tools/smoke.js
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const data = require('../src/data');
const { routeFonts } = require('./fonts');

const root = path.join(__dirname, '..');
const DIST = path.join(root, 'dist', '970x250', 'index.html');
const POS = path.join(root, 'dist', '970x250-pos', 'index.html');
const FLAT = path.join(root, 'dist', '970x250-flat', 'index.html');
const C = data.cinematic, K = data.corridor, T = K.timing;
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✔' : '  ✘'} ${msg}`); if (!cond) failures++; };
const openAt = (page, file, qs) => page.goto('file://' + file + (qs ? '?' + qs : ''));
const gateAt = (i) => T.enter + T.gates[i] * T.cruise;

const st = (page) => page.evaluate(() => {
  const ad = document.getElementById('ad');
  const s = window.PLUXEE.state();
  const nodes = [...ad.querySelectorAll('.node')];
  return Object.assign(s, {
    cls: [...ad.classList], leadAttr: ad.dataset.lead,
    nodes: nodes.map((e) => e.querySelector('b').textContent.trim()), done: nodes.filter((e) => e.classList.contains('is-done')).map((e) => e.dataset.key),
    nextNode: (nodes.find((e) => e.classList.contains('is-next')) || { dataset: {} }).dataset.key,
    passed: [...ad.querySelectorAll('.gate.is-pass')].map((e) => e.dataset.key),
    hintCls: ad.querySelector('.scene').classList.contains('is-hint'), dragCls: ad.querySelector('.scene').classList.contains('is-drag'),
    eyebrow: ad.querySelector('.eyebrow').textContent, word: (ad.querySelector('.l1 span.on') || {}).textContent, line2: ad.querySelector('.l2').textContent, sub: ad.querySelector('.sub').textContent, cta: ad.querySelector('.cta-t').textContent,
    layer: (ad.querySelector('.bg canvas.is-on') || { dataset: {} }).dataset.key, layers: ad.querySelectorAll('.bg canvas').length,
    prog: parseFloat(ad.querySelector('.route .prog').style.width) || 0,
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

  console.log('\nDosya (koridor)');
  const html = fs.readFileSync(DIST, 'utf8');
  ok(Buffer.byteLength(html) < 150 * 1024, `boyut ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB (< 150 KB)`);
  const ext = [...html.matchAll(/https?:\/\/[^"' )]+/g)].map((m) => m[0]).filter((u) => !/fonts\.g(oogleapis|static)\.com|pluxee\.com\.tr/.test(u));
  ok(ext.length === 0, 'harici kaynak yalnızca Google Fonts + tıklama hedefi' + (ext.length ? ': ' + ext.join(', ') : ''));
  ok(!/Yemek Kartı|Splash/i.test(html), 'logonun yanında ürün yazısı ve ajans adı yok');
  ok(!/noktada|Levent|ikindi|yarın sabah/i.test(html), 'konum/nokta sayısı ve gün etiketleri kullanılmıyor');
  ok(!/__[A-Z]+__/.test(html), 'yer tutucu kalmadı');

  console.log('\nSinyal → koridor');
  await openAt(page, DIST, 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10); await page.waitForTimeout(300);
  let s = await st(page);
  ok(s.lead === 'restoran' && s.variant === 'WC-RESTORAN' && s.order.join(',') === 'restoran,kafe,market,online', `öğle 12:31 → Restoran kapısıyla açılır, varyant ${s.variant}`);
  ok(s.nodes.join('|') === 'Restoran|Kafe|Market|Online', 'rota noktaları: ' + s.nodes.join(' → '));
  ok(s.layers === 6 && s.layer === 'restoran', 'arka plan katmanları (5 sahne + final) üretildi, restoran açık');
  ok(s.cta === C.segments.wc.cta && s.sub === C.segments.wc.sub && s.cls.includes('is-live'), 'beyaz yaka alt metin + CTA');
  ok(s.eyebrow === 'Öğle yemeği' && s.word === 'Restoranda,' && s.line2 === K.line2, 'başlık: "Öğle yemeği / Restoranda, / Pluxee geçiyor."');
  await page.waitForTimeout(T.enter + 700);
  s = await st(page);
  ok(s.phase === 'fly' && s.hint && s.hintCls && s.t > 0, 'uçuş başladı, "Sürükleyin, yol alın" ipucu görünür');
  await page.waitForTimeout(gateAt(0) + 450 - (T.enter + 1000));
  s = await st(page);
  ok(s.visited === 1 && s.done[0] === 'restoran' && s.passed.includes('restoran'), 'ilk kapıdan geçiş: flaş + "Geçti ✓" + rota noktası (1/4)');
  ok(s.word === 'Kafede,' && s.eyebrow === 'Kahve molası' && s.nextNode === 'kafe' && s.layer === 'kafe', 'geçişten sonra bir sonraki kapı: "Kafede,"');
  ok(s.prog > 15 && s.prog < 30, `rota ilerlemesi %${s.prog.toFixed(0)}`);

  console.log('\nKullanıcı aksiyonu: sürükle / basılı tut / yönlendir');
  const before = (await st(page)).t;
  await page.mouse.move(800, 150); await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(800 - 160 * i / 8, 150); await page.waitForTimeout(25); }
  await page.waitForTimeout(80);
  s = await st(page);
  ok(s.dragCls && s.userPlayed && !s.hint && s.t > before + 0.2, `sola sürükleme ileri götürüyor (t ${before.toFixed(2)} → ${s.t.toFixed(2)}), ipucu kayboldu`);
  ok(s.visited >= 2 && s.done.includes('kafe'), 'sürüklerken geçilen kapılar sayılıyor (' + s.visited + '/4)');
  await page.mouse.up(); await page.waitForTimeout(400);
  const afterUp = (await st(page)).t;
  ok(afterUp >= s.t, 'bırakınca atalet ile ilerliyor');
  ok((await page.evaluate(() => window.__opened)) === null, 'sürükleme reklam çıkışı yapmıyor');
  // geri sürükleme
  await page.mouse.move(700, 150); await page.mouse.down();
  for (let i = 1; i <= 6; i++) { await page.mouse.move(700 + 120 * i / 6, 150); await page.waitForTimeout(25); }
  await page.waitForTimeout(60);
  s = await st(page);
  ok(s.t < afterUp, 'sağa sürükleme geri götürüyor');
  ok(s.visited >= 2, 'geçilen kapı sayısı geri giderken korunuyor');
  await page.mouse.up(); await page.waitForTimeout(T.resume + 400);
  const t1 = (await st(page)).t; await page.waitForTimeout(500); const t2 = (await st(page)).t;
  ok(t2 > t1, `bırakıldıktan ${T.resume / 1000} sn sonra otomatik uçuş sürüyor`);
  // basılı tut → hızlan
  await page.mouse.move(720, 150); await page.mouse.down(); await page.waitForTimeout(300);
  const b0 = (await st(page)).t; await page.waitForTimeout(800); const b1 = (await st(page)).t; await page.mouse.up();
  ok(b1 - b0 > (800 / T.cruise) * 2, `basılı tutunca hızlanıyor (Δt ${(b1 - b0).toFixed(3)} vs seyir ${(800 / T.cruise).toFixed(3)})`);
  await page.waitForTimeout(200);
  // rota noktasına tıklama
  await openAt(page, DIST, 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10); await page.waitForTimeout(T.enter + 400);
  await page.click('.node[data-i="3"]'); await page.waitForTimeout(900);
  s = await st(page);
  ok(Math.abs(s.t - (T.gates[3] - 0.12)) < 0.06 && s.nextNode === 'online' && s.visited === 3, 'rota noktasına tıklama o kapının önüne götürüyor (aradaki kapılar geçilmiş sayılır)');
  // klavye
  await page.focus('#ad'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(500);
  const k0 = (await st(page)).t;
  ok(k0 < T.gates[3] - 0.12 - 0.05, 'klavye sol ok geri götürüyor');
  await page.keyboard.press(' '); await page.waitForTimeout(600);
  ok((await st(page)).t > k0 + 0.05, 'boşluk tuşu hızlandırıyor');
  // final
  await page.keyboard.press('ArrowRight'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(1500);
  await page.waitForTimeout((1 - (await st(page)).t) * T.cruise + 600);
  s = await st(page);
  ok(s.finalState && s.phase === 'final' && s.visited === 4 && s.word === K.final.word && s.eyebrow === K.final.title && s.layer === 'final', 'final: koridor açılır, "Burada, şurada, orada / Her yerde, Pluxee geçiyor."');
  await page.waitForTimeout(T.hold + 400);
  s = await st(page);
  ok(s.ended && (await page.$eval('.again', (e) => getComputedStyle(e).display)) !== 'none', 'kullanıcı oynadı: döngü yok, "Tekrar geç" görünür');
  await page.click('.again'); await page.waitForTimeout(T.enter + 300);
  s = await st(page);
  ok(!s.finalState && s.visited === 0 && s.t < 0.05 && s.phase === 'fly', '"Tekrar geç" baştan başlatıyor');
  // kısa dokunma
  const d0 = (await st(page)).t;
  await page.touchscreen.tap(760, 150); await page.waitForTimeout(500);
  ok((await st(page)).t > d0 + 0.05, 'kısa dokunma ileri sıçratıyor');

  console.log('\nOtomatik gösterim (dokunulmazsa)');
  await openAt(page, DIST, 'seg=hr&h=19&m=5'); await page.mouse.move(10, 10);
  await page.waitForTimeout(gateAt(1) + 400);
  s = await st(page);
  ok(s.variant === 'HR-MARKET' && s.visited === 2 && !s.userPlayed && s.done.join(',') === 'market,online', 'koridor kendiliğinden kat ediliyor: 2 kapı geçildi');
  await page.waitForTimeout(T.enter + T.cruise - gateAt(1) + 600);
  s = await st(page);
  ok(s.finalState && s.visited === 4, `otomatik gösterim ${((T.enter + T.cruise) / 1000).toFixed(1)} sn'de finale ulaşıyor`);

  console.log('\nSegment, saat, hava');
  await openAt(page, DIST, 'seg=hr&h=19&m=5'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'HR-MARKET' && s.order.join(',') === 'market,online,restoran,kafe' && s.cta === C.segments.hr.cta && s.word === 'Markette,', 'akşam 19:05 · İK → Market kapısı, "Teklif alın"');
  await openAt(page, DIST, 'seg=emp&h=9&m=15'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'EMP-KAFE' && s.cta === C.segments.emp.cta, 'sabah 09:15 · işveren → Kafe kapısı, "Bize ulaşın"');
  await openAt(page, DIST, 'seg=wc&h=23&m=45'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'WC-ONLINE' && s.layer === 'online', 'gece 23:45 → Online sipariş kapısı');
  await openAt(page, DIST, 'seg=hr&h=13&m=0&w=rain'); await page.mouse.move(10, 10); await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'HR-ONLINE-RAIN' && s.cls.includes('is-rain') && s.layer === 'rain', 'yağmur (isteğe bağlı) → Online öne alınır, yağmur katmanı');
  await page.waitForTimeout(T.enter + 500);
  const fitted = await page.evaluate(() => { const l1 = document.querySelector('.l1'), n = l1.querySelector('span.on'); return { fits: n.getBoundingClientRect().right <= l1.getBoundingClientRect().right + 0.5, font: document.fonts.check('800 29px Manrope'), text: n.textContent }; });
  ok(fitted.fits && fitted.font, `uzun kelime sütuna sığıyor ("${fitted.text}", Manrope yüklü)`);
  await openAt(page, DIST, 'seg=xx&h=99&w=foo'); await page.waitForTimeout(250);
  s = await st(page);
  ok(/^WC-/.test(s.variant), 'geçersiz parametreler varsayılana düşüyor (' + s.variant + ')');

  console.log('\nTıklama');
  await openAt(page, DIST, 'seg=wc&h=12'); await page.waitForTimeout(200);
  await page.click('.cta');
  ok((await page.evaluate(() => window.__opened)) === data.brand.url, 'CTA Pluxee ana sayfasını açıyor (UTM yok)');
  await page.evaluate(() => { window.__opened = null; });
  await page.mouse.click(150, 60);
  ok((await page.evaluate(() => window.__opened)) === data.brand.url, 'sol sütuna tıklama da reklam çıkışı');
  await page.evaluate(() => { window.__opened = null; });
  await page.mouse.click(700, 120);
  ok((await page.evaluate(() => window.__opened)) === null, 'koridora tıklama reklam çıkışı yapmıyor (etkileşim)');
  await page.evaluate(() => { window.clickTag = 'https://example.com/clicktag'; });
  await page.click('.cta');
  ok((await page.evaluate(() => window.__opened)) === 'https://example.com/clicktag', 'clickTag tanımlıysa o kullanılıyor');

  console.log('\npostMessage API');
  await openAt(page, DIST, 'seg=wc&h=12'); await page.waitForTimeout(200);
  await page.evaluate(() => window.postMessage({ type: 'pluxee:signals', signals: { seg: 'emp', hour: 19, minute: 5, weather: 'sun' } }, '*'));
  await page.waitForTimeout(250);
  s = await st(page);
  ok(s.variant === 'EMP-MARKET' && s.cta === C.segments.emp.cta && typeof s.phase === 'string', 'sinyal mesajı kreatifi yeniden kuruyor: ' + s.variant);
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
  ok(s.ended && s.visited === 4 && s.word === K.final.word, 'hareket azaltma: doğrudan final karesi');
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
  const total = T.enter + T.cruise + T.hold;
  await pl.waitForTimeout(total + 800);
  s = await st(pl);
  ok(s.ended && s.finalState && total <= 30000, `otomatik gösterim ${(total / 1000).toFixed(1)} sn'de final karesinde duruyor (≤ 30 sn)`);
  await ctxL.close();

  console.log('\nArşiv sürümleri – temel kontrol');
  const ctxA = await browser.newContext({ viewport: { width: 970, height: 250 } });
  const pa = await ctxA.newPage();
  const errA = [];
  pa.on('pageerror', (e) => errA.push(e.message));
  await openAt(pa, POS, 'seg=hr&h=19&m=5'); await pa.mouse.move(10, 10); await pa.waitForTimeout(300);
  const a1 = await pa.evaluate(() => window.PLUXEE.state());
  ok(a1.variant === 'HR-MARKET' && errA.length === 0, 'POS sürükle-okut sürümü çalışıyor: ' + a1.variant);
  await openAt(pa, FLAT, 'seg=hr&h=19&m=5'); await pa.mouse.move(10, 10); await pa.waitForTimeout(300);
  const a2 = await pa.evaluate(() => window.PLUXEE.state());
  ok(a2.variant === 'HR-EVENING-LEVENT-SUN' && errA.length === 0, 'ilk taslak çalışıyor: ' + a2.variant);
  await ctxA.close();

  await browser.close();
  console.log(failures ? `\n${failures} kontrol başarısız` : '\nTüm kontroller geçti');
  process.exit(failures ? 1 : 0);
})();
