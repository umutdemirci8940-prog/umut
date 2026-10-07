#!/usr/bin/env node
'use strict';
/**
 * tabii.com/tr ana sayfasındaki dizi/film afişlerini (başlıklarıyla) indirir.
 * Sayfa yavaşça kaydırılır ki tembel yüklenen görseller de gelsin.
 * Çıktı: tabii-4dortluk/assets/site/posters/*.{jpg,webp,png} + posters.json
 *
 * Kullanım: node tabii-4dortluk/tools/fetch-posters.js [--url=https://www.tabii.com/tr] [--max=90]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const arg = (k, d) => (process.argv.find((a) => a.startsWith(`--${k}=`)) || '').split('=').slice(1).join('=') || d;
const URL_ = arg('url', 'https://www.tabii.com/tr');
const MAX = +arg('max', 90);
const out = path.join(__dirname, '..', 'assets', 'site', 'posters');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 }, locale: 'tr-TR' });
  const page = await ctx.newPage();
  const seen = new Map(); // ağdan gelen görsel adresleri
  page.on('response', (r) => {
    const u = r.url(); const t = r.headers()['content-type'] || '';
    if (/image\/(jpe?g|webp|png|avif)/.test(t) && /tabii/.test(new URL(u).hostname)) seen.set(u, t);
  });
  await page.goto(URL_, { waitUntil: 'networkidle', timeout: 60000 }).catch((e) => console.log('goto:', e.message));
  for (const sel of ['button:has-text("Kabul")', 'button:has-text("Tümünü kabul")', 'button:has-text("Accept")']) {
    try { await page.click(sel, { timeout: 1500 }); break; } catch {}
  }
  // tembel yüklemeyi tetikle; yatay kaydırıcıları da sona sür
  for (let i = 0; i < 40; i++) {
    await page.mouse.wheel(0, 700);
    await page.waitForTimeout(350);
  }
  await page.evaluate(() => document.querySelectorAll('*').forEach((el) => { if (el.scrollWidth > el.clientWidth + 50 && getComputedStyle(el).overflowX !== 'visible') el.scrollLeft = el.scrollWidth; }));
  await page.waitForTimeout(2500);

  const items = await page.evaluate(() => {
    const abs = (u) => { try { return new URL(u, location.href).href; } catch { return null; } };
    const best = (img) => {
      const ss = img.getAttribute('srcset');
      if (ss) {
        const parts = ss.split(',').map((s) => s.trim().split(/\s+/)).map(([u, w]) => [u, parseInt(w) || 0]).sort((a, b) => b[1] - a[1]);
        // 400-800 px arası yeterli; en büyüğü almaya gerek yok
        const pick = parts.find((p) => p[1] && p[1] <= 828) || parts[parts.length - 1];
        return abs(pick[0]);
      }
      return abs(img.currentSrc || img.src);
    };
    const res = [];
    document.querySelectorAll('img').forEach((img) => {
      const u = best(img); if (!u || !/tabii/.test(u) || /\.svg/.test(u)) return;
      const r = img.getBoundingClientRect();
      const sec = img.closest('section, [class*="row" i], [class*="carousel" i], [class*="swiper" i]');
      const h = sec && sec.querySelector('h2, h3');
      res.push({ url: u, alt: img.alt || img.closest('a')?.getAttribute('aria-label') || img.closest('a')?.title || '',
        href: img.closest('a') ? img.closest('a').href : null, w: img.naturalWidth, h: img.naturalHeight,
        boxW: Math.round(r.width), boxH: Math.round(r.height), section: h ? h.innerText.trim().slice(0, 60) : '' });
    });
    document.querySelectorAll('[style*="background-image"]').forEach((el) => {
      const m = el.style.backgroundImage.match(/url\(["']?([^"')]+)/); if (!m) return;
      const r = el.getBoundingClientRect();
      res.push({ url: abs(m[1]), alt: el.getAttribute('aria-label') || '', w: 0, h: 0, boxW: Math.round(r.width), boxH: Math.round(r.height), section: 'background' });
    });
    return res;
  });

  const uniq = []; const keys = new Set();
  for (const it of items) { const k = it.url.split('?')[0]; if (!keys.has(k)) { keys.add(k); uniq.push(it); } }
  // DOM'da görünmeyen ama ağdan gelen görselleri de ekle
  for (const u of seen.keys()) { const k = u.split('?')[0]; if (!keys.has(k)) { keys.add(k); uniq.push({ url: u, alt: '', section: 'network' }); } }

  const list = [];
  let n = 0;
  for (const it of uniq) {
    if (n >= MAX) break;
    try {
      const r = await ctx.request.get(it.url);
      if (!r.ok()) continue;
      const buf = await r.body();
      if (buf.length < 4000) continue; // ikon/izleme pikselleri
      const t = r.headers()['content-type'] || '';
      const ext = /webp/.test(t) ? 'webp' : /png/.test(t) ? 'png' : /avif/.test(t) ? 'avif' : 'jpg';
      const file = `p${String(n).padStart(2, '0')}.${ext}`;
      fs.writeFileSync(path.join(out, file), buf);
      list.push({ file, bytes: buf.length, ...it });
      n++;
    } catch (e) { console.log('indirilemedi', it.url, e.message); }
  }
  fs.writeFileSync(path.join(out, 'posters.json'), JSON.stringify(list, null, 1));
  console.log(`${list.length} görsel kaydedildi`);
  console.log(list.map((p) => `${p.file}\t${p.w}x${p.h}\t${p.boxW}x${p.boxH}\t${p.section}\t${p.alt}`).join('\n'));
  await browser.close();
})();
