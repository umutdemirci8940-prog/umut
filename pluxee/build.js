#!/usr/bin/env node
'use strict';
/**
 * Pluxee "Geçiyor" masthead derleyicisi.
 *   dist/970x250/index.html          – ANA TESLİM: sinematik sürüm (fotoğrafik, kurumsal)
 *   dist/970x250-flat/index.html     – ilk taslak (illüstrasyon), arşiv
 *   dist/zip/pluxee-970x250*.zip     – reklam ağı paketleri
 *   preview/index.html               – sunum sayfası (sinematik kreatif srcdoc ile gömülü, tek dosya)
 *
 * Kullanım: node pluxee/build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('./src/data');
const cine = require('./src/template-cinematic');
const flat = require('./src/template');

const root = __dirname;
const zipDir = path.join(root, 'dist', 'zip');
const preview = path.join(root, 'preview');
fs.mkdirSync(zipDir, { recursive: true });
fs.mkdirSync(preview, { recursive: true });
const LIMIT_KB = 150;
let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }

function emit(dirName, zipName, html, label) {
  const dir = path.join(root, 'dist', dirName);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const kb = Buffer.byteLength(html) / 1024;
  let note = '';
  if (hasZip) {
    const zipPath = path.join(zipDir, zipName);
    fs.rmSync(zipPath, { force: true });
    execSync(`zip -q -j "${zipPath}" "${path.join(dir, 'index.html')}"`);
    note = ` → ${path.relative(root, zipPath)}`;
  }
  console.log(`✔ ${label.padEnd(30)} ${kb.toFixed(1).padStart(6)} KB${note}${kb > LIMIT_KB ? `  ⚠ ${LIMIT_KB} KB sınırının üstünde` : ''}`);
  return kb;
}

const cineHtml = cine.render(data);
const kb = emit('970x250', 'pluxee-970x250.zip', cineHtml, '970x250 sinematik (ana teslim)');
emit('970x250-flat', 'pluxee-970x250-flat.zip', flat.render(data), '970x250 illüstrasyon (ilk taslak)');
if (!hasZip) console.log('ℹ zip bulunamadı; paketler atlandı.');

// Sunum sayfası
const C = data.cinematic;
const segs = Object.keys(C.segments).length;
const scenes = C.scenes.length;
const variants = segs * scenes;
const showcaseData = {
  segments: Object.fromEntries(Object.entries(data.segments).map(([k, v]) => [k, { label: v.label, cta: C.segments[k].cta, sub: C.segments[k].sub }])),
  scenes: C.scenes,
  lead: C.lead,
  weather: data.weather,
  timing: data.timingCinematic,
  brand: { name: data.brand.name, campaign: data.brand.campaign, url: data.brand.url },
};
const jsString = (s) => JSON.stringify(s).replace(/<\//g, '<\\/').replace(/<!--/g, '<\\!--');
const tpl = fs.readFileSync(path.join(root, 'src', 'showcase.html'), 'utf8');
const showcase = tpl
  .replace('__MASTHEAD_SRC__', () => jsString(cineHtml))
  .replace('__SHOWCASE_DATA__', () => jsString(showcaseData))
  .replace(/__VARIANTS__/g, String(variants))
  .replace(/__SEGMENTS__/g, String(segs))
  .replace(/__SCENES__/g, String(scenes))
  .replace(/__KB__/g, kb.toFixed(0))
  .replace(/__BUILD_DATE__/g, new Date().toISOString().slice(0, 10));
fs.writeFileSync(path.join(preview, 'index.html'), showcase);
console.log(`✔ preview/index.html  (${variants} versiyon: ${segs} segment × ${scenes} öncü sahne)`);
