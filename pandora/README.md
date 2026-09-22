# Pandora Moments – 970×250 media-first rich media masthead

[Pandora2027.html](release/Pandora2027.html) referans çalışmasının yeniden tasarımı: tr.pandora.net’teki gerçek ürünler, güncel TL fiyatları, kampanya ve marka kimliğiyle; fotoğraf önde (media-first), bileklik tasarlayıcı elinin altında.

| Dosya | Açıklama |
|---|---|
| `release/Pandora2027.html` | Teslim: tek dosyalık 970×250 masthead (görseller, logo ve font gömülü) |
| `dist/970x250/index.html` + `dist/zip/pandora-moments-970x250.zip` | Reklam ağına yüklenecek aynı dosya / zip |
| `release/sunum.html` | Tek dosyalık sunum: masthead gömülü, yayın simülasyonu, ekran görüntüleri |
| `preview/index.html` | Sunum sayfası (klasör yapısıyla çalışır) |

## Kurgu ve etkileşim

1. **Açılış (0–1,4 sn)** – Fotoğraf yumuşak zoom’la belirir (Ken Burns), Pandora logosu ve “3 AL 2 ÖDE · Pandora Club’a özel” çipi gelir; “Kendi hikâyeni / tasarla.” satır satır yükselir, alt metin ve siyah CTA.
2. **Bileklik (0,75 sn)** – Pandora Moments yılan zincir bileklik packshot’ı hafif dönerek sahneye oturur (kadrajdan kısmen taşan, editoryal kadraj); sağ panel buzlu camla süzülür.
3. **Gösteri (2,6 sn →)** – Kullanıcı dokunmazsa tepsiden üç charm sırayla bilekliğe uçar; yerine oturunca ışıltı + halka, toplam sayarak artar.
4. **Dinlenme (~7,5 sn)** – CTA “Bu tasarımı satın al” olur ve nabız atar; boş yuvalar kesikli halkayla davet eder. 30 sn’de Ken Burns ve nabız durur (IAB / Google 30 sn kuralı), etkileşim sürer.

- **Metal:** Gümüş / Rose / Altın – bileklik fotoğrafı çapraz geçişle değişir, ürün adı ve fiyatı güncellenir (klavyede ← →).
- **Charm ekle:** tepsideki gerçek charm fotoğrafına tıkla → yuvaya uçar; en fazla 5. Ekli charm’a (tepside ✓, bileklikte ×) tıklayınca çıkar; “Temizle” hepsini kaldırır. Üzerine gelince ürün satırında ad + fiyat.
- **Toplam:** bileklik + charm liste fiyatları TL olarak canlı toplanır.
- **Çıkış:** CTA, başlık ve boş alanlar `clickTag` (varsayılan: Pandora Moments koleksiyonu, UTM’li); bileklik fotoğrafı seçili bilekliğin ürün sayfasına derin bağlantı (clickTag reklam ağı tarafından tanımlanmışsa o kullanılır). Panel kontrolleri çıkış tetiklemez.
- **Ses:** varsayılan kapalı; kullanıcı hoparlör simgesine basarsa takma/çıkarma için kısa WebAudio tıkları.
- **Devralma:** kurgu/gösteri yalnızca gerçek fare hareketi, dokunma veya tıklama ile durur (imlecin reklam üzerinde durması bozmaz).
- Klavye, dokunmatik, `prefers-reduced-motion` (kurgu/gösteri atlanır, doğrudan dinlenme), `aria-live` ürün satırı.

## Teknik

- Tek HTML; CSS/JS satır içi, ES5, harici kütüphane yok. Ürün fotoğrafları şeffaf WebP (2×), logo SVG, Inter fontu (Latin + Türkçe alt kümesi) base64 gömülü → harici istek yok. `--no-embed-fonts` ile Google Fonts bağlantısı.
- `<meta name="ad.size">`, `var clickTag`, `Enabler.exit` / `Enabler.counter` (Studio/DV360; `Enabler` varsa `INIT` beklenir), `window.adTrack(olay)` kancası: `impression_start, interact, metal_<key>, charm_add_<key>, charm_remove, reset, sound_on, demo_complete, cta_click, exit`.
- Sekme gizlenince zamanlayıcılar durur; 30 sn sonra `is-still`.

## Veri: tr.pandora.net’ten alınanlar

Bulut oturumunun ağ politikası tr.pandora.net’e erişemediği için ürün adları/fiyatları arama motoru sonuçları ve Wayback Machine’den, görseller ise **GitHub Actions** üzerinde çalışan toplayıcıyla (`tools/fetch-assets.js`) alınır. tr.pandora.net GitHub sunucusunu bekleme odasıyla (403 “Bir dakika lütfen…”) engellediği için toplayıcı Pandora’nın yeni platformu **www.pandora.net/tr-tr** (aynı ürünler, TL fiyatlar) üzerinden galeri görsellerini çeker; olmazsa Wayback’ten yalnızca ad/fiyat alır.

Ürünler (`src/data.js`):

| Anahtar | Ürün | Kod | Fiyat (TL) |
|---|---|---|---|
| silver | Pandora Moments Yılan Zincir Bileklik | 599652C01 (alt.: 590702HV) | 5.269 |
| rose | Moments 14 Ayar Pembe Altın Kaplama Bileklik | 580728 | 7.609 |
| gold | Moments 14 Ayar Altın Kaplama Düz Klipsli Bileklik | 568748C00 | 6.419 |
| hearts | İç İçe Sonsuz Kalpler Charm | 790800C00 | 1.599 |
| galaxy | Galaksi Mavisi ve Yıldız Murano Charm | 790015C00 | 2.549 |
| murano | Mat Pembe Murano Cam Charm | 789421C00 | 2.009 |
| butterfly | Mavi Kelebek Işıltılı Charm | 790761C01 | 2.359 |
| star | Galaksi Yıldız Murano Sallantılı Charm | 792368C01 | 2.359 |
| clip | Mavi Pavé Klips Charm | 791817NSBMX | 2.029 |

Kampanya: “3 Al 2 Öde” (Pandora Club üyelerine özel, seçili mücevherlerde 3 ürün seç 1’i hediye) – tr.pandora.net ana sayfa, Eylül 2026. Fiyatlar liste fiyatıdır; yayın öncesi güncel fiyat ve kampanya koşullarının markayla teyidi önerilir.

## Komutlar

```bash
# 1) Gerçek görseller: GitHub → Actions → "Siteden görselleri çek ve derle" → task: pandora → Run workflow
#    (assets/manifest.json, assets/src/, assets/logo/, assets/site/, assets/sheets/ dala push'lanır)
# 2) Seçim: assets/pick.json (hangi ürünün hangi görseli, hero fotoğrafı ve odak noktası, logo)
NODE_PATH=$(npm root -g) node tools/optimize-assets.js   # fon temizleme, kırpma, WebP → assets/opt/ + opt.json
bash tools/subset-fonts.sh                               # (bir kez) Inter alt kümesi → assets/fonts/inter-subset.css
node build.js                                            # dist/970x250/index.html, zip, release/Pandora2027.html
NODE_PATH=$(npm root -g) node tools/capture.js           # preview/screens/*.jpg  (--video: preview/video/)
NODE_PATH=$(npm root -g) node tools/smoke.js             # etkileşim duman testi (--quick: 30 sn testini atlar)
node tools/package.js                                    # release/sunum.html + teslim zip'i
```

Görsel yoksa `node build.js` vektör yer tutucularla (halka + renkli diskler) derler; `--vector` bunu zorlar.

## Özelleştirme

Metinler, kampanya, ürünler (kod, ad, fiyat, adres), metal renkleri, charm yuva konumları (`stage.slots`), gösteri sırası (`demoOrder`) ve süreler `src/data.js` içindedir. Renkler `src/styles.css` → `:root`.
