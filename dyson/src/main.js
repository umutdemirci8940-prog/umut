// Dyson 970×250 masthead – orijinal ürün fotoğraflarından 3D modeller (WebGL) + canlı efektler (2D canvas)
import { DATA } from './data.js';
import { createProduct } from './product3d.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const lerp = (a, b, t) => a + (b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const elastic = (v, lim) => lim * Math.tanh(v / lim); // sınıra yaklaştıkça direnç
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

const ONLY = window.__MH_STAGE__ === 'floor' ? 'floor' : 'hair';
const ASSETS = (window.__MH_ASSETS__ || {})[ONLY] || {};
const D = DATA.stages[ONLY];
const W = 970, H = 250;

const mh = $('#mh'), hit = $('#hit'), glc = $('#gl'), hsLayer = $('#hotspots');
const fx = $('#fx'), floorC = $('#floor');
const dpr = Math.min(window.devicePixelRatio || 1, 2);
for (const c of [fx, floorC]) { c.width = W * dpr; c.height = H * dpr; }
const g = fx.getContext('2d'), gf = floorC.getContext('2d');
g.scale(dpr, dpr); gf.scale(dpr, dpr);

/* ─────────────── Tıklama çıkışı ─────────────── */
function exit(label) {
  if (window.Enabler && window.Enabler.exitOverride) return window.Enabler.exitOverride(label, D.url);
  if (window.Enabler && window.Enabler.exit) return window.Enabler.exit(label);
  window.open(window.clickTag || D.url, '_blank', 'noopener');
}

/* ─────────────── Ürün (fotoğraftan 3D) ─────────────── */
const P = ASSETS.product || {}; // { tex, depth, w, h, depthPx, ring | head }
const aspect = P.w && P.h ? P.w / P.h : 0.27;
let view = null; // createProduct() ile oluşur

/** Ürün kutusu (sahne koordinatı): x,y sol üst; w,h boyut; rot derece (ekran düzleminde) */
const box = { x: 0, y: 0, w: 0, h: 0, rot: 0 };
let pivotX = 0.5, pivotY = 0.5;
function placeProd() {
  if (!view) return;
  view.setBox(box, pivotX, pivotY);
  view.setRotation(S.ry, S.rx, box.rot);
}

/* ─────────────── Durum ─────────────── */
const S = {
  heat: 2, nural: true, att: 'none', power: 1, mode: 'sweep',
  rx: 0, ry: 0, dragY: 0, dragX: 0, spin: 0, dragging: false, lastX: 0, lastY: 0,
  px: 640, py: 125, pointerIn: false, interacted: false, idle: 0, t: 0, dist: 0.5,
  hx: 700, hy: 215, vx: 0, // süpürge başlığı (sahne koordinatı)
};

/* ─────────────── Arayüz ─────────────── */
function buildUI() {
  if (ONLY === 'hair') {
    $('#heats').innerHTML = D.heats.map((h, i) => `<button type="button" data-heat="${i}" style="--c:${h.color}" aria-pressed="${i === S.heat}"><i></i>${h.label}</button>`).join('');
    const atts = ASSETS.atts || {};
    $('#attachments').innerHTML = D.attachments.map((a) => `<button type="button" data-att="${a.key}" aria-pressed="${a.key === S.att}" title="${a.label}">${atts[a.key] ? `<img src="${atts[a.key]}" alt="">` : ''}${a.key === 'none' ? a.label : `<span class="sr">${a.label}</span>`}</button>`).join('');
  } else {
    $('#powers').innerHTML = D.powers.map((p, i) => `<button type="button" data-pow="${i}" aria-pressed="${i === S.power}">${p.label}</button>`).join('');
    $('#bins').innerHTML = D.bins.map((b, i) => `<div class="bin"><span>${b.label}</span><b><i data-bar="${i}"></i></b><em data-cnt="${i}">0</em></div>`).join('');
  }
  // + noktaları: 3D modelin yüzeyine her karede izdüşürülür
  for (const [k, [fxp, fyp]] of Object.entries(D.spots)) {
    const f = D.features[k]; if (!f) continue;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'hs'; b.dataset.key = k;
    b.dataset.fx = fxp; b.dataset.fy = fyp;
    b.setAttribute('aria-label', f.title); b.innerHTML = '<span></span>'; hsLayer.appendChild(b);
  }
  if (!ASSETS.video) $$('.film').forEach((b) => b.remove());
  else if (ASSETS.image) $$('.fthumb').forEach((t) => { t.style.backgroundImage = `url(${ASSETS.image})`; });
}
buildUI();
const hsEls = $$('.hs');

function pressed(sel, el) { $$(sel).forEach((b) => b.setAttribute('aria-pressed', b === el)); }
mh.addEventListener('click', (e) => {
  const t = e.target.closest('button, a'); if (!t) return;
  markInteract();
  if (t.dataset.heat) { S.heat = +t.dataset.heat; pressed('[data-heat]', t); applyHeat(); burst(); }
  else if (t.dataset.att) { pressed('[data-att]', t); setAtt(t.dataset.att); }
  else if (t.dataset.pow) { S.power = +t.dataset.pow; pressed('[data-pow]', t); $('#powerInfo').textContent = D.powers[S.power].info; }
  else if (t.id === 'nural') { S.nural = !S.nural; t.setAttribute('aria-pressed', S.nural); }
  else if (t.dataset.mode) setMode(t.dataset.mode);
  else if (t.classList.contains('hs')) openCard(t.dataset.key, t);
  else if (t.id === 'cardClose') closeCard();
  else if (t.dataset.exit) { e.preventDefault(); exit(t.dataset.label || 'CTA'); }
  else if (t.classList.contains('film')) openVideo();
  else if (t.id === 'videoClose') closeVideo();
  else if (t.id === 'reset') resetDust();
});

/* Özellik kartı – açıldığı an konumlanır */
const card = $('#card');
let cardFor = null;
function openCard(k, btn) {
  const f = D.features[k];
  $('#cardTitle').textContent = f.title; $('#cardText').textContent = f.text;
  card.hidden = false; cardFor = btn; hsEls.forEach((b) => b.classList.toggle('on', b === btn));
  const br = btn.getBoundingClientRect(), m = mh.getBoundingClientRect();
  const x = (br.left + br.width / 2 - m.left) * (W / m.width), y = (br.top + br.height / 2 - m.top) * (H / m.height);
  requestAnimationFrame(() => {
    const cw = card.offsetWidth, ch = card.offsetHeight;
    let cx = x + 18; if (cx + cw > W - 8) cx = x - cw - 18;
    card.style.transform = `translate(${clamp(cx, 8, W - cw - 8)}px, ${clamp(y - ch / 2, 8, H - ch - 8)}px)`;
    card.classList.add('show');
  });
}
function closeCard() { card.classList.remove('show'); card.hidden = true; cardFor = null; hsEls.forEach((b) => b.classList.remove('on')); }

/* Film */
function openVideo() {
  if (!ASSETS.video) return;
  const lay = $('#video'), el = $('video', lay);
  if (ASSETS.poster) el.poster = ASSETS.poster;
  if (!el.src) el.src = ASSETS.video;
  lay.hidden = false; el.currentTime = 0; el.play().catch(() => {});
}
function closeVideo() { const lay = $('#video'); $('video', lay).pause(); lay.hidden = true; }

/* ─────────────── İşaretçi ─────────────── */
function markInteract() { S.interacted = true; S.idle = 0; mh.classList.add('touched'); }
function local(e) { const r = mh.getBoundingClientRect(); return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)]; }
hit.addEventListener('pointerdown', (e) => {
  markInteract(); closeCard(); S.dragging = true; [S.lastX, S.lastY] = local(e);
  hit.setPointerCapture(e.pointerId); mh.classList.add('grabbing');
  if (sweeping()) { [S.px, S.py] = local(e); }
});
hit.addEventListener('pointermove', (e) => {
  const [x, y] = local(e);
  // + noktasına yaklaşırken eğimi dondur (nokta imlecin altından kaçmasın)
  S.nearHs = nearHotspot(x, y);
  if (!S.nearHs || S.dragging) { S.px = x; S.py = y; }
  S.pointerIn = true; S.idle = 0;
  if (sweeping()) { if (e.pointerType === 'mouse' || S.dragging) markInteract(); return; }
  if (!S.dragging) return;
  S.spin += (x - S.lastX) * 0.7; S.dragX = clamp(S.dragX - (y - S.lastY) * 0.3, -20, 20);
  S.lastX = x; S.lastY = y;
});
const endDrag = () => { S.dragging = false; mh.classList.remove('grabbing'); };
hit.addEventListener('pointerup', endDrag); hit.addEventListener('pointercancel', endDrag);
hit.addEventListener('pointerleave', (e) => { if (!(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.hs, .card'))) S.pointerIn = false; });
mh.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeCard(); closeVideo(); } });
function sweeping() { return ONLY === 'floor' && S.mode === 'sweep'; }

/* ─────────────── Hotspot yerleşimi ─────────────── */
function placeHotspots() {
  const show = view && (ONLY === 'hair' || S.mode === 'inspect');
  for (const b of hsEls) {
    let on = show, x = 0, y = 0;
    if (on) {
      const p = view.project(+b.dataset.fx, +b.dataset.fy, 0.004);
      x = p.x; y = p.y; on = p.facing > 0.2 && x > 345 && x < W - 6 && y > 6 && y < H - 6;
      b.style.transform = `translate(${x}px, ${y}px)`;
    }
    if (b._on === on) continue; b._on = on;
    b.style.opacity = on ? 1 : 0; b.style.pointerEvents = on ? 'auto' : 'none'; b.tabIndex = on ? 0 : -1;
  }
}
function nearHotspot(x, y) {
  const m = mh.getBoundingClientRect();
  return hsEls.some((b) => { if (b.style.opacity !== '1') return false; const r = b.getBoundingClientRect(); return Math.hypot(x - (r.left + r.width / 2 - m.left) * (W / m.width), y - (r.top + r.height / 2 - m.top) * (H / m.height)) < 26; });
}

/* ═══════════════ SAÇ BAKIMI ═══════════════ */
let attShow, attFlow = D.attachments ? D.attachments[0].flow : null;
const AIR = [];
function initHair() {
  // Ürün: halka üstte, filtre görünür, kablo kadraj dışına taşar
  box.h = 272; box.w = box.h * aspect; box.x = 560 - box.w / 2; box.y = 12;
  pivotX = 0.5; pivotY = 0.3; // halka ile sap arasından döner
  attShow = $('#attShow');
  const n = reduced ? 120 : 260;
  for (let i = 0; i < n; i++) AIR.push({ life: Math.random(), a: 0, r: 0, v: 0, s: 1, max: 1 });
  applyHeat();
}
function applyHeat() {
  if (ONLY !== 'hair') return;
  const h = D.heats[S.heat];
  mh.style.setProperty('--heat', h.color);
}
function setAtt(key) {
  S.att = key;
  const a = D.attachments.find((x) => x.key === key); attFlow = a.flow;
  const src = (ASSETS.atts || {})[key];
  attShow.classList.remove('on');
  if (key !== 'none' && src) {
    $('img', attShow).src = src; $('span', attShow).textContent = a.label;
    void attShow.offsetWidth; attShow.classList.add('on');
  }
  burst();
}
let burstT = 0; function burst() { burstT = 1; }

function ringScreen() {
  const ring = P.ring || { cx: 0.5, cy: 0.13, r: 0.13 };
  const c = view.project(ring.cx, ring.cy), top = view.project(ring.cx, ring.cy - ring.r * 0.98), side = view.project(ring.cx + ring.r / aspect * 0.98, ring.cy);
  const R = Math.hypot(top.x - c.x, top.y - c.y), Rx = Math.hypot(side.x - c.x, side.y - c.y);
  const f = view.forward(ring.cx, ring.cy);
  return { x: c.x, y: c.y, R, fx: Rx / Math.max(1, R), dir: f, facing: c.facing };
}
function frameHair(dt) {
  // Dönüş: sürükleyerek çevrilir, bırakınca öne döner; boştayken üç çeyrek açıyla salınır
  if (!S.dragging) { S.spin = damp(S.spin, 0, 1.8, dt); S.dragX = damp(S.dragX, 0, 1.6, dt); }
  const idleSway = S.pointerIn ? 0 : Math.sin(S.t * 0.55) * 28;
  // fotoğraftan üretilen model en inandırıcı ±60° aralığında: sürükleme esnek sınırlı
  const ty = elastic((S.pointerIn && !S.nearHs ? clamp((S.px - 560) / 9, -35, 35) : idleSway) + S.spin, 60);
  const tx = clamp((S.pointerIn ? -(S.py - 110) / 14 : 0) + S.dragX, -22, 22);
  S.ry = damp(S.ry, ty, 6, dt); S.rx = damp(S.rx, tx, 5, dt);
  box.y = 12 + Math.sin(S.t * 1.3) * 2;
  placeProd(); view.render();

  const ring = ringScreen();
  // Nural: imleç halkaya yaklaştıkça "baş yakın"
  const d = S.pointerIn ? Math.hypot(S.px - ring.x, S.py - ring.y) : 120 + Math.sin(S.t * 0.6) * 90;
  S.dist = damp(S.dist, clamp(1 - (d - 30) / 200, 0, 1), 4, dt);

  // Hava akışı: halkadan dışa (izleyiciye doğru) açılan çizgiler
  const h = D.heats[S.heat], f = attFlow || { sx: 1, sy: 1, speed: 1, size: 1 };
  burstT = Math.max(0, burstT - dt * 1.5);
  g.save(); g.beginPath(); g.rect(345, 0, W - 345, H); g.clip(); // metin sütununa taşmasın
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  const col = h.color, sp = 260 * f.speed * (1 + burstT * 0.8) * (S.heat === 0 ? 1.1 : 1);
  for (const p of AIR) {
    p.life += dt / p.max;
    if (p.life >= 1) {
      p.life = 0; p.max = 0.6 + Math.random() * 0.7; p.a = Math.random() * Math.PI * 2;
      p.r = ring.R * (0.55 + Math.random() * 0.4); p.v = sp * (0.6 + Math.random() * 0.6); p.s = (0.6 + Math.random()) * f.size;
      if (f.side) p.a = (Math.random() - 0.5) * 0.9; // kabarma önleyici: yana doğru dar jet
    }
    const L = p.life, rad = p.r + Math.min(230, p.v * L * (0.4 + L));
    const ca = Math.cos(p.a), sa = Math.sin(p.a);
    // halka düzlemi dönünce yatay yarıçap kısalır; akış ürünün ön yönüne doğru ilerler
    const push = p.v * L * 0.9;
    let x = ring.x + ca * rad * f.sx * ring.fx + ring.dir.x * push, y = ring.y + sa * rad * f.sy + ring.dir.y * push;
    if (f.comb) x = ring.x + Math.round(ca * rad * f.sx * ring.fx / 10) * 10 + ring.dir.x * push;
    const tail = 10 + p.v * 0.05 * p.s;
    const alpha = Math.sin(L * Math.PI) * (0.28 + burstT * 0.4) * (ring.facing > 0 ? 1 : 0.35);
    g.strokeStyle = col; g.globalAlpha = alpha; g.lineWidth = 1.1 * p.s * (0.6 + L);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x - ca * tail * f.sx * ring.fx - ring.dir.x * 0.15, y - sa * tail * f.sy - ring.dir.y * 0.15); g.stroke();
  }
  // Isıtıcı ışığı: halka merkezinde ısı renginde parıltı (ön yüz görünürken)
  if (ring.facing > 0) {
    const gl = g.createRadialGradient(ring.x, ring.y, 0, ring.x, ring.y, ring.R * 0.75);
    gl.addColorStop(0, col); gl.addColorStop(1, 'rgba(0,0,0,0)');
    g.globalAlpha = (0.25 + h.level * 0.15) * ring.facing; g.fillStyle = gl;
    g.beginPath(); g.ellipse(ring.x, ring.y, ring.R * 0.75 * ring.fx, ring.R * 0.75, 0, 0, Math.PI * 2); g.fill();
  }
  // Air Multiplier: halkadan genişleyen nabız halkaları
  for (let k = 0; k < 3; k++) {
    const q = ((S.t * 0.8 * f.speed + k / 3) % 1);
    g.globalAlpha = (1 - q) * 0.22; g.strokeStyle = col; g.lineWidth = 1.5;
    g.beginPath(); g.ellipse(ring.x + ring.dir.x * q * 60, ring.y + ring.dir.y * q * 60, ring.R * (1 + q * 2.6) * f.sx * ring.fx + 0.1, ring.R * (1 + q * 2.6) * f.sy, 0, 0, Math.PI * 2); g.stroke();
  }
  g.restore();

  // HUD
  if ((hudT += dt) > 0.1) {
    hudT = 0;
    let t = h.temp;
    if (S.nural && S.heat > 0) t = Math.round(lerp(t, Math.min(t, 55), S.dist));
    shownTemp = Math.round(lerp(shownTemp, t, 0.4));
    $('#temp').textContent = shownTemp;
    $('#tempBar').style.setProperty('--v', (shownTemp - 20) / 90);
    const ns = $('#nuralState');
    ns.textContent = !S.nural ? 'Saç derisi koruma kapalı' : S.heat === 0 ? 'Soğuk hava' : S.dist > 0.55 ? 'Başa yakın · ısı düşürüldü' : 'Mesafe güvenli';
    ns.dataset.on = S.nural && S.heat > 0 && S.dist > 0.55;
  }
}
let hudT = 0, shownTemp = 80;

/* ═══════════════ KABLOSUZ SÜPÜRGE ═══════════════ */
const FLOOR = { top: 120, bottom: 250, vpX: 660, x0: 345, x1: 965 };
let dust = [];
const counts = [0, 0, 0, 0];
let collected = 0, floorBg = null;
function floorXY(u, v) { // u: 0..1 yatay, v: 0..1 derinlik (0 uzak, 1 yakın)
  const y = lerp(FLOOR.top + 8, FLOOR.bottom + 4, Math.pow(v, 1.15));
  const half = lerp(260, 420, v);
  return [FLOOR.vpX + (u - 0.5) * 2 * half, y];
}
function spawn(p, delay = 0) {
  p.u = Math.random(); p.v = 0.42 + Math.random() * 0.58; [p.x, p.y] = floorXY(p.u, p.v); // başlığın ulaşabildiği bant
  const r = Math.random();
  p.size = r < 0.45 ? 0.5 : r < 0.75 ? 0.8 : r < 0.93 ? 1.2 : 1.8;
  p.bin = p.size >= 1.8 ? 0 : p.size >= 1.2 ? 1 : p.size >= 0.8 ? 2 : 3;
  p.k = lerp(0.6, 1.3, p.v); p.st = delay ? 2 : 0; p.t = delay; p.glow = 0;
}
function resetDust() { counts.fill(0); collected = 0; dust.forEach((p) => spawn(p)); }
function drawFloorBg() {
  // Perspektif parke zemin (bir kez çizilir)
  const c = document.createElement('canvas'); c.width = W * dpr; c.height = H * dpr;
  const x = c.getContext('2d'); x.scale(dpr, dpr);
  const grd = x.createLinearGradient(0, FLOOR.top, 0, H);
  grd.addColorStop(0, '#141210'); grd.addColorStop(1, '#2a2420');
  x.fillStyle = grd; x.fillRect(0, FLOOR.top, W, H - FLOOR.top);
  x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 1;
  for (let i = 1; i < 9; i++) { const v = Math.pow(i / 9, 1.6), y = lerp(FLOOR.top, H, v); x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  for (let i = -14; i <= 14; i++) { const [xb] = floorXY(0.5 + i / 14 * 0.9, 1); x.beginPath(); x.moveTo(FLOOR.vpX + (xb - FLOOR.vpX) * 0.55, FLOOR.top); x.lineTo(xb, H + 4); x.stroke(); }
  // ufuk ve kenar karartma
  const v = x.createRadialGradient(660, 250, 40, 660, 250, 520);
  v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(8,8,9,.92)');
  x.fillStyle = v; x.fillRect(0, 0, W, H);
  const hz = x.createLinearGradient(0, FLOOR.top - 10, 0, FLOOR.top + 30);
  hz.addColorStop(0, 'rgba(10,10,11,1)'); hz.addColorStop(1, 'rgba(10,10,11,0)');
  x.fillStyle = hz; x.fillRect(0, FLOOR.top - 10, W, 40);
  return c;
}
function initFloor() {
  floorBg = drawFloorBg();
  const n = reduced ? 380 : 900;
  dust = Array.from({ length: n }, () => { const p = {}; spawn(p); return p; });
  setMode('sweep');
}
function setMode(m) {
  S.mode = m; mh.dataset.mode = m;
  if (ONLY !== 'floor') return;
  pressed('[data-mode]', $(`[data-mode="${m}"]`));
  closeCard();
}
function vacBox(hx, hy) {
  const k = lerp(0.76, 0.93, clamp((hy - 196) / 50, 0, 1)); // gövde üstü kadrajda kalır
  const h = 250 * k, w = h * aspect;
  return { x: hx - P.head.x * w, y: hy - P.head.y * h, w, h, k };
}
function frameFloor(dt) {
  gf.clearRect(0, 0, W, H);
  const inspect = S.mode === 'inspect';
  gf.globalAlpha = inspect ? 0.35 : 1; gf.drawImage(floorBg, 0, 0, W, H); gf.globalAlpha = 1;

  // Başlık hedefi: imleç, yoksa otomatik pilot
  let tx, ty;
  if (inspect) { tx = 640; ty = 246; }
  else if (S.pointerIn && S.idle < 4) { tx = clamp(S.px, 430, 935); ty = clamp(S.py, 196, 246); }
  else { const t = S.t * 0.35; tx = 690 + Math.sin(t) * 220; ty = 222 + Math.sin(t * 2.3) * 22; }
  const ox = S.hx;
  S.hx = damp(S.hx, tx, inspect ? 3 : 7, dt); S.hy = damp(S.hy, ty, inspect ? 3 : 7, dt);
  S.vx = damp(S.vx, (S.hx - ox) / Math.max(dt, 1e-3), 6, dt);

  const b = vacBox(S.hx, S.hy);
  if (!S.dragging) { S.spin = damp(S.spin, 0, 1.8, dt); S.dragX = damp(S.dragX, 0, 1.6, dt); }
  if (inspect) {
    // yakından: gövdeye odaklan (başlık kadraj dışında kalır), sürükleyerek 360°
    const h = 430, w = h * aspect;
    S.ib = S.ib || { ...box }; // yumuşak geçiş
    for (const [k2, v2] of Object.entries({ x: 655 - w * 0.72, y: 10, w, h })) S.ib[k2] = damp(S.ib[k2] ?? v2, v2, 5, dt);
    Object.assign(box, S.ib, { rot: damp(box.rot, 0, 5, dt) });
    pivotX = damp(pivotX, 0.72, 5, dt); pivotY = damp(pivotY, 0.22, 5, dt);
    S.ry = damp(S.ry, elastic((S.pointerIn && !S.nearHs ? clamp((S.px - 640) / 8, -40, 40) : Math.sin(S.t * 0.6) * 30) + S.spin, 60), 5, dt);
    S.rx = damp(S.rx, clamp((S.pointerIn ? -(S.py - 120) / 30 : 0) + S.dragX, -12, 12), 5, dt);
  } else {
    S.ib = null;
    Object.assign(box, { x: b.x, y: b.y, w: b.w, h: b.h, rot: clamp(-S.vx * 0.012, -7, 7) });
    pivotX = P.head.x; pivotY = P.head.y;
    // hareket yönüne göre 3D dönüş (başlık ekseninde)
    S.ry = damp(S.ry, elastic(S.vx * 0.07, 40), 4, dt); S.rx = damp(S.rx, 0, 5, dt);
  }
  placeProd();

  // Lazer: başlığın sol ucundaki yayıcıdan sola-öne doğru yelpaze
  const k = b.k, em = view.project(0.03, 0.905), ex = em.x, ey = em.y;
  const L = 300 * k, a0 = Math.PI * 0.86, a1 = Math.PI * 1.17, flat = 0.42;
  const laserOn = !inspect;
  if (laserOn) {
    gf.save(); gf.globalCompositeOperation = 'lighter';
    const gr = gf.createRadialGradient(ex, ey, 2, ex, ey, L);
    gr.addColorStop(0, 'rgba(80,255,120,.55)'); gr.addColorStop(0.5, 'rgba(60,255,110,.16)'); gr.addColorStop(1, 'rgba(60,255,110,0)');
    gf.fillStyle = gr; gf.beginPath(); gf.moveTo(ex, ey);
    for (let i = 0; i <= 16; i++) { const a = lerp(a0, a1, i / 16); gf.lineTo(ex + Math.cos(a) * L, ey + Math.sin(a) * L * flat); }
    gf.closePath(); gf.fill();
    // tarama çizgileri
    gf.strokeStyle = 'rgba(120,255,150,.10)'; gf.lineWidth = 1;
    for (let i = 1; i < 7; i++) { const rr = ((i / 7 + S.t * 0.25) % 1) * L; gf.beginPath(); gf.ellipse(ex, ey, rr, rr * flat, 0, a0, a1); gf.stroke(); }
    gf.restore();
  }

  // Emiş hattı: silindirin alt kenarı (sol uç → sağ uç)
  const r = D.powers[S.power].radius;
  const q0 = view.project(0.02, 0.93), q1 = view.project(0.5, 0.995);
  const sx0 = q0.x, sy0 = q0.y, sx1 = q1.x, sy1 = q1.y;
  const segDx = sx1 - sx0, segDy = sy1 - sy0, segL2 = segDx * segDx + segDy * segDy;
  const cx = (sx0 + sx1) / 2, cy = (sy0 + sy1) / 2;
  gf.save();
  for (const p of dust) {
    if (p.st === 2) { if ((p.t -= dt) <= 0) spawn(p); else continue; }
    if (p.st === 0) {
      let lit = 0;
      if (laserOn) {
        const dx = p.x - ex, dy = (p.y - ey) / flat, dist = Math.hypot(dx, dy);
        let a = Math.atan2(dy, dx); if (a < 0) a += Math.PI * 2;
        if (dist < L && a > a0 && a < a1) lit = 1 - dist / L * 0.6;
        // emiş: segmente uzaklık
        const t = clamp(((p.x - sx0) * segDx + (p.y - sy0) * segDy) / segL2, 0, 1);
        const qx = sx0 + segDx * t, qy = sy0 + segDy * t;
        if (Math.hypot(p.x - qx, (p.y - qy) * 1.6) < 9 * k * r + 2) { p.st = 1; p.t = 0; p.tx = cx; p.ty = cy; }
      }
      p.glow = damp(p.glow, lit, 10, dt);
    } else if (p.st === 1) {
      p.t += dt * 5; const q = Math.min(1, p.t);
      p.x = lerp(p.x, p.tx, q * 0.35); p.y = lerp(p.y, p.ty, q * 0.35); p.glow = 1;
      if (q >= 1) { p.st = 2; p.t = 2 + Math.random() * 6; counts[p.bin]++; collected++; continue; }
    }
    const s = p.size * p.k * (p.st === 1 ? 1 - Math.min(1, p.t) : 1) * (0.7 + p.glow * 0.6);
    if (p.glow > 0.05) {
      gf.globalCompositeOperation = 'lighter';
      gf.fillStyle = `rgba(150,255,170,${0.25 + p.glow * 0.75})`;
      gf.beginPath(); gf.arc(p.x, p.y, s * 1.1, 0, Math.PI * 2); gf.fill();
      if (p.glow > 0.5 && p.size > 1) { gf.fillStyle = `rgba(80,255,120,${p.glow * 0.12})`; gf.beginPath(); gf.arc(p.x, p.y, s * 3.2, 0, Math.PI * 2); gf.fill(); }
    } else {
      gf.globalCompositeOperation = 'source-over';
      gf.fillStyle = 'rgba(70,64,58,.55)'; // çıplak gözle zor görülen toz
      gf.beginPath(); gf.arc(p.x, p.y, s * 0.8, 0, Math.PI * 2); gf.fill();
    }
  }
  gf.restore();
  // Başlık altı gölge
  gf.save(); const sg = gf.createRadialGradient(cx, cy + 3 * k, 0, cx, cy + 3 * k, 70 * k);
  sg.addColorStop(0, 'rgba(0,0,0,.55)'); sg.addColorStop(1, 'rgba(0,0,0,0)');
  gf.fillStyle = sg; gf.beginPath(); gf.ellipse(cx, cy + 3 * k, 75 * k, 14 * k, 0.12, 0, Math.PI * 2); gf.fill(); gf.restore();

  view.render();
  if ((hudT += dt) > 0.1) {
    hudT = 0;
    $('#total').textContent = collected.toLocaleString('tr-TR');
    const max = Math.max(10, ...counts);
    counts.forEach((n, i) => { $(`[data-bar="${i}"]`).style.width = (n / max * 100) + '%'; $(`[data-cnt="${i}"]`).textContent = n.toLocaleString('tr-TR'); });
  }
}

/* ─────────────── Döngü ─────────────── */
let last = performance.now(), visible = true;
new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(mh);
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (!visible || document.hidden) return;
  S.t += dt; S.idle += dt;
  g.clearRect(0, 0, W, H);
  if (!view) return;
  if (ONLY === 'hair') frameHair(dt); else frameFloor(dt);
  placeHotspots();
}

if (ONLY === 'hair') initHair(); else initFloor();
mh.dataset.stage = ONLY;
createProduct(glc, P, W, H, dpr).then((v) => { view = v; mh.classList.add('ready'); }).catch((e) => { console.error(e); mh.classList.add('ready'); });
requestAnimationFrame(frame);
window.__MH__ = { S, setMode, get collected() { return collected; } };
