/* Oasis Media — "Vaha yolculuğu" 3D sahnesi (three.js 0.160, siteyle birlikte barındırılır).
   Su üzerinde batan çizgili güneş (logodaki güneş), palmiyeli adacıklar, sudan yükselen rakamlar,
   suyun üstünde yüzen 145 müşteri logosu, ışık sütunu etrafında dönen 24 yayıncı partner.
   Kamera, sayfa kaydırıldıkça bölümlere bağlı duraklar arasında süzülür. */
import * as THREE from '../vendor/three/three.module.min.js';

const root = document.documentElement;
const canvas = document.getElementById('scene');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const D = window.OASIS_DATA || { clients: [], partners: [] };
const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

function fail() {
  root.classList.add('no3d');
  if (canvas) canvas.remove();
  emit('oasis:ready');
}

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
} catch (e) { fail(); }

if (renderer) start();

function start() {
  root.classList.add('has3d');
  THREE.ColorManagement.enabled = false;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  const small = Math.min(innerWidth, innerHeight) < 700;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 1.75));

  const css = getComputedStyle(root);
  const col = (n) => new THREE.Color(css.getPropertyValue(n).trim());
  const C = { sun: col('--sun'), ember: col('--ember'), gold: col('--gold'), palm: col('--palm'), ink: col('--ink') };
  const HORIZON = new THREE.Color('#ffe2c6'), SKY_TOP = new THREE.Color('#cdeeee'), SKY_MID = new THREE.Color('#fbf6ef');

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(HORIZON, 260, 1150);
  const camera = new THREE.PerspectiveCamera(50, innerWidth / innerHeight, 0.5, 4000);

  const SUN_R = 110, SUN_Z = -1000;
  const sunPos = new THREE.Vector3(0, SUN_R * 0.9, SUN_Z);
  const uTime = { value: 0 };

  /* ---------- Gökyüzü ---------- */
  const sky = new THREE.Mesh(new THREE.SphereGeometry(2500, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uSun: { value: new THREE.Vector3() }, uTop: { value: SKY_TOP }, uMid: { value: SKY_MID }, uHor: { value: HORIZON } },
    vertexShader: 'varying vec3 vDir;void main(){vDir=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `uniform vec3 uSun,uTop,uMid,uHor;varying vec3 vDir;
      void main(){float h=vDir.y;vec3 c=mix(uHor,uMid,smoothstep(0.0,0.12,h));c=mix(c,uTop,smoothstep(0.12,0.65,h));
      float s=pow(max(dot(vDir,normalize(uSun)),0.0),6.0);c+=vec3(1.0,0.55,0.2)*s*0.22;gl_FragColor=vec4(c,1.0);}`
  }));
  sky.renderOrder = -2;
  scene.add(sky);

  /* ---------- Güneş: logodaki gibi alt kısmı yatay çizgilerle kesilmiş disk + hale ---------- */
  const sunMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: { uGold: { value: C.gold }, uSun: { value: C.sun }, uEmber: { value: C.ember }, uTime },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `uniform vec3 uGold,uSun,uEmber;uniform float uTime;varying vec2 vUv;
      void main(){vec2 p=(vUv-0.5)*2.8;float d=length(p);float v=(1.0-p.y)*0.5;
      vec3 c=v<0.45?mix(uGold,uSun,v/0.45):mix(uSun,uEmber,(v-0.45)/0.55);
      float disc=1.0-smoothstep(0.995,1.005,d);
      float gap=0.0;if((v>0.62&&v<0.665)||(v>0.725&&v<0.765)||v>0.82)gap=1.0;
      float a=disc*(1.0-gap);
      float halo=exp(-max(d-1.0,0.0)*2.6)*0.45*(1.0-disc)*smoothstep(1.4,1.05,d);
      vec3 hc=mix(uSun,vec3(1.0,0.9,0.75),0.4);
      vec3 outc=mix(hc,c,a);float alpha=max(a,halo*(1.0-gap*disc));
      gl_FragColor=vec4(outc,alpha);}`
  });
  const sun = new THREE.Mesh(new THREE.PlaneGeometry(SUN_R * 2.8, SUN_R * 2.8), sunMat);
  sun.position.copy(sunPos);
  sun.renderOrder = -1;
  scene.add(sun);

  /* ---------- Su: dalga normalleri, gökyüzü yansıması, güneş parıltısı ---------- */
  const water = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), new THREE.ShaderMaterial({
    fog: false,
    uniforms: { uTime, uCam: { value: camera.position }, uSun: { value: sunPos }, uHor: { value: HORIZON }, uTop: { value: SKY_TOP },
      uDeep: { value: new THREE.Color('#5cc4b6') }, uShallow: { value: new THREE.Color('#9fe0d5') }, uGlint: { value: new THREE.Color('#ffd7a8') } },
    vertexShader: 'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
    fragmentShader: `uniform float uTime;uniform vec3 uCam,uSun,uHor,uTop,uDeep,uShallow,uGlint;varying vec3 vW;
      float H(vec2 p){float t=uTime;return sin(p.x*0.07+t*0.8)*0.6+sin(p.y*0.09-t*0.95)*0.5+sin((p.x+p.y)*0.21+t*1.6)*0.25
        +sin((p.x*0.6-p.y)*0.43-t*2.1)*0.14+sin((p.x*1.3+p.y*0.4)*0.9+t*2.8)*0.06;}
      void main(){vec2 p=vW.xz;float e=0.35;
        float dx=H(p+vec2(e,0.0))-H(p-vec2(e,0.0));float dz=H(p+vec2(0.0,e))-H(p-vec2(0.0,e));
        float dist=length(uCam-vW);float k=mix(0.55,0.12,smoothstep(40.0,600.0,dist));
        vec3 n=normalize(vec3(-dx*k,1.0,-dz*k));
        vec3 v=normalize(uCam-vW);vec3 r=reflect(-v,n);
        float fr=0.08+0.85*pow(1.0-max(dot(n,v),0.0),4.0);
        vec3 skyc=mix(uHor,uTop,smoothstep(0.0,0.5,r.y));
        vec3 wc=mix(uShallow,uDeep,smoothstep(0.0,1.0,n.x*4.0+0.5));
        vec3 c=mix(wc,skyc,fr);
        vec3 sd=normalize(uSun-vW);float sp=pow(max(dot(r,sd),0.0),180.0);float gl=pow(max(dot(r,sd),0.0),14.0);
        c+=uGlint*(sp*1.4+gl*0.28);
        float f=smoothstep(220.0,1250.0,dist);c=mix(c,uHor,f);
        gl_FragColor=vec4(c,1.0);}`
  }));
  water.rotation.x = -Math.PI / 2;
  water.position.z = -600;
  scene.add(water);

  /* ---------- Işıklar ---------- */
  scene.add(new THREE.HemisphereLight(0xfff4e6, 0x9fd8cf, 1.05));
  const dirLight = new THREE.DirectionalLight(0xffd2a6, 1.1);
  dirLight.position.set(0, 120, -600);
  scene.add(dirLight);

  /* ---------- Palmiyeli adacıklar ---------- */
  const leafTex = (() => {
    const c = document.createElement('canvas'); c.width = 512; c.height = 128;
    const x = c.getContext('2d'); x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.lineCap = 'round';
    x.lineWidth = 6; x.beginPath(); x.moveTo(4, 64); x.lineTo(508, 64); x.stroke();
    for (let i = 8; i < 500; i += 9) {
      const len = 58 * Math.sin(Math.PI * (0.08 + (i / 512) * 0.9));
      x.lineWidth = 5;
      x.beginPath(); x.moveTo(i, 64); x.lineTo(i + len * 0.55, 64 - len); x.stroke();
      x.beginPath(); x.moveTo(i, 64); x.lineTo(i + len * 0.55, 64 + len); x.stroke();
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 4; return t;
  })();
  const trunkMat = new THREE.MeshLambertMaterial({ color: 0xb78a62 });
  const frondMats = [new THREE.MeshLambertMaterial({ color: 0x1f8c70, map: leafTex, alphaTest: 0.5, side: THREE.DoubleSide }),
    new THREE.MeshLambertMaterial({ color: 0x2aa585, map: leafTex, alphaTest: 0.5, side: THREE.DoubleSide })];
  const sandMat = new THREE.MeshLambertMaterial({ color: 0xf3d7ac });
  const shoalMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, uniforms: { uTime },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform float uTime;varying vec2 vUv;void main(){float d=length(vUv-0.5)*2.0;float a=smoothstep(1.0,0.55,d)*0.55;float ring=smoothstep(0.04,0.0,abs(d-0.62-0.04*sin(uTime*1.2)))*0.5;gl_FragColor=vec4(mix(vec3(0.78,0.95,0.9),vec3(1.0),ring),a+ring*0.4);}'
  });
  const frondGeo = (() => {
    const g = new THREE.PlaneGeometry(6.2, 1.9, 14, 1); g.translate(3.1, 0, 0);
    const pa = g.attributes.position;
    for (let i = 0; i < pa.count; i++) { const x = pa.getX(i) / 6.2; pa.setZ(i, -x * x * 2.6); }
    g.rotateX(-Math.PI / 2); g.computeVertexNormals(); return g;
  })();
  const crowns = [];
  function palm(h, lean) {
    const g = new THREE.Group();
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(lean * 0.25, h * 0.35, 0), new THREE.Vector3(lean * 0.65, h * 0.72, 0), new THREE.Vector3(lean, h, 0)]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 16, 0.32, 7), trunkMat));
    const crown = new THREE.Group(); crown.position.set(lean, h, 0);
    const n = 9;
    for (let k = 0; k < n; k++) {
      const f = new THREE.Mesh(frondGeo, frondMats[k % 2]);
      f.rotation.y = (k / n) * Math.PI * 2 + Math.random() * 0.3;
      f.rotation.z = 0.25 + Math.random() * 0.35;
      crown.add(f);
    }
    crown.userData.phase = Math.random() * 6;
    crowns.push(crown); g.add(crown);
    return g;
  }
  const ISLANDS = [
    [-38, -60, 10, 3], [44, -110, 8, 2], [-56, -215, 12, 3], [52, -300, 9, 2], [-50, -390, 9, 2], [55, -470, 10, 3],
    [-36, -700, 9, 2], [40, -820, 13, 3], [-130, -890, 22, 4], [150, -910, 18, 3], [-260, -960, 26, 5], [280, -980, 24, 4]];
  ISLANDS.forEach(([x, z, r, np]) => {
    const isl = new THREE.Group(); isl.position.set(x, 0, z);
    const sand = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 12), sandMat); sand.scale.set(r, r * 0.16, r); sand.position.y = -r * 0.03; isl.add(sand);
    const shoal = new THREE.Mesh(new THREE.CircleGeometry(r * 1.9, 40), shoalMat); shoal.rotation.x = -Math.PI / 2; shoal.position.y = 0.06; isl.add(shoal);
    for (let i = 0; i < np; i++) {
      const p = palm(9 + Math.random() * 6, (Math.random() < 0.5 ? -1 : 1) * (1.5 + Math.random() * 2.5));
      p.position.set((Math.random() - 0.5) * r * 0.9, r * 0.1, (Math.random() - 0.5) * r * 0.9);
      p.rotation.y = Math.random() * Math.PI * 2;
      isl.add(p);
    }
    scene.add(isl);
  });

  /* ---------- Sudan yükselen rakamlar (yansımalarıyla) ---------- */
  const NUMBERS = [['300+', 'site üzerinde yayın'], ['2K+', 'tamamlanmış proje'], ['10', 'yıllık tecrübe'], ['145', 'marka']];
  const numberObjs = [];
  function numberTexture(num, label) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 600;
    const x = c.getContext('2d');
    const grd = x.createLinearGradient(0, 40, 0, 430); grd.addColorStop(0, '#ffb400'); grd.addColorStop(0.5, '#fe8732'); grd.addColorStop(1, '#d54900');
    x.fillStyle = grd; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    let fs = 400; x.font = `800 ${fs}px "Bricolage Grotesque", "Arial Black", sans-serif`;
    while (x.measureText(num).width > 960) { fs -= 10; x.font = `800 ${fs}px "Bricolage Grotesque", "Arial Black", sans-serif`; }
    x.fillText(num, 512, 430);
    x.fillStyle = '#142440'; x.font = '600 64px "Instrument Sans", "Segoe UI", sans-serif';
    x.fillText(label, 512, 540);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; return t;
  }
  const numMat = (map, reflection) => new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, side: THREE.DoubleSide,
    uniforms: { map: { value: map }, uTime, uRefl: { value: reflection ? 1 : 0 }, uFade: { value: 0 } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: `uniform sampler2D map;uniform float uTime,uRefl,uFade;varying vec2 vUv;
      void main(){vec2 uv=vUv;if(uRefl>0.5){uv.x+=sin(uv.y*60.0+uTime*3.0)*0.006;}
      vec4 c=texture2D(map,uv);float a=c.a*uFade;if(uRefl>0.5){a*=0.28*smoothstep(0.0,0.9,uv.y);c.rgb=mix(c.rgb,vec3(0.6,0.85,0.8),0.35);}
      gl_FragColor=vec4(c.rgb,a);}`
  });
  function buildNumbers() {
    numberObjs.forEach((o) => { scene.remove(o.g); });
    numberObjs.length = 0;
    NUMBERS.forEach(([num, label], i) => {
      const tex = numberTexture(num, label);
      const g = new THREE.Group();
      const w = 26, h = w * 600 / 1024;
      const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), numMat(tex, false)); front.position.y = h / 2;
      const refl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), numMat(tex, true)); refl.scale.y = -1; refl.position.y = -h / 2;
      g.add(front, refl);
      scene.add(g);
      numberObjs.push({ g, front, refl, base: g.position.clone() });
    });
  }
  buildNumbers();
  if (document.fonts && document.fonts.load) Promise.all([document.fonts.load('800 100px "Bricolage Grotesque"'), document.fonts.load('600 40px "Instrument Sans"')]).then(buildNumbers, () => {});

  /* ---------- Logo kartları: atlas doku + tek InstancedMesh ---------- */
  const cardMat = (atlas, cols, rows, square) => new THREE.ShaderMaterial({
    transparent: true, side: THREE.DoubleSide, fog: false,
    uniforms: { map: { value: atlas }, uGrid: { value: new THREE.Vector2(cols, rows) }, uInk: { value: C.ink }, uHi: { value: -1 }, uSun: { value: C.sun }, uAspect: { value: square ? 1 : 1.6 } },
    vertexShader: `attribute vec2 aCell;attribute float aDark;attribute float aId;varying vec2 vUv;varying vec2 vCell;varying float vDark;varying float vId;
      void main(){vUv=uv;vCell=aCell;vDark=aDark;vId=aId;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.0);}`,
    fragmentShader: `uniform sampler2D map;uniform vec2 uGrid;uniform vec3 uInk,uSun;uniform float uHi,uAspect;varying vec2 vUv,vCell;varying float vDark,vId;
      float rbox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;}
      void main(){vec2 p=(vUv-0.5)*vec2(uAspect,1.0);float d=rbox(p,vec2(0.5*uAspect,0.5),0.12);
        float hi=step(abs(vId-uHi),0.5);
        float border=smoothstep(0.0,-0.004,d)-smoothstep(-0.02,-0.03,d);
        if(d>0.0)discard;
        vec2 uv=(vCell+vec2(vUv.x,1.0-vUv.y))/uGrid;uv.y=1.0-uv.y;
        vec4 l=texture2D(map,uv);
        vec3 card=mix(vec3(1.0),uInk,vDark);
        vec3 c=mix(card,l.rgb,l.a);
        c=mix(c,uSun,border*(0.25+0.75*hi));
        gl_FragColor=vec4(c,1.0);}`
  });
  function loadImg(src) { return new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; }); }
  let loaded = 0; const total = D.clients.length + D.partners.length;
  const tick = () => { loaded++; emit('oasis:progress', total ? loaded / total : 1); };
  async function atlasFrom(list, cw, ch, pad, cover) {
    const cols = Math.ceil(Math.sqrt(list.length * (ch / cw))) || 1, rows = Math.ceil(list.length / cols) || 1;
    const c = document.createElement('canvas'); c.width = cols * cw; c.height = rows * ch;
    const x = c.getContext('2d');
    const imgs = await Promise.all(list.map((it) => loadImg(it.logo).then((im) => { tick(); return im; })));
    imgs.forEach((im, i) => {
      if (!im) return;
      const cx = (i % cols) * cw, cy = Math.floor(i / cols) * ch;
      const s = cover ? Math.max(cw / im.width, ch / im.height) : Math.min((cw - pad * 2) / im.width, (ch - pad * 2) / im.height);
      const w = im.width * s, h = im.height * s;
      x.save(); x.beginPath(); x.rect(cx, cy, cw, ch); x.clip();
      x.drawImage(im, cx + (cw - w) / 2, cy + (ch - h) / 2, w, h); x.restore();
    });
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8; t.generateMipmaps = true;
    return { tex: t, cols, rows };
  }
  function instanced(list, atlas, w, h, square) {
    const geo = new THREE.PlaneGeometry(w, h);
    const n = list.length;
    const cell = new Float32Array(n * 2), dark = new Float32Array(n), id = new Float32Array(n);
    list.forEach((it, i) => { cell[i * 2] = i % atlas.cols; cell[i * 2 + 1] = Math.floor(i / atlas.cols); dark[i] = it.dark ? 1 : 0; id[i] = i; });
    geo.setAttribute('aCell', new THREE.InstancedBufferAttribute(cell, 2));
    geo.setAttribute('aDark', new THREE.InstancedBufferAttribute(dark, 1));
    geo.setAttribute('aId', new THREE.InstancedBufferAttribute(id, 1));
    const mesh = new THREE.InstancedMesh(geo, cardMat(atlas.tex, atlas.cols, atlas.rows, square), n);
    mesh.frustumCulled = false;
    return mesh;
  }

  // Müşteriler: suyun üstünde yüzen kartlar
  const FIELD = { z0: -405, z1: -540, x: 40 };
  let clientMesh = null; const clientSlots = [];
  // Partnerler: ışık sütunu etrafında dönen halka
  const RING = new THREE.Group(); RING.position.set(34, 0, -650); scene.add(RING);
  let partnerMesh = null;
  const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 1.4, 46, 24, 1, true), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false, uniforms: { uTime, uSun: { value: C.sun }, uGold: { value: C.gold } },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader: 'uniform float uTime;uniform vec3 uSun,uGold;varying vec2 vUv;void main(){float a=(1.0-vUv.y)*0.75+0.1;float b=0.5+0.5*sin(vUv.y*40.0-uTime*4.0);gl_FragColor=vec4(mix(uSun,uGold,b*0.6),a*(0.55+0.45*b));}'
  }));
  pillar.position.y = 23; RING.add(pillar);
  const glowDisc = new THREE.Mesh(new THREE.CircleGeometry(26, 48), shoalMat); glowDisc.rotation.x = -Math.PI / 2; glowDisc.position.y = 0.08; RING.add(glowDisc);
  const linkGeo = new THREE.BufferGeometry(); const linkPos = new Float32Array(24 * 6);
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3));
  const links = new THREE.LineSegments(linkGeo, new THREE.LineBasicMaterial({ color: C.sun, transparent: true, opacity: 0.45 }));
  RING.add(links);

  (async () => {
    const [ca, pa] = await Promise.all([
      D.clients.length ? atlasFrom(D.clients, 256, 160, 22, false) : null,
      D.partners.length ? atlasFrom(D.partners, 256, 256, 0, true) : null
    ]);
    if (ca) {
      clientMesh = instanced(D.clients, ca, 5.2, 3.25, false);
      const n = D.clients.length, cols = 11;
      for (let i = 0; i < n; i++) {
        const r = Math.floor(i / cols), c = i % cols;
        clientSlots.push({ x: -FIELD.x + (c + (r % 2) * 0.5) * (FIELD.x * 2 / cols) + (Math.random() - 0.5) * 1.4,
          z: FIELD.z0 - r * ((FIELD.z0 - FIELD.z1) / Math.ceil(n / cols)) + (Math.random() - 0.5) * 2,
          ph: Math.random() * 6.3, rz: (Math.random() - 0.5) * 0.35, lift: 0 });
      }
      scene.add(clientMesh);
    }
    if (pa) { partnerMesh = instanced(D.partners, pa, 5, 5, true); RING.add(partnerMesh); }
    emit('oasis:ready');
  })();

  /* ---------- Altın toz parçacıkları ---------- */
  const dustN = small ? 500 : 1100;
  const dustPos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) { dustPos[i * 3] = (Math.random() - 0.5) * 160; dustPos[i * 3 + 1] = 1 + Math.random() * 30; dustPos[i * 3 + 2] = 80 - Math.random() * 900; }
  const dustGeo = new THREE.BufferGeometry(); dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dust = new THREE.Points(dustGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false, uniforms: { uTime, uPx: { value: renderer.getPixelRatio() }, uCol: { value: C.sun } },
    vertexShader: 'uniform float uTime,uPx;varying float vA;void main(){vec3 p=position;p.y+=sin(uTime*0.6+p.x*0.3)*0.8;p.x+=sin(uTime*0.4+p.z*0.1)*0.6;vec4 mv=modelViewMatrix*vec4(p,1.0);gl_PointSize=uPx*110.0/-mv.z;vA=clamp(1.0-(-mv.z)/400.0,0.0,1.0);gl_Position=projectionMatrix*mv;}',
    fragmentShader: 'uniform vec3 uCol;varying float vA;void main(){float d=length(gl_PointCoord-0.5);if(d>0.5)discard;gl_FragColor=vec4(uCol,smoothstep(0.5,0.0,d)*0.75*vA);}'
  }));
  scene.add(dust);

  /* ---------- Kamera durakları (bölüm id → konum, bakış) ---------- */
  const KF = {
    intro: [[0, 2.5, 120], [0, 40, SUN_Z]],
    hero: [[0, 7, 70], [0, 48, SUN_Z]],
    hakkimizda: [[12, 6, -5], [-34, 9, -200]],
    rakamlar: [[0, 8, -150], [0, 9, -340]],
    hizmetler: [[-4, 10, -335], [40, 4, -430]],
    projeler: [[6, 7, -362], [-30, 7, -450]],
    musteriler: [[0, 22, -380], [0, 0, -465]],
    'is-ortaklari': [[-2, 12, -585], [30, 9, -650]],
    iletisim: [[0, 9, -760], [0, 52, SUN_Z]]
  };
  const ids = Object.keys(KF).filter((k) => k !== 'intro' && document.getElementById(k));
  let tops = []; // her durağın "tam varış" kaydırma konumu: bölüm ekranın ortasına geldiğinde
  function measure() {
    tops = ids.map((id, i) => {
      const el = document.getElementById(id), r = el.getBoundingClientRect();
      return i === 0 ? 0 : Math.max(0, r.top + scrollY + r.height / 2 - innerHeight / 2);
    });
  }
  const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  const camPos = v3(KF.intro[0]), camLook = v3(KF.intro[1]);
  const goalPos = camPos.clone(), goalLook = camLook.clone();
  const ss = (t) => t * t * (3 - 2 * t);
  function heroLook(kf) { // geniş ekranda bakışı sola kaydırıp güneşi sağa al
    if (kf !== KF.hero && kf !== KF.intro) return kf[1];
    const ar = innerWidth / innerHeight, wide = ar > 1.15;
    if (kf === KF.intro) return kf[1];
    return [wide ? -330 : 0, ar < 0.8 ? -270 : kf[1][1], kf[1][2]];
  }
  function scrollGoal() {
    const y = scrollY;
    let i = 0; while (i < tops.length - 1 && y >= tops[i + 1]) i++;
    const a = KF[ids[i]], b = KF[ids[Math.min(i + 1, ids.length - 1)]];
    const la = heroLook(a), lb = heroLook(b);
    const span = Math.max(1, (tops[i + 1] || tops[i] + innerHeight) - tops[i]);
    const t = i === ids.length - 1 ? 0 : ss(Math.min(1, Math.max(0, (y - tops[i]) / span)));
    goalPos.set(a[0][0] + (b[0][0] - a[0][0]) * t, a[0][1] + (b[0][1] - a[0][1]) * t, a[0][2] + (b[0][2] - a[0][2]) * t);
    goalLook.set(la[0] + (lb[0] - la[0]) * t, la[1] + (lb[1] - la[1]) * t, la[2] + (lb[2] - la[2]) * t);
    return ids[t > 0.5 ? Math.min(i + 1, ids.length - 1) : i];
  }

  /* ---------- Açılış: güneş sudan doğar ---------- */
  const intro = document.getElementById('intro');
  const numSec = document.getElementById('rakamlar');
  let introOn = !!(intro && !intro.classList.contains('is-skipped'));
  let sunRise = introOn ? 0 : 1;
  document.addEventListener('oasis:intro-done', () => { introOn = false; });

  /* ---------- Fare: paralaks + kart üzerine gelme ---------- */
  const mouse = new THREE.Vector2(0, 0), ndc = new THREE.Vector2(9, 9);
  const ray = new THREE.Raycaster();
  const tip = document.getElementById('logoTip');
  let hover = -1;
  addEventListener('pointermove', (e) => {
    mouse.set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    if (tip) { tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; }
  }, { passive: true });

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight;
    camera.fov = innerWidth / innerHeight < 0.8 ? 64 : 50;
    camera.updateProjectionMatrix();
    measure();
  }
  resize();
  addEventListener('resize', resize);
  addEventListener('load', measure);
  new ResizeObserver(measure).observe(document.body);

  /* ---------- Döngü ---------- */
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), sc = new THREE.Vector3(1, 1, 1), pv = new THREE.Vector3();
  let last = performance.now(), running = true, active = 'hero';
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(loop); } });
  function loop(now) {
    if (!running) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    uTime.value += reduced ? 0 : dt;
    const t = uTime.value;

    if (introOn) { goalPos.copy(v3(KF.intro[0])); goalLook.copy(v3(KF.intro[1])); }
    else active = scrollGoal();
    sunRise = Math.min(1, sunRise + dt * (introOn ? 0.45 : 1.2));
    sun.position.y = -SUN_R * 0.9 + (SUN_R * 1.8) * ss(sunRise);

    const k = reduced ? 1 : 1 - Math.pow(introOn ? 0.2 : 0.02, dt);
    camPos.lerp(goalPos, k); camLook.lerp(goalLook, k);
    camera.position.set(camPos.x + mouse.x * (reduced ? 0 : 3), camPos.y - mouse.y * (reduced ? 0 : 1.5), camPos.z);
    camera.lookAt(camLook);
    sky.position.copy(camera.position);
    sky.material.uniforms.uSun.value.copy(sun.position).sub(camera.position);

    crowns.forEach((c) => { c.rotation.z = Math.sin(t * 0.9 + c.userData.phase) * 0.06; c.rotation.x = Math.cos(t * 0.7 + c.userData.phase) * 0.04; });

    // rakamlar: kamera yaklaşınca sudan yükselir
    // rakamlar: "Rakamlar" bölümü boyunca sırayla kameranın önünde sudan yükselir, bekler, batar
    let np = -1;
    if (numSec) {
      const r = numSec.getBoundingClientRect();
      np = (innerHeight * 0.75 - r.top) / (r.height + innerHeight * 0.1);
    }
    numberObjs.forEach((o, i) => {
      const q = np * numberObjs.length - i; // bu rakamın kendi 0..1 aralığı
      const up = q > 0 && q < 1 ? ss(Math.min(1, q / 0.22)) * (1 - ss(Math.max(0, (q - 0.78) / 0.22))) : 0;
      const dist = innerWidth / innerHeight < 0.8 ? 46 : 42;
      o.g.position.set(camera.position.x * 0.5, -16 + 17 * up + Math.sin(t * 1.2 + i) * 0.25 * up, camera.position.z - dist);
      o.g.rotation.y = Math.sin(t * 0.5 + i) * 0.06;
      o.g.visible = up > 0.001;
      o.front.material.uniforms.uFade.value = up; o.refl.material.uniforms.uFade.value = up;
    });

    // yüzen müşteri kartları
    if (clientMesh) {
      let hit = -1;
      if (finePointer && active === 'musteriler' && !reduced) {
        ray.setFromCamera(ndc, camera);
        const hits = ray.intersectObject(clientMesh); if (hits.length) hit = hits[0].instanceId;
      }
      if (hit !== hover) {
        hover = hit; clientMesh.material.uniforms.uHi.value = hit;
        if (tip) { tip.hidden = hit < 0; if (hit >= 0) tip.textContent = window.oasisClientName ? window.oasisClientName(D.clients[hit].key) : D.clients[hit].key; }
        document.documentElement.classList.toggle('logo-hover', hit >= 0);
      }
      clientSlots.forEach((s, i) => {
        s.lift += ((i === hover ? 2.4 : 0) - s.lift) * Math.min(1, dt * 8);
        e3.set(-1.05 + Math.sin(t * 0.9 + s.ph) * 0.06, 0, s.rz + Math.sin(t * 0.7 + s.ph) * 0.05);
        q.setFromEuler(e3);
        pv.set(s.x, 0.6 + Math.sin(t * 1.1 + s.ph) * 0.28 + s.lift, s.z);
        m4.compose(pv, q, sc); clientMesh.setMatrixAt(i, m4);
      });
      clientMesh.instanceMatrix.needsUpdate = true;
    }
    // partner halkası
    if (partnerMesh) {
      const n = D.partners.length, R = 17;
      RING.rotation.y = reduced ? 0 : t * 0.12;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, y = 8 + Math.sin(a * 3 + t * 0.8) * 1.6;
        pv.set(Math.cos(a) * R, y, Math.sin(a) * R);
        e3.set(0, -a + Math.PI / 2, 0); q.setFromEuler(e3);
        m4.compose(pv, q, sc); partnerMesh.setMatrixAt(i, m4);
        linkPos.set([0, y + 6 * Math.sin(t + i), 0, pv.x * 0.92, y, pv.z * 0.92], i * 6);
      }
      partnerMesh.instanceMatrix.needsUpdate = true; linkGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
