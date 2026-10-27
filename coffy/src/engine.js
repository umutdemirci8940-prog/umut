/* "Çok da Coffy" ortak banner motoru (tarayıcı). C = config, AD = {id,w,h,name}, CUPT = bardak SVG şablonu. */
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
var Q = (function () { try { return new URLSearchParams(location.search); } catch (e) { return { get: function () { return null; } }; } })();
var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var later = function (fn, ms) { return setTimeout(fn, ms); };

/* ---------- düzen: aynı dosya 970x250 (w) ve 320x480 (m) alanında çalışır ---------- */
function isM() { return window.innerWidth < 640; }
function mode() { var a = document.getElementById('ad'); a.classList.toggle('m', isM()); a.classList.toggle('w', !isM()); }
mode();
window.addEventListener('resize', mode);
function size() { return { w: window.innerWidth || (isM() ? 320 : 970), h: window.innerHeight || (isM() ? 480 : 250) }; }

/* ---------- ölçüm ---------- */
function track(ev, d) {
  try { if (window.Enabler && Enabler.counter) Enabler.counter(ev); } catch (e) { /* yok */ }
  try { parent !== window && parent.postMessage({ coffy: 1, ad: AD.id, ev: ev, d: d || null }, '*'); } catch (e) { /* yok */ }
}

/* ---------- çıkış: clickTag → Studio → MRAID → yeni sekme ---------- */
function exit(name, url) {
  url = url || C.exits.app;
  track('exit_' + name);
  if (window.Enabler && Enabler.exitOverride) { Enabler.exitOverride(name, url); return; }
  var target = window.clickTag || url;
  if (window.mraid && mraid.open) { mraid.open(target); return; }
  window.open(target, '_blank', 'noopener');
}
function bindExits(root) {
  $$('[data-exit]', root).forEach(function (b) {
    if (b._bound) return; b._bound = 1;
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var n = b.getAttribute('data-exit');
      exit(n, n === 'directions' ? dirUrl() : C.exits[n]);
    });
  });
}

/* ---------- sahne yönetimi ---------- */
function show(el) {
  if (typeof el === 'string') el = $(el);
  $$('.scene', el.parentNode).forEach(function (s) { if (s.parentNode === el.parentNode) s.classList.toggle('on', s === el); });
  track('scene_' + (el.id || 'x'));
  return el;
}

/* ---------- gün dilimi (dinamik metin) ---------- */
function daypart() {
  var f = Q.get('dp'); if (f) return f;
  var h = new Date().getHours();
  return h < 5 ? 'night' : h < 11 ? 'morning' : h < 17 ? 'noon' : h < 22 ? 'evening' : 'night';
}
function clock() {
  var f = Q.get('time'); if (f) return f;
  var d = new Date(); return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
}

/* ---------- bardak ---------- */
var _cupN = 0;
function cup(fill, tone, cls) {
  var id = AD.id + 'c' + (++_cupN);
  return CUPT.replace(/__ID__/g, id).replace('__STYLE__', '--fill:' + (fill == null ? .8 : fill) + (tone ? ';--tone:' + tone : '')).replace('__CLS__', cls || '');
}
function setFill(el, v) { (el.classList && el.classList.contains('cup') ? el : $('.cup', el)).style.setProperty('--fill', Math.max(0, Math.min(1, v))); }

function slogan() {
  return '<div class="slogan"><span class="s1">Çok da</span><span class="s2">Coffy<i>.</i>' +
    '<svg class="sw" viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M4 14 C 50 4, 120 2, 196 10"/></svg></span></div>';
}
function logo() {
  if (C.brand.logoImg) return '<span class="logo"><img src="' + C.brand.logoImg + '" alt="Coffy"></span>';
  return C.brand.logoSvg ? '<span class="logo">' + C.brand.logoSvg + '</span>' : '<span class="logo">COFFY</span>';
}

/* ---------- parçacık patlaması ---------- */
function burst(host, n, spread) {
  var b = document.createElement('div'); b.className = 'burst'; b.style.cssText = 'position:absolute;inset:0;pointer-events:none;z-index:45';
  spread = spread || 160;
  for (var i = 0; i < (n || 22); i++) {
    var p = document.createElement('i'), a = Math.random() * Math.PI * 2, r = spread * (.4 + Math.random() * .6);
    if (i % 3 === 0) { p.className = 'c'; p.style.background = ['#ffffff', '#c8864e', '#e9d1ad', '#8a5a36'][i % 4]; }
    p.style.setProperty('--x', Math.cos(a) * r + 'px'); p.style.setProperty('--y', Math.sin(a) * r + 'px');
    p.style.setProperty('--r', (Math.random() * 540 - 270) + 'deg'); p.style.animationDelay = Math.random() * .15 + 's';
    b.appendChild(p);
  }
  host.appendChild(b); later(function () { b.remove(); }, 1600);
}

/* ---------- konum ve en yakın şube ---------- */
var GEO = null;
function hav(a, b) {
  var R = 6371000, t = Math.PI / 180, dLa = (b.lat - a.lat) * t, dLo = (b.lng - a.lng) * t;
  var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) + Math.cos(a.lat * t) * Math.cos(b.lat * t) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
  return 2 * R * Math.asin(Math.sqrt(x));
}
function locate() {
  if (GEO) return GEO;
  var u = null, src = 'fallback';
  try { if (window.mraid && mraid.getLocation) { var l = mraid.getLocation(); if (l && isFinite(l.lat)) { u = { lat: +l.lat, lng: +l.lon }; src = 'mraid'; } } } catch (e) { /* MRAID 3 yok */ }
  if (!u) { var la = parseFloat(C.geo.latMacro), lo = parseFloat(C.geo.lonMacro); if (isFinite(la) && isFinite(lo)) { u = { lat: la, lng: lo }; src = 'macro'; } }
  if (!u && Q.get('lat')) { u = { lat: +Q.get('lat'), lng: +Q.get('lon') }; src = 'param'; }
  if (!u) u = { lat: C.geo.fallback.lat, lng: C.geo.fallback.lng };
  var list = C.stores.map(function (s) {
    var m = hav(u, s); return { name: s.name, area: s.area, lat: s.lat, lng: s.lng, hours: s.hours, m: m, min: Math.max(1, Math.round(m / C.geo.walkMetersPerMin)) };
  }).sort(function (a, b) { return a.m - b.m; });
  GEO = { user: u, src: src, stores: list, near: list[0] };
  track('geo_' + src);
  return GEO;
}
function fmtDist(m) { return m < 1000 ? Math.round(m / 10) * 10 + '\u00a0m' : (m / 1000).toFixed(1).replace('.', ',') + '\u00a0km'; } // birim sayıdan ayrılmasın
function dirUrl() { var s = locate().near; return C.exits.directions.replace('{lat}', s.lat).replace('{lng}', s.lng); }
var PIN = '<svg viewBox="0 0 24 24"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z"/></svg>';
function storeRow() {
  var s = locate().near;
  return '<div class="store"><span class="pinw">' + PIN + '</span><span><b>' + esc(s.name) + '</b><small>' + s.min + ' dk yürüme · ' + esc(s.hours) + smp() + '</small></span><span class="dist">' + fmtDist(s.m) + '</span></div>';
}
/** Şube verisi örnekse şube bilgisinin yanına küçük not ekler. */
function smp() { return C.storesSample ? ' · <i class="smp">örnek veri</i>' : ''; }

/* ---------- bitiş kartı (mobil) ---------- */
function endcard(el, o) {
  o = o || {};
  el.innerHTML = '<div class="end">' + (o.kicker ? '<div class="kicker k">' + o.kicker + '</div>' : '') + slogan() +
    (o.cup === false ? '' : cup(o.fill == null ? .85 : o.fill, o.tone)) +
    (o.lead ? '<p class="lead">' + o.lead + '</p>' : '') +
    '<div class="ctas">' + (o.store === false ? '' : storeRow()) +
    '<button class="btn pulse" data-exit="directions"><span class="pin">' + PIN + '</span>' + (o.cta || 'Yol tarifi al') + '</button>' +
    '<button class="btn ghost" data-exit="app">' + (o.cta2 || 'Uygulamadan sipariş ver') + '</button></div></div>';
  show(el); bindExits(el);
  requestAnimationFrame(function () { $('.end', el).classList.add('in'); });
  track('endcard');
}

/* ---------- video aşaması ---------- */
var SND_ON = '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
var SND_OFF = '<svg viewBox="0 0 24 24"><path d="M16.5 12A4.5 4.5 0 0 0 14 8v2.2l2.4 2.4.1-.6zM19 12c0 .9-.2 1.8-.5 2.6l1.5 1.5A8.9 8.9 0 0 0 21 12a9 9 0 0 0-7-8.8v2.1A7 7 0 0 1 19 12zM4.3 3 3 4.3 7.7 9H3v6h4l5 5v-6.7l4.3 4.3c-.7.5-1.4.9-2.3 1.2v2a9 9 0 0 0 3.7-1.8L19.7 21 21 19.7 4.3 3zM12 4 9.9 6.1 12 8.2V4z"/></svg>';
function placeholder(loop) {
  return '<div class="vph' + (loop ? ' loop' : '') + '"><div class="vph-bg"></div><div class="vph-grain"></div>' +
    '<div class="vph-w w1">Ders <em>09:00</em>’da.</div><div class="vph-w w2">Toplantı <em>09:01</em>’de.</div><div class="vph-w w3">Peki sen?</div>' +
    '<div class="vph-end">' + cup(.82) + slogan() + '</div><div class="vph-tag">ANA VİDEO · YER TUTUCU</div></div>';
}
function playVideo(host, done, opt) {
  opt = opt || {};
  var v = C.video, fin = false, tm, t0 = Date.now(), maxMs = (v.src ? v.maxSec : v.placeholderSec) * 1000;
  host.classList.add('vid');
  function finish(how) {
    if (fin) return; fin = true; clearTimeout(tm); track('video_' + (how || 'end'), { sec: Math.round((Date.now() - t0) / 100) / 10 });
    var el = $('video', host); if (el && !opt.loop) try { el.pause(); } catch (e) { /* yok */ }
    if (done) done();
  }
  if (v.src) {
    host.innerHTML = '<video muted playsinline webkit-playsinline autoplay ' + (opt.loop ? 'loop ' : '') + 'preload="auto"' + (v.poster ? ' poster="' + esc(v.poster) + '"' : '') + ' src="' + esc(v.src) + '"></video>' +
      '<button class="snd" aria-label="Ses">' + SND_OFF + '</button><div class="bar"></div>';
    var el = $('video', host), bar = $('.bar', host);
    el.play && el.play().catch(function () { /* otomatik oynatma engellendi */ });
    el.addEventListener('ended', function () { if (!opt.loop) finish('end'); });
    el.addEventListener('timeupdate', function () { bar.style.width = Math.min(100, el.currentTime / Math.min(el.duration || v.maxSec, v.maxSec) * 100) + '%'; });
    $('.snd', host).addEventListener('click', function (e) { e.stopPropagation(); el.muted = !el.muted; this.innerHTML = el.muted ? SND_OFF : SND_ON; track(el.muted ? 'mute' : 'unmute'); });
  } else {
    host.innerHTML = placeholder(opt.loop);
  }
  if (!opt.loop) tm = later(function () { finish('end'); }, maxMs);
  if (!opt.loop && opt.skip !== false) {
    var s = document.createElement('button'); s.className = 'skip'; s.textContent = opt.skipLabel || 'Geç ›';
    s.addEventListener('click', function (e) { e.stopPropagation(); finish('skip'); });
    host.appendChild(s); later(function () { s.classList.add('on'); }, v.skipAfterSec * 1000);
  }
  return { finish: finish };
}

/* ---------- işaretçi (dokunma + fare) ---------- */
function pt(e, el) { var r = el.getBoundingClientRect(), t = e.touches ? e.touches[0] || e.changedTouches[0] : e; return { x: t.clientX - r.left, y: t.clientY - r.top }; }

/* ---------- önizleme sayfası için yeniden başlatma ---------- */
window.addEventListener('message', function (e) { if (e.data === 'restart') location.reload(); });

/* ---------- kullanıcı bir süre etkileşmezse otomatik oynatma (demo) ---------- */
var TOUCHED = false;
document.addEventListener('pointerdown', function () { TOUCHED = true; }, true);
/** ms boyunca dokunma olmazsa fn çalışır; her dokunuş sayacı sıfırlar. Dönen fonksiyon iptal eder. */
function idle(ms, fn) {
  var t, off = function () { clearTimeout(t); document.removeEventListener('pointerdown', arm, true); };
  function arm() { clearTimeout(t); t = later(function () { off(); track('autoplay'); fn(); }, ms); }
  document.addEventListener('pointerdown', arm, true); arm();
  return off;
}

/* ---------- stilize harita ---------- */
function mapBg(w, h) {
  var s = 7, rnd = function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }, o = [];
  o.push('<rect width="' + w + '" height="' + h + '" fill="#26170f"/>');
  o.push('<path d="M0 ' + h * .78 + ' C ' + w * .25 + ' ' + h * .7 + ', ' + w * .35 + ' ' + h + ', ' + w * .6 + ' ' + h * 1.02 + ' L0 ' + h + 'Z" fill="#1c2630"/>');
  o.push('<rect x="' + w * .62 + '" y="' + h * .12 + '" width="' + w * .22 + '" height="' + h * .16 + '" rx="14" fill="#2c3220"/>');
  for (var i = 0; i < 9; i++) { var y = (i + .3 + rnd() * .4) * h / 9; o.push('<path d="M-10 ' + y + ' L' + (w + 10) + ' ' + (y + (rnd() - .5) * 30) + '" stroke="#3a2519" stroke-width="' + (i % 3 ? 3 : 7) + '"/>'); }
  for (var j = 0; j < 7; j++) { var x = (j + .3 + rnd() * .4) * w / 7; o.push('<path d="M' + x + ' -10 L' + (x + (rnd() - .5) * 40) + ' ' + (h + 10) + '" stroke="#3a2519" stroke-width="' + (j % 3 ? 3 : 7) + '"/>'); }
  o.push('<path d="M-10 ' + h * .2 + ' L' + (w + 10) + ' ' + h * .65 + '" stroke="#4a2f20" stroke-width="10"/>');
  return '<svg class="map" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid slice">' + o.join('') + '</svg>';
}
/** Şubeyi kullanıcıya göre ekrana yerleştirir (yön gerçek, mesafe ölçeklenir). */
function project(u, s, cx, cy, r) {
  var dx = (s.lng - u.lng) * Math.cos(u.lat * Math.PI / 180) * 111320, dy = -(s.lat - u.lat) * 110540, d = Math.sqrt(dx * dx + dy * dy) || 1;
  return { x: cx + dx / d * r, y: cy + dy / d * r };
}
