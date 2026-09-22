#!/usr/bin/env node
'use strict';
/**
 * Ekran görüntüleri → pluxee/preview/screens/<konsept>-*.jpg
 * Kullanım: NODE_PATH=$(npm root -g) node pluxee/tools/capture.js
 */
const path = require('path');
const fs = require('fs');
const { chromium } = require('playwright');
const { routeFonts } = require('./fonts');
const data = require('../src/data');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'preview', 'screens');
fs.mkdirSync(outDir, { recursive: true });
const KT = data.corridor.timing, LT = data.lens.timing, RT = data.receipt.timing;
const INTRO = 520;
const gateAt = (i) => INTRO + KT.enter + KT.gates[i] * KT.cruise;

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, deviceScaleFactor: 2 });
  await routeFonts(ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const names = [];
  const shot = async (name) => { await page.screenshot({ path: path.join(outDir, name + '.jpg'), type: 'jpeg', quality: 88 }); names.push(name); console.log(`✔ ${name}`); };
  const open = async (c, qs) => { await page.goto('file://' + path.join(root, 'dist', c, 'index.html') + '?' + qs); await page.mouse.move(10, 10); };

  // Giriş animasyonu (ortak)
  await open('koridor', 'seg=wc&h=12&m=31'); await page.waitForTimeout(330); await shot('giris-isik-supurmesi');
  // KORİDOR
  await page.waitForTimeout(INTRO + KT.enter + 1200 - 330); await shot('koridor-ipucu');
  await page.waitForTimeout(gateAt(0) + 260 - (INTRO + KT.enter + 1200)); await shot('koridor-gecis');
  await page.mouse.move(820, 140); await page.mouse.down(); for (let i = 1; i <= 7; i++) { await page.mouse.move(820 - 150 * i / 7, 140); await page.waitForTimeout(28); } await page.waitForTimeout(90); await shot('koridor-surukleme'); await page.mouse.up();
  await page.click('.node[data-i="3"]'); await page.waitForTimeout(900 + 0.14 * KT.cruise + 900); await shot('koridor-final');
  await open('koridor', 'seg=hr&h=19&m=5'); await page.waitForTimeout(gateAt(1) - 900); await shot('koridor-ik-aksam');
  // MERCEK
  await open('mercek', 'seg=wc&h=12&m=31'); await page.waitForTimeout(INTRO + 700 + 900); await shot('mercek-ipucu');
  await page.mouse.move(590, 78, { steps: 14 }); await page.waitForTimeout(LT.dwell + 500); await shot('mercek-restoran');
  await page.mouse.move(790, 64, { steps: 10 }); await page.waitForTimeout(LT.dwell + 400); await page.mouse.move(664, 150, { steps: 10 }); await page.waitForTimeout(LT.dwell + 400); await shot('mercek-uc-nokta');
  await page.mouse.move(896, 140, { steps: 10 }); await page.waitForTimeout(LT.dwell + 700 + 1500); await shot('mercek-final');
  await open('mercek', 'seg=emp&h=9&m=15'); await page.waitForTimeout(INTRO + 700 + LT.idle + LT.move + LT.dwell + 500); await shot('mercek-isveren-otomatik');
  // FİŞ
  await open('fis', 'seg=wc&h=12&m=31'); await page.waitForTimeout(INTRO + 900 + RT.first + 700); await shot('fis-yazdiriyor');
  await page.waitForTimeout(RT.line + 300); await shot('fis-ikinci-satir');
  await page.mouse.click(440 + 408, 200); await page.waitForTimeout(500); await page.mouse.click(440 + 408, 200); await page.waitForTimeout(500); await page.mouse.click(440 + 408, 200); await page.waitForTimeout(700); await shot('fis-tamam');
  await page.mouse.move(440 + 400, 110); await page.mouse.down(); await page.mouse.move(440 + 400, 50, { steps: 8 }); await page.mouse.up(); await page.waitForTimeout(900); await shot('fis-koparildi');
  await open('fis', 'seg=hr&h=13&m=0&w=rain'); await page.waitForTimeout(INTRO + 900 + RT.first + RT.line + 500); await shot('fis-ik-yagmur');
  await ctx.close();

  const ctx2 = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await routeFonts(ctx2);
  const p2 = await ctx2.newPage();
  p2.on('pageerror', (e) => errors.push('preview: ' + e.message));
  await p2.goto('file://' + path.join(root, 'preview', 'index.html'));
  await p2.waitForTimeout(2600);
  await p2.screenshot({ path: path.join(outDir, 'showcase.jpg'), type: 'jpeg', quality: 78, fullPage: true });
  names.push('showcase'); console.log('✔ showcase');
  await browser.close();
  for (const f of fs.readdirSync(outDir)) if (!names.includes(f.replace(/\.jpg$/, ''))) fs.rmSync(path.join(outDir, f));
  if (errors.length) { console.log('⚠ ' + errors.join(' | ')); process.exit(1); }
})();
