/* Oasis Media — WebGL parçacık sahnesi (bağımlılık yok).
   Tek bir parçacık bulutu sayfa boyunca şekil değiştirir:
   açılış/hero → logodaki güneş + palmiye yaprağı, rakamlar sahnesi → 300+ / 2K+ / 10 / 145,
   iş ortakları → dönen yayıncı ağı küresi, diğer bölümler → süzülen toz, iletişim → vaha suyu dalgası.
   Her şekil bir DOM öğesine "demirlenir"; sayfa kaydıkça bulut o öğeyi takip eder. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('gl');
  if (!canvas) return;
  var gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: false });
  if (!gl) { canvas.remove(); return; }
  document.documentElement.classList.add('gl-ok');

  var css = getComputedStyle(document.documentElement);
  var hex = function (n) { var h = css.getPropertyValue(n).trim().replace('#', ''); return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255]; };
  var C = { gold: hex('--gold'), sun: hex('--sun'), ember: hex('--ember'), palm: hex('--palm'), ink: hex('--ink'), leaf: [1, 0.97, 0.92] };
  var mixc = function (a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; };
  var sunGrad = function (t) { return t < 0.45 ? mixc(C.gold, C.sun, t / 0.45) : mixc(C.sun, C.ember, (t - 0.45) / 0.55); };

  var small = Math.min(innerWidth, innerHeight) < 700;
  var N = small ? 4200 : 9000;

  /* ---------- Şekiller (yerel koordinatlar, yaklaşık -1..1) ---------- */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function shapeSun() {
    var P = new Float32Array(N * 3), Col = new Float32Array(N * 3), S = new Float32Array(N);
    var leafN = Math.floor(N * 0.22), i = 0;
    // güneş diski: logodaki gibi alt kısımda yatay boşluklar (ufuk çizgileri)
    while (i < N - leafN) {
      var x = rnd(-1, 1), y = rnd(-1, 1);
      if (x * x + y * y > 1) continue;
      var v = (1 - y) / 2; // 0 üst, 1 alt
      if ((v > 0.62 && v < 0.67) || (v > 0.73 && v < 0.77) || v > 0.83) continue;
      P[i * 3] = x; P[i * 3 + 1] = y; P[i * 3 + 2] = rnd(-0.12, 0.12) * Math.sqrt(1 - x * x - y * y);
      var c = sunGrad(Math.min(1, Math.max(0, v * 0.85 + (x + 1) * 0.12)));
      Col.set(c, i * 3); S[i] = rnd(1.1, 1.9); i++;
    }
    // palmiye yaprağı: kavisli gövde ve iki yana açılan yaprakçıklar
    var q = function (t) { var mt = 1 - t; return [mt * mt * 0.78 + 2 * mt * t * 0.25 + t * t * -0.78, mt * mt * -0.85 + 2 * mt * t * 0.3 + t * t * 0.78]; };
    for (; i < N; i++) {
      var t = Math.random(), a = q(t), b = q(Math.min(1, t + 0.01));
      var ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      var stem = Math.random() < 0.18;
      var len = stem ? 0 : (0.42 * Math.sin(Math.PI * (0.15 + t * 0.8)) + 0.05) * Math.random();
      var side = Math.random() < 0.5 ? -1 : 1, la = ang + side * 1.0;
      P[i * 3] = a[0] + Math.cos(la) * len + rnd(-0.008, 0.008);
      P[i * 3 + 1] = a[1] + Math.sin(la) * len + rnd(-0.008, 0.008);
      P[i * 3 + 2] = 0.2 + rnd(0, 0.05);
      Col.set(C.leaf, i * 3); S[i] = rnd(0.8, 1.3);
    }
    return { P: P, C: Col, S: S };
  }
  function shapeText(txt) {
    var cv = document.createElement('canvas'), w = 900, h = 360;
    cv.width = w; cv.height = h;
    var x = cv.getContext('2d');
    x.fillStyle = '#000'; x.textAlign = 'center'; x.textBaseline = 'middle';
    var fs = 300; x.font = '700 ' + fs + 'px Unbounded, "Arial Black", sans-serif';
    while (x.measureText(txt).width > w * 0.92 && fs > 60) { fs -= 10; x.font = '700 ' + fs + 'px Unbounded, "Arial Black", sans-serif'; }
    x.fillText(txt, w / 2, h / 2 + fs * 0.04);
    var d = x.getImageData(0, 0, w, h).data, pts = [];
    for (var yy = 0; yy < h; yy += 2) for (var xx = 0; xx < w; xx += 2) if (d[(yy * w + xx) * 4 + 3] > 128) pts.push(xx, yy);
    var P = new Float32Array(N * 3), Col = new Float32Array(N * 3), S = new Float32Array(N), n = pts.length / 2;
    for (var i = 0; i < N; i++) {
      var k = Math.floor(Math.random() * n);
      var px = (pts[k * 2] - w / 2) / (w / 2), py = -(pts[k * 2 + 1] - h / 2) / (w / 2);
      P[i * 3] = px + rnd(-0.004, 0.004); P[i * 3 + 1] = py + rnd(-0.004, 0.004); P[i * 3 + 2] = rnd(-0.06, 0.06);
      Col.set(sunGrad((px + 1) / 2 * 0.9 + 0.05), i * 3);
      if (Math.random() < 0.08) Col.set(C.palm, i * 3);
      S[i] = rnd(0.8, 1.4);
    }
    return { P: P, C: Col, S: S };
  }
  function shapeGlobe() {
    var P = new Float32Array(N * 3), Col = new Float32Array(N * 3), S = new Float32Array(N);
    var hubs = [];
    for (var h = 0; h < 22; h++) { var u = Math.random() * 2 - 1, th = Math.random() * Math.PI * 2, r = Math.sqrt(1 - u * u); hubs.push([r * Math.cos(th), u, r * Math.sin(th)]); }
    for (var i = 0; i < N; i++) {
      var p;
      if (i < N * 0.55) { // küre yüzeyi (fibonacci)
        var k = i + 0.5, phi = Math.acos(1 - 2 * k / (N * 0.55)), the = Math.PI * (1 + Math.sqrt(5)) * k;
        p = [Math.cos(the) * Math.sin(phi), Math.cos(phi), Math.sin(the) * Math.sin(phi)];
        Col.set(C.palm, i * 3); S[i] = 1.1;
      } else { // merkezler arası bağlantı yayları (yayıncı ağı)
        var a = hubs[Math.floor(Math.random() * hubs.length)], b = hubs[Math.floor(Math.random() * hubs.length)], t = Math.random();
        p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
        var l = Math.hypot(p[0], p[1], p[2]) || 1, lift = 1 + 0.25 * Math.sin(Math.PI * t);
        p = [p[0] / l * lift, p[1] / l * lift, p[2] / l * lift];
        Col.set(sunGrad(t), i * 3); S[i] = 1.5;
      }
      P[i * 3] = p[0]; P[i * 3 + 1] = p[1]; P[i * 3 + 2] = p[2];
    }
    return { P: P, C: Col, S: S, spin: 1 };
  }
  function shapeField() {
    var P = new Float32Array(N * 3), Col = new Float32Array(N * 3), S = new Float32Array(N);
    for (var i = 0; i < N; i++) {
      P[i * 3] = rnd(-1, 1); P[i * 3 + 1] = rnd(-1, 1); P[i * 3 + 2] = rnd(-0.6, 0.6);
      Col.set(Math.random() < 0.5 ? C.palm : sunGrad(Math.random()), i * 3); S[i] = rnd(0.6, 1.2);
    }
    return { P: P, C: Col, S: S, drift: 1 };
  }
  function shapeWave() {
    var P = new Float32Array(N * 3), Col = new Float32Array(N * 3), S = new Float32Array(N), cols = Math.round(Math.sqrt(N * 3)), rows = Math.ceil(N / cols);
    for (var i = 0; i < N; i++) {
      var cx = (i % cols) / (cols - 1), cz = Math.floor(i / cols) / (rows - 1);
      P[i * 3] = cx * 2 - 1; P[i * 3 + 1] = 0; P[i * 3 + 2] = cz * 2 - 1;
      Col.set(mixc(C.palm, C.sun, cx * 0.7 * (1 - cz)), i * 3); S[i] = 1;
    }
    return { P: P, C: Col, S: S, wave: 1 };
  }

  var SH = { sun: shapeSun(), globe: shapeGlobe(), field: shapeField(), wave: shapeWave() };
  var numbers = ['300+', '2K+', '10', '145'];
  function buildTexts() { numbers.forEach(function (t) { SH['t' + t] = shapeText(t); }); }
  buildTexts();
  if (document.fonts && document.fonts.load) document.fonts.load('700 100px Unbounded').then(function () { buildTexts(); if (cur && cur.indexOf('t') === 0) setShape(cur, true); });

  /* ---------- WebGL ---------- */
  var vs = 'attribute vec3 aPos;attribute vec3 aCol;attribute float aSize;uniform vec2 uRes;uniform float uPx;uniform float uRotY;uniform float uRotX;uniform float uSpin;uniform vec2 uCenter;' +
    'varying vec3 vCol;varying float vDepth;' +
    'void main(){vec3 p=aPos-vec3(uCenter,0.0);float cs=cos(uSpin),sn=sin(uSpin);p=vec3(p.x*cs+p.z*sn,p.y,-p.x*sn+p.z*cs);' +
    'float cy=cos(uRotY),sy=sin(uRotY),cx=cos(uRotX),sx=sin(uRotX);p=vec3(p.x*cy+p.z*sy,p.y,-p.x*sy+p.z*cy);p=vec3(p.x,p.y*cx-p.z*sx,p.y*sx+p.z*cx);p+=vec3(uCenter,0.0);' +
    'float persp=6.0/(6.0-p.z);vec2 sp=p.xy*persp;gl_Position=vec4(sp.x/uRes.x*2.0,sp.y/uRes.y*2.0,0.0,1.0);' +
    'gl_PointSize=aSize*uPx*persp;vCol=aCol;vDepth=persp;}';
  var fs = 'precision mediump float;varying vec3 vCol;varying float vDepth;uniform float uAlpha;' +
    'void main(){vec2 d=gl_PointCoord-0.5;float r=length(d);if(r>0.5)discard;float a=smoothstep(0.5,0.2,r)*uAlpha*clamp(vDepth,0.6,1.2);gl_FragColor=vec4(vCol,a);}';
  function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; }
  var prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); document.documentElement.classList.remove('gl-ok'); return; }
  gl.useProgram(prog);
  var pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N), off = new Float32Array(N * 3), vel = new Float32Array(N * 3);
  var delay = new Float32Array(N);
  for (var i = 0; i < N; i++) { // başlangıç: ekranın her yerine savrulmuş
    var a = Math.random() * Math.PI * 2, r = rnd(1.5, 4);
    pos[i * 3] = Math.cos(a) * r * 2; pos[i * 3 + 1] = Math.sin(a) * r; pos[i * 3 + 2] = rnd(-3, 3);
    col.set(C.palm, i * 3); size[i] = 1; delay[i] = Math.random();
  }
  function buf(data, name, n) {
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    var loc = gl.getAttribLocation(prog, name); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0); return b;
  }
  var drawPos = new Float32Array(N * 3);
  var bPos = buf(drawPos, 'aPos', 3), bCol = buf(col, 'aCol', 3), bSize = buf(size, 'aSize', 1);
  var U = {}; ['uRes', 'uPx', 'uRotY', 'uRotX', 'uSpin', 'uAlpha', 'uCenter'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.clearColor(0, 0, 0, 0);

  var W, H, dpr, unit; // unit: 1 dünya birimi = kaç CSS pikseli (ekran yüksekliğinin yarısı = 1 birim * unit)
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
    unit = H / 2;
  }
  resize(); addEventListener('resize', resize);

  /* ---------- Durum: hangi şekil, nereye demirli ---------- */
  var cur = null, target = null, morphT = 1;
  var anchor = { x: 0, y: 0, s: 1, alpha: 1 }, anchorGoal = { x: 0, y: 0, s: 1, alpha: 1 };
  var spin = 0, spinAmt = 0, wave = 0, drift = 0;
  function setShape(name, force) {
    if (name === cur && !force) return;
    cur = name; target = SH[name];
    for (var i = 0; i < N; i++) delay[i] = Math.random() * 0.35;
    morphT = 0;
    col.set(target.C); size.set(target.S);
    gl.bindBuffer(gl.ARRAY_BUFFER, bCol); gl.bufferSubData(gl.ARRAY_BUFFER, 0, col);
    gl.bindBuffer(gl.ARRAY_BUFFER, bSize); gl.bufferSubData(gl.ARRAY_BUFFER, 0, size);
  }
  // DOM öğesinin merkezini dünya koordinatına çevir
  function toWorld(px, py) { return { x: (px - W / 2) / unit, y: -(py - H / 2) / unit }; }
  function anchorTo(el, scaleFrac, alpha, offX) {
    var r = el.getBoundingClientRect();
    var c = toWorld(r.left + r.width / 2 + (offX || 0) * r.width, r.top + r.height / 2);
    anchorGoal.x = c.x; anchorGoal.y = c.y; anchorGoal.s = Math.min(r.width, r.height) * scaleFrac / unit; anchorGoal.alpha = alpha;
  }

  var intro = document.getElementById('intro');
  var introOn = intro && !intro.classList.contains('is-skipped');
  var introSun = intro ? intro.querySelector('.intro-sun') : null;
  var hero = document.getElementById('hero'), toybox = document.getElementById('toybox');
  var theater = document.getElementById('rakamlar'), stage = theater && theater.querySelector('.theater-stage');
  var network = document.getElementById('is-ortaklari'), contact = document.getElementById('iletisim');
  var captions = theater ? Array.prototype.slice.call(theater.querySelectorAll('.theater-cap')) : [];
  var dots = theater ? Array.prototype.slice.call(theater.querySelectorAll('.theater-dots i')) : [];

  function endIntro() { if (!introOn) return; introOn = false; canvas.classList.remove('over-intro'); }
  if (introOn) {
    canvas.classList.add('over-intro');
    document.addEventListener('oasis:intro-done', endIntro);
    setTimeout(endIntro, 3500);
  }

  function inView(el, frac) { if (!el) return false; var r = el.getBoundingClientRect(); return r.top < H * frac && r.bottom > H * (1 - frac); }
  function pick() {
    if (introOn) { // açılışta ekranın ortasında güneş toplanır
      setShape('sun');
      anchorTo(introSun, 0.5, 1); return;
    }
    if (theater && inView(theater, 0.5)) {
      var r = theater.getBoundingClientRect();
      var prog = Math.min(0.999, Math.max(0, -r.top / (r.height - H)));
      var idx = Math.floor(prog * numbers.length);
      setShape('t' + numbers[idx]);
      captions.forEach(function (c, i) { c.classList.toggle('is-on', i === idx); });
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === idx); });
      anchorTo(stage, 0, 1);
      anchorGoal.s = Math.min(W * (W < 700 ? 0.56 : 0.42), H * 0.62) / unit; anchorGoal.y += W < 700 ? 0.2 : 0.12;
      return;
    }
    var hr = hero.getBoundingClientRect();
    if (hr.bottom > H * 0.35) {
      setShape('sun');
      var narrow = W < 900;
      anchorTo(toybox, narrow ? 0.4 : 0.36, narrow ? 0.9 : 1);
      return;
    }
    if (contact && contact.getBoundingClientRect().top < H * 0.55) {
      setShape('wave'); anchorGoal.x = 0; anchorGoal.y = -0.72; anchorGoal.s = W / unit * 0.62; anchorGoal.alpha = 0.85; return;
    }
    if (network && inView(network, 0.4)) {
      setShape('globe');
      var nr = network.getBoundingClientRect();
      var c = toWorld(W < 900 ? W / 2 : W * 0.7, nr.top + nr.height / 2);
      anchorGoal.x = c.x; anchorGoal.y = c.y; anchorGoal.s = Math.min(W < 900 ? W * 0.42 : W * 0.24, H * 0.42) / unit; anchorGoal.alpha = 0.9; return;
    }
    setShape('field');
    anchorGoal.x = 0; anchorGoal.y = 0; anchorGoal.s = 1; anchorGoal.alpha = 0.32;
  }

  /* ---------- Fare etkileşimi ve tıklama patlaması ---------- */
  var mouse = { x: 9, y: 9, tx: 0, ty: 0, active: false };
  addEventListener('pointermove', function (e) { var w = toWorld(e.clientX, e.clientY); mouse.x = w.x; mouse.y = w.y; mouse.tx = e.clientX / W - 0.5; mouse.ty = e.clientY / H - 0.5; mouse.active = true; }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.active = false; });
  function explode(px, py, power) {
    var w = toWorld(px, py);
    for (var i = 0; i < N; i++) {
      var x = drawPos[i * 3] - w.x, y = drawPos[i * 3 + 1] - w.y, d = Math.hypot(x, y) + 0.05;
      var f = power * Math.exp(-d * 1.2) / d;
      vel[i * 3] += x * f; vel[i * 3 + 1] += y * f; vel[i * 3 + 2] += rnd(-1, 1) * f * 0.5;
    }
  }
  window.oasisExplode = explode;

  /* ---------- Döngü ---------- */
  var last = performance.now(), time = 0, running = true;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(frame); } });
  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
    pick();
    var k = 1 - Math.pow(0.0015, dt); // yumuşak takip
    anchor.x += (anchorGoal.x - anchor.x) * k; anchor.y += (anchorGoal.y - anchor.y) * k;
    anchor.s += (anchorGoal.s - anchor.s) * k; anchor.alpha += (anchorGoal.alpha - anchor.alpha) * k;
    spinAmt += ((target.spin ? 1 : 0) - spinAmt) * k; wave += ((target.wave ? 1 : 0) - wave) * k; drift += ((target.drift ? 1 : 0) - drift) * k;
    spin += dt * 0.25 * spinAmt;
    morphT = Math.min(1.6, morphT + dt * (reduced ? 10 : 0.9));

    var T = target.P, ax = anchor.x, ay = anchor.y, s = anchor.s;
    var fieldW = W / unit, mR = 0.55;
    for (var i = 0; i < N; i++) {
      var i3 = i * 3;
      var lt = Math.min(1, Math.max(0, (morphT - delay[i]) / 0.9)); lt = lt * lt * (3 - 2 * lt);
      var tx = T[i3], ty = T[i3 + 1], tz = T[i3 + 2];
      if (drift > 0.01) { tx = tx * fieldW * 0.55 + Math.sin(time * 0.3 + i) * 0.05; ty = ty * 1.05 + Math.cos(time * 0.25 + i * 1.3) * 0.05; }
      var gx = tx * s, gy = ty * s, gz = tz * s;
      if (wave > 0.01) { gy = (0.07 * Math.sin(tx * 7 + time * 1.6) * Math.cos(tz * 6 + time * 1.1) + tz * 0.22) * wave; gz = -tz * 0.8; gx = tx * s * (1.15 - tz * 0.25); }
      if (drift > 0.01) { gx = tx; gy = ty; gz = tz; }
      gx += ax; gy += ay;
      // hareket: hedefe doğru yaylanma + hız (patlama) + fare itmesi
      var px = pos[i3], py = pos[i3 + 1], pz = pos[i3 + 2];
      var follow = 0.04 + 0.16 * lt;
      px += (gx - px) * follow; py += (gy - py) * follow; pz += (gz - pz) * follow;
      px += vel[i3] * dt; py += vel[i3 + 1] * dt; pz += vel[i3 + 2] * dt;
      vel[i3] *= 0.92; vel[i3 + 1] *= 0.92; vel[i3 + 2] *= 0.92;
      pos[i3] = px; pos[i3 + 1] = py; pos[i3 + 2] = pz;
      var ox = off[i3], oy = off[i3 + 1];
      if (mouse.active && !reduced) {
        var dx = px + ox - mouse.x, dy = py + oy - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < mR * mR) { var d = Math.sqrt(d2) + 0.0001, f = (mR - d) / mR; ox += dx / d * f * 0.06; oy += dy / d * f * 0.06; }
      }
      ox *= 0.94; oy *= 0.94; off[i3] = ox; off[i3 + 1] = oy;
      drawPos[i3] = px + ox; drawPos[i3 + 1] = py + oy; drawPos[i3 + 2] = pz;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, bPos); gl.bufferSubData(gl.ARRAY_BUFFER, 0, drawPos);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uRes, W / unit, H / unit);
    gl.uniform1f(U.uPx, dpr * (small ? 2.1 : 2.4) * Math.max(0.8, Math.min(1.4, unit / 420)));
    gl.uniform1f(U.uRotY, reduced ? 0 : mouse.tx * 0.35);
    gl.uniform1f(U.uRotX, reduced ? 0 : mouse.ty * 0.25);
    gl.uniform2f(U.uCenter, anchor.x, anchor.y);
    gl.uniform1f(U.uSpin, spin);
    gl.uniform1f(U.uAlpha, anchor.alpha);
    gl.drawArrays(gl.POINTS, 0, N);
    requestAnimationFrame(frame);
  }
  pick(); setShape(cur, true);
  requestAnimationFrame(frame);
})();
