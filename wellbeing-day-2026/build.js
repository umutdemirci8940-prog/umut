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

// Ajans logosu: assets/splash-digital-logo.(svg|png|webp) varsa o, yoksa yer tutucu
const logoFile = ['svg', 'png', 'webp'].map((e) => `assets/splash-digital-logo.${e}`).find((f) => fs.existsSync(path.join(__dirname, f)))
  || 'assets/splash-digital-logo.placeholder.svg';

const rows = built.map((b, i) => `
  <section class="work">
    <header class="wh"><span class="no">${String(i + 1).padStart(2, '0')}</span><h2>Çalışma ${i + 1}</h2></header>
    <div class="frames">${Object.entries(SIZES).map(([k, s]) => `
      <figure class="frame" style="--w:${s.w};--h:${s.h}">
        <div class="box"><iframe width="${s.w}" height="${s.h}" scrolling="no" title="Çalışma ${i + 1} – ${k}" data-srcdoc="${escAttr(b[k])}"></iframe></div>
        <figcaption>${k.replace('x', ' × ')}<button type="button" class="re" aria-label="Yeniden oynat" title="Yeniden oynat">↻</button></figcaption>
      </figure>`).join('')}
    </div>
  </section>`).join('');

fs.writeFileSync(path.join(__dirname, 'sunum.html'), `<!DOCTYPE html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Splash Digital</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&amp;family=Montserrat:wght@300;500;700&amp;display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0c0c0f;color:#f4efe9;font-family:Montserrat,system-ui,sans-serif;-webkit-font-smoothing:antialiased;
  background-image:radial-gradient(900px 500px at 50% -120px,rgba(255,170,90,.16),transparent 70%),radial-gradient(700px 600px at 100% 40%,rgba(255,60,120,.06),transparent 70%)}
.top{text-align:center;padding:64px 16px 40px}
.top img{height:58px;width:auto;max-width:80vw}
.top h1{font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:clamp(26px,4vw,44px);letter-spacing:.01em;margin-top:26px}
.top .rule{width:120px;height:1px;margin:26px auto 0;background:linear-gradient(90deg,transparent,#c9a46c,transparent)}
main{max-width:1420px;margin:0 auto;padding:0 16px 80px}
.work{padding:48px 0;border-top:1px solid rgba(255,255,255,.08)}
.work:first-child{border-top:0}
.wh{display:flex;align-items:baseline;gap:16px;margin-bottom:26px}
.no{font-family:'Cormorant Garamond',Georgia,serif;font-size:56px;line-height:.8;color:#c9a46c;font-weight:500}
.wh h2{font-weight:300;font-size:22px;letter-spacing:.24em;text-transform:uppercase}
.frames{display:flex;flex-wrap:wrap;gap:36px;align-items:flex-start}
.frame{width:min(calc(var(--w)*1px),100%)}
.box{position:relative;width:100%;aspect-ratio:var(--w)/var(--h);overflow:hidden;border-radius:4px;box-shadow:0 24px 60px -24px rgba(0,0,0,.9),0 0 0 1px rgba(255,255,255,.06)}
.box iframe{position:absolute;left:0;top:0;border:0;transform-origin:0 0;background:#f1dcc6}
figcaption{display:flex;align-items:center;gap:10px;margin-top:12px;font-size:11px;letter-spacing:.2em;color:rgba(244,239,233,.55)}
.re{font:inherit;font-size:14px;letter-spacing:0;color:rgba(244,239,233,.7);background:none;border:1px solid rgba(255,255,255,.18);border-radius:50%;width:26px;height:26px;cursor:pointer;transition:all .2s}
.re:hover{color:#fff;border-color:#c9a46c}
</style></head>
<body>
<header class="top">
  <img src="${uri(logoFile)}" alt="Splash Digital">
  <h1>Bu Çalışmalar Splash Digital'e Aittir.</h1>
  <div class="rule"></div>
</header>
<main>${rows}
</main>
<script>
(function(){
  var frames=[].slice.call(document.querySelectorAll('.frame'));
  function fit(){frames.forEach(function(f){var box=f.querySelector('.box'),ifr=f.querySelector('iframe');ifr.style.transform='scale('+(box.clientWidth/ifr.width)+')';});}
  function play(ifr){ifr.srcdoc=ifr.getAttribute('data-srcdoc');}
  frames.forEach(function(f){var ifr=f.querySelector('iframe');f.querySelector('.re').addEventListener('click',function(){play(ifr);});});
  // Her banner görünür olduğunda oynamaya başlar
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){play(e.target);io.unobserve(e.target);}});},{threshold:.35});
    frames.forEach(function(f){io.observe(f.querySelector('iframe'));});
  }else frames.forEach(function(f){play(f.querySelector('iframe'));});
  window.addEventListener('resize',fit);fit();
})();
</script>
</body></html>
`);
console.log(`✔ sunum.html  ${(fs.statSync(path.join(__dirname, 'sunum.html')).size / 1024).toFixed(0)} KB (tek dosya) – logo: ${logoFile}`);
