#!/usr/bin/env python3
"""Orijinal Dyson ürün fotoğraflarından (şeffaf PNG) masthead parçalarını keser.
Bağlantılı bileşen analiziyle ana ürünü, başlıkları ayırır; fotoğraftaki hazır toz/aksesuarları temizler.
Çıktı: assets/cut/*.webp + assets/cut/meta.json (ürün içi referans noktaları, piksel)
Kullanım: python3 tools/cut-products.py"""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'assets', 'products')
OUT = os.path.join(ROOT, 'assets', 'cut'); os.makedirs(OUT, exist_ok=True)

def components(im, thr=12, close=3):
    a = np.array(im)[:, :, 3] > thr
    a2 = ndimage.binary_closing(a, iterations=close) if close > 0 else a
    lab, n = ndimage.label(a2)
    objs = ndimage.find_objects(lab)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    return lab, [(i + 1, objs[i], int(sizes[i])) for i in range(n)]

def save(im, name, h=None, q=86):
    if h and im.height > h: im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    p = os.path.join(OUT, name); im.save(p, 'WEBP', quality=q, method=6)
    return {'file': f'assets/cut/{name}', 'w': im.width, 'h': im.height, 'bytes': os.path.getsize(p)}

def isolate(im, lab, ids, sl, pad=6):
    arr = np.array(im).copy()
    keep = np.isin(lab, ids)
    arr[:, :, 3] = np.where(keep, arr[:, :, 3], 0)
    y0, y1 = max(0, sl[0].start - pad), min(im.height, sl[0].stop + pad)
    x0, x1 = max(0, sl[1].start - pad), min(im.width, sl[1].stop + pad)
    return Image.fromarray(arr).crop((x0, y0, x1, y1)), (x0, y0)

meta = {}
# ── Supersonic Nural: en soldaki büyük bileşen kurutma makinesi, sağdakiler başlıklar
im = Image.open(os.path.join(SRC, '492345-01.png')).convert('RGBA')
lab, comps = components(im)
big = sorted([c for c in comps if c[2] > 3000], key=lambda c: c[1][1].start)
dryer = big[0]
cut, (ox, oy) = isolate(im, lab, [dryer[0]], dryer[1])
H = 560
s = H / cut.height
meta['dryer'] = save(cut, 'nural.webp', H)
# referans noktaları (kesilmiş görsele göre 0..1): halka merkezi ve yarıçapı
a = np.array(cut)[:, :, 3] > 12
rows = np.where(a.any(1))[0]; cols_top = np.where(a[: cut.width].any(0))[0]
head_w = cut.width  # başlık (halka) sapın en geniş kısmı
meta['dryer']['ring'] = {'cx': 0.5, 'cy': (head_w / 2) / cut.height, 'r': (head_w / 2) / cut.height}
atts = []
names = ['diffuser', 'comb', 'concentrator', 'gentle', 'flyaway', 'case']
rest = sorted(big[1:], key=lambda c: (round(c[1][0].start / 150), c[1][1].start))
for c in rest:
    ac, _ = isolate(im, lab, [c[0]], c[1])
    atts.append((c, ac))
labels = {}
for i, (c, ac) in enumerate(atts):
    key = names[i] if i < len(names) else f'part{i}'
    if key == 'case': continue
    labels[key] = save(ac, f'att-{key}.webp', 120, 84)
meta['attachments'] = labels

# ── V12 Detect Slim: en büyük bileşen = süpürge (toz, aletler, yan başlık atılır)
im = Image.open(os.path.join(SRC, '494876-01.png')).convert('RGBA')
lab, comps = components(im, thr=40, close=0)
main = max(comps, key=lambda c: c[2])
# ana gövdeye yakın büyük parçalar (ince boru kopmaları) da alınır; toz kırıntıları (küçük) atılır
ms = main[1]
near = ndimage.binary_dilation(lab == main[0], iterations=8)
keep = [c for c in comps if c[0] == main[0] or (c[2] > 300 and near[lab == c[0]].any())]
ids = [c[0] for c in keep]
y0 = min(c[1][0].start for c in keep); y1 = max(c[1][0].stop for c in keep)
x0 = min(c[1][1].start for c in keep); x1 = max(c[1][1].stop for c in keep)
cut, (ox, oy) = isolate(im, lab, ids, (slice(y0, y1), slice(x0, x1)))
# lazerin yeşil tozu başlığa yapışık olabilir: yeşil baskın, yarı saydam pikselleri temizle
arr = np.array(cut).astype(int)
g = (arr[:, :, 1] > arr[:, :, 0] + 40) & (arr[:, :, 1] > arr[:, :, 2] + 20)
yy = np.arange(cut.height)[:, None] > cut.height * 0.8
arr[:, :, 3] = np.where(g & yy, 0, arr[:, :, 3])
# alt bölgedeki ince toz kırıntılarını morfolojik açma ile sil (başlık gövdesi kalır)
m = arr[:, :, 3] > 8
op = ndimage.binary_opening(m, iterations=4)
op = ndimage.binary_dilation(op, iterations=2) & m
zone = np.arange(cut.height)[:, None] > cut.height * 0.82
arr[:, :, 3] = np.where(zone & ~op, 0, arr[:, :, 3])
cut = Image.fromarray(arr.astype('uint8'))
bb = cut.getbbox(); cut = cut.crop(bb)
H = 760
meta['vacuum'] = save(cut, 'v12.webp', H)
# başlık temas noktası: alt satırlarda opak piksellerin ortası
a = np.array(cut)[:, :, 3] > 40
ys = np.where(a.any(1))[0]; bottom = ys[-1]
band = a[int(bottom - cut.height * 0.06): bottom + 1]
xs = np.where(band.any(0))[0]
meta['vacuum']['head'] = {'x': float((xs[0] + xs[-1]) / 2 / cut.width), 'y': float(bottom / cut.height), 'left': float(xs[0] / cut.width), 'right': float(xs[-1] / cut.width)}
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), indent=2)
print(json.dumps(meta, indent=1))
