#!/usr/bin/env node
'use strict';
/**
 * Altınyıldız Classics 970x250 masthead setini derler:
 *   src/<banner>.html + src/shared.js + src/config.js + assets/banner/*  →  dist/<banner>/index.html (+ zip)
 * Görseller ve logo base64 olarak gömülür; her banner tek dosyadır.
 * Kullanım: node altinyildiz/build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const cfg = require('./src/config');

const ROOT = __dirname;
const DIST = path.join(ROOT, 'dist');
const IMG = path.join(ROOT, 'assets', 'banner');
const BANNERS = ['vinc', 'vitrin', 'lookbook'];

const b64 = (f, mime) => `data:${mime};base64,${fs.readFileSync(f).toString('base64')}`;

// Logo: satır içi SVG (currentColor ile renklendirilir)
const logoFile = path.join(IMG, 'logo.svg');
const logoSvg = fs.existsSync(logoFile) ? fs.readFileSync(logoFile, 'utf8').replace('<svg ', '<svg class="ay-svg" aria-hidden="true" ') : null;

const data = {
  cats: cfg.cats.map((c, ci) => ({
    chip: c.chip, label: c.label, tone: c.tone, tonename: c.tonename, word: c.word,
    items: c.items.map((it, i) => {
      const f = path.join(IMG, `${c.key}-${i}.webp`);
      if (!fs.existsSync(f)) throw new Error(`Görsel yok: ${path.relative(ROOT, f)} – önce: node altinyildiz/tools/prepare-images.js`);
      return { name: it.name, price: it.price, oldPrice: it.oldPrice || 0, url: it.url, img: b64(f, 'image/webp') };
    }),
  })),
  star: cfg.star, perks: cfg.perks, prizes: cfg.prizes,
};

const clickTags = [`  var clickTag = ${JSON.stringify(cfg.clickTag)};`]
  .concat(cfg.cats.map((c, i) => `  var clickTag${i + 1} = ${JSON.stringify(c.url)}; // ${c.chip}`)).join('\n');
const shared = fs.readFileSync(path.join(ROOT, 'src', 'shared.js'), 'utf8')
  .replace('/*@LOGO@*/null', JSON.stringify(logoSvg));

let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }
fs.mkdirSync(path.join(DIST, 'zip'), { recursive: true });

for (const name of BANNERS) {
  let html = fs.readFileSync(path.join(ROOT, 'src', name + '.html'), 'utf8');
  html = html
    .replace('/*@CLICKTAGS@*/', () => clickTags)
    .replace('/*@SHARED@*/', () => shared)
    .replace('/*@DATA@*/{}', () => JSON.stringify(data))
    .replace('/*@LEGAL@*/', () => cfg.legal[name] || '');
  const dir = path.join(DIST, name);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const kb = Buffer.byteLength(html) / 1024;
  let note = '';
  if (hasZip) {
    const z = path.join(DIST, 'zip', `altinyildiz-${name}-970x250.zip`);
    fs.rmSync(z, { force: true });
    execSync(`zip -q -j -X "${z}" "${path.join(dir, 'index.html')}"`);
    note = ` → ${path.relative(ROOT, z)} (${(fs.statSync(z).size / 1024).toFixed(0)} KB zip)`;
  }
  console.log(`✔ ${name.padEnd(9)} ${kb.toFixed(1).padStart(6)} KB${note}`);
}
