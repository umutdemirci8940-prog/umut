#!/usr/bin/env node
'use strict';
/** Etkileşim duman testi: sahne akışı, oklar/noktalar/klavye, hover duraklatma, tıklama hedefi, taşma ve konsol hataları.
 *  Kullanım: NODE_PATH=$(npm root -g) node tools/smoke.js */
const path = require('path');
const { chromium } = require('playwright');
const data = require('../src/data');
const out = path.join(__dirname, '..', 'index.html');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 970, height: 250 } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  const opened = []; await p.exposeFunction('__rec', (u) => opened.push(u));
  await p.addInitScript(() => { window.open = (u) => { window.__rec(u); return null; }; });
  await p.goto('file://' + out); await p.evaluate(() => document.fonts.ready);
  const phase = () => p.getAttribute('#ad', 'data-phase');
  const idx = () => p.evaluate(() => { const a = document.querySelector('.sc.is-active'); return a ? +a.dataset.i : -1; });
  const fail = (m) => { console.error('✘ ' + m); process.exitCode = 1; };
  await p.waitForTimeout(600); if (await phase() !== 'intro') fail('açılış yok');
  await p.waitForTimeout(data.timing.intro + 400); if (await phase() !== 'scenes' || await idx() !== 0) fail('1. sahneye geçilmedi');
  // hover → duraklama
  await p.mouse.move(700, 120); await p.waitForTimeout(400);
  if (!(await p.evaluate(() => document.getElementById('ad').classList.contains('is-paused')))) fail('hover duraklatmadı');
  // ileri ok, nokta, klavye
  await p.click('.arrow.next'); await p.waitForTimeout(150); if (await idx() !== 1) fail('ileri ok çalışmadı');
  await p.click('.dot:nth-child(4)'); await p.waitForTimeout(150); if (await idx() !== 3) fail('nokta çalışmadı');
  await p.focus('#ad'); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(150); if (await idx() !== 2) fail('klavye çalışmadı');
  if (opened.length) fail('kontroller tıklamayı tetikledi');
  // tıklama hedefi (sahnede derin bağlantı)
  await p.click('#ad', { position: { x: 400, y: 120 } }); await p.waitForTimeout(100);
  if (opened.length !== 1 || !/turkiyesigorta\.com\.tr/.test(opened[0])) fail('tıklama hedefi yanlış: ' + opened.join());
  await p.keyboard.press('Enter'); if (opened.length !== 2) fail('Enter açmadı');
  // hover bitince akış devam etmeli ve kapanışta durmalı
  await p.mouse.move(5, 5); await p.mouse.move(-10, -10).catch(() => {}); await p.evaluate(() => document.getElementById('ad').dispatchEvent(new Event('mouseleave')));
  const total = data.timing.intro + data.scenes.length * data.timing.slide + data.timing.outro + 1500;
  await p.waitForTimeout(Math.min(total, 28000)); if (await phase() !== 'outro') fail('kapanışa ulaşılmadı: ' + await phase());
  await p.waitForTimeout(data.timing.outro); if (!(await p.evaluate(() => document.getElementById('ad').classList.contains('is-ended')))) fail('kapanışta durmadı');
  // taşma
  const over = await p.evaluate(() => { const ad = document.getElementById('ad'); const r = ad.getBoundingClientRect(); return [...ad.querySelectorAll('.colA *, .outro .ot, .outro .ol, .outro .on')].filter((e) => { const b = e.getBoundingClientRect(); return b.width && (b.right > r.right - 1 || b.bottom > r.bottom - 1); }).map((e) => e.className); });
  if (over.length) fail('taşma: ' + over.join(','));
  if (errs.length) fail('konsol: ' + errs.join(' | '));
  console.log(process.exitCode ? 'Duman testi: HATA' : '✔ Duman testi geçti (akış, kontroller, tıklama, durma)');
  await b.close();
})();
