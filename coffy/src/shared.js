'use strict';
/**
 * Ortak parçalar: bardak SVG şablonu ve tek dosyalık HTML5 banner sayfası.
 */
const fs = require('fs');
const path = require('path');

const FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Manrope:wght@500;600;700;800&display=swap';

const SIZES = {
  '320x480': { w: 320, h: 480, label: 'Mobil Interstitial / Oyun içi', kind: 'm' },
  '970x250': { w: 970, h: 250, label: 'Billboard', kind: 'w' },
};

/** Şeffaf buzlu kahve bardağı. __ID__, __STYLE__, __CLS__ çalışma anında doldurulur. */
const CUPT = `<svg class="cup __CLS__" style="__STYLE__" viewBox="0 0 120 192" aria-hidden="true">
<defs>
<clipPath id="__ID__k"><path d="M20 54H100L90.4 178Q89.8 184 83.5 184H36.5Q30.2 184 29.6 178Z"/></clipPath>
<linearGradient id="__ID__g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f6e2c8"/><stop offset=".07" stop-color="#e3be95"/><stop offset=".3" style="stop-color:var(--tone)"/><stop offset="1" style="stop-color:var(--tone)"/></linearGradient>
</defs>
<ellipse cx="60" cy="188" rx="34" ry="3.6" fill="#000" opacity=".35"/>
<rect x="64" y="-4" width="9" height="150" rx="3" fill="var(--acc)" transform="rotate(10 68 70)"/>
<rect x="66" y="-4" width="2.4" height="150" fill="#fff" opacity=".35" transform="rotate(10 68 70)"/>
<g clip-path="url(#__ID__k)">
<g class="liq">
<g class="wave"><path d="M-60 56q15-5 30 0t30 0 30 0 30 0 30 0 30 0 30 0 30 0 30 0V200H-60z" fill="url(#__ID__g)"/></g>
<rect class="ice" x="34" y="62" width="20" height="18" rx="4.5" fill="#fff" fill-opacity=".38" stroke="#fff" stroke-opacity=".7"/>
<rect class="ice" x="58" y="70" width="18" height="17" rx="4.5" fill="#fff" fill-opacity=".32" stroke="#fff" stroke-opacity=".65"/>
<rect class="ice" x="76" y="60" width="16" height="15" rx="4" fill="#fff" fill-opacity=".3" stroke="#fff" stroke-opacity=".6"/>
</g>
</g>
<path d="M20 54H100L90.4 178Q89.8 184 83.5 184H36.5Q30.2 184 29.6 178Z" fill="#fff" fill-opacity=".07" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/>
<path d="M28 64L35 172" stroke="#fff" stroke-opacity=".38" stroke-width="4" stroke-linecap="round"/>
<text x="61" y="136" text-anchor="middle" font-family="Bricolage Grotesque,Manrope,sans-serif" font-weight="800" font-size="23" letter-spacing="-1.2" fill="#fff8ee">coffy</text>
<circle cx="92" cy="133" r="3" fill="var(--acc)"/>
<path d="M24 50Q25 24 60 22Q95 24 96 50Z" fill="#fff" fill-opacity=".14" stroke="#fff" stroke-opacity=".6" stroke-width="1.4"/>
<rect x="15" y="48" width="90" height="8" rx="4" fill="#fff8ee"/>
</svg>`;

const ENGINE = fs.readFileSync(path.join(__dirname, 'engine.js'), 'utf8');
const BASE_CSS = fs.readFileSync(path.join(__dirname, 'base.css'), 'utf8') + '\n.cup .ice{transform-box:fill-box;transform-origin:center}\n';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fnBody = (fn) => `(${fn.toString()})();`;

/** Tek dosyalık banner HTML'i üretir. */
function page(concept, config) {
  const s = SIZES[concept.size];
  const ad = { id: 'a' + concept.no, w: s.w, h: s.h, name: concept.name };
  const css = BASE_CSS + '\n' + (concept.css || '');
  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${s.w},height=${s.h}">
<meta name="viewport" content="width=${s.w},height=${s.h},initial-scale=1,user-scalable=no">
<title>Coffy – ${esc(config.brand.slogan)} – ${esc(concept.name)} (${concept.size})</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${FONTS.replace(/&/g, '&amp;')}" rel="stylesheet">
<style>:root{--W:${s.w}px;--H:${s.h}px}
${css}</style>
</head>
<body>
<div class="ad ${s.kind}" id="ad" role="region" aria-label="Coffy reklamı: ${esc(concept.name)}">
<div class="ad-logo">__LOGO__</div>
${concept.html}
</div>
<script>
var C=${JSON.stringify(config)};
var AD=${JSON.stringify(ad)};
var CUPT=${JSON.stringify(CUPT)};
${ENGINE}
document.querySelectorAll('.ad-logo').forEach(function(l){l.innerHTML=logo()});
function boot(){${fnBody(concept.js)}}
if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',boot)}else{boot()}
</script>
</body>
</html>
`;
}

module.exports = { SIZES, CUPT, FONTS, page, esc };
