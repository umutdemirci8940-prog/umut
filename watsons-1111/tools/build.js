#!/usr/bin/env node
'use strict';
/**
 * Watsons 11.11 masthead setini derler (src/ads/*.html → dist/).
 *   dist/<ad>/index.html + img/   : reklam sunucusuna yüklenecek klasör (yalnızca kullanılan görseller)
 *   dist/zip/watsons-1111-<ad>.zip
 *   dist/inline/<ad>.html          : görseller base64 gömülü tek dosya (sunum / önizleme)
 * Önce: python3 tools/prepare.py (assets/ → assets/ads/)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('../src/data');
const ADS = require('../src/ads');

const root = path.join(__dirname, '..');
const src = path.join(root, 'src');
const imgSrc = path.join(root, 'assets', 'ads');
const dist = path.join(root, 'dist');
const css = fs.readFileSync(path.join(src, 'shared.css'), 'utf8');
const js = fs.readFileSync(path.join(src, 'shared.js'), 'utf8');
const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml' };
fs.mkdirSync(path.join(dist, 'zip'), { recursive: true });
fs.mkdirSync(path.join(dist, 'inline'), { recursive: true });
let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }
const only = process.argv.slice(2).filter((a) => !a.startsWith('-'));

for (const ad of ADS) {
  if (only.length && !only.some((o) => ad.id.includes(o))) continue;
  const file = path.join(src, 'ads', `${ad.id}.html`);
  if (!fs.existsSync(file)) { console.log(`– ${ad.id}: kaynak yok, atlandı`); continue; }
  const d = data.forAd(ad);
  const size = ad.mobile ? '970x250,320x480' : '970x250';
  let html = fs.readFileSync(file, 'utf8')
    .replace('{{HEAD}}', () => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<meta name="ad.size" content="width=970,height=250">
<title>Watsons 11.11 – ${ad.title}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800;900&display=swap" rel="stylesheet">
<script>var clickTag = "https://www.watsons.com.tr/"; /* Tüm tıklamalar buraya gider; reklam ağı kendi makrosunu buraya yazabilir */</script>
<!-- Boyutlar: ${size}${ad.mobile ? ' (aynı dosya, alan genişliğine göre yerleşim değiştirir)' : ''} -->`)
    .replace('{{SHARED_CSS}}', () => css)
    .replace('{{SHARED_JS}}', () => js)
    .replace('{{DATA}}', () => JSON.stringify({ ...d, vars: undefined }).replace(/</g, '\\u003c'))
    .replace(/\{\{(\w+)\}\}/g, (m, k) => (k in d.vars ? d.vars[k] : m));
  const left = html.match(/\{\{\w+\}\}/);
  if (left) throw new Error(`${ad.id}: tanımsız yer tutucu ${left[0]}`);
  const used = [...new Set([...html.matchAll(/img\/([\w.-]+\.(?:webp|png|jpg|svg))/g)].map((m) => m[1]))];
  const missing = used.filter((f) => !fs.existsSync(path.join(imgSrc, f)));
  if (missing.length) throw new Error(`${ad.id}: eksik görsel ${missing.join(', ')}`);

  const out = path.join(dist, ad.id);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(path.join(out, 'img'), { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  let bytes = Buffer.byteLength(html);
  for (const f of used) { fs.copyFileSync(path.join(imgSrc, f), path.join(out, 'img', f)); bytes += fs.statSync(path.join(imgSrc, f)).size; }
  const inline = html.replace(/img\/([\w.-]+\.(webp|png|jpg|svg))/g, (m, f, ext) => `data:${MIME[ext]};base64,${fs.readFileSync(path.join(imgSrc, f)).toString('base64')}`);
  fs.writeFileSync(path.join(dist, 'inline', `${ad.id}.html`), inline);
  let note = '';
  if (hasZip) {
    const z = path.join(dist, 'zip', `watsons-1111-${ad.id}.zip`);
    fs.rmSync(z, { force: true });
    execSync(`cd "${out}" && zip -q -r -X "${z}" . -x ".*"`);
    note = ` → zip ${(fs.statSync(z).size / 1024).toFixed(0)} KB`;
  }
  console.log(`✔ ${ad.id.padEnd(22)} ${String(used.length).padStart(2)} görsel, ${(bytes / 1024).toFixed(0).padStart(4)} KB${note}`);
}
