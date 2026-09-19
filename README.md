# KFC Türkiye – "Kepenkler Yeniden Açılıyor" 970×250 İnteraktif Banner

[kfcturkiye.com](https://www.kfcturkiye.com/) için hazırlanmış, **şubelerin yeniden açılışını** anlatan tek dosyalık, animasyonlu ve etkileşimli HTML5 billboard (970×250).

**Teslim:** `release/kfc-970x250.html` (tek dosya, tüm görsel/video/fontlar gömülü; açınca yalnızca 970×250 çalışma görünür) · `release/kfc-970x250.zip` (reklam ağına yüklenecek `index.html`) · `dist/kfc-970x250/index-linked.html` (varlıkları gömmek yerine doğrudan sitedeki adreslerden yükleyen sürüm).

## Kurgu

1. **Kepenk (0–1,4 sn)** – Metal dükkân kepengi kapalı; asılı tabela sallanır ve **KAPALI → AÇIK** olarak 3 boyutlu döner. Alt kulp "Kepengi kaldır" diye nabız atar: kullanıcı kulpu yukarı sürükleyerek (ya da tıklayarak) kepengi kendisi açabilir; dokunmazsa kepenk kendiliğinden yukarı sarılır.
2. **Açılış (1,4–2,4 sn)** – Kepenk makaraya sarılırken sıcak bir ışık parlaması ve kısa bir sarsıntı; arkada sitenin restoran fotoğrafı belirir.
3. **Başlık (2,4 sn)** – Logo iner, "BU LEZZETİ ÖZLEDİN Mİ?" ve harf harf sıçrayan "KFC GERİ DÖNDÜ!" gelir.
4. **Damga (3,2 sn)** – "YENİDEN AÇILDI" damgası toz bulutuyla vurulur.
5. **Ürünler (3,6 sn)** – Sitedeki gerçek ürün fotoğrafları sağdan derinlik sırasıyla uçar, üstlerinde buhar tüter; alt satır ve şehir çipleri + "En yakın KFC'yi bul" çağrısı gelir.
6. **Son kare (5–14 sn)** – Fotoğraf yavaşça yakınlaşır, şehir çipleri (İstanbul · Ankara · İzmir) sırayla vurgulanır, CTA'da ışık süpürmesi; ardından kepenk iner ve kurgu yeniden başlar. Üç döngü sonunda son karede durur, "Tekrar izle" düğmesi çıkar.

## Etkileşim

- **Kepengi sürükleme:** Kulp ya da kepengin herhangi bir yeri yukarı sürüklenince kepenk elle kalkar (60 px'i geçince açılır, yoksa geri düşer). Tıklama da açar.
- **Paralaks:** Fare hareketiyle video, ürünler (derinliğe göre) ve damga farklı hızlarda kayar.
- **Ürün üzerine gelme:** Ürün büyür, parlar, altında adı belirir.
- **Şehir çipleri:** Üzerine gelince o şehir seçilir (otomatik dönüş 3 sn durur); ← → tuşları da gezdirir.
- **Tıklama:** Bannerın tamamı tıklanabilir. `window.clickTag` tanımlıysa o kullanılır, `Enabler` varsa `Enabler.exit`, yoksa `src/kfc/data.js` içindeki UTM'li restoran bulucu sayfası açılır. Kepenk ve "Tekrar izle" tıklamayı yutar.
- Klavye: Enter tıklar, boşluk kepengi açar. `prefers-reduced-motion` açıksa doğrudan son kare gösterilir.

## Teknik

- Tek HTML, satır içi CSS/JS; görseller, video ve fontlar base64 gömülü (harici istek yok). `<meta name="ad.size">`, `role="link"`, aria etiketi ve klavye odağı var.
- Tipografi: sitenin kendi fontları *National 2 Condensed* (başlık, damga, tabela) ve *National 2* (metin, CTA), base64 gömülü. Site fontu yoksa `tools/fetch-fonts.js` ile indirilen *Anton* + *Inter* kullanılır.
- Arka plan: sitenin restoran fotoğrafı, yavaş yakınlaşma ve paralaks ile; video verilirse `<video muted autoplay loop playsinline>` olarak eklenir, oynatılamazsa fotoğraf kalır. Buhar efekti SVG `feTurbulence` + `feDisplacementMap` ile.
- Tek dosya ~715 KB (görseller + 3 font gömülü). Reklam ağlarının 150 KB sınırı gözetilmedi (etkileşimli sunum parçası); gerekirse ürün görselleri WebP'ye çevrilerek küçültülebilir.

## Varlıklar nereden geliyor?

Claude Code'un bulut oturumu **ve** GitHub Actions sunucuları kfcturkiye.com'a erişemedi (site Türkiye dışına 403 döndürüyor). Bu yüzden `tools/fetch-kfc.js` GitHub Actions'ta çalışırken önce siteyi ve alternatif alan adlarını dener; erişemezse **Wayback Machine** (web.archive.org) CDX dizininden sitenin arşivlenmiş görsel, video, logo ve fontlarını listeleyip ham (`id_`) kopyalarını indirir ve `assets/kfc/` altına push'lar. Her dosyanın orijinal site adresi `assets/kfc/manifest.json` içindedir. Bannerda kullanılanlar:

| Öğe | Sitedeki kaynak |
|---|---|
| Restoran fotoğrafı (kepenk açılınca) | `kfcturkiye.com/img/about-image-2.jpg` (Hakkımızda sayfası) |
| Ürün kesitleri | Menü sayfalarındaki şeffaf PNG'ler: *Kanatlandıran Kova*, *Double Zinger Burger*, *8'li Hot Wings* (`/_next/image?url=…/product/img/…`) |
| Logo | `kfcturkiye.com/img/og-image-logo.jpg` (beyaz fon şeffaflaştırıldı → `assets/kfc-derived/logo-wordmark.png`) |
| Fontlar | Sitenin kendi fontları *National 2 Condensed Bold*, *National 2 Bold/Medium* (`/_next/static/media/…woff2`) |
| Kicker metni | Sitenin açılış öncesi görselindeki "Bu lezzeti özledin mi?" cümlesi |

> Sitede ve arşivinde **video bulunmuyor** (CDX dizininde 0 video kaydı); bu yüzden arka plan sitenin fotoğrafıyla yavaş yakınlaşma (Ken Burns) olarak kurgulandı. Şablon video destekler: `src/kfc/data.js` → `assets.video.file` verilirse `<video>` olarak gömülür.
>
> `index-linked.html` varlıkları sitedeki adreslerden yükler; site Türkiye dışından açılmadığı ve `_next` adresleri dağıtımla değişebildiği için bu sürüm yalnızca Türkiye içinden ve güncel sitede çalışır. Teslim dosyası gömülü sürümdür.

```bash
# GitHub → Actions → "Siteden görselleri çek ve derle" → Run workflow   (assets/kfc/ güncellenir)
node build-kfc.js                                  # dist/kfc-970x250/ + release/kfc-970x250.html/.zip
NODE_PATH=$(npm root -g) node tools/capture-kfc.js --video   # preview/kfc/ ekran görüntüleri + etkileşim testi
```

Metinler, şehirler, süreler, tıklama adresi ve ürün seçimi/konumları: **`src/kfc/data.js`**. Ekran görüntüleri ve kısa kayıt: `preview/kfc/` (`kfc-970x250.webm`).

| Kepenk | Son kare |
|---|---|
| ![kepenk](preview/kfc/00-kepenk.jpg) | ![son kare](preview/kfc/06-son-kare.jpg) |

---

# İlaçsız Yaşam – Gıda Takviyesi Banner Serisi

[ilacsizyasam.com](https://ilacsizyasam.com/) için hazırlanmış, gıda takviyeleri özelinde **animasyonlu, ürün slider'lı ve tıklanabilir HTML5 display reklam seti**.

| Boyut | IAB adı | Dosya | Paket |
|---|---|---|---|
| 300 × 250 | Medium Rectangle | `dist/300x250/index.html` | `dist/zip/ilacsizyasam-300x250.zip` |
| 300 × 600 | Half Page | `dist/300x600/index.html` | `dist/zip/ilacsizyasam-300x600.zip` |
| 970 × 250 | Billboard | `dist/970x250/index.html` | `dist/zip/ilacsizyasam-970x250.zip` |

Tek dosyalık teslim: `release/index.html` (üç banner içine gömülü; açınca doğrudan animasyonlu çalışır, her bannerın kendi index.html'i sayfadan indirilir). Sunum sayfası: `preview/index.html` (üç boyutu bir arada gösterir; "Yayın simülasyonu" görünümü bannerları örnek bir haber sayfası içinde konumlandırır).

## Ekran görüntüleri

| 970 × 250 – ürün kartı | 970 × 250 – kapanış |
|---|---|
| ![970x250 ürün](preview/screens/970x250-slide1.jpg) | ![970x250 kapanış](preview/screens/970x250-outro.jpg) |

| 300 × 250 – açılış | 300 × 250 – ürün kartı | 300 × 250 – kapanış |
|---|---|---|
| ![300x250 açılış](preview/screens/300x250-intro.jpg) | ![300x250 ürün](preview/screens/300x250-slide1.jpg) | ![300x250 kapanış](preview/screens/300x250-outro.jpg) |

| 300 × 600 – ürün kartı | 300 × 600 – üzerine gelme | 300 × 600 – kapanış |
|---|---|---|
| ![300x600 ürün](preview/screens/300x600-slide1.jpg) | ![300x600 hover](preview/screens/300x600-hover.jpg) | ![300x600 kapanış](preview/screens/300x600-outro.jpg) |

## Kurgu

1. **Açılış (2,6 sn)** – Logo ortada büyür, slogan ("GDO'SUZ · GLUTENSİZ / Vitrini keşfet, favorini seç! / Dr. Ümit Aktaş imzalı takviyeler") kelime kelime belirir, ardından logo köşeye küçülür.
2. **Ürün slider'ı (5 × 3,2 sn)** – Her ürünün orijinal ambalaj fotoğrafı yükselerek girer, rozet / ürün adı / fayda cümlesi sırayla gelir, arka plan ışığı ürün rengine döner. 970×250'de komşu ürünler kenarlarda gölge olarak görünür (coverflow).
3. **Kapanış (3,6 sn)** – Ürün ailesi tek karede sıralanır, slogan ve nabız efektli CTA gösterilir; kupon görünür kalır.
4. Döngü 30 saniyeye kadar sürer; sonra son karede (CTA) durur. Google Ads'in 30 sn animasyon kuralına uygundur.

### Yeni üye kuponu (%10)

Referans çalışmadaki indirim bölümü üç boyuta uyarlandı: 970×250'de sağda kırmızı kupon paneli, 300×600'de yatay kupon bileti, 300×250'de sağ üstte kompakt kupon çipi. Kod (`YENİUYE10`) tıklanınca panoya kopyalanır ve "Kopyalandı!" geri bildirimi verilir. Metinler, kod ve renkler `src/data.js` → `coupon` altında; `enabled: false` ile bölüm tamamen kaldırılır.

## Etkileşim

- **Üzerine gelme:** Slider duraklar, ileri/geri okları belirir, sağ üstte duraklatma göstergesi çıkar.
- **Noktalar ve oklar:** Ürünler arasında serbest gezinme.
- **Klavye:** Odaktayken ← → ile ürün değiştirme, Enter ile tıklama.
- **Mobil:** Sağa/sola kaydırma ile ürün değiştirme.
- **Kupon:** İndirim kodu tıklanınca panoya kopyalanır (Clipboard API, yoksa execCommand yedeği); kontrol tıklaması reklam çıkışını tetiklemez.
- **Tıklama:** Bannerın tamamı tıklanabilir. `window.clickTag` tanımlıysa o kullanılır (Google Ads / DCM), `Enabler` varsa `Enabler.exit` çağrılır (Studio / DV360); ikisi de yoksa `src/data.js` içindeki UTM'li ürün sayfası açılır. Kontroller (nokta, ok) tıklamayı yutar.
- `prefers-reduced-motion` açıksa animasyonlar kısaltılır.

## Teknik özellikler

- Tek dosya, satır içi CSS + JS; ürün fotoğrafları ve logo base64 olarak gömülü. Her boyut ~140 KB (Google Ads sınırı 150 KB); vektör modda ~30 KB.
- Tipografi: Google Fonts üzerinden *Playfair Display* (başlık) ve *Manrope* (metin). Google Fonts, Google Ads ve DV360'ta izinli kaynaktır. Harici font kabul etmeyen ağlar için `@font-face` ile gömülebilir (bkz. aşağıda).
- `<meta name="ad.size">` etiketi, `role="link"`, aria etiketleri ve klavye odağı mevcuttur.
- Yasal ibare ("Takviye edici gıdalar ilaç değildir…") üç boyutta da yer alır.
- Görseller: 5 ürünün sitedeki orijinal ambalaj fotoğrafları (şeffaflaştırılmış WebP) ve sitenin logosu.
- Ürün fayda cümleleri EFSA onaylı sağlık beyanlarına yaslanacak şekilde yumuşatılmıştır (magnezyum–yorgunluk, D vitamini–kemik/bağışıklık, B12–enerji metabolizması, EPA/DHA–kalp). Yayın öncesi markanın regülasyon onayı önerilir.

## Gerçek ürün görselleri ve logo (siteden otomatik)

Bannerlar iki modda derlenir:

- **Fotoğraf modu** – `assets/manifest.json` varsa sitedeki gerçek ürün fotoğrafları, logo ve ürün sayfası bağlantıları kullanılır (varsayılan).
- **Vektör modu** – `assets/` yoksa veya `node build.js --vector` denirse şablondaki çizim şişeler kullanılır.

Depodaki `assets/` klasörü ve `dist/` bannerları **sitedeki gerçek ürün fotoğrafları, logo ve fiyatlarla** derlenmiştir (kaynak: ilacsizyasam.com, Shopify). Görselleri güncellemenin iki yolu var:

**1. GitHub Actions (önerilen, kurulum gerektirmez):** Depoda *Actions* sekmesi → "Siteden görselleri çek ve derle" → *Run workflow*. İş akışı siteden güncel görselleri indirir, optimize eder, bannerları derler, ekran görüntülerini ve teslim zip'ini üretir ve sonucu dala push'lar (`.github/workflows/fetch-assets.yml`).

**2. Yerel bilgisayarda** (normal internet erişimi, Node 18+):

```bash
node tools/fetch-assets.js       # ilacsizyasam.com → assets/ (ürün fotoğrafları, logo, fiyatlar, ürün adresleri, tema renk adayları)
npm run optimize-assets          # (önerilir) beyaz fonu şeffaflaştırır, kırpar, küçültür, WebP'ye çevirir; koyu logoyu beyaza çevirmek üzere işaretler
node build.js                    # gerçek görsellerle derler; boyut 150 KB'ı aşarsa uyarır
```

- Ürün eşleştirmesi `src/data.js` içindeki `handle` alanıyla yapılır (`ilacsizyasam.com/products/<handle>`); handle bulunamazsa ürün adındaki kelimelerle başlık araması yapılır.
- `optimize-assets` adımı Playwright + Chromium ister (`npm i -D playwright && npx playwright install chromium`). Atlanırsa fotoğraflar indirildiği gibi (640 px JPEG) gömülür; sunum için yeterlidir, Google Ads için boyut sınırı aşılabilir.
- Arka planı düz beyaz olmayan fotoğraflar otomatik olarak krem renkli "kart" içinde gösterilir.
- Logo koyu renkliyse (İlaçsız Yaşam logosu lacivert) beyaz bir plaka üzerine alınır; tek renkli koyu logolar için `manifest.json` → `logo.invert: true` ile beyaza çevirme de mümkündür (`logo.plate: false` plakayı kapatır).
- Banner paleti sitenin kimliğine göre lacivert (#0e2e68) zemin + yeşil (#79a64e) vurgu olarak ayarlanmıştır; `src/template.js` içindeki `:root` değişkenleriyle değiştirilir.
- `brand.showPrice: true` yapılırsa ürün kartında güncel fiyat, `brand.deepLink: true` ise ürün kartındayken tıklama ilgili ürün sayfasına gider (clickTag tanımlıysa yine clickTag kullanılır).
- Görselleri elle eklemek isterseniz: `assets/products/<key>.png` ve `assets/logo.png` dosyalarını koyup `assets/manifest.json` içinde ilgili `file` alanlarını göstermeniz yeterlidir (örnek yapı için betiğin ürettiği manifest'e bakın).

> Not: Bu depo Claude Code'un yalıtılmış ortamında hazırlandı; o ortamın ağ politikası ilacsizyasam.com ve Shopify CDN'e erişime izin vermediği için görseller GitHub Actions üzerinden indirildi.

## Özelleştirme

Tüm metinler (slogan dahil), kupon, ürünler, renkler ve süreler tek dosyadadır: **`src/data.js`**.

```js
products: [
  { name: 'Magnezyum', short: 'MAGNEZYUM', claim: '…', badge: 'Çok Satan', color: '#2f8f5b', accent: '#bfe3cc' },
  // ürün ekleyin / sırasını değiştirin
]
```

Düzenledikten sonra:

```bash
node build.js          # dist/ altındaki 3 HTML + zip paketlerini yeniden üretir
node tools/package.js  # release/index.html (tek dosya) ve release/ilacsizyasam-banner-seti.zip üretir
npm run capture        # (isteğe bağlı) preview/screens/ altına ekran görüntüleri alır
npm run capture:video  # (isteğe bağlı) preview/video/ altına kısa kayıt alır
npm test               # (isteğe bağlı) etkileşim duman testi (Playwright)
```

`build.js` yalnızca Node.js ister; ek paket kurulumu gerekmez. `capture` komutları için Playwright + Chromium gerekir.

### Marka varlıklarını yerleştirme

- **Logo:** `src/template.js` içindeki `MARK` sabiti (yaprak işareti) resmi logonun SVG'siyle değiştirilebilir.
- **Ürün fotoğrafları:** `bottle()` fonksiyonu vektör şişe üretir. Gerçek ürün görselleri için bu fonksiyonun döndürdüğü SVG yerine `<img src="…png">` verilebilir; ölçüler `--bw` değişkeniyle yönetilir.
- **Renkler:** `:root` altındaki `--forest`, `--gold`, `--mint`, `--cream` değişkenleri marka paletine göre ayarlanır.
- **Fontları gömme:** Ağ harici font kabul etmiyorsa Google Fonts `<link>` satırını kaldırıp `.woff2` dosyalarını base64 `@font-face` olarak `<style>` içine ekleyin (dosya boyutu ~120 KB'a çıkar, hâlâ sınır altındadır).

## Yükleme notları

- **Google Ads (HTML5):** `dist/zip/*.zip` dosyalarını doğrudan yükleyin. `ad.size` meta etiketi ve `clickTag` desteği hazırdır.
- **Campaign Manager 360 / DV360:** Aynı zipler kullanılabilir; `Enabler` algılanırsa çıkış `Enabler.exit('CTA')` üzerinden yapılır. Studio'ya yüklenecekse `<script src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>` satırını `<head>` içine ekleyin.
- **Diğer ağlar (Adform, Xandr vb.):** Genellikle `clickTag` yeterlidir; ağın kendi makrosu farklıysa `openLink()` fonksiyonundaki `window.clickTag` satırı ilgili makroya çevrilir.

## Klasör yapısı

```
src/data.js              Marka metinleri, ürünler (handle), süreler
src/template.js          Ortak motor + 3 yerleşim (rect / tall / wide)
build.js                 dist/ üretici (fotoğraf / vektör modu)
assets/                  Siteden çekilen gerçek görseller + manifest.json
dist/<boyut>/            Yüklemeye hazır bannerlar
dist/zip/                Zip paketleri
release/                 Teslim: index.html (tek dosya) + zip
preview/index.html       Sunum sayfası
preview/screens/         Ekran görüntüleri
tools/fetch-assets.js    Siteden görsel/logo/fiyat çekme
tools/optimize-assets.js Görsel optimizasyonu (şeffaflaştırma, WebP)
tools/package.js         Teslim zip'i
tools/capture.js         Playwright ile görüntü/video alma
tools/smoke.js           Etkileşim duman testi
```
