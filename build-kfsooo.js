#!/usr/bin/env node
'use strict';
/**
 * KFSOOO 970x250 (v2, medya öncelikli) derleyici. Tüm varlıklar base64 gömülü.
 *   node build-kfsooo.js          → dist/kfsooo-970x250/index.html + release/kfsooo-970x250.html/.zip (H.264 mp4)
 *   node build-kfsooo.js --webm   → dist/kfsooo-970x250/index-test.html (VP9; yerel Chromium testi için)
 */
const fs = require('fs'); const path = require('path'); const { execSync } = require('child_process');
const render = require('./src/kfsooo/template'); const D = require('./src/kfsooo/data');
const root = __dirname; const args = Object.fromEntries(process.argv.slice(2).map((a) => [a.replace(/^--/, ''), true]));
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', woff2: 'font/woff2', woff: 'font/woff', mp4: 'video/mp4', webm: 'video/webm' };
const du = (f) => { const p = path.resolve(root, f); const ext = path.extname(p).slice(1).toLowerCase(); return `data:${MIME[ext] || 'application/octet-stream'};base64,${fs.readFileSync(p).toString('base64')}`; };
const has = (f) => f && fs.existsSync(path.resolve(root, f));
const S = D.assets;
const assets = {
  photo: du(S.photo), bg: du(S.bg), sticker: du(S.sticker), cola: du(S.cola), avatarA: du(S.avatarA), avatarB: du(S.avatarB),
  product: has(S.product.file) ? du(S.product.file) : S.product.url,
  films: S.films.filter((f) => has(args.webm ? f.webm : f.file) && has(f.thumb)).map((f) => ({ name: f.name, video: du(args.webm ? f.webm : f.file), type: args.webm ? 'video/webm' : 'video/mp4', thumb: du(f.thumb) })),
  fontCss: S.fonts.map((f) => `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};font-display:block;src:url(${du(f.file)}) format('woff2')}`).join('\n'),
};
const html = render({ data: D, assets });
const outDir = path.join(root, 'dist', 'kfsooo-970x250'); fs.mkdirSync(outDir, { recursive: true }); fs.mkdirSync(path.join(root, 'release'), { recursive: true });
const name = args.webm ? 'index-test.html' : 'index.html';
fs.writeFileSync(path.join(outDir, name), html);
console.log(`dist/kfsooo-970x250/${name} ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB · film:${assets.films.length}`);
if (!args.webm) {
  fs.copyFileSync(path.join(outDir, name), path.join(root, 'release', 'kfsooo-970x250.html'));
  const zip = path.join(root, 'release', 'kfsooo-970x250.zip'); fs.rmSync(zip, { force: true });
  try { execSync(`cd "${outDir}" && zip -q -X "${zip}" index.html`); console.log(`release/kfsooo-970x250.html + .zip (${(fs.statSync(zip).size / 1024).toFixed(0)} KB)`); } catch (e) { console.log('zip üretilemedi:', e.message.split('\n')[0]); }
}
