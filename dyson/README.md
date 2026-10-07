# Dyson – Etkileşimli Masthead (970 × 250)

Dyson Türkiye için iki ayrı, birbirinden bağımsız **970×250 Billboard** masthead. Her biri kendi `index.html` dosyasındadır, tek bir ürünü anlatır ve **dyson.com.tr'deki orijinal ürün fotoğraflarını** kullanır.

| Masthead | Dosya | Tıklama adresi | Paket |
|---|---|---|---|
| Saç bakımı – Dyson Supersonic Nural™ | `dist/haircare/index.html` | https://www.dyson.com.tr/products/hair-care | `dist/zip/dyson-haircare-970x250.zip` (filmli, 775 KB) · `…-lite.zip` (51 KB) |
| Kablosuz süpürge – Dyson V12 Detect™ Slim | `dist/cordfree/index.html` | https://www.dyson.com.tr/products/cord-free | `dist/zip/dyson-cordfree-970x250.zip` (filmli, 1,3 MB) · `…-lite.zip` (39 KB) |

**Tek dosyalık teslim:** `teslim/haircare/index.html` ve `teslim/cordfree/index.html` – film dahil her şey dosyanın içinde, çift tıklayınca tarayıcıda çalışır.

Tıklama adresleri **parametresizdir** (UTM / takip parametresi yok). İkisini yan yana görmek için: `preview/index.html`.

## Ekran görüntüleri

| Saç bakımı | Kablosuz süpürge |
|---|---|
| ![](preview/screens/haircare-1-acilis.jpg) | ![](preview/screens/cordfree-1-lazerle-supur.jpg) |
| ![](preview/screens/haircare-2-yogunlastirici-hotspot.jpg) | ![](preview/screens/cordfree-2-yakindan-incele.jpg) |
| ![](preview/screens/haircare-3-difuzor-soguk.jpg) | ![](preview/screens/cordfree-3-film.jpg) |

## Etkileşimler

**Saç bakımı (Supersonic Nural™ – Erik/Bakır, orijinal fotoğraf)**
- Ürün fotoğrafı imlece ve sürüklemeye göre hafif 3D eğilir; üzerinde gezen ışık yansıması vardır.
- **Isı ayarı** (Soğuk 28°C / Düşük 60°C / Orta 80°C / Yüksek 100°C): hava çıkış halkasından fışkıran hava akışının ve ısıtıcı ışığının rengi değişir.
- **Manyetik başlıklar** – setteki 5 başlığın orijinal fotoğrafları (Yoğunlaştırıcı, Difüzör, Geniş dişli tarak, Nazik hava, Kabarma önleyici): seçilen başlık vitrine "manyetik" olarak oturur, hava akışının biçimi değişir.
- **Saç derisi koruma (Nural™)**: imleç halkaya (başa) yaklaştıkça sıcaklık göstergesi otomatik düşer.
- **Özellik noktaları (+)** fotoğrafın üzerinde: Air Multiplier™, akıllı ısı kontrolü, Nural™ sensör, Hyperdymium™ motor, çıkarılabilir filtre.

**Kablosuz süpürge (V12 Detect™ Slim, orijinal fotoğraf)**
- **Lazerle süpür**: süpürge zeminde imleci (mobilde parmağı) takip eder; başlıktaki yeşil lazer görünmeyen tozu ortaya çıkarır, başlık tozu emer. Dokunulmazsa kendiliğinden gezinir.
- **Piezo sensör sayacı**: toplanan partiküller boyutlarına göre (>180µm … 10–20µm) canlı sayılır.
- **Eko / Otomatik / Boost**: emiş genişliği değişir.
- **Yakından incele**: fotoğraf büyür, eğilebilir; lazer, piezo sensör, LCD, motor, batarya, HEPA noktaları.

**Ortak**
- **Film**: dyson.com.tr kategori sayfalarındaki resmi filmler ("▶ Filmi izleyin"), masthead içinde açılır.
- Harici kütüphane yoktur (2D canvas + CSS 3D); filmsiz paketler 40–50 KB'tır.
- Klavye ile gezinme, `Esc` ile kapatma, `prefers-reduced-motion` desteği; ekranda değilken çizim durur.

## Siteden alınan materyaller

Bulut ortamının ağ politikası dyson.com.tr'ye izin vermediği için materyaller GitHub Actions üzerinde gerçek bir Chromium ile indirildi (`.github/workflows/dyson-assets.yml`, `tools/fetch-dyson-assets.js`). Ham çıktı `assets/raw/` altındadır (görseller, filmler, `index.json` içinde kaynak URL ve alt metinleri).

Kullanılanlar (`assets/selection.json` → `assets/selected/`):
- Saç bakımı: `plp-updated-hairdryers` filmi (11 sn) + filmden poster/küçük görsel; sayfadaki Supersonic Nural™ "Erik/Bakır" rengi.
- Kablosuz süpürge: `PLP-Cordfree_MegaEdit` filmi (19 sn) + lazer başlık karesinden poster/küçük görsel; sayfada öne çıkan V12 Detect™ Slim.

Ürün fotoğrafları Dyson'ın görsel sunucusundan şeffaf PNG olarak alınır (`tools/fetch-dyson-products.js` → `assets/products/`): Supersonic Nural™ seti (492345) ve V12 Detect™ Slim (494876). `tools/cut-products.py` ana ürünü ve başlıkları ayırır, fotoğraftaki hazır tozu/aksesuarları temizler ve WebP olarak `assets/cut/` altına kaydeder.

## Derleme

```bash
cd dyson
npm install                    # esbuild
python3 tools/cut-products.py  # (fotoğraflar değişirse) ürün/başlık kesimleri
node build.mjs                 # dist/haircare, dist/cordfree, dist/zip/*, teslim/*
node tools/capture.mjs # ekran görüntüleri + etkileşim testi (Playwright + Chromium)
```

Kaynaklar: `src/data.js` (metinler, adresler, özellik kartları ve fotoğraf üzerindeki konumları, başlıklar), `src/main.js` (efektler ve etkileşim), `src/template.html` (yerleşim ve stil).

## Yayın notları

- **Boyut:** filmsiz zip'ler 39–51 KB'tır; Google Ads'in 150 KB HTML5 sınırının rahatça altındadır. Filmli sürümler (video `media/film.mp4`) doğrudan yayıncı alımları, DV360 / CM360 rich media gibi daha geniş sınırlı yerleşimler içindir.
- **clickTag:** her dosyada `var clickTag = "<parametresiz adres>"` tanımlıdır; reklam sunucusu kendi değerini atarsa o kullanılır. Studio'da `Enabler` varsa `Enabler.exit` çağrılır.
- **Yazı tipi:** Google Fonts – Jost (Dyson'ın Futura çizgisine yakın). Harici font kabul etmeyen ağlarda `@font-face` ile gömülebilir.
- **Ürün iddiaları** (110.000 / 125.000 rpm, saniyede 40'tan fazla sıcaklık ölçümü, saniyede 15.000 partikül sayımı, %99,99 / 0,3 mikron, 60 dk) Dyson'ın kamuya açık ürün bilgilerine dayanır; yayın öncesi marka onayı önerilir. Isı derece değerleri Supersonic ailesinin resmi kademeleridir.
