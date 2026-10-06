/* Splash Digital – 3D derinlik, reklam formatları anlatımı ve çağrı bandı (tech.js'ten sonra yüklenir) */
(function () {
  'use strict';
  var d = document;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* =========================================================
     1) Reklam formatları
     ========================================================= */
  var fmt = d.querySelector('.fmt');
  var section = d.getElementById('formatlar');
  var CHIPS = {
    mast: ['Yüksek görünürlük', '970×250', 'Sayfa üstü'],
    rich: ['Sekmeli etkileşim', '300×600', 'Ürün keşfi'],
    video: ['Otomatik oynatma', 'In-stream', 'Tamamlanma ölçümü'],
    inter: ['Tam ekran', 'Mobil', 'Yüksek dikkat'],
    native: ['İçerik akışında', 'Uyumlu tasarım', 'Trafik odaklı'],
    play: ['Mini oyun', 'Dokun & oyna', 'Dönüşüm odaklı']
  };
  var LABELS = { mast: 'MASTHEAD · 970×250', rich: 'RICH MEDIA · 300×600', video: 'VIDEO · IN-STREAM', inter: 'INTERSTITIAL', native: 'SPONSORLU İÇERİK', play: 'PLAYABLE' };
  if (fmt && section) {
    var tabs = Array.prototype.slice.call(fmt.querySelectorAll('.fmt__tab'));
    var keys = tabs.map(function (t) { return t.getAttribute('data-fmt'); });
    var chipEls = fmt.querySelectorAll('.fmt__chip-t');
    var label = fmt.querySelector('.fmt__label');
    var num = fmt.querySelector('.fmt__num');
    var current = -1, timer = null, pinned = false;

    var setFmt = function (i) {
      if (i === current) return;
      current = i;
      var k = keys[i];
      fmt.classList.add('is-switching');
      fmt.setAttribute('data-active', k);
      tabs.forEach(function (t, j) { t.classList.toggle('is-active', j === i); t.setAttribute('aria-selected', j === i ? 'true' : 'false'); });
      fmt.querySelectorAll('.cr').forEach(function (im) { im.classList.toggle('is-active', im.getAttribute('data-fmt') === k); });
      fmt.querySelectorAll('.fmt__info').forEach(function (p) { p.classList.toggle('is-active', p.getAttribute('data-fmt') === k); });
      if (label) label.textContent = LABELS[k] || '';
      setTimeout(function () {
        (CHIPS[k] || []).forEach(function (c, j) { if (chipEls[j]) chipEls[j].textContent = c; });
        if (num) num.textContent = ('0' + (i + 1)).slice(-2);
        fmt.classList.remove('is-switching');
      }, 260);
    };
    setFmt(0);

    // Kaydırmalı anlatım (geniş ekran)
    var scroller = d.getElementById('fmtScroll');
    var canPin = function () { return !reduce && window.innerWidth >= 1100 && window.innerHeight >= 640; };
    var STEP = 55; // her format için vh
    var layout = function () {
      pinned = canPin();
      section.classList.toggle('fmt-pin', pinned);
      scroller.style.height = pinned ? (keys.length * STEP + 100) + 'vh' : '';
    };
    var onScroll = function () {
      if (!pinned) return;
      var r = scroller.getBoundingClientRect();
      var span = scroller.offsetHeight - window.innerHeight;
      var p = Math.min(Math.max(-r.top / span, 0), 0.9999);
      var f = p * keys.length, i = Math.floor(f), lp = f - i;
      setFmt(i);
      fmt.style.setProperty('--lp', lp.toFixed(3));
      tabs[i].style.setProperty('--tp', lp.toFixed(3));
    };
    layout(); onScroll();
    window.addEventListener('resize', function () { layout(); onScroll(); });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Sekmelere tıklama
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        if (pinned) {
          var top = scroller.getBoundingClientRect().top + window.scrollY;
          var span = scroller.offsetHeight - window.innerHeight;
          window.scrollTo({ top: top + span * ((i + 0.35) / keys.length), behavior: 'smooth' });
        } else {
          setFmt(i);
          fmt.classList.add('is-paused');
          clearInterval(timer);
        }
      });
    });

    // Dar ekranda otomatik dönüş
    var auto = function () {
      clearInterval(timer);
      if (reduce) return;
      timer = setInterval(function () { if (!pinned && !fmt.classList.contains('is-paused') && !d.hidden) setFmt((current + 1) % keys.length); }, 6000);
    };
    auto();

    // Fareyle sahne eğimi
    var stage = fmt.querySelector('.fmt__stage');
    if (stage && fine && !reduce) {
      stage.addEventListener('pointermove', function (e) {
        var r = stage.getBoundingClientRect();
        fmt.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        fmt.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
      stage.addEventListener('pointerleave', function () { fmt.style.setProperty('--mx', 0); fmt.style.setProperty('--my', 0); });
    }
  }

  /* =========================================================
     2) Çağrı bandı: veri ağı
     ========================================================= */
  var cta = d.querySelector('.cta-band__card');
  if (cta && window.SDdataNet) window.SDdataNet(cta, cta.querySelector('.cta-band__net'), { color: '124,200,245', packet: '125,211,252', base: 0.08, density: 14000 });

  if (reduce) return;

  /* =========================================================
     3) Site geneli 3D derinlik: eğilen kartlar + ışık parlaması
     ========================================================= */
  var SEL = '.service, .vm__item, .step, .stat, .brand, .partner, .projects-band__mosaic, .about__media, .cta-band__card, .form, .fmt__tab';
  var STRONG = { 'projects-band__mosaic': 7, 'about__media': 6, 'cta-band__card': 4, 'form': 3 };
  d.querySelectorAll(SEL).forEach(function (el) {
    el.classList.add('tilt');
    if (!el.classList.contains('brand') && !el.classList.contains('fmt__tab')) el.insertAdjacentHTML('beforeend', '<span class="tilt__glare" aria-hidden="true"></span>');
  });
  // Görünür olduktan sonra eğim hızlı tepki versin
  var liveIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { var el = e.target; setTimeout(function () { el.classList.add('tilt-live'); }, 900); liveIO.unobserve(el); } });
  }, { threshold: 0.2 }) : null;
  d.querySelectorAll('.tilt').forEach(function (el) { liveIO ? liveIO.observe(el) : el.classList.add('tilt-live'); });

  if (fine) {
    var active = null, raf = 0, ev = null;
    var maxFor = function (el) { for (var k in STRONG) if (el.classList.contains(k)) return STRONG[k]; return el.classList.contains('brand') || el.classList.contains('partner') ? 12 : 8; };
    var apply = function () {
      raf = 0;
      if (!active || !ev) return;
      var r = active.getBoundingClientRect();
      var x = (ev.clientX - r.left) / r.width, y = (ev.clientY - r.top) / r.height, m = maxFor(active);
      active.style.setProperty('--ry', ((x - 0.5) * m * 2).toFixed(2) + 'deg');
      active.style.setProperty('--rx', ((0.5 - y) * m * 2).toFixed(2) + 'deg');
      active.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      active.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    };
    d.addEventListener('pointermove', function (e) {
      var el = e.target.closest ? e.target.closest('.tilt') : null;
      if (el !== active) {
        if (active) { active.classList.remove('is-tilting'); active.style.removeProperty('--rx'); active.style.removeProperty('--ry'); }
        active = el;
        if (active) active.classList.add('is-tilting');
      }
      ev = e;
      if (active && !raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
    d.addEventListener('pointerleave', function () { if (active) { active.classList.remove('is-tilting'); active.style.removeProperty('--rx'); active.style.removeProperty('--ry'); active = null; } });

    /* Hero: reklam sahnesi fareyle 3D döner */
    var hero = d.querySelector('.hero'), stage3d = d.querySelector('.adstage');
    if (hero && stage3d) {
      stage3d.classList.add('stage3d');
      var hx = 0, hy = 0, cx = 0, cy = 0, run = false;
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        hx = (e.clientX - r.left) / r.width - 0.5; hy = (e.clientY - r.top) / r.height - 0.5;
        if (!run) { run = true; requestAnimationFrame(loop); }
      });
      hero.addEventListener('pointerleave', function () { hx = hy = 0; if (!run) { run = true; requestAnimationFrame(loop); } });
      var loop = function () {
        cx += (hx - cx) * 0.07; cy += (hy - cy) * 0.07;
        stage3d.style.setProperty('--hy', (cx * 16 - 10).toFixed(2) + 'deg');
        stage3d.style.setProperty('--hx', (6 - cy * 10).toFixed(2) + 'deg');
        if (Math.abs(hx - cx) > 0.001 || Math.abs(hy - cy) > 0.001) requestAnimationFrame(loop); else run = false;
      };
    }
  }
})();
