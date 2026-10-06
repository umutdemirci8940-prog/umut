/* Splash Digital – site etkileşimleri ve animasyonları */
(function () {
  'use strict';
  var d = document;
  var root = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Yıl
  var y = d.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Başlıkları kelimelere böl ---------- */
  function splitWords(el) {
    var i = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = d.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(d.createTextNode(part)); return; }
            var w = d.createElement('span'); w.className = 'w';
            var inner = d.createElement('span'); inner.textContent = part; inner.style.setProperty('--i', i++);
            w.appendChild(inner); frag.appendChild(w);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1 && n.tagName !== 'BR') {
          walk(n);
        }
      });
    })(el);
  }
  var splitTargets = d.querySelectorAll('.hero__title, .section__head h2, .about__text h2, .contact__info h2');
  splitTargets.forEach(function (el) { el.classList.add('split'); splitWords(el); });

  /* ---------- Açılış ---------- */
  var hero = d.querySelector('.hero');
  var heroTitle = d.querySelector('.hero__title');
  function startHero() {
    if (hero) hero.classList.add('is-ready');
    if (heroTitle) heroTitle.classList.add('is-in');
  }
  var loader = d.querySelector('.loader');
  var seen = root.classList.contains('intro-seen');
  if (loader && !seen && !reduce) {
    var done = false;
    var finish = function () {
      if (done) return; done = true;
      loader.classList.add('is-leaving');
      setTimeout(startHero, 250);
      setTimeout(function () { loader.classList.add('is-done'); }, 850);
      try { sessionStorage.setItem('sd-intro', '1'); } catch (e) {}
    };
    // Sayfa yüklenince (en az 1,3 sn, en çok 3 sn) kapanır
    var t0 = Date.now();
    window.addEventListener('load', function () { setTimeout(finish, Math.max(0, 1300 - (Date.now() - t0))); });
    setTimeout(finish, 3000);
  } else {
    if (loader) loader.classList.add('is-done');
    requestAnimationFrame(startHero);
  }

  /* ---------- Header ---------- */
  var header = d.querySelector('.header');

  /* ---------- Mobil menü ---------- */
  var burger = d.getElementById('burger');
  var nav = d.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Aktif menü bağlantısı ---------- */
  var links = Array.prototype.slice.call(d.querySelectorAll('.nav a[href^="#"]'));
  var sections = links.map(function (a) { return d.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { navIO.observe(s); });
  }

  /* ---------- Görünürlük animasyonları ---------- */
  var reveals = d.querySelectorAll('.reveal, .split:not(.hero__title)');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      if (el.classList.contains('reveal')) el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Sayaçlar ---------- */
  function animateCount(el) {
    var end = parseInt(el.getAttribute('data-count'), 10) || 0;
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var t0 = null, dur = 1800;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString('tr-TR') + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduce) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    d.querySelectorAll('[data-count]').forEach(function (c) { cio.observe(c); });
  }

  /* ---------- Kaydırmaya bağlı efektler (tek rAF döngüsü) ---------- */
  var kinetic = Array.prototype.slice.call(d.querySelectorAll('.kinetic__row'));
  var workImgs = Array.prototype.slice.call(d.querySelectorAll('.work__media img'));
  var stepsLine = d.querySelector('.steps__line span');
  var stepsEl = d.querySelector('.steps');
  var blobs = Array.prototype.slice.call(d.querySelectorAll('.hero .blob'));
  var ticking = false;
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  function update() {
    ticking = false;
    var sy = window.scrollY, vh = window.innerHeight;
    if (header) header.classList.toggle('is-scrolled', sy > 20);
    if (reduce) return;
    kinetic.forEach(function (row) {
      var r = row.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var sp = parseFloat(row.getAttribute('data-speed')) || 0.3;
      row.style.transform = 'translate3d(' + ((r.top - vh) * sp) + 'px,0,0)';
    });
    workImgs.forEach(function (img) {
      var r = img.parentNode.getBoundingClientRect();
      if (r.bottom < 0 || r.top > vh) return;
      var p = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
      img.style.setProperty('--py', (p * -24).toFixed(1) + 'px');
    });
    if (stepsLine && stepsEl) {
      var sr = stepsEl.getBoundingClientRect();
      var prog = Math.min(Math.max((vh * 0.85 - sr.top) / (sr.height + vh * 0.35), 0), 1);
      stepsLine.parentNode.style.setProperty('--p', prog.toFixed(3));
    }
    if (sy < vh) blobs.forEach(function (b, i) { b.style.translate = '0 ' + (sy * (0.15 + i * 0.1)).toFixed(0) + 'px'; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* ---------- Hero: su dalgası kanvası ---------- */
  var cv = d.getElementById('ripples');
  if (cv && cv.getContext && !reduce) {
    var ctx = cv.getContext('2d');
    var rings = [], W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), lastDrop = 0, visible = true;
    var resize = function () {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    var drop = function (x, yy, strong) {
      rings.push({ x: x, y: yy, r: 2, a: strong ? 0.55 : 0.32, v: strong ? 3.2 : 2.2 });
      if (rings.length > 40) rings.shift();
    };
    hero.addEventListener('pointermove', function (e) {
      var now = performance.now();
      if (now - lastDrop < 90) return;
      lastDrop = now;
      var r = cv.getBoundingClientRect();
      drop(e.clientX - r.left, e.clientY - r.top, false);
    });
    hero.addEventListener('pointerdown', function (e) {
      var r = cv.getBoundingClientRect();
      drop(e.clientX - r.left, e.clientY - r.top, true);
      setTimeout(function () { drop(e.clientX - r.left, e.clientY - r.top, true); }, 160);
    });
    var auto = setInterval(function () { if (visible && !d.hidden) drop(Math.random() * W, Math.random() * H * 0.9, false); }, 1400);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(hero);
    (function loop() {
      requestAnimationFrame(loop);
      if (!visible) return;
      ctx.clearRect(0, 0, W, H);
      for (var i = rings.length - 1; i >= 0; i--) {
        var g = rings[i];
        g.r += g.v; g.v *= 0.992; g.a *= 0.975;
        if (g.a < 0.01) { rings.splice(i, 1); continue; }
        ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(18,125,197,' + (g.a * 0.55) + ')'; ctx.lineWidth = 1.2; ctx.stroke();
        if (g.r > 14) {
          ctx.beginPath(); ctx.arc(g.x, g.y, g.r * 0.62, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(18,125,197,' + (g.a * 0.3) + ')'; ctx.lineWidth = 1; ctx.stroke();
        }
      }
    })();
    void auto;
  }

  /* ---------- Özel imleç ---------- */
  var cursor = d.querySelector('.cursor');
  if (cursor && finePointer && !reduce) {
    var dot = cursor.querySelector('.cursor__dot'), ring = cursor.querySelector('.cursor__ring'), label = cursor.querySelector('.cursor__label');
    var mx = -100, my = -100, rx = -100, ry = -100;
    d.addEventListener('pointermove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate3d(' + mx + 'px,' + my + 'px,0)';
    }, { passive: true });
    (function follow() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = 'translate3d(' + rx + 'px,' + ry + 'px,0)';
      requestAnimationFrame(follow);
    })();
    d.addEventListener('pointerover', function (e) {
      var lab = e.target.closest('[data-cursor]');
      var link = e.target.closest('a, button, label, summary, input, textarea, select');
      cursor.classList.toggle('is-label', !!lab);
      label.textContent = lab ? lab.getAttribute('data-cursor') : '';
      cursor.classList.toggle('is-link', !lab && !!link);
    });
    d.addEventListener('pointerleave', function () { cursor.classList.add('is-hidden'); });
    d.addEventListener('pointerenter', function () { cursor.classList.remove('is-hidden'); });
    d.querySelectorAll('iframe').forEach(function (f) {
      f.addEventListener('mouseenter', function () { cursor.classList.add('is-hidden'); });
      f.addEventListener('mouseleave', function () { cursor.classList.remove('is-hidden'); });
    });
  }

  /* ---------- Manyetik butonlar ---------- */
  if (finePointer && !reduce) {
    d.querySelectorAll('.btn--primary, .wa').forEach(function (el) {
      el.classList.add('magnet');
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left - r.width / 2) * 0.12, yy = (e.clientY - r.top - r.height / 2) * 0.18;
        el.style.transform = 'translate(' + x + 'px,' + yy + 'px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- Hizmet kartlarında ışık ---------- */
  d.querySelectorAll('.service').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- Projeler: "tümünü göster" ---------- */
  function toggler(gridId, btnId, limitDesk, limitMob, label) {
    var grid = d.getElementById(gridId), btn = d.getElementById(btnId);
    if (!grid || !btn) return null;
    var count = grid.children.length;
    var limit = window.innerWidth <= 600 ? limitMob : limitDesk;
    if (count <= limit) { btn.style.display = 'none'; return grid; }
    var setText = function (open) { btn.textContent = open ? 'Daha az göster' : label + ' (' + count + ')'; };
    setText(false);
    btn.addEventListener('click', function () {
      var open = grid.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', open);
      setText(open);
      if (!open) grid.scrollIntoView({ behavior: 'smooth' });
      onScroll();
    });
    return grid;
  }
  toggler('workGrid', 'workToggle', 9, 6, 'Tüm projeleri göster');
  var brandGrid = toggler('brandGrid', 'brandToggle', 18, 12, 'Tüm markaları göster');

  /* ---------- Marka şeritleri ---------- */
  if (brandGrid) {
    var all = Array.prototype.slice.call(brandGrid.querySelectorAll('.brand'));
    var fill = function (id, list) {
      var track = d.getElementById(id);
      if (!track || !list.length) return;
      var frag = d.createDocumentFragment();
      list.concat(list).forEach(function (b) { var c = b.cloneNode(true); c.querySelector('img').loading = 'lazy'; frag.appendChild(c); });
      track.appendChild(frag);
    };
    var half = Math.ceil(all.length / 2);
    fill('brandMarquee', all.slice(0, half));
    fill('brandMarquee2', all.slice(half));
  }

  /* ---------- Görsel yüklenemezse ---------- */
  d.querySelectorAll('.brand img, .partner img').forEach(function (img) {
    img.addEventListener('error', function () { var f = img.closest('figure'); if (f) f.style.display = 'none'; });
  });
  d.querySelectorAll('.work__media img, .about__media img').forEach(function (img) {
    img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
  });

  /* ---------- İletişim formu ---------- */
  var form = d.getElementById('contactForm');
  var status = d.getElementById('formStatus');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.className = 'form__status';
      status.textContent = '';
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = f.type === 'checkbox' ? !f.checked : !f.value.trim() || (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
        f.classList.toggle('is-invalid', bad);
        if (bad) ok = false;
      });
      if (!ok) {
        status.className = 'form__status err';
        status.textContent = 'Lütfen zorunlu alanları eksiksiz doldurun.';
        return;
      }
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      var old = btn.innerHTML;
      btn.textContent = 'Gönderiliyor...';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json().catch(function () { return { ok: false }; }); })
        .then(function (res) {
          if (res && res.ok) {
            status.className = 'form__status ok';
            status.textContent = 'Teşekkürler! Mesajınız bize ulaştı, en kısa sürede dönüş yapacağız.';
            form.reset();
          } else {
            throw new Error((res && res.message) || '');
          }
        })
        .catch(function (err) {
          status.className = 'form__status err';
          status.textContent = (err && err.message && !/fetch|network/i.test(err.message))
            ? err.message
            : 'Mesaj gönderilemedi. Lütfen sales@splashdigital.com.tr adresine e-posta gönderin veya +90 535 605 53 92 numarasını arayın.';
        })
        .finally(function () { btn.disabled = false; btn.innerHTML = old; });
    });
    form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); });
  }
})();
