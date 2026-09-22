'use strict';
/**
 * KONSEPT – Hikâye: tam kadraj fotoğraf hikâyeleri (stories) bir masthead'de.
 * Dört fotoğraf art arda geçer; her birine "GEÇİYOR ✓" damgası vurulur. Üstteki ince
 * çubuklar hikâyenin süresini gösterir. Dokun: ilerle/geri dön; basılı tut: durdur;
 * kaydır: ileri/geri. Dördüncü hikâyenin sonunda dört damga alt sırada toplanır.
 */
const { SVG, esc, cardMarkup, leftMarkup, page } = require('../common');

const COPY = {
  words: { restoran: 'Restoranda,', kafe: 'Kafede,', market: 'Markette,', online: 'Online siparişte,' },
  line2: 'Pluxee geçiyor.',
  final: { title: 'Burada, şurada, orada', word: 'Her yerde,' },
  stamp: 'GEÇİYOR',
  pause: 'Durduruldu',
  hint: 'Dokunun: ilerleyin',
  hintHold: 'basılı tutun: durdurun',
  replay: 'Baştan izle',
  timing: {
    story: 3600,   // bir hikâyenin süresi (ms)
    stamp: 380,    // damganın vurulma anı (hikâye başından itibaren)
    label: 720,    // etiketin belirme anı
    hold: 3000,    // final karesi
    press: 250,    // basılı tutma eşiği
    swipe: 40,     // kaydırma eşiği (px)
    hint: 900,     // ipucu gecikmesi
  },
};

const CSS = `
.left{z-index:12}
.shade{background:linear-gradient(90deg,rgba(15,12,38,.98) 0%,rgba(15,12,38,.94) 34%,rgba(15,12,38,.62) 50%,rgba(15,12,38,0) 66%),linear-gradient(180deg,rgba(15,12,38,0) 68%,rgba(15,12,38,.55) 100%)}
.scene{position:absolute;left:0;top:0;width:970px;height:250px;z-index:4;touch-action:none;cursor:pointer}
/* fotoğraf: hikâyeye özgü yavaş Ken Burns; çıkan kare ölçeğini korur (sıçrama yok) */
.bg img.ph{transition:opacity .8s ease;animation:kbh 7.5s linear forwards;animation-play-state:paused}
.bg img.ph.is-on{animation:kbh 7.5s linear forwards}
@keyframes kbh{from{transform:scale(1.06) translate(1.1%,0)}to{transform:scale(1.15) translate(-.9%,.7%)}}
.ad.is-thud .bg{animation:thud .55s var(--ease)}
@keyframes thud{0%{transform:scale(1)}14%{transform:scale(1.014)}100%{transform:scale(1)}}
.tops{position:absolute;left:0;top:0;width:970px;height:80px;pointer-events:none;background:linear-gradient(180deg,rgba(15,12,38,.55),rgba(15,12,38,0))}
.flash{position:absolute;left:0;top:0;width:970px;height:250px;pointer-events:none;opacity:0;background:linear-gradient(90deg,rgba(255,255,255,0) 40%,#fff 64%)}
.flash.is-on{animation:flash .5s ease-out}
@keyframes flash{0%{opacity:.5}100%{opacity:0}}
/* ilerleme çubukları */
.bars{position:absolute;left:480px;top:14px;width:470px;height:3px;display:flex;gap:6px;pointer-events:none}
.bar{flex:1;height:3px;border-radius:2px;background:rgba(255,255,255,.34);overflow:hidden;box-shadow:0 0 0 1px rgba(15,12,38,.28),0 1px 3px rgba(0,0,0,.35);opacity:0;transform:translateY(-4px);transition:opacity .5s,transform .6s var(--ease)}
.ad.is-live .bar{opacity:1;transform:none}
.ad.is-live .bar:nth-child(2){transition-delay:.06s}.ad.is-live .bar:nth-child(3){transition-delay:.12s}.ad.is-live .bar:nth-child(4){transition-delay:.18s}
.bar i{display:block;height:100%;width:100%;background:var(--green);transform:scaleX(0);transform-origin:0 50%;box-shadow:0 0 8px rgba(0,235,94,.6)}
.bar.is-done i{transform:scaleX(1)}
.num{position:absolute;left:480px;top:24px;font-size:8.5px;font-weight:800;letter-spacing:.22em;color:rgba(255,255,255,.8);text-shadow:0 1px 2px rgba(0,0,0,.5),0 1px 8px rgba(0,0,0,.6);opacity:0;transition:opacity .5s .2s;pointer-events:none}
.ad.is-live .num{opacity:1}
.scene.is-final .num{opacity:0;transition-delay:0s}
/* damga */
.story{position:absolute;left:0;top:0;width:970px;height:250px;pointer-events:none;transition:opacity .35s}
.scene.is-final .story{opacity:0}
.stamp{position:absolute;left:730px;top:106px;display:inline-flex;align-items:center;gap:10px;padding:8px 16px 8px 19px;border:3px solid var(--green);border-radius:10px;color:var(--green);font-size:27px;font-weight:800;letter-spacing:.17em;line-height:1;text-transform:uppercase;white-space:nowrap;background:rgba(15,12,38,.34);backdrop-filter:blur(3px) saturate(.85);-webkit-backdrop-filter:blur(3px) saturate(.85);opacity:0;transform:translate(-50%,-50%) rotate(-10deg) scale(2.2);filter:drop-shadow(0 10px 18px rgba(0,0,0,.5));will-change:transform,opacity}
.stamp:before{content:"";position:absolute;inset:3px;border:1px solid rgba(0,235,94,.75);border-radius:6px}
.stamp svg{width:24px;height:24px;margin-top:-2px}
.story.is-stamp .stamp{animation:slam .42s cubic-bezier(.2,.9,.3,1) forwards}
@keyframes slam{0%{opacity:0;transform:translate(-50%,-50%) rotate(-10deg) scale(2.2)}55%{opacity:1}100%{opacity:1;transform:translate(-50%,-50%) rotate(-10deg) scale(1)}}
.slbl{position:absolute;left:730px;top:150px;transform:translate(-50%,6px);opacity:0;font-size:10px;font-weight:800;letter-spacing:.32em;text-transform:uppercase;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.55),0 2px 14px rgba(0,0,0,.7);white-space:nowrap;transition:opacity .45s,transform .55s var(--ease)}
.slbl em{font-style:normal;color:var(--green)}
.story.is-lbl .slbl{opacity:1;transform:translate(-50%,0)}
/* duraklatma rozeti */
.pz{position:absolute;left:715px;top:32px;transform:translate(-50%,-4px);opacity:0;display:inline-flex;align-items:center;gap:7px;height:20px;padding:0 9px 0 8px;border-radius:99px;background:rgba(15,12,38,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);box-shadow:inset 0 0 0 1px rgba(255,255,255,.14);font-size:8px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;color:#fff;pointer-events:none;transition:opacity .25s,transform .35s var(--ease);white-space:nowrap}
.pz i{width:2px;height:8px;background:var(--green);border-radius:1px}
.pz i+i{margin-left:-4px}
.scene.is-paused .pz{opacity:1;transform:translate(-50%,0)}
.scene.is-paused .bar i{box-shadow:0 0 12px rgba(0,235,94,.95)}
/* final: dört damga alt sırada */
.fin{position:absolute;left:480px;top:188px;width:340px;height:48px;display:flex;gap:10px;align-items:flex-end;pointer-events:none}
.fs{flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;opacity:0;will-change:transform,opacity}
.fs small{font-size:7.5px;font-weight:800;letter-spacing:.24em;text-transform:uppercase;color:rgba(255,255,255,.85);text-shadow:0 1px 6px rgba(0,0,0,.6);white-space:nowrap}
.fs .box{position:relative;display:inline-flex;align-items:center;gap:4px;padding:3px 7px 3px 8px;border:2px solid var(--green);border-radius:5px;color:var(--green);font-size:8.5px;font-weight:800;letter-spacing:.1em;line-height:1;text-transform:uppercase;transform:rotate(-6deg);background:rgba(15,12,38,.4);filter:drop-shadow(0 4px 8px rgba(0,0,0,.5));white-space:nowrap}
.fs .box:before{content:"";position:absolute;inset:2px;border:1px solid rgba(0,235,94,.7);border-radius:3px}
.fs .box svg{width:9px;height:9px}
.scene.is-final .fs{animation:fslam .5s cubic-bezier(.2,.9,.3,1) forwards}
.scene.is-final .fs:nth-child(1){animation-delay:.35s}.scene.is-final .fs:nth-child(2){animation-delay:.5s}.scene.is-final .fs:nth-child(3){animation-delay:.65s}.scene.is-final .fs:nth-child(4){animation-delay:.8s}
@keyframes fslam{0%{opacity:0;transform:scale(1.7)}100%{opacity:1;transform:scale(1)}}
@media (prefers-reduced-motion:reduce){.scene.is-final .fs{animation-delay:0s!important}}
/* imza: kart */
.card{font-size:6.2px;left:auto;top:auto;right:20px;bottom:19px;z-index:6;pointer-events:none;opacity:0;transform:translateY(10px) rotate(-13deg);transition:opacity .7s .55s,transform 1s .55s var(--ease);box-shadow:0 2.4em 3.6em -.8em rgba(0,0,0,.65),0 .6em 1.4em rgba(0,0,0,.35)}
.ad.is-live .card{opacity:1;transform:translateY(0) rotate(-7deg)}
.ad.is-ended .gloss{animation:none}
.burst{left:730px;top:106px}
.hint{left:655px;top:214px}
.hint svg{width:12px;height:12px}
.again{left:715px;top:30px}
`;

const JS = `
var K=D.copy,T=K.timing,STORY=T.story,SPLIT=440+530*.4;
var scene=$('.scene'),story=$('.story'),stamp=$('.stamp'),slbl=$('.slbl'),flash=$('.flash'),barsEl=$('.bars'),numEl=$('.num'),fin=$('.fin'),again=$('.again'),burst=$('.burst');
var layers=initLayers(bg,['restoran','kafe','market','online','final','rain']);
var bars=[],fins=[],idx=-1,elapsed=0,paused=false,phase='',raf=0,last=0,live=false,ptr=null,holdT=null,hintT=null;
function showPhoto(key){if(!layers[key]){for(var kk in layers){key=kk;break}}for(var k in layers){var el=layers[k],on=k===key;if(on&&el.tagName==='IMG'&&!el.classList.contains('is-on')){el.style.animation='none';void el.offsetWidth;el.style.animation=''}el.classList.toggle('is-on',on)}}
function build(){
  buildCore();
  barsEl.innerHTML='';bars=[];for(var i=0;i<order.length;i++){var b=document.createElement('span');b.className='bar';b.innerHTML='<i></i>';barsEl.appendChild(b);bars.push(b)}
  fin.innerHTML='';fins=[];for(i=0;i<order.length;i++){var f=document.createElement('div');f.className='fs';f.innerHTML='<small>'+esc(order[i].scene.label)+'</small><span class="box">'+esc(K.stamp)+__CHECK__+'</span>';fin.appendChild(f);fins.push(f)}
  idx=-1;elapsed=0;paused=false;phase='';scene.classList.remove('is-final','is-paused');story.classList.remove('is-stamp','is-lbl');
  numEl.textContent=pad(1)+' / '+pad(order.length);
  setTitle(order[0].scene.title);setWord(K.words[order[0].key]||order[0].scene.word);showPhoto(layerFor(order[0].key));drawBars();
}
function drawBars(){for(var i=0;i<bars.length;i++){var v=i<idx||phase==='final'?1:i===idx?clamp(elapsed/STORY,0,1):0;bars[i].firstChild.style.transform='scaleX('+v.toFixed(4)+')';bars[i].classList.toggle('is-done',i<idx||phase==='final')}}
function flashNow(){flash.classList.remove('is-on');void flash.offsetWidth;flash.classList.add('is-on');ad.classList.remove('is-thud');void ad.offsetWidth;ad.classList.add('is-thud')}
function go(i,byUser){
  if(phase!=='play')return;
  if(byUser){userPlayed=true;hideHint(scene);if(hintT){clearTimeout(hintT);hintT=null}}
  if(i>=order.length){finish();return}
  i=clamp(i,0,order.length-1);clearTimers();
  idx=i;elapsed=0;paused=false;scene.classList.remove('is-paused');
  var o=order[i];o.visited=true;
  setTitle(o.scene.title);setWord(K.words[o.key]||o.scene.word);showPhoto(layerFor(o.key));
  numEl.textContent=pad(i+1)+' / '+pad(order.length);
  story.classList.remove('is-stamp','is-lbl');slbl.innerHTML=esc(o.scene.label)+' <em>·</em> '+esc(o.tag);
  later(function(){story.classList.add('is-stamp');flashNow()},T.stamp);
  later(function(){story.classList.add('is-lbl')},T.label);
  drawBars();tick();emit('state');
}
function finish(){
  if(phase==='final')return;phase='final';idx=order.length;elapsed=0;paused=false;scene.classList.remove('is-paused');hideHint(scene);clearTimers();if(hintT){clearTimeout(hintT);hintT=null}
  for(var i=0;i<order.length;i++)order[i].visited=true;
  setTitle(K.final.title);setWord(K.final.word);showPhoto('final');
  story.classList.remove('is-stamp','is-lbl');scene.classList.add('is-final');drawBars();markFinal();emit('state');
  later(function(){markEnded();emit('state')},T.hold);
}
function frame(now){
  raf=0;if(!live||phase!=='play')return;var dt=last?Math.min(64,now-last):0;last=now;
  if(!paused){elapsed+=dt;if(elapsed>=STORY){elapsed=STORY;drawBars();go(idx+1,false);return}}
  drawBars();if(!paused)raf=requestAnimationFrame(frame);
}
function tick(){if(!raf){last=0;raf=requestAnimationFrame(frame)}}
function setPaused(p,byUser){if(phase!=='play'||paused===p)return;paused=p;scene.classList.toggle('is-paused',p);if(byUser){userPlayed=true;hideHint(scene);if(hintT){clearTimeout(hintT);hintT=null}}if(!p)tick();emit('state')}
function armHint(){if(hintT)clearTimeout(hintT);hintT=setTimeout(function(){hintT=null;if(phase==='play'&&!userPlayed){showHint(scene);emit('state')}},T.hint)}
function reset(){clearTimers();if(raf){cancelAnimationFrame(raf);raf=0}if(holdT){clearTimeout(holdT);holdT=null}if(hintT){clearTimeout(hintT);hintT=null}ptr=null;phase='';paused=false;hideHint(scene);scene.classList.remove('is-final','is-paused');story.classList.remove('is-stamp','is-lbl');ad.classList.remove('is-thud')}
function start(){
  live=true;
  if(reduced){ad.classList.add('is-in','is-live');phase='play';for(var i=0;i<order.length;i++)order[i].visited=true;finish();clearTimers();eyebrow.textContent=K.final.title;eyebrow.classList.remove('is-out');markEnded();emit('state');return}
  phase='intro';
  intro(function(){phase='play';go(0,false);if(!userPlayed)armHint()});
  emit('state');
}
function restart(){reset();userPlayed=false;build();start()}
function replay(){reset();userPlayed=true;build();start()}
/* etkileşim: dokun (ileri/geri), basılı tut (durdur), kaydır (ileri/geri) */
function scaleOf(){var r=scene.getBoundingClientRect();return (r.width||W)/W}
scene.addEventListener('pointerdown',function(e){
  if(within(e.target,'again')||phase!=='play')return;
  e.preventDefault();e.stopPropagation();try{scene.setPointerCapture(e.pointerId)}catch(err){}
  ptr={id:e.pointerId,sx:e.clientX,sy:e.clientY,moved:false,hold:false};
  if(holdT)clearTimeout(holdT);
  holdT=setTimeout(function(){holdT=null;if(ptr&&!ptr.moved&&phase==='play'){ptr.hold=true;setPaused(true,true)}},T.press);
});
scene.addEventListener('pointermove',function(e){if(!ptr||e.pointerId!==ptr.id)return;var dx=e.clientX-ptr.sx,dy=e.clientY-ptr.sy;if(!ptr.moved&&(Math.abs(dx)>6||Math.abs(dy)>6)){ptr.moved=true;if(holdT){clearTimeout(holdT);holdT=null}}});
function endPtr(e){
  if(!ptr||(e&&e.pointerId!==ptr.id))return;try{scene.releasePointerCapture(ptr.id)}catch(err){}
  var p=ptr;ptr=null;if(holdT){clearTimeout(holdT);holdT=null}
  if(p.hold){setPaused(false,true);return}
  var s=scaleOf(),dx=(e.clientX-p.sx)/s,dy=(e.clientY-p.sy)/s;
  if(p.moved){if(Math.abs(dx)>=T.swipe&&Math.abs(dx)>Math.abs(dy)){if(dx<0)go(idx+1,true);else go(idx-1,true)}return}
  var r=scene.getBoundingClientRect(),x=(e.clientX-r.left)/s;
  if(x<SPLIT)go(idx-1,true);else go(idx+1,true);
}
scene.addEventListener('pointerup',endPtr);scene.addEventListener('pointercancel',endPtr);
scene.addEventListener('click',function(e){e.stopPropagation()});
again.addEventListener('click',function(e){e.stopPropagation();replay()});
engine.key=function(e){
  if(e.key==='ArrowRight'){e.preventDefault();go(idx+1,true)}
  else if(e.key==='ArrowLeft'){e.preventDefault();go(idx-1,true)}
  else if(e.key===' '){e.preventDefault();setPaused(!paused,true)}
};
engine.restart=restart;
engine.snapshot=function(){return {phase:phase,idx:idx,paused:paused,elapsed:Math.round(elapsed),story:STORY}};
S=readSignals();build();start();
`;

function render(data, assets) {
  const js = JS.replace(/__CHECK__/g, () => JSON.stringify(SVG.check));
  const body = `
  <div class="bg"></div>
  <div class="grain"></div>
  <div class="vig"></div>
  <div class="rain"></div>
  <div class="shade"></div>
  <div class="scene" aria-label="Fotoğraf hikâyeleri: dokunun, ilerleyin; basılı tutun, durdurun">
    <div class="tops"></div>
    <div class="flash"></div>
    <div class="bars" aria-hidden="true"></div>
    <span class="num" aria-hidden="true"></span>
    <div class="story"><div class="stamp">${esc(COPY.stamp)}${SVG.check}</div><span class="slbl"></span></div>
    <div class="fin" aria-hidden="true"></div>
    <div class="pz" aria-hidden="true"><i></i><i></i>${esc(COPY.pause)}</div>
    ${cardMarkup(assets)}
    <div class="burst"></div>
    <div class="hint">${SVG.hand} ${esc(COPY.hint)} <small>· ${esc(COPY.hintHold)}</small></div>
    <button class="again" type="button">${SVG.again}${esc(COPY.replay)}</button>
  </div>
  ${leftMarkup(data, assets, COPY.line2)}`;
  return page({ data, assets, concept: 'hikaye', title: 'Hikâye', css: CSS, js, body, runtime: { copy: COPY } });
}

module.exports = {
  id: 'hikaye', title: 'Hikâye', tagline: 'Fotoğraf hikâyeleri: dokun, ilerle; basılı tut, dur',
  howto: 'Sağa dokunun: sonraki hikâye; sola dokunun: önceki. Basılı tutun: durdurun. Kaydırın ya da ok tuşlarını kullanın; boşluk: durdur/sürdür.',
  render, timing: COPY.timing,
};
