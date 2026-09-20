#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Beyaz fonlu ürün fotoğraflarını şeffaflaştırır (kenardan taşma dolgusu: paket üstündeki beyaz yazılar korunur),
kırpar ve verilen yüksekliğe ölçekler → assets/packs/<ad>.webp (alfa kanallı) + manifest.json
Kullanım: python3 tools/cutout.py  [--height 480] [--tol 22]
"""
import os, sys, json, glob
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets', 'products'); OUT = os.path.join(ROOT, 'assets', 'packs'); os.makedirs(OUT, exist_ok=True)
args = sys.argv[1:]
HEIGHT = int(args[args.index('--height') + 1]) if '--height' in args else 480
TOL = int(args[args.index('--tol') + 1]) if '--tol' in args else 22

def dilate(m):
    p = np.pad(m, 1)
    out = m.copy()
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            out |= p[1 + dy:1 + dy + m.shape[0], 1 + dx:1 + dx + m.shape[1]]
    return out

def cutout(path, name):
    im = Image.open(path).convert('RGB'); a = np.asarray(im).astype(np.int16)
    dist = (255 - a).max(-1)                       # beyaza uzaklık (kanal maks.)
    near = dist <= TOL
    bg = np.zeros_like(near); bg[0, :] = near[0, :]; bg[-1, :] = near[-1, :]; bg[:, 0] = near[:, 0]; bg[:, -1] = near[:, -1]
    while True:
        nb = dilate(bg) & near
        if nb.sum() == bg.sum(): break
        bg = nb
    # yumuşak kenar: arka plana komşu piksellerde beyaza uzaklığa göre alfa
    bg1 = dilate(bg)                      # 1 px erozyon: beyaz halkayı at
    edge = dilate(bg1) & ~bg1
    alpha = np.where(bg1, 0.0, 1.0)
    alpha[edge] = np.clip(dist[edge] / (TOL * 3.0), 0, 1) * 0.85
    ys, xs = np.where(alpha > 0.02)
    if len(ys) == 0: print('  boş:', name); return None
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    m = 6
    y0, x0 = max(0, y0 - m), max(0, x0 - m); y1, x1 = min(a.shape[0], y1 + m), min(a.shape[1], x1 + m)
    rgb = np.asarray(im).astype(np.float32)[y0:y1, x0:x1] / 255; al = alpha[y0:y1, x0:x1]
    # kenar piksellerinde beyaz karışımını çıkar (un-matte)
    al3 = np.maximum(al[..., None], 1e-3)
    rgb = np.clip((rgb - (1 - al3)) / al3, 0, 1) * (al[..., None] > 0) + rgb * (al[..., None] == 0)
    out = Image.fromarray((np.dstack([rgb, al]) * 255 + .5).astype(np.uint8), 'RGBA')
    scale = HEIGHT / out.height
    out = out.resize((max(1, round(out.width * scale)), HEIGHT), Image.LANCZOS)
    p = os.path.join(OUT, name + '.webp'); out.save(p, quality=90, method=6)
    kb = os.path.getsize(p) / 1024
    print(f'  {name:26s} {out.width:4d}x{out.height:<4d} {kb:6.1f} KB  (kaynak {im.width}x{im.height}, fon %{100*bg.mean():.0f})')
    return {'file': 'assets/packs/' + name + '.webp', 'w': out.width, 'h': out.height, 'kb': round(kb, 1), 'source': os.path.relpath(path, ROOT)}

if __name__ == '__main__':
    man = {}
    meta = json.load(open(os.path.join(SRC, 'products.json'), encoding='utf-8')) if os.path.exists(os.path.join(SRC, 'products.json')) else {'products': []}
    files = sorted(glob.glob(os.path.join(SRC, '*.webp')) + glob.glob(os.path.join(SRC, '*.png')) + glob.glob(os.path.join(SRC, '*.jpg')))
    for f in files:
        name = os.path.splitext(os.path.basename(f))[0]
        im = Image.open(f).convert('RGB'); arr = np.asarray(im)
        # yalnızca beyaz fonlu paket çekimleri (köşeler beyaz); yaşam tarzı fotoğrafları atlanır
        corners = [arr[2, 2], arr[2, -3], arr[-3, 2], arr[-3, -3]]
        if not all((255 - c.astype(int)).max() <= TOL for c in corners):
            print('  fon beyaz değil (yaşam tarzı fotoğrafı):', name)
            if name.startswith('barista-origins-colombia'):   # mutfakta makine + paket: 2. sahne fotoğrafı
                ph = im.resize((1200, round(im.height * 1200 / im.width)), Image.LANCZOS)
                ph.save(os.path.join(OUT, 'photo.jpg'), quality=82, optimize=True, progressive=True)
                print('  → assets/packs/photo.jpg', ph.size)
            continue
        r = cutout(f, name)
        if r: man[name] = r
    json.dump(man, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('Toplam:', len(man), 'paket')
