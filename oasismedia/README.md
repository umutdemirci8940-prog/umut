# Oasis Media — yeni web sitesi

[oasismedia.com.tr](https://oasismedia.com.tr/) için yeniden tasarlanan site: **"Vaha yolculuğu"**.
Sayfanın arkasında tam ekran bir 3D sahne var: su üzerinde batan, logodaki gibi çizgili güneş, palmiyeli adacıklar,
ışığı yansıtan dalgalı su. Ziyaretçi kaydırdıkça kamera vahanın içinde ilerler; her bölüm yolculuğun bir durağıdır.
Tüm metinler, logo, 145 müşteri logosu, 24 yayıncı partner logosu ve iletişim bilgileri orijinal siteden alınmıştır.

```
oasismedia/
├── site/                     ← yayına alınacak klasör (statik; herhangi bir hostinge kopyalanabilir)
│   ├── index.html
│   ├── css/style.css
│   ├── js/scene.js           ← 3D vaha sahnesi (three.js; klasik betik, file:// ile de çalışır)
│   ├── js/logo-data.js       ← 3D sahne için gömülü logo görselleri (otomatik üretilir)
│   ├── js/main.js            ← açılış, menü, hizmet sekmeleri, PDF kapağı, form
│   ├── js/data.js            ← müşteri / partner listesi (otomatik üretilir)
│   ├── assets/               ← logo, favicon, WebP müşteri/partner logoları
│   ├── assets/pdf/           ← oasis-media-calismalar.pdf (Projeler bölümündeki sunum)
│   ├── vendor/three/         ← three.js 0.160.0 UMD (MIT)
│   └── vendor/pdfjs/         ← PDF.js 3.11.174 (Apache-2.0) — PDF kapağına ilk sayfayı çizer
├── source/                   ← GitHub Actions ile indirilen orijinal sitenin kopyası (+ content.json)
└── tools/prepare_assets.py   ← source/ → site/assets ve js/data.js
```

## Yolculuğun durakları

| Durak | 3D sahnede |
|---|---|
| Açılış | Güneş sudan doğar, "oasis media" harfleri zıplar; logolar yüklenirken çubuk dolar (oturum başına bir kez, "Geç" ile atlanır) |
| Ufuk (hero) | Güneş ve palmiyeler; fareyle kamera hafifçe süzülür |
| Hakkımızda | Kamera adaların arasından ilerler |
| Rakamlar | 300+ / 2K+ / 10 / 145 sırayla sudan yükselir, suya yansır, geri batar |
| Hizmetlerimiz / Projelerimiz | Cam paneller; Projeler'de PDF sunum yeni sekmede açılır |
| Müşterilerimiz | 145 logo suyun üstünde yüzen kartlar; üzerine gelince kart yükselir ve marka adı görünür |
| İş ortaklarımız | 24 yayıncı partner, ışık sütunu etrafında dönen halka |
| İletişim | Kamera güneşe varır |

WebGL desteklemeyen cihazlarda sayfa gökyüzü–su degradesi üzerinde düz içerikle çalışır (rakamlar ve partner logoları liste olarak görünür).
Hareket azaltma tercihi açıksa açılış atlanır ve sahne hareketsiz kalır.

## Önizleme

```bash
cd oasismedia/site && python3 -m http.server 8080   # http://localhost:8080
```

Site dosyaya çift tıklanarak (file://) açıldığında da 3D sahne ve tüm efektler çalışır; yalnızca PDF kapağına
ilk sayfanın çizilmesi sunucu gerektirir (kapak tasarımı görünür, bağlantı PDF'i yine açar).

## Efekt katmanı

Bulutlar, kuş sürüleri, güneşten kameraya düşen lens parlaması, film greni; fareyle büyüyüp etiket gösteren imleç,
mıknatıslı butonlar; kelime kelime bulanıklıktan netleşen başlıklar; fareyle 3D eğilen, ışık süzülen ve kenarında
dönen degrade ışık olan cam paneller; kaydırma hızıyla eğilen dev yazı şeritleri; sağ kenarda durak göstergesi;
yüzde sayan yükleme ekranı.

## Görselleri yenilemek

Bulut oturumu orijinal siteye erişemediği için içerik `.github/workflows/oasis-mirror.yml` ile GitHub sunucusunda indirilir ve
`oasismedia/source/` altına push'lanır. Ardından:

```bash
python3 -I oasismedia/tools/prepare_assets.py
```
