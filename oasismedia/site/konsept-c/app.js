/* Oasis Media — Konsept C "Siberpunk / kod". Modül yok; file:// ile çift tıklayınca çalışır. */
(function () {
  'use strict';
  var D = window.OASIS_DATA || { clients: [], partners: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var isMobile = function () { return innerWidth < 641; };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var pick = function (arr) { return arr[(Math.random() * arr.length) | 0]; };
  var hidden = document.hidden;
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; });
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* depolama kapalı */ } }
  };
  var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var SCR = 'ABCDEFGHIJKLMNOPRSTUVYZ0123456789#$%&*+=<>/\\|[]{}';
  var scr = function (s) { var o = ''; for (var i = 0; i < s.length; i++) o += s[i] === ' ' ? ' ' : SCR[(Math.random() * SCR.length) | 0]; return o; };

  /* ---------- Metin çözme / yazma ---------- */
  // mode 'scramble': tüm metin karışık başlar, soldan sağa çözülür. 'type': daktilo, kalan metin görünmez yer tutar (sayfa zıplamaz).
  function decode(el, mode, dur, done) {
    if (el._dec) return; el._dec = 1;
    var html = el.innerHTML, text = el.textContent.replace(/\s+/g, ' ').trim(), n = text.length;
    if (reduced || !n) { if (done) done(); return; }
    dur = dur || (mode === 'type' ? clamp(n * 4, 500, 1700) : 900);
    var t0 = performance.now(), f = 0;
    (function step(now) {
      var p = clamp((now - t0) / dur, 0, 1), k = Math.floor(p * n);
      if (p >= 1) { el.innerHTML = html; if (done) done(); return; }
      if (f++ % 2 === 0) {
        if (mode === 'type') {
          var w = Math.min(4, n - k);
          el.innerHTML = esc(text.slice(0, k)) + '<span class="scr">' + esc(scr(text.slice(k, k + w))) + '</span><span class="ghost">' + esc(text.slice(k + w)) + '</span>';
        } else {
          el.innerHTML = esc(text.slice(0, k)) + '<span class="scr">' + esc(scr(text.slice(k))) + '</span>';
        }
      }
      requestAnimationFrame(step);
    })(t0);
  }
  function liveGlitch(el) { var g = el.closest('.glitch') || el; g.classList.add('live'); }

  /* ---------- Saatler, yıl ---------- */
  function clock() {
    var d = new Date(), p = function (x) { return (x < 10 ? '0' : '') + x; }, s = p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
    var a = $('#navClock'), b = $('#bootClock'); if (a) a.textContent = s; if (b) b.textContent = s;
  }
  clock(); setInterval(clock, 1000);
  $('#year').textContent = Math.max(2025, new Date().getFullYear());

  /* ---------- Marka sayısı ---------- */
  var NC = D.clients.length || 145;
  $$('.clientCount').forEach(function (el) { el.textContent = NC; });
  $('#clientsTitle').setAttribute('data-text', NC + ' marka bize güveniyor.');
  $('#statBrands').setAttribute('data-val', NC);
  $('#statBrands .stat-v').textContent = NC;

  /* =========================================================
     ARKA PLAN 1 — three.js sentwave ufku: neon zemin ızgarası + çizgili güneş
     ========================================================= */
  var horizon = (function () {
    var cv = $('#horizon'), api = { scroll: 0 };
    if (!window.THREE) return api;
    var renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, alpha: false, powerPreference: 'low-power' }); }
    catch (e) { return api; }
    var FS = [
      'precision highp float;',
      'varying vec2 vUv;',
      'uniform float uT; uniform vec2 uR; uniform float uS; uniform vec3 uSun;',
      'float h1(float n){return fract(sin(n)*43758.5453);}',
      'float nz(float x){float i=floor(x),f=fract(x);return mix(h1(i),h1(i+1.),f*f*(3.-2.*f));}',
      'void main(){',
      '  vec2 uv=vUv; float asp=uR.x/uR.y; float hz=uSun.y; float sx=uSun.x; float R=uSun.z;',
      '  vec3 bg=vec3(.027,.024,.043); vec3 col;',
      '  if(uv.y>=hz){',
      '    float h=(uv.y-hz)/(1.-hz);',
      '    col=mix(vec3(.17,.035,.15),bg,pow(h,.5));',
      '    col+=vec3(1.,.33,.12)*.22*exp(-h*9.);',
      '    vec2 st=floor(uv*uR/3.); float s=h1(st.x*91.7+st.y*7.13); col+=vec3(.8,.9,1.)*step(.9975,s)*h*(.5+.5*sin(uT*2.+s*80.));',
      '    vec2 p=vec2((uv.x-sx)*asp,uv.y-(hz+R*.62)); float d=length(p);',
      '    float sy=clamp((p.y+R)/(2.*R),0.,1.);',
      '    float sun=smoothstep(R,R-.003,d);',
      '    float band=fract(sy*15.-uT*.12); float gap=clamp((.56-sy)*1.25,0.,1.);',
      '    sun*=1.-step(band,gap)*step(sy,.56);',
      '    vec3 sc=mix(vec3(1.,.17,.62),vec3(1.,.53,.2),smoothstep(.0,.45,sy)); sc=mix(sc,vec3(1.,.78,.18),smoothstep(.5,1.,sy));',
      '    float glow=exp(-max(d-R,0.)*7.)*.55;',
      '    col=mix(col,sc,sun)+vec3(1.,.38,.16)*glow*(1.-sun);',
      '    float x=uv.x*asp;',
      '    float m=hz+.012+.055*pow(nz(x*3.1+4.),2.)+.025*nz(x*9.7)+.01*nz(x*31.);',
      '    m-= .045*exp(-pow((uv.x-sx)*asp*3.2,2.));',
      '    if(uv.y<m){ float e=smoothstep(.0035,0.,m-uv.y); col=mix(vec3(.035,.018,.06),vec3(0.,.94,1.),e*.85); col+=vec3(1.,.3,.5)*.06*(1.-(m-uv.y)/.08); }',
      '  } else {',
      '    float d=hz-uv.y; float z=.14/max(d,.0005);',
      '    float wx=(uv.x-sx)*asp*z*7.; float wz=z*5.+uT*1.1;',
      '    vec2 g=vec2(wx,wz); vec2 fw=max(fwidth(g),vec2(1e-4)); vec2 fr=abs(fract(g-.5)-.5);',
      '    vec2 ln=1.-smoothstep(vec2(0.),fw*1.6,fr);',
      '    float fade=1.-smoothstep(.12,.55,fw.y); float fadeX=1.-smoothstep(.2,.6,fw.x);',
      '    float L=max(ln.x*fadeX,ln.y*fade);',
      '    vec3 lc=mix(vec3(1.,.17,.84),vec3(1.,.55,.2),smoothstep(.0,.18,d)); lc=mix(lc,vec3(1.,.72,.2),smoothstep(.25,.6,d));',
      '    col=mix(vec3(.05,.02,.07),bg,smoothstep(0.,.5,d));',
      '    col+=lc*L*(.55+.45*smoothstep(0.,.3,d));',
      '    col+=vec3(1.,.4,.15)*.35*exp(-d*14.)*exp(-pow((uv.x-sx)*asp*2.2,2.));',
      '  }',
      '  col+=vec3(1.,.45,.7)*.55*exp(-abs(uv.y-hz)*160.);',
      '  float vg=smoothstep(1.25,.35,length((uv-.5)*vec2(asp*.7,1.)));',
      '  col*=mix(.55,1.,vg);',
      '  col*=mix(1.,.34,uS);',
      '  gl_FragColor=vec4(col,1.);',
      '}'
    ].join('\n');
    var uniforms = { uT: { value: 0 }, uR: { value: new THREE.Vector2(1, 1) }, uS: { value: 0 }, uSun: { value: new THREE.Vector3(.7, .36, .24) } };
    var mat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader: FS, depthTest: false, depthWrite: false
    });
    var scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
    var lastW = 0, lastH = 0;
    function size() {
      var w = innerWidth, h = innerHeight;
      if (w === lastW && Math.abs(h - lastH) < 120 && lastH) return; // mobil adres çubuğu titremesin
      lastW = w; lastH = h;
      var mob = w < 760;
      renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mob ? 1 : 1.5));
      renderer.setSize(w, h, false);
      uniforms.uR.value.set(w, h);
      var asp = w / h;
      uniforms.uSun.value.set(mob ? .5 : .72, mob ? .3 : .36, Math.min(mob ? .2 : .26, asp * .42));
    }
    size(); addEventListener('resize', size);
    var t0 = performance.now(), last = 0, scrollT = 0;
    function frame(now) {
      requestAnimationFrame(frame);
      if (hidden) return;
      var mob = lastW < 760;
      if (now - last < (mob ? 33 : 16)) return; last = now;
      scrollT += (api.scroll - scrollT) * .08;
      uniforms.uT.value = (now - t0) / 1000;
      uniforms.uS.value = scrollT;
      renderer.render(scene, cam);
    }
    try {
      renderer.render(scene, cam);
      if (!reduced) requestAnimationFrame(frame);
      else addEventListener('scroll', function () { uniforms.uS.value = api.scroll; renderer.render(scene, cam); }, { passive: true });
    } catch (e) { /* kalıp CSS degrade kalır */ }
    return api;
  })();

  /* =========================================================
     ARKA PLAN 2 — kod yağmuru (katakana + rakam + Türkçe kelimeler)
     ========================================================= */
  (function () {
    var cv = $('#rain'), ctx = cv.getContext('2d');
    var KATA = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン';
    var POOL = KATA + KATA + '0123456789012345<>=+*';
    var WORDS = ['HEDEF', 'KPI', 'ERİŞİM', '300+', 'OASIS', 'REKLAM', 'VERİ', 'ROI', 'CPM', 'AĞ', '145', '2K+', 'MEDYA', 'CTR', 'YAYIN', 'RAPOR'];
    var COLS = [['#fe8732', 7], ['#00f0ff', 3], ['#ffb400', 2], ['#ff2bd6', 1]];
    var palette = []; COLS.forEach(function (c) { for (var i = 0; i < c[1]; i++) palette.push(c[0]); });
    var W, H, fs, drops = [], dpr;
    function size() {
      W = innerWidth; H = innerHeight; dpr = isMobile() ? 1 : Math.min(devicePixelRatio || 1, 1.5);
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fs = W < 641 ? 14 : 17;
      var n = Math.ceil(W / fs);
      drops = [];
      for (var i = 0; i < n; i++) drops.push(newDrop(true));
    }
    function newDrop(init) {
      var w = Math.random() < .16 ? pick(WORDS) : null;
      return { y: init ? rnd(-H / fs, H / fs) : rnd(-24, -1), sp: rnd(.25, .9), word: w, wi: 0, c: pick(palette), last: -99, prev: '' };
    }
    function step() {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,.085)'; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      ctx.font = '500 ' + fs + 'px "JetBrains Mono", "MS Gothic", "Hiragino Kaku Gothic Pro", monospace';
      ctx.textBaseline = 'top';
      for (var i = 0; i < drops.length; i++) {
        var d = drops[i]; d.y += d.sp;
        var row = Math.floor(d.y);
        if (row === d.last) continue;
        var x = i * fs;
        if (d.prev && d.last >= 0) { ctx.fillStyle = d.c; ctx.fillText(d.prev, x, d.last * fs); }
        d.last = row;
        if (row < 0) continue;
        var ch = d.word ? d.word[d.wi++ % d.word.length] : POOL[(Math.random() * POOL.length) | 0];
        if (d.word && d.wi > d.word.length * 2) d.word = null;
        ctx.fillStyle = d.word ? '#fff3d6' : '#f4fbff';
        ctx.fillText(ch, x, row * fs);
        d.prev = ch;
        if (row * fs > H + 40 && Math.random() > .96) drops[i] = newDrop(false);
      }
    }
    size();
    var lw = W;
    addEventListener('resize', function () { if (innerWidth !== lw || Math.abs(innerHeight - H) > 120) { lw = innerWidth; size(); } });
    if (reduced) { for (var k = 0; k < 70; k++) step(); return; }
    var last = 0;
    (function loop(now) {
      requestAnimationFrame(loop);
      if (hidden || now - last < 55) return;
      last = now; step();
    })(0);
  })();

  /* =========================================================
     İmleç: artı nişangâh + parlayan iz
     ========================================================= */
  if (fine && !reduced) {
    root.classList.add('has-cursor');
    var cur = $('#cursor'), xy = $('#cursorXY'), tr = $('#trail'), tctx = tr.getContext('2d');
    var mx = -100, my = -100, pts = [], moving = 0, running = false;
    var tsize = function () { tr.width = innerWidth; tr.height = innerHeight; };
    tsize(); addEventListener('resize', tsize);
    var pad = function (v) { v = Math.round(v); return ('0000' + v).slice(-4); };
    addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY; moving = performance.now();
      cur.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      xy.textContent = 'x:' + pad(mx) + ' y:' + pad(my);
      if (!running) { running = true; requestAnimationFrame(trail); }
    }, { passive: true });
    addEventListener('pointerdown', function () { cur.classList.add('down'); });
    addEventListener('pointerup', function () { cur.classList.remove('down'); });
    document.addEventListener('pointerover', function (e) {
      cur.classList.toggle('link', !!e.target.closest('a, button, label, .tile, .node, .holo, input, textarea'));
    });
    document.addEventListener('mouseleave', function () { mx = my = -100; cur.style.transform = 'translate(-100px,-100px)'; });
    var trail = function () {
      pts.push([mx, my]); if (pts.length > 22) pts.shift();
      tctx.clearRect(0, 0, tr.width, tr.height);
      tctx.globalCompositeOperation = 'lighter'; tctx.lineCap = 'round';
      for (var i = 1; i < pts.length; i++) {
        var a = i / pts.length;
        tctx.strokeStyle = 'rgba(' + (i % 2 ? '254,135,50,' : '0,240,255,') + (a * .5) + ')';
        tctx.lineWidth = a * 6;
        tctx.beginPath(); tctx.moveTo(pts[i - 1][0], pts[i - 1][1]); tctx.lineTo(pts[i][0], pts[i][1]); tctx.stroke();
      }
      if (performance.now() - moving < 500) requestAnimationFrame(trail);
      else { running = false; pts = []; tctx.clearRect(0, 0, tr.width, tr.height); }
    };
  }

  /* =========================================================
     Menü, ilerleme, etkin bölüm, kaydırma glitch'i
     ========================================================= */
  var nav = $('#nav'), burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }); });
  var sections = $$('main section[id]').filter(function (s) { return s.id !== 'ust'; });
  var navAs = $$('#navLinks a'), progress = $('#progress'), gf = $('#glitchFlash');
  var lastY = scrollY, lastFlash = 0, curSec = '';
  function flash() {
    if (reduced) return;
    var now = performance.now(); if (now - lastFlash < 2200) return; lastFlash = now;
    $$('i', gf).forEach(function (s) {
      s.style.top = rnd(0, 96) + 'vh'; s.style.height = rnd(3, 34) + 'px';
      s.style.transform = 'translateX(' + rnd(-40, 40) + 'px)';
    });
    gf.classList.add('on'); setTimeout(function () { gf.classList.remove('on'); }, 170);
  }
  function onScroll() {
    var y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')';
    horizon.scroll = clamp(y / innerHeight, 0, 1);
    document.body.classList.toggle('scrolled', y > innerHeight * .6);
    var c = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * .45) c = s.id; });
    if (c !== curSec) { if (curSec && c) flash(); curSec = c; navAs.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + c); }); }
    if (Math.abs(y - lastY) > 160) flash();
    lastY = y;
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Kayan bant ---------- */
  var TICK = ['<b>●</b> 300+ SİTE ÜZERİNDE YAYIN', '<em>◆</em> KPI ODAKLI HEDEFLEME', '<b>●</b> FİNANS · OTOMOTİV · MARKET · SPOR · KADIN · TEKNOLOJİ', '<em>◆</em> ' + NC + ' MARKA', '<b>●</b> 2K+ TAMAMLANMIŞ PROJE', '<em>◆</em> EXCLUSIVE SİTELER', '<b>●</b> 10 YILLIK TECRÜBE', '<em>◆</em> DETAYLI RAPORLAMA'];
  var tk = TICK.map(function (t) { return '<span>' + t + '</span>'; }).join('');
  $('#ticker').innerHTML = tk + tk;

  /* =========================================================
     Görünüme girince: glitch ile belirme + metin çözme
     ========================================================= */
  var hasIO = 'IntersectionObserver' in window;
  function observe(els, cb, opt) {
    if (!hasIO) { els.forEach(cb); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); cb(e.target); } }); }, opt || { threshold: .15 });
    els.forEach(function (el) { io.observe(el); });
  }
  function startReveals() {
    observe($$('[data-reveal]'), function (el) { el.classList.add('in'); }, { threshold: .08 });
    observe($$('.sec .dec'), function (el) { setTimeout(function () { decode(el, 'scramble', 850, function () { liveGlitch(el); }); }, 120); }, { threshold: .4 });
    observe($$('[data-type]'), function (el) { setTimeout(function () { decode(el, 'type'); }, 200); }, { threshold: .25 });
  }

  /* =========================================================
     HERO
     ========================================================= */
  function startHero() {
    var lines = $$('#heroTitle .dec');
    lines.forEach(function (el, i) { setTimeout(function () { decode(el, 'scramble', 750 + i * 120, function () { liveGlitch(el); }); }, i * 170); });
    var cmd = $('#heroCmd'), full = cmd.textContent;
    if (reduced) return;
    cmd.textContent = '';
    var i = 0;
    (function t() { cmd.textContent = full.slice(0, ++i); if (i < full.length) setTimeout(t, 16); })();
  }
  // Açılıştan önce hero metni karışık dursun
  if (!reduced) $$('#heroTitle .dec').forEach(function (el) { el.setAttribute('data-orig', el.textContent); el.textContent = scr(el.textContent); el._pre = 1; });
  function restoreHeroPre() { $$('#heroTitle .dec').forEach(function (el) { if (el._pre) { el.textContent = el.getAttribute('data-orig'); el._pre = 0; } }); }

  /* =========================================================
     AÇILIŞ: terminal önyükleme → glitch → piksel-sıralama erimesi
     ========================================================= */
  var boot = $('#boot');
  function siteStart() { restoreHeroPre(); startHero(); startReveals(); }
  if (reduced || store.get('oasis-c-boot')) {
    boot.parentNode.removeChild(boot); siteStart();
  } else {
    store.set('oasis-c-boot', '1');
    root.classList.add('booting');
    runBoot();
  }
  function runBoot() {
    var log = $('#bootLog'), ended = false, timers = [];
    var ASCII = [
      '  ___   _   ___ ___ ___   __  __ ___ ___ ___   _',
      ' / _ \\ /_\\ / __|_ _/ __| |  \\/  | __|   \\_ _| /_\\',
      '| (_) / _ \\\\__ \\| |\\__ \\ | |\\/| | _|| |) | | / _ \\',
      ' \\___/_/ \\_\\___/___|___/ |_|  |_|___|___/___/_/ \\_\\'
    ].join('\n');
    var STEPS = [
      { plain: '$ oasis --init network', html: '<span class="cmdl">$ oasis <b>--init</b> network</span>', cps: 26 },
      { plain: '> ağ taranıyor  [████████████████] 100%', html: '<span class="dim">&gt; ağ taranıyor  [</span><span class="ok">████████████████</span><span class="dim">] 100%</span>', cps: 4 },
      { plain: '> 300+ site bağlandı ✓', html: '&gt; 300+ site bağlandı <span class="ok">✓</span>', cps: 6 },
      { plain: '> KPI hedefleme modülü yüklendi ✓', html: '&gt; KPI hedefleme modülü yüklendi <span class="ok">✓</span>', cps: 5 },
      { plain: '> raporlama servisi aktif ✓', html: '&gt; raporlama servisi aktif <span class="ok">✓</span>', cps: 5 },
      { plain: '> erişim: YETKİLİ', html: '&gt; erişim: <span class="au">YETKİLİ</span>', cps: 6 }
    ];
    var done = '<span class="ascii">' + esc(ASCII) + '</span>';
    log.innerHTML = done + '<span class="cur"></span>';
    var si = 0;
    function nextStep() {
      if (ended) return;
      if (si >= STEPS.length) { timers.push(setTimeout(finish, 260)); return; }
      var s = STEPS[si++], k = 0;
      (function typeIt() {
        if (ended) return;
        k = Math.min(s.plain.length, k + (s.cps < 10 ? 3 : 1));
        log.innerHTML = done + esc(s.plain.slice(0, k)) + '<span class="cur"></span>';
        if (k < s.plain.length) timers.push(setTimeout(typeIt, s.cps < 10 ? s.cps * 3 : s.cps));
        else { done += s.html + '\n'; log.innerHTML = done + '<span class="cur"></span>'; timers.push(setTimeout(nextStep, si === 1 ? 160 : 110)); }
      })();
    }
    timers.push(setTimeout(nextStep, 200));
    function finish(fast) {
      if (ended) return; ended = true; timers.forEach(clearTimeout);
      removeEventListener('keydown', onKey); boot.removeEventListener('click', onSkip);
      boot.classList.add('glitching');
      setTimeout(melt, fast ? 60 : 300);
    }
    function onKey() { finish(true); }
    function onSkip() { finish(true); }
    addEventListener('keydown', onKey); boot.addEventListener('click', onSkip);
    // safety: en fazla 3.5 sn
    timers.push(setTimeout(function () { finish(true); }, 2950));

    function melt() {
      var cv = $('#bootMelt'), ctx = cv.getContext('2d'), W = innerWidth, H = innerHeight;
      cv.width = W; cv.height = H;
      boot.classList.remove('glitching'); boot.classList.add('melting');
      root.classList.remove('booting');
      siteStart();
      var cols = [], x = 0, PAL = ['#fe8732', '#ffb400', '#ff2bd6', '#00f0ff', '#fe8732'];
      while (x < W) {
        var w = Math.round(rnd(3, 14)), u = x / W;
        cols.push({ x: x, w: w, d: rnd(0, .32) + Math.abs(u - .5) * .1, L: rnd(30, 220), c: PAL[Math.min(4, Math.floor(clamp(u + rnd(-.12, .12), 0, .999) * 4.99))] });
        x += w;
      }
      var t0 = performance.now(), DUR = 520;
      (function f(now) {
        var t = (now - t0) / DUR;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < cols.length; i++) {
          var c = cols[i], p = clamp((t - c.d) / (1 - .32), 0, 1), e = p * p;
          var y = e * (H + c.L + 40);
          ctx.fillStyle = '#07060b'; ctx.fillRect(c.x, y, c.w, H - y + 1);
          var g = ctx.createLinearGradient(0, y - c.L * .25, 0, y + c.L);
          g.addColorStop(0, 'rgba(7,6,11,0)'); g.addColorStop(.22, c.c); g.addColorStop(1, 'rgba(7,6,11,1)');
          ctx.fillStyle = g; ctx.fillRect(c.x, y - c.L * .25, c.w, c.L * 1.25);
        }
        if (t < 1.02) requestAnimationFrame(f);
        else if (boot.parentNode) boot.parentNode.removeChild(boot);
      })(t0);
    }
  }

  /* =========================================================
     RAKAMLAR — yedi segment sayaçlar
     ========================================================= */
  (function () {
    var T = 9, h = T / 2;
    function H(y, x1, x2) { return [x1, y, x1 + h, y - h, x2 - h, y - h, x2, y, x2 - h, y + h, x1 + h, y + h].join(','); }
    function V(x, y1, y2) { return [x, y1, x + h, y1 + h, x + h, y2 - h, x, y2, x - h, y2 - h, x - h, y1 + h].join(','); }
    var SEG = { a: H(6, 8, 50), b: V(52, 8, 48), c: V(52, 52, 92), d: H(94, 8, 50), e: V(6, 52, 92), f: V(6, 8, 48), g: H(50, 8, 50) };
    var MAP = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abcdfg'];
    var NS = 'http://www.w3.org/2000/svg';
    function digit() {
      var svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 58 100');
      svg._s = {};
      'abcdefg'.split('').forEach(function (k) { var p = document.createElementNS(NS, 'polygon'); p.setAttribute('points', SEG[k]); p.setAttribute('class', 's'); svg.appendChild(p); svg._s[k] = p; });
      return svg;
    }
    function setD(svg, v) { var on = v === '-' ? 'g' : (MAP[v] || ''); for (var k in svg._s) svg._s[k].setAttribute('class', on.indexOf(k) > -1 ? 's on' : 's'); }
    function sym(ch) {
      var svg = document.createElementNS(NS, 'svg');
      if (ch === '+') {
        svg.setAttribute('viewBox', '0 0 50 100');
        svg.innerHTML = '<polygon class="x f" points="' + H(62, 4, 46) + '"/><polygon class="x f" points="' + V(25, 41, 83) + '"/>';
      } else { // K
        svg.setAttribute('viewBox', '0 0 56 100');
        svg.innerHTML = '<polygon class="x f" points="' + V(6, 8, 48) + '"/><polygon class="x f" points="' + V(6, 52, 92) + '"/><polyline class="x" points="48,10 14,50 48,90"/>';
      }
      return svg;
    }
    var stats = $$('.stat');
    stats.forEach(function (st, i) {
      st.setAttribute('data-idx', 'metric_0' + (i + 1));
      var seg = $('.seg', st), val = String(st.getAttribute('data-val')), suf = st.getAttribute('data-suf') || '';
      st._d = val.split('').map(function () { var s = digit(); seg.appendChild(s); setD(s, '-'); return s; });
      suf.split('').forEach(function (c) { seg.appendChild(sym(c)); });
      st._v = val;
      if (reduced) st._d.forEach(function (s, j) { setD(s, val[j]); });
    });
    if (reduced) return;
    observe(stats, function (st) {
      var t0 = performance.now(), n = st._v.length, lockAt = function (j) { return 450 + j * 260 + rnd(0, 120); }, locks = st._d.map(function (_, j) { return lockAt(j); }), last = 0;
      (function f(now) {
        var t = now - t0, all = true;
        if (now - last > 55) {
          last = now;
          for (var j = 0; j < n; j++) { if (t >= locks[j]) setD(st._d[j], st._v[j]); else { all = false; setD(st._d[j], (Math.random() * 10) | 0); } }
          if (all) { var sg = $('.seg', st); sg.classList.add('flick'); return; }
        }
        requestAnimationFrame(f);
      })(t0);
    }, { threshold: .5 });
  })();

  /* =========================================================
     HİZMETLER — komut listesi + yazılan çıktı
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
  (function () {
    var list = $('#svcList'), out = $('#svcOut'), wrap = $('.svc-wrap'), txt = $('#svcOutText'), active = -1, typeTok = 0;
    list.innerHTML = SERVICES.map(function (s, i) {
      return '<li><button class="svc-item" type="button" id="svc-b' + i + '" aria-expanded="false" aria-controls="svcOut">' +
        '<span class="sc">$ oasis hizmet <b>--0' + (i + 1) + '</b></span><span class="sn">' + s.name + '</span><span class="sa" aria-hidden="true">›</span></button></li>';
    }).join('');
    var btns = $$('.svc-item', list), mq = matchMedia('(max-width: 980px)');
    function typeText(text) {
      var tok = ++typeTok, n = text.length, t0 = performance.now(), dur = clamp(n * 2.2, 600, 1300), st = $('#svcOutState');
      if (reduced) { txt.textContent = text; return; }
      st.textContent = 'ÇALIŞIYOR…'; st.classList.add('busy');
      (function f(now) {
        if (tok !== typeTok) return;
        var k = Math.floor(clamp((now - t0) / dur, 0, 1) * n);
        if (k >= n) { txt.textContent = text; st.textContent = 'TAMAM ✓'; st.classList.remove('busy'); return; }
        txt.innerHTML = esc(text.slice(0, k)) + '<span class="tcur"></span><span class="ghost">' + esc(text.slice(k)) + '</span>';
        requestAnimationFrame(f);
      })(t0);
    }
    function place() {
      if (mq.matches) { if (active > -1) btns[active].parentNode.appendChild(out); out.hidden = active < 0; }
      else { if (out.parentNode !== wrap) wrap.appendChild(out); out.hidden = false; }
    }
    function act(i, collapse) {
      if (i === active && collapse && mq.matches) { btns[i].setAttribute('aria-expanded', 'false'); active = -1; place(); return; }
      if (i === active) return;
      active = i;
      btns.forEach(function (b, j) { b.setAttribute('aria-expanded', j === i ? 'true' : 'false'); });
      var s = SERVICES[i];
      $('#svcOutPath').textContent = 'stdout · hizmet --0' + (i + 1);
      $('#svcOutTag').textContent = s.tagline;
      $('#svcOutName').textContent = s.name;
      place();
      typeText(s.text);
    }
    btns.forEach(function (b, i) {
      var tm;
      b.addEventListener('click', function () { act(i, true); });
      if (fine) {
        b.addEventListener('pointerenter', function () { if (!mq.matches) tm = setTimeout(function () { act(i); }, 130); });
        b.addEventListener('pointerleave', function () { clearTimeout(tm); });
      }
    });
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(place);
    // ilk açılış: bölüm görünür olunca 01 yazılır
    $('#svcOutState').textContent = 'BEKLİYOR';
    place();
    observe([list], function () { act(0); }, { threshold: .3 });
  })();

  /* =========================================================
     PROJELER — holografik kart
     ========================================================= */
  (function () {
    var holo = $('#holo');
    if (fine && !reduced) {
      holo.addEventListener('pointermove', function (e) {
        var r = holo.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        holo.style.setProperty('--rx', ((.5 - y) * 12).toFixed(2) + 'deg'); holo.style.setProperty('--ry', ((x - .5) * 16).toFixed(2) + 'deg');
        holo.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); holo.style.setProperty('--my', (y * 100).toFixed(1) + '%');
      });
      holo.addEventListener('pointerleave', function () { holo.style.setProperty('--rx', '0deg'); holo.style.setProperty('--ry', '0deg'); });
    }
    var PDF_URL = $('#projeler').getAttribute('data-pdf'), PDFJS = 'vendor/pdfjs/';
    function loadPdfJs() {
      if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
      return new Promise(function (res, rej) {
        var sc = document.createElement('script'); sc.src = PDFJS + 'pdf.min.js';
        sc.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); };
        sc.onerror = rej; document.head.appendChild(sc);
      });
    }
    function cover() {
      if (location.protocol === 'file:') return; // dosyadan açıldığında PDF okunamaz; tasarım kapağı kalır
      fetch(PDF_URL).then(function (r) { if (!r.ok) throw r.status; return r.arrayBuffer(); })
        .then(function (data) { return loadPdfJs().then(function (lib) { return lib.getDocument({ data: data }).promise; }); })
        .then(function (pdf) {
          return pdf.getPage(1).then(function (page) {
            var c = $('#pdfThumb'), base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: 1280 / base.width });
            c.width = vp.width; c.height = vp.height;
            return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function () { c.hidden = false; $('#pdfPlaceholder').hidden = true; });
          });
        }).catch(function () { /* kapak tasarımı kalır */ });
    }
    observe([$('#projeler')], cover, { rootMargin: '500px' });
  })();

  /* =========================================================
     MÜŞTERİLER — şifresi çözülen logo duvarı
     ========================================================= */
  var NAMES = { a90: 'A90 Pictures', anabank: 'Anadolubank', bparmak: 'Balparmak', btoptan: 'Bizim Toptan', ck: 'Calvin Klein', cocacola: 'Coca-Cola', cs: 'CarrefourSA', ct: 'Cola Turka', gbbva: 'Garanti BBVA', hm: 'H&M', lufi: 'Lufian', ing: 'ING', bmw: 'BMW', bim: 'BİM', jbl: 'JBL', qnb: 'QNB', teb: 'TEB', vw: 'Volkswagen', tt: 'Türk Telekom', 'ford-trucks': 'Ford Trucks', 'm-coco': 'M.Coco' };
  var nameOf = function (k2) { var l = k2.toLowerCase(); return NAMES[l] || (k2.charAt(0).toUpperCase() + k2.slice(1)); };
  (function () {
    var grid = $('#logoGrid');
    var hex = function () { return '0x' + ((Math.random() * 0xffff) | 0).toString(16).toUpperCase() + '·' + ((Math.random() * 0xffff) | 0).toString(16).toUpperCase(); };
    grid.innerHTML = D.clients.map(function (c) {
      var nm = esc(nameOf(c.key));
      return '<div class="tile enc' + (c.dark ? ' dark' : '') + '" data-name="' + nm.toLocaleLowerCase('tr-TR') + '"><span class="code">' + hex() + '</span><img src="' + c.logo + '" alt="' + nm + '" loading="lazy" decoding="async" width="160" height="100"><span class="nm">' + nm + '</span></div>';
    }).join('');
    var tiles = $$('.tile', grid);
    if (reduced) { tiles.forEach(function (t) { t.classList.remove('enc'); }); }
    else observe([grid], function () {
      var cols = getComputedStyle(grid).gridTemplateColumns.split(' ').length || 10, t0 = performance.now(), left = tiles.length;
      var codes = setInterval(function () { tiles.forEach(function (t) { if (t.classList.contains('enc') && Math.random() < .4) t.firstChild.textContent = hex(); }); if (!left) clearInterval(codes); }, 90);
      tiles.forEach(function (t, i) {
        var r = Math.floor(i / cols), c = i % cols;
        setTimeout(function () {
          t.classList.remove('enc'); t.classList.add('decing'); left--;
          setTimeout(function () { t.classList.remove('decing'); }, 480);
        }, r * 70 + c * 28 + rnd(0, 160));
      });
    }, { threshold: .02, rootMargin: '0px 0px -10% 0px' });
    var input = $('#clientFilter'), cnt = $('#clientMatch');
    input.addEventListener('input', function () {
      var q = input.value.trim().toLocaleLowerCase('tr-TR'), m = 0;
      tiles.forEach(function (t) {
        var hit = !q || t.getAttribute('data-name').indexOf(q) > -1; if (hit) m++;
        t.classList.toggle('dim', !hit); t.classList.toggle('hit', !!q && hit);
      });
      cnt.textContent = q ? m + ' eşleşme' : '';
    });
  })();

  /* =========================================================
     İŞ ORTAKLARI — neon ağ haritası
     ========================================================= */
  var PNAMES = { '2': 'Retouch Mag', '4': 'Leplez!z', '66': 'Çek Kazan', '6nmag-1': '6N+ Magazing', 'ajansspor-1': 'Ajansspor', 'alldecor-1': 'Alldecor', anneysen: 'Anneysen', 'basliksiz-1': 'BusinessWorld Global', 'basliksiz-19': 'Radyospor', bifikir: 'Bifikir', biletix: 'Biletix', ceyizify: 'Çeyizify', culmenlife: 'Culmen Life', dengesende: 'Denge Sende', hesapkurdu: 'Hesapkurdu', magdergi: 'MAG Dergi', magforher: 'Mag For Her', nerdenerede: 'Nerdenerede', plodsi: 'Plodsi', radyotrafikyolda: 'Radyo Trafik Yolda', sinemayor: 'Sinemayor', studia: 'Studia', vialand: 'Vialand', yesilisplatformu: 'Yeşil İş Platformu' };
  (function () {
    var net = $('#net'), cv = $('#netCanvas'), ctx = cv.getContext('2d'), holder = $('#netNodes'), label = $('#netLabel');
    var P = D.partners, N1 = Math.min(8, P.length);
    var pName = function (p) { var b = p.logo.split('/').pop().replace(/\.\w+$/, ''); return PNAMES[b] || PNAMES[p.key] || (p.key.charAt(0).toUpperCase() + p.key.slice(1)); };
    holder.innerHTML = P.map(function (p, i) {
      return '<div class="node' + (i < N1 ? '' : ' r2') + '" tabindex="0" data-name="' + esc(pName(p)) + '"><img src="' + p.logo + '" alt="Yayıncı partner: ' + esc(pName(p)) + '" loading="lazy" width="160" height="160"></div>';
    }).join('');
    var nodes = $$('.node', holder).map(function (el, i) { return { el: el, i: i, ring: i < N1 ? 1 : 2, ph: rnd(0, 6.28), x: 0, y: 0, bx: 0, by: 0 }; });
    var edges = [], W, H, cx, cy, dpr, act = -1;
    var N2 = nodes.length - N1;
    for (var i = 0; i < N1; i++) {
      edges.push([-1, i]);
      edges.push([i, (i + 1) % N1]);
    }
    for (var j = 0; j < N2; j++) {
      edges.push([N1 + j, N1 + (j + 1) % N2]);
      edges.push([Math.floor(j / (N2 / N1)) % N1, N1 + j]);
    }
    var packets = [];
    for (var k = 0; k < 30; k++) packets.push({ e: (Math.random() * edges.length) | 0, t: Math.random(), sp: rnd(.004, .012), c: Math.random() < .6 ? '0,240,255' : '255,180,0' });
    function layout() {
      W = net.clientWidth; H = net.clientHeight; cx = W / 2; cy = H / 2;
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var mob = W < 600;
      if (mob) { H -= 56; cy = H / 2; }
      var r1x = mob ? W * .24 : Math.min(W * .22, 290), r1y = mob ? H * .2 : H * .29;
      var r2x = mob ? W * .39 : Math.min(W * .43, 560), r2y = mob ? H * .44 : H * .42;
      nodes.forEach(function (n) {
        var a;
        if (n.ring === 1) { a = n.i / N1 * Math.PI * 2 + Math.PI / N1; n.bx = cx + Math.cos(a) * r1x; n.by = cy + Math.sin(a) * r1y; }
        else { a = (n.i - N1) / N2 * Math.PI * 2 + (mob ? Math.PI / N2 : 0); n.bx = cx + Math.cos(a) * r2x; n.by = cy + Math.sin(a) * r2y; }
        n.x = n.bx; n.y = n.by;
      });
    }
    function pos(idx) { return idx < 0 ? { x: cx, y: cy } : nodes[idx]; }
    function draw(t) {
      nodes.forEach(function (n) {
        var amp = reduced ? 0 : (W < 600 ? 3 : 7);
        n.x = n.bx + Math.sin(t * .0006 + n.ph) * amp; n.y = n.by + Math.cos(t * .0005 + n.ph * 1.3) * amp;
        n.el.style.transform = 'translate(' + n.x.toFixed(1) + 'px,' + n.y.toFixed(1) + 'px)';
      });
      ctx.clearRect(0, 0, W, H + 60);
      ctx.lineCap = 'round';
      edges.forEach(function (e) {
        var a = pos(e[0]), b = pos(e[1]), hot = act > -1 && (e[0] === act || e[1] === act);
        ctx.strokeStyle = hot ? 'rgba(0,240,255,.95)' : e[0] < 0 ? 'rgba(254,135,50,.55)' : 'rgba(254,135,50,.24)';
        ctx.lineWidth = hot ? 2.2 : e[0] < 0 ? 1.6 : 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      ctx.globalCompositeOperation = 'lighter';
      packets.forEach(function (p) {
        if (!reduced) { p.t += p.sp; if (p.t > 1) { p.t = 0; p.e = act > -1 && Math.random() < .6 ? hotEdge() : (Math.random() * edges.length) | 0; } }
        var e = edges[p.e], a = pos(e[0]), b = pos(e[1]), x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        var g = ctx.createRadialGradient(x, y, 0, x, y, 9);
        g.addColorStop(0, 'rgba(' + p.c + ',1)'); g.addColorStop(1, 'rgba(' + p.c + ',0)');
        ctx.fillStyle = g; ctx.fillRect(x - 9, y - 9, 18, 18);
      });
      ctx.globalCompositeOperation = 'source-over';
    }
    function hotEdge() { var c = []; edges.forEach(function (e, i) { if (e[0] === act || e[1] === act) c.push(i); }); return c.length ? pick(c) : 0; }
    nodes.forEach(function (n) {
      var on = function () { act = n.i; n.el.classList.add('act'); label.textContent = '> ' + n.el.getAttribute('data-name') + ' · bağlantı aktif ✓'; if (reduced) draw(0); };
      var off = function () { act = -1; n.el.classList.remove('act'); label.textContent = '> düğüm seçin'; if (reduced) draw(0); };
      n.el.addEventListener('pointerenter', on); n.el.addEventListener('pointerleave', off);
      n.el.addEventListener('focus', on); n.el.addEventListener('blur', off);
    });
    layout(); draw(0);
    var lw = innerWidth; addEventListener('resize', function () { if (innerWidth !== lw) { lw = innerWidth; layout(); draw(performance.now()); } });
    if (reduced) return;
    var vis = false;
    if (hasIO) new IntersectionObserver(function (en) { vis = en[0].isIntersecting; }, { rootMargin: '100px' }).observe(net); else vis = true;
    (function loop(t) { requestAnimationFrame(loop); if (vis && !hidden) draw(t); })(0);
  })();

  /* =========================================================
     Piksel sıralama şeritleri
     ========================================================= */
  (function () {
    var PAL = [[254, 135, 50], [255, 180, 0], [255, 43, 214], [0, 240, 255], [254, 135, 50]];
    var bands = $$('.psort').map(function (cv, bi) { return { cv: cv, ctx: cv.getContext('2d'), cols: [], vis: false, flip: bi % 2 }; });
    function colAt(u) { u = clamp(u, 0, .999) * (PAL.length - 1); var i = Math.floor(u), f = u - i, a = PAL[i], b = PAL[i + 1]; return [a[0] + (b[0] - a[0]) * f | 0, a[1] + (b[1] - a[1]) * f | 0, a[2] + (b[2] - a[2]) * f | 0]; }
    function build(b) {
      var w = b.cv.clientWidth, h = b.cv.clientHeight; b.cv.width = w; b.cv.height = h; b.w = w; b.h = h; b.cols = [];
      var x = 0, phase = Math.random();
      while (x < w) {
        var cw = Math.random() < .8 ? 2 : Math.round(rnd(3, 9));
        var u = (x / w + phase) % 1, burst = Math.pow(Math.random(), 3);
        b.cols.push({ x: x, w: cw, c: colAt((u + rnd(-.05, .05) + 1) % 1), L: burst * h, T: burst * h });
        x += cw;
      }
    }
    function draw(b) {
      var ctx = b.ctx, h = b.h; ctx.clearRect(0, 0, b.w, h);
      ctx.fillStyle = 'rgba(254,135,50,.35)'; ctx.fillRect(0, b.flip ? h - 1 : 0, b.w, 1);
      for (var i = 0; i < b.cols.length; i++) {
        var c = b.cols[i], L = c.L, rgb = c.c[0] + ',' + c.c[1] + ',' + c.c[2];
        if (L < 1) continue;
        var y0 = b.flip ? h - L : 0;
        ctx.fillStyle = 'rgba(' + rgb + ',.18)'; ctx.fillRect(c.x, y0, c.w, L);
        ctx.fillStyle = 'rgba(' + rgb + ',.35)'; ctx.fillRect(c.x, b.flip ? h - L * .55 : 0, c.w, L * .55);
        ctx.fillStyle = 'rgba(' + rgb + ',.8)'; ctx.fillRect(c.x, b.flip ? h - L * .18 : 0, c.w, L * .18);
      }
    }
    bands.forEach(function (b) { build(b); draw(b); });
    var lw = innerWidth; addEventListener('resize', function () { if (innerWidth !== lw) { lw = innerWidth; bands.forEach(function (b) { build(b); draw(b); }); } });
    if (reduced || !hasIO) return;
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { bands.forEach(function (b) { if (b.cv === e.target) b.vis = e.isIntersecting; }); }); });
    bands.forEach(function (b) { io.observe(b.cv); });
    var last = 0;
    (function loop(t) {
      requestAnimationFrame(loop);
      if (hidden || t - last < 50) return; last = t;
      bands.forEach(function (b) {
        if (!b.vis) return;
        for (var i = 0; i < b.cols.length; i++) {
          var c = b.cols[i];
          if (Math.random() < .012) c.T = Math.pow(Math.random(), 3) * b.h;
          c.L += (c.T - c.L) * .2;
        }
        draw(b);
      });
    })(0);
  })();

  /* =========================================================
     Kopyala + iletişim formu
     ========================================================= */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.getAttribute('data-copy'), done = function () { b.textContent = 'Kopyalandı ✓'; setTimeout(function () { b.textContent = 'Kopyala'; }, 1600); };
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
  $$('input, textarea', form).forEach(function (el) { el.addEventListener('input', function () { el.closest('.f').classList.remove('bad'); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    $$('.f', form).forEach(function (f) { f.classList.remove('bad'); });
    if (!form.checkValidity()) {
      status.className = 'form-status err';
      $$(':invalid', form).forEach(function (el) { var f = el.closest('.f'); if (f) f.classList.add('bad'); });
      var bad = form.querySelector(':invalid');
      status.textContent = (bad && bad.type === 'email' && bad.value) ? 'HATA: E-posta adresini kontrol edin (ör. ad@firma.com).' : 'HATA: Lütfen isim, soyisim, e-posta, konu ve mesaj alanlarını doldurun.';
      if (bad) bad.focus();
      return;
    }
    var v = function (id) { return $('#' + id).value.trim(); };
    var body = 'İsim: ' + v('f-name') + ' ' + v('f-surname') + '\nTelefon: ' + (v('f-phone') || '-') + '\nE-posta: ' + v('f-email') + '\n\n' + v('f-message');
    location.href = 'mailto:sales@oasismedia.com.tr?subject=' + encodeURIComponent(v('f-subject')) + '&body=' + encodeURIComponent(body);
    status.className = 'form-status ok';
    status.textContent = 'E-posta uygulamanızda mesajınız hazırlandı. Açılmadıysa sales@oasismedia.com.tr adresine doğrudan yazabilirsiniz.';
  });
})();
