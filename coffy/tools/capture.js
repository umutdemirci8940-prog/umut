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
  await Promise.all(dirs.map(async (dir) => {
    const no = dir.slice(0, 2); const [w, h] = dir.match(/(\d+)x(\d+)$/).slice(1).map(Number);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, hasTouch: w === 320 });
    await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: css }));
    await ctx.route('**/fonts.gstatic.com/**', (r) => {
      const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
      return fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(`${dir}: ${e.message}`));
    await page.goto('file://' + path.join(dist, dir, 'index.html') + '?dp=morning&time=08:47');
    const t0 = Date.now();
    for (const [name, at] of MOMENTS[no] || DEFAULT) {
      const wait = at - (Date.now() - t0); if (wait > 0) await page.waitForTimeout(wait);
      await page.screenshot({ path: path.join(out, `${no}-${name}.jpg`), type: 'jpeg', quality: 86 });
    }
    await ctx.close();
    console.log('✔', dir);
  }));

  // Özet görseller
  const shots = fs.readdirSync(out);
  const pick = (no, pref) => pref.map((p) => `${no}-${p}.jpg`).find((f) => shots.includes(f));
  const sheet = async (file, items, w, h, cols, title) => {
    const html = `<html><body style="margin:0;background:#140b07;font-family:sans-serif;padding:28px;display:grid;grid-template-columns:repeat(${cols},${w}px);gap:18px">
      ${items.map(([src, cap]) => `<figure style="margin:0"><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(out, src)).toString('base64')}" style="width:${w}px;height:${h}px;display:block;border-radius:${w === 320 ? 22 : 10}px"><figcaption style="color:#c9b7a3;font:700 13px sans-serif;margin-top:8px">${cap}</figcaption></figure>`).join('')}
      </body></html>`;
    const p = await browser.newPage({ viewport: { width: 56 + cols * w + (cols - 1) * 18, height: 400 }, deviceScaleFactor: 1 });
    await p.setContent(html); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(out, file), type: 'jpeg', quality: 84, fullPage: true }); await p.close();
  };
  const NAMES = { '01': 'Saat Kaç?', '02': 'Enerji Doldur', '03': 'Köpüğü Kazı', '04': 'Zor mu? Kaydır.', '05': 'Çekirdek Avı', '06': 'En Yakın Coffy', '07': 'Ruh Halin Ne?', '08': 'Coffy Seviyesi', '09': 'Senaryonu Seç', '10': 'Şube Bulucu' };
  const mob = ['01', '02', '03', '04', '05', '06', '07'];
  await sheet('overview-mobile.jpg', [
    ...mob.map((n) => [pick(n, ['play']), `${n} · ${NAMES[n]} · etkileşim`]),
    [pick('01', ['video']), 'Video aşaması (yer tutucu)'],
    ...mob.filter((n) => n !== '06').map((n) => [pick(n, ['end']), `${n} · bitiş kartı`]),
  ], 320, 480, 4);
  await sheet('overview-wide.jpg', ['08', '09', '10'].flatMap((n) => [[pick(n, ['play']), `${n} · ${NAMES[n]}`], [pick(n, ['end']), `${n} · son kare`]]), 970, 250, 2);
  await browser.close();
  if (errors.length) { console.error('Sayfa hataları:\n' + errors.join('\n')); process.exit(1); }
  console.log('✔ ekran görüntüleri: coffy/preview/screens/');
})();
