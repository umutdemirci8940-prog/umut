# Çok da Coffy – Lansman Planı ve 10 İnteraktif Banner

Coffy “Çok da Coffy” kampanyası için lansman/sürdürme planı ve **10 interaktif HTML5 reklam**. Set mobil ağırlıklı: **7 × 320×480** (mobil interstitial, oyun içi end card, playable) ve **3 × 970×250** (billboard).

- **Plan:** [`LANSMAN-PLANI.md`](LANSMAN-PLANI.md): hedefler, kitle, faz planı, genç kitle hedefleme alternatifleri, oyun içi kullanım, lokasyon/şube yönlendirme, bütçe dağılımı, ölçümleme ve takvim.
- **Sunum:** `release/cok-da-coffy-sunum.html` tek dosyadır. Plan ve 10 banner birlikte açılır, bannerlar sayfa içinde oynar ve her biri ayrı indirilebilir.
- **Yükleme dosyaları:** `dist/<no>-<ad>-<boyut>/index.html` ve `dist/zip/*.zip`.

| # | Çalışma | Boyut | Mekanik |
|---|---|---|---|
| 01 | Saat Kaç? Senaryosu | 320×480 | Video → gerçek saate göre senaryo + 3 seçenek → bardak dolar → bitiş kartı |
| 02 | Enerji Doldur | 320×480 | Ödüllü video → dokun-iç → enerji %100 → +1 Can |
| 03 | Köpüğü Kazı | 320×480 | Video → latte köpüğünü kazı → uygulama kodu |
| 04 | Zor mu? Kaydır. | 320×480 | Video → 3 “zor an” kartı, sağa kaydır = Coffy’le hallet |
| 05 | Çekirdek Avı | 320×480 | Video → 10 sn mini oyun → skor + kod |
| 06 | En Yakın Coffy | 320×480 | Video → harita, yürüme rotası, yol tarifi |
| 07 | Ruh Halin Ne? | 320×480 | Video → ruh hali seç → içecek önerisi |
| 08 | Coffy Seviyesi | 970×250 | Video + kaydırıcı: “Az da → Orta da → Çok da Coffy.” |
| 09 | Senaryonu Seç | 970×250 | Video → 3 senaryo paneli, zorluk %95 → %15 |
| 10 | Şube Bulucu | 970×250 | Video → haritada en yakın 3 şube |

## Ekran görüntüleri

![Mobil set](preview/screens/overview-mobile.jpg)

![Billboard set](preview/screens/overview-wide.jpg)

## Ortak kurgu

**Ana video → soru / senaryo / oyun → Coffy tüketimiyle devam → “Çok da Coffy” → en yakın şube.**

- **Video:** Her çalışma ana videoyla açılır (6 sn’ye kadar, 2 sn sonra “Geç”). `src/config.js → video.src` boşken animasyonlu bir yer tutucu oynar. #08’de video interaksiyonla aynı karede döngüde oynar ve sesi açılabilir.
- **Otomatik demo:** Kullanıcı birkaç saniye etkileşmezse çalışma kendini oynatır ve bitiş kartına ulaşır. Her dokunuşta sayaç sıfırlanır.
- **Bitiş kartı:** “Çok da Coffy.” sloganı, en yakın şube (mesafe, yürüme süresi, saatler), **Yol tarifi al** ve **Uygulamadan sipariş** düğmeleri.
- **Dinamik metin:** #01, #06 ve #10 gün dilimine (sabah, öğle, akşam, gece) göre değişir. Önizlemede `?dp=morning|noon|evening|night` ve `?time=08:47` ile denenebilir.
- **Konum:** Sırasıyla MRAID `getLocation()` (uygulama içi), DSP makroları (`geo.latMacro/lonMacro`), `?lat=&lon=` parametresi ve son olarak varsayılan bölge kullanılır. En yakın şube haversine mesafesiyle hesaplanır.

## Teknik

- Her banner tek dosya (satır içi CSS/JS, SVG çizimler, harici görsel yok) ve **150 KB altında**. Fontlar Google Fonts’tan gelir (*Bricolage Grotesque* + *Manrope*).
- **Çıkışlar:** `window.clickTag` tanımlıysa o kullanılır (Google Ads / CM360). `Enabler` varsa `Enabler.exitOverride(<ad>, url)` çağrılır (Studio; çıkış adları `app`, `directions`, `stores`). MRAID varsa `mraid.open` kullanılır. Hiçbiri yoksa `config.exits` adresleri açılır.
- **Ölçüm:** Etkileşimler `track()` ile `Enabler.counter`’a ve üst pencereye (`postMessage`) gönderilir. Sunum sayfası her kartın altında bu olayları canlı gösterir.
- `prefers-reduced-motion` desteklenir; düğmeler klavyeyle odaklanabilir.

## Güncellenecek yer tutucular

`src/config.js` dosyasında:

| Alan | Şu an | Yapılacak |
|---|---|---|
| `brand.logoSvg` | “coffy” yazı logosu | Resmi logo SVG’si |
| `:root` renkleri (`src/base.css`) | Espresso / krem / turuncu | Kurumsal renk kodları |
| `video.src`, `video.poster` | Animasyonlu yer tutucu | CDN’deki 6 sn kesit |
| `stores` (`storesSample: true`) | 8 örnek şube | Coffy şube feed’i; `storesSample: false` yapılınca “örnek şube verisi” etiketi kalkar |
| `offer` | `COKDACOFFY` örnek kod | Gerçek teklif ve kanal bazlı kodlar |
| `drinks` | Örnek içecek adları | Güncel menü |
| `exits` | coffy.com.tr (UTM yok) | Uygulama derin bağlantısı / kampanya sayfası |

## Derleme

```bash
node coffy/build.js           # dist/, zip'ler, preview/index.html, release/ (Node 18+, ek paket gerekmez)
node coffy/tools/capture.js   # (isteğe bağlı) preview/screens/ ekran görüntüleri (Playwright + Chromium)
node coffy/tools/smoke.js     # (isteğe bağlı) 10 bannerın etkileşim duman testi
```

## Klasör yapısı

```
coffy/
  LANSMAN-PLANI.md         Lansman ve sürdürme planı
  src/config.js            Metinler, video, teklif, çıkışlar, şube verisi
  src/base.css             Ortak stil (renk değişkenleri)
  src/engine.js            Ortak motor: video aşaması, konum, çıkış, ölçüm, bitiş kartı
  src/shared.js            Bardak SVG'si ve sayfa şablonu
  src/concepts-mobile.js   01–07 (320×480)
  src/concepts-wide.js     08–10 (970×250)
  build.js                 Derleyici
  dist/                    Yüklemeye hazır bannerlar + zip'ler
  preview/                 Sunum sayfası + ekran görüntüleri
  release/                 Tek dosyalık sunum + teslim zip'i
  tools/                   Ekran görüntüsü ve duman testi
```
