'use strict';
/**
 * Çalışma 2 – "Birlikte nefes alalım"
 * Kullanıcı portre dairesine basılı tutar: nefes aldıkça halka dolar ve ışık büyür, ardından nefes verilir,
 * ışık saçılır ve slogan + "Yerinizi Ayırtın" açılır. Etkileşim yoksa nefes döngüsü kendiliğinden oynar.
 */
const { esc, stars, burst, brandHTML, RUNTIME, page } = require('../common');

const R = 96; // halka yarıçapı (viewBox 0 0 206 206)

const CSS = `
.breath{position:absolute;z-index:3;cursor:pointer;touch-action:none;opacity:0;transform:scale(.9);transition:opacity .9s .2s,transform 1.1s .2s cubic-bezier(.2,.8,.2,1);--s:.85;outline:none}
.ad.on .breath{opacity:1;transform:none}
.halo{position:absolute;inset:-30px;border-radius:50%;pointer-events:none;
  background:radial-gradient(circle,rgba(255,240,214,.95) 0%,rgba(226,176,112,.6) 42%,rgba(226,176,112,0) 70%);transform:scale(var(--s))}
.breath svg.rg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg);overflow:visible}
.rg .tr{fill:none;stroke:rgba(255,255,255,.75);stroke-width:7}
.rg .pg{fill:none;stroke:#b8864e;stroke-width:7;stroke-linecap:round;filter:drop-shadow(0 0 4px rgba(255,214,150,.9))}
.face{position:absolute;inset:13px;border-radius:50%;overflow:hidden;box-shadow:0 10px 28px -12px rgba(31,26,23,.55)}
.face img{display:block;width:100%;height:100%;object-fit:cover}
.pill{position:absolute;left:50%;bottom:-9px;transform:translateX(-50%);white-space:nowrap;background:var(--ink);color:#fff;font-size:9px;font-weight:700;
  letter-spacing:.14em;text-transform:uppercase;padding:5px 11px;border-radius:12px;display:flex;align-items:center;gap:6px;animation:nudge 1.6s ease-in-out infinite}
.pill svg{width:12px;height:12px}
@keyframes nudge{50%{transform:translateX(-50%) translateY(-3px)}}
.breath:focus-visible .face{box-shadow:0 0 0 3px #fff,0 0 0 5px var(--ink)}
.ad.revealed .pill{opacity:0;transition:opacity .4s}
.ad.revealed .burst span{color:#fff}

.right{position:absolute;z-index:3}
.right .st{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;transition:opacity .6s,transform .6s}
.right .after{opacity:0;transform:translateY(10px);pointer-events:none}
.ad.revealed .right .before{opacity:0;transform:translateY(-10px);pointer-events:none}
.ad.revealed .right .after{opacity:1;transform:none;pointer-events:auto}
.right h2{font-weight:600;line-height:1.05;margin-top:5px}
.right p{color:var(--ink2);font-size:11.5px;line-height:1.45;margin-top:6px}
.count{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:600;color:#9a6c36;margin-top:10px;min-height:1.2em}
.meta{font-weight:600;color:var(--ink)!important}
.right .cta{margin-top:12px;align-self:flex-start}
.kicker{color:#a8804c}

/* ---------- 970x250 ---------- */
.s970 .brand{left:34px;top:0;width:300px;height:250px;display:flex;flex-direction:column;justify-content:center}
.s970 .breath{left:376px;top:22px;width:206px;height:206px}
.s970 .burst{left:479px;top:125px}
.s970 .right{left:624px;top:0;width:320px;height:250px}
.s970 .right h2{font-size:27px}
.s970 .right .after h2{font-size:23px}
.s970 .count{font-size:21px}
.s970 .star.a{left:350px;top:24px;width:18px;height:18px}
.s970 .star.b{left:578px;top:200px;width:15px;height:15px;animation-delay:1.2s}
.s970 .star.c{left:930px;top:30px;width:13px;height:13px;animation-delay:2.1s}

/* ---------- 320x480 ---------- */
.mini{position:absolute;left:0;right:0;top:96px;text-align:center;font-size:10.5px;font-weight:600;color:var(--ink2);z-index:4;opacity:0;transition:opacity .8s 1s}
.ad.on .mini{opacity:1}
.s320 .breath{left:70px;top:122px;width:180px;height:180px}
.s320 .burst{left:160px;top:212px}
.s320 .right{left:16px;right:16px;top:316px;bottom:12px;text-align:center}
.s320 .right .st{align-items:center}
.s320 .right h2{font-size:23px}
.s320 .right .after h2{font-size:20px}
.s320 .count{font-size:20px}
.s320 .right .cta{align-self:stretch;margin-top:12px}
.s320 .meta .v{display:block}
.s320 .meta i{display:none}
.meta i{font-style:normal}
.s320 .star.a{left:40px;top:120px;width:16px;height:16px}
.s320 .star.b{left:262px;top:250px;width:15px;height:15px;animation-delay:1.3s}
.s320 .star.c{left:270px;top:92px;width:12px;height:12px;animation-delay:2.2s}
`;

const HAND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V5a2 2 0 1 1 4 0v5"/><path d="M13 10V8a2 2 0 1 1 4 0v4"/><path d="M17 11a2 2 0 1 1 4 0v3a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L4.3 14a1.8 1.8 0 0 1 3-2L9 14"/></svg>';

const SCRIPT = `
var br=ad.querySelector('.breath'),pg=ad.querySelector('.pg'),cnt=ad.querySelector('.count');
var L=2*Math.PI*${R};pg.style.strokeDasharray=L;pg.style.strokeDashoffset=L;
var p=0,holding=false,auto=false,touched=false,phase='in',exT=0,done=false,last=0;
function reveal(){
  if(done)return;done=true;phase='done';
  br.removeAttribute('data-noexit');br.style.setProperty('--s','1');pg.style.strokeDashoffset=0;
  ad.classList.add('revealed');AD.burst();
  setTimeout(function(){ad.querySelector('.after .cta').classList.add('pulse');},700);
}
function loop(t){
  if(done||AD.stopped)return;
  var dt=last?Math.min(64,t-last):16;last=t;
  if(phase==='in'){
    if(holding||auto)p=Math.min(1,p+dt/C.inhale);else p=Math.max(0,p-dt/1500);
    cnt.textContent=(holding||auto)?C.txt.inhale+' '+Math.max(1,Math.ceil((1-p)*C.inhale/1000)):(p>0?C.txt.keep:C.txt.idle);
    pg.style.strokeDashoffset=L*(1-p);br.style.setProperty('--s',(.85+.4*p).toFixed(3));
    if(p>=1){phase='out';exT=0;}
  }else if(phase==='out'){
    exT+=dt;var k=Math.min(1,exT/C.exhale);
    br.style.setProperty('--s',(1.25-.3*k).toFixed(3));
    cnt.textContent=C.txt.exhale+' '+Math.max(1,Math.ceil((C.exhale-exT)/1000));
    if(k>=1){reveal();return;}
  }
  requestAnimationFrame(loop);
}
function down(e){
  if(done)return;
  touched=true;auto=false;holding=true;AD.detail='nefes';AD.count('nefes_basla');
  if(e&&e.pointerId!=null&&br.setPointerCapture){try{br.setPointerCapture(e.pointerId);}catch(_){}}
  if(e&&e.preventDefault)e.preventDefault();
}
function up(){holding=false;}
br.addEventListener('pointerdown',down);
br.addEventListener('pointerup',up);br.addEventListener('pointercancel',up);
br.addEventListener('keydown',function(e){if((e.key===' '||e.key==='Enter')&&!e.repeat){down(e);}});
br.addEventListener('keyup',up);
br.addEventListener('contextmenu',function(e){e.preventDefault();});
AD.onStop=function(){reveal();};
AD.ready(function(){
  cnt.textContent=C.txt.idle;
  requestAnimationFrame(loop);
  setTimeout(function(){if(!touched&&!done){auto=true;AD.detail='nefes-otomatik';}},C.autoAfter);
});
`;

function render(sizeKey, data, img) {
  const is970 = sizeKey === '970x250';
  const ev = data.event;
  const t = data.concepts.nefes;
  const cfg = {
    concept: 'nefes', size: sizeKey, url: data.url, timing: data.timing,
    inhale: t.inhale, exhale: t.exhale, autoAfter: t.autoAfter, txt: t.txt,
  };
  const body = `<div id="ad" class="ad ${is970 ? 's970' : 's320'}" style="--bg:url(${img.bg})" aria-label="${esc(ev.academy)} – İçten Dışa Parla ${esc(ev.sub)}, ${esc(ev.date)} ${esc(ev.time)}, ${esc(ev.venue)}. ${esc(ev.note)}.">
  ${stars(3)}
  ${brandHTML(ev, img, is970)}
  ${is970 ? '' : `<div class="mini">${esc(ev.date)} · ${esc(ev.venue)}</div>`}
  <div class="breath" data-noexit tabindex="0" role="button" aria-label="${esc(t.pill)} – ${esc(t.title)}">
    <div class="halo"></div>
    <div class="face"><img src="${img.portrait}" alt="${esc(ev.host)}"></div>
    <svg class="rg" viewBox="0 0 206 206" aria-hidden="true"><circle class="tr" cx="103" cy="103" r="${R}"/><circle class="pg" cx="103" cy="103" r="${R}"/></svg>
    <div class="pill">${HAND}${esc(t.pill)}</div>
  </div>
  ${burst(12)}
  <section class="right" aria-live="polite">
    <div class="st before">
      <div class="kicker">${esc(t.kicker)}</div>
      <h2 class="serif">${esc(t.title)}</h2>
      <p>${esc(t.text)}</p>
      <div class="count" aria-hidden="true"></div>
    </div>
    <div class="st after">
      <div class="kicker">${esc(t.doneKicker)}</div>
      <h2 class="serif">${esc(ev.slogan)}</h2>
      <p class="meta">${esc(ev.date)} · ${esc(ev.time)}<span class="v"><i> · </i>${esc(ev.venue)}</span></p>
      <button class="cta red" type="button">${esc(data.ctaEnd)}<i>→</i></button>
    </div>
  </section>
</div>`;
  return page({ sizeKey, title: `İçten Dışa Parla – Birlikte Nefes (${sizeKey})`, css: CSS, body, script: RUNTIME(cfg) + SCRIPT });
}

module.exports = { key: 'nefes', name: 'Birlikte nefes alalım', render };
