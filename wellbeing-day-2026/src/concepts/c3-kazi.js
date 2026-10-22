'use strict';
/**
 * Çalışma 3 – "Kazıyın, ışığınızı ortaya çıkarın"
 * Altın ışıltılı bir kazı kartı; kullanıcı fareyle üzerinden geçerek (mobilde parmağıyla) kazır.
 * Altından Elif Tuncel, slogan, tarih/mekân ve CTA çıkar. Yeterince kazınınca kart kendiliğinden açılır;
 * etkileşim yoksa kısa bir otomatik kazıma ile açılır.
 */
const { esc, stars, burst, brandHTML, RUNTIME, page } = require('../common');

const CSS = `
.card{position:absolute;z-index:3;border-radius:16px;overflow:hidden;background:rgba(255,250,244,.86);
  box-shadow:0 14px 34px -18px rgba(31,26,23,.55);border:1px solid rgba(255,255,255,.8);opacity:0;transform:translateY(10px);
  transition:opacity .8s .5s,transform .9s .5s cubic-bezier(.2,.8,.2,1)}
.ad.on .card{opacity:1;transform:none}
.card:not(.open){touch-action:none;cursor:crosshair}
.pc{position:absolute;border-radius:50%;padding:5px;background:linear-gradient(140deg,#fff,rgba(255,255,255,.5));box-shadow:0 10px 24px -12px rgba(31,26,23,.5)}
.pc img{display:block;width:100%;height:100%;border-radius:50%;object-fit:cover}
.ct{position:absolute;display:flex;flex-direction:column;justify-content:center}
.ct h2{font-weight:600;line-height:1.06;margin-top:5px}
.ct p{font-size:11px;color:var(--ink2);margin-top:6px;line-height:1.45}
.ct p b{color:var(--ink)}
.ct .kicker{color:#a8804c;font-size:9.5px}
.cover{position:absolute;inset:0;width:100%;height:100%;display:block;transition:opacity .7s}
.card.open .cover{opacity:0;pointer-events:none}
.ctext{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none;color:#3b2a1a;transition:opacity .4s}
.ctext b{font-family:Cinzel,Georgia,serif;font-weight:600;letter-spacing:.18em}
.ctext span{font-family:'Cormorant Garamond',Georgia,serif;font-style:italic;font-weight:600;margin-top:2px}
.ctext .hand{width:30px;height:30px;margin-top:10px;animation:swipe 1.8s ease-in-out infinite}
@keyframes swipe{0%,100%{transform:translate(-26px,0) rotate(-8deg)}50%{transform:translate(26px,4px) rotate(8deg)}}
.card.scratching .ctext,.card.open .ctext{opacity:0}
.cta.pulse{animation:ctaPulse 1.8s ease-in-out 4}
.note{position:absolute;z-index:3;font-size:10.5px;color:var(--ink2);font-weight:500;opacity:0;transition:opacity .8s 1s}
.note b{color:var(--gold)}
.ad.on .note{opacity:1}

/* ---------- 970x250 ---------- */
.s970 .brand{left:30px;top:0;width:290px;height:250px;display:flex;flex-direction:column;justify-content:center}
.s970 .note{left:30px;top:186px}
.s970 .card{left:336px;top:20px;width:614px;height:210px}
.s970 .pc{left:22px;top:22px;width:166px;height:166px}
.s970 .ct{left:212px;right:22px;top:0;bottom:0}
.s970 .ct h2{font-size:25px}
.s970 .ct .cta{align-self:flex-start;margin-top:12px}
.s970 .ctext b{font-size:24px}
.s970 .ctext span{font-size:20px}
.s970 .burst{left:643px;top:125px}
.s970 .star.a{left:300px;top:30px;width:18px;height:18px}
.s970 .star.b{left:320px;top:200px;width:14px;height:14px;animation-delay:1.3s}
.s970 .star.c{left:940px;top:12px;width:13px;height:13px;animation-delay:2.2s}

/* ---------- 320x480 ---------- */
.s320 .card{left:14px;top:98px;width:292px;height:304px}
.s320 .pc{left:81px;top:18px;width:130px;height:130px}
.s320 .ct{left:14px;right:14px;top:146px;bottom:14px;text-align:center;align-items:center;justify-content:center}
.s320 .ct h2{font-size:21px}
.s320 .ctext b{font-size:22px}
.s320 .ctext span{font-size:19px;padding:0 20px}
.s320 .bot{position:absolute;left:14px;right:14px;top:412px;z-index:3;display:flex;flex-direction:column;align-items:center;gap:7px}
.s320 .bot .cta{width:100%;height:40px;font-size:12.5px}
.s320 .note{position:static}
.s320 .burst{left:160px;top:250px}
.s320 .star.a{left:16px;top:84px;width:16px;height:16px}
.s320 .star.b{left:286px;top:80px;width:14px;height:14px;animation-delay:1.3s}
.s320 .star.c{left:290px;top:396px;width:12px;height:12px;animation-delay:2.2s}
`;

const HAND = '<svg class="hand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 11V5a2 2 0 1 1 4 0v5"/><path d="M13 10V8a2 2 0 1 1 4 0v4"/><path d="M17 11a2 2 0 1 1 4 0v3a7 7 0 0 1-7 7h-1a7 7 0 0 1-6-3.4L4.3 14a1.8 1.8 0 0 1 3-2L9 14"/></svg>';

const SCRIPT = `
var card=ad.querySelector('.card'),cv=ad.querySelector('.cover'),g=cv.getContext('2d',{willReadFrequently:true});
var dpr=Math.min(2,window.devicePixelRatio||1),W=card.offsetWidth,H=card.offsetHeight;
cv.width=W*dpr;cv.height=H*dpr;
var done=false,touched=false,down=false,lastPt=null,moves=0;
var bgSrc=(getComputedStyle(ad).backgroundImage.match(/url\\(["']?(.*?)["']?\\)/)||[])[1];
function rnd(s){return function(){s=(s*9301+49297)%233280;return s/233280;};}
function paint(img){
  g.globalCompositeOperation='source-over';
  if(img){var r=Math.max(cv.width/img.width,cv.height/img.height),iw=img.width*r,ih=img.height*r;g.drawImage(img,(cv.width-iw)/2,(cv.height-ih)/2,iw,ih);}
  var gr=g.createLinearGradient(0,0,cv.width,cv.height);
  gr.addColorStop(0,'rgba(208,160,98,.82)');gr.addColorStop(.5,'rgba(242,214,166,.80)');gr.addColorStop(1,'rgba(192,142,82,.86)');
  g.fillStyle=gr;g.fillRect(0,0,cv.width,cv.height);
  var R=rnd(7);
  for(var i=0;i<160;i++){g.globalAlpha=.25+R()*.6;g.fillStyle='#fff';g.beginPath();g.arc(R()*cv.width,R()*cv.height,(R()*1.6+.3)*dpr,0,7);g.fill();}
  g.globalAlpha=1;
}
paint(null);
if(bgSrc){var im=new Image();im.onload=function(){if(!touched&&!done)paint(im);};im.src=bgSrc;}
function scratchTo(x,y){
  g.globalCompositeOperation='destination-out';g.lineWidth=40*dpr;g.lineCap=g.lineJoin='round';
  g.beginPath();var a=lastPt||{x:x,y:y};g.moveTo(a.x*dpr,a.y*dpr);g.lineTo(x*dpr+.1,y*dpr);g.stroke();lastPt={x:x,y:y};
  if(++moves%8===0)check();
}
function check(){
  var d=g.getImageData(0,0,cv.width,cv.height).data,step=16*4*dpr|0,clear=0,n=0;
  for(var i=3;i<d.length;i+=step){n++;if(d[i]<128)clear++;}
  if(clear/n>C.revealAt)reveal();
}
function pos(e){var r=card.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height};}
function start(){if(!touched){touched=true;card.classList.add('scratching');AD.detail='kazi';AD.count('kazi_basla');}}
card.addEventListener('pointerdown',function(e){if(done)return;down=true;lastPt=null;start();var p=pos(e);scratchTo(p.x,p.y);
  if(card.setPointerCapture){try{card.setPointerCapture(e.pointerId);}catch(_){}}});
card.addEventListener('pointermove',function(e){if(done)return;if(e.pointerType==='mouse'||down){start();var p=pos(e);scratchTo(p.x,p.y);}});
card.addEventListener('pointerup',function(){down=false;lastPt=null;});
card.addEventListener('pointerleave',function(){lastPt=null;});
function reveal(){
  if(done)return;done=true;card.classList.add('open');card.removeAttribute('data-noexit');
  ad.classList.add('revealed');AD.burst();
  setTimeout(function(){[].forEach.call(ad.querySelectorAll('.cta'),function(b){b.classList.add('pulse');});},700);
}
function autoScratch(){
  if(touched||done)return;
  card.classList.add('scratching');AD.detail='kazi-otomatik';
  var pts=[],rows=4;for(var r=0;r<rows;r++){var y=H*(r+.5)/rows;pts.push({x:r%2?W*.92:W*.08,y:y-H*.08},{x:r%2?W*.08:W*.92,y:y+H*.08});}
  var t0=0,dur=C.autoDur; // kullanıcı kazımaya başlarsa otomatik akış durur
  (function f(t){if(touched)return;if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur),seg=k*(pts.length-1),i=Math.floor(seg),fr=seg-i;
    var a=pts[i],b=pts[Math.min(i+1,pts.length-1)];scratchTo(a.x+(b.x-a.x)*fr,a.y+(b.y-a.y)*fr);
    if(k<1&&!done)requestAnimationFrame(f);else reveal();})(performance.now());
}
AD.onStop=reveal;
AD.ready(function(){setTimeout(autoScratch,C.autoAfter);});
`;

function render(sizeKey, data, img) {
  const is970 = sizeKey === '970x250';
  const ev = data.event;
  const t = data.concepts.kazi;
  const cfg = { concept: 'kazi', size: sizeKey, url: data.url, utm: data.utm, timing: data.timing, autoAfter: t.autoAfter, autoDur: t.autoDur, revealAt: t.revealAt };
  const note = `<div class="note"><b>${esc(ev.season)}</b> · ${esc(ev.note)}</div>`;
  const cta = `<button class="cta red" type="button">${esc(data.ctaEnd)}<i>→</i></button>`;
  const body = `<div id="ad" class="ad ${is970 ? 's970' : 's320'}" style="--bg:url(${img.bg})" aria-label="${esc(ev.academy)} – İçten Dışa Parla ${esc(ev.sub)}, ${esc(ev.date)} ${esc(ev.time)}, ${esc(ev.venue)}. ${esc(ev.note)}.">
  ${stars(3)}
  ${brandHTML(ev, img, false)}
  ${is970 ? note : ''}
  <div class="card" data-noexit>
    <div class="pc"><img src="${img.portrait}" alt="${esc(ev.host)}"></div>
    <div class="ct">
      <div class="kicker">${esc(ev.date)} · ${esc(ev.time)}</div>
      <h2 class="serif">${esc(ev.slogan)}</h2>
      <p><b>${esc(ev.venue)}</b><br>${esc(t.line)}</p>
      ${is970 ? cta : ''}
    </div>
    <canvas class="cover" aria-hidden="true"></canvas>
    <div class="ctext" aria-hidden="true"><b>${esc(t.coverTitle)}</b><span>${esc(t.coverText)}</span>${HAND}</div>
  </div>
  ${burst(12)}
  ${is970 ? '' : `<div class="bot">${cta}${note}</div>`}
</div>`;
  return page({ sizeKey, title: `İçten Dışa Parla – Kazı & Parla (${sizeKey})`, css: CSS, body, script: RUNTIME(cfg) + SCRIPT });
}

module.exports = { key: 'kazi', name: 'Kazıyın, ışığınızı ortaya çıkarın', render };
