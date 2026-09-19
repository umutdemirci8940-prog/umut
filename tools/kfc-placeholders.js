#!/usr/bin/env node
'use strict';
/** Yerel hareket testi için geçici yer tutucu görseller üretir (assets/kfc-placeholder/). Gerçek varlıklar siteden gelir. */
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const dir = path.join(__dirname, '..', 'assets', 'kfc-placeholder'); fs.mkdirSync(path.join(dir, 'img'), { recursive: true });
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 600, height: 600 } });
  const shots = {
    'img/logo.png': `<div style="width:300px;height:120px;background:#e4002b;border-radius:16px;display:flex;align-items:center;justify-content:center;color:#fff;font:900 70px Arial">KFC</div>`,
    'img/kova.png': `<div style="width:260px;height:320px;border-radius:30px 30px 60px 60px;background:repeating-linear-gradient(90deg,#e4002b 0 30px,#fff 30px 60px);box-shadow:inset 0 -40px 60px rgba(0,0,0,.35)"><div style="height:70px;border-radius:30px;background:#fff;margin:-20px 0 0"></div></div>`,
    'img/burger.png': `<div style="width:240px;height:200px;border-radius:120px 120px 40px 40px;background:linear-gradient(#f0b35a,#d98b2b);box-shadow:inset 0 -60px 0 #6b3a1e"></div>`,
    'img/kanat.png': `<div style="width:200px;height:160px;border-radius:50%;background:radial-gradient(circle at 30% 30%,#f6c777,#b6641c)"></div>`,
    'img/hero.jpg': `<div style="width:600px;height:340px;background:radial-gradient(circle at 70% 40%,#7a1f1f,#1a0707 70%)"></div>`,
  };
  for (const [f, html] of Object.entries(shots)) {
    await p.setContent(`<body style="margin:0;background:transparent">${html}</body>`);
    const el = p.locator('body > div');
    await el.screenshot({ path: path.join(dir, f), omitBackground: f.endsWith('.png'), type: f.endsWith('.png') ? 'png' : 'jpeg' });
  }
  await b.close(); console.log('yer tutucular hazır:', dir);
})();
