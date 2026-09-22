#!/usr/bin/env node
'use strict';
/**
 * Ekran görüntüleri (preview/screens/*.jpg) ve isteğe bağlı kısa video (preview/video/pandora-970x250.webm).
 * Kullanım: NODE_PATH=$(npm root -g) node tools/capture.js [--video] [--file=dist/970x250/index.html] [--quick]
 * Google Fonts, ağ engeli olan ortamlar için assets/fonts altındaki önbellekten servis edilir.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const file = 'file://' + path.resolve(root, String(args.file || 'dist/970x250/index.html'));
const outDir = path.resolve(root, String(args.out || 'preview/screens'));
fs.mkdirSync(outDir, { recursive: true });
const W = 970, H = 250;
const fontsDir = path.join(root, 'assets', 'fonts');
const fontCss = fs.existsSync(path.join(fontsDir, 'inter.css')) ? fs.readFileSync(path.join(fontsDir, 'inter.css'), 'utf8') : null;

async function routeFonts(ctx) {
  if (!fontCss) return;
  await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fontCss }));
  await ctx.route('**/fonts.gstatic.com/**', (r) => { const f = path.join(fontsDir, path.basename(new URL(r.request().url()).pathname)); fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort(); });
}
async function run(ctx, { video }) {
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(file);
  const st = () => page.evaluate(() => window.pandoraMasthead.state());
  const shot = async (name) => { if (!video) await page.screenshot({ path: path.join(outDir, `${name}.jpg`), type: 'jpeg', quality: 80 }); };
  const t0 = Date.now();
  const at = async (ms) => { const w = ms - (Date.now() - t0); if (w > 0) await page.waitForTimeout(w); };
  await at(500); await shot('01-acilis');
  await at(1500); await shot('02-mesaj');
  await at(2800); await shot('03-bileklik-sahnede');
  await at(4400); await shot('04-demo-charm-1');
  await at(7300); await shot('05-demo-charm-3');
  if (args.quick) { await page.close(); return errors; }
  await at(8600); await shot('06-dinlenme-cta');
  // kullanıcı: fare girer, metal değiştirir, charm ekler
  await page.mouse.move(600, 120); await page.waitForTimeout(400);
  await page.hover('.metal[data-metal="rose"]'); await page.waitForTimeout(200);
  await page.click('.metal[data-metal="rose"]'); await page.waitForTimeout(700); await shot('07-rose-gold');
  await page.hover('.cell[data-charm="butterfly"]'); await page.waitForTimeout(350); await shot('08-charm-hover');
  await page.click('.cell[data-charm="butterfly"]'); await page.waitForTimeout(350); await shot('09-charm-ucuyor');
  await page.waitForTimeout(600); await page.click('.cell[data-charm="galaxy"]'); await page.waitForTimeout(900); await shot('10-bileklik-dolu');
  await page.click('.metal[data-metal="gold"]'); await page.waitForTimeout(700); await shot('11-altin');
  const ch = await page.$('.slot .charm'); if (ch) { await ch.hover({ force: true }); await page.waitForTimeout(300); await shot('12-charm-cikar-hover'); }
  await page.mouse.move(120, 200); await page.waitForTimeout(300); await shot('13-cta-hover');
  if (video) { await page.waitForTimeout(1500); }
  if (!video) {
    const p2 = await ctx.newPage(); await p2.emulateMedia({ reducedMotion: 'reduce' }); await p2.goto(file); await p2.waitForTimeout(900);
    await p2.screenshot({ path: path.join(outDir, '14-azaltilmis-hareket.jpg'), type: 'jpeg', quality: 80 }); await p2.close();
  }
  await page.close();
  return errors;
}
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  await routeFonts(ctx);
  const errors = await run(ctx, { video: false });
  await ctx.close();
  console.log(`✔ ${fs.readdirSync(outDir).filter((f) => f.endsWith('.jpg')).length} ekran görüntüsü → ${path.relative(root, outDir)}/${errors.length ? '  ⚠ ' + errors.join(' | ') : ''}`);
  if (args.video) {
    const vdir = path.join(root, 'preview', 'video'); fs.rmSync(vdir, { recursive: true, force: true }); fs.mkdirSync(vdir, { recursive: true });
    const vctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, recordVideo: { dir: vdir, size: { width: W, height: H } } });
    await routeFonts(vctx); await run(vctx, { video: true }); await vctx.close();
    const v = fs.readdirSync(vdir).find((f) => f.endsWith('.webm'));
    if (v) { fs.renameSync(path.join(vdir, v), path.join(vdir, 'pandora-970x250.webm')); console.log(`✔ preview/video/pandora-970x250.webm (${(fs.statSync(path.join(vdir, 'pandora-970x250.webm')).size / 1024).toFixed(0)} KB)`); }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
