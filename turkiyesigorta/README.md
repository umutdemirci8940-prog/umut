# Türkiye Sigorta – 970×250 Billboard

[turkiyesigorta.com.tr](https://www.turkiyesigorta.com.tr/) için hazırlanmış, tek dosyalık (`index.html`) çok sahneli HTML5 display reklamı. **Logo, görseller, font ve metinlerin tamamı sitenin kendisinden alınmıştır**; teslim dosyasında vektör (SVG) görsel yoktur, tüm varlıklar raster (PNG / WebP / JPEG) olarak gömülüdür.

| Dosya | Açıklama |
|---|---|
| `index.html` | Teslim dosyası – 970×250, tek dosya (~440 KB), her şey gömülü |
| `banner-970x250.jpg` | İlk ürün sahnesinin statik kopyası |
| `preview/` | Açılış, 5 sahne, kapanış ve üzerine gelme kareleri |

## Siteden alınan varlıklar

| Bannerdaki öğe | Sitedeki kaynak |
|---|---|
| Türkiye Sigorta logosu (lacivert) | Hakkımızda › Kurumsal Materyaller › **Logolar** – slogansız logo PNG (`assets/brand/logo.png`) |
| İki markalı beyaz logo (açılış) | Site üst şeridindeki satır içi SVG (`assets/brand/lockup-white.svg`, derlemede PNG'ye çevrilir) |
| Beyaz yazı markası (kapanış) | Site alt bilgisindeki satır içi SVG (`assets/brand/wordmark-white.svg`) |
| Amblem ikonu ve turkuaz filigran | Aynı SVG'nin amblem yolları (`assets/brand/emblem.svg`, `swoosh.svg`) – sayfa başlıklarındaki filigran gibi |
| Araç sahnesi görseli | Genişletilmiş Kasko sayfası hero görseli |
| Konut sahnesi görseli | Konut Sigortası / DASK sayfası hero görseli |
| Sağlık sahnesi görseli | Tamamlayıcı Sağlık Sigortası sayfası hero görseli |
| Seyahat sahnesi görseli | Sağlık Sigortaları listesindeki Seyahat Sağlık Sigortası kart fotoğrafı (amblem dairesi içinde) |
| Hayat/BES sahnesi görseli | Hayat Sigortası sayfası hero görseli |
| Kapanış görseli | Dijital BES Planı sayfası hero görseli |
| Font | Sitenin kendi fontu **Avenir Next LT Pro** (Regular / Medium / Heavy, siteden indirilip Türkçe karakter setine indirgendi) |
| Renkler | Sitenin CSS değişkenleri: `--dark-blue-500 #0a145a`, `--turqoise-600 #019fbf`, CTA turkuazı `#00afd2`, `--red-600 #e41212` |

Seçimler `assets/pick.json` içindedir; siteden çekilen tüm adaylar `assets/site/` altında (kontak sayfaları: `assets/site/sheets/`).

## Metin kaynakları (site dışına çıkılmadı)

| Bannerdaki ifade | Sitedeki kaynak |
|---|---|
| "Gücü, adında." | Ürün sayfalarındaki marka etiketi: "Türkiye Sigorta: Gücü, adında." |
| "Türkiye Sigorta ile hayatınızı güvence altına alın" | Ana sayfa / ürün sayfaları |
| "Türkiye'nin lider sigorta şirketi" | Şirket Profili |
| Genişletilmiş Kasko – "Aracınızı çarpma, yanma, çalınma gibi risklere karşı güvence altına alın." · "Online 30 saniyede teklif" · "Peşin fiyatına 12 taksit" | Genişletilmiş Kasko sayfası |
| Konut – "Evinize özel güvence" · "Yangın, deprem, hırsızlık gibi risklere karşı evinizi ve eşyalarınızı güvence altına alın." | Ürünler kartı ve Konut Sigortası sayfası |
| Tamamlayıcı Sağlık – "SGK anlaşmalı hastanelerde fark ödemeden tedavi olun." · "12 taksit fırsatı" | Tamamlayıcı Sağlık Sigortası sayfası |
| Seyahat Sağlık – "Yurt içi ya da yurt dışı, tüm seyahatlerinizde beklenmedik sağlık risklerine karşı güvence." · "Dakikalar içinde poliçe" | Seyahat Sağlık Sigortası sayfası |
| Hayat/BES – "Sevdiklerinizin geleceği güvende" · "Zengin teminatlı hayat sigortası ürünleri…" · "%20 devlet katkısı" | Hayat Sigortası ve Bireysel Emeklilik sayfaları |
| "Hemen Teklif Al" · "7/24 Müşteri İletişim Merkezi 0850 202 20 20" | Ürün sayfaları düğmesi · Yardım Merkezi |

## Kurgu (≈ 24 sn, sonra kapanışta durur)

1. **Açılış (2,6 sn)** – Sitenin üst şeridi gibi lacivert→turkuaz degrade; iki markalı beyaz logo, "Türkiye Sigorta ile hayatınızı güvence altına alın", "Gücü, adında." etiketi.
2. **5 ürün sahnesi (5 × 3,4 sn)** – Beyaz zemin, turkuaz filigran; lacivert logo, etiket, kategori üst başlığı, başlık, açıklama, iki onay maddesi; sağda sitenin ürün görseli yükselerek gelir ve hafifçe süzülür. Turkuaz CTA ve 7/24 hattı sabittir.
3. **Kapanış (3,8 sn)** – Koyu degrade; beyaz logo, büyük "Gücü, adında.", ürün listesi, nabız efektli beyaz CTA, telefon; sağda BES görseli.
4. Toplam süre 30 sn sınırının altındadır (Google Ads / IAB); `prefers-reduced-motion` açıksa animasyon yoktur.

## Etkileşim

- Üzerine gelince akış duraklar, sağ üstte duraklatma göstergesi ve görselin iki yanında oklar belirir.
- Noktalar / oklar / ← → tuşları / mobilde kaydırma ile sahneler arasında gezinilir; Enter veya Boşluk tıklama sayar.
- Bannerın tamamı tıklanabilir. `window.clickTag` (Google Ads / CM360) tanımlıysa o kullanılır, `Enabler` varsa `Enabler.exit('CTA')`; aksi halde sahnedeyken ilgili ürün sayfası, diğer anlarda UTM'li ana sayfa açılır (`src/data.js` → `deepLink`).
- `role="link"`, `aria-label`, `<meta name="ad.size">` mevcuttur.

## Yeniden üretme

```bash
pip install fonttools brotli                 # font alt kümesi için (bir kez)
NODE_PATH=$(npm root -g) node build.js       # index.html + önizlemeler (Chromium/Playwright)
NODE_PATH=$(npm root -g) node tools/smoke.js # etkileşim duman testi
```

- Metinler, sahneler, süreler ve renkler: `src/data.js`. Yerleşim/animasyon: `src/template.js`. Arka plan (filigran): `src/bg.html`.
- Görsel seçimi: `assets/pick.json` (`mode: circle|cover|contain`, `fx/fy` odak, `keyWhite` beyaz zemin temizleme).
- Dosya boyutu: `node build.js --quality=0.75 --scale=1.5` ile ~300 KB'a iner. Google Ads'in 150 KB sınırı gerekiyorsa sahne sayısını 3'e indirmek (data.js) yeterlidir; DV360 / CM360 / Adform gibi ağlar bu boyutu kabul eder.

## Siteden varlık toplama (GitHub Actions)

Bulut oturumu siteye erişemediği için `tools/fetch-site.js` GitHub Actions'ta (`.github/workflows/fetch-assets.yml`, görev: `turkiyesigorta`) gerçek tarayıcıyla siteyi gezer; logo, hero/kampanya/ürün görselleri, fontlar, renkler, metinler ve ekran görüntülerini `assets/site/` altına toplar, gözle seçim için kontak sayfaları üretir ve dala push'lar.
