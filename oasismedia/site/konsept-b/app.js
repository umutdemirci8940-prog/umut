/* Oasis Media — Konsept B · Fütüristik ürün lansmanı
   Bağımlılıklar: vendor/three/three.min.js (window.THREE), js/data.js (window.OASIS_DATA).
   file:// ile çift tıklayınca da çalışır: modül yok, yerel dosya fetch'i yok, WebGL'e görsel yok. */
(function () {
  'use strict';
  var D = window.OASIS_DATA || { clients: [], partners: [] };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(pointer: fine)').matches;
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var sstep = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) { /* depolama kapalı */ } }
  };
  var vw = innerWidth, vh = innerHeight;

  /* =========================================================
     GİRİŞ
     ========================================================= */
  function goLive() { root.classList.add('is-live'); }
  if (root.classList.contains('intro-on')) {
    var intro = $('#intro'), ended = false;
    var endIntro = function (fast) {
      if (ended) return; ended = true;
      store.set('oasisB-intro', '1');
      if (fast) intro.classList.add('is-skip');
      goLive();
      setTimeout(function () { root.classList.remove('intro-on'); root.classList.add('no-intro'); intro.remove(); }, fast ? 460 : 700);
    };
    setTimeout(function () { endIntro(false); }, 2450);
    intro.addEventListener('click', function () { endIntro(true); });
    addEventListener('keydown', function k() { endIntro(true); removeEventListener('keydown', k); });
    addEventListener('wheel', function w() { endIntro(true); removeEventListener('wheel', w); }, { passive: true });
  } else {
    requestAnimationFrame(goLive);
  }
  $('#year').textContent = Math.max(2025, new Date().getFullYear());

  /* =========================================================
     MENÜ
     ========================================================= */
  var nav = $('#nav'), burger = $('#burger');
  burger.addEventListener('click', function () {
    var open = nav.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', open); burger.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('#navLinks a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; });
  });

  /* =========================================================
     METİN / VERİ
     ========================================================= */
  var CLIENT_N = D.clients.length || 145;
  $('#clientCount').textContent = CLIENT_N;
  $('#clientCountSr').textContent = CLIENT_N;

  // Hakkımızda: kelimeler kaydırdıkça yanar
  var HOT = ['300’ü', 'aşkın', 'site', 'exclusive', 'KPI’larına', 'hedeflemeler'];
  var p1 = $('#aboutP1');
  p1.innerHTML = p1.textContent.trim().split(/\s+/).map(function (w) {
    return '<span class="w' + (HOT.indexOf(w.replace(/[.,;]/g, '')) > -1 ? ' hot' : '') + '">' + w + '</span>';
  }).join(' ');
  var words = $$('.w', p1);

  // Hizmetler (js/main.js içindeki SERVICES ile birebir)
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
  track.insertAdjacentHTML('beforeend', SERVICES.map(function (s, i) {
    return '<article class="svc-card glass" data-tilt><span class="shine" aria-hidden="true"></span><span class="n">0' + (i + 1) + ' / 06</span><h3>' + s.name + '</h3><p>' + s.text + '</p><p class="tagline">' + s.tagline + '</p></article>';
  }).join(''));
  var svcCards = $$('.svc-card', track);

  // Müşteriler — js/main.js'teki NAMES ve nameOf()
  var NAMES = { a90: 'A90 Pictures', anabank: 'Anadolubank', bparmak: 'Balparmak', btoptan: 'Bizim Toptan', ck: 'Calvin Klein', cocacola: 'Coca-Cola', cs: 'CarrefourSA', ct: 'Cola Turka', gbbva: 'Garanti BBVA', hm: 'H&M', lufi: 'Lufian', ing: 'ING', bmw: 'BMW', bim: 'BİM', jbl: 'JBL', qnb: 'QNB', teb: 'TEB', vw: 'Volkswagen', tt: 'Türk Telekom', 'ford-trucks': 'Ford Trucks', 'm-coco': 'M.Coco' };
  var nameOf = function (k2) { var l = k2.toLowerCase(); return NAMES[l] || (k2.charAt(0).toUpperCase() + k2.slice(1)); };
  var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;'); };
  (function buildMarquee() {
    var ROWS = 5, plane = $('#marqueePlane'), per = Math.ceil(D.clients.length / ROWS), html = '';
    for (var r = 0; r < ROWS; r++) {
      var list = D.clients.slice(r * per, r * per + per);
      if (!list.length) continue;
      var tiles = function (hidden) {
        return list.map(function (c) {
          var nm = esc(nameOf(c.key));
          return '<div class="tile' + (c.dark ? ' dark' : '') + '"' + (hidden ? ' aria-hidden="true"' : '') + '><img src="' + c.logo + '" alt="' + (hidden ? '' : nm) + '" decoding="async" width="160" height="64"><span class="nm">' + nm + '</span></div>';
        }).join('');
      };
      html += '<div class="mrow' + (r % 2 ? ' rev' : '') + '" style="--d:' + (80 + r * 9) + 's">' + tiles(false) + tiles(true) + '</div>';
    }
    plane.innerHTML = html;
  })();

  // İş ortakları — iki halka, 3D carousel
  var ringEl = $('#carouselRing'), cItems = [];
  (function buildCarousel() {
    var P = D.partners, half = Math.ceil(P.length / 2);
    ringEl.innerHTML = P.map(function (p, i) {
      var row = i < half ? 0 : 1, idx = row ? i - half : i, cnt = row ? P.length - half : half;
      return '<div class="c-item" data-row="' + row + '" data-a="' + (idx * 360 / cnt + row * (180 / cnt)) + '"><img src="' + p.logo + '" alt="Yayıncı partner: ' + esc(p.key.replace(/-\d+$/, '')) + '" decoding="async"></div>';
    }).join('');
    cItems = $$('.c-item', ringEl).map(function (el) { return { el: el, row: +el.dataset.row, a: +el.dataset.a }; });
  })();

  /* =========================================================
     PARÇACIK SAHNESİ (three.js)
     ========================================================= */
  var GL = null;
  var canvas = $('#gl'), glow = $('#stageGlow');
  var mobile = vw < 760;
  var N = mobile ? 6500 : 15000;
  var DUST = Math.round(N * 0.12);
  var FOV = 35, CAMZ = 10;
  var visH, visW;
  var shapes = [];       // {pos, c, spin, tilt, op, gy, gs, size, glow}
  var S_COUNT = 9;       // 0 güneş, 1-4 rakamlar, 5 galaksi, 6 dalga, 7 yıldızlar, 8 ufuk
  var NUM_TEXT = ['300+', '2K+', '10', String(CLIENT_N)];
  var dust = new Float32Array(DUST * 3);

  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }
  function dims() { visH = 2 * CAMZ * Math.tan(FOV / 2 * Math.PI / 180); visW = visH * (vw / vh); }

  function makeDust() {
    for (var i = 0; i < DUST; i++) {
      dust[i * 3] = (Math.random() - .5) * visW * 1.5;
      dust[i * 3 + 1] = (Math.random() - .5) * visH * 1.5;
      dust[i * 3 + 2] = -5 + Math.random() * 6.5;
    }
  }
  function withDust(arr, c) { // son DUST parçacık sahnede serbest toz; yerel koordinata çevrilir
    for (var i = 0; i < DUST; i++) {
      var j = (N - DUST + i) * 3;
      arr[j] = dust[i * 3] - c[0]; arr[j + 1] = dust[i * 3 + 1] - c[1]; arr[j + 2] = dust[i * 3 + 2] - c[2];
    }
    return arr;
  }
  function inGap() { return false; } // logodaki şeritler shader'da ekran uzayında kesilir (perspektifte net kalır)
  function sunShape(R, ring, rs) {
    rs = rs || 1;
    var a = new Float32Array(N * 3), M = N - DUST;
    for (var i = 0; i < M; i++) {
      var r = Math.random(), x, y, z, k = i * 3;
      if (r < 0.64 || (!ring && r > 0.86)) {
        do { y = Math.random() * 2 - 1; } while (inGap(y));
        var th = Math.random() * Math.PI * 2, s = Math.sqrt(1 - y * y);
        x = s * Math.cos(th) * R; z = s * Math.sin(th) * R; y *= R;
      } else if (r < 0.72) {
        var rr, yy;
        do { rr = Math.cbrt(Math.random()) * 0.97; yy = Math.random() * 2 - 1; } while (inGap(yy * rr));
        var t2 = Math.random() * Math.PI * 2, s2 = Math.sqrt(1 - yy * yy) * rr;
        x = s2 * Math.cos(t2) * R; z = s2 * Math.sin(t2) * R; y = yy * rr * R;
      } else if (r < 0.86) {
        var cr, u, t3 = Math.random() * Math.PI * 2, s3;
        do { cr = R * (1.03 + Math.pow(Math.random(), 2.6) * 0.75); u = Math.random() * 2 - 1; } while (inGap(u * cr / R));
        s3 = Math.sqrt(1 - u * u);
        x = s3 * Math.cos(t3) * cr; y = u * cr; z = s3 * Math.sin(t3) * cr;
      } else {
        var t4 = Math.random() * Math.PI * 2, rr4 = R * rs * (1.5 + Math.random() * 0.06 + gauss() * 0.03);
        if (Math.random() < 0.3) rr4 = R * rs * (1.75 + Math.random() * 0.02);
        x = Math.cos(t4) * rr4; z = Math.sin(t4) * rr4; y = gauss() * 0.015 * R;
      }
      a[k] = x; a[k + 1] = y; a[k + 2] = z;
    }
    return a;
  }
  var sampler = document.createElement('canvas');
  function textShape(txt, targetH, maxW) {
    var fs = 260, ctx = sampler.getContext('2d', { willReadFrequently: true });
    var font = '800 ' + fs + 'px Unbounded, "Inter Tight", Arial, sans-serif';
    ctx.font = font;
    var w = Math.ceil(ctx.measureText(txt).width) + 40, h = Math.ceil(fs * 1.4);
    sampler.width = w; sampler.height = h;
    ctx.font = font; ctx.fillStyle = '#fff'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(txt, w / 2, h / 2);
    var data = ctx.getImageData(0, 0, w, h).data, pts = [], step = 2;
    var minX = 1e9, maxX = -1e9, minY = 1e9, maxY = -1e9;
    for (var y = 0; y < h; y += step) for (var x = 0; x < w; x += step) {
      if (data[(y * w + x) * 4 + 3] > 140) {
        pts.push(x, y);
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    var a = new Float32Array(N * 3), M = N - DUST, P = pts.length / 2;
    if (!P) return sunShape(1, true);
    var k = Math.min(targetH / (maxY - minY), maxW / (maxX - minX));
    var cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    for (var i = 0; i < M; i++) {
      var j = (Math.random() * P | 0) * 2, o = i * 3;
      if (i < M * 0.94) {
        a[o] = (pts[j] - cx + (Math.random() - .5) * step) * k;
        a[o + 1] = -(pts[j + 1] - cy + (Math.random() - .5) * step) * k;
        a[o + 2] = gauss() * 0.12;
      } else { // halo
        a[o] = (pts[j] - cx) * k + gauss() * 0.35;
        a[o + 1] = -(pts[j + 1] - cy) * k + gauss() * 0.35;
        a[o + 2] = gauss() * 0.6;
      }
    }
    return a;
  }
  function galaxyShape(Rg) {
    var a = new Float32Array(N * 3), M = N - DUST;
    for (var i = 0; i < M; i++) {
      var o = i * 3, x, y, z;
      if (i < M * 0.16) { // çekirdek
        var r0 = Math.pow(Math.random(), 1.8) * Rg * 0.16, u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u);
        x = s * Math.cos(t) * r0; y = u * r0 * 0.6; z = s * Math.sin(t) * r0;
      } else {
        var arm = i % 3, f = Math.pow(Math.random(), 0.75), rr = 0.12 * Rg + f * Rg;
        var ang = arm * Math.PI * 2 / 3 + f * 5.2 + gauss() * 0.32 * (1 - f * 0.4);
        x = Math.cos(ang) * rr; z = Math.sin(ang) * rr; y = gauss() * 0.06 * Rg * (1 - f);
      }
      a[o] = x; a[o + 1] = y; a[o + 2] = z;
    }
    return a;
  }
  function waveShape(W, Dp) {
    var a = new Float32Array(N * 3), M = N - DUST, cols = Math.round(Math.sqrt(M * (W / Dp))), rows = Math.ceil(M / cols);
    for (var i = 0; i < M; i++) {
      var cx = i % cols, cz = (i / cols) | 0, o = i * 3;
      a[o] = (cx / (cols - 1) - .5) * W; a[o + 1] = 0; a[o + 2] = (cz / (rows - 1) - .5) * Dp;
    }
    return a;
  }
  function starShape(Rs) {
    var a = new Float32Array(N * 3), M = N - DUST;
    for (var i = 0; i < M; i++) {
      var r = Rs * Math.cbrt(Math.random()), u = Math.random() * 2 - 1, t = Math.random() * Math.PI * 2, s = Math.sqrt(1 - u * u), o = i * 3;
      a[o] = s * Math.cos(t) * r * 1.4; a[o + 1] = u * r * 0.8; a[o + 2] = s * Math.sin(t) * r;
    }
    return a;
  }

  function buildShapes() {
    dims(); makeDust();
    var port = vw / vh < 1;
    var R = port ? visW * 0.3 : Math.min(visH * 0.31, visW * 0.2);
    var sunC = port ? [0, visH * 0.245, 0] : [visW * 0.23, 0.05, 0];
    var tH = port ? Math.min(visH * 0.19, visW * 0.36) : visH * 0.34, tW = visW * (port ? 0.86 : 0.78), tC = port ? [0, visH * 0.08, 0] : [0, 0.28, 0];
    var Rg = Math.max(visW, visH) * (port ? 0.42 : 0.5);
    var Rh = port ? visW * 0.62 : visW * 0.3;
    shapes = [];
    shapes[0] = { pos: withDust(sunShape(R, true, port ? 0.86 : 1), sunC), c: sunC, sun: R, spin: 0.12, tilt: 0.1, op: 1, gy: [sunC[1], R], size: 1, glow: [sunC, R * 3.2, 1] };
    for (var n = 0; n < 4; n++) shapes[1 + n] = { pos: withDust(textShape(NUM_TEXT[n], tH, tW), tC), c: tC, spin: 0, tilt: 0, op: 0.9, gy: [tC[1], tH * 0.6], size: 0.95, glow: [tC, tH * 3, 0.75] };
    var gC = [0, port ? 0 : -0.3, -1.5];
    shapes[5] = { pos: withDust(galaxyShape(Rg), gC), c: gC, spin: 0.05, tilt: 1.12, op: 0.85, gy: [gC[1], Rg * 0.25], size: 1, glow: [gC, Rg * 1.1, 0.55] };
    var wC = [0, -visH * 0.32, -1.5];
    shapes[6] = { pos: withDust(waveShape(visW * 1.4, 6), wC), c: wC, spin: 0, tilt: 0.12, op: 0.85, gy: [wC[1], 0.45], size: 0.85, glow: [[0, -visH * 0.42, 0], visW * 0.9, 0.35] };
    var sC = [0, 0, -3];
    shapes[7] = { pos: withDust(starShape(7), sC), c: sC, spin: 0.025, tilt: 0.2, op: 0.55, gy: [0, 4], size: 0.9, glow: [[0, 0, 0], visW * 0.5, 0.12] };
    var hC = [port ? 0 : visW * 0.18, -visH * 0.5 - Rh * 0.38, -0.5];
    shapes[8] = { pos: withDust(sunShape(Rh, false), hC), c: hC, sun: Rh, spin: 0.04, tilt: 0.05, op: 0.75, gy: [hC[1], Rh], size: 1.1, glow: [hC, Rh * 2.6, 0.8] };
  }

  var VERT = [
    'attribute vec3 aFrom; attribute vec3 aTo; attribute vec4 aRand;',
    'uniform float uT, uTime, uSize, uScale, uExplode, uFromSpin, uToSpin, uFromTilt, uToTilt, uWaveW, uOp, uFromWave, uToWave;',
    'uniform vec3 uFromC, uToC; uniform vec2 uGrad; uniform vec3 uMouse; uniform vec4 uSunF, uSunT;',
    'float band(float y, float c, float h){ return 1. - smoothstep(h * .55, h, abs(y - c)); }',
    'float stripes(vec4 S, vec3 p){',
    '  if (S.w <= 0. || abs(p.x - S.x) > S.w * 1.9) return 0.;',
    '  mat4 M = projectionMatrix * modelViewMatrix;',
    '  vec4 c = M * vec4(S.xyz, 1.), r = M * vec4(S.xyz + vec3(0., S.w, 0.), 1.), q = M * vec4(p, 1.);',
    '  float yn = (q.y / q.w - c.y / c.w) / (r.y / r.w - c.y / c.w);',
    '  return clamp(band(yn, -.34, .07) + band(yn, -.56, .062) + band(yn, -.76, .055), 0., 1.);',
    '}',
    'varying vec3 vCol; varying float vA;',
    'vec3 rotY(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(c*p.x+s*p.z, p.y, -s*p.x+c*p.z); }',
    'vec3 rotX(vec3 p, float a){ float c=cos(a), s=sin(a); return vec3(p.x, c*p.y-s*p.z, s*p.y+c*p.z); }',
    'vec3 wave(vec3 p, float w){ return p + vec3(0., w*(sin(p.x*.9+uTime*1.1)*.28 + cos(p.z*1.2-uTime*.8)*.2 + sin((p.x+p.z)*.5+uTime*.6)*.15), 0.); }',
    'void main(){',
    '  float d = aRand.x * .35;',
    '  float t = clamp((uT - d) / .65, 0., 1.); t = t*t*(3.-2.*t);',
    '  vec3 a = rotX(rotY(aFrom, uFromSpin), uFromTilt); a = wave(a, uFromWave) + uFromC;',
    '  vec3 b = rotX(rotY(aTo, uToSpin), uToTilt); b = wave(b, uToWave) + uToC;',
    '  vec3 dir = normalize(aRand.yzw - .5 + 1e-4);',
    '  float burst = sin(t * 3.14159);',
    '  vec3 p = mix(a, b, t) + dir * burst * uExplode * (.4 + aRand.x * 1.4);',
    '  p += .035 * vec3(sin(uTime*.7 + aRand.y*40.), cos(uTime*.6 + aRand.z*40.), sin(uTime*.5 + aRand.w*40.));',
    '  vec2 md = p.xy - uMouse.xy; float mf = exp(-dot(md, md) * 2.2) * uMouse.z;',
    '  p.xy += normalize(md + 1e-4) * mf * .55; p.z += mf * .6;',
    '  vec4 mv = modelViewMatrix * vec4(p, 1.);',
    '  gl_Position = projectionMatrix * mv;',
    '  float tw = .75 + .25 * sin(uTime * 2.4 + aRand.w * 60.);',
    '  gl_PointSize = uSize * uScale * (.55 + aRand.y * .9) * tw * (1. + burst * .8 + mf * 1.5) / -mv.z;',
    '  float g = clamp((p.y - uGrad.x) / (uGrad.y * 2.) + .5, 0., 1.);',
    '  vec3 ember = vec3(.84,.24,.0), orange = vec3(1.,.53,.2), gold = vec3(1.,.8,.35);',
    '  vec3 col = g < .5 ? mix(ember, orange, g * 2.) : mix(orange, gold, (g - .5) * 2.);',
    '  if (aRand.w > .93) col = mix(col, vec3(.92,.95,1.), .8);',
    '  vCol = col * (1. + burst * .6 + mf);',
    '  vA = uOp * (.45 + .55 * aRand.z) * (1. - stripes(uSunF, p) * (1. - t) - stripes(uSunT, p) * t);',
    '}'
  ].join('\n');
  var FRAG = [
    'precision mediump float;',
    'varying vec3 vCol; varying float vA;',
    'void main(){',
    '  vec2 q = gl_PointCoord - .5; float d2 = dot(q, q);',
    '  if (d2 > .25) discard;',
    '  float a = exp(-d2 * 30.) + exp(-d2 * 7.) * .25;',
    '  gl_FragColor = vec4(vCol, a * vA);',
    '}'
  ].join('\n');

  function initGL() {
    if (!window.THREE) return null;
    var T = window.THREE, renderer;
    try {
      renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false, powerPreference: 'high-performance' });
    } catch (e) { return null; }
    renderer.setClearColor(0x000000, 0);
    var scene = new T.Scene();
    var camera = new T.PerspectiveCamera(FOV, vw / vh, 0.1, 100);
    camera.position.z = CAMZ;
    buildShapes();
    var geo = new T.BufferGeometry();
    var fromA = new Float32Array(shapes[0].pos), toA = new Float32Array(shapes[1].pos), rnd = new Float32Array(N * 4);
    for (var i = 0; i < N * 4; i++) rnd[i] = Math.random();
    geo.setAttribute('position', new T.BufferAttribute(new Float32Array(N * 3), 3));
    var aFrom = new T.BufferAttribute(fromA, 3), aTo = new T.BufferAttribute(toA, 3);
    aFrom.setUsage(T.DynamicDrawUsage); aTo.setUsage(T.DynamicDrawUsage);
    geo.setAttribute('aFrom', aFrom); geo.setAttribute('aTo', aTo);
    geo.setAttribute('aRand', new T.BufferAttribute(rnd, 4));
    geo.boundingSphere = new T.Sphere(new T.Vector3(), 1e4);
    var U = {
      uT: { value: 0 }, uTime: { value: 0 }, uSize: { value: mobile ? 0.052 : 0.05 }, uScale: { value: 1 }, uExplode: { value: reduced ? 0 : 1.6 },
      uFromSpin: { value: 0 }, uToSpin: { value: 0 }, uFromTilt: { value: 0 }, uToTilt: { value: 0 }, uWaveW: { value: 0 },
      uFromWave: { value: 0 }, uToWave: { value: 0 }, uOp: { value: 1 },
      uFromC: { value: new T.Vector3() }, uToC: { value: new T.Vector3() }, uGrad: { value: new T.Vector2(0, 1) }, uMouse: { value: new T.Vector3(0, 0, 0) }, uSunF: { value: new T.Vector4() }, uSunT: { value: new T.Vector4() }
    };
    var mat = new T.ShaderMaterial({ uniforms: U, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, depthTest: false, blending: T.AdditiveBlending });
    var pts = new T.Points(geo, mat);
    scene.add(pts);
    var g = { T: T, renderer: renderer, scene: scene, camera: camera, U: U, pts: pts, aFrom: aFrom, aTo: aTo, cur: [0, 1] };
    sizeGL(g);
    return g;
  }
  function sizeGL(g) {
    var pr = Math.min(devicePixelRatio || 1, mobile ? 1.75 : 2);
    g.renderer.setPixelRatio(pr);
    g.renderer.setSize(vw, vh, false);
    g.camera.aspect = vw / vh; g.camera.updateProjectionMatrix();
    g.U.uScale.value = vh * pr / (2 * Math.tan(FOV / 2 * Math.PI / 180));
  }
  function setPair(g, i, force) {
    var j = Math.min(i + 1, S_COUNT - 1);
    if (!force && g.cur[0] === i && g.cur[1] === j) return;
    g.aFrom.array.set(shapes[i].pos); g.aFrom.needsUpdate = true;
    g.aTo.array.set(shapes[j].pos); g.aTo.needsUpdate = true;
    g.cur = [i, j];
  }

  try { GL = initGL(); } catch (e) { GL = null; }
  if (!GL) root.classList.add('no-gl');

  // yazı tipi yüklenince rakamları gerçek fontla yeniden örnekle
  if (GL && document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('800 200px Unbounded'), document.fonts.ready]).then(function () {
      buildShapes(); setPair(GL, GL.cur[0], true);
    }).catch(function () {});
  }

  /* =========================================================
     KAYDIRMA → SAHNE
     ========================================================= */
  var secs = {
    num: $('#rakamlar'), zoom: $('#zoom'), about: $('#hakkimizda'), svc: $('#hizmetler'), proj: $('#projeler'),
    cli: $('#musteriler'), par: $('#is-ortaklari'), con: $('#iletisim')
  };
  var top = function (el) { return el.getBoundingClientRect().top + scrollY; };
  var stops = [];
  function computeStops() {
    var nT = top(secs.num), nH = secs.num.offsetHeight, nEnd = nT + nH - vh;
    var aT = top(secs.about), sT = top(secs.svc), sEnd = sT + secs.svc.offsetHeight - vh, pT = top(secs.proj), cT = top(secs.con);
    stops = [
      [0, 0], [Math.max(1, nT - vh * 0.75), 0.15], [nT, 0.85], [nEnd, 4.15], [aT, 4.8], [aT + vh * 0.6, 5.0],
      [sT - vh * 0.7, 5.15], [sT, 5.85], [sEnd, 6.15], [pT + vh * 0.4, 6.85], [cT - vh * 0.9, 7.15], [cT - vh * 0.1, 7.9], [1e7, 8]
    ];
    for (var i = 1; i < stops.length; i++) if (stops[i][0] <= stops[i - 1][0]) stops[i][0] = stops[i - 1][0] + 1;
    if (innerWidth > 760) {
      secs.svc.style.height = (track.scrollWidth - vw + vh * 1.15) + 'px';
    } else secs.svc.style.height = '';
  }
  function sAt(y) {
    for (var i = 1; i < stops.length; i++) {
      if (y < stops[i][0]) { var a = stops[i - 1], b = stops[i]; return lerp(a[1], b[1], (y - a[0]) / (b[0] - a[0])); }
    }
    return 8;
  }
  var plateau = function (f) { return sstep(0.2, 0.8, f); };

  var sCur = 0, sTarget = 0, mouse = { x: 0, y: 0, tx: 0, ty: 0, on: 0, ton: 0 }, clock = 0, last = performance.now(), running = true, rafId = 0;
  var numItems = $$('#numList li'), numIdx = $('#numIdx'), numRail = $('#numRail'), lastNum = -1;
  var zoomTitle = $('#zoomTitle'), zoomPin = $('.zoom-pin');
  var progress = $('#progress'), svcBar = $('#servicesBar'), marqueePlane = $('#marqueePlane');
  var navAs = $$('#navLinks a'), navSecs = navAs.map(function (a) { return $(a.getAttribute('href')); });
  var carRot = 0, carVel = 0, carVisible = false;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!reduced) clock += dt;
    var y = scrollY;

    /* ---- sahne ---- */
    sTarget = sAt(y);
    sCur = reduced ? sTarget : sCur + (sTarget - sCur) * Math.min(1, dt * 5.5);
    if (Math.abs(sTarget - sCur) < 1e-4) sCur = sTarget;
    var i = Math.min(Math.floor(sCur), S_COUNT - 2), f = sCur - i;
    if (sCur >= S_COUNT - 1) { i = S_COUNT - 2; f = 1; }
    var t = plateau(f);
    var A = shapes[i], B = shapes[i + 1];
    if (GL) {
      setPair(GL, i);
      var U = GL.U;
      U.uT.value = t; U.uTime.value = clock;
      U.uFromSpin.value = clock * A.spin; U.uToSpin.value = clock * B.spin;
      U.uFromTilt.value = A.tilt; U.uToTilt.value = B.tilt;
      U.uFromWave.value = i === 6 ? 1 : 0; U.uToWave.value = i + 1 === 6 ? 1 : 0;
      U.uFromC.value.set(A.c[0], A.c[1], A.c[2]); U.uToC.value.set(B.c[0], B.c[1], B.c[2]);
      U.uSunF.value.set(A.c[0], A.c[1], A.c[2], A.sun || 0); U.uSunT.value.set(B.c[0], B.c[1], B.c[2], B.sun || 0);
      U.uGrad.value.set(lerp(A.gy[0], B.gy[0], t), lerp(A.gy[1], B.gy[1], t));
      U.uOp.value = lerp(A.op, B.op, t);
      mouse.x += (mouse.tx - mouse.x) * 0.08; mouse.y += (mouse.ty - mouse.y) * 0.08; mouse.on += (mouse.ton - mouse.on) * 0.06;
      U.uMouse.value.set(mouse.x * visW / 2, mouse.y * visH / 2, mouse.on * (sCur < 4.5 ? 1 : 0.3));
      GL.pts.rotation.y = mouse.x * 0.12; GL.pts.rotation.x = -mouse.y * 0.08;
      GL.renderer.render(GL.scene, GL.camera);
      // ucuz bloom: sahnenin arkasında yumuşak ışık
      var gc = [lerp(A.glow[0][0], B.glow[0][0], t), lerp(A.glow[0][1], B.glow[0][1], t)];
      glow.style.setProperty('--gx', (50 + gc[0] / visW * 100).toFixed(2) + '%');
      glow.style.setProperty('--gy', (50 - gc[1] / visH * 100).toFixed(2) + '%');
      glow.style.setProperty('--gs', (lerp(A.glow[1], B.glow[1], t) / visH * vh).toFixed(0) + 'px');
      glow.style.setProperty('--go', (lerp(A.glow[2], B.glow[2], t) * (1 - Math.sin(t * Math.PI) * 0.35)).toFixed(3));
    }

    /* ---- rakamlar ---- */
    var nr = secs.num.getBoundingClientRect(), np = clamp(-nr.top / (nr.height - vh), 0, 1);
    var ni = sCur < 0.5 ? -1 : sCur > 4.6 ? -1 : clamp(Math.round(sCur) - 1, 0, 3);
    if (ni === -1 && nr.top <= 0 && nr.bottom > vh * 0.5) ni = sCur < 1 ? 0 : 3;
    if (ni !== lastNum) {
      numItems.forEach(function (li, k) { li.classList.toggle('is-on', k === ni); });
      if (ni >= 0) numIdx.textContent = '0' + (ni + 1);
      lastNum = ni;
    }
    numRail.style.transform = 'scaleX(' + np.toFixed(4) + ')';

    /* ---- büyük yazı zoom ---- */
    var zr = secs.zoom.getBoundingClientRect(), zp = clamp(-zr.top / (zr.height - vh), 0, 1);
    var zs, zo, zb;
    if (zp < 0.3) { var q = sstep(0, 0.3, zp); zs = lerp(0.62, 1, q); zo = q; zb = (1 - q) * 14; }
    else if (zp < 0.55) { zs = lerp(1, 1.08, (zp - 0.3) / 0.25); zo = 1; zb = 0; }
    else { var q2 = (zp - 0.55) / 0.45; zs = 1.08 * Math.pow(9, q2 * q2); zo = 1 - sstep(0.45, 0.9, q2); zb = q2 * 3; }
    if (reduced) { zs = 1; zo = 1; zb = 0; }
    zoomTitle.style.setProperty('--zs', zs.toFixed(4)); zoomTitle.style.setProperty('--zo', zo.toFixed(3)); zoomTitle.style.setProperty('--zb', zb.toFixed(2) + 'px');
    zoomPin.style.setProperty('--ko', (1 - sstep(0.5, 0.7, zp)).toFixed(3));

    /* ---- kelimeler ---- */
    var pr = p1.getBoundingClientRect(), wp = clamp((vh * 0.82 - pr.top) / (pr.height + vh * 0.25), 0, 1);
    var lit = Math.round(wp * 1.1 * words.length);
    if (lit !== frame.lit) { words.forEach(function (w, k) { w.classList.toggle('on', k < lit); }); frame.lit = lit; }

    /* ---- hizmetler: yatay ---- */
    if (vw > 760) {
      var sr = secs.svc.getBoundingClientRect(), sp = clamp(-sr.top / (sr.height - vh), 0, 1);
      if (sr.top < vh && sr.bottom > 0) {
        var max = Math.max(0, track.scrollWidth - vw);
        track.style.transform = 'translate3d(' + (-sp * max).toFixed(1) + 'px,0,0)';
        svcBar.style.transform = 'scaleX(' + sp.toFixed(4) + ')';
        svcCards.forEach(function (c) {
          var r = c.getBoundingClientRect(), cx = (r.left + r.width / 2) / vw - 0.5;
          c.style.setProperty('--cy', (clamp(cx, -0.8, 0.8) * -16).toFixed(2) + 'deg');
          c.style.setProperty('--sp', (100 - (cx + 0.5) * 100).toFixed(1) + '%');
        });
      }
    }

    /* ---- müşteriler düzlem eğimi ---- */
    var cr = secs.cli.getBoundingClientRect();
    if (cr.top < vh && cr.bottom > 0) {
      var cp = clamp((vh - cr.top) / (cr.height + vh), 0, 1);
      marqueePlane.style.setProperty('--plx', lerp(44, 16, cp).toFixed(2) + 'deg');
    }

    /* ---- iş ortakları carousel ---- */
    if (carVisible) {
      if (!dragging) { carVel += ((reduced ? 0 : 9) - carVel) * 0.03; }
      carRot += carVel * dt;
      var rad = ringR();
      cItems.forEach(function (it) {
        var dir = it.row ? -1 : 1, ang = it.a + carRot * dir, rr = ang * Math.PI / 180, z = Math.cos(rr);
        it.el.style.transform = 'rotateY(' + ang.toFixed(2) + 'deg) translateZ(' + rad + 'px) translateY(' + (it.row ? 0.62 : -0.62) * ringS() + 'px)';
        var zz = z * 0.5 + 0.5; it.el.style.opacity = (0.06 + 0.94 * zz * zz).toFixed(3);
        it.el.style.zIndex = Math.round(z * 100) + 100;
      });
    }

    /* ---- genel ---- */
    var h = root.scrollHeight - vh;
    progress.style.transform = 'scaleX(' + (h > 0 ? y / h : 0).toFixed(4) + ')';
    nav.classList.toggle('is-solid', y > 40);
    var act = -1;
    navSecs.forEach(function (s, k) { if (s && s.getBoundingClientRect().top < vh * 0.45) act = k; });
    if (act !== frame.act) { navAs.forEach(function (a, k) { a.classList.toggle('is-active', k === act); }); frame.act = act; }
  }
  function ringS() { return vw < 760 ? 76 : 112; }
  function ringR() { var s = ringS(); return Math.round(Math.min((s + 22) * 12 / (2 * Math.PI) * 1.05, (Math.min(vw, 680) - s) / 2)); }
  $('#carousel').style.setProperty('--s', ringS() + 'px');

  // carousel sürükleme
  var dragging = false, dragX = 0, carEl = $('#carousel');
  carEl.addEventListener('pointerdown', function (e) { dragging = true; dragX = e.clientX; carVel = 0; });
  addEventListener('pointermove', function (e) {
    if (dragging) { var dx = e.clientX - dragX; dragX = e.clientX; carRot += dx * 0.25; carVel = dx * 12; }
  }, { passive: true });
  addEventListener('pointerup', function () { dragging = false; });
  addEventListener('pointercancel', function () { dragging = false; });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { carVisible = en[0].isIntersecting; }, { rootMargin: '100px' }).observe(carEl);
  } else carVisible = true;

  // fare
  addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    mouse.tx = e.clientX / vw * 2 - 1; mouse.ty = -(e.clientY / vh * 2 - 1); mouse.ton = 1;
    if (fine) { root.style.setProperty('--mx', e.clientX + 'px'); root.style.setProperty('--my', e.clientY + 'px'); }
  }, { passive: true });
  document.addEventListener('pointerleave', function () { mouse.ton = 0; });
  if (fine && !reduced) {
    root.classList.add('has-spot');
    var spot = $('#spot');
    addEventListener('pointermove', function (e) { spot.style.setProperty('--mx', e.clientX + 'px'); spot.style.setProperty('--my', e.clientY + 'px'); }, { passive: true });
  }

  // görünürlük: sekme gizliyse dur
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { running = false; cancelAnimationFrame(rafId); }
    else if (!running) { running = true; last = performance.now(); rafId = requestAnimationFrame(frame); }
  });

  // boyut
  var rT = 0, lastW = vw, lastH = vh;
  addEventListener('resize', function () {
    clearTimeout(rT);
    rT = setTimeout(function () {
      var big = innerWidth !== lastW || Math.abs(innerHeight - lastH) > 120;
      vw = innerWidth; vh = innerHeight;
      if (GL) { sizeGL(GL); if (big) { lastW = vw; lastH = vh; buildShapes(); setPair(GL, GL.cur[0], true); } }
      $('#carousel').style.setProperty('--s', ringS() + 'px');
      computeStops();
    }, 160);
  });
  computeStops();
  addEventListener('load', computeStops);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(computeStops);
  rafId = requestAnimationFrame(frame);

  /* =========================================================
     CAM KARTLAR: fareyi izleyen yansıma + eğim, mıknatıs butonlar
     ========================================================= */
  if (fine && !reduced) {
    $$('.glass').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y2 = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); el.style.setProperty('--my', (y2 * 100).toFixed(1) + '%');
        if (el.hasAttribute('data-tilt')) { el.style.setProperty('--rx', ((0.5 - y2) * 7).toFixed(2) + 'deg'); el.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg'); }
      });
      el.addEventListener('pointerleave', function () { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
    });
    $$('[data-magnet]').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.25).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.3).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
    // vitrin: cihaz fareyle döner
    var show = $('#showcase'), dev = $('#device');
    show.addEventListener('pointermove', function (e) {
      var r = show.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y2 = (e.clientY - r.top) / r.height - 0.5;
      dev.style.setProperty('--dry', (-14 + x * 26).toFixed(2) + 'deg'); dev.style.setProperty('--drx', (6 - y2 * 14).toFixed(2) + 'deg');
    });
    show.addEventListener('pointerleave', function () { dev.style.removeProperty('--dry'); dev.style.removeProperty('--drx'); });
  }

  // görünce yüksel
  var io = 'IntersectionObserver' in window && !reduced ? new IntersectionObserver(function (en) {
    en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
  }, { threshold: 0.15 }) : null;
  $$('.rise').forEach(function (el) { if (io) io.observe(el); else el.classList.add('is-in'); });

  /* =========================================================
     PROJELER: PDF kapağı (yalnızca sunucuda; file:// iken tasarım kapağı)
     ========================================================= */
  var projSec = $('#projeler'), PDF_URL = projSec.dataset.pdf, PDFJS = 'vendor/pdfjs/';
  function loadPdfJs() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    return new Promise(function (res, rej) {
      var sc = document.createElement('script'); sc.src = PDFJS + 'pdf.min.js';
      sc.onload = function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS + 'pdf.worker.min.js'; res(window.pdfjsLib); };
      sc.onerror = rej; document.head.appendChild(sc);
    });
  }
  function cover() {
    if (location.protocol === 'file:' || !window.fetch) return;
    fetch(PDF_URL).then(function (r) { if (!r.ok) throw r.status; return r.arrayBuffer(); })
      .then(function (data) { return loadPdfJs().then(function (lib) { return lib.getDocument({ data: data }).promise; }); })
      .then(function (pdf) {
        $('#pdfMeta').textContent = 'PDF · ' + pdf.numPages + ' sayfa';
        return pdf.getPage(1).then(function (page) {
          var c = $('#pdfThumb'), base = page.getViewport({ scale: 1 }), vp = page.getViewport({ scale: 900 / base.width });
          c.width = vp.width; c.height = vp.height;
          return page.render({ canvasContext: c.getContext('2d'), viewport: vp }).promise.then(function () { c.hidden = false; $('#pdfPlaceholder').hidden = true; });
        });
      }).catch(function () { /* tasarım kapağı kalır */ });
  }
  if ('IntersectionObserver' in window) {
    var pio = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { pio.disconnect(); cover(); } }, { rootMargin: '600px' });
    pio.observe(projSec);
  } else cover();

  /* =========================================================
     KOPYALA + FORM
     ========================================================= */
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t2 = b.dataset.copy, done = function () { b.textContent = 'Kopyalandı ✓'; setTimeout(function () { b.textContent = 'Kopyala'; }, 1600); };
      var fallback = function () {
        var ta = document.createElement('textarea'); ta.value = t2; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { b.textContent = t2; }
        ta.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t2).then(done, fallback); else fallback();
    });
  });

  var form = $('#contactForm'), status = $('#formStatus');
  $$('input, textarea', form).forEach(function (f2) { f2.addEventListener('input', function () { f2.removeAttribute('aria-invalid'); }); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    $$('input, textarea', form).forEach(function (f2) { if (!f2.checkValidity()) f2.setAttribute('aria-invalid', 'true'); else f2.removeAttribute('aria-invalid'); });
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
