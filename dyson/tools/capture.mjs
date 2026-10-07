// Ekran görüntüleri + etkileşim duman testi: node tools/capture.mjs  (Playwright + Chromium gerekir)
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let pw; try { pw = require('playwright'); } catch { pw = require(path.join(process.env.NODE_PATH || '/opt/node22/lib/node_modules', 'playwright')); }
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const out = path.join(root, 'preview', 'screens'); fs.mkdirSync(out, { recursive: true });
const browser = await pw.chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const errors = [], checks = [];
const ok = (c, msg) => checks.push((c ? '✔ ' : '✘ ') + msg);
async function shot(page, name) { await page.locator('#mh').screenshot({ path: path.join(out, name + '.jpg'), quality: 85, type: 'jpeg' }); }
async function open(name) {
  const page = await browser.newPage({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  page.on('pageerror', (e) => errors.push(name + ': ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(name + ': ' + m.text()); });
  await page.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); }; });
  await page.goto('file://' + path.join(root, process.env.DIR || 'dist', name, 'index.html'));
  await page.waitForTimeout(2500);
  return page;
}

// Saç bakımı
let p = await open('haircare');
await shot(p, 'haircare-1-acilis');
await p.click('[data-heat="3"]'); await p.click('[data-att="concentrator"]'); await p.mouse.move(5, 5); await p.waitForTimeout(5000);
await p.locator('.hs[data-key="multiplier"]').click({ force: true }); await p.waitForTimeout(400);
ok(await p.locator('#card.show').count() === 1, 'haircare: hotspot kartı açılıyor');
await shot(p, 'haircare-2-yogunlastirici-hotspot');
await p.click('#cardClose'); await p.click('[data-att="diffuser"]'); await p.click('[data-heat="0"]'); await p.mouse.move(5, 5); await p.waitForTimeout(4000);
const b = await p.locator('#mh').boundingBox();
await p.mouse.move(b.x + 650, b.y + 120); await p.mouse.down(); await p.mouse.move(b.x + 760, b.y + 140, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(800);
await shot(p, 'haircare-3-difuzor-soguk');
ok(await p.locator('.tab, .hud-floor, .copy[data-for="floor"]').count() === 0, 'haircare: süpürge içeriği yok (ayrı masthead)');
await p.click('a.btn[data-exit]');
ok((await p.evaluate(() => window.__opened))[0] === 'https://www.dyson.com.tr/products/hair-care', 'haircare: CTA parametresiz hair-care adresine gidiyor');
await p.close();

// Kablosuz süpürge
p = await open('cordfree');
const c = await p.locator('#mh').boundingBox();
for (let i = 0; i < 50; i++) { await p.mouse.move(c.x + 560 + 260 * Math.sin(i / 7), c.y + 170 + 50 * Math.cos(i / 5)); await p.waitForTimeout(50); }
await p.waitForTimeout(500);
ok(+(await p.textContent('#total')).replace(/\D/g, '') > 0, 'cordfree: süpürünce partikül sayacı artıyor');
await shot(p, 'cordfree-1-lazerle-supur');
await p.click('[data-pow="2"]'); await p.click('[data-mode="inspect"]'); await p.waitForTimeout(3500);
await p.locator('.hs[data-key="piezo"]').click({ force: true }); await p.waitForTimeout(400);
await shot(p, 'cordfree-2-yakindan-incele');
ok(await p.locator('.film').count() === 1, 'cordfree: film düğmesi var');
await p.click('#cardClose').catch(() => {}); await p.click('.film'); await p.waitForTimeout(800);
ok(await p.locator('#video:not([hidden])').count() === 1, 'cordfree: film katmanı açılıyor');
await shot(p, 'cordfree-3-film');
await p.click('#videoClose');
ok(await p.locator('.tab, .hud-hair, .copy[data-for="hair"]').count() === 0, 'cordfree: saç bakımı içeriği yok (ayrı masthead)');
await p.click('a.btn[data-exit]');
ok((await p.evaluate(() => window.__opened))[0] === 'https://www.dyson.com.tr/products/cord-free', 'cordfree: CTA parametresiz cord-free adresine gidiyor');
await p.close();
await browser.close();
console.log(checks.join('\n'));
console.log(errors.length ? 'HATALAR:\n' + errors.join('\n') : 'Konsol hatası yok');
if (errors.length || checks.some((x) => x.startsWith('✘'))) process.exit(1);
