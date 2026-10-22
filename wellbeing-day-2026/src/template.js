'use strict';
/**
 * "İçten Dışa Parla" interaktif banner şablonu.
 * render(sizeKey, data, img) → tek dosyalık HTML (satır içi CSS + JS, görseller base64 gömülü).
 * img: { portrait, logo, bg } – data: URI'leri (build.js üretir).
 */
const SIZES = {
  '970x250': { w: 970, h: 250, label: 'Billboard' },
  '320x480': { w: 320, h: 480, label: 'Mobil Interstitial' },
};

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Montserrat:wght@400;500;600;700&display=swap';

// Alan ikonları (çizgi, currentColor)
const ICONS = {
  beslenme: '<path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z"/><path d="M5 19l8-8"/>',
  zihin: '<circle cx="12" cy="12" r="3"/><path d="M12 3a9 9 0 0 1 0 18"/><path d="M12 6.5a5.5 5.5 0 0 1 0 11"/><path d="M12 3a9 9 0 0 0 0 18" opacity=".45"/>',
  beden: '<circle cx="12" cy="5" r="2"/><path d="M4 10c3 1.5 5 2 8 2s5-.5 8-2"/><path d="M12 12v4l-4 5M12 16l4 5"/>',
  cilt: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M18.5 15.5l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>',
};
const icon = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</svg>`;
// Afişteki dört kollu yıldız
const STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 0l1.1 8.9L20 10l-8.9 1.1L10 20l-1.1-8.9L0 10l8.9-1.1z" fill="currentColor"/></svg>';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const CSS = `
:root{--ink:#1f1a17;--ink2:#5e5148;--gold:#a8804c;--veil:rgba(255,250,244,.8);--line:rgba(31,26,23,.13);--c:#b08a57}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#f3e3d2}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.ad{position:relative;overflow:hidden;cursor:pointer;color:var(--ink);font-family:Montserrat,'Segoe UI',Arial,sans-serif;
  background:#f1dcc6 var(--bg) center/cover no-repeat;border:1px solid rgba(31,26,23,.12);
  -webkit-font-smoothing:antialiased;user-select:none;-webkit-tap-highlight-color:transparent}
.ad::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0}
.cinzel{font-family:Cinzel,'Trajan Pro',Georgia,serif}
.serif{font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif}

/* portre + ışık */
.por{position:absolute;z-index:2}
.por .orb{position:absolute;inset:-22%;border-radius:50%;background:var(--c);filter:blur(26px);opacity:0;transform:scale(.4);
  transition:background-color .9s ease,transform 1.6s cubic-bezier(.2,.8,.2,1),opacity 1.2s}
.por .ring{position:absolute;inset:0;border-radius:50%;padding:6px;background:linear-gradient(140deg,rgba(255,255,255,.95),rgba(255,255,255,.45));
  box-shadow:0 10px 30px -12px rgba(31,26,23,.45);opacity:0;transform:scale(.85);transition:opacity .9s .15s,transform 1.1s .15s cubic-bezier(.2,.8,.2,1)}
.por img{display:block;width:100%;height:100%;border-radius:50%;object-fit:cover}
.por .tag{position:absolute;left:50%;bottom:-6px;transform:translate(-50%,6px);white-space:nowrap;font-size:9px;font-weight:600;letter-spacing:.14em;
  text-transform:uppercase;background:var(--ink);color:#fff;padding:4px 9px;border-radius:10px;opacity:0;transition:all .7s 1.3s}
.ad.on .por .orb{opacity:.55;transform:scale(1)}
.ad.on .por .ring{opacity:1;transform:none}
.ad.on .por .tag{opacity:1;transform:translate(-50%,0)}
.ad.pulse .por .orb{animation:breathe 3.2s ease-in-out infinite}
@keyframes breathe{50%{transform:scale(1.1);opacity:.7}}
.star{position:absolute;color:#fff;opacity:0;z-index:1;pointer-events:none;filter:drop-shadow(0 0 4px rgba(255,236,200,.9));animation:twinkle 3.6s ease-in-out infinite}
.star svg{width:100%;height:100%;display:block}
@keyframes twinkle{0%,100%{opacity:0;transform:scale(.4)}45%{opacity:1;transform:scale(1)}}

/* marka bloğu */
.brand{position:absolute;z-index:2}
.acad{display:flex;align-items:center;gap:7px;font-size:8.5px;font-weight:600;letter-spacing:.3em;color:var(--ink2);opacity:0;transition:opacity .7s .2s}
.acad img{height:20px;width:auto}
.title{font-weight:500;letter-spacing:.02em;line-height:1;opacity:0;transform:translateY(8px);transition:all .9s .35s;white-space:nowrap}
.title sup{font-family:Arial,sans-serif;font-size:.36em;vertical-align:1.1em;margin-left:1px}
.sub{font-weight:500;line-height:1;opacity:0;transform:translateY(8px);transition:all .9s .6s}
.info{opacity:0;transition:opacity .8s 1s}
.date{font-weight:700;color:var(--ink)}
.time,.venue{color:var(--ink2);font-weight:500}
.season{color:var(--gold);font-weight:700}
.season em{font-style:normal;font-weight:500;color:var(--ink2)}
.ad.on .acad,.ad.on .title,.ad.on .sub,.ad.on .info{opacity:1;transform:none}
.title .sh{background:linear-gradient(100deg,var(--ink) 35%,#c79a5c 50%,var(--ink) 65%);background-size:300% 100%;background-position:100% 0;
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.ad.on .title .sh{animation:shine 3.6s 1.6s ease-in-out 3}
@keyframes shine{0%{background-position:100% 0}60%,100%{background-position:0 0}}

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
.kicker{font-size:8.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--c);transition:color .6s}
.ptitle{font-weight:600;line-height:1.05;margin-top:3px}
.ptxt{font-size:11px;color:var(--ink2);margin-top:4px;line-height:1.35}
.cta{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;padding:0 16px;border-radius:19px;
  background:var(--ink);color:#fff;font-size:12px;font-weight:700;letter-spacing:.02em;transition:background .5s,transform .2s,box-shadow .3s}
.cta:hover,.cta:focus-visible{transform:translateY(-1px);box-shadow:0 8px 20px -8px var(--ink);outline:none}
.cta i{font-style:normal;transition:transform .25s}
.cta:hover i{transform:translateX(3px)}
.ad.end .cta{background:#c8202a;animation:ctaPulse 1.8s ease-in-out 4}
@keyframes ctaPulse{50%{transform:scale(1.05)}}
.steps{display:flex;gap:4px;position:absolute}
.steps b{width:12px;height:3px;border-radius:2px;background:var(--line);transition:background .4s,width .4s}
.steps b.on{background:var(--c);width:20px}

/* ---------- 970x250 ---------- */
.s970{width:970px;height:250px}
.s970::before{background:linear-gradient(90deg,rgba(255,248,240,0) 0%,rgba(255,248,240,.35) 22%,rgba(255,248,240,.55) 52%,rgba(255,248,240,.35) 100%)}
.s970 .por{left:30px;top:32px;width:186px;height:186px}
.s970 .brand{left:242px;top:0;width:280px;height:250px;display:flex;flex-direction:column;justify-content:center}
.s970 .title{font-size:24.5px;margin-top:12px}
.s970 .sub{font-size:31px;margin-top:2px}
.s970 .info{margin-top:12px;font-size:11px;line-height:1.55}
.s970 .date{font-size:13px}
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
.s320{width:320px;height:480px}
.s320::before{background:linear-gradient(180deg,rgba(255,248,240,.45) 0%,rgba(255,248,240,.25) 40%,rgba(255,248,240,.55) 100%)}
.s320 .brand{left:0;right:0;top:14px;text-align:center}
.s320 .acad{justify-content:center;font-size:8px}
.s320 .acad img{height:16px}
.s320 .title{font-size:21px;margin-top:8px}
.s320 .sub{font-size:25px;margin-top:1px}
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

/* 30 sn sonra tüm döngüsel animasyonlar durur */
.ad.still *,.ad.still{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.ad *{animation:none!important;transition-duration:.01s!important}}
`;

function render(sizeKey, data, img) {
  const { w, h } = SIZES[sizeKey];
  const is970 = sizeKey === '970x250';
  const ev = data.event;
  const chips = data.pillars.map((p) =>
    `<button class="chip" type="button" data-k="${p.key}" style="--pc:${p.color}" aria-pressed="false">${icon(p.key)}<span>${esc(p.label)}</span></button>`).join('');
  const cfg = {
    size: sizeKey, url: data.url, utm: data.utm, cta: data.cta, ctaEnd: data.ctaEnd, timing: data.timing,
    pillars: data.pillars.map(({ key, label, title, text, color }) => ({ key, label, title, text, color })),
    overview: data.overview,
  };
  const info = `<div class="info">
      <div class="date">${esc(ev.date)}</div>
      <div class="time">${esc(ev.time)}</div>
      <div class="venue">${esc(ev.venue)}</div>
      <div class="season">${esc(ev.season)} <em>· ${esc(ev.note)}</em></div>
    </div>`;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${w},height=${h}">
<meta name="viewport" content="width=${w},height=${h},initial-scale=1">
<title>İçten Dışa Parla – ${esc(ev.sub)} 2026 (${sizeKey})</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_URL.replace(/&/g, '&amp;')}" rel="stylesheet">
<style>${CSS.replace(/\n\s*/g, '\n').trim()}</style>
</head>
<body>
<div id="ad" class="ad ${is970 ? 's970' : 's320'}" style="--bg:url(${img.bg})" aria-label="${esc(ev.academy)} – İçten Dışa Parla ${esc(ev.sub)}, ${esc(ev.date)} ${esc(ev.time)}, ${esc(ev.venue)}. ${esc(ev.note)}.">
  <span class="star a">${STAR}</span><span class="star b">${STAR}</span><span class="star c">${STAR}</span>
  <div class="por"><div class="orb"></div><div class="ring"><img src="${img.portrait}" alt="${esc(ev.host)}"></div><div class="tag">${esc(ev.host)}</div></div>
  <header class="brand">
    <div class="acad"><img src="${img.logo}" alt="">${esc(ev.academy)}</div>
    <h1 class="title cinzel"><span class="sh">${esc(ev.title)}</span><sup>®</sup></h1>
    <div class="sub serif">${esc(ev.sub)}</div>
    ${is970 ? info : ''}
  </header>
  ${is970 ? '<div class="sep"></div>' : info}
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
</div>
<script>
(function(){
  var C=${JSON.stringify(cfg)};
  var ad=document.getElementById('ad'),root=document.documentElement;
  var chips=[].slice.call(ad.querySelectorAll('.chip')),steps=[].slice.call(ad.querySelectorAll('.steps b'));
  var pt=ad.querySelector('.ptext'),kick=ad.querySelector('.kicker'),ttl=ad.querySelector('.ptitle'),txt=ad.querySelector('.ptxt');
  var ctaL=ad.querySelector('.ctal'),cta=ad.querySelector('.cta'),orb=ad.querySelector('.orb');
  var cur=C.overview,timer=null,autoIdx=-1,userChose=false,hovering=false,ended=false;

  function show(p,fromUser){
    cur=p;
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
  function exitUrl(){
    var u=C.utm,q='utm_source='+u.source+'&utm_medium='+u.medium+'&utm_campaign='+u.campaign+'&utm_content='+encodeURIComponent(C.size+'_'+cur.key);
    return C.url+(C.url.indexOf('?')<0?'?':'&')+q;
  }
  function openLink(){
    if(window.Enabler&&Enabler.exit){Enabler.exit('CTA_'+cur.key,exitUrl());return;}
    window.open(window.clickTag||exitUrl(),'_blank');
  }

  chips.forEach(function(c){
    c.addEventListener('click',function(e){
      e.stopPropagation();userChose=true;clearTimeout(timer);ad.classList.remove('end');
      var k=c.getAttribute('data-k');
      C.pillars.forEach(function(p){if(p.key===k)show(p,true);});
      if(window.Enabler&&Enabler.counter)Enabler.counter('secim_'+k);
    });
  });
  cta.addEventListener('click',function(e){e.stopPropagation();openLink();});
  ad.addEventListener('click',openLink);
  // Yalnızca gerçek fare hareketi duraklatır (sayfa kaydırılırken imleç üstte kalınca akış durmasın)
  ad.addEventListener('mousemove',function(){if(!hovering){hovering=true;clearTimeout(timer);}});
  ad.addEventListener('mouseleave',function(){hovering=false;if(!userChose&&!ended&&ad.classList.contains('ready'))timer=setTimeout(step,900);});

  function start(){
    show(C.overview);
    requestAnimationFrame(function(){ad.classList.add('on');});
    setTimeout(function(){ad.classList.add('ready');timer=setTimeout(step,C.timing.idle);},C.timing.intro);
    setTimeout(function(){if(!ended)finish();ad.classList.add('still');},C.timing.stopAfter);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
</script>
</body>
</html>
`;
}

module.exports = { render, SIZES };
