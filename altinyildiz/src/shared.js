/* Altınyıldız Classics – 970x250 masthead seti için ortak çalışma zamanı.
 * Derleme sırasında (build.js) her bannerın içine satır içi gömülür.
 * İçerik: yıldız maskot, orijinal logo, tıklama çıkışı, yıldız konfeti, fiyat sayacı, panoya kopyalama, 30 sn kuralı. */
var AY = (function () {
  "use strict";

  /* build.js sitedeki logo sembolünü (currentColor) buraya yazar */
  var LOGO = /*@LOGO@*/null;
  var uid = 0;

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

  /* ---------- Logo: altinyildizclassics.com'daki orijinal logo (SVG), renk currentColor ---------- */
  function logo(color, cls) {
    if (LOGO) return '<div class="ay-logo ' + (cls || "") + '" style="color:' + (color || "#0a0b09") + '" role="img" aria-label="Altınyıldız Classics">' + LOGO + "</div>";
    return '<div class="ay-logo txt ' + (cls || "") + '" style="color:' + (color || "#0a0b09") + '" role="img" aria-label="Altınyıldız Classics"><b>ALTINYILDIZ ★ CLASSICS</b></div>';
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

  /* ---------- Fiyat biçimi: 5999.99 → "5.999,99", 3000 → "3.000" ---------- */
  function tl(n) {
    var c = Math.round(n * 100), i = Math.floor(c / 100), k = c % 100;
    return String(i).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + (k ? "," + (k < 10 ? "0" : "") + k : "");
  }
  function countTo(el, target, d) {
    var from = parseFloat(String(el.textContent).replace(/\./g, "").replace(",", ".")) || 0;
    if (from === target) { el.textContent = tl(target); return; }
    var t0 = performance.now(); d = d || 500;
    (function step(t) {
      var k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
      el.textContent = k < 1 ? tl(Math.round(from + (target - from) * e)) : tl(target);
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
  var css = '.ay-logo{display:block;line-height:0}.ay-logo .ay-svg{display:block;width:100%;height:auto}' +
    '.ay-logo.txt{line-height:1;font:600 14px/1 "Urbanist",Arial,sans-serif;letter-spacing:.12em;white-space:nowrap}' +
    '.mascot{display:block;width:100%;height:100%;overflow:visible}' +
    'html.rest .amb,html.rest .amb *{animation-play-state:paused!important}' +
    '@media (prefers-reduced-motion:reduce){.amb,.amb *{animation:none!important}}';
  var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

  /* Google Ads: döngüsel ortam animasyonları 30 sn sonra durur; kullanıcı etkileşimi sürdükçe oyun çalışmaya devam eder. */
  setTimeout(function () { document.documentElement.classList.add("rest"); }, 30000);
  function wake() { document.documentElement.classList.remove("rest"); }

  function ready(fn) { if (document.readyState === "complete") fn(); else window.addEventListener("load", fn); }

  return { mascot: mascot, star: star, logo: logo, exit: exit, fx: fx, tl: tl, countTo: countTo, copy: copy, wake: wake, ready: ready };
})();
