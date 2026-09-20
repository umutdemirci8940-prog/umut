#!/usr/bin/env node
'use strict';
/**
 * assets/logo-src.(svg|png) → assets/logo.png (özgün renkler) + assets/logo-light.png (koyu zemin için tek renk krem)
 * 4× çözünürlükte, şeffaf zeminde, içeriğe kırpılmış. Playwright + Chromium gerektirir.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const assets = path.join(__dirname, '..', 'assets');
const src = ['logo-src.svg', 'logo-src.png'].map((f) => path.join(assets, f)).find((f) => fs.existsSync(f));
if (!src) { console.error('assets/logo-src.svg|png yok. Önce: node tools/fetch-logo.js'); process.exit(1); }
const isSvg = src.endsWith('.svg');
const HEIGHT = 26 * 4;   // ekranda 26 px yükseklik, 4× render

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 400 }, deviceScaleFactor: 1 });
  const data = isSvg ? fs.readFileSync(src, 'utf8') : `data:image/png;base64,${fs.readFileSync(src).toString('base64')}`;
  const out = {};
  for (const variant of ['original', 'light']) {
    const body = isSvg
      ? data.replace(/<svg/i, `<svg id="lg" style="height:${HEIGHT}px;width:auto"`)
      : `<img id="lg" src="${data}" style="height:${HEIGHT}px;width:auto">`;
    const css = variant === 'light'
      ? (isSvg ? '#lg *{fill:#f8eedf!important;stroke:none!important}#lg{color:#f8eedf}' : '#lg{filter:brightness(0) invert(1) sepia(.35) saturate(.6) brightness(.98)}')
      : '';
    await page.setContent(`<!doctype html><html><head><style>html,body{margin:0;background:transparent}${css}</style></head><body>${body}</body></html>`);
    const el = await page.$('#lg');
    await page.waitForTimeout(150);
    const box = await el.boundingBox();
    const file = path.join(assets, variant === 'light' ? 'logo-light.png' : 'logo.png');
    await el.screenshot({ path: file, omitBackground: true });
    out[variant] = { file: path.relative(path.join(assets, '..'), file), w: Math.round(box.width), h: Math.round(box.height) };
    console.log('[logo]', variant, Math.round(box.width) + 'x' + Math.round(box.height), '→', out[variant].file);
  }
  await browser.close();
  const meta = fs.existsSync(path.join(assets, 'logo-source.json')) ? JSON.parse(fs.readFileSync(path.join(assets, 'logo-source.json'), 'utf8')) : {};
  fs.writeFileSync(path.join(assets, 'logo.json'), JSON.stringify(Object.assign(meta, { render: out, scale: 4 }), null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
