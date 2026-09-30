#!/usr/bin/env node
'use strict';
/**
 * Aygaz3.html (önizleme: CDN'den React/Babel/Tailwind yükler) -> DV360 / CM360 HTML5 paketi.
 *
 *   dist/dv360/          index.html + js/ css/ img/ video/   (videolar paket içinde)
 *   dist/dv360-s3video/  aynı paket, videolar S3'ten (dv360.config.json -> videoBaseS3)
 *   release/<paket>-dv360.zip, release/<paket>-dv360-s3video.zip
 *
 * Yapılanlar: JSX önceden derlenir (tarayıcıda Babel yok), Tailwind CSS statik üretilir,
 * React/ReactDOM paket içine kopyalanır, <meta name="ad.size"> ve clickTag eklenir.
 * Kullanım: npm install && node build-dv360.js
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const cfg = JSON.parse(fs.readFileSync(path.join(root, 'dv360.config.json'), 'utf8'));
const SRC = path.join(root, 'Aygaz3.html');
const buildDir = path.join(root, '.build');
const releaseDir = path.join(root, 'release');
const VIDEO_FILES = ['Aile.mp4', 'Beyazyaka.mp4', 'Taksi.mp4', 'filoyoneticisi.mp4'];
const AD = { w: 970, h: 250 };

// Logo: assets/logo-white.png (veya .svg) varsa pakete gömülür, yoksa dv360.config.json -> logoUrl canlı yüklenir
const localLogo = ['logo-white.png', 'logo-white.svg'].find((f) => fs.existsSync(path.join(root, 'assets', f))) || null;

const html = fs.readFileSync(SRC, 'utf8');
const m = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!m) throw new Error('Aygaz3.html içinde <script type="text/babel"> bulunamadı');
const jsx = m[1];

// 1) JSX -> düz JS
const Babel = require('@babel/standalone');
const appJs = Babel.transform(jsx, { presets: [['react', { runtime: 'classic' }]], comments: false, compact: false }).code;

// 2) Tailwind CSS (statik, sadece kullanılan sınıflar)
fs.mkdirSync(buildDir, { recursive: true });
const contentFile = path.join(buildDir, 'content.jsx');
fs.writeFileSync(contentFile, jsx);
fs.writeFileSync(path.join(buildDir, 'tailwind.config.js'),
  `module.exports = { content: [${JSON.stringify(contentFile)}], theme: { extend: {} }, plugins: [] };\n`);
fs.writeFileSync(path.join(buildDir, 'input.css'), '@tailwind base;\n@tailwind components;\n@tailwind utilities;\n');
const cssOut = path.join(buildDir, 'banner.css');
execSync(`"${path.join(root, 'node_modules', '.bin', 'tailwindcss')}" -c "${path.join(buildDir, 'tailwind.config.js')}" -i "${path.join(buildDir, 'input.css')}" -o "${cssOut}" --minify`, { stdio: ['ignore', 'ignore', 'inherit'] });
const css = fs.readFileSync(cssOut, 'utf8');

// 3) index.html şablonu (clickTag'ler HTML içinde açıkça tanımlı: DV360/CM360 bunları tarar)
function indexHtml({ videoBase, assetsNote }) {
  const clickTags = [`  var clickTag = ${JSON.stringify(cfg.clickTag)};`];
  if (cfg.clickTag1) clickTags.push(`  var clickTag1 = ${JSON.stringify(cfg.clickTag1)};`);
  const assets = { VIDEO_BASE: videoBase, KEY_VISUAL_URL: 'img/poster.jpg', LOGO_URL: localLogo ? 'img/' + localLogo : cfg.logoUrl };
  return [
    '<!DOCTYPE html>',
    '<html lang="tr">',
    '<head>',
    '  <meta charset="UTF-8">',
    `  <meta name="ad.size" content="width=${AD.w},height=${AD.h}">`,
    `  <title>Aygaz 100+ Oktan – ${AD.w}x${AD.h}</title>`,
    '  <script>',
    '  // Tıklama yönlendirmesi (CM360 click tracker). DV360 yayında ${GDPR} / ${GDPR_CONSENT_755} makrolarını doldurur.',
    ...clickTags,
    `  // ${assetsNote}`,
    `  window.AYGAZ_ASSETS = ${JSON.stringify(assets)};`,
    '  </script>',
    '  <link rel="stylesheet" href="css/banner.css">',
    `  <style>html,body{margin:0;padding:0;width:${AD.w}px;height:${AD.h}px;overflow:hidden;background:#000D21;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;user-select:none;-webkit-user-select:none}#aygaz-masthead-root{width:${AD.w}px;height:${AD.h}px}</style>`,
    '</head>',
    '<body>',
    '  <div id="aygaz-masthead-root"></div>',
    '  <script src="js/react.production.min.js"></script>',
    '  <script src="js/react-dom.production.min.js"></script>',
    '  <script src="js/banner.js"></script>',
    '</body>',
    '</html>',
    ''
  ].join('\n');
}

function emit(name, { withVideos }) {
  const dist = path.join(root, 'dist', name);
  fs.rmSync(dist, { recursive: true, force: true });
  for (const d of ['js', 'css', 'img']) fs.mkdirSync(path.join(dist, d), { recursive: true });
  fs.copyFileSync(path.join(root, 'node_modules/react/umd/react.production.min.js'), path.join(dist, 'js/react.production.min.js'));
  fs.copyFileSync(path.join(root, 'node_modules/react-dom/umd/react-dom.production.min.js'), path.join(dist, 'js/react-dom.production.min.js'));
  fs.writeFileSync(path.join(dist, 'js/banner.js'), `/* Aygaz 100+ Oktan ${AD.w}x${AD.h} – Aygaz3.html'den derlendi (build-dv360.js) */\n${appJs}\n`);
  fs.writeFileSync(path.join(dist, 'css/banner.css'), css);
  fs.copyFileSync(path.join(root, 'assets/poster.jpg'), path.join(dist, 'img/poster.jpg'));
  if (localLogo) fs.copyFileSync(path.join(root, 'assets', localLogo), path.join(dist, 'img', localLogo));
  let videoBase, assetsNote;
  if (withVideos) {
    fs.mkdirSync(path.join(dist, 'video'));
    for (const f of VIDEO_FILES) fs.copyFileSync(path.join(root, f), path.join(dist, 'video', f));
    videoBase = 'video/';
    assetsNote = 'Videolar paket içindeki video/ klasöründen okunur.';
  } else {
    videoBase = cfg.videoBaseS3;
    assetsNote = 'Videolar S3\'ten okunur: ' + cfg.videoBaseS3 + VIDEO_FILES.join(', ');
  }
  fs.writeFileSync(path.join(dist, 'index.html'), indexHtml({ videoBase, assetsNote }));

  // zip: dosyalar kök dizinde (üst klasör yok), tek .html
  fs.mkdirSync(releaseDir, { recursive: true });
  const zipPath = path.join(releaseDir, `${cfg.packageName}-${name}.zip`);
  fs.rmSync(zipPath, { force: true });
  execSync(`cd "${dist}" && zip -q -r -X "${zipPath}" . -x ".*" "__MACOSX/*"`);
  const total = execSync(`cd "${dist}" && find . -type f -printf "%s\\n" | awk '{s+=$1} END {print s}'`).toString().trim();
  console.log(`✔ ${name.padEnd(16)} ${(+total / 1024 / 1024).toFixed(2).padStart(6)} MB açık, ${(fs.statSync(zipPath).size / 1024 / 1024).toFixed(2).padStart(6)} MB zip → ${path.relative(root, zipPath)}`);
}

emit('dv360', { withVideos: true });
emit('dv360-s3video', { withVideos: false });
console.log(`   logo: ${localLogo ? 'paket içinde (assets/' + localLogo + ')' : 'canlı ' + cfg.logoUrl}`);
console.log(`   banner.js ${(Buffer.byteLength(appJs) / 1024).toFixed(0)} KB, banner.css ${(Buffer.byteLength(css) / 1024).toFixed(0)} KB, clickTag → ${cfg.clickTag.slice(0, 60)}…`);
