# İçten Dışa Parla · Wellbeing Day 2026 – Interaktif HTML5 Banner

Elif Tuncel Akademi'nin "İçten Dışa Parla Wellbeing Day 2026" programı için **seçim yaptıran (quiz tipi) interaktif display banner**.

| Boyut | Kullanım | Dosya | Paket |
|---|---|---|---|
| 970 × 250 | Billboard (masaüstü, premium display) | `dist/970x250/index.html` | `dist/zip/wellbeing-day-2026-970x250.zip` |
| 320 × 480 | Mobil interstitial / in-app | `dist/320x480/index.html` | `dist/zip/wellbeing-day-2026-320x480.zip` |

İkisini birlikte görmek için: `preview.html` (yeniden oynat düğmeli).

| 970 × 250 – seçim | 970 × 250 – kapanış |
|---|---|
| ![](screens/970x250-5-secim.png) | ![](screens/970x250-4-kapanis.png) |

| 320 × 480 – açılış | 320 × 480 – otomatik akış | 320 × 480 – kapanış |
|---|---|---|
| ![](screens/320x480-1-acilis.png) | ![](screens/320x480-3-otomatik.png) | ![](screens/320x480-4-kapanis.png) |

## Kurgu – "Bugün ışığını ne besler?"

1. **Açılış (~2,6 sn):** Arkadaki ışık küresi "içten dışa" büyür, ışınlar döner; *İçten Dışa Parla* başlığı ve "Wellbeing Day 2026 · Kayıtlar açık" belirir.
2. **Soru:** Kullanıcıya dört alan sunulur: **Beslenme · Zihin · Beden · Cilt**.
3. **Seçim:** Bir alana dokununca ışığın rengi o alana döner, panelde o alana ait oturum mesajı gösterilir (ör. *Zihin → "Zihnine nefes aldır" – Mindfulness, meditasyon ve stres yönetimi*).
4. **Etkileşim yoksa:** Banner kendi kendine dört alanı sırayla "dokunarak" gösterir (tıklama dalgası efekti ile etkileşimli olduğunu anlatır), ardından kapanış karesinde *"Kendine yatırım yap"* + nabız efektli **Yerini Ayırt** CTA'sı ile durur.
5. Tüm döngüsel animasyonlar 30 sn'de durur (Google Ads / IAB kuralı).

## Neden bu format? (trafik kalitesi)

- Seçim yapan kullanıcı, tıklamadan önce ilgisini **beyan etmiş** olur → siteye gelen trafik daha nitelikli.
- Çıkış bağlantısı seçilen alanı UTM'e yazar: `utm_content=<boyut>_<alan>` (ör. `970x250_zihin`). GA4'te hangi ilgi alanının daha çok kayıt getirdiği ayrıştırılabilir; kreatif/hedefleme optimizasyonu buna göre yapılır.
- Studio/DV360'ta `Enabler.counter('secim_<alan>')` ile her seçim ayrıca etkileşim olarak sayılır.

## Etkileşim ve teknik

- Alan seçimleri reklam çıkışını tetiklemez; **CTA** ve bannerın geri kalanı tıklanabilir.
- Fare banner üzerinde hareket edince otomatik akış durur, ayrılınca devam eder. Klavye ile chip'ler ve CTA odaklanabilir.
- `window.clickTag` varsa o kullanılır (Google Ads / CM360), `Enabler` varsa `Enabler.exit`, ikisi de yoksa UTM'li program sayfası açılır.
- Tek dosya, satır içi CSS/JS, **harici görsel yok** – her boyut ~17 KB (150 KB sınırının çok altında). Görseller CSS/SVG ile çizildi; ışık rengi seçime göre canlı değişir.
- Fontlar: Google Fonts *Fraunces* (başlık) + *Manrope* (metin); yüklenemezse Georgia / Arial'a düşer.
- `prefers-reduced-motion` desteklenir; `ad.size` meta etiketi mevcuttur.

## Düzenleme

Bütün metinler, alanlar, renkler, süreler ve hedef URL: **`src/data.js`**.
Tarih/mekân kesinleşince `event.date` ve `event.venue` alanlarını doldurun ("Kayıtlar açık · 14 Kasım · İstanbul" gibi görünür).

```bash
node build.js                               # dist/ + zip + preview.html
NODE_PATH=$(npm root -g) node capture.js    # (isteğe bağlı) screens/ ekran görüntüleri – Playwright gerekir
```

> Not: Alan açıklamaları programın genel temalarından yazıldı (bu ortamdan program sayfasına erişilemedi). Yayına almadan önce gerçek oturum başlıklarıyla eşleştirilmesi önerilir.
