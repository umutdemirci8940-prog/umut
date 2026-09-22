#!/usr/bin/env node
'use strict';
/**
 * Teslim paketi:
 *  release/Pandora2027.html              – reklam ağına yüklenecek tek dosya (dist kopyası; build.js de yazar)
 *  release/pandora-moments-970x250.zip   – aynı dosya zip içinde (index.html)
 *  release/sunum.html                    – tek dosyalık sunum: masthead gömülü (srcdoc), yayın simülasyonu, ekran görüntüleri
 *  release/pandora-masthead-teslim.zip   – dist + sunum + ekran görüntüleri + README
 * Kullanım: node tools/package.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const rel = path.join(root, 'release');
const stage = path.join(rel, 'stage');
fs.mkdirSync(rel, { recursive: true });
fs.rmSync(stage, { recursive: true, force: true }); fs.mkdirSync(stage, { recursive: true });

const banner = fs.readFileSync(path.join(root, 'dist', '970x250', 'index.html'), 'utf8');
fs.writeFileSync(path.join(rel, 'Pandora2027.html'), banner);
const zip1 = path.join(root, 'dist', 'zip', 'pandora-moments-970x250.zip');
if (fs.existsSync(zip1)) fs.copyFileSync(zip1, path.join(rel, 'pandora-moments-970x250.zip'));

const escAttr = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
let single = fs.readFileSync(path.join(root, 'preview', 'index.html'), 'utf8');
single = single.replace('src="../dist/970x250/index.html"', `srcdoc="${escAttr(banner)}"`)
  .replace(/<a class="btn" href="\.\.\/dist\/970x250\/index\.html"[^>]*>[^<]*<\/a>/, '<a class="btn" href="#" id="dl">Mastheadi indir (Pandora2027.html)</a>')
  .replace(/<a class="btn" href="\.\.\/dist\/zip\/[^"]+"[^>]*>[^<]*<\/a>/, '')
  .replace(/fetch\('\.\.\/dist\/970x250\/index\.html'\)[^;]*;/, `document.getElementById('kb').textContent='~${Math.round(Buffer.byteLength(banner) / 1024)} KB';`);
// ekran görüntüleri base64 gömülü
const screens = path.join(root, 'preview', 'screens');
single = single.replace("i.src='screens/'+s[0]+'.jpg'", "i.src=(window.__shots||{})[s[0]]||('screens/'+s[0]+'.jpg')");
const shotMap = {};
if (fs.existsSync(screens)) for (const f of fs.readdirSync(screens)) if (f.endsWith('.jpg')) shotMap[f.replace(/\.jpg$/, '')] = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(screens, f)).toString('base64');
const tail = single.lastIndexOf('</script>');
single = single.slice(0, tail) + `
window.__shots=${JSON.stringify(shotMap)};
var dl=document.getElementById('dl');if(dl)dl.addEventListener('click',function(e){e.preventDefault();var f=document.getElementById('masthead');var u=URL.createObjectURL(new Blob([f.srcdoc],{type:'text/html;charset=utf-8'}));var l=document.createElement('a');l.href=u;l.download='Pandora2027.html';document.body.appendChild(l);l.click();l.remove();setTimeout(function(){URL.revokeObjectURL(u)},2000)});
` + single.slice(tail);
// gömülü ekran görüntüleri script'ten önce tanımlanmalı: shots döngüsü __shots'u okur → sırayı düzelt
single = single.replace("var shots=[", "window.__shots=window.__shots||" + JSON.stringify(shotMap) + ";var shots=[");
fs.writeFileSync(path.join(rel, 'sunum.html'), single);

fs.cpSync(path.join(root, 'dist'), path.join(stage, 'dist'), { recursive: true });
if (fs.existsSync(screens)) fs.cpSync(screens, path.join(stage, 'screens'), { recursive: true });
if (fs.existsSync(path.join(root, 'README.md'))) fs.copyFileSync(path.join(root, 'README.md'), path.join(stage, 'README.md'));
fs.writeFileSync(path.join(stage, 'sunum.html'), fs.readFileSync(path.join(root, 'preview', 'index.html'), 'utf8').replace(/\.\.\/dist\//g, 'dist/'));
fs.writeFileSync(path.join(stage, 'Pandora2027.html'), banner);
const zipOut = path.join(rel, 'pandora-masthead-teslim.zip');
fs.rmSync(zipOut, { force: true });
execSync(`cd "${stage}" && zip -q -r -X "${zipOut}" . -x ".*"`);
fs.rmSync(stage, { recursive: true, force: true });
for (const f of fs.readdirSync(rel)) console.log(`✔ release/${f}  (${(fs.statSync(path.join(rel, f)).size / 1024).toFixed(0)} KB)`);
