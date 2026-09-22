#!/usr/bin/env node
'use strict';
/**
 * tr.pandora.net üzerinden gerçek Pandora varlıklarını toplar. Claude Code'un bulut oturumu bu siteye
 * erişemediği için betik GitHub Actions'ta çalışır (.github/workflows/fetch-assets.yml → task: pandora).
 *
 *  1. Ürün sayfaları (src/data.js → bracelets + charms): ad, fiyat, görseller (packshot + model çekimi)
 *     Sıra: düz HTTP → gerçek tarayıcı (Playwright/Chromium) → Wayback Machine → SFCC görsel yolu tahmini
 *  2. Listeleme sayfaları (Tılsım, Moments, yeni charm'lar, 3 Al 2 Öde): ürün kartları (ad, fiyat, görsel, adres)
 *  3. Marka sayfaları: logo (SVG/PNG), hero/kampanya görselleri, başlıklar, ekran görüntüleri
 *
 * Çıktı: assets/manifest.json, assets/report.md, assets/src/, assets/logo/, assets/site/, assets/sheets/
 * Kullanım: node tools/fetch-assets.js [--max-per-product=4] [--max-list=16] [--skip-site] [--skip-listings]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const data = require('../src/data');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const BASE = data.brand.site.replace(/\/$/, '');
const ALT = (data.brand.altSite || '').replace(/\/$/, '');
const WB = 'https://web.archive.org';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36';
const MAX_PER = +args['max-per-product'] || 4;
const MAX_LIST = +args['max-list'] || 16;
const root = path.join(__dirname, '..');
const out = path.join(root, 'assets');
for (const d of ['src', 'logo', 'site', 'sheets', 'debug']) fs.mkdirSync(path.join(out, d), { recursive: true });

const report = [];
const log = (s) => { console.log(s); report.push(s); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => crypto.createHash('sha1').update(String(s)).digest('hex').slice(0, 8);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'x';
const decode = (s) => String(s || '').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ');
const strip = (s) => decode(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const trNum = (s) => { const m = String(s || '').match(/(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{1,2}))?/); if (!m) return null; return Math.round(+m[1].replace(/\./g, '') + (m[2] ? +('0.' + m[2]) : 0)); };
const extOf = (ct, url) => { ct = String(ct || '').toLowerCase(); const map = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif' }; for (const k of Object.keys(map)) if (ct.startsWith(k)) return map[k]; const m = String(url).match(/\.(jpe?g|png|webp|gif|svg|avif)(\?|#|$)/i); return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'bin'; };
const pngSize = (b) => (b.length > 24 && b.readUInt32BE(12) === 0x49484452) ? { w: b.readUInt32BE(16), h: b.readUInt32BE(20) } : null;
function jpgSize(b) { let i = 2; while (i < b.length - 9) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1]; if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) { i += 2; continue; } i += 2 + b.readUInt16BE(i + 2); } return null; }
function webpSize(b) { if (b.toString('ascii', 0, 4) !== 'RIFF') return null; const t = b.toString('ascii', 12, 16); if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) }; if (t === 'VP8L') { const x = b.readUInt32LE(21); return { w: 1 + (x & 0x3FFF), h: 1 + ((x >> 14) & 0x3FFF) }; } if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3FFF, h: b.readUInt16LE(28) & 0x3FFF }; return null; }
const imgSize = (b, ext) => ext === 'png' ? pngSize(b) : ext === 'jpg' ? jpgSize(b) : ext === 'webp' ? webpSize(b) : null;
const isBlocked = (status, html) => status === 403 || status === 429 || status === 503 || /Access Denied|Reference&#32;#|Reference #\d|_Incapsula_|cf-challenge|captcha-delivery|Request unsuccessful/i.test(String(html || '').slice(0, 4000));

/** SFCC dinamik görsel servisi: en büyük boyutu iste. */
function bigImg(u) {
  try {
    const x = new URL(u);
    if (/\/dw\/image\/|demandware\.static/i.test(x.href)) { x.searchParams.set('sw', '1400'); x.searchParams.set('sh', '1400'); x.searchParams.set('sm', 'fit'); x.searchParams.delete('q'); }
    return x.toString();
  } catch { return u; }
}
const absUrl = (u, base) => { try { return new URL(decode(u).trim(), base).toString(); } catch { return null; } };
const IMG_RE = /https?:\/\/[^\s"'<>()\\]+?\.(?:jpe?g|png|webp)(?:\?[^\s"'<>()\\]*)?/gi;

/** Ürün sayfası HTML'inden ad, fiyat, görseller. */
function extractProduct(html, url, sku) {
  const r = { title: null, price: null, currency: null, images: [], description: null, jsonld: null };
  const push = (u) => { const a = absUrl(u, url); if (a && !r.images.includes(a)) r.images.push(a); };
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    let j; try { j = JSON.parse(m[1].trim()); } catch { continue; }
    const stack = Array.isArray(j) ? [...j] : [j];
    while (stack.length) {
      const o = stack.shift(); if (!o || typeof o !== 'object') continue;
      if (Array.isArray(o['@graph'])) stack.push(...o['@graph']);
      const t = String(o['@type'] || ''); if (!/Product/i.test(t)) continue;
      r.jsonld = o; r.title = r.title || o.name; r.description = r.description || o.description;
      const imgs = Array.isArray(o.image) ? o.image : o.image ? [o.image] : [];
      for (const im of imgs) push(typeof im === 'string' ? im : im && (im.url || im.contentUrl));
      const offers = Array.isArray(o.offers) ? o.offers : o.offers ? [o.offers] : [];
      for (const of of offers) { const p = of.price || of.lowPrice || (of.priceSpecification && of.priceSpecification.price); if (p && !r.price) { r.price = Math.round(parseFloat(String(p).replace(',', '.'))); r.currency = of.priceCurrency || (of.priceSpecification && of.priceSpecification.priceCurrency) || null; } }
    }
  }
  const og = (p) => { const m = html.match(new RegExp(`<meta[^>]+property=["']og:${p}["'][^>]+content=["']([^"']+)["']`, 'i')) || html.match(new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${p}["']`, 'i')); return m ? decode(m[1]) : null; };
  if (!r.title) { const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i); r.title = (h1 && strip(h1[1])) || og('title'); }
  if (r.title) r.title = r.title.replace(/\s*\|\s*Pandora.*$/i, '').trim();
  if (og('image')) push(og('image'));
  if (!r.price) {
    const m = html.match(/"price"\s*:\s*"?(\d+(?:[.,]\d+)?)"?/) || html.match(/data-price(?:-value)?="(\d+(?:[.,]\d+)?)"/i);
    if (m) r.price = Math.round(parseFloat(m[1].replace(',', '.')));
  }
  if (!r.price) { const m = html.match(/(?:₺\s?)(\d{1,3}(?:\.\d{3})*,\d{2})/) || html.match(/(\d{1,3}(?:\.\d{3})*,\d{2})\s?(?:TL|₺)/); if (m) r.price = trNum(m[1]); }
  // Kodu içeren tüm görsel adresleri (SFCC / yeni platform)
  const skuRe = new RegExp(sku.replace(/[^A-Z0-9]/gi, ''), 'i');
  for (const m of html.matchAll(IMG_RE)) { const u = decode(m[0]); if (skuRe.test(u) && /pandora|demandware|dw\/image|scene7|cloudfront|imgix|akamai/i.test(u)) push(u); }
  for (const m of html.matchAll(/(?:src|data-src|data-srcset|srcset|content)=["']([^"']+)["']/gi)) { const u = decode(m[1]).split(',')[0].trim().split(/\s+/)[0]; if (skuRe.test(u) && /\.(jpe?g|png|webp)(\?|$)/i.test(u)) push(u); }
  r.images = r.images.filter((u) => !/thumb|swatch|icon|sprite|logo|\b(?:sw|sh)=\d{2}\b/i.test(u) || /dw\/image/.test(u));
  return r;
}

(async () => {
  const t0 = Date.now();
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined, args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({ userAgent: UA, locale: 'tr-TR', timezoneId: 'Europe/Istanbul', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ignoreHTTPSErrors: true, extraHTTPHeaders: { 'accept-language': 'tr-TR,tr;q=0.9,en;q=0.7' } });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
  const netBodies = new Map(); // görsel adresi → {buf, ct}
  ctx.on('response', async (res) => {
    try {
      const ct = res.headers()['content-type'] || '';
      if (!res.ok() || !(res.request().resourceType() === 'image' || ct.startsWith('image/'))) return;
      const u = res.url(); if (netBodies.has(u) || netBodies.size > 900) return;
      const b = await res.body().catch(() => null); if (b && b.length > 2000 && b.length < 15e6) netBodies.set(u, { buf: b, ct });
    } catch { /* yoksay */ }
  });
  const manifest = { fetchedAt: new Date().toISOString(), base: BASE, access: {}, logo: null, logos: [], products: [], listings: [], site: { pages: [] }, errors: [] };
  let wbTs = null;

  const plainGet = async (url, referer) => {
    try { const r = await ctx.request.get(url, { timeout: 45000, maxRedirects: 5, headers: { 'user-agent': UA, referer: referer || BASE + '/', accept: 'text/html,application/xhtml+xml,*/*;q=0.8' } }); const html = await r.text().catch(() => ''); return { status: r.status(), html, finalUrl: r.url() }; }
    catch (e) { return { status: 0, html: '', error: e.message.split('\n')[0] }; }
  };
  const page = await ctx.newPage();
  const acceptCookies = async () => {
    for (const sel of ['#onetrust-accept-btn-handler', 'button:has-text("Kabul Et")', 'button:has-text("Tümünü Kabul")', 'button:has-text("Kabul")', 'button:has-text("Accept All")', '[class*="cookie"] button', '[id*="cookie"] button']) {
      try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 500 })) { await b.click({ timeout: 1500 }); await sleep(400); return; } } catch { /* yok */ }
    }
  };
  const browserGet = async (url, opts = {}) => {
    try {
      const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
      const status = res ? res.status() : 0;
      await page.waitForLoadState('networkidle', { timeout: opts.fast ? 7000 : 15000 }).catch(() => {});
      await sleep(opts.wait || 1200);
      await acceptCookies();
      if (opts.scroll) { const total = await page.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < Math.min(total, opts.fast ? 2400 : 8000); y += 600) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await sleep(180); } await page.evaluate(() => window.scrollTo(0, 0)); await sleep(500); await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {}); }
      const html = await page.content();
      const dom = await page.evaluate(() => {
        const vw = innerWidth; const best = (ss) => { const c = String(ss || '').split(',').map((x) => x.trim().split(/\s+/)).filter((x) => x[0]).sort((x, y) => parseInt(y[1] || 0) - parseInt(x[1] || 0))[0]; return c ? c[0] : ''; };
        const imgs = [...document.images].map((i) => { const r = i.getBoundingClientRect(); let src = i.currentSrc || i.src || i.getAttribute('data-src') || ''; const ss = i.srcset || i.getAttribute('data-srcset') || ''; const b = best(ss); if (b) src = b; const pic = i.parentElement && i.parentElement.tagName === 'PICTURE' ? [...i.parentElement.querySelectorAll('source')].map((so) => best(so.srcset || so.getAttribute('data-srcset'))).filter(Boolean) : []; return { src, alts: pic, alt: i.alt || '', nw: i.naturalWidth, nh: i.naturalHeight, x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height), inHeader: !!i.closest('header, nav, [class*="header"], [class*="Header"]') }; });
        const gallery = imgs.filter((i) => i.src && !/^data:/.test(i.src) && !i.inHeader && Math.max(i.w, i.nw) >= 220 && i.y < 1600 && i.x < vw * 0.66).sort((a, b) => (b.w * b.h) - (a.w * a.h)).slice(0, 10);
        const h1 = document.querySelector('h1'); const priceEls = [...document.querySelectorAll('[class*="price"], [data-testid*="price"], [itemprop="price"]')].slice(0, 12).map((e) => (e.getAttribute('content') || e.textContent || '').replace(/\s+/g, ' ').trim()).filter(Boolean);
        return { title: document.title, h1: h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '', prices: priceEls, gallery, imgCount: imgs.length, notFound: /bulunamad|not found|404|hata/i.test(document.title) };
      }).catch(() => null);
      return { status, html, finalUrl: page.url(), dom };
    } catch (e) { return { status: 0, html: '', error: e.message.split('\n')[0] }; }
  };
  const wayback = async (url) => {
    try {
      const a = await ctx.request.get(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, { timeout: 30000 });
      const j = await a.json().catch(() => null); const s = j && j.archived_snapshots && j.archived_snapshots.closest;
      if (!s || !s.available) return null;
      const r = await ctx.request.get(`${WB}/web/${s.timestamp}id_/${url}`, { timeout: 60000 });
      if (!r.ok()) return null; wbTs = s.timestamp;
      return { status: r.status(), html: await r.text(), ts: s.timestamp };
    } catch { return null; }
  };
  const download = async (u, referer, viaWb) => {
    const cached = netBodies.get(u); if (cached) return cached;
    const tryUrl = async (x) => { try { const r = await ctx.request.get(x, { timeout: 60000, headers: { 'user-agent': UA, referer: referer || BASE + '/', accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' } }); if (!r.ok()) return { err: 'HTTP ' + r.status() }; const ct = r.headers()['content-type'] || ''; const buf = await r.body(); if (!ct.startsWith('image/') && !/\.(jpe?g|png|webp|svg)(\?|$)/i.test(x)) return { err: 'tür ' + ct }; return { buf, ct }; } catch (e) { return { err: e.message.split('\n')[0] }; } };
    let r = viaWb ? { err: 'wb' } : await tryUrl(u);
    if (r.err && (viaWb || manifest.access.blocked)) { const ts = wbTs || '2026'; r = await tryUrl(`${WB}/web/${ts}id_/${u}`); }
    return r;
  };

  // ---------- 0. Erişim sondası ----------
  const probe = await plainGet(BASE + '/');
  manifest.access.plain = { status: probe.status, blocked: isBlocked(probe.status, probe.html), server: null };
  log(`sonda (düz HTTP) ${BASE}/ → ${probe.status}${manifest.access.plain.blocked ? ' ENGELLİ' : ''}`);
  const bprobe = await browserGet(BASE + '/', { wait: 2500 });
  manifest.access.browser = { status: bprobe.status, blocked: isBlocked(bprobe.status, bprobe.html), title: (bprobe.html.match(/<title>([^<]*)<\/title>/i) || [])[1] };
  log(`sonda (tarayıcı) ${BASE}/ → ${bprobe.status} "${manifest.access.browser.title || ''}"${manifest.access.browser.blocked ? ' ENGELLİ' : ''}`);
  manifest.access.blocked = manifest.access.plain.blocked && manifest.access.browser.blocked;
  if (manifest.access.blocked) log('Canlı site engelli → Wayback Machine arşivi denenecek');
  if (ALT) {
    const ap = await browserGet(ALT + '/', { wait: 2500 });
    manifest.access.alt = { base: ALT, status: ap.status, blocked: isBlocked(ap.status, ap.html), title: (ap.html.match(/<title>([^<]*)<\/title>/i) || [])[1] };
    log(`sonda (tarayıcı) ${ALT}/ → ${ap.status} "${manifest.access.alt.title || ''}"${manifest.access.alt.blocked ? ' ENGELLİ' : ''}`);
  }
  const altLive = !!(ALT && manifest.access.alt && !manifest.access.alt.blocked && manifest.access.alt.status < 400);
  const liveBase = !manifest.access.browser.blocked ? BASE : (altLive ? ALT : null);

  // ---------- 1. Ürün sayfaları ----------
  const products = [...data.bracelets.map((b) => ({ ...b, kind: 'bracelet' })), ...data.charms.map((c) => ({ ...c, kind: 'charm' })), ...(data.candidates || [])];
  const only = args.only ? String(args.only).split(',') : null;
  for (const p of products) {
    if (only && only.indexOf(p.key) < 0) continue;
    const rec = { key: p.key, kind: p.kind, sku: p.sku, url: p.url, title: p.title, price: p.price, currency: 'TRY', images: [], source: null, tries: [] };
    log(`\n## ${p.kind} ${p.key} (${p.sku}) ${p.url}`);
    let got = null;
    const attempts = [];
    const skus = p.skus || [p.sku];
    if (!manifest.access.plain.blocked) attempts.push(['plain', p.url, () => plainGet(p.url)]);
    if (!manifest.access.browser.blocked) attempts.push(['browser', p.url, () => browserGet(p.url, { scroll: true })]);
    const altUrls = [];
    for (const u of p.alt || []) altUrls.push(u);
    if (altLive) for (const sk of skus) { const s = sk.toLowerCase(); const cat = p.kind === 'bracelet' ? 'bracelets' : 'charms'; for (const mid of ['silver/', '', 'pandora-rose/']) altUrls.push(`${ALT}/products/${cat}/${mid}${s}`); altUrls.push(`${ALT}/search?q=${encodeURIComponent(sk)}`); }
    for (const u of [...new Set(altUrls)]) attempts.push([/search\?q=/.test(u) ? 'alt-search' : 'alt', u, () => browserGet(u, { scroll: true, wait: 1200, fast: true })]);
    attempts.push(['wayback', p.url, () => wayback(p.url)]);
    const skuRe = new RegExp(skus.map((x) => x.replace(/[^A-Z0-9]/gi, '')).join('|'), 'i');
    for (const [name, url, fn] of attempts) {
      const r = await fn(); if (!r) { rec.tries.push(`${name}: yok`); continue; }
      const blocked = isBlocked(r.status, r.html);
      let ex = r.html ? extractProduct(r.html, r.finalUrl || url, p.sku) : { images: [] };
      let domGallery = 0;
      if (r.dom) {
        if (name === 'alt-search') {
          // arama sonucundan ilk ürün bağlantısı
          const m = r.html.match(new RegExp('href="([^"]*\\/products\\/[^"]*?(?:' + skus.map((x) => x.toLowerCase()).join('|') + ')[^"]*)"', 'i'));
          if (m) { const pu = absUrl(m[1], ALT); rec.tries.push(`alt-search → ${pu}`); const r2 = await browserGet(pu, { scroll: true, wait: 1500 }); if (r2 && r2.html && !isBlocked(r2.status, r2.html)) { r.html = r2.html; r.dom = r2.dom; r.finalUrl = r2.finalUrl; r.status = r2.status; ex = extractProduct(r.html, r.finalUrl, p.sku); } }
          else { rec.tries.push('alt-search: ürün bağlantısı yok'); continue; }
        }
        const isProduct = !r.dom.notFound && r.dom.h1 && (skuRe.test(r.html) || ex.jsonld) && (ex.images.length || ex.price || r.dom.gallery.length);
        if (!isProduct) { rec.tries.push(`${name}: ${r.status} ürün sayfası değil ("${(r.dom.h1 || r.dom.title || '').slice(0, 60)}")`); continue; }
        if (!ex.title && r.dom.h1) ex.title = r.dom.h1;
        if (!ex.price) { for (const t of r.dom.prices) { const m = t.match(/(?:₺\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})/) || t.match(/^(\d{3,6})(?:[.,]\d\d)?\s*(?:TL|₺)?$/); if (m) { ex.price = trNum(m[1]); ex.currency = 'TRY'; break; } } }
        for (const g of r.dom.gallery) { for (const u2 of [g.src, ...g.alts]) { const a = absUrl(u2, r.finalUrl || url); if (a && !ex.images.includes(a)) { ex.images.push(a); domGallery++; } } }
        const shot = path.join(out, 'debug', `${p.key}.jpg`); await page.screenshot({ path: shot, type: 'jpeg', quality: 55 }).catch(() => {});
        fs.writeFileSync(path.join(out, 'debug', `${p.key}.json`), JSON.stringify({ url: r.finalUrl || url, dom: r.dom, jsonld: ex.jsonld }, null, 1));
      }
      rec.tries.push(`${name}: ${r.status}${blocked ? ' engelli' : ''} ${ex.images.length} görsel (${domGallery} galeri)${ex.price ? ' ₺' + ex.price : ''}${r.error ? ' ' + r.error : ''} ${url.slice(0, 80)}`);
      if (blocked || !r.html || r.status >= 400) continue;
      if (ex.images.length || ex.price) { got = { ...ex, via: name, url: r.finalUrl || url }; break; }
    }
    if (got) {
      rec.source = got.via; rec.sourceUrl = got.url; if (got.title) rec.title = got.title; if (got.price) rec.price = got.price; if (got.currency) rec.currency = got.currency;
      rec.description = got.description ? String(got.description).slice(0, 400) : undefined;
      rec.jsonld = got.jsonld ? { name: got.jsonld.name, sku: got.jsonld.sku, brand: got.jsonld.brand, offers: got.jsonld.offers } : undefined;
      rec.imageUrls = got.images.slice(0, 12);
    } else { rec.error = 'sayfa alınamadı'; }
    // SFCC tahmini (yedek): kod + _RGB
    if (!rec.imageUrls || !rec.imageUrls.length) {
      rec.imageUrls = [
        `${BASE}/dw/image/v2/BFJB_PRD/on/demandware.static/-/Sites-pandora-master-catalog/default/images/hi-res/${p.sku}_RGB.jpg?sw=1400&sh=1400&sm=fit`,
        `${BASE}/on/demandware.static/-/Sites-pandora-master-catalog/default/images/hi-res/${p.sku}_RGB.jpg`,
      ];
      rec.tries.push('sfcc-tahmin');
    }
    let n = 0; const seenHash = new Set();
    for (const u0 of rec.imageUrls) {
      if (n >= MAX_PER) break;
      const u = bigImg(u0);
      if (rec.source === 'wayback') { rec.tries.push('görseller arşivde yok; atlandı'); break; }
      let r = await download(u, rec.sourceUrl || p.url, false);
      if (r.err && u !== u0) r = await download(u0, rec.sourceUrl || p.url, false);
      if (r.err) { rec.tries.push(`görsel ${u0.slice(0, 90)} → ${r.err}`); continue; }
      const ext = extOf(r.ct, u); if (!/^(jpg|png|webp)$/.test(ext)) continue;
      const h = hash(r.buf); if (seenHash.has(h)) continue; seenHash.add(h);
      const dim = imgSize(r.buf, ext); if (dim && dim.w < 300) { rec.tries.push(`görsel küçük ${dim.w}px`); continue; }
      const file = path.join(out, 'src', `${p.key}-${n + 1}.${ext}`); fs.writeFileSync(file, r.buf);
      rec.images.push({ file: path.relative(root, file), url: u0, w: dim && dim.w, h: dim && dim.h, bytes: r.buf.length, packshot: /_RGB|_1\.|packshot/i.test(u0) || n === 0 });
      n++;
    }
    log(`- ${rec.source || 'yok'}: "${rec.title}" ${rec.price ? rec.price + ' ' + rec.currency : 'fiyat yok'} · ${rec.images.length} görsel indirildi`);
    for (const t of rec.tries) log(`  · ${t}`);
    manifest.products.push(rec);
  }

  // ---------- 2. Listeleme sayfaları ----------
  if (!args['skip-listings'] && liveBase) {
    for (const L of (liveBase === BASE ? data.listings : data.altListings) || []) {
      log(`\n## liste ${L.key} ${L.url}`);
      const rec = { key: L.key, name: L.name, url: L.url, items: [], error: null };
      const r = await browserGet(L.url, { scroll: true, wait: 1800 });
      if (isBlocked(r.status, r.html) || r.status >= 400) { rec.error = 'HTTP ' + r.status; manifest.listings.push(rec); log(`- ${rec.error}`); continue; }
      const tiles = await page.evaluate((MAX) => {
        const outT = []; const seen = new Set();
        for (const a of document.querySelectorAll('a[href]')) {
          const m = a.href.match(/\/([0-9]{5,}[A-Z0-9]*)\.html(\?|#|$)/i) || a.href.match(/\/products\/(?:[^/?#]+\/){0,3}([0-9]{5,}[a-z0-9_]*)(?:-\d+)?\/?(\?|#|$)/i); if (!m) continue; const sku = m[1].toUpperCase(); if (seen.has(sku)) continue;
          const tile = a.closest('.product-tile, .product, [class*="tile"], [class*="product"], li, article') || a;
          const img = tile.querySelector('img'); let src = img ? (img.currentSrc || img.src || img.getAttribute('data-src') || '') : '';
          const ss = img ? (img.srcset || img.getAttribute('data-srcset') || '') : '';
          if (ss) { const best = ss.split(',').map((s) => s.trim().split(/\s+/)).sort((x, y) => parseInt(y[1] || 0) - parseInt(x[1] || 0))[0]; if (best && best[0]) src = best[0]; }
          const nameEl = tile.querySelector('.pdp-link, .product-name, [class*="name"], [class*="title"], h2, h3');
          const name = ((nameEl && nameEl.textContent) || (img && img.alt) || a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120);
          const priceEls = [...tile.querySelectorAll('.price .value, .sales .value, [class*="price"] [content], [class*="price"]')];
          const price = priceEls.map((e) => e.getAttribute('content') || e.textContent).join(' | ').replace(/\s+/g, ' ').trim().slice(0, 120);
          const badge = [...tile.querySelectorAll('[class*="badge"], [class*="flag"], [class*="label"]')].map((e) => e.textContent.trim()).filter(Boolean).join(' | ').slice(0, 80);
          outT.push({ sku, url: a.href.split('?')[0], name, price, badge, image: src });
          seen.add(sku); if (outT.length >= MAX) break;
        }
        return outT;
      }, MAX_LIST).catch(() => []);
      for (const t of tiles) {
        const item = { sku: t.sku, name: t.name, url: t.url, priceText: t.price, price: trNum((t.price.match(/(?:₺\s?)?(\d{1,3}(?:\.\d{3})*,\d{2})/) || [])[1] || t.price), badge: t.badge, image: null };
        if (t.image) {
          const u = bigImg(t.image); let r = await download(u, L.url, false); if (r.err) r = await download(t.image, L.url, false);
          if (!r.err) { const ext = extOf(r.ct, u); const dim = imgSize(r.buf, ext); const file = path.join(out, 'src', `list-${L.key}-${t.sku}.${ext}`); fs.writeFileSync(file, r.buf); item.image = { file: path.relative(root, file), url: t.image, w: dim && dim.w, h: dim && dim.h, bytes: r.buf.length }; }
          else item.imageError = r.err;
        }
        rec.items.push(item);
      }
      const shot = path.join(out, 'site', `list-${L.key}.jpg`); await page.screenshot({ path: shot, type: 'jpeg', quality: 70 }).catch(() => {}); rec.screen = path.relative(root, shot);
      log(`- ${rec.items.length} ürün kartı, ${rec.items.filter((i) => i.image).length} görsel`);
      for (const i of rec.items.slice(0, 20)) log(`  · ${i.sku} "${i.name}" ${i.priceText}`);
      manifest.listings.push(rec);
    }
  }

  // ---------- 3. Marka sayfaları: logo, hero görselleri, metinler ----------
  if (!args['skip-site'] && liveBase) {
    for (const p of (liveBase === BASE ? data.sitePages : data.altSitePages) || ['/']) {
      const url = liveBase + p; log(`\n## site ${url}`);
      const rec = { path: p, url, images: [], texts: {}, svgs: [] };
      const r = await browserGet(url, { scroll: true, wait: 2000 });
      if (isBlocked(r.status, r.html) || r.status >= 400) { rec.error = 'HTTP ' + r.status; manifest.site.pages.push(rec); log(`- ${rec.error}`); continue; }
      const name = slug(p === '/' || p === '' ? 'home' : p);
      const shotV = path.join(out, 'site', `${name}-hero.jpg`); await page.screenshot({ path: shotV, type: 'jpeg', quality: 74 }).catch(() => {});
      const shotF = path.join(out, 'site', `${name}-full.jpg`); await page.screenshot({ path: shotF, type: 'jpeg', quality: 60, fullPage: true }).catch(() => {});
      rec.screens = { hero: path.relative(root, shotV), full: path.relative(root, shotF) };
      const dom = await page.evaluate(() => {
        const q = (s) => [...document.querySelectorAll(s)];
        const rect = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
        const imgs = [...document.images].map((i) => { let src = i.currentSrc || i.src || i.getAttribute('data-src') || ''; const ss = i.srcset || i.getAttribute('data-srcset') || ''; if (ss) { const best = ss.split(',').map((s) => s.trim().split(/\s+/)).sort((x, y) => parseInt(y[1] || 0) - parseInt(x[1] || 0))[0]; if (best && best[0] && parseInt(best[1] || 0) > i.naturalWidth) src = best[0]; } return { src, alt: i.alt || '', nw: i.naturalWidth, nh: i.naturalHeight, box: rect(i), inHeader: !!i.closest('header, nav, [class*="header"], [class*="Header"], [class*="logo"], [class*="Logo"]'), cls: String(i.className).slice(0, 100) }; });
        const bgs = []; for (const e of q('section, div, a, header').slice(0, 4000)) { const bi = getComputedStyle(e).backgroundImage; if (bi && bi !== 'none') for (const m of bi.matchAll(/url\((['"]?)(.*?)\1\)/g)) bgs.push({ src: m[2], box: rect(e) }); }
        const sources = q('picture source').map((s) => ({ srcset: s.srcset || s.getAttribute('data-srcset') || '', media: s.media || '' }));
        const videos = q('video source, video').map((v) => v.src || v.getAttribute('src') || v.getAttribute('data-src') || '').filter(Boolean);
        const svgs = q('header svg, nav svg, [class*="logo"] svg, [class*="Logo"] svg, a[href="/"] svg, a[href$="/tr/"] svg, a[aria-label*="andora"] svg').slice(0, 10).map((s) => { let html = s.outerHTML; const uses = [...s.querySelectorAll('use')].map((u) => (u.getAttribute('href') || u.getAttribute('xlink:href') || '').replace('#', '')).filter(Boolean); const defs = uses.map((id) => { const d = document.getElementById(id); return d ? d.outerHTML : ''; }).join(''); if (defs) html = html.replace('</svg>', `<defs>${defs}</defs></svg>`); html = html.replace(/currentColor/g, getComputedStyle(s).color || '#000'); if (!/xmlns=/.test(html)) html = html.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'); return { html: html.slice(0, 80000), box: rect(s), aria: s.getAttribute('aria-label') || '', parentCls: String(s.parentElement && s.parentElement.className || '').slice(0, 100), title: (s.querySelector('title') || {}).textContent || '' }; });
        const icons = q('link[rel*="icon"]').map((l) => ({ href: l.href, sizes: l.getAttribute('sizes') || '' }));
        const meta = {}; for (const m of q('meta[property^="og:"], meta[name="description"], meta[name="theme-color"]')) meta[m.getAttribute('property') || m.getAttribute('name')] = m.getAttribute('content');
        const tx = (sel, n, max) => q(sel).map((e) => String(e.innerText || e.textContent || '').trim().replace(/\s+/g, ' ')).filter((t) => t && t.length < max).slice(0, n);
        const texts = { title: document.title, h1: tx('h1', 10, 200), h2: tx('h2', 30, 200), h3: tx('h3', 30, 200), buttons: tx('button, a.btn, [class*="btn"], [class*="button"]', 60, 60), hero: tx('[class*="hero"] h1, [class*="hero"] h2, [class*="hero"] p, [class*="banner"] h2, [class*="banner"] h3, [class*="banner"] p, [class*="headline"], [class*="promo"] p, [class*="promo"] h2', 40, 240), lead: tx('p', 40, 240) };
        const fonts = {}; for (const sel of ['body', 'h1', 'h2', 'p', 'button', 'a']) { const e = document.querySelector(sel); if (e) { const cs = getComputedStyle(e); fonts[sel] = { family: cs.fontFamily, weight: cs.fontWeight, size: cs.fontSize, color: cs.color, letterSpacing: cs.letterSpacing, transform: cs.textTransform }; } }
        const colorHits = {}; for (const e of q('button, a, header, footer, [class*="btn"], [class*="badge"], section, [class*="hero"], [class*="banner"], h1, h2, [class*="promo"]').slice(0, 600)) { const cs = getComputedStyle(e); for (const c of [cs.backgroundColor, cs.color]) { if (c && !/rgba\(0, 0, 0, 0\)/.test(c)) colorHits[c] = (colorHits[c] || 0) + 1; } }
        const vars = {}; try { for (const ss of document.styleSheets) { let rules; try { rules = ss.cssRules; } catch { continue; } for (const r of rules) { if (!r.style || !/:root|html|body/.test(r.selectorText || '')) continue; for (let i = 0; i < r.style.length; i++) { const pn = r.style[i]; if (pn.startsWith('--')) { const v = r.style.getPropertyValue(pn).trim(); if (/^#|^rgb|^hsl/.test(v)) vars[pn] = v; } } } } } catch { /* yok */ }
        return { imgs, bgs, sources, videos, svgs, icons, meta, texts, fonts, colorHits, vars };
      }).catch((e) => ({ imgs: [], bgs: [], sources: [], videos: [], svgs: [], icons: [], meta: {}, texts: { error: e.message }, fonts: {}, colorHits: {}, vars: {} }));
      Object.assign(rec, { texts: dom.texts, meta: dom.meta, fonts: dom.fonts, colorHits: Object.entries(dom.colorHits).sort((a, b) => b[1] - a[1]).slice(0, 40), cssVars: dom.vars, icons: dom.icons, videos: dom.videos.slice(0, 20) });
      // satır içi SVG logolar
      dom.svgs.forEach((s, i) => { const h = hash(s.html); if (manifest.logos.some((x) => x.hash === h)) return; const f = path.join(out, 'logo', `inline-${name}-${i}-${h}.svg`); fs.writeFileSync(f, s.html); manifest.logos.push({ file: path.relative(root, f), hash: h, kind: 'inline-svg', page: p, box: s.box, aria: s.aria, title: s.title, parentCls: s.parentCls, bytes: s.html.length }); });
      // header'daki img logolar + ikonlar
      const cands = [...dom.imgs.filter((i) => i.inHeader || /logo/i.test(i.alt + ' ' + i.cls + ' ' + i.src)).map((i) => ({ src: i.src, alt: i.alt, box: i.box, kind: 'header-img' })), ...dom.icons.map((i) => ({ src: i.href, alt: 'icon ' + i.sizes, kind: 'icon' }))];
      for (const c of cands.slice(0, 12)) { const u = absUrl(c.src, url); if (!u || manifest.logos.some((l) => l.url === u)) continue; const r = await download(u, url, false); if (r.err) continue; const ext = extOf(r.ct, u); if (!/^(svg|png|jpg|webp)$/.test(ext)) continue; const f = path.join(out, 'logo', `${c.kind}-${slug(path.basename(new URL(u).pathname).replace(/\.[a-z0-9]+$/i, ''))}-${hash(u)}.${ext}`); fs.writeFileSync(f, r.buf); const dim = imgSize(r.buf, ext); manifest.logos.push({ file: path.relative(root, f), url: u, kind: c.kind, alt: c.alt, box: c.box, w: dim && dim.w, h: dim && dim.h, bytes: r.buf.length }); }
      // büyük sayfa görselleri (hero / kampanya / lifestyle)
      const big = new Map();
      for (const i of dom.imgs) { if (i.inHeader) continue; const w = Math.max(i.nw, i.box.w); if (w < 600 || !i.src) continue; const u = absUrl(i.src, url); if (!u) continue; const prev = big.get(u); if (!prev || w > prev.w) big.set(u, { url: u, w, alt: i.alt, box: i.box, via: 'img' }); }
      for (const b of dom.bgs) { if (b.box.w < 600) continue; const u = absUrl(b.src, url); if (u && !big.has(u)) big.set(u, { url: u, w: b.box.w, alt: '', box: b.box, via: 'css-bg' }); }
      for (const s of dom.sources) { const best = s.srcset.split(',').map((x) => x.trim().split(/\s+/)).sort((x, y) => parseInt(y[1] || 0) - parseInt(x[1] || 0))[0]; if (best && best[0] && parseInt(best[1] || 0) >= 900) { const u = absUrl(best[0], url); if (u && !big.has(u)) big.set(u, { url: u, w: parseInt(best[1]), alt: '', via: 'source ' + s.media }); } }
      let n = 0;
      for (const b of [...big.values()].sort((a, c) => (c.box ? c.box.w * c.box.h : c.w * c.w) - (a.box ? a.box.w * a.box.h : a.w * a.w))) {
        if (n >= 14) break;
        const r = await download(bigImg(b.url), url, false); if (r.err) continue;
        const ext = extOf(r.ct, b.url); if (!/^(jpg|png|webp)$/.test(ext)) continue;
        const dim = imgSize(r.buf, ext); if (dim && dim.w < 500) continue;
        const f = path.join(out, 'site', `${name}-${String(n + 1).padStart(2, '0')}-${slug(path.basename(new URL(b.url).pathname).replace(/\.[a-z0-9]+$/i, '')).slice(0, 40)}.${ext}`); fs.writeFileSync(f, r.buf);
        rec.images.push({ file: path.relative(root, f), url: b.url, w: dim && dim.w, h: dim && dim.h, bytes: r.buf.length, alt: b.alt, box: b.box, via: b.via }); n++;
      }
      log(`- "${dom.texts.title}" · ${rec.images.length} büyük görsel, ${dom.svgs.length} satır içi svg, ${dom.videos.length} video`);
      if (dom.texts.h1 && dom.texts.h1.length) log(`- h1: ${dom.texts.h1.join(' | ')}`);
      if (dom.texts.hero && dom.texts.hero.length) log(`- hero: ${dom.texts.hero.slice(0, 8).join(' | ')}`);
      manifest.site.pages.push(rec);
    }
  }
  // Logo yedeği: Wikimedia Commons (resmi kelime markası SVG)
  try {
    const r = await ctx.request.get('https://upload.wikimedia.org/wikipedia/commons/5/56/Pandora_Logo_2019.svg', { timeout: 30000, headers: { 'user-agent': UA } });
    if (r.ok()) { const f = path.join(out, 'logo', 'wikimedia-pandora-2019.svg'); fs.writeFileSync(f, await r.body()); manifest.logos.push({ file: path.relative(root, f), url: 'https://commons.wikimedia.org/wiki/File:Pandora_Logo_2019.svg', kind: 'wikimedia', bytes: fs.statSync(f).size }); log('\n✔ yedek logo: Wikimedia Pandora_Logo_2019.svg'); }
  } catch (e) { manifest.errors.push('wikimedia logo: ' + e.message.split('\n')[0]); }
  // Logo seçimi: header'daki satır içi svg > header img > wikimedia
  manifest.logo = (manifest.logos.find((l) => l.kind === 'inline-svg' && (/pandora/i.test(l.aria + ' ' + l.title + ' ' + l.parentCls) || (l.box && l.box.w > 60 && l.box.w < 400 && l.box.y < 200))) || manifest.logos.find((l) => l.kind === 'header-img' && /pandora|logo/i.test(l.alt + ' ' + l.url) && l.box && l.box.y < 200) || manifest.logos.find((l) => l.kind === 'wikimedia') || null);

  // ---------- Kontak sayfaları ----------
  const sheet = async (title, items, file) => {
    if (!items.length) return;
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#1d1a1b;color:#fff;font:12px/1.3 sans-serif}h1{font-size:14px;margin:8px 12px}.g{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:8px;width:1600px;box-sizing:border-box}.c{background:#2b2728;border-radius:6px;overflow:hidden}.c .im{height:200px;display:flex;align-items:center;justify-content:center;background:#fff}.c img{max-width:100%;max-height:200px}.c .t{padding:6px 8px;height:60px;overflow:hidden}.c b{color:#f6c9d3}</style><h1>${title}</h1><div class="g">${items.map((it, i) => `<div class="c"><div class="im"><img src="file://${path.join(root, it.file)}"></div><div class="t"><b>#${i}</b> ${it.label}<br>${it.w || '?'}×${it.h || '?'} ${(it.bytes / 1024).toFixed(0)}KB</div></div>`).join('')}</div>`;
    const f = path.join(out, 'sheets', file + '.html'); fs.writeFileSync(f, html);
    const sp = await ctx.newPage(); await sp.setViewportSize({ width: 1600, height: 1000 }); await sp.goto('file://' + f); await sleep(700);
    await sp.screenshot({ path: f.replace(/\.html$/, '.jpg'), type: 'jpeg', quality: 72, fullPage: true }).catch(() => {}); await sp.close(); fs.unlinkSync(f);
  };
  await sheet('Ürün sayfası görselleri', manifest.products.flatMap((p) => p.images.map((im) => ({ ...im, label: `${p.key} ${p.sku} · ${p.price || '?'} TL` }))), 'products');
  await sheet('Listeleme kartları', manifest.listings.flatMap((L) => L.items.filter((i) => i.image).map((i) => ({ ...i.image, label: `${L.key} ${i.sku} · ${i.name.slice(0, 40)} · ${i.priceText}` }))), 'listings');
  await sheet('Site görselleri', manifest.site.pages.flatMap((pg) => pg.images.map((im) => ({ ...im, label: `${pg.path} ${im.alt.slice(0, 40)}` }))), 'site');
  await sheet('Logo adayları', manifest.logos.filter((l) => /^(svg|png|jpg|webp)$/.test(path.extname(l.file).slice(1))).map((l) => ({ ...l, label: `${l.kind} ${l.aria || l.alt || ''}` })), 'logos');

  await browser.close();
  manifest.durationSec = Math.round((Date.now() - t0) / 1000);
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
  const okP = manifest.products.filter((p) => p.images.length).length;
  log(`\n✔ ${okP}/${manifest.products.length} ürün görselli · ${manifest.listings.reduce((a, l) => a + l.items.length, 0)} liste kartı · ${manifest.site.pages.reduce((a, p) => a + p.images.length, 0)} site görseli · ${manifest.logos.length} logo adayı · ${manifest.durationSec} sn`);
  fs.writeFileSync(path.join(out, 'report.md'), '# Pandora toplayıcı raporu\n\n' + report.join('\n') + '\n');
  if (!okP) { console.error('Hiç ürün görseli indirilemedi'); process.exit(2); }
})().catch((e) => { console.error(e); process.exit(1); });
