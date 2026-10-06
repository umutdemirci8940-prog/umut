/* Splash Digital – site etkileşimleri */
(function () {
  'use strict';
  var d = document;

  // Yıl
  var y = d.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Header gölgesi
  var header = d.querySelector('.header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 20); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobil menü
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

  // Aktif menü bağlantısı
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

  // Kayan görünürlük animasyonu
  var reveals = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Sayaçlar
  function animateCount(el) {
    var end = parseInt(el.getAttribute('data-count'), 10) || 0;
    var pre = el.getAttribute('data-prefix') || '';
    var suf = el.getAttribute('data-suffix') || '';
    var t0 = null, dur = 1600;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = pre + v.toLocaleString('tr-TR') + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = d.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animateCount(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  // Hizmet kartlarında imleç ışığı
  d.querySelectorAll('.service').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Markalar: kayan şerit + "tümünü göster"
  var grid = d.getElementById('brandGrid');
  var marquee = d.getElementById('brandMarquee');
  var toggle = d.getElementById('brandToggle');
  if (grid) {
    var brands = grid.querySelectorAll('.brand');
    if (marquee && brands.length) {
      var frag = d.createDocumentFragment();
      var picks = Array.prototype.slice.call(brands, 0, 40);
      picks.concat(picks).forEach(function (b) { frag.appendChild(b.cloneNode(true)); });
      marquee.appendChild(frag);
    }
    if (toggle) {
      if (brands.length <= 18) toggle.parentNode.style.display = 'none';
      toggle.addEventListener('click', function () {
        var open = grid.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open);
        toggle.textContent = open ? 'Daha az göster' : 'Tüm markaları göster (' + brands.length + ')';
        if (!open) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      toggle.textContent = 'Tüm markaları göster (' + brands.length + ')';
    }
  }

  // Görsel yüklenemezse kartı sade tut
  d.querySelectorAll('.brand img, .partner img').forEach(function (img) {
    img.addEventListener('error', function () { var f = img.closest('figure'); if (f) f.style.display = 'none'; });
  });
  d.querySelectorAll('.work__media img, .about__media img').forEach(function (img) {
    img.addEventListener('error', function () { img.style.visibility = 'hidden'; });
  });

  // İletişim formu
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
        .then(function (r) { return r.json().catch(function () { return { ok: r.ok }; }); })
        .then(function (res) {
          if (res && res.ok) {
            status.className = 'form__status ok';
            status.textContent = 'Teşekkürler! Mesajınız bize ulaştı, en kısa sürede dönüş yapacağız.';
            form.reset();
          } else {
            throw new Error((res && res.message) || 'error');
          }
        })
        .catch(function (err) {
          status.className = 'form__status err';
          status.textContent = (err && err.message && err.message !== 'error' && err.message.indexOf('fetch') < 0)
            ? err.message
            : 'Mesaj gönderilemedi. Lütfen sales@splashdigital.com.tr adresine e-posta gönderin veya +90 535 605 53 92 numarasını arayın.';
        })
        .finally(function () { btn.disabled = false; btn.innerHTML = old; });
    });
    form.addEventListener('input', function (e) { e.target.classList.remove('is-invalid'); });
  }
})();
