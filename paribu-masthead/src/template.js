'use strict';
/**
 * Paribu 970×250 interaktif masthead – HTML birleştirici.
 * render(data, assets) → tek dosyalık, bağımsız HTML5 (satır içi CSS/JS; coin ikonları, logo ve font base64 gömülü).
 */
const fs = require('fs');
const path = require('path');

const SIZE = { w: 970, h: 250, label: 'Billboard / Masthead' };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ARROW = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 8h10M8.5 3.5 13 8l-4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const HAND = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 1.6 12.6 7.3l-3.9.9-1.6 3.7z"/><path d="M1 12.5h2.2M12.8 12.5H15M2.4 11l-1.4 1.5 1.4 1.5M13.6 11l1.4 1.5-1.4 1.5" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/></svg>';
const CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M5 8.2l2 2 4-4.4"/></svg>';
const DOWNLOAD = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2.5v7.5M4.8 7.2 8 10.4l3.2-3.2M3 12.5h10" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const GIFT = '<svg class="gift" viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9.5h17v4h-17zM5 13.5h14V21H5zM12 9.5V21M12 9.5c-3 0-5-1.2-5-3a2 2 0 0 1 3.6-1.2C11.6 6.4 12 9.5 12 9.5zm0 0c3 0 5-1.2 5-3a2 2 0 0 0-3.6-1.2C12.4 6.4 12 9.5 12 9.5z"/></svg>';

/** Gerçek logo yoksa: marka renginde sembol + Sora ile yazılmış "Paribu" kelime markası (yer tutucu). */
function fallbackLogo(name, colors) {
  return `<svg class="logo-fallback" viewBox="0 0 112 26" role="img" aria-label="${esc(name)}">
<rect width="26" height="26" rx="7.5" fill="${colors.brand}"/>
<path d="M8.6 6.2h6.1a4.9 4.9 0 0 1 0 9.8h-2.6v3.8H8.6z M12.1 9.3v3.7h2.4a1.85 1.85 0 0 0 0-3.7z" fill="#fff" fill-rule="evenodd"/>
<text x="33" y="19.6" font-family="Sora, system-ui, sans-serif" font-weight="800" font-size="20" letter-spacing="-0.6" fill="#fff">${esc(name)}</text>
</svg>`;
}

function fontCss(data, assets) {
  const F = data.fonts || {};
  if (F.embed && assets.fonts && assets.fonts.length) {
    return assets.fonts.map((f) => `@font-face{font-family:'${f.family}';font-style:${f.style || 'normal'};font-weight:${f.weight};font-display:block;src:url(${f.uri}) format('woff2');${f.unicodeRange ? `unicode-range:${f.unicodeRange}` : ''}}`).join('\n');
  }
  return null;
}

function render(data, assets = {}) {
  const B = data.brand, K = data.copy, CP = data.campaign || {}, colors = Object.assign({}, data.colors, assets.colors || {}); delete colors.source;
  const base = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
  const runtime = fs.readFileSync(path.join(__dirname, 'runtime.js'), 'utf8');
  const embedded = fontCss(data, assets);

  let css = base.replace(/:root\{[^}]*\}/, `:root{--bg:${colors.bg};--bg2:${colors.bg2};--brand:${colors.brand};--brand2:${colors.brand2};--brand-dark:${colors.brandDark};--ink:${colors.ink};--muted:${colors.muted};--cta-text:${colors.ctaText};--ease:cubic-bezier(.22,.8,.26,1)}`);
  css = css.split('rgba(20,210,110,').join(rgbaPrefix(colors.brand)).split('rgba(127,242,182,').join(rgbaPrefix(colors.brand2));
  if (embedded) css = embedded + '\n' + css;

  const fontLink = embedded ? '' : `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="${esc(data.fonts.googleCss)}" rel="stylesheet">`;

  // Logo
  let logoHtml;
  if (assets.logo && assets.logo.uri && assets.logo.kind !== 'symbol') logoHtml = `<img src="${assets.logo.uri}" alt="${esc(B.name)}"${assets.logo.aspect ? ` style="width:${Math.round(26 * assets.logo.aspect)}px"` : ''}>`;
  else if (assets.logo && assets.logo.uri) logoHtml = `<img src="${assets.logo.uri}" alt="" style="height:26px;width:26px;border-radius:7px"><span style="margin-left:8px;font-weight:800;font-size:20px;letter-spacing:-.03em">${esc(B.name)}</span>`;
  else logoHtml = fallbackLogo(B.name, colors);

  const coins = (data.coins || []).slice(0, 6).map((c) => ({ key: c.key, name: c.name, color: c.color, uri: assets.coins && assets.coins[c.key] }))
    .filter((c) => c.uri);
  const payload = {
    brand: { name: B.name, url: B.url, clickThroughEverywhere: !!B.clickThroughEverywhere },
    copy: { cta: K.cta, winCta: K.winCta, promptTouch: K.promptTouch, promptTap: K.promptTap, phoneTitle: K.phoneTitle, phoneEmpty: K.phoneEmpty, phoneWin: K.phoneWin, combo: K.combo },
    colors: { bg: colors.bg, bg2: colors.bg2, brand: colors.brand, brand2: colors.brand2, brandDark: colors.brandDark },
    coins, game: data.game, timing: data.timing, tracking: data.tracking || { enabled: true },
    symbol: assets.symbol && assets.symbol.uri ? assets.symbol.uri : null,
  };

  const trust = (K.trust || []).map((t) => `<span>${CHECK}${esc(t)}</span>`).join('');
  const feats = (K.features || []).map((f) => `<span>${esc(f)}</span>`).join('');
  const legal = esc(K.legal) + (CP.enabled && CP.footnote ? ' ' + esc(CP.footnote) : '');
  const delay = (s) => ` style="animation-delay:${s}s"`;

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="ad.size" content="width=${SIZE.w},height=${SIZE.h}">
<meta name="viewport" content="width=${SIZE.w},initial-scale=1">
<title>${esc(B.name)} – 970x250 interaktif masthead</title>
${fontLink}
<style>${css}</style>
</head>
<body>
<div id="ad" class="ad${CP.enabled ? '' : ' no-campaign'}" data-mode="boot" data-score="0" role="group" tabindex="0" aria-label="${esc(K.ariaLabel || B.name)}">
  <canvas id="cv" width="${SIZE.w}" height="${SIZE.h}" aria-hidden="true"></canvas>
  <a class="brand exit in" href="${esc(B.url)}" target="_blank" rel="noopener" aria-label="${esc(B.name)} – ${esc(K.tagline)}" onclick="return false"${delay(0.15)}>${logoHtml}</a>
  <div class="head exit">
    <h1 class="h-main"><span class="l1"><i class="in"${delay(0.45)}>${esc(K.headline[0])}</i></span><span class="l2"><i class="in"${delay(0.6)}>${esc(K.headline[1])}</i></span></h1>
    <h1 class="h-win" aria-hidden="true"><span class="l1"><i>${esc(K.winHeadline[0])}</i></span><span class="l2"><i>${esc(K.winHeadline[1])}</i></span></h1>
  </div>
  <p class="sub exit in"${delay(1.25)}>${esc(K.sub)}</p>
  <div class="cta-wrap in"${delay(1.65)}><button type="button" class="cta exit" aria-label="${esc(K.cta)} – ${esc(B.domain)}"><b>${esc(K.cta)}</b>${ARROW}</button></div>
  ${K.cta2 ? `<div class="cta2-wrap in" id="cta2wrap"${delay(1.85)}><button type="button" class="cta2 exit" aria-label="${esc(K.cta2)} – ${esc(B.domain)}">${DOWNLOAD}${esc(K.cta2)}</button></div>` : ''}
  <div class="hint"><div class="prompt in"${delay(2.7)} aria-live="polite">${HAND}<span>${esc(K.prompt)}</span></div></div>
  <button type="button" class="replay">${esc(K.replay)}</button>
  ${CP.enabled ? `<div class="badge exit" role="button" tabindex="0" aria-label="${esc(CP.kicker)} ${esc(CP.value)} ${esc(CP.suffix)}">${GIFT}<span class="k">${esc(CP.kicker)}</span><span class="v">${esc(CP.value)}</span><span class="s">${esc(CP.suffix)}</span></div>` : ''}
  <div class="feats in"${delay(2.25)}>${feats}</div>
  <div class="trust in"${delay(2.4)}>${trust}</div>
  <div class="legal in"${delay(2.5)}>${legal}</div>
</div>
<script>(function(){var w=document.querySelector('.cta-wrap'),a=document.querySelector('.cta'),b=document.getElementById('cta2wrap');if(w&&a&&b){b.style.left=(w.offsetLeft+a.offsetWidth+8)+'px'}})();</script>
<script>${runtime.split('__DATA__').join(JSON.stringify(payload))}</script>
</body>
</html>`;
}

function rgbaPrefix(hex) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},`; }

module.exports = { render, SIZE };
