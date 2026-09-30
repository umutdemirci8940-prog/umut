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

## DV360 / CM360 yayın paketi

`release/` altındaki zip'ler doğrudan DV360'a (veya CM360'a) HTML5 kreatif olarak yüklenir:

| Paket | İçerik | Boyut |
|---|---|---|
| `release/aygaz-100oktan-970x250-dv360.zip` | index.html + JS/CSS + poster + **4 video paket içinde** | ~7,8 MB |
| `release/aygaz-100oktan-970x250-dv360-s3video.zip` | Aynı kreatif, videolar S3'ten (`/Aygaz/Aile.mp4` …) | ~0,14 MB |

Platformun HTML5 zip boyut sınırı videolu paketi kabul etmezse ikinci paket kullanılır; bu durumda dört mp4 S3'te `/Aygaz/` altına aynı adlarla yüklenmelidir.

Paket özellikleri:

- `<meta name="ad.size" content="width=970,height=250">`; tek `index.html`, dosyalar kök dizinde, üst klasör yok.
- JSX önceden derlenmiş, Tailwind CSS statik; React/ReactDOM paket içinde. Tarayıcıda Babel veya Tailwind CDN yüklenmez (önizleme `Aygaz3.html` bunları CDN'den yükler).
- Tıklama: `var clickTag = "<CM360 click tracker>"` `index.html` içinde tanımlıdır (`dv360.config.json` → `clickTag`). CTA ve istasyon düğmesi dahil tüm tıklamalar bu adrese gider; `${GDPR}` / `${GDPR_CONSENT_755}` makrolarını DV360 yayında doldurur. İstasyon düğmesi için ayrı tracker istenirse `clickTag1` alanına yazılır.
- Ses kapalı başlar, kullanıcı tıklamasıyla açılır (otomatik sesli oynatma yok).
- Logo `https://100oktan.aygaz.com.tr/assets/images/logo/logo-white.png` adresinden canlı yüklenir (bu ortamdan indirilemediği için pakete gömülemedi). PNG dosyası `assets/logo-white.png` olarak konursa derleme paket içine alır.

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
Aygaz/Aile.mp4
Aygaz/Beyazyaka.mp4
Aygaz/Taksi.mp4
Aygaz/filoyoneticisi.mp4
```

Videolar başka bir klasörde/CDN'de duracaksa `Aygaz3.html` içinde `ASSETS.VIDEO_BASE` değerine klasör adresi yazılır (sonu `/` ile bitmeli).

## Bu klasördeki videolar

Müşterinin gönderdiği orijinaller 640×360, 25 fps, ~10,5 Mbps (dosya başına ~20 MB) idi. Buradaki kopyalar aynı çözünürlük ve sürede, web için yeniden kodlanmış hâlidir (H.264 High, CRF 23, AAC 96 kb/s, faststart): dosya başına 1,8–2,3 MB. Bannerdaki 340 px'lik oynatıcıda görsel fark yoktur; istenirse orijinaller de aynı adlarla yüklenebilir, HTML değişmez.

```bash
ffmpeg -i Aile.mp4 -c:v libx264 -profile:v high -level 3.1 -preset slow -crf 23 -pix_fmt yuv420p -g 50 \
       -c:a aac -b:a 96k -ac 2 -movflags +faststart Aile.web.mp4
```

## İstasyon Bul sekmesi verileri

Kaynak: `https://100oktan.aygaz.com.tr/nerede.html` (müşterinin gönderdiği görsel). Değerler `Aygaz3.html` → `STATION_STATS` altında:

| Kart | Değer | Etiket |
|---|---|---|
| Dünya | 80.000 | Dünya Genelinde LPG istasyonu |
| Türkiye | 1.900+ | Türkiye'de Aygaz istasyonu |
| 100+ Oktan | Aygaz | 100+ Oktan, Aygaz'ın tüm istasyonlarında! |

Sayılar sekme açılınca 0'dan sayar ve Türkçe biçimde (nokta binlik ayracı) gösterilir. "100+ Oktan Gücü" sekmesindeki "Aygaz Güvencesi" kartı da aynı kaynağa göre 1.700+ → 1.900+ olarak güncellendi. Önizleme: `preview-istasyon-bul.png`.

## Değişmeyenler

Tasarım, metinler, sekmeler, hesaplayıcı, intro ve tıklama hedefleri onaylanan `Aygaz2.html` ile aynıdır. Logo (`100oktan.aygaz.com.tr`) ve poster (`aygaz.jpg`) hâlâ eski adreslerinden okunur; kampanya görseli geldiğinde `ASSETS.KEY_VISUAL_URL` ile değiştirilecektir.
