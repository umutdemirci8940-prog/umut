# Oasis Media — yeni web sitesi

[oasismedia.com.tr](https://oasismedia.com.tr/) için yeniden tasarlanan, animasyonlu açılışa sahip tek sayfalık site.
Tüm metinler, logo, 145 müşteri logosu, 24 yayıncı partner logosu, 30 proje (görsel + kampanya videosu),
ING ve LAV interaktif bannerları ve iletişim bilgileri orijinal siteden alınmıştır.

```
oasismedia/
├── site/                  ← yayına alınacak klasör (statik; herhangi bir hostinge kopyalanabilir)
│   ├── index.html
│   ├── css/style.css
│   ├── js/main.js         ← etkileşimler (bağımlılık yok)
│   ├── js/data.js         ← müşteri / partner / proje listesi (otomatik üretilir)
│   ├── assets/            ← logo, favicon, WebP'ye çevrilmiş logolar ve proje görselleri
│   └── banners/ing|lav/   ← sitedeki orijinal 970×250 HTML5 bannerlar
├── source/                ← GitHub Actions ile indirilen orijinal sitenin kopyası (+ content.json metin dökümü)
└── tools/prepare_assets.py← source/ → site/assets ve js/data.js
```

## Önizleme

```bash
cd oasismedia/site && python3 -m http.server 8080   # http://localhost:8080
```

## Bölümler ve etkileşimler

- **Açılış animasyonu:** logodaki güneş doğar, palmiye yaprağı açılır, "oasis media" harfleri zıplar,
  "300+ partner site bağlanıyor…" yükleme satırları akar. Oturum başına bir kez gösterilir; "Geç", Enter veya Esc ile atlanır.
  Hareket azaltma tercihi açıksa hiç gösterilmez.
- **Hero:** fareyle etkileşen canlı "yayıncı ağı" arka planı, paralaks reklam formatı çipleri (Masthead, 970×250, Gravity…),
  tıklanınca KPI baloncukları saçan güneş, artan kampanya erişimi kartı, mıknatıslı butonlar, özel imleç.
- **Hakkımızda:** orijinal metin, vizyon/misyon, sayaçlar (300+ site, 2K+ proje, 10 yıl, 145+ marka).
- **Hizmetlerimiz:** 6 hizmet sekmesi; her biri hizmet sayfasındaki tam metni gösterir (klavye okları ile gezilebilir).
- **Projelerimiz:** formata göre filtre (İnteraktif Masthead, Gravity, Rich Media…), 3B eğilen kartlar;
  tıklayınca kampanya videosu (orijinal S3 bağlantısı) ya da ING/LAV bannerı canlı açılır.
- **Müşterilerimiz:** üç sıra kayan logo şeridi + tüm listeyi açan ızgara.
- **İş ortaklarımız:** 24 yayıncı partner logosu.
- **İletişim:** adres (Google Maps bağlantısı), telefon, e-postalar (kopyala butonu), form (sales@oasismedia.com.tr'ye
  e-posta taslağı açar — sunucu tarafı form gerekirse `js/main.js` içindeki submit işleyicisi bir API'ye yönlendirilebilir).

## Görselleri yenilemek

Ağ politikası nedeniyle bulut oturumu orijinal siteye erişemediğinden içerik `.github/workflows/oasis-mirror.yml`
ile GitHub sunucusunda indirilir ve `oasismedia/source/` altına push'lanır. Ardından:

```bash
python3 -I oasismedia/tools/prepare_assets.py
```
