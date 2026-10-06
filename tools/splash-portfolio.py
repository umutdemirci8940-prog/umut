#!/usr/bin/env python3
"""Splash Digital PDF portfolyosu üretir.

Kullanım:  python3 tools/splash-portfolio.py && node tools/splash-portfolio-pdf.js
Çıktı:     portfolyo/splash-digital-portfolyo.pdf

Proje listesi tools/splash-projects.json, markalar ve iş ortakları
splashdigital-site/assets/img/ klasörlerinden okunur. Proje eklemek için JSON'u güncelleyip tekrar çalıştırın.
"""
import html
import json
import os
import importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SITE = os.path.join(ROOT, 'splashdigital-site')
IMG = os.path.join(SITE, 'assets', 'img')
OUT_HTML = os.path.join(HERE, 'portfolio', 'portfolyo.html')

spec = importlib.util.spec_from_file_location('b', os.path.join(HERE, 'splash-build.py'))
build = importlib.util.module_from_spec(spec)
spec.loader.exec_module(build)

e = html.escape
projects = json.load(open(os.path.join(HERE, 'splash-projects.json'), encoding='utf-8'))
brands = sorted(build.files('brands'), key=lambda f: build.name_of(f).lower())
partners = build.files('partners')


def img(rel):
    return 'file://' + os.path.join(IMG, rel)


def page(content, cls='', num=None, title=None):
    foot = ''
    if num is not None:
        foot = (f'<footer class="pf"><img src="{img("logo.png")}" alt=""><span>{e(title or "")}</span>'
                f'<span>splashdigital.com.tr · {num:02d}</span></footer>')
    return f'<section class="pg {cls}">{content}{foot}</section>'


SERVICES = [
    ('Veri Odaklı Stratejiler', 'Doğru mesajı doğru kitleye ulaştırmak için kullanıcı davranışlarını derinlemesine analiz ediyor; interaktif çözümler ve detaylı raporlamayla dönüşümleri artırıyoruz.'),
    ('Medya ve Reklam Planlama', 'Platform dinamiklerini analiz ederek farklı kanallar üzerinden hedef kitlenize en etkili şekilde ulaşan stratejik bir yol haritası oluşturuyoruz.'),
    ('Network & Üretim Hizmetleri', '300’ün üzerinde platform iş birliği ve Splash Network ile markanıza özel içerik üretip doğru mecralarda görünür kılıyoruz.'),
    ('Masaüstü ve Mobil Entegrasyonlar', 'Masaüstü ve mobil platformlarda kullanıcı dostu, ölçeklenebilir ve performans odaklı deneyimler geliştiriyoruz.'),
    ('Pazarlama ve Danışmanlık', 'Sektörel analizler, hedef kitle odaklı stratejiler ve veri destekli raporlamalarla büyüme yolculuğunuzda yanınızdayız.'),
    ('Yazılım Geliştirme', 'Kullanıcı dostu arayüzler ve yüksek performanslı altyapılarla işletmenize özel yazılım çözümleri geliştiriyoruz.'),
]
STEPS = [
    ('Ön Görüşme', 'Faaliyet alanınızı ve hedef pazarınızı analiz ediyoruz.'),
    ('Stratejik Planlama', 'İhtiyaç ve beklentilerinize göre kapsamlı bir yol haritası oluşturuyoruz.'),
    ('Uyarlama & Geliştirme', 'Marka kimliğinize uygun dijital çözümleri tasarlayıp uyguluyoruz.'),
    ('Kullanıcı Doğrulaması', 'Gerçek kullanıcı deneyimleriyle test ederek en iyi sonuca ulaştırıyoruz.'),
]


def kind(u):
    u = u.lower()
    return 'Video' if u.endswith('.mp4') else 'Display' if u.endswith(('.png', '.jpg', '.jpeg')) else 'Rich Media'


pages = []
n = 1

# 1 Kapak
pages.append(page(f'''
  <div class="cover">
    <svg class="cover__rings" viewBox="0 0 400 400"><defs><linearGradient id="cg" x1="0" x2="1"><stop offset="0" stop-color="#2bb6f5"/><stop offset=".5" stop-color="#127dc5"/><stop offset="1" stop-color="#6a7dff"/></linearGradient><radialGradient id="glow"><stop offset="0" stop-color="#2bb6f5" stop-opacity=".55"/><stop offset="1" stop-color="#2bb6f5" stop-opacity="0"/></radialGradient></defs><circle cx="200" cy="200" r="190" fill="none" stroke="rgba(125,227,255,.3)" stroke-width="1.5"/><circle cx="200" cy="200" r="140" fill="none" stroke="rgba(43,182,245,.45)" stroke-width="1.5"/><circle cx="200" cy="200" r="88" fill="none" stroke="rgba(125,227,255,.55)" stroke-width="1.5" stroke-dasharray="4 7"/><circle cx="200" cy="200" r="70" fill="url(#glow)"/><circle cx="200" cy="200" r="34" fill="url(#cg)"/></svg>
    <img class="cover__logo" src="{img("logo.png")}" alt="Splash Digital">
    <p class="eyebrow">Portfolyo · {2026}</p>
    <h1>Markanızı <span class="g">geleceğe taşıyan</span> dijital ajans.</h1>
    <p class="lead">Veri odaklı stratejiler, güçlü medya ağı ve etkileşimli kreatif çözümler.</p>
    <div class="cover__meta"><span>300+ platform iş birliği</span><span>140+ marka</span><span>25 seçili proje</span></div>
  </div>''', 'pg--dark'))
n += 1

# 2 Hakkımızda
pages.append(page(f'''
  <div class="two">
    <div>
      <p class="eyebrow">Hakkımızda</p>
      <h2>Eşsiz stratejilerle markanızı inşa ediyoruz.</h2>
      <p>Splash Digital olarak, dijital reklam ve medya alanında yenilikçi çözümler sunuyoruz. Geniş yayın ağı ve özel iş birliklerimiz sayesinde; <b>Finans, Teknoloji, Spor, Kadın, Otomotiv, Market</b> gibi farklı kategorilerde kampanyalar yürütmekteyiz.</p>
      <p>Markaların KPI’larına uygun hedeflemeler yaparak, her kampanyada maksimum verim ve etki sağlamayı hedefliyoruz. Çalışmalarımızı hassas ve özgün çözümlerle destekleyerek somut ve başarılı sonuçlar elde etmeyi amaçlıyoruz.</p>
      <div class="vm">
        <div><h4>Vizyonumuz</h4><p>Dijital dünyanın tüm olanaklarını kullanarak markalara hızlı, kaliteli ve yenilikçi çözümler sunan öncü bir iş ortağı olmak.</p></div>
        <div><h4>Misyonumuz</h4><p>Etik değerlere bağlı kalarak markaların hedeflerini en etkili şekilde gerçekleştirmek ve beklentilerin ötesinde çözümler sunmak.</p></div>
      </div>
    </div>
    <div class="aside">
      <img class="photo" src="{img("about.jpg")}" alt="">
      <div class="stats">
        <div><b>300+</b><span>Platform iş birliği</span></div>
        <div><b>140+</b><span>Çalıştığımız marka</span></div>
        <div><b>6</b><span>Sektör kategorisi</span></div>
        <div><b>6</b><span>Uzmanlık alanı</span></div>
      </div>
    </div>
  </div>''', '', n, 'Hakkımızda'))
n += 1

# 3 Hizmetler + süreç
svc = ''.join(f'<div class="svc"><span class="no">{i:02d}</span><h3>{e(t)}</h3><p>{e(d)}</p></div>' for i, (t, d) in enumerate(SERVICES, 1))
stp = ''.join(f'<div class="stp"><span>{i:02d}</span><h4>{e(t)}</h4><p>{e(d)}</p></div>' for i, (t, d) in enumerate(STEPS, 1))
pages.append(page(f'''
  <p class="eyebrow">Hizmetlerimiz</p>
  <h2>Sağladığımız çözümler</h2>
  <div class="svcs">{svc}</div>
  <p class="eyebrow mt">Nasıl çalışıyoruz?</p>
  <div class="stps">{stp}</div>''', '', n, 'Hizmetler'))
n += 1

# Projeler (sayfa başına 6)
per = 6
chunks = [projects[i:i + per] for i in range(0, len(projects), per)]
for ci, chunk in enumerate(chunks):
    cards = ''
    for p in chunk:
        cards += (f'<a class="prj" href="{e(p["u"])}"><div class="prj__img"><img src="{img("projects/" + p["i"])}" alt=""></div>'
                  f'<div class="prj__b"><span class="tag">{e(p["c"])} · {kind(p["u"])}</span><h3>{e(p["t"])}</h3>'
                  f'<span class="sub">{e(p["s"])}</span><span class="go">Canlı örneği aç ↗</span></div></a>')
    if len(chunk) < per:
        cards += ('<div class="prj prj--cta"><div><h3>Sıradaki başarı hikâyesi sizin olsun.</h3><p>Rich media, video ve display formatlarında markanıza özel kreatif çözümler için bizimle iletişime geçin. Tüm projelerimizi canlı olarak web sitemizde inceleyebilirsiniz.</p>'
                  '<a href="https://www.splashdigital.com.tr/#projeler">splashdigital.com.tr ↗</a></div></div>')
    head = ('<p class="eyebrow">Projelerimiz</p><h2>Özgün fikirlerle hayata geçen projeler</h2>'
            '<p class="hint">Görsellere tıklayarak her projenin canlı örneğini açabilirsiniz.</p>') if ci == 0 else \
           f'<p class="eyebrow">Projelerimiz · {ci + 1}/{len(chunks)}</p>'
    cls = ' prjs--first' if ci == 0 else (' prjs--last' if len(chunk) < per else '')
    pages.append(page(f'{head}<div class="prjs{cls}">{cards}</div>', '', n, 'Projeler'))
    n += 1

# Markalar
bl = ''.join(f'<div class="br"><img src="{img("brands/" + f)}" alt="{e(build.name_of(f))}"></div>' for f in brands)
pages.append(page(f'''
  <p class="eyebrow">Markalarımız</p>
  <h2>Bize güvenen markalar</h2>
  <div class="brs">{bl}</div>''', '', n, 'Markalar'))
n += 1

# İş ortakları + iletişim
pl = ''.join(f'<div class="pt"><img src="{img("partners/" + f)}" alt=""></div>' for f in partners)
pages.append(page(f'''
  <div class="last">
    <div>
      <p class="eyebrow">İş Ortaklarımız</p>
      <h2>İş ortaklarımızla geleceği birlikte şekillendiriyoruz</h2>
      <div class="pts">{pl}</div>
    </div>
    <div class="contact">
      <img class="cover__logo" src="{img("logo.png")}" alt="Splash Digital">
      <h2>Markanızı birlikte büyütelim.</h2>
      <ul>
        <li><b>Telefon</b><a href="tel:+905356055392">+90 535 605 53 92</a></li>
        <li><b>E-posta</b><a href="mailto:sales@splashdigital.com.tr">sales@splashdigital.com.tr</a><br><a href="mailto:umut@splashdigital.com.tr">umut@splashdigital.com.tr</a></li>
        <li><b>Adres</b><span>Tuna Mah. Tuna Cad. Mesa Kaptanlar Sitesi A Blok No:18 İç Kapı No:15, 34225 Esenler / İstanbul</span></li>
        <li><b>Web</b><a href="https://www.splashdigital.com.tr/">www.splashdigital.com.tr</a></li>
      </ul>
      <a class="btn" href="https://wa.me/905356055392">WhatsApp ile yazın ↗</a>
    </div>
  </div>''', 'pg--dark', n, 'İletişim'))

CSS = open(os.path.join(HERE, 'portfolio', 'portfolyo.css'), encoding='utf-8').read()
doc = f'''<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>Splash Digital – Portfolyo</title>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600&display=block" rel="stylesheet">
<style>{CSS}</style></head><body>{"".join(pages)}</body></html>'''
os.makedirs(os.path.dirname(OUT_HTML), exist_ok=True)
open(OUT_HTML, 'w', encoding='utf-8').write(doc)
print(f'{len(pages)} sayfa → {OUT_HTML}')
