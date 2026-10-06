#!/usr/bin/env python3
"""mevcut-site-yedek/ içindeki orijinal görselleri optimize edip splashdigital-site/assets/img/ altına kopyalar."""
import os, re, glob
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BK = os.path.join(ROOT, 'mevcut-site-yedek')
UP = os.path.join(BK, 'medya', 'wp-content', 'uploads')
DST = os.path.join(ROOT, 'splashdigital-site', 'assets', 'img')


def save(src, dst, max_w, fmt=None, quality=82):
    im = Image.open(src)
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if dst.endswith('.jpg'):
        if im.mode in ('RGBA', 'LA', 'P'):
            im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[-1]); im = bg
        im.convert('RGB').save(dst, quality=quality, optimize=True, progressive=True)
    else:
        im.save(dst, optimize=True)


def page(name):
    return open(os.path.join(BK, 'site', 'www.splashdigital.com.tr', name, 'index.html'), encoding='utf-8', errors='ignore').read()


# Logo
save(os.path.join(UP, '2025/09/Splash-Logo-1.png'), os.path.join(DST, 'logo.png'), 440)
save(os.path.join(UP, '2025/09/Splash-Logo.png'), os.path.join(DST, 'logo-kare.png'), 512)

# Hakkımızda görseli
save(os.path.join(UP, '2025/09/Basliksiz-1.jpg'), os.path.join(DST, 'about.jpg'), 1100)

# Markalar (markalarimiz sayfasındaki sıra ve dosyalar)
brands = []
for m in re.findall(r'uploads/(2025/10/[A-Za-z0-9_-]+?)(?:-\d+x\d+)?\.png', page('markalarimiz')):
    if m not in brands:
        brands.append(m)
for b in brands:
    src = os.path.join(UP, b + '.png')
    if os.path.isfile(src):
        save(src, os.path.join(DST, 'brands', os.path.basename(b).lower() + '.png'), 240)
print(len(brands), 'marka')

# İş ortakları
partners = []
for m in re.findall(r'uploads/(2025/09/[A-Za-z0-9_-]+?)(?:-\d+x\d+)?\.jpg', page('is-ortaklarimiz')):
    if m not in partners and 'Basliksiz-1' not in m:
        partners.append(m)
for i, p in enumerate(partners, 1):
    src = os.path.join(UP, p + '.jpg')
    if os.path.isfile(src):
        save(src, os.path.join(DST, 'partners', f'is-ortagi-{i:02d}.jpg'), 420)
print(len(partners), 'iş ortağı')

# Proje görselleri
for f in glob.glob(os.path.join(UP, '2025/10/*')):
    n = os.path.basename(f)
    if n.lower().split('.')[0] in ('hondacrv', 'pegasus', 'banvit', 'cook', 'renault', 'hondacivic', 'ilacsiz-yasam', 'notekozmetik',
                                   'elidor', 'suryapi-1', 'baymak', 'purina', 'terra-pizza', 'fellas', 'yves-rocher', 'hondanx500',
                                   'watsons', 'nivea', 'lego') and not re.search(r'-\d+x\d+\.', n):
        save(f, os.path.join(DST, 'projects', os.path.splitext(n)[0].lower() + '.jpg'), 900)
print(len(os.listdir(os.path.join(DST, 'projects'))), 'proje görseli')

# Sosyal paylaşım görseli
im = Image.new('RGB', (1200, 630), (6, 16, 31))
logo = Image.open(os.path.join(UP, '2025/09/Splash-Logo-1.png')).convert('RGBA')
logo = logo.resize((760, round(logo.height * 760 / logo.width)), Image.LANCZOS)
im.paste(logo, ((1200 - logo.width) // 2, (630 - logo.height) // 2), logo)
im.save(os.path.join(DST, 'og-image.jpg'), quality=85)
