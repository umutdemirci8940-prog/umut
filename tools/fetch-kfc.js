#!/usr/bin/env node
'use strict';
/**
 * kfcturkiye.com üzerindeki gerçek marka varlıklarını toplar: görseller, videolar, logo,
 * fontlar, renkler, metinler ve sayfa ekran görüntüleri. Sayfalar gerçek bir tarayıcıda
 * (Playwright + Chromium) açılır; tembel yüklenen görseller ve videolar da yakalanır.
 *
 * Bu betik GitHub Actions'ta çalışmak üzere yazıldı (Claude Code'un bulut oturumu siteye
 * erişemiyor). Çıktı: assets/kfc/manifest.json, screens/, img/, video/, fonts/, api/, contact-*.jpg
 *
 * Kullanım: node tools/fetch-kfc.js [--base=https://www.kfcturkiye.com] [--max-video-mb=60] [--max-total-mb=400]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync, spawnSync } = require('child_process');
const { chromium } = require('playwright');

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
}));
const HOSTS = String(args.hosts || 'https://www.kfcturkiye.com,https://kfcturkiye.com,https://ns1.kfcturkiye.com,https://www.kfc.com.tr,https://kfc.com.tr').split(',').map((h) => h.trim().replace(/\/$/, '')).filter(Boolean);
let BASE = HOSTS[0];
const WB = 'https://web.archive.org';
const hostStatus = {};           // host -> HTTP durumu (403 = engelli)
const cdxTs = new Map();         // orijinal URL -> en yeni arşiv zaman damgası
let archiveMode = false; let homeTs = null;
// Wayback yeniden yazımlarını orijinal adrese çevir: https://web.archive.org/web/2026...im_/https://x → https://x
const orig = (u) => { const m = String(u || '').match(/^https?:\/\/web\.archive\.org\/web\/(\d{4,17})[a-z_]*\/(https?:\/\/.+)$/i); return m ? m[2] : u; };
const tsOf = (u) => { const m = String(u || '').match(/^https?:\/\/web\.archive\.org\/web\/(\d{4,17})/i); return m ? m[1] : null; };
const isArchiveInfra = (u) => /web\.archive\.org\/(_static|static)\/|archive\.org\/(includes|images\/|components)|analytics\.archive\.org/i.test(u);
const MAX_VIDEO = (+args['max-video-mb'] || 60) * 1024 * 1024;
const MAX_TOTAL = (+args['max-total-mb'] || 400) * 1024 * 1024;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const root = path.join(__dirname, '..');
const out = path.join(root, 'assets', 'kfc');
const dirs = { screens: 'screens', img: 'img', video: 'video', fonts: 'fonts', api: 'api', svg: 'svg' };
for (const d of Object.values(dirs)) fs.mkdirSync(path.join(out, d), { recursive: true });

// Gezilecek sayfalar (arama motoru sonuçlarından bilinenler + ana sayfadan keşfedilecekler)
const SEED = ['/', '/kampanyalar', '/restoranlar', '/kfc-lezzetleri', '/menu', '/menu/firsatlar', '/menu/kovalar',
  '/menu/burgerler', '/menu/wrapler', '/menu/kutular', '/menu/sosla-tavuklar', '/menu/yan-urunler-ve-tatlilar',
  '/menu/icecekler', '/kampanya/lezzet-carki', '/kampanya/haftanin-lezzet-firsatlari', '/kfc-hakkinda',
  '/hd-holding-hakkinda', '/hikayemiz', '/degerlerimiz'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'x';
const abs = (u, base = BASE) => { try { return new URL(u, base).toString(); } catch { return null; } };
const sameSite = (u) => { try { return new URL(u).hostname.replace(/^www\./, '').endsWith('kfcturkiye.com'); } catch { return false; } };
const extFromType = (ct, url) => {
  ct = String(ct || '').toLowerCase();
  const map = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif',
    'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov', 'application/vnd.apple.mpegurl': 'm3u8', 'font/woff2': 'woff2', 'font/woff': 'woff', 'font/ttf': 'ttf', 'application/font-woff2': 'woff2', 'application/font-woff': 'woff', 'font/otf': 'otf' };
  for (const k of Object.keys(map)) if (ct.startsWith(k)) return map[k];
  const m = String(url).match(/\.(jpe?g|png|webp|gif|svg|avif|mp4|webm|mov|m3u8|woff2?|ttf|otf)(\?|#|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : (ct.startsWith('image/') ? 'img' : ct.startsWith('video/') ? 'mp4' : 'bin');
};

const manifest = { base: BASE, fetchedAt: new Date().toISOString(), pages: [], media: [], videos: [], fonts: [], api: [], theme: { fonts: [], colors: [] }, errors: [] };
const media = new Map(); // url -> {url, kind, contentType, alt, pages:Set, attrs}
const apiBodies = new Map();
const noteMedia = (url, kind, extra = {}, page = '') => {
  if (!url) return; url = url.trim();
  if (url.startsWith('data:')) {
    if (url.length > 300000) return;
    const key = 'data:' + hash(url); const m = media.get(key) || { url: key, kind, dataUri: url, pages: new Set(), attrs: {} };
    Object.assign(m.attrs, extra); if (page) m.pages.add(page); media.set(key, m); return;
  }
  if (isArchiveInfra(url)) return;
  const ts = tsOf(url); if (ts && !cdxTs.has(orig(url))) cdxTs.set(orig(url), ts);
  const a = abs(orig(url)); if (!a || !/^https?:/.test(a)) return;
  if (/web\.archive\.org/i.test(a)) return;
  const m = media.get(a) || { url: a, kind, pages: new Set(), attrs: {} };
  if (kind === 'video' || kind === 'poster') m.kind = kind === 'poster' ? (m.kind === 'video' ? 'video' : 'image') : kind;
  Object.assign(m.attrs, extra); if (page) m.pages.add(page); media.set(a, m);
};

(async () => {
  const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled', '--autoplay-policy=no-user-gesture-required'] });
  const ctx = await browser.newContext({ userAgent: UA, locale: 'tr-TR', timezoneId: 'Europe/Istanbul', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
  const cssTexts = new Map();
  ctx.on('response', async (res) => {
    try {
      const req = res.request(); const t = req.resourceType(); const url = res.url(); const ct = res.headers()['content-type'] || '';
      const pg = req.frame() && req.frame().url();
      if (t === 'image' || ct.startsWith('image/')) noteMedia(url, 'image', { contentType: ct, via: 'network' }, pg);
      else if (t === 'media' || ct.startsWith('video/') || /\.(mp4|webm|m3u8|mov)(\?|$)/i.test(url)) noteMedia(url, 'video', { contentType: ct, via: 'network' }, pg);
      else if (t === 'font' || /font/.test(ct) || /\.(woff2?|ttf|otf)(\?|$)/i.test(url)) noteMedia(url, 'font', { contentType: ct, via: 'network' }, pg);
      else if (t === 'stylesheet' || ct.includes('text/css')) { if (!cssTexts.has(url) && res.ok()) cssTexts.set(url, await res.text().catch(() => '')); }
      else if ((t === 'xhr' || t === 'fetch') && /json/.test(ct) && res.ok()) {
        if (!apiBodies.has(url) && apiBodies.size < 60) { const b = await res.text().catch(() => ''); if (b && b.length < 3e6) apiBodies.set(url, b); }
      }
    } catch { /* yoksay */ }
  });

  // Hangi alan adı yanıt veriyor? (coğrafi engel 403 döndürüyor)
  for (const h of HOSTS) {
    try { const r = await ctx.request.get(h + '/', { timeout: 30000, maxRedirects: 3 }); hostStatus[h] = r.status(); console.log(`sonda ${h} → ${r.status()} ${r.headers()['server'] || ''}`); if (r.status() === 403) { const t = await r.text().catch(() => ''); manifest.blockedBody = manifest.blockedBody || t.slice(0, 600); manifest.blockedHeaders = manifest.blockedHeaders || r.headers(); } }
    catch (e) { hostStatus[h] = 'ERR ' + e.message.split('\n')[0]; console.log(`sonda ${h} → ${hostStatus[h]}`); }
  }
  manifest.hostStatus = hostStatus;
  const live = HOSTS.find((h) => typeof hostStatus[h] === 'number' && hostStatus[h] < 400);
  if (live) { BASE = live; console.log(`canlı erişim: ${BASE}`); }
  else { archiveMode = true; console.log('Canlı site engelli → Wayback Machine arşivi kullanılacak'); }
  manifest.base = BASE; manifest.archiveMode = archiveMode;

  // Wayback CDX dizini: alan adı (alt alan adları dahil) için arşivlenmiş görsel/video/font/sayfa adresleri
  async function cdx(q) { const u = `${WB}/cdx/search/cdx?${q}`; const r = await ctx.request.get(u, { timeout: 180000 }); if (!r.ok()) throw new Error(`CDX ${r.status()}`); const t = await r.text(); return t.trim() ? JSON.parse(t) : []; }
  const cdxRows = [];
  for (const [label, filt] of [['image', 'filter=mimetype:image/.*'], ['video', 'filter=mimetype:video/.*'], ['video2', 'filter=original:.*\\.(mp4|webm|m3u8).*'], ['font', 'filter=mimetype:.*font.*'], ['font2', 'filter=original:.*\\.(woff2?|ttf|otf)(\\?.*)?$'], ['html', 'filter=mimetype:text/html']]) {
    try {
      const rows = await cdx(`url=kfcturkiye.com&matchType=domain&output=json&fl=timestamp,original,mimetype,statuscode,length&filter=statuscode:200&${filt}&from=2025&limit=6000`);
      console.log(`CDX ${label}: ${Math.max(0, rows.length - 1)} kayıt`);
      for (const row of rows.slice(1)) cdxRows.push({ label, ts: row[0], url: row[1], mime: row[2], len: +row[4] || 0 });
    } catch (e) { manifest.errors.push(`CDX ${label}: ${e.message}`); console.log(`CDX ${label} hata: ${e.message}`); }
  }
  // Her adres için en yeni zaman damgası
  for (const r of cdxRows) { const prev = cdxTs.get(r.url); if (!prev || r.ts > prev) cdxTs.set(r.url, r.ts); }
  const cdxPages = [...new Map(cdxRows.filter((r) => r.label === 'html').map((r) => [r.url, r])).values()];
  manifest.cdx = { counts: Object.fromEntries(['image', 'video', 'video2', 'font', 'font2', 'html'].map((l) => [l, cdxRows.filter((r) => r.label === l).length])), pages: cdxPages.map((r) => ({ url: r.url, ts: cdxTs.get(r.url) })).slice(0, 400) };
  for (const r of cdxRows) { if (r.label === 'html') continue; noteMedia(r.url, r.label.startsWith('video') ? 'video' : r.label.startsWith('font') ? 'font' : 'image', { via: 'cdx', mime: r.mime, archiveLen: r.len }); }
  const homeRow = cdxPages.filter((r) => /^https?:\/\/(www\.)?kfcturkiye\.com\/?$/.test(r.url)).sort((a, b) => (cdxTs.get(b.url) > cdxTs.get(a.url) ? 1 : -1))[0];
  homeTs = homeRow ? cdxTs.get(homeRow.url) : '2026';
  manifest.homeTs = homeTs;
  // Arşivde görülen menü/kampanya sayfalarını gezinti kuyruğuna ekle
  const extraPaths = cdxPages.map((r) => { try { return new URL(r.url).pathname.replace(/\/$/, '') || '/'; } catch { return null; } }).filter((p) => p && /^\/(menu|kampanya|urun|lezzet|kova|restoran)/i.test(p));
  const page = await ctx.newPage();
  const visited = new Set(); const queue = [...SEED, ...[...new Set(extraPaths)].slice(0, 25)];
  const discovered = new Set();
  while (queue.length && visited.size < 40) {
    const p = queue.shift(); if (visited.has(p)) continue; visited.add(p);
    const url = BASE + p; const rec = { path: p, url, status: null };
    const navUrl = archiveMode ? `${WB}/web/${homeTs}/${url}` : url;
    console.log(`→ ${navUrl}`);
    try {
      const res = await page.goto(navUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      rec.status = res ? res.status() : null; rec.finalUrl = orig(page.url()); rec.archived = archiveMode; rec.archiveTs = tsOf(page.url());
      if (archiveMode && rec.status === 404) { rec.error = 'arşivde yok'; manifest.pages.push(rec); console.log('  ✗ arşivde yok'); continue; }
      if (archiveMode) await page.evaluate(() => { const t = document.getElementById('wm-ipp-base'); if (t) t.remove(); const s = document.getElementById('wm-ipp-print'); if (s) s.remove(); document.querySelectorAll('#donato, #wm-ipp').forEach((e) => e.remove()); }).catch(() => {});
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await sleep(1200);
      // Çerez uyarısını kapatmayı dene
      for (const sel of ['button:has-text("Kabul")', 'button:has-text("Tümünü Kabul")', 'button:has-text("Accept")', '#onetrust-accept-btn-handler', '.cookie button', '[class*="cookie"] button']) {
        try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 500 })) { await b.click({ timeout: 1500 }); await sleep(500); break; } } catch { /* yok */ }
      }
      // Tembel yüklemeleri tetiklemek için kaydır
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < Math.min(total, 12000); y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await sleep(180); }
      await page.evaluate(() => window.scrollTo(0, 0)); await sleep(800);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      // Slider/karusel varsa birkaç adım ilerlet (yeni görseller yüklensin)
      for (let i = 0; i < 6; i++) {
        const clicked = await page.evaluate(() => {
          const cand = [...document.querySelectorAll('button, a, div')].filter((e) => /next|sonraki|ileri|swiper-button-next|slick-next|arrow-right|carousel-control-next/i.test(e.className + ' ' + (e.getAttribute('aria-label') || '')));
          const v = cand.find((e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
          if (v) { v.click(); return true; } return false;
        }).catch(() => false);
        if (!clicked) break; await sleep(700);
      }
      // DOM'dan varlıkları topla
      const dom = await page.evaluate(() => {
        const q = (s) => [...document.querySelectorAll(s)];
        const rect = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
        const imgs = [...document.images].map((i) => ({ src: i.currentSrc || i.src, srcset: i.srcset || i.getAttribute('data-srcset') || '', dataSrc: i.getAttribute('data-src') || i.getAttribute('data-lazy') || i.getAttribute('data-original') || '', alt: i.alt || '', cls: String(i.className).slice(0, 120), nw: i.naturalWidth, nh: i.naturalHeight, box: rect(i), inHeader: !!i.closest('header,nav,.header,.navbar,[class*="header"],[class*="logo"]'), inFooter: !!i.closest('footer,[class*="footer"]') }));
        const sources = q('picture source, video source').map((s) => ({ src: s.src || s.getAttribute('src') || '', srcset: s.srcset || s.getAttribute('data-srcset') || '', type: s.type || '', parent: s.parentElement && s.parentElement.tagName }));
        const videos = q('video').map((v) => ({ src: v.currentSrc || v.src || v.getAttribute('data-src') || '', poster: v.poster || '', autoplay: v.autoplay, loop: v.loop, muted: v.muted, w: v.videoWidth, h: v.videoHeight, dur: v.duration, box: rect(v), sources: [...v.querySelectorAll('source')].map((s) => s.src || s.getAttribute('src') || '') }));
        const iframes = q('iframe').map((f) => ({ src: f.src, box: rect(f) })).filter((f) => f.src);
        const bgs = []; const all = q('*'); const lim = Math.min(all.length, 6000);
        for (let i = 0; i < lim; i++) { const cs = getComputedStyle(all[i]); const bi = cs.backgroundImage; if (bi && bi !== 'none') { for (const m of bi.matchAll(/url\((['"]?)(.*?)\1\)/g)) bgs.push({ src: m[2], box: rect(all[i]), cls: String(all[i].className).slice(0, 120), tag: all[i].tagName }); } }
        const lazyAttrs = q('[data-src],[data-lazy],[data-bg],[data-background],[data-background-image],[data-original]').map((e) => ({ src: e.getAttribute('data-src') || e.getAttribute('data-lazy') || e.getAttribute('data-bg') || e.getAttribute('data-background') || e.getAttribute('data-background-image') || e.getAttribute('data-original'), tag: e.tagName, cls: String(e.className).slice(0, 120) })).filter((e) => e.src);
        const svgs = q('header svg, nav svg, [class*="logo"] svg, a[href="/"] svg, .navbar svg').slice(0, 12).map((s) => ({ html: s.outerHTML.slice(0, 40000), box: rect(s), cls: String(s.getAttribute('class') || '').slice(0, 120), parentCls: String(s.parentElement && s.parentElement.className || '').slice(0, 120) }));
        const icons = q('link[rel*="icon"], link[rel="apple-touch-icon"]').map((l) => ({ href: l.href, rel: l.rel, sizes: l.getAttribute('sizes') || '' }));
        const meta = {}; for (const m of q('meta[property^="og:"], meta[name^="twitter:"], meta[name="description"], meta[name="theme-color"]')) meta[m.getAttribute('property') || m.getAttribute('name')] = m.getAttribute('content');
        const texts = { h1: q('h1').map((e) => e.innerText.trim()).filter(Boolean).slice(0, 20), h2: q('h2').map((e) => e.innerText.trim()).filter(Boolean).slice(0, 40), h3: q('h3').map((e) => e.innerText.trim()).filter(Boolean).slice(0, 60), buttons: q('button, a.btn, [class*="btn"], [class*="button"]').map((e) => e.innerText.trim()).filter((t) => t && t.length < 60).slice(0, 60), strong: q('strong, b, [class*="title"], [class*="slogan"], [class*="headline"]').map((e) => e.innerText.trim()).filter((t) => t && t.length < 120).slice(0, 80) };
        const fonts = {}; for (const sel of ['body', 'h1', 'h2', 'h3', 'p', 'button', 'a', '[class*="title"]', '[class*="price"]']) { const e = document.querySelector(sel); if (e) { const cs = getComputedStyle(e); fonts[sel] = { family: cs.fontFamily, weight: cs.fontWeight, size: cs.fontSize, color: cs.color, bg: cs.backgroundColor, transform: cs.textTransform }; } }
        const colorHits = {}; for (const e of q('button, a, header, nav, footer, [class*="btn"], [class*="badge"], [class*="tag"], [class*="price"], section, [class*="hero"], [class*="banner"]').slice(0, 400)) { const cs = getComputedStyle(e); for (const c of [cs.backgroundColor, cs.color, cs.borderColor]) { if (c && !/rgba\(0, 0, 0, 0\)/.test(c)) colorHits[c] = (colorHits[c] || 0) + 1; } }
        const links = [...new Set(q('a[href]').map((a) => a.href).filter((h) => /^https?:/.test(h)))].slice(0, 300);
        const jsonld = q('script[type="application/ld+json"]').map((s) => s.textContent.slice(0, 20000));
        const cssLinks = [...document.styleSheets].map((s) => s.href).filter(Boolean);
        return { title: document.title, imgs, sources, videos, iframes, bgs, lazyAttrs, svgs, icons, meta, texts, fonts, colorHits, links, jsonld, cssLinks, scrollHeight: document.documentElement.scrollHeight };
      });
      Object.assign(rec, { title: dom.title, meta: dom.meta, texts: dom.texts, fonts: dom.fonts, colorHits: dom.colorHits, videos: dom.videos, iframes: dom.iframes, icons: dom.icons, jsonld: dom.jsonld, cssLinks: dom.cssLinks, scrollHeight: dom.scrollHeight, imgCount: dom.imgs.length });
      for (const i of dom.imgs) { noteMedia(i.src, 'image', { alt: i.alt, cls: i.cls, box: i.box, inHeader: i.inHeader, inFooter: i.inFooter, rendered: [i.nw, i.nh], via: 'img' }, p); if (i.dataSrc) noteMedia(i.dataSrc, 'image', { alt: i.alt, via: 'data-src' }, p); for (const s of String(i.srcset).split(',')) { const u = s.trim().split(/\s+/)[0]; if (u) noteMedia(u, 'image', { alt: i.alt, via: 'srcset' }, p); } }
      for (const s of dom.sources) { for (const u of [s.src, ...String(s.srcset).split(',').map((x) => x.trim().split(/\s+/)[0])]) if (u) noteMedia(u, s.parent === 'VIDEO' ? 'video' : 'image', { via: 'source', type: s.type }, p); }
      for (const v of dom.videos) { for (const u of [v.src, ...v.sources]) if (u) noteMedia(u, 'video', { via: 'video', poster: v.poster, autoplay: v.autoplay, loop: v.loop, box: v.box, dur: v.dur, size: [v.w, v.h] }, p); if (v.poster) noteMedia(v.poster, 'poster', { via: 'poster' }, p); }
      for (const b of dom.bgs) noteMedia(b.src, /\.(mp4|webm)(\?|$)/i.test(b.src) ? 'video' : 'image', { via: 'css-bg', box: b.box, cls: b.cls, tag: b.tag }, p);
      for (const l of dom.lazyAttrs) noteMedia(l.src, 'image', { via: 'data-attr', cls: l.cls, tag: l.tag }, p);
      for (const ic of dom.icons) noteMedia(ic.href, 'image', { via: 'icon', rel: ic.rel, sizes: ic.sizes }, p);
      for (const k of ['og:image', 'twitter:image']) if (dom.meta[k]) noteMedia(dom.meta[k], 'image', { via: k }, p);
      dom.svgs.forEach((s, i) => { const f = path.join(out, dirs.svg, `${slug(p) || 'home'}-${i}-${hash(s.html)}.svg`); fs.writeFileSync(f, s.html); rec.svgs = rec.svgs || []; rec.svgs.push({ file: path.relative(out, f), box: s.box, cls: s.cls, parentCls: s.parentCls }); });
      // Aynı sitedeki menü/kampanya bağlantılarını kuyruğa ekle
      for (const l0 of dom.links) { const l = orig(l0); if (!sameSite(l)) continue; const u = new URL(l); const pp = u.pathname.replace(/\/$/, '') || '/'; if (/^\/(menu|kampanya|urun|product|lezzet)/i.test(pp) && !visited.has(pp) && !queue.includes(pp) && discovered.size < 20) { discovered.add(pp); queue.push(pp); } }
      rec.links = dom.links.map(orig).filter(sameSite).slice(0, 150);
      // Ekran görüntüsü (tam sayfa)
      const shot = path.join(out, dirs.screens, `${p === '/' ? 'home' : slug(p)}.jpg`);
      await page.screenshot({ path: shot, fullPage: true, type: 'jpeg', quality: 70 }).catch(async (e) => { manifest.errors.push(`screenshot ${p}: ${e.message}`); await page.screenshot({ path: shot, type: 'jpeg', quality: 70 }).catch(() => {}); });
      rec.screenshot = path.relative(out, shot);
      // Görünür alan (üst 900px) ayrı
      const top = path.join(out, dirs.screens, `${p === '/' ? 'home' : slug(p)}-top.jpg`);
      await page.screenshot({ path: top, type: 'jpeg', quality: 80 }).catch(() => {});
      rec.screenshotTop = path.relative(out, top);
    } catch (e) { rec.error = e.message; manifest.errors.push(`${p}: ${e.message}`); console.log(`  ✗ ${e.message}`); }
    manifest.pages.push(rec);
  }

  // CSS'ten font-face ve renkler
  const colorCount = {}; const fontFaces = [];
  for (const [u, css] of cssTexts) {
    for (const m of css.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) { const c = m[0].toLowerCase(); colorCount[c] = (colorCount[c] || 0) + 1; }
    for (const m of css.matchAll(/@font-face\s*{([^}]*)}/gi)) { const b = m[1]; const fam = (b.match(/font-family\s*:\s*(['"]?)([^;'"]+)\1/i) || [])[2]; const src = [...b.matchAll(/url\((['"]?)(.*?)\1\)/g)].map((x) => abs(x[2], u)); const w = (b.match(/font-weight\s*:\s*([^;]+)/i) || [])[1]; fontFaces.push({ family: fam, weight: w, src }); for (const s of src) noteMedia(s, 'font', { family: fam, weight: w, via: 'font-face' }); }
  }
  manifest.theme.colors = Object.entries(colorCount).sort((a, b) => b[1] - a[1]).slice(0, 40).map(([hex, count]) => ({ hex, count }));
  manifest.theme.fontFaces = fontFaces;
  manifest.theme.cssFiles = [...cssTexts.keys()];
  for (const [u, css] of cssTexts) { const f = path.join(out, dirs.api, 'css-' + slug(path.basename(new URL(u).pathname)) + '-' + hash(u) + '.css'); fs.writeFileSync(f, css); }

  // API/JSON gövdeleri
  for (const [u, body] of apiBodies) { const f = path.join(out, dirs.api, slug(new URL(u).pathname) + '-' + hash(u) + '.json'); fs.writeFileSync(f, body); manifest.api.push({ url: u, file: path.relative(out, f), bytes: body.length }); for (const m of body.matchAll(/https?:\\?\/\\?\/[^"'\s\\]+\.(?:jpe?g|png|webp|mp4|webm)/gi)) noteMedia(m[0].replace(/\\\//g, '/'), /\.(mp4|webm)$/i.test(m[0]) ? 'video' : 'image', { via: 'api' }); }

  // İndir – öncelik: sayfada görülenler → arşiv dizinindeki büyük dosyalar; küçük ikonlar ve süre bütçesi dışı kalanlar atlanır
  const BUDGET = (+args['budget-min'] || 20) * 60000; const MAX_CDX_IMG = +args['max-cdx-img'] || 450; const t0 = Date.now();
  let total = 0; let idx = 0;
  const seenOnPage = (m) => m.pages.size > 0 || (m.attrs.via && m.attrs.via !== 'cdx');
  const all = [...media.values()];
  const primary = all.filter(seenOnPage);
  const cdxOnly = all.filter((m) => !seenOnPage(m)).filter((m) => m.kind !== 'image' || (m.attrs.archiveLen || 0) >= 2500 || /logo/i.test(m.url)).sort((a, b) => (b.attrs.archiveLen || 0) - (a.attrs.archiveLen || 0));
  const list = [...primary, ...cdxOnly.filter((m) => m.kind !== 'image').concat(cdxOnly.filter((m) => m.kind === 'image').slice(0, MAX_CDX_IMG))];
  manifest.candidates = { total: all.length, onPage: primary.length, cdxOnly: cdxOnly.length, queued: list.length };
  console.log(`\n${all.length} varlık adayı (${primary.length} sayfada görülen, ${cdxOnly.length} yalnız dizinde); ${list.length} tanesi indiriliyor…`);
  for (const m of list) {
    idx++;
    if (Date.now() - t0 > BUDGET) { manifest.media.push({ id: idx, url: m.url, kind: m.kind, skipped: 'süre bütçesi' }); continue; }
    if (idx % 50 === 0) { console.log(`  … ${idx}/${list.length} (${((Date.now() - t0) / 60000).toFixed(1)} dk, ${(total / 1048576).toFixed(1)} MB)`); fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 1)); }
    const rec = { id: idx, url: m.url, kind: m.kind, pages: [...m.pages].map((x) => { try { return new URL(x).pathname; } catch { return x; } }), ...m.attrs };
    try {
      let buf; let ct = m.attrs.contentType || '';
      if (m.dataUri) { const mm = m.dataUri.match(/^data:([^;,]+)(;base64)?,(.*)$/s); if (!mm) throw new Error('data uri'); ct = mm[1]; buf = mm[2] ? Buffer.from(mm[3], 'base64') : Buffer.from(decodeURIComponent(mm[3])); }
      else {
        let r = null; let host = null; try { host = new URL(m.url).origin; } catch { /* yok */ }
        const hostBlocked = host && Object.keys(hostStatus).some((h) => h === host && hostStatus[h] === 403);
        if (!hostBlocked) { try { r = await ctx.request.get(m.url, { timeout: 90000, headers: { referer: BASE + '/' }, maxRedirects: 5 }); rec.status = r.status(); if (!r.ok()) r = null; else rec.source = 'live'; } catch (e) { rec.liveError = e.message.split('\n')[0]; r = null; } }
        if (!r) {
          const ts = cdxTs.get(m.url) || cdxTs.get(m.url.replace(/^http:/, 'https:')) || homeTs || '2026';
          const au = `${WB}/web/${ts}id_/${m.url}`;
          for (let attempt = 0; attempt < 2 && !r; attempt++) {
            try { const rr = await ctx.request.get(au, { timeout: 120000, maxRedirects: 8 }); rec.archiveStatus = rr.status(); if (rr.status() === 429) { await sleep(8000); continue; } if (rr.ok()) { r = rr; rec.source = 'archive'; rec.archiveTs = ts; } else break; }
            catch (e) { rec.archiveError = e.message.split('\n')[0]; }
          }
          await sleep(120);
        }
        if (!r) throw new Error(`HTTP ${rec.status || ''}${rec.archiveStatus ? ' arşiv ' + rec.archiveStatus : ''}`.trim());
        ct = r.headers()['content-type'] || ct; buf = await r.body();
        if (/text\/html/i.test(ct) && !/svg/i.test(ct)) throw new Error('HTML döndü (varlık değil)');
      }
      const ext = extFromType(ct, m.url);
      const kind = m.kind === 'font' ? 'font' : (/^(mp4|webm|mov|m3u8)$/.test(ext) ? 'video' : (/^(woff2?|ttf|otf)$/.test(ext) ? 'font' : 'image'));
      if (kind === 'video' && buf.length > MAX_VIDEO) { rec.skipped = `video ${(buf.length / 1048576).toFixed(1)} MB > sınır`; manifest.media.push(rec); console.log(`  ⤫ ${m.url} (${rec.skipped})`); continue; }
      if (total + buf.length > MAX_TOTAL) { rec.skipped = 'toplam sınır'; manifest.media.push(rec); continue; }
      total += buf.length;
      const baseName = slug(path.basename(new URL(m.dataUri ? 'https://x/inline' : m.url).pathname).replace(/\.[a-z0-9]+$/i, '')) || 'asset';
      const dir = kind === 'video' ? dirs.video : kind === 'font' ? dirs.fonts : dirs.img;
      const file = path.join(out, dir, `${String(idx).padStart(3, '0')}-${baseName}.${ext}`);
      fs.writeFileSync(file, buf);
      Object.assign(rec, { file: path.relative(out, file), bytes: buf.length, contentType: ct, ext, kind });
      manifest.media.push(rec);
    } catch (e) { rec.error = e.message; manifest.media.push(rec); console.log(`  ✗ ${m.url}: ${e.message}`); }
  }

  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
  // Görsel boyutları
  const probe = await ctx.newPage();
  for (const r of manifest.media) {
    if (r.kind !== 'image' || !r.file) continue;
    try {
      const buf = fs.readFileSync(path.join(out, r.file));
      const dataUrl = `data:${r.contentType && r.contentType.split(';')[0] || 'image/' + r.ext};base64,${buf.toString('base64')}`;
      const dim = await probe.evaluate((u) => new Promise((res) => { const i = new Image(); i.onload = () => res([i.naturalWidth, i.naturalHeight]); i.onerror = () => res(null); i.src = u; }), dataUrl);
      if (dim) { r.w = dim[0]; r.h = dim[1]; }
      // Şeffaflık kontrolü (PNG/WebP/SVG için köşe pikselleri)
      if (dim && /^(png|webp|svg|gif|avif)$/.test(r.ext)) {
        r.transparent = await probe.evaluate((u) => new Promise((res) => { const i = new Image(); i.onload = () => { try { const c = document.createElement('canvas'); c.width = 24; c.height = 24; const x = c.getContext('2d'); x.drawImage(i, 0, 0, 24, 24); const d = x.getImageData(0, 0, 24, 24).data; let t = 0; for (let k = 3; k < d.length; k += 4) if (d[k] < 250) t++; res(t / (d.length / 4)); } catch { res(null); } }; i.onerror = () => res(null); i.src = u; }), dataUrl);
      }
    } catch (e) { r.dimError = e.message; }
  }

  // Videolar: ffprobe + kareler + 970x250 ve 1280 genişlikte H.264 türevleri
  const hasFf = (() => { try { execSync('ffmpeg -version', { stdio: 'ignore' }); return true; } catch { return false; } })();
  for (const r of manifest.media) {
    if (r.kind !== 'video' || !r.file) continue;
    const f = path.join(out, r.file); const v = { id: r.id, url: r.url, file: r.file, bytes: r.bytes, frames: [], derived: {} };
    if (hasFf) {
      try { const p = JSON.parse(execSync(`ffprobe -v error -show_entries format=duration:stream=width,height,codec_name,codec_type -of json "${f}"`).toString()); v.duration = +(p.format && p.format.duration) || null; const vs = (p.streams || []).find((s) => s.codec_type === 'video'); if (vs) { v.w = vs.width; v.h = vs.height; v.codec = vs.codec_name; } v.hasAudio = (p.streams || []).some((s) => s.codec_type === 'audio'); } catch (e) { v.probeError = e.message; }
      const d = v.duration || 8; const stem = f.replace(/\.[a-z0-9]+$/i, '');
      for (const [tag, t] of [['a', Math.min(0.5, d)], ['b', d * 0.25], ['c', d * 0.5], ['d', d * 0.75]]) {
        const o = `${stem}-frame-${tag}.jpg`;
        const rr = spawnSync('ffmpeg', ['-y', '-v', 'error', '-ss', String(t.toFixed(2)), '-i', f, '-frames:v', '1', '-vf', 'scale=640:-2', '-q:v', '4', o]);
        if (rr.status === 0 && fs.existsSync(o)) v.frames.push(path.relative(out, o));
      }
      if (v.w && v.h) {
        // 970x250 kapsayacak şekilde ölçekle + ortadan kırp, ilk 12 sn, sessiz
        const o1 = `${stem}-970x250.mp4`;
        const r1 = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', f, '-t', '12', '-an', '-vf', 'scale=970:250:force_original_aspect_ratio=increase,crop=970:250,fps=25', '-c:v', 'libx264', '-preset', 'slow', '-crf', '26', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', o1]);
        if (r1.status === 0) v.derived['970x250'] = { file: path.relative(out, o1), bytes: fs.statSync(o1).size }; else v.derivedError = String(r1.stderr);
        // Aynı kesim VP9/WebM (yerel Chromium H.264 çözemediği için önizleme/test; isteğe bağlı yedek kaynak)
        const o1w = `${stem}-970x250.webm`;
        const r1w = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', f, '-t', '12', '-an', '-vf', 'scale=970:250:force_original_aspect_ratio=increase,crop=970:250,fps=25', '-c:v', 'libvpx-vp9', '-b:v', '0', '-crf', '34', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', o1w]);
        if (r1w.status === 0) v.derived['970x250-webm'] = { file: path.relative(out, o1w), bytes: fs.statSync(o1w).size };
        const o2 = `${stem}-1280.mp4`;
        const r2 = spawnSync('ffmpeg', ['-y', '-v', 'error', '-i', f, '-t', '12', '-an', '-vf', 'scale=1280:-2,fps=25', '-c:v', 'libx264', '-preset', 'slow', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', o2]);
        if (r2.status === 0) v.derived['1280'] = { file: path.relative(out, o2), bytes: fs.statSync(o2).size };
      }
    }
    manifest.videos.push(v);
  }

  // Kontak sayfaları (görsel dizini): her sayfada 40 küçük resim, etiketli
  const imgs = manifest.media.filter((r) => r.kind === 'image' && r.file && (r.w || 0) >= 24 && (r.h || 0) >= 24).sort((a, b) => (b.w * b.h) - (a.w * a.h));
  const per = 40;
  for (let s = 0; s * per < imgs.length; s++) {
    const chunk = imgs.slice(s * per, (s + 1) * per);
    const cells = chunk.map((r) => { const b = fs.readFileSync(path.join(out, r.file)); const u = `data:${(r.contentType || '').split(';')[0] || 'image/' + r.ext};base64,${b.toString('base64')}`; return `<div class="c"><div class="t" style="background-image:url('${u}')"></div><div class="l"><b>#${r.id}</b> ${path.basename(r.file)}<br>${r.w}×${r.h} · ${(r.bytes / 1024).toFixed(0)} KB${r.transparent ? ' · şeffaf' : ''}<br><i>${(r.alt || '').slice(0, 40)}</i> ${(r.pages || []).slice(0, 2).join(' ')}</div></div>`; }).join('');
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;font:11px/1.3 Arial,sans-serif;color:#111}.g{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;padding:8px;width:1400px}.c{border:1px solid #ddd}.t{height:170px;background:#eee url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="8" height="8" fill="%23ccc"/><rect x="8" y="8" width="8" height="8" fill="%23ccc"/></svg>') ;background-size:contain;background-repeat:no-repeat;background-position:center}.l{padding:4px 6px;height:52px;overflow:hidden;word-break:break-all}</style><div class="g">${cells}</div>`;
    await probe.setContent(html, { waitUntil: 'load' }); await sleep(600);
    await probe.screenshot({ path: path.join(out, `contact-${s + 1}.jpg`), fullPage: true, type: 'jpeg', quality: 80 });
    manifest.contactSheets = (manifest.contactSheets || []).concat(`contact-${s + 1}.jpg`);
  }
  const vframes = manifest.videos.flatMap((v) => v.frames.map((fr) => ({ v, fr })));
  if (vframes.length) {
    const cells = vframes.map(({ v, fr }) => { const b = fs.readFileSync(path.join(out, fr)); return `<div class="c"><div class="t" style="background-image:url('data:image/jpeg;base64,${b.toString('base64')}')"></div><div class="l"><b>#${v.id}</b> ${path.basename(v.file)}<br>${v.w}×${v.h} · ${(v.duration || 0).toFixed(1)} sn · ${(v.bytes / 1048576).toFixed(1)} MB<br>${path.basename(fr)}</div></div>`; }).join('');
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;font:11px/1.3 Arial,sans-serif;color:#111}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px;width:1400px}.c{border:1px solid #ddd}.t{height:190px;background:#000;background-size:contain;background-repeat:no-repeat;background-position:center}.l{padding:4px 6px;height:52px;overflow:hidden;word-break:break-all}</style><div class="g">${cells}</div>`;
    await probe.setContent(html, { waitUntil: 'load' }); await sleep(600);
    await probe.screenshot({ path: path.join(out, 'contact-video.jpg'), fullPage: true, type: 'jpeg', quality: 80 });
    manifest.contactSheets = (manifest.contactSheets || []).concat('contact-video.jpg');
  }

  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
  const ok = manifest.media.filter((r) => r.file);
  console.log(`\n✔ ${manifest.pages.length} sayfa, ${ok.filter((r) => r.kind === 'image').length} görsel, ${ok.filter((r) => r.kind === 'video').length} video, ${ok.filter((r) => r.kind === 'font').length} font (${ok.filter((r) => r.source === 'archive').length} arşivden, ${ok.filter((r) => r.source === 'live').length} canlı) — ${(total / 1048576).toFixed(1)} MB → assets/kfc/`);
  if (manifest.errors.length) console.log('Uyarılar:', manifest.errors.slice(0, 20));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
