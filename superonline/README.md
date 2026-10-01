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

---

## Media-first alternatifler

### "Aynı Anda" – `970x250-ayni-anda/index.html` (~34 KB)
Gece, kesiti görünen bir ev. Dört odaya dokundukça (veya imleçle üzerine gelince) ışık yanar, ekranlarda medya oynar.
- **Kanal değiştirme:** Açık bir odaya tekrar dokununca ekran değişir. Salon: 4K film / canlı maç / belgesel · Çocuk odası: online oyun / oyun indirme / canlı yayın · Çalışma odası: toplantı / online ders / sunum · Genç odası: video yükleme / foto yedekleme / hikâye paylaşımı. Banner bittikten sonra da çalışır.
- Sağdaki "Evin bağlantısı · 1000 Mbps" çubuğu her odayla dolar; dördü açıkken "Hepsi açık. Hâlâ bol yer var." (Görsel temsil; payların Mbps karşılığı yok.)
- Dokunulmazsa 3,6 sn'de odalar sırayla kendiliğinden yanar. Sonra "Herkes aynı anda. Kimse sıra beklemiyor." → teklif.
- Oda tıklamaları çıkış tetiklemez; boş alanlar ve Hemen Başvur kampanya sayfasına gider. Odalar klavyeyle (Tab + Enter) kullanılabilir.

### "Fener" – `970x250-fener/index.html` (~26 KB)
Gece şehir silüeti (canvas). İmleç şehrin üzerinde gezindikçe çatılardan anı fenerleri yükselir; imleç fenerleri rüzgâr gibi iter.
- Sayaç "Yüklenen anı" 100'e ulaşınca bütün fenerler gökyüzünde **100** yazar → "Üstelik Upload 100 Mbps." → teklif.
- "100" oluştuktan sonra imleçle dağıtılabilir; fenerler yaylanarak yerlerine döner.
- Dokunulmazsa fenerler kendiliğinden yükselir, 7,5 sn'de 100 tamamlanır. Klavyede Boşluk = fener bırak, Enter = çıkış.

Ortak: 30 sn kuralı (tek tur, sonra teklif karesinde durur, tekrar oynat düğmesi), `clickTag` / `Enabler.exit`, `prefers-reduced-motion` için durağan son kare.
Ekran görüntüleri: `node tools/capture-media.js` → `970x250-ayni-anda/screens/`, `970x250-fener/screens/`
