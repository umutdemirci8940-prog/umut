'use strict';
/**
 * Türkiye Sigorta 970x250 – şablon (sitenin açık zeminli görsel diline göre):
 * açılış (site üst şeridi gibi lacivert→turkuaz degrade, iki markalı beyaz logo), 5 ürün sahnesi
 * (beyaz zemin, "Gücü, adında." etiketi, lacivert başlık, turkuaz CTA, sağda sitenin ürün görseli), kapanış.
 * render(data, assets): assets = { fonts:{css}, bg:{uri}, logo:{uri,w,h}, logoWhite:{uri}, lockup:{uri}, emblem:{uri},
 *                                  scenes:{key:{uri}}, hero:{uri} }
 */
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const W = 970, H = 250;

function css(c, fontCss, fontFamily) {
  return `
${fontCss}
:root{--navy:${c.navy};--navy2:${c.navyDeep};--blue:${c.blue};--tq:${c.turquoise};--tq6:${c.turquoise600};--tq1:${c.turquoise100};--tq0:${c.turquoise50};--bg:${c.bg};--grey:${c.grey};--red:${c.red};--pink:${c.pink};
  --ease:cubic-bezier(.2,.8,.2,1);--pop:cubic-bezier(.2,.9,.3,1.25)}
html,body{margin:0;padding:0;background:#fff}
body{font-family:${fontFamily},'Manrope',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
#ad{position:relative;width:${W}px;height:${H}px;overflow:hidden;cursor:pointer;color:var(--navy);outline:none;box-sizing:border-box;background:#fff}
#ad:focus-visible{box-shadow:inset 0 0 0 2px var(--tq)}
#ad *{box-sizing:border-box}
.bgimg{position:absolute;inset:0;width:${W}px;height:${H}px;display:block}
.frame{position:absolute;inset:0;border:1px solid #d9e6ee;pointer-events:none;z-index:9}
/* ---------- sahne görseli (sitenin ürün sayfası görseli) ---------- */
.stage{position:absolute;left:600px;top:0;width:370px;height:${H}px;overflow:hidden}
.ph{position:absolute;inset:0;opacity:0;transform:translateY(26px) scale(.97);transition:opacity .6s var(--ease),transform .8s var(--ease)}
.ph img{position:absolute;right:16px;bottom:0;height:238px;width:auto;max-width:352px;object-fit:contain;object-position:right bottom;display:block}
.ph.is-active{opacity:1;transform:none}
.ph.is-active img{animation:float 4.5s ease-in-out .8s infinite}
.ph.is-prev{opacity:0;transform:translateX(-24px) scale(.98)}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
/* ---------- logo, etiket ---------- */
.logo{position:absolute;left:28px;top:22px;height:32px}
.logo img{display:block;height:32px;width:auto}
.tag{position:absolute;left:28px;top:66px;display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px 0 7px;border-radius:999px;background:#fff;border:1px solid #d9e6ee;box-shadow:0 2px 8px rgba(10,20,90,.08);font-size:10.5px;font-weight:600;color:var(--navy);white-space:nowrap}
.tag img{width:14px;height:14px;display:block}
.tag b{color:var(--tq);font-weight:700}
/* ---------- sahne metni ---------- */
.copy{position:absolute;left:28px;top:0;width:560px;height:${H}px}
.sc{position:absolute;left:0;right:0;top:0;bottom:0;padding:94px 0 0;opacity:0;pointer-events:none;transition:opacity .3s}
.sc.is-active{opacity:1;pointer-events:auto}
.sc .k{font-size:9.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--tq6)}
.sc .t{margin:4px 0 0;font-size:26px;line-height:1.1;font-weight:700;letter-spacing:-.01em;color:var(--navy);white-space:nowrap}
.sc .s{margin:7px 0 0;font-size:12px;line-height:1.4;font-weight:500;color:#4b5563;max-width:540px}
.sc .chips{display:flex;flex-wrap:wrap;gap:6px 16px;margin:9px 0 0;padding:0;list-style:none}
.sc .chips li{display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--navy);white-space:nowrap}
.sc .chips li:before{content:'';width:14px;height:14px;border-radius:50%;background:var(--tq0) url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 14 14'><path d='M3.5 7.2 6 9.6l4.5-5' fill='none' stroke='%2300afd2' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/></svg>") center/14px no-repeat;flex:none}
.sc .k,.sc .t,.sc .s,.sc .chips li{opacity:0;transform:translateY(10px)}
.sc.is-active .k{animation:rise .5s var(--ease) .05s both}
.sc.is-active .t{animation:rise .6s var(--ease) .14s both}
.sc.is-active .s{animation:rise .6s var(--ease) .28s both}
.sc.is-active .chips li{animation:rise .5s var(--ease) both}
.sc.is-active .chips li:nth-child(1){animation-delay:.42s}.sc.is-active .chips li:nth-child(2){animation-delay:.52s}.sc.is-active .chips li:nth-child(3){animation-delay:.62s}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes pop{from{opacity:0;transform:scale(.86)}to{opacity:1;transform:scale(1)}}
/* ---------- CTA + telefon (sahnelerde) ---------- */
.cta{position:relative;display:inline-flex;align-items:center;gap:9px;height:40px;padding:0 16px 0 18px;border-radius:8px;overflow:hidden;
  font-size:13.5px;font-weight:700;color:#fff;white-space:nowrap;text-decoration:none;background:var(--tq);
  box-shadow:0 8px 18px rgba(0,175,210,.30);transition:transform .25s var(--ease),background .2s,box-shadow .25s}
.cta:after{content:'';position:absolute;top:-30%;bottom:-30%;left:-40%;width:34%;transform:skewX(-22deg);background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.45),rgba(255,255,255,0));animation:shine 1.1s ease-in-out 3.4s 3 both}
.cta i{display:inline-flex;align-items:center;justify-content:center;width:18px;height:18px;transition:transform .25s var(--ease)}
.cta svg{width:14px;height:14px;display:block}
#ad:hover .cta{background:var(--tq6);transform:translateY(-1px);box-shadow:0 10px 22px rgba(0,175,210,.38)}
#ad:hover .cta i{transform:translateX(3px)}
.bar{position:absolute;left:28px;bottom:17px;display:flex;align-items:center;gap:16px}
.phone{line-height:1.25;white-space:nowrap}
.phone small{display:block;font-size:8.5px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:var(--grey)}
.phone strong{display:block;font-size:13px;font-weight:800;letter-spacing:.02em;color:var(--navy)}
@keyframes shine{from{transform:skewX(-22deg) translateX(0)}to{transform:skewX(-22deg) translateX(520%)}}
/* ---------- kontroller ---------- */
.dots{position:absolute;left:604px;bottom:14px;display:flex;gap:6px;z-index:6}
.dot{width:7px;height:7px;border-radius:50%;border:0;padding:0;background:#c5d8e3;cursor:pointer;transition:background .25s,width .25s}
.dot.is-on{background:var(--tq);width:20px;border-radius:4px}
.dot:hover{background:var(--tq6)}
.arrow{position:absolute;top:50%;width:30px;height:30px;margin-top:-15px;border-radius:50%;border:1px solid #d9e6ee;background:rgba(255,255,255,.92);color:var(--navy);cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s,background .2s,color .2s;z-index:6;padding:0;box-shadow:0 4px 12px rgba(10,20,90,.12)}
.arrow svg{width:12px;height:12px;display:block}
.arrow.prev{left:596px}.arrow.next{right:10px}
.arrow:hover{background:var(--tq);color:#fff;border-color:var(--tq)}
#ad:hover[data-phase=scenes] .arrow{opacity:1}
.progress{position:absolute;left:0;right:0;bottom:0;height:3px;background:#e3edf3;z-index:7}
.progress i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--tq6),var(--tq));transform:scaleX(0);transform-origin:0 50%}
.pausei{position:absolute;right:14px;top:12px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.9);border:1px solid #d9e6ee;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .25s;z-index:7}
.pausei:before,.pausei:after{content:'';width:2px;height:8px;background:var(--navy);margin:0 1.5px;border-radius:1px}
#ad.is-paused .pausei{opacity:1}
/* ---------- açılış ---------- */
.dark{background:linear-gradient(96deg,var(--navy2) 0%,var(--navy) 28%,#0b3f8c 62%,var(--tq) 100%)}
.intro{position:absolute;inset:0;z-index:5;opacity:1;transition:opacity .6s var(--ease);color:#fff}
.intro .glow{position:absolute;right:-60px;top:-80px;width:420px;height:420px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.18),rgba(255,255,255,0))}
.intro .lockup{position:absolute;left:44px;top:50%;transform:translateY(-50%);width:318px;animation:rise .8s var(--ease) .1s both}
.intro .lockup img{width:100%;height:auto;display:block}
.intro .isep{position:absolute;left:392px;top:66px;width:1px;height:118px;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(255,255,255,.55) 30%,rgba(255,255,255,.55) 70%,rgba(255,255,255,0));transform-origin:50% 50%;animation:grow .8s var(--ease) .35s both}
.intro .islogan{position:absolute;left:420px;top:50%;transform:translateY(-50%);width:520px}
.intro .islogan .a{display:block;font-size:12.5px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--tq1);animation:rise .6s var(--ease) .5s both}
.intro .islogan .b{display:block;margin-top:7px;font-size:31px;line-height:1.08;font-weight:700;letter-spacing:-.01em;animation:rise .7s var(--ease) .65s both}
.intro .islogan .c{display:inline-flex;align-items:center;gap:7px;margin-top:12px;height:26px;padding:0 12px 0 8px;border-radius:999px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.35);font-size:11px;font-weight:600;color:#fff;animation:pop .6s var(--pop) .95s both}
.intro .islogan .c img{width:15px;height:15px;display:block}
.intro .islogan .c b{color:#fff;font-weight:800}
@keyframes grow{from{opacity:0;transform:scaleY(0)}to{opacity:1;transform:scaleY(1)}}
#ad:not([data-phase=intro]) .intro{opacity:0;pointer-events:none}
#ad[data-phase=intro] .logo,#ad[data-phase=intro] .tag,#ad[data-phase=intro] .copy,#ad[data-phase=intro] .stage,#ad[data-phase=intro] .dots,#ad[data-phase=intro] .bar{opacity:0}
.logo,.tag,.copy,.stage,.dots,.bar{transition:opacity .5s var(--ease) .15s}
/* ---------- kapanış ---------- */
.outro{position:absolute;inset:0;z-index:5;opacity:0;pointer-events:none;transition:opacity .5s var(--ease);color:#fff}
#ad[data-phase=outro] .outro{opacity:1;pointer-events:auto}
#ad[data-phase=outro] .copy,#ad[data-phase=outro] .stage,#ad[data-phase=outro] .logo,#ad[data-phase=outro] .tag,#ad[data-phase=outro] .bar,#ad[data-phase=outro] .dots{opacity:0}
.outro .glow{position:absolute;right:120px;top:-120px;width:520px;height:520px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.16),rgba(255,255,255,0))}
.outro .ologo{position:absolute;left:28px;top:24px;height:32px}
.outro .ologo img{height:32px;width:auto;display:block}
.outro .ot{position:absolute;left:28px;top:80px;margin:0;font-size:36px;line-height:1;font-weight:800;letter-spacing:-.01em;color:#fff}
.outro .ot2{position:absolute;left:28px;top:124px;margin:0;font-size:16px;font-weight:600;color:var(--tq1)}
.outro .ol{position:absolute;left:28px;top:154px;font-size:11px;font-weight:700;color:#fff;opacity:.9;letter-spacing:.02em}
.outro .obar{position:absolute;left:28px;bottom:22px;display:flex;align-items:center;gap:16px}
.outro .cta{background:#fff;color:var(--navy);box-shadow:0 8px 18px rgba(0,0,0,.18);animation:pulse 2.4s ease-in-out 1s infinite}
.outro .cta:after{display:none}
#ad:hover .outro .cta{background:#fff;color:var(--navy2)}
.outro .phone small{color:var(--tq1)}.outro .phone strong{color:#fff}
.outro .ovis{position:absolute;right:18px;bottom:0;height:240px;width:340px}
.outro .ovis img{position:absolute;right:0;bottom:0;height:240px;width:auto;max-width:340px;object-fit:contain;object-position:right bottom}
.outro .on{position:absolute;right:20px;top:16px;font-size:9.5px;font-weight:600;color:var(--tq1);letter-spacing:.06em}
#ad[data-phase=outro] .ot{animation:rise .6s var(--ease) .15s both}
#ad[data-phase=outro] .ot2{animation:rise .6s var(--ease) .3s both}
#ad[data-phase=outro] .ol{animation:rise .6s var(--ease) .45s both}
#ad[data-phase=outro] .obar{animation:rise .6s var(--ease) .6s both}
#ad[data-phase=outro] .ovis{animation:rise .8s var(--ease) .2s both}
@keyframes pulse{0%,100%{box-shadow:0 8px 18px rgba(0,0,0,.18),0 0 0 0 rgba(255,255,255,.45)}50%{box-shadow:0 10px 22px rgba(0,0,0,.22),0 0 0 9px rgba(255,255,255,0)}}
#ad.is-ended .progress i{transform:scaleX(1)!important}
@media (prefers-reduced-motion:reduce){#ad *{animation-duration:.01s!important;animation-delay:0s!important;transition-duration:.01s!important}}
`;
}

function html(data, assets) {
  const b = data.brand;
  const arrow = `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7h9M8 3.5 11.5 7 8 10.5"/></svg>`;
  const uri = (a) => (a && a.uri) || '';
  const scenes = data.scenes.map((s, i) => `
      <div class="sc" data-i="${i}">
        <div class="k">${esc(s.kicker)}</div>
        <h2 class="t">${esc(s.title)}</h2>
        <p class="s">${esc(s.sub)}</p>
        <ul class="chips">${s.chips.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
      </div>`).join('');
  const photos = data.scenes.map((s, i) => `<div class="ph" data-i="${i}"><img src="${uri(assets.scenes[s.key])}" alt=""></div>`).join('');
  const cta = `<a class="cta" href="${esc(b.url)}" target="_blank" rel="noopener" tabindex="-1">${esc(b.cta)} <i>${arrow}</i></a>`;
  const phone = `<div class="phone"><small>${esc(b.phoneLabel)}</small><strong>${esc(b.phone)}</strong></div>`;
  const tag = (cls) => `<div class="${cls}"><img src="${uri(assets.emblem)}" alt="">${esc(b.taglinePrefix)} <b>${esc(b.tagline)}</b></div>`;
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
  <img class="bgimg" src="${uri(assets.bg)}" alt="" aria-hidden="true">
  <div class="stage">${photos}</div>
  <div class="logo"><img src="${uri(assets.logo)}" alt="${esc(b.name)}"></div>
  ${tag('tag')}
  <div class="copy">${scenes}
  </div>
  <div class="bar">${cta}${phone}</div>
  <button class="arrow prev ctrl" type="button" aria-label="Önceki"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6H2M5.5 2.5 2 6l3.5 3.5"/></svg></button>
  <button class="arrow next ctrl" type="button" aria-label="Sonraki"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6h8M6.5 2.5 10 6l-3.5 3.5"/></svg></button>
  <div class="dots ctrl" role="tablist" aria-label="Sahneler"></div>
  <div class="pausei" aria-hidden="true"></div>
  <div class="intro dark">
    <div class="glow"></div>
    <div class="lockup"><img src="${uri(assets.lockup)}" alt="${esc(b.name)}"></div>
    <div class="isep"></div>
    <div class="islogan"><span class="a">${esc(b.sloganIntro[0])}</span><span class="b">${esc(b.sloganIntro[1])}</span><span class="c"><img src="${uri(assets.emblem)}" alt="">${esc(b.taglinePrefix)} <b>${esc(b.tagline)}</b></span></div>
  </div>
  <div class="outro dark">
    <div class="glow"></div>
    <div class="ologo"><img src="${uri(assets.logoWhite)}" alt="${esc(b.name)}"></div>
    <h2 class="ot">${esc(b.tagline)}</h2>
    <p class="ot2">${esc(b.outroTitle)}</p>
    <div class="ol">${esc(b.outroList)}</div>
    <div class="on">${esc(b.domain)}</div>
    <div class="ovis"><img src="${uri(assets.hero)}" alt=""></div>
    <div class="obar">${cta}${phone}</div>
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
    .replace('__CSS__', css(data.colors, assets.fonts.css, assets.fonts.family))
    .replace('__ENGINE__', ENGINE.replace('__DATA__', engineData));
}
module.exports = { render, W, H };
