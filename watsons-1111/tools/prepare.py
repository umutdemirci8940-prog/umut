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
    ('makyaj', 'Makyaj', r'^/makyaj/c/'), ('cilt', 'Cilt Bakım', r'^/cilt-bakim/'), ('sac', 'Saç Bakım', r'^/sac-bakim/'),
    ('parfum', 'Parfüm', r'^/parfum/'), ('kisisel', 'Kişisel Bakım', r'^/kisisel-bakim/'), ('erkek', 'Erkek Bakım', r'^/erkek-bakim/'),
    ('kbeauty', 'K-Beauty', r'^/k-beauty/'), ('saglik', 'Sağlıklı Yaşam', r'^/saglikli-yasam/'), ('sadece', "Sadece Watsons'ta", r'^/sadece-watsonsta/'),
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


def prices_of(pr):
    lines = [l.strip() for l in pr.get('text', []) if l.strip()]
    club = next((PRICE.search(l).group(1) for l in lines if re.search(r'club', l, re.I) and PRICE.search(l)), '')
    price = next((PRICE.search(l).group(1) for l in lines if PRICE.search(l) and not re.search(r'club', l, re.I)), '')
    return price, club


BRANDS = []  # sitedeki "Popüler Markalar" listesi + sık görülen markalar (en uzun eşleşme kazanır)
try:
    t = open(os.path.join(A, 'html', 'home.txt'), encoding='utf-8').read()
    BRANDS = [l.strip() for l in t.split('POPÜLER MARKALAR', 1)[1].split('\n')[1:80] if 1 < len(l.strip()) < 30]
except Exception:
    pass
BRANDS += ["L'Oreal Paris", "L'Oréal Paris", 'Maybelline New York', 'Maybelline', 'Revolution', 'Makeup Revolution', 'Nyx Professional Makeup',
           'NYX Professional Makeup', 'Flormar', 'Golden Rose', 'Pastel', 'Essence', 'Catrice', 'Nivea', 'Garnier', 'La Roche-Posay', 'CeraVe',
           'Vichy', 'Bioderma', 'The Purest Solutions', 'Pure Beauty', 'Unfilter Beauty', 'Tırtır', 'Tirtir', 'Cosrx', 'Frudia', 'Neutrogena',
           'Elseve', 'Pantene', 'Head & Shoulders', 'OGX', 'Watsons', 'Rexona', 'Dove', 'Gillette', 'Oral-B', 'Colgate', 'Bourjois', 'Rimmel',
           'Note', 'Benefit', 'Clinique', 'Estee Lauder', 'Calvin Klein', 'Hugo Boss', 'Versace', 'Carolina Herrera', 'Paco Rabanne', 'Lancome']
BRANDS = sorted(set(BRANDS), key=len, reverse=True)


def norm(t):
    return re.sub(r'[^a-z0-9]', '', t.lower().replace('é', 'e').replace('ı', 'i').replace('İ', 'i').replace('ö', 'o').replace('ü', 'u').replace('ş', 's').replace('ç', 'c').replace('ğ', 'g'))


def parse(pr):
    """Ürün kartı metninden marka, ad, fiyat ve Watsons Club fiyatını ayıklar."""
    alt = re.sub(r'\s+', ' ', pr.get('alt') or '').strip()
    m = re.match(r'^(.+?) \1 (?:EXC\. )?(.+)$', alt)
    if m:
        bu, full = m.group(1), m.group(2)
        words, nb = full.split(' '), len(bu.split(' '))
        # Ürün adının başındaki marka yazımını kullan (L'Oreal Paris); uymuyorsa büyük harf markayı düzelt
        for k in range(1, len(words)):
            if norm(' '.join(words[:k])) == norm(bu):
                return ' '.join(words[:k]), ' '.join(words[k:])[:70], *prices_of(pr)
        return bu.title(), full[:70], *prices_of(pr)
    lines = [l.strip() for l in pr.get('text', []) if l.strip()]
    price, club = prices_of(pr)
    words = [l for l in lines if not PRICE.search(l) and not NOISE.search(l) and len(l) > 3]
    full = max(words, key=len) if words else (pr.get('alt') or '')
    brand = next((b for b in BRANDS if full.lower().startswith(b.lower())), '')
    name = full[len(brand):].strip(' -') if brand else full
    if not brand and full:
        brand = full.split(' ')[0]
        name = full[len(brand):].strip()
    return brand.strip(), name.strip()[:70], price, club


# --- Ürünler
products, used = [], set()
SKIP_PAGES = re.compile(r'saglikli-yasam')  # 11.11 güzellik masthead'ine uygun olmayan ürünler (prezervatif vb.)
for pr in idx.get('products', []):
    if SKIP_PAGES.search(pr.get('page', '')):
        continue
    im = open_img((pr.get('hd') or {}).get('file') or pr.get('file', ''))
    if not im or min(im.size) < 180:
        continue
    brand, name, price, club = parse(pr)
    # Marka devamı adın başında kalmışsa markaya al (Maybelline + New York, Nyx + Professional Makeup)
    for tail in ('New York', 'Professional Makeup', 'Paris'):
        if name.startswith(tail + ' '):
            brand, name = f'{brand} {tail}', name[len(tail) + 1:]
    if brand == 'Nyx Professional Makeup': brand = 'NYX Professional Makeup'
    if name.startswith("L'Oreal Paris "): name = name[len("L'Oreal Paris "):]
    if name.lower().startswith(brand.lower() + ' '): name = name[len(brand) + 1:]
    if not name:
        continue
    bp = re.search(r'BP_(\d+)', pr['url'])
    key = bp.group(1) if bp else slug(brand + '-' + name)[:28]
    if key in used:
        continue
    used.add(key)
    fn = f'p-{key}.webp'
    cut = save_product(im, fn)
    products.append(dict(key=key, brand=brand or 'Watsons', name=name, price=price, club=club, img=fn, url=pr['url'], page=pr.get('page', '/'), transparent=cut, hd=bool(pr.get('hd'))))
print(f'✔ {len(products)} ürün')

# --- Banner / kampanya görselleri (geniş)
wide = []
for s in idx.get('lifestyle', []) + idx.get('site', []) + idx.get('cdx', []):
    im = open_img(s.get('file', ''))
    if not im:
        continue
    w, h = im.size
    if w >= 700 and w / h >= 1.6 and h >= 150:
        wide.append(((s in idx.get('lifestyle', [])) * 1e9 + w * h, s, im))
wide.sort(key=lambda x: -x[0])
# Arka planlar yalnızca üzerinde kampanya yazısı olmayan yaşam tarzı görsellerinden seçilir (manual.json → heroes ile
# elle de verilebilir). Kampanya bannerları (üstünde başka bir kampanyanın metni var) arka plan yapılmaz.
life = set(x['file'] for x in idx.get('lifestyle', []))
heroes = []
for k, (_, s, im) in enumerate([x for x in wide if x[1]['file'] in life or x[1]['file'] in manual.get('heroes', [])][:10]):
    fn = f'h-{k}.webp'
    save_wide(im, fn)
    heroes.append(dict(img=fn, page=s.get('page', ''), alt=s.get('alt', ''), src=s.get('original') or s.get('src')))
print(f'✔ {len(heroes)} yaşam tarzı arka planı')

def collage(keys, fn, size=(1600, 500), bg=(255, 255, 255)):
    """Sitedeki ürün fotoğraflarından raf/vitrin kolajı (vektör değil, gerçek ürün görselleri)."""
    W, H = size
    c = Image.new('RGB', size, bg)
    ims = [Image.open(os.path.join(OUT, f'p-{k}.webp')).convert('RGBA') for k in keys]
    n = len(ims)
    if not n:
        return
    cols = min(n, 8)
    rows = (n + cols - 1) // cols
    cw, ch = W // cols, H // rows
    for i, im in enumerate(ims):
        im = im.copy(); im.thumbnail((int(cw * .82), int(ch * .82)))
        x = (i % cols) * cw + (cw - im.width) // 2 + (12 if (i // cols) % 2 else -12)
        y = (i // cols) * ch + (ch - im.height) // 2
        c.paste(im, (x, y), im)
    c.save(os.path.join(OUT, fn), 'WEBP', quality=76, method=6)


# --- Kategoriler: sayfa adresinden; kapak = o sayfanın en büyük geniş görseli
cats = []
for key, name, pat in CATS:
    pages = [p for p in idx.get('pages', []) if re.search(pat, p['path'])]
    page = pages[0]['path'] if pages else None
    ps = [p['key'] for p in products if page and p['page'] == page]
    hero = next((h['img'] for h in heroes if page and h['page'] == page), None)
    if not ps:
        continue
    cfn = f'c-{key}.webp'
    collage(ps[:6], cfn, (900, 600), (244, 251, 252))
    cats.append(dict(key=key, name=name, url=(page or '/'), img=hero or cfn, products=ps[:6]))
print(f'✔ {len(cats)} kategori')

# --- Logo: beyaz ve renkli
logo = None
lw = next((x for x in idx.get('site', []) if 'logowatsons' in (x.get('original') or '')), None)
if lw:
    im = open_img(lw['file'])
    # Görselin solunda turkuaz "watsons" plakası, sağında AS Watson 185. yıl rozeti var: plakayı kırp
    px = im.load(); w, h = im.size
    cols = [x for x in range(w) if any(px[x, y][3] > 20 and px[x, y][2] > 120 and px[x, y][0] < 90 for y in range(h))]
    if cols:
        x1 = cols[0]
        while x1 < w - 1 and (x1 + 1) in set(cols): x1 += 1
        logo = im.crop((cols[0], 0, x1 + 1, h))
for l in ([] if logo else idx.get('logos', [])):
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
logo.save(os.path.join(OUT, 'logo-c.webp'), 'WEBP', quality=92)  # turkuaz plaka + beyaz yazı (sitedeki hali)
# Beyaz sürüm: plakanın içindeki beyaz "watsons" yazısı (koyu/turkuaz zeminler için)
px = logo.load(); w, h = logo.size
wt = Image.new('RGBA', logo.size, (255, 255, 255, 0)); q = wt.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a > 0 and min(r, g, b) > 150:
            q[x, y] = (255, 255, 255, min(255, int((min(r, g, b) - 150) * 2.5)))
bb = wt.getchannel('A').getbbox()
wt.crop(bb).save(os.path.join(OUT, 'logo-w.webp'), 'WEBP', quality=92)
print('✔ logo')

# Ürün sırası: fiyatı ve şeffaf fonu olanlar önce, markalar karışık
products.sort(key=lambda p: (not p['hd'], not p['transparent'], not p['price']))
mixed, seenb = [], {}
for i, p in enumerate(products):
    seenb[p['brand']] = seenb.get(p['brand'], 0) + 1
    mixed.append(((not p['hd'], seenb[p['brand']], i), p))
products = [p for _, p in sorted(mixed, key=lambda x: x[0])]
if manual.get('order'):
    order = manual['order']
    products.sort(key=lambda p: order.index(p['key']) if p['key'] in order else 999)

if len(heroes) < 2:
    for k in range(2 - len(heroes)):
        fn = f'h-kolaj-{k}.webp'
        collage([p['key'] for p in products if p['transparent']][k * 16:k * 16 + 16], fn)
        heroes.append(dict(img=fn, page='kolaj', alt='Ürün kolajı', src=''))
    print(f'✔ {len(heroes)} arka plan (ürün kolajı dahil)')

json.dump(dict(products=products, cats=cats, heroes=[h['img'] for h in heroes], heroInfo=heroes), open(os.path.join(OUT, 'selection.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('✔ assets/ads/selection.json')
