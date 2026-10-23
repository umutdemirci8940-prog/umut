#!/usr/bin/env node
'use strict';
/**
 * watsons.com.tr veri merkezi IP'lerine "Access Denied" (Akamai) döndüğü için sitenin
 * Internet Archive (Wayback Machine) kopyasından görsel arşivi çeker. Görseller sitenin kendi
 * dosyalarıdır; yalnızca arşiv sunucusu üzerinden indirilir.
 *   1. Ana sayfa ve kategori sayfalarının en yeni arşiv kopyası gerçek tarayıcıda açılır, kaydırılır,
 *      görünen tüm görseller (kampanya bannerları, ürün kartları, logo) indirilir  → assets/site/, assets/products/
 *   2. CDX dizininden watsons.com.tr alan adındaki arşivlenmiş görsellerin listesi alınır, en büyükleri indirilir → assets/cdx/
 * Çıktı: assets/index.json (sayfa, alt metin, kutu boyutu, ürün metni/fiyatı)
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const out = path.join(root, 'assets');
for (const d of ['site', 'products', 'brand', 'shots', 'html', 'cdx']) fs.mkdirSync(path.join(out, d), { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';
const WB = 'https://web.archive.org/web';
const PAGES = [
  '/', '/kampanyalar', '/makyaj/c/100', '/cilt-bakimi/c/200', '/sac-bakimi/c/300', '/parfum-deodorant/c/400',
  '/kisisel-bakim/c/500', '/erkek-bakim/c/600', '/anne-bebek/c/700', '/saglik/c/800',
];
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'home';
const extOf = (url, type) => {
  const m = (type || '').match(/image\/(png|jpe?g|webp|gif|svg|avif)/);
  if (m) return m[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
  return ((new URL(url).pathname.match(/\.(png|jpe?g|webp|gif|svg|avif)$/i) || [, 'jpg'])[1]).toLowerCase().replace('jpeg', 'jpg');
};
// Arşiv adresini ham dosya adresine çevirir (…/web/<ts>im_/https://…  → …/web/<ts>id_/https://…)
const raw = (u) => u.replace(/\/web\/(\d+)[a-z_]*\//, '/web/$1id_/');
const original = (u) => { const m = u.match(/\/web\/\d+[a-z_]*\/(.+)$/); return m ? m[1] : u; };
const index = { fetchedAt: new Date().toISOString(), via: 'web.archive.org', pages: [], site: [], products: [], logos: [], cdx: [], theme: {}, nav: [] };
const seen = new Set();

async function get(ctx, url) {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await ctx.request.get(url, { timeout: 45000 });
      if (r.ok()) return r;
      if (r.status() === 404) throw new Error('404');
    } catch (e) { if (String(e.message).includes('404')) throw e; }
    await new Promise((res) => setTimeout(res, 2500 * (i + 1)));
  }
  throw new Error(`indirilemedi ${url}`);
}
async function download(ctx, url, file) {
  const r = await get(ctx, raw(url));
  const buf = await r.body();
  const type = r.headers()['content-type'] || '';
  if (/text\/html/.test(type) || buf.length < 600) throw new Error(`görsel değil (${type}, ${buf.length} B)`);
  const f = `${file}.${extOf(original(url), type)}`;
  fs.writeFileSync(f, buf);
  return { file: path.relative(root, f), bytes: buf.length, type, original: original(url) };
}

async function autoscroll(page) {
  await page.evaluate(async () => {
    await new Promise((res) => {
      let y = 0; const t = setInterval(() => {
        window.scrollBy(0, 500); y += 500;
        if (y > document.body.scrollHeight + 1000 || y > 30000) { clearInterval(t); res(); }
      }, 250);
    });
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(2500);
}

async function collect(page) {
  return page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const best = (img) => {
      let pick = img.currentSrc || img.src || img.getAttribute('data-src') || img.getAttribute('data-original') || '';
      let bw = 0;
      const set = img.getAttribute('srcset') || img.getAttribute('data-srcset') || '';
      for (const part of set.split(',')) { const [u, w] = part.trim().split(/\s+/); const n = parseFloat(w) || 0; if (u && n >= bw) { bw = n; pick = u; } }
      return abs(pick);
    };
    const wb = document.getElementById('wm-ipp-base') || document.getElementById('wm-ipp');
    const inWb = (el) => wb && wb.contains(el);
    const imgs = [...document.querySelectorAll('img')].filter((el) => !inWb(el)).map((el) => {
      const r = el.getBoundingClientRect();
      return { src: best(el), alt: el.getAttribute('alt') || '', w: el.naturalWidth, h: el.naturalHeight, boxW: Math.round(r.width), boxH: Math.round(r.height), y: Math.round(r.top + scrollY), link: (el.closest('a') || {}).href || '' };
    }).filter((i) => i.src && !i.src.startsWith('data:'));
    const bgs = [];
    for (const el of document.querySelectorAll('body *')) {
      if (inWb(el)) continue;
      const bg = getComputedStyle(el).backgroundImage;
      if (bg && bg.includes('url(')) for (const m of bg.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
        const r = el.getBoundingClientRect();
        if (r.width > 120 && r.height > 60) bgs.push({ src: abs(m[1]), alt: el.getAttribute('aria-label') || '', boxW: Math.round(r.width), boxH: Math.round(r.height), y: Math.round(r.top + scrollY), bg: true });
      }
    }
    const priceRe = /(\d{1,3}(?:\.\d{3})*,\d{2})\s*(?:TL|₺)|₺\s*(\d{1,3}(?:\.\d{3})*,\d{2})/g;
    const products = [];
    for (const a of document.querySelectorAll('a[href*="/p/"]')) {
      let card = a;
      for (let i = 0; i < 6 && card.parentElement; i++) {
        if ((card.innerText || '').match(priceRe) && card.querySelector('img')) break;
        card = card.parentElement;
      }
      const img = card.querySelector('img');
      if (!img) continue;
      const text = (card.innerText || '').split('\n').map((s) => s.trim()).filter(Boolean);
      products.push({ url: a.href.split('?')[0], img: best(img), alt: img.alt || '', text: text.slice(0, 12), prices: [...(card.innerText || '').matchAll(priceRe)].map((m) => m[1] || m[2]) });
    }
    const logos = [...document.querySelectorAll('header img, [class*="logo" i] img, img[alt*="watsons" i], img[src*="logo" i]')].filter((el) => !inWb(el)).map((el) => ({ src: abs(el.currentSrc || el.src), alt: el.alt || '' }));
    const svgs = [...document.querySelectorAll('header svg, [class*="logo" i] svg')].filter((el) => !inWb(el)).map((el) => el.outerHTML).filter((s) => s.length > 300).slice(0, 6);
    const colors = {}; const fonts = {};
    for (const el of [...document.querySelectorAll('body *')].slice(0, 6000)) {
      if (inWb(el)) continue;
      const cs = getComputedStyle(el);
      for (const c of [cs.color, cs.backgroundColor, cs.borderTopColor]) if (c && !/rgba\(0, 0, 0, 0\)/.test(c)) colors[c] = (colors[c] || 0) + 1;
      fonts[cs.fontFamily] = (fonts[cs.fontFamily] || 0) + 1;
    }
    const nav = [...document.querySelectorAll('a[href]')].filter((a) => !inWb(a)).map((a) => ({ href: a.href, text: (a.innerText || a.title || '').trim().replace(/\s+/g, ' ').slice(0, 60) })).filter((l) => l.text);
    const ffaces = [...document.styleSheets].flatMap((s) => { try { return [...s.cssRules].filter((r) => r.type === 5).map((r) => r.cssText.slice(0, 400)); } catch { return []; } });
    return { title: document.title, imgs, bgs, products, logos, svgs, colors, fonts, nav, ffaces, text: document.body.innerText.slice(0, 30000) };
  });
}

async function cdx(ctx) {
  // Arşivdeki watsons.com.tr görselleri (2025 sonrası), adres başına tek kayıt
  const q = `https://web.archive.org/cdx/search/cdx?url=watsons.com.tr&matchType=domain&from=2025&filter=mimetype:image/.*&filter=statuscode:200&collapse=urlkey&output=json&limit=20000`;
  let rows = [];
  try { rows = JSON.parse(await (await get(ctx, q)).text()); } catch (e) { console.log(`⚠ cdx: ${e.message}`); return; }
  const head = rows.shift() || [];
  const I = Object.fromEntries(head.map((h, i) => [h, i]));
  const list = rows.map((r) => ({ ts: r[I.timestamp], url: r[I.original], mime: r[I.mimetype], len: +r[I.length] || 0 }))
    .filter((r) => !/\.svg|icon|favicon|sprite|pixel|1x1/i.test(r.url));
  fs.writeFileSync(path.join(out, 'cdx', 'list.json'), JSON.stringify(list, null, 0));
  console.log(`✔ CDX: ${list.length} görsel kaydı`);
  // En büyük 260 dosya (banner ve büyük ürün görselleri)
  list.sort((a, b) => b.len - a.len);
  let n = 0;
  for (const r of list.slice(0, 260)) {
    const u = `${WB}/${r.ts}id_/${r.url}`;
    if (seen.has(r.url)) continue;
    seen.add(r.url);
    try { index.cdx.push(Object.assign({ ts: r.ts }, await download(ctx, u, path.join(out, 'cdx', String(++n).padStart(3, '0'))))); } catch (e) { console.log(`⚠ ${e.message}`); }
  }
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, locale: 'tr-TR', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  const queue = [...PAGES];
  const done = new Set();
  while (queue.length && done.size < 16) {
    const p = queue.shift();
    if (done.has(p)) continue;
    done.add(p);
    const target = `${WB}/2026/https://www.watsons.com.tr${p}`;
    console.log(`→ ${target}`);
    try {
      const resp = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 120000 });
      if (!resp || resp.status() >= 400) { console.log(`  arşivde yok (${resp && resp.status()})`); continue; }
      await page.waitForTimeout(6000);
      await autoscroll(page);
    } catch (e) { console.log(`⚠ ${e.message}`); continue; }
    const name = slug(p);
    const data = await collect(page);
    fs.writeFileSync(path.join(out, 'html', `${name}.txt`), `${page.url()}\n${data.title}\n\n${data.text}`);
    try { await page.screenshot({ path: path.join(out, 'shots', `${name}.jpg`), fullPage: true, type: 'jpeg', quality: 60 }); } catch { /* geç */ }
    index.pages.push({ path: p, url: page.url(), title: data.title, imgs: data.imgs.length, products: data.products.length });
    if (p === '/') {
      index.theme = { colors: Object.entries(data.colors).sort((a, b) => b[1] - a[1]).slice(0, 40), fonts: Object.entries(data.fonts).sort((a, b) => b[1] - a[1]).slice(0, 10), fontFaces: data.ffaces.slice(0, 30) };
      index.nav = data.nav.slice(0, 500);
      data.svgs.forEach((s, i) => { const f = path.join(out, 'brand', `logo-${i}.svg`); fs.writeFileSync(f, s); index.logos.push({ file: path.relative(root, f) }); });
      for (const [i, l] of data.logos.entries()) {
        if (!l.src || seen.has(l.src)) continue;
        seen.add(l.src);
        try { index.logos.push(Object.assign({ alt: l.alt }, await download(ctx, l.src, path.join(out, 'brand', `logo-img-${i}`)))); } catch (e) { console.log(`⚠ logo ${e.message}`); }
      }
      // Menüden kategori adresleri (sabit listede olmayanlar)
      for (const l of data.nav) {
        const o = original(l.href).replace(/^https?:\/\/www\.watsons\.com\.tr/, '');
        if (/^\/[^?#]*\/c\/[\w-]+$/.test(o) && !queue.includes(o) && !done.has(o) && queue.length < 14) queue.push(o);
      }
    }
    let n = 0;
    for (const im of [...data.imgs, ...data.bgs]) {
      const o = original(im.src);
      if (seen.has(o) || /\.svg(\?|$)/i.test(o)) continue;
      if ((im.boxW || 0) < 90 && (im.w || 0) < 160) continue;
      seen.add(o);
      try { index.site.push(Object.assign({ page: p }, im, await download(ctx, im.src, path.join(out, 'site', `${name}-${String(++n).padStart(3, '0')}`)))); } catch (e) { console.log(`⚠ ${e.message}`); }
    }
    for (const pr of data.products) {
      const o = original(pr.url);
      if (!pr.img || index.products.some((x) => x.url === o)) continue;
      seen.add(original(pr.img));
      try { index.products.push(Object.assign({ page: p }, pr, { url: o }, await download(ctx, pr.img, path.join(out, 'products', slug(o.split('/').slice(-3).join('-')))))); } catch (e) { console.log(`⚠ ürün ${e.message}`); }
    }
    console.log(`  "${data.title}" — ${n} görsel, ${data.products.length} ürün kartı`);
  }
  await cdx(ctx);
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));
  console.log(`✔ ${index.pages.length} sayfa, ${index.site.length} site görseli, ${index.products.length} ürün, ${index.logos.length} logo, ${index.cdx.length} CDX görseli`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
