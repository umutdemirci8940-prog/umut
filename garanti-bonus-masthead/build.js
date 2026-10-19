#!/usr/bin/env node
'use strict';
/**
 * src/*.html → tek dosyalık bannerlar (logo base64 gömülür).
 *   src/index.html       → index.html             (interaktif "sepetini doldur")
 *   src/media-first.html → media-first/index.html (sinematik, media-first)
 * Kullanım: node build.js
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const logo = 'data:image/webp;base64,' + fs.readFileSync(path.join(dir, 'assets', 'bonus-logo.webp')).toString('base64');
for (const [src, out] of [['index.html', 'index.html'], ['media-first.html', 'media-first/index.html']]) {
  const html = fs.readFileSync(path.join(dir, 'src', src), 'utf8').split('{{BONUS_LOGO}}').join(logo);
  fs.mkdirSync(path.dirname(path.join(dir, out)), { recursive: true });
  fs.writeFileSync(path.join(dir, out), html);
  console.log(out, (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');
}
