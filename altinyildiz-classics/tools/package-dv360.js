#!/usr/bin/env node
'use strict';
/**
 * Kombin Makinesi (AC) → DV360 HTML5 paketi.
 *  - Her ürün çıkışı ayrı bir clickTag'e bağlanır (clickTag1…clickTagN, sıra = markanın ürün listesi).
 *    DV360 bu değişkenleri yüklemede algılar; değerleri koddaki varsayılan UTM'li adreslerdir.
 *    Ana çıkış "clickTag" (banner zemini için yedek) = listedeki ilk ürün.
 *  - Google Fonts çağrısı kaldırılır, Urbanist fontu base64 olarak gömülür (dış kaynak kalmaz).
 *  - Zip kökünde yalnızca index.html bulunur.
 * Kullanım: node tools/package-dv360.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const src = path.join(root, 'dist', '09-kombin-makinesi-ac', 'index.html');
const outDir = path.join(root, 'dv360');
const name = 'AltinyildizClassics_KombinMakinesi_970x250_DV360';
const list = require('../src/ac-urunler.json').filter((p) => !p.dup);

let html = fs.readFileSync(src, 'utf8');
const must = (needle) => { if (!html.includes(needle)) throw new Error('Beklenen kod bulunamadı: ' + needle.slice(0, 80)); };

// 1) clickTag tanımları
const esc = (u) => JSON.stringify(u);
const tags = ['var clickTag = ' + esc(list[0].url) + ';']
  .concat(list.map((p, i) => `var clickTag${i + 1} = ${esc(p.url)}; // ${p.path.replace(/^erkek-|-p$/g, '')}`)).join('\n');
must("<script>var clickTag = window.clickTag || '';</script>");
html = html.replace("<script>var clickTag = window.clickTag || '';</script>", `<script>\n/* DV360 çıkışları – her ürün için ayrı clickTag (DV360 arayüzünde değiştirilebilir) */\n${tags}\n</script>`);

// 2) Çıkış fonksiyonu: ürün adresi → ilgili clickTagN
const LIST = JSON.stringify(list.map((p) => p.url));
const oldExit = "window.open(window.clickTag && /^https?:/.test(window.clickTag) ? window.clickTag : url, '_blank');";
must(oldExit);
html = html.replace(oldExit, `var i = ${LIST}.indexOf(url), tag = i >= 0 ? window['clickTag' + (i + 1)] : window.clickTag;\n    window.open(tag || url, '_blank');`);

// 3) Font: Google Fonts yerine gömülü @font-face
const cache = path.join(root, 'preview', '.fontcache');
const css = fs.readFileSync(path.join(cache, 'fonts.css'), 'utf8');
const faces = [];
for (const m of css.matchAll(/@font-face\s*{[^}]*?font-weight:\s*400;[^}]*?url\(([^)]+)\)[^}]*?unicode-range:\s*([^;]+);[^}]*}/g)) {
  const f = path.join(cache, path.basename(m[1]));
  faces.push(`@font-face{font-family:Urbanist;font-style:normal;font-weight:400 800;font-display:swap;src:url(data:font/woff2;base64,${fs.readFileSync(f).toString('base64')}) format('woff2');unicode-range:${m[2]}}`);
}
if (faces.length !== 2) throw new Error('Font dosyaları beklenenden farklı: ' + faces.length);
html = html.replace(/<link rel="preconnect"[^>]*>\n/g, '').replace(/<link href="https:\/\/fonts\.googleapis\.com[^>]*>\n/, '');
html = html.replace('<style>', '<style>\n' + faces.join('\n') + '\n');
if (/fonts\.g(oogleapis|static)\.com/.test(html)) throw new Error('Dış font çağrısı kaldı');

// 4) Yaz + zip
fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(path.join(outDir, name), { recursive: true });
fs.writeFileSync(path.join(outDir, name, 'index.html'), html);
const zip = path.join(outDir, name + '.zip');
execSync(`cd "${path.join(outDir, name)}" && zip -q -9 -X "${zip}" index.html`);
// clickTag eşleme tablosu (DV360'ta kontrol için)
const rows = [['clickTag', 'Ürün (listedeki sıra)', 'Adres'], ['clickTag', 'Ana çıkış (yedek) – ' + list[0].no, list[0].url]]
  .concat(list.map((p, i) => [`clickTag${i + 1}`, String(p.no), p.url]));
fs.writeFileSync(path.join(outDir, name + '_clickTag-listesi.csv'), '﻿' + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\n'));
const kb = (f) => (fs.statSync(f).size / 1024).toFixed(1);
console.log(`✔ ${path.relative(root, zip)}  zip ${kb(zip)} KB · index.html ${kb(path.join(outDir, name, 'index.html'))} KB · ${list.length} ürün clickTag'i`);
