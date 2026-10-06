# Splash Digital – Yeni Site Kurulum Kılavuzu

Yüklenecek klasör: **`splashdigital-site/`** (içindekilerin tamamı, gizli `.htaccess` dosyası dahil).

## 0. Önce yedek alın (çok önemli)
Mevcut hosting panelinden **tam yedek** alın (cPanel → Yedekleme → Tam Yedek İndir; veritabanı dahil).
WordPress sitenin herkese açık içeriği ve tüm medya dosyaları ayrıca bu depoda `mevcut-site-yedek/` klasöründe saklanıyor
(sayfalar, WordPress içerik verisi `wp-json/`, 280+ medya dosyası, ekran görüntüleri).

## 1. Hosting
- Paket: **Limitsiz Plus**, işletim sistemi **Linux** (Windows değil – `.htaccess` yalnızca Linux/LiteSpeed'de çalışır).
- **Ücretsiz SSL**'i panelden etkinleştirin.

## 2. DNS – e-postalar Google Workspace'te kalmalı
Alan adını yeni hosting'e yönlendirirken **yalnızca web kayıtlarını (A / CNAME `www`) değiştirin.**
**MX kayıtlarına dokunmayın**; Google Workspace MX kayıtları (`smtp.google.com` veya `aspmx.l.google.com` vb.) aynen kalmalı.
Hosting firması "DNS'i bize taşıyın" derse, taşımadan önce mevcut MX, TXT (SPF, DKIM `google._domainkey`, DMARC) kayıtlarını not alıp yeni DNS'e birebir ekleyin.

İletişim formunun Gmail'de spam'e düşmemesi için SPF kaydına hosting sunucusunu ekleyin:
```
v=spf1 include:_spf.google.com include:<hosting-firmasinin-spf-adresi> ~all
```

## 3. Dosyaları yükleme
1. Panel → Dosya Yöneticisi → `public_html`.
2. Eski WordPress dosyalarını silin (yedek aldıktan sonra).
3. `splashdigital-site` klasörünün **içindekileri** `public_html` içine yükleyin (zip olarak yükleyip panelde açmak en hızlısıdır).
   `public_html/index.html`, `public_html/.htaccess`, `public_html/assets/...` şeklinde olmalı.
4. Dosya yöneticisinde "gizli dosyaları göster" açıkken `.htaccess` dosyasının yüklendiğini kontrol edin.

## 4. Kontrol listesi
- [ ] `https://www.splashdigital.com.tr` açılıyor, kilit simgesi var
- [ ] `https://www.splashdigital.com.tr/markalarimiz/` → sayfadaki Markalar bölümüne yönleniyor
- [ ] İletişim formundan test mesajı gönderin → sales@ ve umut@ adreslerine ulaşmalı (spam klasörünü de kontrol edin)
- [ ] Portfolyo PDF iniyor
- [ ] Google Search Console'da `sitemap.xml` gönderin

## Güncelleme
- Proje eklemek: görseli `splashdigital-site/assets/img/projects/` içine koyun, `tools/splash-projects.json` dosyasına satır ekleyin,
  `python3 tools/splash-build.py` (site) ve `python3 tools/splash-portfolio.py && node tools/splash-portfolio-pdf.js` (PDF) çalıştırın.
- Marka eklemek: logoyu `splashdigital-site/assets/img/brands/` içine koyup `python3 tools/splash-build.py`.
- Metinler doğrudan `splashdigital-site/index.html` içinde düzenlenebilir.
