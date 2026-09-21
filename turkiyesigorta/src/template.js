'use strict';
/**
 * Türkiye Sigorta 970x250 – şablon: yerleşim (CSS), işaretleme (HTML) ve çalışma zamanı (JS).
 * render(data, assets) tek dosyalık index.html metnini döndürür.
 *   assets = { logo:{uri,w,h,plate}, hero:{uri}, scenes:{key:{uri}}, fonts:{latin,ext} }
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const W = 970, H = 250;

function css(c) {
  return `
@font-face{font-family:'Manrope';font-style:normal;font-weight:200 800;font-display:block;src:url(__FONT_LATIN__) format('woff2');unicode-range:U+0000-00FF,U+0131,U+2000-206F}
@font-face{font-family:'Manrope';font-style:normal;font-weight:200 800;font-display:block;src:url(__FONT_EXT__) format('woff2');unicode-range:U+0100-024F}
:root{--navy:${c.navy};--teal:${c.teal};--tq:${c.turquoise};--tql:${c.turquoiseLight};--red:${c.red};--redd:${c.redDark};--w:#fff;
  --ease:cubic-bezier(.2,.8,.2,1);--pop:cubic-bezier(.2,.9,.3,1.25)}
html,body{margin:0;padding:0;background:var(--navy)}
body{font-family:'Manrope',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
#ad{position:relative;width:${W}px;height:${H}px;overflow:hidden;cursor:pointer;color:#fff;outline:none;box-sizing:border-box;
  background:radial-gradient(640px 300px at 78% 10%,rgba(31,182,193,.35),rgba(31,182,193,0) 60%),linear-gradient(100deg,var(--navy) 0%,#083a4b 48%,var(--teal) 100%)}
#ad:focus-visible{box-shadow:inset 0 0 0 2px var(--tql)}
#ad *{box-sizing:border-box}
.frame{position:absolute;inset:0;border:1px solid rgba(255,255,255,.10);pointer-events:none;z-index:9}
.grain{position:absolute;inset:0;opacity:.07;mix-blend-mode:overlay;pointer-events:none;z-index:2;
  background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .8 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")}
/* ---------- sahne fotoğrafı ---------- */
.stage{position:absolute;left:592px;top:0;width:378px;height:${H}px;overflow:hidden}
.ph{position:absolute;inset:0;opacity:0;transform:translateX(46px) scale(1.03);transition:opacity .65s var(--ease),transform .9s var(--ease)}
.ph img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;transform-origin:60% 50%}
.ph.is-active{opacity:1;transform:none}
.ph.is-active img{animation:kb 5s ease-out both}
.ph.is-prev{opacity:0;transform:translateX(-34px) scale(1.02)}
.ph .tint{position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,42,56,.95) 0%,rgba(6,42,56,.55) 18%,rgba(6,42,56,0) 46%),linear-gradient(180deg,rgba(6,42,56,0) 55%,rgba(6,42,56,.55) 100%)}
.stage .edge{position:absolute;left:0;top:0;bottom:0;width:3px;background:linear-gradient(180deg,var(--red) 0 34%,var(--tq) 34% 100%);opacity:.9}
@keyframes kb{from{transform:scale(1.10) translateX(8px)}to{transform:scale(1) translateX(0)}}
/* ---------- sol sütun: logo, CTA, telefon ---------- */
.colA{position:absolute;left:0;top:0;width:262px;height:${H}px;padding:24px 0 22px 28px}
.logo{display:block;width:196px;height:60px;position:relative}
.logo img{display:block;max-width:100%;max-height:100%;object-fit:contain;object-position:left center}
.logo.plate{background:#fff;border-radius:10px;padding:8px 12px;box-shadow:0 6px 18px rgba(0,10,20,.3)}
.logo.plate img{max-height:44px}
.kicker{margin-top:14px;display:inline-flex;align-items:center;gap:7px;font-size:8.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--tql);white-space:nowrap}
.kicker:before{content:'';width:16px;height:2px;border-radius:2px;background:var(--red)}
.cta{position:absolute;left:28px;top:132px;display:inline-flex;align-items:center;gap:9px;height:44px;padding:0 18px 0 20px;border-radius:999px;overflow:hidden;
  font-size:14px;font-weight:800;color:#fff;white-space:nowrap;text-decoration:none;
  background:linear-gradient(180deg,#ff5062 0%,var(--red) 55%,var(--redd) 100%);
  box-shadow:0 10px 22px rgba(200,0,30,.42),inset 0 2px 0 rgba(255,255,255,.18),inset 0 -2px 0 rgba(0,0,0,.18);transition:transform .25s var(--ease),filter .25s}
.cta:after{content:'';position:absolute;top:-30%;bottom:-30%;left:-40%;width:34%;transform:skewX(-22deg);background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.5),rgba(255,255,255,0));animation:shine 1.1s ease-in-out 3.2s 3 both}
.cta i{display:inline-flex;width:24px;height:24px;border-radius:50%;background:rgba(255,255,255,.18);align-items:center;justify-content:center;transition:transform .25s var(--ease)}
.cta svg{width:11px;height:11px;display:block}
#ad:hover .cta{transform:translateY(-1px) scale(1.03);filter:brightness(1.06)}
#ad:hover .cta i{transform:translateX(3px)}
.phone{position:absolute;left:28px;top:190px;line-height:1.3}
.phone small{display:block;font-size:9px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#a8e9ec}
.phone strong{display:block;font-size:14.5px;font-weight:800;letter-spacing:.03em;color:#fff}
@keyframes shine{from{transform:skewX(-22deg) translateX(0)}to{transform:skewX(-22deg) translateX(520%)}}
/* ---------- orta sütun: sahne metni ---------- */
.copy{position:absolute;left:280px;top:0;width:300px;height:${H}px}
.sc{position:absolute;left:0;right:0;top:0;bottom:0;padding:44px 0 0;opacity:0;pointer-events:none;transition:opacity .35s}
.sc.is-active{opacity:1;pointer-events:auto}
.sc .k{font-size:10px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--tql)}
.sc .t{margin:8px 0 0;font-size:23px;line-height:1.1;font-weight:800;letter-spacing:-.012em;text-shadow:0 2px 12px rgba(0,20,28,.45)}
.sc .s{margin:9px 0 0;font-size:11.5px;line-height:1.4;font-weight:600;color:#d5f4f6;max-width:290px}
.sc .chips{display:flex;flex-wrap:wrap;gap:5px;margin:12px 0 0;padding:0;list-style:none}
.sc .chips li{font-size:10.5px;font-weight:700;padding:4px 9px;border-radius:999px;color:#eafcfc;background:rgba(255,255,255,.10);border:1px solid rgba(190,246,250,.30);white-space:nowrap}
.sc .k,.sc .t,.sc .s,.sc .chips li{opacity:0;transform:translateY(10px)}
.sc.is-active .k{animation:rise .55s var(--ease) .05s both}
.sc.is-active .t{animation:rise .65s var(--ease) .15s both}
.sc.is-active .s{animation:rise .6s var(--ease) .32s both}
.sc.is-active .chips li{animation:pop .5s var(--pop) both}
.sc.is-active .chips li:nth-child(1){animation-delay:.48s}.sc.is-active .chips li:nth-child(2){animation-delay:.58s}.sc.is-active .chips li:nth-child(3){animation-delay:.68s}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}
/* ---------- kontroller ---------- */
.dots{position:absolute;left:620px;bottom:14px;display:flex;gap:6px;z-index:6}
.dot{width:7px;height:7px;border-radius:50%;border:0;padding:0;background:rgba(255,255,255,.38);cursor:pointer;transition:transform .25s,background .25s,width .25s}
.dot.is-on{background:#fff;width:20px;border-radius:4px}
.dot:hover{background:#fff}
.arrow{position:absolute;top:50%;width:30px;height:30px;margin-top:-15px;border-radius:50%;border:1px solid rgba(255,255,255,.35);background:rgba(6,42,56,.55);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s,background .2s;z-index:6;padding:0;backdrop-filter:blur(3px)}
.arrow svg{width:12px;height:12px;display:block}
.arrow.prev{left:606px}.arrow.next{right:12px}
.arrow:hover{background:var(--red);border-color:var(--red)}
#ad:hover[data-phase=scenes] .arrow{opacity:1}
.progress{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.12);z-index:7}
.progress i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--tq),var(--tql));transform:scaleX(0);transform-origin:0 50%}
.pausei{position:absolute;right:14px;top:12px;width:22px;height:22px;border-radius:50%;background:rgba(6,42,56,.6);border:1px solid rgba(255,255,255,.3);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s;z-index:7}
.pausei:before,.pausei:after{content:'';width:2px;height:8px;background:#fff;margin:0 1.5px;border-radius:1px}
#ad.is-paused .pausei{opacity:1}
.url{position:absolute;right:16px;bottom:9px;font-size:9px;font-weight:600;letter-spacing:.08em;color:rgba(200,243,245,.6);z-index:6}
/* ---------- açılış ---------- */
.intro{position:absolute;inset:0;z-index:5;opacity:1;transition:opacity .6s var(--ease)}
.intro .hero{position:absolute;inset:0}
.intro .hero img{width:100%;height:100%;object-fit:cover;display:block;animation:kb 6s ease-out both}
.intro .scrim{position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,42,56,.96) 0%,rgba(6,42,56,.88) 38%,rgba(6,42,56,.35) 70%,rgba(6,42,56,.15) 100%)}
.intro .ilogo{position:absolute;left:44px;top:50%;transform:translateY(-50%);width:230px;height:74px;animation:rise .8s var(--ease) .1s both}
.intro .ilogo img{width:100%;height:100%;object-fit:contain;object-position:left center;display:block}
.intro .ilogo.plate{background:#fff;border-radius:12px;padding:10px 16px;box-shadow:0 10px 30px rgba(0,10,20,.35)}
.intro .isep{position:absolute;left:304px;top:70px;width:1px;height:110px;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(159,240,242,.6) 30%,rgba(159,240,242,.6) 70%,rgba(255,255,255,0));transform-origin:50% 50%;animation:grow .8s var(--ease) .35s both}
.intro .islogan{position:absolute;left:330px;top:50%;transform:translateY(-50%);width:520px}
.intro .islogan .a{display:block;font-size:14px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--tql);animation:rise .6s var(--ease) .5s both}
.intro .islogan .b{display:block;margin-top:8px;font-size:34px;line-height:1.05;font-weight:800;letter-spacing:-.012em;text-shadow:0 2px 14px rgba(0,20,28,.5);animation:rise .7s var(--ease) .65s both}
.intro .islogan .c{display:inline-flex;align-items:center;gap:8px;margin-top:12px;font-size:10.5px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#d5f4f6;animation:rise .6s var(--ease) .95s both}
.intro .islogan .c:before{content:'';width:18px;height:2px;background:var(--red);border-radius:2px}
@keyframes grow{from{opacity:0;transform:scaleY(0)}to{opacity:1;transform:scaleY(1)}}
#ad:not([data-phase=intro]) .intro{opacity:0;pointer-events:none}
#ad[data-phase=intro] .colA,#ad[data-phase=intro] .copy,#ad[data-phase=intro] .stage,#ad[data-phase=intro] .dots{opacity:0}
.colA,.copy,.stage,.dots{transition:opacity .5s var(--ease) .15s}
/* ---------- kapanış ---------- */
.outro{position:absolute;inset:0;z-index:5;opacity:0;pointer-events:none;transition:opacity .5s var(--ease);
  background:radial-gradient(520px 280px at 84% 40%,rgba(31,182,193,.30),rgba(31,182,193,0) 62%),linear-gradient(100deg,var(--navy) 0%,#083a4b 55%,#0b5f70 100%)}
#ad[data-phase=outro] .outro{opacity:1;pointer-events:auto}
#ad[data-phase=outro] .copy,#ad[data-phase=outro] .stage,#ad[data-phase=outro] .colA{opacity:0}
.outro .ologo{position:absolute;left:28px;top:24px;width:196px;height:60px}
.outro .ologo img{width:100%;height:100%;object-fit:contain;object-position:left center;display:block}
.outro .ologo.plate{background:#fff;border-radius:10px;padding:8px 12px}
.outro .ot{position:absolute;left:28px;top:98px;margin:0;font-size:29px;line-height:1.05;font-weight:800;letter-spacing:-.012em;width:520px;text-shadow:0 2px 12px rgba(0,20,28,.45)}
.outro .ol{position:absolute;left:28px;top:170px;font-size:11.5px;font-weight:700;color:#d5f4f6;letter-spacing:.02em}
.outro .on{position:absolute;left:28px;top:193px;font-size:10.5px;font-weight:600;color:#a8e9ec}
.outro .ocol{position:absolute;right:38px;top:0;height:${H}px;width:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px}
.outro .ocol .cta{position:static;animation:pulse 2.4s ease-in-out 1s infinite}
.outro .ocol .phone{position:static;text-align:center}
.outro .strip{position:absolute;left:576px;top:34px;width:140px;height:180px}
.outro .strip img{position:absolute;width:82px;height:56px;object-fit:cover;border-radius:8px;border:2px solid rgba(255,255,255,.85);box-shadow:0 8px 18px rgba(0,10,20,.4)}
#ad[data-phase=outro] .ot{animation:rise .6s var(--ease) .15s both}
#ad[data-phase=outro] .ol{animation:rise .6s var(--ease) .35s both}
#ad[data-phase=outro] .on{animation:rise .6s var(--ease) .5s both}
#ad[data-phase=outro] .strip img{animation:pop .6s var(--pop) both}
@keyframes pulse{0%,100%{box-shadow:0 10px 22px rgba(200,0,30,.42),0 0 0 0 rgba(255,80,98,.5)}50%{box-shadow:0 12px 26px rgba(200,0,30,.5),0 0 0 9px rgba(255,80,98,0)}}
#ad.is-ended .progress i{transform:scaleX(1)!important}
@media (prefers-reduced-motion:reduce){#ad *{animation-duration:.01s!important;animation-delay:0s!important;transition-duration:.01s!important}}
`;
}

function html(data, assets) {
  const b = data.brand;
  const logo = (cls) => `<div class="${cls}${assets.logo && assets.logo.plate ? ' plate' : ''}"><img src="${assets.logo ? assets.logo.uri : ''}" alt="${esc(b.name)}"></div>`;
  const arrow = `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5"/></svg>`;
  const scenes = data.scenes.map((s, i) => `
      <div class="sc" data-i="${i}">
        <div class="k">${esc(s.kicker)}</div>
        <h2 class="t">${esc(s.title)}</h2>
        <p class="s">${esc(s.sub)}</p>
        <ul class="chips">${s.chips.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      </div>`).join('');
  const photos = data.scenes.map((s, i) => `<div class="ph" data-i="${i}"><img src="${assets.scenes[s.key] ? assets.scenes[s.key].uri : ''}" alt=""><div class="tint"></div></div>`).join('');
  const strip = data.scenes.map((s, i) => { const pos = [[0, 0], [58, 22], [8, 62], [62, 86], [16, 124]][i] || [0, i * 30]; return `<img src="${assets.scenes[s.key] ? assets.scenes[s.key].uri : ''}" alt="" style="left:${pos[0]}px;top:${pos[1]}px;transform:rotate(${(i % 2 ? 4 : -4)}deg);animation-delay:${.25 + i * .09}s">`; }).join('');
  const cta = `<a class="cta" href="${esc(b.url)}" target="_blank" rel="noopener" tabindex="-1">${esc(b.cta)} <i>${arrow}</i></a>`;
  const phone = `<div class="phone"><small>${esc(b.phoneLabel)}</small><strong>${esc(b.phone)}</strong></div>`;
  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${W},height=${H}">
<meta name="viewport" content="width=${W}">
<title>${esc(b.name)} – ${W}x${H}</title>
<style>__CSS__</style>
</head>
<body>
<div id="ad" role="link" tabindex="0" aria-label="${esc(b.name)} – ${esc(b.slogan)}. ${esc(b.cta)}." data-phase="intro">
  <div class="stage">${photos}<div class="edge"></div></div>
  <div class="grain"></div>
  <div class="colA">
    ${logo('logo')}
    <div class="kicker">${esc(b.kicker)}</div>
    ${cta}
    ${phone}
  </div>
  <div class="copy">${scenes}
  </div>
  <button class="arrow prev ctrl" type="button" aria-label="Önceki"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6H2M5.5 2.5 2 6l3.5 3.5"/></svg></button>
  <button class="arrow next ctrl" type="button" aria-label="Sonraki">${arrow}</button>
  <div class="dots ctrl" role="tablist" aria-label="Sahneler"></div>
  <div class="pausei" aria-hidden="true"></div>
  <div class="url">${esc(b.domain)}</div>
  <div class="intro">
    <div class="hero"><img src="${assets.hero ? assets.hero.uri : ''}" alt=""><div class="scrim"></div></div>
    ${logo('ilogo')}
    <div class="isep"></div>
    <div class="islogan"><span class="a">${esc(b.sloganIntro[0])}</span><span class="b">${esc(b.sloganIntro[1])}</span><span class="c">${esc(b.kicker)}</span></div>
  </div>
  <div class="outro">
    ${logo('ologo')}
    <h2 class="ot">${esc(b.outroTitle)}</h2>
    <div class="ol">${esc(b.outroList)}</div>
    <div class="on">${esc(b.outroNote)}</div>
    <div class="strip">${strip}</div>
    <div class="ocol">${cta}${phone}</div>
  </div>
  <div class="progress"><i></i></div>
  <div class="frame"></div>
</div>
<script>__ENGINE__</script>
</body>
</html>`;
}

const ENGINE = `
(function(){
var D=__DATA__,n=D.scenes.length,T=D.timing;
var ad=document.getElementById('ad'),scs=[].slice.call(ad.querySelectorAll('.sc')),phs=[].slice.call(ad.querySelectorAll('.ph')),dots=ad.querySelector('.dots'),bar=ad.querySelector('.progress i');
var dotEls=[],idx=-1,phase='intro',acc=0,total=0,last=0,paused=false,ended=false,hover=false,hidden=false;
function dur(){return phase==='intro'?T.intro:phase==='outro'?T.outro:T.slide}
function setPhase(p){phase=p;acc=0;ad.setAttribute('data-phase',p)}
function goTo(i){
  idx=((i%n)+n)%n;
  scs.forEach(function(s,j){s.classList.toggle('is-active',j===idx)});
  phs.forEach(function(p,j){p.classList.remove('is-active','is-prev');if(j===idx)p.classList.add('is-active');else if(j===(idx-1+n)%n)p.classList.add('is-prev')});
  dotEls.forEach(function(d,j){d.classList.toggle('is-on',j===idx);d.setAttribute('aria-selected',j===idx?'true':'false')});
  if(phase!=='scenes')setPhase('scenes');else acc=0;
}
var cap=T.maxAutoplay>0?T.maxAutoplay:Infinity;
function finish(){ended=true;ad.classList.add('is-ended')}
function advance(){
  if(phase==='intro')goTo(0);
  else if(phase==='scenes'){if(idx<n-1&&total+T.slide+T.outro<=cap)goTo(idx+1);else setPhase('outro')}
  else finish();
}
function frame(now){
  var dt=Math.min(now-last,80);last=now;paused=hidden||(hover&&phase!=='intro');
  if(!paused&&!ended){acc+=dt;total+=dt;if(acc>=dur())advance();bar.style.transform='scaleX('+Math.min(1,acc/dur())+')'}
  ad.classList.toggle('is-paused',paused&&!ended);
  requestAnimationFrame(frame);
}
function openLink(){var s=D.scenes[idx];var u=(D.brand.deepLink&&phase==='scenes'&&s&&s.url)?s.url:D.brand.url;
  if(typeof window.clickTag==='string'&&window.clickTag){u=window.clickTag}
  if(window.Enabler&&typeof Enabler.exit==='function'){Enabler.exit('CTA')}else{window.open(u,'_blank','noopener')}}
function step(d){if(phase==='intro')return;if(phase==='outro'){goTo(d>0?0:n-1);return}goTo((idx<0?0:idx)+d)}
D.scenes.forEach(function(s,i){var b=document.createElement('button');b.type='button';b.className='dot ctrl';b.setAttribute('role','tab');b.setAttribute('aria-label',s.kicker);
  b.addEventListener('click',function(e){e.stopPropagation();goTo(i)});dots.appendChild(b);dotEls.push(b)});
[].forEach.call(ad.querySelectorAll('.arrow'),function(a){a.addEventListener('click',function(e){e.stopPropagation();step(a.classList.contains('next')?1:-1)})});
ad.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.ctrl'))return;e.preventDefault();openLink()});
ad.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}else if(e.key==='Enter'||e.key===' '){e.preventDefault();openLink()}});
ad.addEventListener('mousemove',function(){hover=true});
ad.addEventListener('mouseleave',function(){hover=false});
var tx=null;
ad.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;hover=true},{passive:true});
ad.addEventListener('touchend',function(e){hover=false;if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>36){step(dx<0?1:-1)}},{passive:true});
document.addEventListener('visibilitychange',function(){hidden=document.hidden});
window.addEventListener('message',function(e){var m=e.data;if(m==='pause')hidden=true;else if(m==='play')hidden=false;else if(m==='restart')location.reload()});
var started=false;
function start(){if(started)return;started=true;setPhase('intro');last=performance.now();requestAnimationFrame(frame)}
window.addEventListener('load',function(){setTimeout(start,60)});
document.addEventListener('DOMContentLoaded',function(){setTimeout(start,900)});
if(document.readyState!=='loading')setTimeout(start,document.readyState==='complete'?0:900);
setTimeout(start,2500);
})();
`;

function render(data, assets) {
  const engineData = JSON.stringify({ brand: { url: data.brand.url, deepLink: data.brand.deepLink }, timing: data.timing, scenes: data.scenes.map((s) => ({ kicker: s.kicker, url: s.url })) }).replace(/<\//g, '<\\/');
  return html(data, assets)
    .replace('__CSS__', css(data.colors).replace('__FONT_LATIN__', assets.fonts.latin).replace('__FONT_EXT__', assets.fonts.ext))
    .replace('__ENGINE__', ENGINE.replace('__DATA__', engineData));
}
module.exports = { render, W, H };
