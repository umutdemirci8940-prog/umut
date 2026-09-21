# Paribu – 970×250 İnteraktif Rich Media Masthead

[paribu.com](https://www.paribu.com/) için hazırlanmış, son tüketiciye (yatırımcıya) yönelik **oyunlaştırılmış, animasyonlu, tek dosyalık HTML5 rich media masthead** (970×250).

| Dosya | Ne |
|---|---|
| **`dist/970x250/index.html`** | Reklam ağına yüklenecek masthead (tek dosya, ~122 KB, harici istek yok; sitenin logosu, coin ikonları ve font gömülü) |
| `dist/zip/paribu-masthead-970x250.zip` | Aynı dosya zip içinde |
| `release/sunum.html` | Tek dosyalık sunum: masthead gömülü, yayın simülasyonu, kurgu notları, ekran görüntüleri |
| `release/paribu-masthead-teslim.zip` | dist + sunum + ekran görüntüleri + bu README |
| `preview/index.html` | Sunum sayfası (depodan açılır) · `preview/video/paribu-970x250.webm` kısa kayıt |

| Kurgu tamam | Oyun | Kazanma |
|---|---|---|
| ![](preview/screens/03-kurgu-tamam.jpg) | ![](preview/screens/06-portfoy-doluyor.jpg) | ![](preview/screens/07-kazandin.jpg) |

| Coin üzerine gelme | Otomatik gösteri | Konfeti |
|---|---|---|
| ![](preview/screens/04b-coin-hover.jpg) | ![](preview/screens/04-otomatik-gosteri.jpg) | ![](preview/screens/08-konfeti.jpg) |

## Konsept: “Telefonu yönlendir, coinleri yakala”

Masthead ilk saniyede markayı ve mesajı verir, sonra izleyiciyi oyuna çeker. Sahne katmanlı ve derinlikli kurulmuştur: en arkada imleçle kayan (paralaks) bulanık coin siluetleri ve süzülen ışık noktaları, önünde canlı mum grafiği ve yükselen fiyat çizgisi, önde 3B görünümlü coinler ve alttan yükselen Paribu telefonu.

1. **Giriş (0–3 sn)** – Koyu nötr “işlem ekranı” zemini; sitenin limon yeşili “PARiBU” logosu ışık parlamasıyla belirir, mum grafiği ve fiyat çizgisi soldan sağa çizilir. “**Kripto dünyasına / ilk adımını at.**” satırları bulanıktan netleşerek yükselir; alt metin, sitenin CTA’ları “**Hesap oluştur**” (birincil) ve “**Uygulamayı indir**” (hayalet) gelir. BTC, ETH, SOL, AVAX, XRP, DOGE metalik kenarlı, dönen 3B coinler olarak sağdan uçar; 2,0 sn’de **Paribu telefonu** alttan yükselir (ekranında “Portföyüm 0/5”), “Yeni üyelere özel 500 TL hediye” kartı 3B dönüşle açılır, ürün çipleri (Kripto al/sat · Hisse · DeFi · Getiri) ve güven satırları (Türk lirası ile yatır/çek · 7/24 destek) gelir.
2. **Otomatik gösteri (3 sn →)** – İpucu: “Telefonu imleçle yönlendir, coinleri yakala!”. Coinler tek tek düşmeye başlar, telefon kendi kendine (bazen kaçırarak) yakalar; kazanmaz, son iki coini kullanıcıya bırakır. Etkileşim olmazsa **30 sn**’de durağan kareye geçer (IAB/Google 30 sn kuralı); etkileşimle yeniden başlar.
3. **Oyun** – İmleç banner üzerine gelince telefon imleci izler ve hareket yönüne hafifçe yatar (dokunmatikte parmak, klavyede ← →). Sahne imleçle paralaks yapar, imlecin etrafında yeşil bir ışık halesi gezer. Yakalanan her coin: telefon ekranı yeşil flaş verir, sahne hafifçe sarsılır, parçacık patlaması ve +1; coin **uygulamadaki portföy listesine** satır olarak eklenir (ikon, ad, mini grafik). Art arda yakalamalar **SERİ x2, x3…** yazısıyla ödüllenir; kaçırma seriyi sıfırlar. Havada duran bir coinin üzerine gelince adı görünür, **tıklayınca hemen düşer**. Oyun alanına tıklama/Boşluk = **hamle**: telefondan mıknatıs dalgaları yayılır, yakındaki coinler çekilir.
4. **Kazanma** – 5 coin → konfeti; telefon ekranında onay işareti ve “Portföyün hazır!”, başlık “**Portföyün hazır! Şimdi Paribu’da kur.**”, CTA “**Şimdi hesap oluştur**” olup nabız atar, “Tekrar oyna” çıkar. 4 sn sonra oyun kendiliğinden sıfırlanır.

Arka plandaki grafik ve mumlar yalnızca dekoratiftir (rastgele, yukarı eğilimli yürüyüş); **gerçek fiyat/getiri gösterilmez**, sayısal vaat yoktur. Yasal ibare (“Kripto varlıklar yüksek fiyat dalgalanması riski içerir; yatırım tavsiyesi değildir.”) sabittir.

## Rich media özellikleri

- **Tıklama/çıkış:** Logo, başlık, iki CTA, kampanya kartı ve boş alanlar siteye gider (`Enabler.exit` etiketleri: CTA, Uygulama, Logo, Kampanya, Banner). Oyun alanındaki tıklama çıkış değil hamledir (coin üzerindeyse coini düşürür); ağ “her yer tıklanabilir olsun” isterse `src/data.js` → `brand.clickThroughEverywhere: true`. Öncelik: `window.clickTag` → `Enabler.exit()` → `brand.url` (UTM’li).
- **Etkileşim sayaçları:** `window.adTrack(olay)` tanımlıysa çağrılır, `Enabler` varsa `Enabler.counter(olay)`. Olaylar: `interaction`, `game_start`, `coin_catch`, `coin_miss`, `coin_tap`, `boost`, `game_win`, `replay`, `cta_click`, `exit`. Ağın kendi izleme makrosu `runtime.js` → `track()` içine bir satırla bağlanır.
- **Durum API’si (QA/entegrasyon):** `window.paribuMasthead.state()` (mod, skor, seri, telefon konumu, portföy satırları, coin konumları), `.spawn()`, `.reset()`.
- **Sekme gizlenince duraklar**, `postMessage('pause'|'play'|'restart')` ile dışarıdan yönetilir (sunum sayfası bunu kullanır).
- `<meta name="ad.size">`, `role="group"`, `aria-label`, klavye odağı; `prefers-reduced-motion` açıksa giriş kurgusu atlanır ve coinler yalnızca kullanıcı etkileşimiyle düşer.
- Canvas 2D (retina 2×; paralaks, mum grafiği, 3B coinler, telefon ekranı ve parçacıklar tek canvas’ta), ses yok, genişleme yok; tüm etkileşim 970×250 içinde. **Harici istek yok** (font, ikon ve logo gömülü) – rich media ağlarının “self-contained” şartına uygundur.

> “First media” talebi, isteğin bağlamına göre **rich media** (etkileşimli, oyunlaştırılmış, ölçümlenebilir masthead) olarak yorumlandı. Belirli bir ağ/sağlayıcı (ör. “First Media” adlı bir rich media platformu) hedefleniyorsa, dosya standart HTML5 + clickTag olduğu için o ağın yükleme şablonuna uyarlanması `track()` / `openLink()` fonksiyonlarına birer satır eklemekten ibarettir.

## Gerçek marka varlıkları (siteden, GitHub Actions ile)

Claude Code’un bulut oturumunun ağ politikası paribu.com, brandfetch, seeklogo ve Wikipedia’ya erişime izin vermedi. Bu yüzden marka varlıkları, önceki çalışmalarda olduğu gibi **GitHub Actions** üzerinde toplandı (`.github/workflows/fetch-assets.yml` → `tools/fetch-assets.js`, Playwright ile gerçek tarayıcı) ve `assets/` altına push’landı. Bulunanlar ve mastheadde kullanılanlar:

| Varlık | Kaynak | Kullanım |
|---|---|---|
| **Kelime markası** “PARiBU” (SVG, 131×24, #9BBA3C) | `https://www.paribu.com/icon/paribu-color.svg` (sitenin üst bilgi logosu) → `assets/logo/www-paribu-com-img-1-paribu-color.svg` | Sol üst logo (gömülü, orijinal limon yeşili) |
| **Sembol** – kelime markasının “P” glifi (beyaz) | Aynı SVG’nin ilk yolundan `build.js` türetir → `assets/logo/symbol-glyph.svg` | Cüzdanın üzerindeki işaret (`--icon-symbol` ile sitenin uygulama ikonu kullanılır) |
| **Marka rengi** #9BBA3C (limon yeşili) | Logonun dolgusu; sitede `--color-foreground-accent`, “Uygulamayı indir” düğmesi. Koyu ton #5C7012 = sitenin `--color-button-secondary-accent-text` | CTA, vurgu satırı, grafik, cüzdan, çipler |
| **Zemin** #12141A → #1F2229 | Sitenin koyu kart ailesi (#121212 “Paribu evreni” kartları, `--fg-primary` #1F2229) | Masthead zemini (koyu “işlem ekranı”) |
| **Metinler** | Ana sayfa: “Yarının dünyası şimdi daha geniş.”, ürünler *Kripto al/sat · Piyasalar · Hisse · Getiri · Keşfet*, CTA’lar “Hesap oluştur” / “Hemen başla”, “Uygulamadan ayrılmadan 7/24 destek” | CTA “Hesap oluştur”, alt metin ve ürün çipleri sitenin adlandırmasıyla |
| **Tipografi** | Sitede *ParibuSans* ve *Campton* (lisanslı, gömülemez) | Yerine geometrik **Sora** (OFL) gömülü |
| Referans | `assets/site/*.jpg` ana sayfa/blog/hub/medya ekran görüntüleri, `assets/report.md` tüm adaylar ve renk tablosu, `assets/manifest.json` seçimler | — |

> `net.paribu.com/medya` sayfasındaki basın kiti **Paribu NET** alt markasına aittir (`assets/logo/press/`); ana marka için kullanılmadı. Farklı bir logo sürümü istenirse `assets/manifest.json` → `logo.file` değiştirilip `node build.js` çalıştırılır.

Yeniden çekmek için: *Actions* → “Paribu – siteden logo/renkleri çek ve mastheadi derle” → *Run workflow*. İş akışı varlıkları çeker, derler, ekran görüntüsü/video/paket üretir ve dala push’lar.

Coin ikonları: [cryptocurrency-icons](https://www.npmjs.com/package/cryptocurrency-icons) (CC0, `assets/coins/`). Tipografi: **Sora** (Google Fonts, OFL; değişken ağırlık, latin + latin-ext gömülü ≈ 66 KB).

## Özelleştirme

Tüm metinler, kampanya kartı, renkler, coin listesi, oyun ve süre ayarları **`src/data.js`** içindedir:

```js
copy.headline: ['Kripto dünyasına', 'ilk adımını at.'],   // copy.cta: 'Hesap oluştur', copy.features: ['Kripto al/sat', 'Hisse', 'DeFi', 'Getiri']
campaign: { enabled: true, kicker: 'Yeni üyelere özel', value: '500 TL', suffix: 'hediye*' },
game: { target: 5, dropIdle: 2300, dropPlay: 1150, phoneWidth: 126, maxAutoplay: 30000 },
brand: { url: 'https://www.paribu.com/?utm_…', clickThroughEverywhere: false },
```

> **Kampanya kartı** ParibuLog’daki “Paribu’dan yeni üyelere özel kampanya: 500 TL hediye” duyurusuna dayanır; yayın öncesi güncelliği ve koşulları markayla teyit edin. `campaign.enabled: false` ile kart kalkar, yerine ürün çipleri büyür. Başlık ve alt metin de markanın onayından geçmelidir.

```bash
node build.js                 # dist/970x250/index.html + zip  (--placeholder-logo, --icon-symbol, --data-colors, --no-campaign, --no-embed-fonts)
npm run capture:video         # preview/screens/*.jpg + preview/video/*.webm (Playwright + Chromium)
npm test                      # etkileşim duman testi (30 sn sınırı dâhil; --quick ile atlanır)
node tools/package.js         # release/ (tek dosya masthead, zip, sunum.html, teslim zip)
```

## Yükleme notları

- **Rich media / masthead ağları (Adform, Sizmek/Amazon Ad Server, yayıncı özel formatları):** `index.html`’i doğrudan yükleyin; ağın clickTag makrosunu tanımlaması yeterlidir. Etkileşim sayaçları için `window.adTrack` ya da ağın API’sini `track()` içine bağlayın.
- **Google Ads / DV360 / CM360:** `ad.size` meta etiketi, `clickTag` ve `Enabler` desteği hazırdır. Studio’ya yükleniyorsa `<head>` içine `<script src="https://s0.2mdn.net/ads/studio/Enabler.js"></script>` ekleyin.
- Fontu dışarıdan yüklemek (dosyayı ~65 KB küçültmek) için `node build.js --no-embed-fonts` (Google Fonts bağlantısı kullanılır).
- Google Ads standart display için 150 KB sınırı uygular; dosya ~122 KB’dır.

## Klasör yapısı

```
src/data.js           Metinler, kampanya, renkler, coinler, oyun/süre ayarları
src/template.js       HTML birleştirici (stil + motor + varlıklar)
src/styles.css        Yerleşim ve giriş animasyonları
src/runtime.js        Tarayıcı motoru: canvas oyunu, grafik, parçacıklar, izleme kancaları
build.js              dist/ üretici (manifest varsa gerçek logo/renk)
assets/coins/         Coin ikonları (CC0)   assets/fonts/  Sora (OFL)   assets/logo|site|manifest.json|report.md  siteden (Actions)
tools/fetch-assets.js Siteden logo/sembol/renk/metin toplayıcı (Playwright)
tools/optimize-logo.js Logo kırpma/beyazlatma
tools/capture.js      Ekran görüntüsü + video     tools/smoke.js  Etkileşim testi     tools/package.js  Teslim paketi
preview/              Sunum sayfası, ekran görüntüleri, video
release/              Teslim dosyaları
```
