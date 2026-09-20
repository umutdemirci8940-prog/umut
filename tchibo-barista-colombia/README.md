# Tchibo Barista Colombia Origin – 970×250 İnteraktif Masthead

[tchibo.com.tr – Tam otomatik makineler için kahve](https://www.tchibo.com.tr/categories/kahve/kahveler/tam-otomatik-makineler-icin-kahve) kategorisi ve **Barista Caffè Crema Colombia Origin** (1 kg çekirdek, %100 Arabica) iletişimi için hazırlanmış, üç perdelik sinematik kurguya sahip, animasyonlu ve etkileşimli **970×250 HTML5 masthead**.

İki sürüm vardır:

| Sürüm | Dosya | Açıklama |
|---|---|---|
| **A · Kampanya KV** (gerçek paketler) | `dist/970x250-kampanya/index.html` (~366 KB) · `dist/tchibo-barista-colombia-970x250-kampanya.zip` | Kampanya videosunun/anahtar görselinin dilinde: mavi zemin, krem lekeler, kırmızı-sarı üçgen motifi, **tchibo.com.tr'den alınan gerçek paket çekimleri** (Colombia + Caffè Crema + Espresso), "YENİ" rozeti, resmi logo; ikinci sahnede ürün sayfasındaki **gerçek mutfak fotoğrafı** (paket + tam otomatik makine). |
| **B · Sinematik 3 perde** (üretilmiş raster) | `dist/970x250/index.html` (~295 KB) · `dist/tchibo-barista-colombia-970x250.zip` | Kolombiya dağlarında şafak → tambur kavurma → makineden fincana; tüm görseller piksel piksel üretilmiş. |
| Önizleme | `preview/index.html` · `preview/screens/` | Yayın simülasyonu (iki sürüm) ve ekran görüntüleri (`kv-*` kampanya, `970x250-*` sinematik) |

## A · Kampanya KV sürümü

Tchibo Barista serisi kampanya videosunun (YouTube `QD5d6irb-ZA`) anahtar görseliyle aynı dil: royal mavi zemin (#3942a1), krem organik lekeler (#ecd69d), sağ kenarda kırmızı (#f14827) / sarı (#fec015) / turuncu (#cc6343) üçgen motifi, altta turuncu bant, "YENİ" konuşma balonu rozeti, "TCHIBO BARISTA SERİSİ: KAHVEDE UZMANLIK ESERİ" başlığı ve "Barista Colombia · Single Origin Edition" alt satırı. Renkler videonun küçük resminden örneklendi (`assets/video/thumb-maxresdefault.jpg`).

**Gerçek görseller (tasarlanmadı, siteden alındı):**
- Paket çekimleri: tchibo.com.tr ürün sayfalarından (`tools/fetch-products.js`, GitHub Actions görevi `tchibo-products`): Barista Origins Colombia 1 kg (kahraman), Barista Caffè Crema, Barista Espresso; 3/4 açı ve cephe çekimleri `assets/products/`. Beyaz fon `tools/cutout.py` ile şeffaflaştırıldı (kenardan taşma dolgusu, 1 px erozyon, un-matte) → `assets/packs/`. Espresso Dark ürün sayfası 404 döndürdüğü için yer almıyor.
- Mutfak fotoğrafı (paket + tam otomatik makine): Colombia ürün sayfasının yaşam tarzı görseli → `assets/packs/photo.jpg`; 2. sahnede yavaş zoom (Ken Burns) ile.
- Resmi Tchibo logosu (bkz. Teknik → Logo).

**Kurgu (12,4 sn, sonra son kare):** mavi zemin ve lekeler patlayarak açılır, üçgenler sağdan kayar → kahraman paket zıplayarak iner, yere değince gerçek çekirdek sprite'ları saçılır → "YENİ" rozeti fırlar → aile paketleri sağdan kayarak dizilir → başlık satırları maskeyle yükselir, script alt satır, CTA (3,4 sn) → **krem leke geçişi** (6,4 sn) → mutfak fotoğrafı sahnesi: "TAM OTOMATİK MAKİNELER İÇİN TASARLANDI" + tat notaları (Ken Burns) → leke geçişi → son kare (KV, her şey yerleşik). Sağ üst noktalarla sahneler arasında geçilebilir.

**Etkileşim:** fare paralaksı (zemin, lekeler, üçgenler, paketler farklı derinlikte); paketlerin üzerine gelince paket kalkar ve ürün etiketi belirir; **pakete tıklama ilgili ürün sayfasına** (UTM'li) gider, kahraman pakete tıklayınca çekirdek saçılır; CTA ve boş alan kategori sayfasına; `clickTag` / `Enabler.exit` desteği; Enter / Boşluk ile çıkış.

> Kampanya videosunun kendisi GitHub sunucusundan indirilemedi (YouTube "bot doğrulaması"); iş akışı görevi `tchibo-video` hazır, MP4 elde edilirse `assets/video/` altına konularak gerçek video kareleri de eklenebilir. Kaynak: `src/masthead-kv.html`; KV parçaları `tools/render-kv.py` → `assets/kv/`.

## B · Sinematik 3 perde sürümü

### Kurgu: çekirdekten fincana, üç perde

| # | Perde | Süre | Ne olur |
|---|---|---|---|
| 1 | **Kolombiya'nın yüksek dağları** | 0–3,4 sn | Şafak vakti katmanlı dağ sırtları, sis bantları, güneşin ışın hüzmeleri; kamera yavaşça içeri iter (%6 zoom), sırtlar fare ile paralaks yapar; odak dışı çekirdekler sisin içinde süzülür. Metin: "Yüksek dağlarda yetişen %100 Arabica *çekirdekler*." |
| ↓ | Geçiş | 0,8 sn | Sıcak bir ışık parlaması (flare) soldan sağa süpürür; sahne çapraz erir. |
| 2 | **Geleneksel tambur kavurma** | 4,2–8,6 sn | Kor ışığı ve dumanla dolu karanlık tambur; 32 çekirdek havada savrulur ve gözünüzün önünde **yeşilden kavrulmuş kahverengiye döner**; "ilk çatlak" anında kıvılcım atar; tüm kare ısıyla titrer. Fare bir ısı kaynağıdır: yaklaştığınız çekirdekler kor gibi parlar ve kıvılcım saçar. Metin: "Her çekirdeğe zaman tanıyan, usta işi bir *kavurma*." |
| ↓ | Geçiş | 0,8 sn | İkinci flare; kavurma karanlığı sıcak ahşap masaya açılır. |
| 3 | **Makineden fincana** | 9,4–13,8 sn | Boş fincan tabağıyla yerleşir, çekirdekler masaya dökülür. Üstten **tam otomatik makinenin çift ağızlı çıkışı** iner, iki kahve akışı fincana dökülür: krema dönerek yükselir, çarpma noktasında sıçrama ve damlacıklar oluşur, buhar tütmeye başlar, hale ısınır. Makine ağzı geri çekilir; başlık, tat notaları ve CTA gelir. |
| ∞ | **Son kare** | 13,8 sn → | Buhar, ısı titreşimi, bokeh, paralaks ve etkileşimler sürer. 30 sn sonra ortam animasyonu durur (Google Ads kuralı); her etkileşim onu 6 sn için yeniden canlandırır. |

Sağ üstteki üç nokta perdeleri gösterir; tıklanınca ilgili perdeye atlanır (izleyici hikâyeyi yeniden oynatabilir).

### Görseller: hiçbir şey vektör değil, hepsi özgün

Bannerdaki **her görsel sıfırdan, piksel piksel üretilmiş raster görseldir** – stok fotoğraf, hazır illüstrasyon ya da vektör çizim kullanılmadı. `tools/render-assets.py` (numpy + Pillow) yükseklik haritası → yüzey normalleri → Blinn-Phong ışıklandırma → 3–4× süper örnekleme → WebP zinciriyle çalışır.

| Görsel | Üretim |
|---|---|
| Gökyüzü + uzak sırtlar (`sky`) | Şafak gradyanı, güneş ve geniş ışık, yatay uzatılmış bulut gürültüsü, sisle solan üç uzak sırt (1D fbm yükseklik çizgileri), güneş tarafında kenar ışığı. |
| Orta / yakın sırt (`ridgeMid`, `ridgeNear`) | Ayrı alfa katmanları (paralaks için); yakın sırtta ağaç çizgisi için yüksek frekanslı detay, doku gürültüsü. |
| Işın hüzmeleri, flare (`rays`, `flare`) | Açısal Gauss şeritleri ve yatay çizgi parlaması. |
| Kavurma zemini (`roastBg`) | Grafit gradyan, fırçalanmış metal dokusu, alttan kor ışığı, vinyet. |
| Çekirdekler, kavrulmuş ve **çiğ** (`bean1-5`, `beanG1-5`) | Basık elipsoit + kıvrımlı yarık, benekli albedo, yağlı parlaklık. Çiğ sürüm aynı tohumla (aynı şekil) zeytin yeşili ve mat üretilir; kavurma geçişi iki sprite'ın çapraz erimesidir. |
| Boş fincan + tabak (`cupEmpty`) | 3/4 açı kesik koni, porselen gölgelendirme, ağız halkası, gölgeli iç duvar, torus kulp, tabak, yumuşak gölgeler. |
| Krema diski + parlaklık katmanı (`crema`, `cremaHi`) | Üstten görünüm daire (çalışma anında elipse yatırılıp döndürülür): domain-warp mermer, benekler, kenar halkası, 260 kabarcık; sabit iç duvar gölgesi ve pencere yansıması ayrı katmanda. |
| Makine ağzı, akış, sıçrama, damla (`spout`, `stream`, `splash`, `drop`) | Grafit gövde + krom bant + iki silindirik ağız; dikey parlaklık şeritli incelen akış; halka + damlacık sıçraması; parlak damla. |
| Ahşap masa (`bg`) | Perspektifli damarlar (dünya uzayında üretilip perspektifle örneklenir), tahta ek yerleri, cila yansıması, odak dışı uzak kenar, vinyet. |
| Buhar, bokeh, hale, ısı halkası, kıvılcım, gölge | Tel tel (ridged) buhar tutamları; yumuşak disk ve halkalar. |

Tek istisna markanın kendisidir: sol üstteki **resmi Tchibo logosu** tasarlanmamış, Tchibo'nun sitesinden alınıp raster olarak gömülmüştür (bkz. Teknik → Logo).

Yeniden üretmek: `python3 tools/render-assets.py` (Pillow + numpy). Renk, oran, ışık yönü gibi her şey betikteki parametrelerdir.

### Etkileşim

- **1. perde** – Fare hareketi sırtları, sisi ve süzülen çekirdekleri farklı hızlarda kaydırır (derinlik).
- **2. perde** – İmleç ısı kaynağı: 120 px içindeki çekirdekler kor gibi parlar, rastgele kıvılcım saçar; ısı titreşimi artar.
- **3. perde / son kare** – **Fincana yaklaşma:** buhar iki kat yoğunlaşır, ısı titreşimi ve hale büyür, masada ısı halkaları yayılır. **Çekirdeğe dokunma:** çekirdek takla atar, aroma kıvılcımı ve tütsüsü yükselir, tat notu belirir (Kırmızı meyve, Çikolata, İpeksi krema, Hafif tatlılık, Zarif asidite, Tek yöre Arabica). Çekirdeğe dokunma reklam çıkışını tetiklemez.
- **Perde noktaları** (sağ üst) – İlgili perdeye atlar.
- **CTA veya boş alan** – Ürün sayfası. `window.clickTag` tanımlıysa o kullanılır (Google Ads / CM360), `Enabler` varsa `Enabler.exit('CTA')` (Studio / DV360), yoksa `src/masthead.html` içindeki UTM'li kategori adresi.
- **Klavye** – Banner odaklanabilir (`role="link"`), Enter / Boşluk ile çıkış. Son karede imleç bannera girince CTA yanında 3 sn'lik ipucu belirir.
- `prefers-reduced-motion` açıksa kurgu atlanır, son kare doğrudan gösterilir; buhar ve titreşim kapalıdır.

### Yerleşim

Üç net bölge: **sol** metin kolonu (marka satırı, üst satır, iki satırlık başlık, tek satır alt metin, CTA) – her perdede arka plan bu tarafta karartılır, üzerine görsel gelmez; **orta** fincan / kavurma çekirdekleri / güneş; **sağ** çekirdekler ve perde noktaları.

## Teknik

- Tek dosya, satır içi CSS + JS; 33 raster görsel base64 WebP olarak gömülü (~295 KB). Zengin medya (rich media) boyutundadır: DV360 / CM360 / Adform / Xandr için uygundur; Google Ads'in 150 KB standart HTML5 sınırını aşar (gerekirse `sky`/`bg` kalitesi düşürülerek ya da 1. perde çıkarılarak küçültülebilir).
- Harici bağımlılık yalnızca Google Fonts (Playfair Display + Manrope). Font kabul etmeyen ağlar için `.woff2` dosyaları `@font-face` ile gömülebilir.
- Sahne iki `<canvas>` katmanında çizilir (perde geçişleri için ayrı katman; devicePixelRatio'ya göre 2× netlik); metin ve CTA HTML katmanındadır.
- `<meta name="ad.size" content="width=970,height=250">`, `role="link"`, `aria-label`, klavye odağı mevcuttur.
- Ürün bilgileri (tek yöre Kolombiya Arabica, geleneksel tambur kavurma, kırmızı meyve ve çikolata notaları, ipeksi krema, 1 kg, tam otomatik makineler için) Tchibo'nun ürün tanımına dayanır; yayın öncesi marka onayı önerilir.
- **Logo:** Sol üstteki logo Tchibo'nun resmi logosudur; tchibo.com.tr'nin kendi SVG sprite'ından (`/static/svgs/tchibo.svg`) alınmıştır (`assets/logo-src.svg`, kaynak bilgisi `assets/logo-source.json`). Koyu zemin için tek renk krem sürümü 4× çözünürlükte şeffaf PNG olarak render edilip gömülür (`assets/logo-light.png`, ekranda 30 px); özgün renkli sürüm `assets/logo.png`. Claude'un bulut oturumu tchibo.com.tr'ye erişemediği için indirme ve render işlemi GitHub Actions'ta yapılır: *Actions → "Siteden görselleri çek ve derle" → Run workflow → task: `tchibo-logo`* (`tools/fetch-logo.js` + `tools/render-logo.js`, ardından derleme ve ekran görüntüleri dala push'lanır). Yerelde: `node tools/fetch-logo.js && node tools/render-logo.js && node build.js`. Logo dosyası yoksa derleyici tipografik "TCHIBO" yer tutucusuna döner.

## Derleme

```bash
python3 tools/render-assets.py                    # B: görselleri üret (assets/*.webp + manifest.json), ~1 dk
python3 tools/render-kv.py                        # A: kampanya dili parçaları (assets/kv/)
python3 tools/cutout.py                           # A: paket kesimleri + mutfak fotoğrafı (assets/packs/) – assets/products/ gerekir
node build.js                                     # iki sürüm: dist/970x250 ve dist/970x250-kampanya (+ zip); tek sürüm: --only=kampanya
NODE_PATH=$(npm root -g) node tools/capture.js    # B ekran görüntüleri; A için tools/capture-kv.js – Playwright + Chromium
```

Siteden görsel çekme (GitHub Actions → "Siteden görselleri çek ve derle" → task): `tchibo-logo` (resmi logo), `tchibo-products` (paket görselleri, site videoları), `tchibo-video` (kampanya videosu; YouTube bot doğrulaması nedeniyle şu an yalnızca küçük resimler).

Metinler, CTA ve hedef adres `src/masthead.html` içindedir; perde süreleri JS başındaki `T` nesnesinde (ms), metin zamanlamaları `updateText()` içindedir. Fincan konumu `CUP`, çekirdek yerleşimleri `mkBean(...)`, kavurma çekirdekleri `roast` dizisiyle ayarlanır.

## Klasör yapısı

```
src/masthead-kv.html     A · Kampanya KV sürümü kaynağı ({{kv:}}, {{pack:}}, {{url:}}, {{photo}}, {{logo}})
src/masthead.html        B · Sinematik sürüm kaynağı ({{asset:}} yer tutucularıyla)
tools/render-kv.py       Kampanya dili parçaları (zemin, lekeler, üçgenler, rozet)
tools/fetch-products.js  tchibo.com.tr ürün görselleri + site videoları (GitHub Actions)
tools/cutout.py          Beyaz fonlu paket çekimlerini şeffaflaştırma, mutfak fotoğrafı
tools/fetch-video.sh     Kampanya videosu (yt-dlp + ffmpeg; GitHub Actions)
tools/capture-kv.js      A sürümü ekran görüntüleri
tools/render-assets.py   B · Raster görsel üretici (numpy + Pillow)
tools/capture.js         Playwright ekran görüntüleri (yerel font önbelleği)
assets/                  Üretilen görseller + manifest.json
build.js                 Tek dosya derleyici + zip
dist/970x250-kampanya/   A · Yüklemeye hazır kampanya masthead'i
dist/970x250/            B · Yüklemeye hazır sinematik masthead
assets/products|packs|kv Gerçek paket görselleri, kesimler, kampanya parçaları
preview/index.html       Yayın simülasyonu
preview/screens/         Ekran görüntüleri
```
