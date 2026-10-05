# Aygaz 100+ Oktan – 970×250 Masthead (persona videolu revizyon)

Onaylanan çalışma: `https://splashdigital.s3.eu-west-1.amazonaws.com/Aygaz/Aygaz2.html`
Bu klasördeki `Aygaz3.html`, aynı çalışmanın müşterinin gönderdiği **persona başına ayrı video** ile güncellenmiş hâlidir.

## Persona ↔ video eşleşmesi

Eşleşme, bannerdaki persona başlığı ile müşterinin video dosya adları üzerinden yapılır (`Aygaz3.html` → `PERSONA_VIDEOS`):

| Bannerdaki başlık | Video dosyası |
|---|---|
| Aile | `Aile.mp4` |
| Beyaz Yaka | `Beyazyaka.mp4` |
| Taksici | `Taksi.mp4` |
| Filo Yöneticisi | `filoyoneticisi.mp4` |

Dosya adları müşterinin gönderdiği gibi bırakıldı; S3 büyük/küçük harfe duyarlı olduğu için yüklerken adlar birebir aynı olmalıdır.

## Davranış

- Banner açılınca (intro'nun altında) **Aile** videosu sessiz olarak başlar.
- Bir persona düğmesine basılınca o personanın videosu **baştan** oynar, önceki video durur; geçiş 300 ms yumuşatmalıdır.
- Oynat/duraklat ve ses düğmeleri aktif videoyu yönetir; ses açıkken persona değiştirilirse yeni video da sesli oynar.
- Diğer sekmelerde ("100+ Oktan Gücü", "Tasarruf Hesapla", "İstasyon Bul") seçili personanın videosu oynamaya devam eder.
- Dört `<video>` elemanı üst üste durur; sadece aktif olan `preload="auto"`, diğerleri `preload="metadata"` ile beklediği için ilk yüklemede yalnızca bir video indirilir.
- Müşterinin videolarının alt kenarındaki yasal ibare ("Trafiğe kapalı alanda çekilmiştir…") görünür kalsın diye video `object-position: bottom` ile yerleştirildi ve oynat/ses düğmeleri sol alttan **sol üste** alındı.

## Sesli onay sürümü: `Aygaz3-sesli.html`

Müşteri onayı için `Aygaz3.html` ile aynı kreatif, tek farkı sesli başlamayı denemesi (`window.AYGAZ_OPTIONS.startUnmuted`). Tarayıcılar kullanıcı etkileşimi olmadan sesli otomatik oynatmaya izin vermediği için davranış şöyledir:

- Tarayıcı izin verirse video sesli başlar.
- Engellerse sessiz başlar, kontrollerin yanında "Ses için tıklayın" uyarısı görünür ve banner içindeki ilk tıklama ("Geç", persona, sekme…) sesi açar.

Dosya S3'e videolarla aynı klasöre konur (`/Aygaz/Aygaz3-sesli.html`). Yayın paketlerine girmez; reklamda ses yalnızca kullanıcı tıklamasıyla açılır.

## DV360 / CM360 yayın paketi

`release/` altındaki zip'ler doğrudan DV360'a (veya CM360'a) HTML5 kreatif olarak yüklenir:

| Paket | İçerik | Boyut |
|---|---|---|
| `release/aygaz-100oktan-970x250-dv360.zip` | **Yayın.** index.html + JS/CSS + logo + poster + 4 video **base64 kodlu .js dosyaları olarak** paket içinde | ~3,2 MB |
| `release/aygaz-100oktan-970x250-dv360-sesli.zip` | Müşteri onayı için aynı paket, sesli başlar. Yayına verilmez. | ~3,2 MB |
| `release/aygaz-100oktan-970x250-dv360-s3video.zip` | Yedek: videolar S3'ten (`dv360.config.json` → `videoBaseS3`) | ~0,15 MB |
| `release/aygaz-100oktan-970x250-dv360-videosuz-test.zip` | Tanı: videosuz paket; DV360 HTML/JS'i kabul ediyor mu testi | ~0,15 MB |

### Videolar neden .js?

DV360, zip içinde `.mp4` dosyası olan paketi "SSL uyumsuz" (kod 1824) diyerek reddediyor; aynı kreatif videolar dışarıdan linklenince kabul ediliyor (gözlem). Dış barındırma istenmediği için her mp4, base64 metin olarak bir `.js` dosyasına yazılır (`video/Aile.js` → `window.AYGAZ_VIDEO_DATA["Aile.mp4"]`). Kreatif, video gerektiğinde bu dosyayı `<script>` ile yükler, base64'ü çözüp `Blob` URL olarak `<video>`'ya verir (`Aygaz3.html` → `VIDEO_MODE: 'js'`). Metin dosyasında ikili veri ya da `http:` bulunamaz (base64 alfabesinde iki nokta yoktur), dosya tipi filtresine takılmaz. Base64 payı %33 olduğu için videolar 480×270 / CRF 28 ile 0,67–0,84 MB'a indirildi; zip sıkıştırması base64'ü iyi sıkıştırdığı için paket 3,2 MB.

### Veri tasarrufu (görünürlük kapısı)

- Videolar `preload="none"`; hiçbir video, reklam ekranda en az %25 görünene kadar yüklenmez (IntersectionObserver). Görünmeyen gösterimlerde video verisi hiç indirilmez.
- Yalnızca seçili personanın videosu yüklenir; diğerleri tıklanana kadar yüklenmez.
- Reklam ekrandan çıkınca video durur, geri gelince kaldığı yerden devam eder.

### Paket özellikleri

- `<meta name="ad.size" content="width=970,height=250">`; tek `index.html`, dosyalar kök dizinde, üst klasör yok.
- JSX önceden derlenmiş, Tailwind CSS statik; React/ReactDOM, logo ve poster paket içinde. Dışarıya yalnızca iki https isteği: CM360 gösterim pikseli ve S3'teki `fiyat.json`.
- Tıklama: `var clickTag = "<CM360 click tracker>"` `index.html` içinde tanımlıdır (`dv360.config.json` → `clickTag`). "Şimdi İncele" CTA'sı bu adrese gider; `${GDPR}` / `${GDPR_CONSENT_755}` makrolarını DV360 yayında doldurur. İstasyon Bul sekmesindeki "Size En Yakın Aygaz İstasyonunu Haritada Bulun" satırı (sağındaki link dahil) ikinci çıkış `clickTag1` ile doğrudan `https://100oktan.aygaz.com.tr/nerede.html` adresine gider; DV360 iki clickTag'i de ayrı çıkış olarak algılar.
- Ses kapalı başlar, kullanıcı tıklamasıyla açılır (otomatik sesli oynatma yok).
- Gösterim sayacı: CM360 `trackimp` 1×1 pikseli `index.html` sonunda JavaScript ile eklenir (`dv360.config.json` → `impressionPixel`). `[timestamp]` her yüklemede rastgele sayıyla değiştirilir (cache-buster), `${GDPR}` / `${GDPR_CONSENT_755}` makroları olduğu gibi kalır. Piksel yalnızca yayın paketlerinde (dv360, dv360-s3video) vardır; onay (sesli) ve önizleme sürümlerinde gösterim sayılmaz.
- SSL uyumu: DV360, paketteki dosyaların içinde geçen her `http:` metnini reddeder (ağ isteği olmasa da). Derleme JS/CSS'teki `"http://` dizgilerini `"htt"+"p://` olarak yazar (React DOM'un XML ad alanı sabitleri; çalışma zamanı değeri aynı), video dosyalarından x264 bilgi SEI'si ve metaveri, poster/logo görsellerinden ICC/EXIF/metin parçaları temizlenmiştir. Derleme sonunda tüm dosyalar (ikili dahil) taranır, `http:` bulunursa derleme hata verir.
- Logo: `assets/logo-white.png` (müşteriden) pakete gömülür.

Yeniden üretmek için (Node 18+):

```bash
cd aygaz
npm install
node build-dv360.js      # dist/dv360*, release/*.zip
```

## Yayınlama (S3, önizleme)

`Aygaz3.html` videoları kendi bulunduğu klasörden okur. Yani S3'te `/Aygaz/` altına HTML ile birlikte dört mp4'ü aynı adlarla yüklemek yeterlidir:

```
Aygaz/Aygaz3.html
Aygaz/fiyat.json
Aygaz/Aile.mp4
Aygaz/Beyazyaka.mp4
Aygaz/Taksi.mp4
Aygaz/filoyoneticisi.mp4
```

Videolar başka bir klasörde/CDN'de duracaksa `Aygaz3.html` içinde `ASSETS.VIDEO_BASE` değerine klasör adresi yazılır (sonu `/` ile bitmeli).

## Bu klasördeki videolar

Müşterinin gönderdiği orijinaller 640×360, 25 fps, ~10,5 Mbps (dosya başına ~20 MB) idi. Buradaki kopyalar DV360'ın HTML5 paket boyutu için yeniden kodlandı: **480×270**, H.264 High, CRF 26, preset slower, AAC 64 kb/s, faststart; dosya başına 0,8–1,0 MB, dört video toplam ~3,7 MB, videolu zip ~3,9 MB. Bannerdaki 340 px'lik oynatıcıda önceki 640p sürümden görsel fark yoktur; yasal ibare okunaklıdır. Orijinaller aynı adlarla yüklenirse HTML değişmez.

```bash
ffmpeg -i Aile.mp4 -vf "scale=480:-2:flags=lanczos" -c:v libx264 -profile:v high -level 3.1 -preset slower -crf 26 \
       -pix_fmt yuv420p -g 50 -c:a aac -b:a 64k -ac 2 -movflags +faststart Aile.web.mp4
```

## İstasyon Bul sekmesi verileri

Kaynak: `https://100oktan.aygaz.com.tr/nerede.html` (müşterinin gönderdiği görsel). Değerler `Aygaz3.html` → `STATION_STATS` altında:

| Kart | Değer | Etiket |
|---|---|---|
| Dünya | 80.000 | Dünya Genelinde LPG istasyonu |
| Türkiye | 1.900+ | Türkiye'de Aygaz istasyonu |
| 100+ Oktan | Aygaz | 100+ Oktan, Aygaz'ın tüm istasyonlarında! |

Sayılar sekme açılınca 0'dan sayar ve Türkçe biçimde (nokta binlik ayracı) gösterilir. "100+ Oktan Gücü" sekmesindeki "Aygaz Güvencesi" kartı da aynı kaynağa göre 1.700+ → 1.900+ olarak güncellendi. Önizleme: `preview-istasyon-bul.png`.

## Metin revizeleri (müşteri geri bildirimi)

- Aile personası sloganı: "Ailenizin Güvenliği ve Bütçe Dostu Otogaz" → **"Ailenize Güvenli, Bütçenize Dost Otogaz"** (anlatım bozukluğu düzeltildi; alternatifler için teslim notuna bakın).
- Aile personası faydası: "%20-25 varan yakıt tasarrufu" → **"Benzine kıyasla %40'a varan tasarruf"** (marka yönlendirmesi).
- "100+ Oktan Gücü" sekmesindeki "Maksimum Tasarruf" rozeti aynı iddiayla tutarlı olsun diye %45 → **%40**.
- Bu metinler yalnızca "Sürücü Profilleri" sekmesindeki persona kartında, ilgili persona seçiliyken görünür (Aile açılışta varsayılan). Alt bardaki yazı persona rozetidir ("Güvenli & Konforlu Sürüş").

## Tasarruf Hesapla formülü

Aygaz'ın kendi "Yakıt Tasarrufu Hesapla" aracıyla (aygaz.com.tr / Aygaz uygulaması) **aynı yöntem ve aynı çıktılar**. `Aygaz3.html` → `CALC`:

- Girdi: "1 Yılda Yapılan Mesafe" kaydırıcısı (5.000–50.000 km, varsayılan 18.000).
- Fiyatlar (02.10.2026, İstanbul Anadolu Yakası): benzin 84,50 TL/L (opet.com.tr), otogaz 43,29 TL/L (EPDK'ya bildirilen Aygaz tavan fiyatı). Canlı değerler `fiyat.json`'dan gelir (aşağıda).
- Tüketim: benzin 8,0 L/100 km, otogaz 9,6 L/100 km (Aygaz'ın aracı otogazı %20 fazla alır).
- Dönüşüm kiti: 56.000 TL (Aygaz aracındaki "Yaklaşık Kit Fiyatı" varsayılanı; `fiyat.json` → `kit` ile değiştirilebilir).
- Sekmede "Benzine kıyasla %40'a varan tasarruf." ifadesi ve fiyat dayanağı satırı görünür.

| Çıktı | Formül | 18.000 km örneği |
|---|---|---|
| Yıllık Benzin Tüketiminiz | km/100 × 8,0 × benzin fiyatı | 121.680 TL |
| Yıllık Otogaz Tüketiminiz | km/100 × 9,6 × otogaz fiyatı | 74.805 TL |
| Otogaz ile Yıllık Kazancınız | benzin − otogaz | 46.875 TL |
| Tasarruf Oranı | kazanç ÷ benzin maliyeti | %39 |
| Geri Dönüş Süresi | kit fiyatı ÷ kazanç × 12 | 14 Ay |

Doğrulama: Aygaz uygulamasına 1.500 km, 84,50 / 43,29, 8 L, 56.000 TL girildiğinde 10.140 / 6.234 / 3.906 TL, %39 ve 172 ay çıkar; aynı girdiyle bu formül birebir aynı sonuçları verir. Uygulamadaki "Aracın 100 km'de tasarrufu" kutusu (39 TL) yıllık kazancın yüzde biri olarak hesaplanıyor ve mesafeyle tutarsız olduğu için bannerda gösterilmedi. Önceki "%40 üst sınırı" kaldırıldı; uygulama gibi gerçek oran gösterilir.

### Güncel fiyatlar: `fiyat.json` (yeniden yükleme gerekmez)

Kreatif açılırken `fiyat.json` dosyasını okur ve hesapta oradaki fiyatları kullanır; dosyaya ulaşamazsa veya içerik geçersizse (otogaz ≥ benzin, sayı değil, 0) sessizce `CALC` içindeki gömülü fiyatlara düşer. Böylece fiyat değişince **yalnızca S3'teki `fiyat.json` güncellenir**, DV360'daki kreatife dokunulmaz.

```json
{ "tarih": "2026-10-02", "bolge": "İstanbul Anadolu Yakası", "benzin": 84.50, "otogaz": 43.29, "kit": 56000 }
```

- Önizleme (`Aygaz3.html`, `Aygaz3-sesli.html`): HTML ile aynı klasördeki `fiyat.json` (S3'te `/Aygaz/fiyat.json`).
- Yayın paketleri: `dv360.config.json` → `priceUrl` (`https://splashdigital.s3.eu-west-1.amazonaws.com/Aygaz/fiyat.json`). Boş bırakılırsa hiç denenmez.
- S3 bucket'ında CORS açık olmalı (Bucket → Permissions → CORS):

```json
[{ "AllowedOrigins": ["*"], "AllowedMethods": ["GET", "HEAD"], "AllowedHeaders": ["*"], "MaxAgeSeconds": 3000 }]
```

- Dosya `cache: no-store` ile okunur; S3'te ek önbellek ayarı gerekmez. Kreatifin önünde CDN varsa dosyanın önbellek süresi kısa tutulmalıdır.
- Hesaplayıcı sekmesinde dayanak satırı gösterilir: "02.10.2026 tarihli İstanbul Anadolu Yakası fiyatları: benzin 84,50 TL/L, otogaz 43,29 TL/L". Tarih, bölge, fiyatlar ve kit fiyatı `fiyat.json`'dan gelir (`tarih` YYYY-AA-GG biçiminde yazılırsa GG.AA.YYYY olarak gösterilir; `bolge` veya `kit` yoksa gömülü değerler kullanılır).
- Hesaplayıcı kartındaki `data-fiyat-kaynak` özniteliği `fiyat.json` veya `gomulu` değerini taşır; tarayıcı denetçisinden hangi fiyatın kullanıldığı görülür.

Otomatik güncelleme: `fiyat.json`'ı dolduracak zamanlanmış bir iş (ör. GitHub Actions) için güvenilir bir fiyat kaynağı gerekir; Aygaz uygulamasının kullandığı fiyat servisi alınabilirse günlük otomatik yazım kurulabilir.

## Değişmeyenler

Tasarım, metinler, sekmeler, hesaplayıcı, intro ve tıklama hedefleri onaylanan `Aygaz2.html` ile aynıdır. Logo (`100oktan.aygaz.com.tr`) ve poster (`aygaz.jpg`) hâlâ eski adreslerinden okunur; kampanya görseli geldiğinde `ASSETS.KEY_VISUAL_URL` ile değiştirilecektir.
