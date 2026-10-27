#!/usr/bin/env node
'use strict';
/**
 * Her bannerın belirli anlarında ekran görüntüsü alır (coffy/preview/screens/) ve
 * iki özet görsel üretir: overview-mobile.jpg, overview-wide.jpg.
 * Kullanıcı etkileşmediğinde bannerlar kendi kendine oynadığı için tüm akış görüntülenir.
 *
 * Kullanım: node coffy/tools/capture.js   (Playwright + Chromium gerekir)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); } catch { ({ chromium } = require(path.join(execSync('npm root -g').toString().trim(), 'playwright'))); }
const { FONTS } = require('../src/shared');

const root = path.join(__dirname, '..');
const out = path.join(root, 'preview', 'screens');
const cache = path.join(root, 'preview', '.fontcache');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(cache, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

// Chromium bazı ağlarda Google Fonts'a doğrudan erişemez: bir kez curl ile indirip yerelden servis et.
function fontCss() {
  const f = path.join(cache, 'fonts.css');
  if (!fs.existsSync(f)) {
    execSync(`curl -sS -A "${UA}" -o "${f}" "${FONTS}"`);
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)) {
      const t = path.join(cache, path.basename(m[1]));
      if (!fs.existsSync(t)) execSync(`curl -sS -o "${t}" "${m[1]}"`);
    }
  }
  return fs.readFileSync(f, 'utf8');
}

const DEFAULT = [['video', 2200], ['play', 7200], ['end', 27000]];
const MOMENTS = {
  '01': [['video', 2200], ['play', 7200], ['answer', 13600], ['end', 27000]],
  '02': [['video', 2200], ['play', 7200], ['sip', 13000], ['end', 27000]],
  '03': [['video', 2200], ['play', 7200], ['reveal', 15500], ['end', 27000]],
  '04': [['video', 2200], ['play', 7200], ['swipe', 12600], ['end', 27000]],
  '05': [['video', 2200], ['play', 7200], ['game', 15000], ['result', 23500], ['end', 31000]],
  '07': [['video', 2200], ['play', 7200], ['reel', 12600], ['end', 27000]],
  '08': [['play', 1500], ['slide', 4200], ['end', 9000]],
  '09': [['video', 2200], ['play', 7200], ['pick', 13500], ['end', 20000]],
};

(async () => {
  const css = fontCss();
  const dist = path.join(root, 'dist');
  const dirs = fs.readdirSync(dist).filter((d) => /^\d\d-/.test(d)).sort();
  const browser = await chromium.launch();
  const errors = [];
  const SIZES = [[970, 250, 'w'], [320, 480, 'm']];
  const jobs = dirs.flatMap((dir) => SIZES.map((sz) => [dir, sz]));
  for (let i = 0; i < jobs.length; i += 10) await Promise.all(jobs.slice(i, i + 10).map(async ([dir, [w, h, k]]) => {
    const no = dir.slice(0, 2);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: k === 'm' });
    await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }));
    await ctx.route('**/fonts.gstatic.com/**', (r) => {
      const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
      return fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${dir} ${k}: ${e.message}`));
    await page.goto('file://' + path.join(dist, dir, 'index.html') + '?dp=morning&time=08:47');
    const t0 = Date.now();
    for (const [name, at] of MOMENTS[no] || DEFAULT) {
      const wait = at - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
      await page.screenshot({ path: path.join(out, `${no}-${k}-${name}.jpg`), type: 'jpeg', quality: 86 });
    }
    await ctx.close();
    console.log('✔', dir, k);
  }));

  // Özet görseller: her çalışmanın etkileşim ve kapanış kareleri, iki boyutta
  const shots = fs.readdirSync(out);
  const pick = (no, k, pref) => pref.map((p) => `${no}-${k}-${p}.jpg`).find((f) => shots.includes(f));
  const sheet = async (file, items, w, h, cols) => {
    const html = `<html><body style="margin:0;background:#0b0b0b;font-family:sans-serif;padding:28px;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:18px">
      ${items.filter((x) => x[0]).map(([src, cap]) => `<figure style="margin:0"><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(out, src)).toString('base64')}" style="width:${w}px;height:${h}px;display:block;border-radius:${w === 320 ? 22 : 10}px"><figcaption style="color:#bbb;font:700 13px sans-serif;margin-top:8px">${cap}</figcaption></figure>`).join('')}
      </body></html>`;
    const p = await browser.newPage({ viewport: { width: 56 + cols * w + (cols - 1) * 18, height: 400 }, deviceScaleFactor: 1 });
    await p.setContent(html); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(out, file), type: 'jpeg', quality: 84, fullPage: true }); await p.close();
  };
  const nos = dirs.map((d) => d.slice(0, 2));
  await sheet('overview-mobile.jpg', nos.flatMap((n) => [[pick(n, 'm', ['play']), `${n} · 320×480 · etkileşim`], [pick(n, 'm', ['end']), `${n} · 320×480 · kapanış`]]), 320, 480, 4);
  await sheet('overview-wide.jpg', nos.flatMap((n) => [[pick(n, 'w', ['play']), `${n} · 970×250 · etkileşim`], [pick(n, 'w', ['end']), `${n} · 970×250 · kapanış`]]), 970, 250, 2);
  await browser.close();
  if (errors.length) { console.error('Sayfa hataları:\n' + errors.join('\n')); process.exit(1); }
  console.log('✔ ekran görüntüleri: coffy/preview/screens/');
})();
