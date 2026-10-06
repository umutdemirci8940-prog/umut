#!/usr/bin/env node
'use strict';
/**
 * src/index.html → dist/index.html (+ dist/tvplus-masthead-970x250.zip)
 * QR yolu tools/qr-path.txt'ten gömülür. QR adresini değiştirmek için:
 *   npx qrcode -t svg "<yeni adres>"  → çıktıdaki <path d="..."> değerini tools/qr-path.txt'e yazın.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dir = __dirname;
const qr = fs.readFileSync(path.join(dir, 'tools', 'qr-path.txt'), 'utf8').trim();
const html = fs.readFileSync(path.join(dir, 'src', 'index.html'), 'utf8').replace('{{QR}}', qr);
const dist = path.join(dir, 'dist');
fs.mkdirSync(dist, { recursive: true });
fs.writeFileSync(path.join(dist, 'index.html'), html);
const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
let zipNote = '';
try {
  const zip = path.join(dist, 'tvplus-masthead-970x250.zip');
  fs.rmSync(zip, { force: true });
  execSync(`zip -q -j "${zip}" "${path.join(dist, 'index.html')}"`);
  zipNote = ` → ${path.relative(dir, zip)}`;
} catch { zipNote = ' (zip bulunamadı, paket atlandı)'; }
console.log(`✔ 970x250 masthead ${kb} KB${zipNote}`);
