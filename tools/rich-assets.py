#!/usr/bin/env python3
"""Masthead / mobil interaktif çalışmalar için görselleri assets/media'dan hazırlar → assets/rich/.

Fotoğraflar odak noktasına göre kırpılır ve WebP'ye çevrilir; ürün ambalaj fotoğraflarının
açık fonu şeffaflaştırılıp kırpılır. Hiçbir çizim/vektör üretilmez, yalnızca orijinal görseller işlenir.
Kullanım: python3 tools/rich-assets.py
"""
import json, os
from PIL import Image, ImageChops, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..')
M = os.path.join(ROOT, 'assets', 'media')
OUT = os.path.join(ROOT, 'assets', 'rich')
os.makedirs(OUT, exist_ok=True)

# ad: (kaynak, çıktı genişlik, yükseklik, odak x, odak y, kalite)
PHOTOS = {
    # 970x250 akordeon panelleri (açık panel ~430x250, 1.5x)
    'mh-yetiskin': ('products/vitamin-b12-metilfolat/7.jpg', 660, 375, .42, .52, 70),
    'mh-bagisiklik': ('products/vitamin-c/8.jpg', 660, 375, .55, .55, 70),
    'mh-cocuk': ('site/cdn-shop-articles-okul-doneminde-cocuklarin-bagisiklik-sistemini-deste.jpg', 660, 375, .5, .5, 74),
    'mh-aktif': ('products/krill-yagi/8.webp', 660, 375, .5, .55, 70),
    'mh-doktor': ('site/abb.webp', 450, 375, .5, .38, 72),
    # 320x480 mobil kartlar: üst 320x340 fotoğraf alanı (1.5x); doktor kartı tam ekran
    'mb-yetiskin': ('products/vitamin-b12-metilfolat/7.jpg', 480, 510, .45, .5, 70),
    'mb-bagisiklik': ('products/vitamin-c/8.jpg', 480, 510, .5, .4, 70),
    'mb-cocuk': ('products/omega-3-surup/6.jpg', 480, 510, .5, .4, 70),
    'mb-aktif': ('products/krill-yagi/8.webp', 480, 510, .45, .45, 70),
    'mb-doktor': ('site/abb.webp', 480, 720, .5, .5, 70),
    # dikey akordeon şeritleri (320 genişlik, açık şerit ~260 yükseklik)
    'st-yetiskin': ('products/vitamin-b12-metilfolat/7.jpg', 480, 420, .45, .42, 66),
    'st-bagisiklik': ('products/vitamin-c/8.jpg', 480, 420, .5, .55, 66),
    'st-cocuk': ('products/omega-3-surup/6.jpg', 480, 420, .5, .55, 66),
    'st-aktif': ('products/krill-yagi/8.webp', 480, 420, .45, .55, 66),
    # sil-keşfet: üst katman (buğulu) ve alt katman
    'sc-ust': ('products/magnezyum/7.jpg', 480, 720, .5, .5, 62),
    'sc-alt': ('site/abb.webp', 480, 720, .5, .5, 70),
}

PACKS = {
    'omega3': 'products/omega-3-33-22-60-kapsul/2.png',
    'mvwomen': 'products/multivitamin-women/1.jpg',
    'b12': 'products/vitamin-b12-metilfolat/1.png',
    'vitc': 'products/vitamin-c/2.png',
    'cinko': 'products/cinko/1.png',
    'propolis': 'products/propolis-kapsul/1.png',
    'omega3surup': ('products/omega-3-surup/1.png', (.3, .7)),
    'd3': 'products/vitamin-d3-damla/1.png',
    'd3k2': 'products/d3-k2-vitamin-damlasi/1.png',
    'krill': 'products/krill-yagi/1.png',
    'magnezyum': 'products/magnezyum/1.png',
    'spirulina': 'products/spirulina/1.png',
}


def cover(im, w, h, fx, fy):
    sw, sh = im.size
    s = max(w / sw, h / sh)
    nw, nh = round(sw * s), round(sh * s)
    im = im.resize((nw, nh), Image.LANCZOS)
    x = min(max(round(fx * nw - w / 2), 0), nw - w)
    y = min(max(round(fy * nh - h / 2), 0), nh - h)
    return im.crop((x, y, x + w, y + h))


def packshot(src, height=240, xcrop=None):
    """Ambalaj fotoğrafını ürün sınırına kırpar ve açık gri fonu saf beyaza çeker (opak, beyaz kartta kullanılır)."""
    im = Image.open(src).convert('RGB')
    w, h = im.size
    if xcrop:
        im = im.crop((round(w * xcrop[0]), 0, round(w * xcrop[1]), h)); w, h = im.size
    edge = [im.getpixel((x, y)) for x in (2, w - 3) for y in range(0, h, 40)] + [im.getpixel((x, 2)) for x in range(0, w, 40)]
    bg = tuple(sorted(c[i] for c in edge)[len(edge) // 2] for i in range(3))
    diff = ImageChops.difference(im, Image.new('RGB', im.size, bg)).convert('L')
    box = diff.point(lambda v: 255 if v > 30 else 0).filter(ImageFilter.MedianFilter(5)).getbbox()
    pad = 14
    box = (max(box[0] - pad, 0), max(box[1] - pad, 0), min(box[2] + pad, w), min(box[3] + pad, h))
    im = im.crop(box)
    # seviye: fon rengi → 255
    im = Image.merge('RGB', [ch.point(lambda v, b=b: min(255, round(v * 255 / max(b, 1)))) for ch, b in zip(im.split(), bg)])
    s = height / im.size[1]
    return im.resize((round(im.size[0] * s), height), Image.LANCZOS)


meta = {'photos': {}, 'packs': {}}
for name, (src, w, h, fx, fy, q) in PHOTOS.items():
    im = cover(Image.open(os.path.join(M, src)).convert('RGB'), w, h, fx, fy)
    f = os.path.join(OUT, name + '.webp')
    im.save(f, 'WEBP', quality=q, method=6)
    meta['photos'][name] = {'src': src, 'w': w, 'h': h, 'bytes': os.path.getsize(f)}

for name, src in PACKS.items():
    src, xc = src if isinstance(src, tuple) else (src, None)
    im = packshot(os.path.join(M, src), xcrop=xc)
    f = os.path.join(OUT, 'p-' + name + '.webp')
    im.save(f, 'WEBP', quality=74, method=6)
    meta['packs'][name] = {'src': src, 'w': im.size[0], 'h': im.size[1], 'bytes': os.path.getsize(f)}

logo = Image.open(os.path.join(M, 'site', 'beyaz-logo.png')).convert('RGBA')
logo = logo.crop(logo.getbbox())
logo = logo.resize((480, round(480 * logo.size[1] / logo.size[0])), Image.LANCZOS)
logo.save(os.path.join(OUT, 'logo-beyaz.webp'), 'WEBP', quality=88, method=6)
logo2 = Image.open(os.path.join(M, 'site', 'ilacsizyasam-logo2-copy.png')).convert('RGBA')
logo2 = logo2.crop(logo2.getbbox())
logo2 = logo2.resize((600, round(600 * logo2.size[1] / logo2.size[0])), Image.LANCZOS)
logo2.save(os.path.join(OUT, 'logo-dr.webp'), 'WEBP', quality=86, method=6)
meta['logo'] = {'beyaz': logo.size, 'dr': logo2.size}

json.dump(meta, open(os.path.join(OUT, 'index.json'), 'w'), indent=1)
tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print('assets/rich →', len(os.listdir(OUT)), 'dosya,', round(tot / 1024), 'KB')
