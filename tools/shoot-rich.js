#!/usr/bin/env node
'use strict';
/**
 * Kasım interaktif çalışmalarının ekran görüntüleri (preview-rich/screens/) ve etkileşim kontrolü.
 * Kullanım: NODE_PATH=$(npm root -g) node tools/shoot-rich.js [ad-adı ...]
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');

const root = path.join(__dirname, '..');
const out = path.join(root, 'preview-rich', 'screens');
fs.mkdirSync(out, { recursive: true });

const swipe = (dx) => async (p) => {
  await p.mouse.move(160, 240); await p.mouse.down();
  for (let i = 1; i <= 8; i++) await p.mouse.move(160 + (dx * i) / 8, 240 + i, { steps: 2 });
  await p.mouse.up();
};
const scratch = async (p) => {
  await p.mouse.move(30, 120); await p.mouse.down();
  for (let y = 120; y < 420; y += 34) { await p.mouse.move(290, y, { steps: 6 }); await p.mouse.move(30, y + 17, { steps: 6 }); }
  await p.mouse.up();
};
const SHOTS = {
  'masthead-970x250': { w: 970, h: 250, steps: [
    ['intro', 700], ['oto-1', 2600], ['oto-3', 9000],
    ['hover-cocuk', 600, (p) => p.mouse.move(300 + 430 + 80 + 40, 120)],
    ['hover-urun', 900, (p) => p.mouse.move(300 + 80 + 80 + 40 + 2, 200)],
  ] },
  'mobil-320x480-kartlar': { w: 320, h: 480, mobile: true, steps: [
    ['intro', 1200], ['ipucu', 2200], ['kaydir-2', 900, swipe(-200)], ['kaydir-3', 900, swipe(-200)],
    ['kupon', 900, swipe(-200)], ['kopyala', 600, (p) => p.mouse.click(160, 378)],
  ] },
  'mobil-320x480-sil-kesfet': { w: 320, h: 480, mobile: true, steps: [
    ['intro', 1400], ['demo', 2600], ['siliniyor', 400, async (p) => { await p.mouse.move(40, 200); await p.mouse.down(); await p.mouse.move(280, 260, { steps: 10 }); await p.mouse.move(40, 320, { steps: 10 }); await p.mouse.up(); }],
    ['acildi', 1800, scratch],
  ] },
  'mobil-320x480-rutin': { w: 320, h: 480, mobile: true, steps: [
    ['intro', 900], ['oto-2', 4200], ['dokun-aktif', 1100, (p) => p.mouse.click(160, 400)], ['urun', 600, (p) => p.mouse.move(60, 380)],
  ] },
};

(async () => {
  const want = process.argv.slice(2);
  const browser = await chromium.launch();
  let failed = false;
  for (const [name, cfg] of Object.entries(SHOTS)) {
    if (want.length && !want.includes(name)) continue;
    const file = path.join(root, 'dist-rich', name, 'index.html');
    if (!fs.existsSync(file)) continue;
    const ctx = await browser.newContext({ viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: 2, hasTouch: !!cfg.mobile });
    const page = await ctx.newPage();
    const errors = [];
    const exits = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); if (/\[ad\]/.test(m.text())) exits.push(m.text().replace('[ad] ', '')); });
    await ctx.exposeFunction('__open', (u) => exits.push('open ' + u));
    await page.addInitScript(() => { window.open = (u) => { window.__open(u); return null; }; console.debug = (...a) => console.log(...a); });
    await page.goto('file://' + file);
    await page.waitForLoadState('networkidle').catch(() => {});
    for (const [label, wait, act] of cfg.steps) {
      if (act) await act(page);
      await page.waitForTimeout(wait);
      await page.screenshot({ path: path.join(out, `${name}-${label}.jpg`), quality: 88, type: 'jpeg' });
    }
    console.log(`${errors.length ? '✘' : '✔'} ${name}${errors.length ? ' HATA: ' + errors.join(' | ') : ''}`);
    console.log('   olaylar: ' + exits.slice(0, 14).join(', '));
    if (errors.length) failed = true;
    await ctx.close();
  }
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
