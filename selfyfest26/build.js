#!/usr/bin/env node
'use strict';
/**
 * Selfy Fest '26 – 970x250 interaktif masthead derleyicisi.
 * src/masthead.html + src/data.js + assets/ → dist/970x250/index.html (tek dosya, görseller base64) ve dist/selfyfest26-970x250.zip
 * Kullanım: node selfyfest26/build.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const data = require('./src/data');

const root = __dirname;
const MIME = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', svg: 'image/svg+xml' };
const uri = (rel) => {
  const f = path.join(root, 'assets', rel);
  if (!fs.existsSync(f)) return null;
  return `data:${MIME[path.extname(f).slice(1)]};base64,${fs.readFileSync(f).toString('base64')}`;
};

const DATA = Object.assign({}, data, {
  bg: uri('bg-rings.webp'),
  artists: data.artists.map((a) => Object.assign({}, a, { img: uri(`artists/${a.key}.webp`) })),
});
const logo = uri('selfy-logo.svg');
const LOGO = `${logo ? `<img src="${logo}" alt="Türk Telekom Selfy">` : ''}<span class="fest">FEST<em>'26</em></span>`;
const s1 = uri('sponsors-1.png'), s2 = uri('sponsors-2.png');
const SPONSORS = (s1 ? `<img class="s1" src="${s1}" alt="Türk Telekom 5G, muud, Tivibu GO, GAME ON">` : '') +
  (s2 ? `<div class="row"><img class="s2" src="${s2}" alt="Kral Pop Radyo"></div>` : '');

const font = (f) => `url(data:font/woff2;base64,${fs.readFileSync(path.join(root, 'assets', 'fonts', f)).toString('base64')}) format('woff2')`;
// Sitedeki Anton + Mulish dosyaları, Türkçe karakter setine indirgenmiş (tools/README → pyftsubset)
const FONTS = [
  `@font-face{font-family:'Anton';font-weight:400;font-display:block;src:${font('anton.woff2')}}`,
  `@font-face{font-family:'Mulish';font-weight:500 800;font-display:block;src:${font('mulish-700.woff2')}}`,
  `@font-face{font-family:'Mulish';font-weight:900;font-display:block;src:${font('mulish-900.woff2')}}`,
].join('\n');

const tpl = fs.readFileSync(path.join(root, 'src', 'masthead.html'), 'utf8');
const js = (v) => JSON.stringify(v).replace(/</g, '\\u003c');

// Gemius gösterim pikseli: [TIMESTAMP] her gösterimde önbellek kırıcıyla doldurulur, bir kez çağrılır
const impressionScript = (url) => `<script>(function(){var u=${js(url)}.replace('[TIMESTAMP]',String(Date.now())+String(Math.floor(Math.random()*1e6)));` +
  `var i=new Image(1,1);i.alt='';i.style.cssText='position:absolute;left:-9999px;top:-9999px;width:1px;height:1px;border:0';` +
  `i.src=u;(document.body||document.documentElement).appendChild(i);})();</script>`;

function render({ clickUrl, tracking }) {
  const d = Object.assign({}, DATA, { url: clickUrl });
  delete d.dv360;
  return tpl
    .replace('{{FONTS}}', () => FONTS)
    .replace('{{CLICK_URL}}', () => js(clickUrl))
    .replace('{{LOGO}}', () => LOGO)
    .replace('{{SPONSORS}}', () => SPONSORS)
    .replace('{{DATA}}', () => js(d))
    .replace('{{TRACKING}}', () => tracking || '');
}

let hasZip = true;
try { execSync('zip -v', { stdio: 'ignore' }); } catch { hasZip = false; }

const VARIANTS = [
  { dir: '970x250', zip: 'selfyfest26-970x250.zip', label: 'standart', clickUrl: data.url },
  { dir: 'dv360', zip: 'selfyfest26-970x250-dv360.zip', label: 'DV360 + Gemius', clickUrl: data.dv360.clickTag, tracking: impressionScript(data.dv360.impression) },
];
for (const v of VARIANTS) {
  const html = render(v);
  const out = path.join(root, 'dist', v.dir);
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), html);
  const kb = Buffer.byteLength(html) / 1024;
  let zipNote = ' (zip bulunamadı)';
  if (hasZip) {
    const zip = path.join(root, 'dist', v.zip);
    fs.rmSync(zip, { force: true });
    execSync(`zip -q -j "${zip}" "${path.join(out, 'index.html')}"`);
    zipNote = ` → ${path.relative(process.cwd(), zip)} (${(fs.statSync(zip).size / 1024).toFixed(1)} KB)`;
  }
  console.log(`✔ 970x250 ${v.label.padEnd(15)} ${kb.toFixed(1)} KB${zipNote}${kb > 150 ? '  ⚠ 150 KB üstü' : ''}`);
}
