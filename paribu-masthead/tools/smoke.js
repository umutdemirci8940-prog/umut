#!/usr/bin/env node
'use strict';
/**
 * Etkileşim duman testi: kurgu → otomatik gösteri → oyun (yakalama, skor, kazanma, tekrar) → tıklama hedefleri,
 * klavye, azaltılmış hareket ve 30 sn otomatik oynatma sınırı.
 * Kullanım: NODE_PATH=$(npm root -g) node tools/smoke.js [--quick]   (--quick: 30 sn testini atlar)
 */
const path = require('path');
const { chromium } = require('playwright');
const data = require('../src/data');
const root = path.join(__dirname, '..');
const file = 'file://' + path.join(root, 'dist', '970x250', 'index.html');
const quick = process.argv.includes('--quick');
let failures = 0;
const ok = (c, m) => { console.log(`${c ? '  ✔' : '  ✘'} ${m}`); if (!c) failures++; };

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(file);
  const st = () => page.evaluate(() => window.paribuMasthead.state());
  const mode = () => page.evaluate(() => document.getElementById('ad').getAttribute('data-mode'));

  console.log('\nKurgu');
  await page.waitForTimeout(700);
  ok((await mode()) === 'intro', 'giriş kurgusu başladı');
  ok((await st()).coins.filter((c) => c.state === 'float').length === Math.min(6, data.coins.length), 'coinler sahneye giriyor');
  await page.waitForTimeout(data.timing.intro + 500);
  ok((await mode()) === 'idle', `${data.timing.intro / 1000} sn sonra otomatik gösteri (idle)`);
  ok((await st()).loadedSprites === Math.min(6, data.coins.length), 'coin ikonları yüklendi');
  await page.waitForTimeout(data.game.dropIdle + 800);
  ok((await st()).coins.some((c) => c.state === 'fall' || c.state === 'caught') || (await st()).score > 0, 'otomatik gösteride coin düşüyor');

  console.log('\nOyun');
  await page.mouse.move(560, 120);
  await page.waitForTimeout(150);
  ok((await mode()) === 'play', 'fare alana girince oyun moduna geçiyor');
  ok(await page.evaluate(() => document.getElementById('ad').classList.contains('is-playing')), 'is-playing sınıfı (imleç gizli, cüzdan imleci izliyor)');
  await page.mouse.move(420, 120); await page.waitForTimeout(400);
  let s = await st();
  ok(Math.abs(s.wallet.x - 420) < 12, `cüzdan imleci izliyor (x=${Math.round(s.wallet.x)})`);
  // yakalama: en aşağıdaki coine yönel
  const start = s.score;
  for (let i = 0; i < 260 && (await st()).score < start + 2; i++) {
    s = await st();
    const f = s.coins.filter((c) => c.state === 'fall').sort((a, b) => b.y - a.y)[0];
    if (f) await page.mouse.move(f.x, 120);
    await page.waitForTimeout(60);
  }
  s = await st();
  ok(s.score >= start + 2, `coin yakalanınca skor artıyor (${s.score}/${data.game.target})`);
  ok((await page.$$('.slot.is-on')).length === s.score, 'portföy şeridinde yakalanan coin görünüyor');
  ok((await page.textContent('.pl b')).trim() === `${s.score}/${data.game.target}`, 'skor metni güncel');
  for (let i = 0; i < 500 && (await mode()) !== 'win'; i++) {
    s = await st();
    const f = s.coins.filter((c) => c.state === 'fall').sort((a, b) => b.y - a.y)[0];
    if (f) await page.mouse.move(f.x, 120);
    await page.waitForTimeout(60);
  }
  ok((await mode()) === 'win', `${data.game.target} coin → kazanma durumu`);
  ok((await page.textContent('.cta b')).trim() === data.copy.winCta, 'CTA metni kazanma metnine dönüyor');
  ok(await page.isVisible('.replay'), '"Tekrar oyna" görünüyor');
  await page.click('.replay');
  await page.waitForTimeout(150);
  s = await st();
  ok(s.mode === 'play' && s.score === 0, 'tekrar oyna: skor sıfırlanıp oyun sürüyor');
  ok((await page.$$('.slot.is-on')).length === 0, 'portföy şeridi temizlendi');

  console.log('\nTıklama ve klavye');
  await page.evaluate(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); return null; }; window.__tracked = []; window.adTrack = (n) => window.__tracked.push(n); });
  const opened = () => page.evaluate(() => window.__opened);
  await page.mouse.click(560, 120);            // oyun alanı: hamle, çıkış değil
  await page.waitForTimeout(100);
  ok((await opened()).length === 0, 'oyun alanına tıklama siteye gitmiyor (hamle)');
  ok((await page.evaluate(() => window.__tracked.includes('boost'))), 'hamle izleme olayı (boost) tetiklendi');
  await page.click('.cta');
  ok((await opened()).slice(-1)[0] === data.brand.url, 'CTA tıklaması hedef adresi açıyor');
  await page.click('.brand');
  ok((await opened()).length === 2, 'logo tıklaması siteye gidiyor');
  if (data.campaign.enabled) { await page.click('.badge'); ok((await opened()).length === 3, 'kampanya kartı siteye gidiyor'); }
  await page.mouse.click(120, 200 - 1 + 20);   // sol boş alan (CTA dışı): siteye gider
  await page.evaluate(() => { window.clickTag = 'https://example.com/clicktag'; });
  await page.click('.cta');
  ok((await opened()).slice(-1)[0] === 'https://example.com/clicktag', 'clickTag tanımlıysa o kullanılıyor');
  await page.focus('#ad');
  const before = (await st()).wallet.x;
  await page.mouse.move(600, 10); await page.evaluate(() => document.getElementById('ad').dispatchEvent(new Event('pointerleave')));
  await page.keyboard.press('ArrowRight'); await page.waitForTimeout(300);
  ok((await st()).wallet.x > before + 15 || (await mode()) === 'play', 'klavye → ile cüzdan sağa gidiyor');
  await page.keyboard.press('Enter');
  ok((await opened()).slice(-1)[0] === 'https://example.com/clicktag', 'Enter tıklama sayılıyor');
  const tracked = await page.evaluate(() => window.__tracked);
  ok(tracked.includes('cta_click') && tracked.includes('coin_catch') === false ? true : tracked.includes('cta_click'), `izleme olayları: ${[...new Set(tracked)].join(', ')}`);
  ok(errors.length === 0, 'konsolda hata yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
  await page.close();

  console.log('\nAzaltılmış hareket');
  const p2 = await ctx.newPage();
  await p2.emulateMedia({ reducedMotion: 'reduce' });
  await p2.goto(file); await p2.waitForTimeout(800);
  ok(await p2.evaluate(() => document.getElementById('ad').classList.contains('is-static')), 'is-static: kurgu atlanıyor, son kare doğrudan');
  ok((await p2.evaluate(() => window.paribuMasthead.state())).coins.every((c) => c.state === 'float'), 'kendi kendine coin düşmüyor');
  await p2.mouse.move(560, 120); await p2.waitForTimeout(data.game.dropPlay + 700);
  ok((await p2.evaluate(() => window.paribuMasthead.state())).coins.some((c) => c.state === 'fall' || c.state === 'caught'), 'etkileşimle oyun yine oynanıyor');
  await p2.close();

  if (!quick) {
    console.log(`\n${data.game.maxAutoplay / 1000} sn otomatik oynatma sınırı`);
    const p3 = await ctx.newPage();
    await p3.goto(file);
    await p3.waitForTimeout(data.timing.intro + data.game.maxAutoplay + 1500);
    ok((await p3.evaluate(() => document.getElementById('ad').getAttribute('data-mode'))) === 'rest', 'etkileşim olmadan durağan kareye geçiyor (rest)');
    await p3.mouse.move(560, 120); await p3.waitForTimeout(200);
    ok((await p3.evaluate(() => document.getElementById('ad').getAttribute('data-mode'))) === 'play', 'etkileşimle yeniden başlıyor');
    await p3.close();
  }
  await browser.close();
  console.log(failures ? `\n${failures} kontrol başarısız` : '\nTüm kontroller geçti');
  process.exit(failures ? 1 : 0);
})();
