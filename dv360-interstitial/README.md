# DV360 HTML5 Interstitial (video)

Bir videoyu DV360'a yüklenebilir HTML5 interstitial zip'ine çevirir. Bu yöntem DV360'ta test edildi ve çalışıyor.

```bash
python3 dv360-interstitial/build.py VIDEO.mp4 \
  --click "https://run.admost.com/adx/goto.ashx?pbk=..." \
  --impression "https://run.admost.com/adx/count.ashx?pbk=..." \
  --out cikti.zip
```

Seçenekler: `--size 320x480` (varsayılan), `--max-mb 3` (varsayılan).
`ffmpeg` sistemde yoksa script `imageio-ffmpeg` paketini kurup onu kullanır.

## Kullanıcının istediği varsayılanlar

- Zip en fazla **3 MB**.
- Reklam boyutu **320x480** (`<meta name="ad.size">`, `clickTag` değişkeni).
- Video **kırpılmaz** (`object-fit: contain`), kalan boşluklar siyah olur.
- Video otomatik, sessiz ve inline oynar. Ses aç/kapa butonu var, video bitince tekrar oynat butonu çıkar.
- Tıklama `clickTag` ile, impression `<img>` pikseli ile HTML içinde. Tıklama ve impression URL'leri her video için kullanıcıdan alınır.

## DV360 "not SSL-compliant (1824)" hatası: öğrenilenler

1. **Videoyu zip'e `.mp4` olarak koyma.** DV360 bu durumda, dosyada hiç `http` geçmese bile SSL hatası veriyor.
   Çözüm: Video base64'e çevrilip `video.js` içine gömülüyor, tarayıcıda Blob'a çevrilip oynatılıyor. CDN gerekmiyor (kullanıcı CDN maliyeti istemiyor).
2. x264 videonun içine `http://www.videolan.org/x264.html` imzası (SEI) yazıyor. Bu imza `filter_units=remove_types=6` ile siliniyor.
3. base64 metninde tesadüfen `http` harf dizisi oluşabiliyor (ilk videoda 4 kez oluştu). Bu yerler string'ler bölünerek kırılıyor.
4. AdMost impression pikseli sorun **değildi**.

Not: Playwright'ın Chromium'u H.264 oynatamıyor. Burada oynatma testi yapılamaz, yalnızca decode ve hash ile doğrulama yapılabilir.
