'use strict';
/** KFC Türkiye – KFSOOO Menüler / Yeni Çifte Cruncher Menü – 970x250 medya öncelikli interaktif banner (v2) */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const seeded = (n) => { let x = 24680; return Array.from({ length: n }, () => { x = (x * 1103515245 + 12345) & 0x7fffffff; return x / 0x7fffffff; }); };

module.exports = function render({ data: D, assets: A }) {
  const C = D.copy, T = D.timing, B = D.brand, P = D.photo;
  const HF = 'National 2 Condensed', TF = 'National 2';
  const kvTop = -(P.faces * (1100 / 1200) * (P.width / 1100));
  const rnd = seeded(120);
  const sparks = Array.from({ length: 18 }, (_, i) => `<i class="spk" style="left:${(300 + rnd[i * 3] * 640).toFixed(0)}px;top:${(8 + rnd[i * 3 + 1] * 228).toFixed(0)}px;--d:${(2.2 + rnd[i * 3 + 2] * 3).toFixed(1)}s;--dl:${(rnd[i] * 4).toFixed(1)}s;--s:${(0.6 + rnd[i + 1] * 0.9).toFixed(2)}"></i>`).join('');
  const burst = Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * Math.PI * 2 + rnd[60 + i] * 0.4; const r = 70 + rnd[80 + i] * 80; return `<i style="--x:${(Math.cos(a) * r).toFixed(0)}px;--y:${(Math.sin(a) * r * 0.7).toFixed(0)}px;--dl:${(rnd[100 + i] * 120).toFixed(0)}ms"></i>`; }).join('');
  const kin = [...C.kin].map((ch, i) => `<span class="k" style="--dl:${i * T.kinStep}ms">${esc(ch)}</span>`).join('');
  const words = C.title.split(' ').map((w, i) => `<span class="w" style="--dl:${140 + i * 130}ms">${esc(w)}</span>`).join('');
  const digit = (k) => `<span class="d" data-k="${k}"><span>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<b>${n}</b>`).join('')}</span></span>`;
  const films = (A.films || []);
  const videos = films.map((f, i) => `<video class="v${i === 0 ? ' on' : ''}" data-i="${i}" muted loop playsinline preload="${i < 2 ? 'auto' : 'metadata'}"><source src="${f.video}" type="${f.type}"></video>`).join('');
  const thumbs = films.map((f, i) => `<span class="ft${i === 0 ? ' on' : ''}" role="button" data-i="${i}" title="${esc(f.name)}" aria-label="${esc(f.name)}"><img src="${f.thumb}" alt="" draggable="false"></span>`).join('');
  const runtime = { url: B.url, t: T, per: C.perPrice, total: C.totalPrice, perLabel: C.perLabel, totalLabel: C.totalLabel, perSub: C.perSub, totalSub: C.totalSub, films: films.map((f) => f.name) };

  return `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=970,height=250">
<meta name="viewport" content="width=970">
<title>KFC – KFSOOO Menüler: Yeni Çifte Cruncher Menü (970x250)</title>
<style>
${A.fontCss}
:root{--red:${B.red};--px:0;--py:0;--rx:0deg;--ry:0deg}
html,body{margin:0;padding:0;background:#fff}
#ad{position:relative;width:970px;height:250px;overflow:hidden;overflow:clip;background:#120404;cursor:pointer;font-family:'${TF}',Arial,sans-serif;color:#fff;user-select:none;-webkit-user-select:none;outline:none;-webkit-tap-highlight-color:transparent;touch-action:pan-y}
#ad *{box-sizing:border-box}
#ad:focus-visible{box-shadow:inset 0 0 0 3px #fff}
.stage{position:absolute;inset:0;transition:opacity .45s}
.out .stage{opacity:0}
.shake .stage{animation:shake .32s}
@keyframes shake{0%,100%{transform:translate(0,0)}20%{transform:translate(-3px,2px)}40%{transform:translate(3px,-2px)}60%{transform:translate(-2px,3px)}80%{transform:translate(2px,-3px)}}
/* Filmler */
.films{position:absolute;inset:0;overflow:hidden;background:#120404}
.films .poster{position:absolute;left:-20px;top:-20px;width:1010px;height:290px;object-fit:cover}
.films video{position:absolute;left:50%;top:50%;width:104%;height:104%;object-fit:cover;transform:translate(calc(-50% + var(--px) * -6px),calc(-50% + var(--py) * -4px));opacity:0;transition:opacity .45s}
.films video.on.ok{opacity:1}
.films video.in{animation:punch .75s cubic-bezier(.2,.8,.2,1) both}
@keyframes punch{from{transform:translate(-50%,-50%) scale(1.16)}to{transform:translate(-50%,-50%) scale(1)}}
.kv{position:absolute;left:${P.left}px;top:${kvTop.toFixed(1)}px;width:${P.width}px;opacity:0;transform:scale(1.18);pointer-events:none;transition:opacity .3s}
.beat-split .kv{opacity:1;transform:scale(1);transition:opacity .35s,transform 2.6s cubic-bezier(.2,.6,.2,1)}
.flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:8}
.flash.go{animation:flash .34s ease-out both}
@keyframes flash{0%{opacity:.9}100%{opacity:0}}
.tint{position:absolute;inset:0;pointer-events:none;background:linear-gradient(90deg,rgba(18,4,4,.94) 0,rgba(18,4,4,.72) 300px,rgba(18,4,4,0) 470px,rgba(18,4,4,0) 610px,rgba(18,4,4,.55) 790px,rgba(18,4,4,.88) 100%),linear-gradient(180deg,rgba(0,0,0,.4),transparent 28%,transparent 70%,rgba(0,0,0,.6))}
.beat-split .tint{background:linear-gradient(90deg,rgba(18,4,4,1) 0,rgba(18,4,4,1) 345px,rgba(18,4,4,0) 450px),linear-gradient(180deg,rgba(0,0,0,.35),transparent 30%,transparent 70%,rgba(0,0,0,.5))}
.sparks{position:absolute;inset:0;pointer-events:none}
.spk{position:absolute;width:3px;height:3px;border-radius:50%;background:#ffe2b0;box-shadow:0 0 6px 2px rgba(255,130,60,.55);opacity:0;animation:tw var(--d) ease-in-out var(--dl) infinite}
@keyframes tw{0%,100%{opacity:0;transform:scale(.3)}50%{opacity:.95;transform:scale(var(--s))}}
/* Kinetik KFSOOO */
.kinw{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);text-align:center;z-index:6;pointer-events:none}
.kin{display:inline-block;font:400 150px/1 '${HF}',Impact,sans-serif;letter-spacing:2px;color:#fff;-webkit-text-stroke:3px var(--red);paint-order:stroke fill;transform:skewX(-8deg);text-shadow:0 12px 34px rgba(0,0,0,.65)}
.k{display:inline-block;opacity:0}
.kin-on .k{animation:kslam .36s cubic-bezier(.2,.9,.3,1.35) var(--dl) both}
@keyframes kslam{0%{opacity:0;transform:scale(3.4) translateY(-30px);filter:blur(8px)}65%{opacity:1;transform:scale(.93);filter:blur(0)}100%{opacity:1;transform:scale(1)}}
.kin-out .kinw{animation:kout .55s cubic-bezier(.6,0,.3,1) both}
@keyframes kout{to{opacity:0;transform:translate(-330px,-160px) scale(.28)}}
/* Sol sütun */
.left{position:absolute;left:22px;top:0;width:340px;height:250px;z-index:4}
.sticker{position:absolute;left:-4px;top:14px;width:290px;opacity:0;transform-origin:50% 50%;filter:drop-shadow(0 8px 16px rgba(0,0,0,.55))}
.sticker img{display:block;width:100%;height:auto}
.show-sticker .sticker{animation:slap .7s cubic-bezier(.2,.9,.3,1.25) both}
@keyframes slap{0%{opacity:0;transform:rotate(-16deg) scale(2) translateY(-30px)}55%{opacity:1;transform:rotate(-2deg) scale(.95)}78%{transform:rotate(-5deg) scale(1.03)}100%{opacity:1;transform:rotate(-4deg) scale(1)}}
.sticker:hover{animation:wiggle .55s ease-in-out}
@keyframes wiggle{0%,100%{transform:rotate(-4deg)}25%{transform:rotate(-1deg) scale(1.03)}50%{transform:rotate(-7deg)}75%{transform:rotate(-2deg)}}
.gloss{position:absolute;inset:0;pointer-events:none;-webkit-mask:url(${A.sticker}) center/100% 100% no-repeat;mask:url(${A.sticker}) center/100% 100% no-repeat;background:linear-gradient(112deg,transparent 35%,rgba(228,0,43,.28) 48%,rgba(255,200,200,.5) 52%,transparent 65%);background-size:260% 100%;background-repeat:no-repeat;animation:gl 3.4s ease-in-out 1.6s infinite}
@keyframes gl{0%{background-position:130% 0}45%,100%{background-position:-130% 0}}
.title{position:absolute;left:2px;top:110px;white-space:nowrap;transition:opacity .3s}
.yeni{display:inline-block;vertical-align:top;margin:6px 8px 0 0;padding:4px 8px 3px;border-radius:5px;background:var(--red);color:#fff;font:400 15px/1 '${HF}',Impact,sans-serif;letter-spacing:1px;opacity:0;transform:scale(.4) rotate(-10deg);position:relative}
.show-title .yeni{animation:pop .5s cubic-bezier(.2,1.4,.4,1) both}
.yeni::after{content:'';position:absolute;inset:-3px;border-radius:7px;border:2px solid var(--red);opacity:0}
.show-title .yeni::after{animation:ring 2.2s ease-out .6s infinite}
@keyframes ring{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.5)}}
@keyframes pop{to{opacity:1;transform:none}}
.w{display:inline-block;vertical-align:top;margin-right:8px;font:400 33px/1 '${HF}',Impact,sans-serif;letter-spacing:.5px;color:#fff;text-shadow:-2px -2px 0 #140404,2px -2px 0 #140404,-2px 2px 0 #140404,2px 2px 0 #140404,0 -2px 0 #140404,0 2px 0 #140404,-2px 0 0 #140404,2px 0 0 #140404,0 6px 14px rgba(0,0,0,.5);opacity:0;transform:translateX(-70px);filter:blur(8px)}
.w:nth-child(odd){transform:translateX(70px)}
.show-title .w{animation:win .5s cubic-bezier(.2,.9,.3,1) var(--dl) both}
@keyframes win{to{opacity:1;transform:none;filter:blur(0)}}
.ctarow{position:absolute;left:2px;top:186px;display:flex;align-items:center;gap:8px}
.ctaw{opacity:0;transform:scale(.7)}
.show-cta .ctaw{animation:ctain .55s cubic-bezier(.2,1.3,.4,1) both}
@keyframes ctain{to{opacity:1;transform:none}}
.cta{position:relative;overflow:hidden;display:inline-block;padding:11px 18px;border-radius:24px;background:var(--red);color:#fff;font:700 14px/1 '${TF}',Arial,sans-serif;white-space:nowrap;box-shadow:0 8px 22px rgba(228,0,43,.45);transition:transform .25s,box-shadow .25s}
.cta::after{content:'';position:absolute;top:-50%;left:-60%;width:40%;height:200%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.6),transparent);transform:skewX(-20deg);animation:sheen 2.8s ease-in-out 1s infinite}
@keyframes sheen{0%{left:-60%}35%,100%{left:140%}}
#ad:hover .cta{transform:scale(1.05);box-shadow:0 10px 28px rgba(228,0,43,.65)}
.cta i{font-style:normal;display:inline-block;margin-left:7px;transition:transform .25s}
#ad:hover .cta i{transform:translateX(4px)}
.info{width:26px;height:26px;border-radius:50%;border:1.5px solid rgba(255,255,255,.55);display:flex;align-items:center;justify-content:center;font:700 13px/1 Georgia,serif;font-style:italic;color:#fff;opacity:0;transition:background .25s,border-color .25s}
.show-cta .info{animation:ctain .5s .15s both}
.info:hover,.legal-open .info{background:#fff;color:var(--red);border-color:#fff}
/* Ürün (sitedeki şeffaf fotoğraf) – 3B eğim */
.prodw{position:absolute;left:452px;top:4px;width:264px;height:242px;z-index:5;perspective:900px;opacity:0;transition:opacity .3s}
.show-prod .prodw{animation:pin .95s cubic-bezier(.2,1.12,.35,1) both}
@keyframes pin{0%{opacity:0;transform:translateX(340px) rotate(22deg) scale(.5)}100%{opacity:1;transform:none}}
.prod3{width:100%;height:100%;transform:rotateY(var(--ry)) rotateX(var(--rx));transition:transform .3s ease-out;transform-style:preserve-3d;position:relative}
.prod3 .fl{width:100%;height:100%;animation:float 4.6s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.prod3 img{display:block;width:100%;height:100%;object-fit:contain;filter:drop-shadow(0 28px 26px rgba(0,0,0,.62));transition:transform .35s cubic-bezier(.2,1.2,.4,1)}
.prodw:hover .prod3 img{transform:scale(1.07)}
.plbl{position:absolute;left:50%;bottom:6px;transform:translate(-50%,10px);background:#fff;color:#111;font:700 12px/1 '${TF}',Arial,sans-serif;padding:7px 11px;border-radius:20px;opacity:0;transition:.25s;white-space:nowrap;box-shadow:0 6px 14px rgba(0,0,0,.45);pointer-events:none}
.prodw:hover .plbl{opacity:1;transform:translate(-50%,0)}
.burst{position:absolute;left:584px;top:126px;z-index:6;pointer-events:none}
.burst i{position:absolute;width:6px;height:6px;border-radius:50%;background:#ffd9a0;box-shadow:0 0 8px 2px rgba(255,140,60,.8);opacity:0}
.show-burst .burst i{animation:bst .85s cubic-bezier(.1,.8,.3,1) var(--dl) both}
@keyframes bst{0%{opacity:1;transform:translate(0,0) scale(1.3)}100%{opacity:0;transform:translate(var(--x),var(--y)) scale(.2)}}
.steam{position:absolute;left:504px;top:-70px;width:130px;height:150px;pointer-events:none;z-index:4;filter:url(#haze);opacity:0;transition:opacity 1.2s .5s}
.show-prod .steam{opacity:1}
.steam i{position:absolute;bottom:0;left:24px;width:72px;height:120px;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.28),rgba(255,255,255,0));filter:blur(7px);opacity:0;animation:rise 3.6s ease-out infinite}
.steam i:nth-child(2){left:0;width:60px;animation-delay:1.2s}
.steam i:nth-child(3){left:50px;width:56px;animation-delay:2.4s}
@keyframes rise{0%{opacity:0;transform:translateY(24px) scale(.7)}25%{opacity:1}100%{opacity:0;transform:translateY(-120px) scale(1.5)}}
/* Sağ sütun: fiyat + film şeridi */
.right{position:absolute;right:20px;top:0;width:250px;height:250px;z-index:5;text-align:right;transform:translateX(calc(var(--px) * 4px));transition:opacity .3s}
.toggle{position:absolute;right:0;top:15px;display:flex;gap:4px;opacity:0;transform:translateY(-8px)}
.show-price .toggle{animation:down .5s ease-out both}
@keyframes down{to{opacity:1;transform:none}}
.tg{padding:6px 10px;border-radius:14px;border:1px solid rgba(255,255,255,.4);font:700 11px/1 '${TF}',Arial,sans-serif;color:#fff;background:rgba(255,255,255,.08);transition:.25s;backdrop-filter:blur(3px)}
.tg.on{background:#fff;color:var(--red);border-color:#fff;box-shadow:0 4px 12px rgba(0,0,0,.35)}
.tg:hover{transform:translateY(-2px)}
.price{position:absolute;right:0;top:44px;height:76px;white-space:nowrap;opacity:0}
.show-price .price{animation:pslam .5s cubic-bezier(.2,.9,.3,1.3) both}
@keyframes pslam{0%{opacity:0;transform:scale(2.8)}60%{opacity:1;transform:scale(.95)}100%{opacity:1;transform:scale(1)}}
.d{display:inline-block;height:76px;overflow:hidden;vertical-align:top;transition:width .6s cubic-bezier(.2,.8,.2,1);text-align:center;font:400 84px/76px '${HF}',Impact,sans-serif;color:#fff;-webkit-text-stroke:2.5px #140404;paint-order:stroke fill;text-shadow:0 8px 18px rgba(0,0,0,.5)}
.d>span{display:block;transition:transform .9s cubic-bezier(.2,.8,.2,1)}
.d b{display:block;height:76px;font-weight:400;width:max-content;margin:0 auto}
.tl{display:inline-block;vertical-align:top;margin:8px 0 0 4px;font:400 34px/1 '${HF}',Impact,sans-serif;color:#fff;-webkit-text-stroke:1.5px #140404;paint-order:stroke fill}
.shock{position:absolute;right:76px;top:52px;width:64px;height:64px;border-radius:50%;border:3px solid #fff;opacity:0;pointer-events:none;z-index:6}
.show-price .shock{animation:shock .75s ease-out both}
@keyframes shock{0%{opacity:.9;transform:scale(.4)}100%{opacity:0;transform:scale(3)}}
.plabel{position:absolute;right:2px;top:126px;font:700 13px/1 '${TF}',Arial,sans-serif;color:#fff;letter-spacing:.3px;opacity:0;transform:translateY(6px)}
.show-price .plabel{animation:down .5s .2s ease-out both}
.plabel b{color:#ffd0d8}
.psub{position:absolute;right:2px;top:146px;font:500 12px/1 '${TF}',Arial,sans-serif;color:rgba(255,255,255,.85);opacity:0;transform:translateY(6px)}
.show-sub .psub{animation:down .5s ease-out both}
.psub b{color:#fff;font-weight:700}
.cola{position:absolute;right:2px;top:166px;height:22px;opacity:0}
.show-cta .cola{animation:down .6s .2s ease-out both}
.strip{position:absolute;right:0;top:198px;display:flex;gap:8px;opacity:0;align-items:center}
.show-cta .strip{animation:down .5s .25s ease-out both}
.strip .sl{font:700 9px/1 '${TF}',Arial,sans-serif;letter-spacing:1px;color:rgba(255,255,255,.7);margin-right:2px;text-transform:uppercase}
.ft{position:relative;width:26px;height:26px;border-radius:50%;overflow:hidden;border:2px solid rgba(255,255,255,.45);opacity:.65;transition:.25s;cursor:pointer}
.ft img{width:100%;height:100%;object-fit:cover;display:block}
.ft.on{opacity:1;border-color:#fff;transform:scale(1.18);box-shadow:0 0 0 3px rgba(228,0,43,.65)}
.ft:hover{opacity:1;transform:scale(1.18)}
.ft::after{content:'';position:absolute;left:0;bottom:0;height:3px;width:0;background:var(--red)}
.ft.on::after{animation:prog ${T.montage}ms linear both}
@keyframes prog{to{width:100%}}
/* İkiye bölünme anı (KV) */
.split{position:absolute;inset:0;z-index:7;pointer-events:none;opacity:0;transition:opacity .3s}
.beat-split .split{opacity:1}
.bar{position:absolute;left:50%;top:0;width:4px;height:0;margin-left:-2px;background:#fff;box-shadow:0 0 16px 2px var(--red)}
.beat-bar .bar{animation:bar .45s cubic-bezier(.2,.8,.2,1) both}
@keyframes bar{to{height:100%}}
.sl2{position:absolute;top:50%;transform:translateY(-50%);font:400 78px/1 '${HF}',Impact,sans-serif;color:#fff;-webkit-text-stroke:2.5px #140404;paint-order:stroke fill;opacity:0;text-align:center;text-shadow:0 8px 20px rgba(0,0,0,.6);white-space:nowrap}
.sl2 small{display:block;font:700 12px/1 '${TF}',Arial,sans-serif;letter-spacing:2px;-webkit-text-stroke:0;margin-top:6px;color:#ffd0d8}
.sl2.l{left:235px}.sl2.r{right:235px}
.beat-labels .sl2{animation:slin .45s cubic-bezier(.2,1.3,.4,1) both}
.beat-labels .sl2.r{animation-delay:.12s}
@keyframes slin{0%{opacity:0;transform:translateY(-50%) scale(2.2)}100%{opacity:1;transform:translateY(-50%) scale(1)}}
.beat-merge .sl2.l{animation:mL .55s cubic-bezier(.6,0,.3,1) both}
.beat-merge .sl2.r{animation:mR .55s cubic-bezier(.6,0,.3,1) both}
@keyframes mL{to{opacity:0;transform:translate(190px,-50%) scale(.6)}}
@keyframes mR{to{opacity:0;transform:translate(-190px,-50%) scale(.6)}}
.beat-merge .bar{animation:barout .4s .3s ease-in both}
@keyframes barout{to{height:0;top:50%}}
.total{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;opacity:0;white-space:nowrap}
.total b{display:block;font:400 100px/1 '${HF}',Impact,sans-serif;color:#fff;-webkit-text-stroke:3px #140404;paint-order:stroke fill;text-shadow:0 10px 24px rgba(0,0,0,.6);font-weight:400}
.total small{display:block;font:700 13px/1 '${TF}',Arial,sans-serif;letter-spacing:3px;color:#ffd0d8;margin-top:8px}
.beat-merge .total{animation:tin .55s .45s cubic-bezier(.2,1.3,.4,1) both}
@keyframes tin{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
.beat-split .prodw,.beat-split .right,.beat-split .title,.beat-split .steam,.beat-split .burst{opacity:0!important}
/* Yasal şerit + tam metin */
.legal{position:absolute;left:0;right:0;bottom:0;height:15px;padding:0 10px 0 22px;background:rgba(10,2,2,.72);font:400 8px/15px Arial,Helvetica,sans-serif;color:rgba(255,255,255,.85);white-space:nowrap;overflow:hidden;z-index:5;opacity:0}
.show-cta .legal{animation:down .5s .3s ease-out both}
.legalbox{position:absolute;left:0;right:0;bottom:0;padding:12px 44px 14px 22px;background:rgba(14,3,3,.97);color:#fff;font:500 10.5px/1.4 '${TF}',Arial,sans-serif;transform:translateY(102%);transition:transform .45s cubic-bezier(.2,.9,.3,1);z-index:9;cursor:default;border-top:1px solid rgba(255,255,255,.15)}
.legalbox b{display:block;font:400 14px/1 '${HF}',Impact,sans-serif;letter-spacing:1px;margin-bottom:6px;color:#ffd0d8}
.legalbox .x{position:absolute;right:12px;top:10px;width:22px;height:22px;border-radius:50%;background:rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;font:700 12px/1 Arial,sans-serif;cursor:pointer}
.legalbox .x:hover{background:var(--red)}
.legal-open .legalbox{transform:none}
/* Tekrar */
.replay{position:absolute;right:14px;top:14px;height:28px;padding:0 12px 0 10px;border-radius:14px;background:rgba(0,0,0,.55);border:1px solid rgba(255,255,255,.45);color:#fff;display:none;align-items:center;gap:6px;font:700 11px/1 '${TF}',Arial,sans-serif;z-index:10}
.replay:hover{background:var(--red);border-color:var(--red)}
.ended .replay{display:flex}
.ended .toggle{top:48px}.ended .price{top:78px}.ended .plabel{top:160px}.ended .psub{display:none}.ended .cola{top:182px}.ended .strip{display:none}
.rm *{animation-duration:.01ms!important;animation-delay:0s!important;transition-duration:.01ms!important}
</style>
</head>
<body>
<div id="ad" role="link" tabindex="0" aria-label="${esc(C.aria)}">
  <svg width="0" height="0" style="position:absolute" aria-hidden="true"><filter id="haze" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="3"><animate attributeName="baseFrequency" dur="7s" values="0.012 0.03;0.016 0.036;0.012 0.03" repeatCount="indefinite"/></feTurbulence><feDisplacementMap in="SourceGraphic" scale="9" xChannelSelector="R" yChannelSelector="G"/></filter></svg>
  <div class="stage">
    <div class="films"><img class="poster" src="${A.bg}" alt="">${videos}</div>
    <img class="kv" src="${A.photo}" alt="" draggable="false">
    <div class="tint"></div>
    <div class="sparks">${sparks}</div>
    <div class="steam"><i></i><i></i><i></i></div>
    <div class="kinw"><div class="kin">${kin}</div></div>
    <div class="left">
      <div class="sticker"><img src="${A.sticker}" alt="KFSOOO Menüler" draggable="false"><i class="gloss"></i></div>
      <div class="title"><span class="yeni">${esc(C.yeni)}</span>${words}</div>
      <div class="ctarow"><div class="ctaw"><span class="cta">${esc(C.cta)}<i>→</i></span></div><span class="info" role="button" aria-label="${esc(C.infoLabel)}" title="${esc(C.infoLabel)}">i</span></div>
    </div>
    <div class="prodw"><div class="prod3"><div class="fl"><img src="${A.product}" alt="${esc(C.productName)}" draggable="false"></div><span class="plbl">${esc(C.productName)}</span></div></div>
    <div class="burst">${burst}</div>
    <div class="right">
      <div class="toggle"><span class="tg on" role="button" data-m="0">${esc(C.perLabel)}</span><span class="tg" role="button" data-m="1">${esc(C.totalLabel)}</span></div>
      <div class="price">${digit(0)}${digit(1)}${digit(2)}<span class="tl">TL</span></div>
      <div class="shock"></div>
      <div class="plabel"><b>${esc(C.perLabel)}</b></div>
      <div class="psub">${C.perSub}</div>
      <img class="cola" src="${A.cola}" alt="Coca-Cola">
      <div class="strip"><span class="sl">Film</span>${thumbs}</div>
    </div>
    <div class="split"><div class="bar"></div><div class="sl2 l">${C.perPrice} TL<small>${esc(C.splitTag)}</small></div><div class="sl2 r">${C.perPrice} TL<small>${esc(C.splitTag)}</small></div><div class="total"><b>${C.totalPrice} TL</b><small>${esc(C.totalTag)}</small></div></div>
    <div class="legal">${esc(C.legalStrip)}</div>
  </div>
  <div class="flash"></div>
  <div class="legalbox"><b>${esc(C.infoLabel).toUpperCase()}</b>${esc(C.legalFull)}<span class="x" role="button" aria-label="Kapat">×</span></div>
  <div class="replay" role="button">↻ ${esc(C.replay)}</div>
</div>
<script>
(function(){
var D=${JSON.stringify(runtime)},T=D.t;
var ad=document.getElementById('ad'),vids=[].slice.call(ad.querySelectorAll('.films video')),fts=[].slice.call(ad.querySelectorAll('.ft')),fl=ad.querySelector('.flash'),digits=[].slice.call(ad.querySelectorAll('.d>span')),tgs=[].slice.call(ad.querySelectorAll('.tg')),plabel=ad.querySelector('.plabel b'),psub=ad.querySelector('.psub'),legalbox=ad.querySelector('.legalbox'),info=ad.querySelector('.info');
var timers=[],loops=0,mode=0,hold=0,fi=0,fhold=0,swiped=false;
var CLS=['kin-on','kin-out','show-sticker','show-title','show-prod','show-burst','show-price','show-sub','show-cta','beat-split','beat-bar','beat-labels','beat-merge','out','ended','legal-open','shake'];
function after(ms,fn){var id=setTimeout(fn,Math.max(0,ms));timers.push(id);return id}
function clearAll(){for(var i=0;i<timers.length;i++)clearTimeout(timers[i]);timers=[]}
function rmc(c){ad.classList.remove(c)}
function flash(){fl.classList.remove('go');void fl.offsetWidth;fl.classList.add('go')}
function shakeTick(){ad.classList.remove('shake');void ad.offsetWidth;ad.classList.add('shake')}
/* Filmler */
function play(v){if(!v)return;var p=v.play();if(p&&p.catch)p.catch(function(){})}
vids.forEach(function(v){v.addEventListener('playing',function(){v.classList.add('ok')});v.addEventListener('error',function(){v.classList.remove('ok')},true)});
function setFilm(i,user,silent){if(!vids.length)return;i=(i+vids.length)%vids.length;var prev=vids[fi];fi=i;var v=vids[i];
  if(!silent)flash();
  v.classList.remove('in');v.classList.add('on');void v.offsetWidth;if(!silent)v.classList.add('in');
  try{v.currentTime=0}catch(e){}play(v);
  vids.forEach(function(o){if(o!==v){o.classList.remove('on');if(!o.paused)o.pause()}});
  fts.forEach(function(t,k){t.classList.remove('on');if(k===i){void t.offsetWidth;t.classList.add('on')}});
  if(user)fhold=Date.now()+9000}
fts.forEach(function(t,k){t.addEventListener('pointerenter',function(){if(k!==fi)setFilm(k,true)});t.addEventListener('click',function(e){e.stopPropagation();setFilm(k,true)})});
/* Fiyat */
var DW=[];function measure(){DW=[];var bs=digits[0].querySelectorAll('b');for(var i=0;i<10;i++)DW.push(bs[i].getBoundingClientRect().width)}
function setDigits(n){measure();var s=('000'+n).slice(-3);for(var i=0;i<3;i++){digits[i].style.transitionDelay=(i*110)+'ms';digits[i].style.transform='translateY('+(-(+s[i])*76)+'px)';digits[i].parentNode.style.width=(DW[+s[i]]+1)+'px'}}
function setMode(m,user){mode=m?1:0;tgs.forEach(function(t,k){t.classList.toggle('on',k===mode)});setDigits(mode?D.total:D.per);plabel.textContent=mode?D.totalLabel:D.perLabel;psub.innerHTML=mode?D.totalSub:D.perSub;if(user)hold=Date.now()+8000}
tgs.forEach(function(t,k){t.addEventListener('pointerenter',function(){setMode(k,true)});t.addEventListener('click',function(e){e.stopPropagation();setMode(k,true)})});
/* Zaman çizelgesi */
function reset(){clearAll();for(var i=0;i<CLS.length;i++)ad.classList.remove(CLS[i]);setDigits(0);mode=0;tgs[0].classList.add('on');tgs[1].classList.remove('on');plabel.textContent=D.perLabel;psub.innerHTML=D.perSub;void ad.offsetWidth}
function start(){reset();setFilm(0,false,true);
  after(80,flash);
  after(T.kin,function(){ad.classList.add('kin-on');for(var i=0;i<D.films.length+2;i++)after(i*T.kinStep+200,shakeTick)});
  after(T.kinOut,function(){ad.classList.add('kin-out')});
  after(T.sticker,function(){ad.classList.add('show-sticker')});
  after(T.film1,function(){setFilm(1)});
  after(T.title,function(){ad.classList.add('show-title')});
  after(T.product,function(){ad.classList.add('show-prod')});
  after(T.burst,function(){ad.classList.add('show-burst')});
  after(T.price,function(){ad.classList.add('show-price');shakeTick();after(90,function(){setDigits(D.per)})});
  after(T.sub,function(){ad.classList.add('show-sub')});
  after(T.split,function(){ad.classList.add('beat-split')});
  after(T.bar,function(){ad.classList.add('beat-bar')});
  after(T.sideLabels,function(){ad.classList.add('beat-labels')});
  after(T.merge,function(){ad.classList.add('beat-merge');after(500,shakeTick)});
  after(T.endFrame,function(){['beat-split','beat-bar','beat-labels','beat-merge'].forEach(rmc);setMode(1);setFilm(2);ad.classList.add('show-cta')});
  after(T.autoPer,function(){if(Date.now()>hold)setMode(0)});
  after(T.film3,function(){if(Date.now()>fhold)setFilm(3)});
  after(T.autoTotal,function(){if(Date.now()>hold)setMode(1)});
  after(T.film0,function(){if(Date.now()>fhold)setFilm(0)});
  after(T.hold,function(){loops++;if(loops>=T.loops){ad.classList.add('ended');return}ad.classList.add('out');after(500,start)});
}
/* Yasal */
function openLegal(o){ad.classList.toggle('legal-open',o)}
info.addEventListener('pointerenter',function(){openLegal(true)});
info.addEventListener('click',function(e){e.stopPropagation();openLegal(!ad.classList.contains('legal-open'))});
legalbox.addEventListener('pointerleave',function(){openLegal(false)});
legalbox.addEventListener('click',function(e){e.stopPropagation()});
legalbox.querySelector('.x').addEventListener('click',function(e){e.stopPropagation();openLegal(false)});
/* Paralaks + 3B ürün eğimi + kaydırma (swipe) */
var tx=0,ty=0,cx=0,cy=0,raf=null,drag=null;
function tick(){if(raf)return;raf=requestAnimationFrame(function(){raf=null;cx+=(tx-cx)*.1;cy+=(ty-cy)*.1;ad.style.setProperty('--px',cx.toFixed(3));ad.style.setProperty('--py',cy.toFixed(3));ad.style.setProperty('--ry',(cx*16).toFixed(1)+'deg');ad.style.setProperty('--rx',(-cy*11).toFixed(1)+'deg');if(Math.abs(tx-cx)>.002||Math.abs(ty-cy)>.002)tick()})}
ad.addEventListener('pointermove',function(e){var r=ad.getBoundingClientRect();tx=((e.clientX-r.left)/r.width-.5)*2;ty=((e.clientY-r.top)/r.height-.5)*2;tick();if(drag&&Math.abs(e.clientX-drag.x)>50&&!drag.done){drag.done=true;swiped=true;setFilm(fi+(e.clientX<drag.x?1:-1),true)}});
ad.addEventListener('pointerleave',function(){tx=0;ty=0;tick();openLegal(false);drag=null});
ad.addEventListener('pointerdown',function(e){if(e.target.closest&&(e.target.closest('.tg')||e.target.closest('.ft')||e.target.closest('.info')||e.target.closest('.legalbox')||e.target.closest('.replay')))return;drag={x:e.clientX,done:false};swiped=false});
ad.addEventListener('pointerup',function(){drag=null;if(swiped)setTimeout(function(){swiped=false},300)});
/* Tıklama / klavye */
function openLink(){var u=window.clickTag||D.url;if(window.Enabler&&window.Enabler.exit){window.Enabler.exit('CTA')}else{window.open(u,'_blank','noopener')}}
ad.addEventListener('click',function(e){var t=e.target;if(swiped)return;if(t.closest&&(t.closest('.tg')||t.closest('.ft')||t.closest('.info')||t.closest('.legalbox')||t.closest('.replay')))return;openLink()});
ad.querySelector('.replay').addEventListener('click',function(e){e.stopPropagation();loops=0;start()});
ad.addEventListener('keydown',function(e){if(e.key==='Enter'){openLink()}else if(e.key==='ArrowRight'){e.preventDefault();setFilm(fi+1,true)}else if(e.key==='ArrowLeft'){e.preventDefault();setFilm(fi-1,true)}else if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();setMode(mode?0:1,true)}else if(e.key===' '){e.preventDefault();loops=0;start()}else if(e.key==='Escape'){openLegal(false)}});
document.addEventListener('pointerdown',function(){play(vids[fi])},{once:true});
if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){setDigits(mode?D.total:D.per)})}
var rm=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(rm){ad.classList.add('rm');['show-sticker','show-title','show-prod','show-price','show-sub','show-cta','ended'].forEach(function(c){ad.classList.add(c)});setFilm(0,false,true);setDigits(D.per)}else{start()}
window.__kfsooo={start:start,setMode:setMode,setFilm:setFilm,openLegal:openLegal,state:function(){return{loops:loops,mode:mode,film:fi,cls:ad.className}}};
})();
</script>
</body>
</html>`;
};
