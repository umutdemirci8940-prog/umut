#!/usr/bin/env node
'use strict';
/**
 * watsons.com.tr'den 11.11 masthead çalışmaları için görsel arşivi çeker (Playwright + Chromium).
 *   - Ana sayfa ve menüdeki kategori / kampanya sayfaları gerçek tarayıcıda açılır, aşağı kaydırılır
 *   - Sayfadaki tüm <img>/srcset/arka plan görselleri en büyük boyutuyla indirilir → assets/site/
 *   - Ürün kartları (marka, ad, fiyat, görsel, adres) toplanır → assets/products/
 *   - Logo (svg/png), tema renkleri, fontlar ve tam sayfa ekran görüntüleri → assets/brand/, assets/shots/
 * Çıktı: assets/index.json
 *
 * Kullanım: node tools/fetch-site.js [--pages=14]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
}));
const BASE = 'https://www.watsons.com.tr';
const MAX_PAGES = +args.pages || 14;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const root = path.join(__dirname, '..');
const out = path.join(root, 'assets');
for (const d of ['site', 'products', 'brand', 'shots', 'html']) fs.mkdirSync(path.join(out, d), { recursive: true });

const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'x';
const extOf = (url, type) => {
  const m = (type || '').match(/image\/(png|jpe?g|webp|gif|svg|avif)/);
  if (m) return m[1].replace('jpeg', 'jpg').replace('svg', 'svg');
  const e = (new URL(url).pathname.match(/\.(png|jpe?g|webp|gif|svg|avif|mp4|webm)$/i) || [, 'jpg'])[1];
  return e.toLowerCase().replace('jpeg', 'jpg');
};
const index = { fetchedAt: new Date().toISOString(), base: BASE, pages: [], site: [], products: [], logos: [], videos: [], theme: {} };
const seen = new Set();

async function download(ctx, url, file) {
  const r = await ctx.request.get(url, { headers: { referer: BASE + '/' }, timeout: 30000 });
  if (!r.ok()) throw new Error(`${r.status()} ${url}`);
  const buf = await r.body();
  const type = r.headers()['content-type'] || '';
  const f = `${file}.${extOf(url, type)}`;
  fs.writeFileSync(f, buf);
  return { file: path.relative(root, f), bytes: buf.length, type };
}

async function autoscroll(page) {
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0; const t = setInterval(() => {
        window.scrollBy(0, 600); y += 600;
        if (y > document.body.scrollHeight + 1200 || y > 40000) { clearInterval(t); res(); }
      }, 220);
    });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1500);
}

async function collect(page) {
  return page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const best = (img) => {
      let pick = img.currentSrc || img.src || img.getAttribute('data-src') || '';
      let bw = 0;
      const set = img.getAttribute('srcset') || img.getAttribute('data-srcset') || '';
      for (const part of set.split(',')) {
        const [u, w] = part.trim().split(/\s+/);
        const n = parseFloat(w) || 0;
        if (u && n >= bw) { bw = n; pick = u; }
      }
      return abs(pick);
    };
    const imgs = [...document.querySelectorAll('img, source[srcset]')].map((el) => {
      const img = el.tagName === 'IMG' ? el : el;
      const r = (el.tagName === 'IMG' ? el : el.parentElement).getBoundingClientRect();
      return {
        src: el.tagName === 'IMG' ? best(el) : abs((el.getAttribute('srcset') || '').split(',').pop().trim().split(/\s+/)[0]),
        alt: el.getAttribute('alt') || '', w: el.naturalWidth || Math.round(r.width), h: el.naturalHeight || Math.round(r.height),
        boxW: Math.round(r.width), boxH: Math.round(r.height), y: Math.round(r.top + scrollY),
        inLink: (el.closest('a') || {}).href || '', cls: (el.className || '').toString().slice(0, 80),
      };
    }).filter((i) => i.src && !i.src.startsWith('data:'));
    const bgs = [];
    for (const el of document.querySelectorAll('*')) {
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg.includes('url(')) for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        const r = el.getBoundingClientRect();
        if (r.width > 120 && r.height > 60) bgs.push({ src: abs(m[1]), alt: el.getAttribute('aria-label') || '', boxW: Math.round(r.width), boxH: Math.round(r.height), y: Math.round(r.top + scrollY), bg: true });
      }
    }
    const videos = [...document.querySelectorAll('video, video source')].map((v) => abs(v.src || v.getAttribute('src'))).filter(Boolean);
    // Ürün kartları: içinde görsel ve fiyat olan bağlantılar
    const products = [];
    const priceRe = /(\d{1,3}(?:\.\d{3})*,\d{2})\s*(?:TL|₺)|₺\s*(\d{1,3}(?:\.\d{3})*,\d{2})/g;
    for (const a of document.querySelectorAll('a[href*="/p/"]')) {
      let card = a;
      for (let i = 0; i < 5 && card.parentElement; i++) {
        if ((card.innerText || '').match(priceRe) && card.querySelector('img')) break;
        card = card.parentElement;
      }
      const img = card.querySelector('img');
      if (!img) continue;
      const text = (card.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
      const prices = [...(card.innerText || '').matchAll(priceRe)].map((m) => m[1] || m[2]);
      products.push({ url: a.href.split('?')[0], img: best(img), alt: img.alt || '', text: text.slice(0, 10), prices });
    }
    // Logo adayları
    const logos = [...document.querySelectorAll('header img, header svg, a[href="/"] img, a[href="/"] svg, [class*="logo" i] img, [class*="logo" i] svg, img[alt*="watsons" i]')]
      .map((el) => el.tagName.toLowerCase() === 'svg' ? { svg: el.outerHTML.slice(0, 200000) } : { src: abs(el.currentSrc || el.src), alt: el.alt || '' });
    // Tema: sık kullanılan renkler ve fontlar
    const colors = {}; const fonts = {};
    for (const el of [...document.querySelectorAll('body *')].slice(0, 6000)) {
      const cs = getComputedStyle(el);
      for (const c of [cs.color, cs.backgroundColor]) if (c && !/rgba\(0, 0, 0, 0\)/.test(c)) colors[c] = (colors[c] || 0) + 1;
      fonts[cs.fontFamily] = (fonts[cs.fontFamily] || 0) + 1;
    }
    const nav = [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.href.split('#')[0], text: (a.innerText || a.getAttribute('title') || '').trim().slice(0, 60) }))
      .filter((l) => l.href.startsWith(location.origin));
    return { title: document.title, imgs, bgs, videos, products, logos, colors, fonts, nav, text: document.body.innerText.slice(0, 20000) };
  });
}

(async () => {
  const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({ userAgent: UA, locale: 'tr-TR', timezoneId: 'Europe/Istanbul', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
  const page = await ctx.newPage();
  const queue = ['/'];
  const done = new Set();
  const want = /(kampanya|firsat|fırsat|indirim|11-11|1111|kasim|kasım|makyaj|cilt|parfum|parfüm|sac|saç|kisisel|kişisel|erkek|anne|bebek|dermo|kore|marka|yeni|cok-satan|çok satan|outlet|watsons)/i;
  while (queue.length && done.size < MAX_PAGES) {
    const p = queue.shift();
    if (done.has(p)) continue;
    done.add(p);
    const url = p.startsWith('http') ? p : BASE + p;
    console.log(`→ ${url}`);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(4000);
      // Çerez / pop-up kapat
      for (const sel of ['#onetrust-accept-btn-handler', 'button:has-text("Kabul")', 'button:has-text("Tümünü Kabul")', 'button:has-text("Tamam")', '[aria-label="Kapat"]', '[aria-label="close"]']) {
        try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 500 })) await b.click({ timeout: 1500 }); } catch { /* yok */ }
      }
      await autoscroll(page);
    } catch (e) { console.log(`⚠ ${url}: ${e.message}`); continue; }
    const name = slug(new URL(url).pathname) || 'home';
    const data = await collect(page);
    fs.writeFileSync(path.join(out, 'html', `${name}.html`), await page.content());
    fs.writeFileSync(path.join(out, 'html', `${name}.txt`), data.text);
    try { await page.screenshot({ path: path.join(out, 'shots', `${name}.jpg`), fullPage: true, type: 'jpeg', quality: 70 }); } catch { /* geç */ }
    try { await page.screenshot({ path: path.join(out, 'shots', `${name}-top.jpg`), type: 'jpeg', quality: 80 }); } catch { /* geç */ }
    index.pages.push({ path: p, url, title: data.title, imgs: data.imgs.length, products: data.products.length });
    if (done.size === 1) {
      index.theme = {
        colors: Object.entries(data.colors).sort((a, b) => b[1] - a[1]).slice(0, 30),
        fonts: Object.entries(data.fonts).sort((a, b) => b[1] - a[1]).slice(0, 8),
      };
      index.nav = data.nav.filter((l) => l.text).slice(0, 400);
      for (const [i, l] of data.logos.entries()) {
        if (l.svg) { const f = path.join(out, 'brand', `logo-${i}.svg`); fs.writeFileSync(f, l.svg); index.logos.push({ file: path.relative(root, f) }); }
        else if (l.src && !seen.has(l.src)) {
          seen.add(l.src);
          try { index.logos.push(Object.assign({ src: l.src, alt: l.alt }, await download(ctx, l.src, path.join(out, 'brand', `logo-${i}`)))); } catch (e) { console.log(`⚠ logo ${e.message}`); }
        }
      }
    }
    // Sayfa görselleri (küçük ikonlar hariç)
    let n = 0;
    for (const im of [...data.imgs, ...data.bgs]) {
      if (seen.has(im.src)) continue;
      if (/\.svg(\?|$)/i.test(im.src) && !/logo/i.test(im.src)) continue;
      if ((im.boxW || 0) < 90 && (im.w || 0) < 160) continue;
      seen.add(im.src);
      try {
        const d = await download(ctx, im.src, path.join(out, 'site', `${name}-${String(++n).padStart(3, '0')}`));
        index.site.push(Object.assign({ page: p }, im, d));
      } catch (e) { console.log(`⚠ ${e.message}`); }
    }
    // Ürün kartları
    for (const pr of data.products) {
      if (!pr.img || index.products.some((x) => x.url === pr.url)) continue;
      try {
        const d = await download(ctx, pr.img, path.join(out, 'products', slug(pr.url.split('/').slice(-3).join('-'))));
        index.products.push(Object.assign({ page: p }, pr, d));
      } catch (e) { console.log(`⚠ ürün ${e.message}`); }
    }
    for (const v of data.videos) if (!index.videos.includes(v)) index.videos.push(v);
    console.log(`  ${data.title} — ${n} görsel, ${data.products.length} ürün kartı`);
    // Sıradaki sayfalar: menüdeki kampanya / kategori bağlantıları
    if (done.size === 1) {
      const links = data.nav.filter((l) => want.test(l.href + ' ' + l.text) && !/\/p\/|login|giris|sepet|cart|hesap|account|magaza/i.test(l.href));
      const uniq = [...new Map(links.map((l) => [l.href, l])).values()];
      uniq.sort((a, b) => (/(kampanya|indirim|11|kasim|firsat)/i.test(b.href + b.text) ? 1 : 0) - (/(kampanya|indirim|11|kasim|firsat)/i.test(a.href + a.text) ? 1 : 0));
      for (const l of uniq.slice(0, 40)) queue.push(l.href);
    }
  }
  // Mobil ana sayfa görünümü (mobil uyarlamalar için)
  try {
    const m = await browser.newContext({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1', viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'tr-TR', isMobile: true, hasTouch: true });
    const mp = await m.newPage();
    await mp.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    await mp.waitForTimeout(4000);
    await autoscroll(mp);
    await mp.screenshot({ path: path.join(out, 'shots', 'mobile-home.jpg'), fullPage: true, type: 'jpeg', quality: 60 });
    const md = await collect(mp);
    let n = 0;
    for (const im of [...md.imgs, ...md.bgs]) {
      if (seen.has(im.src) || ((im.boxW || 0) < 90 && (im.w || 0) < 160)) continue;
      seen.add(im.src);
      try { index.site.push(Object.assign({ page: 'mobile:/' }, im, await download(m, im.src, path.join(out, 'site', `mobile-${String(++n).padStart(3, '0')}`)))); } catch { /* geç */ }
    }
    await m.close();
  } catch (e) { console.log(`⚠ mobil: ${e.message}`); }

  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
  console.log(`✔ ${index.pages.length} sayfa, ${index.site.length} site görseli, ${index.products.length} ürün, ${index.logos.length} logo`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
