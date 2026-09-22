'use strict';
/**
 * Google Fonts (Manrope) dosyalarını bir kez indirip önbelleğe alır ve Playwright
 * bağlamına yerel olarak servis eder (yalıtılmış ortamlarda Chromium doğrudan erişemez).
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const cache = path.join(__dirname, '..', 'preview', '.fontcache');
const CSS_URL = 'https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&display=swap';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36';

function ensureFonts() {
  fs.mkdirSync(cache, { recursive: true });
  const cssFile = path.join(cache, 'fonts.css');
  try {
    if (!fs.existsSync(cssFile)) execSync(`curl -sS -m 30 -A "${UA}" -o "${cssFile}" "${CSS_URL}"`);
    const css = fs.readFileSync(cssFile, 'utf8');
    for (const m of css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)) {
      const f = path.join(cache, path.basename(m[1]));
      if (!fs.existsSync(f)) execSync(`curl -sS -m 30 -o "${f}" "${m[1]}"`);
    }
    return css;
  } catch (e) { return null; }
}

/** Playwright context'ine font yönlendirmesi ekler; font indirilemediyse istekleri iptal eder (sistem fontu). */
async function routeFonts(ctx) {
  const css = ensureFonts();
  await ctx.route('**/fonts.googleapis.com/**', (r) => (css ? r.fulfill({ contentType: 'text/css', body: css }) : r.abort()));
  await ctx.route('**/fonts.gstatic.com/**', (r) => {
    const f = path.join(cache, path.basename(new URL(r.request().url()).pathname));
    fs.existsSync(f) ? r.fulfill({ contentType: 'font/woff2', body: fs.readFileSync(f) }) : r.abort();
  });
  return !!css;
}

module.exports = { ensureFonts, routeFonts, cache };
