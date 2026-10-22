#!/usr/bin/env node
'use strict';
/**
 * Tüm çalışmaları üretir:
 *   dist/c<N>-<konsept>/<boyut>/index.html   – tek dosya, görseller base64 gömülü
 *   dist/zip/c<N>-<konsept>-<boyut>.zip      – reklam ağlarına yüklemeye hazır
 *   sunum.html                                – tüm çalışmalar tek sayfada (bannerlar gömülü, tek başına açılır)
 * Kullanım: node build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('./src/data');
const { SIZES } = require('./src/common');

const CONCEPTS = [
  require('./src/concepts/c1-isik-testi'),
  require('./src/concepts/c2-nefes'),
  require('./src/concepts/c3-kazi'),
  require('./src/concepts/c4-isigi-ac'),
];

const dist = path.join(__dirname, 'dist');
const zipDir = path.join(dist, 'zip');
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(zipDir, { recursive: true });
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', svg: 'image/svg+xml' };
const uri = (rel) => `data:${MIME[path.extname(rel).slice(1)]};base64,${fs.readFileSync(path.join(__dirname, rel)).toString('base64')}`;
const escAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }

const built = CONCEPTS.map((c, i) => {
  const slug = `c${i + 1}-${c.key}`;
  const out = {};
  for (const size of Object.keys(SIZES)) {
    const img = { portrait: uri(data.images.portrait), logo: uri(data.images.logo), bg: uri(data.images.bg[size]) };
    const html = c.render(size, data, img);
    out[size] = html;
    const dir = path.join(dist, slug, size);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    if (hasZip) execSync(`zip -q -j "${path.join(zipDir, `${slug}-${size}.zip`)}" "${path.join(dir, 'index.html')}"`);
    const kb = Buffer.byteLength(html) / 1024;
    console.log(`✔ Çalışma ${i + 1}  ${c.name.padEnd(36)} ${size.padEnd(8)} ${kb.toFixed(1).padStart(6)} KB${kb > 150 ? '  ⚠ 150 KB üstü' : ''}`);
  }
  return out;
});

// Splash Digital sunumu (ajansın diğer sunumlarıyla aynı tasarım): her çalışma bir satır,
// masthead tarayıcı penceresinde, mobil telefon çerçevesinde.
const logo = uri('assets/brand/splash-logo.png');
const rows = built.map((b, i) => {
  const frames = Object.entries(SIZES).map(([k, s]) => {
    const ifr = `<div class="vp" style="width:${s.w}px;height:${s.h}px"><iframe loading="lazy" title="Çalışma ${i + 1} – ${k}" width="${s.w}" height="${s.h}" scrolling="no" srcdoc="${escAttr(b[k])}"></iframe></div>`;
    return s.w > 500
      ? `<div class="browser"><div class="bar"><i></i><i></i><i></i></div>${ifr}</div>`
      : `<div class="phone"><div class="notch"></div>${ifr}</div>`;
  }).join('');
  return `<section class="row">
  <div class="lb"><span class="no">${String(i + 1).padStart(2, '0')}</span><h2>Çalışma ${i + 1}</h2><button class="re" onclick="replay(this.closest('section'))"><span>↻</span> Tekrar oynat</button></div>
  <div class="stage"><div class="pair">${frames}</div></div>
</section>`;
}).join('\n');

fs.writeFileSync(path.join(__dirname, 'sunum.html'), `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Splash Digital – Çalışmalar</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&amp;family=Manrope:wght@500;700;800&amp;display=swap" rel="stylesheet">
<style>
:root{--bg:#070b1d;--line:rgba(255,255,255,.08);--blue:#1a82d6;--txt:#e9eefc;--mut:#8d97b8}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{background:var(--bg);color:var(--txt);font-family:Manrope,Arial,sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;pointer-events:none;background:radial-gradient(60% 40% at 50% -5%,rgba(26,130,214,.28),transparent 70%),radial-gradient(40% 30% at 100% 60%,rgba(26,130,214,.08),transparent 70%)}
header{position:relative;min-height:86vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:60px 20px}
header img{width:min(420px,78vw);filter:drop-shadow(0 10px 40px rgba(26,130,214,.35));opacity:0;transform:translateY(14px);animation:in 1s .1s cubic-bezier(.22,.8,.2,1) forwards}
header h1{font-family:Fraunces,Georgia,serif;font-weight:600;font-size:clamp(26px,4.4vw,52px);line-height:1.1;margin-top:34px;letter-spacing:-.01em;opacity:0;transform:translateY(14px);animation:in 1s .35s cubic-bezier(.22,.8,.2,1) forwards}
header h1 em{font-style:italic;font-weight:500;color:var(--blue)}
header .down{position:absolute;bottom:28px;left:50%;width:22px;height:36px;margin-left:-11px;border:2px solid rgba(255,255,255,.35);border-radius:12px;opacity:0;animation:in 1s .9s forwards}
header .down::after{content:'';position:absolute;left:50%;top:7px;width:4px;height:8px;margin-left:-2px;border-radius:2px;background:#fff;animation:sc 1.6s infinite}
@keyframes in{to{opacity:1;transform:none}}
@keyframes sc{0%{opacity:0;transform:translateY(0)}40%{opacity:1}100%{opacity:0;transform:translateY(10px)}}
main{position:relative;max-width:1460px;margin:0 auto;padding:0 24px 120px}
.row{display:flex;flex-direction:column;gap:26px;padding:64px 0;border-top:1px solid var(--line);opacity:0;transform:translateY(30px);transition:opacity .9s cubic-bezier(.22,.8,.2,1),transform .9s cubic-bezier(.22,.8,.2,1)}
.row.seen{opacity:1;transform:none}
.lb{display:flex;align-items:center;gap:16px}
.lb .no{display:block;font-family:Fraunces,Georgia,serif;font-size:56px;line-height:.9;color:transparent;-webkit-text-stroke:1px rgba(26,130,214,.7)}
.lb h2{font-size:15px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.lb .re{margin-left:auto;display:inline-flex;align-items:center;gap:8px;height:38px;padding:0 16px 0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.04);color:var(--txt);font:inherit;font-size:13px;font-weight:800;letter-spacing:.02em;cursor:pointer;transition:background .2s,border-color .2s}
.lb .re span{font-size:16px;line-height:1;transition:transform .5s cubic-bezier(.22,.8,.2,1)}
.lb .re:hover span,.lb .re.spin span{transform:rotate(-360deg)}
.lb .re:hover{background:var(--blue);border-color:var(--blue)}
.stage{position:relative}
.pair{display:flex;align-items:center;justify-content:center;gap:44px;transform-origin:left top}
.pair.col{flex-direction:column;gap:30px;align-items:flex-start}
.pair>*{flex:none}
iframe{border:0;display:block}
.vp{overflow:hidden;background:#000}
/* Tarayıcı penceresi (masthead) */
.browser{border-radius:12px;overflow:hidden;background:#151b33;box-shadow:0 30px 80px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.07);transform-origin:left top}
.browser .bar{height:30px;display:flex;align-items:center;gap:6px;padding:0 12px;background:#1c2342}
.browser .bar i{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.18)}
/* Telefon (mobil) */
.phone{position:relative;padding:44px 12px 44px;border-radius:44px;background:linear-gradient(160deg,#20294d,#0c1129);box-shadow:0 30px 80px rgba(0,0,0,.6),inset 0 0 0 2px rgba(255,255,255,.08),0 0 0 1px rgba(255,255,255,.06);transform-origin:left top}
.phone .notch{position:absolute;left:50%;top:16px;width:90px;height:14px;margin-left:-45px;border-radius:10px;background:#070b1d}
.phone .vp{border-radius:10px}
footer{text-align:center;padding:40px 20px 70px;border-top:1px solid var(--line)}
footer img{width:170px;opacity:.85}
@media (max-width:760px){.row{padding:44px 0}.lb .no{font-size:42px}}
</style>
</head>
<body>
<header>
  <img src="${logo}" alt="Splash Digital">
  <h1>Bu Çalışmalar <em>Splash Digital</em>'e Aittir.</h1>
  <div class="down"></div>
</header>
<main>
${rows}
</main>
<footer><img src="${logo}" alt="Splash Digital"></footer>
<script>
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('seen');io.unobserve(e.target);}});},{threshold:.15});
document.querySelectorAll('.row').forEach(function(r){io.observe(r);});
// Tekrar oynat: satırdaki iki banner baştan yüklenir
function replay(row){
  row.querySelectorAll('iframe').forEach(function(f){f.srcdoc=f.getAttribute('srcdoc');});
  var b=row.querySelector('.re');b.classList.remove('spin');void b.offsetWidth;b.classList.add('spin');
  setTimeout(function(){b.classList.remove('spin');},600);
}
// Çalışma ekrana her geldiğinde kendiliğinden baştan oynar
var vis=new IntersectionObserver(function(es){es.forEach(function(e){var row=e.target;
  if(e.intersectionRatio>=.5&&!row._on){row._on=true;replay(row);}else if(e.intersectionRatio<.1)row._on=false;});},{threshold:[0,.1,.5]});
document.querySelectorAll('.row').forEach(function(r){vis.observe(r);});
// Geniş ekranda pencere + telefon yan yana; sığmazsa alt alta ve her biri ekrana göre ölçeklenir
function fit(){
  document.querySelectorAll('.stage').forEach(function(st){
    var pair=st.firstElementChild,kids=[].slice.call(pair.children),cw=st.clientWidth;
    pair.style.transform='';kids.forEach(function(k){k.style.transform='';k.style.marginBottom='';k.style.marginRight='';});
    pair.classList.remove('col');st.style.height='';
    var w=pair.scrollWidth,h=pair.offsetHeight;
    if(cw>=w*.78){var k=Math.min(1,cw/w);pair.style.transform=k<1?'scale('+k+')':'';st.style.height=k<1?(h*k)+'px':'';return;}
    pair.classList.add('col');
    kids.forEach(function(el){var ew=el.offsetWidth,eh=el.offsetHeight,s=Math.min(1,cw/ew);
      if(s<1){el.style.transform='scale('+s+')';el.style.marginBottom=(eh*s-eh)+'px';el.style.marginRight=(ew*s-ew)+'px';}});
  });
}
fit();addEventListener('resize',fit);
</script>
</body>
</html>
`);
console.log(`✔ sunum.html  ${(fs.statSync(path.join(__dirname, 'sunum.html')).size / 1024).toFixed(0)} KB (tek dosya)`);
