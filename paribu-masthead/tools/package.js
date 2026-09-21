#!/usr/bin/env node
'use strict';
/**
 * Teslim paketi:
 *  release/paribu-masthead-970x250.html  – reklam ağına yüklenecek tek dosya (dist kopyası)
 *  release/paribu-masthead-970x250.zip   – aynı dosya zip içinde (index.html)
 *  release/sunum.html                    – tek dosyalık sunum: masthead gömülü (srcdoc), yayın simülasyonu, notlar
 *  release/paribu-masthead-teslim.zip    – dist + sunum + ekran görüntüleri + README
 * Kullanım: node tools/package.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const root = path.join(__dirname, '..');
const rel = path.join(root, 'release');
const stage = path.join(rel, 'stage');
fs.rmSync(rel, { recursive: true, force: true });
fs.mkdirSync(stage, { recursive: true });

const banner = fs.readFileSync(path.join(root, 'dist', '970x250', 'index.html'), 'utf8');
fs.writeFileSync(path.join(rel, 'paribu-masthead-970x250.html'), banner);
fs.copyFileSync(path.join(root, 'dist', 'zip', 'paribu-masthead-970x250.zip'), path.join(rel, 'paribu-masthead-970x250.zip'));

// tek dosyalık sunum
const escAttr = (t) => t.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
let single = fs.readFileSync(path.join(root, 'preview', 'index.html'), 'utf8');
single = single.replace('src="../dist/970x250/index.html"', `srcdoc="${escAttr(banner)}"`)
  .replace(/<a class="btn" href="\.\.\/dist\/970x250\/index\.html"[^>]*>[^<]*<\/a>/, '<a class="btn" href="#" id="dl">Mastheadi indir (index.html)</a>')
  .replace(/<a class="btn" href="\.\.\/dist\/zip\/[^"]+"[^>]*>[^<]*<\/a>/, '')
  .replace("f.contentWindow.postMessage('restart','*')", "f.srcdoc=f.srcdoc")
  .replace(/\.\.\/preview\/screens\//g, 'screens/').replace(/screens\//g, 'screens/');
const tail = single.lastIndexOf('</script>');
single = single.slice(0, tail) + `
var dl=document.getElementById('dl');if(dl)dl.addEventListener('click',function(e){e.preventDefault();var f=document.getElementById('masthead');var u=URL.createObjectURL(new Blob([f.srcdoc],{type:'text/html;charset=utf-8'}));var l=document.createElement('a');l.href=u;l.download='paribu-masthead-970x250.html';document.body.appendChild(l);l.click();l.remove();setTimeout(function(){URL.revokeObjectURL(u)},2000)});
` + single.slice(tail);
// ekran görüntüleri sunumda base64 gömülü (tek dosya)
single = single.replace(/src="\.\.\/preview\/screens\/([^"]+)"|src="screens\/([^"]+)"/g, (m, a, b) => {
  const f = path.join(root, 'preview', 'screens', a || b); if (!fs.existsSync(f)) return m;
  return `src="data:image/jpeg;base64,${fs.readFileSync(f).toString('base64')}"`;
});
fs.writeFileSync(path.join(rel, 'sunum.html'), single);

// teslim zip'i
fs.cpSync(path.join(root, 'dist'), path.join(stage, 'dist'), { recursive: true });
if (fs.existsSync(path.join(root, 'preview', 'screens'))) fs.cpSync(path.join(root, 'preview', 'screens'), path.join(stage, 'screens'), { recursive: true });
if (fs.existsSync(path.join(root, 'README.md'))) fs.copyFileSync(path.join(root, 'README.md'), path.join(stage, 'README.md'));
fs.writeFileSync(path.join(stage, 'sunum.html'), fs.readFileSync(path.join(root, 'preview', 'index.html'), 'utf8').replace(/\.\.\/dist\//g, 'dist/').replace(/\.\.\/preview\/screens\//g, 'screens/'));
const zipOut = path.join(rel, 'paribu-masthead-teslim.zip');
execSync(`cd "${stage}" && zip -q -r -X "${zipOut}" . -x ".*"`);
fs.rmSync(stage, { recursive: true, force: true });
for (const f of fs.readdirSync(rel)) console.log(`✔ release/${f}  (${(fs.statSync(path.join(rel, f)).size / 1024).toFixed(0)} KB)`);
