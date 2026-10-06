/* Splash Digital – eğlenceli etkileşimler (main.js'ten sonra yüklenir) */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var COLORS = ['#127dc5', '#4cc3ff', '#ffc93c', '#ff6b6b', '#22c7a9', '#8b5cf6'];

  /* ---------- Bölüm başlıklarında son kelimeye fosforlu kalem ---------- */
  var hlColors = ['#ffc93c', '#7fe3d0', '#ffb3b3', '#cdb8ff', '#9edcff'];
  d.querySelectorAll('h2.split').forEach(function (h, i) {
    var words = h.querySelectorAll('.w');
    var last = words[words.length - 1];
    if (!last) return;
    last.classList.add('hl');
    last.style.setProperty('--hl', hlColors[i % hlColors.length]);
  });

  /* ---------- Kaydırma ilerleme çubuğu ---------- */
  var bar = d.querySelector('.progress');
  function onScroll() {
    if (!bar) return;
    var max = d.documentElement.scrollHeight - window.innerHeight;
    bar.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Rakamlar sayınca "pop" ---------- */
  if ('IntersectionObserver' in window) {
    var sio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        setTimeout(function () { el.classList.add('is-counted'); }, 1700);
        sio.unobserve(el);
      });
    }, { threshold: 0.6 });
    d.querySelectorAll('.stat').forEach(function (s) { sio.observe(s); });
  }

  if (reduce) return;

  /* ---------- Hero oyuncakları: fareyle paralaks ---------- */
  var hero = d.querySelector('.hero');
  var toys = Array.prototype.slice.call(d.querySelectorAll('.toy'));
  if (hero && toys.length && fine) {
    var tx = 0, ty = 0, cx = 0, cy = 0, running = false;
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - 0.5;
      ty = (e.clientY - r.top) / r.height - 0.5;
      if (!running) { running = true; requestAnimationFrame(loop); }
    });
    hero.addEventListener('pointerleave', function () { tx = ty = 0; });
    var loop = function () {
      cx += (tx - cx) * 0.08; cy += (ty - cy) * 0.08;
      toys.forEach(function (t) {
        var k = parseFloat(t.getAttribute('data-depth')) || 20;
        t.style.transform = 'translate3d(' + (cx * k).toFixed(1) + 'px,' + (cy * k).toFixed(1) + 'px,0)';
      });
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) requestAnimationFrame(loop); else running = false;
    };
  }

  /* ---------- Hizmet kartları: 3D eğilme ---------- */
  if (fine) {
    d.querySelectorAll('.service').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (y * -10).toFixed(2) + 'deg');
      });
      card.addEventListener('pointerleave', function () { card.style.removeProperty('--rx'); card.style.removeProperty('--ry'); });
    });
  }

  /* ---------- Tıklayınca su damlası sıçraması ---------- */
  if (!Element.prototype.animate) return;
  var last = 0;
  d.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    if (e.target.closest('input, textarea, select, .story__cv, iframe')) return;
    var now = performance.now();
    if (now - last < 120) return;
    last = now;
    var x = e.clientX, y = e.clientY;

    var ring = d.createElement('span');
    ring.className = 'splash-ring';
    ring.style.borderColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    d.body.appendChild(ring);
    ring.animate([
      { transform: 'translate(' + x + 'px,' + y + 'px) scale(.3)', opacity: 1 },
      { transform: 'translate(' + x + 'px,' + y + 'px) scale(4)', opacity: 0 }
    ], { duration: 600, easing: 'cubic-bezier(.2,.7,.3,1)' }).onfinish = function () { ring.remove(); };

    var n = 9;
    for (var i = 0; i < n; i++) {
      (function (i) {
        var drop = d.createElement('span');
        drop.className = 'splash-drop';
        drop.style.background = COLORS[(i + Math.floor(Math.random() * 6)) % COLORS.length];
        d.body.appendChild(drop);
        var ang = -Math.PI / 2 + (i / (n - 1) - 0.5) * Math.PI * 1.25 + (Math.random() - 0.5) * 0.3;
        var sp = 70 + Math.random() * 70;
        var dx = Math.cos(ang) * sp, dy = Math.sin(ang) * sp;
        var rot = (ang + Math.PI / 2) * 180 / Math.PI;
        var sc = 0.6 + Math.random() * 0.7;
        var frames = [];
        for (var k = 0; k <= 6; k++) {
          var t = k / 6;
          frames.push({
            transform: 'translate(' + (x + dx * t).toFixed(1) + 'px,' + (y + dy * t + 260 * t * t).toFixed(1) + 'px) rotate(' + (rot + t * 60).toFixed(0) + 'deg) scale(' + (sc * (1 - t * 0.4)).toFixed(2) + ')',
            opacity: t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3
          });
        }
        drop.animate(frames, { duration: 650 + Math.random() * 250, easing: 'linear' }).onfinish = function () { drop.remove(); };
      })(i);
    }
  }, { passive: true });
})();
