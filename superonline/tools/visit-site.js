#!/usr/bin/env node
'use strict';
/**
 * Superonline kampanya sayfasını gerçek Chromium ile ziyaret eder (GitHub Actions'ta çalışır).
 * Çıktı: superonline/research/ → page.txt (görünen metin), page.html, meta.json,
 *        desktop.jpg / mobile.jpg (tam sayfa), logo ve sayfadaki görsellerin listesi.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const URL = process.env.SO_URL || 'https://www.superonline.net/ev-interneti/fiber-internet/onlinea-ozel-fiber-hizlari-kampanyasi/1000-mbps';
const out = path.join(__dirname, '..', 'research');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const meta = { url: URL, visitedAt: new Date().toISOString(), pages: {} };
  for (const [name, opts] of [
    ['desktop', { viewport: { width: 1440, height: 900 }, locale: 'tr-TR' }],
    ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, locale: 'tr-TR',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' }],
  ]) {
    const ctx = await browser.newContext(opts);
    const page = await ctx.newPage();
    const res = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(6000);
    // Çerez bandını kapatmayı dene
    for (const t of ['Kabul Et', 'Tümünü Kabul Et', 'Kabul et', 'Tamam']) {
      const b = page.getByRole('button', { name: t }).first();
      if (await b.isVisible().catch(() => false)) { await b.click().catch(() => {}); break; }
    }
    // Lazy içerik için kaydır
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 250)); }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(2000);
    // Akordeon / "detay" alanlarını aç
    await page.evaluate(() => document.querySelectorAll('details').forEach((d) => d.open = true));
    const info = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content || null,
      ogImage: document.querySelector('meta[property="og:image"]')?.content || null,
      themeColor: document.querySelector('meta[name="theme-color"]')?.content || null,
      text: document.body.innerText,
      headings: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => h.tagName + ': ' + h.innerText.trim()).filter((s) => s.length > 4),
      images: [...document.querySelectorAll('img')].map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })).filter((i) => i.src),
      logo: (() => { const l = document.querySelector('header img, a[href="/"] img, img[alt*="uperonline" i], img[src*="logo" i]'); return l ? (l.currentSrc || l.src) : null; })(),
      colors: (() => { const c = {}; document.querySelectorAll('button, a, h1, h2, [class*="price" i], header, footer').forEach((e) => { const s = getComputedStyle(e); [s.backgroundColor, s.color].forEach((v) => { if (v && v !== 'rgba(0, 0, 0, 0)') c[v] = (c[v] || 0) + 1; }); }); return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 20); })(),
      fonts: [...new Set([...document.querySelectorAll('h1,h2,p,button')].map((e) => getComputedStyle(e).fontFamily))].slice(0, 6),
    }));
    meta.pages[name] = { status: res && res.status(), finalUrl: page.url(), ...info, text: undefined };
    fs.writeFileSync(path.join(out, `${name}.txt`), info.text);
    if (name === 'desktop') fs.writeFileSync(path.join(out, 'page.html'), await page.content());
    await page.screenshot({ path: path.join(out, `${name}.jpg`), fullPage: true, type: 'jpeg', quality: 70 });
    await page.screenshot({ path: path.join(out, `${name}-fold.jpg`), type: 'jpeg', quality: 80 });
    if (name === 'desktop' && info.logo) {
      try {
        const r = await ctx.request.get(info.logo);
        const ext = (info.logo.split('?')[0].match(/\.(svg|png|webp|jpe?g)$/i) || [, 'bin'])[1];
        fs.writeFileSync(path.join(out, `logo.${ext}`), await r.body());
        meta.logoFile = `logo.${ext}`;
      } catch (e) { meta.logoError = String(e); }
    }
    await ctx.close();
  }
  fs.writeFileSync(path.join(out, 'meta.json'), JSON.stringify(meta, null, 2));
  await browser.close();
  console.log(JSON.stringify({ status: meta.pages.desktop.status, title: meta.pages.desktop.title }, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
