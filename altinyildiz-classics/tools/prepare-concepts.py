#!/usr/bin/env python3
"""concepts/<id>/images.json → assets/concepts/<id>/<key>.webp
Her görsel: { "src": "<raw klasörü>/<dosya no>", "crop": [x0,y0,x1,y1] (0-1 oran), "size": [w,h], "q": kalite }
Kaynaklar altinyildizclassics.com'dan çekilen ham görsellerdir (assets/raw*/img). Vektör kullanılmaz.
Kullanım: python3 tools/prepare-concepts.py [konsept-id]
"""
import glob, json, os, sys
from PIL import Image, ImageFilter, ImageEnhance

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
only = sys.argv[1:] 
for cdir in sorted(glob.glob(os.path.join(ROOT, 'concepts', '*'))):
    cid = os.path.basename(cdir)
    spec = os.path.join(cdir, 'images.json')
    if not os.path.exists(spec) or (only and cid not in only): continue
    out = os.path.join(ROOT, 'assets', 'concepts', cid)
    os.makedirs(out, exist_ok=True)
    total = 0
    for key, s in json.load(open(spec)).items():
        folder, num = s['src'].split('/')
        src = glob.glob(os.path.join(ROOT, 'assets', folder, 'img', num + '-*'))[0]
        im = Image.open(src).convert('RGB')
        W, H = im.size
        x0, y0, x1, y1 = s.get('crop', [0, 0, 1, 1])
        im = im.crop((round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H)))
        im = im.resize(tuple(s['size']), Image.LANCZOS)
        if s.get('frost'):  # buğulu cam katmanı: aynı fotoğrafın bulanık, açık tonlu raster kopyası
            im = im.filter(ImageFilter.GaussianBlur(s['frost']))
            im = ImageEnhance.Color(im).enhance(0.55)
            im = Image.blend(im, Image.new('RGB', im.size, (232, 236, 239)), 0.62)
            im = im.filter(ImageFilter.GaussianBlur(4))
        f = os.path.join(out, key + '.webp')
        im.save(f, 'WEBP', quality=s.get('q', 70), method=6)
        total += os.path.getsize(f)
    print(f'{cid:24} {total / 1024:6.1f} KB')
