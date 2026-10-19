#!/usr/bin/env node
'use strict';
/**
 * Konseptlerin kilit anlarını preview/<id>/ altına kaydeder ve etkileşimleri sınar (sayfa hatası olursa çıkış kodu 1).
 * Kullanım: NODE_PATH=$(npm root -g) node tools/capture-concepts.js [id ...]
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..');
const cache = path.join(root, 'preview', '.fontcache');
const only = process.argv.slice(2);

// Fontları önbelleğe al (bazı ortamlarda Chromium Google Fonts'a doğrudan erişemez)
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
fs.mkdirSync(cache, { recursive: true });
const cssFile = path.join(cache, 'fonts.css');
if (!fs.existsSync(cssFile)) {
  execSync(`curl -sS -A "${UA}" -o "${cssFile}" "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&display=swap"`);
  for (const m of fs.readFileSync(cssFile, 'utf8').matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g))
    execSync(`curl -sS -o "${path.join(cache, path.basename(m[1]))}" "${m[1]}"`);
}
const fontCss = fs.readFileSync(cssFile, 'utf8');

const SCENARIOS = {
  '02-kombin-makinesi': async (p, shot) => {
    await shot('01-acilis', 900);
    await shot('02-demo-cevirme', 2300);
    await shot('03-sonuc', 1800);
    const k = await p.locator('#knob').boundingBox();
    await p.mouse.move(k.x + 14, k.y + 14); await p.mouse.down(); await p.mouse.move(k.x + 14, k.y + 90, { steps: 6 });
    await shot('04-kolu-cekme', 100);
    await p.mouse.move(k.x + 14, k.y + 150, { steps: 4 }); await p.mouse.up();
    await shot('05-makaralar-donuyor', 500);
    await p.mouse.move(700, 240); await shot('06-yeni-kombin', 1700);
    await p.click('#l0'); await p.hover('#r1'); await p.click('#r1 .dn'); await shot('07-kilit-ve-ok', 600);
    await p.click('#i0'); await p.click('#i1'); await p.click('#cta');
  },
  '03-stil-borsasi': async (p, shot) => {
    await shot('01-acilis', 900);
    await shot('02-dengeli', 1500);
    await shot('03-demo-muhafazakar', 1700);
    const s = await p.locator('#slider').boundingBox();
    await p.mouse.move(s.x + s.width / 2, s.y + 12); await p.mouse.down();
    await p.mouse.move(s.x + s.width * 0.8, s.y + 12, { steps: 8 }); await shot('04-surukleme', 200);
    await p.mouse.move(s.x + s.width - 4, s.y + 12, { steps: 4 }); await p.mouse.up();
    await p.mouse.move(960, 240); await shot('05-atak', 900);
    await p.hover('.card >> nth=1'); await shot('06-kart-dagilim', 400);
    await p.click('.card >> nth=0'); await p.click('#cta');
  },
  '04-bugulu-cam': async (p, shot) => {
    await shot('01-acilis', 900);
    await shot('02-bugulu-cam', 1100);
    await shot('03-demo-silme', 1300);
    // kullanıcı camı siler
    await p.mouse.move(60, 40);
    for (let row = 0; row < 4; row++) {
      const y = 30 + row * 62;
      await p.mouse.move(row % 2 ? 940 : 40, y, { steps: 18 });
      if (row === 1) await shot('04-silerken', 50);
    }
    await p.mouse.move(500, 120, { steps: 6 }); await p.mouse.move(960, 248, { steps: 4 });
    await shot('05-acilan-sahne', 1900);
    await p.hover('.hs >> nth=0'); await shot('06-urun-karti', 500);
    await p.hover('.pick button >> nth=1'); await shot('07-sweatshirt', 500);
    await p.click('.card.on'); await p.click('#cta');
  },
};

SCENARIOS['05-mobil-stil-eslesmesi'] = async (p, shot) => {
  const swipe = async (dir, snap) => {
    const c = await p.locator('.card').last().boundingBox();
    const x = c.x + c.width / 2, y = c.y + c.height / 2;
    await p.mouse.move(x, y); await p.mouse.down();
    await p.mouse.move(x + dir * 70, y + 8, { steps: 6 });
    if (snap) await shot(snap, 60);
    await p.mouse.move(x + dir * 160, y + 14, { steps: 4 }); await p.mouse.up();
    await p.waitForTimeout(450);
  };
  await shot('01-acilis', 900);
  await shot('02-kart', 1300);
  await shot('03-ipucu-gosterim', 900);
  await p.waitForTimeout(1200);
  await swipe(1, '04-begen-surukleme');
  await swipe(-1, '05-gec-surukleme');
  await swipe(1); await p.click('#bLike'); await p.waitForTimeout(450);
  await p.click('#bNope'); await p.waitForTimeout(450);
  await swipe(1); await swipe(1);
  await shot('06-son-kart', 200);
  await swipe(-1);
  await shot('07-sonuc', 1200);
  await p.click('.thumbs button >> nth=0'); await p.click('#cta');
};

SCENARIOS['06-mobil-salla'] = async (p, shot) => {
  await shot('01-acilis', 900);
  await shot('02-kombin', 1000);
  await shot('03-kendini-sallama', 500);
  await p.waitForTimeout(1200);
  // Gerçek sallamayı taklit et: ardışık devicemotion olayları
  await p.evaluate(() => {
    const ev = (x, y, z) => { const e = new Event('devicemotion'); e.accelerationIncludingGravity = { x, y, z }; window.dispatchEvent(e); };
    [[0, 9.8, 0], [24, 6, 5], [-22, 14, -6], [25, -4, 6], [-23, 15, -5]].forEach((a, i) => setTimeout(() => ev(...a), i * 60));
  });
  await shot('04-telefon-sallandi', 350);
  await shot('05-yeni-kombin', 900);
  await p.click('#s1 .lock'); await p.click('#shake'); await shot('06-alt-kilitli-salla', 300);
  await shot('07-sonuc', 900);
  await p.click('#s0 .ph'); await p.click('#cta');
};

SCENARIOS['07-masthead-renk-sec'] = async (p, shot) => {
  await shot('01-acilis', 900);
  await shot('02-ilk-renk', 1300);
  await shot('03-renk-akisi', 2700);
  await p.hover('#sw button >> nth=5'); await p.click('#sw button >> nth=5'); await shot('04-saks-secildi', 500);
  await shot('05-renk-yayildi', 500);
  const s = await p.locator('#stage').boundingBox();
  await p.mouse.move(s.x + 300, s.y + 120); await p.mouse.down(); await p.mouse.move(s.x + 140, s.y + 120, { steps: 8 }); await p.mouse.up();
  await shot('06-surukleyerek-tarama', 700);
  await p.click('#tabs button >> nth=1'); await p.mouse.move(960, 245); await shot('07-sweatshirt', 900);
  await p.click('#cta'); await p.click('#all');
};

SCENARIOS['08-masthead-fermuar'] = async (p, shot) => {
  await shot('01-acilis', 900);
  await shot('02-kapali-mont', 1300);
  await shot('03-fermuar-gosterimi', 600);
  await p.waitForTimeout(1200);
  const k = await p.locator('#pull').boundingBox();
  await p.mouse.move(k.x + 13, k.y + 10); await p.mouse.down();
  await p.mouse.move(k.x + 13, k.y + 70, { steps: 8 }); await shot('04-yari-acik', 100);
  await p.mouse.move(k.x + 13, k.y + 120, { steps: 6 }); await shot('05-cogu-acik', 100);
  await p.mouse.up();
  await p.mouse.move(960, 245); await shot('06-katmanlar', 1400);
  await p.hover('.tile >> nth=2'); await shot('07-katman-uzerinde', 400);
  await p.click('.tile >> nth=0'); await p.click('#cta');
  await p.click('#replay'); await shot('08-yeniden-kapandi', 1200);
};

(async () => {
  const b = await chromium.launch();
  let failed = false;
  for (const id of Object.keys(SCENARIOS)) {
    if (only.length && !only.includes(id)) continue;
    const out = path.join(root, 'preview', id);
    fs.mkdirSync(out, { recursive: true });
    const size = (require(path.join(root, 'concepts', id, 'data.js')).size) || { w: 970, h: 250 };
    const ctx = await b.newContext({ viewport: { width: size.w, height: size.h }, deviceScaleFactor: 2 });
    await ctx.route('**/fonts.googleapis.com/**', (r) => r.fulfill({ contentType: 'text/css', body: fontCss }));
    await ctx.route('**/fonts.gstatic.com/**', (r) => {
      const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
      fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
    });
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    await p.addInitScript(() => { window.__opened = []; window.open = (u) => { window.__opened.push(u); }; });
    await p.mouse.move(size.w - 1, size.h - 1);
    await p.goto('file://' + path.join(root, 'dist', id, 'index.html'));
    const shot = async (name, wait) => { await p.waitForTimeout(wait); await p.screenshot({ path: path.join(out, name + '.jpg'), type: 'jpeg', quality: 86 }); };
    await SCENARIOS[id](p, shot);
    const opened = await p.evaluate(() => window.__opened);
    await ctx.close();
    console.log(`${errors.length ? '✖' : '✔'} ${id}  açılan: ${opened.length ? opened.map((u) => u.split('?')[0].replace('https://www.altinyildizclassics.com', '')).join(', ') : '-'}${errors.length ? '\n  ' + errors.join('\n  ') : ''}`);
    failed = failed || errors.length > 0;
  }
  await b.close();
  process.exit(failed ? 1 : 0);
})();
