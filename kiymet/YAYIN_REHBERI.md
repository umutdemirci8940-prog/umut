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

## 1. Veri kaynakları: ücretsiz ve yasal

Mağaza sürümü yalnızca **Kıymet fiyat yayınını** kullanır. Yayın, herkese açık `kiymet-site`
reposunda GitHub Actions ile 15 dakikada bir üretilip GitHub Pages'te yayınlanır (ücretsiz).
Mağaza derlemesi `KIYMET_FEED` değişkeni olmadan başlamaz.

| Veri | Kaynak | Koşul | Durum |
|---|---|---|---|
| Döviz | TCMB gösterge kurları | Resmî, herkese açık | ✅ |
| Altın (gram, çeyrek, yarım, tam, Cumhuriyet, ayar) | **TCMB EVDS** günlük fiyat | "Kaynak gösterilerek ticari amaçla dahi kullanılabilir" | ✅ (ücretsiz EVDS anahtarı gerekli) |
| Gümüş | TCMB EVDS (seri varsa) | Aynı | Seri kontrol edilecek |
| Enflasyon | OECD + BIS | Kaynak gösterilerek | ✅ |
| Kripto | CoinPaprika | Ücretsiz plan; ticari kullanım için **önceden bildirim** | ⏸ Bildirim/onaydan sonra `ENABLE_CRYPTO=1` |
| BIST hisseleri | Ücretsiz ve lisanslı kaynak yok | Borsa İstanbul verisi lisanslı | ⏸ Kapalı |

Uygulama yalnızca yayında bulunan varlıkları gösterir. Kripto açıldığında **uygulama güncellemesi gerekmez**.
Altın fiyatı **günlük** resmî fiyattır (saniyelik altın verisi ücretsiz ve yasal olarak bulunamıyor).

### Yapılacaklar
1. **EVDS anahtarı [SİZ, ücretsiz]:** https://evds3.tcmb.gov.tr → Üye ol → Profil → API anahtarı.
2. **`kiymet-site` reposu [BEN, izninizle]:** Herkese açık repo, site + yayıncı dosyaları. Ardından
   repo ayarlarında Pages → Source: **GitHub Actions**; Secrets: `EVDS_API_KEY`.
3. **Altın serisinin seçimi [BEN]:** `kiymet-site` → Actions → "Fiyatları yayınla" → Run workflow;
   "discover" işi EVDS'deki altın/gümüş serilerini listeler, doğru seriyi `GOLD_SERIES` değişkenine yazarız.
4. **`umut` reposuna değişken:** Settings → Variables → `KIYMET_FEED` = `https://umutdemirci8940-prog.github.io/kiymet-site/data`
5. **Kripto için bildirim [SİZ]:** CoinPaprika'ya ticari kullanım bildirimi (taslak aşağıda). Onay gelince `ENABLE_CRYPTO=1`.

### CoinPaprika bildirim e-postası taslağı (support@coinpaprika.com)
```
Subject: Notice of commercial use – CoinPaprika free API (Kıymet mobile app)

Hello,

As required by your API Terms of Use, I would like to notify you of commercial use of the
CoinPaprika free API. "Kıymet" is a free personal-finance app (iOS/Android) that shows users the
current TRY value of crypto assets they enter themselves. We call /v1/tickers/{id}?quotes=TRY for
about 10 coins every 15 minutes from a single server and display "Source: CoinPaprika" in the app.

Please let us know if this use is acceptable or if any additional conditions apply.

Best regards,
<Name> · <e-mail>
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
