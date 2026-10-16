"""oasismedia/source (GitHub Actions ile indirilen orijinal site) içinden yeni site için
logo ile müşteri/partner logolarını seçip WebP'ye çevirir; site/data.js üretir.
Kullanım: python3 -I oasismedia/tools/prepare_assets.py
"""
import html, json, pathlib, re, shutil
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[1]
SRC = ROOT / 'source' / 'oasismedia.com.tr'
UP = ROOT / 'source' / 'uploads'
OUT = ROOT / 'site' / 'assets'


def find(name):
    """Dosyayı önce düz uploads klasöründe, sonra wget aynasında ara."""
    p = UP / name
    if p.exists():
        return p
    hits = list((SRC / 'wp-content' / 'uploads').rglob(name))
    return hits[0] if hits else None


def to_webp(src, dst, max_side, quality=82):
    im = Image.open(src)
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    im.thumbnail((max_side, max_side), Image.LANCZOS)
    if im.mode == 'RGBA':
        bbox = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
        if bbox:  # logoların etrafındaki boşluğu kırp
            im = im.crop(bbox)
    dst.parent.mkdir(parents=True, exist_ok=True)
    im.save(dst, 'WEBP', quality=quality, method=6)
    return dst


def page(path):
    return (SRC / path / 'index.html').read_text(errors='ignore')


if OUT.exists():  # PDF'ler elle eklenir; onları koru
    for d in OUT.iterdir():
        if d.name != 'pdf':
            shutil.rmtree(d)

# Logo (orijinal + favicon)
logo = UP / 'uyooo-300x149.png'
(OUT / 'brand').mkdir(parents=True)
# orijinal PNG'de logonun çevresinde düşük opaklıkta bir çerçeve var; temizleyip kırpıyoruz
im = Image.open(logo).convert('RGBA')
im.putalpha(im.getchannel('A').point(lambda a: 0 if a < 60 else a))
im = im.crop(im.getchannel('A').getbbox())
im.save(OUT / 'brand' / 'oasis-media-logo.png', optimize=True)
to_webp(OUT / 'brand' / 'oasis-media-logo.png', OUT / 'brand' / 'oasis-media-logo.webp', 600, 92)
shutil.copy(UP / 'cropped-uyooo-300x149-kopya-192x192.png', OUT / 'brand' / 'favicon-192.png')
shutil.copy(UP / 'cropped-uyooo-300x149-kopya-32x32.png', OUT / 'brand' / 'favicon-32.png')
shutil.copy(UP / 'cropped-uyooo-300x149-kopya-180x180.png', OUT / 'brand' / 'apple-touch-icon.png')

# Müşteriler (musterilerimiz sayfasındaki sırayla, alfabetik)
clients = []
for src in re.findall(r'uploads/2025/01/([^"\'/]+)-300x300\.png', page('musterilerimiz')):
    if src in [c['key'] for c in clients]:
        continue
    f = find(src + '.png') or find(src + '-300x300.png')
    out = to_webp(f, OUT / 'clients' / f'{src.lower()}.webp', 260, 85)
    entry = {'key': src, 'logo': f'assets/clients/{src.lower()}.webp'}
    # beyaz/açık renkli logolar beyaz kartta kaybolur: koyu kart işareti koy
    im = Image.open(out).convert('RGBA')
    raw = im.tobytes()
    px = [raw[k:k + 4] for k in range(0, len(raw), 4) if raw[k + 3] > 128]
    if px and sum(0.299 * r + 0.587 * g + 0.114 * b for r, g, b, _ in px) / len(px) > 205:
        entry['dark'] = True
    clients.append(entry)
clients.sort(key=lambda c: c['key'].lower())

# Yayıncı partnerler (iş ortaklarımız)
partners = []
for src in re.findall(r'uploads/2025/01/([^"\'/]+\.jpg)', page('is-ortaklarimiz')):
    key = src.rsplit('.', 1)[0]
    if re.search(r'-\d+x\d+$', key) or key in [p['key'] for p in partners]:
        continue
    to_webp(find(src), OUT / 'partners' / f'{key.lower()}.webp', 320, 85)
    partners.append({'key': key, 'logo': f'assets/partners/{key.lower()}.webp'})

# Projeler bölümü sitede PDF olarak sunulur (site/assets/pdf/), bu yüzden proje görselleri burada işlenmez.

data = {'clients': clients, 'partners': partners}
(ROOT / 'site' / 'js' / 'data.js').parent.mkdir(parents=True, exist_ok=True)
(ROOT / 'site' / 'js' / 'data.js').write_text(
    '// tools/prepare_assets.py tarafından üretildi — orijinal siteden alınan müşteri ve partner listesi\n'
    'window.OASIS_DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
print(len(clients), 'müşteri,', len(partners), 'partner')
