#!/usr/bin/env node
'use strict';
/**
 * Dyson ürün fotoğraflarını (Adobe Scene7) şeffaf PNG olarak indirir: <SKU>-01…-12 açıları.
 * Çıktı: dyson/assets/products/<sku>-<nn>.png + index.json
 * Kullanım: node dyson/tools/fetch-dyson-products.js
 */
const fs = require('fs');
const path = require('path');
const OUT = path.join(__dirname, '..', 'assets', 'products');
const BASE = 'https://dyson-h.assetsadobe2.com/is/image/content/dam/dyson';
// sitedeki görsellerden bulunan SKU'lar
const SKUS = ['494876', '122781', '492345', '492969', '448707', '446986', '460555', '419219', '476749'];
const DIRS = ['images/products/primary', 'images/products/gallery'];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const index = [];
  for (const sku of SKUS) for (const dir of DIRS) for (let n = 1; n <= 12; n++) {
    const id = `${sku}-${String(n).padStart(2, '0')}`;
    const url = `${BASE}/${dir}/${id}.png?scl=1&fmt=png-alpha&wid=1600`;
    try {
      const r = await fetch(url, { headers: { 'user-agent': UA, referer: 'https://www.dyson.com.tr/' } });
      if (!r.ok) continue;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 15000 || buf.toString('ascii', 1, 4) !== 'PNG') continue;
      const f = `${sku}-${String(n).padStart(2, '0')}${dir.endsWith('gallery') ? '-g' : ''}.png`;
      fs.writeFileSync(path.join(OUT, f), buf);
      index.push({ file: f, url, bytes: buf.length });
      console.log('✔', f, buf.length);
    } catch (e) { /* atla */ }
  }
  fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 2));
  console.log(index.length, 'görsel');
})();
