'use strict';
/**
 * Tek şablon, üç yerleşim (rect / tall / wide).
 * Çıktı: reklam ağlarına yüklenmeye hazır, tek dosyalık (bağımsız) HTML5 banner.
 */

const SIZES = {
  '300x250': { w: 300, h: 250, layout: 'rect', label: 'Medium Rectangle' },
  '300x600': { w: 300, h: 600, layout: 'tall', label: 'Half Page' },
  '970x250': { w: 970, h: 250, layout: 'wide', label: 'Billboard' },
};

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function shade(hex, pct) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c) => Math.max(0, Math.min(255, Math.round(c + (pct / 100) * (pct > 0 ? 255 - c : c))));
  const r = f(n >> 16), g = f((n >> 8) & 255), b = f(n & 255);
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

/* ---------- SVG parçaları ---------- */

const MARK = `<svg class="mark" viewBox="0 0 40 40" aria-hidden="true">
<circle cx="20" cy="20" r="20" fill="var(--accent)"/>
<path d="M20.5 31c-.6-9.5 4.4-16.6 12.5-19-1.1 8.9-5.6 15.3-12.5 19z" fill="#0e2e68"/>
<path d="M19.5 31c.6-9.5-4.4-16.6-12.5-19 1.1 8.9 5.6 15.3 12.5 19z" fill="#3f7d3a"/>
<path d="M20 31V16" stroke="#0e2e68" stroke-width="1.2" stroke-linecap="round" opacity=".6"/>
</svg>`;

const LEAF = (cls, size, x, y, rot) =>
  `<svg class="leaf ${cls}" style="left:${x};top:${y};width:${size}px;transform:rotate(${rot}deg)" viewBox="0 0 48 48" aria-hidden="true">
<path d="M4 40C4 18 18 6 44 4c-2 26-14 38-40 36z"/>
<path d="M6 38C16 28 26 18 40 8" fill="none" stroke="#07183f" stroke-width="1.6" opacity=".5"/>
</svg>`;

function bottle(p, i) {
  const g = 'g' + i;
  const fs = p.short.length > 9 ? 10.5 : 13;
  return `<svg class="bottle" viewBox="0 0 120 200" aria-hidden="true">
<defs>
<linearGradient id="${g}b" x1="0" x2="1"><stop offset="0" stop-color="#fbf8f1"/><stop offset=".55" stop-color="#f3ecdd"/><stop offset="1" stop-color="#ddd3bf"/></linearGradient>
<linearGradient id="${g}c" x1="0" x2="1"><stop offset="0" stop-color="#1c4494"/><stop offset=".5" stop-color="#0e2e68"/><stop offset="1" stop-color="#07183f"/></linearGradient>
<linearGradient id="${g}l" x1="0" x2="1"><stop offset="0" stop-color="${p.color}"/><stop offset="1" stop-color="${shade(p.color, -22)}"/></linearGradient>
</defs>
<ellipse cx="60" cy="193" rx="40" ry="5.5" fill="#000" opacity=".35"/>
<rect x="31" y="6" width="58" height="32" rx="7" fill="url(#${g}c)"/>
<rect x="31" y="31" width="58" height="7" fill="var(--accent)"/>
<rect x="36" y="10" width="4" height="20" rx="2" fill="#fff" opacity=".12"/>
<path d="M20 58c0-8 6-14 14-14h52c8 0 14 6 14 14v118c0 8-6 14-14 14H34c-8 0-14-6-14-14z" fill="url(#${g}b)"/>
<rect x="20" y="78" width="80" height="72" fill="url(#${g}l)"/>
<rect x="20" y="78" width="80" height="2" fill="#fff" opacity=".35"/>
<rect x="20" y="148" width="80" height="2" fill="#000" opacity=".15"/>
<text x="60" y="94" text-anchor="middle" font-size="6.2" font-weight="800" letter-spacing="1.6" fill="#fff" opacity=".9">İLAÇSIZ YAŞAM</text>
<text x="60" y="117" text-anchor="middle" font-size="${fs}" font-weight="800" fill="#fff">${esc(p.short)}</text>
<line x1="42" y1="126" x2="78" y2="126" stroke="#fff" stroke-width=".8" opacity=".55"/>
<text x="60" y="138" text-anchor="middle" font-size="5.6" font-weight="600" letter-spacing="1.2" fill="#fff" opacity=".85">GIDA TAKVİYESİ</text>
<rect x="26" y="62" width="5" height="110" rx="2.5" fill="#fff" opacity=".5"/>
<rect x="91" y="62" width="3" height="110" rx="1.5" fill="#000" opacity=".05"/>
</svg>`;
}

/* ---------- CSS ---------- */

const BASE_CSS = `
:root{--forest:#0e2e68;--forest-2:#1c4494;--forest-3:#07183f;--leaf:#79a64e;--mint:#d3e6c3;--cream:#f7f5ef;--accent:#8cc05a;--accent-2:#b5dd85;--ink:#0a1d45;--pc:#79a64e;--pa:#d3e6c3;--ease:cubic-bezier(.22,.8,.26,1)}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:__W__px;height:__H__px;overflow:hidden;background:#000}
body{font-family:'Manrope',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.ad{position:relative;width:__W__px;height:__H__px;overflow:hidden;background:var(--forest);color:var(--cream);cursor:pointer;user-select:none;-webkit-user-select:none;outline:0}
.ad:focus-visible{box-shadow:inset 0 0 0 2px var(--accent)}
.bg{position:absolute;inset:0;background:radial-gradient(120% 100% at 15% 0%,var(--forest-2) 0%,var(--forest) 55%,var(--forest-3) 100%)}
.bg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.04),transparent 40%,rgba(0,0,0,.18))}
.glow{position:absolute;border-radius:50%;background:var(--pc);filter:blur(36px);opacity:.34;transition:background .9s var(--ease),opacity .6s;pointer-events:none}
.leaves{position:absolute;inset:0;pointer-events:none;overflow:hidden}
.leaf{position:absolute;fill:var(--leaf);opacity:.16}
.leaf-a{animation:drift 9s ease-in-out infinite}
.leaf-b{animation:drift 12s ease-in-out -4s infinite}
.leaf-c{animation:drift 10s ease-in-out -7s infinite}
.leaf-d{animation:drift 14s ease-in-out -2s infinite}
.brand{position:absolute;display:flex;align-items:center;gap:var(--bg-gap,8px);transition:transform .9s var(--ease),opacity .5s;transform-origin:left center;z-index:5;white-space:nowrap}
.mark{width:var(--mark);height:var(--mark);flex:none;filter:drop-shadow(0 2px 6px rgba(0,0,0,.3))}
.word{display:flex;flex-direction:column;line-height:1}
.word b{font-family:'Playfair Display',Georgia,'Times New Roman',serif;font-weight:700;font-size:var(--wm);letter-spacing:.005em;color:var(--cream)}
.word small{font-size:var(--ws);letter-spacing:.24em;text-transform:uppercase;color:var(--accent);font-weight:800;margin-top:4px}
.intro{position:absolute;text-align:center;opacity:0;transform:translateY(10px);transition:opacity .45s,transform .45s;pointer-events:none;z-index:4}
.ad[data-phase=intro] .intro{opacity:1;transform:none;transition-delay:.35s}
.intro h1{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-style:italic;color:var(--cream);line-height:1.12}
.intro h1 span{display:inline-block;opacity:0;transform:translateY(14px);animation:rise .7s var(--ease) forwards}
.intro p{color:var(--mint);font-weight:600;opacity:0;animation:rise .7s 1.1s var(--ease) forwards}
.stage{position:absolute;opacity:0;transition:opacity .6s,transform .8s var(--ease);z-index:3}
.ad[data-phase=slides] .stage,.ad[data-phase=outro] .stage{opacity:1}
.slide{position:absolute;inset:0;display:flex;justify-content:center;align-items:flex-start;opacity:0;transform-origin:var(--ox) var(--oy);transition:transform .85s var(--ease),opacity .55s,filter .55s;will-change:transform,opacity;pointer-events:none}
.slide.is-active{opacity:1;transform:none;z-index:3}
.slide.is-prev{transform:translateX(var(--sx-prev)) scale(var(--ghost-s));opacity:var(--ghost-o);filter:blur(var(--ghost-b));z-index:2}
.slide.is-next{transform:translateX(var(--sx-next)) scale(var(--ghost-s));opacity:var(--ghost-o);filter:blur(var(--ghost-b));z-index:2}
.slide.is-far-left{transform:translateX(calc(var(--sx-prev)*1.9)) scale(.5);opacity:0;z-index:1}
.slide.is-far-right{transform:translateX(calc(var(--sx-next)*1.9)) scale(.5);opacity:0;z-index:1}
.bottle-wrap{width:var(--bw);margin-top:var(--bt);position:relative;filter:drop-shadow(0 14px 18px rgba(0,0,0,.35))}
.bottle{display:block;width:100%;height:auto}
.photo{display:block;width:100%;height:calc(var(--bw)*1.667);object-fit:contain;object-position:center bottom}
.photo.on-card{background:var(--cream);border-radius:calc(var(--bw)*.12);padding:calc(var(--bw)*.07);box-shadow:inset 0 0 0 1px rgba(0,0,0,.06);height:calc(var(--bw)*1.5);margin-top:calc(var(--bw)*.16)}
.logo{display:block;height:var(--logo-h);width:auto;max-width:var(--logo-w);object-fit:contain;object-position:left center;filter:drop-shadow(0 2px 6px rgba(0,0,0,.3))}
.logo.invert{filter:brightness(0) invert(1) drop-shadow(0 2px 6px rgba(0,0,0,.3))}
.brand.plate{background:#fff;border-radius:7px;padding:var(--plate-p);box-shadow:0 6px 18px rgba(0,0,0,.28)}
.brand.plate .logo{filter:none}
.ad-photo .slide{align-items:center}
.ad-photo .bottle-wrap{margin-top:0;width:var(--pw);height:var(--ph);display:flex;align-items:flex-end;justify-content:center;filter:drop-shadow(0 12px 16px rgba(0,0,0,.4))}
.ad-photo .photo{height:100%;object-position:center}
.ad-photo .photo.on-card{height:100%;margin-top:0}
.ad-photo .slide.is-active .photo{animation:float 3.8s ease-in-out .9s infinite}
.ad-photo[data-phase=outro] .slide .photo{animation:lift 3.6s ease-in-out calc(var(--j) * .35s) infinite}
.price{display:inline-block;margin-left:7px;vertical-align:middle;color:var(--accent);font-weight:800;font-size:calc(var(--badge-fs) + 2px);letter-spacing:.02em}
.slide.is-active .bottle-wrap{animation:enter .9s var(--ease) both}
.slide.is-active .bottle{animation:float 3.8s ease-in-out .9s infinite}
.ad[data-phase=outro] .slide .bottle-wrap{animation:none}
.info{position:absolute;z-index:4;pointer-events:none}
.info-item{position:absolute;inset:0;opacity:0;transform:translateY(-6px);transition:opacity .3s,transform .3s}
.info-item.is-active{opacity:1;transform:none;transition:none}
.badge{display:inline-block;padding:var(--badge-p);border-radius:99px;background:var(--pc);color:#fff;font-size:var(--badge-fs);font-weight:800;letter-spacing:.14em;text-transform:uppercase;line-height:1;transition:background .9s var(--ease);box-shadow:0 4px 10px rgba(0,0,0,.2)}
.name{font-family:'Playfair Display',Georgia,serif;font-weight:700;color:var(--cream);line-height:1.08;font-size:var(--name-fs);margin-top:var(--name-mt)}
.claim{color:var(--mint);font-weight:600;font-size:var(--claim-fs);line-height:1.35;margin-top:var(--claim-mt)}
.info-item.is-active .badge{animation:pop .5s .3s var(--ease) both}
.info-item.is-active .name{animation:rise .6s .42s var(--ease) both}
.info-item.is-active .claim{animation:rise .6s .58s var(--ease) both}
.ad[data-phase=outro] .info,.ad[data-phase=intro] .info{opacity:0;transition:opacity .3s}
.ctrl{pointer-events:auto}
.dots{position:absolute;display:flex;gap:6px;z-index:6;opacity:0;transition:opacity .4s}
.ad[data-phase=slides] .dots{opacity:1}
.dot{width:6px;height:6px;border-radius:99px;background:rgba(255,255,255,.3);border:0;padding:0;cursor:pointer;transition:width .35s var(--ease),background .35s}
.dot:hover{background:rgba(255,255,255,.7)}
.dot.is-on{width:20px;background:var(--accent)}
.arrow{position:absolute;top:var(--arrow-y);width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.22);background:rgba(7,24,63,.72);color:var(--cream);opacity:0;transform:translateY(-50%);transition:opacity .3s,background .3s,transform .3s;cursor:pointer;display:grid;place-items:center;z-index:8;backdrop-filter:blur(3px)}
.arrow svg{width:12px;height:12px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.arrow.prev{left:var(--arrow-x)}.arrow.next{right:var(--arrow-x)}
.ad:hover .arrow{opacity:1}
.ad[data-phase=intro] .arrow{opacity:0!important}
.arrow:hover{background:var(--accent);color:var(--ink)}
.cta{position:absolute;display:inline-flex;align-items:center;justify-content:center;gap:7px;background:linear-gradient(135deg,var(--accent-2),var(--accent));color:var(--ink);font-weight:800;border-radius:99px;box-shadow:0 6px 16px rgba(0,0,0,.28);transition:transform .35s var(--ease),box-shadow .35s;white-space:nowrap;z-index:5;letter-spacing:.01em}
.cta i{display:inline-block;width:12px;height:12px;transition:transform .35s var(--ease)}
.cta i svg{width:100%;height:100%;fill:none;stroke:currentColor;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
.ad:hover .cta{transform:translateY(-2px);box-shadow:0 12px 24px rgba(0,0,0,.4)}
.ad:hover .cta i{transform:translateX(3px)}
.cta.main{opacity:0;transform:translateY(8px);transition:opacity .5s,transform .5s var(--ease),box-shadow .35s}
.ad[data-phase=slides] .cta.main{opacity:1;transform:none}
.ad[data-phase=slides]:hover .cta.main{transform:translateY(-2px)}
.legal{position:absolute;color:rgba(247,242,232,.58);font-size:var(--legal-fs);line-height:1.25;z-index:5;font-weight:500}
.outro{position:absolute;opacity:0;pointer-events:none;transition:opacity .6s;text-align:center;z-index:5}
.ad[data-phase=outro] .outro{opacity:1;transition-delay:.35s}
.outro .promo{display:inline-block;border:1px solid var(--accent);color:var(--accent);border-radius:99px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;padding:var(--promo-p);font-size:var(--promo-fs)}
.outro h2{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;color:var(--cream);line-height:1.12;font-size:var(--h2-fs);margin-top:var(--h2-mt)}
.outro .cta{position:relative;margin-top:var(--cta2-mt);animation:pulse 2.2s ease-in-out infinite}
.outro .domain{display:block;color:var(--mint);font-weight:700;letter-spacing:.06em;font-size:var(--domain-fs);margin-top:var(--domain-mt)}
.ad[data-phase=outro] .slide{opacity:1;filter:none;z-index:2;transform:translate(calc(var(--lx) + (var(--j) - var(--mid)) * var(--lg)),var(--ly)) scale(var(--ls))}
.ad[data-phase=outro] .slide .bottle{animation:lift 3.6s ease-in-out calc(var(--j) * .35s) infinite}
.progress{position:absolute;left:0;bottom:0;height:3px;width:100%;background:rgba(255,255,255,.08);z-index:7;transition:opacity .3s}
.progress i{display:block;height:100%;width:100%;background:linear-gradient(90deg,var(--accent),var(--accent-2));transform-origin:left;transform:scaleX(0)}
.ad.is-ended .progress,.ad[data-phase=intro] .progress{opacity:0}
.pause{position:absolute;right:8px;top:8px;width:18px;height:18px;border-radius:50%;background:rgba(7,24,63,.7);display:grid;place-items:center;opacity:0;transition:opacity .3s;z-index:8;pointer-events:none}
.pause:before,.pause:after{content:"";width:2px;height:7px;background:var(--cream);border-radius:1px;position:absolute;top:5.5px}
.pause:before{left:6px}.pause:after{left:10px}
.ad.is-paused:not(.is-ended) .pause{opacity:.9}
@keyframes rise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
@keyframes pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
@keyframes lift{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
@keyframes enter{from{transform:translateY(34px) rotate(-7deg);opacity:0}to{transform:none;opacity:1}}
@keyframes drift{0%,100%{translate:0 0}50%{translate:7px -12px}}
@keyframes pulse{0%,100%{box-shadow:0 6px 16px rgba(0,0,0,.28),0 0 0 0 rgba(140,192,90,.55)}60%{box-shadow:0 6px 16px rgba(0,0,0,.28),0 0 0 12px rgba(140,192,90,0)}}
@media (prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.15s!important}}
`;

const LAYOUT_CSS = {
  rect: `
.ad{--mark:22px;--wm:13px;--ws:6.5px;--bg-gap:7px;--bw:82px;--bt:6px;--ox:57px;--oy:76px;--sx-prev:-150px;--sx-next:150px;--ghost-s:.7;--ghost-o:0;--ghost-b:2px;--badge-p:3px 7px;--badge-fs:7px;--name-fs:19px;--name-mt:6px;--claim-fs:10px;--claim-mt:5px;--legal-fs:6.6px;--arrow-x:6px;--arrow-y:118px;--promo-p:4px 9px;--promo-fs:7px;--h2-fs:17px;--h2-mt:6px;--cta2-mt:10px;--domain-fs:9px;--domain-mt:8px;--lx:93px;--ly:-46px;--lg:44px;--ls:.34;--mid:2;--logo-h:26px;--logo-w:150px;--plate-p:4px 7px}
.ad-photo.ad-rect{--pw:104px;--ph:124px;--ox:68px;--oy:78px;--lx:82px;--ly:-46px;--lg:46px;--ls:.36}
.ad-photo.ad-rect .info{left:126px;width:150px}
.glow{width:180px;height:180px;left:-30px;top:20px}
.brand{left:14px;top:12px}
.ad[data-phase=intro] .brand{transform:translate(64px,52px) scale(1.55)}
.intro{left:0;right:0;top:118px;padding:0 20px}
.intro h1{font-size:17px}
.intro p{font-size:9px;margin-top:6px}
.stage{left:0;top:46px;width:300px;height:156px}
.slide{justify-content:flex-start;padding-left:16px}
.info{left:120px;top:64px;width:146px;height:112px;--name-fs:18px}
.dots{left:16px;bottom:26px}
.cta.main{right:12px;bottom:17px;font-size:9.5px;padding:7px 11px}
.legal{left:0;right:0;bottom:5px;text-align:center;padding:0 10px;font-size:6.6px;white-space:nowrap}
.outro{left:0;right:0;top:104px;padding:0 16px}
.outro .cta{font-size:10.5px;padding:8px 14px}
.outro .domain{margin-top:5px}
`,
  tall: `
.ad{--mark:34px;--wm:19px;--ws:8.5px;--bg-gap:9px;--bw:150px;--bt:10px;--ox:150px;--oy:135px;--sx-prev:-210px;--sx-next:210px;--ghost-s:.6;--ghost-o:0;--ghost-b:2px;--badge-p:5px 10px;--badge-fs:9px;--name-fs:27px;--name-mt:10px;--claim-fs:12.5px;--claim-mt:8px;--legal-fs:7.5px;--arrow-x:10px;--arrow-y:230px;--promo-p:6px 12px;--promo-fs:9px;--h2-fs:27px;--h2-mt:12px;--cta2-mt:18px;--domain-fs:11px;--domain-mt:12px;--lx:0px;--ly:6px;--lg:56px;--ls:.42;--mid:2;--logo-h:40px;--logo-w:200px;--plate-p:6px 10px}
.ad-photo.ad-tall{--pw:220px;--ph:250px;--ox:150px;--oy:150px;--lg:54px;--ls:.34;--ly:4px}
.glow{width:280px;height:280px;left:10px;top:80px}
.brand{left:50%;top:24px;transform:translateX(-50%);transform-origin:center}
.ad[data-phase=intro] .brand{transform:translate(-50%,170px) scale(1.35)}
.intro{left:0;right:0;top:270px;padding:0 26px}
.intro h1{font-size:26px}
.intro p{font-size:12px;margin-top:12px}
.stage{left:0;top:84px;width:300px;height:300px}
.info{left:24px;right:24px;top:372px;height:126px;text-align:center}
.dots{left:50%;transform:translateX(-50%);bottom:86px}
.cta.main{left:30px;right:30px;bottom:34px;font-size:13px;padding:13px 16px}
.legal{left:0;right:0;bottom:8px;text-align:center;padding:0 14px}
.outro{left:0;right:0;top:290px;padding:0 24px}
.outro .cta{font-size:13px;padding:12px 26px}
`,
  wide: `
.ad{--mark:30px;--wm:17px;--ws:7.5px;--bg-gap:9px;--bw:126px;--bt:20px;--ox:190px;--oy:125px;--sx-prev:-150px;--sx-next:150px;--ghost-s:.62;--ghost-o:.38;--ghost-b:1.2px;--badge-p:5px 10px;--badge-fs:8.5px;--name-fs:27px;--name-mt:12px;--claim-fs:13px;--claim-mt:9px;--legal-fs:7.5px;--arrow-x:10px;--arrow-y:125px;--promo-p:5px 11px;--promo-fs:8.5px;--h2-fs:24px;--h2-mt:10px;--cta2-mt:14px;--domain-fs:10px;--domain-mt:10px;--lx:0px;--ly:0px;--lg:96px;--ls:.78;--mid:2;--logo-h:42px;--logo-w:250px;--plate-p:6px 10px}
.ad-photo.ad-wide{--pw:200px;--ph:200px;--ox:190px;--oy:125px;--sx-prev:-150px;--sx-next:150px;--ghost-s:.55;--lg:118px;--ls:.56}
.glow{width:300px;height:300px;left:360px;top:-30px}
.brand{left:36px;top:36px}
.ad[data-phase=intro] .brand{transform:translate(40px,30px) scale(1.15)}
.intro{left:36px;width:300px;top:120px;text-align:left}
.intro h1{font-size:23px}
.intro p{font-size:11px;margin-top:8px}
.headline{position:absolute;left:36px;top:96px;width:290px;font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:700;font-size:23px;line-height:1.12;color:var(--cream);opacity:0;transform:translateY(8px);transition:opacity .6s,transform .6s var(--ease);z-index:5}
.ad[data-phase=slides] .headline{opacity:1;transform:none}
.stage{left:320px;top:0;width:380px;height:250px}
.arrow.prev{left:408px}.arrow.next{right:358px}
.info{left:712px;top:52px;width:230px;height:150px}
.dots{left:712px;bottom:34px}
.cta.main{left:36px;bottom:40px;font-size:12px;padding:11px 18px}
.legal{left:36px;right:36px;bottom:8px;text-align:center}
.outro{left:36px;width:290px;top:88px;text-align:left}
.outro .cta{font-size:12px;padding:11px 20px}
.outro h2{font-size:22px}
.ad[data-phase=outro] .stage{width:620px}
.ad[data-phase=outro] .slide{--ox:310px}
.ad[data-phase=outro] .slide .bottle-wrap{margin-left:0}
`,
};

/* ---------- JS motoru (bannerın içine gömülür) ---------- */

const ENGINE = `
(function(){
var D=__DATA__,n=D.products.length,T=D.timing;
var ad=document.getElementById('ad'),stage=ad.querySelector('.stage'),info=ad.querySelector('.info'),dots=ad.querySelector('.dots'),bar=ad.querySelector('.progress i');
var slides=[].slice.call(stage.children),items=[].slice.call(info.children),dotEls=[],side=[];
var idx=-1,phase='intro',acc=0,total=0,last=0,paused=false,ended=false,hover=false,hidden=false;
function dur(){return phase==='intro'?T.intro:phase==='outro'?T.outro:T.slide}
function setPhase(p){phase=p;acc=0;ad.setAttribute('data-phase',p)}
function goTo(i,d){
  d=d||1;var old=idx;idx=((i%n)+n)%n;var prev=(idx-1+n)%n,next=(idx+1)%n;
  slides.forEach(function(s,j){
    s.classList.remove('is-active','is-prev','is-next','is-far-left','is-far-right');
    if(j===idx)s.classList.add('is-active');
    else if(j===prev)s.classList.add('is-prev');
    else if(j===next)s.classList.add('is-next');
    else{
      if(old<0){var k=(j-idx+n)%n;side[j]=k<=n/2?'right':'left'}
      else if(j===old||j===(old-1+n)%n||j===(old+1)%n){side[j]=d>0?'left':'right'}
      s.classList.add(side[j]==='left'?'is-far-left':'is-far-right');
    }
    items[j].classList.toggle('is-active',j===idx);
    dotEls[j].classList.toggle('is-on',j===idx);
  });
  var p=D.products[idx];
  ad.style.setProperty('--pc',p.color);ad.style.setProperty('--pa',p.accent);
  if(phase!=='slides')setPhase('slides');else acc=0;
}
var cap=T.maxAutoplay>0?T.maxAutoplay:Infinity;
function finish(){ended=true;ad.classList.add('is-ended')}
function advance(){
  if(phase==='intro')goTo(0,1);
  else if(phase==='slides'){if(idx<n-1&&total+T.slide+T.outro<=cap)goTo(idx+1,1);else setPhase('outro')}
  else if(total+n*T.slide+T.outro<=cap)goTo(0,1);
  else finish();
}
function frame(now){
  var dt=Math.min(now-last,80);last=now;paused=hidden||(hover&&phase!=='intro');
  if(!paused&&!ended){acc+=dt;total+=dt;if(acc>=dur())advance();bar.style.transform='scaleX('+Math.min(1,acc/dur())+')'}
  ad.classList.toggle('is-paused',paused);
  requestAnimationFrame(frame);
}
function openLink(){var p=D.products[idx];var u=window.clickTag||(D.brand.deepLink&&phase==='slides'&&p&&p.url?p.url:D.brand.url);if(window.Enabler&&Enabler.exit){Enabler.exit('CTA')}else{window.open(u,'_blank','noopener')}}
function step(d){if(phase==='intro')return;goTo((idx<0?0:idx)+d,d);if(ended)bar.style.transform='scaleX(0)'}
D.products.forEach(function(p,i){
  var b=document.createElement('button');b.type='button';b.className='dot ctrl';b.setAttribute('aria-label',p.name);
  b.addEventListener('click',function(e){e.stopPropagation();goTo(i,i>=idx?1:-1)});dots.appendChild(b);dotEls.push(b);
});
[].forEach.call(ad.querySelectorAll('.arrow'),function(a){a.addEventListener('click',function(e){e.stopPropagation();step(a.classList.contains('next')?1:-1)})});
ad.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('.ctrl'))return;openLink()});
ad.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}else if(e.key==='Enter'){openLink()}});
ad.addEventListener('mousemove',function(){hover=true});
ad.addEventListener('mouseleave',function(){hover=false});
var tx=null;
ad.addEventListener('touchstart',function(e){tx=e.touches[0].clientX;hover=true},{passive:true});
ad.addEventListener('touchend',function(e){hover=false;if(tx===null)return;var dx=e.changedTouches[0].clientX-tx;tx=null;if(Math.abs(dx)>36){step(dx<0?1:-1)}},{passive:true});
document.addEventListener('visibilitychange',function(){hidden=document.hidden});
window.addEventListener('message',function(e){var m=e.data;if(m==='pause')hidden=true;else if(m==='play')hidden=false;else if(m==='restart')location.reload()});
var started=false;
function start(){if(started)return;started=true;setPhase('intro');last=performance.now();requestAnimationFrame(frame)}
// Başlatma: yükleme bitince (fontlar dahil); gömülü/srcdoc iframe gibi durumlarda load gelmezse emniyet süresi sonunda
window.addEventListener('load',function(){setTimeout(start,60)});
document.addEventListener('DOMContentLoaded',function(){setTimeout(start,900)});
if(document.readyState!=='loading')setTimeout(start,document.readyState==='complete'?0:900);
setTimeout(start,2500);
})();
`;

/* ---------- HTML ---------- */

const ARROW_SVG = (dir) => dir === 'next'
  ? `<svg viewBox="0 0 12 12"><path d="M4 2l4 4-4 4"/></svg>`
  : `<svg viewBox="0 0 12 12"><path d="M8 2L4 6l4 4"/></svg>`;
const CTA_ICON = `<i><svg viewBox="0 0 12 12"><path d="M2 6h8M6.5 2.5L10 6l-3.5 3.5"/></svg></i>`;

function render(key, data, assets) {
  const s = SIZES[key];
  if (!s) throw new Error('Bilinmeyen boyut: ' + key);
  const B = data.brand, n = data.products.length;
  const A = assets || { logo: null, products: {} };
  const utm = B.url.includes('?') ? B.url.slice(B.url.indexOf('?')) : '';
  const fmtPrice = (v) => { const num = parseFloat(v); return isNaN(num) ? '' : new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: num % 1 ? 2 : 0 }).format(num); };

  const introWords = B.headline.split(' ')
    .map((w, i) => `<span style="animation-delay:${(0.45 + i * 0.12).toFixed(2)}s">${esc(w)}</span>`).join(' ');

  const slides = data.products.map((p, i) => {
    const ph = A.products[p.key];
    const visual = ph ? `<img class="photo${ph.transparent ? '' : ' on-card'}" src="${ph.uri}" alt="">` : bottle(p, i);
    return `<div class="slide" data-i="${i}" style="--j:${i}"><div class="bottle-wrap">${visual}</div></div>`;
  }).join('\n');

  const items = data.products.map((p, i) => {
    const ph = A.products[p.key];
    const price = B.showPrice && ph && ph.price ? `<span class="price">${esc(fmtPrice(ph.price))}</span>` : '';
    return `<div class="info-item" data-i="${i}"><span class="badge">${esc(p.badge)}</span>${price}<div class="name">${esc(p.name)}</div><div class="claim">${esc(p.claim)}</div></div>`;
  }).join('\n');

  // Logo: gerçek logo varsa yaprak işareti + yazı yerine onu kullan; 300x250 açılışında ortalamak için genişliğe göre kaydırma hesapla.
  let brandInner = `${MARK}<div class="word"><b>${esc(B.name)}</b><small>${esc(B.by)}</small></div>`;
  let logoCss = '';
  let brandClass = 'brand';
  const photoMode = Object.keys(A.products).length > 0;
  if (A.logo) {
    brandInner = `<img class="logo${A.logo.invert ? ' invert' : ''}" src="${A.logo.uri}" alt="${esc(B.name)}">`;
    const LOGO = { rect: [26, 150, 14], tall: [40, 200, 20], wide: [42, 250, 20] }[s.layout];
    const plate = A.logo.plate !== false && !A.logo.invert; // koyu logo → beyaz plaka
    const lw = Math.min(LOGO[1], LOGO[0] * (A.logo.aspect || 4)) + (plate ? LOGO[2] : 0);
    if (s.layout === 'rect') logoCss = `.ad[data-phase=intro] .brand{transform:translate(${(136 - lw * 0.725).toFixed(1)}px,36px) scale(1.45)}`;
    brandClass += plate ? ' plate' : '';
  }

  const leaves = s.layout === 'wide'
    ? LEAF('leaf-a', 90, '-20px', '150px', -20) + LEAF('leaf-b', 60, '280px', '-16px', 130) + LEAF('leaf-c', 110, '880px', '140px', 40) + LEAF('leaf-d', 44, '640px', '200px', 200)
    : s.layout === 'tall'
      ? LEAF('leaf-a', 110, '-30px', '330px', -20) + LEAF('leaf-b', 70, '230px', '60px', 140) + LEAF('leaf-c', 90, '220px', '470px', 30) + LEAF('leaf-d', 50, '10px', '110px', 210)
      : LEAF('leaf-a', 80, '-20px', '150px', -20) + LEAF('leaf-b', 54, '250px', '-10px', 140) + LEAF('leaf-c', 60, '236px', '180px', 30);

  const headline = s.layout === 'wide' ? `<div class="headline">${esc(B.headline)}</div>` : '';

  const css = (BASE_CSS + LAYOUT_CSS[s.layout] + logoCss).replace(/__W__/g, s.w).replace(/__H__/g, s.h);
  const payload = JSON.stringify({ brand: { url: B.url, deepLink: B.deepLink !== false }, timing: data.timing, products: data.products.map(p => ({ name: p.name, color: p.color, accent: p.accent, url: A.products[p.key] && A.products[p.key].url ? A.products[p.key].url + utm : undefined })) });

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${s.w},height=${s.h}">
<meta name="viewport" content="width=${s.w},initial-scale=1">
<title>${esc(B.name)} – ${key}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">
<style>${css}</style>
</head>
<body>
<div id="ad" class="ad ad-${s.layout}${photoMode ? ' ad-photo' : ''}" data-phase="boot" role="link" tabindex="0" aria-label="${esc(B.name)} – ${esc(B.intro)}">
  <div class="bg"></div>
  <div class="glow"></div>
  <div class="leaves">${leaves}</div>
  <div class="${brandClass}">${brandInner}</div>
  <div class="intro"><h1>${introWords}</h1><p>${esc(B.intro)}</p></div>
  ${headline}
  <div class="stage" style="--mid:${((n - 1) / 2).toFixed(2)}">
${slides}
  </div>
  <div class="info">
${items}
  </div>
  <div class="dots ctrl" role="tablist" aria-label="Ürünler"></div>
  <button type="button" class="arrow prev ctrl" aria-label="Önceki ürün">${ARROW_SVG('prev')}</button>
  <button type="button" class="arrow next ctrl" aria-label="Sonraki ürün">${ARROW_SVG('next')}</button>
  <span class="cta main">${esc(B.cta)}${CTA_ICON}</span>
  <div class="outro">
    <span class="promo">${esc(B.promo)}</span>
    <h2>${esc(B.headline)}</h2>
    <span class="cta">${esc(B.ctaFinal)}${CTA_ICON}</span>
    <span class="domain">${esc(B.domain)}</span>
  </div>
  <div class="legal">${esc(s.layout === 'rect' && B.legalShort ? B.legalShort : B.legal)}</div>
  <div class="pause" aria-hidden="true"></div>
  <div class="progress"><i></i></div>
</div>
<script>${ENGINE.replace('__DATA__', payload)}</script>
</body>
</html>`;
}

module.exports = { render, SIZES };
