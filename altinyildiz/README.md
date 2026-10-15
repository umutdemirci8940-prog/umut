# Altınyıldız Classics – 970×250 interaktif masthead seti

[altinyildizclassics.com](https://www.altinyildizclassics.com/) için hazırlanmış **üç interaktif, oyuncaklı first media masthead**. Ürün fotoğrafları, logo, fiyatlar ve ayrıcalıklar siteden alındı (15.10.2026).

| # | Banner | Kaynak | Dosya | Zip |
|---|---|---|---|---|
| 03 | **Yıldız Vinci** (yeni konsept, oyun) | — | `dist/vinc/index.html` | `dist/zip/altinyildiz-vinc-970x250.zip` |
| 01 | **Askılı Vitrin** | Civil 1 uyarlaması | `dist/vitrin/index.html` | `dist/zip/altinyildiz-vitrin-970x250.zip` |
| 02 | **Pop-up Lookbook** | Civil 6 uyarlaması | `dist/lookbook/index.html` | `dist/zip/altinyildiz-lookbook-970x250.zip` |

Sunum: `preview/index.html` (tek dosya; üç banner gömülü, oynanabilir, her biri indirilebilir). Ekran görüntüleri: `preview/screens/`.

## Konseptler

### 03 · Yıldız Vinci – marka bilinirliği + satış
Markanın adındaki **altın yıldız**, oyuncak bir pelüş vinç makinesine dönüşür. Bordo kabin (sezon rengi), lacivert cam, altın ray ve ışıklı tabela.
- **Oyun:** ◀ ▶ (basılı tut / klavye okları) ile vinç gezer, **YAKALA** (veya boşluk) ile iner; mobilde cama dokunmak yeterli. Pençe kapsülü kapar, ÇIKIŞ’a taşır; kapsül açılır.
- **Ödül:** Kapsülden sitedeki orijinal ürün fotoğrafı, adı, güncel ve eski fiyatı ile gerçek bir ayrıcalık çıkar (1250 TL üzeri kargo bedava, peşin fiyatına 6 taksit, %3 Stars puan, ücretsiz terzi). **Hemen Al** o ürünün kategorisine gider.
- **Demo:** Etkileşim yoksa 4. saniyede vinç kendi kendine bir tur oynar, böylece pasif izleyici de hikâyeyi (ürün + fiyat + ayrıcalık) görür.
- Yıldız maskot vincin tepesinde oturur; ödülde zıplar, altın yıldız konfetisi patlar.
- Kupon kodu: Marka bir kod verirse `src/config.js` → `prizes` içine `code` eklenir; kapsülde kopyalanabilir kod olarak çıkar (panoya kopyalama hazır).

### 01 · Askılı Vitrin (Civil 1 uyarlaması)
Civil’deki kategori çipleri + kolaj + sayan fiyat + maskot yapısı Altınyıldız’a uyarlandı.
- Pirinç rayda **askıda sallanan fotoğraf kartları**; fare hareketiyle sallanır (sönümlü sarkaç fiziği), ürün değişince salınır. Yan kartlar önceki/sonraki ürüne geçer.
- Çipler: Mont & Kaban · Ceket · Triko · Takım Elbise (üzerine gelince değişir, ilerleme çubuğu).
- Fiyat sayarak gelir, üstü çizili eski fiyat ve askı etiketiyle gösterilir.
- **Yıldız maskot** (ayıcığın karşılığı): üzerine gelince konuşur, tıklanınca döner, yıldız saçar ve “yıldız parçaya” atlar; ikinci tıklama kategoriye götürür.

### 02 · Pop-up Lookbook (Civil 6 uyarlaması)
Civil’in açılan pop-up kitabı, lacivert kumaş ciltli, altın varaklı bir **SK26 Lookbook**’a dönüştü.
- Her açılım bir sezon rengi: Kahve (Mont & Kaban), Lacivert (Ceket), Bordo (Triko), Antrasit (Takım Elbise).
- Sağ sayfada pop-up fotoğraf, **kumaş kartelası harfleri** (oyuncak bloklar yerine; markanın kumaş mirasına selam) ve askı etiketi.
- Sol sayfadaki küçük resimler ürünü değiştirir; sayfa çevrildikçe yıldız konfetisi. Kaydırma (mobil), oklar ve klavye ile gezilir.

## Teknik

- Her banner **tek HTML**; görseller (WebP, 300×450) ve logo (sitedeki orijinal SVG) gömülü. Dosya ~150 KB, **zip ~92 KB** (Google Ads 150 KB sınırı altında).
- `<meta name="ad.size" content="width=970,height=250">`, `clickTag` (genel) + `clickTag1..4` (kategoriler). `Enabler` varsa `Enabler.exit` kullanılır (CM360/DV360 Studio). Kontroller tıklamayı yutar; boş alan tıklaması ekrandaki kategoriye gider.
- Yazı tipleri: **Urbanist** (sitenin kendi yazı tipi) + Cormorant Garamond (editoryal vurgu), Google Fonts.
- Döngüsel ortam animasyonları **30 sn’de durur**; vitrin bir turdan sonra ilk karede durur; kullanıcı etkileşimi sürdükçe oyun çalışır. `prefers-reduced-motion` desteklenir.
- Fiyat ve yasal ibareler `src/config.js` içinde; fiyatlar değişirse yalnızca orayı güncelleyin.

## Siteden veri çekme (GitHub Actions)

Bulut geliştirme ortamının ağ politikası altinyildizclassics.com’a izin vermediği için veriler GitHub’ın sunucusunda çekilir:
`.github/workflows/altinyildiz-fetch.yml` → `tools/fetch-site.js` (Playwright) siteyi açar; kategori sayfalarından ürünleri, ürün sayfalarından JSON-LD verisini, fotoğrafları ve logoyu `assets/site/` altına indirip dala push’lar. Elle çalıştırmak için: *Actions → “Altınyıldız Classics – siteden görselleri çek” → Run workflow*.

## Derleme

```bash
node altinyildiz/tools/prepare-images.js --w=300 --q=0.8   # seçili fotoğrafları WebP'ye indirger, logo.svg üretir (Playwright)
node altinyildiz/build.js                                  # dist/<banner>/index.html + zip
node altinyildiz/tools/package.js                          # preview/index.html (tek dosya sunum)
node altinyildiz/tools/capture.js                          # ekran görüntüleri + etkileşim testi (Playwright)
```

Ürün değiştirmek için `src/config.js` → `cats[].items[].src` alanına `assets/site/products/` altındaki başka bir fotoğrafı yazıp yukarıdaki adımları çalıştırın.

## Klasör yapısı

```
src/config.js          Ürünler, fiyatlar, clickTag adresleri, ayrıcalıklar, yasal ibareler
src/shared.js          Ortak çalışma zamanı: logo, yıldız maskot, konfeti, fiyat sayacı, tıklama çıkışı
src/vinc.html          03 · Yıldız Vinci
src/vitrin.html        01 · Askılı Vitrin
src/lookbook.html      02 · Pop-up Lookbook
assets/site/           Siteden çekilen ham veri (manifest, ürün fotoğrafları, sayfa görüntüleri)
assets/banner/         Bannerlara gömülen optimize görseller + logo.svg
dist/                  Yüklemeye hazır bannerlar ve zipler
preview/               Sunum sayfası ve ekran görüntüleri
tools/                 fetch-site, prepare-images, package, capture
```

> Not: Yayın öncesi fiyatların ve ayrıcalık metinlerinin marka tarafından teyit edilmesi önerilir. Görsellerdeki ünlü (Burak Özçivit) markanın kendi kampanya çekimlerinden olduğundan kullanım hakkının bu mecraları kapsadığı markayla doğrulanmalıdır.
