'use strict';
/**
 * Pandora Moments 970×250 masthead – HTML birleştirici.
 * render(data, assets) → tek dosyalık, bağımsız HTML5 (satır içi CSS/JS; fotoğraflar, logo ve font base64 gömülü).
 *
 * assets = {
 *   logo:      { uri, aspect, svg? }            // gerçek Pandora logosu (yoksa yazı markası)
 *   hero:      { uri }                          // arka plan fotoğrafı (yoksa degrade)
 *   heroPos:   '62% 40%'                        // fotoğrafın odak noktası
 *   bracelets: { silver: {uri}, rose: {uri}, gold: {uri} }   // şeffaf packshot'lar (yoksa vektör halka)
 *   charms:    { hearts: {uri}, ... }           // şeffaf charm fotoğrafları (yoksa vektör disk)
 *   fontCss:   '@font-face{...}' | null         // gömülü Inter; yoksa Google Fonts bağlantısı
 *   overrides: { prices/titles from manifest }  // build.js manifest'ten uygular
 * }
 */
const fs = require('fs');
const path = require('path');

const SIZE = { w: 970, h: 250, label: 'Billboard / Masthead' };
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const RESET = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>';
const SOUND_OFF = '<svg class="off" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>';
const SOUND_ON = '<svg class="onI" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/></svg>';

/** Gerçek packshot yoksa: metal tonunda vektör yılan zincir halkası (yer tutucu). */
function ringSvg(b) {
  const [c0, c1, c2] = b.swatch;
  return `<svg class="v" data-metal="${esc(b.key)}" viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="rg-${esc(b.key)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset=".5" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient><pattern id="rp-${esc(b.key)}" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3Q3 0 6 3Q3 6 0 3Z" fill="none" stroke="${c0}" stroke-width=".9" opacity=".8"/></pattern></defs><circle cx="100" cy="100" r="82" fill="none" stroke="url(#rg-${esc(b.key)})" stroke-width="11"/><circle cx="100" cy="100" r="82" fill="none" stroke="url(#rp-${esc(b.key)})" stroke-width="10"/><rect x="88" y="6" width="24" height="16" rx="5" fill="url(#rg-${esc(b.key)})" stroke="${c2}" stroke-width=".8"/><circle cx="100" cy="14" r="4" fill="none" stroke="#fff" stroke-width=".8" opacity=".85"/></svg>`;
}
/** Gerçek charm fotoğrafı yoksa: metal disk + kısaltma. */
function charmSvg(c, i) {
  const hues = ['#c8104e', '#3b5bdb', '#e8547f', '#2b8ad6', '#7048e8', '#b8891c', '#0ca678'];
  const col = hues[i % hues.length];
  return `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="cg-${esc(c.key)}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${col}"/><stop offset="1" stop-color="#3a1020"/></radialGradient></defs><circle cx="32" cy="14" r="6" fill="none" stroke="#bfc4cc" stroke-width="3"/><circle cx="32" cy="38" r="22" fill="url(#cg-${esc(c.key)})"/><ellipse cx="25" cy="30" rx="7" ry="3.5" fill="#fff" opacity=".7" transform="rotate(-25 25 30)"/><text x="32" y="43" font-family="Inter,Arial,sans-serif" font-size="13" font-weight="800" text-anchor="middle" fill="#fff" opacity=".9">${esc(c.short.slice(0, 2).toUpperCase())}</text></svg>`;
}
function logoHtml(name, logo) {
  if (logo && logo.svg) return logo.svg.replace('<svg', '<svg class="logo" role="img" aria-label="' + esc(name) + '"');
  if (logo && logo.uri) return `<img class="logo" src="${logo.uri}" alt="${esc(name)}"${logo.aspect ? ` style="width:${Math.round(20 * logo.aspect)}px"` : ''}>`;
  return `<span class="logo-text" role="img" aria-label="${esc(name)}">${esc(name.toUpperCase())}</span>`;
}
const imgOrSvg = (a, alt, fallback) => a && a.uri ? `<img src="${a.uri}" alt="${esc(alt)}">` : fallback;

function render(data, assets = {}) {
  const B = data.brand, K = data.copy, CP = data.campaign || {}, S = data.stage;
  const css = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
  const runtime = fs.readFileSync(path.join(__dirname, 'runtime.js'), 'utf8');
  const fontHead = assets.fontCss
    ? `<style>${assets.fontCss}</style>`
    : `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">`;

  const bracelets = data.bracelets.map((b) => Object.assign({}, b, (assets.overrides && assets.overrides.bracelets && assets.overrides.bracelets[b.key]) || {}));
  const charms = data.charms.map((c) => Object.assign({}, c, (assets.overrides && assets.overrides.charms && assets.overrides.charms[c.key]) || {}));
  const charmHtml = {};
  charms.forEach((c, i) => { const a = assets.charms && assets.charms[c.key]; charmHtml[c.key] = a && a.uri ? `<img src="${a.uri}" alt="">` : charmSvg(c, i); });

  const ringLayers = bracelets.map((b) => { const a = assets.bracelets && assets.bracelets[b.key]; return a && a.uri ? `<img class="v" data-metal="${esc(b.key)}" src="${a.uri}" alt="">` : ringSvg(b); }).join('');
  const headline = String(K.headline).split('\n').map((l, i, arr) => i === arr.length - 1 ? `<em>${esc(l)}</em>` : esc(l)).join('<br>');
  const payload = {
    brand: { name: B.name, url: B.url, deepLink: !!B.deepLink },
    clickTagDefault: B.url,
    copy: K, stage: S, maxCharms: data.maxCharms, timing: data.timing, tracking: data.tracking || { enabled: true },
    demoOrder: data.demoOrder || [],
    bracelets: bracelets.map((b) => ({ key: b.key, label: b.label, metal: b.metal, title: b.title, price: b.price, url: b.url, sku: b.sku })),
    charms: charms.map((c) => ({ key: c.key, short: c.short, title: c.title, price: c.price, url: c.url, sku: c.sku })),
    charmHtml,
  };
  const heroStyle = assets.hero && assets.hero.uri ? ` style="background-image:url(${assets.hero.uri});${assets.heroPos ? `--ph-pos:${assets.heroPos}` : ''}"` : '';

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=${SIZE.w},initial-scale=1">
<meta name="ad.size" content="width=${SIZE.w},height=${SIZE.h}">
<meta name="description" content="${esc(B.name)} Moments – ${esc(K.headline).replace(/\n/g, ' ')}">
<title>${esc(B.name)} Moments – ${SIZE.w}×${SIZE.h} masthead</title>
<script>var clickTag = "${esc(B.url)}";</script>
${fontHead}
<style>${css}</style>
</head>
<body>
<div id="ad" tabindex="0" role="link" aria-label="${esc(B.name)} Moments: ${esc(K.headline).replace(/\n/g, ' ')} – ${esc(K.cta)}" data-metal="${esc(bracelets[0].key)}" data-charms="0">
  <div class="media" aria-hidden="true"><div class="ph"${heroStyle}></div><div class="veil"></div><div class="glow"></div><div class="grain"></div></div>

  <div class="brand rise d1">${logoHtml(B.name, assets.logo)}${CP.enabled ? `<span class="sep"></span><span class="promo"><b>${esc(CP.badge)}</b><span>${esc(CP.line)}</span></span>` : ''}</div>

  <div class="copy">
    <div class="kicker rise d2">${esc(K.kicker)}</div>
    <h1 class="rise d3">${headline}</h1>
    <p class="rise d4">${esc(K.sub)}</p>
  </div>
  <button type="button" class="cta rise d5" tabindex="-1" aria-hidden="true"><span>${esc(K.cta)}</span>${ARROW}</button>
  <div class="legal" aria-hidden="true">${esc(K.legal)}</div>

  <div class="stage">
    <div class="ring" style="left:${S.left}px;top:${S.top}px;width:${S.size}px;height:${S.size}px;--cs:${S.charmSize}px" title="${esc(bracelets[0].title)}">${ringLayers}<div class="slots"></div></div>
  </div>
  <div class="caption" aria-live="polite"></div>
  <div class="fx" aria-hidden="true"></div>

  <div class="panel rise" role="group" aria-label="Bilekliğini tasarla">
    <div class="row">
      <span class="lbl">${esc(K.metalLabel)}</span>
      <div class="seg" role="radiogroup" aria-label="${esc(K.metalLabel)}">${bracelets.map((b, i) => `<button type="button" class="metal${i === 0 ? ' on' : ''}" data-metal="${esc(b.key)}" aria-pressed="${i === 0 ? 'true' : 'false'}" title="${esc(b.title)}" style="--sw:linear-gradient(135deg,${b.swatch.join(',')})"><i aria-hidden="true"></i>${esc(b.label)}</button>`).join('')}</div>
    </div>
    <div class="row"><span class="lbl">${esc(K.trayLabel)}</span></div>
    <div class="tray">${charms.slice(0, 6).map((c) => `<button type="button" class="cell" data-charm="${esc(c.key)}" aria-label="${esc(c.title)}${c.price ? ' – ' + c.price.toLocaleString('tr-TR') + ' TL' : ''}">${charmHtml[c.key]}<span class="plus" aria-hidden="true"></span><span class="nm" aria-hidden="true">${esc(c.short)}${c.price ? `<i>${c.price.toLocaleString('tr-TR')} TL</i>` : ''}</span></button>`).join('')}</div>
    <div class="bar">
      <div class="total"><small>${esc(K.total)}</small><b>–</b></div>
      <span class="count"></span>
      <button type="button" class="reset" title="${esc(K.reset)}" aria-label="${esc(K.reset)}">${RESET}</button>
      <button type="button" class="sound" title="${esc(K.sound)}" aria-label="${esc(K.sound)}" aria-pressed="false">${SOUND_OFF}${SOUND_ON}</button>
    </div>
  </div>
</div>
<script>${runtime.replace('__DATA__', JSON.stringify(payload))}</script>
</body>
</html>`;
}

module.exports = { render, SIZE };
