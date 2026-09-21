#!/usr/bin/env sh
# Siteden alınan Avenir Next (assets/site/fonts) ve yedek Manrope fontlarını bannerda kullanılan Türkçe karakter setine indirger.
# Gerekli: pip install fonttools brotli
set -e
cd "$(dirname "$0")/../assets/fonts"
CH="U+0020-007E,U+00C7,U+00E7,U+00D6,U+00F6,U+00DC,U+00FC,U+0131,U+011E,U+011F,U+0130,U+015E,U+015F,U+00B7,U+2013,U+2014,U+2019,U+2022,U+00A0,U+2026"
for pair in regular:book medium:medium heavy:heavy; do
  src=${pair%%:*}; dst=${pair##*:}
  [ -f "../site/fonts/avenirnext${src}-normal-normal.woff2" ] && pyftsubset "../site/fonts/avenirnext${src}-normal-normal.woff2" --unicodes="$CH" --flavor=woff2 --layout-features='*' --output-file="avenir-${dst}.woff2"
done
# Yedek: Manrope (site fontu yoksa). Not: --no-hinting kullanılmaz; Chromium'da harf aralıkları bozuluyor.
[ -f Manrope-latin.woff2 ] && pyftsubset Manrope-latin.woff2 --unicodes="U+0020-007E,U+00C7,U+00E7,U+00D6,U+00F6,U+00DC,U+00FC,U+0131,U+00B7,U+2013,U+2014,U+2019,U+2022,U+00A0" --flavor=woff2 --layout-features='*' --output-file=Manrope-subset-latin.woff2
[ -f Manrope-latin-ext.woff2 ] && pyftsubset Manrope-latin-ext.woff2 --unicodes="U+011E,U+011F,U+0130,U+015E,U+015F" --flavor=woff2 --layout-features='*' --output-file=Manrope-subset-ext.woff2
ls -la *.woff2
