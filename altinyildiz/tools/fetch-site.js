#!/usr/bin/env node
'use strict';
/**
 * altinyildizclassics.com'dan orijinal ürün görsellerini, logoyu, ürün adlarını ve fiyatları çeker.
 * GitHub Actions'ta çalışır (bulut oturumunun ağ politikası siteye izin vermiyor).
 *
 * Çıktı: altinyildiz/assets/site/
 *   manifest.json        – kategori → ürünler (ad, fiyat, url, görsel dosyaları)
 *   pages/*.html|png     – incelenen sayfaların HTML'i ve ekran görüntüsü (teşhis için)
 *   products/*.jpg|webp  – ürün görselleri
 *   logo.*               – logo
 *
 * Kullanım: node altinyildiz/tools/fetch-site.js [--per=6]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const BASE = 'https://www.altinyildizclassics.com';
const OUT = path.join(__dirname, '..', 'assets', 'site');
const PER = +(process.argv.find((a) => a.startsWith('--per=')) || '--per=6').split('=')[1];
// Banner kategorileri ve sitede eşleşecek anahtar kelimeler (menü bağlantılarında aranır)
const CATS = [
  { key: 'mont', words: ['mont'], not: ['kadin'] },
  { key: 'kaban', words: ['kaban', 'palto'], not: ['kadin'] },
  { key: 'triko', words: ['triko', 'kazak'], not: ['kadin'] },
  { key: 'gomlek', words: ['gomlek'], not: ['kadin'] },
  { key: 'takim', words: ['takim-elbise', 'takim elbise'], not: ['kadin'] },
  { key: 'ceket', words: ['ceket', 'blazer'], not: ['kadin', 'deri'] },
];

fs.mkdirSync(path.join(OUT, 'pages'), { recursive: true });
fs.mkdirSync(path.join(OUT, 'products'), { recursive: true });
const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ı/g, 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const log = (...a) => console.log(...a);

async function save(page, name) {
  try {
    fs.writeFileSync(path.join(OUT, 'pages', name + '.html'), await page.content());
    await page.screenshot({ path: path.join(OUT, 'pages', name + '.png'), fullPage: false });
  } catch (e) { log('save fail', name, e.message); }
}

async function settle(page) {
  // çerez / bülten pencerelerini kapat, tembel yüklenen görselleri tetikle
  for (const sel of ['#onetrust-accept-btn-handler', 'button:has-text("Kabul")', 'button:has-text("Tümünü Kabul")', 'button:has-text("Accept")', '[aria-label="Kapat"]', '.close', '.modal-close']) {
    try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 500 })) await b.click({ timeout: 1000 }); } catch {}
  }
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 1400); await page.waitForTimeout(500); }
  await page.waitForTimeout(800);
}

/** Sayfadaki ürün kartlarını sezgisel olarak toplar. */
async function scrapeList(page) {
  return page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const best = (img) => {
      const cands = [];
      const ss = img.getAttribute('srcset') || img.getAttribute('data-srcset') || '';
      ss.split(',').forEach((p) => { const [u, w] = p.trim().split(/\s+/); if (u) cands.push({ u, w: parseInt(w) || 0 }); });
      ['data-src', 'data-original', 'data-lazy', 'data-zoom', 'src'].forEach((a) => { const v = img.getAttribute(a); if (v && !v.startsWith('data:')) cands.push({ u: v, w: 1 }); });
      cands.sort((a, b) => b.w - a.w);
      return cands.length ? abs(cands[0].u) : null;
    };
    const priceRe = /(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\s*(?:TL|₺)/;
    const out = []; const seen = new Set();
    document.querySelectorAll('a[href]').forEach((a) => {
      const imgs = a.querySelectorAll('img'); if (!imgs.length) return;
      const href = abs(a.getAttribute('href')); if (!href || seen.has(href)) return;
      let card = a; for (let i = 0; i < 5 && card.parentElement; i++) { if (priceRe.test(card.innerText || '')) break; card = card.parentElement; }
      const txt = (card.innerText || '').replace(/\s+/g, ' ').trim();
      const m = txt.match(priceRe); if (!m) return;
      const prices = (txt.match(new RegExp(priceRe.source, 'g')) || []).map((s) => s.replace(/\s*(TL|₺)/, ''));
      const name = (a.getAttribute('title') || imgs[0].getAttribute('alt') || txt.split(/\d/)[0] || '').trim();
      seen.add(href);
      out.push({ url: href, name, prices, images: Array.from(imgs).map(best).filter(Boolean).slice(0, 3), text: txt.slice(0, 200) });
    });
    return out;
  });
}

/** Ürün sayfasından JSON-LD + og:image ile ayrıntı. */
async function scrapeProduct(page) {
  return page.evaluate(() => {
    const r = { ld: null, og: null, images: [], title: document.title };
    document.querySelectorAll('script[type="application/ld+json"]').forEach((s) => {
      try { const j = JSON.parse(s.textContent); const arr = Array.isArray(j) ? j : (j['@graph'] || [j]); arr.forEach((x) => { if (x && /Product/i.test(x['@type'])) r.ld = x; }); } catch {}
    });
    const og = document.querySelector('meta[property="og:image"]'); if (og) r.og = og.content;
    document.querySelectorAll('img').forEach((i) => { const u = i.currentSrc || i.src; if (u && !u.startsWith('data:') && i.naturalWidth >= 400) r.images.push({ u, w: i.naturalWidth, h: i.naturalHeight }); });
    return r;
  });
}

async function download(ctx, url, file) {
  try {
    const res = await ctx.request.get(url, { timeout: 30000 });
    if (!res.ok()) return null;
    const ct = res.headers()['content-type'] || '';
    const ext = ct.includes('webp') ? 'webp' : ct.includes('png') ? 'png' : ct.includes('svg') ? 'svg' : ct.includes('avif') ? 'avif' : 'jpg';
    const f = file + '.' + ext;
    fs.writeFileSync(path.join(OUT, f), await res.body());
    return f;
  } catch (e) { log('dl fail', url, e.message); return null; }
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 }, locale: 'tr-TR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  const manifest = { fetchedAt: new Date().toISOString(), base: BASE, home: {}, logo: null, nav: [], categories: {} };

  log('→ ana sayfa');
  await page.goto(BASE + '/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  await settle(page);
  await save(page, 'home');

  const home = await page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const links = Array.from(document.querySelectorAll('a[href]')).map((a) => ({ href: abs(a.getAttribute('href')), text: (a.innerText || a.getAttribute('title') || '').replace(/\s+/g, ' ').trim() })).filter((l) => l.href && l.href.startsWith(location.origin));
    const logoEl = document.querySelector('header img[alt*="ltın" i], header img[alt*="ltin" i], a[class*="logo" i] img, [class*="logo" i] img, header svg, [class*="logo" i] svg');
    let logo = null;
    if (logoEl) logo = logoEl.tagName.toLowerCase() === 'svg' ? { svg: logoEl.outerHTML } : { src: abs(logoEl.currentSrc || logoEl.src) };
    const css = getComputedStyle(document.body);
    const colors = {};
    document.querySelectorAll('header *, button, a, footer *').forEach((el) => { const s = getComputedStyle(el); [s.color, s.backgroundColor].forEach((c) => { if (c && c !== 'rgba(0, 0, 0, 0)') colors[c] = (colors[c] || 0) + 1; }); });
    const fonts = {}; document.querySelectorAll('h1,h2,h3,a,button,p,span').forEach((el) => { const f = getComputedStyle(el).fontFamily; fonts[f] = (fonts[f] || 0) + 1; });
    const banners = Array.from(document.querySelectorAll('img')).filter((i) => i.naturalWidth >= 900).map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight })).slice(0, 12);
    return { title: document.title, links, logo, bodyFont: css.fontFamily, colors: Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 20), fonts: Object.entries(fonts).sort((a, b) => b[1] - a[1]).slice(0, 8), banners, text: document.body.innerText.slice(0, 3000) };
  });
  manifest.home = { title: home.title, bodyFont: home.bodyFont, colors: home.colors, fonts: home.fonts, banners: home.banners, text: home.text };
  const uniq = new Map(); home.links.forEach((l) => { if (!uniq.has(l.href)) uniq.set(l.href, l); });
  manifest.nav = Array.from(uniq.values()).slice(0, 400);
  log('  bağlantı:', manifest.nav.length);

  if (home.logo) {
    if (home.logo.svg) { fs.writeFileSync(path.join(OUT, 'logo.svg'), home.logo.svg); manifest.logo = 'logo.svg'; }
    else if (home.logo.src) manifest.logo = await download(ctx, home.logo.src, 'logo');
  }
  // ana sayfa kampanya görselleri
  for (let i = 0; i < Math.min(6, home.banners.length); i++) { home.banners[i].file = await download(ctx, home.banners[i].src, 'pages/hero-' + i); }

  for (const cat of CATS) {
    const norm = (s) => slug(s || '');
    const cand = manifest.nav.filter((l) => {
      const h = norm(l.href), t = norm(l.text);
      return cat.words.some((w) => h.includes(slug(w)) || t.includes(slug(w))) && !cat.not.some((w) => h.includes(w));
    }).sort((a, b) => a.href.length - b.href.length);
    let url = cand[0] && cand[0].href;
    if (!url) url = BASE + '/arama?q=' + encodeURIComponent(cat.words[0]);
    log('→', cat.key, url, '(aday:', cand.length + ')');
    const entry = { url, candidates: cand.slice(0, 8).map((c) => c.href), products: [] };
    manifest.categories[cat.key] = entry;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(2500); await settle(page); await save(page, 'cat-' + cat.key);
      const list = (await scrapeList(page)).filter((p) => !/kadin/i.test(p.url));
      log('  kart:', list.length);
      for (const p of list.slice(0, PER)) {
        const item = { name: p.name, prices: p.prices, url: p.url, listImages: p.images, files: [] };
        try {
          await page.goto(p.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await page.waitForTimeout(2000);
          const d = await scrapeProduct(page);
          if (d.ld) {
            item.name = d.ld.name || item.name;
            const off = Array.isArray(d.ld.offers) ? d.ld.offers[0] : d.ld.offers;
            if (off) item.ldPrice = off.price || off.lowPrice;
            item.ldImages = [].concat(d.ld.image || []).map((x) => (typeof x === 'string' ? x : x.url)).slice(0, 6);
          }
          item.og = d.og;
          item.pageImages = d.images.slice(0, 8);
        } catch (e) { log('  ürün sayfası açılamadı', p.url, e.message); }
        const imgs = [].concat(item.ldImages || [], item.og ? [item.og] : [], (item.pageImages || []).map((x) => x.u), p.images);
        const seen = new Set(); let n = 0;
        for (const u of imgs) {
          if (!u || seen.has(u) || n >= 4) continue; seen.add(u);
          const f = await download(ctx, u, 'products/' + cat.key + '-' + slug(item.name || 'urun') + '-' + n);
          if (f) { item.files.push(f); n++; }
        }
        entry.products.push(item);
        log('   •', item.name, item.ldPrice || item.prices.join(' / '), item.files.length + ' görsel');
      }
    } catch (e) { log('  kategori açılamadı', e.message); entry.error = e.message; }
  }

  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 1));
  await browser.close();
  log('✔ bitti →', path.relative(process.cwd(), OUT));
})().catch((e) => { console.error(e); fs.writeFileSync(path.join(OUT, 'error.txt'), String(e && e.stack || e)); process.exit(0); });
