#!/usr/bin/env node
'use strict';
/**
 * fetch-wayback.js'in bulduğu ürünlerin detay sayfalarını (arşiv kopyası) açar ve sayfanın yüklediği
 * en büyük ürün fotoğrafını kaydeder → assets/products-hd/<anahtar>.<uzantı>
 * Ayrıca blog ve kampanya sayfalarındaki büyük (yaşam tarzı) görselleri toplar → assets/lifestyle/
 * Sonuç assets/index.json'a eklenir (products[].hd, lifestyle[]).
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const out = path.join(root, 'assets');
const idxFile = path.join(out, 'index.json');
const index = JSON.parse(fs.readFileSync(idxFile, 'utf8'));
for (const d of ['products-hd', 'lifestyle']) fs.mkdirSync(path.join(out, d), { recursive: true });
const T0 = Date.now();
const BUDGET = (+process.env.BUDGET_MIN || 30) * 60000;
const left = () => BUDGET - (Date.now() - T0);
const log = (m) => console.log(`[${Math.round((Date.now() - T0) / 1000)}s] ${m}`);
const original = (u) => { const m = u.match(/\/web\/\d+[a-z_]*\/(.+)$/); return m ? m[1] : u; };
const extOf = (type) => ((type.match(/image\/(png|jpe?g|webp|gif|avif)/) || [, 'jpg'])[1]).replace('jpeg', 'jpg');
const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
const save = () => fs.writeFileSync(idxFile, JSON.stringify(index, null, 1));
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36';

// Görsel boyutu (PNG/JPEG/WebP başlığından)
function dims(buf) {
  try {
    if (buf[0] === 0x89) return [buf.readUInt32BE(16), buf.readUInt32BE(20)];
    if (buf[0] === 0xFF) {
      let i = 2;
      while (i < buf.length - 9) {
        if (buf[i] !== 0xFF) { i++; continue; }
        const m = buf[i + 1];
        if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)];
        if (m === 0xD8 || m === 0x01 || (m >= 0xD0 && m <= 0xD7)) { i += 2; continue; }
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (buf.toString('ascii', 0, 4) === 'RIFF') {
      const t = buf.toString('ascii', 12, 16);
      if (t === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)];
      if (t === 'VP8 ') return [buf.readUInt16LE(26) & 0x3FFF, buf.readUInt16LE(28) & 0x3FFF];
      if (t === 'VP8L') { const b = buf.readUInt32LE(21); return [1 + (b & 0x3FFF), 1 + ((b >> 14) & 0x3FFF)]; }
    }
  } catch { /* okunamadı */ }
  return [0, 0];
}

async function visit(ctx, url, wait) {
  const page = await ctx.newPage();
  const imgs = [];
  page.on('response', async (r) => {
    try {
      const t = r.headers()['content-type'] || '';
      if (!/^image\/(png|jpe?g|webp)/.test(t) || r.status() !== 200) return;
      const buf = await r.body();
      const [w, h] = dims(buf);
      if (w >= 300 && h >= 200) imgs.push({ url: original(r.url()), buf, type: t, w, h });
    } catch { /* gövde yok */ }
  });
  try {
    const resp = await page.goto(`https://web.archive.org/web/2026/${url}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
    if (!resp || resp.status() >= 400) { await page.close(); return null; }
    await page.waitForTimeout(wait);
    await page.evaluate(async () => { for (let y = 0; y < 4000; y += 500) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 200)); } });
    await page.waitForTimeout(1500);
  } catch (e) { log(`⚠ ${url}: ${e.message.split('\n')[0]}`); }
  await page.close();
  return imgs;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ userAgent: UA, locale: 'tr-TR', viewport: { width: 1440, height: 900 } });
  // 1) Ürün detayları: kategori başına dengeli sıra
  const byPage = {};
  for (const p of index.products) (byPage[p.page] = byPage[p.page] || []).push(p);
  const order = [];
  for (let i = 0; order.length < index.products.length; i++) {
    let any = false;
    for (const k of Object.keys(byPage)) if (byPage[k][i]) { order.push(byPage[k][i]); any = true; }
    if (!any) break;
  }
  let n = 0, k = 0;
  await Promise.all(Array.from({ length: 3 }, async () => {
    while (k < order.length && left() > 10 * 60000) {
      const p = order[k++];
      const imgs = await visit(ctx, p.url, 3500);
      if (!imgs) { log(`– arşivde yok: ${p.url}`); continue; }
      const id = (p.url.match(/BP_(\d+)/) || [])[1];
      const cand = imgs.filter((i) => /prd-/.test(i.url) && (!id || i.url.includes(id))).sort((a, b) => b.w * b.h - a.w * a.h)[0]
        || imgs.filter((i) => /prd-/.test(i.url)).sort((a, b) => b.w * b.h - a.w * a.h)[0];
      if (!cand) { log(`– büyük görsel yok: ${p.url}`); continue; }
      const f = path.join(out, 'products-hd', `${slug(p.url.split('/p/')[0].split('/').pop())}.${extOf(cand.type)}`);
      fs.writeFileSync(f, cand.buf);
      p.hd = { file: path.relative(root, f), w: cand.w, h: cand.h, original: cand.url };
      n++; log(`✔ ${n} ${cand.w}×${cand.h} ${p.url.split('/').slice(-3, -2)}`);
      if (n % 5 === 0) save();
    }
  }));
  save();
  // 2) Yaşam tarzı / kampanya görselleri
  index.lifestyle = index.lifestyle || [];
  const seen = new Set(index.site.map((s) => s.original));
  for (const u of ['https://www.watsons.com.tr/', 'https://www.watsons.com.tr/kampanyalar', 'https://www.watsons.com.tr/blog', 'https://www.watsons.com.tr/ayin-urunleri/c/50007', 'https://www.watsons.com.tr/k-beauty/c/104', 'https://www.watsons.com.tr/cilt-bakim/c/101']) {
    if (left() < 3 * 60000) break;
    const imgs = await visit(ctx, u, 7000);
    if (!imgs) { log(`– arşivde yok: ${u}`); continue; }
    let c = 0;
    for (const i of imgs) {
      if (seen.has(i.url) || /prd-|logo|badge/i.test(i.url)) continue;
      seen.add(i.url);
      const f = path.join(out, 'lifestyle', `${slug(new URL(u).pathname) || 'home'}-${String(++c).padStart(2, '0')}.${extOf(i.type)}`);
      fs.writeFileSync(f, i.buf);
      index.lifestyle.push({ page: u, file: path.relative(root, f), w: i.w, h: i.h, original: i.url });
    }
    log(`✔ ${u}: ${c} görsel`);
    save();
  }
  log(`Bitti: ${n} büyük ürün görseli, ${index.lifestyle.length} yaşam tarzı görseli`);
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
