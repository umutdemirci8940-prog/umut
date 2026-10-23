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
// Menüden alınan gerçek kategori adresleri
const PAGES = [
  '/', '/kampanyalar', '/makyaj/c/100', '/cilt-bakim/c/101', '/sac-bakim/c/102', '/parfum/c/100013',
  '/kisisel-bakim/c/103', '/erkek-bakim/c/105', '/k-beauty/c/104', '/sadece-watsonsta/c/50058',
  '/saglikli-yasam/c/106', '/ayin-urunleri/c/50007', '/makyaj/makyaj-cok-satanlar/c/100070',
];
// Tarayıcının yüklediği görseller (arşiv sunucusu ayrı istekleri sınırlıyor; sayfanın kendi yüklediğini saklarız)
const cache = new Map();
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'home';
const extOf = (url, type) => {
  const m = (type || '').match(/image\/(png|jpe?g|webp|gif|svg|avif)/);
  if (m) return m[1].replace('jpeg', 'jpg').replace('svg+xml', 'svg');
  return ((new URL(url).pathname.match(/\.(png|jpe?g|webp|gif|svg|avif)$/i) || [, 'jpg'])[1]).toLowerCase().replace('jpeg', 'jpg');
};
// Arşiv adresini ham dosya adresine çevirir (…/web/<ts>im_/https://…  → …/web/<ts>id_/https://…)
const raw = (u) => u.replace(/\/web\/(\d+)[a-z_]*\//, '/web/$1id_/');
const original = (u) => { const m = u.match(/\/web\/\d+[a-z_]*\/(.+)$/); return m ? m[1] : u; };
const T0 = Date.now();
const BUDGET = (+process.env.BUDGET_MIN || 28) * 60000;
const left = () => BUDGET - (Date.now() - T0);
const log = (m) => console.log(`[${Math.round((Date.now() - T0) / 1000)}s] ${m}`);
const index = { fetchedAt: new Date().toISOString(), via: 'web.archive.org', pages: [], site: [], products: [], logos: [], cdx: [], theme: {}, nav: [] };
const seen = new Set();

async function get(ctx, url) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await ctx.request.get(url, { timeout: 20000 });
      if (r.ok()) return r;
      if (r.status() === 404) throw new Error('404');
      if (r.status() === 429) await new Promise((res) => setTimeout(res, 8000));
    } catch (e) { if (String(e.message).includes('404')) throw e; }
    await new Promise((res) => setTimeout(res, 1500));
  }
  throw new Error(`indirilemedi ${url}`);
}
async function download(ctx, url, file) {
  const hit = cache.get(original(url));
  if (hit) {
    const f = `${file}.${extOf(original(url), hit.type)}`;
    fs.writeFileSync(f, hit.buf);
    return { file: path.relative(root, f), bytes: hit.buf.length, type: hit.type, original: original(url), cached: true };
  }
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

async function pool(jobs, k) {
  let i = 0;
  await Promise.all(Array.from({ length: k }, async () => {
    while (i < jobs.length && left() > 3 * 60000) { const j = jobs[i++]; try { await j.run(); } catch (e) { console.log(`⚠ ${e.message}`); } }
  }));
}
const save = () => fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 1));

async function cdx(ctx) {
  // Arşivdeki watsons.com.tr görselleri (2025 sonrası), adres başına tek kayıt
  if (left() < 4 * 60000) return;
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
  const jobs = [];
  for (const r of list.slice(0, 160)) {
    if (seen.has(r.url)) continue;
    seen.add(r.url);
    const k = ++n, u = `${WB}/${r.ts}id_/${r.url}`;
    jobs.push({ run: async () => { index.cdx.push(Object.assign({ ts: r.ts }, await download(ctx, u, path.join(out, 'cdx', String(k).padStart(3, '0'))))); } });
  }
  await pool(jobs, 4);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, locale: 'tr-TR', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(90000);
  page.on('response', async (r) => {
    try {
      const t = r.headers()['content-type'] || '';
      if (!/^image\//.test(t) || r.status() !== 200 || /svg/.test(t) && !/logo/i.test(r.url())) return;
      const buf = await r.body();
      if (buf.length > 1500) cache.set(original(r.url()), { buf, type: t });
    } catch { /* gövde alınamadı */ }
  });
  const queue = [...PAGES];
  const done = new Set();
  while (queue.length && left() > 6 * 60000) {
    const p = queue.shift();
    if (done.has(p)) continue;
    done.add(p);
    const target = `${WB}/2026/https://www.watsons.com.tr${p}`;
    log(`→ ${target}`);
    try {
      const resp = await page.goto(target, { waitUntil: 'domcontentloaded', timeout: 60000 });
      if (!resp || resp.status() >= 400) { console.log(`  arşivde yok (${resp && resp.status()})`); continue; }
      await page.waitForTimeout(4000);
      await page.evaluate(() => { const w = document.getElementById('wm-ipp-base'); if (w) w.remove(); const d = document.querySelector('#donato'); if (d) d.remove(); });
      await autoscroll(page);
      await page.waitForTimeout(2000);
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
    }
    let n = 0;
    const jobs = [];
    for (const pr of data.products.slice(0, 40)) {
      const o = original(pr.url);
      if (!pr.img || index.products.some((x) => x.url === o) || jobs.some((j) => j.url === o)) continue;
      seen.add(original(pr.img));
      jobs.push({ url: o, run: async () => { index.products.push(Object.assign({ page: p }, pr, { url: o }, await download(ctx, pr.img, path.join(out, 'products', slug(o.split('/').slice(-3).join('-')))))); } });
    }
    for (const im of [...data.imgs, ...data.bgs].sort((a, b) => (b.boxW * b.boxH) - (a.boxW * a.boxH)).slice(0, 40)) {
      const o = original(im.src);
      if (seen.has(o) || /\.svg(\?|$)/i.test(o)) continue;
      if ((im.boxW || 0) < 90 && (im.w || 0) < 160) continue;
      seen.add(o);
      const k = ++n;
      jobs.push({ run: async () => { index.site.push(Object.assign({ page: p }, im, await download(ctx, im.src, path.join(out, 'site', `${name}-${String(k).padStart(3, '0')}`)))); } });
    }
    await pool(jobs, 4);
    save();
    log(`  önbellek ${cache.size} · "${data.title}" — ${n} görsel, ${data.products.length} ürün kartı`);
  }
  await cdx(ctx);
  save();
  console.log(`✔ ${index.pages.length} sayfa, ${index.site.length} site görseli, ${index.products.length} ürün, ${index.logos.length} logo, ${index.cdx.length} CDX görseli`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
