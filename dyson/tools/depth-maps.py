#!/usr/bin/env python3
"""Orijinal ürün fotoğraflarından 3D 'şişirme' için doku + derinlik haritası üretir.
- Doku: ana ürün, yüksek çözünürlük (WebP, şeffaf)
- Derinlik: her noktada yerel kalınlığa göre dairesel kesit (borular silindir gibi yuvarlanır);
  Nural'ın hava halkası ise öne doğru sabit derinlikte bir silindir olarak çıkarılır.
Çıktı: assets/cut/<ad>-tex.webp, <ad>-depth.png, meta.json içinde 'mesh' alanları."""
import json, os
import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'assets', 'products'); OUT = os.path.join(ROOT, 'assets', 'cut')
meta = json.load(open(os.path.join(OUT, 'meta.json')))

def main_component(im, thr=40, extra_near=8):
    a = np.array(im)[:, :, 3] > thr
    lab, n = ndimage.label(a)
    sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
    m = int(np.argmax(sizes)) + 1
    near = ndimage.binary_dilation(lab == m, iterations=extra_near)
    ids = [i + 1 for i in range(n) if i + 1 == m or (sizes[i] > 300 and near[lab == i + 1].any())]
    return np.isin(lab, ids)

def circular_depth(mask, window_scale=2.2, smooth=1.2):
    edt = ndimage.distance_transform_edt(mask)
    R = ndimage.maximum_filter(edt, size=max(3, int(window_scale * edt.max())))
    d = np.sqrt(np.clip(R ** 2 - (R - edt) ** 2, 0, None))
    return ndimage.gaussian_filter(d, smooth) * mask, edt

def export(name, im, mask, depth, max_h):
    arr = np.array(im).copy(); arr[:, :, 3] = np.where(mask, arr[:, :, 3], 0)
    # kenar taşırma: saydam piksellerin rengini en yakın opak pikselden doldur (yan açılarda koyu kenar olmasın)
    solid = arr[:, :, 3] > 200
    _, (iy, ix) = ndimage.distance_transform_edt(~solid, return_indices=True)
    arr[:, :, :3] = arr[iy, ix, :3]
    ys, xs = np.where(mask); y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    tex = Image.fromarray(arr).crop((x0, y0, x1, y1)); dep = depth[y0:y1, x0:x1]
    if tex.height > max_h:
        s = max_h / tex.height; tex = tex.resize((round(tex.width * s), max_h), Image.LANCZOS); dep = dep * s
    dmax = float(dep.max())
    dimg = Image.fromarray((np.clip(dep / dmax, 0, 1) * 255).astype('uint8')).resize((tex.width, tex.height), Image.BILINEAR)
    # derinlik haritası mesh çözünürlüğünde yeterli (küçült)
    dsmall = dimg.resize((max(8, tex.width // 4), max(8, tex.height // 4)), Image.BILINEAR)
    tex.save(os.path.join(OUT, f'{name}-tex.webp'), 'WEBP', quality=88, method=6)
    dsmall.save(os.path.join(OUT, f'{name}-depth.png'), optimize=True)
    return {'tex': f'assets/cut/{name}-tex.webp', 'depth': f'assets/cut/{name}-depth.png', 'w': tex.width, 'h': tex.height,
            'depthPx': dmax, 'bbox': [int(x0), int(y0), int(x1), int(y1)]}

# ── Supersonic Nural
im = Image.open(os.path.join(SRC, '492345-01.png')).convert('RGBA')
a = np.array(im)[:, :, 3] > 12
lab, n = ndimage.label(ndimage.binary_closing(a, iterations=3))
objs = ndimage.find_objects(lab); sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
cands = [i for i in range(n) if sizes[i] > 3000]
dry = min(cands, key=lambda i: objs[i][1].start) + 1
mask = (lab == dry) & a
ys, xs = np.where(mask); top = ys.min(); ringR = (xs.max() - xs.min()) / 2
ring_bottom = top + 2 * ringR
Y = np.arange(mask.shape[0])[:, None]
edt = ndimage.distance_transform_edt(mask)
depth, _ = circular_depth(mask & (Y > ring_bottom - 30))  # sap: halkadan bağımsız silindir kesiti
ring_depth = 0.62 * ringR * np.sqrt(np.clip(edt / 8.0, 0, 1))   # halka: önden bakan, kenarı yuvarlatılmış silindir
w = np.clip((ring_bottom - 10 - Y) / 20.0, 0, 1)                 # halka → sap geçişi
depth = (w * ring_depth + (1 - w) * depth) * mask
depth = ndimage.gaussian_filter(depth, 1.0) * mask
meta.setdefault('mesh', {})['nural'] = export('nural', im, mask, depth, 900)
mn = meta['mesh']['nural']; mn['ring'] = {'cx': 0.5, 'cy': float((ringR) / (mn['bbox'][3] - mn['bbox'][1])), 'r': float(ringR / (mn['bbox'][3] - mn['bbox'][1]))}

# ── V12 Detect Slim
im = Image.open(os.path.join(SRC, '494876-01.png')).convert('RGBA')
mask = main_component(im)
arr = np.array(im).astype(int)
g = (arr[:, :, 1] > arr[:, :, 0] + 40) & (arr[:, :, 1] > arr[:, :, 2] + 20)
ys, xs = np.where(mask); y0, y1 = ys.min(), ys.max()
zone = Y2 = (np.arange(mask.shape[0])[:, None] > y0 + (y1 - y0) * 0.82)
mask &= ~(g & zone)
op = ndimage.binary_dilation(ndimage.binary_opening(mask, iterations=4), iterations=2) & mask
mask = np.where(zone, op, mask)
depth, _ = circular_depth(mask, window_scale=1.4)
meta['mesh']['v12'] = export('v12', im, mask, depth, 1100)
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), indent=2)
print(json.dumps(meta['mesh'], indent=1))

# ── Manyetik başlıklar (aynı set fotoğrafından): yan görünüş, takılan uç (yaka) solda
im = Image.open(os.path.join(SRC, '492345-01.png')).convert('RGBA')
a = np.array(im)[:, :, 3] > 12
lab, n = ndimage.label(ndimage.binary_closing(a, iterations=3))
objs = ndimage.find_objects(lab); sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
big = sorted([i for i in range(n) if sizes[i] > 3000], key=lambda i: objs[i][1].start)
rest = sorted(big[1:], key=lambda i: (round(objs[i][0].start / 150), objs[i][1].start))
names = ['diffuser', 'comb', 'concentrator', 'gentle', 'flyaway']
meta['mesh']['atts'] = {}
for key, i in zip(names, rest):
    mask = (lab == i + 1) & a
    depth, _ = circular_depth(mask, window_scale=1.6)
    m = export(f'att-{key}', im, mask, depth, 360)
    # yaka (takılan uç): en soldaki %7'lik sütunlardaki opak satırlar
    al = np.array(Image.open(os.path.join(OUT, f'att-{key}-tex.webp')))[:, :, 3] > 128
    cols = max(2, int(al.shape[1] * 0.07))
    rows = np.where(al[:, :cols].any(1))[0]
    m['collar'] = {'v': float((rows[0] + rows[-1]) / 2 / al.shape[0]), 'h': float((rows[-1] - rows[0]) / al.shape[0])}
    rows2 = np.where(al[:, -cols:].any(1))[0]
    m['outlet'] = {'v': float((rows2[0] + rows2[-1]) / 2 / al.shape[0]), 'h': float((rows2[-1] - rows2[0]) / al.shape[0])}
    meta['mesh']['atts'][key] = m
json.dump(meta, open(os.path.join(OUT, 'meta.json'), 'w'), indent=2)
print(json.dumps(meta['mesh']['atts'], indent=1))
