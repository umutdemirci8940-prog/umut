#!/usr/bin/env node
'use strict';
/**
 * KFSOOO kampanya görselinden (assets/kfsooo/kv-1200.jpg) banner parçalarını türetir → assets/kfsooo-derived/
 *  - sticker.png   : "KFSOOO MENÜLER" beyaz etiket (flood-fill ile şeffaflaştırılmış, poligonla kırpılmış)
 *  - cola.png      : Coca-Cola yazı logosu (beyazlık anahtarı)
 *  - avatar-a.png / avatar-b.png : iki yüzün yuvarlak kesitleri (yumuşak kenar)
 *  - photo.jpg     : pan için fotoğraf (1100 px)
 *  - bg.jpg        : 970x250 bulanık/koyu arka plan
 * Kullanım: NODE_PATH=$(npm root -g) node tools/kfsooo-derive.js
 */
const fs = require('fs'); const path = require('path'); const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const src = path.join(root, 'assets', 'kfsooo', 'kv-1200.jpg');
const out = path.join(root, 'assets', 'kfsooo-derived'); fs.mkdirSync(out, { recursive: true });
const save = (name, dataUrl) => { fs.writeFileSync(path.join(out, name), Buffer.from(dataUrl.split(',')[1], 'base64')); console.log('✔', name, (fs.statSync(path.join(out, name)).size / 1024).toFixed(0) + ' KB'); };
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1200, height: 1200 } });
  const u = 'data:image/jpeg;base64,' + fs.readFileSync(src).toString('base64');
  await p.setContent(`<body style="margin:0"><img id="i" src="${u}"></body>`); await p.waitForFunction(() => document.getElementById('i').complete);
  const r = await p.evaluate(() => {
    const img = document.getElementById('i'); const W = img.naturalWidth, H = img.naturalHeight;
    const full = document.createElement('canvas'); full.width = W; full.height = H; const fx = full.getContext('2d'); fx.drawImage(img, 0, 0);
    const out = {};
    const crop = (x, y, w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(full, x, y, w, h, 0, 0, w, h); return c; };
    // --- Etiket: flood fill (beyaz) + delik doldurma + poligon kırpma ---
    { const X = 170, Y = 840, Wc = 860, Hc = 230; const c = crop(X, Y, Wc, Hc); const cx = c.getContext('2d'); const d = cx.getImageData(0, 0, Wc, Hc); const px = d.data;
      const isWhite = (i) => px[i] >= 214 && px[i + 1] >= 214 && px[i + 2] >= 214;
      const mask = new Uint8Array(Wc * Hc); const stack = [];
      const seeds = [[560 - X, 870 - Y], [420 - X, 868 - Y], [760 - X, 868 - Y]];
      for (const [sx, sy] of seeds) { const i = sy * Wc + sx; if (isWhite(i * 4) && !mask[i]) { mask[i] = 1; stack.push(i); } }
      while (stack.length) { const i = stack.pop(); const x = i % Wc, y = (i / Wc) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= Wc || ny >= Hc) continue; const j = ny * Wc + nx; if (!mask[j] && isWhite(j * 4)) { mask[j] = 1; stack.push(j); } } }
      // Poligon: etiketin yaklaşık dış hattı (kırpma penceresi koordinatları)
      const poly = [[14, 52], [58, 6], [838, 2], [846, 118], [836, 224], [522, 228], [500, 182], [18, 184]];
      const inPoly = (x, y) => { let ins = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) ins = !ins; } return ins; };
      for (let i = 0; i < mask.length; i++) if (mask[i] && !inPoly(i % Wc, (i / Wc) | 0)) mask[i] = 0;
      // Delikleri doldur: maske dışı ama kenardan ulaşılamayan pikseller (siyah harfler)
      const outside = new Uint8Array(Wc * Hc); const st2 = [];
      for (let x = 0; x < Wc; x++) { st2.push(x, (Hc - 1) * Wc + x); } for (let y = 0; y < Hc; y++) { st2.push(y * Wc, y * Wc + Wc - 1); }
      for (const i of st2) if (!mask[i]) outside[i] = 1;
      while (st2.length) { const i = st2.pop(); if (mask[i]) continue; const x = i % Wc, y = (i / Wc) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= Wc || ny >= Hc) continue; const j = ny * Wc + nx; if (!mask[j] && !outside[j]) { outside[j] = 1; st2.push(j); } } }
      let minx = Wc, miny = Hc, maxx = 0, maxy = 0;
      for (let i = 0; i < mask.length; i++) { const on = mask[i] || !outside[i]; px[i * 4 + 3] = on ? 255 : 0; if (on) { const x = i % Wc, y = (i / Wc) | 0; if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; } }
      // Kenar yumuşatma: maske sınırındaki piksellere yarı alfa
      const a2 = new Uint8ClampedArray(px.length / 4); for (let i = 0; i < a2.length; i++) a2[i] = px[i * 4 + 3];
      for (let y = 1; y < Hc - 1; y++) for (let x = 1; x < Wc - 1; x++) { const i = y * Wc + x; if (a2[i] === 255) { let n = 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (a2[i + dy * Wc + dx] === 0) n++; if (n) px[i * 4 + 3] = n >= 2 ? 120 : 190; } }
      cx.putImageData(d, 0, 0);
      const pad = 4; const w = maxx - minx + 1 + pad * 2, h = maxy - miny + 1 + pad * 2; const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; c2.getContext('2d').drawImage(c, minx - pad, miny - pad, w, h, 0, 0, w, h);
      out.sticker = { url: c2.toDataURL('image/png'), w, h, box: [minx + X, miny + Y, maxx + X, maxy + Y] }; }
    // --- Coca-Cola: beyazlık anahtarı ---
    { const X = 1000, Y = 1092, Wc = 165, Hc = 78; const c = crop(X, Y, Wc, Hc); const cx = c.getContext('2d'); const d = cx.getImageData(0, 0, Wc, Hc); const px = d.data;
      for (let i = 0; i < px.length; i += 4) { const mn = Math.min(px[i], px[i + 1], px[i + 2]); const sat = Math.max(px[i], px[i + 1], px[i + 2]) - mn; let a = (mn - 165) / 60; if (sat > 45) a -= (sat - 45) / 60; a = Math.max(0, Math.min(1, a)); px[i] = px[i + 1] = px[i + 2] = 255; px[i + 3] = Math.round(a * 255); }
      cx.putImageData(d, 0, 0); out.cola = { url: c.toDataURL('image/png'), w: Wc, h: Hc }; }
    // --- Avatarlar ---
    const avatar = (cxp, cyp, rad) => { const S = 220; const c = document.createElement('canvas'); c.width = S; c.height = S; const x = c.getContext('2d'); x.save(); x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 2, 0, Math.PI * 2); x.clip(); x.drawImage(full, cxp - rad, cyp - rad, rad * 2, rad * 2, 0, 0, S, S); x.restore(); return c.toDataURL('image/png'); };
    out.avatarA = avatar(592, 300, 150); out.avatarB = avatar(792, 335, 140);
    // --- Fotoğraf (1100 px) ---
    { const c = document.createElement('canvas'); c.width = 1100; c.height = 1100; const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(full, 0, 0, 1100, 1100); out.photo = c.toDataURL('image/jpeg', 0.84); }
    // --- Arka plan 970x250: orta bant, bulanık, koyu ---
    { const c = document.createElement('canvas'); c.width = 970; c.height = 250; const x = c.getContext('2d'); x.filter = 'blur(26px) brightness(.42) saturate(1.25)'; x.drawImage(full, 0, 180, W, 250 / 970 * W, -60, -60, 1090, 370); x.filter = 'none'; out.bg = c.toDataURL('image/jpeg', 0.72); }
    return out;
  });
  save('sticker.png', r.sticker.url); console.log('  etiket', r.sticker.w + 'x' + r.sticker.h, 'kutu', r.sticker.box);
  save('cola.png', r.cola.url); save('avatar-a.png', r.avatarA); save('avatar-b.png', r.avatarB); save('photo.jpg', r.photo); save('bg.jpg', r.bg);
  // Film küçük resimleri (sitedeki kampanya filmlerinin kareleri → 72 px yuvarlak)
  const frames = [['double-zinger', 'assets/kfc-pages/video/008-double-zinger-1920x840-20260325145344-frame-c.jpg'], ['strips', 'assets/kfc-pages/video/011-strips-1920x840-20260325144827-frame-c.jpg'], ['mighty-cruncher', 'assets/kfc-pages/video/015-mighty-cruncher-1920x840-20260325145206-frame-c.jpg'], ['hot-shots', 'assets/kfc-pages/video/019-hotshot-1920x840-20260325145451-frame-c.jpg']];
  for (const [key, f] of frames) {
    const fp = path.join(root, f); if (!fs.existsSync(fp)) { console.log('yok:', f); continue; }
    const d = 'data:image/jpeg;base64,' + fs.readFileSync(fp).toString('base64');
    const png = await p.evaluate(async (u) => { const i = new Image(); i.src = u; await i.decode(); const S = 72; const c = document.createElement('canvas'); c.width = S; c.height = S; const x = c.getContext('2d'); const side = Math.min(i.width, i.height) * .8; x.drawImage(i, (i.width - side) / 2, (i.height - side) / 2, side, side, 0, 0, S, S); return c.toDataURL('image/jpeg', 0.85); }, d);
    fs.writeFileSync(path.join(out, `thumb-${key}.jpg`), Buffer.from(png.split(',')[1], 'base64'));
  }
  console.log('✔ film küçük resimleri');
  // Kontrol sayfası
  const du = (n) => 'data:image/' + (n.endsWith('png') ? 'png' : 'jpeg') + ';base64,' + fs.readFileSync(path.join(out, n)).toString('base64');
  await p.setViewportSize({ width: 1100, height: 420 });
  await p.setContent(`<body style="margin:0;background:#3a1010;padding:14px;display:flex;flex-wrap:wrap;gap:16px;align-items:center"><img src="${du('sticker.png')}" style="width:520px;background:repeating-conic-gradient(#555 0 25%,#333 0 50%) 0 0/16px 16px"><img src="${du('cola.png')}" style="height:70px;background:#1a5"><img src="${du('avatar-a.png')}" style="height:120px"><img src="${du('avatar-b.png')}" style="height:120px"><img src="${du('bg.jpg')}" style="width:485px;height:125px"></body>`);
  await p.waitForTimeout(300); await p.screenshot({ path: path.join(out, 'check.jpg'), type: 'jpeg', quality: 85 });
  await b.close();
})();
