'use strict';
/**
 * assets/ altındaki gerçek marka varlıklarını (logo, kart, sahne fotoğrafları) data URI olarak yükler.
 * Kullanım: const { loadAssets } = require('./src/assets'); const assets = loadAssets({ standin: true, quiet: false });
 */
const fs = require('fs');
const path = require('path');
const MIME = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
const root = path.join(__dirname, '..');

function loadAssets(opts = {}) {
  const dir = path.join(root, 'assets');
  const mfPath = path.join(dir, 'manifest.json');
  const mf = fs.existsSync(mfPath) ? JSON.parse(fs.readFileSync(mfPath, 'utf8')) : {};
  const find = (key) => {
    const entry = mf[key] || {};
    const candidates = [entry.optimized, entry.file].filter(Boolean).map((f) => path.join(dir, f));
    for (const ext of ['svg', 'png', 'webp', 'jpg', 'jpeg']) candidates.push(path.join(dir, `${key}.${ext}`));
    const f = candidates.find((p) => fs.existsSync(p));
    if (!f) return null;
    const ext = path.extname(f).slice(1).toLowerCase();
    const buf = fs.readFileSync(f);
    return { uri: `data:${MIME[ext] || 'application/octet-stream'};base64,${buf.toString('base64')}`, bytes: buf.length, file: path.relative(root, f), white: !!entry.white };
  };
  const out = { logo: find('logo'), card: find('card'), photos: {} };
  const phPath = path.join(dir, 'photos.json');
  if (fs.existsSync(phPath)) {
    const ph = JSON.parse(fs.readFileSync(phPath, 'utf8'));
    for (const [slot, e] of Object.entries(ph.slots || {})) {
      const f = [e.optimized, e.file].filter(Boolean).map((x) => path.join(dir, x)).find((x) => fs.existsSync(x));
      if (!f) continue;
      const ext = path.extname(f).slice(1).toLowerCase(); const buf = fs.readFileSync(f);
      out.photos[slot] = { uri: `data:${MIME[ext] || 'application/octet-stream'};base64,${buf.toString('base64')}`, bytes: buf.length, file: path.relative(root, f), source: e.source || 'manual', credit: e.credit || '' };
    }
  }
  if (opts.standin && !Object.keys(out.photos).length) {
    const sd = path.join(dir, 'photos', 'standin');
    if (fs.existsSync(sd)) for (const f of fs.readdirSync(sd)) { const slot = f.replace(/\.\w+$/, ''); const buf = fs.readFileSync(path.join(sd, f)); out.photos[slot] = { uri: `data:image/jpeg;base64,${buf.toString('base64')}`, bytes: buf.length, file: 'photos/standin/' + f, source: 'standin', credit: 'GEÇİCİ – gerçek fotoğraf iş akışıyla gelir' }; }
  }
  if (!opts.quiet) {
    const parts = [];
    if (out.logo) parts.push(`logo ${out.logo.file} (${(out.logo.bytes / 1024).toFixed(0)} KB${out.logo.white ? ', beyaza çevrilir' : ''})`);
    if (out.card) parts.push(`kart ${out.card.file} (${(out.card.bytes / 1024).toFixed(0)} KB)`);
    const pk = Object.keys(out.photos);
    if (pk.length) parts.push(`fotoğraflar ${pk.map((k) => `${k} (${(out.photos[k].bytes / 1024).toFixed(0)} KB, ${out.photos[k].source})`).join(', ')}`);
    console.log(parts.length ? `Marka varlıkları: ${parts.join(', ')}` : 'Marka varlıkları: assets/ boş → çizim logo/kart, üretilmiş arka plan (gerçekleri için: GitHub Actions iş akışı ya da tools/fetch-pluxee-assets.js)');
  }
  return out;
}
module.exports = { loadAssets, MIME };
