#!/usr/bin/env node
'use strict';
/**
 * Kombin Makinesi (AC) → DV360 HTML5 paketleri (standart yapı):
 *   index.html (küçük) + ayrı JPG/PNG görseller, Urbanist fontu CSS içinde gömülü, dış kaynak yok.
 *   A) Ürün başına clickTag: clickTag (ana) + clickTag1…clickTagN (sıra = markanın ürün listesi)
 *   B) Tek clickTag: tüm çıkışlar clickTag'e gider (yalnızca A yüklenemezse)
 * Kullanım: python3 gerekmez; node tools/package-dv360.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const cdir = path.join(root, 'concepts', '09-kombin-makinesi-ac');
const imgDir = path.join(root, 'assets', 'concepts', '09-kombin-makinesi-ac');
const outRoot = path.join(root, 'dv360');
const base = 'AltinyildizClassics_KombinMakinesi_970x250';
const data = require(path.join(cdir, 'data.js'));
const list = require('../src/ac-urunler.json').filter((p) => !p.dup);
const tpl = fs.readFileSync(path.join(cdir, 'template.html'), 'utf8');

// Font (gömülü, latin + latin-ext)
const cache = path.join(root, 'preview', '.fontcache');
const css = fs.readFileSync(path.join(cache, 'fonts.css'), 'utf8');
const faces = [];
for (const m of css.matchAll(/@font-face\s*{[^}]*?font-weight:\s*400;[^}]*?url\(([^)]+)\)[^}]*?unicode-range:\s*([^;]+);[^}]*}/g))
  faces.push(`@font-face{font-family:Urbanist;font-style:normal;font-weight:400 800;font-display:swap;src:url(data:font/woff2;base64,${fs.readFileSync(path.join(cache, path.basename(m[1]))).toString('base64')}) format('woff2');unicode-range:${m[2]}}`);
if (faces.length !== 2) throw new Error('font');

function build(variant) {
  const dir = path.join(outRoot, `${base}_DV360_${variant}`);
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  // Görseller: WebP → JPG (DV360'ın kabul ettiği türler), logo PNG
  const IMG = {};
  for (const f of fs.readdirSync(imgDir).filter((f) => f.endsWith('.webp'))) {
    const key = f.slice(0, -5);
    execSync(`python3 -c "from PIL import Image;Image.open('${path.join(imgDir, f)}').convert('RGB').save('${path.join(dir, key + '.jpg')}',quality=84,optimize=True,progressive=True)"`);
    IMG[key] = key + '.jpg';
  }
  fs.copyFileSync(path.join(root, 'assets', 'banner', 'logo.png'), path.join(dir, 'logo.png'));

  const urls = list.map((p) => p.url);
  const tags = variant === 'A'
    ? ['var clickTag = "' + urls[0] + '";'].concat(urls.map((u, i) => `var clickTag${i + 1} = "${u}";`)).join('\n')
    : 'var clickTag = "' + urls[0] + '";';
  const exitJs = variant === 'A'
    ? `var i = ${JSON.stringify(urls)}.indexOf(url), tag = i >= 0 ? window['clickTag' + (i + 1)] : window.clickTag;\n    window.open(tag || url, '_blank');`
    : `window.open(window.clickTag || url, '_blank');`;

  let html = tpl;
  const swap = (a, b) => { if (!html.includes(a)) throw new Error('bulunamadı: ' + a.slice(0, 60)); html = html.split(a).join(b); };
  swap('%%LOGO%%', 'logo.png');
  swap('/*DATA*/null', JSON.stringify(data).replace(/</g, '\\u003c'));
  swap('/*IMG*/null', JSON.stringify(IMG));
  swap("<script>var clickTag = window.clickTag || '';</script>", '<script type="text/javascript">\n' + tags + '\n</script>');
  swap("window.open(window.clickTag && /^https?:/.test(window.clickTag) ? window.clickTag : url, '_blank');", exitJs);
  html = html.replace(/<link rel="preconnect"[^>]*>\n/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n/, '');
  html = html.replace('<style>', '<style>\n' + faces.join('\n') + '\n');
  if (/fonts\.g(oogleapis|static)\.com|data:image/.test(html)) throw new Error('dış font ya da gömülü görsel kaldı');
  fs.writeFileSync(path.join(dir, 'index.html'), html);

  const zip = path.join(outRoot, `${base}_DV360_${variant}.zip`);
  fs.rmSync(zip, { force: true });
  execSync(`cd "${dir}" && zip -q -9 -X -D "${zip}" index.html logo.png *.jpg`);
  const n = execSync(`unzip -Z1 "${zip}" | wc -l`).toString().trim();
  console.log(`✔ ${path.basename(zip)}  ${(fs.statSync(zip).size / 1024).toFixed(1)} KB · ${n} dosya · index.html ${(fs.statSync(path.join(dir, 'index.html')).size / 1024).toFixed(1)} KB`);
}

fs.rmSync(outRoot, { recursive: true, force: true }); fs.mkdirSync(outRoot);
build('A'); build('B');
const rows = [['clickTag', 'Urun no (Word listesi)', 'Adres'], ['clickTag', 'Ana cikis (yedek)', list[0].url]].concat(list.map((p, i) => [`clickTag${i + 1}`, String(p.no), p.url]));
fs.writeFileSync(path.join(outRoot, `${base}_clickTag-listesi.csv`), '﻿' + rows.map((r) => r.map((c) => `"${c}"`).join(';')).join('\n'));
