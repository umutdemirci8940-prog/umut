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

## Yayınlama (S3)

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

## Değişmeyenler

Tasarım, metinler, sekmeler, hesaplayıcı, intro ve tıklama hedefleri onaylanan `Aygaz2.html` ile aynıdır. Logo (`100oktan.aygaz.com.tr`) ve poster (`aygaz.jpg`) hâlâ eski adreslerinden okunur; kampanya görseli geldiğinde `ASSETS.KEY_VISUAL_URL` ile değiştirilecektir.
