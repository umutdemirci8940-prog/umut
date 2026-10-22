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
const tapHs = async (p, i) => {
  const bb = await p.locator('.hs').nth(i).boundingBox();
  console.log('   hs', i, Math.round(bb.x), Math.round(bb.y));
  await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
};
// Eşleştirme oyunu: kart yüzlerinden eşleri bulup sırayla açar
const PAIRS = { 'm-enerji': 'p-b12', 'm-aktif': 'p-krill', 'm-cocuk': 'p-omega3surup' };
const playPair = (k, wrong) => async (p) => {
  const srcs = await p.$$eval('.cd .f img', (a) => a.map((i) => i.getAttribute('src')));
  const idx = (n) => srcs.findIndex((x) => x.includes(n + '.webp'));
  const a = idx(k), b = idx(PAIRS[k]);
  const cards = p.locator('.cd');
  if (wrong) { const c = idx(Object.values(PAIRS).find((v) => v !== PAIRS[k])); await cards.nth(a).click(); await p.waitForTimeout(300); await cards.nth(c).click(); await p.waitForTimeout(400); return; }
  await cards.nth(a).click(); await p.waitForTimeout(400); await cards.nth(b).click();
};
const popClouds = (ms) => async (p) => {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const bb = await p.evaluate(() => { const el = [...document.querySelectorAll('.b')].find((e) => !e.classList.contains('pop')); if (!el) return null; const r = el.getBoundingClientRect(); return r.top > 70 && r.top < 400 ? [r.left + r.width / 2, r.top + r.height / 2] : null; });
    if (bb) await p.mouse.click(bb[0], bb[1]); else await p.waitForTimeout(120);
  }
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
  'masthead-970x250-mercek': { w: 970, h: 250, steps: [
    ['intro', 1200], ['tur-1', 2600], ['tur-2', 2800],
    ['kullanici-cocuk', 1400, (p) => p.mouse.move(700, 110, { steps: 12 })],
    ['kullanici-hareket', 1400, (p) => p.mouse.move(870, 160, { steps: 12 })],
    ['kullanici-gunes', 1400, (p) => p.mouse.move(340, 100, { steps: 12 })],
    ['hepsi', 1600, (p) => p.mouse.move(520, 120, { steps: 12 })],
  ] },
  'mobil-320x480-mercek': { w: 320, h: 480, mobile: true, steps: [
    ['intro', 1200], ['tur', 3000],
    ['surukle', 1300, async (p) => { await p.mouse.move(80, 300); await p.mouse.down(); await p.mouse.move(240, 330, { steps: 14 }); await p.mouse.up(); }],
    ['urune-git', 900, (p) => p.mouse.click(240, 330)],
  ] },
  'mobil-320x480-ofis': { w: 320, h: 480, mobile: true, steps: [
    ['intro', 1400], ['gezinti', 3600], ['demo', 3600],
    ['stetoskop', 1500, async (p) => { await p.locator('#x').click(); await p.waitForTimeout(600); await tapHs(p, 2); }],
    ['kitaplik', 1500, async (p) => { await p.locator('#x').click(); await p.waitForTimeout(600); await p.mouse.move(60, 260); await p.mouse.down(); await p.mouse.move(250, 250, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(800); await tapHs(p, 0); }],
    ['ajanda', 1500, async (p) => { await p.locator('#x').click(); await p.waitForTimeout(600); await tapHs(p, 4); }],
  ] },
  'mobil-320x480-eslestir': { w: 320, h: 480, mobile: true, steps: [
    ['ezberle', 1600], ['oyun', 2000], ['yanlis', 0, playPair('m-enerji', true)],
    ['eslesti', 900, async (p) => { await p.waitForTimeout(900); await playPair('m-aktif')(p); }],
    ['final', 2200, async (p) => { await playPair('m-enerji')(p); await p.waitForTimeout(700); await playPair('m-cocuk')(p); }],
  ] },
  'masthead-970x250-golge': { w: 970, h: 250, steps: [
    ['haziran', 600], ['kasim', 4200],
    ['surukle-haziran', 700, async (p) => { await p.mouse.move(400 + 22 + 230, 197); await p.mouse.down(); await p.mouse.move(400 + 40, 197, { steps: 10 }); await p.mouse.up(); }],
    ['sehir', 600, async (p) => { await p.locator('#cityBtn').click(); }],
    ['antalya', 600, async (p) => { await p.locator('#cities button', { hasText: 'Antalya' }).click(); }],
    ['soru-1', 700, (p) => p.locator('#start').click()],
    ['soru-2', 700, (p) => p.locator('#ans button').nth(0).click()],
    ['soru-3', 700, (p) => p.locator('#ans button').nth(0).click()],
    ['sonuc', 1200, (p) => p.locator('#ans button').nth(0).click()],
    ['urun', 400, (p) => p.locator('#rp .it').nth(0).click()],
  ] },
  'mobil-320x480-golge': { w: 320, h: 480, mobile: true, steps: [
    ['haziran', 600], ['kasim', 4200],
    ['sehir', 600, (p) => p.locator('#cityBtn').click()],
    ['ankara', 600, (p) => p.locator('#cities button', { hasText: 'Ankara' }).click()],
    ['soru-1', 700, (p) => p.locator('#start').click()],
    ['soru-2', 700, (p) => p.locator('#ans button').nth(1).click()],
    ['soru-3', 700, (p) => p.locator('#ans button').nth(1).click()],
    ['sonuc', 1200, (p) => p.locator('#ans button').nth(1).click()],
  ] },
  'mobil-320x480-eslesme': { w: 320, h: 480, mobile: true, steps: [
    ['profil', 1200], ['ipucu', 1300],
    ['galeri', 600, (p) => p.mouse.click(250, 150)],
    ['surukle', 0, async (p) => { await p.mouse.move(160, 220); await p.mouse.down(); await p.mouse.move(230, 230, { steps: 6 }); }],
    ['eslesti', 1100, async (p) => { await p.mouse.move(300, 240, { steps: 4 }); await p.mouse.up(); }],
    ['kopya', 500, (p) => p.locator('#cp').click()],
    ['gec', 700, async (p) => { await p.locator('#more').click(); await p.waitForTimeout(400); await p.locator('#no').click(); }],
    ['ozet', 900, async (p) => { for (let i = 0; i < 5; i++) { await p.locator('#yes').click(); await p.waitForTimeout(700); await p.locator('#more').click(); await p.waitForTimeout(300); } }],
  ] },
  'mobil-320x480-kazikazan': { w: 320, h: 480, mobile: true, steps: [
    ['bilet', 1200], ['demo', 1600],
    ['kaziniyor', 600, async (p) => { await p.mouse.move(30, 160); await p.mouse.down(); for (let y = 155; y < 240; y += 14) { await p.mouse.move(290, y, { steps: 6 }); await p.mouse.move(30, y + 7, { steps: 6 }); } await p.mouse.up(); }],
    ['kazandin', 1400, async (p) => { await p.mouse.move(30, 255); await p.mouse.down(); for (let y = 255; y < 345; y += 14) { await p.mouse.move(290, y, { steps: 6 }); await p.mouse.move(30, y + 7, { steps: 6 }); } await p.mouse.up(); }],
  ] },
  'mobil-320x480-oyun': { w: 320, h: 480, mobile: true, steps: [
    ['baslangic', 2600], ['tanitim', 2400],
    ['oyun', 0, async (p) => { await p.locator('#play').click({ force: true }); await popClouds(6000)(p); }],
    ['oyun-2', 0, popClouds(6000)],
    ['sonuc', 9500],
  ] },
  'masthead-970x250-takvim': { w: 970, h: 250, day: 11, steps: [
    ['takvim', 1600],
    ['kapi-aciliyor', 380, (p) => p.locator('.door.today').click()],
    ['icerik', 1300],
    ['dun', 1100, async (p) => { await p.locator('#vX').click(); await p.waitForTimeout(800); await p.locator('.door').nth(1).click(); }],
    ['kilitli', 500, async (p) => { await p.locator('#vX').click(); await p.waitForTimeout(800); await p.locator('.door').nth(5).click(); }],
  ] },
  'mobil-320x480-takvim': { w: 320, h: 480, mobile: true, day: 11, steps: [
    ['takvim', 1500],
    ['kapi-aciliyor', 350, (p) => p.locator('.door').nth(10).click()],
    ['icerik', 1300],
    ['dun', 1000, async (p) => { await p.locator('#vX').click(); await p.waitForTimeout(800); await p.locator('.door').nth(3).click(); }],
    ['kilitli', 500, async (p) => { await p.locator('#vX').click(); await p.waitForTimeout(800); await p.locator('.door').nth(17).click(); }],
  ] },
  'mobil-320x480-sohbet': { w: 320, h: 480, mobile: true, steps: [
    ['acilis', 1800], ['oneri', 3200],
    ['soru-1', 4200, (p) => p.locator('#chips button', { hasText: 'Sabahları' }).click()],
    ['soru-2', 5200, (p) => p.locator('#chips button', { hasText: 'Çocuğum' }).click()],
  ] },
  'mobil-320x480-gonder': { w: 320, h: 480, mobile: true, steps: [
    ['alici', 1800],
    ['kart', 1100, (p) => p.locator('#who button').nth(2).click()],
    ['mesaj', 600, (p) => p.locator('#swap').click()],
    ['gonderildi', 1200, (p) => p.locator('#wa').click()],
  ] },
  'masthead-970x250-saat': { w: 970, h: 250, saat: 21, steps: [
    ['gece', 1200], ['tur-sabah', 2600], ['tur-aksam', 2600],
    ['surukle-ogle', 900, async (p) => { await p.mouse.move(700, 211); await p.mouse.down(); await p.mouse.move(745, 211, { steps: 6 }); await p.mouse.up(); }],
    ['surukle-sabah', 900, async (p) => { await p.mouse.move(745, 211); await p.mouse.down(); await p.mouse.move(640, 211, { steps: 6 }); await p.mouse.up(); }],
  ] },
  'masthead-970x250-3d-halka': { w: 970, h: 250, steps: [
    ['acilis', 600], ['oturdu', 2600],
    ['surukle', 1400, async (p) => { await p.mouse.move(560, 110); await p.mouse.down(); await p.mouse.move(420, 112, { steps: 10 }); await p.mouse.up(); }],
    ['yan-kart', 1400, (p) => p.mouse.click(660, 120)],
  ] },
  'mobil-320x480-3d-kup': { w: 320, h: 480, mobile: true, steps: [
    ['birlesme', 700], ['donus', 2400], ['tur', 2600],
    ['cevir', 1400, async (p) => { await p.mouse.move(160, 210); await p.mouse.down(); await p.mouse.move(80, 260, { steps: 10 }); await p.mouse.up(); }],
    ['cevir-2', 1400, async (p) => { await p.mouse.move(160, 210); await p.mouse.down(); await p.mouse.move(160, 300, { steps: 10 }); await p.mouse.up(); }],
  ] },
  'mobil-320x480-3d-kitap': { w: 320, h: 480, mobile: true, steps: [
    ['kapak', 1000], ['donerken', 800], ['sayfa-1', 1400], ['ileri', 1300, (p) => p.mouse.click(250, 200)],
    ['geri', 1300, (p) => p.locator('#pv').click()], ['son', 1400, async (p) => { for (let i = 0; i < 8; i++) { await p.locator('#nx').click(); await p.waitForTimeout(150); } }],
  ] },
  'mobil-320x480-3d-tunel': { w: 320, h: 480, mobile: true, steps: [
    ['giris', 900], ['foto-1', 2000], ['foto-2', 2600],
    ['kaydir', 1600, async (p) => { await p.mouse.move(160, 380); await p.mouse.down(); await p.mouse.move(160, 250, { steps: 10 }); await p.mouse.up(); }],
    ['kapi', 2200, async (p) => { for (let i = 0; i < 6; i++) await p.mouse.wheel(0, 400); }],
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
    if (cfg.day) await page.addInitScript((d) => { window.AD_DAY = d; }, cfg.day);
    if (cfg.saat) await page.addInitScript((h) => { window.AD_SAAT = h; }, cfg.saat);
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
