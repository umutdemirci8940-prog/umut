'use strict';
/**
 * KFC Türkiye – 970x250 "Kepenkler yeniden açılıyor" interaktif banner şablonu.
 * render({ data, assets }) → tek dosyalık HTML (satır içi CSS + JS; varlıklar data: URI ya da site adresi).
 */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const letters = (s) => [...String(s)].map((ch, i) => (ch === ' ' ? '<span class="sp"> </span>' : `<span class="ch" style="animation-delay:${i * 38}ms">${esc(ch)}</span>`)).join('');

module.exports = function render({ data: D, assets: A }) {
  const C = D.copy, T = D.timing, B = D.brand;
  const HF = A.headFont || 'Anton';
  const TF = A.textFont || 'Inter';
  const prods = (A.products || []).map((p, i) => `
      <div class="prod" style="--x:${p.x}px;--y:${p.y}px;--h:${p.h}px;--d:${p.depth == null ? 1 : p.depth};--r:${p.rot || 0}deg;--dl:${p.delay == null ? i * 170 : p.delay}ms;--fd:${(i * 0.9).toFixed(1)}s" title="${esc(p.name)}">
        <div class="in"><div class="fl"><img src="${p.src}" alt="${esc(p.name)}" draggable="false"></div><span class="lbl">${esc(p.name)}</span></div>
      </div>`).join('');
  const chips = (C.cities || []).map((c) => `<span class="chip" role="button" tabindex="-1">${esc(c)}</span>`).join('');
  const steam = (A.steam || []).map((s) => `<div class="steam" style="--sx:${s.x}px;--sy:${s.y}px"><i></i><i></i><i></i></div>`).join('');
  const bgMedia = `${A.hero ? `<img class="hero${A.video ? '' : ' kb'}" src="${A.hero}" alt="">` : ''}${A.video ? `<video muted autoplay loop playsinline preload="auto"${A.poster ? ` poster="${A.poster}"` : ''}><source src="${A.video}" type="video/mp4"></video>` : ''}`;
  const runtime = { brand: { url: B.url }, timing: T };

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=970,height=250">
<meta name="viewport" content="width=970">
<title>KFC Türkiye – Şubelerimiz yeniden açılıyor (970x250)</title>
<style>
${A.fontCss || ''}
:root{--red:${B.red};--dark:${B.dark};--px:0;--py:0}
html,body{margin:0;padding:0;background:#fff}
#ad{position:relative;width:970px;height:250px;overflow:hidden;overflow:clip;background:#150b0b;cursor:pointer;font-family:'${HF}',Impact,'Arial Narrow',sans-serif;color:#fff;user-select:none;-webkit-user-select:none;outline:none;-webkit-tap-highlight-color:transparent}
#ad *{box-sizing:border-box}
#ad:focus-visible{box-shadow:inset 0 0 0 3px #fff}
.stage{position:absolute;inset:0}
/* Arka plan: sitenin videosu / fotoğrafı */
.bg{position:absolute;inset:0;overflow:hidden;background:#2a0f0f}
.bg img,.bg video{position:absolute;left:50%;top:50%;width:106%;height:106%;object-fit:cover;transform:translate(calc(-50% + var(--px) * -7px),calc(-50% + var(--py) * -5px))}
.bg video{opacity:0;transition:opacity .8s}
.bg video.ok{opacity:1}
.kb{animation:kb 16s ease-in-out infinite alternate}
@keyframes kb{from{width:106%;height:106%}to{width:118%;height:118%}}
.tint{position:absolute;inset:0;background:linear-gradient(90deg,rgba(22,7,7,.97) 0,rgba(22,7,7,.93) 270px,rgba(22,7,7,.6) 450px,rgba(22,7,7,.16) 640px,rgba(22,7,7,.2) 100%)}
.glow{position:absolute;inset:0;background:radial-gradient(560px 280px at 4% 96%,rgba(228,0,43,.55),transparent 66%),radial-gradient(420px 220px at 100% 0%,rgba(255,150,40,.2),transparent 60%);mix-blend-mode:screen}
.vig{position:absolute;inset:0;box-shadow:inset 0 0 90px rgba(0,0,0,.55)}
/* Ürünler (sitedeki gerçek fotoğraflar) */
.food{position:absolute;inset:0;z-index:3}
.prod{position:absolute;left:var(--x);top:var(--y);height:var(--h);transform:translate(calc(var(--px) * var(--d) * 11px),calc(var(--py) * var(--d) * 7px));will-change:transform}
.prod .in{position:relative;height:100%;opacity:0;transform:translateX(260px) rotate(12deg) scale(.6)}
.show-prod .prod .in{animation:flyin .95s cubic-bezier(.2,1.25,.35,1) var(--dl) both}
@keyframes flyin{to{opacity:1;transform:none}}
.prod .fl{height:100%;animation:float 4.6s ease-in-out var(--fd) infinite}
@keyframes float{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-7px) rotate(var(--r))}}
.prod img{height:100%;width:auto;display:block;filter:drop-shadow(0 22px 22px rgba(0,0,0,.6));transition:transform .35s cubic-bezier(.2,1.2,.4,1),filter .35s}
.prod:hover img{transform:scale(1.09);filter:drop-shadow(0 26px 26px rgba(0,0,0,.65)) brightness(1.06)}
.prod .lbl{position:absolute;left:50%;bottom:-4px;transform:translate(-50%,10px);background:#fff;color:#111;font:800 12px/1 '${TF}',Arial,sans-serif;padding:7px 11px;border-radius:20px;opacity:0;transition:.25s;white-space:nowrap;box-shadow:0 6px 14px rgba(0,0,0,.45);pointer-events:none}
.prod:hover .lbl{opacity:1;transform:translate(-50%,0)}
/* Buhar */
.steam{position:absolute;left:var(--sx);top:var(--sy);width:130px;height:150px;pointer-events:none;z-index:2;filter:url(#haze);opacity:0;transition:opacity 1.2s .4s}
.show-prod .steam{opacity:1}
.steam i{position:absolute;bottom:0;left:24px;width:72px;height:120px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.3),rgba(255,255,255,0));filter:blur(7px);opacity:0;animation:rise 3.6s ease-out infinite}
.steam i:nth-child(2){left:0;width:60px;animation-delay:1.2s}
.steam i:nth-child(3){left:50px;width:56px;animation-delay:2.4s}
@keyframes rise{0%{opacity:0;transform:translateY(24px) scale(.7)}25%{opacity:1}100%{opacity:0;transform:translateY(-120px) scale(1.5)}}
/* Metin sütunu */
.txt{position:absolute;left:24px;top:16px;width:400px;z-index:4}
.logo{height:42px;width:auto;display:block;opacity:0}
.show-head .logo{animation:fade .6s ease-out both}
.kicker{margin-top:9px;font:400 15px/1 '${HF}',Impact,sans-serif;letter-spacing:4px;color:#ffd0d8;opacity:0}
.show-head .kicker{animation:fade .5s .22s ease-out both}
.head{font:400 42px/1 '${HF}',Impact,sans-serif;letter-spacing:1px;margin-top:5px;white-space:nowrap;text-shadow:0 4px 18px rgba(0,0,0,.55)}
.ch{display:inline-block;opacity:0;transform:translateY(30px) scale(.6) rotate(8deg)}
.show-head .ch{animation:pop .55s cubic-bezier(.2,1.3,.4,1) both}
.sp{display:inline-block;width:.3em}
@keyframes pop{to{opacity:1;transform:none}}
@keyframes fade{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:none}}
.sub{margin-top:9px;font:600 14px/1.25 '${TF}',Arial,sans-serif;color:#fff;opacity:0;transform:translateY(8px)}
.show-sub .sub{animation:up .5s ease-out both}
@keyframes up{to{opacity:1;transform:none}}
/* Şehirler + CTA */
.row{position:absolute;left:24px;bottom:16px;display:flex;align-items:center;gap:8px;z-index:6}
.cities{display:flex;align-items:center;gap:6px;opacity:0;transform:translateY(8px)}
.show-cta .cities{animation:up .5s ease-out both}
.cl{font:800 10px/1 '${TF}',Arial,sans-serif;letter-spacing:.8px;color:rgba(255,255,255,.72);margin-right:2px;text-transform:uppercase}
.chip{position:relative;padding:7px 11px 7px 21px;border:1px solid rgba(255,255,255,.42);border-radius:20px;font:600 12px/1 '${TF}',Arial,sans-serif;color:#fff;transition:.25s;background:rgba(255,255,255,.07);backdrop-filter:blur(3px)}
.chip::before{content:'';position:absolute;left:9px;top:50%;width:7px;height:7px;margin-top:-3.5px;border-radius:50%;background:#fff;opacity:.6;transition:.25s}
.chip.on,.chip:hover{background:#fff;color:var(--red);border-color:#fff;transform:translateY(-2px);box-shadow:0 6px 14px rgba(0,0,0,.35)}
.chip.on::before,.chip:hover::before{background:var(--red);opacity:1;animation:ping 1.2s ease-out infinite}
@keyframes ping{0%{box-shadow:0 0 0 0 rgba(228,0,43,.6)}100%{box-shadow:0 0 0 8px rgba(228,0,43,0)}}
.ctaw{margin-left:8px;opacity:0;transform:scale(.7)}
.show-cta .ctaw{animation:ctain .6s cubic-bezier(.2,1.3,.4,1) .25s both}
@keyframes ctain{to{opacity:1;transform:none}}
.cta{position:relative;overflow:hidden;display:inline-block;padding:11px 18px;border-radius:24px;background:var(--red);color:#fff;font:800 14px/1 '${TF}',Arial,sans-serif;white-space:nowrap;box-shadow:0 8px 22px rgba(228,0,43,.45);transition:transform .25s,box-shadow .25s}
.cta::after{content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-20deg);animation:sheen 2.8s ease-in-out 1s infinite}
@keyframes sheen{0%{left:-60%}35%,100%{left:140%}}
#ad:hover .cta{transform:scale(1.05);box-shadow:0 10px 28px rgba(228,0,43,.65)}
.cta i{font-style:normal;display:inline-block;margin-left:7px;transition:transform .25s}
#ad:hover .cta i{transform:translateX(4px)}
/* Damga */
.stamp{position:absolute;right:34px;top:22px;padding:6px 14px 5px;border:4px solid #fff;border-radius:8px;font:400 30px/1 '${HF}',Impact,sans-serif;letter-spacing:2px;text-transform:uppercase;color:#fff;background:rgba(228,0,43,.94);box-shadow:inset 0 0 0 2px var(--red),0 8px 24px rgba(0,0,0,.45);opacity:0;transform:rotate(-8deg) scale(3);z-index:5;pointer-events:none;white-space:nowrap}
.stamp::after{content:'';position:absolute;inset:3px;border:1px dashed rgba(255,255,255,.55);border-radius:5px}
.show-stamp .stamp{animation:slam .6s cubic-bezier(.2,.9,.3,1.3) both}
@keyframes slam{0%{opacity:0;transform:rotate(-8deg) scale(3)}55%{opacity:1;transform:rotate(-8deg) scale(.92)}75%{transform:rotate(-8deg) scale(1.06)}100%{opacity:1;transform:rotate(-8deg) scale(1)}}
.dust{position:absolute;right:40px;top:0;width:280px;height:110px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.75),transparent);opacity:0;pointer-events:none;z-index:4}
.show-stamp .dust{animation:dust .7s ease-out .3s both}
@keyframes dust{0%{opacity:.9;transform:scale(.3)}100%{opacity:0;transform:scale(1.7)}}
/* Açılış parlaması + sarsıntı */
.flash{position:absolute;inset:0;z-index:8;pointer-events:none;opacity:0;background:radial-gradient(70% 150% at 50% 112%,rgba(255,236,190,.95),rgba(255,120,60,.35) 45%,transparent 70%)}
.reveal .flash{animation:flash 1.3s ease-out both}
@keyframes flash{0%{opacity:0}18%{opacity:1}100%{opacity:0}}
.shake .stage{animation:shake .5s}
@keyframes shake{0%,100%{transform:translate(0,0)}20%{transform:translate(-2px,1px)}40%{transform:translate(2px,-1px)}60%{transform:translate(-1px,2px)}80%{transform:translate(1px,-2px)}}
/* Kepenk */
.shutter{position:absolute;inset:0;z-index:9;touch-action:none}
.open .shutter{pointer-events:none}
.closing .shutter{pointer-events:auto}
.slats{position:absolute;left:0;right:0;top:0;height:100%;background:repeating-linear-gradient(180deg,#a4a9ae 0 2px,#dcdfe2 2px 5px,#bfc4c8 5px 10px,#878d93 10px 13px,#54595f 13px 14px);transition:transform 1.35s cubic-bezier(.35,.75,.25,1.03);will-change:transform}
.slats::before{content:'';position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.5),rgba(255,255,255,.14) 26%,rgba(255,255,255,0) 50%,rgba(0,0,0,.22) 76%,rgba(0,0,0,.58)),repeating-linear-gradient(90deg,transparent 0 97px,rgba(0,0,0,.09) 97px 98px)}
.open .slats{transform:translateY(-104%)!important}
.closing .slats{transition-duration:1.05s;transition-timing-function:cubic-bezier(.65,0,.85,.35);transform:translateY(0)!important}
.roller{position:absolute;left:0;right:0;top:0;height:16px;background:linear-gradient(#5a6066,#a0a6ac 45%,#2a2f34);box-shadow:0 4px 12px rgba(0,0,0,.6);z-index:3;transition:transform .3s}
.open .roller{transform:translateY(-100%);transition:transform .6s .95s}
.closing .roller{transform:none;transition:transform .3s}
.paint{position:absolute;left:50%;top:50%;height:118px;width:auto;transform:translate(-50%,-52%);opacity:.6;mix-blend-mode:multiply;filter:contrast(1.05) saturate(.85);pointer-events:none}
.paint-txt{position:absolute;left:0;right:0;top:0;text-align:center;font:400 22px/1 '${HF}',Impact,sans-serif;letter-spacing:6px;color:rgba(80,0,10,.55);mix-blend-mode:multiply;pointer-events:none}
.sign{position:absolute;left:50%;top:30px;width:156px;height:66px;margin-left:-78px;transform-origin:50% -26px;animation:swing 2.6s ease-in-out infinite;perspective:600px}
.sign::before,.sign::after{content:'';position:absolute;top:-26px;left:36px;width:2px;height:30px;background:#2e3236;transform:rotate(20deg);transform-origin:top}
.sign::after{left:118px;transform:rotate(-20deg)}
.card{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .75s cubic-bezier(.4,0,.2,1)}
.flip .card{transform:rotateX(180deg)}
.face{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:8px;border:3px solid #fff;font:400 30px/1 '${HF}',Impact,sans-serif;letter-spacing:3px;color:#fff;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-shadow:0 8px 18px rgba(0,0,0,.5)}
.f1{background:#2a2c2f}
.f2{background:var(--red);transform:rotateX(180deg)}
@keyframes swing{0%,100%{transform:rotate(-2.5deg)}50%{transform:rotate(2.5deg)}}
.handle{position:absolute;left:50%;bottom:9px;width:190px;height:30px;margin-left:-95px;border-radius:15px;background:linear-gradient(#f3f5f7,#9aa1a7);box-shadow:0 2px 0 #3a3f44,0 6px 14px rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;gap:7px;font:700 12px/1 '${TF}',Arial,sans-serif;color:#1d2226;animation:nudge 1.4s ease-in-out infinite;cursor:grab}
.handle b{font-size:14px}
@keyframes nudge{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.open .handle,.closing .handle{animation:none}
/* Tekrar */
.replay{position:absolute;right:10px;bottom:10px;height:30px;padding:0 12px 0 10px;border-radius:15px;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.45);color:#fff;display:none;align-items:center;gap:6px;font:600 11px/1 '${TF}',Arial,sans-serif;z-index:10;backdrop-filter:blur(3px)}
.replay:hover{background:var(--red);border-color:var(--red)}
.ended .replay{display:flex}
.rm *{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important}
</style>
</head>
<body>
<div id="ad" role="link" tabindex="0" aria-label="${esc(C.aria)}">
  <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="haze" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="3"><animate attributeName="baseFrequency" dur="7s" values="0.012 0.03;0.016 0.036;0.012 0.03" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
  <div class="stage">
    <div class="bg">${bgMedia}<div class="tint"></div><div class="glow"></div><div class="vig"></div></div>
    <div class="food">${steam}${prods}</div>
    <div class="dust"></div>
    <div class="stamp">${esc(C.stamp)}</div>
    <div class="txt">
      ${A.logo ? `<img class="logo" src="${A.logo}" alt="KFC">` : ''}
      <div class="kicker">${esc(C.kicker)}</div>
      <div class="head">${letters(C.headline)}</div>
      <div class="sub">${esc(C.sub)}</div>
    </div>
    <div class="row">
      <div class="cities"><span class="cl">${esc(C.citiesLabel)}</span>${chips}</div>
      <div class="ctaw"><span class="cta">${esc(C.cta)}<i>→</i></span></div>
    </div>
  </div>
  <div class="flash"></div>
  <div class="shutter">
    <div class="slats">
      ${A.logo ? `<img class="paint" src="${A.logo}" alt="">` : `<div class="paint-txt" style="top:50%;margin-top:-11px">KFC</div>`}
      <div class="sign"><div class="card"><div class="face f1">${esc(C.closed)}</div><div class="face f2">${esc(C.open)}</div></div></div>
      <div class="handle"><b>↑</b>${esc(C.handleHint)}</div>
    </div>
    <div class="roller"></div>
  </div>
  <div class="replay" role="button">↻ ${esc(C.replay)}</div>
</div>
<script>
(function(){
var D=${JSON.stringify(runtime)},T=D.timing;
var ad=document.getElementById('ad'),sh=ad.querySelector('.shutter'),slats=ad.querySelector('.slats'),vid=ad.querySelector('video');
var timers=[],loops=0,opened=false,drag=null;
var CLS=['open','flip','reveal','shake','show-head','show-stamp','show-prod','show-sub','show-cta','closing','ended'];
function after(ms,fn){var id=setTimeout(fn,Math.max(0,ms));timers.push(id);return id}
function clearAll(){for(var i=0;i<timers.length;i++){clearTimeout(timers[i])}timers=[]}
function reset(){clearAll();for(var i=0;i<CLS.length;i++)ad.classList.remove(CLS[i]);slats.style.transition='';slats.style.transform='';void ad.offsetWidth;opened=false}
function start(){reset();play();after(420,function(){ad.classList.add('flip')});after(T.shutterOpen+T.autoOpenWait,openShutter)}
function openShutter(){if(opened)return;opened=true;slats.style.transition='';slats.style.transform='';ad.classList.add('flip');ad.classList.add('open');play();
  var o=T.shutterOpen;
  after(450,function(){ad.classList.add('reveal')});
  after(1250,function(){ad.classList.add('shake');after(600,function(){ad.classList.remove('shake')})});
  after(T.headline-o,function(){ad.classList.add('show-head')});
  after(T.stamp-o,function(){ad.classList.add('show-stamp')});
  after(T.products-o,function(){ad.classList.add('show-prod')});
  after(T.sub-o,function(){ad.classList.add('show-sub')});
  after(T.cta-o,function(){ad.classList.add('show-cta');cycleCities()});
  after(T.cta-o+T.hold,function(){loops++;if(loops>=T.loops){ad.classList.add('ended');return}ad.classList.add('closing');after(1250,start)});
}
/* Şehir çipleri */
var chips=[].slice.call(ad.querySelectorAll('.chip')),ci=0,hold=0;
function setCity(i){ci=(i+chips.length)%chips.length;for(var k=0;k<chips.length;k++)chips[k].classList.toggle('on',k===ci)}
function cycleCities(){setCity(0);var iv=setInterval(function(){if(Date.now()<hold)return;setCity(ci+1)},1700);timers.push(iv)}
chips.forEach(function(c,k){c.addEventListener('pointerenter',function(){setCity(k);hold=Date.now()+3000})});
/* Paralaks */
var tx=0,ty=0,cx=0,cy=0,raf=null;
function tick(){if(raf)return;raf=requestAnimationFrame(function(){raf=null;cx+=(tx-cx)*.12;cy+=(ty-cy)*.12;ad.style.setProperty('--px',cx.toFixed(3));ad.style.setProperty('--py',cy.toFixed(3));if(Math.abs(tx-cx)>.002||Math.abs(ty-cy)>.002)tick()})}
ad.addEventListener('pointermove',function(e){var r=ad.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*2;ty=((e.clientY-r.top)/r.height-.5)*2;tick()});
ad.addEventListener('pointerleave',function(){tx=0;ty=0;tick()});
/* Kepengi sürükleyerek açma */
sh.addEventListener('pointerdown',function(e){if(opened||ad.classList.contains('closing'))return;drag={y:e.clientY,m:0};slats.style.transition='none';if(sh.setPointerCapture)try{sh.setPointerCapture(e.pointerId)}catch(x){}e.preventDefault()});
sh.addEventListener('pointermove',function(e){if(!drag)return;var dy=Math.min(0,e.clientY-drag.y);drag.m=-dy;slats.style.transform='translateY('+dy+'px)'});
function endDrag(){if(!drag)return;var m=drag.m;drag=null;slats.style.transition='';if(m>60||m<6){openShutter()}else{slats.style.transform=''}}
sh.addEventListener('pointerup',endDrag);sh.addEventListener('pointercancel',endDrag);
/* Video */
function play(){if(!vid)return;var p=vid.play();if(p&&p.catch)p.catch(function(){})}
if(vid){vid.addEventListener('playing',function(){vid.classList.add('ok')});vid.addEventListener('error',function(){vid.classList.remove('ok')},true)}
document.addEventListener('pointerdown',play,{once:true});
/* Tıklama */
function openLink(){var u=window.clickTag||D.brand.url;if(window.Enabler&&window.Enabler.exit){window.Enabler.exit('CTA')}else{window.open(u,'_blank','noopener')}}
ad.addEventListener('click',function(e){var t=e.target;if(t.closest&&(t.closest('.shutter')||t.closest('.replay')))return;openLink()});
ad.querySelector('.replay').addEventListener('click',function(e){e.stopPropagation();loops=0;start()});
ad.addEventListener('keydown',function(e){if(e.key==='Enter'){openLink()}else if(e.key===' '){e.preventDefault();if(!opened)openShutter()}else if(e.key==='ArrowRight'){setCity(ci+1);hold=Date.now()+3000}else if(e.key==='ArrowLeft'){setCity(ci-1);hold=Date.now()+3000}});
var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(rm){ad.classList.add('rm');['open','flip','show-head','show-stamp','show-prod','show-sub','show-cta','ended'].forEach(function(c){ad.classList.add(c)});setCity(0);play()}else{start()}
window.__kfc={start:start,open:openShutter,setCity:setCity,state:function(){return{loops:loops,opened:opened,cls:ad.className}}};
})();
</script>
</body>
</html>`;
};
