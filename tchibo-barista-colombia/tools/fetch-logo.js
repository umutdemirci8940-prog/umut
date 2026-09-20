#!/usr/bin/env node
'use strict';
/**
 * Tchibo'nun resmi logosunu indirir → assets/logo-src.(svg|png) + assets/logo-source.json
 * Sıra: 1) tchibo.com.tr sayfasındaki logo dosyası / satır içi SVG  2) Wikimedia Commons  3) Wikipedia sayfa görseli
 * Normal internet erişimi gerektirir (Claude'un yalıtılmış ortamında bu adresler engellidir; GitHub Actions'ta çalışır).
 */
const fs = require('fs');
const path = require('path');
const assets = path.join(__dirname, '..', 'assets');
fs.mkdirSync(assets, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

async function get(url, accept) {
  const r = await fetch(url, { headers: { 'user-agent': UA, accept: accept || '*/*', 'accept-language': 'tr-TR,tr;q=0.9,en;q=0.8' }, redirect: 'follow' });
  if (!r.ok) throw new Error(`${r.status} ${url}`);
  return r;
}
const log = (...a) => console.log('[logo]', ...a);

async function fromTchibo() {
  const out = [];
  out.push({ url: 'https://www.tchibo.com.tr/static/svgs/tchibo.svg', frag: 'svg', source: 'https://www.tchibo.com.tr/ (logo sprite: /static/svgs/tchibo.svg)' });
  for (const site of ['https://www.tchibo.com.tr/', 'https://www.tchibo.com/', 'https://www.tchibo.de/']) {
    try {
      const html = await (await get(site, 'text/html')).text();
      const inline = html.match(/<svg[^>]*(?:logo|Logo|LOGO)[^>]*>[\s\S]*?<\/svg>/);
      if (inline) {
        const use = inline[0].match(/<use[^>]*(?:xlink:)?href=["']([^"'#]+)(#[^"']*)?["']/i);
        if (use) { try { out.push({ url: new URL(use[1], site).href, frag: use[2] ? use[2].slice(1) : null, source: site + ' (logo sprite: ' + use[1] + ')' }); } catch { /* geçersiz url */ } }
        else if (/<(path|polygon|rect|circle|g)\b/i.test(inline[0])) out.push({ inline: inline[0], source: site + ' (satır içi SVG)' });
      }
      for (const m of html.matchAll(/["'(]([^"'()\s]*logo[^"'()\s]*\.(?:svg|png))(?:\?[^"'()\s]*)?["')]/gi)) {
        try { out.push({ url: new URL(m[1], site).href, source: site }); } catch { /* geçersiz url */ }
      }
      if (out.length) { log('site adayları:', out.map((o) => o.url || 'inline').join(', ')); return out; }
    } catch (e) { log('site erişilemedi:', site, e.message); }
  }
  return out;
}
async function fromCommons() {
  const out = [];
  try {
    const j = await (await get('https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch=Tchibo%20logo&srnamespace=6&format=json&srlimit=25', 'application/json')).json();
    const titles = (j.query.search || []).map((s) => s.title).filter((t) => /tchibo/i.test(t) && /logo/i.test(t));
    titles.sort((a, b) => (/\.svg$/i.test(b) ? 1 : 0) - (/\.svg$/i.test(a) ? 1 : 0));
    for (const t of titles.slice(0, 5)) {
      const info = await (await get(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(t)}&prop=imageinfo&iiprop=url&format=json`, 'application/json')).json();
      const page = Object.values(info.query.pages)[0];
      if (page && page.imageinfo && page.imageinfo[0]) out.push({ url: page.imageinfo[0].url, source: 'Wikimedia Commons: ' + t });
    }
  } catch (e) { log('Commons erişilemedi:', e.message); }
  return out;
}
async function fromWikipedia() {
  const out = [];
  for (const lang of ['tr', 'de', 'en']) {
    try {
      const j = await (await get(`https://${lang}.wikipedia.org/w/api.php?action=query&titles=Tchibo&prop=pageimages&format=json&pithumbsize=1600`, 'application/json')).json();
      const page = Object.values(j.query.pages)[0];
      if (page && page.original) out.push({ url: page.original.source, source: `${lang}.wikipedia.org sayfa görseli` });
      else if (page && page.thumbnail) out.push({ url: page.thumbnail.source, source: `${lang}.wikipedia.org sayfa görseli` });
    } catch (e) { log('Wikipedia erişilemedi:', lang, e.message); }
  }
  return out;
}

(async () => {
  const cands = [...(await fromTchibo()), ...(await fromCommons()), ...(await fromWikipedia())];
  if (!cands.length) { console.error('Logo adayı bulunamadı.'); process.exit(1); }
  for (const c of cands) {
    try {
      let buf, ext;
      if (c.inline) { buf = Buffer.from(c.inline, 'utf8'); ext = 'svg'; }
      else {
        const r = await get(c.url, 'image/svg+xml,image/png,image/*');
        const ct = (r.headers.get('content-type') || '').toLowerCase();
        buf = Buffer.from(await r.arrayBuffer());
        ext = ct.includes('svg') || /\.svg(\?|$)/i.test(c.url) ? 'svg' : ct.includes('png') || /\.png(\?|$)/i.test(c.url) ? 'png' : null;
        if (!ext || buf.length < 600) { log('atlandı (tür/boyut):', c.url, ct, buf.length); continue; }
        if (ext === 'svg' && !/<svg[\s>]/i.test(buf.toString('utf8', 0, 4000))) { log('atlandı (svg değil):', c.url); continue; }
      }
      if (ext === 'svg') {
        let svg = buf.toString('utf8');
        // sprite (<symbol id="..">) ise istenen sembolü bağımsız bir SVG'ye çevir
        const symbols = [...svg.matchAll(/<symbol\b([^>]*)>([\s\S]*?)<\/symbol>/gi)];
        if (symbols.length) {
          let pick = symbols.find((m) => c.frag && new RegExp('id=["\']' + c.frag + '["\']').test(m[1]))
            || symbols.find((m) => /tchibo|logo/i.test(m[1])) || symbols[0];
          const vb = (pick[1].match(/viewBox=["']([^"']+)["']/i) || [])[1];
          const defs = (svg.match(/<defs\b[\s\S]*?<\/defs>/i) || [''])[0];
          svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"${vb ? ` viewBox="${vb}"` : ''}>${defs}${pick[2]}</svg>`;
          log('sprite sembolü ayrıştırıldı:', c.frag || '(ilk)', 'viewBox', vb || '-');
        }
        if (!/<(path|polygon|polyline|rect|circle|ellipse|text|image)\b/i.test(svg)) { log('atlandı (boş svg):', c.url || 'inline'); continue; }
        if (!/xmlns=/.test(svg)) svg = svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
        buf = Buffer.from(svg, 'utf8');
      }
      for (const old of ['logo-src.svg', 'logo-src.png']) fs.rmSync(path.join(assets, old), { force: true });
      fs.writeFileSync(path.join(assets, `logo-src.${ext}`), buf);
      fs.writeFileSync(path.join(assets, 'logo-source.json'), JSON.stringify({ source: c.source, url: c.url || null, bytes: buf.length, type: ext, fetchedAt: new Date().toISOString() }, null, 1));
      log(`kaydedildi: assets/logo-src.${ext} (${buf.length} B) ← ${c.url || c.source}`);
      return;
    } catch (e) { log('aday başarısız:', c.url || 'inline', e.message); }
  }
  console.error('Hiçbir aday indirilemedi.'); process.exit(1);
})();
