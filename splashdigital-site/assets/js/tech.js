/* Splash Digital – teknolojik animasyonlar (main.js'ten sonra yüklenir) */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function inView(el, cb, opts) {
    if (!('IntersectionObserver' in window)) { cb(true); return; }
    new IntersectionObserver(function (es) { es.forEach(function (e) { cb(e.isIntersecting); }); }, opts || {}).observe(el);
  }

  /* ---------- Kaydırma ilerleme çizgisi ---------- */
  var bar = d.querySelector('.progress');
  if (bar) {
    var upd = function () {
      var max = d.documentElement.scrollHeight - window.innerHeight;
      bar.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
    };
    window.addEventListener('scroll', upd, { passive: true }); upd();
  }

  /* ---------- Rakamlar: mini grafik ---------- */
  var sparks = ['M2 22 L18 18 L34 20 L50 12 L66 14 L82 7 L98 9 L108 3', 'M2 20 L16 21 L30 15 L46 17 L62 10 L78 11 L94 5 L108 4',
                'M2 18 L20 18 L36 13 L52 15 L68 9 L84 10 L100 6 L108 5', 'M2 21 L18 15 L34 17 L50 11 L66 13 L82 8 L98 6 L108 3'];
  d.querySelectorAll('.stat').forEach(function (s, i) {
    var p = sparks[i % sparks.length], end = p.split(' ').slice(-2);
    s.insertAdjacentHTML('beforeend', '<svg class="stat__spark" viewBox="0 0 110 26" aria-hidden="true"><path d="' + p + '"/><circle cx="' + end[0].replace('L', '') + '" cy="' + end[1] + '" r="3"/></svg>');
  });

  /* ---------- Süreç çizgisinde veri paketleri ---------- */
  var line = d.querySelector('.steps__line');
  if (line && !reduce) line.insertAdjacentHTML('beforeend', '<i></i><i></i><i></i>');

  if (reduce) return;

  /* ---------- Format çözücü (harf harf değişen kelime) ---------- */
  var dec = d.getElementById('decode');
  if (dec) {
    var words = (dec.getAttribute('data-words') || '').split('|');
    var chars = 'ABCDEFGHIJKLMNOPRSTUVYZ0123456789#%&*<>/';
    var wi = 0;
    var scramble = function (to) {
      var from = dec.textContent, len = Math.max(from.length, to.length), frame = 0, total = 18;
      var queue = [];
      for (var i = 0; i < len; i++) queue.push({ to: to[i] || '', start: Math.floor(Math.random() * 6), end: 6 + Math.floor(Math.random() * 12) });
      (function tick() {
        var out = '', done = 0;
        queue.forEach(function (q) {
          if (frame >= q.end) { out += q.to; done++; }
          else if (frame >= q.start) out += '<span class="g">' + chars[Math.floor(Math.random() * chars.length)] + '</span>';
          else out += '';
        });
        dec.innerHTML = out;
        frame++;
        if (done < queue.length && frame < total + 12) requestAnimationFrame(tick); else dec.textContent = to;
      })();
    };
    setInterval(function () { if (d.hidden) return; wi = (wi + 1) % words.length; scramble(words[wi]); }, 2600);
  }

  /* ---------- Veri ağı kanvası (hero, iletişim, footer) ---------- */
  function dataNet(host, cv, opt) {
    if (!cv || !cv.getContext) return;
    opt = opt || {};
    var C = opt.color || '18,125,197', P = opt.packet || '63,179,240', base = opt.base || 0.08, dens = opt.density || 22000;
    var ctx = cv.getContext('2d'), W, H, dpr = Math.min(window.devicePixelRatio || 1, 2);
    var nodes = [], edges = [], packets = [], mouse = { x: -999, y: -999 }, visible = false;
    var build = function () {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      if (!W || !H) return;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(70, Math.max(22, W * H / dens)));
      nodes = [];
      for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .15, vy: (Math.random() - .5) * .15, r: 1.2 + Math.random() * 1.6 });
      edges = [];
      nodes.forEach(function (a, i) {
        nodes.map(function (b, j) { return { j: j, d: (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y) }; })
          .filter(function (o) { return o.j !== i; }).sort(function (p, q) { return p.d - q.d; }).slice(0, 2)
          .forEach(function (o) { if (o.d < 260 * 260 && !edges.some(function (e) { return e[0] === o.j && e[1] === i; })) edges.push([i, o.j]); });
      });
      packets = [];
    };
    build();
    window.addEventListener('resize', build);
    host.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
      if (opt.spot) { host.style.setProperty('--mx', mouse.x + 'px'); host.style.setProperty('--my', mouse.y + 'px'); }
    });
    host.addEventListener('pointerleave', function () { mouse.x = mouse.y = -999; });
    inView(host, function (v) { visible = v; if (v && !W) build(); });
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible || d.hidden || !W) return;
      ctx.clearRect(0, 0, W, H);
      nodes.forEach(function (n) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      });
      edges.forEach(function (e) {
        var a = nodes[e[0]], b = nodes[e[1]];
        var mx = (a.x + b.x) / 2 - mouse.x, my = (a.y + b.y) / 2 - mouse.y;
        var near = Math.max(0, 1 - Math.sqrt(mx * mx + my * my) / 220);
        ctx.strokeStyle = 'rgba(' + C + ',' + (base + near * 0.35) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      });
      if (mouse.x > -900) {
        nodes.forEach(function (n) {
          var dx = n.x - mouse.x, dy = n.y - mouse.y, dd = Math.sqrt(dx * dx + dy * dy);
          if (dd < 150) { ctx.strokeStyle = 'rgba(' + P + ',' + (0.5 * (1 - dd / 150)) + ')'; ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
        });
      }
      nodes.forEach(function (n) {
        var dx = n.x - mouse.x, dy = n.y - mouse.y, near = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / 180);
        ctx.fillStyle = 'rgba(' + C + ',' + (base * 4 + near * 0.6) + ')';
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + near * 1.8, 0, 6.283); ctx.fill();
      });
      if (packets.length < 14 && Math.random() < 0.08 && edges.length) {
        var e = edges[Math.floor(Math.random() * edges.length)];
        packets.push({ e: Math.random() < .5 ? e : [e[1], e[0]], t: 0, s: 0.006 + Math.random() * 0.01 });
      }
      for (var i = packets.length - 1; i >= 0; i--) {
        var pk = packets[i], a = nodes[pk.e[0]], b = nodes[pk.e[1]];
        pk.t += pk.s;
        if (pk.t >= 1) { packets.splice(i, 1); continue; }
        var x = a.x + (b.x - a.x) * pk.t, y = a.y + (b.y - a.y) * pk.t;
        var g = ctx.createRadialGradient(x, y, 0, x, y, 7);
        g.addColorStop(0, 'rgba(' + P + ',.95)'); g.addColorStop(1, 'rgba(' + P + ',0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 7, 0, 6.283); ctx.fill();
      }
    })();
  }
  var hero = d.querySelector('.hero');
  if (hero) dataNet(hero, d.getElementById('datanet'), { spot: true });
  var contact = d.getElementById('iletisim');
  if (contact) {
    contact.insertAdjacentHTML('afterbegin', '<canvas class="datanet datanet--section" aria-hidden="true"></canvas>');
    dataNet(contact, contact.querySelector('.datanet'), { base: 0.06, density: 26000 });
  }
  var footer = d.querySelector('.footer');
  if (footer) {
    footer.insertAdjacentHTML('afterbegin', '<canvas class="datanet datanet--footer" aria-hidden="true"></canvas>');
    dataNet(footer, footer.querySelector('.datanet'), { color: '120,180,230', packet: '90,200,255', base: 0.07, density: 18000 });
  }

  /* ---------- Bölüm etiketleri: ekrana girince harf harf çözülür ---------- */
  var glyphs = 'ABCDEFGHIJKLMNOPRSTUVYZ0123456789#%&*<>/';
  function decodeIn(el) {
    var target = el.textContent, len = target.length, frame = 0;
    var start = [], stop = [];
    for (var i = 0; i < len; i++) { start.push(Math.floor(Math.random() * 8)); stop.push(8 + Math.floor(Math.random() * 16)); }
    (function tick() {
      var out = '';
      for (var i = 0; i < len; i++) {
        var ch = target[i];
        if (ch === ' ' || frame >= stop[i]) out += ch;
        else if (frame >= start[i]) out += glyphs[Math.floor(Math.random() * glyphs.length)];
        else out += ' ';
      }
      el.textContent = out;
      if (++frame < 26) requestAnimationFrame(tick); else el.textContent = target;
    })();
  }
  d.querySelectorAll('.eyebrow').forEach(function (eb) {
    if (eb.closest('.hero')) return;
    var span = d.createElement('span');
    span.className = 'eyebrow__txt';
    Array.prototype.slice.call(eb.childNodes).forEach(function (n) { if (n.nodeType === 3 && n.textContent.trim()) { span.textContent += n.textContent.trim(); eb.removeChild(n); } });
    if (!span.textContent) return;
    eb.appendChild(span);
    var done = false;
    inView(eb, function (v) { if (v && !done) { done = true; decodeIn(span); } }, { threshold: 0.6 });
  });

  /* ---------- Logolar: dalga gibi sırayla belirme ---------- */
  ['brandGrid', 'partnerGrid'].forEach(function (id) {
    var g = d.getElementById(id) || (id === 'partnerGrid' ? d.querySelector('.partners') : null);
    if (!g) return;
    g.classList.add('cascade');
    Array.prototype.slice.call(g.children).forEach(function (c, i) { c.style.setProperty('--d', (i % 18) * 45 + 'ms'); });
    var shown = false;
    inView(g, function (v) { if (v && !shown) { shown = true; g.classList.add('is-on'); } }, { threshold: 0.1 });
  });

  /* ---------- Reklam sahnesi: sanal imleç + canlı metrikler ---------- */
  var stage = d.querySelector('.adstage');
  if (stage) {
    var cur = stage.querySelector('.vcursor');
    var cta = stage.querySelector('.adslot__cta');
    var vEl = stage.querySelector('[data-kpi="view"]'), eEl = stage.querySelector('[data-kpi="eng"]'), iEl = stage.querySelector('[data-kpi="imp"]');
    var bars = stage.querySelectorAll('.kpi__bars i');
    var lineP = stage.querySelector('.kpi__line'), areaP = stage.querySelector('.kpi__area');
    var on = false;
    inView(stage, function (v) { on = v; });

    var series = [];
    for (var k = 0; k < 14; k++) series.push(91 + Math.random() * 5);
    var drawSpark = function () {
      var w = 120, h = 34, min = 88, max = 99, pts = series.map(function (v, i) { return [i / (series.length - 1) * w, h - (v - min) / (max - min) * h]; });
      var dLine = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
      lineP.setAttribute('d', dLine);
      areaP.setAttribute('d', dLine + ' L120 34 L0 34 Z');
    };
    var setBars = function () { bars.forEach(function (b) { b.style.setProperty('--h', (25 + Math.random() * 75).toFixed(0) + '%'); }); };
    drawSpark(); setBars();

    var imp = 0, eng = 4.2;
    var fmt = function (n) { return n.toLocaleString('tr-TR'); };
    setInterval(function () {
      if (!on || d.hidden) return;
      imp += 37 + Math.floor(Math.random() * 120);
      iEl.textContent = fmt(imp);
    }, 140);
    setInterval(function () {
      if (!on || d.hidden) return;
      series.shift(); series.push(Math.min(98, Math.max(90, series[series.length - 1] + (Math.random() - 0.45) * 1.6)));
      drawSpark();
      vEl.textContent = series[series.length - 1].toFixed(1).replace('.', ',');
    }, 1200);

    var pos = function (el, dx, dy) {
      var s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
      return [r.left - s.left + r.width * dx, r.top - s.top + r.height * dy];
    };
    var move = function (x, y) { cur.style.transform = 'translate(' + x.toFixed(0) + 'px,' + y.toFixed(0) + 'px)'; };
    var slots = [stage.querySelector('.adslot--mast'), stage.querySelector('.adslot--mob'), stage.querySelector('.skel')];
    var step = 0;
    move(stage.clientWidth * 0.55, stage.clientHeight * 0.6);
    setInterval(function () {
      if (!on || d.hidden) return;
      step++;
      if (step % 3 === 0) {
        var p = pos(cta, 0.5, 0.6); move(p[0], p[1]);
        setTimeout(function () {
          cur.classList.add('is-click'); cta.classList.remove('is-hit'); void cta.offsetWidth; cta.classList.add('is-hit');
          eng = Math.min(6.4, Math.max(3.2, eng + (Math.random() * 0.3))); eEl.textContent = eng.toFixed(1).replace('.', ',');
          setBars();
          setTimeout(function () { cur.classList.remove('is-click'); }, 300);
        }, 1150);
      } else {
        var el = slots[Math.floor(Math.random() * slots.length)], q = pos(el, 0.2 + Math.random() * 0.6, 0.2 + Math.random() * 0.6);
        move(q[0], q[1]);
      }
    }, 1700);
    vEl.textContent = series[series.length - 1].toFixed(1).replace('.', ',');
    eEl.textContent = eng.toFixed(1).replace('.', ',');
  }

  /* ---------- Hizmet kartları: hafif 3D eğim ---------- */
  if (fine) {
    d.querySelectorAll('.service').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.transform = 'perspective(900px) rotateX(' + (((e.clientY - r.top) / r.height - .5) * -6).toFixed(2) + 'deg) rotateY(' + (((e.clientX - r.left) / r.width - .5) * 6).toFixed(2) + 'deg) translateY(-4px)';
      });
      card.addEventListener('pointerleave', function () { card.style.transform = ''; });
    });
  }
})();
