#!/usr/bin/env node
'use strict';
/** KFSOOO 970x250: anlık ekran görüntüleri (preview/kfsooo/), etkileşim testleri, --video ile kayıt. */
const path = require('path'); const fs = require('fs'); const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const file = path.resolve(root, args.file || 'dist/kfsooo-970x250/index.html');
const out = path.join(root, 'preview', 'kfsooo'); fs.mkdirSync(out, { recursive: true });
const MOMENTS = [['00-acilis', 250], ['01-etiket', 900], ['02-baslik', 2000], ['03-fiyat', 3000], ['04-tepsi', 4700], ['05-cta', 5400], ['06-son-kare', 7400], ['07-toplam', 8300]];
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2, recordVideo: args.video ? { dir: path.join(out, 'video'), size: { width: 970, height: 250 } } : undefined });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  const t0 = Date.now(); await page.goto('file://' + file);
  for (const [name, at] of MOMENTS) { const w = at - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); await page.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 88 }); }
  console.log('durum:', await page.evaluate(() => window.__kfsooo.state()));
  const digits = await page.evaluate(() => [...document.querySelectorAll('.d>span')].map((s) => s.style.transform));
  console.log('rakam konumları (310 → -228/-76/0 bekleniyor):', digits);
  // Fiyat anahtarı: Kişi başı'na geç
  await page.locator('.tg').nth(0).hover(); await page.waitForTimeout(1100);
  const st = await page.evaluate(() => window.__kfsooo.state()); console.log('anahtar (mode 0 bekleniyor):', st.mode);
  await page.screenshot({ path: path.join(out, '08-kisi-basi-hover.jpg'), type: 'jpeg', quality: 88 });
  // Fare ile fotoğraf kaydırma
  await page.mouse.move(600, 235); await page.waitForTimeout(500); await page.screenshot({ path: path.join(out, '09-scrub-alt.jpg'), type: 'jpeg', quality: 88 });
  await page.mouse.move(600, 15); await page.waitForTimeout(500); await page.screenshot({ path: path.join(out, '10-scrub-ust.jpg'), type: 'jpeg', quality: 88 });
  // Yasal metin
  await page.locator('.info').hover(); await page.waitForTimeout(600);
  console.log('yasal kutu açık mı:', await page.evaluate(() => document.getElementById('ad').classList.contains('legal-open')));
  await page.screenshot({ path: path.join(out, '11-yasal.jpg'), type: 'jpeg', quality: 88 });
  await page.mouse.move(600, 100); await page.waitForTimeout(500);
  console.log('yasal kutu kapandı mı:', !(await page.evaluate(() => document.getElementById('ad').classList.contains('legal-open'))));
  // Etiket üzerine gelme
  await page.locator('.sticker').hover(); await page.waitForTimeout(250); await page.screenshot({ path: path.join(out, '12-etiket-hover.jpg'), type: 'jpeg', quality: 88 });
  // Tıklama → yeni sekme
  const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 4000 }).catch(() => null), page.mouse.click(520, 120)]);
  console.log('tıklama hedefi:', popup ? popup.url() : 'AÇILMADI'); if (popup) await popup.close();
  if (args.video) { const w = 15500 - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); }
  // Azaltılmış hareket
  const rmCtx = await browser.newContext({ viewport: { width: 970, height: 250 }, reducedMotion: 'reduce' }); const rmPage = await rmCtx.newPage();
  rmPage.on('pageerror', (e) => errors.push('rm: ' + e.message)); await rmPage.goto('file://' + file); await rmPage.waitForTimeout(400);
  const rs = await rmPage.evaluate(() => window.__kfsooo.state()); console.log('azaltılmış hareket:', /ended/.test(rs.cls) ? 'son karede ✔' : 'BEKLENMEDİK ' + rs.cls);
  await rmPage.screenshot({ path: path.join(out, '13-azaltilmis-hareket.jpg'), type: 'jpeg', quality: 80 }); await rmCtx.close();
  await ctx.close(); await browser.close();
  if (args.video) { const d = path.join(out, 'video'); for (const f of fs.readdirSync(d)) if (f.endsWith('.webm')) fs.renameSync(path.join(d, f), path.join(d, 'kfsooo-970x250.webm')); }
  if (errors.length) { console.log('HATALAR:\n' + errors.join('\n')); process.exitCode = 1; } else console.log('hata yok ✔');
})();
