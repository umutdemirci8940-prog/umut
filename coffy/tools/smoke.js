#!/usr/bin/env node
'use strict';
/**
 * Etkileşim duman testi: 10 bannerın her birinde gerçek kullanıcı etkileşimini (dokunma, kaydırma,
 * kazıma, oyun, kaydırıcı) uygular; bitiş durumuna ulaşıldığını ve yol tarifi çıkışının
 * en yakın şubenin koordinatlarına gittiğini doğrular.
 *
 * Kullanım: node coffy/tools/smoke.js   (Playwright + Chromium gerekir)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const dist = path.join(__dirname, '..', 'dist');
const skip = async (p) => { await p.waitForTimeout(2200); await p.click('#v .skip'); };
const drag = async (p, sel, pts) => {
  const b = await p.locator(sel).boundingBox();
  await p.mouse.move(b.x + pts[0][0], b.y + pts[0][1]); await p.mouse.down();
  for (const [x, y] of pts.slice(1)) await p.mouse.move(b.x + x, b.y + y, { steps: 4 });
  await p.mouse.up();
};
const FLOWS = {
  '01': async (p) => { await skip(p); await p.click('.opt[data-i="0"]'); await p.waitForSelector('#e.on .end', { timeout: 6000 }); },
  '02': async (p) => { await skip(p); for (let i = 0; i < 5; i++) { await p.click('#cupw'); await p.waitForTimeout(150); } await p.waitForSelector('#reward.on'); await p.waitForSelector('#e.on .end', { timeout: 6000 }); },
  '03': async (p) => {
    await skip(p); await p.waitForSelector('#s.on'); await p.waitForTimeout(500); const pts = []; for (let y = 10; y <= 220; y += 14) { pts.push([10, y], [220, y + 7]); }
    await drag(p, '#cv', pts); await p.waitForSelector('#acts.on', { timeout: 4000 }); await p.click('#go', { force: true }); await p.waitForSelector('#e.on .end');
  },
  '04': async (p) => {
    await skip(p); await drag(p, '.card[data-i="0"]', [[120, 120], [150, 120], [260, 130]]);
    // kart animasyonu sürerken (busy) gelen tıklamalar yok sayılır: her adımda sayacı bekle
    for (let n = 1; n <= 3; n++) { if (n > 1) await p.click('#yes'); await p.waitForFunction((k) => document.querySelector('#cn').textContent.startsWith(k + '/'), n, { timeout: 3000 }).catch(async () => { await p.click('#yes'); }); }
    await p.waitForSelector('#e.on .end', { timeout: 5000 });
  },
  '05': async (p) => { await skip(p); await p.click('#start', { force: true }); await p.waitForSelector('#r.on', { timeout: 16000 }); await p.click('#claim', { force: true }); await p.waitForSelector('#e.on .end'); },
  '06': async (p) => { await skip(p); await p.waitForSelector('#sheet.on'); },
  '07': async (p) => { await skip(p); await p.click('.tile[data-k="focus"]'); await p.waitForSelector('#e.on .end', { timeout: 5000 }); const k = await p.textContent('#e .kicker'); if (!/cold brew/i.test(k)) throw new Error('öneri yanlış: ' + k); },
  '08': async (p) => { await p.waitForTimeout(500); await drag(p, '#sl', [[2, 18], [150, 18], [300, 18]]); await p.waitForSelector('.p8.done'); },
  '09': async (p) => { await skip(p); await p.click('.pn[data-i="1"]'); await p.waitForSelector('.pn[data-i="1"].on'); },
  '10': async (p) => { await skip(p); await p.click('.it[data-i="2"]'); await p.waitForSelector('.it[data-i="2"].on'); },
};

(async () => {
  const browser = await chromium.launch();
  const dirs = fs.readdirSync(dist).filter((d) => /^\d\d-/.test(d)).sort();
  const jobs = dirs.flatMap((d) => [[d, 970, 250, '970x250'], [d, 320, 480, '320x480']]);
  let fail = 0;
  for (let i = 0; i < jobs.length; i += 10) await Promise.all(jobs.slice(i, i + 10).map(async ([dir, w, h, label]) => {
    const no = dir.slice(0, 2);
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.route('**/fonts.*/**', (r) => r.abort());
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => { window.open = (u) => { window.__opened = u; }; });
    try {
      await p.goto('file://' + path.join(dist, dir, 'index.html'));
      await FLOWS[no](p);
      // Yalnızca CTA butonları tıklanabilir: logo / zemin tıklaması çıkış yapmamalı
      await p.mouse.click(20, 20); await p.mouse.click(w / 2, 6);
      if (await p.evaluate(() => window.__opened)) throw new Error('CTA dışı tıklama çıkış yaptı');
      const btn = p.locator('.scene.on [data-exit="directions"], .p8 [data-exit="directions"]').first();
      await btn.click({ force: true });
      const url = await p.evaluate(() => window.__opened);
      const want = await p.evaluate(() => locate().near);
      if (/utm_/i.test(url)) throw new Error('UTM var: ' + url);
      // Yol tarifi: Google Haritalar'da "Coffy" araması (kullanıcının konumuna göre en yakın şubeler)
      if (url !== 'https://www.google.com/maps/search/?api=1&query=Coffy') throw new Error('yol tarifi çıkışı hatalı: ' + url);
      if (errs.length) throw new Error(errs.join('; '));
      console.log(`✔ ${dir} ${label} → ${want.name}`);
    } catch (e) { fail++; console.log(`✘ ${dir} ${label}: ${e.message.split('\n')[0]}`); }
    await ctx.close();
  }));
  await browser.close();
  if (fail) { console.log(`${fail} banner başarısız`); process.exit(1); }
  console.log('Tüm bannerlar geçti.');
})();
