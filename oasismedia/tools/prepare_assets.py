"""oasismedia/source (GitHub Actions ile indirilen orijinal site) içinden yeni site için
logo, müşteri/partner logoları ve proje görsellerini seçip WebP'ye çevirir; site/data.js üretir.
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


if OUT.exists():
    shutil.rmtree(OUT)

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

# Projeler: başlık + video bağlantısı + kapak görseli (Revolution Slider katmanlarından)
h = page('projelerimiz')
img, title, order = {}, {}, []
for m in re.finditer(r'<a\b([^>]*)>(.*?)</a>', h, re.S):
    attrs, inner = m.groups()
    href = re.search(r'href="([^"]+)"', attrs)
    if not href or 'rs-layer' not in attrs:
        continue
    href = href.group(1)
    bg = re.search(r"url\('//oasismedia\.com\.tr/wp-content/uploads/([^']+)'\)", inner)
    if bg:
        img.setdefault(href, bg.group(1))
    else:
        t = html.unescape(re.sub('<[^>]+>', '', inner)).strip()
        if t and href not in title:
            title[href] = t
            order.append(href)

# Öne çıkan 6 proje (ana sayfadaki büyük kartlar)
featured_imgs = {'BEYMEN': 'beymen-genz-1.jpg', 'ING': 'ING.webp', 'LAV': 'LAV.jpg',
                 'TURKCELL': 'Tcell.jpg', 'RENAULT': 'renault.jpg', 'NOTE': 'Note.jpg'}
featured_links = {'ING': 'banners/ing/banner.html', 'LAV': 'banners/lav/banner.html'}


NAMES = {'BEYMEN': 'Beymen', 'ING': 'ING', 'LAV': 'LAV', 'TURKCELL': 'Turkcell', 'RENAULT': 'Renault',
         'NOTE': 'Note Kozmetik', 'ADIDAS': 'Adidas', 'BAYER': 'Bayer', 'BOBBİ BROWN': 'Bobbi Brown',
         'BLACK BRUIN': 'Black Bruin', 'CARREFOURSA': 'CarrefourSA', 'CHERY': 'Chery', 'ETİ LİFALİF': 'Eti Lifalif',
         'CHERY LANSMAN': 'Chery Lansman', 'ETS MAXX ROYAL': 'ETS Maxx Royal', 'GARANTİ BANKASI': 'Garanti BBVA',
         'KARACA PATİ': 'Karaca Pati', 'GOLF MARAŞIM': 'Golf Maraşım', 'KOLPAÇİNO': 'Kolpaçino', 'NESTLE': 'Nestlé',
         'MİELE': 'Miele', 'NİSSAN': 'Nissan', 'SARIYER KOLA': 'Sarıyer Kola', 'TAFF': 'TAFF', 'ŞÖLEN': 'Şölen',
         'TATİL DÜKKANI': 'Tatil Dükkanı', 'TİCİMAX': 'Ticimax', 'TRENDYOL': 'Trendyol', 'TÜRK TELEKOM': 'Türk Telekom',
         'VAKKO': 'Vakko'}


def fmt_kind(video):
    v = video.replace('%CC%87', '').replace('I+nteraktif', 'Interaktif')
    for k, label in [('Gravity', 'Gravity'), ('Rich+Media', 'Rich Media'), ('Video+Masthead', 'Video Masthead'),
                     ('Masthead', 'İnteraktif Masthead')]:
        if k in v:
            return label
    return 'İnteraktif'


projects, seen = [], set()
for name, file in featured_imgs.items():
    href = next((x for x in order if title[x] == name), None)
    out = to_webp(find(file), OUT / 'projects' / f'{name.lower()}.webp', 900, 80)
    link = featured_links.get(name) or href
    projects.append({'brand': NAMES[name], 'title': 'Oasis & ' + NAMES[name],
                     'image': f'assets/projects/{out.name}', 'link': link,
                     'type': 'banner' if name in featured_links else 'video',
                     'kind': 'Canlı Banner (970×250)' if name in featured_links else fmt_kind(href or ''),
                     'featured': True})
    seen.add(name)

for href in order:
    t = title[href]
    if t in seen or not img.get(href) or href in [p['link'] for p in projects]:
        continue
    seen.add(t)
    brand = NAMES.get(t.replace('OASİS & ', '').strip(), t.replace('OASİS & ', '').strip())
    file = img[href].split('/')[-1]
    slug = re.sub(r'[^a-z0-9]+', '-', file.rsplit('.', 1)[0].lower()).strip('-') or 'proje'
    out = to_webp(find(file), OUT / 'projects' / f'{slug}.webp', 900, 80)
    projects.append({'brand': brand, 'title': 'Oasis & ' + brand, 'image': f'assets/projects/{out.name}',
                     'link': href, 'type': 'video', 'kind': fmt_kind(href), 'featured': False})

# İnteraktif bannerlar (ING, LAV) — sitedeki orijinal 970x250 HTML5 dosyaları
for b in ('ing', 'lav'):
    d = ROOT / 'site' / 'banners' / b
    d.mkdir(parents=True, exist_ok=True)
    src_html = (SRC / 'wp-content' / 'uploads' / '2025' / b / 'banner.html').read_text(errors='ignore')
    # Cloudflare'in sayfaya enjekte ettiği challenge betiğini çıkar (yeni sunucuda 404 verir)
    src_html = re.sub(r"<script>\(function\(\)\{function c\(\).*?</script>", '', src_html, flags=re.S)
    # Enabler.js (Google Studio) yüklenemezse banner boş kalmasın: olayları hemen tetikleyen küçük bir yedek
    shim = ('<script>if(!window.Enabler){(function(){var noop=function(){},ev=function(n){return n};'
            'var S=new Proxy({},{get:function(t,k){return String(k).toLowerCase()}});'
            'window.studio={events:{StudioEvent:S},module:{ModuleId:S},sdk:{gdn:{getConfig:function(){return{}}}},'
            'video:{Reporter:{attach:noop,detach:noop}},Enabler:{setRushSimulatedLocalEvents:noop}};'
            'var base={addEventListener:function(e,f){if(/init|page|visible/.test(e))setTimeout(f,0)},'
            'isInitialized:function(){return true},isPageLoaded:function(){return true},isVisible:function(){return true},'
            'isServingInLiveEnvironment:function(){return false},loadModule:function(m,f){f&&setTimeout(f,0)},'
            'getUrl:ev,exit:function(n,u){if(u)window.open(u,"_blank")},exitOverride:function(n,u){if(u)window.open(u,"_blank")},'
            'queryFullscreenSupport:noop};'
            'window.Enabler=new Proxy(base,{get:function(t,k){return k in t?t[k]:noop}})})()}</script>')
    src_html = re.sub(r'(<script[^>]+Enabler\.js[^>]*>\s*</script>)', lambda m: m.group(1) + shim, src_html, count=1)
    (d / 'banner.html').write_text(src_html)
    # banner'ın görsel/video dosyaları (mirror iş akışı aynı klasöre indirir)
    for asset in (SRC / 'wp-content' / 'uploads' / '2025' / b).iterdir():
        if asset.suffix.lower() in ('.png', '.jpg', '.jpeg', '.mp4', '.webm', '.webp', '.gif', '.svg'):
            shutil.copy(asset, d / asset.name)

data = {'clients': clients, 'partners': partners, 'projects': projects}
(ROOT / 'site' / 'js' / 'data.js').parent.mkdir(parents=True, exist_ok=True)
(ROOT / 'site' / 'js' / 'data.js').write_text(
    '// tools/prepare_assets.py tarafından üretildi — orijinal siteden alınan müşteri, partner ve proje listesi\n'
    'window.OASIS_DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
print(len(clients), 'müşteri,', len(partners), 'partner,', len(projects), 'proje')
