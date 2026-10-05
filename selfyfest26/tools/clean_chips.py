#!/usr/bin/env python3
"""Afişteki (fest26.webp) orijinal şehir etiketlerini siler ve sanatçı fotoğraflarını kırpar.

Etiketler sanatçıların ARKASINDA olduğundan dikdörtgen silme yüzlere taşar; bu yüzden
yalnızca etiket pikselleri (mor/mavi zemin, lila çerçeve, beyaz yazı) etiketin hemen üstündeki
arka plan dokusuyla değiştirilir. Saç/ten/kıyafet pikselleri korunur.
Kullanım: python3 selfyfest26/tools/clean_chips.py
"""
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'source' / 'img' / '030-fest26.webp'
OUT = ROOT / 'assets' / 'artists'

# (x0, y0, x1, y1, kişinin başladığı x) – afiş koordinatları
CHIPS = [
    (41, 179, 128, 209, 128),   # RİZE
    (252, 179, 340, 209, 329),  # SAMSUN
    (461, 179, 548, 209, 534),  # İZMİR
    (40, 514, 120, 544, 112),   # ISPARTA
    (252, 513, 340, 543, 331),  # ANKARA
    (462, 513, 550, 543, 538),  # İSTANBUL
]
# (anahtar, x, y) – 180x130 kırpımlar; alt sıra kafalar kesilmesin diye daha yukarıdan
CROPS = [('murat', 42, 170), ('simge', 255, 170), ('mert', 462, 170),
         ('fatma', 42, 482), ('kofn', 255, 482), ('edis', 462, 482)]


def is_chip(r, g, b):
    if b > 70 and b > r + 18 and b > g + 30:      # mor/mavi zemin ve lila çerçeve
        return True
    if r > 200 and g > 200 and b > 220 and b >= r:  # beyaz yazı (hafif mavimsi)
        return True
    return False


img = Image.open(SRC).convert('RGB')
px = img.load()
mask = Image.new('L', img.size, 0)
mp = mask.load()
for x0, y0, x1, y1, person in CHIPS:
    h = y1 - y0
    for y in range(y0, y1):
        for x in range(x0, x1):
            r, g, b = px[x, y]
            if x < person - 2 or is_chip(r, g, b):
                mp[x, y] = 255
# küçük boşlukları kapat (yazı kenarları vs.), sonra yumuşat
mask = mask.filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.MinFilter(3))
fill = img.copy()
for x0, y0, x1, y1, _ in CHIPS:
    h = y1 - y0
    patch = img.crop((x0, y0 - h - 2, x1, y1 - h - 2)).filter(ImageFilter.GaussianBlur(1.2))
    fill.paste(patch, (x0, y0))
clean = Image.composite(fill, img, mask.filter(ImageFilter.GaussianBlur(0.8)))
clean.save(ROOT.parent / 'selfyfest26' / 'source' / 'fest26-clean.png')
OUT.mkdir(parents=True, exist_ok=True)
for key, x, y in CROPS:
    clean.crop((x, y, x + 180, y + 130)).save(OUT / f'{key}.webp', quality=80, method=6)
print('ok')
