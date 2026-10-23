/* Watsons 11.11 – ortak reklam motoru (tıklama çıkışı, olay ölçümü, yardımcılar) */
(function () {
  'use strict';
  var D = window.AD_DATA || {};
  var W = window.W = { data: D };
  var root = document.documentElement;

  // Masaüstü 970×250 / mobil 320×480: reklam kendi alanının ölçüsüne göre yerleşim seçer
  W.mobile = function () { return window.innerWidth < 640; };
  function mode() { root.classList.toggle('m', W.mobile()); root.classList.toggle('d', !W.mobile()); }
  mode();
  addEventListener('resize', mode);

  // Çıkış: clickTag (Google Ads / DV360 / Admost) → Enabler (Studio) → yedek adres
  W.exit = function (url, label) {
    W.track('exit_' + (label || 'genel'));
    var target = window.clickTag || url || D.brand.home;
    if (window.Enabler && Enabler.exitOverride) { Enabler.exitOverride(label || 'CTA', target); return; }
    window.open(target, '_blank');
  };
  // Olay ölçümü: Studio sayaçları varsa onları, yoksa konsolu kullanır
  W.track = function (name) {
    try { if (window.Enabler && Enabler.counter) Enabler.counter(name); } catch (e) { /* yok */ }
    if (window.console && console.debug) console.debug('[watsons-ad]', name);
  };
  W.$ = function (s, el) { return (el || document).querySelector(s); };
  W.$$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  W.el = function (tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  W.wait = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  W.reduced = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  W.shuffle = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  W.price = function (p) { return p ? p + ' TL' : ''; };

  // Kampanya saati: 11.11 00:00 (Türkiye) — öncesinde geri sayım, sırasında "bitmesine", sonrasında "son gün"
  W.campaign = function () {
    var y = new Date().getFullYear();
    var start = Date.UTC(y, 10, 10, 21, 0, 0); // 11 Kasım 00:00 TSİ
    var end = Date.UTC(y, 10, 11, 21, 0, 0);   // 12 Kasım 00:00 TSİ
    var now = Date.now();
    if (D.forceNow) now = D.forceNow;
    if (now < start) return { phase: 'once', left: start - now };
    if (now < end) return { phase: 'gun', left: end - now };
    return { phase: 'sonra', left: 0 };
  };
  W.split = function (ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
  };
  W.pad = function (n) { return (n < 10 ? '0' : '') + n; };

  // Konfeti (Watsons turkuazı, pembe, altın)
  W.confetti = function (host, n, origin) {
    host = host || document.body; n = n || 70;
    var cols = ['#00a5b5', '#ff4f8b', '#ffd23f', '#ffffff', '#7a3cff'];
    var r = host.getBoundingClientRect();
    var ox = origin ? origin.x : r.width / 2, oy = origin ? origin.y : r.height / 2;
    for (var i = 0; i < n; i++) {
      var c = W.el('i', 'cf');
      var a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 220;
      c.style.cssText = 'left:' + ox + 'px;top:' + oy + 'px;background:' + cols[i % cols.length] + ';--x:' + Math.cos(a) * v + 'px;--y:' + (Math.sin(a) * v - 60) + 'px;--r:' + (Math.random() * 720 - 360) + 'deg;animation-delay:' + Math.random() * 0.12 + 's';
      host.appendChild(c);
      (function (c) { setTimeout(function () { c.remove(); }, 1600); })(c);
    }
  };

  // Kupon kodu kopyalama (çıkışı tetiklemez)
  W.copy = function (text, btn) {
    function ok() { if (btn) { var o = btn.getAttribute('data-label') || btn.innerHTML; btn.setAttribute('data-label', o); btn.innerHTML = 'Kopyalandı!'; setTimeout(function () { btn.innerHTML = o; }, 1600); } W.track('kupon_kopya'); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, ok);
    else { var t = W.el('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) { /* yok */ } t.remove(); ok(); }
  };

  // Ortak parçalar: logo, 11.11 rozeti, yasal not, CTA
  W.logo = function (cls) { return '<img class="wlogo ' + (cls || '') + '" src="' + D.brand.logo + '" alt="Watsons">'; };
  W.badge = function (cls) { return '<div class="b1111 ' + (cls || '') + '"><b>11.11</b><span>' + D.brand.event + '</span></div>'; };

  // Sürükle / kaydır: fare ve dokunmatik için tek arayüz
  W.drag = function (el, h) {
    var on = false, sx = 0, sy = 0;
    function pt(e) { var t = e.touches ? e.touches[0] || e.changedTouches[0] : e; return { x: t.clientX, y: t.clientY }; }
    function down(e) { on = true; var p = pt(e); sx = p.x; sy = p.y; if (h.start) h.start(p, e); }
    function move(e) { if (!on) return; var p = pt(e); if (h.move) h.move(p, p.x - sx, p.y - sy, e); if (e.cancelable && h.prevent !== false) e.preventDefault(); }
    function up(e) { if (!on) return; on = false; var p = pt(e); if (h.end) h.end(p, p.x - sx, p.y - sy, e); }
    el.addEventListener('mousedown', down); addEventListener('mousemove', move); addEventListener('mouseup', up);
    el.addEventListener('touchstart', down, { passive: true }); el.addEventListener('touchmove', move, { passive: false }); el.addEventListener('touchend', up);
  };

  // Tüm [data-exit] öğeleri tıklamada çıkış yapar; [data-stop] içindekiler yapmaz
  document.addEventListener('click', function (e) {
    var s = e.target.closest('[data-stop]');
    var x = e.target.closest('[data-exit]');
    // Durdurma bölgesi çıkış alanının içindeyse (kontroller) çıkış yok; bölge içindeki açık düğme çıkar
    if (x && (!s || !(x !== s && x.contains(s)))) {
      e.preventDefault(); W.exit(x.getAttribute('data-exit') || '', x.getAttribute('data-label') || 'cta');
    }
  });

  // Görseller yüklenince başlat (önizlemede boş kare görünmesin)
  W.ready = function (fn) {
    function go() {
      var imgs = W.$$('img'); var left = imgs.length; var done = false;
      function fin() { if (!done) { done = true; root.classList.add('on'); fn(); } }
      if (!left) return fin();
      imgs.forEach(function (i) { if (i.complete) { if (--left <= 0) fin(); } else { i.addEventListener('load', function () { if (--left <= 0) fin(); }); i.addEventListener('error', function () { if (--left <= 0) fin(); }); } });
      setTimeout(fin, 2500);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  };
})();
