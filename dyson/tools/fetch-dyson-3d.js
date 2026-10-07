#!/usr/bin/env node
'use strict';
/**
 * Dyson ürün sayfalarında AR / 3D model (glb, gltf, usdz) ve 360° döndürme (spinset) kaynaklarını arar.
 * Kategori sayfasından ürün sayfası bağlantılarını toplar, her sayfayı gerçek Chromium ile açar,
 * ağ isteklerini ve HTML'i tarar; bulunan modelleri indirir.
 * Çıktı: dyson/assets/3d/<dosya> + index.json
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const OUT = path.join(__dirname, '..', 'assets', '3d');
const CATS = ['https://www.dyson.com.tr/products/hair-care/hair-dryers', 'https://www.dyson.com.tr/products/cord-free'];
const WANT = [/nural/i, /v12-detect-slim|v12/i];
const RX = /https?:[^"'\s)]+?\.(glb|gltf|usdz)(\?[^"'\s)]*)?/gi;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: false, args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({ locale: 'tr-TR', viewport: { width: 1440, height: 900 }, userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36' });
  const found = new Map(); const spins = new Set(); const pages = [];
  const watch = (page) => page.on('request', (r) => {
    const u = r.url();
    if (/\.(glb|gltf|usdz)(\?|$)/i.test(u)) found.set(u, page.url());
    if (/req=set|spinset|spin/i.test(u) && /assetsadobe|scene7/i.test(u)) spins.add(u);
  });
  const links = new Set();
  for (const c of CATS) {
    const p = await ctx.newPage(); watch(p);
    try {
      await p.goto(c, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(5000);
      for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(400); }
      const hrefs = await p.$$eval('a[href]', (as) => as.map((a) => a.href));
      hrefs.filter((h) => h.includes('dyson.com.tr') && WANT.some((w) => w.test(h)) && !/#|\?/.test(h.split('dyson.com.tr')[1].slice(0, 1))).forEach((h) => links.add(h.split('#')[0]));
      console.log(c, await p.title(), hrefs.length, 'bağlantı');
    } catch (e) { console.log('HATA', c, String(e)); }
    await p.close();
  }
  console.log('Ürün sayfaları:', [...links]);
  for (const url of [...links].slice(0, 10)) {
    const p = await ctx.newPage(); watch(p);
    const entry = { url, title: null, models: [], spin: [], arButtons: 0 };
    try {
      await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(6000);
      entry.title = await p.title();
      for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 700); await p.waitForTimeout(400); }
      // AR / 3D düğmelerini dene
      for (const t of [/3D/i, /AR/, /Evinizde/i, /360/]) {
        const b = p.getByRole('button', { name: t });
        const n = await b.count(); entry.arButtons += n;
        if (n) { await b.first().click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(3000); }
      }
      const html = await p.content();
      for (const m of html.matchAll(RX)) found.set(m[0].replace(/&amp;/g, '&'), url);
      const mv = await p.$$eval('model-viewer, [src$=".glb"], [data-src*=".glb"]', (els) => els.map((e) => e.getAttribute('src') || e.getAttribute('data-src'))).catch(() => []);
      mv.filter(Boolean).forEach((u) => found.set(new URL(u, url).href, url));
    } catch (e) { entry.error = String(e); }
    pages.push(entry); console.log(entry.url, entry.title, 'AR düğmesi:', entry.arButtons);
    await p.close();
  }
  const index = { pages, models: [], spins: [...spins] };
  for (const [u, from] of found) {
    try {
      const r = await ctx.request.get(u, { timeout: 90000 });
      if (!r.ok()) { index.models.push({ url: u, from, status: r.status() }); continue; }
      const buf = await r.body();
      const f = path.basename(new URL(u).pathname);
      fs.writeFileSync(path.join(OUT, f), buf);
      index.models.push({ url: u, from, file: f, bytes: buf.length });
      console.log('✔ model', f, buf.length);
    } catch (e) { index.models.push({ url: u, from, error: String(e) }); }
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));
  console.log(JSON.stringify(index, null, 1).slice(0, 4000));
  await browser.close();
})();
