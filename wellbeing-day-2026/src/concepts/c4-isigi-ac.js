'use strict';
/**
 * Çalışma 4 – "Işığınızı açın"
 * Banner loş başlar. Kullanıcı güneş tutamaklı kaydırıcıyı sürükledikçe sahne aydınlanır, portre renklenir,
 * dört alan (Beslenme / Zihin / Beden / Cilt) sırayla yanar. Sona gelince ışık saçılır, slogan + CTA açılır.
 * Etkinliğe kalan gün sayısı canlı hesaplanır. Etkileşim yoksa kaydırıcı kendiliğinden ilerler.
 */
const { esc, icon, stars, burst, brandHTML, infoHTML, portraitHTML, RUNTIME, page } = require('../common');

const CSS = `
.ad{background:#2b231d;--v:0;--ink2:#3d332c}
.scene{position:absolute;inset:0;background:var(--bg) center/cover no-repeat;z-index:0;
  filter:brightness(calc(.68 + .36*var(--v))) saturate(calc(.45 + .65*var(--v)))}
.ad::before{z-index:0;opacity:var(--v)}
.por img{filter:grayscale(calc(1 - var(--v))) brightness(calc(.78 + .22*var(--v)))}
.ad.on .por .orb{opacity:calc(.1 + .6*var(--v))}
.por .orb{background:#e3b06e}
.title,.sub{text-shadow:0 1px 0 rgba(255,255,255,calc(.35*var(--v)))}

.ctrl{position:absolute;z-index:3;opacity:0;transform:translateY(8px);transition:opacity .8s .9s,transform .8s .9s}
.ad.on .ctrl{opacity:1;transform:none}
.row{display:flex;align-items:center;justify-content:space-between;gap:8px}
.kicker{color:#7d5a2c}
.days{font-size:9.5px;font-weight:700;letter-spacing:.06em;background:var(--ink);color:#fff;padding:4px 9px;border-radius:10px;white-space:nowrap}
.ctrl h2{font-weight:600;line-height:1.05;margin-top:4px}
.phase{transition:opacity .6s,transform .6s}
.after{position:absolute;left:0;right:0;opacity:0;transform:translateY(10px);pointer-events:none}
.ad.revealed .before{opacity:0;transform:translateY(-8px);pointer-events:none}
.ad.revealed .after{opacity:1;transform:none;pointer-events:auto}

.slider{position:relative;height:46px;border-radius:23px;background:rgba(255,250,244,.55);border:1px solid rgba(255,255,255,.75);
  box-shadow:inset 0 2px 6px rgba(31,26,23,.18);touch-action:none;cursor:pointer;outline:none}
.slider:focus-visible{box-shadow:0 0 0 3px #fff,0 0 0 5px var(--ink)}
.fill{position:absolute;left:0;top:0;bottom:0;border-radius:23px;background:linear-gradient(90deg,rgba(230,186,120,.35),#e7b56f 70%,#fff1d6);min-width:46px}
.chev{position:absolute;right:16px;top:50%;transform:translateY(-50%);display:flex;gap:2px;color:var(--ink);opacity:calc(.6 - .6*var(--v));font-weight:700;font-size:13px}
.chev i{font-style:normal;animation:chev 1.4s ease-in-out infinite}
.chev i:nth-child(2){animation-delay:.15s}.chev i:nth-child(3){animation-delay:.3s}
@keyframes chev{0%,100%{opacity:.25}50%{opacity:1}}
.lbl{position:absolute;left:58px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:var(--ink);opacity:calc(1 - 2*var(--v));pointer-events:none;white-space:nowrap}
.knob{position:absolute;top:3px;width:40px;height:40px;border-radius:50%;background:#fff;display:grid;place-items:center;color:#c98a3a;
  box-shadow:0 4px 12px -4px rgba(31,26,23,.5),0 0 calc(6px + 22px*var(--v)) rgba(255,205,130,calc(.4 + .6*var(--v)))}
.knob svg{width:24px;height:24px}
.ad:not(.touched) .knob{animation:knob 1.6s ease-in-out infinite}
@keyframes knob{50%{box-shadow:0 4px 12px -4px rgba(31,26,23,.5),0 0 0 7px rgba(255,255,255,.45)}}
.marks{position:absolute;left:0;right:0;bottom:0;display:grid;grid-template-columns:repeat(4,1fr)}
.mk{display:flex;align-items:center;justify-content:center;gap:5px;font-size:10.5px;font-weight:600;color:var(--ink2);opacity:.6;transition:opacity .4s,color .4s,transform .4s}
.mk svg{width:15px;height:15px;color:var(--ink2);transition:color .4s}
.mk.lit{opacity:1;color:var(--ink);transform:translateY(-1px)}
.mk.lit svg{color:var(--pc)}
.after h2{font-size:inherit}
.after .cta{margin-top:10px}

/* ---------- 970x250 ---------- */
.s970 .por{left:34px;top:34px;width:180px;height:180px}
.s970 .brand{left:242px;top:0;width:290px;height:250px;display:flex;flex-direction:column;justify-content:center}
.s970 .sep{position:absolute;left:540px;top:34px;bottom:34px;width:1px;background:rgba(31,26,23,.16);z-index:2}
.s970 .ctrl{left:566px;top:28px;width:380px;height:194px}
.s970 .ctrl h2{font-size:23px}
.s970 .before .slider{margin-top:14px}
.s970 .after{top:24px}
.s970 .after h2{font-size:23px}
.s970 .burst{left:124px;top:124px}
.s970 .star.a{left:212px;top:30px;width:18px;height:18px}
.s970 .star.b{left:20px;top:200px;width:14px;height:14px;animation-delay:1.3s}
.s970 .star.c{left:930px;top:200px;width:13px;height:13px;animation-delay:2.2s}

/* ---------- 320x480 ---------- */
.s320 .por{left:100px;top:100px;width:120px;height:120px}
.s320 .por .ring{padding:4px}
.s320 .por .tag{font-size:7.5px;padding:3px 7px}
.s320 .info{position:absolute;left:0;right:0;top:232px;text-align:center;font-size:11px;line-height:1.45;z-index:2}
.s320 .date{font-size:15px}
.s320 .ctrl{left:14px;right:14px;top:312px;bottom:12px}
.s320 .ctrl h2{font-size:20px;text-align:center}
.s320 .before .slider{margin-top:10px}
.s320 .mk{flex-direction:column;gap:2px;font-size:10px}
.s320 .after{top:22px;text-align:center}
.s320 .after h2{font-size:20px}
.s320 .after .cta{width:100%;height:40px;font-size:12.5px}
.s320 .burst{left:160px;top:160px}
.s320 .star.a{left:70px;top:110px;width:16px;height:16px}
.s320 .star.b{left:236px;top:200px;width:14px;height:14px;animation-delay:1.3s}
.s320 .star.c{left:288px;top:100px;width:12px;height:12px;animation-delay:2.2s}
`;

const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor" fill-opacity=".25"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>';

const SCRIPT = `
var sl=ad.querySelector('.slider'),knob=ad.querySelector('.knob'),fill=ad.querySelector('.fill');
var marks=[].slice.call(ad.querySelectorAll('.mk'));
var v=0,done=false,touched=false,drag=false;
function set(nv){
  v=Math.max(0,Math.min(1,nv));
  ad.style.setProperty('--v',v.toFixed(3));
  var tw=sl.clientWidth-46;knob.style.left=(3+v*tw)+'px';fill.style.width=(46+v*tw)+'px';
  sl.setAttribute('aria-valuenow',Math.round(v*100));
  marks.forEach(function(m,i){var lit=v>=C.th[i];if(lit&&!m.classList.contains('lit'))AD.detail=m.getAttribute('data-k');m.classList.toggle('lit',lit);});
  if(v>=.985)reveal();
}
function reveal(){
  if(done)return;done=true;set(1);AD.detail=touched?'isik-acildi':'isik-otomatik';
  sl.removeAttribute('data-noexit');ad.classList.add('revealed');AD.burst();
  setTimeout(function(){ad.querySelector('.after .cta').classList.add('pulse');},700);
}
function fromEvent(e){var r=sl.getBoundingClientRect();return (e.clientX-r.left-23)/(r.width-46);}
function take(){if(!touched){touched=true;ad.classList.add('touched');AD.count('isik_kaydir');}}
sl.addEventListener('pointerdown',function(e){if(done)return;take();drag=true;set(fromEvent(e));if(sl.setPointerCapture){try{sl.setPointerCapture(e.pointerId);}catch(_){}}e.preventDefault();});
sl.addEventListener('pointermove',function(e){if(drag&&!done)set(fromEvent(e));});
function end(){if(!drag)return;drag=false;if(!done&&v>.8)glide(v,1,350);}
sl.addEventListener('pointerup',end);sl.addEventListener('pointercancel',end);
sl.addEventListener('keydown',function(e){if(done)return;var k=e.key,d=0;
  if(k==='ArrowRight'||k==='ArrowUp')d=.1;else if(k==='ArrowLeft'||k==='ArrowDown')d=-.1;else if(k==='End')d=1;else if(k==='Home')d=-1;else return;
  e.preventDefault();take();set(v+d);});
function glide(a,b,ms,cb){var t0=0;(function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/ms);k=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  if(!done)set(a+(b-a)*k);if(k<1&&!done&&!(touched&&cb))requestAnimationFrame(f);else if(cb)cb();})(performance.now());}
var days=Math.ceil((new Date(C.start)-Date.now())/864e5),dEl=ad.querySelector('.days');
if(days>1)dEl.textContent=days+' '+C.daysText;else if(days===1)dEl.textContent=C.tomorrow;else dEl.classList.add('hide');
AD.onStop=reveal;
AD.ready(function(){set(0);setTimeout(function(){if(!touched&&!done)glide(0,1,C.autoDur,function(){if(!touched)reveal();});},C.autoAfter);});
`;

function render(sizeKey, data, img) {
  const is970 = sizeKey === '970x250';
  const ev = data.event;
  const t = data.concepts.isik;
  const cfg = {
    concept: 'isigi-ac', size: sizeKey, url: data.url, utm: data.utm, timing: data.timing,
    th: t.thresholds, autoAfter: t.autoAfter, autoDur: t.autoDur, start: ev.start, daysText: t.daysText, tomorrow: t.tomorrow,
  };
  const marks = data.pillars.map((p) => `<div class="mk" data-k="${p.key}" style="--pc:${p.color}">${icon(p.key)}<span>${esc(p.label)}</span></div>`).join('');
  const body = `<div id="ad" class="ad ${is970 ? 's970' : 's320'}" style="--bg:url(${img.bg})" aria-label="${esc(ev.academy)} – İçten Dışa Parla ${esc(ev.sub)}, ${esc(ev.date)} ${esc(ev.time)}, ${esc(ev.venue)}. ${esc(ev.note)}.">
  <div class="scene"></div>
  ${stars(3)}
  ${portraitHTML(ev, img)}
  ${brandHTML(ev, img, is970)}
  ${is970 ? '<div class="sep"></div>' : infoHTML(ev)}
  ${burst(12)}
  <section class="ctrl" aria-live="polite">
    <div class="row"><div class="kicker">${esc(t.kicker)}</div><div class="days"></div></div>
    <div class="phase before">
      <h2 class="serif">${esc(t.title)}</h2>
      <div class="slider" data-noexit tabindex="0" role="slider" aria-label="${esc(t.title)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
        <div class="fill"></div><div class="lbl">${esc(t.hint)}</div><div class="chev" aria-hidden="true"><i>›</i><i>›</i><i>›</i></div>
        <div class="knob">${SUN}</div>
      </div>
    </div>
    <div class="phase after">
      <h2 class="serif">${esc(ev.slogan)}</h2>
      <button class="cta red" type="button">${esc(data.ctaEnd)}<i>→</i></button>
    </div>
    <div class="marks" aria-hidden="true">${marks}</div>
  </section>
</div>`;
  return page({ sizeKey, title: `İçten Dışa Parla – Işığınızı Açın (${sizeKey})`, css: CSS, body, script: RUNTIME(cfg) + SCRIPT });
}

module.exports = { key: 'isigi-ac', name: 'Işığınızı açın', render };
