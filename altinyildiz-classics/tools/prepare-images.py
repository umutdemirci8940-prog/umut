#!/usr/bin/env python3
"""assets/raw/ içindeki site görsellerinden banner görsellerini üretir (kırpma + WebP).
Sahneler: sitedeki kampanya fotoğraflarının yazısız bölgelerinden kırpılır (600x375, panel 400x250 için 1.5x).
Ürünler: sitedeki stüdyo ürün fotoğrafları (240x360, kart 92x138 + büyüteç için).
Kullanım: python3 tools/prepare-images.py
"""
import glob, json, os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
RAW = os.path.join(ROOT, 'assets', 'raw', 'img')
OUT = os.path.join(ROOT, 'assets', 'banner')
os.makedirs(OUT, exist_ok=True)
cfg = json.load(open(os.path.join(ROOT, 'src', 'images.json')))
src = lambda n: glob.glob(os.path.join(RAW, n + '-*'))[0]

for key, s in cfg['scenes'].items():
    im = Image.open(src(s['raw'])).convert('RGB').crop(tuple(s['crop'])).resize((600, 375), Image.LANCZOS)
    im.save(os.path.join(OUT, f'scene-{key}.webp'), 'WEBP', quality=68, method=6)
for key, p in cfg['products'].items():
    im = Image.open(src(p['raw'])).convert('RGB').resize((240, 360), Image.LANCZOS)
    im.save(os.path.join(OUT, f'{key}.webp'), 'WEBP', quality=70, method=6)
logo = os.path.join(ROOT, 'assets', 'raw', 'logo@4x.png')
if os.path.exists(logo):
    im = Image.open(logo).convert('RGBA')
    bbox = im.getchannel('A').getbbox()
    if bbox: im = im.crop(bbox)
    h = 40  # 2x, bannerda 20px yükseklik
    im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    im.save(os.path.join(OUT, 'logo.png'), optimize=True)
for f in sorted(os.listdir(OUT)):
    print(f'{f:28} {os.path.getsize(os.path.join(OUT, f)) / 1024:6.1f} KB')
