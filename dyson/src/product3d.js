// Orijinal ürün fotoğrafından 3D model – saf WebGL (kütüphanesiz, ~6 KB).
// Derinlik haritasıyla "şişirilmiş" ön + arka yüz; kaplama fotoğrafın kendisi, gerçek zamanlı ışık.
// Sahne birimi = CSS pikseli (x sağa, y yukarı); kamera z=0 düzlemini masthead'e birebir oturtur.

const VS = `
attribute vec2 aUV; attribute float aZ; attribute vec3 aN;
uniform mat4 uM, uVP; uniform float uAspect, uSide;
varying vec2 vUV; varying vec3 vN, vP;
void main() {
  vec4 p = uM * vec4(aUV.x - 0.5, -(aUV.y - 0.5) * uAspect, aZ * uSide, 1.0);
  vP = p.xyz; vUV = aUV;
  vN = normalize(mat3(uM) * vec3(aN.xy, aN.z * uSide));
  gl_Position = uVP * p;
}`;
const FS = `
precision highp float;
uniform sampler2D uTex; uniform vec3 uCam; uniform float uSide;
varying vec2 vUV; varying vec3 vN, vP;
void main() {
  vec4 t = texture2D(uTex, vUV);
  if (t.a < 0.5) discard;
  vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
  vec3 v = normalize(uCam - vP);
  vec3 L1 = normalize(vec3(-0.6, 0.7, 1.0)), L2 = normalize(vec3(1.0, 0.2, -0.6)), L3 = normalize(vec3(0.8, -0.5, 0.7));
  float d = max(dot(n, L1), 0.0) * 0.55 + max(dot(n, L2), 0.0) * 0.35 + max(dot(n, L3), 0.0) * 0.18;
  float s = pow(max(dot(n, normalize(L1 + v)), 0.0), 40.0) * 0.35 + pow(max(dot(n, normalize(L2 + v)), 0.0), 24.0) * 0.25;
  float rimL = pow(1.0 - max(dot(n, v), 0.0), 3.0) * 0.25;
  float base = uSide > 0.0 ? 0.62 : 0.45; // arka yüz biraz daha koyu
  gl_FragColor = vec4(t.rgb * (base + d) + vec3(s + rimL), 1.0);
}`;

function loadImage(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

// ── küçük matris yardımcıları (sütun öncelikli 4×4) ──
const mul = (a, b) => { const o = new Float32Array(16); for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; } return o; };
const tr = (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
const sc = (s) => new Float32Array([s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]);
const rY = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); };
const rX = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); };
const rZ = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); };
const xf = (m, x, y, z, w = 1) => [m[0] * x + m[4] * y + m[8] * z + m[12] * w, m[1] * x + m[5] * y + m[9] * z + m[13] * w, m[2] * x + m[6] * y + m[10] * z + m[14] * w, m[3] * x + m[7] * y + m[11] * z + m[15] * w];

export async function createProduct(canvas, P, W, H, dpr) {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true, premultipliedAlpha: true }) || canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
  if (!gl) throw new Error('WebGL yok');
  const isGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
  canvas.width = W * dpr; canvas.height = H * dpr;
  if (!isGL2) gl.getExtension('OES_element_index_uint');

  // ── program ──
  const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  const prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  gl.useProgram(prog);
  const U = (n) => gl.getUniformLocation(prog, n);
  const uM = U('uM'), uVP = U('uVP'), uAspect = U('uAspect'), uSide = U('uSide'), uCam = U('uCam');
  const locUV = gl.getAttribLocation(prog, 'aUV'), locZ = gl.getAttribLocation(prog, 'aZ'), locN = gl.getAttribLocation(prog, 'aN');
  const an = gl.getExtension('EXT_texture_filter_anisotropic');

  /** Fotoğraf + derinlik haritasından çizilebilir parça */
  async function makePart(D) {
    const [img, dimg] = await Promise.all([loadImage(D.tex), loadImage(D.depth)]);
    const dc = document.createElement('canvas'); dc.width = dimg.width; dc.height = dimg.height;
    const dx = dc.getContext('2d'); dx.drawImage(dimg, 0, 0);
    const dd = dx.getImageData(0, 0, dc.width, dc.height).data;
    const depthAt = (u, v) => {
      const x = Math.min(dc.width - 1, Math.max(0, u * (dc.width - 1))), y = Math.min(dc.height - 1, Math.max(0, v * (dc.height - 1)));
      const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(dc.width - 1, x0 + 1), y1 = Math.min(dc.height - 1, y0 + 1), fx = x - x0, fy = y - y0;
      const s = (xx, yy) => dd[(yy * dc.width + xx) * 4] / 255;
      return (s(x0, y0) * (1 - fx) + s(x1, y0) * fx) * (1 - fy) + (s(x0, y1) * (1 - fx) + s(x1, y1) * fx) * fy;
    };
    const aspect = D.h / D.w, zScale = D.depthPx / D.w;
    const nx = Math.min(200, dc.width * 2), ny = Math.min(440, dc.height * 2), vc = (nx + 1) * (ny + 1);
    const uv = new Float32Array(vc * 2), z = new Float32Array(vc), nrm = new Float32Array(vc * 3);
    const du = 1 / nx, dv = 1 / ny;
    for (let j = 0, i = 0; j <= ny; j++) for (let k = 0; k <= nx; k++, i++) { uv[i * 2] = k * du; uv[i * 2 + 1] = j * dv; z[i] = depthAt(k * du, j * dv) * zScale; }
    for (let j = 0, i = 0; j <= ny; j++) for (let k = 0; k <= nx; k++, i++) {
      const zl = z[j * (nx + 1) + Math.max(0, k - 1)], zr = z[j * (nx + 1) + Math.min(nx, k + 1)];
      const zu = z[Math.max(0, j - 1) * (nx + 1) + k], zd = z[Math.min(ny, j + 1) * (nx + 1) + k];
      const gx = (zr - zl) / (2 * du), gy = (zu - zd) / (2 * dv * aspect);
      const l = Math.hypot(gx, gy, 1); nrm[i * 3] = -gx / l; nrm[i * 3 + 1] = -gy / l; nrm[i * 3 + 2] = 1 / l;
    }
    const idx = new (vc > 65535 ? Uint32Array : Uint16Array)(nx * ny * 6);
    for (let j = 0, t = 0; j < ny; j++) for (let k = 0; k < nx; k++) {
      const a = j * (nx + 1) + k, b = a + 1, c = a + nx + 1, d = c + 1;
      idx[t++] = a; idx[t++] = c; idx[t++] = b; idx[t++] = b; idx[t++] = c; idx[t++] = d;
    }
    const mk = (data) => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; };
    const bUV = mk(uv), bZ = mk(z), bN = mk(nrm);
    const ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (isGL2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, 8);
    const bind = (b, loc, size) => { gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0); };
    return {
      aspect, zScale, depthAt, D,
      draw(M) {
        bind(bUV, locUV, 2); bind(bZ, locZ, 1); bind(bN, locN, 3);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.uniformMatrix4fv(uM, false, M); gl.uniform1f(uAspect, aspect);
        for (const side of [1, -1]) { gl.uniform1f(uSide, side); gl.drawElements(gl.TRIANGLES, idx.length, idx instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0); }
      },
    };
  }

  const main = await makePart(P);
  const { aspect, zScale, depthAt } = main;

  // ── kamera ──
  const fov = 24 * Math.PI / 180, dist = (H / 2) / Math.tan(fov / 2), near = 10, far = dist * 4, f = 1 / Math.tan(fov / 2);
  const proj = new Float32Array([f / (W / H), 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, 2 * far * near / (near - far), 0]);
  const cam = [W / 2, -H / 2, dist];
  const VP = mul(proj, tr(-cam[0], -cam[1], -cam[2]));
  gl.uniformMatrix4fv(uVP, false, VP); gl.uniform3f(uCam, cam[0], cam[1], cam[2]);

  const st = { yaw: 0, pitch: 0, roll: 0, px: 0.5, py: 0.5, box: { x: 0, y: 0, w: 100, h: 100 } };
  let M = sc(1), R = sc(1);
  function apply() {
    const b = st.box;
    R = mul(rY(st.yaw), mul(rX(st.pitch), rZ(-st.roll)));
    M = mul(tr(b.x + st.px * b.w, -(b.y + st.py * b.h), 0), mul(R, mul(sc(b.w), tr(0.5 - st.px, -(0.5 - st.py) * aspect, 0))));
  }
  const toScreen = (p) => { const c = xf(VP, p[0], p[1], p[2]); return { x: (c[0] / c[3] * 0.5 + 0.5) * W, y: (-c[1] / c[3] * 0.5 + 0.5) * H }; };
  const facingOf = (p, nx, ny, nz) => { const n = xf(R, nx, ny, nz, 0), v = [cam[0] - p[0], cam[1] - p[1], cam[2] - p[2]]; return (n[0] * v[0] + n[1] * v[1] + n[2] * v[2]) / Math.hypot(...v); };
  /** Ana modelin yerel koordinatındaki noktayı ekrana izdüşür */
  const projectLocal = (x, y, zz) => { const p = xf(M, x, y, zz); return { ...toScreen(p), facing: facingOf(p, 0, 0, 1) }; };

  // ── Takılabilir parça (manyetik başlık): hava çıkışına, ürünün ön ekseni (+Z) boyunca ──
  const parts = {};
  let att = null; // { part, slide }
  let mount = null; // { x, y, z } ana model yerel koordinatı
  function attMatrix(a) {
    const D = a.part.D, s = D.w / P.w * (D.scale || 1); // set fotoğrafındaki oran × yaka uyum katsayısı
    const cv = D.collar ? D.collar.v : 0.5;
    // parça yatayı (u) → ana +Z; parça dikeyi → ana +Y; parça kalınlığı → ana X
    const local = mul(tr(mount.x, mount.y, mount.z - 0.02 + a.slide), mul(rY(-Math.PI / 2), mul(sc(s), tr(0.5, (cv - 0.5) * a.part.aspect, 0))));
    return mul(M, local);
  }

  gl.enable(gl.DEPTH_TEST); gl.clearColor(0, 0, 0, 0);
  return {
    aspect, depthAt,
    setBox(box, px = 0.5, py = 0.5) { st.box = box; st.px = px; st.py = py; apply(); },
    setRotation(yaw, pitch, roll = 0) { st.yaw = yaw * Math.PI / 180; st.pitch = pitch * Math.PI / 180; st.roll = roll * Math.PI / 180; apply(); },
    /** Fotoğraf üzerindeki (fx,fy) noktasının ekran konumu; facing>0 ise nokta kameraya bakıyor */
    project(fx, fy, lift = 0) { return projectLocal(fx - 0.5, -(fy - 0.5) * aspect, depthAt(fx, fy) * zScale + lift); },
    /** Ürünün ön yönü (yerel +Z) ekranda hangi yöne bakıyor */
    forward(fx, fy) { const a = this.project(fx, fy), b = this.project(fx, fy, 0.25); return { x: b.x - a.x, y: b.y - a.y, facing: a.facing }; },
    /** Başlıkların takılacağı nokta (fotoğraf oranı) */
    setMount(fx, fy) { mount = { x: fx - 0.5, y: -(fy - 0.5) * aspect, z: depthAt(fx, fy) * zScale }; },
    async loadPart(key, D) { if (!parts[key]) parts[key] = makePart(D); return parts[key]; },
    /** Başlığı tak (key) ya da çıkar (null); slide: takılma animasyonu için ileri mesafe (ana birim) */
    async attach(key) { if (!key) { att = null; return; } const part = await parts[key]; att = { part, slide: 0.9 }; },
    setSlide(v) { if (att) att.slide = v; },
    get attached() { return att ? { slide: att.slide } : null; },
    /** Takılı başlığın çıkış ağzı ve yakası (ekran): hava akışı ve özellik noktası için */
    attachPoints() {
      if (!att) return null;
      const D = att.part.D, s = D.w / P.w * (D.scale || 1), len = s, cv = D.collar ? D.collar.v : 0.5;
      const ov = D.outlet ? D.outlet.v : 0.5;
      const z0 = mount.z + att.slide, dy = -(ov - cv) * att.part.aspect * s;
      return {
        outlet: projectLocal(mount.x, mount.y + dy, z0 + len - 0.02),
        outletR: (D.outlet ? D.outlet.h : 0.5) * att.part.aspect * s / 2, // ana birimde yarıçap
        collar: projectLocal(mount.x, mount.y + (D.collar ? D.collar.h : 0.3) * att.part.aspect * s * 0.5, z0 + len * 0.12),
        len,
      };
    },
    /** Ana birimdeki uzunluğu (ekran pikseli) – yaklaşık */
    unitPx() { return st.box.w; },
    render() {
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      main.draw(M);
      if (att && mount) att.part.draw(attMatrix(att));
    },
  };
}
