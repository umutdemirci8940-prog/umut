'use strict';
/**
 * KONSEPT 1 – Koridor: kart, kabul noktalarının kapılarından geçer.
 * Sürükle (ileri/geri, atalet), basılı tut (hızlan), imleçle yönlendir, rota noktalarına tıkla.
 */
const { SVG, icon, esc, cardMarkup, leftMarkup, page } = require('../common');

const CSS = `
.world{position:absolute;inset:0;overflow:hidden;z-index:1}
.ad.is-shake .world{animation:shake .32s ease-out}
@keyframes shake{0%{transform:translate(0,0)}25%{transform:translate(2px,-1.5px)}50%{transform:translate(-2px,1px)}75%{transform:translate(1px,1.5px)}100%{transform:translate(0,0)}}
.floor{position:absolute;left:440px;top:122px;width:600px;height:360px;transform-origin:50% 0;transform:perspective(240px) rotateX(66deg);opacity:0;transition:opacity 1.2s .2s;pointer-events:none;background-image:repeating-linear-gradient(90deg,rgba(0,235,94,.5) 0 1px,transparent 1px 50px),repeating-linear-gradient(0deg,rgba(0,235,94,.5) 0 1px,transparent 1px 40px);-webkit-mask-image:linear-gradient(180deg,transparent 0,#000 18%,#000 55%,transparent 100%);mask-image:linear-gradient(180deg,transparent 0,#000 18%,#000 55%,transparent 100%)}
.ad.is-live .floor{opacity:.32}
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
.scene{position:absolute;left:440px;top:0;width:530px;height:250px;z-index:4;touch-action:none;cursor:grab}
.scene.is-drag{cursor:grabbing}
.route{position:absolute;left:56px;top:204px;width:448px;height:32px;pointer-events:none;opacity:0;transition:opacity .8s .5s}
.ad.is-live .route{opacity:1}
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
.card{left:222px;top:100px;font-size:8.2px;opacity:0;transition:opacity .6s .3s;z-index:5;pointer-events:none}
.ad.is-live .card{opacity:1}
.card.is-pass .face{animation:faceflash .6s ease-out}
@keyframes faceflash{0%{filter:brightness(1.9) saturate(.7)}100%{filter:none}}
.burst{left:300px;top:118px}
.hint{left:300px;top:72px}
.again{left:300px;top:68px}
`;

const JS = `
var K=D.corridor,T=K.timing,VP={x:740,y:122};
var scene=$('.scene'),world=$('.world'),floor=$('.floor'),raysEl=$('.rays'),portal=$('.portal'),card=$('.card'),burst=$('.burst'),again=$('.again'),route=$('.route'),prog=$('.prog');
var gates=[],nodes=[],layers=initLayers(bg,['restoran','kafe','market','online','final','rain']);
var t=0,phase='',auto=true,drag=null,velT=0,inertia=false,boost=false,tween=null,steer={x:0,y:0},steerT={x:0,y:0},last=0,raf=0,speedF=1,nextIdx=-1,resumeT=null,hintT=null,holdT=null,live=false,introK=0,introAt=0;
var cruiseV=1/T.cruise;
function build(){
  buildCore();
  var old=world.querySelectorAll('.gate');for(var i=0;i<old.length;i++)world.removeChild(old[i]);
  gates=[];for(i=0;i<order.length;i++){order[i].z=T.gates[i];order[i].passed=false;var g=document.createElement('div');g.className='gate';g.setAttribute('data-key',order[i].key);g.setAttribute('data-i',i);g.innerHTML='<span class="frame"></span><span class="lbl">'+__ICON__[order[i].key]+esc(order[i].scene.label)+'<small>· '+esc(order[i].tag)+'</small></span><span class="pass">'+__CHECK__+esc(K.pass)+'</span>';world.insertBefore(g,portal);gates.push(g)}
  var oldN=route.querySelectorAll('.node');for(i=0;i<oldN.length;i++)route.removeChild(oldN[i]);
  nodes=[];for(i=0;i<order.length;i++){var n=document.createElement('div');n.className='node';n.style.left=(order[i].z*100)+'%';n.setAttribute('data-i',i);n.setAttribute('data-key',order[i].key);n.innerHTML='<i></i><b>'+esc(order[i].scene.label)+__CHECK__+'</b>';route.appendChild(n);nodes.push(n)}
  nextIdx=-1;
}
var rays=[];for(var ri=0;ri<18;ri++){var r=document.createElement('i');r.className='ray';raysEl.appendChild(r);rays.push({el:r,a:(ri/18)*360+((ri*37)%11),p:Math.random(),len:70+Math.random()*90,sp:.7+Math.random()*.6})}
function updateCopy(){
  var n=-1;for(var i=0;i<order.length;i++)if(t<order[i].z+0.004){n=i;break}
  if(n===nextIdx)return;nextIdx=n;
  for(i=0;i<nodes.length;i++)nodes[i].classList.toggle('is-next',i===n);
  if(n<0){setTitle(K.final.title);setWord(K.final.word);showLayer(layers,'final')}
  else{var o=order[n];setTitle(o.scene.title);setWord(K.words[o.key]||o.scene.word);showLayer(layers,layerFor(o.key))}
  emit('state');
}
function onPass(i){
  var o=order[i];o.passed=true;var g=gates[i];
  g.classList.remove('is-pass');void g.offsetWidth;g.classList.add('is-pass');
  card.classList.remove('is-pass');void card.offsetWidth;card.classList.add('is-pass');
  ad.classList.remove('is-shake');void ad.offsetWidth;ad.classList.add('is-shake');
  scene.classList.add('is-passing');setTimeout(function(){scene.classList.remove('is-passing')},950);
  if(!o.visited){o.visited=true;nodes[i].classList.add('is-done')}
  sparks(burst);emit('state');
}
function ease(x){return 1-Math.pow(1-x,3)}
function frame(now){
  raf=0;var dt=last?Math.min(48,now-last):16;last=now;var v=0;
  if(introAt){introK=clamp((now-introAt)/900,0,1)}
  if(phase==='fly'){
    if(tween!==null){var dd=tween-t;t+=dd*Math.min(1,dt/120);v=dd*Math.min(1,dt/120)/dt;if(Math.abs(dd)<.002){t=tween;tween=null}}
    else if(drag){if(drag.hold){v=3.2*cruiseV;t+=v*dt}else v=velT}
    else if(inertia){t+=velT*dt;velT*=Math.pow(.9,dt/16);v=velT;if(Math.abs(velT)<2e-5){inertia=false;velT=0}}
    else if(auto){v=(boost?3.2:1)*cruiseV;t+=v*dt}
    t=clamp(t,0,1);
    for(var i=0;i<order.length;i++){if(!order[i].passed&&t>=order[i].z)onPass(i);if(order[i].passed&&t<order[i].z-.02)order[i].passed=false}
    updateCopy();if(t>=1)finish();
  }
  speedF+=((Math.abs(v)/cruiseV)-speedF)*.12;
  steer.x+=(steerT.x-steer.x)*.08;steer.y+=(steerT.y-steer.y)*.08;
  var vpx=VP.x+steer.x,vpy=VP.y+steer.y,ik=ease(introK);
  for(i=0;i<gates.length;i++){
    var d=order[i].z-t+(1-ik)*.5,sc,op,g=gates[i];
    if(d<-.08){g.style.opacity='0';continue}
    if(d<0){sc=1+(-d)*11;op=1+d/.08}else{sc=1/(1+d*7.5);op=(.12+.88*Math.pow(1-d,2.2))*ik}
    var gx=vpx+steer.x*.5*sc,gy=vpy+steer.y*.5*sc;
    g.style.opacity=op.toFixed(3);g.style.transform='translate3d('+gx.toFixed(1)+'px,'+gy.toFixed(1)+'px,0) scale('+sc.toFixed(4)+')';
  }
  var pf=clamp((t-.86)/.14,0,1);var ps=phase==='final'?3.2:pf*pf*2.2;portal.style.transform='translate3d('+steer.x+'px,'+steer.y+'px,0) scale('+ps.toFixed(3)+')';portal.style.opacity=(phase==='final'?.9:pf*.85).toFixed(3);
  floor.style.backgroundPosition='0 '+((t*2600)%40).toFixed(1)+'px,0 '+((t*2600)%40).toFixed(1)+'px';floor.style.transform='translate3d('+(steer.x*.8).toFixed(1)+'px,0,0) perspective(240px) rotateX(66deg)';
  var rayOp=clamp((speedF-.55)*.32,0,.85)*ik;
  for(i=0;i<rays.length;i++){var R=rays[i];R.p+=(.25+speedF*.55)*R.sp*dt/1000;if(R.p>1){R.p=0;R.a=Math.random()*360;R.len=70+Math.random()*90}var rr=30+R.p*560,fade=Math.sin(R.p*3.1416);R.el.style.opacity=(rayOp*fade).toFixed(3);R.el.style.height=(R.len*(.5+R.p)).toFixed(0)+'px';R.el.style.transform='translate3d('+vpx+'px,'+vpy+'px,0) rotate('+R.a+'deg) translateY('+(-rr).toFixed(1)+'px)'}
  var fl=Math.sin(now/900)*3,lean=clamp((speedF-1)*3,0,10),iy=(1-ik)*70;
  card.style.transform='translate3d(0,'+(fl+lean*.5+iy).toFixed(2)+'px,0) perspective(900px) rotateX('+(14+lean).toFixed(2)+'deg) rotateY('+(steer.x*.5).toFixed(2)+'deg) rotateZ('+(-steer.x*.08).toFixed(2)+'deg)';
  prog.style.width=(clamp(t,0,1)*100).toFixed(2)+'%';
  if(live&&(phase==='fly'||introK<1||Math.abs(steerT.x-steer.x)>.05||Math.abs(steerT.y-steer.y)>.05||rayOp>0.01))raf=requestAnimationFrame(frame);
}
function tick(){if(!raf){last=0;raf=requestAnimationFrame(frame)}}
function finish(){
  if(phase==='final')return;phase='final';t=1;auto=false;inertia=false;tween=null;markFinal();hideHint(scene);
  for(var i=0;i<order.length;i++){if(!order[i].visited){order[i].visited=true;nodes[i].classList.add('is-done')}nodes[i].classList.remove('is-next')}
  setTitle(K.final.title);setWord(K.final.word);showLayer(layers,'final');emit('state');
  later(function(){markEnded();emit('state');tick()},T.hold);
}
function reset(){clearTimers();cancelAll();t=0;phase='';auto=true;inertia=false;velT=0;boost=false;tween=null;speedF=1;nextIdx=-1;introK=0;introAt=0;hideHint(scene);for(var i=0;i<order.length;i++){order[i].visited=false;order[i].passed=false;if(nodes[i])nodes[i].classList.remove('is-done','is-next');if(gates[i])gates[i].classList.remove('is-pass')}}
function cancelAll(){if(resumeT){clearTimeout(resumeT);resumeT=null}if(hintT){clearTimeout(hintT);hintT=null}if(holdT){clearTimeout(holdT);holdT=null}}
function start(){
  live=true;
  if(reduced){ad.classList.add('is-in','is-live');introK=1;phase='fly';t=1;for(var i=0;i<order.length;i++){order[i].visited=true;order[i].passed=true;nodes[i].classList.add('is-done')}finish();markEnded();tick();return}
  updateCopy();
  intro(function(){introAt=performance.now();tick();later(function(){phase='fly';tick();if(!userPlayed)armHint()},T.enter)});
  emit('state');
}
function restart(){clearTimers();cancelAll();drag=null;scene.classList.remove('is-drag');userPlayed=false;reset();build();start()}
function replay(){clearTimers();cancelAll();drag=null;scene.classList.remove('is-drag');reset();userPlayed=true;buildCore();for(var i=0;i<order.length;i++){order[i].z=T.gates[i];order[i].passed=false}start()}
function armHint(){if(hintT)clearTimeout(hintT);hintT=setTimeout(function(){hintT=null;if(phase==='fly'&&!userPlayed){showHint(scene);emit('state')}},500)}
function scale(){var r=scene.getBoundingClientRect();return (r.width||530)/530}
scene.addEventListener('pointerdown',function(e){
  if(phase!=='fly')return;if(within(e.target,'node')||within(e.target,'again'))return;
  e.preventDefault();e.stopPropagation();try{scene.setPointerCapture(e.pointerId)}catch(err){}
  drag={id:e.pointerId,sx:e.clientX,lx:e.clientX,lt:performance.now(),moved:false,t0:t};velT=0;inertia=false;tween=null;auto=false;userPlayed=true;hideHint(scene);
  if(resumeT){clearTimeout(resumeT);resumeT=null}scene.classList.add('is-drag');
  holdT=setTimeout(function(){holdT=null;if(drag&&!drag.moved){boost=true;auto=true;drag.hold=true}},220);
  emit('state');tick();
});
scene.addEventListener('pointermove',function(e){
  if(!drag||e.pointerId!==drag.id)return;var s=scale();var dx=(e.clientX-drag.sx)/s;
  if(Math.abs(dx)>6&&!drag.moved){drag.moved=true;if(holdT){clearTimeout(holdT);holdT=null}boost=false;auto=false}
  if(!drag.moved)return;var nowT=performance.now(),dtm=Math.max(1,nowT-drag.lt);var step=-(e.clientX-drag.lx)/s*(1/470);velT=step/dtm;drag.lx=e.clientX;drag.lt=nowT;t=clamp(drag.t0-dx*(1/470),0,1);tick();
});
function endDrag(e){
  if(!drag||(e&&e.pointerId!==drag.id))return;try{scene.releasePointerCapture(drag.id)}catch(err){}
  var wasHold=drag.hold,moved=drag.moved;drag=null;scene.classList.remove('is-drag');if(holdT){clearTimeout(holdT);holdT=null}boost=false;
  if(moved){inertia=Math.abs(velT)>3e-5;auto=false;if(resumeT)clearTimeout(resumeT);resumeT=setTimeout(function(){resumeT=null;auto=true;tick()},T.resume)}
  else if(!wasHold){tween=clamp(t+.09,0,1);auto=true}else auto=true;
  tick();emit('state');
}
scene.addEventListener('pointerup',endDrag);scene.addEventListener('pointercancel',endDrag);
scene.addEventListener('click',function(e){e.stopPropagation()});
route.addEventListener('click',function(e){var el=e.target;while(el&&el!==route&&!(el.classList&&el.classList.contains('node')))el=el.parentNode;if(el&&el!==route){e.stopPropagation();goGate(+el.getAttribute('data-i'))}});
function goGate(i){i=clamp(i,0,order.length-1);if(phase!=='fly')return;userPlayed=true;hideHint(scene);var target=clamp(order[i].z-.12,0,1);if(t>target){for(var k=0;k<order.length;k++)if(order[k].z>=order[i].z)order[k].passed=false}tween=target;auto=true;inertia=false;tick()}
again.addEventListener('click',function(e){e.stopPropagation();replay()});
ad.addEventListener('pointermove',function(e){var r=ad.getBoundingClientRect();var px=(e.clientX-r.left)/(r.width||W)-.5,py=(e.clientY-r.top)/(r.height||H)-.5;steerT={x:px*2*44,y:py*2*22};tick()});
ad.addEventListener('pointerleave',function(){steerT={x:0,y:0};tick()});
engine.key=function(e){
  if(phase!=='fly')return;
  if(e.key==='ArrowRight'){e.preventDefault();userPlayed=true;hideHint(scene);tween=clamp(t+.12,0,1);tick()}
  else if(e.key==='ArrowLeft'){e.preventDefault();userPlayed=true;hideHint(scene);var tg=clamp(t-.12,0,1);for(var k=0;k<order.length;k++)if(order[k].z>tg)order[k].passed=false;tween=tg;tick()}
  else if(e.key===' '){e.preventDefault();userPlayed=true;hideHint(scene);boost=true;auto=true;tick();setTimeout(function(){boost=false},900)}
};
engine.restart=restart;
engine.snapshot=function(){return {idx:nextIdx<0?order.length-1:nextIdx,next:nextIdx,t:Math.round(t*1000)/1000,phase:phase}};
S=readSignals();build();start();
`;

function render(data, assets) {
  const K = data.corridor;
  const icons = {}; for (const k of Object.keys(SVG.icons)) icons[k] = icon(k);
  const js = JS.replace(/__ICON__/g, () => JSON.stringify(icons)).replace(/__CHECK__/g, () => JSON.stringify(SVG.check));
  const body = `
  <div class="bg"></div>
  <div class="grain"></div>
  <div class="world"><div class="floor"></div><div class="rays"></div><div class="portal"></div></div>
  <div class="vig"></div>
  <div class="rain"></div>
  <div class="shade"></div>
  <div class="scene" aria-label="Sürükleyerek koridorda yol alın">
    <div class="route"><span class="line"></span><span class="prog"></span></div>
    ${cardMarkup(assets)}
    <div class="burst"></div>
    <div class="hint">${SVG.drag} ${esc(K.hint)} <small>· ${esc(K.hintHold)}</small></div>
    <button class="again" type="button">${SVG.again}${esc(K.replay)}</button>
  </div>
  ${leftMarkup(data, assets, K.line2)}`;
  return page({ data, assets, concept: 'koridor', title: 'Koridor', css: CSS, js, body, runtime: { corridor: K } });
}

module.exports = {
  id: 'koridor', title: 'Koridor', tagline: 'Kart, kabul noktalarının kapılarından geçer',
  howto: 'Koridorda sola sürükleyin (ileri), basılı tutup hızlanın, imleçle yönlendirin; rota noktalarına tıklayın.',
  render,
};
