'use strict';
/**
 * KONSEPT 4 – Silme: Pluxee kartı bir AYIRAÇTIR. Kullanıcı kartı yatay fotoğraf şeridi üzerinde
 * sürükler; kartın geçtiği yer renklenir ve "GEÇİYOR ✓" damgası basılır — kelimenin tam anlamıyla
 * "Pluxee geçiyor". Dokunulmazsa kart şeridi kendisi kat eder (~13 sn). Dokunma: bir sonraki panele geçer.
 * Fotoğraf + tipografi + kart; vektör illüstrasyon yok.
 */
const { SVG, esc, cardMarkup, leftMarkup, page } = require('../common');

const COPY = {
  words: { restoran: 'Restoranda,', kafe: 'Kafede,', market: 'Markette,', online: 'Online siparişte,' },
  line2: 'Pluxee geçiyor.',
  final: { title: 'Burada, şurada, orada', word: 'Her yerde,' },
  stamp: 'GEÇİYOR',
  hint: 'Kartı sürükleyin',
  hintSub: 'geçtiği yer renklensin',
  replay: 'Yeniden geçir',
  timing: {
    enter: 1100,   // giriş sonrası: şerit belirir, kart düşer, ışık çizgisi yanar → silme başlar
    glide: 13000,  // dokunulmazsa kenarın 0 → %100 kayma süresi (panel başına ease-in-out)
    hold: 3000,    // final karesi
    resume: 1600,  // kullanıcı bıraktıktan sonra otomatik kaymaya dönüş
  },
};

const KEYS = ['restoran', 'kafe', 'market', 'online'];

const CSS = `
/* sol zemin: sönük yaşam fotoğrafı + lacivert perde (finalde hafifçe renklenir) */
.back{position:absolute;left:0;top:0;width:440px;height:250px;overflow:hidden;background:var(--ink);z-index:1}
.back .ph,.back canvas{position:absolute;left:0;top:0;width:640px;height:250px;object-fit:cover;display:block;opacity:0;filter:grayscale(1) brightness(.34);transform:scale(1.04);transition:opacity 1.3s .15s,filter 1.4s var(--ease),transform 1.4s var(--ease)}
.ad.is-live .back .ph,.ad.is-live .back canvas{opacity:.6}
.ad.is-final .back .ph,.ad.is-final .back canvas{filter:grayscale(.35) brightness(.4);transform:scale(1)}
.back:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,12,38,.9) 0%,rgba(15,12,38,.84) 52%,rgba(15,12,38,.62) 100%),linear-gradient(180deg,rgba(15,12,38,.15),rgba(15,12,38,.55))}
.back .grain{z-index:2}
/* sahne: 4 panelli fotoğraf şeridi */
.scene{position:absolute;left:440px;top:0;width:530px;height:250px;z-index:4;overflow:hidden;touch-action:none;cursor:grab;background:#0B0920;box-shadow:-18px 0 36px rgba(0,0,0,.5)}
.scene.is-drag{cursor:grabbing}
.strip{position:absolute;inset:0;display:flex}
.strip.dim{filter:grayscale(1) brightness(.42);z-index:1}
.strip.col{z-index:2;clip-path:inset(0 530px 0 0);-webkit-clip-path:inset(0 530px 0 0)}
.panel{position:relative;flex:1 1 0;min-width:0;overflow:hidden;opacity:0;transform:translateY(14px);transition:flex-grow .75s var(--ease),opacity .6s,transform .75s var(--ease)}
.strip.is-in .panel{opacity:1;transform:none}
.panel.is-done{flex-grow:1.25}
.panel img.ph,.panel canvas{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;display:block}
.panel:after{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.34) 0%,rgba(0,0,0,0) 34%,rgba(0,0,0,0) 56%,rgba(0,0,0,.66) 100%)}
.panel+.panel{box-shadow:inset 1px 0 0 rgba(255,255,255,.08)}
.cap{position:absolute;left:12px;bottom:12px;z-index:2;display:flex;flex-direction:column;gap:3px;pointer-events:none}
.cap b{font-size:9px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#fff;line-height:1;text-shadow:0 1px 10px rgba(0,0,0,.6);white-space:nowrap}
.cap small{font-size:8px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.66);line-height:1;white-space:nowrap}
.strip.col .panel.is-done .cap small{color:var(--green)}
/* damga: "GEÇİYOR ✓" (kauçuk damga: 1.6 → 1, -8°) */
.stamp{position:absolute;left:50%;top:22px;z-index:3;display:inline-flex;align-items:center;gap:5px;padding:4px 8px 4px 7px;border:1.5px solid var(--green);border-radius:5px;background:rgba(15,12,38,.58);color:var(--green);font-size:9.5px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;line-height:1;white-space:nowrap;opacity:0;transform:translateX(-50%) rotate(-8deg) scale(1.6);pointer-events:none;box-shadow:inset 0 0 0 1px rgba(15,12,38,.9),inset 0 0 0 2px rgba(0,235,94,.35),0 6px 18px rgba(0,0,0,.35)}
.stamp svg{width:11px;height:11px}
.panel.is-done .stamp{animation:stampIn .35s cubic-bezier(.2,.9,.3,1.25) forwards}
@keyframes stampIn{0%{opacity:0;transform:translateX(-50%) rotate(-8deg) scale(1.6)}55%{opacity:1;transform:translateX(-50%) rotate(-8deg) scale(.94)}100%{opacity:1;transform:translateX(-50%) rotate(-8deg) scale(1)}}
.scene .grain{position:absolute;inset:0;z-index:3;opacity:.09}
/* final parlaması */
.flash{position:absolute;inset:0;z-index:4;background:#fff;mix-blend-mode:overlay;opacity:0;pointer-events:none}
.scene.is-flash .flash{animation:flash .9s ease-out forwards}
@keyframes flash{0%{opacity:.6}100%{opacity:0}}
/* ışık çizgisi (kenar) */
.edge{position:absolute;left:0;top:0;width:2px;height:250px;z-index:5;pointer-events:none;will-change:transform;transition:opacity .6s}
.edge .ln{position:absolute;left:0;top:0;width:2px;height:250px;background:linear-gradient(180deg,#fff 0%,#DFFFEB 30%,var(--green) 62%,rgba(0,235,94,.55) 100%);box-shadow:0 0 10px rgba(0,235,94,.95),0 0 28px rgba(0,235,94,.5),0 0 60px rgba(0,235,94,.25);transform:scaleY(0);transform-origin:50% 0;transition:transform .55s var(--ease)}
.edge.is-on .ln{transform:scaleY(1)}
.edge .bloom{position:absolute;right:2px;top:0;width:64px;height:250px;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(220,255,235,.16));opacity:0;transition:opacity .5s .3s}
.edge.is-on .bloom{opacity:1}
.ad.is-final .edge{opacity:0}
/* kart: taşıyıcı (JS: konum) › düşüş (CSS animasyonu) › kart (JS: eğim) */
.cardw{position:absolute;left:0;top:57px;width:0;height:0;z-index:6;will-change:transform}
.cardd{position:absolute;left:0;top:0;width:0;height:0;opacity:0}
.cardd.is-set{opacity:1}
.ad.is-live .cardd.is-drop{animation:drop .85s cubic-bezier(.34,1.42,.64,1) forwards}
@keyframes drop{0%{opacity:0;transform:translateY(-190px)}28%{opacity:1}100%{opacity:1;transform:none}}
.card{left:0;top:0;font-size:7.6px;cursor:grab}
.scene.is-drag .card{cursor:grabbing}
.card .face{box-shadow:inset 0 1px 0 rgba(255,255,255,.28),inset 0 -1px 0 rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.06)}
.burst{left:0;top:38px}
.hint{left:265px;top:160px}
.again{left:265px;top:160px}
`;

const JS = `
var K=D.copy,T=K.timing,SW=530,CW=144;
var scene=$('.scene'),col=$('.strip.col'),edge=$('.edge'),cardw=$('.cardw'),cardd=$('.cardd'),card=$('.card'),burst=$('.burst'),again=$('.again'),back=$('.back');
var dim=null,panels=[],dpanels=[],x=0,phase='',auto=true,drag=null,vel=0,tilt=0,tw=null,raf=0,last=0,live=false,resumeT=null,hintT=null,inertia=false,lastMove=0;
/* sol zemin + film greni */
(function(){try{var h=photoOf('hero')||photoOf('restoran'),el;if(h){el=document.createElement('img');el.src=h;el.alt='';el.className='ph'}else el=paint(PAL.city,640,250);back.insertBefore(el,back.firstChild);var g=grainUri(),gs=ad.querySelectorAll('.grain');for(var i=0;i<gs.length;i++)gs[i].style.backgroundImage='url('+g+')'}catch(err){}})();
/* panel fotoğrafı: gerçek fotoğraf çalışma zamanında D.photos'tan (dosyada tek kopya); yoksa üretilmiş bokeh */
function ensurePhoto(p,key){if(p.querySelector('img.ph')||p.querySelector('canvas'))return;var ph=photoOf(key),el;if(ph){el=document.createElement('img');el.src=ph;el.alt='';el.className='ph';el.style.objectPosition=photoPosOf(key)}else{try{el=paint(PAL[key]||PAL.city,300,250)}catch(err){return}}p.insertBefore(el,p.firstChild)}
function build(){
  buildCore();
  var byKey={},ps=col.querySelectorAll('.panel');for(var i=0;i<ps.length;i++)byKey[ps[i].getAttribute('data-key')]=ps[i];
  panels=[];
  for(i=0;i<order.length;i++){var o=order[i],p=byKey[o.key];if(!p)continue;o.passed=false;p.classList.remove('is-done');p.querySelector('.cap b').textContent=o.scene.label;p.querySelector('.cap small').textContent=o.tag;p.style.transitionDelay='0s,'+(i*80)+'ms,'+(i*80)+'ms';ensurePhoto(p,o.key);col.appendChild(p);panels.push(p)}
  if(dim&&dim.parentNode)dim.parentNode.removeChild(dim);
  dim=col.cloneNode(true);dim.className='strip dim';dim.style.clipPath='';dim.style.webkitClipPath='';scene.insertBefore(dim,col);
  dpanels=[];var dp=dim.querySelectorAll('.panel');for(i=0;i<dp.length;i++){ensurePhoto(dp[i],order[i].key);dpanels.push(dp[i])}
  col.classList.remove('is-in');
  setTitle(order[0].scene.title);setWord(K.words[order[0].key]);
}
/* geometri: renkli şeridin panel kenarları (genişleme geçişi sırasında da doğru) */
function geo(){var g=[];for(var i=0;i<panels.length;i++)g.push({l:panels[i].offsetLeft,w:panels[i].offsetWidth});return g}
function rightAfter(i){var tot=0,acc=0;for(var k=0;k<order.length;k++){var w=(k<=i||order[k].passed)?1.25:1;tot+=w;if(k<=i)acc+=w}return SW*acc/tot}
function nextBoundary(){var g=geo();for(var i=0;i<order.length;i++){if(g[i].l+g[i].w>x+2)return rightAfter(i)}return SW}
function easeIO(u){return u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2}
function tween(to,dur){tw={from:x,to:clamp(to,0,SW),t0:performance.now(),dur:Math.max(120,dur)};tick()}
function pass(i,c){var o=order[i];o.passed=true;o.visited=true;panels[i].classList.add('is-done');dpanels[i].classList.add('is-done');burst.style.left=c.toFixed(0)+'px';sparks(burst);setTitle(o.scene.title);setWord(K.words[o.key]);emit('state')}
function unpass(i){var o=order[i];o.passed=false;panels[i].classList.remove('is-done');dpanels[i].classList.remove('is-done');var j=i>0?i-1:0;setTitle(order[j].scene.title);setWord(K.words[order[j].key]);emit('state')}
function check(){var g=geo();for(var i=0;i<order.length;i++){var c=g[i].l+g[i].w/2,o=order[i];if(!o.passed&&x>=c)pass(i,c);else if(o.passed&&x<c-36)unpass(i)}}
function draw(now){
  var r=(SW-x).toFixed(1)+'px';col.style.clipPath='inset(0 '+r+' 0 0)';col.style.webkitClipPath='inset(0 '+r+' 0 0)';
  edge.style.transform='translate3d('+x.toFixed(1)+'px,0,0)';
  var cx=clamp(x-6,10,SW-CW-10),fl=phase==='final'||phase==='wipe'?Math.sin(now/1100)*2.4:0;
  cardw.style.transform='translate3d('+cx.toFixed(1)+'px,'+fl.toFixed(2)+'px,0)';
  card.style.transform='perspective(700px) rotateY('+(-20+tilt).toFixed(2)+'deg) rotateX(7deg) rotateZ('+(-5+tilt*.18).toFixed(2)+'deg)';
}
function frame(now){
  raf=0;var dt=last?Math.min(48,now-last):16;last=now;var px=x;
  if(phase==='wipe'){
    if(tw){var u=clamp((now-tw.t0)/tw.dur,0,1);x=tw.from+(tw.to-tw.from)*easeIO(u);if(u>=1){tw=null;if(!auto&&!drag)armResume()}}
    else if(drag){}
    else if(inertia){x+=vel*dt/16;vel*=Math.pow(.88,dt/16);if(Math.abs(vel)<.05||x<=0||x>=SW){inertia=false;vel=0;if(!auto)armResume()}}
    else if(auto){var tg=nextBoundary();tw={from:x,to:tg,t0:now,dur:Math.max(300,(tg-x)/SW*T.glide)}}
    x=clamp(x,0,SW);check();
    if(x>=SW-.5&&!drag&&!tw){finish()}
  }
  var v=x-px;tilt+=((phase==='wipe'?clamp(v*2.6,-24,24):0)-tilt)*.14;
  draw(now);
  if(live&&(phase==='wipe'||tw||drag||Math.abs(tilt)>.05||(phase==='final'&&!ended)))raf=requestAnimationFrame(frame);
}
function tick(){if(!raf){last=0;raf=requestAnimationFrame(frame)}}
function finish(){
  if(phase==='final')return;phase='final';x=SW;tw=null;inertia=false;auto=false;drag=null;scene.classList.remove('is-drag');hideHint(scene);cancelResume();
  for(var i=0;i<order.length;i++){order[i].visited=true;if(!order[i].passed){order[i].passed=true;panels[i].classList.add('is-done');dpanels[i].classList.add('is-done')}}
  setTitle(K.final.title);setWord(K.final.word);markFinal();if(!reduced){scene.classList.remove('is-flash');void scene.offsetWidth;scene.classList.add('is-flash')}
  draw(performance.now());emit('state');
  later(function(){markEnded();emit('state');tick()},T.hold);
}
function cancelResume(){if(resumeT){clearTimeout(resumeT);resumeT=null}if(hintT){clearTimeout(hintT);hintT=null}}
function armResume(){if(resumeT)clearTimeout(resumeT);resumeT=setTimeout(function(){resumeT=null;if(phase==='wipe'&&!drag){auto=true;tick()}},T.resume)}
function armHint(){if(hintT)clearTimeout(hintT);hintT=setTimeout(function(){hintT=null;if(phase==='wipe'&&!userPlayed){showHint(scene);emit('state')}},400)}
function reset(){
  clearTimers();cancelResume();x=0;tw=null;phase='';auto=true;inertia=false;vel=0;tilt=0;drag=null;
  scene.classList.remove('is-drag','is-flash');hideHint(scene);cardd.classList.remove('is-drop','is-set');edge.classList.remove('is-on');col.classList.remove('is-in');if(dim)dim.classList.remove('is-in');
  for(var i=0;i<order.length;i++){order[i].visited=false;order[i].passed=false;if(panels[i])panels[i].classList.remove('is-done');if(dpanels[i])dpanels[i].classList.remove('is-done')}
  draw(performance.now());
}
function start(){
  live=true;draw(performance.now());
  if(reduced){ad.classList.add('is-in','is-live');col.classList.add('is-in');dim.classList.add('is-in');cardd.classList.add('is-set');edge.classList.add('is-on');phase='wipe';x=SW;finish();clearTimers();markEnded();emit('state');draw(performance.now());return}
  intro(function(){
    col.classList.add('is-in');dim.classList.add('is-in');
    later(function(){cardd.classList.add('is-drop')},250);
    later(function(){edge.classList.add('is-on')},620);
    later(function(){phase='wipe';tick();if(!userPlayed)armHint()},T.enter);
  });
  emit('state');
}
function restart(){reset();userPlayed=false;build();start()}
function replay(){reset();userPlayed=true;build();start()}
/* etkileşim: sürükle (kenar parmağı izler), dokun (bir sonraki panele geç) */
function scale(){var r=scene.getBoundingClientRect();return (r.width||SW)/SW}
scene.addEventListener('pointerdown',function(e){
  if(within(e.target,'again'))return;e.preventDefault();e.stopPropagation();
  if(phase!=='wipe')return;
  try{scene.setPointerCapture(e.pointerId)}catch(err){}
  drag={id:e.pointerId,sx:e.clientX,lx:e.clientX,lt:performance.now(),x0:x,moved:false};lastMove=performance.now();
  tw=null;inertia=false;vel=0;auto=false;userPlayed=true;hideHint(scene);cancelResume();scene.classList.add('is-drag');emit('state');tick();
});
scene.addEventListener('pointermove',function(e){
  if(!drag||e.pointerId!==drag.id)return;var s=scale(),dx=(e.clientX-drag.sx)/s;
  if(!drag.moved&&Math.abs(dx)>4)drag.moved=true;if(!drag.moved)return;
  var now=performance.now(),dtm=Math.max(1,now-drag.lt);vel=((e.clientX-drag.lx)/s)/dtm*16;drag.lx=e.clientX;drag.lt=now;lastMove=now;
  x=clamp(drag.x0+dx,0,SW);tick();
});
function endDrag(e){
  if(!drag||(e&&e.pointerId!==drag.id))return;try{scene.releasePointerCapture(drag.id)}catch(err){}
  var moved=drag.moved;drag=null;scene.classList.remove('is-drag');
  if(moved){if(performance.now()-lastMove>90)vel=0;vel=clamp(vel,-28,28);inertia=Math.abs(vel)>.8;if(!inertia){vel=0;armResume()}}
  else{var tg=nextBoundary();if(tg<=x+2)tg=SW;tween(tg,520+Math.abs(tg-x)*1.4)}
  tick();emit('state');
}
scene.addEventListener('pointerup',endDrag);scene.addEventListener('pointercancel',endDrag);
scene.addEventListener('click',function(e){e.stopPropagation()});
again.addEventListener('click',function(e){e.stopPropagation();replay()});
engine.key=function(e){
  if(phase!=='wipe')return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();userPlayed=true;hideHint(scene);cancelResume();auto=false;inertia=false;var base=tw?tw.to:x,d=SW*.12*(e.key==='ArrowRight'?1:-1);tween(base+d,380)}
};
engine.restart=restart;
engine.snapshot=function(){var n=0;for(var i=0;i<order.length;i++)if(order[i].passed)n++;return {phase:phase,x:Math.round(x),t:Math.round(x/SW*1000)/1000,passed:n,auto:auto}};
S=readSignals();build();start();
`;

function render(data, assets) {
  const panels = KEYS.map((k) => `<div class="panel" data-key="${k}"><span class="cap"><b></b><small></small></span><span class="stamp">${SVG.check}${esc(COPY.stamp)}</span></div>`).join('');
  const body = `
  <div class="back"><div class="grain"></div></div>
  <div class="scene" aria-label="Kartı sürükleyin: geçtiği yer renklensin">
    <div class="strip col">${panels}</div>
    <div class="grain"></div>
    <div class="flash"></div>
    <div class="edge"><i class="bloom"></i><i class="ln"></i></div>
    <div class="cardw"><div class="cardd">${cardMarkup(assets)}</div></div>
    <div class="burst"></div>
    <div class="hint">${SVG.drag} ${esc(COPY.hint)} <small>· ${esc(COPY.hintSub)}</small></div>
    <button class="again" type="button">${SVG.again}${esc(COPY.replay)}</button>
  </div>
  ${leftMarkup(data, assets, COPY.line2)}`;
  return page({ data, assets, concept: 'silme', title: 'Silme', css: CSS, js: JS, body, runtime: { copy: COPY } });
}

module.exports = {
  id: 'silme', title: 'Silme', tagline: 'Kartı geçir: geçtiği yer renklensin',
  howto: 'Kartı (ya da şeridi) sağa sürükleyin; geçtiği panel renklenir ve "GEÇİYOR ✓" damgası basılır. Dokunma bir sonraki panele geçirir; ok tuşları kenarı %12 kaydırır.',
  render, timing: COPY.timing,
};
