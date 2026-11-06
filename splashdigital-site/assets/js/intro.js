/* Splash Digital – giriş animasyonu ve "etki" kaydırma sahnesi
   Damla → halkalar → sıçrama metaforu. Parçacıklar kanvasla çizilir. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TAU = Math.PI * 2;
  var COLORS = ['124,212,255', '63,179,240', '18,125,197', '200,236,255', '255,209,102'];
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function smooth(a, b, v) { var t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }

  /* Halka hedefleri: iç içe halkalar üzerinde eşit dağılmış noktalar */
  function ringTargets(n, rings) {
    var pts = [], total = rings.reduce(function (s, r) { return s + r; }, 0);
    rings.forEach(function (r, ri) {
      var cnt = Math.round(n * r / total);
      for (var i = 0; i < cnt; i++) pts.push({ ring: ri, a: i / cnt * TAU + ri * .3, r: r });
    });
    while (pts.length < n) pts.push(pts[pts.length % (pts.length || 1)]);
    return pts.slice(0, n);
  }
  function makeCanvas(cv) {
    var ctx = cv.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), o = { ctx: ctx, w: 0, h: 0 };
    o.resize = function () {
      var r = cv.getBoundingClientRect();
      o.w = r.width; o.h = r.height; cv.width = o.w * dpr; cv.height = o.h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    o.resize();
    return o;
  }

  /* =========================================================
     1) Giriş animasyonu
     ========================================================= */
  var intro = d.getElementById('intro');
  function finishIntro() {
    root.classList.remove('intro-on');
    try { sessionStorage.setItem('sd-intro', '1'); } catch (e) {}
    d.dispatchEvent(new CustomEvent('sd:intro-done'));
  }
  if (intro) {
    if (root.classList.contains('intro-seen') || reduce) {
      intro.parentNode.removeChild(intro);
      root.classList.remove('intro-on');
    } else {
      runIntro();
    }
  }

  function runIntro() {
    var c = makeCanvas(intro.querySelector('.intro__cv')), ctx = c.ctx;
    var count = intro.querySelector('.intro__count');
    var N = window.innerWidth < 700 ? 520 : 900;
    var scale = function () { return Math.min(c.w, c.h) * .0029; };
    var targets = ringTargets(N, [26, 52, 80, 110]);
    var P = [];
    for (var i = 0; i < N; i++) {
      P.push({ x: Math.random() * c.w, y: Math.random() * c.h, vx: 0, vy: 0, t: targets[i], s: .6 + Math.random() * 1.4,
        col: COLORS[i % 7 === 0 ? 4 : Math.floor(Math.random() * 4)] });
    }
    var waves = [], t0 = performance.now(), impacted = false, revealed = false, ended = false, stopped = false;
    var T = { gather: 1300, drop: 1450, impact: 1950, brand: 2150, reveal: 3900, end: 4700 };

    var skip = intro.querySelector('.intro__skip');
    skip.addEventListener('click', function () { t0 = performance.now() - T.reveal; });
    window.addEventListener('resize', c.resize);

    function reveal() {
      revealed = true;
      intro.classList.add('is-revealing');
      d.dispatchEvent(new CustomEvent('sd:intro-reveal'));
    }
    function end() {
      ended = true; stopped = true;
      intro.classList.add('is-done');
      finishIntro();
      setTimeout(function () { if (intro.parentNode) intro.parentNode.removeChild(intro); }, 50);
    }

    (function frame(now) {
      if (stopped) return;
      requestAnimationFrame(frame);
      var t = now - t0, cx = c.w / 2, cy = c.h / 2, k = scale();
      ctx.clearRect(0, 0, c.w, c.h);

      // Sayaç
      if (count) count.textContent = ('00' + Math.round(clamp(t / T.impact, 0, 1) * 100)).slice(-3);

      // Damla düşüşü
      if (t > T.gather && t < T.impact) {
        var dp = ease(clamp((t - T.gather) / (T.impact - T.gather - 150), 0, 1));
        var dy = -40 + (cy + 40) * dp;
        var g = ctx.createLinearGradient(cx, dy - 140, cx, dy);
        g.addColorStop(0, 'rgba(124,212,255,0)'); g.addColorStop(1, 'rgba(200,236,255,.95)');
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, dy - 140); ctx.lineTo(cx, dy); ctx.stroke();
        ctx.fillStyle = '#e6f6ff'; ctx.beginPath(); ctx.arc(cx, dy, 4, 0, TAU); ctx.fill();
      }
      // Çarpma: şok dalgaları + parçacıklara itme
      if (!impacted && t >= T.impact) {
        impacted = true;
        intro.classList.add('is-impact');
        for (var w = 0; w < 4; w++) waves.push({ r: 4, v: 9 - w * 1.6, a: .9 - w * .15, delay: w * 110, born: t });
        P.forEach(function (p) {
          var dx = p.x - cx, dy2 = p.y - cy, dist = Math.sqrt(dx * dx + dy2 * dy2) || 1, f = 26 / (1 + dist * .01);
          p.vx += dx / dist * f; p.vy += dy2 / dist * f;
        });
      }
      waves.forEach(function (wv) {
        if (t - wv.born < wv.delay) return;
        wv.r += wv.v; wv.v *= .985; wv.a *= .972;
        ctx.strokeStyle = 'rgba(124,212,255,' + wv.a + ')'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.ellipse(cx, cy, wv.r, wv.r * .92, 0, 0, TAU); ctx.stroke();
      });
      if (t >= T.brand) intro.classList.add('is-brand');
      if (!revealed && t >= T.reveal) reveal();
      if (!ended && t >= T.end) end();

      // Parçacıklar
      var gather = smooth(0, T.gather, t);
      var rip = impacted ? Math.max(0, 1 - (t - T.impact) / 1600) : 0;
      for (var j = 0; j < N; j++) {
        var p = P[j], tg = p.t;
        var wob = Math.sin(t * .004 + tg.ring * 1.3 + tg.a * 3) * (2 + rip * 14);
        var rr = (tg.r * k + wob);
        var ang = tg.a + t * .00012 * (tg.ring % 2 ? -1 : 1);
        var tx = cx + Math.cos(ang) * rr, ty = cy + Math.sin(ang) * rr * .92;
        var pull = .01 + gather * .08;
        p.vx += (tx - p.x) * pull; p.vy += (ty - p.y) * pull;
        p.vx *= .86; p.vy *= .86; p.x += p.vx; p.y += p.vy;
        ctx.fillStyle = 'rgba(' + p.col + ',' + Math.min(1, .45 + p.s * .4) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 1.35, 0, TAU); ctx.fill();
      }
      // Merkez ışıması
      if (impacted) {
        var gl = ctx.createRadialGradient(cx, cy, 0, cx, cy, 90 * k * 10 / 10);
        gl.addColorStop(0, 'rgba(124,212,255,' + (.35 * Math.max(.2, rip)) + ')'); gl.addColorStop(1, 'rgba(124,212,255,0)');
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(cx, cy, 90, 0, TAU); ctx.fill();
      }
    })(performance.now());
  }

  /* =========================================================
     2) Etki sahnesi: kaydırdıkça halkalar → sıçrama → veri ağı
     ========================================================= */
  var impact = d.getElementById('impact');
  if (!impact) return;
  var lines = impact.querySelectorAll('.impact__line');
  var steps = impact.querySelectorAll('.impact__steps i');
  var stage = -1;
  function setStage(s) {
    if (s === stage) return;
    var prev = stage; stage = s;
    lines.forEach(function (l, i) { l.classList.toggle('is-active', i === s); l.classList.toggle('is-past', i < s); });
    steps.forEach(function (st, i) { st.classList.toggle('is-on', i <= s); });
    if (s === 1 && prev === 0 && scene) scene.splash();
  }
  if (reduce) { impact.classList.add('is-static'); setStage(0); return; }

  impact.classList.add('is-pinned');
  var cv = impact.querySelector('.impact__cv');
  var c2 = makeCanvas(cv), ctx2 = c2.ctx;
  var M = window.innerWidth < 700 ? 480 : 820;
  var tg2 = ringTargets(M, [30, 58, 88, 120, 150]);
  var net = [], edges = [];
  // Ağ düğümleri: kaba bir ızgara etrafında serpiştirilmiş noktalar
  for (var n = 0; n < M; n++) net.push({ x: Math.random() * 2 - 1, y: Math.random() * 2 - 1 });
  var hubs = [];
  for (var h = 0; h < 28; h++) hubs.push({ x: Math.random() * 1.8 - .9, y: Math.random() * 1.6 - .8 });
  net = net.map(function (p, i) { var hb = hubs[i % hubs.length]; return { x: hb.x + (Math.random() - .5) * .16, y: hb.y + (Math.random() - .5) * .16 }; });
  hubs.forEach(function (a, i) {
    hubs.map(function (b, j) { return { j: j, d: (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) }; })
      .filter(function (o) { return o.j !== i; }).sort(function (p, q) { return p.d - q.d; }).slice(0, 2)
      .forEach(function (o) { edges.push([i, o.j]); });
  });
  var Q = [];
  for (var q = 0; q < M; q++) Q.push({ x: 0, y: 0, vx: 0, vy: 0, s: .6 + Math.random() * 1.3, col: COLORS[q % 9 === 0 ? 4 : Math.floor(Math.random() * 4)], init: false });
  var waves2 = [], prog = 0, visible = false, tStart = performance.now();
  var scene = {
    splash: function () {
      for (var w = 0; w < 4; w++) waves2.push({ r: 6, v: 10 - w * 1.8, a: .8 - w * .14, wait: w * 7 });
      var cx = c2.w / 2, cy = c2.h / 2;
      Q.forEach(function (p) {
        var dx = p.x - cx, dy = p.y - cy, dist = Math.sqrt(dx * dx + dy * dy) || 1, f = 22 / (1 + dist * .012);
        p.vx += dx / dist * f; p.vy += dy / dist * f;
      });
    }
  };
  window.addEventListener('resize', c2.resize);
  function onScroll() {
    var r = impact.getBoundingClientRect(), span = impact.offsetHeight - window.innerHeight;
    visible = r.top < window.innerHeight && r.bottom > 0;
    prog = clamp(-r.top / (span || 1), 0, 1);
    setStage(prog < .34 ? 0 : prog < .67 ? 1 : 2);
    impact.style.setProperty('--ip', prog.toFixed(3));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  (function loop(now) {
    requestAnimationFrame(loop);
    if (!visible || d.hidden) return;
    var t = now - tStart, w = c2.w, h = c2.h, cx = w / 2, cy = h / 2, k = Math.min(w, h) * .0028;
    ctx2.clearRect(0, 0, w, h);
    var toNet = smooth(.66, .86, prog);
    var rip = stage === 1 ? .6 + Math.sin(t * .003) * .4 : .15;
    // Ağ çizgileri
    if (toNet > .02) {
      ctx2.lineWidth = 1;
      edges.forEach(function (e) {
        var a = hubs[e[0]], b = hubs[e[1]];
        ctx2.strokeStyle = 'rgba(124,212,255,' + (.28 * toNet) + ')';
        ctx2.beginPath(); ctx2.moveTo(cx + a.x * w * .46, cy + a.y * h * .42); ctx2.lineTo(cx + b.x * w * .46, cy + b.y * h * .42); ctx2.stroke();
      });
    }
    // Şok dalgaları
    waves2.forEach(function (wv) {
      if (wv.wait > 0) { wv.wait--; return; }
      wv.r += wv.v; wv.v *= .985; wv.a *= .975;
      ctx2.strokeStyle = 'rgba(124,212,255,' + wv.a + ')'; ctx2.lineWidth = 1.5;
      ctx2.beginPath(); ctx2.ellipse(cx, cy, wv.r, wv.r * .9, 0, 0, TAU); ctx2.stroke();
    });
    waves2 = waves2.filter(function (wv) { return wv.a > .02; });
    for (var i = 0; i < M; i++) {
      var p = Q[i], tg = tg2[i];
      var wob = Math.sin(t * .003 + tg.ring * 1.2 + tg.a * 4) * (2 + rip * 10);
      var ang = tg.a + t * .0001 * (tg.ring % 2 ? -1 : 1);
      var rx = cx + Math.cos(ang) * (tg.r * k + wob), ry = cy + Math.sin(ang) * (tg.r * k + wob) * .9;
      var nx = cx + net[i].x * w * .46, ny = cy + net[i].y * h * .42;
      var tx = rx + (nx - rx) * toNet, ty = ry + (ny - ry) * toNet;
      if (!p.init) { p.x = tx + (Math.random() - .5) * 40; p.y = ty + (Math.random() - .5) * 40; p.init = true; }
      p.vx += (tx - p.x) * .05; p.vy += (ty - p.y) * .05;
      p.vx *= .85; p.vy *= .85; p.x += p.vx; p.y += p.vy;
      ctx2.fillStyle = 'rgba(' + p.col + ',' + (.3 + p.s * .35) + ')';
      ctx2.beginPath(); ctx2.arc(p.x, p.y, p.s, 0, TAU); ctx2.fill();
    }
    // Merkez damla
    if (toNet < .9) {
      var gl = ctx2.createRadialGradient(cx, cy, 0, cx, cy, 70);
      gl.addColorStop(0, 'rgba(124,212,255,' + (.35 * (1 - toNet)) + ')'); gl.addColorStop(1, 'rgba(124,212,255,0)');
      ctx2.fillStyle = gl; ctx2.beginPath(); ctx2.arc(cx, cy, 70, 0, TAU); ctx2.fill();
    }
  })(performance.now());
})();
