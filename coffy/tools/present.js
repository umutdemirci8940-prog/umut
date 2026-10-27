#!/usr/bin/env node
'use strict';
/**
 * Tek dosyalık sunum: coffy/release/index.html
 * İlaçsız Yaşam sunumuyla aynı format (başlık + çipler, araç çubuğu, Stüdyo / Yayın simülasyonu,
 * Koyu / Açık tema, banner kartları, notlar, dipnot). 10 banner dosyanın içine gömülüdür.
 *
 * Kullanım: node coffy/build.js && node coffy/tools/present.js
 */
const fs = require('fs');
const path = require('path');
const { FONTS } = require('../src/shared');
const concepts = [...require('../src/concepts-mobile'), ...require('../src/concepts-wide')];

const root = path.join(__dirname, '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const B = {};
for (const c of concepts) {
  const dir = `${c.no}-${c.slug}-${c.size}`;
  B[c.no] = { html: fs.readFileSync(path.join(root, 'dist', dir, 'index.html'), 'utf8'), dir, size: c.size, name: c.name };
}
const mobile = concepts.filter((c) => c.size === '320x480');
const wide = concepts.filter((c) => c.size === '970x250');
const shortName = (c) => c.name.replace(/\s*\(.*\)$/, '');

const card = (c) => {
  const [w, h] = c.size.split('x');
  return `<div class="card">
      <div class="card-h"><h3>${c.no} · ${esc(shortName(c))} <span>${w} × ${h}</span></h3><div class="links"><a href="#" data-open="${c.no}">Yeni sekmede aç</a><a href="#" data-dl="${c.no}">HTML indir</a></div></div>
      <div class="stage-area"><span class="frame"><iframe class="ad" data-no="${c.no}" width="${w}" height="${h}" title="${esc(c.name)} – ${c.size}" scrolling="no"></iframe></span></div>
      <p class="desc">${esc(c.mechanic)}</p>
    </div>`;
};

const html = `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Coffy – Çok da Coffy İnteraktif Banner Serisi</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS.replace(/&/g, '&amp;')}" rel="stylesheet">
<style>
:root{--bg:#120a06;--panel:#1d120c;--line:rgba(255,255,255,.08);--text:#fbefdf;--muted:#bba893;--gold:#ffc53a;--green:#ff5a2c;--forest:#1d110b}
*{box-sizing:border-box;margin:0;padding:0}
html{background:var(--bg);color:var(--text);font-family:'Manrope',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;-webkit-font-smoothing:antialiased}
body{min-height:100vh;background:radial-gradient(900px 500px at 10% -10%,rgba(255,90,44,.22),transparent 60%),radial-gradient(700px 400px at 100% 0%,rgba(255,197,58,.1),transparent 60%),var(--bg)}
a{color:inherit}
code{font-size:12px;background:rgba(255,255,255,.07);padding:1px 6px;border-radius:6px}
.wrap{max-width:1120px;margin:0 auto;padding:40px 24px 80px}
header{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:28px}
.lockup{display:flex;align-items:center;gap:14px}
.lockup .mk{width:44px;height:44px;flex:none;border-radius:50%;background:var(--green);display:grid;place-items:center;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:22px;color:#fff;letter-spacing:-.05em}
.lockup b{display:block;font-family:'Bricolage Grotesque',sans-serif;font-weight:800;font-size:28px;line-height:1;letter-spacing:-.05em;color:#fff}
.lockup b i{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--green);margin-left:3px}
.lockup small{display:block;margin-top:5px;font-size:10px;letter-spacing:.26em;text-transform:uppercase;color:var(--gold);font-weight:800}
h1{font-family:'Bricolage Grotesque',sans-serif;font-weight:800;letter-spacing:-.03em;font-size:40px;line-height:1.05;margin-top:26px;max-width:760px}
h1 em{font-style:normal;color:var(--gold)}
.lead{color:var(--muted);font-size:15px;line-height:1.6;max-width:680px;margin-top:12px}
.chips{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.chip{border:1px solid var(--line);border-radius:99px;padding:6px 12px;font-size:12px;font-weight:700;color:var(--muted);background:rgba(255,255,255,.02)}
.chip b{color:var(--gold)}
.toolbar{position:sticky;top:0;z-index:20;display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:30px 0 18px;padding:10px;border:1px solid var(--line);border-radius:14px;background:rgba(18,10,6,.86);backdrop-filter:blur(10px)}
.toolbar .sp{flex:1}
button,.btn{appearance:none;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--text);font:inherit;font-weight:700;font-size:13px;padding:9px 14px;border-radius:10px;cursor:pointer;transition:background .2s;text-decoration:none;display:inline-flex;align-items:center;gap:8px}
button:hover{background:rgba(255,255,255,.09)}
button.primary{background:linear-gradient(135deg,#ff7a4d,var(--green));color:#fff;border-color:transparent}
button.is-on{border-color:var(--gold);color:var(--gold)}
.seg{display:inline-flex;border:1px solid var(--line);border-radius:10px;overflow:hidden}
.seg button{border:0;border-radius:0;background:transparent}
.seg button.is-on{background:rgba(255,197,58,.14)}
.grid{display:grid;gap:22px;grid-template-columns:minmax(0,1fr)}
.sec-t{display:flex;align-items:baseline;gap:12px;margin:14px 0 -6px}
.sec-t h2{font-family:'Bricolage Grotesque',sans-serif;font-size:24px;letter-spacing:-.02em}
.sec-t span{color:var(--muted);font-size:13px;font-weight:600}
.card{border:1px solid var(--line);border-radius:18px;background:var(--panel);padding:18px;overflow:hidden;min-width:0}
.card-h{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:14px}
.card-h h3{font-size:15px;font-weight:800}
.card-h h3 span{color:var(--muted);font-weight:600;margin-left:8px}
.card-h .links{display:flex;gap:6px;flex-wrap:wrap}
.card-h .links a{font-size:12px;color:var(--muted);text-decoration:none;border:1px solid var(--line);padding:5px 9px;border-radius:8px}
.card-h .links a:hover{color:var(--text)}
.desc{margin-top:14px;font-size:13px;line-height:1.6;color:#d9c9b6}
.frame{display:inline-block;line-height:0;box-shadow:0 24px 60px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.08);border-radius:2px;background:#000}
iframe{border:0;display:block;background:#1d110b}
.mgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr));gap:22px}
.mgrid .stage-area{text-align:center}
.stage-area{overflow:auto;padding:6px 0}
.light .stage-area{background:#efe9e1;border-radius:12px;padding:22px}
.light .frame{box-shadow:0 18px 40px rgba(0,0,0,.25),0 0 0 1px rgba(0,0,0,.08)}
.notes{margin-top:34px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:16px}
.note{border:1px solid var(--line);border-radius:16px;padding:18px;background:rgba(255,255,255,.02)}
.note h4{font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:10px}
.note ul{list-style:none;display:grid;gap:8px}
.note li{font-size:13.5px;line-height:1.55;color:#e0d2c1;padding-left:16px;position:relative}
.note li:before{content:"";position:absolute;left:0;top:9px;width:6px;height:6px;border-radius:50%;background:var(--green)}
.note li b{color:#fff}
/* yayın simülasyonu */
.sim{display:none;gap:22px}
.sim.is-on{display:grid}
.simbar{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-bottom:12px}
.simbar span{font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);margin-right:6px}
.simbar button{padding:6px 10px;font-size:12px}
.web{background:#f4f2ef;color:#222;border-radius:18px;overflow:hidden;border:1px solid rgba(0,0,0,.1)}
.web .top{background:#fff;border-bottom:1px solid #e6e2dc;padding:14px 28px;display:flex;align-items:center;gap:18px}
.web .logo{width:120px;height:20px;border-radius:4px;background:#222}
.web .nav i{display:inline-block;width:52px;height:10px;border-radius:3px;background:#dcd8d2;margin-right:10px}
.web .body{padding:22px 28px 36px;display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:28px;max-width:1080px;margin:0 auto}
.web .bill{grid-column:1/-1;display:flex;justify-content:center;padding:6px 0 10px;overflow:auto}
.web .ph{border-radius:4px;background:#e2ded8}
.web .art h2{font-family:Georgia,serif;font-size:30px;line-height:1.15;color:#1a1a1a;margin:6px 0 10px}
.web .art p{height:10px;background:#dedad4;border-radius:3px;margin:9px 0}
.web .art p.s{width:70%}
.web .side{display:flex;flex-direction:column;gap:20px}
.web .side .ph{width:100%;height:140px}
.phone-wrap{display:flex;flex-wrap:wrap;gap:28px;align-items:center;justify-content:center;padding:26px;border:1px solid var(--line);border-radius:18px;background:var(--panel)}
.phone{position:relative;width:360px;height:740px;border-radius:52px;background:#0b0604;padding:14px;box-shadow:0 30px 80px rgba(0,0,0,.6),inset 0 0 0 2px #2a1d16}
.screen{position:relative;width:100%;height:100%;border-radius:40px;overflow:hidden;background:linear-gradient(180deg,#2a6fdb,#5fb0ff 45%,#7ed957 45%,#4caf50)}
.screen .game{position:absolute;inset:0;filter:blur(3px) saturate(.8)}
.screen .game i{position:absolute;border-radius:10px;background:rgba(255,255,255,.7)}
.screen .dim{position:absolute;inset:0;background:rgba(0,0,0,.62)}
.screen .notch{position:absolute;left:50%;top:10px;width:110px;height:28px;margin-left:-55px;border-radius:20px;background:#000;z-index:5}
.screen .ia{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);line-height:0;box-shadow:0 20px 60px rgba(0,0,0,.6)}
.screen .x{position:absolute;right:16px;top:52px;width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.85);color:#111;display:grid;place-items:center;font-weight:800;font-size:14px;z-index:4}
.screen .lbl{position:absolute;left:18px;top:56px;font-size:11px;font-weight:800;letter-spacing:.12em;color:rgba(255,255,255,.8);z-index:4}
.pinfo{max-width:330px}
.pinfo h3{font-family:'Bricolage Grotesque',sans-serif;font-size:26px;letter-spacing:-.02em}
.pinfo small{display:block;color:var(--gold);font-weight:800;letter-spacing:.14em;font-size:11px;margin-bottom:8px}
.pinfo p{color:#d9c9b6;font-size:14px;line-height:1.6;margin-top:10px}
footer{margin-top:50px;color:var(--muted);font-size:12px;line-height:1.7;border-top:1px solid var(--line);padding-top:18px}
@media (max-width:760px){.web .body{grid-template-columns:1fr}h1{font-size:30px}.phone{transform:scale(.82);transform-origin:top center;margin-bottom:-130px}}
</style>
</head>
<body>
<div class="wrap">
  <header>
    <div>
      <div class="lockup">
        <span class="mk">c</span>
        <div><b>coffy<i></i></b><small>Çok da Coffy</small></div>
      </div>
      <h1>“Çok da Coffy” lansmanı için <em>interaktif</em> HTML5 banner serisi</h1>
      <p class="lead">Video ağırlıklı lansman ve genç kitle için 10 interaktif çalışma. Her çalışma ana videoyla açılır, kullanıcıya bir soru, senaryo ya da mini oyun sunar, Coffy tüketimiyle devam eder ve “Çok da Coffy” mesajıyla en yakın şubeye yönlendirir. Set mobil ağırlıklıdır.</p>
      <div class="chips">
        <span class="chip"><b>7 × 320×480</b> Mobil / oyun içi</span>
        <span class="chip"><b>3 × 970×250</b> Billboard</span>
        <span class="chip">Video + interaksiyon</span>
        <span class="chip">Oyun içi ödüllü / playable</span>
        <span class="chip">Lokasyon: en yakın şube</span>
        <span class="chip">Yalnızca CTA butonları tıklanabilir</span>
        <span class="chip">clickTag · MRAID · Studio</span>
      </div>
    </div>
  </header>

  <div class="toolbar">
    <button class="primary" id="restart">↻ Yeniden başlat</button>
    <span class="sp"></span>
    <div class="seg" id="view">
      <button class="is-on" data-view="studio">Stüdyo</button>
      <button data-view="sim">Yayın simülasyonu</button>
    </div>
    <div class="seg" id="theme">
      <button class="is-on" data-theme="dark">Koyu</button>
      <button data-theme="light">Açık</button>
    </div>
  </div>

  <section id="studio" class="grid">
    <div class="sec-t"><h2>Mobil · 320 × 480</h2><span>Interstitial, oyun içi ödüllü video sonu, playable</span></div>
    <div class="mgrid">
    ${mobile.map(card).join('\n    ')}
    </div>
    <div class="sec-t"><h2>Billboard · 970 × 250</h2><span>Masaüstü ve tablet</span></div>
    ${wide.map(card).join('\n    ')}
  </section>

  <section id="sim" class="sim" aria-label="Yayın simülasyonu">
    <div>
      <div class="simbar"><span>Mobil / oyun içi</span>${mobile.map((c, i) => `<button data-ph="${c.no}"${i ? '' : ' class="is-on"'}>${c.no} · ${esc(shortName(c))}</button>`).join('')}</div>
      <div class="phone-wrap">
        <div class="phone"><div class="screen">
          <div class="game"><i style="left:30px;top:120px;width:90px;height:40px"></i><i style="left:200px;top:90px;width:70px;height:30px"></i><i style="left:60px;top:520px;width:200px;height:60px;background:#8d5a2b"></i><i style="left:150px;top:420px;width:40px;height:80px;background:#ffcc33"></i></div>
          <div class="dim"></div><div class="notch"></div><div class="lbl">REKLAM</div><div class="x">✕</div>
          <div class="ia"><iframe id="phf" width="320" height="480" title="Mobil interstitial simülasyonu" scrolling="no"></iframe></div>
        </div></div>
        <div class="pinfo" id="pinfo"></div>
      </div>
    </div>
    <div>
      <div class="simbar"><span>Masaüstü</span>${wide.map((c, i) => `<button data-bb="${c.no}"${i ? '' : ' class="is-on"'}>${c.no} · ${esc(shortName(c))}</button>`).join('')}</div>
      <div class="web">
        <div class="top"><span class="logo"></span><span class="nav"><i></i><i></i><i></i><i></i></span></div>
        <div class="body">
          <div class="bill"><span class="frame"><iframe id="bbf" width="970" height="250" title="Billboard simülasyonu" scrolling="no"></iframe></span></div>
          <div class="art">
            <div class="ph" style="height:14px;width:120px"></div>
            <h2>Final haftası için 7 verimli çalışma taktiği</h2>
            <p></p><p></p><p class="s"></p><p></p><p></p><p class="s"></p><p></p><p></p><p class="s"></p><p></p><p></p><p></p>
          </div>
          <div class="side"><div class="ph"></div><div class="ph" style="height:250px"></div><div class="ph"></div></div>
        </div>
      </div>
    </div>
  </section>

  <section class="notes">
    <div class="note"><h4>Kurgu</h4><ul>
      <li><b>Video:</b> Her çalışma ana videoyla açılır; 2 sn sonra “Geç” çıkar. #08’de video interaksiyonla aynı karede döner.</li>
      <li><b>İnteraksiyon:</b> Soru / senaryo / mini oyun, Coffy tüketimiyle devam eder.</li>
      <li><b>Kapanış:</b> “Çok da Coffy.” + en yakın şube, mesafe, yürüme süresi.</li>
      <li><b>Otomatik demo:</b> Kullanıcı etkileşmezse çalışma kendini oynatıp kapanış kartına ulaşır.</li>
    </ul></div>
    <div class="note"><h4>Hedefleme</h4><ul>
      <li><b>Lansman:</b> YouTube Masthead + Bumper/Shorts, TikTok TopView, Reels/Stories.</li>
      <li><b>Genç kitle:</b> 18–34, oyun / müzik / e-spor / kampüs bağlamları, PMP.</li>
      <li><b>Oyun içi:</b> Ödüllü video + playable end card (#02, #05), interstitial (#01, #03, #04, #07).</li>
      <li><b>Lokasyon:</b> Şube çevresi 300 m – 1 km, kampüs geo-fence, gün dilimi ve hava durumu tetikleri (#06, #10).</li>
    </ul></div>
    <div class="note"><h4>Tıklama ve teknik</h4><ul>
      <li><b>Yalnızca CTA butonları</b> tıklanabilir: “Yol tarifi al” en yakın şubeye, “Sipariş ver” coffy.com.tr’ye gider. UTM yoktur.</li>
      <li><b>Tek dosya</b> HTML5, her biri ~35 KB (Google Ads sınırı 150 KB).</li>
      <li><b>Çıkış:</b> clickTag (Google Ads / CM360), Enabler (Studio), mraid.open (uygulama içi).</li>
      <li><b>Konum:</b> MRAID getLocation → DSP makroları → bölge varsayılanı.</li>
    </ul></div>
  </section>

  <footer>Bu sayfa sunum amaçlı bir önizlemedir; 10 banner içine gömülüdür ve her biri kart başlığından indirilebilir. Video alanlarında ana kampanya videosu gelene kadar animasyonlu yer tutucu oynar. Logo, ürün görselleri, şube listesi, teklif kodu ve içecek adları yer tutucudur; coffy.com.tr’deki orijinal logo ve ürün fotoğraflarıyla değiştirilecektir.</footer>
</div>
<script id="banners" type="application/json">${JSON.stringify(Object.fromEntries(Object.entries(B).map(([k, v]) => [k, { html: v.html, dir: v.dir, name: v.name, size: v.size }]))).replace(/</g, '\\u003c')}</script>
<script id="info" type="application/json">${JSON.stringify(Object.fromEntries(concepts.map((c) => [c.no, { name: shortName(c), mechanic: c.mechanic, channel: c.channel, why: c.why }]))).replace(/</g, '\\u003c')}</script>
<script>
(function(){
  var B=JSON.parse(document.getElementById('banners').textContent), I=JSON.parse(document.getElementById('info').textContent);
  var studio=[].slice.call(document.querySelectorAll('#studio iframe[data-no]'));
  studio.forEach(function(f){f.srcdoc=B[f.dataset.no].html});
  function load(f,no){f.dataset.cur=no;f.srcdoc=B[no].html}
  function restart(list){list.forEach(function(f){if(f.srcdoc)f.srcdoc=f.srcdoc})}
  var simReady=false;
  function phone(no){load(document.getElementById('phf'),no);var i=I[no];document.getElementById('pinfo').innerHTML='<small>'+no+' · 320 × 480</small><h3>'+i.name+'</h3><p>'+i.mechanic+'</p><p><b>Yayın:</b> '+i.channel+'</p>'}
  function bill(no){load(document.getElementById('bbf'),no)}
  document.getElementById('restart').addEventListener('click',function(){restart([].slice.call(document.querySelectorAll('iframe')))});
  document.getElementById('view').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    [].forEach.call(this.children,function(x){x.classList.toggle('is-on',x===b)});
    var sim=b.dataset.view==='sim';
    document.getElementById('sim').classList.toggle('is-on',sim);
    document.getElementById('studio').style.display=sim?'none':'';
    if(sim&&!simReady){simReady=true;phone('${mobile[0].no}');bill('${wide[0].no}')}
  });
  document.getElementById('sim').addEventListener('click',function(e){
    var b=e.target.closest('button[data-ph],button[data-bb]');if(!b)return;
    [].forEach.call(b.parentNode.querySelectorAll('button'),function(x){x.classList.toggle('is-on',x===b)});
    if(b.dataset.ph)phone(b.dataset.ph);else bill(b.dataset.bb);
  });
  document.getElementById('theme').addEventListener('click',function(e){
    var b=e.target.closest('button');if(!b)return;
    [].forEach.call(this.children,function(x){x.classList.toggle('is-on',x===b)});
    document.body.classList.toggle('light',b.dataset.theme==='light');
  });
  function blobUrl(no){return URL.createObjectURL(new Blob([B[no].html],{type:'text/html'}))}
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[data-open],a[data-dl]');if(!a)return;e.preventDefault();
    var no=a.dataset.open||a.dataset.dl,u=blobUrl(no);
    if(a.dataset.open){window.open(u,'_blank')}else{var l=document.createElement('a');l.href=u;l.download='coffy-'+B[no].dir+'.html';document.body.appendChild(l);l.click();l.remove()}
    setTimeout(function(){URL.revokeObjectURL(u)},60000);
  });
})();
</script>
</body>
</html>
`;
const out = path.join(root, 'release', 'index.html');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`✔ ${path.relative(path.join(root, '..'), out)} (${(Buffer.byteLength(html) / 1024).toFixed(0)} KB)`);
