# Tchibo Barista Colombia Origin – 970×250 İnteraktif Masthead

[tchibo.com.tr – Tam otomatik makineler için kahve](https://www.tchibo.com.tr/categories/kahve/kahveler/tam-otomatik-makineler-icin-kahve) kategorisi ve **Barista Caffè Crema Colombia Origin** (1 kg çekirdek, %100 Arabica) iletişimi için hazırlanmış, üç perdelik sinematik kurguya sahip, animasyonlu ve etkileşimli **970×250 HTML5 masthead**.

| Dosya | Açıklama |
|---|---|
| `dist/970x250/index.html` | Yüklemeye hazır tek dosya (tüm görseller gömülü, ~295 KB) |
| `dist/tchibo-barista-colombia-970x250.zip` | Reklam ağına yükleme paketi |
| `preview/index.html` | Yayın simülasyonu (masthead örnek bir haber sayfasının üstünde) |
| `preview/screens/` | Kurgu ve etkileşim ekran görüntüleri (`01-daglar` … `09-paralaks`) |

## Kurgu: çekirdekten fincana, üç perde

| # | Perde | Süre | Ne olur |
|---|---|---|---|
| 1 | **Kolombiya'nın yüksek dağları** | 0–3,4 sn | Şafak vakti katmanlı dağ sırtları, sis bantları, güneşin ışın hüzmeleri; kamera yavaşça içeri iter (%6 zoom), sırtlar fare ile paralaks yapar; odak dışı çekirdekler sisin içinde süzülür. Metin: "Yüksek dağlarda yetişen %100 Arabica *çekirdekler*." |
| ↓ | Geçiş | 0,8 sn | Sıcak bir ışık parlaması (flare) soldan sağa süpürür; sahne çapraz erir. |
| 2 | **Geleneksel tambur kavurma** | 4,2–8,6 sn | Kor ışığı ve dumanla dolu karanlık tambur; 32 çekirdek havada savrulur ve gözünüzün önünde **yeşilden kavrulmuş kahverengiye döner**; "ilk çatlak" anında kıvılcım atar; tüm kare ısıyla titrer. Fare bir ısı kaynağıdır: yaklaştığınız çekirdekler kor gibi parlar ve kıvılcım saçar. Metin: "Her çekirdeğe zaman tanıyan, usta işi bir *kavurma*." |
| ↓ | Geçiş | 0,8 sn | İkinci flare; kavurma karanlığı sıcak ahşap masaya açılır. |
| 3 | **Makineden fincana** | 9,4–13,8 sn | Boş fincan tabağıyla yerleşir, çekirdekler masaya dökülür. Üstten **tam otomatik makinenin çift ağızlı çıkışı** iner, iki kahve akışı fincana dökülür: krema dönerek yükselir, çarpma noktasında sıçrama ve damlacıklar oluşur, buhar tütmeye başlar, hale ısınır. Makine ağzı geri çekilir; başlık, tat notaları ve CTA gelir. |
| ∞ | **Son kare** | 13,8 sn → | Buhar, ısı titreşimi, bokeh, paralaks ve etkileşimler sürer. 30 sn sonra ortam animasyonu durur (Google Ads kuralı); her etkileşim onu 6 sn için yeniden canlandırır. |

Sağ üstteki üç nokta perdeleri gösterir; tıklanınca ilgili perdeye atlanır (izleyici hikâyeyi yeniden oynatabilir).

## Görseller: hiçbir şey vektör değil, hepsi özgün

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

## Etkileşim

- **1. perde** – Fare hareketi sırtları, sisi ve süzülen çekirdekleri farklı hızlarda kaydırır (derinlik).
- **2. perde** – İmleç ısı kaynağı: 120 px içindeki çekirdekler kor gibi parlar, rastgele kıvılcım saçar; ısı titreşimi artar.
- **3. perde / son kare** – **Fincana yaklaşma:** buhar iki kat yoğunlaşır, ısı titreşimi ve hale büyür, masada ısı halkaları yayılır. **Çekirdeğe dokunma:** çekirdek takla atar, aroma kıvılcımı ve tütsüsü yükselir, tat notu belirir (Kırmızı meyve, Çikolata, İpeksi krema, Hafif tatlılık, Zarif asidite, Tek yöre Arabica). Çekirdeğe dokunma reklam çıkışını tetiklemez.
- **Perde noktaları** (sağ üst) – İlgili perdeye atlar.
- **CTA veya boş alan** – Ürün sayfası. `window.clickTag` tanımlıysa o kullanılır (Google Ads / CM360), `Enabler` varsa `Enabler.exit('CTA')` (Studio / DV360), yoksa `src/masthead.html` içindeki UTM'li kategori adresi.
- **Klavye** – Banner odaklanabilir (`role="link"`), Enter / Boşluk ile çıkış. Son karede imleç bannera girince CTA yanında 3 sn'lik ipucu belirir.
- `prefers-reduced-motion` açıksa kurgu atlanır, son kare doğrudan gösterilir; buhar ve titreşim kapalıdır.

## Yerleşim

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
python3 tools/render-assets.py                    # görselleri üret (assets/*.webp + manifest.json), ~1 dk
node build.js                                     # dist/970x250/index.html + zip
NODE_PATH=$(npm root -g) node tools/capture.js    # (isteğe bağlı) preview/screens/ – Playwright + Chromium
```

Metinler, CTA ve hedef adres `src/masthead.html` içindedir; perde süreleri JS başındaki `T` nesnesinde (ms), metin zamanlamaları `updateText()` içindedir. Fincan konumu `CUP`, çekirdek yerleşimleri `mkBean(...)`, kavurma çekirdekleri `roast` dizisiyle ayarlanır.

## Klasör yapısı

```
src/masthead.html        Kaynak (görseller {{asset:ad}} yer tutucularıyla)
tools/render-assets.py   Raster görsel üretici (numpy + Pillow)
tools/capture.js         Playwright ekran görüntüleri (yerel font önbelleği)
assets/                  Üretilen görseller + manifest.json
build.js                 Tek dosya derleyici + zip
dist/970x250/index.html  Yüklemeye hazır masthead
preview/index.html       Yayın simülasyonu
preview/screens/         Ekran görüntüleri
```
