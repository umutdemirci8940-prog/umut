#!/usr/bin/env node
'use strict';
/**
 * Marka referansı: verilen sitelerin ekran görüntüsünü alır, kullanılan renkleri,
 * fontları, CSS değişkenlerini ve logo görsellerini garanti-bonus-masthead/brand-ref/ altına yazar.
 * Kullanım: node tools/brand-ref.js
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const SITES = [
  ['garantibbva', 'https://www.garantibbva.com.tr/'],
  ['bonus', 'https://www.bonus.com.tr/'],
  ['bonus-kampanyalar', 'https://www.bonus.com.tr/kampanyalar'],
];
const out = path.join(__dirname, '..', 'garanti-bonus-masthead', 'brand-ref');
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'tr-TR',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36' });
  const report = {};
  for (const [key, url] of SITES) {
    const page = await ctx.newPage();
    const fonts = new Set();
    page.on('response', r => { const u = r.url(); if (/\.(woff2?|ttf|otf)(\?|$)/i.test(u)) fonts.add(u); });
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    } catch (e) { report[key] = { error: e.message }; console.log(key, e.message); await page.close(); continue; }
    await page.waitForTimeout(2500);
    // Çerez bandını kapatmayı dene
    for (const t of ['Kabul Et', 'Tümünü Kabul Et', 'Kabul et', 'Tamam']) {
      const b = page.getByRole('button', { name: t }); if (await b.count()) { await b.first().click().catch(() => {}); break; }
    }
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(out, key + '-fold.png') });
    await page.screenshot({ path: path.join(out, key + '-full.jpg'), fullPage: true, quality: 70 }).catch(() => {});

    const info = await page.evaluate(() => {
      const count = (m, k) => { if (k && k !== 'rgba(0, 0, 0, 0)' && k !== 'transparent') m[k] = (m[k] || 0) + 1; };
      const bg = {}, fg = {}, border = {}, fam = {}, radius = {};
      const btns = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const s = getComputedStyle(el);
        count(bg, s.backgroundColor); count(fg, s.color); count(fam, s.fontFamily);
        if (s.borderTopWidth !== '0px') count(border, s.borderTopColor);
        if (s.borderRadius !== '0px') count(radius, s.borderRadius);
        if ((el.tagName === 'BUTTON' || el.tagName === 'A') && s.backgroundColor !== 'rgba(0, 0, 0, 0)' && el.textContent.trim() && btns.length < 25)
          btns.push({ text: el.textContent.trim().slice(0, 40), bg: s.backgroundColor, color: s.color, radius: s.borderRadius, font: s.fontFamily, weight: s.fontWeight, size: s.fontSize, h: Math.round(r.height) });
      }
      const top = m => Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 25);
      const vars = {};
      for (const sh of document.styleSheets) {
        let rules; try { rules = sh.cssRules; } catch { continue; }
        for (const r of rules) if (r.style && (r.selectorText === ':root' || r.selectorText === 'html' || r.selectorText === 'body'))
          for (const p of r.style) if (p.startsWith('--')) vars[p] = r.style.getPropertyValue(p).trim();
      }
      const fontFaces = [];
      for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; }
        for (const r of rules) if (r.constructor.name === 'CSSFontFaceRule') fontFaces.push(r.cssText.slice(0, 300)); }
      const h = [...document.querySelectorAll('h1,h2,h3')].slice(0, 12).map(e => { const s = getComputedStyle(e); return { tag: e.tagName, text: e.textContent.trim().slice(0, 60), font: s.fontFamily, weight: s.fontWeight, size: s.fontSize, color: s.color }; });
      const logos = [...document.querySelectorAll('img, svg, [class*="logo" i] *')].filter(e => /logo|garanti|bbva|bonus/i.test((e.getAttribute('src') || '') + (e.getAttribute('alt') || '') + (e.getAttribute('class') || '') + (e.closest('[class*="logo" i]') ? 'logo' : '')))
        .slice(0, 20).map(e => e.tagName.toLowerCase() === 'svg' ? { svg: e.outerHTML.slice(0, 20000) } : { src: e.currentSrc || e.src, alt: e.alt });
      return { title: document.title, bg: top(bg), fg: top(fg), border: top(border), fonts: top(fam), radius: top(radius), buttons: btns, headings: h, vars, fontFaces: fontFaces.slice(0, 30), logos };
    });
    info.fontFiles = [...fonts];
    // Logo dosyalarını indir
    let n = 0;
    for (const l of info.logos) {
      try {
        if (l.svg) { fs.writeFileSync(path.join(out, `${key}-logo-${n++}.svg`), l.svg); continue; }
        if (!l.src || l.src.startsWith('data:')) continue;
        const res = await ctx.request.get(l.src); if (!res.ok()) continue;
        const ext = (l.src.split('?')[0].match(/\.(svg|png|jpe?g|webp|gif)$/i) || [, 'bin'])[1];
        fs.writeFileSync(path.join(out, `${key}-logo-${n++}.${ext}`), await res.body());
      } catch { /* atla */ }
    }
    for (const l of info.logos) if (l.svg) l.svg = l.svg.slice(0, 200) + '…';
    report[key] = info;
    await page.close();
  }
  fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 1));
  await browser.close();
  console.log('Tamam:', fs.readdirSync(out).join(', '));
})();
