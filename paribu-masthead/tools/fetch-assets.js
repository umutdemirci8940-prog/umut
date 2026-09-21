#!/usr/bin/env node
'use strict';
/**
 * paribu.com üzerindeki gerçek marka varlıklarını toplar: logo (SVG/PNG), sembol (uygulama ikonu),
 * tema/CTA renkleri, fontlar, ana sayfa başlıkları ve ekran görüntüleri. Sayfalar gerçek bir tarayıcıda
 * (Playwright + Chromium) açılır; ayrıca basın/medya sayfalarındaki logo dosyaları (svg/png/zip) indirilir.
 *
 * Claude Code'un bulut oturumu paribu.com'a erişemediği için bu betik GitHub Actions'ta çalışır
 * (.github/workflows/fetch-assets.yml). Çıktı: assets/manifest.json, assets/report.md, assets/logo/*, assets/site/*
 *
 * Kullanım: NODE_PATH=$(npm root -g) node tools/fetch-assets.js [--base=https://www.paribu.com]
 *           [--extra=https://net.paribu.com/medya,https://www.paribu.com/blog/] [--out=assets]
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const BASE = String(args.base || 'https://www.paribu.com').replace(/\/$/, '');
const EXTRA = String(args.extra || 'https://net.paribu.com/medya,https://www.paribu.com/blog/,https://www.paribu.com/hub').split(',').map((s) => s.trim()).filter(Boolean);
const root = path.join(__dirname, '..');
const out = path.resolve(root, String(args.out || 'assets'));
const logoDir = path.join(out, 'logo'), siteDir = path.join(out, 'site');
fs.mkdirSync(logoDir, { recursive: true }); fs.mkdirSync(siteDir, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 50) || 'x';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const report = [];
const log = (s) => { console.log(s); report.push(s); };
const hexOf = (c) => { const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/); if (!m) return /^#/.test(c) ? c : null; if (m[4] !== undefined && +m[4] < 0.5) return null; return '#' + [m[1], m[2], m[3]].map((v) => (+v).toString(16).padStart(2, '0')).join(''); };
const hsl = (hex) => { let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); const r = (n >> 16) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2; const s = mx === mn ? 0 : (mx - mn) / (1 - Math.abs(2 * l - 1)); let hue = 0; if (mx !== mn) { hue = mx === r ? ((g - b) / (mx - mn)) % 6 : mx === g ? (b - r) / (mx - mn) + 2 : (r - g) / (mx - mn) + 4; hue = Math.round(hue * 60); if (hue < 0) hue += 360; } return { h: hue, s, l }; };
const mix = (hex, pct) => { let h = hex.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h, 16); const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct / 100) * (pct > 0 ? 255 - c : c)))); const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255); return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); };
const svgSize = (svg) => { const vb = svg.match(/viewBox="([\d.\s,-]+)"/); if (vb) { const v = vb[1].trim().split(/[\s,]+/).map(Number); if (v[2] && v[3]) return { w: v[2], h: v[3] }; } const w = svg.match(/\bwidth="([\d.]+)/), h = svg.match(/\bheight="([\d.]+)/); return w && h ? { w: +w[1], h: +h[1] } : null; };
const svgDark = (svg) => { const fills = [...svg.matchAll(/(?:fill|stroke)[=:]\s*"?(#[0-9a-fA-F]{3,6}|black|white|currentColor)/g)].map((m) => m[1].toLowerCase()); if (!fills.length) return true; let d = 0, l = 0; for (const f of fills) { if (f === 'black' || f === 'currentcolor') { d++; continue; } if (f === 'white') { l++; continue; } const { s, l: lum } = hsl(f); if (s < 0.35) { if (lum < 0.45) d++; else l++; } } return d >= l; };
const pngSize = (buf) => (buf.length > 24 && buf.readUInt32BE(12) === 0x49484452) ? { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) } : null;

const cands = [];   // {file, from, kind, w, h, ext, dark, page, score}
const colorsFound = new Map(); // hex → {count, where[]}
const fontsFound = new Map();
const texts = { title: [], h1: [], h2: [], buttons: [] };
const pagesDone = [];
let themeColor = null;

function addColor(hex, where) { if (!hex) return; hex = hex.toLowerCase(); const e = colorsFound.get(hex) || { count: 0, where: new Set() }; e.count++; e.where.add(where); colorsFound.set(hex, e); }
function saveCand(name, buf, meta) {
  const file = path.join(logoDir, name);
  fs.writeFileSync(file, buf);
  const rel = path.relative(root, file).split(path.sep).join('/');
  const c = Object.assign({ file: rel, bytes: buf.length }, meta);
  cands.push(c); return c;
}

async function grabPage(ctx, url, isBase) {
  const page = await ctx.newPage();
  const fontFiles = new Map();
  page.on('response', async (r) => {
    try {
      const u = r.url(), ct = String(r.headers()['content-type'] || '');
      if (/\.(woff2?|otf|ttf)(\?|$)/i.test(u) || /font\//.test(ct)) { if (!fontFiles.has(u)) fontFiles.set(u, await r.body()); }
      if (/logo/i.test(u) && /\.(svg|png|webp)(\?|$)/i.test(u)) { const b = await r.body(); if (b.length > 200) saveCand(`net-${slug(path.basename(new URL(u).pathname))}.${(u.match(/\.(svg|png|webp)/i) || [, 'png'])[1].toLowerCase()}`, b, { from: u, kind: 'network', page: url }); }
    } catch { /* yoksay */ }
  });
  log(`\n## ${url}`);
  let status = null;
  try {
    const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    status = resp && resp.status();
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => { });
    await sleep(1500);
    // çerez bandını kapatmayı dene
    for (const sel of ['button:has-text("Kabul")', 'button:has-text("Tümünü Kabul")', 'button:has-text("Accept")', '[id*=cookie] button', '[class*=cookie] button']) {
      try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 500 })) { await b.click({ timeout: 1000 }); await sleep(400); break; } } catch { /* yok */ }
    }
  } catch (e) { log(`- HATA: ${e.message.split('\n')[0]}`); await page.close().catch(() => { }); return; }
  log(`- durum ${status}, başlık: ${await page.title()}`);
  const shot = path.join(siteDir, `${slug(url.replace(/^https?:\/\//, ''))}.jpg`);
  await page.screenshot({ path: shot, type: 'jpeg', quality: 72 }).catch(() => { });
  pagesDone.push({ url, status, shot: path.relative(root, shot).split(path.sep).join('/') });

  const info = await page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const attr = (el, n) => (el.getAttribute(n) || '').toLowerCase();
    const inHeader = (el) => !!el.closest('header, nav, [class*=header], [class*=navbar], [class*=Header], [class*=Navbar], a[href="/"], a[href="./"], a[href$=".com"], a[href$=".com/"]');
    const rect = (el) => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top) }; };
    const meta = (sel, a) => { const m = document.querySelector(sel); return m ? m.getAttribute(a) : null; };
    const outI = { theme: meta('meta[name="theme-color"]', 'content'), og: abs(meta('meta[property="og:image"]', 'content') || ''), icons: [], imgs: [], svgs: [], colors: [], vars: [], fonts: [], texts: { title: document.title, h1: [], h2: [], buttons: [] }, links: [] };
    document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"], link[rel="apple-touch-icon-precomposed"], link[rel="mask-icon"]').forEach((l) => outI.icons.push({ href: abs(l.getAttribute('href')), rel: l.getAttribute('rel'), sizes: l.getAttribute('sizes'), color: l.getAttribute('color') }));
    document.querySelectorAll('img, picture source').forEach((im) => {
      const src = abs(im.currentSrc || im.getAttribute('src') || im.getAttribute('srcset') || im.getAttribute('data-src') || '');
      if (!src) return;
      const hay = [attr(im, 'src'), attr(im, 'alt'), attr(im, 'class'), attr(im, 'id'), im.parentElement ? attr(im.parentElement, 'class') + attr(im.parentElement, 'aria-label') + attr(im.parentElement, 'href') : ''].join(' ');
      const isLogo = /logo|brand|marka/.test(hay) || inHeader(im);
      if (!isLogo) return;
      const r = rect(im);
      outI.imgs.push({ src, alt: im.getAttribute('alt'), w: im.naturalWidth || r.w, h: im.naturalHeight || r.h, disp: r, header: inHeader(im), hay });
    });
    document.querySelectorAll('svg').forEach((sv) => {
      const hay = [attr(sv, 'class'), attr(sv, 'id'), attr(sv, 'aria-label'), sv.parentElement ? attr(sv.parentElement, 'class') + attr(sv.parentElement, 'aria-label') + attr(sv.parentElement, 'href') : ''].join(' ');
      const r = rect(sv);
      const isLogo = /logo|brand|marka/.test(hay) || (inHeader(sv) && r.w >= 60 && r.h >= 14 && r.h <= 120);
      if (!isLogo) return;
      let html = sv.outerHTML;
      // <use href="#id"> ise sembolü ekle
      const uses = [...sv.querySelectorAll('use')].map((u) => (u.getAttribute('href') || u.getAttribute('xlink:href') || '').replace('#', '')).filter(Boolean);
      const defs = uses.map((id) => { const s = document.getElementById(id); return s ? s.outerHTML : ''; }).join('');
      if (defs) html = html.replace('</svg>', `<defs>${defs}</defs></svg>`);
      // currentColor → gerçek renk
      const cs = getComputedStyle(sv);
      html = html.replace(/currentColor/g, cs.color || '#000');
      if (!/xmlns=/.test(html)) html = html.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      outI.svgs.push({ html, disp: r, header: inHeader(sv), hay, fill: cs.fill, color: cs.color });
    });
    // renkler: CTA/buton zeminleri ve bağlantı renkleri
    document.querySelectorAll('button, a, [class*=btn], [class*=Btn], [class*=button], [class*=Button], [class*=cta], [role=button]').forEach((el) => {
      const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); if (r.width < 40 || r.height < 20) return;
      outI.colors.push({ bg: cs.backgroundColor, fg: cs.color, text: (el.textContent || '').trim().slice(0, 40), where: 'button' });
    });
    document.querySelectorAll('h1, h2, h3, strong, span, p').forEach((el) => { const cs = getComputedStyle(el); outI.colors.push({ fg: cs.color, where: 'text' }); });
    // :root özel değişkenleri
    try {
      for (const ss of document.styleSheets) {
        let rules; try { rules = ss.cssRules; } catch { continue; }
        for (const r of rules) {
          if (!r.style) continue;
          if (!/:root|html|body/.test(r.selectorText || '')) continue;
          for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; if (p.startsWith('--')) { const v = r.style.getPropertyValue(p).trim(); if (/^#|^rgb|^hsl/.test(v)) outI.vars.push({ name: p, value: v }); } }
        }
      }
    } catch { /* yok */ }
    const rs = getComputedStyle(document.documentElement);
    ['--primary', '--color-primary', '--brand', '--green', '--paribu-green', '--accent', '--main', '--primary-color', '--secondary'].forEach((n) => { const v = rs.getPropertyValue(n).trim(); if (v) outI.vars.push({ name: n, value: v }); });
    // fontlar
    ['h1', 'h2', 'body', 'button', 'a', 'p'].forEach((s) => { const el = document.querySelector(s); if (el) outI.fonts.push({ sel: s, family: getComputedStyle(el).fontFamily, weight: getComputedStyle(el).fontWeight }); });
    // metinler
    document.querySelectorAll('h1').forEach((h) => { const t = h.textContent.trim().replace(/\s+/g, ' '); if (t && outI.texts.h1.length < 12) outI.texts.h1.push(t.slice(0, 160)); });
    document.querySelectorAll('h2').forEach((h) => { const t = h.textContent.trim().replace(/\s+/g, ' '); if (t && outI.texts.h2.length < 16) outI.texts.h2.push(t.slice(0, 160)); });
    document.querySelectorAll('button, a[class*=btn], a[class*=Button]').forEach((b) => { const t = b.textContent.trim().replace(/\s+/g, ' '); if (t && t.length < 40 && !outI.texts.buttons.includes(t) && outI.texts.buttons.length < 24) outI.texts.buttons.push(t); });
    // basın kiti bağlantıları
    document.querySelectorAll('a[href]').forEach((a) => { const h = abs(a.getAttribute('href')); const t = (a.textContent || '').trim().toLowerCase(); if (!h) return; if (/\.(svg|png|zip|pdf|ai|eps)(\?|$)/i.test(h) && /logo|marka|brand|kit|basın|basin|press|kurumsal/i.test(h + ' ' + t)) outI.links.push({ href: h, text: t.slice(0, 60) }); else if (/logo|basın|basin|press|kurumsal-kimlik|brand/i.test(t) && /paribu/.test(h)) outI.links.push({ href: h, text: t.slice(0, 60), page: true }); });
    return outI;
  });

  if (info.theme && !themeColor) { themeColor = info.theme; log(`- theme-color: ${info.theme}`); }
  for (const c of info.colors) { if (c.bg) addColor(hexOf(c.bg), `${c.where} bg${c.text ? ' "' + c.text + '"' : ''}`); if (c.fg) addColor(hexOf(c.fg), `${c.where} fg`); }
  for (const v of info.vars) addColor(hexOf(v.value) || v.value, `var ${v.name}`);
  for (const f of info.fonts) { const k = f.family.split(',')[0].replace(/["']/g, '').trim(); const e = fontsFound.get(k) || new Set(); e.add(f.sel + ' ' + f.weight); fontsFound.set(k, e); }
  if (isBase) { texts.title.push(info.texts.title); texts.h1.push(...info.texts.h1); texts.h2.push(...info.texts.h2); texts.buttons.push(...info.texts.buttons); }
  log(`- ${info.imgs.length} logo/başlık görseli, ${info.svgs.length} satır içi SVG, ${info.icons.length} ikon, ${info.links.length} basın/logo bağlantısı`);

  // satır içi SVG'ler
  info.svgs.forEach((s, i) => {
    const size = svgSize(s.html) || { w: s.disp.w, h: s.disp.h };
    saveCand(`${slug(new URL(url).hostname)}-inline-${i + 1}.svg`, Buffer.from(s.html), { from: url + ' (inline svg)', kind: 'inline-svg', w: size.w, h: size.h, disp: s.disp, header: s.header, dark: svgDark(s.html), hay: s.hay, page: url });
  });
  // görseller ve ikonlar
  const dl = async (u, name, meta) => {
    try {
      const r = await ctx.request.get(u, { timeout: 30000, headers: { 'user-agent': UA, referer: url } });
      if (!r.ok()) { log(`  ✘ ${u} → ${r.status()}`); return null; }
      const buf = await r.body(); const ct = String(r.headers()['content-type'] || '');
      const ext = /svg/.test(ct) || /\.svg(\?|$)/i.test(u) ? 'svg' : /webp/.test(ct) ? 'webp' : /png/.test(ct) || /\.png(\?|$)/i.test(u) ? 'png' : /jpe?g/.test(ct) ? 'jpg' : /icon/.test(ct) || /\.ico(\?|$)/i.test(u) ? 'ico' : 'bin';
      if (buf.length < 100) return null;
      const size = ext === 'svg' ? svgSize(buf.toString('utf8')) : ext === 'png' ? pngSize(buf) : null;
      return saveCand(`${name}.${ext}`, buf, Object.assign({ from: u, w: size && size.w, h: size && size.h, dark: ext === 'svg' ? svgDark(buf.toString('utf8')) : null, page: url }, meta));
    } catch (e) { log(`  ✘ ${u}: ${e.message.split('\n')[0]}`); return null; }
  };
  let n = 0;
  for (const im of info.imgs) { n++; await dl(im.src, `${slug(new URL(url).hostname)}-img-${n}-${slug(path.basename(new URL(im.src).pathname).replace(/\.[a-z]+$/i, ''))}`, { kind: 'img', header: im.header, alt: im.alt, disp: im.disp, hay: im.hay, w0: im.w, h0: im.h }); }
  for (const ic of info.icons) { if (!ic.href) continue; n++; await dl(ic.href, `${slug(new URL(url).hostname)}-icon-${n}-${slug(ic.rel)}-${slug(ic.sizes || '')}`, { kind: 'icon', rel: ic.rel, sizes: ic.sizes }); }
  if (info.og) { n++; await dl(info.og, `${slug(new URL(url).hostname)}-og-image`, { kind: 'og' }); }
  // basın kiti bağlantıları (dosyalar)
  for (const l of info.links.slice(0, 20)) {
    if (l.page) { log(`  ↳ sayfa adayı: ${l.href} (${l.text})`); continue; }
    if (/\.zip(\?|$)/i.test(l.href)) {
      try {
        const r = await ctx.request.get(l.href, { timeout: 60000 }); if (!r.ok()) continue; const buf = await r.body(); if (buf.length > 40 * 1024 * 1024) continue;
        const zdir = path.join(logoDir, 'press', slug(path.basename(new URL(l.href).pathname))); fs.mkdirSync(zdir, { recursive: true });
        const zf = path.join(zdir, 'kit.zip'); fs.writeFileSync(zf, buf);
        try { execSync(`unzip -o -q "${zf}" -d "${zdir}"`); } catch { }
        fs.rmSync(zf, { force: true });
        const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
        for (const f of walk(zdir)) { const ext = path.extname(f).slice(1).toLowerCase(); if (!['svg', 'png'].includes(ext)) continue; const b = fs.readFileSync(f); const size = ext === 'svg' ? svgSize(b.toString('utf8')) : pngSize(b); cands.push({ file: path.relative(root, f).split(path.sep).join('/'), bytes: b.length, from: l.href, kind: 'press-kit', w: size && size.w, h: size && size.h, dark: ext === 'svg' ? svgDark(b.toString('utf8')) : null, page: url }); }
        log(`  ✔ basın kiti açıldı: ${l.href}`);
      } catch (e) { log(`  ✘ zip ${l.href}: ${e.message.split('\n')[0]}`); }
    } else if (/\.(svg|png)(\?|$)/i.test(l.href)) { n++; await dl(l.href, `press-${n}-${slug(path.basename(new URL(l.href).pathname).replace(/\.[a-z]+$/i, ''))}`, { kind: 'press-link', text: l.text }); }
  }
  // fontlar (yalnızca rapor + dosya; gömme kararı elle)
  let fi = 0;
  for (const [u, buf] of fontFiles) { fi++; if (fi > 12) break; const fdir = path.join(siteDir, 'fonts'); fs.mkdirSync(fdir, { recursive: true }); const nm = path.basename(new URL(u).pathname).slice(0, 60) || `font-${fi}`; fs.writeFileSync(path.join(fdir, nm), buf); }
  if (fontFiles.size) log(`- ${fontFiles.size} font dosyası görüldü (${Math.min(12, fontFiles.size)} tanesi assets/site/fonts/ altına alındı)`);
  await page.close();
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 }, locale: 'tr-TR', deviceScaleFactor: 1, ignoreHTTPSErrors: true });
  await grabPage(ctx, BASE + '/', true);
  for (const u of EXTRA) await grabPage(ctx, u, false);
  await browser.close();

  // ---- seçim ----
  const score = (c) => {
    const ext = path.extname(c.file).slice(1); const ar = c.w && c.h ? c.w / c.h : (c.disp && c.disp.h ? c.disp.w / c.disp.h : 0);
    let s = 0;
    if (ext === 'svg') s += 40; else if (ext === 'png') s += 20; else if (ext === 'webp') s += 12;
    if (c.header) s += 25;
    if (/logo/.test(String(c.hay || c.from || '').toLowerCase())) s += 20;
    if (c.kind === 'press-kit' || c.kind === 'press-link') s += 15;
    if (ar >= 2.2 && ar <= 9) s += 30; else if (ar >= 1.6 && ar < 2.2) s += 10;
    if (/paribu/i.test(c.file + (c.from || ''))) s += 5;
    if (/white|beyaz|light|negative|neg/i.test(c.file + (c.from || ''))) s += 8;   // koyu zemin için beyaz sürüm tercih
    if (/cineverse|ventures|hub|net|blog|art|log/i.test(c.file + (c.from || ''))) s -= 25; // alt markalar
    if ((c.w && c.w < 60) || (c.disp && c.disp.w && c.disp.w < 60)) s -= 30;
    return s;
  };
  const symScore = (c) => {
    const ext = path.extname(c.file).slice(1); const ar = c.w && c.h ? c.w / c.h : 1; let s = 0;
    if (c.kind === 'icon') s += 30; if (/apple-touch/.test(c.file)) s += 20; if (ext === 'svg') s += 15;
    if (ar > 0.8 && ar < 1.25) s += 25; else s -= 30;
    if (c.w) s += Math.min(20, c.w / 20);
    if (/cineverse|ventures|hub|net|blog|art/i.test(c.file + (c.from || ''))) s -= 25;
    return s;
  };
  const uniq = []; const seen = new Set();
  for (const c of cands) { const key = fs.existsSync(path.join(root, c.file)) ? require('crypto').createHash('sha1').update(fs.readFileSync(path.join(root, c.file))).digest('hex') : c.file; if (seen.has(key)) continue; seen.add(key); uniq.push(c); }
  uniq.forEach((c) => { c.score = score(c); c.symScore = symScore(c); });
  const logo = uniq.filter((c) => c.score > 40).sort((a, b) => b.score - a.score)[0] || null;
  const symbol = uniq.filter((c) => c.symScore > 40 && (!logo || c.file !== logo.file)).sort((a, b) => b.symScore - a.symScore)[0] || null;

  // renkler: doygun, orta parlaklıkta, buton zemini olan → marka rengi
  const colorRows = [...colorsFound.entries()].map(([hex, e]) => { const { h, s, l } = /^#/.test(hex) ? hsl(hex) : { h: 0, s: 0, l: 0 }; return { hex, count: e.count, where: [...e.where].slice(0, 4), h, s: +s.toFixed(2), l: +l.toFixed(2) }; }).sort((a, b) => b.count - a.count);
  const brandCand = colorRows.filter((c) => /^#/.test(c.hex) && c.s > 0.45 && c.l > 0.25 && c.l < 0.75).sort((a, b) => (b.where.some((w) => /button bg/.test(w)) ? 1000 : 0) + b.count - ((a.where.some((w) => /button bg/.test(w)) ? 1000 : 0) + a.count));
  let brand = brandCand[0] ? brandCand[0].hex : null, brandSource = brand ? 'button' : null;
  if (logo && path.extname(logo.file) === '.svg') {   // logonun kendi rengi en güvenilir marka rengidir
    const fills = {}; for (const m of fs.readFileSync(path.join(root, logo.file), 'utf8').matchAll(/(?:fill|stroke)[=:]\s*"?(#[0-9a-fA-F]{6})\b/g)) fills[m[1].toLowerCase()] = (fills[m[1].toLowerCase()] || 0) + 1;
    const lf = Object.keys(fills).filter((h) => hsl(h).s > 0.35).sort((a, b) => fills[b] - fills[a])[0];
    if (lf) { brand = lf; brandSource = 'logo'; }
  }
  if (!brand && themeColor && /^#/.test(themeColor)) { const { s, l } = hsl(themeColor); if (s > 0.4 && l > 0.2 && l < 0.8) brand = themeColor; }
  const colors = brand ? { brand, brandSource, brand2: mix(brand, 48), brandDark: mix(brand, -38), themeColor, candidates: brandCand.slice(0, 8), all: colorRows.slice(0, 40) } : { brand: null, themeColor, candidates: brandCand.slice(0, 8), all: colorRows.slice(0, 40) };

  const manifest = {
    source: BASE, fetchedAt: new Date().toISOString(), pages: pagesDone,
    logo: logo ? { file: logo.file, from: logo.from, kind: (logo.w && logo.h && logo.w / logo.h < 1.6) ? 'symbol' : 'wordmark', dark: !!logo.dark, w: logo.w, h: logo.h, score: logo.score } : null,
    symbol: symbol ? { file: symbol.file, from: symbol.from, kind: 'symbol', dark: !!symbol.dark, w: symbol.w, h: symbol.h } : null,
    colors, fonts: [...fontsFound.entries()].map(([family, where]) => ({ family, where: [...where] })), texts,
    candidates: uniq.map((c) => ({ file: c.file, from: c.from, kind: c.kind, w: c.w, h: c.h, dark: c.dark, header: c.header, score: c.score, symScore: c.symScore, bytes: c.bytes })).sort((a, b) => b.score - a.score),
  };
  fs.writeFileSync(path.join(out, 'manifest.json'), JSON.stringify(manifest, null, 1));

  const md = [`# Paribu varlık raporu`, ``, `Kaynak: ${BASE} · ${manifest.fetchedAt}`, ``, `## Seçim`, ``,
    `- Logo: ${logo ? `\`${logo.file}\` (${logo.kind}, ${logo.w}×${logo.h}, koyu: ${logo.dark}, puan ${logo.score}) ← ${logo.from}` : '**bulunamadı** (yer tutucu kullanılacak)'}`,
    `- Sembol: ${symbol ? `\`${symbol.file}\` (${symbol.w}×${symbol.h}) ← ${symbol.from}` : 'bulunamadı'}`,
    `- Marka rengi: ${brand || 'bulunamadı'} · theme-color: ${themeColor || '-'}`, ``,
    `## Renk adayları (buton zemini/metin, sıklık)`, ``, `| Renk | Sayı | Nerede |`, `|---|---|---|`, ...colorRows.slice(0, 25).map((c) => `| ${c.hex} | ${c.count} | ${c.where.join('; ')} |`), ``,
    `## Fontlar`, ``, ...manifest.fonts.map((f) => `- **${f.family}** – ${f.where.join(', ')}`), ``,
    `## Ana sayfa metinleri`, ``, `- Başlık: ${texts.title.join(' | ')}`, ...texts.h1.map((t) => `- H1: ${t}`), ...texts.h2.slice(0, 10).map((t) => `- H2: ${t}`), `- Düğmeler: ${texts.buttons.join(' · ')}`, ``,
    `## Tüm adaylar`, ``, `| Dosya | Tür | Boyut | Koyu | Puan | Kaynak |`, `|---|---|---|---|---|---|`, ...manifest.candidates.map((c) => `| ${c.file} | ${c.kind} | ${c.w || '?'}×${c.h || '?'} | ${c.dark} | ${c.score}/${c.symScore} | ${c.from} |`), ``,
    `## Günlük`, '', '```', ...report, '```'];
  fs.writeFileSync(path.join(out, 'report.md'), md.join('\n'));
  console.log(`\n✔ ${path.relative(root, path.join(out, 'manifest.json'))} yazıldı. Logo: ${logo ? logo.file : 'YOK'} · Sembol: ${symbol ? symbol.file : 'YOK'} · Renk: ${brand || 'YOK'}`);
})().catch((e) => { console.error(e); process.exit(1); });
