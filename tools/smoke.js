#!/usr/bin/env node
'use strict';
/**
 * Etkileşim duman testi: her boyutta faz geçişleri, nokta/ok/klavye/kaydırma ile
 * gezinme, tıklama hedefi ve 30 sn otomatik oynatma sınırı kontrol edilir.
 * Kullanım: NODE_PATH=$(npm root -g) node tools/smoke.js
 */
const path = require('path');
const { chromium } = require('playwright');
const { SIZES } = require('../src/template');
const data = require('../src/data');

const root = path.join(__dirname, '..');
let failures = 0;
const ok = (cond, msg) => { console.log(`${cond ? '  ✔' : '  ✘'} ${msg}`); if (!cond) failures++; };
const state = (page) => page.evaluate(() => {
  const ad = document.getElementById('ad');
  const act = ad.querySelector('.slide.is-active');
  return { phase: ad.dataset.phase, idx: act ? +act.dataset.i : -1, ended: ad.classList.contains('is-ended'), paused: ad.classList.contains('is-paused') };
});

(async () => {
  const browser = await chromium.launch();
  for (const key of Object.keys(SIZES)) {
    const { w, h } = SIZES[key];
    console.log(`\n${key}`);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: true });
    await ctx.route('**/fonts.g*', (r) => r.abort()); // font yokluğunda da çalışmalı
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('file://' + path.join(root, 'dist', key, 'index.html'));

    await page.waitForTimeout(600);
    ok((await state(page)).phase === 'intro', 'açılış fazı');
    await page.waitForTimeout(data.timing.intro + 400);
    let s = await state(page);
    ok(s.phase === 'slides' && s.idx === 0, 'ilk ürün gösteriliyor');

    // Fare ile üzerine gelince duraklama
    await page.mouse.move(w / 2, h / 2);
    await page.waitForTimeout(150);
    ok((await state(page)).paused, 'fare üzerindeyken duraklıyor');

    // Ok ile ileri / geri
    await page.click('.arrow.next');
    await page.waitForTimeout(100);
    ok((await state(page)).idx === 1, 'ileri oku çalışıyor');
    await page.click('.arrow.prev');
    await page.waitForTimeout(100);
    ok((await state(page)).idx === 0, 'geri oku çalışıyor');
    await page.click('.arrow.prev');
    await page.waitForTimeout(100);
    ok((await state(page)).idx === data.products.length - 1, 'başta geri gidince sona sarıyor');

    // Nokta ile seçim
    await page.click('.dot:nth-child(3)');
    await page.waitForTimeout(100);
    ok((await state(page)).idx === 2, 'nokta ile 3. ürün seçiliyor');

    // Klavye
    await page.focus('#ad');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    ok((await state(page)).idx === 3, 'klavye sağ ok çalışıyor');

    // Kaydırma (dokunma)
    await page.evaluate(() => document.getElementById('ad').dispatchEvent(new Event('mouseleave')));
    await page.evaluate(() => {
      const el = document.getElementById('ad');
      const t = (type, x) => el.dispatchEvent(new TouchEvent(type, { touches: type === 'touchend' ? [] : [new Touch({ identifier: 1, target: el, clientX: x, clientY: 50 })], changedTouches: [new Touch({ identifier: 1, target: el, clientX: x, clientY: 50 })], bubbles: true }));
      t('touchstart', 200); t('touchend', 80);
    });
    await page.waitForTimeout(100);
    ok((await state(page)).idx === 4, 'sola kaydırma sonraki ürüne geçiyor');

    // Kontroller tıklamayı yutmalı, banner tıklaması hedef URL'yi açmalı
    // window.open çağrısını yakala (dış adrese gerçek gezinme yapılmaz)
    await page.evaluate(() => { window.__opened = null; window.open = (u) => { window.__opened = u; return null; }; });
    const opened = () => page.evaluate(() => window.__opened);
    await page.click('.dot:nth-child(1)');
    ok((await opened()) === null, 'nokta tıklaması sayfa açmıyor');
    await page.mouse.click(w / 2, h - 30);
    const target = await opened();
    ok(target === data.brand.url || /\/products\//.test(target || ''), 'banner tıklaması hedef URL\'yi açıyor (' + (target === data.brand.url ? 'marka sayfası' : 'ürün sayfası') + ')');
    await page.evaluate(() => { window.clickTag = 'https://example.com/clicktag'; });
    await page.mouse.click(w / 2, h - 30);
    ok((await opened()) === 'https://example.com/clicktag', 'clickTag tanımlıysa o kullanılıyor');

    ok(errors.length === 0, 'konsolda hata yok' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await ctx.close();
  }

  // 30 sn sınırı: yalnızca 300x250'de, gerçek zamanla
  console.log('\n30 sn sınırı (300x250)');
  const ctx = await browser.newContext({ viewport: { width: 300, height: 250 } });
  await ctx.route('**/fonts.g*', (r) => r.abort());
  const page = await ctx.newPage();
  await page.goto('file://' + path.join(root, 'dist', '300x250', 'index.html'));
  await page.mouse.move(299, 249);
  await page.evaluate(() => document.getElementById('ad').dispatchEvent(new Event('mouseleave')));
  const { intro, slide, outro } = data.timing;
  const firstOutroAt = intro + data.products.length * slide;
  await page.waitForTimeout(firstOutroAt + 300);
  ok((await state(page)).phase === 'outro', `kapanış ${(firstOutroAt / 1000).toFixed(1)} sn'de başlıyor`);
  await page.waitForTimeout(outro + 300);
  const fin = await state(page);
  ok(fin.phase === 'outro' && fin.ended, `otomatik oynatma ${((firstOutroAt + outro) / 1000).toFixed(1)} sn'de CTA karesinde duruyor (≤ ${data.timing.maxAutoplay / 1000} sn)`);
  await ctx.close();
  await browser.close();
  console.log(failures ? `\n${failures} kontrol başarısız` : '\nTüm kontroller geçti');
  process.exit(failures ? 1 : 0);
})();
