#!/usr/bin/env node
'use strict';
/**
 * Türkiye Sigorta – 970x250 billboard üretici.
 *
 *  1. src/scene.html  → assets/bg.jpg   (arka plan görseli, raster, 2x)
 *  2. src/logo.html   → assets/logo.png (özgün logo lockup'ı, saydam raster, 2x)
 *  3. src/template.html + gömülü font  → index.html (tek dosya)
 *  4. index.html → preview.png (son kare) ve banner-970x250.jpg (statik kopya)
 *
 * Kullanım: NODE_PATH=$(npm root -g) node build.js [--no-assets]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { execSync } = require('child_process');

const root = __dirname;
const W = 970, H = 250;
const URL = 'https://www.turkiyesigorta.com.tr/?utm_source=display&utm_medium=banner&utm_campaign=970x250';
const skipAssets = process.argv.includes('--no-assets');
const b64 = (f, mime) => `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`;
const kb = (n) => (n / 1024).toFixed(1) + ' KB';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  fs.mkdirSync(path.join(root, 'assets'), { recursive: true });

  if (!skipAssets) {
    // 1) Arka plan
    await page.goto('file://' + path.join(root, 'src', 'scene.html'));
    await page.waitForTimeout(200);
    const bgPath = path.join(root, 'assets', 'bg.jpg');
    await page.screenshot({ path: bgPath, type: 'jpeg', quality: 84, clip: { x: 0, y: 0, width: W, height: H } });
    console.log('✔ assets/bg.jpg   ', kb(fs.statSync(bgPath).size));

    // 2) Logo
    await page.goto('file://' + path.join(root, 'src', 'logo.html'));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    const box = await page.locator('#lockup').boundingBox();
    const logoPath = path.join(root, 'assets', 'logo.png');
    await page.screenshot({ path: logoPath, type: 'png', omitBackground: true, clip: { x: Math.floor(box.x), y: Math.floor(box.y), width: Math.ceil(box.width), height: Math.ceil(box.height) } });
    fs.writeFileSync(path.join(root, 'assets', 'logo.json'), JSON.stringify({ w: Math.ceil(box.width), h: Math.ceil(box.height) }));
    // PNG'yi paletli hale getir (boyut ~1/3) – Pillow varsa
    try { execSync(`python3 "${path.join(root, 'tools', 'quantize.py')}" "${logoPath}"`, { stdio: 'inherit' }); } catch { console.log('ℹ quantize atlandı (Pillow yok)'); }
    console.log('✔ assets/logo.png ', kb(fs.statSync(logoPath).size), `(${Math.ceil(box.width)}x${Math.ceil(box.height)} css px)`);
  }

  // 3) index.html
  const fontDir = path.join(root, 'assets', 'fonts');
  const logoDim = JSON.parse(fs.readFileSync(path.join(root, 'assets', 'logo.json'), 'utf8'));
  let html = fs.readFileSync(path.join(root, 'src', 'template.html'), 'utf8')
    .replace(/\{\{BG\}\}/g, b64(path.join(root, 'assets', 'bg.jpg'), 'image/jpeg'))
    .replace(/\{\{LOGO\}\}/g, b64(path.join(root, 'assets', 'logo.png'), 'image/png'))
    .replace(/\{\{FONT_LATIN\}\}/g, b64(path.join(fontDir, 'Manrope-subset-latin.woff2'), 'font/woff2'))
    .replace(/\{\{FONT_EXT\}\}/g, b64(path.join(fontDir, 'Manrope-subset-ext.woff2'), 'font/woff2'))
    .replace(/\{\{LOGO_W\}\}/g, String(logoDim.w))
    .replace(/\{\{URL\}\}/g, URL);
  const out = path.join(root, 'index.html');
  fs.writeFileSync(out, html);
  console.log('✔ index.html      ', kb(Buffer.byteLength(html)));

  // 4) Önizleme
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + out);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(3600);
  fs.mkdirSync(path.join(root, 'preview'), { recursive: true });
  await page.screenshot({ path: path.join(root, 'preview', 'preview@2x.png'), type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
  const ctx1 = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const p1 = await ctx1.newPage();
  await p1.goto('file://' + out);
  await p1.evaluate(() => document.fonts.ready);
  await p1.waitForTimeout(3600);
  await p1.screenshot({ path: path.join(root, 'banner-970x250.jpg'), type: 'jpeg', quality: 90, clip: { x: 0, y: 0, width: W, height: H } });
  // ara kareler (animasyon kontrolü)
  const p2 = await ctx1.newPage();
  await p2.goto('file://' + out);
  await p2.waitForTimeout(700);
  await p2.screenshot({ path: path.join(root, 'preview', 'frame-0.7s.png'), clip: { x: 0, y: 0, width: W, height: H } });
  await p2.waitForTimeout(700);
  await p2.screenshot({ path: path.join(root, 'preview', 'frame-1.4s.png'), clip: { x: 0, y: 0, width: W, height: H } });
  console.log('✔ preview/preview@2x.png, preview/frame-*.png, banner-970x250.jpg', errors.length ? `\n⚠ konsol hataları: ${errors.join(' | ')}` : '');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
