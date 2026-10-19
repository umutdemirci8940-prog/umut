#!/usr/bin/env node
'use strict';
/** src/index.html → index.html: logoyu base64 gömer, tek dosyalık banner üretir. Kullanım: node build.js */
const fs = require('fs');
const path = require('path');
const dir = __dirname;
const logo = 'data:image/webp;base64,' + fs.readFileSync(path.join(dir, 'assets', 'bonus-logo.webp')).toString('base64');
const html = fs.readFileSync(path.join(dir, 'src', 'index.html'), 'utf8').split('{{BONUS_LOGO}}').join(logo);
fs.writeFileSync(path.join(dir, 'index.html'), html);
console.log('index.html', (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');
