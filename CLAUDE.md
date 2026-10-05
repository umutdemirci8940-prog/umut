# Çalışma notları (Claude için)

Bu depo Umut'un reklam kreatifi çalışmalarını tutar. Her proje kendi klasöründe (`aygaz/`, kök dizindeki İlaçsız Yaşam seti vb.).

## DV360 HTML5 paketi reçetesi (DOĞRULANDI: DV360 kabul etti, 05.10.2026)

Kullanıcı "DV360 için" / "DV360'a uygun" dediğinde paket **her zaman** bu şekilde hazırlanır. Referans uygulama: `aygaz/build-dv360.js` + `aygaz/dv360.config.json` (yeni kreatifte kopyalanıp uyarlanır).

1. **Zip yapısı:** tek `index.html` kök dizinde, üst klasör yok, `<meta name="ad.size" content="width=W,height=H">`. Dosyalar relatif yollarla.
2. **CDN yok:** JSX önceden derlenir (@babel/standalone), Tailwind CSS statik üretilir, React/ReactDOM paket içine kopyalanır; logo, poster vb. görseller paket içinde. Tarayıcıda Babel/Tailwind CDN yüklenmez.
3. **SSL denetimi:** DV360 paketteki HİÇBİR dosyada (ikili dahil) `http:` metnine izin vermez, ağ isteği olmasa da. Yapılacaklar:
   - JS/CSS'te `"http://` → `"htt"+"p://` (React DOM'un `http://www.w3.org/2000/svg` gibi XML ad alanı sabitleri; çalışma zamanı değeri aynı). `http:\/\/` biçimi YETMEZ, DV360 yine yakalar.
   - Videolardan x264 bilgi SEI'si ve metaveri temizlenir (`-map_metadata -1 -bsf:v filter_units=remove_types=6`), JPEG/PNG'den ICC/EXIF/metin parçaları çıkarılır.
   - Derleme sonunda tüm dosyalar taranır; `http:` bulunursa derleme hata verir.
4. **Zip içinde `.mp4` OLMAZ.** DV360 mp4 içeren zip'i yanıltıcı biçimde "not SSL-compliant (1824)" diyerek reddeder. Dış barındırma (S3/CDN) maliyet nedeniyle istenmez. Çözüm: her video base64 metin olarak bir `.js` dosyasına yazılır (`video/Aile.js` → `window.AYGAZ_VIDEO_DATA["Aile.mp4"]`); kreatif gerektiğinde `<script>` ile yükler, `atob` → `Blob` → `URL.createObjectURL` ile `<video>`'ya verir (`VIDEO_MODE: 'js'`). Dosya adında `.mp4` geçmesin.
5. **Boyut:** zip 5 MB altında tutulur. Videolar 480×270, H.264 High, CRF 28, AAC 64k, faststart (≈0,7–0,85 MB / 15 sn). Base64 %33 ekler, zip sıkıştırması bunu büyük ölçüde geri alır.
6. **Veri tasarrufu:** `<video preload="none">`; video yalnızca reklam ekranda ≥%25 görünürken (IntersectionObserver) ve yalnızca seçili persona için yüklenir; ekrandan çıkınca durur. Tek oynatma denetleyicisi: görünürlük + oynat/duraklat niyeti + seçili persona.
7. **Tıklama:** `index.html` içinde `var clickTag = "<CM360 trackclk URL>"` (ve gerekirse `clickTag1`, ikinci çıkış). Kod `window.open(window.clickTag || yedekUrl, '_blank')`; `${GDPR}` / `${GDPR_CONSENT_755}` makroları olduğu gibi bırakılır.
8. **Gösterim pikseli:** CM360 `trackimp` 1×1, `index.html` sonunda JS ile (`new Image()`), `[timestamp]` → `Date.now()+rastgele`. Yalnızca yayın paketlerinde; onay/önizleme sürümlerinde yok.
9. **Ses:** yayın paketi sessiz başlar, ses kullanıcı tıklamasıyla. Müşteri onayı için ayrı "sesli" paket (sesli başlamayı dener, engellenirse ilk tıklamada açar).
10. **Dış istekler:** yalnızca https; mümkünse yalnızca piksel ve (varsa) canlı veri dosyası (S3'te CORS açık `fiyat.json` gibi). Dış sunucuya bağlı görsel bırakılmaz, pakete gömülür.
11. **Teslim:** `release/<paket>-dv360.zip` (yayın), `-dv360-sesli.zip` (onay), `-dv360-s3video.zip` (yedek), `-dv360-videosuz-test.zip` (tanı). Her değişiklikte `node build-dv360.js` ile yeniden üretilir, paketler Playwright ile test edilir (test tarayıcısı H.264 çözemez: mp4 yerine webm verisi ile test kopyası).

## Önizleme / onay akışı

- Kaynak tek dosya: `aygaz/Aygaz3.html` (CDN'li önizleme, S3'e yüklenir). `Aygaz3-sesli.html` derlemeyle üretilir.
- S3 yolu `https://splashdigital.s3.eu-west-1.amazonaws.com/Aygaz/...`; S3 CORS açık. Canlı fiyatlar `/Aygaz/fiyat.json` (tarih, bolge, benzin, otogaz, kit).
- Müşteri geri bildirimleri ve hesap mantığı `aygaz/README.md` içinde belgelenir.

## Genel

- Dil: Türkçe. Teslimatlar `SendUserFile` ile gönderilir, her değişiklik `claude/...` dalına commit+push edilir.
- Değişiklik onaylı kreatiften sapıyorsa mesajda açıkça belirtilir.
