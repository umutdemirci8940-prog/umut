'use strict';
// Ekran görüntüleri + etkileşim testi: screens/<çalışma>-<boyut>-<an>.png
// Kullanım: NODE_PATH=$(npm root -g) node capture.js [c2]   (isteğe bağlı çalışma filtresi)
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { SIZES } = require('./src/common');
const cache = path.join(__dirname, '..', 'preview', '.fontcache');
const only = process.argv[2];

// Her konsept için kullanıcı etkileşimi
const INTERACT = {
  'isik-testi': async (p) => { await p.waitForTimeout(3000); await p.click('.chip[data-k="zihin"]'); await p.waitForTimeout(900); },
  nefes: async (p) => {
    await p.waitForTimeout(2200);
    const b = await p.locator('.breath').boundingBox();
    await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await p.mouse.down();
    await p.waitForTimeout(2000); await p.screenshot({ path: shotPath(p, 'etkilesim-nefes') });
    await p.waitForTimeout(2300); await p.mouse.up(); await p.waitForTimeout(3600);
  },
  kazi: async (p) => {
    await p.waitForTimeout(2000);
    const b = await p.locator('.card').boundingBox();
    for (let r = 0; r < 3; r++) for (let i = 0; i <= 20; i++) {
      const x = b.x + b.width * (r % 2 ? 1 - i / 20 : i / 20), y = b.y + b.height * (0.25 + r * 0.22);
      await p.mouse.move(x, y);
    }
    await p.screenshot({ path: shotPath(p, 'etkilesim-kazi') });
    for (let r = 0; r < 4; r++) for (let i = 0; i <= 20; i++) await p.mouse.move(b.x + b.width * (r % 2 ? 1 - i / 20 : i / 20), b.y + b.height * (0.12 + r * 0.25));
    await p.waitForTimeout(1200);
  },
  'isigi-ac': async (p) => {
    await p.waitForTimeout(2000);
    const b = await p.locator('.slider').boundingBox();
    await p.mouse.move(b.x + 23, b.y + b.height / 2); await p.mouse.down();
    await p.mouse.move(b.x + b.width * 0.55, b.y + b.height / 2, { steps: 12 });
    await p.waitForTimeout(500); await p.screenshot({ path: shotPath(p, 'etkilesim-yari') });
    await p.mouse.move(b.x + b.width - 10, b.y + b.height / 2, { steps: 10 }); await p.mouse.up();
    await p.waitForTimeout(1500);
  },
};
let current = '';
const shotPath = (p, n) => path.join(__dirname, 'screens', `${current}-${n}.png`);

(async () => {
  fs.mkdirSync(path.join(__dirname, 'screens'), { recursive: true });
  const browser = await chromium.launch();
  const dirs = fs.readdirSync(path.join(__dirname, 'dist')).filter((d) => /^c\d/.test(d) && (!only || d.startsWith(only)));
  for (const dir of dirs) {
    const key = dir.replace(/^c\d+-/, '');
    for (const [size, { w, h }] of Object.entries(SIZES)) {
      current = `${dir}-${size}`;
      const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
      const fontCss = path.join(cache, 'wb-fonts.css');
      if (fs.existsSync(fontCss)) {
        await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fs.readFileSync(fontCss, 'utf8') }));
        await ctx.route('**/fonts.gstatic.com/**', (r) => {
          const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
          fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
        });
      }
      const opened = [];
      await ctx.addInitScript(() => { window.open = (u) => { window.__opened = (window.__opened || []).concat(u); }; });
      const url = 'file://' + path.join(__dirname, 'dist', dir, size, 'index.html');
      const errors = [];
      // 1) Pasif izleme: açılış, otomatik akış, kapanış
      let p = await ctx.newPage();
      p.on('pageerror', (e) => errors.push(e.message));
      await p.goto(url);
      await p.waitForTimeout(1400); await p.screenshot({ path: shotPath(p, '1-acilis') });
      await p.waitForTimeout(5600); await p.screenshot({ path: shotPath(p, '2-otomatik') });
      await p.waitForTimeout(9000); await p.screenshot({ path: shotPath(p, '3-kapanis') });
      await p.close();
      // 2) Etkileşim + tıklama
      p = await ctx.newPage();
      p.on('pageerror', (e) => errors.push(e.message));
      await p.goto(url);
      await INTERACT[key](p);
      await p.screenshot({ path: shotPath(p, '4-etkilesim') });
      await p.click('.cta >> visible=true');
      opened.push(...await p.evaluate(() => window.__opened || []));
      console.log(`${errors.length ? '✖' : '✔'} ${current}  çıkış: ${opened[0] || '—'}${errors.length ? '  HATA: ' + errors.join(' | ') : ''}`);
      await ctx.close();
    }
  }
  await browser.close();
})();
