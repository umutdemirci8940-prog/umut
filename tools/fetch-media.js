#!/usr/bin/env node
'use strict';
/**
 * ilacsizyasam.com'dan masthead / mobil interaktif çalışmalar için geniş görsel arşivi çeker:
 *   - Tüm ürünlerin tüm fotoğrafları (products.json)        → assets/media/products/<handle>/<n>.<ext>
 *   - Ana sayfa + iç sayfalardaki (koleksiyon, sayfa, blog) büyük görseller ve videolar → assets/media/site/
 *   - Koleksiyon kapakları (collections.json)                → assets/media/collections/
 * Çıktı: assets/media/index.json (kaynak adres, sayfa, alt metin, boyut)
 *
 * Kullanım: node tools/fetch-media.js [--base=https://ilacsizyasam.com] [--pages=40]
 */
const fs = require('fs');
const path = require('path');

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true];
}));
const BASE = String(args.base || 'https://ilacsizyasam.com').replace(/\/$/, '');
const MAX_PAGES = +args.pages || 40;
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const root = path.join(__dirname, '..');
const out = path.join(root, 'assets', 'media');
for (const d of ['products', 'site', 'collections']) fs.mkdirSync(path.join(out, d), { recursive: true });

async function get(url, type = 'text') {
  const r = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
  if (!r.ok) throw new Error(`${r.status} – ${url}`);
  if (type === 'json') return r.json();
  if (type === 'buffer') return Buffer.from(await r.arrayBuffer());
  return r.text();
}
const abs = (src) => {
  src = String(src).trim().replace(/&amp;/g, '&');
  if (src.startsWith('//')) return 'https:' + src;
  if (src.startsWith('/')) return BASE + src;
  return src;
};
const sized = (src, w) => {
  const u = new URL(abs(src).replace(/\{width\}/g, String(w)));
  u.searchParams.delete('height'); u.searchParams.delete('crop');
  u.searchParams.set('width', String(w));
  return u.toString();
};
const keyOf = (src) => new URL(abs(src)).pathname.replace(/^.*\/files\//, '').replace(/\.[a-z0-9]+$/i, '');
const extOf = (url) => ((new URL(url).pathname.match(/\.(png|jpe?g|webp|gif|mp4|webm|mov)$/i) || [, 'jpg'])[1]).toLowerCase().replace('jpeg', 'jpg');
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70);

const index = { fetchedAt: new Date().toISOString(), base: BASE, products: [], site: [], collections: [], videos: [], pages: [] };
const seen = new Set();

async function save(url, file) {
  const buf = await get(url, 'buffer');
  fs.writeFileSync(file, buf);
  return buf.length;
}

async function products() {
  const list = [];
  for (let page = 1; page <= 10; page++) {
    const j = await get(`${BASE}/products.json?limit=250&page=${page}`, 'json');
    if (!j.products || !j.products.length) break;
    list.push(...j.products);
    if (j.products.length < 250) break;
  }
  console.log(`✔ ${list.length} ürün`);
  for (const p of list) {
    const dir = path.join(out, 'products', p.handle);
    fs.mkdirSync(dir, { recursive: true });
    const entry = {
      handle: p.handle, title: p.title, type: p.product_type, tags: p.tags,
      price: p.variants && p.variants[0] && p.variants[0].price,
      compareAt: p.variants && p.variants[0] && p.variants[0].compare_at_price,
      available: (p.variants || []).some((v) => v.available),
      url: `${BASE}/products/${p.handle}`,
      body: String(p.body_html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 600),
      images: [],
    };
    for (const [i, img] of (p.images || []).slice(0, 8).entries()) {
      seen.add(keyOf(img.src));
      const url = sized(img.src, 1200);
      const file = path.join(dir, `${i + 1}.${extOf(url)}`);
      try {
        const bytes = await save(url, file);
        entry.images.push({ file: path.relative(root, file), src: img.src, w: img.width, h: img.height, alt: img.alt, bytes });
      } catch (e) { console.log(`⚠ ${p.handle} #${i + 1}: ${e.message}`); }
    }
    index.products.push(entry);
    console.log(`  ${p.handle}: ${entry.images.length} görsel`);
  }
}

async function collections() {
  try {
    const j = await get(`${BASE}/collections.json?limit=250`, 'json');
    for (const c of j.collections || []) {
      if (!c.image) continue;
      const url = sized(c.image.src, 1600);
      const file = path.join(out, 'collections', `${slug(c.handle)}.${extOf(url)}`);
      try {
        const bytes = await save(url, file);
        index.collections.push({ handle: c.handle, title: c.title, file: path.relative(root, file), src: c.image.src, bytes });
      } catch (e) { console.log(`⚠ koleksiyon ${c.handle}: ${e.message}`); }
    }
    console.log(`✔ ${index.collections.length} koleksiyon kapağı`);
  } catch (e) { console.log(`⚠ collections.json: ${e.message}`); }
}

function imagesIn(html) {
  const found = new Map();
  const add = (src, alt, hint) => {
    if (!src || !/\/cdn\/shop\/(files|articles|collections)\/|cdn\.shopify\.com\/s\/files/.test(src)) return;
    if (/\.svg(\?|$)/i.test(src)) return;
    const k = keyOf(src);
    const prev = found.get(k);
    if (!prev || (hint || 0) > (prev.hint || 0)) found.set(k, { src: abs(src), alt: alt || (prev && prev.alt) || '', hint });
  };
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const t = m[0];
    const alt = (t.match(/\balt="([^"]*)"/i) || [, ''])[1];
    const set = (t.match(/\b(?:data-)?srcset="([^"]+)"/i) || [])[1];
    if (set) for (const part of set.split(',')) { const [u, w] = part.trim().split(/\s+/); add(u, alt, parseFloat(w) || 0); }
    add((t.match(/\b(?:data-)?src="([^"]+)"/i) || [])[1], alt, 0);
  }
  // CSS arka planları ve JSON içindeki adresler
  for (const m of html.matchAll(/(?:https?:)?\/\/[^"'\s()]+?\/cdn\/shop\/(?:files|articles|collections)\/[^"'\s()?]+\.(?:jpe?g|png|webp)(?:\?[^"'\s()]*)?/gi)) add(m[0], '', 0);
  for (const m of html.matchAll(/(?:https?:)?\/\/cdn\.shopify\.com\/s\/files\/[^"'\s()?]+\.(?:jpe?g|png|webp)(?:\?[^"'\s()]*)?/gi)) add(m[0], '', 0);
  return [...found.values()];
}
function videosIn(html) {
  const v = new Set();
  for (const m of html.matchAll(/(?:https?:)?\/\/[^"'\s()]+?\.(?:mp4|webm)(?:\?[^"'\s()]*)?/gi)) v.add(abs(m[0].replace(/\\\//g, '/')));
  for (const m of html.matchAll(/\/cdn\/shop\/videos\/[^"'\s()]+?\.(?:mp4|webm)/gi)) v.add(abs(m[0]));
  return [...v];
}

async function crawl() {
  const queue = ['/', '/collections', '/collections/all', '/pages/hakkimizda', '/pages/about', '/blogs/news', '/blogs/blog'];
  const done = new Set();
  while (queue.length && done.size < MAX_PAGES) {
    const p = queue.shift();
    if (done.has(p)) continue;
    done.add(p);
    let html;
    try { html = await get(BASE + p); } catch (e) { continue; }
    index.pages.push(p);
    if (done.size < MAX_PAGES) {
      for (const m of html.matchAll(/href="(\/(?:pages|blogs|collections)\/[^"#?]+)"/gi)) {
        const l = m[1].replace(/\/$/, '');
        if (!done.has(l) && !queue.includes(l) && !/\/products\//.test(l)) queue.push(l);
      }
    }
    for (const img of imagesIn(html)) {
      const k = keyOf(img.src);
      if (seen.has(k)) continue;
      seen.add(k);
      const url = sized(img.src, 1800);
      const file = path.join(out, 'site', `${slug(k)}.${extOf(url)}`);
      try {
        const bytes = await save(url, file);
        if (bytes < 6000) { fs.unlinkSync(file); continue; } // ikon / ödeme logosu
        index.site.push({ file: path.relative(root, file), src: img.src, alt: img.alt, page: p, bytes });
      } catch (e) { console.log(`⚠ ${k}: ${e.message}`); }
    }
    for (const v of videosIn(html)) {
      if (seen.has(v) || index.videos.length >= 8) continue;
      seen.add(v);
      const file = path.join(out, 'site', `video-${index.videos.length + 1}.${extOf(v)}`);
      try {
        const bytes = await save(v, file);
        if (bytes > 40e6) { fs.unlinkSync(file); continue; }
        index.videos.push({ file: path.relative(root, file), src: v, page: p, bytes });
      } catch (e) { console.log(`⚠ video ${v}: ${e.message}`); }
    }
    console.log(`  ${p}: toplam ${index.site.length} görsel, ${index.videos.length} video`);
  }
}

(async () => {
  console.log(`Kaynak: ${BASE}`);
  try { await products(); } catch (e) { console.log(`⚠ ürünler: ${e.message}`); }
  await collections();
  await crawl();
  fs.writeFileSync(path.join(out, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`✔ assets/media/index.json — ${index.products.length} ürün, ${index.site.length} site görseli, ${index.collections.length} koleksiyon, ${index.videos.length} video`);
})().catch((e) => { console.error(e); process.exit(1); });
