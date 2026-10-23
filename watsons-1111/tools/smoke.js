#!/usr/bin/env node
'use strict';
/**
 * Etkileşim duman testi: her çalışmada ana mekaniği tetikler, sayfa hatası olup olmadığını ve beklenen
 * durumun oluştuğunu kontrol eder; etkileşim sonrası ekran görüntüsü alır (preview/<ad>-x.jpg).
 * Reklam çıkışları (window.open) yakalanır, sayılır.
 * Kullanım: NODE_PATH=$(npm root -g) node tools/smoke.js
 */
const path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');

const center = async (page, sel) => { const b = await page.locator(sel).first().boundingBox(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; };
async function dragBy(page, sel, dx, dy) {
  const c = await center(page, sel);
  await page.mouse.move(c.x, c.y); await page.mouse.down();
  for (let i = 1; i <= 12; i++) await page.mouse.move(c.x + dx * i / 12, c.y + dy * i / 12);
  await page.mouse.up();
}
const TESTS = {
  '01-geri-sayim': async (p) => { await p.hover('.card >> nth=0'); await p.waitForTimeout(900); return p.evaluate(() => /\d/.test(document.querySelector('#units').innerText)); },
  '02-kup': async (p) => { const a = await p.textContent('#cn'); await dragBy(p, '#scene', 140, 0); await p.waitForTimeout(900); return a !== await p.textContent('#cn'); },
  '03-sans-carki': async (p) => { await p.click('#spin'); await p.waitForTimeout(5200); return p.evaluate(() => document.querySelector('#ad').classList.contains('won')); },
  '04-kazi-kazan': async (p) => {
    for (const i of [0, 1, 2]) { const b = await p.locator('.win canvas').nth(i).boundingBox(); for (let y = b.y + 6; y < b.y + b.height; y += 14) { await p.mouse.move(b.x + 4, y); await p.mouse.down(); await p.mouse.move(b.x + b.width - 4, y, { steps: 6 }); await p.mouse.up(); } }
    await p.waitForTimeout(1200); return p.evaluate(() => document.querySelector('#ad').classList.contains('won'));
  },
  '05-halka': async (p) => { const a = await p.textContent('#in'); await p.click('#nx'); await p.click('#nx'); await p.waitForTimeout(1200); return a !== await p.textContent('#in'); },
  '06-hediye-kutusu': async (p) => { await p.click('#box', { force: true }); await p.waitForTimeout(1600); return p.evaluate(() => document.querySelector('#ad').classList.contains('open')); },
  '07-sepeti-doldur': async (p) => { await p.waitForTimeout(1500); await p.click('.prod >> nth=0'); await dragBy(p, '.prod >> nth=5', 420, 0); await p.waitForTimeout(600); return p.evaluate(() => document.querySelectorAll('#basket img').length >= 2); },
  '08-urun-yagmuru': async (p) => { await p.click('#play'); await p.waitForTimeout(2600); const c = await center(p, '#field'); for (let i = 0; i < 40; i++) { await p.mouse.move(c.x + Math.sin(i / 3) * 200, c.y); await p.waitForTimeout(250); } await p.waitForTimeout(1500); return p.evaluate(() => /yakaladın/.test(document.querySelector('#oh').textContent)); },
  '09-kapsul': async (p) => { await p.waitForTimeout(400); await p.click('#knob'); await p.waitForTimeout(2400); return p.evaluate(() => document.querySelector('#ad').classList.contains('got')); },
  '10-isik': async (p) => { const prs = await p.locator('#s2 .pr').all(); for (const e of prs) { const b = await e.boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 4 }); await p.waitForTimeout(500); } return p.evaluate(() => document.querySelector('#cnt').textContent.startsWith('5')); },
  '11-hafiza': async (p) => {
    await p.waitForTimeout(3000);
    const keys = await p.evaluate(() => [...document.querySelectorAll('.c img')].map((i) => i.src.slice(-60)));
    const seen = {};
    for (let i = 0; i < keys.length; i++) { if (seen[keys[i]] === undefined) { const j = keys.indexOf(keys[i], i + 1); seen[keys[i]] = 1; await p.locator('.c').nth(i).click(); await p.locator('.c').nth(j).click(); await p.waitForTimeout(500); } }
    await p.waitForTimeout(1000); return p.evaluate(() => document.querySelector('#ad').classList.contains('won'));
  },
  '12-rutin': async (p) => { for (let i = 0; i < 3; i++) { await p.click('.opts button >> nth=1'); await p.waitForTimeout(700); } return p.evaluate(() => document.querySelectorAll('.rc').length === 3); },
  '13-kapilar': async (p) => { await p.waitForTimeout(3000); for (const i of [0, 4, 10]) await p.click(`.door >> nth=${i}`); await p.waitForTimeout(1200); return p.evaluate(() => document.querySelector('#cnt').textContent === '3/11'); },
  '14-begen-gec': async (p) => { await p.waitForTimeout(2000); await p.click('#by'); await p.waitForTimeout(400); await dragBy(p, '.cd >> nth=-1', 160, 0); await p.waitForTimeout(500); await p.click('#bn'); await p.waitForTimeout(500); return p.evaluate(() => document.querySelectorAll('#list a').length === 2); },
  '15-vitrin': async (p) => { await p.mouse.move(800, 60, { steps: 8 }); await p.waitForTimeout(800); return p.evaluate(() => /rotateY\(-?\d/.test(document.querySelector('#world').style.transform)); },
};

(async () => {
  const b = await chromium.launch();
  let fail = 0;
  for (const [id, fn] of Object.entries(TESTS)) {
    const page = await b.newPage({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.abort());
    await page.addInitScript(() => { window.__exits = []; window.open = (u) => { window.__exits.push(u); }; });
    await page.goto('file://' + path.join(root, 'dist', id, 'index.html'));
    await page.waitForTimeout(1200);
    let ok = false;
    try { ok = await fn(page); } catch (e) { errs.push(e.message.split('\n')[0]); }
    await page.screenshot({ path: path.join(root, 'preview', `${id}-x.jpg`), type: 'jpeg', quality: 82 });
    if (!ok || errs.length) fail++;
    console.log(`${ok && !errs.length ? '✔' : '✖'} ${id}${errs.length ? '  ' + errs.join(' | ') : ''}${ok ? '' : '  (beklenen durum oluşmadı)'}`);
    await page.close();
  }
  await b.close();
  process.exit(fail ? 1 : 0);
})();
