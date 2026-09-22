#!/usr/bin/env node
'use strict';
/**
 * Duman testi: altı konsept (giriş, sinyaller, ana etkileşim, final, tıklama, API), sunum sayfası, arşiv.
 * Kullanım: NODE_PATH=$(npm root -g) node pluxee/tools/smoke.js
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const data = require('../src/data');
const { routeFonts } = require('./fonts');

const root = path.join(__dirname, '..');
const dist = (c) => path.join(root, 'dist', c, 'index.html');
const C = data.cinematic, KT = data.corridor.timing, LT = data.lens.timing, RT = data.receipt.timing, INTRO = 520;
const ALL = ['koridor', 'mercek', 'fis', 'silme', 'hikaye', 'deste'];
const WT = require('../src/concepts/silme').timing, HT = require('../src/concepts/hikaye').timing, DT = require('../src/concepts/deste').timing;
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✔' : '  ✘'} ${msg}`); if (!cond) failures++; };
const openAt = (page, file, qs) => page.goto('file://' + file + (qs ? '?' + qs : ''));
const st = (page) => page.evaluate(() => {
  const ad = document.getElementById('ad'); const s = window.PLUXEE.state();
  return Object.assign(s, { cls: [...ad.classList], eyebrow: ad.querySelector('.eyebrow').textContent, word: (ad.querySelector('.l1 span.on') || {}).textContent, line2: ad.querySelector('.l2').textContent, sub: ad.querySelector('.sub').textContent, cta: ad.querySelector('.cta-t').textContent,
    layer: (ad.querySelector('.bg .is-on[data-key]') || { dataset: {} }).dataset.key, hintCls: ad.querySelector('.scene').classList.contains('is-hint'), again: getComputedStyle(ad.querySelector('.again')).display !== 'none' });
});

function fileChecks(id) {
  const html = fs.readFileSync(dist(id), 'utf8');
  const hasPhotos = /data:image\/(jpeg|webp|png);base64/.test(html);
  const limit = hasPhotos ? 600 : 150; // fotoğraflı derleme: premium masthead / DV360 polite-load sınırları; Google Ads 150 KB için fotoğrafsız derleme
  ok(Buffer.byteLength(html) < limit * 1024, `${id}: boyut ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB (< ${limit} KB${hasPhotos ? ', fotoğraflar gömülü' : ''})`);
  const ext = [...html.matchAll(/https?:\/\/[^"' )]+/g)].map((m) => m[0]).filter((u) => !/fonts\.g(oogleapis|static)\.com|pluxee\.com\.tr/.test(u));
  ok(ext.length === 0 && !/__[A-Z_]+__/.test(html), `${id}: harici kaynak yalnızca Google Fonts + ana sayfa; yer tutucu yok`);
  ok(!/Yemek Kartı|Splash|utm_|noktada|Levent|ikindi/i.test(html), `${id}: ajans adı, UTM, konum ve gün etiketi yok`);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, hasTouch: true });
  await routeFonts(ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => { window.__opened = null; window.open = (u) => { window.__opened = u; return null; }; });

  console.log('\nDosyalar');
  for (const id of ALL) fileChecks(id);
  ok(fs.readFileSync(dist('970x250'), 'utf8') === fs.readFileSync(dist('koridor'), 'utf8'), 'dist/970x250 varsayılan konseptin kopyası');

  console.log('\nOrtak: giriş, sinyaller, tıklama, API');
  await openAt(page, dist('koridor'), 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10); await page.waitForTimeout(120);
  let s = await st(page);
  ok(s.cls.includes('is-in') && !s.cls.includes('is-live'), 'giriş: ışık süpürmesi + logo açılışı başladı, sahne henüz kapalı');
  await page.waitForTimeout(INTRO + 300);
  s = await st(page);
  ok(s.cls.includes('is-live') && s.variant === 'WC-RESTORAN' && s.order.join(',') === 'restoran,kafe,market,online', `sahne açıldı, varyant ${s.variant}`);
  ok(s.word === 'Restoranda,' && s.line2 === 'Pluxee geçiyor.' && s.eyebrow === 'Öğle yemeği' && s.cta === C.segments.wc.cta, 'kopya: "Öğle yemeği / Restoranda, / Pluxee geçiyor." + beyaz yaka CTA');
  await openAt(page, dist('koridor'), 'seg=hr&h=19&m=5'); await page.waitForTimeout(INTRO + 300); s = await st(page);
  ok(s.variant === 'HR-MARKET' && s.order[0] === 'market' && s.cta === C.segments.hr.cta && s.word === 'Markette,', 'akşam 19:05 · İK → Market önce, "Teklif alın"');
  await openAt(page, dist('koridor'), 'seg=emp&h=13&m=0&w=rain'); await page.waitForTimeout(INTRO + 300); s = await st(page);
  ok(s.variant === 'EMP-ONLINE-RAIN' && s.cls.includes('is-rain') && s.cta === C.segments.emp.cta, 'yağmur · işveren → Online önce, "Bize ulaşın"');
  await page.click('.cta');
  ok((await page.evaluate(() => window.__opened)) === data.brand.url, 'CTA Pluxee ana sayfasını açıyor (UTM yok)');
  await page.evaluate(() => { window.__opened = null; window.clickTag = 'https://example.com/ct'; }); await page.mouse.click(150, 60);
  ok((await page.evaluate(() => window.__opened)) === 'https://example.com/ct', 'sol sütun tıklaması + clickTag');
  await page.evaluate(() => { window.__opened = null; }); await page.mouse.click(700, 120); await page.waitForTimeout(100);
  ok((await page.evaluate(() => window.__opened)) === null, 'sahne tıklaması reklam çıkışı yapmıyor');
  await page.evaluate(() => window.postMessage({ type: 'pluxee:signals', signals: { seg: 'wc', hour: 23, minute: 45, weather: 'sun' } }, '*')); await page.waitForTimeout(INTRO + 400); s = await st(page);
  ok(s.variant === 'WC-ONLINE' && s.cls.includes('is-live'), 'postMessage sinyali kreatifi yeniden kuruyor (giriş dahil): ' + s.variant);
  await page.evaluate(() => window.postMessage({ type: 'pluxee:demo', on: true }, '*')); await page.waitForTimeout(80);
  ok((await st(page)).cls.includes('is-demo'), 'demo mesajı sinyal çubuğunu açıyor');

  console.log('\nKoridor');
  await openAt(page, dist('koridor'), 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10);
  await page.waitForTimeout(INTRO + KT.enter + 900); s = await st(page);
  ok(s.phase === 'fly' && s.hint && s.hintCls && s.t > 0, 'uçuş başladı, "Sürükleyin, yol alın" ipucu');
  await page.waitForTimeout(INTRO + KT.enter + KT.gates[0] * KT.cruise + 450 - (INTRO + KT.enter + 900)); s = await st(page);
  ok(s.visited === 1 && s.word === 'Kafede,' && s.layer === 'kafe', 'ilk kapıdan geçiş: 1/4, başlık "Kafede,"');
  const t0 = s.t; await page.mouse.move(800, 150); await page.mouse.down(); for (let i = 1; i <= 8; i++) { await page.mouse.move(800 - 160 * i / 8, 150); await page.waitForTimeout(25); } await page.waitForTimeout(80); s = await st(page);
  ok(s.userPlayed && !s.hint && s.t > t0 + 0.2 && s.visited >= 2, `sürükleme ileri götürüyor (t ${t0.toFixed(2)} → ${s.t.toFixed(2)}), kapılar sayılıyor`);
  await page.mouse.up(); await page.waitForTimeout(300);
  await page.mouse.move(720, 150); await page.mouse.down(); await page.waitForTimeout(300); const b0 = (await st(page)).t; await page.waitForTimeout(800); const b1 = (await st(page)).t; await page.mouse.up();
  ok(b1 - b0 > (800 / KT.cruise) * 2, 'basılı tutunca hızlanıyor');
  await openAt(page, dist('koridor'), 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10); await page.waitForTimeout(INTRO + KT.enter + 400);
  await page.click('.node[data-i="3"]'); await page.waitForTimeout(900); s = await st(page);
  ok(Math.abs(s.t - (KT.gates[3] - 0.12)) < 0.06 && s.visited === 3, 'rota noktası son kapının önüne götürüyor');
  await page.waitForTimeout((1 - s.t) * KT.cruise + 700); s = await st(page);
  ok(s.finalState && s.phase === 'final' && s.word === 'Her yerde,' && s.layer === 'final', 'final: "Her yerde, Pluxee geçiyor."');
  await page.waitForTimeout(KT.hold + 300); s = await st(page);
  ok(s.ended && s.again, 'kullanıcı oynadı: döngü yok, "Tekrar geç"');
  await page.click('.again'); await page.waitForTimeout(INTRO + KT.enter + 300); s = await st(page);
  ok(!s.finalState && s.visited === 0 && s.phase === 'fly', '"Tekrar geç" girişle baştan başlatıyor');

  console.log('\nMercek');
  await openAt(page, dist('mercek'), 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10);
  await page.waitForTimeout(INTRO + 700 + 800); s = await st(page);
  ok(s.phase === 'play' && s.hint && s.hintCls && s.visited === 0, 'mercek açıldı, "Kartı gezdirin" ipucu, hiçbir nokta aktif değil');
  await page.mouse.move(590, 78, { steps: 14 }); await page.waitForTimeout(LT.dwell + 450); s = await st(page);
  ok(s.userPlayed && !s.hint && s.visited === 1 && s.word === 'Restoranda,' && s.eyebrow === 'Öğle yemeği', 'kart restoranın üstüne gelince nokta aydınlanıp "geçiyor" (1/4)');
  ok(s.lens && Math.abs(s.lens.x - 590) < 12 && Math.abs(s.lens.y - 78) < 12, 'mercek imleci izliyor');
  for (const [x, y] of [[790, 64], [664, 150], [896, 140]]) { await page.mouse.move(x, y, { steps: 10 }); await page.waitForTimeout(LT.dwell + 420); }
  await page.waitForTimeout(900); s = await st(page);
  ok(s.visited === 4 && s.finalState && s.word === 'Her yerde,' && s.lens.r > 600, 'dört nokta → tüm sahne aydınlanır, "Her yerde,"');
  await page.waitForTimeout(LT.final + 300); s = await st(page);
  ok(s.ended && s.again, '"Tekrar aydınlat" görünür');
  await openAt(page, dist('mercek'), 'seg=hr&h=19&m=5'); await page.mouse.move(10, 10);
  await page.waitForTimeout(INTRO + 700 + LT.idle + LT.move + LT.dwell + 600); s = await st(page);
  ok(!s.userPlayed && s.visited >= 1 && s.order[0] === 'market', 'dokunulmazsa kart noktaları kendisi dolaşıyor (İK · akşam → önce market)');
  await page.focus('#ad'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(200); s = await st(page);
  ok(s.userPlayed && s.auto === false, 'ok tuşları kartı hareket ettiriyor');

  console.log('\nFiş');
  await openAt(page, dist('fis'), 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10);
  await page.waitForTimeout(INTRO + 900 + RT.first + 900); s = await st(page);
  ok(s.phase === 'print' && s.printed >= 3 && s.hint && s.hintCls, 'fiş başlığı yazdırıldı, "Dokunun: yazdırın" ipucu');
  const lineText = await page.$$eval('.ln.is-on', (l) => l.map((e) => e.textContent.trim()));
  ok(lineText[0] === 'PLUXEE' && /İŞLEM FİŞİ · 12:31/.test(lineText[1]), 'fiş: PLUXEE / İŞLEM FİŞİ · 12:31');
  await page.mouse.click(440 + 408, 200); await page.waitForTimeout(450); s = await st(page);
  const p1 = s.printed;
  ok(s.userPlayed && s.visited >= 1 && s.word === (s.visited === 1 ? 'Restoranda,' : s.word), `POS'a dokunma satır yazdırıyor (${s.visited}/4, "${s.word}")`);
  await page.mouse.click(440 + 408, 200); await page.waitForTimeout(450); await page.mouse.click(440 + 408, 200); await page.waitForTimeout(450); s = await st(page);
  ok(s.printed > p1 && s.visited >= 3, 'her dokunuş bir satır daha (' + s.visited + '/4)');
  await page.mouse.click(440 + 408, 200); await page.waitForTimeout(1300); s = await st(page);
  ok(s.visited === 4 && s.phase === 'ready' && s.finalState && s.word === 'Her yerde,', 'dört satır + toplam: "HER YERDE GEÇİYOR", fiş hazır');
  const items = await page.$$eval('.ln.item', (l) => l.map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  ok(items.length === 4 && items.every((x) => /GEÇİYOR/.test(x) && !/GEÇTİ\b/.test(x)) && /RESTORAN/.test(items[0]), 'satırlar: ' + items.join(' | '));
  const fits = await page.$$eval('.ln.item', (l) => l.every((e) => e.scrollWidth <= e.clientWidth + 1));
  ok(fits, 'en uzun satır (ONLİNE SİPARİŞ … GEÇİYOR) fişe sığıyor');
  const lb = await page.$eval('.ln.item[data-i="1"]', (e) => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  await page.mouse.move(lb[0], lb[1], { steps: 4 }); await page.waitForTimeout(300); s = await st(page);
  ok(s.word === 'Kafede,' && s.layer === 'kafe', 'satırın üstüne gelince o yerin atmosferi ve başlığı');
  await page.mouse.move(440 + 400, 110); await page.mouse.down(); await page.mouse.move(440 + 400, 50, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(700); s = await st(page);
  ok(s.phase === 'torn' && s.word === 'Her yerde,' && (await page.$eval('.paper', (e) => e.classList.contains('is-torn'))), 'fişi çekince kopuyor, final kopyası');
  await page.waitForTimeout(RT.hold + 300); s = await st(page);
  ok(s.ended && s.again, '"Yeniden yazdır" görünür');
  await openAt(page, dist('fis'), 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10);
  const autoTotal = INTRO + 900 + RT.first + 2 * 280 + 4 * RT.line + 2 * 280 + RT.tearIdle;
  await page.waitForTimeout(autoTotal + 1200); s = await st(page);
  ok(!s.userPlayed && s.phase === 'torn' && s.visited === 4, `dokunulmazsa fiş kendiliğinden yazılıp kopuyor (≈ ${(autoTotal / 1000).toFixed(1)} sn)`);

  console.log('\nSilme');
  await openAt(page, dist('silme'), 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10);
  await page.waitForTimeout(INTRO + WT.enter + 900); s = await st(page);
  ok(s.phase === 'wipe' && s.auto && s.hint && s.hintCls && s.x > 0, 'kart şeridi kendisi silmeye başladı, "Kartı sürükleyin" ipucu');
  ok((await page.$$eval('.panel img.ph', (l) => l.length)) === 8 && (await page.$$eval('.panel', (l) => l.length)) === 8, 'renkli + soluk şerit: 4 + 4 panel, fotoğraflar çalışma zamanında tek kopyadan');
  await page.mouse.move(520, 120); await page.mouse.down(); for (let i = 1; i <= 10; i++) { await page.mouse.move(520 + 30 * i, 120); await page.waitForTimeout(25); } s = await st(page);
  ok(s.userPlayed && !s.hint && !s.auto && s.x > 250 && s.passed >= 2 && s.visited >= 2, `sürükleme kenarı taşıyor (x ${s.x}), geçilen paneller damgalanıyor (${s.passed}/4, "${s.word}")`);
  const stamped = await page.$$eval('.strip.col .panel.is-done', (l) => l.map((e) => e.getAttribute('data-key')));
  ok(stamped.length === s.passed && stamped[0] === 'restoran', 'damgalar sırayla: ' + stamped.join(' → '));
  await page.mouse.up(); await page.waitForTimeout(1100); s = await st(page); const ix = s.x;
  ok(!s.auto && s.phase === 'wipe' && ix > 310, `bırakınca atalet: kenar ${ix}'e kadar kayıp duruyor`);
  await page.waitForTimeout(WT.resume + 500); s = await st(page);
  ok(s.auto === true && s.phase === 'wipe' && s.x >= ix, `${(WT.resume / 1000).toFixed(1)} sn sonra otomatik kayma sürüyor`);
  await page.mouse.move(700, 120); await page.mouse.down(); for (let i = 1; i <= 8; i++) { await page.mouse.move(700 + 34 * i, 120); await page.waitForTimeout(25); } await page.mouse.up(); await page.waitForTimeout(700); s = await st(page);
  ok(s.phase === 'final' && s.visited === 4 && s.finalState && s.word === 'Her yerde,', 'sona kadar sürükleyince final: "Her yerde, Pluxee geçiyor."');
  await page.waitForTimeout(WT.hold + 300); s = await st(page);
  ok(s.ended && s.again, '"Yeniden geçir" görünür');
  await openAt(page, dist('silme'), 'seg=hr&h=19&m=5'); await page.mouse.move(10, 10);
  await page.waitForTimeout(INTRO + WT.enter + WT.glide + 1400); s = await st(page);
  ok(!s.userPlayed && s.phase === 'final' && s.visited === 4 && s.order[0] === 'market', `dokunulmazsa şerit kendini siliyor (İK · akşam → önce market, ≈ ${((INTRO + WT.enter + WT.glide) / 1000).toFixed(1)} sn)`);
  await page.focus('#ad'); await openAt(page, dist('silme'), 'seg=wc&h=12&m=31'); await page.waitForTimeout(INTRO + WT.enter + 300); await page.focus('#ad'); const kx = (await st(page)).x; await page.keyboard.press('ArrowRight'); await page.waitForTimeout(500); s = await st(page);
  ok(s.userPlayed && s.x > kx + 30, 'ok tuşu kenarı kaydırıyor');

  console.log('\nHikâye');
  await openAt(page, dist('hikaye'), 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10);
  await page.waitForTimeout(INTRO + HT.label + 700); s = await st(page);
  ok(s.phase === 'play' && s.idx === 0 && s.visited === 1 && s.word === 'Restoranda,' && s.layer === 'restoran' && s.hint && s.hintCls, 'ilk hikâye: restoran fotoğrafı, "Dokunun: ilerleyin" ipucu');
  ok((await page.$eval('.story', (e) => e.classList.contains('is-stamp') && e.classList.contains('is-lbl'))) && /GEÇİYOR/.test(await page.textContent('.stamp')) && /restoran/i.test(await page.textContent('.slbl')), '"GEÇİYOR ✓" damgası ve RESTORAN · BURADA etiketi');
  await page.mouse.click(860, 130); await page.waitForTimeout(500); s = await st(page);
  ok(s.userPlayed && !s.hint && s.idx === 1 && s.word === 'Kafede,' && s.layer === 'kafe', 'sağa dokunma: sonraki hikâye (Kafede,)');
  await page.mouse.click(520, 130); await page.waitForTimeout(500); s = await st(page);
  ok(s.idx === 0 && s.word === 'Restoranda,', 'sola dokunma: önceki hikâye');
  await page.mouse.move(860, 130); await page.mouse.down(); await page.waitForTimeout(HT.press + 400); s = await st(page); const e0 = s.elapsed; await page.waitForTimeout(600); s = await st(page);
  ok(s.paused && s.elapsed === e0 && (await page.$eval('.scene', (e) => e.classList.contains('is-paused'))), 'basılı tutunca hikâye duruyor ("Durduruldu")');
  await page.mouse.up(); await page.waitForTimeout(400); s = await st(page);
  ok(!s.paused && s.elapsed > e0, 'bırakınca sürüyor');
  await page.mouse.move(860, 130); await page.mouse.down(); await page.mouse.move(700, 130, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(500); s = await st(page);
  ok(s.idx === 1, 'sola kaydırma: sonraki hikâye');
  await page.focus('#ad'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(400); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(HT.story + 900); s = await st(page);
  ok(s.phase === 'final' && s.visited === 4 && s.finalState && s.word === 'Her yerde,' && (await page.$$eval('.fs', (l) => l.length)) === 4, 'dördüncü hikâyenin sonunda final: dört damga alt sırada');
  await page.waitForTimeout(HT.hold + 300); s = await st(page);
  ok(s.ended && s.again, '"Baştan izle" görünür');
  await openAt(page, dist('hikaye'), 'seg=emp&h=9&m=15'); await page.mouse.move(10, 10);
  await page.waitForTimeout(INTRO + 4 * HT.story + 900); s = await st(page);
  ok(!s.userPlayed && s.phase === 'final' && s.visited === 4 && s.order[0] === 'kafe', `dokunulmazsa hikâyeler kendisi akıyor (işveren · sabah → önce kafe, ≈ ${((INTRO + 4 * HT.story) / 1000).toFixed(1)} sn)`);

  console.log('\nDeste');
  await openAt(page, dist('deste'), 'seg=wc&h=12&m=31'); await page.mouse.move(10, 10);
  await page.waitForTimeout(INTRO + DT.enter + DT.hint + 300); s = await st(page);
  ok(s.phase === 'play' && s.idx === 0 && s.passed === 0 && s.hint && s.hintCls && s.word === 'Restoranda,', 'deste dizildi, "Baskıyı kaydırın" ipucu');
  ok((await page.$$eval('.pc', (l) => l.length)) === 4 && (await page.$$eval('.pc img.ph', (l) => l.length)) === 4 && (await page.$eval('.pc[data-key="restoran"]', (e) => getComputedStyle(e).zIndex)) === '10', 'dört fotoğraf baskısı; öncü nokta en üstte');
  await page.mouse.move(720, 120); await page.mouse.down(); for (let i = 1; i <= 8; i++) { await page.mouse.move(720 + 18 * i, 120 - 2 * i); await page.waitForTimeout(20); } s = await st(page);
  ok(s.userPlayed && s.dragging && !s.hint, 'baskı parmağı izliyor');
  await page.mouse.up(); await page.waitForTimeout(120); s = await st(page);
  ok(s.passed === 1 && (await page.$eval('.pc[data-key="restoran"]', (e) => e.classList.contains('is-stamp'))) && (await page.$eval('.card', (e) => e.classList.contains('is-tap'))), 'bırakınca damga: "GEÇİYOR ✓", kart dokunuyor');
  await page.waitForTimeout(500); s = await st(page);
  ok(s.idx === 1 && s.word === 'Kafede,' && (await page.$eval('.pc[data-key="restoran"]', (e) => e.classList.contains('is-out'))), 'baskı uçtu, sıradaki açıldı (Kafede,)');
  await page.mouse.move(720, 120); await page.mouse.down(); await page.mouse.move(740, 122, { steps: 3 }); await page.mouse.up(); await page.waitForTimeout(400); s = await st(page);
  ok(s.idx === 1 && s.passed === 1, 'kısa kaydırma geri yaylanıyor, damga yok');
  await page.mouse.click(720, 120); await page.waitForTimeout(500); s = await st(page);
  ok(s.idx === 2 && s.passed === 2 && s.word === 'Markette,', 'dokunma damgalayıp geçiriyor');
  await page.focus('#ad'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(500); s = await st(page);
  ok(s.idx === 3 && s.passed === 3, 'ok tuşu baskıyı sola uçuruyor');
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(DT.fly + 700); s = await st(page);
  ok(s.phase === 'final' && s.visited === 4 && s.finalState && s.word === 'Her yerde,' && (await page.$$eval('.pc.is-fan.is-stamp', (l) => l.length)) === 4, 'dördü damgalanınca yelpaze: "Her yerde, Pluxee geçiyor."');
  await page.waitForTimeout(DT.hold + 300); s = await st(page);
  ok(s.ended && s.again, '"Yeniden karıştır" görünür');
  await page.click('.again'); await page.waitForTimeout(INTRO + DT.enter + 300); s = await st(page);
  ok(!s.finalState && s.passed === 0 && s.phase === 'play', '"Yeniden karıştır" desteyi baştan diziyor');
  await openAt(page, dist('deste'), 'seg=hr&h=19&m=5'); await page.mouse.move(10, 10);
  const desteAuto = INTRO + DT.enter + 4 * (DT.show + DT.stampToFly) + DT.fly;
  await page.waitForTimeout(desteAuto + 600); s = await st(page);
  ok(!s.userPlayed && s.phase === 'final' && s.visited === 4 && s.order[0] === 'market', `dokunulmazsa deste kendini oynatıyor (İK · akşam → önce market, ≈ ${(desteAuto / 1000).toFixed(1)} sn)`);
  ok(!(await page.$eval('#ad', (e) => /Yemek Kartı|Splash/i.test(e.textContent))), 'açık zeminli konseptte de ajans adı yok');

  ok(errors.length === 0, 'konsolda hata yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await ctx.close();

  console.log('\nprefers-reduced-motion');
  const ctxR = await browser.newContext({ viewport: { width: 970, height: 250 }, reducedMotion: 'reduce' });
  await routeFonts(ctxR);
  const pr = await ctxR.newPage();
  for (const id of ALL) { await openAt(pr, dist(id), 'seg=wc&h=12'); await pr.waitForTimeout(400); s = await st(pr); ok(s.ended && s.visited === 4 && s.word === 'Her yerde,', `${id}: doğrudan final karesi`); }
  await ctxR.close();

  console.log('\nSunum sayfası');
  const ctxS = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await routeFonts(ctxS);
  const ps = await ctxS.newPage();
  const errS = [];
  ps.on('pageerror', (e) => errS.push(e.message));
  await ps.goto('file://' + path.join(root, 'preview', 'index.html'));
  await ps.waitForTimeout(1500);
  ok((await ps.$$eval('.tab', (l) => l.length)) === 6 && /WC-RESTORAN · KORIDOR/.test(await ps.textContent('#variant')), 'altı konsept sekmesi; gömülü kreatif durum bildiriyor');
  await ps.click('.tab[data-id="fis"]'); await ps.waitForTimeout(1600);
  ok(/WC-RESTORAN · FIS/.test(await ps.textContent('#variant')), 'sekme geçişi Fiş konseptini yüklüyor');
  await ps.click('.tab[data-id="deste"]'); await ps.waitForTimeout(1600);
  ok(/WC-RESTORAN · DESTE/.test(await ps.textContent('#variant')), 'sekme geçişi Deste konseptini yüklüyor');
  await ps.click('#presets button:nth-of-type(3)'); await ps.waitForTimeout(1200);
  ok(/EMP-KAFE/.test(await ps.textContent('#variant')), 'hazır senaryo kreatifi değiştiriyor');
  await ps.frameLocator('#ad').locator('.cta').click(); await ps.waitForTimeout(200);
  ok((await ps.$eval('#toast', (e) => e.classList.contains('is-on'))), 'tıklama sunumda toast olarak gösteriliyor');
  ok(errS.length === 0, 'sunum sayfasında hata yok' + (errS.length ? ': ' + errS.join(' | ') : ''));
  await ctxS.close();

  console.log('\n30 sn sınırı (otomatik gösterim)');
  const ctxL = await browser.newContext({ viewport: { width: 970, height: 250 } });
  await routeFonts(ctxL);
  const pl = await ctxL.newPage();
  await openAt(pl, dist('koridor'), 'seg=wc&h=12'); await pl.mouse.move(10, 10);
  const total = INTRO + KT.enter + KT.cruise + KT.hold;
  await pl.waitForTimeout(total + 800); s = await st(pl);
  ok(s.ended && s.finalState && total <= 30000, `koridor ${(total / 1000).toFixed(1)} sn'de final karesinde duruyor (≤ 30 sn)`);
  for (const [id, t] of [['silme', INTRO + WT.enter + WT.glide + WT.hold], ['hikaye', INTRO + 4 * HT.story + HT.hold], ['deste', INTRO + DT.enter + 4 * (DT.show + DT.stampToFly) + DT.fly + DT.hold]]) {
    await openAt(pl, dist(id), 'seg=wc&h=12'); await pl.mouse.move(10, 10); await pl.waitForTimeout(t + 1000); s = await st(pl);
    ok(s.ended && s.finalState && t <= 30000, `${id} ${(t / 1000).toFixed(1)} sn'de final karesinde duruyor (≤ 30 sn)`);
  }
  await ctxL.close();

  console.log('\nArşiv sürümleri');
  const ctxA = await browser.newContext({ viewport: { width: 970, height: 250 } });
  const pa = await ctxA.newPage();
  const errA = [];
  pa.on('pageerror', (e) => errA.push(e.message));
  await openAt(pa, path.join(root, 'dist', 'arsiv', 'pos', 'index.html'), 'seg=hr&h=19&m=5'); await pa.waitForTimeout(300);
  const a1 = await pa.evaluate(() => window.PLUXEE.state());
  await openAt(pa, path.join(root, 'dist', 'arsiv', 'flat', 'index.html'), 'seg=hr&h=19&m=5'); await pa.waitForTimeout(300);
  const a2 = await pa.evaluate(() => window.PLUXEE.state());
  ok(a1.variant === 'HR-MARKET' && a2.variant === 'HR-EVENING-LEVENT-SUN' && errA.length === 0, 'arşiv sürümleri çalışıyor');
  await ctxA.close();

  await browser.close();
  console.log(failures ? `\n${failures} kontrol başarısız` : '\nTüm kontroller geçti');
  process.exit(failures ? 1 : 0);
})();
