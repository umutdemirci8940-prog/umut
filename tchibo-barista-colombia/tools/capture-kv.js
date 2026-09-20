#!/usr/bin/env node
'use strict';
/** Kampanya KV masthead'inin ekran görüntüleri: preview/screens/kv-*.jpg  (NODE_PATH=$(npm root -g) node tools/capture-kv.js) */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const dist = path.join(root, 'dist', '970x250-kampanya', 'index.html');
const out = path.join(root, 'preview', 'screens');
const cache = path.join(root, 'preview', '.fontcache-kv');
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync(cache, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
function ensureFonts(cssUrl) {
  const cssFile = path.join(cache, 'fonts.css');
  if (!fs.existsSync(cssFile)) {
    execSync(`curl -sS -A "${UA}" -o "${cssFile}" "${cssUrl}"`);
    for (const m of fs.readFileSync(cssFile, 'utf8').matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)) {
      const f = path.join(cache, path.basename(m[1])); if (!fs.existsSync(f)) execSync(`curl -sS -o "${f}" "${m[1]}"`);
    }
  }
  return fs.readFileSync(cssFile, 'utf8');
}
(async () => {
  const html = fs.readFileSync(dist, 'utf8');
  const cssUrl = html.match(/href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1].replace(/&amp;/g, '&');
  let fontCss = null; try { fontCss = ensureFonts(cssUrl); } catch (e) { console.log('ℹ Fontlar indirilemedi:', e.message); }
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  if (fontCss) {
    await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fontCss }));
    await ctx.route('**/fonts.gstatic.com/**', (r) => { const f = path.join(cache, path.basename(new URL(r.request().url()).pathname)); fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort(); });
  } else await ctx.route('**/fonts.g*.com/**', (r) => r.abort());
  const page = await ctx.newPage();
  const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('file://' + dist, { waitUntil: 'commit' });
  await page.waitForSelector('#ad.go', { state: 'attached', timeout: 10000 });
  const start = Date.now();
  const at = async (ms) => { const d = start + ms - Date.now(); if (d > 0) await page.waitForTimeout(d); };
  const shot = (name) => page.screenshot({ path: path.join(out, `kv-${name}.jpg`), type: 'jpeg', quality: 88 });
  await at(700); await shot('01-acilis');
  await at(1500); await shot('02-paket-inis');
  await at(2600); await shot('03-baslik');
  await at(4600); await shot('04-kv-son');
  await at(6650); await shot('05-gecis');
  await at(8200); await shot('06-mutfak');
  await at(12600); await shot('07-son-kare');
  await page.mouse.move(535, 150); await page.waitForTimeout(500); await shot('08-hover-paket');
  await page.mouse.move(120, 120); await page.waitForTimeout(600); await shot('09-paralaks');
  await browser.close();
  console.log('✔ Ekran görüntüleri:', path.relative(root, out) + (errors.length ? '  ⚠ ' + errors.join(' | ') : ''));
})().catch((e) => { console.error(e); process.exit(1); });
