# Pluxee "Geçiyor" – Media-first interaktif masthead (970 × 250) · üç konsept

Kampanyanın ana fikri "Pluxee geçiyor: burada, şurada, orada". Aynı fikir üç farklı deneyimle, her biri **animasyonlu girişle** açılan, **kullanıcı aksiyonuyla** ilerleyen, dokunulmazsa kendini oynatan tek dosyalık HTML5 kreatif olarak hazırlandı. Medya veri katmanının **segment** sinyali kimin izlediğini (beyaz yaka, İK, işveren), **saat** sinyali hangi kabul noktasının önce geldiğini belirler.

| Konsept | Fikir | Kullanıcı aksiyonu | Dosya |
|---|---|---|---|
| **Koridor** (varsayılan) | Kart, kabul noktalarının kapılarından *geçer*; her kapıda flaş ve "Geçti ✓", finalde koridor açılır | Sürükle (ileri/geri), basılı tut (hızlan), imleçle yönlendir, rota noktasına tıkla | `dist/koridor/index.html` |
| **Mercek** | Kart bir ışık merceğidir; karanlık şehirde gezdirdiğiniz yerdeki kabul noktası aydınlanır ve "geçiyor" | Kartı imleç/parmakla gezdir (ok tuşları da) | `dist/mercek/index.html` |
| **Fiş** | POS fişi satır satır yazılır: RESTORAN … GEÇTİ ✓; toplam: HER YERDE | POS'a/karta dokunarak yazdır, satır üstüne gel, fişi çekip kopar | `dist/fis/index.html` |

Diğer çıktılar: `dist/970x250/index.html` (varsayılan konseptin kopyası), `dist/zip/pluxee-<konsept>-970x250.zip` (reklam ağı paketleri), `preview/index.html` (üç sekmeli sunum sayfası; sinyal paneli, karar zinciri), `preview/screens/` (ekran görüntüleri), `dist/arsiv/` (önceki sürümler).

## Ekran görüntüleri

| Giriş: ışık süpürmesi ve logo açılışı (ortak) | Koridor: ipucu |
|---|---|
| ![](preview/screens/giris-isik-supurmesi.jpg) | ![](preview/screens/koridor-ipucu.jpg) |

| Koridor: kapıdan geçiş | Koridor: final |
|---|---|
| ![](preview/screens/koridor-gecis.jpg) | ![](preview/screens/koridor-final.jpg) |

| Mercek: kart restoranı aydınlatıyor | Mercek: final, tüm sahne açılır |
|---|---|
| ![](preview/screens/mercek-restoran.jpg) | ![](preview/screens/mercek-final.jpg) |

| Fiş: satır satır yazdırıyor | Fiş: tamam, "HER YERDE GEÇTİ" |
|---|---|
| ![](preview/screens/fis-yazdiriyor.jpg) | ![](preview/screens/fis-tamam.jpg) |

## Gerçek logo ve kart tasarımı

Kreatifler `pluxee/assets/` klasöründeki gerçek varlıkları otomatik gömer:

- `assets/logo.svg` (ya da `.png` / `.webp`) → sol üstteki logo. Koyu renkli logo için `assets/manifest.json` içinde `"logo": {"white": true}` (kreatifte beyaza çevrilir).
- `assets/card.png` (ya da `.jpg` / `.webp`) → 3B kartın yüzü (parlama efekti üstüne biner).

Varlıkları siteden çekmenin iki yolu:

1. **GitHub Actions (önerilen):** depoda *Actions* → "Pluxee – siteden logo ve kart görselini çek, derle" → *Run workflow*. Sayfada logo/kart otomatik aranır; bulunamazsa `logo_url` / `card_url` alanlarına adresleri yazın. İş akışı indirir, optimize eder, üç konsepti derler, test eder ve dala push'lar (`.github/workflows/fetch-pluxee-assets.yml`).
2. **Yerel bilgisayarda:** `node pluxee/tools/fetch-pluxee-assets.js [--logo=<url>] [--card=<url>]`, isteğe bağlı `node pluxee/tools/optimize-pluxee-assets.js` (Playwright), sonra `node pluxee/build.js`.

> Bu çalışma Claude Code'un yalıtılmış ortamında hazırlandı; ortamın ağ politikası pluxee.com.tr'ye erişime izin vermediği için varlıklar burada indirilemedi. Depodaki derlemeler çizim logo ve kart kullanır; iş akışı çalıştırılınca gerçekleriyle yeniden derlenir.

## Ortak kurgu

- **Giriş (~0,6 sn):** yeşil-beyaz ışık süpürmesi soldan sağa geçer, logo maskeyle açılır, sahne başlığı / başlık / alt metin / CTA kademeli girer, sonra konseptin sahnesi kurulur.
- **Sol sütun:** logo, sahne başlığı (ÖĞLE YEMEĞİ / KAHVE MOLASI / MARKET ALIŞVERİŞİ / ONLİNE SİPARİŞ), kinetik kelime + sabit satır: *Restoranda, / Pluxee geçiyor.* → *Kafede,* → … → finalde **Her yerde, Pluxee geçiyor.**
- **Segment** alt metni ve CTA'yı belirler: beyaz yaka "Pluxee'yi keşfedin", İK "Teklif alın", işveren "Bize ulaşın". **Saat** ilk kabul noktasını belirler (06–10 ve 15–17 kafe, 11–14 restoran, 18–22 market, 23–05 online); yağmur (isteğe bağlı) online siparişi öne alır.
- **Final:** CTA nabız atar, "Tekrar" düğmesi görünür. Kullanıcı oynadıysa otomatik döngü yapılmaz. Otomatik gösterim her konseptte ≈ 18–21 sn (Google Ads 30 sn kuralı).
- Konum, nokta sayısı, gün içi zaman etiketi, UTM ve ajans adı **kullanılmaz**.

## Konseptler

**Koridor** – kaçış noktasına daralan zemin ızgarası, perspektifle yaklaşan dört kapı, hız çizgileri, sahneye göre değişen fotoğrafik bokeh. Kart bir kapıdan geçerken çerçeve flaş verir, "Geçti ✓" rozeti düşer, sahne sarsılır, rota noktası yeşile döner. Sürükleme ileri/geri götürür (atalet), basılı tutmak 3× hızlandırır, kısa dokunma sıçratır, imleç koridoru yönlendirir, rota noktaları kapı seçer. Klavye: ← →, boşluk.

**Mercek** – sahne karanlık ve bulanık bir şehir; kartın çevresindeki mercek (CSS maske) altındaki renkli katmanı gösterir. Dört kabul noktası loş simgelerle durur; mercek üstüne gelince aydınlanır, 0,3 sn kalınca "Geçiyor ✓" rozeti ve parçacıklar. Kart imleci gecikmeli izler, hıza göre eğilir. Dördü de aydınlanınca mercek tüm sahneyi kaplar. Dokunulmazsa kart noktaları sırayla dolaşır. Klavye: ok tuşları.

**Fiş** – kart POS'a dokunur, cihaz "Onaylandı" der, ısıl yazıcı fişi çıkar: PLUXEE / İŞLEM FİŞİ · saat / RESTORAN … GEÇTİ ✓ … / HER YERDE GEÇTİ ✓. Her satır soldan sağa basılır, kağıt yukarı kayar. POS'a ya da karta dokunmak bir sonraki satırı yazdırır; satırın üstüne gelince o yerin atmosferi ve başlığı gelir; bitince fişi çekmek (ya da dokunmak) koparır: kağıt savrulur, yuvada tırtıklı bir parça kalır. Dokunulmazsa satırlar 2,3 sn arayla yazılır ve fiş kendiliğinden kopar. Klavye: boşluk.

## Sinyaller ve parametreler

| Sinyal | Parametre | Kaynak (yayında) | Kreatifte değişen |
|---|---|---|---|
| Segment | `seg=wc` · `hr` · `emp` | 1. parti kitle segmenti + mecra bağlamı | Alt metin, CTA |
| Saat | `h=0-23`, `m=0-59` | Ad server saat makrosu; yoksa cihaz saati | İlk kabul noktası ve sıra, ışık atmosferi |
| Hava | `w=sun\|rain` (isteğe bağlı) | Hava durumu API | Yağmurda online sipariş öne alınır |
| Sunum | `demo=1` | – | Sinyal çubuğu |

Örnek: `dist/mercek/index.html?seg=hr&h=19&m=5`. Alternatif: `window.__PLUXEE_SIGNALS={seg:'hr'}`. Varyant kimliği `SEGMENT-İLKNOKTA` (`HR-MARKET`) + konsept adı ölçüm etiketi olarak raporlanır; konseptler A/B olarak yayınlanabilir.

**postMessage API:** gelen `pluxee:signals`, `pluxee:replay`, `pluxee:demo`; giden `pluxee:state` (`variant, lead, order, phase, visited, total, finalState, ended, userPlayed, hint, copy, signals, concept` + konsepte özgü alanlar) ve gömülü modda `pluxee:click`. Sayfa içinden `window.PLUXEE.setSignals / replay / state`.

## Kopya ve süreler

`src/data.js`: `cinematic` (sahneler, segment metinleri, saat → ilk nokta), `corridor`, `lens`, `receipt` (konsepte özgü kelimeler, ipuçları, süreler). Düzenleyip `node pluxee/build.js`. "Vergi avantajıyla" gibi ifadeler marka ve hukuk onayına tabidir.

## Derleme ve test

```bash
node pluxee/build.js                                   # dist/<konsept>/, zip'ler, preview/index.html
NODE_PATH=$(npm root -g) node pluxee/tools/smoke.js    # üç konsept + sunum + arşiv, gerçek fare/dokunma ile
NODE_PATH=$(npm root -g) node pluxee/tools/capture.js  # preview/screens/*.jpg
```

Kök `package.json`: `npm run pluxee:build`, `npm run pluxee:test`, `npm run pluxee:capture`.

## Teknik notlar

- 970×250 HTML5; her konsept tek dosya (~40 KB), satır içi CSS + ES5 JS. Sahneler DOM + CSS 3B, arka planlar canvas ile üretilir (görsel dosyası ve WebGL yok). Tek harici kaynak Google Fonts (Manrope); Google Ads ve DV360'ta izinlidir, gerekirse `@font-face` ile gömülür.
- `<meta name="ad.size">`, `role`/`aria`, klavye odağı; `prefers-reduced-motion` açıksa doğrudan final karesi.
- **Google Ads / CM360:** `dist/zip/*.zip` doğrudan yüklenir (`clickTag`). **DV360 / Studio:** `Enabler` algılanır. **Diğer ağlar:** `openLink()` içindeki `window.clickTag` satırı ağın makrosuna çevrilir. Tıklama hedefi `https://www.pluxee.com.tr/`.

## Klasör yapısı

```
pluxee/src/common.js             Ortak altyapı: giriş, sinyaller, logo/kart varlıkları, arka plan, API
pluxee/src/concepts/koridor.js   Konsept 1
pluxee/src/concepts/mercek.js    Konsept 2
pluxee/src/concepts/fis.js       Konsept 3
pluxee/src/data.js               Kopya, sahneler, segmentler, süreler
pluxee/src/showcase.html         Sunum sayfası şablonu (üç sekme)
pluxee/build.js                  dist/ + preview/index.html üretici (assets/ varsa gömer)
pluxee/assets/                   Gerçek logo ve kart görseli (fetch-pluxee-assets.js / elle)
pluxee/tools/fetch-pluxee-assets.js, optimize-pluxee-assets.js, smoke.js, capture.js, fonts.js
pluxee/src/template-cinematic.js, template.js   Arşiv sürümleri
```
