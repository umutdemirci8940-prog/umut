#!/usr/bin/env node
'use strict';
/**
 * pluxee.com.tr üzerinden gerçek marka varlıklarını indirir: logo ve kart görseli.
 * Çıktı: pluxee/assets/manifest.json, assets/logo.<ext>, assets/card.<ext>
 *
 * Kullanım: node pluxee/tools/fetch-pluxee-assets.js [--base=https://www.pluxee.com.tr] [--logo=<url>] [--card=<url>]
 * Node 18+ yeterlidir. Sayfa yapısı bilinmediği için sezgisel arama yapar; --logo / --card ile adres
 * doğrudan verilebilir. Ardından `node pluxee/tools/optimize-pluxee-assets.js` (isteğe bağlı) ve `node pluxee/build.js`.
 *
 * Not: Bulut oturumunun ağ politikası siteye erişemediği için bu betik GitHub Actions'ta
 * (.github/workflows/fetch-pluxee-assets.yml) ya da yerel bilgisayarda çalıştırılır.
 */
const fs = require('fs');
const path = require('path');

const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const BASE = String(args.base || 'https://www.pluxee.com.tr').replace(/\/$/, '');
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';
const root = path.join(__dirname, '..');
const assets = path.join(root, 'assets');
fs.mkdirSync(assets, { recursive: true });

async function get(url, type = 'text') {
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: '*/*' }, redirect: 'follow' });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} – ${url}`);
  if (type === 'buffer') return { buf: Buffer.from(await r.arrayBuffer()), ct: r.headers.get('content-type') || '' };
  return r.text();
}
const abs = (src, base = BASE) => { try { return new URL(src.trim().replace(/&amp;/g, '&'), base + '/').toString(); } catch { return null; } };
const extOf = (url, ct) => {
  const m = (new URL(url).pathname.match(/\.(png|jpe?g|webp|svg|gif|avif)$/i) || [])[1];
  if (m) return m.toLowerCase().replace('jpeg', 'jpg');
  if (/svg/.test(ct)) return 'svg'; if (/png/.test(ct)) return 'png'; if (/webp/.test(ct)) return 'webp'; if (/jpe?g/.test(ct)) return 'jpg';
  return 'png';
};
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')); return m ? (m[2] ?? m[3] ?? m[4] ?? '') : ''; };

function collectImages(html, pageUrl) {
  const out = [];
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    const src = attr(tag, 'src') || attr(tag, 'data-src') || (attr(tag, 'srcset').split(',')[0] || '').trim().split(' ')[0];
    if (!src || src.startsWith('data:')) continue;
    out.push({ url: abs(src, pageUrl), alt: attr(tag, 'alt'), cls: attr(tag, 'class'), id: attr(tag, 'id'), w: +attr(tag, 'width') || 0, kind: 'img' });
  }
  for (const m of html.matchAll(/<source\b[^>]*srcset\s*=\s*"([^"]+)"[^>]*>/gi)) {
    const src = m[1].split(',')[0].trim().split(' ')[0];
    if (src) out.push({ url: abs(src, pageUrl), alt: '', cls: 'source', id: '', w: 0, kind: 'source' });
  }
  for (const m of html.matchAll(/<meta\b[^>]*property\s*=\s*"og:image"[^>]*>/gi)) {
    const c = attr(m[0], 'content'); if (c) out.push({ url: abs(c, pageUrl), alt: 'og:image', cls: 'og', id: '', w: 0, kind: 'og' });
  }
  return out.filter((i) => i.url);
}
function collectInlineSvgLogo(html) {
  const m = html.match(/<svg\b[^>]*(?:class|id|aria-label)\s*=\s*"[^"]*logo[^"]*"[^>]*>[\s\S]*?<\/svg>/i);
  return m ? m[0] : null;
}
const score = (i, re) => (re.test(i.url) ? 3 : 0) + (re.test(i.alt) ? 3 : 0) + (re.test(i.cls) ? 2 : 0) + (re.test(i.id) ? 2 : 0);

(async () => {
  const manifest = { source: BASE, fetchedAt: new Date().toISOString(), candidates: { logo: [], card: [] } };
  let pages = [BASE + '/'];
  let html = '';
  try { html = await get(pages[0]); } catch (e) { console.error('Ana sayfa alınamadı: ' + e.message); }
  // kart / ürün sayfalarına bağlantılar
  const links = [...html.matchAll(/href\s*=\s*"([^"]+)"/gi)].map((m) => abs(m[1])).filter((u) => u && u.startsWith(BASE) && /kart|card|yemek|urun|ürün|product/i.test(u));
  pages = pages.concat([...new Set(links)].slice(0, 6));
  let images = collectImages(html, pages[0]);
  for (const p of pages.slice(1)) { try { images = images.concat(collectImages(await get(p), p)); } catch { /* geç */ } }
  const uniq = new Map(); for (const i of images) if (!uniq.has(i.url)) uniq.set(i.url, i);
  images = [...uniq.values()];

  // LOGO
  let logoUrl = args.logo ? abs(args.logo) : null;
  const inline = !logoUrl && collectInlineSvgLogo(html);
  if (!logoUrl) {
    const ranked = images.map((i) => ({ i, s: score(i, /logo/i) + (/\.svg/i.test(i.url) ? 2 : 0) - (/footer|icon|badge|app-?store|google-?play/i.test(i.url + i.cls) ? 2 : 0) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
    manifest.candidates.logo = ranked.slice(0, 8).map((x) => x.i.url);
    if (ranked.length) logoUrl = ranked[0].i.url;
  }
  if (inline) {
    fs.writeFileSync(path.join(assets, 'logo.svg'), inline);
    manifest.logo = { file: 'logo.svg', from: 'inline-svg', white: false };
    console.log('✔ logo: sayfa içi SVG kaydedildi → assets/logo.svg');
  } else if (logoUrl) {
    try {
      const { buf, ct } = await get(logoUrl, 'buffer'); const ext = extOf(logoUrl, ct);
      fs.writeFileSync(path.join(assets, `logo.${ext}`), buf);
      manifest.logo = { file: `logo.${ext}`, from: logoUrl, white: false };
      console.log(`✔ logo: ${logoUrl} → assets/logo.${ext} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) { console.error('✘ logo indirilemedi: ' + e.message); }
  } else console.error('✘ logo adayı bulunamadı; --logo=<url> ile verin ya da assets/logo.svg dosyasını elle koyun.');

  // KART
  let cardUrl = args.card ? abs(args.card) : null;
  if (!cardUrl) {
    const ranked = images.map((i) => ({ i, s: score(i, /kart|card/i) + (/yemek|meal|pluxee/i.test(i.url + i.alt) ? 1 : 0) - score(i, /logo|icon/i) + (i.w > 300 ? 1 : 0) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
    manifest.candidates.card = ranked.slice(0, 8).map((x) => x.i.url);
    if (ranked.length) cardUrl = ranked[0].i.url;
  }
  if (cardUrl) {
    try {
      const { buf, ct } = await get(cardUrl, 'buffer'); const ext = extOf(cardUrl, ct);
      fs.writeFileSync(path.join(assets, `card.${ext}`), buf);
      manifest.card = { file: `card.${ext}`, from: cardUrl };
      console.log(`✔ kart: ${cardUrl} → assets/card.${ext} (${(buf.length / 1024).toFixed(0)} KB)`);
    } catch (e) { console.error('✘ kart görseli indirilemedi: ' + e.message); }
  } else console.error('✘ kart görseli adayı bulunamadı; --card=<url> ile verin ya da assets/card.png dosyasını elle koyun.');

  fs.writeFileSync(path.join(assets, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('✔ assets/manifest.json yazıldı. Sonraki adım: node pluxee/tools/optimize-pluxee-assets.js && node pluxee/build.js');
})();
