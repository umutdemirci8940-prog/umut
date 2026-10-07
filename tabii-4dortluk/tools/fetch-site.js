#!/usr/bin/env node
'use strict';
/**
 * tabii.com/tr üzerinden marka varlıklarını toplar (GitHub Actions'ta çalışır):
 *   - Logo (header'daki SVG ya da görsel), favicon / manifest ikonları, og:image
 *   - Tema rengi, sayfada en çok kullanılan renkler, butonların renkleri, font aileleri
 *   - Yüklenen @font-face dosyaları ve ana sayfa ekran görüntüleri
 * Çıktı: tabii-4dortluk/assets/site/ (report.json + dosyalar)
 *
 * Kullanım: node tabii-4dortluk/tools/fetch-site.js [--url=https://www.tabii.com/tr]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=') || d;
const URL_ = arg('url', 'https://www.tabii.com/tr');
const out = path.join(__dirname, '..', 'assets', 'site');
fs.mkdirSync(out, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 }, locale: 'tr-TR' });
  const page = await ctx.newPage();
  const fonts = new Set(); const images = [];
  page.on('response', (r) => {
    const u = r.url(); const t = r.headers()['content-type'] || '';
    if (/\.(woff2?|otf|ttf)(\?|$)/i.test(u) || /font/.test(t)) fonts.add(u);
    if (/logo|brand/i.test(u) && (/image/.test(t) || /\.(svg|png|webp)(\?|$)/i.test(u))) images.push(u);
  });
  const report = { url: URL_, fetchedAt: new Date().toISOString() };
  try {
    const res = await page.goto(URL_, { waitUntil: 'networkidle', timeout: 60000 });
    report.status = res && res.status();
  } catch (e) { report.gotoError = e.message; }
  await page.waitForTimeout(3000);
  for (const sel of ['button:has-text("Kabul")', 'button:has-text("Tümünü kabul")', 'button:has-text("Accept")']) {
    try { await page.click(sel, { timeout: 1500 }); break; } catch {}
  }
  await page.screenshot({ path: path.join(out, 'home-fold.png') });
  await page.screenshot({ path: path.join(out, 'home-full.png'), fullPage: true }).catch(() => {});

  Object.assign(report, await page.evaluate(() => {
    const meta = (n) => { const m = document.querySelector(`meta[name="${n}"],meta[property="${n}"]`); return m && m.content; };
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return u; } };
    // logo adayları
    const cands = [];
    document.querySelectorAll('header svg, header img, a[href="/"] svg, a[href="/tr"] svg, a[href="/"] img, a[href="/tr"] img, [class*="logo" i] svg, [class*="logo" i] img, img[alt*="tabii" i], svg[aria-label*="tabii" i]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width < 20 || r.height < 10) return;
      const svg = el.tagName.toLowerCase() === 'svg' ? el.cloneNode(true) : null;
      if (svg) {
        // currentColor'ı gerçek renge çevir
        const col = getComputedStyle(el).color;
        svg.querySelectorAll('[fill="currentColor"],[stroke="currentColor"]').forEach((n) => {
          if (n.getAttribute('fill') === 'currentColor') n.setAttribute('fill', col);
          if (n.getAttribute('stroke') === 'currentColor') n.setAttribute('stroke', col);
        });
        if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }
      cands.push({ tag: el.tagName.toLowerCase(), cls: String(el.className && el.className.baseVal !== undefined ? el.className.baseVal : el.className),
        alt: el.getAttribute('alt') || el.getAttribute('aria-label'), src: el.src ? abs(el.getAttribute('src')) : null,
        box: [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)], color: getComputedStyle(el).color,
        svg: svg ? svg.outerHTML : null });
    });
    // renk sayımı
    const count = {};
    const add = (c, w) => { if (!c || c === 'rgba(0, 0, 0, 0)' || c === 'transparent') return; count[c] = (count[c] || 0) + w; };
    document.querySelectorAll('body *').forEach((el) => {
      const r = el.getBoundingClientRect(); if (!r.width || !r.height) return;
      const s = getComputedStyle(el); const area = Math.min(r.width * r.height, 200000) / 1000;
      add(s.backgroundColor, area); add(s.color, 1); add(s.borderTopColor !== s.color ? null : null, 0);
    });
    const colors = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 25).map(([c, w]) => ({ c, w: Math.round(w) }));
    const buttons = [...document.querySelectorAll('button, a[class*="button" i], a[class*="btn" i]')].slice(0, 40).map((b) => {
      const s = getComputedStyle(b); return { text: b.innerText.trim().slice(0, 40), bg: s.backgroundColor, color: s.color, radius: s.borderRadius, font: s.fontFamily, weight: s.fontWeight };
    }).filter((b) => b.text);
    const fams = {};
    document.querySelectorAll('body *').forEach((el) => { const f = getComputedStyle(el).fontFamily; fams[f] = (fams[f] || 0) + 1; });
    const cssVars = {};
    for (const sh of document.styleSheets) { try { for (const r of sh.cssRules) { if (r.selectorText === ':root' || r.selectorText === 'html') { for (const p of r.style) if (p.startsWith('--')) cssVars[p] = r.style.getPropertyValue(p).trim(); } } } catch {} }
    const headings = [...document.querySelectorAll('h1,h2,h3')].slice(0, 40).map((h) => h.innerText.trim()).filter(Boolean);
    const icons = [...document.querySelectorAll('link[rel*="icon"], link[rel="manifest"], link[rel="apple-touch-icon"]')].map((l) => ({ rel: l.rel, href: abs(l.getAttribute('href')), sizes: l.getAttribute('sizes') }));
    return { title: document.title, themeColor: meta('theme-color'), ogImage: meta('og:image'), description: meta('description') || meta('og:description'),
      logoCandidates: cands.slice(0, 12), colors, buttons, fontFamilies: Object.entries(fams).sort((a, b) => b[1] - a[1]).slice(0, 8), cssVars, headings, icons };
  }));
  report.fontUrls = [...fonts]; report.logoUrls = [...new Set(images)];

  // logo dosyalarını kaydet
  report.logoCandidates.forEach((c, i) => { if (c.svg) fs.writeFileSync(path.join(out, `logo-${i}.svg`), c.svg); });
  const dl = async (u, name) => {
    try { const r = await ctx.request.get(u); if (r.ok()) { fs.writeFileSync(path.join(out, name), await r.body()); return name; } } catch {}
    return null;
  };
  report.saved = [];
  let k = 0;
  for (const u of [...new Set([...report.logoCandidates.map((c) => c.src).filter(Boolean), ...report.logoUrls])].slice(0, 8)) {
    const ext = (u.split('?')[0].match(/\.(svg|png|webp|jpe?g)$/i) || [, 'bin'])[1];
    const n = await dl(u, `logo-img-${k++}.${ext}`); if (n) report.saved.push({ from: u, file: n });
  }
  for (const ic of report.icons) {
    if (/manifest/.test(ic.rel)) {
      try { const m = await (await ctx.request.get(ic.href)).json(); report.manifest = m; } catch {}
    } else {
      const ext = (ic.href.split('?')[0].match(/\.(svg|png|ico|webp)$/i) || [, 'png'])[1];
      const n = await dl(ic.href, `icon-${k++}.${ext}`); if (n) report.saved.push({ from: ic.href, file: n });
    }
  }
  if (report.ogImage) { const n = await dl(report.ogImage, 'og-image.' + ((report.ogImage.split('?')[0].match(/\.(png|jpe?g|webp)$/i) || [, 'jpg'])[1])); if (n) report.saved.push({ from: report.ogImage, file: n }); }
  // fontlar (en fazla 6)
  fs.mkdirSync(path.join(out, 'fonts'), { recursive: true });
  for (const u of report.fontUrls.slice(0, 6)) {
    const n = decodeURIComponent(u.split('?')[0].split('/').pop()).replace(/[^\w.-]/g, '_');
    const f = await dl(u, 'fonts/' + n); if (f) report.saved.push({ from: u, file: f });
  }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  console.log(JSON.stringify({ status: report.status, title: report.title, themeColor: report.themeColor, logos: report.logoCandidates.length, saved: report.saved.length, colors: report.colors.slice(0, 8) }, null, 1));
  await browser.close();
})();
