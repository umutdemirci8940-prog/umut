import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { buildDryer, buildVacuum } from './models.js';
import { DATA } from './data.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = THREE.MathUtils.clamp, lerp = THREE.MathUtils.lerp, damp = THREE.MathUtils.damp;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ASSETS = window.__MH_ASSETS__ || {}; // build.mjs: siteden gelen görsel / video
const ONLY = window.__MH_STAGE__ === 'floor' ? 'floor' : 'hair'; // her masthead tek ürün

const mh = $('#mh');
const canvas = $('#gl');

/* ─────────────── Tıklama çıkışı (clickTag / Enabler / doğrudan) ─────────────── */
function exit(stage, label) {
  const url = DATA.stages[stage].url;
  if (window.Enabler && window.Enabler.exitOverride) return window.Enabler.exitOverride(label, url);
  if (window.Enabler && window.Enabler.exit) return window.Enabler.exit(label);
  window.open(window.clickTag || url, '_blank', 'noopener');
}

/* ─────────────── Renderer / sahne ─────────────── */
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(28, 2, 0.5, 2000);

const key = new THREE.DirectionalLight('#ffffff', 2.2); key.position.set(30, 50, 60); scene.add(key);
const rim = new THREE.DirectionalLight('#9fc4ff', 1.6); rim.position.set(-60, 20, -40); scene.add(rim);
const warm = new THREE.PointLight('#ff9a5a', 0, 80, 1.6); scene.add(warm);

/* ─────────────── Ürünler ─────────────── */
const dryer = buildDryer();
const dryerPivot = new THREE.Group(); dryerPivot.add(dryer.root); dryer.root.position.set(0, 4.5, 0);
scene.add(dryerPivot);

const vac = buildVacuum();
const vacStage = new THREE.Group(); scene.add(vacStage);
const vacPivot = new THREE.Group(); vacPivot.add(vac.root); vacStage.add(vacPivot);

// Zemin (yalnızca süpürge sahnesi): koyu parke, canvas dokusu
function floorTexture() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 1024; const x = c.getContext('2d');
  const rnd = mulberry(7);
  for (let row = 0; row < 8; row++) {
    let xx = -rnd() * 400;
    while (xx < 1024) {
      const w = 260 + rnd() * 260, l = 18 + rnd() * 10;
      x.fillStyle = `hsl(28, 18%, ${l}%)`; x.fillRect(xx, row * 128, w, 128);
      x.globalAlpha = 0.08;
      for (let g = 0; g < 26; g++) { x.fillStyle = rnd() > 0.5 ? '#000' : '#fff'; x.fillRect(xx, row * 128 + rnd() * 128, w, 1 + rnd() * 2); }
      x.globalAlpha = 1; x.fillStyle = 'rgba(0,0,0,.55)'; x.fillRect(xx, row * 128, 2, 128);
      xx += w;
    }
    x.fillStyle = 'rgba(0,0,0,.6)'; x.fillRect(0, row * 128, 1024, 2);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const floorMat = new THREE.MeshStandardMaterial({ map: floorTexture(), roughness: 0.38, metalness: 0.05, color: '#8a8580', transparent: true });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), floorMat);
floor.rotation.x = -Math.PI / 2; floor.renderOrder = -2; vacStage.add(floor);
// Kenarları karartan radyal maske
const vign = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uOp: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'varying vec2 vUv; uniform float uOp; void main(){ float d=distance(vUv,vec2(.5)); gl_FragColor=vec4(0.035,0.035,0.04, smoothstep(.06,.33,d)*uOp); }',
}));
vign.rotation.x = -Math.PI / 2; vign.position.y = 0.05; vign.renderOrder = -1; vacStage.add(vign);

// Gölge (her iki ürün için yumuşak temas gölgesi)
function shadowTex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(0,0,0,.7)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); return new THREE.CanvasTexture(c); }
const vacShadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex(), transparent: true, depthWrite: false }));
vacShadow.rotation.x = -Math.PI / 2; vacShadow.position.y = 0.1; vacShadow.scale.set(40, 26, 1); vac.root.add(vacShadow);

/* ─────────────── Lazer yelpazesi + toz ─────────────── */
const LASER = { near: 5.5, far: 62, halfNear: 12.5, spread: 0.55 };
const fanGeo = new THREE.BufferGeometry();
{
  const { near, far, halfNear, spread } = LASER, hf = halfNear + (far - near) * spread;
  fanGeo.setAttribute('position', new THREE.Float32BufferAttribute([-halfNear, 0, near, halfNear, 0, near, hf, 0, far, -hf, 0, far], 3));
  fanGeo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
  fanGeo.setIndex([0, 2, 1, 0, 3, 2]);
}
const fanMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  uniforms: { uT: { value: 0 }, uOn: { value: 1 } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: `varying vec2 vUv; uniform float uT; uniform float uOn;
    void main(){ float a = (1.0-vUv.y); a = a*a*0.8 + 0.05;
      float edge = smoothstep(0.0,0.06,vUv.x)*smoothstep(1.0,0.94,vUv.x);
      float scan = 0.85 + 0.15*sin(vUv.y*80.0 - uT*6.0);
      float line = smoothstep(0.02,0.0,vUv.y)*0.9;
      gl_FragColor = vec4(vec3(0.2,1.0,0.42)*(a*edge*scan+line), 1.0)*uOn; }`,
});
const fan = new THREE.Mesh(fanGeo, fanMat); fan.position.y = 0.15; fan.renderOrder = 2; vac.root.add(fan);

const DUST_N = reduced ? 700 : 1500;
const dustGeo = new THREE.IcosahedronGeometry(1, 0);
const dustMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
const dust = new THREE.InstancedMesh(dustGeo, dustMat, DUST_N);
dust.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
dust.frustumCulled = false;
vacStage.add(dust);
const D = {
  x: new Float32Array(DUST_N), z: new Float32Array(DUST_N), y: new Float32Array(DUST_N), s: new Float32Array(DUST_N),
  st: new Uint8Array(DUST_N), // 0 zeminde, 1 emiliyor, 2 bekliyor
  t: new Float32Array(DUST_N), glow: new Float32Array(DUST_N), bin: new Uint8Array(DUST_N),
};
const AREA = { x0: -95, x1: 95, z0: -60, z1: 45 };
const rnd = mulberry(42);
function spawnDust(i, t0 = 0) {
  D.x[i] = lerp(AREA.x0, AREA.x1, rnd()); D.z[i] = lerp(AREA.z0, AREA.z1, rnd());
  const r = rnd(); const s = r < 0.45 ? 0.13 + rnd() * 0.06 : r < 0.75 ? 0.22 + rnd() * 0.08 : r < 0.93 ? 0.34 + rnd() * 0.12 : 0.5 + rnd() * 0.25;
  D.s[i] = s; D.y[i] = s * 0.6; D.st[i] = 0; D.t[i] = t0; D.glow[i] = 0;
  D.bin[i] = DATA.stages.floor.bins.findIndex((b) => s >= b.min);
}
for (let i = 0; i < DUST_N; i++) spawnDust(i);
const counts = [0, 0, 0, 0];
let collected = 0;
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _c = new THREE.Color();
const DIM = new THREE.Color('#1c1a18'), LIT = new THREE.Color('#d9ffd8');

/* ─────────────── Hava akışı parçacıkları ─────────────── */
const AIR_N = reduced ? 500 : 1400;
// Her parçacık bir "rüzgâr çizgisi": baş = konum, kuyruk = konum − hız·k
const airGeo = new THREE.BufferGeometry();
const A = { p: new Float32Array(AIR_N * 3), v: new Float32Array(AIR_N * 3), life: new Float32Array(AIR_N), max: new Float32Array(AIR_N), size: new Float32Array(AIR_N) };
const airPos = new Float32Array(AIR_N * 6), airA = new Float32Array(AIR_N * 2);
airGeo.setAttribute('position', new THREE.BufferAttribute(airPos, 3).setUsage(THREE.DynamicDrawUsage));
airGeo.setAttribute('aLife', new THREE.BufferAttribute(airA, 1).setUsage(THREE.DynamicDrawUsage));
const airMat = new THREE.ShaderMaterial({
  // Şeffaf tuval üzerinde ışıma: renk toplanır, alfa parlaklık kadar artar (CSS zeminine "glow")
  transparent: true, depthWrite: false, blending: THREE.CustomBlending,
  blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.OneFactor, blendDstAlpha: THREE.OneFactor,
  uniforms: { uColor: { value: new THREE.Color('#ffa04d') }, uScale: { value: 300 }, uOp: { value: 1 } },
  vertexShader: `attribute float aLife; varying float vA; void main(){ vA=aLife; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `varying float vA; uniform vec3 uColor; uniform float uOp; void main(){ vec3 c=mix(uColor, vec3(1.), .25)*vA*uOp; gl_FragColor=vec4(c, max(c.r,max(c.g,c.b))*.6); }`,
});
const air = new THREE.LineSegments(airGeo, airMat); air.frustumCulled = false; scene.add(air);
// Çizgi başlarında yumuşak ışıma noktaları (ısı pusu)
const airPtsMat = airMat.clone();
airPtsMat.vertexShader = `attribute float aLife; varying float vA; uniform float uScale;
  void main(){ vA=aLife; vec4 mv=modelViewMatrix*vec4(position,1.); gl_PointSize=uScale*aLife*2.2/-mv.z; gl_Position=projectionMatrix*mv; }`;
airPtsMat.fragmentShader = `varying float vA; uniform vec3 uColor; uniform float uOp;
  void main(){ float d=length(gl_PointCoord-.5); float g=1.-smoothstep(0.,.5,d); vec3 c=uColor*g*g*vA*.35*uOp; gl_FragColor=vec4(c, max(c.r,max(c.g,c.b))*.6); }`;
airPtsMat.uniforms = airMat.uniforms;
const airPts = new THREE.Points(airGeo, airPtsMat); airPts.frustumCulled = false; scene.add(airPts);
for (let i = 0; i < AIR_N; i++) { A.life[i] = -Math.random(); A.max[i] = 1; A.size[i] = 0.35 + Math.random() * 0.65; }

/* ─────────────── Durum ─────────────── */
const S = {
  stage: ONLY, mix: ONLY === 'floor' ? 1 : 0, // 0 = saç, 1 = süpürge
  heat: 2, speed: 3, nural: true, attachment: 'none',
  power: 1, mode: 'sweep', // sweep | inspect
  yaw: -0.5, pitch: 0.05, vyaw: 0, vpitch: 0,
  vyawF: 1.1, // süpürge inceleme yönü
  dragging: false, lastX: 0, lastY: 0, pointer: new THREE.Vector2(0, 0), pointerIn: false,
  interacted: false, idle: 0, time: 0,
  head: new THREE.Vector3(30, 0, 0), headTarget: new THREE.Vector3(30, 0, 0), headYaw: 1.1, headVel: new THREE.Vector3(),
  dist: 1, // nural mesafe simülasyonu (0..1)
};

/* ─────────────── Arayüz ─────────────── */
function buildUI() {
  const hair = DATA.stages.hair, floorD = DATA.stages.floor;
  if (ONLY === 'hair') {
  $('#heats').innerHTML = hair.heats.map((h, i) => `<button type="button" data-heat="${i}" style="--c:${h.color}" aria-pressed="${i === S.heat}"><i></i>${h.label}</button>`).join('');
  $('#attachments').innerHTML = hair.attachments.map((a) => `<button type="button" data-att="${a.key}" aria-pressed="${a.key === S.attachment}">${a.label}</button>`).join('');
  $('#hairSwatches').innerHTML = hair.swatches.map((s, i) => `<button type="button" data-sw="${i}" title="${s.name}" aria-label="${s.name}" style="--a:${s.body};--b:${s.accent}" aria-pressed="${i === 0}"></button>`).join('');
  } else {
  $('#floorSwatches').innerHTML = floorD.swatches.map((s, i) => `<button type="button" data-fsw="${i}" title="${s.name}" aria-label="${s.name}" style="--a:${s.body};--b:${s.accent}" aria-pressed="${i === 0}"></button>`).join('');
  $('#powers').innerHTML = floorD.powers.map((p, i) => `<button type="button" data-pow="${i}" aria-pressed="${i === S.power}">${p.label}</button>`).join('');
  $('#bins').innerHTML = floorD.bins.map((b, i) => `<div class="bin"><span>${b.label}</span><b><i data-bar="${i}"></i></b><em data-cnt="${i}">0</em></div>`).join('');
  }
  // Hotspotlar
  const hs = $('#hotspots');
  for (const [stage, prod] of [['hair', dryer], ['floor', vac]].filter(([st]) => st === ONLY)) {
    for (const k of Object.keys(prod.anchors)) {
      const f = DATA.stages[stage].features[k]; if (!f) continue;
      const b = document.createElement('button'); b.type = 'button'; b.className = 'hs'; b.dataset.stage = stage; b.dataset.key = k;
      b.setAttribute('aria-label', f.title); b.innerHTML = '<span></span>';
      hs.appendChild(b);
    }
  }
  // Siteden gelen film (varsa): düğmede küçük önizleme, yoksa düğme kaldırılır
  const A0 = ASSETS[ONLY] || {};
  if (!A0.video) $$('.film').forEach((b) => b.remove());
  else if (A0.image) $$('.fthumb').forEach((t) => { t.style.backgroundImage = `url(${A0.image})`; });
}
buildUI();

function pressed(sel, el) { $$(sel).forEach((b) => b.setAttribute('aria-pressed', b === el)); }

mh.addEventListener('click', (e) => {
  const t = e.target.closest('button, a'); if (!t) return;
  markInteract();
  if (t.dataset.heat) { S.heat = +t.dataset.heat; pressed('[data-heat]', t); applyHeat(); }
  else if (t.dataset.att) { S.attachment = t.dataset.att; pressed('[data-att]', t); dryer.setAttachment(S.attachment); snap = 1; }
  else if (t.dataset.sw) { const s = DATA.stages.hair.swatches[+t.dataset.sw]; pressed('[data-sw]', t); dryer.setColors(s.body, s.accent); mh.style.setProperty('--hair-accent', s.accent); $('#hairSwName').textContent = s.name; }
  else if (t.dataset.fsw) { const s = DATA.stages.floor.swatches[+t.dataset.fsw]; pressed('[data-fsw]', t); vac.setColors(s.body, s.accent, s.accent2); $('#floorSwName').textContent = s.name; }
  else if (t.dataset.pow) { S.power = +t.dataset.pow; pressed('[data-pow]', t); $('#powerInfo').textContent = DATA.stages.floor.powers[S.power].info; }
  else if (t.id === 'nural') { S.nural = !S.nural; t.setAttribute('aria-pressed', S.nural); applyHeat(); }
  else if (t.dataset.mode) { setMode(t.dataset.mode); }
  else if (t.classList.contains('hs')) openCard(t.dataset.stage, t.dataset.key, t);
  else if (t.id === 'cardClose') closeCard();
  else if (t.dataset.exit) { e.preventDefault(); exit(t.dataset.exit, t.dataset.label || 'CTA'); }
  else if (t.classList.contains('film')) openVideo();
  else if (t.id === 'videoClose') closeVideo();
  else if (t.id === 'reset') { counts.fill(0); collected = 0; for (let i = 0; i < DUST_N; i++) spawnDust(i); }
});

function applyHeat() {
  const h = DATA.stages.hair.heats[S.heat];
  airMat.uniforms.uColor.value.set(h.color);
  dryer.setHeat(h.level || (S.heat === 0 ? 0 : 1), h.color);
  warm.color.set(h.color); mh.style.setProperty('--heat', h.color);
  const n = $('#nural'); if (n) n.setAttribute('aria-pressed', S.nural);
}
applyHeat();

function setMode(m) {
  S.mode = m; pressed('[data-mode]', $(`[data-mode="${m}"]`));
  mh.dataset.mode = m;
  if (m === 'inspect') { S.vyawF = 1.1; }
}
setMode('sweep');

let snap = 0;
let stageT = 0;
function setStage(st) {
  if (S.stage === st) return;
  S.stage = st; mh.dataset.stage = st; stageT = 0;
  $$('.tab').forEach((b) => b.setAttribute('aria-selected', b.dataset.stage === st));
  closeCard();
}

/* Özellik kartı */
const card = $('#card');
let cardFor = null;
function openCard(stage, k, btn) {
  const f = DATA.stages[stage].features[k];
  $('#cardTitle').textContent = f.title; $('#cardText').textContent = f.text;
  card.hidden = false; cardFor = btn; delete card.dataset.placed; $$('.hs').forEach((b) => b.classList.toggle('on', b === btn));
  requestAnimationFrame(() => card.classList.add('show'));
}
function closeCard() { card.classList.remove('show'); card.hidden = true; cardFor = null; $$('.hs').forEach((b) => b.classList.remove('on')); }

/* Video katmanı (yalnızca build sırasında video gömülmüşse) */
function openVideo() {
  const a = ASSETS[ONLY] || {};
  if (!a.video) return;
  const lay = $('#video'); const el = $('video', lay);
  if (a.poster) el.poster = a.poster;
  el.src = a.video; lay.hidden = false; el.currentTime = 0; el.play().catch(() => {});
}
function closeVideo() { const lay = $('#video'); $('video', lay).pause(); lay.hidden = true; }

/* ─────────────── İşaretçi: sürükle-döndür / süpür ─────────────── */
function markInteract() { S.interacted = true; S.idle = 0; mh.classList.add('touched'); }
const raycaster = new THREE.Raycaster();
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
function sweeping() { return S.stage === 'floor' && S.mode === 'sweep'; }
canvas.addEventListener('pointerdown', (e) => {
  markInteract(); closeCard(); S.dragging = true; S.lastX = e.clientX; S.lastY = e.clientY; S.downX = e.clientX;
  canvas.setPointerCapture(e.pointerId); mh.classList.add('grabbing');
});
canvas.addEventListener('pointermove', (e) => {
  const r = canvas.getBoundingClientRect();
  S.pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  S.pointerIn = true;
  if (sweeping()) {
    if (e.pointerType === 'mouse' || S.dragging) { markInteract(); aimHead(); }
    return;
  }
  if (!S.dragging) return;
  const dx = e.clientX - S.lastX, dy = e.clientY - S.lastY; S.lastX = e.clientX; S.lastY = e.clientY;
  S.vyaw = dx * 0.008; S.vpitch = dy * 0.005;
  if (S.stage === 'hair') { S.yaw += S.vyaw; S.pitch = clamp(S.pitch + S.vpitch, -0.7, 0.7); }
  else { S.vyawF += S.vyaw; }
});
const endDrag = (e) => { S.dragging = false; mh.classList.remove('grabbing'); };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('pointerleave', () => { S.pointerIn = false; });
function aimHead() {
  raycaster.setFromCamera(S.pointer, camera);
  const p = new THREE.Vector3();
  if (raycaster.ray.intersectPlane(floorPlane, p)) {
    S.headTarget.set(clamp(p.x, -30, AREA.x1 - 20), 0, clamp(p.z, AREA.z0 + 10, AREA.z1 - 4));
  }
}
// Klavye: sekmeler ← →, model döndürme
mh.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { closeCard(); closeVideo(); }
});

/* ─────────────── Yerleşim ─────────────── */
let W = 1, H = 1, mobile = false;
function resize() {
  const r = mh.getBoundingClientRect(); W = Math.max(1, r.width); H = Math.max(1, r.height);
  mobile = W < 760;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  // Masaüstünde ürünü sağa, mobilde aşağı kaydır (metin sütunu için yer)
  if (mobile) camera.setViewOffset(W, H, 0, -H * 0.03, W, H);
  else camera.setViewOffset(W, H, -W * 0.19, 0, W, H);
  camera.updateProjectionMatrix();
  airMat.uniforms.uScale.value = H * 1.6;
}
new ResizeObserver(resize).observe(mh); resize();

/* ─────────────── LCD ─────────────── */
function drawLCD() {
  const c = vac.lcdCanvas, x = c.getContext('2d'), w = c.width, h = c.height;
  x.fillStyle = '#05070a'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#7dff9b'; x.font = '600 18px Jost, sans-serif'; x.fillText(DATA.stages.floor.powers[S.power].label.toUpperCase(), 14, 26);
  x.fillStyle = '#fff'; x.font = '600 38px Jost, sans-serif'; x.fillText(collected.toLocaleString('tr-TR'), 14, 70);
  const max = Math.max(10, ...counts), cols = ['#ffd84d', '#ff9a3d', '#ff5a8a', '#9a7bff'];
  counts.forEach((n, i) => { const bw = (w - 28) * (n / max); x.fillStyle = '#1b2026'; x.fillRect(14, 88 + i * 24, w - 28, 16); x.fillStyle = cols[i]; x.fillRect(14, 88 + i * 24, bw, 16); });
  // Batarya
  x.strokeStyle = '#7dff9b'; x.lineWidth = 2; x.strokeRect(w - 64, 10, 44, 18); x.fillStyle = '#7dff9b'; x.fillRect(w - 61, 13, 38 * (0.92 - S.power * 0.12), 12);
  vac.lcdTex.needsUpdate = true;
}

/* ─────────────── Döngü ─────────────── */
const clock = new THREE.Clock();
let visible = true, lcdT = 0, hudT = 0;
new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(mh);
const tmpV = new THREE.Vector3(), camDir = new THREE.Vector3(), tmpW = new THREE.Vector3();

const CAM = {
  hair: { pos: new THREE.Vector3(0, 2.5, 47), look: new THREE.Vector3(0, 0, 0) },
  floor: { pos: new THREE.Vector3(0, 125, 235), look: new THREE.Vector3(4, 42, -10) },
  inspect: { pos: new THREE.Vector3(0, 120, 250), look: new THREE.Vector3(0, 50, -10) },
};
const camPos = CAM.hair.pos.clone(), camLook = CAM.hair.look.clone();
const floorPos = new THREE.Vector3(), floorLook = new THREE.Vector3();
let insp = 0;

function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.05);
  if (!visible || document.hidden) return;
  S.time += dt; S.idle += dt; stageT += dt;
  const T = S.time;


  const target = S.stage === 'floor' ? 1 : 0;
  S.mix = damp(S.mix, target, 3.2, dt);
  const m = S.mix, e = m * m * (3 - 2 * m);

  // Kamera
  const cp = mobile ? 1.35 : 1;
  insp = damp(insp, S.mode === 'inspect' ? 1 : 0, 2.5, dt);
  floorPos.lerpVectors(CAM.floor.pos, CAM.inspect.pos, insp); floorLook.lerpVectors(CAM.floor.look, CAM.inspect.look, insp);
  camPos.lerpVectors(CAM.hair.pos, floorPos, e).setZ(lerp(CAM.hair.pos.z * cp, floorPos.z * (mobile ? 1.9 : 1), e));
  camLook.lerpVectors(CAM.hair.look, floorLook, e);
  camera.position.copy(camPos); camera.lookAt(camLook);

  /* Saç kurutma makinesi */
  const hairVis = 1 - e;
  dryerPivot.visible = hairVis > 0.12; air.visible = airPts.visible = dryerPivot.visible;
  if (dryerPivot.visible) {
    if (!S.dragging) {
      S.vyaw *= 0.93; S.vpitch *= 0.9; S.yaw += S.vyaw;
      // Boşta yavaş dönüş + imleç takibi
      const rest = -0.5 + (S.pointerIn ? S.pointer.x * 0.35 : Math.sin(T * 0.35) * 0.35);
      if (Math.abs(S.vyaw) < 0.002) S.yaw = damp(S.yaw, nearestAngle(S.yaw, rest), S.idle > 3 ? 1.2 : 0.6, dt);
      S.pitch = damp(S.pitch, S.pointerIn ? -S.pointer.y * 0.25 : 0.05, 2, dt);
    }
    dryerPivot.rotation.set(S.pitch, S.yaw, Math.sin(T * 0.8) * 0.02);
    dryerPivot.position.set(0, Math.sin(T * 1.1) * 0.25, 0);
    const sc = (0.3 + 0.7 * hairVis) * (1 + snap * 0.04);
    dryerPivot.scale.setScalar(sc);
    dryerPivot.position.x = -e * 40;
    snap = damp(snap, 0, 6, dt);
    updateAir(dt, hairVis);
    // Nural: mesafe simülasyonu – imleç sağa (hava yönüne) yaklaştıkça "baş" yakın kabul edilir
    const near = S.pointerIn ? clamp((S.pointer.x + 0.2) / 1.1, 0, 1) : 0.5 + 0.5 * Math.sin(T * 0.6);
    S.dist = damp(S.dist, near, 3, dt);
    warm.intensity = (S.heat ? 60 : 20) * hairVis; warm.position.set(14, 4, 8);
  }

  /* Süpürge */
  vacStage.visible = e > 0.01;
  floorMat.opacity = e; vign.material.uniforms.uOp.value = e;
  if (vacStage.visible) {
    vacStage.position.y = (1 - e) * -30;
    updateVacuum(dt, e);
  }

  // HUD (10 Hz)
  hudT += dt; if (hudT > 0.1) { hudT = 0; updateHUD(); }
  lcdT += dt; if (vacStage.visible && lcdT > 0.15) { lcdT = 0; drawLCD(); }

  renderer.render(scene, camera);
  placeHotspots();
}
function nearestAngle(cur, tgt) { const tau = Math.PI * 2; return tgt + Math.round((cur - tgt) / tau) * tau; }

/* Hava akışı: parçacıklar dünya uzayında, memeden yayılır */
const nozM = new THREE.Matrix4(), fwd = new THREE.Vector3(), up = new THREE.Vector3(), side = new THREE.Vector3();
function updateAir(dt, vis) {
  dryer.root.updateWorldMatrix(true, false);
  nozM.copy(dryer.root.matrixWorld);
  fwd.set(1, 0, 0).transformDirection(nozM); up.set(0, 1, 0).transformDirection(nozM); side.set(0, 0, 1).transformDirection(nozM);
  const sc = dryerPivot.scale.x;
  const att = S.attachment, nz = dryer.nozzle;
  const ox = att === 'concentrator' ? nz.x + 4.4 : att === 'smoothing' ? nz.x + 2.6 : att === 'diffuser' ? nz.x + 5 : nz.x;
  const flatY = att === 'concentrator' ? 0.25 : att === 'smoothing' ? 0.5 : 1;
  const wideZ = att === 'concentrator' ? 1.2 : att === 'smoothing' ? 1.15 : att === 'diffuser' ? 1.6 : 1;
  const speed = (att === 'diffuser' ? 9 : 24) * (S.heat === 0 ? 1.1 : 1);
  const spread = att === 'diffuser' ? 0.55 : att === 'concentrator' ? 0.05 : 0.12;
  const life = att === 'diffuser' ? 1.1 : 1.4;
  const pos = airGeo.attributes.position, lifeAttr = airGeo.attributes.aLife;
  for (let i = 0; i < AIR_N; i++) {
    A.life[i] += dt / A.max[i];
    if (A.life[i] >= 1) {
      // Yeniden doğ: halka biçimli çıkış
      const a = Math.random() * Math.PI * 2, r = lerp(nz.rIn, nz.rOut, Math.random()) * (att === 'diffuser' ? 1.9 : 1);
      const ly = Math.sin(a) * r * flatY, lz = Math.cos(a) * r * wideZ;
      tmpV.set(ox, ly, lz).applyMatrix4(nozM);
      A.p[i * 3] = tmpV.x; A.p[i * 3 + 1] = tmpV.y; A.p[i * 3 + 2] = tmpV.z;
      const rad = att === 'diffuser' ? 1 : -0.35; // difüzör dışa, diğerleri merkeze çekilir (sürükleme)
      const sp = speed * (0.7 + Math.random() * 0.5) * sc;
      tmpW.copy(fwd).multiplyScalar(sp)
        .addScaledVector(up, (ly * rad * 0.6 + (Math.random() - 0.5) * spread * 40 * flatY) * sc)
        .addScaledVector(side, (lz * rad * 0.6 + (Math.random() - 0.5) * spread * 40) * sc);
      A.v[i * 3] = tmpW.x; A.v[i * 3 + 1] = tmpW.y; A.v[i * 3 + 2] = tmpW.z;
      A.life[i] = 0; A.max[i] = life * (0.6 + Math.random() * 0.6);
    } else if (A.life[i] > 0) {
      A.p[i * 3] += A.v[i * 3] * dt; A.p[i * 3 + 1] += A.v[i * 3 + 1] * dt; A.p[i * 3 + 2] += A.v[i * 3 + 2] * dt;
      A.v[i * 3] *= 0.985; A.v[i * 3 + 1] = A.v[i * 3 + 1] * 0.985 + (S.heat ? 2.2 : -0.5) * dt; A.v[i * 3 + 2] *= 0.985;
    }
    const L = A.life[i], a = L > 0 ? Math.sin(Math.min(1, L) * Math.PI) * A.size[i] * 1.5 : 0, k = 0.06;
    const j = i * 6;
    airPos[j] = A.p[i * 3]; airPos[j + 1] = A.p[i * 3 + 1]; airPos[j + 2] = A.p[i * 3 + 2];
    airPos[j + 3] = A.p[i * 3] - A.v[i * 3] * k; airPos[j + 4] = A.p[i * 3 + 1] - A.v[i * 3 + 1] * k; airPos[j + 5] = A.p[i * 3 + 2] - A.v[i * 3 + 2] * k;
    airA[i * 2] = a; airA[i * 2 + 1] = 0;
  }
  pos.needsUpdate = true; lifeAttr.needsUpdate = true;
  airMat.uniforms.uOp.value = vis;
}

/* Süpürge: başlık hareketi, lazer, toz toplama */
const invQ = new THREE.Quaternion();
function updateVacuum(dt, vis) {
  const sweep = S.mode === 'sweep';
  // Boşta otomatik pilot (çekici mod)
  if (sweep && (!S.pointerIn || S.idle > 4) && !S.dragging) {
    const t = S.time * 0.32;
    S.headTarget.set(Math.sin(t) * 50 + 25, 0, Math.sin(t * 2.1) * 26 - 6);
  }
  if (!sweep) S.headTarget.set(12, 0, 4);
  const prev = S.head.clone();
  S.head.x = damp(S.head.x, S.headTarget.x, sweep ? 5 : 3, dt);
  S.head.z = damp(S.head.z, S.headTarget.z, sweep ? 5 : 3, dt);
  S.headVel.copy(S.head).sub(prev).divideScalar(Math.max(dt, 1e-4));
  // Yön: inceleme modunda sürükle-döndür, süpürmede hıza göre hafif dönüş
  let yawT;
  if (sweep) yawT = 1.1 + clamp(-S.headVel.z * 0.012, -0.35, 0.35);
  else { if (!S.dragging) { S.vyaw *= 0.93; S.vyawF += S.vyaw; } yawT = S.vyawF; }
  S.headYaw = sweep ? damp(S.headYaw, yawT, 3, dt) : yawT;
  vacPivot.position.copy(S.head);
  vacPivot.rotation.y = S.headYaw;
  vac.roller.rotation.x += (S.headVel.length() * 0.06 + 2) * dt;
  fanMat.uniforms.uT.value = S.time;
  fanMat.uniforms.uOn.value = vis;

  // Toz: başlık uzayına dönüştür (yaw ile)
  const c = Math.cos(-S.headYaw), s = Math.sin(-S.headYaw), r = DATA.stages.floor.powers[S.power].radius;
  const hx = S.head.x, hz = S.head.z;
  const { near, far, halfNear, spread } = LASER;
  for (let i = 0; i < DUST_N; i++) {
    let x = D.x[i], z = D.z[i], y = D.y[i], sc = D.s[i];
    const dx = x - hx, dz = z - hz;
    const lx = dx * c + dz * s, lz = -dx * s + dz * c; // başlık yerel koordinatları
    if (D.st[i] === 0) {
      // Lazer yelpazesi içinde mi?
      const inFan = lz > near && lz < far && Math.abs(lx) < halfNear + (lz - near) * spread;
      D.glow[i] = damp(D.glow[i], inFan ? 1 - (lz - near) / (far - near) * 0.55 : 0, 10, dt);
      // Emiş bölgesi (başlık altı)
      if (Math.abs(lx) < 12.5 * r && lz > -2 && lz < 7 * r + 1) { D.st[i] = 1; D.t[i] = 0; }
    } else if (D.st[i] === 1) {
      D.t[i] += dt * 4;
      const k = Math.min(1, D.t[i]);
      D.x[i] = lerp(x, hx, k * 0.4); D.z[i] = lerp(z, hz, k * 0.4); D.y[i] = y + dt * 30;
      sc *= 1 - k; D.glow[i] = 1;
      if (k >= 1) { D.st[i] = 2; D.t[i] = 2 + Math.random() * 6; counts[D.bin[i]]++; collected++; }
    } else {
      D.t[i] -= dt; sc = 0;
      if (D.t[i] <= 0) spawnDust(i);
    }
    _p.set(D.x[i], D.y[i], D.z[i]); _s.setScalar(D.st[i] === 2 ? 0.0001 : sc * vis * (0.55 + D.glow[i] * 1.2));
    _m.compose(_p, _q, _s); dust.setMatrixAt(i, _m);
    _c.copy(DIM).lerp(LIT, D.glow[i]); dust.setColorAt(i, _c);
  }
  dust.instanceMatrix.needsUpdate = true; if (dust.instanceColor) dust.instanceColor.needsUpdate = true;
  vac.dustFill.material.opacity = Math.min(0.85, collected / 1500);
}

/* HUD */
const hud = { temp: $('#temp'), tempBar: $('#tempBar'), nuralState: $('#nuralState'), total: $('#total') };
let shownTemp = 80;
function updateHUD() {
  if (S.stage === 'hair') {
    const h = DATA.stages.hair.heats[S.heat];
    let t = h.temp;
    if (S.nural && S.heat > 0) t = Math.round(lerp(t, Math.min(t, 55), S.dist)); // başa yaklaştıkça ısı düşer
    shownTemp = Math.round(lerp(shownTemp, t, 0.35));
    hud.temp.textContent = shownTemp;
    hud.tempBar.style.setProperty('--v', (shownTemp - 20) / 90);
    hud.nuralState.textContent = !S.nural ? 'Saç derisi koruma kapalı' : S.heat === 0 ? 'Soğuk hava' : S.dist > 0.55 ? 'Başa yakın · ısı düşürüldü' : 'Mesafe güvenli';
    hud.nuralState.dataset.on = S.nural && S.heat > 0 && S.dist > 0.55;
  } else {
    hud.total.textContent = collected.toLocaleString('tr-TR');
    const max = Math.max(10, ...counts);
    counts.forEach((n, i) => { $(`[data-bar="${i}"]`).style.width = (n / max * 100) + '%'; $(`[data-cnt="${i}"]`).textContent = n.toLocaleString('tr-TR'); });
  }
}

/* Hotspot konumları */
const hsEls = $$('.hs');
function placeHotspots() {
  camera.getWorldDirection(camDir);
  for (const b of hsEls) {
    const st = b.dataset.stage, prod = st === 'hair' ? dryer : vac;
    const a = prod.anchors[b.dataset.key];
    const show = st === S.stage && Math.abs(S.mix - (st === 'floor' ? 1 : 0)) < 0.08 && (st === 'hair' || S.mode === 'inspect');
    if (!show) { b.style.opacity = 0; b.style.pointerEvents = 'none'; b.tabIndex = -1; continue; }
    a.getWorldPosition(tmpV);
    // Arka yüzde kalan noktaları soldur
    const center = st === 'hair' ? dryerPivot.getWorldPosition(tmpW) : vacPivot.localToWorld(tmpW.set(0, 40, -20));
    const facing = tmpV.clone().sub(center).normalize().dot(camDir);
    tmpV.project(camera);
    const x = (tmpV.x * 0.5 + 0.5) * W, y = (-tmpV.y * 0.5 + 0.5) * H;
    const vis = facing < 0.35 ? 1 : 0.18;
    b.style.transform = `translate(${x}px, ${y}px)`;
    b.style.opacity = vis; b.style.pointerEvents = vis > 0.5 ? 'auto' : 'none'; b.tabIndex = vis > 0.5 ? 0 : -1;
    if (cardFor === b && !card.dataset.placed) { positionCard(x, y); card.dataset.placed = '1'; } // açılışta bir kez konumlanır, titremez
  }
}
function positionCard(x, y) {
  const cw = card.offsetWidth, ch = card.offsetHeight;
  let cx = x + 22, cy = y - ch / 2;
  if (cx + cw > W - 12) cx = x - cw - 22;
  cy = clamp(cy, 56, H - ch - 12); cx = clamp(cx, 12, W - cw - 12);
  card.style.transform = `translate(${cx}px, ${cy}px)`;
}

// Başlangıç
mh.dataset.stage = ONLY;
requestAnimationFrame(() => mh.classList.add('ready'));
frame();
// Test / önizleme kancası
window.__MH__ = { S, setStage, setMode, get collected() { return collected; } };
