#!/usr/bin/env node
'use strict';
/**
 * Tek dosyalık sunum: coffy/release/index.html
 * Splash Digital "Çalışmalar" şablonu (ilacsizkasimonerileri.html ile aynı yapı): ajans logosu + başlık,
 * her çalışma için numara / başlık / etiketler / "Tekrar oynat", tarayıcı penceresinde 970x250 ve
 * telefon çerçevesinde 320x480. Çalışmalar dosyanın içine gömülüdür (srcdoc).
 *
 * Kullanım: node coffy/build.js && node coffy/tools/present.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const concepts = [...require('../src/concepts-mobile'), ...require('../src/concepts-wide')].sort((a, b) => a.no.localeCompare(b.no));

const root = path.join(__dirname, '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const SPLASH = 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'assets', 'splash-digital.png')).toString('base64');

// Etiketler (şablondaki "Mobil uyarlamalı", "3B" gibi)
const TAGS = {
  '01': ['Video', 'Dinamik senaryo'], '02': ['Video', 'Oyun içi ödüllü'], '03': ['Video', 'Kazı kazan'],
  '04': ['Video', 'Kaydır'], '05': ['Video', 'Mini oyun'], '06': ['Video', 'Lokasyon'],
  '07': ['Video', 'Kişiselleştirilmiş'], '08': ['Video', 'Kaydırıcı'], '09': ['Video', 'Senaryo seçimi'], '10': ['Video', 'Lokasyon'],
};

const rows = concepts.map((c) => {
  const doc = attr(fs.readFileSync(path.join(root, 'dist', `${c.no}-${c.slug}`, 'index.html'), 'utf8'));
  const title = c.name.replace(/\s*\(.*\)$/, '');
  const tags = ['Mobil uyarlamalı', ...(TAGS[c.no] || [])].map((t) => `<span class="tag">${esc(t)}</span>`).join('');
  return `<section class="row wide has-m">
  <div class="lb"><span class="no">${c.no}</span><h2>${esc(title)}</h2>${tags}<button class="re" onclick="replay(this.closest('section'))"><span>↻</span> Tekrar oynat</button></div>
  <div class="stage"><div class="browser"><div class="bar"><i></i><i></i><i></i></div><div class="vp" style="width:970px;height:250px"><iframe loading="lazy" title="${esc(title)}" width="970" height="250" srcdoc="${doc}"></iframe></div></div></div>
  <div class="stage m"><div class="phone"><div class="notch"></div><div class="vp" style="width:320px;height:480px"><iframe loading="lazy" title="${esc(title)} – mobil" width="320" height="480" srcdoc="${doc}"></iframe></div></div></div>
</section>`;
}).join('\n');

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Splash Digital – Çalışmalar</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,600;1,9..144,500&amp;family=Manrope:wght@500;700;800&amp;display=swap" rel="stylesheet">
<style>
:root { --bg: #070b1d; --line: rgba(255, 255, 255, .08); --blue: #1a82d6; --txt: #e9eefc; --mut: #8d97b8; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
body { background: var(--bg); color: var(--txt); font-family: Manrope, Arial, sans-serif; -webkit-font-smoothing: antialiased; overflow-x: hidden; }
body::before { content: ''; position: fixed; inset: 0; pointer-events: none; background: radial-gradient(60% 40% at 50% -5%, rgba(26, 130, 214, .28), transparent 70%), radial-gradient(40% 30% at 100% 60%, rgba(26, 130, 214, .08), transparent 70%); }
header { position: relative; min-height: 86vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 60px 20px; }
header img { width: min(420px, 78vw); filter: drop-shadow(0 10px 40px rgba(26, 130, 214, .35)); opacity: 0; transform: translateY(14px); animation: in 1s .1s cubic-bezier(.22, .8, .2, 1) forwards; }
header h1 { font-family: Fraunces, Georgia, serif; font-weight: 600; font-size: clamp(26px, 4.4vw, 52px); line-height: 1.1; margin-top: 34px; letter-spacing: -.01em; opacity: 0; transform: translateY(14px); animation: in 1s .35s cubic-bezier(.22, .8, .2, 1) forwards; }
header h1 em { font-style: italic; font-weight: 500; color: var(--blue); }
header .down { position: absolute; bottom: 28px; left: 50%; width: 22px; height: 36px; margin-left: -11px; border: 2px solid rgba(255, 255, 255, .35); border-radius: 12px; opacity: 0; animation: in 1s .9s forwards; }
header .down::after { content: ''; position: absolute; left: 50%; top: 7px; width: 4px; height: 8px; margin-left: -2px; border-radius: 2px; background: #fff; animation: sc 1.6s infinite; }
@keyframes in { to { opacity: 1; transform: none; } }
@keyframes sc { 0% { opacity: 0; transform: translateY(0); } 40% { opacity: 1; } 100% { opacity: 0; transform: translateY(10px); } }
main { position: relative; max-width: 1180px; margin: 0 auto; padding: 0 24px 120px; }
.row { display: flex; flex-direction: column; gap: 26px; padding: 64px 0; border-top: 1px solid var(--line); opacity: 0; transform: translateY(30px); transition: opacity .9s cubic-bezier(.22, .8, .2, 1), transform .9s cubic-bezier(.22, .8, .2, 1); }
.row.seen { opacity: 1; transform: none; }
.lb { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
.lb .no { display: block; font-family: Fraunces, Georgia, serif; font-size: 56px; line-height: .9; color: transparent; -webkit-text-stroke: 1px rgba(26, 130, 214, .7); }
.lb h2 { font-size: 15px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; }
.lb .tag { font-size: 11px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; color: var(--mut); border: 1px solid var(--line); border-radius: 99px; padding: 5px 10px; }
.lb .re { margin-left: auto; display: inline-flex; align-items: center; gap: 8px; height: 38px; padding: 0 16px 0 14px; border-radius: 999px; border: 1px solid rgba(255, 255, 255, .28); background: rgba(255, 255, 255, .04); color: var(--txt); font: inherit; font-size: 13px; font-weight: 800; letter-spacing: .02em; cursor: pointer; transition: background .2s, border-color .2s; }
.lb .re span { font-size: 16px; line-height: 1; transition: transform .5s cubic-bezier(.22, .8, .2, 1); }
.lb .re:hover span, .lb .re.spin span { transform: rotate(-360deg); }
.lb .re:hover { background: var(--blue); border-color: var(--blue); }
.stage { display: flex; justify-content: center; align-items: flex-start; }
.stage > * { flex: none; }
iframe { border: 0; display: block; }
.vp { overflow: hidden; background: #000; }
/* Tarayıcı penceresi (masthead) */
.browser { border-radius: 12px; overflow: hidden; background: #151b33; box-shadow: 0 30px 80px rgba(0, 0, 0, .55), 0 0 0 1px rgba(255, 255, 255, .07); transform-origin: left top; }
.browser .bar { height: 30px; display: flex; align-items: center; gap: 6px; padding: 0 12px; background: #1c2342; }
.browser .bar i { width: 10px; height: 10px; border-radius: 50%; background: rgba(255, 255, 255, .18); }
/* Telefon (mobil) */
.phone { position: relative; padding: 44px 12px 44px; border-radius: 44px; background: linear-gradient(160deg, #20294d, #0c1129); box-shadow: 0 30px 80px rgba(0, 0, 0, .6), inset 0 0 0 2px rgba(255, 255, 255, .08), 0 0 0 1px rgba(255, 255, 255, .06); }
.phone .notch { position: absolute; left: 50%; top: 16px; width: 90px; height: 14px; margin-left: -45px; border-radius: 10px; background: #070b1d; }
.phone .vp { border-radius: 10px; }
.stage.m { margin-top: 10px; }
footer { text-align: center; padding: 40px 20px 70px; border-top: 1px solid var(--line); }
footer img { width: 170px; opacity: .85; }
.wide .stage { justify-content: flex-start; }
.wide .stage.m { justify-content: center; }
@media (min-width: 1031px) { .wide .stage { justify-content: center; } }
@media (max-width: 760px) { .row { padding: 44px 0; } .lb .no { font-size: 42px; } }

</style>
</head>
<body>
<header>
  <img src="${SPLASH}" alt="Splash Digital">
  <h1>Bu Çalışmalar <em>Splash Digital</em>'e Aittir.</h1>
  <div class="down"></div>
</header>
<main>
${rows}
</main>
<footer><img src="${SPLASH}" alt="Splash Digital"></footer>
<script>
var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('seen'); io.unobserve(e.target); } }); }, { threshold: .15 });
document.querySelectorAll('.row').forEach(function (r) { io.observe(r); });
// Tekrar oynat: çalışmayı (ve varsa mobil halini) baştan yükler
function replay(row) {
  var b = row.querySelector('.re');
  row.querySelectorAll('iframe').forEach(function (f) { f.srcdoc = f.getAttribute('srcdoc'); });
  b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin');
  setTimeout(function () { b.classList.remove('spin'); }, 600);
}
// Çalışma ekrana her geldiğinde (yarısı görünür olduğunda) kendiliğinden baştan oynar
var vis = new IntersectionObserver(function (es) {
  es.forEach(function (e) {
    var row = e.target;
    if (e.intersectionRatio >= .5 && !row._on) { row._on = true; replay(row); }
    else if (e.intersectionRatio < .1) row._on = false;
  });
}, { threshold: [0, .1, .5] });
document.querySelectorAll('.row').forEach(function (r) { vis.observe(r); });
// Dar ekranda masthead penceresi ve telefon çerçevesi sahneye sığacak şekilde ölçeklenir
function fit() {
  document.querySelectorAll('.stage').forEach(function (st) {
    var el = st.firstElementChild; el.style.transform = ''; st.style.height = '';
    var w = el.offsetWidth, h = el.offsetHeight, k = Math.min(1, st.clientWidth / w);
    el.style.transformOrigin = k < 1 ? 'left top' : ''; el.style.transform = k < 1 ? 'scale(' + k + ')' : '';
    st.style.height = k < 1 ? (h * k) + 'px' : '';
  });
}
fit(); addEventListener('resize', fit);
</script>
</body>
</html>
`;
const rel = path.join(root, 'release');
fs.rmSync(rel, { recursive: true, force: true });
fs.mkdirSync(rel, { recursive: true });
fs.writeFileSync(path.join(rel, 'index.html'), html);

// Teslim zip'i: sunum + yüklenecek dosyalar + plan
const stage = path.join(rel, 'stage');
fs.mkdirSync(stage, { recursive: true });
fs.cpSync(path.join(root, 'dist'), path.join(stage, 'dist'), { recursive: true });
for (const f of ['README.md', 'LANSMAN-PLANI.md']) fs.copyFileSync(path.join(root, f), path.join(stage, f));
fs.copyFileSync(path.join(rel, 'index.html'), path.join(stage, 'index.html'));
execSync(`cd "${stage}" && zip -q -r -X "${path.join(rel, 'cok-da-coffy-calismalar.zip')}" . -x ".*"`);
fs.rmSync(stage, { recursive: true, force: true });
console.log(`✔ coffy/release/index.html (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB) · coffy/release/cok-da-coffy-calismalar.zip`);
