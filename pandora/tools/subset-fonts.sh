#!/usr/bin/env bash
# Google Fonts değişken fontu (varsayılan Montserrat; Gotham yerine) → yalnız Latin + Türkçe karakterler; base64 @font-face CSS üretir.
# Kullanım: bash tools/subset-fonts.sh [Montserrat|Inter]   Gerekli: pip install fonttools brotli
# Çıktı: assets/fonts/<family>-subset.css (build.js gömer)
set -euo pipefail
cd "$(dirname "$0")/../assets/fonts"
FAM="${1:-Montserrat}"; LC=$(echo "$FAM" | tr "[:upper:]" "[:lower:]")
[ -f "$LC.css" ] || curl -sS -A "Mozilla/5.0" -o "$LC.css" "https://fonts.googleapis.com/css2?family=$FAM:wght@400;500;600;700;800&display=swap"
for u in $(grep -oE "https://fonts.gstatic.com[^)]+" "$LC.css" | sort -u); do f=$(basename "$u"); [ -f "$f" ] || curl -sS -o "$f" "$u"; done
LATIN=$(grep -A8 "/\* latin \*/" "$LC.css" | grep -oE 'https://fonts.gstatic.com[^)]+' | head -1 | xargs basename)
LATEXT=$(grep -A8 "/\* latin-ext \*/" "$LC.css" | grep -oE 'https://fonts.gstatic.com[^)]+' | head -1 | xargs basename)
echo "latin: $LATIN  latin-ext: $LATEXT"
# Türkçe için gereken glifler: temel Latin + ÇĞİÖŞÜçğıöşü + tipografik işaretler + â/î/û
UNI='U+0020-007E,U+00A0-00FF,U+011E,U+011F,U+0130,U+0131,U+015E,U+015F,U+0152,U+0153,U+02C6,U+02DC,U+2013,U+2014,U+2018,U+2019,U+201C,U+201D,U+2022,U+2026,U+20BA,U+2122,U+2192'
pyftsubset "$LATIN" --unicodes="$UNI" --layout-features='kern,liga,calt,tnum' --flavor=woff2 --output-file="$LC-lat.woff2" --no-hinting --desubroutinize 2>/dev/null || pyftsubset "$LATIN" --unicodes="$UNI" --flavor=woff2 --output-file="$LC-lat.woff2"
pyftsubset "$LATEXT" --unicodes="$UNI" --layout-features='kern,liga,calt,tnum' --flavor=woff2 --output-file="$LC-ext.woff2" --no-hinting --desubroutinize 2>/dev/null || pyftsubset "$LATEXT" --unicodes="$UNI" --flavor=woff2 --output-file="$LC-ext.woff2"
ls -la "$LC-lat.woff2" "$LC-ext.woff2"
B64L=$(base64 -w0 "$LC-lat.woff2"); B64E=$(base64 -w0 "$LC-ext.woff2")
{
  echo "@font-face{font-family:'$FAM';font-style:normal;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,$B64L) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}"
  echo "@font-face{font-family:'$FAM';font-style:normal;font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,$B64E) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}"
} > "$LC-subset.css"
echo "$LC-subset.css: $(wc -c < "$LC-subset.css") bayt"
