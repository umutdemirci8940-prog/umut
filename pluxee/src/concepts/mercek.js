'use strict';
/**
 * KONSEPT 2 – Mercek: kart bir ışık merceğidir. Karanlık şehirde kartı gezdirdiğiniz yer
 * aydınlanır; kabul noktaları (restoran, kafe, market, online) merceğe girince "geçiyor".
 * Dokunulmazsa kart noktaları kendisi dolaşır. Dördü de aydınlanınca tüm sahne açılır.
 */
const { SVG, icon, esc, cardMarkup, leftMarkup, page } = require('../common');

const CSS = `
.bg canvas.dark{opacity:1}
.bg canvas.bright{opacity:1;-webkit-mask-image:radial-gradient(circle var(--r,0px) at var(--lx,700px) var(--ly,130px),#000 0,#000 62%,transparent 100%);mask-image:radial-gradient(circle var(--r,0px) at var(--lx,700px) var(--ly,130px),#000 0,#000 62%,transparent 100%)}
.glow{position:absolute;left:0;top:0;width:360px;height:360px;margin:-180px 0 0 -180px;border-radius:50%;background:radial-gradient(circle,rgba(200,255,225,.42) 0%,rgba(0,235,94,.22) 30%,rgba(0,235,94,0) 68%);mix-blend-mode:screen;pointer-events:none;opacity:0;z-index:2;will-change:transform,opacity}
.scene{position:absolute;left:440px;top:0;width:530px;height:250px;z-index:4;touch-action:none;cursor:none}
.spot{position:absolute;left:0;top:0;width:0;height:0;z-index:3;pointer-events:none}
.spot .dot{position:absolute;left:-19px;top:-19px;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.06);box-shadow:inset 0 0 0 1px rgba(255,255,255,.16);display:grid;place-items:center;color:rgba(255,255,255,.45);transition:background .35s,box-shadow .35s,color .35s,transform .4s var(--ease)}
.spot .dot svg{width:20px;height:20px}
.spot .name{position:absolute;left:0;top:24px;transform:translateX(-50%);font-size:8.5px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.35);white-space:nowrap;transition:color .35s,text-shadow .35s}
.spot .chip{position:absolute;left:0;top:-66px;transform:translate(-50%,6px) scale(.8);display:inline-flex;align-items:center;gap:5px;padding:4px 9px;border-radius:99px;background:var(--green);color:var(--navy);font-size:9px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;white-space:nowrap;opacity:0;transition:opacity .3s,transform .45s var(--ease)}
.spot .chip svg{width:10px;height:10px}
.spot .ringp{position:absolute;left:-23px;top:-23px;width:46px;height:46px;border-radius:50%;border:2px solid var(--green);opacity:0;transform:scale(.6)}
.spot.is-lit .dot{background:rgba(255,255,255,.14);box-shadow:inset 0 0 0 1px rgba(255,255,255,.5),0 0 24px rgba(255,255,255,.25);color:#fff;transform:scale(1.08)}
.spot.is-lit .name{color:#fff;text-shadow:0 2px 10px rgba(0,0,0,.6)}
.spot.is-near .ringp{animation:ringp .32s linear forwards}
@keyframes ringp{0%{opacity:.9;transform:scale(.6)}100%{opacity:.9;transform:scale(1)}}
.spot.is-done .dot{background:var(--green);box-shadow:0 0 0 2px rgba(0,235,94,.35),0 0 30px rgba(0,235,94,.55);color:var(--navy)}
.spot.is-done .name{color:var(--green)}
.spot.is-done .chip{opacity:1;transform:translate(-50%,0) scale(1)}
.spot.is-top .chip{top:60px}
.spot.is-done .ringp{animation:ringout .8s ease-out both}
@keyframes ringout{0%{opacity:.9;transform:scale(1)}100%{opacity:0;transform:scale(3.4)}}
.card{left:0;top:0;font-size:8px;margin:-6em 0 0 -9.5em;opacity:0;z-index:5;pointer-events:none;transition:opacity .5s}
.ad.is-live .card{opacity:1}
.tally{position:absolute;left:56px;top:204px;width:448px;height:32px;pointer-events:none;opacity:0;transition:opacity .8s .5s}
.ad.is-live .tally{opacity:1}
.tally .line{position:absolute;left:0;right:0;top:22px;height:2px;background:rgba(255,255,255,.16);border-radius:2px}
.node{position:absolute;top:0;width:64px;height:32px;margin-left:-32px}
.node i{position:absolute;left:27px;top:18px;width:10px;height:10px;border-radius:50%;background:#2A2550;box-shadow:0 0 0 2px rgba(255,255,255,.35);transition:background .3s,box-shadow .3s,transform .3s}
.node b{position:absolute;left:50%;top:0;transform:translateX(-50%);font-size:8.5px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.5);white-space:nowrap;transition:color .3s}
.node b svg{width:8px;height:8px;vertical-align:-1px;margin-left:3px;display:none}
.node.is-done i{background:var(--green);box-shadow:0 0 0 2px rgba(0,235,94,.35),0 0 12px rgba(0,235,94,.8);transform:scale(1.15)}
.node.is-done b{color:var(--green)}.node.is-done b svg{display:inline}
.burst{left:0;top:0}
.hint{left:295px;top:38px}
.again{left:265px;top:12px}
.ad.is-final .shade{background:linear-gradient(90deg,rgba(15,12,38,.9) 0%,rgba(15,12,38,.78) 32%,rgba(15,12,38,.3) 48%,rgba(15,12,38,0) 64%),linear-gradient(180deg,rgba(15,12,38,0) 70%,rgba(15,12,38,.4) 100%);transition:background 1.2s}
`;

const JS = `
var K=D.lens,T=K.timing;
var scene=$('.scene'),card=$('.card'),glow=$('.glow'),burst=$('.burst'),again=$('.again'),tally=$('.tally'),hint=$('.hint');
var POS={restoran:{x:575,y:75},kafe:{x:760,y:52},market:{x:655,y:165},online:{x:900,y:150}};
var spots={},nodes=[],bright=null,dark=null;
var cur={x:770,y:120},tgt={x:770,y:120},vel={x:0,y:0},R=0,Rt=130,phase='',raf=0,last=0,pointerIn=false,auto=true,tourIdx=-1,tourT=null,resumeT=null,nearKey=null,nearSince=0,live=false,introK=0,introAt=0,hintT=null;
function loadImg(uri){return new Promise(function(res){var im=new Image();im.onload=function(){res(im)};im.onerror=function(){res(null)};im.src=uri})}
function compose(base,parts){
  var b=document.createElement('canvas');b.width=W;b.height=H;var bx=b.getContext('2d');
  if(base.tagName==='IMG')drawCover(bx,base,0,0,W,H);else bx.drawImage(base,0,0);
  for(var k in parts){var src=parts[k];if(!src)continue;var tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;var tx=tmp.getContext('2d');
    if(src.tagName==='IMG')drawCover(tx,src,0,0,W,H);else tx.drawImage(src,0,0);
    tx.globalCompositeOperation='destination-in';var g=tx.createRadialGradient(POS[k].x,POS[k].y,10,POS[k].x,POS[k].y,200);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.55,'rgba(0,0,0,.8)');g.addColorStop(1,'rgba(0,0,0,0)');tx.fillStyle=g;tx.fillRect(0,0,W,H);bx.drawImage(tmp,0,0)}
  var d=document.createElement('canvas');d.width=W;d.height=H;var dx=d.getContext('2d');if('filter' in dx)dx.filter='blur(3px) saturate(.4)';dx.drawImage(b,0,0);dx.filter='none';dx.fillStyle='rgba(8,6,26,.84)';dx.fillRect(0,0,W,H);
  return {bright:b,dark:d};
}
function drawCover(x,im,dx,dy,dw,dh){var r=Math.max(dw/im.naturalWidth,dh/im.naturalHeight),sw=dw/r,sh=dh/r;x.drawImage(im,(im.naturalWidth-sw)/2,(im.naturalHeight-sh)/2,sw,sh,dx,dy,dw,dh)}
function mount(c){
  if(dark&&dark.parentNode)dark.parentNode.removeChild(dark);if(bright&&bright.parentNode)bright.parentNode.removeChild(bright);
  dark=c.dark;dark.className='dark';bright=c.bright;bright.className='bright';bg.appendChild(dark);bg.appendChild(bright);setLens(cur.x,cur.y,R);
}
function paintScene(){
  try{
    var gr=$('.grain');if(gr)gr.style.backgroundImage='url('+grainUri()+')';
    var parts={};for(var k in POS)parts[k]=paint(PAL[k]);
    mount(compose(paint(PAL.city),parts));            /* önce üretilmiş sahne (fotoğraflar yüklenene kadar) */
    var keys=Object.keys(POS),has=false;for(var i=0;i<keys.length;i++)if(photoOf(keys[i]))has=true;
    if(!has)return;
    var jobs=[loadImg(photoOf('hero')||photoOf('restoran'))];for(i=0;i<keys.length;i++)jobs.push(loadImg(photoOf(keys[i])));
    Promise.all(jobs).then(function(ims){var p2={};for(var j=0;j<keys.length;j++)p2[keys[j]]=ims[j+1]||paint(PAL[keys[j]]);mount(compose(ims[0]||paint(PAL.city),p2))});
  }catch(err){}
}
paintScene();
function build(){
  buildCore();
  for(var k in spots){if(spots[k].el.parentNode)spots[k].el.parentNode.removeChild(spots[k].el)}spots={};
  for(var i=0;i<order.length;i++){var o=order[i],p=POS[o.key];var el=document.createElement('div');el.className='spot';el.setAttribute('data-key',o.key);el.style.left=(p.x-440)+'px';el.style.top=p.y+'px';if(p.y<90)el.classList.add('is-top');el.innerHTML='<span class="ringp"></span><span class="dot">'+__ICON__[o.key]+'</span><span class="name">'+esc(o.scene.label)+'</span><span class="chip">'+__CHECK__+esc(K.chip)+'</span>';scene.insertBefore(el,card);spots[o.key]={el:el,x:p.x,y:p.y,o:o}}
  tally.innerHTML='<span class="line"></span>';nodes=[];
  for(i=0;i<order.length;i++){var n=document.createElement('div');n.className='node';n.style.left=((i+.5)/order.length*100)+'%';n.setAttribute('data-key',order[i].key);n.innerHTML='<i></i><b>'+esc(order[i].scene.label)+__CHECK__+'</b>';tally.appendChild(n);nodes.push(n)}
  setTitle(order[0].scene.title);setWord(K.words[order[0].key]);
}
function setLens(x,y,r){var lx=x.toFixed(1)+'px',ly=y.toFixed(1)+'px';if(bright){bright.style.setProperty('--lx',lx);bright.style.setProperty('--ly',ly);bright.style.setProperty('--r',r.toFixed(1)+'px')}glow.style.transform='translate3d('+lx+','+ly+',0) scale('+(r/130).toFixed(3)+')';glow.style.opacity=(r>1?.9:0).toFixed(2)}
function ease(x){return 1-Math.pow(1-x,3)}
function frame(now){
  raf=0;var dt=last?Math.min(48,now-last):16;last=now;
  if(introAt)introK=clamp((now-introAt)/800,0,1);
  var ik=ease(introK);
  var px=cur.x,py=cur.y;cur.x+=(tgt.x-cur.x)*.16;cur.y+=(tgt.y-cur.y)*.16;vel={x:cur.x-px,y:cur.y-py};
  R+=(Rt-R)*.12;
  var iy=(1-ik)*-150,ry=clamp(vel.x*1.6,-22,22),rx=clamp(-vel.y*1.6,-16,16);
  card.style.transform='translate3d('+(cur.x-440).toFixed(1)+'px,'+(cur.y+iy).toFixed(1)+'px,0) perspective(900px) rotateX('+(10+rx).toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg) rotateZ('+(-6+ry*.15).toFixed(2)+'deg)';
  setLens(cur.x,cur.y+iy*.3,R*ik);hint.style.left=(cur.x-440).toFixed(1)+'px';hint.style.top=(cur.y+iy-70).toFixed(1)+'px';
  if(phase==='play'){
    var best=null,bd=1e9;
    for(var k in spots){var sp=spots[k],d=Math.hypot(sp.x-cur.x,sp.y-cur.y);sp.el.classList.toggle('is-lit',d<R*.95);if(d<bd){bd=d;best=k}}
    if(best&&bd<62){if(nearKey!==best){nearKey=best;nearSince=now;spots[best].el.classList.add('is-near')}else if(now-nearSince>T.dwell&&!spots[best].o.visited)activate(best)}
    else{if(nearKey){spots[nearKey].el.classList.remove('is-near');nearKey=null}}
  }
  if(live&&(phase==='play'||introK<1||Math.abs(tgt.x-cur.x)>.3||Math.abs(tgt.y-cur.y)>.3||Math.abs(Rt-R)>.5))raf=requestAnimationFrame(frame);
}
function tick(){if(!raf){last=0;raf=requestAnimationFrame(frame)}}
function activate(key){
  var sp=spots[key];if(sp.o.visited)return;sp.o.visited=true;sp.el.classList.remove('is-near');sp.el.classList.add('is-done');
  for(var i=0;i<nodes.length;i++)if(nodes[i].getAttribute('data-key')===key)nodes[i].classList.add('is-done');
  burst.style.left=(sp.x-440)+'px';burst.style.top=(sp.y-10)+'px';sparks(burst);
  setTitle(sp.o.scene.title);setWord(K.words[key]);
  scene.classList.add('is-passing');setTimeout(function(){scene.classList.remove('is-passing')},900);
  emit('state');
  if(visitedCount()===order.length)later(finish,700);
}
function finish(){
  if(phase==='final')return;phase='final';markFinal();hideHint(scene);cancelTour();Rt=1500;
  for(var k in spots)spots[k].el.classList.add('is-lit');
  setTitle(K.final.title);setWord(K.final.word);emit('state');tick();
  later(function(){markEnded();emit('state')},T.final);
}
/* otomatik tur */
function cancelTour(){if(tourT){clearTimeout(tourT);tourT=null}}
function nextSpot(){for(var i=0;i<order.length;i++){var j=(tourIdx+1+i)%order.length;if(!order[j].visited)return j}return -1}
function tourStep(){
  cancelTour();if(phase!=='play'||!auto||pointerIn)return;
  var j=nextSpot();if(j<0)return;tourIdx=j;var sp=spots[order[j].key];tgt={x:sp.x+6,y:sp.y-4};tick();
  tourT=setTimeout(function(){tourT=null;if(phase==='play'&&auto)tourStep()},T.move+T.dwell+T.hold);
}
function armTour(ms){cancelTour();if(reduced)return;tourT=setTimeout(function(){tourT=null;tourStep()},ms)}
function reset(){clearTimers();cancelTour();if(resumeT){clearTimeout(resumeT);resumeT=null}if(hintT){clearTimeout(hintT);hintT=null}phase='';R=0;Rt=130;tourIdx=-1;nearKey=null;introK=0;introAt=0;auto=true;pointerIn=false;cur={x:770,y:120};tgt={x:770,y:120};hideHint(scene);setLens(770,120,0)}
function start(){
  live=true;
  if(reduced){ad.classList.add('is-in','is-live');introK=1;for(var k in spots){spots[k].o.visited=true;spots[k].el.classList.add('is-done','is-lit')}for(var i=0;i<nodes.length;i++)nodes[i].classList.add('is-done');R=1500;Rt=1500;phase='play';finish();markEnded();tick();return}
  intro(function(){introAt=performance.now();tick();later(function(){phase='play';tick();armTour(T.idle);if(!userPlayed){hintT=setTimeout(function(){if(phase==='play'&&!userPlayed)showHint(scene)},600)}},700)});
  emit('state');
}
function restart(){reset();userPlayed=false;build();start()}
function replay(){reset();userPlayed=true;buildCore();for(var k in spots){spots[k].el.classList.remove('is-done','is-lit','is-near');spots[k].o=order.filter(function(o){return o.key===k})[0]}for(var i=0;i<nodes.length;i++)nodes[i].classList.remove('is-done');setTitle(order[0].scene.title);setWord(K.words[order[0].key]);start()}
/* etkileşim: kart imleci/parmağı izler */
function toScene(e){var r=scene.getBoundingClientRect();var s=(r.width||530)/530;return {x:440+clamp((e.clientX-r.left)/s,40,500),y:clamp((e.clientY-r.top)/s,30,230)}}
function onPointer(e){if(phase!=='play')return;var p=toScene(e);tgt=p;pointerIn=true;auto=false;cancelTour();if(resumeT){clearTimeout(resumeT);resumeT=null}if(!userPlayed){userPlayed=true;hideHint(scene);emit('state')}tick()}
scene.addEventListener('pointermove',onPointer);
scene.addEventListener('pointerdown',function(e){e.preventDefault();e.stopPropagation();onPointer(e)});
scene.addEventListener('pointerleave',function(){pointerIn=false;if(phase!=='play')return;if(resumeT)clearTimeout(resumeT);resumeT=setTimeout(function(){resumeT=null;auto=true;tourStep()},T.resume)});
scene.addEventListener('click',function(e){e.stopPropagation()});
again.addEventListener('click',function(e){e.stopPropagation();replay()});
engine.key=function(e){if(phase!=='play')return;var step=40;if(e.key==='ArrowRight'){tgt.x=clamp(tgt.x+step,480,940)}else if(e.key==='ArrowLeft'){tgt.x=clamp(tgt.x-step,480,940)}else if(e.key==='ArrowUp'){tgt.y=clamp(tgt.y-step,30,230)}else if(e.key==='ArrowDown'){tgt.y=clamp(tgt.y+step,30,230)}else return;e.preventDefault();userPlayed=true;hideHint(scene);auto=false;cancelTour();tick()};
engine.restart=restart;
engine.snapshot=function(){return {phase:phase,lens:{x:Math.round(cur.x),y:Math.round(cur.y),r:Math.round(R)},near:nearKey,auto:auto}};
S=readSignals();build();start();
`;

function render(data, assets) {
  const K = data.lens;
  const icons = {}; for (const k of Object.keys(SVG.icons)) icons[k] = icon(k);
  const js = JS.replace(/__ICON__/g, () => JSON.stringify(icons)).replace(/__CHECK__/g, () => JSON.stringify(SVG.check));
  const body = `
  <div class="bg"></div>
  <div class="glow"></div>
  <div class="grain"></div>
  <div class="vig"></div>
  <div class="rain"></div>
  <div class="shade"></div>
  <div class="scene" aria-label="Kartı gezdirin">
    <div class="tally"></div>
    ${cardMarkup(assets)}
    <div class="burst"></div>
    <div class="hint">${SVG.hand.replace('viewBox', 'width="14" height="14" viewBox')} ${esc(K.hint)} <small>· ${esc(K.hintSub)}</small></div>
    <button class="again" type="button">${SVG.again}${esc(K.replay)}</button>
  </div>
  ${leftMarkup(data, assets, K.line2)}`;
  return page({ data, assets, concept: 'mercek', title: 'Mercek', css: CSS, js, body, runtime: { lens: K } });
}

module.exports = {
  id: 'mercek', title: 'Mercek', tagline: 'Kart bir ışık merceği: gezdirdiğiniz yer aydınlanır',
  howto: 'Kartı imleçle ya da parmağınızla gezdirin; kabul noktaları merceğe girince aydınlanır ve "geçiyor".',
  render,
};
