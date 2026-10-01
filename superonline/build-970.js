#!/usr/bin/env node
'use strict';
// 970x250 kaynağına siteden çekilen logo ve YouTube ikonunu base64 gömer → 970x250/index.html
const fs = require('fs'), path = require('path');
const dir = __dirname, r = (f) => fs.readFileSync(path.join(dir, f));
const uri = (f) => 'data:image/png;base64,' + r(f).toString('base64');
const html = r('970x250/src.html').toString()
  .replaceAll('__LOGO__', uri('research/Superonline_2026_yeni_logo.png'))
  .replaceAll('__YT__', uri('research/benefit.youtube.png'));
fs.writeFileSync(path.join(dir, '970x250/index.html'), html);
console.log('970x250/index.html', (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');
