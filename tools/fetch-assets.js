#!/usr/bin/env node
'use strict';
/**
 * ilacsizyasam.com (Shopify) üzerinden gerçek marka varlıklarını indirir:
 *   - Ürün görselleri, başlıkları, fiyatları ve sayfa adresleri (products.json)
 *   - Logo (ana sayfa başlığındaki logo görseli)
 *   - Tema renk adayları (ana sayfa CSS'inden)
 * Çıktı: assets/manifest.json, assets/logo.<ext>, assets/products/<key>.<ext>
 *
 * Kullanım: node tools/fetch-assets.js [--base=https://ilacsizyasam.com] [--width=640]
 * Node 18+ yeterlidir; ek paket gerektirmez. Ardından `node build.js` gerçek görsellerle derler.
 */
const fs = require('fs');
const path = require('path');
const data = require('../src/data');

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
}));
const BASE = String(args.base || data.brand.site || 'https://ilacsizyasam.com').replace(/\/$/, '');
const WIDTH = +args.width || 640;
const LOGO_WIDTH = +args.logoWidth || 480;
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');
const prodDir = path.join(assets, 'products');
fs.mkdirSync(prodDir, { recursive: true });

async function get(url, type = 'text') {
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: type === 'json' ? 'application/json' : '*/*' }, redirect: 'follow' });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} – ${url}`);
  if (type === 'json') return r.json();
  if (type === 'buffer') return Buffer.from(await r.arrayBuffer());
  return r.text();
}
const abs = (src) => {
  if (!src) return null;
  src = src.trim().replace(/&amp;/g, '&');
  if (src.startsWith('//')) return 'https:' + src;
  if (src.startsWith('/')) return BASE + src;
  return src;
};
// Shopify CDN görsellerini istenen genişlikte ister (sunucu tarafında yeniden boyutlandırır).
function sized(src, width) {
  try {
    const u = new URL(abs(src).replace(/\{width\}/g, String(width)));
    if (/shopify|\/cdn\/shop\//.test(u.href)) u.searchParams.set('width', String(width));
    return u.toString();
  } catch { return abs(src); }
}
const extOf = (url) => ((new URL(url).pathname.match(/\.(png|jpe?g|webp|svg|gif|avif)$/i) || [, 'jpg'])[1]).toLowerCase().replace('jpeg', 'jpg');

async function allProducts() {
  const out = [];
  for (const base of [`${BASE}/products.json`, `${BASE}/collections/all/products.json`]) {
    try {
      for (let page = 1; page <= 20; page++) {
        const j = await get(`${base}?limit=250&page=${page}`, 'json');
        if (!j.products || !j.products.length) break;
        out.push(...j.products);
        if (j.products.length < 250) break;
      }
      if (out.length) return out;
    } catch (e) { console.log(`⚠ ${base}: ${e.message}`); }
  }
  return out;
}
// Önce doğrudan ürün adresi (/products/<handle>.json), olmazsa listede handle, en son başlıkta kelime araması
async function findProduct(listPromise, p) {
  if (p.handle) {
    try { const j = await get(`${BASE}/products/${p.handle}.json`, 'json'); if (j && j.product) return j.product; }
    catch (e) { console.log(`  ↳ ${p.handle}.json alınamadı (${e.message.split(' – ')[0]}), listede aranıyor`); }
  }
  const list = await listPromise;
  if (p.handle) { const h = list.find((x) => x.handle === p.handle); if (h) return h; }
  const kw = String(p.match || p.name).toLowerCase().split(/\s+/).filter(Boolean);
  return list.find((x) => kw.every((k) => x.title.toLowerCase().includes(k))) || null;
}
function pickLogo(html) {
  // Başlık (header) içinde: etiketinde 'logo' geçen <img>, yoksa 'logo' sınıflı bir sarmalayıcının hemen içindeki <img>,
  // yoksa satır içi <svg class="...logo...">. Header yoksa tüm sayfa taranır.
  const header = (html.match(/<header[\s\S]*?<\/header>/i) || [html])[0];
  const scan = (h) => {
    const cands = [];
    for (const m of h.matchAll(/<img\b[^>]*>/gi)) {
      const t = m[0];
      const before = h.slice(Math.max(0, m.index - 400), m.index);
      const score = /logo/i.test(t) ? 2 : /logo/i.test(before) ? 1 : 0;
      if (score && !/\.(svg|png|jpe?g|webp|gif|avif)?[^"]*(icon|favicon|payment|badge)/i.test(t)) cands.push({ t, score });
    }
    return cands.sort((a, b) => b.score - a.score).map((c) => c.t);
  };
  const tag = scan(header)[0] || scan(html)[0];
  if (!tag) {
    const svg = (header.match(/<svg\b[^>]*class="[^"]*logo[^"]*"[\s\S]*?<\/svg>/i) || html.match(/<svg\b[^>]*class="[^"]*logo[^"]*"[\s\S]*?<\/svg>/i) || [])[0];
    return svg ? { inlineSvg: svg, alt: 'logo' } : null;
  }
  const srcset = tag.match(/\bsrcset="([^"]+)"/i) || tag.match(/\bdata-srcset="([^"]+)"/i);
  let src = null;
  if (srcset) {
    const parts = srcset[1].split(',').map((s) => s.trim().split(/\s+/));
    parts.sort((a, b) => parseFloat(b[1] || 0) - parseFloat(a[1] || 0)); // en büyük aday
    src = parts[0][0];
  }
  src = src || (tag.match(/\bsrc="([^"]+)"/i) || tag.match(/\bdata-src="([^"]+)"/i) || [])[1];
  const alt = (tag.match(/\balt="([^"]*)"/i) || [, ''])[1];
  return src ? { src: abs(src), alt } : null;
}
function paletteOf(html) {
  const css = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]).join('\n');
  const vars = {};
  for (const m of css.matchAll(/--([\w-]*(?:color|colour|background|accent|button)[\w-]*)\s*:\s*([^;{}]+)/gi)) if (!(m[1] in vars)) vars[m[1]] = m[2].trim();
  const count = {};
  for (const m of (css + html).matchAll(/#([0-9a-f]{6})\b/gi)) {
    const h = '#' + m[1].toLowerCase();
    if (h === '#ffffff' || h === '#000000') continue;
    count[h] = (count[h] || 0) + 1;
  }
  const candidates = Object.entries(count).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([hex, n]) => ({ hex, n }));
  const meta = (name) => (html.match(new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]*)"`, 'i')) || [, null])[1];
  return { themeColor: meta('theme-color'), siteName: meta('og:site_name'), ogImage: abs(meta('og:image')), vars: Object.fromEntries(Object.entries(vars).slice(0, 40)), candidates };
}

(async () => {
  console.log(`Kaynak: ${BASE}`);
  const manifest = { fetchedAt: new Date().toISOString(), base: BASE, logo: null, palette: null, products: [] };

  // Ana sayfa: logo + renkler
  try {
    const html = await get(`${BASE}/`);
    manifest.palette = paletteOf(html);
    const logo = pickLogo(html);
    if (logo && logo.inlineSvg) {
      const file = path.join(assets, 'logo.svg');
      fs.writeFileSync(file, logo.inlineSvg.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"'));
      manifest.logo = { file: path.relative(root, file), src: 'inline-svg', alt: logo.alt };
      console.log(`✔ logo (satır içi svg) → ${manifest.logo.file}`);
    } else if (logo) {
      const url = sized(logo.src, LOGO_WIDTH);
      const ext = extOf(url);
      const file = path.join(assets, `logo.${ext}`);
      fs.writeFileSync(file, await get(url, 'buffer'));
      manifest.logo = { file: path.relative(root, file), src: logo.src, alt: logo.alt };
      console.log(`✔ logo → ${manifest.logo.file}`);
    } else console.log('⚠ Ana sayfada logo görseli bulunamadı; assets/logo.png olarak elle ekleyebilirsiniz.');
  } catch (e) { console.log(`⚠ Ana sayfa alınamadı: ${e.message}`); }

  // Ürünler (liste yalnızca gerektiğinde, bir kez çekilir)
  let listPromise = null;
  const lazyList = () => (listPromise ||= allProducts().then((l) => { console.log(`✔ ${l.length} ürün listelendi`); return l; }).catch((e) => { console.log(`⚠ ürün listesi alınamadı: ${e.message}`); return []; }));

  for (const p of data.products) {
    const key = p.key || p.handle || p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const found = await findProduct({ then: (r, j) => lazyList().then(r, j) }, p);
    if (!found) { console.log(`✘ ${p.name}: eşleşen ürün bulunamadı (handle: ${p.handle || '-'})`); continue; }
    const img = found.images && found.images[0];
    const entry = {
      key, handle: found.handle, title: found.title, vendor: found.vendor, type: found.product_type,
      price: found.variants && found.variants[0] ? found.variants[0].price : null,
      compareAtPrice: found.variants && found.variants[0] ? found.variants[0].compare_at_price : null,
      available: found.variants ? found.variants.some((v) => v.available) : null,
      url: `${BASE}/products/${found.handle}`, image: null,
    };
    if (img) {
      const url = sized(img.src, WIDTH);
      const ext = extOf(url);
      const file = path.join(prodDir, `${key}.${ext}`);
      try {
        fs.writeFileSync(file, await get(url, 'buffer'));
        entry.image = { file: path.relative(root, file), src: img.src, width: img.width, height: img.height, alt: img.alt || found.title };
        console.log(`✔ ${p.name} → ${entry.image.file}  (${found.title}${entry.price ? ', ' + entry.price + ' TL' : ''})`);
      } catch (e) { console.log(`⚠ ${p.name}: görsel indirilemedi: ${e.message}`); }
    } else console.log(`⚠ ${p.name}: üründe görsel yok`);
    manifest.products.push(entry);
  }

  fs.writeFileSync(path.join(assets, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`✔ assets/manifest.json yazıldı. Şimdi: node build.js`);
})().catch((e) => { console.error(e); process.exit(1); });
