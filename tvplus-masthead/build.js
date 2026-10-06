#!/usr/bin/env node
'use strict';
/**
 * src/index.html → dist/index.html (A: Kumanda), src/mozaik.html → dist/mozaik/index.html (B: Mozaik) + zip paketleri
 * QR yolu tools/qr-path.txt'ten gömülür. QR adresini değiştirmek için:
 *   npx qrcode -t svg "<yeni adres>"  → çıktıdaki <path d="..."> değerini tools/qr-path.txt'e yazın.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const dir = __dirname;
const qr = fs.readFileSync(path.join(dir, 'tools', 'qr-path.txt'), 'utf8').trim();
const dist = path.join(dir, 'dist');
// [kaynak, çıktı klasörü, zip adı]
const TARGETS = [
  ['index.html', '', 'tvplus-masthead-970x250.zip'],          // A: Kumanda
  ['mozaik.html', 'mozaik', 'tvplus-masthead-mozaik-970x250.zip'], // B: Mozaik
];
for (const [src, sub, zipName] of TARGETS) {
  const html = fs.readFileSync(path.join(dir, 'src', src), 'utf8').replace('{{QR}}', qr);
  const out = path.join(dist, sub);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  const kb = (Buffer.byteLength(html) / 1024).toFixed(1);
  let zipNote = '';
  try {
    const zip = path.join(dist, zipName);
    fs.rmSync(zip, { force: true });
    execSync(`zip -q -j "${zip}" "${path.join(out, 'index.html')}"`);
    zipNote = ` → ${path.relative(dir, zip)}`;
  } catch { zipNote = ' (zip bulunamadı, paket atlandı)'; }
  console.log(`✔ ${src.padEnd(12)} ${kb} KB${zipNote}`);
}
