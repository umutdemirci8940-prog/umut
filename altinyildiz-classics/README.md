# Altınyıldız Classics – 970×250 İnteraktif Billboard ("Size Özel Stil")

[altinyildizclassics.com](https://www.altinyildizclassics.com/) için kullanıcı etkileşimli rich media billboard.
**Hiçbir vektör çizim kullanılmamıştır:** sahne fotoğrafları, ürün fotoğrafları ve logo doğrudan siteden alınmış raster görsellerdir
(logo, sitedeki logo sembolünden yüksek çözünürlüklü PNG'ye çevrildi). Arayüz öğeleri yalnızca CSS ve yazıdır.

| Dosya | Açıklama |
|---|---|
| `dist/970x250/index.html` | Tek dosya banner (görseller gömülü), tarayıcıda doğrudan açılır |
| `dist/altinyildiz-classics-970x250.zip` | Reklam ağına yüklemeye hazır paket (~105 KB, Google Ads 150 KB sınırı altında) |
| `preview/*.jpg` | Kilit anların ekran görüntüleri |

## Fikir: "Bugün nereye?"

Her müşteri farklı bir gün yaşıyor: banner, kullanıcının o günkü ihtiyacına göre **kişisel bir kombin** kurar.
Markanın kurumsal dili korunur: siyah-beyaz palet, sitenin fontu *Urbanist*, ince çizgiler, büyük harf aralıklı başlıklar ve markanın kendi kampanya fotoğrafları.

1. **Açılış (1,9 sn):** Beyaz zeminde logo, ince çizgi ve "SİZE ÖZEL STİL". Ardından orta sahne perde gibi açılır.
2. **Otomatik vitrin:** Kullanıcı dokunana kadar üç senaryo sırayla gösterilir; aktif seçenekte ilerleme çizgisi akar. 30 sn sınırında İş Günü'nde durur.
3. **Seçim (kullanıcı etkileşimi):** `İŞ GÜNÜ` · `ÖZEL DAVET` · `HAFTA SONU`. Seçime göre:
   - orta panelde sitedeki kampanya fotoğrafı (Takım Elbise / Smokin / Yeni Sezon) yavaş yakınlaşmayla gelir,
   - başlık ve alt başlık değişir ("Smokin bizim işimiz" gibi sitedeki marka dili),
   - sağda o senaryoya özel 3 ürünlük kombin kartları sırayla yerleşir.
4. **Fotoğraf üzerinde etkileşim noktaları:** Nabız atan noktalara gelince parça adı görünür ("Takım Elbise", "Smokin"…), tıklayınca ilgili kategoriye gider.
5. **Büyüteç:** Ürün fotoğrafının üzerinde gezinen yuvarlak mercek ürünü 2,6 kat yakından gösterir ("Kumaşı yakından inceleyin"). Markanın kumaş/kalite mirasını vurgular.
6. **Çıkışlar:** Ürün kartı → ürün sayfası, nokta → kategori, `KOMBİNİ KEŞFET` ve zemin → seçili senaryonun kategorisi. Tüm bağlantılarda UTM var.

Klavye: ← → / ↑ ↓ ile senaryo değişir, Enter ile çıkış. `prefers-reduced-motion` desteklenir.

## Görsel kaynakları (hepsi altinyildizclassics.com)

- Sahneler: ana sayfa kampanya fotoğraflarının **yazısız bölgelerinden** kırpıldı (`src/images.json`): Takım Elbise, Smokin Bizim İşimiz, Yeni Sezon Sonbahar/Kış '26-27.
  Not: Sitede bu kampanya görsellerinde "Yapay Zeka ile Oluşturuldu" ibaresi bulunuyor; kırpımda bu ibare dışarıda kaldı. Yayın öncesi markanın bu ibarenin reklamda da gösterilmesini isteyip istemediği teyit edilmeli.
- Ürünler: sitedeki stüdyo ürün fotoğrafları (gömlek, polar, sweatshirt, triko).
- Logo: sitenin logo sembolü, raster PNG.
- Fiyat: "Takım elbise 4.399,99 TL'den başlayan fiyatlarla" sitedeki kampanyadan alındı; kampanya 31.10.2026'ya kadar geçerli olduğundan banner'da ibaresiyle birlikte yer alıyor. Kampanya sonrası `src/data.js` içinden kaldırın.

## Yükleme

- **Google Ads / DV360 / CM360:** `dist/altinyildiz-classics-970x250.zip`. `ad.size` meta etiketi ve `clickTag` hazır; `clickTag` tanımlanırsa tüm çıkışlar oraya gider.
- **Studio (rich media):** `<head>` içine `<script src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>` ekleyin; banner `Enabler` başlatılmasını bekler ve her çıkışı `Enabler.exitOverride` ile adlandırılmış olarak raporlar (Ürün, Nokta, CTA, Ana Çıkış).
- Font Google Fonts'tan (Urbanist) yüklenir; harici fonta izin vermeyen ağlarda Arial'a düşer.

## Düzenleme

```bash
node tools/fetch-site.js          # (GitHub Actions'ta çalışır) siteden ham görseller → assets/raw/
node tools/fetch-logo.js          # (GitHub Actions'ta çalışır) logo PNG → assets/raw/
python3 tools/prepare-images.py   # kırpma + WebP → assets/banner/   (src/images.json)
node build.js                     # dist/ üretir
NODE_PATH=$(npm root -g) node tools/capture.js   # ekran görüntüleri + bağlantı testi
```

Metinler, senaryolar, ürünler, etkileşim noktası konumları ve bağlantılar: `src/data.js`. Görsel seçimi ve kırpımlar: `src/images.json`.
Bulut ortamının ağı siteye erişemediği için görseller `.github/workflows/altinyildiz-*.yml` iş akışlarıyla GitHub sunucusunda çekildi.
