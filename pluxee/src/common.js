'use strict';
/**
 * Konseptlerin ortak altyapısı:
 *  - giriş animasyonu (ışık süpürmesi, logo açılışı, sol sütun kademeli giriş)
 *  - sinyaller (segment, saat, hava) → kapı/sahne sırası, kopya, sinyal çubuğu
 *  - logo ve kart: assets/ altında gerçek varlık varsa gömülür, yoksa çizim
 *  - fotoğrafik arka plan üretimi (canvas), parçacıklar, ipucu, tekrar
 *  - tıklama (clickTag / Enabler / ana sayfa), klavye, postMessage API
 */

const SIZE = { key: '970x250', w: 970, h: 250, label: 'Billboard / Masthead' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SVG = {
  nfc: (cls) => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5a5 5 0 0 1 0 7M10.5 5.5a10 10 0 0 1 0 13M14.5 2.5a15 15 0 0 1 0 19" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/></svg>`,
  arrow: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.5l2.3 2.3L9.5 4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  again: `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2.2 6a3.8 3.8 0 1 0 1.1-2.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M2 1.8v2.4h2.4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  drag: `<svg viewBox="0 0 28 12" aria-hidden="true"><path d="M5 6h18M8.5 2.5L5 6l3.5 3.5M19.5 2.5L23 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  up: `<svg viewBox="0 0 12 16" aria-hidden="true"><path d="M6 14V2M2 6l4-4 4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  hand: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11.5V4.8a1.6 1.6 0 0 1 3.2 0v5.4l1.1-.3a1.5 1.5 0 0 1 1.9 1.4v.3l1.2-.2a1.5 1.5 0 0 1 1.8 1.5v.4l.9.1a1.6 1.6 0 0 1 1.4 1.6v2.8c0 2.9-2.3 5.2-5.2 5.2h-2.1a5.2 5.2 0 0 1-4.3-2.3l-3.3-4.9a1.5 1.5 0 0 1 2.3-1.9z" fill="#fff" stroke="#14102F" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
  icons: {
    restoran: `<path d="M7 3v7a2 2 0 0 0 2 2v9M9 3v6M11 3v6M17 3c-2 1-3 3.5-3 6v3h3v9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    kafe: `<path d="M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5zM16 10h2a2.5 2.5 0 0 1 0 5h-2M8 6c0-1.5 1.2-1.5 1.2-3M12 6c0-1.5 1.2-1.5 1.2-3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    market: `<path d="M4 9h16l-1.6 10H5.6zM8.5 9l3.5-5 3.5 5M9.5 13v3M12 13v3M14.5 13v3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>`,
    online: `<rect x="7" y="3" width="10" height="18" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M10 12.5l1.6 1.6 3-3.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="18" r=".9" fill="currentColor"/>`,
  },
};
const icon = (key) => `<svg viewBox="0 0 24 24" aria-hidden="true">${SVG.icons[key] || ''}</svg>`;

/* ---------- Fotoğrafik arka plan üretimi (tarayıcı tarafı) ---------- */
const PAINT_JS = `
function rng(seed){return function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function rgba(hex,a){var n=parseInt(hex.slice(1),16);return 'rgba('+(n>>16)+','+((n>>8)&255)+','+(n&255)+','+a+')'}
var PAL={
  restoran:{seed:11,base:['#9A5228','#3A1B0E','#100806'],key:'#FFC98A',bokeh:['#FFE4B8','#FFB868','#FF8F3A','#FFFFFF'],count:34,maxR:46,blur:9,fill:[.15,.9,320,'#FF9A4A',.22]},
  kafe:{seed:23,base:['#7A5238','#33201A','#120B08'],key:'#F5D3A8',bokeh:['#FFEBD0','#E8B07A','#FFFFFF','#D89A5C'],count:24,maxR:52,blur:11,fill:[.08,.35,300,'#FFF1DC',.28]},
  market:{seed:37,base:['#2E6E72','#173A40','#0A1618'],key:'#E9FFF6',bokeh:['#FFFFFF','#CFF6E9','#9BE3D0','#FFE9A8'],count:38,maxR:36,blur:8,bands:3,fill:[.5,1,360,'#A8F0DE',.16]},
  online:{seed:53,base:['#173A78','#0B1C3F','#04070F'],key:'#6FB4FF',bokeh:['#8FD6FF','#4FA3FF','#FFFFFF','#FFC46B'],count:32,maxR:40,blur:8,fill:[.28,.85,260,'#4FA3FF',.22]},
  final:{seed:97,base:['#1F7A52','#0D3A2B','#05140E'],key:'#9CFFC4',bokeh:['#CFFFE3','#7CFFB0','#FFFFFF','#00EB5E'],count:40,maxR:48,blur:9,fill:[.62,.5,420,'#7CFFB0',.28]},
  rain:{seed:71,base:['#40556E','#1C2A3B','#0A1018'],key:'#C9D8EE',bokeh:['#E3ECF7','#9FC3E8','#FFFFFF'],count:26,maxR:42,blur:11,drops:true,fill:[.3,.8,300,'#8FB4E0',.14]},
  city:{seed:5,base:['#2B2A6B','#14132F','#07061A'],key:'#8C7BFF',bokeh:['#FFD98A','#FF9A6A','#8FD6FF','#FFFFFF','#B8A9FF'],count:64,maxR:34,blur:7,bands:2,fill:[.35,1,420,'#5B4BD6',.2]}
};
function paint(P,W,H){
  W=W||970;H=H||250;var c=document.createElement('canvas');c.width=W;c.height=H;var x=c.getContext('2d');var r=rng(P.seed);
  var g=x.createLinearGradient(W,0,0,H);g.addColorStop(0,P.base[0]);g.addColorStop(.55,P.base[1]);g.addColorStop(1,P.base[2]);x.fillStyle=g;x.fillRect(0,0,W,H);
  var k=x.createRadialGradient(W*.84,-30,10,W*.84,-30,540);k.addColorStop(0,rgba(P.key,.5));k.addColorStop(1,rgba(P.key,0));x.fillStyle=k;x.fillRect(0,0,W,H);
  if(P.fill){var f=P.fill,fg=x.createRadialGradient(f[0]*W,f[1]*H,8,f[0]*W,f[1]*H,f[2]);fg.addColorStop(0,rgba(f[3],f[4]));fg.addColorStop(1,rgba(f[3],0));x.fillStyle=fg;x.fillRect(0,0,W,H)}
  if(P.bands)for(var b=0;b<P.bands;b++){var by=48+b*64,bgd=x.createLinearGradient(0,by-16,0,by+16);bgd.addColorStop(0,'rgba(255,255,255,0)');bgd.addColorStop(.5,'rgba(255,255,255,.07)');bgd.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=bgd;x.fillRect(0,by-16,W,32)}
  var o=document.createElement('canvas');o.width=W;o.height=H;var y=o.getContext('2d');
  for(var i=0;i<P.count;i++){var px=r()*W,py=r()*H*.8,rad=6+Math.pow(r(),1.7)*P.maxR,col=P.bokeh[Math.floor(r()*P.bokeh.length)],a=.12+r()*.4;var gg=y.createRadialGradient(px,py,rad*.15,px,py,rad);gg.addColorStop(0,rgba(col,a*.7));gg.addColorStop(.8,rgba(col,a));gg.addColorStop(1,rgba(col,0));y.fillStyle=gg;y.beginPath();y.arc(px,py,rad,0,6.2832);y.fill()}
  if('filter' in x){x.filter='blur('+P.blur+'px)';x.drawImage(o,0,0);x.filter='none'}else x.drawImage(o,0,0);
  var fl=x.createLinearGradient(0,H*.7,0,H);fl.addColorStop(0,'rgba(0,0,0,0)');fl.addColorStop(1,rgba(P.key,.16));x.fillStyle=fl;x.fillRect(0,H*.7,W,H*.3);
  var ll=x.createLinearGradient(W*.45,0,W,H);ll.addColorStop(0,rgba(P.key,0));ll.addColorStop(.5,rgba(P.key,.12));ll.addColorStop(1,rgba(P.key,0));x.fillStyle=ll;x.fillRect(0,0,W,H);
  if(P.drops){for(i=0;i<80;i++){var dx=r()*W,dy=r()*H,dr=1.5+r()*5,dg=x.createRadialGradient(dx-dr*.3,dy-dr*.3,dr*.1,dx,dy,dr);dg.addColorStop(0,'rgba(255,255,255,.55)');dg.addColorStop(.6,'rgba(200,220,255,.18)');dg.addColorStop(1,'rgba(200,220,255,0)');x.fillStyle=dg;x.beginPath();x.ellipse(dx,dy,dr,dr*1.3,0,0,6.2832);x.fill()}x.strokeStyle='rgba(220,235,255,.14)';x.lineWidth=1;for(i=0;i<14;i++){var sx=r()*W,sy=r()*H*.6,sl=20+r()*60;x.beginPath();x.moveTo(sx,sy);x.lineTo(sx-sl*.18,sy+sl);x.stroke()}}
  var v=x.createRadialGradient(W*.55,H*.45,H*.35,W*.55,H*.45,W*.72);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');x.fillStyle=v;x.fillRect(0,0,W,H);
  return c;
}
function grainUri(){var c=document.createElement('canvas');c.width=180;c.height=180;var x=c.getContext('2d'),d=x.createImageData(180,180),p=d.data,r=rng(5);for(var i=0;i<p.length;i+=4){var v=Math.floor(r()*255);p[i]=p[i+1]=p[i+2]=v;p[i+3]=255}x.putImageData(d,0,0);return c.toDataURL()}
/* Katmanlar: gerçek fotoğraf varsa <img> (object-fit: cover), yoksa üretilmiş bokeh (geçici) */
function initLayers(host,keys){var out={};try{for(var i=0;i<keys.length;i++){var k=keys[i],el;var ph=D.photos&&(D.photos[k]||(k==='rain'&&D.photos.online)||(k==='final'&&(D.photos.hero||D.photos.restoran)));if(ph){el=document.createElement('img');el.src=ph;el.alt='';el.className='ph';el.setAttribute('data-src',k);var pk=D.photos[k]?k:(k==='rain'?'online':(D.photos.hero?'hero':'restoran'));if(D.photoPos&&D.photoPos[pk])el.style.objectPosition=D.photoPos[pk]}else{el=paint(PAL[k])}el.setAttribute('data-key',k);host.appendChild(el);out[k]=el}var gr=ad.querySelector('.grain');if(gr)gr.style.backgroundImage='url('+grainUri()+')'}catch(err){}return out}
function photoOf(k){return D.photos&&D.photos[k]?D.photos[k]:null}
function photoPosOf(k){return D.photoPos&&D.photoPos[k]?D.photoPos[k]:'50% 50%'}
function showLayer(layers,key){if(!layers[key]){for(var kk in layers){key=kk;break}}for(var k in layers)layers[k].classList.toggle('is-on',k===key)}
`;

/* ---------- Ortak CSS ---------- */
const BASE_CSS = `
:root{--navy:#221C46;--ink:#0F0C26;--green:#00EB5E;--lav:#B8A9FF;--ease:cubic-bezier(.22,.8,.26,1)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:970px;height:250px;overflow:hidden;background:#0F0C26}
body{font-family:Manrope,Inter,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.ad{position:relative;width:970px;height:250px;overflow:hidden;background:var(--ink);color:#fff;user-select:none;-webkit-user-select:none;outline:0;cursor:pointer}
.ad:focus-visible{box-shadow:inset 0 0 0 2px var(--green)}
.bg{position:absolute;inset:0;overflow:hidden}
.bg canvas,.bg img.ph{position:absolute;left:0;top:0;width:970px;height:250px;opacity:0;transition:opacity 1.1s ease}
.bg img.ph{object-fit:cover;transform-origin:60% 50%}
.bg canvas.is-on,.bg img.ph.is-on{opacity:1}
.bg img.ph.is-on{animation:kb 9s linear forwards}
@keyframes kb{from{transform:scale(1.02)}to{transform:scale(1.09)}}
.grain{position:absolute;inset:0;opacity:.08;mix-blend-mode:overlay;pointer-events:none;background-repeat:repeat}
.vig{position:absolute;inset:0;pointer-events:none;background:radial-gradient(120% 140% at 70% 48%,transparent 40%,rgba(0,0,0,.6) 100%)}
.shade{position:absolute;inset:0;pointer-events:none;z-index:3;background:linear-gradient(90deg,rgba(15,12,38,.97) 0%,rgba(15,12,38,.9) 32%,rgba(15,12,38,.5) 48%,rgba(15,12,38,0) 64%),linear-gradient(180deg,rgba(15,12,38,0) 70%,rgba(15,12,38,.5) 100%)}
.rain{position:absolute;inset:0;opacity:0;transition:opacity .8s;pointer-events:none;background-image:repeating-linear-gradient(112deg,transparent 0 22px,rgba(210,225,255,.16) 22px 23px,transparent 23px 40px);background-size:80px 120px;animation:rain .5s linear infinite}
.ad.is-rain .rain{opacity:.5}
@keyframes rain{to{background-position:-26px 120px}}
/* giriş: ışık süpürmesi + logo açılışı + kademeli sol sütun */
.beam{position:absolute;top:-20px;bottom:-20px;left:0;width:140px;pointer-events:none;z-index:9;opacity:0;background:linear-gradient(90deg,rgba(0,235,94,0),rgba(0,235,94,.28) 35%,rgba(255,255,255,.75) 50%,rgba(0,235,94,.28) 65%,rgba(0,235,94,0));transform:translateX(-160px) skewX(-18deg);filter:blur(1px)}
.ad.is-in .beam{animation:beam .95s cubic-bezier(.4,0,.2,1) forwards}
@keyframes beam{0%{opacity:0;transform:translateX(-160px) skewX(-18deg)}10%{opacity:1}90%{opacity:1}100%{opacity:0;transform:translateX(1120px) skewX(-18deg)}}
.left{position:absolute;left:44px;top:28px;width:400px;height:214px;z-index:6}
.logo{display:flex;align-items:center;gap:7px;height:26px;clip-path:inset(0 100% 0 0);opacity:0}
.ad.is-in .logo{animation:logoIn .7s .25s var(--ease) forwards}
@keyframes logoIn{0%{clip-path:inset(0 100% 0 0);opacity:1}100%{clip-path:inset(0 -8% 0 0);opacity:1}}
.logo b{font-size:23px;font-weight:800;letter-spacing:-.03em;color:#fff;line-height:1}
.logo i{width:8px;height:8px;border-radius:2px;background:var(--green);transform:rotate(45deg);margin-top:2px}
.logo img{height:26px;width:auto;display:block}
.logo img.is-white{filter:brightness(0) invert(1)}
.eyebrow,.hl,.sub,.cta{opacity:0;transform:translateY(8px);transition:opacity .55s,transform .7s var(--ease)}
.ad.is-live .eyebrow{opacity:1;transform:none;transition-delay:.05s}
.ad.is-live .hl{opacity:1;transform:none;transition-delay:.15s}
.ad.is-live .sub{opacity:1;transform:none;transition-delay:.3s}
.ad.is-live .cta{opacity:1;transform:none;transition-delay:.45s}
.eyebrow{position:absolute;left:0;top:46px;height:14px;line-height:14px;font-size:10.5px;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:var(--green);white-space:nowrap}
.eyebrow.is-out{opacity:0!important;transform:translateY(4px)!important;transition:opacity .22s,transform .3s var(--ease)!important}
.hl{position:absolute;left:0;top:62px;font-size:29px;font-weight:800;letter-spacing:-.02em;line-height:1.08;color:#fff;white-space:nowrap}
.hl .l1{display:block;position:relative;width:400px;height:36px;line-height:32px;overflow:hidden;color:var(--green)}
.hl .l1 span{position:absolute;left:0;top:0;height:32px;line-height:32px;white-space:nowrap;transition:transform .5s var(--ease),opacity .4s}
.hl .l1 span.in{transform:translateY(110%);opacity:0}
.hl .l1 span.on{transform:none;opacity:1}
.hl .l1 span.out{transform:translateY(-110%);opacity:0}
.hl .l2{display:block;height:32px;line-height:32px}
.sub{position:absolute;left:0;top:134px;width:392px;font-size:12.5px;line-height:1.45;color:rgba(255,255,255,.82);height:36px;overflow:hidden}
.cta{position:absolute;left:0;top:176px;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 16px 0 18px;border-radius:99px;background:var(--green);color:var(--navy);font:inherit;font-size:12.5px;font-weight:800;border:0;cursor:pointer;box-shadow:0 10px 24px rgba(0,235,94,.3);white-space:nowrap}
.ad.is-live .cta{transition:opacity .55s .45s,transform .25s var(--ease),box-shadow .25s}
.ad.is-live .cta:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(0,235,94,.45)}
.cta svg{width:12px;height:12px}
.ad.is-final .cta{animation:pulse 1.7s ease-in-out infinite}
@keyframes pulse{0%,100%{box-shadow:0 10px 24px rgba(0,235,94,.3)}50%{box-shadow:0 10px 24px rgba(0,235,94,.3),0 0 0 7px rgba(0,235,94,.15)}}
/* kart: ölçüler em ile (font-size = ölçek) */
.card{position:absolute;font-size:10px;width:19em;height:12em;border-radius:1.3em;transform-style:preserve-3d;box-shadow:0 3.6em 6em -1.2em rgba(0,0,0,.75),0 1em 2.2em rgba(0,0,0,.4);will-change:transform}
.face{position:absolute;inset:0;border-radius:1.3em;overflow:hidden;background:linear-gradient(116deg,#3A2F78 0%,#261D5C 36%,#1A1345 66%,#120D33 100%);box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(0,0,0,.55)}
.face .band{position:absolute;left:-4em;top:5.8em;width:30em;height:3em;background:linear-gradient(90deg,#00EB5E,#00C77E 60%,#00B37A);transform:rotate(-16deg);box-shadow:0 .3em 1.2em rgba(0,235,94,.35)}
.face .band:after{content:"";position:absolute;left:0;right:0;top:0;height:1px;background:rgba(255,255,255,.35)}
.face .chip{position:absolute;left:1.8em;top:3em;width:3.2em;height:2.4em;border-radius:.5em;background:linear-gradient(135deg,#F9E6A8 0%,#D9AE4E 42%,#B98A2C 58%,#F0D28A 100%);box-shadow:inset 0 0 0 1px rgba(0,0,0,.3),0 1px 2px rgba(0,0,0,.35)}
.face .chip:before,.face .chip:after{content:"";position:absolute;left:0;right:0;height:1px;background:rgba(0,0,0,.35)}
.face .chip:before{top:.8em}.face .chip:after{top:1.6em}
.face .nfc{position:absolute;right:1.6em;top:2.6em;width:2em;height:2em;color:rgba(255,255,255,.85)}
.face .wm{position:absolute;left:1.8em;bottom:1.6em;font-size:1.9em;font-weight:800;letter-spacing:-.02em;color:#fff;text-shadow:0 1px 0 rgba(255,255,255,.22),0 -1px 0 rgba(0,0,0,.55)}
.face .wm i{display:inline-block;width:.32em;height:.32em;border-radius:.08em;background:var(--green);transform:rotate(45deg);margin-left:.26em;vertical-align:middle}
.face .img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block}
.face .gloss{position:absolute;inset:0;background:linear-gradient(104deg,transparent 28%,rgba(255,255,255,.22) 44%,rgba(255,255,255,.06) 50%,transparent 60%) 0 0/260% 100%;animation:sweep 4.4s ease-in-out infinite;pointer-events:none}
@keyframes sweep{0%,25%{background-position:130% 0}70%,100%{background-position:-30% 0}}
/* ipucu, tekrar, parçacık, sinyal çubuğu */
.hint{position:absolute;display:inline-flex;align-items:center;gap:8px;padding:5px 10px;border-radius:99px;background:rgba(15,12,38,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#fff;opacity:0;transform:translate(-50%,4px);transition:opacity .4s,transform .5s var(--ease);pointer-events:none;white-space:nowrap;z-index:8}
.hint small{font-size:8px;font-weight:700;letter-spacing:.1em;color:rgba(255,255,255,.55);text-transform:none}
.hint svg{width:22px;height:10px;color:var(--green)}
.scene.is-hint .hint{opacity:1;transform:translate(-50%,0)}
.scene.is-passing .hint{opacity:0;transform:translate(-50%,4px)}
.again{position:absolute;transform:translateX(-50%);display:none;align-items:center;gap:6px;height:24px;padding:0 11px 0 9px;border-radius:99px;background:rgba(255,255,255,.12);box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);font:inherit;font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#fff;border:0;cursor:pointer;z-index:8;transition:background .2s}
.again:hover{background:rgba(255,255,255,.2)}
.again svg{width:11px;height:11px}
.ad.is-ended .again{display:inline-flex}
.burst{position:absolute;width:0;height:0;pointer-events:none;z-index:7}
.burst i{position:absolute;left:-3px;top:-3px;width:6px;height:6px;border-radius:50%;background:var(--green);opacity:0;animation:burst .8s cubic-bezier(.2,.8,.3,1) forwards}
.burst i.w{background:#fff;width:4px;height:4px}
@keyframes burst{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(.3)}}
.sig{position:absolute;right:12px;top:8px;height:18px;display:none;align-items:center;gap:4px;z-index:7;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;letter-spacing:.03em;pointer-events:none}
.ad.is-demo .sig{display:flex}
.sig span{padding:0 6px;height:18px;line-height:18px;border-radius:4px;background:rgba(0,0,0,.5);color:rgba(255,255,255,.85);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);white-space:nowrap}
.sig span b{color:var(--green);font-weight:700}
.sig .lbl{background:var(--green);color:var(--navy);font-weight:800;letter-spacing:.06em}
@media (prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;transition-delay:0s!important}}
`;

/* ---------- Ortak JS (IIFE içinde, konsept JS'inden önce) ---------- */
const CORE_JS = `
var D=__DATA__,C=D.cinematic,ad=document.getElementById('ad');
var $=function(sel){return ad.querySelector(sel)};
var eyebrow=$('.eyebrow'),l1=$('.l1'),l2=$('.l2'),subEl=$('.sub'),cta=$('.cta'),ctaT=$('.cta-t'),sig=$('.sig'),bg=$('.bg');
var W=970,H=250,S={},order=[],leadKey='',variant='',embedded=false,timers=[],currentCopy={},finalState=false,ended=false,userPlayed=false,hintOn=false;
var engine={restart:function(){},snapshot:function(){return {}},key:function(){}};
var reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);
function q(n){var m=new RegExp('[?&]'+n+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1].replace(/\\+/g,' ')):null}
function pad(n){return (n<10?'0':'')+n}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function within(el,cls){while(el&&el!==ad){if(el.classList&&el.classList.contains(cls))return true;el=el.parentNode}return false}
function later(fn,ms){var x=setTimeout(fn,ms);timers.push(x);return x}
function clearTimers(){while(timers.length)clearTimeout(timers.pop())}
function norm(s){if(!C.segments[s.seg])s.seg=D.defaults.seg;s.hour=((Math.floor(+s.hour)||0)%24+24)%24;s.minute=clamp(Math.floor(+s.minute)||0,0,59);s.weather=s.weather==='rain'?'rain':'sun';s.demo=!!s.demo;return s}
function readSignals(){var now=new Date();var s={seg:q('seg')||D.defaults.seg,hour:q('h')!==null?+q('h'):now.getHours(),minute:q('m')!==null?+q('m'):now.getMinutes(),weather:q('w')||'sun',demo:q('demo')==='1'};var o=window.__PLUXEE_SIGNALS;if(o)for(var k in o)if(o.hasOwnProperty(k))s[k]=o[k];return norm(s)}
function leadFor(h){for(var i=0;i<C.lead.length;i++){var m=C.lead[i];if(m.from<=m.to?(h>=m.from&&h<=m.to):(h>=m.from||h<=m.to))return m.scene}return C.scenes[0].key}
function buildCore(){
  leadKey=S.weather==='rain'?C.rainLead:leadFor(S.hour);
  var start=0;for(var i=0;i<C.scenes.length;i++)if(C.scenes[i].key===leadKey)start=i;
  order=[];for(i=0;i<C.scenes.length;i++){var sc=C.scenes[(start+i)%C.scenes.length];order.push({scene:sc,key:sc.key,visited:false,tag:C.scenes[i].tag})}
  ad.classList.toggle('is-rain',S.weather==='rain');ad.classList.toggle('is-demo',S.demo);
  variant=[S.seg,leadKey].join('-').toUpperCase()+(S.weather==='rain'?'-RAIN':'');ad.setAttribute('data-variant',variant);ad.setAttribute('data-lead',leadKey);
  sig.innerHTML='<span class="lbl">DATA LAYER</span><span>SEGMENT <b>'+esc(D.segments[S.seg].label)+'</b></span><span>SAAT <b>'+pad(S.hour)+':'+pad(S.minute)+'</b></span>'+(S.weather==='rain'?'<span>HAVA <b>Yağmurlu</b></span>':'')+'<span>#'+esc(variant)+'</span>';
  subEl.textContent=C.segments[S.seg].sub;ctaT.textContent=C.segments[S.seg].cta;
  currentCopy={title:'',word:'',line2:l2?l2.textContent:'',sub:C.segments[S.seg].sub,cta:C.segments[S.seg].cta};
  finalState=false;ended=false;ad.classList.remove('is-final','is-ended');
}
function layerFor(key){return S.weather==='rain'&&key==='online'?'rain':key}
function visitedCount(){var n=0;for(var i=0;i<order.length;i++)if(order[i].visited)n++;return n}
/* kopya */
var WORD_MAX=396;
function fitWord(n){n.style.fontSize='';var w=n.scrollWidth;if(w>WORD_MAX)n.style.fontSize=Math.floor(29*WORD_MAX/w)+'px'}
function refit(){var n=l1.querySelector('span.on');if(n)fitWord(n)}
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(refit,function(){});
window.addEventListener('load',refit);
function setWord(txt){var old=l1.querySelector('span.on');if(old&&old.textContent===txt)return;var n=document.createElement('span');n.className='in';n.textContent=txt;l1.appendChild(n);fitWord(n);void n.offsetWidth;n.className='on';if(old){old.className='out';setTimeout(function(){if(old.parentNode)old.parentNode.removeChild(old)},520)}currentCopy.word=txt}
function setTitle(txt){if(eyebrow.textContent===txt)return;eyebrow.classList.add('is-out');setTimeout(function(){eyebrow.textContent=txt;eyebrow.classList.remove('is-out')},220);currentCopy.title=txt}
/* giriş */
function intro(cb){ad.classList.remove('is-in','is-live');void ad.offsetWidth;ad.classList.add('is-in');if(reduced){ad.classList.add('is-live');cb();return}later(function(){ad.classList.add('is-live');cb()},D.introMs||520)}
/* parçacık */
function sparks(host){if(reduced)return;host.innerHTML='';for(var i=0;i<12;i++){var a=Math.random()*6.2832,r=22+Math.random()*40,el=document.createElement('i');if(i%3===0)el.className='w';el.style.setProperty('--dx',Math.cos(a)*r+'px');el.style.setProperty('--dy',Math.sin(a)*r-14+'px');el.style.animationDelay=(Math.random()*80)+'ms';host.appendChild(el)}setTimeout(function(){host.innerHTML=''},900)}
/* ipucu */
function showHint(scene){hintOn=true;scene.classList.add('is-hint')}
function hideHint(scene){hintOn=false;scene.classList.remove('is-hint')}
/* final / bitiş */
function markFinal(){finalState=true;ad.classList.add('is-final')}
function markEnded(){ended=true;ad.classList.add('is-ended')}
/* tıklama */
function openLink(){var u=window.clickTag||D.brand.url;if(embedded&&!window.clickTag){emit('click',{url:u});return}if(window.Enabler&&window.Enabler.exit){window.Enabler.exit('CTA')}else{window.open(u,'_blank','noopener')}}
ad.addEventListener('click',function(e){if(within(e.target,'scene'))return;openLink()});
cta.addEventListener('click',function(e){e.stopPropagation();openLink()});
ad.addEventListener('keydown',function(e){if(e.key==='Enter'){openLink();return}engine.key(e)});
/* sunum / entegrasyon API'si */
function snapshot(){var names=[];for(var k=0;k<order.length;k++)names.push(order[k].key);var s={variant:variant,lead:leadKey,order:names,visited:visitedCount(),total:order.length,finalState:finalState,ended:ended,userPlayed:userPlayed,hint:hintOn,copy:currentCopy,signals:S,concept:D.concept};var ex=engine.snapshot();for(var x in ex)if(ex.hasOwnProperty(x))s[x]=ex[x];return s}
function emit(type,extra){if(!embedded||!(window.parent&&window.parent!==window))return;var msg=snapshot();msg.type='pluxee:'+type;if(extra)for(var x in extra)if(extra.hasOwnProperty(x))msg[x]=extra[x];try{window.parent.postMessage(msg,'*')}catch(err){}}
window.addEventListener('message',function(e){var d=e.data;if(!d||typeof d!=='object'||typeof d.type!=='string')return;
  if(d.type==='pluxee:signals'){embedded=true;var s=d.signals||{};for(var k in s)if(s.hasOwnProperty(k))S[k]=s[k];norm(S);engine.restart()}
  else if(d.type==='pluxee:replay'){embedded=true;engine.restart()}
  else if(d.type==='pluxee:demo'){S.demo=!!d.on;ad.classList.toggle('is-demo',S.demo)}});
window.PLUXEE={setSignals:function(s){for(var k in s)if(s.hasOwnProperty(k))S[k]=s[k];norm(S);engine.restart()},replay:function(){engine.restart()},state:snapshot};
`;

/* ---------- Markup yardımcıları ---------- */
function logoMarkup(assets) {
  if (assets && assets.logo) return `<div class="logo"><img src="${assets.logo.uri}" alt="Pluxee" class="${assets.logo.white ? 'is-white' : ''}"></div>`;
  return `<div class="logo"><b>pluxee</b><i></i></div>`;
}
function cardMarkup(assets, extra) {
  const inner = assets && assets.card
    ? `<img class="img" src="${assets.card.uri}" alt=""><span class="gloss"></span>`
    : `<span class="band"></span><span class="chip"></span>${SVG.nfc('nfc')}<span class="wm">pluxee<i></i></span><span class="gloss"></span>`;
  return `<div class="card${extra ? ' ' + extra : ''}" aria-hidden="true"><div class="face">${inner}</div></div>`;
}
function leftMarkup(data, assets, line2) {
  return `<div class="left">
    ${logoMarkup(assets)}
    <span class="eyebrow"></span>
    <div class="hl"><span class="l1"></span><span class="l2">${esc(line2)}</span></div>
    <p class="sub"></p>
    <button class="cta" type="button"><span class="cta-t"></span>${SVG.arrow}</button>
  </div>`;
}
function sigMarkup() { return `<div class="sig" aria-hidden="true"></div>`; }

/** Konsept sayfasını birleştirir. */
function page({ data, assets, concept, title, css, js, body, runtime }) {
  const photos = {}, photoPos = {}; for (const [k, v] of Object.entries((assets && assets.photos) || {})) { photos[k] = v.uri; if (v.focal) photoPos[k] = `${Math.round(v.focal[0] * 100)}% ${Math.round(v.focal[1] * 100)}%`; }
  const rt = Object.assign({
    concept,
    photos,
    photoPos,
    brand: { url: data.brand.url },
    segments: data.segments,
    cinematic: data.cinematic,
    defaults: { seg: data.defaults.seg },
    introMs: 520,
  }, runtime || {});
  const json = JSON.stringify(rt).replace(/<\//g, '<\\/');
  const script = `(function(){\n${CORE_JS}\n${PAINT_JS}\n${js}\n})();`.replace('__DATA__', () => json);
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${SIZE.w},initial-scale=1">
<meta name="ad.size" content="width=${SIZE.w},height=${SIZE.h}">
<title>${esc(data.brand.name)} – ${esc(data.brand.campaign)} · ${esc(title)} · ${SIZE.key}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
<style>${BASE_CSS}${css}</style>
</head>
<body>
<div class="ad" id="ad" role="region" aria-label="${esc(data.brand.name)} reklamı" tabindex="0" data-concept="${concept}">
${body}
<div class="beam"></div>
${sigMarkup()}
</div>
<script>${script}</script>
</body>
</html>`;
}

module.exports = { SIZE, esc, SVG, icon, BASE_CSS, CORE_JS, PAINT_JS, logoMarkup, cardMarkup, leftMarkup, page };
