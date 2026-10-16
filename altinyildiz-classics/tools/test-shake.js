// Sallama algılama testi (iPhone emülasyonu, 60 Hz sensör sinyali). Kullanım: NODE_PATH=$(npm root -g) node tools/test-shake.js
const { chromium, devices } = require('playwright');
const path = require('path');
const wave = (p, amp, axis, hz, n) => p.evaluate(([amp, axis, hz, n]) => new Promise((res) => {
  let i = 0; const iv = setInterval(() => {
    const v = amp * Math.sin(2 * Math.PI * hz * i / 60), g = { x: 0, y: 9.81, z: 0.4 }; g[axis] += v;
    const e = new Event('devicemotion'); e.accelerationIncludingGravity = g; e.acceleration = null; window.dispatchEvent(e);
    if (++i > n) { clearInterval(iv); res(); }
  }, 16);
}), [amp, axis, hz, n]);
(async () => {
  const b = await chromium.launch();
  for (const ios of [false, true]) {
    const ctx = await b.newContext({ ...devices['iPhone 13'], hasTouch: true });
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.route('**/fonts.g*/**', (r) => r.abort());
    if (ios) await p.addInitScript(() => { DeviceMotionEvent.requestPermission = () => Promise.resolve('granted'); });
    await p.goto('file://' + path.join(__dirname, '..', 'dist', '06-mobil-salla', 'index.html') + '?debug=1');
    await p.waitForTimeout(3600);
    if (ios) await p.tap('#shake'); else { await p.tap('#s1 .lock'); await p.tap('#s1 .lock'); } // otomatik oynatmayı durdurur
    await p.waitForTimeout(1500);
    const n0 = await p.textContent('#tried');
    await wave(p, 3, 'x', 2, 90); await p.waitForTimeout(900);          // elde tutarken hafif titreme
    const n1 = await p.textContent('#tried');
    for (const ax of ['x', 'z', 'y']) { await wave(p, 16, ax, 4, 36); await p.waitForTimeout(1500); } // 3 eksende gerçekçi sallama
    const n2 = await p.textContent('#tried');
    console.log(`${ios ? 'iOS    ' : 'Android'} | başlangıç ${n0} · hafif titremeden sonra ${n1} (değişmemeli) · 3 sallamadan sonra ${n2} (+3 olmalı) ${errs.length ? 'HATA ' + errs : ''}`);
    await ctx.close();
  }
  await b.close();
})();
