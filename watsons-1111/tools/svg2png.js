#!/usr/bin/env node
'use strict';
// SVG logoyu Chromium ile yüksek çözünürlüklü PNG'ye çevirir. Kullanım: node tools/svg2png.js giris.svg cikis.png
const fs = require('fs');
const { chromium } = require('playwright');

(async () => {
  const [src, dst] = process.argv.slice(2);
  let svg = fs.readFileSync(src, 'utf8');
  if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  const b = await chromium.launch();
  const p = await b.newPage({ deviceScaleFactor: 4 });
  await p.setContent(`<body style="margin:0;background:transparent"><div id="x" style="display:inline-block;height:60px">${svg.replace('<svg', '<svg style="height:60px;width:auto;display:block"')}</div></body>`);
  await p.locator('#x').screenshot({ path: dst, omitBackground: true });
  await b.close();
})();
