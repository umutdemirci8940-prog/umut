#!/usr/bin/env node
'use strict';
/**
 * Her boyut için belirli anlarda ekran görüntüsü alır (preview/screens/) ve
 * isteğe bağlı olarak kısa bir video kaydeder (preview/video/).
 *
 * Kullanım:  NODE_PATH=$(npm root -g) node tools/capture.js [--video]
 *
 * Not: Bazı ağlarda Chromium Google Fonts'a doğrudan erişemez; bu durumda
 * fontlar curl ile bir kez indirilip (preview/.fontcache) yerelden servis edilir.
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require('playwright');
const { SIZES } = require('../src/template');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'preview', 'screens');
const cache = path.join(root, 'preview', '.fontcache');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(cache, { recursive: true });
const wantVideo = process.argv.includes('--video');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const MOMENTS = [['intro', 1500], ['slide1', 4300], ['hover', 7400], ['slide3', 10900], ['outro', 20200]];

function ensureFonts(cssUrl) {
  const cssFile = path.join(cache, 'fonts.css');
  if (!fs.existsSync(cssFile)) {
    execSync(`curl -sS -A "${UA}" -o "${cssFile}" "${cssUrl}"`);
    const css = fs.readFileSync(cssFile, 'utf8');
    for (const m of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)) {
      const f = path.join(cache, path.basename(m[1]));
      if (!fs.existsSync(f)) execSync(`curl -sS -o "${f}" "${m[1]}"`);
    }
  }
  return fs.readFileSync(cssFile, 'utf8');
}

(async () => {
  const sample = fs.readFileSync(path.join(root, 'dist', '300x250', 'index.html'), 'utf8');
  const cssUrl = sample.match(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1].replace(/&amp;/g, '&');
  const fontCss = ensureFonts(cssUrl);

  const browser = await chromium.launch();
  for (const key of Object.keys(SIZES)) {
    const { w, h } = SIZES[key];
    const ctx = await browser.newContext({
      viewport: { width: w, height: h }, deviceScaleFactor: 2,
      recordVideo: wantVideo ? { dir: path.join(root, 'preview', 'video', key), size: { width: w, height: h } } : undefined,
    });
    await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fontCss }));
    await ctx.route('**/fonts.gstatic.com/**', (r) => {
      const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
      fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
    });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + path.join(root, 'dist', key, 'index.html'));
    // Headless imleç (0,0)'da durduğu için :hover aktif olur; okları yalnızca 'hover' karesinde göster.
    const hideArrows = await page.addStyleTag({ content: '.arrow{opacity:0!important}' });
    const t0 = Date.now();
    for (const [name, at] of MOMENTS) {
      const wait = at - (Date.now() - t0);
      if (wait > 0) await page.waitForTimeout(wait);
      if (name === 'hover') { await hideArrows.evaluate((e) => { e.disabled = true; }); await page.mouse.move(w / 2, h / 2); await page.waitForTimeout(400); }
      await page.screenshot({ path: path.join(outDir, `${key}-${name}.jpg`), type: 'jpeg', quality: 88 });
      if (name === 'hover') { await hideArrows.evaluate((e) => { e.disabled = false; }); await page.mouse.move(w - 1, h - 1); await page.evaluate(() => document.getElementById('ad').dispatchEvent(new Event('mouseleave'))); }
    }
    if (wantVideo) await page.waitForTimeout(2500);
    await ctx.close();
    console.log(`✔ ${key}${errors.length ? '  ⚠ ' + errors.join(' | ') : ''}`);
  }
  await browser.close();
})();
