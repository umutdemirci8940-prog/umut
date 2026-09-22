'use strict';
/**
 * Pluxee "Geçiyor" – 970x250 interaktif masthead şablonu.
 * Çıktı: reklam ağlarına yüklenmeye hazır, harici kaynak içermeyen tek HTML dosyası.
 *
 * Mekanik: Pluxee kartı bir "gün sokağı" boyunca ilerler; her vitrinin POS cihazına
 * dokunur ve "burada / şurada / orada … geçiyor ✓" damgası düşer. Kartın başladığı
 * durak, kopya, CTA ve gökyüzü yayın anındaki sinyallere (segment, saat, konum, hava)
 * göre kurulur. Fare/parmak sokağa girince kart kullanıcıyı takip eder.
 */

const SIZE = { key: '970x250', w: 970, h: 250, label: 'Billboard / Masthead' };

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct / 100) * (pct > 0 ? 255 - c : c))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ---------- SVG parçaları ---------- */

const NAVY = '#221C46';

// Vitrin penceresindeki ikon (merkez 50,84)
const ICONS = {
  simit: `<circle cx="50" cy="84" r="9" fill="none" stroke="#D9822B" stroke-width="5.5"/>
<circle cx="50" cy="84" r="9" fill="none" stroke="${NAVY}" stroke-width="1" opacity=".35"/>
<g fill="#FFF3EA"><circle cx="43" cy="79" r="1.1"/><circle cx="51" cy="75.5" r="1.1"/><circle cx="58" cy="82" r="1.1"/><circle cx="55" cy="91" r="1.1"/><circle cx="45" cy="91" r="1.1"/></g>`,
  cloche: `<path d="M37 88a13 13 0 0 1 26 0z" fill="#7A63FF" stroke="${NAVY}" stroke-width="2.4" stroke-linejoin="round"/>
<circle cx="50" cy="73" r="2.4" fill="${NAVY}"/>
<line x1="33" y1="92" x2="67" y2="92" stroke="${NAVY}" stroke-width="2.6" stroke-linecap="round"/>`,
  cup: `<path d="M39 77h20v9a9 9 0 0 1-9 9h-2a9 9 0 0 1-9-9z" fill="#12C77E" stroke="${NAVY}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M59 80h3a4 4 0 0 1 0 8h-3" fill="none" stroke="${NAVY}" stroke-width="2.4"/>
<path d="M45.5 72c0-2.5 2-2.5 2-5M51.5 72c0-2.5 2-2.5 2-5" fill="none" stroke="${NAVY}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
  basket: `<path d="M37 80h26l-3.5 15h-19z" fill="#FFC331" stroke="${NAVY}" stroke-width="2.4" stroke-linejoin="round"/>
<path d="M44 80l4.5-8.5M56 80l-4.5-8.5" fill="none" stroke="${NAVY}" stroke-width="2.4" stroke-linecap="round"/>
<path d="M46 85.5v6M50 85.5v6M54 85.5v6" stroke="${NAVY}" stroke-width="1.6" opacity=".55"/>`,
  phone: `<rect x="42.5" y="71" width="15" height="26" rx="3.5" fill="#3AA1FF" stroke="${NAVY}" stroke-width="2.4"/>
<circle cx="50" cy="92.5" r="1.4" fill="${NAVY}"/>
<path d="M46 82.5l2.8 2.8 5.4-5.6" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/>`,
};

function storeSvg(kind, s) {
  const stripes = [10, 30, 50, 70].map((x) => `<rect x="${x}" y="40" width="8" height="13" fill="#fff" opacity=".28"/>`).join('');
  const scallops = [8, 24, 40, 56, 72, 88].map((x) => `<circle cx="${x}" cy="53" r="8" fill="${s.awning}"/>`).join('');
  return `<svg class="store" viewBox="0 0 100 130" aria-hidden="true">
<ellipse cx="50" cy="129" rx="47" ry="2.6" fill="#000" opacity=".35"/>
<rect x="6" y="28" width="88" height="100" rx="2" fill="${s.body}"/>
<rect x="6" y="28" width="88" height="6" fill="#000" opacity=".06"/>
<rect x="10" y="96" width="18" height="32" rx="3" fill="${NAVY}" opacity=".85"/>
<rect x="13" y="100" width="12" height="11" rx="2" fill="#fff" opacity=".28"/>
<circle cx="24" cy="114" r="1.2" fill="#fff" opacity=".6"/>
<rect x="60" y="106" width="34" height="22" rx="2" fill="${shade(s.body, -16)}"/>
<rect x="60" y="106" width="34" height="3" fill="#fff" opacity=".35"/>
<circle cx="50" cy="84" r="19" fill="#fff"/>
<circle cx="50" cy="84" r="19" fill="none" stroke="${NAVY}" stroke-width="1.2" opacity=".18"/>
${ICONS[kind] || ''}
<rect x="2" y="40" width="96" height="13" fill="${s.awning}"/>${stripes}${scallops}
<rect x="10" y="5" width="80" height="24" rx="6" fill="${s.signBg}"/>
<rect x="10" y="5" width="80" height="24" rx="6" fill="none" stroke="${NAVY}" stroke-width="1" opacity=".12"/>
<text x="50" y="21.5" text-anchor="middle" font-size="10" font-weight="800" letter-spacing="1.6" fill="${NAVY}">${esc(s.sign)}</text>
</svg>`;
}

// Vitrinlerin arkasındaki şehir silüeti (670x92)
function skylineSvg() {
  const b = [[0, 40, 58], [44, 48, 34], [98, 40, 72], [142, 56, 46], [204, 44, 62], [252, 52, 30], [308, 40, 78], [352, 58, 40], [416, 46, 66], [468, 50, 36], [524, 44, 80], [572, 56, 48], [634, 40, 60]];
  const rects = b.map(([x, w, h]) => `<rect x="${x}" y="${92 - h}" width="${w}" height="${h}" rx="1.5"/>`).join('');
  const win = b.map(([x, w, h]) => {
    let o = '';
    for (let y = 92 - h + 8; y < 84; y += 10) for (let xx = x + 6; xx < x + w - 5; xx += 9) if (((xx * 7 + y * 3) % 5) < 2) o += `<rect x="${xx}" y="${y}" width="3" height="4"/>`;
    return o;
  }).join('');
  return `<svg class="skyline" viewBox="0 0 670 92" preserveAspectRatio="none" aria-hidden="true"><g fill="#2B2458">${rects}</g><g fill="#fff" opacity=".07">${win}</g></svg>`;
}

const NFC = `<svg class="nfc" viewBox="0 0 12 12" aria-hidden="true"><path d="M3.2 4.4a2.6 2.6 0 0 1 0 3.2M5.6 2.8a5 5 0 0 1 0 6.4M8 1.2a7.6 7.6 0 0 1 0 9.6" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" opacity=".85"/></svg>`;
const ARROW = `<svg viewBox="0 0 12 12" aria-hidden="true"><path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

function starsCss() {
  const pts = [[330, 22], [372, 58], [410, 14], [455, 40], [520, 26], [560, 70], [612, 12], [650, 46], [700, 30], [745, 66], [790, 18], [840, 52], [880, 84], [905, 20], [950, 62]];
  return pts.map(([x, y], i) => `radial-gradient(${i % 3 ? 1.1 : 1.6}px ${i % 3 ? 1.1 : 1.6}px at ${x}px ${y}px,#fff 60%,transparent 100%)`).join(',');
}

/* ---------- CSS ---------- */

const CSS = `
:root{--navy:#221C46;--navy2:#2B2458;--navy3:#15112F;--green:#00EB5E;--lav:#B8A9FF;--ease:cubic-bezier(.22,.8,.26,1)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:970px;height:250px;overflow:hidden;background:#221C46}
body{font-family:Inter,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.ad{position:relative;width:970px;height:250px;overflow:hidden;background:var(--navy);color:#fff;user-select:none;-webkit-user-select:none;outline:0;cursor:pointer}
.ad:focus-visible{box-shadow:inset 0 0 0 2px var(--green)}
/* gökyüzü, güneş/ay, yıldız, yağmur */
.sky{position:absolute;inset:0;opacity:0;transition:opacity .9s}
.ad.is-live .sky{opacity:1}
.ad[data-moment=breakfast] .sky{background:radial-gradient(60% 120% at 93% 0%,rgba(255,160,110,.55),transparent 62%),radial-gradient(50% 70% at 48% 110%,rgba(255,120,80,.12),transparent 60%)}
.ad[data-moment=lunch] .sky{background:radial-gradient(60% 120% at 93% 0%,rgba(255,226,122,.5),transparent 62%),radial-gradient(50% 70% at 48% 110%,rgba(0,235,94,.1),transparent 60%)}
.ad[data-moment=coffee] .sky{background:radial-gradient(60% 120% at 93% 0%,rgba(255,190,90,.5),transparent 62%),radial-gradient(50% 70% at 48% 110%,rgba(255,140,90,.1),transparent 60%)}
.ad[data-moment=evening] .sky{background:radial-gradient(60% 120% at 93% 0%,rgba(255,110,150,.5),transparent 62%),radial-gradient(50% 70% at 48% 110%,rgba(122,99,255,.18),transparent 60%)}
.ad[data-moment=night] .sky{background:radial-gradient(60% 120% at 93% 0%,rgba(122,99,255,.3),transparent 62%),linear-gradient(180deg,rgba(0,0,0,.28),transparent 70%)}
.ad.is-rain .sky{background:radial-gradient(60% 120% at 93% 0%,rgba(170,180,210,.26),transparent 62%),linear-gradient(180deg,rgba(0,0,0,.22),transparent 70%)}
.sun{position:absolute;left:918px;top:18px;width:30px;height:30px;border-radius:50%;background:#FFE27A;box-shadow:0 0 34px 10px rgba(255,226,122,.32);transition:top .9s var(--ease),background .9s,box-shadow .9s,opacity .6s}
.ad[data-moment=breakfast] .sun{background:#FFB36B;top:30px;box-shadow:0 0 34px 10px rgba(255,179,107,.32)}
.ad[data-moment=coffee] .sun{background:#FFC65C;top:22px}
.ad[data-moment=evening] .sun{background:#FF7E9D;top:28px;box-shadow:0 0 34px 12px rgba(255,126,157,.34)}
.ad[data-moment=night] .sun{background:transparent;box-shadow:inset -9px -6px 0 0 #EDE9FF,0 0 22px 4px rgba(237,233,255,.12);top:14px}
.ad.is-rain .sun{opacity:0}
.stars{position:absolute;inset:0;opacity:0;transition:opacity .9s;background-image:__STARS__;pointer-events:none}
.ad[data-moment=night]:not(.is-rain) .stars{opacity:.9}
.cloud{position:absolute;top:28px;width:130px;height:36px;border-radius:40px;background:rgba(190,196,225,.34);filter:blur(7px);opacity:0;transition:opacity .7s}
.cloud.c1{left:590px}.cloud.c2{left:820px;top:54px;width:100px}.cloud.c3{left:380px;top:46px;width:90px;height:26px}
.ad.is-rain .cloud{opacity:1}
.rain{position:absolute;left:300px;top:0;width:670px;height:188px;opacity:0;transition:opacity .6s;pointer-events:none;background-image:repeating-linear-gradient(108deg,transparent 0 16px,rgba(184,169,255,.32) 16px 17.2px,transparent 17.2px 30px);background-size:64px 96px;animation:rain .55s linear infinite}
.ad.is-rain .rain{opacity:.75}
@keyframes rain{to{background-position:-20px 96px}}
/* zemin */
.skyline{position:absolute;left:300px;top:96px;width:670px;height:92px;opacity:0;transition:opacity .9s .1s}
.ad.is-live .skyline{opacity:1}
.ground{position:absolute;left:300px;right:0;top:186px;height:2px;background:rgba(255,255,255,.09)}
.road{position:absolute;left:300px;right:0;top:188px;height:26px;background:var(--navy3)}
.road:after{content:"";position:absolute;left:0;right:0;top:12px;border-top:2px dashed rgba(255,255,255,.13)}
/* sokak: etkileşim alanı */
.street{position:absolute;left:300px;top:0;width:670px;height:250px;touch-action:none;cursor:grab;z-index:4}
.street.is-drag{cursor:grabbing}
.stop{position:absolute;top:60px;width:100px;height:130px;opacity:0;transform:translateY(10px);transition:opacity .5s calc(var(--i,0)*70ms),transform .6s calc(var(--i,0)*70ms) var(--ease),left .7s var(--ease)}
.ad.is-live .stop{opacity:1;transform:none}
.stop .store{position:absolute;inset:0;width:100px;height:130px}
.term{position:absolute;left:72px;top:88px;width:22px;height:34px;border-radius:5px;background:#171238;box-shadow:0 2px 0 #0d0a20,0 6px 12px rgba(0,0,0,.35);z-index:2}
.term:before{content:"";position:absolute;left:3px;top:3px;right:3px;height:14px;border-radius:3px;background:#3B3470;transition:background .25s}
.term:after{content:"";position:absolute;left:5px;bottom:4px;width:12px;height:9px;background:radial-gradient(circle,rgba(255,255,255,.4) 1px,transparent 1.6px) 0 0/4px 4.5px}
.term i{position:absolute;left:0;right:0;top:3px;height:14px;font-style:normal;font-size:10px;line-height:14px;text-align:center;color:var(--navy);font-weight:900;opacity:0;transform:scale(.4);transition:opacity .2s,transform .3s var(--ease)}
.stop.is-visited .term:before{background:var(--green)}
.stop.is-visited .term i{opacity:1;transform:none}
.stop[data-kind=online] .term{width:18px;height:38px;top:86px;left:74px;border-radius:6px}
.stop[data-kind=online] .term:before{height:26px}
.stop[data-kind=online] .term i{height:26px;line-height:26px}
.stop[data-kind=online] .term:after{display:none}
.ring{position:absolute;left:83px;top:98px;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;border:2px solid var(--green);opacity:0;pointer-events:none;z-index:1}
.stop.is-tap .ring{animation:ring .75s ease-out both}
.stop.is-tap .ring.r2{animation-delay:.16s}
@keyframes ring{0%{opacity:.95;transform:scale(.5)}100%{opacity:0;transform:scale(4.2)}}
.stamp{position:absolute;left:50%;top:-8px;transform:translate(-50%,8px) rotate(-6deg) scale(.6);padding:4px 8px;border-radius:6px;background:var(--green);color:var(--navy);font-size:9.5px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;white-space:nowrap;opacity:0;box-shadow:0 6px 16px rgba(0,235,94,.35);z-index:3;pointer-events:none;transition:opacity .22s,transform .35s var(--ease)}
.stop.is-tap .stamp{opacity:1;transform:translate(-50%,0) rotate(-6deg) scale(1)}
.badge{position:absolute;right:4px;top:-4px;width:18px;height:18px;border-radius:50%;background:var(--green);color:var(--navy);font-size:11px;font-weight:900;line-height:18px;text-align:center;opacity:0;transform:scale(.3);transition:opacity .25s,transform .35s var(--ease);z-index:3;box-shadow:0 3px 8px rgba(0,0,0,.35)}
.stop.is-visited:not(.is-tap) .badge{opacity:1;transform:none}
.tl{position:absolute;left:0;width:100px;top:156px;text-align:center;font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.4);transition:color .3s;white-space:nowrap}
.tl:before{content:"";display:block;width:6px;height:6px;margin:0 auto 5px;border-radius:50%;background:rgba(255,255,255,.2);transition:background .3s,box-shadow .3s}
.stop.is-here .tl{color:#fff}
.stop.is-visited .tl{color:var(--green)}
.stop.is-visited .tl:before{background:var(--green);box-shadow:0 0 8px rgba(0,235,94,.6)}
/* kart */
.card{position:absolute;top:172px;left:18px;width:64px;height:40px;border-radius:7px;background:linear-gradient(135deg,#2E2766 0%,#1A1440 60%,#120E30 100%);box-shadow:0 10px 20px rgba(0,0,0,.45),inset 0 0 0 1px rgba(255,255,255,.14);z-index:5;transition:left .72s var(--ease),transform .38s var(--ease),opacity .5s .3s;will-change:left,transform;opacity:0;pointer-events:none}
.ad.is-live .card{opacity:1}
.card.is-tap{transform:translate(20px,-46px) rotate(-14deg)}
.card .chip{position:absolute;left:8px;top:9px;width:12px;height:9px;border-radius:2px;background:linear-gradient(135deg,#FFD76A,#D9A72B);box-shadow:inset 0 0 0 .5px rgba(0,0,0,.25)}
.card .nfc{position:absolute;right:7px;top:7px;width:12px;height:12px}
.card .cw{position:absolute;left:8px;bottom:9px;font-size:9.5px;font-weight:800;color:#fff;letter-spacing:.01em;line-height:1}
.card .stripe{position:absolute;left:0;right:0;bottom:0;height:4px;border-radius:0 0 6px 6px;background:var(--green)}
.card .shine{position:absolute;inset:0;border-radius:7px;background:linear-gradient(115deg,transparent 40%,rgba(255,255,255,.16) 50%,transparent 60%) 0 0/220% 100%;animation:shine 3.6s ease-in-out infinite}
@keyframes shine{0%,30%{background-position:120% 0}70%,100%{background-position:-20% 0}}
/* sol sütun */
.left{position:absolute;left:26px;top:24px;width:268px;height:210px;z-index:6}
.logo{display:flex;align-items:center;gap:7px;height:22px}
.logo b{font-size:21px;font-weight:800;letter-spacing:-.025em;color:#fff;line-height:1}
.logo i{width:8px;height:8px;border-radius:2px;background:var(--green);transform:rotate(45deg);margin-top:1px}
.logo small{font-size:8.5px;letter-spacing:.2em;text-transform:uppercase;color:var(--lav);font-weight:700;margin:3px 0 0 3px}
.hl{position:absolute;left:0;top:42px;width:268px;transition:opacity .22s,transform .22s var(--ease)}
.hl.is-out{opacity:0;transform:translateY(5px)}
.hl-top{display:block;font-size:10px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--green);height:14px;line-height:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.hl-main{display:block;margin-top:6px;font-size:25px;font-weight:800;letter-spacing:-.015em;line-height:1.1;white-space:nowrap;color:#fff}
.hl-main em{font-style:normal;color:var(--green)}
.hl-sub{display:block;margin-top:7px;font-size:12.5px;line-height:1.42;color:rgba(255,255,255,.8);height:36px;overflow:hidden}
.cta{position:absolute;left:0;top:156px;display:inline-flex;align-items:center;gap:8px;height:36px;padding:0 15px 0 16px;border-radius:99px;background:var(--green);color:var(--navy);font:inherit;font-size:12.5px;font-weight:800;border:0;cursor:pointer;box-shadow:0 8px 20px rgba(0,235,94,.28);transition:transform .25s var(--ease),box-shadow .25s;white-space:nowrap}
.cta:hover{transform:translateY(-1px);box-shadow:0 10px 24px rgba(0,235,94,.42)}
.cta svg{width:12px;height:12px}
.ad.is-final .cta{animation:pulse 1.6s ease-in-out infinite}
@keyframes pulse{0%,100%{box-shadow:0 8px 20px rgba(0,235,94,.28)}50%{box-shadow:0 8px 20px rgba(0,235,94,.28),0 0 0 7px rgba(0,235,94,.16)}}
.left,.left *{pointer-events:auto}
/* sinyal çubuğu (sunum modu) */
.sig{position:absolute;left:306px;top:8px;height:18px;display:none;align-items:center;gap:4px;z-index:7;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;letter-spacing:.03em;pointer-events:none}
.ad.is-demo .sig{display:flex}
.sig span{padding:0 6px;height:18px;line-height:18px;border-radius:4px;background:rgba(0,0,0,.4);color:rgba(255,255,255,.85);box-shadow:inset 0 0 0 1px rgba(255,255,255,.12);white-space:nowrap}
.sig span b{color:var(--green);font-weight:700}
.sig .lbl{background:var(--green);color:var(--navy);font-weight:800;letter-spacing:.06em}
@media (prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;transition-delay:0s!important}}
`;

/* ---------- Tarayıcı tarafı (ES5) ---------- */

const JS = `
(function(){
var D=__DATA__;
var ad=document.getElementById('ad'),street=ad.querySelector('.street'),card=ad.querySelector('.card');
var hl=ad.querySelector('.hl'),hlTop=ad.querySelector('.hl-top'),hlMain=ad.querySelector('.hl-main'),hlSub=ad.querySelector('.hl-sub'),cta=ad.querySelector('.cta'),ctaT=ad.querySelector('.cta-t'),sig=ad.querySelector('.sig');
var STOP_X=[50,187,324,461,598],CARD_W=64;
var stopEls={};[].forEach.call(ad.querySelectorAll('.stop'),function(el){stopEls[el.getAttribute('data-kind')]=el});
var S={},G=null,order=[],timers=[],tapCount=0,loops=0,manual=false,ended=false,finalState=false,embedded=false,resumeT=null,current=-1,lastCross=-1,variant='',momentKey='',copyKey='',currentCopy={};
var reduced=!!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches);

function q(n){var m=new RegExp('[?&]'+n+'=([^&#]*)').exec(location.search);return m?decodeURIComponent(m[1].replace(/\\+/g,' ')):null}
function pad(n){return (n<10?'0':'')+n}
function fmt(n){return String(n).replace(/\\B(?=(\\d{3})+(?!\\d))/g,'.')}
function norm(s){
  if(!D.segments[s.seg])s.seg=D.defaults.seg;
  s.hour=((Math.floor(+s.hour)||0)%24+24)%24;s.minute=Math.max(0,Math.min(59,Math.floor(+s.minute)||0));
  s.weather=s.weather==='rain'?'rain':'sun';s.geo=String(s.geo||'none').toLowerCase();s.demo=!!s.demo;return s;
}
function readSignals(){
  var now=new Date();
  var s={seg:q('seg')||D.defaults.seg,hour:q('h')!==null?+q('h'):now.getHours(),minute:q('m')!==null?+q('m'):now.getMinutes(),geo:q('geo')||D.defaults.geo,weather:q('w')||D.defaults.weather,demo:q('demo')==='1'};
  var o=window.__PLUXEE_SIGNALS;if(o)for(var k in o)if(o.hasOwnProperty(k))s[k]=o[k];
  return norm(s);
}
function momentIndex(h){for(var i=0;i<D.moments.length;i++){var m=D.moments[i];if(m.from<=m.to?(h>=m.from&&h<=m.to):(h>=m.from||h<=m.to))return i}return 0}
function geoInfo(g){
  if(!g||g==='none')return {key:'none',name:D.geoNone.name,loc:D.geoNone.loc,n:D.geoNone.countText,count:null};
  var x=D.geos[g];if(x)return {key:g,name:x.name,loc:x.loc,n:fmt(x.count),count:x.count,city:x.city};
  var nm=g.charAt(0).toUpperCase()+g.slice(1);
  return {key:g,name:nm,loc:D.geoUnknown.loc.replace('{geo}',nm),n:D.geoUnknown.countText,count:null};
}
function fill(t){return t.replace(/\\{geo\\}/g,G.name).replace(/\\{loc\\}/g,G.loc).replace(/\\{n\\}/g,G.n)}
function later(fn,ms){var t=setTimeout(fn,ms);timers.push(t);return t}
function clearTimers(){while(timers.length)clearTimeout(timers.pop())}
function within(el,cls){while(el&&el!==ad){if(el.classList&&el.classList.contains(cls))return true;el=el.parentNode}return false}

/* Sinyaller → sahne kurulumu */
var firstBuild=true;
function build(){
  var M=D.moments,mi=momentIndex(S.hour);G=geoInfo(S.geo);momentKey=M[mi].key;
  order=[];for(var k=0;k<M.length;k++){var idx=(mi+k)%M.length;order.push({moment:M[idx],idx:idx,wrapped:idx<mi,visited:false})}
  if(S.weather==='rain'){for(k=0;k<order.length;k++)if(order[k].moment.key==='night'&&k>0){order.unshift(order.splice(k,1)[0]);break}}
  for(k=0;k<order.length;k++){
    var o=order[k];o.label=k===0?'şimdi':((o.wrapped&&S.hour>=12)?'yarın ':'')+o.moment.label;
    var el=stopEls[o.moment.stop];o.el=el;el.className='stop';if(firstBuild)el.style.transition='none';el.style.left=(STOP_X[k]-50)+'px';el.style.setProperty('--i',k);el.setAttribute('data-i',k);
    el.querySelector('.tl').textContent=o.label;el.setAttribute('aria-label',o.moment.stop+' – '+o.label);
  }
  if(firstBuild){void ad.offsetWidth;for(k=0;k<order.length;k++)order[k].el.style.transition='';firstBuild=false}
  copyKey=S.weather==='rain'?'rain':momentKey;
  ad.setAttribute('data-moment',momentKey);
  ad.classList.toggle('is-rain',S.weather==='rain');ad.classList.toggle('is-demo',S.demo);
  variant=[S.seg,copyKey,G.key,S.weather].join('-').toUpperCase();
  ad.setAttribute('data-variant',variant);
  sig.innerHTML='<span class="lbl">DATA LAYER</span><span>SAAT <b>'+pad(S.hour)+':'+pad(S.minute)+'</b></span><span>KONUM <b>'+esc(G.name)+'</b></span><span>HAVA <b>'+esc(D.weather[S.weather].label)+'</b></span><span>SEGMENT <b>'+esc(D.segments[S.seg].label)+'</b></span><span>#'+esc(variant)+'</span>';
  setCopy(false,false);
}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}
function setCopy(fin,animate){
  var c=D.copy[S.seg][fin?'final':copyKey],top=fill(c.top),sub=fill(c.sub),ctaText=D.segments[S.seg].cta;
  var main=fin?'<b>Her yerde</b> <em>geçiyor.</em>':'<b>Pluxee</b> <em>geçiyor.</em>';
  currentCopy={top:top,main:fin?'Her yerde geçiyor.':'Pluxee geçiyor.',sub:sub,cta:ctaText};
  var apply=function(){hlTop.textContent=top;hlMain.innerHTML=main;hlSub.textContent=sub;ctaT.textContent=ctaText;hl.classList.remove('is-out')};
  if(animate&&!reduced){hl.classList.add('is-out');setTimeout(apply,220)}else apply();
}

/* Kart ve duraklar */
function placeCard(i,instant){
  if(instant){card.style.transition='none'}
  card.style.left=(STOP_X[i]-CARD_W/2)+'px';
  if(instant){void card.offsetWidth;card.style.transition=''}
  current=i;markHere(i);
}
function markHere(i){for(var k=0;k<order.length;k++)order[k].el.classList.toggle('is-here',k===i)}
function visitedCount(){var n=0;for(var k=0;k<order.length;k++)if(order[k].visited)n++;return n}
function tap(i){
  var o=order[i];if(o.visited)return false;o.visited=true;
  var word=D.stampWords[Math.min(tapCount,D.stampWords.length-1)];tapCount++;
  o.el.querySelector('.stamp').textContent=word+' geçiyor ✓';
  flash(o.el);o.el.classList.add('is-visited');emit('state');return true;
}
function flash(el){
  el.classList.remove('is-tap');void el.offsetWidth;el.classList.add('is-tap');
  card.classList.add('is-tap');setTimeout(function(){card.classList.remove('is-tap')},420);
  setTimeout(function(){el.classList.remove('is-tap')},1300);
}
function visit(i){
  placeCard(i);
  later(function(){tap(i);later(function(){if(manual)return;if(i+1<order.length)visit(i+1);else finish(false)},D.timing.dwell)},D.timing.move);
}
function finish(byUser){
  finalState=true;ad.classList.add('is-final');setCopy(true,true);
  if(byUser||reduced){ended=true;ad.classList.add('is-ended');emit('state');return}
  emit('state');
  later(function(){loops++;if(loops<D.timing.loops){reset();start()}else{ended=true;ad.classList.add('is-ended');emit('state')}},D.timing.hold);
}
function reset(){
  clearTimers();for(var k=0;k<order.length;k++){order[k].visited=false;order[k].el.classList.remove('is-visited','is-tap','is-here')}
  tapCount=0;finalState=false;ended=false;lastCross=-1;ad.classList.remove('is-final','is-ended');setCopy(false,false);
}
function start(){
  ad.classList.add('is-live');placeCard(0,true);
  if(reduced){for(var k=0;k<order.length;k++){order[k].visited=true;order[k].el.classList.add('is-visited')}tapCount=order.length;placeCard(order.length-1,true);finish(true);return}
  emit('state');
  later(function(){visit(0)},D.timing.enter);
}
function restart(){clearTimers();if(resumeT){clearTimeout(resumeT);resumeT=null}manual=false;street.classList.remove('is-drag');ad.classList.remove('is-manual');card.style.transition='';loops=0;reset();build();start()}

/* Elle kontrol: fare/parmak sokağa girince kart takip eder, duraktan geçerken dokunur */
function xIn(e){var r=street.getBoundingClientRect();return (e.clientX-r.left)*(670/(r.width||670))}
function nearest(x){var b=0,bd=1e9;for(var k=0;k<STOP_X.length;k++){var d=Math.abs(STOP_X[k]-x);if(d<bd){bd=d;b=k}}return b}
function enterManual(){
  if(manual)return;manual=true;clearTimers();if(resumeT){clearTimeout(resumeT);resumeT=null}
  ad.classList.add('is-manual');card.style.transition='left .12s linear,transform .38s var(--ease)';emit('state');
}
function crossAt(n){
  lastCross=n;current=n;markHere(n);
  if(!order[n].visited){tap(n);if(visitedCount()===order.length&&!finalState)finish(true)}else flash(order[n].el);
}
function onMove(e){
  enterManual();
  var x=Math.max(STOP_X[0],Math.min(STOP_X[STOP_X.length-1],xIn(e)));
  card.style.left=(x-CARD_W/2)+'px';
  var n=nearest(x);
  if(Math.abs(STOP_X[n]-x)<20){if(n!==lastCross)crossAt(n)}else lastCross=-1;
}
function leaveManual(){
  street.classList.remove('is-drag');if(!manual)return;
  if(resumeT)clearTimeout(resumeT);
  resumeT=setTimeout(function(){
    resumeT=null;manual=false;ad.classList.remove('is-manual');card.style.transition='';lastCross=-1;
    if(ended)return;
    var next=-1;for(var k=0;k<order.length;k++)if(!order[k].visited){next=k;break}
    if(next<0)finish(false);else visit(next);
    emit('state');
  },D.timing.resume);
}
function stepTo(n){enterManual();n=Math.max(0,Math.min(order.length-1,n));card.style.left=(STOP_X[n]-CARD_W/2)+'px';crossAt(n);leaveManual()}

street.addEventListener('pointermove',onMove);
street.addEventListener('pointerdown',function(e){street.classList.add('is-drag');onMove(e)});
street.addEventListener('pointerup',function(){street.classList.remove('is-drag')});
street.addEventListener('pointerleave',leaveManual);
street.addEventListener('pointercancel',leaveManual);
street.addEventListener('click',function(e){e.stopPropagation()});
[].forEach.call(ad.querySelectorAll('.stop'),function(el){el.addEventListener('click',function(e){e.stopPropagation();stepTo(+el.getAttribute('data-i')||0)})});

/* Tıklama: sol sütun ve CTA reklam çıkışı; sokak etkileşim alanı */
function openLink(){
  var u=window.clickTag||D.brand.url;
  if(embedded&&!window.clickTag){emit('click',{url:u});return}
  if(window.Enabler&&window.Enabler.exit){window.Enabler.exit('CTA')}else{window.open(u,'_blank','noopener')}
}
ad.addEventListener('click',function(e){if(within(e.target,'street'))return;openLink()});
cta.addEventListener('click',function(e){e.stopPropagation();openLink()});
ad.addEventListener('keydown',function(e){
  if(e.key==='ArrowRight'){e.preventDefault();stepTo((current<0?0:current)+1)}
  else if(e.key==='ArrowLeft'){e.preventDefault();stepTo((current<0?0:current)-1)}
  else if(e.key==='Enter'){openLink()}
});

/* Sunum / entegrasyon API'si (postMessage) */
function emit(type,extra){
  if(!embedded||!(window.parent&&window.parent!==window))return;
  var names=[],labels=[];for(var k=0;k<order.length;k++){names.push(order[k].moment.stop);labels.push(order[k].label)}
  var msg={type:'pluxee:'+type,variant:variant,moment:momentKey,copyKey:copyKey,order:names,labels:labels,visited:visitedCount(),total:order.length,finalState:finalState,ended:ended,manual:manual,copy:currentCopy,signals:S,geo:G};
  if(extra)for(var x in extra)if(extra.hasOwnProperty(x))msg[x]=extra[x];
  try{window.parent.postMessage(msg,'*')}catch(err){}
}
window.addEventListener('message',function(e){
  var d=e.data;if(!d||typeof d!=='object'||typeof d.type!=='string')return;
  if(d.type==='pluxee:signals'){embedded=true;var s=d.signals||{};for(var k in s)if(s.hasOwnProperty(k))S[k]=s[k];norm(S);restart()}
  else if(d.type==='pluxee:replay'){embedded=true;restart()}
  else if(d.type==='pluxee:demo'){S.demo=!!d.on;ad.classList.toggle('is-demo',S.demo)}
});
window.PLUXEE={setSignals:function(s){for(var k in s)if(s.hasOwnProperty(k))S[k]=s[k];norm(S);restart()},replay:restart,state:function(){return {variant:variant,moment:momentKey,visited:visitedCount(),finalState:finalState,ended:ended,manual:manual,copy:currentCopy,signals:S}}};

S=readSignals();build();start();
})();
`;

/* ---------- HTML ---------- */

function render(data) {
  const runtime = {
    brand: { url: data.brand.url },
    timing: data.timing,
    segments: data.segments,
    moments: data.moments,
    stampWords: data.stampWords,
    geos: data.geos,
    geoUnknown: data.geoUnknown,
    geoNone: data.geoNone,
    weather: data.weather,
    copy: data.copy,
    defaults: data.defaults,
  };
  const stops = data.moments.map((m) => {
    const s = data.stops[m.stop];
    return `<div class="stop" data-kind="${m.stop}" style="left:0">${storeSvg(s.icon, s)}<div class="term"><i>✓</i></div><span class="ring"></span><span class="ring r2"></span><span class="stamp"></span><span class="badge">✓</span><span class="tl"></span></div>`;
  }).join('\n');

  const json = JSON.stringify(runtime).replace(/<\//g, '<\\/');
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${SIZE.w},initial-scale=1">
<meta name="ad.size" content="width=${SIZE.w},height=${SIZE.h}">
<title>${esc(data.brand.name)} – ${esc(data.brand.campaign)} · ${SIZE.key}</title>
<style>${CSS.replace('__STARS__', starsCss())}</style>
</head>
<body>
<div class="ad" id="ad" role="region" aria-label="${esc(data.brand.name)} reklamı" tabindex="0" data-moment="lunch">
  <div class="sky"></div>
  <div class="stars"></div>
  <div class="sun"></div>
  <div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div>
  <div class="rain"></div>
  ${skylineSvg()}
  <div class="ground"></div>
  <div class="road"></div>
  <div class="street" aria-label="Pluxee kartını sürükleyin">
    ${stops}
    <div class="card" aria-hidden="true"><span class="chip"></span>${NFC}<span class="cw">pluxee</span><span class="stripe"></span><span class="shine"></span></div>
  </div>
  <div class="left">
    <div class="logo"><b>pluxee</b><i></i></div>
    <div class="hl">
      <span class="hl-top"></span>
      <span class="hl-main"><b>Pluxee</b> <em>geçiyor.</em></span>
      <span class="hl-sub"></span>
    </div>
    <button class="cta" type="button"><span class="cta-t"></span>${ARROW}</button>
  </div>
  <div class="sig" aria-hidden="true"></div>
</div>
<script>${JS.replace('__DATA__', json)}</script>
</body>
</html>`;
}

module.exports = { render, SIZE };
