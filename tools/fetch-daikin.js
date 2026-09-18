#!/usr/bin/env node
'use strict';
/**
 * daikin.com.tr üzerinden GERÇEK marka varlıklarını (logo, ürün görselleri, sayfa ekran görüntüleri) indirir.
 *
 *   node tools/fetch-daikin.js [--base=https://www.daikin.com.tr] [--pages=8] [--max=900] [--urls=u1,u2,...]
 *                              [--keywords=kombi,yogusmal,...] [--models=d2cnd,d2tnd] [--out=assets/daikin-kombi]
 *
 * Çıktı (assets/daikin/):
 *   report.json / report.md   – bulunan her şey: logo adayları, ürün sayfaları, görsel adayları, boyutlar, hatalar
 *   logo/                     – logo adayları (svg / png / webp)
 *   products/<slug>/          – ürün görselleri (en fazla --max px'e küçültülmüş PNG/WebP + kırpılmış sürüm)
 *   manual/                   – --urls ile verilen adreslerden indirilenler
 *   shots/                    – Playwright ile alınmış sayfa ekran görüntüleri (tasarım referansı)
 *
 * Node 18+ yeterlidir. `playwright` (JS ile üretilen sayfalar, ekran görüntüsü) ve `sharp` (küçültme,
 * kırpma) yüklüyse kullanılır; yoksa düz indirme ile yetinir. GitHub Actions'ta ikisi de kurulur.
 */
const fs = require('fs');
const path = require('path');

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
}));
const BASES = String(args.base || 'https://www.daikin.com.tr').split(',').map((s) => s.trim().replace(/\/$/, '')).filter(Boolean);
const PAGES = +args.pages || 8;
const MAXPX = +args.max || 900;
const MANUAL = String(args.urls || '').split(',').map((s) => s.trim()).filter(Boolean);
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const KW = args.keywords ? String(args.keywords).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean)
  : ['perfera', 'emura', 'stylish', 'comfora', 'sensira', 'siesta', 'shira', 'nepura', 'ururu', 'split', 'duvar', 'klima', 'inverter', 'multi', 'ftx', 'atx', 'ctx'];
const MODELS = args.models ? String(args.models).split(',').map((s) => s.trim().toLowerCase()).filter(Boolean) : ['perfera', 'emura', 'stylish', 'comfora', 'sensira', 'siesta', 'shira'];

const root = path.join(__dirname, '..');
const out = path.resolve(root, String(args.out || 'assets/daikin'));
for (const d of ['logo', 'products', 'manual', 'shots', 'raw']) fs.mkdirSync(path.join(out, d), { recursive: true });

const report = { fetchedAt: new Date().toISOString(), bases: BASES, base: null, homepage: null, logo: [], css: [], sitemap: { urls: 0, matched: [] }, navLinks: [], pages: [], manual: [], errors: [], tools: {} };
const log = (s) => console.log(s);
const err = (where, e) => { const msg = `${where}: ${e && e.message ? e.message : e}`; report.errors.push(msg); log(`⚠ ${msg}`); };

let sharp = null, pw = null;
try { sharp = require('sharp'); report.tools.sharp = true; } catch { report.tools.sharp = false; }
try { pw = require('playwright'); report.tools.playwright = true; } catch { report.tools.playwright = false; }

/* ---------------- HTTP ---------------- */
async function get(url, type = 'text', timeout = 30000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);
  try {
    const r = await fetch(url, {
      headers: { 'user-agent': UA, 'accept': type === 'buffer' ? 'image/avif,image/webp,image/png,image/svg+xml,image/*,*/*;q=0.8' : 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'accept-language': 'tr-TR,tr;q=0.9,en;q=0.8' },
      redirect: 'follow', signal: ac.signal,
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    if (type === 'buffer') return { buf: Buffer.from(await r.arrayBuffer()), ct: r.headers.get('content-type') || '', url: r.url };
    return { text: await r.text(), ct: r.headers.get('content-type') || '', url: r.url };
  } finally { clearTimeout(t); }
}
const abs = (src, base) => {
  if (!src) return null;
  src = src.trim().replace(/&amp;/g, '&');
  if (/^data:/i.test(src)) return null;
  try { return new URL(src, base).href; } catch { return null; }
};
const looksImage = (u) => /\.(png|jpe?g|webp|svg|gif|avif)(\?|$)/i.test(u) || /\/-\/media\//i.test(u) || /image|media|asset/i.test(u);
const junk = (u) => /(favicon|sprite|flag|icon-|\/icons?\/|arrow|chevron|pixel|tracking|placeholder|spinner|loader|1x1|blank\.)/i.test(u);

/* ---------------- Görüntü boyutu (başlıktan) ---------------- */
function dims(buf) {
  try {
    if (buf.length > 24 && buf.toString('ascii', 1, 4) === 'PNG') return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), type: 'png' };
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7), type: 'jpg' };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') {
      const c = buf.toString('ascii', 12, 16);
      if (c === 'VP8X') return { w: 1 + buf.readUIntLE(24, 3), h: 1 + buf.readUIntLE(27, 3), type: 'webp' };
      if (c === 'VP8 ') return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff, type: 'webp' };
      if (c === 'VP8L') { const b = buf.readUInt32LE(21); return { w: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff), type: 'webp' }; }
    }
    const head = buf.toString('utf8', 0, Math.min(buf.length, 600));
    if (/<svg/i.test(head)) {
      const vb = head.match(/viewBox="[\d.\-]+\s+[\d.\-]+\s+([\d.]+)\s+([\d.]+)"/i);
      const w = head.match(/\swidth="([\d.]+)/i), h = head.match(/\sheight="([\d.]+)/i);
      return { w: +(w ? w[1] : vb ? vb[1] : 0), h: +(h ? h[1] : vb ? vb[2] : 0), type: 'svg' };
    }
  } catch {}
  return { w: 0, h: 0, type: 'bin' };
}
const extOf = (url, ct, d) => {
  const m = (new URL(url).pathname.match(/\.(png|jpe?g|webp|svg|gif|avif)$/i) || [])[1];
  const e = (m || (ct.match(/image\/(png|jpeg|webp|svg|gif|avif)/i) || [])[1] || (d && d.type !== 'bin' ? d.type : 'bin')).toLowerCase();
  return e === 'jpeg' ? 'jpg' : e === 'svg+xml' ? 'svg' : e;
};
const slug = (s) => String(s || '').toLowerCase().replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 48) || 'sayfa';

/* ---------------- Playwright (JS ile üretilen sayfalar, ekran görüntüsü) ---------------- */
let browser = null;
async function page() {
  if (!pw) return null;
  if (!browser) browser = await pw.chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1366, height: 900 }, locale: 'tr-TR', deviceScaleFactor: 1 });
  return ctx.newPage();
}
async function render(url, shotName) {
  const p = await page();
  if (!p) return null;
  try {
    await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await p.waitForTimeout(2500);
    // çerez bandını kapatmayı dene
    for (const sel of ['#onetrust-accept-btn-handler', 'button:has-text("Kabul")', 'button:has-text("Tümünü kabul")', 'button:has-text("Accept")', '[class*="cookie"] button']) {
      try { const b = p.locator(sel).first(); if (await b.isVisible({ timeout: 800 })) { await b.click({ timeout: 1500 }); await p.waitForTimeout(600); break; } } catch {}
    }
    await p.evaluate(async () => { window.scrollTo(0, 600); await new Promise((r) => setTimeout(r, 500)); window.scrollTo(0, 0); });
    const html = await p.content();
    const dom = await p.evaluate(() => {
      const imgs = [...document.querySelectorAll('img')].map((i) => {
        const r = i.getBoundingClientRect();
        return { src: i.currentSrc || i.src || i.getAttribute('data-src') || '', alt: i.alt || '', cls: (i.className && i.className.baseVal) || i.className || '', w: i.naturalWidth, h: i.naturalHeight, top: Math.round(r.top + scrollY), left: Math.round(r.left), rw: Math.round(r.width), rh: Math.round(r.height), inHeader: !!i.closest('header, [class*="header"], [class*="navbar"], nav') };
      });
      const svgs = [...document.querySelectorAll('svg')].filter((s) => /logo/i.test(s.outerHTML.slice(0, 400)) || s.closest('a[href="/"], a[href$="/tr_tr.html"], [class*="logo"]')).slice(0, 6).map((s) => ({ html: s.outerHTML, cls: (s.className && s.className.baseVal) || '', inHeader: !!s.closest('header, [class*="header"], nav') }));
      const bg = [...document.querySelectorAll('header *, [class*="logo"], a[href="/"]')].map((e) => getComputedStyle(e).backgroundImage).filter((b) => b && b !== 'none' && /logo/i.test(b)).slice(0, 4);
      const links = [...document.querySelectorAll('a[href]')].map((a) => ({ href: a.href, text: (a.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80) }));
      const title = document.title;
      const h1 = (document.querySelector('h1') || {}).textContent || '';
      return { imgs, svgs, bg, links, title, h1: h1.trim() };
    });
    if (shotName) { try { await p.screenshot({ path: path.join(out, 'shots', shotName), type: 'jpeg', quality: 62, fullPage: false }); } catch (e) { err('screenshot', e); } }
    return { html, dom, url: p.url() };
  } finally { try { await p.context().close(); } catch {} }
}

/* ---------------- HTML ayrıştırma (düz) ---------------- */
function imgTags(html, base) {
  const res = [];
  for (const m of html.matchAll(/<(img|source)\b[^>]*>/gi)) {
    const t = m[0];
    const attr = (n) => (t.match(new RegExp(`\\s${n}="([^"]*)"`, 'i')) || [])[1];
    const cands = [];
    for (const n of ['srcset', 'data-srcset']) { const v = attr(n); if (v) for (const part of v.split(',')) { const [u, d] = part.trim().split(/\s+/); cands.push({ u, d: parseFloat(d) || 0 }); } }
    cands.sort((a, b) => b.d - a.d);
    for (const n of ['src', 'data-src', 'data-lazy-src', 'data-original']) { const v = attr(n); if (v) cands.push({ u: v, d: 0 }); }
    for (const c of cands) { const u = abs(c.u, base); if (u && !junk(u)) { res.push({ src: u, alt: attr('alt') || '', cls: attr('class') || '', tag: t.slice(0, 200) }); break; } }
  }
  return res;
}
function meta(html, name) { return (html.match(new RegExp(`<meta[^>]+(?:property|name)="${name}"[^>]+content="([^"]*)"`, 'i')) || html.match(new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:property|name)="${name}"`, 'i')) || [])[1]; }

/* ---------------- İndirme + küçültme ---------------- */
const seen = new Set();
async function download(url, dir, name) {
  if (seen.has(url)) return null;
  seen.add(url);
  const { buf, ct } = await get(url, 'buffer');
  if (/text\/html/i.test(ct)) throw new Error('HTML döndü (görsel değil)');
  const d = dims(buf);
  const ext = extOf(url, ct, d);
  const base = `${name}.${ext}`;
  const file = path.join(dir, base);
  fs.writeFileSync(file, buf);
  const entry = { src: url, file: path.relative(root, file), bytes: buf.length, width: d.w, height: d.h, type: ext };
  if (sharp && /^(png|jpg|webp|avif|gif)$/.test(ext)) {
    try {
      const img = sharp(buf, { animated: false });
      const m = await img.metadata();
      entry.width = m.width; entry.height = m.height; entry.alpha = !!m.hasAlpha;
      // küçültülmüş sürüm (masthead için yeterli)
      const small = sharp(buf).resize({ width: MAXPX, height: MAXPX, fit: 'inside', withoutEnlargement: true });
      const sPng = path.join(dir, `${name}-${MAXPX}.png`);
      await small.clone().png({ compressionLevel: 9, palette: false }).toFile(sPng);
      const sWebp = path.join(dir, `${name}-${MAXPX}.webp`);
      await small.clone().webp({ quality: 84, alpha_quality: 90 }).toFile(sWebp);
      entry.small = { png: path.relative(root, sPng), webp: path.relative(root, sWebp), pngBytes: fs.statSync(sPng).size, webpBytes: fs.statSync(sWebp).size };
      // kenar boşluklarını kırpılmış sürüm (paketleme fotoğrafları için)
      try {
        const tr = sharp(buf).trim({ threshold: 18 }).resize({ width: MAXPX, height: MAXPX, fit: 'inside', withoutEnlargement: true });
        const tPng = path.join(dir, `${name}-trim.png`);
        const info = await tr.clone().png({ compressionLevel: 9 }).toFile(tPng);
        entry.trim = { png: path.relative(root, tPng), width: info.width, height: info.height, bytes: info.size };
      } catch (e) { entry.trimError = e.message; }
      // orijinali (büyükse) depoda tutma
      if (buf.length > 700 * 1024) { fs.unlinkSync(file); entry.file = null; entry.originalDropped = true; }
    } catch (e) { entry.sharpError = e.message; }
  }
  return entry;
}

/* ---------------- Ana akış ---------------- */
(async () => {
  let BASE = null, home = null;
  for (const b of BASES) {
    try {
      log(`→ ${b}/ alınıyor`);
      const r = await get(`${b}/`);
      home = { html: r.text, url: r.url, via: 'fetch' };
      BASE = b; break;
    } catch (e) {
      err(`ana sayfa (fetch) ${b}`, e);
      try { const r = await render(`${b}/`, 'home.jpg'); if (r) { home = { html: r.html, url: r.url, via: 'playwright', dom: r.dom }; BASE = b; break; } } catch (e2) { err(`ana sayfa (playwright) ${b}`, e2); }
    }
  }
  if (!BASE) { fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2)); throw new Error('Hiçbir taban adres alınamadı'); }
  report.base = BASE;
  report.homepage = { url: home.url, via: home.via, bytes: home.html.length, title: (home.html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1], ogImage: abs(meta(home.html, 'og:image'), home.url), themeColor: meta(home.html, 'theme-color'), generator: meta(home.html, 'generator') };
  fs.writeFileSync(path.join(out, 'raw', 'home.html'), home.html);
  // JS ile üretilen içerik + ekran görüntüsü için ana sayfayı bir de Playwright ile aç
  if (!home.dom) { try { const r = await render(home.url, 'home.jpg'); if (r) home.dom = r.dom; } catch (e) { err('ana sayfa (playwright)', e); } }

  /* --- Logo adayları --- */
  const logoCands = [];
  const header = (home.html.match(/<header[\s\S]*?<\/header>/i) || [''])[0];
  for (const src of [header, home.html]) {
    for (const im of imgTags(src, home.url)) if (/logo/i.test(im.src + ' ' + im.alt + ' ' + im.cls + ' ' + im.tag)) logoCands.push({ src: im.src, alt: im.alt, how: src === header ? 'header-img' : 'img' });
    for (const m of src.matchAll(/<a\b[^>]*class="[^"]*logo[^"]*"[^>]*>([\s\S]*?)<\/a>/gi)) for (const im of imgTags(m[1], home.url)) logoCands.push({ src: im.src, alt: im.alt, how: 'logo-anchor' });
    for (const m of src.matchAll(/<svg\b[^>]*(?:class|id|aria-label)="[^"]*logo[^"]*"[\s\S]*?<\/svg>/gi)) logoCands.push({ inline: m[0], how: 'inline-svg' });
    for (const m of src.matchAll(/url\(["']?([^"')]+logo[^"')]*)["']?\)/gi)) { const u = abs(m[1], home.url); if (u) logoCands.push({ src: u, how: 'css-bg' }); }
  }
  if (home.dom) {
    for (const i of home.dom.imgs) if (/logo/i.test(i.src + ' ' + i.alt + ' ' + i.cls) || (i.inHeader && i.top < 160 && i.rw > 60 && i.rw < 400)) logoCands.push({ src: i.src, alt: i.alt, how: 'dom-img', w: i.w, h: i.h, rendered: `${i.rw}x${i.rh}@${i.left},${i.top}` });
    for (const s of home.dom.svgs) logoCands.push({ inline: s.html, how: 'dom-svg', cls: s.cls, inHeader: s.inHeader });
    for (const b of home.dom.bg) { const m = b.match(/url\(["']?([^"')]+)["']?\)/); if (m) logoCands.push({ src: abs(m[1], home.url), how: 'dom-css-bg' }); }
  }
  for (const rel of ['icon', 'shortcut icon', 'apple-touch-icon']) { const m = home.html.match(new RegExp(`<link[^>]+rel="${rel}"[^>]+href="([^"]+)"`, 'i')); if (m) logoCands.push({ src: abs(m[1], home.url), how: rel }); }
  // stil dosyalarındaki logo (Sitecore/SXA temaları logoyu CSS ile de verebilir)
  const cssLinks = [...home.html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/gi)].map((m) => abs(m[1], home.url)).filter(Boolean).slice(0, 8);
  for (const c of cssLinks) {
    try { const r = await get(c); report.css.push({ url: c, bytes: r.text.length }); for (const m of r.text.matchAll(/url\(["']?([^"')]+logo[^"')]*)["']?\)/gi)) { const u = abs(m[1], c); if (u) logoCands.push({ src: u, how: 'css-file' }); }
      const colors = {}; for (const m of r.text.matchAll(/#([0-9a-f]{6})\b/gi)) { const h = '#' + m[1].toLowerCase(); if (h !== '#ffffff' && h !== '#000000') colors[h] = (colors[h] || 0) + 1; }
      report.css[report.css.length - 1].topColors = Object.entries(colors).sort((a, b) => b[1] - a[1]).slice(0, 10);
    } catch (e) { err(`css ${c}`, e); }
  }
  let li = 0;
  const uniq = new Set();
  for (const c of logoCands) {
    const key = c.inline ? 'inline:' + c.inline.slice(0, 120) : c.src;
    if (!key || uniq.has(key)) continue; uniq.add(key);
    if (c.inline) {
      const file = path.join(out, 'logo', `logo-${++li}-inline.svg`);
      fs.writeFileSync(file, c.inline.replace(/^<svg(?![^>]*xmlns=)/, '<svg xmlns="http://www.w3.org/2000/svg"'));
      report.logo.push({ how: c.how, file: path.relative(root, file), bytes: c.inline.length, cls: c.cls, inHeader: c.inHeader, hasUse: /<use\b/i.test(c.inline) });
      continue;
    }
    if (li >= 12) break;
    try { const e = await download(c.src, path.join(out, 'logo'), `logo-${++li}`); if (e) report.logo.push(Object.assign({ how: c.how, alt: c.alt, rendered: c.rendered }, e)); }
    catch (e) { report.logo.push({ how: c.how, src: c.src, error: e.message }); }
  }
  log(`✔ ${report.logo.length} logo adayı`);

  /* --- Site haritası ve menü bağlantıları → ürün sayfaları --- */
  const urls = new Set();
  const addSitemap = async (u, depth = 0) => {
    if (depth > 2) return;
    const r = await get(u, 'text', 40000);
    const locs = [...r.text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
    if (/<sitemapindex/i.test(r.text)) { for (const l of locs.slice(0, 12)) { try { await addSitemap(l, depth + 1); } catch (e) { err(`sitemap ${l}`, e); } } }
    else for (const l of locs) urls.add(l);
  };
  try {
    const rb = await get(`${BASE}/robots.txt`).catch(() => ({ text: '' }));
    const sm = [...rb.text.matchAll(/^sitemap:\s*(\S+)/gim)].map((m) => m[1]);
    if (!sm.length) sm.push(`${BASE}/sitemap.xml`);
    for (const s of sm.slice(0, 4)) { try { await addSitemap(s); } catch (e) { err(`sitemap ${s}`, e); } }
  } catch (e) { err('robots/sitemap', e); }
  report.sitemap.urls = urls.size;
  const navLinks = [];
  for (const m of home.html.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) { const u = abs(m[1], home.url); if (u && u.startsWith(BASE)) navLinks.push({ href: u, text: m[2].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 80) }); }
  if (home.dom) for (const l of home.dom.links) if (l.href.startsWith(BASE)) navLinks.push(l);
  report.navLinks = navLinks.filter((l, i, a) => a.findIndex((x) => x.href === l.href) === i).filter((l) => KW.some((k) => (l.href + ' ' + l.text).toLowerCase().includes(k))).slice(0, 80);
  const score = (u) => { const s = u.toLowerCase(); let n = 0; for (const k of MODELS) if (s.includes(k)) n += 5; for (const k of KW) if (s.includes(k)) n += 2; if (/\/urun|\/product|\/klima/i.test(s)) n += 2; n -= Math.min(4, (s.match(/\//g) || []).length - 4) * 0.2; if (/(pdf|jpg|png|zip)$/i.test(s)) n -= 10; return n; };
  const cand = [...new Set([...urls, ...report.navLinks.map((l) => l.href)])].filter((u) => KW.some((k) => u.toLowerCase().includes(k))).map((u) => ({ u, s: score(u) })).sort((a, b) => b.s - a.s);
  report.sitemap.matched = cand.slice(0, 120).map((c) => `${c.s.toFixed(1)} ${c.u}`);
  log(`✔ site haritası: ${urls.size} adres, ${cand.length} anahtar kelime eşleşmesi`);

  /* --- Ürün sayfaları: görselleri topla --- */
  const chosen = [];
  const perModel = {};
  for (const c of cand) { const model = (MODELS.find((k) => c.u.toLowerCase().includes(k))) || 'genel'; perModel[model] = (perModel[model] || 0) + 1; if (perModel[model] <= 2) chosen.push(c.u); if (chosen.length >= PAGES) break; }
  if (!chosen.length && home.url) chosen.push(home.url);
  let pi = 0;
  for (const u of chosen) {
    const entry = { url: u, title: null, images: [] };
    report.pages.push(entry);
    let html = null, dom = null;
    try { const r = await get(u); html = r.text; } catch (e) { entry.fetchError = e.message; }
    try { const r = await render(u, `page-${++pi}-${slug(u.split('/').filter(Boolean).pop())}.jpg`); if (r) { dom = r.dom; if (!html) html = r.html; } } catch (e) { entry.renderError = e.message; }
    if (!html) continue;
    fs.writeFileSync(path.join(out, 'raw', `page-${pi}.html`), html);
    entry.title = (dom && (dom.h1 || dom.title)) || meta(html, 'og:title') || (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || null;
    const dir = path.join(out, 'products', `${pi}-${slug(entry.title || u.split('/').pop())}`);
    fs.mkdirSync(dir, { recursive: true });
    const imgs = [];
    const og = abs(meta(html, 'og:image'), u); if (og) imgs.push({ src: og, how: 'og:image', s: 6 });
    for (const im of imgTags(html, u)) imgs.push({ src: im.src, alt: im.alt, how: 'img', s: 0 });
    if (dom) for (const i of dom.imgs) if (i.src && !junk(i.src) && (i.w >= 260 || i.rw >= 200)) imgs.push({ src: i.src, alt: i.alt, how: 'dom-img', w: i.w, h: i.h, rendered: `${i.rw}x${i.rh}@${i.left},${i.top}`, s: 3 + Math.min(4, i.rw / 200) });
    for (const m of html.matchAll(/"(https?:\/\/[^"]+\/-\/media\/[^"]+\.(?:png|jpe?g|webp))(?:\?[^"]*)?"/gi)) imgs.push({ src: m[1], how: 'media-url', s: 1 });
    const rank = (i) => { const s = (i.src + ' ' + (i.alt || '')).toLowerCase(); let n = i.s || 0; if (/logo|icon|flag|badge|award|energy|label|banner|hero|kv_|keyvisual|lifestyle/.test(s)) n -= 3; if (/\.png(\?|$)/.test(s)) n += 2; if (/packshot|product|urun|front|unit|indoor|ftx|atx|ctx/.test(s)) n += 3; if (/\.svg(\?|$)/.test(s)) n -= 6; return n; };
    const list = imgs.filter((i, k, a) => a.findIndex((x) => x.src === i.src) === k).map((i) => Object.assign(i, { rank: rank(i) })).sort((a, b) => b.rank - a.rank);
    entry.candidates = list.length;
    let ni = 0;
    for (const i of list.slice(0, 7)) {
      try { const e = await download(i.src, dir, `img-${++ni}`); if (e) { if (e.width && e.width < 200 && e.type !== 'svg') { for (const f of [e.file, e.small && e.small.png, e.small && e.small.webp, e.trim && e.trim.png]) if (f) { try { fs.unlinkSync(path.join(root, f)); } catch {} } entry.images.push({ src: i.src, how: i.how, skipped: `küçük (${e.width}x${e.height})` }); } else entry.images.push(Object.assign({ how: i.how, alt: i.alt, rendered: i.rendered, rank: i.rank }, e)); } }
      catch (e) { entry.images.push({ src: i.src, how: i.how, error: e.message }); }
    }
    log(`✔ ${entry.title || u}: ${entry.images.filter((x) => x.file || x.small).length} görsel`);
  }

  /* --- Elle verilen adresler --- */
  let mi = 0;
  for (const u of MANUAL) {
    try { const e = await download(u, path.join(out, 'manual'), `m-${++mi}`); if (e) report.manual.push(e); log(`✔ manuel: ${u}`); }
    catch (e) { report.manual.push({ src: u, error: e.message }); err(`manuel ${u}`, e); }
  }

  if (browser) await browser.close();
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
  const md = [`# Daikin varlık raporu (${report.fetchedAt})`, '', `Kaynak: ${BASE} (ana sayfa: ${home.via}) · araçlar: sharp=${report.tools.sharp} playwright=${report.tools.playwright}`, '', '## Logo adayları', ...report.logo.map((l) => `- ${l.how}: ${l.file || l.src} ${l.width ? `(${l.width}x${l.height}, ${l.type}${l.alpha ? ', alfa' : ''})` : ''} ${l.error ? '✘ ' + l.error : ''}`), '', '## Ürün sayfaları', ...report.pages.flatMap((p) => [`- **${p.title || '?'}** ${p.url} ${p.fetchError ? '(fetch ✘ ' + p.fetchError + ')' : ''}`, ...p.images.map((i) => `  - ${i.how}: ${i.small ? i.small.png : i.file || i.src} ${i.width ? `(${i.width}x${i.height}${i.alpha ? ', alfa' : ''})` : ''} ${i.skipped ? '↷ ' + i.skipped : ''} ${i.error ? '✘ ' + i.error : ''}`)]), '', '## Site haritası eşleşmeleri (ilk 40)', ...report.sitemap.matched.slice(0, 40).map((s) => `- ${s}`), '', '## Hatalar', ...report.errors.map((e) => `- ${e}`)];
  fs.writeFileSync(path.join(out, 'report.md'), md.join('\n'));
  log(`✔ rapor: ${path.relative(root, path.join(out, 'report.md'))} (${report.errors.length} hata)`);
})().catch(async (e) => { console.error(e); if (browser) await browser.close(); process.exit(1); });
