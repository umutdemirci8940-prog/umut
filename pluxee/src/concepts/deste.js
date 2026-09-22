'use strict';
/**
 * KONSEPT – Deste: açık zeminli, editoryal fotoğraf destesi. Dört gerçek fotoğraf baskısı
 * (restoran, kafe, market, online) bir deste hâlinde durur; en üstteki baskı kaydırılınca
 * (ya da dokununca) Pluxee kartı baskıya "dokunur", "GEÇİYOR ✓" damgası basılır ve baskı
 * uçarak bir sonrakini açar. Dokunulmazsa deste kendini oynatır. Finalde dört damgalı
 * baskı yelpaze gibi açılır, kart ortaya gelir: "Her yerde, Pluxee geçiyor."
 * Zemin kağıt beyazı; lacivert tipografi, yeşil vurgu. Vektör illüstrasyon yok.
 */
const { SVG, esc, cardMarkup, leftMarkup, page } = require('../common');

const COPY = {
  words: { restoran: 'Restoranda,', kafe: 'Kafede,', market: 'Markette,', online: 'Online siparişte,' },
  line2: 'Pluxee geçiyor.',
  final: { title: 'Burada, şurada, orada', word: 'Her yerde,' },
  stamp: 'GEÇİYOR',
  hint: 'Baskıyı kaydırın',
  hintSub: 'dokunun: damgalayın',
  replay: 'Yeniden karıştır',
  timing: {
    enter: 900,     // giriş sonrası: deste dizilir
    show: 2400,     // dokunulmazsa bir baskının üstte kalma süresi (sonra damga)
    stampToFly: 650,// damga → baskının uçuşu
    fly: 600,       // uçuş süresi
    hold: 3000,     // final karesi
    hint: 900,      // ipucu gecikmesi
  },
};

const FAN = [[-135, -30, -14], [-45, -38, -5], [45, -38, 5], [135, -30, 14]]; // final yelpazesi: x, y, açı (ölçek .66, pivot alt orta)

const CSS = `
html,body{background:#F4F1EB}
.ad{background:#F4F1EB;color:var(--navy)}
.paper{position:absolute;inset:0;background:radial-gradient(120% 170% at 80% 30%,#FFFFFF 0%,#F4F1EB 46%,#E7E2D7 100%)}
.rule{position:absolute;left:452px;top:0;width:1px;height:250px;background:linear-gradient(180deg,rgba(34,28,70,0),rgba(34,28,70,.12) 30%,rgba(34,28,70,.12) 70%,rgba(34,28,70,0))}
.grain{opacity:.07;mix-blend-mode:multiply}
.glow{position:absolute;left:560px;top:10px;width:330px;height:230px;border-radius:50%;background:radial-gradient(closest-side,rgba(0,235,94,.26),rgba(0,235,94,0));filter:blur(10px);opacity:0;transition:opacity 1.2s}
.ad.is-live .glow{opacity:1}
.beam{background:linear-gradient(90deg,rgba(0,235,94,0),rgba(0,235,94,.35) 35%,rgba(34,28,70,.12) 50%,rgba(0,235,94,.35) 65%,rgba(0,235,94,0))}
/* sol sütun: açık zemin */
.logo b{color:var(--navy)}
.logo img.is-white{filter:none}
.eyebrow{color:#00A64A}
.hl,.hl .l1{color:var(--navy)}
.hl .l1 span{padding:0 5px 0 3px;margin-left:-3px;background:linear-gradient(transparent 60%,rgba(0,235,94,.5) 60%,rgba(0,235,94,.5) 93%,transparent 93%)}
.sub{color:rgba(34,28,70,.7)}
.cta{box-shadow:0 10px 24px rgba(0,235,94,.28)}
.again{background:rgba(34,28,70,.07);box-shadow:inset 0 0 0 1px rgba(34,28,70,.22);color:var(--navy)}
.again:hover{background:rgba(34,28,70,.13)}
/* sahne */
.scene{position:absolute;left:452px;top:0;width:518px;height:250px;z-index:4;touch-action:none;cursor:grab;overflow:hidden}
.scene.is-drag{cursor:grabbing}
.scene.is-final{cursor:default}
.deck{position:absolute;inset:0}
/* fotoğraf baskısı */
.pc{position:absolute;left:141px;top:22px;width:236px;height:196px;padding:7px;border-radius:5px;background:#fff;box-shadow:0 22px 44px -14px rgba(34,28,70,.42),0 2px 6px rgba(34,28,70,.12),inset 0 0 0 1px rgba(34,28,70,.05);opacity:0;will-change:transform,opacity;transform-origin:50% 60%;transition:transform .6s var(--ease),opacity .45s}
.pc.is-drag{transition:none}
.pc.is-out{transition:transform .6s cubic-bezier(.3,.7,.4,1),opacity .45s .15s;opacity:0}
.pc.is-fan{transition:transform .8s var(--ease),opacity .5s;opacity:1;transform-origin:50% 100%}
.pc .win{position:relative;width:222px;height:160px;overflow:hidden;border-radius:2px;background:#E7E2D7}
.pc .win img.ph,.pc .win canvas{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;display:block}
.pc .win:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,0) 60%,rgba(0,0,0,.22) 100%)}
.pc .cap{position:absolute;left:9px;right:9px;bottom:6px;height:18px;display:flex;align-items:center;gap:6px;white-space:nowrap}
.pc .cap b{font-size:8.5px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--navy);line-height:1}
.pc .cap small{font-size:8px;font-weight:700;letter-spacing:.06em;color:#00A64A;line-height:1}
.pc .cap em{margin-left:auto;font-style:normal;font-size:8px;font-weight:800;letter-spacing:.14em;color:rgba(34,28,70,.42);line-height:1}
/* damga: kauçuk (2 → 1, -12°) */
.pc .stamp{position:absolute;left:118px;top:87px;display:inline-flex;align-items:center;gap:7px;padding:6px 11px 6px 13px;border:2.5px solid var(--green);border-radius:7px;color:var(--green);font-size:17px;font-weight:800;letter-spacing:.17em;line-height:1;text-transform:uppercase;white-space:nowrap;background:rgba(15,12,38,.42);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);opacity:0;transform:translate(-50%,-50%) rotate(-12deg) scale(2);pointer-events:none;filter:drop-shadow(0 6px 12px rgba(0,0,0,.35))}
.pc .stamp:before{content:"";position:absolute;inset:3px;border:1px solid rgba(0,235,94,.7);border-radius:4px}
.pc .stamp svg{width:15px;height:15px}
.pc.is-stamp .stamp{animation:slam .38s cubic-bezier(.2,.9,.3,1) forwards}
@keyframes slam{0%{opacity:0;transform:translate(-50%,-50%) rotate(-12deg) scale(2)}55%{opacity:1}100%{opacity:1;transform:translate(-50%,-50%) rotate(-12deg) scale(1)}}
/* ilerleme */
.dots{position:absolute;left:112px;top:30px;display:flex;flex-direction:column;gap:6px;opacity:0;transition:opacity .5s .3s}
.ad.is-live .dots{opacity:1}
.dot{width:3px;height:16px;border-radius:2px;background:rgba(34,28,70,.16);transition:background .3s,transform .3s}
.dot.is-cur{background:var(--navy)}
.dot.is-on{background:var(--green)}
.scene.is-final .dots{opacity:0;transition-delay:0s}
/* Pluxee kartı: damga vurucu */
.card{left:392px;top:152px;font-size:6.4px;z-index:20;pointer-events:none;opacity:0;transform:translateY(12px) rotate(-8deg);transition:opacity .6s .5s,transform .8s .5s var(--ease),left .8s var(--ease),top .8s var(--ease),font-size .8s var(--ease)}
.ad.is-live .card{opacity:1;transform:rotate(-8deg)}
.ad.is-live .card.is-tap{animation:tap .5s var(--ease)}
@keyframes tap{0%{transform:rotate(-8deg)}38%{transform:translate(-30px,-16px) rotate(-15deg)}100%{transform:rotate(-8deg)}}
.scene.is-final .card{left:196px;top:156px;font-size:7px;transform:rotate(-5deg);transition:left .8s .25s var(--ease),top .8s .25s var(--ease),font-size .8s .25s var(--ease),transform .8s .25s var(--ease)}
.ad.is-ended .gloss{animation:none}
.burst{left:259px;top:110px}
.hint{left:259px;top:222px}
.hint svg{width:22px;height:10px}
.again{left:259px;top:12px;z-index:30}
`;

const JS = `
var K=D.copy,T=K.timing,FAN=D.fan;
var scene=$('.scene'),deck=$('.deck'),dots=$('.dots'),card=$('.card'),again=$('.again'),burst=$('.burst');
var cards=[],dotEls=[],idx=0,phase='',busy=false,drag=null,live=false;
(function(){try{var g=grainUri(),gs=ad.querySelectorAll('.grain');for(var i=0;i<gs.length;i++)gs[i].style.backgroundImage='url('+g+')'}catch(err){}})();
function stackT(d){return d===0?'none':'translate('+(d*7)+'px,'+(-d*4)+'px) rotate('+((d%2?-1:1)*(2.2+d*1.1)).toFixed(1)+'deg) scale('+(1-d*.035).toFixed(3)+')'}
function fanT(i){var f=FAN[i]||FAN[FAN.length-1];return 'translate('+f[0]+'px,'+f[1]+'px) rotate('+f[2]+'deg) scale(.66)'}
function build(){
  buildCore();
  deck.innerHTML='';dots.innerHTML='';cards=[];dotEls=[];
  for(var i=0;i<order.length;i++){
    var o=order[i],el=document.createElement('div');el.className='pc';el.setAttribute('data-key',o.key);o.passed=false;
    var win=document.createElement('div');win.className='win';var ph=photoOf(o.key),im;
    if(ph){im=document.createElement('img');im.src=ph;im.alt='';im.className='ph';im.style.objectPosition=photoPosOf(o.key)}else{try{im=paint(PAL[o.key]||PAL.city,222,160)}catch(err){im=null}}
    if(im)win.appendChild(im);el.appendChild(win);
    var cap=document.createElement('span');cap.className='cap';cap.innerHTML='<b>'+esc(o.scene.label)+'</b><small>· '+esc(o.tag)+'</small><em>'+pad(i+1)+'</em>';el.appendChild(cap);
    var st=document.createElement('span');st.className='stamp';st.innerHTML=esc(K.stamp)+__CHECK__;el.appendChild(st);
    el.style.zIndex=String(10-i);el.style.transform=stackT(i)+' translateY(40px)';
    deck.appendChild(el);cards.push(el);
    var d=document.createElement('i');d.className='dot';dots.appendChild(d);dotEls.push(d);
  }
  idx=0;busy=false;phase='';drag=null;scene.classList.remove('is-final','is-drag');
  setCopy(0);drawDots();
}
function setCopy(i){var o=order[i];setTitle(o.scene.title);setWord(K.words[o.key]||o.scene.word)}
function drawDots(){for(var i=0;i<dotEls.length;i++){dotEls[i].classList.toggle('is-on',!!order[i].passed);dotEls[i].classList.toggle('is-cur',i===idx&&phase==='play')}}
function layout(){for(var k=idx;k<cards.length;k++){var d=k-idx,el=cards[k];el.style.zIndex=String(10-d);el.style.transform=stackT(d);el.style.opacity=d>3?'0':'1'}}
function armAuto(){later(function(){if(phase==='play'&&!drag)dismiss(1,false)},T.show)}
function armHint(){later(function(){if(phase==='play'&&!userPlayed){showHint(scene);emit('state')}},T.hint)}
function tap(){card.classList.remove('is-tap');void card.offsetWidth;card.classList.add('is-tap')}
function dismiss(dir,byUser,dy){
  if(phase!=='play'||busy||idx>=order.length)return;busy=true;clearTimers();
  var i=idx,o=order[i],el=cards[i];o.passed=true;o.visited=true;
  if(byUser){userPlayed=true;hideHint(scene)}
  el.classList.remove('is-drag');el.classList.add('is-stamp');tap();
  var r=el.getBoundingClientRect(),s=scene.getBoundingClientRect(),sc=(s.width||518)/518;burst.style.left=((r.left+r.width/2-s.left)/sc).toFixed(0)+'px';burst.style.top=((r.top+r.height*.44-s.top)/sc).toFixed(0)+'px';sparks(burst);
  drawDots();emit('state');
  later(function(){
    el.classList.add('is-out');el.style.transform='translate('+(dir*780)+'px,'+((dy||0)+18)+'px) rotate('+(dir*24)+'deg)';
    idx=i+1;busy=false;
    if(idx>=order.length){later(finish,T.fly*.7);return}
    layout();setCopy(idx);drawDots();emit('state');armAuto();
  },byUser?170:T.stampToFly);
}
function finish(){
  if(phase==='final')return;phase='final';busy=false;drag=null;clearTimers();hideHint(scene);scene.classList.remove('is-drag');
  for(var i=0;i<order.length;i++){order[i].visited=true;order[i].passed=true;var el=cards[i];el.classList.remove('is-out','is-drag');el.classList.add('is-fan','is-stamp');el.style.zIndex=String(10+i);el.style.opacity='1';el.style.transitionDelay=(i*70)+'ms';el.style.transform=fanT(i)}
  scene.classList.add('is-final');setTitle(K.final.title);setWord(K.final.word);drawDots();markFinal();emit('state');
  later(function(){markEnded();emit('state')},T.hold);
}
function reset(){clearTimers();phase='';busy=false;drag=null;idx=0;scene.classList.remove('is-final','is-drag');hideHint(scene);card.classList.remove('is-tap')}
function start(){
  live=true;
  if(reduced){ad.classList.add('is-in','is-live');phase='play';finish();clearTimers();markEnded();emit('state');return}
  intro(function(){
    for(var i=cards.length-1;i>=0;i--)(function(k,delay){later(function(){var el=cards[k];el.style.opacity='1';el.style.transform=stackT(k)},delay)})(i,(cards.length-1-i)*110);
    later(function(){phase='play';drawDots();emit('state');armAuto();if(!userPlayed)armHint()},T.enter);
  });
  emit('state');
}
function restart(){reset();userPlayed=false;build();start()}
function replay(){reset();userPlayed=true;build();start()}
/* etkileşim: en üstteki baskıyı kaydır (sağa/sola) ya da dokun */
function scale(){var r=scene.getBoundingClientRect();return (r.width||518)/518}
scene.addEventListener('pointerdown',function(e){
  if(within(e.target,'again'))return;e.preventDefault();e.stopPropagation();
  if(phase!=='play'||busy)return;
  try{scene.setPointerCapture(e.pointerId)}catch(err){}
  drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,dx:0,dy:0,moved:false};
  userPlayed=true;hideHint(scene);clearTimers();scene.classList.add('is-drag');cards[idx].classList.add('is-drag');emit('state');
});
scene.addEventListener('pointermove',function(e){
  if(!drag||e.pointerId!==drag.id)return;var s=scale();drag.dx=(e.clientX-drag.sx)/s;drag.dy=(e.clientY-drag.sy)/s;
  if(!drag.moved&&(Math.abs(drag.dx)>5||Math.abs(drag.dy)>5))drag.moved=true;if(!drag.moved)return;
  cards[idx].style.transform='translate('+drag.dx.toFixed(1)+'px,'+(drag.dy*.35).toFixed(1)+'px) rotate('+(drag.dx*.06).toFixed(2)+'deg)';
});
function endDrag(e){
  if(!drag||(e&&e.pointerId!==drag.id))return;try{scene.releasePointerCapture(drag.id)}catch(err){}
  var d=drag;drag=null;scene.classList.remove('is-drag');var el=cards[idx];
  if(phase!=='play'){if(el)el.classList.remove('is-drag');return}
  if(!d.moved){dismiss(1,true,0);return}
  if(Math.abs(d.dx)>80){dismiss(d.dx>0?1:-1,true,d.dy*.35);return}
  el.classList.remove('is-drag');el.style.transform=stackT(0);armAuto();emit('state');
}
scene.addEventListener('pointerup',endDrag);scene.addEventListener('pointercancel',endDrag);
scene.addEventListener('click',function(e){e.stopPropagation()});
again.addEventListener('click',function(e){e.stopPropagation();replay()});
engine.key=function(e){if(phase!=='play')return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();dismiss(e.key==='ArrowRight'?1:-1,true,0)}};
engine.restart=restart;
engine.snapshot=function(){var n=0;for(var i=0;i<order.length;i++)if(order[i].passed)n++;return {phase:phase,idx:idx,passed:n,busy:busy,dragging:!!drag}};
S=readSignals();build();start();
`;

function render(data, assets) {
  const js = JS.replace(/__CHECK__/g, () => JSON.stringify(SVG.check));
  const body = `
  <div class="paper"></div>
  <div class="grain"></div>
  <div class="glow"></div>
  <div class="scene" aria-label="Fotoğraf destesi: baskıyı kaydırın ya da dokunun, damgalansın">
    <div class="deck"></div>
    <div class="dots" aria-hidden="true"></div>
    ${cardMarkup(assets)}
    <div class="burst"></div>
    <div class="hint">${SVG.drag} ${esc(COPY.hint)} <small>· ${esc(COPY.hintSub)}</small></div>
    <button class="again" type="button">${SVG.again}${esc(COPY.replay)}</button>
  </div>
  ${leftMarkup(data, assets, COPY.line2)}`;
  return page({ data, assets, concept: 'deste', title: 'Deste', css: CSS, js, body, runtime: { copy: COPY, fan: FAN } });
}

module.exports = {
  id: 'deste', title: 'Deste', tagline: 'Açık zemin: fotoğraf baskılarını kaydır, damgalansın',
  howto: 'En üstteki fotoğraf baskısını sağa ya da sola kaydırın (ya da dokunun): Pluxee kartı baskıya dokunur, "GEÇİYOR ✓" damgası basılır, sıradaki baskı açılır. Dördü de damgalanınca deste yelpaze gibi açılır. Klavye: ← →.',
  render, timing: COPY.timing,
};
