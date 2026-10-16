/* Oasis Media — sayfa etkileşimleri (bağımlılık yok). 3D sahne js/scene.js içinde; listeler js/data.js içinde. */
(function () {
  'use strict';
  var D = window.OASIS_DATA || { clients: [], partners: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var emit = function (n) { document.dispatchEvent(new CustomEvent(n)); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* depolama kapalı olabilir */ } }
  };

  /* ---------- Açılış: güneş sudan doğarken logolar yüklenir ---------- */
  var intro = $('#intro');
  var finished = false;
  function finish() {
    if (finished) return; finished = true;
    intro.classList.add('is-done');
    root.classList.remove('intro-on'); root.classList.add('intro-off');
    emit('oasis:intro-done');
    setTimeout(function () { intro.hidden = true; }, 1000);
  }
  if (reduced || store.get('oasis-intro')) {
    intro.classList.add('is-skipped'); intro.hidden = true; root.classList.add('intro-off'); finished = true;
  } else {
    store.set('oasis-intro', '1');
    root.classList.add('intro-on');
    var t0 = performance.now(), ready = false, bar = $('#introBar'), boot = $('#introBoot');
    var lines = ['Vaha hazırlanıyor…', 'Güneş doğuyor…', '300+ yayıncı ağa bağlanıyor…', '145 marka suya iniyor…'];
    var li = 0, lt = setInterval(function () { li = Math.min(lines.length - 1, li + 1); boot.textContent = lines[li]; }, 900);
    document.addEventListener('oasis:progress', function (e) { bar.style.transform = 'scaleX(' + Math.max(0.05, e.detail || 0) + ')'; });
    document.addEventListener('oasis:ready', function () {
      ready = true; bar.style.transform = 'scaleX(1)';
      setTimeout(function () { clearInterval(lt); boot.textContent = 'Hoş geldiniz.'; setTimeout(finish, 450); }, Math.max(0, 3000 - (performance.now() - t0)));
    });
    $('#introSkip').addEventListener('click', finish);
    document.addEventListener('keydown', function k(e) { if (e.key === 'Enter' || e.key === 'Escape') { finish(); document.removeEventListener('keydown', k); } });
    setTimeout(finish, 9000);
  }

  /* ---------- Menü, ilerleme çubuğu, etkin bağlantı ---------- */
  var nav = $('#nav'), burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }); });
  var sections = $$('main section[id]'), progress = $('#progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    var cur = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * 0.45) cur = s.id; });
    $$('#navLinks a').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + cur); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#year').textContent = Math.max(2025, new Date().getFullYear());

  /* ---------- Başlık etiketleri: göründüklerinde harfler çözülerek belirir ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var GLYPHS = '01<>/#%&*+=?ABCDEFKLMNOPRSTUVYZ';
    var scramble = function (el) {
      var final = el.textContent, t0s = performance.now(), dur = 900;
      (function step(t) {
        var k = Math.min(1, (t - t0s) / dur), out = '';
        for (var i = 0; i < final.length; i++) out += (final[i] === ' ' || i / final.length < k) ? final[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        el.textContent = out;
        if (k < 1) requestAnimationFrame(step); else el.textContent = final;
      })(t0s);
    };
    var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { sio.unobserve(e.target); scramble(e.target); } }); }, { threshold: 1 });
    $$('.eyebrow').forEach(function (el) { sio.observe(el); });
  }

  /* ---------- Hizmetler ---------- */
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
  var tabs = $('#svcTabs'), panel = $('#svcPanel');
  SERVICES.forEach(function (s, i) {
    var li = document.createElement('li');
    li.innerHTML = '<button class="svc-tab" role="tab" id="svc-' + i + '" aria-controls="svcPanel" aria-selected="false" type="button"><span class="n">0' + (i + 1) + '</span><span>' + s.name + '</span></button>';
    tabs.appendChild(li);
  });
  function showService(i, focus) {
    var s = SERVICES[i];
    $$('.svc-tab', tabs).forEach(function (t, j) { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'svc-' + i);
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    panel.innerHTML = '<h3>' + s.name + '</h3><p>' + s.text + '</p><p class="tagline">' + s.tagline + '</p><a class="btn" href="#iletisim">Bu hizmet için teklif alın</a>';
    if (focus) $$('.svc-tab', tabs)[i].focus();
  }
  tabs.addEventListener('click', function (e) { var b = e.target.closest('.svc-tab'); if (b) showService($$('.svc-tab', tabs).indexOf(b)); });
  tabs.addEventListener('keydown', function (e) {
    var cur = $$('.svc-tab', tabs).findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; });
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); showService((cur + 1) % SERVICES.length, true); }
    if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); showService((cur + SERVICES.length - 1) % SERVICES.length, true); }
  });
  showService(0);

  /* ---------- Projeler: kapak ve düğme PDF sunumunu yeni sekmede açar; kapağa PDF'in ilk sayfası çizilir ---------- */
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
    if (location.protocol === 'file:') return;
    fetch(PDF_URL).then(function (r) { if (!r.ok) throw r.status; return r.arrayBuffer(); })
      .then(function (data) { return loadPdfJs().then(function (lib) { return lib.getDocument({ data: data }).promise; }); })
      .then(function (pdf) {
        $('#pdfMeta').textContent = 'PDF · ' + pdf.numPages + ' sayfa';
        return pdf.getPage(1).then(function (page) {
          var c = $('#pdfThumb'), base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: 1280 / base.width });
          c.width = vp.width; c.height = vp.height;
          return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function () { c.hidden = false; $('#pdfPlaceholder').hidden = true; });
        });
      }).catch(function () { /* kapak tasarımı kalır; bağlantılar yine PDF'i açar */ });
  }
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { pio.disconnect(); cover(); } }, { rootMargin: '400px' });
    pio.observe(projSec);
  } else cover();

  /* ---------- Müşteriler ---------- */
  var NAMES = { a90: 'A90 Pictures', anabank: 'Anadolubank', bparmak: 'Balparmak', btoptan: 'Bizim Toptan', ck: 'Calvin Klein', cocacola: 'Coca-Cola', cs: 'CarrefourSA', ct: 'Cola Turka', gbbva: 'Garanti BBVA', hm: 'H&M', lufi: 'Lufian', ing: 'ING', bmw: 'BMW', bim: 'BİM', jbl: 'JBL', qnb: 'QNB', teb: 'TEB', vw: 'Volkswagen', tt: 'Türk Telekom', 'ford-trucks': 'Ford Trucks', 'm-coco': 'M.Coco' };
  var nameOf = function (k) { var l = k.toLowerCase(); return NAMES[l] || (k.charAt(0).toUpperCase() + k.slice(1)); };
  window.oasisClientName = nameOf;
  if (D.clients.length) $('#clientCount').textContent = D.clients.length;
  var allBtn = $('#allClientsBtn'), all = $('#allLogos');
  allBtn.addEventListener('click', function () {
    if (!all.childElementCount) all.innerHTML = D.clients.map(function (c) { return '<div class="logo-cell' + (c.dark ? ' dark' : '') + '"><img src="' + c.logo + '" alt="' + nameOf(c.key) + '" loading="lazy" decoding="async"></div>'; }).join('');
    all.hidden = !all.hidden;
    allBtn.setAttribute('aria-expanded', !all.hidden);
    allBtn.textContent = all.hidden ? 'Tüm müşterilerimizi listele' : 'Listeyi gizle';
  });

  /* ---------- İş ortakları (3D halkada gösterilir; WebGL yoksa ızgara) ---------- */
  $('#partnerWall').innerHTML = D.partners.map(function (p) { return '<img src="' + p.logo + '" alt="Yayıncı partner: ' + p.key.replace(/-\d+$/, '') + '" loading="lazy" decoding="async">'; }).join('');

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

  /* ---------- İletişim formu: e-posta uygulamasında hazır taslak açar ---------- */
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
