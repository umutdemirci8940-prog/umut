#!/usr/bin/env node
'use strict';
/** KFSOOO 970x250 (v2): anlık ekran görüntüleri (preview/kfsooo/), etkileşim testleri, --video ile kayıt. */
const path = require('path'); const fs = require('fs'); const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const file = path.resolve(root, args.file || 'dist/kfsooo-970x250/index-test.html');
const out = path.join(root, 'preview', 'kfsooo'); fs.mkdirSync(out, { recursive: true });
const MOMENTS = [['00-acilis', 200], ['01-kinetik', 750], ['02-etiket', 1650], ['03-baslik', 2400], ['04-urun', 3350], ['05-fiyat', 3950], ['06-bolunme', 5800], ['07-toplam', 6900], ['08-son-kare', 8200], ['09-montaj', 10100]];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2, recordVideo: args.video ? { dir: path.join(out, 'video'), size: { width: 970, height: 250 } } : undefined });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto('file://' + file); const t0 = Date.now();
  for (const [name, at] of MOMENTS) { const w = at - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 88 }); }
  const vinfo = () => page.evaluate(() => [...document.querySelectorAll('.films video')].map((v) => ({ on: v.classList.contains('on'), ok: v.classList.contains('ok'), paused: v.paused, t: +v.currentTime.toFixed(1) })));
  console.log('durum:', await page.evaluate(() => window.__kfsooo.state()));
  console.log('filmler:', JSON.stringify(await vinfo()));
  // Fiyat anahtarı (döngü bitmeden)
  await page.locator('.tg').nth(1).hover(); await page.waitForTimeout(1000);
  console.log('anahtar (1 bekleniyor):', (await page.evaluate(() => window.__kfsooo.state())).mode, 'rakam genişlikleri:', await page.evaluate(() => [...document.querySelectorAll('.d')].map((d) => Math.round(d.getBoundingClientRect().width))));
  await page.screenshot({ path: path.join(out, '12-toplam-hover.jpg'), type: 'jpeg', quality: 88 });
  // Film küçük resmi → film değişir
  await page.locator('.ft').nth(1).hover(); await page.waitForTimeout(900);
  const s1 = await page.evaluate(() => window.__kfsooo.state()); console.log('film şeridi (1 bekleniyor):', s1.film, JSON.stringify((await vinfo()).map((v) => [v.on, v.ok, v.paused])));
  await page.screenshot({ path: path.join(out, '10-film-secimi.jpg'), type: 'jpeg', quality: 88 });
  // Kaydırarak (swipe) film değiştirme
  await page.mouse.move(600, 120); await page.mouse.down(); await page.mouse.move(480, 120, { steps: 6 }); await page.mouse.up(); await page.waitForTimeout(700);
  console.log('swipe (2 bekleniyor):', (await page.evaluate(() => window.__kfsooo.state())).film);
  // Ürün 3B eğim
  await page.mouse.move(120, 30); await page.waitForTimeout(500);
  console.log('ürün eğimi:', await page.evaluate(() => { const s = getComputedStyle(document.getElementById('ad')); return [s.getPropertyValue('--ry').trim(), s.getPropertyValue('--rx').trim()]; }));
  await page.locator('.prodw').hover(); await page.waitForTimeout(400); await page.screenshot({ path: path.join(out, '11-urun-hover.jpg'), type: 'jpeg', quality: 88 });
  // Yasal
  await page.locator('.info').hover(); await page.waitForTimeout(600);
  console.log('yasal açık:', await page.evaluate(() => document.getElementById('ad').classList.contains('legal-open')));
  await page.screenshot({ path: path.join(out, '13-yasal.jpg'), type: 'jpeg', quality: 88 });
  await page.mouse.move(600, 100); await page.waitForTimeout(500);
  // Tıklama
  const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 4000 }).catch(() => null), page.mouse.click(560, 60)]);
  console.log('tıklama hedefi:', popup ? popup.url() : 'AÇILMADI'); if (popup) await popup.close();
  if (args.video) { const w = 16500 - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); }
  // Azaltılmış hareket
  const rmCtx = await browser.newContext({ viewport: { width: 970, height: 250 }, reducedMotion: 'reduce' }); const rmPage = await rmCtx.newPage();
  rmPage.on('pageerror', (e) => errors.push('rm: ' + e.message)); await rmPage.goto('file://' + file); await rmPage.waitForTimeout(600);
  const rs = await rmPage.evaluate(() => window.__kfsooo.state()); console.log('azaltılmış hareket:', /ended/.test(rs.cls) ? 'son karede ✔' : 'BEKLENMEDİK ' + rs.cls);
  await rmPage.screenshot({ path: path.join(out, '14-azaltilmis-hareket.jpg'), type: 'jpeg', quality: 80 }); await rmCtx.close();
  await ctx.close(); await browser.close();
  if (args.video) { const d = path.join(out, 'video'); for (const f of fs.readdirSync(d)) if (f.endsWith('.webm')) fs.renameSync(path.join(d, f), path.join(d, 'kfsooo-970x250.webm')); }
  if (errors.length) { console.log('HATALAR:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('hata yok ✔');
})();
