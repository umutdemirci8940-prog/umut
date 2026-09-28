# Superonline – 1000 Mbps Masthead (970×250)

"**HIZ KADRAJA SIĞMIYOR**" fikri üzerine kurulu, media-first HTML5 masthead. İki sürüm:

| Sürüm | Dosya | Ne yapar |
|---|---|---|
| **Etkileşimli (ana teslim)** | [`970x250/index.html`](970x250/index.html) | Kullanıcı **basılı tutarak** sayacı 1000 Mbps'e çıkarır; bırakınca hız düşer. 4 sn içinde etkileşim yoksa otomatik oynar. |
| Otomatik | [`970x250-autoplay/index.html`](970x250-autoplay/index.html) | Aynı kurgu, etkileşimsiz, 12 sn'lik zamanlanmış akış. Etkileşime izin vermeyen yerleşimler için. |

Her ikisi de tek dosya: tüm CSS ve JS içeride, Canvas yok, harici framework / CDN / görsel yok (logo base64, ikonlar satır içi SVG).

Kampanya sayfası: <https://www.superonline.net/ev-interneti/fiber-internet/onlinea-ozel-fiber-hizlari-kampanyasi/1000-mbps>

## Etkileşimli kurgu

| Durum | Ne olur |
|---|---|
| **Bekleme (attract)** | Logo, ortada yay biçimli hız göstergesi ve 100–112 arasında "nefes alan" sayaç; sağda nabız halkalı **"BASILI TUT · HIZLAN"** pedalı (final CTA'sının konumunda). İmleç banner üzerinde gezerken hız çizgileri hafifçe paralaks yapar. |
| **Basılı tutma** | Pedala ya da banner'ın herhangi bir yerine basılı tutulunca sayaç üstel ivmeyle yükselir (≈2 sn'de 1000). Gösterge dolar, kademeler yanar, hız çizgileri hızlanıp uzar, rakamın arkasında sarı motion-blur hayaletleri belirir, pedalın içi dolar. Boşluk / sağ ok tuşu ve dokunmatik de çalışır. |
| **Bırakma** | Hız 100'e doğru hızla düşer; 300'ün üstünde bırakılırsa pedalın üstünde kısa bir **"BIRAKMA!"** uyarısı çıkar (en fazla 3 kez). Pedala kısa dokunuşlar anlık +90 Mbps verir (hızlı tıklayarak da çıkılabilir). |
| **1000 Mbps – wow moment** | Flaş, şok halkası, ışık süpürmesi, kamera sarsıntısı; "1000" sarıya dönüp 6,6 kat büyüyerek kadrajdan **taşar**, sonra üstten alta dayanan boyuta oturur; "Mbps" sağa itilir. Pedal kaybolur. |
| **Devamı** | "Online'a Özel Fiber İnternet" → FİLM · OYUN · DOWNLOAD · UPLOAD · ÇOKLU CİHAZ → final: "1000 Mbps Fiber İnternet", "Online'a Özel", 950 TL/ay, koşullar, sarı **HEMEN BAŞVUR** (pedalın yerinde belirir) ve sağ altta küçük **TEKRAR DENE**. |
| **Otomatik oynatma** | 4 sn içinde etkileşim yoksa pedal kendiliğinden basılı görünür ve aynı fizikle hızlanır: etkileşimsiz izleyici için toplam ≈13 sn, sonra final karesi sabit. |

Tıklama kuralları: kısa tıklama (≤220 ms, hız kazanımı yok) her yerde kampanya sayfasını açar; basılı tutma sonrası bırakma tıklama sayılmaz. Pedal tıklaması sayfaya gitmez. CTA her zaman sayfaya gider.

Ekran görüntüleri: [`preview/`](preview/) (etkileşimli), [`preview-autoplay/`](preview-autoplay/) (otomatik)

| Bekleme | Basılı tutma | Hızlı |
|---|---|---|
| ![](preview/01-attract.jpg) | ![](preview/02-hold.jpg) | ![](preview/03-hold-fast.jpg) |

| Taşma (peak) | Mesaj | Final |
|---|---|---|
| ![](preview/05-impact-peak.jpg) | ![](preview/07-tag.jpg) | ![](preview/09-final.jpg) |

## Teknik

- 970×250 sabit alan, `<meta name="ad.size">` etiketi mevcut.
- Sahneler `#ad` üzerine eklenen sınıflarla (`s1`, `s3`, `s3b`, `s4`, `s4out`, `s5`, `done`, `auto`, `interacted`) CSS keyframe'lerini tetikler; sayaç fiziği, gösterge yayı, pedal dolgusu ve hız çizgileri `requestAnimationFrame` ile JS'ten sürülür (yalnızca `transform`/`opacity`, `will-change`, `contain:strict`). Final karesinde rAF durur.
- Giriş: Pointer Events (fare, dokunmatik, kalem), klavye (Boşluk / sağ ok), `touch-action:none`.
- Tıklama: tüm alan (`#exit`) ve CTA (`#cta`). `window.clickTag` / `clickTAG` tanımlıysa o URL, `Enabler` varsa `Enabler.exit('CTA', url)`, aksi hâlde `CONFIG.url` yeni sekmede açılır. `href` de kampanya URL'sini taşır.
- Hover: CTA hafif yükselir, ok kayar, parlama süpürmesi geçer; pedal parlar.
- `prefers-reduced-motion` açıksa doğrudan final karesine yakın başlar.
- Konsol hatası yok; Chromium'da Playwright ile doğrulandı: otomatik akış (impact 6,0 sn, final 10,8 sn, 12,8 sn'de sabit), basılı tutma (≈2 sn'de impact, tıklama bastırma), erken bırakma (hız düşüşü), kısa tıklama (sayfa açılır), pedal dokunuşları, klavye, Tekrar Dene, clickTag/Enabler.

## Kolay değiştirilecek alanlar (`970x250/index.html`)

| Ne | Nerede |
|---|---|
| Fiyat, birim, koşul metni, kampanya URL'si | `<script>` başındaki `CONFIG` nesnesi (`price`, `priceUnit`, `terms`, `url`) |
| Otomatik oynatma gecikmesi | `CONFIG.autoplayAfter` (sn) |
| Etkileşim fiziği | `accelBase`, `accelGain` (ivme), `decay` (bırakınca düşüş), `tapBoost` (kısa dokunuş) |
| Sayaç başlangıç / hedef değeri | `CONFIG.speedStart`, `CONFIG.speedMax` |
| Impact sonrası sahne zamanları | `T` nesnesi (`tag`, `uses`, `usesOut`, `final`, `end`) |
| Döngü (yalnızca otomatik akış) | `CONFIG.loop: true`, `loopHold`, `maxLoops` |
| Renkler | `:root` değişkenleri (`--yellow`, `--bg0`, `--bg1`, `--ink` …) |
| Logo | `CONFIG.logoWhite` (koyu zemin için negatif: yazı beyaz, işaret sarı – varsayılan) ve `CONFIG.logoColor` (orijinal renkli) base64 gömülü; kaynak: Turkcell Superonline PNG (301×88, CDN). `logoHeight`, `logoPlate` (renkli logo beyaz plakada), `logoInvert`. Yüklenemezse `#logo` içindeki tipografik yedek görünür. |
| Metinler | Pedal etiketi (`.pedal .lbl`), "BIRAKMA!" (`#hint`), `.tag`, `.use`, `.headline`, `.sub`, `.kicker`, CTA ve "TEKRAR DENE" doğrudan HTML'de |
| Gösterge kademeleri | `TICKS` dizisi |
| Hız çizgisi yoğunluğu | `makeStreaks()` içindeki `n` |

> **Doğrulama notu:** Bu banner'ın hazırlandığı ortamın ağ politikası `www.superonline.net` alan adına erişime izin vermedi. Fiyat (950 TL/ay), 12 ay taahhüt, "modem ve tüm vergiler dahil", "kurulum ve aktivasyon ücretsiz" bilgileri kampanya sayfasının arama motoru özetlerinden alındı; yayın öncesi sayfadaki güncel değerlerle karşılaştırılmalıdır. Logo, müşterinin CDN'e yüklediği Turkcell Superonline PNG'sinden alınıp base64 olarak gömüldü; koyu zemin için lacivert yazı beyaza çevrilmiş negatif sürüm üretildi (sarı işaret korundu), orijinal renkli sürüm `logoPlate` seçeneğiyle kullanılabilir.
