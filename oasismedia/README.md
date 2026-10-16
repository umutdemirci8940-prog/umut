# Oasis Media — yeni web sitesi

[oasismedia.com.tr](https://oasismedia.com.tr/) için yeniden tasarlanan, animasyonlu açılışa sahip tek sayfalık site.
Tüm metinler, logo, 145 müşteri logosu, 24 yayıncı partner logosu ve iletişim bilgileri orijinal siteden alınmıştır.
Projeler bölümü, markanın "İnteraktif & Rich Media Çalışmalar" PDF'ini site içinde önizler.

```
oasismedia/
├── site/                  ← yayına alınacak klasör (statik; herhangi bir hostinge kopyalanabilir)
│   ├── index.html
│   ├── css/style.css
│   ├── js/main.js         ← etkileşimler (bağımlılık yok)
│   ├── js/particles.js    ← WebGL parçacık sahnesi (bağımlılık yok)
│   ├── js/data.js         ← müşteri / partner / proje listesi (otomatik üretilir)
│   ├── assets/            ← logo, favicon, WebP'ye çevrilmiş müşteri/partner logoları
│   ├── assets/pdf/        ← oasis-media-calismalar.pdf (Projeler bölümünün önizlediği dosya)
│   └── vendor/pdfjs/      ← PDF.js 3.11.174 (PDF sayfalarını her cihazda site içinde çizer)
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
- **WebGL parçacık sahnesi:** 4.000–9.000 parçacık açılışta dağınık hâlden toplanıp logodaki güneşi (ufuk çizgileri ve
  palmiye yaprağıyla) oluşturur; fareyle itilir, güneşe tıklayınca patlar. Sayfa kaydıkça aynı parçacıklar
  "Rakamlarla Oasis" sahnesinde 300+ → 2K+ → 10 → 145 rakamlarına, iş ortaklarında dönen yayıncı ağı küresine,
  iletişimde dalgalanan vaha suyuna dönüşür. WebGL yoksa rakamlar düz metin olarak gösterilir.
- **Hakkımızda:** orijinal metin, vizyon/misyon, sayaçlar (300+ site, 2K+ proje, 10 yıl, 145+ marka).
- **Hizmetlerimiz:** 6 hizmet sekmesi; her biri hizmet sayfasındaki tam metni gösterir (klavye okları ile gezilebilir).
- **Projelerimiz:** PDF kapağı (ilk sayfa otomatik küçük resim olur, sayfa sayısı yazılır); tıklayınca tüm sayfalar
  site içindeki önizleme penceresinde açılır. PDF'i değiştirmek için `site/assets/pdf/oasis-media-calismalar.pdf`
  dosyasını aynı adla güncellemek yeterli.
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
