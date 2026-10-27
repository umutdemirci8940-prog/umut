#!/usr/bin/env node
'use strict';
/**
 * "Çok da Coffy" – 10 interaktif HTML5 banner + sunum sayfası üretir.
 *
 *   coffy/dist/<no>-<slug>-<boyut>/index.html   reklam ağına yüklenecek tek dosyalık bannerlar
 *   coffy/dist/zip/*.zip                         ağ başına yükleme paketleri
 *   coffy/preview/index.html                     sunum (plan + 10 kreatif, dist'e iframe ile bağlı)
 *   coffy/release/cok-da-coffy-sunum.html        tek dosyalık sunum (bannerlar gömülü)
 *   coffy/release/cok-da-coffy-banner-seti.zip   teslim paketi
 *
 * Kullanım: node coffy/build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('./src/config');
const { SIZES, FONTS, page, esc } = require('./src/shared');
const concepts = [...require('./src/concepts-mobile'), ...require('./src/concepts-wide')];

const root = __dirname;
const dist = path.join(root, 'dist');
const LIMIT_KB = 150;

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(path.join(dist, 'zip'), { recursive: true });

const dirOf = (c) => `${c.no}-${c.slug}-${c.size}`;
const built = [];
for (const c of concepts) {
  let html = page(c, config);
  for (const [k, v] of Object.entries(c.inject || {})) html = html.split(k).join(v);
  const dir = path.join(dist, dirOf(c));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const zip = path.join(dist, 'zip', `coffy-${dirOf(c)}.zip`);
  execSync(`cd "${dir}" && zip -q -X "${zip}" index.html`);
  const kb = Buffer.byteLength(html) / 1024;
  built.push({ c, dir: dirOf(c), kb, html });
  console.log(`${kb > LIMIT_KB ? '⚠' : '✔'} ${dirOf(c).padEnd(36)} ${kb.toFixed(1)} KB`);
}

/* ---------- mini markdown → html (plan dokümanı için) ---------- */
function md(src) {
  const inline = (t) => esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  const out = []; const lines = src.split('\n'); let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,4})\s+(.*)/))) { const n = m[1].length; const id = m[2].toLowerCase().replace(/[^a-z0-9çğıöşü]+/g, '-'); out.push(`<h${n} id="${id}">${inline(m[2])}</h${n}>`); i++; continue; }
    if (l.startsWith('|')) {
      const rows = []; while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++]);
      const cells = (r) => r.replace(/^\||\|$/g, '').split('|').map((x) => x.trim());
      const head = cells(rows[0]); const body = rows.slice(2).map(cells);
      out.push(`<div class="tbl"><table><thead><tr>${head.map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((d) => `<td>${inline(d)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      continue;
    }
    if (/^\s*[-*]\s/.test(l)) {
      const items = []; while (i < lines.length && /^\s*[-*]\s/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s/, ''));
      out.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ul>`); continue;
    }
    if (/^\d+\.\s/.test(l)) {
      const items = []; while (i < lines.length && /^\d+\.\s/.test(lines[i])) items.push(lines[i++].replace(/^\d+\.\s/, ''));
      out.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join('')}</ol>`); continue;
    }
    if (l.startsWith('>')) { const q = []; while (i < lines.length && lines[i].startsWith('>')) q.push(lines[i++].replace(/^>\s?/, '')); out.push(`<blockquote>${inline(q.join(' '))}</blockquote>`); continue; }
    const p = []; while (i < lines.length && lines[i].trim() && !/^(#|\||\s*[-*]\s|\d+\.\s|>)/.test(lines[i])) p.push(lines[i++]);
    out.push(`<p>${inline(p.join(' '))}</p>`);
  }
  return out.join('\n');
}

/* ---------- sunum sayfası ---------- */
const planMd = fs.readFileSync(path.join(root, 'LANSMAN-PLANI.md'), 'utf8').replace(/^# .*\n/, '');
const mobile = built.filter((b) => b.c.size === '320x480');
const wide = built.filter((b) => b.c.size === '970x250');

function card(b) {
  const s = SIZES[b.c.size];
  return `<article class="cr ${s.kind}" id="k${b.c.no}">
  <div class="frame" style="width:${s.w}px;height:${s.h}px"><iframe title="${esc(b.c.name)}" width="${s.w}" height="${s.h}" src="../dist/${b.dir}/index.html" data-dir="${b.dir}" scrolling="no" loading="lazy"></iframe></div>
  <div class="meta">
    <div class="no">${b.c.no}<span>${b.c.size}</span></div>
    <h3>${esc(b.c.name)}</h3>
    <div class="tags"><span>${esc(b.c.phase)}</span><span>${(b.kb).toFixed(0)} KB</span></div>
    <p><b>Kurgu.</b> ${esc(b.c.mechanic)}</p>
    <p><b>Neden?</b> ${esc(b.c.why)}</p>
    <p class="ch"><b>Yayın.</b> ${esc(b.c.channel)}</p>
    <div class="acts"><button class="rs" data-k="${b.c.no}">↻ Yeniden oynat</button><a href="../dist/${b.dir}/index.html" target="_blank">Yeni sekmede aç</a><a href="../dist/zip/coffy-${b.dir}.zip">Zip</a></div>
    <div class="ev" data-ev="a${b.c.no}">Ölçüm olayları burada görünür…</div>
  </div>
</article>`;
}

const preview = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Çok da Coffy – Lansman Planı ve Kreatif Seti</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS.replace(/&/g, '&amp;')}" rel="stylesheet">
<style>
:root{--bg:#140b07;--panel:#1f130d;--line:rgba(255,255,255,.09);--text:#fbefdf;--muted:#c9b7a3;--acc:#ff5a2c;--acc2:#ffc53a}
*{box-sizing:border-box;margin:0;padding:0}
html{background:var(--bg);color:var(--text);font-family:Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased;scroll-behavior:smooth}
body{background:radial-gradient(900px 500px at 90% -10%,rgba(255,90,44,.22),transparent 60%),radial-gradient(700px 400px at 0% 10%,rgba(255,197,58,.1),transparent 60%),var(--bg);min-height:100vh}
a{color:var(--acc2)}
.wrap{max-width:1180px;margin:0 auto;padding:36px 20px 90px}
.hero{display:grid;gap:12px;margin-bottom:22px}
.brand{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;letter-spacing:-.05em}.brand i{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--acc);margin-left:3px}
h1{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:clamp(38px,6vw,68px);letter-spacing:-.04em;line-height:.92}
h1 em{font-style:normal;color:var(--acc2)}
.lead{color:var(--muted);font-size:16px;line-height:1.6;max-width:760px}
.chips{display:flex;flex-wrap:wrap;gap:8px}.chips span{border:1px solid var(--line);border-radius:99px;padding:6px 12px;font-size:12px;font-weight:700;color:var(--muted)}.chips b{color:var(--acc2)}
nav.tabs{position:sticky;top:0;z-index:30;display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:10px;margin:24px 0;border:1px solid var(--line);border-radius:14px;background:rgba(20,11,7,.88);backdrop-filter:blur(10px)}
nav.tabs a,nav.tabs button{appearance:none;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--text);font:inherit;font-weight:700;font-size:13px;padding:8px 12px;border-radius:10px;cursor:pointer;text-decoration:none}
nav.tabs .sp{flex:1}
nav.tabs select{font:inherit;font-size:13px;font-weight:700;background:#2a1a12;color:var(--text);border:1px solid var(--line);border-radius:10px;padding:8px}
section.plan{border:1px solid var(--line);border-radius:20px;background:var(--panel);padding:26px clamp(16px,3vw,34px)}
.plan h2{font-family:'Bricolage Grotesque',sans-serif;font-size:28px;letter-spacing:-.03em;margin:30px 0 12px;padding-top:6px}
.plan h2:first-child{margin-top:0}
.plan h3{font-size:17px;margin:20px 0 8px;color:var(--acc2)}
.plan h4{font-size:15px;margin:14px 0 6px}
.plan p,.plan li{font-size:14.5px;line-height:1.65;color:#eadccb}
.plan ul,.plan ol{padding-left:20px;display:grid;gap:4px;margin:6px 0 10px}
.plan b{color:#fff}
.plan p+p{margin-top:10px}
.plan code{font-size:12.5px;background:rgba(255,255,255,.08);padding:1px 6px;border-radius:6px}
.plan blockquote{border-left:3px solid var(--acc);padding:8px 14px;margin:12px 0;background:rgba(255,90,44,.08);border-radius:0 10px 10px 0;font-size:14.5px;line-height:1.6}
.tbl{overflow-x:auto;margin:10px 0 16px;border:1px solid var(--line);border-radius:12px}
table{border-collapse:collapse;width:100%;font-size:13px;min-width:640px}
th,td{text-align:left;padding:9px 11px;border-bottom:1px solid var(--line);vertical-align:top;line-height:1.5}
th{background:rgba(255,255,255,.05);font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
tr:last-child td{border-bottom:0}
h2.sec{font-family:'Bricolage Grotesque',sans-serif;font-size:34px;letter-spacing:-.03em;margin:46px 0 6px}
p.sub{color:var(--muted);margin-bottom:18px;font-size:14.5px}
.grid{display:grid;gap:18px;grid-template-columns:minmax(0,1fr)}
.cr{min-width:0;overflow:hidden;display:flex;gap:22px;border:1px solid var(--line);border-radius:20px;background:var(--panel);padding:18px;align-items:flex-start}
.cr.w{flex-direction:column}
.frame{flex:none;border-radius:14px;overflow:hidden;box-shadow:0 20px 50px -20px rgba(0,0,0,.9);background:#000;max-width:100%}
.cr.w .frame{max-width:none;transform-origin:left top}
.cr.m .frame{border-radius:26px;outline:8px solid #0b0604;outline-offset:0;margin:8px}
.frame iframe{display:block;border:0;width:100%;height:100%}
.meta{flex:1;min-width:0}
.no{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:40px;line-height:1;color:var(--acc)}.no span{font-family:Manrope,sans-serif;font-size:12px;font-weight:800;color:var(--muted);margin-left:10px;letter-spacing:.08em;vertical-align:middle}
.meta h3{font-size:21px;margin:6px 0 8px}
.tags{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.tags span{font-size:11px;font-weight:800;padding:4px 9px;border-radius:99px;background:rgba(255,197,58,.12);color:var(--acc2)}
.meta p{font-size:14px;line-height:1.6;color:#eadccb;margin-top:6px}.meta p b{color:#fff}
.meta .ch{color:var(--muted)}
.acts{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.acts button,.acts a{appearance:none;border:1px solid var(--line);background:rgba(255,255,255,.05);color:var(--text);font:inherit;font-size:12.5px;font-weight:700;padding:7px 11px;border-radius:9px;cursor:pointer;text-decoration:none}
.ev{margin-top:10px;font:12px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted);background:rgba(0,0,0,.25);border-radius:10px;padding:8px 10px;max-height:92px;overflow:auto;white-space:pre-wrap}
.cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(340px,100%),1fr));gap:18px}
.cols .cr{flex-direction:column;align-items:center}
.cols .meta{width:100%}
footer{margin-top:40px;color:var(--muted);font-size:12.5px;line-height:1.6}
@media (max-width:720px){.cr{flex-direction:column;align-items:center}.cr.w .frame{transform-origin:left top}}
</style>
</head>
<body>
<div class="wrap">
  <header class="hero">
    <div class="brand">coffy<i></i></div>
    <h1>Çok da <em>Coffy.</em><br>Lansman planı &amp; 10 interaktif kreatif</h1>
    <p class="lead">Video ağırlıklı lansman, genç kitle (18–24 / 25–34) odaklı hedefleme, oyun içi interaktif deneyimler ve şubeye yönlendiren lokasyon kullanımları. Kreatifler mobil ağırlıklıdır: <b>${mobile.length} × 320×480</b> mobil/oyun içi, <b>${wide.length} × 970×250</b> billboard.</p>
    <div class="chips"><span><b>${built.length}</b> çalışma</span><span><b>${mobile.length}</b> mobil 320×480</span><span><b>${wide.length}</b> masaüstü 970×250</span><span>HTML5 · MRAID · clickTag · Studio</span><span>Her biri &lt; ${LIMIT_KB} KB</span></div>
  </header>
  <nav class="tabs"><a href="#plan">Lansman planı</a><a href="#mobil">Mobil (320×480)</a><a href="#billboard">Billboard (970×250)</a><span class="sp"></span>
    <label style="font-size:12px;color:var(--muted);font-weight:700">Gün dilimi&nbsp;<select id="dp"><option value="">Şu an</option><option value="morning">Sabah</option><option value="noon">Öğle</option><option value="evening">Akşam</option><option value="night">Gece</option></select></label>
    <button id="all">↻ Hepsini yeniden oynat</button></nav>
  <section class="plan" id="plan">${md(planMd)}</section>
  <h2 class="sec" id="mobil">Mobil · 320×480</h2>
  <p class="sub">Interstitial, oyun içi ödüllü video sonu (end card) ve playable formatları. Telefon çerçevesi içinde gerçek boyutta oynar; dokunma yerine fare ile de denenebilir.</p>
  <div class="cols">${mobile.map(card).join('\n')}</div>
  <h2 class="sec" id="billboard">Billboard · 970×250</h2>
  <p class="sub">Masaüstü ve tablet; video ve interaksiyon aynı karede.</p>
  <div class="grid">${wide.map(card).join('\n')}</div>
  <footer>Video alanlarında ana kampanya videosu gelene kadar animasyonlu yer tutucu oynar (<code>coffy/src/config.js → video.src</code>). Şube listesi örnek veridir; Coffy şube feed’i bağlanınca gerçek mesafe ve saatler görünür. Logo, renk ve menü adları marka kitine göre güncellenecektir.</footer>
</div>
<script>
function frames(){return Array.prototype.slice.call(document.querySelectorAll('iframe'))}
var DP=document.getElementById('dp');
function reload(f){var dp=DP?DP.value:'';if(f.hasAttribute('srcdoc')){f.srcdoc=f.srcdoc}else{f.src=f.src.split('?')[0]+(dp?'?dp='+dp:'')}var ev=f.closest('.cr').querySelector('.ev');ev.textContent='';}
document.addEventListener('click',function(e){var b=e.target.closest('.rs');if(b)reload(document.querySelector('#k'+b.dataset.k+' iframe'))});
document.getElementById('all').addEventListener('click',function(){frames().forEach(reload)});
if(DP)DP.addEventListener('change',function(){frames().forEach(reload)});
window.addEventListener('message',function(e){var d=e.data;if(!d||!d.coffy)return;var el=document.querySelector('[data-ev="'+d.ad+'"]');if(!el)return;if(el.textContent.indexOf('…')>0)el.textContent='';el.textContent+=(el.textContent?'  ·  ':'')+d.ev+(d.d?' '+JSON.stringify(d.d):'');el.scrollTop=el.scrollHeight});
function fit(){document.querySelectorAll('.cr.w .frame').forEach(function(fr){var p=fr.parentNode.clientWidth-36,s=Math.min(1,p/970);fr.style.transform=s<1?'scale('+s+')':'';fr.style.marginBottom=s<1?(-(250*(1-s)))+'px':'';fr.style.marginRight=s<1?(-(970*(1-s)))+'px':''})}
window.addEventListener('resize',fit);fit();
</script>
</body>
</html>
`;
fs.mkdirSync(path.join(root, 'preview'), { recursive: true });
fs.writeFileSync(path.join(root, 'preview', 'index.html'), preview);

/* ---------- teslim: tek dosyalık sunum + zip ---------- */
const rel = path.join(root, 'release');
fs.rmSync(rel, { recursive: true, force: true });
fs.mkdirSync(rel, { recursive: true });
let single = preview;
for (const b of built) {
  const doc = b.html.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  single = single.split(`src="../dist/${b.dir}/index.html" data-dir="${b.dir}"`).join(`srcdoc="${doc}" data-dir="${b.dir}"`);
  single = single.split(`<a href="../dist/${b.dir}/index.html" target="_blank">Yeni sekmede aç</a><a href="../dist/zip/coffy-${b.dir}.zip">Zip</a>`).join(`<a href="#" class="dl" data-dir="${b.dir}">Banner HTML’ini indir</a>`);
}
single = single.replace(/loading="lazy"/g, '').replace(/<label style[\s\S]*?<\/label>/, '');
const tail = single.lastIndexOf('</script>');
single = single.slice(0, tail) + `document.addEventListener('click',function(e){var a=e.target.closest('a.dl');if(!a)return;e.preventDefault();var f=document.querySelector('iframe[data-dir="'+a.dataset.dir+'"]');var bl=new Blob([f.getAttribute('srcdoc')],{type:'text/html'});var u=URL.createObjectURL(bl);var l=document.createElement('a');l.href=u;l.download='coffy-'+a.dataset.dir+'.html';document.body.appendChild(l);l.click();l.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000)});
` + single.slice(tail);
fs.writeFileSync(path.join(rel, 'cok-da-coffy-sunum.html'), single);

const stage = path.join(rel, 'stage');
fs.mkdirSync(stage, { recursive: true });
for (const p of ['dist', 'README.md', 'LANSMAN-PLANI.md']) fs.cpSync(path.join(root, p), path.join(stage, p), { recursive: true });
if (fs.existsSync(path.join(root, 'preview', 'screens'))) fs.cpSync(path.join(root, 'preview', 'screens'), path.join(stage, 'preview', 'screens'), { recursive: true });
fs.writeFileSync(path.join(stage, 'index.html'), preview.replace(/\.\.\/dist\//g, 'dist/'));
const zipOut = path.join(rel, 'cok-da-coffy-banner-seti.zip');
execSync(`cd "${stage}" && zip -q -r -X "${zipOut}" . -x ".*"`);
fs.rmSync(stage, { recursive: true, force: true });
console.log(`✔ preview/index.html · release/cok-da-coffy-sunum.html (${(Buffer.byteLength(single) / 1024).toFixed(0)} KB) · release/cok-da-coffy-banner-seti.zip`);
