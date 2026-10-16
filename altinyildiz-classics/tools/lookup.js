// Kullanım: node tools/lookup.js raw-kasim/054 raw-kasim2/105 ...  → ad, bağlantı, fiyatlar
const path = require('path');
for (const a of process.argv.slice(2)) {
  const [folder, num] = a.split('/');
  const idx = require(path.join(__dirname, '..', 'assets', folder, 'index.json'));
  const it = idx.images.find((i) => i.file.slice(4, 7) === num);
  if (!it) { console.log(a, 'yok'); continue; }
  const pr = (it.priceText || '').match(/[\d.]+[.,]\d{2}\s*TL/g);
  console.log(JSON.stringify({ src: a, alt: it.alt, href: it.href, prices: pr }));
}
