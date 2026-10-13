# Kıymet: App Store ve Google Play Yayın Rehberi

Bu rehber, Kıymet'i mağazalara çıkarmak için gereken her adımı sırayla anlatır.
**[SİZ]** işaretli adımları yalnızca siz yapabilirsiniz (kimlik doğrulama, ödeme, hesap girişi).
**[HAZIR]** işaretli olanlar repoda hazırdır.

---

## 0. Hazır olanlar

| Ne | Nerede |
|---|---|
| Uygulama ikonu (çalışma dosyası SVG) | `brand/logo-icon.svg`, PNG: `brand/export/` |
| Yatay logo, şeffaf işaret | `brand/logo-horizontal.svg`, `brand/logo-mark.svg` |
| App Store ekran görüntüleri (6.9", 1320×2868) | `store/appstore/iphone-6.9-1…6.png` |
| Google Play ekran görüntüleri (1080×1920) | `store/googleplay/phone-1…6.png` |
| Google Play öne çıkan görsel (1024×500) | `store/googleplay/feature-graphic-1024x500.png` |
| Görsel şablonu (başlıkları buradan değiştirin) | `store/poster.html` → `node store/render-all.cjs` |
| Ham uygulama ekranları | `store/screens-raw/` → üretici: `app/test_store/store_screenshots_test.dart` |
| Mağaza metinleri (karakter sınırları kontrol edildi) | `store/metadata/appstore-tr.md`, `store/metadata/googleplay-tr.md` |
| Gizlilik politikası ve destek sayfası | `site/privacy.html`, `site/index.html` |
| Otomatik yayın iş akışı | `.github/workflows/kiymet-release.yml` |
| iPhone'a özel ayar, şifreleme beyanı | `ios/Runner/Info.plist`, `TARGETED_DEVICE_FAMILY = 1` |

---

## 1. Veri lisansları

**Karar (A):** İlk sürümde **BIST hisseleri kapalı** (`lib/config.dart` → `stocksEnabled`).
Lisanslı bir kaynak bağlandığında `--dart-define=KIYMET_STOCKS=true` ile tek ayarla açılır.
Mağaza adı, metinler ve görseller buna göre güncellendi (borsa/hisse ifadesi yok).

| Veri | Kaynak | Durum |
|---|---|---|
| Döviz | TCMB | ✅ Resmî, herkese açık |
| Enflasyon | OECD, BIS | ✅ Herkese açık, kaynak belirtilerek |
| BIST hisseleri | – | ⏸ İlk sürümde kapalı |
| Kripto | BtcTurk / Binance herkese açık API | ⚠️ Ticari kullanım izni teyit edilemedi |
| Altın/gümüş | Binance PAXG, gold-api.com | ⚠️ Ticari kullanım izni teyit edilemedi |

**Kripto ve altın için yapılacak (yayından önce):**
1. **BtcTurk'e yazılı izin talebi:** Türk borsası, kaynak gösterilerek (“Fiyatlar: BtcTurk”) gösterim izni isteyebiliriz.
   Onlar için ücretsiz tanıtım olduğundan olumlu dönme ihtimali yüksek. Talep e-postası taslağı aşağıda.
2. **Altın için ticari kullanıma açıkça izin veren bir kaynak:** ör. metalcharts.org (ücretsiz plan dahil
   ticari kullanıma izinli olduğunu belirtiyor), ya da ücretli bir metal fiyat API'si. Seçilen kaynağa ben geçiririm.
3. Alternatif: CoinGecko'nun ücretli planı, "Data provided by CoinGecko" ibaresiyle ticari kullanıma izin veriyor.

### BtcTurk izin talebi: e-posta taslağı
```
Konu: Herkese açık piyasa verisi API'sinin mobil uygulamada gösterimi için izin talebi

Merhaba,

"Kıymet" adlı kişisel finans uygulamasını (iOS/Android) geliştiriyorum. Uygulama, kullanıcıların
kendi girdikleri altın, döviz ve kripto varlıklarının güncel TL değerini gösteriyor; alım-satım,
emir iletimi veya saklama hizmeti sunmuyor.

Kripto para TL fiyatlarını (son fiyat ve 24 saatlik değişim) api.btcturk.com/api/v2/ticker
uç noktasından, dakikada en fazla birkaç istekle alıp uygulamada "Fiyatlar: BtcTurk" kaynak
ibaresiyle göstermek istiyoruz.

Bu kullanım için yazılı izninizi rica eder, varsa uymamız gereken koşulları (kaynak gösterme,
istek sınırı, ticari lisans) öğrenmek isteriz.

Saygılarımla,
<Ad Soyad> · <e-posta> · <telefon>
```

---

## 2. Geliştirici hesapları **[SİZ]**

### Apple Developer Program (yıllık 99 USD)
1. https://developer.apple.com/programs/enroll/ → Apple ID ile giriş (iki adımlı doğrulama açık olmalı).
2. **Bireysel (Individual)** olarak kaydolun. Mağazada satıcı adı olarak adınız soyadınız görünür.
   Şirket adıyla görünmesi için **Organization** seçilir, ama bu D-U-N-S numarası gerektirir.
3. Ödemeyi yapın. Onay genellikle 24-48 saat sürer.

### Google Play Console (tek seferlik 25 USD)
1. https://play.google.com/console/signup → kişisel hesap → kimlik doğrulama.
2. ⚠️ **Yeni kişisel hesaplarda kural:** Üretime çıkmadan önce **en az 12 test kullanıcısıyla 14 gün kapalı test**
   yapılması zorunlu. Bu süreyi hemen başlatmak için Android'i iOS'tan önce kapalı teste alalım.

---

## 3. Gizlilik ve destek sayfasını yayınlama **[SİZ + BEN]**

Apple ve Google, **herkese açık** bir gizlilik politikası adresi ister.
1. `site/` içindeki dosyalarda `{{GELISTIRICI_ADI}}` ve `{{DESTEK_EPOSTA}}` yer tutucularını doldurmam için bilgileri bana iletin.
2. Yayınlama seçenekleri:
   - **GitHub Pages (ücretsiz, önerilen):** Size ait **herkese açık** yeni bir repo (ör. `kiymet-site`) açılır, `site/` dosyaları oraya konur.
     Adres `https://<kullanıcı-adınız>.github.io/kiymet-site/` olur. İzin verirseniz repoyu ben oluşturup dosyaları yüklerim.
   - Alternatif: Netlify Drop'a (app.netlify.com/drop) `site` klasörünü sürükleyip bırakmak.

---

## 4. App Store Connect kurulumu **[SİZ]**

1. **Bundle ID kaydı:** developer.apple.com → Certificates, Identifiers & Profiles → Identifiers → **+** →
   App IDs → App → Description: `Kiymet`, Bundle ID (Explicit): **`app.kiymet.kiymet`** → Register.
2. **Uygulama kaydı:** appstoreconnect.apple.com → Uygulamalarım → **+** → Yeni Uygulama:
   Platform iOS · Ad: `Kıymet: Altın, Döviz, Kripto` · Birincil dil: Türkçe · Bundle ID: `app.kiymet.kiymet` · SKU: `kiymet-ios`.
3. **API anahtarı (otomatik yükleme için):** App Store Connect → Kullanıcılar ve Erişim → Entegrasyonlar →
   App Store Connect API → Ekip Anahtarları → **+** → Ad: `GitHub`, Erişim: **Admin** → Oluştur.
   - `.p8` dosyasını indirin (**yalnızca bir kez indirilebilir**).
   - Sayfadaki **Issuer ID** ve anahtarın **Key ID** değerini not edin.
4. **Team ID:** developer.apple.com → Account → Membership details → Team ID.

---

## 5. GitHub Secrets **[SİZ]**

GitHub → `umut` reposu → **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Değer |
|---|---|
| `APPLE_TEAM_ID` | 4. adımdaki Team ID (10 karakter) |
| `ASC_KEY_ID` | API anahtarının Key ID'si |
| `ASC_ISSUER_ID` | Issuer ID |
| `ASC_KEY_P8` | İndirdiğiniz `.p8` dosyasının **içeriğinin tamamı** (`-----BEGIN PRIVATE KEY-----` dahil) |
| `KIYMET_UPLOAD_KEYSTORE_BASE64` | Size gönderdiğim `kiymet-anahtarlar.zip` içindeki `upload-keystore-base64.txt` |
| `KIYMET_KEYSTORE_PASSWORD` | `GITHUB_SECRETS_ANDROID.txt` içindeki parola |
| `KIYMET_KEY_PASSWORD` | aynı parola |
| `KIYMET_KEY_ALIAS` | `kiymet-upload` |

---

## 6. Derleme ve yükleme **[BEN]**

Secrets eklenince bana haber verin. Ben bir sürüm etiketi (`kiymet-v1.0.0`) göndereceğim. GitHub Actions:
- **iOS:** Uygulamayı imzalayıp **App Store Connect'e otomatik yükler**. 10-30 dakika içinde TestFlight'ta görünür.
- **Android:** İmzalı **AAB** dosyasını üretir. Dosyayı Actions sayfasındaki "kiymet-aab" bölümünden indirirsiniz.
  Play Console'a ilk yükleme elle yapılmak zorunda.

---

## 7. iPhone'da test (TestFlight) **[SİZ]**
1. iPhone'a **TestFlight** uygulamasını kurun.
2. App Store Connect → Kıymet → TestFlight → Dahili test → kendinizi ekleyin.
3. Davet e-postasıyla Kıymet'i kendi iPhone'unuza kurup deneyin.

---

## 8. App Store sayfası ve incelemeye gönderme **[SİZ]**
App Store Connect → Kıymet → **1.0 Sürümü Hazırlanıyor**:
1. `store/metadata/appstore-tr.md` içindeki metinleri ilgili alanlara kopyalayın.
2. **iPhone 6.9" ekran görüntüleri:** `store/appstore/iphone-6.9-1…6.png` dosyalarını sırayla sürükleyin.
3. **Derleme:** TestFlight'taki derlemeyi seçin.
4. **Uygulama Gizliliği:** "Veri toplamıyoruz" (Data Not Collected).
5. **Yaş Derecelendirmesi:** tüm sorulara "Yok/Hayır" → 4+.
6. **Fiyatlandırma:** Ücretsiz, tüm ülkeler (veya yalnızca Türkiye).
7. **İnceleme bilgileri:** metadata dosyasındaki "İnceleme ekibine not" kısmını yapıştırın.
8. **İncelemeye Gönder.** İnceleme genellikle 1-3 gün sürer.

---

## 9. Google Play **[SİZ + BEN]**
1. Play Console → **Uygulama oluştur**: Ad `Kıymet: Altın, Döviz, Kripto`, dil Türkçe, Uygulama, Ücretsiz.
2. **Uygulama içeriği** bölümleri (metadata dosyasındaki tabloya göre): Gizlilik politikası, Reklamlar (yok),
   Uygulama erişimi (tüm özellikler kısıtlamasız), İçerik derecelendirmesi, Hedef kitle (18+),
   Veri güvenliği (veri toplanmıyor), Finansal özellikler (kişisel finans/portföy takibi).
3. **Mağaza girişi:** kısa ve tam açıklama, ikon (`brand/export/playstore-icon-512.png`),
   öne çıkan grafik ve telefon ekran görüntüleri (`store/googleplay/`).
4. **Test → Kapalı test** → yeni sürüm → AAB'yi yükleyin → test kullanıcısı listesi (12+ kişi) → yayınla.
5. 14 gün sonra **Üretim** erişimi başvurusu.

---

## Sık karşılaşılan red nedenleri ve önlemleri

| Risk | Durum |
|---|---|
| Gizlilik politikası adresi yok veya erişilemiyor | 3. adım |
| Ekran görüntüsü uygulamayı yansıtmıyor | Ekranlar gerçek uygulama arayüzünden üretildi ✅ |
| "Beta/Test" ifadeleri | Uygulamadan kaldırıldı ✅ |
| Eksik işlev / çökme | Testlerden geçiyor; TestFlight'ta mutlaka deneyin |
| Finans uygulamasında yanıltıcı ifade | "Yatırım tavsiyesi değildir" uyarıları mevcut ✅ |
| Veri kaynağı lisansı | 1. adım: hisseler kapalı; kripto/altın izinleri |
