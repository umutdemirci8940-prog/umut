/* Paribu 970x250 interaktif masthead – tarayıcı motoru v2 (ES5). Veri nesnesi derlemede JSON ile yerleştirilir. */
(function () {
  'use strict';
  var D = __DATA__;
  var W = 970, H = 250;
  var ad = document.getElementById('ad'), cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.scale(DPR, DPR);
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TOUCH = ('ontouchstart' in window) && !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  var G = D.game, T = D.timing, C = D.colors, K = D.copy;
  var PX0 = 346, PX1 = 742, PY = 146, PW = G.phoneWidth || 126, COIN_R = 18;

  function q(s) { return ad.querySelector(s); }
  var els = { promptText: q('.prompt span'), ctaText: q('.cta b'), replay: q('.replay'), hint: q('.hint') };
  if (TOUCH && els.promptText) els.promptText.textContent = K.promptTouch;

  /* ---------- yardımcılar ---------- */
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeBack(t) { var c = 1.4; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); }
  function hexToRgb(h) { var n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
  function rgba(h, a) { var c = hexToRgb(h); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function shade(h, p) { var c = hexToRgb(h); for (var i = 0; i < 3; i++) c[i] = Math.round(clamp(c[i] + (p > 0 ? (255 - c[i]) * p : c[i] * p), 0, 255)); return 'rgb(' + c.join(',') + ')'; }
  function rr(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
  function track(n) { if (!D.tracking.enabled) return; try { if (typeof window.adTrack === 'function') window.adTrack(n); if (window.Enabler && Enabler.counter) Enabler.counter(n); } catch (e) { } }
  function openLink(label) {
    track('cta_click'); track('exit');
    var u = window.clickTag || D.brand.url;
    if (window.Enabler && Enabler.exit) { Enabler.exit(label || 'CTA'); } else { window.open(u, '_blank', 'noopener'); }
  }

  /* ---------- sprite'lar (3B görünümlü coin yüzü + kenar) ---------- */
  var sprites = {}, symbolImg = null, loaded = 0;
  function makeSprite(key, uri, color) {
    var im = new Image();
    im.onload = function () {
      var s = 72, oc = document.createElement('canvas'); oc.width = s * DPR; oc.height = s * DPR;
      var o = oc.getContext('2d'); o.scale(DPR, DPR);
      var cx = s / 2, cy = s / 2, R = s / 2 - 3;
      // metalik kenar halkası
      var ring = o.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      ring.addColorStop(0, shade(color, 0.55)); ring.addColorStop(0.35, shade(color, -0.1)); ring.addColorStop(0.65, shade(color, -0.5)); ring.addColorStop(1, shade(color, 0.3));
      o.fillStyle = ring; o.beginPath(); o.arc(cx, cy, R, 0, Math.PI * 2); o.fill();
      // iç yüz (ikon)
      o.save(); o.beginPath(); o.arc(cx, cy, R - 4.5, 0, Math.PI * 2); o.clip();
      o.drawImage(im, cx - (R - 4.5), cy - (R - 4.5), (R - 4.5) * 2, (R - 4.5) * 2);
      o.restore();
      // iç gölge + parlama
      var g = o.createRadialGradient(cx - R * 0.35, cy - R * 0.4, 1, cx, cy, R);
      g.addColorStop(0, 'rgba(255,255,255,.34)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(0.92, 'rgba(0,0,0,.12)'); g.addColorStop(1, 'rgba(0,0,0,.3)');
      o.fillStyle = g; o.beginPath(); o.arc(cx, cy, R - 4.5, 0, Math.PI * 2); o.fill();
      o.lineWidth = 1; o.strokeStyle = 'rgba(255,255,255,.35)'; o.beginPath(); o.arc(cx, cy, R - 4.5, 0, Math.PI * 2); o.stroke();
      // kenar çentikleri
      o.strokeStyle = 'rgba(0,0,0,.25)'; o.lineWidth = 1.2;
      for (var a = 0; a < Math.PI * 2; a += Math.PI / 24) { o.beginPath(); o.moveTo(cx + Math.cos(a) * (R - 1), cy + Math.sin(a) * (R - 1)); o.lineTo(cx + Math.cos(a) * (R - 3.5), cy + Math.sin(a) * (R - 3.5)); o.stroke(); }
      sprites[key] = oc; loaded++;
    };
    im.src = uri;
  }
  for (var ci = 0; ci < D.coins.length; ci++) makeSprite(D.coins[ci].key, D.coins[ci].uri, D.coins[ci].color);
  if (D.symbol) { symbolImg = new Image(); symbolImg.src = D.symbol; }

  /* ---------- durum ---------- */
  var mode = 'boot', t0 = 0, now = 0, last = 0, tIntro = 0, running = false, hidden = false, paused = false;
  var pointer = { x: -1, y: -1, inside: false }, kb = false, interacted = false, idleSince = 0, restAnchor = 0, winAt = 0, playStarted = false;
  var phone = { x: (PX0 + PX1) / 2, tx: (PX0 + PX1) / 2, vx: 0, w: PW, dip: 0, boost: 0, flash: 0, rise: 0, tilt: 0 };
  var coins = [], parts = [], texts = [], confetti = [], waves = [], rows = [];
  var score = 0, combo = 0, dropAcc = 0, lastKey = -1, lastX = (PX0 + PX1) / 2, shake = 0, hoverCoin = null;
  var chart = { pts: [], v: 12, off: 0, glow: 0, step: (W + 40) / 149, pulse: 0 }, candles = [], candleAcc = 0, bokeh = [], far = [], bg = null;
  var par = { x: 0, y: 0 }; // paralaks (yumuşatılmış imleç)

  function setMode(m) { mode = m; ad.setAttribute('data-mode', m); ad.classList.toggle('is-playing', m === 'play'); ad.classList.toggle('is-win', m === 'win'); ad.classList.toggle('is-rest', m === 'rest'); }
  function setScore(s) { score = s; ad.setAttribute('data-score', s); ad.classList.toggle('has-score', s > 0); }

  /* ---------- arka plan katmanları ---------- */
  function nextV() { chart.v = clamp(chart.v + 0.26 + (Math.random() - 0.5) * 3.2, 2, 46); return chart.v; }
  for (var pi = 0; pi < 150; pi++) chart.pts.push(nextV());
  var cv0 = 0.5;
  function newCandle() { var o = cv0, c = clamp(o + (Math.random() - 0.42) * 0.22, 0.08, 0.95); cv0 = c; return { o: o, c: c, h: Math.max(o, c) + rnd(0.02, 0.1), l: Math.min(o, c) - rnd(0.02, 0.1), t: 0 }; }
  for (var ki = 0; ki < 30; ki++) { var cnd = newCandle(); cnd.t = 1; candles.push(cnd); }
  for (var bi = 0; bi < 26; bi++) bokeh.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(0.8, 2.6), a: rnd(0.1, 0.45), vy: rnd(4, 13), vx: rnd(-3, 3) });
  for (var fi = 0; fi < 7; fi++) far.push({ x: rnd(330, W - 40), y: rnd(20, H - 20), r: rnd(26, 60), key: D.coins[fi % D.coins.length].key, a: rnd(0.05, 0.11), vy: rnd(2, 5), sp: rnd(0, 6.28) });

  function buildBg() {
    var oc = document.createElement('canvas'); oc.width = W * DPR; oc.height = H * DPR; var o = oc.getContext('2d'); o.scale(DPR, DPR);
    var g = o.createLinearGradient(0, 0, W, H); g.addColorStop(0, C.bg2); g.addColorStop(0.5, C.bg); g.addColorStop(1, C.bg2);
    o.fillStyle = g; o.fillRect(0, 0, W, H);
    var rg = o.createRadialGradient(560, 170, 10, 560, 170, 380); rg.addColorStop(0, rgba(C.brand, 0.2)); rg.addColorStop(0.5, rgba(C.brand, 0.06)); rg.addColorStop(1, rgba(C.brand, 0));
    o.fillStyle = rg; o.fillRect(0, 0, W, H);
    var rg2 = o.createRadialGradient(120, 40, 10, 120, 40, 320); rg2.addColorStop(0, 'rgba(255,255,255,.07)'); rg2.addColorStop(1, 'rgba(255,255,255,0)');
    o.fillStyle = rg2; o.fillRect(0, 0, W, H);
    // ızgara + perspektif zemin çizgileri
    o.strokeStyle = 'rgba(255,255,255,.04)'; o.lineWidth = 1; o.beginPath();
    for (var x = 48.5; x < W; x += 48.5) { o.moveTo(Math.round(x) + 0.5, 0); o.lineTo(Math.round(x) + 0.5, H); }
    for (var y = 50; y < H; y += 50) { o.moveTo(0, y + 0.5); o.lineTo(W, y + 0.5); }
    o.stroke();
    // oyun alanı: hafif cam panel
    var pg = o.createLinearGradient(0, 0, 0, H); pg.addColorStop(0, 'rgba(255,255,255,.012)'); pg.addColorStop(1, 'rgba(255,255,255,.05)');
    o.fillStyle = pg; o.fillRect(PX0 - 12, 0, PX1 - PX0 + 24, H);
    o.fillStyle = 'rgba(255,255,255,.05)'; o.fillRect(PX0 - 12, 0, 1, H); o.fillRect(PX1 + 11, 0, 1, H);
    // vinyet
    var vg = o.createRadialGradient(W / 2, H / 2, H * 0.6, W / 2, H / 2, W * 0.62); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)');
    o.fillStyle = vg; o.fillRect(0, 0, W, H);
    bg = oc;
  }

  function drawFar() { // uzak, bulanık coin siluetleri (paralaks 0.35)
    for (var i = 0; i < far.length; i++) {
      var f = far[i], sp = sprites[f.key]; if (!sp) continue;
      ctx.save(); ctx.globalAlpha = f.a; ctx.translate(f.x + par.x * 0.35, f.y + par.y * 0.35);
      var ax = Math.max(0.2, Math.abs(Math.cos(f.sp)));
      ctx.scale(ax, 1); ctx.drawImage(sp, -f.r, -f.r, f.r * 2, f.r * 2); ctx.restore();
    }
  }
  function drawCandles(alphaMul) { // mum grafiği (alt yarı, sola doğru sönen)
    var n = candles.length, cw = 22, base = H - 14, hh = 96, x0 = PX0 - 40 - (candleAcc / 900) * cw;
    ctx.save(); ctx.translate(par.x * 0.5, par.y * 0.5);
    for (var i = 0; i < n; i++) {
      var c = candles[i], x = x0 + i * cw; if (x < 60 || x > W + 10) continue;
      var up = c.c >= c.o, col = up ? C.brand : '#8b93a1', fade = clamp((x - 60) / 320, 0, 1) * alphaMul;
      var yo = base - c.o * hh, yc = base - c.c * hh, yh = base - c.h * hh, yl = base - c.l * hh, t = c.t;
      ctx.globalAlpha = 0.16 * fade; ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x + cw / 2, lerp(yo, yh, t)); ctx.lineTo(x + cw / 2, lerp(yo, yl, t)); ctx.stroke();
      ctx.globalAlpha = 0.2 * fade; ctx.fillStyle = col; var top = Math.min(yo, lerp(yo, yc, t)), bh = Math.max(1.5, Math.abs(lerp(yo, yc, t) - yo)); ctx.fillRect(x + 4, top, cw - 8, bh);
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function drawChart(prog) {
    var n = chart.pts.length, st = chart.step, base = H - 18, sc = 2.35, xs = [], ys = [];
    for (var i = 0; i < n; i++) { xs.push(-20 + i * st - chart.off + par.x * 0.3); ys.push(base - chart.pts[i] * sc + par.y * 0.3); }
    var lim = Math.floor((n - 1) * prog); if (lim < 2) return;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(xs[0], ys[0]);
    for (i = 1; i <= lim; i++) { var xc = (xs[i - 1] + xs[i]) / 2, yc = (ys[i - 1] + ys[i]) / 2; ctx.quadraticCurveTo(xs[i - 1], ys[i - 1], xc, yc); }
    ctx.lineTo(xs[lim], ys[lim]); ctx.lineTo(xs[lim], H); ctx.lineTo(xs[0], H); ctx.closePath();
    var fg = ctx.createLinearGradient(0, base - 46 * sc, 0, H); fg.addColorStop(0, rgba(C.brand, 0.15 + chart.glow * 0.12)); fg.addColorStop(1, rgba(C.brand, 0));
    ctx.fillStyle = fg; ctx.fill();
    ctx.beginPath(); ctx.moveTo(xs[0], ys[0]);
    for (i = 1; i <= lim; i++) { xc = (xs[i - 1] + xs[i]) / 2; yc = (ys[i - 1] + ys[i]) / 2; ctx.quadraticCurveTo(xs[i - 1], ys[i - 1], xc, yc); }
    ctx.lineTo(xs[lim], ys[lim]);
    var lg = ctx.createLinearGradient(0, 0, W, 0); lg.addColorStop(0, rgba(C.brand, 0.08)); lg.addColorStop(0.36, rgba(C.brand, 0.42)); lg.addColorStop(1, rgba(C.brand2, 0.95));
    ctx.strokeStyle = lg; ctx.lineWidth = 1.6 + chart.glow * 1.6; ctx.lineJoin = 'round';
    if (chart.glow > 0.02) { ctx.shadowColor = rgba(C.brand, 0.9); ctx.shadowBlur = 16 * chart.glow; }
    ctx.stroke();
    var ex = xs[lim], ey = ys[lim], pr = 3 + Math.sin(chart.pulse) * 0.8;
    ctx.shadowBlur = 0;
    ctx.fillStyle = rgba(C.brand2, 0.25 + chart.glow * 0.3); ctx.beginPath(); ctx.arc(ex, ey, pr * 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.brand2; ctx.beginPath(); ctx.arc(ex, ey, pr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawSpotlight() {
    if (!pointer.inside || pointer.x < 0) return;
    var g = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 150);
    g.addColorStop(0, rgba(C.brand, 0.11)); g.addColorStop(0.5, rgba(C.brand, 0.04)); g.addColorStop(1, rgba(C.brand, 0));
    ctx.fillStyle = g; ctx.fillRect(pointer.x - 150, pointer.y - 150, 300, 300);
  }

  /* ---------- coinler ---------- */
  function anchors() {
    var out = [], n = D.coins.length;
    for (var i = 0; i < n; i++) { var t = n === 1 ? 0.5 : i / (n - 1); out.push({ x: lerp(PX0 + 34, PX1 - 34, t), y: 92 + Math.sin(t * Math.PI) * -30 + (i % 2) * 24 }); }
    return out;
  }
  function seedFloaters() {
    var an = anchors();
    for (var i = 0; i < D.coins.length; i++) {
      coins.push({ key: D.coins[i].key, name: D.coins[i].name, color: D.coins[i].color, state: 'float', x: W + 70 + i * 34, y: an[i].y, ax: an[i].x, ay: an[i].y, sx: W + 70 + i * 34, sy: an[i].y - 70 + i * 14, ph: rnd(0, 6.28), spin: rnd(0, 6.28), vs: rnd(1.2, 2.2), r: COIN_R, born: 900 + i * 140, dur: 820, vx: 0, vy: 0, ct: 0, hover: 0, trail: [] });
    }
  }
  function pickKey() { var k; do { k = Math.floor(Math.random() * D.coins.length); } while (D.coins.length > 1 && k === lastKey); lastKey = k; return D.coins[k]; }
  function dropFloater(f) { f.state = 'fall'; f.vy = 40; f.vx = rnd(-16, 16); f.vs = rnd(2, 4); f.hover = 0; return f; }
  function spawn(x) {
    for (var i = 0; i < coins.length; i++) if (coins[i].state === 'float' && coins[i] !== hoverCoin) return dropFloater(coins[i]);
    var c = pickKey(), nx;
    if (typeof x === 'number') nx = clamp(x, PX0 + 24, PX1 - 24);
    else { do { nx = rnd(PX0 + 28, PX1 - 28); } while (Math.abs(nx - lastX) < 70); }
    lastX = nx;
    var o = { key: c.key, name: c.name, color: c.color, state: 'fall', x: nx, y: -COIN_R - 8, vx: rnd(-18, 18), vy: rnd(0, 30), spin: rnd(0, 6.28), vs: rnd(2, 4), r: COIN_R, ct: 0, hover: 0, trail: [] };
    coins.push(o); return o;
  }
  function drawCoin(c, alpha, scale) {
    var sp = sprites[c.key]; if (!sp) return;
    var cs = Math.cos(c.spin), ax = Math.abs(cs); if (ax < 0.14) ax = 0.14;
    var s = (scale || 1) * (1 + c.hover * 0.14), r = c.r * s;
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha;
    // hız izi
    if (c.state === 'fall' && c.vy > 160) { for (var k = 0; k < 3; k++) { ctx.globalAlpha = (alpha == null ? 1 : alpha) * (0.12 - k * 0.035); ctx.fillStyle = c.color; ctx.beginPath(); ctx.ellipse(c.x, c.y - (k + 1) * 9 * (c.vy / 420), r * ax * 0.85, r * 0.85, 0, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = alpha == null ? 1 : alpha; }
    ctx.translate(c.x, c.y);
    // gölge
    ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.beginPath(); ctx.ellipse(2, 5, r * ax, r, 0, 0, Math.PI * 2); ctx.fill();
    // kalınlık (kenar dilimleri)
    var depth = Math.round(4 * (1 - ax)); var dir = cs < 0 ? -1 : 1;
    for (var d = depth; d >= 1; d--) { ctx.fillStyle = shade(c.color, -0.5 + d * 0.04); ctx.beginPath(); ctx.ellipse(dir * d * 1.3, 0, r * ax, r, 0, 0, Math.PI * 2); ctx.fill(); }
    // yüz
    ctx.save(); ctx.scale(ax, 1); ctx.drawImage(sp, -r, -r, r * 2, r * 2);
    // yüzde kayan parlama
    var sh = ((c.spin / (Math.PI * 2)) % 1) * 2 - 1; var g = ctx.createLinearGradient(-r + sh * r * 2 - r * 0.5, -r, -r + sh * r * 2 + r * 0.5, r);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.28)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, r - 2, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    // hover halkası
    if (c.hover > 0.02) { ctx.strokeStyle = rgba(C.brand2, c.hover * 0.9); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(0, 0, (r + 5) * Math.max(ax, 0.5), r + 5, 0, 0, Math.PI * 2); ctx.stroke(); }
    ctx.restore();
    if (c.hover > 0.3 && c.state === 'float') { // isim etiketi
      ctx.save(); ctx.globalAlpha = c.hover; ctx.font = '700 10px Sora, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      var label = c.name + '  ·  ' + K.promptTap, tw = ctx.measureText(label).width + 18, lx = clamp(c.x, tw / 2 + 4, W - tw / 2 - 4), ly = c.y - r - 16 < 64 ? c.y + r + 16 : c.y - r - 16;
      ctx.fillStyle = 'rgba(9,11,16,.9)'; rr(lx - tw / 2, ly - 10, tw, 20, 10); ctx.fill(); ctx.strokeStyle = rgba(C.brand, 0.5); ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillText(label, lx, ly + 0.5); ctx.restore();
    }
  }

  /* ---------- telefon (Paribu uygulaması) ---------- */
  function drawPhone() {
    var w = phone.w, riseOff = (1 - phone.rise) * 130, y = PY + phone.dip * 5 + riseOff, x = phone.x - w / 2, h = H - y + 60;
    ctx.save(); ctx.translate(phone.x, y + 40); ctx.rotate(phone.tilt); ctx.translate(-phone.x, -(y + 40));
    // mıknatıs dalgaları
    for (var i = 0; i < waves.length; i++) { var wv = waves[i], k = wv.t / wv.life; ctx.strokeStyle = rgba(C.brand2, (1 - k) * 0.55); ctx.lineWidth = 2 * (1 - k) + 0.5; ctx.beginPath(); ctx.ellipse(phone.x, y + 4, w / 2 + k * 150, (w / 2 + k * 150) * 0.32, 0, Math.PI, Math.PI * 2); ctx.stroke(); }
    // hale
    var glow = 0.25 + phone.boost * 0.6 + phone.flash * 0.6 + (mode === 'win' ? 0.4 : 0);
    ctx.shadowColor = rgba(C.brand, glow); ctx.shadowBlur = 26 + phone.boost * 20;
    var bodyG = ctx.createLinearGradient(x, y, x + w, y + 60); bodyG.addColorStop(0, '#2a2e38'); bodyG.addColorStop(0.5, '#171a21'); bodyG.addColorStop(1, '#232730');
    ctx.fillStyle = bodyG; rr(x, y, w, h, 22); ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(255,255,255,' + (0.16 + phone.boost * 0.5) + ')'; rr(x, y, w, h, 22); ctx.stroke();
    // yan düğmeler
    ctx.fillStyle = '#3a3f4b'; ctx.fillRect(x - 2, y + 34, 2, 16); ctx.fillRect(x - 2, y + 56, 2, 26); ctx.fillRect(x + w, y + 44, 2, 34);
    // ekran
    var sx = x + 5, sy = y + 5, sw = w - 10, sh = h - 10;
    ctx.save(); rr(sx, sy, sw, sh, 18); ctx.clip();
    var scr = ctx.createLinearGradient(sx, sy, sx, sy + 120); scr.addColorStop(0, '#0f1217'); scr.addColorStop(1, '#141820');
    ctx.fillStyle = scr; ctx.fillRect(sx, sy, sw, sh);
    // üst ışık yansıması
    var refl = ctx.createLinearGradient(sx, sy, sx + sw, sy + 90); refl.addColorStop(0, 'rgba(255,255,255,.07)'); refl.addColorStop(0.5, 'rgba(255,255,255,0)'); ctx.fillStyle = refl; ctx.fillRect(sx, sy, sw, sh);
    // dinamik ada
    ctx.fillStyle = '#000'; rr(phone.x - 15, sy + 6, 30, 7, 3.5); ctx.fill();
    // başlık: logo sembolü + Portföyüm + sayaç
    var hy = sy + 24;
    if (symbolImg && symbolImg.complete && symbolImg.naturalWidth) { ctx.fillStyle = C.brand; rr(sx + 9, hy - 1, 14, 14, 4); ctx.fill(); ctx.drawImage(symbolImg, sx + 11.5, hy + 1.5, 9, 9); }
    ctx.font = '700 9.5px Sora, system-ui, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(K.phoneTitle, sx + 28, hy + 6.5);
    var cnt = score + '/' + G.target; ctx.font = '800 9.5px Sora, system-ui, sans-serif'; var cw = ctx.measureText(cnt).width + 12;
    ctx.fillStyle = mode === 'win' ? C.brand : 'rgba(255,255,255,.1)'; rr(sx + sw - 9 - cw, hy - 1, cw, 15, 7.5); ctx.fill();
    ctx.fillStyle = mode === 'win' ? '#0f1400' : C.brand2; ctx.textAlign = 'center'; ctx.fillText(cnt, sx + sw - 9 - cw / 2, hy + 6.8);
    ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.fillRect(sx + 9, hy + 20, sw - 18, 1);
    // satırlar (son yakalananlar üstte)
    var ry = hy + 30, rh = 22, shown = rows.slice(-3).reverse();
    if (mode === 'win') {
      ctx.textAlign = 'center'; ctx.font = '800 11px Sora, system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(K.phoneWin, phone.x, ry + 30);
      ctx.strokeStyle = C.brand; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.arc(phone.x, ry + 8, 11, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(phone.x - 5, ry + 8); ctx.lineTo(phone.x - 1, ry + 12); ctx.lineTo(phone.x + 6, ry + 4); ctx.stroke();
      // kazanma: coin ikonları sırada
      for (i = 0; i < rows.length; i++) { var spw = sprites[rows[i].key]; if (spw) ctx.drawImage(spw, phone.x - (rows.length * 16) / 2 + i * 16 - 6, ry + 42, 13, 13); }
    } else if (!shown.length) {
      ctx.textAlign = 'center'; ctx.font = '500 8.5px Sora, system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.45)';
      var words = K.phoneEmpty.split(' '), line = '', ly = ry + 8; for (i = 0; i < words.length; i++) { var test = line ? line + ' ' + words[i] : words[i]; if (ctx.measureText(test).width > sw - 22 && line) { ctx.fillText(line, phone.x, ly); line = words[i]; ly += 12; } else line = test; } if (line) ctx.fillText(line, phone.x, ly);
      for (i = 0; i < 3; i++) { ctx.strokeStyle = 'rgba(255,255,255,' + (0.12 - i * 0.03) + ')'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; rr(sx + 9, ly + 12 + i * rh, sw - 18, 16, 6); ctx.stroke(); ctx.setLineDash([]); }
    } else {
      for (i = 0; i < shown.length; i++) {
        var rw = shown[i], tt = easeOut(clamp(rw.t, 0, 1)), yy = ry + i * rh + (1 - tt) * -10;
        ctx.globalAlpha = tt; var spr = sprites[rw.key]; if (spr) ctx.drawImage(spr, sx + 9, yy, 15, 15);
        ctx.textAlign = 'left'; ctx.font = '600 9px Sora, system-ui, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText(rw.name, sx + 29, yy + 8);
        // mini sparkline
        ctx.strokeStyle = C.brand; ctx.lineWidth = 1.2; ctx.beginPath(); for (var p2 = 0; p2 < 6; p2++) { var px2 = sx + sw - 46 + p2 * 6, py2 = yy + 12 - rw.sp[p2] * 8 * tt; if (p2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2); } ctx.stroke();
        ctx.fillStyle = C.brand2; ctx.font = '800 8px Sora, system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.fillText('▲', sx + sw - 9, yy + 8);
        ctx.globalAlpha = 1;
      }
    }
    // ekran flaşı
    if (phone.flash > 0.02) { ctx.fillStyle = rgba(C.brand, phone.flash * 0.35); ctx.fillRect(sx, sy, sw, sh); }
    ctx.restore(); // clip
    // yakalama kenarı ışığı
    ctx.fillStyle = rgba(C.brand2, 0.35 + phone.boost * 0.5); rr(x + 18, y - 1.5, w - 36, 3, 1.5); ctx.fill();
    ctx.restore();
  }

  /* ---------- parçacıklar ---------- */
  function burst(x, y, color, n) { for (var i = 0; i < n; i++) { var a = rnd(-Math.PI, 0) , sp = rnd(70, 260); parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: rnd(1.5, 3.8), c: i % 3 === 0 ? C.brand2 : color, t: 0, life: rnd(0.5, 0.95) }); } }
  function ring(x, y, color) { parts.push({ x: x, y: y, ring: true, r: 4, c: color, t: 0, life: 0.55 }); }
  function popText(x, y, s, color, size) { texts.push({ x: x, y: y, s: s, c: color || C.brand2, t: 0, life: 0.95, size: size || 15 }); }
  function celebrate(x, y) {
    var cols = [C.brand, C.brand2, '#ffffff', '#F7931A', '#627EEA', '#ffd166'];
    for (var i = 0; i < 130; i++) { var a = rnd(-Math.PI * 0.95, -Math.PI * 0.05), sp = rnd(200, 460); confetti.push({ x: x + rnd(-40, 40), y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, w: rnd(4, 9), h: rnd(2.5, 5), rot: rnd(0, 6.28), vr: rnd(-10, 10), c: cols[i % cols.length], t: 0, life: rnd(1.7, 2.9) }); }
  }

  /* ---------- oyun akışı ---------- */
  function catchCoin(c) {
    c.state = 'caught'; c.ct = 0; c.fx = c.x; c.fy = c.y;
    phone.dip = 1; phone.flash = 1; shake = 1; setScore(score + 1); combo++;
    rows.push({ key: c.key, name: c.name, t: 0, sp: [0.3, 0.45, 0.35, 0.6, 0.55, 0.85] });
    burst(c.x, PY - 2, c.color, 16); ring(c.x, PY, c.color);
    popText(phone.x, PY - 14, '+1', C.brand2, 16);
    if (combo >= 2) popText(phone.x, PY - 34, K.combo.replace('{n}', combo), '#fff', 12 + Math.min(combo, 5));
    chart.glow = 1; chart.v = clamp(chart.v + 4 + combo, 2, 46); chart.pts[chart.pts.length - 1] = chart.v;
    track('coin_catch');
    if (score >= G.target) win();
  }
  function win() {
    setMode('win'); winAt = now; phone.boost = 0;
    if (els.ctaText) els.ctaText.textContent = K.winCta;
    if (!RM) { celebrate(phone.x, PY); shake = 1.4; }
    for (var i = 0; i < coins.length; i++) if (coins[i].state === 'fall') coins[i].state = 'gone';
    track('game_win');
  }
  function resetGame(byUser) {
    setScore(0); combo = 0; rows.length = 0; confetti.length = 0;
    if (els.ctaText) els.ctaText.textContent = K.cta;
    for (var i = 0; i < coins.length; i++) if (coins[i].state !== 'caught') coins[i].state = 'gone';
    dropAcc = G.dropPlay * 0.6; idleSince = now;
    setMode(pointer.inside || kb ? 'play' : 'idle');
    if (byUser) track('replay');
  }
  function interact() {
    if (!interacted) { interacted = true; track('interaction'); }
    if (mode === 'rest' || mode === 'idle') { setMode('play'); if (!playStarted) { playStarted = true; track('game_start'); } dropAcc = clamp(dropAcc, 0, G.dropPlay * 0.5); }
    if (!running) startLoop();
  }
  function boost() {
    if (mode !== 'play' && mode !== 'idle') return;
    phone.boost = 1; track('boost');
    waves.push({ t: 0, life: 0.7 }); waves.push({ t: -0.15, life: 0.7 });
  }

  /* ---------- güncelleme ---------- */
  function update(dt) {
    var i, c;
    chart.pulse += dt * 4;
    var live = mode !== 'rest';
    if (live) {
      chart.off += dt * 20; while (chart.off >= chart.step) { chart.off -= chart.step; chart.pts.shift(); chart.pts.push(nextV()); }
      candleAcc += dt * 1000; if (candleAcc >= 900) { candleAcc -= 900; candles.shift(); candles.push(newCandle()); }
      var lastC = candles[candles.length - 1]; if (lastC.t < 1) lastC.t = Math.min(1, lastC.t + dt * 1.4);
      for (i = 0; i < bokeh.length; i++) { var b = bokeh[i]; b.y -= b.vy * dt; b.x += b.vx * dt; if (b.y < -4) { b.y = H + 4; b.x = rnd(0, W); } }
      for (i = 0; i < far.length; i++) { far[i].y -= far[i].vy * dt; far[i].sp += dt * 0.35; if (far[i].y < -70) { far[i].y = H + 70; far[i].x = rnd(330, W - 40); } }
    }
    // paralaks hedefi
    var tpx = pointer.inside ? (pointer.x - W / 2) / (W / 2) * 7 : 0, tpy = pointer.inside ? (pointer.y - H / 2) / (H / 2) * 4 : 0;
    if (RM) tpx = tpy = 0;
    par.x += (tpx - par.x) * Math.min(1, dt * 4); par.y += (tpy - par.y) * Math.min(1, dt * 4);
    chart.glow = Math.max(0, chart.glow - dt * 1.6);
    phone.dip = Math.max(0, phone.dip - dt * 4); phone.flash = Math.max(0, phone.flash - dt * 3);
    phone.boost = Math.max(0, phone.boost - dt * (1000 / G.boostMs));
    shake = Math.max(0, shake - dt * 5);
    phone.rise = RM ? 1 : clamp((tIntro - 2000) / 700, 0, 1); if (mode !== 'intro') phone.rise = 1;

    // telefon hedefi
    var half = phone.w / 2 * (1 + 0.28 * phone.boost);
    if (mode === 'play') { if (!kb) phone.tx = pointer.x; }
    else if (mode === 'idle' || mode === 'win') {
      var best = null;
      for (i = 0; i < coins.length; i++) { c = coins[i]; if (c.state === 'fall' && c.y > 20 && (!best || c.y > best.y)) best = c; }
      var demoCap = score < G.target - 2;
      var goal = best ? (demoCap ? best.x + Math.sin(now / 900) * 10 : (best.x < (PX0 + PX1) / 2 ? PX1 - 70 : PX0 + 70)) : (PX0 + PX1) / 2 + Math.sin(now / 1400) * 60;
      var maxStep = 175 * dt; phone.tx += clamp(goal - phone.tx, -maxStep, maxStep);
    }
    phone.tx = clamp(phone.tx, PX0 + half, PX1 - half);
    var px0 = phone.x;
    phone.x += (phone.tx - phone.x) * (mode === 'play' ? Math.min(1, dt * 16) : Math.min(1, dt * 7));
    phone.vx = dt > 0 ? (phone.x - px0) / dt : 0;
    phone.tilt += (clamp(phone.vx / 2600, -0.09, 0.09) - phone.tilt) * Math.min(1, dt * 8);

    // coinler
    hoverCoin = null;
    for (i = coins.length - 1; i >= 0; i--) {
      c = coins[i];
      if (c.state === 'float') {
        var tt = clamp((tIntro - c.born) / c.dur, 0, 1); if (RM) tt = 1;
        var e = easeBack(tt);
        c.x = lerp(c.sx, c.ax, e) + par.x * 0.6; c.y = lerp(c.sy, c.ay, e) + (tt >= 1 ? Math.sin(now / 700 + c.ph) * 4 : 0) + par.y * 0.6;
        var hov = pointer.inside && mode !== 'intro' && Math.abs(pointer.x - c.x) < c.r + 6 && Math.abs(pointer.y - c.y) < c.r + 6;
        c.hover += ((hov ? 1 : 0) - c.hover) * Math.min(1, dt * 10); if (hov) hoverCoin = c;
        c.spin += dt * (tt < 1 ? 7 : 0.9 + c.hover * 3);
      } else if (c.state === 'fall') {
        if (!live) continue;
        c.vy += G.gravity * dt; c.y += c.vy * dt; c.x += c.vx * dt; c.spin += dt * c.vs;
        if (phone.boost > 0.05 && c.y > PY - 130 && Math.abs(c.x - phone.x) < 150) { c.vx += (phone.x - c.x) * 8 * dt * phone.boost; c.x += (phone.x - c.x) * 3.2 * dt * phone.boost; }
        if (c.x < PX0 + c.r) { c.x = PX0 + c.r; c.vx = Math.abs(c.vx); } else if (c.x > PX1 - c.r) { c.x = PX1 - c.r; c.vx = -Math.abs(c.vx); }
        if (c.vy > 0 && c.y + c.r >= PY - 2 && c.y - c.r <= PY + 12 && Math.abs(c.x - phone.x) <= half - 6 + c.r * 0.35 && mode !== 'win' && phone.rise >= 1) { catchCoin(c); continue; }
        if (c.y - c.r > H + 6) { coins.splice(i, 1); if (mode !== 'win') { ring(c.x, H - 2, c.color); combo = 0; track('coin_miss'); } }
      } else if (c.state === 'caught') {
        c.ct += dt / 0.32; var k = easeOut(clamp(c.ct, 0, 1));
        c.x = lerp(c.fx, phone.x, k); c.y = lerp(c.fy, PY + 34, k); c.spin += dt * 12;
        if (c.ct >= 1) coins.splice(i, 1);
      } else if (c.state === 'gone') { c.ct += dt / 0.35; c.y += 40 * dt; if (c.ct >= 1) coins.splice(i, 1); }
    }
    // düşürme
    var spawning = (mode === 'play') || (mode === 'idle' && !RM);
    if (spawning) { dropAcc += dt * 1000; var iv = mode === 'play' ? G.dropPlay : G.dropIdle; if (dropAcc >= iv) { dropAcc -= iv; spawn(); } }
    for (i = 0; i < rows.length; i++) rows[i].t = Math.min(1.2, rows[i].t + dt * 2.6);
    for (i = parts.length - 1; i >= 0; i--) { var p = parts[i]; p.t += dt; if (p.t >= p.life) { parts.splice(i, 1); continue; } if (!p.ring) { p.vy += 340 * dt; p.x += p.vx * dt; p.y += p.vy * dt; } }
    for (i = texts.length - 1; i >= 0; i--) { texts[i].t += dt; if (texts[i].t >= texts[i].life) texts.splice(i, 1); }
    for (i = waves.length - 1; i >= 0; i--) { waves[i].t += dt; if (waves[i].t >= waves[i].life) waves.splice(i, 1); }
    for (i = confetti.length - 1; i >= 0; i--) { var f = confetti[i]; f.t += dt; if (f.t >= f.life || f.y > H + 20) { confetti.splice(i, 1); continue; } f.vy += 260 * dt; f.vx *= (1 - 1.6 * dt); f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }

    if (mode === 'intro' && tIntro >= T.intro) { setMode('idle'); idleSince = now; dropAcc = G.dropIdle * 0.7; }
    if (mode === 'win' && now - winAt >= G.winHold) resetGame(false);
    if (mode === 'idle' && G.maxAutoplay > 0 && now - restAnchor >= G.maxAutoplay) { setMode('rest'); for (i = 0; i < coins.length; i++) if (coins[i].state === 'fall') coins[i].state = 'gone'; }
    ad.style.cursor = hoverCoin ? 'pointer' : '';
  }

  /* ---------- çizim ---------- */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!bg) buildBg();
    ctx.save();
    if (shake > 0.01 && !RM) ctx.translate((Math.random() - 0.5) * 4 * shake, (Math.random() - 0.5) * 3 * shake);
    ctx.drawImage(bg, 0, 0, W, H);
    var i;
    drawFar();
    for (i = 0; i < bokeh.length; i++) { var b = bokeh[i]; ctx.fillStyle = rgba(C.brand2, b.a); ctx.beginPath(); ctx.arc(b.x + par.x * 0.5, b.y + par.y * 0.5, b.r, 0, Math.PI * 2); ctx.fill(); }
    drawCandles(RM ? 1 : clamp(tIntro / 1500, 0, 1));
    drawChart(RM ? 1 : clamp(tIntro / 1800, 0, 1));
    drawSpotlight();
    var c;
    for (i = 0; i < coins.length; i++) { c = coins[i]; if (c === hoverCoin) continue; if (c.state === 'float' || c.state === 'fall') drawCoin(c); else if (c.state === 'gone') drawCoin(c, 1 - c.ct); }
    drawPhone();
    if (hoverCoin) drawCoin(hoverCoin);
    for (i = 0; i < coins.length; i++) if (coins[i].state === 'caught') drawCoin(coins[i], 1 - coins[i].ct * 0.6, 1 - coins[i].ct * 0.7);
    for (i = 0; i < parts.length; i++) {
      var p = parts[i], k = p.t / p.life;
      if (p.ring) { ctx.strokeStyle = rgba(/^#[0-9a-fA-F]{6}$/.test(p.c) ? p.c : C.brand2, (1 - k) * 0.8); ctx.lineWidth = 2 * (1 - k) + 0.5; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r + k * 30, (p.r + k * 30) * 0.4, 0, 0, Math.PI * 2); ctx.stroke(); }
      else { ctx.globalAlpha = 1 - k; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (i = 0; i < texts.length; i++) { var t = texts[i], kk = t.t / t.life; ctx.globalAlpha = 1 - kk * kk; ctx.font = '800 ' + t.size + 'px Sora, system-ui, sans-serif'; ctx.fillStyle = t.c; ctx.fillText(t.s, t.x, t.y - kk * 44); }
    ctx.globalAlpha = 1;
    for (i = 0; i < confetti.length; i++) { var f = confetti[i]; ctx.save(); ctx.globalAlpha = clamp(1 - (f.t / f.life - 0.7) / 0.3, 0, 1); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillStyle = f.c; ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h); ctx.restore(); }
    ctx.restore();
  }

  function frame(ts) {
    if (!running) return;
    now = ts; var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    if (!paused && !hidden) { if (mode === 'intro') tIntro = ts - t0; update(dt); draw(); }
    if (mode === 'rest') { draw(); running = false; return; }
    requestAnimationFrame(frame);
  }
  function startLoop() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }

  /* ---------- olaylar ---------- */
  function pos(e) { var r = ad.getBoundingClientRect(); return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) }; }
  function movePointer(p, fromTouch) { pointer.x = p.x; pointer.y = p.y; pointer.inside = true; kb = false; if (mode !== 'intro' && mode !== 'win' && mode !== 'boot') interact(); else if (!interacted) { interacted = true; track('interaction'); } if (fromTouch && !running) startLoop(); }
  ad.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; movePointer(pos(e)); });
  ad.addEventListener('pointerleave', function () { pointer.inside = false; restAnchor = now; if (mode === 'play') { setMode('idle'); idleSince = now; } });
  ad.addEventListener('touchstart', function (e) { if (e.touches && e.touches[0]) movePointer(pos(e.touches[0]), true); }, { passive: true });
  ad.addEventListener('touchmove', function (e) { if (e.touches && e.touches[0]) movePointer(pos(e.touches[0]), true); }, { passive: true });
  ad.addEventListener('touchend', function () { pointer.inside = false; restAnchor = now; if (mode === 'play') { setMode('idle'); idleSince = now; } }, { passive: true });
  ad.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest && t.closest('.replay')) { e.stopPropagation(); resetGame(true); return; }
    if (t.closest && t.closest('.exit')) { openLink(t.closest('.badge') ? 'Kampanya' : t.closest('.brand') ? 'Logo' : t.closest('.cta2') ? 'Uygulama' : 'CTA'); return; }
    var p = pos(e), inField = p.x >= PX0 - 20 && p.x <= PX1 + 20;
    if (D.brand.clickThroughEverywhere || !inField || mode === 'win' || mode === 'intro' || mode === 'boot') { openLink('Banner'); return; }
    interact();
    if (hoverCoin) { dropFloater(hoverCoin); popText(hoverCoin.x, hoverCoin.y - 26, '↓', C.brand2, 14); track('coin_tap'); hoverCoin = null; return; }
    boost();
  });
  ad.addEventListener('keydown', function (e) {
    if (e.target !== ad) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('badge')) { e.preventDefault(); openLink('Kampanya'); } return; }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); kb = true; if (mode !== 'intro' && mode !== 'boot' && mode !== 'win') interact(); phone.tx += e.key === 'ArrowLeft' ? -48 : 48; }
    else if (e.key === ' ') { e.preventDefault(); if (mode === 'win') resetGame(true); else { kb = true; interact(); boost(); } }
    else if (e.key === 'Enter') { openLink('CTA'); }
  });
  ad.addEventListener('blur', function () { if (kb) { kb = false; restAnchor = now; if (mode === 'play' && !pointer.inside) { setMode('idle'); idleSince = now; } } });
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; if (!hidden) { last = performance.now(); if (!running && mode !== 'rest') startLoop(); } });
  window.addEventListener('message', function (e) { var m = e.data; if (m === 'pause') paused = true; else if (m === 'play') { paused = false; last = performance.now(); if (!running && mode !== 'rest') startLoop(); } else if (m === 'restart') location.reload(); });

  /* ---------- başlatma ---------- */
  var started = false;
  function start() {
    if (started) return; started = true;
    buildBg(); seedFloaters();
    t0 = performance.now(); now = t0; tIntro = 0; restAnchor = t0;
    if (RM) { ad.classList.add('is-static', 'is-in'); tIntro = T.intro; phone.rise = 1; setMode('idle'); idleSince = t0; }
    else { ad.classList.add('is-in'); setMode('intro'); }
    setScore(0); startLoop();
  }
  function ready() {
    if (document.fonts && document.fonts.load) {
      var done = false, go = function () { if (!done) { done = true; setTimeout(start, 30); } };
      Promise.all([document.fonts.load('800 30px Sora'), document.fonts.load('600 11px Sora')]).then(go, go);
      setTimeout(go, 1500);
    } else setTimeout(start, 200);
  }
  if (document.readyState === 'complete') ready(); else window.addEventListener('load', ready);
  setTimeout(start, 3200);

  window.paribuMasthead = {
    state: function () { return { mode: mode, score: score, combo: combo, interacted: interacted, phone: { x: phone.x, w: phone.w, rise: phone.rise }, rows: rows.map(function (r) { return r.key; }), hover: hoverCoin ? hoverCoin.key : null, coins: coins.map(function (c) { return { key: c.key, state: c.state, x: Math.round(c.x), y: Math.round(c.y) }; }), loadedSprites: loaded }; },
    spawn: function (x) { return spawn(x); }, reset: function () { resetGame(true); }, openLink: openLink, track: track
  };
})();
