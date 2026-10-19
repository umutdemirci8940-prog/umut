#!/usr/bin/env node
'use strict';
/**
 * src/*.html → tek dosyalık bannerlar (logo base64 gömülür).
 *   src/index.html       → index.html             (interaktif "sepetini doldur")
 *   src/media-first.html → media-first/index.html (sinematik, media-first)
 *   src/video.html       → video/index.html       (kampanya görseli + video alanı)
 *   src/pos.html         → pos/index.html         (Kartını Okut: POS + fiş)
 *   src/vitrin.html      → vitrin/index.html      (Black Friday vitrini, fotoğraf-gerçekçi; görseller assets/vitrin/)
 * Kullanım: node build.js
 */
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const logo = 'data:image/webp;base64,' + fs.readFileSync(path.join(dir, 'assets', 'bonus-logo.webp')).toString('base64');
for (const [src, out] of [['index.html', 'index.html'], ['media-first.html', 'media-first/index.html'], ['video.html', 'video/index.html'], ['pos.html', 'pos/index.html'], ['vitrin.html', 'vitrin/index.html']]) {
  const MIME = { jpg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  const html = fs.readFileSync(path.join(dir, 'src', src), 'utf8').split('{{BONUS_LOGO}}').join(logo)
    .replace(/\{\{VITRIN:([\w.-]+)\}\}/g, (_, f) => `data:${MIME[f.split('.').pop()]};base64,` + fs.readFileSync(path.join(dir, 'assets', 'vitrin', f)).toString('base64'));
  fs.mkdirSync(path.dirname(path.join(dir, out)), { recursive: true });
  fs.writeFileSync(path.join(dir, out), html);
  console.log(out, (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');
}
