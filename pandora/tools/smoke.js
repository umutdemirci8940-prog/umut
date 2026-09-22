#!/usr/bin/env node
'use strict';
/**
 * Etkileşim duman testi: giriş kurgusu → otomatik gösteri → kullanıcı devralması → metal / charm ekle-çıkar /
 * temizle / ses → tıklama hedefleri (clickTag, Enabler, derin bağlantı) → klavye → azaltılmış hareket → 30 sn sınırı.
 * Kullanım: NODE_PATH=$(npm root -g) node tools/smoke.js [--quick] [--file=dist/970x250/index.html]
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const data = require('../src/data');
const root = path.join(__dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const file = 'file://' + path.resolve(root, String(args.file || 'dist/970x250/index.html'));
let failures = 0;
const ok = (c, m) => { console.log(`${c ? '  ✔' : '  ✘'} ${m}`); if (!c) failures++; };
const fontsDir = path.join(root, 'assets', 'fonts');

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 } });
  if (fs.existsSync(path.join(fontsDir, 'montserrat.css'))) {
    const css = fs.readFileSync(path.join(fontsDir, 'montserrat.css'), 'utf8');
    await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }));
    await ctx.route('**/fonts.gstatic.com/**', (r) => { const f = path.join(fontsDir, path.basename(new URL(r.request().url()).pathname)); fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort(); });
  }
  const page = await ctx.newPage();
  const errors = [], opened = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.addInitScript(() => { window.open = (u) => { window.__opened = (window.__opened || []).concat([u]); return null; }; });
  await page.goto(file);
  const st = () => page.evaluate(() => window.pandoraMasthead.state());
  const cls = (c) => page.evaluate((c) => document.getElementById('ad').classList.contains(c), c);

  console.log('\nKurgu');
  await page.waitForTimeout(600);
  ok(await cls('is-in'), 'giriş kurgusu başladı (is-in)');
  ok((await st()).charms.length === 0, 'başlangıçta bileklik boş');
  await page.waitForTimeout(data.timing.intro + data.timing.demoStep * data.timing.demoCharms + 900);
  let s = await st();
  ok(s.charms.length === data.timing.demoCharms, `otomatik gösteri ${data.timing.demoCharms} charm ekledi (${s.charms.join(', ')})`);
  ok(s.rest, 'gösteri sonrası dinlenme durumu (CTA vurgusu)');
  ok(!s.user, 'fare hareketi olmadan kullanıcı devralması yok');
  ok((await page.textContent('.cta span')).trim() === data.copy.ctaBuilt, 'CTA metni "tasarımı satın al" oldu');
  const b0 = data.bracelets[0]; const expected = b0.price + s.charms.reduce((a, k) => a + (data.charms.find((c) => c.key === k).price || 0), 0);
  ok(s.total === expected, `toplam doğru (${s.total} TL)`);

  console.log('\nKullanıcı');
  await page.mouse.move(500, 120); await page.mouse.move(520, 130); await page.mouse.move(540, 140); await page.waitForTimeout(200);
  s = await st();
  ok(s.user && !s.demo, 'fare hareketiyle kullanıcı devraldı, gösteri durdu');
  await page.click('.metal[data-metal="rose"]'); await page.waitForTimeout(300);
  s = await st(); ok(s.metal === 'rose', 'metal → rose');
  ok(await page.evaluate(() => document.querySelector('.ring .v.on').getAttribute('data-metal')) === 'rose', 'rose packshot görünür');
  const before = s.charms.length;
  const freeCell = await page.$('.cell:not(.added):not([disabled])'); const freeKey = await freeCell.getAttribute('data-charm');
  await freeCell.click(); await page.waitForTimeout(750);
  s = await st(); ok(s.charms.length === before + 1 && s.charms.indexOf(freeKey) >= 0, `tepsiden charm eklendi (${freeKey})`);
  ok(await page.evaluate(() => document.querySelectorAll('.slot .charm.on').length) === s.charms.length, 'bileklikteki charm sayısı durumla eşit');
  const anyAdded = await page.$('.cell.added'); const addedKey = await anyAdded.getAttribute('data-charm');
  await anyAdded.click(); await page.waitForTimeout(300);
  s = await st(); ok(s.charms.indexOf(addedKey) < 0, `eklenmiş charm'a tıklayınca çıkıyor (${addedKey})`);
  // 5 charm doldur → diğer hücreler devre dışı
  for (const c of data.charms) { if ((await st()).charms.length >= data.maxCharms) break; const el = await page.$(`.cell[data-charm="${c.key}"]:not(.added)`); if (el) { await el.click(); await page.waitForTimeout(120); } }
  s = await st(); ok(s.charms.length === data.maxCharms, `${data.maxCharms} charm ile bileklik doldu`);
  ok((await page.$$('.cell[disabled]')).length === Math.min(6, data.charms.length) - data.maxCharms, 'kalan hücreler devre dışı');
  const onRing = await page.$('.slot .charm'); await onRing.click({ force: true }); await page.waitForTimeout(300);
  ok((await st()).charms.length === data.maxCharms - 1, 'bileklikteki charm\'a tıklayınca çıkıyor');
  await page.click('.reset'); await page.waitForTimeout(200);
  ok((await st()).charms.length === 0, 'temizle → bileklik boş');
  ok((await page.textContent('.cta span')).trim() === data.copy.cta, 'CTA metni başa döndü');
  await page.click('.sound'); ok((await st()).sound === true, 'ses açıldı (kullanıcı isteğiyle)');
  await page.click('.sound'); ok((await st()).sound === false, 'ses kapandı');

  console.log('\nTıklama hedefleri');
  await page.click('.cta'); await page.waitForTimeout(100);
  let op = await page.evaluate(() => window.__opened || []);
  ok(op.length === 1 && op[0] === data.brand.url, 'CTA → marka adresi (clickTag varsayılanı)');
  await page.click('.ring', { position: { x: 169, y: 10 } }); await page.waitForTimeout(100);
  op = await page.evaluate(() => window.__opened || []);
  ok(op.length === 2 && op[1] === data.bracelets.find((b) => b.key === 'rose').url, 'bileklik fotoğrafı → ürün sayfası (derin bağlantı)');
  await page.click('.panel', { position: { x: 10, y: 5 } }); await page.waitForTimeout(80);
  ok((await page.evaluate(() => window.__opened.length)) === 2, 'panel boşluğuna tıklama reklam çıkışı yapmıyor');
  await page.evaluate(() => { window.clickTag = 'https://example.com/ct'; });
  await page.click('.cta'); await page.waitForTimeout(80);
  ok((await page.evaluate(() => window.__opened.slice(-1)[0])) === 'https://example.com/ct', 'clickTag tanımlıysa o kullanılıyor');
  await page.evaluate(() => { window.Enabler = { exit: (id, u) => { window.__exit = [id, u]; }, counter: (n) => { window.__cnt = (window.__cnt || []).concat([n]); } }; });
  await page.click('.cta'); await page.waitForTimeout(80);
  ok(await page.evaluate(() => window.__exit && window.__exit[0] === 'CTA'), 'Enabler varsa Enabler.exit("CTA") çağrılıyor');
  ok(await page.evaluate(() => (window.__cnt || []).indexOf('cta_click') >= 0), 'Enabler.counter ile izleme');

  console.log('\nKlavye');
  await page.focus('#ad'); await page.keyboard.press('ArrowRight'); await page.waitForTimeout(150);
  ok((await st()).metal === 'gold', '→ tuşu metali değiştiriyor');
  await page.keyboard.press('Enter'); await page.waitForTimeout(80);
  ok(await page.evaluate(() => window.__exit && window.__exit[0] === 'CTA'), 'Enter → çıkış');
  ok(await page.evaluate(() => { const c = document.querySelector('.cell'); c.focus(); return document.activeElement === c; }), 'tepsi hücreleri klavyeyle odaklanabiliyor');

  console.log('\nAzaltılmış hareket');
  const p2 = await ctx.newPage(); await p2.emulateMedia({ reducedMotion: 'reduce' }); await p2.goto(file); await p2.waitForTimeout(700);
  const s2 = await p2.evaluate(() => window.pandoraMasthead.state());
  ok(s2.rest && s2.charms.length === 0 && !s2.demo, 'azaltılmış harekette gösteri yok, doğrudan dinlenme');
  await p2.close();

  if (!args.quick) {
    console.log('\n30 sn sınırı');
    const p3 = await ctx.newPage(); await p3.goto(file); await p3.waitForTimeout(data.timing.autoStop + 800);
    ok(await p3.evaluate(() => document.getElementById('ad').classList.contains('is-still')), 'animasyonlar 30 sn sonra durdu (is-still)');
    await p3.close();
  }
  console.log('\nGenel');
  ok(errors.length === 0, errors.length ? 'konsol hataları: ' + errors.join(' | ') : 'konsol hatası yok');
  const html = fs.readFileSync(path.resolve(root, String(args.file || 'dist/970x250/index.html')), 'utf8');
  ok(/<meta name="ad\.size" content="width=970,height=250">/.test(html), 'ad.size meta etiketi');
  ok(/var clickTag = /.test(html), 'clickTag tanımlı');
  ok(!/https?:\/\/(?!fonts\.g)/.test(html.replace(/https?:\/\/[^"'\s)]*pandora\.net[^"'\s)]*/g, '').replace(/https?:\/\/(claude\.ai|www\.w3\.org)[^"'\s)]*/g, '')), 'harici kaynak yok (Google Fonts hariç)');
  await browser.close();
  console.log(failures ? `\n✘ ${failures} başarısız` : '\n✔ tüm testler geçti');
  process.exit(failures ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
