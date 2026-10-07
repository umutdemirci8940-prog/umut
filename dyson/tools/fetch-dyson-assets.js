#!/usr/bin/env node
'use strict';
/**
 * dyson.com.tr kategori sayfalarını gerçek bir Chromium ile açar ve sayfanın yüklediği
 * ürün görsellerini, videolarını ve logoyu toplar. Çıktı: dyson/assets/raw/<kategori>/…  +  assets/raw/index.json
 * Kullanım (Playwright gerekir): node dyson/tools/fetch-dyson-assets.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Cloudflare engellerse sırayla diğer Dyson alan adları denenir.
const PAGES = {
  haircare: ['https://www.dyson.com.tr/products/hair-care', 'https://www.dyson.com.tr/products/hair-care/hair-dryers', 'https://www.dyson.co.uk/hair-care/hair-dryers', 'https://www.dyson.com.au/hair-care', 'https://www.dyson.in/hair-care', 'https://www.dyson.ie/hair-care', 'https://www.dyson.com/hair-care'],
  floorcare: ['https://www.dyson.com.tr/products/cord-free', 'https://www.dyson.com/vacuum-cleaners/cordless', 'https://www.dyson.co.uk/vacuum-cleaners/cordless', 'https://www.dyson.de/staubsauger/kabellose-staubsauger'],
};
const OUT = path.join(__dirname, '..', 'assets', 'raw');
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null; // örn. ONLY=haircare
const MAX_IMG = 40, MAX_VID = 4;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: !process.env.HEADED, args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({
    locale: 'tr-TR', viewport: { width: 1600, height: 1000 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36',
  });
  const index = {};
  const prev = fs.existsSync(path.join(OUT, 'index.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'index.json'), 'utf8')) : {};
  Object.assign(index, prev);
  for (const [key, urls] of Object.entries(PAGES)) {
   if (ONLY && !ONLY.includes(key)) continue;
   delete index[key];
   for (const url of urls) {
    const dir = path.join(OUT, key);
    fs.mkdirSync(dir, { recursive: true });
    const page = await ctx.newPage();
    const seen = new Map();
    page.on('response', async (res) => {
      const u = res.url(); const ct = (res.headers()['content-type'] || '');
      if (/image\/(png|jpe?g|webp|avif|svg)/.test(ct) || /video\//.test(ct) || /\.(mp4|webm)(\?|$)/.test(u)) seen.set(u, ct);
    });
    const entry = { url, status: null, title: null, images: [], videos: [], text: [] };
    try {
      const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      entry.status = r && r.status();
      await page.waitForTimeout(4000);
      for (const t of ['Tümünü kabul et', 'Kabul et', 'Accept all', 'Tüm çerezleri kabul et']) {
        const b = page.getByRole('button', { name: t }); if (await b.count()) { await b.first().click().catch(() => {}); break; }
      }
      for (let y = 0; y < 14; y++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(600); }
      await page.waitForTimeout(2500);
      entry.title = await page.title();
      const dom = await page.evaluate(() => {
        const imgs = [...document.querySelectorAll('img')].map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight }));
        const vids = [...document.querySelectorAll('video, video source')].map((v) => v.currentSrc || v.src).filter(Boolean);
        const og = document.querySelector('meta[property="og:image"]')?.content;
        const logo = document.querySelector('header svg, a[class*="logo"] svg')?.outerHTML || null;
        const heads = [...document.querySelectorAll('h1,h2,h3')].map((h) => h.textContent.trim()).filter(Boolean).slice(0, 60);
        return { imgs, vids, og, logo, heads };
      });
      entry.text = dom.heads;
      if (dom.logo) fs.writeFileSync(path.join(OUT, 'logo.svg'), dom.logo);
      await page.screenshot({ path: path.join(dir, '_page.jpg'), quality: 70, fullPage: false });
      const imgList = [...new Set([dom.og, ...dom.imgs.filter((i) => i.w >= 300).map((i) => i.src), ...[...seen].filter(([, ct]) => ct.startsWith('image')).map(([u]) => u)])]
        .filter((u) => u && /^https?:/.test(u) && !/\.svg/.test(u)).slice(0, MAX_IMG);
      const alts = Object.fromEntries(dom.imgs.map((i) => [i.src, i.alt]));
      const vidList = [...new Set([...dom.vids, ...[...seen].filter(([u, ct]) => ct.startsWith('video') || /\.(mp4|webm)/.test(u)).map(([u]) => u)])].slice(0, MAX_VID);
      let n = 0;
      for (const u of imgList) {
        try {
          const res = await ctx.request.get(u, { timeout: 30000 });
          if (!res.ok()) continue;
          const buf = await res.body(); if (buf.length < 8000) continue;
          const ext = ((res.headers()['content-type'] || '').match(/(png|jpeg|webp|avif)/) || ['', 'jpg'])[1].replace('jpeg', 'jpg');
          const f = `img-${String(++n).padStart(2, '0')}.${ext}`;
          fs.writeFileSync(path.join(dir, f), buf);
          entry.images.push({ file: f, url: u, alt: alts[u] || '', bytes: buf.length });
        } catch (e) { /* atla */ }
      }
      n = 0;
      for (const u of vidList) {
        try {
          const res = await ctx.request.get(u, { timeout: 90000 });
          if (!res.ok()) continue;
          const buf = await res.body(); if (buf.length > 40e6) continue;
          const f = `video-${++n}.mp4`;
          fs.writeFileSync(path.join(dir, f), buf);
          entry.videos.push({ file: f, url: u, bytes: buf.length });
        } catch (e) { /* atla */ }
      }
    } catch (e) { entry.error = String(e); }
    console.log(key, url, entry.status, entry.title, `${entry.images.length} görsel, ${entry.videos.length} video`, entry.error || '');
    await page.close();
    if (!index[key] || entry.images.length > index[key].images.length) index[key] = entry;
    if (entry.images.length >= 5) break;
   }
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));
  await browser.close();
})();
