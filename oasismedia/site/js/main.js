/* Oasis Media — sayfa etkileşimleri (bağımlılık yok). 3D sıvı obje js/blob.js içinde; listeler js/data.js içinde. */
(function () {
  'use strict';
  var D = window.OASIS_DATA || { clients: [], partners: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* depolama kapalı olabilir */ } }
  };

  /* ---------- Hero başlığı: harf harf ---------- */
  var k = 0;
  $$('.hero-title .chars').forEach(function (el) {
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (word) { // harfler kelime kutusunda: kelime ortadan kırılmaz
            if (!word) return;
            if (/^\s+$/.test(word)) { f.appendChild(document.createTextNode(' ')); return; }
            var wd = document.createElement('span'); wd.className = 'wd';
            Array.from(word).forEach(function (ch) { var s = document.createElement('span'); s.className = 'c'; s.textContent = ch; s.style.setProperty('--k', k++); wd.appendChild(s); });
            f.appendChild(wd);
          });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1) walk(n);
      });
    })(el);
  });

  /* ---------- Yükleme ekranı ---------- */
  var loader = $('#loader');
  if (reduced || store.get('oasis-seen')) {
    loader.hidden = true; root.classList.add('loaded-fast');
  } else {
    store.set('oasis-seen', '1');
    var t0 = performance.now(), ready = false, done = false, cnt = $('#loaderCount'), bar = $('#loaderBar');
    document.addEventListener('oasis:ready', function () { ready = true; });
    (function tick(now) {
      var p = clamp((now - t0) / 1500, 0, 1); p = 1 - Math.pow(1 - p, 3);
      if (!ready && p > 0.9) p = 0.9 + (p - 0.9) * 0.2;
      cnt.textContent = Math.round(p * 100); bar.style.transform = 'scaleX(' + p + ')';
      if ((p >= 0.999 || (ready && now - t0 > 1500)) && !done) {
        done = true; cnt.textContent = '100'; bar.style.transform = 'scaleX(1)';
        setTimeout(function () { loader.classList.add('is-done'); setTimeout(function () { loader.hidden = true; }, 1200); }, 250);
        return;
      }
      if (now - t0 > 6000) { done = true; loader.classList.add('is-done'); return; }
      requestAnimationFrame(tick);
    })(t0);
  }

  /* ---------- Menü, ilerleme, etkin bağlantı ---------- */
  var nav = $('#nav'), burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }); });
  var sections = $$('main section[id]'), progress = $('#progress');
  $('#year').textContent = Math.max(2025, new Date().getFullYear());

  /* ---------- İmleç ve mıknatıslı öğeler ---------- */
  if (fine && !reduced) {
    root.classList.add('has-cursor');
    var cur = $('#cursor'), label = $('#cursorLabel'), mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; }, { passive: true });
    (function loop() { cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', function (e) {
      var el = e.target.closest('a, button, [data-cursor], input, textarea, .logo-tile');
      var txt = el && el.dataset.cursor;
      cur.classList.toggle('is-link', !!el && !txt); cur.classList.toggle('has-label', !!txt); label.textContent = txt || '';
    });
    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.3 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.35 + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- Başlıklar kelime kelime ---------- */
  $$('.split').forEach(function (h) {
    var n2 = 0;
    (function walk(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var f = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { f.appendChild(document.createTextNode(part)); return; }
            var w = document.createElement('span'); w.className = 'w';
            var i = document.createElement('span'); i.textContent = part; i.style.setProperty('--k', n2++);
            w.appendChild(i); f.appendChild(w);
          });
          n.parentNode.replaceChild(f, n);
        } else if (n.nodeType === 1 && !n.id) walk(n);
      });
    })(h);
  });
  $$('.big-p, .lead-sm, .brands, .numbers .quote, .contact-info, .form, .cats, .actions, .card').forEach(function (el) { el.classList.add('rise'); });
  var io = 'IntersectionObserver' in window && !reduced ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.2 }) : null;
  $$('.split, .rise').forEach(function (el) { if (io) io.observe(el); else el.classList.add('is-in'); });

  /* ---------- Kartlar fareyle eğilir ---------- */
  function tilt(el, amt) {
    if (!fine || reduced) return;
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', ((0.5 - y) * amt).toFixed(2) + 'deg'); el.style.setProperty('--ry', ((x - 0.5) * amt).toFixed(2) + 'deg');
      el.style.setProperty('--mx', (x * 100) + '%'); el.style.setProperty('--my', (y * 100) + '%');
    });
    el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  }
  $$('[data-tilt]').forEach(function (el) { tilt(el, 6); });

  /* ---------- Manifesto: kelimeler kaydırdıkça yanar ---------- */
  var man = $('#hakkimizda'), manText = $('#manifestoText');
  var HOT = ['300’ü', 'aşkın', 'site', 'exclusive', 'KPI’larına', 'hedeflemeler'];
  manText.innerHTML = manText.textContent.trim().split(/\s+/).map(function (w) {
    return '<span class="mw' + (HOT.indexOf(w.replace(/[.,;]/g, '')) > -1 ? ' hotw' : '') + '">' + w + '</span>';
  }).join(' ');
  var mws = $$('.mw', manText);

  /* ---------- Rakamlar ---------- */
  if (D.clients.length) { $('#clientCount').dataset.count = D.clients.length; $('#clientCount').textContent = D.clients.length; $('#clientCount2').textContent = D.clients.length; }
  function countUp(el) {
    var to = +el.dataset.count, suf = el.dataset.suffix || '', s0 = performance.now();
    (function step(t) { var p = clamp((t - s0) / 1800, 0, 1); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))) + suf; if (p < 1) requestAnimationFrame(step); })(s0);
  }
  if (io) {
    var cio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } }); }, { threshold: 0.6 });
    $$('[data-count]').forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Hizmetler: yatay kayan kartlar ---------- */
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
  var track = $('#servicesTrack');
  track.innerHTML = SERVICES.map(function (s, i) {
    return '<article class="svc-card"><span class="n">0' + (i + 1) + '</span><h3>' + s.name + '</h3><p>' + s.text + '</p><p class="tagline">' + s.tagline + '</p></article>';
  }).join('');
  var svcSec = $('#hizmetler'), svcBar = $('#servicesBar');

  /* ---------- Kaydırmaya bağlı her şey tek döngüde ---------- */
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    var cur2 = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * 0.5) cur2 = s.id; });
    $$('#navLinks a').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur2); });
    // manifesto
    var mr = man.getBoundingClientRect(), mp = clamp(-mr.top / (mr.height - innerHeight), 0, 1);
    var lit = Math.round(mp * 1.15 * mws.length);
    mws.forEach(function (w, i) { w.classList.toggle('on', i < lit); w.classList.toggle('hot', i < lit && w.classList.contains('hotw')); });
    // hizmetler
    if (innerWidth > 760) {
      var sr = svcSec.getBoundingClientRect(), sp = clamp(-sr.top / (sr.height - innerHeight), 0, 1);
      var max = track.scrollWidth - innerWidth;
      track.style.transform = 'translateX(' + (-sp * Math.max(0, max)) + 'px)';
      svcBar.style.transform = 'scaleX(' + sp + ')';
    }
  }
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); onScroll();

  /* ---------- Projeler: kapak PDF'in ilk sayfası (sunucuda); bağlantılar sunumu yeni sekmede açar ---------- */
  var projSec = $('#projeler'), PDF_URL = projSec.dataset.pdf, PDFJS = 'vendor/pdfjs/'; // PDF.js 3.11.174 (Apache-2.0)
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise(function (res, rej) {
      var sc = document.createElement('script'); sc.src = PDFJS + 'pdf.min.js';
      sc.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); };
      sc.onerror = rej; document.head.appendChild(sc);
    });
  }
  function cover() {
    if (location.protocol === 'file:') return; // dosyadan açıldığında tarayıcı PDF okumaya izin vermez; tasarım kapağı kalır
    fetch(PDF_URL).then(function (r) { if (!r.ok) throw r.status; return r.arrayBuffer(); })
      .then(function (data) { return loadPdfJs().then(function (lib) { return lib.getDocument({ data: data }).promise; }); })
      .then(function (pdf) {
        $('#pdfMeta').textContent = 'PDF · ' + pdf.numPages + ' sayfa';
        return pdf.getPage(1).then(function (page) {
          var c = $('#pdfThumb'), base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: 1280 / base.width });
          c.width = vp.width; c.height = vp.height;
          return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function () { c.hidden = false; $('#pdfPlaceholder').hidden = true; });
        });
      }).catch(function () { /* kapak tasarımı kalır */ });
  }
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { pio.disconnect(); cover(); } }, { rootMargin: '500px' });
    pio.observe(projSec);
  } else cover();

  /* ---------- Müşteriler: spot ışıklı logo duvarı ---------- */
  var NAMES = { a90: 'A90 Pictures', anabank: 'Anadolubank', bparmak: 'Balparmak', btoptan: 'Bizim Toptan', ck: 'Calvin Klein', cocacola: 'Coca-Cola', cs: 'CarrefourSA', ct: 'Cola Turka', gbbva: 'Garanti BBVA', hm: 'H&M', lufi: 'Lufian', ing: 'ING', bmw: 'BMW', bim: 'BİM', jbl: 'JBL', qnb: 'QNB', teb: 'TEB', vw: 'Volkswagen', tt: 'Türk Telekom', 'ford-trucks': 'Ford Trucks', 'm-coco': 'M.Coco' };
  var nameOf = function (k2) { var l = k2.toLowerCase(); return NAMES[l] || (k2.charAt(0).toUpperCase() + k2.slice(1)); };
  var wall = $('#logoWall');
  wall.innerHTML = D.clients.map(function (c) {
    return '<div class="logo-tile' + (c.dark ? ' dark' : '') + '"><img src="' + c.logo + '" alt="' + nameOf(c.key) + '" loading="lazy" decoding="async"><span class="nm">' + nameOf(c.key) + '</span></div>';
  }).join('');
  if (fine) {
    wall.addEventListener('pointermove', function (e) {
      var r = wall.getBoundingClientRect();
      wall.style.setProperty('--sx', (e.clientX - r.left) + 'px'); wall.style.setProperty('--sy', (e.clientY - r.top) + 'px');
    });
    wall.addEventListener('pointerleave', function () { wall.style.setProperty('--sx', '-999px'); });
  }

  /* ---------- İş ortakları: 3D halka ---------- */
  var ring = $('#orbitRing'), n = D.partners.length || 1;
  ring.innerHTML = D.partners.map(function (p, i) {
    return '<div class="orbit-item" style="--a:' + (i * 360 / n) + 'deg;--y:' + (i % 2 ? 70 : -70) + 'px"><img src="' + p.logo + '" alt="Yayıncı partner: ' + p.key.replace(/-\d+$/, '') + '" loading="lazy"></div>';
  }).join('');
  function ringR() { ring.style.setProperty('--r', Math.min(340, innerWidth * 0.36) + 'px'); $$('.orbit-item', ring).forEach(function (it) { it.style.setProperty('--r', Math.min(340, innerWidth * 0.36) + 'px'); }); }
  ringR(); addEventListener('resize', ringR);

  /* ---------- Kopyala ---------- */
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

  /* ---------- İletişim formu: e-posta uygulamasında hazır taslak ---------- */
  var form = $('#contactForm'), status = $('#formStatus');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) {
      status.className = 'form-status err';
      var bad = form.querySelector(':invalid');
      status.textContent = (bad && bad.type === 'email' && bad.value) ? 'E-posta adresini kontrol edin (ör. ad@firma.com).' : 'Lütfen isim, soyisim, e-posta, konu ve mesaj alanlarını doldurun.';
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
