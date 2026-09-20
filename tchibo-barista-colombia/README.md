# Tchibo Barista Colombia Origin – 970×250 İnteraktif Masthead

[tchibo.com.tr – Tam otomatik makineler için kahve](https://www.tchibo.com.tr/categories/kahve/kahveler/tam-otomatik-makineler-icin-kahve) kategorisi ve **Barista Caffè Crema Colombia Origin** (1 kg çekirdek, %100 Arabica) iletişimi için hazırlanmış, animasyonlu ve etkileşimli **970×250 HTML5 masthead**.

| Dosya | Açıklama |
|---|---|
| `dist/970x250/index.html` | Yüklemeye hazır tek dosya (tüm görseller gömülü, ~140 KB) |
| `dist/tchibo-barista-colombia-970x250.zip` | Reklam ağına yükleme paketi |
| `preview/index.html` | Yayın simülasyonu (masthead örnek bir haber sayfasının üstünde) |
| `preview/screens/` | Kurgu ve etkileşim ekran görüntüleri |

## Görseller: hiçbir şey vektör değil, hepsi özgün

Bannerdaki **her görsel sıfırdan, piksel piksel üretilmiş raster görseldir** – stok fotoğraf, hazır illüstrasyon ya da vektör çizim kullanılmadı. `tools/render-assets.py` (numpy + Pillow) şu yöntemle çalışır: yükseklik haritası → yüzey normalleri → Blinn-Phong ışıklandırma (ana ışık sol-üst, sıcak dolgu ışığı sağdan, kenar ışığı) → 3–4× süper örnekleme ile kenar yumuşatma → WebP.

| Görsel | Üretim |
|---|---|
| Kahve çekirdekleri (5 varyant) | Basık elipsoit + kıvrımlı orta yarık; benekli kavrulmuş albedo dokusu, yağlı parlaklık (specular), kenar ışığı. Her varyantın rengi/parlaklığı farklı; biri arka yüz (yarıksız). |
| Fincan + tabak | 3/4 açıdan kesik koni gövde, porselen gölgelendirme, ağız halkası, gölgeli iç duvar, torus kulp, tabak (jant + çukur), fincanın tabağa ve zemine düşen yumuşak gölgeleri. |
| Krema | Domain-warp mermer deseni + ince benekler + kenarda açık krema halkası ve koyu kahve kenarı, 220 mikro kabarcık, iç duvarın kremaya düşen gölgesi, pencere yansıması. |
| Arka plan | Perspektifli ahşap masa: damarlar dünya uzayında üretilip perspektifle örnekleniyor (ufka yaklaştıkça sıkışır), tahta ek yerleri, cila yansıması, uzaklaştıkça odak dışı bulanıklık; arkada sıcak ışıklı odak dışı kafe derinliği, vinyet, metin için sol taraf koyulaştırma. |
| Buhar (3 tutam) | Domain-warp gürültünün "ridged" (tel tel) eşiklenmesiyle lifli buhar. |
| Bokeh, hale, ısı halkası, kıvılcım, gölge | Yumuşak diskler / halkalar (alfa kanallı). |

Görselleri yeniden üretmek: `python3 tools/render-assets.py` (Pillow + numpy gerekir). Bir çekirdeğin rengi, fincanın oranı, ahşabın tonu vb. bu betikteki parametrelerle değiştirilir.

## Kurgu (ilk 5 saniye, sonra sürekli ortam animasyonu)

1. **0–1,1 sn** Karanlıktan sıcak bir ışık süpürmesiyle açılış; çekirdekler yukarıdan dökülüp masaya sekerek yerleşir (her çekirdek kademeli, dönerek iner, gölgesi yere indikçe belirir).
2. **0,7–1,6 sn** Fincan yükselerek gelir, arkasında sıcak hale yanar, masaya yansır; ağızdan buhar tütmeye başlar; fincanın üstünde hava ısı titreşimiyle (heat haze) dalgalanır.
3. **1,05–2,2 sn** Marka, üst satır, başlık ("Çekirdekten fincana, Kolombiya'nın *enfes lezzeti*.") maskeyle yükselerek, ardından alt metin gelir.
4. **2,85 sn** CTA ("Ürünü Keşfet") ve "Tam otomatik makineler için" satırı; 4,2 sn'den sonra CTA üzerinde periyodik parıltı.
5. **Sürekli** Buhar, bokeh ışıklarının süzülmesi, halenin nefes alması, boştayken kendiliğinden hafif paralaks. 30 sn sonra ortam animasyonu durur (Google Ads kuralı); her etkileşim onu 6 sn için yeniden canlandırır.

## Etkileşim

- **Fare hareketi** → 5 katmanlı paralaks: arka plan, bokeh, uzak çekirdekler, fincan, yığın ve ön çekirdekler farklı hızlarda kayar.
- **Fincana yaklaşma** → buhar iki kat yoğunlaşır ve yükselir, ısı titreşimi artar, sıcak hale büyür, masada dışa doğru **ısı halkaları** yayılır, fincan hafifçe "nefes alır".
- **Çekirdeğin üzerine gelme** → çekirdek hafif kalkar (gölgesi uzar). **Tıklama/dokunma** → çekirdek takla atar, altın **aroma kıvılcımları** ve aroma tütsüsü yükselir, bir tat notu belirir ("Kırmızı meyve", "Çikolata", "İpeksi krema", "Hafif tatlılık", "Zarif asidite", "Tek yöre Arabica", "Kolombiya'nın yüksek dağları"). Çekirdeğe tıklama reklam çıkışını tetiklemez.
- **CTA veya boş alan** → ürün sayfası. `window.clickTag` tanımlıysa o kullanılır (Google Ads / CM360), `Enabler` varsa `Enabler.exit('CTA')` (Studio / DV360), yoksa `src/masthead.html` içindeki UTM'li kategori adresi açılır.
- **Klavye**: Banner odaklanabilir (`role="link"`), Enter / Boşluk ile çıkış. Sağ üstteki ipucu ilk etkileşimde kaybolur.
- `prefers-reduced-motion` açıksa giriş animasyonu, buhar ve titreşim kapatılır; son kare doğrudan gösterilir.
- Dokunmatik cihazlarda çekirdeğe dokunma çalışır; paralaks fare hareketine bağlıdır.

## Teknik

- Tek dosya, satır içi CSS + JS; tüm raster görseller base64 WebP olarak gömülü (~140 KB). Harici bağımlılık yalnızca Google Fonts (Playfair Display + Manrope – Google Ads / DV360'ta izinli kaynak). Font kabul etmeyen ağlar için `.woff2` dosyaları `@font-face` ile gömülebilir.
- Sahne `<canvas>` üzerinde çizilir (devicePixelRatio'ya göre 2× netlik); metin ve CTA HTML katmanındadır (erişilebilir, düzenlenebilir, retina'da keskin).
- `<meta name="ad.size" content="width=970,height=250">`, `role="link"`, `aria-label`, klavye odağı mevcuttur.
- Ürün bilgileri (tek yöre Kolombiya Arabica, kırmızı meyve ve çikolata notaları, ipeksi krema, 1 kg, tam otomatik makineler için) Tchibo'nun ürün tanımına dayanır; yayın öncesi marka onayı önerilir.
- **Logo:** Tchibo logosu bu ortamda erişilebilir olmadığından sol üstte tipografik "TCHIBO / BARISTA" yer tutucu kullanıldı. Resmi logo dosyası (PNG/SVG) `src/masthead.html` içindeki `<div class="brand">` yerine `<img>` olarak konur.

## Derleme

```bash
python3 tools/render-assets.py                    # görselleri üret (assets/*.webp + manifest.json)
node build.js                                     # dist/970x250/index.html + zip
NODE_PATH=$(npm root -g) node tools/capture.js    # (isteğe bağlı) preview/screens/ ekran görüntüleri – Playwright + Chromium
```

Metinler, CTA, hedef adres ve zamanlamalar `src/masthead.html` içindedir (CSS `animation-delay` değerleri ve JS başındaki `MAX_AUTOPLAY`). Fincanın konumu `CUP`, çekirdek yerleşimleri `mkBean(...)` çağrıları ile ayarlanır.

## Klasör yapısı

```
src/masthead.html        Kaynak (görseller {{asset:ad}} yer tutucularıyla)
tools/render-assets.py   Raster görsel üretici (numpy + Pillow)
tools/capture.js         Playwright ekran görüntüleri
assets/                  Üretilen görseller + manifest.json
build.js                 Tek dosya derleyici + zip
dist/970x250/index.html  Yüklemeye hazır masthead
preview/index.html       Yayın simülasyonu
preview/screens/         Ekran görüntüleri
```
