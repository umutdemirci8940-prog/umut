// Prosedürel 3D ürün modelleri (birim: cm). Harici model dosyası gerekmez.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const V2 = (x, y) => new THREE.Vector2(x, y);

/** Y ekseni etrafında döndürülen profili +X eksenine yatırır. */
function latheX(points, seg = 96) {
  const g = new THREE.LatheGeometry(points.map(([r, y]) => V2(r, y)), seg);
  g.rotateZ(-Math.PI / 2);
  return g;
}

/** Yumuşak köşe için profil noktalarını çoğaltır (her köşeye küçük yay). */
function rounded(pts, rad = 0.18, steps = 4) {
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const p = V2(...pts[i]);
    if (i === 0 || i === pts.length - 1) { out.push([p.x, p.y]); continue; }
    const a = V2(...pts[i - 1]), b = V2(...pts[i + 1]);
    const da = a.clone().sub(p), db = b.clone().sub(p);
    const r = Math.min(rad, da.length() / 2.2, db.length() / 2.2);
    const pa = p.clone().add(da.normalize().multiplyScalar(r));
    const pb = p.clone().add(db.normalize().multiplyScalar(r));
    for (let s = 0; s <= steps; s++) {
      const t = s / steps; // ikinci dereceden Bezier
      const x = (1 - t) ** 2 * pa.x + 2 * (1 - t) * t * p.x + t * t * pb.x;
      const y = (1 - t) ** 2 * pa.y + 2 * (1 - t) * t * p.y + t * t * pb.y;
      out.push([x, y]);
    }
  }
  return out;
}

/** Daireden yassı ağıza doğru incelen açık uçlu boru (+X yönünde). */
function loft(r0, r1, len, flatY, flatZ, seg = 64) {
  const g = new THREE.CylinderGeometry(r1, r0, len, seg, 16, true);
  const pos = g.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i), t = (y + len / 2) / len, e = t * t * (3 - 2 * t);
    pos.setX(i, pos.getX(i) * (1 + (flatZ - 1) * e));
    pos.setZ(i, pos.getZ(i) * (1 + (flatY - 1) * e));
  }
  g.computeVertexNormals();
  g.translate(0, len / 2, 0);
  g.rotateZ(-Math.PI / 2); // +Y → +X
  return g;
}

function dotTexture(bg = '#ffffff', dot = '#1a1a1a', n = 10, r = 0.28) {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'); x.fillStyle = bg; x.fillRect(0, 0, 128, 128); x.fillStyle = dot;
  const s = 128 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    x.beginPath(); x.arc((i + 0.5 + (j % 2) * 0.5) * s, (j + 0.5) * s, s * r, 0, Math.PI * 2); x.fill();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const metal = (color, rough = 0.32) => new THREE.MeshPhysicalMaterial({ color, metalness: 0.85, roughness: rough, clearcoat: 0.6, clearcoatRoughness: 0.2 });
const satin = (color, rough = 0.42) => new THREE.MeshPhysicalMaterial({ color, metalness: 0.1, roughness: rough, clearcoat: 0.8, clearcoatRoughness: 0.25 });

function anchor(parent, name, x, y, z) {
  const o = new THREE.Object3D(); o.name = name; o.position.set(x, y, z); parent.add(o); return o;
}

/* ───────────────────────── Supersonic Nural ───────────────────────── */
export function buildDryer() {
  const root = new THREE.Group();
  const mats = {
    body: metal('#b8b6b2', 0.28),
    accent: metal('#b9764e', 0.3),
    dark: new THREE.MeshStandardMaterial({ color: '#141416', roughness: 0.55, metalness: 0.2 }),
    filter: new THREE.MeshPhysicalMaterial({ color: '#b9764e', map: dotTexture('#ffffff', '#2a2420', 9, 0.3), metalness: 0.7, roughness: 0.4 }),
    led: new THREE.MeshBasicMaterial({ color: '#ff8a3d' }),
    ledOff: new THREE.MeshBasicMaterial({ color: '#2a2a2a' }),
    attach: satin('#8d8c8a', 0.35),
  };
  mats.filter.map.repeat.set(14, 3);

  // Gövde başlığı: ortası açık silindir (Air Multiplier halkası)
  const RI = 1.95, RO = 3.4, L = 4.8;
  const main = new THREE.Mesh(latheX(rounded([[RI, -3.4], [RI, L - 0.05], [RI + 0.25, L], [RO - 0.25, L], [RO, L - 0.3], [RO, -3.4]], 0.22)), mats.body);
  const back = new THREE.Mesh(latheX(rounded([[RI, -3.38], [RI, -L + 0.1], [RI + 0.2, -L], [RO - 0.3, -L], [RO, -L + 0.3], [RO, -3.38]], 0.25)), mats.accent);
  const slot = new THREE.Mesh(new THREE.TorusGeometry(RI + 0.32, 0.07, 10, 96), mats.dark);
  slot.rotation.y = Math.PI / 2; slot.position.x = L + 0.01;
  const inner = new THREE.Mesh(new THREE.CylinderGeometry(RI - 0.01, RI - 0.01, 2 * L - 0.2, 64, 1, true), new THREE.MeshStandardMaterial({ color: '#2b2b2e', roughness: 0.7, side: THREE.BackSide }));
  inner.rotation.z = Math.PI / 2;
  const head = new THREE.Group(); head.add(main, back, slot, inner);
  // Isı göstergesi LED'leri (arka yüz)
  const leds = [];
  for (let i = 0; i < 3; i++) {
    const m = new THREE.Mesh(new THREE.CircleGeometry(0.14, 16), mats.ledOff);
    const a = Math.PI / 2 + (i - 1) * 0.32;
    m.position.set(-L - 0.02, Math.sin(a) * 2.7, Math.cos(a) * 2.7);
    m.rotation.y = -Math.PI / 2; head.add(m); leds.push(m);
  }
  // Nural mesafe sensörü (ön üst)
  const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshPhysicalMaterial({ color: '#05060a', roughness: 0.05, clearcoat: 1 }));
  sensor.position.set(L - 0.6, RO - 0.02, 0); sensor.scale.set(1, 0.4, 1); head.add(sensor);
  root.add(head);

  // Sap: motor gövdesi + filtre + kapak + kablo
  const R = 1.55;
  const handle = new THREE.Group();
  const upper = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 6.2, 64), mats.body); upper.position.y = -5.4;
  const filt = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.02, R + 0.02, 3.4, 64, 1, false), mats.filter); filt.position.y = -10.2;
  const cap = new THREE.Mesh(latheX([[0, 0], [R, 0], [R, -0.4], [R - 0.25, -0.7], [0.5, -0.8], [0, -0.8]].map(([r, y]) => [r, y])), mats.body);
  cap.geometry.rotateZ(Math.PI / 2); cap.position.y = -11.9;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R + 0.01, 0.05, 8, 64), mats.dark); ring.rotation.x = Math.PI / 2; ring.position.y = -8.5;
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, -12.6, 0), new THREE.Vector3(0, -15, 0), new THREE.Vector3(-1.5, -19, 1), new THREE.Vector3(-5, -24, 3),
  ]), 40, 0.32, 10), new THREE.MeshStandardMaterial({ color: '#1b1b1d', roughness: 0.6 }));
  // Düğmeler (arka yüz) ve soğuk çekim (ön)
  const btnG = new RoundedBoxGeometry(0.5, 1.1, 0.5, 3, 0.2);
  for (let i = 0; i < 2; i++) { const b = new THREE.Mesh(btnG, mats.dark); b.position.set(-R + 0.08, -4.2 - i * 1.5, 0); handle.add(b); }
  const cold = new THREE.Mesh(new RoundedBoxGeometry(0.4, 0.9, 0.7, 3, 0.18), mats.accent); cold.position.set(R - 0.05, -4.1, 0);
  handle.add(upper, filt, cap, ring, cable, cold);
  root.add(handle);

  // Manyetik başlıklar
  const attachments = {
    none: new THREE.Group(),
    concentrator: (() => {
      const g = new THREE.Group();
      const collar = new THREE.Mesh(new THREE.CylinderGeometry(RO - 0.02, RO - 0.02, 0.9, 64, 1, true), mats.attach); collar.rotation.z = -Math.PI / 2; collar.position.x = L + 0.45;
      const body = new THREE.Mesh(loft(RO - 0.02, RO - 0.4, 3.6, 0.28, 1.18), new THREE.MeshPhysicalMaterial({ color: '#8d8c8a', roughness: 0.35, clearcoat: 0.8, side: THREE.DoubleSide }));
      body.position.x = L + 0.9; g.add(collar, body); return g;
    })(),
    smoothing: (() => {
      const g = new THREE.Group();
      const body = new THREE.Mesh(loft(RO - 0.02, RO + 0.2, 2.6, 0.55, 1.12), new THREE.MeshPhysicalMaterial({ color: '#b9764e', metalness: 0.6, roughness: 0.3, side: THREE.DoubleSide }));
      body.position.x = L; const face = new THREE.Mesh(new THREE.CircleGeometry(RO + 0.2, 48), new THREE.MeshStandardMaterial({ color: '#2a2a2c', map: dotTexture('#ffffff', '#000', 16, 0.22), roughness: 0.6 }));
      face.material.map.repeat.set(4, 4); face.rotation.y = Math.PI / 2; face.position.x = L + 2.6; face.scale.set(1, 0.55, 1.12);
      g.add(body, face); return g;
    })(),
    diffuser: (() => {
      const g = new THREE.Group();
      const bowl = new THREE.Mesh(latheX(rounded([[RO - 0.1, 0], [RO + 0.1, 0.8], [5.6, 3.2], [6.2, 3.6], [6.1, 3.8], [1.2, 3.8], [0.01, 3.8]], 0.3)), mats.attach);
      bowl.position.x = L;
      const prongG = new THREE.CapsuleGeometry(0.26, 1.6, 4, 10); prongG.rotateZ(-Math.PI / 2);
      for (let ring = 0; ring < 2; ring++) {
        const n = ring ? 14 : 7, rad = ring ? 4.6 : 2.4;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + ring * 0.2; const p = new THREE.Mesh(prongG, mats.attach);
          p.position.set(L + 4.6, Math.sin(a) * rad, Math.cos(a) * rad); g.add(p);
        }
      }
      g.add(bowl); return g;
    })(),
  };
  for (const a of Object.values(attachments)) { a.visible = false; root.add(a); }
  attachments.none.visible = true;

  // Etkileşim noktaları (hotspot) için çapalar
  const anchors = {
    multiplier: anchor(root, 'multiplier', L + 0.05, -0.6, RI + 0.7),
    heat: anchor(root, 'heat', -2.6, 1.4, RO - 0.4),
    nural: anchor(root, 'nural', L - 0.6, RO + 0.1, 0),
    motor: anchor(root, 'motor', 0.6, -6, R),
    magnetic: anchor(root, 'magnetic', L + 0.4, -RO + 0.4, 1.5),
  };
  root.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = false; });

  return {
    root, mats, leds, attachments, anchors,
    /** Hava çıkışı (yerel uzayda) – parçacık yayıcısı için */
    nozzle: { x: L, rIn: RI + 0.1, rOut: RI + 0.55 },
    setColors(body, accent) { mats.body.color.set(body); mats.accent.color.set(accent); mats.filter.color.set(accent); attachments.smoothing.children[0].material.color.set(accent); },
    setAttachment(key) { for (const [k, g] of Object.entries(attachments)) g.visible = k === key; },
    setHeat(level, color) { leds.forEach((m, i) => { m.material = i < level ? mats.led : mats.ledOff; }); mats.led.color.set(color); },
  };
}

/* ───────────────────────── V15 Detect ───────────────────────── */
export function buildVacuum() {
  const root = new THREE.Group();
  const mats = {
    body: metal('#b9bab6', 0.3),
    accent: satin('#e3ae17', 0.35),
    accent2: satin('#7b4fa8', 0.4),
    dark: new THREE.MeshStandardMaterial({ color: '#17171a', roughness: 0.5, metalness: 0.2 }),
    clear: new THREE.MeshPhysicalMaterial({ color: '#dfe7ea', metalness: 0, roughness: 0.05, transparent: true, opacity: 0.28, clearcoat: 1, depthWrite: false, side: THREE.DoubleSide }),
    felt: new THREE.MeshStandardMaterial({ color: '#2a2a2e', roughness: 1, map: dotTexture('#ffffff', '#b8b8b8', 24, 0.18) }),
    laser: new THREE.MeshBasicMaterial({ color: '#3dff6e' }),
  };
  mats.felt.map.repeat.set(10, 3);

  // Zemin başlığı (Laser Slim Fluffy) – ileri yön +Z
  const head = new THREE.Group();
  const shell = new THREE.Mesh(new RoundedBoxGeometry(25, 5, 9, 4, 1.4), mats.dark); shell.position.set(0, 3, -0.5);
  const topPlate = new THREE.Mesh(new RoundedBoxGeometry(21, 0.6, 6.5, 2, 0.25), mats.accent); topPlate.position.set(0, 5.45, -1);
  const roller = new THREE.Mesh(new THREE.CylinderGeometry(2.7, 2.7, 23.6, 48), mats.felt); roller.rotation.z = Math.PI / 2; roller.position.set(0, 2.7, 3.8);
  const emitter = new THREE.Mesh(new RoundedBoxGeometry(1.4, 1.1, 1.2, 2, 0.3), mats.laser); emitter.position.set(-11.6, 1.6, 4.4);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 2.2, 6, 32), mats.body);
  neck.position.set(0, 6.2, -3.4); neck.rotation.x = -0.6;
  head.add(shell, topPlate, roller, emitter, neck);
  root.add(head);

  // Boru
  const ANG = THREE.MathUtils.degToRad(55);
  const dir = new THREE.Vector3(0, Math.sin(ANG), -Math.cos(ANG));
  const pivot = new THREE.Vector3(0, 7.5, -5);
  const WL = 70;
  const wand = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.8, WL, 40), mats.accent);
  wand.position.copy(pivot).addScaledVector(dir, WL / 2);
  wand.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const wandBand = new THREE.Mesh(new THREE.CylinderGeometry(1.86, 1.86, 3, 40), mats.body);
  wandBand.position.copy(pivot).addScaledVector(dir, WL - 2); wandBand.quaternion.copy(wand.quaternion);
  root.add(wand, wandBand);

  // Gövde: yerel +Y = boru yönü (kullanıcıya doğru), yerel -Z = alt taraf
  const body = new THREE.Group();
  body.position.copy(pivot).addScaledVector(dir, WL);
  body.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  const yUp = (g, y0, y1, z = 0) => { const len = y1 - y0; g.translate(0, y0 + len / 2, z); return g; };
  const inlet = new THREE.Mesh(yUp(new THREE.CylinderGeometry(2.2, 2.2, 3, 32), -1, 2), mats.body);
  const bin = new THREE.Mesh(yUp(new THREE.CylinderGeometry(5, 5, 17, 48, 1, true), 2, 19, -2.6), mats.clear);
  const binBase = new THREE.Mesh(yUp(new THREE.CylinderGeometry(5.05, 4.6, 1, 48), 1.5, 2.5, -2.6), mats.accent2);
  const shroud = new THREE.Mesh(yUp(new THREE.CylinderGeometry(3, 3, 15, 40), 3, 18, -2.6), new THREE.MeshPhysicalMaterial({ color: '#c9c9c6', map: dotTexture('#ffffff', '#3a3a3a', 12, 0.3), metalness: 0.8, roughness: 0.35 }));
  shroud.material.map.repeat.set(10, 6);
  const dust = new THREE.Mesh(yUp(new THREE.CylinderGeometry(4.9, 4.9, 3, 48), 2.5, 5.5, -2.6), new THREE.MeshStandardMaterial({ color: '#6b6158', roughness: 1, transparent: true, opacity: 0.0 }));
  const cyclones = new THREE.Group();
  const cg = yUp(new THREE.CylinderGeometry(0.75, 0.25, 6, 16), 0, 6);
  cg.rotateX(Math.PI); cg.translate(0, 6, 0);
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2, c = new THREE.Mesh(cg, mats.accent2);
    c.position.set(Math.sin(a) * 3.7, 19, Math.cos(a) * 3.7 - 2.6); cyclones.add(c);
  }
  const cycCore = new THREE.Mesh(yUp(new THREE.CylinderGeometry(2.6, 3.2, 7, 40), 19, 26, -2.6), mats.body);
  const cycCap = new THREE.Mesh(yUp(new THREE.CylinderGeometry(4.8, 5, 2.2, 48), 25.4, 27.6, -2.6), mats.accent2);
  const motor = new THREE.Mesh(yUp(new THREE.CylinderGeometry(3.6, 3.9, 9, 48), 27.4, 36.4, -1.2), mats.body);
  const exhaust = new THREE.Mesh(yUp(new THREE.CylinderGeometry(3.3, 3.6, 1.6, 48), 36.4, 38, -1.2), mats.accent);
  const exhGrill = new THREE.Mesh(new THREE.CircleGeometry(3.2, 48), new THREE.MeshStandardMaterial({ color: '#222', map: dotTexture('#777', '#111', 14, 0.3), roughness: 0.7 }));
  exhGrill.rotation.x = -Math.PI / 2; exhGrill.position.set(0, 38.02, -1.2);
  // Tabanca kabza + tetik + batarya
  const handlePath = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 33, -4.5), new THREE.Vector3(0, 35.5, -10), new THREE.Vector3(0, 37.5, -16)]);
  const grip = new THREE.Mesh(new THREE.TubeGeometry(handlePath, 24, 1.9, 20), mats.body);
  const gripEnd = new THREE.Mesh(new RoundedBoxGeometry(4.2, 4.6, 3.6, 3, 1.2), mats.dark); gripEnd.position.set(0, 38.4, -17.2);
  const trigger = new THREE.Mesh(new RoundedBoxGeometry(1.2, 2.6, 1.6, 2, 0.5), mats.accent2); trigger.position.set(0, 32.6, -8.6); trigger.rotation.x = 0.35;
  const battery = new THREE.Mesh(new RoundedBoxGeometry(5.4, 13, 5.2, 4, 1.4), mats.dark); battery.position.set(0, 27.5, -11.2); battery.rotation.x = -0.3;
  const batteryClip = new THREE.Mesh(new RoundedBoxGeometry(2, 3.4, 0.6, 2, 0.25), mats.accent); batteryClip.position.set(0, 21.4, -9.4); batteryClip.rotation.x = -0.3;
  // LCD ekran (arka üst, kullanıcıya bakar)
  const lcdCanvas = document.createElement('canvas'); lcdCanvas.width = 256; lcdCanvas.height = 192;
  const lcdTex = new THREE.CanvasTexture(lcdCanvas); lcdTex.colorSpace = THREE.SRGBColorSpace;
  const lcdFrame = new THREE.Mesh(new RoundedBoxGeometry(5.8, 1.2, 4.8, 3, 0.45), mats.dark); lcdFrame.position.set(0, 38.6, -11.6); lcdFrame.rotation.x = -0.25;
  const lcd = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 3.45), new THREE.MeshBasicMaterial({ map: lcdTex, toneMapped: false }));
  lcd.rotation.x = -Math.PI / 2 - 0.25; lcd.position.set(0, 39.25, -11.75);
  lcd.rotation.order = 'YXZ';
  body.add(inlet, bin, binBase, shroud, dust, cyclones, cycCore, cycCap, motor, exhaust, exhGrill, grip, gripEnd, trigger, battery, batteryClip, lcdFrame, lcd);
  root.add(body);

  const anchors = {
    laser: anchor(head, 'laser', -11.6, 2.4, 5.2),
    piezo: anchor(body, 'piezo', 0, 10, 2.6),
    lcd: anchor(body, 'lcd', 0, 39.6, -11.6),
    motor: anchor(body, 'motor', 0, 32, 2.8),
    battery: anchor(body, 'battery', 0, 25, -14),
    hepa: anchor(body, 'hepa', 0, 38.4, 1.4),
  };

  return {
    root, mats, head, roller, body, lcdCanvas, lcdTex, dustFill: dust, anchors,
    setColors(main, accent, accent2) { mats.body.color.set(main); mats.accent.color.set(accent); mats.accent2.color.set(accent2); },
  };
}
