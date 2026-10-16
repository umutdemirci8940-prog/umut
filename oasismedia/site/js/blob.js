/* Oasis Media — sıvı metal 3D obje (three.js UMD, klasik betik; dosyaya çift tıklanarak açıldığında da çalışır).
   Yüzey 3B simplex gürültüyle dalgalanır; ince film (sedef) renkleri marka turuncusundan pembe ve turkuaza akar.
   Fare objeyi iter, kaydırma hızı dalgayı büyütür, tıklama dalga patlatır. Her bölümde konum/boyut/karakter değişir. */
(function () {
  'use strict';
  var THREE = window.THREE, root = document.documentElement, canvas = document.getElementById('blob');
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var emit = function (n) { document.dispatchEvent(new CustomEvent(n)); };
  var renderer;
  try {
    if (!THREE || !canvas) throw 0;
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { root.classList.add('no3d'); if (canvas) canvas.remove(); emit('oasis:ready'); return; }
  root.classList.add('has3d');
  THREE.ColorManagement.enabled = false;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  var small = Math.min(innerWidth, innerHeight) < 700;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.1, 100);
  camera.position.set(0, 0, 6);

  var NOISE = [
    'vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}',
    'vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}',
    'float snoise(vec3 v){const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);',
    'vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;',
    'vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;',
    'i=mod289(i);vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));',
    'float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);',
    'vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);',
    'vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;',
    'vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);',
    'vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;',
    'vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;',
    'return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));}'
  ].join('\n');

  var U = {
    uTime: { value: 0 }, uAmp: { value: 0.32 }, uFreq: { value: 1.1 }, uHue: { value: 0 },
    uMouse: { value: new THREE.Vector3(9, 9, 9) }, uPush: { value: 0 }, uRipple: { value: 0 }, uRippleT: { value: 10 }
  };
  var mat = new THREE.ShaderMaterial({
    uniforms: U, extensions: { derivatives: true },
    vertexShader: NOISE + `
      uniform float uTime,uAmp,uFreq,uPush,uRipple,uRippleT;uniform vec3 uMouse;
      varying vec3 vN;varying vec3 vP;varying float vD;
      float field(vec3 p){
        float n=snoise(p*uFreq+vec3(uTime*0.22,uTime*0.17,uTime*0.13));
        n+=0.18*snoise(p*uFreq*1.9-vec3(uTime*0.3));
        return n;}
      void main(){
        vec3 p=position;vec3 nrm=normalize(normal);
        float d=field(p)*uAmp;
        // fare: imlecin yakınındaki yüzey dışa doğru şişer
        vec3 wp=(modelMatrix*vec4(p,1.0)).xyz;float md=distance(wp,uMouse);
        d+=uPush*0.45*exp(-md*md*1.6);
        // tıklama: yüzeyde yayılan halka dalga
        float rr=abs(length(p.xy)-uRippleT*1.6);d+=uRipple*0.22*exp(-rr*rr*14.0);
        vec3 disp=p+nrm*d;vD=d;
        vec4 mv=modelViewMatrix*vec4(disp,1.0);vP=mv.xyz;vN=normalMatrix*nrm;
        gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `
      uniform float uTime,uHue;varying vec3 vN;varying vec3 vP;varying float vD;
      vec3 pal(float t){ // marka turuncusundan pembe-mor ve turkuaza akan ince film renkleri
        vec3 a=vec3(0.78,0.62,0.62),b=vec3(0.32,0.32,0.30),c=vec3(1.0,1.0,1.0),d=vec3(0.02,0.20,0.48);
        return a+b*cos(6.28318*(c*t+d));}
      void main(){
        vec3 n=normalize(cross(dFdx(vP),dFdy(vP)));
        vec3 v=normalize(-vP);
        float fr=pow(1.0-max(dot(n,v),0.0),2.2);
        vec3 film=pal(fr*0.9+vD*0.9+uHue+n.y*0.15);
        vec3 l1=normalize(vec3(0.6,0.8,0.7)),l2=normalize(vec3(-0.8,-0.2,0.5));
        float diff=max(dot(n,l1),0.0)*0.55+0.45;
        float sp=pow(max(dot(reflect(-l1,n),v),0.0),60.0);float sp2=pow(max(dot(reflect(-l2,n),v),0.0),24.0);
        vec3 base=mix(vec3(1.0,0.55,0.22),film,0.55+0.45*fr);
        vec3 col=base*diff+vec3(1.0)*sp*0.9+vec3(1.0,0.85,0.7)*sp2*0.35;
        col=mix(col,vec3(1.0,0.97,0.94),fr*0.35);
        gl_FragColor=vec4(col,1.0);}`
  });
  var blob = new THREE.Mesh(new THREE.IcosahedronGeometry(1, small ? 48 : 96), mat);
  scene.add(blob);

  // yörüngede dönen küçük uydular (marka turuncusu ve turkuaz)
  var sats = [];
  [[0xfe8732, 0.11, 1.75, 0.55], [0x0c9a82, 0.07, 2.05, -0.8], [0xffb400, 0.05, 1.55, 1.2]].forEach(function (s) {
    var m = new THREE.Mesh(new THREE.SphereGeometry(s[1], 32, 16), new THREE.MeshBasicMaterial({ color: s[0] }));
    m.userData = { r: s[2], sp: s[3], ph: Math.random() * 6 }; scene.add(m); sats.push(m);
  });

  /* Bölüm durumları: konum (ekran yüzdesi), ölçek, dalga gücü/sıklığı, renk kayması */
  var STATES = {
    hero: { x: 0.24, y: 0.0, s: 1.0, amp: 0.36, freq: 0.85, hue: 0.0 },
    hakkimizda: { x: 0.32, y: 0.0, s: 0.66, amp: 0.3, freq: 1.0, hue: 0.25 },
    rakamlar: { x: 0.0, y: 0.34, s: 0.42, amp: 0.4, freq: 0.75, hue: 0.5 },
    hizmetler: { x: 0.34, y: 0.28, s: 0.34, amp: 0.32, freq: 1.1, hue: 0.7 },
    projeler: { x: 0.36, y: 0.33, s: 0.3, amp: 0.3, freq: 1.0, hue: 0.9 },
    musteriler: { x: 0.38, y: 0.36, s: 0.26, amp: 0.42, freq: 0.9, hue: 0.15 },
    'is-ortaklari': { x: 0.2, y: 0.0, s: 0.36, amp: 0.26, freq: 0.9, hue: 0.4 },
    iletisim: { x: 0.33, y: 0.3, s: 0.46, amp: 0.38, freq: 0.8, hue: 0.05 }
  };
  var order = Object.keys(STATES).filter(function (id) { return document.getElementById(id); });
  var cur = { x: 0.24, y: 0.02, s: 0.0, amp: 0.34, freq: 1.0, hue: 0 };
  function goal() {
    var mid = innerHeight / 2, best = order[0], bd = 1e9;
    order.forEach(function (id) {
      var r = document.getElementById(id).getBoundingClientRect();
      var c = Math.max(r.top, Math.min(mid, r.bottom)); var d = Math.abs(c - mid);
      if (d < bd) { bd = d; best = id; }
    });
    var g = STATES[best];
    if (innerWidth / innerHeight < 0.8) g = { x: best === 'hero' ? 0.12 : 0.28, y: best === 'hero' ? 0.24 : 0.36, s: best === 'hero' ? 0.5 : 0.3, amp: g.amp, freq: g.freq, hue: g.hue };
    return g;
  }

  var mouse = new THREE.Vector2(0, 0), mouseW = new THREE.Vector3(9, 9, 9), push = 0, vel = 0, lastY = scrollY;
  addEventListener('pointermove', function (e) {
    mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    var v = new THREE.Vector3(mouse.x, mouse.y, 0.5).unproject(camera).sub(camera.position).normalize();
    var t = (blob.position.z + 0.8 - camera.position.z) / v.z; mouseW.copy(camera.position).addScaledVector(v, t);
  }, { passive: true });
  addEventListener('pointerdown', function () { if (!reduced) { U.uRipple.value = 1; U.uRippleT.value = 0; } });

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  var last = performance.now(), running = true, t = 0;
  document.addEventListener('visibilitychange', function () { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(loop); } });
  function loop(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000); last = now; t += reduced ? 0 : dt;
    var g = goal(), k = 1 - Math.pow(0.04, dt);
    ['x', 'y', 's', 'amp', 'freq', 'hue'].forEach(function (p) { cur[p] += (g[p] - cur[p]) * k; });
    // kaydırma hızı dalgayı büyütür
    var dy = scrollY - lastY; lastY = scrollY; vel += (Math.min(60, Math.abs(dy)) - vel) * 0.1;
    var halfH = Math.tan(camera.fov * Math.PI / 360) * camera.position.z, halfW = halfH * camera.aspect;
    blob.position.set(cur.x * 2 * halfW + mouse.x * 0.12, cur.y * 2 * halfH + mouse.y * 0.08, 0);
    var sc = cur.s * (halfH / 1.9) * (1 + Math.sin(t * 1.3) * 0.015);
    blob.scale.setScalar(Math.max(0.0001, sc));
    blob.rotation.y += dt * (0.15 + vel * 0.01); blob.rotation.x = Math.sin(t * 0.3) * 0.25 + mouse.y * 0.25;
    var near = mouseW.distanceTo(blob.position) < sc * 1.9;
    push += ((near && !reduced ? 1 : 0) - push) * Math.min(1, dt * 4);
    U.uTime.value = t; U.uAmp.value = cur.amp + vel * 0.006; U.uFreq.value = cur.freq; U.uHue.value = cur.hue + t * 0.02;
    U.uMouse.value.copy(mouseW); U.uPush.value = push;
    U.uRippleT.value += dt * 0.9; U.uRipple.value *= Math.pow(0.25, dt);
    sats.forEach(function (m, i) {
      var a = t * m.userData.sp + m.userData.ph, r = m.userData.r * sc;
      m.position.set(blob.position.x + Math.cos(a) * r, blob.position.y + Math.sin(a * 0.7 + i) * r * 0.45, blob.position.z + Math.sin(a) * r);
      m.scale.setScalar(sc / 1.2);
    });
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
  emit('oasis:ready');
})();
