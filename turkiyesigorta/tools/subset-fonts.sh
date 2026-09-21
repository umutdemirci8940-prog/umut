#!/usr/bin/env sh
# Manrope değişken fontunu bannerda kullanılan Türkçe karakter setine indirger.
# Gerekli: pip install fonttools brotli
set -e
cd "$(dirname "$0")/../assets/fonts"
LATIN="U+0020-007E,U+00C7,U+00E7,U+00D6,U+00F6,U+00DC,U+00FC,U+0131,U+00B7,U+2013,U+2014,U+2019,U+2022,U+00A0"
EXT="U+011E,U+011F,U+0130,U+015E,U+015F"
# Not: --no-hinting kullanılmaz; Chromium'da bazı harf aralıkları bozuluyor.
pyftsubset Manrope-latin.woff2     --unicodes="$LATIN" --flavor=woff2 --layout-features='*' --output-file=Manrope-subset-latin.woff2
pyftsubset Manrope-latin-ext.woff2 --unicodes="$EXT"   --flavor=woff2 --layout-features='*' --output-file=Manrope-subset-ext.woff2
ls -la Manrope-subset-*.woff2
