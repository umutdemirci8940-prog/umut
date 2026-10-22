'use strict';
/**
 * Çalışma 1 – "Işığınızı ne besler?" (ışık testi)
 * Kullanıcı dört alandan birini seçer (Beslenme / Zihin / Beden / Cilt); ışık rengi ve panel o alana döner.
 * Etkileşim yoksa alanlar sırayla otomatik gösterilir, "Yerinizi Ayırtın" kapanışında durur.
 */
const { esc, icon, stars, infoHTML, brandHTML, portraitHTML, RUNTIME, page } = require('../common');

const CSS = `
.ad.pulse .por .orb{animation:breathe 3.2s ease-in-out infinite}
@keyframes breathe{50%{transform:scale(1.1);opacity:.7}}

/* soru + seçenekler */
.stage{position:absolute;z-index:3;opacity:0;transform:translateY(8px);transition:opacity .7s,transform .7s}
.ad.ready .stage{opacity:1;transform:none}
.q{font-weight:600;line-height:1.05}
.hint{font-size:10.5px;color:var(--ink2);margin-top:3px}
.chips{display:grid;gap:6px}
.chip{position:relative;display:flex;align-items:center;justify-content:center;gap:6px;height:36px;padding:0 8px;border-radius:18px;background:var(--veil);
  border:1px solid var(--line);font-size:11.5px;font-weight:600;color:var(--ink);transition:background .35s,color .35s,border-color .35s,transform .2s,box-shadow .35s}
.chip svg{width:16px;height:16px;flex:none;color:var(--pc);transition:color .35s}
.chip:hover,.chip:focus-visible{border-color:var(--pc);transform:translateY(-1px);outline:none;box-shadow:0 4px 14px -6px var(--pc)}
.chip.active{background:var(--pc);border-color:var(--pc);color:#fff;box-shadow:0 6px 18px -6px var(--pc)}
.chip.active svg{color:#fff}
.chip.tap::after{content:'';position:absolute;left:50%;top:50%;width:28px;height:28px;margin:-14px 0 0 -14px;border-radius:50%;
  border:2px solid #fff;animation:tap .9s ease-out forwards;pointer-events:none}
@keyframes tap{0%{transform:scale(.3);opacity:1}100%{transform:scale(1.9);opacity:0}}

/* sonuç paneli */
.panel{position:absolute;display:flex;border-radius:14px;background:var(--veil);border:1px solid rgba(255,255,255,.7);
  box-shadow:0 10px 30px -18px rgba(31,26,23,.5);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.ptext{min-width:0}
.ptext>*{transition:opacity .35s,transform .35s}
.ptext.swap>*{opacity:0;transform:translateX(10px)}
.ptitle{font-weight:600;line-height:1.05;margin-top:3px}
.ptxt{font-size:11px;color:var(--ink2);margin-top:4px;line-height:1.35}
.ad.end .cta{background:var(--red);animation:ctaPulse 1.8s ease-in-out 4}
.steps{display:flex;gap:4px;position:absolute}
.steps b{width:12px;height:3px;border-radius:2px;background:var(--line);transition:background .4s,width .4s}
.steps b.on{background:var(--c);width:20px}

/* ---------- 970x250 ---------- */
.s970 .por{left:30px;top:32px;width:186px;height:186px}
.s970 .brand{left:242px;top:0;width:280px;height:250px;display:flex;flex-direction:column;justify-content:center}
.s970 .sep{position:absolute;left:530px;top:34px;bottom:34px;width:1px;background:rgba(31,26,23,.16);z-index:2}
.s970 .stage{left:552px;top:22px;width:398px;height:206px}
.s970 .q{font-size:23px}
.s970 .chips{grid-template-columns:repeat(4,1fr);margin-top:10px}
.s970 .panel{left:0;right:0;bottom:0;top:102px;align-items:center;gap:12px;padding:0 12px 0 16px}
.s970 .ptext{flex:1}
.s970 .ptitle{font-size:20px}
.s970 .steps{right:14px;top:9px}
.s970 .star.a{left:196px;top:34px;width:22px;height:22px}
.s970 .star.b{left:206px;top:196px;width:16px;height:16px;animation-delay:1.2s}
.s970 .star.c{left:500px;top:18px;width:14px;height:14px;animation-delay:2.1s}

/* ---------- 320x480 ---------- */
.s320 .por{left:22px;top:104px;width:100px;height:100px}
.s320 .por .ring{padding:4px}
.s320 .por .tag{font-size:7.5px;padding:3px 7px}
.s320 .info{position:absolute;left:138px;top:110px;width:170px;font-size:11px;line-height:1.5;z-index:2}
.s320 .date{font-size:15px}
.s320 .stage{left:14px;right:14px;top:222px;bottom:12px;text-align:center}
.s320 .q{font-size:21px}
.s320 .chips{grid-template-columns:1fr 1fr;margin-top:8px}
.s320 .chip{font-size:12px;height:34px}
.s320 .panel{left:0;right:0;bottom:0;top:126px;flex-direction:column;justify-content:space-between;padding:12px 12px 10px;text-align:center}
.s320 .ptitle{font-size:19px}
.s320 .cta{width:100%;height:38px;font-size:12.5px}
.s320 .steps{left:50%;transform:translateX(-50%);top:-9px}
.s320 .star.a{left:14px;top:96px;width:18px;height:18px}
.s320 .star.b{left:262px;top:196px;width:16px;height:16px;animation-delay:1.3s}
.s320 .star.c{left:112px;top:190px;width:13px;height:13px;animation-delay:2.2s}
`;

const SCRIPT = `
var root=document.documentElement;
var chips=[].slice.call(ad.querySelectorAll('.chip')),steps=[].slice.call(ad.querySelectorAll('.steps b'));
var pt=ad.querySelector('.ptext'),kick=ad.querySelector('.kicker'),ttl=ad.querySelector('.ptitle'),txt=ad.querySelector('.ptxt');
var ctaL=ad.querySelector('.ctal'),orb=ad.querySelector('.orb');
var timer=null,autoIdx=-1,userChose=false,hovering=false,ended=false;

function show(p,fromUser){
  AD.detail=p.key;
  root.style.setProperty('--c',p.color);
  orb.style.backgroundColor=p.color;
  chips.forEach(function(c){var on=c.getAttribute('data-k')===p.key;c.classList.toggle('active',on);c.setAttribute('aria-pressed',on);
    if(on&&!fromUser){c.classList.remove('tap');void c.offsetWidth;c.classList.add('tap');}});
  var idx=-1;C.pillars.forEach(function(q,i){if(q.key===p.key)idx=i;});
  steps.forEach(function(s,i){s.classList.toggle('on',i===idx);});
  pt.classList.add('swap');
  setTimeout(function(){kick.textContent=p.label;ttl.textContent=p.title;txt.textContent=p.text;pt.classList.remove('swap');},180);
  ctaL.textContent=p.key===C.overview.key&&ended?C.ctaEnd:C.cta;
}
function finish(){
  ended=true;clearTimeout(timer);ad.classList.add('end','pulse');
  if(!userChose)show(C.overview);else ctaL.textContent=C.cta;
}
function step(){
  if(userChose||hovering||ended)return;
  autoIdx++;
  if(autoIdx>=C.pillars.length){finish();return;}
  show(C.pillars[autoIdx]);
  timer=setTimeout(step,C.timing.perPillar);
}
chips.forEach(function(c){
  c.addEventListener('click',function(){
    userChose=true;clearTimeout(timer);ad.classList.remove('end');
    var k=c.getAttribute('data-k');
    C.pillars.forEach(function(p){if(p.key===k)show(p,true);});
    AD.count('secim_'+k);
  });
});
// Yalnızca gerçek fare hareketi duraklatır (sayfa kaydırılırken imleç üstte kalınca akış durmasın)
ad.addEventListener('mousemove',function(){if(!hovering){hovering=true;clearTimeout(timer);}});
ad.addEventListener('mouseleave',function(){hovering=false;if(!userChose&&!ended&&ad.classList.contains('ready'))timer=setTimeout(step,900);});
AD.onStop=function(){if(!ended)finish();};
AD.ready(function(){
  show(C.overview);
  setTimeout(function(){ad.classList.add('ready');timer=setTimeout(step,C.timing.idle);},C.timing.intro);
});
`;

function render(sizeKey, data, img) {
  const is970 = sizeKey === '970x250';
  const ev = data.event;
  const chips = data.pillars.map((p) =>
    `<button class="chip" type="button" data-noexit data-k="${p.key}" style="--pc:${p.color}" aria-pressed="false">${icon(p.key)}<span>${esc(p.label)}</span></button>`).join('');
  const cfg = {
    concept: 'isik-testi', size: sizeKey, url: data.url, utm: data.utm, cta: data.cta, ctaEnd: data.ctaEnd, timing: data.timing,
    pillars: data.pillars.map(({ key, label, title, text, color }) => ({ key, label, title, text, color })),
    overview: data.overview,
  };
  const body = `<div id="ad" class="ad ${is970 ? 's970' : 's320'}" style="--bg:url(${img.bg})" aria-label="${esc(ev.academy)} – İçten Dışa Parla ${esc(ev.sub)}, ${esc(ev.date)} ${esc(ev.time)}, ${esc(ev.venue)}. ${esc(ev.note)}.">
  ${stars(3)}
  ${portraitHTML(ev, img)}
  ${brandHTML(ev, img, is970)}
  ${is970 ? '<div class="sep"></div>' : infoHTML(ev)}
  <section class="stage">
    <p class="q serif">${esc(data.question)}</p>
    <p class="hint">${esc(data.hint)}</p>
    <div class="chips" role="group" aria-label="${esc(data.question)}">${chips}</div>
    <div class="panel" aria-live="polite">
      <div class="steps" aria-hidden="true">${data.pillars.map(() => '<b></b>').join('')}</div>
      <div class="ptext"><div class="kicker"></div><div class="ptitle serif"></div><div class="ptxt"></div></div>
      <button class="cta" type="button"><span class="ctal"></span><i>→</i></button>
    </div>
  </section>
</div>`;
  return page({ sizeKey, title: `İçten Dışa Parla – Işık Testi (${sizeKey})`, css: CSS, body, script: RUNTIME(cfg) + SCRIPT });
}

module.exports = { key: 'isik-testi', name: 'Işığınızı ne besler?', render };
