'use strict';
/**
 * KONSEPT 3 – Fiş: POS fişi satır satır yazdırılır ("RESTORAN … GEÇTİ ✓").
 * Kullanıcı POS'a/karta dokunarak bir sonraki satırı yazdırır, bitince fişi çekip koparır.
 * Yazdırılan satırın üstüne gelince o yerin atmosferi görünür. Dokunulmazsa fiş kendiliğinden yazılır.
 */
const { SVG, esc, cardMarkup, leftMarkup, page } = require('../common');

const CSS = `
.scene{position:absolute;left:440px;top:0;width:530px;height:250px;z-index:4;touch-action:none}
.surface{position:absolute;left:120px;top:196px;width:380px;height:44px;border-radius:50%;background:radial-gradient(50% 50% at 50% 50%,rgba(0,0,0,.6),rgba(0,0,0,0) 70%);filter:blur(6px);opacity:0;transition:opacity .8s;pointer-events:none}
.ad.is-live .surface{opacity:1}
/* POS */
.pos{position:absolute;left:346px;top:150px;width:124px;height:160px;transform:translateY(70px);opacity:0;transition:transform .9s .1s var(--ease),opacity .6s .1s;cursor:pointer;z-index:4}
.ad.is-live .pos{transform:none;opacity:1}
.pos.is-ok{animation:bump .45s var(--ease)}
@keyframes bump{0%{transform:none}35%{transform:translateY(3px) scale(.985)}100%{transform:none}}
.pos-body{position:absolute;inset:0;border-radius:20px 20px 12px 12px;background:linear-gradient(180deg,#30323F 0%,#1E1F28 38%,#121319 100%);box-shadow:0 34px 50px -10px rgba(0,0,0,.75),0 6px 14px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.16),inset 0 -2px 0 rgba(0,0,0,.7)}
.pos .slot{position:absolute;left:14px;right:14px;top:9px;height:5px;border-radius:3px;background:#050508;box-shadow:inset 0 1px 2px rgba(0,0,0,.9),0 1px 0 rgba(255,255,255,.08)}
.pos .nfcz{position:absolute;left:0;right:0;top:18px;height:12px;display:flex;justify-content:center;color:rgba(255,255,255,.45)}
.pos .nfcz svg{width:12px;height:12px}
.pos .led{position:absolute;right:16px;top:19px;width:5px;height:5px;border-radius:50%;background:#5a5f6e;box-shadow:0 0 0 1px rgba(0,0,0,.5);transition:background .25s,box-shadow .25s}
.pos.is-ok .led{background:var(--green);box-shadow:0 0 8px var(--green)}
.screen{position:absolute;left:13px;top:34px;width:98px;height:54px;border-radius:8px;overflow:hidden;background:radial-gradient(130% 110% at 50% -10%,#24365F,#101A33 65%);box-shadow:inset 0 0 0 2px #07080D,inset 0 0 16px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.05);transition:background .35s,box-shadow .35s}
.screen:before{content:"";position:absolute;inset:0;background:linear-gradient(160deg,rgba(255,255,255,.14),transparent 45%);pointer-events:none}
.screen span{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;font-size:8.5px;font-weight:700;letter-spacing:.06em;color:rgba(255,255,255,.72);transition:opacity .25s}
.screen .ok{color:var(--navy);font-weight:800;font-size:9px;opacity:0;display:flex;align-items:center;justify-content:center;gap:4px}
.screen .ok svg{width:11px;height:11px}
.pos.is-ok .screen{background:radial-gradient(130% 110% at 50% -10%,#3BFF8A,#00B54B 70%);box-shadow:inset 0 0 0 2px #07080D,inset 0 0 16px rgba(0,0,0,.25),0 0 28px rgba(0,235,94,.45)}
.pos.is-ok .screen .idle{opacity:0}.pos.is-ok .screen .ok{opacity:1}
.keys{position:absolute;left:14px;top:98px;width:96px;display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.keys i{height:10px;border-radius:3px;background:linear-gradient(180deg,#3B3D4B,#24252E);box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 1px 0 rgba(0,0,0,.65)}
.keys i:nth-child(10){background:linear-gradient(180deg,#B33A3A,#7A2323)}.keys i:nth-child(12){background:linear-gradient(180deg,#22C76A,#128A46)}
.ring{position:absolute;left:408px;top:172px;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;border:2px solid var(--green);opacity:0;pointer-events:none;z-index:6}
.scene.is-beep .ring{animation:ring .7s ease-out both}
.scene.is-beep .ring.r2{animation-delay:.16s}
@keyframes ring{0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(4)}}
/* fiş */
.paper{position:absolute;left:334px;bottom:92px;width:148px;height:0;overflow:hidden;z-index:3;transition:height .28s linear;cursor:grab;touch-action:none}
.paper.is-drag{cursor:grabbing}
.sheet{position:absolute;left:0;right:0;bottom:0;padding:10px 10px 8px;background:linear-gradient(180deg,#FBF9F3,#F1EDE3);color:#2A2A33;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:8.3px;line-height:13px;box-shadow:0 -6px 18px rgba(0,0,0,.35),inset 0 0 40px rgba(0,0,0,.05);clip-path:polygon(0 4px,4% 0,8% 4px,12% 0,16% 4px,20% 0,24% 4px,28% 0,32% 4px,36% 0,40% 4px,44% 0,48% 4px,52% 0,56% 4px,60% 0,64% 4px,68% 0,72% 4px,76% 0,80% 4px,84% 0,88% 4px,92% 0,96% 4px,100% 0,100% 100%,0 100%)}
.sheet:after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(180deg,rgba(0,0,0,0) 0 3px,rgba(0,0,0,.018) 3px 4px);pointer-events:none}
.ln{position:relative;display:flex;justify-content:space-between;gap:6px;white-space:nowrap;visibility:hidden;clip-path:inset(0 100% 0 0)}
.ln.is-on{visibility:visible;animation:print .26s linear forwards}
@keyframes print{to{clip-path:inset(0 0 0 0)}}
.ln.hdr{justify-content:center;font-weight:800;font-size:11px;letter-spacing:.14em;color:#1B1636;padding-top:2px}
.ln.subh{justify-content:center;font-size:7.5px;letter-spacing:.2em;color:#6B6B78}
.ln.dash{height:9px;line-height:9px;color:#9a9aa8;justify-content:center;letter-spacing:.1em;font-size:7px}
.ln.item{cursor:pointer}
.ln.item b{font-weight:700}
.ln.item .dots{flex:1;overflow:hidden;color:#b5b5c0}
.ln.item .ok{font-weight:800;color:#0B7A3E;display:inline-flex;align-items:center;gap:3px}
.ln.item .ok svg{width:9px;height:9px}
.ln.item.is-hot{background:rgba(0,235,94,.14);margin:0 -6px;padding:0 6px;border-radius:3px}
.ln.total{font-weight:800;color:#1B1636;font-size:9px}
.ln.total .ok{color:#0B7A3E;display:inline-flex;align-items:center;gap:3px}
.ln.total .ok svg{width:10px;height:10px}
.paper.is-torn{transition:transform .75s cubic-bezier(.3,.7,.3,1),opacity .6s .15s;transform:translate(-26px,-42px) rotate(-9deg);opacity:0;pointer-events:none}
.stub{position:absolute;left:334px;bottom:92px;width:148px;height:0;overflow:hidden;z-index:3;transition:height .25s}
.stub .sheet{padding:0;height:7px}
.paper.is-torn~.stub{height:7px}
.paper.is-ready:not(.is-torn){animation:sway 2.4s ease-in-out infinite}
@keyframes sway{0%,100%{transform:rotate(0)}50%{transform:rotate(-1.2deg)}}
/* kart */
.card{left:150px;top:118px;font-size:8.8px;opacity:0;transform:translate3d(-260px,10px,0) perspective(900px) rotateY(-40deg) rotateZ(-18deg);transition:transform 1s .25s var(--ease),opacity .5s .3s;z-index:5;cursor:pointer}
.ad.is-live .card{opacity:1;transform:translate3d(0,0,0) perspective(900px) rotateY(-30deg) rotateX(6deg) rotateZ(-12deg)}
.ad.is-live .card.is-tap{transition:transform .32s var(--ease);transform:translate3d(16px,-8px,0) perspective(900px) rotateY(-34deg) rotateX(4deg) rotateZ(-14deg)}
.card:hover .face{filter:brightness(1.1)}
.burst{left:408px;top:150px}
.hint{left:265px;top:14px}
.again{left:265px;top:12px}
`;

const JS = `
var K=D.receipt,T=K.timing;
var scene=$('.scene'),pos=$('.pos'),paper=$('.paper'),sheet=$('.sheet'),card=$('.card'),burst=$('.burst'),again=$('.again');
var layers=initLayers(bg,['restoran','kafe','market','online','final','rain']);
var lines=[],printed=0,phase='',autoT=null,tearT=null,hintT=null,drag=null,hot=null,current=-1;
var LH=13;
function build(){
  buildCore();
  sheet.innerHTML='';lines=[];
  var add=function(cls,html,h,key,i){lines.push({cls:cls,html:html,h:h||LH,key:key,i:i})};
  add('hdr',esc(K.header),15);add('subh',esc(K.subheader)+' · '+pad(S.hour)+':'+pad(S.minute),LH);add('dash','- - - - - - - - - - - - - -',9);
  for(var i=0;i<order.length;i++){var o=order[i];add('item','<b>'+esc(K.lineNames[o.key]||o.scene.label)+'</b><span class="dots">........................</span><span class="ok">'+__CHECK__+esc(K.pass)+'</span>',LH,o.key,i)}
  add('dash','- - - - - - - - - - - - - -',9);add('total','<b>'+esc(K.total)+'</b><span class="ok">'+__CHECK__+esc(K.pass)+'</span>',15);
  printed=0;current=-1;paper.style.height='0px';paper.classList.remove('is-torn','is-ready');pos.classList.remove('is-ok');
  setTitle(order[0].scene.title);setWord(K.words[order[0].key]);showLayer(layers,layerFor(order[0].key));
}
function feedTo(n){var h=18;for(var i=0;i<n;i++)h+=lines[i].h;paper.style.height=h+'px'}
function beep(){scene.classList.remove('is-beep');void scene.offsetWidth;scene.classList.add('is-beep');pos.classList.add('is-ok');card.classList.add('is-tap');setTimeout(function(){card.classList.remove('is-tap')},420);setTimeout(function(){pos.classList.remove('is-ok')},900)}
function printNext(byUser){
  if(phase!=='print'||printed>=lines.length)return false;
  var ln=lines[printed];printed++;
  var el=document.createElement('div');el.className='ln '+ln.cls;el.innerHTML=ln.html;if(ln.key){el.setAttribute('data-key',ln.key);el.setAttribute('data-i',ln.i)}sheet.appendChild(el);ln.el=el;void el.offsetWidth;el.classList.add('is-on');feedTo(printed);
  if(byUser){userPlayed=true;hideHint(scene)}
  if(ln.cls==='item'){
    var i=ln.i,o=order[i];o.visited=true;current=i;beep();sparks(burst);
    setTitle(o.scene.title);setWord(K.words[o.key]);showLayer(layers,layerFor(o.key));
  }
  if(printed>=lines.length){phase='ready';paper.classList.add('is-ready');beep();setTitle(K.final.title);setWord(K.final.word);showLayer(layers,'final');markFinal();
    if(!userPlayed){hintT=setTimeout(function(){if(phase==='ready'){$('.hint .t').textContent=K.hintTear;$('.hint svg').outerHTML=__UP__;showHint(scene)}},500)}
    tearT=setTimeout(function(){tearT=null;if(phase==='ready')tear(false)},T.tearIdle);
  }
  if(phase==='print'){var nx=lines[printed];schedule(nx&&nx.cls==='item'?T.line:280)}
  emit('state');return true;
}
function schedule(ms){if(autoT)clearTimeout(autoT);autoT=setTimeout(function(){autoT=null;if(phase==='print')printNext(false)},ms)}
function tear(byUser){
  if(phase!=='ready')return;phase='torn';if(tearT){clearTimeout(tearT);tearT=null}hideHint(scene);
  if(byUser)userPlayed=true;if(hot){hot.classList.remove('is-hot');hot=null}paper.classList.remove('is-ready');paper.classList.add('is-torn');sparks(burst);setTitle(K.final.title);setWord(K.final.word);showLayer(layers,'final');emit('state');
  later(function(){markEnded();emit('state')},T.hold);
}
function reset(){clearTimers();if(autoT){clearTimeout(autoT);autoT=null}if(tearT){clearTimeout(tearT);tearT=null}if(hintT){clearTimeout(hintT);hintT=null}phase='';hideHint(scene);$('.hint .t').textContent=K.hint;drag=null;paper.classList.remove('is-drag')}
function start(){
  if(reduced){ad.classList.add('is-in','is-live');phase='print';while(printed<lines.length){var ln=lines[printed++];var el=document.createElement('div');el.className='ln '+ln.cls+' is-on';el.innerHTML=ln.html;sheet.appendChild(el);if(ln.cls==='item')order[ln.i].visited=true}feedTo(printed);phase='ready';markFinal();setTitle(K.final.title);setWord(K.final.word);showLayer(layers,'final');tear(false);markEnded();return}
  intro(function(){later(function(){phase='print';beep();schedule(T.first);if(!userPlayed){hintT=setTimeout(function(){if(phase==='print'&&!userPlayed)showHint(scene)},900)}},900)});
  emit('state');
}
function restart(){reset();userPlayed=false;build();start()}
function replay(){reset();userPlayed=true;build();start()}
/* etkileşim */
pos.addEventListener('click',function(e){e.stopPropagation();if(phase==='print')printNext(true);else if(phase==='ready')tear(true)});
card.addEventListener('click',function(e){e.stopPropagation();if(phase==='print')printNext(true);else if(phase==='ready')tear(true)});
paper.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();try{paper.setPointerCapture(e.pointerId)}catch(err){}drag={id:e.pointerId,sy:e.clientY,sx:e.clientX};paper.classList.add('is-drag')});
paper.addEventListener('pointermove',function(e){if(!drag||e.pointerId!==drag.id)return;var dy=drag.sy-e.clientY,dx=drag.sx-e.clientX;if(phase==='ready'&&(dy>28||dx>28)){drag=null;paper.classList.remove('is-drag');tear(true)}});
function endPaper(e){if(!drag||(e&&e.pointerId!==drag.id))return;try{paper.releasePointerCapture(drag.id)}catch(err){}var moved=Math.abs(drag.sy-e.clientY)>6;drag=null;paper.classList.remove('is-drag');if(!moved){if(phase==='print')printNext(true);else if(phase==='ready')tear(true)}}
paper.addEventListener('pointerup',endPaper);paper.addEventListener('pointercancel',endPaper);
sheet.addEventListener('pointerover',function(e){var el=e.target;while(el&&el!==sheet&&!(el.classList&&el.classList.contains('item')))el=el.parentNode;if(!el||el===sheet||!el.classList.contains('is-on')||phase==='torn')return;if(hot)hot.classList.remove('is-hot');hot=el;el.classList.add('is-hot');var o=order[+el.getAttribute('data-i')];setTitle(o.scene.title);setWord(K.words[o.key]);showLayer(layers,layerFor(o.key))});
sheet.addEventListener('pointerleave',function(){if(hot){hot.classList.remove('is-hot');hot=null}if(phase==='ready'||phase==='torn'){setTitle(K.final.title);setWord(K.final.word);showLayer(layers,'final')}else if(current>=0){var o=order[current];setTitle(o.scene.title);setWord(K.words[o.key]);showLayer(layers,layerFor(o.key))}});
scene.addEventListener('click',function(e){e.stopPropagation()});
again.addEventListener('click',function(e){e.stopPropagation();replay()});
engine.key=function(e){if(e.key===' '){e.preventDefault();if(phase==='print')printNext(true);else if(phase==='ready')tear(true)}};
engine.restart=restart;
engine.snapshot=function(){return {phase:phase,printed:printed,linesTotal:lines.length,current:current}};
S=readSignals();build();start();
`;

function render(data, assets) {
  const K = data.receipt;
  const js = JS.replace(/__CHECK__/g, () => JSON.stringify(SVG.check)).replace(/__UP__/g, () => JSON.stringify(SVG.up));
  const body = `
  <div class="bg"></div>
  <div class="grain"></div>
  <div class="vig"></div>
  <div class="rain"></div>
  <div class="shade"></div>
  <div class="scene" aria-label="POS fişi">
    <div class="surface"></div>
    <div class="paper" role="button" aria-label="Fiş"><div class="sheet"></div></div>
    <div class="stub"><div class="sheet"></div></div>
    <div class="pos" role="button" aria-label="Kartı okut"><div class="pos-body"><span class="slot"></span><span class="nfcz">${SVG.nfc('')}</span><span class="led"></span><div class="screen"><span class="idle">${esc(K.pos.idle)}</span><span class="ok">${SVG.check}${esc(K.pos.ok)}</span></div><div class="keys"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>
    <span class="ring"></span><span class="ring r2"></span>
    ${cardMarkup(assets)}
    <div class="burst"></div>
    <div class="hint">${SVG.hand.replace('viewBox', 'width="14" height="14" viewBox')} <span class="t">${esc(K.hint)}</span></div>
    <button class="again" type="button">${SVG.again}${esc(K.replay)}</button>
  </div>
  ${leftMarkup(data, assets, K.line2)}`;
  return page({ data, assets, concept: 'fis', title: 'Fiş', css: CSS, js, body, runtime: { receipt: K } });
}

module.exports = {
  id: 'fis', title: 'Fiş', tagline: 'POS fişi satır satır yazılır: RESTORAN … GEÇTİ ✓',
  howto: 'POS\'a ya da karta dokunarak bir sonraki satırı yazdırın; satırların üstüne gelin; bitince fişi çekip koparın.',
  render,
};
