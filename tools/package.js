#!/usr/bin/env node
'use strict';
/**
 * Teslim paketi üretir:
 *  - release/index.html : TEK DOSYA sunum; üç banner içine gömülüdür (srcdoc), klasör/zip gerektirmez,
 *                         her bannerın kendi index.html'i sayfadan indirilebilir
 *  - release/ilacsizyasam-banner-seti.zip
 *  - index.html          : sunum sayfası (zip kökünden açıldığında çalışır)
 *  - dist/<boyut>/       : bannerlar (her biri kendi index.html'i ile bağımsız çalışır)
 *  - dist/zip/           : reklam ağlarına yüklenecek tekil zipler
 *  - preview/screens/    : ekran görüntüleri
 *  - README.md
 * Kullanım: node tools/package.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.join(__dirname, '..');
const stage = path.join(root, 'release', 'stage');
const out = path.join(root, 'release', 'ilacsizyasam-banner-seti.zip');
fs.rmSync(path.join(root, 'release'), { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

const copy = (src, dst) => fs.cpSync(path.join(root, src), path.join(stage, dst), { recursive: true });
copy('dist', 'dist');
copy('preview/screens', 'preview/screens');
copy('README.md', 'README.md');

// Sunum sayfası: ../dist → dist
let html = fs.readFileSync(path.join(root, 'preview', 'index.html'), 'utf8').replace(/\.\.\/dist\//g, 'dist/');
fs.writeFileSync(path.join(stage, 'index.html'), html);

execSync(`cd "${stage}" && zip -q -r -X "${out}" . -x ".*"`);
fs.rmSync(stage, { recursive: true, force: true });
const kb = (fs.statSync(out).size / 1024).toFixed(0);
console.log(`✔ ${path.relative(root, out)}  (${kb} KB)`);

// ---- Tek dosyalık sunum: bannerlar srcdoc olarak gömülür ----
const escAttr = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
let single = fs.readFileSync(path.join(root, 'preview', 'index.html'), 'utf8');
for (const key of ['970x250', '300x250', '300x600']) {
  const banner = escAttr(fs.readFileSync(path.join(root, 'dist', key, 'index.html'), 'utf8'));
  single = single.split(`data-src="../dist/${key}/index.html"`).join(`srcdoc="${banner}"`); // önce data-src (src'yi içerir)
  single = single.split(`src="../dist/${key}/index.html"`).join(`srcdoc="${banner}" data-key="${key}"`);
  single = single.replace(
    `<a href="../dist/${key}/index.html" target="_blank">Yeni sekmede aç</a><a href="../dist/zip/ilacsizyasam-${key}.zip">Zip indir</a>`,
    `<a href="#" class="dl" data-key="${key}">Bu bannerı indir (index.html)</a>`);
}
single = single
  .replace('<title>İlaçsız Yaşam – Gıda Takviyesi Banner Serisi</title>', '<title>İlaçsız Yaşam – Gıda Takviyesi Banner Serisi (tek dosya)</title>')
  .replace("frames().forEach(function(f){if(f.src)f.contentWindow.postMessage('restart','*')})", "frames().forEach(function(f){if(f.srcdoc){f.srcdoc=f.srcdoc}else if(f.src)f.contentWindow.postMessage('restart','*')})")
  .replace("frames().forEach(function(f){if(f.src)f.contentWindow.postMessage(paused?'pause':'play','*')})", "frames().forEach(function(f){f.contentWindow.postMessage(paused?'pause':'play','*')})")
  .replace('Bu sayfa sunum amaçlı bir önizlemedir. Reklam ağlarına yüklenecek dosyalar <code>dist/</code> klasöründedir.', 'Bu sayfa tek dosyalık bir sunumdur; üç banner içine gömülüdür. Her bannerın reklam ağına yüklenecek index.html dosyası kart başlığındaki bağlantıdan indirilir.');
// İndirme düğmesi kodu ana sayfanın SON script kapanışına eklenir (ilk eşleşme gömülü bannerın içinde kalır ve srcdoc'u bozar)
const tail = single.lastIndexOf('</script>\n</body>');
single = single.slice(0, tail) + `
document.addEventListener('click',function(e){
  var a=e.target.closest('a.dl');if(!a)return;e.preventDefault();
  var f=document.querySelector('iframe[data-key="'+a.dataset.key+'"]');if(!f)return;
  var u=URL.createObjectURL(new Blob([f.srcdoc],{type:'text/html;charset=utf-8'}));
  var l=document.createElement('a');l.href=u;l.download='ilacsizyasam-'+a.dataset.key+'-index.html';document.body.appendChild(l);l.click();l.remove();
  setTimeout(function(){URL.revokeObjectURL(u)},2000);
});
` + single.slice(tail);
const singleOut = path.join(root, 'release', 'index.html');
fs.writeFileSync(singleOut, single);
console.log(`✔ ${path.relative(root, singleOut)}  (${(fs.statSync(singleOut).size / 1024).toFixed(0)} KB, tek dosya, 3 banner gömülü)`);
