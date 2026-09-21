#!/usr/bin/env node
'use strict';
/**
 * turkiyesigorta.com.tr üzerindeki gerçek marka varlıklarını toplar: logo (SVG/PNG/ZIP),
 * sayfa görselleri (hero/kampanya/ürün), CSS arka planları, renkler, fontlar, metinler ve
 * sayfa ekran görüntüleri. Sayfalar gerçek bir tarayıcıda (Playwright + Chromium) açılır.
 *
 * Claude Code'un bulut oturumu siteye erişemediği için bu betik GitHub Actions'ta çalışır
 * (.github/workflows/fetch-assets.yml → task: turkiyesigorta). Canlı site 403 verirse
 * Wayback Machine arşivine düşer.
 *
 * Çıktı: assets/site/manifest.json, report.md, screens/, img/, svg/, logo/, sheets/ (kontak sayfaları)
 * Kullanım: node tools/fetch-site.js [--hosts=a,b] [--max-img=90] [--min-w=360] [--out=assets/site]
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const HOSTS = String(args.hosts || 'https://www.turkiyesigorta.com.tr,https://turkiyesigorta.com.tr,https://bireysel.turkiyesigorta.com.tr').split(',').map((h) => h.trim().replace(/\/$/, '')).filter(Boolean);
const WB = 'https://web.archive.org';
const MAX_IMG = +args['max-img'] || 90;
const MIN_W = +args['min-w'] || 360;
const MAX_FILE = 12 * 1024 * 1024, MAX_TOTAL = 160 * 1024 * 1024;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const root = path.join(__dirname, '..');
const out = path.resolve(root, String(args.out || 'assets/site'));
for (const d of ['screens', 'img', 'svg', 'logo', 'sheets']) fs.mkdirSync(path.join(out, d), { recursive: true });

const SEED = ['/', '/urunlerimiz', '/urunlerimiz/arac-sigortalari', '/urunlerimiz/arac-sigortalari/genisletilmis-kasko',
  '/urunlerimiz/arac-sigortalari/trafik-sigortasi', '/urunlerimiz/konut-sigortalari', '/urunlerimiz/konut-sigortalari/konut-sigortasi',
  '/urunlerimiz/konut-sigortalari/dask/1000', '/urunlerimiz/saglik-sigortalari', '/urunlerimiz/saglik-sigortalari/tamamlayici-saglik-sigortasi',
  '/urunlerimiz/saglik-sigortalari/seyahat-saglik-sigortasi', '/urunlerimiz/hayat-sigortalari', '/bireysel-emeklilik',
  '/hakkimizda', '/hakkimizda/kurumsal-iletisim/kurumsal-materyaller/logolar', '/kurumsal/kurumsal-iletisim/kurumsal-materyaller/logolar',
  '/musteri-platformu-mobil', '/aktif-kampanyalar/pesin-fiyatina-taksit-kampanyasi', '/pesin-fiyatina-taksit-kampanyasi',
  '/aktif-kampanyalar', '/musteri-iletisim-merkezi', '/hakkimizda/kurumsal-iletisim/reklam-filmleri/2023', '/hasar'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const hash = (s) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8);
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70) || 'x';
const orig = (u) => { const m = String(u || '').match(/^https?:\/\/web\.archive\.org\/web\/(\d{4,17})[a-z_]*\/(https?:\/\/.+)$/i); return m ? m[2] : u; };
const isArchiveInfra = (u) => /web\.archive\.org\/(_static|static)\/|archive\.org\/(includes|images\/|components)|analytics\.archive\.org/i.test(u);
const sameSite = (u) => { try { return new URL(u).hostname.replace(/^www\./, '').endsWith('turkiyesigorta.com.tr'); } catch { return false; } };
const extOf = (ct, url) => {
  ct = String(ct || '').toLowerCase();
  const map = { 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif', 'application/zip': 'zip', 'application/x-zip-compressed': 'zip', 'application/pdf': 'pdf', 'application/postscript': 'ai' };
  for (const k of Object.keys(map)) if (ct.startsWith(k)) return map[k];
  const m = String(url).match(/\.(jpe?g|png|webp|gif|svg|avif|zip|pdf|ai|eps)(\?|#|$)/i);
  return m ? m[1].toLowerCase().replace('jpeg', 'jpg') : 'bin';
};
const pngSize = (b) => (b.length > 24 && b.readUInt32BE(12) === 0x49484452) ? { w: b.readUInt32BE(16), h: b.readUInt32BE(20) } : null;
function jpgSize(b) { let i = 2; while (i < b.length - 9) { if (b[i] !== 0xFF) { i++; continue; } const m = b[i + 1]; if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) }; if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) { i += 2; continue; } i += 2 + b.readUInt16BE(i + 2); } return null; }
function webpSize(b) { if (b.toString('ascii', 0, 4) !== 'RIFF') return null; const t = b.toString('ascii', 12, 16); if (t === 'VP8X') return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) }; if (t === 'VP8L') { const x = b.readUInt32LE(21); return { w: 1 + (x & 0x3FFF), h: 1 + ((x >> 14) & 0x3FFF) }; } if (t === 'VP8 ') return { w: b.readUInt16LE(26) & 0x3FFF, h: b.readUInt16LE(28) & 0x3FFF }; return null; }
const imgSize = (b, ext) => ext === 'png' ? pngSize(b) : ext === 'jpg' ? jpgSize(b) : ext === 'webp' ? webpSize(b) : null;

const manifest = { fetchedAt: new Date().toISOString(), hosts: HOSTS, base: HOSTS[0], archiveMode: false, pages: [], images: [], logos: [], svgs: [], colors: {}, fonts: {}, cssVars: {}, errors: [] };
const media = new Map(); // url -> rec
const report = [];
const log = (s) => { console.log(s); report.push(s); };
let BASE = HOSTS[0]; let archiveMode = false; let totalBytes = 0;
const note = (url, extra = {}, page = '') => {
  if (!url || String(url).startsWith('data:') || isArchiveInfra(url)) return;
  let a; try { a = new URL(orig(String(url).trim()), BASE).toString(); } catch { return; }
  if (!/^https?:/.test(a) || /web\.archive\.org/.test(a)) return;
  const m = media.get(a) || { url: a, pages: new Set(), alts: new Set(), via: new Set(), box: null, natural: null, score: 0 };
  if (page) m.pages.add(page); if (extra.alt) m.alts.add(extra.alt); if (extra.via) m.via.add(extra.via);
  if (extra.box && (!m.box || extra.box.w * extra.box.h > m.box.w * m.box.h)) m.box = extra.box;
  if (extra.natural && extra.natural[0]) m.natural = extra.natural;
  if (extra.inHeader) m.inHeader = true; if (extra.inFooter) m.inFooter = true; if (extra.cls) m.cls = extra.cls; if (extra.contentType) m.contentType = extra.contentType;
  media.set(a, m);
};

(async () => {
  const browser = await chromium.launch({ args: ['--disable-blink-features=AutomationControlled'] });
  const ctx = await browser.newContext({ userAgent: UA, locale: 'tr-TR', timezoneId: 'Europe/Istanbul', viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => undefined }); });
  const netBodies = new Map(); // url -> {buf, ct}
  ctx.on('response', async (res) => {
    try {
      const req = res.request(); const t = req.resourceType(); const url = res.url(); const ct = res.headers()['content-type'] || '';
      if (!res.ok()) return;
      if (t === 'image' || ct.startsWith('image/')) {
        const pg = req.frame() && req.frame().url();
        note(url, { via: 'network', contentType: ct }, orig(pg));
        if (!netBodies.has(orig(url)) && netBodies.size < 400) { const b = await res.body().catch(() => null); if (b && b.length > 1500 && b.length < MAX_FILE) netBodies.set(orig(url), { buf: b, ct }); }
      }
    } catch { /* yoksay */ }
  });

  // Canlı erişim sondası
  const hostStatus = {};
  for (const h of HOSTS) {
    try { const r = await ctx.request.get(h + '/', { timeout: 30000, maxRedirects: 4, headers: { 'user-agent': UA, 'accept-language': 'tr-TR,tr;q=0.9' } }); hostStatus[h] = r.status(); log(`sonda ${h} → ${r.status()} ${r.headers()['server'] || ''}`); if (r.status() >= 400) manifest.blocked = manifest.blocked || { host: h, status: r.status(), body: (await r.text().catch(() => '')).slice(0, 400) }; }
    catch (e) { hostStatus[h] = 'ERR ' + e.message.split('\n')[0]; log(`sonda ${h} → ${hostStatus[h]}`); }
  }
  manifest.hostStatus = hostStatus;
  const live = HOSTS.find((h) => typeof hostStatus[h] === 'number' && hostStatus[h] < 400);
  if (live) BASE = live; else { archiveMode = true; log('Canlı site engelli → Wayback Machine arşivi kullanılacak'); }
  manifest.base = BASE; manifest.archiveMode = archiveMode;

  const page = await ctx.newPage();
  const visited = new Set(); const queue = [...SEED]; const discovered = new Set();
  const t0 = Date.now(); const BUDGET = (+args['budget-min'] || 14) * 60000;
  while (queue.length && visited.size < (+args['max-pages'] || 34)) {
    if (Date.now() - t0 > BUDGET) { manifest.errors.push('sayfa süre bütçesi doldu: ' + queue.slice(0, 20).join(' ')); break; }
    const p = queue.shift(); if (visited.has(p)) continue; visited.add(p);
    const url = /^https?:/.test(p) ? p : BASE + p; const rec = { path: p, url, status: null };
    const navUrl = archiveMode ? `${WB}/web/2026/${url}` : url;
    log(`\n## ${navUrl}`);
    try {
      const res = await page.goto(navUrl, { waitUntil: 'domcontentloaded', timeout: 90000 });
      rec.status = res ? res.status() : null; rec.finalUrl = orig(page.url());
      if (rec.status && rec.status >= 400) { rec.error = 'HTTP ' + rec.status; manifest.pages.push(rec); log(`- HTTP ${rec.status}`); continue; }
      if (archiveMode) await page.evaluate(() => { document.querySelectorAll('#wm-ipp-base,#wm-ipp-print,#donato,#wm-ipp').forEach((e) => e.remove()); }).catch(() => {});
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      await sleep(1200);
      for (const sel of ['button:has-text("Kabul Et")', 'button:has-text("Kabul")', 'button:has-text("Tümünü Kabul")', 'button:has-text("Accept")', '#onetrust-accept-btn-handler', '[id*="cookie"] button', '[class*="cookie"] button', 'a:has-text("Kabul")']) {
        try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 400 })) { await b.click({ timeout: 1500 }); await sleep(500); break; } } catch { /* yok */ }
      }
      // hero ekran görüntüsü (viewport) + tam sayfa
      const shotV = path.join(out, 'screens', `${slug(p === '/' ? 'home' : p)}-hero.jpg`);
      await page.screenshot({ path: shotV, type: 'jpeg', quality: 74 }).catch(() => {});
      const total = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < Math.min(total, 9000); y += 500) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await sleep(160); }
      await page.evaluate(() => window.scrollTo(0, 0)); await sleep(600);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      // slider ilerlet
      for (let i = 0; i < 6; i++) {
        const clicked = await page.evaluate(() => {
          const cand = [...document.querySelectorAll('button, a, div, span')].filter((e) => /next|sonraki|ileri|swiper-button-next|slick-next|arrow-right|carousel-control-next|owl-next/i.test(e.className + ' ' + (e.getAttribute('aria-label') || '')));
          const v = cand.find((e) => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; });
          if (v) { v.click(); return true; } return false;
        }).catch(() => false);
        if (!clicked) break; await sleep(900);
      }
      const shotF = path.join(out, 'screens', `${slug(p === '/' ? 'home' : p)}-full.jpg`);
      await page.screenshot({ path: shotF, type: 'jpeg', quality: 62, fullPage: true, clip: undefined }).catch(() => {});
      rec.screens = { hero: path.relative(out, shotV), full: path.relative(out, shotF) };

      const dom = await page.evaluate(() => {
        const q = (s) => [...document.querySelectorAll(s)];
        const rect = (e) => { const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
        const imgs = [...document.images].map((i) => ({ src: i.currentSrc || i.src, srcset: i.srcset || i.getAttribute('data-srcset') || '', dataSrc: i.getAttribute('data-src') || i.getAttribute('data-lazy') || i.getAttribute('data-original') || '', alt: i.alt || '', cls: String(i.className).slice(0, 120), nw: i.naturalWidth, nh: i.naturalHeight, box: rect(i), inHeader: !!i.closest('header,nav,.header,.navbar,[class*="header"],[class*="logo"],[class*="Header"]'), inFooter: !!i.closest('footer,[class*="footer"],[class*="Footer"]') }));
        const sources = q('picture source').map((s) => ({ src: s.src || s.getAttribute('src') || '', srcset: s.srcset || s.getAttribute('data-srcset') || '' }));
        const bgs = []; const all = q('*'); const lim = Math.min(all.length, 7000);
        for (let i = 0; i < lim; i++) { const cs = getComputedStyle(all[i]); const bi = cs.backgroundImage; if (bi && bi !== 'none') { for (const m of bi.matchAll(/url\((['"]?)(.*?)\1\)/g)) bgs.push({ src: m[2], box: rect(all[i]), cls: String(all[i].className).slice(0, 120), tag: all[i].tagName }); } }
        const lazy = q('[data-src],[data-lazy],[data-bg],[data-background],[data-background-image],[data-original],[data-image]').map((e) => ({ src: e.getAttribute('data-src') || e.getAttribute('data-lazy') || e.getAttribute('data-bg') || e.getAttribute('data-background') || e.getAttribute('data-background-image') || e.getAttribute('data-original') || e.getAttribute('data-image'), cls: String(e.className).slice(0, 120) })).filter((e) => e.src);
        const svgs = q('header svg, nav svg, [class*="logo"] svg, [class*="Logo"] svg, a[href="/"] svg, footer svg').slice(0, 14).map((s) => { let html = s.outerHTML; const uses = [...s.querySelectorAll('use')].map((u) => (u.getAttribute('href') || u.getAttribute('xlink:href') || '').replace('#', '')).filter(Boolean); const defs = uses.map((id) => { const d = document.getElementById(id); return d ? d.outerHTML : ''; }).join(''); if (defs) html = html.replace('</svg>', `<defs>${defs}</defs></svg>`); html = html.replace(/currentColor/g, getComputedStyle(s).color || '#000'); if (!/xmlns=/.test(html)) html = html.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"'); return { html: html.slice(0, 60000), box: rect(s), cls: String(s.getAttribute('class') || '').slice(0, 120), parentCls: String(s.parentElement && s.parentElement.className || '').slice(0, 120) }; });
        const icons = q('link[rel*="icon"], link[rel="apple-touch-icon"]').map((l) => ({ href: l.href, rel: l.rel, sizes: l.getAttribute('sizes') || '' }));
        const meta = {}; for (const m of q('meta[property^="og:"], meta[name^="twitter:"], meta[name="description"], meta[name="theme-color"]')) meta[m.getAttribute('property') || m.getAttribute('name')] = m.getAttribute('content');
        const tx = (sel, n, max) => q(sel).map((e) => e.innerText.trim().replace(/\s+/g, ' ')).filter((t) => t && t.length < max).slice(0, n);
        const texts = { h1: tx('h1', 12, 200), h2: tx('h2', 30, 200), h3: tx('h3', 40, 200), buttons: tx('button, a.btn, [class*="btn"], [class*="button"], [class*="Button"]', 50, 60), lead: tx('p', 40, 260), slogans: tx('[class*="slogan"], [class*="title"], [class*="Title"], [class*="headline"], [class*="hero"] h1, [class*="hero"] h2, [class*="banner"] h2, [class*="banner"] h3', 50, 200) };
        const fonts = {}; for (const sel of ['body', 'h1', 'h2', 'h3', 'p', 'button', 'a']) { const e = document.querySelector(sel); if (e) { const cs = getComputedStyle(e); fonts[sel] = { family: cs.fontFamily, weight: cs.fontWeight, size: cs.fontSize, color: cs.color }; } }
        const colorHits = {}; for (const e of q('button, a, header, nav, footer, [class*="btn"], [class*="badge"], section, [class*="hero"], [class*="banner"], h1, h2').slice(0, 500)) { const cs = getComputedStyle(e); for (const c of [cs.backgroundColor, cs.color, cs.borderColor]) { if (c && !/rgba\(0, 0, 0, 0\)/.test(c)) colorHits[c] = (colorHits[c] || 0) + 1; } }
        const vars = {}; try { for (const ss of document.styleSheets) { let rules; try { rules = ss.cssRules; } catch { continue; } for (const r of rules) { if (!r.style || !/:root|html|body/.test(r.selectorText || '')) continue; for (let i = 0; i < r.style.length; i++) { const pn = r.style[i]; if (pn.startsWith('--')) { const v = r.style.getPropertyValue(pn).trim(); if (/^#|^rgb|^hsl/.test(v)) vars[pn] = v; } } } } } catch { /* yok */ }
        const links = [...new Set(q('a[href]').map((a) => a.href).filter((h) => /^https?:/.test(h)))].slice(0, 400);
        const files = q('a[href]').map((a) => ({ href: a.href, text: (a.textContent || '').trim().slice(0, 80), dl: a.getAttribute('download') })).filter((l) => /\.(svg|png|jpe?g|zip|pdf|ai|eps|rar)(\?|$)/i.test(l.href) || l.dl !== null);
        return { title: document.title, imgs, sources, bgs, lazy, svgs, icons, meta, texts, fonts, colorHits, vars, links, files };
      });
      Object.assign(rec, { title: dom.title, meta: dom.meta, texts: dom.texts, fonts: dom.fonts, colorHits: dom.colorHits, vars: dom.vars, files: dom.files, imgCount: dom.imgs.length });
      for (const i of dom.imgs) { note(i.src, { alt: i.alt, cls: i.cls, box: i.box, inHeader: i.inHeader, inFooter: i.inFooter, natural: [i.nw, i.nh], via: 'img' }, p); if (i.dataSrc) note(i.dataSrc, { alt: i.alt, via: 'data-src', box: i.box }, p); for (const s of String(i.srcset).split(',')) { const u = s.trim().split(/\s+/)[0]; if (u) note(u, { alt: i.alt, via: 'srcset', box: i.box }, p); } }
      for (const s of dom.sources) for (const u of [s.src, ...String(s.srcset).split(',').map((x) => x.trim().split(/\s+/)[0])]) if (u) note(u, { via: 'source' }, p);
      for (const b of dom.bgs) note(b.src, { via: 'css-bg', box: b.box, cls: b.cls }, p);
      for (const l of dom.lazy) note(l.src, { via: 'data-attr', cls: l.cls }, p);
      for (const ic of dom.icons) note(ic.href, { via: 'icon', alt: ic.rel + ' ' + ic.sizes }, p);
      for (const k of ['og:image', 'twitter:image']) if (dom.meta[k]) note(dom.meta[k], { via: k }, p);
      dom.svgs.forEach((s, i) => { const f = path.join(out, 'svg', `${slug(p === '/' ? 'home' : p)}-${i}-${hash(s.html)}.svg`); fs.writeFileSync(f, s.html); manifest.svgs.push({ file: path.relative(out, f), page: p, box: s.box, cls: s.cls, parentCls: s.parentCls, bytes: s.html.length }); });
      Object.assign(manifest.cssVars, dom.vars);
      for (const [c, n] of Object.entries(dom.colorHits)) manifest.colors[c] = (manifest.colors[c] || 0) + n;
      for (const [k, v] of Object.entries(dom.fonts)) manifest.fonts[k] = manifest.fonts[k] || v;
      // logo sayfasındaki dosya bağlantıları (zip/png/svg/pdf/ai)
      if (/logo/i.test(p)) {
        for (const f of dom.files) {
          try {
            const u = orig(f.href); const dlUrl = archiveMode ? `${WB}/web/2026id_/${u}` : u;
            const r = await ctx.request.get(dlUrl, { timeout: 60000, headers: { 'user-agent': UA, referer: url } });
            if (!r.ok()) { log(`- logo dosyası ${u} → ${r.status()}`); continue; }
            const b = await r.body(); if (b.length > 40 * 1024 * 1024) continue;
            const ext = extOf(r.headers()['content-type'], u); const name = `${slug(path.basename(new URL(u).pathname).replace(/\.[a-z0-9]+$/i, ''))}.${ext}`;
            const file = path.join(out, 'logo', name); fs.writeFileSync(file, b); totalBytes += b.length;
            manifest.logos.push({ file: path.relative(out, file), from: u, text: f.text, bytes: b.length, ext });
            log(`- logo dosyası → ${name} (${(b.length / 1024).toFixed(0)} KB)`);
            if (ext === 'zip') { try { execSync(`cd "${path.join(out, 'logo')}" && mkdir -p "${name}.d" && unzip -o -q "${name}" -d "${name}.d" && find "${name}.d" -type f | head -80`, { stdio: 'inherit' }); } catch (e) { log('  unzip: ' + e.message.split('\n')[0]); } }
          } catch (e) { log(`- logo dosyası hata: ${e.message.split('\n')[0]}`); }
        }
      }
      // keşif: ürün / kampanya sayfaları
      for (const l0 of dom.links) { const l = orig(l0); if (!sameSite(l)) continue; let pp; try { pp = new URL(l).pathname.replace(/\/$/, '') || '/'; } catch { continue; } if (/^\/(urunlerimiz|aktif-kampanyalar|kampanya|bireysel-emeklilik)\b/i.test(pp) && !/\/en\//.test(pp) && !visited.has(pp) && !queue.includes(pp) && discovered.size < 14) { discovered.add(pp); queue.push(pp); } }
      log(`- ${rec.status} "${dom.title}" – ${dom.imgs.length} img, ${dom.bgs.length} css-bg, ${dom.svgs.length} svg, ${dom.files.length} dosya bağlantısı`);
      if (dom.texts.h1.length) log(`- h1: ${dom.texts.h1.join(' | ')}`);
    } catch (e) { rec.error = e.message.split('\n')[0]; log(`- HATA: ${rec.error}`); }
    manifest.pages.push(rec);
  }

  // Görselleri indir: header/logo adayları + geniş görseller
  log(`\n## İndirme: ${media.size} aday adres`);
  const recs = [...media.values()];
  for (const m of recs) {
    const nat = m.natural || [0, 0]; const box = m.box || { w: 0, h: 0 };
    const isLogo = m.inHeader || /logo/i.test(m.url + ' ' + [...m.alts].join(' ') + ' ' + (m.cls || ''));
    const isIcon = /favicon|icon|sprite|arrow|ok\b|chevron|social|facebook|twitter|instagram|linkedin|youtube|apple|google-play|app-store|whatsapp|play\.png/i.test(m.url) && !isLogo;
    const big = Math.max(nat[0], box.w) >= MIN_W || /\.(svg)(\?|$)/i.test(m.url) && isLogo;
    m.isLogo = isLogo; m.isIcon = isIcon;
    m.score = (isLogo ? 1000 : 0) + Math.max(nat[0] * nat[1], box.w * box.h) / 1000 + (m.pages.has('/') ? 50 : 0) + ([...m.via].includes('og:image') ? 80 : 0);
    m.want = isLogo || (big && !isIcon);
  }
  const wanted = recs.filter((m) => m.want).sort((a, b) => b.score - a.score).slice(0, MAX_IMG + 20);
  let n = 0;
  for (const m of wanted) {
    if (n >= MAX_IMG && !m.isLogo) continue;
    if (totalBytes > MAX_TOTAL) { manifest.errors.push('toplam boyut sınırı'); break; }
    try {
      let buf, ct;
      const cached = netBodies.get(m.url);
      if (cached) { buf = cached.buf; ct = cached.ct; }
      else {
        const dlUrl = archiveMode ? `${WB}/web/2026id_/${m.url}` : m.url;
        const r = await ctx.request.get(dlUrl, { timeout: 60000, headers: { 'user-agent': UA, referer: BASE + '/' } });
        if (!r.ok()) { m.dlError = 'HTTP ' + r.status(); continue; }
        ct = r.headers()['content-type'] || ''; buf = await r.body();
      }
      if (!buf || buf.length < 800 || buf.length > MAX_FILE) { m.dlError = 'boyut'; continue; }
      const ext = extOf(ct, m.url); if (!/^(jpg|png|webp|gif|svg|avif)$/.test(ext)) { m.dlError = 'tür ' + ct; continue; }
      const dim = imgSize(buf, ext) || (m.natural && m.natural[0] ? { w: m.natural[0], h: m.natural[1] } : null);
      if (!m.isLogo && dim && dim.w < MIN_W && ext !== 'svg') { m.dlError = 'dar ' + dim.w; continue; }
      const base = slug(path.basename(new URL(m.url).pathname).replace(/\.[a-z0-9]+$/i, '')) || 'img';
      const name = `${m.isLogo ? 'logo-' : ''}${base}-${hash(m.url)}.${ext}`;
      const file = path.join(out, m.isLogo ? 'logo' : 'img', name);
      fs.writeFileSync(file, buf); totalBytes += buf.length; if (!m.isLogo) n++;
      const entry = { file: path.relative(out, file), url: m.url, bytes: buf.length, ext, w: dim && dim.w, h: dim && dim.h, alt: [...m.alts].join(' | ').slice(0, 200), pages: [...m.pages], via: [...m.via], box: m.box, cls: m.cls, isLogo: m.isLogo, score: Math.round(m.score) };
      (m.isLogo ? manifest.logos : manifest.images).push(entry);
    } catch (e) { m.dlError = e.message.split('\n')[0]; }
  }
  manifest.skipped = recs.filter((m) => m.dlError).map((m) => ({ url: m.url, why: m.dlError })).slice(0, 200);
  log(`✔ ${manifest.images.length} görsel, ${manifest.logos.length} logo dosyası, ${manifest.svgs.length} satır içi SVG (${(totalBytes / 1048576).toFixed(1)} MB)`);

  // Kontak sayfaları: görselleri numaralı ızgarada tek JPEG'e bas (bulut oturumunda gözle seçmek için)
  const sheetPage = await ctx.newPage();
  const items = manifest.images.map((im, i) => ({ i, ...im }));
  const PER = 20;
  for (let s = 0; s * PER < items.length; s++) {
    const chunk = items.slice(s * PER, (s + 1) * PER);
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#222;color:#fff;font:12px/1.3 sans-serif}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px;width:1600px;box-sizing:border-box}.c{background:#333;border-radius:6px;overflow:hidden}.c .im{height:220px;display:flex;align-items:center;justify-content:center;background:#111 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23333'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23333'/%3E%3C/svg%3E")}.c img{max-width:100%;max-height:220px}.c .t{padding:6px 8px;height:52px;overflow:hidden}.c b{color:#ffd54a;font-size:14px}</style><div class="g">${chunk.map((im) => `<div class="c"><div class="im"><img src="file://${path.join(out, im.file)}"></div><div class="t"><b>#${im.i}</b> ${im.w || '?'}×${im.h || '?'} ${im.ext} ${(im.bytes / 1024).toFixed(0)}KB<br>${(im.alt || '').slice(0, 60)}<br>${im.pages.slice(0, 2).join(' ')}</div></div>`).join('')}</div>`;
    const f = path.join(out, 'sheets', `sheet-${String(s + 1).padStart(2, '0')}.html`); fs.writeFileSync(f, html);
    await sheetPage.setViewportSize({ width: 1600, height: 1400 });
    await sheetPage.goto('file://' + f); await sheetPage.waitForLoadState('load'); await sleep(800);
    await sheetPage.screenshot({ path: f.replace(/\.html$/, '.jpg'), type: 'jpeg', quality: 70, fullPage: true }).catch(() => {});
    fs.unlinkSync(f);
  }
  // logo kontak sayfası (svg + logo dosyaları), açık ve koyu zeminde
  const logoItems = [...manifest.logos.filter((l) => /^(svg|png|webp|jpg)$/.test(l.ext)).map((l) => ({ ...l, label: 'logo' })), ...manifest.svgs.map((s) => ({ ...s, ext: 'svg', label: 'inline' }))];
  if (logoItems.length) {
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;font:12px sans-serif}.g{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px;width:1600px;box-sizing:border-box}.c{border:1px solid #999;border-radius:6px;overflow:hidden}.c .im{height:150px;display:flex;align-items:center;justify-content:center;background:#fff}.c .im.d{background:#0b2a36}.c img{max-width:90%;max-height:120px}.c .t{padding:6px 8px;background:#eee}</style><div class="g">${logoItems.map((l, i) => `<div class="c"><div class="im"><img src="file://${path.join(out, l.file)}"></div><div class="im d"><img src="file://${path.join(out, l.file)}"></div><div class="t"><b>L${i}</b> ${l.label} ${l.file} ${l.w ? l.w + '×' + l.h : ''} ${l.page || ''}</div></div>`).join('')}</div>`;
    const f = path.join(out, 'sheets', 'logos.html'); fs.writeFileSync(f, html);
    await sheetPage.setViewportSize({ width: 1600, height: 1200 }); await sheetPage.goto('file://' + f); await sleep(800);
    await sheetPage.screenshot({ path: path.join(out, 'sheets', 'logos.jpg'), type: 'jpeg', quality: 80, fullPage: true }).catch(() => {});
    fs.unlinkSync(f);
  }
  await browser.close();

  // Rapor
  const topColors = Object.entries(manifest.colors).sort((a, b) => b[1] - a[1]).slice(0, 24).map(([c, n]) => `${c} (${n})`).join(', ');
  report.push('\n## Renkler\n' + topColors, '\n## CSS değişkenleri\n' + Object.entries(manifest.cssVars).slice(0, 60).map(([k, v]) => `${k}: ${v}`).join('\n'), '\n## Fontlar\n' + Object.entries(manifest.fonts).map(([k, v]) => `${k}: ${v.family} ${v.weight} ${v.size}`).join('\n'));
  report.push('\n## Görseller (puan sırası)\n' + manifest.images.map((im, i) => `#${i} ${im.w}×${im.h} ${im.ext} ${(im.bytes / 1024).toFixed(0)}KB "${im.alt}" ${im.pages.join(' ')} [${im.via.join(',')}] ${im.file}`).join('\n'));
  report.push('\n## Logo dosyaları\n' + manifest.logos.map((l, i) => `L${i} ${l.file} ${l.w || ''}×${l.h || ''} ${(l.bytes / 1024).toFixed(0)}KB ← ${l.from || l.url}`).join('\n'));
  report.push('\n## Satır içi SVG\n' + manifest.svgs.map((s, i) => `S${i} ${s.file} ${s.box.w}×${s.box.h} ${s.page} cls="${s.cls}" parent="${s.parentCls}"`).join('\n'));
  report.push('\n## Sayfa metinleri\n' + manifest.pages.map((p) => `### ${p.path} (${p.status}) ${p.title || ''}\n${p.texts ? ['h1', 'h2', 'h3', 'slogans', 'buttons'].map((k) => p.texts[k] && p.texts[k].length ? `- ${k}: ${p.texts[k].join(' | ')}` : '').filter(Boolean).join('\n') : ''}`).join('\n'));
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));
  fs.writeFileSync(path.join(out, 'report.md'), report.join('\n'));
  console.log(`✔ ${path.relative(root, out)}/manifest.json ve report.md yazıldı`);
})().catch((e) => { console.error(e); process.exit(1); });
