#!/usr/bin/env node
'use strict';
/**
 * selfy.com.tr Selfy Fest '26 kampanya sayfasını ziyaret eder; sayfa metnini, HTML'ini,
 * tam sayfa ekran görüntüsünü ve sayfadaki tüm görselleri selfyfest26/source/ altına kaydeder.
 * (Bulut oturumunun ağ politikası siteye izin vermediği için GitHub Actions'ta çalışır.)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL = 'https://www.selfy.com.tr/kampanyalar/selfyfest26';
const out = path.join(__dirname, '..', 'source');
const imgDir = path.join(out, 'img');
fs.mkdirSync(imgDir, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'tr-TR' });
  const page = await ctx.newPage();
  const seen = new Map();
  page.on('response', async (r) => {
    const ct = r.headers()['content-type'] || '';
    if (!/image|font|css/.test(ct) && !/\.(png|jpe?g|webp|gif|svg|avif|woff2?|ttf|otf|css)(\?|$)/i.test(r.url())) return;
    try { const b = await r.body(); if (b.length > 200) seen.set(r.url(), { b, ct }); } catch {}
  });
  try { await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 120000 }); }
  catch (e) { console.error('goto:', e.message.split('\n')[0]); }
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => console.error('networkidle beklenmedi'));
  for (let y = 0; y < 15000; y += 600) { await page.mouse.wheel(0, 600); await page.waitForTimeout(250); }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(out, 'page.png'), fullPage: true });
  await ctx.newPage().then(async (m) => {
    await m.setViewportSize({ width: 390, height: 844 });
    await m.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }).catch(() => {});
    await m.waitForTimeout(5000);
    await m.screenshot({ path: path.join(out, 'page-mobile.png'), fullPage: true }).catch(() => {});
  });
  fs.writeFileSync(path.join(out, 'page.html'), await page.content());
  fs.writeFileSync(path.join(out, 'page.txt'), await page.evaluate(() => document.body.innerText));
  const meta = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight }));
    const bgs = [...document.querySelectorAll('*')].map((e) => getComputedStyle(e).backgroundImage).filter((b) => b && b !== 'none');
    const colors = {};
    for (const e of document.querySelectorAll('*')) {
      const s = getComputedStyle(e);
      for (const c of [s.color, s.backgroundColor]) if (c && c !== 'rgba(0, 0, 0, 0)') colors[c] = (colors[c] || 0) + 1;
    }
    const fonts = [...new Set([...document.querySelectorAll('h1,h2,h3,p,a,span,button')].map((e) => getComputedStyle(e).fontFamily))];
    const links = [...document.querySelectorAll('a')].map((a) => ({ t: a.innerText.trim().slice(0, 80), h: a.href })).filter((l) => l.t);
    return { title: document.title, imgs, bgs: [...new Set(bgs)], colors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 30), fonts, links };
  });
  const files = [];
  let i = 0;
  for (const [u, { b, ct }] of seen) {
    let ext = (u.split('?')[0].match(/\.(png|jpe?g|webp|gif|svg|avif|woff2?|ttf|otf|css)$/i) || [])[1];
    if (!ext) ext = (ct.match(/(png|jpeg|webp|gif|svg|avif|woff2|css)/) || ['', 'bin'])[1];
    const name = String(++i).padStart(3, '0') + '-' + path.basename(u.split('?')[0]).replace(/[^\w.-]/g, '_').slice(-60);
    const fn = name.endsWith('.' + ext) ? name : `${name}.${ext}`;
    if (b.length > 4 * 1024 * 1024) continue;
    fs.writeFileSync(path.join(imgDir, fn), b);
    files.push({ file: fn, url: u, bytes: b.length });
  }
  fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify({ url: URL, ...meta, files }, null, 1));
  console.log(`✔ ${files.length} dosya, başlık: ${meta.title}`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
