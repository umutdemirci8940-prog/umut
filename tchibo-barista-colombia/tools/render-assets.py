#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Tchibo Barista Colombia 970x250 masthead – RASTER görsel üretici.

Bu bannerdaki HİÇBİR görsel vektör, stok fotoğraf ya da hazır çizim değildir.
Arka plan (ahşap masa + kafe derinliği), kahve çekirdekleri, fincan + tabak,
krema, buhar tutamları, bokeh ışıkları, ısı halkası ve aroma kıvılcımları
burada numpy + Pillow ile piksel piksel üretilir: yükseklik haritası →
yüzey normalleri → Phong/Blinn ışıklandırma → süper örnekleme (anti-alias).

Kullanım:  python3 tools/render-assets.py      →  assets/*.webp, assets/*.png
"""
import os, math, json
import numpy as np
from PIL import Image, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'assets')
os.makedirs(OUT, exist_ok=True)
MANIFEST = {}

# ----------------------------------------------------------------- yardımcılar
def fbm(h, w, scale, seed, octaves=4, persistence=0.5, lacunarity=2.0):
    """Katmanlı (fractal) değer gürültüsü, [0,1]."""
    r = np.random.default_rng(seed)
    total = np.zeros((h, w), np.float32); amp = 1.0; freq = 1.0; norm = 0.0
    for _ in range(octaves):
        gh = max(2, int(math.ceil(h / scale * freq)) + 2)
        gw = max(2, int(math.ceil(w / scale * freq)) + 2)
        grid = r.random((gh, gw), dtype=np.float32)
        img = Image.fromarray(grid, mode='F').resize((w, h), Image.BICUBIC)
        total += np.asarray(img, dtype=np.float32) * amp
        norm += amp; amp *= persistence; freq *= lacunarity
    return np.clip(total / norm, 0, 1)

def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0), 0, 1)
    return t * t * (3 - 2 * t)

def normalize(v):
    return v / (np.linalg.norm(v, axis=-1, keepdims=True) + 1e-9)

def sample(img, xs, ys):
    """Bilinear örnekleme (domain warp için)."""
    H, W = img.shape
    xs = np.clip(xs, 0, W - 1.001); ys = np.clip(ys, 0, H - 1.001)
    x0 = np.floor(xs).astype(np.int32); y0 = np.floor(ys).astype(np.int32)
    fx = (xs - x0).astype(np.float32); fy = (ys - y0).astype(np.float32)
    return (img[y0, x0] * (1 - fx) * (1 - fy) + img[y0, x0 + 1] * fx * (1 - fy)
            + img[y0 + 1, x0] * (1 - fx) * fy + img[y0 + 1, x0 + 1] * fx * fy)

def blur(mask, radius):
    """Yumuşak gölge/maske bulanıklığı (8 bit, yeterli)."""
    if radius <= 0: return mask
    im = Image.fromarray((np.clip(mask, 0, 1) * 255).astype(np.uint8), 'L')
    return np.asarray(im.filter(ImageFilter.GaussianBlur(radius)), np.float32) / 255.0

def phong(n, albedo, lights, ambient=0.3, ambient_col=(1, 1, 1)):
    """Blinn-Phong: n (H,W,3) normaller, albedo (H,W,3)."""
    V = np.array([0, 0, 1.0], np.float32)
    col = albedo * ambient * np.array(ambient_col, np.float32)
    for L in lights:
        d = np.array(L['dir'], np.float32); d /= np.linalg.norm(d)
        lc = np.array(L['col'], np.float32)
        ndl = np.clip((n * d).sum(-1), 0, 1)
        col = col + albedo * (ndl * L.get('diff', 1.0))[..., None] * lc
        if L.get('spec', 0) > 0:
            hv = d + V; hv /= np.linalg.norm(hv)
            ndh = np.clip((n * hv).sum(-1), 0, 1)
            col = col + (ndh ** L['power'])[..., None] * L['spec'] * lc
    return col

def finish(rgb, alpha, ss):
    """Premultiplied kutu filtre ile süper örneklemeden iner; RGBA PIL döner."""
    H, W = alpha.shape; h, w = H // ss, W // ss
    pm = (np.clip(rgb, 0, 1) * alpha[..., None])[:h * ss, :w * ss].reshape(h, ss, w, ss, 3).mean((1, 3))
    a = alpha[:h * ss, :w * ss].reshape(h, ss, w, ss).mean((1, 3))
    rgb2 = np.clip(pm / np.maximum(a[..., None], 1e-4), 0, 1)
    out = np.dstack([rgb2, a])
    return Image.fromarray((out * 255 + 0.5).astype(np.uint8), 'RGBA')

def save(img, name, lossless=False, quality=88):
    path = os.path.join(OUT, name + '.webp')
    if lossless: img.save(path, lossless=True, quality=100, method=6)
    else: img.save(path, quality=quality, method=6)
    kb = os.path.getsize(path) / 1024
    MANIFEST[name] = {'file': 'assets/' + name + '.webp', 'w': img.width, 'h': img.height, 'kb': round(kb, 1)}
    print(f'  {name:14s} {img.width:5d}x{img.height:<5d} {kb:6.1f} KB')

# ----------------------------------------------------------------- kahve çekirdeği
def render_bean(name, seed, w=176, h=124, ss=4, base=(0.36, 0.21, 0.11), gloss=0.55, back=False):
    W, H = w * ss, h * ss
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.random.default_rng(seed)
    x = (xs - W / 2) / (W / 2 * 0.92)
    y = (ys - H / 2) / (H / 2 * 0.90)
    taper = 0.10 * r.uniform(0.5, 1.5) * (1 if r.random() < .5 else -1)
    yb = y * (1 + taper * x)
    d2 = x ** 2 + yb ** 2
    inside = d2 <= 1.0
    z = np.sqrt(np.clip(1 - d2, 0, 1)) ** 0.72
    wob = 0.05 * np.sin(x * 2.4 + r.uniform(0, 6.28))
    cy = yb - wob
    ends = np.clip(1 - x ** 2, 0, 1) ** 0.5
    crease = np.exp(-(cy / 0.09) ** 2) * ends
    if not back:
        z = z * (1 - 0.45 * crease)
    zs = z * 0.5
    gx = np.gradient(zs, axis=1) * (W / 2 * 0.92)
    gy = np.gradient(zs, axis=0) * (H / 2 * 0.90)
    n = normalize(np.dstack([-gx, -gy, np.ones_like(gx)]))
    mottle = fbm(H, W, W / 5, seed + 1, octaves=3)
    fine = fbm(H, W, W / 34, seed + 2, octaves=2)
    b = np.array(base, np.float32)
    alb = b[None, None, :] * (0.78 + 0.44 * mottle)[..., None] * (0.92 + 0.16 * fine)[..., None]
    if not back:
        ridge = np.exp(-((np.abs(cy) - 0.15) / 0.06) ** 2) * ends
        core = np.exp(-(cy / 0.045) ** 2) * ends
        alb = alb * (1 + 0.14 * ridge)[..., None] * (1 - 0.7 * core)[..., None]
    lights = [
        dict(dir=(-0.45, -0.55, 0.72), col=(1.0, 0.96, 0.90), diff=0.95, spec=gloss, power=48),
        dict(dir=(0.75, 0.15, 0.55), col=(1.0, 0.78, 0.50), diff=0.30, spec=gloss * 0.45, power=18),
        dict(dir=(0.30, -0.80, 0.30), col=(1.0, 0.85, 0.60), diff=0.22, spec=0.0),
    ]
    col = phong(n, alb, lights, ambient=0.30, ambient_col=(1.0, 0.9, 0.8))
    nz = n[..., 2]
    col *= (0.70 + 0.30 * nz)[..., None]
    col += ((1 - nz) ** 4 * 0.35)[..., None] * np.array([1.0, 0.7, 0.4], np.float32)
    col *= (0.75 + 0.25 * z)[..., None]
    save(finish(col, inside.astype(np.float32), ss), name)

# ----------------------------------------------------------------- fincan + tabak
def render_cup(name='cup', ss=3):
    w, h = 560, 400                       # 2x sprite (ekranda 280x200)
    W, H = w * ss, h * ss
    R = 124.0 * ss; k = 0.34              # üst ağız yarıçapı, elips oranı (kamera eğimi)
    ys, xs = np.mgrid[0:H, 0:W].astype(np.float32)
    cx = W / 2; y0 = 60.0 * ss
    Hc = 1.5 * R; R0 = 0.72 * R; t = 0.075 * R
    X = xs - cx; Y = ys - y0
    pm = np.zeros((H, W, 3), np.float32); A = np.zeros((H, W), np.float32)
    porcelain = np.array([0.96, 0.93, 0.88], np.float32)

    def over(rgb, a):
        nonlocal pm, A
        a = np.clip(a, 0, 1).astype(np.float32)
        pm = np.clip(rgb, 0, 1) * a[..., None] + pm * (1 - a)[..., None]
        A = a + A * (1 - a)

    def ell(cxe, cye, rx, ry):
        return ((xs - cxe) / rx) ** 2 + ((ys - cye) / ry) ** 2

    lights = [
        dict(dir=(-0.55, -0.45, 0.70), col=(1.0, 0.97, 0.93), diff=0.62, spec=0.35, power=28),
        dict(dir=(0.80, 0.05, 0.60), col=(1.0, 0.72, 0.45), diff=0.26, spec=0.12, power=10),
    ]
    sc_y = y0 + Hc + 0.06 * R; SR = 1.95 * R

    # 1) zemin gölgesi
    g = (ell(cx + 0.45 * R, sc_y + 0.08 * R, 2.05 * R, 2.05 * R * k * 0.95) <= 1).astype(np.float32)
    g = blur(g, 0.22 * R) * 0.6
    over(np.zeros((H, W, 3), np.float32) + np.array([0.04, 0.02, 0.01]), g)

    # 2) tabak kalınlığı
    nxs = np.clip(X / SR, -1, 1)
    edge = (ell(cx, sc_y + 0.09 * R, SR, SR * k) <= 1).astype(np.float32)
    over(porcelain * (0.42 + 0.22 * np.sqrt(1 - nxs ** 2))[..., None], edge)

    # 3) tabak üst yüzü
    us = X / SR; vs = (ys - sc_y) / (SR * k); rho = np.sqrt(us ** 2 + vs ** 2)
    top = (rho <= 1).astype(np.float32)
    rimb = 0.84 - 0.10 * vs + 0.30 * np.exp(-((us + 0.60) ** 2 + (vs - 0.42) ** 2) / 0.10) \
           + 0.12 * np.exp(-((us - 0.30) ** 2 + (vs + 0.85) ** 2) / 0.06)
    wellb = 0.78 + 0.05 * vs
    band = smoothstep(0.80, 0.86, rho)
    bright = wellb * (1 - band) + rimb * band
    bright *= 1 - 0.10 * np.exp(-((rho - 0.83) / 0.02) ** 2)          # rim-well kontak çizgisi
    sh = (ell(cx + 0.30 * R, sc_y + 0.02 * R, 0.98 * R, 0.98 * R * k) <= 1).astype(np.float32)
    sh = blur(sh, 0.10 * R)
    bright *= 1 - 0.42 * sh                                            # fincan gölgesi
    bright *= 1 - 0.10 * (1 - smoothstep(0.30, 0.75, rho))              # AO
    tex = 1 + 0.02 * (fbm(H, W, R * 0.3, 11, 2) - 0.5)
    col = porcelain[None, None, :] * (bright * tex)[..., None]
    col += (np.array([0.10, 0.05, 0.02]) * np.clip(us, 0, 1)[..., None])   # sağdan sıcak ışık
    over(col, top)

    # 4) fincan gövdesi
    rY = R + (R0 - R) * np.clip(Y / Hc, 0, 1)
    trap = (Y >= 0) & (Y <= Hc) & (np.abs(X) <= rY)
    cap = (ell(cx, y0 + Hc, R0, R0 * k) <= 1) & (Y > Hc)
    body = trap | cap
    nx = np.clip(X / np.where(cap, R0, rY), -1, 1)
    ny = np.where(cap, 0.75, 0.16).astype(np.float32)
    nz = np.sqrt(np.clip(1 - nx ** 2, 0, 1))
    n = normalize(np.dstack([nx, ny, nz]))
    alb = np.broadcast_to(porcelain, (H, W, 3)).copy()
    alb *= (1 + 0.015 * (fbm(H, W, R * 0.25, 12, 2) - 0.5))[..., None]
    col = phong(n, alb, lights, ambient=0.40, ambient_col=(0.95, 0.90, 0.85))
    rim = (1 - n[..., 2]) ** 3 * 0.32
    rimcol = np.where((nx < 0)[..., None], np.array([0.85, 0.92, 1.0]), np.array([1.0, 0.68, 0.38]))
    col += rim[..., None] * rimcol
    col *= (1 - 0.28 * smoothstep(0.55, 1.0, Y / Hc))[..., None]
    col += (np.array([0.10, 0.05, 0.02]) * smoothstep(0.7, 1.0, Y / Hc)[..., None]) * np.clip(nx, 0, 1)[..., None]
    over(col, body.astype(np.float32))

    # 5) ağız halkası + iç duvar + krema
    E1 = ell(cx, y0, R, R * k); E2 = ell(cx, y0, R - t, (R - t) * k)
    u1 = X / R; v1 = Y / (R * k)
    rimband = (E1 <= 1) & (E2 > 1)
    rb = 0.90 - 0.05 * v1 + 0.30 * np.exp(-((u1 + 0.55) ** 2 + (v1 + 0.70) ** 2) / 0.12) \
         + 0.10 * np.exp(-((u1 - 0.75) ** 2 + (v1 - 0.45) ** 2) / 0.10)
    over(porcelain[None, None, :] * rb[..., None], rimband.astype(np.float32))
    u2 = X / (R - t); v2 = Y / ((R - t) * k)
    ib = 0.40 + 0.30 * np.clip(u2, 0, 1) + 0.16 * np.clip(-v2, 0, 1)
    inner = porcelain[None, None, :] * ib[..., None]
    warm = np.array([0.52, 0.30, 0.14], np.float32)
    mixw = (0.40 * (1 - np.clip(-v2, 0, 1)))[..., None]
    inner = inner * (1 - mixw) + warm * mixw
    over(inner, (E2 <= 1).astype(np.float32))
    dc = 0.20 * R; Rc = R - t - 0.012 * R
    Ec = ell(cx, y0 + dc, Rc, Rc * k)
    coffee = (Ec <= 1) & (E2 <= 1)
    uc = X / Rc; vc = (Y - dc) / (Rc * k); rc = np.sqrt(uc ** 2 + vc ** 2)
    wx = fbm(H, W, 0.40 * R, 21, 3); wy = fbm(H, W, 0.40 * R, 22, 3)
    n1 = fbm(H, W, 0.16 * R, 23, 4, persistence=0.55)
    marble = sample(n1, xs + (wx - 0.5) * 0.30 * R, ys + (wy - 0.5) * 0.30 * R)
    fleck = fbm(H, W, 0.035 * R, 24, 3, persistence=0.6)
    theta = np.arctan2(vc, uc)
    swirl = 0.5 + 0.5 * np.sin(3 * theta + 7 * rc + 5 * (marble - 0.5))
    p = 0.55 * marble + 0.25 * fleck + 0.20 * swirl
    light = np.array([0.80, 0.56, 0.30], np.float32); mid = np.array([0.62, 0.38, 0.17], np.float32)
    dark = np.array([0.34, 0.17, 0.07], np.float32)
    tL = smoothstep(0.40, 0.75, p)[..., None]; tD = (1 - smoothstep(0.22, 0.42, p))[..., None]
    cc = mid * (1 - tL) + light * tL
    cc = cc * (1 - 0.55 * tD) + dark * 0.55 * tD
    cc *= (1 + 0.10 * (fleck - 0.5))[..., None]
    cc *= (1.06 - 0.16 * rc ** 2)[..., None]                                    # orta daha açık
    edge = smoothstep(0.86, 1.0, rc)[..., None]
    cc = cc * (1 - 0.8 * edge) + dark * 0.8 * edge
    ring = np.exp(-((rc - 0.84) / 0.03) ** 2)[..., None]                        # kenarda açık krema halkası
    cc = cc * (1 - 0.35 * ring) + light * 0.35 * ring
    rr = np.random.default_rng(5)
    bub = np.zeros((H, W), np.float32)
    for _ in range(220):
        ang = rr.uniform(0, 6.283); rad = rr.uniform(0.55, 0.96); sz = rr.uniform(0.006, 0.016) * R
        bx = cx + np.cos(ang) * rad * Rc; by = y0 + dc + np.sin(ang) * rad * Rc * k
        bub += np.exp(-(((xs - bx) ** 2 + ((ys - by) / k) ** 2 * 0.6)) / (sz * sz)) * rr.uniform(0.3, 1.0)
    cc += np.clip(bub, 0, 1)[..., None] * np.array([0.18, 0.13, 0.07])
    shadow = 1 - 0.50 * smoothstep(0.30, 1.0, rc) * np.clip(-(0.75 * vc + 0.55 * uc), 0, 1)
    cc *= shadow[..., None]
    cc += (0.05 * np.clip(-vc, 0, 1))[..., None] * np.array([1.0, 0.9, 0.8])
    spec = 0.42 * np.exp(-((uc + 0.30) / 0.30) ** 2 - ((vc + 0.28) / 0.13) ** 2) \
           + 0.12 * np.exp(-((uc - 0.30) / 0.28) ** 2 - ((vc - 0.50) / 0.12) ** 2)
    cc += spec[..., None] * np.array([1.0, 0.95, 0.88])
    over(cc, coffee.astype(np.float32))

    # 6) kulp
    hcx = cx + 0.92 * R; hcy = y0 + 0.48 * Hc; rx = 0.58 * R; ry = 0.55 * R; thick = 0.24 * R
    rm = (rx + ry) / 2; tn = thick / (2 * rm)
    hu = (xs - hcx) / rx; hv = (ys - hcy) / ry; hr = np.sqrt(hu ** 2 + hv ** 2)
    s = (hr - 1) / tn
    hmask = (np.abs(s) <= 1) & (~body) & (xs > cx + 0.5 * R)
    d = normalize(np.dstack([hu, hv]))
    hn = normalize(np.dstack([s * d[..., 0], s * d[..., 1], np.sqrt(np.clip(1 - s ** 2, 0, 1))]))
    hcol = phong(np.broadcast_to(porcelain, (H, W, 3)), lights, ambient=0.40, ambient_col=(0.95, 0.90, 0.85)) if False else \
           phong(hn, np.broadcast_to(porcelain, (H, W, 3)).copy(), lights, ambient=0.40, ambient_col=(0.95, 0.90, 0.85))
    hcol += ((1 - hn[..., 2]) ** 3 * 0.30)[..., None] * np.array([1.0, 0.72, 0.42])
    hcol *= (0.62 + 0.38 * np.clip((xs - (cx + 0.55 * R)) / (0.45 * R), 0, 1))[..., None]
    over(hcol, hmask.astype(np.float32))
    # kulbun gövdeye değdiği yerlerde küçük kontak gölgesi
    attach = (np.abs(s) <= 1.0) & body & (xs > cx + rY - 0.10 * R)
    hs = blur(attach.astype(np.float32), 0.045 * R) * 0.35
    pm *= (1 - hs)[..., None]

    rgb = pm / np.maximum(A[..., None], 1e-4)
    save(finish(rgb, A, ss), name, quality=90)

# ----------------------------------------------------------------- buhar tutamı
def render_steam(name, seed, size=192, stretch=1.0):
    """İnce, tel tel buhar tutamı: gürültü eşiklenerek liflere ayrılır."""
    ss = 2; S = size * ss
    ys, xs = np.mgrid[0:S, 0:S].astype(np.float32)
    u = (xs - S / 2) / (S / 2); v = (ys - S / 2) / (S / 2) / stretch
    rho = np.sqrt(u ** 2 + v ** 2)
    wx = fbm(S, S, S / 2.5, seed + 5, 3); wy = fbm(S, S, S / 2.5, seed + 6, 3)
    n0 = fbm(S, S, S / 4, seed, 5, persistence=0.6)
    n = sample(n0, xs + (wx - 0.5) * S * 0.35, ys + (wy - 0.5) * S * 0.35)
    fibre = np.abs(n - 0.5) * 2                       # ridged: tel tel lifler
    fibre = 1 - fibre
    fine = fbm(S, S, S / 12, seed + 1, 3)
    fall = np.clip(1 - rho, 0, 1) ** 1.3
    a = fall * (fibre ** 2.2) * (0.55 + 0.45 * fine)
    a = smoothstep(0.10, 0.75, a) * (1 - smoothstep(0.78, 1.0, rho))
    a *= 0.9
    rgb = np.ones((S, S, 3), np.float32) * np.array([1.0, 0.97, 0.92], np.float32)
    save(finish(rgb, a.astype(np.float32), ss), name, lossless=True)

# ----------------------------------------------------------------- bokeh, ısı halkası, kıvılcım, gölge
def render_disc(name, size, fn, color, lossless=True):
    ss = 2; S = size * ss
    ys, xs = np.mgrid[0:S, 0:S].astype(np.float32)
    u = (xs - S / 2) / (S / 2); v = (ys - S / 2) / (S / 2)
    rho = np.sqrt(u ** 2 + v ** 2)
    a = np.clip(fn(rho, u, v), 0, 1).astype(np.float32)
    rgb = np.ones((S, S, 3), np.float32) * np.array(color, np.float32)
    save(finish(rgb, a, ss), name, lossless=lossless)

# ----------------------------------------------------------------- arka plan (ahşap masa + kafe)
def render_background(name='bg', scale=2):
    w, h = 970 * scale, 250 * scale
    ys, xs = np.mgrid[0:h, 0:w].astype(np.float32)
    u = xs / w; v = ys / h
    hz = 0.36 * h
    # arka duvar: koyu, sıcak, odak dışı
    c0 = np.array([0.075, 0.042, 0.028], np.float32); c1 = np.array([0.17, 0.095, 0.055], np.float32)
    tv = np.clip(v / 0.36, 0, 1)[..., None]
    wall = c0 * (1 - tv) + c1 * tv
    wall += np.exp(-(((u - 0.80) / 0.32) ** 2 + ((v + 0.02) / 0.42) ** 2))[..., None] * np.array([0.34, 0.18, 0.07])
    wall += np.exp(-(((u - 0.32) / 0.22) ** 2 + ((v - 0.10) / 0.30) ** 2))[..., None] * np.array([0.05, 0.03, 0.02])
    wall *= (1 + 0.10 * (fbm(h, w, w / 6, 31, 3) - 0.5))[..., None]
    # masa: perspektifli ahşap (doku dünya uzayında üretilip perspektifle örneklenir)
    d = np.maximum(ys - hz, 6.0)
    phi = 26800.0 / d                                   # derinlik (ufka yaklaştıkça sıkışır)
    plank = np.floor(phi / 90.0)
    rr = np.random.default_rng(3)
    ptone = np.zeros_like(phi)
    for i in range(0, 8):
        ptone += (plank == i) * rr.uniform(-0.07, 0.07)
    T = 1024
    streakT = fbm(T, T // 16, T / 14, 32, 4, persistence=0.55)          # yatay uzatılmış damar
    streakT = np.asarray(Image.fromarray(streakT, 'F').resize((T, T), Image.BICUBIC), np.float32)
    fineT = fbm(T, T // 6, T / 60, 33, 3)
    fineT = np.asarray(Image.fromarray(fineT, 'F').resize((T, T), Image.BICUBIC), np.float32)
    txw = np.mod((xs - w / 2) / d * 900.0 + 512.0, T - 1)
    tyw = np.mod(phi * 5.5 + plank * 137.0, T - 1)
    streak = sample(streakT, txw, tyw)
    fine = sample(fineT, txw * 1.7 % (T - 1), tyw * 1.3 % (T - 1))
    warp = fbm(h, w, w / 5, 34, 3)
    grain = 0.5 + 0.5 * np.sin(phi * 0.62 + 7.0 * warp + 3.0 * streak + plank * 1.7)
    grain = grain ** 1.4
    G = 0.45 * grain + 0.40 * streak + 0.15 * fine
    dist = np.clip((ys - hz) / (0.40 * h), 0, 1)
    G12 = blur(G, 10 * scale); G3 = blur(G, 2.5 * scale)
    mixA = smoothstep(0.0, 0.40, dist); mixB = smoothstep(0.45, 1.0, dist)
    G = G12 * (1 - mixA) + G3 * mixA
    G = G * (1 - mixB) + (0.45 * grain + 0.40 * streak + 0.15 * fine) * mixB
    dark = np.array([0.16, 0.085, 0.042], np.float32)
    lightw = np.array([0.50, 0.30, 0.15], np.float32)
    wood = dark * (1 - G)[..., None] + lightw * G[..., None]
    wood = wood * (1 + ptone)[..., None]
    seam = np.exp(-((np.mod(phi, 90.0) - 1.5) / 1.6) ** 2)
    wood *= (1 - 0.60 * seam * smoothstep(0.05, 0.3, dist))[..., None]
    bevel = np.exp(-((np.mod(phi, 90.0) - 4.5) / 1.8) ** 2)
    wood *= (1 + 0.22 * bevel * smoothstep(0.05, 0.3, dist))[..., None]
    lightmap = 0.50 + 0.95 * np.exp(-(((u - 0.68) / 0.42) ** 2 + ((v - 0.62) / 0.62) ** 2))
    wood *= lightmap[..., None]
    wood += np.exp(-(((u - 0.76) / 0.32) ** 2 + ((v - 0.47) / 0.09) ** 2))[..., None] * np.array([0.16, 0.09, 0.04])  # cilalı yansıma
    wood *= (0.62 + 0.38 * smoothstep(0.0, 0.35, dist))[..., None]          # uzak kenar atmosferi
    warp2 = fbm(h, w, w / 12, 35, 3)
    # ufuk geçişi (odak dışı masa kenarı)
    tmask = smoothstep(hz - 4 * scale, hz + 10 * scale, ys + 6 * scale * (warp2 - 0.5))[..., None]
    img = wall * (1 - tmask) + wood * tmask
    # vinyet + sol tarafı metin için karart
    rad = np.sqrt(((u - 0.52) / 0.62) ** 2 + ((v - 0.5) / 0.75) ** 2)
    img *= (1 - 0.55 * np.clip(rad, 0, 1) ** 2.2)[..., None]
    img *= (0.42 + 0.58 * smoothstep(0.02, 0.50, u))[..., None]
    img += ((fbm(h, w, 1.5, 35, 1) - 0.5) * 0.025)[..., None]
    out = Image.fromarray((np.clip(img, 0, 1) * 255 + 0.5).astype(np.uint8), 'RGB')
    path = os.path.join(OUT, name + '.webp')
    out.save(path, quality=82, method=6)
    kb = os.path.getsize(path) / 1024
    MANIFEST[name] = {'file': 'assets/' + name + '.webp', 'w': w, 'h': h, 'kb': round(kb, 1)}
    print(f'  {name:14s} {w:5d}x{h:<5d} {kb:6.1f} KB')

# ----------------------------------------------------------------- üretim
if __name__ == '__main__':
    print('Raster görseller üretiliyor →', OUT)
    render_background()
    render_cup()
    beans = [
        ('bean1', 101, (0.37, 0.215, 0.115), 0.55, False),
        ('bean2', 202, (0.33, 0.19, 0.10), 0.65, False),
        ('bean3', 303, (0.40, 0.24, 0.13), 0.45, False),
        ('bean4', 404, (0.30, 0.17, 0.09), 0.70, False),
        ('bean5', 505, (0.36, 0.20, 0.10), 0.50, True),
    ]
    for nm, sd, base, gl, back in beans:
        render_bean(nm, sd, base=base, gloss=gl, back=back)
    render_steam('steam1', 7, stretch=1.35)
    render_steam('steam2', 8, stretch=1.1)
    render_steam('steam3', 9, stretch=1.6)
    render_disc('bokeh', 128, lambda r, u, v: (1 - smoothstep(0.93, 1.0, r)) * (0.45 + 0.55 * smoothstep(0.70, 0.97, r)), (1.0, 0.78, 0.45))
    render_disc('heatring', 256, lambda r, u, v: np.exp(-((r - 0.76) / 0.13) ** 2) * (0.75 + 0.25 * np.sin(u * 9 + v * 5)), (1.0, 0.80, 0.52))
    render_disc('spark', 48, lambda r, u, v: np.exp(-(r / 0.42) ** 2) * 0.7 + np.exp(-(r / 0.14) ** 2) * 0.9, (1.0, 0.86, 0.55))
    render_disc('shadow', 160, lambda r, u, v: np.exp(-(np.sqrt(u ** 2 + (v * 1.5) ** 2) / 0.50) ** 2.2), (0.02, 0.01, 0.0))
    render_disc('glow', 256, lambda r, u, v: np.exp(-(r / 0.45) ** 2) * 0.9, (1.0, 0.62, 0.25))
    with open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8') as f:
        json.dump(MANIFEST, f, ensure_ascii=False, indent=1)
    total = sum(m['kb'] for m in MANIFEST.values())
    print(f'Toplam: {total:.0f} KB')
