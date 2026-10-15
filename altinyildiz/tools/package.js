#!/usr/bin/env node
'use strict';
/**
 * Tek dosyalık sunum sayfası üretir: preview/index.html
 * İki banner srcdoc ile gömülüdür; klasör/zip gerektirmeden açılır ve her bannerın index.html'i indirilebilir.
 * Kullanım: node altinyildiz/tools/package.js [--artifact]  (önce node altinyildiz/build.js)
 *   --artifact: claude.ai Artifact olarak yayınlanacak sürüm (indirme bağlantısız, iskeletsiz) → preview/artifact.html
 */
const ART = process.argv.includes('--artifact');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const esc = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const B = [
  { id: 'vitrin', no: 'A', name: 'Askılı Vitrin', tag: 'Civil 1 uyarlaması',
    desc: 'Kategori çipleri, askıda sallanan ürün kartları (fare hareketiyle sallanır), sayan fiyat ve üstü çizili eski fiyat. Yıldız maskot tıklanınca döner, yıldız saçar ve sezonun yıldız parçasına atlar.' },
  { id: 'lookbook', no: 'B', name: 'Pop-up Lookbook', tag: 'Civil 6 uyarlaması',
    desc: 'Lacivert kumaş ciltli lookbook açılır; her sayfada sezon rengi, kumaş kartelası harfleri, pop-up fotoğraf ve fiyat etiketi. Küçük resimler ürünü değiştirir, sayfa çevrildikçe altın yıldız konfetisi.' },
];
const cards = B.map((b) => {
  const html = fs.readFileSync(path.join(ROOT, 'dist', b.id, 'index.html'), 'utf8');
  const kb = (Buffer.byteLength(html) / 1024).toFixed(0);
  return `<section class="card">
  <header><span class="no">${b.no}</span><div><h2>${b.name}</h2><p class="tag">${b.tag} · 970×250 · ${kb} KB</p></div>
  <div class="act"><button data-r="${b.id}">↻ Yeniden oynat</button>${ART ? '' : `<a download="altinyildiz-${b.id}-970x250.html" href="data:text/html;base64,${Buffer.from(html).toString('base64')}">↓ HTML</a>`}</div></header>
  <div class="frame"><div class="scale"><iframe id="f-${b.id}" title="${b.name}" width="970" height="250" scrolling="no" srcdoc="${esc(html)}"></iframe></div></div>
  <p class="desc">${b.desc}</p>
</section>`;
}).join('\n');

const head = ART ? `<title>Altınyıldız Masthead Seti</title>
<meta name="claude:viewport-fit-sides" content="cover">` : `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Altınyıldız Masthead Seti</title>`;
const page = `${head}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,600&family=Urbanist:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
:root{--bg:#f3efe7;--ink:#14213d;--mute:#6c6f78;--line:#ddd3c3;--card:#fff;--gold:#a07c3a}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0d1324;--ink:#f1ece2;--mute:#a3a7b3;--line:#263252;--card:#141c33;--gold:#e7cf98;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0d1324;--ink:#f1ece2;--mute:#a3a7b3;--line:#263252;--card:#141c33;--gold:#e7cf98;color-scheme:dark}
*{box-sizing:border-box;margin:0}
body{background:var(--bg);color:var(--ink);font:400 15px/1.55 "Urbanist",system-ui,sans-serif;padding-block:40px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
h1{text-wrap:balance}
.act button:focus-visible{outline:2px solid var(--gold);outline-offset:2px}
main{max-width:1010px;margin:0 auto}
.k{font:600 11px/1 "Urbanist";letter-spacing:.3em;color:var(--gold);text-transform:uppercase}
h1{font:600 italic clamp(30px,5vw,46px)/1.05 "Cormorant Garamond",Georgia,serif;margin:10px 0 10px}
.lead{color:var(--mute);max-width:720px}
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:18px;margin-top:28px}
.card header{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:14px}
.no{font:600 italic 30px/1 "Cormorant Garamond",serif;color:var(--gold)}
h2{font:700 19px/1.2 "Urbanist"}
.tag{font-size:12.5px;color:var(--mute)}
.act{margin-left:auto;display:flex;gap:8px}
.act button,.act a{font:600 12.5px/1 "Urbanist";color:var(--ink);background:transparent;border:1px solid var(--line);border-radius:999px;padding:9px 14px;cursor:pointer;text-decoration:none}
.act button:hover,.act a:hover{border-color:var(--gold)}
.frame{position:relative;width:100%;overflow:hidden;border-radius:4px}
.scale{width:970px;height:250px;transform-origin:0 0}
iframe{display:block;border:0;width:970px;height:250px}
.desc{margin-top:12px;color:var(--mute);font-size:14px}
.notes{margin-top:32px;color:var(--mute);font-size:13.5px}
.notes li{margin:4px 0 4px 18px}
</style>${ART ? '' : '</head><body>'}<main>
<div class="k">Altınyıldız Classics · First Media Masthead</div>
<h1>Sonbahar / Kış 2026 interaktif masthead seti</h1>
<p class="lead">İki adet 970×250 interaktif çalışma. Ürün fotoğrafları, logo, fiyatlar ve ayrıcalıklar altinyildizclassics.com’dan alındı (15.10.2026). Bannerlarla oynayabilirsiniz; tıklama çıkışları yayında altinyildizclassics.com’a gider.</p>
${cards}
<ul class="notes">
<li>Her banner tek dosya (görseller gömülü), zip’i 95 KB’ın altında: Google Ads / CM360 / DV360 için hazır. clickTag ve kategori bazlı clickTag1–4 tanımlı.</li>
<li>Döngüsel animasyonlar 30 sn’de durur; kullanıcı etkileşimi sürdükçe oyun çalışmaya devam eder.</li>
</ul>
</main>
<script>
function fit(){document.querySelectorAll('.frame').forEach(function(f){var s=Math.min(1,f.clientWidth/970);var sc=f.firstElementChild;sc.style.transform='scale('+s+')';f.style.height=(250*s)+'px';});}
window.addEventListener('resize',fit);fit();
document.querySelectorAll('[data-r]').forEach(function(b){b.addEventListener('click',function(){var f=document.getElementById('f-'+b.dataset.r);var s=f.srcdoc;f.srcdoc='';setTimeout(function(){f.srcdoc=s;},30);});});
</script>
${ART ? '' : '</body></html>'}`;
fs.mkdirSync(path.join(ROOT, 'preview'), { recursive: true });
const outFile = path.join(ROOT, 'preview', ART ? 'artifact.html' : 'index.html');
fs.writeFileSync(outFile, page);
console.log('✔', path.relative(ROOT, outFile), (Buffer.byteLength(page) / 1024).toFixed(0) + ' KB');
