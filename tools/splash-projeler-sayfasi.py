#!/usr/bin/env python3
"""Proje PDF'ini (kaynak/projeler.pdf) web sayfasına çevirir.

- Her PDF sayfası assets/img/projeler/sayfa-XX.jpg olarak üretilir (pdftoppm).
- PDF içindeki bağlantılar ("Çalışma için tıklayınız" vb.) görsellerin üzerine tıklanabilir alan olarak yerleştirilir.
- Sonuç: splashdigital-site/projeler.html (tamamen statik; indirme yok, her tarayıcıda ve yerelde çalışır).

Kullanım: yeni PDF'i kaynak/projeler.pdf olarak kaydedip  python3 tools/splash-projeler-sayfasi.py
"""
import glob
import html
import os
import subprocess

from pypdf import PdfReader

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'splashdigital-site')
PDF = os.path.join(ROOT, 'kaynak', 'projeler.pdf')
OUT_DIR = os.path.join(SITE, 'assets', 'img', 'projeler')
TEMPLATE = os.path.join(SITE, 'projeler.html')
WIDTH = 1600

os.makedirs(OUT_DIR, exist_ok=True)
for f in glob.glob(os.path.join(OUT_DIR, 'sayfa-*.jpg')):
    os.remove(f)

subprocess.run(['pdftoppm', '-jpeg', '-jpegopt', 'quality=80,progressive=y,optimize=y', '-scale-to-x', str(WIDTH), '-scale-to-y', '-1',
                PDF, os.path.join(OUT_DIR, 'tmp')], check=True)
files = sorted(glob.glob(os.path.join(OUT_DIR, 'tmp-*.jpg')))
for i, f in enumerate(files, 1):
    os.rename(f, os.path.join(OUT_DIR, f'sayfa-{i:02d}.jpg'))

reader = PdfReader(PDF)
figs = []
total_links = 0
for i, page in enumerate(reader.pages, 1):
    box = page.mediabox
    x0, y0, w, h = float(box.left), float(box.bottom), float(box.width), float(box.height)
    links = []
    for ref in page.get('/Annots') or []:
        a = ref.get_object()
        if a.get('/Subtype') != '/Link':
            continue
        act = a.get('/A')
        act = act.get_object() if act is not None else None
        uri = act.get('/URI') if act is not None else None
        if not uri:
            continue
        r = [float(v) for v in a['/Rect']]
        lx, rx = sorted((r[0], r[2]))
        by, ty = sorted((r[1], r[3]))
        left, top = (lx - x0) / w * 100, (h - (ty - y0)) / h * 100
        links.append(f'<a class="lnk" href="{html.escape(str(uri))}" target="_blank" rel="noopener" title="Çalışmayı aç" '
                     f'style="left:{left:.2f}%;top:{top:.2f}%;width:{(rx - lx) / w * 100:.2f}%;height:{(ty - by) / h * 100:.2f}%"></a>')
    total_links += len(links)
    loading = 'eager' if i <= 2 else 'lazy'
    figs.append(f'      <figure class="pg" id="s{i}" style="aspect-ratio:{w:.0f}/{h:.0f}">'
                f'<img src="assets/img/projeler/sayfa-{i:02d}.jpg" alt="Proje örnekleri – sayfa {i}" loading="{loading}" decoding="async" width="{WIDTH}" height="{round(WIDTH * h / w)}">'
                + ''.join(links) + '</figure>')

src = open(TEMPLATE, encoding='utf-8').read()
start = src.index('<!--SAYFALAR-->') + len('<!--SAYFALAR-->')
end = src.index('<!--/SAYFALAR-->')
src = src[:start] + '\n' + '\n'.join(figs) + '\n      ' + src[end:]
src = src.replace('data-total="', 'data-total="', 1)
import re
src = re.sub(r'data-total="\d*"', f'data-total="{len(figs)}"', src)
open(TEMPLATE, 'w', encoding='utf-8').write(src)
size = sum(os.path.getsize(f) for f in glob.glob(os.path.join(OUT_DIR, '*.jpg')))
print(f'{len(figs)} sayfa, {total_links} bağlantı, görseller {size / 1e6:.1f} MB')
