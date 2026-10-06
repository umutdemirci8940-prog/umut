#!/usr/bin/env node
'use strict';
/**
 * Resmi Akbank logosunu (assets/logo.svg) masthead'e satır içi SVG olarak gömer.
 * Dosya yoksa https://www.akbank.com/SiteAssets/img/logo.svg adresinden indirmeyi dener.
 * Koyu zemin için: koyu renkli dolgular fildişine çevrilir, kırmızı ve diğer renkli alanlar korunur.
 *
 * Logo, akbank-wings altındaki LOGO:START / LOGO:END işaretli bütün index.html dosyalarına gömülür.
 * "LOGO:START:light" ile işaretlenen açık zeminli çalışmalarda renkler olduğu gibi bırakılır;
 * "LOGO:START:mono" ile işaretlenenlerde logo tek renk fildişi (negatif) kullanılır.
 *
 * Kullanım: node akbank-wings/tools/embed-logo.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const LOGO_URL = 'https://www.akbank.com/SiteAssets/img/logo.svg';
const logoFile = path.join(root, 'assets', 'logo.svg');
const IVORY = '#f4efe4';

async function getSvg() {
  if (fs.existsSync(logoFile)) return fs.readFileSync(logoFile, 'utf8');
  const res = await fetch(LOGO_URL, { headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36' } });
  if (!res.ok) throw new Error('Logo indirilemedi: HTTP ' + res.status);
  const svg = await res.text();
  fs.mkdirSync(path.dirname(logoFile), { recursive: true });
  fs.writeFileSync(logoFile, svg);
  return svg;
}

/** #rgb / #rrggbb / rgb() → [r,g,b] */
function parseColor(c) {
  c = c.trim().toLowerCase();
  let m = c.match(/^#([0-9a-f]{3})$/);
  if (m) return m[1].split('').map((h) => parseInt(h + h, 16));
  m = c.match(/^#([0-9a-f]{6})$/);
  if (m) return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  m = c.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (m) return [+m[1], +m[2], +m[3]];
  if (c === 'black') return [0, 0, 0];
  return null;
}
/** Koyu ve doygun olmayan renk (siyah, lacivert-gri, antrasit) mi? */
function isDarkNeutral(rgb) {
  const [r, g, b] = rgb;
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  const sat = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
  return lum < 0.35 && sat < 0.35;
}

function sanitize(svg, mode) {
  svg = svg.replace(/<\?xml[\s\S]*?\?>/g, '').replace(/<!DOCTYPE[\s\S]*?>/gi, '').replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '').replace(/\son\w+="[^"]*"/gi, '').trim();
  if (!/^<svg[\s>]/i.test(svg)) throw new Error('Geçerli bir SVG değil');
  // Boyut: viewBox yoksa width/height'tan üret; sabit width/height'ı kaldır (CSS yüksekliği belirler)
  const open = svg.match(/^<svg[^>]*>/i)[0];
  let tag = open;
  if (!/viewBox=/i.test(tag)) {
    const w = tag.match(/\swidth="([\d.]+)/), h = tag.match(/\sheight="([\d.]+)/);
    if (w && h) tag = tag.replace(/^<svg/i, `<svg viewBox="0 0 ${w[1]} ${h[1]}"`);
  }
  tag = tag.replace(/\s(width|height)="[^"]*"/gi, '');
  tag = tag.replace(/^<svg/i, '<svg role="img" aria-label="Akbank" focusable="false"');
  svg = svg.replace(open, tag);
  // id çakışmalarını önle (sayfadaki gradyanlarla)
  svg = svg.replace(/\bid="([^"]+)"/g, 'id="akb-$1"').replace(/url\(#([^)]+)\)/g, 'url(#akb-$1)').replace(/(xlink:)?href="#([^"]+)"/g, '$1href="#akb-$2"');
  let changed = 0;
  if (mode === 'light') return { svg, changed };
  if (mode === 'mono') {
    svg = svg.replace(/(fill|stroke|stop-color)(=")([^"]+)(")/gi, (all, a, b, c, d) => (c === 'none' ? all : (changed++, a + b + IVORY + d)));
    svg = svg.replace(/(fill|stroke|stop-color)(\s*:\s*)(#[0-9a-f]{3,6}|rgba?\([^)]*\)|[a-z]+)/gi, (all, a, b, c) => (c === 'none' ? all : (changed++, a + b + IVORY)));
    return { svg, changed };
  }
  // Koyu nötr renkleri koyu zeminde okunur yap
  svg = svg.replace(/(fill|stroke|stop-color)(=")([^"]+)(")/gi, (all, a, b, c, d) => {
    const rgb = parseColor(c); if (rgb && isDarkNeutral(rgb)) { changed++; return a + b + IVORY + d; } return all;
  });
  svg = svg.replace(/(fill|stroke|stop-color)(\s*:\s*)(#[0-9a-f]{3,6}|rgba?\([^)]*\)|black)/gi, (all, a, b, c) => {
    const rgb = parseColor(c); if (rgb && isDarkNeutral(rgb)) { changed++; return a + b + IVORY; } return all;
  });
  // Dolgusu hiç tanımlanmamış şekiller varsayılan olarak siyah çizilir → kök elemana fildişi ver
  if (!/fill[=:]/i.test(svg)) { svg = svg.replace(/^<svg/i, `<svg fill="${IVORY}"`); changed++; }
  return { svg, changed };
}

(async () => {
  const raw = await getSvg();
  const files = fs.readdirSync(root, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => path.join(root, d.name, 'index.html'))
    .filter((f) => fs.existsSync(f) && fs.readFileSync(f, 'utf8').includes('<!-- LOGO:START'));
  if (!files.length) throw new Error('LOGO işaretli dosya bulunamadı');
  const re = /(<!-- LOGO:START(?::(light|mono))?[^>]*-->)[\s\S]*?(\s*<!-- LOGO:END -->)/;
  for (const f of files) {
    let html = fs.readFileSync(f, 'utf8');
    const mode = html.match(re)[2] || 'dark';
    const { svg, changed } = sanitize(raw, mode);
    html = html.replace(re, (all, a, b, c) => `${a}\n    <div class="bank"><span class="logo">${svg}</span></div>${c}`);
    fs.writeFileSync(f, html);
    console.log(`${path.relative(root, f)}: logo gömüldü (${Buffer.byteLength(svg)} bayt, mod: ${mode}, değiştirilen renk: ${changed}).`);
  }
})().catch((e) => { console.error(e.message); process.exit(1); });
