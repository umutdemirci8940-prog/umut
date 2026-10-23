#!/usr/bin/env node
'use strict';
/**
 * Her çalışmanın ekran görüntüsünü alır (970×250 ve mobil uyarlamalılarda 320×480) ve
 * konsol hatalarını raporlar. Çıktı: preview/<ad>.jpg, preview/<ad>-m.jpg
 * Kullanım: NODE_PATH=$(npm root -g) node tools/shoot.js [ad-adı-parçası] [--wait=4500]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const ADS = require('../src/ads');

const root = path.join(__dirname, '..');
const out = path.join(root, 'preview');
fs.mkdirSync(out, { recursive: true });
const args = process.argv.slice(2);
const only = args.filter((a) => !a.startsWith('-'));
const wait = +((args.find((a) => a.startsWith('--wait=')) || '').split('=')[1] || 4500);

(async () => {
  const browser = await chromium.launch(fs.existsSync('/opt/pw-browsers/chromium') ? {} : {});
  let errors = 0;
  for (const ad of ADS) {
    if (only.length && !only.some((o) => ad.id.includes(o))) continue;
    const file = path.join(root, 'dist', ad.id, 'index.html');
    const sizes = [[970, 250, '']].concat(ad.mobile ? [[320, 480, '-m']] : []);
    for (const [w, h, suf] of sizes) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
      const errs = [];
      page.on('pageerror', (e) => errs.push(e.message));
      page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_|net::/.test(m.text())) errs.push(m.text()); });
      await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
      await page.goto('file://' + file);
      await page.waitForTimeout(wait);
      await page.screenshot({ path: path.join(out, `${ad.id}${suf}.jpg`), type: 'jpeg', quality: 82 });
      if (errs.length) { errors++; console.log(`✖ ${ad.id}${suf}: ${errs.join(' | ')}`); } else console.log(`✔ ${ad.id}${suf}`);
      await page.close();
    }
  }
  await browser.close();
  process.exit(errors ? 1 : 0);
})();
