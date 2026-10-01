# Turkcell Superonline – "Kendini Geçen Reklam" 970×250 masthead

Kampanya: [Online'a Özel Fiber Hızları 1000 Mbps](https://www.superonline.net/ev-interneti/fiber-internet/onlinea-ozel-fiber-hizlari-kampanyasi/1000-mbps)
Teslim: `970x250/index.html` (tek dosya, ~30 KB; logo ve YouTube ikonu siteden çekilip gömülü)

| Sahne | Süre | İçerik |
|---|---|---|
| 1 Oynatıcı | 6,2 sn | Banner bir video reklamı gibi davranır: "Şu an bir reklam izliyorsun." 3 sn sayaç, sonra "Reklamı Geç" düğmesi. Tıklanmazsa kendini geçer. |
| 2 Sessizlik | 3,3 sn | Alan boşalır: "Geçtin. Ne güzel, değil mi?" · Superonline'lılara 3 ay YouTube Premium hediye. |
| 3 Bir sıfır | 3,6 sn | 100'ün sonuna sarı bir 0 düşer, 1000 olur; fiyat 950 TL/Ay'da kalır. "Bir sıfır fazlası. Kuruş fazlası yok." |
| 4 Teklif | 6 sn + sabit | Logo, Upload 100 Mbps, 3 ay YouTube Premium, kurulum + aktivasyon ücretsiz, iptal bedeli 5.000 TL'ye kadar, 950 TL/Ay, Hemen Başvur. |

- Bir döngü ~19 sn; 30 sn sınırı içinde ikinci tura girmez, teklif karesinde durur. Tekrar oynat düğmesi var.
- Tıklama: `window.clickTag` (Google Ads / CM360) veya `Enabler.exit` (Studio); yoksa UTM'li kampanya sayfası. "Reklamı Geç" ve "Tekrar oynat" çıkış tetiklemez.
- Klavye: banner odaklanabilir (Enter = çıkış), Reklamı Geç / Hemen Başvur sekmeyle erişilir. `prefers-reduced-motion` açıksa doğrudan teklif karesi.
- Fontlar Google Fonts'tan (Figtree, JetBrains Mono), Arial yedekli.

Veriler `research/` klasöründeki gerçek site ziyaretinden alındı (GitHub Actions + Chromium; bulut ortamı siteye doğrudan erişemiyor).
Derleme: `node build-970.js` · ekran görüntüleri: `node tools/capture-970.js` → `970x250/screens/`

`teklif/index.html`: aynı konseptin mecra proje önerisi sayfası (Reklamsız Saat, Online'a Özel, Eski İnternetime, Ham Kayıt).
