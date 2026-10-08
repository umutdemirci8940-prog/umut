/* Splash Digital – giriş animasyonu ve "etki" kaydırma sahnesi
   Giriş: reklam alanları → gerçek zamanlı açık artırma → kreatifler → marka kartı → site.
   Etki: 3B telefonda reklam önce dikkat çeker, sonra ekrandan çıkıp etkileşime,
   en sonda arkası dönüp canlı rapora dönüşür. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

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
    var slots = [].slice.call(intro.querySelectorAll('.islot'));
    var count = intro.querySelector('.intro__count');
    var status = intro.querySelector('.intro__status');
    var timers = [], done = false;
    function fit() {
      // Reklam alanları ekran boyutuna göre ölçeklenir
      var k = Math.min(window.innerWidth / 1400, window.innerHeight / 860, 1);
      if (window.innerWidth < 700) k = Math.min(window.innerWidth / 1300, .6);
      intro.style.setProperty('--k', k.toFixed(3));
    }
    fit();
    window.addEventListener('resize', fit);
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }

    // Açık artırma: her alan sırayla teklif toplar ve kazanır
    var BIDS = ['₺4,20', '₺6,85', '₺3,10', '₺7,40', '₺5,15', '₺2,90'];
    slots.forEach(function (s, i) {
      var bid = s.querySelector('.islot__bid');
      at(950 + i * 110, function () { s.classList.add('is-bidding'); bid.textContent = 'Teklifler · ' + (3 + i * 2) + ' DSP'; });
      at(1500 + i * 140, function () {
        s.classList.remove('is-bidding'); s.classList.add('is-won');
        bid.textContent = 'Kazandı ' + BIDS[i] + ' CPM';
      });
    });
    // Milisaniye sayacı
    var t0 = performance.now();
    (function tick() {
      if (done) return;
      var t = performance.now() - t0;
      var ms = Math.round(clamp((t - 900) / 1500, 0, 1) * 118);
      if (count) count.textContent = ms + ' ms';
      if (t < 2600) requestAnimationFrame(tick);
    })();
    at(2420, function () { intro.classList.add('is-sold'); if (status) status.textContent = '6 gösterim satıldı'; });
    at(2650, function () { intro.classList.add('is-stack'); });
    at(3450, function () { intro.classList.add('is-brand'); });
    at(4450, reveal);

    var revealed = false;
    function reveal() {
      if (revealed) return; revealed = true;
      intro.classList.add('is-expand');
      d.dispatchEvent(new CustomEvent('sd:intro-reveal'));
      setTimeout(function () { intro.classList.add('is-fade'); finishIntro(); }, 650);
      setTimeout(end, 1150);
    }
    function end() {
      done = true;
      intro.classList.add('is-done');
      window.removeEventListener('resize', fit);
      if (intro.parentNode) intro.parentNode.removeChild(intro);
    }
    intro.querySelector('.intro__skip').addEventListener('click', function () {
      timers.forEach(clearTimeout);
      intro.classList.add('is-stack', 'is-brand');
      setTimeout(reveal, 200);
    });
  }

  /* =========================================================
     2) Etki sahnesi
     ========================================================= */
  var impact = d.getElementById('impact');
  if (!impact) return;
  var lines = impact.querySelectorAll('.impact__line');
  var num = impact.querySelector('.impact__num'), lbl = impact.querySelector('.impact__lbl');
  var LBL = ['Dikkat', 'Etkileşim', 'Ölçüm'];
  var metrics = impact.querySelectorAll('.mt b');
  var stage = -1, counted = false;

  function countUp() {
    if (counted) return; counted = true;
    metrics.forEach(function (b) {
      var to = parseFloat(b.getAttribute('data-to')), suf = b.getAttribute('data-suf') || '%';
      var dec = to % 1 ? 1 : 0, t0 = performance.now();
      (function step(now) {
        var p = clamp((now - t0) / 1100, 0, 1), e = 1 - Math.pow(1 - p, 3);
        b.textContent = (to * e).toFixed(dec).replace('.', ',') + suf;
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }
  function setStage(s) {
    if (s === stage) return;
    stage = s;
    impact.setAttribute('data-stage', s);
    lines.forEach(function (l, i) { l.classList.toggle('is-active', i === s); l.classList.toggle('is-past', i < s); });
    if (num) num.textContent = '0' + (s + 1);
    if (lbl) lbl.textContent = LBL[s];
    if (s === 2) countUp();
  }
  if (reduce) { impact.classList.add('is-static'); setStage(2); return; }

  impact.classList.add('is-pinned');
  function onScroll() {
    var r = impact.getBoundingClientRect(), span = impact.offsetHeight - window.innerHeight;
    var p = clamp(-r.top / (span || 1), 0, 1);
    setStage(p < .33 ? 0 : p < .66 ? 1 : 2);
    impact.style.setProperty('--ip', p.toFixed(3));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
