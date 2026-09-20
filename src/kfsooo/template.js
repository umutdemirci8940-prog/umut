'use strict';
/** KFC Türkiye – KFSOOO Menüler / Yeni Çifte Cruncher Menü – 970x250 interaktif banner şablonu */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const letters = (s) => [...String(s)].map((ch, i) => (ch === ' ' ? '<span class="sp"> </span>' : `<span class="ch" style="animation-delay:${i * 30}ms">${esc(ch)}</span>`)).join('');
const seeded = (n) => { let x = 12345; return Array.from({ length: n }, () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }); };

module.exports = function render({ data: D, assets: A }) {
  const C = D.copy, T = D.timing, B = D.brand, P = D.photo;
  const HF = 'National 2 Condensed', TF = 'National 2';
  const S = 1100 / 1200; // photo.jpg 1100 px; beats 1200 tabanlı
  const scale = P.width / 1100; // banner px / photo px
  const pan = (kvY) => -(kvY * S * scale); // KV piksel → translateY
  const rnd = seeded(60);
  const sparks = Array.from({ length: 16 }, (_, i) => `<i class="spk" style="left:${(320 + rnd[i * 3] * 600).toFixed(0)}px;top:${(10 + rnd[i * 3 + 1] * 225).toFixed(0)}px;--d:${(2.4 + rnd[i * 3 + 2] * 3).toFixed(1)}s;--dl:${(rnd[i] * 4).toFixed(1)}s;--s:${(0.6 + rnd[i + 1] * 0.9).toFixed(2)}"></i>`).join('');
  const digit = (k) => `<span class="d" data-k="${k}"><span>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<b>${n}</b>`).join('')}</span></span>`;
  const runtime = { url: B.url, t: T, per: C.perPrice, total: C.totalPrice, perLabel: C.perLabel, totalLabel: C.totalLabel, perSub: C.perSub, totalSub: C.totalSub, pan: { top: pan(P.beats.top), faces: pan(P.beats.faces), tray: pan(P.beats.tray) } };

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=970,height=250">
<meta name="viewport" content="width=970">
<title>KFC – KFSOOO Menüler: Yeni Çifte Cruncher Menü (970x250)</title>
<style>
${A.fontCss}
:root{--red:${B.red};--px:0;--py:0;--sy:0}
html,body{margin:0;padding:0;background:#fff}
#ad{position:relative;width:970px;height:250px;overflow:hidden;overflow:clip;background:#1a0606;cursor:pointer;font-family:'${TF}',Arial,sans-serif;color:#fff;user-select:none;-webkit-user-select:none;outline:none;-webkit-tap-highlight-color:transparent}
#ad *{box-sizing:border-box}
#ad:focus-visible{box-shadow:inset 0 0 0 3px #fff}
.stage{position:absolute;inset:0;transition:opacity .5s}
.out .stage{opacity:0}
.bg{position:absolute;left:-20px;top:-20px;width:1010px;height:290px;object-fit:cover;transform:translate(calc(var(--px) * 6px),calc(var(--py) * 4px))}
/* Fotoğraf: zaman çizelgesi (pan) + fare (scrub) */
.pan{position:absolute;left:${P.left}px;top:0;width:${P.width}px;height:${P.width}px;transform:translateY(${pan(P.beats.top)}px);transition:transform 1.7s cubic-bezier(.45,.05,.2,1);will-change:transform}
.scrub{width:100%;height:100%;transform:translate(calc(var(--px) * -9px),calc(var(--sy) * -34px))}
.scrub img{display:block;width:100%;height:100%}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(26,6,6,1) 0,rgba(26,6,6,1) 350px,rgba(26,6,6,0) 445px,rgba(26,6,6,0) 640px,rgba(26,6,6,.8) 760px,rgba(26,6,6,.96) 100%),linear-gradient(180deg,rgba(0,0,0,.25),transparent 25%,transparent 75%,rgba(0,0,0,.45))}
.sparks{position:absolute;inset:0;pointer-events:none}
.spk{position:absolute;width:3px;height:3px;border-radius:50%;background:#ffe2b0;box-shadow:0 0 6px 2px rgba(255,130,60,.55);opacity:0;animation:tw var(--d) ease-in-out var(--dl) infinite}
@keyframes tw{0%,100%{opacity:0;transform:scale(.3)}50%{opacity:.95;transform:scale(var(--s))}}
/* Sol sütun */
.left{position:absolute;left:22px;top:0;width:330px;height:250px;z-index:4}
.sticker{position:absolute;left:-4px;top:14px;width:300px;opacity:0;transform-origin:50% 50%;filter:drop-shadow(0 8px 16px rgba(0,0,0,.55));transition:transform .3s}
.sticker img{display:block;width:100%;height:auto}
.show-sticker .sticker{animation:slap .7s cubic-bezier(.2,.9,.3,1.25) both}
@keyframes slap{0%{opacity:0;transform:rotate(-16deg) scale(2) translateY(-30px)}55%{opacity:1;transform:rotate(-2deg) scale(.95)}78%{transform:rotate(-5deg) scale(1.03)}100%{opacity:1;transform:rotate(-4deg) scale(1)}}
.sticker:hover{animation:wiggle .55s ease-in-out}
@keyframes wiggle{0%,100%{transform:rotate(-4deg)}25%{transform:rotate(-1deg) scale(1.03)}50%{transform:rotate(-7deg)}75%{transform:rotate(-2deg)}}
.gloss{position:absolute;inset:0;pointer-events:none;-webkit-mask:url(${A.sticker}) center/100% 100% no-repeat;mask:url(${A.sticker}) center/100% 100% no-repeat;background:linear-gradient(112deg,transparent 35%,rgba(228,0,43,.28) 48%,rgba(255,200,200,.5) 52%,transparent 65%);background-size:260% 100%;background-repeat:no-repeat;animation:gl 3.4s ease-in-out 1.6s infinite}
@keyframes gl{0%{background-position:130% 0}45%,100%{background-position:-130% 0}}
.line1{position:absolute;left:2px;top:112px;white-space:nowrap}
.yeni{display:inline-block;vertical-align:top;margin:5px 8px 0 0;padding:4px 8px 3px;border-radius:5px;background:var(--red);color:#fff;font:400 15px/1 '${HF}',Impact,sans-serif;letter-spacing:1px;opacity:0;transform:scale(.4) rotate(-10deg);position:relative}
.show-title .yeni{animation:pop .5s cubic-bezier(.2,1.4,.4,1) both}
.yeni::after{content:'';position:absolute;inset:-3px;border-radius:7px;border:2px solid var(--red);opacity:0}
.show-title .yeni::after{animation:ring 2.2s ease-out .6s infinite}
@keyframes ring{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}
.ttl{display:inline-block;vertical-align:top;font:400 32px/1 '${HF}',Impact,sans-serif;letter-spacing:.5px;color:#fff;text-shadow:-2px -2px 0 #140404,2px -2px 0 #140404,-2px 2px 0 #140404,2px 2px 0 #140404,0 -2px 0 #140404,0 2px 0 #140404,-2px 0 0 #140404,2px 0 0 #140404,0 6px 14px rgba(0,0,0,.5)}
.ch{display:inline-block;opacity:0;transform:translateY(22px) scale(.7) rotate(6deg)}
.show-title .ch{animation:pop .5s cubic-bezier(.2,1.3,.4,1) both}
.sp{display:inline-block}
.ttl .sp{width:.28em}
@keyframes pop{to{opacity:1;transform:none}}
.ctarow{position:absolute;left:2px;top:186px;display:flex;align-items:center;gap:8px}
.ctaw{opacity:0;transform:scale(.7)}
.show-cta .ctaw{animation:ctain .55s cubic-bezier(.2,1.3,.4,1) both}
@keyframes ctain{to{opacity:1;transform:none}}
.cta{position:relative;overflow:hidden;display:inline-block;padding:11px 18px;border-radius:24px;background:var(--red);color:#fff;font:700 14px/1 '${TF}',Arial,sans-serif;white-space:nowrap;box-shadow:0 8px 22px rgba(228,0,43,.45);transition:transform .25s,box-shadow .25s}
.cta::after{content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-20deg);animation:sheen 2.8s ease-in-out 1s infinite}
@keyframes sheen{0%{left:-60%}35%,100%{left:140%}}
#ad:hover .cta{transform:scale(1.05);box-shadow:0 10px 28px rgba(228,0,43,.65)}
.cta i{font-style:normal;display:inline-block;margin-left:7px;transition:transform .25s}
#ad:hover .cta i{transform:translateX(4px)}
.info{width:26px;height:26px;border-radius:50%;border:1.5px solid rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;font:700 13px/1 Georgia,serif;font-style:italic;color:#fff;opacity:0;transition:background .25s,border-color .25s}
.show-cta .info{animation:ctain .5s .15s both}
.info:hover,.legal-open .info{background:#fff;color:var(--red);border-color:#fff}
/* Sağ sütun: fiyat */
.right{position:absolute;right:20px;top:0;width:250px;height:250px;z-index:4;text-align:right;transform:translateX(calc(var(--px) * 4px))}
.toggle{position:absolute;right:0;top:15px;display:flex;gap:4px;opacity:0;transform:translateY(-8px)}
.show-price .toggle{animation:down .5s ease-out both}
@keyframes down{to{opacity:1;transform:none}}
.tg{padding:6px 10px;border-radius:14px;border:1px solid rgba(255,255,255,.4);font:700 11px/1 '${TF}',Arial,sans-serif;color:#fff;background:rgba(255,255,255,.08);transition:.25s;backdrop-filter:blur(3px)}
.tg.on{background:#fff;color:var(--red);border-color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.35)}
.tg:hover{transform:translateY(-2px)}
.price{position:absolute;right:0;top:44px;height:76px;white-space:nowrap;opacity:0;transform:translateX(30px)}
.show-price .price{animation:pin .6s cubic-bezier(.2,1.2,.4,1) both}
@keyframes pin{to{opacity:1;transform:none}}
.d{display:inline-block;height:76px;overflow:hidden;vertical-align:top;transition:width .6s cubic-bezier(.2,.8,.2,1);text-align:center;font:400 84px/76px '${HF}',Impact,sans-serif;color:#fff;-webkit-text-stroke:2.5px #140404;paint-order:stroke fill;text-shadow:0 8px 18px rgba(0,0,0,.5)}
.d>span{display:block;transition:transform .9s cubic-bezier(.2,.8,.2,1)}
.d b{display:block;height:76px;font-weight:400;width:max-content;margin:0 auto}
.tl{display:inline-block;vertical-align:top;margin:8px 0 0 4px;font:400 34px/1 '${HF}',Impact,sans-serif;color:#fff;-webkit-text-stroke:1.5px #140404;paint-order:stroke fill}
.plabel{position:absolute;right:2px;top:126px;font:700 13px/1 '${TF}',Arial,sans-serif;color:#fff;letter-spacing:.3px;opacity:0;transform:translateY(6px)}
.show-price .plabel{animation:down .5s .2s ease-out both}
.plabel b{color:#ffd0d8}
.psub{position:absolute;right:2px;top:146px;font:500 12px/1 '${TF}',Arial,sans-serif;color:rgba(255,255,255,.85);opacity:0;transform:translateY(6px)}
.show-sub .psub{animation:down .5s ease-out both}
.psub b{color:#fff;font-weight:700}
.avs{position:absolute;right:0;top:168px;height:44px;display:flex;flex-direction:row-reverse;align-items:center}
.av{width:44px;height:44px;border-radius:50%;border:2px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.45);opacity:0;transform:scale(.3);transition:margin .5s cubic-bezier(.2,1.2,.4,1)}
.show-sub .av{animation:pop .5s cubic-bezier(.2,1.4,.4,1) both}
.show-sub .av.b{animation-delay:.15s}
.av.b{margin-right:-14px}
.avs.two .av.b{margin-right:0}
.plus{display:inline-block;margin:0 6px;font:700 16px/1 '${TF}',Arial,sans-serif;color:#fff;opacity:0;transform:scale(.4);transition:.3s;width:0;overflow:hidden}
.avs.two .plus{opacity:1;transform:none;width:auto}
.x2{margin-right:8px;font:400 15px/1 '${HF}',Impact,sans-serif;color:#ffd0d8;letter-spacing:.5px;opacity:0;transform:translateX(8px);transition:.35s}
.show-sub .x2{opacity:1;transform:none}
.avs.two .x2{opacity:0;transform:translateX(8px)}
.cola{position:absolute;right:2px;top:222px;height:22px;opacity:0}
.show-cta .cola{animation:down .6s .2s ease-out both}
/* Yasal şerit + tam metin */
.legal{position:absolute;left:0;right:0;bottom:0;height:15px;padding:0 10px 0 22px;background:rgba(10,2,2,.72);font:400 8px/15px Arial,Helvetica,sans-serif;color:rgba(255,255,255,.85);white-space:nowrap;overflow:hidden;z-index:5;opacity:0}
.show-cta .legal{animation:down .5s .3s ease-out both}
.legalbox{position:absolute;left:0;right:0;bottom:0;padding:12px 44px 14px 22px;background:rgba(14,3,3,.97);color:#fff;font:500 10.5px/1.4 '${TF}',Arial,sans-serif;transform:translateY(102%);transition:transform .45s cubic-bezier(.2,.9,.3,1);z-index:9;cursor:default;border-top:1px solid rgba(255,255,255,.15)}
.legalbox b{display:block;font:400 14px/1 '${HF}',Impact,sans-serif;letter-spacing:1px;margin-bottom:6px;color:#ffd0d8}
.legalbox .x{position:absolute;right:12px;top:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font:700 12px/1 Arial,sans-serif;cursor:pointer}
.legalbox .x:hover{background:var(--red)}
.legal-open .legalbox{transform:none}
/* Tekrar */
.replay{position:absolute;right:14px;top:14px;height:28px;padding:0 12px 0 10px;border-radius:14px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.45);color:#fff;display:none;align-items:center;gap:6px;font:700 11px/1 '${TF}',Arial,sans-serif;z-index:10}
.replay:hover{background:var(--red);border-color:var(--red)}
.ended .replay{display:flex}
.ended .toggle{top:48px}
.ended .price{top:78px}.ended .plabel{top:160px}.ended .psub{display:none}.ended .avs{display:none}
.rm *{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important}
</style>
</head>
<body>
<div id="ad" role="link" tabindex="0" aria-label="${esc(C.aria)}">
  <div class="stage">
    <img class="bg" src="${A.bg}" alt="">
    <div class="pan"><div class="scrub"><img src="${A.photo}" alt="KFC KFSOOO Menüler – Yeni Çifte Cruncher Menü" draggable="false"></div></div>
    <div class="shade"></div>
    <div class="sparks">${sparks}</div>
    <div class="left">
      <div class="sticker"><img src="${A.sticker}" alt="KFSOOO Menüler" draggable="false"><i class="gloss"></i></div>
      <div class="line1"><span class="yeni">${esc(C.yeni)}</span><span class="ttl">${letters(C.title)}</span></div>
      <div class="ctarow"><div class="ctaw"><span class="cta">${esc(C.cta)}<i>→</i></span></div><span class="info" role="button" aria-label="${esc(C.infoLabel)}" title="${esc(C.infoLabel)}">i</span></div>
    </div>
    <div class="right">
      <div class="toggle"><span class="tg on" role="button" data-m="0">${esc(C.perLabel)}</span><span class="tg" role="button" data-m="1">${esc(C.totalLabel)}</span></div>
      <div class="price">${digit(0)}${digit(1)}${digit(2)}<span class="tl">TL</span></div>
      <div class="plabel"><b>${esc(C.perLabel)}</b></div>
      <div class="psub">${C.perSub}</div>
      <div class="avs"><img class="av a" src="${A.avatarA}" alt=""><span class="plus">+</span><img class="av b" src="${A.avatarB}" alt=""><span class="x2">× 2 KİŞİ</span></div>
      <img class="cola" src="${A.cola}" alt="Coca-Cola">
    </div>
    <div class="legal">${esc(C.legalStrip)}</div>
  </div>
  <div class="legalbox"><b>${esc(C.infoLabel).toUpperCase()}</b>${esc(C.legalFull)}<span class="x" role="button" aria-label="Kapat">×</span></div>
  <div class="replay" role="button">↻ ${esc(C.replay)}</div>
</div>
<script>
(function(){
var D=${JSON.stringify(runtime)},T=D.t;
var ad=document.getElementById('ad'),panEl=ad.querySelector('.pan'),digits=[].slice.call(ad.querySelectorAll('.d>span')),tgs=[].slice.call(ad.querySelectorAll('.tg')),plabel=ad.querySelector('.plabel b'),psub=ad.querySelector('.psub'),avs=ad.querySelector('.avs'),legalbox=ad.querySelector('.legalbox'),info=ad.querySelector('.info');
var timers=[],loops=0,mode=0,hold=0;
var CLS=['show-sticker','show-title','show-price','show-sub','show-cta','out','ended','legal-open'];
function after(ms,fn){var id=setTimeout(fn,Math.max(0,ms));timers.push(id);return id}
function clearAll(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);timers=[]}
function setPan(y){panEl.style.transform='translateY('+y+'px)'}
var DW=[];function measure(){DW=[];var bs=digits[0].querySelectorAll('b');for(var i=0;i<10;i++){DW.push(bs[i].getBoundingClientRect().width)}}
function setDigits(n){measure();var s=('000'+n).slice(-3);for(var i=0;i<3;i++){digits[i].style.transitionDelay=(i*110)+'ms';digits[i].style.transform='translateY('+(-(+s[i])*76)+'px)';digits[i].parentNode.style.width=(DW[+s[i]]+1)+'px'}}
function setMode(m,user){mode=m?1:0;tgs.forEach(function(t,k){t.classList.toggle('on',k===mode)});setDigits(mode?D.total:D.per);plabel.textContent=mode?D.totalLabel:D.perLabel;psub.innerHTML=mode?D.totalSub:D.perSub;avs.classList.toggle('two',mode===1);if(user)hold=Date.now()+8000}
function reset(){clearAll();for(var i=0;i<CLS.length;i++)ad.classList.remove(CLS[i]);setDigits(0);mode=0;tgs[0].classList.add('on');tgs[1].classList.remove('on');avs.classList.remove('two');plabel.textContent=D.perLabel;psub.innerHTML=D.perSub;panEl.style.transition='none';setPan(D.pan.top);void ad.offsetWidth;panEl.style.transition=''}
function start(){reset();
  after(T.sticker,function(){ad.classList.add('show-sticker')});
  after(T.title,function(){setPan(D.pan.faces);ad.classList.add('show-title')});
  after(T.price,function(){ad.classList.add('show-price');after(120,function(){setDigits(D.per)})});
  after(T.sub,function(){ad.classList.add('show-sub')});
  after(T.tray,function(){setPan(D.pan.tray)});
  after(T.cta,function(){ad.classList.add('show-cta')});
  after(T.back,function(){setPan(D.pan.faces)});
  after(T.autoTotal,function(){if(Date.now()>hold)setMode(1)});
  after(T.autoPer,function(){if(Date.now()>hold)setMode(0)});
  after(T.hold,function(){loops++;if(loops>=T.loops){ad.classList.add('ended');return}ad.classList.add('out');after(550,start)});
}
/* Fiyat anahtarı */
tgs.forEach(function(t,k){t.addEventListener('pointerenter',function(){setMode(k,true)});t.addEventListener('click',function(e){e.stopPropagation();setMode(k,true)})});
/* Yasal metin */
function openLegal(o){ad.classList.toggle('legal-open',o)}
info.addEventListener('pointerenter',function(){openLegal(true)});
info.addEventListener('click',function(e){e.stopPropagation();openLegal(!ad.classList.contains('legal-open'))});
legalbox.addEventListener('pointerleave',function(){openLegal(false)});
legalbox.addEventListener('click',function(e){e.stopPropagation()});
legalbox.querySelector('.x').addEventListener('click',function(e){e.stopPropagation();openLegal(false)});
/* Paralaks + fotoğraf kaydırma */
var tx=0,ty=0,cx=0,cy=0,raf=null;
function tick(){if(raf)return;raf=requestAnimationFrame(function(){raf=null;cx+=(tx-cx)*.1;cy+=(ty-cy)*.1;ad.style.setProperty('--px',cx.toFixed(3));ad.style.setProperty('--py',cy.toFixed(3));ad.style.setProperty('--sy',cy.toFixed(3));if(Math.abs(tx-cx)>.002||Math.abs(ty-cy)>.002)tick()})}
ad.addEventListener('pointermove',function(e){var r=ad.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*2;ty=((e.clientY-r.top)/r.height-.5)*2;tick()});
ad.addEventListener('pointerleave',function(){tx=0;ty=0;tick();openLegal(false)});
/* Tıklama / klavye */
function openLink(){var u=window.clickTag||D.url;if(window.Enabler&&window.Enabler.exit){window.Enabler.exit('CTA')}else{window.open(u,'_blank','noopener')}}
ad.addEventListener('click',function(e){var t=e.target;if(t.closest&&(t.closest('.tg')||t.closest('.info')||t.closest('.legalbox')||t.closest('.replay')))return;openLink()});
ad.querySelector('.replay').addEventListener('click',function(e){e.stopPropagation();loops=0;start()});
ad.addEventListener('keydown',function(e){if(e.key==='Enter'){openLink()}else if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();setMode(mode?0:1,true)}else if(e.key===' '){e.preventDefault();loops=0;start()}else if(e.key==='Escape'){openLegal(false)}});
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){setDigits(mode?D.total:D.per)})}
var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(rm){ad.classList.add('rm');['show-sticker','show-title','show-price','show-sub','show-cta','ended'].forEach(function(c){ad.classList.add(c)});setPan(D.pan.faces);setDigits(D.per)}else{start()}
window.__kfsooo={start:start,setMode:setMode,openLegal:openLegal,state:function(){return{loops:loops,mode:mode,cls:ad.className,pan:panEl.style.transform}}};
})();
</script>
</body>
</html>`;
};
