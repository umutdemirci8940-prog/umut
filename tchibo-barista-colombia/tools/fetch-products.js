#!/usr/bin/env node
'use strict';
/**
 * tchibo.com.tr'den Barista serisi ürün (paket) görsellerini indirir → assets/products/*.{jpg,png,webp} + products.json
 * Kaynaklar: kategori sayfasındaki ürün bağlantıları → ürün sayfası (JSON-LD image, og:image, img/src/srcset).
 * Normal internet erişimi gerektirir (GitHub Actions'ta çalışır).
 */
const fs = require('fs');
const path = require('path');
const out = path.join(__dirname, '..', 'assets', 'products');
fs.mkdirSync(out, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const SITE = 'https://www.tchibo.com.tr';
const CATEGORY = process.argv[2] || SITE + '/categories/kahve/kahveler/tam-otomatik-makineler-icin-kahve';
const KNOWN = [
  SITE + '/products/285801255462/barista-origins-colombia',   // Barista Origins Colombia (kahraman)
  SITE + '/products/233722167222/barista-caffe-crema',        // Barista Caffè Crema
  SITE + '/products/280387747392/barista-espresso',           // Barista Espresso
  SITE + '/products/283130059074/barista-espresso-dark',      // Barista Espresso Dark
  SITE + '/products/402032924',
];
const log = (...a) => console.log('[products]', ...a);

async function get(url, accept) {
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: accept || 'text/html,*/*', 'accept-language': 'tr-TR,tr;q=0.9' }, redirect: 'follow' });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
}
function abs(u, base) { try { return new URL(u.replace(/&amp;/g, '&'), base).href; } catch { return null; } }
function uniq(a) { return [...new Set(a.filter(Boolean))]; }

function productLinks(html, base) {
  const links = [];
  for (const m of html.matchAll(/href=["']([^"']*\/products\/[^"'#?]+)["'][^>]*>([\s\S]{0,400}?)<\/a>/gi)) {
    const text = m[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    links.push({ url: abs(m[1], base), text });
  }
  for (const m of html.matchAll(/["'](\/products\/[^"'#?\s]+)["']/g)) links.push({ url: abs(m[1], base), text: '' });
  const seen = new Map();
  for (const l of links) if (l.url && !seen.has(l.url)) seen.set(l.url, l); else if (l.url && l.text && !seen.get(l.url).text) seen.get(l.url).text = l.text;
  return [...seen.values()];
}
function imagesFrom(html, base) {
  const imgs = [];
  for (const m of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (o) => { if (!o) return; if (Array.isArray(o)) return o.forEach(walk); if (typeof o === 'object') { if (o.image) (Array.isArray(o.image) ? o.image : [o.image]).forEach((i) => imgs.push(typeof i === 'string' ? i : i && i.url)); Object.values(o).forEach(walk); } };
      walk(JSON.parse(m[1]));
    } catch { /* geçersiz json */ }
  }
  for (const m of html.matchAll(/<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/gi)) imgs.push(m[1]);
  for (const m of html.matchAll(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/gi)) imgs.push(m[1]);
  for (const m of html.matchAll(/(?:src|data-src|href)=["']([^"']+\.(?:jpe?g|png|webp)(?:\?[^"']*)?)["']/gi)) imgs.push(m[1]);
  for (const m of html.matchAll(/srcset=["']([^"']+)["']/gi)) for (const part of m[1].split(',')) imgs.push(part.trim().split(/\s+/)[0]);
  for (const m of html.matchAll(/["'](https?:\/\/[^"'\s]+\.(?:jpe?g|png|webp)(?:\?[^"'\s]*)?)["']/gi)) imgs.push(m[1]);
  return uniq(imgs.map((u) => abs(u, base))).filter((u) => !/logo|icon|sprite|flag|payment|badge|banner|hero|kampanya|campaign/i.test(u));
}
function meta(html, name) {
  const m = html.match(new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i')) || html.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`, 'i'));
  return m ? m[1].replace(/&amp;/g, '&') : null;
}

const videoDir = path.join(__dirname, '..', 'assets', 'video');
fs.mkdirSync(videoDir, { recursive: true });
function videosFrom(html, base) {
  const v = [];
  for (const m of html.matchAll(/["'](https?:\/\/[^"'\s]+\.(?:mp4|webm|m3u8)(?:\?[^"'\s]*)?)["']/gi)) v.push(m[1]);
  for (const m of html.matchAll(/(?:src|data-src|href)=["']([^"']+\.(?:mp4|webm)(?:\?[^"']*)?)["']/gi)) v.push(m[1]);
  for (const m of html.matchAll(/(?:youtube\.com\/(?:embed|watch\?v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/g)) v.push('youtube:' + m[1]);
  return uniq(v.map((u) => (u.startsWith('youtube:') ? u : abs(u, base))));
}
async function saveVideo(url, i) {
  try {
    const r = await get(url, 'video/*,*/*');
    const len = +(r.headers.get('content-length') || 0);
    if (len > 40 * 1024 * 1024) { log('video çok büyük, atlandı:', url, len); return null; }
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < 50000) return null;
    const file = `site-${i}.${/\.webm/i.test(url) ? 'webm' : 'mp4'}`;
    fs.writeFileSync(path.join(videoDir, file), buf);
    log('site videosu:', file, buf.length, '←', url);
    return { file: 'assets/video/' + file, url, bytes: buf.length };
  } catch (e) { log('video alınamadı:', url, e.message); return null; }
}

(async () => {
  let links = [];
  const videos = [];
  const pagesForVideo = [SITE + '/', CATEGORY];
  try { const html = await (await get(CATEGORY)).text(); links = productLinks(html, CATEGORY); log('kategori bağlantıları:', links.length);
    for (const m of html.matchAll(/href=["']([^"']*barista[^"']*)["']/gi)) { const u = abs(m[1], CATEGORY); if (u && !/\/products\//.test(u)) pagesForVideo.push(u); }
    videos.push(...videosFrom(html, CATEGORY)); }
  catch (e) { log('kategori alınamadı:', e.message); }
  for (const pg of uniq(pagesForVideo).slice(0, 6)) {
    try { const html = await (await get(pg)).text(); videos.push(...videosFrom(html, pg)); const more = productLinks(html, pg); links.push(...more); } catch (e) { log('sayfa alınamadı:', pg, e.message); }
  }
  const barista = links.filter((l) => /barista/i.test(l.text) || /barista/i.test(l.url));
  const targets = uniq([...KNOWN, ...barista.map((l) => l.url), ...links.slice(0, 12).map((l) => l.url)]).slice(0, 14);
  const products = [];
  for (const url of targets) {
    try {
      const html = await (await get(url)).text();
      const title = meta(html, 'og:title') || (html.match(/<title>([^<]*)<\/title>/i) || [])[1] || '';
      if (!/barista/i.test(title + ' ' + url)) { log('barista değil, atlandı:', title || url); continue; }
      const imgs = imagesFrom(html, url);
      const price = (html.match(/"price"\s*:\s*"?([\d.,]+)"?/) || [])[1] || null;
      const slugSrc = (url.match(/\/products\/\d+\/([a-z0-9-]+)/i) || [])[1] || title;
      const slug = slugSrc.toLowerCase().replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || path.basename(url);
      const saved = [];
      let n = 0;
      const ordered = [];
      for (const img of imgs) {
        const m = img.match(/^(https?:\/\/www\.tchibo\.com\.tr\/img\/[^/]+\/)(\d+)(\/image\.(?:webp|png|jpe?g))$/i);
        if (m && +m[2] < 1600) { ordered.push(m[1] + '1600' + m[3], m[1] + '1200' + m[3]); }
        ordered.push(img);
      }
      const seenBase = new Set();
      for (const img of uniq(ordered)) {
        if (n >= 4) break;
        const base = img.replace(/\/\d+\/image\./, '/X/image.').replace(/\.(jpe?g|png|webp|avif)(\?.*)?$/i, '');
        if (seenBase.has(base)) continue;
        try {
          const r = await get(img, 'image/*');
          const buf = Buffer.from(await r.arrayBuffer());
          const ct = (r.headers.get('content-type') || '').toLowerCase();
          const ext = ct.includes('png') ? 'png' : ct.includes('webp') ? 'webp' : ct.includes('jpeg') || ct.includes('jpg') ? 'jpg' : null;
          if (!ext || buf.length < 8000) continue;
          const file = `${slug}-${n + 1}.${ext}`;
          fs.writeFileSync(path.join(out, file), buf);
          saved.push({ file: 'assets/products/' + file, url: img, bytes: buf.length });
          seenBase.add(base);
          n++;
        } catch (e) { /* görsel atlandı */ }
      }
      videos.push(...videosFrom(html, url));
      products.push({ url, title, price, images: saved, allImageUrls: imgs.slice(0, 20) });
      log(`${title} → ${saved.length} görsel`);
    } catch (e) { log('ürün alınamadı:', url, e.message); }
  }
  const vids = uniq(videos); const savedVideos = [];
  let vi = 1;
  for (const v of vids.filter((u) => !u.startsWith('youtube:')).slice(0, 4)) { const sv = await saveVideo(v, vi); if (sv) { savedVideos.push(sv); vi++; } }
  fs.writeFileSync(path.join(out, 'products.json'), JSON.stringify({ fetchedAt: new Date().toISOString(), category: CATEGORY, products, videoUrls: vids, savedVideos }, null, 1));
  log('bitti:', products.length, 'ürün');
})();
