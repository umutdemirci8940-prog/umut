'use strict';
/**
 * Ortak parçalar: tek dosyalık HTML5 banner sayfası.
 */
const fs = require('fs');
const path = require('path');

const FONTS = 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700;800&family=Manrope:wght@500;600;700;800&display=swap';

const SIZES = {
  '320x480': { w: 320, h: 480, label: 'Mobil Interstitial / Oyun içi', kind: 'm' },
  '970x250': { w: 970, h: 250, label: 'Billboard', kind: 'w' },
};

const ENGINE = fs.readFileSync(path.join(__dirname, 'engine.js'), 'utf8');
const BASE_CSS = fs.readFileSync(path.join(__dirname, 'base.css'), 'utf8');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fnBody = (fn) => `(${fn.toString()})();`;

/** Tek dosyalık banner HTML'i üretir. */
function page(concept, config) {
  const ad = { id: 'a' + concept.no, name: concept.name };
  const css = BASE_CSS + '\n' + (concept.css || '') + '\n/* düzen uyarlaması */\n' + (concept.alt || '');
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=970,height=250">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">
<!-- Boyutlar: 970x250, 320x480 (aynı dosya; alan genişliğine göre yerleşim değiştirir) -->
<title>Coffy – ${esc(config.brand.slogan)} – ${esc(concept.name)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS.replace(/&/g, '&amp;')}" rel="stylesheet">
<style>:root{--W:100vw;--H:100vh}
${css}</style>
</head>
<body>
<div class="ad" id="ad" role="region" aria-label="Coffy reklamı: ${esc(concept.name)}">
<div class="ad-logo">__LOGO__</div>
${concept.html}
</div>
<script>
var C=${JSON.stringify(config)};
var AD=${JSON.stringify(ad)};
${ENGINE}
document.querySelectorAll('.ad-logo').forEach(function(l){l.innerHTML=logo()});
function boot(){${fnBody(concept.js)}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot)}else{boot()}
</script>
</body>
</html>
`;
}

module.exports = { SIZES, FONTS, page, esc };
