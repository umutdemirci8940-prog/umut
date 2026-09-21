/* Paribu 970x250 interaktif masthead – tarayıcı motoru (ES5). veri nesnesi derlemede JSON ile yerleştirilir. */
(function () {
  'use strict';
  var D = __DATA__;
  var W = 970, H = 250;
  var ad = document.getElementById('ad'), cv = document.getElementById('cv'), ctx = cv.getContext('2d');
  var DPR = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * DPR; cv.height = H * DPR; cv.style.width = W + 'px'; cv.style.height = H + 'px'; ctx.scale(DPR, DPR);
  var RM = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var TOUCH = ('ontouchstart' in window) && !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
  var G = D.game, T = D.timing, C = D.colors;
  var PX0 = 352, PX1 = 772, WY = 200, WH = 30, COIN_R = 17;

  function q(s) { return ad.querySelector(s); }
  var els = { prompt: q('.prompt'), promptText: q('.prompt span'), ctaText: q('.cta b'), slots: q('.slots'), score: q('.pl b'), replay: q('.replay') };
  if (TOUCH && els.promptText) els.promptText.textContent = D.copy.promptTouch;

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

  /* ---------- sprite'lar ---------- */
  var sprites = {}, symbolImg = null, loaded = 0;
  function makeSprite(key, uri, color) {
    var im = new Image();
    im.onload = function () {
      var s = 64, oc = document.createElement('canvas'); oc.width = s * DPR; oc.height = s * DPR;
      var o = oc.getContext('2d'); o.scale(DPR, DPR);
      o.drawImage(im, 4, 4, s - 8, s - 8);
      // kenar halkası + parlama
      o.lineWidth = 2.2; o.strokeStyle = shade(color, -0.35); o.beginPath(); o.arc(s / 2, s / 2, s / 2 - 5, 0, Math.PI * 2); o.stroke();
      var g = o.createRadialGradient(s * 0.36, s * 0.3, 2, s / 2, s / 2, s / 2 - 4);
      g.addColorStop(0, 'rgba(255,255,255,.32)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.18)');
      o.fillStyle = g; o.beginPath(); o.arc(s / 2, s / 2, s / 2 - 4, 0, Math.PI * 2); o.fill();
      sprites[key] = oc; loaded++;
    };
    im.src = uri;
  }
  for (var ci = 0; ci < D.coins.length; ci++) makeSprite(D.coins[ci].key, D.coins[ci].uri, D.coins[ci].color);
  if (D.symbol) { symbolImg = new Image(); symbolImg.src = D.symbol; }

  /* ---------- durum ---------- */
  var mode = 'boot', t0 = 0, now = 0, last = 0, tIntro = 0, running = false, hidden = false, paused = false;
  var pointer = { x: -1, inside: false }, kb = false, interacted = false, idleSince = 0, restAnchor = 0, winAt = 0, playStarted = false;
  var wallet = { x: (PX0 + PX1) / 2, tx: (PX0 + PX1) / 2, w: G.walletWidth, squash: 0, boost: 0, check: 0 };
  var coins = [], parts = [], texts = [], confetti = [], score = 0, dropAcc = 0, lastKey = -1, lastX = (PX0 + PX1) / 2;
  var chart = { pts: [], v: 12, off: 0, glow: 0, step: (W + 40) / 149, pulse: 0 }, bokeh = [], bg = null;

  function setMode(m) { mode = m; ad.setAttribute('data-mode', m); ad.classList.toggle('is-playing', m === 'play'); ad.classList.toggle('is-win', m === 'win'); ad.classList.toggle('is-rest', m === 'rest'); }
  function setScore(s) { score = s; ad.setAttribute('data-score', s); if (els.score) els.score.textContent = s + '/' + G.target; }

  /* ---------- grafik (arka plan çizgisi) ---------- */
  function nextV() { chart.v = clamp(chart.v + 0.26 + (Math.random() - 0.5) * 3.2, 2, 46); return chart.v; }
  for (var pi = 0; pi < 150; pi++) chart.pts.push(nextV());
  for (var bi = 0; bi < 22; bi++) bokeh.push({ x: rnd(0, W), y: rnd(0, H), r: rnd(0.8, 2.4), a: rnd(0.12, 0.42), vy: rnd(4, 12), vx: rnd(-3, 3) });

  function buildBg() {
    var oc = document.createElement('canvas'); oc.width = W * DPR; oc.height = H * DPR; var o = oc.getContext('2d'); o.scale(DPR, DPR);
    var g = o.createLinearGradient(0, 0, W, H); g.addColorStop(0, C.bg2); g.addColorStop(0.55, C.bg); g.addColorStop(1, C.bg2);
    o.fillStyle = g; o.fillRect(0, 0, W, H);
    var rg = o.createRadialGradient(600, 150, 10, 600, 150, 360); rg.addColorStop(0, rgba(C.brand, 0.2)); rg.addColorStop(0.5, rgba(C.brand, 0.06)); rg.addColorStop(1, rgba(C.brand, 0));
    o.fillStyle = rg; o.fillRect(0, 0, W, H);
    var rg2 = o.createRadialGradient(120, 40, 10, 120, 40, 300); rg2.addColorStop(0, 'rgba(60,110,220,.16)'); rg2.addColorStop(1, 'rgba(60,110,220,0)');
    o.fillStyle = rg2; o.fillRect(0, 0, W, H);
    o.strokeStyle = 'rgba(255,255,255,.04)'; o.lineWidth = 1; o.beginPath();
    for (var x = 48.5; x < W; x += 48.5) { o.moveTo(Math.round(x) + 0.5, 0); o.lineTo(Math.round(x) + 0.5, H); }
    for (var y = 50; y < H; y += 50) { o.moveTo(0, y + 0.5); o.lineTo(W, y + 0.5); }
    o.stroke();
    // oyun alanı zemini (hafif)
    var pg = o.createLinearGradient(0, 0, 0, H); pg.addColorStop(0, 'rgba(255,255,255,0)'); pg.addColorStop(1, 'rgba(255,255,255,.035)');
    o.fillStyle = pg; o.fillRect(PX0 - 14, 0, PX1 - PX0 + 28, H);
    o.fillStyle = 'rgba(255,255,255,.06)'; o.fillRect(PX0 - 14, H - 1, PX1 - PX0 + 28, 1);
    bg = oc;
  }

  function drawChart(prog) {
    var n = chart.pts.length, st = chart.step, base = H - 18, sc = 2.35;
    var xs = [], ys = [];
    for (var i = 0; i < n; i++) { xs.push(-20 + i * st - chart.off); ys.push(base - chart.pts[i] * sc); }
    var lim = Math.floor((n - 1) * prog);
    if (lim < 2) return;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(xs[0], ys[0]);
    for (i = 1; i <= lim; i++) { var xc = (xs[i - 1] + xs[i]) / 2, yc = (ys[i - 1] + ys[i]) / 2; ctx.quadraticCurveTo(xs[i - 1], ys[i - 1], xc, yc); }
    ctx.lineTo(xs[lim], ys[lim]);
    // dolgu
    ctx.lineTo(xs[lim], H); ctx.lineTo(xs[0], H); ctx.closePath();
    var fg = ctx.createLinearGradient(0, base - 46 * sc, 0, H); fg.addColorStop(0, rgba(C.brand, 0.16 + chart.glow * 0.12)); fg.addColorStop(1, rgba(C.brand, 0));
    ctx.fillStyle = fg; ctx.fill();
    // çizgi
    ctx.beginPath(); ctx.moveTo(xs[0], ys[0]);
    for (i = 1; i <= lim; i++) { xc = (xs[i - 1] + xs[i]) / 2; yc = (ys[i - 1] + ys[i]) / 2; ctx.quadraticCurveTo(xs[i - 1], ys[i - 1], xc, yc); }
    ctx.lineTo(xs[lim], ys[lim]);
    var lg = ctx.createLinearGradient(0, 0, W, 0); lg.addColorStop(0, rgba(C.brand, 0.1)); lg.addColorStop(0.36, rgba(C.brand, 0.42)); lg.addColorStop(1, rgba(C.brand2, 0.95));
    ctx.strokeStyle = lg; ctx.lineWidth = 1.6 + chart.glow * 1.4; ctx.lineJoin = 'round';
    if (chart.glow > 0.02) { ctx.shadowColor = rgba(C.brand, 0.9); ctx.shadowBlur = 14 * chart.glow; }
    ctx.stroke();
    // uç noktası
    var ex = xs[lim], ey = ys[lim], pr = 3 + Math.sin(chart.pulse) * 0.8;
    ctx.shadowBlur = 0;
    ctx.fillStyle = rgba(C.brand2, 0.25 + chart.glow * 0.3); ctx.beginPath(); ctx.arc(ex, ey, pr * 3.2, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.brand2; ctx.beginPath(); ctx.arc(ex, ey, pr, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  /* ---------- coinler ---------- */
  function anchors() {
    var out = [], n = D.coins.length;
    for (var i = 0; i < n; i++) { var t = n === 1 ? 0.5 : i / (n - 1); out.push({ x: lerp(PX0 + 36, PX1 - 36, t), y: 96 + Math.sin(t * Math.PI) * -34 + (i % 2) * 22 }); }
    return out;
  }
  function seedFloaters() {
    var an = anchors();
    for (var i = 0; i < D.coins.length; i++) {
      coins.push({ key: D.coins[i].key, color: D.coins[i].color, state: 'float', x: W + 60 + i * 30, y: an[i].y, ax: an[i].x, ay: an[i].y, sx: W + 60 + i * 30, sy: an[i].y - 60 + i * 12, ph: rnd(0, 6.28), spin: rnd(0, 6.28), vs: rnd(1.2, 2.2), r: COIN_R, born: 900 + i * 150, dur: 780, vx: 0, vy: 0, ct: 0 });
    }
  }
  function pickKey() { var k; do { k = Math.floor(Math.random() * D.coins.length); } while (D.coins.length > 1 && k === lastKey); lastKey = k; return D.coins[k]; }
  function spawn(x) {
    // önce yüzen coinlerden biri düşer; kalmadıysa üstten yenisi gelir
    for (var i = 0; i < coins.length; i++) if (coins[i].state === 'float') { var f = coins[i]; f.state = 'fall'; f.vy = 0; f.vx = rnd(-14, 14); f.spin = rnd(0, 6.28); return f; }
    var c = pickKey(), nx;
    if (typeof x === 'number') nx = clamp(x, PX0 + 24, PX1 - 24);
    else { do { nx = rnd(PX0 + 28, PX1 - 28); } while (Math.abs(nx - lastX) < 70); }
    lastX = nx;
    var o = { key: c.key, color: c.color, state: 'fall', x: nx, y: -COIN_R - 6, vx: rnd(-16, 16), vy: rnd(0, 30), spin: rnd(0, 6.28), vs: rnd(1.4, 2.6), r: COIN_R, ct: 0 };
    coins.push(o); return o;
  }
  function drawCoin(c, alpha, scale) {
    var sp = sprites[c.key]; if (!sp) return;
    var sx = Math.cos(c.spin); var ax = Math.abs(sx); if (ax < 0.18) ax = 0.18;
    var s = (scale || 1), r = c.r * s;
    ctx.save(); ctx.globalAlpha = alpha == null ? 1 : alpha; ctx.translate(c.x, c.y);
    // gölge
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(2, 4, r * ax * 0.95, r * 0.95, 0, 0, Math.PI * 2); ctx.fill();
    // kenar (dönerken görünen kalınlık)
    if (ax < 0.9) { ctx.fillStyle = shade(c.color, -0.45); ctx.beginPath(); ctx.ellipse(sx < 0 ? -2.5 * (1 - ax) : 2.5 * (1 - ax), 0, r * ax + 2.5 * (1 - ax), r, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.scale(ax, 1);
    ctx.drawImage(sp, -r, -r, r * 2, r * 2);
    ctx.restore();
  }

  /* ---------- cüzdan ---------- */
  function drawWallet() {
    var w = wallet.w * (1 + 0.55 * wallet.boost), h = WH, y = WY + wallet.squash * 4, x = wallet.x - w / 2;
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,.4)'; rr(x + 2, y + 6, w, h, 10); ctx.fill();
    var g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, C.brand2); g.addColorStop(0.35, C.brand); g.addColorStop(1, C.brandDark);
    if (wallet.boost > 0.02) { ctx.shadowColor = rgba(C.brand, 0.8); ctx.shadowBlur = 18 * wallet.boost; }
    ctx.fillStyle = g; rr(x, y, w, h, 10); ctx.fill(); ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(0,0,0,.38)'; rr(x + 12, y + 5, w - 24, 5, 2.5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.28)'; rr(x + 12, y + 5, w - 24, 1.5, 1); ctx.fill();
    // sembol
    var cx = wallet.x, cy = y + 20;
    if (wallet.check > 0.02) {
      ctx.strokeStyle = 'rgba(255,255,255,' + wallet.check + ')'; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 7, cy); ctx.lineTo(cx - 2, cy + 4.5); ctx.lineTo(cx + 7, cy - 5); ctx.stroke();
    } else if (symbolImg && symbolImg.complete && symbolImg.naturalWidth) {
      ctx.drawImage(symbolImg, cx - 8, cy - 8, 16, 16);
    } else {
      ctx.fillStyle = '#fff'; ctx.font = '800 13px Sora, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(D.brand.name.charAt(0).toUpperCase(), cx, cy + 0.5);
    }
    ctx.restore();
  }

  /* ---------- parçacıklar ---------- */
  function burst(x, y, color, n) {
    for (var i = 0; i < n; i++) { var a = rnd(0, Math.PI * 2), sp = rnd(60, 220); parts.push({ x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, r: rnd(1.5, 3.6), c: i % 3 === 0 ? C.brand2 : color, t: 0, life: rnd(0.5, 0.9) }); }
  }
  function ring(x, y, color) { parts.push({ x: x, y: y, ring: true, r: 4, c: color, t: 0, life: 0.55 }); }
  function popText(x, y, s, color) { texts.push({ x: x, y: y, s: s, c: color || C.brand2, t: 0, life: 0.9 }); }
  function celebrate(x, y) {
    var cols = [C.brand, C.brand2, '#ffffff', '#F7931A', '#627EEA', '#ffd166'];
    for (var i = 0; i < 110; i++) { var a = rnd(-Math.PI * 0.95, -Math.PI * 0.05), sp = rnd(180, 420); confetti.push({ x: x + rnd(-30, 30), y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, w: rnd(4, 8), h: rnd(2.5, 4.5), rot: rnd(0, 6.28), vr: rnd(-9, 9), c: cols[i % cols.length], t: 0, life: rnd(1.6, 2.7) }); }
  }

  /* ---------- oyun akışı ---------- */
  function addSlot(c) {
    var slot = els.slots && els.slots.children[score - 1]; if (!slot) return;
    var coin = null; for (var i = 0; i < D.coins.length; i++) if (D.coins[i].key === c.key) coin = D.coins[i];
    slot.className = 'slot is-on'; slot.style.backgroundImage = coin ? 'url("' + coin.uri + '")' : ''; slot.setAttribute('title', coin ? coin.name : '');
  }
  function clearSlots() { if (!els.slots) return; for (var i = 0; i < els.slots.children.length; i++) { els.slots.children[i].className = 'slot'; els.slots.children[i].style.backgroundImage = ''; } }
  function catchCoin(c) {
    c.state = 'caught'; c.ct = 0; c.fx = c.x; c.fy = c.y;
    wallet.squash = 1; setScore(score + 1); addSlot(c);
    burst(c.x, WY, c.color, 14); popText(wallet.x, WY - 8, '+1');
    chart.glow = 1; chart.v = clamp(chart.v + 5, 2, 46); chart.pts[chart.pts.length - 1] = chart.v;
    track('coin_catch');
    if (score >= G.target) win();
  }
  function win() {
    setMode('win'); winAt = now; wallet.check = 1; wallet.boost = 0;
    if (els.ctaText) els.ctaText.textContent = D.copy.winCta;
    if (!RM) celebrate(wallet.x, WY);
    for (var i = 0; i < coins.length; i++) if (coins[i].state === 'fall') coins[i].state = 'gone';
    track('game_win');
  }
  function resetGame(byUser) {
    setScore(0); clearSlots(); wallet.check = 0; confetti.length = 0;
    if (els.ctaText) els.ctaText.textContent = D.copy.cta;
    for (var i = 0; i < coins.length; i++) if (coins[i].state !== 'caught') coins[i].state = 'gone';
    dropAcc = G.dropPlay * 0.6; idleSince = now;
    setMode(pointer.inside || kb ? 'play' : 'idle');
    if (byUser) track('replay');
  }
  function interact() {
    if (!interacted) { interacted = true; track('interaction'); }
    if (mode === 'rest' || mode === 'idle') { setMode('play'); if (!playStarted) { playStarted = true; track('game_start'); } dropAcc = Math.max(dropAcc, G.dropPlay * 0.5); }
    if (!running) startLoop();
  }
  function boost() {
    if (mode !== 'play' && mode !== 'idle') return;
    wallet.boost = 1; track('boost');
    ring(wallet.x, WY + WH / 2, C.brand2);
  }

  /* ---------- güncelleme ---------- */
  function update(dt) {
    var i, c;
    chart.pulse += dt * 4;
    if (mode !== 'rest') {
      chart.off += dt * 20; while (chart.off >= chart.step) { chart.off -= chart.step; chart.pts.shift(); chart.pts.push(nextV()); }
      for (i = 0; i < bokeh.length; i++) { var b = bokeh[i]; b.y -= b.vy * dt; b.x += b.vx * dt; if (b.y < -4) { b.y = H + 4; b.x = rnd(0, W); } }
    }
    chart.glow = Math.max(0, chart.glow - dt * 1.6);
    wallet.squash = Math.max(0, wallet.squash - dt * 4);
    wallet.boost = Math.max(0, wallet.boost - dt * (1000 / G.boostMs));
    if (mode === 'win') wallet.check = Math.min(1, wallet.check + dt * 3);

    // cüzdan hedefi
    var half = wallet.w * (1 + 0.55 * wallet.boost) / 2;
    if (mode === 'play') {
      if (!kb) wallet.tx = pointer.x;
    } else if (mode === 'idle' || mode === 'win') {
      // otomatik gösteri: en aşağıdaki düşen coine yönel (sınırlı hızla → bazen kaçırır)
      var best = null;
      for (i = 0; i < coins.length; i++) { c = coins[i]; if (c.state === 'fall' && c.y > 20 && (!best || c.y > best.y)) best = c; }
      var demoCap = score < G.target - 2;   // gösteri kazanmaz: son iki coini kullanıcıya bırakır
      var goal = best ? (demoCap ? best.x + Math.sin(now / 900) * 10 : (best.x < (PX0 + PX1) / 2 ? PX1 - 60 : PX0 + 60)) : (PX0 + PX1) / 2 + Math.sin(now / 1400) * 60;
      var maxStep = 175 * dt;
      wallet.tx += clamp(goal - wallet.tx, -maxStep, maxStep);
    }
    wallet.tx = clamp(wallet.tx, PX0 + half, PX1 - half);
    wallet.x += (wallet.tx - wallet.x) * (mode === 'play' ? Math.min(1, dt * 16) : Math.min(1, dt * 7));

    // düşürme
    var spawning = (mode === 'play') || (mode === 'idle' && !RM);
    if (spawning) {
      dropAcc += dt * 1000;
      var iv = mode === 'play' ? G.dropPlay : G.dropIdle;
      if (dropAcc >= iv) { dropAcc -= iv; spawn(); }
    }

    // coinler
    for (i = coins.length - 1; i >= 0; i--) {
      c = coins[i];
      if (c.state === 'float') {
        var tt = clamp((tIntro - c.born) / c.dur, 0, 1);
        if (RM) tt = 1;
        var e = easeBack(tt);
        c.x = lerp(c.sx, c.ax, e); c.y = lerp(c.sy, c.ay, e) + (tt >= 1 ? Math.sin(now / 700 + c.ph) * 4 : 0);
        c.spin += dt * (tt < 1 ? 6 : 0.9);
      } else if (c.state === 'fall') {
        if (mode === 'rest') continue;
        c.vy += G.gravity * dt; c.y += c.vy * dt; c.x += c.vx * dt; c.spin += dt * c.vs;
        if (wallet.boost > 0.05 && c.y > WY - 120 && Math.abs(c.x - wallet.x) < 130) c.vx += (wallet.x - c.x) * 7 * dt * wallet.boost, c.x += (wallet.x - c.x) * 3 * dt * wallet.boost;
        if (c.x < PX0 + c.r) { c.x = PX0 + c.r; c.vx = Math.abs(c.vx); } else if (c.x > PX1 - c.r) { c.x = PX1 - c.r; c.vx = -Math.abs(c.vx); }
        if (c.vy > 0 && c.y + c.r >= WY - 1 && c.y - c.r <= WY + 10 && Math.abs(c.x - wallet.x) <= half + c.r * 0.45 && mode !== 'win') { catchCoin(c); continue; }
        if (c.y - c.r > H + 6) { coins.splice(i, 1); if (mode !== 'win') { ring(c.x, H - 2, c.color); track('coin_miss'); } }
      } else if (c.state === 'caught') {
        c.ct += dt / 0.3; var k = easeOut(clamp(c.ct, 0, 1));
        c.x = lerp(c.fx, wallet.x, k); c.y = lerp(c.fy, WY + 10, k); c.spin += dt * 10;
        if (c.ct >= 1) coins.splice(i, 1);
      } else if (c.state === 'gone') {
        c.ct += dt / 0.35; c.y += 40 * dt; if (c.ct >= 1) coins.splice(i, 1);
      }
    }
    // parçacıklar
    for (i = parts.length - 1; i >= 0; i--) { var p = parts[i]; p.t += dt; if (p.t >= p.life) { parts.splice(i, 1); continue; } if (!p.ring) { p.vy += 320 * dt; p.x += p.vx * dt; p.y += p.vy * dt; } }
    for (i = texts.length - 1; i >= 0; i--) { texts[i].t += dt; if (texts[i].t >= texts[i].life) texts.splice(i, 1); }
    for (i = confetti.length - 1; i >= 0; i--) { var f = confetti[i]; f.t += dt; if (f.t >= f.life || f.y > H + 20) { confetti.splice(i, 1); continue; } f.vy += 240 * dt; f.vx *= (1 - 1.6 * dt); f.x += f.vx * dt; f.y += f.vy * dt; f.rot += f.vr * dt; }

    // faz geçişleri
    if (mode === 'intro' && tIntro >= T.intro) { setMode('idle'); idleSince = now; dropAcc = G.dropIdle * 0.7; }
    if (mode === 'win' && now - winAt >= G.winHold) resetGame(false);
    if (mode === 'idle' && G.maxAutoplay > 0 && now - restAnchor >= G.maxAutoplay) {
      setMode('rest');
      for (i = 0; i < coins.length; i++) if (coins[i].state === 'fall') coins[i].state = 'gone';
    }
  }

  /* ---------- çizim ---------- */
  function draw() {
    ctx.clearRect(0, 0, W, H);
    if (!bg) buildBg();
    ctx.drawImage(bg, 0, 0, W, H);
    var i;
    for (i = 0; i < bokeh.length; i++) { var b = bokeh[i]; ctx.fillStyle = rgba(C.brand2, b.a); ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2); ctx.fill(); }
    drawChart(RM ? 1 : clamp(tIntro / 1800, 0, 1));
    // düşme alanı yan ışıkları (oynarken)
    if (mode === 'play') { ctx.fillStyle = 'rgba(255,255,255,.05)'; ctx.fillRect(PX0 - 14, 0, 1, H); ctx.fillRect(PX1 + 13, 0, 1, H); }
    for (i = 0; i < coins.length; i++) { var c = coins[i]; if (c.state === 'float' || c.state === 'fall') drawCoin(c); else if (c.state === 'gone') drawCoin(c, 1 - c.ct); }
    drawWallet();
    for (i = 0; i < coins.length; i++) if (coins[i].state === 'caught') drawCoin(coins[i], 1 - coins[i].ct * 0.7, 1 - coins[i].ct * 0.75);
    for (i = 0; i < parts.length; i++) {
      var p = parts[i], k = p.t / p.life;
      if (p.ring) { ctx.strokeStyle = rgba(p.c.charAt(0) === '#' && p.c.length === 7 ? p.c : C.brand2, (1 - k) * 0.8); ctx.lineWidth = 2 * (1 - k) + 0.5; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.r + k * 26, (p.r + k * 26) * 0.45, 0, 0, Math.PI * 2); ctx.stroke(); }
      else { ctx.globalAlpha = 1 - k; ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - k * 0.5), 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; }
    }
    ctx.font = '800 15px Sora, system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (i = 0; i < texts.length; i++) { var t = texts[i], kk = t.t / t.life; ctx.globalAlpha = 1 - kk * kk; ctx.fillStyle = t.c; ctx.fillText(t.s, t.x, t.y - kk * 42); }
    ctx.globalAlpha = 1;
    for (i = 0; i < confetti.length; i++) { var f = confetti[i]; ctx.save(); ctx.globalAlpha = clamp(1 - (f.t / f.life - 0.7) / 0.3, 0, 1); ctx.translate(f.x, f.y); ctx.rotate(f.rot); ctx.fillStyle = f.c; ctx.fillRect(-f.w / 2, -f.h / 2, f.w, f.h); ctx.restore(); }
  }

  function frame(ts) {
    if (!running) return;
    now = ts; var dt = Math.min(0.05, (ts - last) / 1000); last = ts;
    if (!paused && !hidden) {
      if (mode === 'intro') tIntro = ts - t0;
      update(dt); draw();
    }
    if (mode === 'rest') { draw(); running = false; return; }   // 30 sn sınırı: durağan kare; etkileşimle yeniden başlar
    requestAnimationFrame(frame);
  }
  function startLoop() { if (running) return; running = true; last = performance.now(); requestAnimationFrame(frame); }

  /* ---------- olaylar ---------- */
  function px(e) { var r = ad.getBoundingClientRect(); return (e.clientX - r.left) * (W / r.width); }
  ad.addEventListener('pointermove', function (e) { if (e.pointerType === 'touch') return; pointer.x = px(e); pointer.inside = true; kb = false; if (mode !== 'intro' && mode !== 'win' && mode !== 'boot') interact(); else if (!interacted) { interacted = true; track('interaction'); } });
  ad.addEventListener('pointerleave', function () { pointer.inside = false; restAnchor = now; if (mode === 'play') { setMode('idle'); idleSince = now; } });
  ad.addEventListener('touchstart', function (e) { if (e.touches && e.touches[0]) { pointer.x = px(e.touches[0]); pointer.inside = true; kb = false; if (mode !== 'intro' && mode !== 'boot' && mode !== 'win') interact(); } }, { passive: true });
  ad.addEventListener('touchmove', function (e) { if (e.touches && e.touches[0]) { pointer.x = px(e.touches[0]); pointer.inside = true; if (mode !== 'intro' && mode !== 'boot' && mode !== 'win') interact(); } }, { passive: true });
  ad.addEventListener('touchend', function () { pointer.inside = false; restAnchor = now; if (mode === 'play') { setMode('idle'); idleSince = now; } }, { passive: true });
  ad.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest && t.closest('.replay')) { e.stopPropagation(); resetGame(true); return; }
    if (t.closest && t.closest('.exit')) { openLink(t.closest('.badge') ? 'Kampanya' : t.closest('.brand') ? 'Logo' : 'CTA'); return; }
    var x = px(e);
    var inField = x >= PX0 - 20 && x <= PX1 + 20;
    if (D.brand.clickThroughEverywhere || !inField || mode === 'win' || mode === 'intro' || mode === 'boot') { openLink('Banner'); return; }
    interact(); boost();
  });
  ad.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); kb = true; if (mode !== 'intro' && mode !== 'boot' && mode !== 'win') interact(); wallet.tx += e.key === 'ArrowLeft' ? -46 : 46; }
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
    if (RM) { ad.classList.add('is-static', 'is-in'); tIntro = T.intro; setMode('idle'); idleSince = t0; }
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
  setTimeout(start, 3200); // emniyet: load gelmezse (srcdoc vb.)

  // Test / entegrasyon API'si
  window.paribuMasthead = {
    state: function () { return { mode: mode, score: score, interacted: interacted, wallet: { x: wallet.x, w: wallet.w }, coins: coins.map(function (c) { return { key: c.key, state: c.state, x: Math.round(c.x), y: Math.round(c.y) }; }), loadedSprites: loaded }; },
    spawn: function (x) { return spawn(x); }, reset: function () { resetGame(true); }, openLink: openLink, track: track
  };
})();
