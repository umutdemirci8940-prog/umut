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
    # Merceği gezdir: an (ön, panel 180x250 @1.5x) ve mercekte görünen ürün sahnesi (arka, tam kare)
    'l-gri': ('site/cdn-shop-articles-image-3840-6-7fc11111-0087-47f3-a6b0-713e6b27aa24.webp', 270, 375, .5, .5, 72),
    'l-gri-b': ('products/d3-k2-vitamin-damlasi/6.jpg', 300, 300, .5, .5, 74),
    'l-enerji': ('products/vitamin-b12-metilfolat/7.jpg', 270, 375, .5, .55, 72),
    'l-enerji-b': ('products/vitamin-b12-metilfolat/6.jpg', 300, 300, .5, .5, 74),
    'l-cocuk': ('products/gelisim-paketi/1.webp', 270, 375, .5, .5, 72, (.72, .27, 1.0, .64)),
    'l-cocuk-b': ('products/omega-3-surup/7.jpg', 300, 300, .5, .5, 74),
    'l-aktif': ('products/krill-yagi/8.webp', 270, 375, .42, .5, 72),
    'l-aktif-b': ('products/krill-yagi/7.jpg', 300, 300, .5, .5, 74),
    # Dr. Ümit Aktaş'ın ofisi: gezinilebilir fotoğraf
    'o-ofis': ('site/abb.webp', 1152, 864, .5, .5, 64),
    'b-ilacsiz': ('products/ilacsiz-yasam/1.webp', 240, 300, .5, .5, 72),
    'b-mutluluk': ('products/mutluluk-kurleri/1.webp', 240, 300, .5, .5, 72),
    'b-bitkisel': ('products/bitkisel-kurlerle-ilacsiz-tedavi/1.webp', 240, 300, .5, .5, 72),
    # Rutin eşleştir: kart yüzleri ve sırtı
    'm-enerji': ('products/vitamin-b12-metilfolat/7.jpg', 240, 320, .45, .5, 70),
    'm-aktif': ('products/krill-yagi/8.webp', 240, 320, .45, .5, 70),
    'm-cocuk': ('products/omega-3-surup/6.jpg', 240, 320, .5, .5, 70),
    'm-sirt': ('products/magnezyum/7.jpg', 240, 320, .35, .7, 66),
    # Gölgen ne diyor?: ışığı canlı değişen sahne ve soru fotoğrafları
    'g-sahne': ('products/d3-k2-vitamin-damlasi/6.jpg', 600, 375, .5, .42, 74),
    'g-sahne-m': ('products/d3-k2-vitamin-damlasi/6.jpg', 480, 360, .5, .42, 72),
    'q-masa': ('site/cdn-shop-articles-image-3840-5-54a8e510-1b73-42d1-a512-eb705646c559.webp', 420, 250, .35, .4, 70),
    'q-hareket': ('products/krill-yagi/8.webp', 420, 250, .45, .45, 70),
    'q-aile': ('site/cdn-shop-articles-okul-doneminde-cocuklarin-bagisiklik-sistemini-deste.jpg', 420, 250, .5, .5, 72),
    'q-ben': ('products/vitamin-b12-metilfolat/7.jpg', 420, 250, .45, .5, 70),
    'q-enerji': ('site/cdn-shop-articles-image-3840-6-7fc11111-0087-47f3-a6b0-713e6b27aa24.webp', 420, 250, .5, .55, 72),
    'q-huzur': ('products/safran-ekstresi/8.jpg', 420, 250, .5, .5, 70),
    # Rutin Eşleş (tanışma uygulaması): profil fotoğrafları
    'dt-magnezyum': ('products/magnezyum/7.jpg', 450, 600, .4, .6, 70),
    'dt-d3k2': ('products/d3-k2-vitamin-damlasi/6.jpg', 450, 600, .5, .5, 70),
    'dt-b12': ('products/vitamin-b12-metilfolat/6.jpg', 450, 600, .4, .55, 70),
    'dt-omega3': ('products/omega-3-33-22-60-kapsul/8.jpg', 450, 600, .5, .5, 70),
    'dt-krill': ('products/krill-yagi/8.webp', 450, 600, .45, .5, 70),
    'dt-vitc': ('products/vitamin-c/8.jpg', 450, 600, .5, .5, 70),
    'dt-cinko': ('products/cinko/7.jpg', 450, 600, .5, .5, 70),
    # Bulutları Dağıt: oyun sahnesi; Kazı Kazan: bal peteği kaplama
    'gm-sahne': ('products/d3-k2-vitamin-damlasi/6.jpg', 480, 720, .5, .5, 70),
    'kk-kaplama': ('products/propolis-kapsul/7.jpg', 600, 420, .5, .5, 70, (.58, .7, 1.0, 1.0)),
}

# Oyun balonları: (kaynak, merkez x, merkez y, yarıçap — hepsi genişliğe oranla)
SPRITES = {
    'bulut1': ('site/cdn-shop-articles-image-3840-6-7fc11111-0087-47f3-a6b0-713e6b27aa24.webp', .25, .3, .14),
    'bulut2': ('site/cdn-shop-articles-image-3840-6-7fc11111-0087-47f3-a6b0-713e6b27aa24.webp', .75, .25, .14),
    'bulut3': ('site/cdn-shop-articles-image-3840-6-7fc11111-0087-47f3-a6b0-713e6b27aa24.webp', .45, .32, .12),
    'portakal': ('site/cdn-shop-articles-demir-takviyesi-kullanirken-emilimi-etkileyen-besinl.jpg', .105, .56, .09),
    'domates': ('site/cdn-shop-articles-demir-takviyesi-kullanirken-emilimi-etkileyen-besinl.jpg', .885, .7, .1),
    'brokoli': ('products/cinko/7.jpg', .88, .37, .1),
    'avokado': ('products/cinko/7.jpg', .23, .47, .11),
    'somon': ('products/cinko/7.jpg', .82, .57, .09),
    'bal': ('products/propolis-kapsul/7.jpg', .86, .86, .1),
    'zeytin': ('products/d3-k2-vitamin-damlasi/6.jpg', .1, .59, .08),
}

# Kasım Takvimi: gün → (kaynak, odak x, odak y[, önce seçilecek bölge])
TAKVIM = {
    1: ('site/abb.webp', .5, .35), 2: ('products/vitamin-b12-metilfolat/7.jpg', .45, .5), 3: ('products/kis-cayi/5.webp', .5, .55),
    4: ('products/d3-k2-vitamin-damlasi/6.jpg', .5, .5), 5: ('site/cdn-shop-articles-okul-doneminde-cocuklarin-bagisiklik-sistemini-deste.jpg', .5, .5),
    6: ('products/matcha/7.jpg', .5, .45), 7: ('products/krill-yagi/8.webp', .45, .5), 8: ('products/ilacsiz-yasam/1.webp', .55, .5),
    9: ('products/omega-3-33-22-60-kapsul/8.jpg', .5, .5), 10: ('products/matcha/1.jpg', .5, .5), 11: ('products/huzur-ritueli-paketi/1.jpg', .5, .62),
    12: ('products/zencefil-ekstrakti-zingiber-officinale/7.jpg', .5, .55), 13: ('products/vitamin-c/8.jpg', .5, .5), 14: ('products/spirulina/7.jpg', .5, .5),
    15: ('products/reishi-mantari-ekstrakti-ganoderma-lucidum-60-kapsul/7.jpg', .5, .55), 16: ('products/cinko/7.jpg', .5, .5),
    17: ('products/omega-3-surup/6.jpg', .5, .5), 18: ('products/safran-ekstresi/8.jpg', .5, .5), 19: ('products/cicek-ihlamur/2.webp', .5, .55),
    20: ('site/cdn-shop-articles-demir-takviyesi-kullanirken-emilimi-etkileyen-besinl.jpg', .5, .5), 21: ('products/mutluluk-kurleri/1.webp', .5, .5),
    22: ('products/erken-hasat-sizma-zeytinyagi-500-ml-yarim-litre/3.jpg', .5, .5), 23: ('products/uyku-oncesi-cayi/5.webp', .5, .5),
    24: ('products/propolis-kapsul/7.jpg', .5, .5), 25: ('products/gelisim-paketi/1.webp', .5, .62), 26: ('site/cdn-shop-articles-antioksidan-iceren-besin-ve-icecekler-nelerdir.jpg', .5, .5),
    27: ('products/erken-hasat-sizma-zeytinyagi-500-ml-yarim-litre/4.jpg', .5, .5), 28: ('products/magnezyum/7.jpg', .4, .6),
    29: ('site/ilacsizyasam-14-06-2025-1436.jpg', .5, .5), 30: ('site/dr-umit-aktas-satis-sitesi.jpg', .2, .5, (0, 0, .46, 1)),
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
    'safran': 'products/safran-ekstresi/2.png',
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
for name, (src, w, h, fx, fy, q, *box) in PHOTOS.items():
    im = Image.open(os.path.join(M, src)).convert('RGB')
    if box:  # önce kaynak üzerinde bölge (oran) seç, sonra kırp
        bw, bh = im.size; b = box[0]
        im = im.crop((round(b[0] * bw), round(b[1] * bh), round(b[2] * bw), round(b[3] * bh)))
    im = cover(im, w, h, fx, fy)
    f = os.path.join(OUT, name + '.webp')
    im.save(f, 'WEBP', quality=q, method=6)
    meta['photos'][name] = {'src': src, 'w': w, 'h': h, 'bytes': os.path.getsize(f)}

for day, (src, fx, fy, *box) in TAKVIM.items():
    base = Image.open(os.path.join(M, src)).convert('RGB')
    if box:
        bw, bh = base.size; b = box[0]
        base = base.crop((round(b[0] * bw), round(b[1] * bh), round(b[2] * bw), round(b[3] * bh)))
    for suffix, (w, h, q) in {'': (560, 450, 64), '-s': (200, 240, 60)}.items():
        f = os.path.join(OUT, 'tk-%02d%s.webp' % (day, suffix))
        cover(base, w, h, fx, fy).save(f, 'WEBP', quality=q, method=6)
        meta['photos']['tk-%02d%s' % (day, suffix)] = {'src': src, 'w': w, 'h': h, 'bytes': os.path.getsize(f)}

for name, (src, cx, cy, r) in SPRITES.items():
    im = Image.open(os.path.join(M, src)).convert('RGB')
    w, h = im.size; R = r * w
    im = im.crop((round(cx * w - R), round(cy * h - R), round(cx * w + R), round(cy * h + R))).resize((160, 160), Image.LANCZOS)
    f = os.path.join(OUT, 's-' + name + '.webp')
    im.save(f, 'WEBP', quality=72, method=6)
    meta['photos']['s-' + name] = {'src': src, 'w': 160, 'h': 160, 'bytes': os.path.getsize(f)}

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
logo3 = Image.open(os.path.join(M, 'site', 'lacivert-logo-large.png')).convert('RGBA')
logo3 = logo3.crop(logo3.getbbox())
logo3 = logo3.resize((360, round(360 * logo3.size[1] / logo3.size[0])), Image.LANCZOS)
logo3.save(os.path.join(OUT, 'logo-lacivert.webp'), 'WEBP', quality=88, method=6)
meta['logo'] = {'beyaz': logo.size, 'dr': logo2.size}

json.dump(meta, open(os.path.join(OUT, 'index.json'), 'w'), indent=1)
tot = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print('assets/rich →', len(os.listdir(OUT)), 'dosya,', round(tot / 1024), 'KB')
