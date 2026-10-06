#!/usr/bin/env python3
"""index.html içindeki <!--BRANDS--> ve <!--PARTNERS--> bölümlerini
assets/img/brands ve assets/img/partners klasörlerindeki görsellerden üretir.

Kullanım:  python3 tools/splash-build.py
Yeni marka eklemek için logoyu assets/img/brands/ içine koyup betiği tekrar çalıştırın.
Görünen adı değiştirmek için aşağıdaki NAMES sözlüğünü güncelleyin.
"""
import html
import json
import os
import re

ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'splashdigital-site')
INDEX = os.path.join(ROOT, 'index.html')
IMG_EXT = ('.png', '.jpg', '.jpeg', '.webp', '.svg')

NAMES = {
    'a90': 'A90', 'akbank': 'Akbank', 'albaraka': 'Albaraka', 'altinbas': 'Altınbaş', 'anabank': 'Anadolubank',
    'arcelik': 'Arçelik', 'arzum': 'Arzum', 'audi': 'Audi', 'aygaz': 'Aygaz', 'azkarbon': 'Az Karbon', 'bayer': 'Bayer',
    'bebelac': 'Bebelac', 'beko': 'Beko', 'beymen': 'Beymen', 'biletinial': 'Biletinial', 'bim': 'BİM', 'bmw': 'BMW',
    'bosch': 'Bosch', 'bparmak': 'Bal Parmak', 'brita': 'Brita', 'btoptan': 'Bizim Toptan', 'budget': 'Budget',
    'canped': 'Canped', 'caudalie': 'Caudalie', 'chery': 'Chery', 'civil': 'Civil', 'ck': 'Calvin Klein',
    'cocacola': 'Coca-Cola', 'corny': 'Corny', 'cs': 'CS', 'ct': 'CT', 'dacia': 'Dacia', 'danone': 'Danone',
    'dardanel': 'Dardanel', 'dermoskin': 'Dermoskin', 'disney': 'Disney', 'dogtas': 'Doğtaş', 'dogus': 'Doğuş',
    'droutker': 'Dr. Oetker', 'enza': 'Enza Home', 'este': 'Este', 'eti': 'Eti', 'ets': 'ETS Tur', 'evofone': 'Evofone',
    'fashfed': 'Fashfed', 'ferrero': 'Ferrero', 'fiat': 'Fiat', 'fiba': 'Fiba', 'fide': 'Fide', 'ford-trucks': 'Ford Trucks',
    'ford': 'Ford', 'fuzul': 'Fuzul', 'gbbva': 'Garanti BBVA', 'gizia': 'Gizia', 'golf': 'Golf', 'hemington': 'Hemington',
    'henkel': 'Henkel', 'herobaby': 'Hero Baby', 'hm': 'H&M', 'honda': 'Honda', 'hunnap': 'Hunnap', 'hyundai': 'Hyundai',
    'idas': 'İdaş', 'ing': 'ING', 'jaguar': 'Jaguar', 'jbl': 'JBL', 'karaca': 'Karaca', 'karcher': 'Kärcher',
    'kelebek': 'Kelebek', 'kt': 'KT', 'lova': 'Lova', 'lr': 'Land Rover', 'ltb': 'LTB', 'm-coco': 'M-Coco', 'mavi': 'Mavi',
    'mcard': 'Mastercard', 'mercedes': 'Mercedes-Benz', 'meta': 'Meta', 'metromarket': 'Metro Market', 'migros': 'Migros',
    'misli': 'Misli', 'mmmarket': 'MM Market', 'mondelez': 'Mondelez', 'ms': 'MS', 'neova': 'Neova', 'nesine': 'Nesine',
    'nestle': 'Nestlé', 'nisantasi': 'Nişantaşı', 'nkolay': 'N Kolay', 'note': 'Note', 'nutella': 'Nutella', 'obag': "O bag",
    'omix': 'Omix', 'pandora': 'Pandora', 'papara': 'Papara', 'parasut': 'Paraşüt', 'philips': 'Philips', 'pinar': 'Pınar',
    'qnb': 'QNB', 'ramsey': 'Ramsey', 'reno': 'Renault', 'saatsaat': 'Saat&Saat', 'sahibinden': 'sahibinden.com',
    'samsung': 'Samsung', 'sariyer': 'Sarıyer', 'seat': 'SEAT', 'setur': 'Setur', 'shell': 'Shell', 'siemens': 'Siemens',
    'sisecam': 'Şişecam', 'solgar': 'Solgar', 'tabii': 'tabii', 'tchibo': 'Tchibo', 'teb': 'TEB',
    'technomobile': 'Technomobile', 'tefal': 'Tefal', 'tekfen': 'Tekfen', 'teknosa': 'Teknosa', 'th': 'TH', 'tib': 'TİB',
    'ticimax': 'Ticimax', 'titanic': 'Titanic', 'troy': 'TROY', 'tt': 'Türk Telekom', 'turkcell': 'Turkcell',
    'turkiyefinans': 'Türkiye Finans', 'uludag': 'Uludağ', 'vestel': 'Vestel', 'vodafone': 'Vodafone', 'vw': 'Volkswagen',
    'warmhouse': 'Warmhouse', 'watsons': 'Watsons', 'weebaby': 'Wee Baby', 'xiaomi': 'Xiaomi', 'yvesrocher': 'Yves Rocher',
    'zen': 'Zen', 'allianz': 'Allianz', 'apple': 'Apple', 'borusan': 'Borusan', 'lufi': 'Lufi', 'pluxee': 'Pluxee',
    'sleepy': 'Sleepy', 'sompo': 'Sompo Sigorta',
}


def files(sub):
    d = os.path.join(ROOT, 'assets', 'img', sub)
    if not os.path.isdir(d):
        return []
    return sorted((f for f in os.listdir(d) if f.lower().endswith(IMG_EXT)), key=str.lower)


def name_of(f):
    stem = os.path.splitext(f)[0]
    return NAMES.get(stem.lower(), stem.replace('-', ' ').title())


def kind(url):
    u = url.lower()
    if u.endswith('.mp4'):
        return 'Video'
    if u.endswith(('.png', '.jpg', '.jpeg')):
        return 'Display'
    return 'Rich Media'


def projects():
    data = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'splash-projects.json'), encoding='utf-8'))
    out = []
    for i, p in enumerate(data):
        t, s, u = html.escape(p['t']), html.escape(p['s']), html.escape(p['u'])
        out.append(
            f'          <a class="work" href="{u}" target="_blank" rel="noopener" data-cursor="Gör">\n'
            f'            <div class="work__media"><img src="assets/img/projects/{html.escape(p["i"])}" alt="{t} – {s}" loading="lazy" width="900" height="600"></div>\n'
            f'            <div class="work__body"><span class="work__tag">{html.escape(p["c"])} · {kind(p["u"])}</span>'
            f'<h3>{t}</h3><span class="work__sub">{s}</span><span class="work__link">Projeyi Gör →</span></div>\n'
            f'          </a>')
    return '\n'.join(out), len(data)


def main():
    proj, nproj = projects()
    brands = files('brands')
    partners = files('partners')
    b = '\n'.join(
        f'          <figure class="brand"><img src="assets/img/brands/{html.escape(f)}" alt="{html.escape(name_of(f))}" '
        f'title="{html.escape(name_of(f))}" loading="lazy" width="120" height="120"></figure>'
        for f in sorted(brands, key=lambda f: name_of(f).lower())
    )
    p = '\n'.join(
        f'          <figure class="partner reveal"><img src="assets/img/partners/{html.escape(f)}" '
        f'alt="İş ortağı {i}" loading="lazy"></figure>'
        for i, f in enumerate(partners, 1)
    )
    src = open(INDEX, encoding='utf-8').read()
    src = re.sub(r'(<div class="brands" id="brandGrid">\n).*?(\n\s*</div>\n\s*<div class="brands__more">)',
                 lambda m: m.group(1) + (b or '<!--BRANDS-->') + m.group(2), src, flags=re.S)
    src = re.sub(r'(<div class="partners">\n).*?(\n\s*</div>\n\s*</div>\n\s*</section>)',
                 lambda m: m.group(1) + (p or '<!--PARTNERS-->') + m.group(2), src, count=1, flags=re.S)
    src = re.sub(r'(<div class="works" id="workGrid">\n).*?(\n\s*</div>\n\s*<div class="works__more">)',
                 lambda m: m.group(1) + proj + m.group(2), src, flags=re.S)
    open(INDEX, 'w', encoding='utf-8').write(src)
    print(f'{nproj} proje yazıldı.')
    print(f'{len(brands)} marka, {len(partners)} iş ortağı yazıldı.')


if __name__ == '__main__':
    main()
