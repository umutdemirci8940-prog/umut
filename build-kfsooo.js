#!/usr/bin/env node
'use strict';
/** KFSOOO 970x250 bannerını derler → dist/kfsooo-970x250/index.html, release/kfsooo-970x250.html (+zip). Tüm varlıklar base64 gömülü. */
const fs = require('fs'); const path = require('path'); const { execSync } = require('child_process');
const render = require('./src/kfsooo/template'); const D = require('./src/kfsooo/data');
const root = __dirname;
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', woff2: 'font/woff2', woff: 'font/woff' };
const du = (f) => { const p = path.resolve(root, f); const ext = path.extname(p).slice(1).toLowerCase(); return `data:${MIME[ext] || 'application/octet-stream'};base64,${fs.readFileSync(p).toString('base64')}`; };
const S = D.assets;
const assets = { photo: du(S.photo), bg: du(S.bg), sticker: du(S.sticker), cola: du(S.cola), avatarA: du(S.avatarA), avatarB: du(S.avatarB),
  fontCss: S.fonts.map((f) => `@font-face{font-family:'${f.family}';font-style:normal;font-weight:${f.weight};font-display:block;src:url(${du(f.file)}) format('woff2')}`).join('\n') };
const html = render({ data: D, assets });
const outDir = path.join(root, 'dist', 'kfsooo-970x250'); fs.mkdirSync(outDir, { recursive: true }); fs.mkdirSync(path.join(root, 'release'), { recursive: true });
fs.writeFileSync(path.join(outDir, 'index.html'), html);
fs.copyFileSync(path.join(outDir, 'index.html'), path.join(root, 'release', 'kfsooo-970x250.html'));
const zip = path.join(root, 'release', 'kfsooo-970x250.zip'); fs.rmSync(zip, { force: true });
try { execSync(`cd "${outDir}" && zip -q -X "${zip}" index.html`); } catch (e) { console.log('zip üretilemedi:', e.message.split('\n')[0]); }
console.log(`dist/kfsooo-970x250/index.html ${(Buffer.byteLength(html) / 1024).toFixed(0)} KB · release/kfsooo-970x250.html + .zip (${fs.existsSync(zip) ? (fs.statSync(zip).size / 1024).toFixed(0) + ' KB' : '-'})`);
