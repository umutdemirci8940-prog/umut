'use strict';
/**
 * Pluxee "Geçiyor" – 970x250 interaktif masthead, KORİDOR sürümü (ana teslim).
 *
 * Fikir: "geçiyor" kelimesinin gerçek anlamı. Pluxee kartı, perspektifli bir ışık
 * koridorunda kabul noktalarının kapılarından (Restoran, Kafe, Market, Online) geçer.
 * Kullanıcı sürükleyerek yol alır ya da basılı tutup hızlanır; imleç koridoru yönlendirir.
 * Her kapıdan geçişte yeşil flaş, "Geçti ✓", hız çizgileri, kısa sarsıntı; rota çubuğu dolar.
 * Finalde koridor açılır: "Her yerde, Pluxee geçiyor." Dokunulmazsa koridor kendiliğinden
 * kat edilir (≈ 17 sn) ve final karesinde durur.
 *
 * Sinyaller: seg (segment → alt metin + CTA), h/m (saat → kapı sırası), w=rain (isteğe bağlı),
 * demo=1 (sinyal çubuğu). Konum ve nokta sayısı kullanılmaz.
 */

const SIZE = { key: '970x250', w: 970, h: 250, label: 'Billboard / Masthead' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const NFC = (cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5a5 5 0 0 1 0 7M10.5 5.5a10 10 0 0 1 0 13M14.5 2.5a15 15 0 0 1 0 19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`;
const ARROW = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const CHECK = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.5l2.3 2.3L9.5 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const DRAG = `<svg viewBox="0 0 28 12" aria-hidden="true"><path d="M5 6h18M8.5 2.5L5 6l3.5 3.5M19.5 2.5L23 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const AGAIN = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6a3.8 3.8 0 1 0 1.1-2.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M2 1.8v2.4h2.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICONS = {
  restoran: `<path d="M7 3v7a2 2 0 0 0 2 2v9M9 3v6M11 3v6M17 3c-2 1-3 3.5-3 6v3h3v9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  kafe: `<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h2a2.5 2.5 0 0 1 0 5h-2M8 6c0-1.5 1.2-1.5 1.2-3M12 6c0-1.5 1.2-1.5 1.2-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  market: `<path d="M4 9h16l-1.6 10H5.6zM8.5 9l3.5-5 3.5 5M9.5 13v3M12 13v3M14.5 13v3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
  online: `<rect x="7" y="3" width="10" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 12.5l1.6 1.6 3-3.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="18" r=".9" fill="currentColor"/>`,
};

/* ---------- CSS ---------- */
const CSS = `
:root{--navy:#221C46;--ink:#0F0C26;--green:#00EB5E;--lav:#B8A9FF;--ease:cubic-bezier(.22,.8,.26,1)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:970px;height:250px;overflow:hidden;background:#0F0C26}
body{font-family:Manrope,Inter,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.ad{position:relative;width:970px;height:250px;overflow:hidden;background:var(--ink);color:#fff;user-select:none;-webkit-user-select:none;outline:0;cursor:pointer}
.ad:focus-visible{box-shadow:inset 0 0 0 2px var(--green)}
/* arka plan katmanları */
.bg{position:absolute;inset:0;overflow:hidden}
.bg canvas{position:absolute;left:0;top:0;width:970px;height:250px;opacity:0;transition:opacity 1.1s ease}
.bg canvas.is-on{opacity:1}
.grain{position:absolute;inset:0;opacity:.08;mix-blend-mode:overlay;pointer-events:none;background-repeat:repeat}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 140% at 70% 48%,transparent 40%,rgba(0,0,0,.6) 100%)}
.shade{position:absolute;inset:0;pointer-events:none;z-index:3;background:linear-gradient(90deg,rgba(15,12,38,.97) 0%,rgba(15,12,38,.9) 32%,rgba(15,12,38,.5) 48%,rgba(15,12,38,0) 64%),linear-gradient(180deg,rgba(15,12,38,0) 70%,rgba(15,12,38,.5) 100%)}
.rain{position:absolute;inset:0;opacity:0;transition:opacity .8s;pointer-events:none;background-image:repeating-linear-gradient(112deg,transparent 0 22px,rgba(210,225,255,.16) 22px 23px,transparent 23px 40px);background-size:80px 120px;animation:rain .5s linear infinite}
.ad.is-rain .rain{opacity:.5}
@keyframes rain{to{background-position:-26px 120px}}
/* koridor: zemin ızgarası, ışınlar, kapılar */
.world{position:absolute;inset:0;overflow:hidden;z-index:1}
.ad.is-shake .world{animation:shake .32s ease-out}
@keyframes shake{0%{transform:translate(0,0)}25%{transform:translate(2px,-1.5px)}50%{transform:translate(-2px,1px)}75%{transform:translate(1px,1.5px)}100%{transform:translate(0,0)}}
.floor{position:absolute;left:440px;top:122px;width:600px;height:360px;transform-origin:50% 0;transform:perspective(240px) rotateX(66deg);opacity:.32;pointer-events:none;background-image:repeating-linear-gradient(90deg,rgba(0,235,94,.5) 0 1px,transparent 1px 50px),repeating-linear-gradient(0deg,rgba(0,235,94,.5) 0 1px,transparent 1px 40px);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 18%,#000 55%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 18%,#000 55%,transparent 100%)}
.rays{position:absolute;inset:0;pointer-events:none}
.ray{position:absolute;left:0;top:0;width:2px;height:120px;border-radius:2px;background:linear-gradient(180deg,rgba(255,255,255,0),rgba(200,255,225,.95) 60%,rgba(0,235,94,0));transform-origin:50% 100%;opacity:0;will-change:transform,opacity}
.gate{position:absolute;left:0;top:0;width:540px;height:236px;margin:-118px 0 0 -270px;transform-origin:50% 50%;opacity:0;will-change:transform,opacity;pointer-events:none}
.gate .frame{position:absolute;inset:0;border-radius:30px;border:2px solid rgba(255,255,255,.7);box-shadow:0 0 0 1px rgba(0,235,94,.25),0 0 40px rgba(0,235,94,.22),inset 0 0 40px rgba(0,235,94,.12)}
.gate .frame:before{content:"";position:absolute;inset:8px;border-radius:24px;border:1px solid rgba(0,235,94,.28)}
.gate .lbl{position:absolute;left:28px;top:20px;display:flex;align-items:center;gap:10px;font-size:17px;font-weight:800;letter-spacing:.26em;text-transform:uppercase;color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.5)}
.gate .lbl svg{width:22px;height:22px;color:var(--green)}
.gate .lbl small{font-size:11px;letter-spacing:.2em;color:rgba(255,255,255,.6);font-weight:700}
.gate .pass{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(.6);display:inline-flex;align-items:center;gap:10px;padding:8px 18px;border-radius:99px;background:var(--green);color:var(--navy);font-size:20px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;opacity:0;white-space:nowrap}
.gate .pass svg{width:20px;height:20px}
.gate.is-pass .frame{animation:gflash .7s ease-out both}
.gate.is-pass .pass{animation:gpass .9s var(--ease) both}
@keyframes gflash{0%{border-color:#fff;box-shadow:0 0 0 3px rgba(0,235,94,.9),0 0 80px rgba(0,235,94,.7),inset 0 0 90px rgba(0,235,94,.4)}100%{border-color:rgba(255,255,255,.7);box-shadow:0 0 0 1px rgba(0,235,94,.25),0 0 40px rgba(0,235,94,.22),inset 0 0 40px rgba(0,235,94,.12)}}
@keyframes gpass{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}20%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-50%) scale(1.15)}}
.portal{position:absolute;left:740px;top:122px;width:200px;height:200px;margin:-100px 0 0 -100px;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.95) 0%,rgba(124,255,176,.8) 22%,rgba(0,235,94,.35) 48%,rgba(0,235,94,0) 70%);transform:scale(0);opacity:0;pointer-events:none;will-change:transform,opacity}
/* etkileşim katmanı */
.scene{position:absolute;left:440px;top:0;width:530px;height:250px;z-index:4;touch-action:none;cursor:grab}
.scene.is-drag{cursor:grabbing}
/* rota çubuğu */
.route{position:absolute;left:56px;top:204px;width:448px;height:32px;pointer-events:none}
.route .line{position:absolute;left:0;right:0;top:22px;height:2px;background:rgba(255,255,255,.16);border-radius:2px}
.route .prog{position:absolute;left:0;top:22px;height:2px;width:0;background:var(--green);border-radius:2px;box-shadow:0 0 10px rgba(0,235,94,.7)}
.node{position:absolute;top:0;width:64px;height:32px;margin-left:-32px;pointer-events:auto;cursor:pointer}
.node i{position:absolute;left:27px;top:18px;width:10px;height:10px;border-radius:50%;background:#2A2550;box-shadow:0 0 0 2px rgba(255,255,255,.35);transition:background .3s,box-shadow .3s,transform .3s}
.node b{position:absolute;left:50%;top:0;transform:translateX(-50%);font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);white-space:nowrap;transition:color .3s}
.node b svg{width:8px;height:8px;vertical-align:-1px;margin-left:3px;display:none}
.node.is-next i{background:#fff;box-shadow:0 0 0 2px rgba(255,255,255,.35),0 0 12px rgba(255,255,255,.6)}
.node.is-next b{color:#fff}
.node.is-done i{background:var(--green);box-shadow:0 0 0 2px rgba(0,235,94,.35),0 0 12px rgba(0,235,94,.8);transform:scale(1.15)}
.node.is-done b{color:var(--green)}.node.is-done b svg{display:inline}
/* kart (ön plan) */
.card{position:absolute;left:222px;top:100px;width:156px;height:98px;border-radius:11px;transform-style:preserve-3d;transition:opacity .6s .25s;opacity:0;z-index:5;box-shadow:0 30px 50px -10px rgba(0,0,0,.75),0 8px 18px rgba(0,0,0,.4);pointer-events:none;will-change:transform}
.ad.is-live .card{opacity:1}
.face{position:absolute;inset:0;border-radius:11px;overflow:hidden;background:linear-gradient(116deg,#3A2F78 0%,#261D5C 36%,#1A1345 66%,#120D33 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(0,0,0,.55)}
.face .band{position:absolute;left:-30px;top:48px;width:240px;height:24px;background:linear-gradient(90deg,#00EB5E,#00C77E 60%,#00B37A);transform:rotate(-16deg);box-shadow:0 3px 12px rgba(0,235,94,.35);transition:filter .2s}
.card.is-pass .face .band{animation:bandflash .6s ease-out}
@keyframes bandflash{0%{filter:brightness(2.2) saturate(.6)}100%{filter:none}}
.face .gloss{position:absolute;inset:0;background:linear-gradient(104deg,transparent 28%,rgba(255,255,255,.24) 44%,rgba(255,255,255,.06) 50%,transparent 60%) 0 0/260% 100%;animation:sweep 4.2s ease-in-out infinite}
@keyframes sweep{0%,25%{background-position:130% 0}70%,100%{background-position:-30% 0}}
.face .chip{position:absolute;left:14px;top:24px;width:26px;height:19px;border-radius:4px;background:linear-gradient(135deg,#F9E6A8 0%,#D9AE4E 42%,#B98A2C 58%,#F0D28A 100%);box-shadow:inset 0 0 0 1px rgba(0,0,0,.3),0 1px 2px rgba(0,0,0,.35)}
.face .chip:before,.face .chip:after{content:"";position:absolute;left:0;right:0;height:1px;background:rgba(0,0,0,.35)}
.face .chip:before{top:6px}.face .chip:after{top:12px}
.face .nfc{position:absolute;right:13px;top:20px;width:16px;height:16px;color:rgba(255,255,255,.85)}
.face .wm{position:absolute;left:14px;bottom:12px;font-size:15px;font-weight:800;letter-spacing:-.02em;color:#fff;text-shadow:0 1px 0 rgba(255,255,255,.22),0 -1px 0 rgba(0,0,0,.55)}
.face .wm i{display:inline-block;width:5px;height:5px;border-radius:1.5px;background:var(--green);transform:rotate(45deg);margin-left:4px;vertical-align:middle}
.burst{position:absolute;left:300px;top:118px;width:0;height:0;pointer-events:none;z-index:7}
.burst i{position:absolute;left:-3px;top:-3px;width:6px;height:6px;border-radius:50%;background:var(--green);opacity:0;animation:burst .8s cubic-bezier(.2,.8,.3,1) forwards}
.burst i.w{background:#fff;width:4px;height:4px}
@keyframes burst{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.3)}}
/* ipucu ve tekrar */
.hint{position:absolute;left:300px;top:72px;display:inline-flex;align-items:center;gap:8px;padding:5px 10px;border-radius:99px;background:rgba(15,12,38,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#fff;opacity:0;transform:translate(-50%,4px);transition:opacity .4s,transform .5s var(--ease);pointer-events:none;white-space:nowrap;z-index:8}
.hint small{font-size:8px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.55);text-transform:none}
.hint svg{width:22px;height:10px;color:var(--green);animation:nudge 1.3s ease-in-out infinite}
@keyframes nudge{0%,100%{transform:translateX(-3px)}50%{transform:translateX(3px)}}
.scene.is-hint .hint{opacity:1;transform:translate(-50%,0)}
.scene.is-passing .hint{opacity:0;transform:translate(-50%,4px)}
.again{position:absolute;left:300px;top:68px;transform:translateX(-50%);display:none;align-items:center;gap:6px;height:24px;padding:0 11px 0 9px;border-radius:99px;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);font:inherit;font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#fff;border:0;cursor:pointer;z-index:8;transition:background .2s}
.again:hover{background:rgba(255,255,255,.2)}
.again svg{width:11px;height:11px}
.ad.is-ended .again{display:inline-flex}
/* sol sütun */
.left{position:absolute;left:44px;top:28px;width:400px;height:214px;z-index:6}
.logo{display:flex;align-items:center;gap:7px;height:24px}
.logo b{font-size:23px;font-weight:800;letter-spacing:-.03em;color:#fff;line-height:1}
.logo i{width:8px;height:8px;border-radius:2px;background:var(--green);transform:rotate(45deg);margin-top:2px}
.eyebrow{position:absolute;left:0;top:46px;height:14px;line-height:14px;font-size:10.5px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--green);white-space:nowrap;transition:opacity .25s,transform .3s var(--ease)}
.eyebrow.is-out{opacity:0;transform:translateY(4px)}
.hl{position:absolute;left:0;top:62px;font-size:29px;font-weight:800;letter-spacing:-.02em;line-height:1.08;color:#fff;white-space:nowrap}
.hl .l1{display:block;position:relative;width:400px;height:36px;line-height:32px;overflow:hidden;color:var(--green)}
.hl .l1 span{position:absolute;left:0;top:0;height:32px;line-height:32px;white-space:nowrap;transition:transform .5s var(--ease),opacity .4s}
.hl .l1 span.in{transform:translateY(110%);opacity:0}
.hl .l1 span.on{transform:none;opacity:1}
.hl .l1 span.out{transform:translateY(-110%);opacity:0}
.hl .l2{display:block;height:32px;line-height:32px}
.sub{position:absolute;left:0;top:134px;width:392px;font-size:12.5px;line-height:1.45;color:rgba(255,255,255,.82);height:36px;overflow:hidden}
.cta{position:absolute;left:0;top:176px;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px 0 18px;border-radius:99px;background:var(--green);color:var(--navy);font:inherit;font-size:12.5px;font-weight:800;border:0;cursor:pointer;box-shadow:0 10px 24px rgba(0,235,94,.3);transition:transform .25s var(--ease),box-shadow .25s;white-space:nowrap}
.cta:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(0,235,94,.45)}
.cta svg{width:12px;height:12px}
.ad.is-final .cta{animation:pulse 1.7s ease-in-out infinite}
@keyframes pulse{0%,100%{box-shadow:0 10px 24px rgba(0,235,94,.3)}50%{box-shadow:0 10px 24px rgba(0,235,94,.3),0 0 0 7px rgba(0,235,94,.15)}}
/* sinyal çubuğu (sunum) */
.sig{position:absolute;right:12px;top:8px;height:18px;display:none;align-items:center;gap:4px;z-index:7;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;letter-spacing:.03em;pointer-events:none}
.ad.is-demo .sig{display:flex}
.sig span{padding:0 6px;height:18px;line-height:18px;border-radius:4px;background:rgba(0,0,0,.5);color:rgba(255,255,255,.85);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);white-space:nowrap}
.sig span b{color:var(--green);font-weight:700}
.sig .lbl{background:var(--green);color:var(--navy);font-weight:800;letter-spacing:.06em}
@media (prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;transition-delay:0s!important}}
`;

/* ---------- Tarayıcı tarafı (ES5) ---------- */
const JS = `
(function(){
var D=__DATA__,C=D.cinematic,K=D.corridor,T=K.timing;
var ad=document.getElementById('ad'),scene=ad.querySelector('.scene'),bg=ad.querySelector('.bg'),world=ad.querySelector('.world'),floor=ad.querySelector('.floor'),raysEl=ad.querySelector('.rays'),portal=ad.querySelector('.portal'),card=ad.querySelector('.card'),burst=ad.querySelector('.burst'),again=ad.querySelector('.again'),route=ad.querySelector('.route'),prog=route.querySelector('.prog');
var eyebrow=ad.querySelector('.eyebrow'),l1=ad.querySelector('.l1'),sub=ad.querySelector('.sub'),cta=ad.querySelector('.cta'),ctaT=ad.querySelector('.cta-t'),sig=ad.querySelector('.sig');
var W=970,H=250,VP={x:740,y:122};
var S={},order=[],gates=[],nodes=[],layers={},variant='',leadKey='',embedded=false,timers=[],currentCopy={};
var t=0,phase='',auto=true,drag=null,velT=0,inertia=false,boost=false,tween=null,steer={x:0,y:0},steerT={x:0,y:0},last=0,raf=0,speedF=1,nextIdx=0,userPlayed=false,hintOn=false,finalState=false,ended=false,resumeT=null,hintT=null,holdT=null,live=false;
var reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
var cruiseV=1/T.cruise; // t birimi / ms

function q(n){var m=new RegExp('[?&]'+n+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1].replace(/\\+/g,' ')):null}
function pad(n){return (n<10?'0':'')+n}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function norm(s){if(!C.segments[s.seg])s.seg=D.defaults.seg;s.hour=((Math.floor(+s.hour)||0)%24+24)%24;s.minute=clamp(Math.floor(+s.minute)||0,0,59);s.weather=s.weather==='rain'?'rain':'sun';s.demo=!!s.demo;return s}
function readSignals(){var now=new Date();var s={seg:q('seg')||D.defaults.seg,hour:q('h')!==null?+q('h'):now.getHours(),minute:q('m')!==null?+q('m'):now.getMinutes(),weather:q('w')||'sun',demo:q('demo')==='1'};var o=window.__PLUXEE_SIGNALS;if(o)for(var k in o)if(o.hasOwnProperty(k))s[k]=o[k];return norm(s)}
function later(fn,ms){var x=setTimeout(fn,ms);timers.push(x);return x}
function clearTimers(){while(timers.length)clearTimeout(timers.pop());if(resumeT){clearTimeout(resumeT);resumeT=null}if(hintT){clearTimeout(hintT);hintT=null}if(holdT){clearTimeout(holdT);holdT=null}}
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
  final:{seed:97,base:['#1F7A52','#0D3A2B','#05140E'],key:'#9CFFC4',bokeh:['#CFFFE3','#7CFFB0','#FFFFFF','#00EB5E'],count:40,maxR:48,blur:9,fill:[.62,.5,420,'#7CFFB0',.28]},
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

/* ---- sinyaller → kapı sırası ---- */
function leadFor(h){for(var i=0;i<C.lead.length;i++){var m=C.lead[i];if(m.from<=m.to?(h>=m.from&&h<=m.to):(h>=m.from||h<=m.to))return m.scene}return C.scenes[0].key}
function build(){
  leadKey=S.weather==='rain'?C.rainLead:leadFor(S.hour);
  var start=0;for(var i=0;i<C.scenes.length;i++)if(C.scenes[i].key===leadKey)start=i;
  order=[];for(i=0;i<C.scenes.length;i++){var sc=C.scenes[(start+i)%C.scenes.length];order.push({scene:sc,key:sc.key,z:T.gates[i],visited:false,passed:false,tag:C.scenes[i].tag})}
  world.querySelectorAll('.gate').forEach?null:null;
  var old=world.querySelectorAll('.gate');for(i=0;i<old.length;i++)world.removeChild(old[i]);
  gates=[];for(i=0;i<order.length;i++){var g=document.createElement('div');g.className='gate';g.setAttribute('data-key',order[i].key);g.setAttribute('data-i',i);g.innerHTML='<span class="frame"></span><span class="lbl"><svg viewBox="0 0 24 24" aria-hidden="true">'+(__ICONS__[order[i].key]||'')+'</svg>'+esc(order[i].scene.label)+'<small>· '+esc(order[i].tag)+'</small></span><span class="pass">'+__CHECK__+esc(K.pass)+'</span>';world.insertBefore(g,portal);gates.push(g)}
  var oldN=route.querySelectorAll('.node');for(i=0;i<oldN.length;i++)route.removeChild(oldN[i]);
  nodes=[];for(i=0;i<order.length;i++){var n=document.createElement('div');n.className='node';n.style.left=(order[i].z*100)+'%';n.setAttribute('data-i',i);n.setAttribute('data-key',order[i].key);n.innerHTML='<i></i><b>'+esc(order[i].scene.label)+__CHECK__+'</b>';route.appendChild(n);nodes.push(n)}
  ad.classList.toggle('is-rain',S.weather==='rain');ad.classList.toggle('is-demo',S.demo);
  variant=[S.seg,leadKey].join('-').toUpperCase()+(S.weather==='rain'?'-RAIN':'');ad.setAttribute('data-variant',variant);ad.setAttribute('data-lead',leadKey);
  sig.innerHTML='<span class="lbl">DATA LAYER</span><span>SEGMENT <b>'+esc(D.segments[S.seg].label)+'</b></span><span>SAAT <b>'+pad(S.hour)+':'+pad(S.minute)+'</b></span>'+(S.weather==='rain'?'<span>HAVA <b>Yağmurlu</b></span>':'')+'<span>#'+esc(variant)+'</span>';
  sub.textContent=C.segments[S.seg].sub;ctaT.textContent=C.segments[S.seg].cta;
  currentCopy={title:'',word:'',line2:K.line2,sub:C.segments[S.seg].sub,cta:C.segments[S.seg].cta};
  nextIdx=-1;
}
var WORD_MAX=396;
function fitWord(n){n.style.fontSize='';var w=n.scrollWidth;if(w>WORD_MAX)n.style.fontSize=Math.floor(29*WORD_MAX/w)+'px'}
function refit(){var n=l1.querySelector('span.on');if(n)fitWord(n)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refit,function(){});
window.addEventListener('load',refit);
function setWord(txt){
  var old=l1.querySelector('span.on');if(old&&old.textContent===txt)return;
  var n=document.createElement('span');n.className='in';n.textContent=txt;l1.appendChild(n);fitWord(n);void n.offsetWidth;n.className='on';
  if(old){old.className='out';setTimeout(function(){if(old.parentNode)old.parentNode.removeChild(old)},520)}
  currentCopy.word=txt;
}
function setTitle(txt){if(eyebrow.textContent===txt)return;eyebrow.classList.add('is-out');setTimeout(function(){eyebrow.textContent=txt;eyebrow.classList.remove('is-out')},220);currentCopy.title=txt}
function visitedCount(){var n=0;for(var i=0;i<order.length;i++)if(order[i].visited)n++;return n}

/* ---- ışınlar ---- */
var rays=[];
for(var ri=0;ri<18;ri++){var r=document.createElement('i');r.className='ray';raysEl.appendChild(r);rays.push({el:r,a:(ri/18)*360+((ri*37)%11),p:Math.random(),len:70+Math.random()*90,sp:.7+Math.random()*.6})}

/* ---- kopya: bir sonraki kapı ---- */
function updateCopy(){
  var n=-1;for(var i=0;i<order.length;i++)if(t<order[i].z+0.004){n=i;break}
  if(n===nextIdx)return;nextIdx=n;
  for(i=0;i<nodes.length;i++)nodes[i].classList.toggle('is-next',i===n);
  if(n<0){setTitle(K.final.title);setWord(K.final.word);showLayer('final')}
  else{var o=order[n];setTitle(o.scene.title);setWord(K.words[o.key]||o.scene.word);showLayer(S.weather==='rain'&&o.key==='online'?'rain':o.key)}
  emit('state');
}

/* ---- kapıdan geçiş ---- */
function onPass(i){
  var o=order[i];o.passed=true;var g=gates[i];
  g.classList.remove('is-pass');void g.offsetWidth;g.classList.add('is-pass');
  card.classList.remove('is-pass');void card.offsetWidth;card.classList.add('is-pass');
  ad.classList.remove('is-shake');void ad.offsetWidth;ad.classList.add('is-shake');
  scene.classList.add('is-passing');setTimeout(function(){scene.classList.remove('is-passing')},950);
  if(!o.visited){o.visited=true;nodes[i].classList.add('is-done')}
  sparks();emit('state');
}
function sparks(){
  if(reduced)return;burst.innerHTML='';
  for(var i=0;i<12;i++){var a=Math.random()*6.2832,r=22+Math.random()*40,el=document.createElement('i');if(i%3===0)el.className='w';el.style.setProperty('--dx',Math.cos(a)*r+'px');el.style.setProperty('--dy',Math.sin(a)*r-14+'px');el.style.animationDelay=(Math.random()*80)+'ms';burst.appendChild(el)}
  setTimeout(function(){burst.innerHTML=''},900);
}

/* ---- kare döngüsü ---- */
function frame(now){
  raf=0;var dt=last?Math.min(48,now-last):16;last=now;
  var v=0;
  if(phase==='fly'){
    if(tween!==null){var dd=tween-t;t+=dd*Math.min(1,dt/120);v=dd*Math.min(1,dt/120)/dt;if(Math.abs(dd)<.002){t=tween;tween=null}}
    else if(drag){if(drag.hold){v=3.2*cruiseV;t+=v*dt}else v=velT}
    else if(inertia){t+=velT*dt;velT*=Math.pow(.9,dt/16);v=velT;if(Math.abs(velT)<2e-5){inertia=false;velT=0}}
    else if(auto){v=(boost?3.2:1)*cruiseV;t+=v*dt}
    t=clamp(t,0,1);
    for(var i=0;i<order.length;i++){if(!order[i].passed&&t>=order[i].z)onPass(i);if(order[i].passed&&t<order[i].z-.02)order[i].passed=false}
    updateCopy();
    if(t>=1)finish();
  }
  speedF+=((Math.abs(v)/cruiseV)-speedF)*.12;
  steer.x+=(steerT.x-steer.x)*.08;steer.y+=(steerT.y-steer.y)*.08;
  var vpx=VP.x+steer.x,vpy=VP.y+steer.y;
  /* kapılar */
  for(i=0;i<gates.length;i++){
    var d=order[i].z-t,sc,op,g=gates[i];
    if(d<-.08){g.style.opacity='0';continue}
    if(d<0){sc=1+(-d)*11;op=1+d/.08}else{sc=1/(1+d*7.5);op=.12+.88*Math.pow(1-d,2.2)}
    var gx=vpx+steer.x*.5*sc,gy=vpy+steer.y*.5*sc;
    g.style.opacity=op.toFixed(3);g.style.transform='translate3d('+gx.toFixed(1)+'px,'+gy.toFixed(1)+'px,0) scale('+sc.toFixed(4)+')';
  }
  /* portal (final yaklaşırken) */
  var pf=clamp((t-.86)/.14,0,1);var ps=phase==='final'?3.2:pf*pf*2.2;portal.style.transform='translate3d('+steer.x+'px,'+steer.y+'px,0) scale('+ps.toFixed(3)+')';portal.style.opacity=(phase==='final'?.9:pf*.85).toFixed(3);
  /* zemin ve ışınlar */
  floor.style.backgroundPosition='0 '+((t*2600)%40).toFixed(1)+'px,0 '+((t*2600)%40).toFixed(1)+'px';floor.style.transform='translate3d('+(steer.x*.8).toFixed(1)+'px,0,0) perspective(240px) rotateX(66deg)';
  var rayOp=clamp((speedF-.55)*.32,0,.85);
  for(i=0;i<rays.length;i++){var R=rays[i];R.p+=(.25+speedF*.55)*R.sp*dt/1000;if(R.p>1){R.p=0;R.a=Math.random()*360;R.len=70+Math.random()*90}
    var rr=30+R.p*560,fade=Math.sin(R.p*3.1416);R.el.style.opacity=(rayOp*fade).toFixed(3);R.el.style.height=(R.len*(.5+R.p)).toFixed(0)+'px';R.el.style.transform='translate3d('+vpx+'px,'+vpy+'px,0) rotate('+R.a+'deg) translateY('+(-rr).toFixed(1)+'px)'}
  /* kart */
  var fl=Math.sin(now/900)*3,lean=clamp((speedF-1)*3,0,10);
  card.style.transform='translate3d(0,'+(fl+lean*.5).toFixed(2)+'px,0) perspective(900px) rotateX('+(14+lean).toFixed(2)+'deg) rotateY('+(steer.x*.5).toFixed(2)+'deg) rotateZ('+(-steer.x*.08).toFixed(2)+'deg)';
  prog.style.width=(clamp(t,0,1)*100).toFixed(2)+'%';
  if(live&&(phase==='fly'||Math.abs(steerT.x-steer.x)>.05||Math.abs(steerT.y-steer.y)>.05||rayOp>0.01))raf=requestAnimationFrame(frame);
}
function tick(){if(!raf){last=0;raf=requestAnimationFrame(frame)}}

/* ---- akış ---- */
function finish(){
  if(phase==='final')return;phase='final';finalState=true;t=1;auto=false;inertia=false;tween=null;ad.classList.add('is-final');hideHint();
  for(var i=0;i<order.length;i++){if(!order[i].visited){order[i].visited=true;nodes[i].classList.add('is-done')}}
  nodes.forEach?null:null;for(i=0;i<nodes.length;i++)nodes[i].classList.remove('is-next');
  setTitle(K.final.title);setWord(K.final.word);showLayer('final');emit('state');
  later(function(){ended=true;ad.classList.add('is-ended');emit('state');tick()},T.hold);
}
function reset(){
  clearTimers();t=0;phase='';auto=true;inertia=false;velT=0;boost=false;tween=null;speedF=1;finalState=false;ended=false;nextIdx=-1;ad.classList.remove('is-final','is-ended');hideHint();
  for(var i=0;i<order.length;i++){order[i].visited=false;order[i].passed=false;if(nodes[i])nodes[i].classList.remove('is-done','is-next');if(gates[i])gates[i].classList.remove('is-pass')}
}
function start(){
  ad.classList.add('is-live');live=true;
  if(reduced){phase='fly';t=1;for(var i=0;i<order.length;i++){order[i].visited=true;order[i].passed=true;nodes[i].classList.add('is-done')}finish();ended=true;ad.classList.add('is-ended');tick();return}
  updateCopy();
  later(function(){phase='fly';tick();if(!userPlayed)armHint()},T.enter);
  tick();emit('state');
}
function restart(){clearTimers();drag=null;scene.classList.remove('is-drag');userPlayed=false;reset();build();start()}
function replay(){clearTimers();drag=null;scene.classList.remove('is-drag');userPlayed=true;reset();start()}

/* ---- ipucu ---- */
function armHint(){if(hintT)clearTimeout(hintT);hintT=setTimeout(function(){hintT=null;if(phase==='fly'&&!userPlayed){hintOn=true;scene.classList.add('is-hint');emit('state')}},500)}
function hideHint(){hintOn=false;scene.classList.remove('is-hint')}

/* ---- etkileşim: sürükle / basılı tut / yönlendir ---- */
function scale(){var r=scene.getBoundingClientRect();return (r.width||530)/530}
scene.addEventListener('pointerdown',function(e){
  if(phase!=='fly')return;if(within(e.target,'node')||within(e.target,'again'))return;
  e.preventDefault();e.stopPropagation();try{scene.setPointerCapture(e.pointerId)}catch(err){}
  drag={id:e.pointerId,sx:e.clientX,lx:e.clientX,lt:performance.now(),moved:false,t0:t};velT=0;inertia=false;tween=null;auto=false;userPlayed=true;hideHint();
  if(resumeT){clearTimeout(resumeT);resumeT=null}
  scene.classList.add('is-drag');
  holdT=setTimeout(function(){holdT=null;if(drag&&!drag.moved){boost=true;auto=true;drag.hold=true}},220);
  emit('state');tick();
});
scene.addEventListener('pointermove',function(e){
  if(!drag||e.pointerId!==drag.id)return;var s=scale();
  var dx=(e.clientX-drag.sx)/s;if(Math.abs(dx)>6&&!drag.moved){drag.moved=true;if(holdT){clearTimeout(holdT);holdT=null}boost=false;auto=false}
  if(!drag.moved)return;
  var nowT=performance.now(),dtm=Math.max(1,nowT-drag.lt);
  var step=-(e.clientX-drag.lx)/s*(1/470);velT=step/dtm;drag.lx=e.clientX;drag.lt=nowT;
  t=clamp(drag.t0-dx*(1/470),0,1);tick();
});
function endDrag(e){
  if(!drag||(e&&e.pointerId!==drag.id))return;
  try{scene.releasePointerCapture(drag.id)}catch(err){}
  var wasHold=drag.hold,moved=drag.moved;drag=null;scene.classList.remove('is-drag');if(holdT){clearTimeout(holdT);holdT=null}
  boost=false;
  if(moved){inertia=Math.abs(velT)>3e-5;auto=false;if(resumeT)clearTimeout(resumeT);resumeT=setTimeout(function(){resumeT=null;auto=true;tick()},T.resume)}
  else if(!wasHold){/* kısa dokunma: hafif ileri sıçrama */tween=clamp(t+.09,0,1);auto=true}
  else auto=true;
  tick();emit('state');
}
scene.addEventListener('pointerup',endDrag);
scene.addEventListener('pointercancel',endDrag);
scene.addEventListener('click',function(e){e.stopPropagation()});
route.addEventListener('click',function(e){var el=e.target;while(el&&el!==route&&!(el.classList&&el.classList.contains('node')))el=el.parentNode;if(el&&el!==route){e.stopPropagation();goGate(+el.getAttribute('data-i'))}});
function goGate(i){
  i=clamp(i,0,order.length-1);if(phase!=='fly')return;userPlayed=true;hideHint();
  var target=clamp(order[i].z-.12,0,1);if(t>target){for(var k=0;k<order.length;k++)if(order[k].z>=order[i].z)order[k].passed=false}
  tween=target;auto=true;inertia=false;tick();
}
again.addEventListener('click',function(e){e.stopPropagation();replay()});
ad.addEventListener('pointermove',function(e){var r=ad.getBoundingClientRect();var px=(e.clientX-r.left)/(r.width||W)-.5,py=(e.clientY-r.top)/(r.height||H)-.5;steerT={x:px*2*44,y:py*2*22};tick()});
ad.addEventListener('pointerleave',function(){steerT={x:0,y:0};tick()});

/* ---- tıklama ---- */
function openLink(){var u=window.clickTag||D.brand.url;if(embedded&&!window.clickTag){emit('click',{url:u});return}if(window.Enabler&&window.Enabler.exit){window.Enabler.exit('CTA')}else{window.open(u,'_blank','noopener')}}
ad.addEventListener('click',function(e){if(within(e.target,'scene'))return;openLink()});
cta.addEventListener('click',function(e){e.stopPropagation();openLink()});
ad.addEventListener('keydown',function(e){
  if(phase!=='fly'&&e.key!=='Enter')return;
  if(e.key==='ArrowRight'){e.preventDefault();userPlayed=true;hideHint();tween=clamp(t+.12,0,1);tick()}
  else if(e.key==='ArrowLeft'){e.preventDefault();userPlayed=true;hideHint();var tg=clamp(t-.12,0,1);for(var k=0;k<order.length;k++)if(order[k].z>tg)order[k].passed=false;tween=tg;tick()}
  else if(e.key===' '){e.preventDefault();userPlayed=true;hideHint();boost=true;auto=true;tick();setTimeout(function(){boost=false},900)}
  else if(e.key==='Enter'){openLink()}
});

/* ---- sunum / entegrasyon API'si ---- */
function snapshot(){var names=[];for(var k=0;k<order.length;k++)names.push(order[k].key);return {variant:variant,lead:leadKey,order:names,idx:nextIdx<0?order.length-1:nextIdx,next:nextIdx,t:Math.round(t*1000)/1000,phase:phase,hint:hintOn,userPlayed:userPlayed,visited:visitedCount(),total:order.length,finalState:finalState,ended:ended,copy:currentCopy,signals:S}}
function emit(type,extra){
  if(!embedded||!(window.parent&&window.parent!==window))return;
  var msg=snapshot();msg.type='pluxee:'+type;if(extra)for(var x in extra)if(extra.hasOwnProperty(x))msg[x]=extra[x];
  try{window.parent.postMessage(msg,'*')}catch(err){}
}
window.addEventListener('message',function(e){
  var d=e.data;if(!d||typeof d!=='object'||typeof d.type!=='string')return;
  if(d.type==='pluxee:signals'){embedded=true;var s=d.signals||{};for(var k in s)if(s.hasOwnProperty(k))S[k]=s[k];norm(S);restart()}
  else if(d.type==='pluxee:replay'){embedded=true;restart()}
  else if(d.type==='pluxee:demo'){S.demo=!!d.on;ad.classList.toggle('is-demo',S.demo)}
});
window.PLUXEE={setSignals:function(s){for(var k in s)if(s.hasOwnProperty(k))S[k]=s[k];norm(S);restart()},replay:restart,state:snapshot};

S=readSignals();build();start();
})();
`;

/* ---------- HTML ---------- */
function render(data) {
  const runtime = {
    brand: { url: data.brand.url },
    segments: data.segments,
    cinematic: data.cinematic,
    corridor: data.corridor,
    defaults: { seg: data.defaults.seg },
  };
  const json = JSON.stringify(runtime).replace(/<\//g, '<\\/');
  const js = JS.replace('__DATA__', () => json).replace(/__CHECK__/g, () => JSON.stringify(CHECK)).replace(/__ICONS__/g, () => JSON.stringify(ICONS));
  const k = data.corridor;
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
  <div class="world">
    <div class="floor"></div>
    <div class="rays"></div>
    <div class="portal"></div>
  </div>
  <div class="vig"></div>
  <div class="rain"></div>
  <div class="shade"></div>
  <div class="scene" aria-label="Sürükleyerek koridorda yol alın">
    <div class="route"><span class="line"></span><span class="prog"></span></div>
    <div class="card" aria-hidden="true"><div class="face"><span class="band"></span><span class="gloss"></span><span class="chip"></span>${NFC('nfc')}<span class="wm">pluxee<i></i></span></div></div>
    <div class="burst"></div>
    <div class="hint">${DRAG} ${esc(k.hint)} <small>· ${esc(k.hintHold)}</small></div>
    <button class="again" type="button">${AGAIN}${esc(k.replay)}</button>
  </div>
  <div class="left">
    <div class="logo"><b>pluxee</b><i></i></div>
    <span class="eyebrow"></span>
    <div class="hl"><span class="l1"></span><span class="l2">${esc(k.line2)}</span></div>
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
