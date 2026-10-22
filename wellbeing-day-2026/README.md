# İçten Dışa Parla® Wellbeing Day 2026 – Interaktif HTML5 Banner Çalışmaları

Elif Tuncel Akademi · 21 Kasım 2026 · 11.30–18.00 · Marriott İstanbul Şişli · 4. Sezon

**Sunum:** `sunum.html` – dört çalışma, her biri 970×250 ve 320×480 olarak tek sayfada (bannerlar gömülü, dosya tek başına açılır; en üstte "Bu Çalışmalar Splash Digital'e Aittir." ve ajans logosu).

| # | Çalışma | Etkileşim | Klasör |
|---|---|---|---|
| 1 | **Işığınızı ne besler?** | Beslenme / Zihin / Beden / Cilt'ten birini seçer; ışık rengi ve oturum mesajı değişir | `dist/c1-isik-testi/` |
| 2 | **Birlikte nefes alalım** | Portre dairesine basılı tutar; nefes aldıkça halka dolar, nefes verince ışık saçılır ve slogan + CTA açılır | `dist/c2-nefes/` |
| 3 | **Kazıyın, ışığınızı ortaya çıkarın** | Altın ışıltılı kazı kartını fareyle/parmakla kazır; altından Elif Tuncel, tarih/mekân ve CTA çıkar | `dist/c3-kazi/` |
| 4 | **Işığınızı açın** | Loş sahnede güneş tutamaklı kaydırıcıyı sürükler; sahne aydınlanır, portre renklenir, dört alan sırayla yanar; kalan gün sayısı canlı | `dist/c4-isigi-ac/` |

Her klasörde `970x250/index.html` ve `320x480/index.html`; yüklemeye hazır paketler `dist/zip/c<N>-<konsept>-<boyut>.zip`.

## Ortak özellikler

- **Etkileşim yoksa** her banner kendi akışını otomatik oynatır ve CTA'lı kapanış karesinde durur; döngüsel animasyonlar 30 sn'de durur (Google Ads / IAB).
- **Trafik kalitesi:** çıkış bağlantısı yapılan etkileşimi UTM'e yazar: `utm_content=<konsept>_<boyut>_<durum>` (ör. `isik-testi_970x250_zihin`, `kazi_320x480_kazi-otomatik`). GA4'te hangi kreatif/etkileşimin kayıt getirdiği ayrışır.
- `window.clickTag` (Google Ads / CM360) ve `Enabler.exit` / `Enabler.counter` (Studio / DV360) desteklenir; ikisi yoksa UTM'li program sayfası açılır. Kontroller (seçim, kazıma, kaydırma, basılı tutma) reklam çıkışını tetiklemez.
- Tek dosya, satır içi CSS/JS, görseller gömülü: 49–58 KB (150 KB sınırının altında). Klavye erişimi ve `prefers-reduced-motion` desteklenir.
- Görseller resmi afişten (`assets/source/afis.webp`): Elif Tuncel portresi, şampanya ışıltılı fon, "E" logosu. Fontlar: Cinzel, Cormorant Garamond, Montserrat (Google Fonts).

## Düzenleme

- Metinler, süreler, renkler, URL: `src/data.js` (Çalışma 2–4'e özel metinler `concepts` altında).
- Ortak tasarım / tıklama altyapısı: `src/common.js`; her çalışma: `src/concepts/c<N>-*.js`.
- **Ajans logosu:** gerçek logoyu `assets/splash-digital-logo.svg` (veya `.png` / `.webp`) olarak ekleyip `node build.js` çalıştırın; şu an yer tutucu `assets/splash-digital-logo.placeholder.svg` kullanılıyor.

```bash
node build.js                               # dist/ + zip + sunum.html
NODE_PATH=$(npm root -g) node capture.js    # (isteğe bağlı) screens/ ekran görüntüleri + etkileşim/tıklama testi (Playwright)
```

> Not: Alan açıklamaları brief'teki temalardan yazıldı; eliftuncel.com bu ortamdan erişilemediği için program sayfasındaki oturum başlıklarıyla henüz eşleştirilmedi.
