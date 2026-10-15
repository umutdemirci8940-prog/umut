/* Altınyıldız Classics – 970x250 masthead seti için ortak çalışma zamanı.
 * Derleme sırasında (build.js) her bannerın içine satır içi gömülür.
 * İçerik: sezon paleti, vektör ürün çizimleri, yıldız maskot, logo, tıklama çıkışı, yıldız konfeti, 30 sn kuralı. */
var AY = (function () {
  "use strict";

  /* ---------- Sezon paleti (SK 2026: kahve, lacivert, haki, siyah, gri, bordo) ---------- */
  var C = {
    lacivert: "#1d2a48", kahve: "#6b4630", haki: "#6b6a44", bordo: "#6e2233",
    gri: "#7e8189", antrasit: "#3b3e46", bej: "#c8b28c", mavi: "#bccde2",
    beyaz: "#eceef1", siyah: "#24262c", camel: "#a8784a", krem: "#e6dccb"
  };
  var N = {
    lacivert: "Lacivert", kahve: "Kahve", haki: "Haki", bordo: "Bordo", gri: "Gri",
    antrasit: "Antrasit", bej: "Bej", mavi: "Açık Mavi", beyaz: "Beyaz", siyah: "Siyah",
    camel: "Camel", krem: "Krem"
  };

  /* build.js gerçek görselleri buraya yazar: { "kaban": "data:...", "kaban-kahve": "data:..." , logo: "data:..." } */
  var PHOTO = /*@PHOTOS@*/{};

  /* ---------- SVG yardımcıları (çizimler 200x240 tuval üzerinde) ---------- */
  var uid = 0;
  function mir(d) { return d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, function (m, x, y) { return (200 - x) + " " + y; }); }
  function B(d) { return '<path d="' + d + '" style="fill:var(--c);transition:fill .55s ease"/>'; }
  function S(d, a) { return '<path d="' + d + '" fill="rgba(0,0,0,' + a + ')"/>'; }
  function L(d, a) { return '<path d="' + d + '" fill="rgba(255,255,255,' + a + ')"/>'; }
  function K(d, a, w, light) { return '<path d="' + d + '" fill="none" stroke="rgba(' + (light ? "255,255,255," : "0,0,0,") + a + ')" stroke-width="' + w + '" stroke-linecap="round" stroke-linejoin="round"/>'; }
  function G(d, id) { return '<path d="' + d + '" fill="url(#' + id + ')"/>'; }
  function btn(x, y, r) { r = r || 3.6; return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="rgba(0,0,0,.5)"/><circle cx="' + (x - r * .3) + '" cy="' + (y - r * .3) + '" r="' + r * .35 + '" fill="rgba(255,255,255,.35)"/>'; }
  function both(fn, d) { return fn(d) + fn(mir(d)); }

  var DRAW = {
    /* Kaşe kaban – kruvaze, uzun */
    kaban: function (g) {
      var sl = "M60 30 Q38 32 33 58 L22 192 Q22 198 28 198 L42 198 Q46 198 47 192 L58 96 Z";
      var body = "M64 26 L86 17 Q100 28 114 17 L136 26 Q148 32 149 58 L153 228 Q153 233 148 233 L52 233 Q47 233 47 228 L51 58 Q52 32 64 26 Z";
      var lap = "M86 17 L100 36 L92 86 L68 46 L74 24 Z";
      return both(B, sl) + both(function (d) { return S(d, .14) + G(d, g); }, sl) +
        both(function (d) { return K(d, .32, 2); }, "M23 182 L46 183") +
        B(body) + G(body, g) + K(body, .22, 1) +
        S("M86 17 Q100 28 114 17 L110 11 Q100 17 90 11 Z", .5) +
        both(function (d) { return B(d) + L(d, .09) + K(d, .3, 1.2); }, lap) +
        K("M108 86 L112 232", .3, 1.5) +
        btn(88, 106) + btn(112, 106) + btn(88, 136) + btn(112, 136) + btn(88, 166) + btn(112, 166) +
        K("M57 176 L83 174", .38, 3) + K("M117 174 L143 176", .38, 3);
    },
    /* Şişme mont – kapitone, dik yaka */
    mont: function (g) {
      var sl = "M58 34 Q34 36 30 64 L24 168 Q24 176 32 176 L46 176 Q52 176 52 170 L60 100 Z";
      var body = "M62 30 L82 22 L118 22 L138 30 Q150 36 150 60 L152 186 Q152 192 146 192 L54 192 Q48 192 48 186 L50 60 Q50 36 62 30 Z";
      var q = "", qs = "", i, y;
      for (i = 0; i < 5; i++) {
        y = 56 + i * 26;
        q += K("M50 " + y + " Q100 " + (y + 7) + " 150 " + y, .3, 2) + K("M52 " + (y - 13) + " Q100 " + (y - 7) + " 148 " + (y - 13), .13, 9, true);
      }
      for (i = 0; i < 4; i++) { y = 62 + i * 27; qs += both(function (d) { return K(d, .28, 1.8); }, "M" + (33 - i * 1.6) + " " + y + " L58 " + (y + 4)); }
      return both(B, sl) + both(function (d) { return S(d, .12) + G(d, g); }, sl) + qs +
        both(function (d) { return B(d) + S(d, .28); }, "M24 166 L52 168 L52 180 L24 178 Z") +
        B(body) + G(body, g) + q + K(body, .22, 1) +
        S("M48 180 L152 180 L152 192 L48 192 Z", .2) +
        B("M78 6 L122 6 L124 28 Q100 34 76 28 Z") + L("M78 6 L122 6 L123 16 Q100 20 77 16 Z", .1) + K("M78 6 L122 6 L124 28 Q100 34 76 28 Z", .25, 1) +
        K("M100 8 L100 192", .5, 2) + '<rect x="97" y="34" width="6" height="12" rx="2" fill="#c9a35a"/>';
    },
    /* Saç örgü triko kazak – bisiklet yaka */
    triko: function (g) {
      var sl = "M60 30 Q38 32 34 58 L26 176 L50 178 L60 92 Z";
      var body = "M60 28 L84 20 Q100 34 116 20 L140 28 Q150 34 150 58 L150 192 L50 192 L50 58 Q50 34 60 28 Z";
      var cab = "", x, y, i;
      [74, 100, 126].forEach(function (cx) {
        for (y = 46; y < 166; y += 16) {
          cab += K("M" + (cx - 6) + " " + y + " Q" + (cx + 7) + " " + (y + 8) + " " + (cx - 6) + " " + (y + 16), .26, 3) +
                 K("M" + (cx + 6) + " " + y + " Q" + (cx - 7) + " " + (y + 8) + " " + (cx + 6) + " " + (y + 16), .14, 3, true);
        }
      });
      var rib = "";
      for (x = 53; x < 150; x += 5) rib += K("M" + x + " 177 L" + x + " 191", .2, 1.4);
      for (i = 0; i < 4; i++) { x = 27 + i * 6; rib += K("M" + x + " 166 L" + (x - .5) + " 177", .2, 1.4) + K(mir("M" + x + " 166 L" + (x - .5) + " 177"), .2, 1.4); }
      return both(B, sl) + both(function (d) { return S(d, .12) + G(d, g); }, sl) +
        both(function (d) { return S(d, .14); }, "M26 164 L50 166 L50 178 L26 176 Z") +
        B(body) + G(body, g) + cab +
        K("M88 40 L88 170 M112 40 L112 170 M62 40 L62 170 M138 40 L138 170", .1, 1) +
        S("M50 176 L150 176 L150 192 L50 192 Z", .12) + rib + K(body, .22, 1) +
        K("M83 19 Q100 42 117 19", .3, 8) + K("M83 19 Q100 42 117 19", .14, 2, true);
    },
    /* Çizgili gömlek */
    gomlek: function (g) {
      var sl = "M62 30 Q42 32 38 56 L30 186 L52 188 L62 92 Z";
      var body = "M62 28 L86 20 L114 20 L138 28 Q148 34 148 58 L150 214 Q126 222 100 216 Q74 222 50 214 L52 58 Q52 34 62 28 Z";
      var st = "", x;
      for (x = 54; x < 148; x += 7) st += "M" + x + " 22 L" + x + " 220 ";
      var stS = "";
      for (x = 34; x < 62; x += 7) stS += "M" + x + " 40 L" + (x - 4) + " 186 ";
      return both(B, sl) + both(function (d) { return S(d, .08) + G(d, g); }, sl) +
        K(stS, .12, 1.4) + K(mir(stS), .12, 1.4) +
        both(function (d) { return B(d) + L(d, .2) + K(d, .2, 1); }, "M30 172 L52 174 L52 190 L30 188 Z") +
        B(body) + G(body, g) + K(st, .13, 1.6) + K(body, .2, 1) +
        B("M97 34 L103 34 L104 215 L96 215 Z") + L("M97 34 L103 34 L104 215 L96 215 Z", .25) +
        btn(100, 54, 2.4) + btn(100, 86, 2.4) + btn(100, 118, 2.4) + btn(100, 150, 2.4) + btn(100, 182, 2.4) +
        S("M86 20 Q100 26 114 20 L112 14 Q100 18 88 14 Z", .25) +
        both(function (d) { return B(d) + L(d, .3) + K(d, .25, 1); }, "M86 20 L100 34 L86 48 L76 26 Z") +
        K("M116 70 L136 70 L136 92 L126 96 L116 92 Z", .22, 1.2);
    },
    /* Takım elbise ceketi + gömlek & kravat */
    takim: function (g) {
      var sl = "M60 30 Q38 32 34 58 L26 188 L50 190 L60 94 Z";
      var body = "M62 26 L86 17 Q100 28 114 17 L138 26 Q150 32 150 58 L152 200 Q152 205 147 205 L106 205 L100 186 L94 205 L53 205 Q48 205 48 200 L50 58 Q50 32 62 26 Z";
      var lap = "M86 17 L94 22 L78 38 L88 44 L100 116 L68 50 L74 24 Z";
      return both(B, sl) + both(function (d) { return S(d, .12) + G(d, g); }, sl) +
        '<path d="M30 186 L48 188 L48 192 L30 190 Z" fill="#f2efe8"/>' + '<path d="' + mir("M30 186 L48 188 L48 192 L30 190 Z") + '" fill="#f2efe8"/>' +
        B(body) + G(body, g) + K(body, .22, 1) +
        '<path d="M86 17 L100 28 L114 17 L100 116 Z" fill="#f3f0e9"/>' +
        '<path d="M97 32 L103 32 L107 100 L100 110 L93 100 Z" fill="#6e2233"/><path d="M96 26 L104 26 L103 33 L97 33 Z" fill="#5a1b29"/>' +
        K("M98 46 L106 40 M97 62 L106 55 M96 78 L106 71 M95 94 L106 87", .18, 1.5, true) +
        both(function (d) { return B(d) + L(d, .1) + K(d, .3, 1.2); }, lap) +
        btn(102, 134, 3.4) + btn(102, 160, 3.4) +
        '<path d="M121 72 L139 66 L136 76 Z" fill="#c9a35a"/>' + K("M118 76 L141 70", .35, 2) +
        S("M58 162 L86 160 L86 167 L58 169 Z", .16) + S(mir("M58 162 L86 160 L86 167 L58 169 Z"), .16);
    },
    /* Chino pantolon */
    pantolon: function (g) {
      var p = "M58 14 L142 14 L150 228 L112 228 L100 70 L88 228 L50 228 Z";
      return B(p) + G(p, g) + K(p, .22, 1) + B("M58 6 L142 6 L142 18 L58 18 Z") + S("M58 6 L142 6 L142 18 L58 18 Z", .12) +
        K("M100 18 L100 70", .3, 1.5) + K("M64 20 Q76 40 92 22 M136 20 Q124 40 108 22", .28, 1.5) +
        K("M72 30 L68 226 M128 30 L132 226", .1, 1.2, true) + '<rect x="96" y="8" width="8" height="8" rx="1.5" fill="#c9a35a"/>';
    }
  };

  /** Ürün çizimi (veya build sırasında eklenen fotoğraf). opts: {color, hanger, cls} */
  function garment(key, opts) {
    opts = opts || {};
    var col = opts.color || "lacivert";
    var photo = PHOTO[key + "-" + col] || PHOTO[key];
    if (photo) return '<img class="gm photo ' + (opts.cls || "") + '" src="' + photo + '" alt="">';
    var id = "ayg" + (++uid);
    var hanger = opts.hanger;
    var vb = hanger ? "0 -36 200 276" : "0 0 200 240";
    var defs = '<defs><linearGradient id="' + id + '" x1="0" x2="1" y1="0" y2=".3"><stop offset="0" stop-color="#fff" stop-opacity=".16"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".24"/></linearGradient></defs>';
    var bar = hanger ? '<path d="M44 32 Q100 12 156 32" stroke="#7a5233" stroke-width="7" stroke-linecap="round" fill="none"/>' : "";
    var hook = hanger ? '<path d="M100 20 L100 -14 Q100 -30 113 -30 Q125 -30 125 -18" stroke="#b8924f" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M90 22 Q100 14 110 22" stroke="#7a5233" stroke-width="7" stroke-linecap="round" fill="none"/>' : "";
    return '<svg class="gm ' + (opts.cls || "") + '" viewBox="' + vb + '" style="--c:' + (C[col] || col) + '" aria-hidden="true">' + defs + bar + DRAW[key](id) + hook + "</svg>";
  }

  /* ---------- Yıldız maskot ("Yıldız") ---------- */
  function starPath(cx, cy, R, r) {
    var p = [], i, a;
    for (i = 0; i < 10; i++) { a = -Math.PI / 2 + i * Math.PI / 5; p.push((cx + Math.cos(a) * (i % 2 ? r : R)).toFixed(1) + " " + (cy + Math.sin(a) * (i % 2 ? r : R)).toFixed(1)); }
    return "M" + p.join(" L") + " Z";
  }
  function mascot(mood) {
    var id = "ays" + (++uid), d = starPath(50, 54, 42, 21);
    var mouth = mood === "wow" ? '<ellipse cx="50" cy="67" rx="5" ry="6" fill="#3a2410"/>' : '<path d="M41 63 Q50 73 59 63" fill="none" stroke="#3a2410" stroke-width="3.2" stroke-linecap="round"/>';
    return '<svg viewBox="0 0 100 100" class="mascot" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2=".4" y2="1"><stop offset="0" stop-color="#ffe7a0"/><stop offset=".55" stop-color="#e2b54e"/><stop offset="1" stop-color="#b98a2c"/></linearGradient></defs>' +
      '<path d="' + d + '" fill="url(#' + id + ')" stroke="url(#' + id + ')" stroke-width="12" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="rgba(120,80,20,.35)" stroke-width="1.5" stroke-linejoin="round" transform="translate(50 54) scale(1.13) translate(-50 -54)"/>' +
      '<path d="M30 40 Q36 30 46 28" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="3.5" stroke-linecap="round"/>' +
      '<ellipse cx="41" cy="52" rx="3.8" ry="5.2" fill="#3a2410"/><ellipse cx="59" cy="52" rx="3.8" ry="5.2" fill="#3a2410"/>' +
      '<circle cx="42.3" cy="50.2" r="1.3" fill="#fff"/><circle cx="60.3" cy="50.2" r="1.3" fill="#fff"/>' +
      '<ellipse cx="33" cy="61" rx="5" ry="3" fill="#e9826a" opacity=".55"/><ellipse cx="67" cy="61" rx="5" ry="3" fill="#e9826a" opacity=".55"/>' + mouth + "</svg>";
  }
  function star(fill) { return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="' + starPath(50, 54, 44, 19) + '" fill="' + (fill || "#c9a35a") + '" stroke="' + (fill || "#c9a35a") + '" stroke-width="6" stroke-linejoin="round"/></svg>'; }

  /* ---------- Logo (assets/logo.* varsa resmi logo kullanılır) ---------- */
  function logo(color, cls) {
    if (PHOTO.logo) return '<img class="ay-logo ' + (cls || "") + '" src="' + PHOTO.logo + '" alt="Altınyıldız Classics">';
    return '<div class="ay-logo ' + (cls || "") + '" style="color:' + (color || "#1d2a48") + '" role="img" aria-label="Altınyıldız Classics"><b>ALTINYILDIZ</b><span><i></i>CLASSICS<i></i></span></div>';
  }

  /* ---------- Tıklama çıkışı: clickTag / clickTagN / Enabler ---------- */
  function exit(n) {
    var key = n ? "clickTag" + n : "clickTag";
    var url = window[key] || window.clickTag;
    if (window.Enabler && window.Enabler.exitOverride) { window.Enabler.exitOverride(key, url); return; }
    if (window.Enabler && window.Enabler.exit) { window.Enabler.exit(key, url); return; }
    window.open(url, "_blank");
  }

  /* ---------- Yıldız / kumaş konfetisi ---------- */
  function fx(canvas) {
    var ctx = canvas.getContext("2d"), parts = [], last = 0, running = false;
    var COLS = ["#e2b54e", "#f3d98c", "#c9a35a", "#6e2233", "#1d2a48", "#f4efe6"];
    function drawStar(r) { ctx.beginPath(); for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
    function loop(now) {
      var dt = Math.min(.04, (now - (last || now)) / 1000); last = now;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var j = parts.length - 1; j >= 0; j--) {
        var p = parts[j]; p.age += dt;
        if (p.age > p.life) { parts.splice(j, 1); continue; }
        p.vy += 480 * dt; p.vx *= (1 - 1.5 * dt); p.x += p.vx * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.globalAlpha = 1 - Math.pow(p.age / p.life, 3); ctx.fillStyle = p.col;
        if (p.star) drawStar(p.w); else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.age * 9)));
        ctx.restore();
      }
      if (parts.length) requestAnimationFrame(loop); else { running = false; last = 0; }
    }
    return function burst(x, y, n, spread) {
      for (var i = 0; i < n; i++) {
        var a = -Math.PI / 2 + (Math.random() - .5) * (spread || 2.2), sp = 120 + Math.random() * 220;
        parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: Math.random() * 6.28, vr: (Math.random() - .5) * 12,
          w: 3 + Math.random() * 4, h: 3 + Math.random() * 3, star: Math.random() < .55, col: COLS[i % COLS.length], life: 1 + Math.random() * .7, age: 0 });
      }
      if (!running) { running = true; requestAnimationFrame(loop); }
    };
  }

  /* ---------- Fiyat biçimi: 2999 → "2.999" ---------- */
  function tl(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  function countTo(el, target, d) {
    var from = parseInt(String(el.textContent).replace(/\./g, ""), 10) || 0;
    if (from === target) { el.textContent = tl(target); return; }
    var t0 = performance.now(); d = d || 500;
    (function step(t) {
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
      el.textContent = tl(from + (target - from) * e);
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Panoya kopyalama ---------- */
  function copy(text) {
    try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text); return true; } } catch (e) { /* yedek yol */ }
    var ta = document.createElement("textarea"); ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    var ok = false; try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(ta); return ok;
  }

  /* ---------- Ortak CSS ---------- */
  var css = '.ay-logo{display:inline-flex;flex-direction:column;align-items:center;line-height:1;font-family:"Jost","Helvetica Neue",Arial,sans-serif}' +
    '.ay-logo b{font:500 19px/1 "Jost","Helvetica Neue",Arial,sans-serif;letter-spacing:.2em;margin-right:-.2em}' +
    '.ay-logo span{display:flex;align-items:center;gap:6px;margin-top:5px;font:400 8px/1 "Jost",Arial,sans-serif;letter-spacing:.62em;margin-right:-.62em}' +
    '.ay-logo i{display:block;width:16px;height:1px;background:currentColor;opacity:.7}' +
    'img.ay-logo{display:block;height:auto}' +
    '.gm{display:block;overflow:visible}img.gm{object-fit:contain}' +
    '.mascot{display:block;width:100%;height:100%;overflow:visible}' +
    'html.rest .amb,html.rest .amb *{animation-play-state:paused!important}' +
    '@media (prefers-reduced-motion:reduce){.amb,.amb *{animation:none!important}}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* Google Ads: döngüsel ortam animasyonları 30 sn sonra durur; kullanıcı etkileşimi sürdükçe oyun çalışmaya devam eder. */
  setTimeout(function () { document.documentElement.classList.add("rest"); }, 30000);
  function wake() { document.documentElement.classList.remove("rest"); }

  function ready(fn) { if (document.readyState === "complete") fn(); else window.addEventListener("load", fn); }

  return { C: C, N: N, PHOTO: PHOTO, garment: garment, mascot: mascot, star: star, logo: logo, exit: exit, fx: fx, tl: tl, countTo: countTo, copy: copy, wake: wake, ready: ready };
})();
