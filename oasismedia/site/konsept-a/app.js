/* Oasis Media — Konsept A: Veri merkezi / HUD. Bağımlılıklar: js/data.js (OASIS_DATA), vendor/three/three.min.js (THREE). file:// ile çalışır. */
(function () {
  'use strict';
  var D = window.OASIS_DATA || { clients: [], partners: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var rand = function (a, b) { return a + Math.random() * (b - a); };
  var ri = function (a, b) { return Math.floor(rand(a, b + 1)); };
  var pick = function (arr) { return arr[Math.floor(Math.random() * arr.length)]; };
  var fmt = function (n) { return Math.round(n).toLocaleString('tr-TR'); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* depolama kapalı */ } }
  };
  var CATS = ['FİNANS', 'OTOMOTİV', 'MARKET', 'SPOR', 'KADIN', 'TEKNOLOJİ', 'EXCLUSIVE'];
  var FORMATS = ['masthead', 'gravity', 'interstitial', 'native', 'video', 'rich media', 'sticky'];

  /* =========================================================
     Merkezi animasyon döngüsü — görünmeyen bölüm/sekme çizilmez
     ========================================================= */
  var tasks = [];
  var vio = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { tasks.forEach(function (t) { if (t.el === e.target) { t.vis = e.isIntersecting; if (t.vis && reduced) t.fn(performance.now(), 0); } }); });
  }, { rootMargin: '120px' }) : null;
  function addLoop(el, fn) {
    var t = { el: el, fn: fn, vis: !vio };
    tasks.push(t);
    if (vio) vio.observe(el);
    return t;
  }
  var rafId = 0, last = performance.now();
  function frame(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    for (var i = 0; i < tasks.length; i++) if (tasks[i].vis) tasks[i].fn(now, dt);
    rafId = requestAnimationFrame(frame);
  }
  function startLoop() { if (reduced || rafId) return; last = performance.now(); rafId = requestAnimationFrame(frame); }
  function stopLoop() { cancelAnimationFrame(rafId); rafId = 0; }
  document.addEventListener('visibilitychange', function () { if (document.hidden) stopLoop(); else startLoop(); });

  /* =========================================================
     Şifre çözme (decrypt) efekti
     ========================================================= */
  var GLYPHS = 'ABCDEFGHİJKLMNOÖPRSŞTUÜVYZ0123456789#%&@$<>/\\[]{}*+=';
  function prepDecrypt(el) {
    var chars = [];
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (word) {
            if (!word) return;
            if (/^\s+$/.test(word)) { f.appendChild(document.createTextNode(' ')); return; }
            var wd = document.createElement('span'); wd.className = 'wd';
            Array.from(word).forEach(function (ch) {
              var s = document.createElement('span'); s.className = 'c scr'; s.textContent = ch; s.setAttribute('data-g', pick(GLYPHS));
              wd.appendChild(s); chars.push(s);
            });
            f.appendChild(wd);
          });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
    el._chars = chars;
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
  }
  function runDecrypt(el, speed) {
    var chars = el._chars; if (!chars || el._ran) return; el._ran = true;
    var t0 = performance.now(), step = speed || 22, life = 320;
    (function tick(now) {
      var done = true, el2 = now - t0;
      for (var i = 0; i < chars.length; i++) {
        var c = chars[i], st = i * step;
        if (el2 >= st + life) { if (c._d !== 1) { c.classList.remove('scr'); c._d = 1; } }
        else { done = false; if (el2 > st - 400 && Math.random() < 0.5) c.setAttribute('data-g', pick(GLYPHS)); }
      }
      if (!done) requestAnimationFrame(tick);
    })(t0);
  }
  var heroTitle = $('#heroTitle');
  if (!reduced) {
    prepDecrypt(heroTitle);
    $$('.decrypt').forEach(prepDecrypt);
  }

  /* =========================================================
     Boot ekranı
     ========================================================= */
  var boot = $('#boot'), booted = false;
  function afterBoot() {
    if (booted) return; booted = true;
    root.classList.remove('booting');
    if (!reduced) {
      setTimeout(function () { runDecrypt(heroTitle, 26); }, 120);
      setInterval(function () {
        if (document.hidden) return;
        heroTitle.classList.add('glitch'); setTimeout(function () { heroTitle.classList.remove('glitch'); }, 400);
      }, 6500);
    }
  }
  if (root.classList.contains('no-boot')) {
    boot.hidden = true; afterBoot();
  } else {
    root.classList.add('booting');
    store.set('oasis-a-boot', '1');
    var LINES = [
      ['<b>OASIS NETWORK v4.2</b> başlatılıyor…', ''],
      ['Çekirdek modüller yükleniyor', 'OK'],
      ['300+ yayıncı bağlanıyor', 'OK'],
      ['Kategori indeksi: finans · otomotiv · spor · teknoloji', 'OK'],
      ['Hedefleme matrisi derleniyor', 'OK'],
      ['KPI motoru', 'OK'],
      ['Raporlama akışı senkronize', 'OK'],
      ['<span class="hl">HUD arayüzü açılıyor</span>', '▮']
    ];
    var log = $('#bootLog'), pct = $('#bootPct'), bar = $('#bootBar'), cellsWrap = $('#bootCells');
    for (var ci = 0; ci < 24; ci++) cellsWrap.appendChild(document.createElement('i'));
    var cells = $$('i', cellsWrap), T = 2600, b0 = performance.now(), shown = 0, finished = false;
    var finishBoot = function () {
      if (finished) return; finished = true;
      boot.classList.add('done'); afterBoot();
      setTimeout(function () { boot.hidden = true; }, 600);
    };
    (function bt(now) {
      if (finished) return;
      var p = clamp((now - b0) / T, 0, 1), e = 1 - Math.pow(1 - p, 2);
      pct.textContent = Math.round(e * 100); bar.style.transform = 'scaleX(' + e + ')';
      var nc = Math.round(e * 24); cells.forEach(function (c, i) { c.classList.toggle('on', i < nc); });
      var want = Math.min(LINES.length, Math.floor(p * (LINES.length + 0.6)));
      while (shown < want) {
        var L = LINES[shown], ts = (0.1 + shown * 0.31).toFixed(3);
        log.innerHTML += '[' + ts + '] ' + L[0] + (L[1] ? ' <span class="ok">… ' + L[1] + '</span>' : '') + '\n';
        shown++;
      }
      if (p >= 1) { setTimeout(finishBoot, 260); return; }
      requestAnimationFrame(bt);
    })(b0);
    $('#bootSkip').addEventListener('click', finishBoot);
    boot.addEventListener('click', finishBoot);
    addEventListener('keydown', function (e) { if (e.key === 'Escape') finishBoot(); });
    setTimeout(finishBoot, 4000);
  }

  /* =========================================================
     Header: menü, aktif bağlantı, ilerleme, saat
     ========================================================= */
  var nav = $('#nav'), burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });
  $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); burger.setAttribute('aria-label', 'Menüyü aç'); }); });
  var sections = $$('main section[id]'), progress = $('#progress'), navLinks = $$('a', nav);
  function onScroll() {
    var h = root.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    var cur = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * 0.45) cur = s.id; });
    navLinks.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + cur); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var clock = $('#clock');
  function tickClock() {
    var t; try { t = new Date().toLocaleTimeString('tr-TR', { timeZone: 'Europe/Istanbul', hour12: false }); } catch (e) { t = new Date().toTimeString().slice(0, 8); }
    clock.textContent = 'TR ' + t;
  }
  tickClock(); setInterval(tickClock, 1000);
  $('#year').textContent = Math.max(2025, new Date().getFullYear());

  /* =========================================================
     İmleç + hero nişangâhı
     ========================================================= */
  var hero = $('#hero'), cross = $('#heroCross'), hx = $('.hx', cross), hy = $('.hy', cross);
  var mouse = { x: 0, y: 0, nx: 0, ny: 0 };
  addEventListener('pointermove', function (e) {
    mouse.x = e.clientX; mouse.y = e.clientY;
    mouse.nx = e.clientX / innerWidth * 2 - 1; mouse.ny = e.clientY / innerHeight * 2 - 1;
  }, { passive: true });
  if (fine && !reduced) {
    root.classList.add('has-cur');
    var cur = $('#cur');
    cur.style.opacity = '0'; addEventListener('pointermove', function () { cur.style.opacity = ''; }, { once: true });
    var cxy = $('#curXY'), cx = innerWidth / 2, cy = innerHeight / 2, labelTxt = '';
    document.addEventListener('pointerover', function (e) {
      var el = e.target.closest('a, button, input, textarea, .tile, .nnode, [data-cursor]');
      cur.classList.toggle('link', !!el);
      labelTxt = el && el.dataset.cursor ? el.dataset.cursor : (el && el.classList.contains('tile') ? el.getAttribute('data-n') : '');
      cur.classList.toggle('label', !!labelTxt);
    });
    document.addEventListener('pointerleave', function () { cur.style.opacity = '0'; });
    document.addEventListener('pointerenter', function () { cur.style.opacity = ''; });
    addLoop(document.body, function () {
      cx += (mouse.x - cx) * 0.3; cy += (mouse.y - cy) * 0.3;
      cur.style.transform = 'translate(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px)';
      cxy.textContent = labelTxt ? '[ ' + labelTxt + ' ]' : 'X:' + ('000' + Math.round(cx)).slice(-4) + ' Y:' + ('000' + Math.round(cy + scrollY)).slice(-4);
      var r = hero.getBoundingClientRect();
      hx.style.transform = 'translateY(' + (cy - r.top) + 'px)'; hy.style.transform = 'translateX(' + (cx - r.left) + 'px)';
    }).vis = true;
  }

  /* =========================================================
     HERO — three.js küre, ışık yayları, nabız atan düğümler
     ========================================================= */
  var canvas = $('#globe'), coordEl = $('#coord');
  (function globe() {
    var T3 = window.THREE;
    if (!T3) { canvas.style.display = 'none'; return; }
    var renderer;
    try { renderer = new T3.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' }); }
    catch (e) { canvas.style.display = 'none'; return; }
    var mobile = innerWidth < 760;
    var PR = Math.min(window.devicePixelRatio || 1, mobile ? 1.75 : 2);
    renderer.setPixelRatio(PR);
    renderer.setClearColor(0x000000, 0);
    var scene = new T3.Scene();
    var camera = new T3.PerspectiveCamera(32, 1, 0.1, 100);
    var world = new T3.Group(); scene.add(world);
    var tilt = new T3.Group(); tilt.rotation.x = 0.38; tilt.rotation.z = -0.12; world.add(tilt);
    var G = new T3.Group(); tilt.add(G);
    var uni = { uTime: { value: 0 }, uPR: { value: PR }, uScale: { value: 1 } };

    // Kara benzeri maske için ucuz gürültü
    function noise(x, y, z) {
      return Math.sin(x * 2.1 + 1.3) * Math.sin(y * 2.7 + 0.4) * Math.sin(z * 2.3 + 2.1)
        + 0.55 * Math.sin(x * 4.3 + y * 2.9 + 0.7) * Math.sin(z * 4.1 - y * 1.7)
        + 0.3 * Math.sin(x * 8.7 - z * 6.1 + 1.1) * Math.sin(y * 7.3 + 0.3);
    }
    // Noktalı küre (fibonacci)
    var N = mobile ? 3200 : 7000, pos = new Float32Array(N * 3), land = new Float32Array(N), rnd = new Float32Array(N), landIdx = [];
    var gold = Math.PI * (3 - Math.sqrt(5));
    for (var i = 0; i < N; i++) {
      var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = gold * i;
      var x = Math.cos(th) * r, z = Math.sin(th) * r;
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      var l = noise(x, y, z) > 0.05 ? 1 : 0; land[i] = l; rnd[i] = Math.random();
      if (l && Math.abs(y) < 0.86) landIdx.push(i);
    }
    var dg = new T3.BufferGeometry();
    dg.setAttribute('position', new T3.BufferAttribute(pos, 3));
    dg.setAttribute('aLand', new T3.BufferAttribute(land, 1));
    dg.setAttribute('aRnd', new T3.BufferAttribute(rnd, 1));
    var dotMat = new T3.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false, blending: T3.AdditiveBlending,
      vertexShader: [
        'attribute float aLand; attribute float aRnd; uniform float uTime; uniform float uPR; uniform float uScale;',
        'varying float vA; varying float vL;',
        'void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vec3 n = normalize(normalMatrix * position);',
        ' vA = mix(0.07, 1.0, smoothstep(-0.1, 0.55, n.z)); vL = aLand;',
        ' float tw = 0.8 + 0.2 * sin(uTime * 1.7 + aRnd * 40.0);',
        ' gl_PointSize = (aLand > 0.5 ? 2.5 : 1.35) * uPR * uScale * tw;',
        ' gl_Position = projectionMatrix * mv; }'
      ].join('\n'),
      fragmentShader: [
        'varying float vA; varying float vL;',
        'void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;',
        ' float a = smoothstep(0.5, 0.05, d) * vA;',
        ' vec3 col = mix(vec3(0.10, 0.30, 0.48), vec3(0.20, 0.90, 0.92), vL);',
        ' gl_FragColor = vec4(col, a * (vL > 0.5 ? 0.9 : 0.42)); }'
      ].join('\n')
    });
    G.add(new T3.Points(dg, dotMat));

    // Koyu iç küre (arka yüzü bastırır)
    var core = new T3.Mesh(new T3.SphereGeometry(0.985, 48, 48), new T3.MeshBasicMaterial({ color: 0x040814, transparent: true, opacity: 0.75, depthWrite: false }));
    core.renderOrder = -1; G.add(core);

    // Enlem/boylam ağı
    var gl = [];
    for (var la = -60; la <= 60; la += 30) {
      var rr = Math.cos(la * Math.PI / 180), yy = Math.sin(la * Math.PI / 180);
      for (var a = 0; a < 96; a++) {
        var a1 = a / 96 * Math.PI * 2, a2 = (a + 1) / 96 * Math.PI * 2;
        gl.push(Math.cos(a1) * rr, yy, Math.sin(a1) * rr, Math.cos(a2) * rr, yy, Math.sin(a2) * rr);
      }
    }
    for (var lo = 0; lo < 180; lo += 30) {
      var c = Math.cos(lo * Math.PI / 180), s = Math.sin(lo * Math.PI / 180);
      for (var b = 0; b < 96; b++) {
        var t1 = b / 96 * Math.PI * 2, t2 = (b + 1) / 96 * Math.PI * 2;
        gl.push(Math.cos(t1) * c, Math.sin(t1), Math.cos(t1) * s, Math.cos(t2) * c, Math.sin(t2), Math.cos(t2) * s);
      }
    }
    var gridG = new T3.BufferGeometry(); gridG.setAttribute('position', new T3.Float32BufferAttribute(gl, 3));
    var grid = new T3.LineSegments(gridG, new T3.LineBasicMaterial({ color: 0x2de2e6, transparent: true, opacity: 0.07, depthWrite: false, blending: T3.AdditiveBlending }));
    grid.scale.setScalar(1.002); G.add(grid);

    // Atmosfer
    var atm = new T3.Mesh(new T3.PlaneGeometry(3.2, 3.2), new T3.ShaderMaterial({
      transparent: true, depthWrite: false, depthTest: false, blending: T3.AdditiveBlending,
      vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying vec2 vP; void main(){ float r = length(vP); float o = 1.0 - smoothstep(1.0, 1.42, r); o = o*o; float inner = smoothstep(0.82, 1.02, r);' +
        ' float a = o * inner; vec3 c = mix(vec3(0.18,0.88,0.9), vec3(1.0,0.5,0.18), smoothstep(0.3, -0.9, vP.y/r) ); gl_FragColor = vec4(c, a * 0.55); }'
    }));
    atm.renderOrder = -2;
    scene.add(atm);

    // Yayıncı düğümleri (300+)
    var PUB = mobile ? 180 : 320, pubPos = [], pp = new Float32Array(PUB * 3), ph = new Float32Array(PUB);
    for (var p = 0; p < PUB; p++) {
      var id = landIdx[Math.floor(Math.random() * landIdx.length)];
      var v = new T3.Vector3(pos[id * 3], pos[id * 3 + 1], pos[id * 3 + 2]).multiplyScalar(1.012);
      pubPos.push(v); pp[p * 3] = v.x; pp[p * 3 + 1] = v.y; pp[p * 3 + 2] = v.z; ph[p] = Math.random();
    }
    var pg = new T3.BufferGeometry(); pg.setAttribute('position', new T3.BufferAttribute(pp, 3)); pg.setAttribute('aPh', new T3.BufferAttribute(ph, 1));
    G.add(new T3.Points(pg, new T3.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false, blending: T3.AdditiveBlending,
      vertexShader: 'attribute float aPh; uniform float uTime; uniform float uPR; uniform float uScale; varying float vA; varying float vP;' +
        'void main(){ vec3 n = normalize(normalMatrix * position); vA = smoothstep(-0.05, 0.45, n.z); vP = fract(uTime*0.45 + aPh);' +
        ' gl_PointSize = (4.0 + 9.0 * vP) * uPR * uScale; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying float vA; varying float vP; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard;' +
        ' float core = smoothstep(0.22, 0.0, d); float ring = smoothstep(0.06, 0.0, abs(d - 0.42*vP - 0.06)) * (1.0 - vP);' +
        ' gl_FragColor = vec4(mix(vec3(1.0,0.53,0.2), vec3(1.0,0.75,0.3), core), (core*0.95 + ring*0.8) * vA); }'
    })));

    // Işık yayları
    var ARCS = mobile ? 9 : 20, SEG = 64, arcs = [], heads = new Float32Array(ARCS * 3), headCol = new Float32Array(ARCS);
    var arcVS = 'attribute float aT; varying float vT; varying float vF; void main(){ vT = aT; vec3 n = normalize(normalMatrix * position); vF = smoothstep(-0.35, 0.2, n.z); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }';
    var arcFS = 'uniform float uHead; uniform vec3 uColor; varying float vT; varying float vF;' +
      'void main(){ float tail = 0.55; float a = smoothstep(uHead - tail, uHead, vT) * step(vT, uHead); a = a*a; a += 0.22 * step(vT, uHead) * (1.0 - smoothstep(1.0, 1.5, uHead));' +
      ' gl_FragColor = vec4(uColor, a * vF); }';
    var tmpA = new T3.Vector3(), tmpB = new T3.Vector3(), tmpC = new T3.Vector3();
    function bez(a, b, c, t, out) { var u = 1 - t; return out.set(u * u * a.x + 2 * u * t * c.x + t * t * b.x, u * u * a.y + 2 * u * t * c.y + t * t * b.y, u * u * a.z + 2 * u * t * c.z + t * t * b.z); }
    function resetArc(A, delay) {
      var a = pick(pubPos), b = pick(pubPos), tries = 0;
      while ((a.distanceTo(b) < 0.5 || a.distanceTo(b) > 1.7) && tries++ < 20) b = pick(pubPos);
      var d = a.distanceTo(b);
      A.a = a; A.b = b; A.c = a.clone().add(b).normalize().multiplyScalar(1 + d * 0.42);
      var arr = A.geo.attributes.position.array;
      for (var k = 0; k <= SEG; k++) { bez(a, b, A.c, k / SEG, tmpA); arr[k * 3] = tmpA.x; arr[k * 3 + 1] = tmpA.y; arr[k * 3 + 2] = tmpA.z; }
      A.geo.attributes.position.needsUpdate = true; A.geo.computeBoundingSphere();
      A.head = -delay; A.speed = rand(0.45, 0.75); A.hit = false;
      A.orange = Math.random() < 0.55;
      A.mat.uniforms.uColor.value.set(A.orange ? 0xfe8732 : 0x2de2e6);
    }
    for (var q = 0; q < ARCS; q++) {
      var geo = new T3.BufferGeometry(), at = new Float32Array(SEG + 1);
      for (var k = 0; k <= SEG; k++) at[k] = k / SEG;
      geo.setAttribute('position', new T3.BufferAttribute(new Float32Array((SEG + 1) * 3), 3));
      geo.setAttribute('aT', new T3.BufferAttribute(at, 1));
      var mat = new T3.ShaderMaterial({ uniforms: { uHead: { value: 0 }, uColor: { value: new T3.Color(0xfe8732) } }, vertexShader: arcVS, fragmentShader: arcFS, transparent: true, depthWrite: false, blending: T3.AdditiveBlending });
      var line = new T3.Line(geo, mat); G.add(line);
      var A = { geo: geo, mat: mat, line: line, idx: q };
      resetArc(A, rand(0, 2.5)); arcs.push(A);
    }
    var hg = new T3.BufferGeometry(); hg.setAttribute('position', new T3.BufferAttribute(heads, 3)); hg.setAttribute('aC', new T3.BufferAttribute(headCol, 1));
    var headPts = new T3.Points(hg, new T3.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false, blending: T3.AdditiveBlending,
      vertexShader: 'attribute float aC; uniform float uPR; uniform float uScale; varying float vC; varying float vA; void main(){ vC = aC; vec3 n = normalize(normalMatrix * position); vA = smoothstep(-0.35, 0.2, n.z); gl_PointSize = 14.0 * uPR * uScale; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'varying float vC; varying float vA; void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; float a = smoothstep(0.5,0.0,d); a = a*a; vec3 c = mix(vec3(0.3,0.95,1.0), vec3(1.0,0.65,0.3), vC); gl_FragColor = vec4(mix(c, vec3(1.0), smoothstep(0.15,0.0,d)), a * vA); }'
    }));
    G.add(headPts);

    // Varış dalgaları
    var rings = [], ringGeo = new T3.RingGeometry(0.9, 1, 40), Z = new T3.Vector3(0, 0, 1);
    for (var w = 0; w < ARCS; w++) {
      var rm = new T3.Mesh(ringGeo, new T3.MeshBasicMaterial({ color: 0xfe8732, transparent: true, opacity: 0, depthWrite: false, blending: T3.AdditiveBlending, side: T3.DoubleSide }));
      rm.visible = false; G.add(rm); rings.push({ m: rm, t: 1 });
    }
    function impact(A) {
      var R = rings[A.idx]; R.t = 0; R.m.visible = true;
      R.m.position.copy(A.b).multiplyScalar(1.004);
      R.m.quaternion.setFromUnitVectors(Z, tmpB.copy(A.b).normalize());
      R.m.material.color.set(A.orange ? 0xfe8732 : 0x2de2e6);
    }

    // Yörünge halkaları + uydular
    var orbit = new T3.Group(); orbit.rotation.x = 1.25; orbit.rotation.y = 0.3; world.add(orbit);
    function circle(r, seg) { var arr = []; for (var i2 = 0; i2 <= seg; i2++) { var t = i2 / seg * Math.PI * 2; arr.push(Math.cos(t) * r, Math.sin(t) * r, 0); } var g2 = new T3.BufferGeometry(); g2.setAttribute('position', new T3.Float32BufferAttribute(arr, 3)); return g2; }
    var o1 = new T3.Line(circle(1.42, 160), new T3.LineBasicMaterial({ color: 0x2de2e6, transparent: true, opacity: 0.22, blending: T3.AdditiveBlending, depthWrite: false }));
    var o2 = new T3.LineSegments(circle(1.58, 240), new T3.LineBasicMaterial({ color: 0xfe8732, transparent: true, opacity: 0.18, blending: T3.AdditiveBlending, depthWrite: false }));
    orbit.add(o1); orbit.add(o2);
    var orbit2 = new T3.Group(); orbit2.rotation.x = 1.9; orbit2.rotation.y = -0.7; world.add(orbit2);
    orbit2.add(new T3.Line(circle(1.3, 160), new T3.LineBasicMaterial({ color: 0x2de2e6, transparent: true, opacity: 0.1, blending: T3.AdditiveBlending, depthWrite: false })));
    var SAT = 6, satArr = new Float32Array(SAT * 3), satG = new T3.BufferGeometry(); satG.setAttribute('position', new T3.BufferAttribute(satArr, 3));
    var sats = new T3.Points(satG, new T3.ShaderMaterial({
      uniforms: uni, transparent: true, depthWrite: false, blending: T3.AdditiveBlending,
      vertexShader: 'uniform float uPR; uniform float uScale; void main(){ gl_PointSize = 7.0 * uPR * uScale; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
      fragmentShader: 'void main(){ float d = length(gl_PointCoord-0.5); if(d>0.5) discard; gl_FragColor = vec4(1.0,0.85,0.55, smoothstep(0.5,0.0,d)); }'
    }));
    orbit.add(sats);

    // Yıldız tozu
    var SN = mobile ? 250 : 600, sp = new Float32Array(SN * 3);
    for (var st = 0; st < SN; st++) { var v3 = new T3.Vector3(rand(-1, 1), rand(-1, 1), rand(-1, 1)).normalize().multiplyScalar(rand(3, 8)); sp[st * 3] = v3.x; sp[st * 3 + 1] = v3.y; sp[st * 3 + 2] = v3.z; }
    var sg = new T3.BufferGeometry(); sg.setAttribute('position', new T3.BufferAttribute(sp, 3));
    var stars = new T3.Points(sg, new T3.PointsMaterial({ color: 0x9fdcff, size: 1.2 * PR, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false }));
    scene.add(stars);

    // Hedef kilidi (HTML nişangâh)
    var lock = document.createElement('div'); lock.className = 'lock'; lock.setAttribute('aria-hidden', 'true');
    lock.innerHTML = '<i></i><span class="lock-l"><b>HEDEF</b> <em></em></span><span class="lock-s"></span>';
    hero.appendChild(lock);
    var lockEm = $('em', lock), lockS = $('.lock-s', lock), lockIdx = 0, lockT = 0;
    function newLock() {
      lockIdx = Math.floor(Math.random() * PUB);
      lockEm.textContent = pick(CATS) + ' · #' + ri(100, 399);
      lockS.textContent = 'CTR ' + rand(1.8, 3.4).toFixed(2).replace('.', ',') + '% · ' + pick(FORMATS);
      lock.classList.remove('on'); void lock.offsetWidth; lock.classList.add('on');
    }
    newLock();

    // Yerleşim: küreyi ekranda istenen piksel merkezine ve yarıçapa oturt
    var W = 1, H = 1, Rpx = 200;
    function layout() {
      var r = hero.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setSize(W, H, false);
      var cxp, cyp;
      if (innerWidth < 760) {
        var hin = $('.hero-in').getBoundingClientRect(), tl = $('.tele').getBoundingClientRect();
        var gapTop = hin.bottom - r.top, gapBot = tl.top - r.top;
        cxp = W * 0.5; cyp = (gapTop + gapBot) / 2; Rpx = Math.min(W * 0.4, Math.max(90, (gapBot - gapTop) * 0.42));
      } else {
        cxp = W * (innerWidth < 1100 ? 0.7 : 0.68); cyp = H * 0.48; Rpx = Math.min(H * 0.34, W * 0.25);
      }
      camera.aspect = W / H;
      var fov = camera.fov * Math.PI / 180, dist = H / (2 * Rpx * Math.tan(fov / 2));
      camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0);
      camera.setViewOffset(W, H, W / 2 - cxp, H / 2 - cyp, W, H);
      camera.updateProjectionMatrix();
      uni.uScale.value = clamp(Rpx / 260, 0.55, 1.4);
    }
    layout();
    var rt; addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { layout(); if (reduced) draw(performance.now(), 0); }, 120); });

    var rotY = 0, wv = new T3.Vector3(), nv = new T3.Vector3(), camDir = new T3.Vector3();
    var draw = function (now, dt) {
      var t = now / 1000; uni.uTime.value = t;
      rotY += dt * 0.07; G.rotation.y = rotY;
      world.rotation.y += ((mouse.nx * 0.25) - world.rotation.y) * 0.04;
      world.rotation.x += ((mouse.ny * 0.12) - world.rotation.x) * 0.04;
      orbit.rotation.z += dt * 0.15; orbit2.rotation.z -= dt * 0.08; stars.rotation.y += dt * 0.004;
      for (var s2 = 0; s2 < SAT; s2++) {
        var ang = t * (0.35 + s2 * 0.05) + s2 * 1.05, rad = s2 % 2 ? 1.58 : 1.42;
        satArr[s2 * 3] = Math.cos(ang) * rad; satArr[s2 * 3 + 1] = Math.sin(ang) * rad; satArr[s2 * 3 + 2] = 0;
      }
      satG.attributes.position.needsUpdate = true;
      for (var j = 0; j < arcs.length; j++) {
        var A = arcs[j]; A.head += dt * A.speed;
        A.mat.uniforms.uHead.value = A.head;
        var hh = clamp(A.head, 0, 1); bez(A.a, A.b, A.c, hh, tmpC);
        heads[j * 3] = tmpC.x; heads[j * 3 + 1] = tmpC.y; heads[j * 3 + 2] = tmpC.z;
        headCol[j] = A.orange ? 1 : 0;
        if (A.head < 0 || A.head > 1) { heads[j * 3] = 0; heads[j * 3 + 1] = 0; heads[j * 3 + 2] = 0; }
        if (A.head >= 1 && !A.hit) { A.hit = true; impact(A); }
        if (A.head > 1.5) resetArc(A, rand(0.1, 1.2));
      }
      hg.attributes.position.needsUpdate = true; hg.attributes.aC.needsUpdate = true;
      for (var k2 = 0; k2 < rings.length; k2++) {
        var R = rings[k2]; if (R.t >= 1) { R.m.visible = false; continue; }
        R.t += dt * 1.1; var e = R.t; R.m.scale.setScalar(0.015 + e * 0.11); R.m.material.opacity = (1 - e) * 0.9;
      }
      renderer.render(scene, camera);
      // kilit nişangâhı
      lockT += dt; if (lockT > 3.2) { lockT = 0; newLock(); }
      wv.copy(pubPos[lockIdx]).applyMatrix4(G.matrixWorld);
      nv.copy(wv).normalize(); camDir.copy(camera.position).sub(wv).normalize();
      var facing = nv.dot(camDir);
      wv.project(camera);
      var sx = (wv.x + 1) / 2 * W, sy = (1 - wv.y) / 2 * H;
      lock.style.transform = 'translate(' + sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px)';
      lock.style.opacity = facing > 0.25 ? '1' : '0';
      if (coordEl && (now | 0) % 6 === 0) coordEl.textContent = (41 + Math.sin(t * 0.3) * 0.02).toFixed(4) + '° K · ' + (29 + Math.cos(t * 0.27) * 0.02).toFixed(4) + '° D';
    };
    if (reduced) { draw(performance.now(), 0); }
    addLoop(hero, draw);
    window.addEventListener('load', layout);
  })();

  /* =========================================================
     HERO — canlı simülasyon paneli + akış bandı
     ========================================================= */
  (function tele() {
    var imp = 48200000 + ri(0, 900000), elImp = $('#tImp'), elCtr = $('#tCtr'), elCamp = $('#tCamp'), elPub = $('#tPub'), elLat = $('#tLat');
    var spark = $('#tSpark'), sctx = spark.getContext('2d'), series = [], bars = $('#tBars');
    for (var i = 0; i < 48; i++) series.push(0.45 + Math.sin(i / 4) * 0.15 + Math.random() * 0.2);
    for (var b = 0; b < 20; b++) bars.appendChild(document.createElement('i'));
    var barEls = $$('i', bars);
    function sizeSpark() { var r = spark.getBoundingClientRect(), pr = Math.min(2, devicePixelRatio || 1); spark.width = Math.max(1, r.width * pr); spark.height = Math.max(1, r.height * pr); }
    function drawSpark() {
      var w = spark.width, h = spark.height; sctx.clearRect(0, 0, w, h);
      sctx.strokeStyle = 'rgba(45,226,230,.12)'; sctx.lineWidth = 1;
      for (var g = 1; g < 4; g++) { sctx.beginPath(); sctx.moveTo(0, h * g / 4); sctx.lineTo(w, h * g / 4); sctx.stroke(); }
      sctx.beginPath();
      series.forEach(function (v, i) { var x = i / (series.length - 1) * w, y = h - v * h * 0.9; if (i) sctx.lineTo(x, y); else sctx.moveTo(x, y); });
      var grad = sctx.createLinearGradient(0, 0, 0, h); grad.addColorStop(0, 'rgba(254,135,50,.45)'); grad.addColorStop(1, 'rgba(254,135,50,0)');
      sctx.lineWidth = 2 * (spark.width / Math.max(1, spark.clientWidth)); sctx.strokeStyle = '#fe8732'; sctx.shadowColor = '#fe8732'; sctx.shadowBlur = 8; sctx.stroke(); sctx.shadowBlur = 0;
      sctx.lineTo(w, h); sctx.lineTo(0, h); sctx.closePath(); sctx.fillStyle = grad; sctx.fill();
      var lx = w, ly = h - series[series.length - 1] * h * 0.9; sctx.fillStyle = '#fff'; sctx.beginPath(); sctx.arc(lx - 3, ly, 3 * (spark.width / Math.max(1, spark.clientWidth)), 0, Math.PI * 2); sctx.fill();
    }
    function upd() {
      if (document.hidden) return;
      imp += ri(900, 3400); elImp.textContent = fmt(imp);
    }
    function slow() {
      if (document.hidden) return;
      elCtr.textContent = rand(2.18, 2.74).toFixed(2).replace('.', ',') + '%';
      elCamp.textContent = ri(124, 139);
      elPub.textContent = ri(306, 318);
      elLat.textContent = ri(12, 27) + ' ms';
      series.shift(); series.push(clamp(series[series.length - 1] + rand(-0.14, 0.14), 0.15, 0.95)); drawSpark();
      barEls.forEach(function (e) { e.style.height = ri(15, 100) + '%'; });
    }
    sizeSpark(); upd(); slow(); drawSpark();
    addEventListener('resize', function () { sizeSpark(); drawSpark(); });
    if (!reduced) { setInterval(upd, 110); setInterval(slow, 700); }

    var tk = $('#ticker'), now = Date.now(), items = [];
    for (var j = 0; j < 14; j++) {
      var d = new Date(now - (14 - j) * ri(20, 70) * 1000);
      var hhmm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
      items.push('<span>[' + hhmm + '] <b>' + pick(CATS) + '</b> › ' + pick(FORMATS) + ' yayında · <i>' + ri(12, 96) + ' site</i></span>');
    }
    tk.innerHTML = items.join('') + items.join('');
  })();

  /* =========================================================
     HAKKIMIZDA — kategori radarı
     ========================================================= */
  (function radar() {
    var cv = $('#radar'), ctx = cv.getContext('2d'), deg = $('#radarDeg'), legend = $('#radarLegend');
    var RC = [
      { n: 'Finans', a: 0.35, r: 0.62 }, { n: 'Otomotiv', a: 1.35, r: 0.78 }, { n: 'Market', a: 2.2, r: 0.48 },
      { n: 'Spor', a: 3.25, r: 0.7 }, { n: 'Kadın', a: 4.2, r: 0.56 }, { n: 'Teknoloji', a: 5.25, r: 0.8 }
    ];
    legend.innerHTML = RC.map(function (c) { return '<li>' + c.n + '</li>'; }).join('');
    var lis = $$('li', legend), minor = [];
    for (var i = 0; i < 26; i++) minor.push({ a: rand(0, Math.PI * 2), r: rand(0.15, 0.95), h: 0 });
    RC.forEach(function (c) { c.h = 0; });
    var S = 0, pr = 1, sweep = 0;
    function size() { var r = cv.getBoundingClientRect(); pr = Math.min(2, devicePixelRatio || 1); S = Math.max(1, Math.round(r.width * pr)); cv.width = S; cv.height = S; }
    size(); addEventListener('resize', function () { size(); if (reduced) draw(0, 0); });
    function angDiff(a, b) { var d = (a - b) % (Math.PI * 2); if (d < 0) d += Math.PI * 2; return d; }
    var draw = function (now, dt) {
      var c = S / 2, R = S / 2 - 26 * pr; ctx.clearRect(0, 0, S, S);
      var prev = sweep; sweep = (sweep + dt * 1.25) % (Math.PI * 2);
      ctx.lineWidth = 1 * pr;
      for (var k = 1; k <= 4; k++) { ctx.strokeStyle = 'rgba(45,226,230,' + (k === 4 ? .35 : .14) + ')'; ctx.beginPath(); ctx.arc(c, c, R * k / 4, 0, Math.PI * 2); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(45,226,230,.12)'; ctx.beginPath(); ctx.moveTo(c - R, c); ctx.lineTo(c + R, c); ctx.moveTo(c, c - R); ctx.lineTo(c, c + R); ctx.stroke();
      for (var t = 0; t < 72; t++) { var ta = t / 72 * Math.PI * 2, l = t % 6 ? 5 : 11; ctx.strokeStyle = t % 6 ? 'rgba(45,226,230,.3)' : 'rgba(254,135,50,.7)'; ctx.beginPath(); ctx.moveTo(c + Math.cos(ta) * (R + 4 * pr), c + Math.sin(ta) * (R + 4 * pr)); ctx.lineTo(c + Math.cos(ta) * (R + (4 + l) * pr), c + Math.sin(ta) * (R + (4 + l) * pr)); ctx.stroke(); }
      // süpürme
      var SL = 40, span = 1.1;
      for (var s = 0; s < SL; s++) {
        var a0 = sweep - span * (s + 1) / SL, a1 = sweep - span * s / SL;
        ctx.fillStyle = 'rgba(45,226,230,' + (0.22 * (1 - s / SL)) + ')';
        ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, R, a0, a1 + 0.004); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(160,255,255,.9)'; ctx.lineWidth = 1.5 * pr; ctx.shadowColor = '#2de2e6'; ctx.shadowBlur = 10 * pr;
      ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(c + Math.cos(sweep) * R, c + Math.sin(sweep) * R); ctx.stroke(); ctx.shadowBlur = 0;
      var passed = function (a) { return dt > 0 && angDiff(sweep, a) < angDiff(sweep, prev) + 1e-6 && angDiff(sweep, a) <= dt * 1.25 + 1e-6; };
      minor.forEach(function (m) {
        if (passed(m.a)) m.h = 1; m.h = Math.max(reduced ? 0.6 : 0, m.h - dt * 0.6);
        ctx.fillStyle = 'rgba(45,226,230,' + (0.15 + m.h * 0.8) + ')';
        ctx.beginPath(); ctx.arc(c + Math.cos(m.a) * m.r * R, c + Math.sin(m.a) * m.r * R, 1.6 * pr, 0, Math.PI * 2); ctx.fill();
      });
      ctx.font = '500 ' + Math.round(10.5 * pr) + 'px "JetBrains Mono", monospace'; ctx.textBaseline = 'middle';
      RC.forEach(function (b, i) {
        if (passed(b.a)) { b.h = 1; lis[i].classList.add('hit'); setTimeout(function () { lis[i].classList.remove('hit'); }, 900); }
        b.h = Math.max(reduced ? 1 : 0.18, b.h - dt * 0.45);
        var x = c + Math.cos(b.a) * b.r * R, y = c + Math.sin(b.a) * b.r * R;
        ctx.strokeStyle = 'rgba(254,135,50,' + b.h + ')'; ctx.lineWidth = 1 * pr;
        ctx.beginPath(); ctx.arc(x, y, (5 + (1 - b.h) * 10) * pr, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = 'rgba(254,135,50,' + (0.4 + b.h * 0.6) + ')'; ctx.shadowColor = '#fe8732'; ctx.shadowBlur = 12 * pr * b.h;
        ctx.beginPath(); ctx.arc(x, y, 3.2 * pr, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
        ctx.fillStyle = 'rgba(232,238,246,' + (0.45 + b.h * 0.55) + ')';
        var right = Math.cos(b.a) >= -0.2; ctx.textAlign = right ? 'left' : 'right';
        ctx.fillText(b.n.toLocaleUpperCase('tr-TR'), x + (right ? 10 : -10) * pr, y);
      });
      ctx.fillStyle = '#fe8732'; ctx.beginPath(); ctx.arc(c, c, 3 * pr, 0, Math.PI * 2); ctx.fill();
      deg.textContent = ('00' + Math.round(sweep * 180 / Math.PI)).slice(-3) + '°';
    };
    if (reduced) draw(0, 0);
    addLoop(cv, draw);
  })();

  /* =========================================================
     RAKAMLAR — dairesel göstergeler
     ========================================================= */
  (function dials() {
    var NS = 'http://www.w3.org/2000/svg';
    if (D.clients.length) { $('#dialBrands').dataset.to = D.clients.length; $('#clientCount').textContent = D.clients.length; }
    $$('.dial').forEach(function (d, i) {
      var svg = $('svg', d), C = 2 * Math.PI * 82, html = '';
      html += '<defs><linearGradient id="dg' + i + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffb400"/><stop offset=".5" stop-color="#fe8732"/><stop offset="1" stop-color="#d54900"/></linearGradient></defs>';
      html += '<g class="spin2">';
      for (var t = 0; t < 72; t++) {
        var a = t / 72 * Math.PI * 2, r1 = t % 6 ? 94 : 90, r2 = 99;
        html += '<line x1="' + (100 + Math.cos(a) * r1).toFixed(2) + '" y1="' + (100 + Math.sin(a) * r1).toFixed(2) + '" x2="' + (100 + Math.cos(a) * r2).toFixed(2) + '" y2="' + (100 + Math.sin(a) * r2).toFixed(2) + '" stroke="' + (t % 6 ? 'rgba(45,226,230,.28)' : 'rgba(45,226,230,.75)') + '" stroke-width="1"/>';
      }
      html += '</g>';
      html += '<circle cx="100" cy="100" r="82" fill="none" stroke="rgba(45,226,230,.1)" stroke-width="7"/>';
      html += '<circle class="arc" cx="100" cy="100" r="82" fill="none" stroke="url(#dg' + i + ')" stroke-width="7" stroke-dasharray="' + C.toFixed(2) + '" stroke-dashoffset="' + C.toFixed(2) + '" transform="rotate(-90 100 100)" style="filter:drop-shadow(0 0 6px rgba(254,135,50,.7))"/>';
      html += '<circle class="spin" cx="100" cy="100" r="70" fill="none" stroke="rgba(45,226,230,.45)" stroke-width="1" stroke-dasharray="2 6"/>';
      html += '<circle class="spin2" cx="100" cy="100" r="63" fill="none" stroke="rgba(254,135,50,.35)" stroke-width="1" stroke-dasharray="40 12 4 12"/>';
      svg.innerHTML = html;
      d._C = C;
    });
    function fire(d) {
      if (d._done) return; d._done = true;
      var arc = $('.arc', d), dv = $('.dv', d), to = +d.dataset.to, suf = d.dataset.suf, fill = +d.dataset.fill;
      var isK = suf === 'K+', target = isK ? to * 1000 : to;
      arc.style.strokeDashoffset = (d._C * (1 - fill)).toFixed(2);
      if (reduced) { dv.textContent = to + suf; return; }
      var s0 = performance.now();
      (function st(now) {
        var p = clamp((now - s0) / 2000, 0, 1), e = 1 - Math.pow(1 - p, 4), v = target * e;
        dv.textContent = p < 1 ? (isK ? fmt(v) : Math.round(v) + (p > 0.98 ? suf : '')) : to + suf;
        if (p < 1) requestAnimationFrame(st);
      })(s0);
    }
    var dd = $$('.dial');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { fire(e.target); io.unobserve(e.target); } }); }, { threshold: 0.45 });
      dd.forEach(function (d) { io.observe(d); });
    } else dd.forEach(fire);
  })();

  /* =========================================================
     HİZMETLER — etkileşimli modüller
     ========================================================= */
  var SERVICES = [
    { name: 'Hedeflemeler ve Raporlama', tagline: 'Oasis Media ile her veri, bir fırsata dönüşür.',
      text: 'Oasis Media olarak, işletmenizin büyüme stratejilerine yön veren hizmetimizle, doğru kitleye doğru mesajı ulaştırmanıza destek oluyoruz. Bu hizmetle, kullanıcı davranışlarını detaylı bir şekilde analiz ederek, stratejik hedeflerinize uygun sonuçlar elde etmenizi sağlarız. Masaüstü platformlarında da uygulanabilen interaktif çözümlerimiz, kullanıcıların aktif katılımını teşvik ederek etkileşim oranlarını artırır. Detaylı raporlama ve analizlerle süreçlerinizin verimliliğini artırmanıza yardımcı oluyoruz.' },
    { name: 'Medya ve Reklam Planlama', tagline: 'Oasis Media ile fark edilmek artık daha kolay!',
      text: 'Hedeflerinize ulaşmanın yolu, doğru bir planlamadan geçer. Oasis Media, işletmenizin ihtiyaçlarına özel çözümlerle stratejik bir yol haritası çizer. Kullanıcı davranışlarını ve platform dinamiklerini analiz ederek, benzersiz kanallar üzerinden hedef kitlenize erişim sağlıyoruz. Anlık bildirimlerle tasarlanan bu planlama, kullanıcıların aktif katılım sağlamadığı durumlarda bile etkileşim oluşturacak çözümler üretir.' },
    { name: 'Oasis Network ve Üretim', tagline: 'Her adımda yanınızdayız; siz sadece büyümeye odaklanın!',
      text: 'Güçlü bağlantılar, büyük başarılar getirir. Oasis Media olarak, 300’ün üzerinde partner platformumuzla sizlere geniş bir erişim ağı ve etkili çözümler sunuyoruz. Oasis Network ve Üretim hizmetimiz, işletmenizin ihtiyaçlarına yönelik özelleştirilmiş içerik ve stratejik iş birlikleriyle, hedeflerinizi en verimli şekilde hayata geçirmenize yardımcı olur.' },
    { name: 'Web ve Mobil Geliştirme', tagline: 'Her platformda performans odaklı ve kullanıcı dostu projeler.',
      text: 'Teknolojinin hızla değişen dünyasında, işletmenizin dijital dönüşümünü hızlandırmak için doğru araçlar çok önemlidir. Oasis Media olarak, hem masaüstü hem de mobil platformlarda kullanıcı dostu, güvenli ve ölçeklenebilir çözümler sunuyoruz. İhtiyaçlarınıza özel tasarımlar ve işlevsel uygulamalarla, dijital varlığınızı güçlendirmek ve hedef kitlenize sorunsuz bir deneyim sunmak için yanınızdayız. Her platformda performans odaklı ve kullanıcı dostu projelerle işletmenizi geleceğe taşıyoruz.' },
    { name: 'Pazarlama ve Danışmanlık', tagline: 'Dijital dünyada başarıyı yakalamak için doğru adımları atmak, bizimle çok daha kolay!',
      text: 'İşletmenizin büyüme yolculuğunda doğru stratejilerle ilerlemek, her adımda başarıya ulaşmanıza yardımcı olur. Oasis Media olarak, markanızı daha geniş kitlelere tanıtmak ve hedeflerinize uygun etkili çözümler geliştirmek için yanınızdayız. Sektörel analizler, hedef kitle odaklı stratejiler ve veriye dayalı raporlamalar ile sizi en iyi şekilde yönlendiriyoruz.' },
    { name: 'Kullanıcı ve Yazılım Geliştirme', tagline: 'İhtiyaçlarınızı anlamak, doğru çözümü sunmak için yanınızdayız.',
      text: 'İnovasyonun kalbinde yer alan yazılım çözümleri, işletmenizin dijital dönüşümünü hızlandırır ve kullanıcı deneyimini üst seviyeye taşır. Oasis Media olarak, iş süreçlerinizi daha verimli hale getirecek özel yazılımlar geliştiriyoruz. Kullanıcı dostu arayüzler, yüksek performanslı altyapılar ve kişiye özel çözümlerle, her türlü dijital ihtiyacınıza yönelik özgün yazılımlar sunuyoruz. İhtiyaçlarınızı anlamak, doğru çözümü sunmak ve kullanıcı odaklı bir yaklaşım geliştirmek için yanınızdayız.' }
  ];
  (function services() {
    var ICONS = [
      '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/><path d="M12 1v4M12 19v4M1 12h4M19 12h4"/>',
      '<rect x="3" y="4" width="18" height="16"/><path d="M3 9h18M8 4v16M12 13h6M12 16h4"/>',
      '<circle cx="12" cy="12" r="2.5"/><circle cx="4" cy="5" r="2"/><circle cx="20" cy="5" r="2"/><circle cx="4" cy="19" r="2"/><circle cx="20" cy="19" r="2"/><path d="M6 6l4 4M18 6l-4 4M6 18l4-4M18 18l-4-4"/>',
      '<rect x="2" y="4" width="14" height="11"/><rect x="17" y="8" width="5" height="12"/><path d="M6 19h8M9 15v4"/>',
      '<path d="M3 20h18"/><path d="M5 16l4-5 4 3 6-8"/><path d="M15 6h4v4"/>',
      '<path d="M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>'
    ];
    var list = $('#svcList'), vName = $('#svcViewName'), vTag = $('#svcViewTag'), vText = $('#svcViewText'), vLbl = $('#svcViewLbl'), view = $('#svcView');
    list.innerHTML = SERVICES.map(function (s, i) {
      return '<button type="button" class="svc-mod" role="tab" id="svc-tab-' + i + '" aria-selected="false" data-i="' + i + '">' +
        '<span class="svc-ico"><svg viewBox="0 0 24 24" aria-hidden="true">' + ICONS[i] + '</svg></span>' +
        '<span><span class="nm">' + s.name + '</span><span class="tg">' + s.tagline + '</span></span>' +
        '<span class="ix">0' + (i + 1) + '</span>' +
        '<span class="more"><span class="tl">' + s.tagline + '</span><span class="mp">' + s.text + '</span></span>' +
        '<span class="bar" aria-hidden="true"><i style="--w:' + ri(42, 96) + '%"></i></span></button>';
    }).join('');
    view.classList.add('glow-border');
    var mods = $$('.svc-mod', list), curI = -1, typeId = 0;
    function select(i, toggle) {
      var mobile = innerWidth <= 960;
      if (mobile && toggle && i === curI) { mods[i].classList.toggle('on'); mods[i].setAttribute('aria-selected', mods[i].classList.contains('on')); return; }
      if (i === curI && !mobile) return;
      curI = i;
      mods.forEach(function (m, k) { m.classList.toggle('on', k === i); m.setAttribute('aria-selected', k === i); });
      var s = SERVICES[i];
      vLbl.textContent = 'MODÜL 0' + (i + 1) + ' / 06';
      vName.textContent = s.name; vTag.textContent = '// ' + s.tagline;
      cancelAnimationFrame(typeId);
      if (reduced || mobile) { vText.textContent = s.text; return; }
      var t0 = performance.now(), L = s.text.length;
      (function ty(now) {
        var n = Math.min(L, Math.round((now - t0) / 1000 * 900));
        vText.innerHTML = s.text.slice(0, n) + (n < L ? '<span class="cursor-blk"></span>' : '');
        if (n < L) typeId = requestAnimationFrame(ty);
      })(t0);
    }
    var hoverT;
    mods.forEach(function (m, i) {
      m.addEventListener('click', function () { select(i, true); });
      if (fine) {
        m.addEventListener('pointerenter', function () { clearTimeout(hoverT); hoverT = setTimeout(function () { if (innerWidth > 960) select(i); }, 160); });
        m.addEventListener('pointerleave', function () { clearTimeout(hoverT); });
      }
    });
    select(0);
    if (innerWidth <= 960) { mods[0].classList.remove('on'); mods[0].setAttribute('aria-selected', 'false'); curI = -1; }

    // dalga grafiği
    var sc = $('#svcSpark'), sx = sc.getContext('2d');
    function sz() { var r = sc.getBoundingClientRect(), pr = Math.min(2, devicePixelRatio || 1); sc.width = Math.max(1, r.width * pr); sc.height = Math.max(1, r.height * pr); }
    sz(); addEventListener('resize', sz);
    var drawWave = function (now) {
      var w = sc.width, h = sc.height, t = now / 1000, k = Math.max(0, curI) + 1; sx.clearRect(0, 0, w, h);
      var cols = 64, bw = w / cols;
      for (var i = 0; i < cols; i++) {
        var v = 0.5 + 0.28 * Math.sin(i * 0.22 * k * 0.5 + t * 2) + 0.18 * Math.sin(i * 0.61 + t * 3.1 + k);
        v = clamp(v, 0.06, 1);
        sx.fillStyle = i / cols < (0.35 + k * 0.1) ? 'rgba(254,135,50,.75)' : 'rgba(45,226,230,.45)';
        sx.fillRect(i * bw + 1, h - v * h * 0.85, bw - 2, v * h * 0.85);
      }
    };
    if (reduced) drawWave(0);
    addLoop(sc, drawWave);
  })();

  /* =========================================================
     PROJELER — marka listesi + (sunucuda) PDF kapağı
     ========================================================= */
  (function projects() {
    var bl = $('#brandList');
    bl.innerHTML = bl.dataset.brands.split(/,\s*/).map(function (b) { return '<span>' + b.replace(/&/g, '&amp;') + '</span>'; }).join('');
    var projSec = $('#projeler'), PDF_URL = projSec.dataset.pdf, PDFJS = 'vendor/pdfjs/';
    function loadPdfJs() {
      if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
      return new Promise(function (res, rej) {
        var sc = document.createElement('script'); sc.src = PDFJS + 'pdf.min.js';
        sc.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); };
        sc.onerror = rej; document.head.appendChild(sc);
      });
    }
    function cover() {
      if (location.protocol === 'file:' || !window.fetch) return; // dosyadan açıldığında tasarım kapağı kalır
      fetch(PDF_URL).then(function (r) { if (!r.ok) throw r.status; return r.arrayBuffer(); })
        .then(function (data) { return loadPdfJs().then(function (lib) { return lib.getDocument({ data: data }).promise; }); })
        .then(function (pdf) {
          $('#pdfMeta').textContent = 'PDF · ' + pdf.numPages + ' SAYFA';
          return pdf.getPage(1).then(function (page) {
            var c = $('#pdfThumb'), base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: 1280 / base.width });
            c.width = vp.width; c.height = vp.height;
            return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function () { c.hidden = false; $('#pdfDesign').hidden = true; });
          });
        }).catch(function () { /* tasarım kapağı kalır */ });
    }
    if ('IntersectionObserver' in window) {
      var pio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { pio.disconnect(); cover(); } }, { rootMargin: '500px' });
      pio.observe(projSec);
    } else cover();
  })();

  /* =========================================================
     MÜŞTERİLER — taranan logo duvarı
     ========================================================= */
  var NAMES = { a90: 'A90 Pictures', anabank: 'Anadolubank', bparmak: 'Balparmak', btoptan: 'Bizim Toptan', ck: 'Calvin Klein', cocacola: 'Coca-Cola', cs: 'CarrefourSA', ct: 'Cola Turka', gbbva: 'Garanti BBVA', hm: 'H&M', lufi: 'Lufian', ing: 'ING', bmw: 'BMW', bim: 'BİM', jbl: 'JBL', qnb: 'QNB', teb: 'TEB', vw: 'Volkswagen', tt: 'Türk Telekom', 'ford-trucks': 'Ford Trucks', 'm-coco': 'M.Coco' };
  var nameOf = function (k2) { var l = k2.toLowerCase(); return NAMES[l] || (k2.charAt(0).toUpperCase() + k2.slice(1)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  (function clients() {
    var grid = $('#wallGrid'), beam = $('#wallBeam'), wall = $('#wall'), pctEl = $('#scanPct'), nmEl = $('#scanName');
    grid.innerHTML = D.clients.map(function (c) {
      var n = esc(nameOf(c.key));
      return '<div class="tile' + (c.dark ? ' dark' : '') + '" data-n="' + n + '"><img src="' + esc(c.logo) + '" alt="' + n + '" loading="lazy" decoding="async"><span class="nm">' + n + '</span></div>';
    }).join('');
    var tiles = $$('.tile', grid), rows = [], gh = 1, top0 = 0;
    function measure() {
      rows = []; var map = {};
      top0 = grid.offsetTop; gh = grid.clientHeight;
      tiles.forEach(function (t) { var k = t.offsetTop; if (!map[k]) { map[k] = { top: k, bot: k + t.offsetHeight, tiles: [] }; rows.push(map[k]); } map[k].tiles.push(t); });
    }
    measure(); addEventListener('resize', measure); addEventListener('load', measure);
    var more = $('#wallMore');
    more.addEventListener('click', function () {
      var open = wall.classList.toggle('clip') === false;
      more.setAttribute('aria-expanded', open);
      $('span', more).textContent = open ? 'Daha az göster' : 'Tüm markaları göster';
      $('i', more).textContent = open ? '−' : '+';
      measure();
      if (!open) wall.scrollIntoView({ block: 'start' });
    });
    $('span', more).textContent = 'Tüm markaları göster (' + D.clients.length + ')';
    var by = 0, lastRow = null;
    var scan = function (now, dt) {
      by += dt * 230; if (by > gh + 120) by = -60;
      beam.style.transform = 'translateY(' + (top0 + by).toFixed(1) + 'px)';
      pctEl.textContent = ('00' + Math.round(clamp(by / gh, 0, 1) * 100)).slice(-3) + '%';
      for (var i = 0; i < rows.length; i++) {
        var R = rows[i], on = by >= R.top - 10 && by <= R.bot + 16;
        if (on !== R.on) { R.on = on; R.tiles.forEach(function (t) { t.classList.toggle('lit', on); }); if (on && R !== lastRow) { lastRow = R; nmEl.textContent = pick(R.tiles).getAttribute('data-n'); } }
      }
    };
    if (!reduced) addLoop(wall, scan);
    else { pctEl.textContent = '100%'; nmEl.textContent = D.clients.length + ' MARKA'; }
  })();

  /* =========================================================
     İŞ ORTAKLARI — dönen ağ diyagramı
     ========================================================= */
  (function network() {
    var net = $('#net'), cv = $('#netCanvas'), ctx = cv.getContext('2d'), wrap = $('#netNodesWrap'), pkEl = $('#netPk');
    var P = D.partners, n = P.length;
    $('#netNodes').textContent = n;
    var nIn = Math.min(10, Math.round(n * 0.42));
    wrap.innerHTML = P.map(function (p, i) {
      var nm = esc(p.key.replace(/-\d+$/, ''));
      return '<div class="nnode" title="' + nm + '"><img src="' + esc(p.logo) + '" alt="Yayıncı partner: ' + nm + '" loading="lazy" decoding="async"></div>';
    }).join('');
    var nodes = $$('.nnode', wrap).map(function (el, i) {
      var inner = i < nIn, k = inner ? i : i - nIn, cnt = inner ? nIn : n - nIn;
      return { el: el, inner: inner, a0: k / cnt * Math.PI * 2 + (inner ? 0 : 0.2), r: inner ? 0.27 : 0.43, x: 0, y: 0, hot: 0 };
    });
    var S = 1, pr = 1, rot = 0, pk = [], spawnAcc = 0;
    function size() { var r = net.getBoundingClientRect(); pr = Math.min(2, devicePixelRatio || 1); S = r.width; cv.width = Math.max(1, S * pr); cv.height = Math.max(1, S * pr); }
    size(); addEventListener('resize', function () { size(); if (reduced) draw(0, 0); });
    function nearestInner(o) { var best = nodes[0], bd = 1e9; for (var i = 0; i < nIn; i++) { var d = Math.pow(nodes[i].x - o.x, 2) + Math.pow(nodes[i].y - o.y, 2); if (d < bd) { bd = d; best = nodes[i]; } } return best; }
    function spawn() {
      var outer = Math.random() < 0.55;
      if (outer && n > nIn) { var o = nodes[ri(nIn, n - 1)]; pk.push({ from: null, to: o, via: true, t: 0, sp: rand(0.6, 1.1), c: 1 }); }
      else pk.push({ from: null, to: nodes[ri(0, nIn - 1)], t: 0, sp: rand(0.7, 1.2), c: 0 });
    }
    var draw = function (now, dt) {
      rot += dt * 0.12;
      var c = S / 2;
      nodes.forEach(function (nd) {
        var a = nd.a0 + (nd.inner ? rot : -rot * 0.6);
        nd.x = c + Math.cos(a) * nd.r * S; nd.y = c + Math.sin(a) * nd.r * S;
        nd.el.style.transform = 'translate(' + nd.x.toFixed(1) + 'px,' + nd.y.toFixed(1) + 'px)';
        if (nd.hot > 0) { nd.hot -= dt; if (nd.hot <= 0) nd.el.classList.remove('hot'); }
      });
      ctx.setTransform(pr, 0, 0, pr, 0, 0); ctx.clearRect(0, 0, S, S);
      // halkalar
      ctx.lineWidth = 1;
      [0.27, 0.43, 0.49].forEach(function (rr, i) {
        ctx.strokeStyle = i === 2 ? 'rgba(254,135,50,.25)' : 'rgba(45,226,230,.16)';
        ctx.setLineDash(i === 1 ? [3, 7] : i === 2 ? [1, 10] : []); ctx.lineDashOffset = -now / 60;
        ctx.beginPath(); ctx.arc(c, c, rr * S, 0, Math.PI * 2); ctx.stroke();
      });
      ctx.setLineDash([]);
      // süpürme yayı
      var sa = now / 1400;
      var grd = ctx.createRadialGradient(c, c, 0, c, c, S * 0.49); grd.addColorStop(0, 'rgba(45,226,230,0)'); grd.addColorStop(1, 'rgba(45,226,230,.12)');
      ctx.fillStyle = grd; ctx.beginPath(); ctx.moveTo(c, c); ctx.arc(c, c, S * 0.49, sa, sa + 0.5); ctx.closePath(); ctx.fill();
      // bağlantılar
      ctx.lineWidth = 1;
      for (var i = 0; i < nIn; i++) { ctx.strokeStyle = 'rgba(254,135,50,.28)'; ctx.beginPath(); ctx.moveTo(c, c); ctx.lineTo(nodes[i].x, nodes[i].y); ctx.stroke(); }
      for (var j = nIn; j < n; j++) { var o = nodes[j], ni = nearestInner(o); o.link = ni; ctx.strokeStyle = 'rgba(45,226,230,.22)'; ctx.beginPath(); ctx.moveTo(ni.x, ni.y); ctx.lineTo(o.x, o.y); ctx.stroke(); }
      // paketler
      spawnAcc += dt; while (spawnAcc > 0.12) { spawnAcc -= 0.12; if (pk.length < 40) spawn(); }
      for (var k = pk.length - 1; k >= 0; k--) {
        var p = pk[k]; p.t += dt * p.sp;
        var ax, ay, bx, by, tt;
        if (p.via) { var mid = p.to.link || nearestInner(p.to); if (p.t < 1) { ax = c; ay = c; bx = mid.x; by = mid.y; tt = p.t; } else { ax = mid.x; ay = mid.y; bx = p.to.x; by = p.to.y; tt = p.t - 1; } }
        else { ax = c; ay = c; bx = p.to.x; by = p.to.y; tt = p.t; }
        var end = p.via ? 2 : 1;
        if (p.t >= end) { p.to.hot = 0.45; p.to.el.classList.add('hot'); pk.splice(k, 1); continue; }
        var x = ax + (bx - ax) * tt, y = ay + (by - ay) * tt;
        ctx.fillStyle = p.c ? '#2de2e6' : '#ffb400'; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
      }
    };
    if (reduced) draw(0, 0);
    addLoop(net, draw);
    setInterval(function () { if (!document.hidden) pkEl.textContent = fmt(ri(1180, 1340)); }, 1000);
    pkEl.textContent = fmt(1260);
  })();

  /* =========================================================
     Başlıklarda decrypt + belirme
     ========================================================= */
  if ('IntersectionObserver' in window && !reduced) {
    var dio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { runDecrypt(e.target, 16); dio.unobserve(e.target); } }); }, { threshold: 0.4 });
    $$('.decrypt').forEach(function (h) { dio.observe(h); });
    var rio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } }); }, { threshold: 0.12 });
    $$('.reveal').forEach(function (el) { rio.observe(el); });
  } else {
    $$('.decrypt').forEach(function (h) { runDecrypt(h, 1); });
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  /* =========================================================
     Kopyala + iletişim formu
     ========================================================= */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy, done = function () { b.textContent = 'Kopyalandı ✓'; setTimeout(function () { b.textContent = 'Kopyala'; }, 1600); };
      var fallback = function () {
        var ta = document.createElement('textarea'); ta.value = t; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { b.textContent = t; }
        ta.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, fallback); else fallback();
    });
  });
  var form = $('#contactForm'), status = $('#formStatus');
  $$('input, textarea', form).forEach(function (f) { f.addEventListener('input', function () { f.closest('.fld').classList.remove('bad'); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    $$('.fld', form).forEach(function (l) { l.classList.remove('bad'); });
    if (!form.checkValidity()) {
      $$(':invalid', form).forEach(function (f) { var l = f.closest('.fld'); if (l) l.classList.add('bad'); });
      status.className = 'form-status err';
      var bad = form.querySelector(':invalid');
      status.textContent = '✕ HATA › ' + ((bad && bad.type === 'email' && bad.value) ? 'E-posta adresini kontrol edin (ör. ad@firma.com).' : 'Lütfen isim, soyisim, e-posta, konu ve mesaj alanlarını doldurun.');
      if (bad) bad.focus();
      return;
    }
    var v = function (id) { return $('#' + id).value.trim(); };
    var body = 'İsim: ' + v('f-name') + ' ' + v('f-surname') + '\nTelefon: ' + (v('f-phone') || '-') + '\nE-posta: ' + v('f-email') + '\n\n' + v('f-message');
    location.href = 'mailto:sales@oasismedia.com.tr?subject=' + encodeURIComponent(v('f-subject')) + '&body=' + encodeURIComponent(body);
    status.className = 'form-status ok';
    status.textContent = '✓ İLETİLDİ › E-posta uygulamanızda mesajınız hazırlandı. Açılmadıysa sales@oasismedia.com.tr adresine doğrudan yazabilirsiniz.';
  });

  startLoop();
})();
