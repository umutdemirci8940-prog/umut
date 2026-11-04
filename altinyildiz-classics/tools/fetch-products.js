#!/usr/bin/env node
'use strict';
/**
 * src/ac-urunler.json'daki ürün sayfalarını gezer; her ürünün adını, fiyatını ve galeri fotoğraflarını indirir.
 * Çıktı: assets/raw-ac/<no>-<k>.jpg ve assets/raw-ac/index.json   (GitHub Actions'ta çalışır)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const list = require('../src/ac-urunler.json').filter((p) => !p.dup);
const out = path.join(__dirname, '..', 'assets', 'raw-ac');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const SITE = 'https://www.altinyildizclassics.com/';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'tr-TR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' });
  const page = await ctx.newPage();
  const index = [];
  for (const p of list) {
    const rec = { no: p.no, path: p.path, title: null, prices: [], images: [] };
    try {
      await page.goto(SITE + p.path, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3500);
      const info = await page.evaluate(() => {
        const h1 = document.querySelector('h1');
        const og = document.querySelector('meta[property="og:image"]');
        const imgs = [...document.querySelectorAll('img')].map((i) => i.currentSrc || i.getAttribute('data-src') || i.src)
          .filter((u) => u && /images\.altinyildizclassics\.com/.test(u) && !/icon|logo|banner|kampanya/i.test(u));
        const body = document.body.innerText;
        return { title: h1 ? h1.innerText.trim() : document.title, og: og && og.content, imgs, prices: (body.match(/[\d.]+,\d{2}\s*TL/g) || []).slice(0, 6) };
      });
      rec.title = info.title; rec.prices = info.prices;
      const urls = [...new Set([info.og, ...info.imgs].filter(Boolean))];
      // Ürün koduna ait görseller (ilk 6)
      const code = (info.og || '').match(/images\/([A-Z0-9]+[A-Z]{2,3})_/i);
      const mine = code ? urls.filter((u) => u.includes(code[1])) : urls;
      let k = 0;
      for (const u of mine.slice(0, 8)) {
        const big = u.replace(/mnresize\/\d+\/\d+\//, 'mnresize/1000/1500/');
        for (const cand of [big, u]) {
          try {
            const r = await ctx.request.get(cand, { timeout: 30000 });
            if (!r.ok()) continue;
            const buf = await r.body(); if (buf.length < 8000) continue;
            const f = `${String(p.no).padStart(2, '0')}-${k++}.jpg`;
            fs.writeFileSync(path.join(out, f), buf); rec.images.push({ file: f, src: cand }); break;
          } catch { /* sonraki */ }
        }
        if (k >= 6) break;
      }
      await page.screenshot({ path: path.join(out, `${String(p.no).padStart(2, '0')}-sayfa.jpg`), type: 'jpeg', quality: 55 });
    } catch (e) { rec.error = e.message; }
    console.log(p.no, rec.title, rec.images.length, rec.error || '');
    index.push(rec);
  }
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
  await browser.close();
})();
