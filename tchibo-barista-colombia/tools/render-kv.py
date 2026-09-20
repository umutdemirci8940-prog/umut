#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Kampanya anahtar görseli (KV) dilindeki raster parçalar: mavi zemin, krem organik lekeler,
kırmızı/sarı/turuncu üçgen motifi, "YENİ" rozet dairesi. Renkler kampanya küçük resminden örneklendi.
Çıktı: assets/kv/*.webp   Kullanım: python3 tools/render-kv.py
"""
import os, math, json
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets', 'kv'); os.makedirs(OUT, exist_ok=True)
BLUE=(0x39,0x42,0xa1); BLUE2=(0x37,0x46,0x99); CREAM=(0xec,0xd6,0x9d); BADGE=(0xee,0xdc,0x94)
ORANGE=(0xcc,0x63,0x43); RED=(0xf1,0x48,0x27); YELLOW=(0xfe,0xc0,0x15)
MAN = {}

def fbm(h, w, scale, seed, octaves=3):
    r = np.random.default_rng(seed); tot = np.zeros((h, w), np.float32); amp = 1; f = 1; n = 0
    for _ in range(octaves):
        gh = max(2, int(h / scale * f) + 2); gw = max(2, int(w / scale * f) + 2)
        g = r.random((gh, gw), dtype=np.float32)
        tot += np.asarray(Image.fromarray(g, 'F').resize((w, h), Image.BICUBIC), np.float32) * amp; n += amp; amp *= .5; f *= 2
    return np.clip(tot / n, 0, 1)

def down(mask, ss):
    H, W = mask.shape; h, w = H // ss, W // ss
    return mask[:h*ss, :w*ss].reshape(h, ss, w, ss).mean((1, 3))

def save_rgba(name, rgb, alpha, lossless=False, q=90):
    a = np.clip(alpha, 0, 1)
    img = np.dstack([np.broadcast_to(np.array(rgb, np.float32) / 255, a.shape + (3,)), a])
    im = Image.fromarray((img * 255 + .5).astype(np.uint8), 'RGBA')
    p = os.path.join(OUT, name + '.webp')
    im.save(p, lossless=True, quality=100, method=6) if lossless else im.save(p, quality=q, method=6)
    MAN[name] = {'file': 'assets/kv/' + name + '.webp', 'w': im.width, 'h': im.height, 'kb': round(os.path.getsize(p) / 1024, 1)}
    print(f'  {name:10s} {im.width:5d}x{im.height:<5d} {MAN[name]["kb"]:6.1f} KB')

def blob(name, w, h, seed, k3=.16, k5=.08, rot=0.0):
    ss = 3; W, H = w * ss, h * ss
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    u = (xs - W / 2) / (W / 2 * .92); v = (ys - H / 2) / (H / 2 * .92)
    th = np.arctan2(v, u) + rot; r = np.sqrt(u * u + v * v)
    rr = np.random.default_rng(seed); p1, p2, p3 = rr.uniform(0, 6.28, 3)
    R = 1 + k3 * np.sin(3 * th + p1) + k5 * np.sin(5 * th + p2) + .05 * np.sin(2 * th + p3)
    m = (r <= R).astype(np.float32)
    save_rgba(name, CREAM, down(m, ss))

def badge(name, size=260):
    ss = 3; S = size * ss
    ys, xs = np.mgrid[0:S, 0:S].astype(np.float32)
    cx, cy, R = S * .55, S * .45, S * .40
    m = ((xs - cx) ** 2 + (ys - cy) ** 2 <= R * R).astype(np.float32)
    # sol-alta bakan küçük kuyruk (konuşma balonu)
    ax, ay = cx - R * .55, cy + R * .55            # daire üzerinde başlangıç
    tx, ty = S * .12, S * .93                       # kuyruk ucu
    bx, by = cx - R * .15, cy + R * .95
    # üçgen kuyruk: (ax,ay) (bx,by) (tx,ty)
    def tri(x1, y1, x2, y2, x3, y3):
        d = ((x2 - x1) * (ys - y1) - (y2 - y1) * (xs - x1)) >= 0
        d &= ((x3 - x2) * (ys - y2) - (y3 - y2) * (xs - x2)) >= 0
        d &= ((x1 - x3) * (ys - y3) - (y1 - y3) * (xs - x3)) >= 0
        d2 = ((x2 - x1) * (ys - y1) - (y2 - y1) * (xs - x1)) <= 0
        d2 &= ((x3 - x2) * (ys - y2) - (y3 - y2) * (xs - x2)) <= 0
        d2 &= ((x1 - x3) * (ys - y3) - (y1 - y3) * (xs - x3)) <= 0
        return (d | d2).astype(np.float32)
    m = np.maximum(m, tri(ax, ay, bx, by, tx, ty))
    save_rgba(name, BADGE, down(m, ss))

def tris(name, size=560):
    """Kampanyadaki sağ kenar motifi: sola bakan kırmızı ve sarı üçgenler, altta turuncu."""
    ss = 3; S = size * ss
    ys, xs = np.mgrid[0:S, 0:S].astype(np.float32)
    def tri(pts):
        (x1, y1), (x2, y2), (x3, y3) = [(p[0] * S, p[1] * S) for p in pts]
        e = lambda ax, ay, bx, by: (bx - ax) * (ys - ay) - (by - ay) * (xs - ax)
        a, b, c = e(x1, y1, x2, y2), e(x2, y2, x3, y3), e(x3, y3, x1, y1)
        return (((a >= 0) & (b >= 0) & (c >= 0)) | ((a <= 0) & (b <= 0) & (c <= 0))).astype(np.float32)
    layers = [
        (RED,    tri([(1.0, .05), (1.0, .55), (.30, .30)])),
        (YELLOW, tri([(1.0, .30), (1.0, .80), (.42, .55)])),
        (ORANGE, tri([(1.0, .62), (1.0, 1.0), (.55, .81)])),
        (RED,    tri([(.72, .82), (1.0, 1.0), (.55, 1.0)])),
    ]
    rgb = np.zeros((S, S, 3), np.float32); A = np.zeros((S, S), np.float32)
    for col, m in layers:
        c = np.array(col, np.float32) / 255
        rgb = c * m[..., None] + rgb * (1 - m)[..., None]; A = m + A * (1 - m)
    a = down(A, ss); h, w = a.shape
    pm = rgb[:h*ss, :w*ss].reshape(h, ss, w, ss, 3).mean((1, 3))  # (rgb zaten alfa ile örtüşüyor; kenarlarda ~premultiplied)
    rgb2 = np.clip(pm / np.maximum(a[..., None], 1e-4), 0, 1) if False else pm
    img = np.dstack([np.clip(rgb2, 0, 1), a])
    im = Image.fromarray((img * 255 + .5).astype(np.uint8), 'RGBA')
    p = os.path.join(OUT, name + '.webp'); im.save(p, quality=92, method=6)
    MAN[name] = {'file': 'assets/kv/' + name + '.webp', 'w': im.width, 'h': im.height, 'kb': round(os.path.getsize(p) / 1024, 1)}
    print(f'  {name:10s} {im.width:5d}x{im.height:<5d} {MAN[name]["kb"]:6.1f} KB')

def bg(name, w=1940, h=500):
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32); u = xs / w; v = ys / h
    c1 = np.array(BLUE, np.float32) / 255; c2 = np.array(BLUE2, np.float32) / 255
    t = np.clip(0.5 + 0.5 * np.sin((u * 1.3 + v * .6) * 2.2), 0, 1)[..., None]
    img = c1 * (1 - t) + c2 * t
    img *= (1 + 0.06 * np.exp(-(((u - .42) / .5) ** 2 + ((v - .5) / .8) ** 2)))[..., None]   # ortada hafif aydınlık
    img += ((fbm(h, w, 1.5, 3, 1) - .5) * .02)[..., None]
    im = Image.fromarray((np.clip(img, 0, 1) * 255 + .5).astype(np.uint8), 'RGB')
    p = os.path.join(OUT, name + '.webp'); im.save(p, quality=84, method=6)
    MAN[name] = {'file': 'assets/kv/' + name + '.webp', 'w': w, 'h': h, 'kb': round(os.path.getsize(p) / 1024, 1)}
    print(f'  {name:10s} {w:5d}x{h:<5d} {MAN[name]["kb"]:6.1f} KB')

if __name__ == '__main__':
    print('KV parçaları →', OUT)
    bg('kvBg')
    blob('blobA', 900, 620, 11, .09, .04)
    blob('blobB', 560, 460, 12, .11, .05, .8)
    blob('blobC', 380, 300, 13, .08, .06, 2.1)
    badge('badge')
    tris('tris')
    json.dump(MAN, open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('Toplam: %.0f KB' % sum(m['kb'] for m in MAN.values()))
