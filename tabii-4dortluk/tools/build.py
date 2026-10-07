#!/usr/bin/env python3
"""tabii 4Dörtlük masthead derleyici.

src/masthead.html şablonundaki /*SHOWS*/ yerine afiş verisini yazar; afişler
assets/site/posters/ altından okunur, WebP'ye küçültülür ve base64 gömülür.
Çıktı: 970x250/index.html (tek dosya).

Kullanım: python3 tabii-4dortluk/tools/build.py [--w=184] [--q=60]
"""
import base64, io, json, os, sys
from PIL import Image

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
args = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--') and '=' in a)
W = int(args.get('w', 184)); H = round(W * 1.5); Q = int(args.get('q', 60))

# Gösterim sırası = otomatik döngü sırası. g: tür (0 Dram, 1 Aksiyon, 2 Komedi, 3 Gizem, 4 Dönem)
# m: kartta türün yanında görünen not. Tür eşleşmeleri yayın öncesi marka ile teyit edilmeli.
SHOWS = [
    ('Persona', 3, 'Yeni sezon'),
    ('Gassal', 0, '3. sezon'),
    ('Siyah Bere', 1, 'tabii orijinal'),
    ('Kız Babası', 2, 'tabii orijinal'),
    ('Mevlânâ Celâleddîn-i Rûmî', 4, '3. sezon'),
    ('Marnalı', 1, 'tabii orijinal'),
    ('Çırak', 0, 'tabii orijinal'),
    ('Son Gün', 3, 'tabii orijinal'),
    ('Yeşil Deniz Milenyum', 2, '3. sezon'),
    ('Hay Sultan', 4, 'Yeni sezon'),
    ('Yankı: İkinci Perde', 1, 'Yeni sezon'),
    ('Rüya Gibi İstanbul', 0, 'tabii orijinal'),
    ('Yüzde İki', 2, '2. sezon'),
]

pdir = os.path.join(ROOT, 'assets', 'site', 'posters')
meta = {p['alt']: p for p in json.load(open(os.path.join(pdir, 'posters.json'), encoding='utf-8')) if p.get('alt')}
out, total = [], 0
for title, g, m in SHOWS:
    p = meta[title]
    im = Image.open(os.path.join(pdir, p['file'])).convert('RGB')
    # 2:3 kırp, sonra küçült
    w, h = im.size; tw = min(w, round(h / 1.5)); th = round(tw * 1.5)
    im = im.crop(((w - tw) // 2, (h - th) // 2, (w - tw) // 2 + tw, (h - th) // 2 + th)).resize((W, H), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=Q, method=6); b = buf.getvalue(); total += len(b)
    out.append({'t': title, 'g': g, 'm': m, 'u': p.get('href'), 'img': 'data:image/webp;base64,' + base64.b64encode(b).decode()})

tpl = open(os.path.join(ROOT, 'src', 'masthead.html'), encoding='utf-8').read()
html = tpl.replace('/*SHOWS*/[]', json.dumps(out, ensure_ascii=False, separators=(',', ':')))
dst = os.path.join(ROOT, '970x250', 'index.html')
open(dst, 'w', encoding='utf-8').write(html)
print(f'{len(out)} afiş, görseller {total // 1024} KB, index.html {len(html.encode()) // 1024} KB ({W}x{H}, q{Q})')
