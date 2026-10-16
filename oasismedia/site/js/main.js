/* Oasis Media — etkileşimler. Bağımlılık yok; içerik listeleri js/data.js (window.OASIS_DATA) içinde. */
(function () {
  'use strict';
  var D = window.OASIS_DATA || { clients: [], partners: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  var css = getComputedStyle(document.documentElement);
  var color = function (n) { return css.getPropertyValue(n).trim(); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* depolama kapalı olabilir */ } }
  };

  /* ---------- Palmiye yaprağı (logodaki yaprak motifinden) ---------- */
  function drawLeaf(svg) {
    var ns = 'http://www.w3.org/2000/svg';
    var g = document.createElementNS(ns, 'g');
    var p = function (t) { var x0 = 176, y0 = 182, cx = 120, cy = 70, x1 = 22, y1 = 28; // eğri gövde
      var mt = 1 - t; return [mt * mt * x0 + 2 * mt * t * cx + t * t * x1, mt * mt * y0 + 2 * mt * t * cy + t * t * y1]; };
    var stem = document.createElementNS(ns, 'path');
    stem.setAttribute('d', 'M176 182 Q120 70 22 28');
    stem.setAttribute('stroke', '#fff7ec'); stem.setAttribute('stroke-width', '3'); stem.setAttribute('fill', 'none'); stem.setAttribute('stroke-linecap', 'round');
    g.appendChild(stem);
    for (var i = 1; i < 17; i++) {
      var t = i / 17, a = p(t), b = p(t + 0.01);
      var ang = Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
      var len = 46 * Math.sin(Math.PI * (0.15 + t * 0.8)) + 8;
      [-1, 1].forEach(function (side) {
        var e = document.createElementNS(ns, 'ellipse');
        e.setAttribute('cx', len / 2); e.setAttribute('cy', 0); e.setAttribute('rx', len / 2); e.setAttribute('ry', 3.2);
        e.setAttribute('fill', '#fff7ec'); e.setAttribute('opacity', side < 0 ? '0.92' : '0.7');
        e.setAttribute('transform', 'translate(' + a[0] + ' ' + a[1] + ') rotate(' + (ang + side * 58) + ')');
        g.appendChild(e);
      });
    }
    svg.appendChild(g);
  }
  $$('[data-leaf]').forEach(drawLeaf);

  /* ---------- Açılış ---------- */
  var intro = $('#intro');
  var seen = store.get('oasis-intro');
  if (reduced || seen) {
    intro.classList.add('is-skipped');
    document.documentElement.classList.add('no-intro');
  } else {
    store.set('oasis-intro', '1');
    var boot = $('#introBoot');
    var lines = [
      ['> 300+ partner site bağlanıyor…', 700],
      ['> KPI hedeflemeleri yükleniyor…', 1500],
      ['<span class="ok">✓ oasis network hazır</span>', 2400]
    ];
    var timers = lines.map(function (l) { return setTimeout(function () { boot.innerHTML = '<span>' + l[0] + '</span>'; }, l[1]); });
    var finish = function () {
      if (intro.classList.contains('is-done')) return;
      timers.forEach(clearTimeout);
      intro.classList.add('is-done');
      document.documentElement.classList.add('no-intro');
      setTimeout(function () { intro.classList.add('is-skipped'); }, 600);
      document.dispatchEvent(new CustomEvent('oasis:intro-done'));
    };
    $('#introSkip').addEventListener('click', finish);
    intro.addEventListener('dblclick', finish);
    document.addEventListener('keydown', function onKey(e) { if (e.key === 'Enter' || e.key === 'Escape') { finish(); document.removeEventListener('keydown', onKey); } });
    intro.addEventListener('animationend', function (e) { if (e.target === intro) { intro.classList.add('is-skipped'); document.dispatchEvent(new CustomEvent('oasis:intro-done')); } });
    intro.addEventListener('animationstart', function (e) { if (e.target === intro && e.animationName === 'intro-out') document.dispatchEvent(new CustomEvent('oasis:intro-done')); });
  }

  /* ---------- Menü ---------- */
  var nav = $('#nav'), burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); }); });

  var sections = $$('main section[id]');
  var progress = $('#progress');
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? scrollY / h : 0) + ')';
    var current = '';
    sections.forEach(function (s) { if (s.getBoundingClientRect().top < 140) current = s.id; });
    $$('#navLinks a').forEach(function (a) { a.classList.toggle('is-active', a.getAttribute('href') === '#' + current); });
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#toTop').addEventListener('click', function () { scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });
  $('#year').textContent = Math.max(2025, new Date().getFullYear());

  /* ---------- Özel imleç & mıknatıslı butonlar ---------- */
  if (finePointer && !reduced) {
    document.documentElement.classList.add('has-cursor');
    var cur = $('#cursor'), dot = $('#cursorDot'), mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
    addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)'; });
    (function loop() { cx += (mx - cx) * 0.18; cy += (my - cy) * 0.18; cur.style.transform = 'translate(' + cx + 'px,' + cy + 'px)'; requestAnimationFrame(loop); })();
    document.addEventListener('mouseover', function (e) { cur.classList.toggle('is-hover', !!e.target.closest('a, button, [role="button"], .logo-chip, .partner')); });

    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('mousemove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) * 0.25 + 'px,' + (e.clientY - r.top - r.height / 2) * 0.35 + 'px)';
      });
      b.addEventListener('mouseleave', function () { b.style.transform = ''; });
    });
  }

  /* ---------- Hero: 300+ sitelik ağ ---------- */
  (function network() {
    if (window.WebGLRenderingContext && document.createElement('canvas').getContext('webgl')) { $('#net').remove(); return; } // WebGL varsa parçacık sahnesi devralır
    var cv = $('#net'), ctx = cv.getContext('2d'), hero = $('#hero');
    var W, H, dpr, nodes = [], mouse = { x: -999, y: -999 }, running = true;
    var cSun = color('--sun'), cPalm = color('--palm'), cGold = color('--gold');
    function size() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.round(Math.min(90, W * H / 14000));
      nodes = [];
      for (var i = 0; i < n; i++) nodes.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.8 + 1, hub: Math.random() < .12 });
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) {
        var a = nodes[i];
        if (!reduced) {
          a.x += a.vx; a.y += a.vy;
          if (a.x < 0 || a.x > W) a.vx *= -1;
          if (a.y < 0 || a.y > H) a.vy *= -1;
          var dx = mouse.x - a.x, dy = mouse.y - a.y, dm = Math.hypot(dx, dy);
          if (dm < 160) { a.x += dx * 0.012; a.y += dy * 0.012; }
        }
        for (var j = i + 1; j < nodes.length; j++) {
          var b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 130) {
            ctx.globalAlpha = (1 - d / 130) * ((a.hub || b.hub) ? 0.55 : 0.32);
            ctx.strokeStyle = (a.hub || b.hub) ? cSun : cPalm;
            ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      nodes.forEach(function (n) {
        ctx.fillStyle = n.hub ? cSun : cPalm; ctx.globalAlpha = n.hub ? 1 : .55;
        ctx.beginPath(); ctx.arc(n.x, n.y, n.hub ? n.r + 1.6 : n.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (mouse.x > 0) {
        var g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        g.addColorStop(0, cSun + '33'); g.addColorStop(1, cSun + '00');
        ctx.fillStyle = g; ctx.fillRect(mouse.x - 160, mouse.y - 160, 320, 320);
      }
      if (running && !reduced) requestAnimationFrame(frame);
    }
    size(); frame();
    addEventListener('resize', function () { size(); if (reduced) frame(); });
    hero.addEventListener('mousemove', function (e) { var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('mouseleave', function () { mouse.x = mouse.y = -999; });
    if ('IntersectionObserver' in window && !reduced) {
      new IntersectionObserver(function (en) { var v = en[0].isIntersecting; if (v && !running) { running = true; frame(); } running = v; }).observe(hero);
    }
  })();

  /* ---------- Hero: oyuncak sahne (paralaks + güneş patlaması) ---------- */
  var toybox = $('#toybox');
  if (finePointer && !reduced) {
    $('#hero').addEventListener('mousemove', function (e) {
      var x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
      $$('[data-depth]', toybox).forEach(function (el) { var d = +el.dataset.depth; el.style.translate = (x * d) + 'px ' + (y * d) + 'px'; });
    });
  }
  var bursts = ['+%38 CTR', 'KPI ✓', '300+ site', 'Masthead!', 'Gravity', 'Rich Media', 'Erişim ↑', '970×250', 'Exclusive', 'Rapor ✓'];
  var burstIdx = 0;
  function burst(x, y) {
    if (reduced) return;
    for (var i = 0; i < 6; i++) {
      var s = document.createElement('span');
      s.className = 'burst'; s.textContent = bursts[burstIdx++ % bursts.length];
      s.style.left = x + 'px'; s.style.top = y + 'px';
      document.body.appendChild(s);
      var ang = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 120;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + Math.cos(ang) * dist + 'px), calc(-50% + ' + Math.sin(ang) * dist + 'px)) rotate(' + (Math.random() * 40 - 20) + 'deg) scale(1)', opacity: 1, offset: .6 },
        { transform: 'translate(calc(-50% + ' + Math.cos(ang) * dist * 1.2 + 'px), calc(-50% + ' + (Math.sin(ang) * dist * 1.2 + 60) + 'px)) scale(.8)', opacity: 0 }
      ], { duration: 1300 + Math.random() * 400, easing: 'cubic-bezier(.2,.9,.3,1)' }).onfinish = (function (el) { return function () { el.remove(); }; })(s);
    }
  }
  var toySun = $('#toySun');
  toySun.addEventListener('click', function (e) { burst(e.clientX, e.clientY); if (window.oasisExplode) window.oasisExplode(e.clientX, e.clientY, 9); });
  toySun.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); var r = toySun.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2); }
  });
  // KPI kartındaki erişim sayısı küçük adımlarla artar
  var kpi = $('#kpiNum'), kv = 2.4;
  if (!reduced) setInterval(function () { kv = kv >= 3.9 ? 2.4 : +(kv + 0.1).toFixed(1); kpi.textContent = kv.toFixed(1) + 'M'; }, 1800);

  /* ---------- Başlık etiketleri: göründüklerinde dijital "çözülme" efekti ---------- */
  if (!reduced && 'IntersectionObserver' in window) {
    var GLYPHS = '01<>/#%&*+=?ABCDEFKLMNOPRSTUVYZ';
    var scramble = function (el) {
      var final = el.textContent, t0 = performance.now(), dur = 900;
      (function step(t) {
        var k = Math.min(1, (t - t0) / dur), out = '';
        for (var i = 0; i < final.length; i++) {
          var ch = final[i];
          out += (ch === ' ' || i / final.length < k) ? ch : GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (k < 1) requestAnimationFrame(step); else el.textContent = final;
      })(t0);
    };
    var sio = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { sio.unobserve(e.target); scramble(e.target); } }); }, { threshold: 1 });
    $$('.eyebrow').forEach(function (el) { sio.observe(el); });
  }

  /* ---------- Kategori şeridi: kesintisiz döngü için içeriği çoğalt ---------- */
  var ticker = $('#ticker');
  ticker.innerHTML += ticker.innerHTML;
  $$('span', ticker).slice(ticker.children.length / 2).forEach(function (s) { s.setAttribute('aria-hidden', 'true'); });

  /* ---------- Sayaçlar ---------- */
  function countUp(el) {
    var to = +el.dataset.count, suf = el.dataset.suffix || '', t0 = null, dur = 1400;
    (function step(t) { if (!t0) t0 = t; var k = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf; if (k < 1) requestAnimationFrame(step); })(performance.now());
  }
  if (D.clients.length) {
    $('#clientCount').dataset.count = D.clients.length;
    $('#clientCount').textContent = D.clients.length + '+';
    $('#clientCount2').textContent = D.clients.length;
  }
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); io.unobserve(e.target); } }); }, { threshold: .6 });
    $$('[data-count]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Hizmetler ---------- */
  var ICONS = {
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
    plan: '<path d="M3 3v18h18"/><path d="m7 15 4-5 3 3 5-7"/><circle cx="19" cy="6" r="1.6" fill="currentColor"/>',
    network: '<circle cx="12" cy="5" r="2.4"/><circle cx="5" cy="18" r="2.4"/><circle cx="19" cy="18" r="2.4"/><circle cx="12" cy="13" r="2"/><path d="M12 7.4V11M10.4 14.2 6.8 16.6M13.6 14.2l3.6 2.4"/>',
    devices: '<rect x="2" y="4" width="14" height="10" rx="2"/><path d="M6 18h6M9 14v4"/><rect x="17" y="8" width="5" height="12" rx="1.4"/>',
    megaphone: '<path d="M3 10v4a1 1 0 0 0 1 1h3l6 4V5L7 9H4a1 1 0 0 0-1 1z"/><path d="M17 8a5 5 0 0 1 0 8M19.5 5.5a8.5 8.5 0 0 1 0 13"/>',
    code: '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>'
  };
  var SERVICES = [
    { name: 'Hedeflemeler ve Raporlama', icon: 'target', tagline: 'Oasis Media ile her veri, bir fırsata dönüşür.',
      text: 'Oasis Media olarak, işletmenizin büyüme stratejilerine yön veren hizmetimizle, doğru kitleye doğru mesajı ulaştırmanıza destek oluyoruz. Bu hizmetle, kullanıcı davranışlarını detaylı bir şekilde analiz ederek, stratejik hedeflerinize uygun sonuçlar elde etmenizi sağlarız. Masaüstü platformlarında da uygulanabilen interaktif çözümlerimiz, kullanıcıların aktif katılımını teşvik ederek etkileşim oranlarını artırır. Detaylı raporlama ve analizlerle süreçlerinizin verimliliğini artırmanıza yardımcı oluyoruz.' },
    { name: 'Medya ve Reklam Planlama', icon: 'plan', tagline: 'Oasis Media ile fark edilmek artık daha kolay!',
      text: 'Hedeflerinize ulaşmanın yolu, doğru bir planlamadan geçer. Oasis Media, işletmenizin ihtiyaçlarına özel çözümlerle stratejik bir yol haritası çizer. Kullanıcı davranışlarını ve platform dinamiklerini analiz ederek, benzersiz kanallar üzerinden hedef kitlenize erişim sağlıyoruz. Anlık bildirimlerle tasarlanan bu planlama, kullanıcıların aktif katılım sağlamadığı durumlarda bile etkileşim oluşturacak çözümler üretir.' },
    { name: 'Oasis Network ve Üretim', icon: 'network', tagline: 'Her adımda yanınızdayız; siz sadece büyümeye odaklanın!',
      text: 'Güçlü bağlantılar, büyük başarılar getirir. Oasis Media olarak, 300’ün üzerinde partner platformumuzla sizlere geniş bir erişim ağı ve etkili çözümler sunuyoruz. Oasis Network ve Üretim hizmetimiz, işletmenizin ihtiyaçlarına yönelik özelleştirilmiş içerik ve stratejik iş birlikleriyle, hedeflerinizi en verimli şekilde hayata geçirmenize yardımcı olur.' },
    { name: 'Web ve Mobil Geliştirme', icon: 'devices', tagline: 'Her platformda performans odaklı ve kullanıcı dostu projeler.',
      text: 'Teknolojinin hızla değişen dünyasında, işletmenizin dijital dönüşümünü hızlandırmak için doğru araçlar çok önemlidir. Oasis Media olarak, hem masaüstü hem de mobil platformlarda kullanıcı dostu, güvenli ve ölçeklenebilir çözümler sunuyoruz. İhtiyaçlarınıza özel tasarımlar ve işlevsel uygulamalarla, dijital varlığınızı güçlendirmek ve hedef kitlenize sorunsuz bir deneyim sunmak için yanınızdayız. Her platformda performans odaklı ve kullanıcı dostu projelerle işletmenizi geleceğe taşıyoruz.' },
    { name: 'Pazarlama ve Danışmanlık', icon: 'megaphone', tagline: 'Dijital dünyada başarıyı yakalamak için doğru adımları atmak, bizimle çok daha kolay!',
      text: 'İşletmenizin büyüme yolculuğunda doğru stratejilerle ilerlemek, her adımda başarıya ulaşmanıza yardımcı olur. Oasis Media olarak, markanızı daha geniş kitlelere tanıtmak ve hedeflerinize uygun etkili çözümler geliştirmek için yanınızdayız. Sektörel analizler, hedef kitle odaklı stratejiler ve veriye dayalı raporlamalar ile sizi en iyi şekilde yönlendiriyoruz.' },
    { name: 'Kullanıcı ve Yazılım Geliştirme', icon: 'code', tagline: 'İhtiyaçlarınızı anlamak, doğru çözümü sunmak için yanınızdayız.',
      text: 'İnovasyonun kalbinde yer alan yazılım çözümleri, işletmenizin dijital dönüşümünü hızlandırır ve kullanıcı deneyimini üst seviyeye taşır. Oasis Media olarak, iş süreçlerinizi daha verimli hale getirecek özel yazılımlar geliştiriyoruz. Kullanıcı dostu arayüzler, yüksek performanslı altyapılar ve kişiye özel çözümlerle, her türlü dijital ihtiyacınıza yönelik özgün yazılımlar sunuyoruz. İhtiyaçlarınızı anlamak, doğru çözümü sunmak ve kullanıcı odaklı bir yaklaşım geliştirmek için yanınızdayız.' }
  ];
  var svgIcon = function (k) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[k] + '</svg>'; };
  var tabs = $('#svcTabs'), panel = $('#svcPanel');
  SERVICES.forEach(function (s, i) {
    var li = document.createElement('li');
    li.innerHTML = '<button class="svc-tab" role="tab" id="svc-' + i + '" aria-controls="svcPanel" aria-selected="false" type="button"><span class="n">0' + (i + 1) + '</span><span>' + s.name + '</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button>';
    tabs.appendChild(li);
  });
  function showService(i, focus) {
    var s = SERVICES[i];
    $$('.svc-tab', tabs).forEach(function (t, j) { t.setAttribute('aria-selected', i === j); t.tabIndex = i === j ? 0 : -1; });
    panel.setAttribute('aria-labelledby', 'svc-' + i);
    panel.classList.remove('swap'); void panel.offsetWidth; panel.classList.add('swap');
    panel.innerHTML = '<div class="svc-icon">' + svgIcon(s.icon) + '</div><h3>' + s.name + '</h3><p>' + s.text + '</p><p class="tagline">' + s.tagline + '</p><a class="btn" href="#iletisim">Bu hizmet için teklif alın <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';
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
  var projSec = $('#projeler');
  var PDF_URL = projSec.dataset.pdf;
  var PDFJS = 'vendor/pdfjs/'; // PDF.js 3.11.174 (Apache-2.0), siteyle birlikte barındırılır
  var pdfDocPromise = null;
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise(function (res, rej) {
      var sc = document.createElement('script');
      sc.src = PDFJS + 'pdf.min.js';
      sc.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); };
      sc.onerror = rej;
      document.head.appendChild(sc);
    });
  }
  // PDF önce düz GET ile indirilir: böylece hata nedeni (dosya yok / bilgisayardan açılmış / görüntüleyici yüklenemedi) ayırt edilir
  function getPdf() {
    if (!pdfDocPromise) {
      pdfDocPromise = (location.protocol === 'file:' ? Promise.reject({ kind: 'file' }) : fetch(PDF_URL, { cache: 'no-cache' }))
        .then(function (r) {
          if (!r.ok) throw { kind: 'http', status: r.status };
          return r.arrayBuffer();
        }, function (e) { throw e && e.kind ? e : { kind: 'network' }; })
        .then(function (data) {
          return loadPdfJs().then(function (lib) { return lib.getDocument({ data: data }).promise; }, function () { throw { kind: 'viewer' }; });
        });
      pdfDocPromise.catch(function () { pdfDocPromise = null; }); // bir sonraki tıklamada yeniden dene
    }
    return pdfDocPromise;
  }
  function renderPage(pdf, n, canvas, width) {
    return pdf.getPage(n).then(function (page) {
      var base = page.getViewport({ scale: 1 });
      var scale = (width * Math.min(devicePixelRatio || 1, 2)) / base.width;
      var vp = page.getViewport({ scale: scale });
      canvas.width = vp.width; canvas.height = vp.height;
      return page.render({ canvasContext: canvas.getContext('2d'), viewport: vp }).promise.then(function () { return base; });
    });
  }
  // Kapak: PDF varsa ilk sayfası küçük resim olarak çizilir, sayfa sayısı yazılır
  (function cover() {
    var thumb = $('#pdfThumb');
    var start = function () {
      getPdf().then(function (pdf) {
        $('#pdfMeta').textContent = 'PDF · ' + pdf.numPages + ' sayfa';
        return renderPage(pdf, 1, thumb, 640).then(function () { thumb.hidden = false; $('#pdfPlaceholder').hidden = true; });
      }).catch(function () { /* PDF henüz yok: tasarım kapağı kalır */ });
    };
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { io2.disconnect(); start(); } }, { rootMargin: '300px' });
      io2.observe(projSec);
    } else start();
  })();


  /* ---------- Müşteriler ---------- */
  var NAMES = { a90: 'A90 Pictures', anabank: 'Anadolubank', bparmak: 'Balparmak', btoptan: 'Bizim Toptan', ck: 'Calvin Klein', cocacola: 'Coca-Cola', cs: 'CarrefourSA', ct: 'Cola Turka', gbbva: 'Garanti BBVA', hm: 'H&M', lufi: 'Lufian', ing: 'ING', bmw: 'BMW', bim: 'BİM', jbl: 'JBL', qnb: 'QNB', teb: 'TEB', vw: 'Volkswagen', tt: 'Türk Telekom', 'ford-trucks': 'Ford Trucks', 'm-coco': 'M.Coco' };
  var nameOf = function (k) { var l = k.toLowerCase(); return NAMES[l] || (k.charAt(0).toUpperCase() + k.slice(1)); };
  var chip = function (c) { return '<div class="logo-chip' + (c.dark ? ' dark' : '') + '"><img src="' + c.logo + '" alt="' + nameOf(c.key) + '" loading="lazy" decoding="async"></div>'; };
  var rows = $('#logoRows'), per = Math.ceil(D.clients.length / 3);
  for (var r = 0; r < 3; r++) {
    var list = D.clients.slice(r * per, (r + 1) * per);
    var row = document.createElement('div');
    row.className = 'logo-row' + (r % 2 ? ' rev' : '');
    row.style.setProperty('--dur', (list.length * 2.4) + 's');
    row.innerHTML = list.map(chip).join('') + (reduced ? '' : '<span style="display:contents" aria-hidden="true">' + list.map(chip).join('') + '</span>');
    rows.appendChild(row);
  }
  var allBtn = $('#allClientsBtn'), all = $('#allLogos');
  allBtn.addEventListener('click', function () {
    if (!all.childElementCount) all.innerHTML = D.clients.map(chip).join('');
    all.hidden = !all.hidden;
    allBtn.setAttribute('aria-expanded', !all.hidden);
    allBtn.textContent = all.hidden ? 'Tüm müşterilerimizi listele' : 'Listeyi gizle';
  });

  /* ---------- İş ortakları ---------- */
  $('#partnerWall').innerHTML = D.partners.map(function (p, i) {
    return '<div class="partner" style="animation-delay:' + (i * 0.04) + 's"><img src="' + p.logo + '" alt="Yayıncı partner: ' + p.key.replace(/-\d+$/, '') + '" loading="lazy" decoding="async"></div>';
  }).join('');

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

  /* ---------- İletişim formu ---------- */
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
    status.className = 'form-status';
    status.textContent = 'E-posta uygulamanızda mesajınız hazırlandı. Açılmadıysa sales@oasismedia.com.tr adresine doğrudan yazabilirsiniz.';
  });
})();
