#!/usr/bin/env node
'use strict';
/**
 * KFC 970x250 bannerının belirli anlarında ekran görüntüsü alır (preview/kfc/),
 * etkileşimleri (sürükleme, üzerine gelme, şehir çipi, tıklama) dener ve --video ile kısa kayıt yapar.
 * Kullanım: NODE_PATH=$(npm root -g) node tools/capture-kfc.js [--video] [--file=dist/kfc-970x250/index.html]
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const file = path.resolve(root, args.file || 'dist/kfc-970x250/index.html');
const out = path.join(root, 'preview', 'kfc');
fs.mkdirSync(out, { recursive: true });
const MOMENTS = [['00-kepenk', 300], ['01-tabela', 1150], ['02-aciliyor', 1650], ['03-baslik', 2450], ['04-damga', 3250], ['05-urunler', 4300], ['06-son-kare', 6200]];

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2, recordVideo: args.video ? { dir: path.join(out, 'video'), size: { width: 970, height: 250 } } : undefined });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const t0 = Date.now();
  await page.goto('file://' + file);
  for (const [name, at] of MOMENTS) {
    const wait = at - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 88 });
  }
  const st = await page.evaluate(() => window.__kfc.state());
  console.log('durum:', st);
  const scrolled = async () => page.evaluate(() => { const a = document.getElementById('ad'); return [a.scrollLeft, a.scrollTop]; });
  // Ürün üzerine gelme
  const prod = page.locator('.prod').first();
  if (await prod.count()) { await prod.hover(); await page.waitForTimeout(500); await page.screenshot({ path: path.join(out, '07-urun-hover.jpg'), type: 'jpeg', quality: 88 }); }
  // Şehir çipi
  const chip = page.locator('.chip').nth(1);
  await chip.hover(); await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, '08-sehir-hover.jpg'), type: 'jpeg', quality: 88 });
  const on = await page.evaluate(() => [...document.querySelectorAll('.chip')].map((c) => c.classList.contains('on')));
  console.log('şehir çipi (2. çip aktif olmalı):', on, 'kaydırma (0,0 olmalı):', await scrolled());
  // Tıklama → yeni sekme
  const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 4000 }).catch(() => null), page.mouse.click(600, 120)]);
  console.log('tıklama hedefi:', popup ? popup.url() : 'AÇILMADI');
  if (popup) await popup.close();
  // Döngü: kepenk kapanışı
  if (args.video) { await page.waitForTimeout(15500 - (Date.now() - t0)); await page.screenshot({ path: path.join(out, '09-kapanis.jpg'), type: 'jpeg', quality: 88 }); await page.waitForTimeout(3000); }
  // Sürükleyerek açma testi (yeniden başlat)
  await page.evaluate(() => window.__kfc.start());
  await page.waitForTimeout(250);
  await page.mouse.move(485, 200); await page.mouse.down(); await page.mouse.move(485, 150, { steps: 4 }); await page.waitForTimeout(80);
  await page.screenshot({ path: path.join(out, '10-surukleme.jpg'), type: 'jpeg', quality: 88 });
  await page.mouse.move(485, 80, { steps: 4 }); await page.mouse.up();
  await page.waitForTimeout(300);
  const st2 = await page.evaluate(() => window.__kfc.state());
  console.log('sürükleme sonrası açık mı:', st2.opened, st2.cls);
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, '11-surukleme-sonrasi.jpg'), type: 'jpeg', quality: 88 });
  // Video oynuyor mu
  const v = await page.evaluate(() => { const v = document.querySelector('video'); return v ? { ok: v.classList.contains('ok'), paused: v.paused, t: v.currentTime, w: v.videoWidth, h: v.videoHeight, err: v.error && v.error.code } : 'video yok'; });
  console.log('video:', v);
  // Azaltılmış hareket: doğrudan son kare, hata yok
  const rmCtx = await browser.newContext({ viewport: { width: 970, height: 250 }, reducedMotion: 'reduce' });
  const rmPage = await rmCtx.newPage(); rmPage.on('pageerror', (e) => errors.push('rm pageerror: ' + e.message));
  await rmPage.goto('file://' + file); await rmPage.waitForTimeout(400);
  const rmState = await rmPage.evaluate(() => window.__kfc.state());
  console.log('azaltılmış hareket:', rmState.cls.includes('ended') && rmState.cls.includes('open') ? 'son karede ✔' : 'BEKLENMEDİK ' + rmState.cls);
  await rmPage.screenshot({ path: path.join(out, '12-azaltilmis-hareket.jpg'), type: 'jpeg', quality: 80 });
  await rmCtx.close();
  await ctx.close(); await browser.close();
  if (args.video) { const d = path.join(out, 'video'); for (const f of fs.readdirSync(d)) if (f.endsWith('.webm')) fs.renameSync(path.join(d, f), path.join(d, 'kfc-970x250.webm')); }
  if (errors.length) { console.log('HATALAR:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('hata yok ✔');
})();
