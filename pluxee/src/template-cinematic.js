'use strict';
/**
 * Pluxee "Geçiyor" – 970x250 interaktif masthead, SİNEMATİK sürüm (ana teslim).
 *
 * Görsel dil: fotoğrafik bokeh arka planlar (canvas ile üretilir: ışık, tane, vinyet),
 * 3B Pluxee kartı ve POS cihazı. Kart her sahnede POS'a dokunur, ekran "Onaylandı"
 * olur, sahne etiketi (burada / şurada / orada) onaylanır. Başlık sabit "Pluxee geçiyor",
 * altındaki kelime sahneyle değişir; finalde "her yerde."
 *
 * Sinyaller: seg (segment → alt metin + CTA), h/m (saat → öncü sahne), w=rain (isteğe
 * bağlı → online öncü), demo=1 (sinyal çubuğu). Konum ve nokta sayısı kullanılmaz.
 */

const SIZE = { key: '970x250', w: 970, h: 250, label: 'Billboard / Masthead' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NFC = (cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5a5 5 0 0 1 0 7M10.5 5.5a10 10 0 0 1 0 13M14.5 2.5a15 15 0 0 1 0 19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`;
const ARROW = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const PIN = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M6 11s3.6-3.6 3.6-6.4A3.6 3.6 0 0 0 2.4 4.6C2.4 7.4 6 11 6 11z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="6" cy="4.6" r="1.2" fill="currentColor"/></svg>`;
const CHECK = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.5l2.3 2.3L9.5 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/* ---------- CSS ---------- */
const CSS = `
:root{--navy:#221C46;--ink:#14102F;--green:#00EB5E;--lav:#B8A9FF;--ease:cubic-bezier(.22,.8,.26,1)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:970px;height:250px;overflow:hidden;background:#14102F}
body{font-family:Manrope,Inter,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.ad{position:relative;width:970px;height:250px;overflow:hidden;background:var(--ink);color:#fff;user-select:none;-webkit-user-select:none;outline:0;cursor:pointer}
.ad:focus-visible{box-shadow:inset 0 0 0 2px var(--green)}
/* fotoğrafik arka plan katmanları */
.bg{position:absolute;inset:0;overflow:hidden}
.bg canvas{position:absolute;left:0;top:0;width:970px;height:250px;opacity:0;transition:opacity 1s ease;transform-origin:60% 50%}
.bg canvas.is-on{opacity:1;animation:kb 7s linear forwards}
@keyframes kb{from{transform:scale(1)}to{transform:scale(1.06)}}
.grain{position:absolute;inset:0;opacity:.09;mix-blend-mode:overlay;pointer-events:none;background-repeat:repeat}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 140% at 62% 45%,transparent 45%,rgba(0,0,0,.55) 100%)}
.shade{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(20,16,47,.96) 0%,rgba(20,16,47,.9) 30%,rgba(20,16,47,.45) 50%,rgba(20,16,47,0) 66%),linear-gradient(180deg,rgba(20,16,47,0) 60%,rgba(20,16,47,.55) 100%)}
.rain{position:absolute;inset:0;opacity:0;transition:opacity .8s;pointer-events:none;background-image:repeating-linear-gradient(112deg,transparent 0 22px,rgba(210,225,255,.16) 22px 23px,transparent 23px 40px);background-size:80px 120px;animation:rain .5s linear infinite}
.ad.is-rain .rain{opacity:.55}
@keyframes rain{to{background-position:-26px 120px}}
/* sahne */
.scene{position:absolute;left:470px;top:0;width:500px;height:250px;touch-action:none;cursor:grab;z-index:4}
.scene.is-drag{cursor:grabbing}
.surface{position:absolute;left:40px;top:190px;width:440px;height:40px;border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.55),rgba(0,0,0,0) 70%);filter:blur(6px);opacity:0;transition:opacity .8s}
.ad.is-live .surface{opacity:1}
/* POS cihazı */
.pos{position:absolute;left:334px;top:52px;width:104px;height:150px;opacity:0;transform:translateY(8px);transition:opacity .7s .15s,transform .8s .15s var(--ease)}
.ad.is-live .pos{opacity:1;transform:none}
.pos-body{position:absolute;inset:0;border-radius:18px 18px 12px 12px;background:linear-gradient(180deg,#30323F 0%,#1E1F28 38%,#121319 100%);box-shadow:0 34px 50px -10px rgba(0,0,0,.75),0 6px 14px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.16),inset 0 -2px 0 rgba(0,0,0,.7),inset 1px 0 0 rgba(255,255,255,.05)}
.pos .slot{position:absolute;left:16px;right:16px;top:8px;height:4px;border-radius:2px;background:#050508;box-shadow:inset 0 1px 2px rgba(0,0,0,.9),0 1px 0 rgba(255,255,255,.08)}
.pos .nfcz{position:absolute;left:0;right:0;top:15px;height:12px;display:flex;justify-content:center;color:rgba(255,255,255,.45)}
.pos .nfcz svg{width:12px;height:12px}
.pos .led{position:absolute;right:14px;top:16px;width:5px;height:5px;border-radius:50%;background:#5a5f6e;box-shadow:0 0 0 1px rgba(0,0,0,.5);transition:background .25s,box-shadow .25s}
.pos.is-ok .led{background:var(--green);box-shadow:0 0 8px var(--green)}
.screen{position:absolute;left:11px;top:30px;width:82px;height:56px;border-radius:8px;overflow:hidden;background:radial-gradient(130% 110% at 50% -10%,#24365F,#101A33 65%);box-shadow:inset 0 0 0 2px #07080D,inset 0 0 16px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.05);transition:background .35s,box-shadow .35s}
.screen:before{content:"";position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.14),transparent 45%);pointer-events:none}
.screen span{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:8.5px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.72);transition:opacity .25s}
.screen .ok{color:var(--navy);font-weight:800;font-size:9px;opacity:0;display:flex;align-items:center;justify-content:center;gap:4px}
.screen .ok svg{width:11px;height:11px}
.pos.is-ok .screen{background:radial-gradient(130% 110% at 50% -10%,#3BFF8A,#00B54B 70%);box-shadow:inset 0 0 0 2px #07080D,inset 0 0 16px rgba(0,0,0,.25),0 0 28px rgba(0,235,94,.45)}
.pos.is-ok .screen .idle{opacity:0}.pos.is-ok .screen .ok{opacity:1}
.keys{position:absolute;left:12px;top:96px;width:80px;display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.keys i{height:10px;border-radius:3px;background:linear-gradient(180deg,#3B3D4B,#24252E);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 1px 0 rgba(0,0,0,.65)}
.keys i:nth-child(10){background:linear-gradient(180deg,#B33A3A,#7A2323)}
.keys i:nth-child(12){background:linear-gradient(180deg,#22C76A,#128A46)}
.ring{position:absolute;left:386px;top:60px;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:2px solid var(--green);opacity:0;pointer-events:none;z-index:6}
.scene.is-tap .ring{animation:ring .8s ease-out both}
.scene.is-tap .ring.r2{animation-delay:.18s}
@keyframes ring{0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(4.4)}}
/* etiket: burada / şurada / orada */
.tag{position:absolute;left:334px;top:30px;display:inline-flex;align-items:center;gap:5px;height:20px;padding:0 9px 0 7px;border-radius:99px;background:rgba(20,16,47,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);font-size:8.5px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#fff;opacity:0;transform:translateY(-4px);transition:opacity .35s,transform .45s var(--ease),background .3s,color .3s}
.tag.is-on{opacity:1;transform:none}
.tag svg{width:10px;height:10px}
.tag .ck{display:none}
.tag.is-ok{background:var(--green);color:var(--navy);box-shadow:0 6px 16px rgba(0,235,94,.35)}
.tag.is-ok .pin{display:none}.tag.is-ok .ck{display:block}
/* kart */
.card{position:absolute;left:72px;top:64px;width:190px;height:120px;border-radius:13px;transform:perspective(900px) rotateY(-24deg) rotateX(7deg) rotateZ(-9deg);transform-style:preserve-3d;transition:transform .55s var(--ease),opacity .6s .25s;opacity:0;z-index:5;box-shadow:0 36px 60px -12px rgba(0,0,0,.75),0 10px 22px rgba(0,0,0,.4);pointer-events:none;will-change:transform}
.ad.is-live .card{opacity:1}
.scene.is-tap .card{transform:perspective(900px) translate3d(78px,-10px,40px) rotateY(-34deg) rotateX(4deg) rotateZ(-16deg)}
.face{position:absolute;inset:0;border-radius:13px;overflow:hidden;background:linear-gradient(116deg,#3A2F78 0%,#261D5C 36%,#1A1345 66%,#120D33 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(0,0,0,.55),inset 1px 0 0 rgba(255,255,255,.08)}
.face .band{position:absolute;left:-40px;top:58px;width:300px;height:30px;background:linear-gradient(90deg,#00EB5E,#00C77E 60%,#00B37A);transform:rotate(-16deg);box-shadow:0 3px 12px rgba(0,235,94,.35)}
.face .band:after{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:rgba(255,255,255,.35)}
.face .gloss{position:absolute;inset:0;background:linear-gradient(104deg,transparent 28%,rgba(255,255,255,.22) 44%,rgba(255,255,255,.06) 50%,transparent 60%) 0 0/260% 100%;animation:sweep 4.4s ease-in-out infinite}
@keyframes sweep{0%,25%{background-position:130% 0}70%,100%{background-position:-30% 0}}
.face .chip{position:absolute;left:18px;top:30px;width:32px;height:24px;border-radius:5px;background:linear-gradient(135deg,#F9E6A8 0%,#D9AE4E 42%,#B98A2C 58%,#F0D28A 100%);box-shadow:inset 0 0 0 1px rgba(0,0,0,.3),0 1px 2px rgba(0,0,0,.35)}
.face .chip:before,.face .chip:after{content:"";position:absolute;left:0;right:0;height:1px;background:rgba(0,0,0,.35)}
.face .chip:before{top:8px}.face .chip:after{top:16px}
.face .chip i{position:absolute;top:0;bottom:0;width:1px;background:rgba(0,0,0,.35)}
.face .chip i.a{left:10px}.face .chip i.b{left:21px}
.face .nfc{position:absolute;right:16px;top:26px;width:20px;height:20px;color:rgba(255,255,255,.85)}
.face .wm{position:absolute;left:18px;bottom:16px;font-size:19px;font-weight:800;letter-spacing:-.02em;color:#fff;text-shadow:0 1px 0 rgba(255,255,255,.22),0 -1px 0 rgba(0,0,0,.55)}
.face .wm i{display:inline-block;width:6px;height:6px;border-radius:1.5px;background:var(--green);transform:rotate(45deg);margin-left:5px;vertical-align:middle}
/* sol sütun */
.left{position:absolute;left:44px;top:28px;width:410px;height:214px;z-index:6}
.logo{display:flex;align-items:center;gap:7px;height:24px}
.logo b{font-size:23px;font-weight:800;letter-spacing:-.03em;color:#fff;line-height:1}
.logo i{width:8px;height:8px;border-radius:2px;background:var(--green);transform:rotate(45deg);margin-top:2px}
.eyebrow{position:absolute;left:0;top:46px;height:14px;line-height:14px;font-size:10.5px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--green);white-space:nowrap;transition:opacity .25s,transform .3s var(--ease)}
.eyebrow.is-out{opacity:0;transform:translateY(4px)}
.hl{position:absolute;left:0;top:62px;font-size:29px;font-weight:800;letter-spacing:-.02em;line-height:1.08;color:#fff;white-space:nowrap}
.hl .l1{display:block}
.hl .l2{display:block;position:relative;width:410px;height:38px;line-height:32px;overflow:hidden;color:var(--green)}
.hl .l2 span{position:absolute;left:0;top:0;height:32px;line-height:32px;white-space:nowrap;transition:transform .5s var(--ease),opacity .4s}
.hl .l2 span.in{transform:translateY(110%);opacity:0}
.hl .l2 span.on{transform:none;opacity:1}
.hl .l2 span.out{transform:translateY(-110%);opacity:0}
.sub{position:absolute;left:0;top:132px;width:400px;font-size:12.5px;line-height:1.45;color:rgba(255,255,255,.82);height:36px;overflow:hidden;transition:opacity .25s}
.cta{position:absolute;left:0;top:176px;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px 0 18px;border-radius:99px;background:var(--green);color:var(--navy);font:inherit;font-size:12.5px;font-weight:800;border:0;cursor:pointer;box-shadow:0 10px 24px rgba(0,235,94,.3);transition:transform .25s var(--ease),box-shadow .25s;white-space:nowrap}
.cta:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(0,235,94,.45)}
.cta svg{width:12px;height:12px}
.ad.is-final .cta{animation:pulse 1.7s ease-in-out infinite}
@keyframes pulse{0%,100%{box-shadow:0 10px 24px rgba(0,235,94,.3)}50%{box-shadow:0 10px 24px rgba(0,235,94,.3),0 0 0 7px rgba(0,235,94,.15)}}
/* sahne göstergesi */
.steps{position:absolute;left:20px;top:222px;width:460px;display:grid;grid-template-columns:repeat(4,1fr);gap:12px;z-index:5}
.step{position:relative;height:16px;cursor:pointer}
.step b{display:block;font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.45);line-height:10px;transition:color .3s;white-space:nowrap}
.step b svg{width:8px;height:8px;vertical-align:-1px;margin-left:3px;display:none}
.step .bar{position:absolute;left:0;right:0;bottom:0;height:2px;border-radius:2px;background:rgba(255,255,255,.18);overflow:hidden}
.step .bar i{display:block;height:100%;width:0;background:var(--green);transition:width 0s}
.step.is-here b{color:#fff}
.step.is-done b{color:var(--green)}.step.is-done b svg{display:inline}
.step.is-done .bar i{width:100%!important;transition:width .3s}
/* sinyal çubuğu (sunum) */
.sig{position:absolute;left:480px;top:8px;height:18px;display:none;align-items:center;gap:4px;z-index:7;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;letter-spacing:.03em;pointer-events:none}
.ad.is-demo .sig{display:flex}
.sig span{padding:0 6px;height:18px;line-height:18px;border-radius:4px;background:rgba(0,0,0,.45);color:rgba(255,255,255,.85);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);white-space:nowrap}
.sig span b{color:var(--green);font-weight:700}
.sig .lbl{background:var(--green);color:var(--navy);font-weight:800;letter-spacing:.06em}
@media (prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;transition-delay:0s!important}}
`;

/* ---------- Tarayıcı tarafı (ES5) ---------- */
const JS = `
(function(){
var D=__DATA__,C=D.cinematic,T=D.timingCinematic;
var ad=document.getElementById('ad'),scene=ad.querySelector('.scene'),bg=ad.querySelector('.bg'),pos=ad.querySelector('.pos'),tag=ad.querySelector('.tag'),tagT=tag.querySelector('.t');
var eyebrow=ad.querySelector('.eyebrow'),l2=ad.querySelector('.l2'),sub=ad.querySelector('.sub'),cta=ad.querySelector('.cta'),ctaT=ad.querySelector('.cta-t'),sig=ad.querySelector('.sig'),steps=ad.querySelector('.steps');
var W=970,H=250;
var S={},order=[],idx=-1,timers=[],loops=0,manual=false,ended=false,finalState=false,embedded=false,resumeT=null,variant='',leadKey='',layers={},stepEls=[],currentCopy={};
var reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

function q(n){var m=new RegExp('[?&]'+n+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1].replace(/\\+/g,' ')):null}
function pad(n){return (n<10?'0':'')+n}
function norm(s){if(!C.segments[s.seg])s.seg=D.defaults.seg;s.hour=((Math.floor(+s.hour)||0)%24+24)%24;s.minute=Math.max(0,Math.min(59,Math.floor(+s.minute)||0));s.weather=s.weather==='rain'?'rain':'sun';s.demo=!!s.demo;return s}
function readSignals(){var now=new Date();var s={seg:q('seg')||D.defaults.seg,hour:q('h')!==null?+q('h'):now.getHours(),minute:q('m')!==null?+q('m'):now.getMinutes(),weather:q('w')||'sun',demo:q('demo')==='1'};var o=window.__PLUXEE_SIGNALS;if(o)for(var k in o)if(o.hasOwnProperty(k))s[k]=o[k];return norm(s)}
function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t}
function clearTimers(){while(timers.length)clearTimeout(timers.pop())}
function within(el,cls){while(el&&el!==ad){if(el.classList&&el.classList.contains(cls))return true;el=el.parentNode}return false}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}

/* ---- fotoğrafik arka plan üretimi ---- */
function rng(seed){return function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function rgba(hex,a){var n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'}
var PAL={
  restoran:{seed:11,base:['#9A5228','#3A1B0E','#100806'],key:'#FFC98A',bokeh:['#FFE4B8','#FFB868','#FF8F3A','#FFFFFF'],count:34,maxR:46,blur:9,fill:[.15,.9,320,'#FF9A4A',.22]},
  kafe:{seed:23,base:['#7A5238','#33201A','#120B08'],key:'#F5D3A8',bokeh:['#FFEBD0','#E8B07A','#FFFFFF','#D89A5C'],count:24,maxR:52,blur:11,fill:[.08,.35,300,'#FFF1DC',.28]},
  market:{seed:37,base:['#2E6E72','#173A40','#0A1618'],key:'#E9FFF6',bokeh:['#FFFFFF','#CFF6E9','#9BE3D0','#FFE9A8'],count:38,maxR:36,blur:8,bands:3,fill:[.5,1,360,'#A8F0DE',.16]},
  online:{seed:53,base:['#173A78','#0B1C3F','#04070F'],key:'#6FB4FF',bokeh:['#8FD6FF','#4FA3FF','#FFFFFF','#FFC46B'],count:32,maxR:40,blur:8,fill:[.28,.85,260,'#4FA3FF',.22]},
  rain:{seed:71,base:['#40556E','#1C2A3B','#0A1018'],key:'#C9D8EE',bokeh:['#E3ECF7','#9FC3E8','#FFFFFF'],count:26,maxR:42,blur:11,drops:true,fill:[.3,.8,300,'#8FB4E0',.14]}
};
function paint(P){
  var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');var r=rng(P.seed);
  var g=x.createLinearGradient(W,0,0,H);g.addColorStop(0,P.base[0]);g.addColorStop(.55,P.base[1]);g.addColorStop(1,P.base[2]);x.fillStyle=g;x.fillRect(0,0,W,H);
  var k=x.createRadialGradient(W*.84,-30,10,W*.84,-30,540);k.addColorStop(0,rgba(P.key,.5));k.addColorStop(1,rgba(P.key,0));x.fillStyle=k;x.fillRect(0,0,W,H);
  if(P.fill){var f=P.fill,fg=x.createRadialGradient(f[0]*W,f[1]*H,8,f[0]*W,f[1]*H,f[2]);fg.addColorStop(0,rgba(f[3],f[4]));fg.addColorStop(1,rgba(f[3],0));x.fillStyle=fg;x.fillRect(0,0,W,H)}
  if(P.bands)for(var b=0;b<P.bands;b++){var by=48+b*64,bgd=x.createLinearGradient(0,by-16,0,by+16);bgd.addColorStop(0,'rgba(255,255,255,0)');bgd.addColorStop(.5,'rgba(255,255,255,.07)');bgd.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=bgd;x.fillRect(0,by-16,W,32)}
  var o=document.createElement('canvas');o.width=W;o.height=H;var y=o.getContext('2d');
  for(var i=0;i<P.count;i++){
    var px=r()*W,py=r()*H*.8,rad=6+Math.pow(r(),1.7)*P.maxR,col=P.bokeh[Math.floor(r()*P.bokeh.length)],a=.12+r()*.4;
    var gg=y.createRadialGradient(px,py,rad*.15,px,py,rad);gg.addColorStop(0,rgba(col,a*.7));gg.addColorStop(.8,rgba(col,a));gg.addColorStop(1,rgba(col,0));
    y.fillStyle=gg;y.beginPath();y.arc(px,py,rad,0,6.2832);y.fill();
  }
  if('filter' in x){x.filter='blur('+P.blur+'px)';x.drawImage(o,0,0);x.filter='none'}else x.drawImage(o,0,0);
  var fl=x.createLinearGradient(0,H*.7,0,H);fl.addColorStop(0,'rgba(0,0,0,0)');fl.addColorStop(1,rgba(P.key,.16));x.fillStyle=fl;x.fillRect(0,H*.7,W,H*.3);
  var ll=x.createLinearGradient(W*.45,0,W,H);ll.addColorStop(0,rgba(P.key,0));ll.addColorStop(.5,rgba(P.key,.12));ll.addColorStop(1,rgba(P.key,0));x.fillStyle=ll;x.fillRect(0,0,W,H);
  if(P.drops){for(i=0;i<80;i++){var dx=r()*W,dy=r()*H,dr=1.5+r()*5,dg=x.createRadialGradient(dx-dr*.3,dy-dr*.3,dr*.1,dx,dy,dr);dg.addColorStop(0,'rgba(255,255,255,.55)');dg.addColorStop(.6,'rgba(200,220,255,.18)');dg.addColorStop(1,'rgba(200,220,255,0)');x.fillStyle=dg;x.beginPath();x.ellipse(dx,dy,dr,dr*1.3,0,0,6.2832);x.fill()}
    x.strokeStyle='rgba(220,235,255,.14)';x.lineWidth=1;for(i=0;i<14;i++){var sx=r()*W,sy=r()*H*.6,sl=20+r()*60;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx-sl*.18,sy+sl);x.stroke()}}
  var v=x.createRadialGradient(W*.55,H*.45,H*.35,W*.55,H*.45,W*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');x.fillStyle=v;x.fillRect(0,0,W,H);
  return c;
}
function grain(){var c=document.createElement('canvas');c.width=180;c.height=180;var x=c.getContext('2d'),d=x.createImageData(180,180),p=d.data,r=rng(5);for(var i=0;i<p.length;i+=4){var v=Math.floor(r()*255);p[i]=p[i+1]=p[i+2]=v;p[i+3]=255}x.putImageData(d,0,0);return c.toDataURL()}
try{
  for(var pk in PAL){var cv=paint(PAL[pk]);cv.setAttribute('data-key',pk);bg.appendChild(cv);layers[pk]=cv}
  ad.querySelector('.grain').style.backgroundImage='url('+grain()+')';
}catch(err){}
function showLayer(key){for(var k in layers)layers[k].classList.toggle('is-on',k===key)}

/* ---- sinyaller → sahne sırası ---- */
function leadFor(h){for(var i=0;i<C.lead.length;i++){var m=C.lead[i];if(m.from<=m.to?(h>=m.from&&h<=m.to):(h>=m.from||h<=m.to))return m.scene}return C.scenes[0].key}
function build(){
  leadKey=S.weather==='rain'?C.rainLead:leadFor(S.hour);
  var start=0;for(var i=0;i<C.scenes.length;i++)if(C.scenes[i].key===leadKey)start=i;
  order=[];for(i=0;i<C.scenes.length;i++){var sc=C.scenes[(start+i)%C.scenes.length];order.push({scene:sc,key:sc.key,visited:false,tag:sc.tag})}
  for(i=0;i<order.length;i++)order[i].tag=C.scenes[i].tag; /* etiket sırası konumdan bağımsız: burada, şurada, orada, orada da */
  steps.innerHTML='';stepEls=[];
  for(i=0;i<order.length;i++){var el=document.createElement('div');el.className='step';el.setAttribute('data-i',i);el.setAttribute('data-key',order[i].key);el.innerHTML='<b>'+esc(order[i].scene.label)+__CHECK__+'</b><span class="bar"><i></i></span>';steps.appendChild(el);stepEls.push(el)}
  ad.classList.toggle('is-rain',S.weather==='rain');ad.classList.toggle('is-demo',S.demo);
  variant=[S.seg,leadKey].join('-').toUpperCase()+(S.weather==='rain'?'-RAIN':'');ad.setAttribute('data-variant',variant);ad.setAttribute('data-lead',leadKey);
  var segLabel=D.segments[S.seg].label;
  sig.innerHTML='<span class="lbl">DATA LAYER</span><span>SEGMENT <b>'+esc(segLabel)+'</b></span><span>SAAT <b>'+pad(S.hour)+':'+pad(S.minute)+'</b></span>'+(S.weather==='rain'?'<span>HAVA <b>Yağmurlu</b></span>':'')+'<span>#'+esc(variant)+'</span>';
  sub.textContent=C.segments[S.seg].sub;ctaT.textContent=C.segments[S.seg].cta;
  currentCopy={title:'',word:'',sub:C.segments[S.seg].sub,cta:C.segments[S.seg].cta,line1:'Pluxee geçiyor'};
}
function setWord(txt){
  var old=l2.querySelector('span.on');var n=document.createElement('span');n.className='in';n.textContent=txt;l2.appendChild(n);
  fitWord(n);void n.offsetWidth;n.className='on';
  if(old){old.className='out';setTimeout(function(){if(old.parentNode)old.parentNode.removeChild(old)},520)}
  currentCopy.word=txt;
}
/* Uzun kelimeler sütuna sığdırılır; font sonradan yüklenirse yeniden ölçülür */
var WORD_MAX=404;
function fitWord(n){n.style.fontSize='';var w=n.scrollWidth;if(w>WORD_MAX)n.style.fontSize=Math.floor(29*WORD_MAX/w)+'px'}
function refit(){var n=l2.querySelector('span.on');if(n)fitWord(n)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refit,function(){});
window.addEventListener('load',refit);
function setTitle(txt){eyebrow.classList.add('is-out');setTimeout(function(){eyebrow.textContent=txt;eyebrow.classList.remove('is-out')},220);currentCopy.title=txt}
function visitedCount(){var n=0;for(var i=0;i<order.length;i++)if(order[i].visited)n++;return n}
function markHere(i){for(var k=0;k<stepEls.length;k++)stepEls[k].classList.toggle('is-here',k===i)}

/* ---- sahne akışı ---- */
function go(i,opts){
  opts=opts||{};idx=i;var o=order[i];
  showLayer(S.weather==='rain'&&o.key==='online'?'rain':o.key);
  markHere(i);setTitle(o.scene.title);setWord(o.scene.word);
  tag.classList.remove('is-ok');tagT.textContent=o.tag;tag.classList.add('is-on');
  pos.classList.remove('is-ok');scene.classList.remove('is-tap');
  var bar=stepEls[i].querySelector('.bar i');bar.style.transition='width 0s';bar.style.width='0%';void bar.offsetWidth;
  if(!opts.noAuto){bar.style.transition='width '+(T.dwell-T.tap)+'ms linear';}
  later(function(){tap(i);if(!opts.noAuto)bar.style.width='100%'},opts.quick?120:T.tap);
  emit('state');
}
function tap(i){
  var o=order[i];scene.classList.remove('is-tap');void scene.offsetWidth;scene.classList.add('is-tap');
  setTimeout(function(){pos.classList.add('is-ok');tag.classList.add('is-ok')},330);
  if(!o.visited){o.visited=true;stepEls[i].classList.add('is-done')}
  setTimeout(function(){scene.classList.remove('is-tap')},1100);
  emit('state');
}
function next(){
  var n=-1;for(var k=idx+1;k<order.length;k++)if(!order[k].visited){n=k;break}
  if(n<0)for(k=0;k<order.length;k++)if(!order[k].visited){n=k;break}
  if(n<0)finish(false);else{go(n);later(next,T.dwell)}
}
function finish(byUser){
  finalState=true;ad.classList.add('is-final');setTitle(C.final.title);setWord(C.final.word);
  for(var k=0;k<stepEls.length;k++){stepEls[k].classList.remove('is-here');stepEls[k].classList.add('is-done')}
  tag.classList.add('is-ok');tagT.textContent='her yerde';
  if(byUser||reduced){ended=true;ad.classList.add('is-ended');emit('state');return}
  emit('state');
  later(function(){loops++;if(loops<T.loops){reset();start()}else{ended=true;ad.classList.add('is-ended');emit('state')}},T.hold);
}
function reset(){
  clearTimers();finalState=false;ended=false;idx=-1;ad.classList.remove('is-final','is-ended');pos.classList.remove('is-ok');tag.classList.remove('is-on','is-ok');
  for(var k=0;k<order.length;k++){order[k].visited=false;stepEls[k].classList.remove('is-done','is-here');var b=stepEls[k].querySelector('.bar i');b.style.transition='width 0s';b.style.width='0%'}
}
function start(){
  ad.classList.add('is-live');
  if(reduced){for(var k=0;k<order.length;k++)order[k].visited=true;showLayer(order[order.length-1].key);finish(true);return}
  showLayer(S.weather==='rain'&&order[0].key==='online'?'rain':order[0].key);
  later(function(){go(0);later(next,T.dwell)},T.enter);
  emit('state');
}
function restart(){clearTimers();if(resumeT){clearTimeout(resumeT);resumeT=null}manual=false;scene.classList.remove('is-drag');ad.classList.remove('is-manual');loops=0;reset();build();start()}

/* ---- elle kontrol: sahne üzerinde yatay hareket sahneleri gezdirir ---- */
function xIn(e){var r=scene.getBoundingClientRect();return (e.clientX-r.left)*(500/(r.width||500))}
function enterManual(){if(manual)return;manual=true;clearTimers();if(resumeT){clearTimeout(resumeT);resumeT=null}ad.classList.add('is-manual');emit('state')}
function scrubTo(n){
  n=Math.max(0,Math.min(order.length-1,n));if(n===idx)return;
  go(n,{noAuto:true,quick:true});
  if(visitedCount()===order.length&&!finalState)setTimeout(function(){if(manual)finish(true)},900);
}
function onMove(e){enterManual();var x=xIn(e);var n=Math.floor((x-20)/(460/order.length));scrubTo(n)}
function leaveManual(){
  scene.classList.remove('is-drag');if(!manual)return;if(resumeT)clearTimeout(resumeT);
  resumeT=setTimeout(function(){resumeT=null;manual=false;ad.classList.remove('is-manual');if(ended)return;clearTimers();next();emit('state')},T.resume);
}
scene.addEventListener('pointermove',onMove);
scene.addEventListener('pointerdown',function(e){scene.classList.add('is-drag');onMove(e)});
scene.addEventListener('pointerup',function(){scene.classList.remove('is-drag')});
scene.addEventListener('pointerleave',leaveManual);
scene.addEventListener('pointercancel',leaveManual);
scene.addEventListener('click',function(e){e.stopPropagation()});
steps.addEventListener('click',function(e){var el=e.target;while(el&&el!==steps&&!(el.classList&&el.classList.contains('step')))el=el.parentNode;if(el&&el!==steps){enterManual();scrubTo(+el.getAttribute('data-i'));leaveManual()}});

/* ---- tıklama ---- */
function openLink(){var u=window.clickTag||D.brand.url;if(embedded&&!window.clickTag){emit('click',{url:u});return}if(window.Enabler&&window.Enabler.exit){window.Enabler.exit('CTA')}else{window.open(u,'_blank','noopener')}}
ad.addEventListener('click',function(e){if(within(e.target,'scene'))return;openLink()});
cta.addEventListener('click',function(e){e.stopPropagation();openLink()});
ad.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'){e.preventDefault();enterManual();scrubTo((idx<0?0:idx)+1);leaveManual()}
  else if(e.key==='ArrowLeft'){e.preventDefault();enterManual();scrubTo((idx<0?0:idx)-1);leaveManual()}
  else if(e.key==='Enter'){openLink()}
});

/* ---- sunum / entegrasyon API'si ---- */
function emit(type,extra){
  if(!embedded||!(window.parent&&window.parent!==window))return;
  var names=[];for(var k=0;k<order.length;k++)names.push(order[k].key);
  var msg={type:'pluxee:'+type,variant:variant,lead:leadKey,order:names,idx:idx,visited:visitedCount(),total:order.length,finalState:finalState,ended:ended,manual:manual,copy:currentCopy,signals:S};
  if(extra)for(var x in extra)if(extra.hasOwnProperty(x))msg[x]=extra[x];
  try{window.parent.postMessage(msg,'*')}catch(err){}
}
window.addEventListener('message',function(e){
  var d=e.data;if(!d||typeof d!=='object'||typeof d.type!=='string')return;
  if(d.type==='pluxee:signals'){embedded=true;var s=d.signals||{};for(var k in s)if(s.hasOwnProperty(k))S[k]=s[k];norm(S);restart()}
  else if(d.type==='pluxee:replay'){embedded=true;restart()}
  else if(d.type==='pluxee:demo'){S.demo=!!d.on;ad.classList.toggle('is-demo',S.demo)}
});
window.PLUXEE={setSignals:function(s){for(var k in s)if(s.hasOwnProperty(k))S[k]=s[k];norm(S);restart()},replay:restart,state:function(){var names=[];for(var k=0;k<order.length;k++)names.push(order[k].key);return {variant:variant,lead:leadKey,order:names,idx:idx,visited:visitedCount(),finalState:finalState,ended:ended,manual:manual,copy:currentCopy,signals:S}}};

S=readSignals();build();start();
})();
`;

/* ---------- HTML ---------- */
function render(data) {
  const runtime = {
    brand: { url: data.brand.url },
    timingCinematic: data.timingCinematic,
    segments: data.segments,
    cinematic: data.cinematic,
    defaults: { seg: data.defaults.seg },
  };
  const json = JSON.stringify(runtime).replace(/<\//g, '<\\/');
  const js = JS.replace('__DATA__', json).replace('__CHECK__', JSON.stringify(CHECK));
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${SIZE.w},initial-scale=1">
<meta name="ad.size" content="width=${SIZE.w},height=${SIZE.h}">
<title>${esc(data.brand.name)} – ${esc(data.brand.campaign)} · ${SIZE.key}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
<style>${CSS}</style>
</head>
<body>
<div class="ad" id="ad" role="region" aria-label="${esc(data.brand.name)} reklamı" tabindex="0">
  <div class="bg"></div>
  <div class="grain"></div>
  <div class="vig"></div>
  <div class="rain"></div>
  <div class="shade"></div>
  <div class="scene" aria-label="Sahneler arasında gezinin">
    <div class="surface"></div>
    <div class="pos"><div class="pos-body"><span class="slot"></span><span class="nfcz">${NFC('')}</span><span class="led"></span><div class="screen"><span class="idle">${esc(data.cinematic.pos.idle)}</span><span class="ok">${CHECK}${esc(data.cinematic.pos.ok)}</span></div><div class="keys"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>
    <span class="ring"></span><span class="ring r2"></span>
    <div class="tag"><span class="pin">${PIN}</span><span class="ck">${CHECK}</span><span class="t"></span></div>
    <div class="card" aria-hidden="true"><div class="face"><span class="band"></span><span class="gloss"></span><span class="chip"><i class="a"></i><i class="b"></i></span>${NFC('nfc')}<span class="wm">pluxee<i></i></span></div></div>
    <div class="steps"></div>
  </div>
  <div class="left">
    <div class="logo"><b>pluxee</b><i></i></div>
    <span class="eyebrow"></span>
    <div class="hl"><span class="l1">Pluxee geçiyor</span><span class="l2"></span></div>
    <p class="sub"></p>
    <button class="cta" type="button"><span class="cta-t"></span>${ARROW}</button>
  </div>
  <div class="sig" aria-hidden="true"></div>
</div>
<script>${js}</script>
</body>
</html>`;
}

module.exports = { render, SIZE };
