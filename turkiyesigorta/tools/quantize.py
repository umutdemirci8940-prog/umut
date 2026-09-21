#!/usr/bin/env python3
"""Saydam PNG'yi 256 renkli palete indirger (dosya boyutu ~1/3). Kullanım: quantize.py <png>"""
import sys
from PIL import Image
p = sys.argv[1]
im = Image.open(p).convert('RGBA')
before = len(open(p, 'rb').read())
q = im.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
q.save(p, optimize=True)
after = len(open(p, 'rb').read())
print(f'  quantize: {before/1024:.1f} KB → {after/1024:.1f} KB')
