#!/usr/bin/env python3
"""
Siteden çekilen arşivi (assets/index.json) reklamlarda kullanılacak görsellere çevirir → assets/ads/
  - Ürün fotoğrafları: beyaz fon kenarlardan taşma dolgusuyla şeffaflaştırılır, kırpılır, 360 px WebP
  - Kampanya bannerları (geniş görseller): 1600 px WebP → arka plan / kategori görselleri
  - Logo: beyaz (logo-w) ve renkli (logo-c) WebP
  - assets/ads/selection.json: ürünler (marka, ad, fiyat, adres), kategoriler, banner listesi
Kullanım: python3 tools/prepare.py
"""
import json, os, re, shutil, sys
from collections import deque
from PIL import Image, ImageOps

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
A = os.path.join(ROOT, 'assets')
OUT = os.path.join(A, 'ads')
idx = json.load(open(os.path.join(A, 'index.json'), encoding='utf-8'))
manual = json.load(open(os.path.join(A, 'manual.json'), encoding='utf-8')) if os.path.exists(os.path.join(A, 'manual.json')) else {}
shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)

CATS = [  # anahtar, ad, sayfa adresinde aranacak ifade, kategori adresi
    ('makyaj', 'Makyaj', r'makyaj'), ('cilt', 'Cilt Bakımı', r'cilt'), ('sac', 'Saç Bakımı', r'sac-'),
    ('parfum', 'Parfüm', r'parfum'), ('kisisel', 'Kişisel Bakım', r'kisisel'), ('erkek', 'Erkek Bakım', r'erkek'),
    ('anne', 'Anne & Bebek', r'anne|bebek'), ('saglik', 'Sağlık', r'saglik|vitamin'),
]
PRICE = re.compile(r'(\d{1,3}(?:\.\d{3})*,\d{2})')
NOISE = re.compile(r'(sepete|ekle|tl\b|₺|%|indirim|yeni|çok satan|kampanya|ücretsiz|kargo|puan|değerlendirme|stok|favori|hızlı|incele|\d+\s*al\s*\d+|^\d+$)', re.I)


def open_img(rel):
    p = os.path.join(ROOT, rel)
    if not os.path.exists(p) or p.endswith('.svg'):
        return None
    try:
        im = Image.open(p)
        im.load()
        return ImageOps.exif_transpose(im).convert('RGBA')
    except Exception:
        return None


def cut_white(im, tol=26):
    """Kenarlardan erişilebilen (neredeyse) beyaz pikselleri şeffaf yapar; ürünün içindeki beyazlar korunur."""
    w, h = im.size
    px = im.load()
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    if not all(c[3] < 10 or min(c[:3]) > 255 - tol for c in corners):
        return im, False  # fon beyaz değil
    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        q.append((x, 0)); q.append((x, h - 1))
    for y in range(h):
        q.append((0, y)); q.append((w - 1, y))
    while q:
        x, y = q.popleft()
        i = y * w + x
        if seen[i]:
            continue
        seen[i] = 1
        r, g, b, a = px[x, y]
        if a > 10 and min(r, g, b) < 255 - tol:
            continue
        px[x, y] = (r, g, b, 0)
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    return im, True


def save_product(im, name, h=360):
    im = im.copy()
    if max(im.size) > 900:
        im.thumbnail((900, 900))
    im, cut = cut_white(im)
    bb = im.getchannel('A').getbbox()
    if bb:
        im = im.crop(bb)
    if im.height > h:
        im = im.resize((round(im.width * h / im.height), h), Image.LANCZOS)
    if im.width > h:
        im = im.resize((h, round(im.height * h / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, name), 'WEBP', quality=82, method=6)
    return cut


def save_wide(im, name, w=1600):
    im = im.convert('RGB')
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, name), 'WEBP', quality=78, method=6)


def slug(s):
    s = s.lower()
    for a, b in zip('çğıöşüâî', 'cgiosuai'):
        s = s.replace(a, b)
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')[:40]


def parse(pr):
    """Ürün kartı metninden marka, ad ve fiyatı ayıklar."""
    lines = [l.strip() for l in pr.get('text', []) if l.strip()]
    words = [l for l in lines if not NOISE.search(l) and not PRICE.search(l) and len(l) > 1]
    brand = name = ''
    if words:
        brand = words[0] if len(words[0]) <= 28 else ''
        rest = words[1:] if brand else words
        name = max(rest, key=len) if rest else ''
    if not name:
        name = pr.get('alt') or ''
    if brand and name.lower().startswith(brand.lower()):
        name = name[len(brand):].strip(' -')
    prices = pr.get('prices') or []
    # Birden çok fiyat varsa (eski/yeni) en düşüğü güncel fiyattır
    def val(p): return float(p.replace('.', '').replace(',', '.'))
    price = min(prices, key=val) if prices else ''
    return brand.strip(), name.strip()[:70], price


# --- Ürünler
products, used = [], set()
for pr in idx.get('products', []):
    im = open_img(pr.get('file', ''))
    if not im or min(im.size) < 180:
        continue
    brand, name, price = parse(pr)
    if not name:
        continue
    key = slug(brand + '-' + name)[:28] or f'p{len(products)}'
    if key in used:
        continue
    used.add(key)
    fn = f'p-{key}.webp'
    cut = save_product(im, fn)
    products.append(dict(key=key, brand=brand or 'Watsons', name=name, price=price, img=fn, url=pr['url'], page=pr.get('page', '/'), transparent=cut))
print(f'✔ {len(products)} ürün')

# --- Banner / kampanya görselleri (geniş)
wide = []
for s in idx.get('site', []) + idx.get('cdx', []):
    im = open_img(s.get('file', ''))
    if not im:
        continue
    w, h = im.size
    if w >= 700 and w / h >= 1.6:
        wide.append((w * h, s, im))
wide.sort(key=lambda x: -x[0])
heroes = []
for k, (_, s, im) in enumerate(wide[:14]):
    fn = f'h-{k}.webp'
    save_wide(im, fn)
    heroes.append(dict(img=fn, page=s.get('page', ''), alt=s.get('alt', ''), src=s.get('original') or s.get('src')))
print(f'✔ {len(heroes)} banner')
if not heroes:
    sys.exit('Banner bulunamadı – assets/index.json içeriğini kontrol edin')

# --- Kategoriler: sayfa adresinden; kapak = o sayfanın en büyük geniş görseli
cats = []
for key, name, pat in CATS:
    pages = [p for p in idx.get('pages', []) if re.search(pat, p['path'])]
    page = pages[0]['path'] if pages else None
    ps = [p['key'] for p in products if page and p['page'] == page]
    hero = next((h['img'] for h in heroes if page and h['page'] == page), None)
    if not ps and not hero:
        continue
    cats.append(dict(key=key, name=name, url=(page or '/'), img=hero or heroes[len(cats) % len(heroes)]['img'], products=ps[:6] or [p['key'] for p in products[len(cats) * 3:len(cats) * 3 + 3]]))
print(f'✔ {len(cats)} kategori')

# --- Logo: beyaz ve renkli
logo = None
for l in idx.get('logos', []):
    f = os.path.join(ROOT, l['file'])
    if f.endswith('.svg') and os.path.exists(f):
        logo = f; break
    im = open_img(l['file'])
    if im and im.width / max(1, im.height) > 2:
        logo = im; break
if manual.get('logo'):
    logo = os.path.join(ROOT, manual['logo'])
if isinstance(logo, str):
    # SVG → PNG (Chromium ile) – tools/svg2png.js
    os.system(f'NODE_PATH=$(npm root -g) node "{os.path.join(ROOT, "tools", "svg2png.js")}" "{logo}" "{os.path.join(OUT, "_logo.png")}"')
    logo = Image.open(os.path.join(OUT, '_logo.png')).convert('RGBA')
    os.remove(os.path.join(OUT, '_logo.png'))
if logo is None:
    sys.exit('Logo bulunamadı')
logo, _ = cut_white(logo)
bb = logo.getchannel('A').getbbox()
logo = logo.crop(bb)
logo.thumbnail((440, 120))
a = logo.getchannel('A')
Image.merge('RGBA', (*Image.new('RGB', logo.size, (255, 255, 255)).split(), a)).save(os.path.join(OUT, 'logo-w.webp'), 'WEBP', quality=90)
logo.save(os.path.join(OUT, 'logo-c.webp'), 'WEBP', quality=90)
print('✔ logo')

# Ürün sırası: fiyatı ve şeffaf fonu olanlar önce, markalar karışık
products.sort(key=lambda p: (not p['transparent'], not p['price']))
mixed, seenb = [], {}
for p in products:
    seenb[p['brand']] = seenb.get(p['brand'], 0) + 1
    mixed.append((seenb[p['brand']], p))
products = [p for _, p in sorted(mixed, key=lambda x: x[0])]
if manual.get('order'):
    order = manual['order']
    products.sort(key=lambda p: order.index(p['key']) if p['key'] in order else 999)

json.dump(dict(products=products, cats=cats, heroes=[h['img'] for h in heroes], heroInfo=heroes), open(os.path.join(OUT, 'selection.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('✔ assets/ads/selection.json')
