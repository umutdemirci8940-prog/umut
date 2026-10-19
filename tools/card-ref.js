#!/usr/bin/env node
'use strict';
/**
 * Bonus kredi kartı görselleri: kart sayfalarını gezer, kart görsellerini indirir ve
 * garanti-bonus-masthead/brand-ref/cards/ altına yazar (index.json + ekran görüntüleri).
 * Kullanım: node tools/card-ref.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const PAGES = [
  'https://www.bonus.com.tr/kredi-kartlari',
  'https://www.bonus.com.tr/kredi-karti',
  'https://www.bonus.com.tr/bonus-kart',
  'https://www.bonus.com.tr/',
  'https://www.garantibbva.com.tr/kartlar/kredi-kartlari',
  'https://www.garantibbva.com.tr/kartlar/kredi-kartlari/bonus-kart',
  'https://www.garantibbva.com.tr/kartlar/kredi-kartlari/bonus-platinum',
];
const out = path.join(__dirname, '..', 'garanti-bonus-masthead', 'brand-ref', 'cards');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'tr-TR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36' });
  const index = [], seen = new Set();
  let n = 0, k = 0;
  for (const url of PAGES) {
    const page = await ctx.newPage();
    try { await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); }
    catch (e) { index.push({ page: url, error: e.message.slice(0, 200) }); await page.close(); continue; }
    await page.waitForTimeout(2000);
    for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(400); } // lazy görseller
    await page.screenshot({ path: path.join(out, `page-${k++}.jpg`), quality: 60 });
    const imgs = await page.evaluate(() => [...document.querySelectorAll('img, [style*="background-image"]')].map(e => {
      const src = e.tagName === 'IMG' ? (e.currentSrc || e.src) : (getComputedStyle(e).backgroundImage.match(/url\("?(.*?)"?\)/) || [])[1];
      const r = e.getBoundingClientRect();
      return { src, alt: e.alt || e.getAttribute('title') || '', cls: e.className && String(e.className), w: Math.round(r.width), h: Math.round(r.height),
        nw: e.naturalWidth || 0, nh: e.naturalHeight || 0 };
    }).filter(i => i.src && !i.src.startsWith('data:')));
    for (const i of imgs) {
      const hay = (i.src + ' ' + i.alt + ' ' + i.cls).toLowerCase();
      const cardish = /kart|card|bonus|platinum|premium|troy|visa|master/.test(hay);
      const ratio = (i.nw || i.w) / Math.max(1, (i.nh || i.h));
      if (!cardish && !(ratio > 1.4 && ratio < 1.8)) continue;
      if (seen.has(i.src)) continue; seen.add(i.src);
      try {
        const res = await ctx.request.get(i.src); if (!res.ok()) continue;
        const body = await res.body(); if (body.length < 3000) continue;
        const ext = ((i.src.split('?')[0].match(/\.(png|jpe?g|webp|svg|gif)$/i) || [, 'bin'])[1]).toLowerCase();
        const file = `img-${String(n++).padStart(3, '0')}.${ext}`;
        fs.writeFileSync(path.join(out, file), body);
        index.push({ page: url, file, ...i, bytes: body.length });
      } catch { /* atla */ }
      if (n > 120) break;
    }
    await page.close();
  }
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
  await browser.close();
  console.log('İndirilen görsel:', n);
})();
