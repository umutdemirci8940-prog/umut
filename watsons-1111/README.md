# Watsons 11.11 – 15 İnteraktif Masthead (970×250)

[watsons.com.tr](https://www.watsons.com.tr/) için 11.11 Büyük İndirim Günü'ne yönelik 15 interaktif masthead. Yedisi aynı dosyayla **mobil uyarlamalıdır** (320×480 alana konduğunda mobil yerleşime geçer), yedisi **3B** sahne kullanır. Görseller vektör çizim değildir: ürün fotoğrafları, fiyatlar, kampanya bannerları ve logo siteden alınmıştır. Yazı tipi sitenin kendi fontu **Rubik**, renkler sitenin turkuazı `#009AA9` ve "Sadece Watsons'ta" magentası `#E708A3`.

**Sunum:** `sunum/index.html`. Splash Digital'in *ilacsizkasimonerileri.html* şablonuyla aynı tasarımdadır: tüm çalışmalar tek sayfada, satır satır (Çalışma 1–15). Her satırda "Tekrar oynat" düğmesi vardır; çalışma ekrana geldiğinde kendiliğinden baştan oynar. Mobil uyarlamalı çalışmalarda masthead'in altında telefon çerçevesi içinde 320×480 hali gösterilir.

| # | Çalışma | Mekanik | Mobil | 3B |
|---|---|---|:-:|:-:|
| 1 | 11.11 Geri Sayım | 11.11'e canlı geri sayım yapan 3B kapakçıklı (flip) saat. Ürün kartları üzerine gelince/dokununca 3B döner, arkada fiyat ve Watsons Club fiyatı. 11.11 günü "bitmesine kalan" sayar. | ✔ | ✔ |
| 2 | 11.11 Küpü | Sürüklenerek çevrilen 3B küp; her yüz bir kategori (Makyaj, Cilt, Saç, Parfüm…) ve bir yüzü 11.11. Öndeki yüze göre sağ panel ve ürünler değişir. | ✔ | ✔ |
| 3 | Şans Çarkı | 8 kategorili çark; işaretçi dilimlerde tıkırdar, çıkan kategorinin ürünleri ve kupon gelir. | ✔ | |
| 4 | Kazı Kazan | Gümüş kaplamalı 3 pencere, parmak/fareyle kazınır (%45 açılınca açılır). Hepsi açılınca kupon. | ✔ | |
| 5 | 3B Ürün Halkası | Ürünler 3B halkada döner; sürükle, oklar ya da ürüne dokun. Öndeki ürünün marka/ad/fiyatı sağda. | ✔ | ✔ |
| 6 | Hediye Kutusu | 3B hediye kutusu; dokununca kapak uçar, ürünler yay boyunca fırlar, konfeti ve kupon. | | ✔ |
| 7 | Sepeti Doldur | Raftaki ürünler sepete sürüklenir (veya dokunulur); sepet doldukça 11.11 kademeleri açılır. | | |
| 8 | 11 Saniye Ürün Yağmuru | 11 saniyelik oyun: sepetle yağan ürünleri yakala, gri toplardan kaç. Skor, en iyi skor, kupon. | ✔ | |
| 9 | Fırsat Kapsülü | Oyuncak kapsül makinesi; kol çevrilir, kapsül yuvarlanıp açılır, içinden ürün çıkar. | | |
| 10 | Işığı Gezdir | Karanlık vitrin; imleç/parmak bir spot ışığıdır. Işık değen ürünün fiyat etiketi yanar, 5 ürünü bul. | | |
| 11 | Eşini Bul | 12 kartlık 3B hafıza oyunu (6 ürün çifti); hamle sayacı, bitince kupon. | | ✔ |
| 12 | Rutinini Kur | 3 soruluk test; cevaba göre kategoriden 3 adımlı ürün rutini önerir. | | |
| 13 | 11 Fırsat Kapısı | 11 kapı menteşesinden 3B açılır, arkasında ürün ve fiyat; 11. kapı altın kapı (kupon). | | ✔ |
| 14 | Beğen / Geç | Tanışma uygulaması gibi ürün destesi: sağa kaydır beğen, sola geç; favoriler toplanır. | ✔ | |
| 15 | Derinlikli Vitrin | Katmanlı 3B vitrin; fare (mobilde jiroskop) ile sahne eğilir, neon 11.11 tabelası, üzerine gelinen ürün öne çıkar. | | ✔ |

## Kaynak görseller

watsons.com.tr veri merkezi IP'lerine Akamai üzerinden "Access Denied" döndüğü ve bu oturumun ağ politikası siteye izin vermediği için görseller **sitenin Internet Archive (Wayback Machine) kopyasından** gerçek tarayıcıyla alındı. Dosyalar sitenin kendi ürün fotoğrafları, logosu ve bannerlarıdır (`media.watsons.com.tr` adresleri `assets/index.json` içinde `original` alanında). İş akışları: `.github/workflows/watsons-fetch.yml` (kategori sayfaları; önce doğrudan siteyi dener, engellenirse arşive geçer) ve `watsons-detail.yml` (ürün detay sayfalarından 1200×1200 fotoğraflar).

Durum: 6 kategoriden (Makyaj, Saç, Parfüm, Kişisel Bakım, Erkek, Çok Satanlar) 44 ürün; bunların 14'ü 1200×1200, diğerleri sitenin liste görseli olan 195×195 boyutundadır. Büyük boyutlu ürünler kartların öne çıktığı yerlere konmuştur (`assets/manual.json` → `order`). Arşivde yaşam tarzı fotoğrafı bulunamadığı ve sitedeki kampanya bannerlarının üzerinde başka kampanyaların metni olduğu için arka planlar ürün fotoğraflarından oluşan kolajlardır. Sitenin ağ erişimi olan bir makinede `fetch-site.js` çalıştırılırsa tüm ürünler büyük boyutta ve ana sayfa slider görselleriyle gelir; `prepare.py` ve `build.js` aynı şekilde çalışır. "Sağlıklı Yaşam" kategorisi (prezervatif vb.) masthead'e uygun olmadığı için dışarıda bırakıldı.

```bash
# GitHub Actions: "Watsons 11.11 – siteden görsel arşivini çek" → Run workflow   (ya da normal internet erişimi olan bir makinede:)
node tools/fetch-site.js            # doğrudan site (Akamai engellemezse)
node tools/fetch-wayback.js         # arşiv kopyası (kategori sayfaları)
node tools/fetch-detail.js          # arşiv kopyası (ürün detayları, büyük fotoğraflar)
python3 tools/prepare.py            # assets/ → assets/ads/ (fon temizleme, WebP, ürün/kategori seçimi)
node tools/build.js                 # dist/<çalışma>/ + dist/zip/ + dist/inline/
node tools/present.js               # sunum/index.html
NODE_PATH=$(npm root -g) node tools/shoot.js   # preview/ ekran görüntüleri + konsol hatası kontrolü
NODE_PATH=$(npm root -g) node tools/smoke.js   # her çalışmanın mekaniğini tetikleyen etkileşim testi (preview/<çalışma>-x.jpg)
```

Ürün sırasını veya logoyu elle seçmek için `assets/manual.json`: `{ "order": ["urun-anahtari", …], "logo": "assets/brand/logo-0.svg" }`.

## Teknik

- Her çalışma tek `index.html` + `img/` klasörü (yalnızca kullandığı görseller); `dist/zip/watsons-1111-<çalışma>.zip` yüklemeye hazırdır. `dist/inline/` görselleri gömülü tek dosya sürümleridir (sunumda kullanılır).
- Tıklama: `clickTag` boş bırakıldı; reklam ağı makrosu yazılırsa tüm tıklamalar oraya gider, boşsa her öğe kendi ürün/kategori sayfasına (UTM'li) gider. Studio'da `Enabler.exitOverride`, sayaçlar `Enabler.counter` ile ölçülür.
- Etkileşimli kontroller (çark düğmesi, kazıma alanı, oyun alanı, kartlar) reklam çıkışını tetiklemez; boş alana tıklama genel çıkıştır.
- Mobil uyarlama: aynı dosya 640 px'ten dar alanda `html.m` sınıfıyla mobil yerleşime geçer; dokunma (kaydırma, kazıma, sürükleme) desteklidir.
- `prefers-reduced-motion` açıksa animasyonlar kısaltılır. Kullanıcı etkileşmezse her çalışma mekaniğini kendisi gösterir (çark kendiliğinden döner, kutu açılır, kapılar aralanır…).

## Yayın öncesi teyit edilecekler

Kupon kodu (`WATSONS1111`), "ekstra indirim" ifadesi, Sepeti Doldur kademeleri ve yasal metin **örnektir**; `src/data.js` içinden değiştirilir. Fiyatlar arşiv kopyasının tarihindeki site fiyatlarıdır; yayın öncesi güncel fiyatlarla yeniden derlenmeli ya da `price` gösterimi kapatılmalıdır.
