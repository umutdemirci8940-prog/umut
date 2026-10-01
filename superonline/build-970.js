#!/usr/bin/env node
'use strict';
// 970x250 kaynaklarına siteden çekilen logo ve YouTube ikonunu base64 gömer → <klasör>/index.html
const fs = require('fs'), path = require('path');
const dir = __dirname, r = (f) => fs.readFileSync(path.join(dir, f));
const uri = (f) => 'data:image/png;base64,' + r(f).toString('base64');
for (const d of ['970x250', '970x250-ayni-anda', '970x250-fener']) {
  const html = r(d + '/src.html').toString()
    .replaceAll('__LOGO__', uri('research/Superonline_2026_yeni_logo.png'))
    .replaceAll('__YT__', uri('research/benefit.youtube.png'));
  fs.writeFileSync(path.join(dir, d, 'index.html'), html);
  console.log(d + '/index.html', (Buffer.byteLength(html) / 1024).toFixed(1) + ' KB');
}
