'use strict';
/**
 * Tüm çalışmaların ortak parçaları: boyutlar, fontlar, temel CSS, marka bloğu ve tıklama/çıkış altyapısı.
 */
const SIZES = {
  '970x250': { w: 970, h: 250, label: 'Billboard' },
  '320x480': { w: 320, h: 480, label: 'Mobil Interstitial' },
};

const FONT_URL = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Montserrat:wght@400;500;600;700&display=swap';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

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
const stars = (n = 3) => Array.from({ length: n }, (_, i) => `<span class="star ${'abcdefgh'[i]}">${STAR}</span>`).join('');
// Açılışta dışa saçılan ışık parçacıkları (.ad.burst ile tetiklenir)
const burst = (n = 10) => `<div class="burst" aria-hidden="true">${Array.from({ length: n }, (_, i) => {
  const a = (i / n) * Math.PI * 2, d = 70 + (i % 3) * 22;
  return `<span style="--x:${Math.round(Math.cos(a) * d)}px;--y:${Math.round(Math.sin(a) * d)}px;animation-delay:${(i % 4) * 40}ms">${STAR}</span>`;
}).join('')}</div>`;

const BASE_CSS = `
:root{--ink:#1f1a17;--ink2:#5e5148;--gold:#a8804c;--veil:rgba(255,250,244,.8);--line:rgba(31,26,23,.13);--red:#c8202a;--c:#b08a57}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:100%;height:100%;overflow:hidden;background:#f3e3d2}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
.ad{position:relative;overflow:hidden;cursor:pointer;color:var(--ink);font-family:Montserrat,'Segoe UI',Arial,sans-serif;
  background:#f1dcc6 var(--bg) center/cover no-repeat;border:1px solid rgba(31,26,23,.12);
  -webkit-font-smoothing:antialiased;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent}
.ad::before{content:'';position:absolute;inset:0;pointer-events:none;z-index:0}
.s970{width:970px;height:250px}
.s320{width:320px;height:480px}
.s970::before{background:linear-gradient(90deg,rgba(255,248,240,0) 0%,rgba(255,248,240,.35) 22%,rgba(255,248,240,.55) 52%,rgba(255,248,240,.35) 100%)}
.s320::before{background:linear-gradient(180deg,rgba(255,248,240,.45) 0%,rgba(255,248,240,.25) 40%,rgba(255,248,240,.55) 100%)}
.cinzel{font-family:Cinzel,'Trajan Pro',Georgia,serif}
.serif{font-family:'Cormorant Garamond',Georgia,'Times New Roman',serif}

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
.s970 .brand .title{font-size:24.5px;margin-top:12px}
.s970 .brand .sub{font-size:31px;margin-top:2px}
.s970 .brand .info{margin-top:12px;font-size:11px;line-height:1.55}
.s970 .brand .date{font-size:13px}
.s320 .brand{left:0;right:0;top:14px;text-align:center}
.s320 .acad{justify-content:center;font-size:8px}
.s320 .acad img{height:16px}
.s320 .brand .title{font-size:21px;margin-top:8px}
.s320 .brand .sub{font-size:25px;margin-top:1px}

/* portre */
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

/* yıldız pırıltıları */
.star{position:absolute;color:#fff;opacity:0;z-index:1;pointer-events:none;filter:drop-shadow(0 0 4px rgba(255,236,200,.9));animation:twinkle 3.6s ease-in-out infinite}
.star svg,.burst svg{width:100%;height:100%;display:block}
@keyframes twinkle{0%,100%{opacity:0;transform:scale(.4)}45%{opacity:1;transform:scale(1)}}
.burst{position:absolute;width:0;height:0;z-index:6;pointer-events:none}
.burst span{position:absolute;left:-7px;top:-7px;width:14px;height:14px;color:#fff;opacity:0;filter:drop-shadow(0 0 5px rgba(255,214,150,1))}
.ad.burst-on .burst span{animation:fly 1.1s cubic-bezier(.2,.8,.2,1) forwards}
@keyframes fly{0%{opacity:0;transform:translate(0,0) scale(.3)}20%{opacity:1}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(1.1)}}

/* CTA */
.cta{flex:none;display:inline-flex;align-items:center;justify-content:center;gap:7px;height:38px;padding:0 16px;border-radius:19px;
  background:var(--ink);color:#fff;font-size:12px;font-weight:700;letter-spacing:.02em;transition:background .5s,transform .2s,box-shadow .3s}
.cta:hover,.cta:focus-visible{transform:translateY(-1px);box-shadow:0 8px 20px -8px var(--ink);outline:none}
.cta i{font-style:normal;transition:transform .25s}
.cta:hover i{transform:translateX(3px)}
.cta.red{background:var(--red)}
.cta.pulse{animation:ctaPulse 1.8s ease-in-out 4}
@keyframes ctaPulse{50%{transform:scale(1.05)}}
.kicker{font-size:8.5px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--c);transition:color .6s}
.hide{display:none!important}

/* 30 sn sonra tüm döngüsel animasyonlar durur */
.ad.still *,.ad.still{animation-play-state:paused!important}
@media (prefers-reduced-motion:reduce){.ad *{animation:none!important;transition-duration:.01s!important}}
`;

const infoHTML = (ev) => `<div class="info">
      <div class="date">${esc(ev.date)}</div>
      <div class="time">${esc(ev.time)}</div>
      <div class="venue">${esc(ev.venue)}</div>
      <div class="season">${esc(ev.season)} <em>· ${esc(ev.note)}</em></div>
    </div>`;

const brandHTML = (ev, img, withInfo) => `<header class="brand">
    <div class="acad"><img src="${img.logo}" alt="">${esc(ev.academy)}</div>
    <h1 class="title cinzel"><span class="sh">${esc(ev.title)}</span><sup>®</sup></h1>
    <div class="sub serif">${esc(ev.sub)}</div>
    ${withInfo ? infoHTML(ev) : ''}
  </header>`;

const portraitHTML = (ev, img, tag = true) =>
  `<div class="por"><div class="orb"></div><div class="ring"><img src="${img.portrait}" alt="${esc(ev.host)}"></div>${tag ? `<div class="tag">${esc(ev.host)}</div>` : ''}</div>`;

/**
 * Ortak çalışma zamanı: tıklama çıkışı (clickTag / Enabler / program sayfası, UTM eklenmez), açılış ve 30 sn durdurma.
 * Konsept betikleri: AD.exit(detay), AD.count(ad), AD.burst(), AD.onStop.
 */
const RUNTIME = (cfg) => `
var C=${JSON.stringify(cfg)};
var ad=document.getElementById('ad');
var AD={detail:'genel',stopped:false,
  exit:function(d){d=d||AD.detail;if(window.Enabler&&Enabler.exit){Enabler.exit('CTA_'+d,C.url);return;}window.open(window.clickTag||C.url,'_blank');},
  count:function(n){if(window.Enabler&&Enabler.counter)Enabler.counter(n);},
  burst:function(){ad.classList.remove('burst-on');void ad.offsetWidth;ad.classList.add('burst-on');},
  ready:function(fn){if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',fn);else fn();}
};
// Kontroller (data-noexit) dışındaki her tıklama reklam çıkışıdır
ad.addEventListener('click',function(e){for(var n=e.target;n&&n!==ad;n=n.parentNode){if(n.hasAttribute&&n.hasAttribute('data-noexit'))return;}AD.exit();});
[].forEach.call(ad.querySelectorAll('.cta'),function(b){b.addEventListener('click',function(e){e.stopPropagation();AD.exit();});});
AD.ready(function(){requestAnimationFrame(function(){ad.classList.add('on');});
  setTimeout(function(){AD.stopped=true;if(AD.onStop)AD.onStop();ad.classList.add('still');},C.timing.stopAfter);});
`;

function page({ sizeKey, title, css, body, script }) {
  const { w, h } = SIZES[sizeKey];
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${w},height=${h}">
<meta name="viewport" content="width=${w},height=${h},initial-scale=1">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONT_URL.replace(/&/g, '&amp;')}" rel="stylesheet">
<style>${(BASE_CSS + css).replace(/\n\s*/g, '\n').trim()}</style>
</head>
<body>
${body}
<script>
(function(){
${script.trim()}
})();
</script>
</body>
</html>
`;
}

module.exports = { SIZES, FONT_URL, esc, icon, STAR, stars, burst, BASE_CSS, infoHTML, brandHTML, portraitHTML, RUNTIME, page };
