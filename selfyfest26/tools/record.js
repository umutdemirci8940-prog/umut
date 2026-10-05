#!/usr/bin/env node
'use strict';
/** Masthead'in ~14 sn'lik önizleme videosunu kaydeder (preview/masthead.webm). Kullanım: NODE_PATH=$(npm root -g) node selfyfest26/tools/record.js */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
(async () => {
  const dir = path.join(root, 'preview', '_vid');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 970, height: 250 }, recordVideo: { dir, size: { width: 970, height: 250 } } });
  const page = await ctx.newPage();
  await page.addInitScript(() => { window.open = () => {}; });
  await page.goto('file://' + path.join(root, 'dist', '970x250', 'index.html'));
  await page.waitForTimeout(3800);
  for (const x of [344, 520, 696]) { await page.mouse.move(x, 90, { steps: 12 }); await page.waitForTimeout(1300); }
  await page.mouse.move(885, 118, { steps: 10 }); await page.waitForTimeout(1200);
  await page.mouse.move(600, 240, { steps: 8 }); await page.click('#nextBtn'); await page.waitForTimeout(1800);
  await page.mouse.move(520, 90, { steps: 10 }); await page.waitForTimeout(1600);
  const v = page.video(); await ctx.close(); await browser.close();
  fs.renameSync(await v.path(), path.join(root, 'preview', 'masthead.webm'));
  fs.rmSync(dir, { recursive: true, force: true });
})();
