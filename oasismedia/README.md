# Oasis Media — yeni web sitesi

[oasismedia.com.tr](https://oasismedia.com.tr/) için yeniden tasarlanan site: **"Sıvı sinyal"**.
Açık porselen zemin üzerinde, sayfa boyunca ziyaretçiyi takip eden sedef renkli sıvı metal 3D obje; dev genişletilmiş
tipografi; kaydırmayla çalışan sabitlenmiş bölümler. Tüm metinler, logo, 145 müşteri logosu, 24 yayıncı partner logosu
ve iletişim bilgileri orijinal siteden alınmıştır.

```
oasismedia/
├── site/                     ← yayına alınacak klasör (statik; herhangi bir hostinge kopyalanabilir)
│   ├── index.html
│   ├── css/style.css
│   ├── js/blob.js            ← sıvı metal 3D obje (three.js; klasik betik, file:// ile de çalışır)
│   ├── js/main.js            ← yükleme ekranı, imleç, manifesto, yatay hizmetler, logo duvarı, partner halkası, form
│   ├── js/data.js            ← müşteri / partner listesi (otomatik üretilir)
│   ├── assets/               ← logo, favicon, WebP müşteri/partner logoları
│   ├── assets/pdf/           ← oasis-media-calismalar.pdf (Projeler bölümündeki sunum)
│   ├── vendor/three/         ← three.js 0.160.0 UMD (MIT)
│   └── vendor/pdfjs/         ← PDF.js 3.11.174 (Apache-2.0) — PDF kapağına ilk sayfayı çizer
├── source/                   ← GitHub Actions ile indirilen orijinal sitenin kopyası (+ content.json)
└── tools/prepare_assets.py   ← source/ → site/assets ve js/data.js
```

## Kurgu

| Bölüm | Ne olur |
|---|---|
| Yükleme | Lacivert perde, dev yüzde sayacı (0→100), perde yukarı kalkar (oturum başına bir kez) |
| Hero | Başlık harf harf yükselir; sağda sıvı obje fareye tepki verip şişer, tıklayınca dalga yayılır; kategori şeridi akar |
| Manifesto | Ekran sabitlenir, Hakkımızda metni kaydırdıkça kelime kelime yanar; anahtar kelimeler degrade renk alır |
| Rakamlar | 300+ / 2K+ / 10 / 145 editoryal ızgarada sayarak gelir |
| Hizmetler | Ekran sabitken 6 hizmet kartı yatay akar; kart üzerine gelince koyulaşır, numara turuncu dolar |
| Projeler | Üst üste duran sunum kartları, üzerine gelince yelpaze gibi açılır; PDF yeni sekmede açılır |
| Müşteriler | 145 logo ızgarası; imleci izleyen spot ışık, üzerine gelince logo renklenir ve adı görünür |
| İş ortakları | 24 yayıncı logosu 3D dönen halkada |
| İletişim | Dev başlık, büyük e-posta, çizgi tarzı form, mıknatıslı yuvarlak gönder butonu |
| Altbilgi | Degrade dev "oasis media" yazısı |

Sıvı obje her bölümde yer, boyut, dalga karakteri ve renk değiştirir; kaydırma hızı dalgayı büyütür. Özel imleç,
mıknatıslı butonlar, eğilen kartlar ve film greni bütün sayfada vardır. WebGL yoksa obje hariç her şey çalışır;
hareket azaltma tercihinde animasyonlar kapanır.

## Önizleme

```bash
cd oasismedia/site && python3 -m http.server 8080   # http://localhost:8080
```

Site dosyaya çift tıklanarak (file://) açıldığında da 3D sahne ve tüm efektler çalışır; yalnızca PDF kapağına
ilk sayfanın çizilmesi sunucu gerektirir (kapak tasarımı görünür, bağlantı PDF'i yine açar).

## Görselleri yenilemek

Bulut oturumu orijinal siteye erişemediği için içerik `.github/workflows/oasis-mirror.yml` ile GitHub sunucusunda indirilir ve
`oasismedia/source/` altına push'lanır. Ardından:

```bash
python3 -I oasismedia/tools/prepare_assets.py
```
