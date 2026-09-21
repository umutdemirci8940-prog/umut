#!/usr/bin/env node
'use strict';
/**
 * Ekran görüntüleri (preview/screens/*.jpg) ve isteğe bağlı kısa video (preview/video/paribu-970x250.webm).
 * Oyun, fare simülasyonuyla oynanır (düşen coine doğru hareket).
 * Kullanım: NODE_PATH=$(npm root -g) node tools/capture.js [--video]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const file = 'file://' + path.join(root, 'dist', '970x250', 'index.html');
const outDir = path.join(root, 'preview', 'screens');
fs.mkdirSync(outDir, { recursive: true });
const wantVideo = process.argv.includes('--video');
const W = 970, H = 250;

async function run(ctx, { video }) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(file);
  const st = () => page.evaluate(() => window.paribuMasthead.state());
  const shot = async (name) => { if (!video) await page.screenshot({ path: path.join(outDir, `${name}.jpg`), type: 'jpeg', quality: 90 }); };
  const t0 = Date.now();
  const at = async (ms) => { const w = ms - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); };
  await at(600); await shot('01-acilis');
  await at(1500); await shot('02-coinler-geliyor');
  await at(2950); await shot('03-kurgu-tamam');
  await at(5200); await shot('04-otomatik-gosteri');
  // yüzen coine hover (isim etiketi)
  let s0 = await st(); const fls = s0.coins.filter((c) => c.state === 'float'); const fl = fls[Math.min(2, fls.length - 1)];
  if (fl) { await page.mouse.move(fl.x, fl.y); await page.waitForTimeout(350); await shot('04b-coin-hover'); }
  // oyun: fare alana girer, en aşağıdaki coine yönelir
  await page.mouse.move(560, 130);
  let s = await st(), caught = false, shotsLeft = { play: 1, catch: 1 };
  for (let i = 0; i < 260 && s.mode !== 'win'; i++) {
    s = await st();
    const f = s.coins.filter((c) => c.state === 'fall').sort((a, b) => b.y - a.y)[0];
    if (f) await page.mouse.move(f.x + (i % 7 === 0 && s.score < 1 ? 70 : 0), 130); // ilk turda bir kez kaçırsın
    if (s.score >= 1 && shotsLeft.play) { shotsLeft.play = 0; await shot('05-oyun'); }
    if (s.score >= 3 && shotsLeft.catch) { shotsLeft.catch = 0; await page.waitForTimeout(120); await shot('06-portfoy-doluyor'); }
    await page.waitForTimeout(70);
  }
  await page.waitForTimeout(420); await shot('07-kazandin');
  await page.waitForTimeout(1200); await shot('08-konfeti');
  if (video) { await page.waitForTimeout(2600); await page.mouse.move(600, 60); await page.waitForTimeout(1500); }
  // sağ üst kampanya kartına hover
  await page.mouse.move(850, 60); await page.waitForTimeout(300); if (!video) await shot('09-kampanya-hover');
  // azaltılmış hareket (statik son kare)
  if (!video) {
    const p2 = await ctx.newPage();
    await p2.emulateMedia({ reducedMotion: 'reduce' });
    await p2.goto(file); await p2.waitForTimeout(900);
    await p2.screenshot({ path: path.join(outDir, '10-azaltilmis-hareket.jpg'), type: 'jpeg', quality: 90 });
    await p2.close();
  }
  await page.close();
  return errors;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const errors = await run(ctx, { video: false });
  await ctx.close();
  console.log(`✔ ${fs.readdirSync(outDir).filter((f) => f.endsWith('.jpg')).length} ekran görüntüsü → preview/screens/${errors.length ? '  ⚠ ' + errors.join(' | ') : ''}`);
  if (wantVideo) {
    const vdir = path.join(root, 'preview', 'video');
    fs.rmSync(vdir, { recursive: true, force: true }); fs.mkdirSync(vdir, { recursive: true });
    const vctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, recordVideo: { dir: vdir, size: { width: W, height: H } } });
    await run(vctx, { video: true });
    await vctx.close();
    const v = fs.readdirSync(vdir).find((f) => f.endsWith('.webm'));
    if (v) { fs.renameSync(path.join(vdir, v), path.join(vdir, 'paribu-970x250.webm')); console.log(`✔ preview/video/paribu-970x250.webm (${(fs.statSync(path.join(vdir, 'paribu-970x250.webm')).size / 1024).toFixed(0)} KB)`); }
  }
  await browser.close();
})();
