/* Splash Digital – hizmetler için kaydırmalı anlatım (parçacık şekilleri) ve manifesto */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Manifesto: kaydırdıkça kelime kelime aydınlanır ---------- */
  var man = d.getElementById('manifesto');
  if (man) {
    var words = [];
    (function walk(node, em) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
            var s = d.createElement('span'); s.className = 'mw' + (em ? ' mw--em' : ''); s.textContent = part;
            words.push(s); frag.appendChild(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          walk(n, em || n.tagName === 'EM');
        }
      });
    })(man, false);
    var updMan = function () {
      var r = man.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
      var lit = reduce ? words.length : Math.round(p * words.length * 1.1);
      words.forEach(function (w, i) { w.classList.toggle('is-lit', i < lit); });
    };
    window.addEventListener('scroll', updMan, { passive: true });
    window.addEventListener('resize', updMan);
    updMan();
  }

  /* ---------- Hizmet anlatımı (yalnızca geniş ekran) ---------- */
  var story = d.getElementById('story');
  var grid = d.getElementById('serviceGrid');
  if (!story || !grid || reduce || window.innerWidth < 1000) return;
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.service'));
  if (!cards.length) return;
  var N = cards.length;

  var html = '<div class="story__sticky"><div class="story__text">';
  cards.forEach(function (c, i) {
    html += '<article class="story__item' + (i === 0 ? ' is-active' : '') + '">' +
      '<span class="story__no">' + String(i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0') + '</span>' +
      '<h3>' + c.querySelector('h3').innerHTML + '</h3>' +
      '<p>' + c.querySelector('p').innerHTML + '</p></article>';
  });
  html += '</div><canvas class="story__cv"></canvas><ol class="story__dots">';
  cards.forEach(function (c, i) { html += '<li' + (i === 0 ? ' class="is-active"' : '') + '><span>' + c.querySelector('h3').textContent + '</span></li>'; });
  html += '</ol></div>';
  story.innerHTML = html;
  story.style.height = (N * 45 + 100) + 'vh';
  story.removeAttribute('aria-hidden');
  d.documentElement.classList.add('has-story');

  var items = story.querySelectorAll('.story__item');
  var dots = story.querySelectorAll('.story__dots li');
  var cv = story.querySelector('.story__cv');
  var ctx = cv.getContext('2d');
  var W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    var r = cv.getBoundingClientRect();
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  /* Şekiller: -1..1 aralığında nokta listeleri */
  var COUNT = 1100;
  function line(pts, x1, y1, x2, y2, n) { for (var i = 0; i < n; i++) { var t = i / Math.max(n - 1, 1); pts.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]); } }
  function circle(pts, cx, cy, r, n, ry) { for (var i = 0; i < n; i++) { var a = i / n * Math.PI * 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * (ry || r)]); } }
  function rect(pts, x, y, w, h, n) { var per = 2 * (w + h); line(pts, x, y, x + w, y, Math.round(n * w / per)); line(pts, x + w, y, x + w, y + h, Math.round(n * h / per)); line(pts, x + w, y + h, x, y + h, Math.round(n * w / per)); line(pts, x, y + h, x, y, Math.round(n * h / per)); }
  function disc(pts, cx, cy, r, n) { for (var i = 0; i < n; i++) { var a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); } }

  var shapes = [
    function () { // Veri: grafik çubukları + trend çizgisi
      var p = []; var hs = [0.35, 0.55, 0.45, 0.8, 0.7, 1.1];
      hs.forEach(function (h, i) { var x = -0.75 + i * 0.28; rect(p, x, 0.75 - h, 0.16, h, 110); });
      line(p, -0.8, 0.25, -0.45, 0.0, 30); line(p, -0.45, 0.0, -0.1, 0.1, 30); line(p, -0.1, 0.1, 0.3, -0.3, 40); line(p, 0.3, -0.3, 0.75, -0.55, 40);
      line(p, -0.85, 0.8, 0.85, 0.8, 60); return p;
    },
    function () { // Medya planlama: yörüngeler
      var p = []; disc(p, 0, 0, 0.14, 120);
      circle(p, 0, 0, 0.42, 160, 0.42); circle(p, 0, 0, 0.66, 220, 0.4); circle(p, 0, 0, 0.88, 260, 0.62);
      [[0.42, 0], [-0.47, 0.28], [0.62, -0.43], [-0.2, -0.6]].forEach(function (c) { disc(p, c[0], c[1], 0.06, 40); });
      return p;
    },
    function () { // Network: düğümler ve bağlantılar
      var p = []; var nodes = [[0, 0]];
      for (var i = 0; i < 6; i++) { var a = i / 6 * Math.PI * 2 - Math.PI / 2; nodes.push([Math.cos(a) * 0.72, Math.sin(a) * 0.72]); }
      nodes.forEach(function (n, i) { disc(p, n[0], n[1], i ? 0.09 : 0.16, i ? 55 : 110); circle(p, n[0], n[1], i ? 0.15 : 0.25, i ? 30 : 50); });
      for (var j = 1; j <= 6; j++) { line(p, 0, 0, nodes[j][0], nodes[j][1], 40); line(p, nodes[j][0], nodes[j][1], nodes[j % 6 + 1][0], nodes[j % 6 + 1][1], 25); }
      return p;
    },
    function () { // Masaüstü + mobil
      var p = []; rect(p, -0.9, -0.62, 1.25, 0.82, 330); line(p, -0.4, 0.2, -0.45, 0.42, 20); line(p, -0.15, 0.2, -0.1, 0.42, 20); line(p, -0.6, 0.44, 0.05, 0.44, 50);
      for (var i = 0; i < 160; i++) p.push([-0.85 + Math.random() * 1.15, -0.57 + Math.random() * 0.72]);
      rect(p, 0.5, -0.45, 0.38, 0.85, 220); circle(p, 0.69, 0.32, 0.03, 12);
      for (var k = 0; k < 90; k++) p.push([0.54 + Math.random() * 0.3, -0.4 + Math.random() * 0.65]);
      return p;
    },
    function () { // Pazarlama: yükselen ok + saçılım
      var p = []; line(p, -0.85, 0.7, -0.35, 0.15, 70); line(p, -0.35, 0.15, -0.05, 0.4, 50); line(p, -0.05, 0.4, 0.7, -0.5, 110);
      line(p, 0.7, -0.5, 0.42, -0.48, 40); line(p, 0.7, -0.5, 0.66, -0.22, 40);
      for (var i = 0; i < 9; i++) disc(p, -0.8 + i * 0.19, 0.85 - Math.random() * 0.12, 0.035, 18);
      circle(p, 0.7, -0.5, 0.22, 80); circle(p, 0.7, -0.5, 0.36, 100);
      return p;
    },
    function () { // Yazılım: </>
      var p = []; line(p, -0.35, -0.55, -0.85, 0, 120); line(p, -0.85, 0, -0.35, 0.55, 120);
      line(p, 0.35, -0.55, 0.85, 0, 120); line(p, 0.85, 0, 0.35, 0.55, 120);
      line(p, 0.18, -0.7, -0.18, 0.7, 150); rect(p, -1, -0.85, 2, 1.7, 160);
      return p;
    }
  ];
  var targets = shapes.slice(0, N).map(function (fn) {
    var pts = fn();
    while (pts.length < COUNT) pts.push(pts[Math.floor(Math.random() * pts.length)].slice());
    for (var i = pts.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = pts[i]; pts[i] = pts[j]; pts[j] = t; }
    return pts.slice(0, COUNT);
  });
  while (targets.length < N) targets.push(targets[targets.length - 1]);

  var P = [];
  for (var i = 0; i < COUNT; i++) {
    P.push({ x: (Math.random() - 0.5) * 2.4, y: (Math.random() - 0.5) * 2.4, vx: 0, vy: 0, s: 0.6 + Math.random() * 1.4, o: Math.random() * Math.PI * 2 });
  }

  var active = 0, mouse = { x: 9, y: 9 }, visible = false;
  cv.addEventListener('pointermove', function (e) {
    var r = cv.getBoundingClientRect(), sc = Math.min(W, H) * 0.42;
    mouse.x = (e.clientX - r.left - W / 2) / sc; mouse.y = (e.clientY - r.top - H / 2) / sc;
  });
  cv.addEventListener('pointerleave', function () { mouse.x = mouse.y = 9; });

  function setActive(i) {
    if (i === active) return;
    active = i;
    items.forEach(function (el, k) { el.classList.toggle('is-active', k === i); el.classList.toggle('is-past', k < i); });
    dots.forEach(function (el, k) { el.classList.toggle('is-active', k === i); });
    P.forEach(function (p) { p.vx += (Math.random() - 0.5) * 0.06; p.vy += (Math.random() - 0.5) * 0.06; }); // sıçrama
  }

  dots.forEach(function (li, i) {
    li.addEventListener('click', function () {
      var top = story.getBoundingClientRect().top + window.scrollY;
      var span = story.offsetHeight - window.innerHeight;
      window.scrollTo({ top: top + span * ((i + 0.5) / N), behavior: 'smooth' });
    });
  });

  function onScroll() {
    var r = story.getBoundingClientRect(), vh = window.innerHeight;
    visible = r.top < vh && r.bottom > 0;
    var span = story.offsetHeight - vh;
    var prog = Math.min(Math.max(-r.top / span, 0), 0.9999);
    setActive(Math.floor(prog * N));
    story.style.setProperty('--prog', prog.toFixed(4));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var t = 0;
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    t += 0.016;
    ctx.clearRect(0, 0, W, H);
    var sc = Math.min(W, H) * 0.42, cx = W / 2, cy = H / 2, tg = targets[active];
    for (var i = 0; i < COUNT; i++) {
      var p = P[i], g = tg[i];
      var gx = g[0] + Math.sin(t * 1.3 + p.o) * 0.008, gy = g[1] + Math.cos(t * 1.1 + p.o) * 0.008;
      p.vx += (gx - p.x) * 0.045; p.vy += (gy - p.y) * 0.045;
      var dx = p.x - mouse.x, dy = p.y - mouse.y, dd = dx * dx + dy * dy;
      if (dd < 0.06) { var f = (0.06 - dd) * 0.9; p.vx += dx * f; p.vy += dy * f; }
      p.vx *= 0.82; p.vy *= 0.82; p.x += p.vx; p.y += p.vy;
      var sp = Math.min(Math.abs(p.vx) + Math.abs(p.vy), 0.08) * 8;
      ctx.fillStyle = 'rgba(' + (18 + sp * 30 | 0) + ',' + (125 + sp * 40 | 0) + ',' + (197 + sp * 30 | 0) + ',' + (0.35 + p.s * 0.3) + ')';
      ctx.fillRect(cx + p.x * sc, cy + p.y * sc, p.s * 1.6, p.s * 1.6);
    }
  })();
})();
