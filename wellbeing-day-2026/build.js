#!/usr/bin/env node
'use strict';
/**
 * Üretir:
 *   dist/970x250/index.html, dist/320x480/index.html   – görseller base64 gömülü, tek dosya
 *   dist/zip/wellbeing-day-2026-<boyut>.zip             – reklam ağlarına yüklemeye hazır
 *   preview.html                                         – iki banner içine gömülü, TEK DOSYA (indirip açılabilir)
 * Kullanım: node build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('./src/data');
const { render, SIZES } = require('./src/template');

const dist = path.join(__dirname, 'dist');
const zipDir = path.join(dist, 'zip');
fs.mkdirSync(zipDir, { recursive: true });
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', svg: 'image/svg+xml' };
const uri = (rel) => `data:${MIME[path.extname(rel).slice(1)]};base64,${fs.readFileSync(path.join(__dirname, rel)).toString('base64')}`;
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');

const built = {};
for (const key of Object.keys(SIZES)) {
  const img = { portrait: uri(data.images.portrait), logo: uri(data.images.logo), bg: uri(data.images.bg[key]) };
  const html = render(key, data, img);
  built[key] = html;
  const dir = path.join(dist, key);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const zip = path.join(zipDir, `wellbeing-day-2026-${key}.zip`);
  fs.rmSync(zip, { force: true });
  try { execSync(`zip -q -j "${zip}" "${path.join(dir, 'index.html')}"`); } catch { /* zip yoksa atla */ }
  const kb = Buffer.byteLength(html) / 1024;
  console.log(`✔ ${key.padEnd(8)} ${SIZES[key].label.padEnd(20)} ${kb.toFixed(1).padStart(6)} KB${kb > 150 ? '  ⚠ 150 KB üstü' : ''}`);
}

// Sunum sayfası: bannerlar srcdoc ile gömülü → tek başına indirilip açılabilir
const frames = Object.entries(SIZES).map(([k, s]) => `
  <figure>
    <figcaption><b>${k}</b> · ${s.label}
      <button type="button" onclick="var f=document.getElementById('f${k}');f.srcdoc=f.srcdoc">↻ Yeniden oynat</button></figcaption>
    <iframe id="f${k}" width="${s.w}" height="${s.h}" scrolling="no" title="${k}" srcdoc="${escAttr(built[k])}"></iframe>
  </figure>`).join('');
fs.writeFileSync(path.join(__dirname, 'preview.html'), `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>İçten Dışa Parla – Interaktif Banner</title>
<style>body{margin:0;padding:32px 16px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#ece4da;color:#1f1a17}
h1{font-size:20px;margin:0 0 4px}p{margin:0 0 24px;color:#5e5148;font-size:14px;max-width:760px}
.wrap{display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start}
figure{margin:0;max-width:100%;overflow-x:auto}figcaption{font-size:13px;margin-bottom:8px;display:flex;gap:10px;align-items:center}
figcaption button{font:inherit;font-size:12px;border:1px solid #c9bcb0;background:#fff;border-radius:12px;padding:3px 10px;cursor:pointer}
iframe{border:0;display:block;box-shadow:0 10px 30px -12px rgba(31,26,23,.35)}</style></head>
<body><h1>Elif Tuncel Akademi · İçten Dışa Parla® Wellbeing Day 2026</h1>
<p>21 Kasım 2026 · Marriott İstanbul Şişli – interaktif HTML5 banner. Bir alan seçin (Beslenme / Zihin / Beden / Cilt): panel ve ışık rengi değişir. Etkileşim yoksa banner alanları kendisi gösterir ve “Yerinizi Ayırtın” kapanışında durur.</p>
<div class="wrap">${frames}
</div></body></html>
`);
console.log(`✔ preview.html  ${(fs.statSync(path.join(__dirname, 'preview.html')).size / 1024).toFixed(1)} KB (tek dosya)`);
