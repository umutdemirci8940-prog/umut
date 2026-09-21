# Türkiye Sigorta – 970×250 Billboard

[turkiyesigorta.com.tr](https://www.turkiyesigorta.com.tr/) markası için hazırlanmış, tek dosyalık (`index.html`) HTML5 display reklamı. Görsel ve logo özgündür; sitenin gerçek logosu veya görselleri kullanılmamıştır. Arka plan ve logo, tasarım kaynaklarından **raster** (JPEG / PNG) olarak üretilip dosyaya gömülür; vektör (SVG) görsel içermez.

| Dosya | Açıklama |
|---|---|
| `index.html` | Teslim dosyası – 970×250, tek dosya (~84 KB), görsel + logo + font gömülü |
| `banner-970x250.jpg` | Son karenin statik kopyası |
| `preview/` | Ekran görüntüleri (son kare 2x, animasyon ara kareleri) |

## İçerik kaynakları (site dışına çıkılmadı)

| Bannerdaki ifade | Sitedeki kaynak |
|---|---|
| "Hayatınızı güvence altına alın" | Ana sayfa / ürün sayfalarındaki "Türkiye Sigorta ile hayatınızı güvence altına alın!" |
| "Türkiye'nin lider sigorta şirketi" | Hakkımızda › Şirket Profili ("Türkiye'nin en büyük ve lider sigorta şirketi") |
| Kasko · Trafik · Konut · DASK · Sağlık · Seyahat · Hayat · BES | Ürünlerimiz kategorileri (araç, konut, sağlık, hayat sigortaları ve bireysel emeklilik) |
| "Online 30 saniyede teklif" | Genişletilmiş Kasko ve Seyahat Sağlık sayfaları ("online satış ekranlarımız üzerinden yalnızca 30 saniyede teklif") |
| "Kasko ve Trafik'te peşin fiyatına 12 taksit" | Aktif Kampanyalar › Kasko ve Trafik'te Peşin Fiyatına Taksit Kampanyası (12 taksite varan) |
| "Hemen Teklif Al" | Ürün sayfalarındaki buton metni |
| "7/24 Müşteri İletişim Merkezi 0850 202 20 20" | Yardım Merkezi › Müşteri İletişim Merkezi |
| Turkuaz + kırmızı palet | Kurumsal İletişim › Logolar sayfasında tanımlı marka renkleri |

## Kurgu (yaklaşık 2,5 sn, sonra sabit)

Arka planda yavaş bir yakınlaşma; logo soldan belirir, ayraç çizgisi uzar, üst başlık ve iki satırlık manşet yükselerek gelir, ürün etiketleri sırayla açılır, kanıt satırı belirir, kırmızı CTA "pop" ederek gelir ve üzerinden 3 kez ışık süpürmesi geçer, telefon bilgisi en son gelir. `prefers-reduced-motion` açıksa animasyon yoktur.

## Etkileşim

- Bannerın tamamı tıklanabilir; `window.clickTag` (Google Ads / CM360) tanımlıysa o kullanılır, `Enabler` varsa `Enabler.exit('CTA')`, aksi halde UTM'li site adresi açılır.
- Klavye: odaktayken Enter / Boşluk. `role="link"`, `aria-label` ve `<meta name="ad.size">` mevcuttur.
- Üzerine gelince CTA hafifçe yükselir ve parlar.

## Yeniden üretme

```bash
pip install fonttools brotli Pillow      # bir kez (font alt kümesi + PNG palet küçültme)
sh tools/subset-fonts.sh                 # (isteğe bağlı) font alt kümelerini yeniden üret
NODE_PATH=$(npm root -g) node build.js   # assets/bg.jpg, assets/logo.png, index.html, önizlemeler
```

- Arka plan: `src/scene.html` (ışık, bokeh, çini yıldızı dokusu, film greni) → Chromium ile 2x JPEG.
- Logo: `src/logo.html` (katmanlı sekiz köşeli çini yıldızı + kırmızı mühür, "TÜRKİYE / SİGORTA" yazı markası, Sora fontu) → saydam 2x PNG, 256 renge indirgenir.
- Yerleşim ve metinler: `src/template.html`. Metin fontu Manrope (yalnızca Türkçe karakter seti, base64 gömülü).
- `node build.js --no-assets` yalnızca `index.html`'i yeniden derler (görselleri yeniden çizmez).
