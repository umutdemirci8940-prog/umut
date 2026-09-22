# 12'yi Geçiyor · Pluxee Geçiyor için media-first özel proje

Pluxee'nin "Pluxee Geçiyor" kampanyası için hazırlanan özel proje önerisi ve 970×250 kahraman birim.

| Dosya | İçerik |
|---|---|
| `PROJE.md` | Proje dokümanı: ana fikir, adım adım kullanıcı deneyimi, kampanya bağı, data / mecra / teknoloji, kategori tablosu, teknik uygulama, müşteri pitch'i |
| `index.html` | 970×250 tek dosyalık kahraman birim. Doğrudan açıldığında sunum kabuğu (bağlam simülatörü + otomatik döngü) kurulur; bir reklam alanı iframe'inde açıldığında yalnız 970×250 birim çalışır |
| `screens/` | Sahne ekran görüntüleri (S0 ısınma → S7 kapanış, işveren yüzü, takvim modları, Ramazan) ve örnek Öğle Arası Fişi |
| `tools/capture.js` | Playwright ile sahne görüntüleri ve etkileşim duman testi |

## Birimi açmak

- Sunum: `index.html` dosyasını tarayıcıda açın. Üstte 970×250 birim, altında simülatör (saat, mecra, il, kitle, gün, hava, sıra, oy, veri durumu), "Döngü" (52 saniyelik otomatik sunum) ve "Üç ekran" (aynı dakika, üç bağlam) bulunur.
- Yalnız birim: `index.html?dev=0&hour=12&min=7&cat=finance&seg=whitecollar&city=06`
- Canlı yayın: aynı dosya ad server key-value'larından beslenir: `hour, min, dow, dom, cal (none|monday|payday|eom|ramadan), cat (news|finance|recipe|market|auto|sport|culture|life|career|tech), seg (whitecollar|hr|employer|sme|decision), city (plaka), weather (clear|rain|heat), seq (1-4)`. Parametre yoksa cihaz saati kullanılır. `window.clickTag` tanımlıysa o kullanılır; `Enabler` varsa `Enabler.exit` çağrılır.

## Ekran görüntülerini yenilemek

```bash
NODE_PATH=$(npm root -g) node pluxee-geciyor/tools/capture.js
```

Playwright + Chromium gerekir. Google Fonts erişimi kısıtlıysa betik fontları bir kez indirip yerelden servis eder.

## Notlar

- Birimdeki "pluxee" yazı markası yer tutucudur; yayın öncesi resmi logo SVG'si ve marka fontu yerleştirilmelidir.
- İl bazlı üye iş yeri rakamları ve barometre yüzdeleri örnek veridir; canlıda Pluxee onaylı il verisi (`il.json`) ve gerçek oylardan üretilen `barometre.json` kullanılır.
- Kişisel veri işlenmez: segment kitle düzeyinde, konum IP il, oy anonim (il + seçenek + kategori), sıra sayacı oturum düzeyinde.
