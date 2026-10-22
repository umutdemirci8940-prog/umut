#!/usr/bin/env node
'use strict';
/**
 * dist/970x250/index.html, dist/320x480/index.html, zip paketleri ve preview.html üretir.
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

for (const key of Object.keys(SIZES)) {
  const dir = path.join(dist, key);
  fs.mkdirSync(dir, { recursive: true });
  const html = render(key, data);
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const zip = path.join(zipDir, `wellbeing-day-2026-${key}.zip`);
  fs.rmSync(zip, { force: true });
  try { execSync(`zip -q -j "${zip}" "${path.join(dir, 'index.html')}"`); } catch { /* zip yoksa atla */ }
  console.log(`✔ ${key.padEnd(8)} ${SIZES[key].label.padEnd(20)} ${(Buffer.byteLength(html) / 1024).toFixed(1).padStart(5)} KB`);
}

// Sunum sayfası: iki boyut yan yana, "Yeniden oynat" düğmeleriyle
const frames = Object.entries(SIZES).map(([k, s]) => `
  <figure>
    <figcaption><b>${k}</b> · ${s.label} <button onclick="var f=document.getElementById('f${k}');f.src=f.src">↻ Yeniden oynat</button></figcaption>
    <iframe id="f${k}" src="dist/${k}/index.html" width="${s.w}" height="${s.h}" scrolling="no" title="${k}"></iframe>
  </figure>`).join('');
fs.writeFileSync(path.join(__dirname, 'preview.html'), `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>İçten Dışa Parla – Interaktif Banner</title>
<style>body{margin:0;padding:32px 16px;font-family:system-ui,sans-serif;background:#ece6df;color:#3a2340}
h1{font-size:20px;margin:0 0 4px}p{margin:0 0 24px;color:#6d5672;font-size:14px}
.wrap{display:flex;flex-wrap:wrap;gap:32px;align-items:flex-start}
figure{margin:0;max-width:100%;overflow-x:auto}figcaption{font-size:13px;margin-bottom:8px;display:flex;gap:10px;align-items:center}
figcaption button{font:inherit;font-size:12px;border:1px solid #c9bcc9;background:#fff;border-radius:12px;padding:3px 10px;cursor:pointer}
iframe{border:0;display:block;box-shadow:0 10px 30px -12px rgba(58,35,64,.35)}</style></head>
<body><h1>Elif Tuncel Akademi · İçten Dışa Parla Wellbeing Day 2026</h1>
<p>Interaktif HTML5 banner – bir alan seçin (Beslenme / Zihin / Beden / Cilt), panel ve ışık rengi değişir. Etkileşim yoksa otomatik tanıtım akışı oynar.</p>
<div class="wrap">${frames}
</div></body></html>
`);
console.log('✔ preview.html');
