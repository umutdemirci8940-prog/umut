#!/usr/bin/env node
'use strict';
/**
 * altinyildizclassics.com'dan banner için gerçek görselleri toplar (Playwright ile, JS ile yüklenen görseller dahil).
 *  - Ana sayfa + menüdeki kategori sayfaları gezilir, sayfa aşağı kaydırılarak lazy-load görseller tetiklenir.
 *  - Görsel adresleri (img currentSrc / srcset / data-src / CSS background / og:image) toplanır, en büyük sürüm indirilir.
 *  - Logo: header içindeki logo öğesi PNG olarak (2x) ekran görüntüsüyle alınır (SVG ise de raster olur).
 *  - Ekran görüntüleri: sayfa görünümü (marka kimliği incelemesi için).
 * Çıktı: altinyildiz-classics/assets/raw/  (index.json + görseller)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SITE = 'https://www.altinyildizclassics.com';
// İsteğe bağlı ayar: src/fetch-config.json → { out, keywords, maxPages, maxPerPage, maxImages, urls }
const cfgFile = path.join(__dirname, '..', 'src', 'fetch-config.json');
const CFG = fs.existsSync(cfgFile) ? JSON.parse(fs.readFileSync(cfgFile, 'utf8')) : {};
const out = path.join(__dirname, '..', 'assets', CFG.out || 'raw');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'img'), { recursive: true });
fs.mkdirSync(path.join(out, 'screens'), { recursive: true });
const KEYWORDS = CFG.keywords || ['takim', 'ceket', 'gomlek', 'pantolon', 'triko', 'kazak', 'mont', 'kaban', 'blazer', 'polo', 'yeni', 'koleksiyon', 'smokin', 'yelek'];
const MAX_PAGES = CFG.maxPages || 9, MAX_PER_PAGE = CFG.maxPerPage || 40, MAX_IMAGES = CFG.maxImages || 160;

const slug = (s) => s.replace(/^https?:\/\//, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 60);

async function collect(page) {
  return page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const best = (srcset) => {
      if (!srcset) return null;
      const c = srcset.split(',').map((s) => s.trim().split(/\s+/)).filter((p) => p[0]);
      c.sort((a, b) => (parseFloat(b[1]) || 0) - (parseFloat(a[1]) || 0));
      return c[0] && c[0][0];
    };
    const items = [];
    for (const img of document.querySelectorAll('img, source')) {
      const r = img.getBoundingClientRect ? img.getBoundingClientRect() : { width: 0, height: 0 };
      const u = best(img.getAttribute('srcset') || img.getAttribute('data-srcset')) || img.currentSrc || img.getAttribute('data-src') || img.getAttribute('data-original') || img.getAttribute('src');
      const card = img.closest('a');
      let box = img, priceText = '';
      for (let k = 0; k < 7 && box && !priceText; k++) { box = box.parentElement; if (box && /\d[\d.]*,\d{2}\s*TL/.test(box.innerText || '')) priceText = box.innerText.replace(/\s+/g, ' ').trim().slice(0, 240); }
      items.push({ url: abs(u), alt: img.getAttribute('alt') || '', w: Math.round(r.width), h: Math.round(r.height),
        nw: img.naturalWidth || 0, nh: img.naturalHeight || 0, href: card ? abs(card.getAttribute('href')) : null,
        text: card ? card.innerText.replace(/\s+/g, ' ').trim().slice(0, 160) : '', priceText });
    }
    for (const el of document.querySelectorAll('[style*="background"]')) {
      const m = (el.getAttribute('style') || '').match(/url\(["']?([^"')]+)/);
      if (m) items.push({ url: abs(m[1]), alt: 'bg', w: el.offsetWidth, h: el.offsetHeight });
    }
    const og = document.querySelector('meta[property="og:image"]');
    if (og) items.push({ url: abs(og.content), alt: 'og:image' });
    const links = [...document.querySelectorAll('a[href]')].map((a) => ({ href: abs(a.getAttribute('href')), text: a.innerText.replace(/\s+/g, ' ').trim() })).filter((l) => l.href && l.href.startsWith(location.origin));
    const css = getComputedStyle(document.body);
    const fonts = [...new Set([...document.querySelectorAll('h1,h2,h3,a,button,p,span')].slice(0, 400).map((e) => getComputedStyle(e).fontFamily))].slice(0, 12);
    const colors = {};
    for (const e of [...document.querySelectorAll('header *, button, a, footer *')].slice(0, 1500)) {
      const s = getComputedStyle(e);
      for (const c of [s.color, s.backgroundColor]) if (c && c !== 'rgba(0, 0, 0, 0)') colors[c] = (colors[c] || 0) + 1;
    }
    return { items: items.filter((i) => i.url && /^https?:/.test(i.url)), links, title: document.title, bodyFont: css.fontFamily, fonts, colors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 25) };
  });
}

async function scroll(page) {
  for (let y = 0; y < 14; y++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(350); }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, locale: 'tr-TR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36' });
  const page = await ctx.newPage();
  const index = { site: SITE, fetchedAt: new Date().toISOString(), pages: [], images: [], logo: null };
  const seen = new Map();

  const visit = async (url, i) => {
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(3500);
      // Çerez / pop-up kapat
      for (const t of ['Kabul', 'Tümünü Kabul', 'Kabul Et', 'Tamam', 'Anladım']) {
        const b = page.getByRole('button', { name: new RegExp(t, 'i') }).first();
        if (await b.isVisible().catch(() => false)) await b.click().catch(() => {});
      }
      await page.keyboard.press('Escape').catch(() => {});
      await scroll(page);
      await page.screenshot({ path: path.join(out, 'screens', `${String(i).padStart(2, '0')}-${slug(new URL(url).pathname || 'home') || 'home'}.jpg`), type: 'jpeg', quality: 70 });
      if (i === 0) await page.screenshot({ path: path.join(out, 'screens', '00-home-full.jpg'), type: 'jpeg', quality: 55, fullPage: true }).catch(() => {});
      const data = await collect(page);
      index.pages.push({ url, title: data.title, bodyFont: data.bodyFont, fonts: data.fonts, colors: data.colors, count: data.items.length });
      let n = 0;
      for (const it of data.items) {
        if (seen.has(it.url) || n >= MAX_PER_PAGE) continue;
        if (/\.(svg|gif)(\?|$)/i.test(it.url) || /icon|sprite|payment|flag|loading/i.test(it.url)) continue;
        seen.set(it.url, Object.assign(it, { page: url })); n++;
      }
      return data;
    } catch (e) { console.log('✖', url, e.message); index.pages.push({ url, error: e.message }); return null; }
  };

  const home = await visit(SITE + '/', 0);
  // Logo (raster, 3x)
  try {
    const cand = page.locator('header a[href="/"] img, header a[href="/"] svg, header [class*="logo"] img, header [class*="logo"] svg, [class*="logo"] img, [class*="logo"] svg, a[href="/"] img, a[href="/"] svg').first();
    await cand.waitFor({ timeout: 8000 });
    const p2 = await ctx.newPage(); await p2.setViewportSize({ width: 1440, height: 900 });
    const big = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 4 });
    const bp = await big.newPage(); await bp.goto(SITE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 }); await bp.waitForTimeout(3000);
    const bl = bp.locator('header a[href="/"] img, header a[href="/"] svg, header [class*="logo"] img, header [class*="logo"] svg, [class*="logo"] img, [class*="logo"] svg, a[href="/"] img, a[href="/"] svg').first();
    await bl.screenshot({ path: path.join(out, 'logo-shot.png'), omitBackground: true });
    const info = await bl.evaluate((e) => ({ tag: e.tagName, src: e.currentSrc || e.getAttribute('src') || null, html: e.tagName.toLowerCase() === 'svg' ? e.outerHTML : null, color: getComputedStyle(e).color, fill: getComputedStyle(e).fill }));
    index.logo = Object.assign(info, { shot: 'logo-shot.png' });
    if (info.html) fs.writeFileSync(path.join(out, 'logo-source.svg.txt'), info.html); // yalnızca referans, bannerda kullanılmaz
    if (info.src) {
      const r = await ctx.request.get(new URL(info.src, SITE).href);
      if (r.ok()) { const ext = (info.src.match(/\.(png|jpe?g|webp|svg)/i) || [, 'bin'])[1]; fs.writeFileSync(path.join(out, 'logo-original.' + ext), await r.body()); index.logo.original = 'logo-original.' + ext; }
    }
    await big.close(); await p2.close();
  } catch (e) { console.log('logo alınamadı:', e.message); }

  if (home) {
    const cats = [];
    for (const l of home.links) {
      const p = new URL(l.href).pathname.toLowerCase();
      if (p.length < 3 || cats.find((c) => c.href === l.href)) continue;
      if (KEYWORDS.some((k) => p.includes(k))) cats.push(l);
    }
    index.categoryLinks = cats.slice(0, 40);
    for (const u of CFG.urls || []) if (!cats.find((c) => c.href === SITE + u)) cats.unshift({ href: SITE + u, text: u });
    index.categoryLinks = cats.slice(0, 60);
    let i = 1;
    for (const c of cats.slice(0, MAX_PAGES)) await visit(c.href, i++);
  }

  // İndir
  let k = 0;
  for (const it of seen.values()) {
    try {
      const r = await ctx.request.get(it.url, { timeout: 30000 });
      if (!r.ok()) continue;
      const buf = await r.body();
      if (buf.length < 12000) continue; // küçük ikon/küçük resimleri atla
      const ct = r.headers()['content-type'] || '';
      const ext = ct.includes('webp') ? 'webp' : ct.includes('png') ? 'png' : ct.includes('avif') ? 'avif' : 'jpg';
      const file = `img/${String(k++).padStart(3, '0')}-${slug(path.basename(new URL(it.url).pathname).replace(/\.\w+$/, ''))}.${ext}`;
      fs.writeFileSync(path.join(out, file), buf);
      index.images.push(Object.assign(it, { file, bytes: buf.length }));
      if (k >= MAX_IMAGES) break;
    } catch { /* geç */ }
  }
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
  console.log(`✔ ${index.pages.length} sayfa, ${index.images.length} görsel, logo: ${index.logo ? 'var' : 'yok'}`);
  await browser.close();
})();
